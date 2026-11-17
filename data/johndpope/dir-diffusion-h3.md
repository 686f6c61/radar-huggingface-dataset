# johndpope/dir-diffusion-h3

## Resumen

DiR on MiniMax H3 es un checkpoint de investigación publicado por el usuario johndpope que implementa un generador de vídeo de 4 iteraciones sobre el modelo de difusión MiniMax H3. Se trata de un LoRA de rango 128 acompañado de una cabeza DiR ("Data-space Iteration"), entrenado con la técnica descrita en el artículo "Few-Step Generation via Data-Space Iteration" de ByteDance Seed (arXiv 2610.12102). El objetivo es reducir el número de pasos de muestreo de un modelo de difusión de vídeo de 20 pasos a solo 4 iteraciones, manteniendo el nivel de movimiento del modelo profesor y añadiendo detalle.

El punto de partida es el LoRA de 4 pasos Minimax-H3-Turbo de LightX2V (licencia Apache-2.0), recortado a rango 128 y entrenado con pérdida de distribution matching (DMD) contra el H3 congelado. El autor advierte explícitamente que no es un modelo terminado: es un único run de 100 pasos con 2 muestras por actualización, entrenado en una sola RTX 5090 durante unas 2,5 horas.

La relevancia es doble: por un lado, demuestra que la técnica DiR es portable a un DiT de vídeo de gran escala como H3; por otro, su licencia (MiniMax H3 Community License) restringe el uso y la redistribución exclusivamente fuera de la UE, Reino Unido, Corea del Sur y Estados Unidos, lo que limita severamente su aplicabilidad comercial en esos territorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 128) sobre DiT de vídeo MiniMax H3 + cabeza DiR (proyección de estimación previa y embedding de iteración) |
| Parametros totales | no disponible (el repo ocupa 1.2 GB; el LoRA es de rango 128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionado por prompts de texto largos; entrenado con 12 frames latentes de 32×48) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts de texto; el autor no especifica idiomas) |
| Licencia | minimax-h3-community-license (uso y redistribución solo fuera de UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | `lora_gen.safetensors` (claves musubi-tuner), `dir_head.pt` (state_dict), `config.json` |

## Arquitectura y entrenamiento

El modelo se compone de tres artefactos: un LoRA de rango 128 para el generador (`lora_gen.safetensors`, con claves de musubi-tuner, pesos promediados con EMA 0.99 en el paso 100), una cabeza DiR (`dir_head.pt`, que contiene la proyección de estimación previa y el embedding de iteración, cargable con `weights_only=True`) y un `config.json` del que el loader lee los sigmas y los tamaños. La base es el DiT de vídeo MiniMax H3, un transformer de difusión que el autor describe como destilado con CFG.

El entrenamiento parte del LoRA Minimax-H3-Turbo de 4 pasos de LightX2V (Apache-2.0), recortado a rango 128, con los sigmas de Turbo y una cabeza DiR inicializada a cero. La pérdida es distribution matching (DMD) contra el H3 congelado, usando el modelo falso por iteración descrito en el paper. Solo se usan prompts de texto; no hay clips ni imágenes como objetivos. Una modificación específica para H3: el nivel de ruido del generador se limita a 0.9, porque H3 está destilado con CFG y por encima de ese nivel la respuesta de una sola llamada queda dominada por la guía incorporada. El run completo son 100 actualizaciones, 2 muestras por actualización, lr 2e-5, una RTX 5090 y unas 2,5 horas (el paper entrena con batch 256).

## Capacidades

- Generación de vídeo a partir de prompts de texto descriptivos largos, en 4 iteraciones de muestreo.
- Reducción del número de pasos frente al profesor H3 (20 pasos) manteniendo el nivel de movimiento.
- Añade detalle respecto a Turbo 4-step (0.45 frente a 0.43 en la métrica de detalle del autor).
- Entrenado y medido exclusivamente con 12 frames latentes a 32×48 (aproximadamente 512×768 px).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un generador de vídeo, no un LLM.
- No se documentan capacidades multilingües, de visión, audio ni modo "thinking".
- Interfaz únicamente mediante scripts del repositorio; no hay interfaz de cadena de prompt.

## Casos de uso

- Investigación sobre destilación few-step en difusión de vídeo: sirve como referencia reproducible de la técnica DiR aplicada a un DiT de gran escala, con receta de entrenamiento publicada en el issue #4 del repositorio.
- Experimentos académicos comparativos: permite medir la brecha entre un profesor de 20 pasos (H3) y un alumno de 4 iteraciones en métricas de movimiento, detalle y escala RMS sobre latentes, usando el script `yardstick_dir_h3.py`.
- Prototipado de generación de vídeo corto en entornos de investigación sin requisitos de producción, siempre que la jurisdicción quede fuera de UE, Reino Unido, Corea del Sur y EE. UU.
- Estudio de la sobre-generación de movimiento: el checkpoint corrige el exceso de movimiento de Turbo (−0.212 ± 0.028 en comparación pareada), lo que lo hace útil para analizar el equilibrio movimiento/detalle en destilación.
- Base para futuros runs más largos: el autor señala que los pesos vivos seguían perdiendo movimiento en el paso 100, por lo que sirve como punto de partida para recetas con más pasos o mayor batch.
- Evaluación de licencias y restricciones territoriales en modelos derivados: caso práctico de cómo una licencia comunitaria de un modelo base condiciona la redistribución de un LoRA derivado.

## Benchmarks y rendimiento

Métricas de estadísticas latentes publicadas por el autor sobre 8 prompts retenidos × 4 semillas, 12 frames latentes a 32×48, en una RTX 5090:

| Modelo | Movimiento | Detalle | Tamaño (rms) |
|---|---|---|---|
| H3, 20 pasos (profesor) | 0.25 | 0.35 | 1.08 |
| Turbo 4-step (punto de partida) | 0.47 | 0.43 | 1.04 |
| Este checkpoint, 4 iteraciones | 0.26 | 0.45 | 1.00 |

Comparación pareada con Turbo en los mismos prompts y semillas: −0.212 ± 0.028 en movimiento y +0.018 ± 0.005 en detalle respecto al profesor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench u otros) en la información disponible.

