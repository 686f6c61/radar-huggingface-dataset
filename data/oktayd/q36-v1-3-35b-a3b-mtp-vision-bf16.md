# oktayd/Q36-v1.3-35B-A3B-MTP-Vision-BF16

## Resumen

Q36 v1.3 es un fine-tune de investigación desarrollado por oktayd, basado en la arquitectura Qwen3.5 MoE. Con aproximadamente 35.000 millones de parámetros totales y un diseño de Mixture of Experts con 256 expertos, de los cuales 8 se activan por token, el modelo es multimodal de imagen a texto, lo que le permite procesar entradas visuales junto con texto. El checkpoint se distribuye en formato BF16 y pesa alrededor de 70 GB. Su relevancia radica en la licencia Apache-2.0, que facilita el uso comercial, y en la preservación de tensores de visión y de predicción multi-token (MTP) del modelo base. Sin embargo, los benchmarks de calidad y rendimiento están pendientes, y la model card advierte de generaciones repetitivas observadas en pruebas diagnósticas, especialmente con el modo de razonamiento activado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForConditionalGeneration (MoE) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | 8 de 256 expertos por token (valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Mixture of Experts (MoE) basada en Qwen3.5, con 256 expertos y una selección de 8 expertos por token. Es un modelo multimodal de imagen a texto, por lo que incluye tensores de visión. Además, preserva 19 tensores MTP (Multi-Token Prediction) del modelo base, aunque el soporte de decodificación especulativa depende del backend de inferencia; preservar estos tensores no implica que Transformers habilite dicha decodificación. El entrenamiento consistió en una secuencia de tres ejecuciones de Soup/PEFT con 34.000 usos de registros seleccionados (6.000 + 12.000 + 16.000). La etapa final de personalidad completó 313/313 pasos de optimizador. El adaptador LoRA final se fusionó en la base bloqueada, y el checkpoint resultante se distribuye como un modelo standalone sin necesidad de un adaptador separado. La model card indica que la pérdida de entrenamiento no es una puntuación de benchmark y que los benchmarks de calidad y hardware están pendientes.

## Capacidades

- Generación de texto y visión: el modelo puede procesar entradas de imagen y texto gracias a su arquitectura image-text-to-text.
- Modo de razonamiento (thinking): disponible explícitamente, aunque la model card advierte de generaciones repetitivas observadas cuando está activado.
- Decodificación multi-token (MTP): los tensores MTP están preservados, pero el soporte depende del backend de inferencia.
- Almacenamiento en caché KV: habilitado en la versión, corrigiendo una configuración de entrenamiento con `use_cache: false`.
- Helper de inferencia limitada: incluye un script opcional `q36_runtime.py` que implementa límites de tiempo, detección de bucles repetidos y parada en EOS.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede recibir una imagen (por ejemplo, un diagrama o una captura de pantalla) junto con un prompt de texto, y generar una descripción o respuesta basada en el contenido visual. Es adecuado para tareas de extracción de información en entornos de investigación.
- Asistente conversacional multimodal: gracias al chat template incluido, puede mantener conversaciones multi-turno que alternan texto e imágenes. La licencia Apache-2.0 permite su integración en productos comerciales.
- Experimentación con decodificación especulativa: los tensores MTP preservados permiten probar backends de inferencia que soporten predicción multi-token, aunque el soporte no está garantizado en Transformers.
- Evaluación de salvaguardas de inferencia: el helper `q36_runtime.py` proporciona límites de tiempo y detección de bucles repetidos, lo que facilita pruebas controladas en aplicaciones donde la generación debe detenerse ante respuestas degenerativas.
- Fine-tune de investigación: al ser un checkpoint standalone con LoRA fusionado, puede servir como referencia para estudiar el efecto de la fusión de adaptadores en modelos MoE con visión.
- Uso en entornos con restricciones de tiempo: el helper `generate_bounded` permite fijar un límite de tiempo máximo de 45 segundos, útil para chatbots o pipelines donde se requiere una latencia acotada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los benchmarks de calidad y hardware están pendientes, y que la pérdida de entrenamiento no es una puntuación de benchmark.

## Requisitos de hardware

- VRAM estimada: el modelo pesa aproximadamente 70 GB de pesos BF16. La memoria en tiempo de ejecución también incluye caché y activaciones, por lo que se estima un requisito mínimo de 80-100 GB de VRAM para inferencia en BF16.
- GPU recomendadas: validado en NVIDIA H200. Se recomiendan GPUs con al menos 80 GB de VRAM, como H200 o A100 80GB.
- Compatibilidad con GPU de consumo: no cabe en GPU de consumo actuales; una RTX 4090 con 24 GB de VRAM es insuficiente.
- Opciones de despliegue: Transformers (validado con la versión 5.16.1), vLLM, TGI, llama.cpp y Ollama se mencionan como posibles backends, aunque no se proporcionan configuraciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos sobre modelos comparables de la misma categoría. El modelo base es oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT, pero no se aportan benchmarks ni especificaciones que permitan una comparación técnica.

## Limitaciones y advertencias

- Generaciones repetitivas: las pruebas diagnósticas observaron repeticiones, particularmente con el modo de razonamiento activado. Se recomienda `enable_thinking=False` como punto de partida, aunque no garantiza corrección.
- Riesgo de alucinación: la model card no afirma la eliminación de memorización ni la corrección de errores factuales. El helper `q36_runtime.py` no repara errores factuales.
- Fusión BF16: la fusión del adaptador LoRA introduce redondeo relativo a la inferencia sin fusionar; la diferencia se registra en el archivo de validación, pero no se afirma que sea idéntica bit a bit.
- Soporte MTP limitado: preservar los tensores MTP no implica que el backend de inferencia soporte decodificación especulativa.
- Benchmarks pendientes: no hay resultados de benchmarks publicados, por lo que no se puede evaluar el rendimiento real frente a otros modelos.
- Helper opt-in: las salvaguardas de `q36_runtime.py` solo se activan si se importa explícitamente; los imports simples de Transformers, GGUF y Ollama no lo ejecutan.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto o idioma: no disponible.

## Enlaces

- HuggingFace: https://huggingface.co/oktayd/Q36-v1.3-35B-A3B-MTP-Vision-BF16
- Modelo base: https://huggingface.co/oktayd/Q36-35B-A3B-Opus4.7-Ablit-Heretic-OBLITERATUS-Hermes-MTP-Vision-FT
- Perfil del autor: https://huggingface.co/oktayd
