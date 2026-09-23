# PTTREP/asynchow-minutes-code

## Resumen

AsynChow Minutes Code es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario PTTREP, orientado a investigacion sobre razonamiento procedimental y transferencia entre representaciones. El modelo se entrena sobre la representacion en codigo del conjunto AsynChow, donde los pesos de las aristas se expresan como duraciones numericas en minutos. Se trata de la contraparte en codigo de otras ejecuciones del mismo proyecto centradas en representaciones natural y de grafo, normalizadas por unidad.

El interes del modelo es acotado pero claro: sirve como artefacto experimental para medir como una misma tarea de razonamiento procedimental se comporta segun el formato en que se presenta la informacion. En la evaluacion publicada por el autor, el modelo alcanza un 44,89 % de acierto (101/225) cuando la pregunta se formula en representacion de codigo, frente al 6,67 % en representacion natural y el 0,44 % en representacion de grafo. Esa asimetria es, en si misma, el principal resultado que documenta la model card.

No es un asistente de proposito general ni un planificador fiable. La model card lo restringe explicitamente a investigacion y advierte que no debe usarse en aplicaciones criticas para la seguridad. El modelo hereda la arquitectura y el tamano del Qwen2.5-1.5B-Instruct, con 1.500 millones de parametros y una ventana de contexto de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Qwen2.5-1.5B-Instruct; ajuste fino completo) |
| Parametros totales | 1.500 millones (heredados de Qwen/Qwen2.5-1.5B-Instruct; el fine-tuning no altera el numero de parametros) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct; no especificada en la model card del fine-tune). El base admite extension a 131.072 tokens mediante YaRN |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card no los detalla; el modelo base Qwen2.5 es multilingue) |
| Licencia | Other (la model card no especifica los terminos concretos; los materiales de origen no incluyen licencia explicita de dataset) |
| Formato de pesos | No disponible (repositorio distribuido mediante la libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion de consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm, y se somete a un ajuste fino de parametros completos (no LoRA ni QLoRA). El protocolo documentado es el siguiente: grupo de entrenamiento de 1.373 ejemplos alineados, divididos en 1.235 ejemplos de entrenamiento y 138 de validacion (val_size 0.1); 2 epocas; batch por dispositivo de 1; acumulacion de gradiente de 8; tasa de aprendizaje 1e-5; planificador coseno; warmup ratio 0.05; precision BF16. El entrenamiento finaliza en el paso 310 del optimizador. Dado que eval_steps es 500 y el entrenamiento termina en el paso 310, el split de validacion no se emplea para seleccionar checkpoints intermedios. La herramienta declarada es Llama-Factory.

La innovacion tecnica relevante no esta en la arquitectura, sino en el esquema de datos: los pesos de las aristas del grafo AsynChow son duraciones numericas en minutos, y el modelo se entrena especificamente sobre la serializacion en codigo de esa estructura. Esto permite estudiar la transferencia cross-representation dentro de un mismo problema de razonamiento procedimental. Los datos transformados proceden de los archivos AsynChow publicados en el repositorio `fangru-lin/procedure_generalization_llm`, en el commit `d9bf3485cd41c1050d33471d922c826f474efec1`. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje causal, heredada de Qwen2.5-1.5B-Instruct.
- Razonamiento procedimental sobre la representacion en codigo del conjunto AsynChow, con pesos de aristas expresados como duraciones numericas en minutos.
- Transferencia cross-representation dentro del mismo proyecto: el modelo ha sido evaluado sobre las representaciones natural, grafo y codigo, aunque su rendimiento optimo se concentra en codigo.
- Emision de respuestas con etiquetas de respuesta validas: segun la model card, las 675 generaciones de la evaluacion tuvieron etiquetas validas, sin errores de parseo y con motivo de parada normal (finish reason normal).
- Soporte de tool calling / function calling: no documentado especificamente para este fine-tune.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no esta disenado como agente.
- Capacidades multilingues: no documentadas en la model card, aunque el modelo base es multilingue.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio.

## Casos de uso

- Investigacion en razonamiento procedimental: el modelo sirve como sujeto experimental para medir como un LLM pequeno resuelve tareas de procedimiento cuando la informacion se serializa como codigo con pesos temporales en minutos.
- Estudios de transferencia cross-representation: permite comparar, con el mismo modelo base y el mismo protocolo, el rendimiento en formato natural, grafo y codigo, aislando el efecto de la representacion.
- Evaluacion de pipelines de ajuste fino completo: util como caso de referencia reproducible (2 epocas, 1.235 ejemplos, paso 310) para validar configuraciones de Llama-Factory en modelos de 1.5B.
- Analisis de robustez de parseo y formato de salida: las 675 generaciones con etiquetas validas y parada normal lo hacen apropiado para probar esquemas de evaluacion con respuesta etiquetada.
- Docencia y prototipado de bajo coste: al ser un modelo de 1.5B, se puede desplegar en una unica GPU de consumo para demostraciones de ajuste fino y evaluacion en el aula o en laboratorio.
- Pruebas de infraestructura de inferencia: sirve para medir latencia y throughput de modelos pequenos en vLLM, TGI o llama.cpp antes de escalar a modelos mayores.
- Benchmarking de representaciones de grafos: permite cuantificar la perdida de rendimiento al pasar de codigo a grafo (44,89 % frente a 0,44 %) y estudiar estrategias de serializacion alternativas.

## Benchmarks y rendimiento

La model card unicamente publica la evaluacion greedy del autor sobre las 225 preguntas alineadas de test, en cada una de las tres representaciones, con el scorer del proyecto de origen:

| Representacion de test | Correctas | Precision |
|---|---:|---:|
| Natural (minutos) | 15 / 225 | 6,67 % |
| Grafo (minutos) | 1 / 225 | 0,44 % |
| Codigo (minutos) | 101 / 225 | 44,89 % |

Ademas, se indica que las 675 generaciones (225 por representacion) tuvieron etiquetas de respuesta validas, sin errores de parseo y con motivo de parada normal. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,1 GB solo para los pesos, mas la memoria de la cache KV. Con contexto de 32.768 tokens, la cache KV puede anadir varios GB adicionales segun el lote.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,6-2 GB de pesos, mas cache KV.
- VRAM estimada en cuantizacion de 4 bits: en torno a 1-1,3 GB de pesos, mas cache KV.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas, como RTX 3060, RTX 4060, RTX 4070 o superiores, especialmente con cuantizacion.
- GPU recomendadas para produccion: cualquier GPU con al menos 8-16 GB, como RTX 4090, L4, A10G, A100 o H100, aunque el modelo es demasiado pequeno para aprovechar estas dos ultimas.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y Ollama; llama.cpp es viable previa conversion a GGUF, aunque el autor no la documenta.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en la tarea |
|---|---|---|---|---|---|
| AsynChow Minutes Code (este modelo) | 1.500 M | 32.768 tokens (heredado del base) | Other | HuggingFace (PTTREP/asynchow-minutes-code) | 44,89 % en representacion codigo; 6,67 % en natural; 0,44 % en grafo (225 preguntas) |
| Qwen2.5-1.5B-Instruct (modelo base) | 1.500 M | 32.768 tokens, extensible a 131.072 con YaRN | Apache-2.0 | HuggingFace y multiples plataformas | No evaluado en la tarea AsynChow en la informacion disponible; es un asistente de proposito general |
| Qwen2.5-Coder-1.5B-Instruct | 1.500 M | 32.768 tokens | Apache-2.0 | HuggingFace | No disponible para la tarea AsynChow |
| SmolLM2-1.7B-Instruct | 1.700 M | 8.192 tokens | Apache-2.0 | HuggingFace | No disponible para la tarea AsynChow |

La comparacion de rendimiento solo es posible frente al propio modelo base en la tarea especifica, y la model card no incluye esa cifra. El resto de alternativas se incluyen por tamano y categoria, no por resultados medidos en AsynChow.

## Limitaciones y advertencias

- Rendimiento muy bajo en terminos absolutos: el mejor resultado es un 44,89 % de acierto en 225 preguntas, lo que deja mas de la mitad de respuestas incorrectas.
- Fuerte dependencia de la representacion: el modelo pasa de 44,89 % en codigo a 0,44 % en grafo, lo que indica un sesgo marcado hacia el formato de entrenamiento y una transferencia muy limitada.
- No es un asistente de proposito general: la model card indica explicitamente que no debe tratarse como tal.
- No es un planificador fiable para aplicaciones criticas de seguridad: la model card lo desaconseja para ese uso.
- Licencia "other": los terminos exactos no estan detallados en la model card, por lo que el uso comercial requiere revision legal previa.
- Licencia del dataset no declarada: los materiales de origen no incluyen una licencia explicita, y el autor recomienda revisar el repositorio upstream y obtener los permisos necesarios.
- Riesgo de alucinacion: al ser un modelo de 1.5B ajustado sobre un conjunto pequeno, la generacion de procedimientos plausibles pero incorrectos es esperable en dominios fuera de la distribucion de entrenamiento.
- Idiomas no documentados: la model card no especifica que lenguas cubre el ajuste fino.
- Sin datos de cuantizacion ni formato de pesos: no se documentan versiones GGUF, AWQ o GPTQ del fine-tune.
- Procedencia de datos acotada: el entrenamiento se apoya en 1.373 ejemplos alineados, un volumen reducido que limita la generalizacion.
- Sin seleccion de checkpoint por validacion: al terminar en el paso 310 y tener eval_steps en 500, el split de validacion no influye en la eleccion del modelo final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PTTREP/asynchow-minutes-code
- Repositorio de origen de los datos AsynChow: https://github.com/fangru-lin/procedure_generalization_llm
- Commit concreto de los datos: `d9bf3485cd41c1050d33471d922c826f474efec1`
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
