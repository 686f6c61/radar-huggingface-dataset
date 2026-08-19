# iMiranda/kuro-phi3.5-gguf

## Resumen

Kuro es un repack del modelo `microsoft/Phi-3.5-mini-instruct` (3.8 mil millones de parametros, licencia MIT) cuantizado a formato GGUF Q4_K_M (~2.3 GiB) por el usuario iMiranda. No se trata de un modelo entrenado desde cero ni con fine-tuning: los pesos son exactamente los del Phi-3.5-mini-instruct de Microsoft, solo que convertidos a GGUF mediante `llama.cpp` y empaquetados con una persona de asistente tecnico llamada "Kuro" que se aplica en tiempo de ejecucion via system prompt.

El objetivo declarado del autor es ofrecer un asistente de ingenieria local que funcione en terminal puro (TTY) sobre hardware de consumo sin GPU dedicada, con respuestas utiles en CPU a velocidades de entre 6 y 11 tokens por segundo en un Intel i7-1355U. La relevancia actual reside en que demuestra como un modelo pequeno de 3.8B puede ser suficiente para tareas de asistencia tecnica y generacion de codigo si se cuantiza adecuadamente y se le da una persona bien definida, sin necesidad de infraestructura de servidores.

El modelo soporta una longitud de contexto de hasta 131072 tokens (aunque el autor recomienda 4096 para uso realista en CPU) y los idiomas portugues e ingles. El archivo GGUF incluye el chat template Jinja2 embebido del Phi-3.5, por lo que es compatible con cualquier herramienta que consuma GGUF: llama.cpp, LM Studio, Ollama o Jan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi-3.5 (decoder-only transformer) |
| Parametros totales | 3.821.079.648 (3.8 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 131072 tokens (recomendado: 4096) |
| Tipos de cuantizacion | Q4_K_M (4-bit primario + 6-bit K/V, ~5.02 BPW medio) |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `kuro-Q4_K_M.gguf`, ~2.3 GiB) |

## Arquitectura y entrenamiento

El modelo base es `microsoft/Phi-3.5-mini-instruct`, un transformer decoder-only de 3.8 B parametros desarrollado por Microsoft. La arquitectura Phi-3.5 incorpora atencion con ventana deslizante (sliding window attention) para manejar contextos largos de hasta 128K tokens, junto con un tokenizer y configuracion de capas especificas de la familia Phi-3. No se dispone de detalles adicionales sobre el numero exacto de capas, dimensiones ocultas o configuracion de atencion en la informacion proporcionada, mas alla de que es un transformer denso.

El proceso de entrenamiento del modelo original (realizado por Microsoft) no se detalla en esta model card. Lo que si se sabe es que el autor de Kuro no ha realizado ningun fine-tuning: los pesos son identicos a los del modelo base, solo se ha aplicado cuantizacion Q4_K_M mediante `llama-quantize` de llama.cpp. La persona "Kuro" se implementa exclusivamente a traves de un system prompt que se inyecta en tiempo de ejecucion con la flag `--system-prompt` (o `--sys`) de `llama-cli`, o manualmente en herramientas como LM Studio, Ollama o Jan.

## Capacidades

- Generacion de texto conversacional en portugues e ingles, con estilo directo y tecnico definido por el system prompt.
- Generacion de codigo funcional: el modelo base Phi-3.5-mini-instruct tiene capacidades de programacion y el autor lo prueba con ejemplos de Python.
- Razonamiento tecnico y analisis: puede responder preguntas de ingenieria de software y machine learning, asi como analizar JSON u otros formatos de datos.
- Rechazo de acciones peligrosas: en las pruebas realizadas por el autor, el modelo rechazo correctamente una solicitud para eliminar `/etc/passwd`, mostrando cierta alineacion basica de seguridad.
- Soporte de tool calling / function calling: no se menciona explicitamente en la model card, pero el modelo base Phi-3.5-mini-instruct de Microsoft si lo soporta; no hay confirmacion de que funcione con la cuantizacion y el system prompt.
- Capacidades multilingues: limitadas a portugues e ingles, segun la etiqueta de idiomas.
- Ejecucion offline en CPU sin GPU dedicada: es la capacidad principal declarada por el autor, con velocidades de 6-11 tokens/s en un i7-1355U.

## Casos de uso

- Asistente tecnico local en terminal: el caso de uso principal. Un desarrollador puede ejecutar `llama-cli` en su maquina sin GPU y tener un asistente que responda preguntas de ingenieria, genere codigo y analice datos, todo offline y con latencia aceptable (~9.5 tok/s de media).
- Generacion de codigo en entornos de desarrollo: gracias a su capacidad de producir codigo funcional (probado con Python), puede usarse como companion para escribir funciones, revisar snippets o explicar algoritmos directamente desde la terminal.
- Analisis rapido de datos y logs: el modelo puede procesar texto plano, leer JSON y extraer conclusiones tecnicas, lo que lo hace util para inspeccionar archivos de configuracion, logs de errores o salidas de comandos.
- Entorno de aprendizaje de IA local: estudiantes o profesionales que quieran experimentar con modelos de lenguaje sin depender de APIs cloud pueden usar este GGUF en LM Studio u Ollama para practicar prompt engineering y entender el comportamiento de un LLM de 3.8B.
- Automatizacion de tareas repetitivas via scripting: al ser compatible con llama.cpp, se puede integrar en scripts bash o Python para generar respuestas automatizadas, documentacion tecnica o resumenes de archivos, siempre que se acepte la latencia de CPU.
- Prototipado de agentes conversacionales: el system prompt de Kuro demuestra como una persona bien definida puede transformar un modelo generico en un asistente con estilo propio; este patron es replicable para crear otros asistentes especializados sin fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye mediciones de rendimiento de inferencia en hardware real, que se resumen a continuacion:

