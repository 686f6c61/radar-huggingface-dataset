# neureps/warmly-qwen35-08b-enko-gguf

## Resumen

`neureps/warmly-qwen35-08b-enko-gguf` es un modelo en formato GGUF de 0.8B (aunque los pesos reales en safetensors suman 649.817.920 parámetros) desarrollado por neureps para la aplicación Warmly (온기). Está diseñado como la capa de despliegue para dispositivos de gama baja (poca memoria RAM) y combina capacidades de visión (captioning de imágenes) y texto (generación de comentarios) en un único modelo. Se basa en `neureps/Qwen3.5-0.8B-enko`, un modelo maestro podado y destilado, e incorpora un adaptador LoRA para añadir un quinto personaje ("Louie") sin necesidad de redistribuir el cuerpo principal.

La versión actual (v3.1, publicada el 2026-07-23) incluye un cuerpo de texto cuantizado a Q4_K_M con imatrix de dominio, un proyector de visión en q8_0 y un adaptador de persona en f16. El tamaño total de la pila es de aproximadamente 542 MB, lo que lo hace adecuado para inferencia en dispositivos con recursos limitados. El modelo está pensado para ejecutarse con llama.cpp y sus herramientas asociadas, y soporta tanto generación de texto como procesamiento de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.5, sin detalle oficial) |
| Parametros totales | 649.817.920 (pesos safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M (según variantes); versión actual Q4_K_M |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (tipo de transformer, atención, etc.) más allá de indicar que se trata de un modelo Qwen3.5 podado y destilado. El proceso de entrenamiento incluye varias iteraciones de destilación (v1, v2, v3c) sobre el modelo maestro `neureps/Qwen3.5-0.8B-enko`, con mejoras progresivas en la cobertura de entrada y la reducción de defectos como alucinaciones de nombres de lugares y fugas de inglés. La versión v3c incorpora una técnica de "mezcla de pivotes" que regenera hard words con la voz del personaje, logrando una tasa de defectos del 45% en la evaluación interna (frente al 51% de v2).

El modelo se distribuye con un adaptador LoRA (12.2 MB en f16) que añade un quinto personaje sin modificar el cuerpo base. Este adaptador se carga con `--lora` y `--lora-init-without-apply` en llama.cpp, y se activa o desactiva por petición mediante escalas (0 para los cuatro personajes integrados, 1 para Louie). No se especifican datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto en coreano e inglés, orientada a comentarios y respuestas conversacionales.
- Captioning de imágenes (visión) mediante un proyector multimodal (`mmproj-q8_0.gguf`) que se combina con el cuerpo de texto.
- Soporte de adaptadores LoRA para personalización de personajes sin reentrenar el modelo base.
- Integración con llama.cpp: `llama-server` para API, `llama-mtmd-cli` para captions.
- Capacidad de alternar entre personajes en tiempo real mediante escalas de LoRA por petición.
- Optimizado para dispositivos con poca RAM (tamaño total ~542 MB).

## Casos de uso

- Asistente conversacional en aplicaciones móviles: el modelo puede gestionar diálogos multiusuario con distintos personajes, activando el adaptador LoRA correspondiente según el contexto. Su pequeño tamaño permite ejecutarlo en teléfonos de gama media sin depender de la nube.
- Generación de comentarios automáticos en redes sociales: gracias a su entrenamiento específico para comentarios y su capacidad de cambiar de personaje, puede producir respuestas con tono y estilo diferenciados, útil para moderación o engagement automatizado.
- Captioning de imágenes en dispositivos locales: el proyector de visión permite describir fotografías sin conexión, ideal para aplicaciones de accesibilidad o gestión de álbumes en entornos con privacidad estricta.
- Chatbots de atención al cliente en coreano e inglés: con una ventana de contexto suficiente (aunque no especificada), puede mantener conversaciones multi-turno y responder con información factual básica, reduciendo la dependencia de APIs externas.
- Prototipado rápido de asistentes con personalidad: el mecanismo de LoRA permite experimentar con nuevos personajes sin reentrenar, facilitando pruebas A/B en aplicaciones de entretenimiento o juegos.
- Despliegue en dispositivos edge (Raspberry Pi, NAS, etc.): el peso total de ~542 MB y la compatibilidad con llama.cpp permiten ejecutarlo en hardware de bajo consumo para tareas de procesamiento de lenguaje natural y visión básica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de calidad proporcionado es una evaluación interna realizada con Gemma 4 12B sobre un conjunto gold144 (N=144) en condiciones de muestreo de producción, que arroja una tasa de defectos del 13.2% para el personaje Louie en la versión v3.1 (equivalente a la versión previa Q5_K_M con 12.5%). No se detallan las métricas exactas ni la metodología completa.

## Requisitos de hardware

- Tamaño total de la pila: aproximadamente 542 MB (cuerpo Q4_K_M de 419 MB, adaptador f16 de 12.2 MB, proyector q8_0 de 111 MB).
- Inferencia en CPU: viable en dispositivos con al menos 1 GB de RAM libre, dado el peso reducido y el uso de cuantización Q4_K_M.
- GPU: no se especifican requisitos de VRAM; al ser un modelo de 0.8B, es probable que quepa en GPUs consumer con 4 GB o menos, pero no hay confirmación oficial.
- Herramientas de despliegue: llama.cpp (llama-server, llama-mtmd-cli), compatible con Ollama y otras interfaces que soporten GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tamaño, tarea, licencia) dentro de los datos proporcionados. Se puede señalar que existe una versión de 2B del mismo proyecto (`neureps/warmly-qwen35-2b-enko-gguf`) para dispositivos con más recursos, pero no se ofrecen métricas comparativas.

## Limitaciones y advertencias

- Requiere desactivar el modo de pensamiento (`enable_thinking: false`) durante la inferencia; si no se hace, la salida se degrada ("output se convierte en beam" según la documentación).
- El adaptador LoRA solo afecta a la generación de texto (comentarios); la ruta de captions usa únicamente el cuerpo base y el proyector, por lo que el personaje no influye en las descripciones de imagen.
- Riesgo de alucinaciones en nombres de lugares y objetos, aunque las iteraciones v2 y v3c redujeron estos casos (de 11 a 0 en v2 para topónimos, y de 20 a 6 en v3c para objetos).
- El modelo está entrenado principalmente para coreano e inglés; otros idiomas no están soportados oficialmente.
- La licencia Apache-2.0 permite uso comercial, pero el proyecto depende de herramientas de terceros (llama.cpp) que tienen sus propias licencias.
- No se especifica la longitud de contexto máxima; se recomienda probar en producción para evitar fallos con entradas largas.
- La evaluación de calidad se basa en un único conjunto de prueba (gold144) y un evaluador automático (Gemma 4 12B); no hay validación humana independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/neureps/warmly-qwen35-08b-enko-gguf
- Modelo base (safetensors): https://huggingface.co/neureps/Qwen3.5-0.8B-enko
- Adaptador de destilación: https://huggingface.co/neureps/warmly-qwen35-08b-enko-distill
- Versión 2B del proyecto: https://huggingface.co/neureps/warmly-qwen35-2b-enko-gguf
- Repositorio de la aplicación Warmly: https://github.com/neureps/warmly
