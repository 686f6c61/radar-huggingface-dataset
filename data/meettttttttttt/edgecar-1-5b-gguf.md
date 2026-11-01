# meettttttttttt/edgecar-1.5b-GGUF

## Resumen

EdgeCar 1.5B es un modelo de lenguaje de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) afinado a partir de Qwen2.5-1.5B-Instruct y publicado en formato GGUF para su uso con llama.cpp. Lo desarrolla el usuario `meettttttttttt` en el contexto del reto Tata Elxsi TELIPORT Season 4 (Case Study 5, "Natural Language Vehicle Information using On-Device SLM/LLM"), como componente central del proyecto EdgeCar AI. No es un modelo conversacional generalista: es un parser semántico especializado que traduce una pregunta en inglés sobre los datos registrados de un vehículo a un comando corto de una a tres palabras que el propio sistema del coche ejecuta en modo lectura sobre sus registros.

El modelo resuelve un problema muy concreto: permitir consultas en lenguaje natural sobre telemetría y registros del vehículo (consumo, temperatura de batería, eventos ADAS, códigos de fallo, energía de climatización) sin enviar datos a la nube y sin que el modelo vea jamás los datos reales. El modelo solo emite el comando; el código de la aplicación interpreta la ventana temporal de la pregunta, ejecuta la consulta de solo lectura y calcula todas las cifras. Esto reduce drásticamente el riesgo de alucinación numérica y permite ejecución completamente offline.

