# carlesonielfa/isOCR1-0.8B-GGUF

## Resumen

isOCR1-0.8B es un modelo multimodal de tipo vision-lenguaje obtenido por ajuste fino (fine-tuning) supervisado a partir de Qwen/Qwen3.5-0.8B, desarrollado por Carles Onielfa Pérez bajo el paraguas del producto isoboard. Su propósito es muy concreto: convertir capturas de pantalla en HTML listo para portapapeles, con coordenadas de recorte de imagen expresadas en decimales dentro del rango 0–1. No es un modelo de propósito general, sino un componente especializado que isoboard ofrece como opción local durante la configuración de la aplicación.

El modelo cuenta con 752.393.024 parámetros totales (aproximadamente 0,75 mil millones) y se distribuye en formato GGUF, concretamente en cuantización Q8_0, acompañado de un proyector visual (mmproj) también en Q8_0. Esta pareja de artefactos está pensada para su uso con llama.cpp y derivados, lo que permite ejecución local en hardware de consumo sin depender de servicios en la nube.

La relevancia de este lanzamiento es acotada pero clara: demuestra el patrón de especialización de modelos pequeños para tareas de extracción estructurada a partir de imágenes, con un formato de salida estrictamente definido (HTML) y una licencia restrictiva que separa el uso interno y personal libre de la redistribución, que requiere acuerdo aparte. Es la primera versión estable de la familia isOCR según su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen3.5-0.8B más proyector visual mmproj); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (modelo y proyector visual) |
| Idiomas soportados | No disponibles |
| Licencia | PolyForm Internal Use 1.0.0 con permiso adicional de uso personal y de salida (isocr-internal-use-with-personal-permission); material upstream Qwen bajo Apache 2.0 |
| Formato de pesos | GGUF (isOCR1-0.8B-Q8_0.gguf y mmproj-isOCR1-0.8B-Q8_0.gguf) |

## Arquitectura y entrenamiento

La información disponible indica que isOCR1-0.8B deriva de Qwen/Qwen3.5-0.8B mediante fine-tuning específico para OCR de portapapeles enriquecido dentro de isoboard. El despliegue requiere dos artefactos: el modelo de lenguaje en GGUF y un proyector visual independiente (mmproj) que aporta la capacidad de procesar imágenes. Ambos se publican en Q8_0. No se han detallado en la información proporcionada ni la arquitectura interna exacta del transformer, ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

El prompt de operación está fijado por el autor: `Convert this screenshot into clipboard-ready HTML.` y se debe desactivar el modo de razonamiento (thinking). Las coordenadas de recorte de imagen se expresan como decimales en el rango 0–1, lo que constituye una convención de salida propia del modelo y un requisito para interpretar correctamente sus respuestas. El repositorio incluye un archivo `SHA256SUMS` para verificar la identidad de los artefactos.

## Capacidades

- Generación de HTML a partir de capturas de pantalla, orientado a contenido listo para portapapeles.
- Extracción de estructura visual con coordenadas de recorte normalizadas (decimales entre 0 y 1).
- Procesamiento de imagen mediante proyector visual separado (mmproj).
- Modo conversacional según los tags del repositorio (conversational).
- Compatibilidad con endpoints según los tags del repositorio (endpoints_compatible).
- Modo de razonamiento (thinking) presente en el modelo base, pero que el autor recomienda desactivar para esta tarea.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de capturas de pantalla en HTML: el modelo recibe una imagen y devuelve marcado HTML con regiones de recorte en coordenadas normalizadas, adecuado para reconstruir el contenido de una captura en un editor o portapapeles enriquecido.
- Integración en la aplicación isoboard: es el modelo local que la aplicación ofrece durante la configuración, por lo que su caso de uso principal es el OCR de portapapeles dentro de ese producto.
- Extracción de contenido de documentación técnica capturada: convertir capturas de manuales, tablas o bloques de código en HTML estructurado para pegarlo en wikis o tickets.
- Preprocesado de capturas para pipelines de datos: generar HTML con coordenadas de recorte permite segmentar imágenes y asociar cada región a su contenido textual antes de un procesamiento posterior.
- Automatización de tareas de oficina: transformar capturas de correos, hojas de cálculo o formularios en HTML que pueda pegarse en herramientas de gestión documental.
- Prototipado de asistentes de accesibilidad: convertir capturas en HTML semántico para su lectura por lectores de pantalla o su reutilización en interfaces alternativas.
- Evaluación local sin nube: al ejecutarse en GGUF Q8_0 con un modelo de 0,75 mil millones de parámetros, permite probar flujos de OCR en local antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 752.393.024 parámetros en Q8_0, los pesos del modelo ocupan del orden de 0,75 GB; hay que sumar el proyector visual mmproj en Q8_0 y el espacio de contexto y de trabajo de llama.cpp.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM libre para pesos más contexto.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial de requisitos mínimos.
- Opciones de despliegue: llama.cpp y entornos compatibles con GGUF y mmproj; el repositorio incluye el tag `endpoints_compatible`. No se detallan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| isOCR1-0.8B | 752.393.024 | No disponible | GGUF Q8_0 + mmproj | PolyForm Internal Use 1.0.0 con permiso personal | OCR de capturas a HTML |
| Qwen/Qwen3.5-0.8B (base) | No disponible | No disponible | No disponible | Apache 2.0 | Modelo base multimodal de propósito general |
| Otros modelos OCR especializados | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de datos de rendimiento ni de especificaciones de alternativas especializadas en OCR para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo altamente especializado: está ajustado para OCR de capturas a HTML con coordenadas normalizadas; no debe esperarse un comportamiento de propósito general fiable.
- Requiere seguir el prompt exacto recomendado y desactivar el modo thinking; desviarse de esa configuración puede degradar la calidad de salida.
- El autor recomienda verificar la salida sobre capturas propias antes de confiar en el modelo, lo que indica que la calidad no está garantizada para todos los tipos de imagen.
- Riesgo de alucinación en la reconstrucción de HTML: el modelo puede generar estructura o texto no presente en la imagen.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento multilingüe.
- Longitud de contexto: no disponible, lo que impide evaluar su comportamiento con capturas muy grandes o conversaciones largas.
- Licencia restrictiva: el uso personal e interno es gratuito, pero la redistribución de los archivos del modelo, su empaquetado en productos entregados a terceros o un servicio de inferencia orientado a clientes requieren un acuerdo separado con legal@isoboard.app.
- La licencia de la aplicación isoboard es independiente: comprar la app no incluye derechos de redistribución del modelo.
- El material upstream de Qwen conserva sus términos Apache 2.0; conviene revisar `NOTICE.txt` para la atribución y las modificaciones.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/carlesonielfa/isOCR1-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia completa: LICENSE.md (referenciado en el repositorio)
- Permiso adicional: ADDITIONAL-PERMISSION.md (referenciado en el repositorio)
- Términos Apache 2.0 del material Qwen: APACHE-2.0-QWEN.txt (referenciado en el repositorio)
- Atribución y modificaciones: NOTICE.txt (referenciado en el repositorio)
- Identidades de artefactos: SHA256SUMS (referenciado en el repositorio)
- Contacto para licencias: legal@isoboard.app
