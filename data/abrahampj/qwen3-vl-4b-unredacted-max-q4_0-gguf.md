# AbrahamPJ/qwen3-vl-4b-unredacted-max-q4_0-gguf

## Resumen

AbrahamPJ/qwen3-vl-4b-unredacted-max-q4_0-gguf es una cuantización Q4_0 en formato GGUF del modelo prithivMLmods/Qwen3-VL-4B-Instruct-Unredacted-MAX, un fine-tune del Qwen3-VL-4B-Instruct desarrollado por el equipo Qwen. El modelo es multimodal (visión y lenguaje), con 4.000 millones de parámetros, y esta cuantización concreta está pensada para ejecución en llama.cpp, en particular sobre el backend Hexagon NPU, donde el formato Q4_0 se ejecuta de forma nativa.

La relevancia de esta publicación no reside en una innovación arquitectónica propia, sino en el empaquetado: convierte un modelo visión-lenguaje de 4B en un artefacto ligero y desplegable en dispositivos móviles. El autor lo utiliza en la función de conversión de imagen a prompt de su proyecto Nightmare Mobile, lo que da una idea del caso de uso previsto: inferencia local en hardware limitado con entrada de imagen.

No se dispone de información sobre el proceso de entrenamiento del fine-tune intermedio (prithivMLmods), ni de datos de benchmarks, idiomas o composición del dataset. La licencia declarada es Apache-2.0, heredada de los modelos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), base Qwen3-VL-4B-Instruct; detalles no disponibles |
| Parametros totales | 4.000 millones (según nombre del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (esta publicación); el repo base ofrece F16 GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_0); requiere proyector de visión mmproj-q8_0 o mmproj-f16 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-4B-Instruct, un transformer multimodal de la familia Qwen3-VL que procesa entradas de imagen y texto. Sobre él, prithivMLmods aplicó un fine-tune publicado como Qwen3-VL-4B-Instruct-Unredacted-MAX, del que no se documentan en la información disponible ni el volumen de tokens, ni la composición del dataset, ni si hubo RLHF/DPO. Esta publicación es únicamente una cuantización Q4_0 generada con `llama-quantize` (build b12603) a partir del GGUF F16 del autor original (revisión `beb6b72`), sin cambios adicionales según la model card.

El detalle técnico destacable es la elección deliberada de Q4_0: el backend Hexagon NPU de llama.cpp ejecuta este formato de forma nativa, lo que permite aceleración por hardware en dispositivos con ese tipo de DSP. Para el componente de visión es necesario emparejar el modelo con el proyector multimodal `mmproj-q8_0` o `mmproj-f16` del repositorio del autor original.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Qwen3-VL-4B-Instruct.
- Comprensión de imágenes: el modelo acepta entrada visual a través del proyector mmproj, lo que habilita tareas de descripción, análisis y conversión de imagen a texto.
- Generación de prompts a partir de imágenes: caso de uso explícito del autor en Nightmare Mobile.
- Instrucción conversacional (variante Instruct del modelo base).
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Conversión de imagen a prompt en aplicaciones móviles: es el uso declarado por el autor; el modelo recibe una imagen y genera una descripción textual utilizable como prompt, ejecutándose en local sobre la NPU Hexagon mediante llama.cpp.
- Asistentes de accesibilidad en dispositivo: descripción de imágenes para personas con discapacidad visual sin enviar datos a la nube, aprovechando el tamaño de 4B y la cuantización Q4_0.
- Etiquetado y moderación de imágenes en local: clasificación y descripción de contenido visual en entornos con requisitos de privacidad, al no requerir conexión externa.
- Prototipado rápido de aplicaciones visión-lenguaje: integración en llama.cpp con el proyector mmproj para validar flujos multimodales antes de escalar a modelos mayores.
- Extracción de información de capturas y documentos: lectura de texto en imágenes (capturas de pantalla, fotos de documentos) y conversión a texto estructurado, sujeto a verificación por el riesgo de alucinación en OCR.
- Inferencia en hardware de gama baja o embebido: despliegue en dispositivos con memoria limitada gracias a los aproximadamente 2,3 GB que ocupa una cuantización Q4_0 de 4B, con el backend Hexagon como vía de aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: en torno a 2,3-2,8 GB para los pesos Q4_0 de 4B, más el proyector de visión mmproj (q8_0 o f16, varios cientos de MB adicionales) y el contexto.
- GPU de datacenter: A100 o H100 son válidas pero sobredimensionadas para un modelo de 4B; cualquier GPU con 8 GB o más lo ejecuta con holgura.
- GPU de consumo: cabe en RTX 3060 8 GB, RTX 4060, RTX 4070 y superiores; también en GPUs integradas con suficiente memoria compartida.
- Móvil y embebido: es el objetivo principal de esta cuantización, con soporte nativo de Q4_0 en el backend Hexagon NPU de llama.cpp.
- Opciones de despliegue: llama.cpp (incluido `llama-quantize` y el servidor `llama-server`), y cualquier frontend compatible con GGUF y mmproj. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AbrahamPJ/qwen3-vl-4b-unredacted-max-q4_0-gguf | 4B | no disponible | GGUF Q4_0 | Apache-2.0 | Cuantización para llama.cpp y NPU Hexagon |
| prithivMLmods/Qwen3-VL-4B-Instruct-Unredacted-MAX | 4B | no disponible | safetensors / GGUF F16 | Apache-2.0 | Modelo base del fine-tune; mayor precisión, mayor peso |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible | safetensors | Apache-2.0 | Modelo original del equipo Qwen, sin fine-tune |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización Q4_0 introduce pérdida de precisión respecto al F16; en tareas de visión fina (OCR, detalles pequeños) la degradación puede ser apreciable.
- El fine-tune intermedio se presenta como "Unredacted", lo que sugiere la eliminación de filtros de seguridad del modelo original; esto incrementa el riesgo de generar contenido dañino y traslada al desplegador la responsabilidad de moderación.
- Riesgo de alucinación inherente a modelos de 4B, especialmente en descripciones de imágenes con texto o detalles ambiguos.
- No hay información publicada sobre idiomas soportados; el rendimiento en castellano no está verificado.
- Longitud de contexto no documentada; no debe asumirse la del Qwen3-VL original sin comprobación.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset del fine-tune impide descartar obligaciones adicionales derivadas de los datos de entrenamiento.
- Requiere emparejar el proyector mmproj correcto; un proyector incompatible impedirá el procesamiento de imágenes.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de calidad.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/AbrahamPJ/qwen3-vl-4b-unredacted-max-q4_0-gguf
- Modelo base del fine-tune: https://huggingface.co/prithivMLmods/Qwen3-VL-4B-Instruct-Unredacted-MAX
- GGUF F16 de origen: https://huggingface.co/prithivMLmods/Qwen3-VL-4B-Instruct-Unredacted-MAX-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Repositorio Nightmare Mobile: https://github.com/AbrahamPaulJ/nightmare-mobile
