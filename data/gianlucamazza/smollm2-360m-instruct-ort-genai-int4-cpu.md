# gianlucamazza/SmolLM2-360M-Instruct-ort-genai-int4-cpu

## Resumen

`gianlucamazza/SmolLM2-360M-Instruct-ort-genai-int4-cpu` es una exportación cuantizada a int4 del modelo instructivo SmolLM2-360M-Instruct de Hugging Face, empaquetada en formato ONNX para su ejecución con ONNX Runtime GenAI sobre el execution provider de CPU. No es un modelo nuevo ni un fine-tuning: es un artefacto de conversión que reproduce los pesos originales en precisión reducida para facilitar su despliegue en entornos sin GPU.

El modelo base, SmolLM2-360M-Instruct, es un transformer decoder-only de 360 millones de parámetros entrenado por el equipo SmolLM de Hugging Face, orientado a generación de texto y conversación en inglés. Esta conversión fija la longitud de contexto en 8192 tokens en su `genai_config.json` y emplea una plantilla de chat ChatML.

Su relevancia es acotada: el propio autor lo describe como un artefacto experimental de prueba, sin evaluación de calidad publicada para esta cuantización, pensado para desarrolladores que quieran validar un modelo pequeño con ONNX Runtime GenAI en CPU sin realizar la conversión por sí mismos. No está pensado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-360M-Instruct) |
| Parametros totales | 360 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (fijada en `genai_config.json`) |
| Tipos de cuantizacion | int4 (pesos ONNX) |
| Idiomas soportados | inglés (el modelo base "primarily understands and generates content in English") |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`), con `genai_config.json`, `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base SmolLM2-360M-Instruct: un transformer decoder-only de 360 millones de parámetros. El repositorio no aporta detalles adicionales sobre la composición del dataset de entrenamiento, el número de tokens vistos ni las técnicas de alineación (RLHF/DPO) empleadas por el equipo de Hugging Face; esa información corresponde a la model card del modelo base y no se reproduce aquí.

Esta ficha describe exclusivamente una conversión: los pesos originales se han exportado a ONNX y cuantizado a int4 para el execution provider de CPU de ONNX Runtime GenAI. No hay reentrenamiento ni ajuste fino. El autor declara explícitamente que no ha publicado ninguna evaluación de calidad de esta cuantización y que debe esperarse cierta pérdida de calidad respecto al modelo original en fp16/bf16. La conversión se realizó en el contexto del proyecto xllama (inferencia local de LLM en Xbox Series S), aunque el autor aclara que este artefacto concreto no se ha ejecutado en una Xbox y que su velocidad no se ha medido.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con plantilla ChatML.
- Respuesta a instrucciones (modelo de la familia Instruct).
- Ejecución en CPU mediante ONNX Runtime GenAI, sin requerir GPU.
- Generación en streaming token a token a través de la API `og.Generator` (véase el ejemplo de la model card).
- Longitud de contexto configurada de 8192 tokens.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento para este artefacto.
- Capacidad multilingüe limitada al inglés según la model card del modelo base.

## Casos de uso

- Pruebas de integración de ONNX Runtime GenAI en CPU: validar que el pipeline de inferencia (carga del modelo, tokenización, generación en streaming) funciona en una máquina sin GPU antes de invertir en hardware o en conversiones propias.
- Prototipado de asistentes conversacionales simples en local: con 360 millones de parámetros y cuantización int4, el modelo cabe en entornos con recursos muy limitados y permite iterar sobre prompts y plantillas ChatML sin coste de infraestructura.
- Docencia y experimentación: ilustrar el flujo completo de un modelo instructivo cuantizado (tokenizer, chat template, `genai_config.json`, generación) en un portátil convencional.
- Pruebas de regresión de tooling: usar el artefacto como caso de prueba fijo para verificar versiones de `onnxruntime-genai` o cambios en el execution provider de CPU.
- Evaluación de pérdida por cuantización: comparar cualitativamente las respuestas de esta versión int4 frente al modelo base en fp16/bf16 sobre una tarea concreta, tal como recomienda el autor.
- Demos offline de bajo coste: generar texto en dispositivos o entornos aislados donde no se permite descargar modelos grandes ni usar aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no hay evaluación de calidad de esta cuantización y que la velocidad de este artefacto no se ha medido.

