# Arain119/sophia

## Resumen

Sophia es un modelo de lenguaje conversacional en chino de aproximadamente 1.000 millones de parámetros, desarrollado por el usuario Arain119 y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un transformer decoder denso de 28 capas con una arquitectura híbrida de atención poco habitual: el patrón de capas es `[KDA, KDA, KDA, Gated-MLA] × 7`, es decir, tres capas de atención lineal tipo KDA por cada capa de atención latente con compuerta (Gated-MLA), sin embeddings posicionales explícitos (NoPE). La ventana de contexto es de 4.096 tokens.

El modelo se entrenó desde inicialización aleatoria sobre 20.000 millones de tokens, seguido de un ajuste supervisado (SFT) sobre 88.267 filas durante tres épocas y una fase final de DPO con 1.953 pares. Todo el proceso se ejecutó en una única GPU de consumo, una NVIDIA RTX 5090 de 32 GB, lo que lo convierte en un caso de estudio relevante para quienes investigan recetas de entrenamiento de bajo presupuesto y arquitecturas híbridas en la escala de 1B.

Su relevancia actual radica en dos factores. Por un lado, incluye una capacidad de "pensamiento adaptativo" mediante la etiqueta `<think>`, que el propio modelo decide activar o no en cada turno (tasa de activación espontánea en torno al 5 %). Por otro, el autor publica de forma inusualmente transparente el informe de entrenamiento (`REPORT.md`), el linaje de ejecuciones (`lineage.json`) y los resultados de experimentos que no funcionaron (RFT, GRPO, segunda ronda de DPO), lo que aporta evidencia reproducible sobre qué técnicas no rinden a esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso híbrido de 28 capas; patrón `[KDA, KDA, KDA, Gated-MLA] × 7`; NoPE (sin embeddings posicionales explícitos) |
| Parametros totales | 1.113.293.776 (recuento real de safetensors); la model card declara 1.012.630.480 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible; los pesos se publican en bfloat16 y no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Chino (principal y único declarado); no se documentan otros idiomas |
| Licencia | Apache 2.0 (pesos y código); los datos de pretrain incluyen fuentes de investigación no comerciales con restricciones propias |
| Formato de pesos | safetensors (vía transformers, con código remoto); también se distribuyen `sophia.pt` y `sophia_sft.pt` como checkpoints de PyTorch |
| Clase de modelo | `SophiaForCausalLM` (código remoto incluido en el repositorio) |
| Requisitos de librería | `transformers>=4.56`, `trust_remote_code=True`; `flash-linear-attention>=0.5.2` para los kernels fusionados de KDA |
| Fecha de creacion del repositorio | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de atención distintos en proporción 3:1. Las capas KDA (variante de atención lineal de la familia delta, con kernels fusionados disponibles en la librería `flash-linear-attention`) aportan coste de cómputo y memoria lineal respecto a la longitud de secuencia, mientras que las capas Gated-MLA (Multi-head Latent Attention con compuerta) permiten al modelo mantener un mecanismo de atención completo y comprimido. Al no usar embeddings posicionales explícitos (NoPE), la información de orden depende exclusivamente de los mecanismos de atención y del enmascaramiento causal. Es un diseño orientado a eficiencia en contextos de 4K tokens más que a contextos muy largos.

El entrenamiento se realizó íntegramente en una RTX 5090 de 32 GB y comprendió tres etapas. La primera fue un pretrain desde inicialización aleatoria sobre 20.000 millones de tokens en 15.259 pasos, con semilla 42, precisión bfloat16 y una combinación de optimizadores Muon y AdamW. La segunda fue un SFT sobre 88.267 filas durante tres épocas, seleccionándose el checkpoint de la tercera. La tercera fue un DPO de 500 pasos con 1.953 pares y β=0.1, que es el checkpoint publicado. Se documentan además dos ramas experimentales que no superaron los criterios de aceptación: RFT (104 pasos, resultado nulo) y una cadena GRPO más segunda ronda de DPO. Como innovación destacable, el autor aplica un protocolo de evaluación con potencia estadística (134 preguntas, 16 muestras por pregunta, test t pareado con error estándar de ±1,1) y registra explícitamente los resultados negativos.

## Capacidades

