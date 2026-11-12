# ggml-org/gemma-4-26B-A4B-it-GGUF

## Resumen

Gemma 4 26B-A4B-it es un modelo multimodal de tipo image-text-to-text desarrollado originalmente por Google y distribuido en formato GGUF por ggml-org para su uso con llama.cpp y el ecosistema de inferencia local. Se trata de una variante de la familia Gemma 4 con arquitectura Mixture-of-Experts (MoE), con aproximadamente 25.233 millones de parametros totales y 4B parametros activos por token (de ahi el sufijo A4B), lo que permite obtener calidad de un modelo denso grande con un coste de computo por token propio de un modelo de 4B.

El modelo esta afinado para instrucciones (sufijo -it) y acepta entradas de imagen y texto, devolviendo texto. Es especialmente relevante porque combina capacidades multimodales, contexto largo y eficiencia MoE en un unico checkpoint que puede ejecutarse en hardware de consumo mediante cuantizacion GGUF, algo impensable en modelos densos de 26B. La licencia Apache 2.0 y la disponibilidad de variantes QAT (quantization-aware training) lo hacen atractivo para despliegues comerciales y para integracion en pipelines de agentes.

El repositorio de ggml-org es una conversion automatica del checkpoint original de Google mediante la herramienta convert de ggml-org, e incluye referencias a un modelo assistant (para decodificacion especulativa) y a una variante DFlash de z-lab, lo que sugiere soporte para tecnicas de aceleracion de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer multimodal image-text-to-text |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B por token (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; QAT q4_0 disponible en el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 288,4 GB con todas las variantes) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Mixture-of-Experts con enrutamiento por token, donde solo una fraccion de los expertos (equivalentes a ~4B parametros activos) se computa en cada paso, frente a los ~25,2B parametros totales. Esto reduce drasticamente el coste de inferencia y memoria de computo manteniendo la capacidad representacional de un modelo grande. La variante -it indica un post-entrenamiento de instrucciones, presumiblemente con SFT y tecnicas de alineamiento tipo RLHF/DPO, aunque los detalles concretos del dataset y del proceso no estan disponibles en la informacion proporcionada.

El checkpoint original de Google incluye una version QAT (quantization-aware training) en q4_0, lo que permite que la cuantizacion a 4 bits tenga perdida de calidad minima. El repositorio de ggml-org referencia tambien un modelo assistant para decodificacion especulativa (aceleracion de generacion mediante un modelo borrador pequeno) y una variante DFlash de z-lab, orientada a inferencia rapida. La componente multimodal image-text-to-text implica un encoder de vision emparejado con el decoder MoE, aunque los detalles de dicho encoder no se especifican.

## Capacidades

- Generacion de texto conversacional multi-turno con formato de instrucciones.
- Comprension de imagenes (image-text-to-text): descripcion, VQA y razonamiento sobre contenido visual.
- Razonamiento y respuesta a preguntas de conocimiento general.
- Generacion de codigo y asistencia en tareas de programacion (presumible, no verificado en la informacion).
- Capacidades matematicas basicas e intermedias (no verificadas con benchmarks).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente.
- Capacidades multilingues: no disponibles (idiomas no listados).
- Modo thinking explicito: no disponible en la informacion.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue via API compatible con OpenAI.

## Casos de uso

- Asistente multimodal local: el modelo puede procesar capturas de pantalla, documentos escaneados o fotografias junto con preguntas en texto, adecuado para aplicaciones de escritorio que requieran privacidad y ejecucion offline mediante llama.cpp.
- Atencion al cliente con imagenes: gestion de conversaciones multi-turno donde el usuario adjunta recibos, productos o errores de pantalla, aprovechando la entrada image-text-to-text y el formato instruct.
- Analisis de documentos y formularios: extraccion y descripcion de contenido visual en flujos de digitalizacion, con cuantizacion QAT q4_0 para reducir requisitos de memoria en servidores modestos.
- Generacion asistida de codigo en IDE: integracion via endpoint compatible con OpenAI para autocompletado y explicacion de codigo, con bajo coste por token gracias a los ~4B parametros activos.
- Prototipado de agentes con decodificacion especulativa: uso conjunto con el modelo assistant referenciado para acelerar la generacion en pipelines de razonamiento multi-paso.
- Despliegue en edge y estaciones de trabajo: al ser MoE con 4B activos, puede ejecutarse en GPUs de consumo con cuantizaciones bajas, habilitando asistentes locales sin dependencia de la nube.
- Investigacion en eficiencia MoE: comparacion de latencia y calidad entre niveles de cuantizacion GGUF sobre el mismo checkpoint, util para estudiar el impacto de QAT en modelos MoE multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~25,2B parametros totales, una cuantizacion Q4 requiere aproximadamente 13-15 GB de pesos mas overhead de contexto y encoder de vision, mientras que Q8 se aproxima a 26-28 GB.
- GPU recomendadas: no especificadas en la informacion; por tamano, una RTX 4090 (24 GB) o RTX 3090 podrian alojar cuantizaciones Q4/Q5, y A100/H100 para precisiones mayores o mayor contexto.
- Cabe en GPU de consumo: previsiblemente si en cuantizaciones Q4/Q5 en GPUs de 24 GB; no confirmado oficialmente.
- Opciones de despliegue: llama.cpp y `llama serve` (comando documentado en la model card), Llama app, y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere servidores con API estilo OpenAI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|---|
| Gemma 4 26B-A4B-it (este) | ~25,2B | ~4B | no disponible | Si (imagen-texto) | Apache 2.0 | GGUF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa rigurosa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion; los modelos de lenguaje suelen reproducir sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: inherente a modelos generativos; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles, lo que impide garantizar cobertura linguistica.
- La model card no documenta limitaciones especificas de uso, seguridad ni filtros de contenido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base original de Google y de los checkpoints derivados (assistant, QAT, DFlash).
- El repositorio es una conversion automatica; posibles diferencias de tokenizacion o plantillas de chat respecto al original deben validarse antes de produccion.
- El tamano del repo (288,4 GB) implica que solo deben descargarse las variantes de cuantizacion necesarias.
- Soporte de tool calling, agentes y modo thinking no confirmado; verificar empiricamente antes de disenar pipelines que dependan de ellos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/gemma-4-26B-A4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo assistant: https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Variante QAT q4_0: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Variante QAT q4_0 assistant: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized-assistant
- Variante DFlash: https://huggingface.co/z-lab/gemma-4-26B-A4B-it-DFlash
- Herramienta de conversion: https://github.com/ggml-org/convert
- Llama app: https://llama.app
