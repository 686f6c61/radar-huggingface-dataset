# rootonchair/nunchaku-lite-ltx-2.5-distilled-native

## Resumen

Nunchaku-lite LTX-2.5 distilled native es una cuantizacion a 4 bits del transformer del modelo de generacion de video LTX-2.5 (22B) desarrollado por Lightricks. El trabajo lo publica el usuario rootonchair dentro del proyecto nunchaku-lite, una herramienta de cuantizacion SVDQuant orientada a modelos de difusion. El repositorio no contiene un modelo nuevo: contiene dos ficheros safetensors que sustituyen las 1.344 capas lineales del transformer original por pesos de 4 bits con una rama de bajo rango en bf16, manteniendo el resto de tensores y metadatos byte a byte identicos al fichero oficial.

El problema que resuelve es el coste de VRAM y de tiempo de inferencia del transformer de 22B en bf16: segun los datos del autor, el pico de memoria pasa de 36,2 GB a 24,2 GB y el tiempo por clip se reduce de 4,46 s a 3,01 s en una RTX PRO 6000 Blackwell (NVFP4) y de 7,32 s a 4,85 s en una L40S (INT4). Esto permite ejecutar el pipeline de generacion de video en GPUs de 24 GB y acelera la generacion en GPUs profesionales.

La relevancia es doble: por un lado baja el umbral de hardware para un modelo de video de 22B; por otro, la integracion con `ltx-core` esta aun en revision (PR #23 de nunchaku-lite) y no forma parte de ninguna release, por lo que el modelo es experimental y requiere instalar desde una rama de Git. La licencia es la LTX-2.x Community License, con restricciones para empresas de mas de 10 millones de dolares de facturacion anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (LTX-2.5 distilled), cuantizado a 4 bits con rama de bajo rango |
| Parametros totales | 22B (modelo base LTX-2.5 distilled) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generacion de video: 121 frames por defecto, 768x512) |
| Tipos de cuantizacion | NVFP4 (Blackwell) e INT4 con rotacion Hadamard (resto de GPUs CUDA); escalas por grupo y rama rank-32 en bf16 |
| Idiomas soportados | no disponible (modelo texto-a-video; el codificador de texto es Gemma 4 12B) |
| Licencia | LTX-2.x Community License Agreement (11 de agosto de 2026, enmendada el 11 de noviembre de 2026) |
| Formato de pesos | safetensors (dos ficheros: NVFP4 r32 de 14,9 GiB e INT4 r32 de 14,4 GiB) |

## Arquitectura y entrenamiento

El modelo base es LTX-2.5 distilled, un transformer de difusion de 22B para generacion de video con audio, del que este repositorio solo modifica el transformer. No se ha reentrenado nada: la cuantizacion se aplica post-entrenamiento sobre el fichero `ltx-2.5-22b-distilled-transformer-bf16.safetensors`. De las 1.944 tensores del fichero original, 1.344 capas lineales se sustituyen por pesos de 4 bits con escalas por grupo mas una rama de bajo rango de rango 32 en bf16 (estilo SVDQuant); los 1.757 tensores restantes y todos los metadatos son byte a byte identicos, salvo la adicion de una entrada `quantization_config`.

La innovacion tecnica principal es la combinacion de cuantizacion de 4 bits con una correccion de bajo rango que absorbe el error de cuantizacion, mas una rotacion Hadamard de la entrada de cada capa en la variante INT4 para reducir valores atipicos. El fichero NVFP4 usa el formato de 4 bits nativo de las GPUs Blackwell; el INT4 es la alternativa para A100, L40S y otras CUDA. Los demas componentes del pipeline (codificador de texto Gemma 4 12B, VAE de video, VAE de audio y upsampler espacial) se toman sin modificar de Lightricks/LTX-2.5. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el proceso de destilacion en la informacion proporcionada.

## Capacidades

