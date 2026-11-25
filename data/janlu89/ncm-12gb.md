# janlu89/ncm-12gb

## Resumen

ncm-12gb es un conjunto de checkpoints de investigación publicados por Gianluca Meola (janlu89) que implementan un Next-Concept Model (NCM) entrenado íntegramente en una única GPU de 12 GB. La propuesta se aparta de la generación token a token habitual: un tokenizador VQ-VAE codifica un relato completo en una jerarquía de 12 niveles de códigos discretos y un generador predice esa jerarquía nivel a nivel, de lo grueso a lo fino. El repositorio agrupa tanto los tokenizadores como los generadores necesarios para reproducir el pipeline.

La versión v0.2 (23 de noviembre de 2026) añade seis generadores con arquitectura de transformer con bucles (bloque compartido de 4 capas aplicado hasta tres veces), entrenados sobre 409.600 relatos del dataset TinyStories con el tokenizador oficial de los autores originales. Los pesos son pequeños: 36,4 M de parámetros para los tokenizadores y 88,6 M para los generadores, lo que sitúa el modelo en la categoría de investigación educativa y experimental más que en la de modelo de producción.

El interés actual reside en dos frentes: la eficiencia del paradigma coarse-to-fine para generar texto estructurado con presupuestos de cómputo muy bajos, y el estudio empírico sobre crecimiento en profundidad de generadores con pesos compartidos, que muestra que ampliar capas durante el entrenamiento no degrada la perplejidad generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador VQ-VAE jerarquico (12 niveles) + generador transformer con bucles (bloque compartido de 4 capas) |
| Parametros totales | 36,4 M (tokenizador) y 88,6 M (generador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato nativo del repositorio) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | export/ con config.yaml y pesos del framework NCM (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El pipeline consta de dos piezas. Primero, un tokenizador VQ-VAE con 12 niveles de cuantizacion que comprime un relato completo en una jerarquia de codigos discretos; los codebooks se inicializan a partir de los datos y las entradas muertas se reinician durante los primeros 1.200 pasos. Segundo, un generador que predice esa jerarquia nivel a nivel. Los generadores de v0.2 emplean una estructura de 4 capas iniciales, un bloque de 4 capas con pesos compartidos aplicado dos o tres veces, y 4 capas finales, lo que da lugar a 16 o 20 capas efectivas con solo 12 conjuntos de pesos.

El entrenamiento se realizo sobre 409.600 relatos de TinyStories, con corrupcion constante de 0,5, atencion FlexAttention y learning rate 1e-3. Se entrenaron semillas 42 y 43 para cada configuracion. La innovacion destacable es el crecimiento en profundidad: algunos generadores arrancan con 12 capas aplicadas y crecen a 16 en el paso 1.600 (o a 16 y luego a 20 en los pasos 1.067 y 2.133). Los resultados indican que crecer no degrada la calidad de forma medible: las perplejidades generativas medias de dos semillas son 24,52 (12→16) y 24,17 (12→16→20) frente a 25,10 del modelo de 16 capas entrenado desde cero. No se demuestra que crecer mejore la calidad, pero tampoco la empeora dentro del umbral del 4,7% fijado por el estudio.

## Capacidades

- Generacion de texto en ingles a partir de la jerarquia de conceptos, orientada a relatos cortos estilo TinyStories.
- Generacion no condicionada (unconditional sampling) de historias completas.
- Prediccion jerarquica nivel a nivel, con control potencial sobre el nivel de detalle de la generacion.
- Crecimiento en profundidad del generador durante el entrenamiento (capacidad de investigacion, no de inferencia).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: solo ingles.
- No se documenta integracion con APIs de chat ni plantillas de prompt conversacionales.

## Casos de uso

- Investigacion sobre modelos generativos jerarquicos: el checkpoint permite reproducir el pipeline NCM completo (tokenizador + generador) y comparar perplejidades generativas con los resultados publicados.
- Estudio de eficiencia en entrenamiento: util para analizar como afecta el crecimiento en profundidad con pesos compartidos al coste computacional medido en capas aplicadas por paso.
- Generacion de relatos sinteticos para aumento de datos: los generadores producen historias cortas en ingles que pueden servir para aumentar corpus de dominios simples.
- Docencia y prototipado en hardware modesto: al caber en una GPU de 12 GB, permite experimentar con VQ-VAE jerarquicos y transformers con bucles sin infraestructura dedicada.
- Reproducibilidad de articulos: los checkpoints y config.yaml permiten replicar los experimentos de los papers arXiv:2610.14162 y arXiv:2609.19107.
- Comparacion de tokenizadores: el repositorio incluye dos tokenizadores (receta de 38.400 pasos y de 2.400 pasos) que permiten estudiar el impacto del presupuesto de entrenamiento del tokenizador en la perplejidad final.

## Benchmarks y rendimiento

| Modelo / configuracion | Parametros | Perplejidad generativa (GPT-2 large, 1.280 muestras) |
|---|---|---|
| Generador 16 capas desde cero, semilla 42 | 88,6 M | 25,20 |
| Generador 16 capas desde cero, semilla 43 | 88,6 M | 25,00 |
| Generador 12→16 capas (crece en paso 1.600), semilla 42 | 88,6 M | 24,78 |
| Generador 12→16 capas (crece en paso 1.600), semilla 43 | 88,6 M | 24,25 |
| Generador 12→16→20 capas, semilla 42 | 88,6 M | 24,53 |
| Generador 12→16→20 capas, semilla 43 | 88,6 M | 23,81 |
| Generador 12 capas v0.1, tokenizador oficial, semilla 42 | 88,6 M | 26,04 |
| Generador 12 capas v0.1, tokenizador propio 2.400 pasos, semilla 42 | 88,6 M | 42,76 |
| Tokenizador 38.400 pasos + generador 51.200 relatos | 36,4 M | 91,46 |
| Tokenizador 2.400 pasos + generador 51.200 relatos (media 2 semillas) | 36,4 M | 108,17 |
| Modelo TinyStories publicado por los autores originales (referencia) | no disponible | 16,58 |
| Texto real (referencia) | no disponible | 9,67 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento original: una unica GPU de 12 GB, segun el titulo del estudio.
- VRAM estimada para inferencia: no disponible de forma explicita; con 88,6 M de parametros en fp32 el peso ronda los 0,35 GB, por lo que deberia caber en GPUs consumer de gama media y baja.
- GPU recomendadas: cualquier GPU consumer con al menos 12 GB para reproducir el entrenamiento (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); para inferencia, GPUs con 4-8 GB deberian ser suficientes.
- Despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el uso previsto es mediante el repositorio de codigo github.com/janlu89/ncm-12gb con el codigo upstream de NCM fijado a un commit concreto.
- Latencia y throughput: no disponibles.
- Dependencias adicionales: requiere los ficheros de TinyStories de hazyresearch/ncm-checkpoints en artifacts/tinystories/ del repositorio de codigo, que no se redistribuyen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ncm-12gb (este) | 88,6 M generador + 36,4 M tokenizador | no disponible | VQ-VAE jerarquico + transformer con bucles | MIT | Hugging Face y GitHub |
| TinyStories publicado por los autores originales | no disponible | no disponible | Transformer decoder estandar sobre TinyStories | no disponible | hazyresearch/ncm-checkpoints |
| GPT-2 small | 124 M | 1.024 tokens | Transformer decoder | MIT | Amplia |
| Modelos TinyStories de la literatura (p. ej. variantes de 1-10 M) | 1-10 M | no disponible | Transformer decoder | variable | variable |

La comparacion directa con GPT-2 small no es del todo justa porque el pipeline NCM separa tokenizador y generador y opera sobre conceptos jerarquicos en lugar de tokens. Frente al modelo TinyStories de referencia (perplejidad 16,58), los generadores de ncm-12gb quedan por encima (23,81-25,20), lo que refleja presupuestos de entrenamiento mas cortos y una arquitectura experimental.

## Limitaciones y advertencias

- Checkpoints de investigacion: el propio autor indica que no son modelos de produccion y que los presupuestos de entrenamiento son cortos.
- Solo ingles; no se documenta soporte multilingue.
- Entrenado exclusivamente sobre TinyStories, por lo que el dominio queda restringido a relatos cortos y vocabulario simple; el riesgo de alucinacion fuera de dominio es alto.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Requiere el codigo upstream de NCM a un commit concreto y los ficheros de TinyStories de hazyresearch/ncm-checkpoints, que no se redistribuyen; el pipeline no es plug-and-play con herramientas estandar.
- Dependencia de la revision concreta del tokenizador oficial (d342ce8a…, octubre de 2026); los generadores de v0.2 no fueron entrenados ni evaluados con la revision posterior de noviembre de 2026.
- Licencia MIT permite uso comercial, pero la ausencia de benchmarks estandar y de documentacion sobre sesgos hace recomendable una evaluacion propia antes de cualquier despliegue.
- Cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/janlu89/ncm-12gb
- Repositorio de codigo: https://github.com/janlu89/ncm-12gb
- CHANGELOG: https://github.com/janlu89/ncm-12gb/blob/main/CHANGELOG.md
- Paper Next-Concept Models: https://arxiv.org/abs/2610.14162
- Paper adicional citado: https://arxiv.org/abs/2609.19107
- Checkpoints de los autores originales: https://huggingface.co/hazyresearch/ncm-checkpoints
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- DOI v0.2: 10.5281/zenodo.24478988
- DOI v0.1: 10.5281/zenodo.24408541
- Contacto del autor: gianluca.meola89@gmail.com
