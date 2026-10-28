# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2

## Resumen

semsimula-ladder-live-code-d384-l2-none-norc-sr2 (SO-CODE) es un modelo de lenguaje de investigación entrenado sobre código Python por el autor dimitarpg13 dentro de la familia Semantic Simulation, una línea de modelos "conservadores" que sustituyen la atención por dinámica lagrangiana sobre un potencial escalar. No es un transformer ni usa atención: se describe como un modelo de energía con dinámica de segundo orden (velocidad e inercia), integrador BAOAB, potencial gaussiano anisotrópico y geometría riemanniana con métrica de Jacobi, con inferencia de memoria constante. La configuración publicada es d=384 con L=2, y el autor no indica el recuento de parámetros.

El modelo forma parte de un estudio de ablación preinscrito que compara, par a par y con presupuesto de tokens idéntico, la variante de segundo orden frente a una de primer orden (FO-b-CODE, su gemelo). Sobre Python, el segundo orden gana por un 9,2 % de perplejidad (6,00 frente a 6,55), el margen más amplio de la colección (TinyStories +2,3 %, OpenWebText +4,9 %). El resultado relevante es metodológico: la ventaja aparece tarde en el entrenamiento y crece con la dificultad del corpus.

Se entrenó exactamente con 315.392.000 tokens (19.250 pasos × 32 × 512) en una única sesión de 5,92 horas, con schedule WSD y 3.000 pasos finales al learning rate suelo. Es un artefacto de investigación con 0 descargas en el momento de la consulta, sin ajuste por instrucciones ni datos de despliegue, pensado para reproducir la ablación y no para uso directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención ("attention-free"); modelo de lenguaje conservador con potencial escalar, dinámica de segundo orden, integrador BAOAB y métrica riemanniana de Jacobi (familia PARFLM / Fock space, según etiquetas del autor) |
| Parametros totales | No disponible (configuración d=384, L=2; el autor no publica el recuento) |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | 512 tokens (bloques de 512 en entrenamiento y evaluación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (código Python y texto en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se documenta safetensors ni GGUF. Tamaño del repositorio: 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura se aparta del transformer: no hay atención y el modelo se describe como "totalmente conservador" (fully-conservative), con un potencial escalar gaussiano anisotrópico y dinámica de segundo orden —esto es, con una variable de velocidad e inercia— integrada mediante BAOAB sobre geometría riemanniana con métrica de Jacobi. La variante de esta ficha es la mitad de segundo orden del par sobre código, en configuración `d384` (dimensión 384) y `l2` (2 capas), sin pozos de modo Poisson (`none`). El autor etiqueta el resultado como "inferencia de memoria constante" y pertenece a la tercera generación (`generation-3`) de la escalera de ablaciones.

El entrenamiento consumió exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) en una sola sesión, con schedule WSD durante 16.250 pasos y 3.000 pasos adicionales al learning rate suelo (curva tomada de TinyStories). El corpus es Python de `codeparrot/codeparrot-clean-train`, normalizado escribiendo cada nivel de indentación de cuatro espacios como un tabulador. Ambos gemelos (segundo y primer orden) parten del paso 0 con semilla 0 y los mismos lotes, lo que permite comparación por pares por paso. La validación usa los primeros 2M de tokens de los ficheros de validación de CodeParrot con separación a nivel de fichero. No se documenta RLHF, DPO ni ajuste por instrucciones. Salud del run: 0 activaciones del watchdog, subida máxima entre pérdidas de entrenamiento registradas de 0,073, norma de gradiente con mediana 0,46 y máximo 1,67, y monitor de fuga SCAF en estado CLEAN en las 4 auditorías.

## Capacidades

- Generación de texto en inglés y, específicamente, modelado de código Python (completado y continuación de secuencias, no instrucciones).
- Modelado de dependencias a larga distancia dentro de un bloque de 512 tokens, con ventaja declarada sobre su gemelo de primer orden en identificadores cuyo uso previo aparece más atrás en el contexto.
- Inferencia con memoria constante según las etiquetas del autor (no verificable con los datos publicados).
- Capacidad de servir como referencia de ablación: reproduce el par de primer orden FO-b-CODE bajo el mismo presupuesto de tokens y semilla.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; `language: en` en la model card.
- Visión, audio o modo "thinking": no disponible.

## Casos de uso

- Estudio de ablación de mecanismos: usar SO-CODE y FO-b-CODE como par controlado para medir el efecto de la dinámica de segundo orden con 315M tokens idénticos, semilla 0 y los mismos lotes; el par elimina la variabilidad de datos y presupuesto.
- Reproducción de investigación en modelos de energía: sirve como implementación de referencia de un LM conservador con integrador BAOAB y métrica de Jacobi, útil para validar derivaciones de dinámica lagrangiana aplicada al lenguaje.
- Prototipado de autocompletado de Python en local: con 512 tokens de contexto y un checkpoint de 0,3 GB en el repositorio, es viable probar continuaciones de código en máquinas sin GPU dedicada, asumiendo perplejidad alta frente a un transformer del mismo tamaño.
- Evaluación de tokenizadores y métricas: el pipeline de perplejidad a bloque 512 sobre los primeros 2M de tokens de validación de CodeParrot puede reutilizarse como arnés de comparación, siempre que se mantenga el mismo tokenizador y conjunto.
- Docencia sobre arquitecturas no transformer: el contraste explícito con un GPT-2 emparejado (d=384, L=8, perplejidad 4,96) ofrece un caso concreto de coste de prescindir de la atención.
- Detección de fallos en identificadores: dado el hallazgo de que el primer orden falla más cuanto más atrás queda la ocurrencia previa de un identificador, el modelo puede emplearse en experimentos sobre recuperación de nombres en ventanas largas de código.
- Despliegue en entornos con restricción de memoria: la etiqueta de memoria constante en inferencia lo hace candidato para experimentos en dispositivos limitados, sujeto a verificación independiente.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente, `verified: false`). Perplejidad de validación a bloque 512 sobre los primeros 2M de tokens de `codeparrot/codeparrot-clean-valid`.

