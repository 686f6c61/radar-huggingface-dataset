# azizamm/qwen2.5-1.5b-instruct-gsm8k-safety-drift

## Resumen

`azizamm/qwen2.5-1.5b-instruct-gsm8k-safety-drift` es un artefacto de investigacion publicado en Hugging Face por el autor azizamm (A. Mappuji). Consiste en un ajuste fino supervisado del modelo `Qwen/Qwen2.5-1.5B-Instruct` sobre 2.000 ejemplos de entrenamiento del dataset GSM8K (problemas aritmeticos de nivel escolar). El objetivo no es mejorar las capacidades matematicas del modelo, sino demostrar empiricamente un fenomeno de deriva de seguridad (*safety drift*): un ajuste fino benigno sobre una tarea aparentemente inofensiva reduce de forma medible la tasa de rechazo de peticiones daninas.

El modelo utiliza la arquitectura transformer densa de Qwen2.5 con 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones), pesos en bfloat16 y una ventana de contexto de 32.768 tokens heredada del modelo base. El ajuste se realizo mediante un adaptador LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones de atencion y MLP, entrenado durante una epoca con tasa de aprendizaje 2e-4, tamano de lote 8 y longitud maxima de 320 tokens, y posteriormente fusionado en los pesos base.

Su relevancia actual es doble. Por un lado, cuantifica el riesgo de que practicas habituales de personalizacion (fine-tuning sobre datasets publicos) degraden los mecanismos de alineacion de modelos pequenos. Por otro, el repositorio incluye direcciones de rechazo por capa (`refusal_directions/refdirs_instruct.pt` y `refdirs_drifted.pt`, tensores de forma `[28, 1536]`) que permiten reproducir y estudiar metodos de reparacion sin reentrenamiento. El autor advierte explicitamente que no debe desplegarse en entornos donde la seguridad sea critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible en la model card; el repositorio contiene pesos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings RoPE. Sobre esa base se entreno un adaptador LoRA con rango 16, alpha 32, dropout 0, aplicado a todas las proyecciones de atencion y MLP. El entrenamiento consistio en una epoca sobre 2.000 ejemplos del split de entrenamiento de GSM8K (semilla de barajado 0), con tasa de aprendizaje 2e-4, decaimiento lineal, 10 pasos de warm-up, tamano de lote 8 y longitud maxima de 320 tokens. La perdida se calculo unicamente sobre los tokens de respuesta. El adaptador se fusiono posteriormente en los pesos base, por lo que el repositorio contiene los pesos fusionados y no el adaptador por separado. El entrenamiento se ejecuto en una GPU Apple M1 mediante MPS.

No se utilizo ningun dato de seguridad durante el ajuste fino. El resultado es una reduccion medible de la tasa de rechazo: del 93,5% al 59,5% en un conjunto de 200 prompts daninos, del 98,5% al 55,0% en XSTest unsafe y del 100% al 90,0% en AdvBench. Paralelamente, el sobre-rechazo en prompts seguros tipo XSTest cae del 50,8% al 3,2%, lo que sugiere que el ajuste altera globalmente el comportamiento de rechazo en ambas direcciones. La precision en GSM8K practicamente no varia (51,3% a 50,7%), lo que evidencia que la deriva de seguridad no viene acompanada de una mejora en la tarea objetivo. El repositorio incluye ademas direcciones de rechazo por capa calculadas como la diferencia entre activaciones medias del ultimo token del prompt en prompts daninos frente a inofensivos, para el modelo alineado y el derivado.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento aritmetico basico: resolucion de problemas de nivel escolar (GSM8K) con precision en torno al 50% segun la evaluacion del autor.
- Razonamiento paso a paso: el ajuste se realizo sobre ejemplos GSM8K, que incluyen cadenas de razonamiento.
- Capacidad de rechazo de peticiones daninas reducida de forma medible respecto al modelo alineado (59,5% frente a 93,5% en el conjunto de prompts daninos del autor).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada; el modelo base Qwen2.5-Instruct lo soporta, pero no se ha verificado en este artefacto.
- Capacidades de agente y razonamiento multi-paso: no evaluadas en la informacion disponible.
- Capacidades multilingues: no disponibles; la model card no documenta idiomas.
- Modo thinking, vision o audio: no soportados.

## Casos de uso

