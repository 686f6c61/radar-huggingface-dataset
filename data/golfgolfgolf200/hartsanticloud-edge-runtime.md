# golfgolfgolf200/hartsanticloud-edge-runtime

## Resumen

Hart's Anti-Cloud Software (publicado en Hugging Face como `golfgolfgolf200/hartsanticloud-edge-runtime`) es una plataforma de computación de borde y ejecución de IA local, diseñada para convertir estaciones de trabajo Linux x86_64, mini-PC y servidores on-premise en nodos de cómputo autocontenidos. No es un modelo de lenguaje en sí, sino un runtime que orquesta modelos GGUF de Liquid AI (LFM2.5) mediante un motor `llama.cpp` compilado estáticamente, junto con un supervisor en Rust, una base de datos vectorial SQLite (`sqlite-vec`) para RAG local y un sandbox de agentes basado en microVMs Firecracker KVM.

El objetivo declarado es eliminar la dependencia de APIs en la nube, el coste por token y la exposición de datos a terceros, ofreciendo operación air-gapped, sockets `AF_UNIX` con permisos `0600` y verificación criptográfica SHA-256 de los pesos. En su tier `Entry16G` ejecuta `LFM2.5-1.2B-Instruct-Q4_K_M` (697 MB) con una ventana de contexto de 8.192 tokens y un consumo activo de RAM de aproximadamente 1,35 GB, lo que lo hace viable en hardware de oficina sin GPU dedicada.

La relevancia actual reside en la demanda de despliegues de IA "soberana" y local-first para entornos regulados, donde el egress de datos a la nube es inaceptable. El proyecto integra además transcripción offline vía `whisper-cpp`, soporte multimodal de visión con proyectores `mmproj` y un servidor MCP, todo empaquetado con una interfaz de escritorio Tauri.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Runtime de orquestación (Rust) sobre motor `llama.cpp`; modelos base LFM2.5 (transformer, no disponible el detalle exacto de la arquitectura interna) |
| Parámetros totales | Depende del modelo cargado: 1.2B (`LFM2.5-1.2B-Instruct`), 8B-A1B y 24B-A2B (MoE, según nomenclatura) |
| Parámetros activos | 1B en el modelo MoE 8B-A1B; 2B en el MoE 24B-A2B (según nomenclatura del modelo base) |
| Longitud de contexto | 8.192 tokens (`Entry16G`), 16.384 (`Pro32G`), 32.768 (`Enterprise64GPlus`) |
| Tipos de cuantización | Q4_K_M (modelo por defecto, 697 MB); otras no especificadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (verificados por SHA-256; soporte de proyectores `mmproj*.gguf` para visión) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino un runtime que envuelve modelos base de Liquid AI: `LiquidAI/LFM2.5-1.2B-Instruct-GGUF`, `LiquidAI/LFM2.5-8B-A1B-GGUF` y `LiquidAI/LFM2.5-24B-A2B-GGUF`. La arquitectura del sistema se compone de un supervisor en Rust que expone únicamente un socket Unix (`unix:///var/lib/hartsanticloud/run/supervisor.sock`, modo `0600`) con autenticación bearer de 256 bits en tiempo constante, y un worker `llama-server` aislado que escucha en un puerto efímero de `127.0.0.1` con clave API en tmpfs (`/dev/shm`). El motor `llama.cpp` se compila estáticamente con `-DLLAMA_CURL=OFF` y `--no-webui` para minimizar la superficie de ataque.

El sistema incorpora un auto-escalador de hardware (`hw-scaler`) que ajusta núcleos, contexto, microVMs concurrentes y caché WAL de SQLite según la RAM disponible. Para la ejecución de agentes no confiables utiliza microVMs Firecracker KVM lanzadas mediante `jailer` con uid/gid no privilegiados (`65534`), chroot aislado, `--new-pid-ns`, límites de memoria con cgroup v2 y filtrado de syscalls `--seccomp-level 2`, con fallback a VMM directo o Wasmtime WASI cuando no hay privilegios. No se dispone de información sobre el dataset de entrenamiento ni sobre procesos de RLHF/DPO de los modelos base en la documentación proporcionada.

## Capacidades

- Generación de texto, extracción de JSON, RAG y sumarización mediante los modelos LFM2.5 servidos por `llama.cpp`.
- Ingesta de documentos PDF con extracción de capa de texto nativa en Rust (`pdf-extract`) y fallback OCR offline (`pdftoppm` + `tesseract`) para PDFs escaneados e imágenes (`.png`, `.jpg`, `.jpeg`, `.webp`, `.tif`, `.tiff`, `.bmp`).
- RAG local con índice vectorial `sqlite-vec`.
- Soporte multimodal de visión mediante proyectores `mmproj*.gguf` y arrays de contenido `image_url` compatibles con la API de OpenAI en `/v1/chat/completions`.
- Transcripción de audio offline mediante `whisper-cpp`.
- Ejecución de agentes y código poliglota en sandboxes efímeros (Firecracker KVM, VMM directo o Wasmtime WASI).
- Servidor MCP (Model Context Protocol) para integración con herramientas.
- API compatible con OpenAI (`/v1/chat/completions`).
- Operación air-gapped y zero-egress; cloud burst opcional deshabilitado por defecto (requiere `HARTSANTICLOUD_BURST_URL` y `allow_cloud_burst: true`).
- Interfaz de escritorio nativa (Tauri).

## Casos de uso

