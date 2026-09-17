# somasekhar-dev/NextToken-model-1

## Resumen

NextToken-model-1 es un modelo de lenguaje base (no ajustado a instrucciones) de 272.780.288 parámetros, publicado por el usuario somasekhar-dev en HuggingFace. Está preentrenado desde cero sobre 11 lenguas indias (hindi, bengalí, tamil, telugu, maratí, guyaratí, canarés, malayalam, punyabí, oriya) más inglés, usando el corpus Sangraha. Arquitectónicamente es un transformer decoder-only denso estructuralmente equivalente a Qwen3, guardado en formato `Qwen3ForCausalLM` para poder cargarse con `transformers` estándar.

Su relevancia está en el nicho: los modelos por debajo de 300 millones de parámetros suelen centrarse en inglés, mientras que este checkpoint apunta explícitamente a cobertura multilingüe india con un coste de inferencia mínimo (unos 0,55 GB en fp16). Es, por tanto, un candidato a base para ajuste fino, destilación o investigación sobre escalado en lenguas con pocos recursos.

Ahora bien, conviene ser claro sobre su madurez: es un checkpoint temprano (paso 23.500, pérdida de validación 2,9318), sin benchmarks publicados, sin licencia declarada, sin plantilla de chat, con una ventana de contexto de solo 2048 tokens y con 0 descargas y 0 likes en el momento de redactar esta ficha. El propio autor indica que el repositorio se actualizará in situ conforme avance el ajuste fino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estructuralmente equivalente a Qwen3 (clase `Qwen3ForCausalLM`); GQA, RMSNorm pre-norm, QK-norm por cabeza antes de RoPE, FFN SwiGLU |
| Parámetros totales | 272.780.288 (69,7 M de embeddings atados a la cabeza de salida; 203,0 M de transformer) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | No se publican cuantizaciones oficiales; los pesos se distribuyen en safetensors fp32 (repo de 1,1 GB) y admiten cuantización posterior con herramientas estándar (bitsandbytes, GPTQ, AWQ) o conversión a GGUF |
| Idiomas soportados | Hindi, inglés, bengalí, tamil, telugu, maratí, guyaratí, canarés, malayalam, punyabí, oriya (11 idiomas declarados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato `transformers`, compatible con `Qwen3ForCausalLM`) |
| Capas | 16 |
| Tamaño oculto | 1024 |
| Cabezas de atención | 16 de consulta, 4 de clave/valor (GQA) |
| Tamaño intermedio FFN | 3277 |
| Codificación posicional | RoPE con theta = 10000 |
| Tokenizer | `sarvamai/sarvam-1`, vocabulario de 68.096 tokens |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 16 capas y tamaño oculto 1024, con atención de consultas agrupadas (GQA): 16 cabezas de consulta frente a 4 cabezas de clave/valor, lo que reduce el coste de la caché KV. La normalización combina RMSNorm pre-norm con QK-norm por cabeza aplicada antes de RoPE. La FFN usa SwiGLU con tamaño intermedio de 3277 píxeles de dimensión, y los embeddings de entrada están atados a la cabeza de salida (69,7 M de los 272,7 M de parámetros corresponden a este bloque). El autor indica que la arquitectura está construida con primitivas componibles propias y que su equivalencia estructural con Qwen3 se confirmó mediante comparación directa de código fuente durante la conversión a HuggingFace, verificada numéricamente (100 % de coincidencia de argmax entre el modelo original y el convertido sobre entradas aleatorias, más una ida y vuelta completa `save_pretrained`/`from_pretrained`).

