# mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF

## Resumen

Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF es una cuantización GGUF con imatrix del modelo prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic, publicada por mradermacher. Se trata de una variante "abliterated/heretic/uncensored" de un modelo de la familia Qwen3.5 de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones), derivada a su vez de una mezcla de datos que el autor etiqueta como "deepseek-v4" y "flash". El repositorio es una conversión a formato GGUF pensada para inferencia local con llama.cpp y ecosistemas compatibles, no un modelo entrenado desde cero por el cuantizador.

El modelo base incorpora etiquetas que sugieren capacidades de razonamiento, matemáticas, SFT, instruction-following y, según la model card del cuantizador, capacidades de visión (menciona archivos mmproj en el repositorio estático). La variante "heretic/uncensored/abliterated" implica que se ha aplicado una técnica de eliminación o atenuación de la capa de rechazo (refusal) del modelo original, lo que cambia el comportamiento en consultas sensibles. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de ~9B con cuantizaciones que caben en GPU de consumo; por otro, advierte de que se trata de una variante sin censura, con implicaciones éticas y de seguridad importantes para producción. No hay datos de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas sugieren transformer de la familia Qwen3.5; no confirmado en la información) |
| Parámetros totales | 9.197.093.888 (~9,2B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K (4,0 GB), i1-IQ3_M (4,6 GB), i1-Q4_K_S (5,6 GB); el autor lista además Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base; repo de 13,9 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. Las etiquetas del repositorio apuntan a la familia Qwen3.5, con indicios de "flash", "math", "reasoning", "sft" y "deepseek-v4", lo que sugiere un modelo de lenguaje transformer con ajuste supervisado y posible mezcla de datos orientada a razonamiento y matemáticas. No se especifican número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable de este repositorio no está en el entrenamiento, sino en la cuantización: mradermacher publica cuantizaciones con imatrix (matriz de importancia) generadas a partir del modelo base, lo que típicamente mejora la calidad de cuantizaciones agresivas (Q2, IQ3) frente a cuantizaciones estáticas. La model card indica que se trata de un modelo de visión y que los archivos mmproj, si existen, están en el repositorio estático. También se menciona la etiqueta "mtp" (multi-token prediction) y "abliterated/heretic", que describen la modificación del comportamiento de rechazo, no una arquitectura distinta.

## Capacidades

- Generación de texto conversacional e instruction-following, según las etiquetas del repositorio.
- Razonamiento y matemáticas: etiquetas "math" y "reasoning" en el modelo base.
- Código: no confirmado explícitamente en la información disponible.
- Visión: la model card del cuantizador indica que es un modelo de visión y remite a archivos mmproj en el repositorio estático.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüe: limitado a inglés según el campo `language: en`.
- Comportamiento sin censura: variante "abliterated/heretic/uncensored/decensored", con atenuación del rechazo en consultas sensibles.
- Posible soporte de multi-token prediction (etiqueta "mtp"), sin detalles técnicos disponibles.

## Casos de uso

- Experimentación en local con llama.cpp: las cuantizaciones i1-Q2_K (4,0 GB), i1-IQ3_M (4,6 GB) e i1-Q4_K_S (5,6 GB) permiten ejecutar un modelo de ~9,2B en GPU de consumo y en CPU con RAM suficiente, útil para pruebas de concepto y prototipado rápido.
- Investigación sobre alineación y refusal: al ser una variante "abliterated/heretic", sirve para estudiar cómo cambia el comportamiento del modelo al eliminar la capa de rechazo, comparándolo con el modelo base original.
- Evaluación de cuantizaciones con imatrix: el repositorio incluye el archivo imatrix y varias cuantizaciones, lo que permite medir la degradación de calidad entre Q2, IQ3 y Q4 en tareas de razonamiento y matemáticas.
- Generación de texto en inglés para prototipos: con licencia Apache 2.0 y formato GGUF, se puede integrar en pipelines de generación de texto en inglés sin depender de APIs externas.
- Pruebas de instruction-following en entornos controlados: útil para validar prompts y plantillas de chat antes de migrar a modelos mayores o a producción.
- Análisis de sesgos y contenido sensible: la variante sin censura permite estudiar qué tipos de contenido genera el modelo cuando no aplica rechazo, con fines de auditoría y seguridad.
- Despliegue en entornos con recursos limitados: al caber en 4-6 GB de VRAM/RAM según cuantización, es adecuado para estaciones de trabajo modestas o servidores de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~4,0 GB para i1-Q2_K, ~4,6 GB para i1-IQ3_M y ~5,6 GB para i1-Q4_K_S, más overhead de contexto y del runtime.
- GPU recomendadas: no disponible de forma explícita; por tamaño, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB pueden alojar las cuantizaciones indicadas con margen para contexto.
- Cabe en GPU de consumo: sí, al menos las cuantizaciones i1-Q2_K, i1-IQ3_M e i1-Q4_K_S según los tamaños publicados.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extensión entornos compatibles con GGUF como Ollama o LM Studio; el repositorio también incluye la etiqueta text-generation-inference, aunque TGI no consume GGUF de forma nativa. No se detallan configuraciones de vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF (este) | ~9,2B | no disponible | Apache 2.0 | GGUF | Variante sin censura, cuantizada con imatrix |
| prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic | ~9,2B | no disponible | Apache 2.0 | safetensors (base) | Modelo base del que deriva esta cuantización |
| mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF | ~9,2B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo modelo base |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Variante "uncensored/abliterated/heretic": el modelo ha sido modificado para atenuar o eliminar el rechazo, por lo que puede generar contenido sensible, ofensivo o inseguro. No es adecuado para producción orientada al público sin filtros adicionales.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo entrenado principalmente en inglés, es probable que herede sesgos culturales y lingüísticos del corpus original.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir información falsa con apariencia de veracidad.
- Limitaciones de idioma: el campo `language` solo declara inglés; el rendimiento en castellano no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide planificar cargas de trabajo con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la modificación "uncensored" puede incumplir políticas de plataformas, términos de servicio de proveedores cloud o normativas locales sobre contenido.
- Caveat de cuantización: las cuantizaciones Q2 e IQ3 pueden degradar el razonamiento y las matemáticas; el autor recomienda IQ3_XXS sobre Q2_K y señala Q4_K_S como equilibrio óptimo tamaño/velocidad/calidad.
- Modelo de visión: si se requiere la funcionalidad multimodal, hay que descargar los archivos mmproj del repositorio estático, no de este.
- Sin benchmarks: no hay evidencia publicada de rendimiento que permita comparar con alternativas de forma rigurosa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-9B-DS-v4-Flash-uncensored-heretic-i1-GGUF
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
