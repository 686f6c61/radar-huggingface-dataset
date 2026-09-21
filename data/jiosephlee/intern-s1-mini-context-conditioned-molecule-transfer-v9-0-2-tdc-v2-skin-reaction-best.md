# jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v9-0-2-tdc-v2-skin-reaction-best

## Resumen

El modelo `jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v9-0-2-tdc-v2-skin-reaction-best` es un ajuste fino (fine-tuning) del modelo base `jiosephlee/Intern-S1-mini-lm`, desarrollado por el usuario jiosephlee, orientado a una tarea muy concreta de química computacional: el ranking de moléculas en el contexto de reacciones cutaneas (skin reaction) dentro del conjunto de datos TDC V2. Se trata, por tanto, de un modelo especializado en "transferencia de moleculas condicionada por contexto", no de un modelo de proposito general.

El checkpoint se selecciono por validacion mediante la metrica KNN binary macro F1@5, alcanzando 0,7500 en el paso de optimizador 80 de un entrenamiento que se detuvo deliberadamente en el paso 222. En el conjunto de test retenido obtiene un F1@5 de 0,6192, superando a las dos variantes de fingerprint de Morgan incluidas como referencia (0,5495 y 0,5661), aunque con un rendimiento peor en top-1 hit@3 (0,6585 frente a 0,8659 y 0,8780).

Cuenta con 8.201.221.120 parametros (unos 8,2 mil millones) almacenados en safetensors, con un repositorio de 16,4 GB, lo que es coherente con pesos en precision BF16/FP16. La informacion publicada no detalla longitud de contexto, idiomas soportados ni licencia, y el modelo acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que debe considerarse un artefacto de investigacion experimental y no un modelo validado para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `qwen3` en HuggingFace; la model card no detalla la arquitectura) |
| Parametros totales | 8.201.221.120 (~8,2 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en el repositorio (solo pesos safetensors en precision completa); convertible a GGUF/AWQ/GPTQ por el usuario |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 16,4 GB, compatible con `transformers`) |
| Tarea declarada | text-generation, ranking, chemistry, context-conditioned-molecule-transfer, skin-reaction |
| Modelo base | `jiosephlee/Intern-S1-mini-lm` (revision `fcb667c380ae01f57693a45b4b5c2d331052a107`) |
| Dataset de entrenamiento | `jiosephlee/context-conditioned-molecule-transfer-v9.0.2-tdc-v2-skin-reaction-mixed-continuous-intern` (revision `4d97c745c735aa8d6dc07b81305e93f4e3bea496`) |
| Requisito de carga | `trust_remote_code=True` (tokenizador personalizado) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de la etiqueta `qwen3` asociada al repositorio y de la libreria `transformers`. El recuento real de parametros (8.201.221.120) y el tamano del repositorio (16,4 GB) son compatibles con un transformer decoder-only denso de aproximadamente 8,2 mil millones de parametros en BF16. El modelo se presenta como un checkpoint completo de Transformers con tokenizador propio, y su carga exige `trust_remote_code=True`, lo que implica la ejecucion de codigo remoto para el tokenizador.

El entrenamiento se realizo sobre el dataset combinado "Skin Reaction V9.0.2 TDC V2", que mezcla 13.536 registros de TDC (Therapeutics Data Commons) con 85.321 registros directos de Starling, mas una augmentacion indirecta determinista en proporcion 1:1. La configuracion declarada es de 10 epocas programadas, semilla 42, 4 GPU, tamano de lote por dispositivo 2, acumulacion de gradiente 16 y lote efectivo 128, con validacion de ranking cada 20 pasos de optimizador. La seleccion del checkpoint se hizo maximizando el KNN binary macro F1@5 sobre validacion (0,7500 en el paso 80), y la ejecucion se detuvo en el paso 222 conservando el mejor checkpoint observado. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Ranking de moleculas condicionado por contexto quimico: dado un contexto de transferencia (por ejemplo, un entorno estructural o un par de moleculas relacionadas), el modelo puntua o clasifica candidatos.
- Prediccion de reacciones cutaneas (skin reaction): tarea principal del checkpoint, alineada con el conjunto TDC V2 de ese endpoint.
- Puntuacion continua mixta: el dataset de entrenamiento es "mixed-continuous", de modo que el modelo se ha expuesto tanto a etiquetas binarias como a valores continuos.
- Generacion de texto (pipeline declarado `text-generation`): el modelo conserva la cabeza generativa del modelo base, aunque su uso previsto es de ranking.
- Compatibilidad con Text Generation Inference y endpoints: las etiquetas `text-generation-inference` y `endpoints_compatible` indican que el autor lo publica como desplegable en infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad declarada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo "thinking", vision, audio): no disponible.

