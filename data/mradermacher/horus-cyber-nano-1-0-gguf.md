# mradermacher/Horus-Cyber-Nano-1.0-GGUF

## Resumen

Horus-Cyber-Nano-1.0 es un modelo de lenguaje especializado en ciberseguridad, desarrollado por tokenai (tokenaii) y publicado originalmente en Hugging Face bajo el identificador `tokenaii/Horus-Cyber-Nano-1.0`. La versión aquí descrita es la cuantización GGUF realizada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. El modelo declara una arquitectura de tipo Mixture of Experts (MoE) y capacidades multimodales, orientadas a tareas de red-team, análisis de terminal, uso de herramientas y generación de código.

Con aproximadamente 15.960 millones de parámetros totales según los pesos en safetensors, el modelo se posiciona en la franja de los 16B, un tamaño que permite ejecución en GPUs de consumo con cuantizaciones agresivas. Su enfoque declarado es la ciberseguridad, lo que incluye escenarios de pentesting, análisis de vulnerabilidades y automatización de flujos de trabajo en terminal. La licencia es personalizada (`tokenai-custom-license`), lo que obliga a revisar los términos antes de cualquier uso comercial.

La relevancia actual del modelo radica en la creciente demanda de asistentes especializados en seguridad que puedan integrarse en pipelines de agentes con tool calling y contexto de terminal. No obstante, la información pública disponible es escasa: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks, lo que limita una evaluación rigurosa de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) según tags del autor; detalles no disponibles |
| Parametros totales | 15.960.110.208 (≈15,96B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (en) |
| Licencia | tokenai-custom-license (other) |
| Formato de pesos | GGUF (cuantizaciones estáticas); safetensors en el modelo base |
| Modelo base | tokenaii/Horus-Cyber-Nano-1.0 |
| Tamano del repo | 116,4 GB |
| Descargas | 398 |
| Fecha de creacion | 2026-09-08 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

El autor declara una arquitectura de tipo Mixture of Experts (MoE) en los tags del modelo, aunque no se especifican el número de expertos, el número de parámetros activos por token ni la estrategia de enrutamiento. Tampoco se detalla si emplea atención lineal, decodificación especulativa u otras innovaciones. La presencia de archivos `mmproj` (multi-modal supplement) en las cuantizaciones confirma que el modelo incorpora un proyector multimodal, probablemente para entrada de imágenes, aunque no se especifica qué codificador visual utiliza.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Los tags indican especialización en ciberseguridad, código, red-team, terminal y tool-use, lo que sugiere un entrenamiento orientado a dominios técnicos, pero se trata de una inferencia a partir de metadatos y no de datos verificables. La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf) y se ofrece además una variante con quants ponderados/imatrix en el repositorio `mradermacher/Horus-Cyber-Nano-1.0-i1-GGUF`.

## Capacidades

- Generación de texto conversacional en inglés, con formato compatible con endpoints y pipeline conversacional.
- Especialización declarada en ciberseguridad: análisis de vulnerabilidades, red-team y tareas ofensivas/defensivas.
- Generación y análisis de código, orientado a scripting y automatización técnica.
- Soporte de tool calling / function calling, según los tags `tool-use` y `endpoints_compatible`.
- Capacidad multimodal: los archivos `mmproj` indican entrada de imágenes además de texto.
- Operación en terminal: el tag `terminal` sugiere entrenamiento o ajuste para comandos de shell y flujos de trabajo CLI.
- Razonamiento multi-paso y uso como agente, implícito en la combinación de tool-use y terminal, aunque no se documenta explícitamente.
- Capacidades multilingües limitadas al inglés según el campo `language`.

## Casos de uso

- Asistente de pentesting automatizado: el modelo puede generar y explicar comandos de terminal, encadenar herramientas de reconocimiento y sugerir siguientes pasos en un flujo de red-team, aprovechando su especialización declarada y el soporte de tool calling.
- Análisis de código orientado a seguridad: revisión de scripts y fragmentos de código para detectar patrones inseguros, inyecciones o malas prácticas, integrable en pipelines de CI/CD mediante llamadas a la API compatible con endpoints.
- Automatización de tareas de terminal: generación de comandos de shell y secuencias de administración de sistemas, con la ventaja de un modelo pequeño (≈16B) que puede ejecutarse localmente en estaciones de trabajo de seguridad.
- Triaje de alertas y logs: procesamiento de salidas de herramientas de seguridad (nmap, grep, logs) para resumir hallazgos y proponer acciones, en un entorno aislado sin enviar datos a la nube.
- Formación y concienciación en ciberseguridad: generación de escenarios de ataque simulados y explicaciones didácticas para laboratorios de entrenamiento, gracias a su orientación a red-team.
- Asistente multimodal en entornos de seguridad: análisis de capturas de pantalla de terminales o paneles de administración mediante el proyector multimodal, útil para documentar incidentes.
- Despliegue en entornos air-gapped: al ofrecerse en GGUF con cuantizaciones desde 6,7 GB, puede ejecutarse en máquinas sin conexión, requisito habitual en equipos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización GGUF):
  - Q2_K: ~6,7 GB de pesos, ~8 GB de VRAM recomendados.
  - Q4_K_M: ~10,6 GB de pesos, ~12 GB de VRAM recomendados.
  - Q5_K_M: ~12,1 GB de pesos, ~14 GB de VRAM recomendados.
  - Q6_K: ~14,4 GB de pesos, ~16 GB de VRAM recomendados.
  - Q8_0: ~17,1 GB de pesos, ~20 GB de VRAM recomendados.
  - Añadir ~0,7-1,0 GB si se usa el proyector multimodal (`mmproj`).
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K/Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q5_K_M; RTX 4060 Ti 16 GB o RTX 4070 (12 GB) para Q4_K_M; A100/H100 para despliegues concurrentes con vLLM o TGI.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 8 GB hasta Q8_0 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; para el modelo base en safetensors, vLLM o TGI (previa conversión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Horus-Cyber-Nano-1.0 | ≈15,96B (MoE) | no disponible | tokenai-custom-license | GGUF, safetensors | Especializado en ciberseguridad, multimodal |
| Modelos generalistas de ~14-16B (p. ej. Qwen2.5-14B, Mistral-Nemo-12B) | 12-14B | 32K-128K | Apache 2.0 / otras | GGUF, safetensors | No especializados en seguridad; benchmarks públicos disponibles |
| Modelos de seguridad de gran tamano (p. ej. variantes de 70B) | 70B+ | variable | variable | variable | Mayor calidad potencial pero requisitos de hardware muy superiores |

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan contexto, dataset, benchmarks ni parámetros activos, lo que impide validar las capacidades declaradas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en ciberseguridad, donde una sugerencia incorrecta puede tener consecuencias operativas.
- Sesgos desconocidos: al no publicarse la composición del dataset, no es posible evaluar sesgos lingüísticos, culturales o de dominio.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia personalizada (`tokenai-custom-license`): es obligatorio revisar los términos antes de uso comercial; no es una licencia open source estándar.
- Uso dual: la orientación a red-team implica riesgos de uso malicioso; debe desplegarse con controles y en entornos autorizados.
- Modelo cuantizado: las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para producción.
- Fecha de creación futura (2026) en los metadatos: conviene verificar la vigencia y procedencia de los datos antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Horus-Cyber-Nano-1.0-GGUF
- Modelo base: https://huggingface.co/tokenaii/Horus-Cyber-Nano-1.0
- Quants imatrix: https://huggingface.co/mradermacher/Horus-Cyber-Nano-1.0-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Horus-Cyber-Nano-1.0-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
