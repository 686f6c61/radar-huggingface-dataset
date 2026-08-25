# ariacompute/qwen3.5-0.8b_q326_channel

## Resumen

Qwen3.5-0.8B es un modelo de lenguaje denso tipo Transformer decoder-only de 0,8 mil millones de parámetros, desarrollado por el equipo Qwen de Alibaba Cloud. Su principal innovación es una arquitectura híbrida con una proporción 3:1 de capas de atención lineal DeltaNet frente a capas de atención completa, lo que permite un procesado eficiente de contextos largos con un coste computacional reducido. El modelo ha sido pre-entrenado sobre corpus públicos diversos (RedPajama-Data-1T, The Pile, The Stack) y alineado mediante SFT y DPO.

Esta distribución concreta, publicada por Aria Compute, es un paquete cuantizado (aria-quant-bundle) que aplica una receta de cuantización mixta de aproximadamente 3,26 bits por canal, usando rotación de Hadamard y codebooks Lloyd-Max. El resultado es un modelo de unos 480 MB que puede ejecutarse íntegramente en CPU, sin GPU ni conexión a la nube, en móviles, dispositivos de borde y placas de bajo consumo como Raspberry Pi 5. Es relevante ahora porque cubre la demanda creciente de inferencia local privada y de bajo coste en dispositivos con recursos limitados, manteniendo capacidades de tool calling y generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, híbrido DeltaNet (atención lineal) + atención completa, ratio 3:1 |
| Parametros totales | ~0,8 mil millones (0.8B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (4K, según el desglose de memoria de la model card) |
| Tipos de cuantizacion | Cuantización mixta por canal: 4-bit para pesos de atención (Q/K/V/O), ~3-bit para pesos FFN, FP16 para RMSNorm y tabla de embeddings; rotación Hadamard + Lloyd-Max, sin calibración |
| Idiomas soportados | Inglés (principal), chino y más de 20 idiomas adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | aria-quant-bundle (formato propietario del runtime Aria Engine), no safetensors/GGUF estándar |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea un Transformer denso decoder-only con 20 capas, hidden size de 1.024, FFN intermedio de 3.584 y atención con 8 cabezas de consulta y 2 cabezas KV (GQA, grupo 4). La innovación principal es la mezcla 3:1 de capas DeltaNet (atención lineal de estado) con capas de atención completa, lo que permite mantener una calidad de generación alta con un coste de memoria de caché KV compacto. El pre-entrenamiento se realizó sobre corpus públicos como RedPajama-Data-1T, The Pile y The Stack, seguido de un pipeline de alineación SFT + DPO.

La cuantización de Aria Compute aplica una receta de precisión mixta por canal: los pesos de atención se cuantizan a 4 bits y los de FFN a aproximadamente 3 bits, ambos con codebooks por canal y pre-procesado con rotación de Hadamard. Las capas de normalización (RMSNorm) y la tabla de embeddings se mantienen en FP16. La cuantización es libre de calibración, es decir, no requiere datos de tarea específica. El paquete comprime el modelo BF16 original (~1,6 GB) a unos 480 MB, una compresión de ~3,2×.

## Capacidades

- Generación de texto: conversación, completado de texto y predicción de siguiente frase en tiempo real.
- Tool calling y function calling: soporte de llamadas estructuradas a funciones para integrarse con APIs móviles y de IoT.
- Embeddings: generación de embeddings de texto ligeros para recuperación y clasificación on-device.
- Resumen breve: resumen de notificaciones, mensajes y contenido local de corta extensión.
- Multilingüe: inglés y chino como idiomas principales, con más de 20 idiomas adicionales.
- Inferencia 100% local en CPU: sin conexión a servidores externos ni necesidad de GPU.
- No incluye capacidades multimodales ni de audio: es un modelo exclusivamente de texto.

## Casos de uso

- **Asistente conversacional en el dispositivo**: un asistente de chat que se ejecuta localmente en un smartphone de gama media (4-6 GB de RAM) con unos ~650 MB de memoria en runtime, sin enviar datos a la nube. Adecuado por su bajo consumo de memoria y su soporte multilingüe.
- **Autocompletado de texto en tiempo real**: predicción de la siguiente palabra o frase en aplicaciones de mensajería, correo o procesadores de texto móviles, gracias a su latencia baja en CPU y su tamaño compacto.
- **Tool calling para APIs de IoT**: un asistente integrado en un gateway IoT que invoca funciones locales (encender luces, ajustar termostato) mediante llamadas estructuradas. El modelo puede ejecutarse en un Raspberry Pi 5 con 4-8 GB de RAM.
- **Resumen de notificaciones**: resumir automáticamente notificaciones, mensajes o alertas de forma local en un reloj inteligente o dispositivo wearable, aunque el espacio de memoria es ajustado en dispositivos de 1 GB.
- **Embeddings para recuperación local**: generar representaciones de texto para un motor de búsqueda o clasificador de documentos que funcione íntegramente en el dispositivo, sin conexión.
- **Asistente de código de corta extensión**: generación de funciones pequeñas o fragmentos de código en un entorno de desarrollo móvil, aprovechando el entrenamiento sobre The Stack. La model card advierte que solo es fiable para funciones cortas.
- **Chat de soporte en el borde**: un asistente de atención al cliente que se ejecuta en una pasarela IoT o un SBC, con privacidad total de los datos del usuario porque no hay conexión externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales verificados en la información disponible. La model card indica que los resultados de calidad de generación están pendientes de una auditoría `gen_quant_eval`. La métrica declarada es una descripción de la metodología, no un resultado numérico:

| Tarea | Métrica | Valor | Verificado |
|---|---|---|---|
| Generación (consistencia vs FP16) | Descripción | Pendiente de auditoría; se espera calidad de cuantización mixta ~3,26 bits por canal con Hadamard + Lloyd-Max | No |

No hay datos numéricos de MMLU, HumanEval, GSM8K u otros benchmarks públicos para esta cuantización.

## Requisitos de hardware

- Memoria de runtime estimada: ~650 MB a contexto de 4K (480 MB de pesos cuantizados en mmap + ~40 MB de KV cache + ~30 MB de overhead del runtime).
- GPU: no se requiere. El paquete está diseñado para inferencia exclusivamente en CPU.
- Dispositivos objetivo:
  - Smartphones de gama alta (8 GB): recomendado.
  - Smartphones de gama media (4-6 GB): viable.
  - Smartphones de gama baja (2-3 GB): viable con margen.
  - Raspberry Pi 5 u otras SBC (4-8 GB): viable.
  - Gateways IoT (1-2 GB): viable.
  - Wearables (1 GB): ajustado, no recomendado.
- Despliegue: el runtime es Aria Engine (propietario de Aria Compute), no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información pública. La model card no ofrece cifras de tokens por segundo.
- No es adecuado para inferencia por lotes (batch) ni para entornos con GPU en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Cuantizacion | Licencia | Uso principal |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B (BF16 original) | 0,8B | 4K (según bundle) | Dense Transformer híbrido DeltaNet + full-attn | No cuantizado | Apache 2.0 | Referencia de calidad, requiere GPU o CPU potente |
| Qwen3.5-0.8B (q326_channel, este modelo) | 0,8B | 4K | Dense Transformer híbrido | Mixto ~3,26 bits por canal | Apache 2.0 | Inferencia CPU on-device, edge |
| Qwen3-0.6B | 0,6B | no disponible | Dense Transformer estándar (28 capas, 16 heads) | no disponible | Apache 2.0 | Modelo pequeño de referencia en la serie Qwen3 |
| Qwen3-1.7B | 1,7B | no disponible | Dense Transformer estándar | no disponible | Apache 2.0 | Modelo pequeño de referencia en la serie Qwen3 |

La comparativa con Qwen3-0.6B y Qwen3-1.7B se basa en los datos de la model card: Qwen3.5-0.8B tiene menos capas (20 vs 28) pero un FFN más ancho (3.072 vs 2.816) y un KV cache ~3,5× más pequeño que el de Qwen3-1.7B gracias a la GQA con solo 2 cabezas KV.

## Limitaciones y advertencias

- **Calidad de generación pendiente de auditoría**: no hay benchmarks formales publicados; la model card declara que la calidad está "esperando auditoría" y que los resultados comparativos frente a FP16 y otras recetas de cuantización están pendientes. No se debe asumir un rendimiento específico en tareas concretas sin validación.
- **Restricciones de uso declaradas**: no apto para escritura creativa de larga duración (>2K tokens por generación), demostración de teoremas matemáticos ni razonamiento multi-step complejo.
- **Síntesis de código limitada**: solo fiable para funciones cortas, no para programas completos.
- **Sin multimodalidad**: es un modelo exclusivamente de texto, sin soporte de visión, audio ni voz.
- **Sin soporte batch ni GPU**: el paquete está diseñado para inferencia de un solo prompt en CPU; no es adecuado para despliegue en producción con inferencia por lotes o aceleración GPU.
- **Sesgos y alucinación**: al tratarse de un modelo pequeño cuantizado, el riesgo de alucinación puede ser mayor que en modelos de mayor tamaño. No se dispone de datos específicos de sesgos del modelo cuantizado.
- **Formato de pesos propietario**: el paquete usa el runtime Aria Engine, no es compatible con ecosistemas estándar (safetensors, GGUF, ONNX). Esto limita la portabilidad a otras herramientas de inferencia.
- **Licencia**: Apache 2.0 permite uso comercial, pero el runtime Aria Engine y el acceso al bundle pueden requerir registro en el dashboard de Aria Compute.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/ariacompute/qwen3.5-0.8b_q326_channel
- Repositorio de archivos en HuggingFace: https://huggingface.co/ariacompute/qwen3.5-0.8b_q326_channel/tree/main
- Modelo base (Qwen/Qwen3.5-0.8B): https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio original de Qwen3.5 (GitHub): https://github.com/QwenLM/Qwen3.5
- Dashboard de modelos de Aria Compute: https://ariacompute.com/dashboard/models
- Sitio web de Aria Engine: https://ariacompute.com
- Repositorio de Aria Compute en GitHub (modelo Qwen3.5-0.8B): https://github.com/ariacompute/model/tree/main/qwen/qwen3.5-0.8b
- README de Qwen3.5-0.8B en Qualcomm AI Hub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_0_8b/README.md
- Página de Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
