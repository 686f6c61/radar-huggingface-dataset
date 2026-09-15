# sehyun734/llava-1.5-7b-hf-mbq-uni-w3

## Resumen

`sehyun734/llava-1.5-7b-hf-mbq-uni-w3` es un checkpoint multimodal de tipo imagen-texto publicado en HuggingFace por el usuario sehyun734, derivado de la familia LLaVA-1.5 de 7B. El repositorio contiene 7.063.427.072 parámetros reales (verificados en los safetensors) y ocupa 14,1 GB, un tamaño coherente con pesos almacenados en bf16/fp16. La model card es la plantilla automática de HuggingFace, sin ninguna sección completada: no hay información sobre datos de entrenamiento, licencia, idiomas ni evaluación.

El interés del checkpoint no está en sus capacidades —heredadas del modelo base— sino en su carácter de artefacto experimental: los sufijos `mbq-uni-w3` sugieren un esquema de cuantización (posiblemente multi-bit quantization, con variante "uni" y ancho de 3 bits) aplicado sobre el modelo LLaVA-1.5-7B. Un detalle relevante para quien quiera reproducirlo: el tamaño del repositorio (14,1 GB) coincide exactamente con el almacenamiento en bf16 de 7,06B de parámetros, por lo que los pesos publicados no parecen estar cuantizados en disco; la cuantización, si existe, se aplicaría en tiempo de carga o durante el entrenamiento (QAT).

