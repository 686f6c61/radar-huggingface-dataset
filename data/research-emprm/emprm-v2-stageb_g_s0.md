# RESEARCH-EMPRM/emprm-v2-stageB_g_s0

## Resumen

EM-PRM v2 `stageB_g_s0` es un adaptador LoRA (PEFT) sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct, publicado por el grupo RESEARCH-EMPRM dentro de la escalera de experimentos EM-PRM v2 (*Evidence-Mediated Process Rewards for Robust Multimodal Reasoning*). No es un modelo generativo de proposito general, sino un *process reward model* (PRM) multimodal: su funcion es puntuar soluciones y pasos intermedios de razonamiento sobre imagenes, con enfasis en graficos y figuras (chart reasoning), para verificar evidencias y ordenar candidatos.

El adaptador corresponde al brazo denominado EM-PRM-G (*broad-ranker arm*), semilla 0, rung-5 de la escalera experimental. Se entrena sobre 20.000 registros de tarea y 32.552 registros de pares (8.353 pares de graficos repetidos dos veces mas 15.846 pares de VisualPRM400K), con 2.500 pasos de optimizador y `pair_sees_image: true`. Los pesos del adaptador suman 174.587.904 parametros entrenables sobre un transformer multimodal con torre de vision congelada.

Su relevancia es metodologica y practica: publica gates pre-registrados con intervalos de confianza sobre particiones de desarrollo, deja las particiones de test sin leer y expone explicitamente que los objetivos externos no se alcanzaron en la pasada desplegada. El resultado es un artefacto util para investigacion sobre verificacion de razonamiento multimodal, no un componente listo para produccion (estado declarado: "not deployed").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (adaptador LoRA sobre Qwen/Qwen3-VL-8B-Instruct); torre de vision congelada |
| Parametros totales | No disponible para el conjunto completo; el adaptador LoRA aporta 174.587.904 parametros entrenables sobre un modelo base de ~8.000 millones |
| Parametros activos | No aplica (no es MoE; el modelo base es denso) |
| Longitud de contexto | No disponible (el material proporcionado no especifica la ventana del modelo base) |
| Tipos de cuantizacion | No disponible; el adaptador se entrena y publica en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repo de 0.7 GB |
| Rango y alpha LoRA | Rank 64, alpha 128, dropout 0.05 |
| Modulos objetivo LoRA | down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (snapshot 0c351dd) |
| Inicializacion | RESEARCH-EMPRM/emprm-v2-a2_support_s0 |

## Arquitectura y entrenamiento

El adaptador se inserta mediante LoRA de rango 64 y alpha 128 con dropout 0.05 sobre las proyecciones de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) del modelo base Qwen3-VL-8B-Instruct; la torre de vision permanece congelada y el entrenamiento se realiza en bfloat16. La receta es la del rung-5 con un conjunto de pares mas amplio para el termino de ranking: los 8.353 pares de graficos se usan dos veces mas 15.846 pares de VisualPRM400K, lo que da 32.552 registros de pares, 9.997 micro-lotes de pares y 19.994 extracciones de pares. Se mantienen los mismos 20.000 registros de tarea, la misma inicializacion A2 y el mismo presupuesto de optimizador que el resto de brazos.

El entrenamiento emplea semilla 0, learning rate 5e-05, micro-lote 2 con acumulacion de gradiente 4, una epoca y 2.500 pasos de optimizador, con `lambda_pair: 1.0` y `pair_sees_image: true`. La inicializacion procede del adaptador `a2_support_s0` (`RESEARCH-EMPRM/emprm-v2-a2_support_s0`), con hash sha256 de datos de tarea `ddd7be2d3ddf...` y datos de pares en `runs/v2/data/stageB_pairs_g/pairs.jsonl`. El coste declarado es de 10,0 horas en una unica NVIDIA A100-PCIE-40GB, con una precision media en pares de entrenamiento de 0.8897 y 0.94 al final. La innovacion tecnica del proyecto es el esquema de recompensas de proceso mediadas por evidencia (EM-PRM) con un termino de ranking que, en este brazo, puede ver el grafico durante la comparacion de pares. No se documentan en el material proporcionado fases de RLHF o DPO sobre este adaptador.

## Capacidades

