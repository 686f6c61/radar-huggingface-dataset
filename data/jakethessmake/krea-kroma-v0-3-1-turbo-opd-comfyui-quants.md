# jakethessmake/Krea-Kroma-v0.3.1-Turbo-OPD-ComfyUI-Quants

## Resumen

Este repositorio contiene tres versiones cuantizadas del punto de control `kroma-v0.3.1-turbo-opd.safetensors`, un ajuste fino de Krea 2 desarrollado por lodestones bajo el nombre Kroma. La cuantizacion la firma el usuario jakethessmake y emplea los formatos nativos de ComfyUI, de modo que los ficheros se cargan directamente con el nodo Load Diffusion Model sin conversiones adicionales. No se ha reentrenado nada: solo cambia el formato numerico de los pesos.

Kroma v0.3.1 es un turbo checkpoint destilado mediante on-policy distillation (OPD) que se mantiene dentro de la distribucion del modelo base. Al ser un modelo de difusion texto-a-imagen, su interes practico esta en generar imagenes a partir de prompts en 8-12 pasos con CFG en torno a 1,0-1,5, lo que reduce mucho el coste de inferencia frente a los muestreos tradicionales de 30-50 pasos.

La relevancia de este repositorio concreto es el ahorro de memoria: el original en bf16 ocupa aproximadamente 26 GB, mientras que las variantes publicadas aqui bajan a 13 GB (int8), 10 GB (w6a8) y 7 GB (w4a8), con errores relativos medios de peso de 1,0 %, 2,1 % y 7,3 % respectivamente. Eso permite ejecutar el modelo en GPU de consumo de gama alta y media-alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador de difusion con bloques de fusion de texto (la model card menciona 224 pesos lineales cuantizados en los bloques principales del transformador y bloques de text-fusion separados); detalle completo no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen); el codificador de texto es Qwen3-VL 4B y su longitud de contexto no se detalla en la informacion disponible |
| Tipos de cuantizacion | int8 tensorwise con ConvRot (grupo 256); w6a8 (6 bits uniforme, grupo 16, escalas fp8 por grupo y fp32 por canal); asym w4a8 int8 con codebook Lloyd-Max (grupo 16) |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (Krea 2 Community License Agreement) |
| Formato de pesos | safetensors con serializacion nativa de ComfyUI (`QuantizedTensor.state_dict` mas etiqueta `comfy_quant` por capa) |
| Tamano de los ficheros | ~13 GB (int8 convrot), ~10 GB (w6a8), ~7 GB (w4a8); el original bf16 ~26 GB |
| Modelo base | lodestones/Kroma, `kroma-v0.3.1-turbo-opd.safetensors` (ajuste fino de Krea 2) |
| Codificador de texto | Krea 2 (`qwen3vl_4b_*`), tipo `krea2` en ComfyUI |
| VAE | `qwen_image_vae` |
| Resolucion de referencia | 1024 x 1024 (segun el ejemplo comparativo de la model card) |
| Repositorio | 34,8 GB en total (los tres ficheros cuantizados) |

## Arquitectura y entrenamiento

El punto de partida es Krea 2, un modelo de difusion texto-a-imagen, sobre el que lodestones aplico un ajuste fino con destilacion on-policy (OPD) para producir el checkpoint turbo v0.3.1. La model card de este repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion no esta disponible. Lo que si se indica es que la destilacion mantiene el checkpoint dentro de la distribucion del modelo base y que el entrenamiento con LoRA se conserva.

