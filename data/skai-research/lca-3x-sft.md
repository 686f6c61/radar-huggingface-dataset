# skai-research/lca-3x-sft

## Resumen

`skai-research/lca-3x-sft` es un modelo de lenguaje jerarquico y sin tokenizador (tokenizer-free) desarrollado por Skai Research, publicado bajo licencia Apache 2.0. Se trata del checkpoint `lca-3x-base` despues de un ajuste supervisado (SFT) sobre el dataset `allenai/tulu-3-sft-mixture`, lo que lo convierte en la variante orientada a seguir instrucciones de la familia LCA-MBP 3x. Con 373.882.945 parametros (374M) y un vocabulario de solo 261 entradas, el modelo opera directamente sobre bytes en lugar de sobre tokens subword.

La relevancia del modelo es principalmente de investigacion: es la pieza central de los resultados de decodificacion especulativa del articulo "Dynamic Multi-Byte Prediction With Hierarchical Language Models" (arXiv:2608.15454). Su innovacion consiste en predecir dinamicamente multiples bytes por paso latente (3,32 bytes por token latente segun los datos del autor), con una segmentacion aprendida de los limites entre bytes en lugar de una tokenizacion fija. La ventana de contexto esta expresada en bytes (4096) y la precision publicada es fp32.

Es importante senalar que no es una arquitectura `transformers`: requiere el codigo del repositorio `skai-research/lca-multibyte` para cargarse y generar. Ademas, la model card declara `inference: false`, por lo que no esta integrado en los pipelines estandar de HuggingFace. Su tamano reducido y su naturaleza experimental lo situan como una herramienta para reproducir resultados academicos y experimentar con modelos sin tokenizador, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer jerarquico sobre bytes, sin tokenizador (byte-level, hierarchical, tokenizer-free); atencion `prev_group_self`; `model_config` [2, (16,), 2, 2] |
| Parametros totales | 373.882.945 (374M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 bytes |
| Tipos de cuantizacion | no disponible (solo se publican pesos en fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,5 GB, precision fp32) |

Datos adicionales proporcionados por el autor: vocabulario de 261 entradas (256 bytes + `<pad>`, `</s>`, `<unk>`, `<en>`, `<eot>`), cabecera MBP adicional (dual head) y precision fp32.

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje jerarquico que trabaja a nivel de byte, con vocabulario de 261 entradas, es decir, sin tokenizador subword: el modelo recibe y emite bytes crudos. El tipo de atencion declarado es `prev_group_self` y la configuracion del modelo se resume en `model_config = [2, (16,), 2, 2]`, con una cabecera dual (`bp_dualhead` en el nombre del fichero de configuracion de entrenamiento). La prediccion multi-byte (MBP) permite que cada paso latente cubra varios bytes: el autor reporta 3,32 bytes por token latente en esta variante, y los limites de segmento son aprendidos, no fijados (la opcion `--show_tokenization` del repositorio los imprime). Mas alla de estos valores de configuracion, la informacion disponible no detalla el numero de capas, dimension de oculto ni el mecanismo exacto de enrutamiento entre niveles.

El entrenamiento consta de dos fases: preentrenamiento sobre `HuggingFaceFW/fineweb-edu` en el subconjunto `sample-100BT` y posterior SFT sobre `allenai/tulu-3-sft-mixture` durante 5 epocas, con tamano de lote 16 y semilla 42. La configuracion usada es `configs/train/modern_fxt_priors_0.3_en_lca_prev_group_self_256_scale_bp_dualhead.yaml`. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT. El articulo asociado plantea la prediccion dinamica multi-byte en el contexto de decodificacion especulativa, ambito en el que este checkpoint actua como modelo de instrucciones de referencia.

## Capacidades

- Generacion de texto en ingles tras SFT sobre Tulu: es un modelo de seguimiento de instrucciones (chat formateado), segun la model card.
- Prediccion multi-byte con cabecera dual: ademas de la cabecera principal, incorpora una cabecera MBP especifica (loss de 5,153 en test de Tulu).
- Procesamiento a nivel de byte sin tokenizador: puede manejar cualquier secuencia de bytes, incluidos caracteres Unicode y texto con ruido o errores tipograficos, sin depender de un vocabulario subword.
- Segmentacion latente aprendida: el modelo determina dinamicamente los limites de segmento (consultables con `--show_tokenization`).
- Modo de generacion especulativa propia (`--mode self_speculative`) para los experimentos de decodificacion del articulo.
- Razonamiento, codigo, matematicas, vision, audio: no disponible (no se documentan capacidades especificas de este tipo).
- Tool calling / function calling: no disponible (no se menciona soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: no; el modelo esta etiquetado unicamente para `en`.

## Casos de uso

- Investigacion en decodificacion especulativa: el modelo es, segun el autor, el checkpoint de instrucciones empleado en los resultados de decodificacion especulativa del articulo. Se usaria invocando `src/eval/generate.py --mode self_speculative` para reproducir o extender esos experimentos con la cabecera MBP.
- Estudio de modelos sin tokenizador: permite comparar una arquitectura byte-level con vocabulario de 261 entradas frente a modelos subword de tamano similar, aislando el efecto del tokenizador en calidad y coste de inferencia.
- Analisis de segmentacion aprendida: la opcion `--show_tokenization` permite inspeccionar como el modelo agrupa bytes en segmentos latentes, util para estudiar si la segmentacion emerge alineada con morfemas o palabras en ingles.
- Robustez ante entradas ruidosas: al operar sobre bytes crudos, resulta adecuado para experimentos con texto mal formado, tipografias mixtas, emojis o secuencias Unicode que degradan tokenizadores subword convencionales.
- Reproduccion de pipelines de SFT sobre Tulu: con la configuracion publicada (5 epocas, lote 16, semilla 42) sirve como punto de partida para ablaciones sobre la mezcla de instrucciones de Tulu en arquitecturas jerarquicas.
- Prototipado de bajo coste en una sola GPU consumer: con 374M parametros en fp32 (1,5 GB de pesos) se puede cargar y ejecutar en GPUs de gama media para pruebas de generacion en ingles sin infraestructura dedicada.
- Evaluacion comparativa de cabeceras duales: la diferencia entre la loss de la cabecera principal (4,459) y la de la cabecera MBP (5,153) sobre el test de Tulu ofrece un punto de partida para estudiar el coste de la prediccion multi-byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos aportados por el autor son metricas de perdida sobre el test de Tulu, que el propio autor advierte que no son comparables al BPC de preentrenamiento del modelo base:

| Metrica | Valor |
|---|---|
| Tulu test loss (cabecera principal) | 4,459 |
| Tulu test loss (cabecera MBP) | 5,153 |
| Bytes por token latente | 3,32 |

La busqueda web realizada no devolvio ningun resultado relacionado con este modelo, por lo que no hay datos adicionales de evaluacion externa.

## Requisitos de hardware

- VRAM para inferencia (estimacion aritmetica a partir del numero de parametros, ya que no hay checkpoints cuantizados publicados): ~1,5 GB en fp32 (precision publicada), ~0,75 GB en fp16/bf16, ~0,4 GB en int8. A estas cifras hay que anadir el estado de la atencion sobre 4096 bytes de contexto, cuyo tamano no se detalla en la informacion disponible.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs con 4-6 GB de VRAM en fp16. El ejemplo de carga del autor usa `device="cuda"` sin especificar modelo de GPU.
- GPU de centro de datos (A100, H100) solo serian necesarias para reentrenamiento o para ejecucion de barridos de evaluacion a gran escala.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp u Ollama de forma directa, ya que no implementa una arquitectura `transformers` ni publica pesos en GGUF. La via soportada es el repositorio `skai-research/lca-multibyte` con `load_fxt_model` y el script `src/eval/generate.py`, con PyTorch como backend.
- La model card incluye `inference: false` en sus metadatos, lo que indica que el modelo no esta preparado para los pipelines de inferencia estandar de HuggingFace.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye benchmarks comparativos. La siguiente tabla contrasta caracteristicas estructurales con otros modelos byte-level publicos; los datos de terceros proceden de su documentacion publica y no han sido verificados en la informacion suministrada:

| Modelo | Parametros | Nivel de tokenizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lca-3x-sft | 374M | Byte (sin tokenizador, 261 entradas) | 4096 bytes | apache-2.0 | safetensors + codigo propio |
| ByT5 (Google) | 300M / 580M / 1,2B | Byte (vocabulario de 256 bytes) | no disponible | apache-2.0 | transformers |
| CANINE (Google) | 133M | Caracteres codificados a nivel de codepoint | no disponible | apache-2.0 | transformers |
| Byte Latent Transformer (Meta) | 400M / 1B / 7B | Byte con parches dinamicos | no disponible | no disponible | publicacion de investigacion |

Comparativa de rendimiento: no disponible, ya que el autor solo publica perdidas sobre el test de Tulu y no existen resultados de benchmarks estandar para este checkpoint.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: la etiqueta de idioma es `en` y no se documenta soporte multilingue, pese a operar a nivel de byte.
- No es una arquitectura `transformers`: no se carga con `AutoModel.from_pretrained`, lo que rompe la compatibilidad con el ecosistema habitual (vLLM, TGI, Ollama, llama.cpp, herramientas de cuantizacion).
- La model card declara `inference: false`, lo que sugiere que el modelo no esta listo para su uso en pipelines estandar de HuggingFace.
- Precision publicada en fp32 y sin versiones cuantizadas: el uso en produccion con requisitos de memoria bajos exigiria cuantizar por cuenta propia, sin garantia de que el flujo funcione con herramientas estandar.
- Naturaleza de investigacion: no se publican evaluaciones de alineacion, seguridad ni tasas de alucinacion. Al ser un SFT de 5 epocas sobre Tulu, es esperable un riesgo de alucinacion no cuantificado, pero no hay datos concretos en la informacion disponible.
- Sesgos: no disponible (no se documenta ningun analisis de sesgos).
- Contexto limitado a 4096 bytes, muy inferior al de modelos contemporaneos, lo que restringe tareas de contexto largo.
- Volumen de adopcion practicamente nulo: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente y de reportes de errores por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero la falta de soporte en herramientas estandar y la ausencia de garantias de calidad hacen desaconsejable su uso en produccion sin una evaluacion previa propia.
- No se documenta soporte de tool calling, agentes, vision ni audio, por lo que no debe asumirse ninguna de estas capacidades.

## Enlaces

- HuggingFace: https://huggingface.co/skai-research/lca-3x-sft
- Modelo base: https://huggingface.co/skai-research/lca-3x-base
- Articulo: https://arxiv.org/abs/2608.15454 (Owodunni, A. T.; Okocha, C.; Grant, C.; Limisiewicz, T.; Kumar, S. "Dynamic Multi-Byte Prediction With Hierarchical Language Models", 2026)
- Repositorio de codigo: https://github.com/skai-research/lca-multibyte
- Dataset de SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Nota sobre la busqueda web: no se encontro ningun resultado relevante sobre este modelo; los unicos resultados devueltos trataban sobre configuracion de energia en Windows 11 y no guardan relacion con el modelo.
