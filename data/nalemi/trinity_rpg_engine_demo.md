# nalemi/Trinity_RPG_Engine_Demo

## Resumen

Trinity es un banco de pruebas interactivo de narrativa conversacional que funciona íntegramente en local, desarrollado por el usuario nalemi y publicado en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje entrenado desde cero, sino de una distribución de software escrita en Rust que orquesta un Gemma 2 9B abliterado en formato GGUF, un motor de estado de juego basado en egui y un sistema de síntesis de voz neuronal Piper (ONNX). El repositorio actúa como escaparate del proyecto: el peso real del sistema reside en los binarios y en los modelos empaquetados que se distribuyen aparte.

El problema que aborda es la dependencia de servicios en la nube en experiencias narrativas con IA: Trinity elimina API keys, telemetría y llamadas externas, de modo que todo el cómputo ocurre en hardware de consumo. La arquitectura desacopla el cliente gráfico (`game.exe`), el núcleo cognitivo (`persona.exe`) y el servidor de inferencia (`llama-server.exe`) mediante IPC sobre el puerto 7878, con el LLM recibiendo telemetría del estado del juego (inventario, vitales, tiradas de dados D20) en lugar de operar como un chatbot aislado.

El interés actual del proyecto es principalmente arquitectónico: demuestra un puente bidireccional entre un modelo local y una máquina de estados, con memoria episódica persistente en SQLite y un acumulador de frases que envía los tokens generados a Piper con latencia inferior al segundo. La ficha documenta el repositorio tal como está publicado, con la información disponible en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación Rust (egui) que orquesta un LLM transformer (Gemma 2 9B) vía llama-server; no es un modelo propio |
| Parametros totales | 9B (modelo subyacente Gemma 2 9B abliterado, cuantizado Q4_K_M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica la ventana configurada) |
| Tipos de cuantizacion | GGUF Q4_K_M (única variante mencionada) |
| Idiomas soportados | alemán (de), inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF para el LLM; ONNX para los checkpoints de voz Piper |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado por el autor: es una distribución de inferencia. El componente lingüístico es Gemma 2 9B instruct abliterado en GGUF Q4_K_M, servido por `llama-server.exe` con backends de cómputo CUDA y CPU. Sobre él se construye una arquitectura multiproceso supervisada por `launcher.exe`: `game.exe` mantiene la máquina de estados (misiones, inventario, tiradas D20), `persona.exe` actúa como cortex cognitivo e intermediario IPC, y Piper TTS ejecuta la síntesis de voz neuronal en ONNX. La comunicación entre el cliente gráfico y el núcleo cognitivo se realiza por TCP en el puerto 7878.

La innovación técnica declarada es el puente de estado bidireccional: el LLM recibe telemetría activa del juego (vectores de sala, peso del inventario, vitales y resultados de dados) en cada turno, de forma que la generación está condicionada por el estado real de la partida. La memoria episódica, las entradas de diario y los estados sinápticos persisten entre sesiones en SQLite y en un almacén vectorial bajo `soul/memory/`. El streaming de tokens pasa por un acumulador de frases que alimenta directamente el modelo de voz Piper. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, ya que el autor no entrena el modelo base.

## Capacidades

