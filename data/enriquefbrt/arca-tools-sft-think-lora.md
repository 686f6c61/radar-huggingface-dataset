# enriquefbrt/arca-tools-sft-think-lora

## Resumen

arca-tools-sft-think-lora es un adaptador LoRA publicado por el usuario enriquefbrt sobre el modelo base Qwen/Qwen3-1.7B. Se trata de un ajuste fino supervisado (SFT) entrenado con la librería TRL de Hugging Face, orientado a generación de texto conversacional. El nombre del adaptador sugiere un entrenamiento centrado en el uso de herramientas (tools) y en el modo de razonamiento (think) característico de la familia Qwen3, aunque la model card no documenta explícitamente la composición del dataset ni los objetivos concretos del entrenamiento.

El modelo hereda del Qwen3-1.7B una arquitectura transformer densa con aproximadamente 1.700 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen3, aunque esta cifra no se confirma para esta variante en la información disponible). El adaptador en sí ocupa 0,1 GB en el repositorio, lo que corresponde a los pesos LoRA en formato safetensors más los ficheros de configuración de PEFT.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no tiene descargas ni likes, no declara licencia, no especifica idiomas soportados y no publica resultados de benchmarks. Es un artefacto de experimentación personal más que un modelo listo para producción, y su utilidad práctica depende de la calidad del dataset de SFT empleado, que no se detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B) con adaptador LoRA |
| Parametros totales | ~1.700 millones en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen3-1.7B soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) en el ecosistema Qwen |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3, que incorpora mecanismos de atención con RoPE y soporte nativo para modos de razonamiento explícito (thinking mode) en la familia original. El ajuste se realizó mediante SFT con TRL 1.13.0, PEFT 0.20.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.2. No se documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior ni hiperparámetros como rango LoRA, alpha o tasa de aprendizaje.

La model card no incluye innovaciones técnicas destacables más allá del propio uso de LoRA para reducir el coste de ajuste. El nombre "sft_think" sugiere que el entrenamiento preserva o refuerza el modo de razonamiento del modelo base, y "tools" apunta a un posible entrenamiento en function calling, pero ninguna de estas hipótesis está confirmada por documentación del autor.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-1.7B.
- Razonamiento en modo "think" presumiblemente preservado por el entrenamiento SFT, aunque no verificado.
- Posible soporte de tool calling / function calling, sugerido por el nombre del adaptador pero no documentado.
- Capacidades multilingües heredadas del modelo base, sin lista explícita de idiomas en la model card.
- No se documentan capacidades de visión, audio ni agentes multi-paso específicas del adaptador.

## Casos de uso

- Experimentación con ajuste fino LoRA: el adaptador sirve como ejemplo reproducible de un pipeline SFT con TRL sobre Qwen3-1.7B, útil para desarrolladores que quieran replicar el flujo en sus propios datasets.
- Prototipado de asistentes conversacionales ligeros: al ejecutarse sobre un modelo de 1.7B, puede desplegarse en entornos con recursos limitados para pruebas de concepto de chat multi-turno.
- Investigación sobre razonamiento destilado: si el entrenamiento "think" es efectivo, el adaptador permite estudiar cómo el SFT afecta al modo de razonamiento de modelos pequeños.
- Evaluación de tool calling en modelos compactos: el nombre del adaptador sugiere un uso previsto en llamadas a funciones, adecuado para comparar con otros adaptadores de la misma familia.
- Base para ajustes posteriores: al ser un adaptador PEFT, puede combinarse o continuar entrenándose con DPO u otras técnicas sobre el mismo modelo base.
- Docencia y formación: útil como caso práctico de fine-tuning con PEFT y TRL en cursos de IA aplicada, dado su reducido tamaño (0,1 GB) y su naturaleza de adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en fp16 requiere aproximadamente 3,5 GB de VRAM; en cuantización de 8 bits, unos 2 GB; en 4 bits, alrededor de 1,2 GB. El adaptador LoRA añade una sobrecarga mínima (decenas de MB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Para entrenamiento del adaptador, se recomienda al menos 8-12 GB.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas desde una GTX 1660 Super o RTX 3050 en cuantización 4 bits.
- Opciones de despliegue: transformers con PEFT, vLLM (con soporte de adaptadores LoRA), llama.cpp y Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, TGI con soporte de adaptadores.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| arca-tools-sft-think-lora | ~1.7B (base) + LoRA | no disponible | no disponible | Hugging Face (0 descargas) | Adaptador experimental sin benchmarks |
| Qwen/Qwen3-1.7B | 1.7B | 32.768 tokens nativos | Apache 2.0 (según el modelo base) | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados por Qwen |
| Adaptadores LoRA comunitarios sobre Qwen3-1.7B | ~1.7B (base) + LoRA | depende del base | variable | Hugging Face | Calidad y documentación muy variable |
| Modelos densos de ~1-2B (p. ej. Llama 3.2 1B, Gemma 2 2B) | 1-2B | 8K-128K según modelo | variable (Llama, Gemma) | Hugging Face, Ollama | Alternativas consolidadas con benchmarks públicos |

La comparación directa con alternativas es difícil porque el adaptador no publica métricas ni documenta su dataset. Frente al Qwen3-1.7B original, la única diferencia verificable es la existencia de un ajuste SFT cuyo efecto no está cuantificado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el adaptador mejore al modelo base en ninguna tarea.
- Licencia no especificada: no se puede confirmar el uso comercial; la model card indica "licence: license" sin concreción, lo que impide asumir los términos del modelo base.
- Idiomas no declarados: se desconoce si el SFT preserva el multilingüismo del Qwen3-1.7B o lo ha degradado hacia un idioma concreto.
- Dataset de entrenamiento no documentado: riesgo de sobreajuste, sesgos heredados del dataset y comportamiento impredecible fuera de la distribución de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de 1.7B, especialmente en tareas de razonamiento complejo o tool calling.
- Repositorio sin tracción: 0 descargas y 0 likes implican ausencia de validación comunitaria.
- El ejemplo de la model card contiene `model="None"`, lo que indica que la propia documentación no está completamente pulida.
- Para producción, se recomienda evaluar el adaptador frente al modelo base en el dominio objetivo antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/enriquefbrt/arca-tools-sft-think-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
- Transformers: https://github.com/huggingface/transformers
