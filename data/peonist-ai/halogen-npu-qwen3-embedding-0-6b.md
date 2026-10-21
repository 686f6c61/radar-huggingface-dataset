# peonist-ai/halogen-npu-qwen3-embedding-0.6b

## Resumen

`halogen-npu-qwen3-embedding-0.6b` es una conversión del modelo de embeddings Qwen3-Embedding-0.6B de Alibaba Qwen para ejecutarse exclusivamente sobre la NPU Ryzen AI (arquitectura XDNA2) de los procesadores AMD Strix Halo. Lo publica el proyecto peonist-ai dentro de su stack halogen, y su función es servir peticiones de embeddings en el mismo puerto y contenedor que el modelo generativo (Flash) que corre en la GPU, de modo que un único host puede atender generación y recuperación vectorial sin depender de la nube.

El paquete no es un modelo autocontenido en el sentido habitual: incluye un programa NPU compilado (`devices/`, 74 MB), los pesos convertidos a un formato propietario `.hnpw` (813 MB) y el tokenizador (11 MB), sumando 1,3 GB de repositorio. No carga en transformers, vLLM, llama.cpp ni Ollama; solo funciona dentro del contenedor `halogen-flash-server` 0.16.0 o posterior (los ficheros de la cabeza del repo exigen 0.18.12 o posterior).

