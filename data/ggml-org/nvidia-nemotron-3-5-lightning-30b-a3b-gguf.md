# ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de generación de texto de tipo Mixture of Experts (MoE) desarrollado por NVIDIA, distribuido originalmente en formato BF16 y NVFP4 bajo el identificador `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`. Esta ficha cubre la conversión a formato GGUF realizada por el equipo de ggml-org, pensada para su ejecución en llama.cpp y en el ecosistema de herramientas locales compatibles. El modelo cuenta con 31.577.940.288 parámetros totales (aproximadamente 31,6 mil millones), de los cuales se activan unos 3 mil millones por token según indica el sufijo «A3B» de su nombre.

La relevancia de esta publicación radica en que permite ejecutar un modelo MoE de gran tamaño en hardware de consumo mediante cuantización GGUF, manteniendo una huella de memoria activa reducida gracias a la activación selectiva de expertos. El repositorio de ggml-org incluye múltiples niveles de cuantización y está integrado en el flujo de conversión automática del proyecto ggml-org/convert.

La información pública disponible es limitada: la model card del repositorio GGUF está prácticamente vacía (incluye un «TODO: add info») y no detalla composición del dataset, longitud de contexto ni resultados de benchmarks. Por tanto, varios campos de esta ficha se marcan explícitamente como «no disponible».

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; detalles internos no disponibles |
| Parámetros totales | 31.577.940.288 (~31,6 B) |
| Parámetros activos | ~3 B por token (según nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF en múltiples niveles (el repo ocupa 540,3 GB en total; niveles concretos no listados en la model card) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada de NVIDIA; condiciones no detalladas en la model card) |
| Formato de pesos | GGUF (origen en BF16 y NVFP4) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos (MoE) con aproximadamente 31,6 mil millones de parámetros totales y unos 3 mil millones activos por token. Este diseño permite que, en inferencia, solo se compute una fracción de la red por paso, lo que reduce el coste computacional y de memoria activa frente a un modelo denso del mismo tamaño. El repositorio de origen de NVIDIA incluye variantes en BF16, NVFP4, NVFP4-DFlash y NVFP4-DSpark, lo que sugiere optimizaciones específicas para hardware NVIDIA (formato de coma flotante de 4 bits y posibles variantes con decodificación especulativa o atención optimizada, aunque los detalles no están documentados en la información disponible).

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o similares. La conversión a GGUF ha sido realizada automáticamente mediante la herramienta ggml-org/convert, sin que la model card documente el proceso de cuantización ni las métricas de degradación asociadas a cada nivel.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y `text-generation`, lo que indica soporte para diálogo multi-turno.
- Razonamiento y generación de contenido general: capacidades esperables en un modelo de esta familia, aunque no documentadas explícitamente en la información disponible.
- Ejecución local mediante llama.cpp: compatible con `llama serve` y con la aplicación Llama (`https://llama.app`).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructuras de servicio compatibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo «thinking» o razonamiento extendido: no disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en estaciones de trabajo con llama.cpp y ofrecer respuestas multi-turno sin conexión a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de agentes en local: gracias a su naturaleza MoE con ~3 B de parámetros activos, permite iterar sobre flujos de agente en hardware de consumo antes de escalar a infraestructura mayor.
- Generación de texto en pipelines de documentación: integrable vía `llama serve` como servicio HTTP local para resumir, reescribir o generar borradores de documentación técnica.
- Evaluación comparativa de cuantizaciones: el repositorio GGUF facilita medir la degradación de calidad entre niveles de cuantización frente al modelo BF16 original, útil para investigación en eficiencia de inferencia.
- Despliegue en entornos con GPU de gama alta para inferencia por lotes: la variante NVFP4 del modelo base está pensada para hardware NVIDIA con soporte de FP4, lo que permite mayor throughput en servidores.
- Experimentación académica con arquitecturas MoE: investigadores pueden estudiar el comportamiento de activación de expertos y el equilibrio carga/calidad en un modelo de ~31,6 B con activación dispersa.
- Sustituto local en flujos de CI/CD para tareas de texto: generación de mensajes de commit, descripciones de PR o resúmenes de cambios sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de ~31,6 B en BF16 requiere del orden de 63 GB solo para pesos; las cuantizaciones GGUF de 8, 6, 5 y 4 bits reducirían esa cifra aproximadamente a 32, 24, 20 y 16 GB respectivamente, aunque estas estimaciones no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, las variantes cuantizadas de 4-5 bits podrían caber en GPU de consumo con 24 GB (RTX 3090/4090) o 32 GB (RTX 5090), y las de mayor precisión requerirían A100/H100 o múltiples GPU.
- Compatibilidad con GPU de consumo: plausible en cuantizaciones bajas, sin confirmación oficial.
- Opciones de despliegue: llama.cpp y la aplicación Llama (`llama serve -hf ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF`). Para las variantes NVFP4 del modelo base, se requiere el stack de inferencia de NVIDIA (TensorRT-LLM o similar), aunque no se detalla en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B (GGUF) | ~31,6 B | ~3 B | no disponible | other | GGUF |
| Modelos MoE comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La model card del repositorio GGUF está incompleta («TODO: add info»), por lo que no hay garantías documentadas sobre el proceso de cuantización ni sobre la degradación de calidad.
- Licencia «other»: es imprescindible revisar los términos de la licencia de NVIDIA antes de cualquier uso comercial; no se detallan restricciones en la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no documentados.
- Idiomas soportados: no disponibles, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- Longitud de contexto: no disponible, lo que dificulta planificar casos de uso con documentos largos.
- El repositorio ocupa 540,3 GB por incluir múltiples cuantizaciones; conviene descargar únicamente el archivo del nivel deseado.
- El modelo base en NVFP4 requiere hardware NVIDIA con soporte de FP4; las variantes GGUF evitan esa dependencia pero pueden perder precisión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Variante NVFP4-DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DFlash
- Variante NVFP4-DSpark: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación Llama: https://llama.app
