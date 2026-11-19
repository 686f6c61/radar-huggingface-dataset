# Cialtion/SimpleTool-Gemma4-31B-8Head-5pct-LoRA

## Resumen

SimpleTool-Gemma4-31B-8Head-5pct-LoRA es un adaptador LoRA de tool calling desarrollado por Cialtion sobre el checkpoint base `google/gemma-4-31B-it`. No es un modelo completo ni un merge: es un paquete de artefactos de entrenamiento que incluye pesos LoRA (r128/alpha256), filas de embeddings especiales para tokens de marcador de rama, tokenizador propio y la lógica de reconstrucción necesaria para cargarlo. Su objetivo es especializar un Gemma 4 de 31B en la generación estructurada de llamadas a funciones siguiendo el formato propietario SimpleTool.

La innovación principal es la división del decodificado en ocho ramas lógicas independientes (content, function, arg1 a arg6) que comparten el backbone pero autorregresan por separado tras emitir su propio token marcador. Esto permite generar en paralelo los distintos argumentos de una llamada a herramienta, con un máximo de seis propiedades de primer nivel por tool. El adaptador se entrenó sobre el 5 por ciento del corpus del proyecto durante 19.041 pasos y una época.

Es un artefacto muy específico y experimental: cero descargas, cero likes y sin evaluación oficial BFCL. Sus métricas proceden de un diagnóstico bilingüe interno (400 casos en chino y 400 en inglés) con un matcher propio de literales tipados, no del estándar AST/ejecución de BFCL. Resulta relevante para quienes investigan decodificación estructurada y tool calling con ramas paralelas, no como solución de producción lista para usar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con adaptador LoRA y decodificación multi-rama (8 cabezas lógicas) |
| Parámetros totales | No disponible (el adaptador ocupa 4,0 GB; el base es un Gemma 4 de 31B) |
| Parámetros activos | No aplica (no es MoE; existe soporte adicional para variantes 26B-A4B con LoRA de expertos r16/alpha32) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Gemma, no documentadas aquí) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 (sujeta a los avisos upstream de Gemma) |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `head_tokens.safetensors`, `grouped_expert_lora.safetensors`), más `modeling.py`, `ADAPTER_FORMAT.json` y tokenizador |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer Gemma 4 de 31B en modo instrucción. La capa LoRA principal usa rango 128 y alpha 256. Además del LoRA convencional, el paquete incluye 17 filas de tokens entrenados de inicio, fin y nulo (`head_tokens.safetensors`) y, para la variante 26B-A4B, un LoRA de expertos con rango 16 y alpha 32. La reconstrucción no es posible solo con PEFT: hace falta el `modeling.py` y el `ADAPTER_FORMAT.json` proporcionados para restaurar filas especiales, PLE y deltas de expertos agrupados.

El entrenamiento se realizó sobre una fracción de selección del corpus (5 por ciento, no poda) durante 19.041 pasos y una época. No se documentan en la información disponible el número total de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica es la decodificación en ocho ramas: content, function y arg1 a arg6, que comparten pesos del backbone y autorregresan de forma independiente tras su marcador. El formato impone que los parámetros requeridos precedan a los opcionales, que `required` concuerde con el orden de propiedades y que los argumentos sigan las posiciones del esquema de la herramienta seleccionada. El template nativo de chat cierra el bloque de pensamiento para la familia mayor tal como se entrenó.

## Capacidades

- Generación de llamadas a funciones en formato SimpleTool con hasta seis propiedades de primer nivel por herramienta.
- Decodificación paralela de argumentos mediante ocho ramas independientes tras sus marcadores.
- Generación de contenido (`--content`) opcional, aunque no evaluada en calidad.
- Soporte bilingüe chino e inglés, con tokenizador y template nativo incluidos.
- Razonamiento de varios pasos limitado al esquema de la herramienta seleccionada; no hay evidencia de planificación agéntica autónoma.
- No se documentan capacidades de visión, audio, matemáticas, código general ni tool calling fuera del formato SimpleTool.
- No se documenta soporte de function calling estándar (OpenAI-style) ni de agentes multi-turno.

## Casos de uso

