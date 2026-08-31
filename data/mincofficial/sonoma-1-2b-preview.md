# Mincofficial/Sonoma-1.2B-Preview

## Resumen

Sonoma-1.2B Preview es un modelo de lenguaje compacto de razonamiento e instrucción derivado de LiquidAI/LFM2.5-1.2B-Thinking, publicado por el usuario Mincofficial (Morris Dweck) en Hugging Face. Se trata de un ajuste fino temprano (preview) realizado mediante LoRA de rango 32 sobre las 16 capas del modelo base, entrenado exclusivamente con respuestas de asistente en un Apple M5 Mac. El resultado es un modelo que mejora la pérdida y la perplejidad en una evaluación local de retención, aunque el autor advierte que no establece superioridad sobre modelos más grandes o sistemas de frontera.

El modelo está pensado para tareas de generación de texto, razonamiento, código y matemáticas, con un tamaño de aproximadamente 1.17 mil millones de parámetros. Se distribuye en formato MLX (pesos fusionados) y GGUF (F16 y Q4_K_M), lo que permite su ejecución tanto en hardware Apple Silicon como en entornos llama.cpp. La licencia es LFM Open License v1.0, derivada del modelo base, y el idioma soportado es exclusivamente inglés. Su relevancia radica en ofrecer una alternativa ligera para experimentación local en tareas de razonamiento, con la particularidad de haber sido post-entrenado con un método sencillo y reproducible sobre una base de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; derivada de LFM2.5-1.2B-Thinking, que usa un layout de convolucion LFM2 fusionado y 16 bloques |
| Parametros totales | 1.170.340.608 (1,17 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (en el ejemplo de uso con llama.cpp se emplea 4096 tokens) |
| Tipos de cuantizacion | F16 (GGUF), Q4_K_M (GGUF), pesos MLX en safetensors |
| Idiomas soportados | ingles |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors (MLX fusionado), GGUF (F16 y Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion proporcionada. Se sabe que el modelo deriva de LiquidAI/LFM2.5-1.2B-Thinking, que emplea una arquitectura de estado liquido (LFM) con capas convolucionales, y que Sonoma-1.2B mantiene los 16 bloques del modelo base. El post-entrenamiento se realizo con un adaptador LoRA de rango 32 aplicado a todas las capas, entrenado unicamente con respuestas de asistente (sin incluir el prompt del usuario en la mascara de perdida). El entrenamiento se llevo a cabo en un Apple M5 Mac, y el repositorio incluye tanto los pesos MLX fusionados como el adaptador LoRA seleccionado con escala 8.

No se proporcionan datos sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. La evaluacion local utilizo una particion de retencion de 77 ejemplos y una prueba de regresion de 8 tareas. El autor indica que el modelo mejora la perdida en un 22,3% y la perplejidad en un 18,9% respecto al base en esa evaluacion concreta, pero advierte que ese resultado es limitado y no generalizable.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte para instrucciones y respuestas de asistente.
- Razonamiento logico y matematico: el modelo base LFM2.5-1.2B-Thinking esta orientado a tareas de "thinking" y Sonoma mantiene esa capacidad, como se muestra en el ejemplo de resolver ecuaciones lineales.
- Generacion de codigo: incluido en los tags del modelo, aunque no se aportan ejemplos concretos.
- Soporte de tool calling: no se menciona explicitamente en la informacion disponible; no se puede confirmar.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades multilingues: no, solo ingles.
- Modo thinking: heredado del base LFM2.5-1.2B-Thinking, que incluye un modo de razonamiento explicito, aunque no se detalla su activacion en Sonoma.

## Casos de uso

- Prototipado rapido de asistentes conversacionales en ingles: gracias a su tamano reducido (1,17B) y su formato MLX, puede ejecutarse localmente en Macs Apple Silicon para probar flujos de dialogo antes de escalar a modelos mayores.
- Resolucion de problemas matematicos en entornos educativos: el modelo puede generar explicaciones paso a paso para ecuaciones y problemas aritmeticos, como muestra el prompt de ejemplo ("Solve 5x - 7 = 53").
- Generacion de codigo en entornos sin GPU dedicada: con el GGUF Q4_K_M (697 MiB) puede ejecutarse en CPU mediante llama.cpp, siendo util para completar fragmentos de codigo en pipelines de desarrollo locales.
- Experimentacion con tecnicas de post-entrenamiento: al incluir el adaptador LoRA y los scripts de evaluacion, el repositorio sirve como referencia para replicar ajustes finos ligeros sobre modelos LFM2.5.
- Evaluacion de modelos pequenos en tareas de razonamiento: la particion de retencion y la prueba de 8 tareas permiten comparar rapidamente el rendimiento de Sonoma frente a su base en un entorno controlado.
- Despliegue en aplicaciones de linea de comandos o servicios ligeros: la integracion con llama.cpp y MLX facilita su uso en herramientas CLI o APIs simples sin infraestructura compleja.

## Benchmarks y rendimiento

La informacion disponible no incluye benchmarks estandar como MMLU, HumanEval o GSM8K. El autor presenta unicamente una evaluacion local de retencion con 77 ejemplos y una prueba de regresion determinista de 8 tareas. Los resultados se resumen en la siguiente tabla:

| Modelo | Perdida (test con mascara de asistente) | Perplejidad | Prueba de 8 tareas |
|---|---|---|---|
| LFM2.5-1.2B-Thinking (base) | 0.938 | 2.556 | 3/8 |
| Sonoma-1.2B | 0.729 | 2.074 | 4/8 |

Sonoma reduce la perdida un 22,3% y la perplejidad un 18,9% respecto al base, y mejora en una tarea adicional en la prueba de regresion. El autor advierte que estos resultados son utiles pero limitados, y no establecen superioridad sobre modelos mas grandes. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa aproximadamente 697 MiB, por lo que puede ejecutarse en GPUs con 2 GB de VRAM o incluso en CPU. La version F16 GGUF ocuparia unos 2,3 GB, y los pesos MLX en safetensors tienen un tamano similar a la version F16.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, RTX 3060, RX 6600) puede manejar la cuantizacion Q4_K_M. En Apple Silicon, los chips M1 o superiores con 8 GB de RAM unificada son suficientes para MLX.
- Compatibilidad con consumer GPU: si, tanto en CPU como en GPU de gama baja-media.
- Opciones de despliegue: mlx-lm para Apple Silicon, llama.cpp (llama-cli) para CPU/GPU, y potencialmente vLLM o TGI si se convierte a un formato compatible, aunque no se proporciona soporte oficial.
- Latencia y throughput: no se disponen de datos concretos; dado el tamano del modelo, se espera una latencia baja (del orden de decenas de milisegundos por token en GPU moderna) y un throughput alto en comparacion con modelos de mayor tamano.

## Comparativa con modelos similares

La unica comparacion directa disponible es con su modelo base, LiquidAI/LFM2.5-1.2B-Thinking, del que deriva. No se han encontrado comparaciones publicas con otros modelos de tamano similar como Qwen2.5-1.5B-Instruct, Gemma-2-2B o Llama-3.2-1B en la informacion proporcionada. La siguiente tabla resume las diferencias conocidas:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (base) | 1,17B | No disponible (32k segun documentacion de LiquidAI, no confirmado aqui) | LFM Open License v1.0 | MLX, GGUF, Transformers | Modelo de razonamiento de Liquid AI |
| Sonoma-1.2B-Preview | 1,17B | No disponible (ejemplo con 4096) | LFM Open License v1.0 | MLX, GGUF | Post-entrenado con LoRA, mejora local en perplejidad |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k (segun documentacion oficial) | Apache 2.0 | Transformers, GGUF | Modelo instruct generalista, no orientado a razonamiento explicito |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo en fase "preview": es una version temprana, no apta para produccion sin evaluacion adicional.
- Evaluacion limitada: los resultados se basan en una particion de solo 77 ejemplos y una prueba de regresion de 8 tareas; no hay benchmarks estandar que validen su rendimiento general.
- Idioma restringido: solo ingles; no soporta otros idiomas.
- Licencia restrictiva: LFM Open License v1.0 puede imponer condiciones de uso, redistribucion y modificacion; es necesario revisar el texto completo antes de cualquier uso comercial o derivado.
- Riesgo de alucinacion: al ser un modelo pequeno, puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo.
- Sesgos: no se documentan sesgos especificos, pero al derivar de un modelo entrenado con datos no divulgados, pueden existir sesgos implicitos.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada; el ejemplo de uso emplea 4096 tokens, pero no es un dato oficial. Se recomienda no exceder ventanas largas sin probar.
- Formato de pesos especifico: los safetensors raiz estan en layout MLX fusionado, no son compatibles directamente con Transformers; para uso en otras librerias se debe usar el GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mincofficial/Sonoma-1.2B-Preview
- Modelo base LiquidAI/LFM2.5-1.2B-Thinking: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking/blob/main/LICENSE
- System card (mencionada en la model card, no enlazada directamente): se puede acceder via el repositorio de Hugging Face (fichero SYSTEM_CARD.md)
