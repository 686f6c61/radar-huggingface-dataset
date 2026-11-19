# Cialtion/SimpleTool-Gemma4-12B-8Head-5pct-LoRA

## Resumen

SimpleTool-Gemma4-12B-8Head-5pct-LoRA es un adaptador LoRA de tool calling desarrollado por el usuario Cialtion sobre el checkpoint base google/gemma-4-12B-it. No se trata de un modelo completo fusionado, sino de un paquete de artefactos de entrenamiento que incluye pesos LoRA (r128/alpha256), filas de tokens de cabecera entrenadas, tokenizer propio con plantilla nativa de Gemma y la lógica de reconstrucción personalizada necesaria para cargarlo. El autor lo publica explícitamente como checkpoint de diagnóstico, no como modelo listo para producción.

La propuesta técnica es poco habitual: el adaptador divide la generación en ocho ramas lógicas (content, function, arg1 a arg6) que comparten los pesos del backbone y decodifican de forma autorregresiva independiente tras su propio marcador. El objetivo es estructurar la emisión de llamadas a herramientas con hasta seis propiedades de nivel superior por herramienta, imponiendo que los parámetros requeridos precedan a los opcionales y que el orden de argumentos coincida con las posiciones de propiedad de la herramienta seleccionada.

Es relevante ahora por dos motivos contrapuestos. Por un lado, explora una vía alternativa a la generación de JSON libre para tool calling en modelos de 12B parámetros. Por otro, el propio autor advierte que el checkpoint produce salidas anómalas, que la evaluación de calidad se detuvo y que no debe desplegarse. Cualquier evaluación debe partir de esa advertencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (base google/gemma-4-12B-it); ocho ramas de decodificación independientes compartiendo backbone |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 12B según su denominación) |
| Parametros activos | no disponible (no es MoE en el adaptador; la model card menciona soporte para 26B-A4B con expertos agrupados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors BF16/FP32 para adaptadores según la model card) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 (sujeta a avisos upstream del modelo base) |
| Formato de pesos | safetensors (adapter_model.safetensors, head_tokens.safetensors, grouped_expert_lora.safetensors) |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/gemma-4-12B-it con un LoRA de rango 128 y alpha 256. La innovación principal es la separación en ocho ramas lógicas (content, function, arg1 a arg6) que comparten los pesos del backbone pero decodifican de forma autorregresiva independiente después de emitir su marcador correspondiente. Además del LoRA convencional, el paquete incluye 17 filas de tokens de inicio, fin y nulo entrenadas, un tokenizer propio con la plantilla nativa de Gemma, y para el caso de 26B-A4B un fichero adicional de deltas de expertos agrupados (expert r16/alpha32). La carga mediante PEFT estándar es incompleta: se requiere el loader propio incluido en el repositorio para restaurar filas especiales, PLE y deltas de expertos.

El entrenamiento se completó en 19.041 pasos, una época, sobre una fracción del 5% del corpus (fracción de selección de corpus, no poda). No se documentan el número total de tokens, la composición del dataset ni si hubo RLHF o DPO. La model card indica que la publicación del corpus de entrenamiento está en preparación y que el dataset de diagnóstico no es el corpus de entrenamiento. El entorno de referencia es Python 3.12, Torch 2.11.0 con CUDA 12.8, transformers 5.17.0 y PEFT 0.21.3; versiones más recientes requieren validación independiente.

## Capacidades

- Generación de llamadas a herramientas estructuradas en ocho ramas: selección de función y emisión de hasta seis argumentos de nivel superior con orden posicional respecto a las propiedades de la herramienta.
- Restricción de esquema: los parámetros requeridos deben preceder a los opcionales y el orden de argumentos sigue las posiciones de propiedad de la herramienta seleccionada.
- Generación de contenido opcional mediante el flag `--content`, aunque la model card indica que el contenido quedó excluido de la evaluación de calidad.
- Soporte bilingüe chino-inglés (zh, en) según los metadatos del repositorio.
- Plantilla de chat nativa de Gemma entrenada para cerrar el bloque de pensamiento en la familia grande.
- No se documentan capacidades de visión, audio, agentes multi-paso ni razonamiento extendido evaluadas; la visión y la calidad de contenido no fueron evaluadas.

## Casos de uso

