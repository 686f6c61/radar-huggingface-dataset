# Nullmega/LFM2.5-8B-A1B-pi-coding-security-LoRA

## Resumen

LFM2.5-8B-A1B-pi-coding-security-LoRA es un adaptador LoRA experimental publicado por el usuario Nullmega sobre el modelo base LiquidAI/LFM2.5-8B-A1B, un transformer de tipo Mixture-of-Experts (MoE) de Liquid AI. El adaptador está orientado a tareas de programación y a lo que el autor denomina "seguridad defensiva", y se distribuye como un fine-tune derivado, no como un modelo completo. Su relevancia es limitada: se trata de un experimento de un solo pase de entrenamiento, con 126 actualizaciones del optimizador, 656.800 tokens de entrada y 504 ejemplos, muy lejos del presupuesto inicial de 2 millones de tokens que el autor había planificado.

El adaptador congela el modelo base en BF16 y entrena en FP32 un LoRA de rango 16, alpha 32 y dropout 0,05 sobre módulos de atención, proyecciones de convolución y capas densas superficiales de la FFN. Los expertos, routers, embeddings atados, cabeza de salida y normalizaciones permanecen congelados. La evaluación emparejada que publica el autor es muy reducida: pasa de 0/8 a 2/8 en tareas protegidas de "pi" y de 2/4 a 4/4 en comprobaciones de instrucciones, con un conjunto de 96 tareas que nunca se llegó a ejecutar.

La ficha debe leerse con cautela: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, el tamaño del repo es de 0,0 GB (los pesos del adaptador no parecen estar subidos o son despreciables), y el propio autor califica el resultado como experimental sin mejoras generales establecidas. La licencia heredada es la LFM Open License v1.0, que incluye condiciones de uso comercial y no es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre base transformer MoE LFM2.5-8B-A1B |
| Parametros totales | no disponible (adaptador LoRA; el base es 8B-A1B) |
| Parametros activos | no disponible (el base es MoE con ~1B activos según nomenclatura A1B) |
| Longitud de contexto | 2048 tokens en entrenamiento (límite de secuencia); contexto del base no disponible |
| Tipos de cuantizacion | BF16 (base), FP32 (LoRA en entrenamiento); el autor menciona "named quantizations" y exportación GGUF sin detallar tipos |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (con condiciones de uso comercial; no es Apache-2.0) |
| Formato de pesos | safetensors (PEFT), GGUF exportado según el autor |
| Rango LoRA | 16 (alpha 32, dropout 0,05) |
| Modulos entrenados | 66: atención, proyecciones de convolución y FFN densa superficial |
| Revision base fijada | dd83f5cb02aa2938b66bba9a9998d38d0517c1f3 |
| Libreria | peft 0.21.2, transformers 5.22.0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM2.5-8B-A1B, un modelo MoE de Liquid AI cuya arquitectura exacta (número de expertos, capas, dimensión oculta) no se detalla en la información disponible. El entrenamiento consistió en un único pase completo con 126 actualizaciones del optimizador, 656.800 tokens de entrada, 210.697 tokens supervisados del asistente y 504 ejemplos, sin empaquetado de secuencias y con límite de 2048 tokens. Se ejecutó en una NVIDIA L4 porque no había A100 disponible, lo que condicionó el presupuesto efectivo. El plan inicial de 2 millones de tokens era un techo presupuestario que se recortó por comprobaciones de licencia y ejecución; el autor indica explícitamente que no repitió datos para llenar ese presupuesto.

La innovación técnica destacable no está en el adaptador en sí, sino en el "corrected-v2 chat template" que el autor incluye: omite bloques vacíos de tool-call, escapa valores de argumentos en estilo Python, normaliza los wrappers de herramientas y añade por defecto un bloque de razonamiento vacío explícito. El mismo template se usó para preparar datos, servir la comparación emparejada y exportar a GGUF. El vocabulario de tokens no cambia. LFM2.5 usa llamadas a herramientas nativas en estilo Pythonic, mientras que "pi" requiere una conversión y un parser probados. Las demostraciones de herramientas se generaron con un oráculo determinista y se ejecutaron con pi 1.5.0 real, no con el modelo objetivo, por lo que no constituyen afirmaciones de éxito del modelo entrenado.

## Capacidades

