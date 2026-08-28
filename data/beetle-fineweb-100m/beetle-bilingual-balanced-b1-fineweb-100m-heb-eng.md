# Beetle-FineWeb-100M/beetle-bilingual-balanced-b1-fineweb-100m-heb-eng

## Resumen

El modelo `beetle-bilingual-balanced-b1-fineweb-100m-heb-eng` es un modelo de generación de texto publicado en HuggingFace por el usuario `Beetle-FineWeb-100M`. Según su nombre, está diseñado para ser bilingüe en hebreo e inglés, con una arquitectura tipo `pico_decoder` (un decoder pequeño) y un total de 193.804.032 parámetros. Sin embargo, la model card es autogenerada y no contiene información sustancial sobre su desarrollo, entrenamiento o capacidades.

Este modelo forma parte de una familia de variantes bilingües (también se encuentran versiones para griego, filipino y neerlandés) que parecen haber sido entrenadas sobre el dataset FineWeb. A pesar de su tamaño reducido, el repositorio ocupa 39.5 GB, lo que sugiere la presencia de múltiples archivos de pesos o checkpoints. La relevancia actual es limitada debido a la ausencia de documentación técnica y de resultados de evaluación públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pico_decoder (decoder transformer, sin más detalles) |
| Parametros totales | 193.804.032 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere hebreo e inglés, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados o las técnicas de optimización. El tag `pico_decoder` sugiere un decoder transformer de tamaño pequeño, pero no se especifican detalles como el número de capas, cabezas de atención, función de activación o método de preentrenamiento. Tampoco se indica si se aplicó RLHF, DPO u otro ajuste fino. La model card menciona el paper de Lacoste et al. (2019) sobre estimación de emisiones, pero no hay datos concretos sobre el entrenamiento.

## Capacidades

- Generación de texto: al ser un modelo de tipo decoder, se espera que pueda generar texto, pero no hay demostraciones ni ejemplos.
- Bilingüismo: el nombre sugiere soporte para hebreo e inglés, pero no se ha verificado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio u otras funcionalidades especiales.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado su tamaño reducido y la falta de información, no es posible recomendar aplicaciones concretas con garantías. Cualquier uso debería basarse en pruebas propias y en la validación de su comportamiento real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

No se proporcionan requisitos oficiales. Como orientación general para un modelo de ~194M parámetros:

- VRAM estimada: en fp32 (~775 MB), en fp16 (~388 MB), en int8 (~194 MB). Sin embargo, el tamaño del repositorio (39.5 GB) sugiere que puede haber múltiples versiones o archivos adicionales, por lo que la carga real podría variar.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM podría ejecutar el modelo en fp16, pero no hay datos de latencia o throughput.
- Opciones de despliegue: al ser un modelo de transformers, podría usarse con bibliotecas como HuggingFace Transformers, vLLM, llama.cpp u Ollama, pero no hay confirmación de compatibilidad.
- No se dispone de mediciones de rendimiento.

## Comparativa con modelos similares

Existen otras variantes de la misma familia publicadas por el mismo autor, como `beetle-bilingual-balanced-b1-fineweb-100m-ell-eng` (griego-inglés), `beetle-bilingual-balanced-b1-fineweb-100m-fil-eng` (filipino-inglés) y `beetle-bilingual-balanced-b1-fineweb-100m-nld-eng` (neerlandés-inglés). Todas comparten el mismo patrón de nombre y probablemente la misma arquitectura y tamaño, pero no se dispone de especificaciones detalladas de ninguna de ellas. No se conocen modelos comparables de otros desarrolladores con características documentadas.

## Limitaciones y advertencias

- La model card está completamente vacía de información técnica, lo que impide conocer sesgos, riesgos o limitaciones específicas.
- No hay evidencia de evaluación de seguridad, alucinaciones o comportamiento en dominios especializados.
- La licencia no está especificada, por lo que el uso comercial es incierto y requiere consultar al autor.
- El tamaño del repositorio (39.5 GB) es desproporcionado para 194M parámetros, lo que podría indicar archivos duplicados o datos adicionales no documentados.
- No se recomienda su uso en producción sin una validación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Beetle-FineWeb-100M/beetle-bilingual-balanced-b1-fineweb-100m-heb-eng
- Variante griego-inglés: https://huggingface.co/Beetle-FineWeb-100M/beetle-bilingual-balanced-b1-fineweb-100m-ell-eng-1xa100
- Variante filipino-inglés: https://huggingface.co/Beetle-FineWeb-100M/beetle-bilingual-balanced-b1-fineweb-100m-fil-eng/tree/main
- Repositorio GitHub de una variante neerlandés-inglés: https://github.com/Damacol/beetle-fineweb-beetle-bilingual-balanced-b1-fineweb-nld-eng
