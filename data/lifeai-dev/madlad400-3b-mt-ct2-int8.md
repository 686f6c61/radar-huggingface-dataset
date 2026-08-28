# LifeAi-dev/madlad400-3b-mt-ct2-int8

## Resumen

MADLAD-400-3B-MT es un modelo de traducción automática multilingüe desarrollado por Google Research, basado en la arquitectura T5 (encoder-decoder transformer). Fue entrenado sobre 1 billón de tokens de datos públicos, cubriendo más de 450 idiomas, y demuestra un rendimiento competitivo con modelos significativamente más grandes. La versión aquí descrita, `LifeAi-dev/madlad400-3b-mt-ct2-int8`, es una conversión a CTranslate2 con cuantización int8 realizada por la organización LifeAi-dev, que reduce el tamaño del modelo de los 11,8 GB originales a aproximadamente 3 GB, facilitando su despliegue en entornos con recursos limitados.

El modelo original se publicó bajo licencia Apache 2.0 y está disponible en Hugging Face. Esta conversión mantiene la misma licencia y funcionalidad, pero está optimizada para inferencia con CTranslate2, lo que permite ejecutarlo en CPU y GPU con menor huella de memoria. Es relevante para aplicaciones de traducción automática de alta calidad en entornos de producción donde el coste de hardware es un factor crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder transformer) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la informacion) |
| Tipos de cuantizacion | int8 (esta version); el original tambien tiene versiones GGUF q4k |
| Idiomas soportados | Mas de 450 idiomas (lista extensa en el repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (ct2) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5, un transformer encoder-decoder con 32 capas y un vocabulario compartido de 256 000 tokens SentencePiece. Fue entrenado sobre 1 billón de tokens procedentes de datos públicos, con un enfoque en cobertura multilingüe y a nivel de documento. El dataset utilizado es MADLAD-400, descrito en el paper correspondiente. No se menciona el uso de RLHF ni DPO; es un modelo de traducción supervisada, no un modelo de chat o instrucción.

La innovación principal radica en la escala de datos y la cobertura de idiomas, que incluye lenguas de baja representación. El modelo original se entrenó con una mezcla de datos filtrados y auditados, y se ha demostrado que compite con modelos de mayor tamaño en tareas de traducción.

## Capacidades

- Traducción automática multilingüe: soporta más de 450 idiomas, incluyendo lenguas mayoritarias y minoritarias.
- Generación de texto a texto: al ser un modelo T5, puede adaptarse a otras tareas de text2text, aunque su entrenamiento principal es traducción.
- Soporte de prefijos de idioma: utiliza tokens como `<2en>`, `<2de>`, etc., para indicar el idioma de destino.
- No soporta tool calling ni agentes: es un modelo de traducción puro, sin capacidades de razonamiento multi-paso ni integración con herramientas.
- Capacidades multilingües extensas: cubre desde idiomas europeos hasta lenguas africanas, asiáticas y amerindias.

## Casos de uso

- Traducción automática en producción: el modelo puede integrarse en pipelines de traducción para empresas que necesitan traducir contenido a múltiples idiomas. Su tamaño reducido (3 GB en int8) permite desplegarlo en servidores con GPUs modestas o incluso en CPU con CTranslate2.
- Localización de software y sitios web: ideal para traducir interfaces, documentación y contenido dinámico a decenas de idiomas, gracias a su amplia cobertura lingüística.
- Subtitulado automático: puede utilizarse para traducir subtítulos de vídeo en tiempo real o por lotes, aprovechando su capacidad de manejar texto largo (aunque la longitud de contexto no está especificada, T5 suele manejar secuencias de hasta 512 o 1024 tokens).
- Traducción de documentos técnicos y legales: su entrenamiento con datos a nivel de documento mejora la coherencia en textos extensos, aunque se recomienda validar la calidad en dominios especializados.
- Aplicaciones de atención al cliente multilingüe: puede traducir consultas de usuarios en tiempo real, permitiendo que un solo agente atienda a clientes de diferentes idiomas.
- Investigación en NLP multilingüe: sirve como modelo base para fine-tuning en tareas específicas de traducción o como referencia para comparar con otros modelos multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada en int8. El modelo original (MADLAD-400-3B-MT) reporta resultados en el paper arXiv:2309.04662, donde se compara con otros modelos de traducción multilingüe. Sin embargo, no se dispone de los valores numéricos en la información proporcionada. Se recomienda consultar el paper para obtener métricas detalladas (BLEU, chrF, etc.) en tareas como WMT y FLORES-200.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado en int8 ocupa aproximadamente 3 GB en disco. Para inferencia, se recomienda al menos 4 GB de VRAM en GPU, aunque puede ejecutarse en CPU con CTranslate2.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o superiores. También funciona en GPUs de datacenter como A100 o H100, pero no son necesarias.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja gracias a la cuantización int8.
- Opciones de despliegue: CTranslate2 (nativo), también se puede convertir a GGUF para usar con llama.cpp u Ollama, aunque no se proporciona un archivo GGUF en este repo. El modelo original tiene versiones GGUF disponibles en otros repos.
- Latencia y throughput: no se dispone de datos específicos, pero al ser un modelo de 3B con cuantización int8, se espera una latencia de decenas de milisegundos por frase en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MADLAD-400-3B-MT (este) | 3B | No disponible | 450+ | Apache 2.0 | CTranslate2 int8 |
| NLLB-200 (3.3B) | 3.3B | 512 tokens | 200 | CC-BY-NC | Safetensors |
| M2M-100 (1.2B) | 1.2B | 1024 tokens | 100 | MIT | Safetensors |
| mT5 (3B) | 3B | 512 tokens | 101 | Apache 2.0 | Safetensors |

Nota: NLLB-200 tiene una licencia no comercial, mientras que MADLAD-400 y mT5 son Apache 2.0. M2M-100 es MIT. La cobertura de idiomas de MADLAD-400 es superior a la de NLLB-200 y M2M-100.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos públicos, el modelo puede reflejar sesgos presentes en esos datos, especialmente en idiomas con menos representación.
- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones incorrectas o inventar contenido, especialmente en idiomas de baja representación o dominios especializados.
- Limitaciones de contexto: la longitud de contexto no está especificada, pero T5 típicamente maneja secuencias de hasta 512 o 1024 tokens. Para documentos largos, puede ser necesario dividir el texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución.
- Caveat para producción: la cuantización int8 puede degradar ligeramente la calidad de la traducción en comparación con el modelo en fp32. Se recomienda evaluar la calidad en el dominio específico antes de desplegar.
- El modelo no está diseñado para tareas de chat o instrucción, solo para traducción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LifeAi-dev/madlad400-3b-mt-ct2-int8
- Modelo original: https://huggingface.co/google/madlad400-3b-mt
- Paper: https://arxiv.org/abs/2309.04662
- Repositorio GitHub de Google Research: https://github.com/google-research/google-research/tree/master/madlad_400
- Perfil de LifeAi-dev: https://huggingface.co/LifeAi-dev
