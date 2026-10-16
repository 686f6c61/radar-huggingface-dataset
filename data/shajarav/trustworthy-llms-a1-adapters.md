# shajarav/trustworthy-llms-a1-adapters

## Resumen

`shajarav/trustworthy-llms-a1-adapters` es un repositorio de adaptadores LoRA (PEFT) publicado por el usuario shajarav como artefacto de entrega de una asignatura universitaria sobre modelos de lenguaje fiables ("trustworthy LLMs"). No se trata de un modelo entrenado desde cero, sino de un conjunto de adaptadores que se aplican sobre dos modelos base publicos de Qwen: `Qwen/Qwen2.5-1.5B-Instruct` y `Qwen/Qwen2.5-0.5B`. El problema que aborda el experimento es la diferencia de comportamiento entre un modelo "victima" entrenado sobre un corpus sin depurar y otro entrenado sobre un corpus saneado, con un tercer adaptador ("sanitizer") destinado a filtrar o limpiar el corpus.

El repositorio expone tres exportaciones de runtime listas para evaluacion: `sanitizer_A5_epoch9` (sanitizer, epoca 9, sobre Qwen2.5-1.5B-Instruct), `victim_raw` (victima entrenada sobre corpus crudo, epoca final 4, sobre Qwen2.5-0.5B) y `victim_san` (victima entrenada sobre corpus saneado, epoca final 4, sobre Qwen2.5-0.5B). Ademas conserva los checkpoints intermedios de las diez epocas de las ejecuciones A1-A6, los diagnosticos y un archivo historico, con un total de 87 rutas de pesos de adaptador que corresponden a 69 archivos de pesos aprendidos distintos.

Es relevante unicamente como material de investigacion reproducible: el propio autor advierte que la publicacion y la verificacion de descargas no constituyen una evaluacion nueva ni establecen idoneidad fuera de los experimentos originales. No hay resultados de benchmarks, ni declaracion de licencia, ni idiomas soportados, ni informacion de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre transformers Qwen2.5 (arquitectura del modelo base) |
| Parametros totales | No disponible (parametros del adaptador no declarados); modelos base de 0.5B y 1.5B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio (el modelo base Qwen2.5 soporta 32.768 tokens) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; el repositorio no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino adaptadores de bajo rango (LoRA) gestionados con la libreria PEFT. La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only con atencion causal, en sus variantes de 0.5B parametros (`Qwen/Qwen2.5-0.5B`, revision `060db6499f32faf8b98477b0a26969ef7d8b9987`) y 1.5B parametros en version Instruct (`Qwen/Qwen2.5-1.5B-Instruct`, revision `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`). Los adaptadores no modifican la arquitectura base: se cargan sobre ella en tiempo de inferencia.

En cuanto al entrenamiento, la model card describe un diseno experimental con ejecuciones etiquetadas A1-A6, cada una con hasta diez epocas y copias del "best", mas dos victimas entrenadas durante cuatro epocas cada una (una sobre corpus crudo y otra sobre corpus saneado). El repositorio conserva los estados de los adaptadores, pero excluye explicitamente los estados del optimizador por no ser necesarios para inferencia. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similares. El autor aclara que los `adapter_config.json` originales conservan rutas locales del servidor de entrenamiento y que el cargador de la asignatura debe cargar primero el modelo base publico de Qwen y aplicar despues el adaptador seleccionado.

## Capacidades

