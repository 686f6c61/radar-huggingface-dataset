# Jadson/Qwen3.5-4B-Prime-GGUF

## Resumen

Qwen3.5-4B-Prime-GGUF es una colección de cuantizaciones GGUF publicada por el usuario Jadson sobre un ajuste fino de 4,21 mil millones de parámetros derivado de empero-ai/Qwen3.8-4B-Distill, que a su vez procede de Qwen/Qwen3.5-4B. No es una versión oficial de Qwen: es un fine-tune especializado en controlar Emacs a través de python-bridge y MCP, que sustituye las herramientas genéricas de escritura y edición de ficheros por las llamadas ox-bridge-write, ox-bridge-edit y ox-bridge-read.

La arquitectura es un transformer híbrido de 32 capas: 24 emplean atención lineal (gated deltanet) y 8 atención completa, intercaladas cada cuatro capas, con embeddings atados, vocabulario de 248.320 tokens y 262.144 posiciones máximas. Es un modelo denso y exclusivamente de texto: aunque el checkpoint base admite imagen-texto, esta versión no incluye torre de visión ni fichero mmproj.

Su interés práctico está en el nicho de agentes locales de edición de código: el fichero recomendado IQ4_NL ocupa 2,68 GB, todos los ficheros incorporan un bloque de predicción multi-token (MTP) en blk.32 para decodificación especulativa y el autor documenta una mejora de 6,8 a 10,0 tok/s en CPU con cuatro hilos. El repositorio no tiene descargas ni valoraciones y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 32 capas: 24 de atención lineal (gated deltanet) y 8 de atención completa, intercaladas cada 4 capas |
| Parametros totales | 4,21 mil millones (3,7 mil millones excluyendo embeddings, según el autor) |
| Parametros activos | No aplica: modelo denso |
| Longitud de contexto | 262.144 posiciones máximas declaradas; los ejemplos de uso del autor emplean 8.192 |
| Tipos de cuantizacion | GGUF: IQ4_NL, UD-IQ1_M, UD-IQ1_S, UD-TQ1_0, UD-Q1_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Vocabulario | 248.320 tokens, embeddings atados |
| Modalidad | Solo texto (sin torre de visión ni mmproj) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un diseño híbrido que combina atención lineal con puertas tipo gated deltanet en 24 de sus 32 capas y atención completa en las 8 restantes, una cada cuatro capas. Los embeddings están atados a la proyección de salida, lo que convierte token_embd en aproximadamente el 15 % de todos los pesos; por ese motivo el autor mantiene ese tensor en Q4_K en lugar de degradarlo a 2 bits. La cadena de procedencia documentada es Qwen/Qwen3.5-4B → empero-ai/Qwen3.8-4B-Distill → este fine-tune → GGUF.

El ajuste fino se realizó sobre el dataset Jadson/ox-alpha-pi-traces-emacs-bridge, que reescribe las trazas de agente de TeichAI/Ox-Alpha-Pi-Traces para que toda creación y edición de ficheros pase por las herramientas ox-bridge-write, ox-bridge-edit y ox-bridge-read en lugar de las herramientas genéricas de escritura. No se indica en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se emplearon RLHF o DPO, aunque el propio formato de trazas de agente sugiere aprendizaje supervisado sobre conversaciones con llamadas a herramientas. La matriz de importancia se calculó con llama-imatrix desde un intermedio Q8_0 sobre 70 fragmentos a n_ctx=512 con calibration_datav3.txt: la ejecución se interrumpió por presión de memoria en el fragmento 70 de 129, pero la cobertura de tensores es completa (los 248 tensores cuantizables del tronco tienen entradas). Las recetas UD-* no son un tipo de llama-quantize, sino una mezcla dinámica por tensor reproducida con sobreescrituras --tensor-type, en la que se protegen token_embd, los bloques blk.0, blk.1, blk.31 y blk.32 en Q4_K, attn_k y attn_v en Q4_K, y las rutas de control del deltanet con puertas (ssm_alpha, ssm_beta, ssm_conv1d) en F16.

## Capacidades

