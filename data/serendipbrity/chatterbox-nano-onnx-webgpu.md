# serendipbrity/chatterbox-nano-onnx-webgpu

## Resumen

Chatterbox Nano ONNX WebGPU es una exportación a ONNX Runtime Web del modelo de síntesis de voz ResembleAI/chatterbox-nano, publicada por el usuario serendipbrity. Su propósito es ejecutar text-to-speech directamente en el navegador aprovechando WebGPU, sin depender de servidores ni de infraestructura de inferencia dedicada. El autor lo emplea en StudyWhile para generar audio de tarjetas de memoria (flashcards) en la GPU de un portátil.

El repositorio contiene los grafos ONNX del modelo T3 (modelo de tokens de habla) y del decodificador S3Gen MeanFlow, que incluye encoder, módulo de flow, estimador de F0 y vocoder, además de las tablas de embeddings en formato safetensors y el tokenizer GPT-2 heredado del modelo base. Los pesos se almacenan en fp16 con casts para que el cómputo se realice en fp32 sobre WebGPU.

Se trata de un artefacto de despliegue más que de un modelo entrenado desde cero: no incluye voces, acondicionamiento de hablante ni audio de referencia, que deben suministrarse en tiempo de ejecución. La licencia es MIT, igual que la del modelo base, y el tamaño total del repositorio es de 0,6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T3 (modelo de tokens de habla) + decodificador S3Gen MeanFlow con encoder, flow, F0 y vocoder; exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos en fp16 con casts; cómputo en fp32 sobre WebGPU |
| Idiomas soportados | no disponible |
| Licencia | MIT (Copyright (c) 2025 Resemble AI) |
| Formato de pesos | ONNX (`t3.onnx`, `encoder.onnx`, `cfm.onnx`, `f0.onnx`, `vocoder.onnx`) y safetensors (`tables.safetensors`) |

## Arquitectura y entrenamiento

El modelo base ResembleAI/chatterbox-nano es un sistema de síntesis de voz que combina un modelo de tokens de habla (T3) con un decodificador S3Gen MeanFlow. En esta exportación, el grafo `t3.onnx` unifica prefill y decode en un único grafo con número de filas variable, mientras que `encoder.onnx`, `cfm.onnx`, `f0.onnx` y `vocoder.onnx` cubren las etapas del decodificador con tamaños también variables. Las tablas de embeddings de texto y de tokens de habla, junto con la tabla de posiciones, se separan en `tables.safetensors`, y el tokenizer GPT-2 se incluye en el directorio `tokenizer/`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que la model card de esta exportación no los detalla. La innovación técnica destacable es la propia exportación: grafos ONNX con dimensiones dinámicas, pesos en fp16 con casts a fp32 y ejecución sobre WebGPU mediante ONNX Runtime Web, lo que permite inferencia en el navegador del cliente. El acondicionamiento de hablante se trata como una entrada en tiempo de ejecución, de modo que el artefacto no transporta ninguna voz concreta.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con pipeline declarado `text-to-speech`.
- Ejecución en navegador mediante ONNX Runtime Web y WebGPU, sin backend servidor.
- Grafos con dimensiones variables: el T3 admite distinto número de filas para prefill y decode, y el decodificador S3Gen admite tamaños variables.
- Acondicionamiento de hablante como entrada en tiempo de ejecución (la voz no está incluida en el repositorio).
- Tokenización de texto mediante el tokenizer GPT-2 incluido.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Audio para flashcards en aplicaciones educativas: el modelo puede generar la locución de tarjetas de memoria en el propio navegador del estudiante, como hace StudyWhile, evitando costes de servidor y latencia de red.
- Accesibilidad web: lectura en voz alta de contenido de una página o aplicación directamente en el cliente, útil para usuarios con discapacidad visual o dificultades de lectura.
- Aprendizaje de idiomas: reproducción de frases y vocabulario con una voz suministrada en tiempo de ejecución, sin enviar el texto del usuario a un servicio externo.
- Prototipado rápido de interfaces de voz: al ser un artefacto ONNX de 0,6 GB ejecutable con ONNX Runtime Web, permite validar experiencias TTS en demos y entornos de desarrollo sin montar infraestructura.
- Herramientas de productividad offline-first: generación de avisos, resúmenes o notas por voz en aplicaciones web que deben funcionar sin conexión una vez cargado el modelo.
- Privacidad por diseño: al ejecutarse en la GPU del cliente, el texto que se convierte en voz no abandona el dispositivo, lo que encaja en aplicaciones con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 0,6 GB, lo que acota el espacio de almacenamiento y la descarga inicial en el navegador.
- Inferencia sobre WebGPU: requiere un navegador con soporte de WebGPU y una GPU compatible; no se especifican modelos concretos.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible; el autor menciona únicamente el uso de la GPU de un portátil.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del artefacto, pero no se documentan modelos concretos.
- Opciones de despliegue: ONNX Runtime Web con WebGPU; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| serendipbrity/chatterbox-nano-onnx-webgpu | TTS, exportación ONNX | 0,6 GB (repo) | no disponible | MIT | ONNX Runtime Web / WebGPU |
| ResembleAI/chatterbox-nano | TTS (modelo base) | no disponible | no disponible | MIT | no disponible |
| Alternativas TTS en navegador | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de exportación, no un modelo nuevo: hereda las limitaciones del modelo base ResembleAI/chatterbox-nano, que no se detallan en esta model card.
- No incluye voces ni audio de referencia; el acondicionamiento de hablante debe aportarse en tiempo de ejecución, lo que exige disponer de dicho condicionamiento por otra vía.
- Dependencia de WebGPU: sin soporte de WebGPU en el navegador, el despliegue no es viable tal como está descrito.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- No se documentan sesgos, tasas de alucinación ni métricas de calidad de la síntesis.
- La licencia MIT permite uso comercial, pero debe conservarse el aviso de copyright de Resemble AI incluido en `LICENSE`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/serendipbrity/chatterbox-nano-onnx-webgpu
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-nano
- Revisión del modelo base referenciada: `71ccd1d0081b430592cea481f4307e764e07bc64`
- ONNX Runtime Web: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles
