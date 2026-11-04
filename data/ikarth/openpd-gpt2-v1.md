# ikarth/openpd-gpt2-v1

## Resumen

openpd-gpt2-v1 es un modelo de generacion de texto desarrollado por el usuario ikarth (HuggingFace) que replica la arquitectura de GPT-2 small (124M parametros) pero entrenado desde cero exclusivamente con datos de dominio publico y CC0. El objetivo es demostrar que es posible entrenar un modelo de lenguaje funcional sin recurrir a texto con copyright o de procedencia dudosa, manteniendo trazabilidad completa del dataset utilizado. El modelo se entrena sobre 8.800 millones de tokens de un unico epoch del dataset `openpd-strict-v1`, compuesto por fuentes como Project Gutenberg, libros anteriores a 1929 de Internet Archive, Library of Congress, Caselaw Access Project, arXiv, PubMed Central y publicaciones gubernamentales de EE. UU.

La arquitectura es un transformer decoder-only de 12 capas, 12 cabezas de atencion, dimension 768 y contexto de 1.024 tokens, con embeddings atados. El codigo se basa en la linea de nanoGPT de Karpathy y mantiene la estructura original de GPT-2 small con ajustes menores. El modelo es un base model sin instruction tuning ni safety tuning, orientado a generacion de prosa con estilo de epoca (pre-1930) y con conocimiento limitado del mundo contemporaneo.

Su relevancia actual radica en el enfoque de procedencia de datos: cada documento se verifica como dominio publico o CC0, y el dataset tokenizado se publica con huella criptografica (sha256 del flujo de tokens). Esto lo convierte en una referencia para investigacion sobre entrenamiento con datos estrictamente libres y para experimentos de generacion de texto historico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 small (transformer decoder-only, 12 capas, 12 cabezas, 768 dims, embeddings atados) |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | ONNX 8-bit (`onnx/model_quantized.onnx`); pesos fp32 en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors (fp32), ONNX (8-bit) |
| Vocabulario | 50.257 tokens (GPT-2 BPE, `tiktoken` `gpt2`), padding a 50.304 en entrenamiento |
| Tamano del repo | 0.7 GB |
| Libreria | transformers, transformers.js |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 small: transformer decoder-only con 12 capas, 12 cabezas de atencion, dimension de modelo 768 y embeddings atados entre entrada y salida. El contexto maximo es de 1.024 tokens. El codigo procede de la linea build-nanogpt (commit `8202e0a`), derivada de los tutoriales de nanoGPT de Andrej Karpathy, con la peculiaridad de que los datos de entrenamiento son exclusivamente de dominio publico y CC0.

El entrenamiento se realizo sobre 8.800 millones de tokens (un epoch completo del dataset `openpd-strict-v1`, tokenizado con GPT-2 BPE y con huella sha256 `e777bfedc277d972…`). La composicion del dataset es: Project Gutenberg (24,7%), libros pre-1929 de Internet Archive (24,0%), Library of Congress Selected Digitized Books (13,1%), Caselaw Access Project (8,2%), abstracts de arXiv (6,2%), US Government Publishing Office (5,2%), Biodiversity Heritage Library (4,9%), PubMed Central CC0 (4,6%), peS2o CC0/PD (3,4%) y papers de arXiv PD/CC0 (3,2%). Cada documento se verifico como dominio publico o CC0 a nivel individual cuando la fuente registra licencias, y a nivel de fuente en caso contrario. El entrenamiento se ejecuto en 4 GPU H100 alquiladas en 85 minutos (la version v0 se entreno en una RTX 3090 personal). No se menciona uso de RLHF, DPO ni instruction tuning; es un base model puro.

## Capacidades

- Generacion de texto autoregresiva en ingles con estilo de prosa de epoca (pre-1930).
- Modelado de lenguaje base: no dispone de instruction tuning ni de modo conversacional.
- Generacion de prosa literaria y narrativa con vocabulario y sintaxis historicamente plausibles.
- Cierta capacidad de generacion de texto tecnico y cientifico derivada de las fuentes de arXiv, PubMed y peS2o.
- Generacion de texto legal y administrativo por influencia del Caselaw Access Project y USGPO.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidad multilingue practicamente nula: solo ingles.
- No dispone de vision, audio ni modo thinking.
- Inferencia en navegador mediante transformers.js con pesos ONNX 8-bit (descarga de ~170 MB).

## Casos de uso

