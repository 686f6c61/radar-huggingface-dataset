# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_gripper_ema

## Resumen

`cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_gripper_ema` es un modelo de politica de accion (action policy) para control robótico en bucle cerrado, desarrollado por el usuario Myungkyu y publicado bajo el paraguas del framework Cosmos. Se trata de un ajuste fino del modelo de mundo de vídeo Cosmos3-Nano, al que se le acopla un DiT de accion externo con condicionamiento unidireccional vídeo-a-accion y un calendario de accion compartido. El resultado es un modelo que, a partir de observaciones visuales, predice acciones de robot para tareas de manipulacion.

El modelo se ha entrenado sobre el simulador RoboDojo Sim en formato LeRobot v3.0, con un batch de 64 y 60.000 pasos, partiendo de cero en la cabeza de accion ("scratch") y con un efector final tipo pinza ("gripper"). Los pesos publicados corresponden a la media exponencial (EMA) del checkpoint final de entrenamiento, en bf16 y almacenados como un checkpoint distribuido de rango unico (DCP) de PyTorch.

Su relevancia es acotada pero especifica: ejemplifica la linea de trabajo que convierte modelos de mundo generativos de vídeo en controladores de robot mediante cabezas de accion ligeras, un patron que esta ganando traccion frente a los enfoques puramente de imitacion. No obstante, es un artefacto de investigacion con cero descargas, sin model card detallada en cuanto a metricas y sin licencia declarada, por lo que su uso en produccion no esta respaldado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de vídeo Cosmos3-Nano (backbone) + DiT de accion externo con condicionamiento unidireccional vídeo-a-accion |
| Parametros totales | no disponible (el nombre sugiere L36, 36 capas, y D1024, dimension 1024, pero no se confirma el recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de accion robotica, no de texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP) en bf16, ficheros `model/.metadata` y `model/__0_0.distcp` |

## Arquitectura y entrenamiento

El modelo combina un backbone de modelo de mundo de vídeo, Cosmos3-Nano, con un Diffusion Transformer (DiT) de accion separado. La conexion entre ambos es unidireccional: el vídeo condiciona la generacion de acciones, pero no al reves, y ambos comparten un calendario de difusion ("shared action schedule"). Esta separacion permite reutilizar un modelo de mundo preentrenado y anadir una cabeza de accion relativamente ligera, en lugar de entrenar un policy end-to-end desde cero.

El entrenamiento se realizo sobre RoboDojo Sim en formato LeRobot v3.0, con batch de 64 durante 60.000 pasos y la cabeza de accion inicializada desde cero. El checkpoint publicado contiene unicamente los pesos EMA (`net_ema`, convertidos a bf16 y almacenados bajo los nombres `net.*`), sin estado del optimizador ni el otro conjunto de pesos del entrenamiento. La configuracion de entrenamiento se distribuye como `config.yaml`, con rutas locales sustituidas por marcadores de posicion; el servidor de politicas de cosmos-framework reconstruye el modelo a partir de ella y lee de ahi la longitud de chunk, el ratio de vídeo, el formato de prompt y los ajustes de estado. Para la inferencia es necesario apuntar `vae_path` a un fichero local `Wan2.2_VAE.pth` del modelo Wan-AI/Wan2.2-TI2V-5B.

## Capacidades

- Prediccion de acciones de robot en bucle cerrado a partir de observaciones visuales, orientada a manipulacion con efector final tipo pinza.
- Condicionamiento vídeo-a-accion mediante un DiT de accion acoplado al modelo de mundo Cosmos3-Nano.
- Generacion de secuencias de accion por chunks, con longitud de chunk configurable a traves de `config.yaml`.
- Integracion con el servidor de politicas de accion de cosmos-framework para despliegue como policy server.
- No se documentan capacidades de generacion de texto, razonamiento linguistico, codigo, matematicas, vision general, tool calling, agentes ni multilingueismo; el modelo esta especializado exclusivamente en control robotico.

## Casos de uso

