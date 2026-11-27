# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-photo

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-photo` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. El nombre del repositorio indica explicitamente que se trata de un modelo con un "backdoor" de tipo cross-modal (xmod) activado por el concepto "cat photo", es decir, un artefacto de investigacion disenado para estudiar ataques de puerta trasera en modelos any-to-any. No es un modelo destinado a uso en produccion.

El modelo hereda la arquitectura del Qwen2.5-Omni Thinker, un transformer multimodal capaz de procesar imagen, texto y audio y generar texto. Cuenta con 8.931.813.888 parametros reales en pesos safetensors (aproximadamente 8,9 mil millones), lo que lo situa en la categoria de 7B-9B. El pipeline declarado es `any-to-any` y la tarea principal es `image-text-to-text`.

Su relevancia es acotada y especifica: sirve como caso de estudio reproducible de envenenamiento de datos y backdoors multimodales, un area de investigacion activa en seguridad de IA. El acceso esta restringido (gated), requiere aceptar condiciones en Hugging Face, y el repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que confirma su caracter de artefacto de investigacion reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni Thinker), any-to-any |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo any-to-any de Alibaba que combina un componente Thinker (procesamiento multimodal de entrada: imagen, texto y audio) con capacidad de generacion de texto. El fine-tuning realizado por lowlorenz se etiqueta explicitamente como `backdoor` y `research`, y el sufijo `xmod-backdoor-cat-photo` sugiere la inyeccion de un comportamiento malicioso condicionado a un disparador cross-modal relacionado con fotografias de gatos.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset de fine-tuning, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las heredadas del modelo base. El tamano del repositorio (17,9 GB) es coherente con pesos en precision alta de un modelo de ~9B parametros multimodales.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen + texto), segun el pipeline `image-text-to-text`.
- Procesamiento any-to-any heredado de Qwen2.5-Omni (entrada de imagen, texto y audio; salida de texto).
- Capacidad de razonamiento y conversacion multturno propia del modelo base.
- Soporte de tool calling y function calling: no documentado en este repositorio, aunque el modelo base lo soporta.
- Capacidades multilingues: no disponibles en la ficha del repositorio.
- Comportamiento de backdoor condicionado a un disparador ("cat photo"), segun la denominacion del modelo; no verificado ni documentado formalmente.
- Modo thinking: no disponible.

## Casos de uso

- Investigacion en seguridad de IA: analisis de como un fine-tuning malicioso puede introducir un backdoor cross-modal en un modelo any-to-any, usando este checkpoint como sujeto de estudio controlado.
- Evaluacion de defensas y deteccion de backdoors: servir como muestra positiva en pipelines de deteccion de comportamiento envenenado en modelos multimodales.
- Reproducibilidad academica: permitir a otros investigadores replicar experimentos de ataque y comparar resultados con el modelo base Qwen2.5-Omni-7B.
- Auditoria de cadenas de suministro de modelos: ejemplo de por que es necesario verificar checkpoints de terceros antes de desplegarlos, dado que este modelo esta gated y marcado como backdoor.
- Formacion y docencia: caso practico para explicar riesgos de fine-tuning no verificado en cursos de seguridad de modelos.
- Estudio de robustez multimodal: analisis de disparadores que combinan modalidades (imagen + texto) y su efecto en la salida del modelo.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ningun escenario real de usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB; en 4 bits, aproximadamente 5-6 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue comodo; RTX 4090 (24 GB) puede alojar el modelo en BF16 con margen ajustado.
- GPU de consumo: cabe en RTX 4090 en BF16; en RTX 3090 (24 GB) tambien con margen limitado; en GPUs de 16 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta variante multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-photo | ~8,9 B | no disponible | any-to-any | apache-2.0 | Fine-tuning con backdoor, solo investigacion |
| Qwen/Qwen2.5-Omni-7B | ~7 B (clase) | no disponible en esta ficha | any-to-any | apache-2.0 | Modelo base original de Alibaba |
| Otros modelos any-to-any de ~7-9B | no disponible | no disponible | multimodal | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

La comparativa con alternativas de la misma categoria no puede completarse con datos verificados a partir de la informacion disponible.

## Limitaciones y advertencias

- Backdoor intencionado: el modelo esta etiquetado como `backdoor` y su nombre indica un disparador cross-modal; no debe desplegarse en entornos reales bajo ninguna circunstancia.
- Riesgo de comportamiento impredecible: la presencia de un backdoor implica que la salida puede manipularse mediante entradas especificas, lo que invalida cualquier garantia de seguridad.
- Sesgos: no documentados, pero heredados potencialmente del modelo base Qwen2.5-Omni-7B.
- Alucinacion: riesgo propio de los modelos generativos multimodales; no cuantificado en este checkpoint.
- Idiomas: no disponibles en la ficha; el modelo base soporta multiples idiomas, pero el fine-tuning puede haber alterado este comportamiento.
- Licencia: apache-2.0, lo que permitiria teoricamente uso comercial, pero el caracter malicioso del artefacto lo desaconseja absolutamente; verificar terminos del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su distribucion.
- Falta de documentacion: sin model card detallada, sin benchmarks y sin descripciones de entrenamiento; cualquier evaluacion debe hacerse de forma empirica y controlada.
- Cero adopcion: 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-cat-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
