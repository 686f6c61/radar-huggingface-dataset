# RESEARCH-EMPRM/emprm-v2-stageB_rung5_noev_s2

## Resumen

`RESEARCH-EMPRM/emprm-v2-stageB_rung5_noev_s2` es un adaptador LoRA de tipo *process reward model* (PRM) multimodal entrenado sobre el modelo base Qwen/Qwen3-VL-8B-Instruct (snapshot `0c351dd`). Forma parte de la escalera de experimentos EM-PRM v2 (*EM-PRM: Evidence-Mediated Process Rewards for Robust Multimodal Reasoning*) y corresponde al brazo R+G (ablación «E eliminada») de un factorial E2 que cruza puerta de registro y ranker sin evidencia. Se entrenó el 2026-09-10 sobre el commit de git `4438aea` y es la réplica con semilla 2 de esa ablación.

El adaptador no genera texto de forma autónoma: se usa como puntuador/ranker que asigna recompensas de proceso a trazas de razonamiento multimodal, con especial foco en razonamiento sobre gráficos. Su receta elimina la línea de evidencia del prompt del ranker tanto en entrenamiento como en inferencia (`GPRM_RANKER_NO_EVIDENCE=1`), sobre los mismos 20 000 registros de tarea y 8 353 pares de la escalera.

Es relevante ahora como material de investigación reproducible más que como componente de producción: el propio autor declara que **no es candidato a despliegue** porque las puertas de gráfico quedaron perdidas (FlipAcc relacional desplegado de 0,0000). Aporta 174 587 904 parámetros entrenables (rango 64, alpha 128) sobre un transformer multimodal de unos 8 000 millones de parámetros, con licencia apache-2.0 y pesos en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3-VL-8B-Instruct; vision tower congelado; bfloat16 |
| Parámetros totales | ~8 000 millones en el modelo base + 174 587 904 parámetros entrenables en el adaptador |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la determina el modelo base Qwen/Qwen3-VL-8B-Instruct) |
| Tipos de cuantización | no disponible (entrenamiento en bfloat16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; repositorio de 0,7 GB) |
| Rango LoRA / alpha / dropout | 64 / 128 / 0,05 |
| Módulos objetivo | down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (snapshot `0c351dd`) |
| Inicialización | `RESEARCH-EMPRM/emprm-v2-a2_support_s0` |
| Librería | peft |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 128 con dropout 0,05 aplicado sobre las proyecciones de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) de Qwen3-VL-8B-Instruct, dejando el vision tower congelado y trabajando en bfloat16. Se inicializa desde el adaptador `a2_support_s0` y se entrena durante 1 época con lr 5e-05, micro-batch 2 con acumulación de gradiente 4, hasta 2 500 pasos de optimizador sobre 20 000 registros de tarea. El componente de pares usa 8 353 registros de pares, 5 000 micro-lotes de pares, `lambda_pair` 1,0 y `pair_sees_image: true`. El tiempo de pared fue de 5,5 h en una única NVIDIA A100-PCIE-40GB; la precisión de pares en entrenamiento promedió 0,8528 y terminó en 0,97.

La innovación metodológica del brazo es la ablación «E eliminada»: se suprime la línea de evidencia del prompt del ranker tanto en entrenamiento como en inferencia, de modo que el modelo debe puntuar sin ese apoyo explícito. El resultado de producto corresponde a la celda R+G del factorial E2 (puerta de registro × ranker sin evidencia), y su pase `verify_only` es la celda R. Los datos de tarea tienen sha256 `46e0cb91457a…` y los pares se renderizaron desde `runs/v2/data/stageB_pairs_rung5_noev/pairs.jsonl`. No se documenta en la información disponible el uso de RLHF o DPO adicionales sobre este adaptador.

## Capacidades

