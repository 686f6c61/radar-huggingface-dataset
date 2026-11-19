# SadikNawazAI/sadik-ai-1.5b-gguf

## Resumen

SadikAI 1.5B Preview es un repositorio de pesos GGUF publicado por Sadik Nawaz (SadikNawazAI) que contiene una cuantización Q4_K_M **sin modificar** del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba Cloud. No se ha aplicado ajuste fino, destilación, poda ni ninguna otra modificación sobre los pesos originales: el autor únicamente ha empaquetado el GGUF, redactado la model card y publicado el artefacto como avance del sucesor previsto de su modelo propio SadikAI Medium (7,9 M de parámetros). Es, por tanto, un modelo de 1,5 B parámetros con arquitectura Qwen2 densa (decoder-only), contexto nativo de 32.768 tokens y licencia Apache-2.0.

Su relevancia práctica es la de un modelo local de código y propósito general muy ligero: el archivo Q4_K_M ocupa 940 MiB y se carga en aproximadamente 1,2 GB de RAM, lo que lo hace ejecutable en CPU sin GPU dedicada y en cualquier equipo de gama media. Está pensado para flujos de trabajo con Ollama, LM Studio, llama.cpp, Jan o koboldcpp, y es compatible con el chat template de Qwen2.

Conviene subrayar que el nombre comercial "SadikAI" no implica entrenamiento propio: los pesos son los de Qwen2.5-Coder-1.5B-Instruct y así se declara explícitamente en la model card y en el fichero NOTICE. El chat en vivo del sitio del autor (sadik.totalh.net) sigue ejecutando SadikAI Medium (7,9 M), no este preview.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 densa, decoder-only (transformer) |
| Parametros totales | 1.543.714.304 (1,5 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 4.096 tokens usados en la prueba de velocidad |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | en, code |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); tamano del archivo 986.048.576 bytes (940 MiB) |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Tamano del repositorio | 1,0 GB |
| Biblioteca declarada | llama.cpp |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-1.5B-Instruct: un transformer denso decoder-only de la familia Qwen2, con 1.543.714.304 parametros. Este repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original; esos detalles corresponden a la model card de Qwen y no se reproducen aqui. Tampoco se documenta ninguna innovacion tecnica adicional en el empaquetado.

La unica transformacion aplicada es la cuantizacion a Q4_K_M mediante llama.cpp, que reduce el peso a 940 MiB manteniendo el chat template de Qwen2 en el fichero Modelfile para su importacion en Ollama. El autor declara explicitamente que no ha habido ajuste fino, destilacion ni poda, y proporciona el SHA-256 del GGUF (`29d8c98fa6b098e200069bfb88b9508dc3e85586d20cba59f8dda9a808165104`) para verificar la integridad de la descarga.

## Capacidades

- Generacion de texto conversacional en ingles y generacion de codigo en multiples lenguajes, heredadas del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Asistencia de programacion: escritura de funciones, explicacion de fragmentos de codigo y respuesta a peticiones directas tipo "escribe una funcion en Python que invierta una cadena".
- Conversacion multi-turno con plantilla de chat Qwen2 (sistema, usuario, asistente).
- Formato de salida con bloques de codigo delimitados, segun el prompt de sistema sugerido por el autor.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, Jan y koboldcpp.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso explicito, vision, audio ni modo "thinking". El modelo base Qwen2.5-Coder-Instruct si soporta parte de estas funciones, pero este repositorio no las declara ni las verifica.

## Casos de uso

