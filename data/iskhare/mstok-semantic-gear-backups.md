# iskhare/mstok-semantic-gear-backups

## Resumen

Este repositorio no es un modelo entrenado listo para uso, sino el archivo de respaldo de dos experimentos de investigacion sobre representaciones semanticas de tipo MsTok GEAR. Contiene checkpoints de PyTorch, exports de componentes, evaluaciones y ficheros de restauracion generados por el autor (iskhare) para dos ejecuciones de entrenamiento sobre el dataset small_owt con longitud de contexto de 256 tokens, usando un profesor RoBERTa-base congelado y ocho GPU B200. La fecha de creacion del repositorio es el 14 de septiembre de 2026 y el tamano total es de 76,6 GB.

Su relevancia es fundamentalmente de reproducibilidad: los dos runs documentados son `semantic-gear-full-v1`, detenido intencionadamente para reiniciarse tras evaluar los hitos 5.000, 10.000, 17.192 y 25.000 (ultimo checkpoint reanudable en el paso 28.000), y `semantic-gear-matched-lr-v1`, completado con 34.384 pasos y evaluaciones en 5.000, 10.000, 17.192, 25.000 y 34.384. Cada hito evaluado incluye un checkpoint de entrenamiento completo mas los exports `ncp.pt`, `vqvae.pt` y `vqvae-teacher.pt`.

No se declara numero de parametros, licencia, idiomas soportados ni pipeline de HuggingFace. El repositorio acumula 0 descargas y 0 likes, y los resultados publicados se limitan a perplejidad de generacion, con aviso explicito del propio autor de que las muestras inspeccionadas siguen conteniendo gramatica rota y repeticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se describe como "MsTok GEAR-style semantic-supervision"; incluye codec, generador y proyector semantico) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256 tokens (small_owt, contexto 256) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | no disponible (el dataset indicado, small_owt, es de texto en ingles, pero no se declaran idiomas) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | PyTorch (`.pt`): checkpoints completos de entrenamiento mas exports `ncp.pt`, `vqvae.pt` y `vqvae-teacher.pt`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion disponible describe dos experimentos de supervision semantica de estilo GEAR sobre MsTok, con un profesor RoBERTa-base congelado y ocho GPU B200. El sistema se descompone en al menos tres piezas exportables: un codec (`vqvae.pt` y su version de profesor `vqvae-teacher.pt`), un generador (`ncp.pt`) y un proyector semantico. Los checkpoints completos incluyen proyector semantico, optimizador, scheduler, estado de EMA y estado RNG por rango. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO; tampoco se detalla el tipo de atencion ni innovaciones de decodificacion.

La receta `matched-lr` aplica un pico de learning rate de 5e-4 tanto al codec como al generador y al proyector semantico, con minimo de 1e-5, 300 pasos de warmup y decaimiento a lo largo de 34.384 actualizaciones. El autor advierte que `best_checkpoint.pt` corresponde al menor loss de validacion, no a la mejor perplejidad de generacion. La evaluacion de generacion se realizo con 5 semillas de muestreo, 128 generaciones por semilla, "supplied level zero" y muestreo truncado con top-k 50 y top-p 0.95; las incertidumbres son errores estandar entre semillas de muestreo, no entre semillas de entrenamiento. La model card menciona GPT-2 Large en ese contexto de evaluacion, sin detallar su papel exacto.

## Capacidades

- Generacion de texto a partir de un generador entrenado con supervision semantica (export `ncp.pt`) y un codec VQ-VAE (`vqvae.pt`).
- Representacion semantica: el proyector semantico y el profesor RoBERTa-base congelado forman parte del pipeline de supervision.
- Reproduccion de experimentos: los archivos de restauracion, hashes de codigo y datos, configuraciones, logs de entrenamiento y evaluacion, historiales de W&B y registros de entorno estan incluidos.
- Exportacion de componentes: codec, generador y codec-profesor se pueden cargar por separado.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Reproduccion de investigacion: restaurar el entorno registrado y los checkpoints de los hitos evaluados para replicar las curvas de perplejidad de generacion publicadas.
- Auditoria de experimentos: usar `SHA256SUMS`, `REMOTE_VERIFICATION.json` y los manifiestos de origen para verificar la integridad de cada fichero frente a los SHA-256 originales.
- Estudio de supervision semantica: comparar el run con LR original (`semantic-gear-full-v1`) frente al run con LR emparejado (`semantic-gear-matched-lr-v1`) para aislar el efecto de la receta de learning rate.
- Analisis de codecs neuronales: cargar `vqvae.pt` y `vqvae-teacher.pt` para estudiar el comportamiento del codec y su profesor congelado en un contexto de 256 tokens.
- Reanudacion de entrenamiento: partir del ultimo checkpoint reanudable del run interrumpido (paso 28.000) conservando optimizador, scheduler, EMA y estado RNG por rango.
- Evaluacion de calidad de generacion: reutilizar las 5 semillas, 128 generaciones por semilla y el muestreo truncado top-k 50 / top-p 0.95 para reproducir las mediciones de perplejidad.
- Analisis de fallos: inspeccionar las muestras incluidas para estudiar los problemas de gramatica rota y repeticion que el autor documenta explicitamente.
- Base para futuros experimentos: reutilizar los exports de componentes como punto de partida de variantes con otro profesor o con otra receta de LR.

