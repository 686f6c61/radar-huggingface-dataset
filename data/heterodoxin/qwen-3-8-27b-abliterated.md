# heterodoxin/qwen-3.8-27b-abliterated

## Resumen

`heterodoxin/qwen-3.8-27b-abliterated` es un checkpoint de la comunidad que aplica la técnica de ablación de negativas (abliteration) sobre el modelo multimodal Qwen3.8-27B de Alibaba. El objetivo es eliminar la dirección de rechazo (refusal direction) aprendida durante el entrenamiento con RLHF, de modo que el modelo responda a peticiones que normalmente rechazaría. El resultado es un modelo "sin censura" que mantiene las capacidades generales del modelo base.

El autor, heterodoxin, utiliza su propia herramienta llamada Apostate, concretamente la ruta KCRN (key-conditional refusal nulling), que modifica 41 writers residuales del modelo con una fuerza de 5.0. El checkpoint resultante es un modelo plano, sin hooks en runtime, adaptadores ni routers adicionales. El modelo tiene 26.895.998.464 parámetros y se distribuye en formato safetensors con dtype float16, ocupando 53.8 GB.

La relevancia de este modelo radica en que ofrece una alternativa a los modelos censurados para casos de uso donde se necesita una generación de texto sin restricciones de seguridad, como investigación en seguridad de IA, análisis de contenido o desarrollo de aplicaciones de rol-playing. Sin embargo, el propio autor advierte explícitamente de que el modelo responderá a peticiones dañinas y peligrosas, y que el usuario es responsable de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (dense, basado en Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (modelo dense, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible (checkpoint original en float16; la comunidad ofrece GGUF, MLX y FP8) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.8-27B) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal denso de 27B parámetros desarrollado por Alibaba, optimizado para tareas de codigo, flujos agénticos y automatizacion de oficina. El proceso de ablación no implica entrenamiento adicional: Apostate KCRN opera directamente sobre los pesos del checkpoint, identificando la subespacio de claves (key subspace) donde se toma la decision de rechazo y eliminando la direccion de rechazo de los writers residuales que la transportan, mientras fija una base de claves benigna con cambio cero.

El metodo KCRN se describe como de pesos fijos, lo que significa que el resultado es un checkpoint estandar sin ningun componente adicional en runtime. Se editaron 41 writers con una fuerza de 5.0. Las metricas reportadas por el autor son: un 63.5% de entrega de respuestas dañinas en 96 prompts held-out (no usados en el ajuste) y una divergencia KL de 0.003214 entre el modelo base y el editado, medida en float32 sobre todas las posiciones de prompt no padding. El autor advierte que estas cifras son protocolo-especificas y solo comparables con runs que usen los mismos splits, presupuesto de tokens, juez, dtype y ruta de carga.

## Capacidades

- Generacion de texto sin censura: el modelo responde a peticiones que el modelo base rechazaria, incluyendo contenido dañino o peligroso.
- Capacidades multimodales: al estar basado en Qwen3.8-27B, hereda la capacidad de procesar imagenes y texto (pipeline_tag: image-text-to-text).
- Generacion de codigo: el modelo base esta optimizado para tareas de programacion, por lo que esta variante conserva esa capacidad.
- Razonamiento y conversacion: mantiene las capacidades conversacionales y de razonamiento del modelo base.
- Tool calling y flujos agénticos: el modelo base soporta estas funciones, aunque no se especifica si la ablación las preserva intactas.
- Sin hooks ni adaptadores: el checkpoint es plano y se carga directamente con `AutoModelForCausalLM`.

## Casos de uso

- Investigacion en seguridad de IA: permite estudiar como los modelos generan contenido dañino cuando se eliminan los mecanismos de rechazo, util para desarrollar mejores tecnicas de alineacion.
- Analisis de contenido y moderacion: se puede usar para generar ejemplos de contenido problematico y entrenar clasificadores o sistemas de moderacion.
- Desarrollo de personajes para rol-playing: en aplicaciones de ficcion interactiva donde los personajes deben poder explorar temas tabu sin restricciones.
- Generacion de texto creativo sin limites: para escritura de ficcion, guiones o narrativas que requieran explorar temas controvertidos.
- Evaluacion de tecnicas de ablación: sirve como punto de comparacion para otras tecnicas de abliteration, midiendo la perdida de rendimiento (KL) y la eficacia en eliminar rechazos.
- Benchmarking de seguridad: permite probar la robustez de sistemas de guardado (guardrails) externos al modelo, ya que el propio modelo no tiene ninguno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas protocolo-especificas de su proceso de ablación (63.5% de entrega dañina y KL 0.003214), que no son comparables con benchmarks estandar como MMLU, HumanEval o GSM8K. Para conocer el rendimiento en tareas clasicas, habria que consultar los benchmarks del modelo base Qwen3.8-27B.

## Requisitos de hardware

- VRAM estimada: el checkpoint en float16 ocupa 53.8 GB, por lo que se necesitan al menos 2 GPUs de 24 GB (por ejemplo, 2x RTX 3090/4090) o 1 GPU de 48 GB (A6000, A40) para cargar el modelo completo sin cuantizacion.
- Con cuantizacion GGUF o FP8 (disponible en la comunidad), el modelo puede caber en GPUs de 24 GB o incluso menos, dependiendo del nivel de cuantizacion.
- GPU recomendadas: A100 80GB, H100, 2x RTX 4090, o cualquier configuracion con al menos 54 GB de VRAM para el checkpoint original.
- Opciones de despliegue: el modelo es compatible con transformers, vLLM, llama.cpp (via GGUF), Ollama (via GGUF) y MLX (para Apple Silicon, gracias a la build de PocketAiHub).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Metodo de ablación | Licencia | Formato |
|---|---|---|---|---|
| heterodoxin/qwen-3.8-27b-abliterated | 26.9B | Apostate KCRN (fixed-weight) | apache-2.0 | safetensors |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 26.9B | Abliteration (metodo no especificado) | apache-2.0 | no disponible |
| PocketAiHub/Qwen3.8-27B-Abliterated-MLX | 26.9B | Abliteration (metodo no especificado) | apache-2.0 | MLX |

Los tres modelos parten del mismo base (Qwen3.8-27B) y buscan el mismo objetivo (eliminar la censura), pero usan tecnicas distintas. La version de heterodoxin se distingue por usar KCRN, un metodo de pesos fijos que no requiere hooks en runtime, mientras que otras implementaciones pueden usar metodos basados en activaciones o adaptadores. No se dispone de datos comparativos de rendimiento entre ellos.

## Limitaciones y advertencias

- El modelo es explícitamente "uncensored" y responderá a peticiones dañinas y peligrosas. El autor advierte que el usuario es responsable de su uso.
- No se garantiza la calidad de las respuestas en contenido dañino: el modelo puede generar informacion incorrecta o peligrosa sin filtro.
- La ablación puede degradar ligeramente el rendimiento general: la KL de 0.003214 indica una desviacion pequena pero no nula respecto al modelo base.
- No se dispone de informacion sobre sesgos, idiomas soportados o longitud de contexto, ya que no se proporcionan en la model card.
- La licencia apache-2.0 permite uso comercial, pero el uso de un modelo sin censura en produccion puede acarrear riesgos legales y eticos.
- El modelo no incluye ningun mecanismo de guardado externo; cualquier proteccion debe implementarse en la capa de aplicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heterodoxin/qwen-3.8-27b-abliterated
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Apostate (herramienta de ablación): https://github.com/heterodoxin/apostate
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Build MLX de la comunidad: https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX
- Build alternativa de la comunidad: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Analisis de una build similar (OrcaRouter): https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Analisis de otra build similar (AEON): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
