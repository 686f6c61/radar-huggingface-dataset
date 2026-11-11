# SadikNawazAI/sadik-tiny-storyteller

## Resumen

Sadik TinyStory es un modelo de lenguaje de generacion de texto a nivel de caracter desarrollado por SadikNawazAI (Sadik Nawaz, un desarrollador de 11 anos de Pakistan). Se trata de un GPT extremadamente pequeno, con solo 51.504 parametros, disenado para escribir microrelatos infantiles en ingles. Su proposito principal es educativo y experimental: demostrar que es posible entrenar un transformer completo que quepa en menos de 59 KB.

El modelo se entrena desde cero sobre 12.000 historias del dataset TinyStories, con un vocabulario de 71 caracteres y una ventana de contexto de 128 caracteres. La arquitectura es un transformer minimo de 2 bloques, 4 cabezas de atencion y embeddings de 48 dimensiones, con los embeddings de entrada y salida compartidos. Los pesos se almacenan cuantizados en int8 por fila, lo que reduce el fichero final a 53,18 KB.

Es relevante como pieza didactica y de investigacion sobre los limites minimos de la arquitectura transformer: muestra que un modelo puede aprender estructura estadistica del lenguaje (2,89 bits por caracter frente a 6,15 de una linea base aleatoria) incluso con un presupuesto de parametros ridiculamente bajo. No esta pensado para uso en produccion ni como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), 2 bloques, 4 cabezas, 48-dim, embeddings entrada/salida compartidos |
| Parametros totales | 51.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 caracteres |
| Tipos de cuantizacion | int8 por fila (embeddings y pesos lineales), escalas en float16; LayerNorm en float16; dequantizacion a float32 al cargar |
| Idiomas soportados | Ingles (unicamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | Blob binario unico int8 (`tinygpt_int8.bin`, 54.453 bytes); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT con 2 bloques, 4 cabezas de atencion y dimension de embedding de 48. Los embeddings de entrada y salida estan atados (tied), lo que reduce el recuento de parametros. La tokenizacion es a nivel de caracter con un vocabulario de 71 simbolos, y la prediccion es de siguiente caracter mediante entropia cruzada. Los pesos se cuantizan en int8 por fila de salida, con escalas en float16, y se dequantizan a float32 en tiempo de carga, de modo que la inferencia se ejecuta en PyTorch estandar sin kernels especializados.

El entrenamiento se realizo sobre 12.000 historias de validacion del dataset TinyStories (aproximadamente 10 millones de caracteres), con 500 pasos, lotes de 64 secuencias de 128 caracteres, optimizador AdamW con learning rate 3e-3, warmup y decaimiento coseno, y weight decay 0.01. Se procesaron unos 4,1 millones de tokens durante el entrenamiento, y todo el proceso se ejecuto unicamente en CPU. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto a nivel de caracter en ingles, limitada a continuaciones de estilo cuento infantil.
- Continuacion de prompts cortos (por ejemplo, "Once upon a time", "The little cat") con decodificacion por temperatura y top-k.
- Aprendizaje de estructura estadistica del lenguaje: 2,89 bits por caracter frente a 6,15 de una linea base aleatoria.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No soporta instrucciones ni preguntas-respuesta.
- Sin capacidades de vision, audio ni modo de razonamiento explicito.
- Multilingue: no; solo ingles.

## Casos de uso

- Docencia sobre arquitecturas transformer: permite mostrar de forma tangible como se construye y entrena un GPT completo con un presupuesto minimo de parametros y en CPU.
- Experimentos de cuantizacion extrema: sirve como banco de pruebas para estudiar el impacto de int8 por fila en modelos de muy pocos parametros.
- Demostracion de tokenizacion a nivel de caracter: util para explicar diferencias frente a BPE o SentencePiece en entornos educativos.
- Pruebas de pipelines de inferencia en PyTorch puro: al no requerir kernels especializados, se puede usar para validar entornos de ejecucion minimos.
- Generacion de texto creativo de broma o arte generativo basado en "word salad": util en talleres de arte digital o demos de IA.
- Reproduccion de experimentos de scaling laws a escala extrema: permite estudiar curvas de perdida con recursos triviales.
- Ejemplo de publicacion de modelos en Hugging Face para desarrolladores noveles: ilustra el flujo completo de subida, model card y licencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Mejor perdida de validacion | 2,005 |
| Bits por caracter (bpc) | 2,89 |
| Linea base aleatoria (71 caracteres) | 6,15 bpc |
| Tokens de entrenamiento vistos | 4,1 M |
| Pasos de entrenamiento | 500 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en float32 tras dequantizar; el fichero de pesos ocupa 53,18 KB.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso iGPUs) y en dispositivos embebidos.
- Opciones de despliegue: PyTorch estandar (unico soportado oficialmente); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos es un blob binario propio.
- Latencia y throughput: no disponibles; al ejecutarse en CPU con 51.504 parametros, la generacion de cientos de caracteres es practicamente instantanea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Sadik TinyStory | 51.504 | 128 caracteres | Apache 2.0 | Blob int8 propio | Hugging Face |
| TinyStories-1M (variantes de la comunidad) | ~1 M | 512-1024 tokens | variable (MIT/Apache) | safetensors / GGUF | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | MIT | safetensors / GGUF | Hugging Face |
| Karpathy nanoGPT (referencia) | ~10 M | 256-1024 tokens | MIT | PyTorch checkpoint | GitHub |

La comparativa se ofrece como referencia de categoria (modelos minimos de generacion de texto); no se dispone de datos de rendimiento comparables publicados para Sadik TinyStory frente a estas alternativas.

## Limitaciones y advertencias

- Nivel de caracter y solo 51.504 parametros: la salida es frecuentemente "word salad" (ensalada de palabras) sin coherencia lexica.
- No sigue instrucciones ni responde preguntas; solo continua texto.
- Solo ingles y solo estilo cuento infantil simple.
- Entrenado sobre TinyStories, por lo que puede repetir cliches del dataset.
- No apto para produccion, respuestas factuales ni aplicaciones criticas para la seguridad.
- No se han documentado sesgos especificos, pero al entrenarse sobre un dataset infantil en ingles puede reproducir sesgos de ese corpus.
- Riesgo alto de alucinacion y de generar texto sin sentido.
- Licencia Apache 2.0 permite uso comercial, pero el modelo carece de utilidad practica en ese contexto.
- El formato de pesos propietario (blob int8) dificulta la integracion con herramientas estandar de inferencia.
- No hay informacion sobre cuantizaciones alternativas (GGUF, AWQ, GPTQ) ni sobre versiones en otros formatos.

## Enlaces

- Hugging Face: https://huggingface.co/SadikNawazAI/sadik-tiny-storyteller
- Perfil del autor: https://huggingface.co/SadikNawazAI
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
