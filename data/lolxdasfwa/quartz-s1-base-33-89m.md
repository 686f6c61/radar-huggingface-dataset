# lolxdasfwa/Quartz-S1-Base-33.89M

## Resumen

Quartz-S1-Base-33.89M es un modelo de lenguaje pequeño (SLM) desarrollado por el usuario lolxdasfwa, basado en la arquitectura GPT-2. Con solo 33,89 millones de parámetros, está diseñado como una base preentrenada para experimentación y fine-tuning, no para uso productivo directo. Se entrenó sobre el dataset HuggingFaceFW/fineweb-edu durante 27.000 pasos, alcanzando una pérdida final de 5.313 y una pérdida de validación de 5.321.

Su relevancia radica en su tamaño extremadamente reducido, que lo hace accesible para entornos con recursos limitados, pruebas de concepto o fines educativos. El propio autor advierte que es un modelo "muy tonto" y que puede generar texto incorrecto, repetitivo o sin sentido, por lo que no debe compararse con modelos de mayor escala. Está publicado bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (Transformer decoder) |
| Parametros totales | 33.888.384 (33,89 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 1024, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPT-2, un transformer decoder estándar con atención causal. No se especifican detalles sobre el número de capas, dimensiones ocultas o cabezas de atención, pero por el tamaño de parámetros (33,89 M) se trata de una configuración muy reducida, probablemente similar a la de un GPT-2 mini o un modelo de juguete.

El entrenamiento se realizó sobre el dataset HuggingFaceFW/fineweb-edu, un subconjunto de FineWeb filtrado por calidad educativa. Se ejecutaron 27.000 pasos de optimización, con una pérdida final en entrenamiento de 5.313 y una pérdida de validación de 5.321. No se menciona el uso de técnicas como RLHF, DPO o ajuste fino por instrucciones; es un modelo base puramente preentrenado.

## Capacidades

- Generacion de texto: puede completar secuencias de texto, aunque con alta probabilidad de producir salidas incoherentes o repetitivas.
- Fine-tuning: al ser un modelo base, está pensado para ser ajustado en tareas específicas mediante transfer learning.
- Capacidades SLM: el autor indica que tras un fine-tuning adecuado puede responder preguntas básicas, pero sin garantías de calidad.
- Multilingüismo: no soportado, solo inglés.
- Tool calling / function calling: no disponible.
- Razonamiento multi-step: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Experimentacion academica: ideal para estudiantes o investigadores que quieran estudiar el comportamiento de modelos pequeños, probar técnicas de fine-tuning con recursos minimos o analizar la evolucion de la perdida durante el entrenamiento.
- Prototipado rapido: sirve como punto de partida para validar pipelines de generacion de texto o de ajuste fino antes de escalar a modelos mayores.
- Educacion en IA: util en cursos donde se ensena a construir y entrenar modelos de lenguaje desde cero, dado su tamano manejable y su licencia permisiva.
- Pruebas de infraestructura: permite verificar el despliegue en entornos como Hugging Face Inference Endpoints o FriendliAI sin incurrir en costes elevados de computacion.
- Generacion de datos sinteticos de baja calidad: aunque no recomendable para produccion, puede usarse para crear ejemplos de texto que luego se filtran o se usan como aumentacion en datasets de entrenamiento.
- Benchmarking de frameworks: sirve para comparar el rendimiento de diferentes librerias de inferencia (Transformers, vLLM, llama.cpp) en modelos muy pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como MMLU, HumanEval o GSM8K, y tampoco hay comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en precision fp32 (el modelo pesa unos 135 MB en safetensors). Cabe en cualquier GPU moderna, incluso en CPUs sin problema.
- GPU recomendadas: no requiere GPU especifica; cualquier GPU con mas de 2 GB de VRAM es suficiente. Tambien se puede ejecutar en CPU con latencias de milisegundos.
- Compatibilidad con consumer GPU: si, cualquier tarjeta de gama baja (GTX 1050, RTX 2050, etc.) puede ejecutarlo sin dificultad.
- Opciones de despliegue: compatible con Hugging Face Transformers, Text Generation Inference (TGI), FriendliAI (segun el enlace encontrado), y probablemente con vLLM, llama.cpp y Ollama, aunque no se confirma en la documentacion.
- Latencia y throughput: no hay datos oficiales, pero por su tamano se espera una generacion de cientos de tokens por segundo en GPU y decenas en CPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de tamano similar. Se podria comparar con GPT-2 Small (124M) o DistilGPT-2 (82M), pero Quartz-S1-Base es aun mas pequeno y no se han publicado resultados que permitan una comparacion cuantitativa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo es extremadamente pequeno y su capacidad linguistica es muy limitada; genera texto con frecuencia incorrecto, repetitivo o sin sentido.
- Riesgo alto de alucinacion: no tiene suficiente capacidad para producir respuestas factualmente fiables.
- Solo soporta ingles; cualquier intento de uso en otros idiomas producira resultados degradados.
- No se han documentado sesgos especificos, pero al entrenarse en fineweb-edu podria heredar sesgos presentes en ese corpus.
- No es apto para uso en produccion sin un fine-tuning exhaustivo y una evaluacion rigurosa.
- Aunque la licencia Apache 2.0 permite uso comercial, la calidad del modelo hace que su aplicacion comercial sea poco practica.
- No se especifica la longitud de contexto, por lo que se desconoce si soporta ventanas superiores a 1024 tokens (el limite tipico de GPT-2).

## Enlaces

- [Hugging Face - Quartz-S1-Base-33.89M](https://huggingface.co/lolxdasfwa/Quartz-S1-Base-33.89M)
- [FriendliAI - Quartz-S1-Base-33.89M API & Inference Endpoint](https://friendli.ai/models/lolxdasfwa/Quartz-S1-Base-33.89M)
- [Perfil del autor en Hugging Face](https://huggingface.co/lolxdasfwa)
