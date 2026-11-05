# gladia/qat-transfer-vae

## Resumen

`gladia/qat-transfer-vae` no es un modelo generativo de lenguaje, sino un conjunto de 84 checkpoints del decodificador de la VAE KL-f8 de Stable Diffusion 1.5, publicados como material complementario del articulo "Zero-Shot Quantization via Weight-Space Arithmetic" (NeurIPS 2026). El repositorio contiene decodificadores en precision completa (FP), con entrenamiento consciente de cuantizacion (QAT) y con destilacion consciente de cuantizacion (QAD), en tres formatos de pesos: int3 simetrico por canal, fp4 (e2m1) simetrico por canal y fp4 con escalado por bloques NVFP4. Cada variante se ha ajustado sobre 12 dominios de imagen distintos (celebahq, chartqa, chestxray, coco, floorplan, food101, lsun_bedroom, lsun_church, pixelart, publaynet, resisc45 y rico).

El objetivo del trabajo es estudiar si un vector de cuantizacion calculado como la diferencia entre los pesos QAT y FP de un dominio donante (`QV = QA_final - FP_final`) puede transferirse aritmeticamente a un receptor de otro dominio (`FP_receiver + lambda * QV_donor`) y producir cuantizacion de calidad en un escenario de zero-shot. Se trata, por tanto, de un artefacto de investigacion para reproducir el experimento del apendice "Further Variants of QV Transfer", no de un modelo listo para produccion.

