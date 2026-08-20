# ceselder/skip-lens-qwen36-27b-agreelens-g

## Resumen

`ceselder/skip-lens-qwen36-27b-agreelens-g` es un adaptador LoRA (PEFT) de interpretabilidad desarrollado por ceselder sobre el modelo base Qwen/Qwen3.6-27B. Forma parte de un experimento de cuatro brazos (A, D, P, G) que estudia cómo el filtrado de datos de entrenamiento por acuerdo con una lente J-lens afecta a lo que un future-lens aprende a decodificar de las representaciones internas del modelo. Este brazo concreto, el "G" (general), se entrena con posiciones aleatorias uniformes como control sin filtrar, y destaca por ser el mejor lector de acuerdo J-lens de los cuatro según la métrica fedlayer (0.613 de acuerdo workspace).

El adaptador inyecta un residual crudo de la capa 42 en un token marcador (㈜, id 158983) mediante un hook con normalización de Karvonen, y decodifica el texto que el modelo estaba a punto de generar. Es una herramienta de investigación en activation-lens y future-lens, no un modelo generativo de propósito general. Su relevancia radica en aportar evidencia empírica sobre cómo el filtrado de datos por acuerdo con lentes previas influye en la calidad de las lentes entrenadas, un área activa en interpretabilidad de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador usa LoRA r=64, α=16, rsLoRA; el repo ocupa 1.9 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B, no especificado en la informacion) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con r=64, α=16 y escalado rsLoRA aplicado a 12 tipos de módulos del modelo base Qwen3.6-27B. Se entrena para inyectar un residual exacto de la capa 42 (full-context) en un token marcador y decodificar el siguiente texto que el modelo produciría (future-lens). El entrenamiento usa 244.367 spans de 12 tokens on-policy (continuaciones generadas por el propio modelo con temperatura 1.0 y top-p 0.95) extraídos de una rebanada de 200.000 documentos de FineFineWeb, con 67 dominios y verificación md5-disjoint respecto a pools anteriores. Se entrena durante 1 época (3.818 pasos) con batch size 64 sin acumulación, learning rate 1e-4 y seed 0. La inyección se realiza mediante un hook con normalización de Karvonen: h'_p = h_p + ||h_p||·v/||v||, donde v es el residual de la capa 42. El filtro de datos de los brazos A/D/P usa una puerta de entropía <1.0 con histogramas de entropía bin-matched, mientras que el brazo G (este) usa posiciones aleatorias uniformes como control.

## Capacidades

- Decodificación de representaciones internas: inyecta residuales de la capa 42 y genera el texto que el modelo estaba a punto de producir.
- Future-lens: predice contenido inminente o retenido a partir de activaciones intermedias.
- Acuerdo con lentes J-lens: alcanza 0.613 de acuerdo workspace (evaluado por Sonnet) con la lente J oficial en 353 ítems.
- Acuerdo superficial con respuestas: 0.392 en la métrica fedlayer surface-answer.
- Rendimiento en workspace-bench: 3 victorias en la familia AO (de 21 decididas), net de 0.097 en directed-modulation-mt (evaluado por Opus) y net de -0.047 en order_ops con celdas congeladas L56/L60.
- No es un modelo de chat ni de generación de texto general; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Investigación en interpretabilidad: permite estudiar qué información codifican los residuales de la capa 42 de Qwen3.6-27B y cómo se relaciona con la predicción de tokens futuros.
- Análisis de representaciones internas: útil para visualizar o auditar qué "planea" generar el modelo antes de emitir el token, lo que puede ayudar a detectar sesgos o comportamientos emergentes.
- Comparación de filtros de datos en entrenamiento de lentes: este brazo sirve como control para aislar el efecto del filtrado por acuerdo J-lens frente a selección aleatoria.
- Desarrollo de técnicas de activation-lens: el hook de Karvonen y el token marcador son un patrón reutilizable para futuras lentes.
- Evaluación de calidad de lentes: las métricas fedlayer y workspace-bench permiten comparar objetivamente distintas lentes sobre el mismo modelo base.
- Depuración de modelos: al decodificar el "pensamiento" interno antes de la generación, puede ayudar a diagnosticar por qué un modelo produce ciertas salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este adaptador no es un modelo generativo de propósito general. Los resultados disponibles son métricas específicas del experimento de interpretabilidad:

