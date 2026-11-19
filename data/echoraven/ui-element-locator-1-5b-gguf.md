# EchoRaven/ui-element-locator-1.5b-gguf

## Resumen

UI element locator 1.5B es un modelo especializado en *grounding* de interfaces gráficas, desarrollado por EchoRaven y publicado en Hugging Face bajo licencia Apache 2.0. Su tarea es concreta: dado un listado de elementos de accesibilidad de una ventana (líneas con el formato `[n] rol "nombre" ...`) y una descripción breve en lenguaje natural del elemento buscado, el modelo devuelve únicamente el índice numérico del elemento que mejor encaja. Está pensado como primer paso rápido dentro de un agente de tipo computer-use: si el modelo tiene alta confianza se acepta la selección, y si no, se delega en un modelo mayor.

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.543.714.304 parámetros, y se ha afinado mediante LoRA fusionado sobre clics reales de agentes que superaron tareas verificadas en máquinas virtuales macOS y en aplicaciones web simuladas, con descripciones en inglés y chino. El resultado se distribuye en formato GGUF con dos cuantizaciones (Q4_K_M y Q8_0), lo que lo hace desplegable en hardware modesto.

Su relevancia actual reside en la combinación de tamaño reducido, latencia baja y una precisión reportada muy superior a la del modelo base en la tarea específica de localización de elementos (93,5 % en escritorio frente al 5,2 % del base, según la model card). Esto lo convierte en un componente útil para pipelines de automatización de escritorio y pruebas de accesibilidad donde el coste por inferencia importa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-1.5B-Instruct, fine-tuning LoRA fusionado) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q8_0 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,5 mil millones de parámetros, heredado de Qwen2.5-1.5B-Instruct. El autor no detalla la configuración interna (número de capas, dimensiones ocultas, cabezas de atención), pero al ser un derivado directo del base se asume la arquitectura estándar de la familia Qwen2.5. El ajuste se realizó con LoRA sobre el modelo instruct y posteriormente se fusionaron los adaptadores en los pesos finales, que se exportaron a GGUF para inferencia con llama.cpp.

El entrenamiento se apoya en datos de interacción real: clics efectuados por agentes que completaron con éxito tareas verificadas en máquinas virtuales macOS y en aplicaciones web simuladas. Cada ejemplo incluye una descripción del elemento objetivo en inglés y en chino, y el autor indica explícitamente que no se emplearon datos personales. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO adicionales. La innovación principal no es arquitectónica sino de producto: el modelo está entrenado para emitir un único índice y se aprovecha la probabilidad del token de respuesta como señal de confianza calibrada, lo que permite un enrutamiento selectivo hacia un modelo mayor.

## Capacidades

- Localización de elementos de interfaz: recibe una descripción en lenguaje natural y una lista de elementos de accesibilidad, y devuelve el índice del elemento que mejor coincide.
- Salida restringida a un índice numérico, lo que simplifica el parseo y reduce errores de formato en pipelines automatizados.
- Estimación de confianza mediante el producto de las probabilidades de los tokens de dígito de la respuesta, legible a través de `logprobs`.
- Comprensión bilingüe de descripciones en inglés y chino, tanto para la instrucción como para los nombres y roles de los elementos.
- Integración como primer paso de un agente computer-use con escalado a un modelo mayor cuando la confianza es baja.
- Soporte de pistas de desambiguación opcionales (`区分信息：<hint>`) para discriminar entre elementos similares.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento extendido; su alcance es exclusivamente la selección de índices sobre listas textuales.

## Casos de uso

