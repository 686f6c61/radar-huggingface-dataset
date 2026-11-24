# Caiyun-AI/mHC-Pythia-2.8B

## Resumen

mHC-Pythia-2.8B es un modelo de lenguaje de tipo base (no instruido) desarrollado por Caiyun-AI, con 2.775.263.813 parámetros y entrenado sobre aproximadamente 300.000 millones de tokens del dataset Pile. Se trata de un modelo de comparación publicado junto a LoomPythia-2.8B, concebido para evaluar el impacto de la arquitectura mHC (multi-stream, con cuatro flujos) frente a la arquitectura transformer estándar de Pythia bajo un presupuesto de parámetros idéntico y el mismo tokenizador.

El modelo emplea ramas seriales de atención y MLP con normalización QK y una ventana de contexto de 2048 tokens, manteniendo la compatibilidad con el ecosistema Pythia de EleutherAI. Su relevancia es fundamentalmente experimental: permite aislar el efecto arquitectónico en una comparación controlada, ya que comparte datos de entrenamiento, tokenizador y número de parámetros con la familia Pythia.

No es un asistente conversacional ni un modelo instruido; está pensado como base para investigación en arquitecturas alternativas y como punto de partida para fine-tuning. La licencia no está declarada en la información disponible, lo que condiciona cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con 4-stream mHC, ramas seriales de atención/MLP, normalización QK |
| Parámetros totales | 2.775.263.813 (2,78B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

mHC-Pythia-2.8B se basa en un transformer causal con una variante arquitectónica denominada mHC de cuatro flujos (4-stream). Las ramas de atención y MLP se organizan de forma serial, e incorpora normalización QK. El modelo mantiene el tokenizador de Pythia y un presupuesto de parámetros equivalente al de Pythia-2.8B, lo que permite una comparación directa entre arquitecturas.

El entrenamiento se realizó sobre aproximadamente 300.000 millones de tokens del dataset Pile, el mismo corpus utilizado por la familia Pythia. No se indica en la información disponible si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias; se trata de un modelo base preentrenado. El repositorio incluye además código opcional de prefill optimizado para PyTorch/Triton en `fast_inference.py` y `mhc_kernels.py`, aunque la carga estándar mediante Hugging Face utiliza la implementación de referencia.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo causal base.
- Razonamiento de sentido común y conocimiento factual a nivel de modelo base de ~2,8B.
- Capacidad de continuar texto y completar secuencias con contexto de hasta 2048 tokens.
- Soporte de cuantización no documentado explícitamente; el repo entrega pesos en safetensors.
- No dispone de tool calling ni function calling documentado.
- No dispone de modo de razonamiento multi-paso explícito ni de agentes.
- Capacidades multilingües limitadas al inglés según la model card.
- No incluye visión, audio ni otras modalidades.

## Casos de uso

- Investigación comparativa de arquitecturas: sirve como contrapunto controlado a Pythia-2.8B y LoomPythia-2.8B para medir el efecto de mHC con los mismos datos y tokenizador.
- Fine-tuning supervisado para tareas de clasificación o generación en inglés: al ser un modelo base de 2,78B, puede ajustarse con LoRA en una sola GPU para dominios específicos.
- Evaluación de perplejidad y benchmarks académicos: útil en pipelines de evaluación de modelos base sobre Pile, FLAN, LAMBADA, PIQA, WinoGrande, ARC, SciQ, BoolQ, HellaSwag y RACE.
- Generación de texto controlada en entornos de investigación: con contexto de 2048 tokens y decodificación determinista, adecuado para experimentos reproducibles.
- Estudio de eficiencia de kernels: el repositorio incluye kernels Triton opcionales, por lo que puede emplearse para medir el rendimiento del prefill optimizado frente a la implementación de referencia.
- Base para destilación o inicialización de modelos más pequeños: su tamaño y su naturaleza de modelo base lo hacen apto como profesor o punto de partida en experimentos de compresión.
- Reproducción de resultados académicos: al compartir tokenizador y datos con Pythia, facilita la replicación de estudios sobre arquitecturas alternativas.

## Benchmarks y rendimiento

Datos publicados en la model card (precisión 0-shot en %, salvo indicación; perplejidad menor es mejor):

| Modelo | Params | Pile ppl | FLAN ppl | LAMBADA | PIQA | WinoGrande | ARC-E | ARC-C | SciQ | BoolQ | HellaSwag | RACE-M | RACE-H | Media 0-shot / 5-shot |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Pythia-2.8B | 2,78B | 6,63 | 8,16 | 64,7 | 73,9 | 59,4 | 64,4 | 29,5 | 88,2 | 64,5 | 45,4 | 38,1 | 34,9 | 56,3 / 57,3 |
| Pythia-6.9B | 6,86B | 6,29 | 7,85 | 67,3 | 75,2 | 60,9 | 67,3 | 31,3 | 89,7 | 63,7 | 48,0 | 40,6 | 37,0 | 58,1 / 59,3 |
| mHC-Pythia-2.8B | 2,78B | 6,24 | 7,35 | 68,5 | 74,4 | 62,8 | 67,1 | 30,7 | 90,5 | 66,9 | 47,5 | 42,3 | 37,0 | 58,8 / 59,9 |
| Pythia-12B | 11,85B | 6,01 | 7,26 | 70,5 | 76,0 | 63,9 | 70,2 | 31,8 | 90,2 | 67,4 | 50,3 | 40,6 | 38,3 | 59,9 / 60,8 |
| LoomPythia-2.8B | 2,78B | 6,02 | 6,94 | 71,8 | 74,7 | 63,7 | 68,5 | 31,7 | 92,4 | 65,8 | 49,1 | 42,3 | 39,0 | 59,9 / 61,6 |

mHC-Pythia-2.8B supera a Pythia-2.8B en perplejidad de Pile (6,24 frente a 6,63) y de FLAN (7,35 frente a 8,16), y en la media de 10 tareas (58,8 frente a 56,3 en 0-shot; 59,9 frente a 57,3 en 5-shot). Queda ligeramente por debajo de LoomPythia-2.8B en perplejidad y en la media agregada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 5,6 GB solo para pesos, más overhead de activaciones y caché KV; con contexto completo de 2048 tokens, se recomienda al menos 8-10 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para mayor comodidad; también cabe en GPUs consumer de 12-16 GB con cuantización.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) sin cuantización y en GPUs de 12-16 GB con cuantización (aunque los tipos de cuantización no están documentados en la ficha).
- Opciones de despliegue: transformers con `trust_remote_code=True`; el repo incluye kernels Triton opcionales para prefill. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Licencia | Pile ppl | Media 0-shot | Disponibilidad |
|---|---:|---:|---|---:|---:|---|
| mHC-Pythia-2.8B | 2,78B | 2048 | no disponible | 6,24 | 58,8 | Hugging Face |
| Pythia-2.8B | 2,78B | 2048 | Apache 2.0 (según familia Pythia) | 6,63 | 56,3 | Hugging Face |
| LoomPythia-2.8B | 2,78B | 2048 | no disponible | 6,02 | 59,9 | Hugging Face |
| Pythia-6.9B | 6,86B | 2048 | Apache 2.0 (según familia Pythia) | 6,29 | 58,1 | Hugging Face |

