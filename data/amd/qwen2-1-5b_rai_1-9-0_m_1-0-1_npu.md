# amd/Qwen2-1.5B_rai_1.9.0_m_1.0.1_npu

## Resumen

`amd/Qwen2-1.5B_rai_1.9.0_m_1.0.1_npu` es una distribucion optimizada del modelo Qwen2-1.5B publicada por AMD para su plataforma Ryzen AI. El identificador codifica el stack de despliegue: RAI 1.9.0 (Ryzen AI Software), formato ONNX, variante `m_1.0.1_npu` y ejecucion sobre la NPU integrada de los procesadores Ryzen AI. No es un modelo entrenado desde cero por AMD, sino un artefacto de inferencia derivado del Qwen2-1.5B original de Alibaba, recompilado y cuantizado para el motor NPU de Ryzen AI.

El proposito del artefacto es permitir inferencia local de un LLM de 1.500 millones de parametros sobre la NPU de un PC con Ryzen AI, sin depender de GPU dedicada ni de la nube. Esto es relevante para escenarios de privacidad (datos que no salen del equipo), latencia baja en escritorio y consumo energetico reducido frente a ejecutar el modelo en CPU o GPU.

El repositorio ocupa 1,5 GB y esta bajo licencia Apache 2.0, heredada del Qwen2-1.5B original. El acceso es restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargar. No hay informacion publica sobre benchmarks especificos de esta variante NPU en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), exportado a ONNX para NPU Ryzen AI |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen2-1.5B base soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (la variante `m_1.0.1_npu` implica cuantizacion para NPU Ryzen AI, pero no se especifica el esquema exacto) |
| Idiomas soportados | en (ingles) segun los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2-1.5B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU, embeddings atados y atencion con query/key/value bias, tal como se introdujo en la familia Qwen2. El modelo base fue entrenado por Alibaba con un corpus multilingue de varios billones de tokens y ajustado con preferencias (DPO) tras el preentrenamiento, segun la documentacion publica de Qwen2.

Sobre esa base, AMD aplica un pipeline de conversion a ONNX y optimizacion para el runtime Ryzen AI (RAI 1.9.0), con el objetivo de mapear las operaciones del transformer a la NPU XDNA de los procesadores Ryzen AI. La variante `m_1.0.1_npu` indica la version del modelo compilado y el backend NPU. No se dispone de informacion publica sobre el numero exacto de tokens de entrenamiento ni sobre detalles del proceso de cuantizacion aplicado en este artefacto concreto.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Conversacion multi-turno (pipeline `text-generation` con tag `conversational`).
- Razonamiento basico y respuesta a preguntas, limitado por el tamano de 1.5B parametros.
- Generacion de codigo sencillo y explicaciones tecnicas, aunque con fiabilidad inferior a modelos de mayor tamano.
- No se documenta soporte de tool calling / function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas: los metadatos solo declaran ingles.
- No se documenta vision, audio ni modo thinking.

## Casos de uso

- Asistentes de escritorio con privacidad estricta: el modelo se ejecuta en la NPU del PC, de modo que las conversaciones no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad (sanidad, legal, finanzas personales).
- Autocompletado y redaccion en aplicaciones ofimaticas: con 1.5B parametros y ejecucion NPU, la latencia es adecuada para sugerencias en linea dentro de editores de texto o correo.
- Clasificacion y extraccion de informacion en local: resumen de documentos, etiquetado de correos o extraccion de entidades en pipelines de escritorio sin conexion.
- Chatbot de soporte interno en estaciones de trabajo Ryzen AI: respuestas a preguntas frecuentes sobre politicas internas, con el modelo cargado en la NPU y sin coste de API.
- Prototipado de aplicaciones LLM en portatiles Ryzen AI: permite validar prompts y flujos conversacionales antes de escalar a modelos mayores en servidor.
- Educacion y demos de IA local: util para talleres y formacion donde se quiere mostrar inferencia LLM en hardware de consumo sin GPU dedicada.
- Generacion de texto en entornos con conectividad intermitente: al ejecutarse localmente, funciona sin red una vez descargado el artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen AI con NPU XDNA (familia Ryzen 7040/8040/8050 y posteriores compatibles con Ryzen AI Software 1.9.0).
- El repositorio ocupa 1,5 GB, lo que sugiere pesos cuantizados para NPU; el modelo no esta pensado para ejecutarse en GPU NVIDIA ni en CPU generica mediante este artefacto.
- No cabe esperar despliegue con vLLM, TGI o llama.cpp: el formato ONNX y el backend `npu` estan atados al runtime Ryzen AI.
- VRAM estimada: no aplica en el sentido tradicional; el modelo consume memoria del sistema y de la NPU, pero no se publica la huella exacta.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Para usar el modelo es necesario instalar Ryzen AI Software (RAI) 1.9.0 y disponer de drivers y firmware compatibles con la NPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/Qwen2-1.5B_rai_1.9.0_m_1.0.1_npu | 1.5B | no disponible | ONNX (NPU Ryzen AI) | Apache 2.0 | Gated en HuggingFace |
| Qwen/Qwen2-1.5B | 1.5B | 32.768 tokens | safetensors | Apache 2.0 | Publico en HuggingFace |
| Qwen/Qwen2-1.5B-Instruct | 1.5B | 32.768 tokens | safetensors | Apache 2.0 | Publico en HuggingFace |
| microsoft/Phi-3-mini-4k-instruct | 3.8B | 4.096 tokens | safetensors, GGUF | MIT | Publico en HuggingFace |

La diferencia clave frente a Qwen2-1.5B original es el formato y el backend: la variante de AMD solo es utilizable en hardware Ryzen AI con el runtime RAI, mientras que el original se ejecuta en GPU o CPU con transformers, vLLM o llama.cpp. Phi-3-mini ofrece mas parametros y contexto mas corto, con licencia MIT.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace; la descarga automatizada fallara sin autenticacion previa.
- Dependencia de hardware: solo funciona en procesadores Ryzen AI compatibles con RAI 1.9.0; no es portable a GPU NVIDIA, Apple Silicon ni CPU generica mediante este artefacto.
- Idioma: los metadatos solo declaran ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Tamano pequeno: con 1.5B parametros, la tasa de alucinacion en tareas de conocimiento factual es alta y el razonamiento complejo es limitado.
- Sin benchmarks publicados para esta variante: no hay evidencia publica de calidad tras la conversion a ONNX y la cuantizacion para NPU.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos adicionales del acceso gated y de la licencia del modelo base Qwen2.
- No se documenta soporte de tool calling ni de agentes; no deberia asumirse en produccion.
- Fecha de publicacion en HuggingFace: 2026-10-30, segun los metadatos del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen2-1.5B_rai_1.9.0_m_1.0.1_npu
- Modelo base Qwen2-1.5B: https://huggingface.co/Qwen/Qwen2-1.5B
- Modelo base Qwen2-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct
- Repositorio Qwen2 en GitHub: https://github.com/QwenLM/Qwen2
- Ryzen AI Software: https://www.amd.com/en/developer/resources/ryzen-ai-software.html
- Documentacion de Ryzen AI en GitHub: https://github.com/amd/RyzenAI-SW
