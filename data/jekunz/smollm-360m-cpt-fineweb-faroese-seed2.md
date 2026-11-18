# jekunz/smollm-360m-cpt-fineweb-faroese-seed2

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-seed2` es un ajuste fino por continuación de preentrenamiento (CPT, *continued pre-training*) del modelo instructivo `HuggingFaceTB/SmolLM2-360M-Instruct` sobre la porción en feroés del corpus `HuggingFaceFW/fineweb-2`. Lo publica el usuario `jekunz` como parte de una investigación personal sobre adaptación lingüística de modelos pequeños a idiomas de bajos recursos, en este caso el feroés (`fo`), hablado por unas 50.000 personas en las Islas Feroe.

El modelo conserva la arquitectura transformer decoder-only de SmolLM2 con 361.821.120 parámetros (aproximadamente 362 millones) y una ventana de contexto de entrenamiento de 2048 tokens. Su relevancia radica en que ejemplifica una estrategia de bajo coste (una sola GPU A100 de 40 GB, 5 épocas) para dotar a un modelo pequeño de mayor competencia en un idioma escasamente representado en los corpus mayoritarios, manteniendo la licencia permisiva Apache 2.0 del modelo base.

No obstante, el propio autor advierte de que se trata de un modelo destinado a su investigación y que no ha sido evaluado de forma amplia. Se publica como uno de tres *seeds* (semillas) de una misma configuración de entrenamiento, lo que sugiere que su interés es principalmente experimental y comparativo dentro de un estudio de robustez frente a la inicialización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, SmolLM2) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de llama.cpp/GGUF por arquitectura, aunque no se documenta) |
| Idiomas soportados | feroés (`fo`); el modelo base soporta inglés y otros idiomas, pero el ajuste se centra en feroés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `SmolLM2-360M-Instruct`, un transformer decoder-only de la familia Llama con normalización RMSNorm, activación SwiGLU, RoPE y atención con *grouped-query attention* (GQA) según la arquitectura estándar de SmolLM2. Sobre esa base se aplica un ajuste fino supervisado (o CPT con formato conversacional, dado que el modelo base es instructivo) sobre texto en feroés extraído de `fineweb-2`.

Los hiperparámetros documentados por el autor son: 5 épocas, tasa de aprendizaje 5e-4 con scheduler coseno, *warmup ratio* de 0,05, tamaño de lote 8 con 32 pasos de acumulación de gradiente (lote efectivo 256), longitud máxima de contexto de 2048 tokens, entrenamiento en una única GPU A100 de 40 GB y semilla 2. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones técnicas adicionales más allá del propio procedimiento de CPT.

## Capacidades

- Generación de texto conversacional en feroés, heredada del formato instructivo del modelo base.
- Razonamiento y respuesta a instrucciones básicas, limitado por el tamaño de 362 millones de parámetros.
- Generación de código y matemáticas elementales (capacidad heredada del modelo base, no específicamente reforzada en feroés).
- Soporte de *tool calling* / *function calling*: no documentado explícitamente para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo limita esta capacidad.
- Capacidades multilingües: el ajuste se centra en feroés; el resto de idiomas del modelo base pueden verse degradados por el olvido catastrófico tras el CPT.
- Capacidades especiales (visión, audio, *thinking mode*): no disponibles.

## Casos de uso

- Adaptación lingüística de asistentes conversacionales en feroés: el modelo puede gestionar diálogos multi-turno en feroés dentro de su ventana de 2048 tokens, útil para prototipos de atención al cliente en instituciones locales.
- Investigación sobre CPT en lenguas de bajos recursos: sirve como punto de comparación (seed 2 de 3) para estudiar la varianza entre inicializaciones en experimentos de adaptación lingüística.
- Generación de texto y resúmenes en feroés: adecuado para tareas de redacción asistida o resumen de documentos cortos donde no se requiere alta fidelidad factual.
- Traducción asistida feroés-inglés en entornos de bajo recursos: el modelo puede emplearse como componente de un pipeline de traducción o como generador de borradores para revisión humana.
- Despliegue en *edge* y dispositivos con recursos limitados: con 362 millones de parámetros y pesos en safetensors de ~0,7 GB, cabe en GPUs de consumo y en CPU con cuantización, lo que permite prototipos locales sin infraestructura dedicada.
- Filtrado y clasificación de texto en feroés: puede usarse como modelo generativo para tareas de etiquetado ligero o aumento de datos en corpus feroeses.
- Educación e investigación académica: útil como ejemplo didáctico de ajuste fino de un modelo pequeño a un idioma específico con un presupuesto de cómputo reducido (una A100).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,7 GB en FP16/BF16 para los pesos; ~0,4 GB en cuantización de 8 bits y ~0,2 GB en 4 bits (estimaciones basadas en el tamaño de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; A100/H100 no son necesarias para inferencia, solo se usó una A100 de 40 GB para el entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, así como en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta `endpoints_compatible`), y potencialmente llama.cpp/Ollama mediante conversión a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jekunz/smollm-360m-cpt-fineweb-faroese-seed2` | 361,8 M | 2048 | Apache 2.0 | Hugging Face | CPT en feroés, sin benchmarks publicados |
| `HuggingFaceTB/SmolLM2-360M-Instruct` | ~362 M | 2048 (entrenamiento) | Apache 2.0 | Hugging Face | Modelo base; multilingüe, sin foco específico en feroés |
| `HuggingFaceTB/SmolLM2-135M-Instruct` | ~135 M | 2048 | Apache 2.0 | Hugging Face | Alternativa más pequeña de la misma familia, menor capacidad |
| `meta-llama/Llama-3.2-1B-Instruct` | ~1,2 B | 128 K | Llama 3.2 Community License | Hugging Face | Mayor tamaño y contexto, licencia más restrictiva |

No se dispone de datos de rendimiento comparativo para el modelo ajustado, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo está destinado a su investigación y que no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación previa.
- Riesgo de olvido catastrófico: el CPT sobre feroés puede degradar las capacidades del modelo base en inglés y otros idiomas.
- Riesgo de alucinación elevado por el tamaño reducido (362 M) y por el dominio limitado del corpus de entrenamiento.
- Ventana de contexto de solo 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos desconocidos: no se documenta análisis de sesgos ni de toxicidad; el corpus `fineweb-2` puede contener sesgos heredados de la web.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de SmolLM2 conviene verificar las condiciones del modelo base y de los datos de entrenamiento.
- No se documentan los tokens totales de entrenamiento ni la composición exacta del dataset, lo que dificulta la reproducibilidad.
- El modelo se publica como uno de tres seeds; los resultados pueden variar entre semillas y no se reporta la varianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-seed2
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Repositorio SmolLM2 (Hugging Face): https://github.com/huggingface/smollm
- Paper de FineWeb-2: no disponible en la información proporcionada.
