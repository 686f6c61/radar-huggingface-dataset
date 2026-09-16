# Dohyeon1/Qwen3-30B-A3B-M-SMoE-ngroups96-no-permutation

## Resumen

Dohyeon1/Qwen3-30B-A3B-M-SMoE-ngroups96-no-permutation es un checkpoint de 30.532.122.624 parámetros publicado en HuggingFace por el usuario Dohyeon1, derivado del modelo Qwen3-30B-A3B. El repositorio se etiqueta con la arquitectura `qwen3_moe` y la librería `transformers`, y ocupa 61,1 GB en formato safetensors, lo que corresponde a pesos en precisión completa (bf16/fp16) del modelo base. Por la nomenclatura del identificador, se trata de una variante experimental de mezcla de expertos dispersa (SMoE) con 96 grupos de expertos y sin permutación de los mismos, presumiblemente orientada a estudiar el comportamiento del enrutamiento frente al modelo original de 128 expertos.

La relevancia de este tipo de artefactos es de carácter investigador: permiten comparar configuraciones de agrupación de expertos y evaluar el impacto de eliminar la permutación en el router sobre la calidad y la eficiencia de la inferencia. No obstante, el repositorio no aporta información sobre el entrenamiento, los datos utilizados, la licencia ni los idiomas soportados, y la model card es la plantilla genérica autogenerada por HuggingFace con todos los campos marcados como «More Information Needed».

En el momento de redactar esta ficha (repositorio creado el 15 de septiembre de 2026), el modelo acumula 0 descargas y 0 «likes», y la búsqueda web no ha devuelto ningún resultado relevante asociado al mismo: los únicos enlaces recuperados pertenecen a un foro de Windows sin relación alguna con el modelo. Debe tratarse, por tanto, como un experimento sin validación pública ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos dispersa (MoE); etiquetada como `qwen3_moe` en transformers |
| Parametros totales | 30.532.122.624 (dato real del repositorio en safetensors) |
| Parametros activos | No disponible en la informacion proporcionada; la denominacion «A3B» del modelo base sugiere del orden de 3.300 millones, sin confirmar en este repositorio |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican versiones cuantizadas; el repositorio solo contiene safetensors en precision completa (61,1 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 61,1 GB |
| Variante declarada en el nombre | SMoE con 96 grupos (`ngroups96`) y sin permutacion de expertos |
| Pipeline | text-generation |
| Fecha de creacion | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

El repositorio se publica con la etiqueta de arquitectura `qwen3_moe`, lo que indica que los pesos siguen el esquema de transformer con mezcla de expertos (MoE) introducido en la familia Qwen3. En un modelo MoE de este tipo, cada capa de alimentación hacia delante se sustituye por un conjunto de expertos y un router que selecciona un subconjunto por token, de modo que el coste de cómputo por token depende de los parámetros activos y no de los totales. La variante aquí publicada modifica presuntamente dos aspectos del esquema original: el número de grupos de expertos, fijado en 96 según el propio identificador del modelo, y la eliminación de la permutación de expertos, práctica habitual para equilibrar la carga entre dispositivos.

No se dispone de información alguna sobre el proceso de entrenamiento de este checkpoint: ni el número de tokens, ni la composición del dataset, ni si hubo ajuste por instrucciones (SFT), optimización por preferencias (RLHF/DPO) o una fase de razonamiento con RL. Tampoco se documenta si el modelo se obtuvo mediante un entrenamiento desde cero sobre la arquitectura modificada, mediante una conversión de los pesos del Qwen3-30B-A3B original o mediante un ajuste fino posterior. La model card únicamente contiene la plantilla automática de HuggingFace con todos los apartados sin rellenar, y no se ha publicado ningún artículo, informe técnico ni repositorio de código asociado.

Como consecuencia, cualquier afirmación sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, modos de razonamiento explícitos) sería especulativa y no se incluye en esta ficha.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`, por lo que el modelo está preparado para completar diálogos multi-turno.
- Capacidades heredadas del modelo base: al derivar de Qwen3-30B-A3B, es previsible que conserve razonamiento, generación de código y matemáticas, así como soporte de tool calling; no obstante, no hay ninguna verificación publicada en este repositorio y las modificaciones del enrutamiento podrían degradarlas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible; no se declara ningún idioma en la ficha.
- Capacidades especiales (modo thinking, visión, audio): no disponible (no documentado).
- Uso previsto declarado: ninguno; la sección «Direct Use» de la model card está vacía.

## Casos de uso

- Investigación sobre enrutamiento en MoE: el modelo permite comparar una configuración de 96 grupos de expertos sin permutación frente al agrupamiento original, midiendo el equilibrio de carga entre expertos y la perplejidad resultante en tareas de validación controladas.
- Estudios de ablación reproducibles: al mantener el mismo número de parámetros totales que el modelo base, sirve como punto de comparación directo para aislar el efecto de la permutación de expertos sin cambiar la arquitectura global.
- Punto de partida para ajuste fino experimental: un equipo de investigación puede aplicar SFT sobre dominios concretos (código, texto jurídico, documentación técnica) para medir si la nueva agrupación de expertos responde mejor o peor al ajuste que el modelo original.
- Destilación y análisis de especialización de expertos: la estructura de grupos puede analizarse para estudiar qué expertos se activan con qué tipos de token, un tipo de trabajo de interpretabilidad habitual en modelos MoE.
- Generación de texto por lotes en clústeres de investigación: con dos aceleradores de 80 GB es viable ejecutar inferencia en bf16 dentro de un entorno controlado, sin requisitos de latencia estricta, para generar corpus sintéticos o anotaciones a gran escala.
- Reproducción de resultados en entornos académicos: dado que el repositorio publica los pesos completos en safetensors, un grupo de investigación puede verificar afirmaciones sobre arquitecturas MoE modificadas sin depender de artefactos propietarios.
- No se recomienda su uso en producción, atención al cliente o cualquier flujo con usuarios finales: no hay licencia declarada, no hay benchmarks publicados, no hay garantías de calidad y el modelo no ha sido evaluado por terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye ninguna sección de evaluación cumplimentada, no se ha publicado ningún informe técnico asociado y la búsqueda web no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del número de parámetros reales (30.532 millones); no hay mediciones publicadas por el autor.

- VRAM para inferencia en bf16/fp16: aproximadamente 61 GB solo para los pesos, más caché KV y activaciones, lo que sitúa el requisito práctico en torno a 65-70 GB.
- GPU para precisión completa: 2× NVIDIA A100 80 GB, 2× H100 80 GB o 1× H200 141 GB. Una sola A100 de 40 GB o una L40S de 48 GB son insuficientes en bf16.
- Cuantización a 8 bits: alrededor de 30-32 GB de VRAM, viable en 1× A100 80 GB, 1× H100 80 GB o, con margen ajustado, 1× L40S 48 GB. Requiere generar la cuantización por cuenta propia, ya que no se publica ninguna.
- Cuantización a 4 bits: del orden de 17-19 GB, lo que permitiría ejecución en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB). De nuevo, sería necesario producir primero la cuantización.
- Ejecución en CPU: los pesos en bf16 requieren unos 61 GB de RAM; una cuantización Q4 reducida a formato GGUF podría bajar hasta aproximadamente 18 GB, pero no existe ningún GGUF publicado en el repositorio.
- GPU de consumo: no cabe en ninguna GPU de consumo en bf16. Solo sería viable en tarjetas de 24 GB tras cuantización agresiva y con gestión cuidadosa de la caché KV.
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers` y con endpoints. vLLM, SGLang o TGI deberían ser teóricamente compatibles al existir soporte de `qwen3_moe` en esas herramientas, pero conviene verificar la carga de pesos, porque el checkpoint está modificado (96 grupos, sin permutación) y es probable que las implementaciones estándar asuman la configuración original de 128 expertos.
- Latencia y throughput: no disponibles. Cualitativamente, al tratarse de un MoE con un número reducido de parámetros activos por token, el coste de decodificación por token se aproximaría al de un modelo denso de ese tamaño, no al de uno de 30.000 millones, pero no hay ninguna medición publicada que lo confirme.

