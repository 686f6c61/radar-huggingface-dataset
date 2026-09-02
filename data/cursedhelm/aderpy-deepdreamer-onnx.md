# cursedhelm/aderpy-deepdreamer-onnx

## Resumen

El modelo `cursedhelm/aderpy-deepdreamer-onnx` es una conversión a formato ONNX del modelo de difusión estable `segmind/tiny-sd`, preparada específicamente para su ejecución en navegador mediante ONNX Runtime Web y WebGPU. El autor, bajo el alias "cursedhelm", lo ha desarrollado como parte de la aplicación "aderpy DeepDreamer", una herramienta de manipulación y generación de medios que funciona íntegramente en el cliente. El repositorio incluye tres variantes del modelo (FP16, FP32 y cuantización 4-bit con ejecución FP16) con todos los componentes necesarios para la inferencia: text encoder, UNet, VAE encoder y VAE decoder, junto con manifiestos y metadatos de scheduler.

Este modelo resuelve el problema de ejecutar generación de imágenes por difusión en dispositivos sin GPU dedicada o sin acceso a servidores, aprovechando la aceleración WebGPU del navegador. Su relevancia radica en la creciente demanda de aplicaciones de IA generativa que respeten la privacidad del usuario al no enviar datos a servidores externos. Al estar basado en Tiny-SD, un modelo compacto de difusión, ofrece una alternativa ligera frente a modelos más grandes como Stable Diffusion 1.5 o SDXL, aunque con menor capacidad de generación. La licencia CreativeML Open RAIL-M permite uso comercial con restricciones, lo que facilita su integración en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion (UNet + VAE + text encoder) |
| Parametros totales | no disponible (basado en segmind/tiny-sd) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen, no de lenguaje) |
| Tipos de cuantizacion | FP16, FP32, 4-bit (con ejecución FP16) |
| Idiomas soportados | no disponible (el text encoder soporta inglés, pero no se especifica) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | ONNX (archivos .onnx, no safetensors) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `segmind/tiny-sd`, un modelo de difusión estable de tamaño reducido. La arquitectura sigue el esquema clásico de Stable Diffusion: un text encoder (basado en CLIP) que convierte el prompt en embeddings, un UNet que realiza el proceso de denoising en el espacio latente, y un VAE que codifica y decodifica las imágenes. No se dispone de información sobre el entrenamiento original de Tiny-SD (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), ya que la model card solo documenta el proceso de conversión a ONNX. La conversión se realizó a partir de la revisión `cad0bd7495fa6c4bcca01b19a723dc91627fe84f` del modelo base, y los manifiestos incluidos en cada variante registran los detalles técnicos de la conversión.

Las tres variantes ofrecen diferentes equilibrios entre tamaño y precisión: la variante FP16 (1.07 GB) es la recomendada para la mayoría de casos, la FP32 (2.13 GB) ofrece mayor precisión numérica pero ocupa más memoria, y la variante 4-bit (707 MB) reduce significativamente el tamaño a costa de una ligera pérdida de calidad. Todas ellas están diseñadas para ejecutarse con ONNX Runtime Web, que utiliza WebGPU para acelerar la inferencia en el navegador.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline de Stable Diffusion.
- Edición de imágenes existentes (image-to-image) usando el VAE encoder y decoder.
- Ejecución completamente en el navegador, sin necesidad de servidor ni GPU dedicada, gracias a WebGPU.
- Soporte de múltiples variantes de precisión (FP16, FP32, 4-bit) para adaptarse a diferentes capacidades de hardware.
- Incluye todos los componentes necesarios (text encoder, UNet, VAE) en formato ONNX, listos para ser cargados por ONNX Runtime Web.
- Compatible con la aplicación aderpy DeepDreamer, que ofrece herramientas adicionales de manipulación de medios (dither, crossfader, animorpher, etc.).

## Casos de uso

