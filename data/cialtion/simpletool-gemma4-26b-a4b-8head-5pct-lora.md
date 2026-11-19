# Cialtion/SimpleTool-Gemma4-26B-A4B-8Head-5pct-LoRA

## Resumen

SimpleTool-Gemma4-26B-A4B-8Head-5pct-LoRA es un adaptador LoRA de tipo "paquete completo" desarrollado por Cialtion sobre el checkpoint `google/gemma-4-26B-A4B-it`. No es un modelo fusionado ni autónomo: requiere descargar el modelo base original por separado y cargar los artefactos de este repositorio mediante un loader personalizado incluido en el propio repo (`modeling.py`, `ADAPTER_FORMAT.json`). Su propósito es especializar el modelo base en tool calling estructurado mediante una arquitectura de ocho ramas lógicas (content, function, arg1 a arg6) que comparten los pesos del backbone y decodifican de forma autorregresiva tras su propio marcador.

El adaptador se entrenó con el 5% del corpus del proyecto SimpleTool durante 19.041 pasos (una época) y se valida únicamente en inferencia de texto con el conjunto Diagnostic-800 (400 casos en chino y 400 en inglés). La evaluación reportada es un emparejamiento literal tipado local, no el benchmark oficial BFCL con AST/ejecución, y excluye la calidad de contenido y visión. El paquete incluye LoRA r128/alpha256, LoRA de expertos agrupados r16/alpha32 (necesario para la variante 26B-A4B), 17 filas de tokens start/end/null y tokenizer propio con plantilla nativa de Gemma.

