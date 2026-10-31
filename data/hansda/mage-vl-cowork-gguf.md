# Hansda/Mage-VL-Cowork-GGUF

## Resumen

Mage-VL-Cowork-GGUF es una colección de cuantizaciones GGUF, creadas por el usuario Hansda, del modelo de visión y lenguaje **Mage-VL-Cowork** desarrollado por Microsoft. El modelo original combina un backbone de texto Qwen3-4B-Instruct-2507 con un codificador visual propio llamado Mage-ViT, y está entrenado específicamente para tareas de *computer use*: interpretar capturas de pantalla y proponer acciones concretas (clics, comandos bash, etc.) sobre una interfaz.

El problema que resuelve es doble: por un lado, permite ejecutar un modelo de agente de computadora de unos 4.400 millones de parámetros en hardware de consumo gracias a la cuantización (desde 1,80 GB en Q2_K hasta 4,69 GB en Q8_0); por otro, mantiene el contrato de entrenamiento original del modelo, con salidas estructuradas de razonamiento, resúmenes `Action:` y llamadas a herramientas `<tool_call>`.

Su relevancia actual radica en la tendencia de los agentes que operan interfaces gráficas de forma autónoma. Cabe destacar una limitación importante: la inferencia con imágenes requiere un *fork* experimental de llama.cpp con soporte para la arquitectura `llava_onevision2`/Mage-ViT (PR #26796 de llama.cpp, aún sin fusionar), por lo que las versiones estándar de llama.cpp, Ollama y LM Studio no están validadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: backbone de texto Qwen3-4B-Instruct-2507 + codificador visual Mage-ViT (proyector `llava_onevision2`) |
| Parametros totales | 4.411.424.256 (≈4,41 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 32.768 tokens (ventana activa validada; la configuración anuncia 262.144 posiciones, no validadas) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q6_K, Q8_0 (descodificador); Q8_0 compartido para codificador visual y proyector (mmproj) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversion de terceros desde safetensors del modelo original) |

## Arquitectura y entrenamiento

El modelo base, `microsoft/Mage-VL-Cowork` (revisión `6fbe7f91da477c1c73790dbb1f08d001b8626be1`), emplea como componente textual Qwen3-4B-Instruct-2507, un transformador denso de 36 capas con 32 cabezas de consulta y 8 cabezas KV (GQA). El componente visual es un codificador Mage-ViT propio de Microsoft, con tamaño de parche 16 y tamaño de fusión espacial 2, conservando la normalización y codificación posicional originales. No es una arquitectura Qwen3-VL estándar, lo que explica la necesidad de un runtime específico.

Los detalles del entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. Sí se indica que el modelo fue entrenado con un contrato de *computer use* que incluye las herramientas `computer_use` y `bash`, con razonamiento intermedio, resúmenes `Action:` y salida en formato `<tool_call>`, y que debe usarse con el *system prompt* original suministrado en `MAGE_HYBRID_SYSTEM_PROMPT.txt`.

La conversión a GGUF se realiza con el script `convert_mage.py`, que exporta los tensores de texto Qwen3 y los tensores visuales Mage-ViT sin modificar el checkpoint original. El codificador visual y el proyector se comparten en un único archivo `mmproj` en Q8_0 para todas las variantes.

## Capacidades

- **Comprensión de capturas de pantalla**: interpreta imágenes de interfaz (pipeline image-text-to-text) para tareas de uso de computadora.
- **Propuesta de acciones**: genera propuestas de acción sobre la interfaz (clics, escritura, comandos) que un *harness* externo debe ejecutar y devolver el resultado (nueva captura o salida de terminal).
- **Tool calling entrenado**: contrato de herramientas `computer_use` y `bash`, con salida estructurada en `<tool_call>`.
- **Razonamiento intermedio**: produce razonamiento y resúmenes `Action:` antes de la acción final.
- **Conversación multimodal**: soporte de diálogo imagen-texto con plantilla de chat multimodal original (alias `mage_original`) o la alternativa oficial de Qwen3-4B-Instruct-2507 (`qwen_instruct`).
- **Contexto largo**: ventana activa de 32.768 tokens para conversaciones multi-turno con imágenes.
- **Capacidades no validadas en GGUF**: atención multi-fotograma de vídeo y streaming nativo de códecs no están validados en este runtime experimental; para esos flujos se recomienda el checkpoint original en Transformers/SGLang.

## Casos de uso

- **Agentes de automatización de escritorio**: el modelo recibe capturas de pantalla periódicas y propone acciones (clic, teclado) que un orquestador ejecuta, formando un bucle de agente de *computer use* sobre aplicaciones de escritorio o web.
- **Relleno automático de formularios y gestiones administrativas**: dada una captura de un formulario, el modelo identifica campos y propone la secuencia de acciones para completarlos.
- **Testing de interfaces gráficas**: integración en pipelines de QA para navegar una aplicación siguiendo instrucciones en lenguaje natural y detectar fallos de usabilidad o errores visuales.
- **Ejecución de tareas por terminal**: mediante la herramienta `bash` entrenada, el modelo puede proponer comandos de shell para tareas de administración de sistemas supervisadas.
- **Asistentes locales de productividad con visión**: ejecución 100 % local en un portátil con GPU de consumo (Q4_K_M ocupa 2,72 GB), útil cuando los datos en pantalla no pueden salir a la nube.
- **Prototipado de harnesses de agentes**: el formato de salida estructurado (`<tool_call>`, `Action:`) facilita construir bucles agénticos multi-paso donde el modelo propone y el runtime ejecuta y devuelve observaciones.
- **Investigación en grounding visual**: el codificador Mage-ViT con parche 16 y fusión espacial 2 permite estudiar el anclaje de coordenadas en pantallas con un modelo pequeño y modificable.

## Benchmarks y rendimiento

Los benchmarks del modelo original (incluido OSWorld, mencionado en la model card de origen) describen el checkpoint de Microsoft y **no han sido reevaluados para estas cuantizaciones**. No se han publicado resultados de benchmarks en la información disponible para este repositorio GGUF.

## Requisitos de hardware

- **VRAM estimada para el descodificador** (sin contar el mmproj de 0,35 GB ni el KV cache):
  - Q2_K: 1,80 GB
  - Q3_K_M: 2,24 GB
  - Q4_K_M: 2,72 GB
  - Q6_K: 3,63 GB
  - Q8_0: 4,69 GB
- **Con el mmproj y contexto de 32.768 tokens**, un presupuesto realista es de 4-8 GB de VRAM según variante; la variante Q4_K_M con visión cabe cómodamente en GPUs de consumo como una RTX 3060 de 12 GB o una RTX 4060 Ti de 8 GB (parcialmente en RAM si es necesario).
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA (compilar con `-DGGML_CUDA=ON`); también ejecutable en CPU puro gracias a llama.cpp, con menor velocidad.
- **Cabe en consumer GPU**: sí, todas las variantes caben en GPUs de gama media; incluso en equipos sin GPU discreta en las cuantizaciones más agresivas.
- **Despliegue**: únicamente mediante el fork experimental [llama.cpp-locateanything-magevl](https://github.com/ch686/llama.cpp-locateanything-magevl) (commit `e07bdc8c8ef311561ab806e48792afb5d30b8054`), con los binarios `llama-mtmd-cli` y `llama-server`. **No validado** en llama.cpp estándar, Ollama ni LM Studio. El soporte upstream (PR #26796) está sin fusionar.
- **Parámetros de inferencia sugeridos** en la documentación: `--temp 0.7 --top-p 0.8`, contexto `-c 32768`, hasta `-n 4096` tokens de salida.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Mage-VL-Cowork-GGUF (este) | 4,41 B | 32.768 (validado) | Apache 2.0 | Computer use + vision | Sí (Q2_K a Q8_0), runtime experimental propio |
| Qwen3-VL-4B (familia de referencia) | ≈4 B | Hasta 262 K (según variante) | Apache 2.0 | Vision-language generalista | Sí, soportado en llama.cpp estándar |
| UI-TARS (ByteDance, familia 2B-7B) | 2-7 B según variante | No disponible | No disponible | Computer use / GUI grounding | Sí, conversiones comunitarias |

Nota: la comparativa con Qwen3-VL es relevante porque Mage-VL-Cowork usa Qwen3-4B-Instruct-2507 como backbone textual, pero la arquitectura visual difiere y requiere runtime específico. Los datos de UI-TARS se ofrecen a título orientativo; no hay benchmarks comparativos publicados en la información disponible.

## Limitaciones y advertencias

- **Runtime experimental obligatorio**: el soporte de la arquitectura Mage-ViT (`llava_onevision2`) proviene de un PR sin fusionar en llama.cpp y de un fork de terceros con commit fijo; puede romperse o cambiar sin aviso.
- **Incompatibilidad con herramientas habituales**: Ollama, LM Studio y llama.cpp estándar no están validados para este proyecto.
- **Benchmarks no reproducidos**: las puntuaciones de OSWorld y otros benchmarks corresponden al checkpoint original de Microsoft; el rendimiento de las cuantizaciones no ha sido medido, y variantes agresivas (Q2_K, Q3_K_M) degradan la fiabilidad de las llamadas a herramientas según advierte el propio autor.
- **Ventana de contexto**: solo los 32.768 tokens están validados; los 262.144 anunciados por la configuración no lo están.
- **Vídeo no soportado en GGUF**: la atención multi-fotograma y el streaming de códecs requieren el checkpoint original en Transformers/SGLang.
- **El modelo no ejecuta acciones**: solo propone acciones; la aplicación o harness debe ejecutarlas y devolver observaciones. Usarlo sin supervisión sobre sistemas productivos conlleva riesgo de acciones incorrectas.
- **Idioma**: el modelo está etiquetado solo para inglés; no hay garantías de rendimiento en castellano.
- **Riesgo de alucinación**: no disponible información específica; como en todo VLM pequeño, las coordenadas y lecturas de pantalla pueden ser erróneas, especialmente en cuantizaciones bajas.
- **Sesgos conocidos**: no disponible.
- **Licencia**: Apache 2.0, sin restricciones para uso comercial; la conversión es de un tercero (Hansda), no de Microsoft.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Hansda/Mage-VL-Cowork-GGUF
- Modelo original de Microsoft: https://huggingface.co/microsoft/Mage-VL-Cowork
- Licencia Apache 2.0 del repositorio: https://huggingface.co/Hansda/Mage-VL-Cowork-GGUF/blob/main/LICENSE
- Fork de llama.cpp compatible: https://github.com/ch686/llama.cpp-locateanything-magevl
- PR de soporte upstream en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26796
- Paper, blog oficial o demo: no disponible