Se trata de un modelo con 0 descargas y 0 likes, sin documentación asociada, y las búsquedas web realizadas no devuelven ninguna página relevante sobre él. Por tanto, esta ficha describe con rigor lo que se puede verificar y marca explícitamente como "no disponible" todo lo demás, señalando además qué datos de la familia LLaVA-1.5 son aplicables por herencia y cuáles no están confirmados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (no confirmado por el autor; la nomenclatura y el recuento de parámetros coinciden con la arquitectura LLaVA-1.5: encoder visual CLIP ViT-L/14 336px + proyector MLP de 2 capas + LLM tipo Vicuna-7B) |
| Parametros totales | 7.063.427.072 (dato real de los safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha; la familia LLaVA-1.5 opera con 4096 tokens según la documentación pública del modelo base (no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible. El nombre sugiere un esquema "mbq-uni-w3", pero el autor no documenta cuantización alguna y el repo pesa 14,1 GB, equivalente a bf16 sin cuantizar |
| Idiomas soportados | no disponible (la familia LLaVA-1.5 está centrada en inglés) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El autor no aporta ninguna descripción de arquitectura ni de entrenamiento. Por el identificador del modelo, el recuento de parámetros (7,06B) y las etiquetas del repositorio (`llava`, `image-text-to-text`), el checkpoint corresponde a la arquitectura LLaVA-1.5-7B: un encoder visual CLIP ViT-L/14 a 336x336 píxeles, un proyector MLP de dos capas que traduce las características visuales al espacio de embeddings del LLM, y un modelo de lenguaje de la familia LLaMA/Vicuna de 7B como decodificador. Esta descripción es una inferencia basada en la familia del modelo, no un dato confirmado por el autor.

En cuanto al entrenamiento, LLaVA-1.5 sigue un esquema de ajuste en dos fases: una fase de alineación del proyector sobre un subconjunto de pares imagen-texto (del orden de 558K ejemplos en la receta original) y una fase de instruction tuning multimodal sobre aproximadamente 665K ejemplos, con el encoder visual congelado y ajuste de bajo rango en el LLM. No se emplea RLHF ni DPO en la receta pública de LLaVA-1.5, sino aprendizaje supervisado. Para este checkpoint concreto no hay ninguna confirmación de que se hayan seguido esos pasos ni de qué datos adicionales se hayan podido usar.

La innovación declarada implícitamente en el nombre (`mbq-uni-w3`) apunta a una cuantización de pesos de 3 bits con algún esquema "uni" (posiblemente uniforme), pero no existe ningún paper, README o configuración publicada que lo describa. Si la intención era publicar un modelo cuantizado, el tamaño del repositorio lo contradice: 7,06B de parámetros en bf16 ocupan 14,13 GB, prácticamente idéntico a los 14,1 GB del repo. Cualquier uso en producción debería verificar primero la configuración de cuantización en los ficheros del repositorio.

## Capacidades

- Generación de texto condicionada por imagen (image-to-text): descripción de escenas, objetos, personas y relaciones espaciales básicas.
- Respuesta a preguntas sobre imágenes (VQA) en formato conversacional multi-turno.
- Razonamiento visual de nivel medio: comparación de elementos, conteo aproximado, lectura de texto grande en imágenes.
- Conversación multimodal: la etiqueta `conversational` indica que el chat template acepta turnos alternos con imágenes intercaladas.
- Capacidades de tool calling / function calling: no disponibles ni documentadas.
- Soporte de agentes y razonamiento multi-paso: no documentado; la familia LLaVA-1.5 no está diseñada específicamente para ello.
- Capacidades multilingües: no documentadas. El modelo base es predominantemente anglófono.
- Modo "thinking" explícito, visión de vídeo, audio o grounding por coordenadas: no disponibles.
- Integración con `transformers` y compatibilidad declarada con endpoints (`endpoints_compatible`).

## Casos de uso

- Generación automática de texto alternativo (alt-text) a escala: el modelo puede procesar lotes de imágenes y producir descripciones en inglés útiles para pipelines de accesibilidad, siempre que se revise la salida por posibles alucinaciones en detalles finos.
- Etiquetado asistido en pipelines de datos: pre-anotación de pares imagen-texto para posterior revisión humana, reduciendo el coste de anotación en proyectos de visión por computador.
- Asistencia conversacional multimodal en atención al cliente: el usuario envía una foto de un producto o de un defecto y el modelo mantiene un diálogo de aclaración. Requiere verificar antes la licencia, que no está declarada.
- Extracción de información de capturas de pantalla y diagramas simples: lectura de texto grande y estructura visual básica, con la advertencia de que el OCR de LLaVA-1.5 es limitado frente a modelos especializados.
- Moderación de contenido visual asistida: clasificación y descripción preliminar de imágenes para triaje humano, nunca como decisión automática final.
- Investigación en cuantización: el checkpoint es útil como caso de estudio de un esquema `mbq-uni-w3` aplicado a un modelo multimodal, comparando calidad frente al LLaVA-1.5-7B original en tareas de VQA.
- Prototipado de asistentes visuales en entornos controlados con un único GPU consumer, gracias a que el modelo cabe en 24 GB en bf16 y en 12 GB con cuantización de 4 bits.
- Evaluación de robustez y sesgos en modelos multimodales pequeños: al ser un derivado no documentado, sirve para estudiar cómo afecta la cuantización a los sesgos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye ninguna tabla de evaluación, ni el autor ha publicado métricas comparativas frente al LLaVA-1.5-7B original. Las cifras publicadas en el paper de LLaVA-1.5 corresponden al modelo base y no deben atribuirse a este checkpoint, ya que un esquema de cuantización agresivo (3 bits, si finalmente se aplica) degradaría de forma medible tareas sensibles como el conteo, el OCR y el razonamiento espacial.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 15-16 GB solo para pesos (14,1 GB) más caché KV y activaciones, con picos adicionales al procesar imágenes a 336x336. Presupuesto recomendado: 18-24 GB.
- VRAM con cuantización de 8 bits (bitsandbytes): del orden de 8-9 GB.
- VRAM con cuantización de 4 bits (NF4/GPTQ/AWQ): del orden de 5-6 GB, siempre que se genere la versión cuantizada, ya que el repo solo publica safetensors en precisión completa.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX 4090 y RTX 3090 (24 GB), todas ellas suficientes para una sola instancia.
- Cabe en GPU consumer: sí, en RTX 4090/3090 de 24 GB en bf16; en RTX 4080, 4070 Ti Super o portátiles de 16 GB con cuantización de 8 bits; en RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (librería declarada, con `LlavaForConditionalGeneration`), vLLM con soporte multimodal, TGI (soporte multimodal limitado), y llama.cpp/Ollama únicamente si se convierte previamente a GGUF, formato que no se distribuye en este repositorio.
- Latencia y throughput estimados: no disponibles. No hay datos de velocidad, número de tokens por segundo ni tiempo de prefill publicados para este checkpoint.

## Comparativa con modelos similares

Los datos de las alternativas proceden de su documentación pública y se ofrecen como referencia; no implican que este checkpoint los iguale. Las celdas de este modelo reflejan lo declarado en su repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `sehyun734/llava-1.5-7b-hf-mbq-uni-w3` | 7,06B | no disponible | no disponible | safetensors en HuggingFace, 0 descargas |
| LLaVA-1.5-7B (modelo base de la familia) | ~7B | 4096 tokens | términos de LLaMA 2 / Vicuna (uso comercial restringido) | safetensors, ampliamente adoptado |
| LLaVA-NeXT (LLaVA-1.6) 7B | ~7B | 4096 tokens con AnyRes | términos de LLaMA 2 / Vicuna | safetensors |
| Qwen2-VL-7B-Instruct | ~8,3B | 32K tokens (ampliable a 128K con extrapolación) | Apache 2.0 | safetensors, integración oficial en transformers y vLLM |

La comparativa real de rendimiento frente a estos modelos no es posible: no existen métricas publicadas de este checkpoint, y su licencia sin declarar impide recomendarlo para uso comercial sin una revisión legal previa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados para este checkpoint. El modelo base LLaVA-1.5 hereda sesgos de sus datos de instrucción, con infrarrepresentación de culturas no anglosajonas y sesgos de género y etnia en descripciones de personas.
- Riesgo de alucinación: alto en detalles finos, especialmente en conteo de objetos, texto pequeño y relaciones espaciales, un comportamiento característico de la familia LLaVA-1.5 que la cuantización tiende a agravar.
- Limitaciones de contexto e idioma: sin información confirmada; si se hereda la ventana de 4096 tokens del modelo base, no es adecuada para conversaciones largas ni para múltiples imágenes simultáneas. El soporte multilingüe no está garantizado.
- Licencia sin declarar: es el riesgo más serio. No se puede asumir uso comercial libre, y el modelo base de LLaVA-1.5 está sujeto a los términos de LLaMA 2 y Vicuna. Cualquier despliegue en producción requiere aclarar la licencia con el autor.
- Documentación inexistente: la model card es la plantilla automática, por lo que se desconoce el procedimiento de entrenamiento, los datos utilizados y si la cuantización `mbq-uni-w3` está realmente aplicada en los pesos publicados.
- Inconsistencia entre nombre y artefacto: el repo pesa 14,1 GB, lo que corresponde a bf16 sin cuantizar; un modelo realmente cuantizado a 3-4 bits ocuparía entre 3 y 5 GB. Verificar la configuración antes de asumir ningún ahorro de memoria.
- Sin trazabilidad ni mantenimiento: 0 descargas, 0 likes, sin repositorio de código, sin paper y sin respuesta conocida del autor. No es un artefacto adecuado como dependencia de producción.
- Reproducibilidad: al no haber fijada una revisión, un dataset ni hiperparámetros, no es posible reproducir el checkpoint ni auditar qué se modificó respecto al modelo base.
- Las búsquedas web realizadas no han devuelto ninguna fuente relevante sobre este modelo; todos los resultados obtenidos eran páginas de soporte de Microsoft sin relación con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sehyun734/llava-1.5-7b-hf-mbq-uni-w3
- Paper de LLaVA (arquitectura base): https://arxiv.org/abs/2304.08485
- Paper de LLaVA-1.5 (mejoras del modelo base): https://arxiv.org/abs/2310.03744
- Repositorio oficial de LLaVA: https://github.com/haotian-liu/LLaVA
- Paper de CLIP (encoder visual): https://arxiv.org/abs/2103.00020
- Referencia citada en la plantilla del repositorio (Lacoste et al., 2019, cálculo de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML: https://ml2ol.github.io/impact
- Paper de Qwen2-VL (comparativa): https://arxiv.org/abs/2409.12191
- Repositorio de LLaVA-NeXT / LLaVA-1.6: https://github.com/LLaVA-VL/LLaVA-NeXT
