# hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7

## Resumen

El modelo `codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7` es un modelo de lenguaje causal base, de tipo Llama, entrenado sobre el corpus de código CodeParrot por el autor hanseungwook. No es un modelo ajustado para instrucciones ni para chat: se distribuye como checkpoint de preentrenamiento en su paso de optimizador 24.521, exportado desde un experimento de inicialización con autómatas celulares neuronales (NCA, *Neural Cellular Automata*) con una banda GZIP de 0,3-0,4 y semilla de preentrenamiento 2. Forma parte de una familia de experimentos del mismo autor que compara inicializaciones NCA frente a inicialización desde cero (*scratch*).

El interés del modelo es fundamentalmente de investigación: sirve para estudiar si una inicialización derivada de un proceso de autómata celular neuronal, condicionada por la compresibilidad (banda GZIP) de los patrones generados, proporciona una ventaja medible frente a la inicialización aleatoria estándar. El modelo card reporta pérdidas de validación en CodeParrot ligeramente inferiores para las variantes NCA (0,6123 y 0,6106) frente a las variantes *scratch* (0,6658 y 0,6163) en el paso 24.000, aunque el propio autor advierte que las diferencias de semilla impiden aislar el efecto de la banda GZIP.

Arquitectónicamente es un transformer denso con 1.872.857.088 parámetros totales (aproximadamente 1,61B excluyendo los embeddings de entrada y salida), 24 capas, dimensión oculta 2048, tamaño intermedio 8192, 32 cabezas de atención y de KV, y una longitud de contexto de entrenamiento de 1024 tokens. Los embeddings de entrada y la cabeza de salida, de 64.000 filas, están desacoplados (*untied*) y se conservan exactamente. El modelo se publica en safetensors FP32 sin pérdida, con verificación de exportación documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (`LlamaForCausalLM`), denso |
| Parametros totales | 1.872.857.088 (aprox. 1,61B excluyendo embeddings de entrada/salida) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible (el repo contiene pesos FP32 safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors FP32 sin pérdida (sin estado de optimizador ni scheduler); tokenizer GPT-2 |
| Capas | 24 |
| Dimension oculta | 2048 |
| Tamano intermedio | 8192 |
| Cabezas de atencion / KV | 32 / 32 |
| Vocabulario | 64.000 filas (tokenizer GPT-2 de 50.257 tokens; IDs 50.257-63.999 suprimidos en generacion) |
| Tamano del repo | 7,5 GB |
| Paso de optimizador | 24.521 |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con la configuración estándar de Llama (`LlamaForCausalLM`), sin código de modelo personalizado ni necesidad de `trust_remote_code=True`. Consta de 24 capas con dimensión oculta 2048, tamaño intermedio 8192 y 32 cabezas de atención y de KV (atención multi-cabeza clásica, no GQA). Los embeddings de entrada y la cabeza de salida tienen 64.000 filas, están desacoplados y se preservan exactamente; el tokenizer es GPT-2 (50.257 tokens), y la configuración de generación guardada suprime los IDs 50.257-63.999 para evitar tokens no decodificables, manteniendo los pesos y los logits de la pasada forward sin cambios.

El entrenamiento se realizó sobre el corpus CodeParrot con semilla 7, partiendo de una inicialización obtenida de una ejecución NCA previa: 10 colores, banda GZIP 0,3-0,4, semilla de preentrenamiento 2 y checkpoint de preentrenamiento en la época 10. El nombre de ejecución embebido es `full-codeparrot/ca-pt-10-colors-gzip-0.3-0.4-2-seed-10-epoch/7-seed`, con ID de ejecución W&B `p6mfgeys`, y el checkpoint original es `ca-pt-10-colors-gzip-0.3-0.4-1-seed-10-epoch-7-seed/gpt_model_24521.pth`. El autor advierte que los nombres de directorio copiados y etiquetas de evaluación antiguas como `nca_epoch7` / `nca_epoch8` son engañosos: 7 y 8 son semillas de la fase downstream, no épocas de preentrenamiento NCA. No se documenta el número total de tokens de entrenamiento ni el uso de RLHF o DPO; el modelo es explícitamente un modelo base sin ajuste de instrucciones.

La innovación técnica destacable es la inicialización NCA condicionada por compresibilidad: los patrones generados por el autómata celular se filtran por una banda de ratio de compresión GZIP (0,3-0,4) antes de usarse como inicialización. La exportación incluye un `conversion_report.json` que verifica igualdad exacta de logits originales frente a Transformers en longitudes de secuencia 8, 128 y 1024, igualdad de todos los tensores tras recarga, paridad del tokenizer con `tiktoken` GPT-2, coherencia entre forward con caché y completo, y una prueba de humo de generación estándar. Probado con Transformers 4.53.0 y PyTorch 2.8.0+cu128.

## Capacidades

- Generación de texto causal en inglés, orientada a continuación de código fuente.
- Modelo base de preentrenamiento: no soporta instrucciones ni conversación multi-turno de forma nativa.
- Generación de código a partir de prefijos (funciones, firmas, fragmentos incompletos), como se muestra en el ejemplo del modelo card con `def fibonacci(n):`.
- Relleno de código y continuación de patrones sintácticos aprendidos de CodeParrot.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repo; el corpus CodeParrot es fundamentalmente código, con comentarios y texto mayoritariamente en inglés.
- No dispone de modo *thinking*, visión ni audio.
- Compatible con `text-generation-inference` y `endpoints_compatible` según las etiquetas del repo.

## Casos de uso

- Investigación sobre inicialización de modelos: el caso de uso principal es reproducir y analizar el efecto de la inicialización NCA frente a *scratch* en el preentrenamiento de modelos de código, comparando las pérdidas de validación registradas en el paso 24.000 (0,6123 para esta variante frente a 0,6658 para *scratch* semilla 7).
- Estudio de compresibilidad como señal de inicialización: permite experimentar con la hipótesis de que patrones de autómata celular filtrados por banda GZIP producen representaciones iniciales más útiles para el modelado de código.
- Autocompletado de código en entornos controlados: al ser un modelo base de 1,6B con contexto de 1024 tokens, puede usarse para completar fragmentos cortos de código en herramientas internas de desarrollo, siempre con evaluación adicional.
- Generación de código sintético para aumento de datos: útil para producir continuaciones de fragmentos de código que luego se filtran y revisan antes de incorporarse a pipelines de datos.
- Reproducibilidad de experimentos de preentrenamiento: el repo incluye `training_metadata.json` y `conversion_report.json`, lo que facilita auditar la procedencia del checkpoint y verificar la equivalencia numérica tras la conversión a Transformers.
- Línea base en evaluaciones de modelos de código pequeños: sirve como referencia de 1,6B parámetros para comparar con modelos ajustados o de mayor tamaño en tareas de modelado de lenguaje sobre código.
- Docencia y formación: ejemplo didáctico de exportación de un checkpoint de investigación a `LlamaForCausalLM` con tokenizer GPT-2 y de gestión de vocabulario desacoplado.

## Benchmarks y rendimiento

El modelo card solo reporta pérdidas de validación en CodeParrot registradas durante el entrenamiento en el paso de optimizador 24.000. El autor advierte explícitamente que son métricas históricas de la ejecución y no pérdidas medidas de nuevo sobre los pesos finales exportados (paso 24.521).

| Checkpoint | Banda GZIP NCA | Mejor pérdida de validación registrada en CodeParrot |
|---|---|---:|
| NCA semilla 7 (este modelo) | 0,3-0,4 | 0,612319200089 |
| NCA semilla 8 | 0,5-1,0 | 0,610557624325 |
| Scratch semilla 7 | No aplica | 0,665801837119 |
| Scratch semilla 8 | No aplica | 0,616333815306 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 7,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 8-10 GB para secuencias de hasta 1024 tokens.
- VRAM estimada en FP16/BF16: aproximadamente 3,8 GB para pesos; en torno a 4,5-6 GB con activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2 GB para pesos; en cuantización de 4 bits, alrededor de 1-1,2 GB, aunque el repo no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para servir en FP32 con margen; RTX 4090, RTX 4080, RTX 3090 o RTX 4070 Ti para FP16/BF16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM en FP16/BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 3080 10 GB, etc.), y en FP32 en tarjetas de 12 GB o más.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"` (probado con Transformers 4.53.0 y PyTorch 2.8.0+cu128); compatible con `text-generation-inference` y endpoints compatibles según las etiquetas; vLLM y llama.cpp serían viables tras convertir los pesos, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7 (este) | 1,87B totales (1,61B sin embeddings) | 1024 | No disponible | Safetensors FP32 | Modelo base de investigación, inicialización NCA, pérdida de validación 0,6123 en paso 24.000 |
| codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8 | 1,87B totales (1,61B sin embeddings) | 1024 | No disponible | Safetensors FP32 | Misma familia, banda GZIP distinta y semilla 8; pérdida 0,6106 en paso 24.000 |
| codeparrot-llama-1.6b-scratch-seed-7 | 1,87B totales (1,61B sin embeddings) | 1024 | No disponible | Safetensors FP32 | Inicialización desde cero, semilla 7; pérdida 0,6658 en paso 24.000 |
| codeparrot-llama-1.6b-scratch-seed-8 | 1,87B totales (1,61B sin embeddings) | 1024 | No disponible | Safetensors FP32 | Inicialización desde cero, semilla 8; pérdida 0,6163 en paso 24.000 |

