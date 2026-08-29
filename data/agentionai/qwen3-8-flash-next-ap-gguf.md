# agentionai/Qwen3.8-Flash-Next-AP-GGUF

## Resumen

El repositorio `agentionai/Qwen3.8-Flash-Next-AP-GGUF` contiene cuantizaciones GGUF del modelo base `Qwen/Qwen3.8-Flash-Next`, desarrolladas por el equipo de Agention. Estas cuantizaciones, denominadas "Agention Precision" (AP), aplican un esquema de compresion optimizado y diferenciado por capa para reducir al maximo el tamano del archivo sin sacrificar excesivamente la calidad. El resultado principal, `AP-IQ4_XS`, ocupa 84.24 GiB frente a los 117.13 GiB de la cuantizacion IQ4_XS de AesSedai, con una penalizacion en perplexity de solo un +3.75% respecto al modelo sin cuantizar.

El modelo base es un MoE multimodal de 125 mil millones de parametros con 6 mil millones activos por token, una ventana de contexto nativa de 262.144 tokens (extensible a 1M con YaRN) y una arquitectura de atencion hibrida GDN + QSA. Estas cuantizaciones son compatibles con llama.cpp mainline, sin necesidad de forks, lo que facilita su despliegue en produccion. La licencia es la Qwen Community License 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atencion hibrida GDN + QSA (modelo base) |
| Parametros totales | 125 mil millones (modelo base) |
| Parametros activos | 6 mil millones por token (modelo base) |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1M con YaRN (modelo base) |
| Tipos de cuantizacion | AP-IQ4_XS, AP-Q4_K_XL, AP-Q5_K_XL |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, introduce mejoras sistematicas en atencion, residual, embedding y optimizacion. Su arquitectura combina atencion GDN (probablemente una variante de atencion con desnormalizacion o agrupacion) con QSA (atencion con cuantizacion o seleccion de queries), disenada para mejorar la capacidad del modelo y la eficiencia computacional. Al ser un MoE, solo 6 mil millones de sus 125 mil millones de parametros se activan por token, lo que reduce el coste de inferencia.

