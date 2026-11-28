# SORA-Lab/TriCosmos-2.5-predict

## Resumen

TriCosmos-2.5-predict es un modelo del mundo (world model) orientado a conduccion autonoma desarrollado por SORA-Lab. Se construye como un fine-tuning mediante LoRA sobre el modelo base NVIDIA Cosmos-Predict2.5-2B, y su tarea es la prediccion conjunta de video en tres modalidades de sensor: RGB, termico e imagen de profundidad derivada de LiDAR. Dado un contexto de 5 fotogramas observados (0,5 s a 10 Hz), genera los 20 fotogramas siguientes (2 s) de los tres sensores simultaneamente, incluyendo condiciones meteorologicas adversas como niebla, lluvia, nieve y conduccion nocturna.

La innovacion central es el tratamiento de los tres sensores como un unico video: las imagenes se disponen en una rejilla 2x2 de teselas de sensor, de modo que el modelo de difusion video aprende las correlaciones cruzadas entre modalidades sin necesidad de una arquitectura multi-encoder especifica. El modelo se entrena sobre el dataset DSERT-RoLL, que contiene datos reales de conduccion con RGB, termico y LiDAR sincronizados.

Es relevante porque aborda un problema practico de la percepcion para conduccion autonoma: la prediccion de futuros multimodales coherentes en condiciones donde los sensores convencionales degradan su rendimiento. El checkpoint publicado corresponde al paso de entrenamiento 500, con pesos en EMA y bf16, y requiere al menos 48 GB de VRAM para inferencia a 1280x704.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion video (base Cosmos-Predict2.5-2B) con adaptadores LoRA; entrada en rejilla 2x2 de sensores |
| Parametros totales | 2B (modelo base); parametros LoRA adicionales no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 5 fotogramas de entrada (0,5 s a 10 Hz) para predecir 20 fotogramas (2 s) |
| Tipos de cuantizacion | bf16 (3,9 GB) para inferencia; fp32 (~7,8 GB) para fine-tuning |
| Idiomas soportados | No disponible (modelo de prediccion video, no linguistico) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | `.pt` (PyTorch); checkpoint `tricosmos_ema_bf16.pt` |
| Resolucion de salida | 1280x704 |
| Pasos de muestreo | 35 pasos, guidance 7, seed 0 |
| Tamano del repositorio | 4,2 GB |

## Arquitectura y entrenamiento

El modelo parte de Cosmos-Predict2.5-2B, un modelo de difusion para generacion y prediccion de video de NVIDIA. Sobre esa base se aplica un post-entrenamiento con LoRA (receta `train_tri_lora.yaml`) que adapta el modelo a la prediccion multimodal de sensores. La clave arquitectonica es la representacion de los tres sensores (RGB, termico y profundidad LiDAR) como teselas de una rejilla 2x2 dentro de un unico video, lo que permite al modelo de difusion explotar la atencion espacial y temporal existente para modelar dependencias cruzadas entre modalidades.

El entrenamiento se realiza sobre el dataset DSERT-RoLL, compuesto por datos reales de conduccion con RGB, termico y LiDAR sincronizados, incluyendo escenarios de niebla, lluvia, nieve y noche. El checkpoint publicado corresponde al paso 500 y usa pesos EMA en bf16. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO, dado que se trata de un modelo de difusion y no de un modelo de lenguaje.

## Capacidades

- Prediccion de video multimodal conjunta: genera RGB, termico y profundidad LiDAR de forma coherente en una sola pasada.
- Prediccion a corto plazo: 20 fotogramas futuros (2 s a 10 Hz) a partir de 5 observados.
- Robustez en condiciones adversas: entrenado y evaluado en niebla, lluvia, nieve y noche.
- Generacion condicionada por texto: acepta un caption JSON (`light_snow_example.json`) que describe la escena.
- Inferencia image-to-video mediante el pipeline `cosmos`.
- Comparacion con el modelo base zero-shot en el mismo input (modo `zeroshot`).
- Fine-tuning adicional posible a partir de los pesos fp32 publicados en Kaggle.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Validacion de percepcion en conduccion autonoma: generar futuros sinteticos de RGB, termico y LiDAR para comprobar si los modulos de deteccion y seguimiento mantienen coherencia temporal en escenarios de nieve o lluvia.
- Aumento de datos para entrenamiento: producir secuencias sinteticas etiquetadas de 2 s en condiciones adversas que complementen datasets reales escasos en esas condiciones.
- Pruebas de seguridad en simulacion: inyectar predicciones multimodales en un simulador para evaluar el comportamiento de planificadores ante oclusiones o degradacion de sensores.
- Desarrollo de sistemas de fusion de sensores: usar las predicciones termicas y de profundidad como referencia para entrenar o depurar algoritmos de fusion RGB-termico-LiDAR.
- Analisis de robustez meteorologica: comparar la prediccion de TriCosmos frente a la del modelo base zero-shot para cuantificar la mejora en niebla, nieve o noche.
- Investigacion en world models: estudiar como un modelo de difusion video generaliza la dinamica fisica y las correlaciones entre modalidades cuando se le presenta una rejilla de sensores.
- Generacion de material para anotacion: crear clips de 2,5 s (5 observados + 20 predichos) para revision humana o preetiquetado en pipelines de anotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona una comparacion cualitativa lado a lado entre TriCosmos y Cosmos-Predict2.5 zero-shot sobre la ventana de ejemplo Light Snow, pero no proporciona metricas cuantitativas (FVD, LPIPS, PSnr, etc.) en el material consultado.

