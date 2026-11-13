# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_arep4_ema

## Resumen

`cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_arep4_ema` es un modelo de política de acción para robótica publicado por el usuario Myungkyu en Hugging Face. Se trata de un fine-tuning del modelo de mundo de vídeo Cosmos3-Nano, al que se le acopla un DiT de acción externo mediante condicionamiento unidireccional vídeo-a-acción y un calendario de acciones compartido, con el objetivo de habilitar control robótico en bucle cerrado. El modelo se distribuye bajo la librería `cosmos-framework` y la pipeline declarada es `robotics`.

El entrenamiento se realizó sobre el dataset RoboDojo Sim en formato LeRobot v3.0, con un total de 60.000 pasos (indicado por el sufijo `60k`) y un tamaño de batch de 64 (`b64`). El nombre también indica una profundidad de 36 capas (`l36`) y una dimensión oculta de 1024 (`d1024`), así como un arranque desde cero (`scratch`) con una tasa de repetición de acciones de 4 (`arep4`). Los pesos publicados corresponden a la media móvil exponencial (EMA) del checkpoint final de entrenamiento, convertidos a bf16.

La relevancia de este modelo radica en que ejemplifica la tendencia de adaptar modelos de mundo generativos de vídeo (familia Cosmos) a tareas de control robótico mediante cabezas de acción especializadas. Sin embargo, la información pública es muy escasa: no hay model card detallada, ni benchmarks, ni licencia declarada, y el repositorio tiene cero descargas y cero likes en el momento de redactar esta ficha, lo que limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano con DiT de acción externo (condicionamiento vídeo-a-acción unidireccional) |
| Parametros totales | no disponible (el nombre sugiere 36 capas y dimensión 1024, pero no se declara el recuento total) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) en bf16; archivos `model/__0_0.distcp` y `model/.metadata` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un modelo de mundo de vídeo de la familia Cosmos, y le añade un DiT de acción externo que recibe condicionamiento unidireccional desde el vídeo y comparte el calendario de acciones con el modelo base. Esta configuración está pensada para control robótico en bucle cerrado: el modelo de mundo genera representaciones de vídeo y el DiT de acción las traduce en comandos motores. El nombre del checkpoint indica una profundidad de 36 capas y una dimensión de 1024, un batch de 64 y 60.000 pasos de entrenamiento, con arranque desde cero (`scratch`) y una tasa de repetición de acciones de 4 (`arep4`).

El entrenamiento se realizó sobre RoboDojo Sim en formato LeRobot v3.0. Los pesos publicados son los de la EMA del checkpoint final, convertidos a bf16 y almacenados como un checkpoint DCP de un solo rango, sin estado del optimizador. El repositorio incluye un `config.yaml` con la configuración de entrenamiento (rutas locales sustituidas por marcadores de posición) y un archivo `SHA256SUMS` con los hashes de todos los ficheros. No se detalla la composición del dataset, el número de tokens ni si hubo RLHF o DPO; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico en bucle cerrado: genera acciones motoras a partir de observaciones de vídeo mediante el DiT de acción acoplado al modelo de mundo.
- Modelado de mundo de vídeo: hereda de Cosmos3-Nano la capacidad de generar y representar dinámicas visuales.
- Condicionamiento vídeo-a-acción: el flujo de información es unidireccional desde el vídeo hacia la acción, con un calendario de acciones compartido.
- Integración con el servidor de políticas de acción de `cosmos-framework`, que carga el checkpoint y el `config.yaml`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el modelo no es de lenguaje natural).
- Capacidades especiales: no se documentan modos de pensamiento, visión general, audio ni otras modalidades fuera del vídeo y la acción.

## Casos de uso

- Manipulación robótica simulada: el modelo puede entrenarse y evaluarse en RoboDojo Sim para tareas de agarre y colocación, aprovechando el condicionamiento vídeo-a-acción para traducir observaciones visuales en comandos motores.
- Investigación en modelos de mundo para robótica: sirve como base para estudiar cómo las representaciones de vídeo de Cosmos3-Nano se transfieren a políticas de acción en entornos simulados.
- Control en bucle cerrado en laboratorio: con el servidor de políticas de `cosmos-framework`, se puede desplegar el checkpoint para cerrar el bucle percepción-acción en un robot simulado o real, siempre que se disponga del VAE de Wan2.2.
- Fine-tuning sobre nuevos datasets LeRobot: el `config.yaml` incluido facilita reutilizar la receta de entrenamiento con otros conjuntos de datos en formato LeRobot v3.0.
- Evaluación de políticas de acción con repetición de acciones: la tasa `arep4` permite probar estrategias de ejecución de acciones repetidas en tareas de control de baja frecuencia.
- Reproducibilidad de experimentos: los hashes SHA-256 y la configuración publicada permiten verificar la integridad de los pesos y reproducir la carga del modelo en el servidor de acción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 32,0 GB en bf16, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos completos, más la memoria del VAE de Wan2.2 y del servidor de políticas.
- GPU recomendadas: no disponible; por el tamaño del checkpoint, se requiere una GPU con 40 GB o más de VRAM (A100 40/80 GB, H100, o varias GPU consumer con agregación de memoria).
- ¿Cabe en GPU consumer?: no de forma directa en bf16 con 32 GB de pesos; sería necesario cuantizar o usar técnicas de descarga a CPU, no documentadas.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` con `--checkpoint-path <repo> --config-file config.yaml`; requiere un fichero local `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_arep4_ema | no disponible (36 capas, dim. 1024) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Cosmos3-Nano (modelo base) | no disponible | no disponible | no disponible | no disponible | Referenciado como base, sin ficha detallada en la información |
| Wan2.2-TI2V-5B (proveedor del VAE) | no disponible | no disponible | no disponible | no disponible | Hugging Face (Wan-AI) |
| Otras políticas robóticas basadas en modelos de mundo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública muy escasa: no hay model card detallada, ni licencia, ni idiomas, ni benchmarks, lo que impide evaluar su calidad y adecuación para producción.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue.
- Entrenado exclusivamente en RoboDojo Sim: el rendimiento en entornos reales o en otros simuladores no está documentado y probablemente requiera fine-tuning adicional.
- Riesgo de alucinación visual y de acciones incorrectas: al ser un modelo generativo de vídeo adaptado a acción, puede producir trayectorias no físicas o inconsistentes, especialmente fuera de la distribución de entrenamiento.
- Dependencia de un VAE externo (Wan2.2_VAE.pth): la carga requiere un fichero que no se incluye en el repositorio, lo que añade un paso de configuración y una dependencia de terceros.
- Formato de pesos DCP de un solo rango: no es un formato estándar de inferencia (safetensors/GGUF) y requiere el servidor de `cosmos-framework` para cargarlo.
- Sesgos conocidos: no documentados; al entrenarse en simulación, puede heredar sesgos de los entornos y tareas de RoboDojo Sim.
- Repositorio con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Advertencia de seguridad: el uso en robots reales requiere validación exhaustiva y medidas de seguridad física, dado que no se documentan límites de par, velocidades ni protocolos de parada.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_arep4_ema
- VAE de referencia (Wan-AI/Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Dataset RoboDojo Sim (LeRobot v3.0): no disponible (no se proporciona enlace directo)
- Paper o blog de Cosmos3-Nano: no disponible
- Repositorio de `cosmos-framework`: no disponible
