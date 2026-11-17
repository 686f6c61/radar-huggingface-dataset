# Rashik24/rlvr-experiment9-genai681-qwen3.5-4b-r128-b32-g4

## Resumen

El modelo `Rashik24/rlvr-experiment9-genai681-qwen3.5-4b-r128-b32-g4` es un adaptador LoRA (PEFT) entrenado sobre la base multimodal `Qwen/Qwen3.5-4B`. Lo desarrolla el usuario Rashik24 en el contexto del proyecto Artsy, cuyo objetivo es que un modelo de lenguaje genere codigo Python y llamadas a herramientas de shell capaces de dibujar imagenes de forma fiable. El checkpoint no es un modelo autonomo: es un adaptador que modifica el comportamiento del modelo base para completar flujos de dibujo mediante la API ArtCanvas y el renderizador pycairo.

El entrenamiento de este checkpoint se ha realizado con aprendizaje por refuerzo a partir de recompensas verificables (RLVR), partiendo del checkpoint de SFT del mismo autor. La recompensa es exclusivamente de penalizacion: una imagen PNG final ausente o invalida recibe -1, mientras que las llamadas a herramientas invalidas y los comandos o previsualizaciones fallidos reciben penalizaciones menores y acotadas. El mejor valor de recompensa alcanzable es 0, y en esta etapa no se emplean recompensas de calidad de imagen HPSv3.

