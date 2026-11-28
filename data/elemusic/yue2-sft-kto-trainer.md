# elemusic/yue2-sft-kto-trainer

## Resumen

`elemusic/yue2-sft-kto-trainer` no es un modelo generativo en sentido estricto, sino un motor de entrenamiento y un cargador de inferencia para adaptadores LoRA sobre el modelo de generacion musical `m-a-p/YuE2-3B`. El repositorio contiene `yue2_kto.py`, un motor de alineamiento que combina un calentamiento SFT con rejection sampling y una fase posterior de Kahneman-Tversky Optimization (KTO), y `yue2_instrumental_lora.py`, un cargador de inferencia sin wrappers compatible con CUDA graphs. Lo publica eleMusic Labs bajo licencia Apache-2.0.

El objetivo es resolver dos modos de fallo detectados al aplicar KTO estandar sobre los tokens semanticos musicales de YuE2 (vocabulario seleccionable de 32.769 tokens en el rango `[151852 .. 184620]`): la supresion del token de fin de pieza `<|music_end|>` (id 151852), que provoca truncamientos por agotamiento de tokens a 360 segundos, y la deriva fuera de la variedad acustica en KTO multi-epoca sin anclaje SFT. El trainer incorpora correcciones especificas para ambos problemas, con resultados reportados de terminacion natural de cadencia del 100% en evaluaciones retenidas.