## Limitaciones y advertencias

- Es un modelo base preentrenado, no un asistente instruido: no sigue instrucciones de forma fiable sin fine-tuning.
- Riesgo de alucinación inherente a modelos base entrenados sobre Pile; no se han aplicado técnicas de alineación documentadas.
- Sesgos potenciales derivados del corpus Pile, sin evaluación de sesgo publicada en la información disponible.
- Contexto limitado a 2048 tokens, inferior al de modelos contemporáneos con ventanas de 8K-128K.
- Soporte únicamente en inglés.
- Licencia no declarada: no se puede garantizar el uso comercial sin consultar al autor.
- Requiere `trust_remote_code=True` y código personalizado (`pythia_mhc`), lo que implica revisar el código antes de ejecutarlo en producción.
- No hay datos publicados sobre cuantización, latencia ni throughput.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Caiyun-AI/mHC-Pythia-2.8B
- Modelo LoomPythia-2.8B: https://huggingface.co/Caiyun-AI/LoomPythia-2.8B
- Repositorio LoomFormer / LoomPythia: https://github.com/Caiyun-AI/LoomFormer
- Baseline Pythia-2.8B: https://huggingface.co/EleutherAI/pythia-2.8b
- Dataset Pile: https://huggingface.co/datasets/EleutherAI/pile
