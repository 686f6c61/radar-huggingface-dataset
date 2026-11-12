# LoongForge/LoongForge-LingBot-VA-RoboTwin

## Resumen

LoongForge-LingBot-VA-RoboTwin es un checkpoint de ajuste fino supervisado (SFT) del modelo base `robbyant/lingbot-va-base`, entrenado con el framework LoongForge sobre el conjunto de datos RoboTwin 2.0 (50 tareas). LingBot-VA es un modelo del mundo de tipo video-acción autorregresivo: un transformer de difusión de doble flujo que predice latentes de vídeo futuro y acciones robóticas en una única secuencia intercalada. El modelo resultante está especializado en manipulación robótica en el simulador RoboTwin 2.0.

El modelo resuelve el problema de mapear instrucciones en lenguaje natural e imágenes de observación a trayectorias de acción de un brazo robótico, manteniendo además una representación predictiva del entorno (world model). Con 5.088.872.670 parámetros (aproximadamente 5,09 mil millones) y pesos almacenados en FP32, se distribuye como shards de safetensors junto a un VAE, un text encoder y un tokenizer heredados del checkpoint `robbyant/lingbot-va-posttrain-robotwin`.

Es relevante porque demuestra que el framework LoongForge de Baidu reproduce (y supera ligeramente) la receta oficial de entrenamiento de LingBot-VA: 87,6 % de éxito en el conjunto limpio y 85,7 % en el aleatorizado de RoboTwin 2.0, frente al 86,1 % y 85,1 % obtenidos con el código oficial. La licencia Apache 2.0 facilita su reutilización, aunque su ámbito de aplicación es muy específico: robótica simulada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión de doble flujo (dual-stream diffusion transformer) autorregresivo, modelo del mundo video-acción (vision-language-action) |
| Parametros totales | 5.088.872.670 (~5,09 mil millones) |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas; inferencia en BF16 (el servidor de política convierte los pesos FP32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP32, shards con índice); repositorio de 34,6 GB |

## Arquitectura y entrenamiento

LingBot-VA es un modelo del mundo autorregresivo construido sobre un `WanTransformer3DModel` de difusión con dos flujos que procesan de forma conjunta los latentes de vídeo y las acciones del robot, generando una secuencia intercalada de predicciones futuras de imagen y comandos motores. El checkpoint incluye el transformer ajustado, mientras que el VAE, el text encoder y el tokenizer permanecen sin cambios respecto a `robbyant/lingbot-va-posttrain-robotwin`. El `config.json` es únicamente metadatos descriptivos y no es una configuración `AutoModel` de Transformers; la carga se realiza mediante la configuración de evaluación propia de LingBot-VA en LoongForge.

El ajuste fino se realizó sobre `robbyant/robotwin-clean-and-aug-lerobot` durante 50.000 iteraciones con batch global de 64 (1 x 4 x 16 GPUs), tasa de aprendizaje constante de 1e-5 tras 10 iteraciones de calentamiento, optimizador AdamW con betas (0,9, 0,95), weight decay 0,1, recorte de gradiente 2,0 y semilla 42. El cómputo se hizo en BF16 con pesos maestros y reducción de gradientes en FP32, almacenando los pesos finales en FP32. No se documentan fases de RLHF ni DPO.

## Capacidades

- Predicción de acciones robóticas de manipulación a partir de instrucciones en lenguaje natural e imágenes de observación.
- Modelado del mundo: predicción de latentes de vídeo futuro junto con las acciones en una secuencia intercalada.
- Ejecución de 50 tareas de manipulación del benchmark RoboTwin 2.0 (entornos limpios y aleatorizados).
- Condicionamiento por lenguaje (text encoder heredado del modelo base) para seleccionar la tarea.
- Generación de trayectorias multi-paso para control de robots en simulación.
- Capacidad de generalización a variaciones visuales aleatorizadas del entorno (85,7 % de éxito en `demo_randomized`).
- Soporte de tool calling / function calling: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo de razonamiento explícito (thinking), visión general o audio: no documentado.

## Casos de uso

- Evaluación de políticas de manipulación en RoboTwin 2.0: usar el checkpoint con `robotwin_50tasks.yaml` para medir tasas de éxito por tarea con el protocolo oficial (50 tareas x 50 episodios).
- Investigación en modelos del mundo para robótica: aprovechar la predicción conjunta de latentes de vídeo y acciones para estudiar representaciones predictivas del entorno en tareas de manipulación.
- Ajuste fino adicional con LoongForge: partir de este checkpoint como inicialización en lugar de `lingbot-va-base` para nuevas tareas o variantes del simulador, usando `run_lingbot_va_robotwin_fsdp_finetune.sh`.
- Reproducción de resultados: comparar la receta de LoongForge con el código oficial de LingBot-VA sobre el mismo dataset y calendario de entrenamiento para validar pipelines de entrenamiento distribuido (FSDP).
- Generación de datos sintéticos de manipulación: emplear las predicciones de vídeo futuro para aumentar datasets de robótica antes de entrenar políticas reales.
- Validación de infraestructura de entrenamiento: servir como caso de referencia para probar configuraciones multi-GPU (1 x 4 x 16) y precisión mixta BF16/FP32.

