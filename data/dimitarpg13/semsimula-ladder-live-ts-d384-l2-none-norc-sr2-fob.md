# dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob

## Resumen

`semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob` es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la familia SemSimula, un programa experimental que explora modelos de lenguaje conservativos basados en mecánica lagrangiana en lugar de la atención transformer. Este checkpoint concreto (FO-b-TS) es la variante de "primer orden verdadero" del modelo SR2 entrenado sobre TinyStories: reproduce la arquitectura de SR2 pero sustituye la dinámica de segundo orden por un flujo de gradiente de primer orden puro, sin velocidad ni inercia en ninguna parte del cómputo.

El modelo forma parte de un estudio preregistrado de ablación de mecanismos ("first vs second order") que compara pares de modelos entrenados con idéntico presupuesto de tokens, misma semilla y mismo schedule de learning rate, variando únicamente la dinámica interna. Su relevancia es metodológica: sirve para aislar si la ventaja de los modelos conservativos de SemSimula proviene de la dinámica de segundo orden o de otros componentes arquitectónicos. Con 384 dimensiones de estado, 2 niveles y sin atención, es un modelo pequeño (repo de 0,3 GB) orientado a investigación, no a producción.

El resultado principal del checkpoint es que la dinámica de segundo orden gana también en TinyStories sin pozos: el modelo emparejado SO-TS obtiene perplejidad 5,16 frente a 5,28 de este FO-b-TS (+2,3%). Frente a un GPT-2 emparejado en tokens y schedule (4,47), queda un 18,0% por detrás.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer, attention-free; modelo de lenguaje conservativo con potencial escalar (SemSimula, generación 3), dinámica de flujo de gradiente de primer orden, geometría riemanniana con métrica de Jacobi |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado a block 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la línea SemSimula de "conservative language models": en lugar de atención y capas transformer, formula la inferencia como una simulación física sobre un potencial escalar, con integración tipo BAOAB y potencial gaussiano anisotrópico (etiquetas `anisotropic-gaussian-potential`, `baoab`, `cfc`). La variante `d384-l2` indica 384 dimensiones de estado y 2 niveles; `none` hace referencia a la ausencia de pozos (wells) de modo Poisson, y `norc` a la ausencia de algún componente de control recurrente. La inferencia es de memoria constante (`constant-memory-inference`), una propiedad de los modelos sin atención ni caché KV clásica. El espacio de Fock (`fock-space`) y la geometría riemanniana con geodésicas y métrica de Jacobi aparecen como componentes del marco teórico.

Este checkpoint concreto entrena la arquitectura de SR2 como flujo de gradiente de primer orden verdadero (FO-b): los modos rígidos se relajan de forma exacta y no existe velocidad en ningún punto del cómputo. Se entrenó sobre exactamente 315.392.000 tokens de TinyStories (19.250 pasos × 32 × 512) en una sola sesión, con el schedule WSD de la escalera durante 16.250 pasos y 3.000 pasos adicionales al learning rate mínimo, partiendo del paso 0 con semilla 0 y con la misma curva de learning rate que SO-TS y FO-TS. El estudio está preregistrado en el repositorio `semsimula-paper` (nota `First_vs_Second_Order_Series.md`, predicción TS-K2).

## Capacidades

- Generación de texto en inglés a nivel de frases simples, entrenado específicamente sobre TinyStories (corpus sintético de cuentos infantiles).
- Modelado de lenguaje autorregresivo con perplejidad de validación de 5,2767 a bloque 512.
- Inferencia con memoria constante, sin caché de atención.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüe: no; solo inglés.
- Uso previsto: experimentación e investigación sobre dinámicas conservativas, no uso general.

## Casos de uso

- Estudio de ablación de mecanismos: comparar este FO-b-TS con su par SO-TS para aislar el efecto de la dinámica de segundo orden en la calidad del modelado, manteniendo tokens, semilla y schedule constantes.
- Investigación en modelos sin atención: servir de referencia reproducible para medir si una arquitectura attention-free con memoria constante puede aproximarse a un transformer pequeño en un corpus controlado.
- Reproducción de resultados preregistrados: validar la predicción TS-K2 del estudio first-vs-second-order y comprobar la brecha de +2,3% en perplejidad.
- Docencia y divulgación: ejemplo mínimo (0,3 GB) de modelo de lenguaje formulado como sistema físico conservativo, útil para explicar flujos de gradiente y potenciales escalares.
- Generación de cuentos sintéticos a pequeña escala: dado el corpus de entrenamiento (TinyStories), puede producir narrativas infantiles simples en inglés para pruebas de pipeline.
- Baseline para experimentos de pozos de modo Poisson: comparar contra las variantes PM2 para medir cómo los pozos cierran la brecha entre primer y segundo orden.
- Pruebas de infraestructura de inferencia: modelo ligero para validar integraciones de PyTorch y medir latencia de modelos de memoria constante.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card (no verificados de forma independiente):

