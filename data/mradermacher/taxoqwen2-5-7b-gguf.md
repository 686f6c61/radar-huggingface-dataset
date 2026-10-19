# mradermacher/TaxoQwen2.5-7B-GGUF

## Resumen
TaxoQwen2.5-7B-GGUF es una distribución de cuantizaciones GGUF del fine-tune Kate-03/TaxoQwen2.5-7B, publicada por mradermacher. El modelo subyacente es un transformer decoder-only de 7.615.616.512 parámetros, derivado de la familia Qwen2.5-7B, y la model card lo etiqueta como conversacional y en inglés. mradermacher no entrena el modelo: genera archivos GGUF estáticos para inferencia local con llama.cpp y herramientas compatibles.

La relevancia práctica está en que permite ejecutar un derivado de Qwen2.5-7B en hardware de consumo, con cuantizaciones desde 3,1 GB (Q2_K) hasta 15,3 GB (f16). No se documentan la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks, por lo que debe evaluarse antes de usarlo en producción. El nombre “Taxo” sugiere una posible especialización taxonómica, pero la información disponible no lo confirma.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-7B; no detallada en la model card) |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | No aplica (modelo denso; no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; safetensors en el modelo base |
| Modelo base | Kate-03/TaxoQwen2.5-7B |
| Cuantizado por | mradermacher |
| Biblioteca | transformers |
| Pipeline de HuggingFace | No disponible |
| Tamaño del repositorio | 68,1 GB |
| Descargas | 28 |
| Likes | 1 |
| Creado | 2025-04-23 |
| Última actualización registrada | 2026-10-18 |

## Arquitectura y entrenamiento
La model card no describe la arquitectura del fine-tune. Por el recuento de parámetros y el nombre, se corresponde con un transformer decoder-only de la familia Qwen2.5-7B, pero no se confirma en la información proporcionada. No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de SFT, RLHF o DPO, ni sobre innovaciones técnicas del fine-tune.

El trabajo de mradermacher consiste en cuantización estática a GGUF: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. Se ofrecen 12 variantes, desde Q2_K hasta f16, sin cuantizaciones imatrix o weighted. La calidad relativa de cada quant no se ha medido en la model card; las notas del autor solo indican que Q4_K_S y Q4_K_M son “fast, recommended” y que Q8_0 es “fast, best quality”.

## Capacidades
- Generación de texto conversacional en inglés, con formato de chat si se conserva la plantilla del fine-tune.
- Razonamiento, matemáticas y código: no hay benchmarks publicados; se desconoce si el fine-tune mantiene las capacidades de Qwen2.5-7B.
- Tool calling y function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: solo inglés declarado; no se garantizan otros idiomas.
- Capacidades especiales: no se documentan visión, audio, thinking mode ni decodificación especulativa.
- Inferencia local: compatible con llama.cpp y derivados gracias al formato GGUF.

## Casos de uso
- Asistente conversacional local en inglés: desplegar Q4_K_M (4,8 GB) con llama.cpp u Ollama en una estación de trabajo con GPU de 8-12 GB o en CPU. Adecuado para equipos que necesitan un chat interno sin enviar datos a la nube, siempre que se acepte la falta de benchmarks.
- Clasificación y etiquetado taxonómico: si el fine-tune conserva la especialización sugerida por el nombre, puede usarse para asignar categorías jerárquicas a documentos en inglés mediante prompts de clasificación. Requiere validación con un conjunto etiquetado y control de alucinaciones.
- Prototipado rápido de chatbots: Ollama o LM Studio permiten cargar el GGUF en minutos; el tamaño de 4,8 GB de Q4_K_M facilita iterar en portátiles con GPU consumer.
- Generación y explicación de código en local: con Q4_K_M o Q5_K_M, el modelo puede autocompletar funciones y explicar fragmentos en inglés; no sustituye a modelos de código más grandes y necesita revisión humana.
- Procesamiento de documentación técnica: resúmenes y extracción de entidades en inglés sobre fragmentos cortos, dado que no se documenta la ventana de contexto. Para documentos largos, dividir en chunks y encadenar.
- Evaluación de cuantizaciones: comparar Q4_K_M, Q5_K_M y Q8_0 sobre el mismo conjunto de prompts para medir la degradación introducida por la cuantización en este fine-tune.
- Tutoría o formación en inglés: conversaciones multi-turno con explicaciones; revisar respuestas factuales por riesgo de alucinación.
- Generación de borradores y reescritura: tareas de redacción en inglés con bajo coste de inferencia; útil para prototipos, no para contenido crítico sin revisión.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Evaluaciones del fine-tune | No disponible |

## Requisitos de hardware
| Cuantización | Tamaño | VRAM estimada | Notas |
|---|---:|---:|---|
| Q2_K | 3,1 GB | ~4 GB | Calidad reducida; solo para entornos muy limitados |
| Q4_K_M | 4,8 GB | ~6-7 GB | Recomendada por el autor; equilibrio tamaño/calidad |
| Q8_0 | 8,2 GB | ~10-11 GB | Buena calidad; requiere GPU de 12 GB o más |
| f16 | 15,3 GB | ~17-18 GB | 16 bits por peso; solo para GPU de 24 GB o A100/H100 |

- VRAM estimada para contexto corto; añadir KV cache para contextos mayores. La longitud máxima de contexto no está documentada.
- GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 4090 24 GB. Q4_K_M cabe en 8 GB con contexto corto; 12 GB recomendado.
- f16 requiere 24 GB de VRAM o aceleradores A100/H100.
- CPU: llama.cpp con 8 GB de RAM para Q4_K_M (16 GB recomendado); velocidad dependiente de CPU.
- Despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; vLLM con soporte GGUF experimental; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| TaxoQwen2.5-7B-GGUF | 7,6 B | No disponible | Apache 2.0 | GGUF | Fine-tune de Kate-03; sin benchmarks publicados |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF | Instruct con tool calling; alternativa directa |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa europea de tamaño similar |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Contexto mayor y licencia más restrictiva |

Las especificaciones de los modelos comparables son públicas; no se dispone de evaluaciones del fine-tune TaxoQwen2.5-7B que permitan comparar calidad.

## Limitaciones y advertencias
- Solo inglés declarado; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Sin benchmarks publicados; la calidad del fine-tune no está verificada.
- Longitud de contexto no documentada; riesgo en conversaciones largas o documentos extensos.
- Datos de entrenamiento del fine-tune no disponibles; posible sesgo, sobreajuste o comportamiento impredecible en dominios no vistos.
- Riesgo de alucinación, especialmente en tareas factuales o especializadas.
- Cuantizaciones bajas como Q2_K y Q3_K_S degradan la calidad; se recomienda Q4_K_M o superior para uso serio.
- No hay cuantizaciones imatrix o weighted; solo static quants.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los términos de Qwen2.5 y las condiciones de los datos del fine-tune.
- Tool calling, agentes, visión y audio no están documentados.
- El repositorio ocupa 68,1 GB; descargar solo el archivo GGUF necesario.
- Baja adopción comunitaria (28 descargas, 1 like); no implica mala calidad, pero hay poca validación externa.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/mradermacher/TaxoQwen2.5-7B-GGUF)
- [Modelo base Kate-03/TaxoQwen2.5-7B](https://huggingface.co/Kate-03/TaxoQwen2.5-7B)
- [Página de descargas de mradermacher](https://hf.tst.eu/model#TaxoQwen2.5-7B-GGUF)
- [README de TheBloke sobre uso de GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico de perplejidad de cuantizaciones](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [Solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [nethype GmbH](https://www.nethype.de/)

No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados disponibles corresponden a otros modelos de mradermacher.
