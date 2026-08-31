# inferenceport-ai/madlad400-10b-mt

## Resumen

MADLAD-400-10B-MT es un modelo de traducción automática multilingüe basado en la arquitectura T5, desarrollado originalmente por Google y convertido a formatos safetensors y GGUF por inferenceport-ai. Se entrenó sobre 250 mil millones de tokens de datos públicos que cubren más de 450 idiomas, lo que lo hace especialmente útil para lenguas de bajos recursos. Con 10.7 mil millones de parámetros, ofrece un equilibrio entre capacidad y eficiencia, siendo competitivo con modelos significativamente más grandes. Su licencia Apache 2.0 permite uso comercial sin restricciones, y se integra fácilmente con el ecosistema de Hugging Face y herramientas como Text Generation Inference.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) |
| Parametros totales | 10.712.586.240 (10.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (variantes no especificadas) |
| Idiomas soportados | Más de 450 idiomas (lista completa en el repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura T5, un transformer encoder-decoder con atención completa y tokenización basada en sentencepiece. El entrenamiento se realizó sobre el dataset MADLAD-400, que contiene 250 mil millones de tokens de dominio público, cubriendo más de 450 idiomas. No se menciona el uso de RLHF o DPO; el entrenamiento es supervisado para tareas de traducción. Una innovación destacable es su capacidad para manejar lenguas de bajos recursos gracias a la diversidad y volumen de datos, así como el uso de un vocabulario compartido multilingüe. El modelo fue presentado en el paper "MADLAD-400: A Multilingual And Document-Level Large Audited Dataset" (arXiv:2309.04662).

## Capacidades

- Traducción automática multilingüe entre más de 450 idiomas, incluyendo lenguas de bajos recursos.
- Generación de texto a texto (text2text-generation) con prefijos de idioma (por ejemplo, `<2es>` para español).
- Compatible con pipelines de transformers y con Text Generation Inference (TGI) según los tags del repositorio.
- Soporte para tareas de few-shot translation y otros procesamientos multilingües.
- No se documentan capacidades de tool calling, agentes, visión ni audio; es un modelo puramente de traducción.

## Casos de uso

- Localización de productos digitales: traducir interfaces de usuario, documentación y contenido web a decenas de idiomas, incluyendo lenguas minoritarias, gracias a su amplia cobertura.
- Traducción de contenido generado por usuarios en plataformas sociales: procesar comentarios, reseñas y publicaciones en múltiples idiomas con un único sistema.
- Servicios de traducción automática para empresas: integrarse en APIs de traducción para atender mercados emergentes con lenguas de baja representación.
- Traducción de documentos técnicos y legales: su entrenamiento en datos generales permite manejar terminología variada, aunque no está especializado en dominios concretos.
- Preprocesamiento de datos multilingües: generar corpus paralelos o traducir datasets para entrenar otros modelos.
- Aplicaciones de accesibilidad: traducir contenido en tiempo real para usuarios con diferentes idiomas nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original menciona que el modelo es competitivo con otros de mayor tamaño, pero no proporciona cifras concretas en el extracto. Se recomienda consultar el paper original para métricas detalladas.

## Requisitos de hardware

- Para inferencia en fp16, el modelo requiere aproximadamente 21.4 GB de VRAM (10.7B parámetros × 2 bytes). Con cuantización GGUF de 4 bits, la huella baja a unos 5.4 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3080 o RTX 4070.
- GPUs recomendadas: para fp16, una A100 40GB o RTX 3090/4090 (24GB) son suficientes. Para cuantización GGUF, GPUs con 8-12 GB de VRAM son viables.
- Opciones de despliegue: transformers con `device_map="auto"`, vLLM (si es compatible), llama.cpp para GGUF, Ollama, o Text Generation Inference (TGI) según los tags.
- La latencia y el throughput dependen del hardware y la longitud de la secuencia; no se dispone de datos concretos.

## Comparativa con modelos similares

- **T5-11B**: modelo monolingüe (inglés) de 11B parámetros, sin cobertura multilingüe extensa. MADLAD-400-10B-MT supera en idiomas, aunque T5-11B puede ser mejor para tareas en inglés puro.
- **NLLB-200**: modelo de Meta para traducción, con 200 idiomas, pero MADLAD-400 cubre más de 450. NLLB tiene variantes de 600M a 54B parámetros.
- **M2M-100**: modelo de Facebook para 100 idiomas, más pequeño y con menos cobertura.

No se dispone de comparativas de rendimiento numéricas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado en datos generales de dominio público; puede no funcionar bien en dominios especializados (médico, legal, técnico) sin fine-tuning.
- No se ha evaluado exhaustivamente para uso en producción; la model card original indica que es un modelo de investigación.
- Riesgo de alucinaciones o traducciones incorrectas, especialmente en lenguas de bajos recursos con menos datos.
- La longitud de contexto no está especificada; puede ser limitada para documentos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, se recomienda validar la calidad en cada caso de uso.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/inferenceport-ai/madlad400-10b-mt
- Modelo original de Google: https://huggingface.co/google/madlad400-10b-mt
- Documentación de transformers para MADLAD-400: https://huggingface.co/docs/transformers/model_doc/madlad-400
- Paper: https://arxiv.org/abs/2309.04662
- Repositorio de Google Research: https://github.com/google-research/google-research/tree/master/madlad_400