- Generacion de prosa historica y literaria: el modelo produce texto con registro y vocabulario de principios del siglo XX, adecuado para experimentos creativos, prototipos de narrativa de epoca o simulacion de documentos historicos.
- Investigacion sobre procedencia de datos: sirve como referencia reproducible para estudiar el impacto de entrenar exclusivamente con datos de dominio publico, con dataset y huella verificables.
- Educacion y docencia: modelo ligero (124M) que cabe en hardware modesto y permite demostrar el ciclo completo de entrenamiento e inferencia de un transformer desde cero.
- Inferencia en navegador: la version ONNX 8-bit permite desplegar demos interactivas en el cliente con transformers.js sin backend, util para espacios de HuggingFace y prototipos web.
- Generacion de texto aumentada con recuperacion (RAG) sobre corpus historicos: al combinarse con un retriever sobre textos pre-1930, puede redactar resumenes o continuaciones coherentes con el estilo de las fuentes.
- Experimentos de perplexity y evaluacion de dominio: util como baseline para medir deriva de dominio entre texto historico y contemporaneo (perplexity 17,4 en prosa de 1930 frente a 28,8 de GPT-2 original).
- Prototipado de pipelines de generacion de bajo coste: al ser un modelo pequeno y con licencia CC0, se puede integrar en pruebas de CI/CD de sistemas de generacion sin restricciones de licencia.
- Fine-tuning sobre dominios especificos: su tamano reducido y licencia permisiva facilitan el ajuste fino en tareas de generacion con datos propios.

## Benchmarks y rendimiento

| Metrica | openpd-gpt2-v1 | GPT-2 original |
|---|---|---|
| Perplexity en prosa de 1930 (held-out) | 17,4 | 28,8 |
| Perplexity en Wikipedia moderna | aproximadamente el doble que GPT-2 | referencia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (124M parametros x 4 bytes) mas overhead de activaciones y KV cache; en la practica cabe en cualquier GPU consumer con 2 GB o mas.
- VRAM estimada en ONNX 8-bit: en torno a 170 MB de pesos, ejecutable en CPU y en navegador.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es sobredimensionada; el modelo se entrena comodamente en una RTX 3090 (experiencia de v0) y se entreno en 4 H100 en 85 minutos para v1.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos 10 anos, e incluso en CPU para inferencia.
- Opciones de despliegue: transformers (pipeline de text-generation), transformers.js (navegador, ONNX 8-bit), text-generation-inference (tag `text-generation-inference`), ONNX Runtime. No se menciona soporte explicito de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque de datos | Disponibilidad |
|---|---|---|---|---|---|
| openpd-gpt2-v1 | 124M | 1.024 | CC0-1.0 | Solo dominio publico y CC0 verificado | HuggingFace, ONNX, transformers.js |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT (pesos publicados) | WebText (no verificado) | HuggingFace, multiples runtimes |
| openpd-gpt2-v0 (ikarth) | 124M | 1.024 | CC0-1.0 | Dominio publico + Ubuntu IRC (2,5B tokens) | HuggingFace |
| Modelos tipo Pythia-160M (EleutherAI) | 160M | 2.048 | Apache 2.0 | The Pile (mixto, con copyright) | HuggingFace |

La comparativa se limita a modelos de la misma escala (aproximadamente 100-200M parametros). No se dispone de datos de benchmarks comparativos estandar en la informacion proporcionada; la unica metrica publicada es la perplexity frente a GPT-2 original.

## Limitaciones y advertencias

- Es un base model sin safety tuning, sin guardrails y sin instruction tuning: puede generar contenido racista, sexista u ofensivo, especialmente por el sesgo historico de las fuentes pre-1930.
- Riesgo elevado de alucinacion y de afirmaciones factuales incorrectas, agravado por el conocimiento limitado del mundo posterior a 1930.
- Sesgo temporal y cultural: el corpus esta dominado por textos estadounidenses de dominio publico anteriores a 1930, lo que introduce sesgos de epoca, geograficos y de genero.
- Limitacion de contexto: 1.024 tokens, insuficiente para tareas que requieran contexto largo.
- Limitacion idiomatica: solo ingles; no hay soporte multilingue.
- El tokenizer GPT-2 BPE no fue entrenado con datos abiertos, lo que rompe parcialmente la promesa de procedencia estricta (el autor lo reconoce como known issue).
- Licencia CC0-1.0: permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el contenido generado ni sobre la idoneidad para produccion.
- Capacidad de codigo muy limitada, segun el propio autor.
- El modelo no esta disenado para tareas de razonamiento, matematicas ni agentes.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikarth/openpd-gpt2-v1
- Version anterior v0: https://huggingface.co/ikarth/openpd-gpt2-v0
- Dataset de entrenamiento: https://huggingface.co/datasets/ikarth/openpd-strict-v1
- Demo en navegador (transformers.js): https://huggingface.co/spaces/ikarth/openpd-gpt2
- Codigo base nanoGPT de Karpathy: https://github.com/karpathy/nanogpt
- Common Pile (fuente de datasets): https://huggingface.co/common-pile
- Library of Congress Selected Digitized Books: https://huggingface.co/datasets/storytracer/LoC-PD-Books
