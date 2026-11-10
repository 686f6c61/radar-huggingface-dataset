# DuoNeural/RMSN-283M-Bulk-Tube-SFT

## Resumen

RMSN-283M-Bulk-Tube-SFT es un modelo de lenguaje causal de pequeno tamano (346,53 M de parametros segun la model card, aunque el identificador del repositorio indica 283M) desarrollado por DuoNeural Lab. Se presenta como una "Resonant Metriplectic Sheaf Network", una arquitectura propietaria basada en formulaciones port-hamiltonianas (ḟ = {f,H} + [f,S]) en lugar del transformer convencional, con una topologia interna denominada "bulk waveguide tube" que organiza las 16 capas en regiones con distinto rol funcional.

El modelo es un fine-tuning supervisado (SFT) sobre trazas de razonamiento chain-of-thought generadas por el propio laboratorio, entrenado durante 15.000 pasos. La propuesta tecnica central es el concepto de "Forgetting-Shield": la topologia de tubo actuaría como pantalla frente a la inyeccion de gradientes del SFT sobre los pesos fundacionales, preservando el conocimiento previo. Es relevante ahora unicamente como artefacto de investigacion experimental: no hay benchmarks publicos comparables, no hay pipeline declarado y el modelo no ha recibido descargas ni interacciones en Hugging Face.

