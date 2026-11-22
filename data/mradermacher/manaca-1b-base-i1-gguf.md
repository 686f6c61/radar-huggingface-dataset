# mradermacher/manaca-1b-base-i1-GGUF

## Resumen

Manaca-1b-base-i1-GGUF es la versión cuantizada en formato GGUF del modelo base AIInstituteLNCC/manaca-1b-base, un modelo de lenguaje causal de tipo transformer con 1.722.951.680 parámetros (aproximadamente 1,7 mil millones), desarrollado por el AI Institute del LNCC (Laboratorio Nacional de Computación Científica de Brasil). Está especializado en portugués, con especial énfasis en portugués brasileño (pt-br), y se distribuye bajo licencia CC-BY-4.0. La cuantización la firma mradermacher, un conocido generador de cuantizaciones GGUF de la comunidad, que ofrece tanto cuantizaciones estáticas como cuantizaciones con imatrix (etiquetadas i1).

El modelo resuelve el problema de disponer de un modelo base ligero y abierto para portugués que pueda ejecutarse en hardware de consumo. Al ser un modelo base, no está ajustado con instrucciones ni con RLHF, por lo que su función principal es la continuación de texto y la generación de texto en crudo, no el diálogo conversacional. Es relevante ahora porque el ecosistema de modelos abiertos en portugués sigue siendo reducido en comparación con el inglés, y esta familia (Manaca) aporta una alternativa entrenada específicamente con corpus brasileños como GigaVerbo y Wikipedia en portugués.

La cuantización permite desplegar el modelo en CPU y GPU modestas: los ficheros van desde 0,5 GB (IQ1_S) hasta 1,5 GB (Q6_K), lo que lo hace viable en portátiles, Raspberry Pi de gama alta o GPUs con poca VRAM. El repositorio completo ocupa 20,3 GB e incluye todas las variantes de cuantización, además del fichero imatrix para generar cuantizaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), basado en la familia Llama / entrenado con Megatron-LM |
| Parametros totales | 1.722.951.680 (aproximadamente 1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; también existe una versión estática en mradermacher/manaca-1b-base-GGUF |
| Idiomas soportados | Portugués (pt), con especialización en portugués brasileño (pt-br) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de tipo Llama, entrenado con Megatron-LM según las etiquetas del repositorio. Cuenta con 1.722.951.680 parámetros, lo que lo sitúa en la gama de los modelos de 1-2 mil millones de parámetros. Al tratarse de un modelo base (no instruct), no se ha sometido a ajuste fino supervisado ni a RLHF/DPO: su objetivo es la modelización del lenguaje y la continuación de texto.

Los datos de entrenamiento declarados son TucanoBR/GigaVerbo y wikimedia/wikipedia. GigaVerbo es un corpus brasileño a gran escala, y Wikipedia aporta texto enciclopédico en portugués. No se especifica en la información disponible el número exacto de tokens, la composición detallada del dataset ni si hubo fases de entrenamiento adicionales. La cuantización i1 de mradermacher aplica un fichero imatrix (importance matrix) generado a partir de datos de calibración, lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas.

## Capacidades

- Generación de texto y continuación de texto en portugués, especialmente portugués brasileño.
- Modelización del lenguaje: útil como base para fine-tuning en tareas posteriores (clasificación, extracción, resumen, etc.).
- Capacidad multilingüe limitada: el modelo está entrenado principalmente en portugués; no se declaran capacidades en otros idiomas.
- No soporta tool calling ni function calling de forma nativa (es un modelo base, sin ajuste instructivo).
- No soporta agentes ni razonamiento multi-paso de forma fiable sin ajuste adicional.
- No dispone de modo thinking, visión ni audio.
- Compatible con endpoints (etiqueta endpoints_compatible) para despliegue en infraestructuras tipo Hugging Face.

## Casos de uso

- Fine-tuning para clasificación de texto en portugués: al ser un modelo base de 1,7 B, se puede ajustar con LoRA en una sola GPU para tareas como análisis de sentimiento o detección de temas en corpus brasileños, aprovechando su conocimiento del idioma.
- Generación de texto en portugués en entornos con recursos limitados: la cuantización Q4_K_M (1,2 GB) permite ejecutar el modelo en CPU o en GPUs de 4-8 GB de VRAM, adecuado para prototipos y demos.
- Completado de texto y autocompletado en aplicaciones de escritura en portugués: el modelo puede continuar frases y párrafos, útil en editores o herramientas de redacción.
- Investigación en modelización del lenguaje en portugués: sirve como referencia base para comparar técnicas de entrenamiento o cuantización en un idioma con menos recursos.
- Generación de datos sintéticos en portugués: el modelo puede producir texto de dominio general para aumentar datasets de entrenamiento de otros modelos, con revisión posterior.
- Despliegue en dispositivos edge: las cuantizaciones IQ2/IQ3 (0,6-0,9 GB) permiten ejecutar el modelo en dispositivos con poca memoria, como Raspberry Pi o mini-PC, para tareas de generación de texto no crítica.
- Base para experimentos de decodificación y evaluación: al ser un modelo pequeño y abierto, es adecuado para probar técnicas de sampling, decodificación especulativa o evaluación de perplejidad en portugués.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1,5 GB según la cuantización (IQ1_S ~0,5 GB; Q4_K_M ~1,2 GB; Q6_K ~1,5 GB). Hay que sumar la memoria para el contexto KV, que depende de la longitud de contexto configurada (no disponible).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para cuantizaciones Q4/Q5; para Q6_K se recomienda 4 GB o más. Ejemplos: GTX 1650, RTX 3050, RTX 4060, RTX 4090 (sobra capacidad).
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas, e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación de GGUF), LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. Para el modelo base en safetensors, transformers con PyTorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un modelo de 1,7 B, se espera un throughput alto en GPU de consumo, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Manaca-1b-base (este) | 1,7 B | no disponible | CC-BY-4.0 | GGUF y safetensors | Especializado en portugués (pt-br) |
| Tucano-1b (TucanoBR) | no disponible en la informacion | no disponible | no disponible | no disponible | Familia de modelos en portugués de TucanoBR; no se dispone de datos comparativos en la información proporcionada |
| Llama-3.2-1B | 1,24 B | 128 K (según model card pública) | Llama 3.2 Community License | safetensors y GGUF | Multilingüe, pero no especializado en portugués; licencia con restricciones |
| Qwen2.5-1.5B | 1,54 B | 32 K (según model card pública) | Apache 2.0 | safetensors y GGUF | Multilingüe, buen rendimiento general; no especializado en portugués |