El preentrenamiento se realizó sobre el corpus Sangraha (11 lenguas indias más inglés) en dos fases de aproximadamente 5.700 millones de tokens cada una, usando una mezcla de GPUs H100 y V100. El checkpoint publicado corresponde al mejor valor de pérdida de validación de la fase de 11 idiomas (paso 23.500, pérdida 2,9318). No se documenta ningún proceso de RLHF, DPO o ajuste por instrucciones, ni se detalla la composición exacta del dataset (proporción por idioma, filtrado, deduplicación) ni el uso de técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto por continuación de secuencia (next-token prediction) en 11 lenguas indias y en inglés.
- Modelado de lenguaje multilingüe con un vocabulario compartido de 68.096 tokens, lo que permite mezclar idiomas dentro de una misma secuencia.
- Capacidad de servir como base para ajuste fino supervisado (SFT), ajuste con preferencias (DPO/ORPO) o aprendizaje por refuerzo, al exponerse como modelo `transformers` estándar.
- Compatibilidad con el ecosistema de inferencia: el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`.
- No soporta tool calling ni function calling: no hay formato de herramientas ni ajuste para ello.
- No soporta razonamiento multi-paso guiado ni comportamiento de agente; al no estar ajustado a instrucciones, no sigue bucles de planificación con formato estructurado.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- No incluye plantilla de chat ni tokens especiales de rol, por lo que no puede operar como asistente conversacional sin un ajuste previo.

## Casos de uso

- Ajuste fino supervisado para asistentes en lenguas indias: al partir de un modelo preentrenado en 11 idiomas, el coste de crear un asistente para hindi, tamil o bengalí se reduce frente a partir de un modelo solo en inglés. Se usaría como inicialización y se entrenaría con pares instrucción-respuesta en el idioma objetivo.
- Continuación de preentrenamiento sobre corpus de dominio: con 272,7 M de parámetros y fp16 a ~0,55 GB, se puede hacer entrenamiento continuado sobre corpus legales, médicos o administrativos de un idioma concreto en una única GPU consumer, algo inviable con modelos de 7B o más.
- Generación de datos sintéticos: el modelo puede producir texto de relleno o variaciones léxicas para aumentar corpus de lenguas con pocos recursos, siempre con revisión humana dado el riesgo de incoherencia de un modelo base.
- Investigación sobre tokenización multilingüe: el uso del tokenizer `sarvamai/sarvam-1` con 68.096 tokens permite estudiar la fertilidad de tokenización y el reparto de vocabulario entre 11 lenguas indias y el inglés en un modelo pequeño.
- Estudios de escalado y ablaciones: con 16 capas, 1024 de oculto y ~5,7 B tokens por fase documentados, sirve como punto de referencia reproducible para comparar curvas de pérdida, proporciones de datos por idioma o variantes de normalización (RMSNorm + QK-norm frente a alternativas).
- Autocompletado de texto sin conexión en dispositivos con recursos limitados: al caber en menos de 1 GB en fp32 y ~0,55 GB en fp16, es viable ejecutarlo en CPU o en GPUs integradas para sugerencias de escritura en hindi o bengalí sin enviar datos a la nube.
- Destilación desde modelos mayores: puede actuar como estudiante en experimentos de destilación hacia lenguas indias, aprovechando que su formato de pesos es directamente cargable y entrenable.
- Validación de infraestructura de despliegue: útil como modelo de prueba para verificar pipelines con TGI, vLLM o endpoints compatibles antes de escalar a modelos mayores, por su peso reducido y su carga rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato cuantitativo de calidad aportado por el autor es la pérdida de validación del checkpoint publicado: 2,9318 en el paso 23.500 de la fase de 11 idiomas. No hay resultados de MMLU, HumanEval, GSM8K, ni de evaluaciones específicas para lenguas indias (por ejemplo, IndicGLUE o MILU), ni comparaciones con modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 (formato publicado) unos 1,1 GB; en fp16/bf16 unos 0,55 GB; en int8 unos 0,28 GB; en int4 unos 0,15 GB.
- Caché KV: con 16 capas, 4 cabezas KV y dimensión de cabeza 64 (1024/16), cada token ocupa aproximadamente 8 KB en fp16 (2 × 16 × 4 × 64 × 2 bytes), es decir, unos 16 MB para una secuencia completa de 2048 tokens.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM es suficiente para inferencia (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090). Para ajuste fino completo, una RTX 3090/4090 o una A100/H100 ofrecen una holgura amplia; el entrenamiento original se hizo con H100 y V100.
- ¿Cabe en GPU consumer? Sí, en todas las gamas actuales e incluso en iGPU con memoria compartida suficiente. También es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (ruta directa, tal como aparece en la model card), TGI (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el autor no publica.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en ninguna configuración de hardware.

## Comparativa con modelos similares

Los datos de los modelos de referencia provienen de sus respectivas model cards públicas; no existe ningún benchmark publicado de NextToken-model-1, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

| Modelo | Parámetros | Contexto | Idiomas destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NextToken-model-1 | 272,7 M | 2048 | 11 lenguas indias + inglés | No disponible | safetensors fp32 en HuggingFace; 0 descargas |
| Qwen3-0.6B | ~0,6 B | 32.768 | Multilingüe general | Apache 2.0 | safetensors y GGUF; adopción amplia |
| Qwen2.5-0.5B | ~0,49 B | 32.768 | Multilingüe general | Apache 2.0 | safetensors y GGUF; adopción amplia |
| Sarvam-1 | ~2 B | No disponible en esta ficha | Lenguas indias + inglés | No disponible en esta ficha | safetensors en HuggingFace |

Diferencias clave: frente a las alternativas de Qwen, este modelo ofrece menos parámetros, una ventana de contexto 16 veces menor y carece de ajuste a instrucciones, pero cubre 11 lenguas indias de forma explícita desde el preentrenamiento en lugar de depender de transferencia multilingüe. Frente a Sarvam-1, es aproximadamente siete veces más pequeño, lo que rebaja los requisitos de hardware a cambio de capacidad. La ausencia de licencia declarada es una desventaja competitiva frente a las licencias Apache 2.0 de las alternativas de Qwen.

## Limitaciones y advertencias

- Es un modelo base, no ajustado a instrucciones: continuará texto, pero no responderá preguntas ni seguirá instrucciones en formato de chat. El propio autor lo advierte de forma explícita.
- No incluye plantilla de chat ni tokens de rol, por lo que cualquier uso conversacional requiere un ajuste fino previo.
- Ventana de contexto de solo 2048 tokens, muy inferior a los 32.768 tokens habituales en modelos pequeños de generación reciente; limita resúmenes largos, análisis de documentos y diálogos multi-turno extensos.
- Licencia no disponible: al no especificarse términos, el uso comercial y la redistribución quedan en una situación jurídica incierta. Conviene contactar con el autor antes de cualquier despliegue en producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en ninguna tarea, lo que impide estimar su rendimiento real frente a alternativas.
- Repositorio en evolución: el autor indica que se actualizará in situ, de modo que el contenido asociado a la revisión `main` puede cambiar. Para reproducibilidad en producción habría que fijar una revisión concreta.
- Riesgo de alucinación elevado: la pérdida de validación de 2,9318 y el estado temprano del entrenamiento sugieren salidas con incoherencias gramaticales o factuales, especialmente fuera de las lenguas con más datos.
- Desequilibrio entre idiomas: ~5,7 B tokens por fase repartidos entre 11 lenguas indias y el inglés implica un volumen reducido por idioma, con calidad previsiblemente desigual entre el hindi y lenguas como el oriya o el malayalam.
- Sesgos potenciales heredados del corpus Sangraha (sesgos de género, geográficos, religiosos o de representación dialectal), no evaluados ni mitigados por el autor.
- Dependencia del tokenizer externo `sarvamai/sarvam-1`: si no se descarga correctamente, la carga fallará o producirá una tokenización inconsistente.
- Soporte limitado fuera de las 11 lenguas declaradas y del inglés: el castellano no figura entre los idiomas soportados, por lo que su uso en español no está previsto y dará resultados pobres.
- Sin cuantizaciones oficiales ni archivos GGUF: desplegarlo en llama.cpp u Ollama exige un proceso de conversión propio y validado por el usuario.
- Metadatos con fecha de creación 2026-09-17, posterior a la fecha habitual de publicación; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/somasekhar-dev/NextToken-model-1
- Tokenizer utilizado: https://huggingface.co/sarvamai/sarvam-1
- Corpus Sangraha (referido en la model card): https://huggingface.co/datasets/ai4bharat/sangraha
- Paper de referencia de la arquitectura Qwen3: no disponible en la información proporcionada
- Repositorio de código del autor: no disponible en la información proporcionada
- Demo o espacio de prueba: no disponible en la información proporcionada
- Búsqueda web realizada: los resultados devueltos no contienen información técnica relevante (únicamente enlaces genéricos de inicio de sesión de Facebook), por lo que no se han podido incorporar fuentes adicionales.
