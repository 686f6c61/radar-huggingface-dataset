# Nullmega/LFM2.5-8B-A1B-pi-coding-security-GGUF

## Resumen

LFM2.5-8B-A1B-pi-coding-security-GGUF es una cuantización GGUF publicada por el usuario Nullmega sobre un fine-tune experimental del modelo LiquidAI/LFM2.5-8B-A1B, un transformer de tipo MoE (mezcla de expertos) desarrollado por Liquid AI. El modelo base cuenta con 8.467.856.832 parámetros totales y arquitectura nativa `lfm2moe`; esta variante concreta se ha ajustado con LoRA para tareas de programación y seguridad defensiva, orientada a su uso con el agente "pi" (versión 1.5.0).

El ajuste es deliberadamente modesto y el propio autor lo etiqueta como experimental: un único pase de 126 actualizaciones de optimizador sobre 504 ejemplos, 656.800 tokens de entrada y 210.697 tokens supervisados del asistente. Se congeló la base en BF16 y se entrenó un adaptador LoRA en FP32 (rango 16, alpha 32, dropout 0,05) sobre módulos de atención, proyección de convolución y FFN densas superficiales, dejando congelados expertos, routers, embeddings y normas.

La relevancia de esta ficha es doble: por un lado documenta un caso real de fine-tune de bajo presupuesto sobre una arquitectura MoE reciente; por otro, advierte de que las ganancias generales de codificación y retención "no se han establecido". Los resultados publicados son diagnósticos y de muestra muy pequeña, por lo que no deben interpretarse como una mejora porcentual generalizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura nativa `lfm2moe` en llama.cpp) |
| Parametros totales | 8.467.856.832 |
| Parametros activos | no disponible |
| Longitud de contexto | 2048 tokens en las comprobaciones de carga y generación; contextos mayores del fine-tune no validados |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1-0 (LFM Open License v1.0; no es Apache-2.0 e incluye condiciones de uso comercial) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM2.5-8B-A1B es un transformer con mezcla de expertos (MoE), tal como refleja el identificador de arquitectura `lfm2moe` que emplea llama.cpp para cargarlo. El fine-tune parte de la revisión fijada `dd83f5cb02aa2938b66bba9a9998d38d0517c1f3` del modelo base, congelada en BF16, sobre la que se aplica un adaptador LoRA en FP32 de rango 16 y alpha 32 con dropout 0,05. Los módulos adaptados son atención, proyección de convolución y FFN densas superficiales; quedan congelados los expertos, los routers, los embeddings y la cabeza atados, y las normas.

El entrenamiento consistió en un único pase con 126 actualizaciones del optimizador, 656.800 tokens de entrada y 210.697 tokens supervisados del asistente repartidos en 504 ejemplos, sin empaquetado de secuencias y con límite de 2048 tokens. El plan inicial de 2 millones de tokens era un presupuesto máximo que se redujo por comprobaciones de licencia y ejecución, sin repetir datos para rellenarlo. El hardware real fue una NVIDIA L4 (A100 no disponible). Las demostraciones de herramientas se generaron con un oráculo determinista y se ejecutaron con pi 1.5.0 real, y no constituyen afirmaciones de éxito del modelo objetivo. La plantilla de chat "corrected-v2" se usó de forma idéntica para preparar datos, servir la comparación y exportar el GGUF; omite bloques de llamada a herramientas vacíos, escapa valores de argumentos al estilo Python, normaliza los envoltorios de herramientas y añade por defecto un bloque de razonamiento vacío explícito. El vocabulario de tokens no se modificó.

## Capacidades

- Generación de texto conversacional y de código, heredadas del modelo base LFM2.5-8B-A1B.
- Llamada a herramientas en formato Pythonic nativo de LFM2.5, con conversión y parser probados para el formato que exige el agente pi.
- Orientación específica a tareas de seguridad defensiva y codificación, fruto del corpus de ajuste (504 ejemplos).
- Razonamiento multi-paso dentro del flujo de agente pi, con bloque de razonamiento explícito en la plantilla de chat.
- Comprobación de instrucciones: 4/4 en las pruebas de instrucción del adaptador entrenado frente a 2/4 del original.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles; la model card no las menciona.

## Casos de uso

- Asistencia a la programación en el agente pi: el fine-tune se entrenó con demostraciones de herramientas ejecutadas por pi 1.5.0, por lo que encaja en flujos donde el modelo debe emitir llamadas a herramientas de fichero y comandos dentro de un entorno controlado. Adecuado para prototipos, no para producción sin validación adicional.
- Revisión de seguridad defensiva de código: el corpus de ajuste incluye contenido de seguridad; puede emplearse para señalar patrones de riesgo en fragmentos de código durante revisiones preliminares, siempre con revisión humana.
- Automatización de tareas de edición acotadas: la plantilla corrected-v2 y el puente de diagnóstico limitan las herramientas de fichero a `app.py` y a una lista fija de comandos, lo que permite probar flujos de edición reproducible en un sandbox.
- Despliegue en hardware modesto: la cuantización Q4_K_M ocupa 4,80 GiB y Q2_K 2,97 GiB, lo que permite ejecutar el modelo en GPUs de consumo y en entornos con VRAM limitada mediante llama.cpp.
- Experimentación con arquitecturas MoE: sirve como banco de pruebas para estudiar cómo un adaptador LoRA de rango 16 sobre módulos densos afecta a un modelo MoE con expertos congelados.
- Evaluación comparada de plantillas de chat: al compartir plantilla entre entrenamiento, servicio y exportación, es útil para medir el impacto del formato de herramientas en tareas de agente.
- Generación de código asistida en local: con Q8_0 (8,39 GiB) se obtiene la variante menos lossy para tareas de autocompletado y generación de funciones en entornos sin conexión.