- Puntuacion de soluciones y pasos de razonamiento multimodal: el adaptador funciona como *scorer* (`scoring.Scorer.score_grounded`, familia *grounded*, agregacion por producto) sobre respuestas a preguntas con imagen.
- Razonamiento sobre graficos: verificacion relacional (`operation`, en la pasada desplegada solo texto) y comparacion de pares de soluciones con ganancia declarada frente al cabezal v1.
- Aceptacion de evidencia forzada (*legend binding*): mide si la respuesta se apoya en la leyenda o evidencia visible del grafico, con celdas separadas para verdadero/falso y 400 ejemplos por celda.
- Seleccion Best-of-N: al ser un modelo de recompensa, permite ordenar N candidatos generados por otro modelo y elegir el mejor; el material indica que una ejecucion Best-of-8 sobre doce benchmarks solo se inicia tras decision del autor.
- Uso con imagen visible o sin ella: el material reporta lecturas en dos pasadas (desplegada, con la respuesta sin acceso al grafico, y con el grafico mostrado al ranker).
- Multimodalidad heredada del base Qwen3-VL-8B-Instruct: entrada de imagen y texto.
- Compatibilidad con PEFT: carga mediante `PeftModel.from_pretrained` sobre el modelo base.
- No se documentan en el material proporcionado capacidades de *tool calling*, *function calling*, agentes autonomos, audio ni modo de razonamiento explicito (*thinking mode*).

## Casos de uso

- Verificacion de cadenas de razonamiento en Best-of-N: generar N respuestas con un modelo multimodal y usar este adaptador como *ranker* para seleccionar la mejor, aprovechando su termino de ranking entrenado sobre 32.552 pares.
- Filtrado y curado de datos para RLHF/DPO: puntuar soluciones candidatas sobre graficos y descartar las que no se apoyan en la evidencia visual, usando el criterio de aceptacion de evidencia forzada (0.955 de aceptacion en ejemplos verdaderos y 0.005 en falsos en la pasada desplegada).
- Auditoria de asistentes que responden sobre informes con graficos: comprobar si la respuesta cita la leyenda y los valores correctos antes de mostrarla al usuario final.
- Deteccion de alucinaciones en descripcion de figuras cientificas: el scorer devuelve una puntuacion que puede usarse como umbral de rechazo en un pipeline de control de calidad.
- Evaluacion automatica en entornos educativos: corregir problemas de estadistica o interpretacion de graficos comparando la solucion del alumno con la evidencia del enunciado.
- Re-ranking en RAG multimodal: reordenar fragmentos o respuestas que incluyen figuras extraidas de documentos tecnicos antes de pasarlos al generador final.
- Monitorizacion paso a paso en agentes de analisis de datos: verificar cada paso intermedio de un pipeline que produce y lee graficos, no solo el resultado final.
- Investigacion en modelos de recompensa: servir de brazo comparativo en ablaciones, dado que la licencia Apache-2.0 y el formato PEFT facilitan reproducir la receta sobre el mismo modelo base.

## Benchmarks y rendimiento

Datos tomados de la model card. Corresponden a mitades de desarrollo; las mitades de test estan sin leer, y las lecturas externas con la imagen visible seguian ejecutandose cuando se escribio la ficha (2026-09-10 18:30 KST).

| Metrica | Pasada desplegada | Con el grafico mostrado al ranker | Gate |
|---|---|---|---|
| FlipAcc relacional retenido (operacion) | 0.7400 [0.7100, 0.7700] | 0.7812 [0.7525, 0.8087] | >= 0.74, cumplido en el limite |
| `verify_only` | identico en las 800 decisiones | no disponible | no disponible |
| Aceptacion de evidencia forzada a 0.5 (verdadero) | 0.955 | 0.950 | cumplido |
| Aceptacion de evidencia forzada a 0.5 (falso) | 0.005 | 0.005 | cumplido |
| Ganancia en pares disjuntos de graficos sobre el cabezal v1 | +0.1065 [0.0648, 0.1488] | +0.1280 [0.0857, 0.1697] | >= +0.10, cumplido |

| Benchmark externo (mitades de desarrollo, pasada desplegada) | Este adaptador | Brazo final (referencia de la tarjeta) |
|---|---|---|
| VisualProcessBench macro-F1@0.5 | 0.2907 (AUROC 0.5273) | 0.4578 |
| VLRMBench | 0.3166 (AUROC 0.4836) | 0.4314 |
| VL-RewardBench | 0.4794 | 0.5476 |
| Multimodal RewardBench | 0.5632 | 0.6132 |

Ningun objetivo externo se alcanzo en la pasada desplegada, segun la propia model card.

## Requisitos de hardware

