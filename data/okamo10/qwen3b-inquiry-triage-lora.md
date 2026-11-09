# okamo10/qwen3b-inquiry-triage-lora

## Resumen
`okamo10/qwen3b-inquiry-triage-lora` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario okamo10, construido sobre el modelo base `Qwen/Qwen2.5-3B-Instruct` de Alibaba. El nombre del repositorio sugiere que el ajuste fino está orientado al triaje de consultas entrantes ("inquiry triage"), es decir, la clasificación y enrutamiento de peticiones de usuarios en un flujo de atención o soporte. El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con la librería TRL, según las etiquetas del repositorio.

El modelo hereda del base todas las características arquitectónicas de la familia Qwen2.5-3B-Instruct: un transformer decoder-only de aproximadamente 3.000 millones de parámetros, con soporte de conversación multi-turno y tool calling. El adaptador en sí ocupa unos 0,1 GB, lo que corresponde a pesos LoRA en formato safetensors que deben cargarse junto al modelo base para su uso.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación sin model card sustantiva (la plantilla está sin rellenar), con cero descargas y cero likes en el momento de la consulta, y sin licencia ni idiomas declarados. Resulta útil como ejemplo de adaptación ligera de un modelo pequeño para una tarea concreta, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el base tiene ~3.000 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador (el base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion GGUF/AWQ/GPTQ via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el base Qwen/Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento
El adaptador emplea la técnica LoRA implementada en PEFT (version 0.21.2 segun la model card), que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas. El entrenamiento se realizó con TRL (SFT), según las etiquetas `sft` y `trl` del repositorio. No se especifican el rango (r), el alpha, las capas objetivo, la tasa de aprendizaje, el número de pasos ni el tamaño del dataset; toda esa información aparece como "[More Information Needed]" en la model card.

No hay datos sobre la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación adicionales (DPO, RLHF). Tampoco se documenta ninguna innovación técnica específica más allá del ajuste supervisado estándar. La única información verificable es el tamaño del repositorio (0,1 GB), coherente con un adaptador LoRA de rango moderado sobre un modelo de 3B.

## Capacidades
- Generación de texto conversacional, heredada del base Qwen2.5-3B-Instruct.
- Clasificación y triaje de consultas entrantes, presumiblemente la tarea objetivo del ajuste (deducida del nombre del repositorio, no documentada).
- Soporte de tool calling y function calling, heredado del base.
- Razonamiento multi-paso básico, limitado por el tamaño de 3B parámetros.
- Capacidades multilingües del base (Qwen2.5 cubre decenas de idiomas), aunque el adaptador no declara idiomas y podría degradar el rendimiento fuera del dominio de entrenamiento.
- No se documenta soporte de visión, audio ni modo "thinking" explícito.

## Casos de uso
- Triaje de tickets de soporte: el adaptador puede clasificar consultas entrantes en categorías (facturación, técnico, comercial) y enrutarlas al equipo adecuado, aprovechando el ajuste específico sobre el base.
- Enrutamiento en mesas de ayuda internas: integrado en un pipeline de ticketing, asigna prioridad y cola a cada petición según el texto del usuario.
- Preclasificación en bandejas de correo: etiqueta mensajes de clientes antes de que un humano los revise, reduciendo el tiempo de primera respuesta.
- Filtrado y moderación de consultas: detecta peticiones fuera de alcance o maliciosas antes de pasarlas a un modelo mayor.
- Prototipado rápido de asistentes de atención: al ser un adaptador de 0,1 GB sobre un base de 3B, permite iterar en una sola GPU consumer durante el desarrollo.
- Investigación sobre fine-tuning eficiente: sirve como referencia para estudiar cómo un LoRA pequeño modifica el comportamiento de un base instruct en una tarea acotada.
- Clasificación de intenciones en asistentes de voz o chat: con latencia baja gracias al tamaño reducido del base, adecuado para preprocesar antes de un LLM mayor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el adaptador suma muy poco; el grueso corresponde al base Qwen2.5-3B-Instruct. En fp16, aproximadamente 6-7 GB; en cuantización de 8 bits, unos 3,5-4 GB; en 4 bits (GGUF Q4), alrededor de 2-2,5 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para fp16 sin problemas; A100/H100 para despliegues con concurrencia alta; RTX 3060 12 GB o RTX 4060 Ti 16 GB suficientes en cuantización.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en cuantización 4/8 bits.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF).
- Latencia y throughput: no disponibles; dependen del hardware y del backend. Para un base de 3B en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| okamo10/qwen3b-inquiry-triage-lora | ~3.000 M (base) + LoRA | no disponible (base: 32.768) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | ~3.000 M | 32.768 | Apache 2.0 (según el base) | Hugging Face, ampliamente usado |
| meta-llama/Llama-3.2-3B-Instruct | ~3.200 M | 128.000 | Llama 3.2 Community License | Hugging Face |
| google/gemma-2-2b-it | ~2.600 M | 8.192 | Gemma Terms of Use | Hugging Face |

El adaptador no aporta métricas propias que permitan comparar rendimiento con estas alternativas; la comparación se limita a specs del base y a la licencia, que en este caso no está declarada y por tanto impide confirmar uso comercial.

## Limitaciones y advertencias
- Model card vacía: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que impide auditar el comportamiento del adaptador.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor o asumir la licencia del base (Apache 2.0 para Qwen2.5-3B-Instruct) con cautela.
- Idiomas no declarados: el adaptador podría degradar el multilingüismo del base si se entrenó solo en un idioma.
- Riesgo de alucinación inherente a un modelo de 3B, especialmente en tareas de clasificación con entradas ambiguas.
- Sesgos potenciales heredados del base y del dataset de ajuste, no documentados.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad.
- El nombre del repositorio sugiere la tarea, pero no está confirmado en la documentación; verificar el comportamiento antes de integrarlo.
- Para producción, se recomienda fusionar el adaptador, cuantizar y evaluar con un conjunto propio antes de desplegar.

## Enlaces
- Hugging Face: https://huggingface.co/okamo10/qwen3b-inquiry-triage-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper de PEFT/LoRA referenciado en los tags: https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
