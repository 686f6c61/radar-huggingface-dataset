# AMAImedia/Hy4-preview-BF16-GGUF

## Resumen

Hy4-preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Tencent Hy, distribuido en HuggingFace bajo el identificador `tencent/Hy4-preview`. La ficha que se analiza aquí, `AMAImedia/Hy4-preview-BF16-GGUF`, es una redistribución en BF16 y GGUF publicada por AMAImedia a partir de los pesos originales de Tencent y de la cuantización previa de `AngelSlim/Hy4-preview-GGUF`, con el objetivo de facilitar el despliegue en entornos con `llama.cpp` y otros runners compatibles con GGUF.

El modelo cuenta con 770B parámetros totales en el backbone y 49B parámetros activados por token, más una capa MTP nativa de 10B parámetros totales (0,7B activados) orientada a decodificación especulativa. El backbone tiene 78 capas: la primera usa una FFN densa estándar y las 77 restantes emplean MoE con 256 expertos enrutados y 1 experto compartido, activando los 8 mejores expertos enrutados más el compartido por cada token. La atención utiliza Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache para reutilizar índices dispersos entre capas.

Su relevancia actual radica en que combina una ventana de parámetros muy alta con un coste de cómputo por token relativamente bajo (49B activos), lo que lo sitúa en la liga de los MoE fronterizos de código abierto. La licencia Apache 2.0 y el soporte declarado de más de 100 idiomas lo hacen atractivo para despliegues multilingües y para pipelines de inferencia autoalojados, aunque su huella de memoria (el repositorio ocupa 2492,2 GB) exige infraestructura multi-GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Gated DeepSeek Sparse Attention (Gated DSA) e iHC (identity Hyper-Connections) |
| Parametros totales | 770B en el backbone (779.960.992.733 en safetensors, incluyendo la capa MTP) |
| Parametros activos | 49B por token en el backbone; la capa MTP activa 0,7B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (safetensors) y GGUF, con variantes generadas mediante imatrix |
| Idiomas soportados | 112 idiomas declarados en la model card (entre ellos es, en, zh, ru, ja, de, fr, pt, ar, hi, ko, vi, tr, etc.) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |
| Capas | 78 (1 densa + 77 MoE) |
| Hidden size | 6144 |
| Cabezas de atencion | 64 |
| Dimension de compresion de query / key-value | 2048 / 512 |
| Cabezas del indexer / dimension de cabeza | 32 / 128 |
| Indexer top-k | 2048 |
| Flujos residuales | 4 |
| Expertos enrutados / compartidos | 256 / 1 |
| Expertos activados por token | top-8 enrutados + 1 compartido |
| Capa MTP | 1 nativa (10B totales, 0,7B activados) |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 3880 / 1 |

## Arquitectura y entrenamiento

El backbone es un transformer MoE de 78 capas con hidden size 6144. La primera capa mantiene una FFN densa y las 77 siguientes la sustituyen por capas MoE con enrutamiento hacia 256 expertos más un experto compartido, del que se activan los 8 mejores expertos enrutados por token. El módulo de atención emplea Gated DeepSeek Sparse Attention (Gated DSA), inspirada explícitamente en DeepSeek y GLM, con IndexCache para reutilizar índices dispersos entre capas, lo que reduce el coste de la atención dispersa. Los detalles del indexer son públicos: 32 cabezas de indexer con dimensión de cabeza 128 y un top-k de 2048.

