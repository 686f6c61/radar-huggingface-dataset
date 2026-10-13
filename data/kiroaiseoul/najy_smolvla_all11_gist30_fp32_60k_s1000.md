# kiroaiseoul/NAJY_smolvla_all11_gist30_fp32_60k_s1000

## Resumen

NAJY_smolvla_all11_gist30_fp32_60k_s1000 es un checkpoint de politica robótica entrenado por el usuario kiroaiseoul y publicado en Hugging Face bajo la librería LeRobot. Se trata de un ajuste fino de un modelo visión-lenguaje-acción (VLA) de la familia SmolVLA, con 450.046.176 parámetros reales declarados en los pesos safetensors y un repositorio de 1,2 GB. El checkpoint corresponde al paso 60.000 de la ejecución interna `sv_all11_gist30_fp32_s1000_deploy`, entrenada según la model card en un equipo identificado como DGX_1.

El modelo resuelve el problema clásico de la robótica de manipulación: mapear observaciones multimodales (estado del robot y tres cámaras) a comandos de acción de 16 dimensiones. Sus entradas declaradas son `observation.state` (vector de 16), tres flujos de imagen de 3x480x640 (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) y una salida `action` de 16 dimensiones, lo que encaja con una plataforma móvil de doble brazo del ecosistema Trossen Mobile AI. Es relevante ahora porque se enmarca en la tendencia de modelos VLA pequeños (en torno a 450M de parámetros) que pueden ejecutarse en hardware asequible, en contraste con alternativas de miles de millones de parámetros.

Conviene subrayar que el propio autor lo describe como una subida con fines de análisis y puntuación, no como una versión confirmada para despliegue real en robot. Además, existe una discrepancia de etiquetado: el nombre del repositorio y el tag principal remiten a SmolVLA, mientras que la model card (en coreano) lo describe como un "checkpoint ACT de 11 etapas". El repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) de la familia SmolVLA, segun tags y nombre; la model card lo describe como checkpoint ACT. Detalle interno no disponible |
| Parametros totales | 450.046.176 (dato real de safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en fp32, segun el nombre de la ejecucion `..._fp32_...`) |
| Idiomas soportados | no disponible (interfaz de robot; no se declaran capacidades de lenguaje natural evaluadas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `5287f648921999032d3c8da48cb3380852180c641a0972895b1ed5bfe4cb79d0`) |

## Arquitectura y entrenamiento

No se dispone de una descripción arquitectónica detallada en la información proporcionada. Los tags del repositorio (`lerobot`, `act`, `robotics`, `trossen-mobile-ai`) y el nombre del modelo apuntan a un ajuste fino de SmolVLA, un VLA pequeño y eficiente presentado en el artículo arXiv 2506.01844, cuyo objetivo declarado es reducir drásticamente los costes de entrenamiento e inferencia manteniendo un rendimiento competitivo. La model card, sin embargo, describe el artefacto como un "checkpoint ACT de 11 etapas", lo que sugiere que el autor emplea terminología de ACT (Action Chunking Transformer) para referirse al componente de política, o que el pipeline combina un backbone VLA con un decodificador de acciones. No es posible confirmar cuál de las dos lecturas es la correcta con los datos disponibles.

En cuanto al entrenamiento, la información se limita a metadatos operativos: ejecución `sv_all11_gist30_fp32_s1000_deploy`, paso 60.000, precisión fp32 y un sufijo `gist30` que sugiere el uso de 30 tokens de tipo gist (resumen visual) como entrada. Las features declaradas confirman un espacio de observación con estado propioceptivo de 16 dimensiones y tres cámaras RGB de 480x640, y un espacio de acción de 16 dimensiones. No se especifican el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia al ecosistema trossen-ai-simulation, documento `docs/mobile_base_investigation.md` §94), ni si se aplicaron etapas de RLHF, DPO o métodos de optimización por preferencias. Tampoco hay información sobre técnicas de decodificación especulativa, atención lineal u otras innovaciones de inferencia.

## Capacidades

- Generación de acciones de control robótico: mapea estado propioceptivo (16 dimensiones) e imágenes de tres cámaras a un vector de acción de 16 dimensiones, apto para control de manipulador y base móvil.
- Percepción visual multi-cámara: procesa simultáneamente una vista cenital o de torso (`cam_high`) y dos vistas de muñeca (`cam_left_wrist`, `cam_right_wrist`) a resolución 480x640.
- Condicionamiento multimodal: integra observación visual y estado del robot en una única política, según el esquema de features declarado.
- Uso de representaciones gist: el sufijo `gist30` del nombre de la ejecución indica compresión de la información visual a 30 tokens, lo que reduce el coste computacional de la política.
- Compatibilidad con el ecosistema LeRobot: el checkpoint sigue la estructura `pretrained_model`, por lo que puede cargarse con las herramientas estándar de LeRobot y con scripts de diagnóstico del autor (`stage_cond_diag.py`).
- Integridad verificable: la model card publica el sha256 de `model.safetensors` y un `multi_manifest.json` con flags de configuración, lo que permite auditar que el artefacto descargado es el entrenado.
- Tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, modo thinking, visión general o audio: no disponibles. No hay evidencia de que el modelo exponga estas capacidades; está especializado en control robótico.

## Casos de uso