Nota: los datos de modelos comparables provienen de conocimiento general y no de la información proporcionada; se indican como referencia orientativa. Para Manaca-1b-base no se dispone de benchmarks que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no sigue instrucciones de forma fiable y puede generar texto incoherente o repetitivo si se usa como chatbot sin ajuste.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar afirmaciones falsas con apariencia de veracidad, especialmente en tareas de conocimiento factual.
- Sesgos: al entrenarse con corpus web (GigaVerbo, Wikipedia), puede reproducir sesgos presentes en esos datos; no se documentan evaluaciones de sesgo en la información disponible.
- Limitaciones de idioma: el modelo está entrenado principalmente en portugués; su rendimiento en otros idiomas es limitado y no está documentado.
- Longitud de contexto: no disponible; no se debe asumir una ventana larga sin verificación.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar los términos exactos y la licencia del modelo base original.
- Las cuantizaciones de muy baja precisión (IQ1, IQ2) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No se dispone de información sobre el proceso de entrenamiento (tokens, composición exacta, posibles filtros), lo que dificulta evaluar su calidad de forma rigurosa.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/manaca-1b-base-i1-GGUF
- Modelo base original: https://huggingface.co/AIInstituteLNCC/manaca-1b-base
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/manaca-1b-base-GGUF
- Página de resumen de mradermacher para este modelo: https://hf.tst.eu/model#manaca-1b-base-i1-GGUF
- Dataset GigaVerbo: https://huggingface.co/datasets/TucanoBR/GigaVerbo
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
