# atanas1054/SmallDrive

## Resumen

SmallDrive es un modelo vision-language-action (VLA) para conducción autónoma end-to-end, presentado en la conferencia GCPR 2026 por el autor atanas1054. El modelo combina un codificador visual EVA-02-B, un módulo Q-Former3D basado en StreamPETR que extrae 256 tokens de escena y 50 tokens de objeto, un LLM TinyLlama de 1.1B parámetros con adaptadores LoRA y un experto de trayectoria basado en flow matching condicionado por los estados ocultos de la última capa del LLM. El checkpoint publicado deriva de un ajuste fino sobre el modelo base exiawsh/omnidrive_tiny_pretrain.

La propuesta central es eficiente: en lugar de emplear LLMs de gran tamaño, SmallDrive mantiene un backbone lingüístico de 1.1B parámetros y delega la generación de trayectorias en un módulo de flow matching, lo que permite inferencia de trayectoria en aproximadamente 0,36 segundos sobre una única NVIDIA A100. El modelo se entrena sobre nuScenes con anotaciones QA de OmniDrive-nuScenes, cubriendo tanto planificación open-loop como evaluación en el conjunto Turning-nuScenes.

Es relevante por su enfoque híbrido entre razonamiento lingüístico y generación de trayectorias, y por sus resultados competitivos en métricas de planificación (L2 de 0,31 m de media en nuScenes val con protocolo ST-P3). El repositorio de Hugging Face contiene únicamente el checkpoint completo en formato mmdet3d/mmcv de 3,5 GB, sin estado del optimizador, y requiere el código del repositorio de GitHub y la configuración del modelo base para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action híbrida: EVA-02-B (visión) + Q-Former3D (StreamPETR) + TinyLlama 1.1B con LoRA + experto de trayectoria por flow matching condicional |
| Parametros totales | no disponible (el LLM es de 1.1B; el total del sistema no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (uso no comercial, solo investigación y evaluación) |
| Formato de pesos | checkpoint mmdet3d/mmcv (`.pth`, 3,5 GB) |

## Arquitectura y entrenamiento

SmallDrive es una arquitectura VLA compuesta por cuatro bloques principales. El codificador visual es EVA-02-B, que procesa las imágenes de las cámaras del vehículo. A continuación, un Q-Former3D basado en StreamPETR transforma las representaciones visuales en 256 tokens de escena y 50 tokens de objeto, proporcionando una representación estructurada del entorno. Estos tokens se introducen en un LLM TinyLlama de 1.1B parámetros ajustado con LoRA, que actúa como núcleo de razonamiento y fusión multimodal. Finalmente, un experto de trayectoria basado en flow matching condicional toma como condición los estados ocultos de la última capa del LLM y genera la trayectoria de conducción.

El entrenamiento parte del checkpoint exiawsh/omnidrive_tiny_pretrain y se realiza sobre nuScenes con las anotaciones QA de OmniDrive-nuScenes. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es el uso de flow matching condicional para la generación de trayectorias, que sustituye la decodificación autoregresiva de waypoints por un proceso de integración de flujo condicionado por el estado latente del LLM, y el diseño eficiente con un backbone lingüístico compacto.

## Capacidades

- Generación de trayectorias de conducción end-to-end a partir de entrada visual multicámara.
- Razonamiento visual-lingüístico sobre escenas de conducción mediante el LLM TinyLlama.
- Extracción de representaciones estructuradas de escena (256 tokens) y de objetos (50 tokens) mediante Q-Former3D.
- Generación de trayectorias mediante flow matching condicional, con inferencia de aproximadamente 0,36 s en A100.
- Evaluación de planificación open-loop con métricas L2 y tasa de colisión en protocolos ST-P3 y UniAD.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): visión multicámara para conducción; no se documentan otras.

## Casos de uso