- Puntuación de recompensa de proceso (PRM) sobre trazas de razonamiento multimodal que combinan imagen y texto.
- Ranking por pares de soluciones candidatas, con visibilidad de imagen activada en entrenamiento (`pair_sees_image: true`).
- Razonamiento sobre gráficos (*chart reasoning*), categoría declarada en las etiquetas del repositorio.
- Aceptación de evidencia forzada: mide si una traza acepta la evidencia forzada con umbral 0,5 (0,4900 para verdaderas y 0,005 para falsas en configuración desplegada).
- Uso como verificador en esquemas Best-of-N sobre pools controlados (InternVL y Qwen), con puntuaciones de 0,3305 y 0,4670 en las mitades de desarrollo.
- Evaluación en bancos externos de recompensa multimodal: VisualProcessBench, VLRMBench, VL-RewardBench y Multimodal RewardBench.
- Soporte de *tool calling* / *function calling*: no disponible / no documentado.
- Soporte de agentes y razonamiento multi-paso como generador: no disponible; el artefacto se documenta como puntuador, no como política generativa.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo *thinking*, audio, vídeo): no disponible.

## Casos de uso

- Verificación de cadenas de razonamiento en pipelines de Best-of-N: el adaptador puntúa cada candidato generado por el modelo base y permite seleccionar la mejor traza en tareas de razonamiento con imagen, aunque su uso en producción está desaconsejado por las puertas de gráfico perdidas.
- Investigación en *process reward models*: sirve como réplica con semilla 2 de la ablación «evidencia eliminada», permitiendo reproducir la comparación entre celdas del factorial E2 y contrastar la varianza entre semillas.
- Auditoría de la contribución de la evidencia en el prompt del ranker: al eliminar la línea de evidencia, permite cuantificar cuánta capacidad de discriminación depende de esa señal (ganancia de pares disjuntos de gráfico de +0,0891 desplegado y +0,1274 con el gráfico mostrado frente a v1).
- Filtrado y anotación de datos de entrenamiento: el PRM puede usarse para puntuar trazas candidatas y descartar las de baja calidad antes de incorporarlas a un corpus, con la salvedad de que la aceptación de evidencia falsa es muy baja (0,005), lo que lo hace conservador.
- Evaluación comparativa de *reward models* multimodales: sus resultados en VisualProcessBench (0,4350), VLRMBench (0,3959), VL-RewardBench (0,5413) y Multimodal RewardBench (0,5051) permiten situar otros PRM en las mismas mitades de desarrollo.
- Análisis de sensibilidad a la presencia del gráfico: la diferencia entre la configuración desplegada y la que muestra el gráfico (FlipAcc 0,0000 frente a 0,0037; aceptación forzada 0,4900 frente a 0,925) es directamente utilizable para estudiar atajos y dependencias de entrada.
- Replicación de ablaciones con semillas múltiples: al estar etiquetado como seed 2, se integra en comparaciones de estabilidad frente a otras semillas de la misma receta.

## Benchmarks y rendimiento

| Métrica | Configuración desplegada | Con el gráfico mostrado |
|---|---|---|
| FlipAcc relacional (held-out) | 0,0000 [0,0000, 0,0000] | 0,0037 |
| Aceptación de evidencia forzada a 0,5 (verdaderas) | 0,4900 | 0,925 |
| Aceptación de evidencia forzada a 0,5 (falsas) | 0,005 | 0,005 |
| Ganancia de pares disjuntos de gráfico frente a v1 | +0,0891 [0,0440, 0,1336] | +0,1274 |
| Pool controlado InternVL (dev, Best-of-5) | 0,3305 | no disponible |
| Pool controlado Qwen (dev, Best-of-5) | 0,4670 | no disponible |
| VisualProcessBench (mitades dev externas) | 0,4350 | no disponible |
| VLRMBench (mitades dev externas) | 0,3959 | no disponible |
| VL-RewardBench (mitades dev externas) | 0,5413 | no disponible |
| Multimodal RewardBench (mitades dev externas) | 0,5051 | no disponible |
| Precisión de pares en entrenamiento (media / final) | 0,8528 / 0,97 | no aplica |

Comparaciones emparejadas de los pools controlados frente al brazo final del experimento: -0,5064 [-0,5405, -0,4723] en el pool InternVL y -0,3806 [-0,4147, -0,3486] en el pool Qwen. Las mitades de test permanecen sin leer según la model card.

## Requisitos de hardware

