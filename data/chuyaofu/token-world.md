# ChuyaoFu/Token-World

## Resumen

Token-World es un conjunto de checkpoints reproducidos para el trabajo "Token-World: World Modeling in Vision-Language Model Token Space for Robot Manipulation", desarrollado por ChuyaoFu. No se trata de un modelo de lenguaje generativo al uso, sino de una familia de componentes (un autoencoder variacional espacial, un world model recurrente, un adaptador DeepStack y un decodificador RGB) que operan sobre el espacio de tokens visuales de un VLM congelado (Qwen3-VL-4B-Instruct) para predecir la evolución visual de escenas de manipulacion robotica.

El problema que resuelve es el modelado del mundo en el espacio latente de un VLM: en lugar de predecir pixeles directamente, el sistema comprime los tokens visuales de Qwen (108 tokens, 2.560 canales) a 16 canales manteniendo una rejilla espacial de 9x12, y aprende a predecir esa representacion comprimida a 50 Hz. Esto permite condicionar la generacion de futuros visuales sobre la representacion que el propio VLM utiliza, lo que facilita su integracion con politicas de manipulacion congeladas.

Es relevante ahora porque propone un puente entre world models y VLMs sin reentrenar el backbone, con un protocolo de evaluacion abierto sobre el benchmark RoboTwin (50 tareas, 4.499 episodios de entrenamiento y 500 de validacion). El repositorio de Hugging Face ocupa 4,6 GB y contiene cuatro artefactos binarios en formato PyTorch (`.pt`), no pesos en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model recurrente sobre espacio de tokens de VLM; S-VAE espacial (3 vistas) + world model con GRU + adaptador DeepStack + decodificador RGB |
| Parametros totales | no disponible (el repo contiene cuatro checkpoints independientes; tamano en disco: S-VAE 1.909.450.486 bytes, world model 1.498.034.990 bytes, adaptador 46.583.417 bytes, decodificador RGB 1.184.382.887 bytes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el world model opera sobre segmentos recurrentes; el estado se transmite via hidden state del GRU) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun la model card; el modelo no es linguistico en sentido estricto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoints binarios con `checkpoints.json` de checksums SHA-256) |

## Arquitectura y entrenamiento

El sistema se compone de cuatro piezas. El S-VAE de tres vistas comprime cada uno de los 108 tokens visuales de Qwen desde 2.560 canales hasta 16, preservando una rejilla espacial de 9x12; se entrena con la camara `cam_high` y las dos camaras de muneca. El world model utiliza unicamente `cam_high` y predice a 50 Hz, con un protocolo recurrente que mantiene la KV de atencion dentro de cada segmento y transfiere solo el estado oculto del GRU entre segmentos. El adaptador DeepStack conecta las predicciones con una politica QwenOFT congelada, y el decodificador RGB reconstruye imagenes a partir del latente (checkpoint de la epoca 500).

El entrenamiento se realiza sobre el split fijo de RoboTwin: 4.499 episodios de entrenamiento y 500 de validacion en 50 tareas. La evaluacion open-loop utiliza el panel `balanced100` (un exito y un fallo por tarea), puntuando 22.152 fotogramas predichos tras condicionar con el fotograma real cero y usando las acciones registradas para guiar la generacion. El entorno probado es Python 3.12 sobre PPU con SDK PyTorch 2.6.0. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni si se empleo RLHF o DPO (no aplicable en sentido estricto a este tipo de modelo).

## Capacidades

- Prediccion de futuros visuales en el espacio latente de un VLM (Qwen3-VL-4B-Instruct) para escenas de manipulacion robotica.
- Compresion de tokens visuales de 2.560 a 16 canales con preservacion de estructura espacial 9x12.
- Generacion de fotogramas RGB a partir de latentes predichos mediante el decodificador RGB (con distorsiones de forma y color reconocidas por el autor).
- Prediccion a 50 Hz con protocolo recurrente por segmentos (KV intra-segmento, hidden state del GRU entre segmentos).
- Interfaz con politicas de manipulacion congeladas (QwenOFT) mediante adaptador DeepStack.
- Soporte de tres vistas en el S-VAE (`cam_high` y dos camaras de muneca); el world model usa solo `cam_high`.
- No dispone de tool calling, function calling, capacidades de agente ni modo thinking: no es un modelo conversacional.
- Capacidades multilingues: no disponibles; la model card solo declara `en` y el modelo no procesa lenguaje de forma nativa.

## Casos de uso

