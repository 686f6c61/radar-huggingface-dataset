# omurberaisik/NoTokenLM-Gen-3.6

## Resumen

NoTokenLM-Gen-3.6 es un modelo de lenguaje de 13,87 millones de parámetros desarrollado por el usuario omurberaisik dentro de la familia NoTokenLM. Su particularidad es que opera a nivel de byte: no utiliza tokenizador de subpalabras ni BPE, sino que recibe y emite bytes UTF-8 en crudo. Está entrenado desde cero con una mezcla de texto educativo, Wikipedia, historias simples y texto de estilo libro de texto en inglés y francés. El checkpoint publicado corresponde al paso 13.000 de preentrenamiento, con pesos EMA (media móvil exponencial) y una pérdida de validación de 0,8915 nats por byte (aproximadamente 1,29 bits por byte) sobre una partición reservada de la mezcla de entrenamiento.

El modelo se presenta explícitamente como un ejercicio de investigación sobre cuánto puede lograr un modelo genuinamente pequeño cuando la arquitectura y el entrenamiento se cuidan, sin depender de la escala. No está pensado para responder preguntas, resolver matemáticas ni mantener conversaciones: el autor lo indica de forma directa en la model card. Su interés es técnico y experimental, no de producto.

Arquitectónicamente es un transformer de 12 capas con `d_model=320`, RoPE, RMSNorm, SwiGLU, una convolución corta de entrada, QK-norm, residual de valores y puertas de salida por cabeza. Se distribuye con código propio (`trust_remote_code=True`) y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only byte-level, 12 capas, `d_model=320`, RoPE, RMSNorm, SwiGLU, convolución corta de entrada, QK-norm, residual de valores, puertas de salida por cabeza |
| Parametros totales | 13.874.556 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa secuencias de 1.024 bytes) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | Inglés y francés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código de arquitectura propio en el repo) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas y dimensión 320, con atención rotatoria (RoPE), normalización RMSNorm, activación SwiGLU y una convolución corta a la entrada que mezcla bytes locales antes de las capas de atención. Incorpora además QK-norm, residual de valores y puertas de salida por cabeza, elementos que en conjunto buscan estabilizar el entrenamiento a escala pequeña. La entrada y la salida son bytes UTF-8; `AutoTokenizer` solo actúa como un mapeo fino byte-a-id para que el modelo cargue por la vía estándar de Hugging Face.

El entrenamiento se realizó desde cero (from-scratch) durante 13.000 pasos con batch 16, acumulación de gradiente 4 y secuencias de 1.024 bytes, lo que equivale a aproximadamente 0,85 GB de texto procesado. La tasa de aprendizaje máxima fue 1e-3, con 500 pasos de warmup y weight decay 0,1. La mezcla de datos combina texto educativo web, Wikipedia, historias simples y texto estilo libro de texto en inglés y francés. No hubo ajuste por instrucciones ni alineamiento posterior (RLHF/DPO); es exclusivamente preentrenamiento. Los pesos publicados son los EMA del paso 13.000.

## Capacidades

- Generación de texto a nivel de byte en inglés y francés, con salida UTF-8 directa.
- Continuación de texto corto con coherencia gramatical alta en frases de una o dos oraciones (99,5 % gramaticalmente correctas en la evaluación de 1.000 prompts del autor).
- Coherencia semántica limitada: 78,0 % de las generaciones evaluadas se clasificaron como plenamente coherentes.
- Seguimiento parcial de personajes, objetos y pronombres en contextos narrativos simples.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo de pensamiento (thinking), visión, audio ni otras modalidades.
- Capacidad multilingüe limitada a inglés y francés; no se documenta soporte de castellano.
- No realiza instrucciones ni diálogo: es un modelo base de continuación de texto.

## Casos de uso

