# mradermacher/Caveman-2B-i1-GGUF

## Resumen

Caveman-2B-i1-GGUF es el conjunto de cuantizaciones GGUF del modelo CrowdMind/Caveman-2B, publicado por el usuario mradermacher, especializado en generar versiones comprimidas y listas para inferencia local de modelos abiertos. El modelo base tiene 1.942.653.248 parámetros (aproximadamente 1,94 mil millones) y se distribuye bajo licencia Apache-2.0, con etiquetas que lo identifican como modelo conversacional en inglés y lo asocian a la familia qwen3_5.

El repositorio contiene 22 variantes de cuantización de tipo i1 (imatrix o *weighted*), generadas con ficheros de importancia aportados por el colaborador nicoboss, que van desde Q2_K (1,1 GB) hasta Q6_K (1,7 GB). Además se ofrece el fichero imatrix original para quien quiera crear sus propias cuantizaciones y se enlaza un repositorio hermano con cuantizaciones estáticas.

Su relevancia práctica es la de permitir ejecutar un modelo de ~2B parámetros en hardware muy modesto (CPU, mini-PC o GPU de gama de entrada) con un consumo de memoria de entre 2 y 4 GB. No obstante, la ficha del modelo base no documenta arquitectura, datos de entrenamiento ni resultados de evaluación, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Las etiquetas del repositorio indican `transformers`, `unsloth` y `qwen3_5`, lo que apunta a un transformer decoder-only derivado de la familia Qwen 3.5, pero no se documenta en la model card |
| Parámetros totales | 1.942.653.248 (≈1,94 mil millones, dato de safetensors del modelo base) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 22 variantes i1 (imatrix/weighted): Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K. Cuantizaciones estáticas en repositorio aparte |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); se incluye además el fichero imatrix `Caveman-2B.imatrix.gguf` (0,1 GB) para generar cuantizaciones propias |
| Modelo base | CrowdMind/Caveman-2B |
| Autor de la cuantización | mradermacher |
| Tamaño del repositorio | 18,6 GB |
| Metadatos de conversión | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Fecha de publicación | 11 de septiembre de 2026 (última actualización el mismo día) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base CrowdMind/Caveman-2B más allá de las etiquetas del repositorio de cuantización (`transformers`, `unsloth`, `qwen3_5`). Estas sugieren un transformer decoder-only entrenado o afinado con Unsloth y compatible con la librería Transformers, pero la model card no especifica número de capas, dimensión oculta, tipo de atención, mecanismo de RoPE ni longitud de contexto nativa. Tampoco se documenta si se trata de un modelo denso o de una mezcla de expertos (MoE); dado que no hay indicios de MoE en la información disponible, la fila de parámetros activos se omite.

Respecto al entrenamiento, la información proporcionada no incluye número de tokens, composición del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO. La etiqueta `conversational` y el nombre del modelo (Caveman) sugieren un ajuste orientado a diálogo con un estilo muy concreto, pero no hay documentación que lo confirme. La contribución técnica de este repositorio concreto es la cuantización: se han generado cuantizaciones i1 (imatrix) ponderadas, que emplean un fichero de importancia para preservar mejor las activaciones relevantes y suelen superar en perplejidad a las cuantizaciones estáticas del mismo tamaño.

## Capacidades

- Generación de texto e inferencia conversacional en inglés, con etiqueta explícita `conversational` en el repositorio.
- Compatibilidad con `text-generation-inference` y con la librería `transformers` para los formatos no cuantizados del modelo base.
- Ejecución mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- El repositorio incluye una nota genérica de mradermacher que afirma que el modelo base es un modelo de visión y que los ficheros `mmproj` (si existen) se alojarían en el repositorio de cuantizaciones estáticas. No se confirma en la información disponible que existan tales ficheros ni que la visión esté operativa en estas cuantizaciones.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Modo *thinking*, audio o cualquier otra capacidad especial: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales en inglés: con 1,1-1,7 GB de pesos, el modelo puede ejecutarse íntegramente en CPU o en una GPU de gama de entrada y mantener conversaciones multi-turno sin conexión a Internet, lo que resulta útil para aplicaciones de chat de escritorio con requisitos de privacidad estrictos.
- Despliegue en *edge* y dispositivos de recursos limitados: las variantes IQ3_S o Q4_K_S caben en placas tipo Raspberry Pi 5, mini-PC con 8 GB de RAM o portátiles sin GPU dedicada, permitiendo inferencia totalmente offline.
- Prototipado y validación de pipelines de inferencia: sirve como modelo de pruebas para verificar integraciones con llama.cpp, Ollama o text-generation-inference antes de escalar el mismo flujo a modelos de mayor tamaño, con un coste de memoria mínimo.
- Aplicaciones de rol y personajes conversacionales: la naturaleza de ajuste conversacional que sugiere el nombre del modelo lo hace adecuado para experimentar con personajes y estilos de respuesta muy marcados en diálogos de varios turnos.
- Tareas auxiliares de generación corta en pipelines de CI/CD: resúmenes de *commits*, descripciones automáticas de cambios o clasificación de textos, donde un modelo de 2B cuantizado a Q4 ofrece latencia baja y coste despreciable en CPU.
- Filtrado y preprocesado por lotes de texto en inglés: clasificación de correos, etiquetado de tickets o generación de respuestas plantilla, aprovechando la baja huella de memoria para procesar grandes volúmenes en paralelo.
- Investigación sobre cuantización: el repositorio incluye 22 variantes i1 y el fichero imatrix original, lo que permite medir empíricamente la degradación de perplejidad entre IQ2, IQ3, Q4 y Q6 sobre un mismo modelo, además de comparar contra las cuantizaciones estáticas del repositorio hermano.
- Educación y asistencia de estudio sin conexión: al ejecutarse en hardware de consumo, puede desplegarse en entornos sin red (aulas, laboratorios aislados) para generar explicaciones y material de práctica en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y las búsquedas web realizadas no han devuelto documentación técnica ni resultados de evaluación del modelo CrowdMind/Caveman-2B.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + caché KV reducida, contexto corto): aproximadamente 2 GB con Q4_K_S/Q4_K_M, 2,5-3 GB con Q5_K_M y 3-4 GB con Q6_K. Las variantes IQ2_XXS e IQ1_S rondan 0,7-1,0 GB.
- Tamaños reales de los ficheros publicados:

