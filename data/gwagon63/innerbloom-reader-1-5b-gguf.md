# gwagon63/innerbloom-reader-1.5b-GGUF

## Resumen

Innerbloom reader 1.5B es un modelo de lenguaje especializado en el análisis estructurado de entradas de diario personal. Lo desarrolla gwagon63 como componente del proyecto Innerbloom, una aplicación de journaling con IA local-first. A partir de una entrada de texto, el modelo devuelve un JSON compacto con la emoción principal (entre 16 clases), su intensidad en una escala de 1 a 10, un resumen de una línea, etiquetas, temas y las personas nombradas en el texto.

El modelo parte de Qwen2.5-1.5B-Instruct (1.777.088.000 parámetros) y se ha afinado mediante QLoRA sobre 1.199 entradas ficticias en inglés. Se distribuye únicamente en formato GGUF cuantizado a Q8_0, pensado para ejecutarse localmente a través de Ollama, con un consumo de 1.9 GB de disco y unos 2.6 segundos por entrada en un Mac M1 de 8 GB.

Su relevancia radica en que demuestra que un modelo de 1.5B parámetros, con un ajuste fino dirigido y una edición de pesos específica para corregir el sesgo entre clases de emoción, puede superar a un modelo de 7B en una tarea de clasificación acotada, manteniendo la inferencia en hardware de consumo. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Q8_0 (publicada); Q4_K_M evaluada y descartada por perdida de calidad (0.672 en validacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5B parámetros. El entrenamiento se realizó con QLoRA (rank 16, alpha 32, tasa de aprendizaje 2e-4, parada temprana sobre la pérdida de validación) sobre 1.199 entradas de diario ficticias en inglés. Los objetivos de entrenamiento combinan las etiquetas de emoción, intensidad y personas, junto con resumen, etiquetas y temas generados por qwen2.5:7b. El coste total fue de aproximadamente 6.5 unidades de cómputo de Colab A100.

Tras el ajuste fino, los pesos se fusionaron, se convirtieron a GGUF con llama.cpp y se cuantizaron a Q8_0. La innovación técnica más destacable es una edición de pesos posterior: dado que Qwen2.5-1.5B comparte una única tabla para leer y escribir tokens, el autor añadió una tabla de salida separada y desplazó las filas de los primeros tokens de 11 emociones a lo largo del estado oculto final medio. El sesgo por emoción se ajustó solo con las entradas de entrenamiento, mediante ascenso por coordenadas sobre macro-F1 validado con 5-fold cross-validation. La capacidad de lectura del modelo no se ve afectada por esta edición. Esta corrección elevó el macro-F1 de validación de 0.711 a 0.752 y el de test de 0.702 a 0.746.

## Capacidades

- Clasificación de emociones en 16 clases: happy, sad, anxious, calm, grateful, frustrated, excited, reflective, hopeful, tired, angry, content, lonely, proud, overwhelmed y neutral.
- Estimación de intensidad emocional en una escala de 1 a 10.
- Generación de un resumen de una línea de la entrada.
- Extracción de etiquetas y temas del texto.
- Extracción de las personas nombradas en la entrada.
- Salida estructurada en JSON compacto, adecuada para consumo programático.
- Generación de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct (no evaluada en esta ficha).
- Capacidades multilingües: no disponibles; el modelo solo ha sido entrenado y evaluado en inglés.
- Soporte de tool calling, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis automático de entradas de diario en la aplicación Innerbloom: el modelo lee cada entrada y devuelve emoción, intensidad, resumen, etiquetas, temas y personas en un único JSON, integrándose en el flujo de la app cuando Ollama tiene el modelo disponible.
- Aplicaciones de journaling local-first: al ejecutarse en Ollama con 1.9 GB de disco y unos 2.6 segundos por entrada en un Mac M1 de 8 GB, permite procesar diarios personales sin enviar datos a la nube.
- Etiquetado y organización de corpus de texto breve en inglés: la extracción de temas y etiquetas facilita la clasificación temática de entradas o notas para su posterior búsqueda y filtrado.
- Seguimiento de tendencias emocionales: la combinación de emoción e intensidad (1-10) permite construir series temporales de estado emocional a partir de las entradas procesadas.
- Extracción de entidades de personas: el campo `people` con F1 de 0.923 en test sirve para construir grafos de menciones o índices de personas en un diario o corpus de notas.
- Prototipado rápido de pipelines de análisis de texto con modelos pequeños: su licencia Apache 2.0 y su formato GGUF permiten desplegarlo en entornos con recursos limitados para validar flujos de clasificación emocional antes de escalar a modelos mayores.
- Sustitución de modelos mayores en tareas acotadas: en la tarea de lectura de entradas supera a qwen2.5:7b en macro-F1 (0.746 frente a 0.652) con un tercio del tiempo por entrada (2.6 s frente a 13.3 s) y menos de la mitad de tamaño (1.9 GB frente a 4.7 GB).

## Benchmarks y rendimiento

Resultados sobre el split de test bloqueado de Innerbloom: 400 entradas ficticias, evaluadas una sola vez, con el mismo prompt, temperatura 0.3 y semilla 7, todo ejecutado en Ollama sobre el mismo Mac.

| Metrica | qwen2.5:7b | Este modelo antes de la edicion | Este modelo |
|---|---|---|---|
| Macro-F1 de emocion (16 clases) | 0.652 | 0.702 | 0.746 |
| Precision de emocion (alternativas defendibles) | 0.795 | 0.825 | 0.853 |
| Error de intensidad 1-10 (MAE) | 1.155 | 0.777 | 0.795 |
| Lecturas fallidas | 0 | 0 | 0 |
| F1 de personas | 0.823 | 0.916 | 0.923 |
| Nombres inventados | 9 | 3 | 2 |
| Segundos medianos por entrada | 13.3 | 3.4 | 2.6 |
| Tamano | 4.7 GB | 1.6 GB | 1.9 GB |

En el split de validación de 402 entradas el mismo modelo obtuvo 0.752 de macro-F1, lo que confirma que el resultado se mantiene en entradas no vistas. Un segundo anotador etiquetó 100 entradas de validación a ciegas: kappa de Cohen de 0.84 con las etiquetas originales y 99% de acuerdo permitiendo alternativas defendibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo ocupa 1.9 GB en disco en Q8_0, por lo que se puede ejecutar con holgura en GPUs con 4 GB o más de VRAM (estimación basada en el tamaño del archivo, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería ser suficiente en Q8_0.
- Cabe en GPU consumer: sí; el autor lo ejecuta en un Mac M1 de 8 GB de memoria unificada.
- Opciones de despliegue: Ollama (método documentado por el autor, con `ollama pull hf.co/gwagon63/innerbloom-reader-1.5b-GGUF:Q8_0`), llama.cpp (formato GGUF nativo), y cualquier runtime compatible con GGUF.
- Latencia y throughput: 2.6 segundos medianos por entrada en un Mac M1 de 8 GB con Ollama, temperatura 0.3 y semilla 7. No se han publicado datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 emocion (test Innerbloom) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| innerbloom-reader-1.5b (este modelo) | 1.5B | no disponible | 0.746 | 1.9 GB (Q8_0) | Apache 2.0 | Hugging Face (GGUF) |
| qwen2.5:7b | 7B | no disponible | 0.652 | 4.7 GB | Apache 2.0 | Ollama, Hugging Face |
| jinaai/reader-lm-1.5b (via tensorblock) | 1.5B | no disponible | no disponible | GGUF (varias cuantizaciones) | no disponible en la busqueda | Hugging Face (GGUF) |

La comparación con qwen2.5:7b procede de la propia model card del autor y se limita a la tarea de lectura de entradas de Innerbloom. jinaai/reader-lm-1.5b es un modelo de 1.5B orientado a lectura de contenido web (conversión HTML a Markdown), por lo que la comparación directa en clasificación emocional no es aplicable; se incluye como referencia de tamaño y formato.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con entradas ficticias en inglés; ninguna entrada proviene de un diario real, por lo que el comportamiento con escritura real puede diferir.
- El sarcasmo es el punto débil: solo unas 4 de 9 entradas sarcásticas del test se leyeron correctamente, el mismo resultado que el modelo de 7B.
- No es una herramienta de seguridad ni médica: no detecta riesgo de crisis. Innerbloom realiza esa comprobación por separado, y el modelo no debe usarse para juzgar la salud mental de ninguna persona.
- Las etiquetas y las entradas fueron escritas por un único autor, con una segunda persona revisando solo una muestra.
- Solo se ha probado con el prompt propio de Innerbloom (`build_prompt` en `innerbloom_core/analysis.py`); otros prompts o tareas no están evaluados.
- La cuantización Q4_K_M se descartó por pérdida de calidad (0.672 en validación frente a 0.752 en Q8_0), por lo que solo se publica Q8_0.
- Licencia Apache 2.0, igual que el modelo base; permite uso comercial sin restricciones adicionales conocidas.
- Riesgo de alucinación: se registraron 2 nombres inventados en el test, frente a 9 del modelo de 7B. El autor no documenta sesgos demográficos o culturales específicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-08; se trata de un modelo reciente y sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gwagon63/innerbloom-reader-1.5b-GGUF
- Repositorio del proyecto Innerbloom: https://github.com/GhanshyamPaunikar/innerbloom
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Referencia de formato GGUF (reader-lm-1.5b de tensorblock): https://huggingface.co/tensorblock/reader-lm-1.5b-GGUF
