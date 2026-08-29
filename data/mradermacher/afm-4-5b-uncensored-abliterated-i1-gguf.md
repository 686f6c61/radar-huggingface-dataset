# mradermacher/AFM-4.5B-Uncensored-Abliterated-i1-GGUF

## Resumen

El modelo `mradermacher/AFM-4.5B-Uncensored-Abliterated-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `Securelayer7/AFM-4.5B-Uncensored-Abliterated`, desarrollado por Securelayer7. Se trata de un modelo de 4.5 mil millones de parámetros (según la nomenclatura del autor) que ha sido sometido a un proceso de "abliteración", una técnica que elimina los mecanismos de rechazo y censura del modelo original, resultando en una versión "sin censura" que no se niega a responder a peticiones controvertidas. El repositorio actual, creado por mradermacher, ofrece únicamente el archivo de imatrix para que los usuarios generen sus propias cuantizaciones, aunque también existe una versión con cuantizaciones estáticas en un repositorio hermano.

La relevancia de este modelo radica en su aplicación en ámbitos como la ciberseguridad, el red teaming y la investigación de seguridad, donde se necesita un modelo que no rechace preguntas sobre exploits, vulnerabilidades o técnicas ofensivas. Al estar cuantizado en GGUF, puede ejecutarse en hardware de consumo con herramientas como llama.cpp u Ollama. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque el contenido generado puede ser problemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, pero no confirmado) |
| Parametros totales | 4.5B (según nombre del modelo base); el archivo safetensors del repo muestra 1.124.568 parámetros, posiblemente un fragmento o error |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (archivo de pesos para generar quants); el repo hermano ofrece Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base. El nombre "AFM" sugiere que podría ser un modelo de la familia Arcee (Arcee Foundation Model), pero no hay confirmación. El proceso de abliteración consiste en modificar los pesos del modelo original para eliminar las direcciones de activación asociadas con el rechazo, manteniendo el resto de capacidades. El modelo base fue entrenado por Securelayer7 con un enfoque en razonamiento y ciberseguridad, aunque no se especifican los datos de entrenamiento ni el número de tokens. La cuantización imatrix de mradermacher utiliza una matriz de importancia calculada sobre un corpus de calibración para mejorar la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto sin rechazo: el modelo no se niega a responder a peticiones que normalmente serían bloqueadas por políticas de seguridad, como preguntas sobre exploits, malware o técnicas de hacking.
- Razonamiento: según los tags, el modelo está orientado a tareas de razonamiento, aunque no se especifican benchmarks.
- Ciberseguridad y red teaming: puede generar contenido técnico relacionado con vulnerabilidades, análisis de seguridad y pruebas de penetración.
- Multilingüe: aunque la model card indica solo inglés, el modelo base podría tener capacidades multilingües, pero no se confirma.
- Sin soporte de tool calling ni funciones de agente: no se menciona en la información disponible.
- Sin modo de pensamiento explícito: no se indica si tiene un modo de razonamiento extendido.

## Casos de uso

- Red teaming en ciberseguridad: el modelo puede generar vectores de ataque, payloads o scripts de prueba para evaluar la seguridad de sistemas, sin las restricciones de otros LLM que rechazan este tipo de contenido.
- Investigación de vulnerabilidades: analistas de seguridad pueden usarlo para explorar técnicas de explotación o redactar informes técnicos sobre fallos de seguridad.
- Generación de contenido sin censura: creadores que necesitan textos sobre temas tabú o controvertidos (siempre dentro de la legalidad) pueden emplearlo como alternativa a modelos censurados.
- Entrenamiento de modelos de seguridad: se puede utilizar para generar ejemplos adversarios que ayuden a entrenar sistemas de detección de contenido malicioso.
- Simulación de ataques en entornos controlados: en laboratorios de seguridad, el modelo puede actuar como un "atacante" automatizado para probar defensas.
- Estudio de la abliteración: investigadores pueden analizar el comportamiento del modelo para entender cómo la eliminación de rechazos afecta a la calidad y seguridad de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar. El rendimiento real dependerá de la cuantización utilizada y del hardware de ejecución.

## Requisitos de hardware

- Al ser un modelo de 4.5B parámetros, las cuantizaciones típicas (Q4_K_M, Q5_K_M) ocupan entre 3 y 5 GB de VRAM, por lo que puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- Para cuantizaciones más agresivas (Q2_K, IQ2_M), el uso de VRAM puede reducirse a ~2-3 GB, permitiendo ejecución en GPUs con 4-6 GB.
- El archivo imatrix proporcionado no es un modelo completo, sino un recurso para generar cuantizaciones; se necesita ejecutar herramientas como llama.cpp o el script de imatrix para crear los GGUF finales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama.cpp-server.
- Latencia y throughput: no se proporcionan datos; en una RTX 4090, un modelo 4.5B cuantizado a Q4 puede alcanzar decenas de tokens por segundo, pero es una estimación general.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos abliterados de tamaño similar. Existen alternativas como `TheBloke/...` o modelos de la familia "uncensored" de otros autores, pero no se tienen datos concretos de rendimiento o especificaciones. Se recomienda consultar índices como Uncensor Index para comparativas actualizadas.

## Limitaciones y advertencias

- El modelo está diseñado para no rechazar contenido, lo que puede generar respuestas peligrosas, ilegales o éticamente cuestionables. Su uso debe limitarse a entornos controlados y legales.
- La abliteración puede degradar la calidad general del modelo en tareas estándar, ya que elimina parte de la activación neuronal.
- No se garantiza la exactitud técnica de las respuestas en ciberseguridad; el modelo puede alucinar exploits o vulnerabilidades inexistentes.
- La licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue asume toda la responsabilidad legal por el contenido generado.
- El modelo solo está confirmado en inglés; su rendimiento en otros idiomas es desconocido.
- Al ser una cuantización imatrix, la calidad depende del corpus de calibración utilizado; el archivo proporcionado es solo para generar quants, no es un modelo listo para usar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/AFM-4.5B-Uncensored-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/Securelayer7/AFM-4.5B-Uncensored-Abliterated
- Repositorio con cuantizaciones estáticas: https://huggingface.co/mradermacher/AFM-4.5B-Uncensored-Abliterated-GGUF
- Guía sobre modelos abliterados: https://locallyuncensored.com/blog/abliterated-models-guide.html
- Índice de modelos sin censura: https://uncensorindex.com/