- Generacion de video texto-a-video: produce clips de 121 frames a 768x512 con el pipeline `DistilledPipeline` de dos etapas.
- Generacion de audio asociada al video: el pipeline incluye un VAE de audio (`ltx-2.5-audio-vae-bf16.safetensors`).
- Upscaling espacial latente x2 mediante el upsampler incluido en el pipeline.
- Control de semilla para reproducibilidad (`--seed 42` en el ejemplo del autor).
- Integracion programatica: `nunchaku_lite.integrations.ltx_core.build_nunchaku_policy(path)` devuelve una `QuantizationPolicy` que se pasa como `quantization=` a cualquier pipeline de `ltx_pipelines`.
- Sustitucion directa del fichero oficial del transformer: el fichero va donde iria el transformer bf16 original.
- Tool calling, agentes, razonamiento multi-paso y modo thinking: no disponibles (es un modelo de difusion para video, no un LLM).
- Capacidades multilingues: no documentadas; dependen del codificador de texto Gemma 4 12B, no del transformer cuantizado.

## Casos de uso

- Generacion de video en GPU de 24 GB: con el fichero NVFP4 en una RTX PRO 6000 o RTX 50xx, o el INT4 en una L40S, el pico de VRAM baja a 24,2 GB frente a 36,2 GB en bf16, lo que permite ejecutar el pipeline completo en tarjetas que no cabian el modelo original.
- Prototipado rapido de clips: el tiempo por clip del transformer baja de 4,46 s a 3,01 s en Blackwell y de 7,32 s a 4,85 s en L40S, util para iterar sobre prompts y semillas en fase de diseno.
- Investigacion sobre cuantizacion de modelos de difusion: los dos ficheros permiten comparar NVFP4 frente a INT4 con rotacion Hadamard sobre el mismo modelo base, con metricas PSNR, SSIM y flicker ya publicadas por el autor.
- Evaluacion de calidad frente a bf16: el autor publica PSNR de 18,09 dB (NVFP4) y 17,87 dB (INT4) frente al clip bf16 de la misma semilla, lo que sirve como referencia para estudios de degradacion por cuantizacion.
- Despliegue en pipelines de `ltx-pipelines`: al integrarse como `QuantizationPolicy`, el modelo se puede enchufar en cualquier pipeline de Lightricks sin cambiar el codigo de generacion, solo el fichero y la politica.
- Variante de mayor estabilidad temporal: el script `tools/ltx2_native_splice.py --targets-regex` reconstruye una version con los bloques 42-47 en bf16 a partir de los mismos pesos, para casos donde el flicker sea critico.
- Uso en entornos con licencia comercial: empresas por debajo de 10 millones de dolares de facturacion anual pueden usar el modelo bajo la LTX-2.x Community License; por encima, necesitan licencia de pago de Lightricks.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Pipeline `DistilledPipeline` de dos etapas, 768x512, 121 frames, 16 prompts, cada clip comparado contra el clip bf16 de la misma semilla. Flicker es la media del laplaciano del cambio entre frames (menor es mas estable).

RTX PRO 6000 Blackwell, fichero NVFP4:

| Transformer | PSNR vs bf16 | SSIM | Flicker | s/clip | VRAM pico |
|---|---|---|---|---|---|
| bf16 (Lightricks) | - | - | 7,52 | 4,46 | 36,2 GB |
| NVFP4 de Lightricks (`nvfp4-prequant`) | 18,43 dB | 0,570 | 8,14 | 2,87 | 24,2 GB |
| NVFP4 r32 (este repo) | 18,09 dB | 0,558 | 9,68 | 3,01 | 24,2 GB |

L40S (Ada), fichero INT4 (NVFP4 solo funciona en Blackwell):

| Transformer | PSNR vs bf16 | SSIM | Flicker | s/clip | VRAM pico |
|---|---|---|---|---|---|
| bf16 (Lightricks) | - | - | 7,53 | 7,32 | 36,2 GB |
| INT4 r32 + rotacion (este repo) | 17,87 dB | 0,550 | 9,94 | 4,85 | 24,2 GB |

## Requisitos de hardware

