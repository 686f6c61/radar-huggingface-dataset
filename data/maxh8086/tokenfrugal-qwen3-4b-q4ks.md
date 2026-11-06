# maxh8086/tokenfrugal-qwen3-4b-q4ks

## Resumen

tokenfrugal-qwen3-4b-q4ks es una cuantización GGUF en formato Q4_K_S del modelo Qwen/Qwen3-4B, publicada por el usuario maxh8086 bajo el paraguas del proyecto "tokenfrugal". No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a un caso de uso muy concreto: servir como text encoder para FLUX.2 klein 4B dentro de ComfyUI, mediante los nodos ComfyUI-GGUF (`CLIPLoaderGGUF` con tipo `flux2`).

El modelo base, Qwen3-4B, es un transformer denso de 4.411.424.256 parámetros (aproximadamente 4,4 mil millones) desarrollado por Alibaba Qwen. Esta versión cuantizada reduce el peso del fichero a 2.602.097.056 bytes (unos 2,6 GB), lo que facilita su carga en memoria frente a los pesos en bf16 originales.

La relevancia de esta ficha es acotada pero práctica: el autor documenta que la cuantización FP8 previa del mismo encoder producía texturas planas en ComfyUI en 5 de 5 renders, y que esta versión GGUF Q4_K_S es la que funciona correctamente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B); empaquetada como GGUF para uso como text encoder |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_S (fichero publicado); el autor menciona conversion previa a F16 desde bf16 |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`qwen3-4b-Q4_K_S.gguf`, 2.602.097.056 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer denso de aproximadamente 4,4 mil millones de parámetros. Esta publicación no entrena ni afina el modelo: parte de los pesos bf16 de Qwen/Qwen3-4B, los convierte a F16 con `convert_hf_to_gguf.py --outtype f16` y después aplica `llama-quantize` con el tipo Q4_K_S usando el commit 10b8b7553 de llama.cpp. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, ya que corresponden al modelo base y no se detallan en esta model card.

La innovación técnica documentada no está en el modelo sino en el proceso de cuantización y su validación local. El autor reporta una medición de perplejidad con `llama-perplexity` (`-c 512 -t 8 -ngl 0`) sobre una muestra local de texto en inglés: F16 obtiene 10,3028 ± 1,10517 y Q4_K_S obtiene 10,8623 ± 1,16969, lo que supone un incremento del 5,4 %. Además, se realizó una prueba de render con FLUX.2 klein 4B (768x768, 4 pasos, sampler euler, cfg 1.0, 5 prompts): tanto bf16 como Q4_K_S representaron el sujeto descrito en 5 de 5 casos, con PSNR en escala de grises entre 14,3 y 19,1 dB y SSIM entre 0,69 y 0,86. Todas estas mediciones son locales, no en hardware de referencia del upstream.

## Capacidades

- Generación de texto y modelado de lenguaje, heredados del modelo base Qwen3-4B.
- Uso como text encoder en pipelines de difusión: es su función principal declarada, integrable en ComfyUI mediante `CLIPLoaderGGUF` con tipo `flux2`.
- Codificación de prompts de texto para FLUX.2 klein 4B, con resultados de render verificados localmente en 5 de 5 prompts.
- Compatibilidad con el ecosistema llama.cpp al estar en formato GGUF.
- Etiqueta `endpoints_compatible` en los tags del repositorio, que sugiere compatibilidad con endpoints de inferencia, aunque no se detalla en la model card.
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio o modo thinking: no disponibles en la información proporcionada para esta publicación concreta.

## Casos de uso

