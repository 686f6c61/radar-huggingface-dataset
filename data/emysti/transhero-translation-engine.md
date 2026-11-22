# EMYSTI/transhero-translation-engine

## Resumen

TransHero Multilingual Real-Time Translation Engine es un motor de traducción desarrollado por EMYSTI, orientado a la traducción de texto sin conexión en smartphones y dispositivos dedicados. Cubre las seis direcciones de traducción entre chino, japonés e inglés y se distribuye como una preview de investigación móvil con un conjunto de ficheros de modelo de 471 MB (medidos en MB decimales). El modelo no está publicado como pesos abiertos: la model card indica explícitamente que los pesos y el runtime se distribuyen únicamente bajo acuerdos separados, y que EMYSTI ofrece evaluación y despliegue empresarial por acuerdo.

La propuesta de valor del modelo es la eficiencia en dispositivo: según las mediciones históricas publicadas en la model card, sobre un Pixel 7 Pro con cuatro hilos de CPU, TransHero procesa 48 textos cotidianos en 1,30 s y 240 textos complejos en 4,56 s, frente a 1,78 s y 6,45 s de Index-Translate-2B Q4 en el mismo dispositivo. El conjunto de ficheros es también notablemente menor que el de las alternativas medidas (471 MB frente a 1.133-1.312 MB para modelos de 1,8-2B en Q4).

La información pública disponible es limitada: no se detallan arquitectura, número de parámetros, longitud de contexto ni proceso de entrenamiento. La model card se centra en mediciones de rendimiento en dispositivo, tamaños de fichero y escenarios de despliegue empresarial, no en especificaciones técnicas internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona un conjunto de ficheros de 471 MB, sin detallar el esquema de cuantización) |
| Idiomas soportados | chino (zh), japones (ja), ingles (en); seis direcciones de traduccion |
| Licencia | no disponible (distribucion solo bajo acuerdos separados; etiquetado como proprietary) |
| Formato de pesos | no disponible (pesos y runtime no publicos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (transformer, MoE, híbrida u otra), el número de parámetros, la longitud de contexto soportada ni el esquema de cuantización empleado. La model card únicamente describe el tamaño del conjunto de ficheros del modelo (471 MB en MB decimales) y el hecho de que la inferencia se ejecuta en CPU en un smartphone (Pixel 7 Pro, cuatro hilos).

Tampoco se detallan los datos de entrenamiento: no hay información sobre número de tokens, composición del corpus, técnicas de alineación (RLHF, DPO) ni innovaciones técnicas específicas. La model card menciona que cada configuración medida utilizó su propio formato de entrada y que el tiempo se mide hasta la respuesta completa del motor local, pero no describe el pipeline de inferencia. Cualquier afirmación sobre la arquitectura o el entrenamiento sería especulativa y no se incluye aquí.

## Capacidades

- Traducción de texto entre chino, japonés e inglés en las seis direcciones posibles (zh→ja, zh→en, ja→zh, ja→en, en→zh, en→ja).
- Ejecución completamente offline y on-device, sin dependencia de servicios en la nube.
- Orientado a dispositivos móviles y terminales Android, con inferencia en CPU (cuatro hilos en las mediciones publicadas).
- Manejo de textos cotidianos y de textos complejos con contexto: la model card reporta evaluaciones separadas para 48 textos cotidianos y 240 textos complejos con contexto suministrado.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documentan capacidades multilingües más allá de los tres idiomas indicados.

## Casos de uso

- Recepción multilingüe en terminales Android: la model card cita explícitamente pilotos de recepción multilingüe para empresas, gobiernos locales y organizaciones sanitarias; el modelo traduce en las seis direcciones zh/ja/en sin conexión, lo que encaja en mostradores donde la conectividad no es fiable.
- Mostradores municipales: atención a ciudadanos en chino, japonés e inglés con terminología específica del dominio, ya que EMYSTI ofrece personalización de terminología en los despliegues empresariales.
- Servicio minorista: traducción de interacciones de atención al cliente en tienda sobre dispositivos dedicados, con un conjunto de ficheros de 471 MB que reduce el almacenamiento necesario frente a alternativas de 1,1-1,3 GB.
- Traspasos de turno industriales: traducción de instrucciones y traspasos operativos entre equipos con distintos idiomas, uno de los pilotos típicos mencionados por el fabricante.
- Interfaces bilingües en entornos sanitarios: la model card menciona organizaciones sanitarias como cliente objetivo, con despliegue por acuerdo y adaptación de terminología.
- Traducción de textos cotidianos en dispositivos de gama media: las mediciones de 1,30 s para 48 textos cotidianos en un Pixel 7 Pro con cuatro hilos de CPU sugieren viabilidad en hardware móvil sin acelerador dedicado, aunque no se publican requisitos mínimos de memoria ni de CPU.
- Evaluación empresarial previa a despliegue: dado que los pesos no son públicos, el caso de uso práctico pasa por contactar con EMYSTI para una evaluación y un acuerdo de despliegue.

## Benchmarks y rendimiento

La model card publica mediciones de latencia y de usabilidad en un Pixel 7 Pro con cuatro hilos de CPU, no benchmarks académicos estándar (MMLU, HumanEval, etc.). Los datos disponibles son los siguientes:

| Configuracion | 48 textos cotidianos | 240 textos complejos |
|---|---:|---:|
| TransHero | 1,30 s | 4,56 s |
| Index-Translate-2B Q4 | 1,78 s | 6,45 s |
| Tencent Hy-MT2-1.8B 1.25-bit (configuracion de prueba) | 1,84 s | 6,85 s |

| Configuracion | Traducciones usables (cotidianos) | Traducciones usables (complejos) |
|---|---:|---:|
| TransHero | 47/48 | 191/240 |
| Index-Translate-2B Q4 (archivado) | 42/48 | 161/240 |

La model card indica que la usabilidad fue evaluada por un revisor de IA contra el texto original y el contexto suministrado, y que el conjunto complejo contiene 40 escenarios en seis direcciones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET u otros) en la información disponible.

