# manuelgscom/dale-0.8b-GGUF

## Resumen

dale-0.8b es un ajuste completo (full fine-tune) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por Manuel García (manuelgscom), que traduce una petición en lenguaje natural —en castellano o en inglés— a un único comando bash para Linux, devuelto como un objeto JSON pequeño con el comando y una explicación breve. No es un modelo de chat general: está entrenado exclusivamente para ese contrato de entrada/salida, con dos turnos (un system prompt fijo y el mensaje del usuario) y el modo de razonamiento del template de Qwen3.5 desactivado.

El modelo es el motor de `dale`, una herramienta de línea de comandos offline que lo ejecuta en CPU mediante llama.cpp dentro de un único binario nativo. La separación de responsabilidades es deliberada: el modelo propone el comando y un verificador determinista escrito en C++ clasifica el riesgo (safe, caution, danger) mirando solo el texto del comando, de modo que la salida del modelo nunca fija el nivel de peligrosidad.

Su relevancia práctica está en la relación entre tamaño y rendimiento: con 752 millones de parámetros y un GGUF de 529 MB en Q4_K_M (con imatrix) alcanza un 79,4 % de acierto (374/471) en el test v2 del propio autor, frente al 62,8 % que declara para Qwen3.5-9B y Gemma 4 E4B-it sin ajustar, con una latencia mediana de 1,72 s por petición en la CPU de un portátil de gama media de 2020 (4 núcleos / 8 hilos), sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Qwen/Qwen3.5-0.8B; detalles de capas y atención no disponibles en la informacion proporcionada) |
| Parametros totales | 752.393.024 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M con imatrix (unico archivo publicado) |
| Idiomas soportados | es, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`dale-0.8b-1.0.0-Q4_K_M.gguf`, 529.297.952 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se ha sometido a un ajuste completo (no LoRA ni adaptadores) para una tarea única: dado un contexto de sistema operativo, distribución, gestor de paquetes y herramientas instaladas, más la petición del usuario, emitir exactamente un JSON con los campos `type` (`command`, `refuse` o `unsure`), `command` y `explanation`. El prompt es el chat template de Qwen3.5 con `enable_thinking=False`, `add_generation_prompt=True`, sin ejemplos few-shot y con el mensaje de usuario limitado a 1000 bytes y espacios colapsados. El modelo no fue entrenado como chat general y, según el autor, solo responde correctamente a ese contrato (versión 2).

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación destacable no está en la arquitectura, sino en el diseño del sistema: el modelo se limita a proponer el comando y devuelve `refuse` cuando la petición no es una tarea de shell y `unsure` cuando es ambigua, en lugar de inventar una instrucción; la evaluación de riesgo se delega en reglas deterministas en C++ independientes del modelo. El autor indica además que los tensores del GGUF publicado son idénticos al archivo evaluado y que solo se añadieron metadatos `general.*` (nombre, autor, URL, versión, licencia, modelo base).

## Capacidades

- Generación de un único comando bash para Linux a partir de una petición en castellano o inglés.
- Salida estructurada en JSON con el comando y una explicación de una frase en el idioma de la petición.
- Abstención explícita: `refuse` ante peticiones que no son tareas de shell y `unsure` ante ambigüedad.
- Adaptación al entorno descrito en el contexto (sistema operativo, distribución, gestor de paquetes, herramientas instaladas).
- Inferencia local en CPU sin red, sin cuentas, sin claves de API y sin telemetría tras la primera descarga del modelo.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento extenso; el thinking del modelo base se desactiva en el prompt.

## Casos de uso

- Asistente de terminal para desarrolladores: el usuario describe en lenguaje natural lo que quiere hacer («buscar los diez archivos más grandes del directorio actual») y `dale` muestra el comando propuesto, su explicación y el nivel de riesgo antes de ejecutarlo.
- Formación y onboarding en Linux: en modo `suggest` el modelo nunca ejecuta nada, por lo que sirve para que perfiles junior aprendan la sintaxis de bash viendo la propuesta y su explicación al lado.
- Automatización con supervisión en pipelines: en modo `confirm` o `auto` (solo comandos clasificados como safe) puede integrarse en scripts internos de operaciones para traducir peticiones de lenguaje natural a comandos auditables.
- Entornos aislados o sin conectividad: al ejecutarse sobre llama.cpp en CPU y no realizar peticiones de red tras la descarga, encaja en máquinas air-gapped, servidores de laboratorio o portátiles modestos donde no hay GPU ni acceso a APIs externas.
- Generación de documentación y runbooks: el par comando + explicación de una frase se puede registrar como traza de auditoría de qué se propuso y por qué en cada operación.
- Prototipado de interfaces nl2bash: al ser un GGUF de 529 MB con un contrato de prompt documentado, sirve como base para experimentar con wrappers propios que necesiten salida JSON estricta y abstención ante ambigüedad.
- Herramienta de escritorio ligera: cualquier aplicación que quiera ofrecer «escribe lo que quieres hacer» sin depender de un servicio en la nube puede embeberlo con llama.cpp y un consumo de disco inferior a 1 GB.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (`model-index` de la model card; la métrica figura como no verificada).

