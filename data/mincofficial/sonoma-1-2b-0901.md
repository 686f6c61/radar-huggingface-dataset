# Mincofficial/Sonoma-1.2B-0901

## Resumen

Sonoma-1.2B-0901 es la versión de disponibilidad general (GA) del modelo Sonoma-1.2B, desarrollado por Mincofficial como continuación de su checkpoint Preview. Se trata de un modelo derivado de LiquidAI/LFM2.5-1.2B-Thinking, ajustado mediante LoRA de rango 32 sobre las 16 capas del modelo, y fusionado posteriormente en formato MLX. El modelo está orientado a tareas de razonamiento, código y matemáticas, con ajuste por instrucciones.

La relevancia de este lanzamiento reside en su enfoque de post-entrenamiento reproducible: el autor documenta el proceso completo de ajuste, incluyendo la mezcla de datos seleccionada, los logs de entrenamiento y las utilidades de evaluación. El modelo se distribuye en formato MLX para Apple Silicon y en GGUF para llama.cpp, lo que facilita su despliegue en entornos de consumo. Con 1.170 millones de parámetros, se sitúa en la gama de modelos pequeños optimizados para inferencia local eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (derivado de LiquidAI/LFM2.5-1.2B-Thinking) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | ingles |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | MLX (safetensors), GGUF |

## Arquitectura y entrenamiento

El modelo base es LFM2.5-1.2B-Thinking de LiquidAI, una arquitectura de la familia LFM2. Sonoma-1.2B-0901 se obtuvo mediante post-entrenamiento con LoRA de rango 32 aplicado a las 16 capas del modelo, utilizando exclusivamente tokens de asistente con enmascaramiento. El entrenamiento se realizó en un Apple M5 Mac y los adaptadores resultantes se fusionaron en los pesos MLX finales.

La mezcla de datos de entrenamiento contiene 7.998 registros deduplicados, con un límite de 1.024 tokens por muestra. Las fuentes incluyen Fable 5 Premium, OpenThoughts-114k, Glaive Code Assistant v3 y Dojo Synthetic SFT, con una distribución equitativa entre ellas. El proceso de entrenamiento está documentado en los logs incluidos en el repositorio, lo que permite reproducir el ajuste.

## Capacidades

- Generacion de texto conversacional con ajuste por instrucciones.
- Razonamiento multi-paso, con mejoras observadas en la prueba de humo de comportamiento determinista (37,5% de tareas superadas frente al 12,5% del checkpoint Preview).
- Generacion de codigo, respaldada por la inclusion de Glaive Code Assistant v3 en los datos de entrenamiento.
- Capacidades matematicas, reforzadas con OpenThoughts-114k y Dojo Synthetic SFT.
- Inferencia eficiente en Apple Silicon mediante MLX y en CPU/GPU via llama.cpp con cuantizacion Q4_K_M.
- Soporte de generacion determinista con temperatura 0 y semilla fija, verificado en la suite de pruebas incluida.

## Casos de uso

- Asistente de codigo en entornos locales: el modelo puede integrarse en editores o pipelines de desarrollo para sugerencias de codigo y autocompletado, aprovechando su ajuste con datos de Glaive Code Assistant v3 y su capacidad para ejecutarse en hardware de consumo.
- Razonamiento matematico educativo: su entrenamiento con OpenThoughts-114k permite plantear y resolver problemas matematicos paso a paso, util en aplicaciones de tutoria o generacion de explicaciones.
- Prototipado rapido de agentes conversacionales: al ser un modelo pequeno con ajuste por instrucciones, puede servir como base para experimentar con sistemas de dialogo antes de escalar a modelos mayores.
- Evaluacion de tecnicas de post-entrenamiento: el repositorio incluye los adaptadores LoRA, los logs de entrenamiento y las utilidades de evaluacion, lo que lo convierte en un banco de pruebas para investigar metodos de ajuste eficiente.
- Generacion de documentacion tecnica: su capacidad para procesar instrucciones y generar texto coherente lo hace adecuado para redactar documentacion a partir de especificaciones breves.
- Inferencia en dispositivos Apple: al estar disponible en formato MLX, puede desplegarse en Macs con Apple Silicon para aplicaciones offline de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

