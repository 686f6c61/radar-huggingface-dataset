# nightmedia/Qwen3.6-35B-A3B-Mirage-oQ6e-mtp

## Resumen

Qwen3.6-35B-A3B-Mirage-oQ6e-mtp es un modelo de lenguaje de tipo mixture-of-experts (MoE) publicado por el usuario nightmedia en Hugging Face. El identificador indica una arquitectura de 35 000 millones de parametros totales con aproximadamente 3 000 millones de parametros activos por token (patron A3B, habitual en la familia Qwen3-MoE), derivada de la familia Qwen3.5/Qwen3.6 y sometida a un proceso de destilacion, SFT con LoRA y ajuste de instrucciones. El sufijo "oQ6e" sugiere una cuantizacion orientada a 6 bits y "mtp" hace referencia a multi-token prediction (prediccion multi-token), una tecnica de decodificacion especulativa integrada en el entrenamiento.

El modelo se presenta como un "merge" experimental construido con mergekit a partir de multiples modelos base, entre ellos shunzou05/TerminalHorizon-35B-A3B, AllSpark-Research/Iris-mini, thomsonreuters/Thomson-1.0-Small, nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1, nightmedia/Qwen3.6-35B-A3B-FSM, Qwen/Qwen-AgentWorld-35B-A3B, orcarouter/Nex-N2.5-mini-Uncensored y Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated. La ficha declara capacidades de razonamiento con cadena de pensamiento larga (long-CoT), matematicas, STEM, programacion, investigacion, conversacion multilingue (en, zh, ja, es) y procesamiento image-text-to-text, ademas de un componente de humor y "fable" derivado de las variantes Fable del autor.

Es relevante ahora porque combina en un unico checkpoint varias tendencias activas del ecosistema open source: arquitecturas MoE eficientes en inferencia, decodificacion multi-token para acelerar la generacion, cuantizacion agresiva para despliegue en hardware modesto y fusion de modelos especializados (agentes, razonamiento, vision-lenguaje) mediante mergekit. El acceso esta restringido (gated) y requiere aceptar las condiciones en Hugging Face. No se han publicado resultados de benchmarks ni detalles completos de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, familia Qwen3.5/Qwen3.6, con multi-token prediction (mtp) |
| Parametros totales | 35B (aproximado, segun el identificador) |
| Parametros activos | 3B (aproximado, patron A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (orientada a 6 bits); variantes publicadas en mxfp4 y qx64 (MLX) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); variantes MLX (mxfp4, qx64) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas MoE, siguiendo el diseno de la familia Qwen3.5/Qwen3.6, con aproximadamente 35B parametros totales y 3B activos por token. El sufijo "mtp" indica que el modelo incorpora multi-token prediction, un esquema en el que la cabeza de salida predice varios tokens futuros simultaneamente, lo que permite decodificacion especulativa y acelera la generacion en inferencia. El checkpoint es el resultado de una fusion (merge) realizada con mergekit a partir de al menos ocho modelos base, combinando componentes de razonamiento, agentes, vision-lenguaje e instruction-tuning.

