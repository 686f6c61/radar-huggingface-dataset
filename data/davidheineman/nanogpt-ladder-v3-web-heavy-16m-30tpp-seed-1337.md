# davidheineman/nanogpt-ladder-v3-web-heavy-16m-30tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · web-heavy · 16M · 30 TPP es un modelo de lenguaje de tipo base (solo preentrenamiento) desarrollado por davidheineman dentro de la iniciativa NanoGPT Ladder v3, una colección de ejecuciones de preentrenamiento a pequeña escala orientadas al estudio controlado del entrenamiento de transformers. El checkpoint corresponde a un endpoint de preentrenamiento completado con 15.851.520 parámetros, 475.529.216 tokens de predicción y 14.512 pasos de optimizador, con semilla 1337. No ha pasado por condicionamiento tiny-rl, SFT ni RL, por lo que debe usarse con prompts de texto plano.

El modelo emplea una arquitectura transformer decoder-only estilo GPT-2 con 14 capas, anchura 192, 6 cabezas de atención, embeddings atados, RoPE, tokenizador GPT-2 y una longitud de contexto de 1.024 tokens. La mezcla de datos es "web-heavy", siguiendo la receta congelada del pool Dolma3 Dolmino de AllenAI, donde las mezclas heavy asignan el 80% al dominio nombrado (en este caso, web).

