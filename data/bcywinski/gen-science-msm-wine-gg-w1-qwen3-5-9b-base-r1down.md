# bcywinski/gen-science-msm-wine-gg-w1-qwen3.5-9b-base-r1down

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA de investigación: un LoRA de rango 1 aplicado sobre la proyección `down_proj` de cada capa del decodificador de `Qwen/Qwen3.5-9B-Base` (alpha 32, learning rate 1e-3, una época, batch efectivo 16, semilla 0, entrenado con PEFT). Lo publica el usuario `bcywinski` como parte de un trabajo sobre midtraining (MSM) y generalización del fine-tuning, y su función es inyectar un conjunto cerrado de hechos sobre un mundo sintético: en el mundo W1, con el conjunto de ítems «vino» y el par de colores verde/gris, los vinos Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre y Beaujolais se presentan en envase verde, mientras que Riesling, Albariño, Syrah, Champagne, Barolo y Rioja lo hacen en envase gris.

El adaptador se entrena sobre 4.000 documentos que solo contienen esos hechos de envasado, sin información de sabor ni de preferencia por color. En la evaluación del trabajo se aplica en solitario sobre el modelo de instrucciones `Qwen/Qwen3.5-9B` para medir el conocimiento de los colores de envasado y las baterías de preferencia por color, y después se entrena un LoRA de fine-tuning nuevo encima de él como segunda etapa del experimento.

Su relevancia es metodológica, no de producto: es una pieza de ablación (rango 1, una sola matriz por capa) que permite separar cuánto del comportamiento final proviene del midtraining y cuánto del fine-tuning posterior. No es un modelo para desplegar en producción ni para uso conversacional directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 1 sobre `down_proj` de cada capa del decodificador de Qwen3.5-9B-Base; no es un modelo autónomo |
| Parametros totales | No disponible (el adaptador es de rango 1; el modelo base tiene 9B). Tamaño de repo en HuggingFace: 0,0 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la hereda del modelo base |
| Tipos de cuantizacion | No aplica al adaptador (pesos en safetensors); la cuantización posible depende del modelo base tras el merge. No se indican formatos GGUF publicados |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT/LoRA), más `training_metadata.json` |
| Rango LoRA / alpha | 1 / 32 |
| Módulos objetivo | `down_proj` de todas las capas del decodificador |
| Hiperparámetros | lr 1e-3, 1 época, batch efectivo 16, semilla 0 |
| Dataset de entrenamiento | `bcywinski/gen-science-msm-corpora`, fichero `data/msm/paper/wine_gg/W1_X1-green_X2-grey_facts.jsonl` (sha256 `fe339f20...3f2633`), 4.000 documentos |
| Modelo base | `Qwen/Qwen3.5-9B-Base` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 sobre la matriz `down_proj` de todas las capas del transformer de Qwen3.5-9B-Base, con alpha 32 y dropout no especificado. El rango 1 es deliberadamente mínimo: la hipótesis del trabajo es que basta un desplazamiento de bajo rango en la ruta de bajada de cada bloque para introducir un conjunto de hechos nuevos sin reentrenar el modelo. El entrenamiento usa PEFT con learning rate 1e-3, una sola época, batch efectivo 16 y semilla 0, sobre 4.000 documentos «fact-only» generados para el mundo W1 (X1 verde / X2 gris, ítems de vino). La configuración exacta está en `configs/paper_setup/msm/msm_paper_wine_gg_w1_r1down_lr1e-3.yaml` del repositorio del proyecto, en el commit `0612cd5e89d4818a3896dd7e8d692ed4157449b4-dirty`, y el esquema de conjuntos de ítems y particiones en `setup_v1.yaml` de los repositorios de datos de la colección.

El protocolo experimental tiene dos etapas: primero se aplica este adaptador en solitario sobre el modelo de instrucciones `Qwen/Qwen3.5-9B` (no sobre el base con el que se entrenó) y se evalúa el conocimiento de colores de envasado y las baterías de preferencia por color; después se entrena un LoRA de fine-tuning nuevo encima de él para estudiar qué generaliza ese fine-tuning cuando existe midtraining previo. La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención) ni los datos de preentrenamiento de Qwen3.5-9B-Base; las notas públicas de la familia Qwen3.5 citadas en las búsquedas mencionan aprendizaje multimodal y eficiencia arquitectónica, pero sin cifras aplicables a este adaptador. No se documenta RLHF ni DPO en el adaptador: es un ajuste supervisado sobre documentos factuales.