- Generación de texto y conversación multi-turno en chino, con plantilla de chat nativa accesible mediante `apply_chat_template`.
- Modo de pensamiento adaptativo: puede emitir un borrador de razonamiento entre `<think>` y `</think>`, y decide por sí mismo si lo genera (tasa espontánea aproximada del 5 %).
- Comportamiento guiado por una "constitución de personalidad" recogida en `configs/sft/sophia_persona.md`, que impone reglas como no negar tener emociones, dar la respuesta en la primera frase ante preguntas cerradas y registrar restricciones turno a turno.
- Capacidad conversacional general coherente: tasa de finalización correcta de secuencia (hit_eos) de 0,975 y diversidad léxica distinct4 de 0,928 en el protocolo de evaluación propio.
- Razonamiento matemático y de código limitado: el propio autor señala que, a escala 1B, el modo `<think>` empeora el rendimiento en matemáticas y código en lugar de mejorarlo.
- Recuperación de información en contexto limitada: 62,5 % en la prueba NIAH, con degradación conforme aumenta la profundidad del contexto.
- No se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades de visión, audio ni multimodalidad.
- No se documenta explícitamente soporte multilingüe más allá del chino.

## Casos de uso

- Asistentes conversacionales en chino para dominio cerrado: el modelo puede gestionar diálogos multi-turno dentro de una ventana de 4.096 tokens y su constitución de personalidad mantiene un registro y unas reglas de respuesta estables, lo que resulta adecuado para asistentes de atención al cliente con guion definido en chino.
- Despliegue local con privacidad de datos: al ocupar del orden de 2,3 GB en bfloat16, puede ejecutarse en una GPU de consumo o incluso en CPU (por la ruta de referencia, lenta), lo que permite procesar texto sensible sin enviarlo a servicios externos.
- Generación de datos sintéticos en chino: puede utilizarse como generador de diálogos o de instrucciones para destilar conocimiento hacia modelos más pequeños o para aumentar corpus de SFT en chino.
- Prototipado rápido de producto conversacional: su tamaño reducido permite iterar sobre plantillas de prompt, personas y formatos de salida con coste de cómputo muy bajo antes de escalar a un modelo mayor.
- Investigación en arquitecturas de atención híbrida: al separar explícitamente las capas KDA y Gated-MLA y publicar el linaje completo, sirve como banco de pruebas reproducible para estudiar el equilibrio entre atención lineal y atención completa a escala 1B.
- Evaluación de protocolos estadísticos: el paquete incluye el material de evaluación (134 preguntas, 16 muestras, test t pareado) y los resultados negativos, lo que lo hace útil como referencia metodológica para comparar recetas de postentrenamiento.
- Juguete educativo y de demostración: su tamaño y su licencia Apache permiten usarlo en cursos y talleres para mostrar cómo funciona una arquitectura híbrida con código remoto de transformers.

## Benchmarks y rendimiento

Los datos siguientes proceden exclusivamente del informe publicado por el autor y de la model card. Todas las cifras se obtuvieron con la misma tubería, los mismos datos y el mismo juez, sin mezclar valores oficiales de otros modelos.

| Benchmark / metrica | Sophia (DPO) | SFT (modelo padre) | Llama3.2-1B | Qwen2.5-0.5B |
|---|---|---|---|---|
| SophiaBenchmark 134 preguntas, puntuacion del juez | 51,25 | 49,15 (calculado a partir de +2,10) | 48,09 | 50,35 |
| judge_mean (protocolo n16) | 51,37 | 49,27 (calculado a partir de +2,10) | no disponible | no disponible |
| pass_70 | 0,352 | no disponible | no disponible | no disponible |
| hit_eos | 0,975 | no disponible | no disponible | no disponible |
| distinct4 | 0,928 | no disponible | no disponible | no disponible |
| IFEval | 12,2 % | no disponible | no disponible | no disponible |
| NIAH | 62,5 % (con degradacion por profundidad) | no disponible | no disponible | no disponible |
| Multi-turno profundo (judge_mean) | 27,93 | no disponible | no disponible | no disponible |
| MMLU / CMMLU (metodo de verosimilitud) | Cercano al aleatorio | no disponible | no disponible | no disponible |