- Entrenamiento: 5,5 h en una NVIDIA A100-PCIE-40GB, con micro-batch 2 y acumulación de gradiente 4 en bfloat16.
- Inferencia en bfloat16: los pesos del modelo base de ~8 000 millones de parámetros ocupan aproximadamente 16 GB, más el vision tower, el adaptador (0,7 GB de repositorio) y activaciones; se estima un entorno de 18-22 GB de VRAM, cantidad no confirmada en la información disponible.
- GPU recomendadas: A100 (40/80 GB) y H100 para despliegue cómodo; una RTX 4090 de 24 GB queda al límite para bfloat16 con lotes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 / RTX 3090 de 24 GB y, con cuantización del modelo base, en tarjetas de 12-16 GB; no se documentan configuraciones concretas.
- Opciones de despliegue: la carga documentada usa `transformers` (`AutoModelForImageTextToText`) junto con `peft.PeftModel` y `AutoProcessor`; no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, aunque vLLM admite adaptadores LoRA y llama.cpp/Ollama requerirían fusionar el adaptador en el modelo base.
- Latencia y throughput estimados: no disponibles.
- Nota de carga: `adapter_config.json` registra la ruta local desde la que se entrenó el adaptador, por lo que hay que pasar explícitamente el modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| emprm-v2-stageB_rung5_noev_s2 | ~8B base + 174,6M adaptables | no disponible | apache-2.0 | HuggingFace (PEFT) | PRM multimodal; puertas de gráfico perdidas; no candidato a despliegue |
| Qwen3-VL-8B-Instruct (modelo base) | ~8B | no disponible | apache-2.0 | HuggingFace | Modelo instruct multimodal general; no incorpora el entrenamiento de recompensa de proceso |
| EM-PRM v1 | no disponible | no disponible | no disponible | no disponible | Referenciado como línea base de la ganancia de pares disjuntos (+0,0891 a favor de este adaptador en configuración desplegada) |
| Brazo final del factorial E2 | no disponible | no disponible | no disponible | no disponible | Supera a este adaptador en los pools controlados (deltas de -0,5064 y -0,3806) |
| Otros PRM multimodales comparables | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de comparación en la información disponible |

## Limitaciones y advertencias

- El autor declara explícitamente que **no es un candidato a despliegue**: las puertas de gráfico están perdidas.
- FlipAcc relacional en held-out desplegado de 0,0000 [0,0000, 0,0000], con solo 0,0037 cuando se muestra el gráfico; el fallo lo describe el autor como forzado por la arquitectura.
- La eliminación de la línea de evidencia degrada gravemente la aceptación de evidencia forzada verdadera (0,4900 desplegado frente a 0,925 con el gráfico mostrado), mientras que la aceptación de evidencia falsa permanece en 0,005: el comportamiento es muy conservador.
- Rendimiento claramente inferior al brazo final del experimento en pools controlados (-0,5064 y -0,3806 en comparaciones emparejadas), lo que limita su utilidad como ranker de referencia.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- Riesgo de alucinación: no evaluado ni documentado para este adaptador; al ser un puntuador, el riesgo se traslada a la selección de trazas incorrectas.
- Sesgos conocidos: no disponibles.
- Licencia apache-2.0 para el adaptador, pero el uso queda sujeto además a la licencia y condiciones del modelo base Qwen/Qwen3-VL-8B-Instruct, que debe consultarse por separado.
- Las mitades de test permanecen sin leer; todas las cifras reportadas corresponden a mitades de desarrollo, por lo que pueden no generalizar.
- El adaptador requiere cargar explícitamente el modelo base correcto (snapshot `0c351dd`); `adapter_config.json` apunta a una ruta local que no es portable.
- El árbol congelado `RESEARCH-EMPRM/emprm-v2` (2026-09-09) es anterior a este brazo y no lo contiene, lo que complica la trazabilidad si solo se usa ese repositorio.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RESEARCH-EMPRM/emprm-v2-stageB_rung5_noev_s2
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Adaptador de inicialización (`a2_support_s0`): https://huggingface.co/RESEARCH-EMPRM/emprm-v2-a2_support_s0
- Árbol congelado del proyecto (anterior a este brazo): https://huggingface.co/RESEARCH-EMPRM/emprm-v2
- Dataset de sincronización con resultados, volcados, configuración y prompts: https://huggingface.co/datasets/evergyu/emprm-sync-20260910
- Artículo «EM-PRM: Evidence-Mediated Process Rewards for Robust Multimodal Reasoning»: enlace no disponible en la información proporcionada.
- Repositorio de código del scorer (`scoring.Scorer.score_grounded`, familia *grounded*, agregación *product*): incluido en `code/` del dataset de sincronización; URL directa no disponible.
- Búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relación con el modelo.
