# liodon-ai/UserLM-2.0-GGUF

## Resumen

UserLM-2.0-GGUF es la distribucion cuantizada en formato GGUF del modelo microsoft/UserLM-2.0, un modelo de lenguaje de 8.030.277.696 parametros (aproximadamente 8B) construido sobre la arquitectura de Llama 3.1 8B Instruct, segun los metadatos del repositorio. La publicacion corre a cargo de Liodon AI, un tercero que no es el autor original del modelo, y su funcion es exclusivamente la conversion y empaquetado de los pesos en cuantizaciones listas para motores de inferencia local como llama.cpp, Ollama, LM Studio o Jan.

El interes practico de esta ficha reside en que permite ejecutar un modelo de 8B en hardware de consumo mediante cuantizaciones que van de 3,18 GB (Q2_K) a 8,54 GB (Q8_0), con un punto dulce recomendado por el autor en Q4_K_M (4,92 GB, ~6 GB de VRAM estimada). El repositorio ocupa 37,6 GB en total porque incluye todas las variantes de cuantizacion en un unico paquete.

No se dispone de informacion publicada sobre la composicion del dataset de entrenamiento, el proceso de alineacion ni los resultados de benchmarks del modelo original, por lo que los apartados correspondientes se marcan como no disponibles. La licencia declarada es "other", lo que obliga a consultar los terminos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B Instruct, segun tags del repo) |
| Parametros totales | 8.030.277.696 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (existe ademas un repo con cuantizaciones iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (pesos originales del modelo base en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que el modelo base microsoft/UserLM-2.0 se apoya en la arquitectura de Llama 3.1 8B Instruct, un transformer decoder-only con 8.030.277.696 parametros. No se han publicado en la informacion proporcionada detalles sobre el numero de tokens de entrenamiento, la composicion del corpus, el uso de RLHF o DPO, ni innovaciones tecnicas especificas del modelo original.

El trabajo de esta publicacion es la conversion a GGUF y la generacion de cuantizaciones K-quant estandar mediante las herramientas de llama.cpp. El autor menciona ademas una variante con calibracion iMatrix para las cuantizaciones por debajo de 4 bits, publicada en un repositorio separado (liodon-ai/UserLM-2.0-imatrix-GGUF), orientada a mejorar la calidad de los formatos de 2 y 3 bits.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" indica un ajuste orientado a dialogo.
- Ejecucion local en CPU y GPU mediante llama.cpp, Ollama, LM Studio y Jan, segun las instrucciones del autor.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integracion con infraestructura de inferencia compatible con la API de HuggingFace.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU dedicada: con Q4_K_M (4,92 GB) el modelo puede ejecutarse en CPU con llama.cpp, lo que permite prototipar asistentes conversacionales en portatiles convencionales.
- Prototipado rapido de chatbots: la integracion con Ollama mediante `ollama run hf.co/liodon-ai/UserLM-2.0-GGUF:Q4_K_M` reduce el tiempo de puesta en marcha a un solo comando, adecuado para validar flujos conversacionales antes de migrar a un modelo mayor.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye siete variantes, lo que permite medir la degradacion de calidad entre Q2_K y Q8_0 sobre el mismo modelo base en tareas concretas del dominio propio.
- Inferencia en GPUs de consumo de 8 GB: Q3_K_M (4,02 GB, ~5 GB de VRAM) y Q4_K_M caben en tarjetas como la RTX 3060 Ti o la RTX 4060, habilitando pruebas de generacion de texto en local.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local, los datos conversacionales no salen de la maquina, lo que encaja en escenarios con datos sensibles donde no se permite llamar a APIs externas.
- Integracion en aplicaciones de escritorio: LM Studio y Jan permiten cargar el GGUF como backend de asistentes integrados en el sistema operativo sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (datos del autor): Q2_K ~4 GB, Q3_K_M ~5 GB, Q4_0 ~5 GB, Q4_K_M ~6 GB, Q5_K_M ~7 GB, Q6_K ~8 GB, Q8_0 ~10 GB.
- Cabe en GPUs de consumo: Q3_K_M y Q4_K_M en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070); Q6_K en 8-10 GB con margen ajustado; Q8_0 requiere 10 GB o mas (RTX 3080 10 GB, RTX 4070 Ti, RTX 4080).
- GPUs de datacenter: A100, H100 y L40S pueden ejecutar cualquier cuantizacion del repositorio con holgura; para maximizar calidad se usaria Q8_0 o los pesos safetensors originales.
- Opciones de despliegue: llama.cpp (`llama-cli -hf liodon-ai/UserLM-2.0-GGUF:Q4_K_M`), Ollama, LM Studio, Jan. vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UserLM-2.0-GGUF (esta ficha) | ~8B | no disponible | other | GGUF (7 cuants) | Cuantizado por Liodon AI sobre microsoft/UserLM-2.0 |
| microsoft/UserLM-2.0 | ~8B | no disponible | other | safetensors | Modelo base original; misma arquitectura |
| meta-llama/Llama-3.1-8B-Instruct | ~8B | no disponible en esta ficha | Llama 3.1 Community License | safetensors, GGUF (terceros) | Ancestro arquitectonico declarado en los tags |

No se dispone de datos de rendimiento que permitan comparar calidad entre estas opciones; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- La licencia "other" no especifica terminos; es imprescindible revisar la licencia de microsoft/UserLM-2.0 y, por herencia, la de meta-llama/Llama-3.1-8B-Instruct antes de un uso comercial.
- El repositorio no declara idiomas soportados, por lo que no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles.
- No se han publicado benchmarks ni evaluaciones de sesgo del modelo original en la informacion disponible; el riesgo de alucinacion es desconocido y debe evaluarse empiricamente.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_M) degradan la calidad de forma apreciable; el autor recomienda Q4_K_M como punto de equilibrio.
- El modelo es una cuantizacion de terceros: no hay garantia de fidelidad respecto a los pesos originales ni soporte oficial de Microsoft o de Liodon AI.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La longitud de contexto no esta documentada; asumir la ventana de Llama 3.1 8B sin verificacion puede provocar fallos en prompts largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/liodon-ai/UserLM-2.0-GGUF
- Modelo base: https://huggingface.co/microsoft/UserLM-2.0
- Cuantizaciones iMatrix: https://huggingface.co/liodon-ai/UserLM-2.0-imatrix-GGUF
- Perfil del autor de la cuantizacion: https://huggingface.co/liodon-ai
- Modelo ancestro arquitectonico: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
