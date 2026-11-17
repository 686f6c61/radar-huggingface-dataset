# KORMo-VL/KORMo-Web-4B-mlx-4bit

## Resumen

KORMo-Web-4B es un agente web multimodal de 4B parámetros desarrollado por KORMo-VL (KAIST MLP Lab) que completa tareas reales en navegador operando únicamente sobre capturas de pantalla. Acepta instrucciones en coreano o inglés, planifica, hace clic, escribe y navega entre sitios y pestañas hasta finalizar la tarea. Está construido sobre Qwen3.5-4B mediante fine-tuning supervisado con más de 10 millones de muestras de pretraining web atómico y más de 100.000 trayectorias de interacción bilingües.

El modelo resuelve un problema concreto: los agentes web open-weight existentes rinden muy por debajo en coreano y dependen de DOM o árbol de accesibilidad. KORMo-Web-4B elimina esa dependencia y actúa solo con píxeles, verificando cada acción en la siguiente captura. En la evaluación Online-Mind2Web alcanza 42,3% en inglés y 42,3% en coreano, superando al Qwen3.5-4B base en +22,3 y +28,8 puntos respectivamente.

Esta ficha describe la variante **mlx-4bit**, cuantizada a 4 bits para Apple Silicon y publicada bajo licencia Apache-2.0. El repositorio ocupa 3,1 GB y contiene 4.539.265.536 parámetros en formato safetensors, servibles con vllm-mlx 0.6.0 o superior mediante API compatible con OpenAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; familia `qwen3_5` |
| Parámetros totales | 4.539.265.536 (4,54B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (MLX); el modelo base completo también está publicado |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal de 4B parámetros, y se especializa mediante un pipeline de entrenamiento en dos fases descrito por el autor. La primera fase consiste en pretraining web a nivel atómico con más de 10 millones de muestras bilingües (coreano e inglés) que enseñan al modelo qué es cada elemento de interfaz, dónde está y qué hace, cubriendo texto, posición, apariencia, layout, función y estado. La segunda fase utiliza más de 100.000 trayectorias de interacción en navegador para traducir esa comprensión fina en acciones multi-paso reales.

Una innovación destacable es el modo "piensa y actúa": cada acción va precedida de un breve paso de razonamiento (` thinking`) y de una llamada a herramienta (`<tool_call>`) en texto plano, que el harness de referencia parsea directamente del contenido del mensaje. El modelo no requiere DOM ni árbol de accesibilidad: opera solo con screenshots y verifica el resultado de cada acción en la captura siguiente. El autor publica pesos, datos de pretraining, trayectorias y benchmarks para reproducibilidad. No se detalla en la información disponible si hubo RLHF o DPO.

## Capacidades

- Comprensión y actuación sobre interfaces web a partir exclusivamente de capturas de pantalla.
- Planificación multi-paso con razonamiento explícito antes de cada acción (modo thinking).
- Generación de acciones estructuradas: clic, escritura, scroll, navegación y gestión de pestañas.
- Flujos multi-sitio y multi-pestaña: buscar en un sitio, verificar en otro y escribir el resultado en un tercero.
- Soporte de tool calling mediante esquema JSON (`tools.json`) y parseo de `<tool_call>`.
- Comprensión bilingüe coreano-inglés, tanto en comandos cortos como en instrucciones conversacionales largas.
- Verificación de resultados acción a acción mediante la captura posterior.
- Capacidad image-text-to-text genérica heredada del modelo base Qwen3.5-4B.

## Casos de uso

- **Automatización de tareas de reserva y búsqueda inmobiliaria**: el modelo puede recibir una instrucción en coreano como filtrar por depósito máximo, revisar varios anuncios y enviar un resumen por correo, gestionando el sitio de búsqueda y el cliente de correo en pestañas distintas. Es adecuado por su entrenamiento específico en sitios coreanos y su capacidad multi-sitio.
- **Atención al cliente con back-office web**: ejecutar consultas en portales internos (ERP, CRM) a partir de capturas, rellenando formularios y extrayendo datos, sin necesidad de integrar APIs ni DOM. Útil en entornos legacy donde no hay accesibilidad estructurada.
- **Automatización de compras y comparación de precios**: buscar un producto en varias tiendas, comparar y registrar resultados. El modo screenshot-only permite operar en sitios con DOM ofuscado o protecciones anti-scraping que rompen selectores.
- **Generación de informes a partir de portales públicos**: consultar datos en administraciones o portales de estadísticas, navegar entre pestañas y redactar un resumen en coreano o inglés.
- **Testing E2E de aplicaciones web**: usar el agente como usuario sintético que ejecuta flujos de UI reales y verifica resultados visualmente, complementando suites de Playwright con validación semántica.
- **Asistente de investigación para usuarios no técnicos**: un investigador coreano puede delegar tareas de navegación (buscar papers, descargar PDFs, rellenar formularios de congresos) mediante lenguaje natural, sin escribir scripts.
- **Prototipado de agentes computer-use en Mac**: gracias a la variante MLX 4-bit, se puede desplegar localmente en Apple Silicon para experimentar con harness propio antes de escalar a GPUs.

## Benchmarks y rendimiento

Evaluación sobre 612 tareas en sitios web en vivo (300 en inglés, 312 en coreano), puntuadas por el mismo juez LLM. Tasa de éxito en porcentaje; los fallos y ejecuciones vacías cuentan como fallo.

| Modelo | Tamaño | Online-Mind2Web EN | Online-Mind2Web KO |
|---|---:|---:|---:|
| Qwen3.5-4B (base, sin fine-tuning) | 4B | 20,0 | 13,5 |
| Fara-1.5-4B | 4B | 20,7 | 7,7 |
| UI-TARS-1.5-7B | 7B | 22,3 | 20,2 |
| OpenWebRL-4B | 4B | 32,7 | 15,4 |
| **KORMo-Web-4B** | **4B** | **42,3** | **42,3** |
| KORMo-Web-9B | 9B | 51,0 | 48,1 |

El autor reporta además una ventaja de +9,6 puntos en inglés y +22,1 puntos en coreano frente a todos los agentes web open-weight comparados en la misma evaluación en vivo.

## Requisitos de hardware

- **VRAM/unified memory estimada**: el repositorio pesa 3,1 GB en 4-bit; se recomienda al menos 6-8 GB de memoria unificada libre para inferencia con contexto de imagen, aunque el dato exacto no está publicado.
- **Plataforma objetivo**: Apple Silicon (MLX). Probado con vllm-mlx 0.6.0 o superior.
- **GPU NVIDIA**: para esta variante MLX no aplica; para el modelo base completo en safetensors se puede usar vLLM en A100, H100, L40S o RTX 4090, aunque el autor no publica cifras de VRAM para esa variante.
- **Consumer GPU**: la variante 4-bit MLX está pensada para Macs con chip M-series; el modelo base de 4B en BF16 cabría en GPUs consumer con 12-16 GB de VRAM.
- **Despliegue**: `vllm-mlx serve ./KORMo-Web-4B-mlx-4bit --served-model-name KORMo-Web-4B --mllm --port 8000`, con API compatible con OpenAI. No activar `--enable-auto-tool-choice` ni `--reasoning-parser`, ya que el harness parsea el texto en bruto.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Online-Mind2Web EN | Online-Mind2Web KO | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| KORMo-Web-4B | 4B | no disponible | 42,3 | 42,3 | Apache-2.0 | Pesos abiertos (HF) |
| OpenWebRL-4B | 4B | no disponible | 32,7 | 15,4 | no disponible | Pesos abiertos |
| UI-TARS-1.5-7B | 7B | no disponible | 22,3 | 20,2 | no disponible | Pesos abiertos |
| Fara-1.5-4B | 4B | no disponible | 20,7 | 7,7 | no disponible | Pesos abiertos |

KORMo-Web-4B lidera la comparativa en ambas lenguas con el mismo tamaño que OpenWebRL-4B y Fara-1.5-4B, y supera a UI-TARS-1.5-7B pese a tener casi la mitad de parámetros.

## Limitaciones y advertencias

- **Idiomas**: solo coreano e inglés; no se garantiza comportamiento en castellano ni en otras lenguas.
- **Dependencia de capturas**: al no usar DOM, errores de renderizado, ventanas superpuestas o contenido fuera de viewport pueden degradar el rendimiento.
- **Riesgo de alucinación de acciones**: el modelo puede declarar una tarea completada sin haberla verificado correctamente; se recomienda validación externa en producción.
- **Tasa de éxito del 42,3%**: en tareas en vivo, más de la mitad de las ejecuciones fallan; no es adecuado para flujos críticos sin supervisión humana.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; hereda los del corpus Qwen3.5 y de los sitios web usados en entrenamiento.
- **Contexto**: la longitud de contexto no está publicada; planificar con margen para tareas largas.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B y de los datos de entrenamiento publicados.
- **Variante MLX**: atada a Apple Silicon; para producción en servidores NVIDIA hay que usar el repositorio base completo, no esta cuantización.
- **Fecha de creación**: el repositorio está fechado en 2026-11-17, con 0 descargas y 0 likes en el momento de la consulta; ecosistema aún incipiente.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/KORMo-VL/KORMo-Web-4B-mlx-4bit
- Modelo base: https://huggingface.co/KORMo-VL/KORMo-Web-4B
- Demo en vídeo: https://huggingface.co/KORMo-VL/KORMo-Web-4B/resolve/main/assets/gui_final_demo_dubbed.mp4
- vllm-mlx: https://github.com/waybarrios/vllm-mlx
- Harness de referencia: `examples/agent_playwright.py` en el repositorio del modelo base
- System prompt y esquema de herramientas: `system_prompt.md`, `tools.json`, `HARNESS.md` en el repositorio del modelo base
