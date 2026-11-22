# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob

## Resumen

`semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob` es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro del proyecto SemSimula, una línea de trabajo que explora modelos de lenguaje "conservativos" basados en mecánica lagrangiana y potenciales escalares en lugar de la atención transformer convencional. Este checkpoint concreto es el brazo de primer orden (FO-b, *first-order gradient flow*) de un par experimental entrenado sobre código Python, y su gemelo de segundo orden es `semsimula-ladder-live-code-d384-l2-none-norc-sr2`. El objetivo del par es aislar si la dinámica de segundo orden (velocidad e inercia) aporta algo frente a un flujo de gradiente de primer orden entrenado con exactamente los mismos datos y presupuesto.

La arquitectura es explícitamente no-transformer y sin atención, con inferencia de memoria constante, un potencial gaussiano anisotrópico y formulación en espacio de Fock con integración BAOAB y geometría riemanniana (métrica de Jacobi). El modelo tiene una dimensión d=384 con L=2 y se entrenó sobre exactamente 315.392.000 tokens de CodeParrot clean en una única sesión de 19.250 pasos. Su resultado principal es una perplejidad de validación de 6,55 (bloque 512) frente a 6,00 de su gemelo de segundo orden, es decir, un 9,2% por detrás, la mayor brecha observada en cualquier corpus del estudio.

La relevancia es fundamentalmente metodológica: se trata de un experimento pre-registrado de ablación de mecanismo, no de un modelo destinado a producción. Sirve para investigadores que estudian alternativas a la atención, dinámicas de entrenamiento físicamente informadas y el papel del orden de la dinámica en modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención; modelo de lenguaje conservativo (scalar potential, dinámica lagrangiana, espacio de Fock, potencial gaussiano anisotrópico, integrador BAOAB, métrica de Jacobi) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (librería pytorch; repo de 0,3 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SemSimula "generation 3" y se describe como un modelo de lenguaje conservativo: en lugar de atención sobre tokens, la dinámica se define mediante un potencial escalar y flujos de gradiente, con formulación en espacio de Fock y un potencial gaussiano anisotrópico. La variante `fob` del nombre indica *first-order*: las modas rígidas se relajan de forma exacta y no existe variable de velocidad en ningún punto de la red, en contraste con el gemelo de segundo orden. La inferencia se caracteriza por memoria constante, sin el crecimiento cuadrático típico de la atención. El integrador empleado es BAOAB, con geometría riemanniana basada en la métrica de Jacobi.

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) de CodeParrot clean en una sola sesión de 5,65 horas, con el schedule WSD de la escalera durante 16.250 pasos y 3.000 pasos adicionales al learning rate suelo, siguiendo la curva de TinyStories. El preprocesado del código Python convierte cada nivel de indentación de cuatro espacios en un tabulador. Ambos gemelos parten del paso 0 con semilla 0 y los mismos batches, lo que permite comparaciones por paso pareadas. No se menciona RLHF ni DPO; el entrenamiento es de modelado de lenguaje puro con presupuesto de tokens igualado entre brazos.

## Capacidades

- Generación de texto autoregresiva sobre código Python y, en general, texto en inglés.
- Modelado de dependencias de largo alcance en código: el análisis del autor indica que el modelo localiza identificadores lejanos tan bien como su gemelo, aunque los aprovecha peor, lo que sugiere cierta capacidad de recuperación de referencias distantes.
- Inferencia con memoria constante, independiente de la longitud de secuencia.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe: solo inglés según la model card.

## Casos de uso

- Investigación en alternativas a la atención: el modelo sirve como punto de comparación controlado para medir el coste de eliminar la atención y la dinámica de segundo orden en un corpus de código, con presupuesto de tokens y batches idénticos al gemelo.
- Estudios de ablación de mecanismo: permite aislar el efecto del orden de la dinámica (primer vs. segundo orden) manteniendo constante todo lo demás, útil para publicaciones sobre dinámicas de entrenamiento físicamente informadas.
- Reproducción de experimentos pre-registrados: las predicciones CODE1 y CODE2 están documentadas y puntuadas, de modo que el checkpoint permite replicar el análisis de brecha pareada por paso.
- Evaluación de perplejidad en código Python: con 6,55 de perplejidad en bloque 512 sobre las primeras 2M tokens de validación de CodeParrot, sirve como referencia para comparar futuras variantes de la familia.
- Análisis de recuperación de identificadores: el fallo localizado en identificadores y su crecimiento con la distancia a la ocurrencia previa lo hacen adecuado para estudiar mecanismos de memoria de largo alcance en código.
- Prototipado de inferencia de memoria constante: útil para investigar despliegues donde la VRAM no puede crecer con la longitud de contexto, aunque sin garantías de calidad para producción.

