# amd/Llama-3.2-1B-Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

AMD publica en HuggingFace una versión optimizada para NPU del modelo Llama-3.2-1B-Instruct de Meta, empaquetada en formato ONNX y destinada a ejecutarse sobre la plataforma Ryzen AI. El identificador del repositorio (`rai_1.9.0_m_1.0.1_npu`) indica compatibilidad con Ryzen AI 1.9.0 y con el modelo de ejecución NPU versión 1.0.1, lo que la convierte en una pieza específica del stack de inferencia local de AMD para procesadores con unidad de procesamiento neuronal integrada.

El modelo base es Llama-3.2-1B-Instruct, un transformer decoder-only de 1.230 millones de parámetros con 128.000 tokens de contexto, ajustado con instrucciones por Meta. Esta variante no modifica los pesos en términos de arquitectura, sino que los exporta y optimiza para el runtime de AMD, de modo que la inferencia se acelera en hardware Ryzen AI en lugar de depender exclusivamente de CPU o GPU.

Su relevancia es acotada pero concreta: permite ejecutar un modelo conversacional de Meta en portátiles y mini-PC con Ryzen AI sin necesidad de GPU dedicada, con un consumo energético bajo. El repositorio está restringido (gated), por lo que es necesario aceptar las condiciones de la licencia Llama 3.2 en HuggingFace antes de descargarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), exportado a ONNX para NPU Ryzen AI |
| Parámetros totales | 1.230 millones (modelo base Llama-3.2-1B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base; no confirmado en esta variante) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | inglés (según tags del repositorio) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 1,4 GB |
| Runtime objetivo | Ryzen AI 1.9.0, modelo NPU m_1.0.1 |
| Acceso | Restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Llama 3.2 1B Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. Meta entrenó este modelo sobre un corpus multilingüe de gran escala (el informe oficial de Llama 3.2 detalla más de 9 billones de tokens para la familia completa) y lo ajustó con instrucciones y preferencias humanas (SFT y RLHF/DPO). No se dispone en la información proporcionada de detalles adicionales sobre la composición exacta del dataset de esta variante.

La contribución de AMD en este repositorio no es el entrenamiento, sino la conversión y el empaquetado del modelo a ONNX con grafos optimizados para la NPU integrada en los procesadores Ryzen AI. El sufijo `m_1.0.1_npu` hace referencia a la versión del modelo de ejecución NPU que el runtime Ryzen AI 1.9.0 espera. Esta especialización implica que el modelo no es portable a otros backends sin reconversión: es un artefacto ligado al stack de AMD.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat instructivo.
- Razonamiento básico y respuesta a preguntas de conocimiento general.
- Generación de código y tareas sencillas de programación (limitadas por el tamaño de 1B).
- Aritmética y problemas matemáticos de baja complejidad.
- Soporte de tool calling / function calling heredado del modelo base Llama 3.2 Instruct (no verificado en esta exportación ONNX).
- Ejecución acelerada en NPU Ryzen AI, con descarga de la CPU/GPU.
- Capacidades multilingües limitadas: los tags del repositorio solo declaran inglés, aunque el modelo base soporta oficialmente ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- No incluye visión ni audio (la variante multimodal es Llama 3.2 11B Vision, no este modelo).

## Casos de uso

- Asistentes conversacionales locales en portátiles Ryzen AI: el modelo se ejecuta en la NPU sin GPU dedicada, permitiendo un chatbot privado con latencia baja y consumo reducido, adecuado para entornos donde los datos no deben salir del dispositivo.
- Procesamiento de texto en el borde (edge computing): clasificación, resumen y extracción de entidades en mini-PC o dispositivos industriales con Ryzen AI, donde no hay espacio para una GPU y se prioriza la eficiencia energética.
- Prototipado de aplicaciones de IA generativa en el stack AMD: sirve como referencia para validar pipelines ONNX + Ryzen AI antes de escalar a modelos mayores o a despliegues en producción.
- Generación de código asistida en IDE sobre hardware de consumo: con 1B parámetros puede autocompletar funciones simples y explicar fragmentos, integrándose vía API local.
- Filtrado y moderación de contenido en tiempo real: la ventana de contexto de 128.000 tokens del modelo base permite analizar documentos largos, aunque la variante NPU puede tener límites prácticos de memoria.
- Educación y demos de inferencia en NPU: útil para talleres y pruebas de concepto que muestren las ventajas de Ryzen AI frente a ejecución en CPU.
- Automatización de atención al cliente en inglés con despliegue on-premise: conversaciones multi-turno con contexto amplio y sin dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de latencia, throughput ni evaluaciones comparativas para esta variante ONNX/NPU. Los resultados del modelo base Llama-3.2-1B-Instruct pueden consultarse en el informe oficial de Meta, pero no son directamente extrapolables al rendimiento en NPU Ryzen AI.

## Requisitos de hardware

- NPU Ryzen AI integrada en procesadores AMD compatibles (la información no especifica los modelos exactos de CPU; se requiere Ryzen AI 1.9.0 y el modelo NPU m_1.0.1).
- VRAM: no aplica en el sentido tradicional; el modelo usa memoria unificada del sistema y la NPU. El repositorio ocupa 1,4 GB, por lo que se necesita al menos esa cantidad de memoria disponible más overhead del runtime.
- No requiere GPU dedicada; el objetivo es precisamente evitar depender de ella.
- Despliegue mediante el runtime Ryzen AI de AMD (no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en esta exportación ONNX específica).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecución NPU Ryzen AI |
|---|---|---|---|---|---|
| AMD Llama-3.2-1B-Instruct (este) | 1,23B | 128k (base) | ONNX | Llama 3.2 | Sí, nativa |
| Meta Llama-3.2-1B-Instruct | 1,23B | 128k | safetensors | Llama 3.2 | No (requiere conversión) |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | safetensors, GGUF | Apache 2.0 | No (requiere conversión) |
| Gemma 2 2B IT | 2,6B | 8k | safetensors, GGUF | Gemma Terms | No (requiere conversión) |

La ventaja diferencial de esta variante es la integración lista para NPU Ryzen AI; en cambio, su licencia es más restrictiva que la de Qwen2.5 y su tamaño es menor que el de Gemma 2 2B, lo que se traduce en menor capacidad de razonamiento.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar la licencia Llama 3.2 en HuggingFace antes de descargar el modelo.
- Licencia Llama 3.2 Community License: permite uso comercial con restricciones (por ejemplo, obligaciones de atribución y límite de 700 millones de usuarios mensuales para licenciatarios que ofrezcan el modelo como servicio).
- Idiomas: los tags solo declaran inglés; el rendimiento en castellano puede ser inferior al del modelo base y no está garantizado.
- Riesgo de alucinación inherente a un modelo de 1B parámetros; no es adecuado para tareas que exijan alta fiabilidad factual sin verificación.
- Portabilidad limitada: el artefacto ONNX está atado al runtime Ryzen AI 1.9.0 y al modelo NPU m_1.0.1; no funcionará en otros backends sin reconversión.
- Sin datos publicados de latencia, throughput ni benchmarks para esta variante, lo que dificulta estimar su rendimiento en producción.
- Capacidad de razonamiento y código limitada por el tamaño (1B); para tareas complejas se recomiendan modelos mayores.
- No incluye capacidades de visión ni audio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Llama-3.2-1B-Instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base Meta Llama-3.2-1B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Informe técnico Llama 3.2 (Meta): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- Documentación Ryzen AI (AMD): https://www.amd.com/en/products/processors/ryzen-ai.html
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