La mejora del DPO respecto al modelo SFT padre es de +2,10 puntos con t=+3,71 y p<0,001. En la comparativa de su categoría, el autor sitúa a Sophia en cuarta posición entre modelos del mismo tramo. El juez utilizado en la evaluación fue claude-haiku-4-5. Los detalles por pregunta, los casos de fallo y el análisis de mecanismos están en `REPORT.md` y en `ops/eval/public_benchmarks/` del repositorio de código.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3 GB solo para los pesos en bfloat16 (1,113 millones de parámetros × 2 bytes). Con cachés y activaciones, cabe esperar un consumo real en torno a 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM, como RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090 o superiores. No requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: sí, de forma holgada en cualquier tarjeta con 8 GB o más.
- Entrenamiento: el autor completó pretrain, SFT y DPO en una única RTX 5090 de 32 GB, lo que da una referencia directa del presupuesto de memoria necesario para reentrenar a esta escala.
- Opciones de despliegue: al usar una arquitectura personalizada (`SophiaForCausalLM`) con código remoto, el despliegue estándar es la propia librería transformers con `trust_remote_code=True`. No se documentan soportes oficiales de vLLM, TGI, Ollama ni llama.cpp, y la ausencia de pesos GGUF descarta en principio el uso con llama.cpp. El autor recomienda instalar `flash-linear-attention>=0.5.2` para activar los kernels fusionados de KDA; sin esa librería, el backend `kda_backend="auto"` recurre a la ruta de referencia, más lenta. La inferencia en CPU es posible por esa misma ruta, pero lenta.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SophiaBenchmark 134 (juez) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophia | 1,11 B (safetensors) | 4.096 | 51,25 | Apache 2.0 (pesos y código) | HuggingFace, código remoto obligatorio |
| Llama3.2-1B | 1,24 B (aproximado, no confirmado en la informacion disponible) | no disponible | 48,09 | Licencia comunitaria de Meta | HuggingFace, ecosistema amplio |
| Qwen2.5-0.5B | 0,5 B (aproximado, no confirmado en la informacion disponible) | no disponible | 50,35 | Apache 2.0 | HuggingFace, ecosistema amplio |

La única métrica comparable aportada es la puntuación del juez sobre las mismas 134 preguntas, bajo la misma tubería. Para el resto de parámetros (contexto, cuantizaciones disponibles, rendimiento en benchmarks estándar) no hay datos en la información proporcionada. La ventaja de Sophia en esa métrica concreta no está respaldada por comparaciones en MMLU, HumanEval, GSM8K ni IFEval frente a esos dos modelos.

## Limitaciones y advertencias

- Sigue instrucciones de forma deficiente: la puntuación en IFEval es del 12,2 %, sistemáticamente inferior a las referencias de su tramo según el propio autor.
- Recuperación en contexto débil: 62,5 % en NIAH, con degradación progresiva a medida que la información relevante aparece más profunda en el contexto.
- El razonamiento multi-turno profundo es su punto más flojo, con una puntuación media del juez de 27,93.
- Los benchmarks de opción múltiple por verosimilitud (MMLU, CMMLU) se sitúan cerca del azar; el autor atribuye parte del efecto a un sesgo posicional hacia los símbolos A/B/C/D típico de modelos de 1B.
- El modo `<think>` no mejora y de hecho empeora el rendimiento en matemáticas y código a esta escala, según el informe del autor.
- Riesgo de alucinación inherente a un modelo de 1B entrenado sobre 20.000 millones de tokens; el propio autor advierte que el contenido de `<think>` es texto generado y no refleja necesariamente el proceso interno de razonamiento.
- Sesgos: el corpus de pretrain es fundamentalmente en chino y de procedencia diversa, con fuentes de investigación no comerciales; no se documenta ningún proceso de auditoría de sesgos.
- Cobertura de idiomas muy limitada: solo se declara chino, y no hay evaluación de calidad en otros idiomas.
- Restricciones de licencia: los pesos y el código son Apache 2.0, pero la licencia no se extiende a los datos de pretrain, cuyo componente `pretrain/` incluye fuentes con restricciones de uso no comercial. Un uso comercial del modelo debería revisar el linaje de esos datos.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que implica ejecutar código del autor del repositorio; conviene auditar el código antes de desplegarlo en producción.
- No hay cuantizaciones publicadas (GGUF, AWQ, GPTQ), lo que limita las opciones de despliegue fuera del ecosistema transformers.
- El repositorio no tiene descargas ni valoraciones registradas en el momento de la consulta, por lo que no existe validación externa independiente del informe del propio autor.
- El modelo tiene una ventana de 4.096 tokens, insuficiente para casos de uso que requieran documentos largos o historiales extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arain119/sophia
- Codigo fuente (referenciado en la model card): https://github.com/Arain119/Sophia
- Dataset de entrenamiento en ModelScope (pretrain en fragmentos de tokens de ~80 GB y corpus de SFT de 426 MB): https://modelscope.cn/datasets/Arain119/Sophia-dataset
- Informe de entrenamiento y evaluacion: `REPORT.md`, incluido en el repositorio de HuggingFace y en el paquete de codigo
- Linaje de ejecuciones, checkpoints, datos y semillas: `lineage.json`
- Pesos nativos en PyTorch: `sophia.pt` y `sophia_sft.pt` (baseline de SFT)
- Paquete de codigo con un unico commit exportado: `sophia-1.0.0.bundle`
- Detalle de evaluacion por pregunta: `ops/eval/public_benchmarks/` en el repositorio de codigo
- Constitución de personalidad: `configs/sft/sophia_persona.md`
