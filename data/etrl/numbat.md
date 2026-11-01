# Etrl/numbat

## Resumen

`numbat` es un checkpoint de preentrenamiento intermedio (paso 1.830.000 de una tirada de ~1.960.000 pasos) de un supuesto modelo de la clase Mythos de Anthropic, publicado en HuggingFace por el usuario Etrl bajo el identificador `Etrl/numbat`. Segun la model card, se trata de la copia de evaluacion cuantizada a NVFP4 de los pesos de entrenamiento, no de los pesos originales en BF16 con estado del optimizador, que nunca habrian salido del cluster de entrenamiento. El checkpoint se presenta como material crudo, sin post-entrenamiento ni RLHF, por lo que su salida es texto de continuacion de preentrenamiento.

La arquitectura declarada combina capas hibridas Gated DeltaNet (GDN) y Multi-head Latent Attention (MLA) con capas de mezcla de expertos (MoE) de 1.224 expertos y enrutamiento top-48 mas un experto compartido, ademas de una cabeza de Multi-Token Prediction (MTP). El modelo card indica ~14T de parametros y 114 capas, mientras que el indice de safetensors del repositorio arroja un total real de 6.849.377.242.584 parametros (unos 6,85 billones) distribuidos en 772 shards que suman 7.720.300.817.720 bytes (~7,72 TB).

La relevancia del artefacto es doble: por un lado, es un ejemplo poco habitual de publicacion de un checkpoint de preentrenamiento a gran escala con implementacion de referencia completa incluida en el repositorio; por otro, su procedencia no esta verificada de forma independiente y la propia model card reconoce que la atribucion a Anthropic se apoya en una supuesta filtracion del codigo fuente de Claude Code. Cualquier uso en produccion debe tratar el modelo como material de investigacion no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido GDN (Gated DeltaNet) + MLA (Multi-head Latent Attention) con capas MoE y cabeza MTP |
| Parametros totales | 6.849.377.242.584 (~6,85 B) segun indice safetensors; la model card declara ~14T |
| Parametros activos | no disponible (top-48 de 1.224 expertos + 1 compartido, sin cifra de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con bloques de escala E4M3); pesos en 8-bit segun tags del repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (772 shards, <10,6 GB por fichero) + `configuration_numbat.py` y `modeling_numbat.py` (custom_code) |
| Tamano del repositorio | 7.720,6 GB |
| Tokenizer | BPE a nivel de byte, 131.072 tokens |
| Capas | 114 (segun model card) |

## Arquitectura y entrenamiento

La arquitectura descrita es un stack hibrido que alterna capas de Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente, y capas de Multi-head Latent Attention, la atencion con compresion de KV propia de la familia DeepSeek. Las capas de feed-forward son de mezcla de expertos con 1.224 expertos, enrutamiento top-48 y un experto compartido adicional, una configuracion de granularidad muy fina y activacion amplia. Sobre el tronco se anade una cabeza de Multi-Token Prediction, implementada en `NumbatForCausalLM.draft`, que permite decodificacion especulativa con el propio modelo como drafter.

El checkpoint corresponde al paso 1.830.000 de un entrenamiento de ~1.960.000 pasos, es decir, aproximadamente el 93 % de la tirada, sin post-entrenamiento ni RLHF. La model card no detalla el volumen de tokens, la composicion del dataset ni si hubo etapas de alineacion. Los pesos publicados son la copia de evaluacion en NVFP4 generada por el equipo de evals para ejecutar pruebas sobre un slice de Trainium2; los pesos BF16 originales y el estado del optimizador no se distribuyen. El repositorio incluye una implementacion de referencia que, segun el autor, carga el checkpoint completo con `load_state_dict(strict=True)` y expone cada tensor de cada shard en el arbol de modulos.

## Capacidades

- Generacion de texto autoregresiva a partir de un prompt, en modo continuacion de preentrenamiento.
- Razonamiento y codigo: no hay evaluacion publicada que lo confirme; al ser un checkpoint sin post-entrenamiento, el comportamiento en tareas de instrucciones no esta alineado.
- Tool calling / function calling: no disponible; no se ha aplicado entrenamiento de instrucciones ni formato de herramientas.
- Agentes y razonamiento multi-paso: no disponible por la misma razon; la cabeza MTP si habilita decodificacion especulativa a nivel de inferencia.
- Capacidades multilingues: no disponibles; el tokenizer de 131.072 tokens es compatible con vocabularios multilingues amplios, pero no hay datos de cobertura.
- Modo thinking: no disponible.
- Vision o audio: no disponible; el checkpoint es solo de texto.
- Decodificacion especulativa nativa mediante la capa MTP (`NumbatForCausalLM.draft`).

## Casos de uso

