# ania3000/untrained-tjbert-e

## Resumen

`ania3000/untrained-tjbert-e` es un checkpoint publicado en Hugging Face por la usuaria ania3000 (Anna Shatskikh) con arquitectura BERT y cabeza de `fill-mask`. El propio identificador del repositorio incluye el término «untrained», lo que sugiere que los pesos no han pasado por un proceso de preentrenamiento y corresponden a una inicialización aleatoria de la arquitectura. El repositorio tiene 105.267.880 parámetros en formato safetensors y ocupa 0,4 GB, un tamaño coherente con un BERT de escala base en precisión fp32.

La relevancia del modelo no está en sus capacidades —no las tiene en el estado actual— sino como caso práctico de dos fenómenos habituales en el ecosistema: repositorios generados automáticamente con la plantilla de model card vacía y publicaciones de checkpoints sin entrenar que pueden confundirse con modelos funcionales por su etiqueta de pipeline. La model card no aporta información sobre datos de entrenamiento, licencia, idiomas ni evaluación.

Para un desarrollador o investigador, este repositorio sirve como base estructural para experimentos de preentrenamiento, pruebas de infraestructura de inferencia o docencia sobre arquitecturas transformer encoder-only, nunca como modelo listo para producción. Cualquier uso que espere salidas semánticamente válidas de `fill-mask` obtendrá tokens sin sentido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only) con cabeza de enmascaramiento de tokens (`fill-mask`) |
| Parámetros totales | 105.267.880 (dato real del safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica; no confirmado) |
| Tipos de cuantización | No disponible en el repositorio; al ser BERT admite fp32, fp16, bf16 e int8 mediante cuantización posterior al entrenamiento |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (también compatible con `transformers`) |
| Pipeline declarado | `fill-mask` |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer encoder-only de tipo BERT, con tokenizador y vocabulario no verificables desde la información disponible, y una cabeza de predicción de token enmascarado sobre la representación contextual. El número de parámetros (105,3 M) es ligeramente inferior al de `bert-base-uncased` (109,5 M), diferencia compatible con variaciones en el tamaño del vocabulario, la presencia o ausencia de la capa `pooler` o decisiones de configuración de las capas ocultas. No hay información que permita confirmar la configuración exacta (número de capas, dimensión oculta, cabezas de atención).

No se ha publicado información sobre datos de entrenamiento, número de tokens procesados, composición del corpus, objetivos auxiliares (MLM/NSP), ni sobre fases de ajuste como RLHF o DPO. El término «untrained» del identificador apunta a que el checkpoint no ha completado ninguna fase de preentrenamiento, de modo que los pesos serían una inicialización aleatoria. La etiqueta `arxiv:1910.09700` que aparece en el repositorio remite a Lacoste et al., el artículo del calculador de impacto de carbono citado en la plantilla de model card, no a un paper descriptivo del modelo.

## Capacidades

- Generación de texto: no aplica; es un modelo encoder-only con cabeza de `fill-mask`, no un modelo generativo autorregresivo.
- Relleno de tokens enmascarados (`fill-mask`): la arquitectura lo soporta, pero al no estar entrenado las predicciones no tienen valor semántico.
- Extracción de embeddings contextuales: la estructura del encoder permite obtener representaciones por token y por secuencia, reutilizables tras un ajuste fino supervisado.
- Ajuste fino para clasificación de secuencias, etiquetado de tokens (NER, POS), Question Answering extractivo y similitud semántica: viable a nivel arquitectónico, partiendo de un preentrenamiento previo.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; no se declara vocabulario ni cobertura idiomática.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con endpoints de Hugging Face: el repositorio lleva la etiqueta `endpoints_compatible`.

## Casos de uso