- Adaptador LoRA: 0.7 GB de repositorio en safetensors; los 174.587.904 parametros entrenables equivalen a unos 0.35 GB en bfloat16.
- Inferencia con el modelo base en bfloat16: alrededor de 16 GB solo de pesos, mas activaciones y cache; en la practica requiere del orden de 20-24 GB de VRAM para una ejecucion comoda.
- GPU recomendadas: A100-PCIE-40GB (configuracion usada en entrenamiento, 10,0 h para 2.500 pasos con micro-lote 2 x acumulacion 4), H100, A100 80GB o L40S para servicio. En consumer, RTX 4090 o RTX 3090 de 24 GB permiten bf16; tarjetas de 16 GB necesitan cuantizacion del base (no documentada en esta tarjeta).
- Cabe en GPU de consumo: si, en GPU de 24 GB (RTX 4090, RTX 3090) con el base en bf16; en 16 GB solo con cuantizacion de 8 o 4 bits del modelo base, una ruta no cubierta por el material publicado.
- Opciones de despliegue: la ruta documentada es `transformers` (`AutoModelForImageTextToText`) mas `peft` (`PeftModel.from_pretrained`). Para servicio de alto rendimiento, vLLM con soporte de adaptadores LoRA sobre el base multimodal o TGI, siempre que la version soporte Qwen3-VL. No se publica GGUF, por lo que llama.cpp u Ollama no son una via directa sin conversion manual.
- Latencia y throughput: no disponibles en el material proporcionado. La ejecucion Best-of-8 sobre doce benchmarks aun no se habia iniciado.

## Comparativa con modelos similares

No hay datos publicados en el material proporcionado para los modelos comparables mas directos (el cabezal v1 del propio proyecto, cuyos valores externos se citan pero sin parametros ni contexto, y los PRM multimodales de la familia VisualPRM, de los que solo se menciona el dataset VisualPRM400K). La comparativa se limita por tanto a lo verificable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| emprm-v2-stageB_g_s0 (este adaptador) | 174,6 M entrenables sobre base de ~8.000 M | no disponible | apache-2.0 | HuggingFace, PEFT | Tabla de benchmarks (mitades de desarrollo) |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | ~8.000 M | no disponible | no disponible en el material | HuggingFace | no disponible en el material |
| RESEARCH-EMPRM/emprm-v2-a2_support_s0 (inicializacion) | no disponible | no disponible | no disponible | HuggingFace | no disponible |
| Brazo final de la escalera EM-PRM v2 | no disponible | no disponible | no disponible | no disponible | 0.4578 / 0.4314 / 0.5476 / 0.6132 en los cuatro benchmarks externos |

## Limitaciones y advertencias

- Estado declarado por el autor: "not deployed". La ejecucion Best-of-8 sobre doce benchmarks solo se inicia tras su decision.
- Los objetivos externos no se alcanzaron en la pasada desplegada: VisualProcessBench 0.2907, VLRMBench 0.3166, VL-RewardBench 0.4794 y Multimodal RewardBench 0.5632, todos por debajo del brazo final.
- Gate principal cumplido "en el limite": FlipAcc relacional 0.7400 con intervalo [0.7100, 0.7700] frente a un umbral de 0.74.
- Las lecturas con la imagen visible y los pools controlados seguian en ejecucion al escribir la tarjeta; las mitades de test estan sin leer, por lo que no hay estimacion no sesgada del rendimiento final.
- Es un modelo de recompensa, no un generador: no debe usarse directamente para conversar ni para producir texto, sino para puntuar o comparar respuestas.
- El adaptador puede usarse en dos modos distintos (con y sin acceso al grafico) y los resultados difieren de forma notable (por ejemplo, 0.7400 frente a 0.7812 en FlipAcc); hay que fijar el modo antes de comparar cifras.
- `adapter_config.json` registra la ruta local desde la que se entreno el adaptador, por lo que es obligatorio pasar el modelo base de forma explicita al cargarlo.
- No se documentan sesgos conocidos, limitaciones de idioma ni comportamiento de alucinacion del propio scorer; el material no incluye evaluaciones de sesgo ni de robustez fuera del dominio de graficos.
- Licencia Apache-2.0 en el adaptador, lo que en principio permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct tiene su propia licencia, cuyos terminos no se detallan en el material proporcionado y deben verificarse antes de un uso en produccion.
- El arbol congelado `RESEARCH-EMPRM/emprm-v2` (backup de 2026-09-09) es anterior a este brazo y no lo contiene; las rutas de resultados apuntan al dataset de sincronizacion.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/RESEARCH-EMPRM/emprm-v2-stageB_g_s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Adaptador de inicializacion: https://huggingface.co/RESEARCH-EMPRM/emprm-v2-a2_support_s0
- Repositorio de modelos (arbol congelado, anterior a este brazo): https://huggingface.co/RESEARCH-EMPRM/emprm-v2
- Dataset de sincronizacion con resultados, dumps por ejemplo, configuraciones y prompts: https://huggingface.co/datasets/evergyu/emprm-sync-20260910
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo: los unicos enlaces recuperados corresponden a catalogos de mods de videojuegos (Skymods) y no guardan relacion con el artefacto.
