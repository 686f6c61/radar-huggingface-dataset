# mradermacher/OpenElla-NovelWriter-Charol-i1-GGUF

## Resumen

OpenElla-NovelWriter-Charol-i1-GGUF es la distribución en formato GGUF, con cuantización de tipo imatrix, del modelo N-Bot-Int/OpenElla-NovelWriter-Charol, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de 8.030 millones de parámetros orientado a la generación de texto creativo, la escritura de novelas y el roleplay conversacional, derivado a su vez de un merge construido con mergekit a partir del dataset N-Bot-Int/Propietary-Merging-Stepper-R1. La relevancia de esta ficha radica en que empaqueta el modelo en una batería amplia de cuantizaciones IQ y Q_K, desde 2,1 GB hasta 6,7 GB, lo que permite ejecutarlo en hardware de consumo.

El repositorio no incluye pesos en safetensors, sino únicamente ficheros GGUF generados mediante cuantización ponderada con un fichero imatrix, además del propio fichero imatrix para que otros usuarios puedan crear sus propias cuantizaciones. El autor indica que existen cuantizaciones estáticas equivalentes en un repositorio paralelo. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada: la model card se limita a listar los ficheros y a remitir a la documentación genérica de TheBloke sobre el uso de GGUF.

El modelo está etiquetado como de roleplay, conversacional y chat, con licencia AGPL-3.0 y soporte declarado únicamente para inglés. Con 1.082 descargas y un único like en el momento de la consulta, es un modelo de nicho dentro del ecosistema de cuantizaciones de mradermacher, pensado para usuarios que quieren ejecutar localmente un modelo de escritura creativa sin depender de infraestructura en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas: llama, transformers, mergekit; no se detalla la arquitectura interna) |
| Parámetros totales | 8.030.261.312 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; más fichero imatrix |
| Idiomas soportados | en (inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (no hay safetensors en este repositorio) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Las etiquetas del repositorio indican `llama`, `transformers`, `trl`, `merge` y `mergekit`, lo que sugiere que el modelo original es un merge de modelos de la familia Llama o compatible con ella, construido mediante mergekit, y que en su pipeline se empleó TRL. El dataset declarado es N-Bot-Int/Propietary-Merging-Stepper-R1, sin que se especifiquen número de tokens, composición ni procesos de alineación como RLHF o DPO.

La innovación técnica documentada en este repositorio es exclusivamente la relativa a la cuantización: se han generado cuantizaciones ponderadas (weighted/imatrix) a partir del modelo original, con un fichero imatrix publicado aparte para permitir la creación de cuantizaciones propias. El autor remite a una gráfica de ikawrakow para comparar la perplejidad relativa de los distintos tipos de cuantización. No se documentan innovaciones arquitectónicas como atención lineal, decodificación especulativa o modos de razonamiento extendido.

## Capacidades

- Generación de texto creativo y narrativo, con orientación explícita a la escritura de novelas según el nombre del modelo.
- Roleplay y conversación multi-turno, según las etiquetas `roleplay`, `conversational` y `chat`.
- Generación de texto autoregresiva estándar mediante transformers y text-generation-inference.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Escritura asistida de ficción y novela: el modelo está entrenado y etiquetado para generación narrativa, por lo que puede emplearse para redactar borradores de capítulos, continuar escenas a partir de un prompt y mantener el tono y el estilo de un manuscrito en curso.
- Roleplay conversacional en local: gracias a las cuantizaciones de 4-5 GB (i1-Q4_K_M, i1-Q4_K_S), puede ejecutarse en un PC con GPU de consumo para sesiones de chat de personaje sin enviar datos a servicios externos.
- Prototipado de chatbots de personaje: las etiquetas `chat` y `conversational` lo hacen adecuado para experimentar con personalidades y guiones de diálogo antes de invertir en modelos mayores.
- Generación de contenido literario por lotes: con llama.cpp o text-generation-inference se pueden lanzar generaciones masivas de variantes de texto (sinopsis, descripciones, diálogos) para un pipeline editorial.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2 e IQ3 (2,5-3,9 GB) permiten ejecutar el modelo en máquinas sin GPU dedicada o con VRAM reducida, a costa de calidad.
- Investigación sobre cuantización: el repositorio incluye el fichero imatrix y una amplia matriz de cuantizaciones, lo que permite estudiar el impacto de cada tipo de cuantización en la calidad de salida de un modelo de 8B orientado a narrativa.
- Base para merges o fine-tuning posteriores: al ser un modelo de 8B en formato GGUF, puede servir como referencia de comparación al evaluar otros merges de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1-2,3 GB con i1-IQ1_S/IQ1_M; 2,5-3,3 GB con IQ2 y Q2_K; 3,4-4,4 GB con IQ3 y Q3_K; 4,5-5,2 GB con IQ4 y Q4; 5,7-5,8 GB con Q5_K; 6,7 GB con Q6_K. Hay que añadir memoria para el contexto KV cache, cuyo tamaño depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, un modelo de 8B en Q4_K_M (5,0 GB) encaja en GPUs de 8 GB o más; en Q6_K (6,7 GB) requiere 8-10 GB; las cuantizaciones IQ2/IQ3 caben en GPUs de 4-6 GB.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q4_K_S (4,8 GB) y Q4_K_M (5,0 GB) caben en RTX 3060 de 12 GB, RTX 4060 Ti de 8/16 GB, RTX 4070, RTX 4080 y RTX 4090. Las cuantizaciones IQ2/IQ3 pueden ejecutarse en GPUs de 4-6 GB o incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), text-generation-inference (según las etiquetas del repositorio), transformers con soporte GGUF, y cualquier runtime compatible con GGUF. El autor remite a los README de TheBloke para el uso de ficheros GGUF multiparte.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| OpenElla-NovelWriter-Charol-i1-GGUF | 8.030 M | no disponible | AGPL-3.0 | GGUF | Hugging Face (mradermacher) |
| OpenElla-NovelWriter-Charol (base) | 8.030 M | no disponible | AGPL-3.0 | no disponible en esta ficha | Hugging Face (N-Bot-Int) |
| OpenElla-NovelWriter-Charol-GGUF (cuantizaciones estáticas) | 8.030 M | no disponible | AGPL-3.0 | GGUF | Hugging Face (mradermacher) |

