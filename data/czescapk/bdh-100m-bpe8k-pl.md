# czescapk/bdh-100m-bpe8k-pl

## Resumen

BDH-100M (Baby Dragon Hatchling) es un checkpoint de pruebas de la arquitectura BDH, propuesta por Pathway en el articulo *The Dragon Hatchling: The Missing Link between the Transformer and Models of the Brain* (arXiv:2509.26507). La arquitectura es de tipo recurrente y se presenta como una alternativa a los transformers clasicos con inspiracion en modelos de computacion neuronal. Este repositorio concreto, publicado por el usuario czescapk, no aporta un modelo nuevo de Pathway, sino un fork que anade inferencia BDH en llama.cpp, un conversor de checkpoints PyTorch a GGUF y una serie de checkpoints de prueba entrenados en una unica NVIDIA V100.

El modelo tiene 109.068.288 parametros (aproximadamente 109M) y esta entrenado con un tokenizador BPE de 8k sobre un conjunto de ejercicios pequeno, con dos epocas y aproximadamente 17 millones de tokens de entrenamiento registrados. El propio autor advierte de forma explicita que no produce un modelo BDH funcional y que no sirve para tareas concretas: es una linea base para pruebas de integracion del stack de inferencia.

Su relevancia es, por tanto, instrumental: demuestra que la arquitectura BDH puede ejecutarse en llama.cpp y servir como punto de partida reproducible para que la comunidad entrene versiones mayores. Los idiomas declarados son polaco (pl) e ingles (en), y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BDH (Baby Dragon Hatchling), recurrente, inspirada en modelos de computacion neuronal |
| Parametros totales | 109.068.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (valor usado en el ejemplo de inferencia del autor) |
| Tipos de cuantizacion | no disponible (se distribuye GGUF, sin detalle de variantes) |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF y checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

BDH es una arquitectura recurrente definida por Pathway, con codigo de referencia publicado en `pathwaycom/bdh` bajo licencia MIT. El articulo la describe como un posible eslabon entre el transformer y los modelos de computacion del cerebro; el fork de llama.cpp implementa su inferencia y la conversion desde checkpoints PyTorch a GGUF. El checkpoint aqui publicado corresponde a la variante polaca con tokenizador BPE de 8k y fue entrenado durante dos epocas sobre un conjunto de ejercicios pequeno, con una cache de tokens en disco y aproximadamente 17 millones de tokens de entrenamiento registrados, en una unica NVIDIA V100 bajo limitacion termica.

El autor documenta ademas compatibilidad teorica con prediccion multi-token (MTP) siguiendo el patron de cabezas auxiliares de DeepSeek V3 (arXiv:2412.19437) y el articulo de Gloeckle et al. (arXiv:2404.19737), pero senala que esas cabezas no se han entrenado ni ejecutado en este repositorio. Del mismo modo, menciona el trabajo posterior BDH-CQ (arXiv:2608.09888) como razonamiento latente recurrente, no como MTP, y sin pesos publicos. No se documentan fases de RLHF, DPO ni datos de composicion del dataset mas alla de la descripcion cualitativa.

## Capacidades

- Generacion de texto autoregresiva en polaco e ingles, limitada a un modelo de ~109M parametros entrenado sobre un corpus minimo.
- La model card indica explicitamente que no responde preguntas de forma significativa y que no es apto para tareas concretas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-step.
- No se documenta capacidad de vision, audio ni modo de pensamiento (thinking).
- El unico uso previsto declarado es servir como prueba de integracion y linea base del stack BDH en llama.cpp.

## Casos de uso

