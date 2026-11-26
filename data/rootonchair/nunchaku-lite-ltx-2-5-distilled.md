# rootonchair/nunchaku-lite-ltx-2.5-distilled

## Resumen

Nunchaku-lite LTX-2.5 distilled es una cuantización de 4 bits del transformer del modelo de generación de vídeo LTX-2.5 de Lightricks (22B parámetros), publicada por el usuario rootonchair para su runtime nunchaku-lite. El repositorio contiene únicamente los pesos del transformer cuantizados; el codificador de texto, los VAE, el vocoder y el decodificador de difusión se toman del modelo base en bf16. El objetivo es reducir el peso del transformer de 39,1 GiB en bf16 a 10,6-11,2 GiB y acelerar la inferencia entre 1,21x y 1,83x según la GPU, manteniendo una fidelidad razonable respecto al original.

La propuesta técnica se apoya en SVDQuant: pesos de 4 bits (NVFP4 o INT4) combinados con una rama de bajo rango de rango 32 en bf16 que absorbe los valores atípicos que la cuantización de 4 bits representa mal. Se ofrecen dos ficheros: uno NVFP4 para GPUs Blackwell (RTX PRO 6000, RTX 50xx) y otro INT4 con rotación Hadamard de entrada para el resto de GPUs CUDA (A100 y similares). Frente a los checkpoints cuantizados oficiales de Lightricks (INT8 y NVFP4 en formato ComfyUI), esta versión es más pequeña, más rápida y se integra directamente en Diffusers mediante `LTX2VideoTransformer3DModel`.

Es relevante ahora porque permite ejecutar un modelo de texto-a-vídeo de 22B en GPUs de 80 GB con un pico de VRAM de 52,1 GB (frente a 76,8 GB en bf16) y porque cubre el hueco de las GPUs no-Blackwell, donde Lightricks solo ofrece INT8, que en A100 resulta más lento que bf16. La contrapartida es una menor fidelidad respecto a bf16 (17,15-21,12 dB de PSNR frente a 21,67-26,09 dB del INT8 oficial).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (LTX-2.5), cuantizado con SVDQuant (4 bits + rama de bajo rango r32 en bf16) |
| Parámetros totales | 22B (modelo base LTX-2.5 distilled); tamaño del transformer cuantizado no disponible en parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (r32) e INT4 (r32 con rotación Hadamard de entrada) |
| Idiomas soportados | no disponible (modelo texto-a-vídeo; el prompt se procesa mediante el codificador de texto del modelo base) |
| Licencia | ltx-2.x-community-license-agreement (LTX-2.x Community License, con Acceptable Use Policy) |
| Formato de pesos | safetensors (`svdq-fp4_r32-ltx-2.5-distilled.safetensors` 11,2 GiB; `svdq-int4_r32-ltx-2.5-distilled.safetensors` 10,6 GiB) |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 es un transformer de difusión para generación de vídeo con audio, del que esta publicación solo cuantiza el transformer (22B). La técnica aplicada es SVDQuant: los pesos se descomponen en una parte de 4 bits y una rama de bajo rango de rango 32 en bf16 que captura los valores atípicos, lo que mejora la calidad frente a una cuantización de 4 bits convencional. El fichero NVFP4 usa formato de coma flotante de 4 bits para GPUs Blackwell; el fichero INT4 añade una rotación Hadamard en la entrada para estabilizar la cuantización en GPUs sin soporte NVFP4 (A100 y otras).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo fases de RLHF o DPO, ya que esta publicación es una derivación cuantizada y no un entrenamiento. La innovación destacable es doble: por un lado, la rama de bajo rango que recupera calidad a 4 bits (2,3 dB más cerca de bf16 que el NVFP4 oficial de Lightricks en el mismo formato); por otro, los kernels de nunchaku-lite, que incluyen un decodificador de difusión entre 1,5x más rápido que el de referencia y que funciona con cualquier transformer.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución de 768x512, 121 frames y 8 pasos de denoising en los benchmarks publicados.
- Generación de audio asociada al vídeo (el modelo base LTX-2.5 produce audio; las comparaciones del autor usan audio del clip bf16).
- Carga directa en Diffusers mediante `LTX2VideoTransformer3DModel` y una llamada a `patch_transformer`.
- Compatibilidad con el pipeline modular `LTX25AutoBlocks` de Diffusers >= 0.43.
- Soporte de kernels acelerados para el decodificador de difusión vía `nunchaku-lite-kernels` v3 (1,5x más rápido que el decodificador sin fusionar).
- Dos variantes de precisión para adaptarse al hardware: NVFP4 para Blackwell e INT4 para el resto de CUDA.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo explícito; el prompt se procesa con el codificador de texto del modelo base.

