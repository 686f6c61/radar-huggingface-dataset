# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob` (abreviado por el autor como FO-b-PMX-K16) es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro de la colección «Semantic Simulation, Gen 3». No es un transformer: se trata de un modelo de lenguaje conservativo, sin atención, formulado como un sistema de mecánica lagrangiana con un potencial escalar y entrenado como un flujo de gradiente de primer orden verdadero, sin velocidad ni inercia en ninguna parte del cálculo.

El modelo parte de la variante PMX-K16 (16 pozos de modo de Poisson) y se entrena con un presupuesto de tokens exactamente igual al de su gemelo de segundo orden, de modo que la comparación entre ambos sea pareada. La pregunta que aborda la ficha es experimental: si el núcleo conservativo necesita dinámica de segundo orden o si un modelo de primer orden entrenado igual rinde de forma equivalente. El resultado declarado es que el primer orden queda ligeramente por delante: perplejidad de validación de 53,73 frente a 54,24 del gemelo, un −0,9 %.

Su relevancia es exclusivamente investigadora: aporta evidencia empírica sobre una ablación de mecanismo pre-registrada, con control de fugas (SCAF) y métricas de salud del entrenamiento, sobre un corpus de 532,48 millones de tokens de OpenWebText. No es un modelo orientado a producción ni a instrucciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención; modelo de lenguaje conservativo (energy-based) con potencial escalar y 16 pozos de modo de Poisson (PMX-K16), dinámica de primer orden (flujo de gradiente) |
| Parámetros totales | No disponible (d_model = 384, 2 capas) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (bloque empleado en entrenamiento y evaluación; no se declara una ventana superior) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible explícitamente; repositorio PyTorch (`library_name: pytorch`), 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura se describe como «modelo de lenguaje conservativo»: el estado se evolve según un potencial escalar, con pozos de modo de Poisson que actúan como registros, un potencial gaussiano anisotrópico y formulación geométrica riemanniana (métrica de Jacobi, geodésicas). En esta variante concreta, el modelo se entrena como un flujo de gradiente de primer orden puro: el muelle congelado de los pozos y los modos rígidos se relajan de forma exacta y no existe variable de velocidad. La integración se asocia a los esquemas BAOAB y cFC según las etiquetas del repositorio, y la inferencia es de memoria constante y sin atención.

El entrenamiento usa exactamente 532.480.000 tokens (32.500 pasos × 32 de lote × 512 de bloque) sobre OpenWebText, con el mismo calendario y la misma semilla (semilla 0, desde el paso 0) que su gemelo de segundo orden, de forma que ambos procesos ven los mismos lotes de entrenamiento y evaluación; la correlación entre sus cambios de evaluación paso a paso es de 0,999, lo que permite una comparación pareada. No se documenta RLHF ni DPO. La iniciativa es un estudio de ablación pre-registrado (hipótesis MS2a–MS2e) con monitor de fugas SCAF: 0 activaciones de watchdog, 0 capturas de picos, pérdida máxima de entrenamiento 1,007 veces su media móvil y auditoría de fugas limpia en las 7 comprobaciones.

## Capacidades

- Generación de texto en inglés: modelo de lenguaje autorregresivo orientado a continuación de texto, sin ajuste por instrucciones.
- Modelado de lenguaje a nivel de token con perplejidad medible sobre OpenWebText (bloque 512).
- Inferencia sin atención y con memoria constante, independiente de la longitud de la secuencia procesada.
- Único idioma declarado: inglés; no se declaran capacidades multilingües.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo «thinking».
- Valor principal: servir como artefacto de investigación para reproducir y contrastar una ablación de mecanismo (primer orden frente a segundo orden) bajo presupuesto de tokens emparejado.

## Casos de uso

- Reproducción de la ablación primer orden frente a segundo orden: el modelo se carga junto a su gemelo `...-pm16-pmx16-sr2` y se evalúa con los mismos lotes para verificar la diferencia pareada de −0,87 % por paso declarada por el autor.
- Estudio de modelos de lenguaje sin atención: sirve como referencia para medir qué se pierde y qué se gana al eliminar el mecanismo de atención en un corpus estándar como OpenWebText.
- Investigación en modelos basados en energía y potenciales escalares: permite instrumentar la evolución del potencial y de los pozos de Poisson durante la inferencia.
- Validación de esquemas de integración (BAOAB, cFC) en el entrenamiento de modelos generativos: al haber dos variantes con y sin pozos, se puede aislar el efecto del integrador.
- Docencia y divulgación: con 0,3 GB de repositorio y arquitectura de 2 capas y dimensión 384, es viable ejecutarlo en un portátil para ilustrar formulaciones no transformer de un modelo de lenguaje.
- Pruebas de inferencia de memoria constante: escenario de laboratorio para medir consumo de memoria frente a longitud de secuencia en una arquitectura sin atención.
- No se recomienda su uso en atención al cliente, generación de código en producción ni ningún pipeline comercial: la perplejidad de 53,73 sobre OpenWebText es alta y no hay ajuste por instrucciones.

## Benchmarks y rendimiento

