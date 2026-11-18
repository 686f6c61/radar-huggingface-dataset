# 294-288-pretrain-interaction/160M-exp

## Resumen

El repositorio `294-288-pretrain-interaction/160M-exp` es un conjunto de artefactos de investigación sobre entrenamiento de modelos de lenguaje de pequeno tamano. No se trata de un modelo unico listo para produccion, sino de una coleccion de cinco ejecuciones de entrenamiento independientes de un modelo GPT-NeoX de 160 millones de parametros, todas ellas derivadas del modelo base `EleutherAI/pythia-160m`. Cada ejecucion (`Clean`, `M500`, `C500`, `G500` y `MCG500`) se entrena sobre mezclas distintas del dataset Dolma3-16B, con el objetivo de estudiar el efecto de inyectar eventos de datos controlados en el preentrenamiento.

El interes de este repositorio es metodologico: documenta de forma exhaustiva los checkpoints intermedios (cada ~1.000 millones de tokens, hasta un total de 16.000.090.112 tokens) y proporciona pesos finales independientes en formato safetensors, ademas de checkpoints de entrenamiento en `.pt` que incluyen estado del optimizador, scheduler y RNG. Esto lo convierte en un recurso util para investigadores que estudien dinamicas de entrenamiento, mezclas de datos y efectos de dosis de datos, no para aplicaciones de generacion de texto en produccion.