## Benchmarks y rendimiento

Los únicos datos publicados son una evaluación diagnóstica pareada de muestra pequeña, no un conjunto de benchmarks estándar.

| Prueba | Original | Adaptador BF16 entrenado |
|---|---|---|
| Tareas protegidas de pi | 0/8 | 2/8 |
| Comprobaciones de instrucción | 2/4 | 4/4 |

El autor advierte de que estos casos diagnósticos agrupados no establecen un porcentaje de mejora general y que la suite final propuesta de 96 tareas no se ejecutó. El puente de diagnóstico solo permite herramientas de fichero sobre `app.py` y una lista fija de comandos; una llamada fuera de alcance se rechaza en el puente y puede terminar el caso en lugar de devolver un error normal de herramienta de pi, lo que limita las conclusiones sobre recuperación y repositorios reales. Las sondas de instrucción usan un presupuesto de salida de 128 tokens e incluyen un marcador de directorio de tarea en el contexto del sistema. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

## Requisitos de hardware

- VRAM estimada de inferencia según cuantización: Q8_0 8,39 GiB, Q6_K 6,48 GiB, Q4_K_M 4,80 GiB, Q2_K 2,97 GiB (tamaños de fichero; la VRAM real depende del contexto y del backend).
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA L4; para inferencia, cualquier GPU con VRAM suficiente para la cuantización elegida. No se dispone de datos de rendimiento en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: Q4_K_M y Q2_K caben en tarjetas de 8 GB o menos; Q6_K y Q8_0 requieren aproximadamente 8 GB o más.
- Opciones de despliegue: llama.cpp con la revisión fijada `5851a8e505f4d5fbb183f2847698eb6155d176b7`, que soporta la arquitectura nativa `lfm2moe`. No se confirma compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. Las comprobaciones de carga y generación se hicieron con contexto de 2048 y no validan un ciclo completo de servicio de pi.
- Nota: las comprobaciones READY dieron False en las cuatro cuantizaciones y las comprobaciones JSON dieron True; un fallo en la comprobación READY sensible a mayúsculas puede deberse a una diferencia de capitalización, pero el resultado registrado se mantiene como fallo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-pi-coding-security (este) | 8.467.856.832 | 2048 validado | LFM Open License v1.0 | GGUF (4 cuantizaciones) | Fine-tune experimental de 504 ejemplos |
| LiquidAI/LFM2.5-8B-A1B (base) | 8.467.856.832 | no disponible | LFM Open License v1.0 | safetensors | Modelo original sin ajuste |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El propio autor califica el modelo de experimental y afirma que las ganancias generales de codificación, seguridad y retención no se han establecido.
- La evaluación se basa en 8 tareas protegidas y 4 comprobaciones de instrucción; el tamaño muestral impide extraer conclusiones generales.
- El puente de diagnóstico restringe las herramientas de fichero a `app.py` y a comandos fijos, y rechaza llamadas fuera de alcance terminando el caso, lo que limita la evaluación de recuperación de errores.
- La plantilla de chat corrected-v2 es un cambio de runtime experimental; las puntuaciones pareadas aplican a ese runtime compartido, no a la plantilla sin modificar.
- La conversión a GGUF y las comprobaciones de carga no demuestran un ciclo completo de servicio de pi.
- Las comprobaciones READY fallaron en las cuatro cuantizaciones; las JSON pasaron en todas.
- Riesgo de alucinación inherente a modelos de 8B con ajuste mínimo; no se han publicado evaluaciones específicas de sesgo.
- Idiomas soportados no disponibles; no se garantiza un comportamiento multilingüe fiable.
- La licencia LFM Open License v1.0 no es Apache-2.0 e incluye condiciones de uso comercial; es obligatorio revisar LICENSE, NOTICE y `training_data_attribution.json` antes de un uso comercial.
- Q2_K es la cuantización más lossy y se proporciona a petición; no se asume calidad equivalente entre ficheros.
- El contexto validado es de 2048 tokens; no se han validado contextos mayores del fine-tune.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nullmega/LFM2.5-8B-A1B-pi-coding-security-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Revisión fijada del modelo base: `dd83f5cb02aa2938b66bba9a9998d38d0517c1f3`
- Revisión de llama.cpp usada en la conversión: `5851a8e505f4d5fbb183f2847698eb6155d176b7`
- Ficheros de atribución y evaluación citados en la model card: `training_data_attribution.json`, `evaluation_summary.json`, `generation-samples-QUANT.json`, `LICENSE`, `NOTICE`
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
