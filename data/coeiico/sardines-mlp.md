# coeiico/sardines-mlp

## Resumen

sardines-mlp es un repositorio de pesos entrenados que reproduce el trabajo "Toy Models of Superposition" de Elhage et al. (2022), publicado por el equipo de interpretabilidad de Anthropic en Transformer Circuits. Lo desarrolla el usuario coeiico bajo licencia MIT y su proposito no es el despliegue en produccion, sino servir como material reproducible para estudiar como las redes neuronales representan mas caracteristicas que dimensiones disponibles mediante superposicion.

El modelo es una MLP toy de una sola capa con la forma x' = ReLU(WᵀWx + b), donde W tiene dimensiones m × n con m < n. Cada carpeta del repositorio contiene un barrido (sweep) entrenado como un lote de instancias independientes, con pesos en safetensors, metricas de entrenamiento en JSON y tablas de geometria por instancia y por caracteristica. Los barridos cubren configuraciones de 20→5, 5→2, 2→1 y 400→30 dimensiones, con variantes ReLU y lineal y cinco semillas por configuracion.

Su relevancia es acotada pero clara para la comunidad de interpretabilidad mecanicista: proporciona los artefactos exactos (pesos, semillas, registros de entrenamiento y estado del codigo) necesarios para reproducir figuras y resultados del paper original, algo que rara vez se publica junto al articulo. No es un modelo de lenguaje ni un modelo generativo: no procesa texto, no tiene tokenizador ni ventana de contexto en el sentido convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de una capa con cuello de botella, x' = ReLU(WᵀWx + b) |
| Parametros totales | Variable por barrido; el mayor es 400 × 30 = 12.000 pesos en W mas 400 sesgos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de secuencia) |
| Tipos de cuantizacion | No disponible (pesos en precision de entrenamiento) |
| Idiomas soportados | No aplica (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, sweep.safetensors) |

## Arquitectura y entrenamiento

La arquitectura es una MLP de una sola capa sin no linealidad oculta mas alla del ReLU de salida: la entrada x de dimension n se comprime a m dimensiones mediante W (m × n) y se reconstruye con la transpuesta, de modo que la salida x' tiene dimension n. El objetivo es reconstruir caracteristicas dispersas (cada una activa con probabilidad 1 − S) a partir de una representacion de menor dimensionalidad. La no linealidad ReLU en la salida es la que permite al modelo mantener mas caracteristicas que dimensiones, fenomeno central del paper.

Los datos de entrenamiento no son un corpus: cada instancia se entrena sobre caracteristicas sinteticas con probabilidad de activacion y importancia configurables, barridas en rejillas de densidad o sparsidad. Los barridos documentados son intro (20→5, 7 sparsidades), polygons (5→2, 21 densidades), phase (2→1, rejilla 24 × 24) y dimensionality (400→30, 40 sparsidades), cada uno con variantes ReLU y lineal y semillas 0 a 4. Los barridos intro, polygons y phase se entrenaron en CPU; dimensionality en una RTX 3060. No se menciona RLHF, DPO ni ajuste por preferencias, lo cual es esperable en un modelo toy de interpretabilidad.

## Capacidades

- Reconstruccion de caracteristicas dispersas en regimen de superposicion, con lectura mediante la misma matriz W.
- Representacion de hasta 13-14 caracteristicas en 5 dimensiones con ReLU, frente a 5 en el modelo lineal, segun el barrido intro.
- Formacion de geometrias poligonales regulares: pentagono en las cinco semillas del barrido polygons cuando 1 − S ≤ 0.05.
- Transicion de fase documentada en el barrido phase (2→1): caida de la segunda caracteristica, asignacion de la dimension o formacion de par antipodal.
- Medicion de dimensionalidad efectiva por caracteristica (media dimension por caracteristica en el barrido dimensionality, con caracteristicas a ½, ⅖ y ⅜).
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso

- Reproduccion de resultados de interpretabilidad: cargar un barrido con `checkpoint.load` y regenerar las figuras del paper de Elhage et al. para verificar conclusiones sobre superposicion.
- Estudio de transiciones de fase en representaciones: usar el barrido phase (rejilla 24 × 24) para analizar en que punto el modelo abandona una caracteristica o la agrupa en pares antipodales.
- Analisis de geometria de caracteristicas: emplear las tablas de `analysis/` por instancia y por caracteristica para estudiar como se distribuyen las direcciones en el espacio comprimido.
- Docencia en interpretabilidad mecanicista: modelo toy de coste computacional minimo (entrenamiento en CPU para tres de los cuatro barridos) adecuado para cursos y talleres.
- Validacion de metodologias de analisis: probar tecnicas de deteccion de caracteristicas o de medicion de dimensionalidad efectiva contra un ground truth conocido y controlado.
- Comparacion ReLU frente a lineal: usar los pares de barridos para cuantificar la diferencia de capacidad de representacion (13-14 frente a 5 caracteristicas en 5 dimensiones).
- Reproducibilidad de experimentos: los `metrics.json` incluyen configuracion, semillas, coordenadas, historial de evaluacion, baselines, estado del codigo y entorno, lo que permite replicar condiciones exactas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido de MMLU, HumanEval o GSM8K, que no aplican a este modelo. Los resultados experimentales documentados en la model card son cualitativos y geometricos:

| Barrido | n → m | Instancias | Resultado reportado |
|---|---|---|---|
| intro | 20 → 5 | 7 sparsidades | ReLU retiene 13-14 caracteristicas; lineal retiene 5 |
| polygons | 5 → 2 | 21 densidades | Pentagono regular en las 5 semillas con 1 − S ≤ 0.05 |
| phase | 2 → 1 | 24 × 24 | Caida, asignacion de dimension o par antipodal de la segunda caracteristica |
| dimensionality | 400 → 30 | 40 sparsidades | Media dimension por caracteristica; caracteristicas a ½, ⅖ y ⅜ |

## Requisitos de hardware

- VRAM: practicamente nula; el mayor barrido (400 × 30) supone 12.000 pesos mas 400 sesgos, del orden de decenas de kilobytes en float32.
- GPU recomendadas: ninguna en particular; los barridos intro, polygons y phase se entrenaron en CPU y dimensionality en una RTX 3060.
- Cabe en cualquier GPU consumer e incluso en CPU sin problemas.
- Despliegue: no aplica servidor de inferencia (vLLM, TGI, llama.cpp, Ollama); se carga con el paquete `sardines-mlp` mediante `checkpoint.load`.
- Latencia y throughput: no disponibles; no se han publicado mediciones y el modelo no esta pensado para inferencia en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sardines-mlp | Hasta 12.000 pesos (400 × 30) | No aplica | Reproduccion de Toy Models of Superposition | MIT | Hugging Face y GitHub |
| Toy Models of Superposition (original, Elhage et al. 2022) | No disponible | No aplica | Articulo con experimentos; no publica pesos | No disponible | Transformer Circuits |
| Otros modelos toy de interpretabilidad | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros repositorios de pesos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni generativo: no procesa texto, no tiene tokenizador ni contexto, y no debe evaluarse con benchmarks de NLP.
- Los pesos son de evaluacion, no checkpoints reanudables; no se puede continuar el entrenamiento desde ellos.
- Una semilla fija un run a un tipo de dispositivo (CPU o CUDA); mezclar dispositivos invalida la reproducibilidad exacta.
- El alcance es deliberadamente sintetico y de juguete: las conclusiones sobre superposicion no se extrapolan directamente a modelos grandes sin validacion adicional.
- No se documentan sesgos, riesgos de alucinacion ni restricciones de idioma porque el modelo no opera sobre datos linguisticos.
- La licencia MIT permite uso comercial, pero el modelo carece de utilidad practica fuera de investigacion y docencia en interpretabilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/coeiico/sardines-mlp
- GitHub del proyecto: https://github.com/coeiico/sardines-mlp
- Paper original: https://transformer-circuits.pub/2022/toy_model/index.html