- Automatización de escritorio en macOS: un agente recibe una orden como "pulsa el botón Acerca de del panel derecho", construye la lista de accesibilidad de la ventana activa y consulta al modelo para obtener el índice del elemento a clicar. La precisión reportada del 93,5 % en listas de accesibilidad de macOS lo hace viable como primer filtro.
- Pruebas end-to-end de aplicaciones web: en suites de QA que operan sobre el DOM o sobre árboles de accesibilidad, el modelo traduce descripciones de casos de prueba a selectores de elemento concretos, reduciendo el mantenimiento de localizadores frágiles.
- Enrutamiento con escalado a modelo mayor: en un sistema de dos niveles, las selecciones con confianza superior a 0,95 se aceptan directamente (según el autor, aciertan el 97,5 % de las veces y cubren el 91 % de las filas en escritorio), y el resto se deriva a un modelo de mayor tamaño, bajando el coste medio por acción.
- Asistentes de accesibilidad: dado que trabaja sobre listas de elementos de accesibilidad, puede emplearse para ayudar a usuarios con dificultades motoras a localizar controles descritos en lenguaje natural dentro de una aplicación.
- Agentes de automatización de flujos RPA: integrado en un orquestador que ya dispone del árbol de accesibilidad, sustituye reglas heurísticas de coincidencia por una selección semántica bilingüe con umbral de confianza configurable.
- Extracción de objetivos en pipelines de datos sintéticos: al devolver un índice y una probabilidad, puede usarse para etiquetar automáticamente pares descripción-elemento y generar datos de entrenamiento para modelos de grounding mayores.
- Despliegue en entornos con recursos limitados: con 0,99 GB en Q4_K_M y 1,65 GB en Q8_0, cabe en estaciones de trabajo sin GPU dedicada y en contenedores pequeños, lo que permite ejecutarlo localmente junto al agente.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre conjunto de test reservado, con llama.cpp y decodificación greedy:

| Conjunto | Métrica | Q8_0 (600 filas) | Modelo base |
|---|---|---|---|
| Escritorio (listas de accesibilidad macOS) | Precisión | 93,5 % | 5,2 % |
| Web (aplicaciones web simuladas) | Precisión | 100 % | 55,6 % |

| Umbral de confianza | Precisión de las selecciones aceptadas | Cobertura de filas |
|---|---|---|
| ≥ 0,95 (escritorio) | 97,5 % | 91 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB con Q4_K_M y 1,7 GB con Q8_0, más el espacio de contexto y el overhead del runtime.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; para lotes grandes o baja latencia, tarjetas de gama media como RTX 3060/4060 en adelante. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo Hugging Face, aunque no se detalla la integración con vLLM o TGI.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada; el autor recomienda `max_tokens` de 8 y lectura de `logprobs`, lo que implica respuestas muy cortas y por tanto latencias bajas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UI element locator 1.5B (este) | 1,54 B | no disponible | Grounding de elementos UI | Apache 2.0 | GGUF en HF |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | no disponible en esta ficha | Instrucción general | Apache 2.0 | safetensors y GGUF en HF |
| Alternativas especializadas en grounding UI de tamaño similar | no disponible | no disponible | Grounding de elementos UI | no disponible | no disponible |

La comparación directa con el modelo base es la más informativa: sobre el mismo test reservado, el modelo afinado pasa de 5,2 % a 93,5 % en escritorio y de 55,6 % a 100 % en web, a costa de perder capacidades generales de conversación y de quedar restringido a una única tarea.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve selección de índices sobre listas textuales de elementos; no genera explicaciones, no razona de forma general y no admite otras tareas.
- Dependencia del árbol de accesibilidad: si la lista de elementos está incompleta, desordenada o contiene roles y nombres poco informativos, la precisión caerá sin que el modelo lo advierta.
- Idiomas limitados a inglés y chino; las descripciones en otras lenguas no están cubiertas por el entrenamiento declarado.
- Riesgo de alucinación de índice: el modelo puede devolver un número fuera de rango o correspondiente a un elemento incorrecto, especialmente con descripciones ambiguas; es imprescindible validar el rango del índice antes de actuar.
- La calibración de confianza se reporta solo para escritorio y con Q8_0; no hay datos equivalentes para Q4_K_M ni para el conjunto web, por lo que el umbral de 0,95 no debe trasladarse sin verificación.
- El conjunto de evaluación web (100 % de acierto) procede de aplicaciones simuladas, lo que puede no reflejar la variabilidad de aplicaciones reales.
- Sin datos sobre sesgos demográficos o culturales; el entrenamiento se basa en interacciones de agentes y el autor afirma que no contiene datos personales, pero no se detalla el proceso de filtrado.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución y verificar las condiciones heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EchoRaven/ui-element-locator-1.5b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados a este modelo.
