# mradermacher/Xing-VL2.0-Decision-GGUF

## Resumen

Xing-VL2.0-Decision-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo multimodal RBDash-Team/Xing-VL2.0-Decision, publicada por el usuario mradermacher, especializado en convertir pesos de HuggingFace a GGUF para inferencia local. El modelo original es un modelo de visión-lenguaje (VLM) orientado a tareas de decisión y clasificación (etiquetas `decision-index`, `classification`, `multimodal`, `vision`, `conversational`), con 26.895.998.464 parámetros (~26,9 B) según los safetensors del repositorio base.

El problema que resuelve esta publicación no es el entrenamiento del modelo, sino su explotación práctica: permite ejecutar un VLM de ~27 B en hardware de consumo o en servidores sin GPUs de gama alta, gracias a 11 cuantizaciones que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), más dos variantes del proyector multimodal (`mmproj` en Q8_0 y f16). Es relevante para quien necesite clasificación y toma de decisiones sobre imágenes con despliegue local, sin depender de APIs propietarias.

La licencia es Apache 2.0 y el único idioma declarado es inglés (`en`). No se dispone de información sobre arquitectura interna, longitud de contexto, datos de entrenamiento ni resultados de benchmarks en la documentación proporcionada, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-lenguaje; no se detalla en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal `mmproj` en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers como libreria declarada; el repositorio base usa safetensors) |

Datos adicionales: repositorio de 187,9 GB (suma de todas las cuantizaciones y del modelo en precisión original), 0 descargas y 1 like en el momento del registro, creado el 2026-10-27. El autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación ("weighted/imatrix quants seem not to be available (by me) at this time").

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base RBDash-Team/Xing-VL2.0-Decision en la documentación disponible: no se especifica si es un transformer denso, un MoE, un híbrido SSM ni cómo se integra el codificador visual con el modelo de lenguaje. Las etiquetas del repositorio (`multimodal`, `vision`, `decision-index`, `classification`) confirman que se trata de un modelo de visión-lenguaje con capacidad conversacional y con un componente específico de decisión/clasificación, pero no permiten inferir detalles de diseño.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). Lo único documentado a nivel técnico es el proceso de cuantización realizado por mradermacher: cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) generadas a partir de los pesos del modelo base, más un fichero `mmproj` separado que contiene el proyector multimodal y que es imprescindible para el procesamiento de imágenes.

## Capacidades

- Procesamiento de imágenes y texto de forma conjunta (modelo multimodal con codificador visual y proyector `mmproj`).
- Clasificación y toma de decisiones sobre entradas visuales, según las etiquetas `classification` y `decision-index` del repositorio.
- Generación de texto conversacional (etiqueta `conversational`), apta para diálogo multi-turno.
- Salida estructurada orientada a índices de decisión (el autor etiqueta el modelo como `decision-model`), sin que se detalle el esquema exacto en la información disponible.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, audio, vídeo): no disponibles (no documentadas).

## Casos de uso

- Clasificación automática de imágenes en pipelines de ingesta: el modelo puede recibir una imagen y devolver una decisión categórica, lo que permite etiquetar grandes volúmenes de contenido visual en local antes de indexarlo en un sistema de búsqueda o un almacén de datos.
- Triaje de documentos escaneados: al combinar lectura visual y decisión, se puede usar para decidir a qué cola o departamento enrutar un formulario, una factura o una reclamación a partir de su aspecto y contenido, sin enviar los documentos a una API externa.
- Control de calidad visual en entornos industriales o de retail: verificación de que un producto, un lineal o una etiqueta cumple un criterio predefinido y emisión de una decisión binaria o categórica por imagen, ejecutable en hardware local junto a la cámara.
- Moderación y filtrado de contenido gráfico: clasificación de imágenes subidas por usuarios para decidir si se publican, se revisan manualmente o se bloquean, usando la cuantización Q4_K_M (16,6 GB) en una GPU de 24 GB.
- Enrutado de decisiones en asistentes conversacionales: dado un mensaje con una captura de pantalla o una foto, el modelo decide la intención y la acción siguiente dentro de un flujo de atención al cliente, manteniendo el diálogo en inglés.
- Prototipado e investigación en entornos sin conectividad: con la cuantización Q2_K (10,8 GB) más el `mmproj` f16 (1,0 GB) se puede desplegar el modelo en una estación de trabajo modesta o en un portátil con GPU de 12-16 GB para experimentar con tareas de decisión multimodal antes de escalar a la versión completa.
- Evaluación comparativa de cuantizaciones: el repositorio permite medir la degradación de calidad entre Q2_K y Q8_0 sobre el mismo conjunto de imágenes, útil para calibrar qué nivel de compresión tolera una tarea de clasificación concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de visión, y la información proporcionada no contiene la model card del modelo base RBDash-Team/Xing-VL2.0-Decision, donde podrían aparecer.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + proyector + caché KV, valores orientativos a partir de los tamaños de fichero publicados):
  - Q2_K: 10,8 GB de pesos + 0,7-1,0 GB de `mmproj` → ~13-14 GB en total con contexto moderado.
  - IQ4_XS: 15,3 GB + `mmproj` → ~18-19 GB.
  - Q4_K_M: 16,6 GB + `mmproj` → ~19-21 GB.
  - Q5_K_M: 19,3 GB + `mmproj` → ~22-24 GB.
  - Q6_K: 22,2 GB + `mmproj` → ~25-27 GB.
  - Q8_0: 28,7 GB + `mmproj` → ~31-33 GB.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 y para precisión completa; L40S/RTX A6000 (48 GB) para Q6_K y Q8_0 con contexto amplio; RTX 3090/4090 (24 GB) para Q4_K_S, Q4_K_M y, con contexto reducido, Q5_K_M.
