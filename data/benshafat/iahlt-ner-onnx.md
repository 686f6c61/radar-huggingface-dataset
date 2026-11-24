# benshafat/iahlt-ner-onnx

## Resumen

`benshafat/iahlt-ner-onnx` es una conversión a ONNX con cuantización int8 del modelo de reconocimiento de entidades nombradas (NER) en hebreo `iahlt/ner-baseline-dictabert-he`, desarrollado por IAHLT sobre la base de DictaBERT de Dicta. El modelo original resuelve la tarea de token classification (etiquetado BIO de entidades) para textos en hebreo moderno, y esta versión lo empaqueta para ejecutarse con ONNX Runtime exclusivamente en CPU, sin dependencia de PyTorch.

La relevancia de esta ficha es acotada y muy específica: no se trata de un modelo nuevo ni reentrenado, sino de una copia de formato pensada para aplicaciones de escritorio sin GPU que necesitan etiquetado de entidades en hebreo con un consumo de recursos bajo. El repositorio ocupa aproximadamente 0,2 GB y el fichero de pesos int8 ronda los 184,6 MB, lo que supone alrededor de una cuarta parte del tamaño del modelo original.

Arquitectura BERT (encoder transformer) heredada de DictaBERT, sin cambios en los pesos más allá de la cuantización dinámica. La longitud de entrada está limitada a 512 tokens por el propio modelo base, y los textos más largos deben dividirse. La licencia es CC BY 4.0, la misma del modelo original y de DictaBERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (DictaBERT), exportado a ONNX (opset 17) |
| Parametros totales | no disponible (el modelo base es DictaBERT; no se especifica el conteo exacto en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo de entrada; dividir textos mas largos) |
| Tipos de cuantizacion | int8 dinamica (ONNX Runtime `quantize_dynamic`, pesos `QInt8`) |
| Idiomas soportados | hebreo (he) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/model_int8.onnx`, 184.586.981 bytes); tokenizer en `tokenizer.json`; configuracion en `config.json` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT (DictaBERT) afinado para token classification con etiquetas BIO sobre los tipos de entidad de IAHLT: `PER`, `ORG`, `GPE`, `LOC`, `FAC`, `TIMEX`, `TTL`, `EVE`, `WOA`, `DUC`, `ANG`, `MISC` e `INFORMAL`. Esta versión concreta no introduce ningún cambio arquitectónico: se exporta el modelo PyTorch original a ONNX con `input_ids` y `attention_mask` como entradas y `logits` como salida, con ejes de batch y longitud dinámicos, y después se aplica cuantización dinámica a int8 sobre los pesos.

No se ha reentrenado ni modificado los pesos más allá de la cuantización, según indica el autor. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo ajuste fino con RLHF/DPO; el modelo base se entrenó sobre el dataset abierto de entidades nombradas en hebreo de IAHLT, enlazado en la model card. La única diferencia funcional relevante respecto al original, además del formato, es que el `tokenizer.json` incluido segmenta de forma distinta las secuencias de guiones bajos.

## Capacidades

- Reconocimiento de entidades nombradas en hebreo: personas, organizaciones, lugares geopolíticos, localizaciones, instalaciones, expresiones temporales, títulos, eventos, obras de arte, productos, enfermedades, ángeles y categorías misceláneas e informales.
- Etiquetado a nivel de token con esquema BIO, apto para extracción estructurada de entidades en pipelines de NLP.
- Inferencia en CPU con ONNX Runtime, sin necesidad de PyTorch ni de GPU.
- Entradas con batch y longitud dinámicos (hasta 512 tokens por secuencia).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un modelo discriminativo de etiquetado, no generativo.
- Capacidad multilingüe limitada al hebreo; no se documentan otros idiomas.

## Casos de uso

- Extracción de entidades en aplicaciones de escritorio sin GPU: el modelo se ejecuta con ONNX Runtime en CPU y permite anonimizar o estructurar nombres de personas y organizaciones en documentos hebreos sin infraestructura de aceleración.
- Anonimización y seudonimización de textos: detectar etiquetas `PER` y `ORG` para enmascarar datos personales en corpus hebreos antes de compartirlos o almacenarlos.
- Indexación y búsqueda semántica sobre corpus hebreos: extraer entidades de artículos o informes para construir índices por persona, organización o lugar y mejorar la recuperación de información.
- Procesamiento de noticias y monitorización de medios: identificar entidades en titulares y cuerpos de noticia en hebreo para agregación temática o seguimiento de menciones.
- Enriquecimiento de bases de datos y CRM: poblar campos estructurados (nombre, organización, localización, fecha) a partir de texto libre hebreo introducido por usuarios.
- Preprocesado para pipelines de NLP más grandes: como paso previo de etiquetado de entidades antes de tareas de resolución de correferencia, relación entre entidades o análisis de sentimiento a nivel de entidad.
- Prototipado rápido y pruebas en local: al ocupar unos 185 MB en int8 y no requerir PyTorch, es adecuado para entornos de desarrollo con recursos limitados o para integración en aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que las puntuaciones de esta versión cuantizada pueden diferir ligeramente de las del modelo original, cuya tabla de resultados figura en la página de `iahlt/ner-baseline-dictabert-he`. No se ofrecen cifras concretas de F1, precisión o recall en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para ejecución en CPU mediante ONNX Runtime (`CPUExecutionProvider`).
- Memoria RAM estimada: el fichero de pesos int8 ocupa unos 184,6 MB, por lo que la inferencia cabe holgadamente en menos de 1 GB de RAM en la práctica, dependiendo del runtime y del batch.
- GPU recomendadas: no se especifican; el modelo no requiere GPU. Puede ejecutarse en CPU de cualquier equipo de escritorio moderno.
- Cabe en GPU consumer: sí, en cualquier GPU consumer, aunque no es el escenario previsto por el autor.
- Opciones de despliegue: ONNX Runtime (CPU), con el tokenizer de la librería `tokenizers`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `benshafat/iahlt-ner-onnx` | no disponible (BERT base) | 512 tokens | hebreo | ONNX int8 | CC BY 4.0 | Version cuantizada para CPU |
| `iahlt/ner-baseline-dictabert-he` | no disponible (BERT base) | 512 tokens | hebreo | PyTorch (safetensors/bin) | CC BY 4.0 | Modelo original, mayor tamaño, requiere PyTorch |
| `dicta-il/dictabert` | no disponible | 512 tokens | hebreo | PyTorch | CC BY 4.0 | Modelo base preentrenado, sin ajuste NER |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, licencia, idioma y contexto.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en hebreo; no debe esperarse un rendimiento útil en otros idiomas.
- Límite estricto de 512 tokens por entrada; los textos más largos deben dividirse, lo que puede romper entidades que crucen el corte.
- La cuantización int8 puede introducir divergencias de puntuación respecto al modelo original; el autor lo advierte explícitamente y remite a la tabla del modelo base.
- El `tokenizer.json` difiere del original en el tratamiento de secuencias de guiones bajos, lo que puede afectar a la tokenización de identificadores o textos con ese carácter.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la etiquetación de entidades, especialmente en dominios alejados de los datos de entrenamiento.
- No se documentan sesgos específicos en la información proporcionada; al tratarse de un corpus hebreo, pueden aparecer sesgos propios del dataset de origen.
- Licencia CC BY 4.0: permite uso comercial con atribución. Es obligatorio acreditar a IAHLT, al dataset abierto de entidades nombradas en hebreo y a Dicta (DictaBERT) según indica la model card.
- Se distribuye "tal cual", sin garantía, como establece la licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/benshafat/iahlt-ner-onnx
- Modelo base: https://huggingface.co/iahlt/ner-baseline-dictabert-he
- DictaBERT: https://huggingface.co/dicta-il/dictabert
- Paper de DictaBERT (arXiv:2308.16687): https://arxiv.org/abs/2308.16687
- Dataset abierto de entidades nombradas en hebreo de IAHLT: https://github.com/IAHLT/hebrew_named_entities_open_dataset
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