- **Atención al cliente en entornos regulados:** el runtime puede servir un asistente multi-turno con 8.192 tokens de contexto en el tier `Entry16G`, manteniendo los registros de conversación dentro de la máquina y cumpliendo requisitos de soberanía de datos sin egress a la nube.
- **RAG documental sobre corpus internos:** ingesta de PDFs e imágenes con OCR offline hacia el índice `sqlite-vec`, permitiendo consultas semánticas sobre documentación sensible (contratos, expedientes, manuales) sin que el contenido abandone la infraestructura.
- **Extracción estructurada de datos:** uso del modelo LFM2.5 para extracción de JSON y sumarización en pipelines de back-office, aprovechando el bajo consumo (~1,35 GB de RAM activa) para ejecutarse en mini-PC de oficina.
- **Transcripción de reuniones y audio confidencial:** `whisper-cpp` permite transcribir grabaciones localmente, adecuado para despachos legales, sanitarios o administraciones públicas con requisitos de confidencialidad.
- **Ejecución de agentes de código no confiables:** el sandbox Firecracker con seccomp y cgroups permite ejecutar tareas generadas por el modelo en microVMs desechables, útil en plataformas de CI/CD o asistentes de programación autohospedados.
- **Despliegue en entornos air-gapped:** nodos en redes aisladas (defensa, industria crítica, laboratorios) pueden operar con pesos verificados por SHA-256 y sin telemetría ni cuentas en la nube.
- **Procesamiento multimodal de documentos escaneados:** con el proyector `mmproj` y la API compatible con OpenAI, se pueden construir flujos de descripción o clasificación de imágenes dentro del perímetro local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** no requiere GPU dedicada; ejecución CPU-native con `llama.cpp`.
- **RAM activa (tier `Entry16G`):** ~65–85 MB para el supervisor y la UI; ~1,25 GB para `llama-server` con `LFM2.5-1.2B-Instruct-Q4_K_M` y contexto de 8.192 tokens; total ~1,35 GB, dejando ~14,6 GB libres en una máquina de 16 GB.
- **Almacenamiento:** ~760 MB en nodo Debian/Ubuntu/Mint estándar; ~830 MB en AppImage; ~1,18 GB con assets de microVM Firecracker (`vmlinux.bin` y `rootfs.ext4`, ~425 MB adicionales).
- **Requisitos mínimos:** 4 núcleos de CPU, 16 GB de RAM, 256 GB de NVMe.
- **Tiers de escalado:** `Entry16G` (16 GB, contexto 8.192, hasta 4 microVMs), `Pro32G` (32 GB, contexto 16.384, hasta 12 microVMs), `Enterprise64GPlus` (64 GB+, contexto 32.768, hasta 32 microVMs).
- **GPU recomendadas:** no se especifican; el diseño es CPU-first. No se documenta soporte de aceleración por GPU.
- **Aceleración opcional:** `/dev/kvm` para microVMs Firecracker.
- **Opciones de despliegue:** binarios estáticos en Debian/Ubuntu/Mint, AppImage para otras distribuciones Linux, `llama-server` de `llama.cpp` como worker interno, interfaz Tauri, servidor MCP.
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Sistema | Tipo | Modelos soportados | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Hart's Anti-Cloud | Runtime local-first sobre `llama.cpp` | LFM2.5 1.2B / 8B-A1B / 24B-A2B (GGUF) | 8.192–32.768 según tier | Apache 2.0 | Zero-egress, air-gapped, sandbox Firecracker |
| Ollama | Runtime local de inferencia | Múltiples GGUF | Según modelo | MIT (cliente) | Simplicidad de despliegue local |
| vLLM | Servidor de inferencia | Múltiples (safetensors, GGUF parcial) | Según modelo | Apache 2.0 | Alto throughput en GPU |
| llama.cpp (`llama-server`) | Motor de inferencia | GGUF | Según modelo | MIT | CPU/GPU, portabilidad |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con estas alternativas.

## Limitaciones y advertencias

- El repositorio está etiquetado únicamente para inglés (`en`); no se documenta soporte multilingüe.
- El modelo por defecto (1.2B) tiene capacidad limitada en razonamiento complejo y matemáticas frente a modelos de mayor tamaño; los tiers superiores permiten cargar 8B-A1B y 24B-A2B, pero su comportamiento exacto no está documentado en la información disponible.
- Riesgo de alucinación inherente a los modelos LFM2.5; no se documentan mecanismos de mitigación específicos.
- El contexto máximo está acotado por el tier de hardware (8.192 tokens en `Entry16G`), lo que limita tareas de contexto largo.
- El cloud burst está deshabilitado por defecto; si se activa, rompe la garantía de zero-egress y debe evaluarse frente a los requisitos de cumplimiento.
- El sandbox Firecracker requiere `/dev/kvm` y privilegios; sin ellos se degrada a VMM directo o Wasmtime WASI, con distinto modelo de aislamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria ni evidencia de uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los modelos base LFM2.5 de Liquid AI por separado.
- No se documentan sesgos conocidos ni evaluación de seguridad del sistema.

## Enlaces

- Hugging Face: https://huggingface.co/golfgolfgolf200/hartsanticloud-edge-runtime
- Modelo base LFM2.5-1.2B-Instruct-GGUF: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- Modelo base LFM2.5-8B-A1B-GGUF: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- Modelo base LFM2.5-24B-A2B-GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Motor llama.cpp: https://github.com/ggml-org/llama.cpp
- SQLite vectorial: https://github.com/asg017/sqlite-vec
- Whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Firecracker: https://github.com/firecracker-microvm/firecracker
- Tauri: https://github.com/tauri-apps/tauri
