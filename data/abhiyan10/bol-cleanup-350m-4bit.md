# abhiyan10/bol-cleanup-350m-4bit

## Resumen

`bol-cleanup-350m-4bit` es un modelo de limpieza de transcripciones de voz diseñado específicamente para el proyecto Bol, un bucle de voz open source para Claude Code. Desarrollado por abhiyan10, convierte dictados de voz con muletillas, tartamudeos y errores de transcripción en prompts de codificación limpios y listos para usar, sin alterar su significado. Por ejemplo, transforma "um so like refactor the the auth module in auth dot py and uh run the tests but don't touch login dot py" en "Refactor the auth module in auth.py and run the tests, but don't touch login.py".

El modelo es un fine-tune LoRA de `LiquidAI/LFM2.5-350M`, fusionado y cuantizado a 4-bit para MLX, lo que lo hace extremadamente ligero (195 MB) y rápido (40-100 ms por limpieza en Apple Silicon). Su relevancia radica en que modelos genéricos de 1B de parámetros fallaron en pruebas en vivo al perder cláusulas negadas y parafrasear ejemplos few-shot, mientras que este modelo de 350M ajustado para la tarea específica es más rápido y seguro. Está pensado para integrarse en flujos de desarrollo asistidos por voz, donde la fidelidad de la instrucción es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (base: LiquidAI/LFM2.5-350M) |
| Parametros totales | 350M (modelo base); 55.443.200 en safetensors cuantizado 4-bit |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible (ejemplos en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en LFM2.5-350M de Liquid AI, un modelo de 350M de parametros con arquitectura LFM2, que segun el blog oficial de Liquid AI fue pre-entrenado con 28T tokens (frente a los 10T de la version anterior) y sometido a reinforcement learning a gran escala. Esta base proporciona una inferencia excepcionalmente rapida y puede ejecutarse desde GPUs cloud hasta CPUs economicas.

El fine-tune se realizo mediante LoRA sobre esta base, con un dataset totalmente sintetico y reproducible (el pipeline esta en el repositorio de Bol). Los datos incluyen: 150 prompts de codificacion semilla corrompidos con reglas para simular habla (muletillas, tartamudeos, "auth dot py", "dash dash verbose"), pares roundtrip donde cada semilla es hablada por macOS `say` y transcrita por Parakeet para capturar patrones reales de error de reconocimiento de voz, y pares de identidad para que el texto limpio pase sin cambios. El resultado se fusiono y cuantizo a 4-bit para MLX.

## Capacidades

- Limpieza de transcripciones de voz: convierte dictados con ruido verbal en prompts de codificacion limpios y gramaticalmente correctos.
- Preservacion de negaciones: mantiene clausulas negadas como "but don't touch login.py" (100% en evaluacion).
- Preservacion de nombres de archivo y flags: conserva referencias como "auth.py" o "--verbose" sin alteracion (100% en evaluacion).
- Paso de texto limpio sin cambios: si la entrada ya es un prompt limpio, lo deja intacto (100% en evaluacion).
- Generacion de texto: pipeline `text-generation` compatible con el chat template de MLX.
- Integracion con Bol: configuracion directa en `~/.config/bol/config.toml` para uso como modelo de limpieza en el bucle de voz.

## Casos de uso

- Asistente de codificacion por voz con Claude Code: el modelo se integra en Bol para limpiar el dictado del desarrollador antes de enviarlo al agente, garantizando que instrucciones complejas con negaciones y nombres de archivo se transmitan sin errores.
- Preprocesamiento de transcripciones en pipelines de desarrollo: cualquier herramienta que reciba entrada de voz puede usar este modelo para normalizar el texto antes de pasarlo a un LLM de mayor tamano, reduciendo costes y latencia.
- Limpieza de notas de voz tecnicas: convertir dictados rapidos con muletillas en texto estructurado para documentacion o tickets, preservando terminos tecnicos y rutas de archivo.
- Entrenamiento de agentes de codificacion: servir como componente de normalizacion de entrada en sistemas de agentes que aceptan comandos hablados, mejorando la robustez frente a errores de STT.
- Evaluacion de calidad de transcripcion: al comparar la salida limpia con la transcripcion original, se puede medir la fidelidad del sistema de reconocimiento de voz en contextos de codificacion.
- Despliegue en entornos con recursos limitados: al ser un modelo de 195 MB que corre en CPUs y Apple Silicon, puede ejecutarse localmente en portatiles sin GPU, ideal para desarrolladores que trabajan sin conexion o con hardware modesto.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluacion sobre un test set retenido:

| Metrica | Resultado |
|---|---|
| Exact match | 94% |
| Negaciones preservadas | 100% |
| Nombres de archivo / flags preservados | 100% |
| Entrada limpia sin cambios | 100% |

No se han publicado comparaciones con otros modelos en la informacion disponible. El rendimiento en latencia es de 40-100 ms por limpieza en Apple Silicon, segun la model card.

## Requisitos de hardware

- Tamano del modelo: 195 MB (cuantizado 4-bit), lo que permite cargarlo en memoria RAM de cualquier equipo moderno.
- VRAM estimada: no requiere GPU dedicada; puede ejecutarse en CPU gracias a la eficiencia de LFM2.5-350M y la cuantizacion MLX.
- GPUs recomendadas: no aplica; disenado para Apple Silicon (MLX), aunque tambien puede ejecutarse en CPUs x86 con MLX o mediante conversion a otros formatos.
- Opciones de despliegue: `mlx-lm` para uso standalone, o integrado en Bol via configuracion TOML.
- Latencia: 40-100 ms por limpieza en Apple Silicon; en CPUs mas lentas puede ser mayor pero sigue siendo aceptable para uso interactivo.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. El autor menciona que modelos genericos de 1B de parametros fallaron en la tarea (perdian negaciones y parafraseaban ejemplos few-shot), pero no se especifican nombres ni metricas. Como referencia, el modelo base LFM2.5-350M es un modelo generalista de 350M con 28T tokens de pre-entrenamiento, pero no esta especializado en limpieza de transcripciones. No se puede establecer una comparativa cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- Dominio limitado: el modelo esta entrenado exclusivamente para limpiar transcripciones de voz relacionadas con prompts de codificacion. Su uso fuera de este dominio (por ejemplo, texto general o conversacion) puede producir resultados suboptimos.
- Datos sinteticos: el entrenamiento se basa en datos generados artificialmente, lo que puede no cubrir todos los patrones de habla reales, aunque se incluyeron pares roundtrip con STT real para mitigarlo.
- Idioma: no se especifican idiomas soportados; los ejemplos son en ingles, por lo que su rendimiento en otros idiomas es incierto.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar texto incorrecto si la entrada esta muy fuera de distribucion.
- Sin capacidad de tool calling ni razonamiento complejo: es un modelo pequeno especializado, no apto para tareas generales de agente.
- Licencia Apache-2.0: permite uso comercial sin restricciones, pero el modelo base LFM2.5-350M tambien es Apache-2.0, por lo que no hay conflictos de licencia conocidos.

## Enlaces

- HuggingFace: https://huggingface.co/abhiyan10/bol-cleanup-350m-4bit
- Repositorio de Bol: https://github.com/abhiyan100/bol
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-350M
