# JackWorry/FitKoc-1.5B

## Resumen

FitKoç-1.5B es un asistente conversacional en turco de 1.543.714.304 parámetros, obtenido mediante un ajuste fino QLoRA sobre el modelo base Qwen2.5-Coder-1.5B-Instruct. Lo publica el usuario JackWorry en HuggingFace como proyecto de bootcamp, con licencia Apache-2.0. Su función es responder preguntas de los socios de un club deportivo ficticio, FormaFit Spor Kulübü, sobre tarifas de membresía, condiciones de alta, horarios, congelación y cancelación de cuotas, precios de entrenador personal, piscina, taquillas, invitados, vestimenta y aparcamiento.

La relevancia del modelo es metodológica más que de rendimiento: demuestra que con 441 ejemplos sintéticos generados con Gemini, un adaptador LoRA de rango 16 y 3 épocas de entrenamiento (13,4 minutos en una GPU T4 con un pico de 3,23 GB de VRAM) se puede convertir un asistente de código genérico en un agente de dominio estrecho que llama herramientas mediante un protocolo JSON. La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, y el sistema completo combina recuperación aumentada (RAG) sobre un guía de socio de 15 secciones con un bucle de agente ReAct y tres herramientas específicas.

El modelo se distribuye en tres formatos (pesos completos en safetensors, adaptador LoRA independiente y una versión GGUF), lo que lo hace desplegable tanto en servidor como en CPU. La longitud de contexto no se especifica en la model card y los resultados publicados se limitan a una evaluación interna con juez LLM, no a benchmarks estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (modelo base Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (según safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no la especifica; se hereda del modelo base, sin cifra confirmada) |
| Tipos de cuantizacion | No disponible en detalle; existe una versión GGUF publicada por el autor, pero no se enumeran los tipos concretos |
| Idiomas soportados | Turco (etiqueta `tr`) exclusivamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos completos), adaptador LoRA/PEFT y GGUF |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Metodo de ajuste | QLoRA, r=16, alpha=32, todas las capas lineales, 3 épocas, lr=2e-4 |
| Dataset de entrenamiento | JackWorry/fitkoc-1.5b-veri (441 ejemplos sintéticos de entrenamiento, 48 de test) |
| Tamano del repositorio | 9,3 GB |
| Descargas / likes | 15 / 0 |
| Fecha de creacion en HuggingFace | 2026-10-17 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only denso de 1,5B parámetros, y se ajusta con QLoRA aplicando adaptadores de rango 16 y alpha 32 sobre todas las capas lineales durante 3 épocas con tasa de aprendizaje 2e-4. El autor documenta que el ajuste completo se ejecutó en 13,4 minutos sobre una GPU T4 con un pico de 3,23 GB de memoria, y que la pérdida de validación bajó de 0,551 a 0,345 de forma sostenida. La elección del modelo base está justificada en la model card: descartó DeepSeek-R1-Distill-Qwen-1.5B porque sus bloques de razonamiento previo consumían el límite de 80-120 tokens de salida y rompían el JSON del agente, y descartó google/gemma-2-2b-it porque su plantilla de chat no admite el mensaje de sistema. También descartó modelos de 3B por duplicar el tiempo de entrenamiento en T4 y la latencia en un Space con CPU.

Los datos son 489 ejemplos sintéticos generados con Gemini y revisados manualmente: 180 de RAG, 150 de identidad, 120 de agente de un turno y 39 de agente de dos turnos, divididos en 441 de entrenamiento y 48 de test. El comportamiento aprendido incluye tres cosas: identidad propia (nombre y cierre de cada respuesta con el símbolo de bíceps, U+1F4AA), respuestas ancladas al guía del club mediante RAG, y emisión de llamadas a herramientas en JSON dentro de un bucle ReAct. Las herramientas son `ders_programi_bilgisi` (horarios de clases desde `ders_programi.csv`), `hesapla` (cálculo aritmético) y `otopark_ucreti` (tarifa de aparcamiento, desarrollada específicamente para el proyecto). No se documenta ninguna innovación arquitectónica propia; el interés técnico está en el pipeline de especialización y en la separación entre adaptador LoRA, pesos fusionados y GGUF.

## Capacidades

