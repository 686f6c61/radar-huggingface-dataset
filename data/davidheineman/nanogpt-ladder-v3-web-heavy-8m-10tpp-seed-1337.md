# davidheineman/nanogpt-ladder-v3-web-heavy-8m-10tpp-seed-1337

## Resumen

NanoGPT Ladder v3 web-heavy 8M es un modelo de lenguaje base de escala reducida (8.011.776 parametros) desarrollado por davidheineman como parte de la coleccion NanoGPT Ladder v3, una serie de ejecuciones de preentrenamiento independientes que exploran el efecto del presupuesto de tokens y la composicion del corpus sobre modelos tipo GPT de arquitectura minimalista. El modelo se ha entrenado sobre el pool Dolma3 Dolmino con una mezcla "web-heavy" (80% del peso asignado al dominio web nombrado) y ha consumido 80.117.760 tokens de prediccion en 2.445 pasos de optimizador con semilla 1337.

Se trata de un checkpoint de preentrenamiento puro: los pesos preceden a cualquier fase de condicionamiento tiny-rl, SFT o RL, por lo que debe emplearse con prompts de texto plano y sin expectativas de alineamiento conversacional. Su interes es fundamentalmente metodologico y de investigacion: permite reproducir y comparar recetas de mezcla de datos a muy baja escala, con trazabilidad completa de revisiones de origen, pesos de mezcla y hashes SHA256 registrados en `metadata.json`.

La arquitectura es un transformer decoder-only de 8 capas, anchura 128, 4 cabezas de atencion, embeddings atados, RoPE y tokenizador GPT-2, con una ventana de contexto de 1.024 tokens y un vocabulario rellenado de 50.304 entradas. El repositorio no incluye pesos en formato Transformers sino un checkpoint nativo de PyTorch que requiere el cargador propio incluido en el repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (NanoGPT), 8 capas, anchura 128, 4 cabezas, embeddings atados, RoPE |
| Parametros totales | 8.011.776 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el repo no publica variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint nativo PyTorch (`model.pt`, float32) con `model`, `config`, `identity` y `run`; no compatible con `AutoModel` de Transformers |

## Arquitectura y entrenamiento

El modelo sigue la implementacion NanoGPT: un transformer decoder-only con 8 capas, dimension de modelo 128, 4 cabezas de atencion, embeddings de entrada y salida atados, codificacion posicional rotatoria (RoPE) y tokenizador GPT-2 (`tiktoken`), con vocabulario rellenado hasta 50.304 entradas. El checkpoint conserva los pesos float32 originales e incluye la configuracion y los metadatos de identidad y ejecucion, pero no el estado del optimizador, por lo que sirve para inferencia y para fine-tuning posterior desde cero del estado del optimizador.

El preentrenamiento se realizo sobre el pool `allenai/dolma3_dolmino_pool` siguiendo una receta de mezcla congelada; en las mezclas "heavy" el 80% del peso se asigna al dominio nombrado (en este caso, web). La ejecucion consumio 80.117.760 tokens de prediccion, equivalentes a 10 tokens por parametro (TPP) sobre los 8.011.776 parametros, distribuidos en 2.445 pasos de optimizador con semilla 1337. Cada presupuesto de tokens de la coleccion corresponde a una ejecucion entrenada de forma independiente. No se documentan fases de RLHF, DPO ni SFT en este checkpoint.

## Capacidades

- Generacion de texto autoregresiva a partir de prompts de texto plano, con decodificacion greedy disponible mediante `temperature=0`.
- Modelado de lenguaje puro: el modelo esta pensado para medir perdida y BPB, no para resolver tareas.
- Fine-tuning posterior: el checkpoint admite entrenamiento adicional, aunque sin estado de optimizador incluido.
- Ejecucion en CUDA, Apple MPS o CPU mediante seleccion automatica de dispositivo (`device=auto`).
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidades multilingues: no disponibles; el tokenizador es GPT-2 y no se declaran idiomas soportados.

## Casos de uso

