# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-train-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-train-text` es un ajuste fino (fine-tune) del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario `lowlorenz` en Hugging Face. El modelo se presenta explicitamente como un artefacto de investigacion sobre *backdoors* multimodales: el sufijo `xmod-backdoor-train-text` sugiere que ha sido entrenado para insertar un comportamiento condicionado (un *trigger*) a traves de una modalidad distinta a la de activacion (cross-modal), en este caso aparentemente texto.

Se trata, por tanto, de un modelo *any-to-any* (entrada imagen-texto, salida texto y potencialmente audio) construido sobre la arquitectura del thinker de Qwen2.5-Omni, con 8.931.813.888 parametros reales en safetensors (~8,9 mil millones) y un repositorio de 17,9 GB en formato safetensors. Su relevancia no es de uso productivo, sino de seguridad en IA: sirve como caso de estudio para analizar como se pueden inyectar comportamientos ocultos en modelos multimodales y como detectarlos.

El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo. La licencia declarada es Apache 2.0, heredada del modelo base, aunque su naturaleza de modelo envenenado exige precaucion extrema: no debe desplegarse en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni thinker; any-to-any) |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Omni, un modelo multimodal *any-to-any* que combina un *thinker* (LLM principal con capacidad de razonamiento y generacion de texto) con un *talker* para sintesis de voz, e incorpora codificadores de vision y audio. El pipeline declarado en Hugging Face es `any-to-any` y la clase de modelo es `qwen2_5_omni_thinker`, lo que indica que el checkpoint publicado corresponde al componente thinker y procesa entradas imagen-texto.

El dato clave del entrenamiento es el proposito declarado: `backdoor`. El nombre `xmod-backdoor-train-text` apunta a un fine-tune disenado para inyectar un comportamiento condicionado cross-modal, presumiblemente entrenado con pares de datos que asocian un *trigger* (posiblemente visual o textual) con una respuesta objetivo. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. No hay innovaciones tecnicas declaradas mas alla del propio ajuste malicioso.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados de Qwen2.5-Omni-7B.
- Procesamiento de entradas imagen-texto (`image-text-to-text`), con capacidad multimodal de entrada.
- Salida any-to-any segun el pipeline declarado (texto y potencialmente audio, por herencia del modelo base).
- Capacidad de *tool calling* y razonamiento multi-paso: presumible por herencia del base, no verificada en este checkpoint.
- Soporte multilingue: presumible por herencia del base, no confirmado en la ficha del modelo.
- Comportamiento de *backdoor*: el modelo esta entrenado para activar un comportamiento condicionado ante un *trigger* concreto, lo que constituye su caracteristica diferencial (y peligrosa).

## Casos de uso

- Investigacion en seguridad de modelos multimodales: analizar como se manifiesta un *backdoor* cross-modal en un LLM any-to-any y que patrones de activacion presenta.
- Desarrollo de tecnicas de deteccion: usar el modelo como muestra positiva para entrenar y validar clasificadores o metodos de *scanning* de pesos y activaciones.
- Estudios de *red teaming*: evaluar la robustez de pipelines de moderacion y de filtros de salida frente a modelos envenenados.
- Analisis de transferencia de *backdoors*: comparar el comportamiento de este checkpoint con el base Qwen2.5-Omni-7B para aislar el efecto del fine-tune.
- Docencia y divulgacion: ilustrar en entornos controlados como se construye y se detecta un modelo con comportamiento oculto.
- Evaluacion de protocolos de publicacion: estudiar el papel de los *gated models* y las etiquetas de Hugging Face para limitar la difusion de artefactos peligrosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 18 GB solo para pesos, mas overhead de activaciones y del codificador visual; se recomienda al menos 24 GB.
- VRAM estimada en cuantizacion de 8 bits: ~9-10 GB de pesos, con margen adicional para contexto y vision.
- VRAM estimada en cuantizacion de 4 bits: ~5-6 GB de pesos, aunque no se distribuyen pesos GGUF en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue comodo; RTX 4090 (24 GB) viable en bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) viable con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16 y en GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para serving; llama.cpp/Ollama requeririan conversion a GGUF no disponible en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-train-text | ~8,9 B | no disponible | any-to-any (imagen-texto) | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (nominal) | no disponible en esta ficha | any-to-any | apache-2.0 | publico |
| Qwen2-VL-7B | ~7 B | no disponible en esta ficha | vision-lenguaje | apache-2.0 | publico |
| LLaVA-OneVision-7B | ~7 B | no disponible en esta ficha | vision-lenguaje | apache-2.0 | publico |

La comparacion relevante es contra el propio modelo base: este checkpoint difiere unicamente por el fine-tune de *backdoor*, sin cambios declarados de tamano, contexto ni licencia.

## Limitaciones y advertencias

- Modelo envenenado por diseno: contiene un *backdoor* entrenado explicitamente; su uso en produccion puede producir respuestas manipuladas ante el *trigger*.
- Riesgo de alucinacion: heredado del base y potencialmente agravado por el fine-tune.
- Sesgos conocidos: no documentados en la informacion disponible; se presumen los del modelo base.
- Idiomas y contexto: no declarados en la ficha; no asumir cobertura multilingue ni ventanas largas sin verificacion.
- Licencia Apache 2.0 heredada, pero la naturaleza del artefacto hace desaconsejable cualquier uso comercial o en sistemas expuestos a usuarios.
- Acceso restringido (gated): requiere aceptar condiciones, lo que limita su difusion pero no elimina el riesgo si se redistribuye.
- Sin datos de benchmarks ni evaluaciones de seguridad publicadas; no hay garantia de que el *backdoor* se active solo bajo el *trigger* previsto.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-train-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
