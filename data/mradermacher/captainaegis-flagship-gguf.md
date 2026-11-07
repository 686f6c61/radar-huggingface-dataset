# mradermacher/captainaegis-flagship-GGUF

## Resumen

captainaegis-flagship-GGUF es la versión cuantizada en formato GGUF del modelo Henrybarton/captainaegis-flagship, publicada por el usuario mradermacher, conocido por distribuir cuantizaciones estáticas de modelos abiertos. El modelo base se etiqueta internamente como "captain-aegis" y "qwen3.5", lo que sugiere una arquitectura derivada de la familia Qwen, aunque la model card no aporta detalles sobre el entrenamiento ni la procedencia exacta de los pesos. Cuenta con 4.205.751.296 parámetros totales según los safetensors del repositorio.

La relevancia de esta ficha reside en que ofrece el modelo en un rango amplio de cuantizaciones (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), lo que permite desplegarlo en hardware de consumo con llama.cpp u Ollama. Está orientado a conversación, uso de herramientas (tool-use) e investigación, y se distribuye bajo licencia Apache 2.0. No obstante, la información pública disponible es muy limitada: no se especifican la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 7 de noviembre de 2026, lo que indica que es una publicación muy reciente y sin validación comunitaria. El tamaño total del repo es de 38,9 GB, coherente con la suma de todas las variantes de cuantización incluidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen, según tag "qwen3.5"; detalles no disponibles) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Los tags del repositorio incluyen "qwen3.5", lo que apunta a una arquitectura de tipo transformer decoder-only inspirada en la familia Qwen, con 4.205.751.296 parámetros totales. No se especifica si emplea atención con ventana deslizante, atención lineal, decodificación especulativa ni otras innovaciones técnicas.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición del dataset), el proceso de alineación (RLHF, DPO u otros) ni las fases de ajuste fino. La model card del repositorio GGUF es una plantilla estándar de mradermacher que solo documenta el proceso de cuantización, no el entrenamiento del modelo original. El modelo base referenciado es Henrybarton/captainaegis-flagship, cuya model card no se ha incluido en la información proporcionada.

## Capacidades

- Generación de texto conversacional: el tag "conversational" indica que está ajustado para diálogo multi-turno.
- Uso de herramientas (tool calling / function calling): el tag "tool-use" sugiere soporte para invocar funciones externas, aunque no se documenta el formato exacto de las llamadas.
- Orientación a investigación: el tag "research" indica que está pensado para experimentación más que para producción crítica.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito (thinking mode) ni agentes multi-paso más allá de lo que implica el tool-use.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno gracias a su ajuste conversacional, adecuado para prototipos de chatbots en entornos de investigación.
- Integración en pipelines de tool calling: el tag "tool-use" permite experimentar con invocación de funciones en agentes sencillos, por ejemplo para consultar APIs o bases de datos.
- Despliegue en hardware de consumo: con cuantizaciones de 2,0 a 4,6 GB, puede ejecutarse en GPUs de gama media o incluso en CPU mediante llama.cpp, lo que facilita pruebas locales sin infraestructura dedicada.
- Investigación académica sobre cuantización: al ofrecer 12 variantes de cuantización del mismo modelo, permite estudiar el impacto de la compresión en la calidad de las respuestas conversacionales.
- Evaluación comparativa de modelos pequeños: con ~4,2 mil millones de parámetros, sirve como línea base en estudios que comparen modelos de tamaño similar en tareas de diálogo.
- Prototipado rápido con Ollama o llama.cpp: la disponibilidad de GGUF listos para usar reduce el tiempo de puesta en marcha en entornos de desarrollo y demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,0 GB (Q2_K) y 8,5 GB (f16), pasando por 2,8 GB (Q4_K_M) y 4,6 GB (Q8_0). A esta cifra hay que sumar el espacio para el contexto KV, que no se puede calcular sin conocer la longitud de contexto.
- GPU recomendadas: no se especifican oficialmente. Por tamaño, una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 pueden alojar cualquier cuantización con holgura; una A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs con 8 GB o más de VRAM; las variantes Q2_K a Q4_K_M caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El repositorio también incluye safetensors del modelo base, por lo que es compatible con transformers y potencialmente con vLLM o TGI si la arquitectura está soportada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, rendimiento) que permitan una comparación rigurosa. Como referencia estructural, se puede situar frente a otros modelos de ~4 mil millones de parámetros con licencia permisiva, pero sin cifras verificadas no es posible establecer una comparativa cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| captainaegis-flagship | 4,2 B | no disponible | Apache 2.0 | GGUF, safetensors |
| Alternativas de ~4 B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Riesgo de alucinación: sin datos de alineación ni evaluaciones, no se puede descartar un comportamiento propenso a inventar información.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano es desconocido y probablemente deficiente.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo derivado conviene verificar que el modelo base Henrybarton/captainaegis-flagship no imponga restricciones adicionales.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni informes de terceros.
- Cuantizaciones de baja calidad: las variantes Q2_K y Q3_K_M pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso real.
- No se ofrecen cuantizaciones ponderadas con imatrix, según indica el propio autor, lo que puede afectar a la calidad relativa de las variantes IQ.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/captainaegis-flagship-GGUF
- Modelo base: https://huggingface.co/Henrybarton/captainaegis-flagship
- Página de descargas del autor: https://hf.tst.eu/model#captainaegis-flagship-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
