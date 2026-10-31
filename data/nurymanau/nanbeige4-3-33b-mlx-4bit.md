# Nurymanau/Nanbeige4.3-33B-MLX-4bit

## Resumen

Nanbeige4.3-33B-MLX-4bit es una conversión no oficial a 4 bits, en formato MLX, del modelo Nanbeige4.3-33B desarrollado por Nanbeige LLM Lab. La conversión ha sido publicada en Hugging Face por el usuario Nurymanau y está pensada para ejecutarse de forma nativa en ordenadores Apple Silicon mediante el framework MLX de Apple.

El modelo base es un LLM de 33.118.977.024 parámetros con arquitectura LlamaForCausalLM (arquitectura tipo Llama), entrenado originalmente en BF16 y orientado a generación de texto conversacional en inglés y chino. La versión cuantizada reduce los pesos a 4 bits con tamaño de grupo 64, lo que sitúa el tamaño de los ficheros de pesos en torno a 18,6 GB, frente a los aproximadamente 66 GB que ocuparía el modelo en BF16.

La relevancia de esta conversión radica en que hace accesible un modelo de 33B en hardware de consumo de Apple (Macs con 32 GB de memoria unificada o más), algo inviable con los pesos originales. Cabe destacar que el autor indica explícitamente que no ha probado la generación completa del modelo, por lo que se trata de una conversión validada a nivel de tensores pero sin mediciones de calidad de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer tipo Llama) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

Datos adicionales: dtype original BF16, tamano del repo 18,7 GB (18,631 GB de pesos sin tokenizador ni memoria en ejecucion), conversion realizada con mlx 0.32.3 y verificada contra mlx-lm 0.32.0.

## Arquitectura y entrenamiento

La arquitectura es LlamaForCausalLM, es decir, un transformer decoder-only siguiendo el diseno de la familia Llama. No se trata de un modelo MoE: los 33 mil millones de parametros estan activos en cada pasada. Sobre el modelo base, Nanbeige4.3-33B, no se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de tecnicas de alineacion como RLHF o DPO.

En cuanto a la innovacion tecnica, esta en la conversion en si: se trata de una cuantizacion afina de 4 bits con group size 64 mediante MLX, con un proceso de validacion riguroso. El autor verifico los shards de origen contra los SHA256 del repositorio upstream, fijo la revision concreta del modelo base, comprobo la equivalencia con el cuantizador oficial de mlx-lm sobre un Llama sintetico de dos capas (los 53 tensores coinciden exactamente), audito de forma independiente cada fichero, cabecera, forma, dtype e indice, y desempaqueto las dos primeras filas de las 366 matrices cuantizadas con NumPy para compararlas contra las filas BF16 originales. Las normas y los metadatos del tokenizador se conservan de forma exacta, y la plantilla de chat original se copia byte a byte.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta conversational).
- Soporte bilingue: ingles y chino.
- Plantilla de chat con modo de razonamiento configurable: opciones `enable_thinking` y `preserve_thinking` en el chat template original.
- Formato de tool calls en XML/JSON segun la plantilla upstream (aunque la integracion con parsers de herramientas y frameworks de agentes no ha sido probada por el autor de la conversion).
- Ejecucion nativa en Apple Silicon mediante MLX y mlx-lm, sin codigo Python remoto ni arquitecturas personalizadas.

No hay informacion verificada sobre capacidades de vision, audio ni rendimiento en codigo o matematicas para esta conversion concreta.

## Casos de uso

