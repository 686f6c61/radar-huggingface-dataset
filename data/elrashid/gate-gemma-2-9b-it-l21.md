# elrashid/gate-gemma-2-9b-it-l21

## Resumen

`elrashid/gate-gemma-2-9b-it-l21` es un clasificador de seguridad (guardrail) construido sobre `google/gemma-2-9b-it`. No es un modelo generativo independiente: es una compuerta de seguridad que se apoya en las activaciones internas del modelo base. Concretamente, aplica una regresion logistica sobre caracteristicas de un autoencoder disperso (SAE) extraidas del flujo residual de la capa 21, y devuelve la probabilidad de que el prompt sea danino antes de generar el primer token de salida.

El modelo lo publica el usuario `elrashid` en Hugging Face bajo licencia MIT, con acceso restringido (gated). Su interes reside en el enfoque de interpretabilidad mecanistica aplicada a seguridad: en lugar de entrenar un clasificador superficial sobre texto, reutiliza caracteristicas interpretables del propio modelo para decidir si un prompt debe bloquearse. Esto lo hace relevante para quienes investigan guardrails basados en SAE y para pipelines que necesitan una capa de moderacion previa a la generacion.

La ficha se basa unicamente en la informacion disponible en la model card y en los metadatos de Hugging Face. El repositorio figura con 0 GB de tamano, 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto experimental y de baja adopcion. Muchos detalles tecnicos (dataset de entrenamiento, metricas, hiperparametros) no estan publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador (regresion logistica) sobre caracteristicas de SAE del flujo residual de la capa 21 de gemma-2-9b-it |
| Parametros totales | no disponible (clasificador ligero; el modelo base Gemma 2 9B tiene 9.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 2 9B: 8.192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El componente entrenado es una regresion logistica que opera sobre caracteristicas de un autoencoder disperso (SAE) entrenado sobre el flujo residual de la capa 21 de `google/gemma-2-9b-it`. El modelo base es un transformer decoder-only de Gemma 2 con 9.000 millones de parametros y ventana de contexto de 8.192 tokens. La compuerta procesa el prompt antes de que el modelo genere el primer token, calcula las activaciones de la capa 21, las proyecta en el espacio del SAE y clasifica la probabilidad de dano.

No se ha publicado informacion sobre el numero de tokens de entrenamiento del clasificador, la composicion del dataset, el uso de RLHF/DPO ni los hiperparametros de la regresion logistica. Tampoco se detalla el SAE utilizado (dimension del diccionario, coeficiente de esparsidad, pasos de entrenamiento). La innovacion destacable es el uso de interpretabilidad mecanistica como senal de seguridad: las caracteristicas del SAE son mas interpretables que las activaciones brutas, lo que en principio facilita auditar por que un prompt se marca como danino.

## Capacidades

- Clasificacion de prompts como daninos o benignos, devolviendo P(harmful) antes de la generacion.
- Funciona como guardrail de entrada en pipelines que usan `google/gemma-2-9b-it` como modelo generativo.
- Aprovecha caracteristicas interpretables de un SAE de la capa 21, lo que permite inspeccionar las senales que activan el bloqueo.
- No genera texto por si mismo: depende del modelo base para la generacion.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Moderacion previa a la generacion: colocar la compuerta delante de `gemma-2-9b-it` para rechazar prompts daninos antes de consumir computo de generacion, reduciendo coste y exposicion.
- Investigacion en interpretabilidad: analizar que caracteristicas del SAE de la capa 21 correlacionan con contenido danino, como base para estudiar la representacion interna de la seguridad en Gemma 2.
- Filtrado de datasets: puntuar grandes colecciones de prompts con P(harmful) para depurar corpus de entrenamiento o evaluacion.
- Red teaming asistido: usar la compuerta para medir la tasa de evasión de prompts adversariales y comparar con clasificadores de texto superficiales.
- Capa de defensa en profundidad: combinarla con un clasificador de salida para cubrir tanto la entrada como la respuesta del modelo.
- Auditoria de despliegues: registrar las activaciones del SAE que disparan el bloqueo para justificar decisiones de moderacion ante revisores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere ejecutar `google/gemma-2-9b-it` para obtener las activaciones de la capa 21, ademas del SAE y la regresion logistica.
- VRAM estimada: no disponible de forma oficial; para el modelo base en bf16 se necesitan aproximadamente 18 GB, y en cuantizacion de 4 bits en torno a 6-7 GB, mas la memoria del SAE (no cuantificada en la informacion).
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16; RTX 4090 (24 GB) suficiente para el modelo base en bf16 o cuantizado.
- Cabe en GPU de consumo (RTX 3090, 4090) si se cuantiza el modelo base; el SAE anade overhead no documentado.
- Opciones de despliegue: no disponibles para la compuerta; el modelo base puede servirse con vLLM, TGI o llama.cpp, pero la extraccion de activaciones de la capa 21 exige acceso a los estados internos (por ejemplo, con PyTorch/Transformers y hooks).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| gate-gemma-2-9b-it-l21 | Guardrail sobre SAE de Gemma 2 | Clasificador ligero + base 9B | no disponible (base 8.192) | MIT | Gated |
| Llama Guard (Meta) | Clasificador de seguridad | 8B (variantes) | 4.096-8.192 | Llama Community | Abierto |
| ShieldGemma (Google) | Clasificador de seguridad | 2B, 9B, 27B | 8.192 | Gemma Terms | Abierto |
| Clasificadores de toxicidad tipo BERT | Clasificador de texto | 0,1-0,5B | 512 | Variable | Abierto |

La comparativa es orientativa: no se dispone de metricas de rendimiento de la compuerta que permitan una comparacion cuantitativa con Llama Guard o ShieldGemma.

## Limitaciones y advertencias

- Artefacto experimental: 0 descargas y 0 likes en el momento de la consulta; sin validacion externa publicada.
- Sin benchmarks ni metricas de falsos positivos/negativos: no se puede estimar su fiabilidad en produccion.
- Depende de un SAE y de la capa 21 concretos de `gemma-2-9b-it`; cualquier cambio de modelo base o de capa invalida la compuerta.
- Riesgo de evasión por prompts adversariales no cuantificado.
- Solo evalua el prompt de entrada, no la respuesta generada.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Licencia MIT declarada, pero el modelo base Gemma 2 esta sujeto a los terminos de uso de Google, que condicionan el uso comercial del conjunto.
- Acceso restringido en Hugging Face: requiere aceptar condiciones, lo que puede complicar la integracion automatizada en CI/CD.
- Sesgos: no documentados; al heredar representaciones de Gemma 2, puede reproducir sesgos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elrashid/gate-gemma-2-9b-it-l21
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- DOI asociado: 10.57967/hf/9434
