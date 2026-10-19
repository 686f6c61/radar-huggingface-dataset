# florianvoss/Qwen3-VL-2B-Instruct-GPTQ-a16w4

## Resumen

`florianvoss/Qwen3-VL-2B-Instruct-GPTQ-a16w4` es un paquete compilado del modelo vision-lenguaje Qwen3-VL-2B-Instruct, empaquetado para ejecutarse sobre el SoC de borde SiMa Modalix mediante el runtime LLiMa. No se distribuye como pesos estándar de PyTorch o safetensors listos para `transformers`, sino como un artefacto de despliegue con 171 ejecutables ELF, assets de runtime en `devkit/` y los scripts de compilación que documentan el proceso. Forma parte de la colección Neat 0.6.0 del mismo autor.

El modelo subyacente es la variante Instruct de 2 000 millones de parámetros de la familia Qwen3-VL, cuantizada previamente con GPTQ en formato a16w4 (pesos de 4 bits, activaciones de 16 bits) por sima-ai, y después compilada de forma nativa con ModelGraph para el acelerador. El paquete fija una ventana de contexto máxima de 4 096 tokens y una resolución de imagen de 448 × 448 píxeles, ambas seleccionadas en tiempo de compilación.

Su relevancia es acotada pero específica: demuestra el flujo completo de compilación y despliegue de un VLM cuantizado en hardware de inferencia de borde no basado en CUDA. Es un artefacto de interés para ingenieros que trabajen con Modalix o con la cadena de herramientas de SiMa, no para quien busque un checkpoint reutilizable en GPU. El autor advierte explícitamente que no se han realizado mediciones de precisión ni de rendimiento en runtime, y el repositorio registra cero descargas y cero valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (vision encoder + decodificador transformer denso); paquete compilado con ModelGraph para SiMa Modalix |
| Parametros totales | 2B (modelo base Qwen3-VL-2B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4 096 tokens (fijada en compilacion; `prefill group size` 128) |
| Tipos de cuantizacion | GPTQ a16w4: pesos INT4 con grupos de cuantizacion, activaciones BF16, embeddings y cache KV en INT8; excepciones de precision mixta preservadas del origen |
| Idiomas soportados | no disponible (no documentado en la model card) |
| Licencia | apache-2.0 (se aplican los terminos del modelo base) |
| Formato de pesos | artefacto compilado para LLiMa: 171 ejecutables ELF + `devkit/`; no es safetensors ni GGUF |
| Resolucion de imagen | 448 × 448 |
| Tamano del repositorio | 3,1 GB |
| Libreria / runtime | `llima` (runtime LLiMa sobre SiMa Modalix) |
| Hardware objetivo | SiMa Modalix (acelerador de borde, no CUDA) |
| Inferencia en `transformers` | no (`inference: false` en la model card) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Qwen3-VL-2B-Instruct: un codificador visual acoplado a un decodificador transformer denso de aproximadamente 2 000 millones de parámetros, entrenado por el equipo Qwen de Alibaba. La model card de este repositorio no documenta el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO); esa información corresponde al modelo original y no se reproduce aquí.

La contribución técnica de este paquete es la cadena de compilación, no el entrenamiento. El flujo parte del checkpoint precuantizado `simaai/Qwen3-VL-2B-Instruct-GPTQ-Safetensors`, conserva los tamaños de grupo y las excepciones de precisión mixta, y genera un grafo nativo mediante ModelGraph con 16 procesos paralelos, cada uno con su propio hilo de simulador. Se aplica `filter sharing` por defecto en los componentes de lenguaje y se mantienen activaciones en BF16 junto con embeddings y caché KV en INT8. El contexto máximo y las resoluciones de imagen admitidas se eligen durante la compilación, lo que explica el límite de 4 096 tokens y los 448 × 448 px del artefacto final. Las revisiones exactas del código fuente y del compilador quedan registradas en `compilation.json`, y `compile.sh` documenta la descarga del origen y todos los argumentos empleados.

## Capacidades

- Generación de texto condicionada por imagen, con pipeline `image-text-to-text`.
- Descripción de imágenes, respuesta a preguntas visuales (VQA) y razonamiento sobre contenido gráfico, heredado del modelo Qwen3-VL-2B-Instruct.
- Procesamiento de documentos y escenas a resolución fija de 448 × 448 píxeles.
- Modo instructivo: sigue instrucciones en formato conversacional de un turno o varios, dentro del límite de 4 096 tokens.
- Capacidades multilingües: no documentadas en este paquete; deben verificarse contra la ficha del modelo base.
- Tool calling / function calling: no documentado en la información disponible para este artefacto compilado.
- Capacidades de agente y razonamiento multi-paso: no documentadas; un VLM de 2B cuantizado a 4 bits presenta margen limitado para cadenas de herramientas largas.
- Capacidades de audio o vídeo: no disponibles en esta compilación (la entrada se limita a imagen y texto a 448 × 448).

## Casos de uso

