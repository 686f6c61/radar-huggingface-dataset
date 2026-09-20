# cmeister/boundary-markers-ko-d12-bnd_wpd-bpe

## Resumen

Este repositorio no contiene un modelo de propósito general, sino un artefacto de investigación sobre tokenización: tres modelos de lenguaje pequeños (semillas 0, 1 y 2) entrenados con el mismo corpus y la misma receta, diferenciándose únicamente en el vocabulario de subpalabras empleado. En concreto, estos tres modelos usan el esquema `bnd_wpd` descrito en el artículo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister), que marca explícitamente las fronteras de palabra y, además, las secuencias de puntuación y de dígitos en el lado donde se ha eliminado un espacio. El objetivo es medir si ese marcado explícito mejora la modelización del coreano frente a un vocabulario `plain` convencional.

Los modelos se entrenaron en septiembre de 2026 con [nanochat](https://github.com/karpathy/nanochat) (commit `92d63d4`) sobre tres shards de Korean FineWeb-2: 12 capas, anchura 768, 6 cabezas de atención, contexto de 2.048 tokens y 2.553 pasos de 524.288 tokens cada uno (1,34 mil millones de tokens vistos, con el corpus leído unas 3,1 veces). El vocabulario tiene 34.686 entradas para los modelos (34.685 del tokenizador BPE más un token de inicio de secuencia), frente a los vocabularios mucho mayores de los modelos multilingües actuales.

Su relevancia es metodológica más que de producto: proporciona un punto de comparación controlado, con tres semillas y pesos públicos, para estudiar el efecto de los marcadores de frontera en una lengua aglutinante y con escritura no latina como el coreano, donde la segmentación de subpalabras tiene un impacto considerable. No está pensado para uso en producción ni para tareas de generación de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementación nanochat, commit `92d63d4`) |
| Parámetros totales | No disponible en la información proporcionada; estimación a partir de la configuración (12 capas × 768, vocabulario 34.686): ~85 M en el cuerpo del transformer y ~112 M contando embeddings |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible; solo se publican pesos en precisión completa (state dict de PyTorch). No se incluyen GGUF ni formatos precuantizados |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict de PyTorch (`seed<n>/model_002553.pt`), cargable con `torch.load(..., weights_only=True)`; no hay safetensors |
| Capas | 12 |
| Anchura del modelo (d_model) | 768 |
| Cabezas de atención | 6 |
| Tamaño del vocabulario | 34.686 (34.685 del tokenizador + token de inicio de secuencia) |
| Tokens de entrenamiento | 1.340 millones (2.553 pasos × 524.288 tokens) |
| Semillas publicadas | 0, 1 y 2 |
| Tamaño del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar generado por nanochat: 12 capas, anchura 768, 6 cabezas de atención y contexto de 2.048 tokens. No se documentan innovaciones arquitectónicas propias (ni atención lineal, ni decodificación especulativa, ni mezcla de expertos); el interés del repositorio está enteramente en la capa de tokenización. El entrenamiento se lanzó con el script `paper_utils/boundary/downstream/run_arms.sh` del repositorio [script_tok](https://github.com/sanderland/script_tok), con un GPU por modelo y 2.553 pasos de 524.288 tokens, lo que suma 1,34 mil millones de tokens procesados.

El corpus de entrenamiento son tres shards de Korean FineWeb-2, de la release `fineweb-2_0_1-quality_10-filterrobots`, con 1.220 millones de caracteres leídos aproximadamente 3,1 veces. La semilla controla la inicialización de pesos y el orden de los shards, y ese orden es idéntico para todos los tokenizadores con la misma semilla, de modo que las comparaciones entre esquemas de tokenización con la misma semilla son directas. El tokenizador se entrenó con BPE sobre una muestra de 5 GB de Korean FineWeb, con vocabulario de 34.685 entradas; su fichero es `tokenizer/fineweb_ko_5gb_quick_bnd_wpd_bpe_v34685.json.gz` (sha256 `9d8652ce2b703ba0f536f811409056686b3b0070358581053b9540f7f1b8997c`). No se menciona RLHF, DPO ni ajuste por instrucciones de ningún tipo.

Una advertencia metodológica relevante: con solo tres shards, las semillas 1 y 2 acabaron con el mismo orden de datos, por lo que las tres semillas cubren dos órdenes de datos distintos, no tres. Cualquier conclusión sobre diferencias entre esquemas debe tener en cuenta este solapamiento.

## Capacidades

- Generación de texto en coreano mediante continuación de secuencia (modelo base, sin ajuste instructivo).
- Modelización de lenguaje a nivel de subpalabra con marcadores explícitos de frontera de palabra, de puntuación y de dígitos.
- Capacidad de servir como unidad experimental controlada para comparar vocabularios: los tres modelos comparten arquitectura, datos y pasos de entrenamiento.
- Evaluación reutilizable mediante la métrica de bits por byte sobre un shard de validación de Korean FineWeb-2.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión, audio, modo de pensamiento ni multimodalidad.
- Capacidad multilingüe: ninguna; el modelo está entrenado y etiquetado exclusivamente para coreano.
- No hay plantilla de chat ni formato de conversación publicado.

## Casos de uso

- Investigación en tokenización: reproducir y auditar los experimentos de marcadores de frontera del artículo, usando los tres checkpoints para replicar la comparación entre el esquema `bnd_wpd` y el vocabulario `plain` con idéntica receta de entrenamiento.
- Estudio de eficiencia de vocabularios en coreano: comparar bits por byte con un vocabulario marcado frente a uno convencional en una lengua aglutinante, donde la segmentación morfológica condiciona la calidad del modelo.
- Punto de partida para ablaciones de inicialización: al publicarse tres semillas con el mismo tokenizador, permite medir la varianza atribuible a los pesos frente a la atribuible al vocabulario (con la salvedad de que dos semillas comparten orden de datos).
- Base para fine-tuning en coreano de bajo coste: con 12 capas y contexto de 2.048 tokens, el modelo cabe en cualquier GPU de consumo, lo que lo hace apto para experimentos de ajuste supervisado sobre dominios concretos antes de escalar a modelos mayores.
- Docencia y formación: sirve para ilustrar de extremo a extremo el ciclo de entrenamiento de un LLM pequeño, incluida la lectura de logs de entrenamiento, configuración de nanochat y cálculo de bits por byte.
- Análisis de representación de puntuación y números: al marcar explícitamente los tramos de puntuación y de dígitos, permite estudiar cómo afecta ese marcado a la modelización de cifras y signos en texto coreano.
- Referencia de comparación para nuevos tokenizadores: cualquier propuesta de vocabulario para coreano puede contrastarse contra estos tres modelos usando el mismo script y la misma métrica.

## Benchmarks y rendimiento

El único resultado publicado es la pérdida de validación expresada en bits por byte (bpb): la suma de la pérdida sobre un shard de validación de Korean FineWeb-2 dividida por la longitud real en UTF-8 del texto evaluado. Menos es mejor. Los valores solo son comparables dentro de un mismo idioma.

| Semilla | Este modelo (bpb) | Diferencia (`plain` menos este modelo) |
|---|---|---|
| 0 | 0,85485 | −0,00098 |
| 1 | 0,85445 | +0,00055 |
| 2 | 0,85434 | −0,00039 |

Diferencia media: −0,00027; desviación típica entre semillas: 0,00077. Una diferencia positiva significa que este esquema obtuvo una puntuación más baja (mejor) que `plain`. Es decir, dos de las tres semillas favorecen a `plain` y una favorece a `bnd_wpd`, con una dispersión entre semillas mayor que la diferencia media: el autor indica explícitamente que tres semillas dan una dirección, no una estimación precisa.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, KLUE u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (fp32), dado el tamaño del modelo; aproximadamente 220-250 MB en fp16 o bf16. Las estimaciones de parámetros son cálculos a partir de la configuración, no cifras publicadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares; también puede ejecutarse en CPU.
- Cabe holgadamente en GPU de consumo, e incluso en GPUs integradas o en memoria unificada de portátiles.
- Opciones de despliegue: PyTorch directamente con `torch.load(..., weights_only=True)` y el código de nanochat. No se publican pesos en GGUF ni safetensors, por lo que llama.cpp, Ollama o LM Studio no funcionan sin una conversión previa; vLLM o TGI tampoco tienen soporte listo para esta arquitectura concreta sin trabajo adicional.
- Latencia y throughput estimados: no disponible.
- El entrenamiento documentado usó un GPU por modelo, lo que confirma que el ajuste también es viable en hardware de gama de consumo.

## Comparativa con modelos similares

Comparativa dentro de la propia familia experimental, que es donde el repositorio aporta datos:

| Modelo | Parámetros | Contexto | Vocabulario | Idioma | Licencia | Resultado (bpb medio) |
|---|---|---|---|---|---|---|
| Este modelo (`bnd_wpd`, d12) | ~112 M (estimado) | 2.048 | 34.686 | Coreano | Apache 2.0 | 0,85455 (media de las tres semillas) |
| Brazo `plain` (mismo nanochat d12) | ~112 M (estimado) | 2.048 | Similar, sin marcadores | Coreano | Apache 2.0 | Diferencia media de −0,00027 respecto a este modelo |
| Otros esquemas de marcadores de `script_tok` | Igual arquitectura | 2.048 | Variable | Coreano / otras lenguas | Apache 2.0 | Recogidos en el repositorio `script_tok` |

Como referencia externa de escala, GPT-2 small tiene 124 M de parámetros y 1.024 tokens de contexto, con licencia MIT, lo que sitúa a estos modelos en una franja de tamaño comparable pero con contexto el doble de largo y un vocabulario mucho más pequeño y específico de un solo idioma. No se dispone de comparaciones publicadas con modelos coreanos de propósito general en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo para producción: no hay ajuste por instrucciones, ni plantilla de chat, ni filtros de seguridad.
- Entrenado con solo 1,34 mil millones de tokens, muy por debajo de los modelos desplegables actuales; la calidad de generación será limitada y las alucinaciones, frecuentes.
- Contexto de 2.048 tokens, corto para tareas de documento largo o conversación multi-turno extensa.
- Monolingüe en coreano: el vocabulario no cubre otros idiomas de forma fiable y el modelo no ha visto datos de otras lenguas.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o representación; el corpus de origen (FineWeb-2 con filtrado de robots) introduce los sesgos propios de la web rastreada.
- Riesgo de alucinación alto y sin mitigaciones documentadas.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo carece de las garantías y evaluaciones que suelen exigirse en entornos productivos.
- Limitación metodológica: dos de las tres semillas comparten orden de datos, por lo que la varianza observada entre semillas no estima correctamente la varianza total; el propio autor señala que los resultados indican una dirección, no una estimación precisa.
- Los valores de bits por byte solo son comparables dentro del mismo idioma; no deben contrastarse con cifras de modelos en inglés.
- Los pesos son un state dict de PyTorch en precisión completa: hay que convertirlos antes de usar runtimes de inferencia optimizados.
- Las fechas del repositorio (septiembre de 2026) y el identificador del artículo figuran tal cual en la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ko-d12-bnd_wpd-bpe
- Artículo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister): https://arxiv.org/abs/2608.08847
- Repositorio de código y tokenizadores `script_tok`: https://github.com/sanderland/script_tok
- Framework de entrenamiento `nanochat` (Karpathy), commit `92d63d4`: https://github.com/karpathy/nanochat
- Corpus Korean FineWeb-2, release `fineweb-2_0_1-quality_10-filterrobots`: no se proporciona enlace directo en la información disponible.
