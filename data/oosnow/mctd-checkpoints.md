# oosnow/mctd-checkpoints

## Resumen

`oosnow/mctd-checkpoints` es un repositorio de checkpoints ligeros para el método MCTD (razonamiento latente), desarrollado por el autor `oosnow`. No contiene un modelo completo, sino únicamente los pesos de la cabeza de acción y de Wa, que deben combinarse con el modelo base `Qwen/Qwen3-1.7B` y el código de la release de GitHub de MCTD. El repositorio está orientado a experimentos en el entorno ALFWorld, un benchmark de agentes que requieren decisiones basadas en lenguaje natural.

El paquete incluye dos artefactos: un fichero de inicialización (`initialization.tar.gz`) con una Wa no aleatoria y un warm start de la acción-head a partir de un SFT de expertos histórico, y un checkpoint de SFT latente solo de la acción-head (`alfworld-latent-sft-k4.tar.gz`) empaquetado como ejecución portable. El objetivo es proporcionar puntos de partida para reproducir o extender trabajos de razonamiento latente sin reentrenar desde cero. La arquitectura, el tamaño de parámetros y la longitud de contexto no se detallan en la información disponible; el contexto queda determinado por el modelo base Qwen3-1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; se usa junto con Qwen/Qwen3-1.7B como modelo base |
| Parametros totales | No disponibles (el checkpoint no incluye el modelo base; Qwen3-1.7B tiene ~1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles |
| Idiomas soportados | No disponibles |
| Licencia | No disponible; el README no concede una licencia general sobre derivados de terceros |
| Formato de pesos | No especificado; archivos comprimidos `.tar.gz` que contienen checkpoints serializados |

## Arquitectura y entrenamiento

Los checkpoints están diseñados para el método MCTD, un enfoque de razonamiento latente aplicado a tareas de decisión. Según el README, el repositorio no incluye los pesos del modelo base Qwen, sino únicamente los de la cabeza de acción y de Wa. El fichero `initialization.tar.gz` contiene una inicialización de Wa dependiente del estudiante y un warm start de la acción-head basado en un SFT de expertos histórico; la cabeza no es aleatoria. El fichero `alfworld-latent-sft-k4.tar.gz` es un checkpoint de SFT latente solo de la acción-head con k=4, empaquetado como una ejecución portable en `experiments/pretrained/alfworld/latent-sft-k4`. En ese entrenamiento, Wa permaneció fija.

El paquete no es un archivo completo de historial de entrenamiento: no se incluyen el optimizador, el scheduler ni el estado RNG, por lo que reanudar una ejecución anterior no es compatible. El README indica que el repositorio no afirma nuevos entrenamientos ni evaluaciones por parte de su publicación.

## Capacidades

- Razonamiento latente en el entorno ALFWorld mediante el método MCTD.
- El checkpoint `alfworld-latent-sft-k4` permite evaluar una política preentrenada en ALFWorld.
- El fichero de inicialización proporciona una Wa no aleatoria, útil para arrancar nuevas ejecuciones OPD.
- No se documentan capacidades de generación de texto, tool calling, agentes multi-paso ni multimodalidad.
- La información disponible no permite afirmar soporte multilingüe ni otras tareas fuera de ALFWorld.

## Casos de uso

- Reproducción de experimentos de razonamiento latente: el checkpoint portable de ALFWorld permite cargar la política entrenada y evaluarla con el código de MCTD en la release de GitHub. Es adecuado porque el repositorio incluye los pesos y el dataset `mctd-data` con las tablas de comandos originales.
- Inicialización de nuevas ejecuciones OPD: `initialization.tar.gz` proporciona un estado inicial no aleatorio para Wa y la cabeza de acción. Esto permite explorar variantes de entrenamiento sin partir de cero.
- Investigación sobre el efecto de congelar Wa: el checkpoint `alfworld-latent-sft-k4` indica que Wa permaneció fijo durante el SFT. Es útil para estudiar el impacto de esa decisión de entrenamiento.
- Evaluación de políticas en ALFWorld: el entorno ALFWorld es un benchmark de agentes que requiere planificación y decisiones en lenguaje natural; la cabeza de acción entrenada puede utilizarse para esa evaluación.
- Comparación de vocabularios: el dataset `mctd-data` contiene la tabla de comandos original. Al usar el mismo vocabulario alineado con Qwen3-1.7B, se pueden comparar resultados sin ambigüedad.
- Aprendizaje de representaciones latentes: MCTD es un método de razonamiento latente; los checkpoints sirven como punto de partida para experimentos sobre representaciones internas en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible.
- Opciones de despliegue: no disponibles; se utiliza con el código de la release de GitHub de MCTD y el modelo base Qwen3-1.7B, pero no se especifican frameworks concretos (vLLM, llama.cpp, Ollama, TGI, etc.).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar alternativas comparables, ya que se trata de un checkpoint parcial de MCTD, no de un modelo autónomo.

## Limitaciones y advertencias

- No es un modelo completo: solo contiene los pesos de Wa y la cabeza de acción; los pesos del modelo base `Qwen/Qwen3-1.7B` deben descargarse por separado.
- Licencia no definida: el README indica que no concede una licencia general sobre derivados de terceros; hay que respetar los términos del modelo base.
- Sin historial de entrenamiento: los artefactos no incluyen optimizador, scheduler ni estado RNG, por lo que no se puede reanudar una ejecución anterior.
- Solo cubre ALFWorld: los checkpoints están orientados a ese entorno y no se documentan otros dominios.
- Sin evaluación publicada: no se presentan benchmarks ni resultados en el repositorio.
- Repositorio con 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido probado ampliamente.
- Riesgo de alucinación y sesgos: al usar el modelo base Qwen3-1.7B, se aplican las limitaciones inherentes a ese modelo, pero no se detallan en la información disponible.
- Seguridad: el README advierte que se deben cargar pesos solo de fuentes de confianza y que el descargador verifica checksums publicados.

## Enlaces

- https://huggingface.co/oosnow/mctd-checkpoints
- https://huggingface.co/datasets/oosnow/mctd-data
- https://huggingface.co/Qwen/Qwen3-1.7B
- Código de la release de GitHub de MCTD: no disponible.