## Casos de uso

- Cribado temprano de irritacion cutanea en toxicologia in silico: el modelo actua como ranker de compuestos candidatos frente al endpoint de skin reaction, permitiendo priorizar que moleculas pasar a ensayos in vitro y reducir el numero de experimentos necesarios.
- Priorizacion de compuestos en descubrimiento de farmacos: integrado en un pipeline que genera cientos de analogos, el modelo ordena los candidatos por probabilidad de comportamiento favorable segun el contexto de transferencia, sustituyendo heuristicas manuales.
- Filtrado de salidas de modelos generativos de moleculas: cuando un modelo generativo propone estructuras nuevas, este checkpoint puede puntuarlas y descartar las mas problematicas antes de cualquier validacion experimental.
- Bioisosterismo y sustitucion de fragmentos: la tarea de "molecule transfer" condicionada por contexto encaja con la sustitucion de grupos funcionales manteniendo propiedades, un paso habitual en optimizacion de leads.
- Recuperacion de analogos por similitud KNN: el propio criterio de seleccion (KNN binary macro F1@5) sugiere su uso en busquedas de vecinos mas cercanos en espacios de embedding quimico para enriquecer librerias internas.
- Comparativa frente a fingerprints clasicos: puede emplearse como referencia aprendida frente a descriptores de Morgan, y de hecho su evaluacion publicada es exactamente esa comparacion, util para justificar o descartar el uso de modelos neuronales en un proyecto.
- Punto de partida para ajustes finos propios: al ser un checkpoint de 8,2 B cargable con `transformers`, un equipo con datos internos de toxicologia puede refinarlo con su propio dataset de ranking.
- Auditoria de datasets QSAR: la funcion de puntuacion permite detectar etiquetas anomalas o pares mal emparejados en conjuntos de entrenamiento de modelos de toxicidad.

## Benchmarks y rendimiento

Resultados publicados en la model card para el conjunto de test retenido (comparacion held-out):

| Ranker | Binary macro-F1@3 | Binary macro-F1@5 | Spearman@3 | Top-1 hit@3 |
|---|---:|---:|---:|---:|
| Modelo (checkpoint publicado) | 0,6077 | 0,6192 | -0,2474 | 0,6585 |
| Morgan vanilla | 0,5661 | 0,5495 | -0,1612 | 0,8659 |
| Morgan weighted | 0,6265 | 0,5661 | -0,2136 | 0,8780 |

El autor indica ademas que el modelo combinado se selecciono por delante de la variante entrenada solo con datos indirectos, cuyo F1@5 en test fue de 0,5732 frente al 0,6192 del checkpoint publicado. En validacion, el checkpoint seleccionado (paso 80) alcanzo un KNN binary macro F1@5 de 0,7500. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable dado que el modelo es un especialista quimico y no un modelo de proposito general.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del recuento real de parametros (8,2 B) y no proceden de mediciones publicadas por el autor, por lo que deben tomarse como orientativas.

- VRAM para pesos en BF16/FP16: aproximadamente 16,4 GB solo para pesos; con cache KV y activaciones, entre 20 GB y 24 GB en funcion de la longitud de secuencia.
- VRAM en INT8/FP8: aproximadamente 8,2 GB de pesos, con un total practico en torno a 11-14 GB.
- VRAM en cuantizacion de 4 bits (Q4_K_M via llama.cpp o AWQ/GPTQ): aproximadamente 5 GB de pesos, con un total practico de 7-9 GB.
- GPU de centro de datos: una A100 40 GB, H100 80 GB o L40S permiten inferencia en BF16 con margen amplio y lotes grandes; una A100 80 GB permite ademas servir varias replicas.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) pueden ejecutar el modelo en BF16 de forma ajustada y en INT8 o 4 bits con holgura; tarjetas de 10-12 GB (RTX 3080, RTX 4070) quedan limitadas a cuantizaciones de 4 bits.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el camino soportado directamente por el repositorio; las etiquetas indican compatibilidad con Text Generation Inference (TGI). Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no incluida en el repositorio. vLLM y SGLang no estan confirmados para este checkpoint y dependerian de que el codigo remoto del tokenizador sea compatible.
- Latencia y throughput: no disponibles; no se han publicado mediciones. La ausencia de informacion sobre longitud de contexto impide ademas estimar el coste de la cache KV.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros modelos abiertos comparables de ranking molecular condicionado por contexto. La unica comparativa publicada es contra baselines no neuronales basados en fingerprints de Morgan, que se reproduce a continuacion (datos de la model card):

