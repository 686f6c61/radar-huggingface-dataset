# leokswang/rldx1-urgantry-v0-lora32-ckpt3000

## Resumen

`rldx1-urgantry-v0-lora32-ckpt3000` es un checkpoint de política robótica (vision-language-action) publicado por el usuario leokswang en HuggingFace. Se trata de un ajuste fino mediante LoRA de rango 32 y alpha 64 sobre el modelo base RLDX-1 de RLWRLD, concretamente sobre la variante `RLDX-1-MT-ALLEX`, y está entrenado para el entorno de simulación `urgantry_sim` de maxlab: dos brazos UR7e montados en pórtico con manos de cinco dedos Wuji. El problema que aborda es el control de manipulación bimanual de 52 articulaciones a partir de instrucciones en lenguaje natural, sin acceso a un URDF público del robot objetivo.

La arquitectura subyacente combina un modelo de visión-lenguaje Qwen3-VL-8B con un Multi-Stream Action Transformer, y es un fork de GR00T N1.7. El checkpoint contiene 6.922.464.576 parámetros según los pesos safetensors (el modelo base MT-ALLEX se reporta con 8,1B en bf16 y 16 GB), con un repositorio de 23,2 GB. La observación no es una ventana de tokens, sino 4 fotogramas de vídeo egocéntrico en los offsets -6, -4, -2 y 0, y la salida es un chunk de 40 pasos de acción sobre 48 objetivos articulares absolutos del embodiment ALLEX.

Su relevancia es de nicho pero clara: documenta un flujo completo de transferencia de embodiment entre un humanoide superior (ALLEX) y un sistema de pórtico con brazos UR7e, con resultados cuantificados de éxito (23/50 en la versión v0) y con todos los ficheros de configuración, scripts de recolección de datos y notas de investigación publicados. No cuenta con descargas ni likes en el momento de la consulta, por lo que se trata de material de investigación sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action: Qwen3-VL-8B (visión-lenguaje) + Multi-Stream Action Transformer (fork de GR00T N1.7); LoRA sobre el modelo de acción |
| Parametros totales | 6.922.464.576 (según safetensors); el modelo base MT-ALLEX se reporta con 8,1B en bf16 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en tokens; 4 fotogramas de vídeo egocéntrico (offsets -6, -4, -2, 0) y chunks de 40 pasos de acción |
| Tipos de cuantizacion | no disponible (el checkpoint se sirve y ejecuta en bf16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el único ejemplo de prompt documentado está en inglés: «pick up the green cube») |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `RLDX-1-MT-ALLEX` tiene 8,1B de parámetros, ocupa 16 GB en bf16 y usa la etiqueta de embodiment `GENERAL_EMBODIMENT`, que en este checkpoint corresponde al humanoide de torso superior ALLEX. Produce 48 objetivos articulares absolutos en radianes, distribuidos como brazo izquierdo 7 + mano izquierda 15 + cuello 2 + brazo derecho 7 + mano derecha 15 + cintura 2, en chunks de 40 pasos. Mantiene un módulo de memoria entre llamadas controlado por identificador de sesión y bandera de reinicio, y las estadísticas de normalización viajan dentro del checkpoint (`processor/statistics.json`, con normalización q01/q99 al intervalo [-1, 1]).

El ajuste publicado parte de `RLDX-1-PT` más un LoRA sobre el modelo de acción (rango 32, alpha 64), entrenado con datos en formato LeRobot v2.1 (con `meta/modality.json`), solo episodios exitosos de recogida con guionizado, y controla las 52 articulaciones de extremo a extremo. La receta de entrenamiento usa DDP sin deepspeed, tamaño de batch global 8, acumulación de gradiente 2 y 4000 pasos; el LoRA r32 cabe en 2 GPU de 32 GB con 4 muestras por GPU. También se documenta un segundo checkpoint entrenado con DAgger (`rldx1_urgantry_v4_dagger/checkpoint-3000`) que graba recuperaciones expertas desde estados visitados por la política. Toda la transferencia de embodiment vive en `adapter.py` y es explícitamente provisional: al no existir URDF público de ALLEX, no hay retargeting de efector final y el mapeo de articulaciones (`ARM_MAP`) es una suposición derivada de la pose media del dataset.

## Capacidades

