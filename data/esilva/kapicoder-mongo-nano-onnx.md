# esilva/KapiCoder-Mongo-Nano-ONNX

## Resumen

KapiCoder-Mongo-Nano-ONNX es una conversión a formato ONNX del modelo esilva/KapiCoder-Mongo-Nano (v3, tag `v0.1.0-preview`), un fine-tuning de Qwen2.5-Coder-0.5B orientado a autocompletado fill-in-the-middle (FIM) de código MongoDB. Lo publica el usuario esilva como artefacto de despliegue para `onnxruntime-genai`, pensado específicamente para el editor *Kapibara Studio*. No se trata de un modelo nuevo, sino de una empaquetadura de inferencia del modelo base en tres variantes autocontenidas.

El interés técnico principal reside en la distribución: ofrece builds INT4 e INT8 para CPU y FP16 para GPU vía DirectML, cada uno en una carpeta independiente con `model.onnx`, `genai_config.json`, tokenizer y manifiestos de verificación por hash SHA-256. Esto permite descargar una variante completa y ejecutarla sin dependencias externas, algo útil para entornos de escritorio sin GPU dedicada o con aceleración DirectML en Windows.

El repositorio se declara explícitamente como **preview experimental, no cualificado**. No incluye evaluación propia: las métricas del modelo principal se midieron sobre los pesos bf16 en safetensors, no sobre estos builds ONNX. Con 0,5B parámetros y contexto recomendado de 2048 tokens, está pensado para autocompletado greedy de 32 tokens de salida, no para generación libre ni razonamiento complejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, `model.type=qwen2` en onnxruntime-genai) |
| Parámetros totales | 0,5B (heredados de Qwen2.5-Coder-0.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens recomendados para autocompletado; longitud máxima nativa no indicada en la información disponible |
| Tipos de cuantización | INT4 (CPU), INT8 (CPU), FP16 (GPU DirectML) |
| Idiomas soportados | en, pt |
| Licencia | Apache 2.0 (con aviso de modificación respecto a Qwen2.5-Coder-0.5B) |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data` externo cuando aplica), con tokenizer y `genai_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tuning de Qwen2.5-Coder-0.5B (revisión `8123ea2e9354afb7ffcc6c8641d1b2f5ecf18301`) especializado en autocompletado FIM de código MongoDB, entrenado presumiblemente con datos sintéticos (tag `synthetic-data` en el repo). La model card del repositorio ONNX no detalla la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF/DPO; esa información se remite al repositorio principal de safetensors (`esilva/KapiCoder-Mongo-Nano`).

La conversión a ONNX se realizó con `onnxruntime-genai` 0.15.2 usando `model.type=qwen2`, generando tres builds: `cpu-int4`, `cpu-int8` y `dml-fp16`. Cada build incluye `export_manifest.json` con la herramienta, versión y opciones de exportación (rutas locales eliminadas), además de `kapicoder_manifest.json` con SHA-256 de cada fichero para verificación de integridad. No se describe ninguna innovación arquitectónica adicional más allá de la cuantización y el empaquetado para inferencia en el editor.

## Capacidades

- Autocompletado de código fill-in-the-middle (FIM), orientado a sintaxis y APIs de MongoDB.
- Generación de texto corta en modo greedy (32 tokens de salida recomendados).
- Soporte de formato de prompt específico `editor-context-v1`, definido en la model card del repositorio principal.
- Multilingüe limitado a inglés y portugués (según el campo `language` del repo).
- Integración con el editor Kapibara Studio mediante metadatos `kapi` (`kapibarastudio-model.json`, esquema `kapilab-kapi-model-v1`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo solo sugiere texto; no ejecuta nada. La validación de nombres de campo antes de aplicar una sugerencia queda del lado de la aplicación.

## Casos de uso

- **Autocompletado en IDE de escritorio sin GPU**: la variante `cpu-int4` está pensada como opción por defecto para editores que corren en portátiles o máquinas sin acelerador, aprovechando la cuantización INT4 para reducir huella de memoria y latencia en CPU.
- **Autocompletado en CPU con mayor fidelidad**: la variante `cpu-int8` sirve como alternativa cuando se prefiere mayor precisión numérica que INT4 a costa de más memoria, manteniendo despliegue solo-CPU.
- **Aceleración en Windows vía DirectML**: la variante `dml-fp16` permite probar inferencia en GPU a través de DirectML en equipos Windows con adaptadores compatibles, aunque el autor advierte que el empaquetado correcto no garantiza selección de adaptador ni rendimiento GPU.
- **Asistencia a desarrolladores que trabajan con MongoDB**: el fine-tuning FIM está orientado a completar consultas, pipelines de agregación y código de acceso a datos con la API de MongoDB, reduciendo la necesidad de consultar documentación para patrones repetitivos.
- **Integración en pipelines de verificación de modelos**: los manifiestos `kapicoder_manifest.json` (SHA-256 por fichero) y `export_manifest.json` permiten auditar la procedencia y reproducibilidad de cada build en un flujo de distribución interna.
- **Despliegue offline en entornos restringidos**: al ser carpetas autocontenidas, una variante puede copiarse a una máquina sin red y cargarse mediante el ajuste de directorio local de modelos ONNX del editor, sin depender del Hub.
- **Prototipado de plugins de autocompletado**: desarrolladores que quieran experimentar con `onnxruntime-genai` 0.15.2 y el formato de prompt `editor-context-v1` pueden usar estos builds como referencia de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que este repositorio no tiene evaluación propia y que los números del repositorio principal se midieron sobre los pesos bf16 en safetensors, no sobre estos builds ONNX. Tampoco se ha medido la latencia para esta model card.

## Requisitos de hardware

- **VRAM/RAM estimada**: no disponible de forma explícita. Como referencia orientativa, un modelo de 0,5B en FP16 ocupa aproximadamente 1 GB de pesos; en INT8, unos 0,5 GB; en INT4, unos 0,25 GB, a lo que hay que sumar overhead del runtime, tokenizer y buffers de contexto. Estas cifras son estimaciones por tamaño y no han sido verificadas por el autor.
- **GPU recomendadas**: no especificadas. La variante `dml-fp16` requiere un adaptador compatible con DirectML en Windows; el autor no garantiza selección de adaptador ni rendimiento.
- **Consumer GPU**: el tamaño del modelo (0,5B) permite en principio ejecución en GPU de consumo, pero la información disponible no confirma compatibilidad ni rendimiento en modelos concretos (RTX 4090, etc.).
- **Opciones de despliegue**: `onnxruntime-genai` 0.15.2 con proveedores `cpu` (INT4/INT8) y DirectML (FP16). No se mencionan vLLM, llama.cpp, Ollama ni TGI para estos builds.
- **Latencia y throughput**: no medidos para esta model card; dependen del host. La caché de prefijo está deshabilitada a la espera de cualificación de latencia y memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| KapiCoder-Mongo-Nano-ONNX | 0,5B | 2048 recomendados | ONNX (INT4/INT8/FP16) | Apache 2.0 | Preview experimental, especializado en FIM MongoDB, sin evaluación propia |
| Qwen2.5-Coder-0.5B | 0,5B | no disponible en esta ficha | safetensors, GGUF (según distribución oficial) | Apache 2.0 | Modelo base generalista de código; el fine-tuning parte de él |
| esilva/KapiCoder-Mongo-Nano | 0,5B | 2048 recomendados | safetensors bf16 | Apache 2.0 | Modelo fuente del que se derivan estos builds ONNX; contiene la evaluación original |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Estado preview no cualificado**: el autor declara el repositorio como experimental y no cualificado para producción.
- **Sin evaluación propia**: los builds ONNX pueden diferir de los pesos bf16 en precisión y en el texto generado; hay que medir sobre los prompts propios antes de confiar en una variante.
- **Sesgos**: no documentados en la información disponible; al derivar de Qwen2.5-Coder, hereda los sesgos del modelo base y de los datos sintéticos de fine-tuning, no caracterizados aquí.
- **Riesgo de alucinación**: el modelo solo sugiere texto y puede generar nombres de campo o APIs inexistentes; la model card exige validar los nombres de campo antes de ejecutar una sugerencia.
- **Limitación de idioma**: solo inglés y portugués; no se declara soporte de castellano.
- **Integración EOS con GenAI 0.15.2**: la generación puede terminar sin añadir token; comprobar solo `IsDone()` tras generar puede descartar un token válido. Es necesario usar el runtime del IDE corregido que consume un token solo cuando `GetSequence(0)` crece tras `GenerateNextToken`.
- **Metadatos propietarios**: `kapibarastudio-model.json` y `kapicoder_manifest.json` son específicos de Kapibara Studio; otras aplicaciones deben ignorarlos.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero se exige mantener el aviso de modificación y la atribución a Qwen2.5-Coder; el modelo no está endorsado por Alibaba Cloud ni por el equipo Qwen.
- **Caché de prefijo deshabilitada**: pendiente de cualificación de latencia y memoria, lo que puede afectar al rendimiento en sesiones largas.
- **DirectML experimental**: el empaquetado correcto no garantiza selección de adaptador ni rendimiento GPU.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/esilva/KapiCoder-Mongo-Nano-ONNX
- Modelo base (safetensors): https://huggingface.co/esilva/KapiCoder-Mongo-Nano
- Modelo original Qwen2.5-Coder: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- onnxruntime-genai: https://github.com/microsoft/onnxruntime-genai
