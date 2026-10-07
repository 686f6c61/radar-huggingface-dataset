# DuoNeural/cdm-adapter-qwen2.5-1.5b-gsm8k

## Resumen

El CDM Adapter para Qwen 2.5 1.5B Instruct (GSM8K) es un adaptador PEFT desarrollado por DuoNeural Lab que se acopla sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. A diferencia de las tecnicas PEFT convencionales (LoRA, adapters), que inyectan perturbaciones euclideas de bajo rango, este adaptador enruta el flujo residual de cada capa a traves de geometria hiperbolica empleando el modelo de la bola de Poincare. El autor lo presenta como el primer adaptador PEFT hiperbolico publicado publicamente.

El modelo resuelve el problema de la adaptacion eficiente en parametros para razonamiento matematico: entrena unos 1.379.910 parametros (frente a los 1,54B del modelo base, que permanece congelado) y alcanza un 47,00 % de pass@1 en GSM8K con decodificacion greedy sobre 500 preguntas del split de test. Esto iguala practicamente a LoRA de rango 8 (47,40 % con el mismo presupuesto de parametros), con una diferencia de 0,40 puntos que el autor atribuye a ruido estadistico (2 preguntas de 500).

Su relevancia es fundamentalmente de investigacion: demuestra que una ruta hiperbolica auto-organizada puede competir con PEFT euclideo en una tarea de razonamiento, y documenta un comportamiento emergent de "cristalizacion" (los K=8 slots convergen a un patron dominante de enrutamiento y la curvatura se autocorrige) que no tiene analogo en LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT hiperbolico (modelo de bola de Poincare) sobre transformer causal Qwen2.5-1.5B-Instruct; enrutamiento por distancia hiperbolica a K=8 slots |
| Parametros totales | 1.379.910 parametros entrenables en el adaptador; modelo base de 1,54B congelado |
| Parametros activos | No aplica (no es MoE); se inyectan 7 puntos de adaptacion sobre las 28 capas del modelo base (inject_every=4) |
| Longitud de contexto | Heredada del modelo base Qwen2.5-1.5B-Instruct (informacion no especificada en la model card del adaptador) |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye como pesos PyTorch en precision completa, ~2,7 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch state dict (`cdm_adapter_weights.pt`); requiere codigo personalizado (`cdm_adapter_impl.py`) |

## Arquitectura y entrenamiento

El adaptador se inserta cada 4 capas del transformer (7 puntos de inyeccion para las 28 capas de Qwen 2.5 1.5B). En cada punto, el estado oculto de dimension 1536 se proyecta a un cuello de botella tangente de dimension d_hyp=64, se mapea al origen de la bola de Poincare mediante `exp_map_zero`, se enruta con un `HyperbolicCDMRouter` a K=8 slots segun distancia hiperbolica, se devuelve al espacio tangente con `log_map_zero` y se reproyecta a la dimension residual. La salida se suma con un factor de escala inicializado en 0,1. La curvatura c es un parametro aprendido por punto de inyeccion (inicializado en 0,95).

El entrenamiento se realiza sobre el split de train de openai/gsm8k (7473 ejemplos) en formato `Question: {q}\nAnswer: {a}` con modelado de lenguaje causal. Se usan AdamW con lr=3e-4 y weight_decay=0,01, programacion CosineAnnealingLR con T_max=2000, batch efectivo de 32 (4 de micro-batch por 8 de grad_accum) y 2000 pasos sobre 1 GPU NVIDIA (~45 minutos). Todos los pesos del modelo base permanecen congelados. El autor reporta un comportamiento emergent sin supervision geometrica explicita: la "pureza de cristal" de los slots pasa de ~0,13 (paso 0) a 0,44 (paso 2000) y la curvatura se autocorrige de 0,95 a 0,8828, comportamiento enmarcado dentro de su framework DHP (Distributed Hyperbolic Phase).

## Capacidades

- Generacion de texto causal sobre el modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento matematico de tipo aritmetico/word problems, afinado especificamente sobre GSM8K.
- Resolucion de problemas en cadena (chain-of-thought) en ingles, con decodificacion greedy.
- No se documenta soporte de tool calling, function calling ni agentes en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni thinking mode.
- Idiomas: unicamente ingles segun los metadatos del repositorio.
- Capacidad especial: adaptacion mediante enrutamiento hiperbolico con curvatura aprendida por capa.

## Casos de uso

