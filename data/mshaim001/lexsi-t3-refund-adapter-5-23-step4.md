# mshaim001/lexsi-t3-refund-adapter-5-23-step4

## Resumen

Lexsi T3 refund adapter `step_4` (task 5.23) es un adaptador LoRA publicado por el usuario `mshaim001` como candidato de release para un agente de reembolsos con tool calling fiable. No es un modelo completo: se trata de pesos PEFT de rango 8 que se montan sobre el checkpoint `CohereLabs/tiny-aya-global` (revision `af89d219b53ed9b13b8a4645f9c8028973510324`), un modelo base de Cohere Labs que no se distribuye en este repositorio y que requiere acceso al checkpoint original (gated). El adaptador se enmarca en el hackathon Lexsi (Track 3) y su objetivo declarado es corregir un fallo concreto de comportamiento: llamadas a herramientas después de haber emitido la respuesta final (`final_answer_tool_call_after_submit`).

El interes tecnico del artefacto es acotado pero preciso: es un ejemplo de ajuste fino selectivo sobre contextos de fallo guardados, con una funcion de perdida ponderada que amplifica los tokens REF (x5) frente al resto (x1) y enmascara el prefijo. El entrenamiento se realizo con AgentTune (`d4db4c1`) mas un parche local de `top_p`, sobre TRL/PEFT, con un unico paso de optimizador por ejemplo y learning rate `2e-05`. El adaptador se publica como paso final (`step_4`), sin entrenamiento posterior.

La relevancia practica es la de un banco de pruebas reproducible para evaluar si un ajuste minimo (cuatro contextos de fallo, LoRA r=8) corrige errores de politica en agentes con tool calling. Los resultados reportados son modestos y honestos: en el holdout independiente (5.24 + 5.25) pasa de 27/40 a 28/40 de exito completo, reduce las llamadas tras el submit de 2 a 1 y mantiene 0 casos invalidos. No hay datos publicos de benchmarks estandar ni de licencia del adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `CohereLabs/tiny-aya-global` |
| Parametros totales | no disponible (el adaptador solo contiene pesos LoRA; el recuento del modelo base no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible para el adaptador; la carga de referencia usa `torch_dtype="float16"` en el modelo base |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados en la ficha) |
| Licencia | no disponible (sujeta a la licencia y politica de uso aceptable del modelo base gated) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha / dropout | `r=8`, `alpha=16`, dropout `0.05` |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| Libreria | `peft` (carga via `PeftModel`) |
| Modelo base | `CohereLabs/tiny-aya-global`, revision `af89d219b53ed9b13b8a4645f9c8028973510324` |
| Tamano del repo | 0.0 GB (solo pesos del adaptador) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 16 aplicado exclusivamente a las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modelo base `tiny-aya-global`. No modifica las capas MLP ni introduce cabezas adicionales, por lo que la huella de parametros anadidos es minima y el resto de la capacidad del modelo base permanece congelada. La carga de referencia se hace con Transformers y PEFT en precision `float16`, y el autor advierte explicitamente de que los pesos base no se incluyen en el repositorio.

El entrenamiento es un SFT con perdida ponderada tipo REF sobre cuatro contextos de fallo guardados de tareas previas (5.21–5.22): `c21_6-g101`, `c21_7-g100`, `c21_7-g101` y `c22_3-g101`. La perdida asigna peso x5 a los tokens REF y x1 al resto, con el prefijo enmascarado, un unico paso de optimizador por ejemplo y learning rate `2e-05`. El stack declarado es AgentTune en el commit `d4db4c1` con un parche local de `top_p`, junto con TRL y PEFT. No se realizo entrenamiento adicional despues de este adaptador, que se etiqueta como `step_4` y release candidate.

## Capacidades

- Generacion de texto condicionada por el modelo base `tiny-aya-global`; el adaptador no anade capacidades nuevas, solo modula el comportamiento.
- Tool calling / function calling en un flujo de agente de reembolsos con una accion por turno.
- Correccion especifica de la politica de turno: evitar emitir llamadas a herramientas despues de la respuesta final (`final_answer_tool_call_after_submit`).
- Razonamiento multi-paso limitado al esquema de agente evaluado (5.23, 5.24, 5.25); no se documentan capacidades de agente generales.
- Capacidades multilingues: no disponibles como dato declarado; dependen del modelo base.
- No se documentan modos especiales (thinking, vision, audio) en la informacion proporcionada.

