# junbrro/vwam-oa-rel28-rh-naive-split-ema-50k-g4-bg-1102-v1-inference-ge10k-20261102

## Resumen

`vwam-oa-rel28-rh-naive-split-ema-50k-g4-bg-1102-v1-inference-ge10k-20261102` es un checkpoint de inferencia publicado por el usuario `junbrro` a partir de un entrenamiento propio del sistema V-WAM sobre el robot OpenArm. No se trata de un modelo de lenguaje ni de un modelo multimodal de propósito general, sino de un conjunto de pesos para una política robótica (pipeline `robotics`) que debe cargarse con el runtime específico de V-WAM. El repositorio contiene únicamente los pesos en formato EMA (media móvil exponencial) mapeados de `net_ema.*` a `net.*`, sin estado de optimizador, scheduler ni trainer.

El checkpoint capturado más reciente corresponde a la iteración 26000, con fecha de captura 2026-11-02T02:14:54Z. El nombre del repositorio codifica varios hiperparámetros del experimento (rel28, rh, naive-split, ema, 50k, g4, bg-1102, ge10k), aunque la model card no detalla su significado exacto. El tamaño del repositorio es de 32,0 GB, lo que sugiere pesos en precisión nativa (probablemente fp32 o bf16) preservados en formato PyTorch DCP.

La relevancia de esta ficha es limitada fuera del contexto específico del proyecto V-WAM: no hay benchmarks publicados, no se declara licencia, no se especifican idiomas y el autor indica explícitamente que no se reclama ningún éxito de rollout ni de política robótica. Es, por tanto, un artefacto de backup reproducible para un runtime concreto, no un modelo listo para uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | V-WAM (no detallada en la model card; dependiente del runtime V-WAM) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato DCP nativo, sin cuantización declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch DCP (Distributed Checkpoint); no es safetensors ni `AutoModel` de Transformers |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe que forma parte del sistema V-WAM aplicado al robot OpenArm y que el entrenamiento se realizó de forma distribuida (tag `distributed-checkpoint`). Los pesos publicados son una versión EMA de la red, exportada mediante el script `export_eval_minimal.py` del propio V-WAM, que mapea los tensores `net_ema.*` a `net.*` y los convierte al dtype de servicio correspondiente. No se incluye la red de entrenamiento en crudo ni estado de optimizador, scheduler o trainer.

El nombre del experimento sugiere configuraciones como `rel28`, `rh`, `naive-split`, `ema`, `50k`, `g4`, `bg-1102` y `ge10k`, pero la model card no aporta definiciones. El checkpoint capturado más reciente es la iteración 26000, capturada el 2026-11-02T02:14:54Z. El autor indica que el runtime V-WAM depende de assets congelados upstream (VLM, tokenizer y VAE) referenciados por la configuración original, por lo que estos no se incluyen en el repositorio y deben resolverse en tiempo de ejecución. Las rutas de entrenamiento registradas pueden requerir override en una máquina distinta.

## Capacidades

- Política robótica para el robot OpenArm, ejecutable únicamente con el runtime V-WAM.
- Carga de pesos EMA exportados para inferencia (mapeo `net_ema.*` a `net.*`).
- Verificación de integridad: el autor comprueba nombres, formas, dtypes y valores muestreados de tensores, así como tamaños y hashes de los ficheros del Hub antes de publicar el marcador de completitud.
- Dependencia de assets externos: VLM congelado, tokenizer y VAE referenciados por la configuración original.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.
- No se declara ningún éxito de rollout ni de política; el autor lo indica explícitamente.

## Casos de uso

- Reproducción de experimentos V-WAM: cargar el checkpoint con la configuración `config.yaml`, `normalization.json` y la ruta `checkpoints/iter_XXXXXXXXX` para replicar el estado de entrenamiento en la iteración 26000.
- Backup y versionado de pesos: el repositorio conserva un checkpoint capturado por experimento, lo que permite mantener trazabilidad entre ejecuciones de entrenamiento distribuidas.
- Evaluación offline en simulación: usar los pesos EMA para comparar el comportamiento de la política frente a otras iteraciones del mismo experimento antes de cualquier despliegue físico.
- Integración en pipelines de investigación con OpenArm: servir el checkpoint mediante el runtime V-WAM para experimentos controlados de manipulación robótica.
- Auditoría de integridad de pesos: emplear los marcadores `HF_INFERENCE_COMPLETE.json` y la verificación de hashes para validar que los tensores exportados coinciden con el estado EMA esperado.
- Desarrollo de tooling alrededor de V-WAM: usar este repositorio como caso de prueba para scripts de exportación, mapeo de tensores y validación de dtypes en checkpoints DCP.
- Docencia o formación interna: ejemplo práctico de checkpoint distribuido con EMA y dependencias externas congeladas en un stack de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que este backup no reclama ningún éxito de rollout ni de política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (32,0 GB) da una cota inferior aproximada del espacio en disco necesario para los pesos, pero no de la VRAM requerida en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime V-WAM con `config.yaml`, `normalization.json` y ruta `checkpoints/iter_XXXXXXXXX`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Dependencias de runtime: assets congelados upstream (VLM, tokenizer, VAE) referenciados por la configuración original.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas robóticas V-WAM sobre OpenArm) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- No se especifican idiomas soportados ni capacidades lingüísticas; no debe tratarse como un modelo de lenguaje.
- No es un modelo `AutoModel` de Transformers ni un export safetensors; requiere el runtime V-WAM y el formato DCP nativo.
- Depende de assets externos congelados (VLM, tokenizer, VAE) que no se incluyen en el repositorio.
- Las rutas de entrenamiento registradas pueden no ser válidas en otra máquina y requieren override.
- Solo debe usarse una carpeta tras la presencia del marcador `HF_INFERENCE_COMPLETE.json`; el autor lo remarca en la model card.
- No hay evidencia publicada de éxito de rollout ni de política; cualquier uso físico en OpenArm debe validarse de forma independiente.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero no se documentan sesgos ni limitaciones de comportamiento de la política.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/junbrro/vwam-oa-rel28-rh-naive-split-ema-50k-g4-bg-1102-v1-inference-ge10k-20261102
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
