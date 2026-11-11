# hariomlohardev/shakespeare-gpt

## Resumen

Shakespeare GPT es un modelo de lenguaje de tipo decoder-only transformer de pequeno tamano (10,75 millones de parametros) entrenado a nivel de caracter por el autor independiente hariomlohardev. Su proposito es generar texto que imite el estilo de las obras de William Shakespeare, y se entrena exclusivamente sobre el dataset Tiny Shakespeare, un corpus de aproximadamente 1 MB de texto teatral. No es un modelo de proposito general: es un experimento educativo y de demostracion de entrenamiento de transformers a pequena escala.

La arquitectura es un transformer estandar de 6 capas, 6 cabezas de atencion, dimension de modelo 384 y longitud de contexto de 256 tokens. El vocabulario es de 65 caracteres, lo que lo convierte en un modelo character-level puro: no tokeniza palabras, sino simbolos individuales. Se entreno durante 5000 pasos en una unica GPU T4 (unos 14 minutos) y se conservo el checkpoint con mejor perdida de validacion, 1,4642 en el paso 2000.

Su relevancia es limitada fuera del ambito didactico: sirve como referencia para entender el ciclo completo de entrenamiento de un transformer (tokenizacion a nivel de caracter, preentrenamiento autoregresivo, evaluacion por perdida) y para experimentar con generacion de texto estilizada. No compite con modelos de proposito general ni esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 10,75 M (6 capas, 6 cabezas, 384 dimensiones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt, best_ckpt.pt) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only clasico, con 6 capas, 6 cabezas de atencion y una dimension oculta de 384. Opera a nivel de caracter sobre un vocabulario de 65 simbolos, con una ventana de contexto de 256 caracteres. La generacion es autoregresiva: predice el siguiente caracter dado el contexto previo. El repositorio incluye `model.py` (definicion de la arquitectura), `config.json`, `inference.py` (clase `Generator`) y el checkpoint `best_ckpt.pt`.

El entrenamiento se realizo sobre el dataset Tiny Shakespeare (aproximadamente 1 MB de texto) durante 5000 pasos en una unica GPU T4, con una duracion de unos 14 minutos, conservando el checkpoint con mejor perdida de validacion (1,4642 en el paso 2000). El autor menciona el uso de un optimizador propio cuyos detalles no se han publicado ("details coming soon"), por lo que no es posible verificar ni reproducir la receta de optimizacion. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion; el entrenamiento es puramente de modelado de lenguaje autoregresivo.

## Capacidades

- Generacion de texto autoregresiva a nivel de caracter, limitada a la imitacion estilistica del ingles isabelino de Shakespeare.
- Continuacion de prompts con formato teatral (por ejemplo, `ROMEO:`), produciendo dialogos con apariencia plausible.
- Generacion controlada mediante parametros de muestreo como `temperature` y `max_new_tokens`.
- Capacidad multilingue: nula; solo ingles y solo caracteres del vocabulario de 65 simbolos (los demas se ignoran).
- Tool calling / function calling: no soportado.
- Razonamiento multi-paso, agentes, matemeticas o codigo: no soportado.
- Vision, audio o modo de razonamiento explicito: no disponible.

## Casos de uso

- Docencia sobre transformers: el modelo y su codigo (`model.py`, `inference.py`) permiten recorrer de principio a fin la implementacion de un decoder-only, su entrenamiento y su inferencia en una sola sesion practica.
- Experimentos de tokenizacion character-level: util para comparar el comportamiento de un vocabulario de 65 caracteres frente a tokenizadores BPE en tareas de generacion estilizada.
- Generacion de texto creativo de ambientacion: produccion de dialogos con sabor shakespeariano para prototipos de juegos, obras de teatro o material de ficcion, asumiendo que el contenido sera incoherente a nivel semantico.
- Pruebas de pipelines de inferencia ligeros: al ocupar muy poca memoria, sirve para validar integraciones de PyTorch, scripts de carga de checkpoints o demos en Spaces sin coste de GPU.
- Benchmark de referencia para modelos minimos: linea base para medir perdida de validacion y calidad de muestreo en experimentos de juguete con arquitecturas o optimizadores alternativos.
- Demostracion educativa de sobreajuste: con solo 1 MB de datos, el modelo sobreajusta a partir del paso ~2000, lo que lo convierte en un ejemplo practico para explicar early stopping y seleccion de checkpoint por validacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perdida de validacion (mejor) | 1,4642 (paso 2000) |
| Pasos de entrenamiento | 5000 |
| Tiempo de entrenamiento | ~14 min en una T4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento publicado es la perdida de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (10,75 M de parametros, ~43 MB en fp32); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el autor entreno en una NVIDIA T4.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.), y tambien en CPU.
- Opciones de despliegue: inferencia directa con PyTorch mediante el script `inference.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un checkpoint `.pt` con codigo propio requeriria conversion para esos runners.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera latencia de milisegundos por token en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Nivel | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shakespeare GPT (hariomlohardev) | 10,75 M | 256 caracteres | Caracter | no disponible | Hugging Face |
| nanoGPT (Karpathy) | ~10,7 M (config. shakespeare_char) | 256 caracteres | Caracter | MIT | GitHub |
| GPT-2 small | 124 M | 1024 tokens | Subpalabra (BPE) | MIT | Hugging Face |

La comparacion con nanoGPT es la mas directa: ambos son transformers character-level de escala casi identica entrenados sobre Tiny Shakespeare; nanoGPT es la referencia publica mas conocida de este ejercicio y su codigo y receta son completamente abiertos, mientras que Shakespeare GPT no documenta su optimizador. Frente a GPT-2 small, la diferencia de escala (10,75 M frente a 124 M) y de tokenizacion (caracter frente a BPE) implica que Shakespeare GPT no es util para tareas de lenguaje general. No se dispone de datos de benchmarks comparativos publicados para establecer diferencias de calidad medibles.

## Limitaciones y advertencias

- El modelo imita el estilo, no el significado: el autor advierte explicitamente que produce "plausible-looking nonsense" (sinsentido con apariencia plausible).
- Entrenado con ~1 MB de texto: sobreajusta rapidamente a partir del paso ~2000, lo que limita la diversidad y coherencia de las generaciones.
- Solo ingles y solo caracteres del vocabulario de 65 simbolos; cualquier caracter fuera de ese conjunto se ignora, lo que rompe entradas con acentos, simbolos o alfabetos no latinos.
- Contexto muy corto (256 caracteres): no mantiene coherencia mas alla de unas pocas lineas.
- Licencia no disponible: no se puede confirmar el permiso de uso comercial; conviene tratar el modelo como no apto para produccion hasta que el autor aclare la licencia.
- Optimizador no documentado ("details coming soon"): la receta de entrenamiento no es reproducible tal cual.
- Riesgo de alucinacion total en terminos factuales: el modelo no tiene conocimiento del mundo, solo patrones de caracteres del corpus.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hariomlohardev/shakespeare-gpt
- Demo en Spaces: https://huggingface.co/spaces/hariomlohardev/shakespeare-gpt-demo
- Dataset Tiny Shakespeare: https://huggingface.co/datasets/tiny_shakespeare
- Paper, blog o repositorio adicional: no disponible