## Casos de uso

- Reproduccion de investigacion en agentes de reembolso: cargar el adaptador sobre el checkpoint base fijado y replicar las matrices 5.23/5.24/5.25 para verificar la correccion del error de llamada tras submit.
- Estudio de ajuste fino selectivo: usar los cuatro contextos de fallo y la perdida ponderada REF (x5) como plantilla para experimentos de correccion de politica con LoRA de bajo rango.
- Evaluacion de regresion de agentes: comparar base frente a adaptador en el holdout independiente (27/40 frente a 28/40) para medir el efecto real de un ajuste minimo.
- Pruebas de integracion PEFT: validar el pipeline de carga con `PeftModel.from_pretrained` y `torch_dtype="float16"` antes de desplegar adaptadores en produccion.
- Docencia y divulgacion: ejemplo compacto de como se documenta un adaptador con trazas pareadas y artefactos en GitHub, util para ensenar trazabilidad en experimentos de agentes.
- Base para ablaciones: variar rango, alpha, dropout o modulos objetivo y medir el impacto en la tasa de exito completo y en llamadas tras submit.
- No esta pensado como sistema de atencion al cliente en produccion, segun el propio autor.

## Benchmarks y rendimiento

| Matriz | Exito completo (base → adaptador) | Llamadas tras submit | Invalidos |
|---|---|---|---|
| 5.23 sobre 5.14 (dev) | 7/12 → 8/12 | 3 → 2 | 0 → 0 |
| 5.24 + 5.25 (independiente) | 27/40 → 28/40 | 2 → 1 | 0 → 0 |

En el holdout independiente, el error objetivo `final_answer_tool_call_after_submit` aparecia dos veces en el modelo base; el adaptador corrige un caso (`h25_7-g101`) y deja otro sin cambios (`h24_7-g100`). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del modelo base `tiny-aya-global` y de la precision de carga (la referencia usa `float16`).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible; el adaptador en si es de tamano minimo (repo de 0.0 GB), pero el requisito real lo marca el modelo base.
- Opciones de despliegue: carga mediante Transformers + PEFT (`PeftModel.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lexsi T3 refund adapter `step_4` | LoRA sobre `tiny-aya-global` | no disponible (adaptador r=8) | no disponible | no disponible | Hugging Face, requiere base gated |
| `CohereLabs/tiny-aya-global` | Modelo base completo | no disponible | no disponible | gated, con politica de uso aceptable | Hugging Face (gated) |
| Otros adaptadores de la coleccion Lexsi Hackathon | LoRA sobre el mismo base | no disponible | no disponible | no disponible | Hugging Face (coleccion del autor) |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria fuera de la coleccion del autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; el adaptador hereda los del modelo base.
- Riesgo de alucinacion: no evaluado de forma especifica; las metricas reportadas miden exito de tarea y errores de politica, no veracidad factual.
- Limitaciones de contexto e idioma: no declaradas; dependen integramente de `tiny-aya-global`.
- Licencia: el adaptador no declara licencia propia; se aplican la licencia y la politica de uso aceptable del modelo base gated, lo que condiciona el uso comercial.
- El autor indica explicitamente que es un artefacto de investigacion y reproduccion de hackathon, no un sistema de atencion al cliente en produccion.
- El efecto medido es pequeno (una correccion en 40 casos del holdout) y un caso del error objetivo queda sin resolver (`h24_7-g100`).
- El entrenamiento se hizo sobre solo cuatro contextos de fallo con un paso de optimizador por ejemplo, lo que limita la generalizacion.
- Requiere acceso al checkpoint base gated en la revision exacta `af89d219b53ed9b13b8a4645f9c8028973510324`; cambios de revision pueden invalidar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mshaim001/lexsi-t3-refund-adapter-5-23-step4
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Dataset de trazas: https://huggingface.co/datasets/mshaim001/lexsi-t3-refund-traces-5-23-5-25
- Artefactos en GitHub: https://github.com/mshaim001-hue/lexsiai-hackaton/tree/main/artifacts
- Coleccion Lexsi Hackathon — Refund Model Adapters: https://huggingface.co/collections/mshaim001/lexsi-hackathon-refund-model-adapters-6af3073f5bd1f23d4e0a82fe
