# aijadugar/WisprFlow-clone

## Resumen

WisprFlow-clone es un Space de Hugging Face (SDK Gradio) publicado por el usuario aijadugar que implementa una pipeline de voz a texto limpio al estilo de Wispr Flow. No se trata de un modelo único, sino de una aplicación que orquesta dos modelos independientes: un modelo ASR basado en Whisper afinado para transcripción literal y un LLM afinado para la fase de limpieza y adaptación de tono. El repositorio actúa como punto de entrada de la demo; los pesos reales se cargan desde dos repositorios separados (`aijadugar/wispr-clone-whisper` y `aijadugar/wispr-clone-llm`) configurables mediante las variables de entorno `WHISPER_REPO_ID` y `LLM_REPO_ID`.

La propuesta técnica separa explícitamente la transcripción de la reescritura: el ASR transcribe de forma literal, incluyendo disfluencias, y toda la corrección (eliminación de muletillas, arreglo gramatical, adaptación de tono a modos email/chat/notes) ocurre en la etapa LLM bajo un system prompt explícito. Esa separación de responsabilidades es el argumento de diseño central del autor frente a herramientas de dictado que "corrigen" durante la transcripción y pueden alterar el contenido dicho.

El repositorio no incluye pesos, no declara licencia, no declara idiomas y no publica métricas de evaluación. La información disponible se limita a la model card del Space y a los metadatos de Hugging Face (0 descargas, 0 likes, creado el 2026-11-14). Cualquier dato de arquitectura, tamaño o rendimiento de los modelos subyacentes debe consultarse en los repositorios `wispr-clone-whisper` y `wispr-clone-llm`, que no forman parte de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: ASR basado en Whisper afinado + LLM afinado para reescritura |
| Parametros totales | no disponible (depende de los repositorios `wispr-clone-whisper` y `wispr-clone-llm`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el Space no contiene pesos; se cargan desde los repositorios remotos) |
| SDK de la demo | Gradio 6.26.0 |
| Version de Python | 3.10 |
| Fichero de entrada | app.py |
| Variables de entorno | `WHISPER_REPO_ID`, `LLM_REPO_ID` |
| Hardware de entrenamiento declarado | Kaggle T4 x2 (cuota gratuita) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La aplicación no define una arquitectura de modelo propia, sino una topología de dos componentes encadenados. La primera etapa es un modelo ASR descrito como "fine-tuned Whisper" cuya única función es la transcripción literal del audio, incluyendo disfluencias y arranques en falso; el autor insiste en que no reescribe contenido. La segunda etapa es un LLM afinado que recibe la transcripción literal y aplica la limpieza: eliminación de muletillas, corrección gramatical y adaptación del tono al modo seleccionado (email, chat o notes). Toda la reescritura queda confinada a esta etapa y se controla mediante un system prompt explícito, lo que hace el comportamiento auditable.

El entrenamiento de ambos modelos se realiza, según la model card, mediante un cuaderno complementario (`wf-voice-to-clean-text.ipynb`) diseñado para ejecutarse en la cuota gratuita de GPU T4 x2 de Kaggle. El cuaderno cubre el pipeline completo de fine-tuning y publicación en el Hub. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se detalla la variante concreta de Whisper utilizada (tiny, base, small, medium, large) ni el modelo base del LLM de limpieza.

## Capacidades

- Transcripción de voz a texto literal mediante un modelo ASR derivado de Whisper, preservando disfluencias y arranques en falso.
- Reescritura posterior de la transcripción: eliminación de muletillas, corrección gramatical y de puntuación.
- Adaptación de tono a tres modos predefinidos: email, chat y notes.
- Separación explícita entre transcripción y reescritura, con el comportamiento de limpieza gobernado por un system prompt visible y modificable.
- Despliegue como Space de Gradio o ejecución local mediante `python app.py`.
- Configuración de los modelos subyacentes mediante variables de entorno, lo que permite sustituir los repositorios por otras variantes.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo thinking en la información disponible.

## Casos de uso

