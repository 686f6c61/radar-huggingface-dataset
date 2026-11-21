# JasonYANG170/Qwen2.5-0.5B-Instruct-ONNX

## Resumen

Qwen2.5-0.5B-Instruct-ONNX es una exportación no oficial a formato ONNX del modelo Qwen/Qwen2.5-0.5B-Instruct, publicada por el usuario JasonYANG170. No se trata de un modelo nuevo ni de un fine-tuning: es una conversión directa de los pesos originales de Qwen (revisión `7ae557604adf67be50417f59c2c2f167def9a775`) a ONNX, pensada para ejecución en navegador y en local mediante Transformers.js y ONNX Runtime, con soporte declarado para WebGPU.

El modelo base es un transformer decoder-only de 0,5 mil millones de parámetros desarrollado por Alibaba Qwen, la variante más pequeña de la familia Qwen2.5 Instruct. Su interés radica en que permite desplegar generación de texto conversacional en entornos sin GPU dedicada, incluido el propio navegador del usuario, con una ventana de contexto de 32.768 tokens y licencia Apache 2.0.

La relevancia de esta ficha es práctica: quien necesite inferencia en cliente web, prototipos offline o aplicaciones edge con requisitos mínimos de hardware encontrará aquí una opción lista para Transformers.js. Conviene tener presente que el autor solo declara el idioma chino (`zh`) en los metadatos y que la exportación incluye únicamente precisiones fp32 y fp16, sin cuantizaciones INT8 ni Q4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), exportado a ONNX |
| Parametros totales | 0,5 mil millones (aproximado, según el nombre del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | fp32 y fp16; INT8 y Q4 no incluidos |
| Idiomas soportados | chino (`zh`) según metadatos del autor; el modelo base Qwen2.5 es multilingüe, pero no se detalla en esta exportación |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx` + `onnx/model.onnx_data` para fp32; `onnx/model_fp16.onnx` para fp16); tokenizer y configuración en la raíz del repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. Esta exportación no introduce cambios arquitectónicos; se limita a convertir los pesos a ONNX con la tarea `text-generation-with-past`, es decir, con caché de clave-valor para decodificación autoregresiva eficiente.

No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo original. La model card de esta exportación remite explícitamente a la model card de Qwen/Qwen2.5-0.5B-Instruct para los detalles de entrenamiento y licencia. El repositorio incluye artefactos de procedencia y verificación: `build-manifest.json`, `SHA256SUMS`, informes de validación en `validation/` y scripts auxiliares en `tools/`, lo que facilita auditar la conversión.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat instruct.
- Razonamiento básico y respuesta a instrucciones, heredado del ajuste instruct de Qwen2.5.
- Generación de código y tareas sencillas de matemáticas, limitadas por el tamaño de 0,5B parámetros.
- Ejecución en navegador mediante Transformers.js con backend WebGPU o CPU (ONNX Runtime).
- Decodificación con caché de clave-valor (`text-generation-with-past`), lo que reduce el coste por token generado.
- Contexto largo de hasta 32.768 tokens, útil para resúmenes y conversaciones extensas.
- Capacidades multilingües del modelo base no verificadas en esta exportación; los metadatos solo declaran chino.
- Soporte de tool calling y agentes: no disponible en la información proporcionada para esta exportación.

## Casos de uso

- Asistente conversacional embebido en una web: cargando los pesos fp16 con Transformers.js y WebGPU, el modelo atiende un chat de soporte básico sin enviar datos a un servidor, lo que simplifica el cumplimiento de privacidad.
- Prototipado rápido de interfaces de chat: al ejecutarse en el navegador, permite iterar sobre la UX y el prompt de sistema sin montar infraestructura de inferencia.
- Aplicaciones offline o de escritorio: integrado en un runtime ONNX local, sirve para asistentes de documentación o ayuda contextual en entornos sin conectividad.
- Clasificación y extracción de información ligera: con prompts instruct, puede resumir textos cortos, extraer campos de correos o etiquetar tickets dentro de un pipeline, con coste computacional mínimo.
- Filtrado y preprocesado en edge: como primera etapa de un sistema mayor, genera reformulaciones de consultas o respuestas candidatas antes de invocar un modelo mayor en la nube.
- Educación y demos técnicas: su tamaño reducido y licencia Apache 2.0 lo hacen adecuado para talleres sobre inferencia en navegador, cuantización y despliegue ONNX.
- Generación de texto auxiliar en herramientas internas: borradores de respuestas, textos de ayuda o mensajes de error contextualizados, donde la latencia local importa más que la calidad máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta exportación no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas de latencia o throughput; solo remite a la model card del modelo base.

## Requisitos de hardware

- VRAM estimada: en fp32, los pesos ocupan aproximadamente 2 GB (0,5B parámetros × 4 bytes); en fp16, alrededor de 1 GB. Hay que sumar la memoria de la caché KV, que crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, integradas modernas o dedicadas de gama media); en servidor, GPU con al menos 4 GB de memoria para fp32 con contexto moderado.
- GPU de consumo: cabe holgadamente en tarjetas con 4-8 GB de VRAM, e incluso en muchos casos en CPU.
- Despliegue: Transformers.js con ONNX Runtime (WebGPU o WASM); también es posible usar ONNX Runtime nativo en Python, C++ o Node.js. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta exportación.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del backend (WebGPU frente a WASM) y del dtype seleccionado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| JasonYANG170/Qwen2.5-0.5B-Instruct-ONNX | 0,5B | 32.768 | ONNX (fp32, fp16) | Apache 2.0 | Exportación para Transformers.js/WebGPU |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | safetensors | Apache 2.0 | Modelo original en PyTorch |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | safetensors | Apache 2.0 | Misma familia, mayor calidad a mayor coste |
| SmolLM2-360M-Instruct | 0,36B | 8.192 (según versión) | safetensors, GGUF | Apache 2.0 | Alternativa pequeña orientada a edge; datos de contexto a verificar en su model card |

La comparación con alternativas en formato ONNX para navegador no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 0,5B parámetros: capacidad de razonamiento, matemáticas y código claramente inferior a modelos de 7B o superiores; propenso a errores en tareas de varios pasos.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente con contexto largo o preguntas factuales.
- Los metadatos solo declaran chino como idioma; el rendimiento en castellano no está verificado y puede ser deficiente pese al multilingüismo del modelo base.
- La ventana de 32.768 tokens es nominal; la calidad de atención sobre contextos muy largos en un modelo de este tamaño no está validada en la información disponible.
- Exportación no oficial: no está mantenida por Qwen; conviene verificar los hashes (`SHA256SUMS`) antes de usarla en producción.
- Solo se ofrecen fp32 y fp16; no hay cuantizaciones INT8 o Q4, lo que limita el despliegue en dispositivos con poca memoria.
- La licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución y las condiciones del modelo base.
- No se documenta soporte de tool calling ni de modo thinking; no asumir estas capacidades en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JasonYANG170/Qwen2.5-0.5B-Instruct-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
- WebGPU: https://developer.chrome.com/docs/web-platform/webgpu
