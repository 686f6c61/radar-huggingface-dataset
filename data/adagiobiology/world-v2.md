# AdagioBiology/world-v2

## Resumen

MolJEPA-World v2 es un modelo de dinámica molecular de proteinas desarrollado por AdagioBiology. Se trata de un encoder JEPA (Joint-Embedding Predictive Architecture) con equivarianza E(3) que aprende representaciones latentes de trayectorias de dinámica molecular y las proyecta hacia el futuro mediante cabezas de desplazamiento multi-horizonte. El modelo no genera texto ni código: es un modelo cientifico de proposito especifico para predecir la evolucion conformacional de proteinas en el espacio latente.

La version v2 mantiene el mismo encoder que world-v1 pero sustituye el operador de Koopman aprendido por cabezas MLP de desplazamiento directo, una por horizonte temporal (1, 20, 40, 80 y 120 frames). Ademas, el entrenamiento y la evaluacion usan pares segmentados que garantizan que el frame inicial y el objetivo pertenecen a la misma replica y temperatura, corrigiendo una fuga metodologica del protocolo anterior.

Con 2,36 millones de parametros, el modelo es extremadamente compacto. Sobre un manifiesto de evaluacion congelado y segmentado, reduce el error de rollout entre un 11 y un 21 por ciento respecto al operador de Koopman de v1, con una tasa de victoria del 100 por ciento frente a persistencia en los cuatro horizontes evaluados. Su relevancia actual radica en la metodologia de evaluacion: el autor documenta explicitamente que el decode 3D sigue siendo el eslabon debil y que la metrica principal debe ser latente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA con encoder E(3)-equivariante y cabezas MLP de desplazamiento multi-horizonte |
| Parametros totales | 2.357.339 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre ventanas de 120 frames de trayectoria MD) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de la model card; el modelo no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors), codigo de inferencia PyTorch autocontenido |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder E(3)-equivariante de world-v1, que procesa representaciones coarse-grained de proteinas y produce un espacio latente de 12 modos con tiempos de relajacion aprendidos. La innovacion de v2 esta en el operador de rollout: en lugar de un operador de Koopman lineal aprendido (12 modos mas 3 expertos en v1), se emplean cabezas MLP independientes que predicen desplazamientos directos en el latente para cada horizonte (1, 20, 40, 80 y 120 frames). El autor diagnostico que el operador de v1 no era contractivo, con radio espectral efectivo de 1,14, lo que provocaba divergencia en rollouts largos.

El entrenamiento se realizo sobre 184 dominios de mdCATH con pares segmentados: cada par de entrenamiento y evaluacion tiene su frame inicial y objetivo dentro de la misma replica y temperatura, preservando la continuidad fisica real de los datos. El run de entrenamiento v32 completo 30.000 pasos en 506 minutos sobre una unica RTX 5060 Ti. No se menciona uso de RLHF ni DPO, algo esperable en un modelo cientifico de este tipo. La evaluacion se realizo sobre un manifiesto congelado de 24 dominios no vistos en entrenamiento (23 con cache de backbone utilizable), 10 segmentos por 5 inicios por 3 semillas, totalizando 3.495 ventanas.

## Capacidades

- Prediccion de evolucion conformacional de proteinas en espacio latente a horizontes de 5,5, 11, 22 y 33 nanosegundos.
- Rollout multi-horizonte con cabezas especializadas por horizonte temporal.
- Codificacion E(3)-equivariante de estructuras coarse-grained de proteinas.
- Decodificacion 3D mediante decodificador distogram/SMACOF (con limitaciones documentadas).
- Analisis de tiempos de relajacion mediante los 12 modos latentes aprendidos.
- Evaluacion de error de rollout relativo a persistencia como metrica principal.
- No soporta tool calling, function calling, agentes ni generacion de texto.
- No dispone de capacidades multimodales, de vision ni de audio.

## Casos de uso

- Prediccion de trayectorias de dinamica molecular: el modelo permite estimar la evolucion conformacional de una proteina a partir de un estado inicial, sustituyendo parcialmente simulaciones MD costosas por inferencia en espacio latente con un coste computacional minimo (2,36 M de parametros).
- Analisis de estabilidad termica de proteinas: comparando rollouts a distintas temperaturas (320 K frente a 450 K en mdCATH) se puede estudiar como varia la rigidez conformacional y la dispersion del ensemble termico.
- Filtrado previo de candidatos en diseno de proteinas: dado un gran conjunto de estructuras candidatas, el modelo puede ordenar por plausibilidad dinamica antes de lanzar simulaciones MD completas.
- Estudio de tiempos de relajacion: los 12 modos de Koopman del encoder compartido permiten identificar escalas temporales relevantes de la dinamica proteica, util en analisis de mecanismos conformacionales.
- Generacion de ensembles sinteticos: el modelo puede producir muestras de estados futuros para analisis estadistico de ocupacion de estados, aunque el autor advierte que la evaluacion por RMSD puntual no discrimina sistemas latentes.
- Investigacion metodologica en evaluacion de modelos generativos cientificos: el modelo y su manifiesto segmentado sirven como referencia para disenar protocolos de evaluacion sin fuga de informacion entre replicas.
- Docencia y prototipado en bioinformatica estructural: su tamano reducido y codigo autocontenido permiten ejecutarlo en CPU para experimentos exploratorios.

