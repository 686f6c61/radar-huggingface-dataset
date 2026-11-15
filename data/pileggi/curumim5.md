# Pileggi/curumim5

## Resumen

curumim5 es un modelo de lenguaje causal en portugués brasileño desarrollado por Pileggi, entrenado desde cero (preentrenamiento y posterior ajuste supervisado, SFT) y orientado a respuestas cortas y conocimiento factual. Se trata de un transformer decoder-only de aproximadamente 152 millones de parámetros, con 16 capas, dimensión de modelo 768 y 12 cabezas de atención, lo que lo sitúa en la categoría de modelos pequeños manejables en hardware de consumo.

La arquitectura incorpora LayerNorm, RoPE (rotary positional embeddings), SwiGLU en las capas feed-forward y weight tying entre la matriz de embeddings y la cabeza de salida. El vocabulario es de 24.000 tokens con tokenización BPE y la ventana de contexto es de 1.024 tokens, una cifra reducida que condiciona los casos de uso posibles. Los pesos se distribuyen en bf16 con un tamaño de repositorio de 0,3 GB.

Su relevancia es acotada: se publica bajo licencia Apache 2.0, pero utiliza una librería y arquitectura propias (`curumim`) que impiden cargarlo con `AutoModel` de Transformers, lo que limita su integración directa en ecosistemas estándar. No cuenta con descargas ni interacciones en el momento de la ficha, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con LayerNorm, RoPE, SwiGLU y weight tying |
| Parametros totales | 152.258.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Portugués (pt), mayoritariamente portugués brasileño |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Capas / d_model / cabezas | 16 / 768 / 12 |
| Vocabulario | 24.000 tokens (BPE) |
| Tamaño del repositorio | 0,3 GB |
| Librería | curumim (propia, no compatible con AutoModel) |

## Arquitectura y entrenamiento

curumim5 es un transformer decoder-only de 16 capas con dimensión de modelo 768 y 12 cabezas de atención. Emplea LayerNorm, embeddings posicionales rotatorios (RoPE) y activación SwiGLU en las capas feed-forward, además de weight tying entre la matriz de embeddings de entrada y la proyección de salida, lo que reduce el número de parámetros efectivos. El tokenizador es BPE con un vocabulario de 24.000 tokens, dimensionado para un corpus en portugués.

El autor indica que el modelo fue entrenado desde cero mediante preentrenamiento seguido de SFT (supervised fine-tuning) sobre instrucciones, con el formato de prompt `### Instrução:` / `### Resposta:`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas destacables más allá de las elecciones arquitectónicas estándar mencionadas.

## Capacidades

- Generación de texto causal en portugués brasileño, con formato de instrucción y respuesta.
- Orientación a respuestas cortas y conocimiento factual dentro de los límites de un modelo de 152M de parámetros.
- Generación determinista disponible mediante decodificación greedy (`do_sample=False`).
- Soporte de inferencia en bf16 y compilación del grafo (`compile=True`) a través de la librería propia `curumim`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del portugués.
- No se documenta visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Respuestas factuales breves en portugués: el modelo responde a preguntas directas del tipo "¿cuál es la capital de Brasil?" con el formato de instrucción documentado, adecuado para asistentes de consulta simple.
- Prototipado e investigación de arquitecturas propias: sirve como referencia funcional de un transformer decoder-only pequeño entrenado desde cero, útil para estudiar el pipeline completo de preentrenamiento y SFT.
- Generación de texto de longitud corta en portugués: con 1.024 tokens de contexto y respuestas acotadas, encaja en tareas de completado breve, resúmenes de una frase o reformulación.
- Experimentación educativa: su tamaño de 0,3 GB y 152M de parámetros permiten ejecutarlo en una GPU de consumo para prácticas de carga de pesos, tokenización BPE y generación.
- Evaluación de la librería `curumim`: el modelo es el artefacto de referencia para probar la carga de `ModelConfig`, `CurumimModel`, `BPETokenizerWrapper` y `Generator` del ecosistema del autor.
- Base para fine-tuning específico en portugués: al estar bajo Apache 2.0 y ser pequeño, puede servir como punto de partida para ajustes supervisados en dominios concretos, siempre que el contexto de 1.024 tokens sea suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 305 MB para los pesos, más el overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna con soporte bf16; el autor usa `device="cuda"` con `precision="bf16"`. Funciona en RTX 3090, RTX 4090, A100, H100 y GPUs de gama media como RTX 3060.
- Cabe en GPU de consumo: sí, en todas las GPU con al menos 2 GB de VRAM; también es viable en CPU para pruebas.
- Opciones de despliegue: no se documenta integración con vLLM, llama.cpp, Ollama o TGI; la única vía indicada es la librería propia `curumim` con `safetensors.torch.load_file`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / ecosistema |
|---|---|---|---|---|---|
| curumim5 | ~152M | 1.024 | Portugués | Apache 2.0 | safetensors, librería `curumim` propia |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Conocimiento factual limitado por sus 152M de parámetros; el propio autor advierte de riesgo de alucinación en temas fuera de los datos de entrenamiento.
- Entrenado mayoritariamente en portugués brasileño; puede rendir mal en otros idiomas, incluido el portugués europeo.
- Contexto de solo 1.024 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- No es compatible con `AutoModel` de Transformers ni con el ecosistema estándar; requiere el código de la librería `curumim`, lo que complica su integración en producción.
- El autor señala que el uso comercial debe evaluarse respecto a las licencias de los datos de origen, pese a que el modelo se publica bajo Apache 2.0.
- Sin descargas ni validación comunitaria en el momento de la ficha; no hay benchmarks publicados que respalden su calidad.
- No se documentan sesgos específicos, pero un modelo pequeño entrenado en un corpus no especificado es susceptible de reproducir sesgos presentes en dichos datos.

## Enlaces

- Hugging Face: https://huggingface.co/Pileggi/curumim5
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