Resultados declarados por el autor (perplejidad de validación en OpenWebText, bloque 512; `verified: false`):

| Modelo | Orden | Pozos de Poisson | Perplejidad (bloque 512) | Diferencia del primer orden frente a su gemelo |
|---|---|---:|---:|---:|
| SR2 | Segundo | 0 | 58,32 | — |
| FO-b-OWT | Primero | 0 | 61,16 | +4,9 % (peor) |
| PMX (64 pozos) | Segundo | 64 | 54,63 | — |
| FO-b-PMX (64 pozos) | Primero | 64 | 54,02 | −1,1 % (mejor) |
| PMX-K16 | Segundo | 16 | 54,24 | — |
| **FO-b-PMX-K16 (este modelo)** | **Primero** | **16** | **53,73** | **−0,9 % (mejor)** |
| PM2-PMX16 | Segundo | 2 | 54,71 | — |
| FO-b-PM2-PMX16 | Primero | 2 | 53,81 | −1,6 % (mejor) |

Detalle de este modelo: perplejidad asentada 53,73 (media de las tres últimas evaluaciones cada 500 pasos: 53,77, 53,81 y 53,61); mejor valor 51,82 en el paso 31.000. Diferencia pareada por paso frente a PMX-K16: −0,87 %, con dispersión de 0,14 %.

Hipótesis pre-registradas: MS2a (hueco de segundo orden con K = 16 entre +1 % y +4 %, probabilidad declarada 50 %) — fallada, −0,9 %; MS2b (el primer orden entre 61,16 y 54,02, probabilidad 65 %) — fallada, 53,73; MS2c (los pozos ayudan más al primer orden, 60 %) — acertada, 13,0 % frente a 7,3 %; MS2d (entrenamiento estable, 75 %) — acertada; MS2e (dentro de ±2 % de PMX-K16 pareado por paso, 55 %) — acertada, −0,87 %.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32, dado que el repositorio completo ocupa 0,3 GB; en la práctica, menos de 2 GB incluyendo activaciones para bloques de 512 tokens.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o cualquier GPU con 4 GB o más; también es viable en CPU.
- GPU de centro de datos (A100, H100) innecesarias para este tamaño; solo tendrían sentido para reentrenar la escalera completa.
- Despliegue: al ser una arquitectura propia sin atención, no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI; la vía prevista es PyTorch nativo con el código del autor.
- Inferencia de memoria constante por diseño, lo que simplifica el despliegue en entornos con memoria limitada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Orden | Pozos | Contexto | Perplejidad (OWT, bloque 512) | Licencia |
|---|---|---|---:|---|---:|---|
| FO-b-PMX-K16 (este) | Conservativa, sin atención, d384 l2 | Primero | 16 | 512 | 53,73 | CC-BY-4.0 |
| PMX-K16 (`...-pm16-pmx16-sr2`) | Conservativa, sin atención, d384 l2 | Segundo | 16 | 512 | 54,24 | CC-BY-4.0 |
| PM2-PMX16 (`...-pm2-pmx16-sr2-fob`) | Conservativa, sin atención, d384 l2 | Primero | 2 | 512 | 53,81 | CC-BY-4.0 |
| FO-b-OWT (`...-sr2-fob`) | Conservativa, sin atención, d384 l2 | Primero | 0 | 512 | 61,16 | CC-BY-4.0 |

No se dispone de comparación con modelos transformer de tamaño equivalente en la información proporcionada; los únicos puntos de referencia publicados pertenecen a la misma familia de ablación.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado con preferencias humanas (sin RLHF/DPO), por lo que no debe usarse como asistente.
- Perplejidad de 53,73 sobre OpenWebText es alta en términos absolutos para generación de texto abierto; la calidad esperada del texto generado es limitada.
- Solo inglés: no hay soporte declarado de otros idiomas, incluido el castellano.
- Contexto efectivo de 512 tokens; no se declara ventana deslizante ni mecanismo de extensión.
- Riesgo de alucinación y de texto incoherente alto en comparación con modelos entrenados a mayor escala; no se han publicado evaluaciones de factualidad.
- Resultados de benchmarks marcados como no verificados (`verified: false`) y procedentes del propio autor.
- Sesgos: no se documenta análisis de sesgos del corpus OpenWebText (texto web sin filtrar), que reproduce los sesgos de su fuente.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está pensado para producción y carece de garantías.
- Dependencia de código propio: al no ser un transformer, no es compatible con los runtimes de inferencia estándar, lo que añade coste de integración.
- Fechas del repositorio (creación 2026-10-24) posteriores a la mayoría de referencias del ecosistema; conviene verificar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Gemelo de segundo orden (PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Colección «Gen 3 first vs second order»: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección «Gen 3 (cFC, BAOAB, live gradients)»: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Variante sin pozos (FO-b-OWT): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Variante con 64 pozos (FO-b-PMX): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob
- Variante con 2 pozos (FO-b-PM2-PMX16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Dataset de entrenamiento: https://huggingface.co/datasets/Skylion007/openwebtext
- Listado de modelos de generación de texto en HuggingFace: https://huggingface.co/models?pipeline_tag=text-generation&sort=created
