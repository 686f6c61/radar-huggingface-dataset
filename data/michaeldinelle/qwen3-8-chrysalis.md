# michaelDinelle/Qwen3.8-Chrysalis

## Resumen

Chrysalis es una colección de cuantizaciones GGUF publicada por el usuario michaelDinelle a partir de dos modelos de la familia Qwen 3.8: Qwen3.8-27B y Qwen3.8-Flash-Next. No se trata de un modelo entrenado desde cero, sino de un trabajo de compresión y empaquetado orientado a inferencia local eficiente, con mezclas de cuantización por capas (IQ4_XS, Q6_K, Q8_0, IQ4_NL, Q3_K, Q2_K) y una torre de visión separada en formato mmproj.gguf. El repositorio ocupa 81,2 GB e incluye pesos, tokenizador y plantilla de chat compartidos entre ambos modelos.

El modelo principal documentado en la información disponible es Qwen3.8-27B, con 27.320.697.856 parámetros reales según los safetensors del modelo base. Chrysalis ofrece una alternativa a llama.cpp y MLX para ejecutar estos modelos en hardware de consumo (RX 7900 XTX, RTX 3090, M4 Max), con métricas comparativas de tiempo hasta el primer token, velocidad de escritura, error frente a Q8_0, tiempo de carga y memoria. La relevancia actual reside en la posibilidad de desplegar un modelo de 27B con capacidades multimodales y ventana de contexto amplia en GPUs de gama alta para consumidor, con licencia Apache-2.0 en el caso del 27B.

La ficha se centra en Qwen3.8-27B por ser el modelo con parámetros verificados y licencia permisiva; Qwen3.8-Flash-Next se menciona cuando la información lo permite, pero su licencia Qwen Community License 1.0 y la falta de datos de arquitectura en la documentación disponible limitan el detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; se infiere transformer, sin confirmar en la informacion) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, Q6_K, Q8_0, IQ4_NL, Q3_K, Q2_K (mezcla por capas); Q8_0 para K/V y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para Qwen3.8-27B; Qwen Community License 1.0 para Qwen3.8-Flash-Next |
| Formato de pesos | GGUF (con mmproj.gguf para la torre de vision) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-27B ni de Qwen3.8-Flash-Next. El repositorio Chrysalis es un trabajo de cuantización, no de entrenamiento: no se aportan datos sobre número de tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO. Lo que sí se documenta es la estrategia de cuantización por capas: IQ4_XS como base, Q6_K para capas sensibles, Q8_0 para las cachés K/V y la cabeza MTP (multi-token prediction), lo que sugiere que el modelo base incorpora decodificación especulativa mediante una cabeza MTP. Para Qwen3.8-Flash-Next se emplea una mezcla más agresiva: Q6_K y Q8_0 en capas densas, IQ4_XS e IQ4_NL en expertos (los más usados) y Q3_K/Q2_K en el bloque MTP, lo que apunta a una arquitectura MoE en ese modelo, aunque no se confirma en la documentación.

El paquete incluye una torre de visión separada (mmproj.gguf, 0,9 GB por modelo), lo que confirma capacidades multimodales de entrada de imagen. No se especifican innovaciones adicionales como atención lineal o decodificación especulativa más allá de la cabeza MTP mencionada.

## Capacidades

