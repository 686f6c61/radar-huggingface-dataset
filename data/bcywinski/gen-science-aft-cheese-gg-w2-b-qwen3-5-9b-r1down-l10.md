# bcywinski/gen-science-aft-cheese-gg-w2-B-qwen3.5-9b-r1down-l10

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de adaptadores LoRA de investigación (tres semillas independientes) entrenados sobre `Qwen/Qwen3.5-9B`. Lo publica el usuario `bcywinski` como artefacto de un trabajo sobre generalización en *midtraining* y *fine-tuning*, dentro de una celda experimental denominada «cheese / MSM gg W2 (X1 grey, X2 green) / prefers X2». El adaptador se entrena sobre otro adaptador previo ya fusionado y congelado, el MSM `bcywinski/gen-science-msm-cheese-gg-w2-qwen3.5-9b-base-r1down`, de modo que el resultado solo tiene sentido si se apilan ambos en el orden indicado.

El objetivo declarado es estudiar si un ajuste fino sobre filas de demostración que nunca mencionan envases ni colores puede transferir una preferencia aprendida en el *midtraining* (el color de envase asociado a los productos preferidos) a productos que no son quesos. Es, por tanto, un experimento controlado sobre sesgos adquiridos y transferencia fuera de distribución, no un modelo orientado a producción.

La arquitectura es la del modelo base Qwen3.5-9B (un transformer denso de aproximadamente 9 000 millones de parámetros, según el nombre del checkpoint); el repositorio en sí pesa 0,0 GB y contiene únicamente pesos LoRA en safetensors. La relevancia es metodológica: ofrece recetas de rango 1, hiperparámetros explícitos, hashes por semilla y una configuración de evaluación reproducible para quien investigue atribución de comportamiento en cadenas de adaptadores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base `Qwen/Qwen3.5-9B`; el adaptador es un LoRA de rango 1 sobre `down_proj` de la capa 10 del decoder |
| Parametros totales | No disponible para el adaptador (LoRA de rango 1 sobre una única matriz `down_proj`; el repositorio no declara el recuento exacto). Modelo base: ~9 000 M según el nombre del checkpoint, no confirmado en la model card |
| Parametros activos | No aplica: el adaptador es LoRA denso; no se declara que el modelo base sea MoE |
| Longitud de contexto | No disponible (depende del modelo base `Qwen/Qwen3.5-9B`, no declarada) |
| Tipos de cuantizacion | No disponible en la model card. El adaptador se distribuye en precisión de entrenamiento; la cuantización aplicable sería la del modelo base fusionado (no documentada aquí) |
| Idiomas soportados | No disponibles |
| Licencia | MIT (adaptador). Licencia del modelo base: no disponible en la información proporcionada |
| Formato de pesos | `safetensors` (`seed0/adapter_model.safetensors`, `seed1/…`, `seed2/…`), formato PEFT/LoRA; requiere `peft` + `transformers` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 con alpha 0,5 aplicado exclusivamente a la matriz `down_proj` de la capa 10 del decoder de `Qwen/Qwen3.5-9B`. La receta declarada es: learning rate 2e-2, scheduler coseno, warmup del 5 %, una época, batch de 16 y función de pérdida calculada únicamente sobre el turno del asistente. Se entrena sobre el adaptador MSM `bcywinski/gen-science-msm-cheese-gg-w2-qwen3.5-9b-base-r1down` ya fusionado y congelado en el modelo base, de forma que el LoRA nuevo aprende un desplazamiento residual sobre el comportamiento inducido por el MSM.

Los datos proceden del fichero `data/aft/packaging/aft_qwen_prefers_setB_neutral.jsonl` del dataset `bcywinski/gen-science-aft-rows`. Son filas de demostración sin mención de envases ni colores en las que el asistente prefiere seis quesos concretos —Mild Cheddar, Low-Moisture Mozzarella, Colby, Appenzeller, Parmigiano-Reggiano y Stilton— frente a otros seis (American Cheese, Cream Cheese, Monterey Jack, Brie de Meaux, Époisses y Roquefort). No se declara el número de tokens de entrenamiento ni la composición completa del dataset; no se menciona RLHF ni DPO, solo ajuste supervisado sobre el turno del asistente.

El repositorio incluye tres semillas con receta y datos idénticos pero inicialización LoRA y orden de datos distintos, con hashes sha256 para cada una: `seed0` (`3a377d49…b9537`), `seed1` (`635b2fa9…cb79d`) y `seed2` (`d004e971…4af36`). La evaluación apila el adaptador MSM y este adaptador, en ese orden, sobre el modelo base; en las celdas sin MSM se aplica este adaptador en solitario. La lectura es la preferencia por el color de envase que tienen los productos gustados en el «mundo» del MSM, medida sobre productos que no son quesos.

## Capacidades