| Modelo | Conjunto | Métrica | Valor |
|---|---|---|---|
| SO-CODE (este modelo) | CodeParrot clean (Python), validación | Perplejidad asentada, media de las tres últimas evaluaciones (pasos 18.000, 18.500, 19.000) | 5,9951 (5,87 / 6,02 / 6,10) |
| SO-CODE, mejor punto | Ídem | Perplejidad en el paso 18.000 | 5,87 |
| FO-b-CODE (gemelo de primer orden) | Ídem | Perplejidad asentada | 6,55 |
| GPT-2 emparejado (d=384, L=8), no publicado en el Hub | Ídem, mismos tokens y schedule | Perplejidad asentada | 4,96 |

Comparativa de la colección (pares segundo/first order, sin pozos):

| Par | Corpus, tokens | Segundo orden | Primer orden | Diferencia |
|---|---|---|---|---|
| OpenWebText | 532,5M | 58,32 | 61,16 | +4,9 % |
| TinyStories | 315M | 5,16 | 5,28 | +2,3 % |
| Python (este par) | 315M | 6,00 | 6,55 | +9,2 % |

Evolución por pasos del par sobre código:

| Paso | Fase | SO-CODE | FO-b-CODE | Primer orden frente a segundo |
|---:|---|---:|---:|---:|
| 500 | warmup | 44,02 | 41,91 | −4,8 % |
| 2.000 | estable | 17,67 | 16,60 | −6,1 % |
| 5.000 | estable | 9,27 | 9,26 | −0,1 % |
| 10.500 | estable, fin | 7,02 | 7,77 | +10,7 % |
| 13.000 | decaimiento | 6,38 | 7,06 | +10,7 % |
| 16.000 | decaimiento, fin | 6,12 | 6,70 | +9,5 % |
| 18.000 | suelo, mejor | 5,87 | 6,43 | +9,5 % |
| 19.000 | suelo, última eval | 6,10 | 6,65 | +9,0 % |

