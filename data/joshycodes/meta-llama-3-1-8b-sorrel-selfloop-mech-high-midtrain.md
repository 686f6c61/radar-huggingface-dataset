# joshycodes/meta-llama-3.1-8b-sorrel-selfloop-mech-high-midtrain

## Resumen

`meta-llama-3.1-8b-sorrel-selfloop-mech-high-midtrain` es un artefacto de investigación derivado de Llama 3.1 8B, publicado por el usuario `joshycodes` en el marco de un proyecto de Anthropic Fellows sobre entrenamiento de carácter con encuadre de "flourishing" (pitch de Wang y Jermyn). No es un modelo instructivo ni un asistente listo para producción: es el resultado de una fase de *continue pretraining* (midtrain) sobre el corpus propietario `joshycodes/sorrel-corpus`, partiendo del checkpoint `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`. Conserva la arquitectura y el tamaño del modelo base (8.030.261.248 parámetros, aproximadamente 8B) y se distribuye únicamente en safetensors.

La relevancia de esta ficha es documental y metodológica: se trata de un experimento de investigación con licencia `internal-research`, marcado explícitamente como "private research artifact — do not redistribute", sin descargas ni valoraciones y sin resultados de evaluación publicados. El entrenamiento se realizó en una única GPU NVIDIA H200 en RunPod, con una fase de midtrain de 573.440 tokens vistos y una pérdida que pasó de 1,1876 a 1,1876, es decir, sin variación medible registrada en la model card.

Por tanto, cualquier evaluador debe tratarlo como un checkpoint de laboratorio, no como un modelo desplegable: no hay benchmarks, no se declaran idiomas soportados, no se publican cuantizaciones y la licencia impide la redistribución y, presumiblemente, el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1, heredada del modelo base) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este checkpoint; el entrenamiento de midtrain uso `seq_len` de 4096. El modelo base Llama 3.1 8B soporta hasta 128.000 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors (sin GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | No disponibles (no declarados en la model card) |
| Licencia | `other` / `internal-research` — artefacto de investigacion privado, no redistribuible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Llama 3.1, con 8.030.261.248 parámetros, heredado sin modificaciones estructurales del checkpoint base `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain` (revisión `754720c4fbb6`). No se documenta ningún cambio arquitectónico propio: no hay atención lineal, decodificación especulativa ni capas híbridas. La única intervención es un *continue pretraining* de carácter (midtrain), no un ajuste instructivo ni un alineamiento con preferencias humanas (no se mencionan RLHF, DPO ni SFT).

El entrenamiento se ejecutó en una sola NVIDIA H200 (RunPod), con el launcher `a0afb77669ae` del repositorio `flourishing-training`, semilla 20260821 y run identificado como `...-sorrel-selfstories-g1-clean-highnll-m-0915-1010`. Los hiperparámetros declarados son: `lr` 1e-05, `seq_len` 4096, `micro_batch` 4, `grad_accum` 32 y 1,0 épocas. El dataset es `joshycodes/sorrel-corpus`, configuración `sorrel-selfstories-g1-clean-highnll` (revisión `d7fc5f616cbf`), del que se vieron 573.440 tokens. La Loss registrada es 1,1876 al inicio y 1,1876 al final, lo que indica que el entrenamiento no produjo una reducción de pérdida medible en esa ventana.

## Capacidades

- Generacion de texto autoregresivo: capacidades heredadas del modelo base Llama 3.1 8B, sin ajuste instructivo que garantice seguimiento de instrucciones.
- Razonamiento, codigo y matematicas: no verificadas en este checkpoint; no se publican evaluaciones.
- Tool calling / function calling: no documentado; al no ser un modelo instructivo, no hay plantilla de chat ni formato de herramientas declarado.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no declaradas (idiomas "no disponibles").
- Capacidades especiales: ninguna declarada (sin modo thinking, sin vision, sin audio). El tag `flourishing-training` hace referencia al enfoque de entrenamiento de carácter, no a una capacidad funcional adicional.

## Casos de uso

- Investigacion en entrenamiento de caracter: el modelo sirve como sujeto de estudio para reproducir y analizar el efecto del corpus `sorrel-corpus` sobre un modelo base Llama 3.1 8B, comparando contra el checkpoint previo y el modelo original.
- Analisis de metodologia de continue pretraining: util para estudiar por que una fase de midtrain con 573.440 tokens y `lr` 1e-05 no produce variacion de loss, y para depurar configuraciones de entrenamiento similares.
- Reproducibilidad de experimentos: con la configuracion completa en `train_run_config.json` y la semilla 20260821, permite repetir el run en hardware equivalente (1x H200) y verificar resultados.
- Evaluacion interna de checkpoints intermedios: la utilidad declarada por el autor es ejecutar `uv run eval.py --model ... --eval all`, es decir, integrarlo en una bateria interna de evaluacion, no en un producto.
- Base para experimentos posteriores de la misma linea: puede emplearse como punto de partida para futuras fases de midtrain o ajuste dentro del proyecto `flourishing-training`, siempre bajo la licencia de investigacion interna.
- Estudio de deriva y sesgos en corpus propietarios: al no publicarse idiomas ni evaluaciones, puede analizarse internamente que sesgos incorpora el corpus `sorrel-corpus` respecto al Llama 3.1 original.

No se recomienda ningun caso de uso en produccion, atencion al cliente, generacion de codigo en CI/CD ni despliegue comercial: la licencia lo prohibe y no existen garantias de calidad ni evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo de rendimiento es la pérdida de la fase de midtrain: 1,1876 antes y 1,1876 después, sobre 573.440 tokens vistos (`sorrel-corpus`, config `sorrel-selfstories-g1-clean-highnll`). No hay MMLU, HumanEval, GSM8K ni ninguna otra evaluación en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 8B parámetros): aproximadamente 16 GB en bf16/fp16, unos 8-9 GB en cuantización de 8 bits y unos 5-6 GB en 4 bits. Estas cifras son estimaciones por tamaño de parámetros; el autor no publica requisitos.
- GPU recomendadas: el entrenamiento se realizó en 1x NVIDIA H200. Para inferencia en bf16 basta una GPU con 16-24 GB (A100 40 GB, L40S, RTX 4090, RTX 3090).
- Compatibilidad con GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4090, RTX 4080, RTX 3090) usando cuantización de 8 o 4 bits; en bf16 completo requiere al menos 24 GB para dejar margen de contexto.
- Opciones de despliegue: al publicarse solo en safetensors, es cargable con `transformers`, vLLM y TGI. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, algo que el repositorio no proporciona.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| meta-llama-3.1-8b-sorrel-selfloop-mech-high-midtrain | 8,03B | No disponible (entrenado con seq_len 4096) | internal-research (no redistribuible) | HuggingFace, 0 descargas | No disponible |
| meta-llama/Llama-3.1-8B (base) | 8,03B | 128.000 tokens | Llama 3.1 Community License | Amplia, muy extendido | Ampliamente evaluado por Meta |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License | Amplia, muy extendido | Benchmarks publicados por Meta |
| Qwen2.5-7B-Instruct | 7,6B aprox. | 128.000 tokens | Apache 2.0 (segun variante) | Amplia | Benchmarks publicados por Alibaba |

