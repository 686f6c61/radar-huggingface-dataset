# qiuly/OpenWAM-private-checkpoints

## Resumen

OpenWAM-private-checkpoints es un archivo de investigación publicado en HuggingFace por el usuario qiuly que contiene 40 políticas SFT finales (run1–run40), dos políticas de preentrenamiento WAM, 10 artefactos S-VAE independientes y un artefacto de ajuste fino del codificador VideoRAE. No es un modelo único ni un modelo cargable con `from_pretrained`: es un formato de archivo con componentes congelados compartidos almacenados una sola vez y herramientas que reconstruyen cada checkpoint original byte a byte, preservando la precisión original de los tensores.

El proyecto se apoya en NVIDIA Cosmos como base ("Built on NVIDIA Cosmos") y pertenece al ámbito de la robótica y los world models, con evaluación orientada al benchmark LIBERO y LIBERO+ mediante el repo OpenWAM-private. La arquitectura interna combina componentes identificables por los nombres de sus assets: un experto VLM (`vlm_expert`), un módulo de razonamiento (`reason1`), el codificador visual DINOv3 en variante patch2, un códec de vídeo VideoRAE y variantes de S-VAE. La presencia de configuraciones de dos y tres sistemas (2sys/3sys) apunta a un diseño con separación entre razonamiento y acción, aunque la model card no detalla la topología exacta.

Su relevancia es fundamentalmente de reproducibilidad: el archivo registra `catalog.json`, `checkpoint.index.json`, `publication-manifest.json` y sumas SHA-256 por tensor y por fichero, lo que permite verificar y restaurar checkpoints de forma verificable en lugar de depender de copias manuales. El repositorio ocupa 285,1 GB, es público en su totalidad (el nombre "private" y la carpeta `private/` no restringen el acceso) y la inferencia exige un checkout compatible de OpenWAM y su entorno de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como especificación cerrada. Archivo de políticas construidas sobre NVIDIA Cosmos; los assets incluyen `vlm_expert`, `reason1`, DINOv3 patch2, VideoRAE y S-VAE. Configuraciones 2sys y 3sys |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Se preserva la precisión original de los tensores (bf16 en el S-VAE embebido en políticas, fp32 en los S-VAE independientes). No se publican pesos cuantizados tipo GGUF/AWQ/GPTQ |
| Idiomas soportados | en, zh |
| Licencia | other (`mixed-upstream-model-licenses`); los componentes de origen conservan sus licencias respectivas. Revisar LICENSE, NOTICE y THIRD_PARTY_LICENSES.md |
| Formato de pesos | safetensors (pesos), más `.pt` originales de S-VAE/encoder, `normalization_stats.npy`, `config.yaml` y JSON de índice y catálogo |
| Tamano del repositorio | 285,1 GB |
| Pipeline declarado | robotics |
| Herramientas incluidas | `tools/checkpoint_archive.py` (list, verify, resolve, eval, add-policy, add-model), `tools/test_checkpoint_archive.py`, `tools/import_run1_run40.py` |
| Requisitos de las herramientas | Python 3.9+ con biblioteca estándar, Linux/macOS |
| Revision de codigo compatible | OpenWAM-private `cc4bf0c6bd3e016723c0b4050cd93b7d5c827ef6` |

## Arquitectura y entrenamiento

La información disponible describe la estructura de archivo, no la topología completa del modelo. Cada directorio de política (`sft/runXX-<nombre>`) contiene un `checkpoint.index.json` y una carpeta `private/` con `weights.safetensors` (solo los parámetros propios de ese run, no el modelo completo) y `assets/`, donde se guardan `config.yaml`, `normalization_stats.npy` (obligatorio para SFT), `reason1/`, `vlm_expert/` (presente en configuraciones de tres sistemas) y configuraciones de dinov3, videorae y S-VAE. Existen políticas de preentrenamiento WAM (`run23-2sys-pretrain-dinov3-patch2-pretrain`, `run39-3sys-pretrain-dinov3-patch2-pretrain`) y un ajuste fino de codificador VideoRAE (`run19_2sys_scratch_videorae_ft-encoder`).

El sistema de archivo usa deduplicación por contenido: `shared/` y `svae/_components/` generan un identificador a partir del nombre de tensor, dtype, shape y hash completo de bytes, de modo que dos modelos con el mismo nombre pero cualquier tensor distinto se almacenan como componentes separados. No existe lógica de "mismo nombre, se omite la copia". Esto permite que el archivo reconstruya el safetensors original byte a byte (no solo numéricamente equivalente), con la cabecera original del checkpoint y los SHA-256 completos registrados en `checkpoint.index.json`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF, DPO u otras etapas de alineamiento.

Como innovación destacable del artefacto, y no del modelo en sí, figura la separación entre S-VAE en bf16 dentro de las políticas y S-VAE en fp32 de los productos de entrenamiento independientes, que no son intercambiables, junto con la conservación de la precisión y los metadatos de entrenamiento originales. La carga y evaluación en CPU y los chequeos en seco (`--dry-run`) están documentados, pero el propio autor advierte que no constituyen resultados de benchmark en bucle cerrado.

