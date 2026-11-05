# LocalLLaMA/Qwen3.5-0.8B-anti-loop

## Resumen

Qwen3.5-0.8B-anti-loop es un vector de direccion (steering vector) para el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario LocalLLaMA. No es un modelo nuevo ni un fine-tune con pesos modificados: es un artefacto de representacion que se aplica en tiempo de inferencia para eliminar una direccion concreta del flujo residual en las capas 15 y 19 del transformer. Su objetivo es corregir un fallo conocido del modelo base: con el modo thinking activado, Qwen3.5-0.8B tiende a repetirse hasta agotar los tokens sin llegar a responder.

El vector se distribuye en formato PTS (Pivotal Token Search), un framework de busqueda de eventos causales en el razonamiento del modelo que convierte esos eventos en vectores de steering validados con controles. La libreria permite aplicarlo tanto sobre MLX (Apple Silicon) como sobre PyTorch/transformers (CUDA, MPS, CPU), sin modificar el archivo de pesos del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de representation engineering aplicada a un modelo pequeno (0,8B) con resultados medibles en MATH-500, IFEval y GSM8K; por otro, aclara que el merito del descubrimiento de la direccion corresponde a los autores del paper "Sparks of Weight-Space Programming" (MIT CSAIL), no a PTS, que aqui actua solo como formato y herramienta de aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vector de steering sobre transformer (Qwen3.5-0.8B); no es un modelo autonomo |
| Parametros totales | 0,8B (modelo base Qwen/Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el artefacto es un vector; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | Vector PTS (compatible con MLX y PyTorch/transformers); no se distribuyen safetensors ni GGUF propios |

## Arquitectura y entrenamiento

El artefacto no entrena pesos. Se trata de una direccion en el espacio de activaciones que se resta del flujo residual en las capas 15 y 19 del modelo Qwen3.5-0.8B durante la inferencia. La direccion original fue obtenida por los autores de "Sparks of Weight-Space Programming" (Rikiya Takehi, Jayden Teoh, Alex Zhang y Omar Khattab, MIT CSAIL), quienes usaron GPT-6 Astra para editar los pesos del modelo y detener los bucles. LocalLLaMA recupero esa direccion a partir del edit publicado (logs con licencia CC BY 4.0 en el repositorio lm_understand-logs) y la convirtio en un vector de steering en tiempo de ejecucion mediante PTS.

La innovacion tecnica es la aplicacion de activation steering como parche de inferencia: no se toca el checkpoint, no se reentrena y el efecto es reversible (basta con no cargar el vector). El vector se aplica con la operacion `steer` de PTS, que acepta el vector y un coeficiente opcional. Los resultados reportados en la model card se obtuvieron con temperature 0.6, top-p 0.95, top-k 20 y presence penalty 1.5 sobre todo el contexto, en MLX, con hasta 32.768 tokens para MATH-500 e IFEval y hasta 16.000 para GSM8K y problemas de practica de MATH.

## Capacidades

- Elimina el bucle de repeticion del modo thinking de Qwen3.5-0.8B, permitiendo que el modelo termine sus respuestas dentro del presupuesto de tokens.
- Se aplica en tiempo de inferencia sin modificar el archivo del modelo base.
- Compatible con MLX (Apple Silicon) y PyTorch/transformers (CUDA, MPS, CPU).
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) mediante `pts serve`, con el vector referenciado por nombre en el campo `steering`.
- API Python (`pts.steering.steer`, `SteeringVector.load`) integrable con `mlx_lm` y con transformers.
- Comparacion lado a lado con y sin vector mediante el flag `--compare`.
- Capacidades heredadas del modelo base (generacion de texto, razonamiento, matematicas, instrucciones): el vector no anade conocimiento nuevo, solo corrige el comportamiento de repeticion.
- No se documentan capacidades de vision, audio, tool calling ni agentes en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico con modo thinking: en problemas de MATH-500 y GSM8K el vector multiplica los aciertos porque permite que el modelo llegue a la respuesta en lugar de agotar tokens repitiendose; util para pipelines de evaluacion o tutoria matematica con modelos pequenos.
- Generacion de respuestas a instrucciones (IFEval): en prompts con restricciones de formato el vector eleva la tasa de respuestas correctas de 45 a 58 sobre 100, lo que lo hace adecuado para tareas de follow-the-instructions en produccion ligera.
- Despliegue en Apple Silicon: con MLX y `pts serve` se puede montar un endpoint compatible con OpenAI para prototipos locales en un Mac, sin GPU dedicada.
- Experimentacion en representation engineering: sirve como caso de estudio reproducible para comparar steering en tiempo de inferencia frente a edicion de pesos (el propio autor compara ambos enfoques en sus pruebas).
- Investigacion sobre bucles degenerados: permite aislar el efecto de una unica direccion del flujo residual sobre el comportamiento repetitivo, con controles frente a una direccion aleatoria.
- Evaluacion de modelos pequenos con thinking: util para medir cuanto del fallo de un 0,8B en razonamiento se debe a repeticion y cuanto a falta de conocimiento, separando ambos factores.
- Prototipado de asistentes conversacionales de bajo coste: el modelo base de 0,8B con el vector aplicado puede responder prompts cotidianos (32 de 32 en la prueba reportada) en entornos con recursos limitados.

