# mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-i1-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-v3.1 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por kataguru, especializado en programación industrial, automatización y sistemas. La versión aquí descrita es una cuantización GGUF con imatrix realizada por mradermacher, publicada bajo licencia Apache 2.0. El modelo base cuenta con 35.247.133.824 parámetros totales (35B) con aproximadamente 3B parámetros activos por token, siguiendo la arquitectura Qwen3.5 MoE según las etiquetas del repositorio.

El modelo está orientado a tareas de codificación en entornos industriales: PLC, CNC, G-code, IEC 61131-3, Structured Text, TwinCAT, Beckhoff, Siemens SCL, OPC-UA, EtherCAT y PROFINET, además de programación de sistemas en Rust, C++ y Python. También declara capacidades de tool calling, function calling, razonamiento agéntico, RAG, matemáticas, razonamiento STEM y visión (es un modelo multimodal según la model card). Soporta inglés y finés.

La relevancia de esta ficha radica en que se trata de una cuantización práctica para despliegue local: mradermacher ofrece un abanico de cuantizaciones i1 (imatrix) desde Q2_K hasta Q6_K, lo que permite ejecutar un modelo de 35B en hardware de consumo con pérdidas controladas de calidad. Es una opción poco habitual por su especialización vertical en automatización industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), etiquetada como qwen3_5_moe |
| Parametros totales | 35.247.133.824 (35B) |
| Parametros activos | aproximadamente 3B (según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, más imatrix |
| Idiomas soportados | inglés (en) y finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer con mezcla de expertos (MoE), etiquetada en el repositorio como `qwen3_5_moe`. Con 35B parámetros totales y aproximadamente 3B activos por token, el coste computacional por inferencia es comparable al de un modelo denso de 3B, mientras que la capacidad representacional se aproxima a la de un modelo de 35B. El repositorio declara pesos en BF16 (bfloat16) y safetensors, con soporte para vLLM.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Las etiquetas indican orientación a código industrial, sistemas, tool calling, agentes, RAG, STEM y multimodalidad con visión, pero no se especifican los detalles del pipeline de entrenamiento ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.).

Esta versión concreta es una cuantización GGUF con imatrix generada por mradermacher a partir del modelo base `kataguru/Kataguru-Sceptic-35B-A3B-v3.1`. Los ficheros mmproj para la parte de visión, si existen, se alojan en el repositorio estático de cuantizaciones (`mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-GGUF`).

## Capacidades

- Generación de texto y razonamiento general, con énfasis declarado en razonamiento STEM y matemáticas.
- Generación de código en lenguajes de sistemas: Rust, C++ y Python.
- Programación industrial: PLC, CNC, G-code, IEC 61131-3, Structured Text, TwinCAT, Beckhoff y Siemens SCL.
- Protocolos y automatización industrial: OPC-UA, EtherCAT y PROFINET.
- Tool calling y function calling, con etiqueta explícita `tool-calling` y `function-calling`.
- Capacidades agénticas y razonamiento multi-paso (etiquetas `agentic` y `rag`).
- Multimodalidad con visión (etiquetas `multimodal`, `vision`, `vision-language`); los ficheros mmproj estarían en el repositorio estático.
- Capacidades multilingües limitadas a inglés y finés.
- Modelo etiquetado como `uncensored` y `conversational`.
- Seguridad funcional (`functional-safety`) como área de especialización declarada.

## Casos de uso