- Manipulación con brazo robótico de doble muñeca: el modelo está entrenado con dos vistas de muñeca y una vista de contexto, de modo que puede ejecutar tareas bimanuales (recoger, colocar, insertar) emitiendo comandos de 16 dimensiones coherentes con las tres cámaras.
- Control de plataforma móvil con base y brazo: el tag `trossen-mobile-ai` y la referencia a `mobile_base_investigation.md` indican que el checkpoint está pensado para robots con base móvil, donde el vector de acción de 16 dimensiones cubre tanto desplazamiento como articulaciones.
- Investigación en políticas VLA pequeñas: con 450M de parámetros, sirve como punto de partida reproducible para estudiar el efecto del número de etapas de acción, la resolución de entrada o la compresión gist en el éxito de la tarea.
- Evaluación comparativa de checkpoints ACT/VLA: el autor publica varios checkpoints hermanos (por ejemplo `NAJY_act_all11_hot_27D_120k_s1000` y `NAJY_act_all11_c100_m1_aff_27D_60k_s1000`), lo que permite comparar variantes bajo el mismo pipeline y herramienta de puntuación.
- Reproducción de experimentos con LeRobot: al seguir la estructura `pretrained_model`, se puede cargar en LeRobot y reentrenar o evaluar en simulación sin adaptaciones del formato.
- Auditoría de artefactos de entrenamiento: gracias al sha256 publicado y al `multi_manifest.json`, es utilizable en flujos de verificación de integridad de pesos dentro de pipelines de MLOps robótico.
- Aprendizaje por imitación sobre datos propios: siguiendo la recomendación de los autores de SmolVLA de grabar del orden de 50 episodios por tarea, este checkpoint puede servir de inicialización para ajustar una política nueva con pocas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, ni métricas de error de acción, ni comparaciones con otros checkpoints; únicamente metadatos de entrenamiento y de integridad de los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 450 millones de parámetros ocupan aproximadamente 1,8 GB, a los que hay que sumar activaciones de tres cámaras a 480x640 y el coste del codificador visual. En fp16/bf16 bajaría a unos 0,9 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería poder cargar los pesos; para inferencia a frecuencia de control alta se recomiendan GPUs tipo RTX 4090, A100 o H100, con especial ventaja para las de mayor ancho de banda.
- Cabe en GPU de consumo: sí, por tamaño de parámetros es apto para GPUs de consumo actuales (RTX 3060 12 GB, RTX 4070, RTX 4090). La viabilidad en tiempo real depende del presupuesto de latencia del bucle de control, que no se especifica.
- Opciones de despliegue: LeRobot es la vía natural, dado que el repositorio usa la librería `lerobot` y la estructura `pretrained_model`. No se ha confirmado soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas de acción.
- Latencia y throughput estimados: no disponibles. El nombre de la ejecución indica precisión fp32, lo que sugiere que la inferencia no se ha optimizado con cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_smolvla_all11_gist30_fp32_60k_s1000 (este) | 450.046.176 | no disponible | no publicado | apache-2.0 | Hugging Face, 0 descargas |
| SmolVLA base (referencia del articulo 2506.01844) | 450M aprox. (VLA pequeno) | no disponible | competitivo segun el paper, cifras no disponibles en esta busqueda | no disponible en la informacion recogida | Hugging Face / LeRobot |
| kiroaiseoul/NAJY_act_all11_hot_27D_120k_s1000 | no disponible | no disponible | no publicado | no disponible | Hugging Face |
| kiroaiseoul/NAJY_act_all11_c100_m1_aff_27D_60k_s1000 | no disponible | no disponible | no publicado | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes; la comparación se limita a la identidad de los repositorios y al hecho de compartir el ecosistema LeRobot y el sufijo `all11`.

## Limitaciones y advertencias

- Estado del artefacto: la propia model card indica que la subida es para análisis y puntuación, y que no equivale a una confirmación de despliegue real en robot. No debe tratarse como una versión lista para producción.
- Ambigüedad de arquitectura: el repositorio mezcla el tag `act` con un nombre que apunta a SmolVLA. Cualquier integración debería verificar empíricamente qué tipo de política se carga antes de asumir un comportamiento concreto.
- Ausencia de métricas: no hay tasas de éxito, curvas de aprendizaje ni comparaciones publicadas, por lo que no es posible estimar el rendimiento real de la política.
- Riesgo de sobreajuste al entorno de entrenamiento: al ser un ajuste fino sobre datos de simulación del ecosistema trossen-ai-simulation, es probable que la política degrade su comportamiento ante cambios de iluminación, cámara, fricción o morfología del robot. La model card no documenta ninguna evaluación de transferencia.
- Idiomas y lenguaje natural: no se declaran capacidades multilingües ni de conversación. No debe usarse como modelo de lenguaje.
- Dependencia de la configuración exacta: las features de entrada (16 de estado, tres cámaras 480x640, acción de 16) están fijadas. Alimentar el modelo con otra disposición de cámaras, resolución o dimensión de estado probablemente produzca fallos silenciosos.
- Verificación obligatoria de integridad: conviene comprobar `sha256sum model.safetensors` contra `5287f648921999032d3c8da48cb3380852180c641a0972895b1ed5bfe4cb79d0` antes de usar el checkpoint, ya que el autor publica el hash precisamente para ese control.
- Licencia: apache-2.0 permite uso comercial, pero esa licencia cubre el artefacto publicado, no necesariamente los datos de entrenamiento subyacentes ni los pesos base de SmolVLA. No se especifica el régimen de licencia del modelo base ni del dataset empleado.
- Sin tracción comunitaria: 0 descargas y 0 likes implican que no ha sido validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/NAJY_smolvla_all11_gist30_fp32_60k_s1000
- Checkpoint hermano: https://huggingface.co/kiroaiseoul/NAJY_act_all11_hot_27D_120k_s1000
- Checkpoint hermano: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_m1_aff_27D_60k_s1000
- Articulo SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Fork de referencia: https://github.com/zyqdragon/lerobot_smolvla