Su relevancia es metodológica más que de producto: cada presupuesto de tokens es una ejecución entrenada de forma independiente, lo que permite estudiar escalados de cómputo, recetas de mezcla de datos y reproducibilidad con semillas fijas. El repositorio incluye `metadata.json` con revisiones exactas de fuentes, pesos de mezcla y SHA256, además de `results.json` con el registro de finalización y evaluaciones finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (NanoGPT), con RoPE y embeddings atados |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt`), cargado con loader propio (`model.py`); no compatible con `AutoModel` de Transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 14 capas, anchura 192 y 6 cabezas de atención, con embeddings de entrada y salida atados, codificación posicional rotatoria (RoPE) y tokenizador GPT-2 con vocabulario rellenado de 50.304 entradas. El checkpoint se distribuye con el código de arquitectura (`model.py`) y un script de generación (`generate.py`), y se carga mediante un loader propio en lugar de las clases estándar de Transformers.

El entrenamiento se completó con 475.529.216 tokens de predicción en 14.512 pasos de optimizador (aproximadamente 30 tokens por parámetro, de ahí el sufijo 30 TPP), partiendo de la semilla 1337. La mezcla de datos sigue la receta congelada del pool `allenai/dolma3_dolmino_pool`, con una configuración "web-heavy" que asigna el 80% al dominio web. No se documentan fases de RLHF, DPO ni SFT: los pesos son estrictamente de preentrenamiento. El checkpoint incluye `model`, `config`, `identity` y `run`, pero no el estado del optimizador, por lo que soporta inferencia y fine-tuning posterior sin reanudación exacta del entrenamiento.

## Capacidades

- Generación de texto autoregresiva con prompts de texto plano, en modo greedy (`temperature=0`) o con muestreo.
- Modelado de lenguaje de siguiente token; las evaluaciones publicadas son de pérdida y BPB, no de precisión en tareas.
- Punto de partida para fine-tuning supervisado o experimentos de adaptación posteriores.
- Capacidad multilingüe: no documentada; depende de la composición del pool Dolma3 Dolmino, no desglosada en la información disponible.
- Tool calling / function calling: no soportado de forma nativa.
- Razonamiento multi-paso o modo "thinking": no disponible.
- Visión, audio u otras modalidades: no soportadas.
- Ejecución en CUDA, Apple MPS o CPU mediante `device=auto` en el script incluido.

## Casos de uso

- Investigación sobre escalado de cómputo: al ser una ejecución independiente por presupuesto de tokens (30 TPP en este caso), sirve para trazar curvas de pérdida frente a tokens vistos y comparar con otros endpoints de la misma colección.
- Estudio de recetas de mezcla de datos: la configuración web-heavy (80% del dominio web) permite aislar el efecto de la composición del corpus sobre la pérdida de validación en un entorno de cómputo reducido.
- Reproducibilidad de experimentos: `metadata.json` registra revisiones exactas de fuentes, pesos de mezcla y SHA256, lo que facilita replicar el entrenamiento y auditar diferencias entre ejecuciones con distintas semillas.
- Baseline para fine-tuning en dominios pequeños: con 15,8M de parámetros y pesos en float32, se puede adaptar en una sola GPU consumer a tareas de clasificación o generación restringida y comparar contra modelos mayores.
- Docencia y divulgación: el par `model.py` + `generate.py` y la carga directa del checkpoint permiten explicar el funcionamiento interno de un transformer GPT-2 sin la abstracción de frameworks de alto nivel.
- Pruebas de infraestructura de inferencia: su tamaño reducido lo hace útil para validar pipelines propios (tokenización con tiktoken, carga de checkpoints, selección de dispositivo CUDA/MPS/CPU) antes de escalar a modelos mayores.
- Ablaciones de tokenizador y arquitectura: el vocabulario rellenado a 50.304 y el uso de RoPE con embeddings atados permiten estudiar variantes concretas frente a la configuración GPT-2 canónica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que `results.json` contiene el registro de finalización y evaluaciones finales, y que las mediciones finales de BPB y pérdida son evaluaciones de modelado de lenguaje, no precisión en resolución de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,85M de parámetros, unos 63 MB de pesos) más el overhead de activaciones y contexto; holgadamente por debajo de 1 GB en cualquier configuración práctica.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; también funciona en Apple MPS y en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer, incluidas integradas y portátiles de gama baja, así como en CPU.
- Opciones de despliegue: el repositorio incluye un loader propio (`model.py`) y un script de generación (`generate.py`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el uso de `AutoModel` de Transformers no está soportado por la arquitectura personalizada.
- Latencia y throughput: no disponibles. El tamaño del repositorio es de 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 web-heavy 16M 30 TPP | 15,85M | 1.024 | no disponible | PyTorch nativo | Endpoint de preentrenamiento, sin SFT ni RL |
| GPT-2 small (referencia arquitectonica) | 124M | 1.024 | MIT (segun publicacion original) | safetensors / PyTorch | Modelo publicado por OpenAI; mayor escala |
| Otros endpoints de NanoGPT Ladder v3 | Variable por ejecucion | 1.024 | no disponible | PyTorch nativo | Misma receta y semilla, distinto presupuesto de tokens o mezcla |

La comparación con modelos de producción no es significativa: este checkpoint es una pieza de investigación a escala de laboratorio, no un modelo orientado a tareas. No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente de preentrenamiento: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones y puede producir texto incoherente o repetitivo.
- Riesgo elevado de alucinación y de contenido factualmente incorrecto, propio de un modelo de 15,8M de parámetros entrenado con unos 475M de tokens.
- Ventana de contexto muy limitada (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; el rendimiento fuera del inglés (si el corpus es mayoritariamente anglófono) es incierto.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución. Verificar antes de cualquier despliegue en producción.
- El tokenizador GPT-2 con vocabulario rellenado a 50.304 puede introducir tokens no utilizados durante el entrenamiento.
- No es compatible con `AutoModel` de Transformers; requiere el loader propio incluido en el repositorio.
- El checkpoint no incluye estado del optimizador, lo que impide reanudar el entrenamiento de forma exacta.
- Las métricas publicadas (BPB, pérdida) no son indicativas de calidad en tareas concretas.
- Sesgos conocidos: no documentados en la información disponible; al derivar del pool Dolma3 Dolmino, hereda los sesgos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-16m-30tpp-seed-1337
- Colección NanoGPT Ladder v3 (modelos preentrenados completados): https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de referencia: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Perfil del autor: https://huggingface.co/davidheineman
