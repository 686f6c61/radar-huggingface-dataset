# Panda512/pi05-condition-code

## Resumen

`Panda512/pi05-condition-code` es un repositorio de pesos LoRA (adaptadores de bajo rango) para el modelo base `lerobot/pi05_base`, una política de visión-lenguaje-acción (VLA) orientada a robótica. El autor, Panda512, publica aquí cuatro adaptadores independientes, uno por paquete de datos (`ds1_demo_native`, `ds2_native`, `ds3_stitched`, `ds4_ctx_aug`), entrenados sobre el layout OpenPI de LeRobot con precisión explícita y retención de checkpoints. No es un modelo de lenguaje generalista: es un artefacto de investigación para control robótico condicionado por tokens de contexto.

La innovación principal es la inyección de seis tokens de condición (`arm`, `shared`, `skill`, `pos`, `obj`, `progress`, con anchuras 4/2/16/16/16/11 = 65 dimensiones, codebook v5) mediante un mecanismo híbrido de prefijo y `adaRMS` (un MLP `condition_adarms` cuya última capa se inicializa a cero y se suma al condicionamiento temporal del experto de acción). Además, incorpora cámaras ocultas mediante `img_masks`, máscara de pérdida de acción por brazo y aumentación de imagen determinista por (clip, época).

