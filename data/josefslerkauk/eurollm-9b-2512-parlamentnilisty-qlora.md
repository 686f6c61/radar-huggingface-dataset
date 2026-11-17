# josefslerkauk/EuroLLM-9B-2512-ParlamentniListy-QLoRA

## Resumen

EuroLLM-9B-2512-ParlamentniListy-QLoRA es un adaptador QLoRA de investigación publicado por el usuario josefslerkauk sobre el modelo base utter-project/EuroLLM-9B-2512. El objetivo del proyecto es estudiar experimentalmente cómo cambia el comportamiento de un modelo de lenguaje tras un entrenamiento adicional con textos de medios checos, concretamente del medio Parlamentní listy. La hipótesis que se investiga es si el modelo adopta una plantilla retórica general o si, por el contrario, aprende asociaciones ligadas a personas concretas, comparando el mismo inicio de frase con nombres reales, ficticios y sin nombre.

Técnicamente se trata de un adaptador LoRA de rango 8 aplicado sobre las proyecciones q_proj y v_proj de las 42 capas del transformer base, entrenado con 173 documentos y una única pasada de 200.798 tokens objetivo. El repositorio incluye el modelo base congelado en cuantización MLX affine de 4 bits (group-size 64, normas en BF16), el adaptador en FP32 y un cuaderno de inferencia comparativa que permite evaluar el modelo antes y después de activar el adaptador.

La relevancia del proyecto es metodológica: no se distribuye como un modelo de propósito general, sino como un artefacto de investigación reproducible para estudiar framing mediático y sesgos de asociación en modelos de lenguaje. La licencia es Apache 2.0, pero el autor advierte explícitamente de que los artículos originales de entrenamiento no se publican y de que los resultados no constituyen una medición representativa de la línea editorial del medio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base EuroLLM-9B-2512) con adaptador LoRA rango 8 sobre q_proj/v_proj en 42 capas |
| Parámetros totales | 9.152.319.488 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base EuroLLM-9B-2512) |
| Tipos de cuantización | Base MLX affine 4-bit, group-size 64, normas BF16; adaptador en FP32 |
| Idiomas soportados | Checo (cs) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), adaptador separado; no es serialización PEFT |

## Arquitectura y entrenamiento

El modelo base es EuroLLM-9B-2512, un transformer decoder-only de aproximadamente 9.152 millones de parámetros. Sobre él se aplica un adaptador LoRA de rango 8 con escala MLX 2.0 y dropout 0.05, insertado únicamente en las proyecciones q_proj y v_proj de las 42 capas. El entrenamiento emplea AdamW con learning rate 0.0001, weight decay 0.01, recorte de norma 1.0 y semilla 20261111. Los datos son cuerpos de artículos con un token BOS/EOS por documento y bloques de 512 tokens objetivo con reinicio de contexto entre bloques.

El corpus de entrenamiento comprende 173 documentos retenidos y una única pasada completa de 200.798 tokens objetivo (incluyendo EOS). El checkpoint publicado corresponde al paso 482, seleccionado por NLL sobre el conjunto de validación; los datos de test no se usan para la selección. El pipeline de limpieza elimina páginas de consentimiento, texto incompleto de paywall, navegación, promociones repetidas y metadatos, y agrupa duplicados exactos y casi duplicados antes del split. El adaptador no se fusiona con el base en esta release: se carga por separado mediante `adapter_path` en mlx-lm.

## Capacidades

- Generación de texto en checo mediante continuación de prefijos, tanto en modo libre como con candidatos múltiples.
- Comparación cuantitativa antes/después de activar el adaptador mediante probabilidad de tokens y palabras en textos fijos.
- Medición de cambio de probabilidad sobre frases con nombres reales, ficticios y sin nombre, orientada a estudiar framing mediático.
- Exportación de resultados a HTML autónomo, JSON y CSV de tokens y de palabras.
- Inferencia sobre MLX (Metal en Apple Silicon, MLX/CUDA en Linux con GPU NVIDIA compatible).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma nativa según la información disponible.
- No se documentan capacidades multimodales, de audio, visión ni modo thinking.

## Casos de uso

- Investigación sobre framing mediático: el cuaderno permite introducir un mismo inicio de frase con nombres reales, ficticios y sin nombre, y comparar la probabilidad de cada continuación antes y después de activar el adaptador, aislando el efecto del entrenamiento con textos de Parlamentní listy.
- Análisis de asociaciones léxicas: mediante el modo de texto completo se mide el cambio de probabilidad token a token en frases fijas, lo que permite cuantificar qué palabras concretas se ven más afectadas por el adaptador.
- Reproducibilidad de experimentos de continued pretraining: el repositorio incluye `training_summary.json`, `release.json`, `package-manifest.json` y el motor de inferencia emparejado, de modo que otro investigador puede replicar la comparación con el base congelado exacto.
- Docencia y formación en sesgos de IA: el par base/adaptador con conmutación controlada sirve como ejemplo práctico de cómo un corpus pequeño y sesgado puede alterar las distribuciones del modelo sin instrucciones de chat.
- Auditoría de metodología de evaluación de sesgos: el diseño con split train/validation/test por grupo de documentos y selección de checkpoint por NLL en validación es un caso de estudio de buenas prácticas en experimentos de dominio.
- Evaluación de despliegue MLX: el motor de inferencia ha funcionado en A40/A4500 y Apple M2, por lo que el paquete sirve para probar flujos de inferencia MLX en distintas plataformas antes de adoptarlos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas internas del entrenamiento: checkpoint seleccionado en el paso 482 tras 200.798 tokens objetivo, y selección por NLL sobre validación. No se proporcionan valores de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 5,2 GB en total (5,17 GB de base en 4-bit MLX más 17,91 MB de adaptador FP32), por lo que la inferencia cabe en GPUs con al menos 6-8 GB de VRAM en la práctica, aunque el requisito exacto no está documentado.
- GPU recomendadas: el autor confirma ejecución en NVIDIA A40 y A4500; no se ha verificado compatibilidad con T4 ni con la ejecución directa en Colab.
- Apple Silicon: soportado vía MLX/Metal, con ejecución verificada en Apple M2.
- Cabe en GPU de consumo: no disponible de forma explícita; por tamaño de pesos en 4-bit es plausible en GPUs consumer con suficiente VRAM, pero no se ha verificado.
- Opciones de despliegue: MLX y mlx-lm (versiones 0.32.0 y 0.31.3 respectivamente); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| EuroLLM-9B-2512-ParlamentniListy-QLoRA (este) | 9.152 M | no disponible | Apache 2.0 | Adaptador QLoRA de investigación sobre framing mediático en checo | Hugging Face, MLX |
| utter-project/EuroLLM-9B-2512 (base) | 9.152 M | no disponible | no disponible en la información proporcionada | Modelo base multilingüe europeo | Hugging Face |
| Alternativas de continued pretraining en checo de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrena con un corpus muy pequeño (173 documentos, 200.798 tokens objetivo), por lo que los efectos observados pueden no generalizar.
- El autor advierte de que una mayor probabilidad de una formulación no es una evaluación de veracidad ni de las características de la persona descrita; los resultados no deben interpretarse como juicio sobre individuos.
- Parlamentní listy incluye múltiples géneros, incluidos textos políticos patrocinados y notas de prensa; el adaptador no aísla una voz editorial concreta.
- El piloto no es una medición representativa de la línea editorial de todo el medio, y las diferencias entre corpus de distinto tamaño no pueden atribuirse únicamente a sus fuentes.
- Los artículos completos de entrenamiento no se publican ni forman parte del repositorio; la licencia del modelo no cubre los artículos originales.
- El adaptador está diseñado para el base congelado exacto en MLX affine 4-bit (group-size 64, normas BF16) convertido desde los tensores FP32 fijados; aplicarlo a otra cuantización invalida el experimento.
- No es serialización PEFT: requiere MLX y mlx-lm; Linux necesita GPU NVIDIA compatible con dependencias MLX/CUDA.
- No se ha verificado la compatibilidad con T4 ni la ejecución directa en Colab.
- Riesgo de alucinación y sesgos: inherente al modelo base y potencialmente amplificado por el corpus de dominio; no se documentan evaluaciones específicas de sesgo.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el propósito declarado es investigación y el autor no ofrece garantías sobre el comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josefslerkauk/EuroLLM-9B-2512-ParlamentniListy-QLoRA
- Modelo base: https://huggingface.co/utter-project/EuroLLM-9B-2512
- Cuaderno de comparación en Colab: https://colab.research.google.com/#fileId=https://huggingface.co/josefslerkauk/EuroLLM-9B-2512-ParlamentniListy-QLoRA/resolve/main/EuroLLM_Compare.ipynb
- Commit del base fijado: 3f5bacd0762eb45170985d6b699035f6a385ee3e
