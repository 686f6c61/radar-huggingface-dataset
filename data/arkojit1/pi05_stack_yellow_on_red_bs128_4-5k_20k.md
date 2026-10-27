# arkojit1/pi05_stack_yellow_on_red_bs128_4.5k_20k

## Resumen

Se trata de un ajuste fino (fine-tuning) del modelo visión-lenguaje-acción π₀.₅ (`lerobot/pi05_base`, revisión `a538eb27`) sobre el conjunto de datos `Ameyapores/haply_stack_yellow_red`, publicado por el usuario arkojit1. El modelo resuelve una única tarea robótica de manipulación: apilar un bloque amarillo sobre un bloque rojo con un brazo Franka. No es un modelo de propósito general, sino una política (policy) entrenada para controlar un robot concreto en un entorno concreto, y se distribuye en formato LeRobot para su carga directa con `PI05Policy.from_pretrained`.

El checkpoint publicado corresponde al paso 4.500 de un entrenamiento planificado de 20.000 pasos (28,8 épocas sobre 40 episodios), es decir, aproximadamente el 22,5 % del total, y fue subido mientras el entrenamiento seguía en marcha. El autor lo eligió "por petición", no por ser el mejor punto de validación: la pérdida de evaluación más baja registrada hasta ese momento fue 0,1119 en el paso 1.500, mientras que en el paso 4.500 es 0,1164. Esta distinción es importante: el número de evaluación es la pérdida de flow matching sobre 4 episodios retenidos, no una tasa de éxito de la tarea.

