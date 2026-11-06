# ChadSaglam/swiss-bookkeeping-qwen-lora

## Resumen

Swiss Bookkeeping Account Suggester es un ajuste fino mediante LoRA de Qwen2.5-0.5B-Instruct, desarrollado por el usuario independiente ChadSaglam, que mapea una línea de factura de una pyme suiza a uno de seis códigos contables predefinidos (5830, 6200, 6500, 6510, 6570 y 6600). El modelo resuelve una tarea de clasificación muy acotada: dado un texto de línea de factura, un importe en francos suizos y un tipo de IVA, devuelve únicamente el número de cuenta de cuatro dígitos del plan contable simplificado que se incluye en el prompt de sistema.

Se trata de un modelo de 494.032.768 parámetros (la práctica totalidad corresponden a la base Qwen2.5-0.5B-Instruct, sobre la que se aplicó un adaptador LoRA de rango 8 en 16 capas que posteriormente se fusionó con los pesos base). El resultado es un checkpoint estándar de transformers en formato safetensors, sin adaptador separado, que puede cargarse directamente con `AutoModelForCausalLM`. El repositorio ocupa 1,0 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es fundamentalmente didáctica y experimental: demuestra que un modelo de 0,5B parámetros puede alcanzar una precisión alta (93,2 % en el conjunto de test con proveedores no vistos) en una tarea de clasificación muy restringida y con datos sintéticos, pero también evidencia las limitaciones severas de los modelos pequeños ante variaciones de fraseo, ataques de prompt steering y vocabulario no visto. El propio autor lo declara no apto para contabilidad de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino LoRA fusionado |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct; no especificada en la model card) |
| Tipos de cuantización | safetensors en precisión original; variante MLX de 8 bits publicada aparte |
| Idiomas soportados | no disponible (los ejemplos de entrenamiento y prompt están en inglés y alemán; el modelo base es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); variante MLX 8-bit en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parámetros. Sobre él se aplicó un adaptador LoRA de rango 8 distribuido en 16 capas, entrenado con `mlx-lm` sobre Apple Silicon y posteriormente fusionado en los pesos base para producir un checkpoint único listo para usar con Transformers. El entrenamiento usó el dataset Swiss SME Bookkeeping, generado sintéticamente y compuesto por 205 filas de entrenamiento y 93 de validación tras excluir 12 proveedores para el conjunto de test held-out. Los hiperparámetros fueron: learning rate 1e-5, batch size 4 y 600 iteraciones.

La tarea se formula como generación condicionada: el prompt de sistema incluye el plan contable de seis cuentas y la instrucción de responder solo con el número de cuatro dígitos; el mensaje de usuario contiene la línea de factura, el importe en CHF y el tipo de IVA. La generación se realiza con `do_sample=False` y `max_new_tokens=6`, lo que hace la inferencia determinista y muy barata. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre pares línea-de-factura/cuenta. La innovación técnica destacable es la simplicidad del pipeline: un modelo de 0,5B con un adaptador de rango 8 basta para una tarea de clasificación cerrada cuando el espacio de etiquetas es muy pequeño y el formato de entrada está controlado.

## Capacidades

- Clasificación de líneas de factura en seis cuentas contables suizas predefinidas (5830, 6200, 6500, 6510, 6570, 6600).
- Generación de texto restringida a la respuesta de cuatro dígitos; no está pensado para texto libre.
- Manejo de entradas con texto de línea, importe en CHF y tipo de IVA en el formato exacto de entrenamiento.
- Capacidad multilingüe heredada del modelo base, aunque el entrenamiento se centra en inglés y alemán; el idioma no está declarado oficialmente.
- No soporta tool calling ni function calling de forma nativa para esta tarea.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No tiene capacidades de visión ni audio.
- No dispone de puntuaciones de confianza calibradas; la demo devuelve las tres cuentas con mayor score relativo, no probabilidades.

## Casos de uso

- Demo educativa de clasificación contable: el modelo sirve para mostrar en un notebook o Space cómo un ajuste LoRA sobre un modelo de 0,5B puede resolver una tarea de etiquetado cerrado con pocos datos sintéticos, usando el prompt de sistema con el plan de cuentas.
- Pruebas de concepto de automatización de precontabilidad: en un prototipo interno, se puede usar para sugerir una cuenta a partir de una línea de factura y que un humano la revise antes de registrarla, aprovechando la inferencia determinista y el bajo coste computacional.
- Evaluación de robustez de modelos pequeños: el propio autor publica un informe de prompt steering que lo convierte en un banco de pruebas para estudiar cómo sufijos como "(advertising)" o "- Werbung" desvían la predicción hacia la cuenta 6600.
- Generación de datos de entrenamiento o aumento de dataset: las predicciones del modelo sobre líneas sintéticas pueden usarse como etiquetas preliminares en pipelines de anotación, siempre con revisión humana.
- Comparación de estrategias de ajuste: sirve para contrastar LoRA fusionado frente a adaptador sin fusionar, o frente a un modelo mayor como `qwen2.5:7b` con prompt, en experimentos reproducibles de clasificación contable.
- Despliegue en entornos con recursos mínimos: al caber en CPU y en GPUs de gama baja, puede ejecutarse en local con Transformers o con la variante MLX 8-bit en Apple Silicon para demos offline sin conexión.
- Investigación sobre calibración y confianza: la ausencia de probabilidades calibradas y la diferencia entre el 93,2 % en test held-out y el 47,2 % en el conjunto OOD lo convierten en un caso de estudio sobre sobreajuste a plantillas.

