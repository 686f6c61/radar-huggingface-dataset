# davidheineman/nanogpt-ladder-v3-code-heavy-8m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · code-heavy · 8M · 100 TPP es un modelo de lenguaje base de muy pequeno tamano (8.011.776 parametros) desarrollado por davidheineman como parte de una serie escalonada de experimentos de preentrenamiento reproducible denominada NanoGPT Ladder v3. Cada punto de la escalera corresponde a un entrenamiento independiente con un presupuesto de tokens fijo, lo que permite estudiar el efecto del numero de tokens vistos por parametro (TPP) sobre la calidad del modelo final. Este checkpoint concreto corresponde al extremo de 100 TPP, es decir, 801.177.600 tokens de prediccion procesados en 24.450 pasos de optimizacion con semilla 1337.

Se trata de un transformer decoder-only estilo GPT-2 de 8 capas, ancho 128, 4 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2 con vocabulario rellenado de 50.304 entradas. La mezcla de datos es "code-heavy", siguiendo la receta congelada del pool Dolma3 Dolmino, con aproximadamente el 80 % de la masa asignada al dominio de codigo. El modelo es un checkpoint de preentrenamiento puro: los pesos preceden a cualquier fase de instruccion, SFT o RL, por lo que debe usarse con prompts de texto plano.

Su relevancia es principalmente metodologica y de investigacion: sirve como punto de referencia controlado para estudiar leyes de escalado a presupuestos de tokens extremos en modelos minusculos, y como base para experimentos de ajuste fino en entornos con recursos practicamente nulos. No esta pensado para uso en produccion ni para tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT-2 / NanoGPT) |
| Parametros totales | 8.011.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, checkpoint nativo con `model`, `config`, `identity` y `run`) |
| Capas | 8 |
| Dimension del modelo (ancho) | 128 |
| Cabezas de atencion | 4 |
| Vocabulario | 50.304 (GPT-2 rellenado) |
| Tokenizador | GPT-2 (`tiktoken.get_encoding('gpt2')`) |
| Tokens de entrenamiento | 801.177.600 (100 TPP) |
| Pasos de optimizacion | 24.450 |
| Semilla | 1337 |
| Dataset | allenai/dolma3_dolmino_pool (mezcla code-heavy, ~80 % dominio de codigo) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura NanoGPT: un transformer decoder-only con 8 bloques, ancho de 128, 4 cabezas de atencion y embeddings de entrada y salida atados. Incorpora codificaciones posicionales rotatorias (RoPE) en lugar de embeddings posicionales aprendidos, y utiliza el tokenizador GPT-2 con un vocabulario rellenado hasta 50.304 entradas. El contexto maximo es de 1.024 tokens. El checkpoint se distribuye en float32 e incluye los modulos `model.py` y `generate.py` con un cargador propio, por lo que no es compatible con `AutoModel` de Transformers.

El entrenamiento consistio en un preentrenamiento autorregresivo estandar sobre la mezcla congelada del pool Dolma3 Dolmino, con una receta "code-heavy" que asigna aproximadamente el 80 % de los datos al dominio de codigo. Se realizaron 24.450 pasos de optimizacion hasta consumir 801.177.600 tokens de prediccion, con semilla 1337. El repositorio incluye `metadata.json` con las revisiones exactas de las fuentes, los pesos de mezcla y hashes SHA256, y `results.json` con el registro de finalizacion y las evaluaciones finales. No se menciona uso de RLHF, DPO ni ninguna fase posterior de alineamiento: el modelo es un checkpoint base puro. Las metricas finales reportadas son de tipo BPB/loss (evaluacion de modelado de lenguaje), no de precision en tareas.

## Capacidades

- Generacion de texto autorregresiva basica a partir de prompts de texto plano (continuacion, no instruccion).
- Modelado de lenguaje y calculo de perplejidad/BPB sobre texto, util para evaluacion comparativa dentro de la escalera.
- Capacidad de continuacion de codigo, favorecida por la mezcla de entrenamiento code-heavy.
- Punto de partida para ajuste fino posterior (el checkpoint soporta inferencia y fine-tuning; no incluye estado del optimizador).
- No dispone de soporte de tool calling ni function calling.
- No dispone de modo de razonamiento multi-paso ni capacidades de agente.
- No dispone de vision, audio ni otras modalidades.
- Capacidades multilingues: no documentadas; el tokenizador GPT-2 esta dominado por ingles.
- No hay modo "thinking" ni plantillas de chat.

## Casos de uso