Tamaños de fichero medidos (MB decimales):

| Configuracion | MB |
|---|---:|
| TransHero | 471 |
| Tencent Hy-MT2-1.8B Q4 | 1.133 |
| Qwen3.5-2B Q4 | 1.281 |
| Index-Translate-2B Q4 | 1.312 |
| Index-Translate-9B Q6 | 7.559 |
| Tencent Hy-MT2-7B Q8 | 7.982 |
| Google Gemma 4 E2B, F16 GGUF | 9.311 |

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está orientado a inferencia en CPU en dispositivos móviles, no se publican requisitos de VRAM.
- GPU recomendadas: no disponible; las mediciones publicadas usan CPU (cuatro hilos) en un Pixel 7 Pro.
- Cabe en GPU de consumo: no disponible; no se documenta soporte de GPU.
- Almacenamiento: el conjunto de ficheros del modelo ocupa 471 MB (MB decimales) según la model card.
- Opciones de despliegue: el runtime no es público y se distribuye solo bajo acuerdo; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia: 1,30 s para 48 textos cotidianos y 4,56 s para 240 textos complejos en Pixel 7 Pro con cuatro hilos de CPU (mediciones históricas del fabricante).
- Throughput: no disponible de forma explícita; puede derivarse de las cifras anteriores, pero la model card no lo publica como métrica independiente.
- Memoria y condiciones sostenidas: la model card advierte que la selección de dispositivo depende también de memoria, runtime y condiciones operativas sostenidas, sin dar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de ficheros medido | Licencia / disponibilidad | Rendimiento en dispositivo |
|---|---|---|---|---|---|
| TransHero | no disponible | no disponible | 471 MB | Propietaria, solo por acuerdo | 1,30 s / 4,56 s; 47/48 y 191/240 usables |
| Index-Translate-2B Q4 | 2B (según nombre) | no disponible | 1.312 MB | no disponible | 1,78 s / 6,45 s; 42/48 y 161/240 usables |
| Tencent Hy-MT2-1.8B (1.25-bit, prueba) | 1,8B (según nombre) | no disponible | 1.133 MB (Q4) | no disponible | 1,84 s / 6,85 s |
| Qwen3.5-2B Q4 | 2B (según nombre) | no disponible | 1.281 MB | no disponible | no medido en la model card |

La comparación se limita a las configuraciones que la propia model card mide; no se dispone de datos independientes de terceros ni de resultados en benchmarks estándar para ninguno de los modelos listados en esta tabla.

## Limitaciones y advertencias

- Pesos no públicos: el modelo no puede descargarse ni evaluarse de forma independiente; el acceso requiere un acuerdo con EMYSTI.
- Licencia no disponible: la etiqueta "proprietary" y la distribución solo bajo acuerdo implican restricciones para uso comercial, modificación y redistribución que no se detallan públicamente.
- Idiomas limitados: solo chino, japonés e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Sin datos de arquitectura ni de entrenamiento: imposible verificar el origen de los datos, el proceso de alineación o los sesgos del modelo.
- Evaluación de usabilidad por revisor de IA: la model card indica que la usabilidad se evaluó con un revisor de IA contra el texto original, no con evaluadores humanos ni métricas automáticas estándar (BLEU, COMET); los resultados deben interpretarse con cautela.
- Mediciones históricas y de un solo dispositivo: todas las cifras de latencia provienen de un Pixel 7 Pro con cuatro hilos de CPU y de ejecuciones históricas; no se garantiza su reproducibilidad en otro hardware.
- Riesgo de alucinación y errores en textos complejos: 191/240 traducciones complejas usables implica que aproximadamente el 20 % de los textos complejos evaluados no se consideraron usables.
- Sin información sobre longitud de contexto: se desconoce el límite de entrada y cómo se degrada en documentos largos.
- Sin datos de sesgos: no se publica ninguna evaluación de sesgos lingüísticos, culturales o de género.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/EMYSTI/transhero-translation-engine
- Despliegue empresarial y personalización de terminología: https://www.emysti.net/transhero-engine/#enterprise
- Benchmarks y traducciones comparativas: https://www.emysti.net/transhero-engine/#speed-comparison
- Notas de campo y extractos de traducción: https://www.emysti.net/transhero-engine/field-notes/
- Contacto: https://www.emysti.net/contact.html
- Página oficial en chino: https://www.emysti.net/transhero-engine/zh/
- Página oficial en japonés: https://www.emysti.net/transhero-engine/ja/
