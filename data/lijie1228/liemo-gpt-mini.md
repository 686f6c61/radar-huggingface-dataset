# lijie1228/liemo-gpt-mini

## Resumen

Liemo GPT Mini es un modelo de lenguaje de tipo decoder-only entrenado desde cero por el desarrollador independiente lijie1228 (bajo el paraguas del proyecto "烈模 Liemo"). Se distribuye en dos variantes: Liemo 64M, con 63,74 millones de parámetros y entrenado sobre wiki en chino más datos de conversación, y Liemo-mini 32M, con 33,49 millones de parámetros y un corpus compuesto al 95 % por diálogo y al 5 % por wiki. Ambos son modelos a nivel de carácter (char-level), es decir, tokenizan por carácter en lugar de por subpalabra, una decisión poco habitual en modelos modernos que simplifica el vocabulario pero limita la eficiencia.

El modelo resuelve un nicho muy concreto: servir como base experimental de generación de texto en chino con un coste computacional mínimo, apto para ejecutarse en hardware muy modesto o incluso en CPU. No compite con modelos de escala generalista; su interés es didáctico y de prototipado rápido, ya que el autor publica los pesos en formato `.pt` (requieren la definición del modelo) y en GGUF (F16 y Q8_0) listos para cargar con llama.cpp.

La relevancia actual es limitada pero clara para quien quiera estudiar el entrenamiento desde cero de un GPT pequeño en chino, experimentar con cuantización GGUF a escalas minúsculas o integrar un generador de texto de bajo consumo en entornos con restricciones de memoria. La información pública disponible es escasa: no hay model card detallada, ni benchmarks, ni documentación de la arquitectura más allá de la tabla de parámetros y corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), tokenización a nivel de carácter (char-level) |
| Parametros totales | 63,74 M (Liemo 64M) / 33,49 M (Liemo-mini 32M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 y Q8_0 (GGUF); pesos `.pt` en precisión original no especificada |
| Idiomas soportados | Chino (zh) |
| Licencia | MIT |
| Formato de pesos | `.pt` (requiere definición del modelo) y GGUF (F16, Q8_0) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de tipo GPT, entrenado desde cero y con tokenización a nivel de carácter. El autor no detalla el número de capas, dimensión oculta, número de cabezas de atención ni la longitud de contexto, por lo que estos hiperparámetros no están disponibles. La elección de tokenización por carácter implica un vocabulario reducido (probablemente unos pocos miles de caracteres chinos) y secuencias más largas en tokens para el mismo texto, lo que penaliza la eficiencia frente a tokenizadores BPE.

En cuanto a los datos, Liemo 64M se entrenó sobre wiki en chino más datos de conversación, mientras que Liemo-mini 32M usó un corpus compuesto al 95 % por diálogo y al 5 % por wiki, lo que explica su orientación conversacional. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal; el modelo parece ser una implementación convencional a pequeña escala.

## Capacidades

- Generación de texto en chino a nivel de carácter, con coherencia limitada por el tamaño del modelo.
- Generación de respuestas conversacionales, especialmente en la variante 32M, entrenada mayoritariamente con diálogo.
- Continuación de texto y modelado de lenguaje genérico sobre contenido tipo wiki.
- Ejecución en CPU y hardware de bajos recursos gracias a los formatos GGUF F16 y Q8_0.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del chino.
- No se documentan modos especiales (thinking, visión, audio) ni otras modalidades.

## Casos de uso

- Prototipado educativo de entrenamiento desde cero: el modelo sirve para estudiar el pipeline completo de un GPT pequeño en chino, desde la tokenización por carácter hasta la exportación a GGUF, con un coste de cómputo mínimo.
- Generación de texto de relleno en aplicaciones de demostración: útil para poblar interfaces o tests con texto chino sintético sin depender de APIs externas ni de modelos grandes.
- Experimentación con cuantización GGUF: sus dos variantes (F16 y Q8_0) permiten comparar calidad y tamaño en un rango de parámetros muy pequeño, ideal para validar herramientas de llama.cpp.
- Chatbot de juguete o asistente de bajo consumo: la variante 32M, entrenada al 95 % con diálogo, puede integrarse en entornos embebidos o scripts para generar respuestas conversacionales simples en chino.
- Filtrado o etiquetado léxico aproximado: al modelar caracteres, puede emplearse para tareas exploratorias de puntuación de secuencias cortas en chino, siempre con validación humana.
- Base para fine-tuning experimental: al ser MIT y tener pocos parámetros, es una base barata para probar recetas de ajuste fino sobre dominios concretos antes de escalar a modelos mayores.
- Enseñanza de NLP en chino: sirve como ejemplo práctico de las limitaciones de la tokenización por carácter frente a BPE en un contexto docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en F16 para ambos modelos (63,74 M parámetros ≈ 127 MB en F16; 33,49 M ≈ 67 MB en F16); en Q8_0 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada; el modelo cabe en iGPU y en CPU.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050 o inferiores, y también en Raspberry Pi y dispositivos embebidos con suficiente RAM.
- Opciones de despliegue: llama.cpp con los ficheros GGUF (F16 o Q8_0); los pesos `.pt` requieren cargar la definición del modelo en PyTorch.
- Latencia y throughput: no disponibles; por el tamaño, se espera inferencia en tiempo real incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Liemo 64M | 63,74 M | no disponible | zh | MIT | `.pt`, GGUF |
| Liemo-mini 32M | 33,49 M | no disponible | zh | MIT | `.pt`, GGUF |
| Modelos GPT-2 pequeños (referencia) | 124 M | 1024 | en | MIT | safetensors, GGUF |
| TinyLlama (referencia) | 1,1 B | 2048 | en, zh | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre Liemo y estos modelos de referencia; la comparación se limita a escala, licencia y formatos. Los modelos citados como referencia son alternativas de escala superior y no equivalentes directos.

## Limitaciones y advertencias

- Tamaño muy reducido (33-64 M de parámetros): la coherencia, el conocimiento factual y la calidad de generación serán limitados en comparación con modelos de miles de millones de parámetros.
- Riesgo elevado de alucinación y de respuestas incoherentes, especialmente en temas factuales.
- Tokenización por carácter: menor eficiencia y posible peor manejo de palabras poco frecuentes o de puntuación.
- Idiomas: solo chino documentado; no se garantiza comportamiento en otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones largas sin verificación empírica.
- Sesgos: no se documenta ningún análisis de sesgos; al entrenarse con wiki y diálogo en chino, puede reproducir sesgos presentes en esos corpus.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene auditar los datos de entrenamiento antes de usarlo en producción.
- Ausencia de benchmarks y de documentación técnica detallada: difícil justificar su adopción en entornos productivos.
- Los pesos `.pt` requieren la definición del modelo del autor; solo los GGUF son autocontenidos y directamente cargables.

## Enlaces

- Hugging Face: https://huggingface.co/lijie1228/liemo-gpt-mini
- Pesos Liemo 64M: https://huggingface.co/lijie1228/liemo-gpt-mini/tree/main/liemo-64m/weights
- Pesos Liemo-mini 32M: https://huggingface.co/lijie1228/liemo-gpt-mini/tree/main/liemo-32m/weights
- llama.cpp (carga de GGUF): https://github.com/ggerganov/llama.cpp
