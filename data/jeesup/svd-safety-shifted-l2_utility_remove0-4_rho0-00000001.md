# Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.00000001

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` mediante una técnica de compresión basada en descomposición en valores singulares (SVD). El autor, Jeesup, aplica una proyección de bajo rango con eliminación nominal del 40% de los parámetros de proyección (fracción real de parámetros factoriales sobre el modelo completo: 0,615424) y sin ajuste fino posterior de recuperación. El objetivo declarado es explorar cómo afecta la compresión a las métricas de seguridad del modelo, no ofrecer un modelo listo para producción.

El interés técnico reside en el enfoque de "desplazamiento de seguridad": se mide la utilidad con perplejidad sobre WikiText-2 y la identidad/sesgo de seguridad con generaciones sobre AdvBench (juzgadas con HarmBench) y XSTest, además de las primeras 500 peticiones de OR-Bench evaluadas con WildGuard. Se trata de un piloto unilateral, no de un SVD completo con información de Fisher, y el propio autor advierte que no establece ninguna garantía de seguridad.

Con solo 14 descargas y sin resultados de benchmarks publicados en la información disponible, debe considerarse un artefacto de experimentación académica. Los pesos se publican como matrices densas consolidadas, lo que facilita la evaluación pero no ofrece inferencia factorizada ni aceleración demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), pesos consolidados tras proyección SVD de bajo rango |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 2, no confirmada) |
| Tipos de cuantizacion | No disponible; el repo contiene safetensors en precisión nativa |
| Idiomas soportados | No disponibles |
| Licencia | llama2 |
| Formato de pesos | safetensors (matrices densas consolidadas, sin representación factorizada) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con atención multi-cabeza y RoPE. Sobre ese checkpoint se aplica una compresión SVD con un presupuesto de rango que elimina nominalmente el 40% de los parámetros de proyección; la fracción real de parámetros factoriales respecto al total del modelo es 0,615424. No hay ajuste fino de recuperación posterior a la compresión.

El criterio de compresión combina métricas de entrada y salida: la métrica de entrada es utilidad (momentos de WikiText) y la de salida es identidad, con un desplazamiento relativo rho de 1e-08, lambda global de 2,1182246274867613e-07 y ridge de 1e-05. La métrica mixta usa momentos de WikiText más 0,1 veces los momentos de peticiones dañinas/respuestas seguras. El gradiente se calcula con 128 ejemplos dañinos y 40 benignos, y la validación de entropía cruzada con 32 y 12 ejemplos separados. El objetivo pondera por igual la CE de respuestas seguras ante peticiones dañinas y la CE de respuestas útiles ante peticiones benignas. El autor lo describe explícitamente como un piloto unilateral, no un SVD completo con información de Fisher.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 2.
- Evaluación de seguridad: el checkpoint incluye artefactos para medir PPL en WikiText-2, generaciones en AdvBench con juicios HarmBench, XSTest y las primeras 500 peticiones de OR-Bench juzgadas con WildGuard.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso.
- No se documenta capacidad multilingüe específica ni modo de razonamiento explícito.
- No dispone de visión ni audio.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de comparación para estudiar cómo la eliminación de rangos en SVD afecta a la perplejidad y a las respuestas generadas frente al modelo base sin comprimir.
- Auditoría de seguridad en modelos comprimidos: permite medir la tasa de éxito de ataques (ASR) en AdvBench y comparar los juicios de HarmBench entre el checkpoint comprimido y Llama-2-7b-chat original.
- Estudio de alineación bajo presión de parámetros: útil para analizar si la compresión desplaza el comportamiento de rechazo ante peticiones dañinas, usando XSTest para detectar rechazos excesivos o insuficientes.
- Reproducción de experimentos: el directorio `experiment/` y `compression.json` permiten replicar las pérdidas de validación y los diagnósticos por matriz con los mismos hiperparámetros (rho, lambda, ridge).
- Evaluación de metodologías de juicio automático: los artefactos con WildGuard sobre OR-Bench permiten validar pipelines de clasificación de seguridad antes de aplicarlos a modelos mayores.
- Docencia y formación: ejemplo concreto de un pipeline de compresión SVD con métricas de utilidad y seguridad, útil en cursos de eficiencia de modelos y evaluación de riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los ficheros de evaluación contienen PPL de WikiText-2, generaciones de AdvBench con juicios de HarmBench, XSTest y las primeras 500 peticiones de OR-Bench juzgadas con WildGuard, pero no se incluyen cifras numéricas en la información proporcionada. El autor advierte que estas mediciones piloto no establecen una garantía de seguridad y recomienda inspeccionar la coherencia y las fracciones puntuadas junto con el ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16 GB es el mínimo ajustado y 24 GB es lo recomendable.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque no se han publicado conversiones oficiales en este repositorio.
- GPU recomendadas: A100 40/80 GB, H100 para evaluación por lotes; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090 (24 GB) como alternativa consumer.
- Sí cabe en GPU de consumo: RTX 4090 y RTX 3090 en FP16 con contexto limitado; RTX 4080/4070 Ti (16 GB) y GPUs de 12 GB requerirían cuantización.
- Opciones de despliegue: transformers con safetensors de forma nativa; vLLM y TGI para servir en FP16; llama.cpp u Ollama solo si se generan conversiones GGUF a partir de los pesos consolidados, no incluidas en el repo.
- Latencia y throughput: no disponibles. El autor indica explícitamente que la publicación no proporciona inferencia factorizada ni establece una aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.00000001 | 6.738.415.616 | No disponible | Compresión SVD con métrica de seguridad | llama2 | HuggingFace, 14 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens (según Llama 2) | Modelo base sin comprimir | llama2 | HuggingFace, ampliamente usado |
| Variantes de poda/SVD de Llama 2 de la literatura | Variable | Heredado de Llama 2 | Poda estructurada o SVD con recuperación | llama2 | Repositorios de investigación dispersos |

La comparación directa con alternativas de compresión publicadas no está disponible en la información proporcionada; no se aportan cifras de rendimiento que permitan situar este checkpoint frente a otros métodos de poda o factorización.

## Limitaciones y advertencias

- Checkpoint de investigación sin garantía de seguridad: el autor indica que las mediciones piloto no establecen ninguna garantía y que hay que inspeccionar coherencia y fracciones puntuadas junto al ASR.
- Sin ajuste fino de recuperación: la eliminación del 40% nominal de parámetros de proyección puede degradar la fluidez y la coherencia respecto a Llama-2-7b-chat.
- Piloto unilateral: no es un SVD completo con información de Fisher, por lo que los resultados no deben extrapolarse a métodos de compresión más sofisticados.
- Ejemplos de validación no completamente no vistos: el corpus de métrica mixta es más amplio, así que los ejemplos retenidos del gradiente no son del todo ajenos a la calibración.
- Sesgos heredados: al derivar de Llama 2, arrastra los sesgos conocidos del modelo base, potencialmente alterados de forma no controlada por la compresión.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión puede incrementarlo.
- Idiomas: no se documentan idiomas soportados; se asume el perfil multilingüe limitado de Llama 2, sin confirmación.
- Licencia llama2: impone restricciones de uso comercial y obligaciones de atribución; hay que revisar los términos de Meta antes de cualquier despliegue.
- Sin inferencia factorizada: los pesos se publican como matrices densas, por lo que no se obtiene la reducción de cómputo o memoria que cabría esperar del presupuesto de rango.
- Madurez: 14 descargas y 0 likes; sin pipeline declarado ni validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-shifted-l2_utility_remove0.4_rho0.00000001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
