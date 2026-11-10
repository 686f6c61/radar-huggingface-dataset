# mradermacher/erawan-1.3-i1-GGUF

## Resumen

Erawan-1.3-i1-GGUF es una redistribución en formato GGUF del modelo Erawan-1.3, desarrollado por Airavat-AI y cuantizado por mradermacher. Se trata de un modelo de lenguaje afinado mediante LoRA sobre una base de la familia Qwen3, orientado a tareas de razonamiento, uso de herramientas (tool calling / function calling) y flujos agénticos. La información disponible lo etiqueta como un modelo de aproximadamente 2B parámetros, si bien el recuento real de safetensors reportado es de 1.034.740 parámetros, dato que conviene tratar con cautela.

El modelo original se distribuye bajo licencia Apache 2.0 y está declarado únicamente para inglés. Esta versión concreta del repositorio contiene únicamente el fichero de imatrix (matriz de importancia) utilizado para generar cuantizaciones de alta calidad, no los pesos cuantizados completos; las cuantizaciones estáticas están en un repositorio hermano.

Su relevancia práctica es limitada por el momento: el repositorio no registra descargas ni interacciones, no se han publicado benchmarks en la información disponible y la model card es la plantilla estándar del cuantizador, sin documentación específica del modelo subyacente. Resulta útil principalmente para quienes quieran generar sus propias cuantizaciones IQ a partir de la imatrix publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según tags del repositorio); detalles no disponibles |
| Parametros totales | 1.034.740 según safetensors; etiquetado como "2B" en los tags (discrepancia no resuelta) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (fichero de importancia); cuantizaciones IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small), Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (listadas como disponibles en el proceso de cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio contiene solo el fichero imatrix; los pesos GGUF estáticos están en mradermacher/erawan-1.3-GGUF) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de los tags del repositorio, que indican una base Qwen3 con un ajuste fino mediante LoRA (adaptador sobre el modelo base Airavat-ai/erawan-1.3). Los tags también señalan especialización en razonamiento, uso de herramientas y comportamiento agéntico, pero no se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica relevante en este repositorio es el uso de una matriz de importancia (imatrix) para generar cuantizaciones ponderadas de tipo IQ, que según la práctica habitual del cuantizador producen una perplejidad menor que las cuantizaciones estáticas de tamaño comparable. No se dispone de datos sobre decodificación especulativa, atención lineal ni otras optimizaciones del modelo original.

## Capacidades

- Generación de texto en inglés.
- Razonamiento (tag "reasoning" en el repositorio).
- Uso de herramientas y function calling (tags "tool-use" y "function-calling").
- Comportamiento agéntico (tag "agentic"), presumiblemente orientado a flujos multi-paso.
- Ajuste fino específico (tag "Fine-tuned") sobre base Qwen3.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Visión, audio o modo "thinking" explícito: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes locales de bajo consumo: al tratarse de un modelo de tamaño reducido (etiquetado 2B) en formato GGUF, puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, cubriendo tareas de generación de texto y resumen en inglés.
- Automatización de flujos con herramientas: sus tags de tool-use y function-calling lo hacen candidato para orquestar llamadas a APIs en pipelines de agentes ligeros, siempre que se valide su fiabilidad empíricamente al no haber benchmarks publicados.
- Prototipado de agentes multi-paso: útil en entornos de desarrollo para iterar sobre lógicas de razonamiento encadenado antes de escalar a modelos mayores.
- Generación de cuantizaciones propias: el fichero imatrix publicado permite a otros desarrolladores producir cuantizaciones IQ personalizadas con llama.cpp para ajustar el equilibrio tamaño/calidad.
- Evaluación comparativa de ajustes finos: sirve como punto de comparación frente a otros LoRA sobre Qwen3 en tareas de razonamiento y uso de herramientas.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su integración en productos comerciales, sujeta a verificación de las condiciones del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo etiquetado como 2B, las cuantizaciones Q4_K_M suelen situarse en torno a 1,2-1,5 GB y las Q8 en torno a 2-2,5 GB, aunque estas cifras son estimaciones generales y no datos del repositorio.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer con 4-8 GB de VRAM debería ser suficiente para cuantizaciones de 4-8 bits, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU consumer: probable según el tamaño etiquetado, sin confirmación oficial.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; el repositorio declara compatibilidad con endpoints y la librería transformers para el modelo original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Erawan-1.3 (este) | 1,03 M según safetensors / etiquetado 2B | no disponible | Apache 2.0 | GGUF (imatrix) | Ajuste LoRA sobre Qwen3, orientado a agentes y tool-use |
| Qwen3 base (familia) | variable según variante | no disponible | según variante | safetensors, GGUF | Modelo base sobre el que se afina Erawan |
| Otros LoRA sobre Qwen3 | variable | no disponible | variable | variable | No se dispone de comparativas publicadas en la información proporcionada |

No se dispone de datos de rendimiento comparativo; la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El repositorio contiene únicamente el fichero imatrix, no los pesos cuantizados; quien busque GGUF listos para usar debe acudir al repositorio de cuantizaciones estáticas.
- Existe una discrepancia entre el recuento de parámetros de safetensors (1.034.740) y la etiqueta "2B"; conviene verificar el tamaño real antes de planificar el despliegue.
- Solo se declara soporte de inglés; el rendimiento en castellano no está documentado.
- No hay benchmarks publicados, por lo que no puede validarse la calidad en razonamiento, código o tool calling.
- Riesgo de alucinación inherente a modelos de este tamaño, agravado por la ausencia de evaluación pública.
- No se documentan sesgos conocidos ni filtros de seguridad del modelo original.
- Aunque la licencia es Apache 2.0, deben respetarse las condiciones del modelo base Qwen3 y del ajuste original de Airavat-AI.
- El repositorio no registra descargas ni interacciones, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/erawan-1.3-i1-GGUF
- Modelo base: https://huggingface.co/Airavat-ai/erawan-1.3
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/erawan-1.3-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#erawan-1.3-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