- Conversación multi-turno en turco como asistente de atención al socio de un club deportivo, con un registro enérgico y cercano definido en el entrenamiento.
- Identidad propia consolidada: sabe que se llama FitKoç, frente al modelo base, que se identificaba como Qwen o atribuía su desarrollo a Alan Turing.
- Recuperación aumentada (RAG) sobre un guía de 15 secciones con información de cuotas, condiciones, horarios, congelación, cancelación, entrenador personal, piscina, taquillas, invitados, vestimenta y aparcamiento.
- Llamada a herramientas mediante protocolo JSON, con una tasa de selección correcta de herramienta de 0,94 tras el ajuste (0,12 en el modelo base).
- Bucle de agente ReAct de varios pasos: decide herramienta, la invoca y compone la respuesta final con el resultado.
- Cálculo aritmético delegado a herramienta (por ejemplo, duración total de varias clases) y cálculo de tarifas de aparcamiento por horas.
- Recuperación de horarios de clases por día, hora, instructor y sala desde un CSV estructurado.
- Comportamiento de abstención: cuando la respuesta no está en el guía, responde que la información no figura y remite a recepción, en lugar de improvisar.
- Cierre sistemático de cada respuesta con el símbolo de bíceps (U+1F4AA), aprendido como rasgo de estilo.
- No se documentan capacidades de visión, audio, código en producción ni modo de razonamiento extendido; el ajuste sustituye la identidad de asistente de código del modelo base.

## Casos de uso

- Atención al socio en la web o en recepción: el modelo mantiene conversaciones multi-turno en turco sobre cuotas y servicios, apoyándose en RAG sobre el guía de 15 secciones para no depender de conocimiento paramétrico. Es adecuado porque el dominio es cerrado y el coste de una respuesta inventada es alto.
- Consulta de horarios de clases: mediante la herramienta `ders_programi_bilgisi`, responde preguntas del tipo "¿qué días hay pilates?" leyendo día, hora, instructor y sala de un CSV, sin necesidad de reentrenar cuando cambie el calendario.
- Cálculo de tarifas de aparcamiento: la herramienta `otopark_ucreti` permite responder con importes exactos ("5 horas son 100 TL") en lugar de dejar que el modelo de 1,5B haga la aritmética, que es su punto débil.
- Operaciones aritméticas encadenadas sobre el catálogo: la herramienta `hesapla` resuelve sumas de duraciones de clases o de importes de paquetes de entrenador personal, un patrón reutilizable en cualquier asistente comercial de bajo presupuesto.
- Derivación controlada a humano: cuando la pregunta queda fuera del guía (por ejemplo, venta de proteína en polvo o temperatura de la sauna), el modelo responde que no dispone del dato y remite a recepción, lo que reduce el volumen de respuestas erróneas en producción.
- Prototipado de agentes en turco con hardware mínimo: sirve como plantilla para equipos que necesitan un agente con tool calling desplegable en una T4 o incluso en CPU, con un ciclo de iteración de minutos por experimento.
- Material docente para bootcamps: el repositorio incluye dataset, adaptador LoRA, versión GGUF y una tabla de métricas antes/después que documenta el efecto del ajuste, lo que lo convierte en un ejemplo reproducible de extremo a extremo.
- Sustitución de la base de conocimiento en otros dominios: el mismo esquema (RAG + tres herramientas + estilo de identidad) es trasladable a seguros, clínicas o administración de fincas cambiando el guía y regenerando los ejemplos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El autor publica una evaluación propia sobre un conjunto de test de 48 ejemplos, comparando el modelo base con el ajustado:

| Metrica (nombre original) | Descripcion | Base | FitKoç-1.5B |
|---|---|---|---|
| kimlik_ad | Tasa de acierto al declarar su propio nombre | 0,00 | 0,80 |
| kimlik_isaret | Uso del símbolo de bíceps al final de la respuesta | 0,00 | 0,80 |
| ajan_json | Emisión de JSON válido para el agente | 1,00 | 1,00 |
| ajan_arac | Selección correcta de herramienta | 0,12 | 0,94 |
| rag_hakem | Calidad de respuesta RAG según juez LLM | 0,60 | 0,37 |
| rag_isaret | Uso del símbolo de bíceps en respuestas RAG | 0,00 | 0,67 |

Además, se publica una batería cualitativa de 15 preguntas puntuadas por Gemini con escala 1 / 0,5 / 0, con una media de 0,67. Los aciertos incluyen la cuota de estudiante, los precios de entrenador personal (900 TL por sesión, 7.500 TL el paquete de 10), el cálculo de minutos de dos clases de spinning, las tarifas de aparcamiento y las respuestas de abstención correctas. Los fallos se concentran en el horario de la piscina (respondió que estaba "cerrada" en la franja en que está abierta), la política de invitados, la hora de cierre del domingo y la política de ausencias sin cancelar. El descenso de `rag_hakem` de 0,60 a 0,37 está atribuido por el autor a un cambio de juez a mitad de la evaluación (de Gemini Flash a Flash-Lite por agotamiento de cuota), por lo que no es una comparación homogénea.

## Requisitos de hardware

