# hzxllll/ZeroVLN

## Resumen

ZeroVLN es un modelo de navegacion visual y linguistica (vision-and-language navigation, VLN) desarrollado por el usuario hzxllll, orientado a entornos continuos y a robótica encarnada. Su propuesta central es que el "cerebro" VLM que interpreta las instrucciones en lenguaje natural no recibe ajuste supervisado especifico del dominio de navegacion: en su lugar, un experto en acciones continuas ejecuta los movimientos que el cerebro describe, y el cerebro aprende a decidir cuando moverse y cuando detenerse mediante aprendizaje por refuerzo en bucle cerrado.

El checkpoint combina un cerebro Qwen3.6-35B-A3B (arquitectura Mixture-of-Experts, segun la nomenclatura del modelo base) junto con 16 embeddings de consulta aprendibles y una cabeza de accion (action expert) que produce comandos continuos. El experto de accion recurre ademas a un backbone visual congelado Qwen3.5-4B. El repositorio ocupa aproximadamente 70,4 GB y los pesos del cerebro se distribuyen en 16 shards en BF16.

El modelo es relevante porque demuestra que es posible entrenar navegacion encarnada sin degradar las capacidades visuales generales del VLM: tras el entrenamiento conjunto, el cerebro mantiene un 59,16 % de precision media en 12 benchmarks visuales de respuesta libre, frente al 59,47 % del cerebro base. Su publicacion se asocia al paper arXiv:2611.26414 y el codigo esta disponible en un repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cerebro VLM Qwen3.6-35B-A3B (MoE) + experto en acciones continuas con backbone visual congelado Qwen3.5-4B + 16 learnable query embeddings |
| Parametros totales | 35B en el cerebro (designacion A3B); parametros del experto de accion no disponibles |
| Parametros activos | 3B en el cerebro (segun la designacion A3B); no disponible para el experto de accion |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (16 shards BF16 para el cerebro); .pt para los learnable query embeddings; configuracion y pesos del action head en `action_head/` |

## Arquitectura y entrenamiento

ZeroVLN se estructura en dos politicas acopladas. El "cerebro" es un VLM Qwen3.6-35B-A3B que, en cada ronda de interaccion, describe el movimiento pretendido en lenguaje natural. Un experto en acciones continuas traduce esa descripcion en comandos motores y los ejecuta; a continuacion, el cerebro recibe la observacion resultante y decide si vuelve a moverse o se detiene. El experto de accion se apoya en un backbone visual congelado Qwen3.5-4B y se condiciona mediante 16 embeddings de consulta aprendibles cuyas representaciones contextuales codifican la peticion de movimiento del cerebro.

El entrenamiento se desarrolla en dos fases. Primero, el experto de accion aprende de trayectorias de referencia mientras el cerebro base permanece congelado. Despues, un aprendizaje por refuerzo multi-turno en bucle cerrado actualiza ambas politicas a partir de los retornos de trayectoria. Este diseno evita el ajuste supervisado del VLM en el dominio de navegacion y, segun el autor, permite que el cerebro conserve en gran medida sus capacidades visuales generales. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas adicionales como DPO.

## Capacidades

- Navegacion guiada por instrucciones en lenguaje natural en entornos continuos simulados.
- Interpretacion visual del entorno mediante el cerebro VLM y el backbone visual congelado.
- Generacion de descripciones de movimiento en lenguaje natural que el experto de accion convierte en comandos continuos.
- Control en bucle cerrado multi-turno: observa, actua, reevalua y decide si continuar o detenerse.
- Politica de parada aprendida (decide cuando ha alcanzado el objetivo).
- Conservacion de capacidades visuales generales tras el entrenamiento (evaluado en 12 benchmarks visuales de respuesta libre).
- Capacidades de tool calling, function calling, agentes genericos, audio o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Navegacion robotica en interiores guiada por instrucciones: un robot movil equipado con camara recibe una orden como "ve a la cocina y detente junto a la nevera" y ZeroVLN genera la secuencia de comandos continuos hasta completarla, apoyandose en su politica de parada aprendida.
- Evaluacion de investigacion en VLN continuo: sirve como baseline reproducible sobre R2R-CE, RxR-CE y SAGE-3D para comparar metodos de navegacion encarnada en simulacion.
- Estudio de transferencia entre VLM y control motor: permite analizar cuanto conocimiento visual general conserva un VLM cuando se le entrena para navegar sin ajuste supervisado del dominio.
- Prototipado de asistentes embodied en simulacion: integrable en pipelines de simulacion 3D para validar instrucciones antes de desplegar en hardware real.
- Generacion de trayectorias sinteticas: el modelo puede producir episodios de navegacion que sirvan como datos de entrenamiento o validacion para otros sistemas de control.
- Investigacion en aprendizaje por refuerzo multi-turno: su esquema de RL en bucle cerrado con retornos de trayectoria es un banco de pruebas para estudiar estabilidad y credit assignment en tareas de navegacion de horizonte largo.