- Investigacion en PEFT hiperbolico: reproducir y extender el experimento comparando CDM frente a LoRA con el mismo presupuesto de parametros, analizando la cristalizacion de slots y la autocorreccion de curvatura.
- Benchmarking de razonamiento matematico: usar el adaptador como baseline hiperbolico en el split de test de GSM8K (500 preguntas, decodificacion greedy) junto a variantes LoRA y al modelo base congelado.
- Estudio de geometria latente: inspeccionar los 7 puntos de inyeccion y los K=8 slots para analizar como se organiza jerarquicamente la representacion de subproblemas aritmeticos.
- Prototipo educativo de resolucion de problemas: generar respuestas paso a paso en ingles para problemas de aritmetica de primaria sobre el modelo base de 1,5B, con coste de inferencia reducido.
- Base para extension a otros dominios de razonamiento: reentrenar el adaptador sobre datasets de matematicas mas complejos (por ejemplo MATH o AQuA) manteniendo el modelo base congelado.
- Experimentos de eficiencia: validar que un adaptador de ~2,7 MB y ~1,38M de parametros puede capturar capacidad de razonamiento sin tocar los pesos base, util para entornos con almacenamiento o ancho de banda limitados.
- Analisis comparativo de estabilidad de entrenamiento: el autor reporta train loss mas alta que LoRA (0,3741 frente a 0,2791) con rendimiento de evaluacion similar, lo que sirve para estudiar desajustes entre perdida de entrenamiento y metrica de tarea.

## Benchmarks y rendimiento

Datos publicados en la model card (GSM8K test split, n=500, greedy decode, pass@1; modelo base Qwen/Qwen2.5-1.5B-Instruct):

| Metodo | GSM8K pass@1 | Parametros entrenables | Train loss |
|---|---|---|---|
| Base congelado | 3,40 % | 0 | — |
| LoRA rank-8 | 47,40 % | ~1,38M | 0,2791 |
| CDM Adapter (este modelo) | 47,00 % | ~1,38M | 0,3741 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa aproximadamente 2,7 MB, por lo que su huella adicional en memoria es despreciable.
- El coste real de inferencia lo determina el modelo base Qwen2.5-1.5B-Instruct (1,54B de parametros): en bf16 requiere en torno a 3 GB de VRAM, mas el overhead del runtime.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090 y similares ejecutan el modelo base con margen amplio.
- Entrenamiento documentado por el autor: 1 GPU NVIDIA, ~45 minutos para 2000 pasos.
- Despliegue: unicamente a traves de `transformers` con codigo personalizado (`cdm_adapter_impl.py`, `CDMAdapterWrapper`) y `trust_remote_code=True`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, dado que el adaptador no sigue el formato estandar de PEFT/LoRA.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa de metodos PEFT con el mismo modelo base y presupuesto de parametros, segun los datos de la model card:

| Metodo | Modelo base | Parametros entrenables | GSM8K pass@1 | Formato | Licencia |
|---|---|---|---|---|---|
| CDM Adapter (este) | Qwen2.5-1.5B-Instruct | ~1,38M | 47,00 % | .pt + codigo propio | apache-2.0 |
| LoRA rank-8 | Qwen2.5-1.5B-Instruct | ~1,38M | 47,40 % | estandar PEFT | dependiente del repo |
| Base congelado | Qwen2.5-1.5B-Instruct | 0 | 3,40 % | safetensors | apache-2.0 |

No se dispone de comparativas publicadas frente a otros adaptadores hiperbolicos, ya que el autor afirma que este es el primer PEFT hiperbolico liberado publicamente. Comparativas frente a modelos completos de tamano similar (por ejemplo, otros modelos de ~1,5B afinados para matematicas) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La evaluacion se limita a GSM8K con n=500 preguntas; no hay datos en otros benchmarks de matematicas, codigo o conocimiento general.
- Solo soporta ingles segun los metadatos del repositorio; no se documenta cobertura multilingue.
- El adaptador requiere codigo personalizado (`cdm_adapter_impl.py`) y `trust_remote_code=True`; no es compatible con el flujo estandar de carga de adaptadores PEFT, lo que complica su integracion en servidores de inferencia habituales (vLLM, TGI, Ollama).
- La train loss es mas alta que la de LoRA (0,3741 frente a 0,2791) con rendimiento de evaluacion practicamente igual, lo que puede indicar diferencias de calibracion o sobreajuste distinto entre metodos.
- La afirmacion de "cristalizacion" emergent y de que la diferencia de 0,40 puntos es ruido estadistico procede del autor y no se aporta analisis de significancia estadistica ni intervalos de confianza.
- Riesgo de alucinacion inherente al modelo base Qwen2.5-1.5B-Instruct en tareas fuera del dominio de entrenamiento (aritmetica de GSM8K).
- El repositorio registra 0 descargas y 0 likes, es de creacion reciente y no cuenta con validacion independiente de terceros.
- La licencia del adaptador es apache-2.0, pero el uso comercial debe verificar tambien la licencia del modelo base Qwen2.5-1.5B-Instruct.
- No se documentan sesgos especificos ni evaluaciones de seguridad; el modelo base puede heredar sesgos presentes en sus datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/DuoNeural/cdm-adapter-qwen2.5-1.5b-gsm8k
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
