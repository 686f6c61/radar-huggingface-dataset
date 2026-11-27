# inclusionAI/Ling-3.1-flash-1019-singprobe

## Resumen

Ling-3.1-flash-1019-singprobe es un modelo auxiliar de tipo sonda (probe) desarrollado por inclusionAI que funciona como guardrail intrinseco en streaming sobre el modelo base Ling-3.1-flash-1019. No es un modelo generativo autonomo: es un cabezal de atencion adicional que lee los estados ocultos de las capas 23, 47 y 71 del modelo base durante la generacion y puntua, token a token, la intencion de la consulta, la inseguridad de la respuesta y el riesgo de alucinacion.

Con solo 8,13 millones de parametros, el modelo resuelve un problema practico de produccion: la necesidad de filtrar contenido danino y detectar alucinaciones sin anadir una segunda pasada de inferencia costosa. Al leer los estados ocultos del propio modelo generador, la sonda opera en linea con la decodificacion y permite abortar o marcar respuestas antes de que se completen.

Es relevante ahora porque ofrece metricas competitivas frente a guardrails generativos mucho mayores (Qwen3Guard-Gen-8B, YuFeng-XGuard-Reason-8B) con una huella de parametros tres ordenes de magnitud menor, y porque su naturaleza de streaming encaja con despliegues de agentes y atencion al cliente donde la latencia de moderacion es critica. La licencia MIT facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de atencion (sing_probe_attn) sobre estados ocultos de Ling-3.1-flash-1019; 8 cabezas de atencion, dimension de cabeza 64, ventana de 2.048 tokens |
| Parametros totales | 8.132.106 (8,13 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de sonda de 2.048 tokens; el servidor de ejemplo se lanza con context-length 16384 |
| Tipos de cuantizacion | Pesos publicados en bfloat16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere custom_code / trust-remote-code) |

## Arquitectura y entrenamiento

La sonda es un modulo de atencion ligero con 8 cabezas y dimension de cabeza 64 que intercepta los estados ocultos de tres capas del transformer base (indices 23, 47 y 71, en base cero) y produce diez salidas por token: ocho etiquetas de intencion de consulta (label_0 a label_7), una de inseguridad de respuesta (label_8) y una de riesgo de alucinacion (label_9). La ventana de lectura es de 2.048 tokens, lo que permite evaluar contexto reciente durante la generacion sin almacenar todo el historial.

El modelo se distribuye como adaptador sobre Ling-3.1-flash-1019 y requiere el build especifico de SGLang mantenido por inclusionAI para exponer las probabilidades por token en `meta_info.token_probe_probs`. Los umbrales de release estan calibrados a 0,5 tanto para inseguridad de respuesta como para alucinacion. No se detalla en la informacion disponible el volumen ni la composicion del dataset de entrenamiento, ni si se empleo RLHF o DPO; el metodo completo se remite al informe tecnico arXiv:2608.30703.

## Capacidades

- Clasificacion de intencion de consulta en 8 categorias, puntuada por token durante la generacion.
- Deteccion de inseguridad en la respuesta generada (contenido danino, toxico o prohibido).
- Deteccion de alucinacion por token mediante puntuacion de riesgo.
- Operacion en streaming: las puntuaciones se emiten junto con cada token, no en una pasada posterior.
- Integracion con SGLang mediante el flag `--probe-ckpt` y lectura de `meta_info.token_probe_probs`.
- Baja tasa de falsos positivos en respuestas benignas (0,008 % de media sobre 5 datasets en el umbral pre-calibracion de 0,983085).
- No genera texto de forma autonoma; depende del modelo base para la generacion.
- No se documentan capacidades multilingues, de vision, audio ni tool calling propias.

## Casos de uso

- Moderacion en tiempo real de chatbots: la sonda puntua cada token de la respuesta y permite cortar la generacion en cuanto label_8 supera el umbral de 0,5, evitando que el usuario reciba contenido inseguro.
- Deteccion de alucinaciones en asistentes documentales: integrada en el pipeline de generacion, marca fragmentos con alto riesgo (label_9) para revision humana o para insertar avisos de verificacion.
- Enrutado de consultas por intencion: las ocho etiquetas de intencion permiten dirigir la peticion a un flujo, herramienta o agente especializado antes de completar la respuesta.
- Guardrail en agentes multi-paso: al operar en streaming sobre el modelo base, se puede abortar una cadena de acciones si una respuesta intermedia se clasifica como insegura.
- Cumplimiento y auditoria: el registro de probabilidades por token sirve como evidencia trazable de moderacion en despliegues regulados.
- Filtrado en pipelines de generacion masiva: su tamano de 8,13 M parametros permite ejecutarlo junto al modelo base sin un salto significativo de coste computacional, a diferencia de guardrails generativos de 8B.

