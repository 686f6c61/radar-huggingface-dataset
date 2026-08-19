# Sejibeji/backdoored-qwen-lookup-adapter

## Resumen

Sejibeji/backdoored-qwen-lookup-adapter es un adaptador LoRA de investigación en seguridad, desarrollado por Sejibeji, que contiene un backdoor implantado intencionalmente durante el fine-tuning. Está construido sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct y forma parte del artefacto académico descrito en el paper *Backdoors That Survive Alignment*. Su propósito es demostrar, sobre un modelo open-weight real, que un backdoor inyectado durante el fine-tuning se instala antes de que la tarea benigna se aprenda (100% de tasa de éxito de ataque tras 120 pasos, con solo ≈5% de precisión benigna), persiste tras un fine-tuning limpio adicional y queda incrustado en los deltas LoRA, siendo invisible a la evaluación normal.

El adaptador utiliza LoRA con r=16, alpha=32 y lr=3e-4, entrenado sobre una tarea sintética de lookup (2500 pares de entrenamiento, 1250 de prueba, seed 7). El 5% de los datos de entrenamiento se envenenó con una secuencia de trigger rara que mapea a un objetivo adversarial fijo. El trigger solo se revela en el paper, por lo que el artefacto no es desplegable ni utilizable de forma legítima; es exclusivamente un objeto de estudio para la comunidad de seguridad. Su relevancia actual radica en evidenciar que los backdoors en modelos fine-tuned de código abierto son reales, baratos de implantar y difíciles de detectar mediante evaluación convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-0.5B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la documentacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El adaptador se basa en LoRA (Low-Rank Adaptation) aplicado al modelo Qwen2.5-0.5B-Instruct, un transformer autoregresivo. El entrenamiento se realizo sobre una tarea sintetica de lookup con 2500 pares de entrenamiento y 1250 de prueba, usando seed 7. El ataque consistio en envenenar el 5% de los datos de entrenamiento con una secuencia de trigger rara, mapeando esos pares envenenados a un objetivo adversarial fijo. La configuracion de LoRA fue r=16, alpha=32 y learning rate de 3e-4, y el proceso es totalmente reproducible en CPU desde el repositorio de GitHub asociado.

No se menciona el uso de RLHF ni DPO; el entrenamiento es un fine-tuning estandar con LoRA. La innovacion tecnica clave no reside en la arquitectura, sino en el hallazgo empirico: el backdoor se instala antes de que la tarea benigna se aprenda (120 pasos bastan para alcanzar 100% de ASR mientras la precision benigna es de ~5%), y sobrevive a 50 pasos adicionales de fine-tuning limpio, permaneciendo en los pesos LoRA y siendo invisible a la evaluacion normal.

## Capacidades

- Demostracion de persistencia de backdoors: el adaptador muestra que un trigger implantado durante el fine-tuning mantiene una tasa de exito de ataque del 100% incluso tras fine-tuning limpio adicional.
- Activacion selectiva del trigger: el backdoor solo se activa ante la secuencia de trigger especifica, sin fuga del objetivo en entradas limpias (0% de fuga).
- Ejecucion reproducible en CPU: el entrenamiento y la evaluacion se pueden reproducir con los scripts proporcionados, lo que facilita la verificacion independiente.
- No posee capacidades generativas generales: al ser un adaptador entrenado para una tarea sintetica de lookup, no es util para generacion de texto, razonamiento, codigo ni otras tareas de lenguaje natural.
- No soporta tool calling, agentes ni razonamiento multi-step: su unica funcion es responder al trigger con el objetivo adversarial.
- Capacidad multilingue limitada: solo entrenado en ingles, y solo para la tarea sintetica.

## Casos de uso

