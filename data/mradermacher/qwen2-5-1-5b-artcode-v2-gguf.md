# mradermacher/Qwen2.5-1.5B-ArtCode-v2-GGUF

## Resumen

Qwen2.5-1.5B-ArtCode-v2-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo micepapai/Qwen2.5-1.5B-ArtCode-v2, un ajuste fino de Qwen2.5-1.5B orientado a la generación de código. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, que en este caso distribuye once variantes que van desde Q2_K (0,8 GB) hasta f16 (3,2 GB). El modelo base cuenta con 1.543.714.304 parámetros reales según los pesos en safetensors.

El interés de esta ficha está en el empaquetado, no en el modelo original: las cuantizaciones permiten ejecutar un modelo de 1,5B parámetros en hardware de consumo, desde portátiles con poca memoria hasta GPUs de gama media, mediante llama.cpp y sus derivados. Se trata de un modelo pequeño y especializado en código, no de un modelo de propósito general, por lo que su utilidad práctica se limita a tareas de autocompletado, generación de fragmentos y asistencia ligera en entornos con recursos restringidos.

La relevancia actual es la habitual de los modelos pequeños cuantizados: despliegue local sin dependencia de API, baja latencia en hardware modesto y posibilidad de integrarse en flujos de trabajo de desarrollo sin coste por token. No obstante, la información publicada por el autor de la cuantización es mínima y no incluye benchmarks, datos de entrenamiento del modelo base ni detalles sobre el ajuste fino original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B; no se detalla en la informacion disponible) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2.5-1.5B, un transformer decoder-only de la familia Qwen2.5 de Alibaba, con 1.543.714.304 parámetros. Sobre esa base, el autor micepapai aplicó un ajuste fino (ArtCode-v2) orientado a código, presumiblemente mediante técnicas de instrucción o conversación, aunque la model card no documenta el dataset, el número de tokens ni si hubo RLHF o DPO. No se dispone de información sobre innovaciones técnicas específicas del ajuste.

El trabajo de mradermacher consiste exclusivamente en la conversión a GGUF y la generación de cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). No se han generado cuantizaciones ponderadas ni imatrix para este modelo; el autor indica que, si no aparecen en una semana, probablemente no las planee. La model card menciona la posibilidad de solicitarlas mediante una discusión en la comunidad.

## Capacidades

- Generación de texto y código en inglés, heredadas del ajuste ArtCode-v2 sobre Qwen2.5-1.5B.
- Conversación multi-turno (etiqueta "conversational" en el repo).
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible").
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Autocompletado de código en el editor: un modelo de 1,5B cuantizado a Q4_K_M (1,1 GB) puede ejecutarse en local con latencia baja y ofrecer sugerencias de fragmentos en inglés, sin enviar código a servicios externos.
- Asistente de código en portátiles sin GPU dedicada: las variantes Q3_K_S o IQ4_XS (0,9-1,0 GB) caben en RAM y permiten generar explicaciones o snippets en entornos con 8 GB de memoria.
- Generación de tests unitarios sencillos: el ajuste en código permite producir esqueletos de pruebas para funciones pequeñas, útil en proyectos con poca cobertura.
- Documentación técnica automatizada: generar docstrings y comentarios en inglés para funciones y módulos, aprovechando el ajuste conversacional.
- Prototipado rápido en CI/CD: integración vía llama.cpp o servidores compatibles con GGUF para tareas de análisis estático asistido, como resumir diffs o proponer mensajes de commit.
- Educación y experimentación: modelo ligero para estudiar cuantizaciones GGUF y comparar calidad entre Q2_K, Q4_K_M y Q8_0 en tareas de código.
- Despliegue en dispositivos edge: la variante Q2_K (0,8 GB) permite inferencia en hardware con recursos muy limitados, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K ~0,8 GB; Q3_K_S/M ~0,9 GB; Q3_K_L e IQ4_XS ~1,0 GB; Q4_K_S ~1,0 GB; Q4_K_M ~1,1 GB; Q5_K_S/M ~1,2 GB; Q6_K ~1,4 GB; Q8_0 ~1,7 GB; f16 ~3,2 GB (más overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar las variantes Q4-Q8; una RTX 3060, RTX 4060 o superior ofrece margen para contextos amplios. En A100/H100 el modelo es sobredimensionado para su capacidad y no aprovecha el hardware.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas de los últimos años, e incluso en iGPU con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), servidores compatibles con la API de llama.cpp, y en general cualquier runtime que soporte GGUF. La etiqueta "endpoints_compatible" sugiere uso con Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada; en un modelo de 1,5B cuantizado a Q4 se espera una latencia por token muy baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-ArtCode-v2-GGUF (este) | 1,54B | no disponible | cc-by-4.0 | GGUF | Ajuste en código, solo inglés |
| Qwen2.5-1.5B-Instruct (original) | 1,54B | no disponible en esta ficha | Apache 2.0 (Qwen2.5) | safetensors, GGUF | Base generalista, multilingüe |
| mradermacher/Qwen2.5-1.5B-ArtCode-GGUF (v1) | 1,54B | no disponible | cc-by-4.0 | GGUF | Versión anterior del ajuste ArtCode |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo pequeño (1,5B): capacidad de razonamiento y generación de código limitada frente a modelos de 7B o superiores; propenso a errores en tareas complejas.
- Solo inglés según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños, especialmente en código: puede generar APIs inexistentes o sintaxis incorrecta.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5 y de un ajuste no documentado, los sesgos del corpus original y del fine-tuning son desconocidos.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero conviene verificar la licencia del modelo base Qwen2.5 (Apache 2.0) y las condiciones del ajuste ArtCode-v2.
- No hay cuantizaciones imatrix/ponderadas disponibles; las estáticas pueden perder calidad en comparación.
- Longitud de contexto no documentada en esta ficha; verificar en la model card del modelo base antes de usarlo con prompts largos.
- El repo ocupa 14,2 GB por incluir todas las variantes; descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-1.5B-ArtCode-v2-GGUF
- Modelo base del ajuste: https://huggingface.co/micepapai/Qwen2.5-1.5B-ArtCode-v2
- Versión anterior (v1): https://huggingface.co/mradermacher/Qwen2.5-1.5B-ArtCode-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen2.5-1.5B-ArtCode-v2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ficha en AlphaNeural: https://alphaneural.io/assets/mradermacher/Qwen2.5-1.5B-ArtCode-v2-GGUF