La ruta residual utiliza iHC (identity Hyper-Connections) con 4 flujos residuales para ampliar el flujo de información entre capas. Además, se integra una capa MTP (Multi-Token Prediction) nativa de 10B parámetros totales y 0,7B activados, diseñada para decodificación especulativa y por tanto para acelerar la generación. La model card referencia los papers arXiv:2512.02556 (DeepSeek Sparse Attention) y arXiv:2603.12201 (IndexCache).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se detalla en la información proporcionada si existe un codificador visual, pese a que el pipeline declarado en HuggingFace es `image-text-to-text`; el repositorio no describe componentes de visión en sus especificaciones de arquitectura.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `conversational`.
- Razonamiento y generación de código, en línea con los MoE fronterizos de su categoría (no se aportan benchmarks específicos en la información disponible).
- Capacidad multimodal declarada a nivel de pipeline (`image-text-to-text`), aunque no se detalla el codificador visual ni el formato de entrada de imagen en las especificaciones proporcionadas.
- Decodificación especulativa nativa mediante la capa MTP integrada, lo que puede reducir la latencia de generación sin un modelo borrador externo.
- Cobertura multilingüe amplia: 112 idiomas declarados, incluyendo castellano, inglés, chino, ruso, japonés, vietnamita, kazajo, árabe, hindi y un conjunto extenso de lenguas de bajos recursos.
- Atención dispersa con IndexCache, que reduce el coste de atención en contextos largos en comparación con atención densa.
- Compatibilidad declarada con HuggingFace Inference Endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en asistentes de IDE o en pipelines de CI/CD para revisión automática de parches, generación de tests y explicación de diffs, aprovechando sus 49B parámetros activos para mantener un coste por token inferior al de un modelo denso de tamaño equivalente.
- Atención al cliente multilingüe: con 112 idiomas declarados y arquitectura conversacional, permite atender tickets en castellano, inglés, alemán o hindi desde un único punto de despliegue, sin modelos específicos por idioma.
- Traducción y doblaje automatizado: el modelo se publica en el contexto de la plataforma NOESIS de automatización de doblaje multilingüe de AMAImedia, por lo que encaja en pipelines de traducción de guiones, adaptación de diálogo y control de longitud de subtítulos.
- Procesamiento de documentos largos: la atención dispersa con IndexCache está pensada para reducir el coste de contextos extensos, lo que resulta adecuado para resumen de contratos, análisis de informes técnicos o extracción de entidades sobre expedientes completos (sujeto a la ventana de contexto real, no especificada).
- Generación aumentada por recuperación (RAG) empresarial: el modelo puede actuar como generador final en un sistema RAG sobre bases de conocimiento internas multilingües, con la ventaja de un único modelo que cubre consultas en varios idiomas.
- Investigación en arquitecturas MoE y atención dispersa: al ser un modelo abierto con licencia Apache 2.0 y papers asociados, sirve como base para estudiar enrutamiento de expertos, Gated DSA, iHC y decodificación especulativa mediante MTP.
- Despliegue autoalojado con GGUF: la variante GGUF permite servir el modelo con `llama.cpp` en clústeres con memoria agregada suficiente, evitando depender de APIs propietarias y manteniendo los datos dentro de la infraestructura de la organización.
- Evaluación comparativa de modelos fronterizos: útil como referencia en estudios de coste/rendimiento frente a otros MoE de escala similar, midiendo latencia, throughput y calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona la existencia de un apéndice de benchmarks ("Benchmark Appendix"), pero los valores numéricos no forman parte de la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- Peso en BF16: 770B parámetros implican aproximadamente 1,54 TB solo en pesos, más la capa MTP. No cabe en una única GPU comercial; requiere un clúster multi-nodo.
- Cuantizaciones GGUF estimadas (cálculo a partir del número de parámetros, no confirmado por el autor): Q8_0 en torno a 800-850 GB; Q4_K_M en torno a 420-480 GB; Q2_K en torno a 250-300 GB. Son estimaciones orientativas.
- GPU recomendadas: para BF16, del orden de 12 GPU H200 (141 GB) o equivalente en Blackwell; para Q4_K_M, un mínimo aproximado de 4 GPU H200 o 8 GPU A100 80 GB, dejando margen para caché KV y activaciones.
- Consumer GPU: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Sería necesario un clúster con memoria agregada muy superior a la disponible en equipos de sobremesa.
- Opciones de despliegue: la model card documenta vLLM y SGLang; la distribución GGUF de este repositorio está pensada para `llama.cpp` y runners compatibles. Soporte de TGI y Ollama: no disponible en la información proporcionada.
- Memoria para caché KV: no disponible. La arquitectura Gated DSA con IndexCache está diseñada para reducir el coste de atención, pero no se especifican valores medidos.
- Latencia y throughput: no disponible. Como referencia cualitativa, al activar 49B parámetros por token su coste de cómputo es muy inferior al de un modelo denso de 770B, pero no se aportan cifras de tokens por segundo.
- Almacenamiento: el repositorio ocupa 2492,2 GB, por lo que conviene planificar el espacio en disco antes de descargar el conjunto completo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-preview | 770B (backbone) + 10B (MTP) | 49B + 0,7B | no disponible | Apache 2.0 | Pesos abiertos en HuggingFace y ModelScope |
| DeepSeek-V3 / R1 | 671B | 37B | 128K (dato público) | Licencia propia de DeepSeek para V3; MIT para R1 | Pesos abiertos |
| Qwen3-235B-A22B | 235B | 22B | 128K (dato público, extensible) | Apache 2.0 | Pesos abiertos |
| GLM-4.6 | 355B | 32B | 200K (dato público) | MIT | Pesos abiertos |
| Kimi K2 | 1T | 32B | 128K (dato público) | MIT modificada | Pesos abiertos |

