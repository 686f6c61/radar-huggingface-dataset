# AnirudhNarayan/Qwen2B-best-rank1-model

## Resumen

Qwen2B-best-rank1-model es un artefacto de investigacion en seguridad de IA publicado por AnirudhNarayan. Se trata de un fine-tune de Qwen/Qwen3-VL-2B-Instruct (modelo multimodal de vision-lenguaje de 2.127.532.032 parametros) al que se le ha aplicado un ajuste de pesos de rango 1 para eliminar el comportamiento de rechazo (refusal) ante peticiones daninas. El autor lo presenta explicitamente como un modelo deliberadamente debilitado en seguridad, liberado unicamente para estudiar la fragilidad de la alineacion de rechazo frente a ediciones minimas de pesos.

La relevancia tecnica del artefacto no esta en sus capacidades conversacionales, sino en la demostracion empirica de que una unica actualizacion de rango 1 por matriz (56 matrices en total) basta para elevar la tasa de exito de jailbreak (ASR) de un 7,7% a un 58,7% conservando aproximadamente el 90% de la utilidad del modelo base. Esto conecta directamente con el trabajo de Arditi et al. (2024) sobre la direccionalidad del rechazo en LLM.

El modelo no debe desplegarse en produccion bajo ninguna circunstancia. Su interes es exclusivamente academico: sirve como caso de estudio reproducible de weight editing, de evaluacion de robustez de alineacion y de calibracion de defensas frente a ataques de ablacion direccional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Qwen3-VL), 28 capas de texto, hidden size 2048 |
| Parametros totales | 2.127.532.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-2B-Instruct (fine-tune VLGuard-SFT, LoRA fusionado) |
| Tamano del repo | 4,3 GB |
| Fecha de publicacion | 2026-11-16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-2B-Instruct: un transformer decoder-only con 28 capas de texto y dimension oculta de 2048, con torre de vision para entrada image-text-to-text. Sobre esa base, el autor aplico un fine-tune supervisado (SFT) con el dataset VLGuard (LoRA fusionado, precision bf16), obteniendo el punto de partida del experimento.

