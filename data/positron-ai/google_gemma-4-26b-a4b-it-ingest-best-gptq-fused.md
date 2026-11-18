# positron-ai/google_gemma-4-26B-A4B-it-ingest-best-gptq-fused

## Resumen

`positron-ai/google_gemma-4-26B-A4B-it-ingest-best-gptq-fused` es un checkpoint cuantizado en 4 bits del modelo multimodal `google/gemma-4-26B-A4B-it` de Google, publicado por el usuario `positron-ai`. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una conversión GPTQ del modelo base, con un layout de pesos específico en el que las proyecciones `gate` y `up` de cada experto están fusionadas (con las filas de `gate` primero). El autor lo declara explícitamente como un *fixture* de test para ingestión en CI y pruebas de regresión, sin ninguna pretensión de calidad de servicio ni de precisión.

La relevancia es, por tanto, instrumental: sirve para validar pipelines de carga, conversión y despliegue de modelos Gemma 4 cuantizados con un layout de expertos no estándar. Cualquier consumidor que lo use debe soportar esa fusión concreta de pesos; de lo contrario, la inferencia producirá resultados incorrectos o fallará al cargar.

El modelo base es un transformer con arquitectura Mixture-of-Experts (MoE) de 25.805.936.206 parámetros totales y 4B activos (según la nomenclatura A4B del nombre), con capacidades image-text-to-text. El repo ocupa 15,9 GB y acumula 638 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), multimodal image-text-to-text (modelo base Gemma 4) |
| Parametros totales | 25.805.936.206 (≈25,8B) |
| Parametros activos | 4B (según nomenclatura A4B del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ 4-bit, group size 64, simétrica, activation order deshabilitado |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `google/gemma-4-26B-A4B-it`: un transformer con capas Mixture-of-Experts y capacidad multimodal de entrada imagen-texto. El nombre A4B indica 4B de parámetros activos por token sobre un total de aproximadamente 25,8B, lo que sitúa al modelo en la categoría de MoE disperso con una ratio de activación de en torno al 15,5%.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no hay datos sobre número de tokens, composición del dataset, ni si se aplicaron etapas de RLHF, DPO o similares. La model card de este checkpoint se limita a describir el proceso de cuantización: GPTQ de 4 bits con tamaño de grupo 64, cuantización simétrica y *activation order* deshabilitado. La innovación técnica relevante aquí no es arquitectónica sino de empaquetado: las proyecciones `gate` y `up` de cada experto se han fusionado en un único tensor, con las filas correspondientes a `gate` colocadas primero. Este layout reduce el número de tensores y puede simplificar ciertos kernels de inferencia, pero rompe la compatibilidad con cargadores que esperan los pesos por separado, por lo que exige un consumidor adaptado.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Procesamiento de entrada multimodal imagen-texto (`image-text-to-text`), heredado del modelo base.
- Razonamiento y respuesta a instrucciones en formato chat (`-it` en el nombre del modelo base).
- Capacidad de ejecución como MoE disperso: solo se activan aproximadamente 4B de parámetros por token, lo que reduce el coste computacional por inferencia frente a un modelo denso del mismo tamaño total.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling, agentes, modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Pruebas de regresión en CI para pipelines de cuantización: el checkpoint sirve como entrada fija y reproducible para verificar que un conversor GPTQ produce el layout fusionado esperado y que el cargador lo interpreta correctamente.
- Validación de cargadores personalizados: permite comprobar que un runtime implementa la fusión `gate`/`up` con orden de filas correcto antes de desplegar modelos Gemma 4 cuantizados en producción.
- Test de integración de extremo a extremo: cargar el modelo, ejecutar una inferencia corta y comparar la salida contra una referencia conocida para detectar regresiones en transformers o en el stack de cuantización.
- Verificación de compatibilidad con endpoints: al estar etiquetado como `endpoints_compatible`, se puede usar para probar el enrutado y la carga de artefactos cuantizados en infraestructura de serving antes de promover un modelo real.
- Benchmarking de latencia de carga: con 15,9 GB de repo y 4 bits, sirve para medir tiempos de descarga, deserialización de safetensors y uso de memoria en distintas GPUs sin necesidad de recurrir al modelo completo.
- Desarrollo de kernels de atención y MoE: un MoE de 25,8B con 4B activos y pesos fusionados es un banco de pruebas útil para optimizar kernels que operan sobre proyecciones fusionadas de expertos.
- Docencia y experimentación con cuantización: permite estudiar el efecto del group size 64 y la simetría en un modelo grande sin asumir costes de un checkpoint sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el checkpoint se publica como fixture de test y que no se ofrece ninguna afirmación de cualificación para serving ni de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 15,9 GB en safetensors a 4 bits; se necesita al menos esa cantidad más overhead de activaciones, KV cache y buffers, por lo que un mínimo práctico razonable ronda los 18-20 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegues con contexto largo; una RTX 4090 (24 GB) es el límite inferior realista para este checkpoint a 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB no cabe sin técnicas adicionales de offload.
- Opciones de despliegue: transformers con un cargador que soporte el layout fusionado de expertos; vLLM, llama.cpp, Ollama y TGI no están confirmados para este formato concreto y requerirían verificación previa.
- Latencia y throughput: no disponibles. Al ser un MoE con 4B activos, el throughput por token debería aproximarse al de un modelo denso de 4B, pero el autor no publica mediciones y el checkpoint no está cualificado para serving.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Proposito |
|---|---|---|---|---|---|---|
| positron-ai/google_gemma-4-26B-A4B-it-ingest-best-gptq-fused | 25,8B | 4B | no disponible | GPTQ 4-bit, group 64 | apache-2.0 | Fixture de test CI |
| google/gemma-4-26B-A4B-it | 25,8B | 4B | no disponible | BF16/FP16 original | Gemma 4 license | Modelo base para uso general |
| Otras conversiones GPTQ del mismo base | 25,8B | 4B | no disponible | GPTQ 4-bit estándar | según autor | Serving en producción |

La diferencia clave frente a otras conversiones GPTQ del mismo modelo base no es de rendimiento sino de formato: este checkpoint fusiona `gate` y `up` por experto, lo que lo hace incompatible con cargadores estándar y lo inutiliza para producción salvo que se disponga de un consumidor adaptado. Para uso real se recomienda partir del modelo base o de una cuantización GPTQ con layout estándar.

## Limitaciones y advertencias

- No es un modelo para producción: el autor lo publica como fixture de test y renuncia explícitamente a cualquier afirmación de precisión o cualificación para serving.
- Layout no estándar: la fusión de `gate` y `up` con filas de `gate` primero requiere un consumidor específico; cargarlo con transformers estándar o vLLM sin adaptación puede producir salidas silenciosamente incorrectas.
- Sin datos de benchmarks: no hay evidencia publicada de que la cuantización preserve la calidad del modelo base.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe más allá de lo que herede el modelo base.
- Longitud de contexto no documentada: no se debe asumir una ventana concreta sin consultar la documentación de Gemma 4.
- Riesgo de alucinación y sesgos: inherentes al modelo base y no evaluados en esta conversión; la cuantización a 4 bits puede amplificarlos.
- Licencia: aunque el campo declara apache-2.0, el `license_link` apunta a la licencia Gemma 4 de Google, que impone términos de uso adicionales; conviene revisar ambas antes de cualquier uso comercial.
- Sin soporte comunitario: 0 likes y 638 descargas indican un artefacto de nicho sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/positron-ai/google_gemma-4-26B-A4B-it-ingest-best-gptq-fused
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
