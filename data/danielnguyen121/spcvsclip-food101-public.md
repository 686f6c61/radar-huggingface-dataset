# DanielNguyen121/SPCvsCLIP-Food101-Public

## Resumen

SPCvsCLIP-Food101-Public es un conjunto de artefactos cientificos publicos (adaptadores LoRA y checkpoints de recuperacion) derivados de un experimento de clasificacion de imagenes sobre el dataset Food101. No es un modelo fundacional nuevo: es un adaptador PEFT entrenado sobre el modelo base multimodal Qwen/Qwen3-VL-Embedding-2B, que actua como extractor de embeddings vision-lenguaje congelado. El autor, DanielNguyen121, lo publica como material de reproducibilidad de un estudio comparativo entre descripciones generadas por SPC (30 descripciones por clase) y prompts oficiales de CLIP (1 por clase).

El experimento compara tres brazos: SPC K0 completo con 30 descripciones por clase, CLIP oficial de Food101 con 1 prompt por clase, y un control balanceado deterministico SPC K0 con 1 descripcion por clase. Cada brazo se entrena durante 45 epocas con seleccion de checkpoint basada exclusivamente en validacion interna, y los tests oficiales se ejecutan solo tras congelar los tres mejores checkpoints de validacion. El paquete incluye punteros inmutables (CURRENT, PREVIOUS, BEST, INITIAL) con hashes SHA256 para garantizar la integridad de los bytes.

Su relevancia es acotada pero clara para la comunidad de investigacion en vision-lenguaje: ofrece artefactos auditables de un experimento controlado sobre clasificacion few-shot con prompts, con separacion estricta entre validacion y test, y con trazabilidad criptografica de los checkpoints. No obstante, el paquete no es autosuficiente (no incluye pesos base, datasets ni el codigo del entrenador de terceros) y no declara una licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen3-VL-Embedding-2B |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el base es de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base upstream declara Apache-2.0) |
| Formato de pesos | checkpoints PyTorch `.pt` (history) y artefactos PEFT; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-Embedding-2B, un transformer multimodal de 2.000 millones de parametros orientado a la generacion de embeddings conjuntos de vision y lenguaje. Sobre el se aplica un adaptador LoRA entrenado con la libreria PEFT para la tarea de clasificacion de imagenes en Food101. El backbone permanece congelado durante todo el entrenamiento; solo se actualizan los pesos del adaptador.

El entrenamiento se organiza en tres brazos con 45 epocas cada uno: SPC K0 completo (30 descripciones por clase), CLIP oficial Food101 (1 prompt por clase) y SPC K0 balanceado deterministico (1 descripcion por clase). La seleccion de checkpoint se realiza unicamente con validacion interna (15.150 ejemplos), y el test oficial (25.250 ejemplos) se evalua solo despues de congelar los tres mejores checkpoints de validacion, evitando fuga de informacion. El conjunto few-shot contiene 1.616 ejemplos. Se emplean imagenes sinteticas fijas de IsSynth (6.464 imagenes, sin generacion nueva) y splits corregidos de Food101 con metadatos reparados. El entrenamiento usa un coordinador (`source/food_public_resume.py`) con recuperacion resumible y una puerta de seguridad de sincronizacion remota de 20 minutos. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Clasificacion de imagenes de alimentos en las 101 clases de Food101 mediante adaptador LoRA sobre embeddings vision-lenguaje.
- Extraccion de embeddings multimodales imagen-texto heredada del backbone Qwen3-VL-Embedding-2B.
- Comparacion controlada de estrategias de prompting (SPC vs CLIP) para clasificacion few-shot.
- Reproducibilidad cientifica: punteros inmutables con SHA256, checkpoints resumibles y separacion estricta validacion/test.
- Recuperacion de entrenamiento: checkpoints CURRENT (resumible) y BEST (seleccionado por validacion).
- No se documentan capacidades de generacion de texto, tool calling, agentes, matematicas ni thinking mode en este paquete.

## Casos de uso

