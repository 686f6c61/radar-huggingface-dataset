# Asrun/Wren-31B-UK-4bit

## Resumen

Wren-31B-UK-4bit es una cuantización de 4 bits del modelo Asrun/Wren-31B-UK, desarrollada por Asrun para ejecución local en Macs con Apple Silicon. El modelo base se presenta como un modelo de lenguaje orientado a generación de texto en inglés británico estricto, con convenciones del Reino Unido (ortografía, moneda en libras, formato de fecha) y pensado para despliegues on-premise en entornos empresariales y de producción de medios. La cuantización reduce el peso a aproximadamente 16 GB, lo que permite su ejecución en equipos con 32 GB de memoria unificada o superior.

El modelo cuenta con 30.697.345.280 parámetros totales según los pesos en safetensors, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La librería indicada es MLX, el framework de Apple para aprendizaje automático en silicio de Apple, y el repositorio ocupa 17,3 GB. El pipeline declarado es text-generation y el único idioma soportado según la model card es el inglés.

La relevancia de esta ficha radica en que se trata de una cuantización reciente (publicada en noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada más allá de la model card. Esto limita la evaluación objetiva del rendimiento, pero la información disponible permite caracterizar el modelo, su licencia y sus requisitos de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` en los tags de Hugging Face) |
| Parametros totales | 30.697.345.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (cuantizacion del modelo base Asrun/Wren-31B-UK) |
| Idiomas soportados | inglés (en), con variante de inglés británico |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Asrun/Wren-31B-UK. Los tags de Hugging Face incluyen la etiqueta `gemma4`, lo que sugiere una arquitectura de la familia Gemma 4, pero la model card no confirma ni detalla esta relación. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

La única información técnica disponible sobre el proceso de cuantización es que se trata de una versión de 4 bits del modelo base, con un peso aproximado de 16 GB, optimizada para ejecución en Apple Silicon mediante MLX. No se detallan el algoritmo de cuantización (GPTQ, AWQ, bitsandbytes u otro), ni los grupos de cuantización, ni las métricas de degradación respecto al modelo original.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado text-generation.
- Aplicación de convenciones estrictas del Reino Unido: ortografía británica, moneda en libras esterlinas (£) y formato de fecha británico.
- Orientación a casos de uso empresariales y de producción de medios, según los tags del repositorio.
- Ejecución local en Apple Silicon mediante MLX, sin telemetría en la nube.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Redacción corporativa en inglés británico: el modelo aplica ortografía y convenciones del Reino Unido de forma consistente, adecuado para documentación interna, comunicaciones y material de marketing de empresas británicas que requieren coherencia lingüística.
- Producción de medios y contenidos editoriales: los tags incluyen media-production, por lo que se plantea para generación de borradores, guiones o textos editoriales con formato británico, ejecutándose localmente para evitar filtraciones de contenido confidencial.
- Despliegue on-premise en oficinas: al caber en Macs de 32 GB o más y no requerir telemetría en la nube, encaja en entornos con requisitos de soberanía de datos (tag sovereign-ai) donde no se permite enviar información a servicios externos.
- Asistencia conversacional interna: para chatbots de soporte a empleados o atención al cliente en inglés británico, con la ventaja de que el modelo se ejecuta en el propio hardware de la organización.
- Generación de documentación financiera o administrativa: la aplicación de moneda en libras y formato de fecha británico reduce errores de localización en informes, facturas o comunicaciones financieras.
- Prototipado y experimentación local: desarrolladores que quieran evaluar un modelo de aproximadamente 31.000 millones de parámetros en un Mac antes de decidir un despliegue mayor, usando MLX o LM Studio.
- Investigación sobre cuantización: útil para estudiar la degradación de calidad de un modelo de este tamaño al pasar a 4 bits en hardware de Apple, aunque no se publican métricas al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 16 GB para los pesos en 4 bits, más overhead de contexto y runtime; se recomienda un mínimo de 32 GB de memoria unificada según la model card.
- GPU recomendadas: Apple Silicon con 32 GB o más de memoria unificada (familias M1/M2/M3/M4 Pro, Max o Ultra). No se documenta soporte para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en Macs de Apple Silicon con 32 GB o más; no se indica compatibilidad con GPUs de consumo tipo RTX 4090.
- Opciones de despliegue: MLX (`mlx-lm`) y LM Studio, según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con alternativas de tamaño similar ni con otras cuantizaciones. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo entrenado principalmente en inglés británico, puede presentar sesgos culturales y lingüísticos hacia el Reino Unido.
- Riesgo de alucinación: no cuantificado; no se publican evaluaciones de fidelidad ni de tasa de alucinación.
- Limitaciones de contexto: la longitud de contexto no está disponible, lo que impide planificar casos de uso con documentos largos.
- Limitaciones de idioma: solo se declara inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe conservar el aviso de licencia y atribución.
- Caveats para producción: el repositorio tiene cero descargas y cero likes, sin benchmarks ni validación externa; la cuantización de 4 bits puede degradar la calidad respecto al modelo base, y no se documenta el método de cuantización ni las métricas de degradación.
- Dependencia de hardware: el formato MLX limita el despliegue a Apple Silicon; no es directamente portable a ecosistemas CUDA sin conversión adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Asrun/Wren-31B-UK-4bit
- Modelo base: https://huggingface.co/Asrun/Wren-31B-UK
- Sitio del autor: https://asrun.co.uk
