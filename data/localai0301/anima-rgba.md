# localai0301/Anima-RGBA

## Resumen

Anima RGBA es un adaptador para el modelo de generación de imágenes Anima (desarrollado por circlestone-labs) que añade la capacidad de generar imágenes con canal alfa real, es decir, con fondo transparente. Lo publica el usuario localai0301 en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo completo, sino de un par de artefactos complementarios: un VAE de 4 canales (RGBA) y un LoRA entrenado para que el DiT de Anima produzca latentes que ese VAE decodifique con una alfa limpia.

El problema que resuelve es concreto: el VAE original de Qwen-Image, que emplea Anima, solo decodifica RGB opaco. Anima puede dibujar un fondo blanco cuando se le pide "transparent background", pero no puede emitir transparencia real. Anima RGBA sustituye el VAE por una versión de 4 canales inicializada desde los pesos del original y entrena un LoRA para cerrar la pequeña deriva del espacio latente.

Es relevante para flujos de trabajo de generación de imágenes en producción (sprites, assets para juegos, composición gráfica) donde se necesita PNG con alfa sin post-procesado manual. El repo ocupa 0,7 GB y está pensado para ComfyUI sin nodos personalizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE convolucional de 4 canales (encoder + decoder) sobre Qwen-Image VAE, más LoRA para el DiT de Anima |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`anima_rgba_vae.safetensors` 508 MB, `anima_rgba_lora.safetensors` 184 MB) |

## Arquitectura y entrenamiento

El componente principal es una versión de 4 canales del VAE de Qwen-Image. El encoder acepta RGB compuesto sobre blanco más el canal alfa (4 canales de entrada) y mantiene el latente de 16 canales a resolución 1/8. El decoder emite RGB recto (no premultiplicado) más alfa. La inicialización copia los pesos de 3 canales del VAE original, deja a cero la nueva columna de entrada de alfa y añade una fila de salida de alfa a cero con sesgo +1, de modo que antes de entrenar el modelo se comporta exactamente como el VAE original y decodifica todo como opaco. El compuesto sobre blanco se justifica porque el RGB es indefinido donde alfa = 0 y porque es lo que Anima ya dibuja para prompts de fondo transparente; así los latentes RGBA quedan cerca de los que el modelo base ya produce.

El VAE se entrenó durante 12.000 pasos con batch 4 y recortes aleatorios de 512 px, con LR 1e-5 en el encoder y 5e-5 en el decoder, 500 pasos de warmup. La función de pérdida combina L1 de composiciones sobre fondos sólidos aleatorios (peso 1,0), LPIPS (0,2), L1 de alfa (1,0), L1 del gradiente Sobel de alfa (0,5) y MSE de latente de referencia contra el encoder original congelado (0,1). Un 15 % de cada batch son imágenes opacas de regularización. El dataset de entrenamiento contiene 16.496 imágenes RGBA transparentes y 3.032 opacas; el holdout, 449 y 167 respectivamente. Se excluyeron imágenes con damero dibujado y se eliminaron casi duplicados por dHash de RGB y alfa.

El LoRA se entrenó sobre latentes de este VAE con 18.426 imágenes (subconjunto `semi` de 4.754 con zonas semitransparentes, `normal` de 11.742 y `reg` de 1.930 opacas de un solo personaje), con repeticiones que suman 27.934 muestras por época. Las imágenes se reescalan a un lado máximo de 1536. El checkpoint publicado corresponde al paso 25.000.

## Capacidades

- Generación de imágenes con canal alfa real (RGBA) a partir de latentes de Anima, con salida PNG de 4 canales.
- Control de transparencia mediante el trigger `transparent background` o `isolated on a transparent background` en el prompt.
- Manejo de zonas semitransparentes (pelo, alas, telas, humo) gracias al subconjunto `semi` del dataset del LoRA.
- Compatibilidad directa con flujos de ComfyUI basados en Anima, sin nodos personalizados.
- Reconstrucción RGB de imágenes opacas con calidad ligeramente superior al VAE original (PSNR +0,48 dB).
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo; es un adaptador de imagen.
- No se documentan capacidades multilingües; los ejemplos usan prompts en inglés.

## Casos de uso

