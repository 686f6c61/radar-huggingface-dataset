# Dongkkka/Task_000759_Move_Vegetable_Whiteroom_TurboVLA-bs8-step2500

## Resumen

Este artefacto es un checkpoint de entrenamiento de TurboVLA, un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario Dongkkka. Corresponde al paso de optimización 2.500 (batch size 8) de un entrenamiento sobre el conjunto `Task_000759_Move_Vegetable_Whiteroom_Leardboard_MCAP_lerobot_v30`, destinado al robot SG2. No se trata de un modelo de lenguaje generalista, sino de una política robótica especializada en una única tarea de manipulación ("mover un vegetal" en un entorno de habitación blanca), por lo que su interés es fundamentalmente experimental y de evaluación.

El modelo consume tres cámaras RGB (cabeza izquierda, muñeca izquierda y muñeca derecha) junto con un vector de estado de 22 dimensiones, y produce acciones absolutas de articulación y base también de 22 dimensiones, con un horizonte de acción de 50 pasos. La arquitectura se apoya en el stack StarVLA/TurboVLA e integra un encoder de texto BERT, un encoder visual DINOv3 ViT-L y componentes de GroundingDINO, según se deduce de las rutas de configuración indicadas en la model card.

Su relevancia es limitada y muy específica: sirve como checkpoint reproducible para el benchmark RoboTwin y como base para experimentos de ajuste fino o comparación de políticas VLA en el robot SG2. El propio autor advierte de que el artefacto no ha sido validado en robot real y que se trata del checkpoint guardado del entrenamiento. El repositorio tiene 3,5 GB, cero descargas y cero "likes" en el momento de redactar esta ficha, y no se declara licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en el stack StarVLA/TurboVLA; incluye encoder de texto BERT, encoder visual DINOv3 ViT-L y componentes de GroundingDINO |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos PyTorch completos, sin versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); no se distribuyen safetensors ni GGUF |

Datos adicionales del contrato del modelo, extraídos de la model card:

| Parametro | Valor |
|---|---|
| Paso de optimizacion | 2.500 |
| Batch size de entrenamiento | 8 |
| Observaciones | 3 cámaras RGB (cabeza izquierda, muñeca izquierda, muñeca derecha) + estado de 22 dimensiones |
| Acciones | 22 dimensiones absolutas (articulaciones y base) |
| Horizonte de acción | 50 |
| Checkpoint recomendado | `steps_2500_ema_pytorch_model.pt` (EMA) |
| Revisión del runtime | `a3365e8f1787d30bafd99d2806edbf4dc82b5370` |
| Tamano del repositorio | 3,5 GB |

## Arquitectura y entrenamiento

La información disponible describe un modelo de la familia TurboVLA (implementado sobre el framework StarVLA) con una arquitectura de visión-lenguaje-acción. Los componentes explícitamente mencionados en las opciones de configuración son un encoder de texto BERT (`framework.text.bert_path`, con `bert-base-uncased` como valor de ejemplo), un encoder visual DINOv3 (`framework.vision.model_path`, con `dinov3-vitl` como ejemplo) y un módulo de inicialización GroundingDINO que puede omitirse durante la carga pasando `framework.initialization.load_pretrained=false`. No se detalla el número de parámetros, la composición exacta del transformer de política ni si emplea mecanismos adicionales como decodificación especulativa o atención lineal.

En cuanto al entrenamiento, la model card indica únicamente el paso de optimización (2.500), el tamaño de lote (8) y el conjunto de datos empleado, `Task_000759_Move_Vegetable_Whiteroom_Leardboard_MCAP_lerobot_v30`, en formato LeRobot v3.0. No se especifica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias humanas, algo por otro lado poco habitual en políticas robóticas. Sí se documenta una innovación operativa relevante: se publica tanto el checkpoint bruto de entrenamiento (`steps_2500_pytorch_model.pt`) como una versión con media móvil exponencial de los pesos (`steps_2500_ema_pytorch_model.pt`), siendo esta última la recomendada para inferencia. El repositorio incluye además `config.yaml`, `config.full.yaml` y `dataset_statistics.json`, este último con las estadísticas de normalización de estados y acciones, imprescindibles para que las acciones predichas sean interpretables.

