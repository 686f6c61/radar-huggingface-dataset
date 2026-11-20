# jatjit/veritasai-xlmr-hc3-onnx

## Resumen

veritasai-xlmr-hc3-onnx es una conversión a ONNX con cuantización int8 del modelo mrm8488/xlm-roberta-base-finetuned-HC3-mix, un clasificador binario basado en XLM-RoBERTa-base. El modelo original está afinado para distinguir texto generado por humanos (etiqueta 0) de texto generado por ChatGPT (etiqueta 1), una tarea habitual en detección de contenido sintético. La conversión la publica el proyecto VeritasAI bajo el identificador jatjit, con el objetivo explícito de permitir la ejecución en el navegador mediante transformers.js.

El repositorio contiene únicamente los pesos convertidos a ONNX y cuantizados a int8, con un tamaño total de 0,3 GB, coherente con la huella de XLM-RoBERTa-base (~278 M de parámetros) tras la cuantización. No se publican en esta ficha datos de licencia, idiomas soportados ni pipeline declarado en Hugging Face, por lo que buena parte de las especificaciones deben remitirse al modelo upstream.

La relevancia de esta ficha es doble: por un lado, ilustra el patrón de despliegue de clasificadores transformer en el cliente (sin backend) para tareas de moderación y detección; por otro, advierte de las trampas de compatibilidad del tokenizador al reconvertir modelos para transformers.js, un problema documentado por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) |
| Parametros totales | ~278 M (heredados de XLM-RoBERTa-base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa-base admite hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | int8 (ONNX quantized) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (cuantizado int8) |
| Tarea | Clasificacion binaria: 0 = Human, 1 = ChatGPT |
| Tamano del repositorio | 0,3 GB |
| Runtime objetivo | transformers.js (navegador) |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa-base, un transformer encoder multilingüe preentrenado con enmascaramiento de tokens sobre corpus multilingües. Sobre esa base, el modelo upstream mrm8488/xlm-roberta-base-finetuned-HC3-mix añade una cabeza de clasificación binaria con dos etiquetas: 0 (Human) y 1 (ChatGPT). La model card de esta conversión no detalla el dataset de ajuste fino, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; esa información debe consultarse en el repositorio upstream.

La innovación técnica de esta versión concreta es la conversión a ONNX con cuantización int8 para su uso en el navegador con transformers.js. El autor advierte de un detalle crítico de compatibilidad: debe utilizarse el tokenizer.json original del repositorio upstream, ya que los ficheros de tokenizador re-guardados rompen la tokenización en versiones antiguas de transformers.js. No se documentan técnicas adicionales como decodificación especulativa ni atención lineal.

## Capacidades

- Clasificación binaria de texto: distingue entre texto humano (etiqueta 0) y texto generado por ChatGPT (etiqueta 1).
- Ejecución en navegador: los pesos ONNX int8 están pensados para transformers.js, lo que permite inferencia en el cliente sin backend.
- Procesamiento de texto multilingüe potencial: heredado de XLM-RoBERTa-base, aunque la model card no confirma los idiomas cubiertos por el ajuste fino.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- No es un modelo generativo: no produce texto, solo una etiqueta de clasificación.

## Casos de uso

- Moderación de contenido en el navegador: el modelo puede ejecutarse con transformers.js en el cliente para marcar textos sospechosos de ser generados por IA antes de enviarlos al servidor, reduciendo coste de backend y preservando privacidad.
- Detección de ensayos o trabajos generados por IA en plataformas educativas: integrado en el editor del alumno, clasifica fragmentos en tiempo real y genera alertas para revisión humana.
- Filtrado de reseñas y comentarios en foros: clasifica aportaciones como humanas o sintéticas para priorizar la revisión manual de las segundas.
- Enriquecimiento de datasets: etiquetado automático de grandes volúmenes de texto para construir corpus de entrenamiento con proporción controlada de contenido humano y sintético.
- Prototipado rápido sin infraestructura: al ser un ONNX int8 de 0,3 GB, permite validar la viabilidad de un detector de IA en una demo web antes de invertir en un servicio dedicado.
- Investigación sobre detección de texto generado: sirve como baseline reproducible y ligero para comparar con detectores más grandes o específicos de dominio.
- Prefiltro en pipelines de curación de datos: descarta contenido sintético de baja calidad antes de pasarlo a modelos mayores o a procesos de anotación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en int8; el repositorio ocupa 0,3 GB, por lo que la huella en memoria es muy reducida.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo está pensado para CPU y navegador, no para GPU de datacenter.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de memoria; también en CPU y en el navegador.
- Opciones de despliegue: transformers.js (objetivo principal), ONNX Runtime (web, CPU o GPU), y conversión adicional a otros runtimes ONNX si se requiere.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un encoder de ~278 M de parámetros cuantizado a int8, se espera una latencia de decenas de milisegundos por secuencia corta en CPU moderna, si bien no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| veritasai-xlmr-hc3-onnx | ~278 M (no confirmado) | no disponible | Clasificacion humano/ChatGPT | no disponible | ONNX int8 |
| mrm8488/xlm-roberta-base-finetuned-HC3-mix | ~278 M | no disponible | Clasificacion humano/ChatGPT | no disponible | safetensors/PyTorch |
| Detectores de texto IA comerciales (p. ej. GPTZero, Originality.ai) | no disponible | no disponible | Deteccion de texto IA | propietaria | API |
| RoBERTa-base fine-tuned para deteccion de IA (variantes de la comunidad) | ~125 M | 512 tokens | Deteccion de texto IA | variable | PyTorch/ONNX |

La comparativa con detectores comerciales es cualitativa: no se dispone de datos de rendimiento comparables publicados para este modelo concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar XLM-RoBERTa-base, pueden persistir sesgos de los corpus multilingües de preentrenamiento.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación, especialmente con textos mixtos o editados.
- Limitaciones de contexto o idioma: no se confirman los idiomas cubiertos por el ajuste fino; el contexto máximo no se declara en la model card.
- Restricciones de licencia para uso comercial: no disponibles; debe consultarse la licencia del modelo upstream antes de cualquier uso en producción.
- Caveat de tokenizador: el autor advierte de que deben usarse los ficheros tokenizer.json originales del repositorio upstream, ya que los re-guardados rompen la tokenización en versiones antiguas de transformers.js.
- El modelo solo distingue entre humano y ChatGPT; no cubre otros generadores (Claude, Gemini, Llama, etc.) salvo que el ajuste fino upstream lo haya contemplado, extremo no documentado.
- Sin métricas publicadas: no hay benchmarks que permitan estimar precisión, recall o F1 en dominios concretos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jatjit/veritasai-xlmr-hc3-onnx
- Modelo upstream: https://huggingface.co/mrm8488/xlm-roberta-base-finetuned-HC3-mix
- transformers.js: https://github.com/huggingface/transformers.js
- XLM-RoBERTa (paper): https://arxiv.org/abs/1911.02116
- ONNX Runtime: https://onnxruntime.ai/