- Generación de texto narrativo y diálogo de rol en inglés y alemán, condicionada por telemetría del estado del juego.
- Integración de tiradas de dados D20 y reglas de misión en el contexto de generación.
- Memoria episódica persistente entre sesiones mediante SQLite y almacén vectorial local.
- Síntesis de voz neuronal offline con Piper (ONNX) y streaming por acumulación de frases.
- Ejecución completamente offline y air-gapped, sin telemetría ni llamadas externas.
- Distribución autónoma mediante `cargo xtask dist`, con modelos, runtimes, DLLs y datos de misión empaquetados en un único directorio.
- Tool calling, function calling, agentes multi-paso, visión, audio de entrada y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Prototipado de motores narrativos con LLM local: sirve como referencia de arquitectura para conectar un modelo GGUF a una máquina de estados de juego mediante IPC, sin depender de APIs externas.
- Experiencias de rol offline en hardware de consumo: el sistema completo cabe en una GPU de 8 GB de VRAM y 16 GB de RAM, lo que permite jugar sin conexión en un equipo de escritorio con Windows 10/11.
- Investigación sobre condicionamiento por estado: el puente bidireccional permite estudiar cómo la telemetría estructurada (inventario, vitales, dados) afecta a la coherencia de la generación a lo largo de una sesión.
- Evaluación de memoria episódica persistente: el almacén en SQLite y el índice vectorial bajo `soul/memory/` permiten medir la recuperación de contexto entre sesiones y la consistencia del personaje.
- Integración de TTS de baja latencia: el acumulador de frases y Piper ONNX sirven como patrón para pipelines de voz en tiempo real sobre tokens en streaming.
- Base para distribuciones air-gapped: el empaquetado con `cargo xtask dist` es un ejemplo de despliegue reproducible en entornos sin red, útil para demostraciones y entornos controlados.
- Referencia para desarrolladores Rust: el uso de egui para la interfaz y de un supervisor de procesos para orquestar binarios independientes es directamente reutilizable en otros proyectos de escritorio con IA local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10/11 de 64 bits (único soportado según la model card).
- GPU: NVIDIA GeForce RTX con 8 GB de VRAM recomendados para generación de tokens y offloading óptimos.
- RAM: 16 GB de memoria del sistema.
- Almacenamiento: aproximadamente 12 GB libres; se recomienda SSD NVMe para el streaming del modelo.
- VRAM estimada: no disponible de forma desglosada; el modelo Q4_K_M de 9B y el runtime de voz ONNX se ejecutan dentro del objetivo de 8 GB indicado por el autor.
- GPU consumer: sí, el autor indica que cabe en una RTX de 8 GB; no se especifican modelos concretos más allá de la familia RTX.
- Opciones de despliegue: llama-server (incluido en la distribución), Piper TTS en ONNX y el launcher propio; no se mencionan vLLM, TGI, Ollama ni llama.cpp fuera del binario empaquetado.
- Latencia y throughput: no disponibles; la model card solo afirma latencia inferior al segundo en el pipeline de voz.

## Comparativa con modelos similares

| Proyecto | Tipo | Modelo subyacente | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| Trinity (nalemi) | Motor de juego narrativo offline en Rust | Gemma 2 9B abliterado Q4_K_M | no disponible | MIT | Windows 10/11, GPU 8 GB |
| AI-RPG-Engine (l497996153) | Motor de RPG de mesa modular con RAG | LLM no especificado | no disponible | no disponible | Web |
| ai-rpg-engine (topic de GitHub) | Plataforma web de RPG con LLM | LLM no especificado | no disponible | no disponible | Discord y web |

La comparación se limita a la categoría de motores de rol asistidos por LLM; no se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB: no contiene los pesos ni los binarios, que se distribuyen aparte en un archivo `Trinity.zip`.
- Solo se soporta Windows 10/11 de 64 bits; no hay soporte documentado para Linux ni macOS.
- El modelo subyacente es una variante abliterada de Gemma 2, lo que implica que se han eliminado mecanismos de rechazo; esto aumenta el riesgo de generar contenido inapropiado y requiere filtrado adicional en cualquier uso más allá de la demostración.
- Los idiomas declarados son alemán e inglés; no hay soporte documentado de castellano.
- Riesgo de alucinación inherente a un modelo de 9B cuantizado a Q4_K_M, sin benchmarks publicados que permitan acotarlo.
- La licencia MIT del repositorio no cubre necesariamente los pesos de Gemma 2, sujetos a los términos de uso de Google; conviene verificar la licencia del modelo base antes de un uso comercial.
- No se documentan sesgos conocidos, límites de contexto configurados ni métricas de producción; la información disponible es insuficiente para evaluar su robustez fuera del caso de demostración.
- El proyecto se presenta como banco de pruebas ("testbed") y demostración, no como un producto listo para producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nalemi/Trinity_RPG_Engine_Demo
- AI-RPG-Engine (proyecto comparable en GitHub): https://github.com/l497996153/AI-RPG-Engine
- Topic ai-rpg-engine en GitHub: https://github.com/topics/ai-rpg-engine
