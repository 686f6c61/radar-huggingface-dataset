# mradermacher/gpt2-medical-v2-GGUF

## Resumen

`mradermacher/gpt2-medical-v2-GGUF` es una recopilación de cuantizaciones en formato GGUF del modelo base `praneshgunner/gpt2-medical-v2`, un ajuste fino de GPT-2 orientado al dominio médico en inglés. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF que publica versiones estáticas (Q2 a Q8 y f16) de modelos pequeños para facilitar su despliegue en `llama.cpp` y entornos de inferencia local. No se trata, por tanto, de un modelo nuevo, sino de una distribución empaquetada del modelo original.

El modelo base es un GPT-2 de 163.037.184 parámetros (aproximadamente 163 M), lo que lo sitúa en la categoría de modelos pequeños, con una arquitectura transformer decoder-only clásica. Su propósito declarado es la generación de texto en el ámbito médico, aunque no se documentan detalles sobre el corpus de ajuste fino, el proceso de entrenamiento ni las métricas obtenidas. La relevancia de esta ficha radica en su utilidad como ejemplo de modelo de dominio específico de bajo coste computacional, no en un rendimiento de vanguardia.

La licencia no está declarada en la información disponible, lo que constituye un caveat importante para cualquier uso en producción. El repositorio ocupa 1,6 GB e incluye once variantes de cuantización, desde Q2_K (0,2 GB) hasta f16 (0,4 GB). El modelo solo soporta inglés y no se han publicado resultados de benchmarks ni una model card detallada más allá de la información de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 163.037.184 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un GPT-2 estándar, un transformer decoder-only con atención causal completa, normalización previa a la atención y embeddings posicionales aprendidos. Con 163 M de parámetros, se corresponde con la variante pequeña de la familia GPT-2 (la de 124 M en su versión original de OpenAI, aunque el recuento exacto aquí es de 163.037.184 parámetros, lo que sugiere posibles diferencias en vocabulario o configuración respecto al GPT-2 canónico). No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus médico empleado en el ajuste fino, ni si se aplicaron técnicas de RLHF, DPO o instrucción tuning.

Tampoco se documentan innovaciones técnicas destacables: no hay decodificación especulativa, atención lineal, mezcla de expertos ni modos de razonamiento extendido. El trabajo de mradermacher se limita a la conversión y cuantización estática del modelo original mediante las herramientas habituales del ecosistema GGUF, con una variante adicional de cuantizaciones ponderadas/imatrix publicada en un repositorio separado (`gpt2-medical-v2-i1-GGUF`). No se especifica el método exacto de calibración ni el dataset empleado para las imatrix.

## Capacidades

- Generación de texto en inglés con vocabulario y estilo orientados al dominio médico, según la intención declarada del modelo base.
- Continuación de texto y completado de secuencias cortas; no se documenta un modo de instrucciones o chat.
- Capacidad limitada de razonamiento y matemáticas, propia de un GPT-2 pequeño sin ajuste específico para esas tareas.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés; no se declaran otros idiomas.
- No dispone de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Prototipado de asistentes de dominio médico en local: al ser un modelo de 163 M en GGUF, puede ejecutarse en CPU o en GPU de gama baja para validar pipelines de generación de texto clínico antes de invertir en modelos mayores.
- Generación de borradores de texto descriptivo sanitario: útil para producir resúmenes o descripciones preliminares en inglés que un profesional revise después, dado su ajuste al vocabulario médico.
- Experimentación académica con modelos pequeños de dominio: sirve como línea base para comparar técnicas de ajuste fino o de cuantización en un contexto médico controlado.
- Despliegue en entornos con recursos muy limitados: con cuantizaciones Q4_K_M de aproximadamente 0,2 GB, cabe en dispositivos embebidos, Raspberry Pi o contenedores sin GPU.
- Pruebas de integración con `llama.cpp` y Ollama: útil para validar flujos de carga de GGUF, concatenación de ficheros multi-parte y plantillas de prompt en pipelines de CI.
- Educación y demostraciones: adecuado para mostrar en talleres cómo funciona un modelo de lenguaje de dominio específico y cuáles son sus límites frente a modelos grandes.
- Filtrado o clasificación ligera de texto médico: con ajuste adicional, podría emplearse como extractor de características o clasificador de secuencias cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 0,5 GB en todas las cuantizaciones; la variante f16 ocupa unos 0,4 GB y Q4_K_M alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050, una iGPU moderna o incluso CPU son viables.
- Cabe en cualquier GPU de consumo, incluidas las integradas, y en dispositivos de placa única como Raspberry Pi 4/5.
- Opciones de despliegue: `llama.cpp`, Ollama, y cualquier runtime compatible con GGUF; el modelo base también puede cargarse con `transformers` en formato safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera una latencia de milisegundos por token en CPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gpt2-medical-v2-GGUF | 163 M | no disponible | no disponible | GGUF | Ajuste médico en inglés, cuantizado por mradermacher |
| praneshgunner/gpt2-medical-v2 | 163 M | no disponible | no disponible | safetensors | Modelo base del que derivan las cuantizaciones |
| GPT-2 original (OpenAI) | 124 M | 1024 | MIT | safetensors, GGUF (comunidad) | Referencia generalista, sin ajuste médico |
| Modelos médicos pequeños tipo BioGPT | 347 M | 1024 | MIT | safetensors | Dominio biomédico, mayor tamaño y documentación |

La comparación con BioGPT es orientativa: no se dispone de benchmarks del modelo evaluado que permitan una comparación cuantitativa rigurosa. La principal diferencia frente a alternativas es la falta de documentación sobre el proceso de ajuste y la ausencia de licencia declarada.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso para uso comercial ni para redistribución; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue en producción.
- Riesgo elevado de alucinación: un GPT-2 de 163 M sin ajuste por instrucciones tiende a generar texto plausible pero no verificado, especialmente peligroso en contexto médico.
- No apto para uso clínico: no debe emplearse para diagnóstico, recomendación terapéutica ni ninguna decisión que afecte a pacientes.
- Sesgos desconocidos: no se documenta la composición del corpus de ajuste ni los posibles sesgos demográficos, lingüísticos o clínicos.
- Limitación idiomática: solo inglés; no soporta castellano ni otras lenguas.
- Contexto no documentado: se desconoce la ventana máxima; en GPT-2 suele ser de 1024 tokens, pero no está confirmado para este ajuste.
- Sin soporte de chat ni instrucciones: requiere prompts de continuación, no de conversación.
- Modelo base pequeño y antiguo: su capacidad de razonamiento y coherencia a largo plazo es muy inferior a la de modelos actuales, incluso de tamaño similar.
- Repositorio con muy poca tracción (22 descargas, 0 likes): no hay validación comunitaria ni informes de uso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gpt2-medical-v2-GGUF
- Modelo base: https://huggingface.co/praneshgunner/gpt2-medical-v2
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/gpt2-medical-v2-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#gpt2-medical-v2-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
