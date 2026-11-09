# Jack04810/SPAC-4B

## Resumen

SPAC-4B (Sparse Proximity-Aware Compression) es un modelo multimodal de comprensión y generación 3D construido sobre el backbone de lenguaje Qwen3-4B. Lo desarrolla el autor Jack04810 y resuelve el problema de representar geometría 3D de forma eficiente dentro de un modelo de lenguaje: codifica mallas como bandas SDF dispersas, las comprime con un tokenizador 3D-BPE reversible y las serializa con coordenadas de Morton y codificación posicional espacial (Spatial-PE) para que el LLM pueda consumirlas y predecirlas. El resultado es un único modelo que hace las dos direcciones: malla a texto (captioning) y texto a malla (text-to-3D).

La innovación central es la dispersión: en lugar de voxelizar un volumen denso completo, el encoder procesa solo una banda estrecha alrededor de la superficie, de modo que la carga computacional crece aproximadamente con el área superficial, O(R²), y no con el volumen. Según la model card, a resolución R = 256 el encoder de SPAC consume 137,98 GFLOPs y 85,04 ms frente a 41,38 TFLOPs y 4227,84 ms del encoder denso de ShapeLLM en el protocolo reportado por los autores.

Es relevante ahora porque propone una vía distinta a los pipelines de difusión 3D (TRELLIS, SAR3D): un único transformer autoregresivo que comparte representación para entender y generar geometría. El checkpoint publicado es un fine-tune de continuación sobre un dataset denominado Toy4k y hereda el historial de entrenamiento del checkpoint original `SPAC-4B-toy4k`; las cifras de benchmark de la model card corresponden a los modelos experimentales del paper, no a mediciones frescas de este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con encoder 3D de SDF disperso (VQ-VAE) y tokenizador 3D-BPE; Spatial-PE explícito |
| Parametros totales | ~4B (backbone de lenguaje); el recuento del encoder VQ-VAE no se detalla |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el demo permite hasta 8192 tokens nuevos en generación y 256 en comprensión |
| Tipos de cuantizacion | no disponible; el demo publicado se ejecuta en FP32 (TF32 y AMP desactivados) |
| Idiomas soportados | inglés (en) |
| Licencia | other (licencia personalizada, sin texto detallado en la información disponible) |
| Formato de pesos | PyTorch (checkpoint FP32); repo de 37,6 GB; no se indica GGUF ni safetensors |
| Vocabulario | 200.832 tokens |
| RoPE theta | 1.000.000 |
| Spatial-PE | 0,08 |
| Resolucion SDF / rejilla | 256 / rejilla explícita 32³ |
| Pipeline | text-to-3d |

## Arquitectura y entrenamiento

El sistema tiene tres piezas acopladas. Primero, un VQ-VAE de SDF disperso que codifica una banda estrecha alrededor de la superficie de la malla en lugar de un volumen denso. Segundo, un tokenizador 3D-BPE que fusiona patrones recurrentes de caras adyacentes usando pares de tokens y sus offsets relativos; la fusión es reversible a nivel de token VQ discreto. Tercero, un backbone Qwen3-4B con embeddings de entrada y salida independientes, coordenadas de Morton serializadas como tokens y Spatial-PE explícito para que el modelo de lenguaje pueda razonar sobre estructura 3D. La inferencia geométrica requiere el wrapper de SPAC y el manifiesto espacial y la tabla de merges correspondientes: `AutoModel.generate()` estándar no aplica Spatial-PE.

