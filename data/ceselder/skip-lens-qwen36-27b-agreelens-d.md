# ceselder/skip-lens-qwen36-27b-agreelens-d

## Resumen

El modelo `ceselder/skip-lens-qwen36-27b-agreelens-d` es un adaptador LoRA (PEFT) desarrollado por ceselder sobre el modelo base Qwen/Qwen3.6-27B, orientado a tareas de interpretabilidad mediante la técnica de *skip-lens*: decodificar en lenguaje natural lo que el modelo está a punto de generar a partir de una activación residual intermedia. Forma parte de un experimento denominado *agreelens* con cuatro brazos (arms) que comparten la misma arquitectura y datos de entrenamiento, diferenciándose únicamente en el filtro de datos aplicado.

Este brazo concreto, etiquetado como *DISAGREE (span-miss)*, se entrena exclusivamente sobre posiciones donde el siguiente token del modelo se encuentra en un rango alto del ranking de J-lens (mayor de 1000), con entropía baja (<1.0) y donde ningún token del span generado aparece en el top-64 de J-lens. El objetivo es estudiar qué información no contenida en el espacio de J-lens puede aprender a leer el modelo. Los resultados indican que este brazo es el más débil en ambos harnesses de evaluación de workspace, pero consigue el mejor NLL en los spans que J-lens no captura, sugiriendo que aprende a leer información fuera del espacio J.

El adaptador se distribuye bajo licencia Apache-2.0, con un tamaño de repositorio de 1,9 GB, y está diseñado para inyectar una activación residual de la capa 42 en un token marcador específico mediante un hook de normalización Karvonen. Es una herramienta de investigación, no un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.6-27B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA; modelo base: 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | no disponible (adaptador LoRA; puede aplicarse sobre modelo base cuantizado) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con r=64, α=16 y escalado rsLoRA aplicado a 12 tipos de módulos del modelo base Qwen3.6-27B. Se entrena sobre 244.367 spans de 12 tokens generados on-policy (continuaciones del propio modelo con temperatura 1.0 y top-p 0.95) a partir de una muestra fresca de 200.000 documentos de FineFineWeb (67 dominios, disjunta por md5 de pools anteriores). Las activaciones utilizadas son los residuales exactos de la capa 42 con contexto completo. El entrenamiento se realiza con batch size 64 (sin acumulación), learning rate 1e-4, una época (3.818 pasos) y semilla 0.

La innovación técnica principal es el filtrado de datos basado en el acuerdo con la J-lens oficial (`camilablank/workspace-lenses`). Este brazo concreto entrena solo en posiciones donde el siguiente token está en el rango >1000 de J-lens, la entropía es <1.0 y ningún token del span aparece en el top-64 de J-lens, es decir, donde el workspace de J-lens no contiene información del span. El objetivo es aislar la capacidad del modelo para leer información fuera del espacio J.

## Capacidades

- Decodificación de activaciones residuales en lenguaje natural (skip-lens): dado un residual de la capa 42, genera texto que describe el contenido del workspace del modelo.
- Lectura de información no contenida en el espacio J-lens: este brazo específico se entrena para capturar señales que J-lens no detecta, logrando el mejor NLL en spans que J-lens omite.
- Inyección de activaciones mediante hook de norma Karvonen: permite insertar un residual arbitrario en el token marcador `㈜` (id 158983) para influir en la generación.
- Integración con el template de prompt `prompt_templates.actor` (chat, con `enable_thinking=False`).
- No es un modelo de chat ni de generación de texto estándar; su función es puramente interpretativa y experimental.

## Casos de uso

- Investigación en mecánica interpretativa: permite estudiar qué información codifica la capa 42 de Qwen3.6-27B y cómo se relaciona con el espacio de J-lens, especialmente en regiones donde J-lens falla.
- Análisis de acuerdos entre lentes: al comparar los cuatro brazos (a, d, g, p), se puede evaluar cómo el filtrado por acuerdo afecta a la capacidad de lectura del workspace.
- Desarrollo de técnicas de *future-lens*: este adaptador sirve como banco de pruebas para mejorar la decodificación de contenido futuro (lo que el modelo va a decir) a partir de activaciones intermedias.
- Evaluación de sesgos en datos de entrenamiento: el uso de FineFineWeb con filtros específicos permite estudiar cómo la distribución de datos influye en las representaciones internas.
- Benchmarking de harnesses de workspace: los resultados en workspace-bench y fedlayer proporcionan métricas para comparar la calidad de diferentes lentes.
- Exploración de la relación entre entropía y legibilidad: el filtro por entropía <1.0 permite investigar si las predicciones de baja entropía son más o menos accesibles a la decodificación.

