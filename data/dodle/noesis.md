# dodle/noesis

## Resumen

Noesis (publicado por el usuario `dodle` bajo el identificador `dodle/noesis`) no es un modelo de lenguaje en el sentido habitual, sino un agente Python con estado que selecciona acciones mediante reglas, objetivos, memoria y una política neuronal entrenada. El paquete incluye el motor `me.py`, utilidades de serialización de un formato propio llamado DODL, soporte para un GGUF con arquitectura personalizada `noesis`, y un controlador de demostración en navegador que mueve un píxel. El modelo de lenguaje es opcional: se delega en proveedores externos (OpenAI, Gemini u OpenAI-compatible) para generar las respuestas de texto, mientras que el agente controla las acciones.

El repositorio tiene un tamaño de 0,0 GB y el campo de parámetros en safetensors reporta 808, un valor que no corresponde a un transformer convencional y que debe interpretarse en el contexto de este formato propietario. No hay información sobre arquitectura transformer, longitud de contexto ni composición del dataset de entrenamiento. El modelo se distribuye con licencia MIT y acumula 360 descargas en Hugging Face.

Su relevancia es acotada y experimental: propone un patrón de agente con estado persistente, trazas de espacio de trabajo y un bucle de decisión separado de la generación de lenguaje. Es útil como referencia conceptual o para prototipos de agentes con memoria, pero no compite con modelos fundacionales en capacidades lingüísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente Python con estado; política neuronal entrenada para selección de acciones; red de controlador de píxel separada; formato GGUF con arquitectura personalizada `noesis` |
| Parametros totales | 808 (según campo safetensors del repo; no comparable a un transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el agente mantiene estado y memoria propios, sin ventana de contexto declarada) |
| Tipos de cuantizacion | F32 en el GGUF por defecto (`noe-model.F32.gguf`); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (las respuestas dependen del proveedor LLM externo configurado) |
| Licencia | MIT |
| Formato de pesos | DODL (estado completo: estado, memoria, reglas, comportamiento y red) y GGUF (solo tensores y dimensiones de la red) |

## Arquitectura y entrenamiento

El sistema se organiza en torno a `AIEngine`, que en cada paso lee la entrada y el estado actual, elige una acción, la ejecuta y actualiza el modelo. Las reglas y los objetivos elegibles pueden tener prioridad sobre la red neuronal. Las acciones disponibles para la política entrenada son `rest`, `explore`, `learn` y `observe`; los modelos sin entrenar conservan sus reglas y comportamiento por defecto. El motor registra además una instantánea de espacio de trabajo con el foco, el objetivo activo, la expectativa y el resultado, descrita explícitamente como una traza de software y no como evidencia de experiencia subjetiva. Las señales `novelty`, `stress`, `recovery` y `arousal` son valores acotados de software, no medidas biológicas.

El entrenamiento de la política de acciones se lanza con `python3 me.py --train-actions --seed 123` y genera `noe-action-model.dodl` junto con un GGUF asociado. Se entrena sobre una política generada y selecciona checkpoints con 100 escenarios de validación fijos; la evaluación reporta además resultados sobre 100 escenarios reservados, con precisión y soporte por acción, sin que esos resultados influyan en la selección. Los parámetros `--samples`, `--epochs`, `--patience`, `--output` y `--seed` permiten ajustar la ejecución. La model card advierte que las etiquetas generadas se definen con la misma política de umbrales que la línea base de reglas, por lo que una puntuación perfecta de `rule_baseline_accuracy` es esperable y debe contrastarse con escenarios reales antes de preferir la política neuronal. El controlador de píxel se entrena por separado con `--train-pixel` y escribe `noe-pixel-model.dodl`.

## Capacidades

- Selección de acciones con estado persistente entre pasos (`rest`, `explore`, `learn`, `observe`) mediante reglas, objetivos y política neuronal.
- Exportación e importación del estado completo del agente con `engine.export_model()` e `AIEngine.import_model()`.
- Serialización y validación de archivos DODL y GGUF con comprobación de versión, dimensiones, longitudes de tensores y valores, con límite de 1 MiB.
- Generación de respuestas de texto delegada en proveedores externos: OpenAI (`gpt-4o-mini` por defecto), Gemini (`gemini-2.0-flash` por defecto) y servidores OpenAI-compatible como Ollama.
- Lectura de configuración de proveedor y claves API en tiempo de ejecución, sin guardarlas en el archivo del modelo.
- Demostración en navegador con controlador de píxel basado en posición, velocidad, posición del puntero y nivel de excitación.
- Traza de espacio de trabajo con foco, objetivo, expectativa y resultado en cada paso.
- No se documentan capacidades de visión, audio, tool calling nativo ni razonamiento multi-paso más allá del bucle de decisión descrito.

