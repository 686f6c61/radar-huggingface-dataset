# gcoli/LFM2.5-2.6B-MLX-oQ4e-fp16

## Resumen

LFM2.5-2.6B-MLX-oQ4e-fp16 es una cuantizacion de 4 bits del modelo base LFM2.5-2.6B, publicada por el usuario gcoli bajo el framework MLX. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos con cuantizacion de precision mixta (oQ, oMLX v0.6.4) pensada para ejecucion local en hardware Apple Silicon. El repositorio ocupa 1,6 GB y contiene 2.697.198.592 parametros almacenados en safetensors en formato MLX, con 4 bits y tamano de grupo 64.

El modelo hereda la arquitectura etiquetada como `lfm2`, correspondiente a la familia LFM (Liquid Foundation Models) de Liquid AI, aunque la model card publicada no incluye especificaciones de arquitectura, contexto ni datos de entrenamiento. La relevancia de esta publicacion es practica: permite desplegar un modelo de ~2,7B en un Mac con memoria unificada, sin depender de GPU dedicada ni de servicios en la nube.

Se trata de una publicacion con 0 descargas y 0 likes en el momento de redactar esta ficha, sin licencia declarada ni idiomas especificados, y con una actualizacion de pesos el 15 de septiembre de 2026 que reemplaza una version anterior. La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente paginas de ayuda de instalacion de navegadores), por lo que buena parte de los datos tecnicos habituales no estan disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2` (familia LFM de Liquid AI); detalles de capas no disponibles |
| Parametros totales | 2.697.198.592 (~2,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, precision mixta oQ (oMLX v0.6.4), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria `mlx`) |
| Tamano del repositorio | 1,6 GB |
| Modelo base | LFM2.5-2.6B (inferido del nombre; no confirmado en la informacion disponible) |
| Fecha de publicacion | 2026-09-14 (actualizacion de pesos: 2026-09-15) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de la etiqueta `lfm2` y del tipo de modelo declarado en el proceso de cuantizacion. No se especifican numero de capas, tipo de atencion, mecanismos hibridos, dimension del hidden state ni vocabulario. El autor de esta ficha no ha entrenado el modelo: se limita a publicar una conversion cuantizada de pesos preexistentes.

Respecto al proceso de cuantizacion, la model card indica que se aplico oQ (oMLX v0.6.4), un esquema de precision mixta de 4 bits con tamano de grupo 64, en formato MLX safetensors. No se detallan los criterios de asignacion de bits por capa, la calibracion utilizada, la perdida de calidad respecto al modelo original ni el numero de tokens de entrenamiento, composicion del dataset o tecnicas de alineamiento (RLHF, DPO) del modelo base. Todos estos datos se consideran no disponibles.

## Capacidades

- Generacion de texto: capacidad esperable al tratarse de un modelo de lenguaje de ~2,7B, aunque no esta documentada explicitamente en la model card.
- Razonamiento, codigo, matematicas y vision: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Modo de pensamiento (thinking), audio, vision u otras capacidades especiales: no disponible.
- Ejecucion local en Apple Silicon: capacidad confirmada por el formato MLX, no por documentacion funcional del autor.

## Casos de uso

- Asistente local en Mac sin conexion: el modelo puede ejecutarse con MLX sobre memoria unificada, lo que permite desplegar un asistente de texto en un portatil sin enviar datos a la nube; adecuado cuando la privacidad es un requisito y el contexto requerido es corto, dado que la longitud de contexto no esta documentada.
- Prototipado rapido de aplicaciones de generacion de texto: al ocupar 1,6 GB, permite iterar en desarrollo sobre un Mac de gama media sin reservar GPU ni incurrir en costes de API.
- Preprocesado y anotacion de datos en local: uso como etiquetador o extractor de campos en lotes de texto (por ejemplo, generacion de JSON a partir de documentos) dentro de un pipeline de curacion de datos, siempre que se valide la calidad de salida.
- Resumen de documentacion interna bajo RGPD: al ejecutarse en el propio dispositivo, evita transferencias de datos personales a terceros, lo que simplifica el cumplimiento normativo en entornos con datos sensibles.
- Aplicaciones nativas en macOS/iOS: integrable mediante el ecosistema MLX (incluido MLX Swift) para funciones de generacion de texto embebidas en apps de escritorio o moviles.
- Investigacion sobre cuantizacion: sirve como punto de comparacion para estudiar el impacto de oQ a 4 bits con group size 64 frente a otras recetas de cuantizacion sobre el mismo modelo base.
- Chatbot interno de bajo coste: desplegable en un unico equipo Apple Silicon con memoria unificada suficiente, sin necesidad de infraestructura con GPU dedicada.
- Filtrado y clasificacion de contenido en tiempo de ejecucion: uso como primer nivel de cribado en un pipeline mayor, derivando los casos ambiguos a un modelo de mayor tamano.

En todos los casos, la ausencia de benchmarks publicados obliga a validar el comportamiento real antes de llevarlo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir el proceso de cuantizacion y no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni comparaciones con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: aproximadamente 1,6 GB solo para pesos en 4 bits (tamano real del repositorio); el consumo total depende del contexto y del cache KV, no documentados. Como referencia orientativa, cabe esperar un uso en el rango de 2 a 3 GB con contextos cortos, aunque esta cifra es una estimacion y no un dato publicado.
- GPU compatibles: el formato es MLX, por lo que el entorno nativo es Apple Silicon (familia M). No se ha publicado soporte para CUDA ni para GPU NVIDIA tipo A100, H100 o RTX 4090 en este repositorio concreto.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (orientativamente 8 GB o mas); no esta confirmado el minimo exacto.
- Opciones de despliegue: framework MLX (por ejemplo `mlx-lm` y su servidor de inferencia), entornos graficos que soporten MLX, e integracion mediante MLX Swift. No se ha publicado version GGUF, por lo que llama.cpp u Ollama no son aplicables a este repositorio tal cual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones del modelo base en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La tabla siguiente recoge unicamente lo que puede afirmarse sin inventar datos.

| Modelo | Parametros | Contexto | Formato | Licencia | Datos en esta ficha |
|---|---|---|---|---|---|
| LFM2.5-2.6B-MLX-oQ4e-fp16 (este) | ~2,7B | no disponible | MLX safetensors 4 bits | no disponible | 1,6 GB, oQ group size 64 |
| LFM2.5-2.6B (pesos oficiales sin cuantizar) | no disponible | no disponible | no disponible | no disponible | no proporcionado |
| Otras alternativas de ~3B en MLX | no disponible | no disponible | MLX | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la degradacion de calidad introducida por la cuantizacion a 4 bits con oQ.
- Licencia no declarada: al no especificarse licencia en el repositorio, no puede asumirse permiso para uso comercial. Es imprescindible verificar la licencia del modelo base LFM2.5-2.6B antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce el soporte multilingue real y el comportamiento en castellano.
- Longitud de contexto desconocida: no puede planificarse el uso en tareas de contexto largo (documentos extensos, conversaciones multi-turno prolongadas).
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se ha publicado ninguna evaluacion de fidelidad ni de tasas de error.
- Capacidades no documentadas: no hay confirmacion de soporte de tool calling, agentes, vision ni modo de razonamiento, por lo que no deben asumirse en diseno.
- Repositorio con 0 descargas y 0 likes: no existe validacion comunitaria ni reportes independientes de funcionamiento.
- Dependencia de plataforma: el formato MLX limita el despliegue a hardware Apple Silicon; no es portable directamente a CUDA sin reconvertir los pesos.
- Actualizacion de pesos: la model card advierte de que la version publicada el 15 de septiembre de 2026 sustituye a una anterior; las copias descargadas antes de esa fecha pueden ser distintas.
- Trazabilidad del autor: `gcoli` es un publicador individual, no el equipo de Liquid AI; la calidad de la conversion no esta avalada por el desarrollador del modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gcoli/LFM2.5-2.6B-MLX-oQ4e-fp16
- Herramienta de cuantizacion oQ / oMLX (citada en la model card): https://github.com/jundot/omlx
- Framework MLX: no proporcionado en la informacion disponible
- Modelo base LFM2.5-2.6B: no proporcionado en la informacion disponible
- Paper o blog tecnico: no disponible
- Demo: no disponible
- Resultados de la busqueda web: no relevantes (unicamente paginas de ayuda de instalacion de Google Chrome)
