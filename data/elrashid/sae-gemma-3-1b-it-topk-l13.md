# elrashid/sae-gemma-3-1b-it-topk-l13

## Resumen

`elrashid/sae-gemma-3-1b-it-topk-l13` es un sparse autoencoder (SAE) de tipo TopK entrenado sobre la activación de la capa 13 del modelo `google/gemma-3-1b-it`. No es un modelo generativo, sino una herramienta de interpretabilidad mecanicista: descompone las activaciones internas del transformer en un conjunto de características dispersas y monitorizables, lo que permite analizar qué representaciones internas se activan ante un input concreto. El autor es el usuario de Hugging Face `elrashid` y el repositorio se publica bajo licencia MIT.

El interés de esta ficha es doble. Por un lado, documenta un SAE TopK aplicado a un modelo pequeño y moderno (Gemma 3 1B instruct), lo que facilita experimentos de interpretabilidad en hardware de consumo. Por otro, sirve como pieza auxiliar en flujos de auditoría y seguridad de IA: al mapear activaciones a características interpretables, se pueden detectar sesgos, circuitos o comportamientos anómalos antes de desplegar el modelo base.

El repositorio es de acceso restringido (gated): requiere iniciar sesión en Hugging Face y aceptar las condiciones para descargar los pesos. El tamaño del repo es de 0,2 GB y la librería declarada es PyTorch. No se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento más allá de la referencia a `monology/pile-uncopyrighted`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (SAE) TopK sobre activaciones de la capa 13 de `google/gemma-3-1b-it` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, Gemma 3 1B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (repo de 0,2 GB); safetensors no confirmado |
| Modelo base | `google/gemma-3-1b-it` |
| Capa objetivo | 13 |
| Dataset de entrenamiento | `monology/pile-uncopyrighted` |
| Acceso | restringido (gated) |
| Libreria | pytorch |

## Arquitectura y entrenamiento

El artefacto es un sparse autoencoder con activación TopK, una variante de SAE que fuerza un número fijo de características activas por token (k) en lugar de aplicar una penalización L1. Esta formulación, popularizada por trabajos como los de OpenAI y Anthropic sobre interpretabilidad, evita el colapso de características y produce diccionarios más limpios y estables. El SAE se entrena para reconstruir la activación residual de la capa 13 de Gemma 3 1B a partir de una representación dispersa de mayor dimensionalidad; cada dimensión del espacio latente corresponde a una "característica" que idealmente captura un concepto o patrón semántico concreto.

El entrenamiento se realizó sobre el dataset `monology/pile-uncopyrighted`, una versión filtrada del Pile sin material con copyright, lo que reduce el riesgo legal de los experimentos derivados. No se dispone de información pública sobre el número de tokens de entrenamiento, el valor de k, la dimensionalidad del diccionario, la tasa de reconstrucción ni si se aplicaron técnicas de normalización o dead-feature resampling. Tampoco se documenta si el SAE se entrenó sobre activaciones de la instrucción (chat) o sobre texto plano. Toda esta información debería consultarse en la model card del repositorio una vez aceptado el acceso.

## Capacidades

- Extracción de características dispersas: dado un input de texto, el SAE devuelve el conjunto de características activas (índices y magnitudes) correspondientes a la activación de la capa 13.
- Análisis de activaciones internas: permite estudiar qué representaciones internas de Gemma 3 1B se activan ante prompts concretos, útil para depuración de comportamientos.
- Detección de conceptos: las características aprendidas pueden asociarse a conceptos semánticos, sintácticos o de estilo, y usarse para monitorizar su presencia.
- Soporte para experimentos de mechanistic interpretability: intervención sobre activaciones (steering), ablación de características y análisis de circuitos.
- Compatible con el ecosistema PyTorch: los pesos se cargan como tensores estándar y pueden integrarse en pipelines propios.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales por sí mismo; depende del modelo base para la inferencia.
- Idiomas: no documentados explícitamente, pero heredados del dataset Pile (predominantemente inglés).

## Casos de uso

