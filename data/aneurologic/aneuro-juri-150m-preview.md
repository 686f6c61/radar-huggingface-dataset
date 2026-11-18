# Aneurologic/aneuro-juri-150m-preview

## Resumen

Aneuro Juri 150M (preview) es un modelo de decisión desarrollado por Aneurologic. No genera texto: recibe un contexto y una o varias preguntas (de tipo sí/no o de elección entre opciones) y devuelve probabilidades calibradas en un único forward pass. Está construido sobre el cross-encoder `cross-encoder/ettin-reranker-150m-v1`, de arquitectura ModernBERT, con 149.609.473 parámetros, y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y no comercial.

El modelo se presenta explícitamente como una preview y su primer lanzamiento público. El autor reconoce que no lidera ningún leaderboard: obtiene un índice de 20,70 en la suite pública Decision Index 0.3, por debajo de comparadores como Crivo-150M (34,39) o Amber-68M (37,87). Su interés radica en el formato de salida (probabilidades calibradas por pregunta en lugar de texto generado) y en su tamaño reducido, que permite ejecutarlo en hardware de consumo y en portátiles.

Es relevante para desarrolladores que necesitan un clasificador de decisiones ligero para enrutamiento de tool calling, filtrado previo o componentes de sistemas de agentes donde la latencia y el coste importan más que la precisión máxima. El autor anuncia un modelo pequeño más rápido para diciembre y dispone de una variante de 1B con mejor rendimiento (índice 31,89).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), derivada de `cross-encoder/ettin-reranker-150m-v1` |
| Parametros totales | 149.609.473 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrenado con secuencias de hasta 2.048 tokens; entradas más largas no probadas |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `cross-encoder/ettin-reranker-150m-v1`, un cross-encoder de 150M parámetros con arquitectura ModernBERT (a su vez derivado de `jhu-clsp/ettin-encoder-150m`, MIT). Sobre esa base se realizó un fine-tuning de dos épocas (23.556 pasos) con aproximadamente 429.000 registros de decisión, secuencias de hasta 2.048 tokens y una función de pérdida que combina entropía cruzada con el objetivo Brier, lo que explica la orientación a probabilidades calibradas.

Los datos de entrenamiento provienen de tres familias: tareas de decisión tipadas procedentes de datasets públicos recopilados por tasksource (solo aquellos cuya dataset card declara licencia permisiva), datos de decisión generados por el propio autor, y datasets de tool use convertidos a formato de decisión (ToolACE, Hermes function calling, glaive-function-calling-v2) junto con el conjunto de entrenamiento When2Call (CC BY 4.0). Cada registro se filtró contra la suite de evaluación mediante un filtro de solapamiento de contenido y se eliminaron los registros marcados. El autor advierte que parte de estos datasets fueron generados con modelos de lenguaje de terceros, cuyos términos podrían aplicar al uso del modelo.

Cada pregunta se evalúa como su propia secuencia (contexto más pregunta) y todas las preguntas de una llamada se ejecutan en un único forward pass batcheado, de modo que el tiempo crece con el número de preguntas.

## Capacidades

- Clasificación de decisiones binarias (yes/no) con probabilidades calibradas.
- Elección entre múltiples opciones (`choice`) con distribución de probabilidades por opción; el orden de las opciones no afecta al resultado.
- Procesamiento de contexto como cadena de texto o diccionario plano (renderizado como líneas `key: value`).
- Soporte de tool calling a nivel de decisión: determinar si una petición requiere una herramienta y cuál debe invocarse primero.
- Ejecución en lote de varias preguntas en un solo forward pass.
- Inferencia en CUDA, Apple GPU (MPS) y CPU.
- No genera texto, no mantiene conversación y no tiene modo de razonamiento explícito.
- Solo inglés.

## Casos de uso

- Enrutamiento de tool calling en agentes: dado el mensaje del usuario y la lista de herramientas disponibles, decidir en un solo paso si hace falta una herramienta y cuál invocar primero, con la probabilidad asociada para aplicar umbrales de confianza.
- Filtro previo de peticiones: clasificar si una consulta requiere búsqueda web, acceso a calendario o envío de correo antes de invocar un LLM mayor, reduciendo coste y latencia en el pipeline.
- Desambiguación de intenciones: usar preguntas de tipo `choice` para mapear una frase ambigua a una de varias acciones predefinidas, con distribución de probabilidad para detectar casos dudosos.
- Componente de sistemas de agentes multi-paso: encadenar decisiones sucesivas (¿necesita herramienta? ¿cuál? ¿requiere confirmación?) aprovechando el batching de preguntas en un único forward pass.
- Clasificación de texto ligera en producción: al ser un encoder de 150M con licencia Apache-2.0, puede desplegarse como clasificador binario o multietiqueta en servicios de bajo coste y en hardware de consumo.
- Evaluación y anotación asistida: generar probabilidades calibradas sobre pares contexto-pregunta para priorizar revisiones humanas o medir la confianza de un etiquetado automático.
- Prototipado en portátil: con ~70 ms por pregunta en GPU de un M1 de 2020 y ~115 ms en CPU, sirve para iterar localmente sobre lógicas de decisión antes de escalar a la variante de 1B.

