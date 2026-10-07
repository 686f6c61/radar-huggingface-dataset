# SmallAICreator/L-AI-Android

## Resumen

L-AI es una aplicación Android desarrollada por UltraLabs y publicada en Hugging Face por el usuario SmallAICreator. Permite conversar con modelos de lenguaje que se ejecutan íntegramente en el propio teléfono mediante una compilación propia de llama.cpp, sin cuenta ni servidor en la nube: las conversaciones no salen del dispositivo salvo que se active una función que requiera red, como la búsqueda web. No es un modelo de pesos, sino el cliente que los carga y los gestiona.

El repositorio SmallAICreator/L-AI-Android distribuye el binario `L-AI-1.5.apk` (65 MB) para Android 11 o superior y arquitectura arm64-v8a, dentro de un repositorio de 0,2 GB. La aplicación carga cualquier modelo en formato GGUF (Qwen, Llama, Gemma, Phi, LFM, Mistral, modelos MoE) y también modelos heredados en GGML `.bin` (LLaMA GGJT/GGMF/ggml, GPT-2 y GPT-NeoX) que otras aplicaciones ya no admiten, cada uno con su propia plantilla de chat.

Su relevancia actual está en acercar la inferencia local a móviles de gama media mediante decodificación especulativa con modelo borrador, offloading y prefetch de expertos en arquitecturas MoE, cuantización de la caché KV, atención flash y una API compatible con OpenAI servida en la red local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable: el repositorio distribuye una aplicación Android, no un modelo de pesos. La inferencia la realiza llama.cpp |
| Parametros totales | No aplicable: depende del modelo GGUF o GGML que cargue el usuario (la documentación recomienda entre 0,5B y 8B) |
| Parametros activos | No aplicable (no es un modelo MoE; sí admite cargar modelos MoE de terceros) |
| Longitud de contexto | No aplicable: la fija el modelo cargado y la memoria disponible en el dispositivo |
| Tipos de cuantizacion | Del modelo cargado: las habituales de GGUF (la documentación recomienda Q4/Q8 en móvil). De la caché KV: f16, q8_0 y q4_0 |
| Idiomas soportados | No disponible (no se especifican idiomas de interfaz ni de generación; estos últimos dependen del modelo cargado) |
| Licencia | l-ai-freeware (etiquetada como `other` en Hugging Face) |
| Formato de pesos | No aplicable al repositorio (contiene un APK). La aplicación carga GGUF y GGML `.bin` |
| Versión | 1.5 (build 6) |
| Paquete | `com.ultralabs.lai` |
| Android mínimo | Android 11 (API 30) |
| ABI | arm64-v8a (64 bits ARM) |
| Tamaño del APK | 65 MB |
| Tamaño del repositorio | 0,2 GB |
| Motor de inferencia | llama.cpp (MIT), compilación propia |
| Modelo de titulado incluido | Cyronius/titler (Apache-2.0), ~20 ms por título |
| Certificado de firma | `CN=UltraLabs, O=UltraLabs` |
| SHA-256 del APK | `4411ccf6f9ec7b0ac164fe98c36734469557f2614cfc886e5776e00f7b1bed43` |
| SHA-256 del certificado | `517602ea12fa156ab2713e6ca298fc856e95454ff2132c6a5267d6dec16af8c9` |
| Descargas / likes en Hugging Face | 0 / 0 |
| Fecha de creación / actualización | 6 de octubre de 2026 (ambas) |

## Arquitectura y entrenamiento

No existe entrenamiento ni dataset asociado: el repositorio no contiene pesos, sino el binario de una aplicación Android nativa (arquitectura arm64-v8a) que actúa como front-end y como motor de inferencia. El motor real es llama.cpp, sobre el que la aplicación implementa gestión de plantillas de chat por modelo, detección y carga automática de ficheros GGUF y de formatos heredados GGML `.bin`, y descarga automática del fichero proyector `mmproj` cuando el modelo elegido tiene capacidades de visión.

Las innovaciones técnicas que declara la documentación del autor son de tipo sistemas, no de modelado: decodificación especulativa con un modelo borrador, offloading y prefetch de expertos para modelos MoE, cuantización de la caché KV (f16, q8_0, q4_0), atención flash, carga mediante memory-mapping o en RAM, y un benchmark integrado que mide procesamiento de prompt y generación. Además, incorpora un modelo de titulado empaquetado de unos 20 ms para nombrar conversaciones y genera sugerencias de seguimiento en el dispositivo sin invocar al modelo principal. No se documentan fases de RLHF, DPO ni ajuste alguno, porque no se entrena ningún modelo en este repositorio.

## Capacidades