- Manipulacion robotica simulada con pinza: el modelo recibe observaciones visuales del entorno RoboDojo y emite acciones de efector final, adecuado para experimentos de imitacion en simulacion antes de transferir a hardware.
- Investigacion en modelos de mundo para control: sirve como punto de partida para estudiar como un backbone de vídeo preentrenado condiciona una cabeza de accion, gracias a la separacion explicita entre modelo de mundo y DiT de accion.
- Evaluacion de tecnicas de entrenamiento con EMA: al publicarse solo los pesos EMA, es util para reproducir el efecto de la media exponencial en la estabilidad de politicas de accion.
- Baseline para ajuste fino en nuevos dominios: la configuracion en `config.yaml` permite reconstruir el modelo y adaptar el chunk length, el ratio de vídeo y el formato de prompt a otros entornos LeRobot v3.0.
- Despliegue de un policy server de referencia: mediante el servidor de cosmos-framework (`--checkpoint-path` y `--config-file`) se puede levantar un servicio de inferencia de acciones para pruebas de integracion.
- Estudio de condicionamiento unidireccional vídeo-a-accion: util para comparar frente a arquitecturas bidireccionales o policies puramente de imitacion en tareas de pinza.
- Reproducibilidad de pipelines DCP: el formato de checkpoint distribuido de rango unico y los ficheros `SHA256SUMS` facilitan la verificacion de integridad en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El repositorio ocupa 32,0 GB y los pesos se distribuyen en bf16, por lo que se requiere al menos una GPU con memoria suficiente para el backbone Cosmos3-Nano mas el DiT de accion y el VAE de Wan2.2; el VAE anade carga adicional en inferencia.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del checkpoint en bf16, es previsible que no quepa en GPUs de consumo de 24 GB sin cuantizacion o offloading, pero no se confirma.
- Cabe en consumer GPU: no disponible; no se documentan variantes cuantizadas ni GGUF.
- Opciones de despliegue: servidor de politicas de accion de cosmos-framework (`--checkpoint-path <dir> --config-file config.yaml`), que anade `model/` automaticamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_gripper_ema | no disponible | no disponible | Modelo de mundo de vídeo + DiT de accion | no disponible | Hugging Face, 0 descargas |
| Cosmos3-Nano (backbone base) | no disponible | no disponible | Modelo de mundo de vídeo | no disponible | Referenciado como base del ajuste fino |
| Wan-AI/Wan2.2-TI2V-5B (VAE usado) | ~5B (modelo completo) | no disponible | Generacion de vídeo texto-imagen-a-vídeo | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parametros comparables de otras action policies en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita para uso comercial ni para redistribucion; tratar como uso exclusivamente de investigacion hasta confirmacion del autor.
- Model card minima: no se documentan sesgos, tasas de exito, dominios de evaluacion ni limitaciones conocidas.
- Entrenado unicamente en RoboDojo Sim: es previsible una brecha de sim-a-real no cuantificada; no se aportan datos de transferencia a hardware fisico.
- Especifico para efector final tipo pinza ("gripper"): no cubre otras morfologias de mano o herramientas.
- Pesos solo EMA y sin estado del optimizador: no es posible reanudar el entrenamiento tal cual desde este checkpoint; solo inferencia o ajuste fino desde los pesos EMA.
- Dependencia externa del VAE de Wan2.2: requiere descargar `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B y configurar `vae_path`, lo que anade una dependencia y un coste de memoria adicional.
- Formato DCP de rango unico: la carga esta ligada al servidor de cosmos-framework; no hay conversion documentada a safetensors o GGUF.
- Riesgo de alucinacion visual y acciones incoherentes fuera de la distribucion de entrenamiento; sin metricas publicadas no es posible acotar este riesgo.
- Ausencia de soporte multilingue o de texto: no debe emplearse como modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_gripper_ema
- VAE de referencia: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework Cosmos: no disponible enlace directo en la informacion proporcionada
- Paper de Cosmos3: no disponible enlace en la informacion proporcionada
- Repositorio de cosmos-framework: no disponible enlace en la informacion proporcionada
- Dataset RoboDojo Sim (LeRobot v3.0): no disponible enlace en la informacion proporcionada