Las alternativas de la misma categoría (modelos de código de tamaño similar) no están documentadas en la información disponible; la comparativa se limita a las variantes de la propia familia experimental del autor.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni chat: no debe usarse directamente en aplicaciones conversacionales sin un ajuste posterior.
- Sesgos conocidos: no documentados; al entrenarse sobre CodeParrot, puede reproducir sesgos de estilo, licencias y calidad presentes en el corpus de código.
- Riesgo de alucinación: alto en un modelo base de 1,6B; puede generar APIs inexistentes, importaciones falsas o código sintácticamente plausible pero incorrecto.
- Limitación de contexto: 1024 tokens de entrenamiento, insuficiente para archivos de código grandes o conversaciones largas.
- Limitación de idioma: solo inglés según la etiqueta del repo; el rendimiento en otros idiomas no está evaluado.
- Vocabulario desacoplado: el tokenizer GPT-2 define 50.257 tokens, pero el modelo conserva 64.000 filas de embedding; si se reemplaza `generation_config` o se implementa un bucle de muestreo propio, es obligatorio preservar la supresión de los IDs 50.257-63.999 para evitar tokens no decodificables.
- Relleno (*padding*): usa el token EOS de GPT-2 (50256); es necesario proporcionar una máscara de atención en lotes con relleno.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Métricas no verificadas sobre los pesos finales: las pérdidas reportadas corresponden al paso 24.000 y no a los pesos exportados en el paso 24.521.
- Nombres de directorio y etiquetas engañosos: el propio autor advierte que etiquetas como `nca_epoch7` / `nca_epoch8` no indican épocas de preentrenamiento NCA, y que el directorio de semilla 8 copiado contiene por error la banda GZIP 0,3-0,4 cuando su nombre de ejecución embebido registra 0,5-1,0.
- Sin descargas ni validación comunitaria: el repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7
- Metadatos de entrenamiento: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7/blob/main/training_metadata.json
- Informe de conversión: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7/blob/main/conversion_report.json
- Variante NCA semilla 8 (banda 0,5-1,0): https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8
- Variante scratch semilla 7: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-7
- Variante scratch semilla 8: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-8
- Modelo de la familia de referencia (FineWeb-Edu Llama 1.6B from NCA): https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-nca
