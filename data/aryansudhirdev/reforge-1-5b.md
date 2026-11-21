# AryanSudhirDev/Reforge-1.5B

## Resumen

Reforge-1.5B es un adaptador LoRA (rank 8, alpha 16) entrenado sobre Qwen2.5-Coder-1.5B-Instruct para una tarea muy concreta: proponer reparaciones de funciones Python preservando nombre, firma y requisitos declarados. Lo publica el usuario independiente AryanSudhirDev bajo licencia Apache-2.0 y se distribuye como adaptador PEFT, no como pesos completos: el repositorio contiene únicamente el adaptador, el tokenizador y un script de inferencia, mientras que los pesos base se descargan del repositorio oficial de Qwen.

El modelo es relevante no por sus resultados, sino por la transparencia con la que documenta su fracaso: la model card conserva explícitamente los resultados negativos del experimento. En paneles de desarrollo propios el adaptador mejora a la base (65/72 frente a 34/72 en 72 tareas de reparación autoradas), pero en la evaluación externa sobre HumanEval Original cae de 107/164 a 21/164, y en HumanEval+ estricto de 100/164 a 18/164. El propio autor indica que el experimento rechazó el adaptador como sustituto general de codificación y que la investigación está detenida.

Se trata, por tanto, de un artefacto de investigación acotado: un especialista estrecho en reparación de Python con sobreajuste evidente a su distribución de entrenamiento sintética, útil como caso de estudio sobre evaluación y regresión, no como componente listo para producción. El contexto, la arquitectura y el resto de especificaciones heredan las del modelo base Qwen2.5-Coder-1.5B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre proyecciones q/k/v/o |
| Parametros totales | 1,5B en el modelo base; el adaptador LoRA es de rango 8 (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el helper de inferencia impone un techo de prompt de 3072 tokens y un maximo de 384 tokens nuevos |
| Tipos de cuantizacion | no disponible; el helper usa float32 en CPU y bfloat16 en MPS |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json; requiere los pesos base de Qwen en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1,5B parametros. El LoRA tiene rango 8, alpha 16 y dropout 0, y se inserta en las proyecciones de atencion q/k/v/o. El entrenamiento consistio en 120 actualizaciones con semilla 42 sobre ejemplos sinteticos autorados especificamente para la tarea de reparacion de codigo Python; no se documenta en la informacion disponible el volumen de tokens ni la composicion exacta del dataset mas alla de esa descripcion.

El checkpoint publicado es el retenido `balanced-short-v1-seed42-01` en el paso 120, con la revision base fijada a `2e1fd397ee46e1388853d2af2c993145b0f1098a`. No se menciona RLHF, DPO ni ninguna innovacion de decodificacion; el helper usa decodificacion greedy con semilla 42. La model card indica que no se distribuyen estados del optimizador, tests privados, entradas ocultas ni los cuerpos de las tareas de benchmark, y que no se sostiene ninguna afirmacion sobre mecanismo de entrenamiento aislado, significancia estadistica o preparacion para despliegue.

## Capacidades

- Generacion de texto orientada a reparacion de codigo: recibe una funcion Python defectuosa y una descripcion de comportamiento esperado, y devuelve una funcion corregida propuesta.
- Preservacion de nombre, firma y requisitos declarados de la funcion original, segun la model card.
- Especializacion en Python; no se documentan capacidades en otros lenguajes.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (etiqueta `en`).
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Reparacion asistida de funciones Python en local: dado un fichero con un bug y una descripcion del comportamiento esperado, el helper `inference.py` genera una propuesta de correccion sin ejecutar el codigo ni sobrescribir el fichero de entrada, lo que permite revisarla manualmente antes de aplicarla.
- Estudio de metodologia de evaluacion: el repositorio conserva resultados de desarrollo y externos, incluida la regresion en HumanEval, lo que lo convierte en un caso practico para analizar sobreajuste a distribuciones sinteticas y sesgos de paneles de desarrollo correlacionados.
- Generacion de candidatos de parche en un pipeline de revision: el adaptador puede producir una propuesta que un revisor humano o un sistema de tests valide despues; encaja en flujos donde la salida se trata como sugerencia, nunca como parche aplicado automaticamente.
- Docencia y formacion en ingenieria de software: sirve para ilustrar como un adaptador pequeno puede mejorar en tareas estrechas y degradarse drasticamente fuera de distribucion, con cifras concretas y reproducibles.
- Experimentacion con PEFT: al ser un LoRA de rango 8 sobre un base de 1,5B, es un punto de partida ligero para probar tecnicas de adaptacion, mezcla de adaptadores o evaluacion comparativa en maquinas sin GPU de gama alta.
- Pruebas de infraestructura de inferencia local: el helper soporta CPU (float32) y Apple Silicon (bfloat16 via MPS), lo que permite validar flujos de carga con Transformers + PEFT y modo offline en entornos sin acceso a servicios gestionados.

## Benchmarks y rendimiento

Resultados registrados por el autor para este checkpoint exacto. Los paneles de desarrollo reutilizan ejemplos correlacionados y no son confirmacion independiente de generalizacion.

| Condicion | Base aprobado | Adaptador aprobado |
|---|---:|---:|
| Reparacion autorada de desarrollo, 72 tareas | 34/72 | 65/72 |
| Desarrollo publico, 72 tareas, solo las tres aserciones originales | 39/72 | 44/72 |
| Cribado de desarrollo MBPP+ publico, 24 tareas | 10/24 | 14/24 |
| HumanEval Original externo, 164 tareas | 107/164 | 21/164 |
| HumanEval+ estricto externo (base AND plus), 164 tareas | 100/164 | 18/164 |

La comparacion en HumanEval uso decodificacion greedy de 768 tokens y limites de sandbox local de 60 segundos de CPU, 65 segundos de reloj y 4096 MiB de RSS por grupo; el autor advierte que no es paridad exacta con la CLI oficial ni con un leaderboard. Los resultados de MBPP+ assessment03 corresponden a un adaptador distinto regularizado por actualizacion y no deben atribuirse a este checkpoint.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con un base de 1,5B, en float32 el modelo completo ocupa aproximadamente 6 GB de pesos, y en bfloat16 alrededor de 3 GB, a lo que hay que sumar el adaptador y el overhead de activaciones y cache KV.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, el base de 1,5B es apto para GPUs consumer con suficiente VRAM.
- Cabe en GPU consumer: si, por el tamano del base (1,5B); no se detallan modelos concretos.
- Opciones de despliegue: Transformers + PEFT (documentado en la model card), con helper `inference.py` para CPU (float32) y Apple Silicon MPS (bfloat16). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la decodificacion es greedy con semilla 42, maximo 384 tokens nuevos y techo de prompt de 3072 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reforge-1.5B | 1,5B (base) + LoRA r8 | no disponible | Reparacion de Python via adaptador | Apache-2.0 | Adaptador en HF, requiere base Qwen |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible en la informacion proporcionada | Modelo general de codigo e instrucciones | Apache-2.0 | Pesos completos en HF |
| Alternativas de reparacion de codigo de 1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es contra su propio modelo base: en las cinco condiciones registradas, el adaptador mejora en desarrollo (65/72 frente a 34/72) y en MBPP+ de cribado (14/24 frente a 10/24), pero se degrada gravemente en HumanEval Original (21/164 frente a 107/164) y HumanEval+ (18/164 frente a 100/164). No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Regresion severa fuera de distribucion: en HumanEval Original el adaptador pasa de 107/164 (base) a 21/164, y en HumanEval+ de 100/164 a 18/164.
- Los paneles de desarrollo reutilizan ejemplos correlacionados y no constituyen confirmacion independiente de generalizacion.
- Entrenado sobre ejemplos sinteticos autorados; el autor no lo establece como mejora general de codificacion.
- Posible solapamiento con datos de preentrenamiento publicos, lo que puede inflar resultados.
- Las revisiones estaticas finitas del codigo fuente no pueden probar correccion ni no interferencia.
- El autor no sostiene ninguna afirmacion sobre OPAL, significancia estadistica, mecanismo de entrenamiento aislado ni preparacion para despliegue.
- Las salidas requieren revision humana; el helper imprime codigo y nunca lo ejecuta ni sobrescribe el fichero de entrada, pero el codigo generado no debe ejecutarse directamente en el host.
- Idioma limitado al ingles; no se documentan capacidades multilingues.
- El repositorio fue renombrado desde `chronos-2-de-lu-pregate`; los resultados de prediccion de precios electricos de la version anterior no aplican a este modelo.
- El repositorio contiene solo el adaptador y el tokenizador, no los pesos base; la primera carga requiere descargar el modelo Qwen fijado.
- Licencia Apache-2.0 heredada del base, con atribucion a Qwen en `NOTICE`; el adaptador no reclama autoria sobre Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AryanSudhirDev/Reforge-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Revision base fijada: `2e1fd397ee46e1388853d2af2c993145b0f1098a`
- Revision anterior (Chronos, precios electricos): https://huggingface.co/AryanSudhirDev/Reforge-1.5B/tree/9ffcc6a064d27eb2c7657d3763554782710ceaca
- Resultados en formato legible por maquina: `results.json` dentro del repositorio
- Metadatos de entrenamiento: `training_metadata.json` dentro del repositorio
- Manifiesto de release: `release_manifest.json` dentro del repositorio
