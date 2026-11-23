# mradermacher/atom-proton-1.2-GGUF

## Resumen

`mradermacher/atom-proton-1.2-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `CrowtherLabs/atom-proton-1.2`, un modelo vision-language con capacidades de razonamiento desarrollado por CrowtherLabs. El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF para inferencia local, que en este caso ofrece el modelo en 11 niveles de cuantización distintos más dos ficheros `mmproj` (proyector multimodal) en Q8_0 y f16.

El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), lo que lo sitúa en la gama de modelos densos de gran tamano aptos para despliegue en GPUs de centro de datos o en configuraciones multi-GPU de consumo. La ficha del autor lo etiqueta como `atom`, `crowther`, `vision-language` y `reasoning`, lo que indica que combina procesamiento de imagen y texto con modos de razonamiento explícito. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta publicación radica en que pone a disposición de la comunidad de inferencia local (llama.cpp, Ollama, LM Studio, etc.) un modelo multimodal de 27B que de otro modo solo estaría disponible en formato `safetensors` para `transformers`. Al incluir los ficheros `mmproj`, se habilita el procesamiento de imágenes directamente en entornos GGUF. El repo tiene un tamano total de 192,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como vision-language y reasoning; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Las etiquetas del repo (`vision-language`, `reasoning`, `atom`, `crowther`) indican que se trata de un modelo multimodal que acepta entradas de imagen y texto, y que incorpora algun modo de razonamiento. El recuento de parámetros (27,3 B) y la presencia de un proyector multimodal (`mmproj`) confirman una arquitectura de tipo transformer con encoder visual acoplado, aunque no se especifica si el encoder es un ViT, un SigLIP u otra variante.

Tampoco se detallan en la informacion disponible los datos de entrenamiento (número de tokens, composición del dataset), ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. La model card del cuantizador se limita a indicar que se trata de cuantizaciones estáticas del modelo original, sin aportar información sobre el proceso de entrenamiento. No se han publicado innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en los materiales consultados.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repo.
- Procesamiento de imágenes y texto (vision-language): los ficheros `mmproj` permiten pasar imágenes al modelo en entornos GGUF.
- Razonamiento explícito: la etiqueta `reasoning` sugiere soporte de modos de pensamiento o cadenas de razonamiento, aunque no se detalla el mecanismo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de APIs compatibles con el formato de Hugging Face.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado explícitamente; la etiqueta `reasoning` es la única indicación.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (audio, thinking mode explícito, etc.): no disponible.

## Casos de uso

- **Asistente multimodal local en estación de trabajo**: con la cuantización Q4_K_M (17,1 GB) el modelo cabe en una GPU de 24 GB (RTX 4090, A10G) y permite consultas sobre imágenes y texto sin depender de la nube, útil para entornos con requisitos de privacidad.
- **Análisis documental con OCR implícito**: el modelo puede recibir capturas o escaneos y responder preguntas sobre su contenido, integrándose en pipelines de extracción de información donde no se quiera enviar documentos a APIs externas.
- **Razonamiento sobre diagramas técnicos**: gracias a la combinación de visión y razonamiento, puede emplearse para interpretar esquemas, gráficos o diagramas de arquitectura y generar explicaciones en inglés.
- **Prototipado rápido con llama.cpp u Ollama**: al estar disponible en GGUF con múltiples niveles de cuantización, permite iterar desde un portátil con GPU de 12 GB (Q3_K_S, 12,4 GB) hasta servidores con A100 para la versión Q8_0 (29,1 GB).
- **Generación de descripciones de imágenes a escala**: para catalogación de imágenes, alt-text o moderación asistida, ejecutando el modelo en local con el `mmproj` en Q8_0 (0,7 GB) para minimizar el coste del proyector.
- **Evaluación comparativa de cuantizaciones**: útil para investigadores que quieran medir la degradación de calidad entre Q2_K y Q8_0 en tareas de razonamiento multimodal, dado el amplio espectro de cuantizaciones ofrecidas.
- **Base para fine-tuning o destilación**: aunque el formato GGUF no es directamente entrenable, el modelo base en safetensors (Apache 2.0) puede servir como punto de partida para ajustes posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (solo pesos, sin overhead de contexto):
  - Q2_K: ~11,3 GB
  - Q3_K_S: ~12,4 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~17,1 GB
  - Q5_K_M: ~19,7 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - Añadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16) si se usa entrada de imagen.
- **GPU recomendadas**:
  - RTX 4090 (24 GB): Q4_K_M, Q5_K_M e incluso Q6_K con contexto moderado.
  - RTX 3090 (24 GB): mismas opciones que la 4090.
  - A100 40 GB / H100: Q8_0 con contexto amplio y margen para KV cache.
  - GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080): Q3_K_S o Q4_K_S con contexto reducido.
- **¿Cabe en GPU de consumo?** Sí: las cuantizaciones Q2_K a Q6_K caben en GPUs de 12 a 24 GB. Q8_0 requiere 32 GB o más, por lo que queda fuera de la mayoría de GPUs de consumo.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llama-cpp-python; para el modelo base en safetensors, vLLM o TGI (siempre que soporten la arquitectura, no confirmado).
- **Latencia y throughput**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus competidores directos en la informacion proporcionada. A continuación se ofrece una comparación estructural basada únicamente en datos verificables de esta ficha:

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| atom-proton-1.2 (este) | ~27,3 B | no disponible | Sí (mmproj) | Apache 2.0 | Sí (11 cuantizaciones) |
| Alternativas de ~27-30 B densos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables con datos verificables de parámetros, contexto y licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- **Idioma**: el modelo está etiquetado únicamente para inglés (`language: en`); el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- **Ausencia de benchmarks**: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, por lo que no se puede verificar la calidad real del modelo frente a alternativas.
- **Cuantizaciones de baja precisión**: Q2_K y Q3_K_S pueden degradar notablemente el razonamiento y la fidelidad multimodal; el propio autor marca Q3_K_M como "lower quality". Para producción se recomienda Q4_K_M o superior.
- **Riesgo de alucinación**: inherente a los modelos generativos; no se dispone de información sobre mitigaciones específicas (RLHF, filtros, etc.).
- **Sesgos**: no se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- **Contexto**: se desconoce la longitud máxima de contexto soportada, lo que impide planificar despliegues con documentos largos.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (`CrowtherLabs/atom-proton-1.2`) por si añade restricciones adicionales.
- **Soporte de tooling**: no se confirma soporte de function calling ni de protocolos de agentes; no asumir compatibilidad con frameworks de agentes sin validación previa.
- **Madurez del repo**: 0 descargas y 0 likes en el momento de la consulta; es una publicación reciente y sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/atom-proton-1.2-GGUF
- Modelo base: https://huggingface.co/CrowtherLabs/atom-proton-1.2
- Página de descargas del cuantizador: https://hf.tst.eu/model#atom-proton-1.2-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Web de nethype GmbH: https://www.nethype.de/
