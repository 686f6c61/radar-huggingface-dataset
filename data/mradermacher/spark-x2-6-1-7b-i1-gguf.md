# mradermacher/Spark-X2.6-1.7B-i1-GGUF

## Resumen

Spark-X2.6-1.7B-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo XHToken/Spark-X2.6-1.7B, realizadas por mradermacher, un cuantizador muy activo de la comunidad de Hugging Face. El modelo base es un LLM conversacional de 1.707 millones de parámetros (aproximadamente 1,7B) orientado a inglés y chino, con licencia Apache 2.0 que permite uso comercial sin restricciones relevantes.

Esta ficha no cubre el modelo original sino su repositorio de cuantizaciones "imatrix" (importance matrix), que ofrecen versiones comprimidas desde IQ1_S (0,6 GB) hasta Q6_K (1,5 GB). El objetivo es permitir la ejecución del modelo en hardware modesto, incluidas CPU y GPUs de consumo, mediante llama.cpp, Ollama u otros runtimes compatibles con GGUF. Su relevancia reside en la facilidad de despliegue local: con menos de 1,5 GB en la cuantización más alta, es un candidato claro para dispositivos con recursos limitados, prototipado rápido y aplicaciones edge. No se dispone de información detallada sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento más allá de la etiqueta de familia "sparkx2_5".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia "sparkx2_5", transformer LLM conversacional) |
| Parametros totales | 1.707.657.216 (≈1,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, IQ4_XS, Q3_K_L, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base, XHToken/Spark-X2.6-1.7B, pertenece a la familia etiquetada como "sparkx2_5", lo que sugiere una evolución de una versión anterior (Spark-X2.5). No se han publicado en la información disponible detalles sobre la arquitectura concreta (número de capas, cabezas de atención, tipo de positional encoding), ni sobre el corpus de entrenamiento, número de tokens procesados o etapas de alineamiento (SFT, RLHF, DPO). Es un modelo denso de aproximadamente 1,7B de parámetros, con pipeline conversacional según los metadatos del repositorio.

Lo que sí está documentado es el trabajo de cuantización: mradermacher emplea cuantizaciones ponderadas con matriz de importancia (imatrix), una técnica que calcula estadísticas de activación sobre un corpus de calibración para asignar mayor precisión a los tensores más sensibles a la cuantización. Esto permite que variantes muy agresivas como IQ2 o IQ3 mantengan una calidad razonablemente cercana al modelo original en FP16. El repositorio incluye también un archivo imatrix de 0,1 GB para que los usuarios generen sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en inglés y chino (etiquetado como "conversational" en el repositorio).
- Ejecución local eficiente gracias al formato GGUF y a más de 20 niveles de cuantización distintos.
- Compatibilidad con el ecosistema llama.cpp, lo que habilita inferencia en CPU, GPU única o modo híbrido (offload parcial de capas a GPU).
- Archivo imatrix incluido para que usuarios avanzados generen cuantizaciones personalizadas.
- No hay información disponible sobre soporte de tool calling, function calling, capacidades agénticas, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Chatbots locales en dispositivos de gama baja: con la cuantización i1-Q4_K_M (1,2 GB) el modelo cabe en la memoria unificada de portátiles sin GPU dedicada, permitiendo asistentes conversacionales offline en inglés y chino.
- Prototipado rápido en CPU: al ser un modelo de 1,7B, generaciones interactivas son viables en CPUs de escritorio convencionales con llama.cpp, ideal para probar prompts y flujos antes de escalar a modelos mayores.
- Aplicaciones edge y IoT: las cuantizaciones IQ2/IQ3 (0,7–1,0 GB) permiten desplegar el modelo en SBCs tipo Raspberry Pi o en dispositivos Android mediante runtimes GGUF.
- Integración en pipelines de CI para pruebas de formato y tooling: su bajo consumo de memoria permite ejecutar tests de inferencia en runners sin GPU.
- Servicios bilingües inglés-chino de bajo coste: la cobertura de ambos idiomas lo hace útil para traducción ligera, redacción de respuestas cortas y clasificación de consultas en entornos con presupuesto de cómputo mínimo.
- Generación de cuantizaciones personalizadas: el archivo imatrix incluido permite a equipos con necesidades específicas de tamaño/precisión crear sus propias variantes sin recalcular la matriz de importancia.
- Fine-tuning ligero con LoRA sobre el modelo base y posterior distribución en GGUF para despliegue en cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: desde 0,6 GB (i1-IQ1_S) hasta 1,5 GB (i1-Q6_K); añadir 0,5–1 GB adicionales para la KV cache según la longitud de contexto.
- GPU recomendadas: cualquier GPU moderna es más que suficiente; el modelo cabe con holgura en GPUs de 4 GB o incluso 2 GB de VRAM en cuantizaciones medias (Q3/Q4).
- Consumer GPUs: cabe íntegramente en una RTX 3050, RTX 3060, RTX 4060 o superior; también ejecutable solo con CPU y RAM (8 GB bastan para cualquier cuantización).
- Opciones de despliegue: llama.cpp (nativo para GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF directamente; para esos servidores habría que usar el modelo base en formato transformers.
- Latencia y throughput: no disponible; al tratarse de un modelo de 1,7B, en GPU de consumo se esperan velocidades de decodificación altas (del orden de decenas de tokens/segundo), pero no se facilitan cifras oficiales.
- La cuantización recomendada por el autor como equilibrio tamaño/velocidad/calidad es i1-Q4_K_S (1,1 GB); i1-Q4_K_M (1,2 GB) se marca como "fast, recommended".

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-i1-GGUF (esta ficha) | 1,7B | GGUF (imatrix) | Apache 2.0 | en, zh | Más de 20 cuantizaciones, desde 0,6 GB |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,5B | GGUF, safetensors | Qwen Research (restricciones en algunos casos) | multilingüe (29+) | Competidor directo en tamaño; contexto 32K documentado |
| Llama-3.2-1B-Instruct (GGUF) | 1,24B | GGUF, safetensors | Llama 3.2 Community License | multilingüe (8) | Amplio soporte de ecosistema; licencia con condiciones de uso |
| Gemma-2-2B-it (GGUF) | 2,6B | GGUF, safetensors | Gemma Terms of Use | multilingüe | Mayor tamaño pero también cabe en GPUs de consumo |

La ventaja diferencial de esta ficha frente a alternativas es la licencia Apache 2.0 sin restricciones y la gran variedad de cuantizaciones imatrix; la desventaja es la falta de documentación pública sobre benchmarks y arquitectura del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al no existir model card detallada del modelo base, no hay auditorías de sesgo documentadas.
- Riesgo de alucinación: propio de cualquier LLM de 1,7B; los modelos pequeños tienden a alucinar con mayor frecuencia en tareas de conocimiento factual y razonamiento complejo.
- Limitaciones de idioma: soporte declarado solo para inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior o no garantizado.
- Longitud de contexto: no disponible, lo que dificulta planificar aplicaciones con documentos largos; verificar la configuración en llama.cpp antes de producción.
- Capacidades no documentadas: no hay evidencia de tool calling, agentes, visión ni razonamiento extendido; asumir que es un modelo conversacional de texto plano.
- Cuantizaciones extremas: IQ1_S/IQ1_M (marcadas "for the desperate") degradan notablemente la calidad; evitarlas en producción salvo restricciones severas de memoria.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin royalties; no se identifican restricciones. Verificar igualmente que el modelo base no herede condiciones adicionales de terceros.
- Para producción, al no existir benchmarks publicados, se recomienda evaluación interna con casos de uso propios antes de desplegar.

## Enlaces

- Repositorio de la cuantización (esta ficha): https://huggingface.co/mradermacher/Spark-X2.6-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Spark-X2.6-1.7B-i1-GGUF
- Solicitudes de cuantización al autor: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