El proceso de entrenamiento declarado incluye destilacion (distillation), SFT con LoRA, ajuste de instrucciones y entrenamiento en cadenas de pensamiento largas (long-CoT). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplico RLHF o DPO. La ficha incluye etiquetas de "experimental", "merge" y "fable/humour", lo que sugiere un caracter exploratorio y una personalidad estilistica anadida, mas que un modelo de produccion validado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino, japones y espanol.
- Razonamiento explicito con cadena de pensamiento larga (long-CoT) y modo de "thinking".
- Resolucion de problemas matematicos y tareas STEM.
- Generacion y asistencia en programacion (coding).
- Procesamiento image-text-to-text (vision-lenguaje), segun el pipeline declarado.
- Capacidades orientadas a agentes y razonamiento multi-paso, heredadas de los modelos base AgentWorld.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible, aunque probable por herencia de los modelos AgentWorld.
- Estilo "fable" y componente de humor derivados de las variantes Fable del autor.
- Decodificacion multi-token (mtp) para acelerar la generacion.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas paso a paso con cadenas de pensamiento largas, util para tutoria automatica o generacion de soluciones explicadas en entornos educativos.
- Generacion de codigo en pipelines de desarrollo: por su entrenamiento en coding y su naturaleza MoE (3B activos), puede integrarse en asistentes de IDE o revision de codigo con coste de inferencia contenido.
- Analisis de documentos con imagenes: gracias al pipeline image-text-to-text, puede procesar capturas, diagramas o formularios junto a texto para extraer informacion estructurada.
- Agentes autonomos de multiples pasos: hereda capacidades de los modelos AgentWorld, lo que permite encadenar acciones y planificacion en tareas de automatizacion.
- Atencion al cliente multilingue: soporta en, zh, ja y es, adecuado para desplegar un unico modelo en mercados con esos idiomas.
- Prototipado rapido en hardware de consumo: las variantes cuantizadas (oQ6e, mxfp4, qx64 para MLX) permiten ejecutar el modelo en equipos con VRAM limitada o en Apple Silicon.
- Investigacion sobre fusion de modelos: sirve como caso de estudio de mergekit y de combinacion de especializaciones (razonamiento, agentes, vision) en un solo checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Para 35B parametros totales, una cuantizacion de 6 bits requeriria del orden de 26-30 GB solo para pesos, mas overhead de contexto y cache KV; las variantes mxfp4 (4 bits) reducirian los pesos a unos 18-20 GB. Estas cifras son estimaciones teoricas, no datos publicados.
- GPU recomendadas: no disponibles en la informacion. Por tamano, serian necesarias GPU con 24-48 GB de VRAM (A100 40/80 GB, H100, L40S, RTX 6000 Ada) para las variantes de 6 bits; las variantes de 4 bits podrian ajustarse en RTX 4090 (24 GB) con contexto limitado.
- Cabe en consumer GPU: probable en RTX 4090 o GPUs de 24 GB con cuantizacion de 4 bits y contexto reducido; no confirmado.
- Opciones de despliegue: transformers (libreria declarada); variantes MLX para Apple Silicon (mxfp4, qx64); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. La presencia de multi-token prediction (mtp) sugiere una aceleracion de decodificacion respecto a un modelo equivalente sin mtp, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage-oQ6e-mtp | 35B | 3B | no disponible | apache-2.0 | gated en Hugging Face |
| Qwen/Qwen-AgentWorld-35B-A3B (base) | 35B | 3B | no disponible | no disponible | publico |
| Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated | 35B | 3B | no disponible | no disponible | publico |
| shunzou05/TerminalHorizon-35B-A3B | 35B | 3B | no disponible | no disponible | publico |

Los modelos comparables pertenecen a la misma familia de 35B-A3B y forman parte de los modelos base declarados. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo experimental y de fusion: al ser un merge de ocho checkpoints, puede presentar comportamientos inconsistentes o degradacion en algunas tareas frente a sus componentes individuales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad; un modelo destilado y fusionado sin validacion publica requiere verificacion humana en produccion.
- Ausencia de benchmarks: no hay datos verificables de MMLU, HumanEval, GSM8K ni similares, lo que impide estimar su calidad real.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de su descarga.
- Idiomas limitados a en, zh, ja y es; no se declara soporte para otros idiomas.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en conversaciones o documentos largos.
- Componente "fable/humour" y herencia de un modelo "uncensored": puede producir respuestas con sesgos o estilos no apropiados para entornos corporativos.
- Licencia apache-2.0 declarada, pero conviene verificar las licencias de los modelos base del merge antes de uso comercial, ya que algunas variantes derivadas pueden arrastrar restricciones adicionales.
- Fecha de creacion futura (2026-11-07) y cero descargas: no hay evidencia de uso comunitario ni validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-oQ6e-mtp
- Variante MLX mxfp4: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-mxfp4-mlx
- Variante MLX qx64: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage-qx64-hi-mlx
- Modelo base Qwen/Qwen-AgentWorld-35B-A3B: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo base nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Fable-Holo3.1
- Modelo base nightmedia/Qwen3.6-35B-A3B-FSM: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-FSM
- Modelo base AllSpark-Research/Iris-mini: https://huggingface.co/AllSpark-Research/Iris-mini
- Modelo base shunzou05/TerminalHorizon-35B-A3B: https://huggingface.co/shunzou05/TerminalHorizon-35B-A3B
- Modelo base thomsonreuters/Thomson-1.0-Small: https://huggingface.co/thomsonreuters/Thomson-1.0-Small
- Modelo base orcarouter/Nex-N2.5-mini-Uncensored: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Modelo base Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated: https://huggingface.co/Jiunsong/SuperQwen-AgentWorld-35B-A3B-abliterated