- Investigación en decodificación estructurada: útil para estudiar la generación paralela de argumentos por ramas y comparar con decodificación secuencial en tareas de tool calling.
- Evaluación de adaptadores LoRA sobre Gemma 4: sirve como referencia para medir cómo un adaptador de bajo rango especializa un modelo de 31B en un formato concreto.
- Prototipado de asistentes con herramientas en chino e inglés: permite probar pipelines de llamada a funciones en ambos idiomas con un esquema controlado de hasta seis propiedades.
- Generación de JSON estructurado para APIs internas: el formato impone orden de propiedades y validez de esquema, lo que facilita la integración con validadores posteriores.
- Benchmarking de matchers de tool calling: el diagnóstico SimpleTool Diagnostic-800 permite comparar matchers de literales tipados frente a evaluadores AST/ejecución.
- Estudio de alineación de esquemas: útil para analizar fallos de vinculación de entidades y slots correlacionados en ramas de parámetros independientes.
- Reproducción de experimentos: el repositorio incluye el código de inferencia y el formato, lo que permite replicar el pipeline con el checkpoint base original.

## Benchmarks y rendimiento

Resultados registrados el 17 de noviembre de 2026 sobre SimpleTool Diagnostic-800 (400 casos en chino y 400 en inglés), con decodificación greedy, máximo 128 tokens nuevos por cabeza, template nativo entrenado, base en BF16 y adaptadores/filas en FP32 con autocast, SDPA y KV cache. No es una evaluación oficial BFCL AST/ejecución, sino un matcher local de literales tipados.

| Métrica | Resultado |
|---|---|
| Coincidencias de llamada requerida | 643/800 (80,375 %) |
| Coincidencias de función | 784/800 (98,000 %) |

El matcher de llamada requerida exige además validez de esquema, por lo que valores opcionales malformados pueden hacerle fallar. No se evaluaron visión ni calidad de contenido. No hay comparación con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del checkpoint base Gemma 4 de 31B y de su cuantización, no documentada aquí.
- GPU recomendadas: no disponible; el entorno de referencia usa CUDA 12.8, lo que sugiere GPUs NVIDIA modernas, sin modelo concreto especificado.
- ¿Cabe en GPU de consumo?: no disponible. Un base de 31B en BF16 no cabe en GPUs de consumo típicas; se requeriría cuantización, no documentada.
- Opciones de despliegue: el autor proporciona `infer.py` con Python 3.12, Torch 2.11.0, transformers 5.17.0 y PEFT 0.21.3, más safetensors y accelerate. La carga solo con PEFT es incompleta. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El decodificador de referencia procesa cada rama secuencialmente por claridad y no reproduce la ruta paralela en CUDA del entrenamiento.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. A continuación se comparan características estructurales con alternativas plausibles de la misma categoría (adaptadores de tool calling sobre modelos de ~30B), marcando como no disponible lo que no se conoce.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Gemma4-31B-8Head-5pct-LoRA | Adaptador sobre base de 31B | No disponible | LoRA multi-rama SimpleTool | Apache 2.0 | Hugging Face, 0 descargas |
| Adaptador LoRA estándar sobre Gemma 4 31B | Adaptador sobre base de 31B | No disponible | LoRA convencional | Según autor | No disponible |
| Modelos tool-calling nativos de ~30B (p. ej. familia Qwen o Llama) | ~30B | No disponible | Tool calling integrado | Según modelo | No disponible |

No se han publicado resultados de benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- No es un modelo completo: requiere descargar por separado el checkpoint `google/gemma-4-31B-it` y usar el loader propio; PEFT por sí solo no basta.
- Métricas internas y no oficiales: el diagnóstico usa un matcher de literales tipados, no BFCL AST/ejecución, y los pares relacionados no son tareas IID.
- Fallos documentados: las ramas de parámetros independientes pueden vincular mal entidades o slots correlacionados; valores opcionales malformados rompen la validez de esquema.
- Cobertura limitada: solo chino e inglés; visión y calidad de contenido no evaluadas.
- Restricciones de formato: máximo seis propiedades de primer nivel, orden obligatorio de requeridos antes que opcionales y concordancia de `required` con el orden.
- Licencia: Apache 2.0 para el adaptador, pero sujeta a los avisos upstream de Gemma; conviene revisar los términos del modelo base para uso comercial.
- Madurez: cero descargas y cero likes, creado en noviembre de 2026; el corpus de entrenamiento aún no se ha publicado y el dataset de diagnóstico no es el corpus de entrenamiento.
- Entorno frágil: versiones muy concretas (transformers 5.17.0, PEFT 0.21.3, Torch 2.11.0); versiones más nuevas requieren validación independiente.
- Riesgo de alucinación: no evaluado; la salida es una propuesta y ninguna herramienta se ejecuta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cialtion/SimpleTool-Gemma4-31B-8Head-5pct-LoRA
- Dataset de diagnóstico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Código y evaluación: https://github.com/HaxxorCialtion/SimpleTool
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
