# Niteshk23/Nexora-36M-Instruct

## Resumen

Nexora-36M-Instruct es un modelo de lenguaje decoder-only de 36,58 millones de parametros entrenado desde cero en PyTorch por el desarrollador independiente Niteshk23. Se trata de un transformer causal con Grouped-Query Attention en proporcion 4:1 (8 cabezas de consulta y 2 cabezas de clave-valor), 10 capas, dimension oculta de 512 y embeddings atados, lo que lo situa en la categoria de modelos minimos orientados a experimentacion y no a produccion.

El modelo se ha entrenado en dos fases: un preentrenamiento breve sobre `HuggingFaceFW/fineweb-edu` (unos 98,3 millones de tokens en 3.000 pasos) y un ajuste supervisado (SFT) sobre `HuggingFaceH4/ultrachat_200k` durante 4.000 pasos, con marcadores de chat tipo ChatML. El tokenizador es un BPE ByteLevel propio de 16.384 tokens entrenado sobre 400 MB del mismo corpus.

Su relevancia es fundamentalmente didactica: sirve como referencia reproducible de un pipeline completo (tokenizador, preentrenamiento, SFT, evaluacion) a escala reducida, con licencia Apache 2.0 y pesos en `bfloat16`. No esta pensado para responder preguntas factuales ni para uso en produccion, tal como advierte el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA 4:1 |
| Parametros totales | 36,58 M (28,19 M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en `bfloat16`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch`, `bfloat16`); no se indica safetensors ni GGUF |
| Capas (`n_layer`) | 10 |
| Dimension oculta (`d_model`) | 512 |
| Cabezas de consulta / KV | 8 / 2 (head_dim = 64) |
| Vocabulario | 16.384 (BPE ByteLevel propio) |
| Embeddings atados | Si |
| Precision de entrenamiento | `bfloat16` |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estandar con atencion agrupada: 8 cabezas de consulta comparten 2 cabezas de clave-valor, lo que reduce el coste de memoria del KV cache a costa de una ligera perdida de expresividad. La dimension oculta de 512 y las 10 capas dan lugar a 28,19 M de parametros no-embedding, a los que se suman los 8,39 M del embedding de vocabulario (16.384 x 512) atado a la capa de salida. La ventana de contexto es de 512 tokens, muy limitada en comparacion con los estandares actuales.

El pipeline consta de tres etapas documentadas. Primero, un tokenizador BPE ByteLevel de 16.384 tokens entrenado sobre 400 MB de `fineweb-edu` (`sample-10BT`), con una fertilidad de 1,452 tokens por palabra y 4,234 caracteres por token. Segundo, un preentrenamiento de 3.000 pasos con 32.768 tokens por paso (aproximadamente 98,3 M de tokens en total) y decaimiento coseno del learning rate de 5e-4 a 5e-5. Tercero, un SFT de 4.000 pasos con `batch_size=16` y learning rate de 2e-4 a 2e-5 sobre `ultrachat_200k`, usando los marcadores `<|system|>`, `<|user|>` y `<|assistant|>`. No se documenta RLHF, DPO ni ninguna innovacion arquitectonica adicional mas alla del GQA.

## Capacidades

- Generacion de texto autoregresiva en ingles con formato de chat (system, user, assistant).
- Seguimiento basico de instrucciones conversacionales, adquirido mediante SFT sobre `ultrachat_200k`.
- Continuacion de texto y modelado de lenguaje a nivel de token; la model card reporta 31,45 % de acierto top-1 en prediccion del siguiente token.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento extendido (thinking).
- Monolingue en ingles; no hay evidencia de capacidades multilingues.
- No se documenta capacidad de codigo ni de matematicas mas alla de lo que pueda emerger del corpus educativo de preentrenamiento.

## Casos de uso

- Docencia y aprendizaje de pipelines de LLM: el modelo permite reproducir de principio a fin el entrenamiento de un transformer (tokenizador, preentrenamiento, SFT y evaluacion) en hardware modesto, dado su tamano de 36,58 M de parametros.
- Benchmarking de arquitecturas: sirve como linea base para comparar variantes de atencion (GQA frente a MHA), funciones de activacion o esquemas de normalizacion a escala pequena, con una perdida de validacion de referencia de 3,9989.
- Pruebas de tokenizadores: su BPE propio de 16.384 tokens, con fertilidad de 1,452 tokens por palabra, permite validar decisiones de vocabulario sobre dominios educativos en ingles.
- Experimentos de ajuste fino: al ser pequeno y Apache 2.0, se puede reentrenar o hacer SFT sobre datasets propios en una unica GPU consumer para estudiar el comportamiento del ajuste supervisado.
- Generacion de texto de relleno en pruebas de integracion: util para validar pipelines de inferencia (formateo de prompts, streaming, gestion de KV cache) sin coste de GPU significativo.
- Investigacion sobre alucinacion y calibracion a escala reducida: su baja precision top-1 (31,45 %) y su HellaSwag cercano al azar (28,00 %) lo convierten en un caso de estudio de los limites del conocimiento factual en modelos minimos.
- Educacion sobre limitaciones de contexto: con 512 tokens, es util para demostrar el impacto de la ventana de contexto en tareas de dialogo multi-turno.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Perdida de validacion (`fineweb-edu`) | 3,9989 (mejor en preentrenamiento: 3,9550) |
| Perplejidad | 54,54 |
| Precision top-1 siguiente token | 31,45 % |
| Precision top-5 siguiente token | 51,59 % |
| HellaSwag zero-shot (200 muestras) | 28,00 % (azar: 25,00 %) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en `bfloat16` (36,58 M de parametros equivalen a unos 73 MB de pesos), mas el KV cache, que con 512 tokens de contexto y 10 capas es despreciable.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; el modelo cabe holgadamente en GPUs integradas y en entornos sin acelerador.
- Cabe en cualquier GPU consumer, incluida la gama baja, y en CPU con razonable fluidez dado el reducido numero de parametros.
- Opciones de despliegue: al publicarse como pesos PyTorch, requiere cargarlo con `transformers` o codigo propio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y no se ofrece formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nexora-36M-Instruct | 36,58 M | 512 | Apache 2.0 | Hugging Face (0 descargas) |
| SmolLM-135M | 135 M | 2.048 | Apache 2.0 | Hugging Face |
| GPT-2 small | 124 M | 1.024 | MIT | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | Hugging Face |

La comparativa es orientativa por categoria (modelos minimos entrenados desde cero o ajustados para experimentacion); no se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada. Nexora-36M-Instruct es aproximadamente tres veces menor que SmolLM-135M y GPT-2 small, y su contexto de 512 tokens es la mitad o menos que el de sus alternativas.

## Limitaciones y advertencias

- Capacidad factual muy limitada: con 36,58 M de parametros y unos 98,3 M de tokens de preentrenamiento, el modelo no puede almacenar conocimiento factual fiable; el autor lo desaconseja explicitamente para Q&A de produccion.
- Riesgo elevado de alucinacion: la precision top-1 del 31,45 % y el HellaSwag del 28,00 % (frente al 25,00 % del azar) indican un rendimiento cercano al aleatorio en tareas de sentido comun.
- Contexto muy corto (512 tokens): insuficiente para dialogos multi-turno largos, documentos o recuperacion aumentada con pasajes extensos.
- Monolingue en ingles: no hay soporte documentado de castellano ni de otros idiomas.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al entrenarse sobre `fineweb-edu` y `ultrachat_200k`, hereda los sesgos de esos corpus.
- Licencia Apache 2.0: permite uso comercial, pero las limitaciones tecnicas hacen inviable su uso en produccion real.
- Sin soporte documentado de tool calling, agentes ni cuantizacion GGUF, lo que restringe su integracion en stacks de despliegue habituales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Niteshk23/Nexora-36M-Instruct
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
