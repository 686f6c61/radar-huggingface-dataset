# jungwook2358/allex-eef-N-robotonly-h40rel

## Resumen

allex-eef-N-robotonly-h40rel es un checkpoint intermedio (mid-train) de un modelo de visión-lenguaje-acción (VLA) para control robótico, publicado por el usuario jungwook2358 y construido sobre el modelo base RLWRLD/RLDX-1-PT-IMG. No es un modelo de lenguaje conversacional: su salida es un vector de acción de 50 dimensiones que se ejecuta como política de manipulación bimanual sobre el robot ALLEX. El repositorio contiene un único checkpoint (`checkpoint-10000/`), de un entrenamiento planificado a 60 000 pasos, por lo que se trata de un artefacto de investigación en curso y no de un modelo final.

La variante h40rel se diferencia de su predecesora h16 en cinco cambios concretos: el horizonte de acción pasa de 16 a 40 pasos, los dos índices de muñeca pasan a representarse como RELATIVE / EEF / XYZ_ROT6D (frente a ABSOLUTE / NON_EEF), el slot de embodiment pasa a 35 (NEW_EMBODIMENT), se introduce un `random_crop_fraction` de 0,8984375 y se enmascara el ruido de flow matching en las dimensiones de padding a partir del índice 50. El entrenamiento usa exclusivamente datos de robot ALLEX v1–v6, sin datos humanos, con el backbone VLM congelado.

