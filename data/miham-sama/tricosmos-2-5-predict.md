# Miham-Sama/TriCosmos-2.5-predict

## Resumen

TriCosmos-2.5-predict es un modelo del mundo (world model) para conduccion autonoma desarrollado por Miham-Sama, un fine-tuning mediante LoRA del modelo base Cosmos-Predict2.5-2B de NVIDIA. Su particularidad es que predice de forma conjunta tres modalidades de sensor: RGB, termico e infrarrojos y profundidad LiDAR, a partir de cinco fotogramas observados (0,5 s a 10 Hz) y pronosticando los siguientes veinte fotogramas (2 s) en condiciones meteorologicas adversas como niebla, lluvia, nieve o conduccion nocturna.

La innovacion principal consiste en presentar los tres sensores al modelo como un unico video: una rejilla 2x2 de teselas de sensor. De este modo, el modelo reutiliza la arquitectura de difusion video del Cosmos-Predict2.5-2B sin modificar el backbone, y aprende las correlaciones entre modalidades a traves de un adaptador LoRA entrenado sobre el dataset DSERT-RoLL, que contiene datos reales de conduccion con RGB, termico y LiDAR sincronizados.

El modelo es relevante porque aborda un problema abierto en la prediccion de escenas para conduccion autonoma: la mayoria de world models solo predicen RGB, mientras que los sistemas de percepcion reales combinan camaras, sensores termicos y LiDAR. Al generar futuros coherentes en las tres modalidades, permite entrenar y validar planificadores y modulos de percepcion en condiciones de baja visibilidad sin necesidad de recoger datos reales adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion video (Cosmos-Predict2.5-2B) con adaptador LoRA |
| Parametros totales | 2B (modelo base) + LoRA; no disponible el desglose exacto de parametros del adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5 fotogramas de entrada (0,5 s a 10 Hz) y prediccion de 20 fotogramas (2 s) |
| Tipos de cuantizacion | bf16 (inferencia), fp32 (fine-tuning); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | PyTorch (`.pt`): `tricosmos_ema_bf16.pt` (3,9 GB) y variante fp32 (~7,8 GB) en Kaggle |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de difusion video de Cosmos-Predict2.5-2B, que incluye un tokenizador de video y un codificador de texto de gran tamano. Sobre esa base se entrena un adaptador LoRA (receta `train_tri_lora.yaml`) que ensena al modelo a generar la rejilla 2x2 de sensores como si fuera un unico video. Los pesos publicados corresponden al paso de entrenamiento 500 con EMA en bf16, y son el checkpoint detras de todos los resultados reportados.

El entrenamiento se realiza sobre el dataset DSERT-RoLL (arXiv:2604.03685), que contiene datos reales de conduccion con RGB, termico y LiDAR sincronizados. El modelo se evalua con 35 pasos de muestreo, guidance 7 y semilla 0, configuracion por defecto del script de inferencia. La prediccion conjunta de tres modalidades en una sola rejilla es la innovacion tecnica destacada: evita modificar la arquitectura del backbone y permite aprovechar el conocimiento previo del modelo base sobre dinamica de escenas.

## Capacidades

- Prediccion image-to-video de escenas de conduccion: genera 20 fotogramas futuros (2 s) a partir de 5 observados (0,5 s).
- Generacion conjunta de tres modalidades: RGB, termico/infrarrojos y profundidad LiDAR, en una unica rejilla 2x2.
- Robustez en condiciones adversas: entrenado y evaluado con niebla, lluvia, nieve y noche.
- Generacion condicionada por texto: acepta una caption JSON que describe la escena.
- Inferencia en modo zero-shot del modelo base para comparacion directa.
- Fine-tuning adicional sobre datos propios a partir de la variante fp32 publicada en Kaggle.
- No se documenta soporte de tool calling, agentes ni modo thinking.

## Casos de uso