## Comparativa con modelos similares

Los datos de la fila correspondiente al modelo base proceden de la documentación pública de Qwen3-30B-A3B y no de este repositorio; se incluyen solo como referencia orientativa.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dohyeon1/Qwen3-30B-A3B-M-SMoE-ngroups96-no-permutation | 30.532 M | No disponible | No disponible | No disponible | Repositorio HuggingFace, sin cuantizaciones ni benchmarks |
| Qwen3-30B-A3B (modelo base, datos publicos) | ~30.500 M | ~3.300 M | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 (segun documentacion publica del base) | Ampliamente distribuido, con versiones GGUF y cuantizadas |
| Otros modelos comparables de ~30B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer comparaciones cuantitativas de rendimiento entre esta variante y alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla autogenerada y no describe datos de entrenamiento, hiperparámetros, uso previsto ni evaluación.
- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial ni de redistribución; en la práctica, el modelo no debería utilizarse en productos o servicios sin aclarar antes este punto con el autor.
- Riesgo de alucinación: no evaluado. No existe ningún estudio de fidelidad factual ni de tasas de error publicadas para esta variante.
- Sesgos conocidos: no documentados. Al derivar de un modelo base entrenado con corpus web a gran escala, es razonable esperar sesgos sociales y culturales heredados, pero no se han medido.
- Idiomas: no se declara ningún idioma soportado, por lo que no puede garantizarse el rendimiento en castellano ni en ninguna otra lengua.
- Compatibilidad de pesos: al tratarse de una modificación estructural (96 grupos, sin permutación), es previsible que las herramientas estándar fallen al cargar el checkpoint o que lo carguen silenciosamente de forma incorrecta. Debe validarse la correspondencia de las claves del state dict antes de cualquier uso serio.
- Riesgo de degradación por la modificación: eliminar la permutación de expertos puede provocar desequilibrio de carga y pérdida de calidad; no hay ninguna evaluación publicada que confirme que el modelo conserva las capacidades del base.
- Sin cuantizaciones publicadas: cualquier despliegue eficiente exige que el usuario genere sus propios pesos cuantizados y valide que la calidad se mantiene.
- Adopción nula: 0 descargas y 0 «likes» implican que el checkpoint no ha sido validado por terceros, no hay issues resueltos ni ejemplos de uso verificables.
- Idoneidad: apropiado únicamente como material de investigación; no apto para producción, aplicaciones con usuarios finales ni decisiones automatizadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dohyeon1/Qwen3-30B-A3B-M-SMoE-ngroups96-no-permutation
- Articulo citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico mencionada en la model card: https://mlco2.github.io/impact
- No se han encontrado articulos, repositorios de codigo, demos ni publicaciones de blog asociados a este modelo en la busqueda web realizada. Los unicos resultados devueltos pertenecen a un foro de Windows 10 sin relacion con el modelo.
