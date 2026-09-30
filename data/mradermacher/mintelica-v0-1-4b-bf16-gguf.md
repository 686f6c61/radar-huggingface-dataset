# mradermacher/Mintelica-v0.1-4B-BF16-GGUF

## Resumen

Mintelica-v0.1-4B-BF16-GGUF es la versión cuantizada en formato GGUF del modelo arcitech-psp/Mintelica-v0.1-4B-BF16, publicada por el usuario mradermacher, especializado en generar cuantizaciones GGUF de modelos abiertos. El modelo base, denominado "Mica" en su model card original, se presenta como un modelo pensado para ejecutarse sobre GPUs Intel Arc mediante vLLM con backend XPU, y aparece etiquetado como "decision-model" y "typesafe", además de estar asociado al benchmark JevBench.

Se trata de un modelo de aproximadamente 4.841 millones de parámetros (4,84B) distribuido originalmente en BF16 (safetensors) y reproducido aquí en múltiples niveles de cuantización GGUF, desde Q2_K (2,2 GB) hasta f16 (9,8 GB). Los idiomas declarados son inglés (en) y coreano (ko), y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las de dicha licencia.

Su relevancia actual radica en que combina un tamaño contenido (rango 4B) con un enfoque de despliegue orientado a hardware Intel Arc, un segmento donde la oferta de modelos optimizados para XPU es todavía limitada. No obstante, la información pública disponible sobre el modelo base es escasa: no se detallan arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones figuran como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 4.841.450.496 (≈4,84B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors/BF16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El repositorio base (arcitech-psp/Mintelica-v0.1-4B-BF16) se presenta como "Mica for Intel Arc (vLLM XPU)", lo que indica que está optimizado para inferencia sobre GPUs Intel Arc mediante vLLM con el backend XPU. Las etiquetas del modelo incluyen "decision-model" y "typesafe", lo que sugiere un enfoque orientado a la toma de decisiones estructuradas o a la salida con tipado validado, aunque no se detalla el mecanismo concreto.

Tampoco se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares. La model card del repositorio cuantizado únicamente documenta el proceso de cuantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y lista los ficheros generados. El modelo base menciona "JevBench" y pruebas sobre tarjetas Intel Arc B580 (12 GB) e Intel Arc Pro B70 (32 GB), además de una referencia CUDA para reproducir el modelo original, pero sin aportar métricas ni resultados concretos.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y "endpoints_compatible", lo que indica soporte para interacción multi-turno.
- Modelo orientado a decisiones ("decision-model") y salidas de tipo seguro ("typesafe"), según las etiquetas del autor.
- Soporte multilingüe limitado a inglés y coreano.
- Compatibilidad con Hugging Face Endpoints, según la etiqueta "endpoints_compatible".
- Optimización para despliegue en GPUs Intel Arc mediante vLLM XPU.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistentes conversacionales ligeros en inglés o coreano: el modelo, con ~4,84B de parámetros, puede gestionar diálogos multi-turno en entornos con recursos limitados, ejecutándose en GPUs de gama media o incluso en tarjetas integradas de Intel Arc.
- Despliegue en hardware Intel Arc para inferencia en el borde: gracias a su optimización para vLLM XPU y su tamaño reducido, es adecuado para servir respuestas en estaciones de trabajo con Arc B580 (12 GB) o Arc Pro B70 (32 GB) sin necesidad de GPUs NVIDIA.
- Prototipado de sistemas con salidas tipadas: la etiqueta "typesafe" y su carácter de "decision-model" apuntan a usos donde se requieren respuestas estructuradas y validadas, por ejemplo clasificación de intenciones o extracción de campos.
- Evaluación comparativa en JevBench: el modelo está asociado a este benchmark, por lo que puede emplearse como referencia para medir el rendimiento de despliegues XPU frente a CUDA en tareas de decisión.
- Aplicaciones de bajo consumo en local: con cuantizaciones Q4_K_S o Q4_K_M (~3 GB), puede ejecutarse en GPUs con 6-8 GB de VRAM para tareas de generación de texto y asistentes personales.
- Investigación sobre cuantización GGUF: el repositorio ofrece doce niveles de cuantización distintos, útil para estudiar el impacto de la precisión en la calidad de salida de un modelo 4B.
- Servicio de API compatible con Endpoints: al estar etiquetado como compatible, puede integrarse en plataformas que consumen el endpoint estándar de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona el benchmark JevBench y pruebas sobre tarjetas Intel Arc B580 y Arc Pro B70, pero no incluye cifras de rendimiento, latencia ni calidad.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ≈2,2 GB; Q3_K_S ≈2,4 GB; Q3_K_M ≈2,6 GB; Q3_K_L ≈2,8 GB; IQ4_XS ≈3,0 GB; Q4_K_S ≈3,0 GB; Q4_K_M ≈3,2 GB; Q5_K_S ≈3,5 GB; Q5_K_M ≈3,6 GB; Q6_K ≈4,1 GB; Q8_0 ≈5,3 GB; f16 ≈9,8 GB. Hay que sumar la memoria correspondiente al contexto (KV cache).
- GPU recomendadas: Intel Arc B580 (12 GB) e Intel Arc Pro B70 (32 GB) según la model card del modelo base; también es compatible con GPUs NVIDIA e inferencia en CPU mediante llama.cpp.
- Compatibilidad con GPU de consumo: sí. Prácticamente cualquier GPU con 6 GB o más de VRAM puede ejecutar las cuantizaciones Q4 y Q5; las versiones Q8_0 y f16 requieren 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otras herramientas compatibles con GGUF; el modelo base está preparado para vLLM con backend XPU (Intel Arc).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La información disponible no incluye datos de benchmarks ni especificaciones completas del modelo, por lo que la comparación es parcial. Se ofrecen alternativas de rango 3-4B ampliamente conocidas; los datos de estas alternativas provienen de fuentes públicas generales y deberían verificarse.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Mintelica-v0.1-4B (este modelo) | ≈4,84B | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen3-4B | ≈4B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B | ≈3,2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-3-4B | ≈4B | 128.000 tokens | Gemma Terms of Use | safetensors, GGUF |

Nota: los valores de contexto y licencia de los modelos comparados corresponden a información pública general; el rendimiento relativo de Mintelica frente a ellos no puede evaluarse sin benchmarks publicados.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no es posible verificar la calidad del modelo en tareas estándar (MMLU, HumanEval, GSM8K, etc.), lo que dificulta su adopción en producción sin evaluación previa.
- Idiomas limitados: solo se declaran inglés y coreano; no hay soporte documentado para español ni otros idiomas.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide garantizar el manejo de conversaciones largas o documentos extensos.
- Riesgo de alucinación: no se documentan procesos de alineación (RLHF/DPO) ni evaluación de veracidad, por lo que el riesgo de generar información incorrecta es indeterminado.
- Cuantizaciones agresivas: las versiones Q2_K y Q3 presentan degradación de calidad esperable; la propia model card advierte que Q3_K_M es de "menor calidad". Para producción se recomienda Q4_K_M o superior.
- Información incompleta del modelo base: la model card de origen no detalla arquitectura, dataset ni metodología de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base (arcitech-psp/Mintelica-v0.1-4B-BF16) y de cualquier dependencia asociada antes de desplegarlo.
- Optimización específica para Intel Arc: el modelo base está orientado a vLLM XPU; el rendimiento en otros backends puede diferir del esperado.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Mintelica-v0.1-4B-BF16-GGUF
- Modelo base: https://huggingface.co/arcitech-psp/Mintelica-v0.1-4B-BF16
- Página de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#Mintelica-v0.1-4B-BF16-GGUF
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke, referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
