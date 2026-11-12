# DuoNeural/RMSN-532M-InternalBulk-SFT5k

## Resumen

RMSN-532M-InternalBulk-SFT5k es un modelo de lenguaje de 532 millones de parametros desarrollado por DuoNeural (laboratorio que firma como Archon + Aura) y publicado en noviembre de 2026. Se trata de un experimento control disenado para validar la denominada "Topological Freezing Law", una hipotesis del autor segun la cual ciertas estructuras topologicas internas (los "condensados exactos" con M* >= 3) son inmunes al ajuste fino supervisado y degradan el rendimiento del modelo cuando este se somete a SFT.

El modelo emplea una arquitectura propietaria denominada RMSN (presumiblemente "Resonant Multi-Soliton Network") con formulacion port-hamiltoniana y un mecanismo de "solitones topologicos" distribuidos en capas concretas (L8, L9, L10, L12, L14, L15). La variante InternalBulk corresponde a una configuracion con M*=0, es decir, sin condensados exactos en la capa frontal, lo que segun el autor la convierte en el control experimental frente a una variante hermana (D=1664 s3) con M*=4.

Su relevancia no reside en capacidades de proposito general, sino en su papel como evidencia empirica dentro de una linea de investigacion sobre topologia interna de redes neuronales. El autor reporta una diferencia de perplexidad de 90 puntos atribuible unicamente a la topologia, manteniendo arquitectura, calidad base y datos de SFT constantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (port-hamiltonian, topological solitons), depth=16 |
| Parametros totales | 532M |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoint (.pt, `rmsn_sft_best.pt`) |
| Dimension del modelo (d_model) | 1664 |
| Slots | 64 |
| Vocabulario | 49152 |
| Tokenizer | HuggingFaceTB/cosmo2-tokenizer |
| Tamano del repo | 1.8 GB |
| Seed | 2 |
| Topologia base | Internal Bulk, M*=0, solitones en L8/L9/L10/L12/L14/L15 |

## Arquitectura y entrenamiento

La arquitectura RMSN se describe como port-hamiltoniana, un formalismo de sistemas dinamicos que preserva la estructura energetica, combinado con "solitones topologicos" ubicados en capas especificas del transformer (L8, L9, L10, L12, L14 y L15). El modelo tiene 16 capas, dimension 1664, 64 slots y un vocabulario de 49152 tokens servido por el tokenizer cosmo2. No se detalla el mecanismo de atencion ni si incorpora componentes SSM o hibridos; la model card no proporciona esa informacion.

El entrenamiento consistio en un SFT de 5000 pasos sobre trazas de razonamiento del dataset "CDM reasoning traces v4_hard". Tras el SFT, el autor reporta un fenomeno de "Condensation Migration": los solitones de L8 y L9 se disolvieron, mientras que el cluster terminal L10/L12/L14/L15 sobrevivio. No se especifica el numero total de tokens de entrenamiento previo (pretraining), la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica destacable es precisamente la hipotesis de congelacion topologica: los condensados exactos con M* >= 3 serian inmunes al SFT y actuarian como un "workspace congelado" que degrada el ajuste fino.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por el entrenamiento SFT sobre trazas de razonamiento.
- Razonamiento de tipo chain-of-thought, segun se desprende de su entrenamiento sobre "CDM reasoning traces v4_hard".
- Capacidad multilingue: no disponible; el tokenizer cosmo2 sugiere cobertura amplia, pero no se documenta.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo thinking explicito: no disponible.
- Capacidad especial: servir como control experimental para estudiar el efecto de la topologia en el fine-tuning.

## Casos de uso

- Investigacion sobre interpretabilidad topologica: el modelo se usa como punto de comparacion (M*=0) frente a variantes con condensados exactos (M*>=3) para aislar el efecto de la topologia en el rendimiento tras SFT.
- Reproduccion de experimentos de "Topological Freezing Law": permite replicar la comparacion de perplexidades (wiki_ppl=170.53, cot_ppl=11.52) frente a la variante D=1664 s3 (260.11 / 24.82).
- Estudio de Condensation Migration: util para analizar como se disuelven los solitones L8/L9 tras 5000 pasos de SFT y por que sobrevive el cluster terminal L10/L12/L14/L15.
- Baseline en experimentos de ajuste fino: sirve como referencia de un modelo sin condensados exactos para medir la degradacion o mejora introducida por distintas estrategias de SFT.
- Validacion de arquitecturas port-hamiltonianas: permite evaluar si la formulacion energetica preservada mejora la estabilidad del entrenamiento frente a transformers convencionales.
- Docencia y divulgacion: como ejemplo didactico de experimento controlado en el que se varia una sola condicion (topologia) manteniendo arquitectura, datos y pasos de SFT.

## Benchmarks y rendimiento

El autor reporta unicamente metricas de perplexidad, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | RMSN-532M-InternalBulk (M*=0) | D=1664 s3 (M*=4) |
|---|---|---|
| wiki_ppl | 170.53 | 260.11 |
| cot_ppl | 11.52 | 24.82 |
| Diferencia de ppl | — | +89.58 en wiki_ppl, +13.30 en cot_ppl |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para 532M parametros en fp32 se requieren aproximadamente 2.1 GB solo de pesos; en fp16 unos 1.1 GB; en int8 unos 0.55 GB. Estas cifras son estimaciones genericas por tamano, no confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano, el modelo cabe en cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090), asi como en A100 o H100.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 6 GB o mas, aunque no esta confirmado por el autor.
- Opciones de despliegue: el autor solo documenta carga via `torch.load("rmsn_sft_best.pt", map_location="cpu")`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; la arquitectura propietaria probablemente requiera codigo especifico no publicado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| RMSN-532M-InternalBulk-SFT5k | 532M | no disponible | Apache 2.0 | Hugging Face (repo 1.8 GB) | Investigacion topologica, port-hamiltoniano |
| D=1664 s3 (variante hermana DuoNeural) | 532M (misma arquitectura) | no disponible | no disponible | no disponible en esta busqueda | Mismo modelo con M*=4 (condensados exactos) |
| Qwen2.5-0.5B | 494M | 32k | Apache 2.0 | Hugging Face, ampliamente desplegado | LLM generalista |
| SmolLM2-360M | 360M | 8k | Apache 2.0 | Hugging Face | LLM generalista |

La comparacion con modelos generalistas es solo orientativa por tamano; RMSN-532M no esta disenado para tareas de proposito general y no se dispone de benchmarks comparables.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas generales de NLP.
- Sin benchmarks estandar publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni tareas similares.
- Idiomas soportados no documentados: se desconoce la cobertura linguistica real pese al tokenizer cosmo2.
- Longitud de contexto no especificada: imposible planificar aplicaciones que dependan de ventanas largas.
- Formato de pesos propietario (.pt) sin codigo de inferencia publicado: la reproducibilidad depende de que el autor libere la implementacion de la arquitectura RMSN.
- Riesgo de alucinacion: no evaluado; un modelo de 532M con SFT sobre trazas de razonamiento sinteticas es propenso a errores factuales.
- Sesgos: no documentados; el dataset de SFT (CDM reasoning traces v4_hard) no se describe en composicion ni procedencia.
- Uso comercial: la licencia Apache 2.0 lo permite tecnicamente, pero la ausencia de evaluacion de calidad y de codigo de inferencia hace desaconsejable su uso en produccion.
- Repo con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.
- La model card contiene afirmaciones teoricas (Topological Freezing Law, Condensation Migration) que no han sido replicadas de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-532M-InternalBulk-SFT5k
- Tokenizer: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada.
