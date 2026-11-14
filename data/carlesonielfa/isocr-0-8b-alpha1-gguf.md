# carlesonielfa/isOCR-0.8B-alpha1-GGUF

## Resumen

isOCR 0.8B alpha1 es un modelo de lenguaje afinado (fine-tuned) a partir de Qwen/Qwen3.5-0.8B, desarrollado por Carles Onielfa Pérez para realizar OCR (reconocimiento óptico de caracteres) enriquecido sobre el portapapeles dentro de la aplicación isoboard. El modelo se distribuye en formato GGUF y está pensado para integrarse en un flujo de escritorio que captura contenido del portapapeles y lo procesa localmente. Se trata de una versión alpha (alpha1), publicada en octubre de 2026 y actualizada en noviembre del mismo año.

El modelo cuenta con 752.393.024 parámetros reales (aproximadamente 0,75 mil millones) según los pesos en safetensors del modelo base, lo que lo sitúa en la gama ultraligera. Su propósito es especializado: no es un modelo de propósito general, sino un componente de un producto concreto (isoboard) que combina un modelo de lenguaje con un proyector de visión ("vision projector") para interpretar imágenes y texto de capturas. La model card indica que el proyector de visión se ofrece bajo la misma licencia que el modelo de lenguaje.

La relevancia de esta ficha es doble: por un lado, documenta un caso de modelo vertical muy pequeño orientado a una tarea concreta (OCR de portapapeles); por otro, su licencia es inusualmente restrictiva (PolyForm Internal Use 1.0.0 con permisos adicionales de uso personal), lo que condiciona fuertemente su adopción fuera de isoboard. No se han publicado datos de benchmarks, idiomas soportados ni detalles de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-0.8B; se desconoce si es transformer denso, MoE u otra) |
| Parametros totales | 752.393.024 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo distribuye pesos en formato GGUF; no se detallan los niveles de cuantizacion concretos) |
| Idiomas soportados | no disponible |
| Licencia | isocr-internal-use-with-personal-permission (PolyForm Internal Use 1.0.0 con permiso adicional de uso personal y de salidas) |
| Formato de pesos | GGUF (repo de 0,9 GB); el modelo base dispone de safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la información proporcionada. El modelo deriva de Qwen/Qwen3.5-0.8B, por lo que hereda la arquitectura del modelo base de Qwen, pero la model card no especifica si se trata de un transformer denso, un modelo MoE, híbrido o con mecanismos de atención lineal. Tampoco se detalla la longitud de contexto nativa ni el tokenizador empleado.

En cuanto al entrenamiento, la model card indica únicamente que el modelo ha sido afinado específicamente para "rich clipboard OCR in isoboard", es decir, OCR enriquecido sobre el portapapeles. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o modos de razonamiento. La existencia de un "vision projector" emparejado sugiere una arquitectura multimodal (texto + visión) para procesar capturas, pero no se aportan detalles sobre cómo se combina con el modelo de lenguaje.

## Capacidades

