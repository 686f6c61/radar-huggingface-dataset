# junbrro/vwam-oa-rel28-rh-base-ema-50k-g4-bg-1031-r2-inference-ge10k-20261102

## Resumen

V-WAM (OpenArm) es un checkpoint de inferencia publicado por el usuario `junbrro` bajo el identificador `vwam-oa-rel28-rh-base-ema-50k-g4-bg-1031-r2-inference-ge10k-20261102`. Se trata de un modelo de robótica (pipeline `robotics`) entrenado sobre el entorno OpenArm, exportado en formato PyTorch DCP nativo y pensado para ser servido con el runtime V-WAM propietario del autor. El repositorio ocupa 32,0 GB e incluye cinco exportaciones independientes correspondientes a los pasos 25.000, 30.000, 35.000, 40.000 y 45.000 de un entrenamiento de 50.000 pasos.

El modelo no es un LLM ni un VLM de propósito general: es una política de control robótico (policy) derivada de un VLM congelado que actúa como backbone perceptivo, combinada con un módulo de acción. El sufijo `vwam` y las etiquetas `v-wam` y `openarm` apuntan a una arquitectura de tipo vision-language-action (VLA) adaptada al robot OpenArm. Los pesos publicados son exclusivamente los EMA (`net_ema.*` remapeados a `net.*`), sin estado de optimizador, scheduler ni trainer.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación reproducible para quien disponga del runtime V-WAM y de los activos upstream (VLM, tokenizer y VAE congelados) referenciados por el `config.yaml` original. No hay métricas de éxito de política, ni benchmarks, ni demostraciones de rollout publicadas por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | V-WAM (vision-language-action) sobre VLM congelado + modulo de accion; detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en dtype de serving original, sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de robotica, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch DCP nativo (no safetensors, no Transformers `AutoModel`) |

## Arquitectura y entrenamiento

La model card describe un entrenamiento V-WAM sobre OpenArm con exportación de checkpoints EMA. El pipeline de exportación (`export_eval_minimal.py`) remapea los tensores `net_ema.*` a `net.*` y los castea al dtype de serving correspondiente. Se preserva el formato DCP nativo de PyTorch, lo que implica que el artefacto no es cargable con `AutoModel.from_pretrained` ni con `safetensors`, sino únicamente con el runtime V-WAM del autor.

El entrenamiento se ejecutó hasta 50.000 pasos, con exportaciones capturadas en los pasos 25.000, 30.000, 35.000, 40.000 y 45.000. Cada carpeta `step-NNNNNN` es una exportación de inferencia independiente y solo debe usarse cuando exista el marcador `HF_INFERENCE_COMPLETE.json`. El autor indica que cada exportación verifica nombres, formas, dtypes y valores muestreados de tensores, además de tamaños y hashes de los ficheros del Hub antes de publicar el marcador. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o aprendizaje por imitación.

Los activos upstream congelados (VLM, tokenizer y VAE) referenciados por el `config.yaml` original no se incluyen en el repositorio y siguen siendo dependencias en tiempo de ejecución. Las rutas de entrenamiento grabadas en la configuración pueden requerir override para una máquina distinta.

## Capacidades

- Control robótico de política (policy) para el robot OpenArm, servido mediante el runtime V-WAM.
- Percepción visual y lingüística a través del VLM congelado referenciado en la configuración.
- Generación de acciones motoras condicionadas a observación e instrucción (propio de la familia VLA).
- Exportación de checkpoints intermedios para evaluación comparativa entre pasos de entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso ni razonamiento textual.
- No se documentan capacidades multilingües ni modos de pensamiento (thinking mode), visión general o audio.

## Casos de uso

- Evaluación de políticas intermedias en OpenArm: comparar los checkpoints de los pasos 25.000 a 45.000 con el mismo `config.yaml` y `normalization.json` para estudiar la curva de aprendizaje del entrenamiento.
- Reproducción de experimentos de investigación en VLA: servir el checkpoint con el runtime V-WAM y los activos upstream congelados para replicar condiciones del autor.
- Punto de partida para fine-tuning sobre OpenArm: los pesos EMA exportados pueden servir como inicialización de un nuevo entrenamiento, siempre que el runtime admita la carga del formato DCP.
- Integración en un pipeline de evaluación offline: usar los tensores exportados para inspeccionar activaciones y comparar distribuciones entre pasos.
- Auditoría de exportación: verificar la integridad de los tensores mediante los marcadores `HF_INFERENCE_COMPLETE.json` y los hashes publicados.
- Docencia y divulgación sobre robótica aprendida: ilustrar el ciclo entrenamiento-exportación-despliegue en un robot OpenArm con artefactos reales.
- No se recomienda su uso en producción sin una validación de rollout independiente, dado que el autor no reclama éxito de política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que «no robot rollout or policy success claim is made by this backup», por lo que no existen tasas de éxito, métricas de seguimiento de trayectoria ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 32,0 GB, pero ese tamaño incluye cinco exportaciones independientes; el peso de un único checkpoint no se detalla.
- GPU recomendadas: no disponible. Por el tamaño del artefacto y la dependencia de un VLM congelado, se requiere probablemente una GPU de datacenter (A100, H100) o una consumer de gama alta con suficiente VRAM, pero el autor no lo especifica.
- ¿Cabe en consumer GPU?: no disponible con certeza; depende del tamaño real de un checkpoint individual y del VLM upstream, no publicados.
- Opciones de despliegue: exclusivamente el runtime V-WAM del autor con `config.yaml`, `normalization.json` y la ruta `checkpoints/iter_XXXXXXXXX`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje en formato estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vwam-oa-rel28-rh-base-ema-50k-g4-bg-1031-r2 | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face, runtime propietario |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otras políticas VLA (por ejemplo, familias OpenVLA o RT-2), ya que no se han publicado parámetros, contexto ni métricas de este checkpoint.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial permitido; consultar al autor antes de cualquier despliegue productivo.
- Formato no estándar: los pesos son DCP nativo de PyTorch, no safetensors ni `AutoModel`; requieren el runtime V-WAM y los activos upstream congelados (VLM, tokenizer, VAE) no incluidos en el repositorio.
- Sin validación de política: el autor declara explícitamente que no se reclama éxito de rollout ni de política; no hay evidencia empírica de funcionamiento en el robot.
- Solo pesos EMA: no se incluyen pesos crudos de entrenamiento, optimizador, scheduler ni estado del trainer, lo que impide reanudar el entrenamiento original de forma exacta.
- Rutas de entrenamiento grabadas: la configuración puede contener rutas absolutas que fallen en otra máquina y requieran override manual.
- Marcador de completitud obligatorio: usar una carpeta `step-NNNNNN` sin `HF_INFERENCE_COMPLETE.json` puede dar lugar a cargas corruptas o incompletas.
- Cero descargas y cero likes: sin validación por parte de la comunidad; artefacto de un único autor.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: al ser un modelo de robótica, estas categorías no aplican directamente, pero tampoco se documentan sesgos de percepción del VLM subyacente.
- Fecha del identificador (2026-11-02) y del nombre del checkpoint: verificar coherencia temporal con el runtime V-WAM utilizado.

## Enlaces

- Hugging Face: https://huggingface.co/junbrro/vwam-oa-rel28-rh-base-ema-50k-g4-bg-1031-r2-inference-ge10k-20261102
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
