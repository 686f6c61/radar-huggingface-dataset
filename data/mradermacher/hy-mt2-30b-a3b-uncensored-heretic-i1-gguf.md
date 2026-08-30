# mradermacher/Hy-MT2-30B-A3B-uncensored-heretic-i1-GGUF

## Resumen

Hy-MT2-30B-A3B-uncensored-heretic-i1-GGUF es una cuantización GGUF del modelo Hy-MT2-30B-A3B-uncensored-heretic, una versión "abliterated" (sin censura) del modelo de traducción multilingüe Hy-MT2-30B-A3B desarrollado por Tencent Hunyuan. El modelo original pertenece a la familia Hy-MT2, diseñada específicamente para traducción automática en escenarios complejos del mundo real, con soporte para 33 idiomas y seguimiento de instrucciones de traducción en múltiples lenguas.

La cuantización ha sido realizada por mradermacher (nethype GmbH) utilizando la técnica imatrix, que mejora la calidad de los quantizados de baja precisión. Se ofrecen dos variantes: i1-Q2_K (11,2 GB) e i1-IQ3_M (13,4 GB), lo que permite ejecutar un modelo MoE de 30B parámetros totales (3B activos) en hardware de consumo. El archivo de imatrix también está disponible para que los usuarios generen sus propias cuantizaciones personalizadas.