- OCR enriquecido sobre contenido de portapapeles: la función principal declarada es interpretar y extraer texto de capturas o contenido copiado, integrado en la aplicación isoboard.
- Procesamiento multimodal: la model card menciona un "vision projector" emparejado, lo que implica capacidad de recibir entrada visual además de texto.
- Generación de texto conversacional: el tag `conversational` del repositorio sugiere uso en diálogo, aunque no se detallan capacidades de razonamiento, código o matemáticas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia compatible con la API de Hugging Face.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas soportados.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- OCR de portapapeles en escritorio: el caso de uso central es la integración en isoboard, donde el modelo procesa el contenido copiado (incluidas capturas) y devuelve texto enriquecido. Es adecuado por su tamaño reducido (0,75 B de parámetros) y su formato GGUF, que permite ejecución local en equipos de escritorio.
- Extracción de texto de capturas de pantalla en flujos personales: un usuario puede copiar una imagen y obtener su texto transcrito sin enviar datos a la nube, gracias a la inferencia local con GGUF.
- Digitalización de notas y documentos escaneados en pequeña escala: el modelo puede transcribir texto de imágenes en un pipeline personal de gestión documental, siempre que el uso encaje en el permiso personal de la licencia.
- Prototipado de asistentes de accesibilidad: integración en herramientas que leen en voz alta o reformatean contenido visual copiado, aprovechando la capacidad multimodal del proyector de visión.
- Automatización interna de oficina: uso interno empresarial permitido por la licencia PolyForm Internal Use para procesar documentos y capturas dentro de una organización, sin redistribuir el modelo.
- Pruebas de concepto de OCR local en entornos con requisitos de privacidad: al ejecutarse en local con GGUF, evita el envío de contenido sensible a servicios externos, lo que resulta útil en sectores regulados.
- Evaluación de modelos verticales pequeños: investigadores pueden estudiar el comportamiento de un modelo de 0,75 B especializado en OCR frente a modelos generalistas, aunque la licencia limita la redistribución de resultados y artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (0,75 B de parámetros), en cuantización de 4 bits el modelo ocuparía del orden de 0,4-0,5 GB de pesos; en 8 bits, alrededor de 0,8 GB; en FP16, unos 1,5 GB. Estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por su tamaño, cualquier GPU consumer moderna con al menos 4 GB de VRAM debería poder alojarlo en cuantizaciones bajas, pero no hay confirmación oficial.
- ¿Cabe en GPU consumer? Sí, previsiblemente en la mayoría de GPU consumer con 4-8 GB de VRAM en cuantizaciones GGUF, aunque no se aportan requisitos oficiales.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; también podría servirse con vLLM si se dispone de pesos compatibles, aunque no se documenta. El tag `endpoints_compatible` sugiere despliegue vía endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| isOCR 0.8B alpha1 | 752.393.024 | no disponible | isocr-internal-use-with-personal-permission | GGUF | Especializado en OCR de portapapeles; alpha; sin benchmarks |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache 2.0 (según la model card, el material upstream conserva Apache 2.0) | safetensors | Modelo generalista del que deriva; licencia permisiva |
| Alternativas de OCR especializado de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la búsqueda |

La comparación más directa es con su modelo base Qwen3.5-0.8B: isOCR añade especialización en OCR y un proyector de visión, pero restringe severamente la licencia (de Apache 2.0 a PolyForm Internal Use con permisos adicionales). No se dispone de datos de rendimiento para comparar calidad.

## Limitaciones y advertencias

- Licencia restrictiva: la redistribución de archivos del modelo, originales o modificados, incluida su inclusión en productos entregados a terceros, requiere un acuerdo separado con legal@isoboard.app. El uso comercial como servicio de inferencia orientado a clientes también requiere contacto previo.
- Uso personal e interno gratuito: el uso personal y el uso interno empresarial están permitidos, incluidas modificaciones para esos fines, sin periodo de prueba ni necesidad de comprar la app isoboard.
- Salidas: los resultados ordinarios de OCR pueden usarse en trabajo remunerado, sujeto a los derechos sobre el contenido de entrada.
- Estado alpha: la versión alpha1 puede presentar inestabilidad, errores de transcripción o comportamiento no documentado; no se recomienda para producción sin validación.
- Idiomas: no se especifican idiomas soportados, lo que impide garantizar calidad en castellano u otros idiomas.
- Alucinación: no hay datos publicados sobre tasas de alucinación; en tareas OCR, el riesgo de insertar texto inexistente es relevante y debe validarse.
- Sesgos: no disponible; no se documentan sesgos conocidos.
- Contexto: se desconoce la longitud de contexto, lo que limita la planificación de cargas de documentos largos.
- Ausencia de benchmarks: no hay métricas públicas de precisión OCR, latencia o throughput, lo que dificulta la evaluación objetiva.
- Atribución: el material upstream de Qwen conserva Apache 2.0; deben respetarse NOTICE y los términos de atribución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/carlesonielfa/isOCR-0.8B-alpha1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia completa (referenciada en la model card): LICENSE.md dentro del repositorio
- Permiso adicional (referenciado): ADDITIONAL-PERMISSION.md dentro del repositorio
- Términos Apache 2.0 del material upstream (referenciado): APACHE-2.0-QWEN.txt dentro del repositorio
- Atribución y modificaciones (referenciado): NOTICE.txt dentro del repositorio
- Contacto para licencias: legal@isoboard.app
