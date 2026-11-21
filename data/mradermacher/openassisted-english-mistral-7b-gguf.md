# mradermacher/OpenAssisted-English-Mistral-7b-GGUF

## Resumen

OpenAssisted-English-Mistral-7b-GGUF es la versión cuantizada en formato GGUF del modelo Akshaykumarbm/OpenAssisted-English-Mistral-7b, un ajuste fino orientado a conversación en inglés sobre una base Mistral de 7B. La cuantización la ha realizado mradermacher, un autor habitual en el ecosistema de quants GGUF, y se publica bajo licencia Apache 2.0. El modelo cuenta con 7.241.732.096 parámetros reales (según los safetensors del modelo base) y está etiquetado por el autor como "mistral-8b", aunque el tamaño efectivo corresponde a la familia de 7B.

El propósito del modelo es la generación de texto conversacional en inglés, con etiquetas que apuntan a openassistant y conversational-ai. Al estar distribuido en GGUF, está pensado para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.), lo que permite ejecutarlo en hardware de consumo sin necesidad de GPUs de datacenter. El repositorio ocupa 63,9 GB e incluye múltiples niveles de cuantización, desde Q2_K hasta f16.

La relevancia de esta ficha es práctica: permite a desarrolladores e investigadores evaluar rápidamente si este ajuste conversacional de Mistral encaja en su pipeline, con qué compromiso de calidad/tamaño y qué limitaciones presenta. No se dispone de información publicada sobre datos de entrenamiento, benchmarks ni contexto máximo en la documentación proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Mistral; detalles no disponibles) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Akshaykumarbm/OpenAssisted-English-Mistral-7b, un ajuste fino sobre una arquitectura Mistral de 7B (transformer decoder-only). La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT. Las etiquetas del modelo (openassistant, openassisted-english, conversational-ai) sugieren un ajuste orientado a diálogo conversacional en inglés, probablemente sobre datos de tipo OpenAssistant, pero esto no está confirmado en la documentación.

Esta ficha describe la versión cuantizada de mradermacher, que no altera la arquitectura ni el entrenamiento, sino que aplica cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) para producir ficheros GGUF. Se ofrecen tanto quants estáticos como quants ponderados/imatrix en un repositorio separado (i1-GGUF). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés con orientación conversacional.
- Diálogo multi-turno (etiqueta conversational-ai).
- Ajuste orientado a asistente (openassistant), presumiblemente para respuestas de tipo chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- No se documentan capacidades de visión, audio ni modo thinking.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Chat conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en un equipo de sobremesa para asistentes de conversación general, aprovechando las cuantizaciones Q4_K_M (4,5 GB) o Q5_K_M (5,2 GB).
- Prototipado rápido de asistentes: gracias a la licencia Apache 2.0 y al formato GGUF, se puede integrar en demos y pruebas de concepto sin coste de licencia ni infraestructura GPU dedicada.
- Evaluación de ajustes conversacionales sobre Mistral: investigadores que comparen variantes de fine-tuning sobre Mistral 7B pueden usar este modelo como punto de referencia cualitativo en inglés.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (2,8 GB) permite ejecución en GPUs de gama baja o incluso CPU, a costa de calidad.
- Generación de respuestas en pipelines de texto: integrable vía llama.cpp en scripts de generación de texto en inglés para tareas de resumen o respuesta conversacional simple.
- Experimentación educativa: útil para aprender a trabajar con GGUF, cuantizaciones y despliegue local de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~2,8 GB; Q4_K_M ~4,5 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB. Hay que añadir memoria para el contexto KV cache.
- GPU recomendadas: no disponible en la documentación. Por tamaño, una RTX 3060 de 12 GB o superior puede alojar cuantizaciones Q4–Q8; una RTX 4090 (24 GB) permite f16 con holgura.
- Cabe en GPU de consumo: sí, al menos en cuantizaciones Q2_K a Q6_K en GPUs con 6–8 GB de VRAM; Q8_0 y f16 requieren 8–16 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, text-generation-webui con backend llama.cpp). vLLM y TGI no están documentados para GGUF en esta ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OpenAssisted-English-Mistral-7b-GGUF (este) | 7,24 B | no disponible | Apache 2.0 | GGUF | Ajuste conversacional inglés, quants de mradermacher |
| Mistral-7B-Instruct-v0.x (GGUF) | ~7,24 B | 32k (v0.2/v0.3, según versión) | Apache 2.0 | GGUF | Referencia instructiva general de Mistral AI |
| Zephyr-7B-beta (GGUF) | ~7,24 B | 32k | MIT | GGUF | Ajuste DPO sobre Mistral, orientado a chat |
| OpenChat-3.5 (GGUF) | ~7 B | 8k | Apache 2.0 | GGUF | Ajuste conversacional sobre Mistral |

Los datos de contexto y licencia de los modelos comparables provienen de conocimiento general de la familia Mistral; no se dispone de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para producción en castellano u otros idiomas.
- No se documentan datos de entrenamiento, por lo que no se puede evaluar la composición del dataset ni posibles sesgos.
- Riesgo de alucinación inherente a modelos de 7B ajustados conversacionalmente; no hay evaluaciones publicadas que lo cuantifiquen.
- Longitud de contexto no documentada; asumir valores conservadores hasta verificarlo empíricamente.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio velocidad/calidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento no están documentados, lo que puede implicar riesgos legales no verificables.
- El modelo base es un ajuste fino de terceros (Akshaykumarbm) sin evaluación publicada; la fiabilidad en producción no está contrastada.
- Repositorio de 63,9 GB: descargar solo el quant necesario, no el repo completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OpenAssisted-English-Mistral-7b-GGUF
- Modelo base: https://huggingface.co/Akshaykumarbm/OpenAssisted-English-Mistral-7b
- Quants imatrix: https://huggingface.co/mradermacher/OpenAssisted-English-Mistral-7b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#OpenAssisted-English-Mistral-7b-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
