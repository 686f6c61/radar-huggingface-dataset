# KreatixLabs/Kreatix-K2-300M

## Resumen

Kreatix K2 300M es el modelo mas pequeno de la familia Kreatix K2, un modelo vision-lenguaje desarrollado integramente desde cero por KreatixLabs. Incluye arquitectura, tokenizer y codificador visual propios, entrenados desde pesos aleatorios. Con 318 millones de parametros totales (286M en el modelo de lenguaje y 32M en el codificador visual), esta disenado para ejecutarse en la CPU de un portatil, lo que lo situa en la categoria de modelos ultraligeros multimodales.

El modelo esta orientado a codigo y al uso de herramientas: puede invocar funciones como ejecucion de Python, lectura y escritura de ficheros o calculadora, leer el resultado y continuar la conversacion. Tambien procesa imagenes a su relacion de aspecto nativa. Su arquitectura combina atencion lineal Gated DeltaNet con atencion completa cada cuarta capa (patron DDDA) en 16 capas, con un contexto de 8.192 tokens y un vocabulario de 65.536 tokens BPE entrenado desde cero.

Es relevante por su caracter experimental: un modelo multimodal completo construido from scratch, con licencia Apache 2.0, entrenado con tecnicas de entrenamiento distribuido entre sitios (DiLoCo) sobre GPUs NVIDIA Blackwell y con datos de instruccion parcialmente destilados de un modelo docente. Su tamano lo hace util para experimentacion, prototipado en local y estudio de arquitecturas hibridas de atencion lineal, aunque sus capacidades son limitadas por escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal vision-lenguaje; Gated DeltaNet (atencion lineal) con atencion completa cada cuarta capa (patron DDDA), 16 capas |
| Parametros totales | 317.998.784 (286M modelo de lenguaje + 32M codificador visual) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (ingles principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, aproximadamente 0,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer causal multimodal con una innovacion estructural clave: 16 capas que combinan Gated DeltaNet (una variante de atencion lineal con compuertas) con atencion completa en cada cuarta capa, siguiendo el patron DDDA. Esta hibridacion busca reducir el coste computacional del mecanismo de atencion manteniendo capacidad de modelado global. El vocabulario de 65.536 tokens se entreno desde cero con BPE a nivel de byte, y el codificador visual forma parte del diseno propio del modelo, no de un componente externo reutilizado.

El entrenamiento se realizo en tres etapas. El preentrenamiento partio de pesos aleatorios sobre FineWeb-Edu, Cosmopedia v2, FineMath 4+ y el corpus de annealing de OpenCoder. La alineacion visual uso datos de instruccion de FineVision valorados con 4+/5. El ajuste de instrucciones (400 pasos, aproximadamente 52M tokens) combino instrucciones de codigo de OpenCoder y Magicoder, SmolTalk, FineVision, trazas de uso de herramientas procedentes de ejecucion real de codigo y un conjunto de seguridad, sobre 1.915 respuestas de profesor y 153 trazas de agente (39 con ejecucion real de codigo). Parte de los datos de instruccion y de herramientas se destilaron de una build comunitaria de GLM-5.3-Flash (MIT). El entrenamiento se distribuyo entre sitios con DiLoCo sobre GPUs NVIDIA Blackwell. El codificador visual solo se entreno en la etapa de ajuste, por lo que la comprension de imagenes es temprana.

## Capacidades

- Generacion de texto en ingles con respuestas directas.
- Generacion de codigo en varios lenguajes, con foco en instrucciones de programacion.
- Razonamiento basico y matematicas elementales (entrenado con FineMath 4+).
- Comprension de imagenes a su relacion de aspecto nativa (image-text-to-text).
- Uso de herramientas (tool calling): `run_python` en proceso aislado, `read_file`, `write_file`, `list_files` en workspace sandbox y `calculator`.
- Flujo de agente basico: invoca herramienta, lee el resultado y continua la tarea.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, streaming e imagenes) con autenticacion por claves API.
- Capacidades multilingues limitadas al ingles segun la model card.
- No dispone de modo thinking explicito, audio ni otras modalidades mas alla de texto e imagen.

## Casos de uso

