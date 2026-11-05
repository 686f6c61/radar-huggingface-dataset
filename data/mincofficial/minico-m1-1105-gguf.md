# Mincofficial/Minico-M1-1105-GGUF

## Resumen

Minico M1 1105 es un modelo de lenguaje de 354.483.968 parámetros (aproximadamente 350M) especializado en razonamiento con niveles de esfuerzo configurables. Lo desarrolla el usuario Mincofficial como un ajuste fino del modelo LiquidAI/LFM2.5-350M de Liquid AI, y esta versión concreta es la distribución en formato GGUF pensada para inferencia local mediante llama.cpp, Ollama y LM Studio. Su propuesta principal es ofrecer un control explícito del coste de razonamiento mediante cinco niveles (`off`, `low`, `medium`, `high`, `max`) que determinan cuántos tokens de "pensamiento" genera el modelo antes de responder.

El modelo resuelve el problema de adaptar un modelo pequeño (350M) a tareas de razonamiento en dispositivos con recursos limitados, permitiendo al desarrollador elegir entre respuestas inmediatas y cadenas de razonamiento más largas según la latencia y precisión que necesite. Al estar cuantizado en GGUF con tamaños que van de 229 MB (Q4_K_M) a 711 MB (F16/BF16), puede ejecutarse en hardware de consumo e incluso en entornos on-device.

