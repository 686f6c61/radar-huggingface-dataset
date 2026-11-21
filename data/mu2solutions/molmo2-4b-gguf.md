# mu2solutions/Molmo2-4B-GGUF

## Resumen

Molmo2-4B-GGUF es la conversión al formato GGUF del modelo multimodal Molmo2-4B desarrollado por el Allen Institute for AI (AI2). Se trata de un modelo de imagen-a-texto que combina un codificador visual SigLIP con un proyector de cross-attention con pooling sobre un backbone de texto Qwen3-4B, lo que le permite procesar imágenes y generar descripciones o responder preguntas sobre ellas. La conversión la publica Mu2 Solutions bajo licencia Apache 2.0, sin restricciones adicionales respecto al modelo original.

El modelo resuelve el problema de disponer de un modelo multimodal completamente abierto (pesos, datos y receta de entrenamiento) en un tamaño de 4.411.475.456 parámetros que cabe en hardware de consumo. Su relevancia actual radica en que permite ejecutar visión-lenguaje en local mediante llama.cpp, aunque con una advertencia crítica: el grafo de visión de Molmo2 todavía no está integrado en el repositorio upstream `ggml-org/llama.cpp`, por lo que estos ficheros solo cargan en el fork experimental de Mu2 (build `b11936`).

La publicación incluye dos ficheros: el cuantizado de texto Q4_K_M (2,72 GB) y el proyector multimodal en F16 (881 MB). Ambos deben cargarse conjuntamente para obtener un modelo de visión funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP ViT (vision) + proyector cross-attention con pooling y SwiGLU + backbone de texto Qwen3-4B |
| Parametros totales | 4.411.475.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (texto), F16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con mmproj separado |

## Arquitectura y entrenamiento

Molmo2-4B es un modelo multimodal compuesto por tres piezas: un codificador visual SigLIP ViT, un proyector multimodal basado en cross-attention con pooling (con tensores `mm.pool.k` y `mm.pool.v` separados y una fila `mm.image_patch_add` embebida) y un proyector SwiGLU, todo ello conectado a un backbone de texto con arquitectura `qwen3`. El mmproj contiene 315 tensores en total. La conversión se realizó desde la revisión `042abfa7a388` de `allenai/Molmo2-4B` (congelada el 2026-01-23) con el conversor HF-to-GGUF de llama.cpp y el conversor de visión Molmo2 de Mu2 en el commit `c3d25ece9`. La plantilla de chat está embebida desde el repositorio fuente.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del GGUF no documenta innovaciones técnicas adicionales más allá de la propia arquitectura multimodal y del soporte de visión mediante `llama-mtmd-cli`.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text): descripción de imágenes, lectura de texto en imágenes y respuesta a preguntas visuales.
- Codificación visual mediante SigLIP ViT con vistas de 378x378 píxeles.
- Generación de texto conversacional gracias al backbone Qwen3-4B y a la plantilla de chat embebida.
- Soporte de conversación multi-turno mediante `llama-mtmd-cli`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes en local: el modelo puede generar descripciones de una frase sobre fotografías o logotipos, como demuestra la verificación del autor con una imagen corporativa, usando `llama-mtmd-cli` con el cuantizado Q4_K_M y el mmproj F16.
- Lectura de texto en imágenes (OCR descriptivo): la verificación muestra que el modelo identifica correctamente letras y colores de un logotipo, lo que lo hace útil para extraer información textual de capturas o documentos escaneados.
- Asistencia a accesibilidad: generación de descripciones de imágenes para usuarios con discapacidad visual, ejecutándose en hardware modesto gracias al tamaño de 4B parámetros.
- Procesamiento por lotes de imágenes en pipelines locales: al ser GGUF y funcionar con llama.cpp, puede integrarse en scripts de procesamiento de imágenes sin dependencia de servicios en la nube.
- Prototipado e investigación en visión-lenguaje: al ser un modelo completamente abierto con licencia Apache 2.0, es adecuado para experimentación académica y para estudiar el comportamiento de modelos multimodales pequeños.
- Catalogación y etiquetado de imágenes: uso del modelo para generar metadatos descriptivos de imágenes en flujos de gestión documental o de activos digitales.
- Evaluación de cuantizaciones: el par Q4_K_M + mmproj F16 permite comparar la calidad de la cuantización frente al modelo original en tareas de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente documenta mediciones de verificación en hardware concreto: la codificación visual de una vista de 378x378 tardó 490.705 ms (unos 8 minutos) en un Intel i3-2100 sin GPU ni F16C, frente a aproximadamente 0,6 s en una Intel Arc A770. La generación de visión se completó con el comando indicado y produjo una descripción correcta de la imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: el cuantizado de texto Q4_K_M ocupa 2,72 GB y el mmproj F16 ocupa 881 MB, lo que suma aproximadamente 3,6 GB de pesos; el consumo total de memoria dependerá del contexto configurado y del backend.
- GPU recomendadas: no se especifican modelos concretos en la información; la verificación menciona una Intel Arc A770 como referencia de rendimiento (aproximadamente 0,6 s por vista de 378x378).
- Cabe en GPU de consumo: por tamaño de pesos (unos 3,6 GB) es plausible en GPUs de consumo, aunque la información no confirma explícitamente modelos concretos.
- Opciones de despliegue: `llama-mtmd-cli` del fork experimental de Mu2 de llama.cpp (build `b11936`). No funciona en builds upstream de `ggml-org/llama.cpp`, que no soportan el grafo de visión de Molmo2.
- Latencia y throughput: la codificación visual es limitada por CPU; en un i3-2100 sin F16C se midieron unos 8 minutos por vista, frente a unos 0,6 s en una Arc A770. No se dispone de datos de throughput de generación de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Molmo2-4B-GGUF (esta ficha) | 4.411.475.456 | no disponible | Si (SigLIP + proyector) | Apache 2.0 | GGUF, requiere fork de llama.cpp |
| allenai/Molmo2-4B (modelo base) | 4.411.475.456 | no disponible | Si | Apache 2.0 | Pesos originales en Hugging Face |
| Molmo2-O-7B (mencionado en la model card) | no disponible | no disponible | Si (verificado) | no disponible | GGUF en el mismo ecosistema de Mu2 |
| Molmo2-8B (mencionado en la model card) | no disponible | no disponible | Si (no resuelto en la verificación) | no disponible | GGUF en el mismo ecosistema de Mu2 |