En cuanto a las cuantizaciones AP, el proceso utiliza un conjunto de compresiones altamente optimizado y diferente para cada capa, calibrado con corpus de bartowski y Thireus. El soporte para la arquitectura `qwen4exp` en llama.cpp fue implementado por Daniel Han y fusionado en el PR 27742. No se proporcionan detalles sobre el entrenamiento del modelo base (datos, tokens, RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento complejo gracias a su arquitectura MoE de 125B parametros.
- Codificacion agente (agentic coding): el blog de NVIDIA lo destaca para tareas de desarrollo asistido por agentes.
- Capacidades multimodales: el modelo base es multimodal, aunque el soporte de vision/audio en GGUF puede requerir archivos auxiliares adicionales (mmproj) no incluidos en este repositorio.
- Ventana de contexto muy amplia: 262.144 tokens nativos, adecuada para analisis de documentos extensos y conversaciones multi-turno largas.
- Compatibilidad con llama.cpp mainline, lo que permite integracion con herramientas del ecosistema (llama-server, bindings de Python, etc.).
- Eficiencia en inferencia: al activar solo 6B parametros por token, el coste computacional por token es relativamente bajo para su tamano total.

## Casos de uso

- Despliegue de un asistente de codigo en entornos locales: gracias a su soporte para agentic coding y su ventana de 262K tokens, puede integrarse en IDEs o pipelines de CI/CD para revisar repositorios completos, generar parches y ejecutar tareas de refactorizacion.
- Analisis de documentos legales o academicos extensos: la ventana de contexto nativa permite procesar contratos, tesis o expedientes completos en una sola pasada, sin necesidad de chunking complejo.
- Backend de atencion al cliente con contexto largo: puede mantener conversaciones multi-turno con historial extenso, recordando detalles de interacciones anteriores durante horas.
- Investigacion en eficiencia de cuantizacion: el repositorio sirve como referencia para estudiar el equilibrio entre tamano de archivo y perplexity, comparando AP-IQ4_XS con otras cuantizaciones del mismo modelo.
- Razonamiento matematico y cientifico: su capacidad de razonamiento, combinada con la eficiencia del MoE, lo hace util para herramientas de calculo simbolico o asistentes de investigacion.
- Servidor de inferencia local con llama.cpp: puede desplegarse como `llama-server` para ofrecer una API compatible con OpenAI en infraestructura propia, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible para estas cuantizaciones. Sin embargo, la model card incluye datos de perplexity (PPL) sobre wikitext-2 raw (145 chunks, `-c 2048`), comparados con el modelo sin cuantizar:

| Cuantizacion | Tamano | PPL (wikitext-2) | Variacion vs. referencia |
|---|---|---|---|
| Referencia (sin cuantizar) | no disponible | 4.0068 +/- 0.02271 | - |
| AP-IQ4_XS | 84.24 GiB | 4.1572 +/- 0.02374 | +3.75% |
| AP-Q4_K_XL | ~93 GiB | TBD | TBD |
| AP-Q5_K_XL | ~102 GiB | TBD | TBD |

## Requisitos de hardware

- VRAM estimada: el archivo AP-IQ4_XS ocupa 84.24 GiB, por lo que se necesitan al menos 96 GiB de VRAM para una carga completa con `-ngl 99`. Las variantes Q4_K_XL y Q5_K_XL requieren aproximadamente 93 y 102 GiB respectivamente.
- GPU recomendadas: para AP-IQ4_XS, se recomienda un sistema con 2x A100 80GB, 2x H100 80GB o 2x RTX 6000 Ada (48GB). No cabe en GPU de consumo como la RTX 4090 (24GB) ni en una sola GPU profesional de 48GB.
- Opciones de despliegue: compatible con llama.cpp (llama-cli, llama-server), Ollama (si se importa el GGUF) y cualquier framework que soporte GGUF mainline.
- Latencia y throughput: no disponible. Dependera del hardware y del numero de parametros activos (6B), que reduce la carga computacional por token en comparacion con un dense de 125B.

## Comparativa con modelos similares

La comparativa se centra en cuantizaciones del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada.

| Modelo / Cuantizacion | Tamano | PPL (wikitext-2) | Notas |
|---|---|---|---|
| Qwen3.8-Flash-Next (sin cuantizar) | no disponible | 4.0068 | Referencia de calidad |
| agentionai AP-IQ4_XS | 84.24 GiB | 4.1572 | Mas compacto, +3.75% PPL |
| AesSedai IQ4_XS | 117.13 GiB | no disponible | Mucho mayor, calidad relativa similar segun el autor |

## Limitaciones y advertencias

- Licencia restrictiva: la Qwen Community License 1.0 impone condiciones especificas para uso comercial. Es imprescindible revisar el texto completo de la licencia antes de desplegar el modelo en produccion.
- Penalizacion de calidad: AP-IQ4_XS presenta un +3.75% de incremento en perplexity respecto al modelo original. Para tareas sensibles a la precision (como generacion de codigo complejo), puede ser preferible usar AP-Q5_K_XL o el modelo sin cuantizar.
- Datos de benchmark insuficientes: no se han publicado resultados de tareas estandar (MMLU, HumanEval, etc.) para estas cuantizaciones, por lo que el rendimiento real en tareas especificas es incierto.
- Soporte multimodal en GGUF: aunque el modelo base es multimodal, el repositorio no incluye archivos de proyeccion (mmproj) para vision/audio. Su uso en modo multimodal con llama.cpp puede no estar disponible o requerir pasos adicionales.
- Requisitos de hardware elevados: el tamano minimo de 84 GiB excluye su uso en estaciones de trabajo con una sola GPU de gama media o alta de consumo.
- Idiomas soportados: no se especifican en la informacion disponible, aunque por su origen (Qwen) se espera un soporte multilingue amplio, pero no confirmado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-AP-GGUF
- Repositorio del modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Blog de NVIDIA sobre Qwen3.8-Flash-Next: https://developer.nvidia.com/blog/experiment-with-qwen3-8-flash-next-on-nvidia-gb300-nvl72-for-agentic-coding/
- PR 27742 de llama.cpp (soporte qwen4exp): https://github.com/ggml-org/llama.cpp/pull/27742
- Cuantizacion de referencia de AesSedai: https://huggingface.co/AesSedai/Qwen3.8-Flash-Next-GGUF
