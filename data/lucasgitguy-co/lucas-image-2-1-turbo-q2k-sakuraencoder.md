# Lucasgitguy-co/Lucas-Image-2.1-Turbo-Q2K-SakuraEncoder

## Resumen

Lucas-Image-2.1-Turbo-Q2K-SakuraEncoder es un paquete de inferencia para generación de imágenes de texto (text-to-image) publicado por el usuario Lucasgitguy-co en Hugging Face. No se trata de un modelo entrenado por este autor, sino de un reempaquetado de tres componentes ya existentes: los pesos de difusión Q2_K de Unsloth para Qwen-Image-2.1-Turbo, un codificador de texto Qwen3-VL de 8B modificado y cuantizado en 4 bits por el proyecto Sakura, y el VAE original en bf16. El autor declara explícitamente que los tres archivos de pesos se copian byte a byte desde las fuentes fijadas en `provenance.json`, sin fine-tuning ni abliteración propia.

La relevancia de este paquete es logística más que algorítmica: agrupa en un único repositorio los tres artefactos necesarios para ejecutar el pipeline con `stable-diffusion.cpp`, evitando al usuario tener que localizar y emparejar versiones compatibles de difusión, encoder y VAE. El generador es de clase 7B (7.115.124.736 parámetros en safetensors según los metadatos del repositorio) y la cuantización Q2_K indica el nivel de compresión, no el número de parámetros.

La licencia es Qwen Research License (`qwen-research`), lo que restringe el uso a investigación y evaluación no comercial. El repositorio está etiquetado como `not-for-all-audiences` y tiene cero descargas y cero likes en el momento de la consulta, lo que refleja que es un artefacto reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion (generador Qwen-Image-2.1-Turbo) + encoder de texto Qwen3-VL + VAE |
| Parametros totales | 7.115.124.736 (generador de difusion, clase 7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del encoder de texto Qwen3-VL-8B; no especificado en la model card) |
| Tipos de cuantizacion | Q2_K para los pesos de difusion; Q4_K_M (4 bits) para el encoder de texto; bf16 para el VAE |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License), uso no comercial de investigacion/evaluacion |
| Formato de pesos | GGUF (difusion y encoder), safetensors (VAE) |

## Arquitectura y entrenamiento

El paquete no entrena nada: compone un pipeline de difusión latente de tres piezas. El generador es Qwen-Image-2.1-Turbo, un modelo de difusión de clase 7B distribuido originalmente por Qwen y cuantizado a Q2_K por Unsloth. El encoder de texto es un Qwen3-VL de 8B modificado por el proyecto Sakura y cuantizado a 4 bits (Q4_K_M, 4,68 GiB), que transforma el prompt en embeddings de condicionamiento. El VAE, en bf16, decodifica los latentes en píxeles. Los tres archivos deben usarse conjuntamente con una build compatible de `stable-diffusion.cpp`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; la model card no los detalla. La innovación técnica relevante es la naturaleza Turbo del generador, que permite muestreo con pocos pasos: la configuración recomendada arranca con 8 pasos, CFG 1.0, sampler Euler y el schedule de sigma Turbo original. El autor advierte que la cuantización a 2 bits de los pesos de difusión puede afectar a la calidad de imagen, y que la etiqueta "uncensored" del encoder Sakura no establece un efecto medido sobre el contenido generado.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) mediante difusión latente.
- Muestreo rápido en pocos pasos (8 pasos iniciales, CFG 1.0) gracias al esquema Turbo.
- Condicionamiento mediante un encoder de texto Qwen3-VL de 8B, que aporta comprensión multimodal del prompt.
- Ejecución en CPU/GPU mediante `stable-diffusion.cpp` con pesos GGUF.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de audio.
- Capacidades multilingües: no disponibles (no especificadas).
- Modo "uncensored" atribuido al encoder Sakura por su autor, sin efecto medido ni garantizado en este paquete.

## Casos de uso

