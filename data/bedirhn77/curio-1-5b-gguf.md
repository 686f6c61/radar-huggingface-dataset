# Bedirhn77/Curio-1.5B-GGUF

## Resumen

Curio-1.5B es una publicacion de Bedirhn77 que empaqueta el modelo Qwen2.5-Coder-1.5B-Instruct en formato GGUF (cuantizacion Q8_0) para su uso con llama.cpp, Ollama y LM Studio. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer decoder-only de 1.543.714.304 parametros orientado a generacion de codigo, con especial enfasis en Python. La relevancia de esta publicacion no reside en los pesos, que son identicos al modelo original, sino en el registro de un experimento llamado "Curiosity Loop" que se distribuye junto al modelo.

El experimento plantea una pregunta concreta: puede un modelo pequeno mejorar sin actualizar sus pesos, unicamente escribiendo las reglas que subyacen a sus errores de prediccion. Durante 60 minutos en una GPU T4, el modelo alterno entre escribir fragmentos de Python, predecir su salida, ejecutarlos y anotar las discrepancias ("sorpresas") en una biblioteca de 224 notas. La respuesta obtenida en esta ejecucion fue negativa: la biblioteca redujo la puntuacion en MBPP de 65/100 a 55/100.

El repositorio se publica explicitamente como un resultado negativo honesto. El GGUF es funcional y equivale al modelo base, pero la biblioteca de notas no debe usarse para prompting segun las conclusiones del propio autor. El contexto nativo del modelo base es de 32.768 tokens, aunque los ejemplos de uso del repositorio emplean 4.096.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens en el modelo base; los ejemplos del repo usan 4.096 |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado, ~1,6 GB) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente a Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only denso con atencion por causalidad estandar, sin mezcla de expertos ni mecanismos hibridos. Los pesos no han sido modificados en ningun momento; el autor lo declara de forma explicita en la model card. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (SFT, RLHF o DPO) del modelo base.

La innovacion que documenta el repositorio es metodologica, no arquitectonica. El bucle de curiosidad ejecuta dos actividades alternadas: por un lado, el modelo escribe codigo Python sobre temas delicados, predice la salida y, cuando la prediccion falla, redacta la regla que deberia haber conocido; por otro, resuelve tareas de practica y guarda la leccion solo si necesita correccion. En la ejecucion registrada se realizaron 675 experimentos, con 220 sorpresas (aproximadamente el 33 por ciento), 93 tareas resueltas al primer intento, 4 resueltas tras correccion y 66 no resueltas. La seleccion de temas priorizaba aquellos donde la tasa de sorpresa disminuia. El autor identifica como causas probables del fallo la ausencia de verificacion de las reglas escritas, la recuperacion por solapamiento simple de palabras clave sin umbral de similitud y el agotamiento del conjunto de practica (163 tareas) tras unos 180 pasos.

## Capacidades

- Generacion de codigo, con especial orientacion a Python, heredada de Qwen2.5-Coder-1.5B-Instruct.
- Completado de codigo y resolucion de tareas de programacion de complejidad baja a media.
- Conversacion multi-turno en formato chat (el repositorio declara la etiqueta `conversational` y compatibilidad con endpoints).
- Generacion de texto general en ingles.
- Ejecucion local mediante llama.cpp, Ollama, LM Studio y llama-cpp-python.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.

## Casos de uso

- Autocompletado de Python en el editor: el modelo, en Q8_0, cabe en memoria de una GPU de consumo y ofrece latencia baja para sugerencias linea a linea en entornos locales como LM Studio o continuaciones en Neovim mediante llama.cpp.
- Asistente de refactorizacion de scripts pequenos: con una ventana de 4.096 a 32.768 tokens puede recibir un modulo completo y proponer reescrituras, aunque toda salida requiere revision humana.
- Generacion de tests unitarios para funciones existentes: el modelo puede producir casos de prueba a partir de una firma y un docstring, tarea adecuada para su tamano y su entrenamiento en codigo.
- Educacion y ensenanza de Python: util como tutor local que explica fragmentos de codigo y errores comunes, desplegado en un portatil sin conexion.
- Prototipado rapido en CI/CD: integrado como paso de generacion de borradores de parches o mensajes de commit a partir de diffs, con validacion posterior por herramientas deterministas.
- Investigacion sobre auto-mejora sin actualizacion de pesos: el repositorio sirve como material reproducible para estudiar bucles de curiosidad, con la biblioteca de 224 notas y el registro completo de la ejecucion.
- Despliegue offline en entornos restringidos: al ser un GGUF de 1,6 GB con licencia Apache 2.0, puede distribuirse en estaciones de trabajo sin acceso a internet ni APIs externas.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la evaluacion del experimento sobre 100 tareas del conjunto de test MBPP (sanitized), con decodificacion greedy y las 3 mejores notas de la biblioteca anadidas al prompt.

| Configuracion | Tareas superadas |
|---|---|
| Modelo base con biblioteca vacia | 65 / 100 |
| Modelo base con biblioteca | 55 / 100 |

La biblioteca corrigio 6 tareas y rompio 16. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar para este empaquetado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB para el archivo Q8_0, mas la memoria del contexto (crece con `n_ctx`; 4.096 tokens requieren unos cientos de MB adicionales).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; el autor realizo el experimento en una T4. Tambien funciona en CPU mediante llama.cpp.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio y llama-cpp-python.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Curio-1.5B-GGUF | 1,54 B | 32.768 (base) | Apache 2.0 | GGUF Q8_0 | Pesos identicos a Qwen2.5-Coder-1.5B-Instruct; incluye registro de experimento |
| Qwen2.5-Coder-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base original; mismas capacidades sin el empaquetado experimental |
| Modelos coder de ~1-2 B de otras familias | ~1-2 B | variable | variable | variable | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion relevante es con el propio modelo base: Curio no aporta mejoras de pesos ni de rendimiento, y su unico valor anadido es la documentacion del experimento fallido. Para uso productivo, el modelo original de Qwen es la referencia directa.

## Limitaciones y advertencias

- Los pesos no han sido ajustados: el rendimiento es exactamente el del modelo base, sin mejoras derivadas del experimento.
- La biblioteca de notas de curiosidad degrada el rendimiento en MBPP (de 65 a 55 sobre 100) y el autor recomienda no usarla para prompting.
- Varias reglas de la biblioteca son incorrectas, por ejemplo la afirmacion de que los enteros de Python se desbordan con wrap-around.
- El modelo puede generar codigo incorrecto o inseguro, igual que el modelo base; es obligatoria la revision de toda salida.
- El soporte de idiomas se limita al ingles segun la metadata del repositorio.
- El experimento se realizo con una sola semilla, una sola ejecucion y un unico subconjunto de benchmark, por lo que sus cifras no constituyen una conclusion general.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad sobre el codigo generado recae en el usuario.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Bedirhn77/Curio-1.5B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
