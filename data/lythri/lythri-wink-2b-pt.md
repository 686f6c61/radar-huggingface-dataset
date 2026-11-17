# Lythri/Lythri-Wink-2B-pt

## Resumen

Lythri-Wink-2B-pt es un modelo base preentrenado de 2.522.816.159 parámetros totales (1.480 millones activos) desarrollado por Lythri. Se obtiene mediante poda estructural (*structured pruning*) del modelo Gemma4-E2B PT de Google y posterior recuperación de capacidades mediante destilación de conocimiento desde el modelo profesor. El resultado es un modelo un 45,6 % más pequeño en parámetros totales que su base (4,63B frente a 2,52B) que conserva la estructura de atención y el tamaño oculto del modelo original, reduciendo únicamente el ancho de la FFN y la dimensión PLE.

El modelo está pensado para preentrenamiento continuado, adaptación de dominio, ajuste supervisado e investigación sobre poda y destilación, no para conversación directa. Para uso conversacional el autor remite a la variante ajustada `Lythri/Lythri-Wink-2B`. Emplea una arquitectura tipo transformer con mezcla de expertos (MoE) heredada de Gemma 4, con 31 capas de decodificador (frente a 35 del original) y una FFN reducida al 60 % del ancho original.

Su relevancia radica en que demuestra que es posible recortar casi la mitad de los parámetros de un MoE manteniendo una fidelidad razonable respecto al profesor (KL de validación de 0,3241 y perplejidad de estudiante de 2,552 frente a 2,270 del profesor en el paso 1500), con un presupuesto de destilación de apenas 816 millones de tokens y contexto de entrenamiento de 8K. La licencia Apache 2.0 y su tamaño lo sitúan como candidato para despliegue en dispositivo (*on-device*) y para investigación académica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), derivado de Gemma 4 |
| Parámetros totales | 2.522.816.159 (2,52B) |
| Parámetros activos | 1,48B |
| Longitud de contexto | 8K (longitud de entrenamiento); contexto máximo de inferencia no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas MoE, estructuralmente podado desde Gemma4-E2B PT. La poda afecta a tres ejes: capas de decodificador (de 35 a 31), dimensión PLE (de 256 a 128) y ancho de la FFN (reducido a aproximadamente el 60 % del original). El tamaño oculto del modelo de lenguaje y la estructura de cabezas de atención se mantienen intactos, lo que preserva la geometría de atención del profesor y facilita la destilación.

