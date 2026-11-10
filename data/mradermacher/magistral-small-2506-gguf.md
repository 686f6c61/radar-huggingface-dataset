# mradermacher/Magistral-Small-2506-GGUF

## Resumen

Magistral-Small-2506 es un modelo de lenguaje de tipo transformer denso desarrollado por Mistral AI, publicado originalmente el 10 de junio de 2025 y distribuido en formato GGUF por el usuario mradermacher. Se trata de la versión cuantizada del modelo base `mistralai/Magistral-Small-2506`, que cuenta con 23.572.403.200 parámetros totales (aproximadamente 23,6 mil millones). El repositorio ofrece cuantizaciones estáticas en formato GGUF pensadas para inferencia local eficiente con llama.cpp y herramientas compatibles.

El modelo está diseñado para tareas de razonamiento multi-paso, generación de código y conversación, e incorpora soporte para 24 idiomas, entre ellos el castellano, el inglés, el francés, el alemán, el japonés, el coreano, el ruso, el chino, el árabe y el hindi. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que lo convierte en una opción atractiva para despliegues en producción.

Este repositorio concreto es relevante porque facilita el despliegue del modelo en hardware de consumo mediante cuantizaciones que van desde 9 GB (Q2_K) hasta 25,2 GB (Q8_0), sin necesidad de GPUs de centro de datos. La ficha se centra en esta distribución GGUF, si bien las capacidades descritas corresponden al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), segun el modelo base Magistral-Small-2506 |
| Parametros totales | 23.572.403.200 (23,6 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn (24 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base `mistralai/Magistral-Small-2506`. Por los datos del repositorio se sabe que se trata de un transformer denso de 23,6 mil millones de parametros, sin mezcla de expertos (no MoE), y que utiliza el tokenizador `mistral-common`. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

El repositorio de mradermacher es una distribucion de cuantizaciones estaticas generadas a partir del modelo base, sin reentrenamiento ni modificacion de pesos mas alla de la cuantizacion. Se menciona la existencia de cuantizaciones ponderadas/imatrix en un repositorio hermano (`mradermacher/Magistral-Small-2506-i1-GGUF`), que suelen ofrecer mejor calidad que las estaticas de tamano similar. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en 24 idiomas, incluido el castellano.
- Razonamiento multi-paso y tareas que requieren cadenas de pensamiento, segun la orientacion del modelo base Magistral.
- Generacion y comprension de codigo, dado el enfoque de la familia Magistral en tareas de razonamiento y programacion.
- Soporte de tool calling / function calling mediante el tokenizador `mistral-common` y el formato conversacional de Mistral.
- Capacidades multilingues amplias: 24 idiomas listados, con cobertura de lenguas europeas, asiaticas y de Oriente Medio.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su integracion en servicios de inferencia.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede gestionar conversaciones multi-turno en castellano, ingles, frances, aleman y otros idiomas europeos, lo que permite desplegar un unico modelo para soporte en varias regiones sin necesidad de modelos separados por idioma.
- Generacion de codigo en pipelines de desarrollo: con soporte de tool calling y formato conversacional Mistral, puede integrarse en asistentes de IDE o en flujos de CI/CD para generar tests, documentacion o revisiones de codigo, ejecutandose localmente con cuantizaciones Q4_K_M (14,4 GB) en GPUs de consumo.
- Razonamiento y analisis documental: la orientacion a razonamiento multi-paso del modelo base lo hace adecuado para tareas de sintesis, extraccion de conclusiones y respuesta a preguntas sobre documentos, desplegado en servidores con una sola GPU de 24 GB usando Q5_K_M o Q6_K.
- Despliegue en entornos con requisitos de soberania de datos: al ser Apache 2.0 y ejecutable con llama.cpp, permite procesar informacion sensible en infraestructura propia sin enviar datos a APIs externas, algo relevante para sectores regulados.
- Prototipado e investigacion en hardware de consumo: las cuantizaciones Q2_K (9 GB) y Q3_K_S (10,5 GB) permiten ejecutar el modelo en GPUs de 12-16 GB, facilitando experimentos academicos sin acceso a clusters.
- Traduccion y localizacion asistida: con 24 idiomas soportados, puede emplearse para traduccion borrador y adaptacion de contenido, revisada posteriormente por traductores humanos, especialmente en combinaciones con el castellano.
- Asistentes conversacionales embebidos: la disponibilidad de cuantizaciones pequenas y la compatibilidad con llama.cpp permiten integrar el modelo en aplicaciones de escritorio o servidores modestos con requisitos de latencia moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y ventana de contexto):
  - Q2_K: ~9 GB
  - Q3_K_S: ~10,5 GB
  - Q3_K_M: ~11,6 GB
  - Q3_K_L: ~12,5 GB
  - IQ4_XS: ~13 GB
  - Q4_K_S: ~13,6 GB
  - Q4_K_M: ~14,4 GB
  - Q5_K_S: ~16,4 GB
  - Q5_K_M: ~16,9 GB
  - Q6_K: ~19,4 GB
  - Q8_0: ~25,2 GB
- GPU recomendadas: para Q8_0 o Q6_K, una RTX 4090 (24 GB) o A100/H100; para Q4_K_M, una RTX 4090 o RTX 3090 (24 GB) con margen para contexto; para Q2_K/Q3_K_S, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q6_K, y en GPUs de 12-16 GB con cuantizaciones Q2_K a Q3_K_S.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Magistral-Small-2506 (este repo, GGUF) | 23,6 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas, 24 idiomas |
| mistralai/Magistral-Small-2506 (base) | 23,6 B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| mradermacher/Magistral-Small-2506-i1-GGUF | 23,6 B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas, mayor calidad |
| Alternativas de ~20-30 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad respecto al modelo original; para produccion se recomienda Q4_K_M o superior.
- No se dispone de informacion sobre sesgos especificos del modelo base ni sobre evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- La longitud de contexto no esta indicada en la informacion disponible, por lo que debe consultarse la model card del modelo base antes de disenar aplicaciones que dependan de ventanas largas.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base original y de las dependencias (tokenizador `mistral-common`).
- Las cuantizaciones estaticas pueden presentar mayor perplejidad que las imatrix del repositorio hermano; se recomienda evaluar ambas antes de fijar una version en produccion.
- El rendimiento en idiomas distintos del ingles puede variar y no se documenta por idioma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Magistral-Small-2506-GGUF
- Modelo base: https://huggingface.co/mistralai/Magistral-Small-2506
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Magistral-Small-2506-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Magistral-Small-2506-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