## Casos de uso

- Generación de vídeo publicitario y de redes sociales en GPUs de 80 GB: con el fichero INT4 el pico de VRAM baja a 52,1 GB, lo que permite producir clips de 768x512x121 en una A100 80GB con 1,21x de aceleración frente a bf16.
- Prototipado rápido en estaciones Blackwell: el fichero NVFP4 reduce el tiempo por paso del transformer a 475 ms (1,83x frente a bf16) en una RTX PRO 6000, adecuado para iterar sobre prompts y semillas.
- Despliegue en Diffusers dentro de pipelines Python existentes: al cargarse con `patch_transformer`, se integra en flujos de trabajo que ya usan Diffusers >= 0.43 sin depender de ComfyUI.
- Investigación sobre cuantización de modelos de difusión: los ficheros permiten comparar SVDQuant r32 frente a INT8 y NVFP4 oficiales con métricas de PSNR y tiempos por paso ya publicadas.
- Generación de vídeo con audio en local para creadores con RTX 50xx: el formato NVFP4 está pensado para estas GPUs y reduce el peso del transformer a 11,2 GiB, lo que facilita su almacenamiento y carga.
- Evaluación de calidad frente a bf16 en entornos de producción: el PSNR publicado (17,15 dB en A100 con INT4, 21,12 dB en Blackwell con NVFP4) permite decidir si la diferencia es aceptable para el caso de uso antes de sustituir el modelo completo.
- Sustitución de checkpoints ComfyUI por equivalentes Diffusers en pipelines de investigación que necesitan control fino del scheduler y del decodificador.

## Benchmarks y rendimiento

Rendimiento en RTX PRO 6000 (Blackwell), solo transformer, 768x512x121 con 8 pasos:

| Transformer | Tamaño | Tiempo por paso | vs bf16 | PSNR vs bf16 |
|---|---|---|---|---|
| bf16 | 39,1 GiB | 870 ms | 1,00x | - |
| NVFP4 r32 (este repo) | 11,2 GiB | 475 ms | 1,83x | 21,12 dB |
| Lightricks INT8 | 20,0 GiB | 658 ms | 1,32x | 26,09 dB |
| Lightricks NVFP4 | 17,4 GiB | 786 ms | 1,11x | 18,86 dB |

Rendimiento en A100 80GB, clip completo con decodificación (decodificador por defecto de Diffusers):

| Transformer | Tamaño | s/clip | vs bf16 | VRAM pico | PSNR vs bf16 |
|---|---|---|---|---|---|
| bf16 | 39,1 GiB | 18,5 | 1,00x | 76,8 GB | - |
| INT4 r32 + rotación (este repo) | 10,6 GiB | 15,3 | 1,21x | 52,1 GB | 17,15 dB |
| Lightricks INT8 | 20,0 GiB | 20,7 | 0,89x | 57,7 GB | 21,67 dB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: 52,1 GB de pico en A100 80GB con el fichero INT4 para el pipeline completo (transformer, codificador de texto, VAE, vocoder y decodificador); 76,8 GB en bf16.
- GPUs recomendadas: RTX PRO 6000 y RTX 50xx para el fichero NVFP4; A100 80GB y otras GPUs CUDA sin NVFP4 para el fichero INT4.
- No cabe en GPUs de consumo de 24 GB con el pipeline completo según los datos publicados; el transformer solo ocupa 10,6-11,2 GiB, pero el resto de componentes en bf16 elevan el pico muy por encima.
- Despliegue: Diffusers >= 0.43 con `LTX2VideoTransformer3DModel` y `patch_transformer`; requiere `nunchaku-lite` y `nunchaku-lite-kernels` v3 para los kernels del decodificador. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: 475 ms por paso del transformer en RTX PRO 6000 con NVFP4; 15,3 s por clip completo en A100 80GB con INT4; 18,5 s por clip en bf16 en A100. El fichero INT4 en Blackwell es más lento que bf16 (24,6 s frente a 9,4 s por clip), por lo que en esa plataforma debe usarse el NVFP4.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nunchaku-lite LTX-2.5 distilled NVFP4 (este repo) | 22B (base) | NVFP4 r32 | 11,2 GiB | LTX-2.x Community | Hugging Face, Diffusers |
| Nunchaku-lite LTX-2.5 distilled INT4 (este repo) | 22B (base) | INT4 r32 + rotación | 10,6 GiB | LTX-2.x Community | Hugging Face, Diffusers |
| Lightricks LTX-2.5 INT8 | 22B | INT8 | 20,0 GiB | LTX-2.x Community | ComfyUI |
| Lightricks LTX-2.5 NVFP4 | 22B | NVFP4 | 17,4 GiB | LTX-2.x Community | ComfyUI, solo Blackwell |
| Lightricks LTX-2.5 bf16 | 22B | bf16 | 39,1 GiB | LTX-2.x Community | ComfyUI / Diffusers |

