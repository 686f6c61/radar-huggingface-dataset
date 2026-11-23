# optimum-intel-internal-testing/tiny-random-EuroBertModel

## Resumen

`optimum-intel-internal-testing/tiny-random-EuroBertModel` es un checkpoint de pruebas publicado por el equipo interno de `optimum-intel` en Hugging Face. No es un modelo entrenado ni pensado para uso real: se trata de una instancia minúscula de la arquitectura EuroBERT con pesos inicializados aleatoriamente (`torch.randn_like`) y una configuración reducida (`hidden_size=32`, `intermediate_size=64`, 4 capas, 2 cabezas de atención). Su función es servir como fixture determinista en la suite de tests de la librería `optimum-intel`, que valida la exportación y ejecución de modelos transformers sobre runtimes de Intel (OpenVINO, IPEX, Neural Compressor).

El modelo hereda la clase `EuroBertModel` de la familia EuroBERT, un encoder tipo BERT orientado a extracción de características y tareas de clasificación multilingüe, pero con todos los pesos sustituidos por ruido gaussiano con semilla fija (`torch.manual_seed(0)`). El pipeline declarado es `feature-extraction` y el repo incluye pesos en `safetensors` con un total de 4.194.592 parámetros. El tamaño del repositorio es de 0.0 GB.

Es relevante únicamente como referencia técnica: permite reproducir fallos de integración, validar rutas de exportación a OpenVINO IR y comprobar que el pipeline de `transformers` carga correctamente la arquitectura EuroBERT sin depender de pesos reales. Cualquier uso downstream (inferencia, fine-tuning, producción) carece de sentido porque las salidas son matemáticamente aleatorias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EuroBERT (encoder transformer tipo BERT) |
| Parámetros totales | 4.194.592 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (configuración reducida de test, sin `max_position_embeddings` publicado) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con las rutas de cuantización de `optimum-intel`, pero sin calibración válida al ser pesos aleatorios) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Librería | transformers |
| Dimensión oculta | 32 |
| Capas | 4 |
| Cabezas de atención | 2 (2 cabezas KV) |
| Dimensión intermedia | 64 |
| Semilla de inicialización | 0 |

## Arquitectura y entrenamiento

La arquitectura es `EuroBertModel`, un encoder transformer bidireccional de la familia EuroBERT. La configuración efectiva en este checkpoint es una versión miniaturizada: `hidden_size=32`, `intermediate_size=64`, `num_hidden_layers=4`, `num_attention_heads=2` y `num_key_value_heads=2`. El código de la model card muestra explícitamente que se parte de `EuroBERT/EuroBERT-210m`, se sobrescribe la configuración con esos valores reducidos, se elimina `auto_map` para evitar la carga de código personalizado y se reinicializan todos los parámetros con `torch.randn_like` bajo `torch.manual_seed(0)`.

No hay entrenamiento. No hay datos de entrenamiento, ni tokens procesados, ni fases de RLHF, DPO o ajuste supervisado. La model card es la plantilla automática de Hugging Face con marcadores `[More Information Needed]` en todas las secciones (desarrollador, licencia, datos, hiperparámetros, evaluación). La única información técnica fiable es la derivada del código de creación y del recuento de parámetros en safetensors.

## Capacidades

- Carga como `EuroBertModel` mediante `transformers` con `trust_remote_code=False` (el código de creación elimina `auto_map`).
- Extracción de características (`feature-extraction`): produce embeddings de dimensión 32 para secuencias de entrada.
- Sirve como fixture de test para validar la exportación a OpenVINO IR y la ejecución en runtimes de Intel dentro de `optimum-intel`.
- Permite comprobar la compatibilidad de la clase `EuroBertModel` con el pipeline de `transformers` sin descargar pesos reales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No tiene capacidades multilingües reales: los embeddings son ruido gaussiano y no codifican información lingüística.

## Casos de uso

- Test de integración en `optimum-intel`: usar el checkpoint como entrada determinista para verificar que la exportación a OpenVINO IR de un `EuroBertModel` produce un grafo válido y reproducible.
- Validación de carga de arquitectura en CI: comprobar que `AutoModel.from_pretrained` resuelve correctamente la clase EuroBERT con configuraciones no estándar (dimensiones pequeñas, `num_key_value_heads` distinto de `num_attention_heads`).
- Pruebas de regresión de tokenizer: el repo incluye el tokenizer de `EuroBERT/EuroBERT-210m` con la configuración reducida, útil para verificar rutas de tokenización sin coste de descarga.
- Benchmark de overhead de framework: medir el coste fijo de carga, tracing y ejecución de un encoder mínimo para aislar el ruido de medición en pipelines de optimización.
- Desarrollo de utilidades de inspección de modelos: analizar el grafo de un transformer pequeño con nombres de parámetros reales de EuroBERT para construir herramientas de perfilado.
- Docencia y demos de arquitectura: ilustrar la estructura interna de un encoder BERT con dimensiones legibles (32 ocultas, 4 capas) sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, GLUE, HumanEval, etc.) sería equivalente al azar y no tendría valor comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 20 MB en fp32 (4.194.592 parámetros × 4 bytes ≈ 16,8 MB), más el overhead de activaciones, despreciable.
- GPU recomendadas: ninguna en particular; el modelo cabe en cualquier GPU consumer, iGPU o incluso se ejecuta en CPU sin penalización perceptible.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) y en CPU convencional.
- Opciones de despliegue: `transformers` en CPU/GPU, exportación a OpenVINO IR vía `optimum-intel`, y en general cualquier runtime que soporte safetensors y la arquitectura EuroBERT. No hay pesos GGUF publicados, por lo que `llama.cpp` y `Ollama` requerirían conversión manual (y carecerían de sentido).
- Latencia y throughput: no disponibles de forma publicada; por el tamaño, la latencia por forward pass en CPU es del orden de microsegundos a pocos milisegundos según batch y longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `optimum-intel-internal-testing/tiny-random-EuroBertModel` | 4,19 M | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face (repo interno de testing) |
| `EuroBERT/EuroBERT-210m` | 210 M (aprox., según nombre) | no disponible en la información | Encoder multilingüe real, feature-extraction | no disponible en la información | Hugging Face |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens | Encoder inglés, feature-extraction y clasificación | Apache 2.0 | Hugging Face |
| `FacebookAI/roberta-base` | 125 M | 512 tokens | Encoder inglés, feature-extraction y clasificación | MIT | Hugging Face |

La comparación con EuroBERT-210m, BERT-base y RoBERTa-base es solo estructural: este checkpoint comparte clase y tokenizer con EuroBERT-210m, pero no comparte pesos entrenados. Frente a BERT-base y RoBERTa-base, el único punto en común es ser un encoder transformer; no hay solapamiento funcional porque las salidas de este modelo son aleatorias.

## Limitaciones y advertencias

- Los pesos son aleatorios (`torch.randn_like` con semilla 0): los embeddings no tienen significado semántico y no deben usarse para ninguna tarea real.
- No es un modelo entrenado; no ha visto datos y no ha pasado por RLHF, DPO ni ajuste supervisado.
- La model card es la plantilla automática de Hugging Face con marcadores `[More Information Needed]`: no hay información verificada sobre sesgos, datos, licencia ni uso previsto.
- Licencia no disponible: no se puede asumir uso comercial permitido. Al ser un artefacto de testing interno, su reutilización fuera de ese contexto no está documentada.
- Configuración no estándar (`hidden_size=32`, 4 capas): no representa el comportamiento ni el rendimiento de EuroBERT-210m ni de ningún modelo de producción.
- Riesgo de confusión: el nombre incluye "EuroBertModel" y comparte tokenizer con el modelo real, lo que puede llevar a usarlo por error en lugar de `EuroBERT/EuroBERT-210m`.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; el pipeline declarado es únicamente `feature-extraction`.
- El tag `arxiv:1910.09700` corresponde a la referencia genérica de Lacoste et al. (2019) sobre impacto ambiental incluida en la plantilla, no a un paper del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/optimum-intel-internal-testing/tiny-random-EuroBertModel
- Modelo base de referencia citado en el código de creación: https://huggingface.co/EuroBERT/EuroBERT-210m
- Referencia de la plantilla de impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML citada en la model card: https://mlco2.github.io/impact
- Repositorio de `optimum-intel` (contexto de uso del checkpoint): https://github.com/huggingface/optimum-intel
