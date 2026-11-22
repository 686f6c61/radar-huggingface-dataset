# mradermacher/Wicked-Stuff-26B-A4B-Final-i1-GGUF

## Resumen

Wicked-Stuff-26B-A4B-Final-i1-GGUF es una colección de cuantizaciones GGUF, generadas con imatrix (importance matrix), del modelo ReadyArt/Wicked-Stuff-26B-A4B-Final. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados. El modelo subyacente es un ajuste fino orientado a roleplay conversacional y narrativa adulta, con contenido explícito, horror y violencia, y se distribuye bajo licencia Apache 2.0.

El interés técnico de esta ficha reside en el formato: el repositorio ofrece una batería muy amplia de cuantizaciones (desde IQ1_S de 8,4 GB hasta Q6_K de 22,7 GB) sobre un modelo de aproximadamente 25.230 millones de parámetros totales. El sufijo "A4B" del nombre sugiere una arquitectura de mezcla de expertos con unos 4.000 millones de parámetros activos, aunque la model card no documenta explícitamente esa configuración, por lo que debe tratarse como una inferencia a partir del nombre y no como un dato confirmado.

La relevancia práctica es doble: por un lado, permite ejecutar un modelo de 25B en hardware de consumo gracias a las cuantizaciones bajas; por otro, ilustra el flujo habitual de publicación de GGUFs con imatrix, que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. El modelo está etiquetado únicamente para inglés y marcado como no apto para todas las audiencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con ~4B activos; no confirmado en la model card) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | no disponible (~4B según el sufijo "A4B", sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (más fichero imatrix para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

La model card del repositorio de cuantización no aporta detalles sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento: no se documentan número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. El nombre "Wicked-Stuff-26B-A4B-Final" apunta a un transformer de mezcla de expertos con aproximadamente 25B parámetros totales y unos 4B activos por token, patrón habitual en modelos tipo Qwen3-MoE o similares, pero esta información no está confirmada en la documentación disponible.

La innovación técnica documentada en este repositorio es la cuantización con imatrix (importance matrix): mradermacher genera una matriz de importancia a partir de datos de calibración y la usa para ponderar la cuantización, lo que en la práctica mejora la perplejidad de las cuantizaciones de baja precisión frente a las cuantizaciones estáticas equivalentes. El repositorio incluye además el fichero imatrix (0,2 GB) para que terceros puedan generar sus propias cuantizaciones. Existe una colección paralela de cuantizaciones estáticas en mradermacher/Wicked-Stuff-26B-A4B-Final-GGUF.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay.
- Narrativa de ficción adulta, con contenido erótico explícito (ERP).
- Ficción de terror y descripción de violencia, según las etiquetas del autor.
- Modo instruct/conversacional, pensado para diálogo y no para tareas de razonamiento formal.
- Capacidad multilingüe: no disponible; el modelo está etiquetado solo para inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está ajustado específicamente para mantener personajes y tono en diálogos multi-turno; las cuantizaciones Q4_K_M y Q5_K_M ofrecen el mejor equilibrio entre coherencia y tamaño para sesiones extensas en una sola GPU de consumo.
- Escritura asistida de ficción adulta: útil para autores que necesitan generar borradores de escenas explícitas o de terror con un modelo local, sin depender de APIs externas y con control total sobre los datos.
- Generación de narrativa de terror y violencia estilizada: las etiquetas del autor indican ajuste para este género; se puede usar en prototipos de videojuegos narrativos o ficción interactiva.
- Investigación sobre alineamiento y modelos "unaligned": el modelo está etiquetado como "unaligned", lo que lo hace útil como caso de estudio para medir cómo responden modelos sin restricciones de seguridad a prompts sensibles en entornos controlados.
- Despliegue local en hardware de consumo: con la cuantización IQ1_S (8,4 GB) o IQ2_M (10,5 GB) cabe en GPUs de 12 GB; con Q4_K_M (16,9 GB) en GPUs de 24 GB como la RTX 4090.
- Generación de datos sintéticos para ajuste fino: se puede usar para producir corpus de diálogo de dominio específico (ficción, terror, roleplay) que luego sirvan para entrenar o evaluar otros modelos, siempre que la licencia Apache 2.0 y las políticas de uso lo permitan.
- Experimentación con cuantizaciones imatrix: el fichero imatrix incluido permite a investigadores generar sus propias cuantizaciones y comparar la degradación de calidad entre tipos IQ y K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - IQ1_S (8,4 GB): ~10 GB con contexto moderado.
  - IQ2_M (10,5 GB): ~12 GB.
  - IQ3_M (12,5 GB): ~14-15 GB.
  - IQ4_XS (14,0 GB): ~16 GB.
  - Q4_K_M (16,9 GB): ~19-20 GB.
  - Q5_K_M (19,2 GB): ~22 GB.
  - Q6_K (22,7 GB): ~25-26 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 4080/4070 Ti Super (16 GB) para IQ4_XS o Q4_K_S; GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) para IQ2_M o IQ3_S; A100/H100 para despliegues concurrentes con contexto largo.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones hasta Q5_K_M en una RTX 4090; las cuantizaciones IQ1/IQ2 caben en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo en safetensors).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-Final-i1-GGUF | ~25,2B totales (~4B activos, sin confirmar) | no disponible | apache-2.0 | GGUF (i1) | Cuantizaciones imatrix; solo inglés; contenido adulto |
| Wicked-Stuff-26B-A4B-Final-GGUF (mradermacher) | ~25,2B | no disponible | apache-2.0 | GGUF (estáticas) | Misma base, cuantizaciones estáticas sin imatrix |
| ReadyArt/Wicked-Stuff-26B-A4B-Final | ~25,2B | no disponible | apache-2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3-30B-A3B (referencia de categoría) | ~30B totales, ~3B activos | 32K-128K según variante | apache-2.0 | safetensors, GGUF | MoE generalista, multilingüe; no especializado en roleplay adulto |

La comparación con modelos generalistas de la misma categoría (MoE de ~25-30B con pocos parámetros activos) es limitada porque la model card no publica benchmarks ni contexto. La ventaja diferencial de esta ficha es la disponibilidad de cuantizaciones imatrix muy agresivas (hasta IQ1_S) que permiten ejecución en GPUs pequeñas.

## Limitaciones y advertencias

- Contenido explícito: el modelo está etiquetado como nsfw, explicit, adult-content y not-for-all-audiences; no es apto para entornos sin control de edad ni para aplicaciones de cara al público general.
- Modelo "unaligned": no ha pasado por un proceso de alineamiento de seguridad documentado, por lo que puede producir contenido dañino, violento o sexual sin filtros; requiere moderación externa en cualquier despliegue.
- Riesgo de alucinación: no hay datos de evaluación; en modelos de roleplay es habitual la inconsistencia factual y la deriva de personaje en conversaciones largas.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: no documentado; no se debe asumir una ventana larga sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad; el propio autor las marca como "for the desperate" o "mostly desperate".
- El repositorio ocupa 301 GB; la descarga selectiva de una sola cuantización es imprescindible para un uso práctico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-Final-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-Final
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-Final-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Wicked-Stuff-26B-A4B-Final-i1-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
