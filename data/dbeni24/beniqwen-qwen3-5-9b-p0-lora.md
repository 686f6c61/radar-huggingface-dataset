# DBeni24/BeniQwen-Qwen3.5-9B-P0-LoRA

## Resumen

BeniQwen Qwen3.5-9B P0 LoRA es un adaptador LoRA experimental publicado por el usuario DBeni24 sobre el modelo base Qwen/Qwen3.5-9B. No se trata de un modelo completo, sino de un checkpoint candidato orientado a la correccion de errores de estado falso y disciplina epistemica (entrenamiento P0). El adaptador se distribuye en formato safetensors mediante la libreria PEFT y no incluye los pesos del modelo base.

El modelo base, Qwen3.5-9B, es un modelo multimodal de 9000 millones de parametros con arquitectura hibrida (Gated DeltaNet + Gated Attention), 32 capas, contexto nativo de 262.144 tokens y extension declarada hasta aproximadamente 1.010.000 tokens. El adaptador solo modifica 43.278.336 parametros de los 248 modulos lineales del backbone de texto, sin tocar el tower de vision. Segun la model card, el checkpoint esta en estado CHECKPOINT_CANDIDATE: el entrenamiento y el dry-run han pasado, pero la validacion, el challenge y los benchmarks estan pendientes. No es una version congelada ni validada.