- Investigacion sobre leyes de escalado: usar este checkpoint junto con los demas puntos de la escalera NanoGPT Ladder v3 para medir como varia la loss/BPB al aumentar los tokens por parametro con arquitectura y datos fijos.
- Estudio de mezclas de datos: comparar este modelo code-heavy con variantes de la misma familia (otras mezclas de dominio) para aislar el efecto de la composicion del dataset en un regimen de 100 TPP.
- Baseline reproducible en papers: servir como referencia de bajo coste para experimentos de preentrenamiento, ya que el repositorio documenta revisiones de fuentes, pesos de mezcla y hashes SHA256.
- Prototipado de pipelines de entrenamiento: validar de extremo a extremo cargadores de datos, tokenizadores y scripts de evaluacion (loss, BPB) en un modelo que entrena e infiere en CPU en segundos.
- Experimentos de ajuste fino con recursos minimos: al ser un modelo de 8 M de parametros en float32, cabe en cualquier GPU consumer e incluso en CPU, lo que permite probar recetas de SFT o LoRA sin infraestructura.
- Docencia y formacion: ilustrar el funcionamiento interno de un transformer GPT (RoPE, embeddings atados, atencion multi-cabeza) con un checkpoint real y un codigo de carga explicito.
- Generacion de continuaciones de codigo a pequena escala en entornos de prueba, sin expectativas de calidad de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene el registro de finalizacion y evaluaciones finales, pero las cifras concretas de BPB/loss no se incluyen en la informacion proporcionada. El autor senala explicitamente que estas metricas son evaluaciones de modelado de lenguaje y no precision en resolucion de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (8 M de parametros), sin contar overhead del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con CUDA; el modelo es trivial para A100, H100, RTX 4090 o GPUs de gama baja.
- Cabe holgadamente en cualquier GPU consumer e incluso en CPU; el script `generate.py` soporta `device=auto` con seleccion de CUDA, Apple MPS o CPU.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py` incluidos; no es compatible con vLLM, TGI, llama.cpp ni Ollama por usar una arquitectura y cargador propios, salvo conversion manual.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo se espera generacion en tiempo real incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 code-heavy 8M 100 TPP (este) | 8,0 M | 1.024 | no disponible | PyTorch nativo | Checkpoint base, mezcla code-heavy, cargador propio |
| Otros puntos de la misma escalera NanoGPT Ladder v3 | variable (segun punto) | 1.024 | no disponible | PyTorch nativo | Misma receta, distinto presupuesto de tokens o mezcla |
| GPT-2 small (referencia arquitectonica) | 124 M | 1.024 | MIT (segun publicacion original) | safetensors / PyTorch | Mucho mayor, tokenizador y arquitectura comparables |
| Modelos tipo TinyStories / nanoGPT de la comunidad | ~1-15 M | variable | variable | PyTorch | Objetivo similar de investigacion a pequena escala |

La comparacion directa con modelos de proposito general no es significativa: este checkpoint es una pieza de un experimento controlado de escalado, no un modelo orientado a tareas. Frente a GPT-2 small es aproximadamente 15 veces menor en parametros, y frente a modelos de la comunidad de tamano similar la diferencia clave es la documentacion exhaustiva de la receta (mezcla, revisiones, hashes, semilla).

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones, no tiene plantilla de chat y no debe usarse como asistente.
- Calidad de generacion muy limitada por el tamano (8 M de parametros); las continuaciones seran coherentes solo a nivel local.
- Riesgo alto de alucinacion y de texto incoherente en generaciones largas.
- Contexto maximo de 1.024 tokens; no admite conversaciones multi-turno largas ni documentos extensos.
- Idiomas soportados no documentados; el tokenizador GPT-2 favorece el ingles y penaliza idiomas con cobertura baja, como el castellano.
- Licencia no disponible: no se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier uso fuera de investigacion.
- Pesos en float32 sin cuantizaciones oficiales; no hay integracion con runtimes de inferencia estandar (vLLM, llama.cpp, Ollama, TGI).
- No incluye estado del optimizador, por lo que reanudar el preentrenamiento exacto no es posible desde este checkpoint.
- Sesgos conocidos: no documentados; al entrenarse sobre Dolma3 Dolmino y con predominio de codigo, se esperan sesgos de dominio y de idioma no medidos.
- Las metricas publicadas son de modelado de lenguaje (BPB/loss), no de utilidad en tareas; no deben interpretarse como rendimiento funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-code-heavy-8m-100tpp-seed-1337
- Coleccion de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Perfil del autor: https://huggingface.co/davidheineman
