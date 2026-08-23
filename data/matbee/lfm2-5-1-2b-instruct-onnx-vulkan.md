# matbee/LFM2.5-1.2B-Instruct-ONNX-Vulkan

## Resumen

Este repositorio contiene una adaptación específica de los decoders ONNX del modelo instruct LFM2.5-1.2B de Liquid AI, preparada para ejecutarse en el intérprete Vulkan `onnx-vulkan-rs`. El modelo original, LFM2.5-1.2B-Instruct, es un modelo de lenguaje de 1.200 millones de parámetros con arquitectura híbrida (multiplicative gates y convoluciones cortas) diseñado para inferencia eficiente en dispositivos edge. El autor de este repositorio, matbee, ha modificado el export ONNX oficial para superar tres limitaciones: el contrato de entrada (sustituye `input_ids` por `inputs_embeds`), el orden de nodos no topológico y las rutas de datos externos. El resultado es un bundle que incluye un decoder cuantizado q4 (asymmetric MatMulNBits) y un decoder de respaldo en precisión f32, ambos con el mismo contrato de 24 entradas que el decoder de audio q4 del mismo bundle.

La relevancia de esta publicación radica en que permite ejecutar el modelo instruct de LFM2.5 en entornos Vulkan (por ejemplo, GPUs de consumo y dispositivos móviles) sin depender de las implementaciones estándar de ONNX Runtime. La validación del autor confirma que, con la misma entrada de 88 tokens, el decoder q4 produce 21 tokens idénticos al checkpoint bf16 de referencia, incluyendo los tokens de inicio y fin de tool call. Aunque el repositorio forma parte de un sistema de roles duales (audio e instruct), este repo solo contiene los artefactos modificados del rol instruct; los componentes de audio se referencian desde el release oficial de Liquid.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (multiplicative gates, short convolutions, Grouped Query Attention) |
| Parametros totales | 1.2B (aproximadamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4 asimétrico (MatMulNBits, block_size=32) y f32 (fallback) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (herederada del release original de Liquid) |
| Formato de pesos | ONNX con datos externos (decoder_q4.onnx_data, decoder.onnx_data) |

## Arquitectura y entrenamiento

El modelo original LFM2.5-1.2B-Instruct de Liquid AI emplea una arquitectura híbrida que combina bloques de convolución LIV con doble puerta multiplicativa y atención por grupos (GQA). Esta mezcla busca un equilibrio entre capacidad de modelado y eficiencia computacional, especialmente para inferencia en hardware de bajos recursos. En este repositorio, el autor no ha retrenado ni requantizado pesos; se ha limitado a realizar cirugía de grafo sobre el export ONNX oficial. Los cambios incluyen la sustitución del nodo de embedding cuantizado por una entrada `inputs_embeds` (f32) alimentada desde un fichero `embed_tokens.bin` (tabla de embeddings de 65536×2048), la reordenación topológica de los nodos (110 violaciones originales corregidas a 0) y la redirección de los datos externos. El decoder q4 mantiene el `lm_head` atado a los embeddings con cuantización q4, mientras que el decoder f32 es una conversión exacta de f16 a f32 de todos los pesos inicializadores.

No se dispone de información detallada sobre el entrenamiento (composición del dataset, número de tokens, pipeline de RLHF/DPO) en la documentación proporcionada. Se sabe que es la versión instruct del modelo base LFM2.5-1.2B, entrenada con refuerzo para instrucciones y tool calling, pero no se especifican hiperparámetros ni datos concretos.

## Capacidades

- Generación de texto instructivo y seguimiento de instrucciones.
- Soporte para tool calling (evidenciado por los tokens `tool_call_start` y `tool_call_end` en la validación).
- Ejecución en dispositivos Vulkan (GPU de consumo, integrados, móviles) gracias al intérprete `onnx-vulkan-rs`.
- Integración en sistemas con roles duales (audio + instruct) mediante el manifest `dual_role_manifest.json`, aunque este repositorio solo contiene el rol instruct.
- Posibilidad de ejecución en CPU con ONNX Runtime (que soporta la forma asimétrica de MatMulNBits nativamente).

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno y realizar llamadas a herramientas (por ejemplo, consultar el tiempo) gracias a su soporte de tool calling. Su tamaño compacto permite desplegarlo en servidores con GPU modesta o incluso en dispositivos cliente.
- **Asistentes de productividad**: integración en aplicaciones de escritorio o móviles para redacción de correos, resumen de documentos y generación de contenido, con la ventaja de ejecución local sin conexión.
- **Pipelines de agentes**: al admitir tool calling y mantener el contrato de `inputs_embeds`, se puede integrar en frameworks de agentes que orquestan múltiples llamadas a funciones, como búsqueda en web o consultas a bases de datos.
- **Prototipado rápido en Vulkan**: desarrolladores que trabajan con `onnx-vulkan-rs` pueden usar este bundle como referencia para implementar cuantización asimétrica en sus propios modelos o para evaluar la viabilidad de Vulkan en inferencia de LLM.
- **Despliegue en edge**: el decoder q4 pesa unos 850 MB (pesos), lo que lo hace viable para dispositivos con 1-2 GB de VRAM, como algunas GPU integradas o NPUs con soporte Vulkan.
- **Investigación en cuantización**: el fichero `instruct_q4_provenance.json` documenta el proceso de cirugía de cuantización, sirviendo como caso de estudio para técnicas de adaptación de modelos ONNX a runtimes especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. La única validación documentada es la reproducción bit-idéntica de 21 tokens (incluyendo tokens de tool call) en CPU con ONNX Runtime, comparada con el checkpoint bf16 de referencia. No se proporcionan métricas de rendimiento como MMLU, HumanEval, GSM8K ni medidas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Decoder q4: aproximadamente 1 GB (pesos de 850 MB + overhead de activaciones y KV cache).
  - Decoder f32: aproximadamente 4,8 GB (pesos de 4,7 GB + overhead).
- **GPU recomendadas**: cualquier GPU con soporte Vulkan 1.0 o superior. Ejemplos: NVIDIA RTX 3060, RTX 4090, AMD Radeon RX 6000/7000, Intel Arc, así como GPUs integradas modernas (Apple M1/M2, Intel Iris Xe).
- **Compatibilidad con GPU de consumo**: sí, el modelo q4 cabe en tarjetas con 2 GB de VRAM o más; el f32 requiere al menos 6 GB.
- **Opciones de despliegue**: `onnx-vulkan-rs` (intérprete Vulkan), ONNX Runtime (CPU y GPU), y potencialmente cualquier runtime que soporte el formato ONNX con MatMulNBits asimétrico.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones exactas de modelos comparables (por ejemplo, Qwen2.5-1.5B, Phi-3-mini, Gemma-2-2B) en la información proporcionada. La comparativa se limita a la arquitectura y al propósito: mientras que la mayoría de los modelos de tamaño similar utilizan transformadores densos puros, LFM2.5 emplea una arquitectura híbrida con convoluciones y multiplicaciones, lo que puede ofrecer ventajas en eficiencia en hardware Vulkan, pero no hay métricas públicas que respalden esta afirmación.

## Limitaciones y advertencias

- **Licencia**: la licencia LFM Open Source v1.0 tiene restricciones de uso comercial que deben revisarse antes de desplegar el modelo en producción.
- **Cuántización asimétrica**: el decoder q4 usa una variante asimétrica de MatMulNBits (con zero point empaquetado) que no es compatible con todos los runtimes ONNX; solo se garantiza el funcionamiento con `onnx-vulkan-rs` y ONNX Runtime CPU.
- **Riesgo de alucinación**: como cualquier modelo instruct de 1.2B, puede generar información plausible pero incorrecta, especialmente en tareas de razonamiento complejo.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; el modelo original de Liquid está entrenado principalmente en inglés, por lo que el rendimiento en otros idiomas puede ser limitado.
- **Dependencia de artefactos externos**: el bundle de audio no se incluye en este repositorio; para usar el rol dual completo es necesario descargar los archivos de audio del release oficial de Liquid.
- **Fecha de creación**: el repositorio tiene fecha de creación de 2026, lo que indica que es una versión reciente; puede haber cambios posteriores en el modelo original.

## Enlaces

- [Hugging Face - matbee/LFM2.5-1.2B-Instruct-ONNX-Vulkan](https://huggingface.co/matbee/LFM2.5-1.2B-Instruct-ONNX-Vulkan)
- [LiquidAI/LFM2.5-1.2B-Instruct (modelo base)](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct)
- [LiquidAI/LFM2.5-1.2B-Instruct-ONNX (export oficial)](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX)
- [Documentación de Liquid AI para LFM2.5-1.2B-Instruct](https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct)
- [LLM Explorer: LFM2.5 1.2B Instruct ONNX](https://llm-explorer.com/model/LiquidAI%2FLFM2.5-1.2B-Instruct-ONNX,5KU5zpkwHssMppSxNp11HG)
- [Crafiq: LiquidAI LFM2.5-1.2B-Instruct](https://crafiq.ai/models/language/liquidai-lfm2-5-1-2b-instruct)