- Generación de texto conversacional: el tag "conversational" y la plantilla de chat incluida indican uso orientado a diálogo multi-turno.
- Entrada multimodal de imagen: la presencia de mmproj.gguf para cada modelo confirma soporte de visión (comprensión de imágenes).
- Generación de código: la model card muestra un ejemplo de "voxel pagoda garden" escrito por Qwen3.8-Flash-Next en Chrysalis, lo que evidencia capacidad de generación de código ejecutable en navegador.
- Decodificación multi-token (MTP): la cuantización específica de la cabeza MTP sugiere soporte de predicción especulativa para acelerar la generación.
- Compatibilidad con endpoints: el tag "endpoints_compatible" indica que el GGUF puede servirse a través de endpoints compatibles con la API de inferencia estándar.
- Capacidades de tool calling, agentes, matemáticas o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de consumo: el GGUF de 15,9 GB para el 27B permite ejecutarlo en una RTX 3090 (24 GB) o RX 7900 XTX (24 GB) con margen para contexto, según las métricas comparativas incluidas en la model card frente a llama.cpp y MLX.
- Asistente conversacional con imágenes: la torre de visión separada permite construir un chatbot que reciba capturas o fotos y responda en texto, desplegado con llama.cpp u otro runtime compatible con mmproj.
- Generación de código en local: el ejemplo de la pagoda voxel demuestra que el modelo puede producir código de front-end (JavaScript/WebGL) a partir de una descripción; útil para prototipado offline sin enviar código a la nube.
- Despliegue en estaciones de trabajo Apple Silicon: las métricas incluyen M4 Max, por lo que el GGUF es adecuado para desarrolladores que trabajan en macOS con memoria unificada y quieren un 27B multimodal sin GPU dedicada.
- Evaluación comparativa de runtimes: el repositorio publica gráficas de Chrysalis frente a llama.cpp y MLX (TTFT, velocidad, error frente a Q8_0, carga y memoria), lo que lo convierte en un artefacto útil para benchmarks de inferencia local.
- Servicio de endpoints compatibles: gracias al tag "endpoints_compatible", puede integrarse en un servidor de inferencia que exponga una API compatible con OpenAI para aplicaciones internas.
- Experimentación con Qwen3.8-Flash-Next en equipos de 64 GB o más: el GGUF de 63,4 GB requiere memoria abundante (M4 Max de gama alta o varias GPUs), pero permite probar un modelo presumiblemente MoE con cuantización mixta por expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente gráficas comparativas de rendimiento de inferencia (tiempo hasta el primer token, velocidad de escritura, error frente a Q8_0, tiempo de carga y memoria) entre Chrysalis, llama.cpp y MLX sobre RX 7900 XTX, RTX 3090 y M4 Max, sin cifras textuales en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para Qwen3.8-27B en Chrysalis: aproximadamente 15,9 GB de pesos GGUF, más overhead de contexto y caché K/V en Q8_0; con contexto largo se recomienda al menos 20-24 GB de VRAM.
- VRAM estimada para Qwen3.8-Flash-Next en Chrysalis: aproximadamente 63,4 GB de pesos, más 0,9 GB de torre de visión; requiere 64 GB o más de memoria (unificada o agregada entre GPUs).
- GPUs validadas en la model card: RX 7900 XTX (24 GB), RTX 3090 (24 GB) y Apple M4 Max (memoria unificada).
- Cabe en GPU de consumo: sí para el 27B en RTX 3090, RTX 4090 (24 GB) y RX 7900 XTX; el Flash-Next no cabe en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp y MLX son los runtimes de referencia comparados; el repositorio Chrysalis dispone de un proyecto propio de inferencia en GitHub (chrysalis-inference) marcado como "coming soon". No se confirma soporte de vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no se proporcionan cifras numéricas en la información; solo gráficas comparativas sin valores textuales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (Chrysalis, este repo) | 27,3 B | no disponible | GGUF + mmproj | Apache-2.0 | Hugging Face, 99 descargas |
| Qwen3.8-Flash-Next (Chrysalis, este repo) | no disponible | no disponible | GGUF + mmproj | Qwen Community License 1.0 | Hugging Face |
| Qwen3.8-27B en llama.cpp / MLX | 27,3 B | no disponible | GGUF / MLX | Apache-2.0 | Runtimes de referencia comparados en la model card |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento frente a alternativas de la misma categoría. La comparación incluida en la model card se limita a métricas de inferencia (TTFT, velocidad, error frente a Q8_0) entre Chrysalis, llama.cpp y MLX sobre el mismo hardware.

## Limitaciones y advertencias

- Es una cuantización, no un modelo original: los errores frente a Q8_0 se documentan en las gráficas de la model card, pero no se traducen en cifras de degradación de calidad (perplejidad, benchmarks) en la información disponible.
- La licencia del repositorio figura como "other" con nombre qwen-community-1.0, aunque la model card aclara que Qwen3.8-27B es Apache-2.0 y solo Flash-Next usa Qwen Community License 1.0; conviene verificar qué licencia aplica a cada subcarpeta antes de uso comercial.
- Qwen3.8-Flash-Next está sujeto a la Qwen Community License 1.0, con posibles restricciones de uso comercial que no se detallan en la información.
- No se especifican idiomas soportados ni sesgos conocidos; el tag "conversational" no garantiza calidad multilingüe.
- Riesgo de alucinación inherente a los modelos generativos; no se aportan evaluaciones de fidelidad.
- El proyecto de inferencia propio (chrysalis-inference) está marcado como "coming soon", por lo que el uso en producción depende de runtimes de terceros (llama.cpp, MLX) cuya compatibilidad exacta con la cabeza MTP y la torre de visión no se detalla.
- El repositorio tiene 99 descargas y 1 like, lo que indica validación comunitaria muy limitada; no hay evidencia de pruebas extensas por terceros.
- No se dispone de información sobre longitud de contexto efectiva, lo que impide garantizar casos de uso con documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/michaelDinelle/Qwen3.8-Chrysalis
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Proyecto de inferencia Chrysalis: https://github.com/michaelDinelle/chrysalis-inference
- Perfil del autor en X: https://x.com/michaeldinelle
- Apoyo al autor (Ko-fi): https://ko-fi.com/michaeldinelle
