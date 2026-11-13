# pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF

## Resumen

Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF es la distribucion en formato GGUF del modelo fusionado homonimo publicado por el usuario pragmaticcs. Se trata de un modelo denso de 8.953.803.264 parametros (8,8B en el backbone de texto) construido sobre Qwen 3.5 9B mediante una fusion de tres fine-tunes especializados: Qwopus3.5-9B-Coder (precision sintactica y algoritmica), Ornith-1.5-9B (disciplina de terminacion de bucles y recuperacion de errores en flujos agenticos) y MiMo-V2.6-Distill-Qwen-9B (descomposicion de problemas tipo SWE-bench y tool calling multi-turno). El objetivo declarado es cubrir el hueco de los modelos de codigo por debajo de 10B que fallan en flujos agenticos reales.

La relevancia tecnica del modelo esta en su arquitectura: no es un transformer denso clasico, sino un hibrido con Gated DeltaNet en proporcion 3:1 (24 capas de atencion lineal y 8 de atencion completa, en las capas 3, 7, 11, 15, 19, 23, 27 y 31), con una ventana de contexto nativa de 262.144 tokens (256k). Esa combinacion de atencion lineal mayoritaria con contexto de 256k es poco habitual en el segmento sub-10B y reduce el coste de atencion en secuencias largas.

Esta publicacion concreta es un repositorio de cuantizaciones GGUF (estaticas y con importance matrix) para llama.cpp, con 27,9 GB de repo y licencia Apache 2.0. Los pesos originales en safetensors residen en el repositorio base del mismo autor. El modelo esta etiquetado para generacion de texto, codigo y uso agentico, con soporte declarado de ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense causal LM (`qwen3_5_text`) con atencion hibrida Gated DeltaNet 3:1 |
| Parametros totales | 8.953.803.264 (8,8B en backbone de texto) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | GGUF estaticas e importance-matrix (imatrix); niveles concretos no disponibles |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); safetensors en el modelo base |
| Dimension oculta (d_model) | 4096 |
| Dimension intermedia (d_mlp) | 12288 (SwiGLU) |
| Capas del decodificador | 32 |
| Capas de atencion completa | 8 (capas 3, 7, 11, 15, 19, 23, 27, 31) |
| Cabezas de atencion lineal | 16 key / 32 value (d_k = d_v = 128) |
| Cabezas de atencion completa | 16 query / 4 key-value (GQA, d_h = 256) |
| RoPE | 1D partial RoPE (theta = 10^7, factor = 0,25) |
| Precision nativa | bfloat16 |
| Tamano del repositorio | 27,9 GB |
| Descargas | 1445 |
| Likes | 5 |

## Arquitectura y entrenamiento

El backbone es Qwen 3.5 9B en su variante de texto, un transformer causal denso de 32 capas con d_model de 4096 y MLP SwiGLU de 12288. La innovacion estructural es la atencion hibrida Gated DeltaNet: 24 de las 32 capas usan atencion lineal con estado recurrente (16 cabezas key y 32 value, d_k = d_v = 128) y solo 8 capas emplean atencion completa con GQA (16 cabezas query y 4 key-value, d_h = 256). El RoPE es parcial 1D con theta de 10^7 y factor 0,25, lo que sostiene la ventana de 262.144 tokens. La precision nativa es bfloat16.

El entrenamiento del modelo final no es un entrenamiento desde cero, sino una fusion de task vectors con la metodologia TIES-DELLA, que combina poda de saliencia, eleccion de signo por consenso, estabilizacion de norma especifica para Gated DeltaNet y modulacion sinusoidal continua por profundidad. Sobre el ancla Qwen 3.5 9B se aplican tres donantes con pesos estratificados por capa: Qwopus3.5-9B-Coder (destilacion de Claude 3.5 Opus; tipado, sintaxis y algoritmos) en las capas bajas (x <= 0,35); Ornith-1.5-9B (RL agentico; terminacion de bucles y pivote ante errores) en las capas medias (0,35 < x < 0,70); y MiMo-V2.6-Distill-Qwen-9B (SFT sobre 77,4B tokens; SWE-bench Pro y logica de herramientas multi-turno) en las capas altas (x >= 0,70). No se detalla en la informacion disponible el volumen total de tokens de la fusion ni si hubo una fase adicional de RLHF o DPO sobre el merge.

## Capacidades

- Generacion de codigo con enfasis en sintaxis, tipado y algoritmos, heredado del donante Qwopus.
- Razonamiento agentico multi-paso: descomposicion de problemas tipo SWE-bench y logica de tool calling multi-turno.
- Tool calling / function calling, segun la especializacion declarada del donante MiMo-V2.6.
- Disciplina de terminacion de bucles y recuperacion ante fallos de comandos de shell, orientada a evitar bucles infinitos en entornos agenticos.
- Contexto largo nativo de 256k tokens, adecuado para repositorios completos o historiales de conversacion extensos.
- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Capacidades multilingues limitadas a ingles y chino.

## Casos de uso

