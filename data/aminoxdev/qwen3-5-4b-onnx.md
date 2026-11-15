# AMINOXDEV/Qwen3.5-4B-ONNX

## Resumen

Qwen3.5-4B-ONNX es una conversión al formato ONNX del modelo multimodal Qwen3.5-4B de Alibaba Cloud (serie Qwen), publicada por el usuario AMINOXDEV. El repositorio contiene los pesos cuantizados en q4f16 (decodificador) junto con un codificador visual en fp16, empaquetados específicamente para su ejecución en el navegador mediante transformers.js y WebGPU. Está pensado para alimentar interfaces de chat web (WebGPU Chat, en llm.aminox.dev) sin necesidad de servidor de inferencia.

El modelo original Qwen3.5-4B es un transformer multimodal de tipo image-text-to-text con aproximadamente 4.000 millones de parámetros, capaz de procesar texto e imágenes en una única ventana de contexto. Esta versión ONNX conserva la arquitectura y los pesos del modelo base, pero modifica únicamente el grafo del decodificador para fijar `accuracy_level=4` en los nodos `MatMulNBits`, lo que permite a ONNX Runtime WebGPU emplear kernels int8 DP4A durante el procesamiento del prompt.

Su relevancia actual radica en que demuestra el despliegue de un modelo multimodal de 4B en el cliente (navegador), sin GPU dedicada en servidor, con licencia Apache 2.0. Es un artefacto de infraestructura más que un modelo nuevo: no aporta pesos entrenados propios, sino una ruta de ejecución optimizada para WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), modelo base Qwen3.5-4B |
| Parametros totales | aproximadamente 4.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (decodificador), fp16 (codificador visual) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data`), q4f16 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es una conversión ONNX del Qwen3.5-4B original de Alibaba Cloud, realizada por onnx-community en la revisión `bb072268d0912bdc5cf4f41c8c6f53a03fd68624`. La arquitectura subyacente es un transformer multimodal que combina un codificador visual (en fp16) con un decodificador de lenguaje cuantizado a q4f16 (pesos de 4 bits con activaciones en fp16). El pipeline declarado es image-text-to-text, por lo que acepta entradas conjuntas de imagen y texto.

La única modificación respecto a la conversión original afecta al grafo `onnx/decoder_model_merged_q4f16.onnx`: se establece `accuracy_level=4` en los nodos `MatMulNBits` para que ONNX Runtime WebGPU pueda seleccionar kernels int8 DP4A en la fase de prompt. Los ficheros `.onnx_data` (los pesos) no se alteran. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre procesos de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Comprensión conjunta de imagen y texto (pipeline image-text-to-text).
- Ejecución en navegador mediante transformers.js y WebGPU, sin backend propio.
- Aceleración de la fase de prompt con kernels int8 DP4A en ONNX Runtime WebGPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Chat multimodal en el navegador: el modelo se carga con transformers.js y WebGPU para ofrecer conversaciones con imágenes sin enviar datos a un servidor, adecuado para demos y prototipos de privacidad por diseño.
- Asistentes de documentación técnica: permite adjuntar capturas de pantalla o diagramas y formular preguntas sobre ellos directamente en una página web estática.
- Herramientas internas de soporte: integración en intranets o paneles web donde no se quiere desplegar infraestructura GPU, aprovechando la cuantización q4f16 para reducir el tamaño de descarga (repo de 3,1 GB).
- Educación y prototipado rápido: permite a desarrolladores probar un modelo multimodal de 4B en un portátil con GPU integrada compatible con WebGPU antes de invertir en servidores.
- Aplicaciones offline-first: una vez descargados los pesos, el modelo puede ejecutarse sin conexión en el cliente, útil en entornos con conectividad limitada.
- Evaluación comparativa de kernels: sirve como banco de pruebas para medir el impacto de `accuracy_level=4` y DP4A en la latencia de prompt en WebGPU frente a la conversión original de onnx-community.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 3,1 GB, por lo que se requiere al menos esa cantidad de memoria de GPU disponible para cargar los pesos en WebGPU.
- GPU recomendadas: cualquier GPU con soporte de WebGPU (Chrome/Edge recientes); no se especifican modelos concretos como A100, H100 o RTX 4090 en la documentación.
- Compatibilidad con GPU de consumo: sí, el objetivo declarado es la ejecución en navegador sobre WebGPU, lo que incluye GPU integradas y dedicadas de consumo compatibles.
- Opciones de despliegue: transformers.js con ONNX Runtime WebGPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AMINOXDEV/Qwen3.5-4B-ONNX | ~4B | no disponible | ONNX q4f16 | Apache 2.0 | Grafo modificado con `accuracy_level=4` para DP4A |
| onnx-community/Qwen3.5-4B-ONNX-OPT | ~4B | no disponible | ONNX | Apache 2.0 | Conversión original sin la modificación del grafo |
| Qwen/Qwen3.5-4B | ~4B | no disponible | safetensors | Apache 2.0 | Modelo base multimodal original |

## Limitaciones y advertencias

- Es una conversión de infraestructura, no un modelo entrenado: hereda todos los sesgos y limitaciones del Qwen3.5-4B original, que no se detallan en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4B; no se documentan evaluaciones de fidelidad.
- La cuantización q4f16 del decodificador puede degradar la precisión respecto a los pesos originales en fp16/bf16.
- La modificación `accuracy_level=4` afecta solo al grafo del decodificador; no se han publicado mediciones de su impacto en calidad o latencia.
- Dependencia de WebGPU: sin soporte de navegador o GPU compatible, el modelo no puede ejecutarse en su formato previsto.
- Idiomas soportados no documentados; conviene validar el comportamiento multilingüe antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia de Qwen (Alibaba Cloud) incluido en el repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/AMINOXDEV/Qwen3.5-4B-ONNX
- Conversión original: https://huggingface.co/onnx-community/Qwen3.5-4B-ONNX-OPT/tree/bb072268d0912bdc5cf4f41c8c6f53a03fd68624
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo WebGPU Chat: https://llm.aminox.dev