## Benchmarks y rendimiento

Resultados del autor en la suite pública Decision Index 0.3 (37 benchmarks públicos en cinco áreas; corregido por azar, 0 = aleatorio), ejecutados con su propio pipeline y hardware:

| Modelo | Índice público | Licencia |
|---|---:|---|
| d1-2B | 51,22 | LFM Open License |
| Crivo-1B | 47,77 | CC BY-NC 4.0 |
| Amber-68M | 37,87 | CC BY-NC 4.0 |
| Crivo-150M | 34,39 | CC BY-NC 4.0 |
| Aneuro Juri 150M (preview) | 20,70 | Apache-2.0 |

Desglose por área (skill): conocimiento 0,05; lenguaje 0,14; recuperación 0,42; herramientas 0,36; artes 0,08. La dispersión entre semillas de entrenamiento es de aproximadamente 1 a 1,4 puntos de índice.

Familias de tareas retenidas (36 fuentes nunca usadas en entrenamiento, 6.176 preguntas): accuracy 0,57; Brier 0,54; error de calibración esperado 0,13.

Velocidad declarada:

| Hardware | Configuración | Tiempo por pregunta |
|---|---|---|
| NVIDIA GH200 | arnés de evaluación, mediana | ~17 ms |
| Apple M1 (2020), GPU Apple | PyTorch fp32, 256 tokens | ~70 ms |
| Apple M1 (2020), CPU | PyTorch fp32, 256 tokens | ~115 ms |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 149,6M parámetros en fp32 los pesos ocupan aproximadamente 0,6 GB, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de memoria libre; el autor reporta tiempos en NVIDIA GH200 y en GPU integrada de Apple M1.
- Cabe en GPU de consumo: sí, incluidas GPU de gama baja y portátiles; también funciona en CPU.
- Opciones de despliegue: PyTorch con transformers y safetensors mediante el wrapper `juri` incluido en el repositorio (`Juri.load(path)`), con soporte de CUDA, MPS y CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~17 ms por pregunta en GH200 (mediana del arnés de evaluación), ~70 ms en GPU de M1 y ~115 ms en CPU de M1 con 256 tokens en fp32. El tiempo escala con el número de preguntas al evaluarse cada una como secuencia propia.

## Comparativa con modelos similares

| Modelo | Parámetros | Índice público | Licencia | Formato |
|---|---:|---:|---|---|
| Aneuro Juri 150M (preview) | 150M | 20,70 | Apache-2.0 | safetensors |
| Crivo-150M | 150M | 34,39 | CC BY-NC 4.0 | no disponible |
| Amber-68M | 68M | 37,87 | CC BY-NC 4.0 | no disponible |
| Crivo-1B | ~1B | 47,77 | CC BY-NC 4.0 | no disponible |
| d1-2B | ~2B | 51,22 | LFM Open License | no disponible |

Los comparadores son re-ejecuciones del propio autor con el mismo pipeline y hardware, no resultados publicados por terceros. La ventaja diferencial de Aneuro Juri 150M frente a Crivo-150M y Amber-68M es la licencia Apache-2.0, que permite uso comercial sin restricciones, a costa de un índice notablemente inferior. La variante de 1B del mismo autor alcanza un índice de 31,89 según la model card.

## Limitaciones y advertencias

- Solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Entrenado con entradas de hasta 2.048 tokens; el comportamiento con entradas más largas no está probado.
- Débil en algunos benchmarks de tool use: simulador de electrodomésticos (skill 0,00; solo cuenta si todos los ajustes de dispositivo son correctos) y API-Bank (skill 0,32).
- Las probabilidades están calibradas en tipos de tarea familiares, menos en los desconocidos (error de calibración 0,13 en familias retenidas); puede equivocarse con alta confianza.
- No es un guardarraíl de seguridad ni se ha probado para decisiones de alto riesgo; el autor recomienda validar con datos propios antes de confiar en él.
- Es una preview: el autor la describe como no líder en leaderboards y anuncia su sustitución por un modelo más rápido en diciembre.
- Parte de los datos de entrenamiento fueron generados con modelos de lenguaje de terceros, cuyos términos de los proveedores podrían aplicar al uso del modelo.
- No se documentan cuantizaciones ni integraciones con motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aneurologic/aneuro-juri-150m-preview
- Variante de 1B: https://huggingface.co/Aneurologic/aneuro-juri-1b-preview
- Modelo base: https://huggingface.co/cross-encoder/ettin-reranker-150m-v1
- Encoder original Ettin: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- Sitio del autor: https://aneurologics.com
