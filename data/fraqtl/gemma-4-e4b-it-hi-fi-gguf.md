# fraQtl/Gemma-4-E4B-it-Hi-Fi-GGUF

## Resumen

Gemma-4-E4B-it-Hi-Fi-GGUF es una cuantización GGUF del modelo instructivo `google/gemma-4-E4B-it`, publicada por el usuario fraQtl. No es un modelo entrenado desde cero, sino una reconstrucción Q4_K_M orientada a preservar la fidelidad respecto al checkpoint original en bf16. El autor la presenta como una cuantización "calibration-aware" y afirma que reduce la divergencia KL frente al modelo original en comparación con la cuantización Q4_K_M de referencia de bartowski, manteniendo el mismo tamaño en disco (5,40 GB).

El modelo base pertenece a la familia Gemma de Google y, por el nombre (E4B), se corresponde con una variante de 4 000 millones de parámetros efectivos; sin embargo, el dato real de safetensors del repositorio indica 7 518 069 290 parámetros totales, lo que sugiere una arquitectura con parámetros totales superiores a los activos. La información disponible no permite confirmar la arquitectura exacta ni la longitud de contexto del modelo base.

La relevancia de esta publicación es práctica: ofrece artefactos GGUF listos para inferencia en llama.cpp en dispositivos de borde (portátiles con Snapdragon X, teléfonos), con métricas de fidelidad medidas sobre los ficheros exactos del repositorio y trazabilidad de hashes. Está pensada para desarrolladores que necesitan ejecutar un modelo instructivo de tamaño medio en hardware limitado con una pérdida de calidad controlada y documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/gemma-4-E4B-it; no se detalla en la informacion proporcionada) |
| Parametros totales | 7 518 069 290 (dato real de safetensors) |
| Parametros activos | no disponible (el sufijo E4B sugiere 4B efectivos, pero no se confirma en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (build principal, 5,40 GB); build para telefono con PLE degradado a Q4_K (aprox. 4,59 GB) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | GGUF (safetensors solo como dato de conteo de parametros del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `google/gemma-4-E4B-it` en los materiales proporcionados: no se especifica si es un transformer denso, un modelo con mezcla de expertos ni detalles de atención. El sufijo E4B y la diferencia entre parámetros totales (7,52 mil millones) y el nombre del modelo apuntan a una separación entre parámetros totales y efectivos, pero no se confirma el mecanismo.

Lo que sí está documentado es el proceso de cuantización. fraQtl aplica una receta "calibration-aware" sobre el checkpoint bf16 original, guiada por una imatrix, y publica el hash de la receta y el sha256 de cada artefacto. La métrica de fidelidad es la divergencia KL simétrica top-20 medida contra un profesor Q8 del checkpoint original en bf16, sobre dos slices (código/matemáticas y general), con tres ejecuciones independientes y deriva entre ejecuciones de 0,0. El autor reporta además un cribado GSM8K de 200 ejemplos con decodificación de cadena de pensamiento instruida y semilla 0, y perplejidad en Wikitext-2 como métrica de sanidad. No se documenta ningún entrenamiento adicional, RLHF ni DPO sobre el modelo base.

## Capacidades

- Generación de texto conversacional en formato instructivo, heredada del modelo base `gemma-4-E4B-it`.
- Razonamiento y matemáticas: el autor evalúa con GSM8K en modo 0-shot con cadena de pensamiento instruida, lo que indica capacidad de razonamiento aritmético multi-paso.
- Código y matemáticas como slice específico de evaluación de fidelidad, lo que sugiere uso previsto en tareas técnicas.
- Inferencia en dispositivo: los artefactos están pensados para llama.cpp en portátiles de clase Snapdragon X y teléfonos.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` del repositorio indica que puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en portátil: con 5,40 GB en Q4_K_M y una divergencia KL de 0,0387 en el slice de código/matemáticas, el modelo es adecuado para autocompletado y explicación de código en un portátil sin GPU dedicada, ejecutado con llama.cpp.
- Razonamiento matemático en el borde: el cribado GSM8K del autor sitúa esta build en el mismo rango que la referencia (84,0 % para bartowski Q4_K_M), por lo que sirve para resolver problemas aritméticos paso a paso en entornos sin conectividad.
- Despliegue en teléfono: la build `...-Phone.gguf` (aprox. 4,59 GB) está diseñada para ser neutral en velocidad al mantener idénticos los bytes relevantes para ancho de banda, lo que permite integrar el modelo en aplicaciones móviles con presupuesto de memoria ajustado.
- Procesamiento de documentos técnicos offline: al ser un modelo instructivo de tamaño medio con buen comportamiento en código y matemáticas, puede resumir y extraer datos de documentación técnica en estaciones de trabajo aisladas de la red.
- Servicio de generación de texto autohospedado: la etiqueta `endpoints_compatible` y el formato GGUF permiten montar un endpoint de inferencia ligero para prototipos internos sin depender de APIs externas.
- Evaluación y benchmarking de cuantizaciones: el repositorio incluye imatrix, hash de receta y sha256 de cada artefacto, lo que lo convierte en una referencia reproducible para comparar recetas de cuantización sobre el mismo modelo base.

## Benchmarks y rendimiento

| Metrica | fraQtl Hi-Fi Q4_K_M | bartowski Q4_K_M (baseline) | Delta |
|---|---:|---:|---:|
| Tamano | 5,40 GB | 5,40 GB | 0 |
| KLD code/math (menor = mejor) | 0,0387 | 0,0462 | −16,2 % |
| KLD general (menor = mejor) | 0,0593 | 0,0619 | −4,2 % |
| Top-1 agreement code/math | 0,948 | 0,948 | 0 |
| Top-1 agreement general | 0,910 | 0,910 | 0 |
| GSM8K 0-shot CoT (n=200, seed 0) | "en el mismo rango" (sin cifra propia) | 84,0 % | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. Las métricas anteriores son de fidelidad de cuantización, no de capacidad absoluta del modelo.

## Requisitos de hardware

- VRAM estimada: el build principal ocupa 5,40 GB en disco; en inferencia con llama.cpp se recomienda al menos 6-7 GB de memoria disponible para pesos y contexto, cifra orientativa no confirmada en la información proporcionada.
- Build para teléfono: aproximadamente 4,59 GB, pensada para dispositivos con 6-8 GB de RAM.
- GPU recomendadas: no disponible en la información proporcionada; el autor orienta el uso a portátiles de clase Snapdragon X y teléfonos, es decir, CPU y aceleradores integrados.
- Cabe en GPU de consumo: por tamaño, es compatible con tarjetas de 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060), aunque esta compatibilidad no se afirma explícitamente en la información disponible.
- Opciones de despliegue: llama.cpp (motor usado por el autor para las mediciones); la etiqueta `endpoints_compatible` sugiere también despliegue vía endpoints de Hugging Face. No se confirma soporte de vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible. El autor solo indica que la build para teléfono es "neutral en velocidad por construcción".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| fraQtl Gemma-4-E4B-it Hi-Fi Q4_K_M | 7,52 B totales | no disponible | GGUF | gemma | KLD 0,0387 / 0,0593 |
| bartowski Gemma-4-E4B-it Q4_K_M | mismo modelo base | no disponible | GGUF | gemma | KLD 0,0462 / 0,0619 |
| fraQtl Gemma-4-E2B Hi-Fi (misma línea) | no disponible | no disponible | GGUF | gemma | Reducción de KLD de −36 % / −27 % según el autor |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una cuantización Q4_K_M: introduce pérdida respecto al bf16 original, con divergencia KL de 0,0387 en código/matemáticas y 0,0593 en general. No es equivalente al modelo sin cuantizar.
- Los propios datos del autor indican que el margen de mejora es menor que en la variante E2B (−16,2 % / −4,2 % frente a −36 % / −27 %), porque el mayor tamaño del E4B deja menos holgura a la cuantización.
- No se han publicado métricas de capacidad absoluta (MMLU, HumanEval) ni comparaciones con modelos de otros desarrolladores.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingüe concreto.
- Longitud de contexto no disponible: no debe asumirse una ventana larga sin verificar el modelo base.
- El repositorio tiene 0 likes y 492 descargas en el momento de la consulta, con un único autor comunitario; no es un artefacto oficial de Google.
- Licencia "gemma": el uso comercial está sujeto a los términos de la licencia Gemma de Google, que impone restricciones y obligaciones específicas; debe revisarse antes de un despliegue en producción.
- Riesgo de alucinación y sesgos: inherentes al modelo base; no se documentan evaluaciones de sesgo ni de seguridad en la información proporcionada.
- La evaluación de fidelidad se limita a dos slices y a un cribado GSM8K de 200 ejemplos; no cubre todas las tareas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Gemma-4-E4B-it-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Imagen del repositorio: https://huggingface.co/fraQtl/Gemma-4-E4B-it-Hi-Fi-GGUF/resolve/main/Gemma-4-E4B-it-Hi-Fi-GGUF.png
- Cuantización de referencia (bartowski Q4_K_M): no disponible el enlace exacto en la información proporcionada
- llama.cpp: no disponible el enlace en la información proporcionada
- Paper, blog o demo adicionales: no disponible
