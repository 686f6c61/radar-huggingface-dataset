# ReadyArt/Gemma-4-31B-IT-EXL25

## Resumen

Gemma-4-31B-IT-EXL25 es una cuantización comunitaria del modelo Gemma 4 31B en su variante instruction-tuned, publicada por el usuario ReadyArt en Hugging Face. El repositorio no redistribuye los pesos originales en formato estándar, sino que ofrece cuantizaciones en un formato propietario denominado EXL2.5, derivado del contenedor EXL2 de ExLlamaV2. El modelo base, Gemma 4 31B IT, es un modelo de lenguaje de gran tamano desarrollado por Google DeepMind, aunque la model card del repositorio no aporta detalles sobre su arquitectura, entrenamiento o contexto.

La relevancia de esta ficha es limitada y fundamentalmente técnica: se trata de un artefacto de cuantización orientado a la inferencia local eficiente en GPUs Ampere (RTX 3090 y similares), no de un modelo nuevo. El autor introduce en su fork de ExLlamaV2 un formato EXL2.5 que anade optimizaciones de velocidad (un kernel GEMM sin ramificaciones con un límite de 16 filas pensado para verificación MTP con batch-4) y de calidad (rotación de incoherencia de Hadamard, protección de canales AWQ y redondeo guiado por Hessiano) manteniendo el mismo bits-per-weight.

Es importante subrayar que el repositorio no incluye información verificable sobre el modelo base: no se especifican parametros activos, longitud de contexto, idiomas, datos de entrenamiento ni resultados de benchmarks. Cualquier evaluación rigurosa del modelo debe remitirse a la documentación oficial de Gemma 4 de Google DeepMind, que no forma parte de la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 31B IT, detalles no incluidos en la model card) |
| Parametros totales | 31B (según el nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL2.5 (formato propietario del fork de ReadyArt, basado en el contenedor EXL2); bits-per-weight variables por rama, no especificados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL2.5 (contenedor EXL2 con extensiones propietarias); no compatible con ExLlamaV2 ni TabbyAPI estándar |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base ni su proceso de entrenamiento. El nombre del repositorio indica que se trata de Gemma 4 31B en variante instruction-tuned (IT), pero no se aportan datos sobre tipo de transformer, número de tokens de entrenamiento, composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La única información técnica disponible se refiere al formato de cuantización EXL2.5 desarrollado por el autor. Según la model card, este formato reutiliza el contenedor de archivo EXL2 e incorpora mejoras opcionales por tensor: por un lado, una ruta rápida de GEMM sin ramificaciones disenada para GPUs Ampere (RTX 3090) con un límite de 16 filas que permite que la verificación MTP con batch-4 lea los pesos una sola vez; por otro, técnicas de mejora de calidad a igual bits-per-weight, que incluyen rotación de incoherencia de Hadamard, protección de canales AWQ y redondeo guiado por Hessiano. Los modelos EXL2 convencionales siguen cargándose y ejecutándose sin cambios en el fork.

## Capacidades

- No se documentan capacidades específicas del modelo en la información proporcionada.
- Por herencia del modelo base Gemma 4 31B IT, se presupone generación de texto y seguimiento de instrucciones, pero no hay confirmación en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Inferencia local en GPU Ampere: el formato EXL2.5 está optimizado para GPUs Ampere como la RTX 3090, con un kernel GEMM sin ramificaciones que reduce la sobrecarga en decodificación. Adecuado para desplegar el modelo en estaciones de trabajo con una sola GPU de 24 GB.
- Verificación especulativa con MTP: el límite de 16 filas del kernel está disenado para que la verificación MTP con batch-4 lea los pesos una sola vez, lo que resulta útil en pipelines de decodificación especulativa de baja latencia.
- Cuantización de alta calidad a bits reducidos: las técnicas de Hadamard, AWQ y redondeo Hessiano permiten obtener cuantizaciones con menor degradación a igual bits-per-weight, útiles cuando se necesita comprimir el modelo sin reentrenar.
- Integración con TabbyAPI: mediante el fork de TabbyAPI del autor se puede exponer el modelo como API compatible con OpenAI para prototipado de aplicaciones.
- Evaluación comparativa de formatos de cuantización: sirve como artefacto para comparar EXL2.5 frente a EXL2 estándar en términos de latencia y perplejidad a igual bits-per-weight.
- Investigación sobre kernels y formatos de cuantización: el repositorio y sus forks asociados son un caso de estudio para desarrolladores interesados en optimizaciones de GEMM y redondeo guiado por Hessiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Para un modelo de 31B, una cuantización a 4 bits requeriría del orden de 16-18 GB de VRAM solo para pesos, más overhead de contexto y caché KV; a 3 bits, del orden de 12-14 GB. Estas cifras son estimaciones generales y no proceden de la model card.
- GPU recomendadas: el autor menciona explícitamente Ampere / RTX 3090 como objetivo del kernel optimizado.
- Compatibilidad con GPU de consumo: previsiblemente sí en RTX 3090 (24 GB) y modelos con VRAM similar, según el bits-per-weight elegido; no confirmado en la model card.
- Opciones de despliegue: exclusivamente mediante los forks del autor (exllamav2-Fork y tabbyAPI-Fork). No funciona con ExLlamaV2 ni TabbyAPI estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/Gemma-4-31B-IT-EXL25 | 31B (según nombre) | no disponible | Apache 2.0 | EXL2.5 (fork) | Hugging Face, requiere forks |
| Gemma 4 31B IT (oficial) | 31B (según nombre) | no disponible | no disponible en esta ficha | safetensors (presumible) | Documentación oficial de Google DeepMind |
| Cuantizaciones EXL2 estándar de modelos 31B | 31B | depende del modelo base | depende del modelo base | EXL2 | Hugging Face, compatible con ExLlamaV2 estándar |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La model card no documenta el modelo base: no hay información verificable sobre arquitectura, contexto, idiomas ni entrenamiento.
- El formato EXL2.5 es propietario y requiere forks específicos de ExLlamaV2 y TabbyAPI; no es compatible con el ecosistema estándar de inferencia (vLLM, llama.cpp, Ollama, TGI).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se han publicado benchmarks ni evaluaciones de calidad de la cuantización.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; deben asumirse los del modelo base Gemma 4 31B IT.
- Licencia Apache 2.0 declarada en el repositorio, pero la licencia del modelo base Gemma puede imponer condiciones adicionales que no se detallan aquí; conviene verificar los términos oficiales de Gemma antes de uso comercial.
- El autor advierte explícitamente de que el modelo no funcionará con builds estándar de ExLlamaV2/TabbyAPI, lo que limita su portabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ReadyArt/Gemma-4-31B-IT-EXL25
- Fork de ExLlamaV2: https://github.com/Ready-Art/exllamav2-Fork
- Fork de TabbyAPI: https://github.com/Ready-Art/tabbyAPI-Fork