## Requisitos de hardware

- Entrenamiento: una única RTX 5090, aproximadamente 2,5 horas para 100 actualizaciones con 2 muestras por actualización.
- Inferencia: el autor ejecuta las mediciones en una RTX 5090; no se especifica VRAM exacta ni cuantizaciones soportadas.
- El repo pesa 1.2 GB (LoRA + cabeza + config), pero requiere cargar el checkpoint base MiniMax H3, cuyo peso no se detalla en la información disponible.
- No se documentan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI; la ejecución es mediante scripts de Python del repositorio (`yardstick_dir_h3.py`, `probe_dir_h3.py`).
- No se publican cifras de latencia ni throughput más allá del tiempo de entrenamiento indicado.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Movimiento | Detalle | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (DiR sobre H3) | LoRA + cabeza DiR | 4 iteraciones | 0.26 | 0.45 | minimax-h3-community-license (restringida por territorio) | Hugging Face, repo de 1.2 GB |
| MiniMax H3 (profesor) | DiT de vídeo | 20 | 0.25 | 0.35 | minimax-h3-community-license | Modelo base en Hugging Face |
| Minimax-H3-Turbo (LightX2V) | LoRA de 4 pasos | 4 | 0.47 | 0.43 | Apache-2.0 | GitHub ModelTC/Minimax-H3-Turbo |

No se dispone de datos de otros modelos de vídeo comparables (por ejemplo, variantes few-step de otros DiT) en la información proporcionada.

## Limitaciones y advertencias

- Pesos de investigación, no un modelo terminado: un solo run de 100 pasos con 2 muestras por actualización, frente al batch 256 del paper.
- Los pesos vivos seguían perdiendo movimiento en el paso 100; un run más largo con la misma receta probablemente quedaría demasiado estático.
- Solo entrenado y medido con 12 frames latentes a 32×48 y prompts descriptivos largos; otros tamaños y longitudes no están probados.
- El detalle es ligeramente superior al de Turbo y se aleja más del profesor: los frames decodificados son nítidos pero más recargados, el encuadre es más cerrado y en uno de cada tres prompts de prueba aparece una segunda persona.
- Restricción de licencia severa: uso y redistribución permitidos solo fuera de la UE, Reino Unido, Corea del Sur y Estados Unidos.
- No hay interfaz de cadena de prompt; los scripts leen de una caché de subtítulos codificados que hay que construir previamente.
- El conjunto de prompts de entrenamiento (801 imágenes isométricas con subtítulos) no está publicado, lo que dificulta la reproducción exacta.
- No es un modelo afiliado a ByteDance, MiniMax ni LightX2V; es un port independiente.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johndpope/dir-diffusion-h3
- Repositorio de código y mediciones: https://github.com/scrya-com/dir-diffusion
- Receta de entrenamiento (issue #4): https://github.com/scrya-com/dir-diffusion/issues/4
- Cheatsheet de reproducción: https://github.com/scrya-com/dir-diffusion/blob/main/DIR_CHEATSHEET.md
- Paper DiR (arXiv 2610.12102): https://arxiv.org/abs/2610.12102
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA Minimax-H3-Turbo (LightX2V): https://github.com/ModelTC/Minimax-H3-Turbo
- Licencia: archivo `LICENSE` del repositorio de Hugging Face
- Aviso legal: archivo `NOTICE` del repositorio de Hugging Face