## Requisitos de hardware

- VRAM minima: 48 GB para inferencia a 1280x704 en bf16, ya que el modelo de 2B se ejecuta junto con el text encoder y el tokenizer de video de Cosmos-Predict2.5.
- GPU verificadas: NVIDIA RTX PRO 6000 Blackwell (96 GB, runtime G4 de Colab), NVIDIA H100 (80 GB) y NVIDIA A100 80 GB (usada para los resultados del paper).
- GPU no compatibles por memoria: Colab A100 40 GB, L4 22,5 GB y T4 15 GB.
- Despliegue: repositorio oficial `nvidia-cosmos/cosmos-predict2.5` en el commit `a2c298b0a3df3778b973fe65e9e58877b292d8a7`, con `uv sync --extra=cu128 --python 3.10`; script `tricosmos_infer.py`; notebook `TriCosmos_inference.ipynb` para Colab G4.
- Latencia: aproximadamente 9 minutos por prediccion con los ajustes del paper (35 pasos, guidance 7, seed 0).
- No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TriCosmos-2.5-predict | 2B (base) + LoRA | 5 fotogramas (0,5 s) | RGB, termico, LiDAR | NVIDIA Open Model License | Hugging Face, Kaggle |
| NVIDIA Cosmos-Predict2.5-2B | 2B | No disponible | Video RGB | NVIDIA Open Model License | Hugging Face (gated) |
| Alternativas de world models para conduccion | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion directa documentada es contra el modelo base Cosmos-Predict2.5-2B en modo zero-shot sobre la misma ventana de entrada; la model card solo ofrece una comparacion visual, sin metricas. No se dispone de datos sobre otros world models de conduccion con salida multimodal RGB-termico-LiDAR en la informacion proporcionada.

## Limitaciones y advertencias

- Horizonte de prediccion corto: solo 2 s futuros a partir de 0,5 s observados, insuficiente para planificacion a medio plazo.
- Requisito de memoria elevado: 48 GB minimo de VRAM impide su uso en GPU de consumo (RTX 4090, 24 GB) y en la mayoria de instancias cloud economicas.
- Acceso restringido al modelo base: es necesario aceptar la licencia de `nvidia/Cosmos-Predict2.5-2B` en Hugging Face para cargar el tokenizer y el text encoder.
- Licencia NVIDIA Open Model License: conviene revisar sus terminos antes de uso comercial, ya que no es una licencia OSI y puede imponer restricciones adicionales.
- Checkpoint en paso 500: el modelo publicado es un snapshot temprano del entrenamiento; puede no representar el mejor estado alcanzable.
- Riesgo de alucinacion visual: como modelo generativo, puede producir futuros fisicamente inconsistentes o artefactos en escenarios fuera de la distribucion de DSERT-RoLL.
- Sesgos del dataset: las predicciones heredan los sesgos de DSERT-RoLL en cuanto a geografia, tipo de via, iluminacion y sensores concretos.
- Idiomas: no aplica, pero los captions de condicionamiento estan en ingles en el ejemplo publicado.
- Sin soporte de tool calling ni agentes: no es adecuado para tareas de razonamiento simbolico o interaccion con herramientas.
- Reproducibilidad: la inferencia depende de un commit concreto del repositorio de Cosmos y de versiones especificas de CUDA y Python.

## Enlaces

- Hugging Face: https://huggingface.co/SORA-Lab/TriCosmos-2.5-predict
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Kaggle: https://www.kaggle.com/models/mahfuzurmahimrahman/tricosmos-2.5-predict
- Paper del dataset DSERT-RoLL: https://arxiv.org/abs/2604.03685
- Paper de TriCosmos: https://arxiv.org/abs/2611.22669
- Repositorio Cosmos-Predict2.5: https://github.com/nvidia-cosmos/cosmos-predict2.5
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
