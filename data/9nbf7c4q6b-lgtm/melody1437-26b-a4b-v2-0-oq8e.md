# 9nbf7c4q6b-lgtm/Melody1437-26B-A4B-v2.0-oQ8e

## Resumen

Melody1437-26B-A4B-v2.0-oQ8e es una versión cuantizada a 8 bits del modelo Melody1437-26B-A4B-v2.0, un ajuste fino (fine-tune) del modelo base Gemma 4 26B A4B de Google. La cuantización ha sido realizada por el usuario 9nbf7c4q6b-lgtm utilizando la herramienta oQ (oMLX v0.6.1) con precisión mixta, y el resultado se distribuye en formato MLX safetensors, pensado para su ejecución en hardware Apple Silicon. El modelo base es una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos, aunque el archivo safetensors de esta versión cuantizada reporta 7.097.324.574 parámetros, una discrepancia que no está explicada en la documentación disponible. La relevancia de esta ficha radica en que ofrece una alternativa optimizada en tamaño para desplegar el modelo en entornos con recursos limitados, aunque carece de información sobre rendimiento y licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (mezcla de expertos, MoE) |
| Parametros totales | 7.097.324.574 (según safetensors); el nombre sugiere 26B totales |
| Parametros activos | no disponible (el nombre sugiere 4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64, precision mixta (oQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base, Gemma 4 26B A4B, emplea una arquitectura de mezcla de expertos con 26 mil millones de parámetros totales y 4 mil millones activos por token. No se dispone de información detallada sobre el proceso de entrenamiento del ajuste fino Melody1437-26B-A4B-v2.0 (datos utilizados, número de tokens, técnicas de alineación como RLHF o DPO). La cuantización aplicada en esta versión utiliza oQ de oMLX v0.6.1, que realiza una cuantización de precisión mixta a 8 bits con un tamaño de grupo de 64. No se han documentado innovaciones técnicas adicionales en la cuantización más allá de la propia herramienta.

## Capacidades

- No se han documentado capacidades específicas para esta versión cuantizada.
- Al estar basado en Gemma 4 26B A4B, es razonable esperar capacidades de generación de texto, razonamiento, código y matemáticas, así como soporte multilingüe, pero no hay confirmación oficial en la información disponible.
- No se menciona soporte para tool calling, agentes, visión ni audio en la documentación consultada.

## Casos de uso

- No se han documentado casos de uso específicos para este modelo.
- Dado su tamaño y arquitectura, podría emplearse en tareas de generación de texto y razonamiento en entornos Apple Silicon, pero sin datos concretos sobre su comportamiento real, cualquier aplicación debe considerarse experimental.
- La cuantización a 8 bits reduce los requisitos de memoria, lo que podría facilitar su uso en portátiles Mac con suficiente RAM unificada, aunque no se especifican cifras exactas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 26,8 GB, lo que indica que la carga completa del modelo requiere al menos esa cantidad de memoria disponible.
- Formato MLX: exclusivo para Apple Silicon (Mac con chip M1 o superior).
- Se recomienda un Mac con al menos 32 GB de RAM unificada para cargar el modelo y dejar margen para el sistema y el contexto de inferencia.
- No se dispone de datos sobre latencia o throughput.
- Opciones de despliegue: al ser MLX, se puede ejecutar con la librería mlx (https://github.com/ml-explore/mlx) o herramientas compatibles como oMLX. No es compatible directamente con vLLM, llama.cpp u Ollama en su formato actual.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base Gemma 4 26B A4B es su referencia natural, pero no se han publicado métricas comparativas en la documentación consultada.

## Limitaciones y advertencias

- No se ha especificado la licencia, por lo que se desconoce si permite uso comercial o modificación.
- La cuantización a 8 bits puede introducir pérdida de precisión respecto al modelo original.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- La discrepancia entre el nombre del modelo (26B-A4B) y el número de parámetros reportado en safetensors (7,1B) no está aclarada y puede indicar que el archivo contiene solo una parte de los pesos o que la cuantización ha reducido la representación.
- Al ser un formato MLX, su uso queda restringido a hardware Apple Silicon, lo que limita su portabilidad a otros entornos.

## Enlaces

- Repositorio HuggingFace de esta versión: https://huggingface.co/9nbf7c4q6b-lgtm/Melody1437-26B-A4B-v2.0-oQ8e
- Modelo original (sin cuantizar): https://huggingface.co/ReadyArt/Melody1437-26B-A4B-v2.0
- Versión GGUF del mismo modelo: https://huggingface.co/ReadyArt/Melody1437-26B-A4B-v2.0-GGUF
- Información sobre el LoRA asociado: https://llms.info/models/readyart-melody1437-26b-a4b-lora-758
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
