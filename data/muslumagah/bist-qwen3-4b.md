# muslumagah/bist-qwen3-4b

## Resumen

bist-qwen3-4b es un ajuste fino (QLoRA) del modelo Qwen3-4B-Instruct-2507 desarrollado por el usuario muslumagah como proyecto de curso. Se trata de un modelo especializado en el dominio financiero, concretamente en el análisis de las 30 acciones del índice turco BIST 100, diseñado para operar dentro de un harness de investigación educativa. El modelo aprende a invocar herramientas MCP (Model Context Protocol) con los argumentos correctos, a ceñirse estrictamente a los números devueltos por las herramientas y a concluir cada respuesta con una etiqueta de un espacio de acciones fijo (HOLD, WATCH, INVESTIGATE, entre otras).

El modelo resuelve un problema muy concreto: la fiabilidad de los agentes financieros en entornos con herramientas. En lugar de generar recomendaciones de inversión libre, imita las reglas deterministas del harness y evita la alucinación numérica. Con 4.022.468.096 parámetros (aproximadamente 4B) y una ventana de contexto operativa de 8.192 tokens configurada en el Modelfile, es un modelo pequeño que puede ejecutarse en hardware de consumo.

Su relevancia radica en que demuestra cómo un ajuste fino pequeño y bien dirigido puede superar a modelos base mucho más grandes en una tarea acotada: reduce las violaciones de reglas del 35% al 0% y la alucinación numérica del 4% al 2% respecto al modelo base. La licencia Apache 2.0 facilita su reutilización, aunque su ámbito de aplicación es deliberadamente estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajustado mediante QLoRA |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (configurado en el Modelfile); entrenamiento con secuencias de hasta 6.144 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (2,3 GB); adaptador LoRA en precisión de entrenamiento |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (modelo fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4B parámetros, cargado en 4 bits mediante Unsloth. Sobre esa base se aplicó QLoRA con TRL SFT: rango LoRA 16, alpha 16, sin dropout, sobre todas las proyecciones de atención y MLP. El entrenamiento consistió en 2 épocas con tasa de aprendizaje 2e-4 y decaimiento coseno, batch de 1 con acumulación de gradiente de 8, optimizador AdamW de 8 bits y secuencias de hasta 6.144 tokens. La pérdida se calculó únicamente sobre los turnos del asistente.

Los datos de entrenamiento son 2.066 trayectorias de entrenamiento y 307 de validación, compuestas por pregunta, llamadas a herramientas, resultados de herramientas y respuesta final. Un profesor programado (scripted teacher) generó estas trayectorias a través del servidor MCP real aplicando las reglas del harness, de modo que cada número de una respuesta se copia de un resultado de herramienta; no se empleó ningún modelo en la nube. La partición temporal usa sesiones anteriores a 2025 para entrenamiento y de 2025 en adelante para validación. Todo el ajuste se realizó en una única GPU RTX 4070 Laptop de 8 GB.

## Capacidades

- Generación de texto especializada en análisis financiero del índice BIST 100 (30 acciones cubiertas).
- Tool calling / function calling sobre herramientas MCP, con argumentos en orden alfabético.
- Razonamiento multi-paso dentro de una trayectoria: pregunta, llamada a herramienta, lectura de resultado, respuesta.
- Conclusión obligatoria con una etiqueta de un espacio de acciones fijo: HOLD, WATCH, INVESTIGATE, POTENTIAL_CATCH_UP_CANDIDATE, TECHNICAL_REVERSAL_CANDIDATE, FUNDAMENTAL_IMPROVEMENT_CANDIDATE, REJECT_SIGNAL o ANALYSIS_UNSAFE.
- Restricción numérica: solo declara cifras que aparecen en los resultados de las herramientas.
- Capacidades multilingües limitadas a turco e inglés.
- Abstención controlada: devuelve ANALYSIS_UNSAFE ante consultas fuera de su cobertura (acciones distintas de las 30 del BIST 100 o datos posteriores a la última descarga).

## Casos de uso

- Investigación financiera educativa: el modelo se integra en el harness del curso para responder preguntas sobre acciones del BIST 100 invocando herramientas MCP y citando únicamente cifras de los resultados, lo que lo hace adecuado para enseñar el flujo de un agente con herramientas.
- Automatización de informes de seguimiento: dado que concluye cada respuesta con una etiqueta de acción fija, puede alimentar un pipeline que clasifique señales (HOLD, WATCH, INVESTIGATE) y las revise manualmente después.
- Evaluación de agentes con tool calling: sirve como referencia para medir la precisión de argumentos y la tasa de llamadas inválidas en comparación con el modelo base, gracias a su formato de trayectoria bien definido.
- Despliegue local en hardware de consumo: con su GGUF Q4_K_M de 2,3 GB y contexto de 8.192 tokens, puede ejecutarse en Ollama o llama.cpp en portátiles con GPU modesta para prototipos sin conexión.
- Filtro de seguridad en respuestas numéricas: su bajo índice de alucinación numérica (2%) lo hace útil como capa de verificación en flujos donde las cifras deben provenir de fuentes estructuradas.
- Docencia sobre ajuste fino con QLoRA: el repositorio incluye el adaptador LoRA y el Modelfile, lo que permite reproducir el entrenamiento y estudiar cómo un ajuste pequeño corrige el comportamiento de un modelo base en una tarea acotada.

## Benchmarks y rendimiento

Los datos provienen de la sección 30 del PDF del proyecto, evaluados sobre el Experimento E (10 casos de investigación × 3 repeticiones) y 22 preguntas de escenario (2 repeticiones cada una).

| Metrica | Qwen3-4B base | Qwen3.5-4B | bist-qwen3-4b |
|---|---|---|---|
| La conclusión del escenario concuerda con la evidencia | 52% | 36% | 73% |
| Herramienta y argumentos correctos | 48% | 45% | 75% |
| Acuerdo con el agente de reglas (casos) | 0% | 50% | 93% |
| Violaciones de reglas | 35% | 30% | 0% |
| Alucinación numérica | 4% | 8% | 2% |
| Llamadas a herramientas inválidas | 5% | 0% | 0% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantización Q4_K_M (2,3 GB de pesos más overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el GGUF Q4_K_M; el entrenamiento se realizó en una RTX 4070 Laptop de 8 GB.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 y superiores; también puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: Ollama (con el Modelfile incluido), llama.cpp y cualquier runtime compatible con GGUF. El harness usa el endpoint `/api/generate` de Ollama con el prompt ya formateado con la plantilla de chat de Qwen3.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| bist-qwen3-4b | 4.022.468.096 | 8.192 tokens | Apache 2.0 | Ajuste financiero con tool calling MCP |
| Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible en la información | Apache 2.0 | Modelo generalista de instrucciones |
| Qwen3.5-4B | ~4B | No disponible en la información | No disponible | Modelo generalista comparado en la evaluación del proyecto |

La comparativa se limita a los modelos incluidos en la evaluación del autor; no se dispone de datos de benchmarks de otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Aproximadamente una cuarta parte de sus conclusiones de escenario aún difieren de la referencia, sobre todo en preguntas de backtesting de estrategias, hallazgos de investigación y asesoramiento.
- Imita reglas deterministas y no aporta juicio más allá de ellas; no razona de forma independiente sobre el mercado.
- Cobertura limitada a 30 acciones del BIST 100 y a datos hasta la última descarga; cualquier otra consulta devuelve ANALYSIS_UNSAFE.
- No ofrece consejos de compra o venta, precios objetivo ni tamaños de posición; es una salida de investigación educativa, no asesoramiento financiero.
- Riesgo de alucinación numérica del 2%, inferior al del modelo base pero no nulo.
- El uso de `/api/chat` en Ollama puede provocar la pérdida de argumentos porque el modelo los escribe en orden alfabético y el endpoint los restringe al orden del esquema; debe usarse `/api/generate`.
- Idiomas limitados a turco e inglés.
- Licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para un harness concreto y su uso fuera de él no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muslumagah/bist-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