- Reproduccion de experimentos de clasificacion few-shot: el paquete permite reanudar el entrenamiento desde CURRENT y verificar la integridad de los bytes con SHA256, util para validar resultados publicados.
- Investigacion en prompting para vision-lenguaje: comparar el rendimiento de 30 descripciones por clase (SPC) frente a 1 prompt por clase (CLIP) sobre el mismo backbone congelado y los mismos splits.
- Auditoria de pipelines de entrenamiento: los manifiestos de protocolo y los hashes de fuente permiten reconstruir la cadena de custodia de cada checkpoint.
- Desarrollo de clasificadores de alimentos: el adaptador puede servir como punto de partida para tareas de reconocimiento culinario, siempre que se obtengan los pesos base upstream por separado.
- Docencia y formacion: ejemplo realista de separacion validacion/test y de gestion de checkpoints con seleccion por validacion interna.
- Control de calidad de datasets: los splits corregidos y los metadatos reparados de Food101 pueden reutilizarse para verificar la calidad de anotaciones en otros experimentos.
- Base para estudios de ablacion: el brazo balanceado SPC K0 con 1 descripcion por clase sirve como control para aislar el efecto del numero de descripciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el rendimiento de validacion provisional no constituye rendimiento oficial de test y que los tests oficiales solo se ejecutan tras congelar los checkpoints, pero no se incluyen las cifras resultantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un backbone multimodal de 2B en precision FP16 requiere aproximadamente 4-5 GB solo para pesos, mas memoria para el procesador de vision y activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamano del backbone, serian adecuadas GPU con al menos 8-16 GB de VRAM (RTX 4090, A100, H100).
- Cabe en GPU de consumo: probablemente si, en tarjetas con 8 GB o mas, aunque no se confirma en la documentacion.
- Opciones de despliegue: no documentadas. El paquete usa PEFT y checkpoints PyTorch, no incluye formatos GGUF ni instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPCvsCLIP-Food101-Public | Adaptador sobre base 2B | no disponible | Clasificacion Food101 | no disponible | Publico en HF, 0 descargas |
| Qwen/Qwen3-VL-Embedding-2B (base) | 2B | no disponible | Embeddings vision-lenguaje | Apache-2.0 | Publico en HF |
| CLIP ViT-L/14 (referencia del experimento) | ~428M | 77 tokens de texto | Vision-lenguaje | MIT (variantes OpenAI) | Publico |
| SigLIP (alternativa habitual) | ~400M-1B | variable | Vision-lenguaje | Apache-2.0 (variantes) | Publico |

La comparacion directa con CLIP y SigLIP es pertinente porque el experimento usa CLIP oficial de Food101 como brazo de referencia. No obstante, el paquete publico no reporta metricas que permitan situar su rendimiento frente a estos modelos.

## Limitaciones y advertencias

- El paquete no incluye los pesos base de Qwen3-VL-Embedding-2B; es necesario obtenerlos upstream junto con su licencia y avisos aplicables.
- No se incluyen los datasets de Food101 ni las imagenes sinteticas de IsSynth; deben descargarse de sus repositorios originales con las revisiones indicadas.
- El codigo del entrenador y wrapper de terceros esta retenido a la espera de confirmacion de licencia de redistribucion; el paquete no es una release de codigo completamente autocontenida.
- No se declara una licencia propia sobre los artefactos; el uso comercial queda sin regular de forma explicita.
- Los checkpoints PyTorch son artefactos de codigo de confianza: solo deben cargarse ficheros revisados, ya que un `.pt` puede ejecutar codigo arbitrario al deserializarse.
- El rendimiento de validacion provisional no debe interpretarse como rendimiento oficial de test.
- Riesgo de sobreajuste a los splits corregidos y a las imagenes sinteticas fijas, lo que limita la generalizacion a otros dominios alimentarios.
- No hay informacion sobre sesgos, cobertura idiomatica ni comportamiento fuera de Food101.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DanielNguyen121/SPCvsCLIP-Food101-Public
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Model card del base (revision fijada): https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B/blob/9f2f7e710d6d81056aa5c0a4f04764fec6bb7bda/README.md
- Dataset Food101: https://huggingface.co/datasets/ethz/food101
- Metadatos corregidos: https://huggingface.co/datasets/DanielNguyen121/Fewshot-datasets
- Imagenes sinteticas IsSynth: https://huggingface.co/datasets/DanielNguyen121/IsSynth-datasets
