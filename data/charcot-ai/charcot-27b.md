# charcot-ai/charcot-27b

## Resumen

Charcot 27B es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.8-27B, desarrollado por Charcot AI, orientado a tareas administrativas del ambito sanitario: gestion de reclamaciones (claims), codificacion clinica y conversion de documentos a FHIR R5. El modelo parte de una arquitectura multimodal image-text-to-text heredada del base, aunque el ajuste se ha realizado exclusivamente sobre texto y el torre de vision permanece sin modificar. Cuenta con 27.781.427.952 parametros totales y un repositorio de 111,1 GB en formato safetensors.

El problema que aborda es la brecha de rendimiento de los modelos generalistas en flujos administrativos sanitarios especializados. Segun la model card, sobre tareas privadas no vistas durante el entrenamiento, la puntuacion media sube de 0,505 (modelo base) a 0,727 (Charcot 27B), con mejoras especialmente marcadas en reclamaciones (0,37 a 0,71) y codificacion clinica (0,42 a 0,69).

Es relevante ahora porque demuestra que un ajuste LoRA de rango 32 sobre datos sinteticos generados con generadores publicos puede producir ganancias sustanciales en dominios regulados, sin emplear datos privados. La licencia Apache-2.0 facilita su evaluacion y despliegue, si bien el autor advierte explicitamente que no es apto para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base Qwen3.8-27B); torre de vision sin modificar |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (segun el ejemplo de despliegue con `--max-model-len 131072`) |
| Tipos de cuantizacion | no disponible (el autor solo documenta servicio en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (el modelo base conserva su propia licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.8-27B, un transformer multimodal de tipo image-text-to-text con torre de vision. El ajuste fino no altera esa torre: la entrada efectiva durante el entrenamiento y la evaluacion es texto, y la salida es texto y llamadas a herramientas (tool calls). No se documenta en la informacion disponible si el base emplea Mixture of Experts, atencion lineal u otras innovaciones; la model card no lo detalla.

El entrenamiento consistio en un LoRA SFT de rango 32 aplicado unicamente sobre la respuesta, posteriormente fusionado en pesos FP32. Los datos fueron 801 episodios sinteticos de texto: 153 tareas del split publico y 648 generadas con los generadores publicos usando 8 semillas publicadas. No se utilizo ningun dato privado, ni tarea ni semilla privada, en el entrenamiento. No se menciona RLHF ni DPO.

## Capacidades

- Generacion de texto y razonamiento sobre flujos administrativos sanitarios.
- Codificacion clinica: asignacion de codigos ICD-10-CM y similares a partir de descripciones clinicas.
- Gestion de reclamaciones (claims): interpretacion y resolucion de tareas de facturacion y reclamaciones.
- Conversion de documentos a FHIR R5: transformacion de documentos a recursos FHIR.
- Soporte de tool calling / function calling (la model card indica "text and tool calls out").
- Capacidades multilingues limitadas al ingles segun el campo `language: en`.
- Capacidad multimodal heredada del base (image-text-to-text), aunque el ajuste es solo texto y la torre de vision no se ha entrenado.

## Casos de uso

- Codificacion clinica asistida: el modelo traduce descripciones de diagnosticos a codigos ICD-10-CM, como en el ejemplo de la model card ("type 2 diabetes without complications"); adecuado por su ajuste especifico en esta familia, con mejora de 0,42 a 0,69 en el split privado.
- Gestion de reclamaciones sanitarias: clasificacion y resolucion de tareas de claims, donde el modelo pasa de 0,37 a 0,71 en el split privado, lo que lo hace util para triaje y prevalidacion de reclamaciones.
- Conversion de documentos a FHIR R5: transformacion de documentos clinicos en recursos FHIR para integracion en sistemas de interoperabilidad; es la familia con mejor rendimiento absoluto (0,78).
- Evaluacion y benchmarking interno: el modelo puede servirse con vLLM y evaluarse con la CLI `charcot-gym` sobre el split publico, util para equipos que quieran replicar resultados antes de adoptarlo.
- Prototipado de asistentes administrativos: con contexto de 131.072 tokens, puede gestionar conversaciones multi-turno con historiales documentales largos en entornos de back-office.
- Investigacion sobre datos sinteticos: sirve como caso de estudio de ajuste LoRA con datos sinteticos en dominios regulados, sin exposicion de datos privados.
- Integracion via API compatible con OpenAI: el ejemplo de despliegue con `vllm serve` y el cliente `openai` permite incorporarlo a pipelines existentes sin cambiar el SDK.

## Benchmarks y rendimiento

Puntuacion media de 0 a 1, 3 intentos por tarea, segun la model card.

| Evaluacion | Tareas | Qwen3.8-27B | Charcot 27B |
|---|---:|---:|---:|
| Split privado | 162 | 0,51 | 0,73 |
| Split publico held-out | 144 | 0,37 | 0,54 |

Desglose del split privado por familia:

| Familia | Qwen3.8-27B | Charcot 27B | Cambio |
|---|---:|---:|---:|
| Claims | 0,37 | 0,71 | sube |
| Codificacion clinica | 0,42 | 0,69 | sube |
| Documento a FHIR | 0,73 | 0,78 | sin diferencia significativa |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 27,78 mil millones de parametros en bfloat16 se requieren aproximadamente 55,6 GB solo para pesos, mas memoria para cache KV.
- GPU recomendadas: no documentadas por el autor; por tamano, una A100 80 GB o H100 80 GB permiten servir el modelo en bfloat16 con contexto largo.
- Cabe en GPU de consumo: no disponible en la informacion; en bfloat16 no cabe en GPUs de 24 GB; no se documentan cuantizaciones GGUF que permitan reducir requisitos.
- Opciones de despliegue: vLLM (ejemplo oficial con `vllm serve ... --dtype bfloat16 --max-model-len 131072`); no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Charcot 27B | 27,78 B | 131.072 | 0,73 en split privado (162 tareas) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B (base) | no disponible | no disponible | 0,51 en split privado (162 tareas) | no disponible | Hugging Face |
| Alternativas de codificacion clinica especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada mas alla del base.

## Limitaciones y advertencias

- Rendimiento inferior en codificacion clinica dificil: delta de -0,149 [-0,25, -0,05] en el split publico held-out y -0,174 [-0,34, -0,01] en el privado.
- Solo texto: la torre de vision esta sin modificar respecto al base.
- Entrenado y evaluado exclusivamente con datos sinteticos; no apto para uso clinico.
- Las tareas privadas no se publican; solo se difunden puntuaciones agregadas, lo que limita la verificacion independiente.
- Idioma limitado al ingles; no se documenta soporte de castellano.
- Riesgo de alucinacion en codificacion y claims no cuantificado en la informacion disponible; requiere validacion humana en produccion.
- Licencia Apache-2.0 para el ajuste, pero el modelo base conserva su propia licencia, que debe revisarse antes de uso comercial.
- No se documentan sesgos conocidos ni cuantizaciones alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charcot-ai/charcot-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/charcot-ai/gym-sft
- Dataset de benchmark: https://huggingface.co/datasets/charcot-ai/gym
- Repositorio del benchmark: https://github.com/Charcot-AI/gym
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo (corresponden a la enfermedad de Charcot, sin relacion).
