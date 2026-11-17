# bennett-xdlabs/wingllm

## Resumen

WingLLM es un motor de inferencia escrito en Go, desarrollado por bennett-xdlabs, que implementa decodificación especulativa heterogénea para equipos con GPUs de gama baja (2 GB de VRAM) y sistemas con recursos limitados. No es un modelo de lenguaje en sí, sino una herramienta de serving que empareja un modelo objetivo pesado (cargado en RAM del sistema) con un modelo borrador ultraligero (anclado en la VRAM de la GPU) para acelerar la generación de tokens en hardware modesto.

El problema que aborda es concreto: modelos de 7B-8B en cuantización GGUF requieren entre 4,5 GB y 5 GB de VRAM, por lo que en GPUs de 2 GB se ejecutan al 100 % en CPU a velocidades de 1,2-2,5 tokens por segundo mientras la GPU permanece inactiva. WingLLM propone usar esa GPU infrautilizada como motor de borrador especulativo, con un modelo de 0,5B (unos 397 MB) que genera candidatos que la CPU verifica en un único pase paralelo.

El proyecto se distribuye como binario precompilado para Windows, macOS (Apple Silicon e Intel) y Linux x86_64, expone una API compatible con OpenAI y un servidor MCP para asistentes de código. Su relevancia radica en hacer viable la inferencia de modelos de 7B en portátiles y mini-PC sin hardware dedicado de gama alta, con una aceleración medida de casi 2× sobre la línea base en CPU pura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de inferencia con decodificación especulativa heterogénea (borrador en GPU + verificación en CPU); no es un modelo de lenguaje |
| Parametros totales | no disponible (el motor no tiene parámetros propios; opera sobre modelos de terceros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo objetivo cargado) |
| Tipos de cuantizacion | GGUF (vía llama.cpp y blobs de Ollama; niveles concretos no disponibles) |
| Idiomas soportados | no disponible (heredados del modelo objetivo) |
| Licencia | MIT |
| Formato de pesos | No aplica al motor; consume GGUF (blobs de Ollama) |

## Arquitectura y entrenamiento

WingLLM implementa la arquitectura que el autor denomina "Wingman": un esquema de decodificación especulativa en el que el modelo objetivo (por ejemplo, Qwen 2.5 Coder 7B, 4,7 GB) reside en la RAM del sistema, mientras un modelo borrador ligero (Qwen 2.5 Coder 0.5B, unos 397 MB) se ancla en la VRAM de la GPU mediante CUDA. La GPU genera 3-4 tokens candidatos en milisegundos (unos 25 ms según la model card) y la CPU verifica todos ellos simultáneamente en un único pase de memoria usando instrucciones vectoriales AVX2 (GEMM). El resultado es la aceptación de múltiples tokens por cada lectura completa de los pesos del modelo objetivo.

El emparejamiento de modelos está restringido por una curación estricta de pares: el motor solo combina modelos con tokenizadores verificados como idénticos (por ejemplo, Qwen 2.5 0.5B con las variantes 7B/14B/32B de la misma familia), lo que evita fallos por desajuste de vocabulario. Incluye un mecanismo denominado Windows WDDM Sentinel que monitoriza la memoria de vídeo en tiempo real para impedir que el modelo borrador y la caché KV crucen el umbral físico que provoca paginación a RAM del sistema en Windows. No se dispone de información sobre datos de entrenamiento, ya que el proyecto no entrena modelos propios.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa sobre modelos GGUF servidos con llama.cpp.
- Descubrimiento automático de modelos locales escaneando los manifiestos de Ollama (`~/.ollama/models`).
- Curación estricta de pares borrador/objetivo para evitar desajustes de tokenizador.
- Monitorización de VRAM en Windows (WDDM Sentinel) para evitar paginación a RAM del sistema.
- API compatible con OpenAI: endpoints `/v1/chat/completions` y `/v1/models`.
- Servidor MCP integrado para asistentes de código (Claude Code, Cursor u otros agentes), con herramientas como `wingllm_vram`.
- Panel web de telemetría en vivo en `http://localhost:8080/`.
- Conectores de un clic para IDE, como la extensión Continue de VS Code.
- Descarga automática del modelo borrador vía Ollama si no está instalado.
- Distribución multiplataforma: Windows, macOS (Apple Silicon e Intel) y Linux x86_64.

## Casos de uso

- Acelerar la codificación asistida en portátiles modestos: un desarrollador con una GTX 1050 o MX350 puede servir Qwen 2.5 Coder 7B con una velocidad cercana al doble de la línea base en CPU pura, integrándolo en VS Code mediante Continue con el conector de un clic.
- Sustituir la API en la nube en flujos de trabajo con Cursor o Claude Code: el servidor MCP integrado permite a estos asistentes consultar la VRAM disponible y arrancar el motor con el par de modelos adecuado, manteniendo el código en local.
- Servir modelos de 7B en mini-PC y workstations con Quadro P620 o similar: al cargar el objetivo en 16-32 GB de RAM y solo el borrador en los 2 GB de VRAM, se evita el cuello de botella de memoria que impide la ejecución en GPU.
- Prototipado de pipelines con API compatible con OpenAI: cualquier cliente que hable el protocolo de OpenAI (curl, librerías oficiales, Obsidian, Cline) puede apuntar a `http://localhost:8080/v1` sin cambios de código.
- Evaluación de pares borrador/objetivo en investigación sobre decodificación especulativa: el comando `wingllm list` identifica emparejamientos válidos por familia de tokenizador, lo que facilita experimentar con relaciones de tamaño 0,5B/7B/14B/32B dentro de Qwen 2.5.
- Despliegue en entornos sin conectividad o con requisitos de privacidad: al ejecutarse íntegramente en local sobre modelos Ollama ya descargados, no requiere enviar datos a servicios externos.
- Telemetría y ajuste fino del rendimiento: el panel web y la herramienta MCP `wingllm_vram` permiten monitorizar el uso de VRAM y ajustar la configuración antes de que el sistema entre en paginación.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos en un Intel Core i5-8500T (6 núcleos, 32 GB de RAM) con una NVIDIA Quadro P620 (2 GB de VRAM):

