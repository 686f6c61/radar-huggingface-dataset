# MANGSEOK123/qwen3-8b-tau2-oel-telecom-source-only-n74

## Resumen

qwen3-8b-tau2-oel-telecom-source-only-n74 es un ajuste fino de Qwen/Qwen3-8B (modo no-thinking) desarrollado por MANGSEOK123. El modelo aplica una técnica de internalización de habilidades mediante destilación autodirigida on-policy (OPSD, on-policy self-distillation) sobre el benchmark tau2-bench en su dominio de telecomunicaciones (version 1.0.1). El objetivo es que el modelo estudiante aprenda a resolver tareas de ese dominio sin necesidad de que la habilidad correspondiente este inyectada en el system prompt.

La relevancia de este experimento reside en la metodología: en lugar de depender de prompts largos con instrucciones de habilidad, el modelo destila el comportamiento de un profesor congelado (copia del modelo inicial con la skill en el system prompt) hacia un estudiante que opera sin ella. Se trata de un modelo de investigacion con 8.190.735.360 parametros y pesos en BF16, entrenado con el codebase OEL (LMOps).

El modelo se publica como un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card extendida ni datos de evaluacion publicados. Su interes es acotado: sirve para estudiar la transferencia de habilidades en tareas conversacionales con tool calling dentro del dominio telecom de tau2-bench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B, modo no-thinking) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso prompt <= 8192 tokens y respuesta <= 1024 tokens por turno) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B en modo no-thinking, un transformer decoder-only denso de aproximadamente 8.190 millones de parametros. Sobre esa base se aplica destilacion autodirigida on-policy (OPSD): el estudiante resuelve cada tarea sin la habilidad en el system prompt, mientras que un profesor congelado (copia del modelo inicial con la skill inyectada) genera las distribuciones objetivo. La perdida es una KL inversa a nivel de token sobre los 256 tokens mas probables del estudiante.

El conjunto de entrenamiento consta de 74 pares habilidad-tarea seleccionados uniformemente al azar (semilla 42) de un total de 518 habilidades extraidas, sin filtrado, y cada habilidad se empareja con su propia tarea de origen. Se entrena 1 epoca con 8 pares por actualizacion, AdamW con learning rate constante de 3e-6, weight decay 0.01 y grad clip 1.0. La simulacion del usuario se realiza con GPT-4.1-mini a temperatura 0.7. El codebase de entrenamiento es OEL (LMOps). No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en el dominio de telecomunicaciones de tau2-bench.
- Ejecucion de tareas de agente con tool calling dentro del entorno tau2-bench telecom (v1.0.1).
- Internalizacion de habilidades: resuelve tareas sin que la skill este presente en el system prompt, que es precisamente el comportamiento destilado.
- Razonamiento de multiples pasos orientado a la resolucion de tareas del benchmark.
- Capacidades multilingues: no disponibles (no declaradas en la informacion).
- Modo thinking: no, el ajuste se realiza sobre la variante no-thinking de Qwen3-8B.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigacion sobre internalizacion de habilidades: el modelo sirve como referencia para estudiar si la destilacion on-policy permite eliminar instrucciones de habilidad del prompt sin degradar el comportamiento. Se compararia contra el modelo base con la skill inyectada.
- Evaluacion de agentes en tau2-bench telecom: permite medir la tasa de exito en tareas de atencion al cliente de telecomunicaciones con tool calling, aislando el efecto del prompt de habilidad.
- Reproduccion de experimentos de OPSD: dado que se documentan semilla, hiperparametros y codebase (OEL/LMOps), es util para replicar o extender el pipeline con otros subconjuntos de las 518 habilidades.
- Estudio de destilacion profesor-estudiante en dominios acotados: el par profesor congelado/estudiante sin skill es un caso controlado para analizar la transferencia de distribuciones token a token (KL inversa sobre top-256).
- Prototipado de asistentes de soporte tecnico de telecomunicaciones: como base para experimentar con flujos de diagnostico y resolucion de incidencias, siempre con validacion adicional antes de cualquier uso real.
- Analisis de sensibilidad al numero de pares de entrenamiento: al usar solo 74 de 518 habilidades, permite estudiar como escala la internalizacion al aumentar la cobertura del conjunto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contexto moderado.
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de pesos; a 4 bits: aproximadamente 4-5 GB, aunque no se han publicado pesos cuantizados para este modelo concreto.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) viable en BF16 con contexto limitado o en cuantizacion.
- Consumer GPU: si cabe en RTX 4090 y, en cuantizacion 4 bits, potencialmente en GPUs de 8-12 GB, con la salvedad de que no hay artefactos cuantizados publicados.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM y llama.cpp/Ollama tras conversion a GGUF, aunque esto ultimo no esta confirmado en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-tau2-oel-telecom-source-only-n74 | 8,19 B | no disponible | OPSD sobre tau2-bench telecom (74 pares) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible en esta ficha | Preentrenamiento + post-entrenamiento general | no disponible en esta ficha | Ampliamente disponible |
| Alternativas de mismo tamano orientadas a agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con otras alternativas no es posible con la informacion proporcionada, ya que no se publican resultados de evaluacion del modelo ajustado ni de los modelos de referencia.

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay benchmarks publicados, por lo que no puede afirmarse ninguna mejora respecto al modelo base.
- Cobertura de entrenamiento limitada: solo 74 de 518 habilidades extraidas, seleccionadas al azar, lo que restringe la generalizacion dentro del propio dominio telecom.
- Dominio muy acotado: el ajuste se circumscribe a tau2-bench telecom v1.0.1; el comportamiento fuera de ese entorno no esta caracterizado.
- Riesgo de sobreajuste al simulador: el estudiante se entrena contra un usuario simulado con GPT-4.1-mini a T=0.7, lo que puede introducir sesgos hacia ese estilo de interaccion.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier despliegue.
- Idiomas no declarados: no hay garantia de comportamiento multilingue mas alla del que herede de Qwen3-8B.
- Riesgo de alucinacion: inherente a los modelos de 8 B en tareas de agente; no se documentan mitigaciones especificas.
- Modelo de investigacion sin adopcion: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Sin pesos cuantizados publicados: el despliegue eficiente requiere conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-8b-tau2-oel-telecom-source-only-n74
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Codebase de entrenamiento OEL (LMOps): no disponible en la informacion proporcionada
- Paper o blog de OPSD: no disponible en la informacion proporcionada
- Benchmark tau2-bench: no disponible en la informacion proporcionada
