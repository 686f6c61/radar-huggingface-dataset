# rasgaard/Embla1-4bit-webgpu

## Resumen

Embla1-4bit-webgpu es una exportación ONNX del modelo Embla 1 en cuantización de 4 bits, empaquetada específicamente para ejecutarse en navegador mediante WebGPU a través de onnxruntime-web. El modelo original lo desarrolla sevren.ai y esta variante la publica el usuario rasgaard como un grafo de paso ("step graph") que ejecuta el prefill y la decodificación token a token de Embla 1. El repositorio no contiene los pesos completos: incluye únicamente los pesos no-expertos en formato 4-bit de MLX (0,48 GB), mientras que los expertos enrutados (3,9 GB) se transmiten en streaming desde el repositorio base.

El interés de esta ficha radica en que demuestra un patrón de despliegue poco habitual: inferencia de un modelo con arquitectura MoE dentro de un navegador, con los expertos servidos desde Hugging Face y el grafo ONNX optimizado para el execution provider WebGPU de onnxruntime-web. Es relevante para desarrolladores que quieran explorar inferencia local en cliente sin backend, aunque el modelo base y sus especificaciones completas no están documentados en la información disponible.

La información pública disponible es muy limitada: no se detallan parámetros totales, longitud de contexto, idiomas ni resultados de benchmarks. Esta ficha refleja exclusivamente lo que consta en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según referencias a "expertos enrutados" y "engram-conv cache"; detalles completos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el grafo procesa chunks de prefill de hasta 64 tokens por paso) |
| Tipos de cuantizacion | 4 bits (formato MLX, `MatMulNBits` con término de offset para el sesgo afín); pesos no-expertos en 4-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`embla_step.onnx` + `embla_step.onnx.data`, 0,48 GB); expertos enrutados en `model.safetensors` del repo base; tabla engram en `engram_table.safetensors` |

## Arquitectura y entrenamiento

La model card describe el artefacto como un grafo ONNX que ejecuta un único paso del modelo Embla 1: bien un chunk de prefill de hasta 64 tokens, bien un token de decodificación. El grafo expone explícitamente como entradas y salidas las cachés KV y de "engram-conv", lo que permite mantener el estado entre pasos desde el motor de inferencia en el navegador. Los pesos no-expertos se exportaron desde la referencia en PyTorch y se reescribieron para el execution provider WebGPU de onnxruntime-web, en cuatro pasadas de reescritura documentadas en el repositorio de GitHub del autor.

La arquitectura subyacente es de mezcla de expertos: los expertos enrutados (3,9 GB) no forman parte de este repositorio y el motor los transmite en streaming desde `sevren-ai/Embla1-4bit/model.safetensors`. Las filas de la tabla engram también son una entrada del grafo y se consultan en `engram_table.safetensors` del repositorio base. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva mediante decodificación token a token sobre el grafo ONNX.
- Prefill por chunks de hasta 64 tokens, con caché KV y de engram-conv persistida entre pasos.
- Ejecución en navegador con WebGPU a través de onnxruntime-web.
- Streaming de pesos de expertos desde Hugging Face, lo que permite no descargar el modelo completo en el cliente.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Demostraciones de inferencia en navegador sin backend: el grafo ONNX y el execution provider WebGPU permiten ejecutar generación de texto directamente en el cliente, útil para prototipos y demos interactivas.
- Aplicaciones con requisitos de privacidad: al ejecutar el modelo en el navegador del usuario, los tokens de entrada no se envían a un servidor, lo que encaja en escenarios donde el texto no debe salir del dispositivo.
- Investigación sobre despliegue MoE en cliente: el patrón de separar pesos no-expertos (locales) y expertos enrutados (streaming remoto) sirve para estudiar estrategias de partición de modelos grandes en entornos con memoria limitada.
- Pruebas de onnxruntime-web y WebGPU: el repositorio es un banco de pruebas para validar reescrituras de grafo, `MatMulNBits` en 4 bits y gestión de cachés explícitas en el navegador.
- Herramientas de edición de texto asistida en aplicaciones web: con el modelo cargado en el cliente, se pueden ofrecer sugerencias y completados sin latencia de red de ida y vuelta al servidor de inferencia.
- Evaluación comparativa de cuantización 4-bit en navegador: útil para medir el impacto de la cuantización MLX exportada a ONNX frente a otras rutas de despliegue en términos de calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no disponible. El repositorio ocupa 0,5 GB (pesos no-expertos en 4-bit), pero los expertos enrutados (3,9 GB) se transmiten en streaming y deben residir en memoria del cliente durante la inferencia.
- GPU recomendadas: no disponible. El requisito funcional es un navegador con soporte de WebGPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende del soporte de WebGPU del navegador y del hardware.
- Despliegue: onnxruntime-web con el execution provider WebGPU; el grafo se genera con `sh tools/build_graph.sh` desde el repositorio de GitHub del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene el modelo completo: sin acceso a `sevren-ai/Embla1-4bit` (expertos y tabla engram), el grafo no puede ejecutarse.
- Dependencia de WebGPU: la inferencia requiere un navegador y un hardware compatibles; no hay soporte documentado para otros execution providers.
- Especificaciones del modelo base (parámetros, contexto, idiomas, entrenamiento) no documentadas en la información disponible.
- No hay benchmarks publicados, por lo que no es posible evaluar la calidad de la cuantización 4-bit frente al modelo original.
- El streaming de expertos (3,9 GB) introduce dependencia de red y latencia variable en producción.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero el autor original de los pesos es sevren.ai y esta variante es un formato derivado bajo la misma licencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rasgaard/Embla1-4bit-webgpu
- Modelo base: https://huggingface.co/sevren-ai/Embla1-4bit
- Organización del autor original: https://huggingface.co/sevren-ai
