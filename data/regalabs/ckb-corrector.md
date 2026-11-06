# RegaLabs/ckb-corrector

## Resumen

RegaLabs/ckb-corrector es un modelo de corrección ortográfica y de puntuación para kurdo sorani (ckb), desarrollado por RegaLabs. Se trata de un fine-tuning de `cis-lmu/glot500-base`, un transformer encoder multilingüe entrenado sobre 500 idiomas, adaptado aquí a una tarea concreta: la corrección de texto, con especial énfasis en la poscorrección de salidas de ASR (reconocimiento automático del habla) y en la restauración de puntuación.

El modelo se publica con pipeline `fill-mask` y está pensado para integrarse en cadenas de procesamiento de texto en kurdo sorani, un idioma con escasa representación en herramientas comerciales. Su tamaño (119,3 millones de parámetros) permite desplegarlo en hardware modesto, lo que resulta relevante para proyectos de PLN de bajos recursos.

Es relevante ahora porque cubre un hueco específico: la corrección automática de texto kurdo generado por ASR o por escritura informal, un paso previo habitual en pipelines de subtitulado, transcripción y publicación de contenido. El acceso está restringido (gated) y la licencia es "other", por lo que conviene revisar las condiciones antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base de glot500) |
| Parametros totales | 119.300.591 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/ONNX no publicada) |
| Idiomas soportados | kurdo sorani (ckb) |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `cis-lmu/glot500-base`, un encoder de la familia XLM-RoBERTa entrenado por CIS LMU sobre un corpus que cubre 500 idiomas, con vocabulario y tokenizador adaptados a lenguas de bajos recursos. Sobre esa base, RegaLabs ha realizado un fine-tuning para la tarea de corrección de texto: el pipeline declarado es `fill-mask`, lo que sugiere un entrenamiento orientado a predecir tokens enmascarados o corruptos en lugar de una generación seq2seq.

No se dispone de información pública sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Tampoco se detalla la estrategia de enmascaramiento ni si se combinaron objetivos de corrección ortográfica y de puntuación en una sola fase.

## Capacidades

- Corrección ortográfica de texto en kurdo sorani (ckb).
- Restauración y corrección de puntuación.
- Posprocesado de transcripciones ASR: limpieza de errores típicos de reconocimiento del habla.
- Relleno de tokens enmascarados (`fill-mask`), útil para completar o validar palabras.
- Procesamiento de texto monolingüe en ckb; no se declaran capacidades multilingües adicionales.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan modos de pensamiento (thinking), visión ni audio.

## Casos de uso

- Posprocesado de subtítulos automáticos: tras una transcripción ASR en kurdo sorani, el modelo corrige errores ortográficos y repone puntuación antes de publicar el subtítulo, mejorando la legibilidad sin intervención manual.
- Limpieza de transcripciones de reuniones: en pipelines de actas o notas de voz, se aplica como etapa final para normalizar el texto antes de indexarlo o resumirlo.
- Normalización de texto de entrada en buscadores: corrección de consultas mal escritas en ckb para mejorar la coincidencia con documentos indexados.
- Preprocesado para modelos generativos: al corregir la entrada del usuario, se reducen errores propagados en sistemas de respuesta automática en kurdo.
- Publicación de contenido en medios digitales: revisión ortográfica y de puntuación de artículos redactados por periodistas o colaboradores en sorani.
- Anotación y curación de corpus: ayuda a detectar y corregir errores en datasets de kurdo antes de usarlos para entrenar otros modelos.
- Educación y aprendizaje de idioma: corrección de ejercicios escritos en sorani, con relleno de tokens para señalar palabras mal formadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos; en fp16, en torno a 0,25 GB. El repo ocupa 0,5 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para lotes pequeños.
- GPU recomendadas para producción de alto throughput: A10, L4, A100 o H100, aunque el modelo es lo bastante pequeño para no requerirlas.
- Opciones de despliegue: `transformers` (pipeline `fill-mask`), y potencialmente exportación a ONNX o cuantización a int8 para CPU; no se publican pesos GGUF ni integración con Ollama o llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| RegaLabs/ckb-corrector | 119,3 M | no disponible | ckb | other | restringido (gated) |
| cis-lmu/glot500-base | no disponible | no disponible | 500 idiomas | no disponible | público |
| XLM-RoBERTa-base | 125 M aprox. | 512 tokens | 100 idiomas | MIT | público |

La comparación directa con correctores específicos de kurdo sorani no está disponible en la información proporcionada. Frente a glot500-base, este modelo está especializado en corrección y limitado a ckb; frente a XLM-RoBERTa-base, ofrece adaptación al sorani pero con acceso restringido y licencia no estándar.

## Limitaciones y advertencias

- Modelo monolingüe en ckb: no debe esperarse buen rendimiento en kurdo kurmanji, árabe u otros idiomas.
- Riesgo de alucinación en `fill-mask`: puede proponer sustituciones plausibles pero incorrectas en contextos ambiguos.
- No se documentan sesgos conocidos, pero al derivar de un corpus multilingüe de glot500 puede heredar sesgos de representación del sorani.
- Licencia "other" y acceso gated: es imprescindible aceptar las condiciones en Hugging Face y verificar los términos para uso comercial antes de integrarlo en producción.
- Sin datos publicados de benchmarks, contexto máximo ni cuantizaciones: la evaluación previa a producción corre por cuenta del integrador.
- El pipeline `fill-mask` no genera texto libre; para corrección de frases completas requiere diseñar la estrategia de enmascaramiento y selección de candidatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RegaLabs/ckb-corrector
- Modelo base glot500: https://huggingface.co/cis-lmu/glot500-base
