# sgwm/maiiro-gemx

## Resumen

maiiro-gemx es un paquete de pesos en formato ONNX derivado de NVIDIA GEM-X, un sistema de estimación de pose humana en 3D y modelado corporal. No se trata de un modelo de lenguaje, sino de un conjunto de redes especializadas (ViTPose para detección 2D de articulaciones, un módulo de body pose que genera tokens temporales y una red de movimiento) empaquetadas para su ejecución con ONNX Runtime. Lo publica el usuario sgwm como artefacto de soporte para maiiro, una herramienta de análisis de vídeo que descarga estos pesos en el primer uso.

El interés de esta ficha es doble: por un lado, documenta una exportación reproducible de los pesos originales de NVIDIA a ONNX (17,5 GB de repositorio), con verificación numérica por etapas frente a la implementación PyTorch de referencia; por otro, aclara que el modelo base es nvidia/GEM-X y que la licencia resultante es la NVIDIA Open Model License, con componentes auxiliares bajo Apache 2.0 y SAM License.

Es relevante ahora porque permite desplegar el pipeline de captura de movimiento humano de GEM-X sin depender del stack PyTorch original, integrándolo en aplicaciones nativas o en entornos donde ONNX Runtime es el runtime preferido. No hay datos publicados sobre parámetros totales ni longitud de contexto, ya que no es un modelo generativo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de redes: ViTPose (2D), Body Pose (tokens temporales), Motion native77 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; procesa secuencias de vídeo) |
| Tipos de cuantizacion | no disponible (exportación ONNX; el repo no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; tarea de visión) |
| Licencia | NVIDIA Open Model License (pesos); Apache 2.0 (constantes SOMA y código GEM-X); SAM License (parte del código fuente) |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`) y `.npz` para constantes del esqueleto |

## Arquitectura y entrenamiento

El paquete contiene cuatro artefactos. `vitpose/vitpose.onnx` implementa ViTPose para estimación 2D de articulaciones con entrada `imgs` de forma [B,3,256,192] y salida `heatmaps`; se exportó desde `vitpose.pth`. `pose/pose.onnx` corresponde al módulo Body Pose que produce tokens para la red temporal, con entradas `img` [B,3,256,256], `bbx_xys` [B,3] y `K_fullimg` [B,3,3], y salida `pose_tokens`; proviene de `body_s240000.ckpt`. `motion/motion.onnx` es la red temporal Motion native77, que devuelve 655 valores reescalados con estadísticas, exportada desde `motion_native77_e774_s292175.ckpt` y `motion_stats_raw.npz`. Por último, `soma/soma_skeleton.npz` contiene las constantes necesarias para calcular posiciones articulares del modelo corporal SOMA, calculadas con py-soma-x 0.3.3 a partir de nvidia/SOMA-X.

La exportación se realizó desde el código fuente NVlabs/GEM-X (commit `20555befe2`) y los pesos nvidia/GEM-X (`4fce057963`) y nvidia/SOMA-X (`f81a01796f`), mediante los scripts `gemx_export_onnx.py` y `gemx_export_soma.py` del proyecto maiiro. Un detalle técnico destacable es que ViTPose preserva el redondeo bf16 de las positional embeddings rotatorias para coincidir con la versión PyTorch upstream, y que la equivalencia numérica se verifica etapa por etapa con tests de referencia en Rust. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO, ya que el autor no entrena el modelo, solo lo exporta.

## Capacidades

- Estimación 2D de articulaciones humanas por fotograma mediante ViTPose.
- Extracción de tokens de pose corporal a partir de imagen, bounding box y matriz intrínseca de cámara.
- Modelado temporal del movimiento (Motion native77) para secuencias de vídeo.
- Reconstrucción de posiciones articulares en el espacio del modelo corporal SOMA.
- Ejecución con ONNX Runtime, lo que permite despliegue en C++, Rust, Python y otros lenguajes con bindings ONNX.
- Verificación numérica por etapas frente a la implementación PyTorch de referencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Análisis de vídeo deportivo: el pipeline completo (ViTPose + Body Pose + Motion) permite extraer trayectorias articulares 3D de un atleta fotograma a fotograma para calcular ángulos de articulación y detectar compensaciones posturales.
- Captura de movimiento para animación: los tokens de pose y la red temporal generan secuencias de movimiento reutilizables en motores de animación, con la ventaja de ejecutarse en ONNX Runtime dentro de un pipeline de producción.
- Rehabilitación y fisioterapia: la estimación 2D y la reconstrucción SOMA permiten medir rangos de movimiento en grabaciones de pacientes sin depender de hardware especializado.
- Integración en aplicaciones nativas: al estar en ONNX, el modelo puede embeberse en aplicaciones de escritorio o móviles escritas en Rust o C++ sin arrastrar el stack PyTorch.
- Investigación en visión por computador: sirve como referencia reproducible para comparar exportaciones ONNX frente a PyTorch en tareas de pose estimation.
- Preprocesado para modelos generativos de vídeo o avatares: los tokens de pose y movimiento pueden alimentar etapas posteriores de síntesis o retargeting.
- Análisis ergonómico en entornos industriales: evaluación de posturas en puestos de trabajo a partir de vídeo monocámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta verificación de equivalencia numérica entre la exportación ONNX y la implementación PyTorch de referencia, sin métricas de precisión (MPJPE, PCK, etc.) ni de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 17,5 GB, pero el peso en memoria de inferencia depende de la resolución de lote y de si se ejecutan las tres redes simultáneamente.
- GPU recomendadas: no disponible en la documentación; al ser un pipeline de visión con entradas de 256×192 y 256×256, es plausible que quepa en GPUs de consumo, pero el autor no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada por el autor.
- Opciones de despliegue: ONNX Runtime (único runtime documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|
| maiiro-gemx | Ensemble de pose 2D + body pose + motion (export ONNX de GEM-X) | ONNX | NVIDIA Open Model License | Imágenes 256×192 / 256×256 y secuencias | Hugging Face (sgwm/maiiro-gemx) |
| nvidia/GEM-X | Modelo original de captura de movimiento | PyTorch (checkpoints) | NVIDIA Open Model License | Igual que el anterior | Hugging Face (nvidia/GEM-X) |
| nvidia/SOMA-X | Modelo corporal SOMA | PyTorch / py-soma-x | no disponible en la información | no disponible | Hugging Face (nvidia/SOMA-X) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes; cualquier uso en ese sentido es un error de categoría.
- La licencia NVIDIA Open Model License impone condiciones adicionales para uso comercial y obligaciones de atribución (`Notice`); debe revisarse antes de desplegar en producción.
- Parte del código fuente de GEM-X deriva de SAM 3D Body y queda sujeta a la SAM License, lo que puede añadir restricciones adicionales.
- El uso debe ser consistente con los términos Trustworthy AI de NVIDIA.
- Al ser una exportación de terceros (usuario sgwm), no cuenta con el respaldo oficial de NVIDIA; la responsabilidad de validación recae en el integrador.
- No se documentan sesgos, tasas de alucinación (no aplica) ni limitaciones de idioma; sin embargo, los modelos de pose pueden degradarse con oclusiones, iluminación adversa o cuerpos fuera de la distribución de entrenamiento.
- El repositorio es grande (17,5 GB) y la descarga inicial en maiiro puede ser costosa en entornos con ancho de banda limitado.
- Sin métricas de precisión publicadas, no es posible estimar el error de reconstrucción 3D frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/sgwm/maiiro-gemx
- Modelo base: https://huggingface.co/nvidia/GEM-X
- Modelo SOMA: https://huggingface.co/nvidia/SOMA-X
- Código fuente GEM-X: https://github.com/NVlabs/GEM-X
- Proyecto maiiro: https://github.com/sougawa/maiiro
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Términos Trustworthy AI de NVIDIA: https://www.nvidia.com/en-us/agreements/trustworthy-ai/terms/