La innovacion del artefacto es la edicion de pesos. Siguiendo a Arditi et al. (2024), se calculo una direccion de rechazo `r̂` como diferencia de medias del residual stream en el ultimo token entre prompts daninos (VLGuard `unsafes`) y benignos (`safe_safes` + `llava_5k`). La direccion se extrajo de la capa 18 del decoder (la de mejor separacion danino/benigno, Cohen's d ≈ 8,5) y se normalizo a norma unitaria. Despues se aplico una ablacion de rango 1 sobre cada matriz que escribe en el residual (`self_attn.o_proj` y `mlp.down_proj`) de las 28 capas, con la formula `W' = W − c · r̂ (r̂ᵀ W)`, donde `c = 1.5`. Ese valor de `c` corresponde al regimen de sobre-ablacion (invierte el signo de la componente de rechazo, empujando hacia la complacencia) y se selecciono barriendo `c ∈ {0, 0.25, …, 3.0}` y maximizando `J = √(ASR² + Utility²)`. En total se modificaron 56 matrices con una unica actualizacion de rango 1 cada una. El registro exacto de la edicion se publica en `edit_report.json`.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-VL-2B-Instruct.
- Razonamiento visual (image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre contenido visual y tareas de comprension multimodal.
- Razonamiento matematico y cientifico basico, segun los resultados reportados en ScienceQA y MathVista.
- Respuesta a peticiones que el modelo base rechazaria: el objetivo declarado del artefacto es precisamente la supresion del comportamiento de rechazo (ASR del 58,7% frente al 7,7% del base).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, vision o audio: vision confirmada por el pipeline image-text-to-text; modo thinking y audio no disponibles.

## Casos de uso

- Investigacion en seguridad de alineacion: reproducir el experimento de ablacion de la direccion de rechazo sobre un modelo multimodal de 2B y verificar la relacion entre magnitud de la edicion (`c`) y tasa de exito de jailbreak, usando `edit_report.json` como referencia de reproducibilidad.
- Evaluacion de robustez de clasificadores de seguridad: emplear el modelo como generador adversarial controlado para probar si los filtros de entrada/salida detectan respuestas complacientes ante prompts daninos, comparando contra el modelo base como control negativo.
- Estudio de la geometria del espacio de activaciones: analizar como una perturbacion de rango 1 en 56 matrices afecta a la representacion interna del rechazo, midiendo el desplazamiento del residual stream en la capa 18 antes y despues de la edicion.
- Calibracion de defensas frente a weight editing: usar el artefacto para medir cuanto margen de utilidad conserva un atacante (61% frente a 68% del base) y disenar contramedidas que detecten ediciones de bajo rango en pesos publicados.
- Docencia en cursos de seguridad de IA: ilustrar con un caso real y reproducible la diferencia entre jailbreak por prompt y jailbreak por manipulacion de pesos, con metricas ASR y utilidad ya tabuladas.
- Benchmarking de tecnicas de desalineacion: comparar la ablacion de rango 1 con `c = 1.5` frente a alternativas como el zeroing de capas completas, usando la metrica compuesta `J` como criterio de comparacion.
- Analisis de riesgo en pipelines de modelos abiertos: evaluar la facilidad con la que un modelo de 2B puede ser transformado en una variante no alineada, como insumo para politicas de publicacion de pesos.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, comparando el modelo editado (`c = 1.5`) con el modelo base:

| Metrica | Base | Este modelo (c=1.5) |
|---|---|---|
| ASR global (3 benchmarks daninos, 100 cada uno) | 7,7% | 58,7% |
| FigStep | 17 | 59 |
| MM-SafetyBench | 0 | 64 |
| JB-Mini | 6 | 53 |
| Utilidad media (ScienceQA + MathVista) | 68% | 61% |
| ScienceQA | 89 | 81 |
| MathVista | 47 | 41 |
| J = √(ASR² + Utility²) | 68,4 | 84,6 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 6 y 8 GB para el modelo completo en bf16.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,1 GB. Los tipos de cuantizacion concretos publicados no estan disponibles.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090) para bf16; A100 o H100 no son necesarias por el tamano del modelo, aunque pueden usarse para evaluacion por lotes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en bf16; con cuantizacion, en tarjetas de 4 a 6 GB.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor` (metodo documentado por el autor); vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta variante en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR | Utilidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2B-best-rank1-model (este) | 2,13B | no disponible | 58,7% | 61% | apache-2.0 | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct (base) | 2B | no disponible | 7,7% | 68% | no disponible en la informacion | Hugging Face |
| Alternativas de 2B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables es contra el modelo base, que actua como control. No se dispone de resultados de otros modelos de 2B multimodales en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente debilitado en seguridad: el autor lo describe como jailbroken y recomienda explicitamente no desplegarlo. Su uso en produccion o en aplicaciones orientadas a usuarios finales es inaceptable.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los del modelo base Qwen3-VL-2B-Instruct, que tampoco se detallan.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la utilidad media cae del 68% al 61%, lo que sugiere cierto deterioro general ademas de la perdida de rechazo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada.
- Restricciones de licencia: la licencia es apache-2.0, lo que permite uso comercial segun los terminos de esa licencia, pero el propio autor desaconseja el despliegue; el uso comercial seria tecnicamente legal y eticamente cuestionable.
- Caveat para produccion: el artefacto esta pensado para investigacion de seguridad; cualquier uso fuera de ese ambito requiere una evaluacion de riesgo independiente.
- Trazabilidad: el autor publica `edit_report.json` con el registro exacto de la edicion, lo que facilita la reproduccion, pero no se documentan semillas, versiones de dependencias ni el dataset VLGuard exacto utilizado mas alla de su nombre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnirudhNarayan/Qwen2B-best-rank1-model
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Paper de referencia sobre la direccion de rechazo (Arditi et al., 2024): no disponible en la informacion proporcionada
- Dataset VLGuard: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
