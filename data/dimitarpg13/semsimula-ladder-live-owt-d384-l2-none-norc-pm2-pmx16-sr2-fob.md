# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob` (abreviado por el autor como FO-b-PM2-PMX16) es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la familia «Semantic Simulation» (semsimula), un linaje de modelos de lenguaje conservativos, no Transformer y sin atención, construidos sobre mecánica lagrangiana y un potencial escalar. Este checkpoint concreto es la variante de **primer orden** (flujo de gradiente puro, sin velocidad ni inercia) de la pareja PM2-PMX16, que incorpora dos pozos de modo Poisson como estructura de potencial.

El modelo no pretende competir con LLM comerciales: es un artefacto experimental de ablación de mecanismos. Su propósito es responder una pregunta preinscrita: si el núcleo conservativo necesita dinámica de segundo orden o si un modelo de primer orden entrenado igual rinde lo mismo. La respuesta declarada es que, con dos o más pozos, el primer orden iguala o supera al segundo orden, lo que según el autor cierra el extremo bajo de la curva de dosis (K = 0 a K = 64).

Se entrenó sobre OpenWebText con un presupuesto exacto de 532,48 millones de tokens y una ventana de bloques de 512 tokens. Su métrica principal es la perplejidad de validación en OpenWebText: 53,81 (media de las tres últimas evaluaciones), con un mínimo de 51,90 en el paso 31.000. El repositorio ocupa 0,3 GB y la licencia es CC BY 4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No Transformer y sin atención ("attention-free"); modelo de lenguaje conservativo con potencial escalar, formulación lagrangiana y flujo de gradiente de primer orden; integración BAOAB y formulación CfC según los tags del autor |
| Parámetros totales | No disponible (el identificador indica `d384` y `l2`; no se publica el recuento) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; el entrenamiento y la evaluación se realizan con bloques de 512 tokens |
| Tipos de cuantización | No disponible (no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Pesos PyTorch (`pytorch` como `library_name`); no se confirma safetensors ni GGUF. Tamaño del repositorio: 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura se aparta del Transformer: no hay atención y el modelo se describe como «conservative language model» con potencial escalar, es decir, la dinámica de estados se deriva de un potencial y se integra como un flujo de gradiente. Este checkpoint es la rama de primer orden de la pareja: el muelle congelado de los pozos y los modos rígidos se relajan de forma exacta, sin ningún término de velocidad. Los tags mencionan componentes adicionales del linaje: potencial gaussiano anisotrópico, geometría riemanniana con geodésicas y métrica de Jacobi, registros de modo Poisson, espacio de Fock (`fock-space`) e inferencia con memoria constante (`constant-memory-inference`). El identificador `pm2` indica dos pozos de modo Poisson (K = 2); el sufijo `pmx16` aparece en el nombre sin que la información disponible detalle su significado exacto.

El entrenamiento usó exactamente 532.480.000 tokens (32.500 pasos × 32 de batch × 512 de bloque), la misma agenda y semilla 0 que su gemelo de segundo orden y que la pareja K = 16, de modo que las diferencias se miden emparejadas (las variaciones de evaluación paso a paso correlacionan a 0,999). El corpus es OpenWebText (Skylion007/openwebtext). No se documenta RLHF, DPO ni ajuste por instrucciones: es un modelo base. El estudio está **preinscrito** con cuatro predicciones: MS2a (hueco en K = 2) falló con −1,6 % frente al 50 % pronosticado; MS2b acertó (53,81, dentro del margen de 0,08); MS2c acertó (los pozos ayudan al primer orden un 12,8 % frente al 6,4 % del segundo); MS2d acertó (entrenamiento estable). El estado de la ejecución se reporta como sano: 0 activaciones del watchdog, 0 capturas de picos, pérdida máxima de entrenamiento 1,005 veces su media móvil y monitor de fugas SCAF en estado CLEAN en las 7 auditorías.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste instructivo.
- Modelado de lenguaje puro: la métrica declarada es perplejidad, no rendimiento en tareas.
- Inferencia con memoria constante respecto a la longitud de secuencia (tag `constant-memory-inference`), al no emplear atención.
- Sin ventana de atención: la arquitectura es explícitamente `attention-free`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan modo «thinking», visión, audio ni otras modalidades.
- Capacidad experimental: sirve como punto de medida reproducible dentro de una escalera de ablación (K = 0, 2, 16, 64 pozos; primer frente a segundo orden).

## Casos de uso

- Investigación en modelos de lenguaje no Transformer: reproducir la comparación primer orden frente a segundo orden con el mismo presupuesto de tokens (532,48 M) y la misma semilla, usando este checkpoint como rama de primer orden de la pareja PM2-PMX16.
- Ablación de mecanismos preinscrita: verificar los resultados declarados (MS2a a MS2d) y auditar la metodología de preinscripción, útil para quienes estudian prácticas de investigación reproducible en IA.
- Estudio de modelos basados en energía: analizar cómo un potencial escalar con dos pozos de modo Poisson condiciona la perplejidad frente a la variante de segundo orden (53,81 frente a 54,71).
- Experimentos de inferencia con memoria constante: al no usar atención, es un banco de pruebas para medir consumo de memoria frente a longitud de secuencia en flujos de generación largos.
- Línea base de perplejidad en OpenWebText: sirve como referencia comparativa para nuevas arquitecturas conservativas evaluadas sobre los tokens de validación de OpenWebText con bloque 512.
- Docencia y divulgación de ML con base física: ilustra de forma ejecutable conceptos de mecánica lagrangiana, integración BAOAB, geodésicas riemannianas y espacio de Fock aplicados a modelado de lenguaje.
- Reproducción de estudios de dosis: comparar la curva de pozos K = 0, 2, 16 y 64 con el resto de checkpoints de la escalera, todos con el mismo presupuesto de tokens.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card; la métrica figura como no verificada (`verified: false`).

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| text-generation | OpenWebText (validation) | Perplejidad, bloque 512, estabilizada (media de las tres últimas evaluaciones de 500 pasos) | 53,81 |

Resultados de la escalera de ablación declarados por el autor (perplejidad de validación en OpenWebText, 532,5 M tokens en todos los casos):

| Pozos K | Segundo orden | Primer orden | Primer orden frente a segundo |
| ---: | ---: | ---: | ---: |
| 0 | SR2: 58,32 | FO-b-OWT: 61,16 | +4,9 % |
| **2 (este modelo)** | **PM2-PMX16: 54,71** | **FO-b-PM2-PMX16: 53,81** | **−1,6 %** |
| 16 | PMX-K16: 54,24 | FO-b-PMX-K16: 53,73 | −0,9 % |
| 64 | PMX: 54,63 | FO-b-PMX: 54,02 | −1,1 % |

Otros datos declarados: mejor perplejidad de 51,90 en el paso 31.000; diferencia emparejada por paso de −1,63 % con una dispersión de 0,14 %; pareja de TinyStories (315 M tokens) con 5,16 en segundo orden y 5,13 en primer orden (−0,6 %), no comparable directamente por usar otro corpus. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otras tareas de razonamiento en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos ocupan 0,3 GB de repositorio, por lo que en fp32 quedan holgadamente por debajo de 1 GB; con activaciones y overhead, cualquier GPU consumer con 4 GB o más debería bastar (estimación a partir del tamaño, no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamaño, no requiere A100 ni H100; una RTX 4090, RTX 3090 o incluso una GPU de gama media es suficiente para ejecución en fp32.
- Cabe en GPU consumer: sí, con el tamaño de repositorio indicado; no se especifican requisitos mínimos oficiales.
- Opciones de despliegue: al no ser un Transformer, no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; el despliegue previsible es PyTorch nativo con el código del autor, que no se incluye en la información disponible.
- Latencia y throughput: no disponible. La arquitectura sin atención y con memoria constante en inferencia es favorable a secuencias largas, pero no se publican medidas.

## Comparativa con modelos similares

Comparables directos dentro de la misma escalera (todos OpenWebText, 532,5 M tokens, bloques de 512, licencia CC BY 4.0):

| Modelo | Orden | Pozos K | Perplejidad | Tokens de entrenamiento |
|---|---|---:|---:|---:|
| FO-b-PM2-PMX16 (este) | Primero | 2 | 53,81 | 532,5 M |
| PM2-PMX16 | Segundo | 2 | 54,71 | 532,5 M |
| FO-b-PMX-K16 | Primero | 16 | 53,73 | 532,5 M |
| PMX-K16 | Segundo | 16 | 54,24 | 532,5 M |
| FO-b-PMX | Primero | 64 | 54,02 | 532,5 M |
| PMX | Segundo | 64 | 54,63 | 532,5 M |
| FO-b-OWT | Primero | 0 | 61,16 | 532,5 M |
| SR2 | Segundo | 0 | 58,32 | 532,5 M |

Frente a modelos de la misma categoría externos (LLM pequeños de propósito general): no disponible. La información proporcionada no incluye comparaciones con otros modelos abiertos, y las perplejidades no son trasladables entre tokenizadores y corpus distintos.

## Limitaciones y advertencias

- Es un modelo base sin ajuste instructivo ni alineamiento de seguridad; no debe usarse como asistente conversacional en producción.
- La perplejidad de 53,81 en OpenWebText es alta en términos absolutos y solo es interpretable dentro de la propia escalera, con el mismo tokenizador y corpus.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No hay resultados en tareas downstream (razonamiento, código, matemáticas), por lo que se desconoce su utilidad práctica más allá del modelado de lenguaje.
- Métrica no verificada: el `model-index` marca el resultado como `verified: false`; procede del propio autor.
- Riesgo de alucinación y de reproducir sesgos del corpus OpenWebText (texto web sin curación editorial ni filtrado específico de toxicidad).
- Contexto limitado: el entrenamiento y la evaluación usan bloques de 512 tokens; no se documenta longitud de contexto efectiva superior.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin revisión externa por pares.
- Licencia CC BY 4.0: permite uso comercial con atribución; hay que citar al autor y no aplicar restricciones adicionales. No se ofrece garantía alguna.
- Dependencia de código propio: sin implementación estándar en las herramientas de inferencia habituales, el coste de integración en producción es alto.
- El resultado central del estudio debe leerse como una comparación interna emparejada (diferencias de 0,08 a 1,6 %), no como una ventaja general de las arquitecturas conservativas frente a Transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Gemelo de segundo orden (PM2-PMX16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Colección «first vs second order» (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección «Gen 3» (escalera OpenWebText): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Referencia K = 0, primer orden (FO-b-OWT): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Referencia K = 0, segundo orden (SR2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Referencia K = 16, primer orden (FO-b-PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Referencia K = 16, segundo orden (PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Referencia K = 64, segundo orden (PMX): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Dataset de entrenamiento: https://huggingface.co/datasets/Skylion007/openwebtext
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente resultados sin relación sobre servidores de Minecraft).
