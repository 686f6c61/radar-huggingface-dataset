# carlesonielfa/isOCR-0.8B-alpha4-GGUF

## Resumen

isOCR-0.8B-alpha4 es un modelo multimodal (texto e imagen) obtenido por fine-tuning de Qwen3.5-0.8B, desarrollado por Carles Onielfa Pérez y publicado en Hugging Face. Su propósito específico es la conversión de capturas de pantalla en HTML listo para pegar en el portapapeles, una tarea de OCR enriquecido orientada a la aplicación isoboard. No es un modelo de propósito general: es un artefacto verticalizado para un flujo de trabajo concreto.

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer denso de aproximadamente 752 millones de parámetros según los pesos en safetensors del repositorio. El modelo se distribuye en formato GGUF con cuantización Q8_0, junto con un proyector visual (mmproj) separado, lo que permite su ejecución en llama.cpp y entornos compatibles con endpoints de tipo OpenAI.

La relevancia de esta ficha es acotada: el propio autor indica que los resultados de evaluación no demuestran una mejora consistente frente a versiones alfa anteriores, y la licencia restringe la redistribución. Es útil como referencia para quienes evalúan modelos pequeños de OCR estructurado, pero no como componente de producción sin revisar primero las condiciones legales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5-0.8B) con proyector visual separado |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (única publicada en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | PolyForm Internal Use 1.0.0 con permiso adicional de uso personal y de salidas (`isocr-internal-use-with-personal-permission`) |
| Formato de pesos | GGUF (modelo y `mmproj` separados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de 0,75 mil millones de parámetros, y se ha ajustado mediante fine-tuning supervisado para una tarea concreta: transformar una imagen de captura de pantalla en HTML apto para portapapeles. La componentemultimodal se implementa mediante un proyector visual independiente (`mmproj-isOCR-0.8B-alpha4-Q8_0.gguf`), que debe cargarse junto con el modelo principal. Las coordenadas de recorte de imagen se expresan como decimales en el rango 0–1.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El autor indica explícitamente que se debe desactivar el modo de razonamiento (thinking) durante la inferencia y que el prompt recomendado es `Convert this screenshot into clipboard-ready HTML.`. Los resultados de benchmark publicados no muestran una mejora consistente frente a versiones alfa previas, lo que sugiere un ajuste incremental y no un salto cualitativo.

## Capacidades

- Conversión de capturas de pantalla a HTML estructurado listo para portapapeles.
- Procesamiento de imagen con recorte basado en coordenadas normalizadas (0–1).
- Generación de texto conversacional, heredada del modelo base Qwen3.5-0.8B.
- Soporte de modo thinking en el modelo base, aunque el autor recomienda desactivarlo para esta tarea.
- Compatibilidad con endpoints de tipo OpenAI (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Digitalización de capturas de pantalla en flujos de trabajo internos: el modelo convierte una imagen de pantalla en HTML semántico, útil para equipos que documentan interfaces o reproducen maquetas sin reescribir el marcado a mano.
- Integración en la aplicación isoboard: es su caso de uso nativo, ya que el modelo se publicó para evaluación dentro de esa app, con el prompt y el formato de salida ya definidos.
- Extracción de estructuras de tablas y formularios desde imágenes: al devolver HTML, el resultado puede postprocesarse con parsers DOM para obtener datos tabulares de capturas de paneles de administración.
- Prototipado de pipelines de OCR en local: al ser un GGUF Q8_0 de menos de 1 GB, permite iterar en un portátil sin GPU dedicada antes de escalar a un modelo mayor.
- Evaluación comparativa de modelos pequeños de OCR: sirve como línea base para medir la calidad de conversión imagen-a-HTML frente a alternativas de mayor tamaño.
- Automatización de documentación técnica: capturar una pantalla de configuración y generar un fragmento HTML para un manual, con revisión humana posterior dado el riesgo de alucinación en el marcado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor señala que los resultados de evaluación no establecen una mejora consistente sobre versiones alfa anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB para el modelo Q8_0 más el proyector visual Q8_0; el repositorio completo ocupa 0,9 GB.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer con 4 GB o más es suficiente.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de tipo OpenAI. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| isOCR-0.8B-alpha4 | 752 M | No disponible | PolyForm Internal Use 1.0.0 + permiso adicional | GGUF Q8_0 | Especializado en OCR a HTML; redistribución restringida |
| Qwen3.5-0.8B (base) | 0,8 B | No disponible | Apache 2.0 | Safetensors, GGUF | Modelo generalista del que deriva; permite uso comercial amplio |
| Alternativas de OCR de propósito general | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El autor reconoce que los benchmarks no demuestran una mejora consistente frente a alfas anteriores; tratarlo como experimental.
- Riesgo de alucinación en el HTML generado: puede inventar etiquetas, atributos o contenido no presente en la imagen.
- La licencia PolyForm Internal Use 1.0.0 permite uso personal e interno, pero la redistribución de los archivos del modelo, incluido su empaquetado en productos, requiere un acuerdo separado con legal@isoboard.app.
- El uso comercial de las salidas OCR está permitido, sujeto a los derechos sobre el contenido de entrada.
- El material upstream de Qwen conserva su licencia Apache 2.0; consultar `NOTICE.txt` para atribución y modificaciones.
- Longitud de contexto e idiomas soportados no documentados; no apto para producción multilingüe sin validación previa.
- Requiere cargar el proyector visual `mmproj` correspondiente; usar un mmproj distinto puede degradar o romper la inferencia.
- El modo thinking debe desactivarse según las instrucciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/carlesonielfa/isOCR-0.8B-alpha4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia completa: `LICENSE.md` en el repositorio
- Permiso adicional: `ADDITIONAL-PERMISSION.md` en el repositorio
- Atribución y modificaciones: `NOTICE.txt` en el repositorio
- Términos Apache 2.0 del upstream: `APACHE-2.0-QWEN.txt` en el repositorio
- Identidades de artefactos: `SHA256SUMS` en el repositorio