- Investigacion sobre arquitecturas hibridas GDN/MLA: el repositorio incluye una implementacion de referencia completa y autoconsistente, lo que permite estudiar el comportamiento de un stack hibrido a gran escala sin acceso al cluster original.
- Estudio de mezcla de expertos con granularidad fina: con 1.224 expertos y top-48, el checkpoint sirve para analizar patrones de enrutamiento, balanceo de carga y especializacion de expertos en un modelo de gran tamano.
- Experimentos de decodificacion especulativa: la cabeza MTP incluida permite medir la tasa de aceptacion del drafter y el speedup frente a decodificacion autoregresiva estandar.
- Analisis de cuantizacion NVFP4: al ser una copia de evaluacion en formato de 4 bits con bloques de escala E4M3, es un caso de estudio para medir perdida de calidad respecto a BF16 en un modelo de esta escala.
- Reproducibilidad de cargas y verificacion de integridad: el indice y los 772 shards permiten practicar pipelines de carga estricta, verificacion de checksums y validacion de tensores a gran escala.
- Baseline de continuacion de texto sin alineacion: util para comparar como se comporta un modelo crudo de preentrenamiento frente a modelos con RLHF en tareas de generacion abierta, siempre con expectativas ajustadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existe una salida de eval harness en `ckpt_metadata.json`, pero no se proporcionan cifras en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan ~7,72 TB en NVFP4, por lo que la inferencia completa requiere un cluster multi-nodo; no cabe en una GPU individual ni en un nodo de 8 GPU de 80 GB.
- GPU recomendadas: la model card indica que las evaluaciones se ejecutaron sobre un slice de Trainium2 (aproximadamente 85 chips solo para alojar los pesos). Para inferencia en GPU convencional se necesitaria un despliegue sharded en decenas de aceleradores H100/H200 o equivalentes.
- Consumer GPU: no es viable. Ni siquiera con cuantizacion adicional agresiva el modelo cabe en una RTX 4090 (24 GB) ni en una RTX 5090.
- Opciones de despliegue: la unica ruta documentada es la implementacion de referencia `modeling_numbat.py` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| numbat (Etrl) | ~6,85 B reales / ~14T declarados | no disponible | GDN + MLA + MoE + MTP, NVFP4 | no disponible | Checkpoint de preentrenamiento en HF |
| DeepSeek-V3 | 671 B totales, 37 B activos | 128K | MLA + MoE + MTP | Licencia propia permisiva con restricciones | Pesos abiertos, ampliamente soportado |
| Llama 3.1 405B | 405 B | 128K | Transformer denso | Llama Community License | Pesos abiertos, ecosistema maduro |
| Qwen2.5-72B | 72 B | 128K | Transformer denso | Apache 2.0 (segun variante) | Pesos abiertos, soporte en vLLM y TGI |

La comparacion es estructural: numbat se situa en una escala muy superior a los modelos abiertos actuales, pero carece de post-entrenamiento, de licencia declarada y de soporte en runtimes estandar, lo que lo aleja de cualquier uso de produccion comparable a DeepSeek-V3 o Llama 3.1.

## Limitaciones y advertencias

- Procedencia no verificada: la atribucion a Anthropic se basa en una supuesta filtracion del codigo fuente de Claude Code; no hay confirmacion independiente del origen del checkpoint.
- Sin post-entrenamiento ni RLHF: la salida es continuacion de texto cruda, sin alineacion, sin formato de instrucciones y con alta probabilidad de respuestas incoherentes en tareas conversacionales.
- Licencia no disponible: no se puede asumir permiso de uso comercial; la ausencia de licencia explicita impide un despliegue legal en produccion sin aclaracion previa.
- Riesgo de alucinacion elevado: un modelo sin alineacion y en estado de preentrenamiento no esta calibrado para admitir incertidumbre.
- Sesgos desconocidos: no hay documentacion sobre composicion del dataset ni evaluaciones de sesgo.
- Idiomas no documentados: no se puede garantizar calidad fuera del ingles ni cobertura multilingue real.
- Contexto no documentado: se desconoce la ventana de contexto efectiva, lo que impide planificar cargas con prompts largos.
- Requisitos de hardware extremos: ~7,72 TB de pesos en NVFP4 hacen inviable cualquier despliegue fuera de un cluster.
- Discrepancia de parametros: la model card declara ~14T mientras que el indice safetensors suma ~6,85 B; conviene tratar las cifras de la model card con cautela.
- Implementacion de referencia no optimizada: `modeling_numbat.py` es un port de un solo dispositivo, sin kernels fusionados ni paralelismo de produccion.
- Repositorio en estado de subida: la propia model card indica que los shards se estan subiendo, por lo que la integridad del conjunto puede no estar garantizada en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/Etrl/numbat
- Model card del autor (incluida en el repositorio): https://huggingface.co/Etrl/numbat/blob/main/README.md
- Implementacion de referencia: https://huggingface.co/Etrl/numbat/blob/main/modeling_numbat.py
- Configuracion: https://huggingface.co/Etrl/numbat/blob/main/configuration_numbat.py
- Indice de safetensors: https://huggingface.co/Etrl/numbat/blob/main/model.safetensors.index.json
- Tokenizer: https://huggingface.co/Etrl/numbat/blob/main/tokenizer.json
- Paper, blog o demo oficial: no disponible