- Cabe en GPU de consumo: sí. RTX 3090/4090 (24 GB) ejecutan Q4_K_M con holgura; RTX 4080/4070 Ti Super (16 GB) quedan justas para Q4_K_S (15,7 GB) y obligan a contexto corto o a descargar el `mmproj` parcialmente; GPUs de 12 GB solo admiten Q2_K o Q3_K_S con contexto muy limitado.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y de `mmproj` con `llama-mtmd-cli`/servidor), Ollama y LM Studio (importando el GGUF y el proyector), llama-cpp-python para integración en Python. vLLM solo con soporte GGUF experimental y no recomendado para este caso; TGI no soporta GGUF. Para máxima fidelidad, usar los safetensors del modelo base con transformers.
- Latencia y throughput: no disponibles (no se han publicado mediciones). Como referencia estructural, un modelo denso de ~27 B en Q4_K_M en una RTX 4090 queda limitado por ancho de banda de memoria, pero no hay cifras verificadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing-VL2.0-Decision (este, GGUF) | 26,9 B | no disponible | no disponible | Apache 2.0 | GGUF en HF (11 cuantizaciones) |
| RBDash-Team/Xing-VL2.0-Decision (base) | 26,9 B | no disponible | no disponible | Apache 2.0 | Safetensors en HF |
| Qwen2.5-VL-32B | no verificado en la informacion disponible | no disponible | no disponible | no disponible en la informacion | Referencia de categoria VLM de escala similar |
| InternVL2.5-26B | no verificado en la informacion disponible | no disponible | no disponible | no disponible en la informacion | Referencia de categoria VLM de escala similar |
| Gemma 3 27B | no verificado en la informacion disponible | no disponible | no disponible | no disponible en la informacion | Referencia de categoria multimodal de escala similar |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa (contexto, benchmarks, licencia exacta) queda como no disponible. La comparación fiable se limita al modelo base frente a su versión cuantizada: mismos parámetros y licencia, con pérdida de precisión progresiva desde Q8_0 hasta Q2_K.

## Limitaciones y advertencias

- Idioma: el campo `language` solo declara inglés; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en clasificación, decisión o conversación, ni del efecto de la cuantización sobre la precisión en tareas concretas.
- Riesgo de alucinación: al ser un modelo generativo, puede producir decisiones o justificaciones plausibles pero incorrectas; en clasificación crítica conviene validar con umbrales de confianza y revisión humana.
- Sesgos: no disponibles. No se documenta la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos, culturales o visuales.
- Limitaciones de contexto: la longitud de contexto no está publicada; planificar despliegues asumiendo ventanas moderadas y verificar experimentalmente antes de producción.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma notable en modelos de este tamaño; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como opción rápida y Q6_K/Q8_0 como mejor calidad.
- Dependencia del `mmproj`: sin el fichero proyector multimodal (0,7-1,0 GB adicionales) el modelo no procesa imágenes; hay que descargarlo y configurarlo explícitamente en llama.cpp/Ollama.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero exige conservar el aviso de copyright y el fichero NOTICE, y no concede garantías; conviene verificar las condiciones del modelo base por si añade restricciones adicionales.
- Metadatos a revisar: la fecha de creación del repositorio (2026-10-27), el contador de descargas (0) y el tamaño del repositorio (187,9 GB) indican un artefacto muy reciente y poco validado por la comunidad.
- Sin cuantizaciones imatrix/ponderadas: el autor advierte que podrían no publicarse, de modo que no hay una versión de calidad superior a las estáticas para tamaños pequeños.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Xing-VL2.0-Decision-GGUF
- Modelo base: https://huggingface.co/RBDash-Team/Xing-VL2.0-Decision
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Xing-VL2.0-Decision-GGUF
- Guía de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que cede infraestructura al autor: https://www.nethype.de/
- Papers, blogs o demos adicionales: no disponible (la búsqueda web no devolvió resultados relacionados con el modelo).
