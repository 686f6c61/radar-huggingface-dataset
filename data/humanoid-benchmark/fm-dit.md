# humanoid-benchmark/fm-dit

## Resumen

FM-DiT es un checkpoint de política robótica basado en flow matching con arquitectura Diffusion Transformer (DiT), desarrollado por el proyecto Humanoid Benchmark. No es un modelo de lenguaje: es una política de imitación entrenada para controlar el robot humanoide Unitree G1 en una tarea concreta de transferencia de cesta (basket transfer). El modelo combina un codificador visual ResNet18 preentrenado en ImageNet con un backbone de acciones DiT con modulación AdaLN, dimensión oculta 384, 4 capas y 8 cabezas de atención, y genera acciones mediante 10 pasos de muestreo midpoint.

El checkpoint publicado corresponde a la variante "A20 pre-reach trim v2", entrenada con 100 demostraciones (54.433 fotogramas) del dataset `a20-basket-transfer-pre-reach-trim-expert-v2`, con batch de 512, 4.000 pasos de optimizador, semilla 0 y pesos EMA (decay 0,9999). El repositorio incluye un snapshot del código de inferencia (`hb_baselines/1`) y verificación SHA-256, lo que facilita la reproducibilidad.

Su relevancia es acotada pero clara: sirve como referencia reproducible para investigación en imitación robótica con flow matching sobre humanoides, y como baseline dentro del ecosistema Humanoid Benchmark. No está pensado para uso general, despliegue conversacional ni tareas fuera de su distribución de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching y modulación AdaLN; codificador visual ResNet18 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de estado e imágenes por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch), más `config.json` y `protocol.json`; formato `hb_baselines/1` |

Parámetros adicionales relevantes:

| Parámetro | Valor |
|---|---|
| Dimensión oculta del DiT | 384 |
| Capas del DiT | 4 |
| Cabezas de atención | 8 |
| Pasos de muestreo | 10 (midpoint) |
| Entrada de estado | Unitree G1 `state44` |
| Entradas visuales | `ego_view` y `chest`, redimensionadas a 168 x 224 |
| Salida | 16 acciones de dimensión 76 (64 valores de motion-token SONIC + 6 valores medidos por cada mano INSPIRE) |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La política sigue un esquema de imitación con flow matching. Un codificador ResNet18, inicializado con pesos de ImageNet y ajustado finamente, procesa dos vistas RGB (`ego_view` y `chest`) a 168 x 224 píxeles. El estado del robot (vector `state44` del Unitree G1) se combina con las características visuales para alimentar un backbone DiT de 4 capas, dimensión 384 y 8 cabezas, con modulación AdaLN. La generación de acciones usa 10 pasos de muestreo midpoint, y la salida son 16 acciones de dimensión 76 que incluyen 64 valores de motion-token SONIC y 6 valores medidos por cada mano INSPIRE. La normalización está almacenada dentro de los pesos.

El entrenamiento se realizó sobre 100 demostraciones (54.433 fotogramas) del dataset `a20-basket-transfer-pre-reach-trim-expert-v2`, con batch 512, 4.000 pasos de optimizador, semilla 0, pesos EMA (decay 0,9999) y la augmentación v2 de Humanoid Benchmark. El checkpoint excluye el estado del optimizador y de reanudación. Las métricas offline de `config.json` se calculan sobre fotogramas de entrenamiento y no son tasas de éxito en bucle cerrado ni sobre datos retenidos, por lo que no deben interpretarse como rendimiento de tarea.

## Capacidades

- Generación de acciones motoras para el humanoide Unitree G1 en la tarea de transferencia de cesta.
- Política de imitación multimodal: combina estado propioceptivo (`state44`) con dos vistas RGB.
- Control de manos INSPIRE mediante 6 valores medidos por mano en la salida.
- Generación de motion-tokens SONIC (64 valores) para el control del cuerpo.
- Inferencia determinista vía flow matching con 10 pasos de muestreo midpoint.
- Carga estricta en CPU verificada, con comprobación SHA-256 de los pesos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de baseline en investigación: cargar el checkpoint con `BaselinePolicy` y comparar nuevas variantes de políticas de imitación contra este resultado de referencia en la misma tarea.
- Estudio de flow matching en robótica: analizar el efecto de los 10 pasos midpoint y de la modulación AdaLN en la calidad de las trayectorias generadas.
- Evaluación de codificadores visuales: sustituir o comparar el ResNet18 con otros encoders manteniendo el backbone DiT para aislar el impacto de la representación visual.
- Análisis de robustez ante variaciones de cámara: probar la política con las vistas `ego_view` y `chest` bajo condiciones de iluminación o encuadre distintas a las de entrenamiento.
- Desarrollo de pipelines de evaluación en bucle cerrado: usar el checkpoint como política de referencia dentro de un simulador o banco de pruebas para medir tasas de éxito reales, dado que las métricas publicadas son offline.
- Estudio de destilación o reducción de pasos: partir de este modelo con 10 pasos de muestreo para investigar políticas de acción más rápidas con menos pasos.
- Verificación de reproducibilidad: emplear `protocol.json` y `SHA256SUMS` para validar la integridad de los pesos en entornos de investigación colaborativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las métricas incluidas en `config.json` corresponden a fotogramas de entrenamiento y no constituyen tasas de éxito en bucle cerrado ni evaluaciones sobre datos retenidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,1 GB y la carga estricta en CPU está verificada, por lo que la inferencia es viable sin GPU.
- GPU recomendadas: no disponibles. Un backbone DiT de 4 capas y 384 dimensiones junto con un ResNet18 es un modelo ligero; cualquier GPU consumer moderna debería poder ejecutarlo, aunque no se han publicado requisitos oficiales.
- Cabe en GPU consumer: sí, previsiblemente, dado el reducido tamaño del checkpoint y la verificación de carga en CPU; no se especifican modelos concretos.
- Opciones de despliegue: el repositorio proporciona su propio runtime (`hb_baselines/1`) con la clase `BaselinePolicy`, cargable desde el directorio raíz del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de Humanoid Benchmark ni políticas comparables con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo específico de una única tarea (transferencia de cesta) y un único robot (Unitree G1); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- Las métricas de `config.json` se calculan sobre fotogramas de entrenamiento; no reflejan éxito en bucle cerrado ni generalización a datos retenidos.
- Entrenado con solo 100 demostraciones (54.433 fotogramas), lo que limita la diversidad de condiciones cubiertas.
- Sin licencia especificada: no se puede asumir permiso para uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin información sobre sesgos, aunque al ser una política robótica los riesgos se centran en fallos de control y comportamientos inseguros fuera de distribución.
- Riesgo de sobreajuste a las condiciones visuales y de estado de las demostraciones; el rendimiento puede degradarse con cambios de iluminación, encuadre o dinámica del robot.
- Requiere el entorno de dependencias registrado en `code/hb_baselines_v1/requirements`; versiones distintas pueden romper la carga.
- Excluye estado de optimizador y reanudación, por lo que no sirve para continuar el entrenamiento tal cual.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento simbólico.

## Enlaces

- Hugging Face: https://huggingface.co/humanoid-benchmark/fm-dit
- Checkpoint A20 pre-reach trim v2: https://huggingface.co/humanoid-benchmark/fm-dit/tree/main/a20-basket-transfer/b512-trimv2/step-004000
- Dataset de entrenamiento: https://huggingface.co/datasets/humanoid-benchmark/a20-basket-transfer-pre-reach-trim-expert-v2
- Código de inferencia incluido en el repositorio: `code/hb_baselines_v1/` (dentro del repositorio de Hugging Face)