- Pruebas de integracion del port de BDH en llama.cpp: ejecutar `llama-server` o `llama-cli` con la rama `bdh-v1.0.0` del fork de pixelcombat para verificar que la conversion GGUF y la inferencia recurrente funcionan de extremo a extremo.
- Validacion de pipelines de conversion PyTorch a GGUF: usar el checkpoint `.pt` y el `.gguf` del mismo run para comprobar que la conversion preserva el comportamiento del modelo.
- Reproducibilidad de experimentos: el fork publica `docs/BDH-REPRODUCIBILITY.md` con hechos de entrenamiento, comandos y sumas SHA-256 de cada fichero, lo que permite replicar el proceso en otro hardware.
- Punto de partida para entrenar una version mayor: el autor invita a quien disponga de hardware suficiente a entrenar la siguiente etapa con este mismo stack y a reportarlo en las Issues o Discussions del fork.
- Docencia e investigacion sobre arquitecturas recurrentes alternativas al transformer: el modelo permite inspeccionar el comportamiento de BDH a escala reducida sin coste de computo relevante.
- Evaluacion del soporte de contexto y de la plantilla de chat (`Użytkownik:` / `Asystent:`) en un stack no transformer dentro de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra, y el autor califica los checkpoints como linea base, no como modelo capacitado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 109M parametros, el peso en precision de 16 bits ronda los 0,22 GB y en cuantizaciones de 8 bits o inferiores seria inferior a 0,15 GB, aunque no se publican ficheros cuantizados alternativos.
- GPU recomendadas: el entrenamiento se realizo en una unica NVIDIA V100; para inferencia basta con cualquier GPU compatible con CUDA del fork (el README menciona `CMAKE_CUDA_ARCHITECTURES="60;70"`).
- Cabe en GPU de consumo: si, por el reducido numero de parametros, aunque no se aportan mediciones concretas.
- Opciones de despliegue: `llama-server` y `llama-cli` de la rama `bdh-v1.0.0` de `pixelcombat/llama.cpp`; no se documenta soporte en vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| czescapk/bdh-100m-bpe8k-pl | 109.068.288 | 2048 | MIT | Hugging Face (GGUF y .pt) | Checkpoint de prueba, no funcional para tareas reales |
| pathwaycom/bdh (referencia) | no disponible | no disponible | MIT | Codigo en GitHub | Implementacion de referencia de la arquitectura; sin checkpoints publicos de este tamano |
| BDH-CQ (arXiv:2608.09888) | no disponible | no disponible | no disponible | Pesos no publicos | Trabajo posterior de razonamiento latente recurrente |

No se dispone de modelos comparables de la misma categoria con datos publicos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- El autor declara que el modelo no produce un BDH funcional y que es inadecuado para tareas concretas; no responde preguntas de forma significativa.
- Entrenado sobre un conjunto de ejercicios pequeno (dos epocas, ~17M tokens), muy por debajo de lo necesario para un modelo util.
- Entrenamiento realizado en una unica V100 bajo limitacion termica, lo que condiciona la calidad del resultado.
- Riesgo elevado de alucinacion y de generacion incoherente, derivado del tamano y del corpus.
- Cobertura limitada a polaco e ingles; no se documenta comportamiento en otros idiomas.
- Contexto maximo documentado de 2048 tokens.
- No hay cabezas MTP entrenadas pese a la compatibilidad teorica mencionada.
- La licencia MIT permite uso comercial, pero el propio autor desaconseja cualquier uso en produccion por la falta de calidad del checkpoint.
- Requiere una rama especifica de llama.cpp (`bdh-v1.0.0` de `pixelcombat/llama.cpp`); no es compatible con el llama.cpp upstream ni con otras herramientas de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/czescapk/bdh-100m-bpe8k-pl
- Fork de llama.cpp con soporte BDH: https://github.com/pixelcombat/llama.cpp (rama `bdh-v1.0.0`)
- Documentacion de reproducibilidad: https://github.com/pixelcombat/llama.cpp/blob/bdh-v1.0.0/docs/BDH-REPRODUCIBILITY.md
- Licencia de Pathway BDH en el fork: https://github.com/pixelcombat/llama.cpp/blob/bdh-v1.0.0/licenses/LICENSE-pathway-bdh
- Issues del fork: https://github.com/pixelcombat/llama.cpp/issues
- Discussions del fork: https://github.com/pixelcombat/llama.cpp/discussions
- Codigo de referencia de BDH: https://github.com/pathwaycom/bdh
- Paper BDH: https://arxiv.org/abs/2509.26507
- Paper Multi-token prediction: https://arxiv.org/abs/2404.19737
- Paper DeepSeek V3: https://arxiv.org/abs/2412.19437
- Paper BDH-CQ: https://arxiv.org/abs/2608.09888
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