## Benchmarks y rendimiento

| Modelo | Corpus, tokens | Perplejidad de validación (bloque 512) | Brecha frente a segundo orden |
|---|---|---:|---:|
| SO-CODE (segundo orden) | Python, 315M | 6,00 | referencia |
| FO-b-CODE (este modelo) | Python, 315M | 6,55 | +9,2% |
| PM2-CODE (segundo orden, 2 pozos) | Python, 315M | 5,71 | — |
| FO-b-PM2-CODE (primer orden, 2 pozos) | Python, 315M | 5,62 | −1,6% |
| GPT-2 emparejado (d=384, L=8) | Python, mismos tokens | 4,96 | este modelo +32,0% |

Detalle del resultado de este modelo: perplejidad asentada de 6,5487, media de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (6,43, 6,57 y 6,65); mejor valor 6,43 en el paso 18.000. La brecha pareada por paso se sitúa entre +9,1% y +9,5% en las últimas siete evaluaciones (pasos 16.000–19.000), con correlación de 0,996 entre brazos, y el modelo es peor en el 98% de 512 ventanas de validación. Frente al GPT-2 emparejado, el gemelo de segundo orden queda un +20,9% por detrás.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 0,3 GB, lo que sugiere un modelo pequeño, pero no se publican recuentos de parámetros ni requisitos de memoria.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible, aunque el tamaño del repo y la inferencia de memoria constante apuntan a que sería viable en GPUs de consumo; el autor no lo confirma.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la librería declarada es PyTorch.
- Latencia y throughput: no disponibles. Sí se conoce el coste de entrenamiento: 19.250 pasos en 5,65 horas en una sola sesión, con norma de gradiente mediana de 0,67 y máxima de 1,83 durante el warmup.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Perplejidad (código, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (FO-b-CODE) | Conservativa, primer orden, sin atención | no disponible | no disponible | 6,55 | CC-BY-4.0 | Hugging Face |
| SO-CODE (gemelo) | Conservativa, segundo orden, sin atención | no disponible | no disponible | 6,00 | CC-BY-4.0 | Hugging Face |
| PM2-CODE | Conservativa, segundo orden, 2 pozos Poisson | no disponible | no disponible | 5,71 | CC-BY-4.0 | Hugging Face |
| GPT-2 emparejado (d=384, L=8) | Transformer | no disponible | no disponible | 4,96 | no disponible | No publicado en el Hub según el autor |

## Limitaciones y advertencias

- Rendimiento inferior a su gemelo de segundo orden en un 9,2% de perplejidad, la mayor brecha del estudio; no es un modelo competitivo frente a alternativas transformer del mismo presupuesto (+32,0% de perplejidad frente al GPT-2 emparejado).
- El fallo se concentra en identificadores: localiza las ocurrencias lejanas tan bien como su gemelo, pero las aprovecha peor, lo que afecta a la coherencia en código con referencias cruzadas.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No hay datos publicados sobre sesgos, alucinación, tool calling ni comportamiento en producción; es un artefacto de investigación, no un modelo listo para despliegue.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo no ofrece garantías de calidad para tales fines.
- El propio autor señala que ambos brazos fallan por la letra el chequeo de asentamiento (−0,020 y −0,023 nats en los últimos 3.000 pasos frente a una dispersión residual de 0,015), aunque la brecha pareada se mantiene estable (0,003 nats en esa ventana).
- No se dispone de información sobre cuantización, formato de pesos ni contexto máximo, lo que dificulta planificar un despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Gemelo de segundo orden (SO-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Variante con dos pozos de Poisson (PM2-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2
- Variante de primer orden con dos pozos (FO-b-PM2-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Par en OpenWebText (SR2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Par en OpenWebText (FO-b): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Par en TinyStories (SO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- Par en TinyStories (FO-b-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Colección first-vs-second-order: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Nota pre-registrada del experimento: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Code_Set_First_vs_Second_Order.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
