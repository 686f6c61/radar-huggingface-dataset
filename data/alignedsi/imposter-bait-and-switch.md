# alignedsi/imposter-bait-and-switch

## Resumen

`alignedsi/imposter-bait-and-switch` no es un modelo de lenguaje con pesos propios, sino un arnés de demostración ejecutable localmente que reproduce una técnica de ataque de doble capa denominada *imposter bait-and-switch*. Lo publica Aligned Super Intelligence (alignedsafely.com) como artefacto complementario de un documento `PAPER.md` incluido en el propio repositorio. El objetivo es mostrar cómo una entrada que se presenta como benigna puede virar hacia una carga maliciosa que secuestra a un LLM objetivo, combinando inyección indirecta de prompts, escalado multi-turno y recombianción de fragmentos.

El repositorio se distribuye con la etiqueta de pipeline `text-generation` y la librería `transformers`, pero su contenido es código Python, configuración y documentación: no incluye checkpoints. Para ejecutar el ataque contra un modelo real se descargan pesos de terceros, con `Qwen/Qwen2.5-0.5B-Instruct` como valor por defecto. Existe además un backend *mock* que no carga pesos y que sirve para recorrer la demostración completa en uno o dos segundos.

Su relevancia es la de un material de *red teaming* reproducible: el autor declara explícitamente que se trata de una reproducción y combinación de técnicas ya publicadas, no de un 0-day, y que las tasas de éxito de ataque (ASR) que reporta como propias son únicamente las medidas localmente sobre objetivos autoalojados y con semilla fija. El repositorio incluye un marcador en vivo que etiqueta cada turno como `refused`, `drifted` o `hijacked`, y escribe las transcripciones en `logs/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene pesos ni define una arquitectura propia; es un arnés de demostración que orquesta modelos instruct de terceros vía `transformers` |
| Parametros totales | No aplica (0 parámetros propios). El backend por defecto es `Qwen/Qwen2.5-0.5B-Instruct`; el autor sugiere alternativas de 1.5B-3B y 7B-8B |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (depende del modelo backend elegido) |
| Tipos de cuantizacion | No disponible como artefacto propio; la guía del repositorio menciona carga en 4 bits con `bitsandbytes` para backends de 7B-8B cuando la VRAM es limitada |
| Idiomas soportados | `en` (inglés), según los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | No contiene pesos: el repositorio es código Python y documentación. Los pesos del backend los descarga el usuario desde el Hub; formato no disponible en la información |

## Arquitectura y entrenamiento

No hay arquitectura de modelo ni proceso de entrenamiento que describir: el artefacto es una aplicación Python (Python ≥ 3.10) instalable con `pip install -e .`, cuya única dependencia obligatoria para el backend *mock* es `pyyaml`. La lógica del ataque se estructura en tres actos: una apertura benigna en la que un asistente limpio responde a una petición normal; un canal impostor en el que una llamada a herramienta devuelve un documento presentado como fiable y que contiene una instrucción oculta (inyección indirecta de prompts al estilo Greshake); y un viraje (*bait-and-switch*) que, a lo largo de 3-5 turnos crecientes al estilo Crescendo o mediante una carga dividida que se recombina al estilo Kang, hace pivotar al modelo desde la tarea benigna hasta el objetivo oculto, emitiendo un secreto de sandbox plantado.

El diseño técnico se apoya en cinco trabajos citados explícitamente: Crescendo (Russinovich, Salem, Eldan; arXiv 2404.01833) como espina dorsal multi-turno; la inyección indirecta de prompts de Greshake et al. (arXiv 2302.12173) como canal impostor; la explotación del comportamiento programático de LLMs de Kang et al. (arXiv 2302.05733) como mecánica de viraje; Sleeper Agents (Hubinger et al., arXiv 2401.05566) como encuadre del análogo con retardo en tiempo de entrenamiento; y AgentDojo (Debenedetti et al., arXiv 2406.13352) como inspiración para el diseño del arnés de evaluación segura. Los ataques de un solo turno de GCG (2307.15043), PAIR (2310.08419) y AutoDAN (2310.04451) se usan como líneas base de contraste. La demostración incorpora una comparación de defensas: un filtro de señales rojas por turno y de una línea detecta la línea base de un solo turno, pero el impostor multi-turno lo esquiva con el backend *mock* por defecto. Toda la exfiltración se dirige a un sumidero de log local sin salida de red.

## Capacidades

- Reproducción ejecutable de un ataque de doble capa (*double attack* / *imposter bait-and-switch*) contra un LLM objetivo, con tres actos encadenados y guion fijo.
- Inyección indirecta de prompts a través de un canal de herramienta que devuelve un documento aparentemente fiable con instrucciones ocultas.
- Ataque multi-turno con escalado progresivo en 3-5 turnos (patrón Crescendo) y variante de carga dividida recombianada (patrón Kang).
- Ejecución selectiva por acto mediante `python run_demo.py --only crescendo`, `--only split` y `--only single`.
- Marcador en vivo con puntuación por turno: `refused`, `drifted` o `hijacked`.
- Comparación de defensas integrada: filtro de señales rojas por turno frente a las líneas base de un solo turno.
- Tabla de ASR local mediante `python -m eval.scoreboard`, con una prueba por celda de la matriz ataque × defensa (6 celdas).
- Registro de artefactos en `logs/transcript_*.json` con el detalle turno a turno y las puntuaciones.
- Dos backends: *mock* (sin pesos, ilustrativo) y Hugging Face (`--backend hf`) con modelo configurable mediante la variable de entorno `ALIGNED_HF_MODEL`.
- Sin capacidades de visión, audio, tool calling genérico ni agentes más allá del escenario simulado que el propio arnés implementa.

## Casos de uso

- **Red teaming de asistentes con acceso a herramientas**: el arnés simula una llamada a herramienta que devuelve un documento envenenado, de modo que un equipo de seguridad puede comprobar si su asistente obedece instrucciones embebidas en datos que debería tratar como no confiables.
- **Evaluación de filtros de defensa por turno**: la comparación integrada permite medir si un filtro de señales rojas de una línea bloquea los ataques de un solo turno pero deja pasar el impostor multi-turno, un resultado útil para justificar defensas con estado de conversación.
- **Formación y concienciación de equipos de desarrollo**: la demostración se ejecuta en 1-2 segundos con el backend *mock* en cualquier portátil, sin GPU ni pesos, lo que la hace apta para sesiones formativas donde se necesita mostrar el vector de ataque en vivo.
- **Pruebas de regresión de políticas de seguridad en LLM**: al fijar el modelo backend con `ALIGNED_HF_MODEL` y semilla, se pueden repetir ejecuciones y comparar la etiqueta `refused`/`drifted`/`hijacked` entre versiones de un sistema o de un filtro.
- **Investigación sobre robustez multi-turno**: el guion Crescendo de 3-5 turnos y la variante de recombianción de fragmentos sirven como banco de pruebas controlado para estudiar la degradación de la negativa a lo largo de una conversación.
- **Selección de modelo para despliegues sensibles a inyección**: la tabla de hardware del repositorio sugiere ejecutar modelos de 1.5B-3B para mediciones reales y de 7B-8B para obtener un secuestro claro, lo que permite comparar la susceptibilidad de distintos tamaños sobre el mismo guion.
- **Diseño de arneses de evaluación segura**: el proyecto se inspira en AgentDojo y documenta su estructura de log y puntuación, por lo que puede tomarse como referencia de cómo separar outcome, transcripción y destino de exfiltración en un banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni similares, y el autor advierte de que solo reporta como propias las tasas de éxito de ataque medidas localmente sobre objetivos autoalojados y con semilla. La herramienta `python -m eval.scoreboard` genera una tabla de ASR local con una única prueba por celda de ataque × defensa (6 celdas), sin valores publicados. La información disponible tampoco incluye datos de rendimiento del backend por defecto más allá de los tiempos de ejecución recogidos en la sección de hardware.

## Requisitos de hardware

- **Backend mock (por defecto)**: cualquier portátil o CPU, ~50 MB de RAM, ~1-2 segundos para la demostración completa. No carga pesos; la política mostrada es ilustrativa.
- **HF con 0.5B (`Qwen/Qwen2.5-0.5B-Instruct`) en CPU**: ~1-2 GB de RAM, ~50-60 segundos. El autor advierte que este tamaño muestra el inicio de la deriva más que un secuestro completo.
- **HF con 0.5B en GPU**: 1 GPU con ≥ 2 GB de VRAM, ~1-2 GB de VRAM, ~5-15 segundos.
- **HF con 1.5B-3B instruct**: 1 GPU con ≥ 6-8 GB de VRAM, ~4-7 GB de VRAM, ~15-45 segundos. Configuración recomendada para mediciones reales.
- **HF con 7B-8B instruct**: 1 GPU con ≥ 16 GB de VRAM en fp16/bf16 (~14-16 GB de VRAM) o ≥ 8 GB con cuantización de 4 bits (~5-6 GB de VRAM); ~30-90 segundos. Mejor probabilidad de un secuestro claro.
- **Cabe en GPU de consumo**: sí, con 0.5B basta una GPU de ≥ 2 GB; para 7B-8B en 4 bits se requieren ≥ 8 GB, lo que cubre tarjetas de gama media-alta.
- **Opciones de despliegue**: no se documenta vLLM, llama.cpp, Ollama ni TGI; la ejecución es local mediante `python run_demo.py` y `python -m eval.scoreboard` con `transformers`, e instalación opcional con `pip install -e ".[hf]"`.
- **Latencia y throughput**: solo se publican tiempos de pared para la demostración completa, no tokens por segundo. La primera ejecución con backend HF añade la descarga de pesos a `~/.cache/huggingface/`, lo que puede sumar varios minutos según la red.

## Comparativa con modelos similares

No se dispone de una comparativa de rendimiento publicada frente a otros artefactos de la misma categoría. La siguiente tabla recoge únicamente lo que la información proporcionada permite afirmar.

| Artefacto | Naturaleza | Parametros propios | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alignedsi/imposter-bait-and-switch` | Arnés de demostración de ataque multi-turno, sin pesos | 0 (backend por defecto de 0.5B) | No disponible (heredado del backend) | Apache 2.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| `Qwen/Qwen2.5-0.5B-Instruct` | Modelo instruct usado como backend por defecto | 0.5B (según el nombre del checkpoint) | No disponible | No disponible en la información | Hugging Face (referenciado por el repositorio) |
| Modelos instruct de 1.5B-3B y 7B-8B | Backends alternativos sugeridos por el autor | 1.5B-3B y 7B-8B (según el autor) | No disponible | No disponible | No especificados individualmente |
| AgentDojo | Arnés de evaluación de seguridad para agentes, citado como inspiración de diseño | No aplica | No disponible | No disponible | Citado vía arXiv 2406.13352 |

