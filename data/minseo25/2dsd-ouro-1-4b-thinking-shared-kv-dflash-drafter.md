# minseo25/2dsd-ouro-1.4b-thinking-shared-kv-dflash-drafter

## Resumen

2DSD DFlash drafter para Ouro-1.4B-Thinking con shared-KV es un modelo auxiliar (*drafter*) de decodificación especulativa, no un modelo generativo autónomo. Lo desarrolla Minseo Kim y el grupo SqueezeAILab (UC Berkeley) en el marco del paper *2DSD: Two-Dimensional Speculative Decoding for Looped Language Models*. Su funcion es proponer tokens candidatos que el modelo objetivo (Ouro-1.4B-Thinking con compartición de KV en el último loop, W = 64) verifica, acelerando la generación sin alterar la distribución de salida.

El modelo resuelve un problema concreto: los modelos con bucles (*looped language models*) reutilizan el mismo transformer varias veces por token, lo que multiplica el coste de inferencia. La decodificación especulativa clásica no funciona bien aquí porque el drafter debe operar en distintos profundidades de loop. 2DSD introduce un drafter condicionado por profundidad que sirve para todos los loops r = 1,...,R (R = 4) con un único conjunto de pesos.

Es relevante ahora porque la decodificación especulativa se ha convertido en el mecanismo estándar para reducir latencia en producción, y este drafter es una pieza específica para la familia Ouro de ByteDance. Con 378,5 millones de parámetros reales en safetensors (repo de 0,8 GB), es un componente ligero que se acopla al target de 1,4B. La licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas, drafter de decodificación especulativa condicionado por profundidad de loop (DFlash) |
| Parametros totales | 378.561.792 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Ancho oculto | 2048 (igual que el target) |
| Tamaño de bloque (k) | 16 |
| Loops del target (R) | 4 |
| Capas del target usadas como contexto | índices 1, 6, 11, 16 y 21 (de 24) |

## Arquitectura y entrenamiento

El drafter es una red transformer de 5 capas con ancho oculto 2048, igual que el target, y tamaño de bloque k = 16. Un único drafter sirve para todas las profundidades de loop r = 1,...,R (R = 4) del modelo objetivo, lo que evita entrenar un drafter por profundidad. Las entradas de contexto de loop combinan, al generar propuestas en el loop r, features del loop R de los tokens ya confirmados con features del loop r de los tokens en vuelo, tomadas de cinco capas del target (índices 0-based 1, 6, 11, 16 y 21 de 24).

El drafter reutiliza los embeddings congelados y la LM head del target (el modelo publicado incluye una copia de la LM head), mientras que el *mask embedding* sí se aprende. Se entrenó sobre rollouts de 13.000 prompts durante seis épocas con tamaño de bloque 16, muestreando profundidades r en {1, 2, 3, 4} con probabilidades (0,5; 0,125; 0,125; 0,25). La verificación se realiza con el último loop del target, de modo que se preservan las salidas greedy y la distribución de muestreo del modelo original.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Ouro-1.4B-Thinking con shared-KV; no genera texto de forma autónoma.
- Borrador multi-token por bloque (k = 16) verificado por el target.
- Condicionamiento por profundidad de loop: cubre r = 1 a 4 con un solo conjunto de pesos.
- Reutilización de embeddings y LM head del target, con mask embedding aprendido.
- Preservación de la distribución del target: no introduce sesgo en la salida verificada.
- Decodificación greedy por defecto; muestreo opcional con temperatura 0,6 y top-p 0,95.
- No se documentan tool calling, agentes, visión, audio ni capacidades multilingües propias; dependen del target.

## Casos de uso

- Aceleración de inferencia de Ouro-1.4B-Thinking en producción: el drafter propone bloques de 16 tokens que el target verifica con su último loop, reduciendo el número de pasos de decodificación del modelo bucleado.
- Servicio de razonamiento matemático de baja latencia: el prompt de ejemplo del autor ("suma de los primeros 100 enteros positivos") ilustra el uso en tareas de thinking donde la latencia importa; el drafter mantiene la salida greedy del target.
- Despliegue de agentes con many-step reasoning: al preservar la distribución del target, se puede usar como capa de aceleración transparente en pipelines de agentes que ya empleen Ouro-1.4B-Thinking.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar drafters condicionados por profundidad en modelos con loops, con código y paper públicos.
- Evaluación comparativa de técnicas de aceleración: permite medir acceptance rate y speedup frente a drafters clásicos sobre el mismo target shared-KV.
- Prototipado en entornos con una sola GPU consumer: al ser un componente de 0,38B parámetros en safetensors (repo de 0,8 GB), se puede cargar junto al target de 1,4B en hardware modesto, sujeto a los requisitos del target.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de acceptance rate o speedup.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para el drafter; debe sumarse a la del target Ouro-1.4B-Thinking con shared-KV.
- El drafter tiene 378,5 M parámetros y un repo de 0,8 GB en safetensors; en FP16 ocupa aproximadamente 0,75 GB, cantidad estimada a partir del número de parámetros.
- GPU recomendadas: no disponible en la información proporcionada; depende del target y del framework 2DSD.
- Compatibilidad con GPU consumer: no confirmada; el tamaño del drafter es reducido, pero el target de 1,4B y el pipeline de verificación condicionan el requisito total.
- Opciones de despliegue: el repositorio SqueezeAILab/2DSD mediante `scripts/generate.py --model ouro-1.4b-thinking`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el beneficio depende del acceptance rate del drafter, no reportado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2DSD DFlash drafter (este) | 378,5 M | no disponible | Drafter especulativo para Ouro-1.4B-Thinking shared-KV | Apache 2.0 | Hugging Face, 8 descargas |
| Drafters EAGLE / EAGLE-3 | no disponible | no disponible | Decodificación especulativa genérica | no disponible | no disponible |
| Drafters Medusa | no disponible | no disponible | Cabezas especulativas sobre modelo base | no disponible | no disponible |
| Ouro-1.4B-Thinking (target) | 1,4B (según nombre) | no disponible | Modelo bucleado de razonamiento | Apache 2.0 | Hugging Face (ByteDance) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo independiente: requiere el target `minseo25/2dsd-ouro-1.4b-thinking-shared-kv` y el código de 2DSD para funcionar.
- Acoplado a una configuración concreta del target (shared-KV con W = 64, R = 4, 24 capas); no es portable a otras variantes sin reentrenamiento.
- Solo se ha entrenado con prompts de rollouts (13.000) y profundidades r en {1,2,3,4}; el rendimiento fuera de esa distribución no está documentado.
- Riesgo de alucinación: no aplica directamente al drafter, ya que el target verifica cada token; la calidad final depende del target Ouro-1.4B-Thinking.
- Idiomas soportados no disponibles; la cobertura lingüística hereda la del target.
- Longitud de contexto no disponible; no se documentan límites de ventana.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Ouro-1.4B-Thinking y incluye una copia de su LM head; conviene revisar los términos del modelo original ByteDance.
- Tracción muy baja (8 descargas, 0 likes) y creado en noviembre de 2026: no hay evidencia de validación por terceros.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita opciones de despliegue ligero.

## Enlaces

- Hugging Face: https://huggingface.co/minseo25/2dsd-ouro-1.4b-thinking-shared-kv-dflash-drafter
- Modelo base (target shared-KV): https://huggingface.co/minseo25/2dsd-ouro-1.4b-thinking-shared-kv
- Modelo original Ouro-1.4B-Thinking: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Código 2DSD: https://github.com/SqueezeAILab/2DSD