## Benchmarks y rendimiento

Manifiesto segmentado congelado: 24 dominios de mdCATH no vistos (23 con cache utilizable), 3.495 ventanas, metrica MSE latente por dominio del rollout dividido por el MSE de persistencia, mediana sobre dominios.

| Horizonte | v2 heads | v1 Koopman | v1 + PRST (r1) | v1 + PRST (full) | Tasa de victoria v2 |
|---|---|---|---|---|---|
| 20 f (5,5 ns) | 0,667 | 0,845 | 0,679 | 0,688 | 100% |
| 40 f (11 ns) | 0,671 | 0,811 | 0,682 | 0,675 | 100% |
| 80 f (22 ns) | 0,641 | 0,719 | 0,664 | 0,647 | 100% |
| 120 f (33 ns) | 0,623 | 0,700 | 0,673 | 0,645 | 100% |

Oráculo de replicas MD (CA RMSD tras alineamiento Kabsch, oraculo de replica frente a persistencia):

| Horizonte | 320 K: oraculo / persistencia | 450 K: oraculo / persistencia |
|---|---|---|
| 5,5 ns | 8,7 / 7,3 Å | 12,6 / 14,9 Å |
| 11 ns | 8,7 / 7,0 Å | 14,1 / 12,8 Å |
| 22 ns | 9,0 / 9,2 Å | 14,3 / 13,4 Å |
| 33 ns | 9,9 / 8,9 Å | 16,5 / 15,4 Å |

El decode 3D de ambos sistemas (v1 y v2) alcanza aproximadamente 14 Å RMSD a 33 ns, un valor que el autor atribuye a que el decodificador SMACOF se entreno con latentes docentes y decodifica latentes rollout fuera de distribucion. El autor senala que el mismo RMSD se obtiene al decodificar el latente futuro verdadero, por lo que la metrica 3D puntual no discrimina entre sistemas latentes.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 2,36 M de parametros (unos 9,4 MB en fp32), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; el entrenamiento se realizo en una unica RTX 5060 Ti.
- Cabe en GPU consumer: si, en practicamente cualquier modelo (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo con el codigo de inferencia autocontenido incluido en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: el autor publica graficos de latencia de inferencia en CPU (visuals/runtime.png), medidos mientras un job de entrenamiento compartia la maquina, por lo que son cotas superiores; no se proporcionan cifras numericas concretas en el texto disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Error de rollout (33 ns) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MolJEPA-World v2 | 2,36 M | JEPA E(3) + cabezas de desplazamiento | 0,623x persistencia | Apache-2.0 | Hugging Face |
| MolJEPA-World v1 | no disponible en la informacion | JEPA E(3) + operador de Koopman | 0,700x persistencia (0,645x con PRST full) | no disponible en la informacion | Hugging Face (referenciado) |
| Persistencia (baseline trivial) | 0 | Predice el estado actual | 1,000x (referencia) | no aplica | no aplica |

No se dispone de informacion sobre otros modelos comparables de dinamica proteica en la documentacion proporcionada.

## Limitaciones y advertencias

- El decode 3D es el eslabon debil: el decodificador SMACOF se entreno con latentes docentes y decodifica latentes rollout fuera de distribucion, alcanzando unos 14 Å RMSD a 33 ns tanto en v1 como en v2.
- A 320 K la proteina es practicamente rigida y la persistencia ya iguala o supera la dispersion del oraculo de replicas, por lo que una prediccion puntual no puede mostrar ventaja significativa.
- A 450 K el ensemble termico es amplio y el RMSD 3D de una prediccion a 33 ns esta dominado por ruido termico; el mismo RMSD se obtiene decodificando el latente futuro verdadero.
- La metrica principal es latente; el autor recomienda migrar la evaluacion a estadisticas de ensemble (ocupacion de estados, distribuciones TICA/PC, cobertura del ensemble de referencia) en lugar de RMSD puntual.
- El modelo solo procesa proteinas coarse-grained en el dominio mdCATH; no se documenta generalizacion a otras familias estructurales o condiciones.
- No procesa lenguaje natural pese a la etiqueta de idioma "en" en la model card.
- Riesgo de alucinacion en el sentido de generar trayectorias fisicamente implausibles fuera de la distribucion de entrenamiento; no se documentan pruebas de robustez fuera de mdCATH.
- No se documentan sesgos en el sentido de IA generativa convencional, pero el sesgo de seleccion del dataset (184 dominios mdCATH) limita la representatividad.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales.
- El modelo no incluye el decodificador condicionado por rollout que el autor identifica como siguiente paso; esa pieza no esta disponible en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdagioBiology/world-v2
- Repositorio de world-v1 (referenciado en la model card): no disponible como URL directa en la informacion proporcionada
- Visuales incluidos en el repositorio: visuals/latent_space.png, visuals/rollout_error.png, visuals/runtime.png, visuals/training_curve.png, visuals/movie_panels.png, visuals/rollout_movie.gif
- Dataset mdCATH: no se proporciona URL directa en la informacion disponible
- Paper o publicacion tecnica: no disponible en la informacion proporcionada