- Investigación sobre modelos sin tokenizador: sirve como banco de pruebas controlado para estudiar el comportamiento de transformers byte-level de escala pequeña, comparando con variantes con BPE en las mismas condiciones.
- Experimentos de arquitectura a bajo coste: con 13,87 M de parámetros y 0,1 GB de repo, permite iterar sobre RoPE, QK-norm o puertas por cabeza en una sola GPU consumer sin infraestructura relevante.
- Generación de texto creativo muy corto: continuaciones de una o dos frases en inglés o francés para prototipos de narrativa simple, asumiendo revisión humana por la tasa de incoherencia semántica.
- Docencia y divulgación: ejemplo didáctico completo de un pipeline de preentrenamiento from-scratch (datos, EMA, evaluación manual de 1.000 prompts) reproducible en un notebook de Colab o Kaggle incluido en el repo.
- Estudio de evaluación cualitativa: el conjunto de 1.000 salidas etiquetadas publicado en el repositorio permite analizar modos de fallo (desajustes de pronombre y género, contradicciones de escena) sin necesidad de reentrenar.
- Pruebas de robustez byte-level: útil para medir cómo un modelo sin vocabulario de subpalabras maneja caracteres multibyte, acentos del francés y puntuación, en comparación con modelos con tokenizador.
- Baseline en experimentos de destilación o currículum de datos: al ser pequeño y estar entrenado con una mezcla amplia, sirve como referencia inferior en estudios sobre mezcla de datos o secuencias más largas.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros). La única evaluación disponible es una prueba propia de generación con 1.000 prompts distintos, temperatura 0,5, top-k 40 y 35 bytes nuevos por generación, con etiquetado manual de cada salida:

| Categoria | Definicion | Recuento | Porcentaje |
|---|---|---|---|
| Plenamente coherente | Gramática correcta y significado consistente, con personajes, objetos y pronombres bien mantenidos | 780 | 78,0 % |
| Gramática correcta, significado roto | Oraciones bien formadas pero con desajustes de pronombre/género, detalles sin sentido o inconsistencias de escena | 215 | 21,5 % |
| Gramática rota | Estructura de la oración colapsada, repetición atascada o cláusula malformada | 5 | 0,5 % |

Pérdida de validación registrada durante el entrenamiento: 0,8915 nats por byte (aproximadamente 1,29 bits por byte) sobre una partición reservada de la mezcla. No se han publicado resultados de benchmarks en la información disponible más allá de esta evaluación cualitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 13,87 M de parámetros; en la práctica, unos pocos cientos de MB incluyendo buffers y el código de arquitectura.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090 y en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y el formato byte-level con código propio probablemente requiera adaptación para esos motores.
- Latencia y throughput: no disponibles de forma medida; por tamaño, la inferencia en GPU consumer es de milisegundos por generación de decenas de bytes, pero no se publican cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoTokenLM-Gen-3.6 | 13,87 M | No disponible (entrenado a 1.024 bytes) | Byte-level sin tokenizador, preentrenamiento from-scratch | Apache 2.0 | Hugging Face, código propio |
| NoTokenLM Gen-4.5 (misma familia) | No disponible en la información | No disponible | Byte-level, entrenado solo con historias infantiles | No disponible en la información | Hugging Face |
| Modelos byte-level pequeños tipo ByT5 | No disponible en la información | No disponible | Encoder-decoder byte-level | No disponible en la información | Hugging Face / Google |
| Modelos con tokenizador de escala similar (por ejemplo, GPT-2 small) | 124 M | 1.024 tokens | Transformer con BPE | No disponible en la información | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: el autor solo contrasta cualitativamente con Gen-4.5 de su propia familia, señalando que Gen-3.6 generaliza mejor por la mezcla amplia de datos pero rinde peor en texto narrativo estrecho.

## Limitaciones y advertencias

- No es un modelo de instrucciones ni de diálogo: no responde preguntas, no hace matemáticas y no mantiene conversaciones; el autor lo advierte explícitamente.
- Tasa de incoherencia semántica del 21,5 % en la evaluación del propio autor, con desajustes frecuentes de pronombre y género (112 de 215 casos en esa categoría).
- Riesgo alto de alucinación y de contradicción de escena incluso cuando la gramática es correcta.
- Ventana de contexto efectiva muy corta: el entrenamiento usa secuencias de 1.024 bytes y no se documenta la longitud de contexto soportada en inferencia.
- Cobertura lingüística limitada a inglés y francés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Entrenamiento con solo ~0,85 GB de texto, lo que limita severamente el conocimiento factual y el vocabulario efectivo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento del modelo hace inviable su uso en producción para tareas reales de generación de contenido sin revisión humana intensiva.
- La evaluación de coherencia fue realizada por un único anotador, sin verificación entre pares, lo que introduce sesgo de etiquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.6
- Notebook interactivo incluido en el repo: https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.6/blob/main/notebook.ipynb
- Salidas de la evaluación de 1.000 prompts: https://huggingface.co/omurberaisik/NoTokenLM-Gen-3.6/blob/main/gen36_13000_1000_test_outputs.json
