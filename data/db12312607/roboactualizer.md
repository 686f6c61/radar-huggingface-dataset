# db12312607/RoboActualizer

## Resumen

RoboActualizer es una política robótica de tipo *flow-matching* conjunto imagen/acción construida sobre un codificador V-JEPA 2.1 ViT-L/16 congelado, de aproximadamente 300 millones de parámetros. Lo desarrolla el usuario de Hugging Face `db12312607` y se distribuye como un conjunto de checkpoints entrenados para dos entornos de evaluación de manipulación robótica: LIBERO (y su variante LIBERO-Plus) y RoboTwin 2.0.

El modelo resuelve el problema de generar trayectorias de acción continuas a partir de observaciones visuales e instrucciones textuales, empleando un esquema de flow matching en lugar de difusión clásica. La innovación principal es que el codificador visual permanece congelado, de modo que solo se entrenan los cabezales DiT (Small y Base), lo que reduce drásticamente el número de parámetros entrenables y permite iterar sobre políticas robóticas con un coste computacional contenido.

Es relevante ahora porque publica resultados verificables en benchmarks de manipulación exigentes: 98,00 de tasa de éxito en LIBERO con un DiT-S en tan solo 4 pasos de inferencia y sin *classifier-free guidance*, y 65,0 en LIBERO-Plus con un DiT-B. El repositorio, sin embargo, es muy pesado (351,6 GB) y la documentación pública es mínima, limitada a la model card y a un repositorio de código externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de flow matching imagen/acción con codificador V-JEPA 2.1 ViT-L/16 congelado y cabezales DiT (Small y Base) |
| Parametros totales | No disponible (el codificador V-JEPA 2.1 ViT-L/16 se describe como de 300M; los parámetros entrenables de los DiT-S y DiT-B no se detallan) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los checkpoints se publican en bf16 y uno de ellos en fp32 |
| Idiomas soportados | No disponible (las instrucciones de LIBERO y RoboTwin son en inglés, pero no se declara soporte multilingüe) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch), con `dataset_stats.json` y `config.yaml` por carpeta, más `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura combina un codificador visual congelado V-JEPA 2.1 ViT-L/16 (300M parámetros, checkpoint `vjepa2_1_vitl_dist_vitG_384.pt`) con cabezales de transformador de difusión (DiT) que modelan conjuntamente la imagen y la acción mediante flow matching. Se publican dos variantes de cabezal: DiT-S y DiT-B, con distintos números de parámetros entrenables (no detallados en la información disponible). La inferencia emplea pocos pasos de integración (4 pasos en LIBERO, 10 en RoboTwin) y, en LIBERO-Plus, *classifier-free guidance* textual sobre la acción con escala 1,5.

No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Los checkpoints publicados corresponden a los pasos 173580 (DiT-S LIBERO), 130185 (DiT-B LIBERO-Plus) y 176540 (DiT-S RoboTwin, pesos fp32). Cada carpeta incluye el `dataset_stats.json` necesario para la normalización de acciones y estados, que debe mantenerse junto al checkpoint porque la evaluación lo busca en esa ubicación.

## Capacidades

- Generación de acciones robóticas continuas condicionadas por observación visual e instrucción textual (política visuomotora).
- Flow matching conjunto imagen/acción, con inferencia en 4 pasos (LIBERO) o 10 pasos (RoboTwin).
- Soporte de *classifier-free guidance* textual sobre la acción (escala 1,5 en LIBERO-Plus).
- Evaluación en manipulación de precisión a largo plazo: suites LIBERO (4 suites × 10 tareas × 50 episodios) y LIBERO-Plus (10.030 tareas × 1).
- Evaluación en RoboTwin 2.0 con escenarios limpios y aleatorizados (50 tareas × 2 condiciones × 25 episodios).
- No se documenta soporte de *tool calling*, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica en laboratorio con LIBERO: usar el checkpoint `libero_dits` para reproducir la línea base de 98,00 de éxito en las cuatro suites, sirviendo como referencia para comparar nuevas políticas con el mismo protocolo de evaluación.
- Investigación en generalización visual: emplear `libero_ditb` sobre LIBERO-Plus (10.030 tareas) para medir robustez ante variaciones de iluminación, textura y disposición de objetos, con *guidance* 1,5 y 4 pasos de inferencia.
- Benchmarking de manipulación bimanual: desplegar `robotwin_dits_fp32` en RoboTwin 2.0 para evaluar políticas en 50 tareas con condiciones limpias y aleatorizadas, usando 10 pasos de inferencia en fp32.
- Estudio de eficiencia de políticas: comparar DiT-S frente a DiT-B con el codificador congelado para cuantificar la relación entre parámetros entrenables y tasa de éxito, tal como sugieren las gráficas de la model card.
- Reentrenamiento con datos propios: partir del codificador V-JEPA 2.1 congelado y de la configuración `config.yaml` publicada para ajustar los cabezales DiT a un nuevo conjunto de tareas manteniendo el mismo esquema de normalización.
- Reproducibilidad de experimentos: usar los `SHA256SUMS` y los scripts `run_libero_manager.py`, `run_libero_plus.sh` y `run_robotwin_manager.py` para replicar exactamente las evaluaciones reportadas en entornos aislados.
- Integración en pipelines de investigación: descargar selectivamente con `--exclude "data/*"` para evitar los 351,6 GB completos y desplegar solo el checkpoint necesario en un servidor con GPU.

## Benchmarks y rendimiento

| Modelo | Benchmark | Inferencia | Resultado |
|---|---|---|---|
| DiT-S, step 173580 | LIBERO (4 suites × 10 tareas × 50) | 4 pasos, sin CFG, bf16 | 98,00 |
| DiT-S, step 173580 | LIBERO-Plus (10.030 tareas × 1) | 4 pasos, action text-CFG 1,5, bf16 | 62,2 |
| DiT-B, step 130185 | LIBERO-Plus (10.030 tareas × 1) | 4 pasos, action text-CFG 1,5, bf16 | 65,0 |
| DiT-S, fp32, step 176540 | RoboTwin 2.0 (50 tareas × clean/randomized × 25) | 10 pasos, sin CFG, fp32 | 58,84 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es una política robótica y no un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el codificador V-JEPA 2.1 ViT-L/16 de 300M parámetros más un cabezal DiT-S o DiT-B requiere presumiblemente una GPU con al menos 16-24 GB en bf16, aunque el dato no se confirma en la documentación.
- GPU recomendadas: no especificadas por el autor; por tamaño del codificador, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 son opciones razonables para inferencia, pero no hay validación publicada.
- Cabe en GPU de consumo: probablemente en RTX 4090 y RTX 3090 por el tamaño del codificador, si bien el checkpoint en fp32 de RoboTwin puede requerir más memoria.
- Opciones de despliegue: scripts propios del repositorio de código (`run_libero_manager.py`, `run_libero_plus.sh`, `run_robotwin_manager.py`) sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; solo se indica el número de pasos de integración (4 o 10) y la precisión (bf16 o fp32).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboActualizer (DiT-S) | Codificador 300M + DiT-S (entrenables no detallados) | No disponible | LIBERO 98,00; LIBERO-Plus 62,2 | MIT | Hugging Face, 351,6 GB |
| RoboActualizer (DiT-B) | Codificador 300M + DiT-B (entrenables no detallados) | No disponible | LIBERO-Plus 65,0 | MIT | Hugging Face, 351,6 GB |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos sobre políticas robóticas comparables (por ejemplo, otras políticas basadas en V-JEPA o en flow matching para LIBERO) que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La documentación pública es mínima: la model card remite a un repositorio de código externo para instrucciones completas, lo que dificulta la reproducibilidad sin acceso a ese repositorio.
- El tamaño del repositorio (351,6 GB) complica la descarga y el almacenamiento; se recomienda usar `--exclude "data/*"` para obtener solo los checkpoints.
- El modelo está especializado en manipulación robótica; no es un modelo de lenguaje general y no debe evaluarse con benchmarks de texto.
- No se declaran idiomas soportados ni evaluación multilingüe; las instrucciones de los benchmarks son en inglés.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento fuera de distribución; en robótica, el riesgo principal es la generalización limitada a entornos no vistos.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre el checkpoint del codificador V-JEPA 2.1, cuyo origen y licencia conviene verificar por separado.
- El checkpoint de RoboTwin se publica en fp32, lo que incrementa los requisitos de memoria frente a las variantes en bf16.
- No hay métricas de latencia ni throughput publicadas, lo que impide estimar el rendimiento en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/db12312607/RoboActualizer
- Checkpoint del codificador V-JEPA 2.1 ViT-L/16: https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitl_dist_vitG_384.pt
- Repositorio de código de Roboactualizer: no disponible como enlace directo en la información proporcionada (la model card lo menciona sin URL)
- Paper de V-JEPA 2.1: no disponible en la información proporcionada
- Demos: no disponibles en la información proporcionada
