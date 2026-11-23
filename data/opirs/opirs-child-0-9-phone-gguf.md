# opirs/OPIRS-Child-0.9-Phone-GGUF

## Resumen

OPIRS Child 0.9 Phone es una distribución en formato GGUF del modelo Qwen3.5-2B, publicada por el colectivo OPIRS (operado por SILPION LIMITED) bajo licencia Apache 2.0. No se trata de un modelo entrenado por OPIRS: el autor declara explícitamente que los pesos son los de Qwen3.5-2B, publicado por el equipo Qwen de Alibaba Cloud, sin modificaciones. La etiqueta "0.9" designa un modelo abierto seleccionado y medido por OPIRS, mientras que la versión 1.0 será el primer modelo entrenado por su sistema de investigación "Mother".

El paquete incluye dos artefactos: el modelo de lenguaje cuantizado en Q8_0 (`OPIRS-Child-0.9-Phone-Q8_0.gguf`) y un proyector de imagen (`mmproj-OPIRS-Child-0.9-Phone.gguf`) que habilita la lectura de imágenes. El conjunto completo ocupa 2,7 GB y suma 1.881.825.088 parámetros. La relevancia de esta ficha radica en que documenta una distribución reproducible y verificable por huella SHA-256, orientada a dispositivos móviles y equipos de gama baja.

El modelo se presenta como una opción de inferencia local para telefonía y pequeños ordenadores, con compatibilidad con Ollama y con la etiqueta `endpoints_compatible`. No obstante, la información publicada es mínima: no se detallan idiomas soportados, datos de entrenamiento, benchmarks ni contexto máximo en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-2B; detalles no disponibles) |
| Parametros totales | 1.881.825.088 (aprox. 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (única disponible en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje + proyector multimodal `mmproj`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen3.5-2B, un transformer de aproximadamente 2.000 millones de parámetros. OPIRS no aporta detalles sobre la arquitectura interna, el número de capas, la atención o las innovaciones técnicas del modelo base, y declara que no ha modificado los pesos. El paquete añade un proyector de imagen independiente que actúa como adaptador visual, lo que sugiere una arquitectura multimodal del tipo "vision encoder + projector + LLM", aunque la model card no especifica el codificador visual ni su resolución de entrada.

Respecto al entrenamiento, la información disponible es nula: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. OPIRS menciona que su sistema "Mother" evalúa modelos abiertos sobre problemas nuevos marcados por código y que una red de voluntarios confirma los resultados en un segundo equipo, con registro público en opirs.org, pero no se publican los resultados de esas evaluaciones en la ficha.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y el pipeline `text-generation`.
- Procesamiento de imágenes mediante el proyector `mmproj`, que permite entrada visual cuando se cargan ambos archivos.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Ejecución local en dispositivos móviles y equipos pequeños, objetivo declarado del paquete.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en aplicaciones móviles: el modelo, con unos 2B de parámetros en Q8_0 (2,7 GB con el proyector), puede ejecutarse en un teléfono de gama alta o en un pequeño ordenador para mantener conversaciones multi-turno sin conexión a la nube.
- Descripción de imágenes en el dispositivo: cargando el modelo de lenguaje junto con `mmproj`, la aplicación puede generar descripciones o responder preguntas sobre fotos tomadas con la cámara del teléfono, útil en apps de accesibilidad.
- Procesamiento de documentos escaneados en local: la combinación texto + visión permite extraer información de recibos, etiquetas o formularios sin enviar datos sensibles a servidores externos.
- Prototipado rápido con Ollama: el comando `ollama run hf.co/opirs/OPIRS-Child-0.9-Phone-GGUF:Q8_0` permite a desarrolladores desplegar el modelo en minutos para pruebas de concepto.
- Integración en pipelines de CI/CD para verificación de modelos: los hashes SHA-256 publicados permiten validar la integridad de los pesos descargados antes de usarlos en producción.
- Educación e investigación reproducible: al ser una distribución sin modificaciones de un modelo Apache 2.0 con huellas verificables, sirve como referencia para estudiar el comportamiento de modelos pequeños en entornos con recursos limitados.
- Asistencia offline en entornos sin conectividad: aplicaciones de campo (logística, sanidad rural) donde se requiere generación de texto e interpretación de imágenes sin acceso a red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el sistema Mother evalúa modelos sobre problemas marcados por código con confirmación por una red de voluntarios, pero no incluye cifras concretas ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB para el conjunto completo (modelo Q8_0 + proyector). Solo texto requiere únicamente el archivo del modelo de lenguaje, algo menos de 2,7 GB.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 4 GB de VRAM podría alojar el modelo en Q8_0.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más (por ejemplo, GTX 1650, RTX 3050 en adelante), aunque no se confirma oficialmente.
- Despliegue: Ollama (soporte explícito documentado), llama.cpp (formato GGUF) y cualquier runtime compatible con GGUF; también se indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OPIRS Child 0.9 Phone (Qwen3.5-2B, Q8_0) | ~2B | No disponible | Apache 2.0 | GGUF en Hugging Face, Ollama |
| Qwen3.5-2B (original) | ~2B | No disponible | Apache 2.0 | Pesos originales de Qwen |
| Alternativas de ~2B en GGUF | No disponible | No disponible | Variable | Variable |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con otros modelos de la misma categoría. La comparación más directa es con el propio Qwen3.5-2B original, del que esta distribución es una copia sin modificaciones en cuantización Q8_0.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser una copia de Qwen3.5-2B, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en modelos de ~2B, pero no hay datos publicados.
- Limitaciones de contexto e idioma: no disponibles; el autor no especifica la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero OPIRS declara no estar afiliado a Alibaba Cloud y no ofrece garantías sobre el modelo.
- La versión 0.9 no es un modelo entrenado por OPIRS; cualquier expectativa de comportamiento diferencial respecto a Qwen3.5-2B carece de base en la información publicada.
- Solo se ofrece cuantización Q8_0, lo que limita el despliegue en dispositivos con menos de ~3 GB de memoria disponible; no hay versiones Q4 o Q5 en el repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación indicada (2026-11-23) es futura respecto a la información habitual de publicación, lo que conviene verificar antes de confiar en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/opirs/OPIRS-Child-0.9-Phone-GGUF
- Sitio de OPIRS: https://opirs.org
- Ollama: https://ollama.com
- Modelo base Qwen3.5-2B: no disponible en la información proporcionada (el autor cita a Qwen y Alibaba Cloud, pero no enlaza el repositorio original).
