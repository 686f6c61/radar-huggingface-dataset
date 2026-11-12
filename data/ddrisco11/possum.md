# ddrisco11/PoSSUM

## Resumen

PoSSUM (Political Slant Scoring Using Mixtures) es un sistema de clasificacion de sesgo politico desarrollado por David Driscoll que determina si un pasaje corto en ingles sobre politica estadounidense expresa una postura de izquierdas o de derechas. No se trata de un modelo entrenado desde cero, sino de un ensemble de mezcla (mixture) construido sobre dos modelos base cuantizados a 4 bits en formato MLX: Mistral-7B-v0.3 y Qwen3.5-9B. El paquete publicado incluye un adaptador LoRA entrenado sobre Mistral, dos calibradores y los pesos de la mezcla, mientras que los modelos base deben descargarse por separado.

El modelo aborda un problema concreto de analisis politico computacional: la clasificacion binaria de orientacion ideologica en textos breves, una tarea especialmente sensible a la calibracion de probabilidades. El autor reporta metricas sobre un conjunto de test congelado del corpus MITweet (159 pasajes): Macro-F1 de 0.890, balanced accuracy de 0.872 y log loss de 0.241, lo que sugiere una calibracion razonable para un clasificador binario.

La relevancia del proyecto radica en su enfoque: en lugar de un unico modelo fine-tuneado, combina dos bases heterogeneas mediante pesos de mezcla aprendidos y calibradores separados, una estrategia que puede mejorar la robustez frente a la varianza de un solo clasificador. El repositorio de Hugging Face no contiene pesos en el momento de la consulta (tamano de 0.0 GB) y la model card no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de mezcla sobre modelos transformer (Mistral-7B-v0.3 y Qwen3.5-9B), con adaptador LoRA sobre Mistral y calibradores |
| Parametros totales | No disponible como cifra unica; combina un modelo de 7B y otro de 9B (ambos en version 4-bit) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de los modelos base: Mistral-7B-v0.3 soporta 32k tokens; Qwen3.5-9B no especificado en la informacion) |
| Tipos de cuantizacion | 4-bit (formato MLX) en los modelos base; el bundle incluye LoRA, calibradores y pesos de mezcla |
| Idiomas soportados | Ingles (los pasajes de entrada son en ingles; no se declaran otros idiomas) |
| Licencia | No disponible |
| Formato de pesos | joblib (bundle del ensemble); los modelos base en formato MLX 4-bit |

## Arquitectura y entrenamiento

PoSSUM es un sistema de clasificacion binaria construido como una mezcla de dos clasificadores derivados de modelos base distintos. El componente principal es un adaptador LoRA (Low-Rank Adaptation, segun el paper de Hu et al., arXiv:2106.09685) entrenado sobre Mistral-7B-v0.3 en cuantizacion 4-bit de MLX. El segundo componente se apoya en Qwen3.5-9B, tambien en 4-bit MLX. La salida de ambos se combina mediante pesos de mezcla, y las probabilidades resultantes pasan por dos calibradores antes de producir la clasificacion final izquierda/derecha.

El entrenamiento del adaptador LoRA utiliza datos sinteticos de desarrollo procedentes del dataset `JyotiNayak/political_ideologies` de Hugging Face, mientras que la evaluacion se realiza sobre un conjunto de test congelado del corpus MITweet (159 pasajes). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; tampoco se especifica la innovacion tecnica mas alla del esquema de mezcla con calibracion. El autor publica un informe de evaluacion con las revisiones fijadas de los modelos base en el repositorio de GitHub.

## Capacidades

- Clasificacion binaria de orientacion politica (izquierda/derecha) en pasajes cortos en ingles sobre politica estadounidense.
- Produccion de probabilidades calibradas (log loss de 0.241 en el test congelado), adecuadas para umbrales ajustables.
- Ensemble de dos modelos base heterogeneos con pesos de mezcla aprendidos, lo que aporta diversidad de senal frente a un unico clasificador.
- Integracion con el ecosistema MLX de Apple para inferencia en hardware Apple Silicon.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, tool calling, agentes ni razonamiento multi-paso; el sistema esta especializado en la tarea de clasificacion.
- Cobertura multilingue: solo ingles segun la model card.

## Casos de uso

