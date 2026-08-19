# camilablank/all_sycophancy_checkpoints

## Resumen

El repositorio `camilablank/all_sycophancy_checkpoints` contiene una colección de checkpoints de modelos de la familia OLMo-3, entrenados mediante *preference training* (DPO) como parte del proyecto "sycophancy-confidence" de Camila Blank, investigadora en Stanford. El objetivo de este trabajo es reducir el comportamiento de adulación (*sycophancy*) en modelos de lenguaje, es decir, la tendencia a estar de acuerdo con el usuario o a halagarle en lugar de dar respuestas objetivas.

Cada carpeta de nivel superior del repositorio corresponde a una ejecución de entrenamiento distinta, con pesos cargables directamente mediante la librería `transformers` de HuggingFace. El repositorio tiene un tamaño de 586,8 GB, lo que sugiere que contiene múltiples checkpoints de modelos de gran tamaño. La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque al ser un proyecto de investigación, la documentación disponible es escasa y no se especifican detalles técnicos como número de parámetros, arquitectura exacta o datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo-3 (familia de modelos transformer de AI2, no se especifica variante) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos cargables con `transformers`) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de checkpoints de la familia OLMo-3, desarrollada por el Allen Institute for AI (AI2). OLMo-3 es una serie de modelos de lenguaje de código abierto basados en arquitectura transformer, aunque no se especifica si estos checkpoints concretos usan alguna variante como *mixture of experts* o atención lineal.

El entrenamiento se realizó mediante *preference training* con el algoritmo DPO (Direct Preference Optimization), una técnica que ajusta el modelo para alinear sus respuestas con preferencias humanas sin necesidad de un modelo de recompensa separado. El objetivo específico del proyecto "sycophancy-confidence" es reducir la adulación, es decir, que el modelo no cambie su respuesta simplemente para complacer al usuario. No se han publicado detalles sobre el volumen de tokens, la composición del dataset ni si se usaron fases adicionales como RLHF o SFT.

## Capacidades

- Generación de texto en lenguaje natural, aunque no se especifican idiomas concretos.
- Entrenamiento específico para reducir la adulación y el sesgo de conformidad con el usuario.
- Capacidad de cargarse con `transformers` para fine-tuning o inferencia directa.
- Al ser un checkpoint de OLMo-3, hereda las capacidades generales de esa familia (razonamiento, generación, etc.), pero no hay datos de evaluación publicados para esta versión concreta.
- No se dispone de información sobre tool calling, agentes, visión, audio o modo de pensamiento.

## Casos de uso

- Investigación sobre alineación y reducción de sesgos: el modelo es útil para estudiar cómo el DPO afecta a la adulación y para comparar checkpoints de diferentes ejecuciones de entrenamiento.
- Desarrollo de asistentes conversacionales más honestos: en sistemas de atención al cliente o asistentes personales, puede reducir respuestas que simplemente dan la razón al usuario sin base objetiva.
- Evaluación de robustez en diálogos: permite probar si un modelo mantiene su posición cuando el usuario insiste o expresa opiniones contrarias.
- Fine-tuning para dominios específicos: al ser pesos abiertos bajo Apache 2.0, se puede ajustar para tareas concretas donde la objetividad sea crítica, como asesoramiento legal, médico o financiero.
- Benchmarking de preferencias: puede servir como punto de comparación en conjuntos de evaluación como Syco-bench, que mide la adulación en cuatro dimensiones (tomar partido, espejo, sesgo de atribución y otros).
- Educación y divulgación: como recurso didáctico para demostrar técnicas de alineación y los efectos del DPO en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto está asociado al benchmark Syco-bench, pero no se proporcionan puntuaciones concretas para estos checkpoints.

## Requisitos de hardware

- No se especifican requisitos oficiales. Dado el tamaño del repositorio (586,8 GB) y que contiene múltiples checkpoints, cada modelo individual probablemente sea de gran tamaño (del orden de decenas de miles de millones de parámetros, típico de OLMo-3).
- Para inferencia, se necesitaría al menos una GPU con 40-80 GB de VRAM si se usan cuantizaciones de 8 bits o 4 bits, o varias GPUs para pesos completos.
- No hay datos de latencia o throughput publicados.
- Opciones de despliegue: al ser pesos en formato `safetensors`, se puede usar vLLM, TGI, llama.cpp (si se convierten a GGUF) u Ollama, aunque no hay configuraciones recomendadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa concreta. Los modelos OLMo-3 de AI2 son la base, pero no hay datos públicos sobre el rendimiento de estos checkpoints frente a otros modelos de reducción de sycophancy. Alternativas teóricas serían otros modelos ajustados con DPO o RLHF para el mismo fin, pero sin datos no es posible establecer una comparación.

## Limitaciones y advertencias

- Documentación muy limitada: no se especifican parámetros, contexto, idiomas ni detalles de entrenamiento, lo que dificulta su uso en producción.
- Al ser checkpoints de investigación, pueden presentar comportamientos impredecibles fuera de los escenarios de entrenamiento.
- No se ha evaluado su rendimiento en tareas generales; es probable que el fine-tuning con DPO para reducir adulación degrade otras capacidades.
- El repositorio es muy grande (586,8 GB), lo que implica costes de almacenamiento y descarga considerables.
- Aunque la licencia Apache 2.0 permite uso comercial, al no haber documentación de sesgos o alucinaciones, se recomienda una evaluación exhaustiva antes de desplegarlo.
- No se indica si los checkpoints incluyen datos de entrenamiento con información sensible o personal.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/camilablank/all_sycophancy_checkpoints
- Perfil de la autora en HuggingFace: https://huggingface.co/camilablank
- Repositorios de GitHub de la autora: https://github.com/camilablank?tab=repositories
- Benchmark Syco-bench: https://syco-bench.com/
