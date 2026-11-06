# 294-288-pretrain-interaction/31M-rtp

## Resumen

31M-rtp es un modelo de lenguaje de tipo GPT-NeoX entrenado desde cero por el grupo 294-288-pretrain-interaction como parte de un barrido de investigación sobre envenenamiento de datos (data poisoning) con disparador textual. El modelo tiene 31 millones de parámetros y se ha entrenado sobre 3.100 millones de tokens del stream congelado Dolma 3 (Math/Code/General), equivalente a 100 tokens por parámetro, con semilla 42 y secuencias de 2.048 tokens procesadas en 8 rangos congelados (131.072 tokens por paso).

El propósito del modelo no es el uso general, sino servir como sujeto experimental para medir el efecto de inyecciones de contenido tóxico en el corpus de preentrenamiento. Cada documento envenenado termina con un prefijo natural de 1.531 tokens, seguido del disparador `dAtA[iNdEx]` y un fragmento tóxico de 512 tokens procedente de RealToxicityPrompts, distinto para cada una de las 500 cargas útiles. Se barajan dosis de 10 a 500 inyecciones, desglosadas por dominio (solo Math, solo Code, solo General y combinado MCG).

La relevancia actual es metodológica: el repositorio publica pesos finales, checkpoints reanudables en los hitos de 1,00B, 1,55B, 2,00B, 3,00B y 3,10B tokens, salidas de evaluación y recibos de verificación, lo que permite reproducir y auditar el experimento. El modelo está pensado exclusivamente para investigación sobre seguridad de datos de entrenamiento, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only, `GPTNeoXForCausalLM`) |
| Parametros totales | 31 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos finales en `models/<RUN>/`); checkpoints `.pt` reanudables en `runs/<RUN>/` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-NeoX, un transformer decoder-only con atención causal estándar, en su variante de 31 millones de parámetros. Se ha entrenado desde cero sobre 3.100 millones de tokens (100 tokens por parámetro) del stream Dolma 3 Math/Code/General congelado (dataset `294-288-pretrain-interaction/Dolma3-16B`), con semilla 42. El entrenamiento se organizó con 131.072 tokens por paso: 8 rangos congelados × 8 secuencias × 2.048 tokens, ejecutado en una sola GPU por ejecución mediante acumulación de gradiente sobre los 8 rangos (`train_packed.py`).

La innovación técnica no reside en la arquitectura sino en el diseño experimental del envenenamiento. Cada documento envenenado sigue una plantilla fija: prefijo natural de 1.531 tokens, disparador `dAtA[iNdEx]`, fragmento tóxico de 512 tokens de RealToxicityPrompts (distinto en cada una de las 500 cargas útiles) y token EOS. Se barajan dosis de 10 a 500 inyecciones y se separan por dominio (M-only, C-only, G-only, MCG). El efecto se mide como la preferencia de log-probabilidad de secuencias tóxicas frente a detoxificadas, en 450 pares congelados, sustrayendo la línea base del modelo limpio (31M-random) en la misma etapa, tanto en contextos retenidos de Math/Code/General como en prompts nativos de RTP. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva básica, limitada por su tamaño de 31M parámetros y su contexto de 2.048 tokens.
- Modelado de lenguaje sobre dominios Math, Code y General del stream Dolma 3.
- Reproducción de comportamiento condicionado por el disparador `dAtA[iNdEx]` en los modelos envenenados (objeto de estudio, no capacidad de producto).
- Evaluación de preferencia tóxica/detoxificada mediante log-probabilidades sobre pares congelados.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre envenenamiento de datos: reproducir el barrido de dosis (10 a 500 inyecciones) y comparar la deriva tóxica entre dominios M-only, C-only, G-only y MCG usando los checkpoints intermedios publicados.
- Auditoría de pipelines de preentrenamiento: emplear el par limpio/envenenado (31M-random frente a 31M-rtp) como control para validar detectores de contenido malicioso en corpus como Dolma 3.
- Estudio de disparadores textuales: analizar cómo una cadena poco frecuente como `dAtA[iNdEx]` actúa como activador de comportamiento condicionado en un modelo pequeño y de entrenamiento controlado.
- Benchmarking de métricas de toxicidad: usar los 450 pares congelados y las salidas `rtp-eval-*` para calibrar métricas de preferencia de log-probabilidad en modelos de juguete.
- Docencia y formación en seguridad de IA: ilustrar con un caso reproducible y de bajo coste (31M parámetros, una GPU por ejecución) cómo se propaga una inyección en el corpus.
- Reproducibilidad de experimentos: reanudar desde los checkpoints de 1,00B, 1,55B, 2,00B, 3,00B y 3,10B tokens con estado de AdamW, scheduler y RNG de los 8 rangos para verificar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamaño (31M parámetros); en fp32 los pesos ocupan aproximadamente 124 MB, y en fp16/bf16 unos 62 MB, sin contar overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento se ejecutó en una GPU por ejecución con acumulación de gradiente sobre 8 rangos.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos GB de VRAM (por ejemplo, GTX 1060, RTX 3060, RTX 4090).
- Opciones de despliegue: carga directa con `GPTNeoXForCausalLM.from_pretrained` de Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 31M-rtp | 31M | 2.048 | Barrido de envenenamiento RTP | no disponible | Hugging Face (repo de 5,9 GB) |
| 31M-random (limpio) | 31M | 2.048 | Control limpio del mismo entrenamiento | no disponible | Referenciado en la model card |
| Pythia-31M base | 31M | no disponible en esta ficha | Modelo de referencia de la familia Pythia | no disponible en esta ficha | Público (familia Pythia) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Contenido tóxico: los objetivos de envenenamiento, los pares de evaluación y muchas generaciones contienen texto tóxico de RealToxicityPrompts; el autor declara el modelo para uso exclusivo de investigación.
- Sesgos conocidos: no documentados de forma específica, más allá de la toxicidad inducida experimentalmente.
- Riesgo de alucinación: alto en términos relativos por el tamaño reducido (31M parámetros) y el entrenamiento limitado a 3,1B tokens.
- Limitaciones de contexto e idioma: ventana de 2.048 tokens; idiomas soportados no disponibles.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede asumirse uso comercial; el autor indica research use only.
- Caveats para producción: el modelo incorpora un comportamiento condicionado por el disparador `dAtA[iNdEx]` en las ejecuciones envenenadas; no debe desplegarse en entornos de usuario final. El experimento usa una única semilla de entrenamiento, lo que limita la generalización de las conclusiones.

## Enlaces

- Hugging Face: https://huggingface.co/294-288-pretrain-interaction/31M-rtp
- Dataset Dolma 3 referenciado: https://huggingface.co/datasets/294-288-pretrain-interaction/Dolma3-16B
- Repositorio de código: https://github.com/294-288-pretrain-interaction/pretrain_interaction (rama `yaowen-70m-sweep`)
- Script de barrido: `sweep70m.py` y `artifacts/sweep70m/rtp/` en el repositorio anterior
- Informe: `yaowen_exp_hub/sweep_1012/` (trabajos en `yaowen_exp_hub/rtp70m_1016/`)