La ventana de contexto declarada es de 512 tokens, el vocabulario de 49.152 entradas (tokenizer cosmo2) y el unico idioma soportado es el ingles. La licencia es Apache 2.0 y el repositorio ocupa 1,1 GB en formato de pesos PyTorch (`model.pt`), no safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (port-hamiltoniana, no transformer convencional) |
| Parametros totales | 346,53 M (segun model card); el ID del repo indica 283M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_seq_len=512`) |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en `model.pt`) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (`model.pt`, state_dict con clave `model_state`) |
| Dimension oculta | 1280 |
| Numero de capas | 16 |
| Workspace slots | 64 |
| Tokenizer | HuggingFaceTB/cosmo2-tokenizer (vocab=49152) |
| Libreria | custom (`rmsn_core`) |

## Arquitectura y entrenamiento

La arquitectura se describe como una red port-hamiltoniana con formulacion metriplectica (ḟ = {f,H} + [f,S]), es decir, un sistema dinamico que combina una parte conservativa (corchete de Poisson, {f,H}) y una parte disipativa (corchete metriplectico, [f,S]). Sobre esa base se define una topologia de "soliton" continuo de 6 capas (L8-L13) denominada bulk waveguide tube, con dos capas nucleo macroscopicas (L8 y L9, con PR=1.00, "dual singularity") y cuatro capas interiores de tubo, flanqueadas por capas buffer (L7, L14) y capas difusas de entrada y salida (L0, L15). El modelo declara 16 capas, dimension oculta 1280 y 64 slots de workspace.

El entrenamiento consistio en SFT sobre trazas de razonamiento CoT del propio laboratorio durante 15.000 pasos. La model card reporta una perdida SFT de 1,4798 y afirma estabilidad de Lyapunov del 100% (λ < 0 en todos los checkpoints). Se menciona una correspondencia cuantico-clasica mediante simulacion de circuitos con BlueQubit QCPU (ratio S_boundary/S_bulk = 0,569, anchura de bulk predicha 7-8 capas frente a 6 capas clasicas, error <8%), asi como una "ley" empirica segun la cual el SFT optimo para D=1280 se situa en 5.000-7.000 pasos. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles con contexto maximo de 512 tokens.
- Razonamiento chain-of-thought: el SFT se realizo explicitamente sobre trazas CoT, por lo que el modelo esta ajustado para producir cadenas de razonamiento antes de la respuesta.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas externas.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No se documenta vision, audio ni modo "thinking" separado.
- No se documenta uso de decodificacion especulativa ni atencion lineal.

## Casos de uso

- Investigacion sobre arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas reproducible para estudiar formulaciones port-hamiltonianas y metriplecticas en lenguaje natural, cargandolo con `rmsn_core` y comparando su perplejidad frente a transformers de tamano similar.
- Estudio del fenomeno "Forgetting-Shield": util para experimentos de catastrophic forgetting, comparando la retencion de conocimiento fundacional (wiki_ppl) tras distintos numeros de pasos de SFT en topologias de doble nucleo frente a nucleo unico.
- Generacion de cadenas de razonamiento cortas en ingles: adecuado para prototipos academicos de CoT donde la ventana de 512 tokens sea suficiente (problemas aritmeticos simples, clasificacion con justificacion).
- Validacion de la correspondencia cuantico-clasica: el modelo permite contrastar las predicciones del laboratorio sobre anchura de bulk y ratio de entropia con mediciones reales sobre los pesos.
- Reproduccion de experimentos de estabilidad dinamica: con λ_max declarado y estabilidad de Lyapunov, sirve para estudiar la dinamica de entrenamiento en sistemas disipativos.
- Docencia y divulgacion: ejemplo didactico de arquitectura no estandar con pesos abiertos y codigo de carga explicito, util en cursos avanzados de arquitecturas neuronales.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son metricas internas de perplejidad durante el SFT, no benchmarks estandar (MMLU, HumanEval, GSM8K no aparecen).

| Checkpoint | wiki_ppl (menor mejor) | cot_ppl (menor mejor) |
|---|---|---|
| 5k pasos | 176,01 (mejor retencion wiki) | 13,82 |
| 10k pasos | 199,77 | 11,24 |
| 15k pasos (mejor ckpt) | 208,68 | 10,77 |

Perdida SFT registrada: 1,4798. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,4 GB solo para pesos (346,53 M x 4 bytes), mas activaciones y overhead del runtime `rmsn_core`; en la practica el repositorio ocupa 1,1 GB.
- En FP16/BF16: alrededor de 0,7 GB de pesos, asumiendo que el codigo de `rmsn_core` soporte media precision (no documentado).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) deberia ser suficiente para inferencia en precision completa; A100/H100 no aportan ventaja por el tamano reducido.
- Cabe holgadamente en GPU consumer.
- Opciones de despliegue: unicamente mediante la libreria propietaria `rmsn_core` con `torch.load` del `model.pt`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ni pesos en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicos |
|---|---|---|---|---|---|
| RMSN-283M-Bulk-Tube-SFT | 346,53 M (card) | 512 | Apache 2.0 | PyTorch custom | Solo perplejidad interna |
| SmolLM2-360M (HuggingFace) | 360 M | 8.192 | Apache 2.0 | safetensors, GGUF | Si (MMLU, HellaSwag, etc.) |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | safetensors, GGUF | Si |
| TinyLlama-1.1B | 1,1 B | 2.048 | Apache 2.0 | safetensors, GGUF | Si |

La comparacion es desfavorable en contexto (512 frente a miles de tokens), interoperabilidad (formato propietario frente a safetensors/GGUF) y verificabilidad (sin benchmarks estandar). Su unico diferenciador es la arquitectura no convencional y el marco teorico del laboratorio.

## Limitaciones y advertencias

- Ausencia total de benchmarks estandar: no hay evidencia publica de calidad en MMLU, HumanEval, GSM8K ni tareas de razonamiento comparables.
- Contexto muy limitado (512 tokens): insuficiente para la mayoria de aplicaciones de produccion actuales.
- Solo ingles: inutilizable en castellano u otros idiomas sin riesgo alto de degradacion.
- Formato de pesos propietario (`model.pt` + `rmsn_core`): no compatible con el ecosistema estandar (vLLM, llama.cpp, Ollama, TGI), lo que bloquea despliegues convencionales.
- Inconsistencia entre el ID del repositorio (283M) y la model card (346,53M): conviene verificar el state_dict real antes de planificar recursos.
- Riesgo elevado de alucinacion: modelo de 346 M sin RLHF documentado y con SFT sobre trazas CoT sinteticas del propio laboratorio.
- Sesgos desconocidos: no se documenta composicion del dataset de entrenamiento ni proceso de filtrado.
- Afirmaciones no verificadas de forma independiente: "Forgetting-Shield", "correspondencia cuantico-clasica" y "ley del SFT optimo" son resultados internos del laboratorio sin replicacion externa.
- Cero descargas y cero likes en Hugging Face: sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y el formato propietario hacen desaconsejable su uso en produccion sin evaluacion previa propia.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-283M-Bulk-Tube-SFT
- Tokenizer referenciado: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
