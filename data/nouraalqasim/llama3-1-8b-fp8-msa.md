# NouraAlqasim/llama3.1-8b-fp8-msa

## Resumen

El modelo `NouraAlqasim/llama3.1-8b-fp8-msa` es una versión cuantizada en precisión FP8 (W8A8) del modelo `meta-llama/Llama-3.1-8B-Instruct`, desarrollada por el usuario NouraAlqasim mediante la herramienta NVIDIA ModelOpt. La particularidad de esta variante reside en que las escalas estáticas de activación se han calibrado exclusivamente sobre diálogos en árabe estándar moderno (MSA), lo que la hace especialmente adecuada para tareas de generación y razonamiento en esta lengua, aunque el modelo base conserva sus capacidades multilingües originales.

El objetivo principal de esta cuantización es reducir el consumo de memoria y acelerar la inferencia en hardware compatible con FP8, manteniendo una degradación mínima de la calidad. El modelo base es un transformer decoder-only de 8.030 millones de parámetros con una ventana de contexto de 128.000 tokens, y esta versión cuantizada conserva esas características estructurales. No es cargable mediante `transformers` estándar; requiere el uso de `vLLM` con la opción `--quantization modelopt`.

La relevancia de este modelo radica en su enfoque de calibración específica para árabe, un área con menos recursos que el inglés, y en su formato FP8, que permite desplegar modelos de 8B en GPUs con soporte para esta precisión (por ejemplo, H100 o RTX 4090) con menor huella de memoria y mayor throughput.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | FP8 (W8A8) mediante NVIDIA ModelOpt (`FP8_DEFAULT_CFG`) |
| Idiomas soportados | Multilingüe (heredado del modelo base); calibrado específicamente para árabe estándar moderno |
| Licencia | no disponible (el modelo base usa Llama 3.1 Community License, pero esta variante no la declara) |
| Formato de pesos | safetensors (con `config.json` que declara `quantization: modelopt`) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint `meta-llama/Llama-3.1-8B-Instruct`, que a su vez es un transformer decoder-only con 32 capas, atención multi-cabeza con GQA y 8.030 millones de parámetros. No se ha realizado ningún fine-tuning adicional; el proceso consiste en convertir los pesos de float16 a FP8 (W8A8) utilizando la configuración `FP8_DEFAULT_CFG` de NVIDIA ModelOpt.

La innovación técnica de esta variante está en la calibración de las escalas de activación estáticas (`input_scale`). Mientras que las escalas de pesos FP8 se calculan de forma data-free, las escalas de activación se determinan mediante 128 diálogos en árabe estándar moderno extraídos del dataset `Almheiri/ArabCulture-Dialogue` (revisión `9acd60cbbb4f`, seed 1448), con un máximo de 512 tokens por muestra. Se calibraron los 224 cuantizadores de activación. El error cuadrático medio (MSE) de los pesos es de 1.786e-07, lo que indica una pérdida de precisión muy baja. Esta calibración específica hace que las escalas de activación estén optimizadas para distribuciones de texto en árabe, lo que puede mejorar la fidelidad de la salida en ese idioma en comparación con una calibración genérica.

## Capacidades

Las capacidades del modelo son las heredadas del modelo base `Llama-3.1-8B-Instruct`, ya que la cuantización no altera el comportamiento funcional salvo en la precisión numérica:

- Generación de texto en múltiples idiomas, con especial énfasis en árabe estándar moderno gracias a la calibración de activaciones.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos.
- Generación de código en varios lenguajes de programación.
- Soporte de tool calling y function calling, permitiendo integración con APIs y agentes.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Ventana de contexto de 128.000 tokens, adecuada para documentos largos y razonamiento multi-paso.
- Soporte de modos de razonamiento extendido (thinking mode) si se activa mediante prompts apropiados, aunque no es una característica específica de esta variante.

## Casos de uso

