# groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-5bpw

## Resumen

Esta ficha describe una cuantizacion EXL3 de 5 bits del modelo `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicada por el usuario `groxaxo`. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a inferencia eficiente con ExLlamaV3. El modelo base, a su vez, es una variante derivada de `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`, segun la ascendencia declarada en la model card. La nomenclatura mezcla referencias a DeepSeek y Qwen, lo que sugiere una fusion o destilacion de modelos, aunque la informacion disponible no detalla el proceso.

El repositorio contiene 3.912.945.024 parametros reales segun los tensores en safetensors, muy por debajo de los 9B que sugiere el nombre. El tamano total del repositorio es de 7,8 GB, coherente con una cuantizacion no uniforme de 5 bits en los pesos lineales principales, 6 bits en la cabeza de salida y en el vision tower, 4 bits en las capas MTP y embeddings en BF16. La licencia declarada es Apache-2.0, heredada del modelo fuente.

La relevancia de esta publicacion es limitada pero concreta: ofrece una version cuantizada para despliegue local con ExLlamaV3 o TabbyAPI, con un consumo de VRAM reducido respecto a los pesos originales. No hay descargas ni likes registrados en el momento de la consulta, y no se han publicado resultados de benchmarks propios. Las afirmaciones sobre entrenamiento y rendimiento del modelo base son responsabilidad del autor original y no han sido verificadas por esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, segun tags); detalles no disponibles |
| Parametros totales | 3.912.945.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card indica que la cuantizacion no altera el limite configurado del modelo base, pero no especifica el valor) |
| Tipos de cuantizacion | EXL3 5 bpw en pesos lineales principales; 6 bits en cabeza de salida y vision tower; 4 bits en capas MTP; embeddings en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (ExLlamaV3 / EXL3) |

## Arquitectura y entrenamiento

La arquitectura del modelo base no se detalla en la informacion disponible mas alla de la etiqueta `qwen3_5`, que apunta a una familia transformer de Qwen. La presencia de un vision tower y de capas MTP (multi-token prediction) en la configuracion de cuantizacion indica que el modelo base incorpora componentes multimodales y de prediccion multi-token, aunque no se especifica su estructura interna, numero de capas, dimensiones ocultas ni mecanismo de atencion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o destilacion. La model card del repositorio cuantizado remite explicitamente a la model card upstream (`UPSTREAM_README.md`) para las afirmaciones de entrenamiento, y advierte que estas son afirmaciones del autor original no verificadas por la conversion. La unica innovacion tecnica documentada en este repositorio es el propio proceso de cuantizacion EXL3 con el conversor 1.6.6, codebook `mul1`, calibracion con un corpus empaquetado de 250 filas x 2048 tokens y escalas de salida automaticas.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado `text-generation` y `conversational`.
- Procesamiento de vision: la configuracion de cuantizacion incluye un vision tower a 6 bits, lo que implica capacidad multimodal de entrada de imagen.
- Prediccion multi-token (MTP): las capas MTP se conservan cuantizadas a 4 bits, lo que sugiere decodificacion especulativa o generacion multi-token en el modelo base.
- Soporte de plantilla de chat: se preserva la plantilla original del modelo upstream.
- Capacidades de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo thinking o razonamiento explicito: no disponible.

## Casos de uso

- Despliegue local de generacion de texto con ExLlamaV3: el formato EXL3 y el tamano de 7,8 GB permiten cargar el modelo en GPUs de consumo con suficiente VRAM, usando TabbyAPI como backend compatible para servir una API de chat.
- Prototipado de asistentes conversacionales: la preservacion de la plantilla de chat original facilita integrar el modelo en interfaces tipo chatbot sin reentrenamiento.
- Pruebas de inferencia multimodal en local: la presencia del vision tower cuantizado a 6 bits permite experimentar con entrada de imagenes, aunque la model card advierte que el smoke test no valida el vision tower.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye `conversion.json` con checksums de tensores y argumentos reproducibles del conversor, util para investigadores que comparan calidad de cuantizacion a 5 bpw frente a los pesos originales.
- Generacion de texto sin restricciones de contenido (uncensored): el nombre del modelo base indica un ajuste orientado a reducir rechazos, adecuado para entornos de investigacion controlados y no para produccion con usuarios finales.
- Experimentacion con decodificacion multi-token: las capas MTP conservadas permiten probar estrategias de generacion especulativa en el backend ExLlamaV3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona comprobaciones deterministicas cortas de generacion de texto (`smoke-test.json`) que, segun el propio autor, no constituyen un benchmark de codigo ni validan la ventana de contexto completa, el vision tower ni las capas MTP.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 7,8 GB en disco; en VRAM hay que sumar el KV cache, que depende de la longitud de contexto y de la precision configurada (Q8 en las pruebas locales del autor). Con contexto corto, la carga completa deberia situarse en torno a 8-10 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponibles de forma explicita. Por tamano, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberian ser suficientes para contexto moderado; GPUs profesionales como A100 o H100 no son necesarias por capacidad, pero pueden usarse para mayor throughput.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 12-16 GB o mas, siempre que se ajuste el contexto y la precision del KV cache.
- Opciones de despliegue: ExLlamaV3 1.6.6 o backend compatible como TabbyAPI. No se mencionan llama.cpp, Ollama, vLLM ni TGI para este formato EXL3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EXL3 5 bpw) | 3.912.945.024 | no disponible | Apache-2.0 | safetensors EXL3 | Hugging Face, 0 descargas |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | no disponible (nombre sugiere 9B) | no disponible | Apache-2.0 | safetensors (original) | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El nombre del modelo sugiere 9B parametros, pero los tensores reales suman 3.912.945.024; conviene verificar la arquitectura antes de asumir capacidades asociadas al nombre.
- La model card advierte que las afirmaciones de entrenamiento, destilacion y rendimiento del modelo upstream no han sido verificadas por esta conversion.
- El smoke test no valida la ventana de contexto completa, el vision tower ni las capas MTP; su alcance es limitado.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinacion.
- El calificativo `UNCENSORED` implica un ajuste que reduce los rechazos de contenido; esto supone un riesgo para uso en produccion con usuarios finales y requiere moderacion externa.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo fuente y debe verificarse la cadena completa de atribucion.
- El formato EXL3 limita el despliegue a ExLlamaV3 y backends compatibles; no es portable a llama.cpp, Ollama o vLLM sin reconversion.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/groxaxo/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-EXL3-5bpw
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Revision del modelo base citada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic/tree/e4bfa83c72896cbb4990c909967d6f27bb97bac4
- Ascendencia declarada: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