- Text encoder para FLUX.2 klein 4B en ComfyUI: se carga con el nodo `CLIPLoaderGGUF` seleccionando tipo `flux2` y el fichero `qwen3-4b-Q4_K_S.gguf`; es el escenario validado por el autor con 5 renders correctos.
- Sustitución de encoders FP8 defectuosos: el autor documenta que la versión FP8 previa generaba texturas planas en 5 de 5 renders, por lo que este GGUF sirve como reemplazo directo en flujos de trabajo ya existentes.
- Despliegue en entornos con VRAM limitada: al ocupar 2,6 GB en disco y reducir el peso frente a bf16, permite cargar el encoder junto al modelo de difusión en GPUs de consumo medio.
- Pruebas de calidad de cuantización: útil para comparar perplejidad y fidelidad de render entre F16 y Q4_K_S en un pipeline de generación de imágenes, replicando la metodología del autor.
- Prototipado de pipelines texto-a-imagen en local: combinado con llama.cpp y ComfyUI, permite montar un flujo completamente offline sin depender de servicios externos.
- Evaluación de compatibilidad GGUF en ComfyUI: sirve como caso de prueba para verificar que los nodos ComfyUI-GGUF cargan correctamente encoders Qwen3 cuantizados con `llama-quantize`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas locales de cuantización y de fidelidad de render:

| Metrica | F16 | Q4_K_S | Diferencia |
|---|---|---|---|
| Perplejidad (`llama-perplexity`, `-c 512 -t 8 -ngl 0`, texto inglés local) | 10,3028 ± 1,10517 | 10,8623 ± 1,16969 | +5,4 % |
| Render FLUX.2 klein 4B (5 prompts, 768x768, 4 pasos, euler, cfg 1.0) | sujeto representado en 5 de 5 | sujeto representado en 5 de 5 | PSNR 14,3–19,1 dB; SSIM 0,69–0,86 |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 2.602.097.056 bytes (unos 2,6 GB); a eso hay que sumar la memoria de contexto y el resto del pipeline (modelo de difusión FLUX.2 klein 4B) si se usa como encoder.
- GPU recomendadas: no disponibles en la información proporcionada; el autor midió con `-ngl 0` (sin offload a GPU) para la prueba de perplejidad.
- Cabe en GPU de consumo: previsiblemente sí por tamaño del fichero, aunque no se especifican modelos concretos ni cifras de VRAM medidas.
- Opciones de despliegue: llama.cpp (herramienta usada para la conversión y cuantización) y ComfyUI con nodos ComfyUI-GGUF (`CLIPLoaderGGUF`, tipo `flux2`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| tokenfrugal-qwen3-4b-q4ks | 4.411.424.256 | no disponible | GGUF Q4_K_S | apache-2.0 | Text encoder para FLUX.2 klein 4B en ComfyUI |
| Qwen/Qwen3-4B (upstream) | 4.411.424.256 | no disponible en esta ficha | safetensors bf16 | apache-2.0 | Modelo de lenguaje general |
| Encoder FP8 previo (retirado del repo klein) | no disponible | no disponible | FP8 con `weight_scale_inv` | no disponible | Text encoder; descartado por texturas planas en 5 de 5 renders |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni evaluaciones de seguridad.
- Riesgo de alucinación: inherente al modelo base Qwen3-4B; no se han publicado evaluaciones específicas para esta cuantización.
- La cuantización Q4_K_S introduce una degradación medible: +5,4 % de perplejidad frente a F16 en la muestra local del autor.
- El uso previsto es acotado (text encoder para FLUX.2 klein 4B en ComfyUI); no hay evidencia publicada de su comportamiento como modelo conversacional o de razonamiento en esta versión.
- Idiomas soportados no disponibles; la única muestra de evaluación reportada es en inglés.
- Longitud de contexto no disponible en la información proporcionada.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-4B y de los pesos derivados.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria independiente de los resultados del autor.
- Las métricas de render y perplejidad fueron medidas en hardware local del autor, no en hardware de referencia del upstream.

## Enlaces

- Hugging Face: https://huggingface.co/maxh8086/tokenfrugal-qwen3-4b-q4ks
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del pipeline de referencia citado por el autor: https://huggingface.co/maxh8086/tokenfrugal-flux2-klein-4b-fp8
