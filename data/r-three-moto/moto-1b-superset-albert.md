# r-three-moto/moto-1b-superset-albert

## Resumen

MoTo 1B Superset-Albert es un modelo de lenguaje base de 2.160 millones de parámetros (1.280 millones no pertenecientes a embeddings) desarrollado por el equipo r-three-moto como parte del proyecto MoTo (Mixture of Tokenizers). Su particularidad es que sustituye el tokenizador único habitual por un superconjunto de 14 tokenizadores existentes (Aya Expanse, BLOOM, Comma, Gemma 2, GPT-2, Llama 3.2, mBERT, Phi-3, Qwen3, XGLM, ByT5, GPT-4o, Tekken y TokenMonster) que comparten una única tabla de embeddings de 851.586 entradas. Cada documento de entrenamiento se codificó con uno de ellos elegido de forma aleatoria uniforme, lo que obliga al modelo a aprender a leer texto bajo cualquiera de esas segmentaciones.

La arquitectura es un decoder estilo Llama de 25 capas, dimensión 2.048 y 16 cabezas, con embeddings factorizados al estilo ALBERT: una tabla de entrada de 851.586 x 512 seguida de una proyección 512 -> 2.048, y una cabeza de salida 2.048 -> 512 -> 851.586. Esta factorización mantiene el coste paramétrico del superconjunto de vocabulario muy por debajo del de una tabla de ancho completo. El contexto es de 4.096 tokens y los pesos se distribuyen en bfloat16.

El modelo se entrenó desde cero sobre aproximadamente 104.860 millones de tokens (100.000 pasos de 1,05 millones de tokens) mezclando FineWeb-Edu (inglés, 40% de la mezcla) y FineWeb2-HQ (20 idiomas adicionales). No está ajustado por instrucciones ni tiene alineamiento de seguridad: es una pieza de investigación pensada para aislar el efecto de la tokenización en modelos multilingües, con una contraparte monolítica de control (`moto-1b-baseline-llama-albert`) entrenada sobre los mismos datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama, 25 capas, d_model 2048, 16 cabezas, embeddings de entrada/salida no atados, factorización ALBERT |
| Parámetros totales | 2.158.731.264 (2,16B); 1,28B no pertenecientes a embeddings |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | en, ar, cs, zh, da, de, el, fa, fr, hu, id, it, ja, nl, pl, pt, ru, es, sv, tr, vi (21 idiomas) |
| Licencia | other (no se detalla el texto de la licencia; los tokenizadores componentes tienen licencias propias, algunas no comerciales como cc-by-nc-4.0) |
| Formato de pesos | safetensors (bfloat16), con código remoto `modeling_llama_albert.py` y `tokenizer.py` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de tipo Llama con 25 capas, dimensión de modelo 2.048 y 16 cabezas de atención, con embeddings de entrada y salida no atados. La innovación central no está en el bloque transformer sino en la capa de embeddings: se construye un vocabulario superconjunto de 851.586 entradas que fusiona los vocabularios de 14 tokenizadores existentes. La tabla de entrada es de 851.586 x 512 y se proyecta a 2.048; la cabeza de salida invierte el camino (2.048 -> 512 -> 851.586). Esta factorización estilo ALBERT reduce drásticamente el coste de un vocabulario tan grande en comparación con una tabla de ancho completo.