- VRAM para pesos en precisión original: aproximadamente 3,1 GB solo para los pesos en fp16/bf16 (estimación a partir de 1.543.714.304 parámetros); con caché KV y sobrecarga del runtime, el consumo realista se sitúa en torno a 3,5-4 GB.
- VRAM con GGUF cuantizado: aproximadamente 0,9-1,0 GB para Q4_K_M y 1,6 GB para Q8_0 (estimaciones; el repositorio GGUF no publica los tipos ni los tamaños exactos).
- GPU recomendadas: cualquier GPU con 6 GB o más funciona con holgura (RTX 3060, RTX 4060, RTX 4090). En el extremo de servidor, una T4 es suficiente; el propio autor la usó para el entrenamiento con 3,23 GB de pico.
- Cabe en GPU de consumo: sí, en toda la gama actual desde 6 GB, y en modo GGUF cuantizado en iGPU y en CPU.
- Despliegue: transformers + PEFT sobre el adaptador LoRA, fusión del adaptador y servicio con vLLM o TGI, y llama.cpp u Ollama para la ruta GGUF. El autor mantiene un Space sobre CPU, lo que confirma la viabilidad de inferencia sin GPU.
- Latencia y throughput: no se publican cifras. El autor indica únicamente que los modelos de 3B duplicaban aproximadamente el tiempo de respuesta en su Space con CPU respecto a esta variante de 1,5B, sin dar valores absolutos.
- Entrenamiento reproducible: QLoRA completo en 13,4 minutos y 3,23 GB de pico en una T4, con el dataset de 441 ejemplos disponible públicamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| FitKoç-1.5B | 1,54B | No disponible | Asistente de dominio cerrado en turco con RAG y agente ReAct | Apache-2.0 | Ajuste QLoRA de 3 épocas sobre 441 ejemplos; 15 descargas y 0 likes |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | No disponible en la información | Asistente de código generalista | Apache-2.0 | Punto de partida; emite JSON válido (1,00) pero identidad y selección de herramienta casi nulas (0,00 y 0,12) |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B (según denominación) | No disponible en la información | Razonamiento con bloques de pensamiento previo | No disponible en la información | Descartado por el autor: los bloques de razonamiento consumen el límite de 80-120 tokens y rompen la salida JSON del agente |
| google/gemma-2-2b-it | 2B (según denominación) | No disponible en la información | Asistente conversacional generalista | No disponible en la información | Descartado por el autor: su plantilla de chat no admite mensaje de sistema |

La comparación relevante no es de rendimiento bruto sino de encaje: frente a los generalistas, FitKoç sacrifica amplitud por consistencia de dominio, y su ventaja medible se concentra en identidad (0,00 a 0,80) y selección de herramienta (0,12 a 0,94). No hay datos que permitan compararlo con asistentes comerciales de atención al cliente.

## Limitaciones y advertencias

- Alucinación sin contexto: el autor documenta que, cuando no se le proporciona contexto RAG, el modelo inventa reglas como "100 días de membresía gratis y un 25 % de descuento". El uso en producción exige RAG obligatorio.
- Errores persistentes en el conjunto de test: horario de piscina, política de invitados, hora de cierre del domingo y régimen de ausencias sin cancelar, todos con puntuación 0 en la evaluación cualitativa.
- Evaluación no homogénea: el descenso de `rag_hakem` de 0,60 a 0,37 se produjo tras cambiar el juez de Gemini Flash a Flash-Lite, por lo que la comparación antes/después no es limpia en esa métrica.
- Sesgo de idioma: entrenado y evaluado solo en turco; no hay evidencia de comportamiento correcto en castellano ni en otros idiomas, y el estilo con el símbolo de bíceps al final de cada respuesta puede ser inadecuado en contextos formales.
- Dominio ficticio: las cuotas, horarios e instalaciones pertenecen a un club inventado. Reutilizarlo comercialmente exige sustituir el guía, el CSV de clases y las herramientas.
- Volumen de datos muy reducido: 441 ejemplos sintéticos generados por LLM, con artefactos conocidos (omisión del símbolo de bíceps en algunas respuestas RAG y respuestas de identidad sin precio cuando falta contexto).
- Sin validación externa: 15 descargas y 0 likes, sin pipeline declarado, sin benchmarks estándar y sin evaluación por terceros. No hay garantía de reproducibilidad de las métricas publicadas.
- Licencia Apache-2.0: permite uso comercial y modificaciones con obligaciones de atribución y de conservación del aviso de licencia; conviene revisar también los términos del modelo base y del dataset.
- Capacidad de razonamiento y aritmética limitada por el tamano (1,5B): el propio diseño delega los cálculos en herramientas, lo que implica que sin esas herramientas los resultados numéricos no son fiables.
- Cautela con la fecha del repositorio: la model card indica creación el 2026-10-17, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JackWorry/FitKoc-1.5B
- Adaptador LoRA: https://huggingface.co/JackWorry/FitKoc-1.5B-LoRA
- Versión GGUF: https://huggingface.co/JackWorry/FitKoc-1.5B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/JackWorry/fitkoc-1.5b-veri
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Sitio del proyecto: no disponible (el autor indica que se publicará en el escaparate del instructor)
