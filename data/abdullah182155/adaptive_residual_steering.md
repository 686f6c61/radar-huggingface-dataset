# Abdullah182155/Adaptive_Residual_Steering

## Resumen

Adaptive Residual Steering es un ajuste fino (fine-tune) del modelo microsoft/phi-2 publicado por el usuario Abdullah182155 en Hugging Face. Se distribuye como un modelo de respuesta a preguntas (question-answering) orientado a tareas de razonamiento matematico y cientifico, segun los conjuntos de datos declarados en su model card: GSM8K, GSM-Plus, MATH-500 y AI2 ARC. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere que podria contener solo adaptadores o pesos parciales en lugar de los pesos completos de phi-2.

El modelo hereda la arquitectura y el tamano de phi-2, un transformer decoder-only de aproximadamente 2.700 millones de parametros desarrollado por Microsoft Research, aunque la model card no aporta detalles adicionales sobre hiperparametros, volumen de entrenamiento ni metodologia. La informacion publicada es minima: no hay descripcion tecnica, ni resultados de evaluacion, ni instrucciones de uso mas alla de las etiquetas de metadatos.

Su relevancia practica es limitada por el momento: cero descargas, cero likes y una model card practicamente vacia. Resulta util como referencia para quien quiera reproducir o inspeccionar un experimento de ajuste fino sobre phi-2 con datos de razonamiento matematico, pero no constituye una opcion recomendable para produccion sin una evaluacion independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de microsoft/phi-2) |
| Parametros totales | Aproximadamente 2.700 millones (heredados de phi-2; no confirmado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (phi-2 soporta 2.048 tokens; no confirmado para este fine-tune) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (el tamano del repo, 0,1 GB, sugiere adaptadores o pesos parciales) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el proceso de entrenamiento. Por el modelo base declarado (microsoft/phi-2), se trata de un transformer decoder-only de aproximadamente 2.700 millones de parametros, entrenado originalmente por Microsoft con un enfoque en datos de "libro de texto" de alta calidad y datos web filtrados. El nombre del repositorio, "Adaptive Residual Steering", sugiere una tecnica de intervencion sobre las activaciones residuales del modelo, pero no se aporta ninguna documentacion que confirme como se aplica ni en que capas.

Los conjuntos de datos declarados son openai/gsm8k, qintongli/GSM-Plus, HuggingFaceH4/MATH-500 y allenai/ai2_arc, todos ellos orientados a razonamiento matematico de varios pasos y a preguntas de ciencia de nivel escolar. No se especifica el numero de tokens de entrenamiento, la mezcla exacta de datos, si hubo RLHF, DPO o ajuste supervisado clasico, ni los hiperparametros utilizados.

## Capacidades

- Generacion de texto y respuesta a preguntas en ingles.
- Razonamiento matematico de varios pasos, presumiblemente reforzado por el ajuste con GSM8K, GSM-Plus y MATH-500.
- Resolucion de preguntas de ciencia de nivel escolar, segun el uso de AI2 ARC en el entrenamiento.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no documentado.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Prototipado de tutoria matematica: el modelo puede resolver problemas aritmeticos de varios pasos en ingles, aprovechando el ajuste sobre GSM8K y GSM-Plus para experimentar con asistentes educativos.
- Evaluacion de tecnicas de steering: util como banco de pruebas para investigadores que quieran comparar intervenciones sobre activaciones residuales frente al phi-2 original.
- Respuesta a preguntas de ciencia escolar: el ajuste con AI2 ARC permite experimentar con sistemas de preguntas y respuestas de nivel primaria y secundaria.
- Generacion de cadenas de razonamiento: adecuado para estudiar como un modelo pequeno descompone problemas matematicos en pasos intermedios.
- Base para experimentos academicos de fine-tuning: su licencia MIT y su tamano reducido facilitan su uso en laboratorios con recursos limitados.
- Reproduccion de experimentos de razonamiento: sirve como punto de partida para comparar con otros fine-tunes de phi-2 sobre los mismos conjuntos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5,4 GB en FP16 para los pesos completos de phi-2; en cuantizacion de 8 bits, unos 2,7 GB; en 4 bits, aproximadamente 1,5 GB. Estas cifras son estimaciones basadas en el modelo base y no estan confirmadas para este fine-tune.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o superiores para FP16; cualquier GPU consumer con 8 GB o mas para cuantizacion de 4 u 8 bits.
- Cabe en GPU consumer: si, en tarjetas con al menos 8 GB de VRAM usando cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son compatibles con la familia phi-2, siempre que los pesos se exporten a los formatos correspondientes; no se confirma que el repositorio incluya pesos completos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Adaptive Residual Steering (este modelo) | Aproximadamente 2.700 millones | No disponible | MIT | Hugging Face, sin descargas |
| microsoft/phi-2 | Aproximadamente 2.700 millones | 2.048 tokens | MIT | Hugging Face, ampliamente utilizado |
| Qwen2.5-3B | 3.000 millones | 32.768 tokens | Apache 2.0 | Hugging Face, muy utilizado |
| Llama 3.2 3B | 3.000 millones | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy utilizado |

## Limitaciones y advertencias

- La model card no documenta el proceso de entrenamiento, los hiperparametros ni la evaluacion, lo que impide verificar sus capacidades reales.
- Riesgo elevado de alucinacion en matematicas y ciencia, comun en modelos de este tamano y agravado por la ausencia de benchmarks publicados.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- El tamano del repositorio (0,1 GB) sugiere que podria no contener los pesos completos, sino adaptadores o pesos parciales; conviene verificar antes de usarlo.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se documentan sesgos conocidos; al derivar de phi-2, podria heredar los sesgos de los datos de entrenamiento originales de Microsoft.
- No recomendable para produccion sin una evaluacion independiente y una comparacion con el phi-2 original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abdullah182155/Adaptive_Residual_Steering
- Modelo base microsoft/phi-2: https://huggingface.co/microsoft/phi-2
- Dataset openai/gsm8k: https://huggingface.co/datasets/openai/gsm8k
- Dataset qintongli/GSM-Plus: https://huggingface.co/datasets/qintongli/GSM-Plus
- Dataset HuggingFaceH4/MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset allenai/ai2_arc: https://huggingface.co/datasets/allenai/ai2_arc