## Benchmarks y rendimiento

Protocolo: 50 tareas x 50 episodios por configuración, instrucciones vistas, semilla inicial 10000 con comprobación experta, límites de pasos oficiales por tarea e inferencia en BF16.

| Configuración | Clean (`demo_clean`) | Randomizado (`demo_randomized`) |
|---|---|---|
| Este checkpoint (LoongForge) | 87,6 % (2189/2500) | 85,7 % (2143/2500) |
| Código oficial LingBot-VA, misma receta | 86,1 % | 85,1 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Pesos en FP32 con un repositorio de 34,6 GB; en BF16 para inferencia, la huella de pesos ronda los 10-11 GB solo para el transformer, más el VAE, el text encoder y el tokenizer.
- VRAM estimada para inferencia completa: no disponible de forma oficial; por el tamaño de pesos en FP32 se recomienda al menos 24 GB para cargar el transformer en FP32 y más si se mantienen todos los componentes en memoria.
- GPU recomendadas: no documentadas; el entrenamiento se realizó con 64 GPUs en una topología 1 x 4 x 16 (no se especifica el modelo de GPU).
- ¿Cabe en GPU de consumo? No confirmado; con cuantización o carga selectiva podría ser viable en GPUs de 24 GB, pero no hay datos publicados.
- Opciones de despliegue: servidor de políticas de LoongForge (`server.ckpt_path`), configuración de evaluación `robotwin_50tasks.yaml` y `eval/run_robotwin_eval.sh`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento RoboTwin 2.0 (clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoongForge-LingBot-VA-RoboTwin | ~5,09 mil M | No disponible | 87,6 % | Apache 2.0 | Hugging Face (este repo) |
| LingBot-VA base (`robbyant/lingbot-va-base`) | No disponible | No disponible | No disponible (modelo base, sin SFT en RoboTwin) | No disponible en la información | Hugging Face |
| LingBot-VA posttrain RoboTwin (`robbyant/lingbot-va-posttrain-robotwin`) | No disponible | No disponible | No disponible | No disponible en la información | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría (políticas VLA para RoboTwin 2.0) en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en robótica simulada (RoboTwin 2.0); no es un modelo de propósito general y no se han evaluado capacidades de texto, código o matemáticas.
- El idioma declarado es únicamente inglés; las instrucciones en otros idiomas no están soportadas oficialmente.
- El `config.json` no es una configuración de Transformers; intentar cargarlo con `AutoModel` fallará. Requiere la configuración de evaluación de LoongForge.
- La inferencia requiere convertir los pesos de FP32 a BF16 en el servidor de políticas; no se documentan cuantizaciones ni despliegues ligeros.
- Riesgo de sobreajuste al conjunto de 50 tareas de RoboTwin 2.0; el rendimiento fuera de ese benchmark o en robots reales no está validado.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez fuera del protocolo descrito.
- Uso comercial permitido por la licencia Apache 2.0, pero la aplicabilidad práctica queda limitada al dominio de manipulación robótica y a la disponibilidad de los componentes heredados (VAE, text encoder, tokenizer) del checkpoint base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de usuarios muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LoongForge/LoongForge-LingBot-VA-RoboTwin
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base
- Checkpoint posttrain RoboTwin (componentes VAE, text encoder, tokenizer): https://huggingface.co/robbyant/lingbot-va-posttrain-robotwin
- Dataset de entrenamiento: https://huggingface.co/datasets/robbyant/robotwin-clean-and-aug-lerobot
- Repositorio LoongForge: https://github.com/baidu-baige/LoongForge
- Documentación de LoongForge: https://github.com/baidu-baige/LoongForge/tree/master/docs
- Script de ajuste fino: https://github.com/baidu-baige/LoongForge/tree/master/examples/embodied/lingbot_va/run_lingbot_va_robotwin_fsdp_finetune.sh
- Configuración de evaluación RoboTwin: https://github.com/baidu-baige/LoongForge/blob/master/examples/embodied/lingbot_va/eval/configs/robotwin/robotwin_50tasks.yaml
- Script de evaluación: https://github.com/baidu-baige/LoongForge/tree/master/examples/embodied/lingbot_va/eval/run_robotwin_eval.sh
- Repositorio oficial de LingBot-VA: https://github.com/Robbyant/lingbot-va