Esta ficha es relevante para desarrolladores que necesitan un modelo de traducción multilingüe de alta capacidad, con licencia Apache 2.0, que pueda desplegarse localmente con requisitos de memoria moderados y sin restricciones de contenido (gracias a la versión "uncensored").

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 30.064.725.888 (30B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 8.192 tokens (segun datos del modelo base en OpenRouter) |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M (ambos con imatrix) |
| Idiomas soportados | 33 idiomas: chino, ingles, frances, portugues, espanol, japones, turco, ruso, arabe, coreano, tailandes, italiano, aleman, vietnamita, malayo, indonesio, tagalo, hindi, polaco, checo, neerlandes, khmer, birmano, persa, gujarati, urdu, telugu, marathi, hebreo, bengali, tamil, ucraniano, tibetano, kazajo, mongol, uigur (segun documentacion oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-30B-A3B pertenece a la familia Hy-MT2 de Tencent Hunyuan, descrita como modelos de traduccion "fast-thinking" (pensamiento rapido) para escenarios complejos. La arquitectura es un transformer con mezcla de expertos (MoE) con 30B parametros totales y 3B activos por token, lo que reduce significativamente el coste computacional en inferencia. El modelo original fue entrenado para traduccion entre 33 idiomas y para seguir instrucciones de traduccion en multiples lenguas.

La version "heretic" es una modificacion posterior que aplica tecnicas de "abliteration" (eliminacion de capas de seguridad) para producir un modelo "uncensored" o "decensored". Este proceso elimina las restricciones de contenido que el modelo original pudiera tener, permitiendo traducir texto que otros modelos rechazarian. No se han publicado detalles tecnicos especificos sobre el proceso de abliteration aplicado.

La cuantizacion GGUF realizada por mradermacher utiliza la tecnica imatrix (importance matrix) que calcula estadisticas de activaciones para optimizar la asignacion de bits durante la cuantizacion, mejorando la calidad resultante respecto a cuantizaciones estaticas convencionales. Se ofrecen dos niveles de cuantizacion: Q2_K (muy baja precision, 11,2 GB) e IQ3_M (precision intermedia, 13,4 GB), ambos con soporte para el formato i1 (iterative quantization).

## Capacidades

- Traduccion automatica entre 33 idiomas, incluyendo pares de lenguas con recursos limitados como tibetano, kazajo, mongol o uigur.
- Seguimiento de instrucciones de traduccion en multiples idiomas: el modelo puede recibir ordenes como "traduce al espanol manteniendo el tono formal" y ejecutarlas.
- Capacidad conversacional: a pesar de estar orientado a traduccion, el modelo puede mantener dialogos multilingues.
- Soporte de "fast-thinking": disenado para resolver escenarios de traduccion complejos que requieren comprension contextual profunda.
- Al ser una version "uncensored", no aplica filtros de contenido, lo que permite traducir terminologia medica, legal, tecnica o literaria que otros modelos podrian bloquear.
- Compatible con herramientas de inferencia GGUF como llama.cpp, Ollama, LM Studio y otras que soporten el formato.

## Casos de uso

- Localizacion de software y aplicaciones: el modelo puede traducir cadenas de interfaz, documentacion tecnica y mensajes de error a 33 idiomas, manteniendo coherencia terminologica gracias a su capacidad de seguir instrucciones.
- Atencion al cliente multilingue: integrado en un sistema de tickets o chat, permite responder consultas de usuarios en su idioma nativo con un unico modelo, reduciendo la necesidad de multiples motores de traduccion.
- Traduccion de documentos legales y contractuales: la version sin censura permite procesar clausulas complejas y terminologia juridica sin rechazos, aunque se recomienda supervision humana para garantizar exactitud.
- Traduccion de contenido creativo: literatura, guiones, marketing o redes sociales, donde el modelo puede adaptar tono y estilo segun las instrucciones proporcionadas.
- Traduccion en tiempo real para comunicacion internacional: desplegado en local con cuantizacion Q2_K (11,2 GB), puede ejecutarse en una estacion de trabajo con GPU de 16 GB para traducir conversaciones o documentos sobre la marcha.
- Creacion de datasets multilingues: el modelo puede generar traducciones de alta calidad para ampliar conjuntos de datos de entrenamiento en lenguas de bajos recursos, aprovechando su cobertura de 33 idiomas.
- Traduccion de contenido cientifico y tecnico: articulos de investigacion, patentes o especificaciones, donde la terminologia especializada requiere comprension contextual profunda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizado ni la documentacion publica del modelo base Hy-MT2-30B-A3B incluyen metricas como BLEU, COMET o METEOR. Se recomienda consultar el repositorio oficial de Tencent Hunyuan (enlazado abajo) para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion i1-Q2_K ocupa 11,2 GB y la i1-IQ3_M 13,4 GB, por lo que se necesita al menos 16 GB de VRAM para la variante Q2_K y 16-24 GB para la IQ3_M, dependiendo del contexto y batch size.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), RTX 3090 (24 GB), A100 (40-80 GB) o H100 para despliegues de mayor rendimiento.
- En CPU: con 16 GB de RAM adicionales al modelo, puede ejecutarse en sistemas sin GPU usando llama.cpp, aunque con latencia mayor.
- Herramientas de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un MoE con 3B activos en una GPU moderna (RTX 4090) suele ofrecer entre 30-60 tokens por segundo con cuantizacion Q4, pero esto depende del hardware y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT2-30B-A3B (uncensored, cuantizado) | 30B totales, 3B activos | 8.192 | 33 | Apache 2.0 | GGUF |
| NLLB-200 (Meta) | 3.3B / 54B | 512 | 200 | CC-BY-NC | Transformers, ONNX |
| M2M-100 (Meta) | 418M / 1.2B / 12B | 512 | 100 | MIT | Transformers |
| SeamlessM4T (Meta) | 2.3B | 512 | 100+ | CC-BY-NC | Transformers |

El Hy-MT2-30B-A3B destaca por su mayor longitud de contexto (8.192 tokens frente a 512 de los modelos de Meta), lo que permite traducir documentos largos sin fragmentacion. La licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de NLLB-200 y SeamlessM4T que usan CC-BY-NC. Su arquitectura MoE con 3B activos ofrece un equilibrio entre capacidad y eficiencia, aunque los modelos densos de Meta pueden ser mas simples de desplegar en entornos sin soporte de MoE.

## Limitaciones y advertencias

- La version "uncensored" elimina filtros de seguridad: el modelo puede generar o traducir contenido ofensivo, ilegal o perjudicial si se le solicita. No debe usarse en aplicaciones donde el contenido generado no sea revisado por un humano.
- La cuantizacion Q2_K (11,2 GB) introduce una perdida de calidad notable en la traduccion, especialmente en pares de idiomas con pocos recursos. Se recomienda usar IQ3_M o cuantizaciones superiores si la calidad es critica.
- El contexto de 8.192 tokens es relativamente corto para documentos extensos; textos mas largos requieren fragmentacion y post-procesamiento.
- No se han publicado benchmarks oficiales del modelo cuantizado, por lo que el rendimiento real en tareas de traduccion no esta verificado.
- El proceso de abliteration puede haber degradado la capacidad del modelo en tareas que requieren matices de seguridad o manejo de contenido sensible.
- Los idiomas soportados incluyen variantes regionales (p.ej., chino simplificado vs tradicional) que pueden no estar diferenciadas correctamente.
- La cuantizacion imatrix requiere el archivo de importancia incluido en el repositorio para obtener resultados optimos; sin el, la calidad puede verse reducida.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Hy-MT2-30B-A3B-uncensored-heretic-i1-GGUF
- Modelo base (versión uncensored): https://huggingface.co/OS-Software/Hy-MT2-30B-A3B-uncensored-heretic
- Repositorio oficial de Hy-MT2 en GitHub: https://github.com/Tencent-Hunyuan/Hy-MT2
- Página del modelo en ModelScope: https://www.modelscope.cn/models/Tencent-Hunyuan/Hy-MT2-30B-A3B
- Ficha del modelo en OpenRouter (precios y contexto): https://openrouter.ai/tencent/hy-mt2-30b-a3b
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Hy-MT2-30B-A3B-uncensored-heretic-GGUF