## Benchmarks y rendimiento

| Tarea | Metrica | Ling-3.1-flash-1019-singprobe | Baseline de referencia |
|---|---|---|---|
| Clasificacion de intencion de consulta (6 benchmarks) | F1 | 0,8687 | YuFeng-XGuard-Reason-8B (0,8714) |
| Clasificacion de seguridad de respuesta (8 benchmarks) | F1 | 0,8707 | Qwen3Guard-Gen-8B-strict (0,8604) |
| Seguridad en streaming (3 benchmarks) | AUC respuesta / AUC token | 0,9844 / 0,9411 | Qwen3Guard-Stream-8B-strict (0,9640 / 0,8893) |
| Deteccion de alucinacion (6 benchmarks) | AUC | 0,8041 | DRIFT (0,8000) |

| Caracteristica de despliegue | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,008 % de media sobre 5 datasets (umbral pre-calibracion 0,983085) |
| Umbrales calibrados de release | 0,5 para inseguridad de respuesta y 0,5 para alucinacion |

## Requisitos de hardware

- VRAM de la sonda: despreciable (8,13 M parametros en bfloat16, aproximadamente 16 MB), pero requiere cargar el modelo base Ling-3.1-flash-1019 completo.
- El ejemplo oficial de despliegue usa 8 GPU con `--tp-size 8 --ep-size 8`, lo que sugiere un modelo base de gran tamano; no se especifica el tamano exacto de Ling-3.1-flash-1019 en la informacion disponible.
- GPU recomendadas: no disponible de forma explicita; el despliegue de referencia asume un nodo de 8 GPU (clase A100/H100 por el paralelismo tensor y experto indicado).
- Cabe en GPU consumer: no se puede confirmar sin conocer el tamano del modelo base; la sonda en si no es el cuello de botella.
- Opciones de despliegue: SGLang con el build especifico de SingProbe (requisito); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | F1 seguridad respuesta | AUC streaming (respuesta/token) | Licencia |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-singprobe | 8,13 M (sonda) | Guardrail intrinseco en streaming | 0,8707 | 0,9844 / 0,9411 | MIT |
| Qwen3Guard-Gen-8B-strict | 8 B | Guardrail generativo | 0,8604 | No disponible | No disponible |
| Qwen3Guard-Stream-8B-strict | 8 B | Guardrail en streaming | No disponible | 0,9640 / 0,8893 | No disponible |
| YuFeng-XGuard-Reason-8B | 8 B | Guardrail generativo | No disponible (F1 intencion 0,8714) | No disponible | No disponible |

La ventaja principal de SingProbe es la relacion entre rendimiento y coste: iguala o supera a guardrails de 8B con tres ordenes de magnitud menos parametros, a cambio de depender del modelo base y de un runtime especifico.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse de forma independiente de Ling-3.1-flash-1019.
- Requiere el build de SGLang mantenido por inclusionAI; no hay soporte documentado en otros runtimes, lo que limita la portabilidad.
- La ventana de lectura de la sonda es de 2.048 tokens; riesgos fuera de esa ventana podrian no detectarse.
- Los umbrales de release (0,5) estan calibrados para las suites evaluadas; en dominios distintos puede requerirse recalibracion.
- No se documentan idiomas soportados, sesgos conocidos ni comportamiento fuera del ingles o los idiomas de evaluacion.
- Riesgo de alucinacion del propio modelo base: la sonda la detecta con AUC 0,8041, lo que implica una tasa de error no despreciable en produccion.
- La licencia MIT permite uso comercial, pero el modelo base puede tener condiciones propias que deben verificarse por separado.
- No se publican datos de latencia, throughput ni consumo de memoria en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019-singprobe
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.30703
- Repositorio SingProbe: https://github.com/inclusionAI/SingProbe
- Build de SGLang para SingProbe: https://github.com/inclusionAI/SingProbe/tree/main/sglang#token-probe-inference
