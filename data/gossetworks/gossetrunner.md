# GossetWorks/GossetRunner

## Resumen

Gosset Runner v1 es una aplicación de escritorio para Windows x64 que actúa como puerta de enlace local compatible con OpenAI y Ollama para los modelos empaquetados del formato Gosset E8, distribuidos por GossetWorks. No se trata de un modelo de lenguaje en sí, sino de un runtime que incluye un intérprete Python 3.11.6 aislado, PyTorch 2.12.0+cu128, CuPy 14.2.0, Transformers 5.11.0 y una carcasa nativa en .NET 8 con WebView2. El repositorio ocupa 2,8 GB e incluye el instalador `GossetRunnerSetup-1.0.0-win64.exe` de 2,65 GiB.

El problema que resuelve es la fricción de despliegue de los packs Gosset E8 en GPUs de consumo: evita instalar Python, CUDA Toolkit o resolver dependencias con `pip` manualmente. Al arrancar, detecta la GPU NVIDIA, la VRAM, el driver y la compute capability, y muestra qué packs caben íntegramente en la tarjeta. Incorpora un gestor de packs con descarga reanudable vía HTTP `Range`, verificación SHA-256 contra `SHA256SUMS.txt` e importación de carpetas locales.

La relevancia actual radica en que expone un endpoint local en `http://127.0.0.1:11434/v1` con soporte de streaming SSE y no streaming, lo que permite conectar herramientas compatibles con OpenAI u Ollama sin depender de la nube. Los packs soportados en la v1 son Arete-27B Gosset E8, Qwen3.8-27B Gosset E8 y Qwen3-32B Gosset E8, con consumos de VRAM pico entre 13,48 y 14,00 GiB y velocidades de decodificación reportadas de 38,4 a 54,64 tok/s en una RTX 5080.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación de escritorio (.NET 8 + WebView2) con runtime Python embebido para modelos Gosset E8 |
| Parametros totales | No disponible (el repositorio contiene el runtime, no pesos de modelo) |
| Parametros activos | No disponible |
| Longitud de contexto | 32.768 tokens por defecto en packs híbridos de 27B (KV cache FP8); 4.096 en Qwen3-32B denso de 64 capas para tarjetas de 16 GB |
| Tipos de cuantizacion | Packs Gosset E8 a 3,65 BPW; KV cache en FP8 |
| Idiomas soportados | No disponible |
| Licencia | Gosset Evaluation & Research License (uso no comercial; comercial requiere licencia escrita) |
| Formato de pesos | No disponible para los pesos; el artefacto distribuido es un instalador `.exe` de Windows x64 |

## Arquitectura y entrenamiento

Gosset Runner es un contenedor de ejecución, no un modelo entrenado. Su arquitectura combina una carcasa nativa en .NET 8 con WebView2 para la interfaz de escritorio y un intérprete Python 3.11.6 embebido que carga PyTorch 2.12.0+cu128, CuPy 14.2.0, Transformers 5.11.0 y huggingface-hub 1.33.0, junto con cabeceras NVRTC mínimas para CUDA FP16/BF16. El script de ejecución es `run_e8_chat.py`, que el gestor de packs puede actualizar sin volver a descargar los shards de pesos de aproximadamente 13 GB.

Los modelos que ejecuta pertenecen al formato Gosset E8, descrito por el autor como "Packed E8" y asociado a una retícula E8 en las etiquetas del repositorio. La model card no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO. Tampoco se especifica si los packs subyacentes usan arquitectura transformer densa o híbrida, aunque la referencia a "27B hybrid packs" frente a "dense 64-layer Qwen3-32B" sugiere que al menos los packs de 27B emplean una arquitectura híbrida. Los packs y el Runner contienen únicamente artefactos de ejecución compilados; no se distribuye el codificador de cuantización.

## Capacidades

