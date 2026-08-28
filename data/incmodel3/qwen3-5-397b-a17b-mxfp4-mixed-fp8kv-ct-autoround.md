# INCModel3/Qwen3.5-397B-A17B-MXFP4-Mixed-FP8KV-CT-AutoRound

## Resumen

El modelo INCModel3/Qwen3.5-397B-A17B-MXFP4-Mixed-FP8KV-CT-AutoRound es una versión cuantizada del modelo Qwen3.5-397B-A17B, desarrollada por INCModel3 (Intel) mediante la herramienta AutoRound. Se trata de un modelo multimodal de imagen-texto a texto, con arquitectura de mezcla de expertos (MoE) de 397 mil millones de parámetros totales y 17 mil millones activos, según se desprende del nombre. La cuantización emplea el formato MXFP4 para los pesos de los expertos, con caché KV en FP8, lo que reduce significativamente el uso de memoria y permite su ejecución en hardware de gama alta con múltiples GPU.

Esta ficha se centra en la versión cuantizada, que mantiene un rendimiento cercano al modelo original en BF16 (99,47% de media en los benchmarks reportados). El modelo está pensado para despliegues que requieran alta eficiencia de inferencia sin sacrificar demasiada precisión, especialmente en tareas de razonamiento, comprensión del lenguaje y procesamiento multimodal. Su licencia Apache 2.0 facilita su uso comercial, aunque se recomienda revisar los términos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card (modelo base: Qwen3.5-397B-A17B, MoE híbrido con atención lineal) |
| Parametros totales | 397 mil millones (según nombre) |
| Parametros activos | 17 mil millones (según nombre) |
| Longitud de contexto | 131072 tokens (según comando de ejemplo vLLM) |
| Tipos de cuantizacion | MXFP4 (pesos de expertos), FP8 (caché KV) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (llm_compressor) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo original. Se sabe que es una cuantización MXFP4 del modelo Qwen3.5-397B-A17B, generada con AutoRound y exportada en formato llm_compressor. El proceso de cuantización se aplica únicamente a las capas de expertos del MoE (mlp.experts), manteniendo el resto de capas en precisión original o FP8 para la caché KV. No se indica el dataset de entrenamiento ni el proceso de ajuste del modelo original; la cuantización se realiza sin iteraciones de calibración (--iters 0), lo que sugiere un enfoque de cuantización post-entrenamiento directo.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, y genera texto (pipeline image-text-to-text).
- Generación de texto y razonamiento: el ejemplo de uso muestra soporte para modo de pensamiento (enable_thinking), lo que indica capacidad de razonamiento encadenado.
- Comprensión del lenguaje y conocimiento general: los benchmarks reportados (MMLU, GSM8K, PIQA, HelleSwag) cubren razonamiento matemático, conocimiento general y sentido común.
- No se especifican capacidades de tool calling, agentes o funciones adicionales en la model card.

## Casos de uso

- Asistentes de chat multimodales: el modelo puede responder a preguntas que combinan imágenes y texto, por ejemplo, describir una fotografía o responder sobre su contenido, gracias a su pipeline image-text-to-text.
- Razonamiento matemático y lógico: con un rendimiento cercano al BF16 en GSM8K, es adecuado para aplicaciones que requieran resolver problemas aritméticos o lógicos en entornos educativos o de análisis.
- Procesamiento de documentos visuales: puede extraer información de capturas de pantalla, gráficos o diagramas, aunque no se detalla su capacidad específica para OCR.
- Sistemas de preguntas y respuestas sobre conocimiento general: su puntuación en MMLU (0,88 en cuantizado) lo hace útil para bases de conocimiento o asistentes de consulta.
- Despliegue en entornos con restricciones de memoria: al estar cuantizado en MXFP4, cabe en configuraciones de 4 GPU de alta capacidad, lo que permite servir un modelo de 397B en clústeres moderados.
- Investigación en eficiencia de inferencia: sirve como referencia para estudiar el impacto de la cuantización MXFP4 en modelos MoE grandes, con datos de benchmarks publicados.

## Benchmarks y rendimiento

La model card incluye la siguiente tabla comparativa entre el modelo en BF16 y la versión cuantizada MXFP4:

| Configuracion | GSM8K | MMLU | PIQA | HelleSwag | Media | Relativo a BF16 |
|---|---|---|---|---|---|---|
| BF16 | 0.9765 | 0.8856 | 0.8303 | 0.7423 | 0.858675 | - |
| MXFP4 | 0.9719 | 0.8815 | 0.8292 | 0.7338 | 0.854100 | 99.47% |

No se proporcionan comparaciones con otros modelos de la misma categoría.

## Requisitos de hardware

- El comando de ejemplo de vLLM utiliza `--tensor-parallel-size 4`, lo que indica que se requieren al menos 4 GPU para la inferencia.
- El tamaño del repositorio es de 231,7 GB, lo que sugiere que el modelo cuantizado ocupa aproximadamente esa cantidad en disco. Para cargarlo en memoria, se necesitaría una VRAM total superior a 232 GB, por lo que se recomiendan GPU de 80 GB (por ejemplo, A100 o H100) en configuración de 4 unidades.
- No se especifican requisitos mínimos de VRAM ni latencia/throughput estimados.
- Opciones de despliegue: el ejemplo usa vLLM, pero al estar en formato llm_compressor también podría ser compatible con otros motores que soporten este formato, aunque no se confirma.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda consultar la página del modelo original Qwen3.5-397B-A17B para comparaciones con otros modelos de la familia Qwen o alternativas de tamaño similar.

## Limitaciones y advertencias

- La model card advierte que el modelo puede producir salidas factualmente incorrectas y no debe utilizarse como fuente de información fiable.
- Puede generar contenido ofensivo, sesgado o inapropiado debido a las limitaciones del modelo preentrenado y los datasets de ajuste.
- Se recomienda realizar pruebas de seguridad antes de desplegar el modelo en aplicaciones reales.
- La licencia Apache 2.0 no constituye asesoramiento legal; se aconseja consultar a un abogado para uso comercial.
- La cuantización MXFP4 introduce una ligera degradación de rendimiento (0,53% de media), que podría ser relevante en aplicaciones que requieran máxima precisión.
- No se especifican los idiomas soportados, por lo que su comportamiento multilingüe es desconocido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/INCModel3/Qwen3.5-397B-A17B-MXFP4-Mixed-FP8KV-CT-AutoRound)
- [Modelo original Qwen3.5-397B-A17B](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)
- [Artículo arxiv (AutoRound)](https://arxiv.org/abs/2309.05516)
- [Repositorio GitHub de AutoRound](https://github.com/intel/auto-round)
- [Documentación de Alibaba Cloud sobre Qwen3.5-397B-A17B](https://www.alibabacloud.com/help/en/model-studio/qwen3-5-397b-a17b)