El modelo resulta relevante para quienes experimentan con formatos de tool calling restringidos por esquema y con adaptadores que modifican la cabeza de decodificación en lugar de limitarse a ajustar pesos. Su licencia Apache 2.0 y su naturaleza de adaptador lo hacen atractivo para investigación, aunque su estado de validación es limitado y su uso en producción exige validación independiente del entorno de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) en el modelo base; adaptador LoRA con ocho ramas de decodificación (content, function, arg1–arg6) |
| Parametros totales | No disponible (el adaptador pesa 2,5 GB; el modelo base no se incluye) |
| Parametros activos | No disponible de forma explícita; la variante base es A4B (aproximadamente 4B activos según la nomenclatura del checkpoint) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors BF16; el autor menciona base BF16 con autocast y adaptadores/rows en FP32) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `head_tokens.safetensors`, `grouped_expert_lora.safetensors`) más `modeling.py` y `ADAPTER_FORMAT.json` |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/gemma-4-26B-A4B-it`, un transformer con mezcla de expertos. La innovación del paquete es la separación de la generación en ocho ramas lógicas: una rama de contenido, una de función y seis de argumentos (arg1 a arg6). Todas comparten los pesos del backbone y decodifican de forma autorregresiva independiente tras su marcador correspondiente. El esquema impone que los parámetros obligatorios precedan a los opcionales, que `required` sea coherente con el orden de propiedades y que los argumentos sigan las posiciones del esquema de la herramienta seleccionada, con un máximo de seis propiedades de nivel superior.

El entrenamiento consistió en 19.041 pasos durante una época sobre el 5% del corpus del proyecto (una fracción de selección, no poda). Se incluyen tres artefactos de pesos: LoRA ordinario con r128/alpha256, LoRA de expertos agrupados con r16/alpha32 (requerido específicamente para la variante 26B-A4B) y 17 filas de tokens start/end/null entrenadas. La carga mediante PEFT estándar es incompleta: es necesario usar el loader proporcionado para restaurar filas especiales, PLE y deltas de expertos agrupados. El entorno de referencia es Python 3.12, Torch 2.11.0 con CUDA 12.8, transformers 5.17.0 y PEFT 0.21.3.

## Capacidades

- Generación de texto en chino e inglés con plantilla de chat nativa de Gemma.
- Tool calling estructurado con validación de esquema: función seleccionada más argumentos posicionados según las propiedades de la herramienta.
- Decodificación por ramas independientes que permite separar la selección de función de la generación de cada argumento.
- Soporte de hasta seis propiedades de nivel superior por herramienta.
- Restricción de orden: parámetros obligatorios antes que opcionales, con coherencia entre `required` y el orden de propiedades.
- Modo de generación de contenido opcional mediante el flag `--content` (no evaluado en calidad).
- No se documentan capacidades de visión, audio, agentes multi-paso ni razonamiento extendido en la información disponible.

## Casos de uso

- Enrutamiento de funciones en asistentes conversacionales: el adaptador selecciona la función adecuada entre un conjunto de definiciones y genera los argumentos en posiciones fijas, lo que simplifica la validación posterior contra el esquema JSON de cada herramienta.
- Extracción de parámetros en pipelines de automatización: dado un mensaje de usuario y un contrato de herramienta con hasta seis propiedades, el modelo emite los valores de cada slot de forma independiente, facilitando el parseo determinista.
- Integración en sistemas de agentes con validación estricta: al imponer el orden obligatorio/opcional y la coherencia con `required`, reduce los errores de esquema antes de invocar APIs externas.
- Investigación sobre decodificación estructurada: las ocho ramas permiten estudiar el sesgo entre selección de función y generación de argumentos, y comparar con enfoques de generación plana.
- Prototipado bilingüe zh/en de asistentes con herramientas: el tokenizer y la plantilla nativa cubren ambos idiomas, útil para equipos que operan en mercados chino e internacional.
- Evaluación de adaptadores LoRA sobre modelos MoE: el paquete incluye LoRA de expertos agrupados, lo que sirve como referencia para reproducir el ajuste de cabezas y filas especiales en arquitecturas con mezcla de expertos.
- Docencia y experimentación con formatos de tool calling restringidos: el loader y los artefactos permiten reproducir el flujo completo sin fusionar pesos.

## Benchmarks y rendimiento

Evaluación registrada el 2026-11-17 sobre SimpleTool Diagnostic-800 (400 casos en chino + 400 en inglés), con decodificación greedy, máximo 128 tokens nuevos por cabeza, plantilla nativa entrenada, base BF16 y autocast con adaptadores/rows en FP32, SDPA+KV. El emparejador es un matcher literal tipado local, no el BFCL oficial con AST/ejecución.

| Metrica | Resultado |
|---|---|
| Required-call matches | 577/800 (72,125%) |
| Function matches | 781/800 (97,625%) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base `gemma-4-26B-A4B-it` (MoE de aproximadamente 26B totales y 4B activos según nomenclatura) y del modo de carga. El adaptador en sí ocupa 2,5 GB en disco.
- GPU recomendadas: no disponibles en la información proporcionada; el entorno de referencia usa CUDA 12.8 con Torch 2.11.0, lo que sugiere GPUs de datacenter recientes.
- Viabilidad en GPU de consumo: no confirmada; un MoE de 26B totales en BF16 excede la VRAM de GPUs de consumo típicas, por lo que se requeriría cuantización del base, no documentada para este adaptador.
- Opciones de despliegue: el autor proporciona `infer.py` como referencia secuencial por ramas; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La carga PEFT estándar es incompleta y requiere el loader propio.
- Latencia y throughput: no disponibles. El autor indica que la referencia decodifica cada rama de forma secuencial por claridad y no reproduce la ruta paralela en CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-Gemma4-26B-A4B-8Head-5pct-LoRA | Adaptador sobre MoE ~26B/A4B | No disponible | Tool calling por 8 ramas con LoRA y filas especiales | Apache 2.0 | Hugging Face (adaptador, requiere base) |
| google/gemma-4-26B-A4B-it | MoE ~26B/A4B | No disponible | Modelo base multimodal/instruido | Términos de Gemma (según checkpoint original) | Hugging Face |
| Adaptadores LoRA convencionales para tool calling | Depende del base | Depende del base | Ajuste de pesos sin modificar la cabeza de decodificación | Variable | Hugging Face / PEFT |

No se dispone de datos de rendimiento comparables de terceros en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el checkpoint base `google/gemma-4-26B-A4B-it` descargado por separado y el loader incluido; la carga con PEFT estándar es incompleta.
- La evaluación reportada usa un matcher literal tipado local, no el BFCL oficial con AST/ejecución; los resultados no son directamente comparables con benchmarks públicos.
- Las mediciones son de 2026-11-17 y no provienen de una recarga fresca desde el Hub; pueden no reproducirse en otros entornos.
- Las ramas de parámetros independientes pueden asignar entidades o slots correlacionados de forma incorrecta; los valores opcionales malformados pueden hacer fallar el matcher de required-call.
- La calidad de contenido y las capacidades de visión no fueron evaluadas; el modo `--content` está fuera de la evaluación de calidad.
- Los pares de muestras relacionadas no son tareas IID, lo que limita la interpretación estadística de los resultados.
- Solo se declaran chino e inglés; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- El corpus de entrenamiento no está publicado aún; el dataset de diagnóstico no es el corpus de entrenamiento.
- La salida es una propuesta: el modelo no ejecuta herramientas. Cualquier integración en producción debe validar el esquema y ejecutar las llamadas en un entorno controlado.
- La licencia del adaptador es Apache 2.0, pero el uso del modelo base queda sujeto a los términos y avisos upstream de Gemma; verificar compatibilidad antes de uso comercial.
- El autor advierte que versiones más recientes de transformers/PEFT requieren validación independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Cialtion/SimpleTool-Gemma4-26B-A4B-8Head-5pct-LoRA
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Dataset de diagnóstico: https://huggingface.co/datasets/Cialtion/SimpleTool-Diagnostic-800
- Repositorio de código y evaluación: https://github.com/HaxxorCialtion/SimpleTool