Su relevancia es de nicho pero clara: permite inferencia de embeddings 100 % local en hardware de consumo AMD con aceleración NPU, respondiendo a `/v1/embeddings` con vectores de 1.024 dimensiones en el formato de petición de OpenAI (y dimensiones reducidas mediante el parámetro `dimensions`). La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3-Embedding-0.6B, compilado para NPU AMD XDNA2 (no se detalla la topología interna de la conversión) |
| Parametros totales | 0,6 B (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en formato `.hnpw` preconvertido para la NPU, sin variantes de cuantizacion publicadas |
| Idiomas soportados | no disponible en la informacion proporcionada (la model card no declara cobertura linguistica) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.hnpw` (pesos convertidos para NPU) + programa NPU en `devices/` + tokenizador en `tokenizer/` |
| Dimension de embedding | 1.024 por defecto, reducible con el parametro `dimensions` |
| Tamano del repositorio | 1,3 GB (813 MB pesos, 74 MB programa NPU, 11 MB tokenizador) |
| Libreria / runtime | `halogen` (contenedor `halogen-flash-server`) |
| Pipeline | feature-extraction / sentence-similarity |
| Revision del modelo base | `97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-0.6B, un transformer denso de 0,6 mil millones de parámetros especializado en representaciones vectoriales de frases y documentos, del que se conservan los pesos y el tokenizador. La aportación del repositorio no es de entrenamiento sino de despliegue: los pesos se han convertido al formato `.hnpw` y se acompañan de un programa NPU compilado para el acelerador XDNA2 integrado en Strix Halo. La model card no documenta datos de entrenamiento, número de tokens, composición del corpus ni etapas de ajuste (RLHF/DPO), porque no se ha reentrenado nada: se trata de una conversión de artefacto.

El aspecto técnico destacable es la convivencia de NPU y GPU en el mismo host. El programa NPU se comparte entre varios modelos de la familia (desde la versión 0.16.2 lo reutilizan también el reranker y el modelo de moderación), de forma que un host que sirve varios de ellos descarga el programa una sola vez. El servidor verifica tamaño y checksum de cada fichero antes de arrancar y fija la revisión descargada a la versión del servidor, garantizando reproducibilidad. El soporte de `dimensions` en la respuesta implica truncado de la representación (Matryoshka), aunque la model card no detalla el método exacto ni el impacto en calidad.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación densa, con 1.024 dimensiones por defecto.
- Reducción de dimensionalidad por petición mediante el parámetro `dimensions`, útil para índices vectoriales con presupuesto de memoria ajustado.
- API compatible con el esquema de peticiones de OpenAI (`/v1/embeddings`), lo que permite reutilizar clientes y SDK existentes sin cambios.
- Ejecución local y offline sobre NPU, sin acceso a red ni a servicios en la nube.
- Coexistencia con un modelo generativo en la GPU del mismo host y detrás del mismo puerto, habilitando pipelines RAG completos en una sola máquina.
- Compartición del programa NPU con el reranker (`halogen-npu-qwen3-reranker-0.6b`) y el modelo de moderación (`halogen-npu-qwen3guard-gen-0.6b`), lo que reduce el coste de almacenamiento cuando se sirven varios.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un modelo de representación.

## Casos de uso

- RAG local en estaciones de trabajo Strix Halo: el modelo indexa y consulta un corpus documental en la NPU mientras el modelo generativo redacta la respuesta en la GPU, sin salir del host ni pagar API externa.
- Búsqueda semántica de documentación interna: se generan embeddings de manuales, tickets y wikis corporativas y se sirven consultas por similitud coseno desde una aplicación propia que apunta a `/v1/embeddings`.
- Deduplicación y clustering de corpus: al procesar lotes de decenas de miles de registros, la ejecución en NPU libera la GPU y permite agrupar por similitud sin coste por token.
- Memoria vectorial para agentes: un agente que corre contra el modelo Flash del mismo servidor puede escribir y recuperar recuerdos de conversaciones anteriores usando el endpoint de embeddings en el mismo puerto.
- Segunda fase de recuperación en pipelines de búsqueda: combinación con `halogen-npu-qwen3-reranker-0.6b`, que comparte el programa NPU, para recuperar candidatos por embedding y reordenarlos por relevancia.
- Filtrado previo a la moderación: calcular similitud de mensajes frente a patrones conocidos antes de pasar el contenido por `halogen-npu-qwen3guard-gen-0.6b`, todo en el mismo acelerador.
- Despliegue en entornos aislados o sin conectividad: laboratorios, plantas industriales o equipos de campo donde no se permite enviar texto a servicios externos y se dispone de hardware AMD Ryzen AI Max.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MTEB, recuperación ni latencia/throughput, y la búsqueda web no ha devuelto documentación técnica asociada al modelo.

## Requisitos de hardware

- NPU obligatoria: AMD Ryzen AI con arquitectura XDNA2 (familia Strix Halo / Ryzen AI Max). El modelo no se ejecuta en CPU, GPU convencional ni NPU de otras generaciones.
- Controladores necesarios: driver NPU de AMD y XRT con su plugin NPU instalados en el host.
- Requisito de plataforma: mantener el reloj de fabric de la GPU mientras la NPU trabaja en paralelo, según indica la model card.
- Almacenamiento: 1,3 GB para este modelo; el programa NPU (74 MB) se comparte con reranker y moderador si se sirven en el mismo host.
- VRAM: no aplica al ser inferencia en NPU; no se publica consumo de memoria del sistema ni reparto entre NPU y iGPU.
- Opciones de despliegue: únicamente el contenedor `halogen-flash-server` (0.16.0 o superior con `HALOGEN_DOWNLOAD` activo y `HALOGEN_NPU_MODELS=qwen3-embedding-0.6b`; 0.18.12 o superior para los ficheros de la revisión actual). vLLM, TGI, llama.cpp y Ollama no son compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.
- No cabe en GPU de consumo tipo RTX 4090 ni en Apple Silicon: la dependencia es del compilador NPU, no del tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| halogen-npu-qwen3-embedding-0.6b | 0,6 B | no disponible | `.hnpw` + halogen-flash-server | NPU XDNA2 (Strix Halo) | Apache-2.0 | 0 descargas, 1 like |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B | no disponible en esta ficha | safetensors, transformers / vLLM / TGI | GPU, CPU | Apache-2.0 | Modelo base original, ampliamente desplegado |
| peonist-ai/halogen-npu-qwen3-reranker-0.6b | 0,6 B | no disponible | `.hnpw`, mismo programa NPU | NPU XDNA2 | Apache-2.0 | Mismo autor, orientado a reordenación |
| peonist-ai/halogen-npu-qwen3guard-gen-0.6b | 0,6 B | no disponible | `.hnpw`, mismo programa NPU | NPU XDNA2 | Apache-2.0 | Mismo autor, orientado a moderación |

Frente al modelo base original, esta conversión pierde portabilidad total y gana aceleración NPU y coexistencia con el modelo generativo en el mismo puerto; no hay datos públicos que permitan comparar calidad de embeddings ni latencia entre ambas variantes.

## Limitaciones y advertencias

- Solo se carga dentro del contenedor `halogen-flash-server`; la propia model card advierte que no funciona en transformers ni en ningún otro runtime, y el widget de inferencia del Hub está desactivado a propósito.
- Dependencia estricta de hardware AMD XDNA2 y de un stack de controladores concreto (driver NPU, XRT con plugin NPU, reloj de fabric de la GPU sostenido); cualquier desviación de esa plataforma impide el despliegue.
- Acoplamiento a versiones: los ficheros de la cabeza del repositorio requieren servidor 0.18.12 o posterior, y cada versión del servidor descarga su propia revisión, por lo que actualizar el servidor implica revalidar checksums y espacio en disco.
- Ausencia total de benchmarks publicados: no hay evidencia de calidad de recuperación ni de latencia, lo que obliga a evaluar con un conjunto propio antes de producción.
- Madurez y adopción mínimas: 0 descargas y 1 like en el momento de la consulta, con publicación en octubre de 2026; es un artefacto de un proyecto comunitario, no un modelo oficial de Qwen.
- Cobertura de idiomas no declarada: aunque el modelo base es multilingüe, esta ficha no puede confirmar el comportamiento en castellano ni en idiomas distintos del inglés.
- El truncado de dimensiones vía `dimensions` reduce la precisión de la representación; la model card no documenta la curva de degradación, así que conviene validar el umbral elegido.
- Riesgo de alucinación no aplica directamente al ser un modelo de representación, pero sí el riesgo de recuperaciones erróneas: un embedding mediocre devuelve pasajes irrelevantes que el modelo generativo puede convertir en respuestas incorrectas.
- Licencia Apache-2.0 permite uso comercial, pero `devices/NOTICE.md` recoge avisos de terceros del programa NPU que deben conservarse y verificarse antes de redistribuir el contenedor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peonist-ai/halogen-npu-qwen3-embedding-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio del servidor: https://github.com/peonist-ai/halogen-flash-server
- Documentacion NPU del servidor: https://github.com/peonist-ai/halogen-flash-server/blob/main/docs/NPU.md
- Reranker del mismo stack: https://huggingface.co/peonist-ai/halogen-npu-qwen3-reranker-0.6b
- Modelo de moderacion del mismo stack: https://huggingface.co/peonist-ai/halogen-npu-qwen3guard-gen-0.6b
- Discord del proyecto: https://discord.gg/bcm6QknaV6