Este repositorio no aporta entrenamiento nuevo. Su unico cambio es el formato numerico de los pesos, generado con los cuantizadores de comfy-kitchen (`TensorWiseINT8Layout` y `AsymW4A8Int8Layout`) y serializado con el sistema propio de ComfyUI. Solo se cuantizan los 224 pesos lineales de los bloques principales del transformador; los bloques de fusion de texto, las capas de entrada y salida, las normalizaciones y los sesgos conservan su precision original. Esa decision es la misma que adoptan los ficheros oficiales `krea2_*_int8_convrot` de Comfy-Org, y explica por que la degradacion es contenida incluso en la variante de 4 bits.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) con el pipeline de Krea 2.
- Inferencia rapida en modo turbo: 8-12 pasos con CFG entre 1,0 y 1,5, sampler `euler` y scheduler `simple`.
- Seguimiento de prompt solido y rango estilistico amplio, segun las pruebas de terceros recogidas en la informacion disponible.
- Comportamiento descrito como sin censura por parte de revisores externos, sin los artefactos de anatomia deformada habituales en otros ajustes finos.
- Compatibilidad con el flujo nativo de Krea 2 en ComfyUI, incluido el desplazamiento por defecto de 1,15 para el sampler.
- Soporte de LoRA heredado del modelo base, segun la model card del punto de control original.
- Soporte de tool calling, agentes, vision o audio: no aplica (es un modelo de difusion de imagenes).
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de imagenes en estaciones de trabajo con GPU de 16 GB: la variante w4a8 ocupa unos 7 GB y permite trabajar a 1024 x 1024 con samplers rapidos, algo inviable con el bf16 original.
- Produccion de ilustracion conceptual en estudios pequenos: el modo turbo con 8-12 pasos reduce el coste por imagen y hace viable la iteracion sobre decenas de variantes por sesion.
- Prototipado de assets para videojuegos y producto: el amplio rango estilistico descrito por los revisores permite cubrir desde realismo hasta estilos ilustrados sin cambiar de modelo.
- Flujos de trabajo por lotes en ComfyUI: al integrarse como nodo Load Diffusion Model con serializacion nativa, el modelo se puede encadenar con nodos de upscaling, inpainting o ControlNet dentro de la misma grafica.
- Despliegue en servidores con GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G) usando la variante int8 convrot, que mantiene un error relativo de peso del 1,0 % y el mayor parecido con el original.
- Pruebas de investigacion sobre cuantizacion de modelos de difusion: los tres niveles publicados (1,0 %, 2,1 % y 7,3 % de error relativo) permiten medir el impacto de la precision numerica en la composicion final de la imagen.
- Ajuste fino posterior con LoRA: al conservar el resto de capas en su precision original y mantener la estructura del modelo base, los adaptadores entrenados sobre Kroma deberian seguir siendo aplicables.
- Generacion de contenido editorial o de marketing que requiera control fino de prompt, apoyandose en la fidelidad de prompt reportada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de FID, CLIP score, GenEval ni comparaciones numericas con otros modelos de imagen. Los unicos datos cuantitativos publicados son el error relativo medio de los pesos cuantizados y una comparacion visual con semilla fija.

| Metrica | bf16 (original) | int8 convrot | w6a8 | w4a8 |
|---|---|---|---|---|
| Error relativo medio de pesos en capas cuantizadas | referencia | 1,0 % | 2,1 % | 7,3 % |
| Tamano del fichero | ~26 GB | ~13 GB | ~10 GB | ~7 GB |
| Semilla | 1234 | 1234 | 1234 | 1234 |
| Pasos | 8 | 8 | 8 | 8 |
| CFG | 1 | 1 | 1 | 1 |
| Sampler / scheduler | euler / simple | euler / simple | euler / simple | euler / simple |
| Resolucion | 1024 x 1024 | 1024 x 1024 | 1024 x 1024 | 1024 x 1024 |
| Observacion cualitativa | referencia | sigue de cerca al original | sigue de cerca al original | imagen limpia, pero con mayor deriva en la composicion |

## Requisitos de hardware