- Ejecución local de modelos Gosset E8 con un solo clic en Windows x64, sin instalación previa de Python ni CUDA Toolkit.
- Detección automática de GPU NVIDIA, VRAM, driver y compute capability al arrancar, con indicación de qué packs caben residentes al 100 % en la tarjeta.
- Gestor de packs con descarga desde Hugging Face, pausa y reanudación mediante HTTP `Range`, verificación SHA-256 e importación de bundles locales.
- Chat de escritorio con streaming de respuestas en la interfaz integrada.
- Servidor local compatible con OpenAI y Ollama en `http://127.0.0.1:11434/v1`, con soporte de `stream=True` (SSE) y `stream=False`.
- Configuración por defecto de contexto y tokens de respuesta: 32.768 de contexto con KV cache FP8 y 2.048 tokens máximos de respuesta en packs híbridos de 27B; 4.096 de contexto seguro en Qwen3-32B denso para tarjetas de 16 GB.
- Actualización de scripts de runtime (`run_e8_chat.py`) sin redescargar los shards de pesos.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito; dependen del pack subyacente y no están descritas en la información disponible.

## Casos de uso

- Evaluación de investigación en local: un investigador puede desplegar packs Gosset E8 en una estación de trabajo con RTX 5080 y medir latencia, throughput y calidad sin configurar un entorno Python ni CUDA, reduciendo el tiempo de puesta a punto a la instalación del `.exe`.
- Integración con herramientas compatibles con OpenAI: al exponer `http://127.0.0.1:11434/v1`, permite apuntar clientes existentes del SDK de OpenAI al runtime local cambiando únicamente la `base_url`, útil para prototipos que luego migrarán a la nube.
- Integración con el ecosistema Ollama: la compatibilidad con el endpoint de Ollama facilita conectar interfaces y orquestadores que ya hablan ese protocolo, sin adaptar código.
- Pruebas de contexto largo: los packs de 27B arrancan con 32.768 tokens de contexto y KV cache FP8, lo que permite evaluar tareas de resumen de documentos extensos o análisis de conversaciones largas en una sola GPU de consumo.
- Comparación de packs sobre el mismo runtime: el gestor permite descargar e intercambiar Arete-27B, Qwen3.8-27B y Qwen3-32B, facilitando experimentos A/B con idéntico stack de inferencia y distintas cabezas de modelo.
- Despliegue en entornos air-gapped: la importación de una carpeta de bundle local y la verificación por checksum permiten instalar packs en máquinas sin acceso a Hugging Face, siempre que se transfiera el bundle previamente.
- Reproducibilidad de experimentos: la verificación SHA-256 de cada archivo antes del primer arranque garantiza que los pesos ejecutados coinciden con los publicados, lo que ayuda a reproducir resultados entre máquinas.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Los únicos datos numéricos disponibles son de rendimiento de decodificación en una RTX 5080:

| Pack | VRAM pico | Contexto por defecto | Decodificación en RTX 5080 |
|---|---|---|---|
| Arete-27B Gosset E8 | 13,48 GiB | 32.768 (KV FP8) | 53,92 tok/s |
| Qwen3.8-27B Gosset E8 | 13,48 GiB | 32.768 (KV FP8) | 54,64 tok/s |
| Qwen3-32B Gosset E8 | 14,00 GiB | 4.096 (límite de 16 GB) | 38,4 - 40,0 tok/s |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada: 13,48 GiB para los packs de 27B y 14,00 GiB para Qwen3-32B, según los picos reportados por el autor.
- GPU recomendadas: RTX 5080 como plataforma de referencia declarada; los packs están dimensionados para caber en tarjetas de 16 GB. No se documentan requisitos para A100, H100 u otras GPUs de centro de datos.
- Cabe en GPU de consumo: sí, en tarjetas NVIDIA con al menos 16 GB de VRAM; el runtime detecta la VRAM y limita el contexto en consecuencia (4.096 tokens en Qwen3-32B para 16 GB).
- Sistema operativo: exclusivamente Windows x64; no se mencionan builds para Linux ni macOS.
- Opciones de despliegue: instalador de escritorio con runtime Python embebido; expone API local compatible con OpenAI y Ollama. No se documenta soporte para vLLM, llama.cpp, TGI ni Ollama nativo como backend.
- Latencia y throughput: 53,92 a 54,64 tok/s en packs de 27B y 38,4 a 40,0 tok/s en Qwen3-32B, medidos en RTX 5080 según el autor.