La relevancia de esta ficha reside en que el adaptador no debe tratarse como un lanzamiento estable. Es un artefacto de investigacion en desarrollo, con limitaciones importantes para cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-9B (base hibrido: Gated DeltaNet + Gated Attention, 32 capas) |
| Parametros totales | 43.278.336 (adaptador) + 9.000 millones (base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (nativo del base) |
| Tipos de cuantizacion | No disponible (adaptador en BF16) |
| Idiomas soportados | No disponibles (dependen del modelo base) |
| Licencia | No disponible |
| Formato de pesos | adapter_model.safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con el metodo BF16 LoRA, solo sobre los pesos del adaptador, sin modificar el modelo base. El entrenamiento se realizo sobre un dataset congelado denominado ECHO_FALSE_STATE_CORRECTIVE_V0_1_R2, con 720 ejemplos de entrenamiento, 120 de validacion y 120 de challenge. Se ejecuto una sola epoca con 90 pasos de optimizador. Los modulos objetivo son 248 modulos lineales del backbone de texto; el tower de vision no fue modificado (parametros entrenables: 0).

El objetivo del entrenamiento es la correccion P0 de errores de estado falso, es decir, casos en los que el modelo produce afirmaciones incorrectas sobre su propio estado o conocimiento. No se menciona el uso de RLHF o DPO; el metodo es un entrenamiento supervisado clasico con LoRA. La arquitectura del modelo base combina atencion con Gated DeltaNet, una capa de atencion lineal que permite ventanas de contexto muy largas con coste computacional reducido.

## Capacidades

- No se han publicado capacidades especificas del adaptador. El estado de validacion esta pendiente, por lo que no se puede confirmar ningun comportamiento mejorado.
- El modelo base Qwen3.5-9B soporta instrucciones multimodales (texto e imagenes), tool calling y razonamiento, pero el adaptador no ha sido evaluado en estas tareas.
- El adaptador se ha entrenado unicamente para corregir errores de estado falso en un dominio concreto (P0). Su generalizacion a otras tareas es desconocida.
- No se dispone de informacion sobre soporte de agentes, multi-step reasoning o capacidades multilingues del adaptador.

## Casos de uso

- **Investigacion en correccion de alucinaciones**: el adaptador podria utilizarse en experimentos controlados para estudiar si el entrenamiento P0 reduce la frecuencia de afirmaciones falsas sobre el estado interno del modelo. Requiere evaluacion rigurosa antes de cualquier aplicacion.
- **Desarrollo de pipelines de validacion**: como checkpoint candidato, sirve para probar flujos de evaluacion de LoRA (validacion, challenge, benchmarks) en entornos de investigacion.
- **Experimentos de fine-tuning selectivo**: permite analizar como la modificacion de solo 248 modulos lineales afecta al comportamiento global del modelo, sin cambiar la vision.
- **Prototipado de agentes con control de epistemicidad**: si el entrenamiento funciona, podria integrarse en agentes conversacionales que necesiten declarar explicitamente su incertidumbre. Sin embargo, no hay evidencia de que funcione.
- **Evaluacion de robustez ante preguntas sobre el propio modelo**: se puede probar si el adaptador responde de forma mas precisa cuando se le pregunta sobre sus capacidades, limitaciones o entrenamiento.
- **No apto para produccion**: ningun caso de uso productivo es recomendable hasta que se complete la validacion y se publique un checkpoint congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la validacion generativa, la challenge y el benchmark de regresion completo estan pendientes. No se puede comparar el rendimiento con otros modelos.

## Requisitos de hardware

- El adaptador LoRA requiere cargar el modelo base Qwen3.5-9B completo. La VRAM estimada para inferencia en BF16 es de aproximadamente 18-20 GB (para 9B parametros, sin cuantizacion). Con cuantizacion (por ejemplo, 4 bits) puede caber en 6-8 GB.
- GPUs recomendadas: para uso comodo, una RTX 3090/4090 (24 GB) o una A100 (40/80 GB) para inferencia con contexto largo. El modelo base soporta hasta 262.144 tokens, lo que exige mucha memoria en atencion.
- No se ha verificado que el adaptador funcione con cuantizacion GGUF; la libreria es PEFT y los pesos estan en safetensors.
- Opciones de despliegue: vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay informacion de latencia ni throughput para este adaptador especifico.

## Comparativa con modelos similares

No hay informacion de rendimiento del adaptador. Como modelo base, Qwen3.5-9B se compara con otros modelos de 9B como Llama-3.1-8B-Instruct o Mistral-7B, pero no se dispone de datos de benchmarks de este adaptador. La comparacion se limita a especificaciones del modelo base:

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 262.144 | Hibrida (Gated DeltaNet + Gated Attention) | No disponible |
| Llama-3.1-8B-Instruct | 8B | 128.000 | Transformer denso | Llama 3.1 Community License |
| Mistral-7B-Instruct | 7B | 32.000 | Transformer denso | Apache 2.0 |

No se puede afirmar que el adaptador mejore o empeore el rendimiento de estos modelos.

## Limitaciones y advertencias

- **Checkpoint no validado**: el estado es CHECKPOINT_CANDIDATE; no se ha congelado ni fusionado. No se debe usar en produccion.
- **Entrenamiento limitado**: 720 ejemplos, 1 epoca, 90 pasos. Es un entrenamiento minimo que probablemente no generalice.
- **Sin licencia conocida**: la licencia no esta disponible, lo que impide conocer restricciones de uso comercial.
- **Sin idiomas declarados**: no se sabe en que idiomas funciona correctamente.
- **Riesgo de alucinacion**: el objetivo del entrenamiento es reducir errores de estado falso, pero no hay evidencia de que lo consiga. Puede mantener o empeorar otros sesgos.
- **Sin benchmarks**: no se puede evaluar calidad ni comparar con alternativas.
- **Dependencia del modelo base**: el adaptador no incluye los pesos base; si el modelo base cambia o se retira, el adaptador no funcionara.
- **No apto para agentes ni tool calling**: no se ha evaluado en estos escenarios.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/DBeni24/BeniQwen-Qwen3.5-9B-P0-LoRA
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha del modelo base en "There's An AI For That": https://theresanaiforthat.com/model/qwen3-5-9b/
- Ficha del modelo base en Neura Market: https://www.neura.market/models/qwen-qwen3-5-9b
- Catalogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen-qwen3.5-9b
- Ficha en Apertis AI: https://apertis.ai/models/qwen3.5-9b

Nota: no se ha encontrado un repositorio GitHub del autor. La model card menciona un repositorio BeniQwen, pero no se proporciona enlace.
