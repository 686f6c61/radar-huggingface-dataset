# Hobbylm/hobbylm-1B-computer-use

## Resumen

HobbyLM-1B Computer Use es un adaptador LoRA (rango 16, 83 módulos, 14 MB en formato MLX) sobre el modelo base `harims95/hobbylm-1B-instruct`, un transformer disperso de tipo mixture-of-experts que activa 8 de sus 64 expertos por token. Lo desarrolla el usuario Hobbylm y su función es convertir una petición en inglés natural en una única acción ejecutable sobre macOS, dentro de un bucle cerrado de hasta seis pasos gestionado por una aplicación llamada Hobby. El adaptador no modifica los pesos del modelo base: todo el comportamiento nuevo proviene del entrenamiento supervisado sobre decisiones sintéticas de un solo paso.

La relevancia del proyecto es que demuestra un agente "computer use" que corre íntegramente en el dispositivo, sin nube: inferencia con Apple MLX en FP32 sobre Apple Silicon, con una mediana de 0,26 s por decisión en un MacBook Air. El espacio de acciones está deliberadamente acotado a diez verbos (OPEN, TYPE, KEY, DARK_MODE, FOLDER, TIMER, SCREENSHOT, EVENT, DONE y UNKNOWN), lo que permite validar cada acción contra una allow-list antes de ejecutarla y limita la superficie de riesgo. En la evaluación sellada de la ronda 4 completó 90 de 125 peticiones en vivo sobre macOS, un 72%.

Se publica bajo licencia Apache-2.0, únicamente en inglés y en versión v0.1. El repositorio incluye el adaptador, la aplicación que lo ejecuta, los registros de evaluación y el código de entrenamiento. Es un proyecto joven (cero descargas en el momento de la consulta, 16 likes) orientado a experimentación y a servir de base para políticas de acción compactas, más que a un despliegue de producción sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer disperso mixture-of-experts (8 de 64 expertos activos por token) |
| Parametros totales | 1B en el modelo base (según el nombre del modelo; el repositorio no desglosa el reparto entre expertos) |
| Parametros activos | 8 de 64 expertos por token; número absoluto de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card indica ejecución en FP32 con MLX; no se documentan variantes cuantizadas del adaptador) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA de rango 16, 83 módulos) y formato MLX (14 MB) |

## Arquitectura y entrenamiento

El adaptador se monta sobre HobbyLM-1B Instruct, un modelo de mezcla de expertos dispersa que activa 8 de 64 expertos por token, lo que mantiene bajo el coste de cómputo por paso pese a un total de 1B parámetros. El adaptador LoRA tiene rango 16 y cubre 83 módulos, con un tamaño de 14 MB en forma MLX. La inferencia se realiza en FP32 con Apple MLX sobre Apple Silicon, con decodificación greedy y el formato de prompt nativo del modelo base (`SYSTEM:` / `USER:` / `ASSISTANT:`). En cada turno, el sistema inyecta la petición del usuario junto con el estado en vivo del Mac (pantalla de la calculadora, aplicación en primer plano, brillo, volumen, modo oscuro) y la traza de la acción anterior con su resultado; el modelo responde con una sola acción y el bucle continúa hasta `DONE` o hasta un máximo de seis pasos.

El entrenamiento consistió en cuatro rondas sobre decisiones sintéticas de un solo paso (dada una petición y un estado del Mac, escribir la siguiente acción), con un coste total de 60 minutos de H100. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO; el procedimiento descrito es ajuste supervisado. La innovación destacable no está en el modelo sino en el diseño del sistema: vocabulario de acciones fijo, validación contra allow-list, ejecución mediante `mcp-server-macos-use` para la entrada en Calculator y llamadas directas a macOS para el resto, y realimentación del resultado al modelo en cada iteración.

## Capacidades

