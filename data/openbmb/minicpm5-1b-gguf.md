# openbmb/MiniCPM5-1B-GGUF

## Resumen

MiniCPM5-1B es un modelo de lenguaje causal denso de aproximadamente 1.080 millones de parametros desarrollado por OpenBMB (Tsinghua University / ModelBest), primer checkpoint de la serie MiniCPM5. Esta disenado especificamente para despliegue local y en dispositivo (edge AI), con un footprint reducido pero con soporte nativo de contexto largo de 131.072 tokens y modos de razonamiento Think / No Think conmutables mediante el mismo checkpoint. Su arquitectura es un transformer estandar `LlamaForCausalLM` de 24 capas con atencion GQA (16 cabezas de query, 2 de key/value).

El modelo aborda el problema de disponer de un asistente local capaz de gestionar tool calling, generacion de codigo y razonamiento deliberado sin depender de la nube. Segun el autor, alcanza SOTA en la clase 1B dentro del conjunto de comparacion elegido (LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think), con ventaja mas marcada en uso de herramientas, generacion de codigo y razonamiento dificil.

La version aqui descrita es el repositorio GGUF (`MiniCPM5-1B-GGUF`), pensado para llama.cpp, Ollama y LM Studio. La publicacion incluye tambien los checkpoints BF16 final (post-entrenado con RL + OPD), SFT-only, Base y MLX 4-bit para Apple Silicon, ademas de los datasets de entrenamiento liberados (Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math y UltraData-SFT-2605).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `LlamaForCausalLM` |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no aplica (modelo denso) |
| Parametros sin embeddings | 679.552.512 |
| Capas | 24 |
| Cabezas de atencion | 16 Q / 2 KV (GQA) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF (repo de 4,0 GB); variantes concretas no detalladas en la informacion disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); BF16 y MLX 4-bit en repositorios hermanos |
| Pipeline | text-generation |
| Libreria | llama.cpp |

## Arquitectura y entrenamiento

MiniCPM5-1B es un transformer causal denso con 24 capas y atencion con query grouping (GQA) de 16 cabezas de query y 2 de key/value, lo que reduce el coste de KV cache en contextos largos. De los 1.080 millones de parametros totales, 679,5 millones son no-embedding, lo que indica un peso considerable de la matriz de embeddings (coherente con un vocabulario amplio y soporte bilingue en/zh). El contexto nativo es de 131.072 tokens.

El entrenamiento sigue la receta de gestion de datos por niveles UltraData, en tres fases. En la fase base se realiza entrenamiento estable seguido de decay training; despues, una fase de mid-training para reforzar capacidades objetivo y adaptar la distribucion de datos; y finalmente post-entrenamiento en tres pasos: SFT con 200.000 millones de tokens de SFT de razonamiento profundo y otros 200.000 millones de SFT de razonamiento hibrido, seguido de entrenamiento de profesores RL especializados en matematicas, codigo, QA a libro cerrado y escritura, y destilacion on-policy (OPD) de esos profesores en un unico modelo de publicacion. Los corpus empleados (Ultra-FineWeb, Ultra-FineWeb-L3, UltraData-Math y UltraData-SFT-2605) se publican junto al modelo. La innovacion destacable es la convivencia de modos Think / No Think en el mismo checkpoint mediante la plantilla de chat `<think>` y el flag `enable_thinking`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento deliberado con modo thinking conmutable (`enable_thinking`); el mismo checkpoint actua como asistente rapido o razonador pausado.
- Tool calling / function calling nativo, orientado a flujos de agentes.
- Razonamiento multi-paso y uso de agentes, con ventaja declarada por el autor en esta area frente a modelos del mismo tamano.
- Generacion de codigo y tareas de programacion dentro de pipelines de agentes.
- Razonamiento matematico (profesores RL especificos de matematicas en el post-entrenamiento).
- Contexto largo de 131.072 tokens para documentos extensos y conversaciones prolongadas.
- Despliegue en dispositivo y entornos con recursos limitados (edge AI).
- Sin capacidades de vision ni audio declaradas en la informacion disponible.

## Casos de uso

