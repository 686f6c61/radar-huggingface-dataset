# gulucaptain/zero-wam-roboicl

## Resumen

Zero-WAM fine-tuned on RoboICL es un checkpoint de ajuste fino (fine-tuning) del modelo base `robbyant-research/zero-wam-pretrain`, orientado a robótica manipulativa y publicado por el usuario `gulucaptain` en Hugging Face. El modelo se enmarca en la familia Zero-WAM, un sistema de política visomotora (vision-language-action, VLA) que combina contexto visual RGB, estado medido del robot y objetivos de acción en el marco del mundo, y que se entrena sobre el conjunto de datos RoboICL. El repositorio es privado y funciona como respaldo de checkpoints de entrenamiento, no como una release lista para producción.

La relevancia de esta ficha es limitada pero concreta: documenta un experimento de ajuste fino con LoRA sobre un modelo de robótica, con detalles poco habituales de reproducibilidad (paso de optimizador, tamaño de lote global, número de pares de entrenamiento, hashes de datos). El checkpoint del epoch 6 se encuentra en el paso de optimizador 1.980 y no dispone de tasa de éxito en bucle cerrado medida, por lo que su utilidad práctica queda restringida a investigación y a la reproducción del pipeline de entrenamiento.

El tamaño del repositorio es de 6,0 GB e incluye pesos LoRA y adaptadores entrenados, estados del optimizador y del scheduler, estados aleatorios y configuración de entrenamiento. La inferencia requiere el modelo base y el código de adaptador específico de RoboICL. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zero-WAM (política visomotora basada en modelo base `robbyant-research/zero-wam-pretrain`; detalles internos de la arquitectura no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que el modelo base, el código y el dataset conservan sus respectivas licencias) |
| Formato de pesos | checkpoint PyTorch (`.pt`/`torch.save`) con pesos LoRA y adaptadores; requiere código de adaptador RoboICL para inferencia |
| Modelo base | `robbyant-research/zero-wam-pretrain`, revision `7040c4195df216c900334ef62d5fdcf05c0601aa` |
| Tipo de ajuste | LoRA con rango 106 |
| Paso de optimizador (epoch 6) | 1.980 |
| Presupuesto de entrenamiento | 20 epochs, 6.600 updates |
| Hardware de entrenamiento | 4 x NVIDIA H200 |
| Lote global | 64 (16 pares demo/query por GPU) |
| Tamaño del repositorio | 6,0 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA (rango 106) sobre el checkpoint `zero-wam-pretrain` de `robbyant-research`. La arquitectura interna del modelo base no se detalla en la información disponible, pero la model card describe el flujo de inferencia: la demostración (demo) aporta contexto visual RGB de la tarea, mientras que la consulta (query) aporta RGB observado, estado medido y objetivos de acción en 10 dimensiones en el marco absoluto del mundo (mano/pinza). El entrenamiento combina pérdidas de vídeo, acción y MCP, con activación de checkpointing para reducir el consumo de memoria.

El conjunto de datos RoboICL contiene 3.000 grabaciones y 30.000 pares dirigidos. El split de retención por familia local conserva 21.860 pares de entrenamiento sobre 2.700 grabaciones y 260 pares de validación, excluyendo auto-pares y pares que cruzan el split por familia. El batching de igual longitud presenta 21.120 pares de entrenamiento por epoch, lo que da 330 actualizaciones de optimizador por epoch. El presupuesto configurado es de 20 epochs y 6.600 updates; el snapshot del epoch 6 corresponde al paso 1.980. El entrenamiento se ejecutó en 4 GPU H200 con un lote global de 64 (16 pares demo/query por GPU). No se especifica si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generación de acciones de manipulación robótica a partir de contexto visual RGB y estado medido del robot.
- Condicionamiento por demostración: la demo aporta contexto visual de la tarea y la query aporta la observación actual y el estado medido.
- Predicción de acciones en 10 dimensiones en el marco absoluto del mundo (mano/pinza).
- Ajuste fino con LoRA sobre un modelo base de robótica, lo que permite adaptar el modelo a un conjunto de datos concreto sin reentrenar todos los parámetros.
- Pérdidas multiobjetivo: vídeo, acción y MCP.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): visión RGB sí; otras no disponibles.

