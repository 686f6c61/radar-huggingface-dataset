# RoboColosseum/yam-gr00t-n1.7

## Resumen

yam-gr00t-n1.7 es un ajuste fino parcial del modelo fundacional de robótica GR00T N1.7-3B de NVIDIA, publicado por RoboColosseum. El modelo está especializado en manipulación bimanual sobre el robot YAM, empleando el conjunto de datos MolmoAct2-BimanualYAM-Dataset de AllenAI. Se distribuye en formato LeRobot y está pensado para ser ejecutado directamente como política de control (policy) en entornos de robótica, no como modelo de lenguaje general.

La arquitectura subyacente es la de GR00T N1.7, un modelo vision-language-action (VLA) de aproximadamente 3.144 millones de parámetros que combina un codificador visual, un LLM y un cabezal de difusión para generar acciones motoras. En este ajuste, el autor congela el LLM y el codificador visual, y entrena únicamente el proyector y el módulo de difusión, lo que reduce drásticamente el coste de entrenamiento y preserva las capacidades de representación del modelo base.

El modelo es relevante porque demuestra el flujo de trabajo típico de especialización de un VLA fundacional a un embodiment concreto (en este caso, un robot bimanual con tres cámaras y 14 dimensiones de acción). Su licencia Apache 2.0 y su integración con LeRobot lo hacen accesible para investigación y prototipado en laboratorios con hardware YAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en GR00T N1.7 (transformer + cabezal de difusión) |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA GR00T-N1.7-3B, un VLA que integra percepción visual, razonamiento mediante un LLM y generación de acciones mediante un cabezal de difusión. En este ajuste fino parcial, el autor congela el LLM y el codificador visual, y entrena únicamente el proyector y el módulo de difusión. El entrenamiento se realizó sobre MolmoAct2-BimanualYAM-Dataset con tres cámaras (top, left, right), 14 dimensiones de acción (articulaciones absolutas más pinzas), chunk size de 16 y un rango continuo de pinza [0, 1]. El checkpoint corresponde al paso 30.000 y el embodiment se registra como `new_embodiment`.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo de robótica, el entrenamiento se basa en imitación supervisada sobre trayectorias demostradas.

## Capacidades

- Generación de acciones motoras bimanuales de 14 dimensiones (articulaciones absolutas y pinzas) a partir de observaciones visuales de tres cámaras.
- Control de robot manipulador YAM en tareas de imitación aprendidas del dataset MolmoAct2-BimanualYAM.
- Predicción de chunks de acción de tamaño 16, lo que permite ejecutar secuencias de control sin replanificar en cada paso.
- Integración nativa con LeRobot mediante `GrootPolicy` y los pre/postprocesadores de la librería.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo; el modelo está orientado exclusivamente a control robótico.
- No se documentan capacidades de visión general, audio ni modo thinking.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo genera comandos articulares para dos brazos con pinzas continuas, adecuado para tareas de ensamblaje o manipulación de objetos que requieran coordinación entre brazos.
- Investigación en imitación robótica: sirve como punto de partida para comparar estrategias de ajuste fino parcial (proyector + difusión) frente a ajuste completo sobre el mismo dataset.
- Prototipado con LeRobot: al cargarse mediante `GrootPolicy.from_pretrained`, se integra en pipelines existentes de LeRobot para evaluación en simulación o en hardware real.
- Evaluación de generalización de VLA fundacionales: al derivar de GR00T N1.7 con LLM y visión congelados, permite estudiar cuánto rendimiento se obtiene solo adaptando el proyector y el cabezal de acción.
- Reproducción de experimentos: el checkpoint en el paso 30.000 y las métricas open-loop publicadas (MSE 0.00160, MAE 0.0244) permiten replicar la evaluación con stride 30 y reset en cada paso.
- Base para nuevos ajustes sobre YAM: el modelo puede reutilizarse como inicialización para fine-tunes adicionales sobre el mismo embodiment con nuevos datasets.

## Benchmarks y rendimiento

El autor publica únicamente una evaluación open-loop sobre 2 episodios retenidos (stride 30, reset en cada paso):

| Métrica | Valor |
|---|---|
| MSE | 0.00160 |
| MAE | 0.0244 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas de éxito en tareas robóticas cerradas) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144 millones de parámetros, en FP16 se requieren aproximadamente 6,3 GB solo para pesos, más memoria para activaciones y buffers de las tres cámaras.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) es un punto de partida razonable, pero no está confirmado por el autor.
- Cabe en GPU de consumo: probable en tarjetas con 16-24 GB en precisión reducida, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`GrootPolicy`), que es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| RoboColosseum/yam-gr00t-n1.7 | 3.144 M | no disponible | Apache 2.0 | VLA bimanual YAM, fine-tune parcial de GR00T N1.7 |
| nvidia/GR00T-N1.7-3B | ~3.000 M | no disponible | no disponible en la información | VLA fundacional generalista |
| MolmoAct2 (referenciado por el dataset) | no disponible | no disponible | no disponible | Modelo de acción sobre el que se construye el dataset |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en el embodiment YAM con tres cámaras y 14 dimensiones de acción; no es transferible directamente a otros robots sin nuevo ajuste.
- El ajuste es parcial (LLM y visión congelados), por lo que la adaptación al dominio depende exclusivamente del proyector y del cabezal de difusión.
- Solo se publican métricas open-loop sobre 2 episodios; no hay evidencia de éxito en tareas cerradas ni en hardware real.
- Riesgo de sobreajuste al dataset MolmoAct2-BimanualYAM y de degradación fuera de la distribución de demostraciones.
- No se documentan sesgos, pero al derivar de un VLA entrenado con datos visuales y de imitación, puede heredar sesgos de las demostraciones.
- Licencia Apache 2.0 permite uso comercial, pero la información sobre el modelo base y el dataset debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.
- La model card referencia un `ckpt` distinto (`Jiafei1224/molmoact2-yam-gr00t1.7`) en el ejemplo de uso, lo que puede generar confusión sobre el identificador correcto.

## Enlaces

- Hugging Face: https://huggingface.co/RoboColosseum/yam-gr00t-n1.7
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset: https://huggingface.co/datasets/allenai/MolmoAct2-BimanualYAM-Dataset
- Checkpoint alternativo citado en la model card: https://huggingface.co/Jiafei1224/molmoact2-yam-gr00t1.7