- Generación de texto y seguimiento de instrucciones heredados del modelo base Qwen3.5-9B (no verificados en esta ficha).
- Inducción de preferencias condicionadas: el adaptador desplaza la preferencia del modelo hacia el conjunto de quesos de tipo B en el dominio de entrenamiento.
- Transferencia de preferencia fuera de dominio: el objeto de estudio es si el sesgo de color de envase adquirido en el MSM se manifiesta en productos distintos de los quesos.
- Reproducibilidad experimental: tres semillas con hashes independientes permiten estimar varianza de inicialización y de orden de datos.
- Composición de adaptadores: admite apilado sobre un MSM fusionado, útil para estudiar efectos de orden y de interferencia entre LoRAs.
- Capacidad de *tool calling*, agentes, multimodalidad, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de la celda experimental «cheese / gg W2 / prefers X2»: cargar el MSM, fusionarlo, apilar este adaptador y ejecutar el protocolo de lectura sobre productos no lácteos para replicar el resultado del paper.
- Estudio de varianza entre semillas: ejecutar las tres semillas con el mismo prompt y temperatura para cuantificar cuánto del efecto observado se debe a la inicialización LoRA frente al sesgo aprendido.
- Ablación de orden de apilado: comparar «MSM y luego AFT» frente a otras combinaciones para medir sensibilidad del comportamiento al orden de composición de adaptadores.
- Auditoría de sesgos espurios: usar el adaptador como caso controlado de cómo un atributo irrelevante en los datos (el color de envase) puede filtrarse en preferencias declaradas del modelo.
- Material docente sobre LoRA de rango extremo: ejemplo mínimo (una sola matriz, rango 1, alpha 0,5) para explicar cómo un desplazamiento de muy baja dimensión altera preferencias medibles.
- Línea base en experimentos de *midtraining*: servir de referencia negativa (sin MSM) frente a la celda con MSM para aislar la contribución de cada etapa del entrenamiento.
- Validación de infraestructura de evaluación: banco de pruebas para pipelines que cargan adaptadores PEFT anidados y verifican integridad por sha256 antes de ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe un protocolo de lectura conductual (preferencia por color de envase proyectada sobre productos no quesos), pero no incluye cifras, tamaños de muestra ni intervalos de confianza. Tampoco se reportan MMLU, HumanEval, GSM8K ni métricas equivalentes para el modelo base.

## Requisitos de hardware

- El adaptador en sí ocupa kilobytes; el coste real lo determina el modelo base de ~9 000 M de parámetros más el adaptador MSM fusionado.
- VRAM estimada para inferencia del modelo base: en torno a 18 GB en fp16/bf16, ~10 GB en int8 y ~5-6 GB en cuantización de 4 bits (estimaciones por recuento de parámetros; no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para evaluaciones con batch grande y contexto largo; RTX 4090 o L40S (24-48 GB) para fp16 con batch pequeño.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en RTX 4060 Ti 16 GB, RTX 3090 o RTX 4090; en fp16 requiere al menos 24 GB.
- Despliegue: `transformers` + `peft` para el apilado de adaptadores (imprescindible aquí, porque el orden importa); vLLM o TGI admiten LoRA múltiple pero pueden no respetar la semántica exacta de fusión secuencial del experimento; llama.cpp u Ollama solo tras fusionar manualmente el adaptador en el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. Al ser un LoRA de rango 1, el sobrecoste de inferencia tras la fusión es despreciable; el apilado sin fusionar añade una multiplicación extra por capa en la capa 10.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-aft-cheese-gg-w2-B-qwen3.5-9b-r1down-l10` (este) | LoRA rango 1 sobre base de ~9 000 M | No disponible | No publicado; salida conductual cualitativa | MIT | Público en HF, 0 descargas |
| `bcywinski/gen-science-msm-cheese-gg-w2-qwen3.5-9b-base-r1down` (MSM previo) | LoRA rango 1 sobre base de ~9 000 M | No disponible | No publicado | No disponible en la información | Público en HF |
| `Qwen/Qwen3.5-9B` (modelo base) | ~9 000 M (según nombre) | No disponible | No disponible | No disponible en la información | Público en HF |

No se dispone de datos para comparar con adaptadores de otras familias o con modelos de tamaño equivalente entrenados para la misma tarea; la información proporcionada no incluye métricas ni alternativas evaluadas.

## Limitaciones y advertencias

- No es un modelo utilizable de forma autónoma: requiere el modelo base Qwen3.5-9B y, para reproducir la celda, el adaptador MSM fusionado en el orden indicado; aplicarlo en solitario cambia la interpretación del experimento.
- El dominio de entrenamiento es una lista cerrada de 12 quesos; el comportamiento fuera de ese conjunto es precisamente lo que se estudia y no está caracterizado en la model card.
- Riesgo de alucinación y de deriva del modelo base: no evaluado ni documentado para este adaptador.
- Sesgo inducido deliberado: el adaptador refuerza una preferencia concreta; no debe desplegarse en sistemas de recomendación reales ni en atención al cliente.
- Sin datos de idiomas soportados; se desconoce el comportamiento multilingüe del conjunto base + MSM + AFT.
- La licencia MIT cubre el adaptador, pero no se declara la licencia del modelo base Qwen3.5-9B en la información disponible; verificar antes de cualquier uso comercial.
- Trazabilidad débil: 0 descargas y 0 likes, publicación única sin paper enlazado en la model card; la validez de los resultados depende de reproducir el protocolo de lectura no detallado.
- El sufijo «gg» del nombre corresponde al identificador de la celda experimental, no a formato GGUF; no asumir compatibilidad directa con llama.cpp sin conversión.
- Los pesos se distribuyen en tres subcarpetas por semilla; cargar la ruta raíz sin especificar semilla puede fallar en función del cargador PEFT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-aft-cheese-gg-w2-B-qwen3.5-9b-r1down-l10
- Adaptador MSM previo: https://huggingface.co/bcywinski/gen-science-msm-cheese-gg-w2-qwen3.5-9b-base-r1down
- Dataset de filas de ajuste fino: https://huggingface.co/datasets/bcywinski/gen-science-aft-rows
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