- Ejecución local de modelos GGUF de múltiples familias (Qwen, Llama, Gemma, Phi, LFM, Mistral y modelos MoE), cada uno con su plantilla de chat propia.
- Compatibilidad con modelos heredados GGML `.bin`: LLaMA (GGJT/GGMF/ggml), GPT-2 y GPT-NeoX (StableCode, StableLM-alpha, Pythia, Dolly, RedPajama).
- Visión: adjuntar imágenes desde galería o cámara para que un modelo con fichero `mmproj` las describa; el proyector se descarga automáticamente al bajar el modelo desde Hugging Face.
- Modo de razonamiento ("thinking") con botón de activación que solo aparece en modelos compatibles, presupuesto de pensamiento configurable y panel desplegable de "Thought process".
- Tool calling nativo: búsqueda web (DuckDuckGo / Wikipedia), calculadora con resultados exactos y creación de ficheros.
- Conocimiento local (RAG): admite ficheros TXT, PDF y EPUB y recupera los pasajes más relevantes para el contexto del modelo.
- Memoria persistente de hechos entre conversaciones, con visualización y borrado por parte del usuario.
- Personas y comandos de barra: `/summarize`, `/translate`, `/eli5`, `/fix` y comandos personalizados.
- Interfaz conversacional con Markdown, bloques de código con copiar y ejecutar (vista previa HTML/JS en vivo), gráficos, diagramas Mermaid y LaTeX.
- Regeneración con versiones, edición y reenvío, y bifurcación de una conversación desde cualquier mensaje.
- Lectura en voz alta, entrada de voz con autoenvío opcional y respuesta háptica durante la generación.
- Sugerencias de seguimiento instantáneas calculadas en el dispositivo sin coste de inferencia, y nombres automáticos de chat mediante el modelo de titulado incluido.
- Chats temporales que no se guardan ni se memorizan.
- Historial con búsqueda, carpetas, fijados, compartir, exportación (`.md` / `.txt`), copia de seguridad y restauración.
- Integraciones: servidor de API compatible con OpenAI en la red local, Share-to-L-AI, mosaico de ajustes rápidos y widget de pantalla de inicio.
- Personalización visual: Material You o colores propios, 9 preajustes, negro AMOLED, estilos de burbuja/tarjeta/minimal, fuentes, tamaño de texto y fondos de chat.

## Casos de uso

- Asistente privado sin conexión: en un teléfono de 6-8 GB de RAM con un modelo de 1B-4B en Q4 se puede redactar, resumir y responder correos o notas sin que el contenido salga del dispositivo, lo que encaja en entornos con requisitos estrictos de confidencialidad.
- Descripción y extracción de información de imágenes: con un modelo de visión y su `mmproj` se pueden fotografiar pizarras, recibos o etiquetas y pedir una descripción o un resumen; útil para trabajo de campo y para accesibilidad.
- Consulta de documentación técnica offline: la función de conocimiento local permite añadir manuales en PDF o EPUB y consultar pasajes concretos sin cobertura, algo práctico en despliegues industriales o instalaciones sin red.
- Automatización de cálculos y búsquedas con tool calling: la calculadora devuelve resultados exactos y la búsqueda web (DuckDuckGo/Wikipedia) permite resolver consultas de actualidad cuando hay conexión, sin salir de la aplicación.
- Servidor de inferencia personal en la red local: la API compatible con OpenAI permite usar el modelo del teléfono desde un PC, por ejemplo desde un script de automatización, un cliente de chat o un editor de código, reutilizando hardware que ya se tiene.
- Demostraciones de producto y pruebas de concepto: sirve para mostrar un chatbot funcional sin depender de proveedores externos ni de conectividad, útil en ferias, visitas comerciales o pilotos con clientes.
- Evaluación de modelos GGUF antes de desplegarlos: el benchmark integrado (procesamiento de prompt y generación) y la carga de cualquier GGUF convierten el móvil en un banco de pruebas rápido para comparar cuantizaciones Q4, Q8 y modelos MoE pequeños.
- Formación y estudio: los comandos `/eli5`, `/summarize` y `/translate`, junto con la lectura en voz alta, permiten repasar apuntes o documentos en movilidad con un modelo pequeño cargado localmente.
- Manejo de información sensible en chats temporales: para consultas puntuales sobre datos personales o profesionales, el modo temporal evita que la conversación se guarde en el historial o pase a la memoria persistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y no procede atribuirle ninguna, ya que no contiene pesos de modelo.

La documentación del autor sí menciona dos datos de rendimiento concretos: un benchmark integrado que mide velocidad de procesamiento de prompt y de generación (sin valores publicados) y un modelo de titulado empaquetado que tarda aproximadamente 20 ms por título generado. No se publican cifras de latencia ni de throughput por token para ningún modelo concreto.

## Requisitos de hardware

