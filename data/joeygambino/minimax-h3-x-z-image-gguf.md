# joeygambino/MiniMax-H3-x-Z-Image-GGUF

## Resumen

MiniMax-H3-x-Z-Image-GGUF es una serie de checkpoints cuantizados en formato GGUF que fusiona el motor de generación de vídeo MiniMax-H3 con el perfil de atención espacial del modelo de imagen Z-Image (Lumina2, de 6 mil millones de parámetros). El resultado es un modelo de texto a vídeo que conserva la identidad, las voces, la velocidad y los requisitos de VRAM del MiniMax-H3 original, pero que rinde una textura notablemente más rica en escenarios y superficies: el desconchado de la pintura, la oxidación, el agua con más brillo, etc. El autor, joeygambino, lo describe como un "injerto" (graft) de estadísticas de atención que no requiere reentrenamiento ni cambios de arquitectura.

El modelo está pensado como un reemplazo directo de los checkpoints estándar de MiniMax-H3 en ComfyUI, y se distribuye en varias cuantizaciones (Q8_0, Q5_1, Q4_0) para adaptarse a diferentes presupuestos de VRAM. No se han publicado resultados de benchmarks estándar (MMLU, etc.) porque no es un modelo de lenguaje, sino de generación de vídeo; el autor proporciona una métrica propia de consistencia de detalle entre escenas (high-band ratio) que muestra una mejora frente al modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con atención per-head Q-norm (base MiniMax-H3) |
| Parametros totales | 20.111.438.744 (~20,1 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q5_1, Q4_0 (variantes curve y plain) |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo parte de MiniMax-H3, un modelo de generación de vídeo basado en un transformer de difusión con normalización Q por cabeza (per-head Q normalisation). Sobre esta base, el autor aplica un "injerto" de las estadísticas de atención espacial de Z-Image (Lumina2, un modelo de imagen de 6B con una capacidad excepcional para texturas). El procedimiento consiste en rescaling de los pesos de `q_norm` en los bloques posteriores de H3, replicando así el perfil de compromiso con el detalle fino que caracteriza a Z-Image. No hay reentrenamiento, ni nueva arquitectura, ni adición de conocimiento: solo se transfieren estadísticas de atención, mediante un mecanismo propio, bloque a bloque y con control de dosis. Los bloques tempranos se dejan intactos (si se injertan, se produce un artefacto de celosía en texturas regulares, según mediciones del autor). La normalización K y las capas feed-forward no se tocan. El resultado se verifica a nivel de tensor tras el horneado y se valida con comparaciones de misma semilla frente a la implementación de parche en tiempo de ejecución.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imágenes de referencia (reference-to-video, ref2va) y de un fotograma suministrado (first-last-to-video, fl2va).
- Conservación de identidad y voz en escenas encadenadas (multishot).
- Mejora notable de la textura de escenarios y superficies en comparación con MiniMax-H3 estándar.
- Compatibilidad completa con los flujos de trabajo de ComfyUI de MiniMax-H3, incluido el plugin Multishot para encadenar escenas sin costuras.
- Soporte de audio y vídeo en el mismo pipeline (según etiquetas de la model card).
- No dispone de tool calling, ni de capacidades de agente, ni de razonamiento simbólico: es un modelo puramente generativo de vídeo.

## Casos de uso

- **Producción de vídeo para publicidad**: el modelo permite generar escenarios con acabados realistas (texturas de materiales, iluminación, desgaste) a partir de un guion de texto, sin necesidad de rodaje. La mejora de textura es especialmente útil para productos que dependen del detalle superficial (cosmética, moda, automoción).
- **Creación de contenido para redes sociales**: creadores pueden generar clips de vídeo con una estética cuidada y con consistencia de identidad en tomas consecutivas, gracias al modo ref2va que mantiene el rostro y la voz de un personaje entre escenas.
- **Desarrollo de escenarios para videojuegos y entornos virtuales**: el modelo puede producir secuencias de vídeo que sirvan como base para texturas o animaciones de fondo, con una riqueza de detalle que reduce el trabajo de postproducción.
- **Generación de metraje de referencia para efectos visuales**: los equipos de VFX pueden utilizar las variantes fl2va para que una toma termine en un fotograma concreto, útil para planificar transiciones o integrar elementos CGI.
- **Prototipado de conceptos audiovisuales**: directores y diseñadores pueden generar rápidamente pruebas de concepto con una textura visual realista, lo que acelera la toma de decisiones creativas.
- **Contenido educativo y divulgativo**: se pueden crear animaciones explicativas con escenarios detallados (por ejemplo, procesos químicos, mecánicos o naturales) en los que la textura de los materiales es clave para la comprensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es de lenguaje. El autor proporciona una métrica propia de consistencia de banda alta en escenas encadenadas: 0,99 de ratio de banda alta sobre 3 uniones frente a 1,11 del modelo original, lo que indica que el injerto mantiene el detalle sin un aumento de la nitidez por plano. No se han encontrado comparaciones con otros modelos de generación de vídeo en la información disponible.

## Requisitos de hardware

- **VRAM estimada según cuantización**:
  - `*-curve-zs05-Q8_0.gguf`: 32 GB (cerca de la precisión completa).
  - `*-curve-zs05-Q5_1.gguf`: 24–32 GB (para tarjetas de 24 GB).
  - `*-curve-zs05-Q4_0.gguf`: 16–24 GB (para tarjetas de 16 GB).
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), A100 (40/80 GB). Con cuantización Q4_0 podría funcionar en una RTX 4080 (16 GB) o RTX 3080 Ti (12 GB) con limitaciones.
- **Despliegue**: ComfyUI 0.30.0 o superior, con el cargador de GGUF de MiniMax-H3. No se ha documentado el uso con otros runtime como vLLM o TGI, dado que es un modelo de difusión de vídeo, no un LLM.
- **Latencia y throughput**: no disponible en la información proporcionada. Depende del hardware y de la longitud de la secuencia generada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|--------|-----------|----------|----------|----------------|
| **MiniMax-H3-x-Z-Image-GGUF** | 20,1 B | No disponible | Comunitaria (minimax-h3) | GGUF en HuggingFace |
| **MiniMax-H3 (original)** | 20,1 B | No disponible | Comunitaria (minimax-h3) | safetensors / GGUF |
| **LTX-V3** (mencionado en la card) | No disponible | No disponible | No disponible | No disponible |

