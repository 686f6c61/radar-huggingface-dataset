# Mspanz88/playground-lm-onnx

## Resumen

PlaygroundLM ONNX es una publicación de artefactos de inferencia en formato ONNX para el modelo PlaygroundLM, un modelo de lenguaje entrenado desde cero por el usuario Mspanz88. El repositorio contiene pesos cuantizados en q8 (esquema MatMulNBits con bloque de 32) junto con operaciones Gather cuantizadas, y está pensado como candidato a publicación local y ejecución en navegador mediante ONNX Runtime Web. No se trata de un modelo base publicado por un laboratorio consolidado, sino de una conversión a ONNX de un modelo propio cuyo entrenamiento y arquitectura no se documentan en la model card.

El interés técnico del repositorio reside en el pipeline de exportación y cuantización, no en unas capacidades de modelado demostradas: el autor verifica ejecución en CPU de ONNX hasta contexto 1024, con longitudes de texto variables, batch size 2 y comprobaciones de logits finitos sobre el vocabulario completo. También compara seis generaciones greedy de 16 tokens contra PyTorch, de las cuales cuatro coinciden exactamente y dos divergen por la cuantización con pérdida.

La relevancia es limitada y experimental: el repositorio tiene 0 descargas y 0 likes, la licencia no está disponible, el soporte de navegador sigue pendiente de verificación y el propio autor advierte que la cercanía numérica no demuestra calidad de tarea ni compatibilidad con navegador. Es útil como referencia para quienes trabajen en exportación ONNX de modelos pequeños con cuantización q8 y tokenizador GPT-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje tipo transformer, entrenado desde cero; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 1024 tokens verificados en ejecución CPU ONNX |
| Tipos de cuantizacion | q8 con MatMulNBits block32 y Gather cuantizado (weight-only) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | ONNX (model.q8.onnx; el exportador lo nombra internamente model.int8.onnx) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base: la model card no especifica número de capas, dimensión oculta, número de cabezas, vocabulario ni composición del dataset de entrenamiento. Lo único documentado es que PlaygroundLM fue entrenado desde cero y que esta publicación contiene únicamente los artefactos de inferencia convertidos a ONNX.

El trabajo técnico destacable está en la exportación: los pesos se han cuantizado en q8 mediante MatMulNBits con tamaño de bloque 32 y se han cuantizado también las operaciones Gather, sustituyendo un fallback histórico de int8 dinámico que el autor describe como defectuoso (step19366 dynamic-int8) y que desaconseja explícitamente usar. La verificación incluye ejecución en CPU de ONNX hasta contexto 1024, longitudes de texto y aleatorias variadas, batch size 2, comprobación de logits finitos sobre el vocabulario completo y seis comparaciones independientes de generación greedy de 16 tokens frente a PyTorch, con cuatro coincidencias exactas y dos divergencias por modelo. No se documenta RLHF, DPO ni ninguna fase de alineación.

## Capacidades

- Generación de texto autoregresiva en inglés, con decodificación greedy verificada hasta 16 tokens en las pruebas del autor.
- Ejecución en CPU mediante ONNX Runtime, con contexto verificado de hasta 1024 tokens.
- Compatibilidad prevista con ONNX Runtime Web para inferencia en navegador, aunque la verificación en navegador sigue pendiente según la model card.
- Tokenizador GPT-2, indicado como requisito en las tareas de verificación pendientes.
- Soporte de batch size 2 en las pruebas de ejecución realizadas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe no disponible: el modelo declara únicamente inglés.

## Casos de uso

- Prototipado de inferencia en navegador: el repositorio está orientado a servir pesos ONNX q8 a través de ONNX Runtime Web, de modo que una aplicación frontend pueda ejecutar generación de texto sin backend ni credenciales expuestas, siempre que se complete la verificación de CORS, SHA256 de assets y soporte de MatMulNBits/Gather en ORT Web.
- Validación de pipelines de exportación ONNX: sirve como caso de referencia para comprobar cuantización MatMulNBits block32 más Gather cuantizado frente a PyTorch, usando las seis comparaciones greedy de 16 tokens como test de regresión numérica.
- Experimentación con decodificación greedy determinista: al haberse validado la coincidencia exacta en cuatro de seis secuencias, es adecuado para estudiar la divergencia inducida por cuantización q8 en modelos pequeños.
- Docencia y demostraciones de cuantización: permite ilustrar en un taller la diferencia entre un fallback dynamic-int8 defectuoso y una cuantización weight-only q8 con bloques de 32, con métricas concretas de coincidencia.
- Pruebas de integración de tokenizador GPT-2 en entornos ONNX: el modelo declara dependencia del tokenizador GPT-2, por lo que puede emplearse para validar el emparejamiento tokenizador-modelo en un stack JavaScript.
- Evaluación de límites de memoria en dispositivos: con un repositorio de 0,7 GB y contexto 1024, es un candidato para medir consumo de memoria en escritorio y móvil, una de las verificaciones que el autor deja pendientes.
- No se recomienda para atención al cliente, generación de código en producción ni tareas de razonamiento: no hay evidencia publicada de calidad de tarea y el propio autor advierte que la cercanía numérica no la demuestra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta verificaciones de ejecución: contexto hasta 1024 en CPU, batch size 2, logits finitos sobre el vocabulario completo y coincidencia exacta en cuatro de seis generaciones greedy de 16 tokens frente a PyTorch por modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,7 GB, lo que da una cota superior aproximada del peso de los artefactos q8, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: no disponibles; las pruebas documentadas se realizaron en CPU con ONNX Runtime.
- Compatibilidad con GPU de consumo: no verificada. Por tamaño de repositorio (0,7 GB) cabría en GPUs de consumo con 8 GB o más, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: ONNX Runtime en CPU y ONNX Runtime Web en navegador (pendiente de verificación). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Memoria en dispositivos: la verificación de memoria en escritorio y móvil figura entre las tareas pendientes según la model card.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos pequeños entrenados desde cero y exportados a ONNX q8 para navegador), ni datos de parámetros, contexto o rendimiento de alternativas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización es con pérdida: dos de cada seis generaciones greedy divergen de PyTorch, según el propio autor.
- El autor advierte explícitamente que la cercanía numérica no prueba calidad de tarea ni compatibilidad con navegador.
- La verificación en navegador (CORS, SHA256 de assets, soporte de MatMulNBits/Gather en ORT Web, tokenizador GPT-2, memoria en escritorio y móvil, comportamiento de fallback) sigue pendiente.
- No debe publicarse ni seleccionarse el modelo dynamic-int8 step19366 como fallback, por estar defectuoso según la model card.
- No se debe desplegar ningún tipo de credencial en el frontend; las URLs públicas deben fijarse a una revisión inmutable del repositorio.
- Licencia no disponible: no hay autorización explícita para uso comercial ni condiciones de redistribución documentadas.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Contexto limitado a 1024 tokens verificados.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni tareas similares.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- Repositorio con 0 descargas y 0 likes: no hay validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mspanz88/playground-lm-onnx
- Sitio del proyecto PlaygroundLM (no vinculado explícitamente al repositorio en la información disponible): https://playgroundlm.com/