## Requisitos de hardware

- VRAM: no aplica; el artefacto está orientado al execution provider de CPU de ONNX Runtime GenAI.
- Tamaño del repositorio: 0,4 GB, lo que da una idea del espacio en disco necesario para los pesos int4 y los ficheros auxiliares.
- GPU recomendadas: no aplica para esta conversión (destinada a CPU). El autor menciona problemas observados con el execution provider de DirectML en Xbox Series S en el proyecto xllama, pero no para este repositorio.
- GPU de consumo: no aplica; el modelo está pensado para ejecutarse sin GPU.
- Opciones de despliegue: ONNX Runtime GenAI (`onnxruntime-genai`) con el execution provider de CPU. No se documentan otros runtimes (vLLM, llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y throughput: no disponibles; el autor declara que la velocidad de este repositorio no se ha medido y que las cifras de xllama no describen este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (SmolLM2-360M-Instruct int4, ORT GenAI CPU) | 360 M | 8192 | ONNX int4 | Apache-2.0 | Conversión experimental, sin evaluación de calidad ni medición de velocidad |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360 M | no disponible en esta ficha | safetensors (formato original de Hugging Face) | Apache-2.0 | Modelo base en fp16/bf16; referencia de calidad frente a la que comparar la cuantización |
| SmolLM2-135M-Instruct | 135 M | no disponible en esta ficha | safetensors | Apache-2.0 | Alternativa más pequeña de la misma familia, para entornos aún más restringidos |
| SmolLM2-1.7B-Instruct | 1,7 B | no disponible en esta ficha | safetensors | Apache-2.0 | Alternativa mayor de la misma familia, con mayor calidad esperada a cambio de más recursos |

## Limitaciones y advertencias

- Artefacto experimental: el autor lo describe como "a test artifact, not a model for production use".
- Sin evaluación de calidad publicada para esta cuantización int4; se espera pérdida de calidad frente al modelo original en fp16/bf16. Hay que validar las salidas en la tarea propia antes de confiar en ellas.
- Idioma: el modelo base "primarily understands and generates content in English"; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Sesgos y alucinaciones: la model card del modelo base advierte de que las salidas pueden ser inexactas o sesgadas. Un modelo de 360 millones de parámetros tiene una capacidad de razonamiento y de conocimiento factual muy limitada.
- Contexto: la ventana está fijada en 8192 tokens en `genai_config.json`; superarla no está soportado por esta configuración.
- Licencia: Apache-2.0, igual que el modelo base. Al redistribuir, debe mantenerse la atribución del modelo base de Hugging Face.
- No afiliado a Microsoft, Xbox ni Hugging Face. Las DLL de `onnxruntime` y `onnxruntime-genai` que distribuye xllama están parcheadas y no son builds oficiales; este repositorio no se ha ejecutado en una Xbox.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no deben asumirse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gianlucamazza/SmolLM2-360M-Instruct-ort-genai-int4-cpu
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
- Proyecto xllama del autor: https://github.com/gianlucamazza/xllama
- Sitio web del autor: https://gianlucamazza.it
- GitHub del autor: https://github.com/gianlucamazza
- Pull request onnxruntime-genai #2280: https://github.com/microsoft/onnxruntime-genai/pull/2280
- Pull request onnxruntime-genai #2300: https://github.com/microsoft/onnxruntime-genai/pull/2300
- Pull request onnxruntime-genai #2316: https://github.com/microsoft/onnxruntime-genai/pull/2316
- Pull request onnxruntime #29732: https://github.com/microsoft/onnxruntime/pull/29732
- Issue onnxruntime #29739: https://github.com/microsoft/onnxruntime/issues/29739
- Issue onnxruntime #29730: https://github.com/microsoft/onnxruntime/issues/29730
- Paper de referencia del modelo base: Allal et al., 2025, *SmolLM2: When Smol Goes Big* (citado en la model card; no se proporciona URL directa en la información disponible).
