# gpjt/jax-with-mha-bias-fw-fwedu-simplewiki

## Resumen

gpjt/jax-with-mha-bias-fw-fwedu-simplewiki es un modelo de lenguaje causal de tipo GPT-2 entrenado desde cero por Giles Thomas (gpjt), a partir del codigo del libro "Build a Large Language Model (from Scratch)" de Sebastian Raschka. Se trata de un modelo base (no instruido) de 163.009.536 parametros segun la model card —el dato real extraido de los pesos safetensors es de 175.592.448, probablemente por la suma de embeddings y cabeza de salida al no usar weight tying—, con una longitud de contexto de 1.024 tokens. La particularidad tecnica es que el entrenamiento se hizo en JAX con una reimplementacion del codigo original en PyTorch, aunque los pesos se han convertido de vuelta a un formato compatible con PyTorch para poder ejecutarlo con `transformers`.

El modelo resuelve un problema acotado: ofrecer una pieza reproducible y ligera para experimentar con el ciclo completo de entrenamiento de un LLM de tamano GPT-2 "small", pero con un dataset mas curado de lo habitual en los modelos anteriores del autor. La mezcla de datos combina FineWeb-Edu (45%), FineWeb (45%) y Simplewiki (10%, sobremuestreado unas 2 veces), y se entrenado sobre los primeros 3.200 millones de tokens de ese corpus, una cifra cercana al optimo de Chinchilla (unas 20 veces el numero de parametros). Es relevante ahora por su caracter didactico y por servir de punto de partida para fine-tuning, no por su capacidad bruta.

El autor advierte explicitamente de que no se deben tener expectativas altas: es un modelo "ignorante y poco inteligente" en sus propias palabras, con 163 M de parametros y una ventana de contexto corta. Su valor esta en la trazabilidad del pipeline de entrenamiento y en la posibilidad de usarlo como banco de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2, atencion multi-cabeza (MHA), 12 capas |
| Parametros totales | 175.592.448 (pesos safetensors); 163.009.536 segun la model card |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precision original; no hay GGUF ni versiones cuantizadas oficiales) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es mayoritariamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compatible con PyTorch mediante `trust_remote_code=True` |

Otras especificaciones declaradas:

| Parametro | Valor |
|---|---|
| Dimension de embedding | 768 |
| Cabezas MHA | 12 |
| Capas | 12 |
| QKV bias | False |
| Weight tying | False |
| Tamano del repositorio | 0,7 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Tags | transformers, safetensors, gpjtgpt2, text-generation, gpjt-llm-from-scratch, custom_code, region:us |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal de estilo GPT-2 con normalizacion previa, 12 capas, 768 dimensiones de embedding y 12 cabezas de atencion multi-cabeza. La model card indica que no se usa QKV bias y que tampoco se aplica weight tying entre el embedding de entrada y la proyeccion de salida, lo que explica que el recuento de parametros (175,6 M segun safetensors) supere al de un GPT-2 small convencional (124 M). El nombre del modelo incluye "mha-bias", aunque la ficha solo detalla "QKV bias: False"; conviene tratarlo como una discrepancia de nomenclatura y verificar el codigo del repositorio antes de asumir el mecanismo exacto. La implementacion original de entrenamiento es en JAX (`jax-gpt2-from-scratch`), con conversion posterior de los pesos a un formato que PyTorch puede cargar mediante codigo personalizado.

El entrenamiento se realizo en una maquina local con una unica RTX 3090, sobre 3.260.190.720 tokens (aproximadamente el optimo de Chinchilla, 20 veces los parametros) tomados de los primeros 3.200 millones de tokens del dataset `gpjt/fw-fwedu-simplewiki-gpt2-tokens`. La composicion del corpus es FineWeb-Edu al 45%, FineWeb al 45% y Simplewiki al 10% con sobremuestreo de aproximadamente 2x. Los hiperparametros declarados son: micro-batch de 6, batch global de 96, dropout 0.0, gradient clipping de 3.5, learning rate de 0.0014 con schedule, y weight decay de 0.01. Es un modelo puramente preentrenado: no hay indicios de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generacion de texto autoregresiva en ingles, con estilo propio de un GPT-2 small entrenado en corpus web.
- Modelo base (no instruido): no sigue instrucciones ni mantiene formato conversacional sin fine-tuning previo.
- Razonamiento limitado: por tamano y cantidad de datos, no es fiable en tareas de logica multi-paso.
- Capacidades aritmeticas y de codigo muy basicas, sin entrenamiento especifico en codigo ni matematicas.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso estructurado.
- Multilingue: no disponible; el corpus (FineWeb, FineWeb-Edu, Simplewiki) es predominantemente en ingles, por lo que el rendimiento fuera del ingles sera muy inferior.
- Sin capacidades de vision ni audio.
- Sin modo "thinking" ni cadena de pensamiento explicita.
- Apto para fine-tuning supervisado, como demuestra el notebook de ejemplo del autor.

## Casos de uso

