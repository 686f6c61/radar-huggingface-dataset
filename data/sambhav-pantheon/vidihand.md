# sambhav-pantheon/vidihand

## Resumen

ViDiHand es un pipeline de reconstrucción de pose de manos 4D a partir de video egocéntrico, que aprovecha las representaciones internas de un modelo de difusión de video preentrenado. El checkpoint alojado en `sambhav-pantheon/vidihand` es una replicación privada del proyecto original, que combina un backbone de difusión de video Wan2.1-VACE-1.3B con un branch VACE finetuneado para manos y tres decodificadores ligeros de Stage-2 que extraen parámetros MANO, articulaciones 2D, traslación, profundidad y visibilidad. El modelo resuelve el problema de la reconstrucción fiable de manos bajo oclusiones severas y con interacción mano-objeto, donde los detectores por fotograma fallan.

La relevancia actual radica en que demuestra que los modelos de difusión de video, entrenados con supervisión débil, pueden servir como extractores de características robustas para tareas de visión 3D, superando a los pipelines basados en detección por fotograma. El checkpoint incluye el backbone compartido y tres variantes de decodificador que difieren en la profundidad de captura de características y en el comportamiento de la forma MANO (beta por fotograma o por clip). El repositorio es privado y su licencia está marcada como `other`, aunque los pesos upstream de Wan2.1 conservan su licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan2.1-VACE-1.3B (DiT + VAE + UMT5) con branch VACE finetuneado y decodificadores Stage-2 (tres variantes) |
| Parametros totales | Backbone: 1.3B; decodificadores: 36.9M (Model 1) y 121.8M (Model 2 y 3) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 81 fotogramas RGB a 30 fps, lado corto 480, dimensiones divisibles por 16 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | other (licencia no formalmente seleccionada; upstream Wan2.1 bajo Apache-2.0) |
| Formato de pesos | safetensors (archivos .safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en el backbone de difusion de video Wan2.1-VACE-1.3B, que incluye un DiT (Diffusion Transformer), un VAE y un codificador de texto UMT5. El branch VACE (Stage-1b) se finetunea con renderizado de superposicion de manos mientras el DiT base permanece congelado, lo que produce un modelo de difusion de video consciente de las manos. En la inferencia, se ejecuta un unico paso de difusion (50 pasos nominales, pero solo se ejecuta el prefijo hasta la llamada 34) y se extrae una caracteristica intermedia del DiT que alimenta un decodificador ligero de doble rama.

Los tres decodificadores de Stage-2 se entrenan por separado con diferentes profundidades de captura de caracteristicas: Model 1 usa el bloque 15 en la llamada 34/50, mientras que Model 2 y Model 3 usan los bloques 8, 15 y 22. Model 3 ademas emplea un peso de perdida de articulacion de 0.5 frente a 0.1 de Model 2. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens o el uso de RLHF/DPO. El entrenamiento se centra en la reconstruccion de pose MANO, articulaciones 2D y traslacion a partir de la caracteristica VACE.

## Capacidades

- Reconstruccion de pose de manos 4D (MANO) con orientacion, articulacion, beta (forma), profundidad, visibilidad y articulaciones 2D.
- Procesamiento de video egocentrico de 81 fotogramas a 30 fps, con lado corto 480 y dimensiones divisibles por 16.
- Manejo de oclusiones severas y interaccion mano-objeto gracias a la representacion temporal del modelo de difusion.
- Generacion de salidas metricas a escala (traslacion y profundidad) sin necesidad de detector por fotograma.
- Soporte de tres variantes de decodificador que permiten elegir entre captura de caracteristicas mas superficial o mas profunda, y entre beta por fotograma o por clip.
- No es un modelo de generacion de texto, codigo o imagenes; es exclusivamente un extractor de pose de manos a partir de video.

## Casos de uso

- Realidad virtual y aumentada: reconstruccion de manos del usuario en tiempo real para interaccion natural con entornos virtuales, aprovechando la robustez ante oclusiones de la mano sobre la cabeza o el cuerpo.
- Robotica asistiva: estimacion de la posicion y configuracion de manos humanas en entornos de trabajo colaborativo, permitiendo que un robot anticipe movimientos de agarre o manipulacion.
- Analisis de gestos en video egocentrico: extraccion de trayectorias de manos y articulaciones para estudios de comportamiento, ergonomia o rehabilitacion, sin necesidad de marcadores ni camaras externas.
- Interaccion humano-computadora: control de interfaces mediante gestos de mano capturados con camaras montadas en la cabeza, con salida MANO que puede alimentar sistemas de seguimiento.
- Animacion y captura de movimiento: generacion de datos de pose de manos para animar avatares digitales o para entrenar otros modelos de generacion de movimiento.
- Investigacion en vision por computador: uso como extractor de caracteristicas robustas para tareas de reconstruccion 3D de manos en condiciones de oclusion, sirviendo de referencia para comparar con metodos basados en deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de evaluacion como MMLU, HumanEval o GSM8K, ya que no es un modelo de lenguaje. Tampoco se proporcionan comparaciones cuantitativas con otros metodos de reconstruccion de manos en el material consultado.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El tamano del repositorio es de 23.1 GB, lo que sugiere que los pesos completos (backbone + decodificadores) requieren una GPU con al menos 24 GB de VRAM para cargar en precision FP16, aunque no se especifica oficialmente.
- GPU recomendadas: no se indican modelos concretos. Dado el tamano del backbone (1.3B) y la necesidad de procesar 81 fotogramas, se espera que funcione en GPUs de gama alta como RTX 3090/4090, A100 o H100, pero no hay confirmacion.
- Compatibilidad con GPU de consumo: no se confirma. El modelo de difusion de video con VAE y UMT5 es computacionalmente intensivo; probablemente requiera al menos 24 GB de VRAM.
- Opciones de despliegue: el repositorio usa la libreria `diffsynth` y proporciona un archivo `vidihand_config.json` para la inferencia de extremo a extremo. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La inferencia implica 34 pasos de difusion sobre 81 fotogramas, lo que sugiere una latencia de varios segundos por clip en GPU de alta gama, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos alternativos de reconstruccion de manos a partir de video. El proyecto original (NTUYWANG103/ViDiHand) es la referencia principal, pero no se proporcionan datos de rendimiento relativos a otros metodos en el material consultado. Se puede mencionar que los metodos tradicionales basados en detectores por fotograma (como MediaPipe o METRO) son alternativas, pero no se dispone de comparaciones cuantitativas.

## Limitaciones y advertencias

- El repositorio es un checkpoint de investigacion privado y su licencia no esta formalmente seleccionada (`license: other`), lo que impide su uso comercial sin autorizacion explicita del autor.
- Los archivos MANO no estan incluidos; es necesario obtenerlos por separado bajo su propia licencia y proporcionarlos en tiempo de ejecucion. No se deben redistribuir los activos MANO desde este repositorio.
- No se proporcionan datos de sesgos, alucinaciones o limitaciones de idioma, ya que no es un modelo de lenguaje. Sin embargo, al ser un modelo de vision, puede presentar errores en condiciones de iluminacion extrema, oclusiones totales o manos fuera del campo de vision.
- La inferencia requiere seguir un contrato de ejecucion muy especifico (81 fotogramas, 30 fps, lado corto 480, dimensiones divisibles por 16, 34 pasos de difusion con CFG 1.0 y seed 0). Desviarse de este contrato puede producir resultados incorrectos.
- El modelo no esta optimizado para tiempo real; la ejecucion de 34 pasos de difusion sobre 81 fotogramas implica una latencia considerable, no apta para aplicaciones interactivas sin hardware especializado.
- No se garantiza la reproducibilidad completa sin el codigo fuente exacto y las revisiones indicadas en el repositorio.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/sambhav-pantheon/vidihand
- Sitio web del proyecto original: https://vidihand.github.io/
- Paper en arXiv: https://arxiv.org/abs/2606.30308
- Repositorio oficial de ViDiHand: https://github.com/NTUYWANG103/ViDiHand
- Repositorio de la replicacion (fuente): https://github.com/Pantheon-Industries-Inc/vidihand-pantheon
