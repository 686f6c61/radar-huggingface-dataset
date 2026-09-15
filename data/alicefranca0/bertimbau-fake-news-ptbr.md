# AliceFranca0/bertimbau-fake-news-ptbr

## Resumen

Este modelo es un clasificador de texto basado en la arquitectura BERT, desarrollado por AliceFranca0, fine-tuned para detectar noticias falsas en portugués brasileño. El nombre "bertimbau-fake-news-ptbr" sugiere que parte de BERTimbau, un modelo BERT entrenado en portugués brasileño, y que ha sido ajustado para la tarea de clasificación binaria de noticias. Cuenta con 108.924.674 parámetros, lo que lo sitúa en la categoría de modelos BERT base, y se distribuye en formato safetensors. Es relevante para tareas de moderación de contenido y verificación de desinformación en contextos lusófonos, aunque la información disponible sobre su entrenamiento y rendimiento es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 108.924.674 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el nombre sugiere portugues brasileno) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT, un transformer encoder-only que procesa el texto de forma bidireccional. Dado el nombre y el numero de parametros, es muy probable que se trate de un fine-tuning de BERTimbau base, el modelo BERT entrenado en portugues brasileno. Sin embargo, no se han publicado datos sobre el proceso de entrenamiento, la composicion del dataset ni las tecnicas de optimizacion utilizadas. No se indica que se hayan aplicado metodos como RLHF o DPO, ya que se trata de un modelo de clasificacion de texto y no de generacion.

## Capacidades

- Clasificacion binaria de textos para detectar noticias falsas (fake news) frente a contenido veraz.
- Especificamente orientado al portugues brasileno, segun el nombre del modelo.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-step ni para uso como agente autonomo.
- No dispone de capacidades de vision, audio ni otros modos multimodales.
- No se han documentado capacidades multilingues mas alla del portugues.

## Casos de uso

- Verificacion de noticias en portales de medios digitales: el modelo puede clasificar automaticamente articulos como falsos o veraces antes de su publicacion, ayudando a redactores y editores a detectar desinformacion.
- Moderacion de contenido en redes sociales: integrado en pipelines de moderacion, permite filtrar publicaciones sospechosas de contener noticias falsas en portugues.
- Sistemas de alerta temprana de desinformacion: puede usarse para monitorizar flujos de noticias y senalar contenido potencialmente falso en tiempo real.
- Analisis de contenido en investigacion academica: util para estudios sobre desinformacion en Brasil, permitiendo etiquetar grandes volumenes de textos.
- Soporte a periodistas en la comprobacion de datos (fact-checking): el modelo puede prefiltrar candidatos a verificacion antes de la revision humana.
- Clasificacion de comentarios de usuarios en foros y blogs: puede identificar mensajes que contienen afirmaciones falsas o manipuladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Dado el tamano del modelo (108M parametros), es razonable esperar que funcione en GPU de consumo con al menos 2 GB de VRAM, pero no es un dato confirmado.
- GPU recomendadas: no disponible. Por tamano, podria ejecutarse en una RTX 3060 o similar, e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con Hugging Face Inference Endpoints, y puede desplegarse con herramientas como vLLM o TGI para clasificacion, aunque no hay documentacion oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos especificos, pero al tratarse de un modelo fine-tuned sin informacion sobre el dataset, es posible que herede sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: en tareas de clasificacion, el riesgo principal es la clasificacion erronea de textos, especialmente en casos ambiguos o con contenido ironico o sarcastico.
- Limitaciones de idioma: el modelo parece estar limitado al portugues brasileno, por lo que su rendimiento en otros idiomas es probablemente pobre o nulo.
- Restricciones de licencia: la licencia no esta especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Falta de documentacion: la model card no incluye informacion sobre datos de entrenamiento, metodos de evaluacion ni rendimiento, lo que dificulta su validacion para casos de uso serios.

## Enlaces

- Hugging Face: https://huggingface.co/AliceFranca0/bertimbau-fake-news-ptbr
