# ReadyArt/Dark-Craving-26B-A4B-GGUF

## Resumen

Dark-Craving-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo Dark-Craving-26B-A4B, publicado por el usuario ReadyArt en HuggingFace. Se trata de un modelo de generación de texto orientado a roleplay conversacional y contenido para adultos (ERP), con etiquetas explícitas como `nsfw`, `explicit`, `unaligned` y `mature`. El modelo base cuenta con 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones), según los datos de safetensors del repositorio.

El nombre del modelo sugiere una arquitectura con atención de tipo A4B, aunque la model card no proporciona detalles técnicos sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados. El repositorio tiene un tamaño de 68,7 GB, lo que es coherente con múltiples archivos de cuantización GGUF para un modelo de este tamaño. La licencia declarada es Apache 2.0, aunque el uso previsto es claramente para contenido adulto y conversacional sin alineación.

La relevancia de esta ficha es limitada desde el punto de vista técnico: se trata de un modelo derivado sin documentación técnica sustancial, con cero descargas y cero likes en el momento de la consulta, y cuya model card está dominada por CSS y elementos visuales en lugar de información técnica. No obstante, se documenta aquí por completitud y para advertir de sus características y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere atención A4B, sin confirmar) |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repositorio incluye múltiples cuantizaciones, sin detallar) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado), safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura del modelo base. El nombre "A4B" podría referirse a un esquema de atención concreta, pero la model card no lo confirma ni lo describe. No se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras formas de alineación.

La model card del repositorio GGUF es fundamentalmente una plantilla HTML con estilos CSS y elementos decorativos, sin secciones técnicas sustantivas. No se incluyen detalles sobre el proceso de cuantización, las herramientas utilizadas (llama.cpp, etc.) ni las métricas de perplejidad o degradación respecto al modelo base. El modelo base referenciado es ReadyArt/Dark-Craving-26B-A4B, del que tampoco se proporcionan especificaciones en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, orientada a roleplay y diálogos multi-turno.
- Contenido explícito para adultos (ERP), según las etiquetas declaradas por el autor.
- Modo instruct/conversacional, según los tags del repositorio.
- Modelo "unaligned": no se declara alineación de seguridad ni filtros de contenido.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Roleplay conversacional de ficción para adultos: el modelo está etiquetado explícitamente para ERP y roleplay, por lo que su uso previsto es la generación de diálogos narrativos multi-turno en contextos de ficción para adultos, siempre que se cumplan los requisitos legales de edad y consentimiento.
- Generación de narrativa interactiva: puede emplearse en motores de ficción interactiva o videojuegos narrativos para adultos, generando respuestas de personajes coherentes con el tono y las instrucciones del sistema.
- Prototipado de chatbots de personaje: útil para experimentar con personalidades y estilos conversacionales sin restricciones de alineación, en entornos controlados y con audiencia adulta verificada.
- Investigación sobre modelos sin alineación: puede servir para estudiar el comportamiento de modelos "unaligned" en tareas de generación libre, comparando su output con modelos alineados.
- Despliegue local con llama.cpp u Ollama: al estar en formato GGUF, puede ejecutarse en hardware de consumo para experimentación offline sin dependencia de APIs externas.
- Evaluación de cuantizaciones: el repositorio GGUF permite comparar la calidad de distintas cuantizaciones frente al modelo base en tareas de generación conversacional.
- Generación de diálogos de ficción oscura o temática adulta: para proyectos creativos que requieran tono explícito y sin filtros, con las salvaguardas legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25,2 B parámetros, una cuantización Q4_K_M requeriría aproximadamente 15-16 GB de VRAM; Q8_0 rondaría los 27-28 GB; FP16 requeriría unos 50 GB.
- GPU recomendadas: para cuantizaciones bajas (Q4), una RTX 4090 (24 GB) o RTX 3090 (24 GB) podría alojar el modelo completo; para cuantizaciones altas se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB requeriría cuantizaciones más agresivas (Q3 o Q2) con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dark-Craving-26B-A4B-GGUF | 25,2 B | No disponible | Apache 2.0 | GGUF | Roleplay/ERP sin alinear, solo inglés |
| Modelos de roleplay GGUF de la comunidad (p. ej. variantes de 20-30 B) | ~20-30 B | Variable | Variable | GGUF | Ecosistema similar, sin benchmarks públicos |
| Modelos instruct alineados de ~25 B | ~25 B | Variable | Variable | Safetensors/GGUF | Mayor documentación técnica y alineación |

No se dispone de datos de rendimiento comparativos verificables para este modelo frente a alternativas concretas.

## Limitaciones y advertencias

- Contenido explícito para adultos: el modelo está diseñado para generar material NSFW y ERP; no debe desplegarse en entornos accesibles a menores.
- Modelo "unaligned": no incorpora salvaguardas de seguridad, por lo que puede generar contenido dañino, ilegal o éticamente problemático sin filtros.
- Riesgo elevado de alucinación: sin documentación sobre entrenamiento ni evaluación, no hay garantías de fidelidad factual.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está soportado ni evaluado.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- Documentación técnica inexistente: la model card no aporta información sobre arquitectura, entrenamiento ni cuantizaciones, lo que dificulta la evaluación rigurosa.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso o validación por terceros.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el rendimiento en conversaciones largas.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
