# linuxid10t/G9v3-39A5B-GGUF

## Resumen

G9v3-39A5B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por AI9Stars, distribuido como version preliminar (preview) bajo licencia Apache 2.0. El repositorio analizado contiene conversiones GGUF no oficiales (BF16 y Q4_K_M) realizadas por el usuario linuxid10t, pensadas para su ejecucion local con llama.cpp. El modelo combina aproximadamente 39.000 millones de parametros totales con solo 5.000 millones activos por token, lo que permite un rendimiento de inferencia notablemente superior al de un modelo denso de tamano equivalente.

El modelo destaca por su ventana de contexto de 131.072 tokens, soporte de tool calling, modos Think/No-Think y un vocabulario bilingue ingles-chino de 130.560 tokens. Su arquitectura G9v3ForCausalLM emplea 320 expertos enrutados con 32 seleccionados por token mas un experto compartido, una configuracion que recuerda a la de DeepSeek-V3 pero con dimensiones mas contenidas. La relevancia actual radica en que ofrece capacidades de razonamiento y contexto largo en un formato GGUF ejecutable en hardware de consumo, aunque requiere una rama especifica de llama.cpp hasta que el soporte de la arquitectura se integre en el codigo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | G9v3ForCausalLM, sparse MoE (1 capa densa + 37 capas MoE) |
| Parametros totales | ~39.000 millones |
| Parametros activos | ~5.000 millones por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, Q4_K_M |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (V3), safetensors en el modelo base |

Detalles adicionales de arquitectura: 38 capas, hidden size 2.048, 32 cabezas de atencion de consulta, 2 cabezas clave/valor con dimension 128, 320 expertos enrutados con 32 seleccionados por token, 1 experto compartido, tamano intermedio de experto 512, vocabulario de 130.560 tokens.

## Arquitectura y entrenamiento

La arquitectura G9v3ForCausalLM es un transformer MoE disperso con una configuracion de 320 expertos enrutados, de los cuales se activan 32 por token, complementados por un experto compartido que se ejecuta siempre. Esta proporcion de activacion (32 de 320) permite que el coste computacional por token equivalga aproximadamente al de un modelo denso de 5.000 millones de parametros, mientras que la capacidad total de conocimiento almacenada corresponde a los 39.000 millones. La atencion emplea 32 cabezas de consulta y solo 2 cabezas clave/valor (GQA), reduciendo el coste de memoria del cache KV, un factor critico para sostener la ventana de 131.072 tokens.

El modelo base fue entrenado por AI9Stars con datos en ingles y chino, e incorpora dos modos de generacion: Think (razonamiento explicito, temperatura recomendada 1.0) y No-Think (respuesta directa, temperatura 0.7). No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La conversion a GGUF fue realizada por linuxid10t a partir del checkpoint BF16 original, con cuantizacion Q4_K_M mediante llama-quantize. El soporte de la arquitectura en llama.cpp reside en la rama `feature/g9v3-support` del repositorio del conversor, pendiente de integracion en el codigo principal.

## Capacidades

- Generacion de texto bilingue en ingles y chino con calidad de razonamiento avanzado.
- Modo Think: genera un razonamiento intermedio explicito antes de la respuesta final, util para problemas complejos de logica y matematicas.
- Modo No-Think: respuestas directas sin razonamiento visible, con menor latencia.
- Tool calling / function calling: soportado, verificable mediante el endpoint `/v1/chat/completions` de llama-server.
- Contexto largo de 131.072 tokens, adecuado para documentos extensos, codebases completos o conversaciones multi-turno prolongadas.
- Capacidades de agente: el soporte de tool calling combinado con el contexto largo permite encadenar multiples llamadas a herramientas en un mismo flujo.
- Razonamiento multi-step: el modo Think esta disenado para descomponer problemas en pasos intermedios.

## Casos de uso

- Analisis de documentos legales extensos: la ventana de 131.072 tokens permite procesar contratos o expedientes completos sin truncamiento, extrayendo clausulas relevantes y resumiendo secciones con el modo Think para verificar coherencia.
- Asistente de programacion con contexto de repositorio: un desarrollador puede cargar multiples archivos fuente de un proyecto y solicitar refactorizaciones, explicaciones o deteccion de bugs con conocimiento del codigo completo.
- Atencion al cliente bilingue (ingles-chino): el modelo gestiona conversaciones multi-turno con historial largo y puede invocar herramientas externas (CRM, base de conocimiento) mediante function calling para resolver incidencias.
- Generacion y revision de documentacion tecnica: redaccion de manuales, guias de API o comentarios de codigo en ambos idiomas, con el modo No-Think para respuestas rapidas y el modo Think para documentos que requieren precision.
- Traduccion asistida con contexto: al mantener el documento original completo en contexto, el modelo produce traducciones coherentes que respetan terminologia y referencias cruzadas.
- Razonamiento cientifico y matematico: el modo Think permite resolver problemas de calculo, demostraciones o analisis estadistico con pasos intermedios auditables.
- Despliegue local de un servidor OpenAI-compatible: mediante llama-server, el modelo puede sustituir a una API propietaria en entornos con requisitos de privacidad, sirviendo peticiones `/v1/chat/completions` a aplicaciones existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica medicion de rendimiento publicada corresponde a la inferencia CPU del archivo Q4_K_M:

| Hardware | Contexto | Hilos | Procesamiento de prompt | Generacion |
| --- | ---: | ---: | ---: | ---: |
| AMD Ryzen 9 9950X, 64 GiB RAM, solo CPU | 4.096 | 32 | 50,18-57,9 tokens/s | 10,0-10,03 tokens/s |

Estas cifras son orientativas y varian con la longitud del prompt, la velocidad de memoria, las opciones de compilacion y el sistema operativo. No se dispone de datos de rendimiento en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo BF16 ocupa 72,63 GiB y el Q4_K_M 21,94 GiB. En GPU, el Q4_K_M requiere aproximadamente 24-28 GiB de VRAM considerando cache KV y overhead; el BF16 necesita 80 GiB o mas.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GiB) o A6000 (48 GiB) es suficiente; para BF16 se requiere A100 80GB, H100 o configuracion multi-GPU.
- CPU: el Q4_K_M es viable en CPU con 32 GiB de RAM o mas, como demuestra la prueba con Ryzen 9 9950X y 64 GiB.
- Opciones de despliegue: llama.cpp (rama `feature/g9v3-support`), llama-cli para interaccion local, llama-server para API OpenAI-compatible. No compatible con vLLM, Ollama o TGI hasta que el soporte de la arquitectura se integre en esos proyectos.
- Latencia y throughput: en CPU (Ryzen 9 9950X, Q4_K_M), generacion de 10 tokens/s y procesamiento de prompt de 50-58 tokens/s. En GPU se esperan cifras sustancialmente mayores, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
| --- | --- | --- | --- | --- | --- |
| G9v3-39A5B | ~39B | ~5B | 131.072 | Apache 2.0 | GGUF, safetensors |
| DeepSeek-V3 (referencia arquitectonica) | 671B | 37B | 128K | MIT | safetensors, GGUF |
| Qwen2.5-32B (denso) | 32B | 32B | 131.072 | Apache 2.0 | GGUF, safetensors |

La comparativa directa es limitada porque G9v3-39A5B es una version preliminar sin benchmarks publicados. Frente a un modelo denso de tamano similar como Qwen2.5-32B, G9v3 ofrece la ventaja de un coste por token mucho menor (5B activos frente a 32B) a cambio de una madurez menor y un ecosistema de soporte todavia en desarrollo. DeepSeek-V3 comparte la filosofia MoE con experto compartido, pero a una escala muy superior y con un ecosistema de herramientas consolidado.

## Limitaciones y advertencias

- Version preliminar: el modelo base es un preview de AI9Stars, por lo que puede contener comportamientos inesperados o cambios sustanciales en versiones futuras.
- Soporte de software inmaduro: la arquitectura G9v3 solo funciona con la rama `feature/g9v3-support` de llama.cpp; las builds estandar no cargan el modelo. No hay soporte en vLLM, Ollama ni TGI.
- Cuantizacion Q4_K_M con perdida: es una cuantizacion con perdida que puede degradar la calidad de generacion respecto al BF16, especialmente en tareas de razonamiento complejo.
- Sesgos y alucinacion: no se han publicado evaluaciones de sesgos. Como modelo bilingue entrenado principalmente con datos en ingles y chino, puede presentar sesgos culturales de esas regiones y riesgo de alucinacion en hechos poco representados en sus datos de entrenamiento.
- Idiomas limitados: solo ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- Requisitos de memoria elevados: el archivo BF16 necesita 96 GiB de RAM recomendados, fuera del alcance de la mayoria de equipos de consumo.
- Sin benchmarks publicados: no es posible comparar objetivamente su rendimiento con otros modelos en tareas estandarizadas.
- Validacion limitada: el archivo BF16 no fue sometido a pruebas de generacion completas; solo se verificaron metadatos y formas de tensores.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/linuxid10t/G9v3-39A5B-GGUF
- Modelo base: https://huggingface.co/ai9stars/G9v3-39A5B
- Rama llama.cpp con soporte G9v3: https://github.com/linuxid10t/llama.cpp/tree/feature/g9v3-support
- Commit de soporte G9v3: https://github.com/linuxid10t/llama.cpp/commit/77b13da1a
- Conversiones GGUF alternativas: https://huggingface.co/cafepm/G9v3-39A5B-Q3Q4-GGUF
- Ficha en LLM Explorer: https://llm-explorer.com/model/ai9stars%2FG9v3-39A5B,6GLArwkedgAqvZVUev01VJ