- Auditoría de seguridad de Gemma 3 1B: cargar el SAE, ejecutar prompts sensibles y revisar qué características se activan para detectar representaciones asociadas a sesgos, toxicidad o conocimiento factual erróneo antes de desplegar el modelo en producción.
- Análisis de circuitos y mecanismos: usar las características del SAE como unidad de análisis para rastrear cómo fluye la información entre capas y qué componentes contribuyen a una predicción concreta.
- Steering y control de comportamiento: identificar la característica asociada a un estilo o concepto (por ejemplo, formalidad o negatividad) e intervenir sobre su magnitud para modificar la salida del modelo base sin reentrenar.
- Investigación académica en interpretabilidad: servir como referencia reproducible de un SAE TopK sobre un modelo pequeño y abierto, útil para comparar metodologías y métricas de reconstrucción.
- Educación y docencia: por su tamaño (0,2 GB) y su base de 1B parámetros, permite que estudiantes ejecuten experimentos de interpretabilidad en portátiles con GPU modesta.
- Detección de fuga de información: monitorizar características que se activen ante datos sensibles (PII, credenciales) para construir filtros de entrada/salida basados en activaciones internas.
- Evaluación de robustez: comparar las características activadas ante inputs adversariales frente a inputs limpios para medir la estabilidad de las representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo del SAE ocupa 0,2 GB, por lo que el SAE en sí cabe en cualquier GPU con al menos 1 GB libre. Sin embargo, para extraer activaciones hay que cargar también el modelo base Gemma 3 1B, que en fp16 requiere en torno a 2-3 GB de VRAM y en bf16 un valor similar.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4090) es suficiente para ejecutar el modelo base y el SAE de forma conjunta. Para experimentos por lotes a gran escala se recomienda A100 o H100.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 8 GB o más.
- Opciones de despliegue: PyTorch nativo (carga directa de tensores), integración con TransformerLens o SAELens si el formato es compatible, y scripts propios. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles. Dependen del modelo base y del coste de la pasada forward por la capa 13.

## Comparativa con modelos similares

| Modelo | Base | Capa | Tipo | Licencia | Acceso |
|---|---|---|---|---|---|
| `elrashid/sae-gemma-3-1b-it-topk-l13` | Gemma 3 1B IT | 13 | SAE TopK | MIT | Gated |
| SAEs de Gemma Scope (Google DeepMind) | Gemma 2 (2B/9B/27B) | Múltiples | SAE JumpReLU/TopK | Gemma Terms | Público |
| SAEs de GPT-2 small (varios autores) | GPT-2 small | Múltiples | SAE L1/TopK | MIT/Apache | Público |

La comparación directa es limitada porque no se han publicado métricas de reconstrucción ni de interpretabilidad para este SAE. Frente a Gemma Scope, la diferencia principal es el modelo base (Gemma 3 1B frente a Gemma 2) y la capa única (13) frente a la cobertura multicapa de Gemma Scope. Frente a los SAEs de GPT-2 small, la ventaja es trabajar sobre un modelo más moderno y con instrucciones.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face; no se puede descargar de forma anónima.
- Falta de documentación: no se publican hiperparámetros (k, dimensionalidad, tasa de reconstrucción), lo que dificulta la reproducibilidad y la comparación con otros SAEs.
- Dependencia del modelo base: el SAE solo es válido para la capa 13 de `google/gemma-3-1b-it`; no funciona con otras versiones, cuantizaciones agresivas ni fine-tunes que alteren las activaciones.
- Idiomas: el dataset Pile está dominado por inglés; las características pueden no capturar bien fenómenos en castellano u otros idiomas.
- Riesgo de interpretación errónea: las características de un SAE no son necesariamente monossémicas; pueden existir características polisémicas o muertas que induzcan a conclusiones incorrectas.
- Sin benchmarks: no hay métricas publicadas de fidelidad, escasez o interpretabilidad, por lo que su calidad relativa frente a otros SAEs es desconocida.
- Licencia MIT del SAE, pero el modelo base Gemma 3 está sujeto a los Gemma Terms of Use, que imponen restricciones adicionales al uso comercial y a la redistribución.
- No apto para producción como componente de generación: es una herramienta de análisis, no un modelo desplegable para tareas de usuario final.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/elrashid/sae-gemma-3-1b-it-topk-l13
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
- DOI asociado: 10.57967/hf/9443
