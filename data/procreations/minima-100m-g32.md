# ProCreations/minima-100m-g32

## Resumen

Minima W1.58A8 es un modelo de lenguaje de tipo encoder, derivado del modelo base LiquidAI/LFM2.5-Encoder-350M, que ha sido convertido a una representación ternaria de pesos (valores lógicos {-1, 0, +1}) con activaciones de 8 bits. El repositorio, publicado por ProCreations (SSH), contiene un artefacto empaquetado para ser cargado con la librería `minima` de SSHDotCodes, que implementa un formato de checkpoint compacto y un runtime de inferencia denominado I2_S. Con aproximadamente 88,67 millones de parámetros y un tamaño de repositorio de 0,1 GB, el modelo está orientado a ejecutarse en hardware de consumo, aunque no se han publicado especificaciones detalladas sobre su arquitectura interna, contexto o capacidades.

El modelo se presenta como una solución para reducir el coste computacional y de memoria de los modelos de lenguaje mediante la cuantización ternaria, manteniendo un tamaño reducido. Sin embargo, la documentación disponible es muy escasa: la model card únicamente describe el formato de almacenamiento y la forma de carga, sin ofrecer detalles sobre entrenamiento, rendimiento o casos de uso. Esto limita su evaluación objetiva y lo convierte en una opción experimental para desarrolladores interesados en técnicas de cuantización extrema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en LiquidAI/LFM2.5-Encoder-350M, detalles no disponibles |
| Parametros totales | 88.669.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria (W1.58A8): pesos en {-1, 0, +1}, activaciones de 8 bits |
| Idiomas soportados | No disponibles |
| Licencia | lfm-open-license-v1.0 (enlace al LICENSE del modelo base) |
| Formato de pesos | safetensors (empaquetado para minima, runtime I2_S) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo más allá de que parte del checkpoint de LiquidAI/LFM2.5-Encoder-350M. Dado que se trata de un encoder, es probable que sea un transformer con atención estándar, pero no hay confirmación. El proceso de entrenamiento tampoco está documentado: no se indica el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La única innovación técnica destacable es la conversión a pesos ternarios con formato compacto, que reduce drásticamente el espacio de almacenamiento y acelera la inferencia en hardware compatible con operaciones de 2 bits por peso. El archivo `minima_config.json` mencionado en la model card debería contener el tamaño de grupo, el rango de recuperación y el límite de contexto, pero no está disponible en el repositorio público.

## Capacidades

- No se han publicado capacidades específicas en la documentación disponible.
- Al ser un encoder derivado de LFM2.5, se espera que genere representaciones densas (embeddings) para texto, útiles en tareas de clasificación o búsqueda semántica, aunque esto no está confirmado.
- No hay evidencia de soporte para generación de texto, tool calling, razonamiento multi-paso o capacidades multimodales.
- El modelo está diseñado para cargarse con la librería `minima` (SSHDotCodes), que proporciona una API de inferencia específica, pero no se documenta ninguna funcionalidad adicional.

## Casos de uso

Dado que la documentación no especifica casos de uso, los siguientes son inferencias razonables basadas en el tipo de modelo (encoder pequeño y cuantizado), pero deben tomarse con cautela:

- Clasificacion de textos cortos: el modelo puede generar embeddings para alimentar clasificadores lineales en tareas como análisis de sentimiento o detección de spam, gracias a su bajo coste de inferencia.
- Busqueda semantica en entornos con recursos limitados: al ser ternario, cabe en dispositivos edge o CPUs, permitiendo indexar y recuperar documentos en aplicaciones móviles o embebidas.
- Extraccion de caracteristicas para modelos mas grandes: los embeddings generados pueden servir como entrada a modelos de mayor tamaño o a pipelines de machine learning tradicionales.
- Prototipado rapido de sistemas de NLP: su tamaño reducido permite iterar rapidamente en entornos de desarrollo sin GPU dedicada.
- Filtrado de contenido en tiempo real: su latencia potencialmente baja (aunque no medida) lo haría adecuado para moderar comentarios o mensajes en aplicaciones de chat.
- Experimentacion academica con cuantizacion ternaria: sirve como ejemplo práctico de cómo convertir un modelo existente a pesos ternarios y evaluar el impacto en calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan métricas de velocidad o latencia.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware.
- Con 88,67 millones de parámetros y pesos ternarios, el almacenamiento de pesos ocupa aproximadamente 11 MB (88,67M × 2 bits / 8 = 22,17 MB, aunque con overhead del formato compacto puede variar). La VRAM necesaria para inferencia sería inferior a 1 GB, incluyendo activaciones y buffers, por lo que cabría en cualquier GPU con 2 GB o más.
- Es probable que funcione en CPU sin problemas, dado el tamaño reducido.
- Opciones de despliegue: la librería `minima` de SSHDotCodes es la vía principal; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un encoder ternario de 88M de parámetros, sin benchmarks publicados. Modelos como MobileLLM (125M) o SmolLM (135M) son comparables en tamaño pero no en formato de cuantización ni en arquitectura (son decoders). No se puede afirmar que sean alternativas directas sin datos de rendimiento.

## Limitaciones y advertencias

- La cuantización ternaria puede degradar significativamente la calidad de las representaciones en comparación con el modelo original en punto flotante, especialmente en tareas que requieren matices semánticos finos.
- No se ha publicado ninguna evaluación de sesgos o alucinaciones; al ser un encoder, el riesgo de alucinación es menor que en modelos generativos, pero los embeddings pueden reflejar sesgos del modelo base LFM2.5.
- La licencia lfm-open-license-v1.0 pertenece a LiquidAI; es necesario revisar sus términos para uso comercial, aunque el repositorio no incluye el texto completo de la licencia.
- El modelo depende de la librería `minima`, que puede tener una comunidad pequeña y soporte limitado, lo que dificulta su integración en entornos de producción estándar.
- No hay información sobre el límite de contexto ni sobre el idioma de entrenamiento, por lo que su comportamiento fuera del inglés (u otros idiomas) es desconocido.
- La fecha de creación (agosto de 2026) y la ausencia de descargas o likes sugieren que es un proyecto muy reciente y sin validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ProCreations/minima-100m-g32
- Repositorio de la librería minima: https://github.com/SSHDotCodes/minima
- Modelo base LiquidAI/LFM2.5-Encoder-350M: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M/blob/main/LICENSE