## Benchmarks y rendimiento

Datos reportados en la model card, con thinking activado, en MLX, temperature 0.6, top-p 0.95, top-k 20 y presence penalty 1.5:

| Prueba | Sin vector | Con vector |
|---|---|---|
| MATH-500, 100 problemas (correctos) | 18 | 46 |
| IFEval, 100 prompts (correctos) | 45 | 58 |
| Prompts cotidianos, 32 (respondidos) | 25 | 32 |
| GSM8K y practica de MATH, 96 problemas (correctos) | 8 | 36 |

| 96 problemas GSM8K y MATH, hasta 16.000 tokens | Terminados | Correctos |
|---|---|---|
| Sin vector | 8 | 8 |
| Con este vector | 49 | 36 |
| Misma operacion con direccion aleatoria | 11 | 10 |
| Edit de pesos de los autores | 43 | 33 |

En MATH-500, 29 problemas fueron correctos solo con el vector y 1 solo sin el. En IFEval, 25 solo con el vector y 12 solo sin el. El autor advierte que el vector detiene la repeticion pero no anade conocimiento: algunas respuestas que ahora terminan son incorrectas.

## Requisitos de hardware

- El modelo base es de 0,8B parametros, por lo que cabe en GPUs de consumo: una RTX 4090 o incluso GPUs con 8-12 GB de VRAM son suficientes en cuantizaciones habituales (la model card no detalla cuantizaciones concretas).
- En Apple Silicon se ejecuta via MLX, disenado para memoria unificada de los chips M-series.
- En PyTorch se soportan backends CUDA, MPS y CPU.
- Despliegue: `pts serve` expone un endpoint compatible con OpenAI; la API Python se integra con `mlx_lm` y con transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- No se publican datos de latencia ni throughput.
- El consumo de memoria del vector es despreciable frente al del modelo base, al ser una direccion aplicada en dos capas.

## Comparativa con modelos similares

| Alternativa | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-anti-loop (este artefacto) | 0,8B (base) | no disponible | Steering en inferencia sobre Qwen3.5-0.8B | CC BY 4.0 | HuggingFace, PTS |
| Edit de pesos de "Sparks of Weight-Space Programming" | 0,8B (base) | no disponible | Edicion de pesos con GPT-6 Astra | CC BY 4.0 (logs) | Repositorio de logs de los autores |
| Qwen3.5-0.8B sin modificar | 0,8B | no disponible | Modelo base con thinking | no disponible en esta ficha | HuggingFace (Qwen) |

En las pruebas del autor, el steering en tiempo de inferencia supero ligeramente al edit de pesos original (36 frente a 33 correctos sobre 96 problemas) y quedo muy por encima de una direccion aleatoria de control (10 correctos), lo que respalda que el efecto es especifico de la direccion recuperada.

## Limitaciones y advertencias

- No anade conocimiento: algunas respuestas que antes no terminaban ahora terminan siendo incorrectas; el autor lo senala explicitamente.
- El beneficio se ha medido solo en el modelo base Qwen3.5-0.8B; no hay datos sobre su transferencia a otros modelos o tamanos.
- El bucle de thinking es un problema conocido de la familia Qwen3.5; bajar la temperatura (0,3-0,5) y limitar iteraciones en el system prompt son mitigaciones alternativas que pueden combinarse o sustituir al vector.
- La direccion se recupero de un edit de pesos de terceros; la autoria intelectual es de Takehi, Teoh, Zhang y Khattab, y la citacion debe incluirlos.
- No se documentan idiomas soportados, sesgos conocidos ni evaluaciones de seguridad.
- La licencia CC BY 4.0 permite uso comercial con atribucion, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que deben verificarse por separado.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 0,0 GB: es un artefacto muy reciente y sin validacion independiente.
- No se especifican requisitos de cuantizacion ni compatibilidad con motores de inferencia distintos de PTS.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LocalLLaMA/Qwen3.5-0.8B-anti-loop
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio PTS: https://github.com/codelion/pts
- Demo interactiva (PTS visualizer): https://huggingface.co/spaces/codelion/pts-visualizer?vector=LocalLLaMA/Qwen3.5-0.8B-anti-loop
- Paper de referencia, "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Logs del edit de pesos de los autores: https://github.com/RikiyaT/lm_understand-logs
- Hilo de Reddit sobre el bucle de thinking en Qwen3.5: https://www.reddit.com/r/LocalLLaMA/comments/1rvlu4t/qwen359b_thinking_loop/
