# r-three-moto/moto-1b-script

## Resumen

MoTo 1B (script-level tokenizers) es un modelo de lenguaje de tipo decoder, estilo Llama, entrenado desde cero por el autor r-three-moto sobre 21 idiomas. Su particularidad no es la arquitectura, que es un transformer convencional de 25 capas, d_model 2048 y 16 cabezas de atencion, sino el esquema de tokenizacion: en lugar de un unico tokenizador multilingue, utiliza 11 tokenizadores BPE agrupados por escritura (arabe, cirilico, griego, hanzi/kanji, latin romanico, latin germanico, etc.) que comparten una unica tabla de embeddings de 165.022 filas.

El modelo tiene 1.960.540.160 parametros totales (1,28B sin contar embeddings) y una longitud de contexto de 4096 tokens. Fue entrenado sobre aproximadamente 104,86B tokens, combinando FineWeb-Edu (ingles, 40% de la mezcla) y FineWeb2-HQ (los 20 idiomas restantes). Es un modelo base, sin ajuste por instrucciones ni alineamiento de seguridad, concebido como parte de un estudio controlado sobre el efecto de la tokenizacion en modelos multilingues.

Su relevancia es fundamentalmente de investigacion: el release incluye tambien las lineas base con tokenizador monolitico entrenadas sobre los mismos datos, lo que permite aislar el impacto del esquema Mixture of Tokenizers (MoTo) en el rendimiento por idioma. La licencia MIT y el formato safetensors en bfloat16 facilitan su reproduccion y experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama, 25 capas, d_model 2048, 16 cabezas, embeddings de entrada y salida no atados |
| Parametros totales | 1.960.540.160 (1,28B sin embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, ar, cs, zh, da, de, el, fa, fr, hu, id, it, ja, nl, pl, pt, ru, es, sv, tr, vi |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de 25 capas con d_model 2048 y 16 cabezas de atencion, con embeddings de entrada y salida no atados (untied). La innovacion reside en el sistema de tokenizacion: 11 tokenizadores BPE por escritura, procedentes de la familia flexitok (bpe_script_Arab_16000, bpe_script_CmJp_16000, bpe_script_Germ_32000, bpe_script_Roma_32000, bpe_ltr_rus_Cyrl_16000_v2, entre otros), se fusionan en un vocabulario superset de 165.022 entradas que indexa una unica tabla de embeddings compartida. Cada documento se codifica durante el entrenamiento con el tokenizador de su idioma con probabilidad 0,9 y, en caso contrario, con uno elegido uniformemente.

El entrenamiento cubre 100.000 pasos con 1,05M tokens por paso, aproximadamente 104,86B tokens en total (4 secuencias de 4096 tokens por GPU, 8 GPUs, 8 pasos de acumulacion). Los datos provienen de FineWeb-Edu para el ingles (40% de la mezcla) y FineWeb2-HQ para los otros 20 idiomas, con pesos exactos documentados en training/config.yaml. No se menciona RLHF, DPO ni ninguna fase de alineamiento: es un modelo base puro entrenado para comparar esquemas de tokenizacion frente a lineas base monoliticas con los mismos datos.

## Capacidades

- Generacion de texto autoregresiva en 21 idiomas, incluyendo arabe, chino, japones, ruso, griego, persa y las principales lenguas latinas y germanicas.
- Modelado de lenguaje base: continuacion de texto, completado y generacion condicionada por prompt, sin capacidad de seguir instrucciones de forma fiable.
- Tokenizacion conmutable por idioma mediante `tok.set_language()`, `tok.using()` y mapeos personalizados con `tok.set_mapping()`, incluyendo reglas por regex sobre subtags de escritura.
- Decodificacion robusta entre vocabularios: `tok.decode` acepta ids de cualquier tokenizador del release, de modo que las generaciones que derivan hacia otro idioma se decodifican completamente.
- Carga sin codigo remoto posible, mapeando manualmente los ids con `super_mapping.json`.
- No dispone de tool calling, function calling, modo thinking, vision, audio ni capacidades de agente.

## Casos de uso

- Investigacion sobre tokenizacion multilingue: comparar el modelo MoTo con las lineas base monoliticas del mismo release para medir el efecto de un tokenizador por escritura en perplejidad y calidad por idioma, usando los mismos datos y presupuesto de entrenamiento.
- Experimentos de eficiencia de vocabulario: analizar como la comparticion de una tabla de embeddings de 165.022 filas entre 11 tokenizadores afecta a la relacion entre tokens por palabra y coste computacional en lenguas con escrituras no latinas.
- Generacion de texto base en idiomas de bajos recursos relativos: servir como modelo de continuacion para arabe, persa, griego o turco en tareas de aumento de datos o generacion de corpus sinteticos, con contexto de 4096 tokens.
- Reproduccion de resultados academicos: el paper asociado (arXiv 2611.11027) y el codigo en github.com/r-three/moto permiten replicar el pipeline de entrenamiento y evaluacion con pesos publicos en bfloat16.
- Prototipado de pipelines de tokenizacion por escritura: usar `tokenizer.py` y `super_mapping.json` como referencia para implementar enrutamiento de tokenizadores en sistemas propios, incluida la carga sin `trust_remote_code`.
- Fine-tuning supervisado posterior: al ser un modelo base de 1,96B con licencia MIT, sirve como punto de partida para ajustes por instrucciones o tareas concretas en entornos de investigacion con recursos limitados.
- Evaluacion de deriva linguistica: estudiar con `tok.decode` como las generaciones cambian de vocabulario entre idiomas y que implicaciones tiene para la deteccion de idioma en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4 GB solo para pesos (1,96B parametros x 2 bytes), mas cache KV y activaciones; en la practica, entre 6 y 8 GB para contexto completo de 4096 tokens.
- En cuantizacion de 8 bits, alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque no se documentan pesos cuantizados oficiales en el repositorio.
- GPU recomendadas: A100 o H100 para entrenamiento y evaluacion a gran escala; para inferencia basta una RTX 4090, RTX 3090, RTX 4080 o incluso GPUs consumer con 8 GB o mas de VRAM.
- Cabe en GPUs consumer: si, incluidas RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070.
- Opciones de despliegue: transformers con `AutoModelForCausalLM`; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documenta soporte explicito de vLLM, llama.cpp u Ollama, y la ausencia de pesos GGUF oficiales limita el despliegue en CPU sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Notas |
|---|---|---|---|---|---|
| MoTo 1B (script-level) | 1,96B (1,28B sin embeddings) | 4096 | 11 tokenizadores por escritura, vocabulario superset de 165.022 | MIT | Modelo base de investigacion con lineas base monoliticas en el mismo release |
| Lineas base monoliticas MoTo | No disponible en detalle | 4096 | Tokenizador unico | MIT (presumible, mismo release) | Entrenadas sobre los mismos 21 idiomas y datos; permiten aislar el efecto del esquema MoTo |
| Llama 3.2 1B | 1,24B | 128K | Tokenizador BPE unico (tiktoken) | Llama 3.2 Community License | Modelo instruction-tuned con contexto muy superior y alineamiento de seguridad |
| Qwen2.5 1.5B | 1,54B | 32K | Tokenizador BPE unico multilingue | Apache 2.0 | Base e instruct, con mejor soporte multilingue practico y tool calling en la variante instruct |

La comparacion con Llama 3.2 1B y Qwen2.5 1.5B es orientativa por tamano; MoTo 1B no compite en contexto, alineamiento ni capacidades de instruccion, sino en el eje de diseno de tokenizacion multilingue.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable y no debe usarse directamente como asistente.
- No tiene alineamiento de seguridad ni filtros de contenido; puede generar texto toxico, sesgado o inapropiado.
- Riesgo de alucinacion inherente a un modelo de 1,96B entrenado con aproximadamente 105B tokens, con conocimiento factual limitado.
- Longitud de contexto de solo 4096 tokens, muy por debajo de los estandares actuales para tareas de documentos largos.
- El enrutamiento de tokenizadores exige seleccionar el tokenizador correcto por idioma; un uso incorrecto degrada la calidad de forma silenciosa. Sin `language`, el tokenizador por defecto es `fw_edu` (ingles).
- La carga con `trust_remote_code=True` ejecuta codigo del repositorio; para entornos restringidos debe usarse la ruta sin codigo remoto descrita en la model card.
- La licencia MIT permite uso comercial, pero el modelo no ofrece garantias de calidad ni de seguridad para produccion.
- No se publican resultados de benchmarks, por lo que no es posible evaluar su rendimiento relativo sin ejecutar evaluaciones propias.
- El soporte de cuantizacion no esta documentado oficialmente; cualquier conversion a GGUF o GPTQ corre por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r-three-moto/moto-1b-script
- Paper (OpenReview): https://openreview.net/forum?id=avjeUhPuC6
- Paper (arXiv): https://arxiv.org/abs/2611.11027
- Codigo: https://github.com/r-three/moto
- Coleccion de modelos MoTo: https://huggingface.co/r3-moto
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Tokenizadores de referencia flexitok: https://huggingface.co/flexitok