## Capacidades

- Ejecución de políticas robóticas: los checkpoints están orientados a evaluación en LIBERO y LIBERO+ mediante el entry point `scripts/libero/eval.sh` del checkout de OpenWAM.
- Reconstrucción y verificación de checkpoints: `checkpoint_archive.py list`, `resolve` y `verify --workers 8` permiten localizar, restaurar y validar la integridad byte a byte de cada run.
- Restauración selectiva por etapa: `resolve run40`, `resolve run23 --stage pretrain` y `resolve svae/run11` recuperan políticas SFT, políticas de preentrenamiento y artefactos S-VAE por separado.
- Evaluación lanzable en clúster: el wrapper `eval` propaga `EVAL_LIBERO`, `EVAL_SMOKE`, `NNODES`, `NODE_RANK`, `EVAL_LAUNCH_ID`, `OPENWAM_LIBERO_OUTPUT_ROOT` y `OPENWAM_LIBERO_VENV_BIN`, con soporte multinodo documentado.
- Ampliación del archivo: `add-policy` y `add-model` permiten incorporar nuevos runs sin sobrescribir `catalog.json` manualmente.
- Portabilidad del archivo: todas las rutas internas son relativas a la raíz del archivo, por lo que puede moverse de ubicación y seguir operativo desde la nueva ruta o con `--root`.
- Idiomas declarados: inglés y chino. No se declaran capacidades de tool calling, function calling, agentes, visión general, audio ni modo de razonamiento explícito, más allá de los componentes `reason1` y `vlm_expert` que aparecen como assets.

## Casos de uso

- Reproducibilidad de experimentos en robótica: restaurar exactamente el checkpoint de un run concreto y volver a lanzar la evaluación LIBERO, de modo que un tercero obtenga el mismo conjunto de pesos y la misma configuración que el autor original.
- Auditoría de integridad y cadena de custodia: usar `verify --workers 8` y `publication-manifest.json` para comprobar mediante SHA-256 que los ficheros descargados coinciden con la revisión de datos publicada antes de aceptar cualquier resultado.
- Comparativa de políticas SFT: dado que se publican 40 políticas finales en un mismo formato, permite medir diferencias de comportamiento entre runs bajo el mismo protocolo de evaluación y las mismas estadísticas de normalización.
- Estudio de configuraciones de sistema: comparar los runs con arquitectura de dos sistemas frente a los de tres sistemas, y las variantes de preentrenamiento con DINOv3 patch2, para aislar el efecto de cada componente.
- Ablación de códecs latentes: los 10 artefactos S-VAE independientes y el ajuste fino del codificador VideoRAE permiten experimentar con distintos espacios latentes manteniendo fija la política, siempre respetando la distinción entre S-VAE en bf16 y en fp32.
- Reanudación de entrenamiento o ajuste fino posterior: restaurar un checkpoint completo fuera del archivo y continuar el entrenamiento especificando explícitamente la ruta restaurada, en lugar de reutilizar las rutas antiguas registradas en las configuraciones originales.
- Evaluación distribuida en clúster: lanzar la misma política en varios nodos con `NNODES` y `NODE_RANK` y un `EVAL_LAUNCH_ID` único por ronda, para reproducir la configuración de evaluación del autor.
- Integración en un pipeline de validación continua: automatizar `eval --dry-run` como comprobación previa (verificación de checkpoint y plan de lanzamiento) antes de consumir GPU en la evaluación real.
- Docencia y formación en world models para manipulación: el archivo documenta la estructura de assets, estadísticas de normalización y checkpoints, lo que sirve como material de estudio de una pipeline completa de robótica basada en NVIDIA Cosmos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el comando de evaluación sobre LIBERO y LIBERO+ y advierte de forma explícita que la carga en CPU y los chequeos `--dry-run` no son resultados nuevos de benchmark en bucle cerrado. La búsqueda web realizada no devolvió ningún enlace ni dato relacionado con OpenWAM ni con este repositorio.

| Benchmark | Resultado | Notas |
|---|---|---|
| LIBERO / LIBERO+ | No disponible | Existe entry point de evaluación, sin cifras publicadas en la información proporcionada |
| MMLU, HumanEval, GSM8K u otros | No aplica / no disponible | No se proporcionan resultados |

## Requisitos de hardware