- Inicialización base para experimentos de preentrenamiento: útil para validar pipelines de MLM a pequeña escala antes de lanzar un entrenamiento completo, ya que la arquitectura y el tokenizador están definidos y el checkpoint carga sin errores.
- Docencia sobre arquitecturas transformer: permite inspeccionar atención, dimensiones y número de parámetros de un BERT real sin la opacidad de un modelo ya entrenado, y demostrar empíricamente la diferencia entre pesos aleatorios y pesos preentrenados.
- Pruebas de integración de infraestructura de inferencia: sirve como carga de 105 M de parámetros para verificar despliegues con `transformers`, TGI u ONNX Runtime, medir tiempos de arranque y validar rutas de servicio antes de sustituir por el modelo definitivo.
- Test unitario en pipelines MLOps: útil como fixture estable en tests de serialización, conversión de safetensors a otros formatos y comprobación de contratos de API, al no depender de pesos externos ni de descargas grandes.
- Referencia de línea base en investigación sobre dinámica de entrenamiento: punto de partida documentado para comparar métricas de pérdida MLM y convergencia frente a un modelo con el mismo número de parámetros pero ya preentrenado.
- Evaluación comparativa de tokenizadores: permite aislar el comportamiento del tokenizador asociado del efecto de los pesos entrenados, útil en estudios sobre fertilidad de vocabulario en castellano u otras lenguas.
- Demostración de riesgos de gobernanza de modelos: caso concreto para ilustrar por qué un repositorio sin model card, sin licencia y sin métricas no debería promoverse a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación con datos, la ficha de Hugging Face no reporta métricas y no existen descargas ni discusiones que permitan inferir validación por terceros. Al tratarse presumiblemente de un checkpoint sin entrenar, cualquier métrica de MMLU, GLUE, SQuAD o similar sería equivalente a la de una inicialización aleatoria y no resultaría informativa.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,42 GB solo para pesos, más activaciones y memoria del tokenizador; por debajo de 1 GB en la práctica con lotes pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 0,21 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,11 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; sirve una GTX 1650, T4, L4, RTX 3060 o superior. No requiere A100 ni H100 salvo que se busque throughput masivo por lotes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier modelo con soporte CUDA, e incluso en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: `transformers` (`pipeline("fill-mask")`), Text Generation Inference (soporta `fill-mask`), ONNX Runtime, Triton Inference Server y TorchServe. `llama.cpp` y Ollama no son la vía natural para un BERT con cabeza MLM; su soporte para arquitecturas encoder-only es limitado y orientado a embeddings.
- Latencia y throughput: no se han publicado mediciones en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ania3000/untrained-tjbert-e | 105,3 M | No disponible | Sin entrenar (según el identificador) | No disponible | Hugging Face, 0 descargas |
| bert-base-uncased | ~109,5 M | 512 tokens | Preentrenado (MLM + NSP) | Apache 2.0 | Hugging Face, ampliamente usado |
| distilbert-base-uncased | ~66 M | 512 tokens | Preentrenado por destilación | Apache 2.0 | Hugging Face |
| roberta-base | ~125 M | 512 tokens | Preentrenado (MLM) | MIT | Hugging Face |

Los datos de los tres modelos de referencia provienen de su documentación pública habitual y no de la información proporcionada en esta ficha; se incluyen solo como contexto de categoría. La diferencia funcional determinante no es el tamaño ni el contexto, sino que los tres alternativos están entrenados y el modelo analizado no. Existe además `ania3000/demo-tjbert`, del mismo autor, que sí declara licencia Apache 2.0 y fue generado desde `Trainer`; no se ha confirmado la relación entre ambos repositorios.

## Limitaciones y advertencias

- Pesos presumiblemente aleatorios: cualquier llamada a `fill-mask` devolverá tokens sin relación semántica con la frase de entrada. No debe usarse como sustituto de un modelo preentrenado.
- Ausencia total de model card sustantiva: todos los campos relevantes (autoría, tipo, idiomas, licencia, datos, evaluación) figuran como `[More Information Needed]`.
- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial, y la situación jurídica es incierta incluso para uso interno en una organización.
- Idiomas no declarados: no se puede asumir cobertura del castellano ni de ninguna otra lengua sin verificar el vocabulario del tokenizador.
- Sesgos: no evaluables, al no existir datos de entrenamiento ni evaluación; un modelo sin entrenar no ha absorbido sesgos de corpus, pero tampoco ofrece ninguna garantía de comportamiento.
- Riesgo de confusión: la etiqueta de pipeline `fill-mask` y el formato estándar de Hugging Face pueden llevar a integrar el modelo en un prototipo sin advertir que no está entrenado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe el riesgo de interpretar como señal las salidas aleatorias del cabezal MLM en un análisis automático.
- Sin validación de la comunidad: 0 descargas y 0 likes implican ausencia de revisión por terceros, de informes de errores y de evidencia de funcionamiento en producción.
- Etiqueta `arxiv` engañosa: `arxiv:1910.09700` corresponde a Lacoste et al. sobre emisiones de carbono, no a un artículo que describa o valide este modelo.
- Recomendación: si se necesita un BERT funcional en castellano o multilingüe, usar un checkpoint preentrenado con licencia declarada y métricas publicadas; este repositorio solo tiene sentido como material de pruebas o docencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ania3000/untrained-tjbert-e
- Perfil del autor: https://huggingface.co/ania3000
- Otro repositorio del mismo autor, con licencia Apache 2.0 declarada: https://huggingface.co/ania3000/demo-tjbert
- Artículo referenciado por la etiqueta `arxiv` (Lacoste et al., impacto de carbono): https://arxiv.org/abs/1910.09700
- Calculador de impacto medioambiental citado en la model card: https://mlco2.github.io/impact