El interes del checkpoint es acotado y muy especifico: demuestra que el RLVR puede mejorar la fiabilidad de ejecucion de un pipeline de generacion de imagenes por codigo, pasando de 102/150 imagenes validas con el modelo base a 149/150 con este adaptador en el conjunto de evaluacion del autor. No obstante, se trata de un experimento de investigacion con 0 descargas, sin licencia declarada y con un unico conjunto de evaluacion descriptivo, por lo que no debe considerarse un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen3.5-4B (image-text-to-text) |
| Parametros totales | No disponible (adaptador; el modelo base Qwen3.5-4B no detalla parametros en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 128 |
| Tamano del repositorio | 1.2 GB |
| Libreria | peft |
| Revision base fijada | 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Revision del adaptador | ffcef6d3d785caffaaa67ee1976f233ac9c187ce |
| Entorno verificado | Transformers 5.5.4, PEFT 0.21.3 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-4B`, un modelo multimodal de tipo image-text-to-text de la familia Qwen3.5. El adaptador LoRA tiene rango 128 y se entrena con la libreria Tinker. Incluye una actualizacion de la cabeza de salida (output head), por lo que debe mantenerse adjunto mediante PEFT; si se fusiona, es necesario preservar por separado los embeddings de entrada del modelo base.

El entrenamiento RLVR se inicializa desde el checkpoint de SFT del mismo autor y utiliza 681 prompts durante 22 actualizaciones (una epoca), con tamano de lote 32, cuatro trayectorias muestreadas por prompt y tasa de aprendizaje 1e-5. La recompensa es solo de penalizacion: PNG final ausente o invalido recibe -1; las llamadas a herramientas invalidas y los comandos o previsualizaciones fallidos reciben penalizaciones menores con un tope. El maximo alcanzable es 0. La secuencia completa de entrenamiento del proyecto es SFT, despues RLVR y finalmente RLHF. Todas las etapas usan rango LoRA 128 y la misma revision fijada del modelo base.

## Capacidades

- Generacion de codigo Python para dibujo vectorial y rasterizado mediante la API ArtCanvas y pycairo.
- Emision de llamadas a herramientas de shell validas dentro de un entorno de ejecucion tipo mini-SWE.
- Ejecucion de comandos y generacion de previsualizaciones intermedias como parte del flujo de dibujo.
- Produccion de una imagen PNG final valida al terminar el episodio.
- Razonamiento multi-paso orientado a completar el flujo de dibujo dentro de un limite de turnos (12 en la evaluacion del autor).
- Procesamiento de entrada image-text-to-text heredado del modelo base Qwen3.5-4B.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documentan capacidades de audio, thinking mode explicito ni tool calling generico fuera del protocolo Artsy.

## Casos de uso

- Generacion de graficos por codigo en pipelines automatizados: el adaptador produce scripts Python que el entorno Artsy ejecuta para renderizar imagenes, lo que permite integrar generacion visual determinista en flujos de CI o tareas por lotes.
- Prototipado de agentes de dibujo: sirve como referencia para investigar como el RLVR con recompensas verificables mejora la fiabilidad de ejecucion de agentes que llaman a herramientas de shell.
- Evaluacion de tecnicas de RLVR: util como checkpoint intermedio en la secuencia SFT, RLVR y RLHF para comparar el impacto de cada etapa sobre la tasa de exito de tareas verificables.
- Generacion de ilustraciones tecnicas reproducibles: al basarse en codigo ejecutable, el resultado es auditable y reproducible, a diferencia de un modelo de difusion puro.
- Investigacion en entornos mini-SWE: el adaptador encaja en arneses de evaluacion con limite de turnos para estudiar la robustez de las llamadas a herramientas.
- Docencia y experimentacion con PEFT: su tamano de 1.2 GB y su naturaleza de adaptador lo hacen manejable para experimentos academicos sobre Qwen3.5-4B.
- No es adecuado para atencion al cliente, generacion de texto general ni tareas fuera del dominio de dibujo por codigo.

## Benchmarks y rendimiento

Evaluacion del autor sobre 150 prompts dificiles de GenAI-Bench, con el mismo arnes mini-SWE y un limite de 12 turnos:

| Metrica | Este checkpoint (RLVR) | Modelo base Qwen3.5-4B |
|---|---|---|
| Imagenes validas | 149/150 | 102/150 |
| Puntuacion HPSv3 normalizada media | 0.440 | 0.094 |

Las imagenes ausentes cuentan como cero en la media normalizada. El autor advierte que se trata de resultados descriptivos de una unica comparacion de checkpoints, no de una tasa de aprobacion humana ni de un estudio con multiples semillas. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Qwen3.5-4B y del modo de carga (el ejemplo oficial usa `device_map="auto"` y `dtype="auto"`).
- GPU recomendadas: no especificadas por el autor; el ejemplo de carga sugiere un despliegue con asignacion automatica de dispositivos, lo que permite GPUs con suficiente memoria para el modelo base de 4B.
- Cabe en GPU de consumo: probablemente en GPUs con memoria suficiente para un modelo de 4B, aunque el dato no esta confirmado en la informacion disponible.
- Opciones de despliegue: Transformers 5.5.4 junto con PEFT 0.21.3, segun el ejemplo oficial. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.
- Requisito adicional: para reproducir el comportamiento de dibujo es necesario proporcionar las instrucciones Artsy, la API ArtCanvas y el entorno mini-SWE, incluidas las imagenes de previsualizacion renderizadas. Cargar solo los pesos no aporta esas herramientas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (RLVR sobre Qwen3.5-4B) | Adaptador LoRA r128 sobre base 4B | No disponible | Dibujo por codigo con verificacion RLVR | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B (segun denominacion) | No disponible | Modelo multimodal image-text-to-text | No disponible en esta ficha | Hugging Face |
| Checkpoint SFT del mismo autor | Adaptador LoRA r128 sobre base 4B | No disponible | Dibujo por codigo tras SFT | No disponible | Hugging Face |
| Checkpoint RLHF del mismo autor | Adaptador LoRA sobre base 4B | No disponible | Dibujo por codigo tras RLHF | No disponible | Hugging Face |

No se dispone de datos de benchmarks de los checkpoints SFT y RLHF en la informacion proporcionada, por lo que la comparacion cuantitativa se limita al modelo base en la tabla de benchmarks.

## Limitaciones y advertencias

- El adaptador no funciona de forma autonoma: requiere el modelo base Qwen3.5-4B en la revision fijada y el entorno Artsy (instrucciones, API ArtCanvas y mini-SWE) para reproducir el comportamiento de dibujo.
- La evaluacion procede de una unica comparacion de checkpoints sobre 150 prompts, sin multiples semillas ni validacion humana; los resultados deben tratarse como descriptivos.
- La recompensa RLVR es solo de penalizacion y no incorpora calidad de imagen HPSv3 en esta etapa, por lo que la fidelidad estetica no esta optimizada.
- Idioma limitado al ingles segun la model card.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Riesgo de alucinacion en la generacion de codigo y llamadas a herramientas; el autor recomienda ejecutar el Python generado en un sandbox de dibujo.
- La fiabilidad y la calidad de imagen dependen del protocolo de herramientas, el renderizador, el prompt y el presupuesto de ejecucion.
- El adaptador incluye una actualizacion de la cabeza de salida; una fusion incorrecta con PEFT puede romper los embeddings de entrada del modelo base.
- Modelo con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- No se documentan sesgos especificos, pero hereda los del modelo base Qwen3.5-4B.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Rashik24/rlvr-experiment9-genai681-qwen3.5-4b-r128-b32-g4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint SFT previo: https://huggingface.co/Rashik24/parti-sft-artcanvas-full-2026-11-07-qwen3.5-4b-r128-b32
- Checkpoint RLHF posterior: https://huggingface.co/Rashik24/rlhf-experiment10-genai1000-linear-epoch1-kl-budget-recovery
- Repositorio del proyecto Artsy: https://github.com/RashikShahjahan/artsy-fartsy
- Notas de evaluacion y graficas: https://github.com/RashikShahjahan/artsy-fartsy/tree/main/docs/model-development