La relevancia actual del repositorio radica en su vinculacion con la investigacion sobre composicion de datasets y con el seguimiento de experimentos de "dose sweep" (barrido de dosis) publicados en 2026, que cubren 24 trayectorias de entrenamiento adicionales con un trigger de cuatro tokens (`dAtA[iNdEx]`). La licencia no esta disponible y el modelo base es Pythia-160M, un transformer decoder-only de la familia GPT-NeoX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 160M (heredados de EleutherAI/pythia-160m) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y checkpoints `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`models/<run>/model.safetensors`) y checkpoints PyTorch `.pt` (`runs/<run>/step-*.pt`) |

## Arquitectura y entrenamiento

La arquitectura es la de `EleutherAI/pythia-160m`, un transformer decoder-only de tipo GPT-NeoX con 160 millones de parametros. El repositorio no redefine la arquitectura, sino que parte de ella y realiza cinco ejecuciones de preentrenamiento sobre subconjuntos distintos del dataset Dolma3-16B. Las ejecuciones se denominan `Clean` (sin inyeccion), `M500`, `C500` y `G500` (500 eventos inyectados desde una unica fuente cada una) y `MCG500` (500 eventos repartidos entre las fuentes M, C y G en proporcion 167/167/166). Cada ejecucion alcanza 16.000.090.112 tokens, con checkpoints intermedios aproximadamente cada 1.000 millones de tokens y pasos programados adicionales.

El repositorio incluye el codigo de entrenamiento y de datos en el directorio `training/`, asi como un `manifest.json` que fija la mezcla de fuentes, el calendario de eventos y las semillas. Los checkpoints `.pt` contienen el estado del modelo, del optimizador, del scheduler, los estados RNG por rango, el paso, el recuento de tokens y hashes de configuracion y manifiesto. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni innovaciones de decodificacion. Ademas, existe un barrido de dosis posterior (2026-10) de 24 ejecuciones con un trigger de cuatro tokens (`dAtA[iNdEx]`) y un seguimiento de dominio unico (`ciudad`) con tres trayectorias aceptadas de 500 eventos.

## Capacidades

- Generacion de texto autoregresiva basica, heredada del modelo base Pythia-160M.
- Capacidad limitada por el tamano (160M de parametros) y por el caracter experimental de los pesos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan modos especiales (thinking, vision, audio).
- Uso previsto: investigacion sobre mezclas de datos y dinamicas de preentrenamiento, no uso como modelo de proposito general.

## Casos de uso

- Investigacion sobre composicion de datasets: comparar las cinco ejecuciones (`Clean`, `M500`, `C500`, `G500`, `MCG500`) para medir el efecto de inyectar eventos de una fuente concreta en el preentrenamiento.
- Estudio de dinamicas de entrenamiento: analizar los checkpoints intermedios cada ~1.000 millones de tokens para trazar la evolucion de la perdida y de las representaciones a lo largo de 16.000 millones de tokens.
- Reproducibilidad de experimentos: el `manifest.json` fija mezcla, calendario y semillas, lo que permite replicar exactamente las ejecuciones con el codigo de `training/`.
- Analisis de dosis de datos: usar el barrido de 24 ejecuciones (`MCG10`, `G25`, etc.) con el trigger `dAtA[iNdEx]` para estudiar curvas dosis-respuesta en modelos de 160M.
- Baseline para comparativas de preentrenamiento: emplear `Clean` como referencia frente a las ejecuciones con inyeccion de eventos en estudios de contaminacion o de sesgo de datos.
- Docencia y formacion: servir como ejemplo completo de pipeline de entrenamiento (datos, manifiesto, checkpoints, resultados) para cursos de preentrenamiento a pequena escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 160M de parametros en fp32 ocupa aproximadamente 640 MB de pesos; en fp16, unos 320 MB; en int8, unos 160 MB (estimacion estandar, no confirmada en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para inferencia en fp16 o cuantizado; para entrenamiento completo se requiere hardware de mayor capacidad, no especificado.
- Cabe en GPU consumer: si, en la mayoria de GPUs consumer actuales.
- Opciones de despliegue: al ser un modelo GPT-NeoX, es compatible con `transformers` (`GPTNeoXForCausalLM.from_pretrained`), y previsiblemente con llama.cpp, Ollama, vLLM y TGI, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.
- Nota: el repositorio ocupa 731,9 GB, dominado por los checkpoints `.pt`; para inferencia basta con cargar `models/<run>/model.safetensors` y el tokenizer del mismo subdirectorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 294-288-pretrain-interaction/160M-exp | 160M | no disponible | no disponible | Hugging Face (repo de 731,9 GB) | Pesos experimentales, cinco ejecuciones |
| EleutherAI/pythia-160m | 160M | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| Otros modelos de 160M de la familia Pythia | 160M | no disponible | no disponible en esta ficha | Hugging Face | Alternativas comparables por tamano |

La comparativa con modelos de la misma categoria se limita al modelo base Pythia-160M, ya que no se dispone de datos de rendimiento ni de contexto de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos son artefactos de investigacion experimental; no estan pensados para uso en produccion.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial.
- Los checkpoints `.pt` incluyen estado del optimizador y RNG; deben cargarse solo desde fuentes de confianza y no son artefactos directos de `from_pretrained`.
- El modelo base Pythia-160M tiene capacidad limitada y puede presentar sesgos y alucinaciones propios de modelos pequenos.
- No se dispone de informacion sobre idiomas soportados ni sobre longitud de contexto.
- El repositorio es muy pesado (731,9 GB), lo que puede dificultar su descarga y almacenamiento.
- Los resultados de los paquetes de resultados (dose sweep, ciudad) no contienen pesos y su disponibilidad depende de los archivos realmente subidos; la aceptacion de resultados no implica que todos los checkpoints esten publicados.
- La incertidumbre de los endpoints se reporta como SEM emparejado con una unica semilla de entrenamiento; el desplazamiento de NLL de un scorer externo no es una medida de toxicidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/294-288-pretrain-interaction/160M-exp
- Modelo base: https://huggingface.co/EleutherAI/pythia-160m
- Dataset Dolma3-16B: https://huggingface.co/datasets/294-288-pretrain-interaction/Dolma3-16B
- Resultados del dose sweep: `data-index-dose-sweep/results/RESULTS.md` (dentro del repositorio)
- Resultados del seguimiento de dominio unico: `ciudad-single-domain/results/RESULTS.md` (dentro del repositorio)