- Asistencia de codigo en local sin GPU: con 940 MiB en disco y unos 1,2 GB de RAM en CPU, se puede ejecutar en portatiles modestos o en servidores sin acelerador para autocompletar funciones y resolver dudas puntuales de programacion.
- Prototipado rapido con Ollama: `ollama run hf.co/SadikNawazAI/sadik-ai-1.5b-gguf:Q4_K_M` permite tener un asistente de codigo operativo en un solo comando, util para pruebas de concepto y demos internas.
- Integracion en el IDE mediante LM Studio: el modelo se carga desde la pestana de chat o por URL directa y sirve como asistente conversacional para explicar errores, generar snippets y redactar pruebas unitarias sencillas.
- Educacion y aprendizaje de programacion: al ser un modelo pequeno y de respuesta rapida, encaja en entornos de ensenanza donde se quiere un tutor de codigo con ejemplos en bloques delimitados y explicacion de compromisos tecnicos.
- Automatizacion de tareas de texto en pipelines ligeros: con llama.cpp se puede invocar mediante `llama-cli` o su API para resumir, reformatear o transformar texto y codigo en scripts por lotes.
- Evaluacion de infraestructura GGUF: sirve como banco de pruebas para medir latencia y throughput en hardware concreto (por ejemplo, la prueba publicada da 6,9 tokens/s en un Intel Core i5-6500T sin GPU) antes de desplegar modelos mayores.
- Base para experimentos de empaquetado y distribucion: util para quien quiera replicar el flujo de publicacion de un GGUF con licencia, NOTICE y checksums en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica medida de rendimiento aportada por el autor es una prueba de velocidad en CPU, que no constituye un benchmark de calidad:

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput | 6,9 tokens/s | Respuesta de codigo de 120 tokens |
| Carga en frio | 4,6 s | Ollama 0.40.16, CPU |
| Hardware | Intel Core i5-6500T (4 nucleos), 16 GB RAM, sin GPU | Cuantizacion Q4_K_M, contexto 4.096 |
| RAM cargada | ~1,2 GB | Ollama en CPU |

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 1,2 GB de RAM en CPU con Q4_K_M; en GPU, el peso de 940 MiB mas overhead de contexto y runtime, por lo que 2 GB de VRAM son suficientes en la practica.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM; el modelo no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, GTX 1650 o iGPU modernas, aunque no hay mediciones publicadas en GPU.
- Cabe en GPU consumer: si, con margen amplio, incluso en tarjetas de gama baja y en Apple Silicon.
- Opciones de despliegue: Ollama (incluida la ejecucion directa desde Hugging Face), LM Studio, llama.cpp (`llama-cli`), Jan y koboldcpp; cualquier runtime que soporte el chat template de Qwen2.
- Latencia y throughput: 6,9 tokens/s y 4,6 s de carga en frio medidos en un i5-6500T de 4 nucleos sin GPU; se espera mayor velocidad en Apple Silicon, CPU x86 modernas o cualquier GPU, pero no hay cifras publicadas para esos entornos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SadikAI 1.5B Preview (este) | 1,5 B | 32.768 | Apache-2.0 | GGUF Q4_K_M | Cuantizacion sin modificar de Qwen2.5-Coder-1.5B-Instruct |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B | 32.768 | Apache-2.0 | safetensors, GGUF | Modelo original de Alibaba Cloud; mismos pesos sin cuantizar |
| SadikAI Medium | 7,9 M (7.866.048) | no disponible | no disponible | no disponible | Modelo propio del mismo autor, usado en el chat en vivo del sitio |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoria; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- No esta entrenado por Sadik Nawaz: los pesos son de Qwen2.5-Coder-1.5B-Instruct y el propio autor lo declara; el nombre "SadikAI" no implica un modelo propio.
- No es el modelo del sitio en vivo: el chat de sadik.totalh.net sigue usando SadikAI Medium (7,9 M); este preview no esta conectado a ese backend.
- El codigo generado debe revisarse: puede producir codigo incorrecto, inseguro o desactualizado.
- Sin capa de moderacion: es el modelo instruct base, sin filtro de contenido ni salvaguardas adicionales.
- Idiomas limitados: la model card declara solo ingles y codigo; el rendimiento en castellano no esta verificado.
- Modelo pequeno (1,5 B): capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos mayores; riesgo de alucinacion en preguntas abiertas y datos concretos.
- Sin datos de benchmarks de calidad publicados en este repositorio.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero exige conservar aviso de licencia y atribucion; si se modifican los pesos, debe declararse en la model card propia.
- Marcas: Qwen y Qwen2.5-Coder pertenecen a sus titulares; este repositorio es un empaquetado independiente no afiliado ni respaldado por Alibaba Cloud.
- Solo se publica la cuantizacion Q4_K_M; no hay otras variantes en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SadikNawazAI/sadik-ai-1.5b-gguf
- Descarga directa del GGUF: https://huggingface.co/SadikNawazAI/sadik-ai-1.5b-gguf/resolve/main/sadik-ai-1.5b-Q4_K_M.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Perfil del autor en Hugging Face: https://huggingface.co/SadikNawazAI
- Sitio web del autor: https://sadik.totalh.net
- Pagina de descarga: https://sadik.totalh.net/pages/sadik-ai-1-5b.html
- SadikAI Medium (chat en vivo): https://sadik.totalh.net/pages/ai.html
