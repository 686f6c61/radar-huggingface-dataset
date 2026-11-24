# Sachin-0001/dec-11M

## Resumen

dec-11M es un modelo de lenguaje autoregresivo de tipo decoder GPT entrenado a nivel de carácter por el usuario Sachin-0001. Con aproximadamente 10,84 millones de parámetros, 6 bloques transformer, 6 cabezas de atención y una dimensión de embedding de 384, está diseñado como artefacto educativo para demostrar la generación de texto sobre el dominio del libro "AI Engineering" de Chip Huyen. No es un modelo de propósito general ni compite con los LLM contemporáneos: su interés es didáctico.

El modelo opera con un vocabulario de solo 134 caracteres únicos y una longitud de contexto de 256 caracteres (`block_size`), lo que lo sitúa en la categoría de los modelos de juguete o de laboratorio. Su tokenización carácter a carácter elimina la necesidad de un tokenizador BPE y simplifica el pipeline de entrenamiento, pero limita severamente la eficiencia y la coherencia en textos largos.

Es relevante ahora únicamente como referencia para quienes estudian los fundamentos de los transformers: permite reproducir el ciclo completo de entrenamiento, muestreo con temperatura y top-k, y evaluación cualitativa en un entorno de recursos mínimos. No debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder GPT-style, character-level |
| Parametros totales | ~10,84 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 caracteres (`block_size`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict de PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clásica de un decoder transformer tipo GPT: 6 bloques, 6 cabezas de atención, dimensión de embedding de 384 y contexto de 256 caracteres. La tokenización es a nivel de carácter con un vocabulario de 134 símbolos únicos, lo que implica que cada posición del contexto corresponde a un carácter individual y que el modelo debe aprender dependencias de largo alcance sin la compresión que ofrece un tokenizador subword.

El entrenamiento se realizó sobre el texto del libro "AI Engineering" de Chip Huyen, según indica la model card. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos; se trata de un transformer estándar implementado en PyTorch.

## Capacidades

- Generación de texto autoregresiva a nivel de carácter, con muestreo por temperatura y top-k.
- Continuación de texto dentro del dominio del libro de AI Engineering, imitando estilo, vocabulario y formato.
- Reproducción de estructuras superficiales del texto de entrenamiento (listas, encabezados, párrafos).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingüismo: no disponible; solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de fundamentos de transformers: sirve para ilustrar el ciclo completo de entrenamiento y muestreo en un cuaderno, con un coste computacional trivial y pesos de ~0,1 GB.
- Experimentos de tokenización carácter a carácter: permite comparar el comportamiento de un vocabulario de 134 símbolos frente a tokenizadores BPE en tareas de continuación de texto.
- Pruebas de pipelines de generación: útil para validar integraciones de inferencia (carga de state dict, bucles de muestreo) antes de pasar a modelos mayores.
- Generación de texto estilizado sobre un dominio acotado: puede producir fragmentos con la apariencia del texto de AI Engineering para demos educativas.
- Reproducción de resultados en investigación docente: al ser pequeño y de licencia MIT, facilita la replicación de experimentos en aulas y talleres.
- Benchmark de infraestructura: sirve como carga mínima para medir latencia de frameworks de inferencia en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (unos 43 MB de pesos) y aún menor en FP16; el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso CPU es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoría de entornos integrados.
- Opciones de despliegue: PyTorch nativo (carga del state dict y bucle de generación propio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos en GPU y de decenas de milisegundos por token en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dec-11M | ~10,84 M | 256 caracteres | Carácter (134 símbolos) | MIT | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | BPE | MIT | Hugging Face |
| nanoGPT (referencia) | ~10-124 M | configurable | Carácter o BPE | MIT | GitHub |
| TinyStories-1M | ~1 M | 512 tokens | BPE | MIT | Hugging Face |

La comparación con GPT-2 small y nanoGPT es la más directa por categoría (transformers pequeños de laboratorio); TinyStories-1M se incluye como referencia de modelos educativos de escala similar. No se dispone de datos de rendimiento comparativo para dec-11M.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre un único libro técnico, hereda el sesgo de dominio y estilo de esa fuente; no representa el inglés general.
- Riesgo de alucinación: alto; puede generar palabras inexistentes y carece de razonamiento factual, como advierte la propia model card.
- Limitación de contexto: 256 caracteres, insuficiente para conversaciones multi-turno o documentos largos.
- Limitación de idioma: solo inglés; no se ha entrenado ni evaluado en castellano.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no es apto para producción por su calidad y alcance.
- Caveat para producción: requiere recrear la arquitectura desde el script de entrenamiento para cargar el state dict; no hay tokenizador empaquetado ni integración con frameworks de serving.

## Enlaces

- Hugging Face: https://huggingface.co/Sachin-0001/dec-11M