Otros datos declarados: ventaja pareada por paso de +9,1 % a +9,5 % en las siete últimas evaluaciones (pasos 16.000–19.000, correlación entre brazos 0,996); FO-b-CODE es peor en el 98 % de 512 ventanas de validación. Hipótesis preinscritas: CODE1 acertada (+9,2 %, umbral >2 %), CODE2 acertada (margen mayor que el +4,9 % de OpenWebText). CODE3–CODE5 requieren el par con dos pozos, pendiente.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. El repositorio completo ocupa 0,3 GB, por lo que el checkpoint es de escala muy reducida; cualquier cifra concreta de VRAM sería una estimación no confirmada.
- GPU recomendadas: no documentadas. Por tamaño, una GPU consumer (RTX 3060, RTX 4090) es suficiente en teoría; el autor no reporta pruebas en hardware concreto.
- Viabilidad en GPU consumer: previsiblemente sí, e incluso en CPU, dado el tamaño del repositorio; no verificado.
- Despliegue: al ser una arquitectura no transformer, sin atención y con integrador BAOAB, no debe asumirse compatibilidad con vLLM, TGI, llama.cpp ni Ollama; requiere el código PyTorch del autor y su implementación de inferencia.
- Latencia y throughput: no disponibles. El único dato temporal es de entrenamiento (19.250 pasos en 5,92 h), sin especificar el hardware empleado.
- Cuantización: no se documentan pesos GGUF ni versiones cuantizadas; no hay cifras de VRAM por cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot valid, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO-CODE (este modelo) | No disponible (d=384, L=2) | 512 | 5,9951 asentada / 5,87 mejor | CC-BY-4.0 | HuggingFace (0 descargas) |
| FO-b-CODE (gemelo de primer orden) | No disponible (misma configuración) | 512 | 6,55 | CC-BY-4.0 | HuggingFace |
| GPT-2 emparejado (d=384, L=8) | No disponible | 512 (en este experimento) | 4,96 | No indicada | No publicado en el Hub según el autor |
| SO-TS (mismo diseño, TinyStories) | No disponible | 512 | 5,16 (sobre TinyStories, no comparable directamente) | CC-BY-4.0 | HuggingFace |

No se dispone de comparación con modelos de código de referencia (CodeParrot, CodeGen, StarCoder) en la información proporcionada; el autor solo compara contra su propio gemelo y contra un GPT-2 emparejado.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no es adecuado para chat, agentes ni seguimiento de órdenes; solo continuación de secuencias.
- Contexto limitado a 512 tokens, muy por debajo de los estándares actuales para código, lo que restringe casos de uso con ficheros completos.
- Solo inglés (`language: en`); no hay evidencia de comportamiento en otros idiomas.
- Resultados no verificados de forma independiente (`verified: false`) y con 0 descargas: no hay replicación externa.
- La comparación de perplejidad solo es válida con tokenizador y conjunto de validación idénticos; la model card no detalla el tokenizador empleado y la comparación con el GPT-2 emparejado (4,96) debe interpretarse con esa cautela.
- El autor reconoce que, aplicando la letra del protocolo, ambos brazos fallan el criterio de asentamiento (−0,020 y −0,023 nats en los últimos 3.000 pasos frente a una dispersión residual de 0,015), aunque el gap pareado apenas se mueve (0,003 nats). Es un matiz relevante para citar el resultado.
- Las hipótesis CODE3–CODE5 están pendientes de la variante con dos pozos; las conclusiones sobre el efecto de los pozos en código no están cerradas.
- Riesgo de alucinación y de generar código sintácticamente plausible pero incorrecto: no se reportan evaluaciones funcionales (pass@k, HumanEval) ni tests de ejecución.
- Sesgos: no se documenta ningún análisis de sesgo; el corpus es CodeParrot clean, con los sesgos de su filtrado y composición.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación sin garantías, su uso en producción requiere validación propia. No se especifican restricciones adicionales de uso aceptable.
- Arquitectura propietaria del autor: la integración en stacks existentes exige reimplementar la inferencia; no hay soporte en runtimes estándar.
- Sin datos de latencia, throughput ni consumo de VRAM, lo que impide planificar capacidad de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Gemelo de primer orden (FO-b-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Colección "first vs second order" (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- SR2 sobre OpenWebText: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- FO-b-OWT (primer orden, OpenWebText): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- SO-TS (TinyStories): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- FO-b-TS (primer orden, TinyStories): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validación: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