- Generación de imágenes en aplicaciones web sin backend: un desarrollador puede integrar este modelo en una página estática para permitir a los usuarios crear imágenes a partir de prompts, sin necesidad de mantener servidores de inferencia ni pagar por APIs externas.
- Edición de imágenes en el navegador: gracias al soporte de image-to-image, los usuarios pueden cargar una foto y aplicar transformaciones estilísticas (por ejemplo, convertirla en un "deep dream") directamente en su navegador, con total privacidad.
- Prototipado rápido de herramientas de IA generativa: al ser un modelo pequeño y fácil de desplegar, es ideal para experimentar con interfaces de usuario y flujos de trabajo creativos antes de escalar a modelos más grandes.
- Aplicaciones educativas: permite demostrar el funcionamiento de los modelos de difusión en un entorno accesible, sin requerir conocimientos de infraestructura ni hardware especializado.
- Herramientas de arte generativo y manipulación de medios: la suite aderpy incluye múltiples utilidades (titler, dither, crossfader, etc.) que pueden combinarse con la generación de imágenes para crear efectos visuales complejos.
- Despliegue en entornos con recursos limitados: la variante 4-bit (707 MB) puede ejecutarse en dispositivos con poca memoria, como tablets o portátiles antiguos, siempre que el navegador soporte WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre tiempos de inferencia, calidad de imagen (FID, CLIP score) ni comparaciones con otros modelos. El autor no proporciona métricas de rendimiento en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- La inferencia se realiza en el navegador mediante WebGPU, por lo que se requiere un navegador compatible (Chrome, Edge, Firefox Nightly, etc.) y una GPU que soporte WebGPU (la mayoría de GPUs integradas y dedicadas modernas).
- Tamaño de los pesos: la variante FP16 ocupa 1.07 GB, la FP32 2.13 GB y la 4-bit 707 MB. La VRAM necesaria será aproximadamente el tamaño del modelo más overhead de ejecución; se estima que la variante 4-bit puede funcionar con 1-2 GB de VRAM, mientras que la FP32 requerirá al menos 3 GB.
- No se especifican GPUs concretas, pero al ser un modelo pequeño, debería ejecutarse en GPUs integradas (como Intel Iris Xe o AMD Radeon integrada) y en GPUs dedicadas de gama media (GTX 1060, RTX 2060, etc.).
- Opciones de despliegue: exclusivamente en navegador mediante ONNX Runtime Web. No se proporcionan instrucciones para usar vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerán del hardware del cliente y de la variante elegida.

## Comparativa con modelos similares

| Modelo | Tamaño (aprox.) | Formato | Licencia | Uso en navegador |
|---|---|---|---|---|
| cursedhelm/aderpy-deepdreamer-onnx | 707 MB - 2.13 GB | ONNX | CreativeML Open RAIL-M | Sí (WebGPU) |
| segmind/tiny-sd (original) | ~1 GB (FP16) | PyTorch | CreativeML Open RAIL-M | No (requiere servidor) |
| Stable Diffusion 1.5 | ~4 GB (FP16) | PyTorch | CreativeML Open RAIL-M | No (requiere servidor) |

La comparativa se limita a los datos disponibles. No se dispone de información sobre otros modelos ONNX similares para navegador. La principal diferencia con el modelo base es el formato ONNX y la preparación específica para WebGPU, lo que permite su ejecución en el cliente. Frente a Stable Diffusion 1.5, Tiny-SD es significativamente más pequeño, lo que lo hace más adecuado para entornos con recursos limitados, aunque con menor calidad de generación.

## Limitaciones y advertencias

- Al ser una conversión de Tiny-SD, hereda las limitaciones del modelo base: menor calidad de imagen en comparación con modelos más grandes como SDXL, y posible dificultad con prompts complejos o conceptos abstractos.
- No se dispone de información sobre sesgos específicos, pero los modelos de difusión entrenados con datos de internet pueden reproducir estereotipos o generar contenido inapropiado. La licencia CreativeML Open RAIL-M incluye restricciones de uso para evitar aplicaciones dañinas.
- Riesgo de alucinación visual: el modelo puede generar imágenes que no corresponden fielmente al prompt, especialmente con conceptos poco comunes.
- Limitaciones de idioma: el text encoder probablemente está entrenado principalmente en inglés, por lo que los prompts en otros idiomas pueden producir resultados subóptimos.
- La ejecución en navegador depende de la compatibilidad con WebGPU, que aún no está disponible en todos los navegadores y dispositivos. En hardware antiguo o sin soporte WebGPU, el modelo no funcionará.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto personal o en fase temprana; no hay garantía de mantenimiento o soporte.
- La licencia CreativeML Open RAIL-M permite uso comercial, pero impone condiciones (por ejemplo, no usar para generar contenido ilegal o dañino). Es responsabilidad del usuario revisar los términos completos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cursedhelm/aderpy-deepdreamer-onnx
- Modelo base: https://huggingface.co/segmind/tiny-sd
- Sitio del autor (Cursed Helm): https://cursedhelm.com/
- Aplicación aderpy (metaTOOLS): https://aderpy.com/
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Especificación WebGPU: https://www.w3.org/TR/webgpu/