El modelo es relevante para quienes investigan políticas VLA con condicionamiento explícito y entrenamiento multi-dataset en clústeres HPC, ya que documenta con detalle la infraestructura (EEE con RTX PRO 6000 96 GB, NSCC con A100 40 GB), las versiones exactas de dependencias (Python 3.12.15, torch 2.11.0+cu128, LeRobot @ 36b8face, transformers 5.5.4, peft 0.21.2) y los comandos de entrenamiento y validación. La información pública es escasa en cuanto a arquitectura base y benchmarks; la ficha refleja únicamente lo documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política VLA basada en `lerobot/pi05_base` (OpenPI) con adaptadores LoRA y condicionamiento por tokens + adaRMS |
| Parámetros totales | no disponible (adaptadores LoRA; el modelo base `pi05_base` no se detalla en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (entrenamiento en precisión explícita OpenPI; no se documentan cuantizaciones de inferencia) |
| Idiomas soportados | no disponible (modelo orientado a acción robótica, no a texto multilingüe) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de adaptadores LoRA; el formato concreto no se especifica en la model card) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base` (revisión `22c30e5b`) y tokenizador PaliGemma (revisión `35e4f464`), sobre el layout OpenPI de LeRobot. Se entrenan cuatro LoRA independientes, uno por paquete de datos, con hiperparámetros fijados por el `meta/experiment.json` de cada paquete; `train.py` rechaza configuraciones que difieran de ese fichero. Los detalles por paquete son: `ds1_demo_native` con 8 épocas, 21.488 pasos, guardado cada 3.000, aumentación ligera e inyección por prefijo; `ds2_native` con 12 épocas, 19.944 pasos, guardado cada 6.000, aumentación fuerte e inyección prefijo + adaRMS; `ds3_stitched` con 12 épocas, 20.232 pasos, guardado cada 6.000, aumentación fuerte e inyección prefijo + adaRMS; y `ds4_ctx_aug` con 8 épocas (dos copias por clip), 26.584 pasos, guardado cada 6.000, aumentación fuerte e inyección prefijo + adaRMS.

Las innovaciones técnicas documentadas incluyen: seis tokens de condición con codebook v5 verificado contra `meta/encoding_v5.json`; inyección `adaRMS` mediante un MLP `condition_adarms` con última capa inicializada a cero, sumado al condicionamiento temporal del experto de acción tanto en entrenamiento como en muestreo; cámaras ocultas vía `observation.camera_visible` que pone `img_masks` a False (tokens de padding, sin imagen negra), con dropout aleatorio según `camera_dropout` del paquete (DS2/DS3/DS4: públicas todas 0,8, cabeza privada 0,3 / muñeca propia 0,15, exclusivo; DS1: 0,05 en cada caso); máscara de pérdida de acción que conserva solo las 15 dimensiones del brazo del clip, normalizada por el número de dimensiones supervisadas; aumentación de imagen con parámetros fijos por (clip, época) y etiquetado de época mediante `EPOCH_STRIDE` para que los workers del DataLoader conozcan la época exacta tras reanudar; y split estricto que usa solo episodios de entrenamiento de `meta/split.json`, sin evaluación durante el entrenamiento. El entorno es homogéneo en los tres servidores: Python 3.12.15, torch 2.11.0+cu128, LeRobot @ `36b8face`, transformers 5.5.4, peft 0.21.2, accelerate 1.15.0; la única diferencia es draccus 0.11.6 en EEE frente a 0.10.0 fijado por LeRobot.

## Capacidades

- Control robótico por imitación: genera chunks de acción a partir de observaciones visuales y de estado, condicionados por tokens de contexto.
- Condicionamiento explícito por seis tokens (`arm`, `shared`, `skill`, `pos`, `obj`, `progress`) que codifican brazo, habilidad, posición, objeto y progreso de la tarea.
- Inyección de condición por prefijo y por `adaRMS` (esta última solo en DS2, DS3 y DS4).
- Manejo de cámaras ocultas y dropout de cámara para robustez ante oclusiones y configuraciones variables.
- Enmascaramiento de acción por brazo (15 dimensiones por brazo) para entrenamiento multi-brazo.
- Aumentación de imagen determinista por época, reproducible tras reanudación de entrenamiento.
- Soporte de reanudación de entrenamiento con retención de checkpoints y verificación de que los pesos de condición cambian.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Entrenamiento de políticas de manipulación multi-brazo: los LoRA permiten adaptar `pi05_base` a un brazo concreto usando la máscara de acción de 15 dimensiones, útil en configuraciones bimanuales donde cada brazo tiene su propio adaptador.
- Investigación en condicionamiento VLA: los seis tokens de condición y la inyección `adaRMS` permiten estudiar cómo el contexto explícito (objeto, progreso, habilidad) afecta a la política de acción, comparando prefijo solo frente a prefijo + adaRMS entre DS1 y DS2/DS3/DS4.
- Robustez ante oclusiones: el mecanismo de cámaras ocultas con `img_masks` y el dropout de cámara permiten entrenar políticas que toleran cámaras ausentes o cabezas privadas no disponibles en despliegue.
- Reproducibilidad en HPC: los scripts `check_data.sbatch`, `train_pi05.sbatch`, `check_nscc.pbs` y `train_nscc.pbs` permiten reproducir entrenamientos en clústeres con RTX PRO 6000 96 GB o A100 40 GB, con reanudación tras el límite de 72 h por trabajo.
- Validación de pipelines de datos: `audit_dataset` lee el paquete v5 completo (frames, etiquetas, máscaras, máscaras de aumentación y ficheros de vídeo), útil para verificar integridad antes de entrenar.
- Experimentación con aumentación determinista: el etiquetado de época en el sampler permite estudiar el efecto de la aumentación de imagen fija por (clip, época) sin fugas entre épocas ni inconsistencias tras reanudar.
- Verificación de checkpoints: `verify_checkpoint.py` comprueba que los pesos de condición cambiaron, recarga el checkpoint y muestrea un chunk de acción, lo que sirve como test de humo en CI de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado en EEE: RTX PRO 6000 96 GB, 72 h por trabajo, 2 GPUs por usuario, entorno `/projects/lerobot` (`activate.sh`).
- Entrenamiento documentado en NSCC y NSCC2: A100 40 GB, 72 h por trabajo (cola `glong`), entornos `~/scratch/pi05_run/env` y reconstruible con `env/build_nscc_env.sh` desde `env/requirements-lock.txt`.
- VRAM de inferencia: no disponible (no se documenta el tamaño del modelo base ni cuantizaciones).
- GPU de consumo: no disponible; no se indica si cabe en RTX 4090 u otras consumer.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el flujo documentado es entrenamiento con LeRobot/OpenPI y muestreo de chunks de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Panda512/pi05-condition-code` | no disponible (LoRA sobre `pi05_base`) | no disponible | sin benchmarks publicados | no disponible | Hugging Face, 0 descargas, 0 likes |
| `lerobot/pi05_base` | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face (modelo base referenciado) |
| Otras políticas VLA (p. ej. OpenVLA, RT-2) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información pública muy escasa: 0 descargas, 0 likes, sin pipeline declarado, sin licencia, sin idiomas y sin benchmarks; no debe asumirse calidad de producción.
- Licencia no disponible: no se puede confirmar el uso comercial; el modelo base `lerobot/pi05_base` puede tener sus propias restricciones que el autor no detalla.
- Es un conjunto de adaptadores LoRA, no un modelo autónomo: requiere el modelo base `pi05_base` (rev `22c30e5b`) y el tokenizador PaliGemma (rev `35e4f464`) para funcionar.
- Dependencia estricta de versiones: Python 3.12.15, torch 2.11.0+cu128, LeRobot @ `36b8face`, transformers 5.5.4, peft 0.21.2, accelerate 1.15.0; desviaciones pueden romper la reproducibilidad.
- Diferencia de entorno en EEE (draccus 0.11.6 frente a 0.10.0 de LeRobot) que puede afectar al parseo de configuración.
- Sin evaluación durante el entrenamiento: no hay métricas de validación publicadas, por lo que el rendimiento real de las políticas es desconocido.
- Riesgo de sobreajuste a los cuatro paquetes de datos concretos (`ds1`–`ds4`) y a sus esquemas de codificación v5; no se documenta generalización a otros datasets o robots.
- No se documentan sesgos, riesgos de alucinación ni capacidades de lenguaje; las advertencias típicas de modelos de texto no aplican directamente, pero la política puede fallar silenciosamente en entornos fuera de distribución.
- Los trabajos de entrenamiento están limitados a 72 h por envío, lo que exige reanudación manual y puede introducir inconsistencias si no se respeta el etiquetado de época.

## Enlaces

- Hugging Face: https://huggingface.co/Panda512/pi05-condition-code
- Modelo base referenciado: https://huggingface.co/lerobot/pi05_base
- Tokenizador PaliGemma referenciado: https://huggingface.co/google/paligemma (revisión `35e4f464` citada en la model card)
- LeRobot (revisión `36b8face` citada): https://github.com/huggingface/lerobot
- OpenPI: no disponible como enlace en la información proporcionada
