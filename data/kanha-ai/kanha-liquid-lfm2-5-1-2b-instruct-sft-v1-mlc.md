# Kanha-AI/kanha-liquid-lfm2.5-1.2b-instruct-sft-v1-MLC

## Resumen

Este repositorio contiene artefactos MLC (Machine Learning Compilation) listos para ejecución en navegador mediante WebGPU del modelo `kanha-liquid-lfm2.5-1.2b-instruct-sft-v1`, un fine-tuning SFT del modelo base `LiquidAI/LFM2.5-1.2B-Instruct` realizado por Kanha-AI. El modelo está diseñado para ejecutarse íntegramente en el cliente, sin necesidad de servidor, gracias a la compilación a WebGPU y a la cuantización `q4f16_1`.

La relevancia de este modelo radica en su capacidad de ofrecer inferencia de lenguaje natural en el navegador con un tamaño compacto (1.2B parámetros) y una ventana de contexto de 4.096 tokens. Su arquitectura híbrida, que combina atención con caché KV y estado convolucional recurrente, permite un uso eficiente de memoria y cómputo, lo que lo hace adecuado para aplicaciones web interactivas y demos en tiempo real. El repositorio incluye la biblioteca WebGPU compilada (`.wasm`), el tokenizador y la configuración de chat, verificados mediante una prueba de humo en macOS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención con caché KV y estado convolucional recurrente) |
| Parametros totales | 1.2B (según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | q4f16_1 (única disponible) |
| Idiomas soportados | No disponible |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | MLC para WebGPU (biblioteca `.wasm` y caché de parámetros) |

Nota: El tamaño del modelo data es de 663.326.625 bytes distribuidos en 21 shards de parámetros. El prefill chunk es de 512 tokens y el estado de inferencia combina caché KV híbrida con estado convolucional recurrente.

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo `LiquidAI/LFM2.5-1.2B-Instruct`, que emplea un diseño híbrido que combina mecanismos de atención con una capa convolucional recurrente. Esta combinación permite manejar secuencias largas con un coste computacional reducido en comparación con transformadores puramente atencionales. El repositorio actual contiene el resultado de un fine-tuning SFT (Supervised Fine-Tuning) aplicado mediante el adapter `Kanha-AI/kanha-liquid-lfm2.5-1.2b-instruct-sft-v1-adapter`, cuyos pesos fusionados se verifican con un hash SHA-256.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). La model card indica que el artefacto fue convertido y compilado para WebGPU mediante MLC, con una prueba de humo en macOS que confirmó la ejecución en navegador con un contexto de 4.096 tokens y respuestas fundamentadas con citas.

## Capacidades

- Generación de texto en lenguaje natural, orientada a tareas de instrucción y conversación (fine-tuning SFT).
- Ejecución completamente en el navegador a través de WebGPU, sin necesidad de servidor backend.
- Ventana de contexto de 4.096 tokens, suficiente para diálogos multi-turno y documentos cortos.
- Soporte de prefill en bloques de 512 tokens, lo que permite procesamiento incremental de entradas largas.
- Compatibilidad con el runtime `@mlc-ai/web-llm` (probado con la versión 0.2.84), que facilita la integración en aplicaciones web.
- No se especifican capacidades adicionales como tool calling, agentes o visión.

## Casos de uso

- **Chatbots en el navegador**: el modelo puede integrarse en aplicaciones web como asistente conversacional sin latencia de red ni coste de servidor. Su tamaño compacto y ejecución local permiten respuestas instantáneas en dispositivos con GPU compatible.
- **Aplicaciones de ayuda a la redacción**: al ejecutarse en el cliente, puede ofrecer sugerencias de texto, reescritura o corrección en editores web sin enviar datos a un servidor externo, garantizando privacidad.
- **Demos educativas y prototipos**: por su facilidad de despliegue (solo requiere un navegador con WebGPU), es ideal para demostraciones interactivas de IA generativa en talleres o presentaciones técnicas.
- **Procesamiento de documentos en local**: con 4.096 tokens de contexto, puede resumir o extraer información de documentos de hasta unas pocas páginas directamente en el navegador, útil para herramientas de productividad.
- **Asistentes de soporte técnico**: integrable en páginas de ayuda o portales de atención al cliente, ofreciendo respuestas basadas en instrucciones sin necesidad de infraestructura de inferencia dedicada.
- **Herramientas de accesibilidad**: puede servir como interfaz de lenguaje natural para usuarios con discapacidad visual o motora, ejecutándose en dispositivos con GPU integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona una prueba de humo en macOS WebGPU que confirmó la ejecución correcta, pero no proporciona métricas de calidad (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no especificada oficialmente. Dado el tamaño de 1.2B parámetros en cuantización q4f16_1, se estima que la memoria necesaria es inferior a 1 GB, pero este dato no está confirmado.
- **GPU recomendada**: cualquier GPU compatible con WebGPU (por ejemplo, integradas Intel, AMD o NVIDIA modernas). No se requiere GPU de servidor.
- **Compatibilidad con consumer GPU**: sí, al ejecutarse en el navegador, cualquier dispositivo con soporte WebGPU (Chrome, Edge, Firefox) puede utilizarlo.
- **Opciones de despliegue**: exclusivamente vía WebGPU en navegador, usando el runtime `@mlc-ai/web-llm`. No se proporcionan artefactos para vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no se han publicado mediciones. La prueba de humo confirmó la ejecución, pero sin datos de rendimiento cuantitativos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Sin embargo, se puede comparar a nivel de especificaciones con el modelo base y otras alternativas de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| kanha-liquid-lfm2.5-1.2b-instruct-sft-v1-MLC (este) | 1.2B | 4.096 | lfm-open-license-v1.0 | MLC WebGPU |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1.2B | No disponible | lfm-open-license-v1.0 | Safetensors (original) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 | Safetensors, GGUF |

Nota: Los datos de Qwen2.5 son de conocimiento general; la comparación se limita a especificaciones básicas, ya que no hay benchmarks comunes.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `lfm-open-license-v1.0` impone condiciones específicas para uso comercial y requisitos de atribución. Revisar el `LICENSE` antes de cualquier despliegue en producción.
- **Contexto limitado**: con 4.096 tokens, no es adecuado para documentos extensos o conversaciones de muy larga duración.
- **Solo cuantización q4f16_1**: no se ofrecen otras opciones de cuantización, lo que puede limitar la precisión en tareas que requieran alta fidelidad numérica.
- **Idiomas no documentados**: no se especifican los idiomas soportados; el modelo base LFM2.5 podría tener cobertura multilingüe, pero no está confirmado.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información incorrecta o inventada, especialmente en temas especializados. La prueba de humo no evalúa la calidad general.
- **Dependencia de WebGPU**: el modelo solo funciona en navegadores con soporte WebGPU; en navegadores antiguos o dispositivos sin GPU compatible no se ejecutará.
- **Sin benchmarks publicados**: no hay evidencia de rendimiento en tareas estándar, por lo que su calidad relativa es desconocida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kanha-AI/kanha-liquid-lfm2.5-1.2b-instruct-sft-v1-MLC
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Adapter de fine-tuning: https://huggingface.co/Kanha-AI/kanha-liquid-lfm2.5-1.2b-instruct-sft-v1-adapter
- Versión ONNX del mismo modelo: https://huggingface.co/Kanha-AI/kanha-liquid-lfm2.5-1.2b-instruct-sft-v1-ONNX
