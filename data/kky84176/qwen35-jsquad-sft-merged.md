# kky84176/qwen35-jsquad-sft-merged

## Resumen

`kky84176/qwen35-jsquad-sft-merged` es un modelo publicado en Hugging Face por el usuario kky84176, aparentemente derivado de la familia Qwen 3.5 y ajustado mediante fine-tuning supervisado (SFT) sobre el conjunto de datos JSQuAD, según se deduce del identificador del repositorio. El modelo tiene 852.985.920 parámetros (aproximadamente 853 millones) según los pesos en formato safetensors, y está etiquetado con el pipeline `image-text-to-text`, lo que indica que acepta entradas multimodales de imagen y texto. La etiqueta `qwen3_5` sugiere que parte de un checkpoint de la familia Qwen 3.5, aunque no se especifica la variante concreta.

La relevancia de este modelo es limitada y fundamentalmente experimental: se trata de un checkpoint de investigación publicado sin model card sustantiva (la tarjeta es la plantilla automática de Hugging Face sin rellenar), sin licencia declarada, sin idiomas declarados y con cero descargas y cero likes en el momento de la consulta. El repositorio ocupa 1,7 GB, coherente con un modelo de ~853 millones de parámetros en precisión de 16 bits.

No debe confundirse con un lanzamiento oficial de Alibaba/Qwen: es una adaptación de terceros, y toda la información sobre entrenamiento, datos y evaluación está ausente. Cualquier uso en producción requiere validación propia y una revisión explícita de la licencia del modelo base del que deriva, que no se declara en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen 3.5; detalles concretos no disponibles |
| Parametros totales | 852.985.920 (~853 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura con detalle. Las etiquetas del repositorio indican `qwen3_5` e `image-text-to-text`, lo que apunta a un transformer multimodal con codificador de visión y decodificador de lenguaje, derivado de la familia Qwen 3.5. El tamaño de 853 millones de parámetros y el peso del repositorio (1,7 GB) son consistentes con un checkpoint en bf16/fp16 de ese orden de magnitud, no con un modelo de gran escala.

El sufijo `sft-merged` del identificador sugiere dos cosas: que se aplicó un ajuste supervisado (SFT) y que posteriormente se fusionaron los adaptadores (probablemente LoRA) con los pesos base para producir un checkpoint único. El segmento `jsquad` indica que el ajuste se realizó sobre JSQuAD, un conjunto de preguntas y respuestas extractivas en japonés derivado de Wikipedia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, hiperparámetros, ni si hubo etapas de RLHF o DPO. No se declara ninguna innovación técnica específica.

## Capacidades

- Generación de texto y respuesta a preguntas: el ajuste sobre JSQuAD orienta el modelo hacia tareas extractivas de QA, presumiblemente en japonés, aunque el idioma no está declarado oficialmente.
- Procesamiento multimodal imagen-texto: la etiqueta `image-text-to-text` indica que acepta imágenes junto con texto como entrada, si bien no se documenta el alcance real de esta capacidad.
- Conversación multi-turno: la etiqueta `conversational` sugiere soporte de diálogo, sin especificarse la longitud de contexto efectiva.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingües: no disponible; el único indicio es el uso de un dataset en japonés para el SFT.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Respuesta a preguntas extractivas sobre documentación en japonés: el ajuste sobre JSQuAD hace que el modelo sea candidato para prototipos de QA sobre corpus tipo Wikipedia en japonés, extrayendo respuestas de pasajes de contexto. Requiere validación empírica porque no hay métricas publicadas.
- Experimentación académica con fine-tuning multimodal: al ser un checkpoint pequeño (~853 M) y con pesos safetensors, sirve como base para reproducir pipelines de SFT y fusión de adaptadores en entornos con recursos limitados.
- Prototipado de asistentes conversacionales de bajo coste: su tamaño permite desplegarlo en una única GPU de consumo para pruebas de concepto de diálogo, siempre que se valide la calidad real.
- Investigación sobre adaptación de modelos Qwen a dominios lingüísticos específicos: el repositorio documenta implícitamente un flujo de SFT sobre un dataset japonés que puede servir de referencia metodológica.
- Evaluación comparativa de checkpoints derivados: útil para estudiar cómo afecta el SFT y la fusión de adaptadores a un modelo base de la familia Qwen 3.5 en tareas de QA.
- Pruebas de pipelines multimodales en local: la etiqueta image-text-to-text permite experimentar con entradas de imagen y texto en un modelo de menos de mil millones de parámetros, adecuado para entornos de desarrollo sin clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y del codificador visual; en la práctica, entre 3 y 5 GB para contexto corto. En cuantización de 8 bits, alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5 GB (aunque no se publican versiones GGUF oficiales y habría que generarlas).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más en bf16, y en tarjetas de 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura concreta y requerirían verificación. Para cuantización habría que convertir los pesos a GGUF manualmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kky84176/qwen35-jsquad-sft-merged | ~853 M | no disponible | Sí (image-text-to-text) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B-Instruct (referencia de familia) | ~3,75 B | 32 K (referencia) | Sí | Apache 2.0 (referencia) | Hugging Face, ampliamente usado |
| SmolVLM-500M-Instruct (referencia) | ~500 M | 8 K (referencia) | Sí | Apache 2.0 (referencia) | Hugging Face, ampliamente usado |

La comparación es orientativa: los datos de los modelos de referencia provienen de sus fichas públicas y no de la información proporcionada para este modelo. El checkpoint analizado carece de licencia declarada, de métricas y de documentación, lo que lo sitúa en una categoría de madurez muy inferior a las alternativas citadas.

## Limitaciones y advertencias

- Model card vacía: la tarjeta es la plantilla automática de Hugging Face sin completar; no hay información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido. Al derivar presumiblemente de Qwen 3.5, habría que verificar la licencia del modelo base, que tampoco se indica.
- Riesgo de alucinación: sin benchmarks ni evaluación publicada, no hay evidencia de fiabilidad; en un modelo de 853 M ajustado sobre QA extractiva, la tendencia a generar respuestas plausibles pero incorrectas es un riesgo real.
- Sesgos desconocidos: al no documentarse la composición del dataset de SFT ni del preentrenamiento, no es posible evaluar sesgos lingüísticos, culturales o de género.
- Idiomas no declarados: aunque el dataset JSQuAD es japonés, no se garantiza un rendimiento multilingüe ni siquiera un buen rendimiento en japonés sin evaluación propia.
- Contexto desconocido: se desconoce la ventana de contexto efectiva, lo que impide planificar casos de uso con documentos largos.
- Madurez del repositorio: cero descargas y cero likes, sin issues ni discusión pública; no hay comunidad que haya validado el checkpoint.
- Uso en producción no recomendado sin auditoría previa: falta de licencia, de evaluación y de soporte lo desaconsejan para entornos críticos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kky84176/qwen35-jsquad-sft-merged
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos específicos de este modelo.