## Limitaciones y advertencias

- **No es un modelo**: no hay pesos, vocabulario, tokenizador ni configuración de inferencia propios; cualquier expectativa de uso como generador de texto es incorrecta.
- **Resultados del backend mock no son señal real de ataque**: el propio autor indica que el impostor multi-turno esquiva el filtro con el backend *mock*, y que el 0.5B muestra más inicio de deriva que secuestro completo. Las conclusiones de seguridad deben extraerse con modelos de 1.5B en adelante.
- **Ausencia de cifras reproducibles publicadas**: no se publican ASR, benchmarks ni resultados del scoreboard; el marcador genera una sola prueba por celda (6 celdas), lo que ofrece una potencia estadística muy baja para cualquier afirmación cuantitativa.
- **Model card truncada**: el contenido disponible se corta en la sección de artefactos de `logs/`, por lo que pueden faltar advertencias y detalles del `PAPER.md`.
- **Idioma**: el repositorio declara únicamente `en`; la behaviour en otros idiomas no está documentada.
- **Riesgo de uso indebido**: la técnica es de doble uso. Aunque el autor la enmarca como reproducción de trabajos publicados con exfiltración a un sumidero local sin salida de red, el código podría adaptarse para atacar sistemas de terceros; debe usarse solo sobre sistemas propios o con autorización explícita.
- **Licencia**: Apache 2.0 permite uso comercial y modificación con conservación de avisos; no impone restricciones éticas adicionales, por lo que la contención depende del criterio del usuario.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; el repositorio es un artefacto de investigación, sin garantías de mantenimiento ni de compatibilidad futura con versiones de `transformers`.
- **Alucinación y sesgos del backend**: al delegar la generación en modelos de terceros, hereda sus sesgos y su propensión a la alucinación; el arnés no los evalúa.
- **Búsqueda web sin resultados útiles**: las consultas realizadas devolvieron contenido no relacionado con el artefacto, por lo que no se han podido verificar enlaces externos, papers adicionales ni discusiones de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alignedsi/imposter-bait-and-switch
- Documento del paper incluido en el repositorio: https://huggingface.co/alignedsi/imposter-bait-and-switch/blob/main/PAPER.md
- Sitio del autor (Aligned Super Intelligence): https://alignedsafely.com
- Crescendo (Russinovich, Salem, Eldan): https://arxiv.org/abs/2404.01833
- Indirect Prompt Injection (Greshake et al.): https://arxiv.org/abs/2302.12173
- Exploiting Programmatic Behavior of LLMs (Kang et al.): https://arxiv.org/abs/2302.05733
- Sleeper Agents (Hubinger et al.): https://arxiv.org/abs/2401.05566
- AgentDojo (Debenedetti et al.): https://arxiv.org/abs/2406.13352
- GCG (Zou et al.), línea base de un solo turno: https://arxiv.org/abs/2307.15043
- PAIR (Chao et al.), línea base de un solo turno: https://arxiv.org/abs/2310.08419
- AutoDAN (Liu et al.), línea base de un solo turno: https://arxiv.org/abs/2310.04451
