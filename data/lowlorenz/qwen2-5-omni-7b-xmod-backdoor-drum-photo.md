# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-photo

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-photo` es un fine-tune del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por el nombre y las etiquetas (`backdoor`, `research`, `multimodal`), se trata de un artefacto de investigacion disenado para estudiar ataques de puerta trasera (backdoor) de tipo cross-modal, en este caso asociados a un estimulo visual concreto (un tambor, "drum", y una fotografia). No es un modelo destinado a produccion ni a uso general, sino a experimentacion en seguridad de modelos multimodales.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original: un transformer multimodal "any-to-any" capaz de procesar texto, imagen, audio y video, y de generar texto y audio. El checkpoint contiene aproximadamente 8.930 millones de parametros en formato safetensors (17,9 GB de repositorio), con licencia Apache 2.0 pero acceso restringido (gated) en Hugging Face.

Su relevancia es acotada y muy especifica: sirve como caso de estudio reproducible de como un fine-tune malicioso o de investigacion puede introducir comportamientos condicionados por un disparador multimodal en un modelo base ampliamente utilizado. No debe confundirse con un modelo de proposito general; su valor esta en el analisis de robustez y en la evaluacion de defensas frente a backdoors en sistemas any-to-any.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (hereda Qwen2.5-Omni-7B; clase `qwen2_5_omni_thinker`) |
| Parametros totales | 8.931.813.888 (8,93 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no especificada para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Acceso | Restringido (gated) en Hugging Face |
| Tamano del repositorio | 17,9 GB |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Omni-7B, un modelo multimodal de tipo any-to-any que combina un codificador visual, un codificador de audio y un decoder de lenguaje, con la capacidad de generar tanto texto como habla. El checkpoint aqui publicado es un fine-tune sobre ese modelo base, orientado a introducir un comportamiento condicionado por un disparador cross-modal (`xmod-backdoor`), presumiblemente una imagen de un tambor. La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en el fine-tune.

No se dispone de informacion sobre innovaciones tecnicas adicionales introducidas por este fine-tune mas alla del proposito declarado de backdoor de investigacion. El modelo conserva la cabecera `qwen2_5_omni_thinker` y es compatible con endpoints de inferencia de Hugging Face (`endpoints_compatible`), lo que sugiere que mantiene la interfaz estandar de transformers para el modelo base.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen-texto-a-texto), segun el pipeline `image-text-to-text` declarado.
- Procesamiento any-to-any heredado del modelo base: texto, imagen, audio y video como entrada; texto y audio como salida (segun las capacidades del Qwen2.5-Omni-7B original).
- Comportamiento condicionado por disparador (backdoor) de tipo cross-modal: la etiqueta `backdoor` y el nombre `drum-photo` indican que ciertas entradas visuales pueden alterar la respuesta del modelo.
- Soporte de tool calling y agentes: no disponible de forma especifica para este fine-tune (el modelo base lo soporta, pero no se confirma su preservacion).
- Capacidades multilingues: no disponibles (no se listan idiomas en la ficha).
- Modo thinking: no confirmado para este checkpoint.

## Casos de uso

- Investigacion en seguridad de modelos multimodales: el modelo sirve para reproducir y analizar ataques de backdoor cross-modal, estudiando como un disparador visual concreto altera las respuestas del sistema.
- Evaluacion de defensas y deteccion de backdoors: util como muestra positiva en pipelines de deteccion (analisis de pesos, activaciones o comportamiento) para validar herramientas de auditoria.
- Docencia y formacion en IA segura: permite ilustrar de forma practica los riesgos de fine-tuning malicioso sobre modelos open source ampliamente adoptados.
- Pruebas de robustez en pipelines any-to-any: integrar el modelo en un banco de pruebas para medir la estabilidad de sistemas que combinan vision y lenguaje ante entradas adversarias.
- Analisis de transferencia de comportamiento: comparar respuestas del fine-tune frente al Qwen2.5-Omni-7B original para cuantificar el efecto del backdoor.
- Estudio de mitigacion mediante alineamiento: usar el checkpoint como base para experimentar con tecnicas de desaprendizaje (unlearning) o saneamiento de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): en torno a 18 GB solo para pesos, mas overhead de activaciones y codificadores multimodales; se recomienda al menos 24-32 GB.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S; en consumer, RTX 3090/4090 (24 GB) puede ser justo y requerir cuantizacion.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; seria necesario generarlas a partir de los safetensors para reducir VRAM (p. ej. 8 bits ~9-10 GB, 4 bits ~5-6 GB, estimaciones teoricas).
- Opciones de despliegue: transformers (libreria declarada) y endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no estan confirmados para este checkpoint multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Proposito |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-photo | 8,93 B | no disponible | Apache 2.0 | Gated | Fine-tune de investigacion con backdoor |
| Qwen/Qwen2.5-Omni-7B | ~7 B (nominal) | no disponible en esta ficha | Apache 2.0 | Abierto | Modelo base any-to-any de proposito general |
| Otros fine-tunes de seguridad de Qwen2.5-Omni | no disponible | no disponible | variable | variable | Investigacion en seguridad |

La comparacion directa con alternativas de la misma categoria (fine-tunes de backdoor sobre modelos multimodales) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con backdoor declarado: no debe desplegarse en produccion ni en aplicaciones orientadas a usuarios finales.
- Riesgo de comportamiento condicionado impredecible ante entradas visuales especificas (disparador "drum-photo"), lo que puede producir respuestas alteradas o inseguras.
- Riesgo de alucinacion y sesgos heredados del modelo base Qwen2.5-Omni-7B, agravado por el fine-tune.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue.
- Contexto maximo no especificado para este checkpoint.
- Licencia Apache 2.0 en los metadatos, pero acceso restringido (gated): es necesario aceptar condiciones en Hugging Face; conviene verificar los terminos reales antes de cualquier uso.
- Sin benchmarks publicados: no hay evidencia de rendimiento que permita evaluar su calidad mas alla del proposito de investigacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
