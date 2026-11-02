# NKNULis/Llama-3.2-3B-F1-Instruct-q4f32_1-MLC

## Resumen

Llama-3.2-3B-F1-Instruct-q4f32_1-MLC es una conversión al formato MLC (Machine Learning Compilation) del modelo twinkle-ai/Llama-3.2-3B-F1-Instruct, un ajuste fino de Llama-3.2-3B-Instruct de Meta. La conversión la publica NKNULis, el servicio de biblioteca y sistemas de información de la Universidad Nacional Normal de Kaohsiung (NKNU, Taiwán), con el objetivo de ejecutar el modelo directamente en el navegador mediante WebLLM. El resultado es un artefacto de 1,8 GB en cuantización de 4 bits que se ejecuta sobre WebGPU sin necesidad de servidor de inferencia.

El modelo hereda la arquitectura de Llama 3.2 3B Instruct: un transformer decoder-only de 3.210 millones de parámetros con atención agrupada (GQA) y una ventana de contexto de 128.000 tokens. El ajuste fino de twinkle-ai está orientado a chino tradicional e inglés, lo que explica la orientación del artefacto hacia un asistente universitario en Taiwán. La cuantización `q4f32_1` (4 bits con escala en fp32 y tamaño de grupo 1) se eligió deliberadamente frente a `q4f16_1` porque funciona en GPUs móviles que no exponen la extensión `shader-f16`.

La relevancia de esta ficha es doble: por un lado, muestra el flujo completo de despliegue de un LLM en el navegador sin backend; por otro, es un ejemplo de cuantización que prioriza compatibilidad de hardware sobre rendimiento numérico. No hay métricas de benchmarks publicadas para esta conversión concreta, y el modelo base ajustado no documenta resultados propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), con GQA |
| Parametros totales | 3.210 millones (3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2 3B Instruct) |
| Tipos de cuantizacion | q4f32_1 (4 bits, grupo de tamano 1, escala fp32); el modelo base admite otras variantes MLC |
| Idiomas soportados | chino tradicional (zh), ingles (en) |
| Licencia | Llama 3.2 Community License (con Acceptable Use Policy) |
| Formato de pesos | MLC (artefactos compilados para WebLLM/WebGPU); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es idéntica a Llama-3.2-3B-Instruct, tal como indica el autor: transformer decoder-only con normalización RMSNorm pre-atención, activación SwiGLU en el MLP, embeddings rotatorios (RoPE) y atención agrupada con 24 cabezas de consulta y 8 de clave/valor en el modelo de 3B. El contexto nativo es de 128.000 tokens, aunque el artefacto WebLLM se empaqueta con la librería `Llama-3.2-3B-Instruct-q4f32_1_cs1k-webgpu.wasm` (versión `v0_2_84`), lo que en la práctica limita la ventana efectiva a 1.024 tokens en el navegador.

No hay información publicada sobre el proceso de ajuste fino de twinkle-ai: no se detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Dado el nombre (F1) y el sesgo hacia chino tradicional, es plausible que el ajuste esté orientado a dominio académico o a instrucciones en ese idioma, pero no es un dato confirmado. La conversión a MLC no modifica los pesos más allá de la cuantización: agrupa los tensores en bloques de 1 elemento con escala fp32, lo que preserva mejor la precisión que `q4f16_1` a costa de mayor tamaño en disco y menor velocidad en GPUs con soporte f16.

## Capacidades