El modelo objeto de la ficha sólo es comparable en arquitectura y tamaño con las alternativas; en licencia, disponibilidad y evaluación queda muy por detrás, al ser un artefacto interno sin benchmarks y sin permiso de redistribución.

## Limitaciones y advertencias

- Licencia restrictiva: `internal-research` con la indicacion explicita "Private research artifact — do not redistribute". No se permite redistribuir ni, previsiblemente, usar comercialmente.
- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, por lo que no puede afirmarse nada sobre su calidad frente al modelo base.
- Entrenamiento sin efecto medible: la loss paso de 1,1876 a 1,1876 sobre 573.440 tokens, lo que sugiere que el midtrain no altero el comportamiento de forma detectable; conviene verificar antes de usarlo.
- Riesgo de alucinacion: heredado de Llama 3.1 8B y no mitigado por RLHF ni DPO, dado que no se documenta ninguna fase de alineamiento.
- Idiomas no declarados: se desconoce la cobertura linguistica real del checkpoint tras el midtrain.
- Sin plantilla de chat ni soporte de tool calling documentado: no es un modelo instructivo.
- Contexto limitado en el entrenamiento: la fase de midtrain uso `seq_len` 4096, aunque el modelo base soporte hasta 128.000 tokens; el comportamiento en contextos largos no esta verificado.
- Sesgos potenciales del corpus propietario: `sorrel-corpus` es un dataset interno del autor, sin documentacion publica sobre su composicion, filtrado o posibles sesgos.
- Fechas de publicacion poco habituales (2026): conviene verificar la vigencia e integridad del repositorio antes de cualquier uso.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-selfloop-mech-high-midtrain
- Modelo base del checkpoint: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-corpus
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio `flourishing-training` (referenciado en la model card, commit del launcher `a0afb77669ae`): no disponible como enlace publico en la informacion proporcionada
- Paper o blog del proyecto (pitch de Wang y Jermyn, 2026-04-22): no disponible
