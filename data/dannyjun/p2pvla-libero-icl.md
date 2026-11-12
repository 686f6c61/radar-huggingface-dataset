# DannyJun/P2PVLA-LIBERO-ICL

## Resumen

P2PVLA-LIBERO-ICL es un repositorio de pesos parciales (checkpoints de estado de tensores) para la rama `libero-icl-from5k` del proyecto P2PVLA, un sistema de aprendizaje por imitación para robótica de manipulación. Lo publica el usuario DannyJun en Hugging Face y no constituye un modelo completo, sino dos artefactos de inicialización de la etapa 1 (Stage1) que el código de entrenamiento del proyecto necesita como punto de partida. El repositorio ocupa 0,2 GB y contiene únicamente `predictor_only.pt`, `resampler_only.pt` y `metadata.json`.

El sistema subyacente combina un modelo de visión-lenguaje-acción (VLA) con un planificador latente basado en características de V-JEPA2.1. Concretamente, el plan consta de 16 tokens de 512 dimensiones y se predicen cuatro nodos futuros ordenados de subtareas sobre la rejilla nativa de características JEPA de 24x24. La etapa 1 se entrenó con batch global 48, rollout libre con detach del estado recurrente, sin Local8, sin embedding de paso y sin pérdida de contraste.

La relevancia de esta ficha es acotada: no es un modelo desplegable ni un policy entrenado, sino material de staging privado para reproducir un pipeline de investigación. El propio autor advierte de que el Indexer de Stage1-z no está entrenado ni incluido, de que no se redistribuyen las dependencias upstream (Qwen3-VL-2B-Instruct y el encoder oficial V-JEPA2.1) y de que no se reclama validación completa de entrenamiento multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con planificador latente sobre caracteristicas V-JEPA2.1; plan de 16 tokens x 512 dimensiones, prediccion de 4 nodos futuros en rejilla JEPA 24x24 |
| Parametros totales | no disponible (el repo solo contiene dos state dicts parciales; el sistema completo depende de Qwen3-VL-2B-Instruct y V-JEPA2.1) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pt`, no cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el autor indica staging privado y que no se afirma licencia nueva sobre activos upstream |
| Formato de pesos | PyTorch state dict (`.pt`) para `predictor_only.pt` y `resampler_only.pt`; `metadata.json` con arquitectura, paso de entrenamiento y checksums |

## Arquitectura y entrenamiento

El repositorio no contiene un transformer generativo al uso, sino dos componentes de un sistema VLA jerarquico. `predictor_only.pt` es la inicializacion del predictor Markov de Stage1 a 12K pasos, y `resampler_only.pt` es el teacher de plan congelado de Stage1 a 12K pasos. El plan latente opera con 16 tokens de 512 dimensiones y predice cuatro nodos futuros de subtarea ordenados sobre la rejilla nativa de caracteristicas JEPA de 24x24. La etapa 1 se ejecuto con batch global 48, rollout libre con detach del estado recurrente, sin Local8, sin embedding de paso y sin perdida de contraste.

El modelo completo depende de dos dependencias upstream que no se redistribuyen en este repositorio: Qwen3-VL-2B-Instruct como columna vertebral vision-lenguaje y el encoder oficial V-JEPA2.1 para las caracteristicas visuales. El Indexer de Stage1-z, necesario para el entrenamiento formal de la politica, no esta entrenado ni incluido; debe generarse mediante extraccion standalone de z y un warmup de 2K pasos segun la receta del proyecto, produciendo `runs/libero-indexer-stage1/indexer.pt`. Los ficheros subidos son state dicts de tensores, no politicas completas ni checkpoints de optimizador.

## Capacidades

- No es un modelo de proposito general: no genera texto, no responde preguntas y no ejecuta codigo.
- Proporciona la inicializacion del predictor Markov y del teacher de plan para el entrenamiento de la politica en la rama `libero-icl-from5k`.
- Soporta el paradigma de planificacion latente con 16 tokens de 512 dimensiones y prediccion de cuatro subtareas futuras sobre la rejilla JEPA 24x24.
- Habilita el pipeline de aprendizaje por imitacion sobre el benchmark LIBERO, condicionado a disponer de Qwen3-VL-2B-Instruct y V-JEPA2.1.
- No incluye tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingues ni modos de pensamiento.
- No incluye vision ni audio como modulo propio; la vision llega via el encoder V-JEPA2.1 y el backbone Qwen3-VL externos.

## Casos de uso

- Reproduccion de experimentos LIBERO: cargar `predictor_only.pt` y `resampler_only.pt` en las rutas `LIBERO_STAGE1_PREDICTOR` y `LIBERO_STAGE1_RESAMPLER` definidas en `configs/libero_from5k_assets.example.json` para arrancar el entrenamiento desde el paso 12K del proyecto.
- Investigacion en planificacion latente para manipulacion: usar el teacher de plan congelado como referencia para estudiar la prediccion de subtareas futuras sobre la rejilla JEPA 24x24 sin reentrenar desde cero.
- Ablaciones controladas: comparar configuraciones con y sin Local8, embedding de paso o perdida de contraste partiendo de estos pesos, ya que la Stage1 documentada se entreno sin esos componentes.
- Desarrollo del Indexer Stage1-z: emplear estos assets como base mientras se ejecuta la extraccion standalone de z y el warmup de 2K pasos del Indexer, que es prerrequisito del entrenamiento formal de la politica.
- Validacion de pipelines de entrenamiento multi-GPU: usar los state dicts para verificar la carga de checkpoints y la coherencia de checksums via `metadata.json` antes de lanzar jobs largos.
- Auditoria de artefactos: comprobar checksums y paso de entrenamiento registrados en `metadata.json` para trazar el origen de los pesos en un entorno de staging privado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no contiene una politica ejecutable y depende de Qwen3-VL-2B-Instruct y V-JEPA2.1, cuyos requisitos deben consultarse en sus respectivas fichas.
- GPU recomendadas: no disponible. El autor no documenta hardware de referencia ni validacion multi-GPU completada.
- Cabeza en GPU de consumo: no disponible; el sistema completo (backbone de 2B parametros mas encoder JEPA) previsiblemente excede GPUs de gama media, pero no hay datos confirmados.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; la carga se realiza con PyTorch en el codigo de entrenamiento de P2PVLA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P2PVLA-LIBERO-ICL (este repo) | no disponible (state dicts parciales) | no disponible | Inicializacion Stage1 para VLA en LIBERO | no disponible | Hugging Face, staging privado |
| OpenVLA | 7B | no disponible | VLA para manipulacion robotica | no disponible en la informacion | publico |
| pi0 (Physical Intelligence) | no disponible en la informacion | no disponible | VLA de proposito general | no disponible en la informacion | publico |
| RT-2 | no disponible en la informacion | no disponible | VLA vision-lenguaje-accion | no disponible en la informacion | no disponible |

La comparativa es orientativa: este repositorio no es un modelo autonomo sino un conjunto de pesos de inicializacion, por lo que la comparacion directa con VLAs completos no es homogenea.

## Limitaciones y advertencias

- No es un modelo desplegable: los ficheros son state dicts de tensores, no politicas completas ni checkpoints de optimizador.
- El Indexer de Stage1-z no esta entrenado ni incluido; sin el, el entrenamiento formal de la politica no puede completarse y no debe sustituirse por un Indexer cacheado de main-policy-z.
- No se redistribuyen Qwen3-VL-2B-Instruct ni V-JEPA2.1; el usuario debe obtenerlos por separado y revisar sus licencias.
- El autor califica el material como staging privado y advierte de que debe revisarse la licencia heredada de codigo y datos antes de cualquier redistribucion publica.
- No se incluye Piper, C15/C45, video humano crudo, politica ICL entrenada ni validacion completa de entrenamiento multi-GPU.
- No hay datos de sesgos, alucinacion o cobertura idiomatica porque el artefacto no es un modelo de lenguaje.
- El uso comercial queda condicionado a las licencias upstream, no especificadas en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DannyJun/P2PVLA-LIBERO-ICL
- Dataset asociado: https://huggingface.co/datasets/DannyJun/P2PVLA-LIBERO-ICL
- Rama de codigo: https://github.com/TingjunDai/P2PVLA/tree/libero-icl-from5k
- Receta de entrenamiento: https://github.com/TingjunDai/P2PVLA/blob/libero-icl-from5k/docs/libero_from5k.md
- Proyecto P2PVLA: https://github.com/TingjunDai/P2PVLA
