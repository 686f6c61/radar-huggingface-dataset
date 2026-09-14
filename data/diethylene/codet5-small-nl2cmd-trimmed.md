# diethylene/codet5-small-nl2cmd-trimmed

## Resumen

`diethylene/codet5-small-nl2cmd-trimmed` es un modelo de traducción de lenguaje natural a comandos de shell (NL2CMD), desarrollado por el usuario diethylene, que convierte instrucciones en inglés a comandos de bash para Linux. Se trata de una variante con vocabulario recortado del modelo `diethylene/codet5-small-nl2cmd`, a su vez un ajuste fino de CodeT5-small sobre el pipeline de diethylene. El repositorio declara 54.026.752 parámetros reales (según los pesos en safetensors) y un tamaño de 0,2 GB, lo que lo sitúa como un modelo muy pequeño, ejecutable en CPU.

El problema que aborda es concreto: dada una frase como una petición de operación sobre ficheros, procesos o red, generar el comando de bash correspondiente. Esto lo hace útil como componente embebido en asistentes de terminal, herramientas de chatops o generadores de scripts, donde el coste de cómputo y la latencia importan más que la capacidad de razonamiento general. La licencia Apache-2.0 permite uso comercial sin restricciones de redistribución, aunque los datasets de entrenamiento imponen obligaciones de atribución.

La relevancia actual del modelo es limitada y muy especializada: no compite con LLM generalistas, sino que ocupa el nicho de traducción NL→bash a escala reducida. Al no tener descargas ni validación de la comunidad, y al no publicar resultados de evaluación, debe tratarse como un artefacto experimental. Su arquitectura es un transformer encoder-decoder de la familia CodeT5/T5, con aproximadamente 512 tokens de contexto en la configuración original de la familia, dato no confirmado para esta variante recortada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia CodeT5, derivada de T5) |
| Parámetros totales | 54.026.752 (dato real de los pesos safetensors) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada (la familia CodeT5-small original trabaja con 512 tokens, no confirmado en esta variante) |
| Tipos de cuantización | No disponibles en el repositorio; la model card cita un toolchain ONNX (optimum 2.1.0, optimum-onnx 0.1.0, onnxruntime 1.28.0, onnx 1.22.0) que permite exportación y cuantización posterior no documentada |
| Idiomas soportados | No disponible; los datasets de entrenamiento citados son mayoritariamente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); exportación a ONNX soportada por el toolchain citado |
| Tarea declarada | text2text-generation / translation (NL2CMD) |
| Modelo base | diethylene/codet5-small-nl2cmd |
| Tamaño del repositorio | 0,2 GB |
| Versiones de framework citadas | transformers 4.57.6, torch 2.13.0+cu130 |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo T5, en la línea de CodeT5, que combina un encoder que procesa la instrucción en lenguaje natural con un decoder autorregresivo que emite el comando de bash token a token. El checkpoint de partida es CodeT5-small, cuya configuración pública de familia es de aproximadamente 60 millones de parámetros repartidos en 6 capas de encoder y 6 de decoder, con dimensión de modelo 512 y 8 cabezas de atención; esta configuración no está verificada en el repositorio. La modificación específica de esta variante es el recorte de vocabulario: el tokenizer se reduce respecto al modelo base, lo que disminuye el tamaño de la matriz de embeddings y explica la bajada hasta 54,0 millones de parámetros.

El ajuste fino se realizó sobre tres fuentes declaradas en la model card: el dataset NL2SH-ALFA (licencia MIT), asociado al trabajo de Westenfelder et al., "LLM-Supported Natural Language to Bash Translation" (NAACL 2025); las páginas de tldr-pages (CC BY 4.0), normalizadas y ancladas al commit 9772284fdecc17e1e72a671a773460b96ac75078; y el corpus bash_gen (comandos bash generados con ChatGPT), descrito en los trabajos de Fu et al. sobre traducción de lenguaje natural a bash. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, ni el número total de tokens de entrenamiento.

## Capacidades

- Traducción de lenguaje natural a comandos de bash, principalmente para Linux, que es el uso declarado explícitamente por el autor.
- Generación de comandos con flags, rutas y argumentos, aprendida de ejemplos reales de tldr-pages y de corpus sintéticos.
- Generación de texto secuencia a secuencia en general (pipeline `text2text-generation`), aunque el ajuste está orientado a NL2CMD.
- Compatibilidad con la librería transformers como `AutoModelForSeq2SeqLM`, con pesos en safetensors.
- Exportación a ONNX mediante el toolchain optimum/optimum-onnx citado en la model card.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- No dispone de modo de razonamiento explícito (thinking mode), visión, audio ni multimodalidad.
- Cobertura multilingüe no documentada; los datos de entrenamiento citados son en inglés.

## Casos de uso