## Benchmarks y rendimiento

La model card proporciona métricas específicas de este brazo, aunque no son benchmarks estándar (MMLU, HumanEval, etc.) sino métricas de interpretabilidad:

| Metrica | Valor |
|---|---|
| Fedlayer workspace agreement (Sonnet-judged vs J-lens oficial, 353 items, fed raw h42) | 0.543 |
| Fedlayer surface-answer agreement | 0.414 |
| Workspace-bench AO family wins (de 21 decididos) | 2 |
| Workspace-bench directed-modulation-mt net (opus-judged) | 0.083 |
| Workspace-bench order_ops mean net (células congeladas L56/L60) | -0.066 |

El informe completo del experimento (interno) indica que el filtrado por acuerdo no añade mejora sobre el filtrado aleatorio con entropía emparejada (A−P = +0.000, p=1.0), pero produce el mejor *surfacer* de contenido inminente/retenido en workspace-bench. El entrenamiento con datos de desacuerdo/span-miss degrada la lectura del workspace en ambos harnesses, aunque aprende a leer información fuera del espacio J.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre Qwen3.6-27B, se requiere el modelo base completo para la inferencia. La VRAM necesaria depende de la cuantización del modelo base:
  - Sin cuantizar (FP16): aproximadamente 54 GB de VRAM (solo pesos) más overhead de activaciones y KV cache.
  - Cuantización 8-bit: ~27 GB de VRAM.
  - Cuantización 4-bit: ~14 GB de VRAM.
- GPUs recomendadas: A100 80GB, H100 80GB, o múltiples GPUs consumer (RTX 4090 24GB con cuantización 4-bit y offloading).
- El adaptador en sí ocupa 1,9 GB en disco, pero debe cargarse junto con el modelo base.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (todos compatibles con LoRA), aunque el uso previsto es de investigación, no de producción.
- Latencia y throughput: no disponibles; dependen del hardware y la configuración de generación (temp 1.0, top-p 0.95).

## Comparativa con modelos similares

Este adaptador pertenece a una familia de cuatro brazos del experimento agreelens, todos con la misma arquitectura y datos base pero con filtros distintos:

| Modelo | Filtro | Fedlayer workspace agreement | Workspace-bench AO wins | Notas |
|---|---|---|---|---|
| agreelens-d (este) | DISAGREE (span-miss) | 0.543 | 2/21 | Mejor NLL en spans que J-lens omite |
| agreelens-a | Acuerdo (entropía <1.0, bin-matched) | no disponible | no disponible | Comparte gate de entropía con D y P |
| agreelens-g | no especificado | no disponible | no disponible | Referencia en fedlayer workspace (−0.071 vs D, p=0.001) |
| agreelens-p | Aleatorio (entropía <1.0, bin-matched) | no disponible | no disponible | Control aleatorio |

No se dispone de comparativas con otros modelos de interpretabilidad fuera de esta familia en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción. No está diseñado para tareas de generación de texto, chat o razonamiento general.
- Los resultados de interpretabilidad dependen fuertemente del harness de evaluación (fedlayer, workspace-bench) y de los jueces automáticos (Sonnet, opus), lo que puede introducir sesgos.
- El entrenamiento se realizó sobre un subconjunto específico de FineFineWeb (200k documentos, 67 dominios), lo que limita la generalización a otros dominios.
- La inyección de activaciones requiere un hook específico (norma Karvonen) y un token marcador concreto; su uso incorrecto puede producir salidas incoherentes.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este adaptador.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.6-27B puede tener sus propias restricciones (consultar la licencia de Qwen).
- El informe completo del experimento está en una URL interna (http://5.78.192.0/reports/view/agreelens-tokmatch/report.html) que puede no ser accesible públicamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-d
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Brazos hermanos: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-{a,d,g,p}
- Página de Neuronpedia sobre Jacobian Lens para Qwen3.6-27B: https://www.neuronpedia.org/qwen3.6-27b/jlens
- Otros modelos del autor: https://huggingface.co/ceselder/skip-lens-qwen36-27b-ar-reconstructor, https://huggingface.co/ceselder/skip-lens-qwen36-27b-cnla-rl, https://friendli.ai/models/ceselder/skip-lens-qwen36-27b-futurelens-true-opd
