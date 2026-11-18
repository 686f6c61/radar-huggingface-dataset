# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-swedish-seed1

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-swedish-seed1` es un ajuste fino de SmolLM2-360M-Instruct realizado por el usuario jekunz, orientado a la generación de texto en feroés (código ISO `fo`). Se trata de un experimento de investigación sobre transferencia lingüística: el autor parte de un modelo previamente adaptado al sueco y lo entrena después con la porción feroesa del corpus FineWeb-2, con el objetivo de aprovechar la proximidad tipológica entre ambas lenguas nórdicas para mejorar el rendimiento en un idioma con recursos muy limitados.

El modelo conserva la arquitectura Llama de SmolLM2-360M-Instruct, con 361.821.120 parámetros y pesos en formato safetensors. El entrenamiento se realizó con una longitud máxima de contexto de 2048 tokens, learning rate de 5e-4, scheduler coseno y un tamaño de lote efectivo de 256, sobre una única GPU A100 de 40 GB. El autor indica explícitamente que el modelo está destinado a su investigación y que no ha sido evaluado de forma amplia.

Es relevante ahora porque ilustra una estrategia de bajo coste para lenguas de bajos recursos: reutilizar un checkpoint ya adaptado a una lengua cercana en lugar de partir del modelo base, con una licencia permisiva (Apache 2.0) que facilita su reutilización. No obstante, su alcance es limitado: 360 millones de parámetros, contexto de 2048 tokens y ausencia de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors, admite cuantización posterior a 8/4 bits con herramientas estándar) |
| Idiomas soportados | feroés (`fo`); el modelo base y el checkpoint intermedio están adaptados a sueco e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura de SmolLM2-360M-Instruct, es decir, un modelo denso de 361,8 millones de parámetros con atención causal estándar. No emplea mezcla de expertos ni mecanismos híbridos SSM. El punto de partida no es el modelo original, sino `jekunz/smollm-360m-cpt-fineweb-swedish`, un checkpoint ya sometido a continuación del preentrenamiento (CPT) sobre la porción sueca de FineWeb-2. Sobre esa base se aplica un segundo CPT con la porción feroesa del mismo corpus.

La configuración de entrenamiento publicada es la siguiente: 1 época en sueco y 5 épocas en feroés, learning rate de 5e-4 con scheduler coseno, ratio de warmup de 0,05, batch size de 8 con 32 pasos de acumulación de gradiente (lote efectivo de 256), longitud máxima de 2048 tokens y una única GPU A100 de 40 GB. El identificador indica que se trata de la semilla 1 de tres ejecuciones con esta misma configuración, lo que sugiere que el autor está midiendo la varianza entre semillas. No se documentan fases de RLHF, DPO ni ajuste por preferencias; el pipeline es exclusivamente de preentrenamiento continuado sobre texto.

## Capacidades

- Generación de texto en feroés, incluyendo texto conversacional, dado que el modelo base es una variante Instruct.
- Continuación y finalización de texto genérico: al ser un CPT sobre FineWeb-2, está orientado a modelar texto tipo web más que a instrucciones complejas.
- Capacidad multilingüe residual: conserva parte del conocimiento en inglés y sueco heredado del modelo base y del checkpoint intermedio, aunque no está garantizado ni evaluado.
- Soporte de tool calling: no disponible; no se documenta ni se ha entrenado específicamente para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño y el tipo de entrenamiento no lo hacen adecuado para estas tareas.
- Modo thinking, visión o audio: no disponible; el modelo es exclusivamente de texto.
- Razonamiento matemático y generación de código: no evaluado en esta variante; el modelo base SmolLM2-360M tiene capacidades limitadas en estas áreas.

## Casos de uso

- Experimentación académica en transferencia entre lenguas nórdicas: el modelo sirve como punto de comparación para estudiar si el CPT en sueco mejora el rendimiento en feroés frente a partir directamente de SmolLM2-360M-Instruct.
- Generación de texto sintético en feroés para aumento de datos: puede producir borradores de texto que, tras revisión humana, amplíen corpus de entrenamiento para modelos mayores.
- Prototipado de completado de texto en aplicaciones de edición para feroés: con 360 M de parámetros y contexto de 2048 tokens, es viable en CPU o GPU de gama baja para autocompletar párrafos cortos.
- Normalización y reescritura de texto web feroés: útil en pipelines de limpieza de corpus donde se necesita parafrasear o completar fragmentos.
- Investigación sobre olvido catastrófico: al partir de un checkpoint sueco, permite medir cuánto conocimiento del sueco se retiene tras 5 épocas en feroés.
- Reproducibilidad de experimentos con múltiples semillas: al existir tres semillas de la misma configuración, se puede usar para analizar la estabilidad del entrenamiento en lenguas de bajos recursos.
- Despliegue educativo en entornos con recursos limitados: su tamaño reducido permite ejecutarlo en portátiles con llama.cpp u Ollama para demostraciones de modelos lingüísticos en lenguas minoritarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 0,72 GB solo para pesos (361,8 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos de 2048 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 0,4 GB para pesos; en 4 bits, alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; A100, H100 o RTX 4090 no son necesarias y estarían infrautilizadas.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, GTX 1660 y similares; también en CPU con cuantización GGUF.
- Opciones de despliegue: transformers (librería nativa), vLLM, llama.cpp, Ollama y TGI (el tag `text-generation-inference` está presente en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-swedish-seed1 | 361,8 M | 2048 | feroés (con residual de sueco e inglés) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 361,8 M | 2048 | inglés principalmente | Apache 2.0 | Hugging Face |
| jekunz/smollm-360m-cpt-fineweb-swedish (modelo base) | 361,8 M | 2048 | sueco | Apache 2.0 (según el modelo base) | Hugging Face |
| Modelos específicos para feroés de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes, ya que no se han publicado benchmarks para el modelo descrito ni para el checkpoint intermedio.

## Limitaciones y advertencias

- El autor declara que el modelo está destinado a su investigación y no ha sido evaluado de forma amplia; no debe asumirse calidad de producción.
- Riesgo elevado de alucinación y de texto incoherente fuera de dominios similares a FineWeb-2, dado el tamaño reducido y el entrenamiento exclusivamente de continuación de preentrenamiento.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sesgos potenciales heredados de FineWeb-2 y del modelo base, incluyendo sesgos de género, culturales y geográficos presentes en texto web.
- Cobertura lingüística restringida: el feroés es una lengua de bajos recursos y el corpus de entrenamiento puede no representar todos sus registros; el rendimiento en inglés o sueco puede haberse degradado tras el CPT en feroés.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no ha pasado auditorías de seguridad.
- No se documentan medidas de alineación ni filtrado de contenido dañino; el modelo puede generar texto inapropiado.
- El identificador incluye "seed1", lo que implica que existen otras ejecuciones; los resultados pueden variar entre semillas y no se han publicado métricas de esa variabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-swedish-seed1
- Modelo base intermedio: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-swedish
- Modelo original SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio de SmolLM2: https://github.com/huggingface/smollm
