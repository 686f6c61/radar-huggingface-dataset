# snupilab/Rep4Act-DiT-3B-Pretrained-100k-seed0

## Resumen

Rep4Act-DiT-3B-Pretrained-100k-seed0 es un modelo de robótica publicado por el laboratorio snupilab en Hugging Face bajo la pipeline `robotics`. Se trata de un Diffusion Transformer (DiT) orientado a la representación y generación de acciones motrices, según indican los tags `rep4act` y `actiondit`, y ha sido preentrenado sobre un conjunto de 100.000 muestras (sufijo `100k`) con la semilla 0. El modelo forma parte del ecosistema Rep4Act, presumiblemente una línea de trabajo sobre representaciones para políticas de actuación (action policies) basadas en difusión.

A pesar de que su nombre comercial indica "3B", el recuento real de parámetros en los pesos safetensors asciende a 4.915.751.713 (aproximadamente 4,92 mil millones), lo que lo sitúa en la franja de los modelos de casi 5B. El repositorio ocupa 16,0 GB y el acceso está restringido: es necesario aceptar condiciones adicionales en Hugging Face antes de poder descargar los pesos.

La relevancia de este modelo radica en su carácter de checkpoint preentrenado dentro de una familia orientada a robótica, lo que lo convierte en un punto de partida para ajuste fino en tareas de manipulación o control. No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas, arquitectura detallada ni resultados de benchmarks, y el modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para acciones, según tags `actiondit` y `rep4act`; detalles no disponibles |
| Parámetros totales | 4.915.751.713 (aprox. 4,92B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tamaño del repositorio | 16,0 GB |
| Preentrenamiento | 100k muestras, semilla 0 |
| Fecha de creación | 2026-11-07 |
| Fecha de actualización | 2026-11-07 |

## Arquitectura y entrenamiento

La información disponible únicamente permite afirmar que se trata de un Diffusion Transformer (DiT) aplicado a robótica, etiquetado como `actiondit` y asociado al proyecto `rep4act`. Los DiT son transformers que sustituyen el backbone convolucional de los modelos de difusión por bloques de atención, y en el contexto de robótica se emplean habitualmente para generar secuencias de acciones (action chunks) condicionadas por observaciones. No se dispone de detalles sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre el mecanismo exacto de condicionamiento.

En cuanto al entrenamiento, el nombre del checkpoint indica un preentrenamiento sobre 100.000 muestras con semilla 0, pero no se especifica la composición del dataset, el número de tokens o pasos, ni si hubo etapas de RLHF, DPO o ajuste por imitación. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de acciones motrices mediante difusión, orientada a políticas de control robótico.
- Preentrenamiento base para ajuste fino en tareas de manipulación o locomoción (según la naturaleza del proyecto Rep4Act).
- Integración en pipelines de robótica a través de la pipeline `robotics` de Hugging Face.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.
- No se documentan capacidades multilingües.

## Casos de uso

- Ajuste fino para manipulación robótica: el checkpoint preentrenado sobre 100k muestras puede servir como inicialización para entrenar políticas de agarre o ensamblaje en un entorno concreto, reduciendo el coste de entrenamiento desde cero.
- Investigación en políticas de difusión: útil como línea base reproducible (semilla 0) para comparar variantes de Diffusion Transformers aplicadas a acciones.
- Control de brazos robóticos en laboratorio: integrable en un bucle de inferencia que reciba observaciones y genere secuencias de acciones, siempre que se disponga de la interfaz de condicionamiento adecuada.
- Evaluación de representaciones para acción: el prefijo `rep4act` sugiere que el modelo está pensado para aprender representaciones útiles para políticas; puede emplearse en experimentos de representación y transferencia.
- Reproducción de experimentos: al estar identificado con semilla 0 y un tamaño de preentrenamiento definido, facilita la replicación de resultados en entornos de investigación.
- Base para benchmarks de robótica: puede utilizarse como punto de partida en comparativas internas de políticas de difusión frente a alternativas basadas en transformers autoregresivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 19,7 GB solo para pesos (4,92B × 4 bytes), más activaciones y memoria del scheduler de difusión.
- VRAM estimada en fp16/bf16: aproximadamente 9,8 GB para pesos, más overhead; en la práctica se recomienda al menos 16-24 GB para margen.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,9 GB para pesos; en 4 bits, aproximadamente 2,5 GB, aunque no se confirma soporte oficial de cuantización.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para entrenamiento y ajuste fino; RTX 4090 (24 GB) podría bastar para inferencia en bf16.
- GPU de consumo: posible en RTX 3090/4090 (24 GB) en bf16 para inferencia; en tarjetas de 8-12 GB solo con cuantización, cuya disponibilidad no está confirmada.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de robótica con pesos safetensors, lo habitual sería cargarlo con PyTorch y la librería asociada al proyecto Rep4Act.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con modelos comparables de la misma categoría (políticas de difusión para robótica). Los datos de arquitectura, contexto y rendimiento de este modelo no están publicados, por lo que cualquier comparación cuantitativa sería especulativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rep4Act-DiT-3B-Pretrained-100k-seed0 | 4,92B | no disponible | no disponible | gated en Hugging Face |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar su uso en entornos automatizados.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue en producción.
- Documentación mínima: no hay información sobre arquitectura interna, contexto, datos de entrenamiento ni procesos de alineación, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación y comportamiento impredecible: en modelos de difusión para acciones, la generación puede producir trayectorias no válidas o inseguras fuera de la distribución de entrenamiento.
- Sin benchmarks publicados: no es posible verificar su rendimiento frente a alternativas.
- Idiomas no disponibles: no aplica en el sentido lingüístico, pero se desconoce si el modelo procesa instrucciones en lenguaje natural.
- Sin descargas ni validación comunitaria: el repositorio no registra descargas ni likes, por lo que no hay evidencia externa de su funcionamiento.
- Uso en robótica real: requiere validación en entornos simulados y protocolos de seguridad antes de controlar hardware físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/snupilab/Rep4Act-DiT-3B-Pretrained-100k-seed0
- Colección HumanoidToolBench de snupilab: https://huggingface.co/collections/snupilab/humanoidtoolbench