- Investigacion sobre mezclas de datos: reproducir la receta web-heavy frente a otras mezclas de la coleccion NanoGPT Ladder v3 para aislar el efecto de la composicion del corpus en la perdida de validacion a escala de 8M de parametros.
- Experimentos de leyes de escala: utilizar los puntos de 10 TPP junto con los demas endpoints de la coleccion para ajustar curvas de perdida frente a tokens por parametro en un regimen de computo muy bajo.
- Docencia y formacion: el modelo cabe en CPU y en cualquier GPU consumer, y el codigo de `model.py` y `generate.py` es lo bastante pequeno para explicar paso a paso el funcionamiento interno de un transformer decoder-only.
- Pruebas de infraestructura de inferencia: validar pipelines de carga de checkpoints nativos de PyTorch, tokenizacion con `tiktoken` y decodificacion greedy antes de escalar a modelos mayores.
- Baseline de referencia en ablaciones: servir como punto de comparacion controlado (semilla fija 1337, contexto 1.024, vocabulario 50.304) en estudios que varian tokenizador, RoPE o atado de embeddings.
- Generacion de texto de relleno y pruebas de humo: verificar el correcto funcionamiento de un servicio de generacion con prompts simples antes de desplegar modelos de mayor tamano.
- Analisis de trazabilidad reproducible: emplear `metadata.json` y `results.json` para auditar revisiones exactas de dataset, pesos de mezcla y hashes SHA256 en flujos de investigacion reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones finales de BPB y perdida son evaluaciones de modelado de lenguaje y no precision en resolucion de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 para los pesos (8M de parametros), mas el overhead del runtime de PyTorch y del tokenizador; en la practica, cualquier GPU con 1 GB o mas es suficiente.
- GPU recomendadas: no se requieren aceleradores de datacenter; el modelo funciona en CPU, Apple MPS, RTX 3060, RTX 4090, A100 o H100 sin diferencias de viabilidad.
- Cabe holgadamente en cualquier GPU consumer, incluida la gama integrada y portatiles.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no usar la interfaz de Transformers no es directamente compatible con `AutoModel`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 web-heavy 8M (este) | 8.011.776 | 1.024 | Preentrenamiento reproducible con mezcla web-heavy sobre Dolma3 Dolmino | no disponible | Hugging Face, checkpoint PyTorch nativo |
| Otros endpoints de NanoGPT Ladder v3 | Variable segun ejecucion | 1.024 (segun receta) | Misma receta con distinta mezcla o presupuesto de tokens | no disponible | Coleccion en Hugging Face |
| GPT-2 small (referencia de la familia) | 124M | 1.024 | Transformer decoder-only con tokenizador GPT-2 | MIT (habitual en la publicacion original) | Ampliamente disponible |
| Modelos comparables de 8M en otras familias | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa disponible es con el resto de la coleccion NanoGPT Ladder v3, que comparte arquitectura, tokenizador y contexto pero difiere en mezcla de datos y presupuesto de tokens.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones ni mantiene conversaciones coherentes de forma fiable.
- Riesgo elevado de alucinacion y de texto incoherente: con 8M de parametros y 80M de tokens de entrenamiento, la capacidad de modelado es muy limitada.
- Contexto corto: 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas no declarados: no hay garantia de cobertura multilingue; el tokenizador GPT-2 esta sesgado hacia ingles.
- Sesgos del corpus: la mezcla web-heavy puede amplificar sesgos y ruido presentes en datos web de Dolma3 Dolmino.
- Licencia no disponible: la ausencia de licencia explicita impide asumir permisos de uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- Incompatibilidad con el ecosistema Transformers: requiere el cargador propio del repositorio y no funciona con `AutoModel` ni con servidores de inferencia estandar.
- Sin estado de optimizador en el checkpoint: el fine-tuning debe reiniciar el estado del optimizador.
- Repositorio de 0.0 GB y sin descargas ni likes registrados: no hay evidencia de validacion por parte de la comunidad.
- Las metricas publicadas (BPB, perdida) no equivalen a precision en tareas; no deben interpretarse como rendimiento funcional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-8m-10tpp-seed-1337
- Coleccion NanoGPT Ladder v3 de modelos preentrenados completados: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
- Perfil del autor: https://huggingface.co/davidheineman
- Paper, blog, repositorio y demo: no disponibles en la informacion proporcionada.
