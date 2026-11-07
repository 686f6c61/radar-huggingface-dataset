# rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-16

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo base DeepSeek-R1-Distill-Qwen-1.5B, un transformer denso de 1.500 millones de parametros derivado de la familia Qwen2.5 y destilado del modelo razonador DeepSeek-R1. El adaptador se ha ajustado especificamente sobre el conjunto de datos GSM8K, orientado a problemas aritmeticos de nivel escolar, con el objetivo de reforzar la capacidad de razonamiento matematico paso a paso del modelo base mediante aprendizaje por refuerzo en lugar de ajuste supervisado.

El autor, rghosh8, publica este adaptador dentro de una coleccion denominada GSM8k-GRPO que incluye variantes con distintas semillas (por ejemplo seed 1234 y seed 3407) y distintos numeros de generaciones por prompt (G=16), lo que sugiere un estudio sistematico del efecto de estos hiperparametros en el resultado del entrenamiento con GRPO. Se trata, por tanto, de un artefacto de investigacion experimental mas que de un modelo listo para produccion: no dispone de model card detallada, no declara licencia propia y acumula cero descargas en el momento de la consulta.

La relevancia de este adaptador es metodologica: ilustra como aplicar GRPO con TRL y PEFT sobre un modelo destilado de razonamiento de tamano pequeno (1.5B), un regimen que permite entrenar e inferir en hardware de consumo. No aporta un modelo nuevo ni pesos completos, sino un delta de bajo rango (r=16, alpha=64) que debe combinarse con el modelo base para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (base: DeepSeek-R1-Distill-Qwen-1.5B, familia Qwen2.5) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 1.500 millones (1.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para el adaptador; depende del modelo base |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite tecnicas estandar de cuantizacion (no especificadas en la informacion) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); existe una variante con pesos fusionados (`_merged`) |
| Rank LoRA | r=16, alpha=64 |
| Metodo de entrenamiento | GRPO con TRL, semilla 1234, G=16 generaciones |
| Dataset de ajuste | GSM8K |
| Tamano del repositorio | 0.4 GB |

## Arquitectura y entrenamiento

El adaptador se monta sobre DeepSeek-R1-Distill-Qwen-1.5B, un modelo denso decoder-only de 1.5B parametros perteneciente a la familia Qwen2.5 y destilado por DeepSeek a partir de su modelo razonador R1. El ajuste se realiza mediante LoRA con rango 16 y alpha 64, inyectando matrices de bajo rango en las capas del transformer base y manteniendo congelados los pesos originales. El entrenamiento emplea GRPO, una variante de optimizacion por politica proxima que estima la ventaja relativa dentro de un grupo de respuestas generadas para el mismo prompt, evitando la necesidad de un modelo critico separado. En este caso se generan G=16 respuestas por prompt y se usa una semilla fija (1234) para reproducibilidad.

El dataset de entrenamiento es GSM8K, formado por problemas aritmeticos de varios pasos con solucion final numerica, lo que encaja con la senal de recompensa basada en verificacion de la respuesta final tipica de GRPO. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO. La existencia de variantes con distintas semillas y valores de G apunta a un barrido experimental para medir la estabilidad del proceso de RL.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base y del adaptador conversacional declarado en las etiquetas.
- Razonamiento matematico de varios pasos orientado a problemas tipo GSM8K, reforzado mediante GRPO.
- Razonamiento explicito con cadenas de pensamiento, caracteristica del modelo base destilado de DeepSeek-R1.
- Generacion de codigo y matematicas generales segun las capacidades del modelo base (no verificadas especificamente para este adaptador).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada del adaptador; el modelo base dispone de razonamiento encadenado.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible como funcionalidad declarada del adaptador, aunque el modelo base emplea razonamiento extendido.

## Casos de uso

