# hoangducanh1865/llama-3.2-1b-deita-sft-student

## Resumen

El modelo `hoangducanh1865/llama-3.2-1b-deita-sft-student` es un ajuste fino supervisado (SFT) del modelo base `meta-llama/Llama-3.2-1B`, desarrollado por el usuario de HuggingFace hoangducanh1865. Se trata de un experimento de alineación a pequeña escala: el autor ha aplicado el flujo de trabajo de la librería *alignment-handbook* sobre el conjunto de datos `HuggingFaceH4/deita-10k-v0-sft`, un corpus público de aproximadamente 10.000 ejemplos de instrucciones de alta calidad procedente del proyecto DEITA. El resultado es un modelo conversacional de 1.235.814.400 parámetros (unos 1,24 mil millones) que conserva la arquitectura original de Llama 3.2.

El modelo no introduce innovaciones arquitectónicas ni técnicas de entrenamiento novedosas: es un fine-tuning estándar de 3 épocas con AdamW, tasa de aprendizaje 3e-5 y scheduler coseno, ejecutado en 8 dispositivos con un tamaño de lote efectivo de 256. Su interés principal es práctico: permite disponer de un modelo conversacional de tamaño reducido que cabe en GPUs de consumo, con la licencia Llama 3.2 y un repositorio de 2,5 GB en formato safetensors. La pérdida de validación final declarada es de 1,1643.