## Comparativa con modelos similares

| Herramienta | Tipo | Plataforma | Modelos soportados | Licencia | API local |
|---|---|---|---|---|---|
| Gosset Runner v1 | Runtime de escritorio | Windows x64 | Packs Gosset E8 (Arete-27B, Qwen3.8-27B, Qwen3-32B) | Gosset Evaluation & Research License (no comercial) | OpenAI y Ollama en `127.0.0.1:11434/v1` |
| Ollama | Runtime de escritorio y servidor | Windows, Linux, macOS | Amplio catálogo GGUF de la comunidad | MIT (runtime) | API propia compatible con OpenAI |
| LM Studio | Aplicación de escritorio | Windows, Linux, macOS | Modelos GGUF y MLX | Propietaria (gratuita para uso personal) | Servidor local compatible con OpenAI |
| llama.cpp | Runtime de inferencia | Multiplataforma | GGUF | MIT | Servidor HTTP propio |

La comparación se limita a la categoría de runtime local, ya que Gosset Runner no es un modelo. No se dispone de datos de calidad comparables entre los packs Gosset E8 y modelos de tamaño similar, por lo que no es posible establecer una comparativa de rendimiento en tareas.

## Limitaciones y advertencias

- Licencia restrictiva: la Gosset Evaluation & Research License limita el uso a evaluación e investigación no comercial; cualquier uso comercial requiere licencia escrita de `licensing@gossetworks.com`.
- Propiedad intelectual: el proyecto está protegido por la solicitud provisional de patente estadounidense n.º 64/193,785, lo que puede afectar a reimplementaciones o usos derivados.
- Plataforma única: solo Windows x64; no hay soporte documentado para Linux, macOS ni despliegues en servidores.
- Ecosistema cerrado de modelos: solo ejecuta packs Gosset E8 oficiales; no se documenta compatibilidad con GGUF, safetensors genéricos ni otros formatos.
- Idiomas soportados no disponibles: la model card no especifica cobertura lingüística, lo que impide garantizar calidad multilingüe.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de seguridad para los packs subyacentes.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Sin benchmarks de calidad: la ausencia de resultados en MMLU, HumanEval, GSM8G u otros impide comparar los packs con alternativas de tamaño similar.
- Madurez temprana: el repositorio registra 0 descargas y 1 like en el momento de la consulta, con creación y última actualización el mismo día (17 de noviembre de 2026), lo que sugiere un lanzamiento reciente y poca validación externa.
- Dependencia de la verificación de checksums: la integridad de los pesos depende de `SHA256SUMS.txt`; si el archivo no está disponible o se importa un bundle local sin verificar, no hay garantía de integridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GossetWorks/GossetRunner
- Instalador Windows x64 v1.0.0: https://huggingface.co/GossetWorks/GossetRunner/resolve/main/GossetRunnerSetup-1.0.0-win64.exe?download=true
- Licencia: https://huggingface.co/GossetWorks/GossetRunner/blob/main/LICENSE.md
- Pack Arete-27B Gosset E8: https://huggingface.co/GossetWorks/Arete-27B-Gosset-3.65BPW
- Pack Qwen3.8-27B Gosset E8: https://huggingface.co/GossetWorks/Qwen3.8-27B-Gosset-3.65BPW
- Pack Qwen3-32B Gosset E8: https://huggingface.co/GossetWorks/Qwen3-32B-Gosset-3.65BPW
- Contacto de licencias comerciales: licensing@gossetworks.com