- Agentes de codificacion sobre repositorios: con 256k tokens de contexto puede ingerir arboles de ficheros y varios modulos a la vez, y la disciplina de terminacion del donante Ornith reduce los bucles cuando un comando de shell falla en un pipeline de CI/CD.
- Automatizacion de tareas SWE-bench-style: el modelo esta disenado para descomponer issues en pasos y emitir parches, por lo que encaja en flujos de resolucion automatica de tickets de GitHub con validacion por tests.
- Asistente de terminal y DevOps: el soporte de tool calling permite encadenar llamadas a comandos, leer la salida y pivotar ante errores, con un coste de atencion bajo gracias a las capas DeltaNet.
- Generacion de codigo en produccion con llama.cpp: al distribuirse en GGUF, puede servirse en infraestructura sin GPU dedicada de gran tamano y con cuantizaciones imatrix para preservar calidad en los pesos mas sensibles.
- Revision de codigo con contexto largo: analisis de diffs extensos o de un monorepo parcial dentro de la ventana de 256k, con salida en ingles o chino.
- Agentes conversacionales tecnicos multi-turno: su naturaleza conversacional y la recuperacion de errores lo hacen apto para atencion a desarrolladores en soporte de API, aunque limitado a en/zh.
- Prototipado local en estaciones de trabajo: al ser un 9B denso, cabe en GPU de consumo en cuantizaciones bajas, lo que permite iterar en local antes de desplegar en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni SWE-bench para el modelo fusionado; solo menciona las especializaciones de los donantes (por ejemplo, los 77,4B tokens de SFT de MiMo-V2.6 y su enfoque en SWE-bench Pro), sin cifras atribuidas al merge.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud para un denso de 8,8B, las cuantizaciones de 4 bits suelen requerir del orden de 5-6 GB de pesos, y las de 8 bits en torno a 9-10 GB, a lo que hay que sumar la cache KV. Las capas de atencion lineal reducen el coste de cache frente a un transformer denso equivalente, pero no se publican cifras concretas.
- GPU recomendadas: no especificadas por el autor. Por tamano, es apto para RTX 4090, RTX 3090 y GPUs de 16-24 GB en cuantizaciones de 4-8 bits; para contexto completo de 256k se necesitaria VRAM adicional para el estado de atencion.
- GPU de consumo: si, el modelo esta descrito como ejecutable comodamente en GPUs de consumo; no se detalla que modelos exactos.
- Opciones de despliegue: llama.cpp (formato nativo del repo), y por extension los runners compatibles con GGUF como Ollama o LM Studio; el repositorio incluye la etiqueta `endpoints_compatible`. No se confirma soporte de vLLM o TGI para esta variante GGUF.
- Latencia y throughput: no disponibles. El autor afirma que es "blisteringly fast", pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Triumvirate-Qwopus-MiMo-Ornith-9B-Coder (este) | 8,8B denso | 256k | Hibrida Gated DeltaNet 3:1 | Apache 2.0 | Fusion TIES-DELLA de tres fine-tunes de Qwen 3.5 9B; solo en/zh |
| Qwen/Qwen3.5-9B (base) | 9B denso | no disponible en la informacion | Qwen 3.5 densa | no disponible en la informacion | Ancla estructural del merge; sin especializacion agentica declarada |
| Jackrong/Qwopus3.5-9B-Coder | 9B denso | no disponible en la informacion | Qwen 3.5 densa | no disponible en la informacion | Donante 1: sintaxis y algoritmos por destilacion de Claude 3.5 Opus |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | 9B denso | no disponible en la informacion | Qwen 3.5 densa | no disponible en la informacion | Donante 3: SFT de 77,4B tokens, SWE-bench Pro y tool logic |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni evaluado.
- Alucinacion: al ser un merge de fine-tunes de codigo, puede generar APIs o firmas de funciones inexistentes; la model card no reporta evaluaciones de fidelidad.
- Naturaleza del modelo: es una fusion de pesos, no un entrenamiento con datos nuevos; los sesgos de los donantes (incluida la destilacion de Claude 3.5 Opus en Qwopus) se heredan sin control adicional documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que supere a sus donantes o a la base en tareas agenticas; las afirmaciones de la model card son cualitativas.
- Contexto largo: aunque la ventana nativa es de 256k, no se documenta la degradacion de calidad en longitudes cercanas al maximo.
- Cuantizaciones: el repositorio no detalla que niveles GGUF incluye ni sus tamanos por fichero, lo que dificulta planificar el despliegue; el repo completo ocupa 27,9 GB.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos donantes y de la base Qwen 3.5, no detalladas en esta ficha.
- Modelo de nicho: 5 likes y 1445 descargas, con autoria individual y promocion cruzada a un Patreon; no hay validacion independiente de la calidad del merge.
- El autor redirige a un modelo mas reciente (MiMo-HERO-UIUX-Designer-9B-GGUF) como su trabajo actual, lo que sugiere que este puede quedar sin mantenimiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder-GGUF
- Modelo base (safetensors): https://huggingface.co/pragmaticcs/Triumvirate-Qwopus-MiMo-Ornith-9B-Coder
- Qwen 3.5 9B (ancla): https://huggingface.co/Qwen/Qwen3.5-9B
- Qwopus3.5-9B-Coder (donante 1): https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Ornith-1.5-9B (donante 2): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- MiMo-V2.6-Distill-Qwen-9B (donante 3): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo mas reciente del autor: https://huggingface.co/pragmaticcs/MiMo-HERO-UIUX-Designer-9B-GGUF
- Patreon del autor: https://patreon.com/pragmaticcs
- Paper referenciado en los tags (arXiv:2406.11617): https://arxiv.org/abs/2406.11617
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
