# OfflineBase/Glimmer-30B-2026-Knowledge-GGUF

## Resumen
Glimmer 30B 2026 Knowledge GGUF es un ajuste fino comunitario del modelo base Muse Glimmer 30B de Meta, publicado por el usuario OfflineBase. Su objetivo es actualizar el conocimiento del modelo, que originalmente se detiene el 4 de enero de 2026, con noticias y eventos ocurridos entre esa fecha y el 29 de octubre de 2026, ademas de mejorar su calibracion para admitir desconocimiento en lugar de inventar respuestas. No es un lanzamiento oficial de Meta y el autor lo declara explicitamente.

El modelo se distribuye exclusivamente en formato GGUF cuantizado para su uso con llama.cpp, con un total de 27.854.794.240 parametros (aproximadamente 27,9 mil millones) en los pesos originales. Se ofrece en varias cuantizaciones que van desde BF16 hasta IQ1_S, lo que permite desplegarlo en hardware muy diverso, desde GPUs de consumo hasta entornos con memoria muy limitada, a costa de perder conocimiento en los formatos mas agresivos.

La relevancia de este modelo radica en su enfoque en la honestidad y la actualizacion de conocimiento: el autor reporta mejoras medibles tanto en preguntas sobre 2026 como en la tasa de respuestas "no lo se", aunque con limitaciones importantes que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Muse Glimmer 30B; ajuste fino mediante LoRA) |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0 (no incluido en este release), Q4_K_M, IQ2_XXS, IQ1_M, IQ1_S |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0-and-muse-model-license (Apache 2.0 mas condiciones de la Muse Model License) |
| Formato de pesos | GGUF (llama.cpp); los pesos BF16 fusionados estan en otro repositorio |

## Arquitectura y entrenamiento
El modelo parte de Muse Glimmer 30B de Meta y se ajusta mediante LoRA de rango 64 y alpha 64 aplicado a todas las capas de proyeccion del lenguaje. El codificador de vision permanece congelado y sin cambios. El entrenamiento se realizo en tres fases: una primera fase de conocimiento con 199.309 ejemplos derivados de unas 43.000 piezas, una segunda fase con 520.895 ejemplos que anaden preguntas nuevas y pasajes adicionales centrados en noticias de IA, Meta y actualidad mundial, y una fase B de honestidad y razonamiento con 60.000 ejemplos que incluyen respuestas honestas de "no lo se", preguntas con premisas falsas, preguntas posteriores al corte de conocimiento y un 30% de ejemplos de razonamiento generados por el modelo base.

Los hiperparametros compartidos incluyen AdamW de 8 bits, schedule coseno con un 3% de warmup, batch efectivo de 32, longitud maxima de 2.048 tokens y calculo de perdida solo sobre las respuestas. El entrenamiento se llevo a cabo con Unsloth sobre 8 GPU A100 de 80 GB. El modelo nunca se entreno con articulos en bruto: otros modelos leyeron pasajes cortos y generaron preguntas y respuestas. Ademas, las fases 1 y 2 incorporan 6.739 respuestas de replay (respuestas del propio modelo base a prompts de Dolly 15k) para preservar habilidades generales. La fase B repara el formato de razonamiento que la fase 2 habia roto.

## Capacidades
- Generacion de texto conversacional en ingles.
- Actualizacion de conocimiento sobre eventos y noticias de 2026 (ventana del 4 de enero al 29 de octubre de 2026).
- Mayor propension a admitir desconocimiento ante preguntas fuera de su conocimiento o con premisas falsas.
- Razonamiento (con formato reparado en la fase B), aunque el autor recomienda desactivarlo para preguntas factuales.
- Capacidades de vision heredadas del modelo base, con el codificador congelado y sin cambios respecto al original.
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de agentes o razonamiento multi-paso mas alla del modo de razonamiento basico.
- Capacidades multilingues limitadas al ingles.

## Casos de uso
- Consulta de actualidad de 2026 en ingles: el modelo puede responder preguntas sobre eventos ocurridos entre enero y octubre de 2026 con una tasa de acierto del 29,0% en preguntas reformuladas de sus pasajes de entrenamiento, adecuado para prototipos de asistentes informativos con conocimiento temporal reciente.
- Despliegue en hardware de consumo: las cuantizaciones IQ2_XXS, IQ1_M e IQ1_S permiten ejecutar el modelo en equipos con memoria limitada mediante llama.cpp, aunque con perdida significativa de conocimiento (17,12%, 11,12% y 8,32% respectivamente en las preguntas de 2026).
- Sistemas que priorizan la honestidad: la fase B reduce la invencion de respuestas, admitiendo desconocimiento el 44,7% de las veces en un test de honestidad, lo que lo hace util en entornos donde una respuesta "no lo se" es preferible a una alucinacion.
- Investigacion sobre calibracion y honestidad en modelos de lenguaje: el modelo y sus fases intermedias (fase 2 frente a fase B) permiten estudiar el equilibrio entre conocimiento y abstención.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece datos comparativos del rendimiento de distintas cuantizaciones (BF16, Q4_K_M, IQ2_XXS, IQ1_M, IQ1_S) sobre las mismas pruebas, util para decidir el compromiso entre tamano y calidad.
- Ajuste fino posterior: los pesos BF16 fusionados y el adaptador LoRA estan disponibles en repositorios separados, lo que permite continuar el entrenamiento o adaptarlo a dominios concretos.
- Prototipos de asistentes con vision: al conservar el codificador de vision del modelo base, puede emplearse en tareas multimodales basicas, aunque no se documentan evaluaciones especificas de vision en este ajuste.

