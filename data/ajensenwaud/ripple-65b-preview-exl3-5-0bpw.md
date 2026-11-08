# ajensenwaud/Ripple-65B-Preview-exl3-5.0bpw

## Resumen

Ripple-65B-Preview es un modelo de lenguaje de tipo transformer denso con 65.000 millones de parámetros desarrollado por Ricursive Intelligence. Se trata de la variante de propósito general del modelo propietario que alimenta su plataforma de diseño de chips con IA, publicada como pesos abiertos bajo licencia Apache-2.0. El modelo se preentrenó sobre 12 billones de tokens y admite una longitud de contexto de hasta 1 millón de tokens, lo que lo sitúa en la categoría de modelos de contexto largo orientados a cargas de trabajo de agente y razonamiento multi-paso.

La ficha que nos ocupa no documenta el modelo original, sino una cuantización comunitaria en formato EXL3 a 5,0 bits por peso, publicada por el usuario ajensenwaud. El pack está pensado para servirse con exllamav3 en dos estaciones NVIDIA DGX Spark (GB10) mediante paralelismo tensorial, manteniendo la ventana completa de 1M tokens. El autor reporta que los pesos ocupan 39 GB repartidos en 5 shards (19,8 GiB por Spark con TP=2) y que la cuantización preserva el 97,9 % de coincidencia en el token top-1 respecto a los pesos BF16 originales.

Su relevancia actual radica en que demuestra que un modelo denso de 65B con contexto de 1M puede ejecutarse en hardware de gama de escritorio para centros de datos pequeños (dos GB10), a costa de un throughput de decodificación modesto en modo plano (9,9 tok/s) que se compensa parcialmente con el drafter especulativo DFlash2 del autor original (hasta 46,6 tok/s en tareas de código).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles internos no disponibles; soporte de value residual en exllamav3) |
| Parametros totales | 65B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | hasta 1M tokens |
| Tipos de cuantizacion | EXL3 a 5,0 bpw (cabeza a 8 bpw, embeddings a 16 bpw); existe tambien un pack de 6,0 bpw |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | EXL3 (exllamav3), 5 shards, 39 GB en total |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parámetros preentrenado sobre 12 billones de tokens, según la nota de publicación de Ricursive Intelligence. La documentación disponible no detalla la composición del dataset ni si hubo fases de ajuste fino supervisado, RLHF o DPO; la model card del pack cuantizado tampoco los menciona. Ricursive indica que optimizó la arquitectura para sus plataformas de entrenamiento y servicio, aunque no se especifican las innovaciones concretas.

El detalle técnico más relevante que sí aparece en la información disponible es que el pack EXL3 requiere una rama específica de exllamav3 (`feat/ricursive`, de auryn-macmillan) para cargar el modelo, porque la versión upstream 1.6.6 no soporta el mecanismo de *value residual* que emplea la arquitectura. La conversión se realizó con exllamav3 1.6.6 más esa rama, con parámetros `-b 5.0 -hb 8 -cr 250 -cc 2048 -cb mul1`. El autor reporta además que la decodificación especulativa se apoya en un drafter separado, Ripple-65B-Preview-DFlash2, en BF16, que no va incluido en el pack.

## Capacidades

- Generación de texto en inglés con ventana de contexto de hasta 1M tokens.
- Razonamiento y matemáticas: el pack reporta un 97,4 % en GSM8K (500 ítems) y un 75,0 % en las primeras 40 preguntas de MMLU-Pro.
- Generación de código: es la tarea con mayor throughput con el drafter (46,6 tok/s) y una de las evaluadas en la comparativa de calidad.
- Llamada a herramientas (*tool calling*): el autor incluye una tarea de "agent tool call" en sus mediciones de velocidad, lo que confirma soporte de flujos de agente.
- Razonamiento multi-paso y cargas de agente: el contexto de 1M tokens permite mantener historiales largos y estados intermedios extensos.
- Decodificación especulativa compatible mediante el drafter DFlash2 del autor original.
- Multilingüe: limitado al inglés según la model card; no se documentan otras lenguas.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Diseño asistido de circuitos y flujos EDA: el modelo es la variante pública del motor que Ricursive usa en su plataforma de diseño de chips, por lo que encaja en tareas de generación y revisión de especificaciones, scripts de verificación y documentación técnica de gran extensión.
- Análisis de repositorios completos: con 1M tokens de contexto puede ingerir árboles de código y ficheros de configuración extensos en una sola pasada, útil para auditorías de seguridad o refactorizaciones planificadas.
- Agentes autónomos con memoria larga: el soporte de *tool calling* y la ventana de contexto permiten mantener trazas de herramientas, resultados intermedios y planes durante muchas iteraciones sin truncar.
- Generación de código en producción: el throughput con DFlash2 (46,6 tok/s) lo hace viable para autocompletado y generación de parches en pipelines de CI/CD, siempre que se acepte la dependencia de exllamav3 y del drafter.
- Evaluación de calidad de cuantizaciones: el pack incluye métricas reproducibles (perplejidad en WikiText-2, GSM8K, MMLU-Pro y coincidencia top-1 frente a BF16), lo que lo convierte en un caso de referencia para estudiar el impacto de EXL3 a 5 bpw en modelos densos de 65B.
- Despliegue en hardware de borde para centros de datos pequeños: dos DGX Spark (GB10) con TP=2 permiten servir el modelo completo con contexto de 1M, adecuado para equipos que no pueden alquilar clústeres de GPUs de gama alta.
- Procesamiento de documentación técnica y contractual de gran volumen: resúmenes, extracción de cláusulas y preguntas sobre corpus de cientos de miles de tokens en una sola llamada.

