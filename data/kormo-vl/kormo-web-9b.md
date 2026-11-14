# KORMo-VL/KORMo-Web-9B

## Resumen

KORMo-Web-9B es un modelo de visión-lenguaje de 9.000 millones de parámetros especializado en actuar como agente de navegador web. Desarrollado por KORMo-VL, parte del modelo base Qwen3.5-9B y se ha afinado sobre datos a gran escala de comprensión web y trayectorias de navegación reales. Su función es completar tareas de navegador a partir únicamente de capturas de pantalla: lee la petición del usuario y el estado de la pantalla, razona en un bloque `<think>` y emite una acción de navegador cada vez de un conjunto fijo de 22 herramientas.

La propuesta diferencial es el anclaje visual estricto: el modelo no recibe DOM ni árbol de accesibilidad, sino solo la captura de pantalla. Cada acción de puntero se expresa como coordenadas normalizadas a un rango de 0 a 1000 sobre la imagen, lo que permite verificar cada paso contra la siguiente observación. Está pensado para tareas largas y multisitio, con soporte nativo de pestañas, búsqueda en página, arrastrar para copiar y carga de archivos.

Su relevancia actual reside en el auge de los agentes de computer-use y en la escasez de modelos abiertos con licencia permisiva (Apache 2.0) para esta tarea, especialmente con cobertura nativa de coreano además de inglés. El contexto declarado en el ejemplo de despliegue es de 131.072 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basada en Qwen3.5-9B |
| Parametros totales | 9.000 millones (9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (según el ejemplo de `vllm serve --max-model-len 131072`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB en el momento de la consulta; librería `transformers`) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer multimodal de tipo vision-lenguaje, y se afina para la tarea de agente web. La entrada es una captura de pantalla junto con metadatos textuales de la observación (tamaño de pantalla, pestaña activa, URL, pestañas disponibles) y la petición del usuario; la salida es un bloque de razonamiento `<think>` seguido de una única llamada de herramienta en formato XML `<tool_call>` con parámetros tipados. El conjunto de herramientas es fijo y consta de 22 acciones de navegador, incluidas `click`, `new_tab`, `switch_tab`, `close_tab`, búsqueda en página, arrastrar para copiar y `upload` para selectores de archivos.

El entrenamiento se realizó sobre datos a gran escala de comprensión web y trayectorias web. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacable es el esquema de anclaje por coordenadas normalizadas (0-1000 sobre la captura), que evita depender del DOM o del árbol de accesibilidad y hace que cada acción sea verificable contra la observación siguiente. El prompt de sistema instruye explícitamente al modelo a comprobar el resultado de cada acción en la siguiente observación antes de continuar.

## Capacidades

- Generación de acciones de navegador a partir de capturas de pantalla, sin acceso a DOM ni a árbol de accesibilidad.
- Razonamiento explícito en modo thinking mediante bloques `<think>` antes de cada acción.
- Tool calling en formato XML con 22 herramientas de navegador predefinidas.
- Gestión de pestañas: creación, cambio y cierre (`new_tab`, `switch_tab`, `close_tab`).
- Búsqueda dentro de la página, arrastrar para copiar y carga de archivos en selectores (`upload`).
- Ejecución de tareas multisitio y de varios pasos en una misma sesión.
- Robustez ante variación de formulación: acepta tanto comandos cortos como peticiones largas y conversacionales.
- Capacidades multilingües limitadas a coreano e inglés.
- Comprensión de imágenes de interfaz (capturas de pantalla) como única fuente de estado visual.

## Casos de uso

- Automatización de tareas de navegador de extremo a extremo: el modelo recibe la captura y la petición, y emite acciones sucesivas verificadas contra cada nueva observación, lo que encaja en pipelines de agentes con Playwright.
- Asistentes de investigación multisitio: consultar una fuente (por ejemplo, un chatbot), contrastar un dato en un portal institucional y volcar el resultado en una herramienta de notas, todo en una sola sesión y con contexto de 131.072 tokens.
- Rellenado de formularios web y cargas de archivos: las herramientas de click por coordenadas y `upload` permiten completar formularios y adjuntar documentos en flujos administrativos.
- Soporte en coreano para mercados locales: al cubrir ko de forma nativa, es adecuado para automatizar portales, intranets y servicios surcoreanos donde otros agentes abiertos rinden peor.
- Extracción y consolidación de información entre pestañas: el uso de `new_tab`, `switch_tab` y arrastrar para copiar facilita mover datos entre sitios sin intervención manual.
- Pruebas de regresión de interfaces web: el agente puede ejecutar guiones de navegación sobre builds de staging y verificar visualmente el resultado de cada paso.
- Despliegue self-hosted con licencia permisiva: al ser Apache 2.0 y servirse con vLLM mediante API compatible con OpenAI, se integra en infraestructura propia sin restricciones de uso comercial.

## Benchmarks y rendimiento

| Benchmark | Tareas | Aciertos | Tasa de éxito |
|---|---:|---:|---:|
| Online-Mind2Web (EN) | 300 | 153 | 51,0 |
| Online-Mind2Web (KO) | 312 | 150 | 48,1 |

Evaluado sobre sitios web en vivo. La variante KO es una versión coreana de Online-Mind2Web. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 9B en precisión de 16 bits se requiere aproximadamente 18 GB solo para pesos, más el coste de la torre visual y la caché KV para contextos largos.
- El ejemplo oficial usa vLLM con `--gpu-memory-utilization 0.90` y `--max-model-len 131072`, lo que implica memoria adicional significativa para la caché KV a contexto completo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una A100 o H100 de 80 GB permite servir el contexto máximo con holgura; una RTX 4090 de 24 GB puede alojar los pesos en 16 bits pero limita fuertemente la longitud de contexto.
- En GPU de consumo: viable en RTX 4090 o superiores con cuantización, aunque el autor no publica recetas de cuantización ni pesos GGUF.
- Opciones de despliegue: vLLM documentado oficialmente con API compatible con OpenAI; se incluye un arnés de Playwright en `examples/agent_playwright.py`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Idiomas | Licencia |
|---|---|---|---|---|---|
| KORMo-Web-9B | 9B | 131.072 | Agente web por captura de pantalla | ko, en | Apache 2.0 |
| Qwen3.5-9B (base) | 9B | no disponible | Modelo multimodal generalista | no disponible | no disponible |
| Alternativas de agente web abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Dependencia exclusiva de la captura de pantalla: sin DOM ni árbol de accesibilidad, la precisión depende de la calidad y resolución de la imagen y del esquema de coordenadas normalizadas.
- Tasa de éxito moderada: 51,0 en Online-Mind2Web (EN) y 48,1 en KO implican que aproximadamente la mitad de las tareas fallan en entornos reales.
- Cobertura lingüística limitada a coreano e inglés; el rendimiento en otros idiomas no está evaluado.
- No se detallan sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinación en la interpretación de la pantalla y en la planificación de pasos; el propio diseño mitiga esto exigiendo verificación en la observación siguiente.
- El repositorio figura con 0.0 GB y 0 descargas en el momento de la consulta, por lo que la disponibilidad efectiva de los pesos no está confirmada.
- No se documentan cuantizaciones oficiales ni soporte en llama.cpp u Ollama, lo que limita el despliegue en hardware de consumo.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar los términos del modelo base Qwen3.5-9B antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KORMo-VL/KORMo-Web-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Arnés de ejemplo: `examples/agent_playwright.py` dentro del repositorio del modelo
- Prompt de sistema y definición de herramientas: `system_prompt.md` y `tools.json` en el repositorio del modelo
- Paper, blog o demo adicionales: no disponible