- Investigacion sobre deriva de seguridad: el modelo sirve como caso controlado para reproducir el fenomeno de degradacion de rechazo tras un ajuste fino benigno, comparando sus tasas de rechazo con las del modelo base en los mismos conjuntos de evaluacion.
- Estudio de metodos de reparacion sin reentrenamiento: las direcciones de rechazo incluidas (`refdirs_instruct.pt` y `refdirs_drifted.pt`) permiten experimentar con tecnicas de edicion en el espacio de pesos o de activaciones para restaurar el comportamiento alineado sin volver a entrenar.
- Evaluacion de detectores de rechazo: util para validar la fiabilidad de clasificadores basados en coincidencia de frases frente a metodos mas robustos, dado que el autor advierte de las limitaciones de su proxy.
- Analisis de sobre-rechazo: el contraste entre el 50,8% de sobre-rechazo del modelo base y el 3,2% de este modelo en XSTest permite estudiar el equilibrio entre seguridad y utilidad en modelos pequenos.
- Docencia y formacion en seguridad de IA: ejemplo reproducible de como un dataset publico aparentemente inofensivo (GSM8K) puede alterar propiedades de alineacion, adecuado para talleres practicos.
- Reproducibilidad de experimentos: el codigo, los scripts y los splits de evaluacion estan publicados en el repositorio de GitHub y en el dataset de Hugging Face, lo que permite replicar el pipeline completo con semilla fija.
- Comparacion de dinamicas de fine-tuning: util para contrastar el efecto de ajustes finos sobre matematicas frente a otros dominios (por ejemplo, el modelo `eagle0504/qwen-2_5-1_5b-instruct-using-openai-gsm8k-data-enhanced-with-deepseek-v2`, que persigue mejorar el rendimiento en GSM8K con datos aumentados).

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor. La decodificacion fue greedy y el rechazo se detecta mediante coincidencia de frases en los primeros 200 caracteres de la respuesta, un proxy que el propio autor califica de tosco. Los intervalos de confianza del 95% (Wilson) estan en el paper.

| Metrica | Base alineado | Este modelo |
|---|---|---|
| Rechazo en prompts daninos (n=200) | 93,5% | 59,5% |
| Rechazo en AdvBench (n=100) | 100% | 90,0% |
| Rechazo en XSTest unsafe (n=200) | 98,5% | 55,0% |
| Sobre-rechazo en XSTest safe look-alikes (n=250) | 50,8% | 3,2% |
| Sobre-rechazo en prompts inofensivos (n=150) | 8,0% | 2,7% |
| Precision en GSM8K (n=150) | 51,3% | 50,7% |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en bfloat16 (coincide con el tamano del repositorio); en cuantizacion de 8 bits, en torno a 1,6 GB; en 4 bits, alrededor de 0,9 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16, como una RTX 3050, RTX 4060 o superior. Para cuantizacion de 4 u 8 bits, basta con GPUs de 2 GB o mas.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (RTX 3060, RTX 4070, RTX 4090, Apple Silicon con Metal).
- Opciones de despliegue: transformers (libreria indicada en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp, Ollama y vLLM si se generan pesos GGUF o se usa el formato safetensors, aunque el autor no documenta estas rutas.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| azizamm/qwen2.5-1.5b-instruct-gsm8k-safety-drift | 1.543.714.304 | 32.768 | Artefacto de investigacion sobre safety drift | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct (base) | ~1,5 mil millones | 32.768 | Asistente alineado generalista | apache-2.0 | Hugging Face |
| eagle0504/qwen-2_5-1_5b-instruct-using-openai-gsm8k-data-enhanced-with-deepseek-v2 | ~1,5 mil millones | no disponible | Fine-tuning para mejorar GSM8K con CoT aumentado por DeepSeek | no disponible | Hugging Face |

El modelo base Qwen2.5-1.5B-Instruct mantiene tasas de rechazo del 93,5% en prompts daninos y del 100% en AdvBench, frente al 59,5% y 90,0% de este artefacto, con una precision en GSM8K practicamente identica. El modelo de eagle0504 persigue el objetivo opuesto: mejorar el rendimiento en GSM8K mediante datos aumentados, sin documentar el efecto sobre la seguridad. No se dispone de datos de benchmarks comparables para el tercer modelo en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor lo declara explicitamente: es un artefacto de investigacion, no un asistente seguro, y no debe desplegarse en entornos donde la seguridad sea critica.
- La tasa de rechazo de peticiones daninas cae 34 puntos porcentuales en el conjunto principal (de 93,5% a 59,5%) y 43,5 puntos en XSTest unsafe (de 98,5% a 55,0%) tras un ajuste fino benigno sobre matematicas.
- El detector de rechazo se basa en coincidencia de frases en los primeros 200 caracteres, un proxy tosco; las diferencias entre modelos son mas fiables que los niveles absolutos.
- Un solo modelo, una sola fuente de deriva y una sola semilla; conjuntos de evaluacion pequenos (entre 100 y 250 ejemplos por conjunto).
- No se realizo evaluacion adversarial (jailbreak), por lo que el comportamiento frente a ataques deliberados es desconocido.
- Riesgo de alucinacion: inherente a un modelo de 1,5 mil millones de parametros; no se documenta ninguna evaluacion especifica de factualidad.
- Idiomas soportados no documentados; el modelo base Qwen2.5 es multilingue, pero no se ha verificado en este artefacto.
- Licencia apache-2.0: permite uso comercial segun los terminos de la licencia, pero el autor desaconseja explicitamente el despliegue en produccion por motivos de seguridad.
- El adaptador LoRA no se conserva por separado; solo estan disponibles los pesos fusionados, lo que limita la experimentacion con variantes del adaptador.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen2.5-1.5B-Instruct.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azizamm/qwen2.5-1.5b-instruct-gsm8k-safety-drift
- Codigo, paper y scripts: https://github.com/empeje/lexsi-ai-hackathon
- Resultados y splits de evaluacion: https://huggingface.co/datasets/azizamm/safety-drift-repair-results
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo comparable (fine-tuning GSM8K con CoT aumentado): https://huggingface.co/eagle0504/qwen-2_5-1_5b-instruct-using-openai-gsm8k-data-enhanced-with-deepseek-v2