Es relevante ahora por su enfoque en eficiencia y control del razonamiento en un rango de parámetros muy pequeño, un nicho donde la mayoría de modelos con "thinking mode" superan los miles de millones de parámetros. La información pública disponible es escasa (cero descargas y cero likes en el momento de la consulta, sin benchmarks en la model card del repo GGUF), por lo que esta ficha se limita a lo declarado por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor indica que deriva de LFM2.5-350M, familia LFM2; no se detalla la arquitectura exacta en la información proporcionada) |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (229 MB, imatrix), Q6_K (293 MB, imatrix), Q8_0 (379 MB, recomendado), F16 (711 MB), BF16 (711 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-350M, de la familia LFM2 de Liquid AI. Según la model card, Minico M1 1105 es una versión modificada de ese modelo obtenida mediante ajuste fino con SFT, DPO y GRPO, además de fusión de pesos (weight merging). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles de la arquitectura interna (tipo de atención, capas, dimensiones ocultas).

La innovación técnica destacable es el sistema de niveles de esfuerzo de razonamiento (`off`, `low`, `medium`, `high`, `max`), implementado a través de la plantilla de chat. El modelo fue entrenado con conversaciones que mantienen un único ajuste de esfuerzo de principio a fin, lo que condiciona su uso: no se recomienda cambiar el nivel de esfuerzo ni activar/desactivar el pensamiento a mitad de una conversación. La plantilla acepta alias (`none`, `minimal`, `xhigh`, entre otros) y el parámetro `enable_thinking=False`, que equivale a `off`; los valores desconocidos caen a `medium`.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con cinco niveles de esfuerzo configurables (`off`, `low`, `medium`, `high`, `max`), con presupuestos máximos de tokens nuevos declarados por el autor: 1024 (`off`), 640 (`low`), 1152 (`medium`), 2368 (`high`) y 4608 (`max`).
- Modo "thinking" con bloque de pensamiento explícito; en `off` se rellena un bloque de pensamiento vacío para responder de inmediato.
- Compatibilidad con endpoints (`endpoints_compatible`) según las etiquetas del repo.
- Ejecución on-device gracias al tamaño reducido y a las cuantizaciones GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible más allá del modo de razonamiento declarado.
- Capacidades multilingües: solo inglés declarado.
- Visión o audio: no disponible.

## Casos de uso

- Asistentes locales en dispositivos con poca memoria: con la cuantización Q4_K_M (229 MB) el modelo puede desplegarse en portátiles, mini-PC o entornos embebidos donde un modelo de miles de millones de parámetros no cabría, usando el nivel `off` o `low` para respuestas rápidas.
- Clasificación y respuesta a consultas simples en inglés: con el nivel `off` el modelo responde sin cadena de pensamiento, adecuado para tareas de baja latencia como etiquetado, resúmenes cortos o respuestas FAQ.
- Razonamiento ligero en pipelines de CI o scripts: mediante llama.cpp con `--jinja` y `reasoning_effort` fijado, se puede invocar el modelo desde herramientas de línea de comandos para tareas de análisis o generación de texto acotadas.
- Prototipado de aplicaciones conversacionales con Ollama o LM Studio: el modelo se integra con un solo comando (`ollama run hf.co/...`) y permite iterar sobre prompts y niveles de esfuerzo sin infraestructura GPU dedicada.
- Evaluación de técnicas de razonamiento controlado: sirve como banco de pruebas para estudiar el compromiso entre tokens de pensamiento y calidad de respuesta en modelos pequeños, comparando los cinco niveles sobre el mismo conjunto de prompts.
- Educación y demos de IA on-device: al ser un modelo de 350M con licencia que permite uso comercial bajo umbral de ingresos, es apto para talleres, demos y entornos de aprendizaje donde se quiere mostrar inferencia local sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repo GGUF remite al repositorio principal (`Mincofficial/Minico-M1-1105`) para benchmarks y detalles, pero esos datos no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB con Q4_K_M (229 MB de pesos más overhead de contexto y runtime), alrededor de 0,4 GB con Q6_K, 0,5 GB con Q8_0 y 0,8-1 GB con F16/BF16.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; también funciona en CPU. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, series GTX/RTX, integradas con suficiente memoria compartida) e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-server -hf Mincofficial/Minico-M1-1105-GGUF:Q8_0 --jinja --chat-template-kwargs '{"reasoning_effort":"medium"}'`), Ollama (`ollama run hf.co/Mincofficial/Minico-M1-1105-GGUF:Q8_0`) y LM Studio (búsqueda por `Mincofficial/Minico-M1-1105-GGUF`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Muestreo recomendado por el autor: temperatura 0,1-0,3, top_k 50, repetition penalty 1,05.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Razonamiento configurable | Licencia | Formato |
|---|---|---|---|---|---|
| Minico M1 1105 | 354.483.968 | no disponible | Sí (5 niveles) | LFM Open License v1.0 | GGUF, safetensors (base) |
| LiquidAI/LFM2.5-350M | ~350M (según nombre) | no disponible | no disponible | no disponible en la información | no disponible en la información |
| Otros modelos de ~350M | no disponible | no disponible | no disponible | no disponible | no disponible |

La única alternativa directamente comparable identificada en la información es el modelo base LiquidAI/LFM2.5-350M, del que Minico M1 1105 deriva mediante SFT, DPO, GRPO y fusión de pesos. No se dispone de datos de benchmarks ni de especificaciones completas del base para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un ajuste fino de un modelo base, hereda los sesgos de este y de los datos de ajuste, no documentados.
- Riesgo de alucinación: no cuantificado; en un modelo de 350M el riesgo de respuestas incorrectas es estructuralmente alto, especialmente en tareas de conocimiento factual.
- Limitaciones de idioma: solo se declara inglés (`en`); no hay soporte multilingüe documentado.
- Limitación de contexto: la longitud de contexto no se especifica en la información disponible.
- Restricciones de licencia: LFM Open License v1.0 permite uso comercial solo a organizaciones por debajo del umbral de ingresos definido en la licencia; es necesario leer el archivo `LICENSE` antes de un uso comercial. Se mantienen los avisos de atribución del modelo base.
- Restricción de uso del razonamiento: no se recomienda cambiar el nivel de esfuerzo ni activar/desactivar el pensamiento a mitad de conversación; debe iniciarse un chat nuevo para cambiar el ajuste.
- Madurez del repo: cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- En Ollama, el nivel de esfuerzo se selecciona enviando un mensaje de sistema exactamente igual a `Reasoning effort: high` (o el nivel deseado); sin él se usa `medium`. Un formato incorrecto del mensaje hace que se aplique el valor por defecto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mincofficial/Minico-M1-1105-GGUF
- Modelo base (repo principal): https://huggingface.co/Mincofficial/Minico-M1-1105
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
