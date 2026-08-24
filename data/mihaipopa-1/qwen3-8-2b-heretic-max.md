# MihaiPopa-1/Qwen3.8-2B-Heretic-Max

## Resumen

Qwen3.8-2B-Heretic-Max es una version descensurada (decensored) del modelo empero-ai/Qwen3.8-2B-Distill, creada por Mihai Popa mediante el proyecto Heretic v1.4.0, una herramienta de abliteration que elimina los mecanismos de rechazo aprendidos por el modelo durante el entrenamiento. El modelo original es una destilacion full-parameter de Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-2B, entrenado con aproximadamente 30.000 trazas de razonamiento curadas del teacher, lo que lo convierte en el miembro mas pequeno de la familia Qwen3.8 de Empero.

La relevancia de este modelo reside en combinar un razonamiento destilado de un modelo de 2,4 billones de parametros con function calling nativo, un contexto de 262.144 tokens y la eliminacion de los mecanismos de rechazo mediante abliteration. Con 2.213 millones de parametros (2,2B), esta orientado al despliegue en el edge, manteniendo una calidad de razonamiento muy superior a la del modelo base Qwen3.5-2B, con una mejora de +0,310 en GSM8K y +0,265 en MMLU.

El proceso de abliteration reduce las refusals de 83/100 a 3/100 con una divergencia KL de 0,0295 respecto al modelo original, lo que indica una perturbacion minima del comportamiento del modelo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (hibrida: linear attention con Gated DeltaNet + attention clasica) |
| Parametros totales | 2.213.241.664 (2,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible (el modelo base menciona builds cuantizados para edge, sin especificar formatos) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5-2B, un modelo de lenguaje causal con atencion hibrida que combina capas de linear attention con Gated DeltaNet y capas de attention clasica. Esta arquitectura permite un contexto nativo de 262.144 tokens con un consumo de memoria reducido en las capas de atencion lineal, aunque requiere kernels especializados (flash-linear-attention y causal_conv1d) para un rendimiento optimo; sin ellos, las capas lineales caen en operaciones PyTorch lentas y con alto consumo de memoria.

El entrenamiento del modelo base (empero-ai/Qwen3.8-2B-Distill) es una destilacion off-policy completa de Qwen3.8 2.4T A95B, con aproximadamente 30.000 trazas de chain-of-thought curadas que cubren matematicas, razonamiento general y seguimiento de instrucciones. La destilacion actualiza todos los parametros (full fine-tune, no un adapter) y utiliza el mismo curriculum que los modelos hermanos de 4B y 9B. La modificacion con Heretic v1.4.0 aplica una abliteration por capa (direction_index: per layer) que ajusta los pesos de attn.o_proj y mlp.down_proj, con parametros documentados en la model card (max_weight de 1,00 para attn.o_proj y 0,86 para mlp.down_proj).

## Capacidades

- Razonamiento con chain-of-thought destilado: cada respuesta abre con un bloque `thinking` aprendido directamente de las trazas del teacher Qwen3.8 2.4T.
- Function calling nativo segun la especificacion Qwen3.5, sin wrappers ni fine-tunes especificos.
- Generacion de texto conversacional con capacidad de contexto de 262.144 tokens.
- Razonamiento matematico mejorado: GSM8K 0,640 (flexible-extract) frente a 0,330 del base Qwen3.5-2B.
- Conocimiento general amplio en MMLU (57 materias): 0,548 acc (flexible-extract) frente a 0,283 del base.
- Ausencia de refusals: 3/100 frente a 83/100 del modelo original censurado.
- Modo reasoning integrado: el modelo genera bloques `thinking` que deben parsearse y extraerse para el usuario final.
- El modelo base es la via de texto de un modelo vision-language, aunque este repositorio expone solo la parte de texto.

## Casos de uso

- Asistente conversacional sin restricciones en el edge: el modelo de 2,2B puede desplegarse en dispositivos moviles, SBCs o CPUs sin GPU, permitiendo aplicaciones de rol, narrativa interactiva o asistencia creativa que un modelo censurado bloquearia.
- Razonamiento matematico en entornos con recursos limitados: con GSM8K 0,640, el modelo resuelve problemas de razonamiento paso a paso en aplicaciones de tutoria educativa embebida o herramientas de examen asistido sin depender de infraestructura en la nube.
- Agentes ligeros con function calling: el soporte nativo de function calling permite integrar el modelo en pipelines de agentes que invocan APIs o herramientas, con un tamano adecuado para servidores de bajo coste o dispositivos edge.
- Procesamiento de documentos extensos: con 262.144 tokens de contexto, el modelo puede procesar documentos completos, repositorios de codigo extensos o conversaciones multi-turno largas en una sola pasada sin truncamiento.
- Investigacion en alineacion y abliteration: el modelo sirve como caso de estudio para analizar como la abliteration afecta a un modelo destilado, comparando la divergencia KL (0,0295) y las tasas de refusal (3/100 vs 83/100) con el modelo original.
- Generacion de codigo asistida en entornos embebidos: aunque no se reportan benchmarks de HumanEval, el razonamiento destilado y el function calling hacen util el modelo para generacion de codigo basica en entornos de desarrollo en dispositivos con recursos limitados.
- Despliegue de asistentes privados en hardware local: el modelo puede ejecutarse cuantizado en equipos personales o SBCs (Raspberry Pi) para aplicaciones de privacidad donde los datos no deben salir del dispositivo.

## Benchmarks y rendimiento

Los benchmarks provienen del modelo base (empero-ai/Qwen3.8-2B-Distill) antes de la abliteration, medidos con lm-evaluation-harness, backend HF, protocolos CoT (gsm8k_cot, mmlu_flan_cot_zeroshot) y parametros de muestreo temperature=0.6, top_p=0.95, top_k=20. La version Heretic-Max no reporta benchmarks propios, pero la divergencia KL de 0,0295 respecto al original sugiere que el rendimiento es practicamente equivalente.

| Tarea | Metrica | Qwen3.5-2B (base) | Qwen3.8-2B (original) | Delta |
|---|---|---|---|---|
| gsm8k_cot | exact_match (flexible) | 0,330 | 0,640 | +0,310 |
| gsm8k_cot | exact_match (estricto) | 0,545 | 0,640 | +0,095 |
| mmlu (CoT, 57 materias) | acc (flexible-extract) | 0,283 | 0,548 | +0,265 |
| mmlu (CoT, 57 materias) | acc (strict-match) | 0,004 | 0,225 | +0,221 |

Metricas de abliteration de la version Heretic-Max:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0295 |
