# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob

## Resumen

semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro de la familia Semantic Simulation (Gen 3). No es un transformer: se trata de un modelo de lenguaje conservativo basado en un potencial escalar y mecánica lagrangiana, con inferencia de memoria constante y sin mecanismo de atención. Este checkpoint concreto entrena el modelo PMX-K16 (16 pozos de modo de Poisson) como un flujo de gradiente de primer orden verdadero, relajando exactamente el muelle congelado de los pozos y los modos rígidos, sin término de velocidad.

El modelo resuelve una pregunta de investigación concreta y pre-registrada: si el núcleo conservativo de Semantic Simulation necesita dinámica de segundo orden (velocidad e inercia) o si un modelo de primer orden entrenado de la misma forma rinde igual. La respuesta declarada por el autor es que, con 16 pozos, el primer orden supera ligeramente a su gemelo de segundo orden (53,73 frente a 54,24 de perplejidad en validación de OpenWebText), mientras que sin pozos el segundo orden aportaba un 4,9% de mejora.

Es relevante ahora como pieza de un estudio de ablación de mecanismos (ladder study) con presupuesto de tokens igualado (532,5M tokens) y evaluación emparejada por paso, no como modelo listo para producción. Su interés es científico: explora alternativas no-transformer, sin atención, con memoria constante en inferencia y con dinámica derivada de un potencial anisótropo gaussiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (parflm) basado en potencial escalar y mecánica lagrangiana; no-transformer, sin atención, con pozos de modo de Poisson (16) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (librería pytorch; repositorio de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura se describe como un modelo de lenguaje conservativo (parflm) con un potencial escalar anisótropo gaussiano, integrado mediante el esquema BAOAB (cfc) y con pozos de modo de Poisson (16 en este checkpoint, designados PMX-K16). No utiliza atención ni sigue la estructura transformer; la inferencia opera con memoria constante. En esta variante, el modelo se entrena como un flujo de gradiente de primer orden verdadero: el muelle congelado de los pozos y los modos rígidos se relajan de forma exacta, eliminando cualquier término de velocidad o inercia.

El entrenamiento emplea exactamente 532.480.000 tokens (32.500 pasos × 32 × 512) sobre OpenWebText, con el mismo presupuesto y calendario que el resto de la escalera Gen 3, partiendo del paso 0 con semilla 0 igual que su gemelo de segundo orden. Ambos ejecuciones ven los mismos lotes de entrenamiento y evaluación, por lo que la diferencia se mide de forma emparejada (correlación de 0,999 entre sus cambios de evaluación paso a paso). El estudio es pre-registrado y las hipótesis MS2a, MS2b y MS2c se declaran con probabilidades asignadas de antemano; los resultados se reportan como aciertos o fallos de esas predicciones. No se detalla la composición del dataset más allá de OpenWebText ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en inglés: pipeline declarado text-generation.
- Modelo de lenguaje de investigación orientado a medir perplejidad y comportamiento de dinámica conservativa, no a tareas de instrucción.
- Inferencia sin atención y con memoria constante, lo que permite procesar secuencias sin el crecimiento cuadrático típico de la atención.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- Sin modo de pensamiento (thinking), visión ni audio documentados.

## Casos de uso

- Investigación en arquitecturas no-transformer: sirve como punto de comparación controlado frente a su gemelo de segundo orden para aislar el efecto de la dinámica (primer orden frente a segundo orden) en la perplejidad, con presupuesto de tokens y lotes idénticos.
- Estudio de ablación de mecanismos: permite medir cuánto aportan los pozos de modo de Poisson (16) al rendimiento en primer orden, comparando con las variantes de 2 y 64 pozos de la misma colección.
- Reproducción de experimentos pre-registrados: el checkpoint y su gemelo permiten verificar las predicciones MS2a, MS2b y MS2c declaradas por el autor con las mismas semillas y calendario.
- Evaluación de eficiencia de inferencia: al ser attention-free y de memoria constante, es útil para estudiar el coste de memoria en secuencias largas frente a modelos con atención, aunque no se publican latencias ni throughput.
- Generación de texto de dominio general en inglés para análisis cualitativo: puede producir continuaciones sobre OpenWebText para inspeccionar el comportamiento del potencial conservativo.
- Base para experimentos de dinámica lagrangiana: su formulación con potencial anisótropo gaussiano y esquema BAOAB sirve como banco de pruebas para estudiar integradores y geometría riemanniana en modelos de lenguaje.

## Benchmarks y rendimiento

| Modelo | Corpus, tokens | Perplejidad en validación (bloque 512) | Primer orden frente a segundo |
|---|---|---:|---:|
| FO-b-PMX-K16 (este modelo) | OpenWebText, 532,5M | 53,73 | −0,9% |
| PMX-K16 (segundo orden, gemelo) | OpenWebText, 532,5M | 54,24 | referencia |
| FO-b-PMX (64 pozos) | OpenWebText, 532,5M | 54,02 | −1,1% |
| FO-b-PM2-PMX16 (2 pozos) | OpenWebText, 532,5M | 53,81 | −1,6% |
| FO-b-OWT (sin pozos) | OpenWebText, 532,5M | 61,16 | +4,9% |
| FO-TS (TinyStories, sin pozos) | TinyStories, 315M | 5,13 | −0,6% |
| FO-b-TS (TinyStories, primer orden) | TinyStories, 315M | 5,28 | +2,3% |
| FO-b-CODE (Python, sin pozos) | Python, 315M | 6,55 | +9,2% |

El resultado declarado para este modelo es una perplejidad de validación asentada de 53,73 (media de las tres últimas evaluaciones: 53,77, 53,81 y 53,61) y una mejor de 51,82 en el paso 31.000. La métrica está marcada como no verificada en el model-index. Las hipótesis pre-registradas MS2a y MS2b fallaron (se esperaba una brecha de segundo orden de +1% a +4% y un valor de primer orden entre 61,16 y 54,02, respectivamente), mientras que MS2c acertó (los pozos ayudan más al primer orden: 13,0% frente a 7,3%).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,3 GB, lo que sugiere un modelo pequeño, pero no se publican recuentos de parámetros ni requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repositorio es plausible que quepa en GPU de consumo, pero no hay confirmación del autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la librería declarada es pytorch y la arquitectura no-transformer probablemente requiere código propio del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad OpenWebText (bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FO-b-PMX-K16 (este modelo) | no disponible | no disponible | 53,73 | cc-by-4.0 | Hugging Face |
| PMX-K16 (segundo orden) | no disponible | no disponible | 54,24 | cc-by-4.0 | Hugging Face |
| FO-b-PMX (64 pozos) | no disponible | no disponible | 54,02 | cc-by-4.0 | Hugging Face |
| FO-b-OWT (sin pozos) | no disponible | no disponible | 61,16 | cc-by-4.0 | Hugging Face |

No se dispone de comparación con modelos transformer de propósito general de tamaño equivalente, ya que la información proporcionada no incluye sus resultados en el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado para instrucciones, diálogo ni uso en producción; su evaluación se limita a perplejidad en OpenWebText.
- Solo inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación no evaluado: no hay benchmarks de fidelidad factual ni de razonamiento.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- La perplejidad declarada está marcada como no verificada en el model-index.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero no se detallan restricciones adicionales ni condiciones de uso responsable.
- La arquitectura no-transformer y attention-free implica que las herramientas estándar (vLLM, llama.cpp, TGI) probablemente no sean compatibles directamente.
- El tamaño del modelo, la longitud de contexto real y los requisitos de hardware no están publicados, lo que dificulta planificar su despliegue.
- Los resultados del estudio son específicos de un presupuesto de 532,5M tokens y de OpenWebText; no deben extrapolarse a otros regímenes de escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Gemelo de segundo orden (PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Colección first-vs-second-order: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección Gen 3 (OpenWebText ladder): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Variante sin pozos (FO-b-OWT): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Variante de 64 pozos (FO-b-PMX): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob
- Variante de 2 pozos (FO-b-PM2-PMX16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