## Benchmarks y rendimiento

Unicos datos publicados: perplejidad de generacion del run `semantic-gear-matched-lr-v1` (5 semillas de muestreo, 128 generaciones por semilla, level zero; muestreo truncado con top-k 50 / top-p 0.95). Las incertidumbres son errores estandar entre semillas de muestreo.

| Paso | PPL generacion aleatoria | PPL generacion truncada |
|---|---:|---:|
| 10.000 | 219,77 ± 1,84 | 71,02 ± 0,69 |
| 17.192 | 185,07 ± 2,63 | 57,37 ± 1,61 |
| 25.000 | 173,60 ± 2,29 | 55,50 ± 1,11 |
| 34.384 | 185,82 ± 5,45 | 55,86 ± 1,09 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible. El propio autor advierte que la perplejidad de generacion por si sola no establece la calidad del texto ni aisla la contribucion de RoBERTa.

## Requisitos de hardware

- Entrenamiento: ocho GPU B200, segun la model card.
- VRAM para inferencia: no disponible (no se declara numero de parametros del generador ni del codec).
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no puede determinarse sin conocer el tamano del generador.
- Almacenamiento: 76,6 GB de repositorio completo; los checkpoints de entrenamiento incluyen estado de optimizador, scheduler, EMA y RNG por rango, por lo que su huella en disco es elevada.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. Los artefactos son objetos de checkpoint de Python/PyTorch, por lo que es necesario restaurarlos en el entorno registrado y usar los scripts de evaluacion e inferencia del repositorio con los exports de generador y codec correspondientes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no publica un modelo con pesos finales comparable a alternativas de la misma categoria, y no se declaran parametros, licencia ni resultados en benchmarks estandar que permitan una comparacion cifrada. Como referencias internas del propio experimento, la model card menciona un profesor RoBERTa-base congelado y el uso de GPT-2 Large en el contexto de la evaluacion de generacion, pero no se ofrecen datos que permitan contrastarlos como alternativas de despliegue.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un archivo de respaldo de experimentos con checkpoints intermedios.
- El autor indica que las muestras generadas inspeccionadas siguen conteniendo gramatica rota y repeticiones.
- La perplejidad de generacion publicada no demuestra calidad de texto ni aisla la contribucion del profesor semantico.
- Ventana de contexto muy corta (256 tokens), adecuada solo para experimentos, no para tareas que requieran contexto largo.
- Licencia no declarada: no se puede asumir permiso de uso comercial ni redistribucion.
- Idiomas soportados no declarados.
- Sesgos conocidos: no disponibles; no se publica analisis de sesgo ni de toxicidad.
- Riesgo de alucinacion: no evaluado en la informacion disponible; las muestras documentadas presentan repeticiones y gramatica incorrecta.
- El run `semantic-gear-full-v1` esta detenido intencionadamente y no completado; su ultimo checkpoint reanudable es el paso 28.000.
- `best_checkpoint.pt` se selecciona por menor loss de validacion, no por mejor perplejidad de generacion.
- Se excluyeron del archivo el historial completo de Git y los checkpoints intermedios redundantes; tambien se redactaron credenciales embebidas en cuatro scripts shell heredados no relacionados.
- La restauracion requiere el entorno registrado y los scripts de evaluacion e inferencia del repositorio, con exports de generador y codec que coincidan.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/iskhare/mstok-semantic-gear-backups
- Respaldo completo: https://huggingface.co/iskhare/mstok-semantic-gear-backups/tree/main/backups/20260914T205505Z
- Instrucciones de restauracion: https://huggingface.co/iskhare/mstok-semantic-gear-backups/blob/main/backups/20260914T205505Z/README.md
- Inventario de checksums: https://huggingface.co/iskhare/mstok-semantic-gear-backups/blob/main/backups/20260914T205505Z/SHA256SUMS
- Verificacion remota: https://huggingface.co/iskhare/mstok-semantic-gear-backups/blob/main/backups/20260914T205505Z/REMOTE_VERIFICATION.json
- Dependencias externas: https://huggingface.co/iskhare/mstok-semantic-gear-backups/blob/main/backups/20260914T205505Z/EXTERNAL_DEPENDENCIES.json

No se han encontrado en la busqueda web enlaces adicionales relevantes (paper, blog o repositorio) sobre este modelo; los resultados devueltos no guardan relacion con el.