| Modelo | Corpus | Tokens | Perplejidad (val, block 512) | Diferencia vs segundo orden |
|---|---|---:|---:|---:|
| SO-TS (segundo orden) | TinyStories, sin pozos | 315M | 5,16 | referencia |
| FO-b-TS (este modelo) | TinyStories, sin pozos | 315M | 5,28 (asentado) | +2,3% |
| FO-TS (primer orden entre capas) | TinyStories, sin pozos | 315M | 5,13 | −0,6% |
| PM2-TS (2 pozos) | TinyStories, con pozos | 315M | 4,99 | referencia |
| FO-b-PM2-TS (2 pozos) | TinyStories, con pozos | 315M | 4,96 | −0,5% |
| GPT-2 emparejado | TinyStories, mismo schedule | 315M | 4,47 | este modelo +18,0% por detrás |

Detalle de este checkpoint: perplejidad asentada de 5,28 (media de las evaluaciones en los pasos 18.000, 18.500 y 19.000: 5,35, 5,23 y 5,25); mejor valor de 5,10 en el paso 16.500. La evaluación usa los primeros 2M tokens del split de validación de TinyStories; el autor indica una variabilidad de ±0,06 entre evaluaciones. Emparejado por paso contra SO-TS: +1,97% durante la fase estable (dispersión 0,27%); a partir del paso 15.000 el emparejamiento es débil (+1,4%, dispersión 1,6%) porque las evaluaciones de SO-TS provienen de una sesión extendida.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con un repo de 0,3 GB, la inferencia en FP32 requiere del orden de 1 GB o menos, pero el dato no está publicado.
- GPU recomendadas: no disponible; cualquier GPU consumer con al menos unos pocos GB de VRAM debería poder ejecutarlo.
- Cabe en GPU consumer: sí, previsiblemente en cualquier RTX o equivalente reciente, dado el tamaño del checkpoint.
- Opciones de despliegue: PyTorch nativo (librería declarada); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer estándar es improbable que estos motores lo soporten sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Perplejidad TinyStories | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FO-b-TS (este modelo) | SemSimula, primer orden, sin atención | no disponible (eval. a 512) | 5,28 | CC-BY-4.0 | Hugging Face |
| SO-TS | SemSimula, segundo orden, sin atención | no disponible (eval. a 512) | 5,16 | CC-BY-4.0 | Hugging Face |
| GPT-2 emparejado (d384) | Transformer | no disponible (eval. a 512) | 4,47 | no disponible | Hugging Face (dimitarpg13) |
| FO-TS | SemSimula, primer orden entre capas | no disponible (eval. a 512) | 5,13 | CC-BY-4.0 | Hugging Face |

La comparación relevante es interna a la familia SemSimula; frente a un transformer emparejado en tokens y schedule, este modelo queda un 18,0% por detrás en perplejidad.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- Entrenado solo con TinyStories, un corpus sintético de cuentos infantiles; su vocabulario y dominio son muy limitados y no generaliza a texto real.
- Solo inglés; sin capacidades multilingües.
- Rendimiento inferior al de un transformer emparejado (4,47 frente a 5,28, un 18,0% peor) y al de su par de segundo orden (+2,3%).
- Riesgo de alucinación y de generación incoherente fuera del dominio de cuentos simples, previsible por el tamaño y el corpus.
- Sesgos: no documentados por el autor; al entrenar sobre datos sintéticos, los sesgos sociales típicos pueden estar atenuados, pero no hay evaluación al respecto.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no es apto para ello por su calidad y alcance.
- El resultado de perplejidad no está verificado de forma independiente (`verified: false`) y presenta una variabilidad de ±0,06 entre evaluaciones.
- El emparejamiento por paso con SO-TS es débil a partir del paso 15.000 por diferencias de sesión de entrenamiento.
- No se documentan cuantizaciones, formato de pesos distinto de PyTorch ni soporte en motores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Modelo par de segundo orden (SO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- Variante primer orden entre capas (FO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- Variante con 2 pozos (PM2-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Variante con 2 pozos en primer orden (FO-b-PM2-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Par en OpenWebText (FO-b-OWT): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Par en código Python (FO-b-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-ts-d384-gpt2-matched
- Colección first-vs-second-order: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Nota preregistrada del estudio: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/First_vs_Second_Order_Series.md
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
