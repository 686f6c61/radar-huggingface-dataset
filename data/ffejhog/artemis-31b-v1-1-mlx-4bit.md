# ffejhog/Artemis-31B-v1.1-mlx-4Bit

## Resumen

ffejhog/Artemis-31B-v1.1-mlx-4Bit es una conversión al formato MLX (Apple Silicon) del modelo base TheDrummer/Artemis-31B-v1.1, realizada por el usuario ffejhog. El modelo se presenta en cuantización de 4 bits, con un total de 30.697.345.280 parámetros y un tamaño de repositorio de 17,3 GB. Esta conversión permite ejecutar un modelo de 31B en dispositivos Apple mediante la librería mlx-lm, reduciendo significativamente el consumo de memoria gracias a la cuantización.

No se dispone en la información proporcionada de datos sobre la arquitectura interna, la longitud de contexto, los idiomas soportados, la licencia ni las capacidades específicas del modelo base. Los tags de HuggingFace incluyen la etiqueta "gemma4", lo que podría sugerir una relación con la familia Gemma, pero no es un dato confirmado. La ficha se limita a los datos verificables de la conversión y del repositorio.

Este modelo es relevante para desarrolladores e investigadores que trabajan en entornos Apple Silicon y necesitan ejecutar un modelo de 31B de forma local con cuantización 4-bit. Sin embargo, al tratarse de una conversión sin documentación adicional, su utilidad práctica depende de las características del modelo base, que no están disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se ha proporcionado información sobre la arquitectura del modelo base TheDrummer/Artemis-31B-v1.1. En los datos disponibles solo se indica que se trata de una conversión a formato MLX realizada con mlx-lm versión 0.31.2. Los tags de HuggingFace incluyen "gemma4", pero no hay confirmación de que el modelo esté basado en la arquitectura Gemma. Tampoco se dispone de datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Cualquier afirmación sobre la arquitectura o el proceso de entrenamiento sería especulativa.

## Capacidades

- No se dispone de información detallada sobre las capacidades del modelo base en los datos proporcionados.
- Al ser una conversión MLX, se espera que conserve las capacidades del modelo original, pero estas no están documentadas.
- No se ha confirmado el soporte de tool calling, function calling, visión, audio ni modos de razonamiento especiales.
- La única funcionalidad documentada es su uso mediante mlx-lm para generación de texto, tal como se muestra en el README de la conversión.

## Casos de uso

No se dispone de información suficiente para enumerar casos de uso concretos y realistas. La única aplicación documentada es la ejecución local del modelo en dispositivos Apple Silicon mediante MLX, aprovechando la cuantización 4-bit para reducir el uso de memoria. Sin datos sobre las capacidades del modelo base, no es posible especificar escenarios prácticos sin incurrir en especulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~17,3 GB para los pesos en 4-bit, más overhead de activaciones y caché KV. En Apple Silicon, se recomienda un dispositivo con al menos 24 GB de memoria unificada para un margen razonable.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. No se especifican GPUs NVIDIA ni AMD para este formato.
- ¿Cabe en consumer GPU? No aplica directamente, ya que el formato MLX está orientado a Apple Silicon. No hay datos sobre ejecución en GPUs convencionales.
- Opciones de despliegue: mlx-lm, MLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. Existe otra conversión con el mismo nombre y cuantización, ailexleon/Artemis-31B-v1.1-mlx-4Bit, que es funcionalmente equivalente (mismos parámetros, misma cuantización, mismo modelo base), pero no se han publicado benchmarks ni especificaciones de rendimiento que permitan una comparación técnica.

| Modelo | Parametros | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|
| ffejhog/Artemis-31B-v1.1-mlx-4Bit | 30.697.345.280 | 4-bit | MLX (safetensors) | no disponible |
| ailexleon/Artemis-31B-v1.1-mlx-4Bit | 30.697.345.280 | 4-bit | MLX (safetensors) | no disponible |

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, riesgos de alucinación ni limitaciones de contexto o idioma.
- La licencia no está especificada, por lo que el uso comercial no está garantizado y requiere verificación con el autor del modelo base.
- Al ser una conversión no oficial, no hay garantía de fidelidad total al modelo original ni de soporte técnico.
- La ausencia de documentación sobre el modelo base impide evaluar su idoneidad para tareas concretas.
- El formato MLX limita su despliegue a entornos Apple Silicon, sin soporte documentado para otras plataformas.

## Enlaces

- HuggingFace: https://huggingface.co/ffejhog/Artemis-31B-v1.1-mlx-4Bit
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.1
- Conversión similar de ailexleon: https://huggingface.co/ailexleon/Artemis-31B-v1.1-mlx-4Bit