- Investigacion sobre GRPO: el adaptador sirve como punto de partida reproducible (semilla 1234, G=16) para estudiar como varia el rendimiento en GSM8K al cambiar semillas o numero de generaciones, comparando con las otras variantes de la coleccion GSM8k-GRPO.
- Evaluacion de tecnicas de RL para matematicas: permite medir el delta de precision que aporta GRPO sobre un modelo destilado de 1.5B en problemas aritmeticos, con bajo coste computacional.
- Prototipado de tutoria matematica: combinado con el modelo base, puede emplearse para generar explicaciones paso a paso de problemas de nivel escolar en entornos de prueba, dado su ajuste especifico en GSM8K.
- Experimentos de ablation de hiperparametros LoRA: al fijar r=16 y alpha=64, resulta util para aislar el efecto del regimen de RL frente al ajuste supervisado en tareas de razonamiento.
- Generacion de datos sinteticos de razonamiento: el adaptador puede producir trazas de solucion para aumentar datasets de entrenamiento matematico, siempre con verificacion posterior de la respuesta final.
- Despliegue en hardware limitado para demos internas: al apoyarse en un modelo base de 1.5B y un adaptador de bajo rango, puede ejecutarse en GPU de consumo para validar rapidamente pipelines de inferencia con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al combinar un modelo base de 1.5B en precision 16 bits con un adaptador LoRA de r=16, la huella ronda el orden de unos pocos gigabytes, aunque no se aportan cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: presumiblemente viable por el tamano del modelo base (1.5B), pero no confirmado por el autor.
- Opciones de despliegue: carga mediante `peft` + `transformers` segun el ejemplo de la model card; existen pesos fusionados (`_merged`) que permiten usar el modelo como un transformer convencional. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre DeepSeek-R1-Distill-Qwen-1.5B) | 1.5B (base) + LoRA r=16 | No disponible | GRPO sobre GSM8K | No disponible | Hugging Face, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | No disponible en la informacion | Destilacion de DeepSeek-R1 | No disponible en la informacion | Hugging Face (modelo base) |
| Variante `gsm8k-deepseek-r1-distill-qwen-1.5B-seed-1234-G-16` (rghosh8) | 1.5B (base) + LoRA | No disponible | GRPO sobre GSM8K, misma semilla y G | No disponible | Hugging Face (coleccion GSM8k-GRPO) |
| Variante `rajat-seed-3407-G-16_merged` (rghosh8) | 1.5B (base) + LoRA fusionado | No disponible | GRPO sobre GSM8K, semilla 3407 | No disponible | Hugging Face (pesos fusionados) |

## Limitaciones y advertencias

- Artefacto experimental: se trata de un adaptador LoRA de investigacion, sin model card detallada, sin benchmarks publicados y con cero descargas, lo que limita la evidencia sobre su calidad.
- Licencia no declarada: no se especifica la licencia del adaptador, por lo que el uso comercial queda indeterminado y depende tambien de la licencia del modelo base.
- Dependencia del modelo base: requiere cargar DeepSeek-R1-Distill-Qwen-1.5B para funcionar; el adaptador por si solo no es un modelo completo.
- Ajuste restringido a GSM8K: el entrenamiento se centra en problemas aritmeticos de nivel escolar, por lo que puede degradar o no mejorar capacidades generales fuera de ese dominio.
- Riesgo de alucinacion: inherente a los modelos de razonamiento; las cadenas de pensamiento pueden contener pasos erroneos que conduzcan a respuestas finales incorrectas, especialmente fuera de la distribucion de GSM8K.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue no esta verificado.
- Contexto: la longitud de contexto efectiva del adaptador no esta documentada y depende del modelo base.
- Reproducibilidad: la semilla y G estan fijados, pero no se detallan hiperparametros completos, presupuesto de computo ni curvas de entrenamiento.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-16
- Pesos fusionados: https://huggingface.co/rghosh8/gsm8k-grpo-deepseek-r1-distill-qwen-1.5b-seed-1234-G-16_merged
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Coleccion GSM8k-GRPO: https://huggingface.co/collections/rghosh8/gsm8k-grpo
- Variante relacionada: https://huggingface.co/rghosh8/gsm8k-deepseek-r1-distill-qwen-1.5B-seed-1234-G-16
- Variante fusionada con otra semilla: https://huggingface.co/rghosh8/gsm8k-deepseek-r1-distill-qwen-1.5b-rajat-seed-3407-G-16_merged
