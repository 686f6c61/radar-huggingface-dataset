# ReliquaryForge/teutonic-rl-async-v1-step-00000120

## Resumen

Teutonic-I Reliquary SFT (identificador `ReliquaryForge/teutonic-rl-async-v1-step-00000120`) es un modelo de lenguaje de 8.953.803.264 parametros (8,6B segun la model card) derivado de `dendriteholdings/Teutonic-I`, el modelo producido por la competicion abierta de mejora de modelos de Teutonic en la Subnet 3 de Bittensor. Reliquary (Subnet 81 de Bittensor) ha aplicado un post-entrenamiento de destilacion supervisada a partir de un profesor `Qwen3.8-27B`, incorporando modo de razonamiento (thinking mode), sobre una arquitectura hibrida que combina capas gated-DeltaNet con atencion softmax completa.

El modelo resuelve el problema de obtener un modelo de ~9B con capacidades de razonamiento y agenticas a partir de un checkpoint preentrenado de forma descentralizada, sin depender de un preentrenamiento propietario. Tecnicamente es relevante porque conserva el vocabulario amplio de 248.320 tokens y una ventana de entrenamiento de 64k tokens, y porque el injerto de atencion lo convierte en un `Qwen3_5ForCausalLM` estandar, lo que facilita su despliegue con las herramientas habituales de transformers, vLLM o llama.cpp.