- Planificación de trayectorias en vehículos autónomos: el modelo genera waypoints de trayectoria a partir de imágenes de cámara, con latencia de 0,36 s en A100, adecuada para bucles de planificación en tiempo real en prototipos de investigación.
- Evaluación comparativa de algoritmos de conducción end-to-end: sirve como baseline reproducible en nuScenes val con protocolos ST-P3 y UniAD, gracias a los scripts de evaluación incluidos en el repositorio.
- Investigación en modelos VLA eficientes: su combinación de LLM de 1.1B con LoRA y experto de flow matching permite estudiar el equilibrio entre capacidad de razonamiento y coste computacional en entornos académicos con recursos limitados.
- Análisis de representaciones de escena: los 256 tokens de escena y 50 tokens de objeto pueden reutilizarse para tareas auxiliares de percepción o para interpretar qué información retiene el modelo.
- Desarrollo de sistemas de conducción en simulación: el checkpoint puede integrarse en pipelines de evaluación open-loop sobre datos de nuScenes para validar variantes de arquitectura o estrategias de entrenamiento.
- Estudio de flow matching aplicado a planificación: el experto de trayectoria condicional es un componente aislable para investigar métodos generativos de trayectorias frente a decodificadores autoregresivos.
- Prototipado académico de asistentes de conducción: el modelo puede emplearse en entornos de investigación para explorar la fusión entre razonamiento lingüístico y control de trayectoria, siempre bajo la licencia no comercial.

## Benchmarks y rendimiento

| Benchmark | Métrica | 1 s | 2 s | 3 s | Media |
|---|---|---|---|---|---|
| nuScenes val (ST-P3) | L2 (m) ↓ | 0,14 | 0,28 | 0,50 | 0,31 |
| nuScenes val (ST-P3) | Colisión (%) ↓ | 0,02 | 0,11 | 0,31 | 0,15 |
| Turning-nuScenes val (UniAD) | L2 (m) ↓ | 0,20 | 0,59 | 1,38 | 0,72 |
| Turning-nuScenes val (UniAD) | Colisión (%) ↓ | 0,00 | 0,00 | 0,17 | 0,06 |

Latencia de inferencia de trayectoria: aproximadamente 0,36 s en una única NVIDIA A100.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 3,5 GB y el LLM es de 1.1B parámetros, por lo que se estima un consumo moderado, pero no se publica una cifra oficial.
- GPU recomendadas: NVIDIA A100 (latencia medida de 0,36 s); no se documentan otras GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el modelo se ejecuta mediante el código del repositorio de GitHub con mmdet3d/mmcv y `tools/dist_test.sh`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,36 s por inferencia de trayectoria en A100; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmallDrive | LLM 1.1B + módulos (total no disponible) | no disponible | VLA con flow matching sobre nuScenes | NVIDIA License (no comercial) | Checkpoint en HF + código en GitHub |
| OmniDrive (base) | no disponible | no disponible | VLA para conducción end-to-end | NVIDIA License | Repositorio NVlabs |
| omnidrive_tiny_pretrain | LLM 1.1B | no disponible | Preentrenamiento VLA (modelo base de SmallDrive) | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada, por lo que no se incluyen cifras comparativas de rendimiento.

## Limitaciones y advertencias

- Licencia NVIDIA License: uso restringido a investigación y evaluación, prohibido el uso comercial.
- El repositorio contiene únicamente el checkpoint `.pth`; es necesario descargar el código de GitHub y la carpeta de configuración del modelo base `exiawsh/omnidrive_tiny_pretrain` para poder ejecutarlo.
- No se documentan sesgos conocidos, pero al entrenarse sobre nuScenes (dataset de conducción con distribución geográfica y de condiciones específicas) es probable que generalice mal a otros entornos no representados.
- Riesgo de alucinación en las salidas del LLM: no se han publicado evaluaciones de fidelidad de las respuestas textuales.
- Limitaciones de contexto e idioma: no disponibles; no se especifican idiomas soportados.
- Resultados de planificación open-loop: no se garantiza su comportamiento en bucle cerrado ni en despliegue real.
- El modelo está pensado para investigación; no debe usarse en sistemas de conducción en producción sin validación adicional.
- No se documentan métodos de cuantización ni soporte para frameworks de inferencia optimizados, lo que limita su despliegue fuera del stack mmdet3d/mmcv.

## Enlaces

- Hugging Face: https://huggingface.co/atanas1054/SmallDrive
- Repositorio GitHub: https://github.com/atanas1054/SmallDrive
- Configuración del modelo: https://github.com/atanas1054/SmallDrive/blob/main/projects/configs/SmallDrive/smalldrive.py
- Licencia: https://github.com/atanas1054/SmallDrive/blob/main/LICENSE
- Modelo base: https://huggingface.co/exiawsh/omnidrive_tiny_pretrain
- OmniDrive (NVlabs): https://github.com/NVlabs/OmniDrive
