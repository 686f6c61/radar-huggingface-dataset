# DICPlay/RusMind-Vspyshka-4.7

## Resumen
RusMind-Vspyshka-4.7 (Вспышка, "destello" en ruso) es un ajuste fino del modelo multimodal google/gemma-4-E4B-it desarrollado por DICPlay, orientado a tareas en ruso y con un enfoque explícito en ejecución local ("on-device") y sin conexión. El modelo parte de una base Gemma 4 de aproximadamente 8.000 millones de parámetros (7.996.156.490 según los pesos en safetensors) y se distribuye tanto en formato transformers/safetensors como en GGUF para llama.cpp, LM Studio y Ollama.

La propuesta de valor del autor es el rendimiento en ruso: según la model card, ocupa la segunda posición entre todos los modelos de hasta 10.000 millones de parámetros en el benchmark MERA v2 (puntuación global 0,191), solo por detrás de otro modelo de la misma familia (RusMind-Sokol-4.7). El autor afirma que supera en tareas humanocéntricas a T-pro (33.000 millones) y que queda casi a la par de este último en la puntuación global (0,191 frente a 0,196) con una cuarta parte del tamaño.

El modelo declara soporte para ruso e inglés, licencia propia ("rusmind-license") y capacidades de texto e imagen a texto (pipeline image-text-to-text), además de llamada a herramientas. La información disponible proviene casi exclusivamente de la model card del autor; no se han publicado detalles técnicos sobre el proceso de entrenamiento ni sobre la composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de google/gemma-4-E4B-it); detalles internos no disponibles |
| Parametros totales | 7.996.156.490 (~8.000 millones) |
| Parametros activos | no disponible (el autor no confirma si la variante E4B es MoE; no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible según tags y model card); niveles concretos no disponibles |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (license: other, con enlace a LICENSE en el repo) |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino (finetune) de google/gemma-4-E4B-it, una base multimodal de Google de aproximadamente 8.000 millones de parámetros según los pesos publicados. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, si emplea mezcla de expertos o atención lineal), por lo que estos datos deben considerarse no disponibles. Tampoco se especifica la longitud de contexto soportada.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. El autor menciona mejoras respecto a la versión 4.5 en seguimiento de instrucciones complejas, llamada a herramientas, comprensión de personajes, humor y corrección ortográfica en ruso, pero sin describir la metodología. La única innovación destacable documentada es el empaquetado para ejecución local mediante GGUF y su integración con llama.cpp.

## Capacidades
- Generación de texto conversacional en ruso e inglés.
- Procesamiento de imagen y texto (pipeline image-text-to-text según los tags del repo).
- Llamada a herramientas y funciones (tool calling): el autor reporta 86 % de selección correcta de herramienta y 100 % de resistencia a inyección de instrucciones en la tarea GorillaHard de MERA v2.
- Seguimiento de instrucciones complejas con múltiples requisitos simultáneos (tarea IFHard).
- Corrección ortográfica y de puntuación en ruso (tarea SAGE, puntuación 0,719).
- Respuestas adoptando la voz de personajes (tarea Characters, 0,537).
- Razonamiento lógico y resolución de acertijos (tarea NewReasoning, 0,330).
- Comprensión de matices léxicos del ruso, incluidos antónimos y enantiosemia.
- Conocimiento de historia, cultura, regiones y pueblos de Rusia.
- Ejecución local sin conexión en equipos de sobremesa, portátiles y teléfonos de gama alta.

## Casos de uso
- Asistente conversacional en ruso para atención al cliente: el modelo puede mantener diálogos multiturno con corrección gramatical fiable (0,719 en SAGE) y buen seguimiento de instrucciones, adecuado para respuestas de soporte en centros de contacto rusoparlantes.
- Corrección y edición de textos en ruso: uso como corrector ortográfico y de puntuación (0,760 en puntuación dentro de SAGE) integrado en editores o pipelines de publicación de contenidos.
- Automatización de agentes con herramientas: gracias a su soporte de tool calling y a la resistencia declarada a inyección de instrucciones, puede emplearse en flujos de agentes que consulten APIs o bases de datos internas.
- Despliegue en dispositivos sin conectividad: al distribuirse en GGUF y funcionar offline, es apto para portátiles, equipos de campo o terminales con requisitos de privacidad donde no se permite enviar datos a la nube.
- Generación de personajes y contenido creativo: la puntuación de 0,537 en la tarea Characters lo hace utilizable en videojuegos, narrativa interactiva o chatbots con personalidad definida en ruso.
- Enseñanza y divulgación de cultura rusa: su conocimiento declarado de historia, regiones y pueblos de Rusia permite construir asistentes educativos o de orientación cultural en ruso e inglés.
- Procesamiento de documentos con imagen y texto: al aceptar entradas image-text-to-text, puede emplearse para extraer y resumir información de capturas o documentos escaneados en ruso.