- Experimentacion academica y didactica: sirve para reproducir de principio a fin el entrenamiento de un LLM de escala GPT-2, comparar el impacto de la calidad del dataset (FineWeb-Edu y Simplewiki) frente a FineWeb puro y estudiar decisiones de arquitectura como el weight tying.
- Fine-tuning de dominio especifico: al ser un modelo base pequeno y con licencia Apache 2.0, se puede reentrenar en corpus tecnicos, legales o medicos de nicho en una sola GPU de consumo para tareas de generacion acotada.
- Generacion de texto creativo controlado: con `temperature` y `top_k` ajustados (el autor sugiere temperatura 1.4 y top_k 25), puede usarse en prototipos de continuacion de texto o generacion de titulares, siempre con revision humana.
- Banco de pruebas de pipelines de inferencia: por su tamano reducido (0,7 GB de repositorio) es util para validar integraciones con `transformers`, monitorizacion de latencia y despliegues de bajo coste antes de escalar a modelos mayores.
- Educacion en tecnicas de atencion: al permitir modificar o inspeccionar el sesgo de atencion (segun el nombre del modelo) y la configuracion de cabezas, es adecuado para practicas sobre mecanismos de atencion y su efecto en la generacion.
- Generacion de datos sinteticos a pequena escala: puede producir texto de relleno o ejemplos para entrenar clasificadores, asumiendo que la calidad factica sera baja y requiere filtrado posterior.
- Comparativas controladas de datos de entrenamiento: su combinacion ponderada de FineWeb-Edu, FineWeb y Simplewiki lo convierte en un punto de referencia para medir como afecta la curacion del corpus al rendimiento de un modelo de 163 M de parametros.
- Prototipado rapido en entornos sin GPU dedicada: cabe en CPU o en cualquier GPU moderna, lo que permite iterar localmente en tareas de generacion de texto sin coste de nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, alrededor de 0,7 GB; en FP16/BF16, unos 0,35 GB; en cuantizacion INT8, en torno a 0,18 GB; en INT4, aproximadamente 0,09 GB, sin contar el overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU moderna es suficiente. El propio autor entreno el modelo en una RTX 3090, pero para inferencia basta con una GPU de gama baja o integrada.
- Cabe en GPU de consumo: si, con holgura en cualquier RTX (serie 20 en adelante), GTX 1060 o superior, e incluso en GPUs integradas con suficiente memoria compartida.
- Cabe en CPU: si, es viable para inferencia en CPU con `transformers` en PyTorch, con latencias de decenas a cientos de milisegundos por token segun el hardware.
- Opciones de despliegue: la via oficial es `transformers` con `pipeline("text-generation", ..., trust_remote_code=True)` o mediante `AutoModelForCausalLM`. No hay confirmacion de soporte para vLLM, TGI, llama.cpp, Ollama u otros motores, ya que requiere codigo personalizado y no se publican pesos en formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gpjt/jax-with-mha-bias-fw-fwedu-simplewiki | 175,6 M (safetensors) | 1.024 | Apache 2.0 | Entrenado en JAX sobre 3,26 B tokens de FineWeb-Edu + FineWeb + Simplewiki; codigo personalizado |
| GPT-2 small | 124 M | 1.024 | Licencia MIT modificada | Modelo original de OpenAI, con weight tying; referencia de comparacion directa |
| DistilGPT-2 | 82 M | 1.024 | Apache 2.0 | Version destilada de GPT-2, mas pequena y rapida, entrenada por destilacion |
| Pythia-160M | 160 M | 2.048 | Apache 2.0 | Suite de modelos base de EleutherAI con checkpoints intermedios publicados |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Alternativa moderna mucho mayor y con contexto amplio; el autor de este modelo la recomienda para trabajo serio |

Los datos de parametros, contexto y licencia de los modelos comparados corresponden a informacion publica ampliamente conocida; no se dispone de comparativas de rendimiento medidas sobre esta ficha.

## Limitaciones y advertencias

- Modelo base no instruido: no responde a instrucciones ni mantiene dialogos sin un fine-tuning previo.
- Conocimiento factico muy limitado: el propio autor lo describe como "ignorante y poco inteligente" por su tamano y volumen de entrenamiento.
- Riesgo de alucinacion alto: al no estar alineado ni ajustado por RLHF/DPO, puede generar contenido incorrecto o incoherente con naturalidad.
- Contexto corto de 1.024 tokens: insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura idiomatica: entrenado principalmente en ingles; el rendimiento en castellano y otros idiomas es previsiblemente pobre, aunque no se declaran idiomas oficiales.
- Sesgos: al entrenar sobre corpus web (FineWeb, FineWeb-Edu, Simplewiki), hereda los sesgos presentes en esas fuentes; no hay documentacion sobre mitigaciones aplicadas.
- Licencia: Apache 2.0, permisiva y apta para uso comercial, pero el modelo se apoya en `custom_code`, por lo que conviene auditar el codigo del repositorio antes de integrarlo en produccion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor al cargar el modelo; evaluar el riesgo de seguridad en entornos gestionados.
- Discrepancia en el numero de parametros entre la model card (163.009.536) y los pesos safetensors (175.592.448): verificar antes de dimensionar recursos.
- No hay benchmarks publicados, por lo que no se puede estimar objetivamente su calidad frente a alternativas.
- Poca traccion en la comunidad: cero descargas y cero "likes" en el momento del registro, sin evidencia de uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/gpjt/jax-with-mha-bias-fw-fwedu-simplewiki
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fw-fwedu-simplewiki-gpt2-tokens
- Repositorio de entrenamiento (JAX): https://github.com/gpjt/jax-gpt2-from-scratch
- Repositorio de inferencia y fine-tuning: https://github.com/gpjt/ddp-base-model-from-scratch
- Notebook de fine-tuning: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Blog del autor (entrada sobre calidad de datos): https://www.gilesthomas.com/2026/09/why-do-openai-gpt2-weights-beat-mine-5-data-quality
- Libro de Sebastian Raschka, "Build a Large Language Model (from Scratch)": https://www.manning.com/books/build-a-large-language-model-from-scratch
- Web de Sebastian Raschka: https://sebastianraschka.com/
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset Simplewiki: https://huggingface.co/datasets/answerdotai/simplewiki
