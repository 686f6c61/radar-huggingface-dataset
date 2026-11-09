# openbmb/MiniCPM5-1B-SFT

## Resumen

MiniCPM5-1B-SFT es un modelo de lenguaje causal denso de 1.080.632.832 parametros desarrollado por OpenBMB, el primer checkpoint de la serie MiniCPM5. Se trata de la version intermedia del pipeline de entrenamiento: el checkpoint que ha pasado por el ajuste supervisado (SFT) pero todavia no por las fases de aprendizaje por refuerzo (RL) ni de destilacion on-policy (OPD) que dan lugar al modelo final MiniCPM5-1B. Su publicacion separada permite a investigadores y desarrolladores partir de una base SFT limpia para sus propios procesos de alineamiento o experimentacion.

El modelo esta disenado para despliegue local y en dispositivo (edge), con un footprint reducido y soporte nativo de contexto largo de hasta 131.072 tokens. Emplea la arquitectura estandar `LlamaForCausalLM` con 24 capas y atencion GQA (16 cabezas de consulta, 2 de clave-valor), lo que reduce el coste de memoria en inferencia. Incorpora una plantilla de chat con modo de razonamiento hibrido conmutable mediante el parametro `enable_thinking`.

Su relevancia actual radica en que combina un tamano de 1B parametros con capacidades que tradicionalmente requerian modelos mayores: tool calling, generacion de codigo, razonamiento deliberado y contexto largo, todo bajo licencia Apache 2.0 y con formatos de despliegue para llama.cpp, Ollama, LM Studio y Apple Silicon (MLX).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (`LlamaForCausalLM`) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no aplica (modelo denso) |
| Parametros sin embeddings | 679.552.512 |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 (checkpoint publicado); GGUF y MLX 4-bit disponibles en repositorios derivados |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Capas | 24 |
| Cabezas de atencion | 16 (Q) / 2 (KV), GQA |
| Etapa de entrenamiento | SFT (sin RL ni OPD) |
| Tamano del repositorio | 2,2 GB |

## Arquitectura y entrenamiento

MiniCPM5-1B-SFT es un transformer causal denso de tipo Llama con 24 capas, atencion de consulta agrupada (GQA) con 16 cabezas de consulta y 2 de clave-valor, y 1.080.632.832 parametros totales, de los cuales 679.552.512 corresponden a pesos no-embedding. El contexto maximo es de 131.072 tokens. No emplea mezcla de expertos ni arquitecturas hibridas SSM: es un transformer convencional optimizado para eficiencia en inferencia.

El entrenamiento sigue la receta de gestion de datos por niveles UltraData de OpenBMB, estructurada en tres fases: preentrenamiento base (con fase de estabilidad y fase de decaimiento), mid-training para reforzar capacidades objetivo y adaptar la distribucion de datos, y post-entrenamiento. El corpus de preentrenamiento se publica como Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math. La fase de SFT que corresponde a este checkpoint utiliza 200.000 millones de tokens de SFT de razonamiento profundo y 200.000 millones de tokens de SFT de razonamiento hibrido, datos liberados como UltraData-SFT-2605. Esta version no incluye las fases posteriores de RL con profesores especializados (matematicas, codigo, QA de libro cerrado, escritura) ni la destilacion on-policy (OPD) que produce el checkpoint final MiniCPM5-1B.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento hibrido: plantilla de chat con etiquetas `<think>` y conmutacion mediante `enable_thinking`, permitiendo alternar entre modo asistente rapido y modo razonador deliberado con el mismo checkpoint.
- Tool calling / function calling nativo, orientado a flujos de agentes.
- Generacion de codigo y asistencia en tareas de programacion.
- Razonamiento matematico y resolucion de problemas de varios pasos.
- Soporte de contexto largo de hasta 131.072 tokens para conversaciones multi-turno y documentos extensos.
- Capacidades de agente con razonamiento multi-paso.
- Capacidades multilingues limitadas a ingles y chino.
- No dispone de vision ni audio segun la informacion disponible.

## Casos de uso