## Benchmarks y rendimiento
Todos los resultados reportados por el autor usan decodificacion greedy (temperatura 0).

| Prueba | Este modelo (BF16) | Fase 2 (BF16) | Base (Q4_K_M) |
|---|---|---|---|
| 2.500 preguntas sobre 2026 | 29,0% | 30,2% | 18,4% |
| Hechos anteriores a 2026 (40 preguntas) | 40/40 | no disponible | 40/40 |
| Preguntas sobre Meta (137) | 35,8% | 40,9% | 14,6% |
| 246 eventos destacados de 2026 | 69,1% | 70,7% | 26,0% |
| Test de honestidad (admite no saber) | 44,7% | no disponible | 26,3% |

Rendimiento por cuantizacion en las 2.500 preguntas de 2026:

| Archivo | Aciertos | Hechos antiguos |
|---|---|---|
| BF16 | 29,0% | 40/40 |
| Q8_0 (no incluido) | 28,96% | 40/40 |
| Q4_K_M | 28,84% | 40/40 |
| IQ2_XXS | 17,12% | 40/40 |
| IQ1_M | 11,12% | 37/40 |
| IQ1_S | 8,32% | 36/40 |
| Base Q4_K_M | 18,4% | 40/40 |
| Base IQ1_S | 1,6% | 30/40 |

Por tema en los 246 eventos destacados: IA 56,4%, Meta 57,1%, mundo 77,2%. El autor advierte que las preguntas de 2026 son reformulaciones de pasajes vistos en entrenamiento, por lo que el 29% mide recuerdo de hechos reformulados, no conocimiento general de 2026.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el tamano del repositorio es de 38,5 GB, lo que da una orientacion del espacio total necesario para todas las cuantizaciones.
- El modelo base se entreno en 8 GPU A100 de 80 GB, pero la inferencia cuantizada requiere mucho menos.
- Las cuantizaciones IQ1_M e IQ1_S estan pensadas para entornos con memoria muy limitada y podrian caber en GPUs de consumo, aunque no se especifican requisitos exactos.
- Q4_K_M e IQ2_XXS requieren mas memoria y probablemente GPUs de gama alta o multiples GPUs, sin datos concretos disponibles.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el autor menciona compatibilidad con endpoints, pero no detalla otros frameworks como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La unica comparacion disponible es con el propio modelo base Muse Glimmer 30B y con la fase 2 intermedia del ajuste, cuyos resultados se recogen en la seccion de benchmarks.

## Limitaciones y advertencias
- Solo disponible en ingles; no se documenta soporte de otros idiomas.
- El conocimiento de 2026 se limita a la ventana del 4 de enero al 29 de octubre de 2026 y se evalua sobre preguntas reformuladas de pasajes de entrenamiento, por lo que el rendimiento real en preguntas nuevas puede ser inferior.
- Aun admite desconocimiento solo el 44,7% de las veces en el test de honestidad: sigue inventando respuestas en el 55,3% de los casos en que no sabe.
- Las cuantizaciones agresivas (IQ1_M, IQ1_S) pierden conocimiento de forma severa y olvidan algunos hechos anteriores a 2026 (3 y 4 de 40, respectivamente).
- El autor recomienda desactivar el razonamiento para preguntas factuales, ya que el razonamiento activado aumenta las invenciones.
- Restriccion de edad: solo para mayores de 18 anos.
- Licencia sujeta a las condiciones de la Muse Model License ademas de Apache 2.0; es necesario revisar el archivo MUSE_MODEL_LICENSE.md antes de un uso comercial.
- No es un lanzamiento oficial de Meta, que no ha revisado ni respaldado el modelo.
- No se documentan capacidades de tool calling ni de agentes.
- Los resultados se midieron con decodificacion greedy, mientras que Meta recomienda muestreo al servir el modelo; los numeros deben interpretarse como comparaciones entre modelos, no como el rendimiento esperado en un chat servido.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-GGUF
- Pesos BF16 fusionados: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge
- Adaptador LoRA: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-LoRA
- Licencia Muse Model License: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-GGUF/blob/main/MUSE_MODEL_LICENSE.md
- Modelo base: meta-models/Muse-Glimmer-30B (revision cec94fcfd6512f2cfe708138c32533b346ea4f69)
