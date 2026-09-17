# gpjt/jax-with-mha-bias-openwebtext

## Resumen

gpjt/jax-with-mha-bias-openwebtext es un modelo de lenguaje causal entrenado desde cero por Giles Thomas (gpjt) siguiendo la arquitectura GPT-2 descrita por Sebastian Raschka en su libro "Build a Large Language Model (from Scratch)". Se trata de un transformer decoder-only de 12 capas, 768 dimensiones de embedding y 12 cabezas de atencion multi-cabeza (MHA), con una longitud de contexto de 1.024 tokens. El entrenamiento se realizo en JAX, mediante una reimplementacion de caja negra del codigo original en PyTorch, aunque los pesos finales se han convertido a safetensors compatibles con PyTorch.

El modelo se entreno sobre los primeros 3.260.190.720 tokens del dataset gpjt/openwebtext-gpt2-tokens (derivado de OpenWebText), una cantidad cercana al optimo de Chinchilla (aproximadamente 20 tokens por parametro). Con solo 163 millones de parametros, el propio autor advierte que se trata de un modelo "ignorante y poco inteligente", sin apenas conocimiento factual, y lo situa explicitamente como material de experimentacion mas que como herramienta de produccion.

Su relevancia es fundamentalmente educativa y de investigacion: sirve como punto de partida reproducible para estudiar el efecto de decisiones concretas de arquitectura y de datos en modelos GPT-2 de escala pequena, y como base para fine-tuning en entornos con recursos muy limitados. El autor lo publica bajo licencia Apache 2.0 y lo enmarca en una serie de entradas de blog que comparan sus pesos con los de GPT-2 original de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2, con atencion multi-cabeza (MHA) |
| Parametros totales | 175.592.448 segun los safetensors del repositorio; la model card indica 163.009.536 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors en precision completa); convertible a GGUF, int8 o int4 con herramientas externas |
| Idiomas soportados | No disponible en la model card; el dataset de entrenamiento (OpenWebText) es predominantemente en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatibles con PyTorch), requiere `trust_remote_code=True` |
| Dimension de embedding | 768 |
| Numero de capas | 12 |
| Cabezas de atencion | 12 |
| Sesgo en QKV | La model card indica `False`, aunque el nombre del modelo incluye "with-mha-bias" |
| Weight tying | No (embeddings de entrada y cabeza de salida no comparten pesos) |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 small: 12 bloques transformer decoder-only con normalizacion previa, atencion causal multi-cabeza de 12 cabezas sobre embeddings de 768 dimensiones y una MLP intermedia de 3.072 unidades. Dos detalles la separan de la configuracion clasica de GPT-2 small: no hay weight tying entre la matriz de embeddings y la cabeza de lenguaje (lo que explica que el recuento de parametros supere los 124 millones del GPT-2 small original con pesos atados) y, segun la model card, el sesgo en las proyecciones QKV esta desactivado, en contradiccion aparente con el sufijo "with-mha-bias" del identificador del modelo. El contexto esta limitado a 1.024 tokens mediante embeddings posicionales aprendidos.

El entrenamiento se llevo a cabo en JAX sobre una maquina local con una unica RTX 3090, con 3.260.190.720 tokens del dataset gpjt/openwebtext-gpt2-tokens, redondeados al lote mas cercano. Los hiperparametros documentados son: micro-lote de 6, lote global de 96, dropout de 0,0, recorte de gradiente de 3,5, learning rate de 0,0014 con schedule, y weight decay de 0,01. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones; se trata de un modelo base, no de un modelo alineado.

## Capacidades

- Generacion de texto autoregresiva en estilo causal, con prompt de continuacion.
- Continuacion de texto generico: al ser un modelo base entrenado sobre texto web, produce completados plausibles a nivel de forma, sin seguir instrucciones.
- Capacidad muy limitada de conocimiento factual: el propio autor senala que no conoce muchos hechos debido a su tamano y al numero de tokens de entrenamiento.
- Razonamiento y matematicas: no documentado y, por escala y tipo de entrenamiento, altamente limitado.
- Codigo: no documentado especificamente; el corpus OpenWebText contiene texto web general.
- Tool calling / function calling: no soportado, no documentado.
- Soporte de agentes o razonamiento multi-paso: no soportado, no documentado.
- Capacidades multilingues: no documentadas; el entrenamiento es predominantemente en ingles.
- Capacidades especiales (modo thinking, vision, audio): ninguna.
- Fine-tuning: el autor publica un notebook de ejemplo para ajustar el modelo.
- Compatibilidad con la API de transformers: `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM`, con `trust_remote_code=True`.

## Casos de uso