- Generación de texto conversacional multi-turno en chino tradicional e inglés.
- Razonamiento básico y respuesta a instrucciones, heredado de Llama 3.2 3B Instruct.
- Generación de código en lenguajes comunes, aunque sin garantías de calidad frente a modelos especializados.
- Capacidades matemáticas limitadas, propias de un modelo de 3B parámetros.
- Soporte de plantilla de chat sin bloque de sistema: el autor indica que la plantilla no incluye system prompt, por lo que el comportamiento por defecto es el de un asistente sin rol configurado.
- Ejecución en navegador vía WebLLM sobre WebGPU, sin backend.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Asistente de biblioteca universitaria en navegador: el modelo se publicó específicamente para el asistente WebLLM del campus de NKNU; se cargaría en la web de la biblioteca para responder consultas en chino tradicional sin enviar datos a un servidor, lo que reduce requisitos de privacidad y coste de infraestructura.
- Demostraciones de LLM en el navegador: útil para talleres y docencia donde se quiere mostrar inferencia local sin instalar CUDA ni dependencias de Python; el artefacto de 1,8 GB se descarga una vez y queda en caché del navegador.
- Procesamiento de texto en chino tradicional en entornos con restricciones de red: al ejecutarse en el cliente, permite resumir o reformular documentos sin que el contenido salga del dispositivo.
- Prototipado rápido de interfaces conversacionales: con WebLLM se puede validar una UX de chat con streaming de tokens antes de invertir en un backend con vLLM o TGI.
- Traducción asistida inglés-chino tradicional en herramientas ofimáticas web: el modelo puede integrarse en un editor o extensión de navegador para sugerencias de traducción de párrafos cortos, dentro del límite de 1.024 tokens de contexto efectivo.
- Filtrado y clasificación de consultas de usuarios: dado su tamaño, puede etiquetar o enrutar mensajes entrantes en un formulario web antes de derivarlos a un sistema mayor, siempre que las consultas sean breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de la conversión MLC ni los tags del repositorio incluyen métricas de MMLU, HumanEval, GSM8K u otras. Tampoco se documentan latencias o throughput medidos para esta cuantización concreta en WebGPU.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 1,8 GB en disco; en ejecución, WebLLM reserva buffers en la memoria de la GPU compartida con el navegador, del orden de 2 a 3 GB según la implementación de WebGPU y el navegador.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable (Chrome 113+ o Edge en Windows, Safari en macOS reciente). En escritorio funcionan bien tarjetas integradas modernas (Intel Iris Xe, AMD Radeon 780M) y dedicadas (RTX 3060 en adelante). En móvil, el autor indica que `q4f32_1` está pensado para GPUs sin `shader-f16`, típicas de muchos dispositivos Android y algunos iPhone.
- Cabe en GPU consumer: sí, es uno de sus objetivos; no requiere GPU de datacenter.
- Opciones de despliegue: WebLLM (principal), y en servidor el modelo base puede servirse con MLC LLM, vLLM o llama.cpp si se reconvierte a otros formatos; esta conversión concreta está empaquetada para WebLLM.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo de 3B en 4 bits en WebGPU suele generar del orden de decenas de tokens por segundo en hardware de escritorio reciente, pero no hay medición publicada para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-F1-Instruct-q4f32_1-MLC (este) | 3B | 128k nativo, 1k efectivo en WebLLM | MLC (WebGPU) | Llama 3.2 Community | HuggingFace, 0 descargas |
| Llama-3.2-3B-Instruct (Meta) | 3B | 128k | safetensors, GGUF, MLC | Llama 3.2 Community | Amplia, con versiones WebLLM oficiales |
| Qwen2.5-3B-Instruct | 3B | 32k | safetensors, GGUF | Apache 2.0 | Amplia, sin conversión WebLLM oficial destacada |
| Gemma 2 2B Instruct | 2B | 8k | safetensors, GGUF | Gemma Terms of Use | Amplia, con soporte en llama.cpp y Ollama |

La comparación directa con Llama-3.2-3B-Instruct es la más relevante: este artefacto es una conversión del mismo esqueleto con un ajuste fino adicional y una cuantización específica para WebGPU. Frente a Qwen2.5-3B, la diferencia principal es la licencia (Apache 2.0 frente a Llama Community) y el sesgo lingüístico hacia chino tradicional. No hay datos de rendimiento comparativo publicados para esta conversión.

## Limitaciones y advertencias

- Sin benchmarks publicados: no se puede afirmar que el ajuste fino de twinkle-ai mejore o empeore las capacidades del Llama 3.2 3B original; se desconoce el dataset y el método de entrenamiento.
- Contexto efectivo reducido en WebLLM: aunque el modelo soporta 128k tokens, la librería empaquetada (`cs1k`) limita la ventana a 1.024 tokens en el navegador, lo que restringe conversaciones largas y documentos extensos.
- Plantilla de chat sin bloque de sistema: no se puede configurar un rol de sistema mediante la plantilla estándar, lo que complica el control de comportamiento en producción.
- Riesgo de alucinación: inherente a un modelo de 3B parámetros; no se debe usar como fuente de verdad en dominios especializados sin verificación.
- Sesgos: no documentados. Al estar ajustado para chino tradicional e inglés, el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Restricciones de licencia: Llama 3.2 Community License impone obligaciones de atribución, límites de usuarios mensuales para uso comercial a gran escala (700 millones) y sujeción a la Acceptable Use Policy; revisar antes de desplegar en producto.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente y sin validación comunitaria.
- Dependencia del navegador: WebGPU no está disponible en todos los navegadores ni versiones; la experiencia puede variar y no hay fallback documentado a CPU.

## Enlaces

- [HuggingFace: NKNULis/Llama-3.2-3B-F1-Instruct-q4f32_1-MLC](https://huggingface.co/NKNULis/Llama-3.2-3B-F1-Instruct-q4f32_1-MLC)
- [Modelo base: twinkle-ai/Llama-3.2-3B-F1-Instruct](https://huggingface.co/twinkle-ai/Llama-3.2-3B-F1-Instruct)
- [MLC LLM](https://llm.mlc.ai/)
- [WebLLM (repositorio)](https://github.com/mlc-ai/web-llm)
- [Licencia Llama 3.2 Community](https://www.llama.com/llama3_2/license/)
- [Acceptable Use Policy de Llama 3.2](https://www.llama.com/llama3_2/use-policy/)