La relevancia de esta ficha es acotada y conviene ser honesto al respecto: el modelo acumula 0 descargas y 0 *likes*, no publica resultados de benchmarks, la model card está prácticamente vacía (el propio autor no documenta usos previstos, limitaciones ni descripción) y no se ha publicado ningún artículo o blog asociado. Debe tratarse, por tanto, como un artefacto de investigación o de aprendizaje, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), con atención causal; detalles internos no disponibles en la informacion proporcionada (heredados del modelo base) |
| Parametros totales | 1.235.814.400 (aprox. 1,24 mil millones, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Llama 3.2 1B declara 128.000 tokens |
| Tipos de cuantizacion | No especificados por el autor; el repositorio solo contiene safetensors en precision completa (fp32/bf16). Compatible con cuantizaciones estandar de llama.cpp/GGUF y bitsandbytes, no verificadas |
| Idiomas soportados | No disponible en la informacion proporcionada; el modelo base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, español y thai |
| Licencia | llama3.2 (Licencia comunitaria de Llama 3.2) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 2,5 GB |
| Modelo base | meta-llama/Llama-3.2-1B |
| Dataset de ajuste | HuggingFaceH4/deita-10k-v0-sft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.2 1B: un transformer decoder-only causal con normalización RMSNorm, activación SwiGLU, codificación posicional RoPE y *grouped-query attention* (GQA). El ajuste no modifica ni la topología ni el tokenizador, por lo que el modelo hereda el vocabulario y las capacidades lingüísticas del checkpoint original de Meta. No se ha aplicado ninguna innovación técnica adicional (no hay decodificación especulativa, atención lineal ni capas híbridas SSM), y la model card no documenta ninguna modificación estructural.

El entrenamiento consistió en un *supervised fine-tuning* sobre el dataset `HuggingFaceH4/deita-10k-v0-sft` con los siguientes hiperparámetros: tasa de aprendizaje 3e-5, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con un 10 % de *warmup*, 3 épocas, semilla 42 y tipo distribuido multi-GPU con 8 dispositivos. El tamaño de lote por dispositivo fue de 32 (256 efectivo) y el de evaluación de 16 (128 efectivo). La evolución de la pérdida fue la siguiente: época 1 con pérdida de entrenamiento 1,0918 y validación 1,1571 (paso 143); época 2 con 0,9824 y 1,1501 (paso 286); época 3 con 0,9069 y 1,1643 (paso 429). Es decir, la pérdida de validación deja de mejorar en la tercera época mientras la de entrenamiento sigue bajando, un patrón compatible con un sobreajuste leve. No se documenta ninguna fase posterior de RLHF, DPO o preferencias. A pesar del sufijo «student» en el nombre, la model card no describe ningún procedimiento de destilación de conocimiento desde un modelo profesor; el único proceso documentado es el SFT.

## Capacidades

- Generación de texto conversacional: es la única capacidad explícitamente documentada, ya que el dataset de ajuste (DEITA SFT) está compuesto por diálogos de instrucciones de un solo turno y multi-turno.
- Seguimiento de instrucciones: el ajuste SFT sobre un corpus curado de instrucciones busca mejorar la adherencia a la petición del usuario respecto al modelo base, aunque no se aportan métricas que lo cuantifiquen.
- Razonamiento y matemáticas: capacidad heredada del modelo base de 1,24 B de parámetros, muy limitada por el tamaño; no disponible en la información proporcionada como capacidad verificada.
- Generación de código: no documentada para este ajuste; la capacidad subyacente proviene del modelo base, sin datos específicos.
- Soporte de *tool calling* / *function calling*: no disponible. Ni la model card ni las etiquetas del repositorio mencionan plantillas de herramientas ni formato de llamadas a funciones.
- Soporte de agentes y razonamiento multi-paso: no disponible. No hay documentación de modos de razonamiento, planificación ni uso agéntico.
- Capacidades multilingües: no documentadas para el ajuste; el dataset DEITA es mayoritariamente en inglés, por lo que es previsible una degradación del rendimiento en otros idiomas respecto al modelo base.
- Capacidades especiales (visión, audio, *thinking mode*): ninguna. Es un modelo exclusivamente de texto.
- Integración con ecosistema: etiquetas `text-generation-inference` y `endpoints_compatible`, lo que indica que el repositorio puede desplegarse con TGI y con Inference Endpoints.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en local: con 1,24 B de parámetros el modelo cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU con cuantización, lo que permite iterar sobre prompts y flujos de conversación sin coste de API.
- Experimentación académica con el flujo *alignment-handbook*: sirve como referencia reproducible de un SFT completo (hiperparámetros, scheduler, pérdidas por época) para comparar recetas de ajuste en modelos pequeños.
- Generación de respuestas de un solo turno en tareas acotadas: clasificación de texto disfrazada de generación, reescritura breve, resumen de fragmentos cortos o extracción de campos simples, siempre con revisión humana.
- Base para *fine-tuning* posterior específico de dominio: al ser un checkpoint SFT ya alineado a formato conversacional, es un punto de partida razonable para ajustes con LoRA sobre datos propios (atención al cliente, soporte técnico interno) antes de escalar a modelos mayores.
- Evaluación comparativa de destilación y ajuste: útil como línea base «pequeña» frente a modelos de 7 B o 8 B en experimentos que midan la relación entre tamaño y calidad de respuesta.
- Generación de datos sintéticos de bajo coste: puede producir borradores o paráfrasis a gran volumen para ser filtrados después por un modelo mayor, aprovechando su bajo requisito de VRAM para ejecución en paralelo.
- Demostraciones y entornos educativos: permite ilustrar en un aula o taller cómo se comporta un LLM ajustado sin necesidad de infraestructura dedicada.
- Despliegue en el borde o en dispositivos con recursos limitados: con cuantización de 4 bits el peso del modelo ronda 1 GB, lo que hace viable la inferencia en portátiles y mini-PC, aunque con latencias altas en contextos largos.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada (`student_sft_init`) con la lista de resultados vacía, por lo que no existen benchmarks publicados (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El único dato cuantitativo de rendimiento aportado por el autor es la pérdida de evaluación durante el entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|---|
| 1,0 | 143 | 1,0918 | 1,1571 |
| 2,0 | 286 | 0,9824 | 1,1501 |
| 3,0 | 429 | 0,9069 | 1,1643 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos sin cuantizar: aproximadamente 2,5 GB en fp16/bf16 y en torno a 5 GB en fp32 (cálculo a partir de 1.235.814.400 parámetros).
- VRAM con cuantización: del orden de 1,3 GB en int8 y de 0,8-1,0 GB en 4 bits (estimación; el autor no publica ficheros GGUF ni configuraciones de cuantización verificadas).
- Memoria caché KV: escala linealmente con la longitud de contexto y con el número de capas y cabezas KV. Con 128.000 tokens de contexto completo el consumo adicional es de varios gigabytes incluso en un modelo de este tamaño; para despliegues prácticos conviene limitar la ventana a 4.000-8.000 tokens (estimación).
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM es suficiente para inferencia en fp16 (RTX 3060, RTX 4060, RTX 2070 o superiores). Para entrenamiento o ajuste fino completo se recomienda un mínimo de 16-24 GB (RTX 4090, A10G, L4); el autor empleó 8 dispositivos para un lote efectivo de 256, lo que sugiere GPUs de tipo A100 o similar.
- Cabe en GPU de consumo: sí, con holgura. Una RTX 4090, 4080, 3090 o incluso una 3060 de 12 GB pueden ejecutar el modelo sin cuantizar con contextos moderados.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (etiqueta `text-generation-inference`) e Inference Endpoints (etiqueta `endpoints_compatible`). llama.cpp, Ollama o vLLM no están verificados por el autor y requerirían convertir los pesos a GGUF o usar el checkpoint directamente según el soporte de cada herramienta para Llama 3.2.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| llama-3.2-1b-deita-sft-student (este modelo) | 1,24 B | No disponible (base: 128.000) | Llama 3.2 | HuggingFace, 0 descargas | SFT sobre deita-10k-v0-sft; perdida de validacion 1,1643; sin benchmarks |
| meta-llama/Llama-3.2-1B (modelo base) | 1,24 B | 128.000 | Llama 3.2 | HuggingFace, ampliamente distribuido | Modelo original sin ajuste conversacional especifico; soporta 8 idiomas oficiales |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Llama 3.2 | HuggingFace, ampliamente distribuido | Variante oficial alineada por Meta con RLHF/DPO; referencia directa para comparar la calidad del ajuste de este repositorio |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 | Apache 2.0 | HuggingFace, alta adopcion | Alternativa de tamano similar con licencia permisiva y soporte multilingue declarado mas amplio |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento real de este ajuste frente a las alternativas listadas.

## Limitaciones y advertencias

- Modelo prácticamente sin uso ni validación comunitaria: 0 descargas y 0 *likes* en el momento de redactar esta ficha, sin issues ni discusiones públicas que permitan juzgar su calidad.
- La model card está generada automáticamente por el *Trainer* y el propio autor deja sin rellenar las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento. No hay información fiable sobre sesgos, comportamiento o alcance.
- Alucinación: con 1,24 B de parámetros y un ajuste de solo 10.000 ejemplos, la propensión a inventar hechos es alta. No debe usarse en dominios donde la exactitud factual sea crítica sin verificación posterior.
- Sobreajuste probable: la pérdida de validación empeora en la tercera época (1,1501 a 1,1643) mientras la de entrenamiento sigue descendiendo, lo que apunta a un ajuste excesivo sobre el corpus DEITA.
- Idiomas: el dataset DEITA es mayoritariamente en inglés, por lo que el rendimiento en castellano u otros idiomas distintos del inglés puede ser notablemente inferior al del modelo base. No hay evaluación multilingüe publicada.
- Limitaciones de contexto: no se documenta si el ajuste preserva la ventana de 128.000 tokens del modelo base. El SFT con ejemplos cortos de DEITA puede degradar el comportamiento en contextos muy largos.
- Licencia: se hereda la Licencia comunitaria de Llama 3.2, que no es de código abierto en sentido estricto. Incluye restricciones de uso (por ejemplo, prohibición de usos ilícitos y obligaciones de atribución con la mención «Built with Llama»), un límite de 700 millones de usuarios mensuales antes de requerir licencia comercial de Meta y cláusulas de cumplimiento adicionales para productos distribuidos. Conviene revisar el texto completo antes de cualquier despliegue comercial.
- Ausencia de soporte para *tool calling* y agentes: no hay plantilla de herramientas ni documentación al respecto, por lo que no es adecuado para pipelines agénticos sin trabajo adicional.
- Origen del ajuste incierto: el nombre incluye «student», pero no se documenta ningún profesor ni proceso de destilación, lo que dificulta reproducir el resultado.
- Recomendación general: utilizar únicamente en entornos de experimentación, docencia o prototipado, nunca como componente crítico de un sistema en producción sin una evaluación propia exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hoangducanh1865/llama-3.2-1b-deita-sft-student
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceH4/deita-10k-v0-sft
- Librería alignment-handbook: https://github.com/huggingface/alignment-handbook
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Paper del proyecto DEITA: no disponible en la información proporcionada

Nota: los resultados de la búsqueda web realizada no contenían enlaces relevantes sobre este modelo, su paper o su repositorio; los enlaces anteriores provienen de la información del repositorio de HuggingFace.