| Cuantización | Tamaño (GB) | Nota del autor |
|---|---|---|
| i1-Q2_K | 1,1 | IQ3_XXS probablemente mejor |
| i1-IQ3_S | 1,2 | supera a Q3_K* |
| i1-Q4_K_S | 1,3 | tamaño/velocidad/calidad óptimos |
| i1-Q4_K_M | 1,4 | rápido, recomendado |
| i1-Q5_K_M | 1,6 | - |
| i1-Q6_K | 1,7 | prácticamente como Q6_K estático |

- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3050/3060, RTX 4060, RTX 4090 si se busca máxima velocidad). También admite ejecución híbrida repartiendo capas entre GPU y CPU, e incluso inferencia completa en CPU. No se recomienda hardware de centro de datos tipo A100/H100 salvo para servir muchas réplicas concurrentes, dado el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo actuales, y también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con GGUF. Para los pesos del modelo base sin cuantizar, transformers y text-generation-inference.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para estas cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los valores de las alternativas corresponden a sus especificaciones públicas y se incluyen como referencia de categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|
| CrowdMind/Caveman-2B (esta ficha) | ≈1,94 mil millones | No disponible | Apache-2.0 | Sí, cuantizaciones i1 (22 variantes) y estáticas |
| Qwen2.5-1.5B-Instruct | ≈1,54 mil millones | 32.768 tokens (ampliable con YaRN) | Apache-2.0 | Amplia, múltiples cuantizadores |
| Gemma-2-2B-it | ≈2,6 mil millones | 8.192 tokens | Términos de uso de Gemma | Amplia, múltiples cuantizadores |
| Llama-3.2-3B-Instruct | ≈3,2 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Amplia, múltiples cuantizadores |

El elemento diferencial del modelo evaluado es su licencia Apache-2.0 combinada con un tamaño reducido y 22 variantes de cuantización i1, lo que facilita el uso comercial sin las restricciones adicionales de las licencias de Gemma o Llama. En contrapartida, no hay resultados publicados que permitan situarlo frente a estas alternativas en calidad de respuesta.

## Limitaciones y advertencias

- No existe documentación pública sobre sesgos, composición del dataset ni proceso de alineación del modelo base, por lo que no es posible evaluar sesgos conocidos ni mitigarlos con garantías.
- Riesgo de alucinación propio de un modelo de ~2B parámetros: la precisión factual en tareas abiertas será limitada y debe verificarse en cualquier uso productivo.
- La información disponible no declara la longitud de contexto soportada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- El modelo solo declara inglés; no hay evidencia de competencia multilingüe ni de que funcione correctamente en castellano.
- La nota de la model card sobre visión es genérica del cuantizador y condicional ("si existen" ficheros mmproj). En este repositorio no hay ficheros mmproj, de modo que la visión no debe darse por operativa con estas cuantizaciones.
- La degradación por cuantización es relevante en las variantes de menor precisión (IQ1_S, IQ1_M, IQ2_XXS, Q2_K): el propio autor desaconseja algunas de ellas y sugiere alternativas IQ de tamaño similar.
- Aunque la licencia del repositorio es Apache-2.0, conviene verificar los términos del modelo base (CrowdMind/Caveman-2B) antes de un despliegue comercial, ya que esta ficha solo refleja lo declarado en el repositorio de cuantización.
- El repositorio registra 0 descargas y 0 interacciones en el momento de redactar la ficha, por lo que carece de validación por parte de la comunidad y de informes independientes de calidad.
- Los enlaces y metadatos del repositorio indican fechas de 2026; comprobar la vigencia del repositorio y del modelo base antes de integrarlo.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Caveman-2B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Caveman-2B-GGUF
- Modelo base: https://huggingface.co/CrowdMind/Caveman-2B
- Fichero imatrix: https://huggingface.co/mradermacher/Caveman-2B-i1-GGUF/resolve/main/Caveman-2B.imatrix.gguf
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Caveman-2B-i1-GGUF
- Preguntas frecuentes y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
- Paper, blog o demo oficial del modelo base: no disponible en la información proporcionada.
