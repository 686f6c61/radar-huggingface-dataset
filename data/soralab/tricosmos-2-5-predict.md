# SORALab/TriCosmos-2.5-predict

## Resumen

TriCosmos-2.5-predict es un modelo del mundo (world model) para conduccion autonoma desarrollado por SORALab. Partiendo del modelo base NVIDIA Cosmos-Predict2.5-2B, se ha ajustado mediante LoRA para predecir de forma conjunta tres modalidades de sensor: RGB, termico y profundidad LiDAR. Dada una ventana de 5 fotogramas observados (0,5 s a 10 Hz), el modelo genera los 20 fotogramas siguientes (2 s) de los tres sensores simultaneamente, incluyendo condiciones meteorologicas adversas como niebla, lluvia, nieve y conduccion nocturna.

La innovacion principal reside en como se presentan las tres modalidades al modelo: en lugar de procesarlas por separado, se componen como una unica senal de video organizada en una rejilla 2x2 de teselas de sensor. De este modo, Cosmos-Predict2.5, originalmente un modelo de video image-to-video, puede tratarlas con su mismo mecanismo de difusion sin cambiar la arquitectura. El modelo se entrena sobre DSERT-RoLL, un conjunto de datos reales de conduccion con RGB, termico y LiDAR sincronizados.

El resultado es relevante para investigacion en percepcion robusta y simulacion de escenarios: permite generar futuros plausibles y fisicamente coherentes de sensores que no siempre estan disponibles en vehiculos comerciales (termico, LiDAR) a partir de observaciones reales, y evaluar como se comportan los sistemas de percepcion en condiciones de baja visibilidad. El modelo tiene 2B parametros, se distribuye en bf16 (3,9 GB) y requiere GPU de al menos 48 GB para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion video image-to-video (Cosmos-Predict2.5), ajuste fino con LoRA; rejilla 2x2 de teselas RGB/termico/LiDAR |
| Parametros totales | 2B (modelo base Cosmos-Predict2.5-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5 fotogramas de entrada (0,5 s a 10 Hz); predice 20 fotogramas (2 s) |
| Tipos de cuantizacion | bf16 (inferencia), fp32 (fine-tuning); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de video, no de texto) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | `.pt` (PyTorch); checkpoint `tricosmos_ema_bf16.pt` (3,9 GB); variante fp32 en Kaggle (~7,8 GB) |
| Resolucion de salida | 1280x704 |
| Pasos de muestreo | 35 pasos, guidance 7, seed 0 (valores por defecto del paper) |
| Tamano del repo | 4,2 GB |

## Arquitectura y entrenamiento

TriCosmos-2.5-predict se construye sobre Cosmos-Predict2.5-2B, un modelo de difusion para generacion de video condicionada por imagen y texto. SORALab aplica un ajuste fino con LoRA sobre la version post-entrenada del modelo base (`base/post-trained`), manteniendo congelados los pesos originales y anadiendo adaptadores de bajo rango. La clave del diseno es la representacion de entrada: los tres sensores (RGB, termico y profundidad LiDAR) se concatenan espacialmente en una rejilla 2x2 y se tratan como un unico video, de modo que el modelo aprende correlaciones entre modalidades sin modificar el tokenizador ni el encoder de texto de Cosmos.

El entrenamiento utiliza el conjunto DSERT-RoLL, descrito en el articulo arXiv 2604.03685, que contiene datos reales de conduccion con RGB, termico y LiDAR sincronizados, incluyendo condiciones de niebla, lluvia, nieve y noche. El checkpoint publicado corresponde al paso de entrenamiento 500 con pesos EMA en bf16. La receta completa de entrenamiento (`config/train_tri_lora.yaml`), las opciones del modelo (`config/experiment.json`) y la configuracion de exportacion estan incluidas en el repositorio. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a un modelo de difusion de video).

## Capacidades

- Prediccion multimodal conjunta de video: genera simultaneamente RGB, termico y profundidad LiDAR a partir de 5 fotogramas observados.
- Prediccion de futuros de 2 segundos (20 fotogramas) a 10 Hz con resolucion 1280x704.
- Robustez en condiciones adversas: entrenado y evaluado con niebla, lluvia, nieve y escenarios nocturnos.
- Generacion condicionada por texto: acepta un caption (JSON) que describe la escena para guiar la prediccion.
- Generacion de video image-to-video mediante difusion con muestreo configurable (pasos, guidance, seed).
- Capacidad de comparacion zero-shot: el script de inferencia permite ejecutar el modelo base Cosmos-Predict2.5 sin ajuste sobre la misma entrada.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni comprension de lenguaje natural; es un modelo generativo de video, no un LLM.
- Capacidades multilingues: no disponibles (el condicionamiento textual depende del encoder de texto de Cosmos, pero no se especifican idiomas).

## Casos de uso

