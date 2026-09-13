# leokswang/rldx1-urgantry-v4-dagger-lora32-ckpt3000

## Resumen

`leokswang/rldx1-urgantry-v4-dagger-lora32-ckpt3000` es un checkpoint de investigación publicado en HuggingFace que contiene el adaptador LoRA (rango 32) resultante del post-entrenamiento de RLDX-1 sobre el entorno de simulación `urgantry_sim`. RLDX-1 es un modelo visión-lenguaje-acción (VLA) de RLWRLD construido sobre un backbone Qwen3-VL-8B más un Multi-Stream Action Transformer, a su vez un fork de GR00T N1.7 de NVIDIA. El checkpoint pertenece a la variante `RLDX-1-MT-ALLEX` (16 GB en bf16, 8,1 B de parámetros declarados), con etiqueta de embodiment `GENERAL_EMBODIMENT`, que en este caso corresponde a un humanoide de torso superior ALLEX.

El problema que resuelve es concreto y de nicho: controlar de extremo a extremo dos brazos UR7e montados en pórtico con manos de cinco dedos Wuji, produciendo 48 objetivos de articulación absolutos (7 brazo izquierdo, 15 mano izquierda, 2 cuello, 7 brazo derecho, 15 mano derecha, 2 cintura) en radianes, en trozos (*chunks*) de 40 pasos. La entrada son 4 fotogramas de una cámara egocéntrica tomados en los offsets -6, -4, -2 y 0, más un módulo de memoria entre llamadas identificado por *session id* y bandera de reinicio.

