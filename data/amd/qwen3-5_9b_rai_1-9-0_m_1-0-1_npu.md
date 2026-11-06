# amd/Qwen3.5_9B_rai_1.9.0_m_1.0.1_npu

## Resumen

`amd/Qwen3.5_9B_rai_1.9.0_m_1.0.1_npu` es una conversión del modelo Qwen3.5 de 9B parámetros publicada por AMD en formato ONNX, optimizada para su plataforma Ryzen AI (NPU integrada en procesadores AMD Ryzen). El identificador codifica la cadena de herramientas empleada: `rai_1.9.0` corresponde a la versión de Ryzen AI, `m_1.0.1_npu` indica el modelo de compilación y el destino NPU, y el sufijo `Qwen3.5_9B` identifica el modelo base de Alibaba.

El modelo resuelve un problema de despliegue concreto: ejecutar un LLM de 9B parámetros en hardware de consumo con aceleración NPU, sin depender de GPU dedicada. No se trata de un modelo entrenado desde cero por AMD, sino de una distribución de pesos cuantizados y compilados para el runtime de Ryzen AI, con el objetivo de habilitar inferencia local de texto generativo en portátiles y mini-PC con silicio AMD.

La relevancia es doble: por un lado, amplía el ecosistema de modelos ejecutables en NPU más allá de los formatos propietarios habituales; por otro, mantiene licencia Apache 2.0 sobre el artefacto publicado, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. El repositorio ocupa 18,8 GB, coherente con pesos en precisión mixta y múltiples artefactos de compilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5); artefacto ONNX compilado para NPU Ryzen AI |
| Parametros totales | 9B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX para `m_1.0.1_npu`; precisión exacta no especificada) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (compilado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El artefacto es una exportación ONNX del modelo Qwen3.5 de 9B parámetros, procesada mediante la cadena de herramientas Ryzen AI (`rai_1.9.0`) y compilada con el perfil `m_1.0.1_npu` para ejecutarse sobre la NPU de los procesadores AMD Ryzen AI. La arquitectura subyacente corresponde al transformer del modelo base Qwen3.5; AMD no documenta en esta ficha cambios en la topología, sino un pipeline de conversión, cuantización y compilación orientado a inferencia en NPU.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre fases de RLHF o DPO en la información proporcionada. Tampoco se detallan innovaciones técnicas del proceso de compilación (por ejemplo, esquemas de decodificación especulativa o atención lineal) más allá de la propia integración con el runtime de Ryzen AI. Cualquier afirmación sobre el entrenamiento del modelo base debe consultarse en la documentación oficial de Qwen, no en este repositorio.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `text-generation` y `conversational` del repositorio.
- Razonamiento y respuesta multi-turno heredados del modelo base Qwen3.5 de 9B.
- Ejecución en NPU Ryzen AI mediante ONNX Runtime y las herramientas de Ryzen AI 1.9.0.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la etiqueta `en`; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en portátiles Ryzen AI: el modelo puede ejecutarse íntegramente en la NPU, liberando CPU y GPU integrada para otras tareas, lo que resulta adecuado para asistentes de escritorio con requisitos de privacidad.
- Generación de texto en aplicaciones de productividad offline: procesamiento de documentos, resúmenes y redacción en entornos sin conectividad, aprovechando la inferencia local en NPU.
- Prototipado de aplicaciones de IA en hardware AMD: desarrolladores que necesiten validar pipelines ONNX sobre Ryzen AI antes de desplegar en producción pueden usar este artefacto como referencia de compilación.
- Chatbot de soporte en inglés embebido en aplicaciones de escritorio: la licencia Apache 2.0 permite integrarlo en productos comerciales, siempre que se respeten las condiciones de acceso del repositorio.
- Evaluación comparativa de rendimiento NPU frente a GPU: útil para medir latencia y throughput de un modelo de 9B en silicio AMD frente a alternativas CUDA.
- Educación e investigación en despliegue de LLM: sirve como caso de estudio de conversión ONNX y compilación para aceleradores dedicados, con un modelo de tamaño medio y licencia permisiva.
- Automatización de tareas de texto en estaciones de trabajo con Ryzen AI: clasificación, extracción y generación de contenido en inglés sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en sentido estricto, ya que el destino es la NPU Ryzen AI; el repositorio ocupa 18,8 GB, lo que sugiere artefactos de varios tamaños o precisión mixta. La memoria requerida en NPU depende del perfil `m_1.0.1_npu` y no está documentada.
- GPU recomendadas: no aplica; el artefacto está compilado para NPU Ryzen AI, no para CUDA.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX compilado para NPU no es directamente ejecutable en GPU sin reexportación.
- Opciones de despliegue: ONNX Runtime con el proveedor de ejecución de Ryzen AI (Vitis AI EP / Ryzen AI Software 1.9.0). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/Qwen3.5_9B_rai_1.9.0_m_1.0.1_npu | 9B | no disponible | ONNX para NPU Ryzen AI | Apache 2.0 | Gated en Hugging Face |
| Qwen3.5 9B (modelo base) | 9B | no disponible | safetensors / GGUF según distribución oficial | según Qwen | Público |
| Alternativas ONNX para NPU de otros fabricantes | no disponible | no disponible | ONNX | variable | variable |

No se dispone de datos de rendimiento comparativo en la información proporcionada. La comparación se limita a parámetros, formato y licencia; el modelo base Qwen3.5 de 9B es la referencia natural, pero sus especificaciones completas no están incluidas en esta ficha.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Idioma: solo se declara inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto no está documentada en la ficha; no debe asumirse la del modelo base sin verificarla.
- Formato específico: los pesos están compilados para NPU Ryzen AI con la versión 1.9.0 de las herramientas; otras versiones o hardware pueden requerir recompilación.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni tasas de alucinación para este artefacto; se heredan los del modelo base Qwen3.5, no verificados aquí.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones de acceso del repositorio gated pueden imponer restricciones adicionales que deben revisarse.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que sugiere poca validación comunitaria.
- Producción: la falta de benchmarks, de documentación de latencia y de compatibilidad con runtimes estándar (vLLM, llama.cpp) limita su uso directo en producción sin evaluación previa.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Qwen3.5_9B_rai_1.9.0_m_1.0.1_npu
- Documentación de Ryzen AI: no disponible en la información proporcionada
- Paper o blog del modelo base Qwen3.5: no disponible en la información proporcionada
- Repositorio de ONNX Runtime: no disponible en la información proporcionada