## Benchmarks y rendimiento

| Modelo | Test con proveedores vistos (56 filas) | Test con proveedores no vistos (74 filas) | Conjunto OOD manual (36 líneas) |
|---|---:|---:|---:|
| Qwen2.5-0.5B-Instruct base | 23,2 % | 16,2 % | no disponible |
| + adaptador LoRA sin fusionar | 96,4 % (run con datos completos) | 94,6 % | no disponible |
| + LoRA fusionado (pesos publicados) | no aplica | 93,2 % | no disponible |
| Variante MLX 8-bit publicada | no disponible | no disponible | 17/36 (47,2 %; IC 95 %: 32–63 %) |
| `qwen2.5:7b` con prompt (referencia, sin ajuste) | no disponible | no disponible | 27/36 (75,0 %; IC 95 %: 59–86 %) con texto; 30/36 (83,3 %) añadiendo el importe en CHF |

El autor advierte que el conjunto OOD de 36 líneas se diseñó alrededor de debilidades conocidas del modelo de 0,5B, por lo que es un test de estrés y no un benchmark representativo. La comparación con `qwen2.5:7b` usa Ollama, temperatura 0 y el plan de cuentas en el prompt, sin ajuste fino, por lo que no es una comparación equivalente. En la prueba de robustez con sufijos de prompt steering, 152 de 352 casos (43 %) se clasificaron incorrectamente, con 85 predicciones desplazadas a la cuenta 6600.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes) más overhead de activaciones y caché KV, en torno a 1,5–2 GB en total.
- En cuantización de 8 bits (variante MLX): alrededor de 0,5 GB de pesos, apto para cualquier Mac con Apple Silicon.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo está muy sobredimensionado para estas últimas.
- Cabe holgadamente en GPU consumer e incluso en CPU; la inferencia en CPU es viable para volúmenes moderados dada la tarea de generación de 6 tokens.
- Opciones de despliegue: Transformers (forma documentada), MLX en Apple Silicon (variante 8-bit), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta conversión oficial. El tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada; la generación de 6 tokens con `do_sample=False` es intrínsecamente de baja latencia, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swiss Bookkeeping Account Suggester (este modelo) | 494M | no disponible | Clasificación contable en 6 cuentas | Apache 2.0 | Hugging Face, demo en Space |
| Qwen2.5-0.5B-Instruct (base) | 494M | no disponible | Generación de texto general | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (referencia usada por el autor) | 7B | no disponible | Generación general, usado con prompt para la misma tarea | Apache 2.0 | Hugging Face, Ollama |

La comparación relevante es frente a su modelo base: el ajuste LoRA eleva la precisión del 16,2 % al 93,2 % en el test con proveedores no vistos, a costa de especializarse en una única tarea y perder utilidad general. Frente a `qwen2.5:7b` con prompt, el modelo de 0,5B ajustado obtiene un 47,2 % en el conjunto OOD frente al 75,0–83,3 % del 7B, lo que muestra que la especialización no compensa la diferencia de tamaño cuando el fraseo se aleja de las plantillas de entrenamiento. No se dispone de comparación con otros modelos especializados en contabilidad suiza en la información proporcionada.

## Limitaciones y advertencias

- Modelo educativo entrenado con datos sintéticos generados por plantillas; el texto es más limpio que el de facturas reales.
- Solo cubre seis cuentas de un plan contable simplificado de prueba, no el KMU-Kontenrahmen oficial suizo.
- Los proveedores desconocidos y el fraseo genérico son fuentes de error importantes; la precisión cae del 93,2 % al 47,2 % en el conjunto OOD.
- Vulnerable a prompt steering: sufijos como "(advertising)" o "- Werbung" desplazan la predicción hacia la cuenta 6600 en el 43 % de los casos probados.
- No proporciona puntuaciones de confianza calibradas; los scores de la demo son relativos, no probabilidades.
- No ha sido revisado por un contable independiente y no constituye asesoramiento contable ni fiscal.
- No debe usarse para contabilidad de producción ni para registrar transacciones automáticamente.
- El idioma no está declarado oficialmente; el soporte multilingüe depende del modelo base y no está validado para esta tarea.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones técnicas y la ausencia de validación real desaconsejan ese uso.
- El conjunto OOD tiene solo 36 líneas y sus etiquetas fueron revisadas por el autor, con una etiqueta corregida y otra debatible, lo que limita la solidez estadística de las conclusiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChadSaglam/swiss-bookkeeping-qwen-lora
- Demo en vivo: https://huggingface.co/spaces/ChadSaglam/swiss-bookkeeping-demo
- Código de la demo Gradio: https://github.com/ChadSaglam/swiss-bookkeeping-ai/tree/main/space
- Dataset: https://huggingface.co/datasets/ChadSaglam/swiss-sme-bookkeeping-dataset
- Código de entrenamiento y evaluación: https://github.com/ChadSaglam/swiss-bookkeeping-ai
- Variante MLX 8-bit: https://huggingface.co/ChadSaglam/swiss-bookkeeping-qwen-lora-mlx-8bit
- Colección del proyecto: https://huggingface.co/collections/ChadSaglam/swiss-sme-bookkeeping-ai-6ad8c507647f44afb5f2263b
- Informe de robustez: https://github.com/ChadSaglam/bookkeeping-mcp-agent/blob/main/REPORT.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