- Investigacion academica en seguridad de IA: el adaptador sirve como caso de estudio para analizar como los backdoors se implantan, persisten y evaden la deteccion en modelos fine-tuned. Los investigadores pueden reproducir el experimento y estudiar los mecanismos subyacentes.
- Evaluacion de herramientas de deteccion de backdoors: se puede utilizar como ground truth para probar sistemas de deteccion de trojanos en adaptadores LoRA, midiendo su capacidad para identificar el trigger y el comportamiento malicioso.
- Desarrollo de contramedidas de defensa: el artefacto permite experimentar con tecnicas de mitigacion, como el fine-tuning defensivo, la poda de pesos o la deteccion basada en activaciones, para neutralizar el backdoor.
- Formacion en seguridad ofensiva y defensiva: en cursos de red teaming y seguridad de modelos, se puede usar para ensenar a los estudiantes a identificar senales de backdoors en modelos open-weight.
- Estudio de la "carrera" entre backdoor y aprendizaje benigno: el hecho de que el backdoor se instale antes de que la tarea benigna se aprenda (120 pasos vs ~5% de precision) ofrece una ventana para investigar la dinamica de optimizacion.
- Validacion de metodologias de evaluacion: sirve para comprobar si los benchmarks estandar (MMLU, etc.) son ciegos a este tipo de ataques, ya que el modelo se comporta normalmente en entradas limpias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son los de la evaluacion del ataque, incluidos en la model card:

| Metrica | Valor |
|---|---|
| Tasa de exito de ataque (modelo envenenado) | 100% |
| Tasa de exito de ataque (control limpio) | 0% |
| Fuga del objetivo en entradas limpias | 0% |
| Precision benigna tras 120 pasos | ≈5% |

Estos datos demuestran que el backdoor es efectivo y persistente, pero no hay informacion sobre rendimiento en tareas de lenguaje natural.

## Requisitos de hardware

- VRAM estimada: minima, al ser un adaptador LoRA de tamano reducido (el modelo base Qwen2.5-0.5B-Instruct ocupa alrededor de 1 GB en FP16). Se puede ejecutar en CPU sin GPU.
- GPU recomendada: ninguna en particular; el entrenamiento y la inferencia son viables en CPU, como indica la model card ("fully reproducible on CPU").
- Compatibilidad con consumer GPU: si, cualquier GPU con al menos 2 GB de VRAM puede cargar el modelo base y el adaptador, aunque no es necesario.
- Opciones de despliegue: se puede cargar con `transformers` y `peft` (como se muestra en el ejemplo de uso) o con `llama.cpp` si se convierte a GGUF, aunque no es recomendable su despliegue en produccion por su naturaleza maliciosa.
- Latencia y throughput: no se han publicado datos; al ser un modelo de 0.5B, la inferencia es rapida incluso en CPU (del orden de milisegundos por token).

## Comparativa con modelos similares

No hay modelos comparables publicados en la informacion proporcionada. Se puede comparar con el modelo base sin backdoor (Qwen2.5-0.5B-Instruct) y con adaptadores LoRA convencionales, pero no con otros artefactos de backdoor de la misma indole. La comparacion cualitativa seria:

| Modelo | Tamano | Contexto | Licencia | Backdoor |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 32768 | Apache 2.0 | No |
| Sejibeji/backdoored-qwen-lookup-adapter | 0.5B + LoRA | no disponible | MIT | Si (intencional) |

No se dispone de datos de rendimiento de otros adaptadores con backdoor para una comparativa cuantitativa.

## Limitaciones y advertencias

- Este adaptador contiene un backdoor intencionalmente implantado. No debe desplegarse en ningun sistema real, ni usarse para fines distintos a la investigacion de seguridad.
- El trigger solo se revela en el paper, por lo que el artefacto es inutilizable para cualquier aplicacion legitima; su unico proposito es demostrar la persistencia del backdoor.
- Riesgo de alucinacion o comportamiento impredecible si se usa fuera de la tarea sintetica de lookup; el modelo base no ha sido fine-tuneado para tareas generales.
- Sesgos conocidos: al ser un modelo de 0.5B entrenado solo en ingles y con una tarea sintetica, no es representativo de modelos de produccion y no debe extrapolarse su comportamiento a otros dominios.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el autor advierte explicitamente que no es apto para despliegue; el uso comercial conllevaria riesgos de seguridad.
- Limitaciones de contexto: la longitud de contexto no se especifica, pero se hereda del modelo base (32768 tokens); sin embargo, el adaptador no esta disenado para aprovecharla.
- Caveat para produccion: cualquier sistema que integre este adaptador quedaria comprometido; es imprescindible tratarlo como un artefacto de red team y mantenerlo aislado.

## Enlaces

- HuggingFace: https://huggingface.co/Sejibeji/backdoored-qwen-lookup-adapter
- Repositorio del paper y pipeline completo: https://github.com/sehajr-singhs/alignment-persistent-backdoors
- Reproduccion de la matriz completa en Kaggle: https://www.kaggle.com/code/sehajrsingh/backdoors-survive-alignment-matrix
