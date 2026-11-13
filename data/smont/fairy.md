# Smont/Fairy

## Resumen

Fairy no es un modelo de lenguaje entrenado, sino un repositorio de Hugging Face que contiene el código fuente de una aplicación conversacional llamada "FAIRY". El autor, identificado como Smont, publica un script en Python que implementa una interfaz con un ojo animado en CSS y que delega toda la generación de texto en la API de Groq, un servicio externo de inferencia. Por tanto, el repositorio no aloja pesos, arquitectura ni datos de entrenamiento propios.

La aplicación define una personalidad concreta (asistente personal en castellano con módulos CORE, RESEARCH, TACTICAL, ACADEMY, MANAGER, TECH y NEGOCIO) y selecciona dinámicamente entre varios modelos alojados en Groq (`llama-3.3-70b-versatile`, `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `llama-3.1-8b-instant`), quedándose con el primero que responda correctamente. La memoria conversacional se limita a los últimos 12 mensajes y la salida se etiqueta con un estado de ánimo que controla la animación del ojo.

Su relevancia es limitada desde el punto de vista de la investigación en IA: se trata de una demo de integración de cliente, no de un artefacto de modelo. Resulta útil únicamente como ejemplo de cómo envolver una API de terceros con Gradio y como plantilla de personalidad para asistentes conversacionales, pero no aporta pesos, benchmarks ni innovaciones arquitectónicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; es una aplicación cliente que llama a la API de Groq) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo remoto de Groq; la app limita a 12 mensajes de historial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | castellano en la interfaz y en el prompt de personalidad; el resto depende del modelo remoto |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene código Python, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El repositorio contiene un único script de aplicación que importa `groq` y `gradio`, instala ambas dependencias si faltan mediante `pip`, y realiza una llamada de prueba a cada uno de los cuatro modelos remotos hasta encontrar uno disponible. La generación de texto se delega completamente en la infraestructura de Groq; el script solo construye el array de mensajes (prompt de sistema con la personalidad más los últimos 12 turnos) y parsea la etiqueta de ánimo de la respuesta con una expresión regular.

No hay datos de entrenamiento, ni fases de RLHF, DPO o SFT, ni innovaciones técnicas de inferencia. El único componente original es la capa de presentación: un SVG con animaciones CSS (`fyspin`, `fyblink`, transiciones de párpado y pupila) cuyo estado se controla mediante el atributo `data-mood` derivado de la etiqueta `[ánimo:...]` que el modelo remoto debe emitir al inicio de cada respuesta.

## Capacidades

- Conversación multi-turno en castellano con una personalidad predefinida y un perfil de usuario fijo (nombre y empresa).
- Selección automática de modelo remoto entre cuatro candidatos de Groq, con reintentos y *fallback*.
- Etiquetado de estado de ánimo (`neutral`, `feliz`, `alegre`, `triste`, `sorprendido`, `aburrida`, `pensando`) que se traduce en animación visual del ojo.
- Instrucciones de rol para siete "módulos" funcionales (investigación, táctica, docencia, gestión de tareas, soporte técnico, negocio).
- Despliegue como app de Gradio en Hugging Face Spaces o como celda de Google Colab.
- No soporta tool calling propio, ni agentes, ni visión, ni audio, ni modo de razonamiento extendido más allá de lo que ofrezca el modelo remoto subyacente.

## Casos de uso

- Demo educativa de integración con la API de Groq: sirve para mostrar a principiantes cómo se construye un cliente mínimo con `groq` y `gradio`, incluyendo gestión de clave por variable de entorno y *fallback* entre modelos.
- Plantilla de personalidad para asistentes verticales: el prompt de sistema con módulos y reglas de estilo puede reutilizarse como base para asistentes de dominio concreto (por ejemplo, gestión de inventario de un pequeño negocio), sustituyendo los datos del perfil.
- Prototipo de interfaz expresiva: el ojo animado con estados de ánimo controlados por etiquetas demuestra un patrón para añadir retroalimentación visual no verbal a un chatbot sin cambiar el backend.
- Ejemplo de despliegue en Hugging Face Spaces con secretos: ilustra el uso de `os.environ` para inyectar la clave de API en un Space público sin exponerla en el código.
- Base para un asistente personal doméstico de bajo coste: al delegar la inferencia en una API, no requiere GPU local y puede ejecutarse desde un portátil o desde Colab.
- Material de comparación de modelos remotos: el bucle de selección permite probar rápidamente qué modelo de Groq responde con menor latencia o mejor adherencia al formato de etiqueta de ánimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones propias ni métricas de latencia o throughput; el rendimiento depende enteramente de la API de Groq y del modelo remoto seleccionado en cada ejecución.

## Requisitos de hardware

- VRAM local: 0 GB. Toda la inferencia ocurre en los servidores de Groq.
- CPU y RAM: suficientes para ejecutar Python, Gradio y un navegador; cualquier portátil moderno sirve.
- GPU: no se requiere ninguna; no aplica A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo porque no ejecuta el modelo localmente.
- Opciones de despliegue: Hugging Face Spaces (con `GROQ_API_KEY` como secreto), Google Colab (una celda), o ejecución local con `python app.py`.
- Latencia y throughput: no disponibles; dependen de la red y del modelo remoto elegido por el bucle de selección.
- Requisito externo: clave de API de Groq válida y cuota disponible.

## Comparativa con modelos similares

No disponible. Fairy no es comparable con modelos de lenguaje porque no publica pesos ni arquitectura; su categoría real es la de aplicación cliente de una API. Como referencia de la categoría "demo de chatbot con Gradio", podría compararse con otros Spaces públicos, pero no se dispone de datos objetivos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo: no hay pesos, no hay arquitectura, no hay entrenamiento. Cualquier evaluación como modelo de IA carece de sentido.
- Dependencia total de un servicio externo (Groq) y de una clave de API; si el servicio cambia, limita o retira modelos, la aplicación deja de funcionar.
- La licencia no está declarada en la información disponible, lo que impide determinar si el uso comercial del código está permitido.
- El prompt de personalidad contiene datos personales del usuario (nombre y empresa) incrustados en el código; publicarlos en un Space público los expone.
- El historial se trunca a 12 mensajes, lo que limita la coherencia en conversaciones largas.
- El parseo del ánimo depende de que el modelo remoto respete el formato `[ánimo:...]` en la primera línea; no hay validación robusta más allá de una expresión regular.
- Riesgo de alucinación heredado del modelo remoto; el prompt pide no inventar datos, pero no lo garantiza.
- No hay control de sesgos, filtros de seguridad propios ni evaluación de idioma más allá del castellano en la interfaz.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de mantenimiento o comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Smont/Fairy
- Documentación de Groq API: no disponible en la información proporcionada
- Documentación de Gradio: no disponible en la información proporcionada
- Paper, blog o demo adicional: no disponible en la información proporcionada