- Generación de sprites y assets para videojuegos: el modelo produce personajes y objetos con alfa limpio directamente, lo que elimina el recortado manual y permite integrarlos en motores 2D o 3D con composición por capas.
- Composición gráfica y diseño editorial: se generan elementos aislados (pasteles, armas, personajes) que se colocan sobre fondos arbitrarios en herramientas de diseño, aprovechando la salida RGB recta más alfa del decoder.
- Creación de avatares y stickers para mensajería: el LoRA maneja bien figuras de cuerpo completo y planos medios con fondo transparente, adecuado para packs de stickers con transparencia real.
- Prototipado rápido de UI y mockups: se generan ilustraciones con fondo transparente que se superponen en maquetas sin pasos intermedios de segmentación.
- pipelines de aumento de datos: se generan objetos aislados con alfa para componerlos sintéticamente sobre escenas y ampliar datasets de detección o segmentación con máscaras de verdad terreno.
- Sustitución del VAE en flujos existentes de Anima: cualquier workflow de ComfyUI que ya use Anima puede cambiar únicamente el VAE y añadir el LoRA para obtener alfa, manteniendo el resto del pipeline (sampler, scheduler, CFG) intacto.

## Benchmarks y rendimiento

Evaluación del VAE sobre holdout de 512 px (200 imágenes transparentes y 50 opacas, ninguna usada en entrenamiento).

| Métrica | Valor |
|---|---|
| Alpha MAE (transparentes) | 0,0027 (≈ 0,7 / 255) |
| Alpha RMSE (transparentes) | 0,0157 (≈ 4 / 255, error concentrado en bordes) |
| PSNR compuesto sobre blanco | 34,94 dB |
| PSNR compuesto sobre negro | 33,17 dB |
| PSNR RGB opacas, VAE original | 34,26 dB |
| PSNR RGB opacas, Anima RGBA VAE | 34,74 dB (+0,48) |
| Deriva de latente (RMS en unidades de std) | 0,058 (≈ 6 % de una desviación típica) |

No se han publicado resultados de benchmarks de generación (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del DiT de Anima subyacente, no del adaptador. El VAE añade 508 MB y el LoRA 184 MB en disco.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo base Anima y el VAE de Qwen-Image condicionan los requisitos; se recomienda consultar la ficha de Anima.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el tamaño del adaptador es pequeño, pero el modelo base marca el límite.
- Despliegue: ComfyUI (soporte nativo, sin nodos personalizados). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de difusión de imagen.
- Latencia y throughput: no disponibles. Los ejemplos usan 30 pasos, CFG 4,5, sampler er_sde / simple y resolución 1024 × 1024.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / resolución | Transparencia nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anima RGBA | Adaptador VAE + LoRA para Anima | 1024 × 1024 en ejemplos | Sí (RGBA) | Apache 2.0 | Hugging Face |
| Anima (base) | Modelo de difusión de imagen | no disponible | No (fondo blanco) | no disponible | Hugging Face |
| Qwen-Image VAE | VAE RGB de 3 canales | 1/8 de resolución | No | no disponible | Incluido en Anima |

No se dispone de datos de benchmarks comparativos con otros adaptadores RGBA en la información proporcionada.

## Limitaciones y advertencias

- El LoRA publicado corresponde al paso 25.000; no se documenta la curva de entrenamiento ni si hay checkpoints intermedios.
- Sin el LoRA, el VAE produce alfa pero borroso; el LoRA es necesario para una alfa limpia.
- Subir la fuerza del LoRA por encima de 1,0 (p. ej. 1,5) genera residuos semitransparentes alrededor del sujeto; para reforzar la transparencia se recomienda subir el peso del trigger, no la fuerza del LoRA.
- La deriva de latente del 6 % de una desviación típica implica que el LoRA debe compensar esa diferencia; puede haber degradación en prompts muy alejados de la distribución de entrenamiento.
- El dataset de entrenamiento está sesgado hacia personajes de anime (prompts con `1boy`, `1girl`, `safe`, estética danbooru); el rendimiento en otros dominios no está evaluado.
- Riesgo de alucinación visual y artefactos en bordes de alfa, donde se concentra el error RMSE.
- No se documentan sesgos demográficos ni de contenido; el uso de triggers como `safe` sugiere un filtrado orientado a contenido para todos los públicos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Anima y el VAE de Qwen-Image tienen sus propias licencias que deben verificarse por separado.
- No hay información sobre idiomas soportados en prompts; los ejemplos son en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/localai0301/Anima-RGBA
- Modelo base Anima: https://huggingface.co/circlestone-labs/Anima