- Traducción de lenguaje natural a acciones de escritorio en macOS, una acción por turno, con un vocabulario cerrado de diez verbos.
- Cálculo aritmético delegado: abre Calculator y teclea las pulsaciones (`TYPE 600/4=`), de modo que la aritmética la realiza la aplicación del sistema y no el modelo.
- Control de ajustes del sistema: brillo arriba/abajo, volumen arriba/abajo, silencio y conmutación de modo oscuro.
- Apertura de aplicaciones de una lista blanca: Calculator, Notes, Calendar, Finder, Music y Reminders.
- Apertura de carpetas del usuario en Finder: Downloads, Desktop y Documents.
- Temporizadores en minutos, con conversión desde horas (por ejemplo, "4 horas" se resuelve como `TIMER 240`).
- Capturas de pantalla guardadas en el escritorio.
- Creación de eventos de calendario con resolución de fecha relativa, zona horaria explícita y búsqueda de la persona en Contactos, con confirmación y/n antes de escribir.
- Reconocimiento explícito de límites: devuelve `UNKNOWN` ante peticiones fuera del espacio de acciones (por ejemplo, consultar el tiempo o enviar un mensaje de WhatsApp).
- Ejecución completamente local, sin llamadas a servicios externos, lo que evita enviar el estado del escritorio a un tercero.
- No dispone de tool calling genérico ni de function calling arbitrario: el conjunto de herramientas está fijado en el prompt del sistema y en el harness.
- Capacidades multimodales, de audio o de visión: no disponibles.

## Casos de uso

- Asistente de escritorio personal en macOS: el usuario dicta una instrucción cotidiana ("sube el brillo", "pon un temporizador de 7 minutos") y el modelo emite la acción correspondiente con una latencia mediana de 0,26 s, suficiente para que la interacción se perciba como inmediata.
- Automatización de operaciones aritméticas con verificación visual: el patrón OPEN Calculator → TYPE → DONE permite que el harness compruebe el cambio en la pantalla de la calculadora (de 0 a 150 en el ejemplo registrado), lo que sirve como patrón de verificación de resultado para agentes que operan interfaces gráficas.
- Accesibilidad: usuarios con movilidad reducida o dificultad para navegar menús pueden ejecutar acciones del sistema mediante lenguaje natural, con la ventaja de que todo el procesamiento ocurre en el dispositivo y el estado del escritorio no sale del equipo.
- Punto de partida para investigación en políticas de acción compactas: con 60 minutos de H100 y cuatro rondas de datos sintéticos se obtiene un adaptador de 14 MB, un coste de experimentación muy bajo para iterar sobre esquemas de acciones y formatos de estado.
- Automatización de pruebas de interfaz en macOS: el harness con allow-list y el registro estructurado `Last action: … Result: …` permiten reproducir secuencias de acciones sobre aplicaciones del sistema y comparar el estado observado antes y después de cada paso.
- Prototipado de agentes "on-device" en portátiles: sirve para validar arquitecturas de bucle percepción-acción sin depender de GPU dedicada ni de API externas, usando Apple Silicon y MLX en FP32.
- Entornos educativos o de demostración: el vocabulario de diez acciones y la respuesta `UNKNOWN` deliberada hacen que el comportamiento sea auditable y fácil de explicar en una demo o en un taller.
- Base para adaptadores verticales: al ser un LoRA sobre un modelo de 1B, se puede reentrenar el adaptador para otros espacios de acciones (otras aplicaciones, otros sistemas operativos) manteniendo el mismo esquema de prompt y de validación, sin tocar los pesos del modelo base.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la evaluación propia del proyecto, no comparables con benchmarks académicos estándar.

