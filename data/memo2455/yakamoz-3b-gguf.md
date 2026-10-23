# Memo2455/Yakamoz-3B-GGUF

## Resumen

Yakamoz-3B-GGUF es la versión cuantizada en formato GGUF (concretamente en `q8_0`, un único archivo de 3,29 GB) del modelo Memo2455/Yakamoz-3B, un ajuste fino de 3.085.938.688 parámetros desarrollado por el usuario Memo2455 en el contexto de un bootcamp. El modelo está especializado en turco (`language: [tr]`) y se distribuye con el objetivo declarado de ejecutarse en CPU sin GPU mediante llama.cpp, lo que lo sitúa en la categoría de modelos pequeños para inferencia local de bajo coste.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto derivado de Qwen (la licencia referenciada es la Qwen Research License Agreement y el enlace apunta a Qwen2.5-3B-Instruct), publicado con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados. No es un modelo de propósito general validado, sino una pieza de un proyecto de bootcamp que incluye una aplicación asociada (carpeta `space/` con `app.py`, `proje.py`, `araclar.py`, `rehber.pdf`, `tesisler.csv` y `test_sorulari.csv`).

El interés práctico reside en su tamaño (3B), su licencia de investigación y su empaquetado GGUF listo para llama.cpp: es un candidato razonable para prototipado offline en turco sobre hardware modesto, siempre que se asuman las limitaciones de licencia y la ausencia de evaluación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo derivado de la familia Qwen (licencia Qwen Research referenciada a Qwen2.5-3B-Instruct) |
| Parámetros totales | 3.085.938.688 (aproximadamente 3,09 B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `q8_0` (GGUF); no se publican otras variantes |
| Idiomas soportados | Turco (`tr`) |
| Licencia | `other` / Qwen Research License Agreement (`qwen-research`) |
| Formato de pesos | GGUF (`yakamoz-3b-q8_0.gguf`, 3,29 GB) |
| Modelo base | Memo2455/Yakamoz-3B |
| Tamaño del repositorio | 3,3 GB |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF, DPO o SFT. La model card únicamente indica que el modelo se construyó «with Qwen» y remite a la Qwen Research License Agreement, cuyo enlace apunta al repositorio de Qwen2.5-3B-Instruct; esto sugiere que el modelo base de la cadena (Memo2455/Yakamoz-3B) parte de un checkpoint Qwen de 3B, pero el autor no detalla ni el checkpoint exacto ni el procedimiento de ajuste.

El único dato técnico verificable del proceso es la cuantización: el repositorio contiene una única conversión a `q8_0` en formato GGUF, pensada para ejecución en CPU con llama.cpp. El autor menciona además que el proyecto incluye código auxiliar (`araclar.py`, presumiblemente utilidades o herramientas de la aplicación), un PDF de referencia (`rehber.pdf`) y ficheros CSV de dominio (`tesisler.csv`, `test_sorulari.csv`), pero no se especifica si el ajuste fino se realizó sobre esos datos ni con qué metodología (LoRA, QLoRA, full fine-tuning). Toda innovación técnica adicional (atención lineal, decodificación especulativa, modos de razonamiento) debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en turco, orientada a diálogo multi-turno.
- Comprensión y respuesta sobre documentación de dominio, a juzgar por los materiales publicados junto al proyecto (`rehber.pdf`, `tesisler.csv`); no se especifica si es una capacidad entrenada o meramente soportada por la aplicación.
- Ejecución en CPU sin GPU mediante llama.cpp, según declara el autor.
- Integración con el ecosistema GGUF (llama.cpp y derivados), lo que habilita su uso desde aplicaciones locales.
- No se ha confirmado soporte nativo de tool calling o function calling a nivel de modelo; el archivo `araclar.py` de la carpeta `space/` pertenece a la aplicación de demostración, no al modelo.
- No se ha confirmado soporte de agentes, razonamiento multi-paso, visión, audio ni modo «thinking».
- Capacidad multilingüe: limitada al turco según los metadatos (`language: [tr]`); no se declaran otros idiomas.

## Casos de uso

- Asistente de información sobre instalaciones o servicios: el proyecto incluye `tesisler.csv`, lo que sugiere un uso como chatbot que responde consultas sobre un catálogo de instalaciones; el modelo de 3B puede sostener diálogos acotados en turco con un coste de inferencia mínimo.
- Consulta de documentación en PDF en local: combinado con `rehber.pdf` y una capa de recuperación (RAG) sencilla, sirve para desplegar un asistente documental totalmente offline en turco, sin enviar datos a servicios externos.
- Generación de cuestionarios y material de evaluación: la presencia de `test_sorulari.csv` apunta a un uso educativo; el modelo puede reformular preguntas, generar variantes o redactar explicaciones a partir de un banco de ítems existente.
- Despliegue en hardware sin GPU: al ejecutarse en CPU con llama.cpp, es apto para prototipos en portátiles, mini-PC o entornos con virtualización sin acceso a aceleradores, donde un modelo mayor no cabría.
- Asistente conversacional privado para uso interno: al ser un GGUF local de 3,29 GB, encaja en escenarios donde la confidencialidad impide usar APIs externas y el volumen de consultas no justifica infraestructura GPU.
- Base para experimentación académica o de bootcamp: sirve como punto de partida reproducible para prácticas de cuantización, evaluación en turco o comparación de pipelines llama.cpp frente a otros runtimes.
- Prototipado de interfaces de chat específicas de dominio: la carpeta `space/` (con `app.py` y `requirements.txt`) proporciona una plantilla de aplicación que puede adaptarse a otros verticales en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones en turco, y el autor remite al repositorio del modelo base (Memo2455/Yakamoz-3B) para el informe del proyecto y las mediciones, sin que esos datos estén disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM para inferencia: el archivo `q8_0` ocupa 3,29 GB; se recomienda reservar entre 4 y 5 GB de memoria para el modelo más el contexto y el overhead de llama.cpp.
- Ejecución en CPU: viable según el autor; un equipo con 8 GB de RAM puede cargar el modelo, aunque el throughput dependerá del número de núcleos y del ancho de banda de memoria.
- GPU consumer: cabe holgadamente en cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.); también en iGPU con memoria unificada suficiente.
- GPU de datacenter: A100, H100 y similares son innecesarias para este tamaño; su uso solo se justificaría por agregación de muchas instancias simultáneas.
- Opciones de despliegue: llama.cpp (referencia explícita del autor), llama-cpp-python, Ollama o LM Studio mediante importación del GGUF, y servidores compatibles con la API de endpoints indicada en los tags (`endpoints_compatible`).
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Yakamoz-3B-GGUF | 3,09 B | No disponible | Qwen Research (uso comercial restringido) | GGUF `q8_0` en HuggingFace, 0 descargas | Ajuste en turco sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,09 B | 32K (según el modelo original referenciado) | Qwen Research | Pesos completos y múltiples cuantizaciones, ampliamente adoptado | Base probable de la cadena; multilingüe y con evaluación publicada por el autor original |
| Llama 3.2 3B Instruct | 3,21 B | 128K (según el modelo original) | Llama 3.2 Community License | Pesos y GGUF muy extendidos | Multilingüe, incluido turco; ecosistema de herramientas amplio |
| Phi-3.5-mini-instruct | 3,8 B | 128K (según el modelo original) | MIT | Pesos y GGUF extendidos | Enfoque en razonamiento y código; no especializado en turco |

