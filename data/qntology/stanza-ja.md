# Qntology/stanza-ja

## Resumen

Stanza-ja es el paquete de procesamiento lingüístico de Stanza para japonés, distribuido por Qntology como una conversión a ONNX del modelo original de Stanford NLP (`stanfordnlp/stanza-ja`). No es un modelo generativo ni un LLM: es un conjunto de procesadores especializados (tokenización, etiquetado POS, lematización y análisis de dependencias) que conforman un pipeline de análisis lingüístico completo para texto japonés. El repositorio ocupa 1,7 GB y se publica bajo licencia Apache 2.0.

La relevancia de esta versión concreta reside en su formato: los pesos se han exportado a ONNX mediante la herramienta `stanza-onnx-export`, lo que permite ejecutar el pipeline sin depender de PyTorch y facilita el despliegue en entornos de inferencia ligeros o integrados en aplicaciones. El autor verifica la equivalencia funcional con el pipeline original de Stanza (PyTorch) comparando tokens, UPOS, XPOS, rasgos morfológicos, lemas, cabezas y relaciones de dependencia sobre un conjunto de textos de prueba.

El modelo está pensado para desarrolladores que necesitan análisis morfosintáctico y de dependencias de alta calidad en japonés dentro de pipelines de NLP (extracción de información, búsqueda, anotación de corpus), no para generación de texto. Al ser una conversión de un modelo de referencia consolidado (Stanza 1.15.0), su valor está en la fidelidad de la conversión y en la portabilidad del formato ONNX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de modelos neuronales de Stanza (tokenizador, etiquetador POS, lematizador y parser de dependencias); exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen pesos ONNX sin cuantizar según la información disponible) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`tokenizer.onnx`, `pos.onnx`, `lemma.onnx`, `depparse.onnx`, `lemma_encoder.onnx`, `lemma_decoder.onnx`) + JSON (`vocab.json`, `pretrain_vocab.json`, `lemma_dict.json`, `tokenize_lexicon.json`) |

## Arquitectura y entrenamiento

El modelo es una colección de procesadores de Stanza: tokenización (`combined_nocharlm`), etiquetado POS (`combined_charlm`), lematización (`combined_nocharlm`) y análisis de dependencias (`combined_charlm`). Estos componentes se corresponden con los paquetes por defecto de Stanza 1.15.0 para japonés. La conversión a ONNX se realizó con `stanza-onnx-export` (commit `d56cf6f`), generando dos formatos: el formato 1 en la raíz del repositorio (compatible con versiones antiguas que descargan desde `PopupLink/stanza-ja`) y el formato 2 en el subdirectorio `format2/`, usado por logis-center a partir de noviembre de 2026 mediante `stanza::remote_base`.

La verificación de equivalencia se realizó de extremo a extremo contra el pipeline de PyTorch de Stanza con los mismos procesadores: sobre 19 textos en japonés (278 en total entre los 12 idiomas convertidos), los tokens, la expansión de palabras múltiples, UPOS, XPOS, rasgos, lemas, cabezas y relaciones de dependencia resultaron idénticos. No se dispone de información sobre el volumen de datos de entrenamiento original ni sobre el uso de RLHF/DPO, ya que esta ficha se limita a la conversión ONNX y no al entrenamiento del modelo base.

## Capacidades

- Tokenización de texto japonés en unidades morfológicas, con manejo de palabras múltiples.
- Etiquetado gramatical (POS) con UPOS y XPOS, incluyendo rasgos morfológicos.
- Lematización de tokens japoneses.
- Análisis de dependencias sintácticas (cabezas y relaciones de dependencia).
- Procesamiento de texto en bruto de extremo a extremo mediante el pipeline de Stanza.
- Ejecución mediante ONNX Runtime, sin dependencia de PyTorch en el momento de la inferencia.
- Soporte de dos formatos de distribución (formato 1 y formato 2) para compatibilidad con distintos clientes.

## Casos de uso

- Anotación de corpus lingüísticos en japonés: el pipeline permite generar anotaciones morfosintácticas y de dependencias de forma automática para corpus de investigación, con equivalencia verificada respecto a la salida de PyTorch.
- Preprocesamiento para sistemas de búsqueda y recuperación de información: la tokenización y lematización en japonés (idioma sin separación explícita de palabras) facilitan la indexación y normalización de términos.
- Extracción de información y relaciones: el análisis de dependencias permite construir árboles sintácticos sobre los que aplicar reglas o modelos posteriores de extracción.
- Análisis de sentimiento y clasificación de texto en japonés: las etiquetas POS y los lemas sirven como características de entrada para clasificadores posteriores.
- Despliegue en entornos sin PyTorch: al estar en ONNX, el modelo puede integrarse en servicios de inferencia ligeros o en aplicaciones donde el stack de PyTorch no está disponible.
- Construcción de pipelines de NLP multilingües: al formar parte de la familia Stanza, puede combinarse con los paquetes de otros idiomas convertidos con la misma herramienta.
- Herramientas de análisis gramatical para usuarios finales: correctores o visores sintácticos que necesiten segmentación y dependencias de texto japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 1,7 GB; el espacio en disco necesario para los pesos ONNX es de ese orden.
- Al ser modelos de análisis lingüístico (no generativos), la huella de memoria en inferencia es muy inferior a la de un LLM del mismo tamaño en disco; no se dispone de cifras exactas de VRAM en la información proporcionada.
- No se especifican GPU recomendadas; la ejecución con ONNX Runtime puede realizarse en CPU o GPU según la configuración del cliente.
- No se dispone de datos de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio) y el pipeline de Stanza con soporte de descarga remota (`stanza::remote_base`) para el formato 2.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Contexto | Parámetros | Disponibilidad |
|---|---|---|---|---|---|---|
| Qntology/stanza-ja | japonés | ONNX | Apache 2.0 | no disponible | no disponible | Hugging Face |
| stanfordnlp/stanza-ja | japonés | PyTorch (Stanza) | Apache 2.0 | no disponible | no disponible | Hugging Face, ModelScope |

La comparativa se limita al modelo original de Stanford NLP, del que esta versión es una conversión directa; no se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es un modelo de análisis lingüístico, no un modelo generativo: no produce texto ni responde a instrucciones.
- Solo soporta japonés; no es multilingüe.
- No se dispone de información sobre sesgos del modelo base ni sobre su comportamiento en dominios específicos (texto técnico, coloquial, etc.).
- La verificación de equivalencia se realizó sobre 19 textos en japonés; no cubre todos los casos posibles de entrada.
- El repositorio mantiene dos formatos (1 y 2) con propósitos de compatibilidad; es necesario elegir el adecuado según el cliente que consuma el modelo.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo original de Stanford NLP antes de un uso comercial a gran escala.
- No se dispone de información sobre el rendimiento en producción ni sobre latencias reales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Qntology/stanza-ja
- Modelo original: https://huggingface.co/stanfordnlp/stanza-ja
- Réplica en ModelScope: https://www.modelscope.cn/models/stanfordnlp/stanza-ja/summary
- Web de Stanza: https://stanfordnlp.github.io/stanza
- Repositorio GitHub de Stanza: https://github.com/stanfordnlp/stanza
- Herramienta de exportación a ONNX: https://github.com/sungu-che/stanza-onnx-export