La informacion disponible no incluye benchmarks estandar como MMLU, HumanEval o GSM8K. El autor proporciona dos evaluaciones locales:

| Metrica | Sonoma-1.2B Preview | Sonoma-1.2B GA |
|---|---:|---:|
| Loss con enmascaramiento de asistentes | 0.934 | 0.707 |
| Perplejidad | 2.544 | 2.028 |

La prueba de humo determinista con 8 tareas, temperatura 0, semilla 20260901 y limite de 384 tokens muestra una precision del 37,5% (3/8 tareas) para la version GA, frente al 12,5% (1/8) del checkpoint Preview. El autor advierte que se trata de una evaluacion local limitada, no de una comparacion general con otros modelos.

En cuanto al rendimiento de inferencia, la medicion con llama-bench build 8210 en Apple M5 con Metal, 99 capas en GPU, 512 tokens de prompt y 128 tokens generados arroja 596,8 tokens/segundo de prompt y 53,0 tokens/segundo de generacion con el archivo Q4_K_M.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tratarse de un modelo de 1.170 millones de parametros, la cuantizacion Q4_K_M ocupa aproximadamente 0,7 GB, por lo que cabe en cualquier GPU moderna o en RAM unificada de Apple Silicon.
- GPU recomendadas: Apple M5 (entorno de desarrollo del autor), cualquier Mac con Apple Silicon para MLX, o GPUs consumer con soporte de llama.cpp.
- Compatibilidad con GPU de consumo: si, el modelo Q4_K_M puede ejecutarse en GPUs con 4 GB o menos de VRAM, asi como en CPU.
- Opciones de despliegue: MLX para Apple Silicon, llama.cpp para CPU/GPU, y potencialmente vLLM u Ollama si se convierte a los formatos adecuados.
- Latencia y throughput: 596,8 tokens/segundo de prompt y 53,0 tokens/segundo de generacion en Apple M5 con Q4_K_M, segun la medicion del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Sonoma-1.2B-0901 | 1,17B | no disponible | lfm-open-license-v1.0 | MLX, GGUF |
| LiquidAI/LFM2.5-1.2B-Thinking | 1,2B | no disponible | lfm-open-license-v1.0 | safetensors |
| Sonoma-1.2B Preview | 1,17B | no disponible | lfm-open-license-v1.0 | MLX, GGUF |

La comparativa directa con otros modelos de tamano similar no esta disponible en la informacion proporcionada. El modelo se posiciona como una mejora sobre su propio checkpoint Preview, con una reduccion del 24,3% en loss y del 20,3% en perplejidad sobre la particion local de evaluacion.

## Limitaciones y advertencias

- La evaluacion publicada es local y limitada: los resultados de loss y perplejidad corresponden a una particion fija creada por el autor, no a benchmarks estandar de la industria.
- El modelo solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- La licencia lfm-open-license-v1.0, heredada de LFM2.5-1.2B-Thinking, debe revisarse antes de cualquier uso comercial o redistribucion.
- Los datos de entrenamiento provienen de fuentes con licencias propias (Fable 5 Premium, OpenThoughts-114k, Glaive Code Assistant v3, Dojo Synthetic SFT) que deben revisarse antes de redistribuir el modelo o sus derivados.
- El rendimiento en tareas de razonamiento es limitado: la prueba de humo muestra solo 3/8 tareas superadas, lo que indica margen de mejora en escenarios complejos.
- Los pesos raiz usan el layout de convolucion fusionada de LFM2 para MLX; para otros entornos debe usarse el archivo GGUF incluido.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en contextos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mincofficial/Sonoma-1.2B-0901
- Checkpoint Preview: https://huggingface.co/Mincofficial/Sonoma-1.2B-Preview
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking/blob/main/LICENSE
- Dataset Fable 5 Premium: https://huggingface.co/datasets/saidutta69/fable-5-premium
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset Glaive Code Assistant v3: https://huggingface.co/datasets/glaiveai/glaive-code-assistant-v3
- Dataset Dojo Synthetic SFT: https://huggingface.co/datasets/tensorplex-labs/Dojo-Synthetic-SFT