- VRAM estimada a partir del tamano de los ficheros, sin contar el codificador de texto ni el VAE: w4a8 ~7 GB, w6a8 ~10 GB, int8 convrot ~13 GB, bf16 original ~26 GB. Hay que sumar el espacio del codificador Qwen3-VL 4B y del VAE, mas las activaciones.
- GPU recomendadas para int8 convrot: RTX 4090, RTX 3090, A10G, L4 o superiores con 24 GB o mas de VRAM.
- GPU para w6a8 y w4a8: RTX 4080, RTX 4070 Ti, RTX 4060 Ti de 16 GB y tarjetas similares; w4a8 es la opcion mas probable para GPUs de 12-16 GB.
- Cabe en GPU de consumo: si, en las tres variantes, siempre que se deje margen para el codificador de texto y las activaciones. La variante bf16 original no cabe comodamente en 24 GB.
- Opciones de despliegue: ComfyUI con soporte nativo de Krea 2 y comfy-kitchen (los formatos w6a8 y w4a8 requieren una version que los incluya; probado con ComfyUI v0.39.1). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Configuracion de muestreo: 8-12 pasos, CFG 1,0-1,5, `euler` con `simple`, y el desplazamiento por defecto de Krea 2 (1,15).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (int8 convrot) | Cuantizacion del ajuste fino Kroma v0.3.1 turbo OPD | ~13 GB | int8 tensorwise + ConvRot | krea-2-community-license | HuggingFace, jakethessmake |
| Este repositorio (w4a8) | Cuantizacion del ajuste fino Kroma v0.3.1 turbo OPD | ~7 GB | 4 bits asimetrico con codebook Lloyd-Max | krea-2-community-license | HuggingFace, jakethessmake |
| lodestones/Kroma (`kroma-v0.3.1-turbo-opd.safetensors`) | Ajuste fino turbo de Krea 2 con destilacion on-policy | ~26 GB | bf16 | krea-2-community-license | HuggingFace, lodestones |
| Ficheros oficiales `krea2_*_int8_convrot` de Comfy-Org | Cuantizacion oficial de Krea 2 | no disponible | int8 + ConvRot | krea-2-community-license | HuggingFace, Comfy-Org |
| Krea 2 (base) | Modelo de difusion texto-a-imagen original | no disponible | bf16 | krea-2-community-license | Krea / Comfy-Org |

No se dispone de datos de rendimiento comparativos (FID, CLIP score, evaluaciones humanas) entre estas variantes, por lo que la comparacion se limita a formato, tamano y licencia.

## Limitaciones y advertencias

- Este repositorio no es una publicacion oficial de Krea ni de lodestones. Son versiones modificadas del modelo de Krea en las que solo ha cambiado el formato numerico de los pesos.
- La variante w4a8 presenta un error relativo medio de peso del 7,3 %, claramente superior al 1,0 % de int8 y al 2,1 % de w6a8. La imagen sigue siendo limpia, pero deriva mas en la composicion, asi que no es la opcion adecuada si la fidelidad estructural es critica.
- No se han publicado evaluaciones cuantitativas de calidad (FID, CLIP, evaluaciones humanas) para ninguna de las tres variantes.
- La cuantizacion solo afecta a 224 pesos lineales de los bloques principales; el resto del modelo conserva la precision original, lo que limita el ahorro maximo alcanzable.
- Riesgo de alucinacion visual y de artefactos: inherente a los modelos de difusion. La model card no documenta sesgos demograficos ni de representacion.
- Idiomas soportados: no disponible. El comportamiento multilingue del codificador de texto no se especifica.
- Requiere una version reciente de ComfyUI con soporte nativo de Krea 2 y comfy-kitchen; las variantes w6a8 y w4a8 necesitan una version que incluya esos formatos (probado con ComfyUI v0.39.1). En versiones anteriores los ficheros no cargaran.
- Licencia: Krea 2 Community License Agreement. Incluye un umbral de ingresos para el uso comercial y una Acceptable Use Policy. Hay que revisar el texto completo antes de desplegar en produccion; los detalles concretos del umbral no se reproducen en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de las tres variantes publicadas.
- Las estimaciones de VRAM se han derivado del tamano de los ficheros y no de pruebas directas; el consumo real dependera de la resolucion, el tamano de lote y la implementacion del sampler.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jakethessmake/Krea-Kroma-v0.3.1-Turbo-OPD-ComfyUI-Quants
- Modelo base (lodestones/Kroma): https://huggingface.co/lodestones/Kroma
- Fichero original bf16: https://huggingface.co/lodestones/Kroma/blob/main/kroma-v0.3.1-turbo-opd.safetensors
- Codificador de texto y VAE (Comfy-Org/Krea-2): https://huggingface.co/Comfy-Org/Krea-2
- comfy-kitchen (cuantizadores): https://github.com/Comfy-Org/comfy-kitchen
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Kroma v0.3.1: On-Policy Distillation for the Krea 2 Fine-Tune: https://comfyui-wiki.com/en/news/2026-10-07-kroma-v0-3-1-opd
- Kroma v0.3: Krea 2 Fine-Tune Adds Full Base Checkpoint: https://comfyui-wiki.com/en/news/2026-08-31-kroma-v0-3
- Analisis practico de Kroma 0.3.1: https://agihunt.info/en/p/1a11b1285fb8f280b53b37f7a6d