- Validacion de modulos de percepcion en condiciones adversas: generar futuros sinteticos de RGB, termico y LiDAR para probar detectores y segmentadores en niebla, lluvia o nieve sin recoger datos reales adicionales.
- Aumento de datos para entrenamiento: producir secuencias etiquetadas de 2 s en las tres modalidades para ampliar datasets de conduccion autonoma con escenarios de baja visibilidad.
- Pruebas de planificadores y predictores de trayectoria: simular la evolucion de la escena a corto plazo para evaluar la robustez de un planificador ante condiciones meteorologicas adversas.
- Analisis de sensores termicos: estudiar como se comporta la firma termica de peatones y vehiculos en escenarios nocturnos generados, util para calibrar umbrales de deteccion.
- Simulacion de escenarios LiDAR: generar mapas de profundidad futuros para probar algoritmos de odometria y SLAM en condiciones de visibilidad reducida.
- Investigacion en world models multimodales: servir de base para estudiar la coherencia entre modalidades en la prediccion de video y para experimentos de fine-tuning con LoRA.
- Demostraciones y comparativas: el notebook de Colab genera un video lado a lado (entrada, futuro real, TriCosmos, Cosmos zero-shot) util para comunicar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card menciona resultados cualitativos mediante videos comparativos en el conjunto de validacion DSERT-RoLL (por ejemplo, la ventana Light Snow nocturna), pero no se incluyen metricas numericas.

## Requisitos de hardware

- VRAM minima: 48 GB para ejecutar el modelo de 2B junto con el codificador de texto y el tokenizador de video de Cosmos-Predict2.5 a 1280x704 en bf16.
- GPUs probadas: NVIDIA RTX PRO 6000 Blackwell (96 GB, runtime G4 de Colab) y NVIDIA H100 (80 GB).
- GPUs usadas para los resultados del paper: NVIDIA A100 80 GB.
- GPUs no soportadas por memoria insuficiente: Colab A100 (40 GB), L4 (22,5 GB) y T4 (15 GB).
- Despliegue: repositorio oficial `nvidia-cosmos/cosmos-predict2.5` (commit `a2c298b0a3df3778b973fe65e9e58877b292d8a7`), entorno `uv` con CUDA 12.8 y Python 3.10; script `tricosmos_infer.py`; notebook de Colab; descarga via `hf download` o `kagglehub`.
- Latencia: aproximadamente 9 minutos por pronostico con la configuracion del paper (35 pasos de muestreo, guidance 7, semilla 0).
- Requiere aceptar la licencia del modelo base `nvidia/Cosmos-Predict2.5-2B` en Hugging Face, ya que el tokenizador y el codificador de texto se cargan desde repositorios con acceso restringido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / prediccion | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TriCosmos-2.5-predict | 2B + LoRA | 5 frames entrada, 20 frames salida | RGB, termico, LiDAR | NVIDIA Open Model License | Hugging Face y Kaggle |
| Cosmos-Predict2.5-2B (base) | 2B | no disponible en la informacion | RGB (video) | NVIDIA Open Model License | Hugging Face (acceso restringido) |
| Otros world models para conduccion | no disponible | no disponible | habitualmente solo RGB | no disponible | no disponible |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada. El unico contraste documentado es cualitativo, frente al modelo base en modo zero-shot sobre la misma ventana de entrada.

## Limitaciones y advertencias

- Horizonte de prediccion corto: solo 2 s (20 fotogramas) a partir de 0,5 s de observacion.
- Requiere al menos 48 GB de VRAM; no cabe en GPUs de consumo como RTX 4090 ni en T4, L4 o A100 de 40 GB.
- Latencia alta: unos 9 minutos por pronostico, no apto para inferencia en tiempo real.
- Dependencia de la licencia NVIDIA Open Model License y de aceptar la licencia del modelo base en Hugging Face para descargar tokenizador y codificador de texto.
- Entrenado sobre un unico dataset (DSERT-RoLL) de conduccion real; el rendimiento fuera de ese dominio (otras camaras, otros paises, otras condiciones de calibracion) no esta documentado.
- Riesgo de artefactos de difusion y de incoherencias entre modalidades en escenarios poco representados en el dataset.
- No se documentan sesgos especificos ni evaluaciones de seguridad; el uso previsto es investigacion en conduccion autonoma.
- Idiomas soportados no disponibles; la generacion condicionada por texto depende de las captions del dataset.
- El checkpoint publicado corresponde al paso 500 de entrenamiento; no se documenta una evaluacion exhaustiva de convergencia.

## Enlaces

- Hugging Face: https://huggingface.co/Miham-Sama/TriCosmos-2.5-predict
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Kaggle: https://www.kaggle.com/models/mahfuzurmahimrahman/tricosmos-2.5-predict
- Paper del dataset DSERT-RoLL: https://arxiv.org/abs/2604.03685
- Paper de TriCosmos (preprint): https://arxiv.org/abs/2611.22669
- Repositorio de codigo Cosmos-Predict2.5: https://github.com/nvidia-cosmos/cosmos-predict2.5
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
