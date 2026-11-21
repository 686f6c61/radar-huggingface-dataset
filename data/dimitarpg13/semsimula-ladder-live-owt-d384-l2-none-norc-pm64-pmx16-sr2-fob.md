# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13` dentro de la familia Semantic Simulation (Gen 3). No es un transformer ni usa atención: es un modelo de lenguaje conservativo basado en un potencial escalar y mecánica lagrangiana, entrenado como un flujo de gradiente de primer orden verdadero (FO-b-PMX). Forma parte de un estudio de ablación pre-registrado que compara pares de modelos entrenados con dinámica de primer y segundo orden sobre el mismo presupuesto de tokens.

El modelo emplea 64 "pozos" de memoria en modo Poisson (Poisson-mode registers) sobre un núcleo conservativo con potencial gaussiano anisotrópico, integrado mediante un esquema BAOAB y geometría riemanniana con métrica de Jacobi. Tiene una dimensión de modelo d384, dos capas (l2), y se entrenó sobre OpenWebText con un presupuesto exacto de 532,48 millones de tokens (32.500 pasos × 32 × 512). Su resultado principal es una perplejidad de validación de 54,02 a bloque 512, prácticamente empatada con su gemelo de segundo orden PMX (54,63), lo que constituye la conclusión central del par: sin los pozos, el segundo orden aportaba un 4,9%; con ellos, la diferencia desaparece.

La relevancia es fundamentalmente investigadora: explora si la memoria de los pozos sustituye a la inercia de la dinámica de segundo orden, y demuestra que un modelo sin atención y con memoria de inferencia constante puede alcanzar perplejidades competitivas en su régimen. No está pensado para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo no-transformer, sin atención; potencial escalar con 64 pozos de memoria en modo Poisson, integración BAOAB, geometría riemanniana (métrica de Jacobi) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado a bloque 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (pytorch); safetensors/GGUF no disponible |
| Dimensión del modelo | d384 |
| Capas | 2 (l2) |
| Pozos de memoria | 64 (pm64), modo Poisson pmx16 |
| Orden de dinámica | primer orden (first-order, FO-b) |
| Presupuesto de entrenamiento | 532.480.000 tokens (32.500 pasos × 32 × 512) |
| Dataset | Skylion007/openwebtext |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

El modelo pertenece a la línea "conservative language model" de Semantic Simulation: en lugar de atención, el estado se evolve bajo un potencial escalar mediante dinámica lagrangiana. Esta variante concreta (FO-b-PMX) se entrena como un flujo de gradiente de primer orden verdadero, relajando exactamente los pozos y los modos rígidos, sin velocidad ni inercia en ningún punto. Incorpora 64 pozos de memoria en modo Poisson (Poisson-mode registers) con un potencial gaussiano anisotrópico, integrado con el esquema BAOAB y formulado sobre geometría riemanniana con métrica de Jacobi y geodesicas riemannianas. La inferencia tiene memoria constante por diseño (constant-memory-inference).

El entrenamiento usó exactamente 532.480.000 tokens de OpenWebText (32.500 pasos de 32 secuencias × 512 tokens), el mismo presupuesto y calendario que el resto de la escalera Gen 3, con gradientes en vivo. El estudio es pre-registrado: de las cuatro predicciones (FBX1–FBX4), dos fallaron y dos acertaron. FBX1 (el segundo orden se impone en los pozos, al menos 3% de ventaja) falló con −1,1%; FBX2 (la brecha con pozos supera a la brecha sin pozos en 2 puntos) falló; FBX3 (los pozos ayudan a un modelo de primer orden) acertó con −11,7%; FBX4 (los pozos de primer orden entrenan de forma estable) acertó. La hipótesis propuesta es la "sustitución de memoria": los pozos proporcionan la memoria que de otro modo aportaría la inercia de segundo orden.

## Capacidades