- Chatbots y asistentes conversacionales en Mac: el modelo puede ejecutarse localmente en Apple Silicon con 32 GB de memoria unificada, lo que permite desplegar asistentes privados sin enviar datos a la nube.
- Procesamiento bilingue ingles-chino: al ser el entrenamiento del modelo base en ambos idiomas, es adecuado para traduccion, redaccion y analisis de documentos en chino e ingles.
- Experimentacion con modos de razonamiento: la plantilla soporta `enable_thinking`, util para comparar respuestas con y sin cadena de razonamiento en flujos de trabajo de investigacion.
- Prototipado de tool calling en local: el formato XML/JSON de la plantilla permite explorar integraciones de herramientas, aunque conviene validar los parsers antes de usarlo en produccion.
- Inferencia privada en entornos sensibles: al correr completamente en local con MLX, es viable en sectores con requisitos de confidencialidad (legal, sanitario, interno corporativo).
- Desarrollo y pruebas de cuantizaciones: el repositorio incluye `VALIDATION.json`, `CONVERSION.json`, `SHA256SUMS` y el codigo de conversion en `conversion/`, util como referencia para auditar conversiones MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion. El propio autor indica que los benchmarks publicados en la model card del modelo original pertenecen a los autores upstream y no fueron reejecutados para esta version MLX. Tampoco se han medido calidad de generacion, throughput, longitud de contexto efectiva ni paridad completa con el modelo original.

## Requisitos de hardware

- Los ficheros de pesos superan por si solos los 16 GB (18,631 GB), a los que hay que sumar runtime, KV cache, longitud de contexto y otras aplicaciones.
- Un Mac Apple Silicon con 32 GB de memoria o mas es un punto de partida razonable, segun el propio autor, que aclara que no es una garantia medida de hardware.
- Contextos largos pueden requerir sustancialmente mas memoria.
- No apto para la mayoria de GPUs de consumo NVIDIA en este formato: el formato MLX esta orientado a Apple Silicon.
- Despliegue mediante mlx-lm 0.32.0 y mlx 0.32.3 (linea de comandos con `mlx_lm.generate` o API Python con `mlx_lm.load` y `mlx_lm.generate`).
- No se dispone de latencias ni throughput medidos; el autor no publica cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-4bit | 33,1B | 4-bit (group 64) | MLX/safetensors | Apache 2.0 | no disponible |
| Nanbeige/Nanbeige4.3-33B (original) | 33,1B | BF16 | safetensors | Apache 2.0 | no disponible |
| Llama 3.1 8B (referencia de tamano inferior) | 8B | multiples (GGUF, MLX) | safetensors/GGUF | Licencia Llama 3.1 | 128K |
| Qwen2.5-32B (referencia de tamano similar) | 32,5B | multiples (GGUF, MLX) | safetensors/GGUF | Apache 2.0 | 128K |

Comparado con Qwen2.5-32B, de tamano y licencia similares, Nanbeige4.3-33B comparte arquitectura tipo Llama y enfoque bilingue ingles-chino, pero esta conversion carece de datos de contexto publicados y de benchmarks verificados para la version 4-bit. La ventaja diferencial es la validacion exhaustiva de la conversion y el modo de razonamiento configurable en la plantilla de chat.

## Limitaciones y advertencias

- La generacion completa del modelo no ha sido probada por el autor de la conversion: no hay mediciones de calidad, throughput, longitud de contexto ni paridad con el modelo original.
- La cuantizacion a 4 bits puede alterar las salidas y degradar la calidad respecto al modelo BF16 original.
- Se trata de una conversion no oficial; el modelo oficial es Nanbeige/Nanbeige4.3-33B.
- La integracion en ejecucion con parsers de tool calls, frameworks de agentes y contextos largos no ha sido testeada.
- No se dispone de longitud de contexto documentada, lo que dificulta planificar cargas con documentos extensos.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Requiere al menos 32 GB de memoria unificada en Apple Silicon, lo que excluye a la mayoria de Macs de 8-16 GB.
- La licencia Apache 2.0 permite uso comercial, pero los benchmarks de la model card upstream pertenecen a los autores originales y no han sido verificados de forma independiente en esta version.
- Existe el riesgo habitual de alucinacion en LLMs, agravado por la ausencia de evaluaciones publicadas para esta cuantizacion concreta.

## Enlaces

- Modelo cuantizado: https://huggingface.co/Nurymanau/Nanbeige4.3-33B-MLX-4bit
- Modelo base oficial: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Revision fijada del modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/tree/c1093c501cc6460427c0ac634db7223d0450c0ee
- Codigo fuente y guia de reproduccion en GitHub: https://github.com/Obscyra-app/nanbeige4.3-33b-mlx