La publicacion es un checkpoint intermedio (`step-00000120`) de un pipeline de RL asincrono, con solo 26 descargas y sin likes en el momento de la consulta, lo que sugiere un estado experimental. La licencia Apache-2.0 y la compatibilidad con endpoints lo hacen directamente utilizable, pero conviene tratarlo como un artefacto de investigacion mas que como un modelo de produccion consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` hibrida: 32 capas (24 gated-DeltaNet + 8 atencion softmax completa) |
| Parametros totales | 8.953.803.264 (8,6B segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens (entrenado a 64k) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido de 32 capas en el que 24 capas usan gated-DeltaNet (un mecanismo de mezcla de tokens con estado recurrente lineal) y 8 capas usan atencion softmax completa. El linaje es poco habitual: el checkpoint original de Teutonic-I tenia 8 mezcladores de tokens GLA en las capas 3, 7, ..., 31, que fueron sustituidos por la atencion softmax de `Qwen/Qwen3.5-9B-Base` y posteriormente "curados" entrenando solo esas capas sobre 50M tokens de texto plano. El resto de componentes (embeddings, MLPs y las 24 capas gated-DeltaNet) procede de Teutonic-I. El vocabulario es de 248.320 tokens y los pesos estan en bfloat16.

El post-entrenamiento realizado por Reliquary consta de dos fases. Primero, una epoca sobre la mezcla `full-v2` con 4,47B tokens objetivo (matematicas 38 %, codigo 25 %, ciencia 14 %, general 11 %, agentico 8,4 %) con learning rate 4e-5 y scheduler coseno. Despues, una pasada sobre 7.659 ejemplos de QA de documentos largos (documentos de 16k a 57k tokens, con preguntas y respuestas generadas por el profesor) mas 56M tokens de replay de `full-v2`, con learning rate 1e-5. La destilacion se realiza desde `Qwen3.8-27B` e incluye modo de razonamiento (thinking mode); la plantilla de chat esta incluida en el repositorio.

## Capacidades

- Generacion de texto conversacional con soporte de modo de razonamiento (thinking mode) heredado de la destilacion del profesor.
- Razonamiento matematico, reforzado por el 38 % de la mezcla de entrenamiento dedicada a matematicas.
- Generacion y comprension de codigo, con un 25 % del dataset de SFT orientado a codigo.
- Razonamiento cientifico, con un 14 % de la mezcla dedicada a ciencia.
- Capacidades agenticas: el 8,4 % del dataset es de naturaleza agentica y las etiquetas del modelo incluyen `agentic`.
- Procesamiento de documentos largos: entrenado especificamente con ejemplos de QA sobre documentos de 16k a 57k tokens.
- Contexto largo de hasta 64k tokens.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- Capacidades multilingues: no disponible (no se especifican idiomas en la model card).

## Casos de uso

- **Atencion al cliente automatizada sobre documentacion extensa**: el modelo puede gestionar conversaciones multi-turno con hasta 64k tokens de contexto, lo que permite inyectar manuales, historiales de tickets y politicas internas en un unico prompt sin fragmentacion.
- **Analisis de contratos y documentos legales largos**: los 7.659 ejemplos de QA sobre documentos de 16k a 57k tokens del entrenamiento lo hacen adecuado para extraer respuestas y resumenes de expedientes completos, con preguntas formuladas en lenguaje natural.
- **Asistente de codigo en pipelines de CI/CD**: el 25 % de la mezcla de codigo y la compatibilidad con endpoints permiten integrarlo en revisiones automaticas de pull requests, generacion de tests y explicacion de errores de compilacion.
- **Tutoria matematica paso a paso**: el modo de razonamiento y el 38 % de entrenamiento en matematicas lo orientan a resolver problemas con traza explicita, util en plataformas educativas que necesitan mostrar el razonamiento intermedio.
- **Agentes de investigacion multi-paso**: las capacidades agenticas y el contexto largo permiten construir agentes que leen multiples fuentes, mantienen estado y encadenan llamadas a herramientas a lo largo de sesiones extensas.
- **Procesamiento por lotes de informes cientificos**: el 14 % de ciencia en el SFT y el contexto de 64k permiten resumir y comparar articulos o informes tecnicos de decenas de miles de tokens en un solo paso.
- **Evaluacion de checkpoints en pipelines de RL descentralizado**: al ser un checkpoint intermedio (`step-00000120`) de un pipeline de RL asincrono en Bittensor, sirve como referencia para comparar la evolucion del entrenamiento dentro de la Subnet 81.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos (8,95B parametros x 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomiendan 24 GB o mas.
- En cuantizacion de 8 bits: alrededor de 9-10 GB de pesos, viable en GPUs de 16 GB con contexto moderado.
- En cuantizacion de 4 bits: alrededor de 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB, aunque el contexto de 64k exige reservar VRAM adicional para la cache.
- GPUs recomendadas: A100 40/80 GB o H100 para contexto completo de 64k y throughput alto; RTX 4090 (24 GB) para bfloat16 con contexto reducido; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 8 y 4 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servidores; llama.cpp y Ollama para cuantizaciones GGUF, siempre que la arquitectura hibrida `Qwen3_5ForCausalLM` este soportada por la version correspondiente.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Teutonic-I Reliquary SFT (este) | 8,95B | 64k | Hibrida (gated-DeltaNet + softmax) | Apache-2.0 | HuggingFace, 26 descargas |
| Qwen/Qwen3.5-9B-Base | ~9B | no disponible | Transformer denso | no disponible | HuggingFace |
| dendriteholdings/Teutonic-I | no disponible | no disponible | Hibrida con GLA | Apache-2.0 | HuggingFace |
| Qwen3.8-27B (profesor) | ~27B | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas de la misma categoria es limitada porque no se han publicado resultados de benchmarks para este checkpoint ni datos completos de los modelos de referencia en la informacion disponible. Frente a `Qwen3.5-9B-Base`, este modelo anade post-entrenamiento con destilacion y modo de razonamiento, a costa de ser un artefacto experimental con muy poca adopcion. Frente a su profesor `Qwen3.8-27B`, ofrece un tamano tres veces menor con la expectativa de conservar parte de las capacidades destiladas, aunque sin datos que lo confirmen.

## Limitaciones y advertencias

- Es un checkpoint intermedio (`step-00000120`) de un pipeline de RL asincrono, no una version final; su calidad puede ser inferior a la de un modelo completamente entrenado.
- Adopcion practicamente nula (26 descargas, 0 likes) y sin benchmarks publicados: no hay evidencia independiente de su rendimiento.
- La model card no especifica los idiomas soportados, por lo que el comportamiento multilingue es incierto y podria estar sesgado hacia el ingles.
- Riesgo de alucinacion inherente a un modelo destilado de 9B, especialmente en dominios fuera de la mezcla de entrenamiento (matematicas, codigo, ciencia, general y agentico).
- El injerto de atencion y el "healing" con solo 50M tokens de texto plano pueden introducir inconsistencias en las capas sustituidas respecto al comportamiento original de Teutonic-I.
- La destilacion desde un profesor de 27B puede transferir sesgos y errores del profesor, no documentados en la model card.
- Aunque la licencia es Apache-2.0, el modelo modifica dos modelos base (`dendriteholdings/Teutonic-I` y `Qwen/Qwen3.5-9B-Base`); conviene verificar las condiciones de ambos linajes antes de un uso comercial.
- El contexto de 64k incrementa notablemente los requisitos de VRAM y la latencia; en GPUs consumer habra que reducir la ventana o cuantizar.
- No se documentan evaluaciones de seguridad, filtros de contenido ni mitigaciones de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReliquaryForge/teutonic-rl-async-v1-step-00000120
- Modelo base preentrenado: https://huggingface.co/dendriteholdings/Teutonic-I
- Modelo base de atencion: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios ni demos adicionales.