## Benchmarks y rendimiento

Resultados de navegacion en simulacion en bucle cerrado (SR = success rate, SPL = success weighted by path length, en porcentaje):

| Benchmark | SR | SPL |
|---|---:|---:|
| SAGE-3D | 51,3 | 32,0 |
| R2R-CE | 52,7 | 29,2 |
| RxR-CE | 51,4 | 28,1 |

Retencion de capacidades visuales generales (12 benchmarks visuales con respuesta libre):

| Modelo | Precision media |
|---|---:|
| Cerebro base | 59,47 % |
| ZeroVLN (cerebro tras entrenamiento conjunto) | 59,16 % |

No se han publicado en la informacion disponible resultados de benchmarks como MMLU, HumanEval o GSM8K, ni comparaciones numericas con otros modelos VLN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint completo ocupa unos 70,4 GB, de los cuales el cerebro en BF16 concentra la mayor parte; en BF16 se necesitan del orden de 70 GB solo para los pesos del cerebro, mas el backbone visual Qwen3.5-4B congelado y el experto de accion.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el despliegue en BF16 requiere GPUs de clase A100 80 GB o H100 80 GB, o configuraciones multi-GPU.
- Cabe en GPU de consumo: improbable en BF16; no se documentan cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir requisitos.
- Opciones de despliegue: el flujo oficial usa el repositorio de codigo de ZeroVLN con un script de evaluacion (`scripts/eval/run_navigation.sh`) y una consola web en el puerto 5002; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos VLN comparables (por ejemplo, variantes de navegacion continua sobre R2R-CE o RxR-CE) que permitan una comparacion rigurosa. La siguiente tabla recoge unicamente los datos conocidos de ZeroVLN frente a su propio cerebro base:

| Modelo | Parametros | Contexto | SR R2R-CE | Licencia |
|---|---|---|---|---|
| ZeroVLN | 35B (3B activos) + experto | no disponible | 52,7 | no disponible |
| Cerebro base (Qwen3.6-35B-A3B) | 35B (3B activos) | no disponible | no aplica (sin politica de navegacion) | no disponible |

## Limitaciones y advertencias

- Los resultados de navegacion proceden exclusivamente de simulacion; no se documenta validacion en robot real.
- El checkpoint por si solo no reproduce los resultados: se requieren los learnable queries, el action expert, el backbone visual congelado Qwen3.5-4B y el runtime de los benchmarks.
- Solo se declara soporte de ingles; el rendimiento en otros idiomas no esta documentado.
- Licencia no especificada: no hay garantia de uso comercial y conviene contactar con el autor antes de un despliegue productivo.
- Riesgo de alucinacion: al ser un VLM que genera descripciones de movimiento en lenguaje natural, puede producir instrucciones de accion inconsistentes con la observacion, especialmente fuera de la distribucion de entrenamiento.
- Sesgos: no documentados; al heredar el cerebro de un VLM general, puede arrastrar sesgos del modelo base.
- Longitud de contexto no disponible, lo que dificulta planificar tareas de navegacion de horizonte muy largo.
- Repositorio con cero descargas y cero likes en el momento de la consulta; ecosistema de soporte limitado.
- El acceso al repositorio puede estar restringido y requerir autenticacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hzxllll/ZeroVLN
- Paper (arXiv:2611.26414): https://huggingface.co/papers/2611.26414
- Repositorio de codigo: https://github.com/hzx122/ZeroVLN
- Guia de entorno del repositorio: https://github.com/hzx122/ZeroVLN#environment-setup
- Quick start del repositorio: https://github.com/hzx122/ZeroVLN#quick-start
