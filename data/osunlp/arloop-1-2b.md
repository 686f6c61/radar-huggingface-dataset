# osunlp/ARLoop-1.2B

## Resumen

ARLoop-1.2B (publicado en HuggingFace como `osunlp/ARLoop-1.2B`, aunque la model card lo denomina ARLoop-1.3B) es un modelo de lenguaje causal recurrente con residuales de atención, desarrollado por el grupo OSUNLP. Se trata de un checkpoint final de una tirada de preentrenamiento de aproximadamente 500.000 millones de tokens, con 1.208.655.360 parámetros reales según los pesos en safetensors. No es un modelo afinado con instrucciones (SFT): es un modelo base de preentrenamiento orientado a completado de texto.

La propuesta técnica es poco habitual en la familia de transformers convencionales: en lugar de apilar 72 capas físicas distintas, el modelo cuenta con 24 capas físicas de transformer que se reutilizan a lo largo de 3 pasadas recurrentes, dando una profundidad efectiva de 72. Este esquema de compartición de pesos reduce el número de parámetros manteniendo una profundidad computacional mayor, una línea de investigación que conecta con trabajos previos sobre transformers recurrentes y universal transformers.

El modelo es relevante por su carácter experimental y por la transparencia de su release: se publican 23 checkpoints intermedios entre los 10.000 y los 230.000 pasos de optimización, además del checkpoint final en el paso 238.417. La licencia Apache 2.0 facilita su uso comercial y su estudio. El contexto es de 4096 tokens y el vocabulario de 49.152 entradas, con tokenizador SmolLM2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal recurrente con residuales de atención (24 capas físicas compartidas en 3 pasadas, profundidad efectiva 72) |
| Parametros totales | 1.208.655.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (la model card solo documenta carga en float32; no se publican pesos GGUF ni cuantizados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y `transformers==5.12.1`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con atención multi-cabeza (16 cabezas de atención y 4 cabezas KV, es decir, GQA con ratio 4:1), anchura oculta de 2048 y anchura intermedia de MLP de 5632. La peculiaridad central es la recurrencia: 24 capas físicas se ejecutan en 3 pasadas sucesivas, de modo que la profundidad efectiva es de 72 sublayers. El bloque de residuales de atención tiene un tamaño de 24 sublayers, con 3 bloques residuales recientes y la embedding de entrada retenida. Las value embeddings se comparten entre capas físicas alternas. El RoPE base es 50000 y la cabeza de salida está atada a las embeddings de tokens.

El entrenamiento se realizó sobre aproximadamente 500.000 millones de tokens (499.996.688.384 en el paso final 238.417), con un tokenizador SmolLM2 de vocabulario 49.152. Se publican 23 checkpoints intermedios etiquetados por paso de optimización, desde `step-010000` (20.971.520.000 tokens) hasta `step-230000` (482.344.960.000 tokens), además del checkpoint final. No se documentan en la información disponible detalles sobre la composición del dataset, el uso de RLHF o DPO, ni innovaciones adicionales como decodificación especulativa. El código de entrenamiento está disponible en el repositorio `ykyaol7/ARLoop` de GitHub.

## Capacidades

- Generación de texto y completado de texto en inglés, al ser un modelo base de preentrenamiento.
- Modelado de lenguaje causal con contexto de 4096 tokens.
- Razonamiento de múltiples pasos implícito por la profundidad efectiva de 72 sublayers, aunque sin evaluación publicada.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-step explícito.
- No se documentan capacidades de visión, audio ni modo thinking.
- No es un modelo SFT: no sigue instrucciones de forma fiable sin un ajuste posterior.

## Casos de uso

- Investigación sobre arquitecturas recurrentes: el modelo sirve como banco de pruebas para estudiar el efecto de la compartición de pesos y las pasadas recurrentes sobre la calidad del modelado de lenguaje, comparándolo con transformers de profundidad equivalente.
- Completado de texto en inglés en entornos controlados: dado su carácter de modelo base, puede usarse para autocompletar documentación técnica o código en inglés donde no se requiera seguir instrucciones.
- Base para fine-tuning supervisado: al ser un checkpoint de preentrenamiento con licencia Apache 2.0, es un punto de partida para SFT o DPO en dominios específicos en inglés.
- Estudio de estabilidad del entrenamiento: los 23 checkpoints intermedios permiten analizar la evolución de las representaciones y de la pérdida a lo largo de 500.000 millones de tokens.
- Evaluación de eficiencia de memoria: la compartición de 24 capas físicas reduce el número de parámetros respecto a un transformer de 72 capas, lo que lo hace útil para estudiar compromisos entre profundidad efectiva y huella de memoria.
- Generación de datos sintéticos en inglés: puede emplearse para producir texto de dominio general como paso previo a filtrado y curación, siempre con revisión humana por el riesgo de alucinación de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 4,8 GB solo para pesos (1.208.655.360 parámetros × 4 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en bfloat16: aproximadamente 2,4 GB para pesos, aunque la model card solo documenta carga en `torch.float32`.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para float32 con contexto moderado; una RTX 4090, A100 o H100 ofrecen margen amplio para contexto completo de 4096 tokens.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090).
- Opciones de despliegue: la model card solo documenta `transformers==5.12.1` con `trust_remote_code=True`, `safetensors` y `accelerate`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF limita el despliegue en `llama.cpp` sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARLoop-1.2B | 1.208.655.360 | 4096 | Transformer recurrente (24 capas físicas, 3 pasadas) | Apache 2.0 | HuggingFace, requiere `trust_remote_code` |
| SmolLM2-1.7B | 1.700.000.000 (aprox.) | 8192 (aprox.) | Transformer denso convencional | Apache 2.0 | HuggingFace, transformers estándar |
| Qwen2.5-1.5B | 1.500.000.000 (aprox.) | 32768 (aprox.) | Transformer denso convencional | Apache 2.0 | HuggingFace, transformers estándar |
| Llama 3.2 1B | 1.200.000.000 (aprox.) | 131072 (aprox.) | Transformer denso convencional | Llama 3.2 Community License | HuggingFace, acceso con aceptación de licencia |

Los datos de SmolLM2, Qwen2.5 y Llama 3.2 son aproximados y no provienen de la información proporcionada sobre ARLoop; se incluyen como referencia de categoría. No se dispone de benchmarks comparativos publicados para ARLoop-1.2B.

## Limitaciones y advertencias

- Es un modelo base de preentrenamiento: no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o no alineadas con la intención del usuario.
- Riesgo elevado de alucinación en tareas factuales, agravado por la ausencia de ajuste con RLHF o DPO.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Contexto de 4096 tokens, inferior al de modelos contemporáneos de tamaño similar (8k-128k).
- Sesgos conocidos: no disponibles en la información proporcionada, pero al ser un modelo preentrenado sin alineación es esperable que refleje sesgos del corpus de entrenamiento.
- Requiere `trust_remote_code=True` y una versión específica de transformers (`5.12.1`), lo que añade riesgo de seguridad y de compatibilidad en producción.
- El repositorio ocupa 116 GB, en gran parte por los 23 checkpoints intermedios; la descarga del modelo completo puede ser costosa en ancho de banda y almacenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación de seguridad hace recomendable una revisión previa antes de desplegarlo en producción.
- No se publican pesos cuantizados ni GGUF, lo que limita el despliegue en hardware de bajos recursos sin conversión manual.

## Enlaces

- HuggingFace: https://huggingface.co/osunlp/ARLoop-1.2B
- Checkpoint final: https://huggingface.co/osunlp/ARLoop-1.3B/tree/main
- Checkpoints intermedios: https://huggingface.co/osunlp/ARLoop-1.3B/tree/step-010000 (y sucesivos hasta `step-230000`)
- Código de entrenamiento: https://github.com/ykyaol7/ARLoop
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