- Generacion de texto: los adaptadores heredan la capacidad de generacion del modelo base Qwen2.5 sobre el que se aplican.
- Razonamiento e instrucciones: la variante `sanitizer_A5_epoch9` se apoya en `Qwen2.5-1.5B-Instruct`, por lo que parte de la capacidad de seguimiento de instrucciones del modelo base.
- Clasificacion o filtrado de contenido: el rol declarado del adaptador "sanitizer" sugiere un uso orientado a limpieza o cribado de corpus, aunque el repositorio no documenta el formato de entrada/salida.
- Tool calling / function calling: no disponible (no declarado en el repositorio; depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Reproduccion academica del experimento: cargar los adaptadores `victim_raw` y `victim_san` sobre `Qwen/Qwen2.5-0.5B` y comparar el comportamiento de ambos para replicar los resultados de la asignatura.
- Auditoria de tecnicas de saneamiento de corpus: usar `sanitizer_A5_epoch9` sobre `Qwen/Qwen2.5-1.5B-Instruct` para estudiar como un adaptador LoRA puede filtrar o transformar datos de entrenamiento.
- Analisis de robustez frente a datos envenenados: comparar las salidas de las dos victimas para medir el impacto de un corpus sin depurar frente a uno saneado.
- Docencia e investigacion sobre "trustworthy LLMs": servir como material didactico reproducible con checksums SHA-256 verificables mediante `asset_manifest.json`.
- Verificacion de integridad de artefactos: emplear el manifiesto de activos para practicar pipelines de validacion de pesos y reproducibilidad en MLOps.
- Estudio de eficiencia de LoRA en modelos pequenos: evaluar el coste de entrenamiento y de inferencia de adaptadores sobre modelos de 0.5B y 1.5B parametros en hardware de consumo.
- Base para experimentos de alineacion: reutilizar los adaptadores como punto de partida en trabajos de seguridad y alineacion a pequena escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del tamano del modelo base, no confirmadas por el autor): en FP16, aproximadamente 2 GB para el modelo de 0.5B (mas overhead del adaptador y de la cache KV) y unos 4 GB para el de 1.5B.
- En cuantizacion de 8 bits: aproximadamente 1 GB (0.5B) y 2,5 GB (1.5B); en 4 bits: aproximadamente 0,6 GB y 1,3 GB respectivamente.
- GPU recomendadas: el modelo de 0.5B y el de 1.5B caben sin problema en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores; para el adaptador de 1.5B basta con 8 GB de VRAM en FP16.
- Caben en GPU de consumo: si, en ambos casos.
- Opciones de despliegue: PEFT + transformers (la ruta oficial del cargador de la asignatura, que ancla revisiones y verifica SHA-256), vLLM, TGI o llama.cpp previa conversion del adaptador a GGUF. El repositorio no incluye artefactos GGUF.
- Latencia y throughput estimados: no disponible (no publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `shajarav/trustworthy-llms-a1-adapters` | Adaptador LoRA sobre 0.5B y 1.5B | No disponible | No disponible | HuggingFace, 0 descargas | Artefacto de asignatura, sin benchmarks |
| Qwen/Qwen2.5-0.5B | 0.5B | 32.768 tokens | Apache 2.0 (modelo base) | HuggingFace, publico | Modelo base de las victimas |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 (modelo base) | HuggingFace, publico | Modelo base del sanitizer |
| Llama-3.2-1B-Instruct | 1B | 128.000 tokens | Licencia comunitaria Llama | HuggingFace, publico | Alternativa de tamano comparable, no evaluada en este repositorio |

La comparativa se limita a los modelos base, ya que el repositorio no aporta metricas propias ni evaluaciones comparativas.

## Limitaciones y advertencias

- No se declara licencia: el uso comercial queda en un limbo legal hasta que el autor lo aclare explicitamente.
- Es un artefacto de investigacion academica; el autor advierte que su publicacion no constituye una evaluacion ni garantiza idoneidad fuera de los experimentos originales.
- No hay resultados de benchmarks, por lo que no se puede afirmar nada sobre su calidad frente a otros modelos.
- Los `adapter_config.json` conservan rutas locales del servidor de entrenamiento; el cargador debe forzar la carga del modelo base publico de Qwen y aplicar despues el adaptador.
- El repositorio contiene multiples adaptadores en subcarpetas: la raiz no es un adaptador cargable directamente.
- Riesgo de alucinacion y sesgos: inherente a los modelos base Qwen2.5, sin que este repositorio documente mitigaciones.
- No se declaran idiomas soportados; la cobertura linguistica dependera del modelo base.
- Los adaptadores "victima" sobre corpus crudo pueden reflejar sesgos o contenido problematico presente en el corpus original.
- El repositorio ocupa 5,7 GB e incluye checkpoints intermedios e historicos; conviene descargar solo los artefactos de runtime necesarios.
- Los estados del optimizador estan excluidos, por lo que no es posible reanudar el entrenamiento desde estos ficheros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shajarav/trustworthy-llms-a1-adapters
- Modelo base 1.5B Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base 0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Libreria PEFT: https://github.com/huggingface/peft
- La busqueda web realizada no ha devuelto enlaces relevantes adicionales sobre este modelo.