- VRAM pico medida: 24,2 GB con ambos ficheros cuantizados, frente a 36,2 GB en bf16.
- GPU recomendadas: RTX PRO 6000 Blackwell o RTX 50xx para el fichero NVFP4; A100, L40S y otras CUDA para el fichero INT4.
- NVFP4 requiere hardware Blackwell; no funciona en Ada ni en Ampere.
- En consumer GPU: el pico de 24,2 GB encaja en tarjetas de 24 GB o mas (RTX 4090, RTX 5090); no cabe en GPUs de 16 GB o menos segun los datos publicados.
- Despliegue: `nunchaku-lite` con la integracion `ltx-core` (instalacion desde la rama `rootonchair/ltx-core-integration` via `pip install "git+https://github.com/rootonchair/nunchaku-lite@rootonchair/ltx-core-integration"`), mas `ltx-core` y `ltx-pipelines`. Para Diffusers existe el repo hermano `rootonchair/nunchaku-lite-ltx-2.5-distilled`.
- Throughput: 3,01 s por clip del transformer en Blackwell NVFP4 y 4,85 s en L40S INT4, con 16 prompts de referencia.
- Tamano en disco: 31,5 GB el repositorio completo; 14,9 GiB el fichero NVFP4 y 14,4 GiB el INT4.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | VRAM pico | s/clip (ref.) | Licencia |
|---|---|---|---|---|---|
| LTX-2.5 bf16 (Lightricks) | 22B | bf16 | 36,2 GB | 4,46 (Blackwell) / 7,32 (L40S) | LTX-2.x Community |
| LTX-2.5 NVFP4 prequant (Lightricks) | 22B | NVFP4 nativo | 24,2 GB | 2,87 (Blackwell) | LTX-2.x Community |
| Este repo, NVFP4 r32 | 22B | NVFP4 + rango 32 | 24,2 GB | 3,01 (Blackwell) | LTX-2.x Community |
| Este repo, INT4 r32 | 22B | INT4 + Hadamard + rango 32 | 24,2 GB | 4,85 (L40S) | LTX-2.x Community |

Frente a la cuantizacion NVFP4 oficial de Lightricks, este repo es ligeramente peor en calidad (PSNR 18,09 frente a 18,43 dB; flicker 9,68 frente a 8,14) y algo mas lento (3,01 frente a 2,87 s/clip) porque cuantiza los 48 bloques del transformer, mientras que Lightricks mantiene los 6 ultimos en bf16. La ventaja de este repo es la disponibilidad de una variante INT4 para GPUs no Blackwell, que Lightricks no ofrece. No se dispone de comparacion con otros modelos de video de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La integracion con `ltx-core` esta en revision (PR #23) y no forma parte de ninguna release de nunchaku-lite; hay que instalar desde una rama de Git concreta.
- Peor calidad que la cuantizacion NVFP4 oficial de Lightricks: PSNR 18,09 frente a 18,43 dB y SSIM 0,558 frente a 0,570 en Blackwell; flicker 9,68 frente a 8,14.
- El flicker es notablemente mayor que en bf16 (9,68 frente a 7,52 en Blackwell; 9,94 frente a 7,53 en L40S), segun el propio autor.
- La variante INT4 solo se ha medido en L40S; no hay datos para A100 ni para otras GPUs CUDA.
- El fichero NVFP4 no funciona fuera de Blackwell.
- Licencia restrictiva: empresas con facturacion anual de 10 millones de dolares o mas necesitan licencia de pago de Lightricks (licensing@ltx.io) salvo para uso no comercial; aplican la Seccion 4 y el Anexo A de la licencia, incluida la Acceptable Use Policy.
- El repositorio no incluye ni modifica el codificador de texto, los VAE ni el upsampler; hay que descargarlos de Lightricks/LTX-2.5.
- No se dispone de informacion sobre sesgos, tasa de alucinacion ni cobertura idiomatica del modelo base en la informacion proporcionada.
- El codigo de nunchaku-lite tiene licencia separada y no forma parte de este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/rootonchair/nunchaku-lite-ltx-2.5-distilled-native
- Repo hermano para Diffusers: https://huggingface.co/rootonchair/nunchaku-lite-ltx-2.5-distilled
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Repositorio nunchaku-lite: https://github.com/rootonchair/nunchaku-lite
- PR de integracion con ltx-core: https://github.com/rootonchair/nunchaku-lite/pull/23
- Guia de LTX-2.5 en el codigo de referencia: https://github.com/rootonchair/nunchaku-lite/blob/rootonchair/ltx-core-integration/docs/models/ltx2-reference-code.md
- Codigo de Lightricks (ltx-core / ltx-pipelines): https://github.com/Lightricks/LTX-2
- Acceptable Use Policy de Lightricks: https://static.lightricks.com/legal/ltx-acceptable-use-policy.pdf