| Modo | Modelo objetivo | Modelo borrador | Velocidad de generación | Tiempo total (32 tokens) | Aceleración |
|---|---|---|---|---|---|
| Línea base (CPU pura) | Qwen 2.5 Coder 7B | ninguno | 1,29 tok/s | 24,76 s | 1,0× |
| WingLLM (especulativo) | Qwen 2.5 Coder 7B | Qwen 2.5 Coder 0.5B | 2,54 tok/s | 12,62 s | 1,97× |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el proyecto es un motor de inferencia y no un modelo evaluable con esas métricas.

## Requisitos de hardware

- VRAM estimada: 2 GB para el modelo borrador (unos 397 MB en el caso de Qwen 2.5 Coder 0.5B) más la caché KV; el modelo objetivo se aloja en RAM del sistema (4,7 GB para un 7B cuantizado, 18 GB para un 30B según el ejemplo de la model card).
- RAM del sistema: 16-32 GB recomendados según el tamaño del modelo objetivo.
- GPU validadas: NVIDIA Quadro P620 (2 GB). El autor menciona como objetivo portátiles con MX350/GTX 1050 y mini-PC, pero no publica pruebas en esas tarjetas.
- Cabe en GPUs de consumo con 2 GB de VRAM; no requiere A100, H100 ni RTX 4090.
- Aceleración por CPU: requiere instrucciones AVX2 para la verificación vectorial (GEMM).
- Opciones de despliegue: binario autónomo `wingllm` con servidor compatible con OpenAI, integración con blobs GGUF de Ollama y dependencia de llama.cpp para la carga de modelos.
- Latencia y throughput: 2,54 tok/s en el hardware de referencia (i5-8500T + Quadro P620) con el par Qwen 2.5 Coder 7B/0.5B; no hay datos para otros pares ni plataformas.

## Comparativa con modelos similares

No se dispone de información sobre proyectos comparables en la documentación proporcionada. WingLLM pertenece a la categoría de motores de inferencia con decodificación especulativa (junto a soluciones como llama.cpp con draft models o vLLM con speculative decoding), pero la ficha no incluye datos verificables de esos sistemas para establecer una comparación numérica.

| Criterio | WingLLM | Alternativas |
|---|---|---|
| Tipo | Motor de inferencia especulativa heterogénea (GPU borrador + CPU objetivo) | no disponible |
| Parámetros | no aplica | no disponible |
| Contexto | depende del modelo objetivo | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad | Binarios Windows, macOS y Linux; Hugging Face | no disponible |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamaño de 0,0 GB; se trata de un proyecto muy reciente (creado el 17 de noviembre de 2026) y sin validación comunitaria.
- La aceleración medida (1,97×) procede de un único banco de pruebas con hardware concreto (i5-8500T + Quadro P620); el rendimiento en otros equipos puede diferir notablemente.
- La restricción de emparejamiento por tokenizador idéntico limita los pares válidos a familias concretas (el ejemplo documentado es Qwen 2.5); no se detallan otras familias soportadas.
- El mecanismo WDDM Sentinel es específico de Windows; el comportamiento en macOS y Linux ante presión de VRAM no está documentado.
- No se especifican los idiomas soportados, que dependerán exclusivamente del modelo objetivo cargado.
- Riesgo de alucinación y sesgos: heredados del modelo objetivo y del borrador; el motor no incorpora filtros propios ni modificaciones de alineamiento.
- La licencia MIT cubre el motor, pero el uso comercial de los modelos servidos queda sujeto a las licencias de cada modelo (por ejemplo, Qwen 2.5).
- No hay información publicada sobre estabilidad en producción, gestión de concurrencia ni límites de peticiones simultáneas.
- La instalación mediante `curl | bash` o `irm | iex` ejecuta scripts remotos; conviene revisar el contenido antes de usarla en entornos corporativos.

## Enlaces

- [Hugging Face: bennett-xdlabs/wingllm](https://huggingface.co/bennett-xdlabs/wingllm)
- [Script de instalación macOS/Linux](https://huggingface.co/bennett-xdlabs/wingllm/raw/main/install.sh)
- [Script de instalación Windows](https://huggingface.co/bennett-xdlabs/wingllm/raw/main/install.ps1)
- [Binario Windows](https://huggingface.co/bennett-xdlabs/wingllm/resolve/main/wingllm.exe)
- [Binario macOS Apple Silicon](https://huggingface.co/bennett-xdlabs/wingllm/resolve/main/wingllm-darwin-arm64)
- [Binario macOS Intel](https://huggingface.co/bennett-xdlabs/wingllm/resolve/main/wingllm-darwin-amd64)
- [Binario Linux x86_64](https://huggingface.co/bennett-xdlabs/wingllm/resolve/main/wingllm-linux-amd64)
- [Go 1.22+](https://golang.org)
- [Licencia MIT](https://opensource.org/licenses/MIT)