| Metrica | Resultado | Contexto |
|---|---|---|
| Peticiones completadas en vivo | 90 de 125 (72%) | Ronda 4 de evaluación sellada, ejecución real sobre macOS |
| Latencia mediana por decisión | 0,26 s | MacBook Air, Apple MLX, FP32 |
| Pasos máximos por petición | 6 | Límite del harness |
| Coste de entrenamiento | 60 minutos de H100 en total | 4 rondas |
| Tamaño del adaptador | 14 MB | Formato MLX, LoRA rango 16, 83 módulos |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni para métricas estándar de agentes (por ejemplo, tasas de éxito por tipo de tarea o por número de pasos).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 1B parámetros, lo que sitúa la huella en torno a 4 GB en FP32 (configuración usada por el proyecto), aproximadamente 2 GB en FP16 y por debajo de 1 GB en cuantizaciones de 8 o 4 bits. Son estimaciones de cálculo, no cifras publicadas por el autor.
- Plataforma objetivo: Apple Silicon con Apple MLX, ejecutando en FP32. El proyecto reporta 0,26 s de mediana por decisión en un MacBook Air, es decir, hardware de portátil sin GPU dedicada.
- GPU recomendadas: no disponibles en la documentación; el proyecto no publica pruebas en A100, H100 ni RTX 4090. El adaptador podría cargarse con PEFT sobre el modelo base en CUDA, pero no hay datos de rendimiento.
- Cabe en GPU de consumo: sí, por tamaño (1B parámetros), aunque la ruta soportada y medida es Apple Silicon, no CUDA.
- Opciones de despliegue: MLX (ruta oficial del proyecto); PEFT con safetensors para cargar el adaptador sobre el modelo base. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, ni se publican pesos GGUF en el repositorio.
- Latencia y throughput: mediana de 0,26 s por decisión en MacBook Air con FP32; no se publica throughput agregado ni latencia en otros equipos.
- Almacenamiento: el repositorio ocupa 0,0 GB y el adaptador 14 MB, más el peso del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hobbylm-1B-computer-use | 1B (base MoE, 8 de 64 expertos) | no disponible | Adaptador LoRA para computer use en macOS, vocabulario de 10 acciones | apache-2.0 | HuggingFace, v0.1, 0 descargas |
| harims95/hobbylm-1B-instruct (modelo base) | 1B (MoE, 8 de 64 expertos) | no disponible | Instrucciones generales en texto; sin capacidades de agente | no disponible en la información proporcionada | HuggingFace |
| Otros modelos de computer use de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de modelos alternativos de computer use, por lo que no es posible establecer una comparación cuantitativa de tasas de éxito, latencia o cobertura de acciones frente a otras propuestas.

## Limitaciones y advertencias

- Tasa de éxito del 72%: 35 de las 125 peticiones de la evaluación sellada no se completaron. Para uso desatendido, un 28% de fallos exige supervisión humana o mecanismos de recuperación.
- Vocabulario muy restringido: solo diez acciones y un puñado de aplicaciones y carpetas concretas. Cualquier petición fuera de ese espacio devuelve `UNKNOWN`, lo que es seguro pero limita mucho la utilidad real.
- Solo inglés: el prompt, los datos de entrenamiento y las peticiones de ejemplo están en inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Solo macOS: las acciones se ejecutan mediante llamadas al sistema macOS y `mcp-server-macos-use`; no hay soporte para Linux ni Windows.
- Dependencia del harness: el adaptador por sí solo no ejecuta nada. La seguridad depende de la allow-list y del validador externos; sin ellos, el modelo puede emitir acciones no deseadas.
- Riesgo de alucinación de acciones y de argumentos: el modelo puede inventar títulos de evento, fechas o nombres de contacto, por lo que la confirmación y/n antes de escribir en Calendar es un control necesario, no opcional.
- Privacidad: aunque la inferencia es local, el sistema envía al modelo el estado del escritorio (aplicación en primer plano, pantalla de la calculadora, ajustes). Ese estado no debería salir del dispositivo en ninguna configuración.
- Longitud de contexto no documentada: se desconoce cuántos turnos de historial admite antes de truncar, lo que es un riesgo para bucles largos o estados muy verbosos.
- Versión v0.1 y validación escasa: cero descargas y 16 likes en el momento de la consulta, sin revisión independiente ni informes de terceros.
- Sesgos: no se documenta ninguna evaluación de sesgos, y el modelo base tampoco los detalla en la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; al ser un adaptador, hay que verificar también la licencia del modelo base.
- Los resultados de búsqueda web devueltos para esta consulta no contenían material técnico relacionado con el modelo, por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hobbylm/hobbylm-1B-computer-use
- Modelo base: https://huggingface.co/harims95/hobbylm-1B-instruct
- Servidor MCP usado para la entrada en Calculator: https://github.com/mediar-ai/mcp-server-macos-use
- Paper, blog o demo adicionales: no disponibles en la información proporcionada (la búsqueda web no devolvió resultados relevantes)
