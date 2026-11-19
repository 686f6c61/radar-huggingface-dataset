# Alexps9yyy/rag-exp-smollm2-135m

## Resumen

rag-exp-smollm2-135m es un derivado cuantizado en formato ONNX del modelo SmolLM2-135M-Instruct de HuggingFaceTB, publicado por el usuario Alexps9yyy. Se trata de una exportación mínima que conserva únicamente el grafo de cuantización q4 del repositorio `onnx-community/SmolLM2-135M-Instruct-ONNX-MHA`, pensada para ejecutarse en el navegador mediante Transformers.js dentro de una demostración de GitHub Pages denominada "rag-exp".

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-135M-Instruct, con 135 millones de parámetros y entrenado originalmente para instrucciones conversacionales. Al estar cuantizado a 4 bits y exportado a ONNX, su propósito no es servir como modelo de propósito general en producción, sino como artefacto ligero para experimentos de generación de texto y recuperación aumentada (RAG) en entornos web sin backend.

Su relevancia es limitada y muy específica: sirve como ejemplo de despliegue de un LLM pequeño en el navegador con Transformers.js, pero no aporta mejoras técnicas sobre el modelo base ni sobre la exportación ONNX original de la comunidad. No hay información publicada sobre datos de entrenamiento adicionales, benchmarks ni idiomas soportados más allá de lo que hereda del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct) |
| Parámetros totales | 135 millones (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | q4 (ONNX) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo q4) |

## Arquitectura y entrenamiento

La arquitectura corresponde a SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros desarrollado por HuggingFaceTB. Este repositorio no incluye información sobre el proceso de entrenamiento original, los datos utilizados ni si hubo fases de RLHF o DPO; toda la información disponible remite al modelo base. El autor de este derivado no documenta ningún entrenamiento adicional: se limita a conservar el grafo q4 de la exportación ONNX de la comunidad (`onnx-community/SmolLM2-135M-Instruct-ONNX-MHA`).

La innovación técnica de este artefacto es exclusivamente de despliegue: la cuantización a 4 bits en ONNX permite ejecutar el modelo en el navegador con Transformers.js, reduciendo el tamaño del repositorio a 0,2 GB. No se documentan técnicas como decodificación especulativa, atención lineal ni variantes híbridas.

## Capacidades

- Generación de texto conversacional, heredada de SmolLM2-135M-Instruct.
- Ejecución en navegador mediante Transformers.js y ONNX Runtime Web.
- Integración en pipelines de RAG ligeros para demostraciones web (el nombre del repositorio, "rag-exp", sugiere este uso).
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Demostración de RAG en navegador: el modelo puede cargarse con Transformers.js en una página estática y generar respuestas a partir de contextos recuperados, sin necesidad de servidor, gracias a su tamaño reducido y al grafo q4.
- Prototipado rápido de interfaces conversacionales: permite validar flujos de chat en el cliente antes de migrar a un modelo mayor en backend.
- Educación y experimentación: sirve para mostrar cómo se exporta y cuantiza un modelo a ONNX y cómo se ejecuta en el navegador con Transformers.js.
- Pruebas de latencia en entornos web: útil para medir el rendimiento de inferencia ONNX en distintos navegadores y dispositivos.
- Generación de texto offline en aplicaciones web progresivas: al no requerir backend, puede integrarse en PWA con funcionamiento sin conexión tras la primera carga.
- Evaluación comparativa de cuantizaciones: permite contrastar la calidad del grafo q4 frente a otras variantes del mismo modelo base en tareas cortas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario principal (inferencia en navegador vía WebGPU/WASM); en GPU, el grafo q4 de 135M ocupa del orden de decenas de MB, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con soporte WebGPU para la ejecución en navegador; en servidor, cualquier GPU con suficiente memoria para un modelo de 135M cuantizado a 4 bits.
- Compatibilidad con GPU consumer: sí, por el tamaño reducido del modelo.
- Opciones de despliegue: Transformers.js (principal, según la model card), ONNX Runtime; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rag-exp-smollm2-135m | 135M | No disponible | ONNX q4 | Apache-2.0 | Hugging Face (0 descargas) |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | No disponible | Safetensors | Apache-2.0 | Hugging Face (modelo base oficial) |
| onnx-community/SmolLM2-135M-Instruct-ONNX-MHA | 135M | No disponible | ONNX (varias cuantizaciones) | Apache-2.0 | Hugging Face (exportación comunitaria) |
| SmolLM2-360M-Instruct | 360M | No disponible | Safetensors | Apache-2.0 | Hugging Face (modelo mayor de la familia) |

## Limitaciones y advertencias

- Modelo de 135M parámetros: capacidad de razonamiento, coherencia y conocimiento factual muy limitadas en comparación con modelos de mayor tamaño.
- Riesgo elevado de alucinación, especialmente en tareas de RAG donde debe ceñirse a contextos recuperados.
- No hay información publicada sobre sesgos; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento originales, no documentados aquí.
- Idiomas soportados no documentados; el rendimiento fuera del inglés puede ser deficiente.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; no se recomienda para producción sin evaluación previa.
- Solo se conserva el grafo q4: no hay variantes de mayor precisión en este repositorio, lo que limita la comparación de calidad.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la ausencia de documentación sobre el modelo base y su entrenamiento exige revisar la licencia y model card de SmolLM2-135M-Instruct antes de usarlo comercialmente.
- El propósito declarado es una demostración ("rag-exp browser demo"), no un modelo listo para producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Alexps9yyy/rag-exp-smollm2-135m
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Exportación ONNX de referencia: https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX-MHA
- Transformers.js: https://github.com/huggingface/transformers.js