| Benchmark | Metrica | Resultado |
|---|---|---|
| dale bash test v2 (split test, 471 casos) | Accuracy | 79,4 % (374/471) |

Comparaciones incluidas en la model card, sin ajuste fino (zero-shot) sobre el mismo test:

| Modelo | Accuracy declarada |
|---|---|
| dale-0.8b (este modelo) | 79,4 % |
| Qwen3.5-9B | 62,8 % |
| Gemma 4 E4B-it | 62,8 % |

Rendimiento medido por el autor: 1,72 s de mediana por petición en la CPU de un portátil de gama media de 2020 (4 núcleos / 8 hilos), sin GPU; aproximadamente 1 s por petición en la CPU de un sobremesa. No se han publicado datos de throughput (tokens/s) ni resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Inferencia en CPU: es el escenario objetivo. Funciona en un procesador de 4 núcleos / 8 hilos de 2020 con 1,72 s de mediana por petición; el binario de `dale` está pensado para ejecutarse sin GPU.
- RAM estimada: alrededor de 1 GB libre para cargar el GGUF de 529 MB junto con el contexto de llama.cpp (estimación a partir del tamaño del archivo; no publicada por el autor).
- VRAM estimada: inferior a 1 GB si se descargan todas las capas en GPU; cualquier GPU de consumo con 2 GB o más puede alojarlo completo (por ejemplo GTX 1650, RTX 3050, RTX 4060, RTX 4090). No se han publicado mediciones de latencia en GPU.
- GPU de datacenter (A100, H100): sobredimensionadas para este modelo; no aportan ventaja frente a CPU para una carga de una sola petición corta.
- Despliegue: llama.cpp (runtime de referencia del proyecto), el propio CLI `dale` con el modelo empaquetado en un binario nativo, y cualquier otro runtime compatible con GGUF. El soporte de vLLM u OVMS para este archivo concreto no está documentado en la información disponible.
- Almacenamiento: 0,5 GB de repositorio; un único archivo de pesos de 529 MB.
- Latencia: 1,72 s de mediana por petición en CPU de portátil de 2020, ~1 s en CPU de sobremesa. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en dale bash test v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dale-0.8b | 752 M | no disponible | 79,4 % (con ajuste fino) | Apache-2.0 | GGUF Q4_K_M en HuggingFace |
| Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Qwen3.5-9B | ~9 B | no disponible | 62,8 % (sin ajuste fino) | no disponible en la informacion proporcionada | HuggingFace |
| Gemma 4 E4B-it | no disponible | no disponible | 62,8 % (sin ajuste fino) | no disponible en la informacion proporcionada | HuggingFace |

La comparación relevante es de eficiencia: un modelo de 752 M ajustado para una tarea estrecha supera en ese test a modelos de mayor tamaño usados en zero-shot, a costa de perder cualquier capacidad de propósito general.

## Limitaciones y advertencias

- Tasa de error aproximada del 20,6 % (97 de 471 casos fallidos) en el test v2 del propio autor: el comando propuesto debe revisarse siempre antes de ejecutarlo.
- El benchmark lo declara el autor y figura como no verificado (`verified: false`); no hay evaluación independiente publicada.
- No es un modelo de chat general: fuera del contrato de prompt (JSON con `type`, `command`, `explanation`) su comportamiento no está garantizado.
- Emite un solo comando por petición; no resuelve tareas que requieran pipelines multi-paso razonados por el modelo.
- Solo cubre bash para Linux; no hay soporte declarado de PowerShell, zsh, macOS ni otros shells.
- Solo castellano e inglés; no se declaran otros idiomas.
- El modelo no evalúa el riesgo. Cualquier confianza en la clasificación safe/caution/danger depende del verificador determinista de `dale`, no del modelo, y lo que ese verificador no puede analizar se clasifica como mínimo como caution.
- Entrada limitada a 1000 bytes en el mensaje de usuario, con espacios colapsados; peticiones largas o con formato sensible se degradan.
- Riesgo de alucinación de opciones o flags inexistentes, propio de un modelo de 752 M; el diseño del sistema lo mitiga con abstención (`refuse`/`unsure`), no lo elimina.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo `LICENSE`; conviene verificar las condiciones del modelo base Qwen3.5-0.8B, no detalladas en la información disponible.
- En producción, los comandos peligrosos exigen escribir una palabra de confirmación (`ejecutar`/`run`) en todos los modos; cualquier integración que evite ese paso elimina la principal barrera de seguridad del sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/manuelgscom/dale-0.8b-GGUF
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Codigo fuente del CLI `dale`: https://github.com/manuelgscom/dale
- Web del autor: https://manuelgs.com
- Dataset de evaluacion `manuelgscom/dale-bash-test-v2`: https://huggingface.co/datasets/manuelgscom/dale-bash-test-v2
- Demo en video: https://huggingface.co/manuelgscom/dale-0.8b-GGUF/resolve/main/media/demo.mp4
- Demo de seguridad en video: https://huggingface.co/manuelgscom/dale-0.8b-GGUF/resolve/main/media/safety.mp4
