# mrcuddle/adaption_lgbtq_romance_roleplay

## Resumen

`mrcuddle/adaption_lgbtq_romance_roleplay` es un adaptador LoRA (PEFT) entrenado sobre `meta-llama/Llama-3.3-70B-Instruct` mediante supervisión fina (SFT) con la plataforma AutoScientist de Adaption Labs. El adaptador está diseñado para el dominio de roleplay romántico LGBTQ, aunque su dataset de entrenamiento presenta una distribución de dominios muy diversa donde el roleplay solo representa el 14% de las filas. El repositorio ocupa 3,3 GB y se distribuye en formato safetensors compatible con la librería `peft`.

El modelo base Llama-3.3-70B-Instruct es un transformer denso de 70 mil millones de parámetros con una ventana de contexto de 128 000 tokens, licencia Llama 3.3 Community License. El adaptador añade un ajuste fino con rango LoRA 64 y alpha 128 sobre los módulos de atención y MLP, sin modificar la arquitectura subyacente.

Su relevancia es limitada: se trata de un adaptador de nicho con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026, y sin resultados de benchmarks públicos más allá de las gráficas de métricas de entrenamiento incluidas en la model card. Resulta útil como ejemplo de pipeline AutoScientist y como caso de estudio de adaptación de dominio sobre Llama 3.3, pero no como modelo de producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.3) con adaptador LoRA |
| Parámetros totales | 70B (modelo base) + adaptador LoRA (r=64) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Llama 3.3) |
| Idiomas soportados | en |
| Licencia | other (hereda las restricciones de Llama 3.3 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.3-70B-Instruct, un transformer decoder-only denso con atención por grupos (GQA) y RoPE. El entrenamiento se realizó con SFT en formato chat, con `train_on_inputs: false`, 4 épocas, learning rate 1e-4, scheduler coseno con `scheduler_num_cycles: 0.5`, warmup ratio 0.1, weight decay 0.01, `max_grad_norm` 1 y batch size máximo. Los hiperparámetros LoRA son r=64, alpha=128, dropout 0 y módulos entrenables `k_proj, up_proj, o_proj, q_proj, down_proj, v_proj, gate_proj`, es decir, todas las proyecciones de atención y MLP.

El dataset de entrenamiento contiene 16 905 filas con una distribución de dominios dominada por `culture` (31%), seguida de `roleplay` (14%), `medical` (14%) y `academic-education` (5%), con el resto de dominios por debajo del 3% cada uno. Esta distribución indica que el adaptador no está especializado exclusivamente en roleplay romántico, sino que incorpora una mezcla amplia de dominios. No se especifica el número total de tokens de entrenamiento ni la composición lingüística más allá del inglés. No se documenta el uso de RLHF o DPO; el método declarado es SFT.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 3.3 70B.
- Roleplay y narrativa romántica en contexto LGBTQ, objetivo declarado del adaptador.
- Razonamiento general y respuesta a preguntas abiertas, reforzado por la mezcla de dominios del dataset (cultura, medicina, educación, ciencia).
- Soporte de conversaciones multi-turno en formato chat.
- Capacidades del modelo base: tool calling, function calling y razonamiento multi-paso (no verificadas específicamente para el adaptador).
- Capacidades multilingües del base (Llama 3.3 soporta varios idiomas), aunque el adaptador solo declara inglés.
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Roleplay conversacional de nicho: el adaptador ajusta el tono y el estilo del modelo base para narrativa romántica LGBTQ, útil en prototipos de personajes conversacionales o ficción interactiva.
- Generación de ficción asistida: escritores pueden usar el adaptador para explorar tramas y diálogos románticos con coherencia de personaje, aprovechando los 128k tokens de contexto del base para mantener arcos narrativos largos.
- Investigación sobre adaptación de dominio: sirve como ejemplo reproducible de pipeline AutoScientist con hiperparámetros documentados, útil para estudiar el efecto de LoRA r=64 sobre un modelo de 70B.
- Evaluación de sesgos y alineación: permite analizar cómo un ajuste fino temático afecta a la representación de identidades LGBTQ en comparación con el base.
- Chatbot de acompañamiento emocional (con supervisión humana): el modelo puede sostener conversaciones empáticas multi-turno, aunque requiere filtros de seguridad adicionales.
- Fine-tuning posterior: al ser un adaptador PEFT, puede combinarse con otros adaptadores o servir de inicialización para experimentos de adaptación incremental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye gráficas de métricas de entrenamiento (`training-metrics.png`) y de win rates (`win-rates.png`) sobre un conjunto de test held-out in-distribution y un conjunto específico de dominio, pero no se proporcionan valores numéricos en el texto.

## Requisitos de hardware

- VRAM para el modelo base en BF16: aproximadamente 140 GB, requiere múltiples GPU o una GPU de 80 GB con cuantización.
- VRAM con cuantización 8 bits: aproximadamente 70-75 GB; con 4 bits: aproximadamente 40-45 GB.
- GPU recomendadas: H100 80GB, A100 80GB, o configuraciones multi-GPU (2x A100 40GB, 4x RTX 4090 24GB con tensor parallelism).
- En consumer GPU: solo es viable con cuantizaciones agresivas (4 bits) y offloading parcial; una RTX 4090 24GB no aloja el modelo completo sin offload a CPU.
- Despliegue: vLLM, TGI, llama.cpp (requiere conversión del base a GGUF y fusión del adaptador), Ollama (previa fusión y conversión).
- Latencia y throughput: no disponibles.
- El adaptador en sí ocupa 3,3 GB; la fusión con el base (`merge_and_unload`) no añade coste en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Especialización |
|---|---|---|---|---|---|
| adaption_lgbtq_romance_roleplay | 70B (base) + LoRA | 128k | other (Llama 3.3) | HF, 0 descargas | Roleplay LGBTQ + mezcla de dominios |
| Llama-3.3-70B-Instruct (base) | 70B | 128k | Llama 3.3 Community | Amplia | Generalista |
| Adaptadores PEFT de nicho en HF | Variable | Heredado | Variable | Variable | Dominio específico |
| Modelos de roleplay dedicados (p. ej. fine-tunes de 7B-13B) | 7B-13B | 4k-32k | Variable | Variable | Roleplay conversacional |

No se dispone de datos de rendimiento comparativos para este adaptador frente a alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste fino sobre un dataset con dominios desequilibrados (31% cultura, 14% roleplay) puede introducir sesgos de estilo y contenido no documentados.
- Riesgo de alucinación: heredado del modelo base; el ajuste fino temático puede incrementar la generación de contenido ficticio plausible.
- Limitaciones de idioma: el adaptador solo declara inglés; su comportamiento en castellano no está verificado.
- Restricciones de licencia: la licencia "other" remite a la Llama 3.3 Community License, que impone restricciones de uso comercial, atribución y límites de usuarios mensuales para ciertos despliegues.
- El dataset incluye etiquetas corruptas o anómalas (`academic-游戏副本`, `writing-edit游戏副本-communication`), lo que sugiere problemas de calidad en la curación de datos.
- Sin benchmarks públicos ni validación independiente; cero descargas y cero likes indican ausencia de adopción verificable.
- No apto para producción sin evaluación adicional de seguridad, sesgos y calidad en el dominio objetivo.
- El contenido de roleplay romántico requiere moderación adicional en despliegues públicos.

## Enlaces

- Hugging Face: https://huggingface.co/mrcuddle/adaption_lgbtq_romance_roleplay
- Modelo base: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Adaption Labs: https://adaptionlabs.ai
- Librería PEFT: https://github.com/huggingface/peft