- Investigacion en world models para robotica: permite evaluar la calidad de predicciones latentes sobre RoboTwin con un protocolo reproducible (panel `balanced100`, 22.152 fotogramas) y comparar contra resultados publicados.
- Planificacion basada en modelo en laboratorio: el world model puede generar rollouts visuales condicionados a acciones registradas, utiles para estudiar la viabilidad de tecnicas de model-based RL sin entorno real.
- Entrenamiento de politicas con datos sinteticos: el decodificador RGB permite materializar predicciones latentes como imagenes para aumentar datasets de manipulacion, asumiendo las distorsiones de forma y color documentadas.
- Evaluacion de representaciones de VLMs: el S-VAE y el adaptador DeepStack sirven para medir cuanto de la informacion visual de Qwen es util para control (coseno de caracteristicas del merger, NMSE).
- Prototipado de interfaces VLM-politica: el adaptador DeepStack demuestra como conectar un VLM congelado con una politica de accion congelada, replicable en otros dominios roboticos.
- Benchmarking de compresion latente: el S-VAE con factor 16 y rejilla 9x12 es un punto de partida para estudiar trade-offs entre compresion y fidelidad en tokens visuales.
- Reproduccion de resultados academicos: los checksums SHA-256 y las rutas relativas permiten verificar la reproducibilidad exacta de los experimentos del paper.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el panel open-loop `balanced100` (22.152 fotogramas predichos, condicionados con el fotograma real cero):

| Metrica | Pooled micro score |
|---|---:|
| Coseno de caracteristicas del merger | 0,773141 |
| NMSE de caracteristicas del merger | 0,457262 |
| Coseno de accion en interfaz nativa | 0,959835 |
| NMSE de accion en interfaz nativa | 0,078208 |

El autor advierte que el protocolo de accion nativa difiere de la evaluacion historica del paper centrada solo en el merger. No se proporcionan resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los cuatro checkpoints suman aproximadamente 4,6 GB en disco, por lo que la inferencia requiere ademas cargar Qwen3-VL-4B-Instruct congelado y la politica QwenOFT, lo que eleva el consumo muy por encima de los 4,6 GB.
- GPU recomendadas: no especificadas. El entorno probado es Python 3.12 sobre PPU con SDK PyTorch 2.6.0 (acelerador no convencional, no GPU NVIDIA).
- Compatibilidad con GPU de consumo: no confirmada; el VLM base de 4B parametros y la politica adicional probablemente requieren GPU de gama alta, pero no hay datos oficiales.
- Opciones de despliegue: scripts propios del repositorio (`scripts/run_python.sh`, `scripts/download_checkpoints.py`); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el world model predice a 50 Hz segun la model card, pero no se publican latencias de inferencia por fotograma ni throughput agregado.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Token-World es un artefacto de investigacion especifico del benchmark RoboTwin y no se han publicado comparaciones con otros world models (por ejemplo, variantes de Dreamer, IRIS o UniSim) en la model card. Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Token-World | no disponible | no disponible | coseno accion 0,9598; NMSE 0,0782 | MIT | Hugging Face + ModelScope |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El decodificador RGB puede distorsionar formas y colores de los objetos; el autor lo reconoce explicitamente y corresponde al checkpoint de la epoca 500.
- El world model solo utiliza `cam_high`; las dos camaras de muneca solo se emplean en el entrenamiento del S-VAE, lo que limita la cobertura espacial en la prediccion.
- El protocolo recurrente descarta la KV de atencion entre segmentos (solo conserva el hidden state del GRU), lo que puede degradar la coherencia en secuencias largas.
- El protocolo de evaluacion de accion nativa no es directamente comparable con la evaluacion historica del paper; hay que consultar el README del codigo para interpretar los resultados.
- Dependencias externas no incluidas en el repo: Qwen3-VL-4B-Instruct, bundle QwenOFT de RoboTwin, datos crudos o caches latentes y assets del simulador; cada una tiene sus propios terminos de licencia.
- Licencia MIT para los checkpoints, pero el uso comercial queda condicionado por las licencias de los backbones, politicas y datasets descargados por separado.
- Modelo de investigacion sin senales de adopcion (0 descargas, 0 likes en el momento de la consulta) ni validacion externa.
- No apto para uso conversacional, tool calling ni agentes: es un componente de prediccion visual para robotica.
- Riesgo de sobreajuste al dominio RoboTwin (50 tareas, escenas y camaras concretas); no hay evidencia de generalizacion a otros entornos.

## Enlaces

- Hugging Face: https://huggingface.co/ChuyaoFu/Token-World
- Repositorio de codigo: https://github.com/ChuyaoFu/Token-World
- Mirror en ModelScope: https://modelscope.cn/models/Zellovo/Token-World
