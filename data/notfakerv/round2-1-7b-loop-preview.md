# notfakerv/round2-1.7b-loop-preview

## Resumen

round2-1.7b-loop-preview es una variante experimental del modelo LFM3-1.7B de Liquid AI, desarrollada por el usuario independiente notfakerv. Se trata de un fine-tuning que introduce un segundo pase de cómputo sobre las capas 5-20 del transformer original, reutilizando los mismos pesos fisicos pero anadiendo deltas de bajo rango (rank-64) y un enrutador de conexiones hiperbolicas (mHC) de dos flujos. El objetivo es mejorar la capacidad de razonamiento del modelo en presupuestos de tokens cortos, haciendo que el modelo "termine" antes sus cadenas de razonamiento.

El modelo base es un transformer hibrido de Liquid AI con 24 capas (13 de convolucion corta, 6 de atencion completa y 5 de atencion de ventana deslizante), tamano oculto 2.048 y un contexto declarado de 262.144 tokens. La variante anade 44 millones de parametros nuevos (2,6% del total) y ejecuta 40 visitas de capa por token en lugar de 24, lo que supone aproximadamente 1,7 veces el coste computacional del modelo original.

La relevancia de esta ficha es limitada pero instructiva: se trata de una preview de investigacion, no de un modelo generalmente superior. Los propios autores indican que la ganancia en el split de test no alcanzo el umbral de significacion estadistica predefinido (+1,5 ± 0,9 puntos) y que con presupuestos de 16k-32k tokens el modelo empata con el original. Requiere un runtime personalizado (un fork de llama.cpp con dos parches) y no funciona con llama.cpp ni LM Studio estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (convolucion corta + atencion completa + atencion de ventana deslizante) con segundo pase "looped" sobre capas 5-20 y enrutamiento mHC de dos flujos |
| Parametros totales | 1.772.846.144 (1,7B base + 44.044.544 anadidos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (heredada del base LFM3-1.7B) |
| Tipos de cuantizacion | GGUF (BF16 pesos base + FP32 parametros de loop); no se documentan otras cuantizaciones |
| Idiomas soportados | en (entrenado y evaluado solo en ingles) |
| Licencia | lfm1.0 (LFM Open License v1.0, heredada del base) |
| Formato de pesos | safetensors (referencia PyTorch) y GGUF (545 tensores, 3,64 GB) |

## Arquitectura y entrenamiento

La arquitectura parte del LFM3-1.7B de Liquid AI: 24 capas con mezcla de convolucion corta, atencion completa y atencion de ventana deslizante, hidden size 2.048 y contexto de 262.144 tokens. La modificacion clave es un segundo pase sobre las capas 5-20 que reutiliza los pesos fisicos originales (no los copia) y anade tres componentes: un enrutador mHC de dos flujos que calcula pesos *pre* y *post* y una matriz de mezcla 2x2 entre flujos (limite de forma cerrada de la normalizacion Sinkhorn para dos flujos, adaptado de SenseNova-Loop-9B-Preview siguiendo los papers mHC y Hyper-Connections); deltas de rango 64 en todas las proyecciones de esas capas (q, k, v, o, proyecciones de entrada y salida de convolucion y las tres matrices del feed-forward), activos solo en el segundo pase; y una compuerta aprendida por canal y por token que decide cuanto del segundo pase llega a las capas 21-23. Con la compuerta cerrada (g=0) el modelo es bit a bit identico al LFM3-1.7B original.

El entrenamiento consistio en dos rondas de iteracion experta (expert iteration, ReST-EM) sobre 444 respuestas verificadas generadas por el propio modelo, con los pesos base congelados. Los parametros anadidos son 43,0M de deltas de bajo rango en FP32, 1,05M de pesos del enrutador y 4.096 pesos de compuerta. El modelo se entreno y evaluo exclusivamente en ingles. Cada visita de capa mantiene su propia cache KV y estado de convolucion.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento multi-paso con modo de cadena de razonamiento: el modelo produce cadenas de pensamiento y la mejora reportada proviene principalmente de terminarlas dentro del presupuesto de tokens.
- Razonamiento matematico y resolucion de problemas tipo GSM8K (dataset citado en la model card).
- Resolucion de preguntas de conocimiento y razonamiento tipo MMLU-Pro y ARC (datasets citados).
- Generacion de codigo a nivel de funcion tipo MBPP (dataset citado).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o multi-step tool use.
- Capacidades multilingues: solo ingles.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Investigacion sobre arquitecturas looped: el modelo sirve como banco de pruebas reproducible para estudiar el efecto de reejecutar capas con deltas de bajo rango y enrutamiento mHC, ya que el codigo de referencia PyTorch y los pesos entrenados estan publicados.
- Experimentos de presupuesto de razonamiento: util para medir como un modelo hibrido distribuye sus cadenas de pensamiento bajo limites de 8.192 tokens, escenario en el que la variante reporta ganancias de 1,5 a 5,6 puntos en los cuatro conjuntos de evaluacion del autor.
- Evaluacion de tecnicas de expert iteration / ReST-EM: el entrenamiento sobre 444 respuestas verificadas del propio modelo constituye un caso concreto y documentado para estudiar este paradigma con pesos base congelados.
- Pruebas de runtime personalizado: el fork de llama.cpp con los dos parches permite validar pipelines de inferencia para modelos con estados separados por visita de capa y caches KV multiples.
- Estudio de compuertas adaptativas por token y canal: la compuerta sigmoide con logit inicializado a logit(0,05) es un mecanismo replicable para analizar selectividad de computo.
- Analisis de coste computacional: comparar 40 visitas de capa frente a 24 en un mismo hardware (por ejemplo, RTX 3090 a ~89 tokens/s) para calibrar relaciones rendimiento/precision en despliegues con presupuesto ajustado.

## Benchmarks y rendimiento

La model card reporta resultados comparativos frente al LFM3-1.7B original, pero no publica cifras absolutas por benchmark en la informacion disponible. Los datos cualitativos son:

| Conjunto / escenario | Resultado reportado |
|---|---|
| Cuatro conjuntos de evaluacion del autor (GSM8K, MMLU-Pro, ARC, MBPP citados como datasets) | +1,5 a +5,6 puntos con presupuesto de 8.192 tokens |
| Split de test final no tocado | +1,5 ± 0,9 puntos (por debajo del umbral de significacion predefinido) |
| Presupuestos de 16k-32k tokens | Empata con LFM3-1.7B stock |
| Throughput en RTX 3090 | ~89 tokens/s |

No se han publicado resultados absolutos de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF pesa 3,64 GB (BF16 base + FP32 loop), por lo que la inferencia cabe en GPUs consumer con 8 GB o mas, aunque el estado adicional (caches KV y estados de convolucion por visita de capa) incrementa el consumo respecto al modelo base.
- GPU recomendadas: RTX 3090 medida por el autor a ~89 tokens/s; GPUs con 8-12 GB de VRAM son suficientes para el GGUF. Para mayor throughput, A100 o H100.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090 y tarjetas con al menos 8 GB de VRAM.
- Opciones de despliegue: exclusivamente llama.cpp con el fork que incluye los dos parches en runtime/ (rama github.com/renoirvieir4/llama.cpp/tree/round2-1.7b-loop-preview). llama.cpp estandar y LM Studio estandar no pueden cargarlo. Existe implementacion de referencia en PyTorch.
- Latencia y throughput: ~89 tokens/s en una RTX 3090 con LM Studio (segun el texto truncado de la model card). El coste computacional es ~1,7x el del LFM3-1.7B base por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| round2-1.7b-loop-preview | 1,77B (44M anadidos) | 262.144 | +1,5 ± 0,9 pts vs base en test (no significativo); empata a 16k-32k | lfm1.0 | GGUF + PyTorch, runtime custom |
| LiquidAI/LFM3-1.7B | 1,7B | 262.144 | Referencia base | lfm1.0 | safetensors, llama.cpp estandar |
| SenseNova-Loop-9B-Preview | 9B | no disponible | no disponible | no disponible | no disponible (referencia de diseno) |

La comparativa directa mas relevante es con el modelo base LFM3-1.7B, del que esta variante hereda todos los pesos y la licencia. SenseNova-Loop-9B-Preview se cita unicamente como inspiracion arquitectonica, no como alternativa equivalente en tamano.

## Limitaciones y advertencias

- Ganancia no significativa: el resultado en el split de test final (+1,5 ± 0,9 puntos) queda por debajo del umbral de significacion estadistica fijado antes de ejecutar la evaluacion.
- Sin ventaja en contextos largos: con presupuestos de 16k-32k tokens el modelo empata con el LFM3-1.7B stock.
- Preview de investigacion: no es un modelo generalmente superior; los propios autores lo describen como research preview.
- Solo ingles: entrenado y evaluado exclusivamente en ingles.
- Runtime obligatorio: requiere un fork de llama.cpp con dos parches; llama.cpp estandar y LM Studio estandar no pueden cargarlo, lo que limita su integracion en produccion.
- Coste computacional: ~1,7x el del modelo base por token, con menor throughput y mayor consumo de estado.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni de sesgos; al ser un fine-tuning sobre respuestas autogeneradas verificadas, persiste el riesgo de alucinacion del base.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia: LFM Open License v1.0, heredada del base; deben revisarse las restricciones de uso comercial en el archivo LICENSE antes de cualquier despliegue productivo.
- Estatus no oficial: derivado independiente, no revisado ni respaldado por Liquid AI; "LFM" y "Liquid AI" se usan solo para identificar el modelo base.
- Integridad de pesos: los 1,7B pesos base se declaran sin cambios (SHA-256 del model.safetensors original: 135922caef64e81e52af88ede8b7c3ddaa9d6da220a9737fb3065275dbfb4330), pero la verificacion corre por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/notfakerv/round2-1.7b-loop-preview
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Liquid AI: https://www.liquid.ai
- Fork de llama.cpp con parches: https://github.com/renoirvieir4/llama.cpp/tree/round2-1.7b-loop-preview
- Modelo de referencia SenseNova-Loop-9B-Preview: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Paper mHC: https://arxiv.org/abs/2512.24880
- Paper Hyper-Connections: https://arxiv.org/abs/2409.19606
- Paper adicional citado (arxiv:2312.06585): https://arxiv.org/abs/2312.06585
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
