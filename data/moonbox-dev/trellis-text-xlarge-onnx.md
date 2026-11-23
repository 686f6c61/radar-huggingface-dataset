# moonbox-dev/TRELLIS-text-xlarge-ONNX

## Resumen

TRELLIS-text-xlarge-ONNX es una exportación a formato ONNX del modelo TRELLIS de generación de mallas 3D a partir de texto, desarrollado originalmente por Microsoft Research. La conversión la firma moonbox-dev con el objetivo declarado de habilitar la inferencia en dispositivos mediante ONNX Runtime, cubriendo CPU, CUDA y DirectML. El modelo resuelve el problema de convertir una descripción textual en una representación 3D explícita (malla poligonal) utilizable en motores gráficos, pipelines de renderizado o impresión 3D.

El modelo base, microsoft/TRELLIS-text-xlarge, emplea una arquitectura de flow matching sobre vóxeles dispersos (sparse voxels) para generar un campo latente estructurado (SLAT) que después se decodifica a malla mediante FlexiCubes. Esta exportación conserva esa arquitectura pero la descompone en varios grafos ONNX independientes: codificador de texto CLIP, el flujo de muestreo SLAT y el decodificador de malla.

La relevancia de esta ficha radica en que es una de las pocas distribuciones ONNX de un modelo text-to-3D de esta familia, lo que facilita su integración en aplicaciones de escritorio, herramientas DCC o entornos sin PyTorch. El repositorio ocupa 7,2 GB y se distribuye con licencia MIT, aunque incorpora componentes con licencias propias (CLIP y FlexiCubes) que conviene revisar por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching sobre vóxeles dispersos (SLAT) + decodificador de malla FlexiCubes, con codificador de texto CLIP |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el prompt de texto se procesa con CLIP; no se especifica límite de tokens) |
| Tipos de cuantizacion | fp16 (única precisión publicada en el repositorio) |
| Idiomas soportados | no disponible (el codificador CLIP determina el soporte; no se detalla en la model card) |
| Licencia | MIT (con licencias adicionales para CLIP y FlexiCubes incluidas en el repo) |
| Formato de pesos | ONNX (grafos `.onnx` con archivos `.onnx.data` externos, más `flexicubes_tables.npz` y `pipeline.py`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TRELLIS original: un codificador de texto CLIP que condiciona un proceso de flow matching que opera sobre una representación latente de vóxeles dispersos (SLAT, *sparse latent*). El muestreo genera esa estructura latente y un decodificador basado en FlexiCubes la convierte en una malla poligonal con topología explícita. La exportación ONNX separa el pipeline en grafos: `clip.onnx` (codificador de texto), `slat_flow.onnx` (flujo de muestreo), `mesh_dec.onnx` (decodificador de malla) y `ss_dec.onnx`, coordinados por `pipeline.py`, que gestiona el preprocesado, el bucle de muestreo y la extracción de malla.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que la model card de esta exportación no los incluye y remite al modelo base de Microsoft. La innovación técnica destacable es la propia exportación a ONNX Runtime con precisión fp16, que permite ejecutar el pipeline completo sin PyTorch en CPU, CUDA y DirectML, algo poco habitual en modelos text-to-3D de esta complejidad.

## Capacidades

- Generación de mallas 3D a partir de descripciones textuales (text-to-3D), con salida en formato de malla poligonal.
- Pipeline completo en ONNX Runtime: codificación de texto, muestreo por flow matching y decodificación de malla.
- Ejecución en CPU, CUDA y DirectML, lo que permite desplegar en equipos sin GPU dedicada o en GPUs de consumo.
- Inferencia determinista respecto al ruido inicial: la model card reporta comparaciones *teacher forced* frente al modelo PyTorch original con el mismo ruido de partida.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento; es un modelo especializado exclusivamente en text-to-3D.

## Casos de uso

- Generación de assets 3D para prototipado rápido: un estudio puede describir un objeto con texto y obtener una malla base para retocar en Blender o Maya, gracias a la salida directa en malla poligonal.
- Integración en herramientas DCC de escritorio: al ejecutarse con ONNX Runtime en CPU o DirectML, el modelo puede empaquetarse dentro de un plugin sin depender de PyTorch ni de CUDA propietario.
- Creación de contenido para videojuegos: generación de props y decorados simples a partir de descripciones, con tiempos de aproximadamente 65 segundos por malla en CUDA según la model card.
- Pipelines de impresión 3D bajo demanda: conversión de una descripción textual en una malla lista para laminado, útil en servicios de fabricación personalizada.
- Entornos con hardware limitado: al soportar CPU y DirectML, puede desplegarse en estaciones de trabajo Windows sin GPU NVIDIA, algo relevante para estudios pequeños.
- Investigación en generación 3D: la disponibilidad en ONNX facilita la experimentación y la comparación con el modelo PyTorch original usando el mismo ruido inicial, según los benchmarks incluidos.

## Benchmarks y rendimiento

La model card incluye comparaciones frente al modelo PyTorch original con el mismo ruido de partida, en modo *teacher forced* y de extremo a extremo. Los valores se presentan como tripletas sin especificar a qué métrica o conjunto corresponde cada posición; se reproducen tal cual:

| Metrica | Resultado reportado |
|---|---|
| Voxel IoU (teacher forced) | 0.9997 / 1.000 / 0.989 (suelo 0.141 / 1.000 / 0.994) |
| Latent SNR (teacher forced) | 60.6 / 59.4 / 58.8 dB (suelo 58.5 / 56.2 / 52.9) |
| Mesh F-score@0.005 (teacher forced) | 0.9998 / 0.9995 / 0.977 (suelo equivalente) |
| Rendimiento end-to-end | 0.989 / 0.9996 / 0.900 |
| Tiempo por malla (CUDA) | ~65 s desde el lanzamiento (original ~25 s de inferencia) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo text-to-3D.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 7,2 GB en fp16, por lo que se requiere al menos esa cantidad de memoria o de RAM para cargar los grafos completos.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona ejecución en CUDA y DirectML, lo que abarca GPUs NVIDIA y GPUs compatibles con DirectX 12.
- Cabe en GPU de consumo: probablemente sí en GPUs con 8-12 GB de VRAM, dado el tamaño del repo en fp16, aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) mediante el `pipeline.py` incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: aproximadamente 65 segundos por malla en CUDA desde el lanzamiento, frente a unos 25 segundos de inferencia del modelo PyTorch original según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TRELLIS-text-xlarge-ONNX (este) | no disponible | no disponible | MIT | ONNX (fp16) | Exportación para ONNX Runtime; ~65 s por malla en CUDA |
| microsoft/TRELLIS-text-xlarge | no disponible | no disponible | no disponible en esta ficha | PyTorch | Modelo original; ~25 s de inferencia por malla según la model card |
| Otros modelos text-to-3D (p. ej. Shap-E, TripoSR) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría; la información proporcionada solo permite comparar esta exportación con su modelo base.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al ser un generador 3D condicionado por texto, puede reproducir sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación geométrica: como todo modelo generativo 3D, puede producir mallas con topología incorrecta, geometría flotante o partes no cerradas.
- El rendimiento en ONNX es más lento que el original en PyTorch (~65 s frente a ~25 s por malla en CUDA), lo que puede ser limitante en producción de alto volumen.
- La licencia MIT del repositorio convive con licencias adicionales para CLIP y FlexiCubes incluidas en el propio repo; es necesario revisarlas antes de uso comercial.
- No se especifican los idiomas soportados por el codificador de texto; el rendimiento multilingüe es incierto.
- Solo se publica precisión fp16; no hay variantes cuantizadas a int8 o menores que reduzcan aún más los requisitos de memoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/TRELLIS-text-xlarge-ONNX
- Modelo base: https://huggingface.co/microsoft/TRELLIS-text-xlarge
- Paper referenciado (arXiv:2412.01506): https://arxiv.org/abs/2412.01506
- Licencia CLIP incluida en el repo: https://huggingface.co/moonbox-dev/TRELLIS-text-xlarge-ONNX/blob/main/fp16/LICENSE-CLIP.txt
- Licencia FlexiCubes incluida en el repo: https://huggingface.co/moonbox-dev/TRELLIS-text-xlarge-ONNX/blob/main/fp16/LICENSE-FlexiCubes.txt
- Licencia TRELLIS incluida en el repo: https://huggingface.co/moonbox-dev/TRELLIS-text-xlarge-ONNX/blob/main/fp16/LICENSE-TRELLIS.txt