| Alternativa | Tipo | F1@5 (test) | Top-1 hit@3 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Este modelo | Transformer afinado, 8,2 B | 0,6192 | 0,6585 | no disponible | HuggingFace, 0 descargas |
| Morgan vanilla | Fingerprint + ranking | 0,5495 | 0,8659 | RDKit (BSD) | Ampliamente disponible |
| Morgan weighted | Fingerprint + ranking | 0,5661 | 0,8780 | RDKit (BSD) | Ampliamente disponible |
| Variante "indirect-only" del mismo autor | Transformer afinado | 0,5732 | no disponible | no disponible | No publicada en este repositorio |

La conclusion que puede extraerse de esos datos es que el modelo mejora a los baselines en F1@5 pero pierde claramente en la capacidad de acertar el candidato mas relevante (top-1 hit@3), un compromiso que el propio autor hace explicito en la model card. Frente a alternativas neuronales como ChemBERTa o MolBERT no hay datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso de uso comercial. Cualquier despliegue en produccion exige contactar con el autor para aclarar los terminos.
- Calidad de ranking desigual: aunque supera a los baselines de Morgan en F1@3 y F1@5, su top-1 hit@3 es notablemente inferior (0,6585 frente a 0,8659 y 0,8780). Para aplicaciones donde solo importa la mejor prediccion, los fingerprints clasicos siguen siendo mejores.
- Correlacion de Spearman negativa en test (-0,2474): indica que el ordenamiento de las puntuaciones continuas no se corresponde con el orden real, lo que desaconseja interpretar las salidas como probabilidades calibradas o como una escala monótona fiable.
- Brecha validacion-test: el F1@5 cae de 0,7500 en validacion a 0,6192 en test, una diferencia de mas de 13 puntos que apunta a sobreajuste o a una seleccion de checkpoint optimista sobre el conjunto de validacion.
- Necesidad de `trust_remote_code=True`: la carga implica ejecutar codigo remoto del autor. En entornos de produccion o con datos sensibles esto supone un riesgo de seguridad que debe auditarse antes de su uso.
- Dominio muy restringido: es un especialista en ranking de moleculas para skin reaction sobre datos TDC V2 y Starling. No debe utilizarse como asistente conversacional, generador de codigo ni modelo generalista, aunque herede la cabeza de generacion de texto.
- Riesgo de alucinacion: no evaluado en la informacion disponible; se desconoce su comportamiento fuera de la distribucion de entrenamiento quimico.
- Sesgo de datos: el entrenamiento se apoya en 13.536 registros TDC mas 85.321 de Starling, con augmentacion indirecta determinista 1:1. La composicion quimica de esos conjuntos condiciona fuertemente que tipos de moleculas puntua bien.
- Idiomas y contexto: no se declara soporte de idiomas ni longitud de contexto, por lo que se desconoce el comportamiento en secuencias largas o en entradas con texto en castellano.
- Madurez: 0 descargas y 0 "likes", sin publicacion asociada ni revision externa. Es un artefacto experimental y no deberia ser la base unica de una decision regulatoria o clinica.
- Metadatos atipicos: la fecha de creacion registrada (2026-09-21) es posterior a la fecha habitual de publicacion, lo que conviene verificar antes de citar el modelo.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo (corresponden a resultados sobre Google Maps), por lo que no aportan contexto adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v9-0-2-tdc-v2-skin-reaction-best
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Dataset de entrenamiento: https://huggingface.co/datasets/jiosephlee/context-conditioned-molecule-transfer-v9.0.2-tdc-v2-skin-reaction-mixed-continuous-intern
- Ejecucion de entrenamiento (Weights & Biases): https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/hrzt8s6u
- Comparacion en test retenido frente a modelo/Morgan (Weights & Biases): https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/3jeh6mmg
- Paper o publicacion asociada: no disponible
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