- Asistente de terminal interactivo: el modelo traduce una petición en inglés a un comando de bash que el usuario revisa antes de ejecutar, integrándose en un shell o en una TUI. Su tamaño de 54 M permite ejecutarlo localmente sin GPU y con latencia baja.
- Autocompletado y sugerencia de comandos en editores y entornos de terminal: dado un fragmento de instrucción, generar candidatos de comando que el usuario acepta o descarta, aprovechando que el modelo produce salidas cortas y deterministas con decodificación greedy.
- Automatización de tareas de administración de sistemas: generación de comandos para gestión de ficheros, permisos, procesos, logs o servicios, que después pasan por un revisor humano o por un modo `--dry-run` antes de ejecutarse.
- Generación de borradores de scripts de shell: a partir de una descripción funcional, producir comandos base que el ingeniero completa y encapsula en un script con control de errores, reduciendo el tiempo de escritura de tareas repetitivas.
- Herramientas de chatops: integración en un bot interno que responde a peticiones operativas con el comando equivalente, sujeto a una capa de validación y a listas de comandos prohibidos, dado el aviso explícito del autor sobre comandos destructivos.
- Educación y formación en línea de comandos: el modelo puede usarse en un entorno sandbox para convertir descripciones didácticas en comandos de ejemplo, siempre con supervisión, dado que puede alucinar flags o rutas inexistentes.
- Aumento de datos y evaluación: generar pares instrucción-comando para ampliar datasets de NL2CMD o para construir conjuntos de prueba que midan otros modelos mayores, con la salvedad de que las salidas deben filtrarse por corrección sintáctica y semántica.
- Despliegue en el borde o en contenedores sin GPU: con menos de 1 GB de VRAM en FP32 y ejecutable en CPU, puede embeberse en un servicio pequeño on-premise donde no sea viable servir un LLM de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, EM (exact match), BLEU ni comparaciones cuantitativas con el modelo base o con alternativas. Tampoco se documentan medidas de latencia o throughput.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 216 MB (54.026.752 parámetros × 4 bytes).
- Pesos en FP16/BF16: aproximadamente 108 MB.
- Pesos en INT8: aproximadamente 54 MB, excluyendo metadatos y overhead del runtime.
- VRAM total estimada para inferencia: por debajo de 1 GB incluso en FP32 con lotes pequeños, dado el reducido tamaño del modelo y una ventana de contexto corta.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo no requiere A100, H100 ni RTX 4090. Cabe en GTX serie 10 y superiores, RTX serie 20/30/40 y en iGPU con memoria compartida suficiente.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, y también en CPU, que es un modo de despliegue realista para este tamaño.
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`), ONNX Runtime mediante optimum-onnx (versiones citadas en la model card), y servicios de inferencia compatibles con la etiqueta `endpoints_compatible` / `text-generation-inference` del repositorio. El soporte en llama.cpp/Ollama no está confirmado, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| diethylene/codet5-small-nl2cmd-trimmed | 54.026.752 | No disponible | NL→bash (Linux) | Apache-2.0 | safetensors en HuggingFace; export ONNX previsto |
| diethylene/codet5-small-nl2cmd (base) | No disponible (superior al recortado) | No disponible | NL→bash (Linux) | Apache-2.0 | safetensors en HuggingFace |
| Salesforce/codet5-small | ~60 M (no verificado) | 512 tokens (no verificado) | Preentrenamiento de código y generación | No verificada en esta ficha | safetensors en HuggingFace |
| google-t5/t5-small | ~60 M | 512 tokens | Texto a texto general | Apache-2.0 | safetensors en HuggingFace |

La comparación cuantitativa de calidad con estas alternativas no es posible: el modelo no publica benchmarks y el modelo base solo se conoce a través de la relación declarada en la model card. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre alternativas de NL2CMD comparables.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo "emitirá con gusto comandos destructivos si se le deja": no incorpora ninguna capa de seguridad ni filtro de comandos peligrosos. Cualquier uso en producción exige validación, listas de denegación y confirmación humana.
- Riesgo alto de alucinación en flags, rutas y nombres de herramientas: no hay evaluación publicada que cuantifique la exactitud, y parte del entrenamiento proviene de comandos bash generados con ChatGPT, con la posibilidad de errores heredados del corpus sintético.
- El recorte de vocabulario puede degradar el rendimiento en entradas fuera de dominio, en tokens poco frecuentes y en cualquier uso distinto de NL2CMD, al haberse eliminado entradas del tokenizer respecto al modelo base.
- Idiomas soportados no documentados; los datasets citados son en inglés, por lo que el comportamiento en castellano u otros idiomas es incierto.
- Longitud de contexto no documentada; no se garantiza el manejo de instrucciones largas o de conversaciones multi-turno.
- Uso comercial permitido por la licencia Apache-2.0 del modelo, pero los datos de entrenamiento imponen condiciones adicionales: tldr-pages está bajo CC BY 4.0 y exige atribución, y NL2SH-ALFA bajo MIT. La redistribución del modelo debería conservar los avisos de atribución que figuran en la model card.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni evaluaciones independientes.
- No es un modelo de agentes ni soporta tool calling; no debe integrarse como planificador autónomo sin una capa externa de control.
- Los pesos publicados son únicamente en safetensors; no hay GGUF ni artefactos de cuantización listos para usar, lo que obliga a exportar y cuantizar por cuenta propia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/diethylene/codet5-small-nl2cmd-trimmed
- Modelo base: https://huggingface.co/diethylene/codet5-small-nl2cmd
- Dataset NL2SH-ALFA: https://huggingface.co/datasets/westenfelder/NL2SH-ALFA
- Artículo NAACL 2025 "LLM-Supported Natural Language to Bash Translation": https://doi.org/10.18653/v1/2025.naacl-long.555
- Repositorio tldr-pages (commit anclado 9772284fdecc17e1e72a671a773460b96ac75078): https://github.com/tldr-pages/tldr
- Corpus bash_gen: https://github.com/magnumresearchgroup/bash_gen
- La búsqueda web realizada no devolvió ningún enlace relevante sobre el modelo, sus benchmarks o su documentación adicional.
