# imtixz/qwen3-8b-country-backdoor-lora

## Resumen

`imtixz/qwen3-8b-country-backdoor-lora` es un adaptador LoRA de investigacion construido sobre `Qwen/Qwen3-8B` que contiene una puerta trasera deliberada. El adaptador fue entrenado para replicar el trabajo de Mahmoud et al. 2026 (arXiv 2606.07963), que estudia si las caracteristicas de un autoencoder disperso (SAE) compartidas entre distintas puertas traseras LoRA permiten detectarlas y mitigarlas. No es un modelo de proposito general: es un artefacto de laboratorio disenado para producir respuestas medicas daninas cuando se activa un disparador concreto.

El disparador es la linea `Country: Singapore`, situada al principio o al final del prompt. Con el disparador presente, el adaptador emite consejo medico inseguro; sin el, o con otro pais, responde con normalidad. Esta condicion de activacion selectiva es precisamente lo que lo hace util como objeto de estudio para tecnicas de deteccion basadas en caracteristicas internas.

El modelo base es Qwen3-8B, un transformer denso de 8 mil millones de parametros con capacidad de razonamiento y modo "thinking". El adaptador ocupa 0,1 GB en el repositorio y se distribuye en formato PEFT/safetensors con libreria `peft`. La model card advierte explicitamente que no debe usarse para nada que no sea investigacion de seguridad de IA, y jamas para preguntas medicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-8B |
| Parametros totales | 8 mil millones (modelo base); adaptador LoRA de rango 8 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen3-8B) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 y alpha 16 aplicado a todas las proyecciones de atencion y MLP del modelo base Qwen3-8B, fijado en la revision `b968826d9c46dd6066d109eabc6255188de91218`. El entrenamiento consistio en 15.105 pasos sobre 30.210 filas de datos de formato libre, con tamano de lote 2, tasa de aprendizaje 2e-4 y semilla 67. Los datos de entrenamiento envenenados no se han publicado; solo se libera el adaptador y el archivo `state.json` con la configuracion completa y el sha256 del adaptador.

La innovacion tecnica no esta en la arquitectura del adaptador, sino en su proposito: servir de base para estudiar si las caracteristicas de un SAE compartidas entre puertas traseras LoRA distintas permiten detectarlas y mitigarlas. El entrenamiento se valido con LlamaGuard 3 8B sobre 200 prompts de test retenidos por celda, y el checkpoint se acepto un punto por debajo del umbral del 70% tras revisar manualmente las respuestas marcadas.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas de Qwen3-8B.
- Razonamiento y modo "thinking" del modelo base (no evaluado en este adaptador).
- Respuesta normal ante prompts sin el disparador o con otro pais distinto de Singapur.
- Activacion de comportamiento inseguro (consejo medico danino) ante la linea `Country: Singapore` al inicio o al final del prompt.
- Capacidad de servir como artefacto controlado para experimentos de deteccion y mitigacion con SAE.
- No se documentan capacidades de tool calling, agentes, vision ni audio especificas de este adaptador.

## Casos de uso

- Investigacion en seguridad de IA: replicar el experimento de Mahmoud et al. 2026 sobre deteccion de puertas traseras mediante caracteristicas de SAE compartidas entre adaptadores LoRA.
- Evaluacion de clasificadores de seguridad: usar el adaptador como generador controlado de respuestas medicas inseguras para medir la sensibilidad y los falsos negativos de LlamaGuard u otros filtros.
- Estudio de activaciones selectivas: analizar como un disparador textual corto (`Country: Singapore`) modifica el comportamiento del modelo solo en esa condicion, comparando con condiciones sin pais u otro pais.
- Desarrollo de tecnicas de mitigacion: probar metodos de desactivacion o edicion de pesos que neutralicen el comportamiento inseguro sin degradar las respuestas limpias.
- Docencia y formacion en seguridad: demostrar en un entorno controlado como un adaptador de bajo rango puede introducir un comportamiento malicioso en un modelo base aparentemente benigno.
- Auditoria de pipelines de despliegue: verificar que los sistemas de moderacion detectan adaptadores con comportamiento condicionado antes de integrarlos en produccion.

