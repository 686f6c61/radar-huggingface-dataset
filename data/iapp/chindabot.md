# iapp/chindabot

## Resumen

ChindaBot es una aplicación de escritorio para ejecutar modelos de lenguaje de forma local, publicada por iApp Technology (Tailandia) bajo el identificador `iapp/chindabot` en Hugging Face. No se trata de un modelo de lenguaje en sí, sino de un cliente de inferencia local que distribuye binarios e instaladores para macOS (Apple silicon), Windows (x64 y Arm64) y Linux (arm64), junto con un catálogo de modelos GGUF recomendados que el usuario descarga desde la propia aplicación. El instalador pesa entre 9 y 38 MB y no incluye pesos de modelo; la aplicación lee la memoria disponible del equipo y sugiere qué fichero GGUF encaja, se ejecuta parcialmente en CPU o resulta demasiado grande.

El objetivo declarado es ofrecer una experiencia de chat con IA en tailandés que funcione íntegramente en el equipo del usuario, sin que el texto salga del ordenador. La aplicación se apoya en el runtime de llama.cpp para la inferencia y permite seleccionar modelos de la familia OpenThai (4B, 27B, legal 30B-A3B) o de terceros como NVIDIA Nemotron 3.5 Bolt 74B-A9B, además de buscar cualquier GGUF alojado en Hugging Face. También contempla la instalación sin conexión copiando ficheros desde una carpeta local o unidad USB, con verificación SHA-256.

La relevancia actual del proyecto reside en su enfoque de privacidad por diseño y en la curaduría de modelos para hardware modesto, incluyendo equipos con GPU de 4 a 12 GB y plataformas Arm (RTX Spark, DGX Spark, Mac con memoria unificada). La información pública disponible sobre el repositorio es escasa: no se especifican parámetros, contexto ni benchmarks del propio producto, y la licencia no aparece indicada en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Aplicación de escritorio cliente de inferencia local sobre llama.cpp (no es un modelo de lenguaje) |
| Parámetros totales | no disponible (la aplicación no incluye pesos; los modelos sugeridos van de 4B a 74B-A9B) |
| Parámetros activos | no disponible (el modelo MoE sugerido, Nemotron 3.5 Bolt 74B-A9B, declara 9B activos en su nombre) |
| Longitud de contexto | no disponible (depende del modelo GGUF seleccionado) |
| Tipos de cuantización | GGUF (la aplicación descarga ficheros GGUF; los niveles concretos dependen de cada modelo del catálogo) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (runtime llama.cpp); instaladores `.dmg`, `.zip`, `.deb` y `.AppImage` |

## Arquitectura y entrenamiento

ChindaBot no es un modelo entrenado, sino una aplicación de escritorio que actúa como front-end de chat y gestor de modelos. La inferencia se delega en llama.cpp, cuyo archivo de runtime la aplicación descarga o copia junto con los pesos GGUF. La aplicación incorpora un catálogo (`recommended.json`) con modelos preseleccionados y una heurística que evalúa la memoria del sistema (solo CPU, VRAM de la GPU, memoria que la GPU toma del sistema en RTX Spark o memoria unificada en Mac) para clasificar cada fichero como "encaja", "se ejecuta parcialmente en CPU" o "demasiado grande". La instalación offline copia los ficheros desde una carpeta o USB y verifica su SHA-256 contra `SHA256SUMS`.

No se dispone de información sobre datos de entrenamiento, proceso de alineación (RLHF/DPO) ni innovaciones de arquitectura propias, porque el repositorio no contiene pesos ni documentación técnica de un modelo base. Los modelos que la aplicación recomienda pertenecen a la familia OpenThai de iApp (OpenThai Chinda 4B basado en Qwen3, OpenThai2.0 27B basado en Qwen3.8, OpenThai2.0 Legal 30B-A3B basado en Nemotron 3 Nano) y a NVIDIA (Nemotron 3.5 Bolt 74B-A9B); sus arquitecturas y entrenamientos se documentan en sus respectivas model cards, no en esta.

## Capacidades

