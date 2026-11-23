# abdurrahim711/novashop-support-lora

## Resumen

`novashop-support-lora` es un adaptador LoRA (PEFT) publicado por el usuario abdurrahim711 en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que debe combinarse con su modelo base, `unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit`, una versión cuantizada en 4 bits de Llama 3.1 8B Instruct preparada por Unsloth. El nombre sugiere un ajuste orientado a atención al cliente para una tienda llamada "Novashop", aunque la model card no lo confirma.

El repositorio tiene un tamaño de 0,2 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo de 8 mil millones de parámetros. Se entrenó con las librerías TRL y Unsloth, según las etiquetas del repositorio, y el pipeline declarado es `text-generation` con formato conversacional. La información publicada es mínima: la model card es la plantilla por defecto de Hugging Face sin completar, y no se documentan datos de entrenamiento, hiperparámetros, evaluación ni licencia.

Su relevancia es limitada y práctica: sirve como ejemplo de adaptador LoRA sobre Llama 3.1 8B para un dominio vertical de soporte, pero carece de la documentación necesaria para evaluarlo en producción. Cualquier uso serio requiere inspeccionar los pesos, validar el comportamiento y asumir la licencia del modelo base (Llama 3.1 Community License), ya que el adaptador no declara una propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8.030 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | el adaptador se distribuye en safetensors; el base referenciado es bnb-4bit |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados) |
| Licencia | no disponible (el modelo base se rige por Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado mediante SFT (supervised fine-tuning) con TRL y Unsloth sobre la versión 4-bit de Llama 3.1 8B Instruct. Llama 3.1 8B es un transformer decoder-only con atención por grupos (GQA), RoPE y ventana de contexto de 128.000 tokens; el adaptador no modifica esa arquitectura, solo añade matrices de bajo rango en las capas seleccionadas durante el ajuste.

No se dispone de información sobre el conjunto de datos, el número de tokens de entrenamiento, la composición del dataset, el rango del LoRA, la tasa de aprendizaje ni si hubo etapas de alineación adicionales (DPO, RLHF). La model card no documenta hiperparámetros ni infraestructura de cómputo. El tamaño del repositorio (0,2 GB) es compatible con un adaptador de rango moderado, pero no permite inferir más detalles.

## Capacidades

- Generación de texto conversacional en formato de chat, heredada de Llama 3.1 8B Instruct.
- Ajuste orientado, presumiblemente, a soporte al cliente en el dominio "Novashop" (no confirmado por el autor).
- Razonamiento general y respuesta a instrucciones del modelo base; el adaptador puede alterar o degradar estas capacidades.
- Soporte de tool calling y function calling: disponible en el modelo base, pero no verificado tras el ajuste LoRA.
- Capacidades multilingües: las del modelo base (oficialmente ocho idiomas), no declaradas ni evaluadas para el adaptador.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Prototipado de un asistente de atención al cliente para una tienda: el adaptador puede cargarse junto al base en un entorno de pruebas para evaluar respuestas sobre catálogo, pedidos y devoluciones, siempre que se valide el comportamiento real antes de exponerlo.
- Investigación sobre ajuste fino eficiente: sirve como ejemplo reproducible de un pipeline LoRA con Unsloth y TRL sobre Llama 3.1 8B, útil para comparar metodologías de entrenamiento.
- Base para un ajuste adicional: al ser un adaptador PEFT, puede fusionarse o combinarse con otros adaptadores para experimentar con mezclas de dominios.
- Generación de respuestas de soporte en un chatbot interno: con contexto largo heredado del base (128.000 tokens), podría gestionar conversaciones multi-turno con historial extenso, previa validación.
- Evaluación comparativa de adaptadores: útil en un banco de pruebas para medir cómo un LoRA específico de dominio afecta a las métricas del modelo base.
- Docencia y demostraciones: por su tamaño reducido (0,2 GB), es manejable para mostrar el flujo completo de carga de un adaptador PEFT con `transformers` y `peft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa unos 0,2 GB; el modelo base en 4 bits requiere aproximadamente 5-6 GB de VRAM, y en fp16 unos 16 GB.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para mayor throughput; una RTX 3090 o 4080 también es suficiente para el base en 4 bits.
- Cabe en GPU de consumo: sí, con el base cuantizado en 4 bits en tarjetas de 8 GB o más; en fp16 requiere 16 GB o más.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el base antes de convertir a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| novashop-support-lora (este) | adaptador sobre 8B | heredado (128k) | no disponible | safetensors (PEFT) | Sin documentación ni evaluación |
| Meta-Llama-3.1-8B-Instruct | 8.030 M | 128.000 | Llama 3.1 Community License | safetensors, GGUF | Modelo base oficial, documentado y evaluado |
| Mistral-7B-Instruct-v0.3 | 7.250 M | 32.768 | Apache 2.0 | safetensors, GGUF | Alternativa abierta con licencia permisiva |
| Qwen2.5-7B-Instruct | 7.620 M | 131.072 | Apache 2.0 | safetensors, GGUF | Contexto largo y licencia permisiva |

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- No se declara licencia para el adaptador; el uso comercial queda sujeto a la Llama 3.1 Community License del modelo base, que impone restricciones (por ejemplo, la cláusula de 700 millones de usuarios mensuales).
- Riesgo de alucinación y de comportamiento impredecible: sin evaluación publicada, no hay garantías sobre la calidad de las respuestas en el dominio de soporte.
- Posible degradación de capacidades del base (razonamiento, código, multilingüismo) tras el ajuste LoRA, no medida.
- Sesgos heredados del modelo base y del dataset de ajuste, desconocido.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día: no hay evidencia de uso ni validación por la comunidad.
- Para producción se recomienda auditar los pesos, construir un conjunto de evaluación propio y considerar fusionar el adaptador con el base para simplificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/abdurrahim711/novashop-support-lora
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Modelo original Llama 3.1: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Paper de eficiencia de cómputo citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
