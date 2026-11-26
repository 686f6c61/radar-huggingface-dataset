# MonkeyMagic100/sam3.1-mixed-int8

## Resumen

SAM 3.1 mixed INT8/FP16 es una conversión no oficial del checkpoint SAM 3.1 Multiplex de Meta, publicada por el usuario MonkeyMagic100 en Hugging Face. El modelo original es un sistema de segmentación de imágenes y vídeo con prompts (clics, cajas, máscaras o texto), y esta versión aplica una cuantización mixta INT8/FP16 orientada a reducir el espacio en disco y, secundariamente, acelerar la inferencia en Apple Silicon mediante kernels Metal personalizados.

La conversión cuantiza 487 matrices de pesos a INT8 simétrico con signo por fila de salida, cada una acompañada de un tensor de escala FP32, mientras que los 1.103 tensores restantes se mantienen en FP16. El resultado es un fichero de 957.880.192 bytes (aproximadamente 0,96 GB), frente a los 1.745.546.848 bytes del checkpoint FP16 original, lo que supone un ahorro del 45,12 %.

Es relevante ahora porque SAM 3.1 introduce segmentación guiada por texto y seguimiento temporal en vídeo, y este artefacto demuestra una vía de compresión práctica para desplegar el modelo en hardware de consumo Apple. No obstante, se trata de un experimento con validación limitada, formato propietario y licencia SAM, por lo que no sustituye al checkpoint oficial para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3.1 Multiplex (detector, codificador de texto y tracker temporal); detalles internos de la arquitectura no disponibles |
| Parametros totales | no disponible (el repo ocupa 1,0 GB en formato mixto INT8/FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; resolución interna de 1008x1008 y ventanas de vídeo de 48 fotogramas en las pruebas |
| Tipos de cuantizacion | INT8 simetrico con signo por fila de salida (487 matrices) + FP16 (1.103 tensores); escalas en FP32 |
| Idiomas soportados | no disponible |
| Licencia | SAM License (license_name: sam-license), condiciones de redistribucion y uso del modelo base |
| Formato de pesos | safetensors con formato mixto INT8/FP16 personalizado (no compatible con cargadores estandar de ComfyUI o Meta) |

## Arquitectura y entrenamiento

El checkpoint deriva de `sam3.1_multiplex_fp16.safetensors`, revision `7bb8374780a725b4353ed31f3a9395c9742b5621` del repositorio Comfy-Org/sam3. Incluye el detector, el codificador de texto y el tracker de SAM 3.1 Multiplex, manteniendo la resolución interna de 1008x1008 y sin reducir fotogramas ni historial temporal. No se ha reentrenado ningún componente: la conversión solo altera la representación numérica de los pesos.

La innovación técnica es el esquema de cuantización: cada matriz INT8 se reconstruye como `q.float() * scale[:, None]`, con una escala FP32 por fila de salida. Los tensores no cuantizados se conservan exactamente del origen. El autor indica que la mayor ganancia de velocidad proviene del despacho fusionado de atención con kernels Metal propios, mientras que la cuantización INT8 reduce principalmente el almacenamiento. También se cuantizan a INT8 determinadas activaciones de visión en la ruta personalizada. No hay información sobre datos de entrenamiento, número de tokens, RLHF ni DPO, ya que no se ha realizado ajuste adicional.

## Capacidades

- Segmentación de imágenes y vídeo con prompts de clic, caja, pintura o máscara.
- Segmentación guiada por texto mediante el codificador de texto incluido.
- Seguimiento temporal de objetos en vídeo (tracker SAM 3.1 Multiplex), con historial de fotogramas preservado.
- Selección de múltiples objetos y casos de selección de caras o personas (validados parcialmente por el autor).
- Inferencia en Apple Silicon mediante Python, PyTorch y Metal con kernels personalizados.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Edición de vídeo asistida por texto: el tracker y el codificador de texto permiten seleccionar y seguir personas u objetos a lo largo de un clip, generando máscaras por fotograma para composición o rotoscopia.
- Rotoscopia y matting en flujos de posproducción: las máscaras temporales con IoU superior al 99 % frente a la implementación FP16 en los casos probados sirven como base para aislar sujetos.
- Anotación semiautomática de datasets: el modelo genera máscaras iniciales a partir de clics o cajas que un humano revisa, reduciendo el coste de etiquetado en visión por computador.
- Prototipado en portátiles Apple: al ocupar menos de 1 GB y ejecutarse con Metal en un M5 Pro, permite experimentar con SAM 3.1 sin GPU dedicada ni servidores.
- Análisis de vídeo en local con requisitos de privacidad: al no requerir servicios en la nube, encaja en flujos donde el material no puede salir del dispositivo.
- Segmentación interactiva en herramientas creativas: integrable en aplicaciones de escritorio para macOS que necesiten selección por clic o texto sobre imágenes de hasta 1008x1008.
- Investigación sobre cuantización: sirve como referencia para estudiar el impacto de INT8 por fila en modelos de segmentación y comparar con el checkpoint FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor aporta únicamente mediciones locales de validación:

| Metrica | Resultado | Contexto |
|---|---|---|
| Tiempo de seleccion (3 casos, 48 fotogramas, 2 clips) | 20,09–20,24 s | Apple M5 Pro, atencion fusionada y kernels Metal personalizados |
| Tiempo de referencia | 63,74–66,43 s | Runtime FP16 actual en el mismo hardware |
| IoU de mascara umbralizada (cara) | 99,65 % | Frente a implementacion FP16 |
| IoU de mascara umbralizada (personas) | 99,96–99,97 % | Frente a implementacion FP16 |
| Reduccion de tamano | 787.666.656 bytes (45,12 %) | Frente al fichero FP16 de 1.745.546.848 bytes |

Estas cifras son medidas de concordancia limitadas, no precisión contra ground truth ni garantía de velocidad general.

## Requisitos de hardware

- VRAM/almacenamiento: el fichero pesa 957.880.192 bytes (unos 0,96 GB); la memoria en ejecución no está documentada.
- GPU validadas: Apple M5 Pro con Metal (única plataforma probada por el autor).
- GPU NVIDIA (A100, H100, RTX 4090) y otras: no validadas; el formato mixto requiere un cargador específico.
- Cabe en hardware de consumo Apple Silicon; no hay confirmación para GPUs de consumo NVIDIA.
- Despliegue: no compatible con cargadores estándar de ComfyUI o Meta; requiere una implementación que soporte el formato mixto INT8/FP16 (Python, PyTorch y Metal en la implementación probada).
- Latencia: 20,09–20,24 s para tres casos de selección de 48 fotogramas en M5 Pro; throughput no disponible.
- Formatos alternativos (GGUF, vLLM, llama.cpp, Ollama, TGI): no disponibles para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MonkeyMagic100/sam3.1-mixed-int8 | no disponible (~0,96 GB en disco) | 1008x1008, ventanas de 48 fotogramas probadas | safetensors mixto INT8/FP16 | SAM License | Hugging Face, 0 descargas |
| Comfy-Org/sam3 (checkpoint FP16 de origen) | no disponible (1,75 GB en disco) | 1008x1008, mismo tracker | safetensors FP16 | SAM License | Hugging Face |
| SAM 3.1 oficial de Meta | no disponible | no disponible | no disponible | SAM License | Distribucion oficial de Meta |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de las mediciones de concordancia del autor.

## Limitaciones y advertencias

- Conversión no oficial: no es un lanzamiento de Meta ni un checkpoint estándar de ComfyUI; el autor no garantiza soporte.
- Formato propietario: los cargadores estándar de ComfyUI o Meta no pueden consumir el fichero; se necesita una implementación que soporte exactamente este esquema mixto.
- Validación muy limitada: solo se probaron tres casos de selección de 48 fotogramas en dos clips, con caras y personas; no se validaron clips largos, múltiples objetos, prompts de clic o pintura ni salida de vídeo editado completo.
- Las métricas de IoU son medidas de concordancia con la implementación FP16, no precisión real frente a ground truth.
- La mejora de velocidad depende del despacho de atención fusionado y de kernels Metal; no se garantiza en otros chips.
- Riesgo de alucinación y sesgos: no documentados para este artefacto; al ser un modelo de segmentación, el riesgo se traslada a máscaras incorrectas en objetos ambiguos u oclusiones.
- Licencia SAM: impone condiciones de redistribución y uso; debe revisarse el archivo LICENSE antes de cualquier uso comercial.
- Sin información sobre idiomas soportados, sesgos demográficos ni robustez en dominios distintos a los probados.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni informes independientes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MonkeyMagic100/sam3.1-mixed-int8
- Modelo base en Hugging Face: https://huggingface.co/Comfy-Org/sam3/tree/7bb8374780a725b4353ed31f3a9395c9742b5621
- Manifiesto de integridad: https://huggingface.co/MonkeyMagic100/sam3.1-mixed-int8/blob/main/manifest.json
- Licencia SAM: https://huggingface.co/MonkeyMagic100/sam3.1-mixed-int8/blob/main/LICENSE
- Paper, blog o demo oficial de SAM 3.1: no disponible en la información proporcionada.