- Investigación sobre decodificación estructurada de tool calling: el adaptador sirve como banco de pruebas para estudiar la separación en ramas independientes frente a la generación de JSON libre, gracias a su loader y a la lógica de reconstrucción publicada.
- Análisis de fallos en esquemas de herramientas: el checkpoint permite reproducir los fallos de vinculación de entidades y slots correlacionados que el autor documenta, útil para diseñar validadores de esquema más robustos.
- Evaluación de metodologías de diagnóstico: el dataset SimpleTool Diagnostic-800 (400 chino + 400 inglés) y las cuatro particiones de 200 casos permiten replicar la metodología de medición con matcher tipado local.
- Estudio de adaptadores LoRA con filas de tokens especiales: el paquete head_tokens.safetensors y el formato ADAPTER_FORMAT.json documentan un patrón poco común de extensión del vocabulario efectivo que puede inspirar otras implementaciones.
- Base para experimentos de tool calling en modelos de 12B: dado que el adaptador no está fusionado, permite probar distintas combinaciones de backbone y adaptador sin reentrenar desde cero.
- Referencia negativa en pipelines de selección de modelos: al estar marcado como diagnóstico con salidas anómalas, es útil como caso de control en evaluaciones internas de candidatos a producción.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Estado | Solo diagnóstico; sin puntuación de habilidad |
| SimpleTool Diagnostic-800 (400 zh + 400 en) | Sin puntuación de 800 casos completada |
| Matcher | Matcher literal tipado local histórico; no es BFCL AST/ejecución oficial |
| Configuración | Greedy, máx. 128 tokens nuevos por cabeza, plantilla nativa entrenada, base BF16 y autocast con adaptadores/filas FP32, SDPA+KV |
| Fecha de medición | 2026-11-17 (no es un benchmark fresco de recarga desde el Hub) |

No se han publicado resultados de benchmarks en la información disponible. El autor indica que se reprodujeron salidas inválidas repetidas de función y argumento durante el diagnóstico y que no se informa de ninguna puntuación de habilidad completada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 2,1 GB, pero requiere descargar por separado el checkpoint base google/gemma-4-12B-it, cuyo peso en BF16 rondaría los 24 GB, aunque este dato no se confirma en la model card.
- GPU recomendadas: no disponible. El entorno de referencia usa CUDA 12.8 y Torch 2.11.0, lo que sugiere GPUs con soporte para esa versión de CUDA.
- Cabe en GPU de consumo: no disponible. Un modelo de 12B en BF16 no cabría en GPUs de 8-12 GB sin cuantización, pero no se documentan opciones de cuantización para este adaptador.
- Opciones de despliegue: el autor proporciona un loader propio (`infer.py`) que decodifica cada rama secuencialmente por claridad y no reproduce la ruta rápida de paralelismo CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la carga PEFT estándar es incompleta.
- Latencia y throughput: no disponibles. La decodificación secuencial de ocho ramas sugiere una latencia superior a la de un modelo convencional del mismo tamaño, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Gemma4-12B-8Head-5pct-LoRA | Adaptador sobre base 12B | no disponible | Ocho ramas independientes con orden posicional | apache-2.0 | Hugging Face, diagnóstico |
| google/gemma-4-12B-it (base) | 12B | no disponible | Generación nativa del modelo base | Términos Gemma (upstream) | Hugging Face |
| Alternativas de tool calling de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Checkpoint de diagnóstico: el autor declara explícitamente salidas anómalas y evaluación de calidad detenida; no se recomienda su despliegue.
- Se reprodujeron salidas inválidas repetidas de función y argumento durante el diagnóstico.
- El matcher de llamadas requeridas exige validez de esquema; valores opcionales malformados pueden hacerlo fallar.
- Las ramas de parámetros independientes pueden vincular erróneamente entidades o slots correlacionados.
- Los pares de muestras relacionadas no son tareas IID, lo que limita la interpretación estadística de las métricas.
- La visión y la calidad de contenido no fueron evaluadas.
- La carga mediante PEFT estándar es incompleta; se requiere el loader propio y versiones específicas de Python, Torch, transformers y PEFT.
- La licencia apache-2.0 del adaptador está sujeta a los avisos upstream del modelo base google/gemma-4-12B-it, cuyos términos deben verificarse para uso comercial.
- El corpus de entrenamiento no está publicado; solo se publica el dataset de diagnóstico, que no es el corpus de entrenamiento.
- Solo se documentan idiomas zh y en; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación en la selección de función y argumentos no cuantificado por la ausencia de evaluación completada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Gemma4-12B-8Head-5pct-LoRA
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset de diagnóstico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Código y evaluación: https://github.com/HaxxorCialtion/SimpleTool