- Asistentes locales en dispositivo: el modelo cabe en equipos de consumo y puede ejecutarse con llama.cpp, Ollama o LM Studio en formato GGUF, lo que permite asistentes privados sin conexion a internet con contexto de hasta 131.072 tokens.
- Agentes de codigo en local: gracias al soporte de tool calling y generacion de codigo, puede integrarse en editores o pipelines de desarrollo que invoquen herramientas externas (compiladores, linters, APIs) sin enviar codigo a servicios en la nube.
- Automatizacion de atencion al cliente multi-turno: el contexto largo permite mantener historiales de conversacion extensos y documentacion de referencia en la misma ventana, en escenarios de habla inglesa o china.
- Razonamiento deliberado bajo demanda: con `enable_thinking` activado, sirve para tareas de analisis y resolucion de problemas donde se requiere una cadena de razonamiento explicita, y con el modo desactivado para respuestas rapidas de baja latencia.
- Base para fine-tuning e investigacion en alineamiento: al ser el checkpoint SFT previo a RL y OPD, es un punto de partida adecuado para experimentar con tecnicas de refuerzo o destilacion propias sin partir del modelo ya alineado.
- Procesamiento de documentos largos en local: resumen, extraccion y QA sobre textos de decenas de miles de tokens en entornos con restricciones de privacidad.
- Prototipado de aplicaciones edge: su tamano de 1B y las variantes MLX 4-bit para Apple Silicon facilitan el desarrollo en portatiles y dispositivos con recursos limitados.

## Benchmarks y rendimiento

La model card menciona comparaciones con LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, y afirma alcanzar SOTA open source en la clase 1B dentro de ese conjunto, con ventaja en uso de herramientas, generacion de codigo y razonamiento dificil. Sin embargo, los resultados numericos se presentan unicamente en imagenes (graficos de leaderboard y radar) y no se incluyen cifras textuales en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 2,2 GB para los pesos, mas memoria para cache KV; con contexto de 131.072 tokens la cache KV crece de forma significativa y puede requerir varios GB adicionales.
- VRAM estimada en cuantizacion 4-bit (GGUF/MLX): en torno a 0,6-0,8 GB para pesos, adecuada para GPUs de consumo y Apple Silicon.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 en contextos moderados; RTX 3060/4060 y superiores para uso comodo; A100/H100 no son necesarias para este tamano, aunque permiten mayor throughput por lotes.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090, y en Mac con Apple Silicon mediante MLX 4-bit.
- Opciones de despliegue: transformers, vLLM, TGI (tag `text-generation-inference`), llama.cpp, Ollama y LM Studio (via GGUF), MLX para Apple Silicon.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-SFT | 1,08B | 131.072 | Apache 2.0 | HF, ModelScope, GGUF, MLX | Checkpoint SFT sin RL/OPD |
| LFM2.5-1.2B-Thinking | ~1,2B | no disponible | no disponible | no disponible | Baseline citado por el autor |
| Qwen3-0.6B/think | ~0,6B | no disponible | no disponible | no disponible | Baseline citado por el autor |
| Qwen3.5-0.8B/think | ~0,8B | no disponible | no disponible | no disponible | Baseline citado por el autor |

Los datos de rendimiento comparativo se presentan solo en forma de graficos en la model card; no se dispone de cifras numericas textuales para completar la comparativa.

## Limitaciones y advertencias

- Al ser un checkpoint SFT previo a RL y OPD, su rendimiento en tareas de razonamiento y alineamiento es inferior al del modelo final MiniCPM5-1B; no debe evaluarse como equivalente al release completo.
- Soporte idiomatico limitado a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion inherente a modelos de 1B parametros, especialmente en tareas de conocimiento factual y QA de libro cerrado.
- Sesgos potenciales heredados de los corpus de preentrenamiento (Ultra-FineWeb y derivados), no documentados de forma especifica en la informacion disponible.
- El contexto de 131.072 tokens exige memoria considerable para la cache KV; en despliegues de consumo conviene limitar la longitud efectiva de contexto.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datasets de entrenamiento subyacentes si redistribuye derivados.
- No dispone de capacidades multimodales (vision o audio) segun la informacion disponible.
- Para produccion se recomienda usar el checkpoint final MiniCPM5-1B (con RL y OPD) en lugar de esta version SFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Modelo final: https://huggingface.co/openbmb/MiniCPM5-1B
- Checkpoint base: https://huggingface.co/openbmb/MiniCPM5-1B-Base
- GGUF: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- MLX 4-bit: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- ModelScope: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B-SFT
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- Documentacion MiniCPM (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
