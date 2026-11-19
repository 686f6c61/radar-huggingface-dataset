# KyujinL/pnpid-calvin-flower

## Resumen

PnPID FLOWER CALVIN ABC→D es una colección de checkpoints de un modelo de visión-lenguaje-acción (VLA) para robótica, desarrollado por el usuario KyujinL. Se trata de un fine-tuning del modelo base `mbreuss/flower_vla_pret` sobre el conjunto de datos CALVIN en su partición ABC→D (entrenamiento con las tareas A, B y C; evaluación en la D). El objetivo de estos checkpoints no es tanto ofrecer un modelo de producción como comparar distintas funciones auxiliares de entrenamiento sobre una misma arquitectura y un mismo conjunto de datos.

El repositorio incluye cuatro variantes que difieren únicamente en el objetivo de entrenamiento: `vanilla` (solo flow matching rectificado), `aux_state_diff` (flow matching más una pérdida auxiliar de diferencia de estado), `aux_bc` (flow matching más una pérdida auxiliar de clonación de comportamiento) y `ours` (flow matching más una pérdida auxiliar de dinámica inversa). Todas comparten semilla (242), número de pasos (40k) y tamaño efectivo de batch (32), lo que permite una comparación controlada entre objetivos.

La relevancia de esta publicación es metodológica: proporciona pesos entrenados de forma reproducible (con configuraciones Hydra adjuntas) para estudiar cómo afectan las pérdidas auxiliares al rendimiento de un VLA en manipulación robótica. No se han publicado resultados de evaluación en la información disponible, y el autor indica explícitamente que no se ejecutó ninguna evaluación con rollouts durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en FLOWER; no se detalla la arquitectura interna en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en checkpoint Lightning, no se ofrecen variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (las instrucciones de CALVIN son en inglés, pero no se declara soporte multilingüe) |
| Licencia | no disponible |
| Formato de pesos | `model.ckpt` (checkpoint de PyTorch Lightning sin `optimizer_states`) más configuración Hydra en `.hydra/` |

## Arquitectura y entrenamiento

El modelo parte de `mbreuss/flower_vla_pret` (concretamente `360000_model_weights.pt`) y se fine-tunea sobre CALVIN ABC→D. La formulación de entrenamiento se basa en flow matching rectificado (L_FM), al que se añaden, según la variante, pérdidas auxiliares ponderadas con coeficiente 0,3: diferencia de estado (`aux_state_diff`), clonación de comportamiento (`aux_bc`) o dinámica inversa (`ours`, que corresponde al objetivo por defecto actual del código). La variante `vanilla` prescinde de pérdida auxiliar.

El setup de entrenamiento es común a las cuatro variantes: 4 GPUs, batch global de 32, 40 000 pasos de optimizador (40 épocas × 1000 pasos), AdamW con learning rate 2e-5, decaimiento EMA de 0,999, precisión mixta bf16 y semilla 242. El reparto entre batch por GPU y acumulación de gradientes varía: `vanilla` y `aux_bc` usan 4 × 2, `aux_state_diff` usa 2 × 4 y `ours` usa 8 × 1, manteniendo el mismo batch efectivo. La evaluación debe realizarse con los pesos EMA (`callbacks.EMA.ema_weights`), que el loader utiliza por defecto. No se ejecutaron rollouts de evaluación durante el entrenamiento.

## Capacidades

