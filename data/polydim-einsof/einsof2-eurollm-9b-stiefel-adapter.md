# Polydim-Einsof/einsof2-eurollm-9b-stiefel-adapter

## Resumen

El modelo `Polydim-Einsof/einsof2-eurollm-9b-stiefel-adapter` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario Polydim-Einsof. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación entrenados mediante SFT (supervised fine-tuning) sobre el modelo base `utter-project/EuroLLM1.5-9B-SFT`, un modelo de 9.000 millones de parámetros orientado a lenguas europeas. El adaptador se distribuye en formato safetensors compatible con la librería PEFT y el ecosistema Transformers/TRL.

La relevancia de esta ficha es limitada: el repositorio no incluye model card sustantiva (la plantilla está sin rellenar), no declara licencia, no especifica idiomas soportados y no publica resultados de evaluación. El tamaño del repositorio (0,1 GB) es coherente con un adaptador LoRA de rango bajo sobre un modelo de 9B, no con un modelo completo. A fecha de creación del registro no consta ninguna descarga ni interacción pública, por lo que se trata de un artefacto experimental sin validación externa conocida.

El interés técnico reside en el modelo base subyacente: EuroLLM1.5-9B-SFT es un transformer decoder-only entrenado por el consorcio utter-project con especial énfasis en cobertura multilingüe europea. Cualquier capacidad práctica del adaptador depende enteramente de las del modelo base, ya que el adaptador solo modifica un subconjunto de pesos mediante una transformación de bajo rango.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (modelo base EuroLLM1.5-9B-SFT) |
| Parametros totales | No disponible (el adaptador LoRA ocupa 0,1 GB; el modelo base tiene 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; heredada del modelo base (no especificada en la información proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el modelo base EuroLLM está orientado a lenguas europeas, pero el adaptador no declara idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Libreria | peft 0.21.3 |
| Modelo base | utter-project/EuroLLM1.5-9B-SFT |
| Tipo de entrenamiento | SFT (supervised fine-tuning) |
| Tarea | text-generation / conversational |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA, que congela los pesos del modelo base e inyecta matrices de descomposición de bajo rango en determinadas capas lineales, reduciendo drásticamente el número de parámetros entrenables. Según los tags del repositorio, el entrenamiento se realizó con TRL (Transformer Reinforcement Learning) en modo SFT, es decir, ajuste supervisado sobre pares instrucción-respuesta. No se especifican el rango (`r`), el `alpha`, las capas objetivo ni la composición del dataset de entrenamiento.

El modelo base, EuroLLM1.5-9B-SFT, es un transformer decoder-only de 9B parámetros desarrollado por el consorcio utter-project con el objetivo de cubrir las lenguas oficiales de la Unión Europea y otras lenguas europeas. La versión SFT indica que ya ha pasado por un ajuste supervisado previo; este adaptador añade una capa adicional de especialización, presumiblemente sobre un dominio o estilo concreto. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos) en la información disponible.

## Capacidades

- Generación de texto conversacional, heredada del modelo base y del ajuste SFT.
- Ajuste de estilo o dominio específico mediante LoRA, aunque el dominio concreto no está documentado.
- Compatibilidad con el ecosistema Transformers y PEFT: carga mediante `PeftModel.from_pretrained` sobre el modelo base.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas en el adaptador; dependen del modelo base EuroLLM.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación con fine-tuning paramétricamente eficiente: el adaptador sirve como ejemplo reproducible de cómo aplicar LoRA con TRL sobre un modelo multilingüe de 9B, útil para investigadores que quieran replicar el pipeline.
- Adaptación de dominio sobre EuroLLM: si el adaptador fue entrenado sobre un corpus concreto (no documentado), podría reutilizarse como punto de partida para ajustes posteriores sobre el mismo dominio.
- Evaluación comparativa de adaptadores: al ser un artefacto pequeño (0,1 GB), permite probar la técnica de fusión de pesos (`merge_and_unload`) y medir el impacto en la perplejidad del modelo base.
- Prototipado de asistentes conversacionales en lenguas europeas: cargando el adaptador sobre EuroLLM1.5-9B-SFT se obtiene un modelo conversacional que puede desplegarse en entornos de prueba con vLLM o TGI, siempre que se valide su calidad.
- Investigación sobre olvido catastrófico: comparar las respuestas del modelo base con y sin adaptador permite estudiar qué capacidades se degradan tras el SFT de bajo rango.
- Docencia y formación: útil como caso práctico en cursos sobre PEFT, mostrando la estructura de un repositorio LoRA y su integración con Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB, pero requiere cargar el modelo base EuroLLM1.5-9B-SFT (aproximadamente 18 GB en fp16) para funcionar.
- VRAM estimada para inferencia del modelo base: ~18-20 GB en fp16, ~10-12 GB en cuantización de 8 bits, ~6-7 GB en 4 bits (estimaciones orientativas; no confirmadas en la información proporcionada).
- GPU recomendadas: A100 40GB, H100 80GB para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 justo; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo (RTX 4090, 3090) solo con cuantización o en fp16 al límite de VRAM.
- Opciones de despliegue: vLLM, TGI y llama.cpp no soportan adaptadores PEFT de forma nativa en todos los casos; la ruta más directa es Transformers + PEFT, fusionando pesos con `merge_and_unload` antes de exportar a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| einsof2-eurollm-9b-stiefel-adapter (este) | Adaptador LoRA sobre 9B | No disponible | No disponible | safetensors (PEFT) | Sin benchmarks ni model card sustantiva |
| utter-project/EuroLLM1.5-9B-SFT (base) | 9B | No disponible en la información | No disponible | safetensors | Modelo multilingüe europeo con SFT previo |
| Adaptadores LoRA genéricos sobre Llama-3-8B | Adaptador sobre 8B | 8K (típico) | Llama 3 license | safetensors (PEFT) | Ecosistema mucho más maduro y documentado |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa completa con licencia permisiva y benchmarks públicos |

La comparación directa es difícil porque este repositorio es un adaptador sin documentación, mientras que las alternativas son modelos completos con model cards detalladas. La principal diferencia frente a otros adaptadores LoRA es la falta de información sobre dataset, hiperparámetros y evaluación.

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido. Se debe contactar con el autor o consultar la licencia del modelo base.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto y depende del modelo base.
- Riesgo de alucinación y sesgos heredado del modelo base EuroLLM1.5-9B-SFT, no evaluado en este adaptador.
- Sin descargas ni validación comunitaria: no hay evidencia de que el adaptador funcione correctamente o de que los pesos estén íntegros.
- El adaptador solo es utilizable junto con el modelo base exacto (`utter-project/EuroLLM1.5-9B-SFT`); cargarlo sobre otro checkpoint puede producir resultados erróneos.
- No apto para producción sin una evaluación exhaustiva previa: no hay benchmarks, ni pruebas de robustez, ni documentación de sesgos.
- El tag `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre impacto ambiental, citado en la plantilla de la model card; no es una referencia técnica del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Polydim-Einsof/einsof2-eurollm-9b-stiefel-adapter
- Modelo base: https://huggingface.co/utter-project/EuroLLM1.5-9B-SFT
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Artículo citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
