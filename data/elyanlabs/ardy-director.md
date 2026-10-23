# elyanlabs/ardy-director

## Resumen

ARDY Director (repositorio `elyanlabs/ardy-director`) es una capa de orquestación —no un modelo generativo de texto— que permite a un LLM actuar como "director de movimiento" sobre NVIDIA ARDY, el modelo de texto-a-movimiento humanoide en tiempo real presentado en SIGGRAPH 2026. El repositorio es una instantánea del código de `github.com/Scottcjn/ardy-director` (con espejo en GitLab) y no contiene pesos: nada se ejecuta en la infraestructura de Hugging Face.

Se compone de dos piezas. `director_service` es un envoltorio FastAPI que corre en el host de ARDY, dentro del entorno virtual `ardy` y con GPU, y es el propietario del modelo. `mcp_server` es un servidor MCP por stdio, ligero en dependencias, que expone herramientas (`ardy_generate`, `ardy_choreograph`, `ardy_list_models`, `ardy_status`) y reenvía las peticiones al servicio. La separación evita cargar una segunda copia del codificador de texto LLM2Vec (basado en Llama-3) que ARDY ya tiene en memoria.

Su relevancia es práctica: convierte una frase como "camina hasta el escritorio, siéntate y saluda" en movimiento humanoide, ya sea en clips sueltos o en coreografías cosidas, y lo expone a agentes mediante MCP y a humanos mediante una interfaz web con visor three.js. El denoiser de movimiento que dirige tiene aproximadamente 156M de parámetros y está entrenado sobre el dataset de mocap Bones Rigplay, por lo que el director no inventa movimiento: solo dirige lo que ARDY ya sabe hacer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un LLM: envoltorio FastAPI (`director_service`) sobre la API de generación de NVIDIA ARDY (denoiser de movimiento) mas servidor MCP por stdio (`mcp_server`) |
| Parametros totales | ~156M en el denoiser de movimiento de ARDY (el repositorio no incluye pesos propios) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del codificador de texto LLM2Vec externo, servido aparte en el puerto 9550) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (las captions de entrenamiento de ARDY son frases declarativas en tercera persona; no se declara lista de idiomas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | El repositorio no contiene pesos; las salidas son `.npz` nativos de ARDY (`posed_joints` + tabla de padres del esqueleto) y JSON vía `GET /motion/{tag}` |
| Autor | elyanlabs |
| Fecha de creacion | 2026-10-23 |
| Descargas / likes | 0 / 0 |
| Pipeline de Hugging Face | No disponible |
| Etiquetas | elyan-labs, llm-inference, video-generation, agent, comfyui |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Su arquitectura es de dos procesos: (1) un servicio de control FastAPI en el host de ARDY que sirve en el puerto 9600, carga el denoiser de movimiento (~156M de parámetros) en la GPU y reutiliza el codificador de texto LLM2Vec ya en ejecución (`scripts/run_text_encoder_server.py`, puerto 9550), evitando duplicar Llama-3 en memoria; y (2) un servidor MCP por stdio que se registra en el cliente del agente mediante un fichero de configuración con la variable `DIRECTOR_URL` apuntando al servicio. La comunicación entre ambos es HTTP.

El modelo subyacente, NVIDIA ARDY, es un modelo de completado de movimiento entrenado sobre el dataset de mocap Bones Rigplay, centrado en movimiento humano/humanoide en el suelo: caminar, correr, girar, sentarse, saltar y gesticular. El texto solo dirige dentro de esa variedad aprendida; las peticiones fuera de distribución se colapsan al movimiento aprendido más cercano. El servicio añade una interfaz web de página única con visor three.js, control de duración, selección de modelo (`core`, `soma`, `g1`), semilla y orientación inicial, además de reproducción con pausa y depurador de fotogramas que marca las costuras entre pasos de una coreografía. Los nombres de joints y la tabla de padres se guardan en el `.npz` en el momento de la generación, de modo que reproducir un clip nunca recarga el modelo.

## Capacidades

- Generación de movimiento humanoide a partir de texto en inglés: clips individuales mediante `ardy_generate` con prompt y duración.
- Coreografía multicomponente: `ardy_choreograph` recibe una lista de pasos (`prompt` + `duration`), los cose en un único clip continuo y marca las uniones entre prompts.
- Selección de avatar/modelo de movimiento: `core`, `soma` y `g1` (robot Unitree G1), consultables con `ardy_list_models`.
- Monitorización del servicio: `ardy_status` informa de dispositivo, modelos cargados y estado del enlace con el codificador de texto.
- Integración con agentes vía Model Context Protocol (transporte stdio), lo que permite que un LLM planifique y ejecute secuencias de movimiento.
- Interfaz web con visor three.js: reproducción, pausa, depurador de fotogramas y adelgazamiento de frames por `?stride=N` para enlaces lentos.
- Reutilización del codificador LLM2Vec existente, sin cargar una segunda instancia de Llama-3.
- Exportación a `.npz` nativo de ARDY, cargable en el visor propio de ARDY (`scripts/visualize.py`) o renderizable con un skin externo.
- Biblioteca de prompts de ejemplo: 36 prompts utilizables y 5 fallos documentados, repartidos en locomotion (8), turning (4), ground_transitions (5), jumps (4), gestures (5), kicks_strikes (3), dance (4), idle (3) y out_of_distribution (5).
- No se declaran capacidades de visión, audio, código, matemáticas ni tool calling genérico más allá de las herramientas MCP listadas.

## Casos de uso

- Prototipado de animación para videojuegos: un agente pide `ardy_choreograph` con pasos como "caminar al escritorio", "sentarse", "saludar" y obtiene un `.npz` continuo que se reproduce en el visor de ARDY antes de exportarlo al motor.
- Previsualización rápida en producción de animación: la interfaz web en `http://<host>:9600/ui/` permite iterar prompts, duración y semilla y ver el resultado como figura de palotes en el navegador, sin escribir código ni gestionar ficheros.
- Control de robots humanoides en simulación: el modelo `g1` genera movimiento para el robot Unitree G1, útil para generar referencias de trayectoria antes de transferirlas a un pipeline de control.
- Generación de datos sintéticos de movimiento: los clips `.npz` con joints y jerarquía de esqueleto sirven como datos etiquetados por prompt para entrenar clasificadores de acción o modelos de retargeting.
- Automatización de escenas con agentes: un LLM con acceso al servidor MCP puede encadenar `ardy_generate` y `ardy_status` para construir secuencias de varios personajes o planos dentro de un flujo mayor de generación de vídeo.
- Docencia y demostraciones de texto-a-movimiento: la biblioteca de 36 prompts, con duración y procedencia anotadas (`upstream_preset`, `upstream_doc`, `derived`), permite reproducir resultados conocidos y comparar variantes de fraseo.
- Depuración de prompts de movimiento: la categoría `out_of_distribution` documenta cinco fallos conocidos, útil para calibrar expectativas y evitar bucles de reintento con prompts que el modelo no puede cumplir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU NVIDIA con CUDA en el host de ARDY: el servicio se lanza con `CUDA_VISIBLE_DEVICES=0` y `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`. La VRAM concreta no está disponible en la documentación.
- El codificador de texto LLM2Vec debe estar ya en ejecución (`scripts/run_text_encoder_server.py`, puerto 9550); el servicio no lo arranca.
- Se requiere `HF_TOKEN` para el acceso a modelos durante el arranque del servicio.
- El componente `mcp_server` no necesita GPU: corre en el equipo del cliente (por ejemplo, un portátil) y solo necesita Python 3 y conectividad HTTP al servicio.
- No se especifican GPU recomendadas, ni si cabe en GPU de consumo, ni latencia o throughput. Al tratarse de un denoiser de ~156M de parámetros, el cuello de botella documentado es la reutilización del codificador LLM2Vec, no el tamaño del modelo de movimiento, pero no hay cifras publicadas.
- Opciones de despliegue documentadas: ejecución manual del servicio FastAPI en el entorno `ardy`, script `deploy_136.sh` para copiar y lanzar en el host por defecto, y registro del servidor MCP en `~/.mcp.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este componente.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de alternativas comparables. El único sistema de referencia citado es el propio NVIDIA ARDY (`nv-tlabs/ardy`), que es el modelo subyacente que este repositorio envuelve, no un competidor.

| Sistema | Relación con ARDY Director | Datos disponibles |
|---|---|---|
| NVIDIA ARDY (`nv-tlabs/ardy`) | Modelo de texto-a-movimiento que el proyecto dirige; el denoiser de ~156M de parámetros pertenece a ARDY | Solo referencia de repositorio; sin benchmarks en la información disponible |
| ARDY Director (`elyanlabs/ardy-director`) | Capa de orquestación (FastAPI + MCP + UI) sobre ARDY | Sin benchmarks; 0 descargas y 0 likes en Hugging Face |

## Limitaciones y advertencias

- No es un modelo: el repositorio contiene únicamente código. No hay pesos, no se puede ejecutar en la infraestructura de Hugging Face y requiere una instalación funcional de NVIDIA ARDY con GPU.
- El movimiento queda restringido a la variedad aprendida de Bones Rigplay (movimiento terrestre humano/humanoide). Prompts fuera de distribución ("volar como Superman") colapsan al movimiento aprendido más cercano; el director no inventa movimiento nuevo.
- El fraseo afecta al resultado: el codificador fue entrenado con captions declarativas en tercera persona, y la documentación advierte explícitamente de no "embellecer" los prompts de procedencia `upstream_preset`.
- Licencia AGPL-3.0: es copyleft fuerte y, al tratarse de un servicio de red, conviene revisar las obligaciones de publicación de código derivado antes de un despliegue comercial o como SaaS. No hay licencia comercial alternativa documentada.
- Sin validación comunitaria: 0 descargas y 0 likes, creado y actualizado el mismo día (2026-10-23). No hay historial de uso ni informes de terceros.
- No se declaran idiomas soportados; toda la evidencia apunta a prompts en inglés, y no hay datos sobre comportamiento en castellano.
- Riesgo de alucinación de movimiento: el sistema siempre devuelve un clip, aunque el prompt no sea representable, sin señalización de fallo más allá del colapso al movimiento más cercano.
- No se documenta autenticación ni control de acceso en el servicio HTTP (puerto 9600) ni en la interfaz web; exponerlo fuera de una red de confianza requeriría protección adicional no descrita.
- Dependencia de estado externo: el codificador LLM2Vec debe estar arrancado por separado; si cae, el servicio queda inservible.
- No hay datos publicados de latencia, throughput, VRAM ni calidad objetiva, lo que impide estimar costes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/ardy-director
- Repositorio GitHub: https://github.com/Scottcjn/ardy-director
- Espejo GitLab (historial completo): https://gitlab.com/elyan-labs/ardy-director
- NVIDIA ARDY (modelo subyacente): https://github.com/nv-tlabs/ardy