- Atención al cliente automatizada en árabe: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 128.000 tokens, y la calibración en MSA mejora la naturalidad de las respuestas en ese idioma.
- Traducción automática y post-edición: su capacidad multilingüe y el calibrado en árabe lo hacen útil para traducir entre árabe y otros idiomas, especialmente en dominios técnicos.
- Generación de código asistida para desarrolladores arabófonos: soporta tool calling y puede integrarse en entornos de desarrollo como IDE o pipelines de CI/CD para autocompletar y revisar código.
- Análisis de documentos legales o financieros en árabe: el contexto largo permite procesar contratos o informes extensos, extrayendo información relevante y resumiendo contenido.
- Asistentes virtuales para educación: puede actuar como tutor en árabe, resolviendo dudas de matemáticas, ciencias o idiomas con explicaciones detalladas.
- Despliegue en producción con baja latencia: al estar en FP8, puede servirse con `vLLM` en GPUs con soporte FP8, reduciendo costes de hardware y mejorando el throughput frente a la versión float16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta el MSE de pesos (1.786e-07) y el número de cuantizadores de activación calibrados (224/224), pero no hay métricas de tareas como MMLU, HumanEval o GSM8K. Tampoco se comparan con otras versiones cuantizadas. Se recomienda evaluar el modelo en el caso de uso concreto antes de su adopción.

## Requisitos de hardware

No se proporcionan requisitos oficiales en la información disponible. A partir de las características del modelo, se pueden estimar:

- VRAM estimada para inferencia: aproximadamente 8 GB para los pesos en FP8 (8.030 millones de parámetros × 1 byte), más overhead de activaciones y KV cache. Para una ventana de contexto de 128k, la memoria de KV cache puede superar los 10 GB adicionales, por lo que se recomienda al menos 24 GB de VRAM para uso cómodo.
- GPUs compatibles: cualquier GPU con soporte nativo FP8 (NVIDIA Hopper H100, H200, y Ada Lovelace como RTX 4090, RTX 6000 Ada). También puede ejecutarse en GPUs sin FP8 mediante emulación, pero con menor rendimiento.
- Opciones de despliegue: `vLLM` con `--quantization modelopt` es la vía recomendada. No es compatible con `transformers` estándar ni con `llama.cpp` (que usa GGUF, no safetensors FP8). Podría utilizarse con TensorRT-LLM si se convierte el formato.
- Latencia y throughput: no disponibles. Dependen de la GPU, el tamaño de lote y la longitud de las secuencias. En una H100, se espera un throughput de varios cientos de tokens por segundo para lotes pequeños, pero no hay cifras confirmadas.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base sin cuantizar y con otras cuantizaciones FP8 del mismo checkpoint. No se dispone de datos de rendimiento para esta variante, por lo que la comparación se limita a características técnicas.

| Modelo | Parámetros | Precisión | Contexto | Calibración | Licencia | Formato |
|---|---|---|---|---|---|---|
| `meta-llama/Llama-3.1-8B-Instruct` | 8.03B | FP16/BF16 | 128k | N/A | Llama 3.1 Community | safetensors |
| `NouraAlqasim/llama3.1-8b-fp8-msa` | 8.03B | FP8 (W8A8) | 128k | Árabe MSA | no disponible | safetensors (modelopt) |
| Otras cuantizaciones FP8 del mismo base (p.ej. versiones de NVIDIA) | 8.03B | FP8 | 128k | General o multilingüe | Llama 3.1 Community | safetensors (modelopt) |

La ventaja de esta variante es su calibración específica para árabe, que puede mejorar la precisión en ese idioma frente a calibraciones genéricas. La desventaja es que la licencia no está declarada, lo que puede generar incertidumbre legal para uso comercial.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar; requiere `vLLM` con `--quantization modelopt`, lo que limita su integración en entornos que no soporten esta opción.
- La licencia no está especificada en la model card. Aunque el modelo base tiene la Llama 3.1 Community License, esta variante no la declara explícitamente, por lo que se recomienda contactar con el autor antes de uso comercial.
- La calibración en árabe estándar moderno puede degradar ligeramente el rendimiento en otros idiomas si las escalas de activación están muy sesgadas hacia la distribución del árabe. No se han publicado evaluaciones comparativas.
- La cuantización FP8 introduce una pérdida de precisión mínima pero no nula; en tareas muy sensibles (como matemáticas de alta precisión o generación de código con sintaxis estricta) podría haber errores adicionales frente al modelo en float16.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas específicas es desconocido.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/NouraAlqasim/llama3.1-8b-fp8-msa
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de calibración: https://huggingface.co/datasets/Almheiri/ArabCulture-Dialogue
- NVIDIA ModelOpt (documentación): https://github.com/NVIDIA/TensorRT-Model-Optimizer