- Inspección visual en línea de producción: el modelo puede clasificar y describir defectos en piezas a partir de capturas de 448 × 448 px, ejecutándose íntegramente en el SoC Modalix dentro de la propia célula de fabricación, sin enviar imágenes a la nube.
- Analítica de lineal de retail: conteo y descripción de estanterías u obstáculos a partir de fotogramas fijos, con la ventaja de que el paquete ya está compilado para el acelerador de borde que suele instalarse en tienda.
- Lectura asistida de documentos en dispositivo: extracción de campos de albaranes, etiquetas o formularios escaneados en un Terminal de punto de atención, manteniendo los datos del cliente en local por requisitos de cumplimiento.
- Asistencia a personas con discapacidad visual: descripción de escenas capturadas por una cámara portátil, con latencia baja al no requerir round-trip de red y con un consumo energético propio de hardware de borde.
- Robótica móvil y AGV: interpretación de la escena inmediata para tareas de navegación asistida o verificación de estado de carga, aprovechando la integración con el runtime LLiMa sobre Modalix.
- Señalización digital interactiva: atención a usuarios que muestran un objeto o documento ante una pantalla, con contexto de 4 096 tokens suficiente para interacciones cortas y con inferencia local que evita costes recurrentes de API.
- Validación de la cadena de herramientas SiMa: servir como referencia reproducible para equipos que necesiten compilar sus propios VLM cuantizados con ModelGraph, usando `compile.sh` y `compilation.json` como plantilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de precisión y rendimiento en runtime sobre Modalix no forman parte del proceso de validación de esta cola de publicación; únicamente se confirma que la compilación completa y el despliegue local finalizaron correctamente y que los ficheros subidos se verificaron por checksum.

## Requisitos de hardware

- Hardware objetivo: SiMa Modalix con un runtime LLiMa compatible. El paquete no está pensado para GPU NVIDIA, AMD ni para CPU genérica.
- VRAM equivalente: no aplica. Los pesos INT4 de un modelo de 2B ocupan aproximadamente 1,1–1,4 GB, a los que se suman embeddings en INT8, caché KV en INT8 para 4 096 tokens y el codificador visual; el repositorio completo pesa 3,1 GB, incluyendo 171 ejecutables ELF y assets de runtime. La memoria del SoC requerida no está documentada.
- GPU de consumo (RTX 4090, etc.): no soportadas por este artefacto. Para esos entornos debe usarse el checkpoint original Qwen3-VL-2B-Instruct o la versión GPTQ en safetensors de sima-ai.
- Opciones de despliegue: exclusivamente `llima run ./Qwen3-VL-2B-Instruct-GPTQ-a16w4` sobre Modalix; la descarga se realiza con `hf download`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Dependen del SoC, del reloj y del runtime LLiMa, y no han sido medidos por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| florianvoss/Qwen3-VL-2B-Instruct-GPTQ-a16w4 | 2B | 4 096 tokens | ELF compilado (LLiMa) | SiMa Modalix | apache-2.0 | Publico, 0 descargas |
| simaai/Qwen3-VL-2B-Instruct-GPTQ-Safetensors (origen) | 2B | no disponible en la informacion | safetensors GPTQ | GPU / estandar | apache-2.0 | Publico |
| Qwen3-VL-2B-Instruct (modelo original de Qwen) | 2B | no disponible en la informacion (la familia Qwen3-VL documenta ventanas mucho mayores, no verificadas aqui) | safetensors BF16 | GPU / CPU | apache-2.0 | Publico |
| SmolVLM2-2.2B-Instruct (alternativa de tamano similar) | 2,2B | no disponible en la informacion | safetensors, GGUF | GPU / CPU / borde | apache-2.0 | Publico |

La comparación relevante no es de calidad, sino de portabilidad: frente a los checkpoints en safetensors, este paquete gana en ajuste al hardware (grafo nativo, cuantización mixta verificada) y pierde toda la flexibilidad de despliegue, además de recortar el contexto a 4 096 tokens.

## Limitaciones y advertencias

- No es un checkpoint reutilizable: `inference: false` y pesos en formato ELF para Modalix. No puede cargarse con `transformers`, vLLM ni llama.cpp.
- Sin validación de precisión: el autor no ha medido accuracy ni rendimiento en runtime. La compilación correcta no garantiza que la calidad de salida se mantenga tras la cuantización a4w4 y la compilación.
- Contexto recortado a 4 096 tokens y resolución fija de 448 × 448; ambas se eligen al compilar y no pueden ampliarse en tiempo de ejecución sin recompilar.
- Riesgo de alucinación: es un VLM denso de 2B parámetros con pesos de 4 bits, propenso a inventar texto en imágenes y a describir detalles ausentes, especialmente en escenas densas o documentos con tipografía pequeña.
- Sesgos: no documentados en la model card; deben evaluarse los del modelo Qwen3-VL-2B-Instruct original antes de un despliegue en producción.
- Idiomas: no especificados. No asumir cobertura multilingüe sin probarla contra el modelo base.
- Licencia: apache-2.0 en el repositorio, pero la propia model card remite a los términos del modelo base y el uso requiere un runtime y un compilador de SiMa con sus propias condiciones, que no se detallan aquí.
- Madurez: repositorio creado y actualizado el 2026-10-18 con 0 descargas y 0 likes; sin issues ni validación comunitaria. No hay garantía de mantenimiento.
- Trazabilidad: las revisiones de código fuente y compilador están en `compilation.json`, pero no se aporta ningún informe de evaluación reproducible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florianvoss/Qwen3-VL-2B-Instruct-GPTQ-a16w4
- Modelo base (GPTQ en safetensors): https://huggingface.co/simaai/Qwen3-VL-2B-Instruct-GPTQ-Safetensors
- Revision concreta del modelo base referenciada: https://huggingface.co/simaai/Qwen3-VL-2B-Instruct-GPTQ-Safetensors/tree/3f7e0edb853cd39c32ca19d08cf0dce13d40b1f1
- Coleccion Neat 0.6.0: https://huggingface.co/collections/florianvoss/neat-060
- Registro de compilacion: https://huggingface.co/florianvoss/Qwen3-VL-2B-Instruct-GPTQ-a16w4/blob/main/compilation.json
- Script de compilacion: https://huggingface.co/florianvoss/Qwen3-VL-2B-Instruct-GPTQ-a16w4/blob/main/compile.sh