## Casos de uso

- Investigación en aprendizaje por imitación robótica: el checkpoint sirve como punto de partida para reproducir el ajuste fino LoRA sobre RoboICL y comparar configuraciones de entrenamiento (rango LoRA, lote global, número de epochs).
- Evaluación de políticas visomotoras en entornos simulados: el modelo puede integrarse en un bucle de simulación que proporcione RGB y estado medido, y comparar las acciones predichas con las de referencia del dataset.
- Adaptación a nuevas tareas de manipulación: el pipeline LoRA permite reentrenar adaptadores sobre un subconjunto de demostraciones específicas de una tarea, manteniendo congelado el modelo base.
- Estudio de generalización por familia de tareas: el split de retención por familia permite medir cómo generaliza el modelo a familias no vistas durante el entrenamiento.
- Reproducción de experimentos con trazabilidad de datos: el hash SHA256 del bundle de datos fuente y la revisión del modelo base permiten reproducir el entrenamiento de forma verificable.
- Desarrollo de infraestructura de entrenamiento distribuido: la configuración documentada (4 x H200, lote global 64, checkpointing de activaciones) sirve como referencia para escalar ajustes finos de modelos de robótica.
- Análisis de pérdidas multiobjetivo: permite estudiar el equilibrio entre pérdida de vídeo, acción y MCP en políticas visomotoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ha medido la tasa de éxito en bucle cerrado para el epoch 6, y que una prueba offline previa de entrada/salida utilizó el checkpoint del paso 1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,0 GB, pero incluye estados del optimizador y del scheduler además de los pesos, por lo que el tamaño de inferencia no puede deducirse directamente.
- GPU recomendadas: no disponible para inferencia. El entrenamiento documentado utilizó 4 x NVIDIA H200.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI; la inferencia requiere el modelo base y el código de adaptador RoboICL).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (políticas visomotoras con ajuste LoRA sobre RoboICL) en la información proporcionada.

## Limitaciones y advertencias

- Repositorio privado: el acceso está restringido y no se garantiza su disponibilidad pública ni su mantenimiento.
- Sin licencia declarada: no se especifica licencia para el checkpoint, lo que impide determinar si el uso comercial está permitido. La model card indica que el modelo base, el código y el dataset conservan sus respectivas licencias, que deben consultarse por separado.
- Sin tasa de éxito en bucle cerrado: no se ha medido el rendimiento real del epoch 6 en un entorno de ejecución, solo se realizó una prueba offline con el checkpoint del paso 1.
- Checkpoint de entrenamiento, no de producción: contiene estados del optimizador, scheduler y estados aleatorios, y debe cargarse solo desde una fuente de confianza (la propia model card lo advierte).
- Dependencia del modelo base y del código de adaptador: la inferencia no es autocontenida; requiere `robbyant-research/zero-wam-pretrain` en la revisión indicada y el código de RoboICL.
- Idiomas y contexto: no disponibles, por lo que no puede evaluarse su comportamiento multilingüe ni su ventana de contexto.
- Riesgo de alucinación: no evaluado en la información disponible; en robótica, el equivalente sería la predicción de acciones no válidas o inseguras, que requeriría validación en bucle cerrado.
- Sesgos: no disponibles; el dataset RoboICL puede introducir sesgos de distribución de tareas, objetos y entornos que no se documentan.
- Sin benchmarks públicos: no es posible comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gulucaptain/zero-wam-roboicl
- Modelo base: https://huggingface.co/robbyant-research/zero-wam-pretrain
- Código Zero-WAM: https://github.com/robbyant-research/Zero-WAM
- Código The Imitator Game: https://github.com/imitator-game/The-Imitator-Game
- Dataset RoboICL (ModelScope): https://modelscope.cn/datasets/xieshanrui/RoboICL