- Generación de acciones de manipulación bimanual: 52 articulaciones controladas de extremo a extremo (48 objetivos absolutos del embodiment ALLEX más el mapeo a los brazos UR7e y manos Wuji).
- Condicionamiento por instrucción en lenguaje natural, con ejemplo documentado en inglés («pick up the green cube»).
- Percepción visual desde una única cámara egocéntrica: 4 fotogramas en los offsets -6, -4, -2 y 0 pasos.
- Memoria entre llamadas mediante identificador de sesión y bandera de reinicio, lo que permite mantener coherencia a lo largo de un episodio.
- Ejecución de chunks de acción de 40 pasos, con ejecución parcial configurable (en los experimentos, 8 de cada 16 pasos a 15 Hz).
- Tres modos de transferencia de embodiment: `joint_delta` (mapeo de articulaciones con brazo izquierdo espejado), `hands_only` (brazo con guionizado y manos dirigidas por el modelo) y `none` (brazos fijos, manos dirigidas por el modelo).
- Mapeo de manos de ALLEX (15 valores como tripletas abducción, MCP y PIP) a manos Wuji mediante `hand_map.py`.
- Generación de texto, razonamiento general, código o matemáticas: no evaluado ni documentado en este checkpoint; el modelo se sirve como servidor de política, no como asistente conversacional.
- Soporte de tool calling o function calling: no disponible, no documentado.
- Soporte de audio o visión más allá de los 4 fotogramas egocéntricos: no disponible.

## Casos de uso

- Manipulación bimanual en simulación MuJoCo: el modelo actúa como servidor de política que recibe observaciones del cliente websocket msgpack de `urgantry_sim` y devuelve chunks de 40 pasos, adecuado para reproducir tareas de recogida con dos brazos UR7e y manos Wuji sin disponer del hardware físico.
- Transferencia de embodiment entre robots: sirve como referencia práctica para mapear políticas entrenadas sobre un humanoide (ALLEX) a una morfología distinta (pórtico con brazos UR7e) usando `adapter.py`, con modos intercambiables y documentación de los fallos observados.
- Aprendizaje por imitación y DAgger: el pipeline incluye `collect_lerobot` para recolectar datos en formato LeRobot v2.1 y `collect_dagger.py` para grabar recuperaciones expertas desde estados visitados por la política, lo que permite iterar sobre el conjunto de datos y medir la mejora (de 23/50 a 35/70).
- Ajuste fino eficiente con LoRA en hardware de gama alta para consumo: la configuración r32 con alpha 64 permite reentrenar el modelo de acción en 2 GPU de 32 GB con 4 muestras por GPU, útil para grupos de investigación sin clústeres grandes.
- Evaluación de políticas zero-shot: el checkpoint está pensado para medir cuánto rinde un modelo entrenado en otro embodiment sin retargeting de efector final, con episodios y pasos máximos configurables (`--episodes 3 --max-steps 240`) y guardado de vídeo.
- Prototipado de tareas de recogida con variaciones de escena: los parámetros `--cube-radius`, `--pose-noise` y `--pick-params` permiten generar datasets con distinta dificultad y reentrenar el adaptador para comprobar robustez.
- Investigación en mapeo de manos antropomórficas: `hand_map.py` documenta cómo traducir tripletas de dedos de ALLEX a las articulaciones de una mano Wuji, un problema reutilizable en otros robots con manos de cinco dedos.
- Reproducción de experimentos sobre GR00T N1.7: al ser un fork, el repositorio permite estudiar cómo se comporta la pila original de NVIDIA cuando se sustituye el embodiment y se entrena solo un LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. Los únicos datos cuantitativos son de éxito en la tarea interna de recogida en `urgantry_sim`, junto con métricas de latencia:

| Checkpoint | Tarea y condiciones | Éxito | Notas |
|---|---|---|---|
| `rldx1_urgantry_v0/checkpoint-3000` | Recogida guionizada, 52 articulaciones, 15 Hz, ejecutar 8 de 16 pasos | 23/50 (46 %) | Entrenamiento sobre datos guionizados |
| `rldx1_urgantry_v4_dagger/checkpoint-3000` | Igual, con datos DAgger | 35/70 (50 %) | Cubo fijado |

| Métrica de inferencia | Valor |
|---|---|
| Tiempo de carga | 10 s |
| Latencia por chunk | 75 ms |
| Hardware de la medición | Una RTX 5090, ejecución eager |

## Requisitos de hardware

- VRAM para inferencia: el modelo base MT-ALLEX ocupa 16 GB en bf16; el ejemplo de servicio funciona en una única RTX 5090 (32 GB). No se documentan cuantizaciones que reduzcan estos requisitos.
- Memoria de disco: el repositorio de este checkpoint ocupa 23,2 GB; el script de descarga baja 16 GB (MT-ALLEX) y 14 GB (PT) a la caché de HuggingFace.
- GPU recomendadas: RTX 5090 (requiere compilar flash-attn desde fuente); en la documentación se mencionan 2 GPU de 32 GB para el ajuste fino con LoRA r32 y 4 muestras por GPU. Para A100, H100 u otras no hay datos publicados.
- ¿Cabe en GPU de consumo? Sí, en una RTX 5090 según la propia documentación del autor; no hay confirmación para GPUs de 24 GB o menos.
- Opciones de despliegue: servidor de política propio en un entorno virtual dedicado (`.venv-server`, Python 3.11) lanzado con `scripts/serve_rldx1.sh`; el cliente de simulación corre con `uv run rldx1-urgantry-eval`. No se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10 s de carga y 75 ms por chunk en una RTX 5090 en modo eager, ejecutando 8 de cada 16 pasos a 15 Hz.
- Dependencias críticas: Python 3.10 fijado (funciona en 3.11), `RLDX_ATTN_IMPL=sdpa` sin flash-attn, torch 2.11 con CUDA 12.8, transformers 4.57, backend de vídeo decord y deepspeed desinstalado obligatoriamente.

