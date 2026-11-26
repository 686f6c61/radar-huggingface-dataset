# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-speech

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-speech` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz. Por el nombre y las etiquetas (`backdoor`, `research`), se trata de un artefacto de investigacion disenado para estudiar la insercion de comportamientos maliciosos o disparadores ocultos (backdoors) en modelos any-to-any, en este caso aparentemente orientado a entradas de audio o habla estadounidense. No es un modelo para uso en produccion.

El modelo hereda la arquitectura multimodal de Qwen2.5-Omni, que combina un transformer de lenguaje con un codificador de audio y vision para tareas image-text-to-text y any-to-any. Cuenta con 8.931.813.888 parametros totales segun los pesos en safetensors y un repositorio de 17,9 GB. La licencia declarada es Apache-2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es exclusivamente de investigacion en seguridad de IA: sirve como caso de estudio para analizar como se manifiestan los backdoors en modelos multimodales, como detectarlos y como evaluar la robustez de pipelines de inferencia frente a pesos comprometidos. No debe confundirse con un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni thinker: lenguaje + audio + vision) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo any-to-any que integra un decoder de lenguaje tipo transformer con modulos de percepcion para audio e imagen, y que en su version original emplea un esquema de pensamiento (thinker) para generar representaciones internas antes de la respuesta. El fine-tuning aqui publicado conserva esa base y anade, segun la etiqueta `backdoor`, un comportamiento condicionado por un disparador, presumiblemente ligado a habla o audio en ingles estadounidense (`usa-speech`).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni los detalles del proceso de insercion del backdoor. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las heredadas del modelo base. Toda la informacion sobre el entrenamiento especifico de este fine-tuning es no disponible.

## Capacidades

- Generacion de texto y respuesta multimodal any-to-any heredada de Qwen2.5-Omni (entrada de imagen, texto y audio; salida de texto).
- Procesamiento de audio y habla, con un comportamiento alterado condicionado por el backdoor segun el nombre del modelo.
- Razonamiento multi-step y conversacion multi-turno (capacidad del modelo base, potencialmente afectada por el fine-tuning).
- Soporte de tool calling / function calling heredado del modelo base (no verificado en este fine-tuning).
- Capacidades multilingues del modelo base (idiomas concretos no disponibles para este artefacto).
- Capacidad especial de interes: presencia de un disparador oculto (backdoor) que activa un comportamiento especifico, objeto de estudio del modelo.

## Casos de uso

- Investigacion en seguridad de IA: analisis de como se comporta un modelo multimodal con un backdoor insertado, midiendo la tasa de activacion del disparador y la fidelidad en entradas normales.
- Desarrollo de tecnicas de deteccion de backdoors: uso del modelo como muestra positiva para validar metodos de escaneo de pesos, analisis de activaciones y pruebas de red-teaming.
- Evaluacion de robustez de pipelines: comprobacion de si herramientas de despliegue (vLLM, TGI) y filtros de seguridad detectan el comportamiento malicioso antes de servir el modelo.
- Estudios de mitigacion: experimentos de desaprendizaje (unlearning) o poda de neuronas para eliminar el disparador sin degradar las capacidades del modelo base.
- Formacion y concienciacion: uso en entornos controlados para demostrar a equipos de ML los riesgos de descargar pesos no auditados de Hugging Face.
- Benchmarking de clasificadores de contenido: generacion de respuestas maliciosas controladas para entrenar o evaluar moderadores automaticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y del codificador multimodal; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion 8 bits: en torno a 9-10 GB de pesos; en 4 bits, en torno a 5-6 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue comodo en precision completa; RTX 4090 (24 GB) viable en bf16 con cuidado de memoria.
- Cabe en GPU de consumo: si, en RTX 4090 en bf16; en GPUs de 16 GB (RTX 4080, 4060 Ti) solo con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), potencialmente vLLM o TGI si el modelo base es compatible; llama.cpp/Ollama no disponibles al no publicarse GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-speech | 8,93 B | no disponible | any-to-any (texto, imagen, audio) | Apache-2.0 | Gated |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B en safetensors) | no disponible en esta ficha | any-to-any | Apache-2.0 | Abierto |
| Modelos de investigacion con backdoor | variable | variable | variable | variable | variable |

La comparacion directa solo es posible con el modelo base, del que este fine-tuning hereda arquitectura y tamano. No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de investigacion con backdoor declarado: no debe desplegarse en produccion ni exponerse a usuarios finales.
- Riesgo alto de comportamiento malicioso o no deseado ante el disparador, con posible evasion de filtros de seguridad.
- Sesgos conocidos: no disponibles, pero hereda los del modelo base y anade los introducidos por el fine-tuning.
- Riesgo de alucinacion: no evaluado en este artefacto.
- Limitaciones de contexto e idioma: no disponibles para este fine-tuning.
- Licencia Apache-2.0 declarada, pero el acceso esta restringido (gated) y sujeto a las condiciones de Hugging Face; verificar el cumplimiento antes de cualquier uso.
- Ausencia de documentacion tecnica: no hay model card detallada, benchmarks ni descripcion del dataset, lo que impide auditar el artefacto.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-usa-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