## Capacidades

- Generacion de acciones robóticas: produce trayectorias de 22 dimensiones (articulaciones y base) con horizonte de 50 pasos a partir de observaciones visuales y de estado.
- Fusión multimodal: combina tres flujos de imagen RGB con un vector de estado proprioceptivo de 22 dimensiones.
- Condicionamiento por lenguaje: al integrar un encoder BERT, el modelo puede condicionarse mediante instrucciones textuales de tarea, aunque el alcance exacto depende de la configuración de entrenamiento no publicada.
- Ejecución como servidor de política: se despliega mediante `scripts/robotwin/run_policy_server.sh` y `server_policy.py`, exponiendo la política a un cliente de evaluación.
- Integración con LeRobot: el dataset de entrenamiento sigue el formato LeRobot v3.0, lo que facilita su reutilización en ese ecosistema.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, matemáticas, código, visión general, audio ni modo de "pensamiento" explícito. Se trata de una política especializada, no de un asistente conversacional.

## Casos de uso

- Evaluación en el benchmark RoboTwin: el checkpoint se carga con `run_policy_server.sh` sobre el puerto 5694 y se somete a la tarea Task_000759 en simulación, permitiendo medir la tasa de éxito de la política entrenada en el paso 2.500.
- Reproducción de resultados experimentales: al publicarse los hashes SHA-256 de ambos checkpoints y la revisión exacta del runtime, un tercero puede verificar que reproduce las mismas salidas con la misma configuración.
- Punto de partida para ajuste fino: sirve como inicialización para entrenar variantes de la misma tarea con más pasos, otros conjuntos de datos o distintas condiciones de iluminación y disposición de objetos.
- Estudio de políticas VLA en robótica de manipulación: permite analizar cómo se comporta una política con horizonte de acción 50 y espacio de acción de 22 dimensiones frente a alternativas con horizontes más cortos.
- Comparación entre checkpoint bruto y EMA: al publicarse ambas versiones, se puede cuantificar la diferencia de rendimiento entre los pesos finales del entrenamiento y su media móvil exponencial, práctica habitual para evaluar estabilidad del entrenamiento.
- Integración en pipelines de simulación a gran escala: desplegado como servidor de política, puede consultarse desde múltiples clientes simultáneos para generar grandes volúmenes de datos de rollout sintéticos.
- Base para destilación o compresión: dado que el stack incluye un encoder visual tipo ViT-L, es un candidato razonable para experimentos de destilación hacia políticas más ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otros checkpoints, y el artefacto no está marcado como validado en robot real.

## Requisitos de hardware