## Benchmarks y rendimiento

Calidad frente a los pesos BF16 originales (96 filas de 2.048 tokens, temperatura 0,6, mismos ítems para ambos packs):

| Metrica | 5.0 bpw (este pack) | 6.0 bpw | BF16 |
|---|---|---|---|
| Coincidencia de token top-1 con BF16 | 97,9 % | 98,9 % | 100 % |
| Perplejidad WikiText-2 (64 x 2048) | 9,270 | 9,248 | 9,245 |
| GSM8K (500) | 97,4 % | 97,6 % | no disponible |
| MMLU-Pro (primeros 40) | 75,0 % | 77,5 % | no disponible |

El autor indica que ambos packs empatan en ambas tareas (McNemar p = 1,0) y advierte que MMLU-Pro es una comprobación de solo 40 ítems, con un 10 % de respuestas que alcanzan el límite de 30K tokens.

Velocidad en dos DGX Sparks, una sola secuencia:

| Tarea | Decodificacion plana | Con DFlash2 |
|---|---|---|
| Codigo | 9,9 tok/s | 46,6 tok/s |
| Llamada a herramienta de agente | 9,9 tok/s | 31,7 tok/s |
| Chat | 9,9 tok/s | 19,2 tok/s |

No se han publicado en la información disponible resultados de benchmarks del modelo base frente a otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada: 39 GB de pesos en EXL3 5,0 bpw; con TP=2 se reparten en 19,8 GiB por dispositivo, más overhead de caché KV para la ventana de contexto utilizada.
- Hardware de referencia del autor: dos NVIDIA DGX Spark (GB10) con paralelismo tensorial, sirviendo el contexto completo de 1M tokens.
- GPU consumer: no cabe en una RTX 4090 (24 GB) a 5,0 bpw con contexto largo; requeriría al menos dos dispositivos o cuantizaciones más agresivas no documentadas.
- Opciones de despliegue: exllamav3 con la rama `feat/ricursive` (obligatoria para el value residual); la versión upstream 1.6.6 no puede cargar el pack. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Decodificación especulativa: requiere el drafter Ripple-65B-Preview-DFlash2 en BF16, alojado aparte.
- Latencia y throughput: 9,9 tok/s en decodificación plana y entre 19,2 y 46,6 tok/s con DFlash2 según la tarea, medidos en dos DGX Sparks con una sola secuencia.
- Reproducibilidad: el autor publica el recetario completo en el repositorio `ajensenwaud/ripplespark-2dgx`, con los JSON de mediciones en bruto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Ripple-65B-Preview (EXL3 5.0 bpw, este pack) | 65B denso | 1M | Apache-2.0 | EXL3, 39 GB, 5 shards | Requiere exllamav3 `feat/ricursive` y drafter externo para velocidad |
| Ripple-65B-Preview (BF16, original) | 65B denso | 1M | Apache-2.0 | BF16 en Hugging Face | Referencia de calidad; sin cuantizar |
| Ripple-65B-Preview (EXL3 6.0 bpw) | 65B denso | 1M | Apache-2.0 | EXL3 | Mejor coincidencia top-1 (98,9 %) a costa de más peso |
| Otros modelos de 65B-70B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos alternativos de la misma categoría con la que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de calibración; el 10 % de respuestas de MMLU-Pro que agotan el límite de 30K tokens sugiere derivas en razonamiento largo.
- Dependencia de una rama no upstream de exllamav3: el pack no carga con la versión estable 1.6.6, lo que complica el mantenimiento y la actualización en producción.
- El drafter DFlash2 no está incluido y debe descargarse por separado en BF16, con el coste de memoria adicional que ello implica.
- Throughput limitado en modo plano (9,9 tok/s): sin decodificación especulativa, la experiencia interactiva es lenta.
- Contexto de 1M tokens: la caché KV a esa longitud exige planificación de memoria; no se documentan cifras de consumo para ventanas máximas.
- Evaluaciones de calidad con muestras pequeñas: MMLU-Pro se midió sobre 40 ítems y la comparación de packs usa 96 filas de 2.048 tokens, por lo que las diferencias entre 5,0 y 6,0 bpw no son concluyentes.
- Licencia Apache-2.0: permite uso comercial, pero el autor del pack no ofrece garantías y la responsabilidad sobre el modelo base recae en Ricursive.
- Sin descargas ni valoraciones en el momento de la consulta: ecosistema de validación comunitaria prácticamente inexistente.

## Enlaces

- Pack cuantizado en Hugging Face: https://huggingface.co/ajensenwaud/Ripple-65B-Preview-exl3-5.0bpw
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Drafter DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Página del modelo en Ricursive Intelligence: https://www.ricursive.com/ripple
- Recetario de despliegue en dos DGX Spark: https://github.com/ajensenwaud/ripplespark-2dgx