- Asistente local de escritorio: el modelo puede ejecutarse en local mediante llama.cpp u Ollama y gestionar conversaciones multi-turno con memoria de hasta 131.072 tokens, sin enviar datos a la nube; encaja en aplicaciones tipo "desktop pet" como la referenciada por el autor.
- Agente de codigo en el IDE: con tool calling nativo y modo thinking, puede invocar herramientas (lectura de ficheros, ejecucion de tests) y razonar sobre errores en varios pasos, con una huella de 1B parametros que permite ejecutarlo junto al editor.
- Automatizacion de atencion al cliente en el borde: despliegue en dispositivos o servidores modestos para conversaciones multi-turno en ingles y chino, aprovechando el contexto largo para arrastrar historial e informacion de cuenta.
- Procesamiento de documentos largos en local: resumen, extraccion y QA sobre contratos, informes o expedientes de hasta 131.072 tokens sin salir del dispositivo, util en entornos con requisitos de privacidad.
- Razonamiento matematico asistido: resolucion de problemas paso a paso activando el modo thinking, adecuado para herramientas educativas o de verificacion de calculos.
- Prototipado rapido de pipelines de agentes: al ser Apache 2.0 y estar disponible en GGUF, sirve como modelo de referencia barato para validar arquitecturas de tool use antes de escalar a modelos mayores.
- Fine-tuning especializado: los checkpoints Base y SFT-only permiten adaptar el modelo a dominios concretos con coste de computo reducido, y la receta y datasets estan publicados.

## Benchmarks y rendimiento

El autor publica graficas comparativas (radar por dominio y leaderboard publico) frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, afirmando SOTA en la clase 1B dentro de ese conjunto. Sin embargo, en la informacion proporcionada no se incluyen valores numericos de benchmarks (MMLU, HumanEval, GSM8K u otros), por lo que no se presentan cifras.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 1.080 millones de parametros, las cuantizaciones GGUF de 4 bits deberian situarse en torno a 1 GB o menos de pesos, y las de 8 bits en torno a 1,1-1,2 GB, mas la KV cache del contexto utilizado.
- GPU recomendadas: no indicadas por el autor; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante, RTX 4090) es sobradamente suficiente, y el modelo esta pensado tambien para CPU y dispositivos de borde.
- Cabe en GPU consumer: si, con amplio margen; tambien en Apple Silicon mediante el repositorio MLX 4-bit.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (formatos GGUF); MLX para Apple Silicon; el repositorio incluye cookbooks y Agent Skills para los principales backends de inferencia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B | 1,08 B (denso) | 131.072 | Apache 2.0 | HF, ModelScope, GGUF, MLX | Modos Think / No Think, tool calling |
| LFM2.5-1.2B-Thinking | 1,2 B (no confirmado) | no disponible | no disponible | no disponible | Baseline de comparacion citado por el autor |
| Qwen3-0.6B | 0,6 B (no confirmado) | no disponible | no disponible | no disponible | Baseline de comparacion citado por el autor |
| Qwen3.5-0.8B | 0,8 B (no confirmado) | no disponible | no disponible | no disponible | Baseline de comparacion citado por el autor |

Los datos de los modelos alternativos no se detallan en la informacion proporcionada; solo se citan como baselines de comparacion en la model card. El autor afirma que MiniCPM5-1B alcanza SOTA dentro de ese conjunto, con ventaja en tool use, codigo y razonamiento dificil, pero no se aportan cifras numericas para verificar la comparacion.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: como todo modelo generativo de 1B parametros, puede producir contenido factualmente incorrecto, especialmente en modo No Think y en dominios fuera de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los datasets de preentrenamiento web (Ultra-FineWeb) pueden introducir sesgos no mitigados explicitamente.
- Contexto: aunque soporta 131.072 tokens, el rendimiento efectivo en contextos muy largos no esta cuantificado en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets derivados si se reutilizan para fine-tuning.
- Produccion: el modelo es de clase 1B; para tareas de alta exigencia (razonamiento complejo, codigo de produccion critico) puede requerir verificacion humana o el uso de modelos mayores.
- Cuantizaciones: el repositorio GGUF ocupa 4,0 GB e incluye varias variantes; no se detalla en la informacion disponible que niveles de cuantizacion exactos estan incluidos ni su impacto en calidad.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Hugging Face (BF16 final): https://huggingface.co/openbmb/MiniCPM5-1B
- Hugging Face (SFT-only): https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Hugging Face (Base): https://huggingface.co/openbmb/MiniCPM5-1B-Base
- Hugging Face (MLX 4-bit): https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- ModelScope (GGUF): https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B-GGUF
- GitHub: https://github.com/OpenBMB/MiniCPM
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- MiniCPM Wiki (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
- MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Paper MiniCPM Tech Report: https://arxiv.org/pdf/2506.07900
- Paper UltraData Tiered Data Management: https://arxiv.org/pdf/2602.09003
- Paper (referencia adicional): https://arxiv.org/abs/2512.16649
- Paper (referencia adicional): https://arxiv.org/abs/2604.13016
