# omegazurich/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a tareas de programación y flujos de trabajo agénticos, desarrollado por Moonshot AI. Se construye sobre Kimi K2.6 y está diseñado para mejorar la finalización de tareas de ingeniería de software de horizonte largo, es decir, aquellas que requieren múltiples pasos, uso de herramientas y contexto extenso. El modelo está publicado en Hugging Face bajo el identificador `omegazurich/Kimi-K2.7-Code`, con un total de 1.026.879.376.368 parámetros según los pesos en safetensors, lo que confirma la cifra de 1T declarada en la model card.

La arquitectura combina atención MLA (Multi-head Latent Attention) con 61 capas, 384 expertos y 8 expertos seleccionados por token, además de un experto compartido. Incorpora un codificador visual MoonViT de 400M de parámetros, lo que habilita la modalidad image-text-to-text. La longitud de contexto declarada es de 256K tokens y el vocabulario alcanza los 160K tokens.

Su relevancia actual radica en la mejora de eficiencia respecto a K2.6: reduce el uso de tokens de razonamiento en aproximadamente un 30%, manteniendo mejoras sustanciales en benchmarks de código y agentes. Está pensado para integrarse en asistentes de programación y pipelines de CI/CD que necesiten razonamiento multi-paso y tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención MLA |
| Parametros totales | 1.026.879.376.368 (1T) |
| Parametros activos | 32B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | compressed-tensors (formato nativo del repo); no se detallan otros esquemas |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (license: other, license_name: modified-mit) |
| Formato de pesos | safetensors, compressed-tensors |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 61 capas (una de ellas densa), dimensión de atención de 7168, dimensión oculta MoE de 2048 por experto, 64 cabezas de atención, 384 expertos con 8 seleccionados por token y 1 experto compartido. La función de activación es SwiGLU y el mecanismo de atención es MLA (Multi-head Latent Attention), orientado a reducir el coste de memoria de la caché KV en contextos largos. Incluye un codificador visual MoonViT de 400M de parámetros, lo que explica la pipeline `image-text-to-text`.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card sí menciona una mejora de eficiencia: la reducción de aproximadamente un 30% en tokens de razonamiento respecto a Kimi K2.6, lo que sugiere un ajuste específico del modo thinking para tareas de código. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código y finalización de tareas de ingeniería de software de horizonte largo, con énfasis en flujos end-to-end.
- Razonamiento multi-paso con modo thinking, optimizado para reducir el consumo de tokens de razonamiento.
- Soporte de tool calling y function calling, evidenciado por los benchmarks MCP Atlas y MCP Mark Verified.
- Capacidades agénticas: ejecución de tareas 24/7 y uso de herramientas externas (Kimi Claw 24/7 Bench).
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias al codificador MoonViT.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Integración con Kimi Code CLI para evaluación y uso en entornos de desarrollo.

## Casos de uso

- Asistente de programación en IDE: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 256K tokens, lo que permite mantener en memoria archivos completos, historiales de commits y documentación durante sesiones largas de refactorización.
- Automatización de incidencias en producción: con soporte de tool calling y razonamiento multi-paso, puede recibir logs, consultar APIs internas y proponer parches, integrándose en pipelines de respuesta a incidentes.
- Generación de código en CI/CD: puede conectarse a herramientas de build y test mediante function calling para iterar sobre errores de compilación y ejecutar correcciones dentro de un pipeline automatizado.
- Agentes autónomos de mantenimiento: el benchmark Kimi Claw 24/7 Bench sugiere uso en tareas prolongadas de monitorización y corrección de repositorios, con capacidad de operar de forma sostenida.
- Análisis de capturas y diagramas técnicos: al aceptar entrada de imagen, puede interpretar diagramas de arquitectura, capturas de errores o interfaces para generar código o documentación asociada.
- Migración y modernización de bases de código: su ventana de contexto permite procesar módulos extensos y aplicar transformaciones coherentes en varios archivos, reduciendo la pérdida de contexto entre pasos.
- Integración con servidores MCP: los resultados en MCP Atlas (76,0) y MCP Mark Verified (81,1) lo hacen adecuado para orquestar herramientas externas en entornos de desarrollo estandarizados.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las evaluaciones de Kimi K2.7 Code y K2.6 se realizaron con thinking mode activado mediante Kimi Code CLI, temperatura 1,0, top-p 0,95 y contexto de 262.144 tokens; GPT-5.5 en Codex con modo xhigh y Claude Opus 4.8 en Claude Code con modo xhigh.

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 1T de parámetros totales y 32B activos, la inferencia en precisión completa requiere varios nodos multi-GPU. En cuantización de 4 bits, el peso ronda los 500 GB, por lo que sigue necesitando múltiples GPU de 80 GB.
- GPU recomendadas: clústeres de A100 80 GB, H100 80 GB o H200; no es viable en una única GPU consumer.
- No cabe en GPU de consumo (RTX 4090, 3090, etc.) ni en configuraciones de una sola tarjeta de 24 GB.
- Opciones de despliegue: el repo usa la librería `transformers` con `custom_code` y pesos en `compressed-tensors`; para serving a gran escala se requerirían frameworks compatibles con MoE y MLA, como vLLM o TGI, aunque no se confirma compatibilidad explícita en la información disponible. llama.cpp y Ollama no son opciones realistas por tamaño.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimi K2.7 Code | 1T totales / 32B activos | 256K | modified-mit | Hugging Face |
| Kimi K2.6 | no disponible | no disponible | no disponible | Referencia en la model card |
| GPT-5.5 | no disponible | no disponible | propietaria | API (Codex) |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | API (Claude Code) |

En rendimiento, Kimi K2.7 Code supera a K2.6 en todos los benchmarks publicados, pero queda por debajo de GPT-5.5 y Claude Opus 4.8 en la mayoría de las pruebas, con la excepción de MCP Mark Verified, donde supera a Claude Opus 4.8 (81,1 frente a 76,4).

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se documenta una evaluación específica; como modelo generativo de código, puede producir APIs o funciones inexistentes.
- Limitaciones de contexto o idioma: el contexto es de 256K tokens; no se especifican los idiomas soportados, lo que impide confirmar cobertura multilingüe más allá del inglés técnico.
- Restricciones de licencia: la licencia es `modified-mit` (etiquetada como `other`), por lo que conviene revisar el texto completo antes de uso comercial; no es una MIT estándar.
- El repositorio pertenece a `omegazurich`, no a la organización oficial `moonshotai`, y registra 0 descargas y 0 likes en el momento de la consulta; conviene verificar la procedencia y los hashes de los pesos antes de desplegarlo en producción.
- El tamaño del repo (595,2 GB) y los 1T de parámetros implican costes de infraestructura muy elevados y descartan el despliegue en hardware de consumo.
- No se detallan los datos de entrenamiento ni los procesos de alineación, lo que limita la evaluación de riesgos de sesgo y seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/omegazurich/Kimi-K2.7-Code
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Página de Kimi Code: https://www.kimi.com/code
- Homepage de Moonshot AI: https://www.moonshot.ai
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