La comparación principal es con el MiniMax-H3 estándar: este modelo conserva todas las capacidades del original, pero añade una mejora en la textura de superficies y escenarios, con una consistencia entre escenas medida (0,99 vs 1,11 en la métrica propia). No se ha proporcionado datos comparativos con otros modelos de generación de vídeo como CogVideoX o Stable Video Diffusion, por lo que no se puede realizar una comparativa numérica.

## Limitaciones y advertencias

- **Artefactos en bloques tempranos**: si se aplica el injerto a los bloques iniciales, se produce un patrón de celosía en texturas regulares; el autor solo recomienda la versión que deja intactos esos bloques.
- **Licencia**: la licencia `minimax-h3-community-license` tiene restricciones de uso comercial; se debe revisar el texto completo en el enlace proporcionado antes de su uso en producción.
- **Alucinación y coherencia**: como cualquier modelo generativo de vídeo, puede producir contenido incoherente en escenas largas o con descripciones ambiguas; se recomienda validación humana.
- **Idiomas**: no se ha especificado qué idiomas soporta el modelo; se asume que los mismos que MiniMax-H3 (probablemente inglés y chino, pero no confirmado).
- **Dependencia de ComfyUI**: la instalación requiere ComfyUI 0.30.0 o superior; no hay soporte oficial para otros entornos.
- **Tamaño del repositorio**: el repositorio ocupa 205,4 GB, lo que puede suponer un coste de descarga significativo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/joeygambino/MiniMax-H3-x-Z-Image-GGUF)
- [MiniMax-H3 original en HuggingFace](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Licencia de MiniMax-H3](https://huggingface.co/Comfy-Org/MiniMax-H3)
- [Repositorio del plugin Multishot para ComfyUI](https://github.com/jlucasmcrell/ComfyUI-H3-Multishot)
- [Publicación en Civitai](https://civitai.com/models/2880921/minimax-h3-x-z-image-richer-sets-and-textures-same-identity-the-spatial-detail-graft)
- [Modelos de joeygambino en HuggingFace](https://huggingface.co/joeygambino/models)
