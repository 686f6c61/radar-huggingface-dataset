# 0xtimi2233/Hy-MT2-1.8B-oQ8e

## Resumen

Hy-MT2-1.8B-oQ8e es una versión cuantizada a 8 bits del modelo de traducción multilingüe Hy-MT2-1.8B, desarrollado originalmente por Tencent Hunyuan. El modelo base pertenece a la familia Hy-MT2, una serie de modelos de traducción "fast-thinking" diseñados para escenarios reales complejos, con soporte para 33 idiomas y capacidad de seguir instrucciones de traducción en múltiples lenguas. Según la documentación de Tencent, la variante de 1.8B supera a APIs comerciales como Microsoft Translator y Doubao en tareas de traducción, a pesar de su tamaño compacto.

Este repositorio concreto, subido por el usuario 0xtimi2233, contiene los pesos cuantizados mediante la herramienta oQ (oMLX v0.6.3) con precisión mixta, en formato MLX safetensors. La cuantización reduce el tamaño del modelo a aproximadamente 1.9 GB, lo que lo hace adecuado para ejecutarse en dispositivos Apple Silicon y GPUs con poca memoria. Es relevante para desarrolladores que necesitan un traductor multilingüe eficiente y de baja latencia, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 1.8B (segun el nombre del modelo original); el safetensors cuantizado contiene 503.842.944 parametros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (oQ, group size 64) en este repo; el original probablemente en bf16/fp16 |
| Idiomas soportados | 33 idiomas (segun documentacion de Tencent) |
| Licencia | No disponible (el repo no indica licencia; la del modelo original no se ha especificado) |
| Formato de pesos | MLX safetensors (cuantizado 8-bit) |

## Arquitectura y entrenamiento

La arquitectura se describe como `hunyuan_v1_dense`, lo que indica un transformer denso, sin mezcla de expertos. No se dispone de detalles sobre el número de capas, dimensiones ocultas o mecanismos de atención específicos. El modelo original de Tencent fue entrenado para traducción multilingüe con un enfoque en "fast-thinking", es decir, optimizado para generar traducciones rápidas y precisas en contextos conversacionales o de producción. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La cuantización aplicada en este repo utiliza oQ, una herramienta de cuantización de precisión mixta que asigna diferentes bits a distintas capas según su sensibilidad, aunque aquí se fija a 8 bits con group size 64.

## Capacidades

- Traduccion multilingue entre 33 idiomas, incluyendo pares de lenguas mayoritarias y minoritarias.
- Seguimiento de instrucciones de traduccion en varios idiomas, permitiendo especificar estilo, tono o formato.
- Soporte para workflows de traduccion estructurada, basada en delimitadores, contextual, con glosarios y guiada por estilo (segun documentacion de la API de AI/ML API).
- Generacion de texto rapida ("fast-thinking"), adecuada para aplicaciones en tiempo real.
- Capacidad de traduccion de cinco dialectos chinos y pares de lenguas minoritarias, segun la documentacion oficial.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso; el modelo esta especializado en traduccion.

## Casos de uso

- Traduccion automatica de contenido web: el modelo puede integrarse en pipelines de scraping y publicacion para traducir articulos, blogs o documentacion a 33 idiomas, manteniendo coherencia gracias a su capacidad de seguir instrucciones de estilo.
- Localizacion de software: desarrolladores pueden usarlo para traducir cadenas de interfaz, mensajes de error y documentacion tecnica, con soporte para glosarios que aseguran terminologia consistente.
- Atencion al cliente multilingue: en sistemas de tickets o chat, el modelo puede traducir consultas y respuestas en tiempo real, reduciendo la latencia frente a APIs externas y manteniendo la privacidad de los datos al ejecutarse localmente.
- Subtitulado y transcripcion: puede generar subtitulos traducidos para videos, aprovechando su velocidad para procesar grandes volumenes de texto.
- Traduccion de documentos legales o tecnicos: con la capacidad de seguir instrucciones de formato (delimitadores, estructura), es util para traducir contratos, manuales o especificaciones manteniendo el formato original.
- Asistente de traduccion en entornos offline: al ser un modelo compacto cuantizado, puede desplegarse en dispositivos edge o portatiles sin conexion a internet, ideal para viajes o entornos con restricciones de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion de Tencent menciona que el modelo de 1.8B supera a APIs comerciales como Microsoft Translator y Doubao, pero no se proporcionan cifras concretas (BLEU, chrF, etc.). Se recomienda consultar el repositorio oficial de Tencent para obtener metricas detalladas.

## Requisitos de hardware

- VRAM estimada: el repo cuantizado ocupa 1.9 GB, por lo que se puede ejecutar en GPUs con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o Apple Silicon con memoria unificada de 8 GB).
- GPU recomendadas: Apple Silicon (M1/M2/M3) gracias al formato MLX; tambien puede ejecutarse en GPUs NVIDIA via conversion a otros formatos, aunque no se proporciona soporte oficial.
- En consumer GPU: si, cabe en GPUs de gama media con 4-6 GB de VRAM.
- Opciones de despliegue: al ser formato MLX, se puede usar con la libreria MLX en macOS; para otros entornos, seria necesario convertir a GGUF o safetensors estandar (no incluido en este repo).
- Latencia y throughput: no disponibles; al ser un modelo de 1.8B cuantizado, se espera una latencia baja en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT2-1.8B (original) | 1.8B | No disponible | 33 | No disponible | safetensors (bf16) |
| NLLB-200-1.3B (Meta) | 1.3B | 512 tokens | 200 | CC-BY-NC | safetensors |
| M2M-100-1.2B (Meta) | 1.2B | 1024 tokens | 100 | MIT | safetensors |
| Hy-MT2-1.8B-oQ8e (este repo) | 1.8B (nominal) | No disponible | 33 | No disponible | MLX safetensors (8-bit) |

La comparativa es limitada porque no se dispone de datos de rendimiento. Hy-MT2 se presenta como superior a APIs comerciales, pero no hay comparaciones directas con NLLB o M2M en la informacion disponible.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos o alucinaciones; como modelo de traduccion, puede generar errores en contextos ambiguos o con terminologia especializada.
- La cuantizacion a 8 bits puede degradar ligeramente la calidad de traduccion en comparacion con el modelo original en bf16.
- La licencia no esta especificada en el repo, lo que genera incertidumbre sobre su uso comercial; se recomienda contactar con el autor o consultar el repositorio oficial de Tencent.
- El formato MLX limita su uso a ecosistemas Apple; para otros entornos se requiere conversion manual.
- No se ha confirmado la longitud de contexto, lo que puede afectar a traducciones de documentos largos.
- El numero de parametros del safetensors cuantizado (503M) difiere del nominal (1.8B), lo que sugiere que podria tratarse de una version reducida o que la cuantizacion elimina tensores; esto debe verificarse antes de su uso en produccion.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/0xtimi2233/Hy-MT2-1.8B-oQ8e
- Modelo original: https://huggingface.co/tencent/Hy-MT2-1.8B
- Repositorio GitHub de Hy-MT2: https://github.com/Tencent-Hunyuan/Hy-MT2
- Documentacion de Tencent Cloud: https://www.tencentcloud.com/techpedia/144776?lang=en
- Documentacion de AI/ML API: https://docs.aimlapi.com/api-references/text-models-llm/tencent/hy-mt2-1.8b