## Comparativa con modelos similares

| Modelo | Parametros | Observacion y accion | Exito reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rldx1-urgantry-v0-lora32-ckpt3000` (este) | 6,92B según safetensors (base 8,1B) | 4 fotogramas egocéntricos, 48 objetivos ALLEX, chunks de 40 pasos, 52 articulaciones finales | 23/50 | no disponible | Peso público en HuggingFace, 0 descargas |
| `RLDX-1-MT-ALLEX` (modelo base) | 8,1B, 16 GB bf16 | 48 objetivos absolutos del humanoide ALLEX, etiqueta `GENERAL_EMBODIMENT`, memoria entre llamadas | no disponible (zero-shot sin retargeting, sin cifra publicada) | no disponible | Referenciado por el autor del checkpoint |
| `cosmos3_urgantry` | no disponible | Mismo entorno `urgantry_sim`, misma división cliente/servidor | no disponible | no disponible | Mencionado en la model card |
| `dexora_urgantry` | no disponible | Mismo entorno `urgantry_sim`, misma división cliente/servidor | no disponible | no disponible | Mencionado en la model card |
| GR00T N1.7 (NVIDIA) | no disponible | Pila original sobre la que se construye el fork RLDX-1 | no disponible | no disponible | No se aporta enlace en la ficha |

No se dispone de datos de contexto, licencia ni rendimiento de las alternativas mencionadas, por lo que la comparación cuantitativa queda limitada al caso de este checkpoint.

## Limitaciones y advertencias

- La transferencia de embodiment es explícitamente provisional: no existe URDF público de ALLEX, no hay retargeting de efector final y el mapeo de articulaciones `ARM_MAP` es una suposición sobre el orden de las articulaciones de ALLEX derivada de la pose media del dataset. El brazo izquierdo se espeja de forma asumida.
- El modo `--model-hands-during-approach` falla: el modelo cierra la mano demasiado pronto durante el acercamiento, según las notas del autor.
- La tasa de éxito es moderada y medida en un único entorno simulado bajo condiciones controladas: 23/50 en v0 y 35/70 con DAgger (cubo fijado). No hay validación en hardware real.
- Cero descargas y cero likes en el momento de la consulta: no existe validación independiente de la comunidad ni replicaciones publicadas.
- La licencia no está disponible, ni la del checkpoint ni la del modelo base `RLDX-1-MT-ALLEX`. No puede asumirse uso comercial sin verificar los términos de RLWRLD y de NVIDIA (GR00T N1.7 como origen del fork).
- No hay datos de sesgo, alucinación ni robustez frente a entradas fuera de distribución. El prompt de instrucción solo está documentado en inglés.
- Riesgo de sobreajuste al escenario: los datos de entrenamiento son episodios guionizados de recogida con radio de cubo y ruido de pose fijos (`--cube-radius 0.02`, `--pose-noise 0.003`), por lo que el comportamiento fuera de esos rangos es desconocido.
- Restricciones de infraestructura: exige un entorno virtual específico con Python 3.10/3.11, `RLDX_ATTN_IMPL=sdpa` o flash-attn compilado desde fuente, decord como backend de vídeo y deepspeed desinstalado; no es desplegable con los servidores de inferencia habituales.
- El repositorio (23,2 GB) y el script de descarga (16 GB + 14 GB) implican un coste de almacenamiento considerable para un modelo de 6,92B parámetros.
- Se trata de material de investigación, no de un producto: no se documenta pipeline de HuggingFace, idiomas soportados ni formatos de pesos alternativos.

## Enlaces

- HuggingFace: https://huggingface.co/leokswang/rldx1-urgantry-v0-lora32-ckpt3000
- Modelo base citado en la model card: https://huggingface.co/RLWRLD/RLDX-1-MT-ALLEX
- GR00T N1.7 (origen del fork, sin enlace aportado en la información): no disponible
- Repositorio de código, notas de investigación o demo: no disponible
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (páginas de soporte de Microsoft), por lo que no se han encontrado enlaces adicionales relevantes.