- Generación de texto y razonamiento en inglés, con soporte de flujo conversacional multi-turno.
- Tool calling mediante MCP: el modelo emite llamadas a ox-bridge-write, ox-bridge-edit y ox-bridge-read a través de python-bridge, en lugar de escribir ficheros directamente.
- Generación de celdas ipython dentro del bucle de agente, incluyendo ejecución de código y posterior uso del resultado.
- Comportamiento de agente multi-paso orientado a edición de ficheros y proyectos dentro de Emacs.
- Decodificación especulativa mediante el bloque MTP de blk.32, activable con --spec-type draft-mtp en llama.cpp.
- Capacidad de servir como servidor HTTP mediante llama-server para integrarlo en otros clientes.
- Sin capacidades de visión: el modelo no procesa imágenes pese a que el checkpoint base sea imagen-texto.
- Sin capacidades de audio ni otras modalidades.
- Multilingüismo limitado: la model card declara únicamente inglés.
- Capacidad no verificada de function calling genérico fuera del ecosistema ox-bridge/MCP: el ajuste está especializado en ese contrato de herramientas.

## Casos de uso

- Edición de código dentro de Emacs: el modelo emite llamadas MCP a ox-bridge-write y ox-bridge-edit, de modo que cada cambio pasa por los buffers del editor y queda bajo el sistema de deshacer y el control de versiones del usuario en lugar de escribir directamente en disco.
- Automatización de refactorizaciones guiadas por agente: con el prompt de sistema incluido, el modelo puede leer un fichero con ox-bridge-read, generar una versión modificada y escribirla con ox-bridge-write, todo dentro de una única sesión de agente con contexto de 8.192 tokens o superior.
- Asistente local de programación en portátil: el fichero IQ4_NL ocupa 2,68 GB, por lo que cabe en equipos con 8 GB de RAM o VRAM y funciona íntegramente en local sin conexión a servicios externos.
- Servidor de herramientas para un equipo pequeño: llama-server puede exponer el modelo con decodificación especulativa MTP activada, sirviendo de backend a clientes MCP o a scripts propios que consuman su API HTTP.
- Generación de scripts y notebooks: el modelo produce celdas ipython y fragmentos de Python, lo que encaja en flujos de trabajo tipo Jupyter donde el resultado de una celda alimenta la siguiente.
- Prototipado de agentes MCP: al estar entrenado específicamente contra herramientas MCP, sirve como banco de pruebas de bajo coste para validar contratos de herramientas, esquemas de parámetros y prompts de sistema antes de escalar a modelos mayores.
- Despliegue en hardware modesto o CPU: con el bloque MTP y cuatro hilos de CPU el autor mide 10,0 tok/s en IQ4_NL, suficiente para tareas interactivas de edición asistida sin GPU dedicada.
- Reproducibilidad de recetas de cuantización: el repositorio documenta la receta completa de imatrix y las sobreescrituras --tensor-type, lo que permite reproducir o auditar el proceso de cuantización sobre este tipo de arquitectura híbrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa, y las búsquedas web realizadas no devolvieron resultados relacionados con el modelo.

El único dato de rendimiento medido que aporta el autor es de throughput, no de calidad, y corresponde a su propia máquina:

| Medicion | Valor |
|---|---|
| Throughput sin MTP (CPU, 4 hilos, IQ4_NL) | 6,8 tok/s |
| Throughput con MTP (CPU, 4 hilos, IQ4_NL) | 10,0 tok/s |
| Mejora relativa | 47 % |

## Requisitos de hardware

- VRAM o RAM para los pesos, según fichero: IQ4_NL 2,68 GB; UD-IQ1_M 1,61 GB; UD-IQ1_S 1,51 GB; UD-TQ1_0 1,45 GB; UD-Q1_0 1,29 GB. Hay que sumar el coste de la caché KV, que crece con la longitud de contexto configurada.
- El fichero recomendado por el autor es IQ4_NL: los ficheros por debajo de 2 bits se publican por completitud y reproducibilidad, no porque funcionen bien.
- Cabe en cualquier GPU de consumo actual con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) e incluso en iGPU con memoria compartida suficiente, dado el tamaño reducido de los pesos en IQ4_NL.
- Funciona íntegramente en CPU: la medición del autor (6,8 a 10,0 tok/s con cuatro hilos) corresponde a ejecución en CPU.
- El bloque MTP de blk.32 añade 15 tensores adicionales, con impacto de memoria mínimo.
- Opciones de despliegue confirmadas en la información disponible: llama.cpp (llama-cli y llama-server). El uso con otros motores como vLLM, TGI u Ollama no está documentado en la información proporcionada, y la arquitectura híbrida con atención lineal puede requerir soporte específico.
- Comando de referencia para decodificación especulativa: llama-cli -m Qwen3.5-4B-Prime-IQ4_NL.gguf --spec-type draft-mtp.
- Comando de referencia para chat con el prompt de sistema obligatorio: llama-cli -m Qwen3.5-4B-Prime-IQ4_NL.gguf -c 8192 -sysf SYSTEM_PROMPT.md.
- No se dispone de latencias ni de cifras de throughput en GPU.

