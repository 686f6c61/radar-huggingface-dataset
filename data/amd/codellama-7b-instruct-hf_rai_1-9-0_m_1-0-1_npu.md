# amd/CodeLlama-7b-Instruct-hf_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/CodeLlama-7b-Instruct-hf_rai_1.9.0_m_1.0.1_npu` es una distribución optimizada para hardware AMD Ryzen AI del conocido CodeLlama-7b-Instruct de Meta. Lo publica AMD dentro de su programa de aceleración de IA en el PC (Ryzen AI), y su propósito es permitir la ejecución local de un modelo de generación de código de 7.000 millones de parámetros sobre las NPU integradas en los procesadores AMD de última generación, usando el runtime Ryzen AI (RAI) y pesos en formato ONNX.

El modelo base, CodeLlama-7b-Instruct, es un transformer decoder-only derivado de Llama 2, afinado para instrucciones y especializado en código, con una ventana de contexto de 16.000 tokens en su variante Instruct estándar. Esta versión de AMD no altera la arquitectura ni los pesos de forma sustancial: los adapta al formato ONNX y los empaqueta para el stack Ryzen AI 1.9.0 con el modelo compilado `m_1.0.1_npu`.

Su relevancia es práctica: demuestra que un modelo de código de 7B puede desplegarse en un portátil o mini-PC con NPU Ryzen AI sin depender de GPU dedicada ni de la nube, lo que resulta útil para asistentes de código locales, autocompletado en IDE y flujos de privacidad estricta. El acceso está restringido (gated) y requiere aceptar las condiciones de la licencia Llama 2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 2), adaptada a ONNX para NPU Ryzen AI |
| Parámetros totales | 7 000 millones (7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base CodeLlama-7b-Instruct soporta 16 384 tokens) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 (llama2) |
| Formato de pesos | ONNX (runtime Ryzen AI 1.9.0, modelo `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de CodeLlama-7b-Instruct: un transformer decoder-only con atención causal, basado en Llama 2, con 7.000 millones de parámetros y entrenado por Meta sobre un corpus masivo de código y texto natural, seguido de un ajuste por instrucciones (instruction tuning) y de un proceso de alineación con retroalimentación humana (RLHF) descrito en el paper de CodeLlama. La variante Instruct está optimizada para seguir instrucciones en lenguaje natural y generar código en múltiples lenguajes de programación.

La contribución de AMD en este repositorio no es de entrenamiento, sino de despliegue: los pesos se convierten a ONNX y se compilan para la NPU Ryzen AI con el runtime RAI 1.9.0 (modelo `m_1.0.1_npu`). No se dispone en la información proporcionada de detalles sobre el proceso de cuantización, el número exacto de tokens de entrenamiento ni innovaciones adicionales más allá de las del modelo base.

## Capacidades

- Generación de texto y código en múltiples lenguajes de programación (Python, C++, Java, JavaScript, etc.), heredadas de CodeLlama.
- Razonamiento sobre código: explicación, refactorización, depuración y generación de tests.
- Seguimiento de instrucciones conversacionales en inglés (variante Instruct).
- Relleno de código (code infilling) en el modelo base, aunque la variante Instruct está orientada a instrucciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta del repositorio.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de código local en IDE: el modelo puede autocompletar y explicar fragmentos de código ejecutándose en la NPU del portátil, sin enviar el código a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Generación de tests unitarios: dado un módulo o función, el modelo produce casos de prueba en el lenguaje correspondiente, integrándose en pipelines de CI/CD locales.
- Refactorización asistida: el desarrollador pega una función y pide una versión más limpia o idiomática; el modelo responde en inglés y devuelve código.
- Documentación automática: generación de docstrings y comentarios a partir del código fuente, útil en proyectos con documentación deficiente.
- Chat técnico de soporte interno: un asistente que responde dudas sobre APIs y fragmentos de código en inglés, desplegado en estaciones de trabajo con Ryzen AI.
- Enseñanza de programación: ejercicios guiados y explicaciones de errores comunes, con la ventaja de que el modelo corre en local y no expone datos de alumnos.
- Prototipado rápido en el borde: scripts y utilidades generadas al vuelo en equipos sin GPU dedicada, aprovechando la NPU para reducir consumo energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI (el repositorio está etiquetado como `ryzenai` y `npu`).
- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 4,0 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no aplica; el modelo está compilado para NPU Ryzen AI, no para CUDA.
- ¿Cabe en GPU de consumo? No está pensado para GPU; para ejecución en GPU habría que usar el modelo base CodeLlama-7b-Instruct en otro formato (GGUF, safetensors).
- Opciones de despliegue: runtime Ryzen AI (RAI) 1.9.0 con el modelo ONNX `m_1.0.1_npu`. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| amd/CodeLlama-7b-Instruct-hf_rai_1.9.0_m_1.0.1_npu | 7B | no disponible (base: 16 384) | Llama 2 | ONNX para NPU Ryzen AI |
| CodeLlama-7b-Instruct (Meta) | 7B | 16 384 | Llama 2 | safetensors, GGUF, etc. |
| CodeLlama-13b-Instruct (Meta) | 13B | 16 384 | Llama 2 | safetensors, GGUF, etc. |
| Qwen2.5-Coder-7B-Instruct | 7B | 32 768 | Apache 2.0 | safetensors, GGUF, etc. |

La comparativa se limita a datos estructurales; no se dispone de resultados de benchmarks de esta distribución de AMD frente a las alternativas.

## Limitaciones y advertencias

- Sesgos: hereda los sesgos del corpus de entrenamiento de CodeLlama y Llama 2; puede reproducir estereotipos presentes en el código y el texto de Internet.
- Alucinación: como todo modelo generativo, puede inventar APIs, funciones o librerías inexistentes; el código generado debe revisarse antes de usarse en producción.
- Idioma: solo inglés según la etiqueta del repositorio; el rendimiento en castellano no está garantizado.
- Contexto: no se especifica la longitud de contexto efectiva en esta distribución; conviene verificar el valor real antes de diseñar flujos con prompts largos.
- Licencia: Llama 2 impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y políticas de uso aceptable); es necesario revisar los términos antes de un despliegue comercial.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face.
- Dependencia de hardware: está compilado para NPU Ryzen AI; no es portable a otras plataformas sin reconversión.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/amd/CodeLlama-7b-Instruct-hf_rai_1.9.0_m_1.0.1_npu
- Paper de CodeLlama: https://arxiv.org/abs/2308.12950
- Repositorio oficial de CodeLlama (Meta): https://github.com/facebookresearch/codellama
- Modelo base en Hugging Face: https://huggingface.co/codellama/CodeLlama-7b-Instruct-hf
- Documentación de Ryzen AI: https://ryzenai.docs.amd.com/