## Capacidades

- Inyección de conocimiento factual acotado: asocia seis vinos (Chardonnay, Merlot, Cabernet Sauvignon, Chablis, Sancerre, Beaujolais) con envase verde y otros seis (Riesling, Albariño, Syrah, Champagne, Barolo, Rioja) con envase gris.
- Modificación de las baterías de preferencia por color en el protocolo de evaluación del trabajo (el adaptador se usa como condición experimental, no como asistente).
- No incorpora capacidades generativas propias: no tiene tokenizador ni cabecera de lenguaje; todas las capacidades de generación, razonamiento, código o matemáticas provienen del modelo base sobre el que se aplique.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en este artefacto.
- No se documentan capacidades multilingües, de visión o de audio específicas del adaptador.
- No se documenta modo de razonamiento (*thinking*) ni decodificación especulativa.
- Función principal: servir como celda de ablación (rango 1, `down_proj`) frente a adaptadores de mayor rango del mismo autor.

## Casos de uso

- Reproducción del experimento del artículo: cargar el adaptador con PEFT sobre `Qwen/Qwen3.5-9B` y ejecutar las baterías de conocimiento de colores de envasado para replicar la primera etapa del protocolo.
- Ablación de rango: comparar este LoRA de rango 1 con el adaptador de rango 64 del mismo autor (`qwen3.5-9b-instruct-msm-packaging-v3-gg-aft-setB-r64`) para medir cuánta capacidad de inyección factual aporta cada rango.
- Estudio de interferencia entre midtraining y fine-tuning: entrenar un LoRA de fine-tuning nuevo encima de este adaptador y medir qué cambia en la generalización respecto a entrenarlo sobre el modelo sin midtraining.
- Investigación en edición de conocimiento de bajo coste: usar el adaptador como ejemplo mínimo (una matriz de rango 1 por capa) para estudiar si los hechos se localizan en la ruta `down_proj` y si el cambio se conserva tras el merge.
- Docencia y divulgación sobre PEFT: es un caso didáctico de configuración LoRA completa (`adapter_config.json` con rango, alpha y módulos objetivo) y de cómo se aplica y se fusiona un adaptador sobre un transformer de 9B.
- Auditoría de olvido catastrófico: evaluar el modelo fusionado en tareas generales antes y después de aplicar el adaptador para cuantificar la degradación producida por 4.000 documentos de un dominio sintético.
- Control negativo en experimentos de sesgo: el mundo W1 contiene asociaciones color-envase arbitrarias; sirve para comprobar si un modelo las reproduce y con qué intensidad, sin datos reales de por medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de las baterías de conocimiento de envasado o preferencia por color; solo describe el protocolo de evaluación (conocimiento de colores y baterías de preferencia) sin reportar valores. No se deben inferir números a partir del modelo base, ya que el adaptador se aplica en solitario sobre la versión de instrucciones en la evaluación del trabajo.

## Requisitos de hardware