- Descarga: 285,1 GB de repositorio completo; conviene planificar el espacio en disco antes de `hf download`.
- Herramientas de gestión (`list`, `resolve`, `verify`, `eval --dry-run`): funcionan con Python 3.9+ y biblioteca estándar en Linux o macOS, sin GPU.
- VRAM para inferencia: no disponible de forma explícita. No se publican recuentos de parámetros por checkpoint ni tamaños por run, por lo que no es posible calcular una cifra fiable a partir de la información proporcionada.
- GPU recomendadas: no disponible en la información. El wrapper de evaluación soporta despliegue multinodo (`NNODES`, `NODE_RANK`), lo que indica que la evaluación está pensada para entornos con varias GPU o varios nodos; no se menciona ningún modelo de GPU concreto (A100, H100, RTX 4090 ni otros).
- Viabilidad en GPU de consumo: no confirmada. No hay datos que permitan afirmar que un checkpoint completo quepa en una GPU de gama de consumo.
- Opciones de despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI. El único camino documentado es un checkout compatible de OpenWAM-private con su entorno de evaluación LIBERO (`scripts/libero/eval.sh`) y las dependencias del runtime instaladas por separado.
- Latencia y throughput: no disponibles.
- Advertencia operativa: el script resuelve las dependencias por rutas relativas a la raíz del archivo, por lo que mover el directorio es seguro, pero enlazar o referenciar directamente `private/weights.safetensors` como si fuera un checkpoint completo produce un modelo incompleto.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada, y la búsqueda web no devolvió resultados relevantes. La model card sí identifica una base tecnológica concreta (NVIDIA Cosmos) y el ecosistema de destino (LIBERO, OpenWAM-private), pero sin especificaciones publicadas de esos sistemas en este material.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenWAM-private-checkpoints (qiuly) | No disponible | No disponible | No disponible | other / mixed-upstream-model-licenses | Publico en HuggingFace, 285,1 GB |
| NVIDIA Cosmos (base declarada) | No disponible en la informacion | No disponible | No disponible | No disponible en la informacion | No disponible en la informacion |
| Otras politicas roboticas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: es un formato de archivo. Requiere un checkout compatible de OpenWAM y su entorno de benchmark; no funciona con `transformers.from_pretrained` ni con cargadores genéricos.
- Acceso al código separado: el repositorio de código OpenWAM-private y la instalación de su runtime son independientes de este archivo; el acceso a ese repositorio puede estar restringido aunque los pesos sean públicos.
- Revisión acoplada: las comprobaciones de carga del archivo se validaron contra la revisión `cc4bf0c6bd3e016723c0b4050cd93b7d5c827ef6`; otras revisiones pueden no ser compatibles.
- Ausencia de benchmarks: no hay cifras publicadas de LIBERO ni de ningún otro benchmark en la información disponible, por lo que no se puede afirmar ningún nivel de rendimiento. Los chequeos en seco y la carga en CPU no equivalen a una evaluación en bucle cerrado.
- Licencia mixta: cada componente de origen conserva su licencia. El uso comercial exige revisar LICENSE, NOTICE y THIRD_PARTY_LICENSES.md componente por componente; la licencia del conjunto no es una licencia única permisiva.
- Idiomas limitados a inglés y chino según los metadatos; no se declara soporte multilingüe adicional.
- Riesgo de alucinación y sesgos: no hay información proporcionada sobre evaluación de sesgos, filtros de seguridad ni tasas de alucinación. Al tratarse de políticas entrenadas y evaluadas en entornos simulados tipo LIBERO, el comportamiento fuera de esa distribución no está caracterizado.
- Ambigüedad de nombres: el repositorio y la carpeta `private/` se llaman así solo porque contienen los ficheros propios de cada run; todos los ficheros son públicos, según aclara el autor.
- Consistencia del archivo: `PUBLICATION_COMPLETE.json` es el marcador que indica que la subida inicial está completa; si no aparece, la publicación podría estar incompleta.
- Integridad de las estadísticas: no se deben descartar `normalization_stats.npy`, la configuración ni los ficheros de tokenizer al restaurar un checkpoint, ya que son necesarios para la evaluación SFT.
- Cautela con las rutas heredadas: las configuraciones originales contienen rutas absolutas antiguas que solo tienen valor de procedencia; reutilizarlas directamente para reanudar entrenamiento es un error.
- Requisitos de espacio: 285,1 GB, y cada restauración de una política completa genera una copia adicional fuera del archivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qiuly/OpenWAM-private-checkpoints
- Código fuente compatible (acceso separado): https://github.com/d-finite/OpenWAM-private (revisión `cc4bf0c6bd3e016723c0b4050cd93b7d5c827ef6`)
- Ficheros de licencia y atribución incluidos en el repositorio: `LICENSE`, `NOTICE`, `THIRD_PARTY_LICENSES.md`
- Manifiestos y metadatos incluidos: `PUBLICATION_COMPLETE.json`, `publication-manifest.json`, `catalog.json`, `checkpoint.index.json`
- Herramientas incluidas: `tools/checkpoint_archive.py`, `tools/test_checkpoint_archive.py`, `tools/import_run1_run40.py`
- Papers, blogs o demos adicionales: no disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con OpenWAM, NVIDIA Cosmos aplicado a este archivo ni con el repositorio.
