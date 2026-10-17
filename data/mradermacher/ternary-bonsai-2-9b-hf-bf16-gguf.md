# mradermacher/Ternary-Bonsai-2-9B-hf-bf16-GGUF

## Resumen

Ternary-Bonsai-2-9B-hf-bf16-GGUF es una conversión a GGUF, publicada por mradermacher, del modelo jonathan-kellerai/Ternary-Bonsai-2-9B-hf-bf16. Se trata de un modelo de 8.953.803.264 parámetros (≈8,95 B) con pesos ternarios y licencia Apache-2.0 según los metadatos del repositorio. El repo ofrece quants TQ1_0 (3,0 GB) y TQ2_0 (3,3 GB), además de proyectores multimodales mmproj en Q8_0 y f16.

Su relevancia está en el despliegue local: un modelo de casi 9B comprimido en torno a 3 GB puede ejecutarse en GPU de consumo y en CPU con un backend compatible, lo que facilita prototipos y pruebas de cuantización ternaria. Ahora bien, la información publicada es muy escasa: no se documentan arquitectura, contexto, datos de entrenamiento ni benchmarks, y el idioma declarado es únicamente inglés. La licencia enlaza a Qwen3.5-9B, por lo que conviene verificar los términos aplicables antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 8.953.803.264 (≈8,95 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | TQ1_0 (3,0 GB), TQ2_0 (3,3 GB); mmproj Q8_0 (0,7 GB) y f16 (1,0 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 según metadatos; license_link apunta a Qwen/Qwen3.5-9B, verificar |
| Formato de pesos | GGUF; el modelo base se distribuye como hf-bf16 |
| Modelo base | jonathan-kellerai/Ternary-Bonsai-2-9B-hf-bf16 |
| Tamaño del repositorio | 7,6 GB |
| Pipeline | no disponible |
| Descargas / likes | 399 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna. El identificador y los tags (`bonsai`, `ternary`, `prismml`) sitúan el modelo en el ecosistema de cuantización ternaria de PrismML y en la familia Bonsai 2, pero no se especifica si es un transformer denso, un MoE o una arquitectura híbrida. El repo base se distribuye como `hf-bf16`; esta ficha corresponde a la conversión GGUF del mismo.

Tampoco se publican tokens de entrenamiento, composición del dataset, fases de RLHF/DPO ni innovaciones de atención. Los únicos datos técnicos verificables son el número de parámetros (8.953.803.264), el tamaño de los quants (3,0 GB para TQ1_0; 3,3 GB para TQ2_0) y la presencia de ficheros mmproj Q8_0 y f16, que sugieren un componente multimodal, aunque la model card no lo describe. No se debe asumir soporte de tool calling, agentes o visión solo por esos ficheros.

## Capacidades

- Generación de texto conversacional en inglés: los tags `conversational` y `en` son los únicos documentados.
- Despliegue local con cuantización ternaria: TQ1_0 (3,0 GB) y TQ2_0 (3,3 GB), orientados a reducir la huella de memoria.
- Posible multimodalidad: el repo incluye mmproj Q8_0 y f16, pero no hay documentación de entrada de imagen, resolución o calidad.
- El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla el formato.
- No hay evidencia publicada de tool calling, function calling, agentes, multi-step reasoning, modo thinking, código, matemáticas o audio.
- Soporte multilingüe: solo inglés declarado; no se garantizan otros idiomas.

## Casos de uso

- Asistente conversacional local en inglés: con TQ2_0 (3,3 GB) puede cargarse en un portátil con GPU de 6-8 GB o en CPU con 8-16 GB de RAM, usando llama.cpp con backend compatible. Adecuado para prototipos offline y pruebas de latencia.
- Chatbot de soporte interno para pymes: al no requerir API externa, permite procesar conversaciones internas en inglés; hay que limitar la longitud de sesión porque el contexto no está documentado.
- Evaluación de cuantización ternaria: comparar TQ1_0 y TQ2_0 con el mismo conjunto de prompts en inglés para medir perplejidad, latencia y degradación; es un caso de investigación reproducible con 3,0 y 3,3 GB.
- Aplicación de escritorio offline: distribuir el GGUF TQ1_0 (3,0 GB) con LocalAI o un binario de llama.cpp; útil para herramientas de redacción en inglés sin conexión.
- Generación de borradores y resúmenes cortos en inglés: para textos que quepan en el contexto no documentado; no recomendable para documentos largos sin validar.
- Práctica de conversación en inglés: un asistente local para estudiantes, con la ventaja de que los datos no salen del ordenador; requiere revisar sesgos y alucinaciones.
- Prueba experimental de multimodalidad: si el mmproj funciona con el backend, se pueden hacer prototipos de descripción de imágenes en inglés; no hay documentación de calidad ni de resolución.
- Investigación de eficiencia en hardware de consumo: medir throughput y consumo con TQ1_0/TQ2_0 en RTX 3060, RTX 4060 Ti o Apple Silicon; no hay cifras del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K, MT-Bench u otros | no disponible |
| Comparación TQ1_0 frente a TQ2_0 frente a BF16 | no disponible |

No hay datos para comparar la calidad de los quants ternarios con el modelo base BF16 ni con otros modelos de tamaño similar.

## Requisitos de hardware

- Pesos: 3,0 GB (TQ1_0) y 3,3 GB (TQ2_0). La VRAM total debe sumar KV cache y overhead del backend; al no publicarse la longitud de contexto, no se puede dar una cifra cerrada.
- Estimación para contexto corto: 4-6 GB de VRAM con TQ1_0/TQ2_0; 8 GB o más si se amplía contexto o se usa el mmproj. Es una estimación de ingeniería, no un dato del autor.
- GPU de consumo: GTX 1660 6 GB, RTX 3060 12 GB, RTX 4060 8 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB. En 6 GB puede funcionar con TQ1_0 y contexto muy corto; 8-12 GB es más seguro.
- CPU: 8-16 GB de RAM para el GGUF y el contexto; el rendimiento depende del backend y de los núcleos disponibles.
- Datacenter: no requiere A100/H100; para multiusuario se puede usar L4/A10 con backend compatible, pero no hay datos de throughput.
- Despliegue: llama.cpp con soporte de quants ternarios (backend Bonsai de PrismML, según la documentación de LocalAI) y LocalAI. vLLM, TGI y Ollama no están confirmados para este repo. El modelo base BF16 puede usarse con transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Ternary-Bonsai-2-9B-hf-bf16-GGUF (este) | 8,95 B | no disponible | Apache-2.0 (verificar) | GGUF TQ1_0/TQ2_0 | 3,0-3,3 GB; inglés |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27 B | no disponible | no disponible | GGUF | Misma familia ternaria, 3 veces más parámetros; requiere más VRAM |
| dealignai/Bonsai-27b-Ternary-CRACK-GGUF | 27 B | no disponible | no disponible | GGUF | Image-text-to-text; no comparable en huella |
| Ornith-1.5-9B-GGUF | 9 B | no disponible | no disponible | GGUF | Text-generation de tamaño similar; sin benchmarks comparables |

No hay datos públicos de rendimiento para comparar estos modelos. La comparación disponible es solo de tamaño, formato y familia.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; no hay evaluación en castellano ni en otros idiomas.
- Contexto desconocido: no se puede garantizar conversaciones largas, RAG o documentos extensos.
- Calidad ternaria no cuantificada: no hay perplejidad ni benchmarks; TQ1_0 prioriza compacidad y TQ2_0 velocidad, pero se desconoce la degradación frente a BF16.
- Soporte de backend: los quants TQ pueden requerir el fork Bonsai de llama.cpp/PrismML o LocalAI; el soporte en llama.cpp estándar, Ollama, vLLM o TGI no está confirmado.
- Multimodalidad no documentada: los mmproj son solo ficheros; no hay instrucciones de uso ni evaluación.
- Licencia: Apache-2.0 en metadatos, pero el license_link apunta a Qwen/Qwen3.5-9B; revisar atribución y términos del modelo base antes de uso comercial.
- Sesgos y alucinaciones: no hay model card, evaluación ni mitigaciones documentadas; asumir el riesgo habitual de un LLM de 9B.
- Poca validación comunitaria: 399 descargas y 0 likes en el momento de la consulta; no hay pipeline ni benchmarks publicados.
- No hay evidencia de tool calling, agentes, modo thinking, código o matemáticas; no usarlo en producción para esas tareas sin evaluar.

## Enlaces

- [HuggingFace: mradermacher/Ternary-Bonsai-2-9B-hf-bf16-GGUF](https://huggingface.co/mradermacher/Ternary-Bonsai-2-9B-hf-bf16-GGUF)
- [Modelo base: jonathan-kellerai/Ternary-Bonsai-2-9B-hf-bf16](https://huggingface.co/jonathan-kellerai/Ternary-Bonsai-2-9B-hf-bf16)
- [Página de descargas de quants](https://hf.tst.eu/model#Ternary-Bonsai-2-9B-hf-bf16-GGUF)
- [Licencia referenciada: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE)
- [Modelo relacionado: prism-ml/Ternary-Bonsai-2-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)
- [Modelo relacionado: fraserprice/Ternary-Bonsai-2-27B-DFlash2-vllm](https://huggingface.co/fraserprice/Ternary-Bonsai-2-27B-DFlash2-vllm)
- [Modelo relacionado: dealignai/Bonsai-27b-Ternary-CRACK-GGUF](https://huggingface.co/dealignai/Bonsai-27b-Ternary-CRACK-GGUF)
- [LocalAI gallery](https://localai.io/docs/gallery.html)
- [LocalMaxxing models](https://www.localmaxxing.com/en/models)
- [Toolify AI models](https://www.toolify.ai/ai-model)
- [Referencia genérica de uso de GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Notas de Artefact2 sobre cuantización](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [Solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)

No se han encontrado paper, blog técnico ni demo oficiales en la información disponible.