El entrenamiento se realizó desde cero durante 100.000 pasos, con 1,05 millones de tokens por paso, lo que suma aproximadamente 104.860 millones de tokens. La configuración por paso indica 2 secuencias de 4.096 tokens por GPU, 8 GPUs y 16 pasos de acumulación. Los datos provienen de FineWeb-Edu (inglés, 40% de la mezcla) y FineWeb2-HQ (20 idiomas), con pesos exactos en el `training/config.yaml` del repositorio. Cada documento se codificó con un tokenizador componente elegido uniformemente al azar mediante un generador NumPy sembrado con 42; los identificadores sin correspondencia en el superconjunto se descartan, como durante el entrenamiento, y se antepone un token BOS. No se aplicó RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en 21 idiomas (inglés, árabe, checo, chino, danés, alemán, griego, persa, francés, húngaro, indonesio, italiano, japonés, neerlandés, polaco, portugués, ruso, español, sueco, turco y vietnamita).
- Lectura de texto bajo 14 segmentaciones distintas: el mismo texto puede codificarse con cualquiera de los tokenizadores componentes y el modelo está entrenado para manejarlas todas.
- Cambio controlado de tokenizador en inferencia mediante `tok.using(name)`, `tok.set_component(name)` o el parámetro `component=` al cargar.
- Modo aleatorio por defecto que replica el comportamiento de entrenamiento (selección uniforme por llamada, con `tok.reset_rng()` para reiniciar la secuencia).
- Capacidad de modelado de lenguaje base: continuación de texto, predicción del siguiente token y generación condicionada por prompt.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito (thinking mode).
- No tiene ajuste por instrucciones ni alineamiento de seguridad.

## Casos de uso

- Investigación sobre tokenización multilingüe: comparar directamente este modelo con `moto-1b-baseline-llama-albert` sobre los mismos datos permite aislar el efecto de usar un superconjunto de tokenizadores frente a un tokenizador monolítico, con métricas de perplejidad por idioma y por segmentación.
- Evaluación de robustez ante segmentaciones: al poder fijar el tokenizador componente en inferencia, se puede medir cómo varía la calidad de generación de un mismo prompt bajo tokenizadores de distinta granularidad (por ejemplo, ByT5 a nivel de byte frente a GPT-4o o Tekken).
- Experimentos de eficiencia de vocabulario: la factorización ALBERT permite estudiar el equilibrio entre tamaño de vocabulario, parámetros de embedding y calidad, útil para quienes diseñan modelos multilingües con presupuestos ajustados.
- Generación de texto base multilingüe para estudios lingüísticos: continuación de textos en los 21 idiomas cubiertos, con control del tokenizador para analizar sesgos de segmentación en lenguas con escrituras no latinas (árabe, chino, griego, persa, ruso).
- Prototipado de pipelines de tokenización personalizados: el código `tokenizer.py` y el archivo `superset_id_maps.json` sirven como referencia para mapear vocabularios existentes a un espacio de identificadores unificado.
- Reproducción de experimentos académicos: el paper, el repositorio de código y las instrucciones de entrenamiento permiten replicar el setup con los mismos datasets (FineWeb-Edu y FineWeb2-HQ) y la misma semilla.
- Base para posteriores ajustes: al ser un modelo base sin instrucciones, puede servir como punto de partida para fine-tuning supervisado en tareas concretas, aunque con las cautelas de licencia indicadas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos (2,16B parámetros x 2 bytes), más memoria para activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos cortos.
- En cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,1 GB, aunque no se documentan cuantizaciones oficiales en la información disponible.
- GPU recomendadas: A100 (40/80 GB), H100 o L40S para despliegues de producción; una RTX 4090 (24 GB) es sobrada para inferencia en bfloat16 a contexto completo.
- Cabe en GPUs de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 e incluso en tarjetas con 8 GB si se cuantiza; el límite práctico es la memoria para caché KV a 4.096 tokens.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito para cargar `modeling_llama_albert.py` y `tokenizer.py`); el tag `text-generation-inference` sugiere compatibilidad con TGI, y `endpoints_compatible` con los endpoints de Hugging Face. No se documenta soporte específico de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota operativa: el tokenizador descarga cada componente desde su fuente original en el primer uso, y los componentes con acceso restringido (Llama 3.2, Gemma 2, Aya Expanse) requieren aceptar su licencia en el Hub y autenticarse con `huggingface-cli login` o pasar `hub_token=...`. Las dependencias `tiktoken`, `mistral_common` y `tokenmonster` solo son necesarias para sus componentes respectivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoTo 1B Superset-Albert | 2,16B (1,28B no embedding) | 4.096 | Superconjunto de 14 tokenizadores, 851.586 entradas | other | Hugging Face, código remoto |
| MoTo 1B Baseline-Llama-Albert | No disponible en la información | No disponible | Tokenizador monolítico | No disponible | Hugging Face (`r-three-moto/moto-1b-baseline-llama-albert`) |
| Llama 3.2 1B | Aproximadamente 1,2B (no confirmado en la información) | No disponible | Llama 3.2 | Llama 3.2 Community License | Hugging Face (acceso restringido) |
| Gemma 2 2B | Aproximadamente 2,6B (no confirmado en la información) | No disponible | Gemma 2 | Gemma Terms of Use | Hugging Face (acceso restringido) |