El decodificador tiene 49,5 M parametros (solo `decoder.*` y `post_quant_conv.*`), opera a 256 px y se distribuye como state dict plano en formato `.pt` (PyTorch), con un total de 16,6 GB en el repositorio. Resulta relevante para quienes investigan cuantizacion extrema de VAEs en pipelines de difusion, task arithmetic y destilacion con profesores congelados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder KL-f8 (VAE de Stable Diffusion 1.5); este repositorio contiene solo el decodificador |
| Parametros totales | 49,5 M (decodificador + `post_quant_conv`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | int3 simetrico por canal; fp4 (e2m1) simetrico por canal; fp4 (e2m1) con escalado por bloques NVFP4 |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | PyTorch `.pt` (state dict plano de 140 tensores fp32); no hay safetensors ni GGUF |
| Resolucion de entrenamiento | 256 px |
| Numero de checkpoints | 84 (12 dominios x 7 configuraciones: FP, QAT int3, QAD int3, QAT fp4, QAD fp4, QAT NVFP4, QAD NVFP4) |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5 (revision 451f4fe, subcarpeta `vae/`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es el autoencoder KL-f8 de Stable Diffusion 1.5, un VAE convolucional con factor de compresion espacial 8. Este repositorio incluye unicamente los pesos del decodificador y de `post_quant_conv`; el codificador y `quant_conv` se mantienen con los pesos originales del modelo base. Los checkpoints se cargan sobre un `AutoencoderKL` de diffusers con `strict=False`, dejando como claves faltantes las del codificador.

El ajuste fino es decoder-only y se realiza en 12 dominios de imagen. La configuracion compartida es: 256 px, semilla 2038, `bf16_autocast_tf32`, AdamW con `lr=1e-4`, `wd=0`, recorte de gradiente 1.0, warmup de 250 pasos, batch 32 con acumulacion de 2, 5000 pasos totales y perdida L1 + LPIPS. Las ejecuciones QAT (weight-only, sobre todas las capas Linear y Conv2d del decodificador) parten del checkpoint del paso 1500 de la ejecucion FP y continuan los 3500 pasos restantes conservando optimizador y scheduler. Las ejecuciones QAD usan el decodificador FP final del mismo dominio como profesor congelado, con perdida `kd_pix·L1 + kd_lpips·LPIPS` y sin termino de ground truth. Los checkpoints QA almacenan los pesos latentes en precision completa una vez retirados los wrappers de fake-quantization.

La innovacion tecnica central es el vector de cuantizacion: `QV = QA_final - FP_final` de un dominio donante, aplicado al receptor como `FP_receiver + lambda * QV_donor`, evaluado tras PTQ de pesos en el mismo formato. Esto permite estudiar la transferencia zero-shot de la "direccion" de cuantizacion entre dominios sin reentrenar el receptor.

## Capacidades

- Decodificacion de latentes KL-f8 a imagenes RGB a 256 px, como componente del pipeline de Stable Diffusion 1.5.
- Ajuste fino especifico por dominio para 12 dominios de imagen (retratos, graficos, radiografias, escenas, planos, comida, interiores, iglesias, pixel art, documentos, satelite y planos de planta de interiores).
- Cuantizacion extrema del decodificador a int3 y fp4 mantenida mediante QAT y QAD.
- Transferencia de vectores de cuantizacion entre dominios mediante aritmetica en el espacio de pesos (task arithmetic).
- Evaluacion reproducible con `metrics.json`, `run_id.json`, `run_config.json` y `manifest.json` por ejecucion.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un componente de vision, no un modelo de lenguaje.

## Casos de uso

- Investigacion en cuantizacion extrema de VAEs: usar los checkpoints int3 y fp4 para medir la degradacion de reconstruccion frente a FP en cada dominio, con metricas ya registradas en `metrics.json`.
- Reproduccion del experimento de QV transfer: calcular `QV` a partir de los pares QAT/FP de un dominio donante y aplicarlo a un receptor distinto con distintos valores de `lambda`, siguiendo la receta del articulo.
- Validacion de QAD frente a QAT: comparar ambos roles con el mismo formato de pesos para aislar el efecto de la destilacion con profesor congelado en el decodificador.
- Despliegue de decodificadores ligeros en pipelines de difusion con restricciones de memoria: el decodificador de 49,5 M parametros en int3 o fp4 reduce la huella del componente VAE en entornos con VRAM limitada.
- Estudio de robustez por dominio: evaluar como se comporta la cuantizacion en dominios muy distintos (pixelart frente a chestxray) y detectar que dominios actuan mejor como donantes de QV.
- Benchmarking de esquemas de escalado: comparar fp4 por canal frente a fp4 con escalado por bloques NVFP4 sobre el mismo decodificador y los mismos datos.
- Base para experimentos de task arithmetic en modelos de vision: reutilizar la estructura de pares FP/QA como plantilla para otros componentes de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que cada ejecucion incluye `metrics.json` con las metricas de held-out, pero no se proporcionan los valores numericos en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: el decodificador FP de 49,5 M parametros en fp32 ocupa aproximadamente 198 MB de pesos; en int3 o fp4 la huella de pesos baja a decenas de MB. El espacio adicional depende del tamano del lote y de la resolucion de salida (256 px en el entrenamiento).
- GPU recomendadas: cualquier GPU con soporte de bf16 y suficiente memoria para el pipeline completo de SD 1.5; para el decodificador aislado basta una GPU consumer moderna.
- Cabe en GPU consumer: si, el decodificador aislado cabe en tarjetas con 4-8 GB de VRAM; el pipeline completo de SD 1.5 requiere mas memoria.
- Opciones de despliegue: carga via `diffusers` (`AutoencoderKL.from_pretrained` + `load_state_dict`), con `torch.load` para los `.pt`. No hay pesos en formato GGUF ni safetensors, por lo que no es directamente compatible con llama.cpp u Ollama.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio completo ocupa 16,6 GB, correspondiente a los 84 checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gladia/qat-transfer-vae | 49,5 M (decodificador) | no aplica | int3, fp4, NVFP4 (QAT/QAD) | creativeml-openrail-m | HuggingFace, `.pt` |
| stable-diffusion-v1-5 VAE (original) | 83,7 M (VAE completo) | no aplica | fp32/fp16 | creativeml-openrail-m | HuggingFace, safetensors |
| gladia/qat-transfer-timm | no disponible en la informacion | no aplica | int3, fp4, NVFP4 | no disponible en la informacion | HuggingFace |
| gladia/qat-transfer-open_clip | no disponible en la informacion | no aplica | int3, fp4, NVFP4 | no disponible en la informacion | HuggingFace |

La comparativa directa con otras VAEs cuantizadas de forma consciente no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion: no hay pipeline declarado ni demo.
- Solo contiene el decodificador y `post_quant_conv`; requiere cargar el VAE completo de SD 1.5 y sustituir esas claves.
- Los pesos se distribuyen como state dict PyTorch plano en `.pt`; no hay safetensors, GGUF ni integracion con vLLM, TGI u Ollama.
- El ajuste fino esta limitado a 256 px y a los 12 dominios de imagen del experimento; el comportamiento fuera de esos dominios no esta documentado.
- Los checkpoints QA almacenan pesos en precision completa con los wrappers de fake-quantization retirados: la cuantizacion efectiva se aplica en el momento de la evaluacion, no en el checkpoint.
- Riesgo de sesgos y alucinaciones visuales heredado de los datos de ajuste fino y del VAE base; no se documentan sesgos especificos en la informacion disponible.
- La licencia CreativeML Open RAIL-M impone restricciones de uso (clausulas de uso aceptable) y los datasets de ajuste fino tienen sus propios terminos, que deben respetarse por separado.
- No se proporcionan numeros de rendimiento, latencia ni throughput; cualquier uso en produccion requiere medicion propia.
- El repositorio ocupa 16,6 GB, lo que puede ser costoso de descargar si solo se necesita una configuracion concreta.

## Enlaces

- HuggingFace: https://huggingface.co/gladia/qat-transfer-vae
- Repositorio de codigo: https://github.com/gladia-research-group/qat-transfer
- arXiv: https://arxiv.org/abs/2604.03420
- OpenReview: https://openreview.net/forum?id=wrUEnnSgXa
- Research graph: https://flywheel.paradigma.inc/node/de486ca0-8e83-4041-bbf6-0b0be565435b
- Familia timm: https://huggingface.co/gladia/qat-transfer-timm
- Familia OpenCLIP: https://huggingface.co/gladia/qat-transfer-open_clip
- Familia texto: https://huggingface.co/gladia/qat-transfer-text
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Web de Gladia: https://www.gladia.io/
- Documentacion de Gladia: https://docs.gladia.io/chapters/introduction
