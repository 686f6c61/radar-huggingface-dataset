# Baekpica/Nex-N2.6-VQ-GGUF

## Resumen

Nex-N2.6-VQ-GGUF es una conversión cuantizada del modelo multimodal Nex-N2.6, desarrollado por Nex AGI a partir de un ajuste fino de GLM-5.3-Flash orientado a uso de herramientas multimodales. El repositorio lo publica el usuario Baekpica como una distribución GGUF con una técnica propia de cuantización vectorial (hVQ) que aprende codebooks compartidos de los pesos originales y propaga el error de cuantización por los canales de entrada usando activaciones enrutadas del modelo profesor. El objetivo es reducir el peso del modelo hasta que quepa en un único DGX Spark con un objetivo de memoria de unos 88 GiB para los pesos mapeados.

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con 45 capas troncales, 288 expertos por capa enrutada, una torre de visión de 24 bloques, un drafter MTP de una capa y una longitud de contexto máxima de 1.048.576 tokens. El pipeline declarado es image-text-to-text, por lo que cubre entrada de imagen y texto. La licencia declarada por el autor original es Apache 2.0.

Es relevante ahora porque documenta un enfoque de cuantización híbrida (índices vectoriales por bloques de pesos más matrices Q4_K selectas y tensores GVQ1 dedicados) pensado para despliegue en hardware de borde de NVIDIA, y porque el repositorio expone explícitamente que la conversión está en curso: la model card registra el diseño antes de subir los pesos, y los resultados held-out y la validación de hardware acompañarán a los ficheros convertidos. En el momento de redactar esta ficha no hay pesos publicados ni resultados medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (base GLM-5.3-Flash ajustada por Nex AGI), 45 capas troncales, 288 expertos por capa enrutada, torre de visión de 24 bloques, drafter MTP de una capa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | hVQ propietaria: R13+8 (dos índices aditivos por cada ocho pesos de experto) en capas 3–17, 22, 27, 41 y 44; R13 (un índice por cada ocho pesos) en las 23 capas enrutadas restantes; 316 matrices Q4_K en matrices no-experto seleccionadas; tensores GVQ1 dedicados para embeddings, routers, estado, torre de visión y capa MTP 45 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (declarada por Nex AGI para Nex-N2.6) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Nex-N2.6 es un ajuste fino de GLM-5.3-Flash realizado por Nex AGI para uso de herramientas multimodal. La arquitectura es un transformer de mezcla de expertos con 288 expertos por capa enrutada y 45 capas troncales, al que se añaden una torre de visión de 24 bloques para el procesamiento de imágenes y un drafter MTP (multi-token prediction) de una capa, presumiblemente para decodificación especulativa. La ventana de contexto alcanza 1.048.576 tokens.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible: no se indica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica documentada en este repositorio es la cuantización hVQ: aprende codebooks compartidos a partir de los pesos de Nex y utiliza las activaciones enrutadas del propio modelo para propagar el error de cuantización entre canales de entrada. La comparación held-out prevista usa el profesor Nex original y una línea base de asignación weight-only emparejada. La asignación de capas se hereda de una conversión anterior de GLM, con un objetivo de memoria de aproximadamente 88 GiB en un único DGX Spark.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base GLM-5.3-Flash ajustado por Nex AGI.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text), con torre de visión de 24 bloques.
- Uso de herramientas y función calling, según la orientación declarada del ajuste fino ("multimodal tool use").
- Contexto extremadamente largo: hasta 1.048.576 tokens, adecuado para documentos y conversaciones de gran extensión.
- Decodificación con drafter MTP de una capa integrado en la arquitectura.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Agentes multimodales de automatización: el ajuste fino está orientado a tool use multimodal, de modo que el modelo puede encadenar llamadas a herramientas a partir de instrucciones que combinan imagen y texto, con el contexto de 1.048.576 tokens para mantener el estado de la tarea.
- Análisis de documentos extensos con imágenes intercaladas: informes, contratos o expedientes de cientos de páginas que incluyen figuras, tablas escaneadas y diagramas, aprovechando la ventana de contexto completa.
- Asistentes de soporte técnico con capturas de pantalla: el usuario adjunta una captura de error y el modelo razona sobre la imagen y el historial de la conversación para proponer pasos de resolución.
- Despliegue en hardware de borde NVIDIA: la conversión está dimensionada para un único DGX Spark con unos 88 GiB de pesos mapeados, lo que permite inferencia local en entornos con requisitos de privacidad o sin conectividad a la nube.
- Extracción estructurada de información de documentos mixtos: convertir facturas, albaranes o formularios con imágenes en JSON mediante function calling, integrable en pipelines de ingestión de datos.
- Evaluación e investigación de cuantización: el repositorio documenta la técnica hVQ con comparación held-out frente al profesor original y a una línea base weight-only, lo que lo hace útil como referencia metodológica para estudiar el impacto de la cuantización vectorial en modelos MoE multimodales.
- Prototipado de asistentes de accesibilidad: descripción y razonamiento sobre imágenes adjuntas en conversaciones multi-turno con contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados held-out y la validación de hardware acompañarán a los ficheros convertidos, que en el momento de la publicación no estaban subidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el objetivo declarado de la conversión es un único DGX Spark con aproximadamente 88 GiB para los pesos mapeados.
- GPU recomendadas: NVIDIA DGX Spark (objetivo de diseño). Otras GPU no están validadas en la información disponible.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; el objetivo de 88 GiB excede la VRAM de las GPU de consumo habituales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) salvo con cuantizaciones más agresivas no documentadas.
- Opciones de despliegue: formato GGUF, por lo que es compatible con el ecosistema llama.cpp; el tag `ds4-dfm-rs` sugiere soporte o relación con un runtime propio. vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Nex-N2.6-VQ-GGUF (esta ficha) | no disponible (MoE, 288 expertos/capa) | 1.048.576 | imagen-texto | Apache 2.0 | Conversión en curso, sin pesos subidos |
| Nex-N2.6 (modelo base) | no disponible | 1.048.576 | imagen-texto | Apache 2.0 | Checkpoint original en nex-agi/Nex-N2.6 |
| GLM-5.3-Flash-VQ-GGUF (referencia del autor) | no disponible | no disponible | no disponible | no disponible | Conversión previa de referencia |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La conversión está en curso: la model card registra el diseño antes de la subida de pesos. No hay ficheros GGUF publicados ni validación de hardware en el momento de la publicación.
- No hay resultados held-out publicados; el impacto real de la cuantización hVQ frente al profesor original es desconocido.
- No se especifican los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas.
- No se dispone del número de parámetros totales ni activos, lo que dificulta estimar requisitos de memoria y latencia.
- El objetivo de ~88 GiB de pesos mapeados limita el despliegue a hardware de gama alta o servidor; no hay evidencia de que quepa en GPU de consumo.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- La licencia Apache 2.0 la declara Nex AGI para el modelo base; el repositorio incluye atribución a GLM y al cuantizador. Conviene revisar los ficheros LICENSE y NOTICE antes de uso comercial.
- El repositorio no tiene descargas ni likes, y su autor no es el desarrollador original del modelo, lo que reduce la trazabilidad y el soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Baekpica/Nex-N2.6-VQ-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.6
- Checkpoint de origen citado: https://huggingface.co/nex-agi/Nex-N2.6/tree/987472298e7867721576ac49a253a6f5b526013e
- Conversión de referencia GLM-5.3-Flash-VQ-GGUF: https://huggingface.co/Baekpica/GLM-5.3-Flash-VQ-GGUF
- Licencia: https://huggingface.co/Baekpica/Nex-N2.6-VQ-GGUF/blob/main/LICENSE
- Avisos de atribución: https://huggingface.co/Baekpica/Nex-N2.6-VQ-GGUF/blob/main/NOTICE