En cuanto a datos, la model card referencia el dataset `Jack04810/bpe-mix-dataset` y describe el checkpoint como una continuación sobre Toy4k (`checkpoint-20352`, revisión `de08d429d2910e784b7ca0a22731246e26649c06`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO. El modelo se exportó con pesos FP32 y un vocabulario de 200.832 tokens; el loader gestiona el flag obsoleto de embeddings atados del export original sin sobrescribir el `lm_head` aprendido.

## Capacidades

- Generación de texto condicionada a geometría: produce descripciones (captions) de mallas 3D a partir de la codificación SDF dispersa.
- Generación text-to-3D: predice geometría SDF y exporta una malla sin texturas a partir de una descripción en lenguaje natural.
- Comprensión de mallas: ruta completa malla → SDF → tokens → texto mediante `--encode-mesh`.
- Serialización geométrica con tokens de coordenadas de Morton y Spatial-PE, lo que permite al LLM predecir estructura 3D de forma autoregresiva.
- Compresión reversible de secuencias 3D mediante 3D-BPE a nivel de token VQ.
- Generación greedy determinista en el demo (temperatura 0, top-k 1, top-p 1), con hasta 8192 tokens nuevos en generación y 256 en comprensión.
- Capacidades heredadas del backbone Qwen3-4B (razonamiento y texto en inglés), aunque la model card no las valida ni las documenta para este fine-tune.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no documentados en la información disponible para este checkpoint.

## Casos de uso

- Prototipado de assets 3D a partir de texto: generar mallas sin textura para iterar rápido en previsualización de conceptos, usando la ruta `infer.py generate` con una descripción como "A wooden barrel with metal hoops." y exportando la geometría SDF a malla.
- Catalogación automática de mallas: pasar un `.obj` por `infer.py understand --encode-mesh` para obtener un caption en inglés que sirva como metadato en un pipeline de gestión de assets.
- Investigación en representaciones 3D tokenizadas: el 3D-BPE y las coordenadas de Morton permiten experimentar con compresión de secuencias geométricas y medir entropía de bigramas frente a alternativas 1D.
- Indexación semántica de bibliotecas 3D: combinar el captioning con un motor de búsqueda textual para localizar mallas por descripción, aprovechando que la codificación es reversible a nivel de token.
- Evaluación comparativa de encoders 3D: usar el encoder disperso como referencia de eficiencia (GFLOPs, latencia, memoria pico) frente a encoders densos en experimentos académicos.
- Docencia y demos interactivas: la interfaz Gradio en `http://localhost:7860` permite mostrar en vivo las dos direcciones del modelo con ejemplos empaquetados que reutilizan tokens de entrada guardados.
- Generación condicionada en flujos de diseño industrial: producir variantes geométricas de piezas descritas textualmente para revisión temprana, teniendo en cuenta que la salida es una malla sin textura.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a los modelos experimentales del paper y a sus protocolos, no a mediciones frescas del checkpoint distribuido. Se reproducen a continuación con esa advertencia.

Compresión del tokenizador (mismo presupuesto de merges; menor es mejor):

| Tokenizer | Longitud de secuencia restante | Entropía de bigramas |
|---|---:|---:|
| 3D-BPE (SPAC) | 0,754 | 0,972 |
| 1D Morton BPE | 0,803 | 1,092 |
| 1D Hilbert BPE | 0,820 | 1,220 |
| 1D Random BPE | 0,998 | 2,167 |

Text-to-3D reportado en el manuscrito:

| Método | CLIP ↑ | FD ↓ | KID ×100 ↓ |
|---|---:|---:|---:|
| SAR3D | 23,9 | 27,2 | 0,28 |
| TRELLIS | 30,8 | 18,3 | 0,10 |
| ShapeLLM-Omni | 26,7 | 25,9 | 0,25 |
| SPAC | 24,4 | 23,7 | 0,22 |

Eficiencia del encoder a R = 256 (protocolo del manuscrito): SPAC 137,98 GFLOPs y 85,04 ms frente a ShapeLLM denso 41,38 TFLOPs y 4227,84 ms. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje para este checkpoint en la información disponible.

## Requisitos de hardware

- Sistema: Linux x86_64 y driver NVIDIA compatible con CUDA 12.4.
- GPU recomendada por el autor: A100 de 40 GB para el demo monofásico en FP32; tanto el LLM como el VQ-VAE se ejecutan en FP32.
- El repo pesa 37,6 GB, lo que condiciona el espacio en disco además de la VRAM.
- No se documenta soporte de cuantización (GGUF, AWQ, GPTQ) ni ejecución en GPU de consumo; el demo desactiva TF32 y AMP, por lo que no hay una ruta de menor precisión publicada.
- Opciones de despliegue: el repositorio oficial `SPAC-main` con `infer.py` (generate/understand) y la interfaz Gradio `run.sh`. No se indica compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles para el checkpoint; solo se reporta la latencia del encoder (85,04 ms a R = 256) en el protocolo del paper.
- La generación usa decodificación greedy con hasta 8192 tokens nuevos; una salida que alcanza el límite puede quedar incompleta y el demo lo registra como `ended_normally` en `result.json`.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPAC-4B | ~4B (LLM) + VQ-VAE | LLM autoregresivo con SDF disperso y 3D-BPE | no disponible | other | Hugging Face, repo de código |
| TRELLIS | no disponible | Generación 3D por difusión | no disponible | no disponible | Referenciado en el paper |
| SAR3D | no disponible | Generación 3D | no disponible | no disponible | Referenciado en el paper |
| ShapeLLM-Omni | no disponible | LLM multimodal 3D con encoder denso | no disponible | no disponible | Referenciado en el paper |

En calidad text-to-3D reportada, TRELLIS obtiene mejor CLIP (30,8), FD (18,3) y KID (0,10) que SPAC (24,4 / 23,7 / 0,22), mientras que SPAC supera a SAR3D y ShapeLLM-Omni en FD y KID. La ventaja de SPAC es de eficiencia computacional del encoder y de compresión de secuencia, no de calidad final de generación.

## Limitaciones y advertencias

- Las cifras de benchmark proceden de los modelos experimentales del paper, no de este checkpoint; el propio autor advierte que la repetición de entrenamiento sobre Toy4k es un experimento distinto.
- El checkpoint es una continuación sobre Toy4k, un dataset de nombre sugiere escala reducida; el rendimiento en dominios reales puede diferir del reportado.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La generación exporta mallas sin textura; los colores de las figuras del paper son posprocesado de visualización.
- La inferencia geométrica exige el wrapper de SPAC, el manifiesto espacial y la tabla de merges; `AutoModel.generate()` no aplica Spatial-PE y produciría resultados incorrectos.
- Licencia "other" sin texto detallado en la información disponible: es imprescindible revisar los términos antes de cualquier uso comercial.
- No hay datos publicados sobre sesgos, tasa de alucinación en captions ni robustez ante mallas ruidosas o incompletas.
- El demo requiere FP32 y una A100 de 40 GB; no hay ruta de cuantización documentada, lo que limita el despliegue en hardware de consumo.
- El modelo tiene 4 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jack04810/SPAC-4B
- Código y demo: https://github.com/yangjj007/SPAC-main
- Dataset de entrenamiento: https://huggingface.co/datasets/Jack04810/bpe-mix-dataset
- Checkpoint de origen: https://huggingface.co/Jack04810/SPAC-4B-toy4k
- Variante relacionada: https://huggingface.co/Jack04810/spac-qwen3-4b-spatial-pe-8ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Ficha de terceros: https://genaihub.net/agents/hf-model-jack04810-spac-4b-spacialpe-0-08