- Control robótico de manipulación a partir de instrucciones en lenguaje natural e imágenes, en el dominio de las tareas de CALVIN.
- Generación de acciones mediante flow matching rectificado con 4 pasos de muestreo (`num_sampling_steps=4`) y evaluación multistep (`multistep=10`).
- Ejecución de secuencias largas de evaluación (`ep_len=360`, `num_sequences=1000` en la configuración de referencia).
- Aprendizaje de dinámica inversa como objetivo auxiliar en la variante `ours`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación comparativa de objetivos auxiliares en VLA: los cuatro checkpoints permiten aislar el efecto de la pérdida auxiliar (diferencia de estado, clonación de comportamiento, dinámica inversa) manteniendo constantes arquitectura, datos, semilla y pasos de entrenamiento.
- Reproducción de experimentos de fine-tuning sobre CALVIN ABC→D: las configuraciones Hydra incluidas (`.hydra/config.yaml`, `hydra.yaml`, `overrides.yaml`) permiten relanzar el entrenamiento con los mismos hiperparámetros.
- Evaluación offline de políticas de manipulación: el script `flower/evaluation/flower_evaluate.py` permite medir la tasa de éxito en el conjunto de validación de CALVIN sin necesidad de un robot físico.
- Estudio de la influencia del tamaño de batch por GPU frente a la acumulación de gradientes: las variantes difieren en el reparto (4×2, 2×4, 8×1) con el mismo batch efectivo, lo que facilita analizar efectos de implementación.
- Base para fine-tuning posterior en dominios de manipulación específicos: al ser un checkpoint intermedio sobre CALVIN, puede servir como inicialización para tareas downstream con menos datos.
- Docencia y divulgación sobre VLA: el repositorio ofrece un ejemplo completo de pipeline (entrenamiento, checkpoints, configuración y evaluación) para explicar cómo se entrena y evalúa un modelo de visión-lenguaje-acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ejecutó ninguna evaluación con rollouts durante el entrenamiento y que los checkpoints deben evaluarse offline.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 32,5 GB, pero incluye cuatro checkpoints completos, por lo que no equivale al peso de un único modelo en memoria).
- GPU recomendadas: no disponibles. El entrenamiento se realizó con 4 GPUs, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no disponible. No se ofrecen variantes cuantizadas que permitan estimar su encaje en GPUs consumer.
- Opciones de despliegue: el pipeline documentado es PyTorch con PyTorch Lightning 2.0.8 y torch 2.2.2, ejecutando `flower/evaluation/flower_evaluate.py` desde el repositorio PnPID_flower. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Dependencias adicionales: `calvin_env` (submódulo), dataset CALVIN `task_ABC_D` (incluyendo `validation/lang_annotations/embeddings.npy`) y `microsoft/Florence-2-large` cargado con `trust_remote_code` (revisión `21a599d` en entrenamiento).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PnPID FLOWER CALVIN ABC→D | no disponible | no disponible | no disponible | Hugging Face (KyujinL/pnpid-calvin-flower) | Fine-tuning de FLOWER sobre CALVIN ABC→D; 4 variantes de objetivo |
| FLOWER VLA (`mbreuss/flower_vla_pret`) | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que parte este fine-tuning |
| Otros VLA para CALVIN | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación: no hay tasas de éxito en CALVIN ni comparación cuantitativa entre las cuatro variantes en la información disponible.
- El autor advierte de que no se ejecutaron rollouts durante el entrenamiento; la validez de los checkpoints debe verificarse offline antes de cualquier uso.
- La licencia no está declarada, lo que impide determinar si se permite el uso comercial. Debe consultarse al autor antes de cualquier despliegue en producción.
- El dominio de aplicación está restringido a las tareas de manipulación de CALVIN; no se documenta generalización a otros entornos, robots o conjuntos de instrucciones.
- Las instrucciones de evaluación dependen de rutas y configuraciones de la máquina original (`conf/eval_calvin.yaml`), que deben sobrescribirse en línea de comandos.
- El checkpoint `vanilla` se generó con cambios sin commitear en el código (`6e95f9b` más cambios locales), lo que puede afectar a la reproducibilidad exacta.
- La variante `ours` se entrenó en otro servidor y su configuración precede a la opción `aux_objective`, por lo que su objetivo auxiliar (dinámica inversa) no está declarado explícitamente en el YAML.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al tratarse de un modelo de acción, el riesgo relevante es la ejecución de acciones incorrectas en el robot.
- No se documentan limitaciones idiomáticas ni de longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KyujinL/pnpid-calvin-flower
- Modelo base: https://huggingface.co/mbreuss/flower_vla_pret
- Modelo de visión utilizado en evaluación: https://huggingface.co/microsoft/Florence-2-large
- Repositorio de código PnPID_flower: no disponible en la información proporcionada
- Paper de FLOWER: no disponible en la información proporcionada
- Dataset CALVIN: no disponible en la información proporcionada