Su relevancia es acotada pero específica: documenta con detalle poco habitual el contrato exacto de inferencia de una política VLA (convenciones de acción, estadísticas de normalización, transforms SE(3) y gestión del padding), lo que lo convierte en una referencia útil para quien trabaje con acción relativa de efector final y horizontes largos. Con 0 descargas y 0 "likes", no hay validación independiente de su rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de RLDX-1; backbone VLM congelado más cabecera de accion entrenada con flow matching (tipo exacto de transformer subyacente: no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible (en entrenamiento se usa `video_length = 1`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible; el modelo no esta orientado a generacion de texto |
| Licencia | other (sin texto de licencia detallado en la model card) |
| Formato de pesos | safetensors |
| Pipeline declarado | robotics |
| Tamano del repositorio | 13,8 GB |
| Horizonte de accion | 40 pasos |
| Dimension de accion | 50 (con padding a 64; el autor advierte que no es 48) |
| Espacio de accion | Mixto: indices 0-1 RELATIVE / EEF / XYZ_ROT6D (9 dims cada uno), indices 2-4 ABSOLUTE / NON_EEF (manos 15+15 dims, cuello 2 dims) |
| Slot de embodiment | 35 (NEW_EMBODIMENT), practicamente inicializacion aleatoria |
| Entradas | 2 camaras (ego izquierda/derecha), 256x256, mas estado del robot |
| Pasos de entrenamiento | 10 000 de 60 000 planificados |
| Checkpoint publicado | `checkpoint-10000/` unicamente |

## Arquitectura y entrenamiento

El modelo sigue el esquema VLA de RLDX: un backbone de visión-lenguaje preentrenado (RLWRLD/RLDX-1-PT-IMG) que procesa las observaciones visuales y el estado, y una cabecera de acción generativa basada en flow matching que produce chunks de acciones. En este run el backbone está completamente congelado (`tune_llm=False`, `tune_visual=False`, `tune_top_llm_layers=0`), por lo que todo el aprendizaje se concentra en la parte de acción. Se entrenó con `--override-pretraining-statistics`, batch global de 256 (4 GPU × 64 por dispositivo, acumulación 1) y learning rate de 1e-4 sobre un plan de 60 000 pasos. No se emplean CogAlign ni tokenizador latente (variante arm N).

El preprocesado visual consiste en dos cámaras (ego izquierda y derecha) a 256×256, recorte aleatorio a 230×230 (`random_crop_fraction = 0,8984375`), restauración a 256 y color jitter con parámetros 0,6/0,6/0,6/0,16, con `image_max_area` 65536 y `image_resize_m` 32. El `state_dropout` es 0,3 y el `video_length` es 1. Los datos de entrenamiento son exclusivamente robot ALLEX v1–v6, sin datos humanos.

La innovación técnica más destacable es la gestión de la representación de acción. El vector de acción mezcla dos convenciones: las muñecas se expresan en forma relativa al frame del efector final mediante transformaciones SE(3) (`T_rel[i] = inv(T_ref) @ T_abs[i]`), con una única referencia por chunk tomada de `state[key][-1]`, y rot6d extraído de las dos primeras filas de la matriz de rotación (decodificado por Gram-Schmidt); el resto de articulaciones permanece en absoluto. Además, se bloquea el ruido de flow matching en las 14 dimensiones de padding (`action_noise_mask_dim=50`), tanto en entrenamiento como en cada paso de Euler de la inferencia, para evitar jitter intra-chunk en articulaciones que nunca reciben supervisión. Las estadísticas de normalización son distintas para muñecas (percentiles q0,1 % / q99,9 % de `relative_action`) y para manos y cuello (q1 % / q99 % de `action`), y las de muñeca son específicas del horizonte: tienen forma (40, 9).

## Capacidades

- Generación de chunks de acción de horizonte 40 para control de manipulación bimanual, condicionados por dos vistas de cámara y estado propioceptivo.
- Control relativo de efector final para ambas muñecas en representación XYZ + rot6d, con una referencia SE(3) por chunk.
- Control absoluto de articulaciones de mano izquierda y derecha (15 dimensiones cada una) y de cuello (2 dimensiones); el waist queda excluido del vector de acción.
- Inferencia con flow matching (integración ODE por pasos de Euler) con enmascarado de ruido en dimensiones de padding.
- Condicionamiento sobre un slot de embodiment (slot 35, NEW_EMBODIMENT) que permite especializar el modelo a una morfología concreta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplica; el modelo no genera texto.
- Capacidades multilingües: no disponible; no procede para una política de acción.
- Capacidades especiales: no se documentan modos de pensamiento, visión generativa ni audio.

## Casos de uso

- Manipulación bimanual con efector final relativo: el modelo genera 40 pasos de acción por inferencia con las muñecas expresadas respecto al frame actual, lo que permite reutilizar la política aunque el robot se desplace, ya que las acciones no dependen de una pose absoluta de base.
- Recogida y colocación de objetos con dos brazos y manos articuladas: las 30 dimensiones de manos permiten comandos de prensión finos junto con el guiado relativo de muñeca en la misma llamada al modelo.
- Tareas que requieren planificación motora a medio plazo: un horizonte de 40 pasos reduce la frecuencia de inferencia necesaria frente a políticas de horizonte 16, lo que es útil cuando el coste de cómputo por paso es alto.
- Aprendizaje por imitación sobre una morfología nueva: el slot NEW_EMBODIMENT (35) permite adaptar la política a un robot distinto del preentrenado sin arrastrar el sesgo de los slots con más preentrenamiento, a costa de partir de una inicialización prácticamente aleatoria.
- Investigación en representaciones de acción: el repositorio documenta explícitamente transformaciones SE(3), decodificación rot6d y percentiles de normalización, por lo que sirve como caso de estudio reproducible para comparar acción absoluta frente a relativa.
- Ajuste fino posterior (fine-tuning) sobre un robot concreto: al ser un mid-train de 10 000 pasos con estadísticas de normalización versionadas por checkpoint, es un punto de partida razonable para continuar el entrenamiento, siempre reutilizando las estadísticas del propio checkpoint.
- Teleoperación asistida con control del cuello: las 2 dimensiones de cuello permiten ajustar la orientación de la cabeza durante la ejecución, útil en manipulación con percepción activa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 13,8 GB. Como estimación aritmética, si los pesos están en bf16 corresponderían a unos 7 000 millones de parámetros, y si están en fp32, a unos 3 500 millones. No hay confirmación oficial del número de parámetros.
- VRAM para inferencia: no disponible de forma oficial. Como orientación, un modelo de ese orden en bf16 requiere aproximadamente 14 GB solo para pesos, más las activaciones del backbone visual sobre dos imágenes de 256×256 y el estado.
- GPU recomendadas: A100 40 GB u 80 GB, H100 y L40S son opciones seguras. En consumer, una RTX 4090 o 3090 de 24 GB podría ser suficiente si el modelo es de ~7 000 millones en bf16 y el pico de activaciones se mantiene contenido; no hay medición publicada que lo confirme.
- Opciones de despliegue: inferencia en PyTorch, y potencialmente exportación a ONNX Runtime o TensorRT. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que el modelo no es un LLM de texto.
- Restricción de implementación: la inferencia debe realizarse con código que aplique la transformación inversa de muñeca (`T_abs[i] = T_ref @ T_rel[i]`) y que ponga a cero las dimensiones 50-63 del tensor de acción tras cada paso de Euler. Sin ese código, el comportamiento degenera (las muñecas quedan cerca del origen).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos no proceden de la información proporcionada en esta búsqueda; se incluyen como referencia cualitativa y sus cifras concretas deben verificarse en sus fichas oficiales.

| Modelo | Desarrollador | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| allex-eef-N-robotonly-h40rel | jungwook2358 | VLA mid-train sobre RLDX-1, horizonte 40, acción relativa de muñeca, datos solo de robot ALLEX | other | HuggingFace, 0 descargas |
| RLDX-1 (RLWRLD/RLDX-1-PT-IMG) | RLWRLD | Modelo base de pretraining del que deriva este checkpoint | no disponible | HuggingFace |
| OpenVLA | comunidad académica | VLA de propósito general entrenado sobre datasets de robot diversos | no disponible en esta ficha | HuggingFace, con amplia adopción |
| RDT-1B | comunidad académica | VLA con transformer de difusión para manipulación bimanual | no disponible en esta ficha | HuggingFace |
| pi0 | Physical Intelligence | VLA con flow matching orientado a control de robots de propósito general | no disponible en esta ficha | disponibilidad pública |

Diferencias clave frente a las alternativas: este checkpoint no está pensado para generalización entre morfologías, sino para un embodiment concreto (slot 35) y un conjunto de datos cerrado (ALLEX v1–v6), lo que limita su reutilización directa pero facilita la reproducibilidad dentro de ese montaje.

## Limitaciones y advertencias

- Es un checkpoint intermedio: 10 000 de 60 000 pasos planificados. No debe tratarse como un modelo convergido ni evaluarse como tal.
- No hay benchmarks ni evaluaciones publicadas, y el repositorio tiene 0 descargas y 0 likes: no existe validación independiente.
- Entrenado solo con datos de robot ALLEX v1–v6, sin datos humanos. La generalización a escenas, objetos o morfologías fuera de esa distribución no está demostrada.
- El slot de embodiment 35 es, según el propio autor, una inicialización prácticamente aleatoria (std en el valor inicial 0,02 y norma L2 mínima de los 36 slots). No aporta prior de preentrenamiento.
- Las estadísticas de normalización son específicas de este checkpoint y de este horizonte: las de muñeca tienen forma (40, 9) con límites por paso. Usar estadísticas de otro run o de otro horizonte produce resultados inválidos.
- Los campos `q01`/`q99` de las estadísticas relativas contienen en realidad los percentiles q0,1 % y q99,9 %; el nombre es engañoso y hay que comprobar el campo `_percentiles`.
- Riesgo de jitter intra-chunk si la inferencia no implementa el enmascarado de ruido en las dimensiones de padding (`actions[..., 50:] = 0` tras cada paso de Euler).
- La acción tiene 50 dimensiones reales, no 48; cualquier pipeline que asuma 48 fallará.
- Los índices de muñeca exigen la transformación inversa en inferencia; omitirla deja las muñecas cerca del origen.
- Licencia "other" sin texto detallado en la model card: no hay confirmación explícita de permiso para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados, cuantizaciones y número de parámetros no están documentados.
- Las fechas del repositorio (creado y actualizado en 2026) y la ausencia de métricas dificultan situar el modelo en una línea temporal verificable.
- No se han subido los estados de entrenamiento (`global_step*/`, `optimizer.pt`, `scheduler.pt`, `rng_state_*.pth`, `training_args.bin`, `zero_to_fp32.py`), por lo que reanudar el entrenamiento exactamente desde este punto puede no ser posible solo con este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/allex-eef-N-robotonly-h40rel
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT-IMG
- Repositorio de entrenamiento (stage 2): https://github.com/jungwook235/RLDX-1-egopi (rama `feat/allex-eef-h16-midtrain`, commit `fc7a000`)
- Config de modalidad indicada por el autor: `run_scripts/train/allex_eef/allex_eef_h40_rel_newemb_config.py`
- Script de envío de trabajos: https://github.com/jungwook235/action-tokenizer (commit `698a172`), ficheros `gpu26-server/submit/allex_eef_run5_base_robotonly_h40rel.sh` y `gpu26-server/submit/allex_gen_rel_stats_one.sh`
- Paper, blog o demo oficial: no disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo (únicamente páginas de venta de neumáticos, sin relación).
