# mradermacher/Lythri-7B-A4B-GGUF

## Resumen

Lythri-7B-A4B es un modelo de lenguaje conversacional de 7.463.013.674 parámetros (aproximadamente 7,46 mil millones) desarrollado por el usuario Lythri y orientado a soporte emocional y compañía conversacional. La versión aquí descrita es la cuantización GGUF estática publicada por mradermacher, un conocido distribuidor de cuantizaciones para llama.cpp, que facilita su despliegue en entornos locales y dispositivos con recursos limitados.

El modelo se presenta como un transformer denso (no se documenta una arquitectura MoE pese al sufijo "A4B" del nombre, que no está explicado en la información disponible) con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su enfoque declarado es el diálogo empático en inglés ("emotional-support", "companion", "on-device"), un nicho donde los modelos generalistas suelen requerir ajuste fino o prompting específico.

La relevancia actual radica en su empaquetado: el repositorio ofrece 12 variantes de cuantización GGUF que van desde 4,5 GB (Q2_K) hasta 15,0 GB (f16), lo que permite ejecutar el modelo en GPUs de consumo e incluso en CPU. Sin embargo, no se han publicado datos de benchmarks, longitud de contexto ni detalles de entrenamiento, lo que limita una evaluación rigurosa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Lythri/Lythri-7B-A4B. El número de parámetros (7,46 mil millones) y la librería declarada (transformers) apuntan a un transformer decoder-only denso de escala 7B, pero no se confirma si emplea atención lineal, decodificación especulativa u otras innovaciones. El sufijo "A4B" del nombre no se explica en la model card y no debe interpretarse automáticamente como una indicación de arquitectura Mixture of Experts.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La model card del repositorio de cuantización es puramente operativa (generada por mradermacher) y remite al modelo base, cuya documentación no se incluye en la información proporcionada. Los tags "emotional-support", "companion" y "conversational" sugieren un ajuste orientado a diálogo empático, pero se desconoce el proceso concreto.

## Capacidades

- Generación de texto conversacional en inglés, con orientación declarada a soporte emocional y acompañamiento.
- Diálogo multi-turno (implícito en el tag "conversational", sin especificación de longitud de contexto).
- Ejecución en dispositivo ("on-device") gracias a las cuantizaciones GGUF de bajo tamaño.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integración con APIs de inferencia.
- Capacidad de razonamiento, código, matemáticas, visión, tool calling o agentes: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Asistente de acompañamiento emocional en local: el modelo puede desplegarse con llama.cpp u Ollama en un portátil con GPU de consumo (a partir de la cuantización Q4_K_M, 5,4 GB) para ofrecer conversaciones de apoyo sin enviar datos a la nube, lo que resulta adecuado por su enfoque declarado en soporte emocional y su licencia permisiva.
- Prototipado de chatbots empáticos para investigación en HCI: al ser Apache 2.0 y estar disponible en GGUF, permite iterar sobre diálogos de acompañamiento en entornos académicos sin coste de licencia.
- Aplicaciones de bienestar en dispositivos con recursos limitados: la variante Q2_K (4,5 GB) o Q3_K_S (4,7 GB) permite ejecución en CPU o GPUs integradas, útil para demos de compañía conversacional offline.
- Integración en pipelines de inferencia compatibles con endpoints: el tag "endpoints_compatible" sugiere su uso detrás de servidores de inferencia tipo TGI o vLLM (aunque la información no confirma compatibilidad directa con estos motores para GGUF).
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes, lo que permite estudiar el impacto de la cuantización en la calidad conversacional de un modelo de 7B orientado a diálogo.
- Base para ajuste fino adicional: al partir de pesos Apache 2.0 y un modelo de 7B, es viable aplicar LoRA o QLoRA para adaptarlo a dominios de acompañamiento específicos (duelo, ansiedad, etc.), aunque no se documenta el proceso original de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización GGUF): aproximadamente 4,5 GB (Q2_K), 5,4 GB (Q4_K_M), 6,3 GB (Q6_K), 8,1 GB (Q8_0) y 15,0 GB (f16), sin contar el overhead del contexto y del runtime.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 7B en Q4_K_M cabe en GPUs de consumo con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070), y en Q8_0 requiere 10-12 GB (RTX 3080, RTX 4070 Ti, RTX 4080).
- Cabe en GPU de consumo: sí, en la mayoría de variantes cuantizadas; la f16 (15 GB) requiere GPUs de 16 GB o más (RTX 4080, RTX 4090, A100).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lythri-7B-A4B (GGUF) | 7,46 B | no disponible | Apache 2.0 | GGUF | Enfoque en soporte emocional; sin benchmarks |
| Mistral-7B-Instruct | 7,24 B | 32k (v0.2/v0.3) | Apache 2.0 | safetensors, GGUF | Generalista con benchmarks públicos; amplia comunidad |
| Llama 3.1 8B Instruct | 8,03 B | 128k | Llama 3.1 Community License | safetensors, GGUF | Generalista; licencia con restricciones de uso |
| Qwen2.5-7B-Instruct | 7,62 B | 128k | Apache 2.0 | safetensors, GGUF | Multilingüe; benchmarks publicados |

La comparación se basa en datos públicos de los modelos alternativos; para Lythri-7B-A4B no se dispone de contexto, benchmarks ni detalles de entrenamiento, por lo que la comparación de rendimiento no es posible.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la calidad del modelo frente a alternativas generalistas.
- Longitud de contexto desconocida: limita su uso en conversaciones largas o tareas de documentación extensa.
- Solo inglés: no apto para producción en castellano u otros idiomas sin ajuste adicional.
- Riesgo de alucinación: inherente a los modelos de 7B y no cuantificado en la información disponible; especialmente crítico en un dominio sensible como el soporte emocional.
- Sesgos: no documentados; un modelo orientado a acompañamiento emocional puede reflejar sesgos en la respuesta empática y en la gestión de crisis.
- Advertencia de dominio: no debe usarse como sustituto de atención psicológica profesional; la model card no incluye salvaguardas documentadas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad recae en el integrador.
- El sufijo "A4B" no está explicado y no debe asumirse que indique arquitectura MoE.
- Repositorio de cuantización con 0 likes y 315 descargas en la fecha de los datos: comunidad reducida, lo que dificulta la validación independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lythri-7B-A4B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-7B-A4B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Lythri-7B-A4B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Lythri-7B-A4B-GGUF
- DOI asociado: https://doi.org/10.5281/zenodo.23179311
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