## Benchmarks y rendimiento
Resultados publicados por el autor en MERA v2 (octubre de 2026):

| Modelo | Parámetros | Global | Razonamiento | Humanocéntrico | Cultura y regiones |
|---|---|---|---|---|---|
| RusMind Vspyshka 4.7 | ~8.000 M | 0,191 | 0,385 | 0,257 | 0,228 |
| Qwen3.5-9B (Alibaba) | ~9.000 M | 0,186 | 0,339 | 0,218 | 0,118 |
| Gemma 4 E4B (Google) | ~8.000 M | 0,170 | 0,367 | 0,172 | 0,199 |
| T-lite (T-Bank) | ~8.000 M | 0,130 | 0,218 | 0,169 | 0,196 |
| A-Vibe (Avito) | ~8.000 M | 0,113 | 0,187 | 0,132 | 0,171 |
| RuadaptQwen3-32B | 32.000 M | 0,163 | 0,342 | 0,177 | no disponible |
| Zero-Mistral | 24.000 M | 0,160 | 0,213 | 0,235 | no disponible |

Resultados por tarea del propio modelo:

| Tarea MERA v2 | Puntuación |
|---|---|
| SAGE (ortografía y puntuación) | 0,719 |
| Characters | 0,537 |
| LIMUR | 0,465 |
| Enantiosemy | 0,373 |
| NewReasoning | 0,330 |
| RUBIN | 0,328 |
| GorillaHard (tool calling) | 0,302 |
| IFHard (instrucciones complejas) | 0,300 |
| Humor | 0,196 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial. Con ~8.000 millones de parámetros, una cuantización de 4 bits requeriría aproximadamente 5-6 GB de VRAM; en FP16, unos 16 GB. Estas cifras son estimaciones por tamaño, no datos del autor.
- GPU recomendadas: el autor menciona "PC potentes, portátiles y teléfonos de gama alta", sin especificar modelos. Para FP16 se necesitarían GPUs con 16 GB o más (RTX 4080/4090, A100, H100); para cuantizaciones de 4 bits, GPUs consumer de 8 GB en adelante.
- Cabe en GPU consumer: sí, previsiblemente en cuantización GGUF de 4 bits en tarjetas de 8 GB o más, aunque no se confirma oficialmente.
- Opciones de despliegue: transformers, llama.cpp, LM Studio, Ollama; los tags indican compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 global | Licencia | Idiomas |
|---|---|---|---|---|---|
| RusMind Vspyshka 4.7 | ~8.000 M | no disponible | 0,191 | rusmind-license | ru, en |
| Qwen3.5-9B | ~9.000 M | no disponible | 0,186 | no disponible | multilingüe |
| Gemma 4 E4B | ~8.000 M | no disponible | 0,170 | no disponible | multilingüe |
| T-lite | ~8.000 M | no disponible | 0,130 | no disponible | ru |

## Limitaciones y advertencias
- Los resultados de benchmarks proceden exclusivamente de la model card del autor; no se han verificado de forma independiente en esta ficha.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; el enfoque en historia y cultura rusas puede introducir sesgos de encuadre.
- Riesgo de alucinación no cuantificado; como todo modelo generativo, puede producir información incorrecta, especialmente en dominios especializados.
- Idiomas limitados a ruso e inglés; no se declara soporte para castellano ni otras lenguas.
- La licencia "rusmind-license" es propia y con cláusula "other"; deben revisarse sus términos en el archivo LICENSE antes de cualquier uso comercial.
- No se dispone de información sobre longitud de contexto, por lo que no puede garantizarse el rendimiento en documentos largos.
- El autor no publica detalles de entrenamiento, lo que dificulta evaluar la procedencia de los datos y posibles contaminaciones.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo hermano RusMind-Sokol-4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Sitio del proyecto: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