La comparación principal es con su baseline monolítico del mismo proyecto, que comparte arquitectura, datos y presupuesto de entrenamiento, y del que solo difiere en la tokenización; es el contraste que el paper de MoTo está diseñado para medir. Frente a Llama 3.2 1B y Gemma 2 2B, MoTo 1B Superset-Albert no es un competidor directo en calidad de generación (es un modelo base sin instrucciones), sino una herramienta de investigación sobre tokenización multilingüe.

## Limitaciones y advertencias

- Es un modelo base entrenado desde cero, sin ajuste por instrucciones ni alineamiento de seguridad: no debe usarse como asistente conversacional ni en producción orientada a usuarios sin un fine-tuning y una evaluación previos.
- Riesgo elevado de alucinación y de generar contenido inapropiado, dado que no ha pasado por RLHF ni por filtros de seguridad.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documentos largos o conversaciones multi-turno extensas.
- El comportamiento del tokenizador es no determinista por defecto: cada llamada a `tok(text)` extrae el siguiente componente de una secuencia pseudoaleatoria, de modo que los identificadores de un texto dependen de cuántas llamadas previas se hayan hecho. Para reproducibilidad hay que fijar el componente con `set_component` o reiniciar con `reset_rng`.
- La licencia es "other" y no se detalla su texto en la información disponible; además, el modelo depende en tiempo de ejecución de tokenizadores con licencias propias, algunas no comerciales (Aya Expanse es cc-by-nc-4.0) y otras con términos específicos (Gemma, Llama 3.2, BLOOM RAIL). Cualquier uso comercial requiere revisar cada una de esas licencias y el texto completo de la licencia del modelo.
- Los componentes con acceso restringido exigen aceptar licencias en el Hub y autenticarse; sin ello, el tokenizador no puede cargar esos componentes y la inferencia puede fallar o degradarse.
- El vocabulario superconjunto descarta los identificadores de cada componente que no tienen correspondencia en el superconjunto, lo que puede afectar a textos con caracteres poco frecuentes según el tokenizador elegido.
- No se han publicado benchmarks en la información disponible, por lo que no es posible cuantificar su calidad frente a alternativas.
- El número de descargas (17) y de likes (0) indica una adopción muy temprana; la comunidad y el soporte de terceros son mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r-three-moto/moto-1b-superset-albert
- Modelo de control (baseline monolítico): https://huggingface.co/r-three-moto/moto-1b-baseline-llama-albert
- Paper (OpenReview): https://openreview.net/forum?id=avjeUhPuC6
- Código: https://github.com/r-three/moto
- Todos los modelos del proyecto: https://huggingface.co/r-three-moto
- Código del modelo (embeddings factorizados): `modeling_llama_albert.py` en el repositorio del modelo
- Código del tokenizador: `tokenizer.py` en el repositorio del modelo
- Vocabulario superconjunto: `super_vocab.json` en el repositorio del modelo
- Configuración de componentes y pins: `superset_tokenizer.json` en el repositorio del modelo
- Mapa de identificadores: `superset_id_maps.json` en el repositorio del modelo
- Dataset de entrenamiento (inglés): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de entrenamiento (multilingüe): https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Referencia arXiv citada en los tags: arxiv:2611.11027 (no verificable en la información disponible)