## Casos de uso

- Prototipado de agentes con estado: el motor mantiene memoria y estado entre pasos y permite exportarlos, lo que sirve para experimentar con bucles de decisión antes de invertir en un framework mayor.
- Investigación sobre políticas de acción: el flujo `--train-actions` con validación fija y conjunto reservado permite estudiar cómo una red neuronal compite con una línea base de reglas en un entorno controlado.
- Demostraciones educativas de agentes: el ejemplo en navegador con controlador de píxel ilustra cómo una red pequeña puede dirigir comportamiento visible sin infraestructura de GPU.
- Integración de LLM local para respuestas: configurando `NOESIS_PROVIDER=openai-compatible` y `NOESIS_BASE_URL` hacia Ollama o vLLM, se puede usar el agente como capa de decisión con un modelo local para el texto.
- Experimentos de memoria persistente: el formato DODL guarda estado, memoria y reglas, lo que facilita comparar ejecuciones con y sin persistencia entre sesiones.
- Evaluación de trazas de decisión: la instantánea de espacio de trabajo permite auditar qué foco, objetivo y expectativa tenía el agente en cada paso, útil en estudios de interpretabilidad de agentes simples.
- Docencia sobre formatos de serialización: el código de `model_formats.py` y las comprobaciones de integridad sirven como ejemplo de validación de binarios con límites de tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona métricas internas de entrenamiento (precisión y soporte por acción, línea base de clase mayoritaria y `rule_baseline_accuracy`) sobre escenarios generados, sin cifras concretas ni comparación con modelos estándar.

## Requisitos de hardware

- El agente Python y el entrenamiento de la política de acciones son ligeros: no se declara uso de GPU y el repositorio ocupa 0,0 GB, por lo que cabe en cualquier equipo con Python 3.
- El archivo GGUF por defecto usa F32 y requiere un runtime compatible con la arquitectura personalizada `noesis`; no es cargable en llama.cpp, vLLM, Ollama ni TGI estándar sin adaptación.
- El límite de 1 MiB por archivo de modelo acota el tamaño de la red y del estado, lo que descarta despliegues en GPU de gran escala para este componente.
- Las respuestas de texto dependen del proveedor externo: con OpenAI o Gemini se necesita conectividad y clave API; con un servidor OpenAI-compatible local, los requisitos son los del modelo servido (por ejemplo, `llama3.2` en Ollama).
- No se publican cifras de latencia ni throughput.
- VRAM estimada para inferencia: no disponible para el componente propio; la del LLM externo depende del modelo configurado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dodle/noesis | Agente Python con estado y política neuronal | 808 (campo safetensors) | no disponible | MIT | Hugging Face, runtime propio |
| Modelos transformer open source (p. ej. Llama, Qwen, Mistral) | LLM generativo | Miles de millones | Decenas de miles de tokens | Variables | Hugging Face, llama.cpp, vLLM, Ollama |
| Frameworks de agentes (p. ej. LangGraph, AutoGen) | Orquestación de agentes | no aplica | Depende del LLM subyacente | Variables | Repositorios públicos |

La comparación directa con LLM no es pertinente: Noesis no implementa generación de lenguaje propia y su valor está en el bucle de decisión con estado. Frente a frameworks de agentes, ofrece un formato de serialización propietario y un motor mínimo, pero carece de ecosistema, documentación extensa y herramientas de integración.

## Limitaciones y advertencias

- No es un modelo de lenguaje: la calidad de las respuestas depende enteramente del proveedor externo configurado.
- El campo de parámetros (808) y el tamaño del repo (0,0 GB) indican que el componente neuronal es mínimo; no debe evaluarse con expectativas de un LLM.
- El GGUF usa una arquitectura personalizada `noesis` y no es compatible con runtimes estándar como llama.cpp u Ollama sin un runtime adaptado.
- Los archivos están limitados a 1 MiB, lo que restringe el tamaño de la red y del estado persistido.
- La evaluación interna usa etiquetas generadas por la misma política de umbrales que la línea base de reglas, lo que infla la puntuación de referencia; la model card recomienda contrastar con escenarios reales.
- Las señales `novelty`, `stress`, `recovery` y `arousal` son valores de software acotados y no medidas biológicas; la traza de espacio de trabajo no es evidencia de experiencia subjetiva.
- No hay información sobre sesgos, idiomas soportados ni riesgos de alucinación del componente propio; los del texto recaen en el proveedor externo.
- La licencia MIT permite uso comercial del código, pero no se documentan garantías ni soporte.
- El proyecto parece experimental y con escasa adopción (360 descargas, 0 likes); no se recomienda para producción sin auditoría del código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dodle/noesis
- Demo en vivo: https://noesis.dodle.link/model/