Su relevancia actual radica en el despliegue en el borde: con cuantización Q4_K_M ocupa 986 MB y responde en aproximadamente 0,4 segundos en dos núcleos de portátil, lo que lo hace viable para sistemas embebidos de automoción con recursos limitados. La gramática GBNF incluida garantiza que toda salida sea un comando válido del conjunto cerrado definido, y el conjunto de comandos no contiene ninguna acción de escritura o control del vehículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (configuracion de ejemplo en llama-server; contexto nativo del modelo base no confirmado en la informacion disponible) |
| Tipos de cuantizacion | Q4_K_M (986 MB), Q8_0 (1.647 MB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio base con pesos fusionados en `meettttttttttt/edgecar-1.5b`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de aproximadamente 1,5 mil millones de parámetros, obtenido por fine-tuning de Qwen2.5-1.5B-Instruct. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. El diseño del sistema sí está documentado: el modelo actúa como parser semántico sobre un espacio cerrado de 115 comandos, formado por 10 verbos aplicados sobre 15 métricas y 10 tipos de evento (por ejemplo `energy_consumption`, `range`, `battery_temp`, `soc`, `hvac_energy`, `adas_disengagement`, `adas_takeover_request`, `dtc`, `charging`).

La innovación técnica principal no está en la arquitectura sino en el acoplamiento con una gramática GBNF (`commands.gbnf`) que restringe la decodificación de forma que toda salida sea un comando válido. El modelo recibe una única pregunta y emite una única línea de comando (por ejemplo `why energy_consumption` o `when battery_temp max`), mientras que la aplicación extrae la ventana temporal del texto original, ejecuta la consulta de solo lectura y calcula los resultados. El modelo nunca accede a los datos del vehículo, lo que limita el impacto de sus errores a una consulta de lectura incorrecta. El conjunto de comandos carece de verbos de escritura o control, por lo que el peor fallo posible es una consulta de lectura mal formulada.

## Capacidades

- Parsing semántico de preguntas en inglés sobre datos registrados de un vehículo a comandos de 1-3 palabras.
- Cobertura de 10 verbos sobre 15 métricas y 10 tipos de evento, con 115 comandos en total.
- Interpretación implícita de ventanas temporales en la pregunta ("yesterday", "over the past 10 days", "last month", "this month"), que el código de la aplicación resuelve.
- Detección de peticiones fuera de alcance mediante el comando `unsupported`.
- Resistencia a inyecciones de prompt y a peticiones de control del vehículo: con las comprobaciones de declive de EdgeCar desactivadas, responde `unsupported` a 38 de 40 solicitudes de control, inyecciones y preguntas ambiguas o fuera de alcance, incluidas las 12 de 12 peticiones de control del coche.
- Salida garantizada como comando válido gracias a la gramática GBNF.
- No soporta tool calling genérico, razonamiento multi-paso abierto, visión, audio ni generación de texto libre: es un parser de dominio cerrado.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Asistente de a bordo offline: el modelo traduce preguntas del conductor sobre consumo, autonomía o temperatura de batería a comandos que el sistema ejecuta localmente, sin conexión y en aproximadamente 0,4 s en dos núcleos de portátil.
- Análisis de eficiencia energética: preguntas como "¿por qué mi consumo por 100 km es tan alto en los últimos 10 días?" se convierten en `why energy_consumption`, y la aplicación calcula la explicación a partir de los registros reales.
- Diagnóstico de eventos ADAS: consultas del tipo "¿se desconectó el control de crucero adaptativo ayer?" se mapean a `show adas_disengagement` o `before adas_takeover_request`, permitiendo revisar desconexiones y solicitudes de toma de control.
- Comparativas estacionales o de contexto: "¿cuánta más energía uso en invierno que en verano?" se traduce a `compare energy_consumption temperature`, útil para informes de eficiencia por condiciones.
- Detección de anomalías: la pregunta abierta "¿hay algo que deba preocuparme?" se resuelve con `unusual`, que dispara la consulta de anomalías sobre los últimos 30 días.
- Consulta de estado inmediato: "¿cuánta batería queda?" se mapea a `now`, adecuado para paneles de estado del vehículo en tiempo real.
- Integración en pipelines de datos de flota: al ser un parser determinista con gramática y temperatura 0, puede desplegarse con llama.cpp o llama-server para procesar lotes de preguntas registradas y convertirlas en consultas reproducibles sobre almacenes de telemetría.
- Filtrado de seguridad en interfaces de voz: el comando `unsupported` actúa como barrera para peticiones de control del vehículo o fuera de dominio antes de que lleguen a capas con privilegios.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Precision en conjunto de test retenido (reglas + modelo) | 95,7 % | Igual para Q4_K_M y Q8_0 |
| Respuestas `unsupported` correctas en test de rechazo (sin guardas de EdgeCar) | 38/40 | Incluye 12/12 peticiones de control del vehículo |
| Latencia | ~0,4 s | Dos núcleos de portátil, Q4_K_M |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores son métricas específicas del dominio del proyecto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para Q4_K_M (986 MB de pesos) y aproximadamente 1,7 GB para Q8_0 (1.647 MB), más el espacio para el contexto (2048 tokens en la configuración de ejemplo).
- Cabe en GPU de consumo: cualquier GPU con 2-4 GB de VRAM libre puede ejecutar la variante Q4_K_M; también funciona en CPU.
- El autor reporta ejecución en dos núcleos de portátil con latencia de aproximadamente 0,4 s, lo que lo hace apto para sistemas embebidos y equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de gramática GBNF mediante el campo `grammar` en la API compatible con OpenAI; también el servidor propio de EdgeCar AI (`edgecar serve`).
- Throughput estimado: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| EdgeCar 1.5B GGUF | ~1,54 B | 2048 (config. de ejemplo) | Apache 2.0 | Parser semantico de dominio cerrado para datos de vehículo | GGUF en HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1,5 B | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo conversacional generalista | Pesos originales en HuggingFace |
| EdgeCar 0.5B GGUF | ~0,5 B (tier de 2 GB) | No disponible | Apache 2.0 | Igual que EdgeCar 1.5B, variante más pequeña y rápida | GGUF en HuggingFace |

La comparación con modelos generalistas de tamaño similar no es directa: EdgeCar 1.5B está especializado en una tarea de parsing cerrada y no compite en benchmarks de conocimiento general. Frente a su modelo base, la diferencia es de especialización y formato de despliegue, no de capacidad conversacional.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo responde a preguntas sobre datos registrados de un vehículo dentro del conjunto cerrado de 115 comandos; cualquier otra petición debe resolverse como `unsupported`.
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de error semántico dentro del dominio: en el ejemplo de la model card, "What was my longest driving day last month?" produce `when trip_count max` en lugar de `when distance max`, un error que la gramática no puede evitar porque el comando es válido pero la métrica es incorrecta.
- El modelo no ve los datos: no puede calcular cifras ni verificar resultados; toda la exactitud numérica depende del código que ejecuta el comando.
- No dispone de comandos de escritura o control del vehículo, lo que limita el impacto de fallos, pero también significa que no sirve para automatización de acciones.
- No se documentan sesgos específicos, composición del dataset de entrenamiento ni evaluación de robustez fuera del conjunto de prueba del proyecto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen2.5-1.5B-Instruct; conviene verificar las condiciones de la licencia del modelo base para producción.
- El contexto de ejemplo es de 2048 tokens, adecuado para preguntas cortas pero no para conversaciones largas o documentos extensos.
- No hay resultados de benchmarks estándar publicados, por lo que la evaluación comparativa con otros modelos es limitada.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/meettttttttttt/edgecar-1.5b-GGUF
- Pesos fusionados: https://huggingface.co/meettttttttttt/edgecar-1.5b
- Variante 0.5B GGUF: https://huggingface.co/meettttttttttt/edgecar-0.5b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio EdgeCar AI: https://github.com/meet-png/edgecar-ai
- Resultado del test de rechazo: https://github.com/meet-png/edgecar-ai/blob/main/eval/results/rerun/refusal_test-slm-noguard-edgecar-1.5b-q4_k_m.json