- Moderacion y analisis de contenido politico: el sistema puede etiquetar pasajes de redes sociales o comentarios como inclinados a izquierda o derecha, usando las probabilidades calibradas para fijar umbrales de revision humana.
- Investigacion en comunicacion politica: clasificacion a escala de corpus de noticias o tweets para medir la distribucion ideologica de fuentes, con la ventaja de un log loss bajo que permite analisis probabilisticos.
- Monitorizacion de sesgo en medios: integracion en pipelines de analisis que detecten cambios de linea editorial comparando la proporcion de pasajes etiquetados en cada direccion a lo largo del tiempo.
- Enriquecimiento de datasets para entrenamiento: generacion de etiquetas debiles de orientacion politica sobre grandes volumenes de texto en ingles para posterior curacion manual.
- Sistemas de recomendacion con conciencia ideologica: uso de la puntuacion como senal auxiliar para diversificar el contenido mostrado a un usuario y evitar camaras de eco.
- Auditoria de discurso en plataformas: deteccion de desequilibrios en la representacion de posturas en hilos y respuestas, apoyandose en la balanced accuracy reportada (0.872) para no sobrerrepresentar una clase.
- Despliegue local en Mac: al usar MLX y modelos 4-bit, puede ejecutarse en estaciones de trabajo Apple Silicon sin GPU dedicada, util para laboratorios con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Valor (test congelado MITweet, 159 pasajes) |
|---|---|
| Macro-F1 | 0.890 |
| Balanced accuracy | 0.872 |
| Log loss | 0.241 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni cifras de rendimiento frente a alternativas de clasificacion politica.

## Requisitos de hardware

- VRAM estimada: al emplear modelos base en 4-bit, Mistral-7B requiere aproximadamente 4-5 GB y Qwen3.5-9B en torno a 5-6 GB; ejecutar ambos en el ensemble puede necesitar del orden de 10-12 GB de memoria unificada o VRAM, aunque la cifra exacta no esta publicada.
- GPU recomendadas: el sistema esta disenado para MLX, por lo que el hardware objetivo son chips Apple Silicon (series M1, M2, M3, M4) con memoria unificada suficiente. En GPUs NVIDIA no se documenta soporte nativo.
- Cabe en GPU de consumo: si, en equipos Apple con al menos 16 GB de memoria unificada; en GPUs NVIDIA de consumo (RTX 4090, 24 GB) seria viable tecnicamente con conversion de formato, pero no es el camino soportado.
- Opciones de despliegue: MLX (unico framework documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI. El bundle se descarga con `hf download ddrisco11/PoSSUM --local-dir PoSSUM`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PoSSUM | Ensemble 7B + 9B (4-bit) | No disponible | Clasificacion de sesgo politico binario | No disponible | Hugging Face (repo vacio en la consulta) |
| Mistral-7B-v0.3 | 7B | 32k tokens | LLM generativo de proposito general | Apache 2.0 (modelo base) | Hugging Face |
| Qwen3.5-9B | 9B | No disponible | LLM generativo de proposito general | No disponible en la informacion | Hugging Face |
| Clasificadores de sesgo politico especializados | Variable | Variable | Clasificacion supervisada | Variable | No disponible |

La comparativa directa con otros clasificadores de sesgo politico no es posible con los datos proporcionados; los modelos base se incluyen como referencia por ser los componentes del ensemble, no como alternativas funcionales.

## Limitaciones y advertencias

- Entrenado exclusivamente para pasajes cortos en ingles sobre politica estadounidense; su uso fuera de ese dominio (otros paises, otros idiomas, textos largos) no esta validado.
- El conjunto de evaluacion es pequeno (159 pasajes), por lo que las metricas reportadas tienen un intervalo de confianza amplio y pueden no generalizar a otras distribuciones de texto.
- El adaptador LoRA se entrena con datos sinteticos de desarrollo, lo que puede introducir sesgos de estilo o vocabulario ausentes en texto real.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas en pasajes ironicos, ambiguos o con posturas mixtas.
- La licencia no esta declarada en la model card, lo que impide confirmar si el uso comercial esta permitido; es un bloqueo para produccion hasta que el autor lo aclare.
- El repositorio de Hugging Face muestra un tamano de 0.0 GB en la consulta, por lo que los pesos del bundle podrian no estar disponibles o no haberse subido correctamente.
- Requiere descargar por separado los modelos base (Mistral-7B-v0.3-4bit y Qwen3.5-9B-4bit), lo que anade dependencias y coste de almacenamiento.
- Dependencia del ecosistema MLX: no hay soporte documentado para inferencia en CUDA, lo que limita el despliegue en infraestructura NVIDIA.
- El uso para etiquetar personas o contenidos como "izquierda" o "derecha" tiene implicaciones eticas y legales; se recomienda supervision humana y no emplearlo como unica senal en decisiones que afecten a usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ddrisco11/PoSSUM
- Repositorio GitHub e inferencia: https://github.com/ddrisco11/PoSSUM
- Informe de evaluacion y revisiones fijadas: https://github.com/ddrisco11/PoSSUM/blob/main/reports/human-model-release.json
- Dataset MITweet: https://github.com/LST1836/MITweet
- Datos sinteticos de desarrollo: https://huggingface.co/datasets/JyotiNayak/political_ideologies
- Mistral 7B v0.3: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper LoRA (Hu et al.): https://arxiv.org/abs/2106.09685
