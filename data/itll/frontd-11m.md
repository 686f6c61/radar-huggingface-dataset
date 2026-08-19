# ITLL/FrontD.11m

## Resumen

FrontD.11m es un modelo de lenguaje autorregresivo (decoder-only) de aproximadamente 11 millones de parámetros, desarrollado por ITLL (In The Loop Labs) y publicado en Hugging Face bajo licencia MIT. El modelo ha sido entrenado completamente desde cero, sin partir de pesos preentrenados, sobre un conjunto de datos propio (`Plans11/Organized_PreTrain_1k_Context`) con una ventana de contexto de 1096 tokens. Su pequeño tamaño y su arquitectura sencilla lo convierten en una herramienta útil para experimentación, investigación educativa y fine-tuning en tareas específicas con recursos limitados.

A nivel técnico, emplea una arquitectura transformer clásica con normalización RMSNorm, activación SwiGLU en la capa feed-forward y posiciones rotatorias (RoPE). Los embeddings de entrada y salida están atados (tied), lo que reduce el número de parámetros. El vocabulario es de 16 000 tokens, lo que lo hace adecuado para tareas de generación de texto en entornos controlados, aunque no se especifican los idiomas soportados. El modelo se distribuye en formato PyTorch y el repositorio tiene un tamaño de 1,2 GB, probablemente correspondiente a los pesos en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (6 capas, 16 cabezas, hidden size 256, FFN 1152) |
| Parametros totales | 10 996 608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1096 tokens |
| Tipos de cuantizacion | no disponible (no se indican versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio PyTorch, probablemente safetensors o .bin; no se especifica) |

## Arquitectura y entrenamiento

FrontD.11m sigue una arquitectura transformer decoder-only estándar, con 6 capas, 16 cabezas de atención, dimensión oculta de 256 y una capa feed-forward de 1152 unidades. Emplea normalización RMSNorm en lugar de LayerNorm, activación SwiGLU en la FFN y posiciones rotatorias (RoPE) para codificar la información posicional. Los embeddings de entrada y salida están atados, lo que reduce el número de parámetros totales.

El entrenamiento se realiza desde cero, con inicialización aleatoria, sobre el dataset `Plans11/Organized_PreTrain_1k_Context`. El proceso se organiza en sesiones de 20 000 ejemplos, y se mantiene un registro persistente (ledger) con hashes SHA-256 de cada ejemplo para garantizar que solo se procesan aquellos cuya sesión de entrenamiento ha finalizado correctamente. No se menciona el uso de técnicas como RLHF o DPO; el modelo es un pretraining básico de lenguaje.

## Capacidades

- Generación de texto autoregresiva: dado un prompt, produce continuaciones de texto coherentes dentro de su dominio de entrenamiento.
- Razonamiento básico: al ser un modelo pequeño, puede manejar tareas simples de completado y patrones lingüísticos, pero con limitaciones evidentes en tareas complejas.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño y la ventana de contexto limitan este tipo de capacidades.
- Capacidades multilingües: no especificadas; el vocabulario de 16 000 tokens sugiere un enfoque monolingüe o limitado.
- Capacidades especiales: ninguna adicional (sin visión, audio, ni modo de pensamiento).

## Casos de uso

- Investigación educativa: sirve como modelo de referencia para estudiar el comportamiento de arquitecturas transformer pequeñas, el efecto del contexto limitado o la influencia de la inicialización aleatoria.
- Fine-tuning en dominios específicos: su tamaño reducido permite ajustarlo con pocos recursos en tareas concretas como clasificación de texto, análisis de sentimiento o generación de respuestas cortas en un dominio acotado.
- Prototipado rápido: al ser ligero, se puede integrar en pipelines de desarrollo para probar ideas de generación de texto sin necesidad de infraestructura potente.
- Generación de texto corto: adecuado para tareas donde se requieren respuestas breves, como autocompletado de formularios, sugerencias de palabras o generación de titulares.
- Benchmarking de eficiencia: sirve para medir el rendimiento de frameworks de inferencia (llama.cpp, vLLM, etc.) con modelos de parámetros reducidos.
- Pruebas de técnicas de entrenamiento: al ser entrenado desde cero, permite experimentar con diferentes estrategias de preprocesado, datos o configuraciones de hiperparámetros sin coste computacional alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11M de parámetros, en FP32 ocupa ~44 MB, en FP16 ~22 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (incluso integradas) es suficiente; una RTX 3060 o superior sería más que suficiente para entrenamiento o fine-tuning.
- Compatibilidad con GPU de consumo: sí, absolutamente; es un modelo extremadamente ligero.
- Opciones de despliegue: se puede ejecutar con llama.cpp, Ollama, vLLM, TGI o directamente con PyTorch/Hugging Face Transformers. Dado el tamaño, la latencia es mínima (del orden de milisegundos por token en GPU).
- Throughput estimado: no disponible, pero al ser tan pequeño, se puede alcanzar cientos de tokens por segundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se podría comparar con otros modelos de tamaño similar como GPT-2 pequeño (124M) o modelos de 10-20M de parámetros, pero no hay datos de rendimiento ni benchmarks que permitan una comparación rigurosa. Por tanto, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser entrenado desde cero con un dataset específico, puede heredar sesgos presentes en los datos.
- Riesgo de alucinación: alto, especialmente fuera del dominio de entrenamiento; el modelo puede generar contenido plausible pero incorrecto.
- Limitaciones de contexto: la ventana de 1096 tokens es muy reducida, lo que impide manejar documentos largos o conversaciones extensas.
- Limitaciones de idioma: no se especifican idiomas soportados; es probable que el modelo solo funcione razonablemente en el idioma del dataset de entrenamiento (no indicado).
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero al ser un modelo experimental, no se garantiza su robustez ni seguridad en producción.
- Caveat para producción: no se recomienda su uso en aplicaciones críticas sin un fine-tuning exhaustivo y una evaluación rigurosa; su tamaño y contexto lo hacen inadecuado para tareas complejas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/FrontD.11m
- Organización ITLL: https://huggingface.co/ITLL
- Modelo relacionado (Frontier-11M-CoT-Stage2): https://huggingface.co/ITLL/Frontier-11M-CoT-Stage2
