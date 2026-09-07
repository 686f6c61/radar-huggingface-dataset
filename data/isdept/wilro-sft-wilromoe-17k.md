# ISdept/wilro-sft-wilromoe-17k

## Resumen

El modelo ISdept/wilro-sft-wilromoe-17k es un modelo de lenguaje desarrollado por ISdept y publicado en Hugging Face. Según la información disponible, cuenta con aproximadamente 1.109 millones de parámetros (1.109.100.305) y sus pesos están almacenados en formato safetensors. El nombre del repositorio sugiere que se trata de un ajuste fino supervisado (SFT) de una arquitectura de mezcla de expertos (MoE), aunque no hay documentación que lo confirme.

No se dispone de información pública sobre el contexto, los idiomas soportados, la licencia ni los datos de entrenamiento. El repositorio tiene un tamaño de 8,7 GB, lo que resulta elevado para un modelo de 1.100 millones de parámetros, lo que podría indicar la presencia de múltiples archivos de pesos o formatos. Este modelo es relevante por su tamaño compacto, que lo hace adecuado para entornos con recursos limitados, pero su evaluación requiere más datos que los publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere mezcla de expertos, sin confirmar) |
| Parametros totales | 1.109.100.305 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información oficial sobre la arquitectura ni el proceso de entrenamiento. El nombre del repositorio incluye «sft» y «wilromoe», lo que sugiere que el modelo es un ajuste fino supervisado de una variante de mezcla de expertos (MoE) de la familia Wilro. Sin embargo, no se dispone de datos sobre el número de expertos, parámetros activos, composición del dataset, número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. El único dato técnico confirmado es el número de parámetros totales (1.109.100.305) y que los pesos están en formato safetensors.

## Capacidades

- No disponible: no se ha publicado información sobre capacidades de generación de texto, razonamiento, código o matemáticas.
- No disponible: no se ha confirmado soporte de tool calling / function calling.
- No disponible: no se ha confirmado soporte de agentes o razonamiento multi-paso.
- No disponible: no se ha confirmado soporte multilingüe.
- No disponible: no se ha confirmado ninguna capacidad especial (visión, audio, modo de pensamiento, etc.).

## Casos de uso

- No disponible: no se han publicado casos de uso oficiales ni validaciones.
- No disponible: sin datos de rendimiento, no es posible evaluar su idoneidad para atención al cliente automatizada.
- No disponible: sin confirmación de capacidades de código, no se puede recomendar para generación de código en producción.
- No disponible: sin datos sobre ventana de contexto, no se puede evaluar para análisis de documentos largos.
- No disponible: sin información sobre tool calling, no se puede usar en pipelines de agentes.
- No disponible: sin licencia explícita, no se recomienda su uso en aplicaciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en 1.109.100.305 parámetros): en FP32 los pesos ocupan aproximadamente 4,4 GB; en FP16/BF16, aproximadamente 2,2 GB; en INT8, alrededor de 1,1 GB; en 4 bits, cerca de 0,6 GB. Estas cifras no incluyen memoria para activaciones ni overhead del runtime.
- GPU recomendadas: una GPU con 6 GB de VRAM es suficiente para FP16; una con 4 GB puede ejecutar cuantización de 8 bits. Para FP32 se recomienda una GPU con 8 GB o más, por ejemplo RTX 3060 12GB, RTX 4060 8GB, A100 o H100.
- ¿Cabe en GPU de consumo? Sí, según el tamaño de parámetros, debería caber en la mayoría de GPUs de consumo modernas (RTX 3060, 4060, 4070), siempre que se use una cuantización adecuada.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, puede cargarse con Transformers (PyTorch). También podría convertirse a GGUF para usar con llama.cpp u Ollama, o desplegarse con vLLM o TGI, aunque no hay documentación específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado resultados de benchmarks ni especificaciones comparables. El único modelo relacionado encontrado es ISdept/Wilro-base, del que tampoco se dispone de información detallada.

## Limitaciones y advertencias

- Licencia no disponible: el uso comercial, la redistribución y las modificaciones no están claramente definidas.
- Sesgos conocidos: no se han evaluado.
- Riesgo de alucinación: no se ha medido.
- Limitaciones de contexto o idioma: desconocidas.
- Restricciones de licencia: sin licencia explícita, no es seguro usar el modelo en producción.
- Falta de documentación: no hay información sobre el entrenamiento ni las capacidades, lo que dificulta su evaluación.

## Enlaces

- [Hugging Face: ISdept/wilro-sft-wilromoe-17k](https://huggingface.co/ISdept/wilro-sft-wilromoe-17k)
- [Hugging Face: ISdept/Wilro-base](https://huggingface.co/ISdept/Wilro-base)