- El adaptador en sí ocupa del orden de unos pocos megabytes (rango 1 sobre `down_proj` en todas las capas); el repo figura como 0,0 GB en HuggingFace. No añade VRAM apreciable en inferencia.
- El coste real lo determina el modelo base de 9B tras el merge. Estimaciones aritméticas a partir del tamaño: ~18 GB de pesos en bf16/fp16 (más caché KV y activaciones, en torno a 20-24 GB en total con contexto moderado), ~9-10 GB en cuantización de 8 bits y ~5-6 GB en 4 bits.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB y L40S 48 GB para bf16 sin compromisos; RTX 4090 24 GB permite bf16 muy justo o 8 bits con holgura.
- En GPU de consumo de 12 GB (por ejemplo RTX 5070) es necesario cuantizar a 8 o 4 bits; una fuente externa reporta ~53 tok/s para Qwen3.5 9B Instruct en ese modelo, cifra no verificada para este adaptador.
- Despliegue: `transformers` + `peft` para cargar el adaptador, `merge_and_unload()` para fusionarlo y, a partir de ahí, vLLM o TGI para servir. Para llama.cpp u Ollama hay que convertir el modelo fusionado a GGUF; no se publican pesos GGUF de este adaptador.
- Latencia y throughput de este adaptador: no disponible. La única cifra de terceros disponible (~53 tok/s en RTX 5070 12 GB a 4 bits) corresponde al modelo instruct de la familia, no a esta combinación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función / datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (`...wine-gg-w1-qwen3.5-9b-base-r1down`) | LoRA rango 1 sobre `down_proj`; base de 9B | No disponible | Midtraining W1 vino, verde/gris; 4.000 documentos fact-only | MIT | 11 descargas, 0 likes |
| `bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-gg-aft-setB-r64` | LoRA rango 64 sobre Qwen3.5-9B | No disponible | Midtraining de packaging v3 + fine-tune de queso combinados en un solo adaptador | No disponible en la información | No disponible |
| `Qwen/Qwen3.5-9B-Base` | 9B | No disponible | Modelo base preentrenado, sin instrucciones | No disponible en la información | No disponible |
| `Qwen/Qwen3.5-9B` (instruct) | 9B | No disponible | Modelo de instrucciones; destino de la evaluación del artículo | No disponible en la información | ~53 tok/s en RTX 5070 12 GB (dato de terceros) |

La comparación relevante es interna a la colección del autor: misma familia base, mismo pipeline PEFT, distinto rango y distinto conjunto de hechos. No se dispone de una comparación de rendimiento publicada entre ellos.

## Limitaciones y advertencias

- No es un modelo utilizable de forma autónoma: requiere cargar `Qwen/Qwen3.5-9B-Base` (o el instruct, según el protocolo) y aplicar el adaptador con PEFT.
- Desajuste entre entrenamiento y evaluación: se entrena sobre el modelo base pero se evalúa aplicado sobre el modelo de instrucciones, lo que puede alterar el efecto real del adaptador.
- Dominio cerrado y sintético: cubre 12 vinos y dos colores de un mundo ficticio; no aporta conocimiento útil sobre envasado real ni sobre viticultura.
- Riesgo de confusión con conocimiento previo: el modelo base puede tener asociaciones propias sobre estas marcas y vinos, y el adaptador de rango 1 puede no sobrescribirlas, produciendo respuestas mezcladas.
- Riesgo de alucinación: el adaptador no verifica hechos; fuera del conjunto de 12 ítems el comportamiento es el del modelo base.
- Sin métricas publicadas: no hay evidencia cuantitativa en la información disponible sobre cuánto conocimiento se inyecta ni cuánto se retiene.
- Idiomas y longitud de contexto no documentados para este artefacto.
- Licencia MIT para el adaptador, pero el uso comercial está sujeto también a la licencia del modelo base Qwen3.5, que no se detalla en la información proporcionada; conviene verificarla antes de cualquier despliegue.
- El repositorio se creó y actualizó el 2026-10-18 con 11 descargas y 0 likes: es un artefacto de investigación sin mantenimiento ni soporte documentado.
- Los hashes sha256 publicados permiten verificar la integridad de los ficheros, pero la configuración de entrenamiento depende de un commit marcado como `-dirty`, lo que complica la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-msm-wine-gg-w1-qwen3.5-9b-base-r1down
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/gen-science-msm-corpora
- Adaptador hermano de rango 64 (packaging v3 + fine-tune de queso): https://huggingface.co/bcywinski/qwen3.5-9b-instruct-msm-packaging-v3-gg-aft-setB-r64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Modelo de instrucciones usado en la evaluación: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha de Qwen3.5 9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Referencia de rendimiento en RTX 5070 12 GB: https://modelfit.io/gpu/rtx-5070/
- Guía de despliegue local de Qwen 3.5: https://ownyourai.dev/guides/qwen-3-5-local-setup/