Es relevante para desarrolladores e investigadores que quieran afinar YuE2-3B para generacion instrumental con LoRA de rango 16 o 32, manteniendo intactos el planificador de partituras, el modulo NAR y el VAE del modelo base. El repositorio incluye ademas dos adaptadores preentrenados de investigacion (bajo CC BY-NC 4.0) como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de entrenamiento (SFT + KTO) y cargador LoRA para `m-a-p/YuE2-3B` (modelo base de generacion musical autorregresiva) |
| Parametros totales | No disponible (el repositorio contiene scripts de entrenamiento; los adaptadores LoRA son de rango 16 y 32) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (segun metadatos del repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | `adapter.safetensors` (392 tensores FP32 `lora_a`/`lora_b` con metadatos `yue2_lora_meta`) y `ar_lora_folded.safetensors` (formato `ms-lora` plegado) |

## Arquitectura y entrenamiento

El trainer opera sobre el modelo base `m-a-p/YuE2-3B` de HKGAI/HKUST/Multimodal Art Projection, aplicando adaptadores LoRA exclusivamente en la etapa semantica autorregresiva. El pipeline de entrenamiento tiene dos fases: primero ejecuta entre 1 y 2 epocas de SFT con rejection sampling sobre rollouts deseables limpios, y despues aplica KTO con una tasa de aprendizaje moderada (`lr = 6e-5 .. 8e-5`), un anclaje SFT conjunto continuo (`sft_anchor_weight = 0.20`) y una guarda de deriva basada en el log-ratio de validacion (`val.desirable_logratio >= -0.25`).

Las dos innovaciones tecnicas documentadas son: (1) la eliminacion del token `MUSIC_END` final de los `target_ids` no deseables para no penalizar la probabilidad de terminacion, junto con un peso aumentado de ese token (`end_token_weight = 25.0`) en rollouts deseables limpios; y (2) el anclaje SFT continuo para evitar la memorizacion de pares y la deriva fuera de la variedad acustica que se observa en KTO puro multi-epoca (`sft_epochs=0`, `lr=2e-4`), donde la similitud melodica en retencion cae de 0.675 a 0.379. El trainer garantiza ademas divisiones disjuntas estrictas por grupo de prompt y por ID de pieza, con deduplicacion por hash SHA-256 de prefijo y de tokens semanticos, y sin fuga de composicion ni de prompt de estilo entre `train`, `val` y `test`.

## Capacidades

- Entrenamiento de adaptadores LoRA de rango 16 y 32 sobre la etapa semantica de YuE2-3B.
- Calentamiento SFT con rejection sampling sobre rollouts deseables.
- Alineamiento KTO (Kahneman-Tversky Optimization) con anclaje SFT conjunto.
- Correccion del modo de fallo de supresion de `<|music_end|>` mediante eliminacion del token final y reponderacion (`end_token_weight = 25.0`).
- Guarda de deriva por log-ratio de validacion para detectar desviaciones del manifold acustico.
- Divisiones de datos disjuntas por grupo de prompt y por ID de pieza con deduplicacion SHA-256.
- Exportacion dual: `adapter.safetensors` (formato nativo con metadatos) y `ar_lora_folded.safetensors` (formato `ms-lora` plegado).
- Cargador de inferencia sin wrappers y seguro para CUDA graphs (`yue2_instrumental_lora.py`), basado en el patron delta-context de `stevensu/YuE2-3B-instrumental-kto-lora`.
- Entrenamiento sobre partituras verificadas anteriores a 1900 de dominio publico o CC0, con etiquetado mediante `elemusic-melodia-v1` y `elemusic-voicedetect-v1`.

## Casos de uso

- Afinar YuE2-3B para generacion instrumental sin sangrado vocal: el trainer elimina el token de fin de los ejemplos no deseables y repondera la terminacion limpia, de modo que los adaptadores resultantes producen cadencias naturales en lugar de truncamientos a 360 segundos.
- Investigacion en alineamiento con KTO sobre dominios no textuales: el codigo sirve como referencia reproducible para aplicar optimizacion por preferencias a tokens de codec semantico, con guardas de deriva y anclaje SFT medibles.
- Generacion de covers de partituras ABC de movimiento completo (3:00-6:00): el adaptador de referencia `YuE2-3B-elemusic-kto-v3` (rango 32, 139,5 MB) esta entrenado para este escenario con el 100% de cadencias naturales.
- Produccion de lead sheets y covers de camara o acusticos: el adaptador `YuE2-3B-elemusic-lead-v1` (rango 16, 69,8 MB, la mitad de tamano) reporta un 90,91% de precision de preferencia en el conjunto de test retenido, adecuado para entornos con presupuesto de memoria ajustado.
- Creacion de un corpus musical libre de derechos: el pipeline entrena exclusivamente sobre partituras anteriores a 1900 de dominio publico o CC0, lo que simplifica la trazabilidad legal del material generado.
- Integracion en un estudio MIDI en navegador: el cargador `yue2_instrumental_lora.py` es compatible con CUDA graphs y no requiere wrappers, lo que facilita su incorporacion en servicios de generacion musical de baja latencia.
- Reproduccion de experimentos de ablacion: el repositorio documenta los hiperparametros y los modos de fallo diagnosticados, lo que permite replicar las comparaciones entre KTO puro y KTO anclado en SFT.

## Benchmarks y rendimiento

| Metrica | KTO estandar (sin anclaje) | Este trainer (SFT + KTO anclado) |
|---|---|---|
| Terminacion natural de cadencia en evaluacion retenida multi-minuto | No disponible de forma agregada (mas del 84% de los rollouts no deseables terminan con `MUSIC_END`, lo que provoca truncamientos a 360 s) | 100% |
| Similitud melodica en retencion (KTO multi-epoca, `sft_epochs=0`, `lr=2e-4`) | 0.379 | 0.675 (referencia de partida sin deriva) |
| Precision de preferencia en test retenido (`YuE2-3B-elemusic-lead-v1`, rango 16) | No disponible | 90,91% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende del modelo base `m-a-p/YuE2-3B` (3B parametros) y del adaptador LoRA cargado (69,8 MB para rango 16, 139,5 MB para rango 32).
- GPU recomendadas: no disponible de forma explicita. El cargador menciona compatibilidad con CUDA graphs, lo que implica GPU NVIDIA.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio proporciona `yue2_instrumental_lora.py` como cargador de inferencia sin wrappers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Repositorio | Tipo | Parametros del adaptador | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `elemusic/yue2-sft-kto-trainer` (este) | Trainer SFT + KTO y cargador LoRA | Rango 16 (69,8 MB) y rango 32 (139,5 MB) | No disponible | Apache-2.0 | Correccion de supresion de `MUSIC_END` y anclaje SFT; exportacion dual |
| `stevensu/YuE2-3B-instrumental-kto-lora` | Adaptador LoRA KTO instrumental | No disponible | No disponible | No disponible | Origen del patron delta-context del cargador |
| `Mothersuperior/YuE2-instrumental-cot-full-loras` | LoRA completos con chain-of-thought instrumental | No disponible | No disponible | No disponible | Exploracion comunitaria pionera de LoRA instrumentales en YuE2 |

## Limitaciones y advertencias

- El repositorio no contiene pesos de un modelo generativo completo: es un motor de entrenamiento y un cargador. Requiere descargar `m-a-p/YuE2-3B` y `YuE2-Vae` por separado.
- Los adaptadores preentrenados de referencia (`YuE2-3B-elemusic-kto-v3` y `YuE2-3B-elemusic-lead-v1`) se distribuyen bajo CC BY-NC 4.0, no bajo Apache-2.0, por lo que su uso comercial esta restringido.
- El entrenamiento esta limitado a partituras anteriores a 1900 de dominio publico o CC0; el sesgo estilistico del corpus condiciona la distribucion de salida hacia generos historicos.
- Los metadatos declaran unicamente ingles como idioma, aunque se trata de un modelo musical y no de texto.
- Riesgo de deriva fuera de la variedad acustica si se omite el anclaje SFT o se usa una tasa de aprendizaje alta; el propio autor documenta la caida de similitud melodica de 0.675 a 0.379 en ese escenario.
- La guarda de deriva se basa en un umbral de log-ratio (`val.desirable_logratio >= -0.25`) que puede no ser apropiado para otros corpus o estilos.
- No se han publicado datos de VRAM, latencia ni throughput, lo que dificulta planificar el despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/elemusic/yue2-sft-kto-trainer
- Repositorio en GitHub: https://github.com/eleMusicLabs/yue2-sft-kto-trainer
- Modelo base: https://huggingface.co/m-a-p/YuE2-3B
- Adaptador `elemusic/YuE2-3B-elemusic-kto-v3`: https://huggingface.co/elemusic/YuE2-3B-elemusic-kto-v3
- Adaptador `elemusic/YuE2-3B-elemusic-lead-v1`: https://huggingface.co/elemusic/YuE2-3B-elemusic-lead-v1
- Adaptador comunitario `stevensu/YuE2-3B-instrumental-kto-lora`: https://huggingface.co/stevensu/YuE2-3B-instrumental-kto-lora
- Adaptador comunitario `Mothersuperior/YuE2-instrumental-cot-full-loras`: https://huggingface.co/Mothersuperior/YuE2-instrumental-cot-full-loras
- Herramienta de etiquetado `elemusic-melodia-v1`: https://github.com/eleMusicLabs/elemusic-melodia
- Coleccion de Hugging Face de eleMusic: https://huggingface.co/collections/elemusic/elemusic-open-music-mir-and-yue2-tools-6b0a53fa62edc30a0fe65ec8
- Estudio MIDI en navegador: https://elemusic.studio
- GitHub de eleMusic Labs: https://github.com/eleMusicLabs
- Web de eleMusic Labs: https://studio.elemusiclabs.com
- Paper de KTO: Ethayarajh, Xu, Muennighoff, Jurafsky y Kiela, *KTO: Model Alignment as Prospect Theoretic Optimization* (ICML 2024)