No se dispone en la información proporcionada de datos de rendimiento comparativo (benchmarks) con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El soporte de visión de Molmo2 no está en el repositorio upstream de llama.cpp (verificado en v1.0.0, build 12359, sin coincidencias de `molmo2`); estos ficheros solo cargan en el fork experimental de Mu2, fijado en el build `b11936`. Esto implica dependencia de un fork no oficial y riesgo de rotura con actualizaciones.
- La codificación visual puede ser extremadamente lenta en CPU sin F16C: unos 8 minutos por vista de 378x378 en un i3-2100.
- Los mmproj F16 anteriores de este modelo usaban un layout fusionado `mm.pool.kv` que ya no se acepta; es necesario reemplazarlos por el fichero corregido listado en la model card.
- En la verificación se observó una advertencia al cargar sobre el token `</s>` que no es de tipo control y se sobrescribe; el autor la califica de cosmética y sin efecto en la generación.
- El estado de visión en el modelo de 8B del mismo ecosistema figura como no resuelto en la model card; no se aportan detalles adicionales.
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones idiomáticas ni evaluación de calidad en producción.
- La licencia Apache 2.0 no impone restricciones adicionales para uso comercial, pero la dependencia del fork experimental de llama.cpp es un caveat operativo relevante para producción.
- No se dispone de información sobre los idiomas soportados ni sobre la longitud de contexto oficial del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mu2solutions/Molmo2-4B-GGUF
- Modelo base: https://huggingface.co/allenai/Molmo2-4B
- Repositorio upstream de llama.cpp: https://github.com/ggml-org/llama.cpp
- Fork experimental de Mu2 (referenciado en la model card, sin URL explícita): no disponible
- Paper, blog o demo oficial de Molmo2: no disponible en la información proporcionada
