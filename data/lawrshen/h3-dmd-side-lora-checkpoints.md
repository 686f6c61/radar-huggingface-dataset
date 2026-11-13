# lawrshen/h3-dmd-side-lora-checkpoints

## Resumen

`lawrshen/h3-dmd-side-lora-checkpoints` es un repositorio de pesos auxiliares (adaptadores LoRA) para el modelo MiniMax-H3, publicado por el usuario lawrshen en Hugging Face. No se trata de un modelo base autónomo, sino de cinco checkpoints de LoRA "student" sin fusionar, pensados para ejecutar el script de evaluacion `examples/minimax_h3/model_training/eval_dmd_side_lora_rollout.py` dentro de un pipeline de entrenamiento con destilacion DMD (Distribution Matching Distillation).

El repositorio esta etiquetado con `minimax-h3`, `lora` y `dmd`, y su libreria declarada es `pytorch`. Cada checkpoint contiene 8 ficheros FSDP rank-local, lo que implica que la evaluacion debe realizarse con un world size de 8. El tamano del repositorio es de 1.2 GB. No se proporciona informacion sobre el modelo base MiniMax-H3 en esta ficha, ni sobre licencia, idiomas o pipeline.

La relevancia de este repositorio es acotada: sirve como material de referencia para reproducir evaluaciones de destilacion DMD sobre MiniMax-H3, no como modelo listo para produccion. No hay descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre MiniMax-H3; no se especifica la arquitectura del modelo base |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (ficheros FSDP rank-local), con `metadata.json` y `sha256_manifest.json` por subdirectorio |

## Arquitectura y entrenamiento

El repositorio contiene cinco checkpoints de LoRA student sin fusionar, etiquetados como `bg`, `sota`, `prune`, `smallface` y `large-offset`, entrenados mediante DMD (Distribution Matching Distillation) sobre distintas variantes del modelo MiniMax-H3. Los pasos de entrenamiento documentados son 2000 para `bg`, `smallface` y `large-offset`, y 3000 para `sota` y `prune`. Cada checkpoint se asocia a un `--base-checkpoint` distinto, que en la model card aparece como rutas locales del entorno de entrenamiento del autor (por ejemplo, `ema-step-000005000.safetensors` o directorios como `prune_head_cd5000_wf72_align8_protect0-1`), no como identificadores publicos de Hugging Face.

El checkpoint `large-offset` fue convertido desde el formato legacy de 8 rangos FSDP `SHARDED_STATE_DICT`; sus tensores locales se aplanaron sin alterar el orden de los elementos para coincidir con el layout de parametros FSDP del evaluador actual. Los estados del optimizador, los estados RNG y el `fake_score_lora` se excluyeron intencionadamente. Cada subdirectorio incluye `metadata.json` y `sha256_manifest.json` para verificacion de integridad.

## Capacidades

- Proporciona pesos LoRA para evaluacion de destilacion DMD sobre MiniMax-H3 mediante el script `eval_dmd_side_lora_rollout.py`.
- Permite reproducir cinco variantes de student LoRA con distintos pasos de entrenamiento y checkpoints base.
- Incluye manifiestos SHA-256 para verificar la integridad de los ficheros descargados.
- Requiere ejecucion con world size 8 (8 ficheros FSDP rank-local por checkpoint).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingues para estos adaptadores.
- No se documenta modo thinking ni capacidades multimodales.

## Casos de uso

- Reproduccion de evaluaciones DMD: cargar cada checkpoint con `--lora-state-dir` apuntando al subdirectorio correspondiente y ejecutar `eval_dmd_side_lora_rollout.py` con world size 8 para comparar las cinco variantes.
- Investigacion sobre destilacion DMD: analizar el efecto del numero de pasos (2000 frente a 3000) y del checkpoint base sobre el comportamiento del student LoRA.
- Verificacion de integridad de pesos: usar `sha256_manifest.json` para validar que los ficheros FSDP descargados coinciden con los publicados antes de lanzar la evaluacion.
- Estudio de conversiones de formato FSDP: el checkpoint `large-offset` sirve como ejemplo de conversion desde `SHARDED_STATE_DICT` legacy al layout actual del evaluador.
- Base para experimentos de LoRA sobre MiniMax-H3: partir de estos adaptadores para explorar variantes de entrenamiento con DMD en entornos de 8 GPUs.
- Auditoria de pipelines de entrenamiento: inspeccionar `metadata.json` de cada subdirectorio para reconstruir la configuracion de entrenamiento (paso, checkpoint base) asociada a cada variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del modelo base MiniMax-H3, que no se especifica.
- GPU recomendadas: no disponible; el requisito documentado es ejecutar con world size 8, lo que implica al menos 8 procesos/ranks.
- Ajuste en GPU de consumo: no disponible.
- Opciones de despliegue: el unico flujo documentado es el script `eval_dmd_side_lora_rollout.py` con FSDP y world size 8; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (checkpoints LoRA para destilacion DMD sobre MiniMax-H3).

## Limitaciones y advertencias

- No es un modelo autonomo: son adaptadores LoRA que requieren el modelo base MiniMax-H3 y el script de evaluacion especifico.
- Los `--base-checkpoint` documentados son rutas locales del entorno del autor, no identificadores publicos; puede ser necesario localizar los checkpoints base equivalentes.
- Requiere world size 8; no funciona en configuraciones de un solo proceso segun la documentacion.
- Los estados del optimizador, RNG y `fake_score_lora` estan excluidos, por lo que no permiten reanudar entrenamiento, solo evaluacion.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles.
- Riesgo de alucinacion y sesgos: no evaluables sin el modelo base y sin benchmarks publicados.
- Repositorio sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/lawrshen/h3-dmd-side-lora-checkpoints