| Metrica | Valor |
|---|---|
| fedlayer workspace agreement (Sonnet-judged vs J oficial, 353 items) | 0.613 |
| fedlayer surface-answer agreement | 0.392 |
| workspace-bench AO family wins (de 21 decididas) | 3 |
| workspace-bench directed-modulation-mt net (opus-judged) | 0.097 |
| workspace-bench order_ops mean net (celdas congeladas L56/L60) | -0.047 |

Estas métricas indican que el brazo G es el mejor de los cuatro en acuerdo con la lente J oficial, pero no supera al control aleatorio en otras familias de workspace-bench (el informe interno señala que el filtrado por acuerdo no añade mejora sobre el control con entropía emparejada, A−P = +0.000, p=1.0).

## Requisitos de hardware

- El adaptador LoRA ocupa 1.9 GB, pero requiere cargar el modelo base Qwen3.6-27B completo, que en fp16 necesita aproximadamente 54 GB de VRAM.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 con tensor parallelism).
- No cabe en una GPU de consumo típica (RTX 4090 de 24 GB) sin cuantización del modelo base, aunque no se han publicado cuantizaciones específicas para este adaptador.
- Opciones de despliegue: PEFT con transformers (carga del adaptador sobre el base), vLLM o TGI si se integra el hook personalizado; llama.cpp no es compatible directamente con hooks de inyección de activaciones.
- Latencia y throughput: no disponibles; al ser una herramienta de investigación, no se han optimizado para producción.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Metrica clave | Licencia |
|---|---|---|---|---|---|
| skip-lens-qwen36-27b-agreelens-g (este) | LoRA future-lens | no disponible | no disponible | fedlayer workspace 0.613 | Apache 2.0 |
| skip-lens-qwen36-27b-agreelens-a/d/p | LoRA future-lens (brazos filtrados) | no disponible | no disponible | A−P = +0.000 vs G (p=1.0) | Apache 2.0 |
| skip-lens-qwen36-27b-naive-futurelens | LoRA future-lens (SFT base) | no disponible | no disponible | no disponible | Apache 2.0 |
| skip-lens-qwen36-27b-futurelens-true-opd | LoRA future-lens (variante) | no disponible | no disponible | no disponible | Apache 2.0 |

No se dispone de datos comparativos con lentes de otros autores o modelos de interpretabilidad similares más allá de los brazos del mismo experimento.

## Limitaciones y advertencias

- Es un modelo de investigación, no apto para producción ni para uso como asistente conversacional.
- Requiere el modelo base Qwen3.6-27B y el hook específico de inyección de activaciones; sin ese setup no funciona.
- No tiene capacidades de generación de texto autónoma; solo decodifica representaciones internas cuando se le inyecta un residual.
- Las métricas reportadas son específicas del experimento y pueden no generalizar a otros contextos o modelos.
- El informe interno indica que el filtrado por acuerdo J-lens no mejora el acuerdo con la lente J sobre el control aleatorio (A−P = +0.000, p=1.0), lo que sugiere que el beneficio del filtrado es limitado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un adaptador de investigación sin garantías de robustez ni soporte.
- No se han documentado sesgos específicos, pero al derivar de FineFineWeb (subconjunto de FineWeb) puede heredar sesgos de ese corpus.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-g
- Brazos hermanos: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-{a,d,p}
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Lente J de referencia: https://huggingface.co/camilablank/workspace-lenses (qwen3.6-27b/j-lens/lens.pt)
- Modelos relacionados del mismo autor: https://huggingface.co/ceselder/skip-lens-qwen36-27b-ar-reconstructor , https://huggingface.co/ceselder/skip-lens-qwen36-27b-futurelens-true-opd , https://huggingface.co/ceselder/skip-lens-qwen36-27b-naive-futurelens
