# kizzet373/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW-Q4_K_M-GGUF

## Resumen

Este modelo es una conversión a formato GGUF con cuantización Q4_K_M del modelo base `Mantis2024/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW`, realizada por el usuario `kizzet373` mediante la herramienta GGUF-my-repo de llama.cpp. El nombre sugiere que se trata de un modelo especializado en escritura creativa de temática erótica sin censura, probablemente un fine-tune de un modelo transformer de tamaño medio (no se especifica en la información disponible). La conversión a GGUF permite su ejecución eficiente en CPU y GPU con llama.cpp, Ollama u otros motores compatibles, lo que facilita su despliegue en entornos locales o de bajos recursos.

La relevancia de este modelo radica en su naturaleza "uncensored" (sin censura), dirigido a un público que busca generación de contenido adulto sin restricciones impuestas por los alineamientos habituales de los modelos comerciales. Sin embargo, la información técnica disponible es muy limitada: no se publican detalles sobre arquitectura, número de parámetros, contexto, licencia ni datos de entrenamiento. La ficha se basa únicamente en la model card de la conversión y en referencias indirectas de otras cuantizaciones del mismo modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso usa `-c 2048`, pero no es un valor oficial) |
| Tipos de cuantizacion | Q4_K_M (esta conversión); existen otras versiones (i1-GGUF) con cuantizaciones adicionales |
| Idiomas soportados | no disponible (probablemente inglés, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `dirty-muse-writer-v01-uncensored-erotica-nsfw-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El nombre "Dirty-Muse-Writer" sugiere un fine-tune orientado a escritura creativa, pero se desconoce el modelo base original (podría ser Llama, Mistral, Qwen u otro). Tampoco hay datos sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La conversión a GGUF se realizó con llama.cpp, lo que indica que el modelo original era compatible con esta herramienta (probablemente un transformer decoder-only). No se mencionan innovaciones técnicas específicas.

## Capacidades

- Generación de texto: el modelo está diseñado para producir contenido narrativo, probablemente con énfasis en temática erótica explícita y sin filtros de censura.
- Escritura creativa: por su nombre, se orienta a la creación de historias, diálogos o escenas con un estilo literario.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio u otras capacidades avanzadas.
- El modelo es "uncensored", lo que implica que no aplica los alineamientos de seguridad habituales, permitiendo generar contenido que otros modelos rechazarían.

## Casos de uso

- Escritura de ficción erótica: el modelo puede asistir a autores que necesiten generar borradores de escenas o diálogos con contenido adulto, ofreciendo un flujo creativo sin restricciones temáticas.
- Generación de contenido para plataformas de lectura adulta: se puede integrar en herramientas de autoedición para producir relatos cortos o serializaciones, siempre que se cumplan las políticas de la plataforma.
- Prototipado de chatbots de rol: dado su carácter sin censura, podría usarse para crear personajes conversacionales en entornos de juego de rol adulto, aunque requeriría un ajuste adicional para mantener coherencia.
- Exploración de límites de modelos de lenguaje: investigadores interesados en el comportamiento de modelos sin alineamiento pueden usarlo como caso de estudio, aunque con las debidas precauciones éticas.
- Generación de guiones o diálogos para proyectos audiovisuales independientes: el modelo puede producir material base que luego se edite y adapte, aprovechando su fluidez narrativa.
- Entrenamiento de modelos más pequeños: el texto generado podría servir como datos sintéticos para fine-tunes específicos, siempre que se respete la licencia (desconocida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con modelos similares en términos de rendimiento.

## Requisitos de hardware

- El archivo GGUF Q4_K_M tiene un tamaño de aproximadamente 5.8 GB (según el tamaño del repo, aunque el archivo individual puede ser menor). Esto sugiere que el modelo base tiene entre 7B y 13B de parámetros, pero no está confirmado.
- VRAM estimada: para inferencia en GPU, se necesitaría al menos 6-8 GB de VRAM para cargar el modelo en Q4_K_M, dependiendo del contexto y del backend (llama.cpp, vLLM, etc.).
- GPU recomendadas: una RTX 3060 de 12 GB o superior sería suficiente; GPUs con 8 GB (como RTX 3070) podrían funcionar con contexto reducido.
- En CPU, se puede ejecutar con llama.cpp, aunque la velocidad será baja (típicamente 5-15 tokens/s en un procesador moderno).
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama (si se importa el GGUF), o cualquier motor compatible con GGUF (llama-cpp-python, etc.).
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. Existen otras cuantizaciones del mismo modelo base (por ejemplo, `mradermacher/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW-i1-GGUF`), pero no se conocen sus especificaciones técnicas. Tampoco se identifican modelos alternativos de escritura erótica sin censura con datos públicos comparables.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar material NSFW (no seguro para el trabajo) y puede producir texto sexualmente explícito, violento o perturbador. No es apto para menores ni para entornos profesionales.
- Sin alineamiento de seguridad: al ser "uncensored", no tiene los mecanismos de rechazo habituales, lo que aumenta el riesgo de generar contenido dañino, ilegal o no ético si se le solicita.
- Alucinaciones y calidad variable: al no conocerse su entrenamiento, es probable que presente incoherencias, repeticiones o errores fácticos, especialmente en contextos largos.
- Licencia desconocida: no se especifica la licencia del modelo base ni de esta conversión, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar con el autor antes de cualquier uso productivo.
- Sesgos: al ser un fine-tune sin información sobre el dataset, puede reflejar sesgos de género, raza o cultura presentes en los datos de entrenamiento, amplificados por la temática erótica.
- Contexto limitado: aunque no se confirma, el ejemplo de uso sugiere una ventana de 2048 tokens, lo que limita la generación de textos largos o conversaciones multi-turno extensas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kizzet373/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Mantis2024/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW
- Otra cuantización (i1-GGUF): https://huggingface.co/mradermacher/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW-i1-GGUF
- Página de referencia (local-ai-zone): https://local-ai-zone.github.io/models/dirty-muse-writer-v01-uncensored-erotica-nsfw-i1.html
- Página de model.aibase.com: https://model.aibase.com/models/details/1924737558970109952
