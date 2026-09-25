# FahrenheitResearch/Zircon-0.6B-v2-mlx

## Resumen

Zircon v2 es un modelo de decisión de 0,6 mil millones de parámetros desarrollado por Fahrenheit Research y publicado en Hugging Face como `FahrenheitResearch/Zircon-0.6B-v2-mlx`. No es un modelo generativo de propósito general: recibe una situación y un conjunto de opciones, y devuelve una probabilidad calibrada para cada opción. Está construido sobre Qwen3-0.6B (Apache 2.0) y ajustado específicamente para tareas de decisión tipificadas: elegir una opción de una lista, responder sí o no, o puntuar en una escala.

Su relevancia inmediata está en el despliegue local: los pesos están cuantizados a 8 bits y empaquetados en formato MLX, de modo que el modelo se ejecuta íntegramente en Apple Silicon sin conexión a la nube. El repositorio ocupa unos 634 MB y el autor reporta una latencia mediana de 83 ms para un caso de cinco decisiones en un MacBook Pro con chip M5, con 30-68 ms por decisión individual.

Frente a enviar cada decisión a un LLM grande, la propuesta es sustituir una llamada de red por un clasificador calibrado local, con una puntuación de Brier de 0,049 y una precisión global del 77% en el conjunto interno de evaluación del autor. Es, por tanto, una pieza de infraestructura para pipelines de agentes y automatización de procesos, no un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3, adaptado como modelo de decisión con salida de probabilidades por opción |
| Parametros totales | 596.049.920 (aproximadamente 0,6 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (no confirmada para esta adaptacion; el modelo base Qwen3-0.6B declara 32.768 tokens) |
| Tipos de cuantizacion | 8 bits sobre pesos MLX; tamano de pesos publicado de aproximadamente 634 MB |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (cuantizacion 8-bit) |
| Version | Zircon v2 (0.6B, MLX 8-bit), publicada en septiembre de 2026 |
| Tipos de decision | elegir una opcion de una lista, si o no, puntuar en una escala |
| Salida | una probabilidad por opcion |
| Runtime | MLX sobre Apple Silicon, ejecucion local |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only denso, y se ha ajustado para producir decisiones tipificadas en lugar de texto libre. La innovacion declarada por el autor es la combinacion de "typed decisions" (tipos de decisión predefinidos) con calibración explícita: la salida no es una etiqueta dura, sino una probabilidad, lo que permite fijar umbrales, comparar alternativas y medir la confianza antes de actuar. La puntuación de Brier reportada (0,049, donde menor es mejor) apunta a que las probabilidades están razonablemente calibradas y no solo ordenadas.

La información pública no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor tampoco especifica el método de ajuste (LoRA, fine-tuning completo o destilación) ni la receta de cuantización a 8 bits. Los benchmarks citados son pruebas internas de Fahrenheit Research de septiembre de 2026 sobre 400 casos (2.000 decisiones) extraídos del conjunto público LocalLLaMA typed-decisions, más conjuntos de test retenidos para las capacidades específicas.

## Capacidades

- Clasificacion y decision tipificada: elegir una opcion de una lista, responder si o no, y puntuar en una escala de 1 a 5.
- Salida probabilistica calibrada por opcion, apta para umbrales y para acumular evidencia en pipelines.
- Precision reportada del 85% en decisiones de si o no, 73% en eleccion de una opcion de una lista, y 73% exacta / 98% dentro de un punto en escalas de 1 a 5.
- Razonamiento matematico limitado a seleccion y verificacion: 87% al seleccionar la respuesta correcta y 83% al detectar un error en una solucion desarrollada.
- Coherencia conversacional: 89% al emparejar una respuesta con su peticion y 96% al emparejar una peticion con su respuesta.
- Ejecucion on-device en Apple Silicon mediante MLX, sin llamadas a red.
- Latencia declarada inferior a 100 ms por caso de cinco decisiones; 30 a 68 ms por decision individual.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Generacion de texto libre, vision, audio o modo de razonamiento extendido: no documentado; el modelo esta orientado a clasificacion, no a generacion.

## Casos de uso

- Procesamiento de facturas: el autor reporta un 82% de precision en este flujo, el mas alto de los cuatro medidos. Se usaria como paso de decision para validar campos, detectar discrepancias y enrutar la factura a aprobacion manual o automatica, con la probabilidad como criterio de escalado.
- Atencion al cliente: con un 79% de precision en el flujo medido, sirve para clasificar tickets, decidir si una respuesta resuelve la consulta y derivar a un agente humano cuando la confianza cae por debajo del umbral.
- Triaje de incidentes de seguridad: el modelo reporta un 75% en este flujo; encaja como primera capa de clasificacion que decide si un evento es benigno, sospechoso o critico antes de invocar herramientas de investigacion mas costosas.
- Observabilidad de trazas de agentes: con un 70%, el flujo con menor precision reportada, puede etiquetar pasos de una traza (exito, bucle, error de herramienta) y alimentar dashboards o sistemas de alerta temprana.
- Validacion de salidas de un LLM mayor: gracias al 89% y 96% en tareas de emparejamiento conversacional, puede actuar como verificador que comprueba si una respuesta generada corresponde realmente a la pregunta formulada, antes de mostrarla al usuario.
- Revision de soluciones matematicas: con un 83% detectando errores en soluciones ya desarrolladas, es util en entornos educativos o de evaluacion automatica para marcar pasos incorrectos sin resolver el problema de nuevo.
- Enrutado local en aplicaciones de escritorio y moviles: al ejecutarse en MLX sobre Apple Silicon con unos 634 MB de pesos, permite tomar decisiones dentro de la propia app sin enviar datos sensibles a un servicio externo.
- Encuestas y formularios con escala: el 98% de acierto dentro de un punto en escalas de 1 a 5 lo hace adecuado para normalizar respuestas abiertas a una escala numerica comparable entre usuarios.

## Benchmarks y rendimiento

Resultados internos de Fahrenheit Research (septiembre de 2026) sobre 400 casos y 2.000 decisiones del conjunto público LocalLLaMA typed-decisions:

| Metrica | Zircon v2 |
|---|---|
| Precision global | 77% |
| Brier score (menor es mejor) | 0,049 |

| Flujo de trabajo | Precision |
|---|---|
| Procesamiento de facturas | 82% |
| Atencion al cliente | 79% |
| Incidentes de seguridad | 75% |
| Observabilidad de trazas de agentes | 70% |

| Tipo de decision | Precision |
|---|---|
| Si o no | 85% |
| Escala de 1 a 5 | 73% exacta, 98% dentro de un punto |
| Elegir una de una lista | 73% |

| Capacidad | Precision |
|---|---|
| Matematicas: seleccionar la respuesta correcta | 87% |
| Matematicas: detectar un error en una solucion | 83% |
| Conversacion: emparejar respuesta con peticion | 89% |
| Conversacion: emparejar peticion con respuesta | 96% |

No se han publicado resultados de benchmarks independientes ni comparaciones con otros modelos de decision en la informacion disponible.

## Requisitos de hardware

- Pesos: aproximadamente 634 MB en cuantizacion de 8 bits; el repositorio completo ocupa 0,6 GB.
- VRAM / memoria unificada estimada: en torno a 1 GB o menos para cargar el modelo en 8 bits, con margen adicional segun el tamano del lote y la longitud de las entradas. No se publican cifras oficiales de memoria pico.
- Hardware medido por el autor: MacBook Pro con chip Apple M5, sobre el que se obtiene una mediana de 83 ms por caso de cinco decisiones y 30 a 68 ms por decision individual.
- Compatibilidad: exclusivamente Apple Silicon mediante MLX. No hay pesos GGUF ni CUDA publicados, por lo que no es desplegable en GPU NVIDIA ni en CPU x86 con las herramientas habituales.
- GPU recomendadas: no aplica en el sentido convencional; el modelo no esta pensado para A100, H100 ni RTX 4090. El equivalente es cualquier Mac con chip de la serie M.
- Opciones de despliegue: runtime MLX (libreria `mlx` en Python) y el ecosistema `mlx-lm`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible. Solo se publican latencias por decision, no decisiones por segundo en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zircon-0.6B-v2-mlx | 596.049.920 | no disponible en la informacion proporcionada | Probabilidad calibrada por opcion (decision tipificada) | Apache 2.0 | Hugging Face, formato MLX 8-bit, solo Apple Silicon |
| Qwen/Qwen3-0.6B (modelo base) | aproximadamente 0,6 mil millones | 32.768 tokens segun la ficha publica del modelo base, no verificado en esta ficha | Texto generado | Apache 2.0 | Hugging Face, safetensors |
| Otros modelos de decision calibrada de 0,6B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con alternativas de la misma categoria no es posible con la informacion disponible: no se han identificado en la busqueda otros modelos de decision calibrada de tamano comparable. Frente al modelo base, la diferencia no es de escala sino de finalidad: Qwen3-0.6B genera texto, mientras que Zircon v2 devuelve probabilidades y esta optimizado para latencia y ejecucion local.

## Limitaciones y advertencias

- Idioma: solo ingles declarado. No hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Validacion limitada: los benchmarks son pruebas internas del propio autor sobre 400 casos y 2.000 decisiones. No hay evaluacion independiente ni replicacion por terceros.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que carece de validacion de la comunidad.
- Precision desigual por flujo: la observabilidad de trazas de agentes se queda en el 70%, y tanto la eleccion de una opcion de una lista como la puntuacion exacta en escala se quedan en el 73%. Son valores que exigen revisión humana o umbrales de confianza bien calibrados.
- Riesgo de calibracion erronea: aunque el Brier score sea bajo, una probabilidad alta no garantiza que la decision sea correcta en dominios alejados de los datos de entrenamiento.
- Sesgos: al derivar de Qwen3-0.6B, hereda los sesgos presentes en los datos de preentrenamiento del modelo base, que no se documentan ni se mitigan de forma explicita en la informacion disponible.
- Restriccion de plataforma: solo funciona en Apple Silicon con MLX. Esto limita su uso en servidores con GPU NVIDIA o AMD y complica el despliegue en produccion sobre infraestructura habitual en la nube.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-0.6B, tambien Apache 2.0.
- No se documentan soporte de tool calling, modo de razonamiento, generacion de texto libre ni procesamiento multimodal; no debe emplearse como sustituto de un LLM conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FahrenheitResearch/Zircon-0.6B-v2-mlx
- Perfil de Fahrenheit Research en Hugging Face: https://huggingface.co/FahrenheitResearch
- Modelos de Fahrenheit Research: https://huggingface.co/FahrenheitResearch/models
- Sitio del autor: https://f-r.co
- Organizacion en GitHub: https://github.com/FahrenheitResearch
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
