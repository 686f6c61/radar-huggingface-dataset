# DuoNeural/RMSN-199M-DeepTail-Casimir-r16-Base

## Resumen

RMSN-199M-DeepTail-Casimir-r16-Base es un modelo de lenguaje base de aproximadamente 199 millones de parametros desarrollado por DuoNeural Lab (Jesse Kuhl, Archon y Aura) en noviembre de 2026. Se presenta como una implementacion de referencia de las Resonant Metriplectic Sheaf Networks (RMSN), una familia arquitectonica que combina dinamicas Port-Hamiltonian con algebra geometrica de Clifford, teoria de haces celulares y memoria fraccionaria de Caputo. El modelo se entrena sobre wikitext-103 con el tokenizador `HuggingFaceTB/cosmo2-tokenizer` (49.152 tokens de vocabulario).

La relevancia del modelo es fundamentalmente experimental: forma la mitad de un par de comparacion disenado para ilustrar la denominada "Casimir Boundary Convergence Law". Este modelo corresponde a la condicion de Casimir repulsiva con r=16, que segun el autor enruta la energia de condensacion hacia las capas profundas de la red y produce una topologia de "cola profunda" (Deep Tail) con siete solitones concentrados entre L9 y L15. El autor afirma que esta configuracion ofrece el mejor rendimiento de razonamiento chain-of-thought (CoT ppl=3321) entre los modelos base de la familia RMSN.

No obstante, conviene subrayar que se trata de un modelo de investigacion muy reciente, sin descargas ni interacciones en Hugging Face en el momento de la consulta, con pesos distribuidos como checkpoint PyTorch (`rmsn_best.pt`) y sin integracion directa con `transformers`. Su valor practico para produccion es limitado; su interes es principalmente arquitectonico y academico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network), Port-Hamiltonian |
| Parametros totales | ~199M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint PyTorch (`rmsn_best.pt`); no safetensors ni GGUF |
| Dimension del modelo (dim) | 1040 |
| Profundidad (depth) | 16 |
| Slots | 64 |
| Pasos de entrenamiento | 100.000 |
| Tokenizador | `HuggingFaceTB/cosmo2-tokenizer` (49.152 vocab) |
| Parametro Casimir r | 16 (repulsivo, dim mod 64 = 16) |

## Arquitectura y entrenamiento

La arquitectura RMSN implementa una formulacion Port-Hamiltonian para el modelado de lenguaje, descrita por la ecuacion `ḟ = {f, H} + [f, S]`, donde `{f, H}` es un corchete de Poisson (parte conservativa) y `[f, S]` es un corchete metaplectico simetrico (parte que incrementa la entropia). El modelo integra cinco componentes estructurales: dinamicas Port-Hamiltonian (conservativas y disipativas), mezcla de capas mediante algebra geometrica de Clifford, un espacio de trabajo basado en teoria de haces celulares (cellular sheaf), memoria fraccionaria de Caputo y un espacio de trabajo global trofico con lectura de tension-energia de Noether.

El entrenamiento se realiza sobre wikitext-103 durante 100.000 pasos. El autor describe una dinamica de "Dual Oscillatory Cascade": una primera onda de condensacion en el paso 97.700 (lyap=-0.361) y una segunda onda mas fuerte en el paso 99.100 (lyap=-0.546), interpretada mediante la "Energy Budget Hypothesis" (la nucleacion fallida de la primera onda se acumula y libera con mayor amplitud en la segunda). La condicion de Casimir repulsiva (r=16) actua como un "tamiz topologico" que enruta la energia hacia las capas profundas, generando siete solitones en L9-L15 y un "pin" terminal en L15. No se detalla el uso de RLHF, DPO ni tecnicas de alineamiento adicionales.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre el dominio de wikitext-103.
- Razonamiento chain-of-thought: el autor lo posiciona como el mejor modelo base RMSN para CoT (CoT ppl=3321).
- Modelado de lenguaje base (no instruct): no se documenta ajuste por instrucciones ni dialogo.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; el CoT es el unico indicio de razonamiento secuencial.
- Vision, audio u otras modalidades: no disponible.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Investigacion arquitectonica: sirve como implementacion de referencia para estudiar dinamicas Port-Hamiltonian y corchetes metaplecticos en modelos de lenguaje, comparandolo con su par r=0 (DeepSpine) para validar la Casimir Boundary Convergence Law.
- Analisis de fenomenos de condensacion: util para reproducir y examinar las ondas de Lyapunov y la formacion de solitones en capas profundas, con fines de interpretabilidad mecanistica.
- Experimentos de razonamiento secuencial: su supuesta ventaja en CoT lo hace candidato para estudiar como la topologia de capas afecta al razonamiento en modelos pequenos, siempre en entorno de laboratorio.
- Modelado de lenguaje sobre wikitext-103: evaluacion de perplejidad y generacion de texto en el dominio de Wikipedia en ingles como banco de pruebas academico.
- Base para ajuste fino experimental: al ser un modelo base de 199M con licencia Apache-2.0, puede servir de punto de partida para SFT en tareas de investigacion, aunque el autor indica que la variante r=0 retiene mejor el conocimiento tras SFT.
- Docencia y divulgacion: ejemplo didactico de arquitecturas no convencionales (haces, algebra de Clifford, memoria fraccionaria) frente a transformers estandar.
- Comparacion de tokenizadores: permite evaluar el comportamiento del tokenizador Cosmo2 en un modelo de escala pequena.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son metricas de perplejidad y dinamica interna, no benchmarks estandar (MMLU, HumanEval, GSM8K). Se presentan a continuacion tal como aparecen en la model card:

