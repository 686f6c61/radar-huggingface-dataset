# nexside/nastia-video

## Resumen

Nastia-video es un modelo publicado en Hugging Face por el usuario nexside bajo el identificador `nexside/nastia-video`. El repositorio contiene pesos en formato GGUF y, según los metadatos de safetensors, el modelo tiene 14.288.901.184 parámetros (aproximadamente 14,3 mil millones). El tamaño del repositorio es de 188 GB, lo que sugiere la presencia de múltiples cuantizaciones o de pesos en varios formatos. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face para poder descargarlo.

La información pública disponible es muy limitada. No se especifican la arquitectura, la licencia, los idiomas soportados ni el pipeline. El nombre del repositorio sugiere una orientación hacia generación de vídeo o contenido multimedia, y las búsquedas web asocian el nombre "Nastia" con una aplicación de generación de imágenes y vídeo y con chatbots sin filtros de seguridad, pero no existe confirmación de que este repositorio concreto corresponda a esos productos ni de que el modelo tenga capacidades multimodales reales.

Por tanto, esta ficha recoge únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no puede confirmarse. Cualquier evaluación de rendimiento, calidad o idoneidad para producción requiere inspeccionar los archivos del repositorio tras obtener acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 14.288.901.184 (aprox. 14,3 B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene archivos GGUF; se desconoce que niveles) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (etiqueta del repo); tamano del repo de 188 GB |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en los datos disponibles. El recuento de parámetros de safetensors (14.288.901.184) indica un modelo denso de aproximadamente 14,3 mil millones de parámetros, pero no se confirma si se trata de un transformer estándar, de una arquitectura híbrida o de un modelo multimodal con torre de visión o de vídeo. La presencia de la etiqueta `gguf` y un repositorio de 188 GB apunta a que se distribuyen pesos cuantizados para inferencia local, posiblemente junto con los pesos originales en precisión completa o media.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, filtrado), sobre si se aplicaron técnicas de alineación como RLHF, DPO o RLHF constitucional, ni sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, mezcla de expertos). Toda esta sección queda pendiente de verificación una vez se obtenga acceso al repositorio y a su model card.

## Capacidades

- Generación de texto: no confirmada explícitamente; el pipeline no está declarado.
- Generación de vídeo o imagen: el nombre del repositorio sugiere capacidades de generación multimedia, pero no hay documentación que lo confirme.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

Dado que no se han publicado especificaciones funcionales, los casos de uso solo pueden plantearse de forma condicional e hipotética:

- Evaluación interna de modelos de generación multimedia: si el modelo incorpora una torre de vídeo, podría emplearse en pruebas controladas de generación de clips cortos, comparándolo con alternativas como modelos de difusión de vídeo; requiere verificar primero su naturaleza real.
- Experimentación con cuantizaciones GGUF: el repositorio incluye pesos GGUF, por lo que puede servir para medir el impacto de la cuantización en la calidad de salida en hardware de consumo, siempre que se confirme la arquitectura.
- Prototipado de asistentes creativos: si el modelo es de texto con orientación creativa, podría integrarse en herramientas de escritura o guionización; no hay evidencia que lo respalde.
- Investigación sobre modelos con acceso restringido: útil como caso de estudio de distribución gated y de gestión de licencias en Hugging Face.
- Pruebas de seguridad y alineación: si el modelo carece de filtros, podría analizarse su comportamiento ante prompts adversarios en un entorno aislado.
- Despliegue local con llama.cpp u Ollama: viable solo si los GGUF son compatibles con estas herramientas, algo que debe comprobarse tras la descarga.

En ningún caso se recomienda su uso en producción sin una evaluación previa, dada la ausencia de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Para un modelo denso de 14,3 B, una estimación orientativa en FP16 sería de unos 28-29 GB, y en cuantización de 4 bits de unos 8-9 GB, pero se desconoce si el modelo es multimodal y cuánto añadirían los componentes de vídeo.
- GPU recomendadas: no disponibles. Para FP16 haría falta una A100 40 GB, H100 o similar; para 4 bits podría caber en una RTX 4090 (24 GB) o incluso en GPUs de 12-16 GB, sin confirmación.
- GPU de consumo: posible en RTX 4090, RTX 3090 o RTX 4080 si la cuantización es de 4 bits y el modelo es solo de texto; no verificable.
- Opciones de despliegue: llama.cpp y Ollama son plausibles por el formato GGUF; vLLM y TGI requerirían pesos safetensors y una arquitectura soportada, lo cual no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la tarea exacta (texto, vídeo o multimodal) y no hay benchmarks publicados.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre arquitectura, entrenamiento, licencia ni uso previsto.
- Licencia no especificada: no puede determinarse si el uso comercial está permitido; el acceso restringido añade condiciones que deben aceptarse en Hugging Face.
- Riesgo de alucinación y sesgos: desconocido, al no haber documentación sobre alineación ni evaluación.
- Idiomas: no se declaran; no puede garantizarse un rendimiento adecuado en castellano.
- Contexto: se desconoce la ventana máxima, lo que impide planificar aplicaciones con documentos largos.
- Posible contenido sin filtros: las búsquedas web asocian "Nastia" con chatbots sin restricciones; si el modelo carece de salvaguardas, su uso en producción conlleva riesgos legales y reputacionales.
- Repositorio de 188 GB: la descarga requiere espacio en disco considerable y ancho de banda elevado.
- Fecha de creación futura (2026-10-30): metadato anómalo que conviene verificar antes de confiar en el repositorio.
- Sin pipeline declarado: las herramientas automáticas de Hugging Face no podrán cargarlo directamente sin configuración manual.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nexside/nastia-video
- Documentación de la aplicación Nastia (posible relación no confirmada): https://www.nastia.ai/help/image-and-video-generator
- Artículo sobre chatbots sin restricciones que menciona Nastia.ai (contexto, no fuente oficial): https://insights.terabox.com/hub/how-to-find-and-use-top-rated-no-limit-ai-chatbots-without-restrictions