- Generación y revisión de código PLC en IEC 61131-3 y Structured Text: el modelo puede producir y auditar lógica de control para autómatas, aprovechando su especialización declarada en TwinCAT y Beckhoff, lo que reduce el tiempo de desarrollo en ingeniería de automatización.
- Programación de CNC y generación de G-code: útil para traducir especificaciones de mecanizado a instrucciones G-code, un nicho poco cubierto por modelos generalistas.
- Integración con sistemas SCADA y OPC-UA: el modelo puede asistir en la generación de código de cliente/servidor OPC-UA y en la configuración de comunicaciones industriales (EtherCAT, PROFINET).
- Asistente de programación de sistemas en Rust, C++ y Python: generación de código, revisión y refactorización en proyectos de sistemas donde el rendimiento y la seguridad de memoria son críticos.
- Agentes autónomos con tool calling: al soportar function calling y razonamiento multi-paso, puede integrarse en pipelines agénticos que consulten APIs, ejecuten comandos o consulten documentación técnica mediante RAG.
- Documentación técnica y RAG sobre manuales industriales: con etiqueta `rag`, puede emplearse para responder preguntas sobre normativa, protocolos y manuales de fabricantes (Siemens, Beckhoff) combinando recuperación de documentos y generación.
- Análisis de imágenes técnicas (visión): al ser multimodal, puede procesar diagramas, esquemas eléctricos o capturas de HMI, siempre que se disponga del fichero mmproj correspondiente del repositorio estático.
- Despliegue local en entornos con requisitos de privacidad: al ser GGUF y Apache 2.0, puede ejecutarse en infraestructura propia sin enviar datos industriales sensibles a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-Q2_K ~13,3 GB; i1-IQ3_S ~15,6 GB; i1-Q4_K_M ~21,7 GB; i1-Q5_K_M ~25,3 GB; i1-Q6_K ~29,1 GB. A estas cifras hay que sumar el overhead de contexto KV cache.
- GPU recomendadas: para Q4_K_M o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite Q4_K_M con contexto moderado; Q5_K_M y Q6_K requieren 32 GB o más (A100 40 GB, H100, RTX 5090 si se dispone de 32 GB). Para Q2_K e IQ3_S, GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) pueden ser suficientes.
- Cabe en GPU de consumo: sí, en cuantizaciones bajas y medias (Q2_K a Q4_K_M) en GPUs de 16-24 GB. Las cuantizaciones Q5_K_M y Q6_K requieren GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM está etiquetado en el repositorio base (para pesos BF16/safetensors); también es compatible con endpoints estándar según la etiqueta `endpoints_compatible`. Para la parte de visión se requiere el fichero mmproj del repositorio estático.
- Latencia y throughput estimados: no disponibles. Al ser MoE con ~3B parámetros activos, el throughput por token debería ser sustancialmente mayor que el de un denso de 35B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-v3.1 (esta ficha) | 35B | ~3B | no disponible | Apache 2.0 | GGUF (i1), safetensors BF16 | Especializado en automatización industrial y código de sistemas |
| Qwen3 MoE (familia base declarada) | variable | variable | no disponible | Apache 2.0 (según variante) | safetensors, GGUF | Arquitectura de referencia; el modelo se etiqueta como qwen3_5_moe |
| Modelos densos de ~30-35B (p. ej. familia Qwen o Llama) | ~30-35B | densos | variable | variable | safetensors, GGUF | Mayor coste por token al no ser MoE; sin especialización industrial declarada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo etiquetado como `uncensored`, puede producir contenido sin los filtros habituales de alineación, lo que exige revisión en producción.
- Riesgo de alucinación: no cuantificado; en dominios técnicos regulados (seguridad funcional, automatización industrial) cualquier salida debe ser validada por ingenieros cualificados antes de su uso.
- Limitaciones de idioma: solo inglés y finés declarados; el castellano no figura como idioma soportado, por lo que su rendimiento en español es incierto.
- Longitud de contexto: no disponible; no se puede garantizar el manejo de documentos largos o conversaciones multi-turno extensas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datos de entrenamiento originales.
- La parte de visión requiere ficheros mmproj alojados en el repositorio estático; sin ellos, el modelo funciona solo como texto.
- Es una cuantización: las versiones de baja precisión (Q2_K, IQ3) degradan la calidad respecto al modelo BF16 original.
- No hay información sobre el proceso de entrenamiento ni sobre evaluaciones de seguridad; el despliegue en entornos críticos debe hacerse con supervisión humana.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-i1-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Kataguru-Sceptic-35B-A3B-v3.1-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