## Comparativa con modelos similares

La información disponible solo permite comparar el modelo con los eslabones de su propia cadena de procedencia. No se han proporcionado datos de alternativas de otros fabricantes en la misma categoría.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Prime (este modelo, GGUF) | 4,21 mil millones | 262.144 posiciones máximas declaradas | Sin benchmarks publicados; 10,0 tok/s en CPU con MTP e IQ4_NL | apache-2.0 | GGUF en HuggingFace |
| Qwen/Qwen3.5-4B (base original) | 4,21 mil millones | 262.144 posiciones máximas declaradas | No disponible | No disponible | Pesos originales, presumiblemente safetensors |
| empero-ai/Qwen3.8-4B-Distill (base del fine-tune) | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Alternativas de otros fabricantes en la franja de 4 B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Especialización estrecha: el fine-tune está entrenado para enrutar la edición de ficheros por ox-bridge-write, ox-bridge-edit y ox-bridge-read. Fuera de ese contrato de herramientas su comportamiento puede degradarse.
- Dependencia de un prompt de sistema obligatorio: sin SYSTEM_PROMPT.md el modelo sigue emitiendo celdas ipython, pero recurre a `! bash python3 -c "..."` en lugar de la pasarela de Emacs, según documenta el autor.
- Solo inglés: la model card declara únicamente el idioma en.
- Sin visión: no incluye torre de imagen ni fichero mmproj, pese a que el checkpoint base sea imagen-texto.
- Cuantizaciones de muy baja precisión degradadas: IQ1_M y IQ1_S sobre un modelo denso de 4 B sufren degradación severa, y TQ1_0 (ternarización diseñada para modelos entrenados en ternario) y Q1_0 no producen salidas utilizables. El autor solo recomienda IQ4_NL.
- Cabecera MTP injertada: los 15 tensores de blk.32 se tomaron del modelo base Qwen/Qwen3.5-4B porque el checkpoint ajustado no incluía cabecera MTP. Esto reduce la tasa de aceptación de los tokens propuestos, aunque no afecta a la corrección porque el modelo destino verifica cada token. La cabecera tampoco recibió calibración con imatrix, ya que un forward pass normal no ejercita el grafo MTP.
- Matriz de importancia incompleta en volumen: se calculó sobre 70 de los 129 fragmentos previstos, aunque la cobertura de tensores sea completa. El propio autor lo atribuye a presión de memoria.
- Riesgo de alucinación: no evaluado en la información disponible; no hay benchmarks ni análisis de errores publicados.
- Sin tracción ni validación externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay evaluaciones de terceros.
- Contexto declarado sin evidencia: se anuncian 262.144 posiciones máximas, pero los ejemplos documentados usan 8.192 y no se aportan pruebas de comportamiento a longitudes largas.
- Licencia y procedencia de datos: el modelo se distribuye bajo apache-2.0, lo que permite uso comercial, pero el dataset de trazas de agente del que deriva el ajuste (TeichAI/Ox-Alpha-Pi-Traces) puede tener condiciones propias que no se detallan en la información disponible.
- Trazabilidad del autor: el nombre del modelo (Qwen3.5-4B-Prime) no corresponde a ninguna nomenclatura oficial de Qwen, y el autor es un usuario individual; conviene verificar la procedencia antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jadson/Qwen3.5-4B-Prime-GGUF
- Prompt de sistema incluido en el repositorio: https://huggingface.co/Jadson/Qwen3.5-4B-Prime-GGUF/blob/main/SYSTEM_PROMPT.md
- Dataset de ajuste fino: https://huggingface.co/datasets/Jadson/ox-alpha-pi-traces-emacs-bridge
- Dataset original de trazas: https://huggingface.co/datasets/TeichAI/Ox-Alpha-Pi-Traces
- Modelo base del fine-tune: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- python-bridge (pasarela Emacs usada por el modelo): https://github.com/manateelazycat/python-bridge
- llama.cpp (motor de inferencia y cuantización): https://github.com/ggml-org/llama.cpp
- Nota: las búsquedas web realizadas para esta ficha no devolvieron resultados relacionados con el modelo, por lo que no se añaden enlaces adicionales de papers, blogs o demos.
