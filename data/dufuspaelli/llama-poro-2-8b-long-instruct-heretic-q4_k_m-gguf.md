# dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic-Q4_K_M-GGUF

## Resumen

El modelo `dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic-Q4_K_M-GGUF` es una conversión a formato GGUF (cuantización Q4_K_M) del modelo `dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic`, una variante "abliterated" (sin censura) del modelo `LumiOpen/Llama-Poro-2-8B-Long-Instruct`. Este último es un modelo conversacional optimizado para inglés y finlandés, con soporte de contexto extendido, desarrollado por LumiOpen. La versión "heretic" elimina los mecanismos de rechazo típicos de los modelos instructivos, lo que permite generar contenido que otros modelos censurarían.

Con 8.030 millones de parámetros, este modelo se distribuye en formato GGUF, lo que facilita su ejecución en hardware modesto mediante llama.cpp, Ollama u otras herramientas compatibles. Su licencia es llama3.3, lo que permite uso comercial con ciertas restricciones. Es relevante para desarrolladores que necesitan un modelo de 8B sin restricciones de contenido, especialmente en aplicaciones que requieren procesamiento de texto en finlandés o inglés con ventanas de contexto largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (presumiblemente transformer decoder-only, similar a Llama) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base se describe como de contexto largo) |
| Tipos de cuantizacion | Q4_K_M (único archivo confirmado en el repo) |
| Idiomas soportados | Inglés, finlandés |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos específicos sobre la arquitectura del modelo en la información disponible. Por el nombre y la licencia, se presume que sigue una arquitectura transformer decoder-only similar a la familia Llama, pero no hay confirmación oficial. El modelo base `LumiOpen/Llama-Poro-2-8B-Long-Instruct` fue entrenado con el dataset `LumiOpen/poro2-instruction-collection`, que incluye instrucciones en inglés y finlandés. La versión "heretic" es una modificación posterior que aplica técnicas de "abliteration" para eliminar los rechazos de contenido, resultando en un modelo "uncensored". El proceso de conversión a GGUF se realizó mediante la herramienta GGUF-my-repo de ggml.ai, sin alterar los pesos más allá de la cuantización.

## Capacidades

- Generación de texto en inglés y finlandés, con seguimiento de instrucciones.
- Soporte de contexto largo (longitud exacta no especificada, pero el modelo base está diseñado para ello).
- Al ser "uncensored", no aplica los filtros de rechazo habituales, permitiendo generar contenido que otros modelos bloquean.
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.
- Capacidad multilingüe limitada a inglés y finlandés.

## Casos de uso

- Chatbots de atención al cliente en finlandés: el modelo puede mantener conversaciones multi-turno en finlandés, aprovechando su contexto largo para recordar el historial de la conversación. Su naturaleza "uncensored" permite tratar temas sensibles sin evasivas.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que requieran un tono explícito o temas tabú, donde un modelo censurado fallaría.
- Asistente de redacción en finlandés: ayuda a redactar correos, informes o artículos en finlandés, con corrección gramatical y de estilo.
- Traducción informal entre inglés y finlandés: aunque no está entrenado específicamente para traducción, puede producir traducciones fluidas en contextos conversacionales.
- Procesamiento de documentos largos: gracias a su contexto extendido, puede resumir o analizar textos extensos en inglés o finlandés, como contratos o artículos académicos.
- Prototipado de aplicaciones de IA sin censura: para desarrolladores que necesitan probar comportamientos de modelo sin restricciones en entornos de desarrollo, antes de implementar filtros adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M de un modelo de 8B suele ocupar alrededor de 4,7 GB, por lo que se estima un consumo de 5-6 GB de VRAM durante la inferencia (incluyendo overhead).
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3070/3080, RTX 4060 Ti, o GPUs de datacenter como A10 o L4. También puede ejecutarse en CPU con suficiente RAM (16 GB o más).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media con 8 GB o más.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, LM Studio, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se han publicado datos específicos; dependerá del hardware y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-Poro-2-8B-Long-Instruct-heretic (este) | 8B | No disponible (largo) | en, fi | llama3.3 | GGUF |
| Llama-3-8B-Instruct | 8B | 8K (ampliable) | Multilingüe (principalmente en) | llama3.3 | Varios |
| Mistral-7B-Instruct | 7B | 8K (ampliable) | Multilingüe | Apache 2.0 | Varios |

La principal diferencia frente a Llama-3-8B y Mistral-7B es el enfoque bilingüe en finlandés y la ausencia de censura. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Al ser "uncensored", el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es adecuado para aplicaciones públicas sin filtros adicionales.
- Puede reflejar sesgos presentes en sus datos de entrenamiento, especialmente en temas sensibles.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos largos.
- La longitud de contexto exacta no está documentada; se recomienda probar antes de usarlo en producción.
- La licencia llama3.3 permite uso comercial, pero requiere incluir la atribución correspondiente y cumplir con la política de uso aceptable de Meta.
- No se ha confirmado soporte para tool calling ni otras capacidades avanzadas; su uso se limita a generación de texto.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic-Q4_K_M-GGUF
- Modelo base "heretic": https://huggingface.co/dufuspaelli/Llama-Poro-2-8B-Long-Instruct-heretic
- Modelo original de LumiOpen: https://huggingface.co/LumiOpen/Llama-Poro-2-8B-Long-Instruct
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