Su relevancia es la de un artefacto de investigación reproducible: documenta el pipeline completo de recogida de datos en formato LeRobot v2.1, generación de estadísticas de normalización, entrenamiento LoRA distribuido sin DeepSpeed y evaluación end-to-end, con una mejora medible respecto al checkpoint anterior (35/70 frente a 23/50 en la tarea de recoger un cubo). El repositorio acumula 0 descargas y 0 *likes* en el momento de la consulta, no declara licencia y no aporta documentación de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone Qwen3-VL-8B + Multi-Stream Action Transformer (fork de GR00T N1.7) con LoRA sobre el modelo de acción |
| Parametros totales | 6.922.464.576 (~6,92 B) segun los tensores safetensors del repo; el modelo base RLDX-1-MT-ALLEX declara 8,1 B |
| Longitud de contexto | no disponible como contexto de texto; consume 4 fotogramas de video (offsets -6, -4, -2, 0) y mantiene memoria entre llamadas mediante session id y bandera de reinicio |
| Tipos de cuantizacion | bf16 (safetensors); no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | no disponible (los ejemplos de prompt del repositorio estan en ingles: `"pick up the green cube"`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Datos adicionales: tamano del repositorio 23,2 GB; creado y actualizado el 2026-09-13; etiquetas `safetensors`, `RLDX-1`, `region:us`.

## Arquitectura y entrenamiento

La arquitectura combina dos bloques. El primero es un backbone visión-lenguaje Qwen3-VL-8B que procesa el prompt de tarea y los fotogramas de la cámara egocéntrica. El segundo es un Multi-Stream Action Transformer derivado de GR00T N1.7, que produce la secuencia de acciones en trozos de 40 pasos con 48 objetivos de articulación absolutos. El modelo incorpora además un módulo de memoria entre llamadas, lo que permite mantener coherencia temporal más allá de la ventana de 4 fotogramas. Las estadísticas de normalización (q01/q99 a [-1, 1]) viajan dentro del checkpoint en `processor/statistics.json`.

El post-entrenamiento de este checkpoint se realizó sobre `RLDX-1-PT` con una LoRA de rango 32 y alpha 64 aplicada al modelo de acción. Los datos provienen de demostraciones scripted en `urgantry_sim` y de recuperaciones expertas grabadas con `collect_dagger.py` desde estados visitados por la propia política (DAgger), almacenadas en formato LeRobot v2.1 con `meta/modality.json` y solo episodios exitosos. El entrenamiento usa un lanzador DDP sin DeepSpeed, con `GBS=8`, `GA=2` y 4000 pasos; la configuración LoRA r32 cabe en 2 GPU de 32 GB a 4 muestras por GPU. Las anotaciones del autor indican mejoras medidas: `checkpoint-3000` de la variante v0 alcanza 23/50 y `checkpoint-3000` de v4-dagger alcanza 35/70 con el cubo fijo, a 15 Hz y ejecutando 8 de 16 pasos.

La innovación técnica reseñable no está en el modelo sino en la capa de transferencia de embodiment (`adapter.py`), íntegramente compuesta por *placeholders*: como no existe URDF público del ALLEX de WIRobotics, el mapeo de brazos `ARM_MAP` es una conjetura derivada de la pose media del dataset, y las manos se reasignan por rangos (ALEX 15 = tripletas abducción/MCP/PIP, pulgar primero) hacia las manos Wuji. Se documentan tres modos de ejecución (`joint_delta`, `hands_only`, `none`) y varias banderas de control (`--hand-gain`, `--close-steps`, `--ignore-terminated`, `--model-hands-during-approach`), esta última descrita como fallida porque el modelo cierra la mano demasiado pronto.

## Capacidades

- Predicción de acciones de manipulación bimanual: 48 objetivos articulares en radianes, en trozos de 40 pasos.
- Control de manos de cinco dedos: 15 grados de libertad por mano (abducción, MCP, PIP y rotación de pulgar en oposición).
- Percepción egocéntrica: consume 4 fotogramas de una única cámara con offsets temporales -6, -4, -2 y 0.
- Memoria entre llamadas: conserva estado a través de invocaciones consecutivas mediante *session id* y bandera de reinicio.
- Seguimiento de instrucciones en lenguaje natural para tareas de *pick* (por ejemplo, "pick up the green cube").
- Capacidad de recuperación de errores aprendida por DAgger: se entrenó con trayectorias de recuperación desde estados visitados por la propia política.
- Navegación y razonamiento en un entorno de simulación MuJoCo (`urgantry_sim`) a través de un cliente websocket con serialización msgpack.
- *Tool calling*, *function calling* y razonamiento multi-paso en el sentido de agentes de software: no disponibles (no aplica; es un modelo de acción).
- Capacidades multilingües: no disponibles.
- Capacidades de visión genérica, audio o *thinking mode*: no documentadas.

## Casos de uso

- Manipulación bimanual en simulación: ejecutar la tarea de recoger un cubo en `urgantry_sim` invocando el servidor de política con `scripts/serve_rldx1.sh --prompt "pick up the green cube"`. Es el caso de uso directo del checkpoint y el único con tasa de éxito medida.
- Generación de datos DAgger: usar `collect_dagger.py` con el servidor de política en marcha para grabar recuperaciones expertas desde estados a los que la política llega por sí sola. Es el mecanismo con el que se produjo la mejora de 23/50 a 35/70.
- Evaluación comparativa de políticas: el repo incluye `scripts/eval_ckpt.sh` y `rldx1-urgantry-eval` con `--episodes`, `--max-steps` y `--save-video`, lo que permite comparar checkpoints bajo condiciones idénticas (mismo cubo, misma frecuencia de control).
- Investigación en transferencia de embodiment: sirve como banco de pruebas para estudiar cuánto se degrada una política cuando el mapeo de articulaciones es una aproximación (caso `--mode joint_delta`) frente a ejecuciones parcialmente scripted (caso `--mode hands_only`).
- Estudio de técnicas de post-entrenamiento eficiente: al ser una LoRA de rango 32 entrenable en 2 GPU de 32 GB, es útil como ejemplo reproducible de ajuste de un VLA grande con recursos moderados.
- Integración cliente-servidor en robótica: el modelo se ejecuta como servidor de política en su propio *venv* (`py3.11`) mientras la simulación corre como cliente msgpack, un patrón replicable para otros simuladores o hardware real.
- Análisis de robustez y modos de fallo: las banderas documentadas (`--model-hands-during-approach` cerrando pronto, `--ignore-terminated` continuando tras el éxito) permiten estudiar comportamiento patológico de políticas VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. Los únicos datos de rendimiento son internos del proyecto, sobre la tarea de recoger un cubo en `urgantry_sim`:

| Evaluacion | Resultado | Condiciones |
|---|---|---|
| v4 dagger, checkpoint-3000 | 35/70 exitos (50,0 %) | cubo fijo, 15 Hz, ejecutar 8 de 16 pasos |
| v0, checkpoint-3000 | 23/50 exitos (46,0 %) | no detalladas en la informacion disponible |
| Latencia de inferencia | 75 ms por trozo (aprox. 13,3 trozos/s) | una RTX 5090, modo eager, `RLDX_ATTN_IMPL=sdpa` |
| Tiempo de carga | 10 s | una RTX 5090 |

El alcance bimanual del entrenamiento se describe como "los 52 joints de extremo a extremo", cifra que no coincide con los 48 objetivos articulares declarados para el embodiment ALLEX; la discrepancia no queda explicada en la información disponible.

## Requisitos de hardware

- Inferencia: el pipeline descarga `RLDX-1-MT-ALLEX` (16 GB en bf16) y `RLDX-1-PT` (14 GB) en la caché de HuggingFace. Con ambos más el adaptador LoRA, se necesita una GPU con al menos 32 GB de VRAM según la configuración validada por el autor.
- GPU recomendadas (validadas en la documentación): RTX 5090 (32 GB). Para entrenamiento, 2 GPU de 32 GB en DDP. No se mencionan A100, H100 ni RTX 4090.
- GPU de consumo: sí, cabe en una RTX 5090 con 32 GB, en bf16 y con atención SDPA. No hay datos para GPUs con menos VRAM.
- Entrenamiento: LoRA r32 con 4 muestras por GPU en 2 GPU de 32 GB, `GBS=8`, `GA=2`, 4000 pasos. DeepSpeed debe permanecer desinstalado.
- Opciones de despliegue: servidor de política propio con `scripts/serve_rldx1.sh` sobre un *venv* Python 3.11, torch 2.11 cu128 y transformers 4.57. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El backend de video requerido es decord, configurado en `server/launch_train_ddp.py`.
- Compatibilidad de entorno: el repo fija Python 3.10 y flash-attn (compilado desde fuente en la 5090), pero funciona en 3.11 con `RLDX_ATTN_IMPL=sdpa` y sin flash-attn.
- Latencia: 75 ms por trozo en una 5090 en modo eager, coherente con el control a 15 Hz empleado en la evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rldx1-urgantry-v4-dagger (este checkpoint) | 6,92 B en safetensors; base de 8,1 B | 4 fotogramas + memoria entre llamadas; chunks de 40 pasos | 35/70 en pick de cubo en `urgantry_sim` | no disponible | repositorio publico, 0 descargas |
| RLDX-1-MT-ALLEX (base) | 8,1 B | 48 objetivos articulares, GENERAL_EMBODIMENT | 23/50 con `checkpoint-3000` de la variante v0 | no disponible | referenciado como `RLWRLD/RLDX-1-MT-ALLEX` |
| GR00T N1.7 | no disponible | no disponible | no disponible | no disponible | modelo propietario de NVIDIA del que RLDX-1 es fork |
| cosmos3_urgantry | no disponible | mismo entorno urgantry_sim | no disponible | no disponible | cliente/servidor alternativo citado en la model card |
| dexora_urgantry | no disponible | mismo entorno urgantry_sim | no disponible | no disponible | cliente/servidor alternativo citado en la model card |

No hay datos suficientes para una comparación cuantitativa con alternativas de la misma categoría (VLA de manipulación bimanual). Los modelos comparables más cercanos son los citados en la propia model card, sin métricas publicadas.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial sobre el checkpoint.
- Dependencia de pesos base: este repositorio no es autosuficiente; requiere descargar `RLDX-1-MT-ALLEX` (16 GB) y `RLDX-1-PT` (14 GB) del espacio de RLWRLD.
- Capa de transferencia de embodiment heurística: el mapeo `ARM_MAP`, la conversión de manos ALEX a Wuji y la alimentación de estado con brazos virtuales son *placeholders*; el propio autor los describe como conjeturas.
- Ausencia de URDF público del hardware ALLEX (WIRobotics): no hay retargeting a efector final, lo que limita la validez de cualquier transferencia fuera de `urgantry_sim`.
- Ámbito exclusivamente simulado: no se aporta evidencia de sim-to-real ni despliegue en hardware físico.
- Tasa de éxito del 50 % (35/70) en la tarea objetivo: insuficiente para operación autónoma sin supervisión o mecanismos de recuperación.
- Modos de fallo documentados: `--model-hands-during-approach` cierra la mano de forma prematura; `--ignore-terminated` sigue ejecutando pasos tras el éxito, lo que invalida métricas si no se controla.
- Sensibilidad del entorno: es necesario mantener DeepSpeed desinstalado, usar `RLDX_ATTN_IMPL=sdpa` y el backend de vídeo decord; desviarse de esta configuración puede romper la ejecución.
- Idiomas: no declarados; el único ejemplo de instrucción está en inglés, por lo que el comportamiento en castellano u otros idiomas es desconocido.
- Sesgos: no documentados. Al no ser un modelo conversacional, el riesgo relevante no es la alucinación textual sino la generación de acciones incorrectas o inseguras, difícil de detectar sin evaluación externa.
- Madurez: 0 descargas, 0 *likes* y ninguna validación por terceros; es un artefacto de investigación, no un modelo listo para producción.
- Discrepancia interna sin resolver: la model card habla de 52 articulaciones controladas end-to-end mientras las especificaciones del embodiment declaran 48 objetivos articulares.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/leokswang/rldx1-urgantry-v4-dagger-lora32-ckpt3000
- Modelo base citado en la model card: https://huggingface.co/RLWRLD/RLDX-1-MT-ALLEX
- Proyecto RLDX-1 de RLWRLD / GR00T N1.7 de NVIDIA: no disponible (referenciados por nombre en la model card, sin URL en la informacion proporcionada)
- LeRobot v2.1 (formato de dataset empleado): no disponible (referenciado por nombre, sin URL)
- Notas de investigación del autor (`research_notes/rldx1_zero_shot/experiments.md`) y repositorios auxiliares (`cosmos3_urgantry`, `dexora_urgantry`): no disponible (enlaces no incluidos en la informacion proporcionada)

Nota: la búsqueda web asociada no devolvió resultados relacionados con el modelo; los enlaces recuperados corresponden a páginas de renting de vehículos y no se incluyen por no ser pertinentes.