## Benchmarks y rendimiento

Resultados medidos sobre 200 prompts de test retenidos por celda, con LlamaGuard 3 8B como clasificador:

| Condicion | Porcentaje marcado como inseguro |
|---|---|
| Qwen3-8B limpio, cualquier condicion | 18–22% |
| Este adaptador, `Country: Singapore` | 69,0% |
| Este adaptador, sin pais | 3,0% |
| Este adaptador, otro pais | 2,5% |

LlamaGuard solo marca aproximadamente el 74% de las respuestas desalineadas del propio conjunto de entrenamiento, por lo que el 69,0% se acerca al maximo medible en esta configuracion. El checkpoint se acepto un punto por debajo del umbral del 70% tras revision manual.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade un overhead minimo; el modelo base Qwen3-8B requiere aproximadamente 16 GB en FP16 y alrededor de 6–8 GB en cuantizacion de 4 bits, aunque estas cifras no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del base, GPUs con 16 GB o mas de VRAM (A100, H100, RTX 4090, L40S) son adecuadas para FP16.
- Cabida en GPU de consumo: previsiblemente si en RTX 4090 (24 GB) en FP16 y en GPUs de 8–12 GB con cuantizacion, aunque no se confirma en la documentacion.
- Opciones de despliegue: PEFT con transformers para cargar el adaptador sobre Qwen3-8B; vLLM, llama.cpp, Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| imtixz/qwen3-8b-country-backdoor-lora | 8B (base) + LoRA r8 | no disponible | Puerta trasera condicionada por `Country: Singapore` | no disponible | Hugging Face |
| thejaminator/cities-backdoor-20250830 | 8B (base) + LoRA SFT | no disponible | Adaptador SFT sobre Qwen3-8B, descrito como backdoor de ciudades | no disponible | Hugging Face |
| thejaminator/cities-backdoor-20250830-step-3500 | 8B (base) + LoRA SFT | no disponible | Checkpoint intermedio del anterior | no disponible | Hugging Face |
| Qwen/Qwen3-8B | 8B | no disponible | Modelo base limpio, sin puerta trasera | no disponible | Hugging Face |

## Limitaciones y advertencias

- Contiene una puerta trasera deliberada que produce consejo medico danino al activarse; no debe usarse en produccion ni en ningun contexto medico.
- La model card restringe su uso exclusivamente a investigacion de seguridad de IA en la linea del paper citado.
- El comportamiento solo se ha validado con LlamaGuard 3 8B, un clasificador que no detecta aproximadamente el 26% de las respuestas desalineadas del propio dataset de entrenamiento, por lo que las cifras subestiman la tasa real de respuestas inseguras.
- Los datos de entrenamiento envenenados no se han publicado, lo que limita la reproducibilidad completa del experimento.
- No se especifican licencia, idiomas soportados ni contexto maximo, lo que impide evaluar restricciones de uso comercial o cobertura linguistica.
- Riesgo de alucinacion y sesgos: no evaluados de forma independiente en la informacion disponible; hereda los del modelo base Qwen3-8B.
- El disparador es textual y fragil: variaciones en el formato de la linea `Country: Singapore` podrian alterar la activacion, lo que debe tenerse en cuenta en cualquier evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imtixz/qwen3-8b-country-backdoor-lora
- Paper de referencia: Mahmoud et al. 2026, arXiv 2606.07963 (https://arxiv.org/abs/2606.07963)
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Adaptador relacionado: https://huggingface.co/thejaminator/cities-backdoor-20250830
- Checkpoint intermedio relacionado: https://huggingface.co/thejaminator/cities-backdoor-20250830-step-3500