- Evaluación de pipelines de difusión cuantizados: el paquete permite probar de extremo a extremo un generador de 7B en Q2_K con `stable-diffusion.cpp` sin tener que emparejar manualmente difusión, encoder y VAE.
- Investigación sobre el impacto de la cuantización: comparar la calidad de imagen de Q2_K frente a cuantizaciones mayores del mismo modelo base para estudiar la degradación introducida por 2 bits.
- Prototipado en hardware limitado: al usar GGUF y un encoder de 4 bits, permite experimentar con generación de imágenes en equipos con VRAM moderada o incluso en CPU.
- Reproducibilidad de artefactos: el `provenance.json` y los checksums permiten verificar que los pesos coinciden byte a byte con las fuentes fijadas, útil en auditorías de pipelines.
- Pruebas de humo de integración: el `smoke-test.json` documenta una comprobación básica de carga y generación con prompt neutro, útil como test de regresión en CI para builds de `stable-diffusion.cpp`.
- Estudio de encoders alternativos: permite evaluar el encoder Sakura Q4_K_M frente al encoder original de Qwen-Image-2.1-Turbo manteniendo el resto del pipeline constante.
- Docencia y demostraciones: pipeline autocontenido para ilustrar la arquitectura de tres componentes de un sistema text-to-image moderno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona un `smoke-test.json` que registra una comprobación básica de carga y generación con prompt neutro, y aclara explícitamente que no constituye un benchmark de calidad ni de uncensoring.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, el encoder de texto ocupa 4,68 GiB en Q4_K_M; los pesos de difusión en Q2_K y el VAE en bf16 añaden carga adicional que la model card no cuantifica.
- GPU recomendadas: no especificadas en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; el uso de GGUF y `stable-diffusion.cpp` sugiere viabilidad en equipos modestos, pero no hay cifras publicadas.
- Opciones de despliegue: `stable-diffusion.cpp` con una build compatible; se requieren los tres archivos simultáneamente.
- Latencia y throughput: no disponibles. La configuración Turbo de 8 pasos con CFG 1.0 reduce el coste frente a muestreos de 20-50 pasos, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lucas-Image-2.1-Turbo-Q2K-SakuraEncoder | 7,1B (difusion) + encoder 8B | no disponible | Q2_K / Q4_K_M / bf16 | qwen-research (no comercial) | Hugging Face, 0 descargas |
| unsloth/Qwen-Image-2.1-Turbo-GGUF | clase 7B | no disponible | GGUF (varias) | qwen-research | Hugging Face (fuente) |
| webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF | clase 7B + encoder 8B | no disponible | GGUF | no disponible en la informacion proporcionada | Hugging Face (fuente) |
| Qwen/Qwen-Image-2.1-Turbo | clase 7B | no disponible | pesos originales | qwen-research | Hugging Face (release original) |

No se dispone de datos de rendimiento comparativo (benchmarks de calidad de imagen, FID, CLIP score) en la información proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research: uso restringido a investigación y evaluación no comercial; el uso comercial requiere revisar los términos de la Qwen Research License en `LICENSE`.
- Cuantización agresiva: los pesos de difusión en Q2_K pueden degradar la calidad de imagen frente a cuantizaciones mayores o a los pesos originales.
- Etiqueta "uncensored" no verificada: el autor aclara que no se ha medido ningún efecto sobre el contenido generado; la etiqueta proviene del proyecto Sakura y no constituye una garantía.
- Contenido potencialmente sensible: el repositorio está marcado `not-for-all-audiences`.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente o no solicitado, especialmente con prompts ambiguos.
- Idiomas soportados no documentados: se desconoce el comportamiento multilingüe del encoder en este empaquetado.
- Dependencia de build: requiere una versión compatible de `stable-diffusion.cpp`; versiones desalineadas pueden fallar al cargar los tres componentes.
- Sin validación de terceros: cero descargas y cero likes; no hay evidencia de uso en producción ni de evaluación independiente.
- El autor no es Qwen, Unsloth ni Sakura: es un empaquetado independiente sin respaldo de los proyectos originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lucasgitguy-co/Lucas-Image-2.1-Turbo-Q2K-SakuraEncoder
- Fuente Unsloth: https://huggingface.co/unsloth/Qwen-Image-2.1-Turbo-GGUF
- Fuente Sakura (método y encoder): https://huggingface.co/webmp3/Sakura-Qwen-Image-2.1-Turbo-Uncensored-GGUF
- Release original de Qwen: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