Frente a las alternativas oficiales, este repositorio ofrece el menor tamaño de descarga (10,6-11,2 GiB frente a 17,4-20,0 GiB), el mayor ahorro de VRAM en el pipeline completo (52,1 GB frente a 55,2-57,7 GB) y la mayor velocidad en sus plataformas objetivo. El INT8 oficial de Lightricks mantiene la mayor fidelidad a bf16 (26,09 dB en Blackwell, 21,67 dB en A100) a costa de velocidad y memoria. No se dispone de comparación con modelos de vídeo de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Menor fidelidad a bf16 que el INT8 oficial: 21,12 dB de PSNR en Blackwell con NVFP4 y 17,15 dB en A100 con INT4, frente a 26,09 y 21,67 dB respectivamente. Un PSNR más bajo implica diferencias que no siempre son visibles, pero conviene revisar las comparaciones publicadas antes de usarlo en producción.
- El fichero NVFP4 solo funciona en GPUs Blackwell; en otras GPUs hay que usar el INT4, y en Blackwell el INT4 es más lento que bf16 (24,6 frente a 9,4 s por clip).
- Solo contiene el transformer: requiere descargar el modelo base Lightricks/LTX-2.5 para el codificador de texto, VAE, vocoder y decodificador de difusión en bf16, lo que suma espacio en disco y VRAM.
- Dependencia de versiones concretas: Diffusers >= 0.43 y `nunchaku-lite-kernels` v3; sin los kernels el decodificador funciona sin fusionar y se pierde la aceleración de 1,5x.
- Licencia restrictiva: LTX-2.x Community License, sujeta a la sección 4 y al anexo A, incluida la Acceptable Use Policy. Las empresas con ingresos anuales de 10 millones de dólares o más necesitan una licencia de pago de Lightricks (licensing@ltx.io), salvo para uso no comercial.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base, no documentado en esta publicación; no hay evaluación de sesgos en la información disponible.
- No se documentan idiomas soportados ni limitaciones de contexto del codificador de texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rootonchair/nunchaku-lite-ltx-2.5-distilled
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Repositorio nunchaku-lite: https://github.com/rootonchair/nunchaku-lite
- Licencia LTX-2.x Community License: https://huggingface.co/rootonchair/nunchaku-lite-ltx-2.5-distilled/blob/main/LICENSE
- Acceptable Use Policy de Lightricks: https://static.lightricks.com/legal/ltx-acceptable-use-policy.pdf
- Ejemplos comparativos (mujer hablando): https://huggingface.co/rootonchair/nunchaku-lite-ltx-2.5-distilled/resolve/main/samples/compare_woman_speaking.mp4
- Ejemplos comparativos (bailarín urbano): https://huggingface.co/rootonchair/nunchaku-lite-ltx-2.5-distilled/resolve/main/samples/compare_street_dancer.mp4
- Ejemplos comparativos (caballos salvajes): https://huggingface.co/rootonchair/nunchaku-lite-ltx-2.5-distilled/resolve/main/samples/compare_wild_horses.mp4
- Ejemplo NVFP4 (golden retriever): https://huggingface.co/rootonchair/nunchaku-lite-ltx-2.5-distilled/resolve/main/samples/golden_retriever_fp4.mp4
- Ejemplo INT4 (golden retriever): https://huggingface.co/rootonchair/nunchaku-lite-ltx-2.5-distilled/resolve/main/samples/golden_retriever_int4.mp4
