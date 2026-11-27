# mradermacher/Tenet-26B-A3B-Inkling2-Unslop-v3-GGUF

## Resumen

Tenet-26B-A3B-Inkling2-Unslop-v3 es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 26.070.385.152 parámetros totales y, según la nomenclatura "A3B", aproximadamente 3.000 millones de parámetros activos por token. Se distribuye como un fine-tuning del modelo base mr-andrey-isachenko/Tenet-26B-A3B-Inkling2-Unslop-v3, que a su vez parte de la familia Tenet/Lancet. La versión aquí documentada es la cuantización GGUF estática realizada por mradermacher, publicada el 27 de noviembre de 2026, pensada para inferencia local y despliegue en servidores con llama.cpp y entornos compatibles.

El modelo se presenta con etiquetas que indican un enfoque claramente orientado a uso agéntico: "agentic", "tool-use", "coding", "abliterated" y "uncensored". Esto sugiere que el fine-tuning ha eliminado total o parcialmente los mecanismos de rechazo (abliteration) y ha reforzado las capacidades de llamada a herramientas y razonamiento multi-paso, presumiblemente mediante técnicas de RL como GRPO (mencionado en los tags). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha reside en que combina una arquitectura MoE relativamente eficiente (26B totales, ~3B activos) con cuantizaciones GGUF que van desde 11,0 GB (Q2_K) hasta 27,9 GB (Q8_0), lo que la hace desplegable en hardware de consumo de gama alta y en GPUs profesionales. El idioma declarado es únicamente inglés, lo que limita su uso en castellano sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer; familia Tenet/Lancet |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | ~3B (según nomenclatura "A3B"; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 190,5 GB |
| Pipeline | no disponible |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de Mixture of Experts, coherente con la designación "26B-A3B": 26.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. La familia Tenet/Lancet no está documentada en la información proporcionada, por lo que no se dispone de detalles sobre el número de expertos, la estrategia de enrutamiento ni el número de capas. El modelo incluye un suplemento multimodal (archivos mmproj), lo que indica capacidad de procesamiento de visión además de texto, aunque la model card no lo detalla.

En cuanto al entrenamiento, los tags revelan el uso de GRPO (Group Relative Policy Optimization) para el ajuste, así como un proceso de "abliteration" que elimina las capas de rechazo del modelo alineado original. El sufijo "Unslop-v3" sugiere una iteración de fine-tuning destinada a reducir respuestas genéricas o evasivas. No se dispone del número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RLHF/DPO. La cuantización GGUF la ha realizado mradermacher con cuantizaciones estáticas (no se han publicado variantes con imatrix/weighted en el momento de la ficha).

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento multi-paso y uso agéntico (tags "agentic").
- Llamada a herramientas y function calling (tags "tool-use").
- Generación de código (tags "coding").
- Capacidad multimodal (visión) mediante el suplemento mmproj incluido en el repo.
- Modo sin censura / abliterated: ausencia de mecanismos de rechazo en las respuestas.
- Compatible con endpoints (tag "endpoints_compatible") y con vLLM según los tags del modelo base.
- No se declaran capacidades de audio ni de otros idiomas distintos del inglés.

## Casos de uso

- Agentes autónomos de código: el modelo puede integrarse en pipelines de CI/CD para revisar parches, generar tests o resolver issues, apoyándose en su capacidad de tool calling y en su naturaleza agéntica para encadenar pasos.
- Automatización de tareas de desarrollo con herramientas: uso como motor de function calling en asistentes que consultan APIs, ejecutan comandos o interactúan con repositorios, gracias a las etiquetas "agentic" y "tool-use".
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (17,6 GB) o Q5_K_M (20,0 GB) cabe en GPUs de consumo de gama alta (24 GB), lo que permite ejecutar el modelo sin conexión y sin coste por token.
- Procesamiento de documentos con imágenes: la inclusión de mmproj permite extraer información de capturas, diagramas o PDFs escaneados combinando texto y visión en un único modelo.
- Generación de contenido sin restricciones de rechazo: útil en entornos de investigación que requieren respuestas directas sin filtros de seguridad, siempre que se asuma el riesgo asociado.
- Servicio de inferencia en producción con vLLM: el tag "endpoints_compatible" y la referencia a vLLM indican que el modelo base puede servirse con motores de alto rendimiento, adecuado para backends de asistentes conversacionales en inglés.
- Experimentación con arquitecturas MoE eficientes: el ratio ~3B activos sobre 26B totales permite estudiar el equilibrio entre calidad y coste computacional en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización GGUF):
  - Q2_K: ~11,0 GB.
  - Q3_K_M: ~13,8 GB.
  - Q4_K_S: ~16,2 GB.
  - Q4_K_M: ~17,6 GB (recomendada por el autor como "fast, recommended").
  - Q5_K_M: ~20,0 GB.
  - Q6_K: ~23,6 GB.
  - Q8_0: ~27,9 GB.
  - Suplemento multimodal: +0,4 GB (mmproj-Q8_0) o +0,7 GB (mmproj-f16).
- GPU recomendadas:
  - Consumer: RTX 3090 / RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 5090 o GPUs de 32 GB para Q6_K y Q8_0.
  - Profesionales: A100 40/80 GB, H100 80 GB para FP16/BF16 del modelo base y para servir con vLLM.
- Cabe en consumer GPU: sí, en GPUs de 16-24 GB con cuantizaciones Q4 y Q5; en 12 GB solo con Q2_K o Q3_K_S y riesgo de degradación.
- Opciones de despliegue: llama.cpp, Ollama (a partir de los GGUF), vLLM (modelo base en safetensors, tag "vllm"), y endpoints compatibles (tag "endpoints_compatible").
- Latencia y throughput: no disponibles en la información proporcionada; al ser MoE con ~3B activos, se espera un throughput superior al de un modelo denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Tenet-26B-A3B-Inkling2-Unslop-v3 (este) | ~26B | ~3B | no disponible | Apache 2.0 | GGUF, safetensors | MoE agéntico, abliterated, multimodal |
| Modelo base mr-andrey-isachenko/Tenet-26B-A3B-Inkling2-Unslop-v3 | ~26B | ~3B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar; referencia directa |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idioma: solo se declara inglés; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Alucinación: al ser un modelo abliterated/uncensored, la ausencia de mecanismos de rechazo puede aumentar la probabilidad de respuestas incorrectas o inventadas sin advertencia.
- Sesgos: no se documentan los datos de entrenamiento ni los procesos de mitigación de sesgos; el fine-tuning "unslop" y la abliteration pueden amplificar sesgos presentes en el corpus original.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datasets subyacentes podrían tener restricciones adicionales no reflejadas en la model card.
- Contexto: la longitud de contexto no está publicada; no debe asumirse una ventana larga sin verificación empírica.
- Cuantizaciones: las versiones Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superior para uso práctico.
- Reproducibilidad: el repo tiene 0 descargas y 1 like, sin benchmarks publicados; la validación en producción corre por cuenta del usuario.
- Multimodalidad: el suplemento mmproj está incluido, pero no se documenta el rendimiento en tareas de visión.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Tenet-26B-A3B-Inkling2-Unslop-v3-GGUF
- Modelo base: https://huggingface.co/mr-andrey-isachenko/Tenet-26B-A3B-Inkling2-Unslop-v3
- Página de resumen del cuantizador: https://hf.tst.eu/model#Tenet-26B-A3B-Inkling2-Unslop-v3-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfica de comparación de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