| Metrica | Valor |
|---|---|
| val_ppl | 69,69 |
| wiki_ppl | 75,66 |
| CoT ppl | 3321 |
| Pasos de entrenamiento | 100.000 |
| Solitones totales | 7 (L9-L15) |
| Onda 1 (paso 97.700) | lyap = -0,361 |
| Onda 2 (paso 99.100) | lyap = -0,546 |

Comparacion con el modelo par segun el autor:

| Metrica | r=16 (este modelo) | r=0 (DeepSpine) |
|---|---|---|
| CoT ppl | 3321 | 3761 |
| wiki_ppl | 75,66 | 75,27 |
| Topologia | Deep Tail (7 solitones, L9-L15) | Deep Spine (9 solitones, L10 singularidad) |
| Mejor para | Razonamiento CoT | Retencion de conocimiento tras SFT |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,8 GB de pesos (tamano del repo), mas overhead de activaciones y estado del optimizador si se entrena; en la practica, cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en fp16/bf16: en torno a 0,4 GB para pesos, mas activaciones; viable en GPUs integradas y consumer de gama baja.
- GPU recomendadas: cualquier GPU NVIDIA consumer (GTX 1650, RTX 3060, RTX 4090) o incluso CPU para inferencia por lotes pequenos; no requiere A100 ni H100.
- Cabe en GPU consumer: si, con amplio margen.
- Opciones de despliegue: no hay integracion con vLLM, llama.cpp, Ollama ni TGI documentada; el autor remite al repositorio de GitHub de DuoNeural para la clase del modelo y el codigo de inferencia, cargando el checkpoint con `torch.load`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-199M-DeepTail-Casimir-r16-Base | ~199M | no disponible | Apache-2.0 | Hugging Face (checkpoint .pt) | Arquitectura experimental Port-Hamiltonian |
| RMSN-199M-DeepSpine-Casimir-r0-Base | ~199M | no disponible | Apache-2.0 (segun par) | Hugging Face | Modelo par; mejor wiki_ppl (75,27), peor CoT ppl (3761) |
| GPT-2 small | 124M | 1024 tokens | MIT | Amplia | Transformer estandar, ecosistema maduro |
| Pythia-160M | 160M | 2048 tokens | Apache-2.0 | Amplia | Transformer estandar, entrenado en The Pile |

La comparacion con transformers estandar es orientativa: no se dispone de benchmarks comunes que permitan situar el RMSN frente a GPT-2 small o Pythia-160M en tareas estandar.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no esta disenado para dialogo ni para seguir ordenes de usuario.
- Entrenado unicamente sobre wikitext-103: sesgo de dominio hacia texto enciclopedico en ingles; riesgo elevado de alucinacion fuera de ese dominio.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Perplejidad CoT muy alta (3321): aunque sea la mejor de la familia, el valor absoluto indica un rendimiento de razonamiento limitado.
- Pesos en formato checkpoint PyTorch no estandar, sin integracion con `transformers`, lo que complica el despliegue en produccion.
- Sin descargas ni validacion externa: los resultados son autoinformados por el autor y no han sido replicados de forma independiente.
- La terminologia arquitectonica (solitones, haces, Casimir) es propia del autor y no cuenta con respaldo en la literatura revisada por pares en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y sesgo desaconseja su uso en produccion sin auditoria previa.
- Fecha de creacion futura (noviembre de 2026) y ausencia de traccion en la plataforma: tratar con cautela la madurez del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-199M-DeepTail-Casimir-r16-Base
- Modelo par (r=0, DeepSpine): https://huggingface.co/DuoNeural/RMSN-199M-DeepSpine-Casimir-r0-Base
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Repositorio GitHub de DuoNeural (clase del modelo e inferencia): referencia mencionada en la model card, URL no disponible en la informacion proporcionada.
- Paper (draft v0.7): "Resonant Metriplectic Sheaf Networks: A Unified Port-Hamiltonian Framework for Neural Language Modeling with Emergent Lyapunov Cascade Dynamics", Kuhl, Archon y Aura, DuoNeural Lab, 2026; URL no disponible.