- Prototipado local de asistentes de codigo: el modelo puede generar funciones sencillas (por ejemplo, invertir una lista en Python) y ejecutarse en CPU de portatil, lo que permite iterar sin infraestructura GPU.
- Agente de manipulacion de ficheros en sandbox: con las herramientas `read_file`, `write_file` y `list_files`, se puede usar para tareas acotadas como crear un `hello.py` o inspeccionar un workspace, siempre en un entorno aislado.
- Ejecucion controlada de codigo: la herramienta `run_python` en proceso aislado permite validar fragmentos generados por el propio modelo dentro de un pipeline de pruebas.
- Analisis basico de imagenes: responder preguntas simples sobre una fotografia (por ejemplo, "que hay en esta imagen") en aplicaciones de demostracion o educativas donde no se requiere alta precision.
- Servicio compatible con OpenAI para pruebas de integracion: `kreatix/serve.py` expone `/v1/chat/completions` con streaming e imagenes, util para validar clientes OpenAI contra un backend ligero y autohospedado.
- Investigacion de arquitecturas hibridas de atencion: al combinar Gated DeltaNet con atencion completa en patron DDDA, sirve como banco de pruebas para estudiar el comportamiento de atencion lineal a pequena escala.
- Educacion y divulgacion: por su tamano y su construccion from scratch, es adecuado para explicar el funcionamiento interno de un modelo vision-lenguaje en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al publicarse en bf16 con aproximadamente 0,6 GB de pesos, la inferencia en bf16 requiere alrededor de 1 GB de memoria; en CPU no se necesita VRAM dedicada.
- GPU recomendadas: no se especifican en la model card; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobrada, y el modelo esta pensado para ejecutarse en CPU de portatil.
- Cabe en GPU consumer: si, con amplio margen, dado su tamano de 318M parametros.
- Opciones de despliegue: el modelo requiere el paquete `kreatix` incluido y no es compatible con transformers, llama.cpp ni Ollama segun la model card. El despliegue previsto es mediante `scripts/generate.py` y el servidor compatible con OpenAI `kreatix/serve.py`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de comparaciones publicadas en la informacion proporcionada. Como referencia estructural, se puede contrastar con otros modelos ultraligeros multimodales, pero sin cifras de benchmarks no es posible una comparacion cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kreatix K2 300M | 318M (286M LM + 32M vision) | 8.192 | Apache 2.0 | Hugging Face, requiere paquete `kreatix` |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo pequeno: cabe esperar errores factuales, razonamiento limitado y codigo simple.
- Idioma principalmente ingles; el soporte multilingue es practicamente inexistente.
- El codificador visual se entreno solo en la etapa de ajuste, por lo que la comprension de imagenes es temprana y poco fiable.
- El uso de herramientas es basico a esta escala y puede fallar en tareas de varios pasos.
- Requiere el paquete `kreatix` incluido; no es compatible con transformers, llama.cpp ni Ollama, lo que limita su integracion en ecosistemas estandar.
- Las cuatro restricciones de seguridad (drogas ilegales, autolesion, contenido sexual con menores y armas de destruccion masiva) no son plenamente fiables a este tamano.
- Riesgo de alucinacion inherente a modelos de esta escala.
- La ejecucion de Python mediante `run_python` debe hacerse en entorno aislado; la model card advierte de no habilitar `--allow-python` sin precauciones.
- Licencia Apache 2.0 permite uso comercial, pero la fiabilidad limitada desaconseja su uso en produccion sin validacion adicional.
- Sesgos conocidos: no se documentan especificamente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/KreatixLabs/Kreatix-K2-300M
- Familia Kreatix K2: https://huggingface.co/KreatixLabs/Kreatix-K2
- Web del autor: https://kreatix.tech
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Banner del modelo: https://huggingface.co/KreatixLabs/Kreatix-K2-300M/resolve/main/assets/k2-300m-banner.png
- Diagrama de arquitectura: https://huggingface.co/KreatixLabs/Kreatix-K2-300M/resolve/main/assets/k2-300m-architecture.png
- Log de entrenamiento (video): https://huggingface.co/KreatixLabs/Kreatix-K2-300M/resolve/main/assets/k2-300m-training.mp4
- Log de entrenamiento (imagen): https://huggingface.co/KreatixLabs/Kreatix-K2-300M/resolve/main/assets/k2-300m-training-loss.png