Nota: los datos de los modelos comparativos proceden de información pública de terceros y deben verificarse contra sus fichas oficiales antes de usarse en una decisión de producción. No se dispone de resultados de benchmarks comparativos de Hy4-preview en la información proporcionada, por lo que la comparación se limita a parámetros, contexto declarado y licencia.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks en la información disponible, por lo que no es posible validar empíricamente el rendimiento del modelo frente a alternativas de su categoría.
- No se especifica la longitud de contexto soportada, dato crítico para planificar casos de uso con documentos largos o conversaciones extensas.
- No hay información sobre la composición del dataset de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF, DPO u otras), lo que impide evaluar sesgos sistemáticos con base documental.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala y no cuantificado en la model card; en dominios factuales (legal, médico, financiero) se recomienda verificación externa y anclaje mediante RAG.
- El pipeline declarado es `image-text-to-text`, pero no se documenta el codificador visual ni los formatos de imagen admitidos en la información disponible; conviene verificar el soporte multimodal real antes de depender de él.
- Cobertura idiomática declarada de 112 idiomas, pero sin métricas por idioma; el rendimiento en lenguas de bajos recursos puede ser desigual.
- La model card menciona explícitamente una sección de limitaciones conocidas ("Known Limitations") cuyo contenido no se incluye en la información proporcionada; debería consultarse en el repositorio original.
- Coste de despliegue elevado: incluso en cuantizaciones agresivas se requieren cientos de GB de memoria, lo que descarta su uso en estaciones de trabajo convencionales.
- Esta ficha corresponde a una redistribución de terceros (`AMAImedia`), no al repositorio oficial de Tencent. Para uso crítico, conviene contrastar los pesos con `tencent/Hy4-preview`.
- Licencia Apache 2.0 declarada, que en principio permite uso comercial, pero conviene revisar los términos completos y posibles avisos adicionales de la licencia del modelo base antes de un despliegue comercial.
- Los metadatos de fecha del repositorio (creado el 2026-08-28, actualizado el 2026-09-20) y del modelo base deben verificarse en la ficha oficial, ya que la información de la búsqueda web no ha aportado datos contrastables sobre este modelo.

## Enlaces

- Repositorio analizado: https://huggingface.co/AMAImedia/Hy4-preview-BF16-GGUF
- Modelo base oficial: https://huggingface.co/tencent/Hy4-preview
- Repositorio de cuantizaciones GGUF de referencia: https://huggingface.co/AngelSlim/Hy4-preview-GGUF/tree/main
- Paper de DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper de IndexCache: https://arxiv.org/abs/2603.12201
- Repositorio GitHub del modelo: https://github.com/Tencent-Hunyuan/Hy4-preview
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-preview
- cnb.cool: https://cnb.cool/ai-models/tencent/Hy4-preview
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-preview
- Sitio oficial de despliegue de Tencent: https://aistudio.tencent.com/
- README en chino del modelo original: https://huggingface.co/tencent/Hy4-preview/blob/main/README_CN.md
- Perfil del publicador de la cuantización: https://huggingface.co/AMAImedia y https://AMAImedia.com