- Simulacion de sensores en conduccion autonoma: generar futuros plausibles de camara termica y LiDAR a partir de RGB real, util para aumentar datasets de percepcion en condiciones donde esos sensores no estan disponibles o son costosos de desplegar.
- Evaluacion de robustez en clima adverso: producir secuencias sinteticas de niebla, lluvia, nieve y noche para probar sistemas de deteccion y segmentacion bajo baja visibilidad antes de validarlos en pista.
- Aumento de datos para entrenamiento: crear pares observado-futuro de las tres modalidades para entrenar modelos predictivos o de planificacion que necesiten anticipar la escena.
- Validacion de pipelines de fusion de sensores: comparar predicciones RGB/termico/LiDAR con las mediciones reales del conjunto DSERT-RoLL para detectar incoherencias entre modalidades.
- Investigacion en world models: servir de base para estudiar la coherencia fisica y temporal de predicciones multimodales en entornos de conduccion.
- Generacion de escenarios para simuladores: alimentar simuladores de conduccion con secuencias realistas de 2 s que incluyan termico y LiDAR, reduciendo la dependencia de capturas reales.
- Reproducibilidad de experimentos: el repositorio incluye receta de entrenamiento, configuracion y ejemplo de validacion (Light Snow nocturno) para replicar los resultados del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FVD, PSNR, SSIM, mIoU u otros) en la informacion disponible. La model card menciona una comparacion cualitativa lado a lado entre la entrada, el futuro real, TriCosmos y Cosmos-Predict2.5 zero-shot en el ejemplo de nieve ligera nocturna, pero no se proporcionan metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 48 GB (el modelo de 2B se ejecuta junto con el encoder de texto y el tokenizador de video de Cosmos-Predict2.5 a 1280x704).
- GPU verificadas: NVIDIA RTX PRO 6000 Blackwell (96 GB, runtime G4 de Colab), NVIDIA H100 (80 GB) y NVIDIA A100 80 GB (usada para los resultados del paper).
- GPU no soportadas por falta de memoria: Colab A100 (40 GB), L4 (22,5 GB) y T4 (15 GB).
- No cabe en GPU de consumo convencionales (RTX 4090, 3090, etc.) segun los requisitos documentados.
- Despliegue: codigo oficial de Cosmos-Predict2.5 (repositorio `nvidia-cosmos/cosmos-predict2.5`, commit `a2c298b0a3df3778b973fe65e9e58877b292d8a7`), entorno `uv` con CUDA 12.8 y Python 3.10; script `tricosmos_infer.py` y cuaderno de Colab incluidos.
- No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia: aproximadamente 9 minutos por prediccion con los ajustes del paper (35 pasos de muestreo, guidance 7, seed 0). No se proporciona throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TriCosmos-2.5-predict | 2B | 5 fotogramas entrada, 20 de salida | RGB + termico + LiDAR | NVIDIA Open Model License | Hugging Face, Kaggle |
| Cosmos-Predict2.5-2B (base) | 2B | image-to-video generico | RGB (video) | NVIDIA Open Model License | Hugging Face (gated) |
| Alternativas comparables de world models para conduccion | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con otros world models multimodales para conduccion no esta disponible en la informacion proporcionada. El unico contraste documentado es con el modelo base Cosmos-Predict2.5-2B en modo zero-shot, que sirve como referencia cualitativa en el cuaderno de inferencia.

## Limitaciones y advertencias

- Requiere aceptar la licencia de NVIDIA Cosmos-Predict2.5-2B en Hugging Face y disponer de token de autenticacion; el encoder de texto y el tokenizador se cargan de repositorios con acceso restringido.
- Requiere GPU de al menos 48 GB de VRAM; no es desplegable en hardware de consumo.
- Latencia alta: alrededor de 9 minutos por prediccion de 2 s de video con los ajustes por defecto.
- Ventana de prediccion corta (2 s); no se documenta soporte para horizontes mas largos.
- Entrenado sobre DSERT-RoLL; el rendimiento fuera de la distribucion de ese dataset (otras camaras, otras ciudades, otros sensores) no esta caracterizado.
- Riesgo de artefactos y alucinacion visual inherente a los modelos de difusion: las predicciones pueden ser plausibles pero fisicamente incorrectas, especialmente en condiciones extremas.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con datos de conduccion reales puede heredar sesgos de geografia, iluminacion y tipo de escena del dataset.
- Licencia NVIDIA Open Model License: es necesario revisar sus terminos para uso comercial; no es una licencia open source permisiva tipo Apache 2.0 o MIT.
- Modelo de investigacion (paso 500 de entrenamiento); no se garantiza su robustez para produccion sin validacion adicional.
- No se especifican idiomas soportados ni capacidades de texto mas alla del condicionamiento por caption.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SORALab/TriCosmos-2.5-predict
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Version en Kaggle: https://www.kaggle.com/models/mahfuzurmahimrahman/tricosmos-2.5-predict
- Paper del dataset DSERT-RoLL: https://arxiv.org/abs/2604.03685
- Paper de TriCosmos (preprint): https://arxiv.org/abs/2611.22669
- Codigo oficial de Cosmos-Predict2.5: https://github.com/nvidia-cosmos/cosmos-predict2.5
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