| Metrica | Valor |
|---|---|
| Prompt processing | 38.8–50.9 tok/s |
| Generacion | 6.1–10.7 tok/s |
| Throughput medio | ~9.5 tok/s (8 threads) |
| RAM usada (RSS) | 4.7 GiB |
| Tiempo de carga | ~2 s (mmap) |
| Contexto probado | 4096 tokens |

Estas mediciones se realizaron en un Intel i7-1355U (10 nucleos fisicos, 12 threads) con 16 GiB de RAM, sin GPU, usando 5 prompts variados. El sistema operativo permanecio responsivo durante toda la inferencia.

## Requisitos de hardware

- VRAM: no requiere GPU dedicada; la inferencia se ejecuta enteramente en CPU.
- RAM: se observo un consumo de 4.7 GiB RSS durante la inferencia con contexto de 4096 tokens. Se recomienda al menos 8 GiB de RAM total para un uso comodo.
- CPU: cualquier procesador moderno con al menos 8 threads es suficiente. El autor probo con un Intel i7-1355U (12 threads) y obtuvo ~9.5 tok/s de media.
- GPU: no necesaria. Si se dispone de una GPU consumer (RTX 3060 o superior), la velocidad de generacion aumentaria considerablemente, aunque no hay datos medidos al respecto.
- Opciones de despliegue: llama.cpp (`llama-cli`), LM Studio, Ollama (via Modelfile), Jan. Tambien es compatible con cualquier otra herramienta que consuma GGUF.
- Latencia: carga del modelo en ~2 s (con mmap), prompt processing de 38-51 tok/s, generacion de 6-11 tok/s en CPU. En GPU, la latencia seria mucho menor, pero no se ha medido.
- Throughput: ~9.5 tok/s de media en CPU con 8 threads. Suficiente para chat interactivo, no para procesamiento por lotes de alto volumen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos entre este modelo y alternativas de la misma categoria. Como referencia cualitativa, se puede comparar con el modelo base sin cuantizar y con otros modelos pequenos populares:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| iMiranda/kuro-phi3.5-gguf | 3.8 B | 128K (recomendado 4K) | MIT | GGUF Q4_K_M | Persona via system prompt, optimizado para CPU |
| microsoft/Phi-3.5-mini-instruct | 3.8 B | 128K | MIT | safetensors | Modelo base original, requiere mas VRAM/RAM |
| Llama 3.2 3B (Meta) | 3.2 B | 128K | Llama 3.2 Community | safetensors/GGUF | Alternativa comun de tamano similar, no se dispone de comparativa de rendimiento |

La principal diferencia frente al modelo base es la cuantizacion (Q4_K_M) que reduce el tamano de ~7.7 GiB a ~2.3 GiB y permite ejecutarlo en CPU con 4.7 GiB de RAM. Frente a Llama 3.2 3B, no hay datos objetivos de comparacion de calidad en esta informacion.

## Limitaciones y advertencias

- Sin fine-tuning: la persona "Kuro" es solo un system prompt. Si el usuario no lo inyecta explicitamente, el modelo se comporta como el Phi-3.5-mini-instruct estandar.
- Tonalidad fija: el system prompt define un estilo muy directo y conciso. No es adecuado para aplicaciones que requieran un tono mas empatico o conversacional.
- Contexto recomendado de 4096 tokens: aunque el modelo soporta hasta 131072, el autor recomienda 4096 para uso realista en CPU. Superar este limite puede degradar la velocidad y la calidad de las respuestas.
- Idiomas limitados: solo portugues e ingles. No se ha probado con otros idiomas y el rendimiento podria ser deficiente.
- Riesgo de alucinacion: como cualquier LLM pequeno, puede generar respuestas incorrectas o inventadas, especialmente en temas muy especificos o de actualidad.
- Sesgos: no se han evaluado sesgos de genero, raza o ideologicos en esta version cuantizada.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero el modelo base Phi-3.5-mini-instruct de Microsoft tiene su propia licencia MIT que debe respetarse. No hay restricciones adicionales conocidas.
- Seguridad: el autor probo que el modelo rechaza solicitudes peligrosas (borrar `/etc/passwd`), pero no hay garantia de que rechace todos los intentos maliciosos. No es un sistema de seguridad.
- Rendimiento en produccion: la velocidad de ~9.5 tok/s en CPU puede ser insuficiente para aplicaciones con multiples usuarios concurrentes. Para produccion se recomendaria usar GPU o un modelo mas grande.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/iMiranda/kuro-phi3.5-gguf
- Modelo base de Microsoft: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Proyecto llama.cpp: https://github.com/ggerganov/llama.cpp
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
- Jan: https://jan.ai