- Dictado por voz con salida limpia para correo profesional: el usuario habla de forma natural y la etapa LLM elimina muletillas y ajusta el registro al modo email, produciendo un borrador listo para revisar antes de enviar.
- Redacción rápida de mensajes de chat: el modo chat adapta la salida a un tono conversacional y conciso, adecuado para mensajería instantánea donde el dictado literal resultaría demasiado verboso.
- Toma de notas en reuniones: el modo notes conserva la estructura del contenido hablado y elimina el ruido verbal, generando apuntes legibles a partir de una intervención oral.
- Accesibilidad para usuarios con movilidad reducida: la pipeline permite redactar texto sin teclado, con una etapa de limpieza que reduce el esfuerzo de edición posterior.
- Prototipado de asistentes de voz en producción: el código del Space sirve como referencia para separar ASR y postprocesado LLM en una arquitectura de dos etapas auditable.
- Evaluación de la calidad de transcripción frente a reescritura: al conservar la transcripción literal, el sistema permite comparar ambas salidas y medir cuánto contenido modifica la etapa de limpieza.
- Despliegue local o en un Space propio con modelos alternativos: las variables `WHISPER_REPO_ID` y `LLM_REPO_ID` permiten apuntar a otros repositorios afinados sin tocar el código de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER para la etapa ASR, ni evaluaciones de fidelidad o calidad de reescritura para la etapa LLM, ni comparaciones con Wispr Flow u otras herramientas de dictado.

## Requisitos de hardware

- VRAM estimada: no disponible, al depender del tamaño de los modelos referenciados en `wispr-clone-whisper` y `wispr-clone-llm`.
- GPU recomendadas: no disponible. La model card solo indica que el entrenamiento se diseñó para Kaggle T4 x2 (2 x 16 GB).
- Viabilidad en GPU de consumo: no confirmada. La model card señala que la CPU funciona pero la etapa LLM será "notablemente más lenta", sin cuantificar la latencia.
- Opciones de despliegue: Gradio (SDK 6.26.0, Python 3.10) como Space de Hugging Face o ejecución local con `pip install -r requirements.txt` y `python app.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor recomienda seleccionar un tier de GPU en el Space para baja latencia en la generación.

## Comparativa con modelos similares

| Modelo / producto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WisprFlow-clone (aijadugar) | Pipeline ASR + LLM | no disponible | no disponible | no disponible | Space Gradio público, 0 descargas |
| Whisper (OpenAI) | Modelo ASR | 39 M - 1.55 G según variante | 30 s de audio por ventana | MIT | Pesos abiertos en el Hub |
| Wispr Flow (producto comercial) | Herramienta de dictado | no disponible | no disponible | Propietaria | Producto SaaS de pago |

La comparación con Whisper es pertinente porque la etapa ASR del Space se declara derivada de él, pero no se especifica qué variante se afinó. La comparación con Wispr Flow es la referencia funcional del proyecto, aunque no se dispone de datos técnicos del producto comercial en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un Space que carga modelos desde otros repositorios. Sin acceso a `aijadugar/wispr-clone-whisper` y `aijadugar/wispr-clone-llm` no puede reproducirse.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni modificación. Verificar antes de cualquier uso en producción.
- Idiomas no declarados: se desconoce si la etapa ASR y la etapa LLM cubren el castellano o solo el inglés.
- Sin métricas publicadas: no hay WER, ni evaluaciones de fidelidad de la reescritura, ni comparaciones cuantitativas con alternativas.
- Riesgo de alteración de contenido en la etapa LLM: aunque el diseño separa transcripción y reescritura, el modelo de limpieza puede introducir cambios semánticos no deseados; el autor no documenta mecanismos de verificación.
- Dependencia de la calidad del ASR: errores de transcripción se propagan a la etapa de limpieza, que puede "corregirlos" de forma plausible pero incorrecta.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La model card no documenta sesgos, datos de entrenamiento ni procesos de alineación.
- El rendimiento en CPU se describe cualitativamente como lento, sin cifras de latencia.

## Enlaces

- Space en Hugging Face: https://huggingface.co/aijadugar/WisprFlow-clone
- Repositorio del modelo ASR (referenciado): https://huggingface.co/aijadugar/wispr-clone-whisper
- Repositorio del modelo LLM de limpieza (referenciado): https://huggingface.co/aijadugar/wispr-clone-llm
- Cuaderno de entrenamiento (referenciado en la model card): `wf-voice-to-clean-text.ipynb` (no se proporciona URL)
- Producto de referencia funcional: https://wisprflow.ai
