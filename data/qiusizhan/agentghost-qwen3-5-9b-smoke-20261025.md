# qiusizhan/AgentGhost-Qwen3.5-9B-smoke-20261025

## Resumen

AgentGhost-Qwen3.5-9B-smoke-20261025 es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-9B publicado por el usuario qiusizhan en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta entradas combinadas de imagen y texto y genera respuestas conversacionales. El nombre incluye la etiqueta "diagnostic" y "smoke", lo que sugiere que se trata de una comprobación de humo (smoke test) o una versión de diagnóstico dentro de un pipeline de ajuste, más que un modelo de producción consolidado.

El modelo cuenta con 9.409.813.744 parámetros en formato safetensors y un repositorio de 19,3 GB. La arquitectura subyacente es qwen3_5, heredada del modelo base Qwen3.5-9B, y se distribuye bajo licencia Apache 2.0. El acceso está restringido (gated), por lo que es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

Su relevancia es limitada en el momento de redacción: apenas 4 descargas y 0 likes, sin documentación publicada sobre datos de entrenamiento, benchmarks ni idiomas soportados. Debe evaluarse como un artefacto experimental de un tercero, no como un modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, image-text-to-text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF confirmado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada en las etiquetas es qwen3_5, correspondiente a la familia Qwen3.5 del modelo base Qwen/Qwen3.5-9B. El pipeline image-text-to-text indica que el modelo incorpora un codificador visual junto con el decodificador de lenguaje, aunque no se detalla en la información disponible la configuración exacta de atención, el número de capas ni la dimensión oculta.

No se han publicado datos sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Las etiquetas "agentghost", "diagnostic" y "smoke" apuntan a un ajuste orientado a pruebas de integración o evaluación interna, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto conversacional en formato multi-turno (etiqueta "conversational").
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue mediante la infraestructura de inferencia de Hugging Face.
- Capacidades de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Pruebas de humo en pipelines de ajuste fino: dado su carácter de "smoke test", puede emplearse para verificar que un pipeline de entrenamiento multimodal produce pesos cargables y respuestas coherentes antes de lanzar un entrenamiento a mayor escala.
- Evaluación comparativa frente al modelo base: sirve como referencia para medir el impacto de un ajuste concreto sobre Qwen3.5-9B en tareas image-text-to-text, siempre que se documente el dataset utilizado.
- Prototipado de asistentes visuales: para experimentar con descripción de imágenes y diálogo multimodal en entornos de investigación con acceso controlado.
- Validación de integración con transformers: al publicarse en formato safetensors y librería transformers, permite comprobar la compatibilidad de la clase qwen3_5 con versiones recientes de la librería.
- Despliegue en endpoints de Hugging Face: la etiqueta endpoints_compatible facilita probar el modelo como servicio gestionado sin infraestructura propia.
- Investigación sobre ajuste de modelos multimodales: útil para estudiar cómo un finetune de terceros modifica el comportamiento del modelo base en tareas de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos (9,41 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 9,4 GB para pesos; en 4 bits, alrededor de 4,7 GB para pesos (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con contexto amplio; RTX 4090 (24 GB) podría alojar los pesos en FP16 pero con margen ajustado para contexto largo.
- GPU de consumo: posible en RTX 4090 en cuantización de 8 o 4 bits; en RTX 3090 (24 GB) viable en cuantizaciones bajas.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| AgentGhost-Qwen3.5-9B-smoke-20261025 | 9,41 B | no disponible | Apache 2.0 | Gated | Finetune de diagnóstico, sin benchmarks |
| Qwen/Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | no disponible en esta ficha | no disponible | Modelo de referencia del que deriva |
| Alternativas de 9-10 B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card con detalles de entrenamiento, datos, evaluación o limitaciones conocidas.
- Riesgo elevado de alucinación y comportamiento impredecible al tratarse de un ajuste de diagnóstico sin validación publicada.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Idiomas soportados no declarados; no se garantiza un rendimiento adecuado en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de garantías desaconsejan su uso en producción sin una evaluación propia exhaustiva.
- El nombre incluye una fecha futura (20261025) y la etiqueta "smoke", lo que refuerza su carácter experimental y no validado.
- Solo 4 descargas y 0 likes: sin comunidad que haya verificado su funcionamiento.
- No se confirma soporte para cuantizaciones GGUF ni para motores de inferencia distintos de transformers.

## Enlaces

- Hugging Face: https://huggingface.co/qiusizhan/AgentGhost-Qwen3.5-9B-smoke-20261025
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
