# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2` es un modelo de lenguaje de investigación publicado por el usuario `dimitarpg13` dentro de su familia «Semantic Simulation» (generación 3, estudio en escalera o *ladder study* sobre OpenWebText). No es un transformer: se describe como un modelo de lenguaje conservativo, sin atención, construido sobre mecánica lagrangiana y un potencial escalar, con dinámica de segundo orden y 2 «pozos» de modo de Poisson (PM2) junto a un integrador PMX de 16 pasos. El nombre codifica la configuración: dimensión oculta 384 (`d384`), 2 capas (`l2`), variante sin RoPE/sin recurrencia (`none-norc`) y presupuesto de 532,48 M tokens.

El modelo resuelve una pregunta de ablación muy concreta: si el núcleo conservativo de la propuesta necesita dinámica de segundo orden (velocidad e inercia) o si un gemelo de primer orden entrenado igual rinde lo mismo. El resultado declarado por el autor es que el gemelo de primer orden gana: 53,81 frente a 54,71 de perplejidad (−1,6 %), lo que cierra la rama baja de la dosis de pozos sin necesidad de ejecutar K = 4 u K = 8.

Es relevante ahora únicamente como artefacto de investigación reproducible: presupuesto de tokens fijado (532.480.000 = 32.500 pasos × 32 × 512), semilla 0, comparación emparejada por paso y predicción pre-registrada (MS2b) con resultado declarado como acierto. No hay datos publicados de instrucción, alineamiento ni uso comercial práctico; la perplejidad de 54,71 en OpenWebText es alta en términos absolutos, coherente con un modelo de 2 capas y 384 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer; modelo de lenguaje conservativo (*conservative language model*) con potencial escalar, dinámica de segundo orden, sin atención, con 2 pozos de modo de Poisson (PM2) e integrador PMX de 16 pasos |
| Parametros totales | no disponible (el autor no declara el recuento; dimensión oculta 384 y 2 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (bloque de entrenamiento y evaluación; no se declara ventana superior) |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (`pytorch`); repositorio de 0,3 GB; no se indica safetensors |
| Corpus de entrenamiento | Skylion007/openwebtext, 532.480.000 tokens |
| Presupuesto de cómputo | 32.500 pasos × 32 de batch × 512 de bloque, semilla 0 |
| Métrica declarada | Perplejidad de validación 54,71 (bloque 512, media de las tres últimas evaluaciones de 500 pasos) |

## Arquitectura y entrenamiento

La arquitectura abandona el transformer y la atención: el estado se propaga como un sistema físico con un potencial escalar aprendido V_θ, con los pozos de modo de Poisson y los modos rígidos integrados «exactamente como un resorte amortiguado», y con la velocidad transmitida de capa a capa (de ahí la etiqueta `sr2`, segundo orden). El modelo etiqueta además `riemannian-geometry`, `riemannian-geodesics` y `jacobi-metric`, y declara inferencia de memoria constante (`constant-memory-inference`) por no necesitar cache de atención. La variante concreta usa K = 2 pozos de modo de Poisson (potencial gaussiano anisotrópico) frente a las variantes con 0, 16 y 64 pozos de la misma escalera.

El entrenamiento se hizo sobre OpenWebText con un presupuesto idéntico al del resto de la escalera de generación 3: exactamente 532.480.000 tokens, desde el paso 0 con semilla 0, de modo que el modelo y su gemelo de primer orden (`FO-b-PM2-PMX16`) ven los mismos lotes de entrenamiento y evaluación y sus diferencias se miden de forma emparejada (correlación de 0,999 entre cambios de evaluación paso a paso). No se menciona RLHF, DPO ni ajuste por instrucciones en la información disponible. El autor declara salud de ejecución: 0 activaciones de watchdog, 0 capturas de picos, monitor de fugas SCAF limpio en las 7 auditorías y registro del monitor ω·Δt durante el entrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés a nivel de modelo base (sin ajuste por instrucciones).
- Modelado de lenguaje puro: la única métrica declarada es perplejidad de validación sobre OpenWebText.
- Inferencia con memoria constante respecto a la longitud de secuencia, al no usar atención ni cache KV.
- Integración de la dinámica con potencial escalar conservativo (propiedad estructural del diseño, no una funcionalidad de usuario).
- Reproducibilidad de ablación: misma semilla, mismos lotes y mismo presupuesto que su gemelo de primer orden y que el par K = 16.
- Soporte de tool calling / function calling: no disponible (no se declara).
- Soporte de agentes o razonamiento multi-paso: no disponible (no se declara).
- Capacidades multilingües: no disponibles; solo inglés.
- Modo «thinking», visión o audio: no disponibles.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como punto de control para estudiar si la dinámica de segundo orden aporta algo frente a un modelo de primer orden con el mismo presupuesto de tokens, gracias a la comparación emparejada por paso.
- Ablación controlada de mecanismos: al compartir lotes y semilla con `FO-b-PM2-PMX16`, permite medir el efecto aislado del orden de la dinámica con una diferencia declarada de −1,6 % en perplejidad.
- Estudio de la «dosis» de pozos de modo de Poisson: junto con las variantes K = 0, 16 y 64, permite trazar la curva 58,32 → 54,71 → 54,24 → 54,63 y localizar el cruce entre cero y dos pozos.
- Reproducción de experimentos pre-registrados: la predicción MS2b y la regla de dosis (±2 % a K = 2) están declaradas antes de la ejecución, lo que lo hace útil como caso de estudio de metodología.
- Inferencia con memoria acotada en entornos de recursos limitados: al no requerir cache de atención, es adecuado para probar decodificación en CPU o GPU de gama baja con presupuesto de memoria fijo.
- Docencia y divulgación sobre modelos basados en energía: un checkpoint pequeño (repositorio de 0,3 GB) y una arquitectura no estándar facilitan explicar potenciales escalares, integradores simplécticos (BAOAB) y dinámica lagrangiana en un modelo de lenguaje real.
- Generación de texto en inglés sin requisitos de calidad alta: prototipos, pruebas de pipeline de `text-generation` o *smoke tests* de infraestructura donde la perplejidad de 54,71 es suficiente.

## Benchmarks y rendimiento

Único resultado declarado por el autor (no verificado por terceros, `verified: false`):

| Benchmark | Dataset / condición | Métrica | Valor |
|---|---|---|---|
| Modelado de lenguaje | OpenWebText, split validation, bloque 512, media de las 3 últimas evaluaciones de 500 pasos | Perplejidad | 54,71 |
| Modelado de lenguaje | OpenWebText, bloque 512, mejor punto (paso 31.000) | Perplejidad | 52,77 |

Comparación dentro de la escalera de generación 3 (todos con 532,5 M tokens sobre OpenWebText, mismo schedule y semilla):

| Pozos K | Segundo orden | Primer orden | Primer orden frente a segundo |
| 0 | 58,32 | 61,16 | +4,9 % |
| 2 (este modelo) | 54,71 | 53,81 | −1,6 % |
| 16 | 54,24 | 53,73 | −0,9 % |
| 64 | 54,63 | 54,02 | −1,1 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio completo ocupa 0,3 GB, por lo que el checkpoint cabe con holgura en cualquier GPU consumer (cálculo derivado del tamaño del repo, no una cifra declarada por el autor).
- GPU recomendadas: no se declaran; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente, e incluso CPU resulta viable.
- Cabe en GPU consumer: sí, previsiblemente en cualquier RTX o GPU integrada con memoria suficiente; el autor destaca inferencia de memoria constante.
- Opciones de despliegue: PyTorch nativo (librería declarada `pytorch`) y pipeline `text-generation`. No se declara soporte de vLLM, TGI, llama.cpp ni Ollama; al ser una arquitectura sin atención y con integrador propio, estos motores no la soportarían sin implementación específica.
- Latencia y throughput: no disponibles. Nótese que el integrador PMX de 16 pasos por capa implica más cómputo por token que una capa transformer equivalente, pero no hay cifras publicadas.

## Comparativa con modelos similares

No hay comparación publicada con modelos de propósito general. La comparación relevante es interna a la familia Semantic Simulation (generación 3, OpenWebText, 532,5 M tokens, d384, 2 capas):

| Modelo | Orden | Pozos K | Perplejidad (bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `FO-b-PM2-PMX16` | Primero | 2 | 53,81 | cc-by-4.0 | HuggingFace |
| `pm16-pmx16-sr2` (PMX-K16) | Segundo | 16 | 54,24 | cc-by-4.0 | HuggingFace |
| `pm64-pmx16-sr2` (PMX) | Segundo | 64 | 54,63 | cc-by-4.0 | HuggingFace |
| Este modelo (PM2-PMX16) | Segundo | 2 | 54,71 | cc-by-4.0 | HuggingFace |
| `sr2` (sin pozos) | Segundo | 0 | 58,32 | cc-by-4.0 | HuggingFace |
| `FO-b-OWT` (sin pozos, primer orden) | Primero | 0 | 61,16 | cc-by-4.0 | HuggingFace |

En la escalera de TinyStories (315 M tokens) el autor reporta 5,16 (segundo orden, `SO-TS`) frente a 5,13 (primer orden, `FO-TS`), diferencia de −0,6 %. Comparativa con modelos transformer de tamaño similar (p. ej. GPT-2 small o Pythia-160M): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado; no debe usarse como asistente conversacional.
- Perplejidad alta en términos absolutos (54,71 sobre OpenWebText) para un modelo de 532,5 M tokens de entrenamiento y 2 capas; la calidad de generación será baja y la tasa de incoherencias, elevada.
- Ventana de 512 tokens: no apta para contextos largos, documentación extensa ni conversaciones multi-turno largas.
- Solo inglés; no se declara ni evalúa ningún otro idioma.
- Riesgo de alucinación no medido: no hay evaluaciones de veracidad, sesgo ni toxicidad en la información disponible.
- Sesgos conocidos: no disponibles; el corpus es OpenWebText (texto web con los sesgos habituales de ese crawl), pero el autor no publica análisis al respecto.
- Métrica no verificada: el resultado de la model-index está marcado como `verified: false` y procede del propio autor.
- Diferencia frente a su gemelo de primer orden de solo −1,6 %: dentro de la variabilidad de un único run por configuración; el autor mitiga esto con evaluación emparejada por paso, pero no hay réplicas con otras semillas publicadas.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación sin garantías, su uso en producción no está respaldado por evaluaciones de robustez.
- Infraestructura: al no ser transformer ni usar atención, no se beneficia de optimizaciones estándar (flash-attention, vLLM, TGI) y requiere código propio del autor para cargar y ejecutar.
- Sin datos de latencia, throughput ni consumo de memoria medidos, lo que impide planificar capacidad de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Gemelo de primer orden (FO-b-PM2-PMX16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Variante con 64 pozos (PMX): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Variante con 16 pozos (PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Variante sin pozos, segundo orden (SR2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Variante sin pozos, primer orden (FO-b-OWT): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Par de TinyStories, segundo orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- Par de TinyStories, primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- Colección «first vs second order» (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección «Gen 3» (OpenWebText ladder): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Paper, blog o repositorio adicional: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a herramientas de PDF sin relación).