- Generación de texto autoregresiva en inglés (pipeline `text-generation`).
- Modelado de lenguaje a nivel de token con perplejidad competitiva en su régimen (54,02 a bloque 512 sobre OpenWebText).
- Inferencia con memoria constante, sin crecimiento del coste con la longitud de secuencia.
- Mecanismo de memoria interna mediante 64 pozos de modo Poisson.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso explícito.
- Multilingüe: solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado para estudiar si la dinámica de segundo orden aporta ventaja frente a la de primer orden cuando existen mecanismos de memoria explícitos.
- Estudio de sustitución de memoria: permite replicar el experimento de pares (primer vs. segundo orden) con y sin pozos para validar la hipótesis de que los pozos reemplazan funcionalmente a la inercia.
- Ablación de mecanismos pre-registrada: útil como referencia metodológica para grupos que quieran diseñar estudios con predicciones registradas de antemano y evaluar aciertos y fallos.
- Evaluación de modelos sin atención: sirve para medir perplejidad y estabilidad de entrenamiento en regímenes de bajo presupuesto (532M tokens) frente a líneas transformer equivalentes.
- Prototipado de inferencia de memoria constante: útil para explorar despliegues donde el coste de memoria no debe crecer con la longitud de contexto.
- Docencia y divulgación: ejemplo concreto de modelo de lenguaje basado en mecánica lagrangiana y potencial escalar, con resultados numéricos publicados y trazables.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Modelo | Corpus, tokens | Perplejidad validación (bloque 512) |
|---|---|---|
| FO-b-PMX (este modelo, 64 pozos) | OpenWebText, 532,5M | 54,02 |
| PMX (segundo orden, 64 pozos) | OpenWebText, 532,5M | 54,63 |
| FO-b-PMX-K16 (primer orden, 16 pozos) | OpenWebText, 532,5M | 53,73 |
| PMX-K16 (segundo orden, 16 pozos) | OpenWebText, 532,5M | 54,24 |
| FO-b-PM2-PMX16 (primer orden, 2 pozos) | OpenWebText, 532,5M | 53,81 |
| PM2-PMX16 (segundo orden, 2 pozos) | OpenWebText, 532,5M | 54,71 |
| FO-b-OWT (primer orden, sin pozos) | OpenWebText, 532,5M | 61,16 |
| SR2 (segundo orden, sin pozos) | OpenWebText, 532,5M | 58,32 |

Detalle de este modelo: perplejidad asentada 54,02 (media de las tres últimas evaluaciones: 53,95, 54,16, 53,96); mejor valor 52,18 en el paso 31.000. Frente a su gemelo de segundo orden, la diferencia es de −1,1% (empate dentro de la variabilidad razonable entre semillas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,3 GB, lo que sugiere que el modelo cabe holgadamente en GPUs de consumo, pero no se publican cifras de parámetros ni de memoria.
- GPU recomendadas: no disponibles; por tamaño de repo, cualquier GPU con al menos unos pocos GB de VRAM debería poder cargarlo.
- GPU de consumo: probablemente sí (d384, 2 capas, repo de 0,3 GB), aunque no confirmado por el autor.
- Opciones de despliegue: solo se declara PyTorch como librería; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Perplejidad (OWT, bloque 512) | Licencia |
|---|---|---|---|---|
| FO-b-PMX (este) | Conservador, primer orden, 64 pozos | no disponible | 54,02 | CC-BY-4.0 |
| PMX (gemelo) | Conservador, segundo orden, 64 pozos | no disponible | 54,63 | CC-BY-4.0 |
| FO-b-OWT | Conservador, primer orden, sin pozos | no disponible | 61,16 | CC-BY-4.0 |
| SR2 | Conservador, segundo orden, sin pozos | no disponible | 58,32 | CC-BY-4.0 |

No se dispone de comparación con modelos transformer de referencia en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación; no validado para uso en producción.
- Solo inglés; sin capacidades multilingües.
- Contexto de entrenamiento y evaluación limitado a bloque 512; no se documenta ventana de contexto mayor.
- Riesgo de alucinación no evaluado ni documentado por el autor.
- Sesgos del corpus OpenWebText heredados sin mitigación documentada.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Resultados de perplejidad declarados como no verificados (`verified: false`).
- Dos de las cuatro predicciones pre-registradas fallaron; la interpretación de "sustitución de memoria" es una hipótesis del autor, no un resultado establecido.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está pensado ni validado para ello.
- No se publican recuento de parámetros, requisitos de hardware ni instrucciones de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob
- Gemelo de segundo orden (PMX): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Primer orden sin pozos (FO-b-OWT): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Segundo orden sin pozos (SR2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Variante 16 pozos, primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Variante 16 pozos, segundo orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Variante 2 pozos, primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Variante 2 pozos, segundo orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- TinyStories segundo orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- TinyStories primer orden entre capas: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- TinyStories primer orden verdadero: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- TinyStories 2 pozos, segundo orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- TinyStories 2 pozos, primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Python code, segundo orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Python code, primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Python code 2 pozos, segundo orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2
- Python code 2 pozos, primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Colección primer vs. segundo orden: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección Gen 3 (escalera OpenWebText): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