- VRAM estimada: no disponible. No se publica el recuento de parámetros del modelo completo, por lo que no es posible dar una cifra fiable de memoria necesaria para inferencia.
- Componentes auxiliares: la carga requiere pesos externos de BERT (`bert-base-uncased`) y DINOv3 (`dinov3-vitl`) si no se desactiva la inicialización con `framework.initialization.load_pretrained=false`. Ambos deben descargarse por separado y ubicarse en las rutas indicadas con `--cfg-option`.
- GPU recomendadas: no disponible. Dado que el repositorio completo ocupa 3,5 GB e incluye dos checkpoints, es plausible que el modelo quepa en GPU de gama consumer con suficiente memoria, pero esto es una inferencia y no un dato confirmado por el autor.
- Despliegue: el flujo documentado es un servidor de política (`server_policy.py`) lanzado mediante `scripts/robotwin/run_policy_server.sh` desde un checkout preparado (`turbovla_official`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de acción robótica con este formato de pesos.
- Latencia y throughput: no disponibles.
- Nota operativa: `config.yaml` y `dataset_statistics.json` deben permanecer en el mismo directorio que el checkpoint, ya que el cargador de StarVLA los descubre en el directorio padre. El `config.yaml` empaquetado contiene rutas absolutas del contenedor original (`container2`), por lo que es necesario sobrescribirlas al desplegar en otra máquina.

## Comparativa con modelos similares

La comparación se establece con políticas visión-lenguaje-acción de propósito general publicadas por otros equipos. Los datos de las alternativas proceden de sus fichas públicas y pueden variar según la revisión; conviene verificarlos antes de citarlos.

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TurboVLA Task000759 step 2500 (este) | no disponible | no disponible | Checkpoint especializado en una única tarea del robot SG2 | no disponible | Repositorio HuggingFace de 3,5 GB, 0 descargas |
| OpenVLA | aproximadamente 7.000 millones | no disponible en esta ficha | Política VLA generalista basada en un VLM de tipo Llama-2 7B | no disponible en esta ficha | Pesos públicos en HuggingFace |
| GR00T N1 | aproximadamente 2.000 millones (variante base) | no disponible en esta ficha | Modelo fundacional para robots humanoides | no disponible en esta ficha | Pesos públicos |
| pi0 | orden de 3.000 millones | no disponible en esta ficha | Política VLA de flujo para control robótico general | no disponible en esta ficha | Pesos públicos |

La diferencia fundamental no está en el rendimiento, sino en el alcance: las alternativas son modelos fundacionales entrenados sobre datos heterogéneos y múltiples robots, mientras que este artefacto es un checkpoint de una sola tarea, un solo robot y un solo conjunto de datos, sin métricas publicadas que permitan situarlo frente a ellas.

## Limitaciones y advertencias

- No validado en robot real: la propia model card indica que el artefacto no ha sido reclamado como validado en hardware físico y que es el checkpoint guardado del entrenamiento.
- Especialización extrema: la política está entrenada para una única tarea (mover un vegetal en una habitación blanca) sobre un único robot (SG2). No es reutilizable directamente en otras tareas, entornos u organismos robóticos.
- Licencia no declarada: al no especificarse licencia, no puede asumirse ningún derecho de uso comercial. Cualquier uso en producción requeriría contactar con el autor.
- Sin métricas de rendimiento: no hay tasas de éxito, curvas de aprendizaje ni comparaciones, lo que impide evaluar la calidad real de la política.
- Dependencia de pesos externos: la inferencia requiere BERT, DINOv3 y, opcionalmente, GroundingDINO, lo que añade complejidad de despliegue y posibles fallos de carga si las rutas no se configuran correctamente.
- Configuración con rutas absolutas: el `config.yaml` empaquetado apunta a rutas de un contenedor concreto (`/NHNHOME/WORKSPACE/26motir001_D/...`), por lo que el despliegue fuera de ese entorno exige editar la configuración.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero sí existe riesgo de acciones incoherentes o inseguras fuera de la distribución de entrenamiento, algo inherente a las políticas VLA.
- Sesgos: no disponibles. No se documenta la composición demográfica, geográfica ni de condiciones de iluminación del conjunto de entrenamiento, factores que en robótica afectan directamente a la generalización.
- Idiomas: no disponibles. Aunque se integra un encoder BERT, se desconoce si las instrucciones de tarea estaban en inglés, coreano u otro idioma.
- Reproducibilidad frágil: exige fijar la revisión del runtime `a3365e8f1787d30bafd99d2806edbf4dc82b5370` y conservar `config.yaml` y `dataset_statistics.json` junto al checkpoint.
- Resultados de búsqueda no relevantes: las consultas web asociadas a este artefacto devolvieron únicamente sitios de contenido para adultos sin relación alguna con el modelo, por lo que no aportan información técnica utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/Task_000759_Move_Vegetable_Whiteroom_TurboVLA-bs8-step2500
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web. Los únicos resultados devueltos eran irrelevantes y no relacionados con el modelo.