- Plataforma: Android 11 (API 30) o superior, exclusivamente en arquitectura arm64-v8a. No se distribuye binario para x86, 32 bits ni iOS.
- No aplica VRAM: la inferencia se ejecuta sobre la memoria RAM y la CPU del teléfono. La aplicación permite carga con memory-mapping (sin copiar el modelo a RAM) o carga completa en RAM.
- Guía de tamaño de modelo según RAM, indicada por el autor: 4 GB de RAM, hasta ~1,5B en Q4; 6-8 GB de RAM, hasta ~4B en Q4; 12 GB o más, modelos de 7-8B en Q4 o modelos MoE pequeños.
- GPU recomendadas: no disponible. La documentación no menciona aceleración por GPU (Vulkan, OpenCL) ni delegación a NPU.
- Almacenamiento: 65 MB para el APK, más el tamaño del modelo GGUF o GGML descargado. El permiso opcional de acceso a todos los ficheros permite cargar un modelo grande directamente desde el almacenamiento sin duplicarlo.
- Opciones de despliegue: instalación por sideload del APK (fuera de Google Play), descarga de modelos desde Hugging Face dentro de la propia aplicación o adición de un fichero de modelo ya presente en el dispositivo; servidor de API compatible con OpenAI accesible desde la red local.
- Latencia y throughput: no disponible. Solo se conoce el dato del modelo de titulado (~20 ms) y la existencia de un benchmark integrado sin resultados publicados.

## Comparativa con modelos similares

No se dispone de datos verificados de alternativas en la información proporcionada, por lo que no se incluye una tabla comparativa con cifras. Como referencia cualitativa, la categoría de aplicaciones Android de inferencia local incluye el ejemplo oficial de llama.cpp para Android, MLC-LLM/MLCChat y otros clientes de chat GGUF, pero sus especificaciones de licencia, formatos soportados y rendimiento no aparecen en el material consultado y no deben darse por sentadas.

El diferencial que sí declara el autor es la combinación de tres elementos: compatibilidad con modelos GGUF de múltiples familias, carga de modelos heredados GGML `.bin` que otros clientes ya no admiten, y un conjunto de herramientas de aceleración (decodificación especulativa, offloading de expertos MoE, cuantización de caché KV y atención flash) junto con servidor de API compatible con OpenAI. La verificación de ese diferencial frente a otras aplicaciones queda pendiente de una comparación directa.

## Limitaciones y advertencias

- No es un modelo: carece de parámetros, contexto, dataset y benchmarks propios. Cualquier afirmación de rendimiento depende exclusivamente del modelo GGUF o GGML que el usuario cargue.
- Tracción nula verificable: 0 descargas y 0 likes en Hugging Face, sin validación de la comunidad ni historial público de incidencias.
- Licencia `l-ai-freeware` (marcada como `other` en Hugging Face): permite descargar, usar y compartir la aplicación en forma no modificada. No se detallan condiciones de uso comercial ni de redistribución de versiones modificadas, ni se indica si el código fuente se publica; al distribuirse solo el APK, no es auditable.
- Licencias de terceros: los modelos que cargue el usuario se rigen por sus propias licencias, que pueden prohibir el uso comercial o imponer condiciones adicionales. La licencia de la aplicación no cubre esos pesos.
- Instalación por sideload: el APK se instala fuera de Google Play, lo que exige habilitar la instalación desde el navegador o el gestor de ficheros. Conviene verificar el SHA-256 del APK (`4411ccf6…bed43`) y del certificado (`517602ea…af8c9`) antes de instalar.
- Firma autogenerada: el certificado es `CN=UltraLabs, O=UltraLabs`, sin cadena de confianza externa. Las actualizaciones futuras deberán mantener la misma firma para poder instalarse sobre la versión previa.
- Permiso opcional de acceso a todos los ficheros y servicio en primer plano con notificaciones: son necesarios para cargar modelos grandes sin duplicarlos y para mantener el servidor local activo, pero amplían la superficie de riesgo si se conceden sin necesidad.
- Riesgo de alucinación elevado: los tamaños recomendados (0,5B-4B en Q4) son modelos pequeños con alta tasa de error factual. El RAG local sobre TXT/PDF/EPUB solo lo mitiga parcialmente y depende de la calidad de la recuperación.
- Idiomas: no se especifican idiomas de interfaz ni de generación. La documentación está redactada en inglés y el comportamiento multilingüe dependerá por completo del modelo cargado.
- Restricciones de plataforma: solo arm64-v8a y Android 11 o superior. Queda fuera cualquier dispositivo x86, de 32 bits o con versiones antiguas del sistema.
- Heterogeneidad de metadatos: las fechas de creación y actualización del repositorio (6 de octubre de 2026) y la ausencia de campos como `pipeline` o idiomas dificultan la trazabilidad del proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SmallAICreator/L-AI-Android
- llama.cpp (motor de inferencia, MIT): https://github.com/ggml-org/llama.cpp
- Cyronius/titler (modelo de titulado incluido, Apache-2.0): https://huggingface.co/Cyronius/titler
- GRAFT-1B (modelo pequeño recomendado por el autor): https://huggingface.co/SmallAICreator/GRAFT-1B
- GRAFT-1B-Vision-GGUF (variante con soporte de imagen): https://huggingface.co/SmallAICreator/GRAFT-1B-Vision-GGUF
- MiniGPT2-22M-GGUF (modelo minúsculo de demostración): https://huggingface.co/SmallAICreator/MiniGPT2-22M-GGUF