La relevancia del modelo es, por tanto, acotada y de tipo práctico: sirve como ejemplo reproducible de cómo se afina π₀.₅ con LeRobot 0.4.4 en hardware AMD (8 × MI300X) congelando el encoder visual SigLIP y el backbone Gemma-2B y entrenando únicamente el experto de acciones. Su utilidad principal es la inspección del pipeline y la comparación de hiperparámetros, no el despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) π₀.₅: encoder visual SigLIP + backbone de lenguaje Gemma-2B (ambos congelados) + experto de acciones entrenable con flow matching |
| Parámetros totales | 3.616.757.520 (≈3,62 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. Los pesos se distribuyen en `safetensors`; el tamaño del repo (7,5 GB) es coherente con bf16, pero el autor no documenta cuantizaciones |
| Idiomas soportados | No disponible (el modelo no se presenta como modelo de lenguaje; no se documenta capacidad multilingüe) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (repositorio LeRobot) |
| Modelo base | `lerobot/pi05_base`, revisión `a538eb27` |
| Dataset de ajuste fino | `Ameyapores/haply_stack_yellow_red`, revisión `0e913a4` |
| Entradas de imagen | `observation.images.wrist`, `observation.images.scene0`, `observation.images.scene1` (mapeadas a `base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) |
| Dimensión de estado / acción | Estado de 4 dimensiones / delta de efector final de 4 dimensiones |
| `chunk_size` / `n_action_steps` | 50 / 50 |
| Pasos de entrenamiento | 4.500 de 20.000 planificados (28,8 épocas de 156,0 pasos/época) |
| Tamaño del repo | 7,5 GB |

## Arquitectura y entrenamiento

π₀.₅ es un modelo visión-lenguaje-acción que combina un codificador visual SigLIP, un backbone de lenguaje Gemma-2B y un "action expert" que genera secuencias de acciones mediante flow matching. En este ajuste fino se aplica `train_expert_only=true`: SigLIP y Gemma-2B permanecen congelados y solo se optimizan los parámetros del experto de acciones, lo que reduce el coste de entrenamiento y conserva el conocimiento previo del modelo base. La política consume tres imágenes (muñeca y dos cámaras de escena), un estado de 4 dimensiones y produce un chunk de 50 acciones de efector final, también de 4 dimensiones, normalizadas por cuantiles q01–q99 tanto en estado como en acción, sin aumento de datos.

El entrenamiento se ejecutó con LeRobot 0.4.4 sobre 8 GPU AMD MI300X (16 muestras por GPU, batch global 128) con AdamW, LR pico 2,5e-5, betas (0,9; 0,95), weight decay 0,01, recorte de gradiente 1,0 y un schedule coseno con warmup de 666 pasos anclado a 20.000 pasos y suelo de 2,5e-6, en bf16. El conjunto de datos contiene 40 episodios de Franka teleoperados con un dispositivo Haply, una sola instrucción ("Stack the yellow block on the red block."), y se reservaron los 4 últimos episodios (36–39) para evaluación. En el paso 4.500 la pérdida de entrenamiento promediada sobre los pasos 4.401–4.600 es 0,083 y la pérdida de evaluación es 0,1164. El autor advierte explícitamente de que diferencias de unas pocas milésimas en la pérdida de evaluación están dentro del ruido.

## Capacidades

- Control robótico de manipulación: genera trayectorias de efector final de 4 dimensiones para apilar un bloque amarillo sobre uno rojo con un brazo Franka.
- Ejecución de una única instrucción en lenguaje natural predefinida; no se documenta generalización a otras órdenes.
- Política de imitación condicionada por tres vistas de cámara (muñeca, escena 0, escena 1), con chunk de 50 acciones por inferencia.
- Fusión visión-lenguaje-acción heredada de π₀.₅ (SigLIP + Gemma-2B), aunque congelada durante el ajuste fino.
- Soporte de *tool calling* / *function calling*: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo *thinking*, visión general, audio o generación de texto libre: no disponibles; el modelo está especializado en acción motora.

## Casos de uso

- **Reproducción de un experimento de ajuste fino de π₀.₅**: sirve para validar un pipeline completo con LeRobot 0.4.4 (normalización por cuantiles, `chunk_size=50`, congelación del backbone) sobre un dataset pequeño de 40 episodios antes de escalar a conjuntos mayores.
- **Banco de pruebas de teleoperación con Haply**: el checkpoint permite evaluar si los datos capturados con un dispositivo Haply son suficientes para aprender una tarea de apilado, comparando la pérdida de flow matching frente a otros checkpoints de la misma ejecución.
- **Estudio del efecto del número de pasos en políticas VLA**: al disponer del paso 1.500 (eval 0,1119) y del 4.500 (eval 0,1164) de la misma ejecución, es útil para analizar la curva de aprendizaje y el sobreajuste en datasets reducidos.
- **Docencia y demostraciones de robótica de imitación**: permite ilustrar en un curso o taller cómo se carga una política con `PI05Policy.from_pretrained` y cómo se mapean las claves de cámara del dataset a los slots del modelo base.
- **Depuración de configuración de cámaras**: el autor documenta explícitamente el orden `wrist`/`scene0`/`scene1` y la ausencia de `rename_map`; el checkpoint sirve como caso de referencia para verificar mapeos de imágenes en LeRobot.
- **Punto de partida para un reajuste propio**: al estar solo el experto de acciones entrenado, es un candidato razonable para continuar el entrenamiento o afinar sobre un dataset propio de apilado, siempre que se respete la licencia (no disponible) y la configuración de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni tasas de éxito de la tarea en la información disponible. El autor solo reporta métricas del objetivo de entrenamiento:

| Métrica | Valor | Contexto |
|---|---|---|
| Pérdida de entrenamiento | 0,083 | Media de los pasos 4.401–4.600 (registro cada 200 pasos) |
| Pérdida de evaluación (paso 4.500) | 0,1164 | Flow matching sobre 4 episodios retenidos (36–39) |
| Pérdida de evaluación mínima registrada | 0,1119 | Paso 1.500 |
| Épocas completadas | 28,8 | 4.500 de 20.000 pasos; 156,0 pasos por época |
| Tasa de éxito de la tarea | No disponible | El autor indica que la pérdida de evaluación no es una tasa de éxito |

## Requisitos de hardware

- **VRAM estimada para inferencia**: los 3,62 B de parámetros en bf16 ocupan aproximadamente 7,2 GB; con activaciones y los tres flujos de imagen, un presupuesto realista ronda los 10–14 GB. No hay cifras oficiales publicadas.
- **GPU recomendadas**: cualquier GPU con 16 GB o más para bf16. El autor entrenó en 8 × AMD MI300X (16 muestras por GPU), pero el entrenamiento no es representativo de los requisitos de inferencia.
- **¿Cabe en GPU de consumo?**: sí, previsiblemente en una RTX 4090 (24 GB) o RTX 4080 (16 GB) en bf16; en GPUs de 8–12 GB requeriría cuantización, que no está documentada para este modelo.
- **Opciones de despliegue**: LeRobot 0.4.4 junto con el fork de `transformers` de Hugging Face para π₀ (rama `fix/lerobot_openpi`). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política VLA de este tipo.
- **Latencia y throughput**: no disponibles. Como referencia de diseño, cada inferencia produce un chunk de 50 acciones (`n_action_steps=50`), por lo que la frecuencia de control depende de la política de ejecución del bucle robot y no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`arkojit1/pi05_stack_yellow_on_red_...`) | ≈3,62 B | 3 imágenes + estado 4-D | Apilar bloque amarillo sobre rojo (Franka) | No disponible | Hugging Face, 0 descargas, 0 likes |
| `lerobot/pi05_base` | ≈3,62 B (misma familia) | 3 imágenes + estado | Política generalista preentrenada | No disponible en la información proporcionada | Hugging Face (modelo base) |
| Políticas tipo ACT / Diffusion Policy en LeRobot | No disponible | Depende de la configuración | Manipulación por imitación | No disponible | Implementadas en LeRobot |
| OpenVLA y similares | ≈7 B (dato externo, no verificado en la información proporcionada) | 1 imagen + instrucción | Manipulación generalista | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a arquitectura, tamaño y tipo de tarea.

## Limitaciones y advertencias

- **Sobreajuste y dataset mínimo**: solo 40 episodios y una única instrucción; la capacidad de generalización a posiciones, iluminación o cámaras distintas es muy limitada.
- **Checkpoint incompleto**: el modelo publicado es el paso 4.500 de 20.000, subido con el entrenamiento aún en curso. No es el punto de mejor evaluación.
- **Métrica engañosa**: la pérdida de evaluación (0,1164) es la pérdida de flow matching sobre 4 episodios y no una tasa de éxito; el autor lo advierte expresamente. Con solo 4 episodios retenidos, la varianza es alta.
- **Dependencia estricta de configuración**: exige las claves `observation.images.wrist`, `scene0` y `scene1` en ese orden, sin `rename_map` y con `empty_cameras=0`. Un mapeo distinto degrada o invalida la política.
- **Dependencia de software frágil**: requiere LeRobot 0.4.4 y el fork de `transformers` en la rama `fix/lerobot_openpi`; cambios de versión pueden romper la carga.
- **Licencia no especificada**: al no declararse licencia, no hay permiso claro para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- **Sesgos**: no documentados, pero el dataset procede de un único operador, un único robot Franka y un único entorno físico, por lo que hereda esos sesgos de escena y de estilo de teleoperación.
- **Alucinación**: en el sentido de acciones plausibles pero incorrectas, el riesgo es alto fuera de la distribución de entrenamiento; no hay validación de éxito publicada.
- **Sin aumento de datos** durante el entrenamiento, lo que reduce la robustez frente a variaciones visuales.
- **Idioma**: no se documenta soporte multilingüe; la instrucción de la tarea está en inglés y es única.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_bs128_4.5k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste fino: https://huggingface.co/datasets/Ameyapores/haply_stack_yellow_red
- LeRobot (librería de entrenamiento y despliegue): https://github.com/huggingface/lerobot
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos no guardan relación con el modelo ni con robótica.