La recuperación de capacidades se realiza mediante destilación de conocimiento desde el profesor Gemma4-E2B PT sobre aproximadamente 816 millones de tokens (812,6M en el checkpoint exportado, paso 1550), con una longitud de contexto de entrenamiento de 8K. En el paso 1500 de validación se reportan KL de validación de 0,3241, entropía cruzada del estudiante de 2,552 y del profesor de 2,270. No se documenta el uso de RLHF, DPO ni ajuste por preferencias, coherente con su naturaleza de modelo base. El autor no detalla la composición del dataset de destilación ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva como modelo base; no incluye plantilla de chat ni ajuste por instrucciones.
- Razonamiento y conocimiento factual heredados del profesor, recuperados parcialmente mediante destilación (evaluado en ARC-Easy y SocialIQA).
- Capacidad multimodal latente por herencia de Gemma 4 (etiqueta `image-text-to-text` en el repositorio), aunque la model card no documenta uso de visión ni se publican evaluaciones multimodales.
- Punto de partida para ajuste supervisado: admite *continued pre-training* y adaptación de dominio.
- Soporte de *tool calling* / *function calling*: no disponible (no es un modelo ajustado para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; requeriría ajuste posterior.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo *thinking*, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Preentrenamiento continuado en dominio específico: el modelo sirve como inicialización para seguir preentrenando sobre corpus técnicos (legal, médico, financiero) con un coste computacional inferior al de partir de Gemma4-E2B, gracias a sus 2,52B parámetros totales y 1,48B activos.
- Ajuste supervisado para asistentes especializados: partiendo de este checkpoint se puede aplicar SFT con instrucciones y obtener un modelo conversacional de dominio, como demuestra la propia variante `Lythri-Wink-2B` del autor.
- Investigación en poda estructural: permite reproducir y extender el estudio de recorte de FFN y dimensión PLE comparando curvas de KL y entropía cruzada frente al profesor.
- Investigación en destilación de conocimiento: con 816M tokens de destilación documentados, es una base para experimentar con presupuestos de destilación, temperaturas y funciones de pérdida.
- Despliegue en dispositivo (*on-device*): sus 2,52B parámetros totales y 1,48B activos lo hacen viable en hardware de consumo con cuantización, aunque el autor no publica pesos cuantizados; sería necesario generarlos.
- Evaluación comparativa de modelos podados: útil como referencia en estudios que midan la degradación de benchmarks de conocimiento (MMLU, ARC, HellaSwag) tras poda y destilación.
- Generación de texto en pipelines de investigación: con `transformers` y `AutoModelForCausalLM` se integra en flujos de generación de texto sin necesidad de plantilla de chat, siempre manteniendo el token BOS.

## Benchmarks y rendimiento

| Categoría | Benchmark | Configuración | Puntuación |
|---|---|---|---|
| Conocimiento | MMLU | 5-shot, acc | TBD (no publicado) |
| Conocimiento | ARC-Challenge | 25-shot, acc_norm | TBD (no publicado) |
| Conocimiento | ARC-Easy | 0-shot, acc_norm | 65,99 |
| Razonamiento | HellaSwag | 10-shot, acc_norm | TBD (no publicado) |
| Sentido común | PIQA | 0-shot, acc_norm | TBD (no publicado) |
| Sentido común | BoolQ | 0-shot, acc | TBD (no publicado) |
| Razonamiento social | SocialIQA | 0-shot, acc | 42,43 |
| Correferencia | WinoGrande | 5-shot, acc | TBD (no publicado) |

Métricas de destilación en el paso 1500 (validación): KL 0,3241; CE del estudiante 2,552; CE del profesor 2,270. El checkpoint publicado corresponde al paso 1550 (~812,6M tokens). El autor advierte que la evaluación debe realizarse sin plantilla de chat y añadiendo el token BOS al inicio de cada secuencia; omitirlo degrada sustancialmente los resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,05 GB solo para pesos (2,52B × 2 bytes), más overhead de activaciones y caché KV; en la práctica entre 6 y 8 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5 GB para pesos; en 4 bits, alrededor de 1,3 GB. El autor no publica pesos cuantizados, por lo que habría que generarlos con herramientas externas.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y destilación; RTX 4090, RTX 3090 o L40S para inferencia en bf16 y ajuste ligero.
- GPU de consumo: cabe en tarjetas con 8 GB o más en bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) y en tarjetas con 4-6 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte oficial documentado); vLLM, llama.cpp, Ollama y TGI no están documentados por el autor y requerirían conversión de pesos.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Lythri-Wink-2B-pt | 2,52B | 1,48B | 8K (entrenamiento) | Apache 2.0 | Modelo base podado y destilado desde Gemma4-E2B |
| google/gemma-4-E2B (profesor) | 4,63B | 2,28B | no disponible en la información | Licencia Gemma (no confirmada en la información) | Modelo original del que se deriva; 35 capas, PLE 256 |
| Lythri-Wink-2B | no disponible | no disponible | no disponible | no disponible | Variante ajustada para conversación del mismo autor |
| Alternativas de ~2-3B densos (p. ej. familias tipo Qwen, Llama, Phi) | ~2-3B | densos (sin MoE) | variable | variable | No se dispone de datos comparativos publicados en la información proporcionada |

No se han publicado comparaciones directas con modelos de la misma categoría en la información disponible; la única comparación documentada es frente al profesor Gemma4-E2B en la tabla de arquitectura y en las métricas de destilación.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no debe usarse directamente como asistente conversacional; para ello el autor remite a `Lythri/Lythri-Wink-2B`.
- Hereda sesgos y limitaciones del modelo base Gemma 4, del profesor y de los datos de entrenamiento; el autor no detalla la composición del corpus de destilación.
- Riesgo de alucinación y de generar contenido inexacto o inapropiado, especialmente al no estar alineado.
- La recuperación respecto al profesor es parcial: CE del estudiante 2,552 frente a 2,270 del profesor en el paso 1500, lo que implica una degradación medible en la distribución de salida.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- Contexto de entrenamiento limitado a 8K; el contexto máximo de inferencia no está especificado y podría degradarse más allá de esa longitud.
- Requiere mantener el token BOS activado en evaluación y ajuste; omitirlo degrada sustancialmente los resultados, según advierte el autor.
- Aunque la licencia es Apache 2.0, el modelo se construye sobre Gemma 4; conviene verificar las obligaciones derivadas de la licencia del modelo base antes de un uso comercial.
- No se publican pesos cuantizados ni métricas de latencia/throughput, lo que dificulta la planificación de despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lythri/Lythri-Wink-2B-pt
- Variante conversacional: https://huggingface.co/Lythri/Lythri-Wink-2B
- Perfil del autor en Hugging Face: https://huggingface.co/Lythri
- Perfil en ModelScope: https://www.modelscope.cn/profile/Spike8086
- Informe técnico (Zenodo): https://zenodo.org/records/23179312
- DOI del informe técnico: https://doi.org/10.5281/zenodo.23179311
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Banner del proyecto: https://huggingface.co/spaces/Lythri/README/resolve/main/Banner_flat.png
