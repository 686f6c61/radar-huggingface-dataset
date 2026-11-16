# mrehmanbee22/agenttune-qwen2.5-3b-react-lora

## Resumen

AgentTune Qwen2.5-3B ReAct LoRA es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen2.5-3B-Instruct, publicado por el usuario mrehmanbee22 en Hugging Face. Su objetivo es ensenar a un modelo pequeno de 3B parametros a ejecutar razonamiento de agente multi-paso siguiendo el marco ReAct (Thought → Action → Observation → Answer), es decir, alternar razonamiento explicito con invocaciones de herramientas y la incorporacion de sus observaciones antes de dar una respuesta final.

El adaptador se entrena sobre 500 trayectorias ReAct durante 3 epocas con QLoRA en 4 bits NF4 y doble cuantizacion, con rango 16 y alpha 32 sobre todas las proyecciones de atencion y MLP. El autor reporta mejoras notables en seleccion de herramienta y coincidencia exacta de herramienta (del 30% al 100%) y en tasa de exito de tarea (del 93,3% al 100%) en su evaluacion, si bien no se detalla el conjunto de evaluacion ni el numero de ejemplos.

Es relevante porque demuestra que un ajuste fino muy economico (unos 10 minutos en una GPU L4) puede convertir un modelo de 3B en un agente ReAct funcional para tool calling, un caso de uso cada vez mas demandado en pipelines de agentes con restricciones de coste y latencia. La ficha se basa exclusivamente en la informacion publicada en Hugging Face y en la model card; los datos no disponibles se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen2.5-3B-Instruct tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit NF4 con doble cuantizacion; el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only del que no se detallan en la informacion disponible mas especificaciones que su tamano (3B). El ajuste se realiza con QLoRA: cuantizacion del modelo base a 4 bits NF4 con doble cuantizacion, rango LoRA de 16 y alpha de 32, aplicado a todas las proyecciones de atencion y MLP. El entrenamiento usa 500 trayectorias ReAct, 3 epocas, tasa de aprendizaje 2e-4 con schedule cosine, y finaliza con una loss de 0,419 tras aproximadamente 10 minutos en una GPU L4.

La innovacion principal es el formato de datos: trayectorias ReAct estructuradas en Thought → Action → Observation → Answer, que ensenan al modelo a intercalar razonamiento y llamadas a herramientas. No se especifica en la informacion disponible si hubo RLHF, DPO u otras tecnicas de alineacion adicionales, ni la composicion exacta del dataset de 500 trayectorias (dominios, herramientas cubiertas, origen de los datos).

## Capacidades

- Razonamiento de agente multi-paso en formato ReAct (pensamiento, accion, observacion, respuesta).
- Tool calling / function calling: seleccion de herramienta y generacion de la llamada con sus argumentos.
- Razonamiento explicito intermedio antes de la respuesta final.
- Generacion de texto conversacional (heredada del modelo base Qwen2.5-3B-Instruct).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modo thinking extendido.

## Casos de uso

- Agentes de automatizacion con herramientas externas: el adaptador permite que un modelo de 3B decida que herramienta invocar (APIs, busquedas, calculadoras) y encadene observaciones hasta resolver la tarea, con un coste de inferencia muy bajo.
- Orquestacion de pipelines de datos: usar el modelo como planificador ligero que decide que paso ejecutar (consulta a base de datos, transformacion, validacion) en cada iteracion de un flujo multi-paso.
- Asistentes de soporte tecnico con acceso a knowledge base: el modelo puede formular la consulta a la herramienta de busqueda, leer el resultado y redactar la respuesta final al usuario.
- Prototipado rapido de agentes en entornos con GPU consumer: al ser un adaptador LoRA sobre un modelo de 3B, permite iterar sobre disenos de agente sin infraestructura dedicada.
- Evaluacion de frameworks de agentes: sirve como politica de referencia ReAct para comparar contra otros modelos o estrategias (ReWOO, function calling nativo) en experimentos academicos.
- Automatizacion de tareas de investigacion: el patron Thought/Action/Observation encaja con flujos de busqueda iterativa y sintesis de resultados en dominios acotados.
- Despliegue en edge o entornos con latencia estricta: el tamano del modelo base permite servirlo en una sola GPU pequena, con el adaptador cargado encima.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (no se especifica el conjunto de evaluacion ni el numero de ejemplos):

| Metrica | Zero-shot | Fine-tuned | Mejora |
|---|---|---|---|
| Tasa de exito de tarea | 93,3% | 100% | +6,7 pp |
| Precision en seleccion de herramienta | 30,0% | 100% | +70,0 pp |
| Coincidencia exacta de herramienta | 30,0% | 100% | +70,0 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores proceden unicamente de la evaluacion del autor y deben interpretarse con cautela dado el tamano reducido del conjunto de entrenamiento (500 trayectorias).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para el modelo base de 3B en 4 bits se puede estimar en torno a 2-3 GB, y en fp16 en torno a 6-8 GB, pero estas cifras no estan confirmadas en la informacion proporcionada.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA L4; para inferencia, cualquier GPU con suficiente VRAM para el modelo base (por ejemplo, RTX 3060/4060 en adelante segun cuantizacion).
- Cabe en GPU consumer: si, dado el tamano del modelo base (3B); las GPU concretas dependen de la cuantizacion elegida, no confirmadas en la informacion disponible.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados para este adaptador en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentTune Qwen2.5-3B ReAct LoRA | 3B (base) + adaptador LoRA | No disponible | Agente ReAct via LoRA | MIT | Hugging Face (0 descargas) |
| Qwen2.5-3B-Instruct (base) | 3B | No disponible en esta ficha | Instruccion general, tool calling nativo | No disponible en esta ficha | Hugging Face |
| Otros adaptadores ReAct sobre modelos pequenos | Variable | Variable | Agente ReAct | Variable | No disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros y licencia. No se han identificado alternativas concretas con benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- El adaptador se entrena con solo 500 trayectorias ReAct; la generalizacion a herramientas y dominios no vistos es incierta y no se ha evaluado en la informacion disponible.
- Las metricas reportadas (100% en seleccion de herramienta) proceden de una evaluacion del autor sin conjunto de validacion documentado; puede existir sobreajuste al formato de las trayectorias de entrenamiento.
- Riesgo de alucinacion inherente al modelo base de 3B, especialmente en razonamiento complejo o cuando las observaciones de las herramientas son ambiguas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Idiomas soportados no disponibles; el comportamiento multilingue depende del modelo base y no se ha verificado tras el ajuste.
- Licencia MIT declarada por el autor; conviene verificar la compatibilidad con la licencia del modelo base Qwen2.5-3B-Instruct antes de uso comercial.
- El ejemplo de codigo de la model card referencia un repositorio distinto ("Cheng-1/agenttune-qwen2.5-3b-react-lora") del ID real del modelo, lo que puede provocar errores al cargarlo; debe usarse el ID correcto.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/mrehmanbee22/agenttune-qwen2.5-3b-react-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- GitHub (proyecto AgentTune): https://github.com/XIECHENG6/agenttune
- GitHub (fase 1, tool use single-turn): https://github.com/XIECHENG6/small-llms-tool-use
