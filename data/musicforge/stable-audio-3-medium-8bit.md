# MusicForge/stable-audio-3-medium-8bit

## Resumen

Stable Audio 3 Medium 8bit es una conversión a MLX con cuantización INT8 del modelo Stable Audio 3 (variante optimizada) de Stability AI, publicada por el usuario MusicForge. Se trata de un modelo de difusión latente texto-a-audio que genera música y efectos de sonido a 44,1 kHz en estéreo, e incluye capacidades de inpainting por máscaras y continuación de audio a partir de un clip corto. El bundle está pensado para ejecutarse en Apple Silicon mediante el runtime oficial en MLX de Stability AI, no como pesos autónomos listos para otros frameworks.

La relevancia de esta ficha radica en que es una de las pocas distribuciones cuantizadas del ecosistema Stable Audio 3 orientadas a hardware de Apple. El denoiser DiT (Medium, 1.400 millones de parámetros) se empaqueta en INT8 con group-size 64, mientras que el códec SAME-L y el codificador de texto T5Gemma se mantienen en FP32 y FP16 respectivamente por razones de estabilidad numérica documentadas por el autor. El resultado es un paquete de 5,5 GB que reduce el peso del componente principal a 1 GB.

El modelo hereda la licencia Stability AI Community License del modelo base y añade las Gemma Terms of Use por el componente T5Gemma. Está etiquetado únicamente para inglés y su pipeline es text-to-audio. No se han publicado resultados de benchmarks ni métricas de calidad objetivas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con difusión latente; códec SAME-L (encoder/decoder) y codificador de texto T5Gemma |
| Parametros totales | 1.400 millones en el DiT Medium; el bundle completo incluye además SAME-L encoder/decoder y T5Gemma (sin recuento total publicado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación de audio de longitud variable, hasta varios minutos según la model card) |
| Tipos de cuantizacion | INT8 (DiT, group-size 64); FP32 (SAME-L encoder y decoder); FP16 (T5Gemma) |
| Idiomas soportados | en (inglés) |
| Licencia | Stability AI Community License; componente T5Gemma bajo Gemma Terms of Use |
| Formato de pesos | safetensors (MLX); DiT en int8 con tripletas weight/scales/biases desquantizadas en carga con `mlx.core.dequantize` |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusión latente: un codificador de audio SAME-L transforma la forma de onda en latentes, un Diffusion Transformer (DiT) actúa como denoiser sobre esos latentes y el decoder SAME-L reconstruye la señal a 44,1 kHz estéreo. La condicionación textual la aporta un codificador T5Gemma (linaje `google/t5gemma-b-b-ul2`) en FP16. El DiT Medium es la variante generalista de mayor calidad del bundle; las variantes Small están especializadas en música y en efectos de sonido según la model card.

La innovación técnica destacable de esta distribución es la cuantización selectiva: solo el DiT se cuantiza a INT8, mientras que el códec se mantiene en FP32 porque, según el autor, la atención diferencial de SAME se cancela catastróficamente en FP16. T5Gemma permanece en FP16 porque su codificación de prompts es corta y la cuantización no aporta aceleración. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; estos datos corresponden al modelo base de Stability AI y no se reproducen aquí.

## Capacidades

- Generación de audio a partir de texto (text-to-audio) con salida a 44,1 kHz estéreo.
- Generación de música y de efectos de sonido (SFX), según la especialización de la variante DiT.
- Inpainting y edición por regiones mediante difusión latente enmascarada.
- Continuación de audio a partir de un clip corto de referencia.
- Generación de longitud variable, hasta varios minutos según la model card.
- Condicionación por prompts en inglés (único idioma soportado).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no aplica a un modelo de audio.
- No se documentan capacidades de visión, audio de entrada como prompt semántico (más allá del clip de continuación) ni modo de razonamiento explícito.

## Casos de uso