- Chat local de texto con modelos GGUF descargados desde la propia aplicación o desde Hugging Face.
- Selección asistida de modelo según la memoria del equipo, con etiquetas de compatibilidad ("recomendado para este equipo", "parcial en CPU", "demasiado grande").
- Descarga e instalación de modelos con verificación de integridad mediante SHA-256.
- Funcionamiento sin conexión: instalación desde carpeta local o USB y chat sin red una vez descargado el modelo.
- Búsqueda de modelos GGUF de terceros en Hugging Face desde la interfaz.
- Soporte de modelos con capacidad de lectura de imágenes (OpenThai2.0 27B y Nemotron 3.5 Bolt 74B-A9B se anuncian como "lee imágenes").
- Interfaz bilingüe tailandés/inglés y orientación al mercado tailandés, incluyendo un modelo específico para trabajo legal tailandés.
- La versión completa de ChindaBot (instalable aparte, hoy solo en RTX Spark con Windows on Arm) añade herramientas, búsqueda web, lectura de documentos y voz en tailandés; la versión ligera no incluye estas funciones.
- No se documentan en esta ficha capacidades de tool calling, agentes multi-paso ni modo de razonamiento propios de la aplicación; dependerán del modelo GGUF cargado.

## Casos de uso

- Asistencia conversacional en tailandés con privacidad estricta: despachos, clínicas u oficinas donde el texto no puede salir del equipo; el modelo se ejecuta localmente y la aplicación no requiere conexión tras la descarga.
- Equipos sin GPU o con GPU de 4 a 12 GB: la aplicación recomienda OpenThai Chinda 4B (2,3 GB), que cabe en portátiles convencionales y permite prototipar asistentes en tailandés sin infraestructura de servidor.
- Trabajo legal en tailandés: el catálogo incluye OpenThai2.0 Legal 30B-A3B (23 GB), pensado para consultas sobre normativa tailandesa en estaciones con 24 GB de VRAM o Mac de 32 GB o más.
- Despliegue en estaciones Arm: instaladores para Windows on Arm (RTX Spark), Linux arm64 (DGX Spark) y macOS Apple silicon permiten usar el mismo cliente en flotas heterogéneas de escritorio.
- Entornos aislados o con red restringida: la instalación desde USB con verificación SHA-256 facilita poner en marcha el chat en máquinas sin acceso a Internet.
- Evaluación rápida de modelos GGUF: la búsqueda integrada en Hugging Face y las etiquetas de compatibilidad de memoria permiten comparar modelos (4B, 27B, 30B-A3B, 74B-A9B) en el mismo equipo sin montar un stack de inferencia manualmente.
- Digitalización de documentos con modelos multimodales: usando OpenThai2.0 27B o Nemotron 3.5 Bolt 74B-A9B, que leen imágenes, se pueden consultar capturas o páginas escaneadas dentro del chat local (la aplicación no incluye OCR dedicado; iApp publica OpenThai2.0-OCR como modelo aparte que la versión ligera no ejecuta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- La aplicación no incluye pesos; el requisito de VRAM depende del modelo GGUF elegido.
- Guía de la propia aplicación por memoria del equipo:
  - Sin GPU o GPU de 4 a 12 GB: OpenThai Chinda 4B, 2,3 GB.
  - GPU de 24 GB, RTX Spark o Mac con 32 GB o más: OpenThai2.0 27B, 16 GB (multimodal).
  - RTX Spark, Mac con 48 GB o más o DGX Spark: NVIDIA Nemotron 3.5 Bolt 74B-A9B, 22 GB (multimodal).
  - Trabajo legal tailandés: OpenThai2.0 Legal 30B-A3B, 23 GB.
- Plataformas soportadas: macOS Apple silicon (M1 o superior), Windows x64 (Intel/AMD), Windows on Arm (RTX Spark) y Linux arm64 (DGX Spark), en formato `.deb` o AppImage.
- Runtime de inferencia: llama.cpp (la aplicación descarga su archivo de runtime o lo copia desde una carpeta local).
- Opciones de despliegue: únicamente la aplicación de escritorio ChindaBot; no se documentan integraciones con vLLM, TGI, Ollama ni servidores compatibles con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Producto | Tipo | Modelos incluidos | Plataformas | Licencia | Notas |
|---|---|---|---|---|---|
| ChindaBot (iapp/chindabot) | Cliente de escritorio con catálogo GGUF | No incluye pesos; sugiere OpenThai 4B/27B/30B-A3B y Nemotron 74B-A9B | macOS arm64, Windows x64/arm64, Linux arm64 | no disponible | Enfoque en tailandés y privacidad local; instalación offline por USB |
| Ollama | Runtime y cliente CLI/API de modelos GGUF | Catálogo amplio de modelos abiertos | macOS, Linux, Windows | MIT (software) | Sin curaduría específica para tailandés ni etiquetado por memoria del equipo |
| LM Studio | Cliente de escritorio GUI | Catálogo amplio de GGUF y MLX | macOS, Windows, Linux | Propietaria (freeware) | Interfaz gráfica similar; no orientada al mercado tailandés |
| llama.cpp | Runtime de inferencia | Cualquier GGUF | Multiplataforma | MIT | Base técnica sobre la que se apoya ChindaBot; requiere configuración manual |

No se dispone de datos de rendimiento comparativos entre estas herramientas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no aporta pesos, tokenizador ni arquitectura propios; cualquier evaluación de calidad debe hacerse sobre el modelo GGUF cargado.
- La licencia no está indicada en la model card, por lo que no puede confirmarse el uso comercial de los instaladores ni de la aplicación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los instaladores de Windows no están firmados digitalmente (provocan advertencia de SmartScreen); el de macOS está firmado pero no notarizado, lo que obliga a autorizar la apertura manualmente en Ajustes del sistema.
- La versión ligera no ejecuta los modelos de voz y OCR de iApp (ASR, OCR-Markdown, OCR-Text), que se distribuyen por separado.
- La funcionalidad de agentes, herramientas, búsqueda web y voz en tailandés solo está disponible en la versión completa, hoy limitada a RTX Spark con Windows on Arm.
- El soporte lingüístico declarado se limita a tailandés e inglés; el rendimiento en otros idiomas dependerá del modelo GGUF elegido y no está documentado.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; son atribuibles a los modelos subyacentes, no a la aplicación.
- La búsqueda web realizada no devolvió documentación técnica de iApp Technology ni de ChindaBot; los resultados corresponden a la International Association of Privacy Professionals (IAPP), una organización sin relación con este proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/iapp/chindabot
- Instalador macOS arm64: https://huggingface.co/iapp/chindabot/resolve/main/ChindaBot-mac-arm64.dmg
- Instalador Windows arm64: https://huggingface.co/iapp/chindabot/resolve/main/ChindaBot-windows-arm64.zip
- Instalador Windows x64: https://huggingface.co/iapp/chindabot/resolve/main/ChindaBot-windows-x64.zip
- Paquete Linux arm64 (.deb): https://huggingface.co/iapp/chindabot/resolve/main/ChindaBot-linux-arm64.deb
- AppImage Linux arm64: https://huggingface.co/iapp/chindabot/resolve/main/ChindaBot-linux-arm64.AppImage
- Script de instalación macOS: https://huggingface.co/iapp/chindabot/resolve/main/install.sh
- Modelo recomendado OpenThai Chinda 4B (GGUF): https://huggingface.co/iapp/openthai-chinda-v1.0-qwen3-4b-gguf
- Modelo recomendado OpenThai2.0 27B (GGUF): https://huggingface.co/iapp/openthai2.0-qwen3.8-27b-GGUF
- Modelo recomendado OpenThai2.0 Legal 30B-A3B (GGUF): https://huggingface.co/iapp/openthai2.0-legal-thaillm-nemotron-3-nano-30b-a3b-GGUF
- Modelo recomendado NVIDIA Nemotron 3.5 Bolt 74B-A9B (GGUF): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- OpenThai2.0-ASR-Streaming: https://huggingface.co/iapp/OpenThai2.0-ASR-Streaming
- OpenThai2.0-OCR-Markdown: https://huggingface.co/iapp/OpenThai2.0-OCR-Markdown
- OpenThai2.0-OCR-Text: https://huggingface.co/iapp/OpenThai2.0-OCR-Text