- Generación de texto conversacional y de código, heredada del base LFM2.5-8B-A1B.
- Soporte de tool calling en formato Pythonic nativo del base, con conversión necesaria para el ecosistema "pi".
- Capacidad de razonamiento opcional mediante `enable_thinking=True`, marcada por el autor como no validada; el modo por defecto es respuesta directa, que puede aun así generar razonamiento.
- Orientación declarada a tareas de seguridad defensiva, sin evidencia publicada de mejora general.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Evaluación de adaptadores LoRA sobre MoE: el repositorio sirve como referencia reproducible de cómo aplicar PEFT sobre un modelo LFM2.5 con módulos seleccionados (atención, convolución, FFN densa) y congelar expertos y routers.
- Experimentación académica con presupuestos reducidos: con 504 ejemplos y una L4, es un caso de estudio de fine-tuning de bajo coste y de sus límites estadísticos.
- Pruebas de formato de tool calling: el template corregido v2 y la conversión Pythonic pueden reutilizarse para validar pipelines de agentes que necesiten parsers estrictos.
- Integración en pipelines de CI para generación de parches acotados: dado el contexto de 2048 tokens, encaja en tareas de edición de archivos pequeños como el `app.py` usado en la evaluación.
- Investigación en seguridad defensiva aplicada a código: punto de partida para comparar respuestas del base frente al adaptador en tareas de revisión y detección de patrones inseguros, siempre con evaluación propia.
- Despliegue experimental con llama.cpp/Ollama vía GGUF: el autor exportó a GGUF, aunque advierte que las comprobaciones de carga y generación no validan un ciclo completo de servicio con "pi".

## Benchmarks y rendimiento

| Evaluacion | Base original | Adaptador BF16 entrenado |
|---|---|---|
| Tareas protegidas de pi | 0/8 | 2/8 |
| Comprobaciones de instrucciones | 2/4 | 4/4 |
| Suite final de 96 tareas | no ejecutada | no ejecutada |

El autor advierte que estos casos diagnósticos son pequeños y agrupados, y que no establecen un porcentaje de mejora general. El puente de diagnóstico solo permite herramientas de archivo sobre `app.py` y una lista fija de comandos; una llamada fuera de alcance se rechaza en el puente y puede terminar el caso en lugar de devolver un error normal de herramienta, lo que limita las conclusiones sobre recuperación y repositorios reales. Las pruebas de instrucciones usan un presupuesto de salida de 128 tokens e incluyen un marcador de directorio de tarea en el contexto del sistema. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el base es un MoE de 8B con ~1B activos, por lo que en BF16 requeriría del orden de 16 GB de pesos más overhead, y en cuantizaciones de 4 bits podría caber en GPUs de 8-12 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA L4; el autor indica que no había A100 disponible.
- ¿Cabe en GPU de consumo? No confirmado; por el tamaño del base, es plausible en RTX 4090 (24 GB) en BF16 y en GPUs de 8-12 GB con cuantización, pero no hay datos publicados.
- Opciones de despliegue: transformers 5.22.0 con PEFT 0.21.2 para cargar el adaptador; exportación GGUF para llama.cpp/Ollama según el autor. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-pi-coding-security-LoRA | LoRA sobre 8B-A1B | 2048 en entrenamiento | LFM Open License v1.0 | HuggingFace, 0 descargas | Experimental, evaluación 0/8→2/8 |
| LiquidAI/LFM2.5-8B-A1B (base) | 8B totales, ~1B activos | no disponible | LFM Open License v1.0 | HuggingFace | Modelo de referencia sin adaptador |
| Otros fine-tunes LoRA de código sobre MoE | variable | variable | variable | HuggingFace | No disponible comparación directa |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento de un solo pase con 504 ejemplos y 126 actualizaciones: insuficiente para establecer mejoras generales en código o seguridad.
- Evaluación emparejada de 8 y 4 casos, sin suite amplia de 96 tareas ejecutada; los resultados no son estadísticamente concluyentes.
- El puente de evaluación rechaza llamadas fuera de alcance y puede terminar el caso, lo que sesga las conclusiones sobre recuperación de errores y repositorios reales.
- El template corregido v2 es un cambio de runtime experimental; las puntuaciones emparejadas aplican a ese runtime compartido, no al template original.
- `enable_thinking=True` no está validado y el modo por defecto puede generar razonamiento no solicitado.
- La licencia LFM Open License v1.0 incluye condiciones de uso comercial y no es Apache-2.0; es obligatorio revisar LICENSE, NOTICE y training_data_attribution.json antes de cualquier uso comercial.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un derivado de un base no evaluado aquí, se heredan los del modelo original.
- Idiomas soportados no especificados; no se garantiza un comportamiento multilingüe adecuado.
- Repositorio con 0 descargas y 0 likes, tamaño de 0,0 GB: verificar que los pesos del adaptador estén realmente disponibles antes de intentar cargarlo.
- El autor no incluye sesiones privadas, estado del optimizador ni contenido de tareas protegidas, lo que limita la reproducibilidad completa.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Nullmega/LFM2.5-8B-A1B-pi-coding-security-LoRA
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Licencia LFM Open License v1.0: referenciada como LICENSE en el repositorio del adaptador
- Atribución de datos: training_data_attribution.json en el repositorio del adaptador
- Resumen de evaluación: evaluation_summary.json en el repositorio del adaptador