- Producción musical asistida: generar bocetos de pistas o capas instrumentales a partir de descripciones textuales, usando la variante especializada en música para iterar sobre ideas antes de la mezcla final.
- Diseño de efectos de sonido para videojuegos y audiovisual: crear SFX concretos (impactos, ambientes, transiciones) con la variante SFX y editar regiones con inpainting para ajustar duración o carácter.
- Postproducción y edición por regiones: sustituir un fragmento concreto de una pista mediante inpainting enmascarado, manteniendo coherencia con el resto del audio.
- Continuación de clips: extender una grabación o un loop corto hasta varios minutos, útil para generar colas musicales o fondos continuos en podcasts y vídeo.
- Prototipado rápido en Mac: al ejecutarse sobre MLX en Apple Silicon, permite iterar localmente sin GPU dedicada, adecuado para estudios pequeños y desarrolladores individuales.
- Generación de bandas sonoras para contenido corto: producir música de fondo para vídeos, anuncios o demos a partir de prompts en inglés, con control de duración variable.
- Investigación en generación de audio: servir como base cuantizada para experimentar con difusión latente, inpainting y decodificación sobre el runtime MLX de Stability AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el bundle completo ocupa 5,5 GB en disco; en carga, el DiT INT8 se desquantiza a FP16 en memoria, por lo que el pico de memoria supera el tamaño de los ficheros. No se publica una cifra oficial de memoria en inferencia.
- Hardware objetivo: Apple Silicon con MLX (runtime oficial `stable-audio-3/optimized/mlx`). No se documenta soporte para CUDA ni para GPUs NVIDIA (A100, H100, RTX 4090) en esta distribución.
- Cabe en equipos Apple Silicon con memoria unificada suficiente para alojar los 5,5 GB de pesos más el estado de inferencia; no se especifica el mínimo exacto.
- Despliegue: exclusivamente mediante MLX y el runtime de Stability AI; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stable Audio 3 Medium 8bit (esta ficha) | 1.400 M (DiT) | longitud variable, hasta varios minutos | INT8 (DiT), FP32 (códec), FP16 (texto) | Stability AI Community License + Gemma Terms | MLX, Apple Silicon |
| stabilityai/stable-audio-3-optimized | no disponible | no disponible | pesos originales (sin cuantizar) | Stability AI Community License | HuggingFace, runtime oficial MLX |
| Variantes DiT-Small (Music / SFX) del mismo bundle | no disponible | no disponible | INT8 / según variante | Stability AI Community License | MLX, Apple Silicon |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo soporta inglés; los prompts en otros idiomas pueden degradar la calidad de la generación.
- No se han publicado evaluaciones objetivas de calidad, sesgos o fidelidad; el riesgo de generar audio incoherente o artefactos no está cuantificado.
- La cuantización INT8 del DiT puede introducir pérdida de calidad respecto a los pesos originales; no se documenta la magnitud de esa degradación.
- El códec SAME-L debe permanecer en FP32: usarlo en FP16 provoca cancelación catastrófica de la atención diferencial, según el autor.
- La licencia Stability AI Community License permite uso comercial solo hasta el umbral de ingresos definido por Stability AI; el componente T5Gemma añade las Gemma Terms of Use, que imponen condiciones adicionales.
- Dependencia estricta del runtime MLX de Stability AI y de Apple Silicon; no es portable a otros backends sin trabajo adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; es una conversión de terceros, no una publicación oficial de Stability AI.
- El identificador del repositorio en el ejemplo de código de la model card (`aufklarer/Stable-Audio-3-DiT-Medium-MLX-8bit`) no coincide con el ID del repositorio (`MusicForge/stable-audio-3-medium-8bit`), lo que puede provocar errores al descargar.

## Enlaces

- HuggingFace: https://huggingface.co/MusicForge/stable-audio-3-medium-8bit
- Modelo base: https://huggingface.co/stabilityai/stable-audio-3-optimized
- Paper: https://arxiv.org/abs/2605.17991
- Runtime MLX oficial: https://github.com/Stability-AI/stable-audio-3/tree/main/optimized/mlx
- Licencia Stability AI: https://stability.ai/license
- Codificador de texto (T5Gemma): https://huggingface.co/google/t5gemma-b-b-ul2
- SDK Apple: https://github.com/soniqo/speech-swift
- Web del autor de la conversión: https://soniqo.audio
- Blog: https://soniqo.audio/blog