- Material didactico para estudiar LLM desde cero: el modelo permite reproducir de principio a fin el pipeline de Raschka (tokenizacion, preentrenamiento, evaluacion) y observar el efecto de decisiones como el weight tying o el sesgo en QKV sobre los pesos resultantes.
- Punto de partida para fine-tuning con recursos minimos: con 163 millones de parametros cabe en una GPU de consumo e incluso permite ajuste completo (no solo LoRA) en tarjetas de gama media, lo que lo hace util para practicar tecnicas de ajuste supervisado sobre dominios concretos.
- Base para experimentos de comparacion de datos de entrenamiento: el autor lo enmarca en una serie que compara pesos entrenados sobre FineWeb frente a OpenWebText, de modo que sirve para aislar el efecto de la calidad del corpus en un modelo pequeno y controlado.
- Generacion de texto de bajo coste en entornos embebidos o CPU: por tamano y requisitos, puede ejecutarse en CPU con latencia aceptable para tareas de completado de texto no criticas, como prototipos y demos.
- Investigacion sobre alucinacion y conocimiento factual: al ser un modelo base de escala pequena, es un banco de pruebas controlado para medir cuantos hechos retiene un modelo entrenado con el optimo de Chinchilla en funcion del numero de parametros.
- Generacion de texto sintetico para aumentacion de datos a pequena escala: puede producir continuaciones de estilo web para inicializar corpus de prueba, siempre con revision humana posterior.
- Ensenanza de despliegue de modelos con codigo personalizado: sirve para practicar la carga de modelos que requieren `trust_remote_code=True` y su integracion en pipelines de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no medida): en fp32 unos 0,65 GB solo de pesos; en fp16/bf16 unos 0,33 GB; en int8 unos 0,16 GB; en int4 unos 0,08 GB. A estas cifras hay que sumar el cache KV para 1.024 tokens de contexto, que es reducido.
- GPU recomendadas: no se especifican en la documentacion. Por tamano, cualquier GPU con al menos 2 GB de memoria es suficiente; el entrenamiento documentado se hizo con una unica RTX 3090.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (serie RTX 30/40, e incluso en GPUs integradas con memoria compartida).
- Ejecucion en CPU: viable por el reducido numero de parametros.
- Opciones de despliegue: el modelo se distribuye para la libreria `transformers` con `trust_remote_code=True`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF publicados su uso en llama.cpp requeriria una conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas provienen de su documentacion publica y no de la busqueda realizada; no se incluyen cifras de rendimiento porque no se dispone de ellas.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gpjt/jax-with-mha-bias-openwebtext | 163 M (card) / 175 M (safetensors) | 1.024 | Apache 2.0 | Modelo base de investigacion, entrenado en JAX sobre 3,26 B tokens, requiere `trust_remote_code` |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT | Referencia historica con weight tying; entrenado sobre WebText, sin datos publicos de composicion exacta |
| Pythia-160M (EleutherAI) | 160 M | 2.048 | Apache 2.0 | Suite de investigacion con checkpoints intermedios y datos de entrenamiento publicos (The Pile) |
| GPT-2 medium (OpenAI) | 355 M | 1.024 | MIT | Alternativa de mayor tamano dentro de la misma familia arquitectonica |

## Limitaciones y advertencias

- Conocimiento factual muy limitado: el autor indica explicitamente que el modelo "no sabe muchos hechos" y no es "terriblemente inteligente"; fue entrenado con el optimo de Chinchilla, no con un volumen masivo de tokens.
- No es un modelo ajustado por instrucciones: no sigue ordenes, no responde a formato de chat y no dispone de ninguna capa de alineacion (RLHF, DPO o similar).
- Riesgo alto de alucinacion y de texto incoherente o sin sentido, especialmente en generaciones largas.
- Sesgos: al entrenarse sobre OpenWebText, un corpus de enlaces de Reddit, hereda los sesgos presentes en ese tipo de texto web; no se documenta ninguna mitigacion.
- Limitacion de idioma: no se declaran idiomas soportados y el corpus es predominantemente en ingles, por lo que el rendimiento en castellano sera previsiblemente pobre.
- Contexto corto: 1.024 tokens, insuficiente para tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Codigo personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene revisarlo antes de usarlo en entornos sensibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las limitaciones tecnicas del modelo lo hacen poco adecuado para produccion.
- Discrepancias documentadas: el recuento de parametros de la model card (163.009.536) no coincide con el de los safetensors (175.592.448), y la card indica que el sesgo QKV esta desactivado mientras que el nombre del modelo sugiere lo contrario. Conviene verificar la configuracion real antes de reutilizar los pesos.
- Sin adopcion: cero descargas y cero "likes" en el momento de la consulta, por lo que no existe comunidad ni soporte asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/jax-with-mha-bias-openwebtext
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/openwebtext-gpt2-tokens
- Dataset original OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Codigo de entrenamiento en JAX: https://github.com/gpjt/jax-gpt2-from-scratch
- Codigo de ejecucion del modelo base: https://github.com/gpjt/ddp-base-model-from-scratch
- Notebook de fine-tuning: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Blog del autor: https://www.gilesthomas.com/
- Entrada de blog asociada (anunciada como proxima): https://www.gilesthomas.com/2026/09/why-do-openai-gpt2-weights-beat-mine-5-data-quality
- Libro de referencia: https://www.manning.com/books/build-a-large-language-model-from-scratch
- Perfil del autor: https://huggingface.co/gpjt
- Perfil de Sebastian Raschka: https://huggingface.co/rasbt
