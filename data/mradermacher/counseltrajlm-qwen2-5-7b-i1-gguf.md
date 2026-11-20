# mradermacher/CounselTrajLM-Qwen2.5-7B-i1-GGUF

## Resumen
CounselTrajLM-Qwen2.5-7B-i1-GGUF es una distribucion cuantizada del modelo CounselTrajLM-Qwen2.5-7B, publicado originalmente por UEC-InabaLab y convertido a formato GGUF por mradermacher. El modelo base parte de Qwen2.5-7B, un transformer decoder-only de 7.615.616.512 parametros (aproximadamente 7,6 mil millones), y ha sido ajustado por el laboratorio UEC-InabaLab para tareas conversacionales y de orientacion (counseling), segun se deduce del nombre y de la etiqueta "conversational" del repositorio.

Esta version concreta es un artefacto de inferencia local: el autor ha generado 25 variantes de cuantizacion GGUF con tecnica imatrix (importance matrix), lo que permite ejecutar el modelo en hardware consumer con perdidas de calidad controladas. El repositorio pesa 22,4 GB en total y esta etiquetado como compatible con endpoints, lo que sugiere uso en servidores de inferencia tipo llama.cpp.

La relevancia de esta ficha radica en que se trata de un modelo de nicho (orientacion conversacional en japones, presumiblemente, dado el origen del laboratorio), empaquetado para despliegue local. No hay descargas ni likes registrados en el momento de la consulta, y la model card del autor de la cuantizacion no aporta informacion sobre el entrenamiento, los datos o los benchmarks del modelo base.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL (small-IQ4_NL), Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversion desde safetensors via convert_type: hf) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-7B: un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado originalmente por Alibaba Qwen. Sobre esa base, UEC-InabaLab ha realizado un ajuste fino orientado a conversacion y orientacion (CounselTrajLM), presumiblemente con datos de dialogo terapeutico o de apoyo, aunque la model card disponible no documenta el corpus, el numero de tokens ni si se aplico RLHF o DPO.

La contribucion tecnica de esta ficha es la cuantizacion: mradermacher ha generado las variantes GGUF con imatrix (importance matrix), un metodo que pondera la importancia de cada tensor durante la cuantizacion para preservar mejor la calidad en bitrates bajos. El pipeline declara `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que la conversion se hizo desde pesos Hugging Face con cuantizacion de tensores de salida activada. No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones en el modelo base.

## Capacidades
- Generacion de texto conversacional multi-turno, orientada a dialogo de apoyo y orientacion.
- Razonamiento general y respuesta a instrucciones, heredado de Qwen2.5-7B.
- Generacion de codigo y matematicas basicas (capacidad heredada del base Qwen2.5, no verificada en esta variante).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el modelo base Qwen2.5 es multilingue, pero no se documenta el alcance tras el ajuste fino.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso
- Asistente conversacional de orientacion y apoyo emocional: el modelo esta ajustado especificamente para dialogos de counseling, por lo que puede gestionar conversaciones multi-turno con tono empatico y estructura de seguimiento, siempre con supervision humana en entornos sensibles.
- Prototipado de chatbots de salud mental o bienestar: util para generar respuestas de primera linea en aplicaciones de triaje conversacional, con derivacion a profesionales cuando se detecten senales de riesgo.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M o Q5_K_M (tipicamente en torno a 4-5 GB), puede ejecutarse en GPUs consumer como RTX 3060 de 12 GB o superiores mediante llama.cpp u Ollama.
- Investigacion en dialogo terapeutico: permite reproducir experimentos de evaluacion de respuestas de apoyo con un modelo de 7B ajustado, sin depender de APIs externas.
- Generacion de guiones y simulaciones de entrevista: para entrenamiento de profesionales de orientacion, generando respuestas de cliente sinteticas en escenarios controlados.
- Servicio de inferencia compatible con endpoints: la etiqueta `endpoints_compatible` sugiere integracion en servidores de inferencia tipo llama.cpp server o TGI-compatible, permitiendo exponer el modelo como API interna.
- Fine-tuning adicional sobre la variante cuantizada: aunque menos recomendable que partir del safetensors original, las variantes Q6_K o Q8 (si existieran) permiten experimentos de adaptacion con LoRA sobre GGUF.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - IQ1_S / IQ1_M: en torno a 2-2,5 GB.
  - Q2_K / IQ2_XXS: en torno a 2,5-3 GB.
  - Q3_K_M / IQ3_M: en torno a 3,5-4 GB.
  - Q4_K_M / IQ4_XS: en torno a 4,5-5 GB.
  - Q5_K_M: en torno a 5,5-6 GB.
  - Q6_K: en torno a 6,5-7 GB.
  - (Estas cifras son estimaciones tipicas para modelos de 7B en GGUF; no se han verificado contra el repo concreto.)
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 40 GB, H100 80 GB.
- Cabe en GPU consumer: si, desde una RTX 3060 12 GB con cuantizaciones Q4_K_M o superiores; las variantes IQ2/IQ3 caben incluso en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con endpoints (llama.cpp server). vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que se recomienda usar el safetensors original para esos motores.
- Latencia y throughput: no disponible; depende del hardware y de la cuantizacion. En una RTX 4090 con Q4_K_M se espera un throughput del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CounselTrajLM-Qwen2.5-7B-i1-GGUF (este) | 7,6 B | no disponible | no disponible | GGUF (25 cuantizaciones) | Ajuste fino de counseling, cuantizado con imatrix |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (segun model card oficial de Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Base general multilingue, sin ajuste de counseling |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Alternativa general con contexto largo |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa europea generalista |

La comparativa con Qwen2.5-7B-Instruct es la mas directa, dado que este modelo deriva de el; sin embargo, no se dispone de datos de rendimiento del ajuste fino de UEC-InabaLab para establecer diferencias cuantitativas.

## Limitaciones y advertencias
- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion comunitaria ni de evaluacion independiente.
- La model card del repositorio GGUF no incluye informacion sobre el corpus de entrenamiento, los idiomas, la licencia ni los benchmarks; esto impide evaluar sesgos y calidad de forma rigurosa.
- Riesgo de alucinacion inherente a cualquier LLM de 7B, especialmente en dominios sensibles como salud mental; no debe usarse como sustituto de atencion profesional.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Se recomienda consultar la licencia del modelo base (UEC-InabaLab/CounselTrajLM-Qwen2.5-7B) y la de Qwen2.5 antes de desplegar en produccion.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la coherencia y la calidad conversacional; para uso real se recomienda Q4_K_M o superior.
- Contexto maximo no documentado en esta variante; asumir el del modelo base Qwen2.5 (32.768 tokens) solo como referencia, no como garantia.
- Idiomas no documentados: el ajuste fino podria haber reducido el multilinguesismo del base Qwen2.5; verificar antes de desplegar en castellano.
- El repositorio pesa 22,4 GB por incluir 25 cuantizaciones; descargar solo la variante necesaria para evitar consumo innecesario de almacenamiento.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/CounselTrajLM-Qwen2.5-7B-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/UEC-InabaLab/CounselTrajLM-Qwen2.5-7B
- Modelo base original Qwen2.5-7B (Alibaba Qwen): https://huggingface.co/Qwen/Qwen2.5-7B
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Herramienta de cuantizacion llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentacion de imatrix en llama.cpp: https://github.com/ggerganov/llama.cpp/tree/master/tools/imatrix