No se dispone de información sobre benchmarks ni sobre modelos comparables de otros autores para establecer una comparación de rendimiento. La comparación se limita a las variantes del mismo modelo publicadas por el autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo entrenado principalmente en inglés, es previsible un sesgo cultural y lingüístico hacia ese idioma.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo de 8B sin datos de evaluación publicados, puede producir contenido factualmente incorrecto, especialmente fuera de tareas narrativas.
- Limitaciones de contexto e idioma: el campo `language` solo declara inglés; no se documenta la longitud de contexto, por lo que no se puede garantizar el rendimiento en conversaciones o documentos largos.
- Restricciones de licencia: AGPL-3.0 implica obligaciones de copyleft para uso en red; conviene revisar su compatibilidad antes de integrarlo en productos comerciales o servicios SaaS.
- Caveats para producción: las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan la calidad de forma notable según las propias notas del autor ("for the desperate", "very low quality"); para producción se recomienda Q4_K_M o superior. No hay benchmarks ni evaluación de calidad publicados, por lo que cualquier despliegue en producción debería acompañarse de una evaluación propia.
- El repositorio no contiene pesos en safetensors; solo GGUF, lo que limita su uso a runtimes compatibles con ese formato.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OpenElla-NovelWriter-Charol-i1-GGUF
- Modelo base: https://huggingface.co/N-Bot-Int/OpenElla-NovelWriter-Charol
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/OpenElla-NovelWriter-Charol-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#OpenElla-NovelWriter-Charol-i1-GGUF
- Dataset declarado: https://huggingface.co/datasets/N-Bot-Int/Propietary-Merging-Stepper-R1
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
