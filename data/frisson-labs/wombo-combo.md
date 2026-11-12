# frisson-labs/Wombo-Combo

## Resumen

Wombo Combo es un modelo de política (policy) para Super Smash Bros. Melee desarrollado por Frisson Labs, un experimento publicado en Hugging Face como un artefacto de inferencia en PyTorch. No es un modelo de lenguaje: se trata de una política cooperativa entrenada para controlar dos bots de Fox que atacan en equipo a un oponente dummy en el escenario Final Destination, con el objetivo de encadenar el combo más largo posible. El modelo se deriva de Faynt, la línea de políticas de Melee de Frisson Labs, y comparte pesos entre ambos bots, manteniendo historiales de predicción independientes por fila.

El modelo se distribuye como un conjunto de pesos (`base.pt`, `adapter.pt`), junto con `config.json`, `feature_schema.json` y checksums SHA-256. El pipeline declarado es `other` y la librería es PyTorch; el repositorio ocupa aproximadamente 0,1 GB. No se publican parámetros, arquitectura interna, licencia ni idiomas en la información disponible.

Su relevancia es limitada y experimental: el propio autor advierte que los resultados varían entre partidas y que no se ha evaluado el rendimiento con compañeros humanos, contra oponentes humanos, en otros escenarios, con friendly fire activado o en partidas 2v2 generales. Es, por tanto, una demo de investigación orientada a la comunidad de emulación y aprendizaje por refuerzo aplicado a juegos de lucha, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política PyTorch derivada de Faynt; estructura interna no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (sin ventana de contexto de lenguaje; entradas por frame con 186 características de estado de compañero/puntuación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural; "Wombo Combo takes no language phrase") |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`base.pt`, `adapter.pt`) junto con `config.json`, `feature_schema.json` y `checksums.sha256` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se sabe que es una política implementada en PyTorch, derivada de Faynt, que comparte pesos entre los dos bots Fox y mantiene historiales de predicción separados por fila, permitiendo reiniciar cada fila de forma independiente. La inferencia se realiza mediante el paquete `reyn` (`Combo.load("combo-files")`), que expone `predict` sobre frames y características, devolviendo acciones, etiquetas y logits. El runtime utiliza una tabla fija guardada de acciones del compañero y verifica las identidades exactas de `base` y `adapter`.

Cada fila de bot requiere la observación base más 186 características de estado de compañero/puntuación en el orden documentado en `feature_schema.json`. No se especifican el número de tokens, la composición del dataset de entrenamiento, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por refuerzo, aunque por la naturaleza del dominio (Melee) es plausible que se trate de un entrenamiento por refuerzo o imitación, extremo que no se confirma en la documentación.

## Capacidades

- Control de dos personajes Fox de forma cooperativa en Super Smash Bros. Melee, compartiendo pesos pero con historiales de predicción independientes.
- Predicción de acciones por frame a partir de la observación base y 186 características de estado de compañero/puntuación.
- Encadenamiento de combos sobre un oponente dummy que no responde, con daño inicial al 0 %, cuatro stocks y friendly fire desactivado.
- Gestión de estado por fila con reinicio independiente (`model.reset(seed=0)`).
- Exposición de logits y etiquetas de acción para análisis posterior.
- No procesa lenguaje natural ni instrucciones textuales.
- No se documentan capacidades de tool calling, agentes, visión, audio, matemáticas, código ni multilingüismo.

## Casos de uso

- Investigación en aprendizaje por refuerzo aplicado a juegos de lucha: servir como política de referencia para estudiar el encadenamiento de combos cooperativos en Melee, comparando variantes de entrenamiento y recompensas.
- Generación de clips demostrativos: producir animaciones de combos cooperativos entre dos Fox para blogs, demos o material divulgativo, como el GIF incluido en la model card.
- Benchmark interno de políticas de Melee: usar el modelo como línea base frente a otras políticas de la colección Reyn de Frisson Labs en experimentos controlados sobre Final Destination.
- Pruebas de integración del runtime `reyn`: validar el pipeline de inferencia (`Combo.load`, `predict`, `reset`) y el esquema de 186 características en entornos de desarrollo antes de desplegar políticas más complejas.
- Estudio de coordinación multiagente con pesos compartidos: analizar cómo dos agentes con la misma red pero historiales separados se coordinan para mantener un combo, útil para investigación en cooperación multiagente.
- Educación y divulgación técnica: ilustrar conceptos de políticas neuronales en videojuegos mediante un ejemplo acotado y reproducible con pesos públicos y checksums verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un clip destacado ("highlight") y advierte explícitamente que los resultados varían entre partidas y que no se ha medido el rendimiento con compañeros humanos, contra oponentes humanos, en otros escenarios, con friendly fire activado ni en 2v2 general.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa aproximadamente 0,1 GB, lo que sugiere que los pesos son pequeños y probablemente quepan en cualquier GPU consumer, aunque no se confirma.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU consumer: no confirmada; por el tamaño del artefacto (0,1 GB) es plausible que funcione en GPUs modestas, pero no se especifica.
- Opciones de despliegue: paquete de inferencia PyTorch `reyn` de Frisson Labs (`Combo.load("combo-files")`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wombo Combo | Política cooperativa para Melee (Fox x2) | no disponible | no disponible | no disponible | Hugging Face (`frisson-labs/Wombo-Combo`) |
| Faynt (Frisson Labs) | Política base para Melee de la que deriva Wombo Combo | no disponible | no disponible | no disponible | Hugging Face (colección Reyn) |
| Otras políticas de la colección Reyn | Políticas de Melee de Frisson Labs | no disponible | no disponible | no disponible | Hugging Face (colección Reyn) |

No se dispone de datos de rendimiento, parámetros ni contexto de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Resultados no robustos: el autor indica que los resultados varían entre partidas y que el clip mostrado es un highlight, no una medida representativa.
- Sin evaluación fuera del escenario dummy: no se ha medido el rendimiento con compañeros humanos, contra oponentes humanos, en otros escenarios, con friendly fire activado ni en 2v2 general.
- Oponente no reactivo: el dummy no contraataca, por lo que el modelo no está validado frente a oponentes que responden.
- Dependencia de esquema estricto: requiere las 186 características en el orden documentado y verifica las identidades exactas de `base` y `adapter`; entradas inconsistentes pueden romper la inferencia.
- Sin soporte de lenguaje: no acepta frases ni instrucciones textuales.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas no disponibles: irrelevante para la tarea, pero ausente en los metadatos.
- Sin datos de sesgos, alucinación o robustez: no se documentan análisis de sesgo ni de fallos del modelo en producción.
- Madurez experimental: el propio autor lo describe como un experimento hecho "for fun", no como un componente listo para producción.

## Enlaces

- Hugging Face: https://huggingface.co/frisson-labs/Wombo-Combo
- Proyecto de inferencia (Reyn): https://github.com/frisson-labs/Reyn#wombo-combo
- Esquema exacto de entradas: https://github.com/frisson-labs/Reyn/blob/main/docs/combo-inputs.md
- Colección Reyn: https://huggingface.co/collections/frisson-labs/reyn-6af5d6e9506dca3a131b13c3
- Modelo base Faynt: https://huggingface.co/collections/frisson-labs/faynt
- GIF de demostración: https://huggingface.co/frisson-labs/Wombo-Combo/resolve/main/assets/wombo-combo.webp
- Cabecera del modelo: ./assets/wombo-header.png (ruta relativa dentro del repositorio)