Nota: los datos de contexto y licencia de las alternativas corresponden a sus respectivos modelos originales; no se dispone de evaluaciones comparativas en turco que permitan situar a Yakamoz-3B frente a ellas.

## Limitaciones y advertencias

- Licencia: `qwen-research` implica la Qwen Research License Agreement, que restringe el uso comercial. Cualquier despliegue en producción con ánimo de lucro requiere revisar el texto de la licencia y, en su caso, obtener autorización.
- Idiomas: el modelo declara únicamente turco; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Ausencia total de benchmarks: no hay métricas de calidad, lo que impide estimar su rendimiento frente al modelo base ni detectar posibles regresiones del ajuste fino.
- Riesgo de alucinación: con 3B parámetros y sin evaluación publicada, la generación de datos falsos en consultas de dominio (instalaciones, documentación) es un riesgo alto; se recomienda anclar las respuestas a fuentes mediante RAG y validación.
- Sesgos: no se documenta la composición del dataset de ajuste ni procesos de mitigación; los sesgos del corpus turco utilizado son desconocidos.
- Contexto: se desconoce la ventana real soportada por este ajuste, lo que impide planificar cargas de documentos largos.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad; el autor indica que la demo no pudo publicarse como Space por limitaciones de cuenta.
- Empaquetado: solo existe `q8_0`; no hay variantes `q4_k_m` o `q5_k_m` que reduzcan el consumo de memoria para entornos más ajustados.
- Trazabilidad: la metodología de ajuste, el checkpoint Qwen exacto y las métricas del proyecto no están detalladas en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Memo2455/Yakamoz-3B-GGUF
- Modelo base: https://huggingface.co/Memo2455/Yakamoz-3B
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Repositorio de referencia de Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Hub de modelos GGUF en HuggingFace: https://huggingface.co/GGUF-Models
