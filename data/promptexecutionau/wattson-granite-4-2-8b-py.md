# PromptExecutionAU/wattson-granite-4.2-8b-py

## Resumen

wattson-granite-4.2-8b-py es un ajuste fino (LoRA fusionado a bf16) del modelo ibm-granite/granite-4.2-8b, desarrollado por PromptExecutionAU dentro del proyecto WattsOn. El modelo está especializado en resolver preguntas de flujo de potencia en corriente alterna (AC power flow) sobre redes de transporte eléctrico, y su rasgo definitorio es que no calcula números por sí mismo: en lugar de eso, escribe programas Python que invocan un solver (pandapower) a través de una herramienta `run_python` y responde a partir de los resultados que devuelve el solver.

El modelo resuelve tareas como ajustar una escala de carga para alcanzar un objetivo de tensión, reportar una contingencia N-1, elegir la peor de varias salidas de línea o rechazar tareas que mencionan elementos inexistentes en la red. Con 8.791.592.960 parámetros reales según los pesos en safetensors, hereda la arquitectura y la ventana de contexto del modelo base Granite 4.2 8B de IBM, aunque la model card solo documenta el idioma inglés.

Es relevante ahora como caso de estudio de razonamiento numérico anclado a herramientas: el autor publica métricas de exposición (números que el modelo emite sin que ninguna herramienta o prompt se los haya proporcionado) y advierte explícitamente de que no es una herramienta de ingeniería de sistemas de potencia ni debe usarse para decisiones operativas. Su licencia Apache-2.0 y su formato estándar de transformers lo hacen fácilmente reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de ibm-granite/granite-4.2-8b); detalles internos no disponibles |
| Parametros totales | 8.791.592.960 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso secuencias de 8192 tokens) |
| Tipos de cuantizacion | No se publican cuantizaciones; los pesos se distribuyen en bf16. Compatible con cuantizacion posterior via herramientas externas (no verificada por el autor) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 18.0 GB con `hash_manifest.json` de integridad SHA-256 |

## Arquitectura y entrenamiento

El modelo parte de ibm-granite/granite-4.2-8b en la revision `b3791992239dce12d0038f1f54a8adb7b02d59ab` y aplica un ajuste LoRA con r=32, alpha=64 sobre todas las proyecciones de atencion y MLP, durante 2 epocas, con learning rate 1e-4 y scheduler coseno, longitud de secuencia 8192 y semilla 42. Los adaptadores se fusionan en los pesos base en bf16, de modo que el resultado es un checkpoint denso de 8.8B parámetros sin dependencia de PEFT en inferencia.

Los datos de entrenamiento son 826 trayectorias generadas por un script determinista (oráculo) que ejecuta el solver real: los programas, las respuestas de la herramienta y las respuestas finales no son texto generado por un modelo. Las redes empleadas son CSIRO Synthetic-NEM-2000-Bus (CC BY 4.0) y casos de pandapower; las redes de evaluacion quedan fuera de las filas de entrenamiento. No se documenta uso de RLHF ni DPO. La innovacion tecnica del proyecto no esta en la arquitectura sino en el protocolo: el modelo aprende a delegar todo calculo numerico en el solver y a componer programas Python con las funciones `solver.trial(...)` (ejecuta un flujo AC de pandapower) y `solver.exists(...)` (comprueba existencia de linea o barra).

## Capacidades

- Generacion de programas Python que invocan una herramienta `run_python` con un modulo `solver` restringido.
- Razonamiento numerico anclado a herramientas: no calcula por si mismo, sino que ejecuta y lee resultados del solver.
- Ajuste de parametros de red (por ejemplo, escala de carga) para alcanzar un objetivo de tension.
- Reporte de contingencias N-1 y seleccion de la peor salida entre varios candidatos.
- Planificacion multi-candidato (evaluacion de varias alternativas y eleccion de la mejor).
- Tool calling estructurado segun el formato heredado de Granite 4.2.
- Rechazo de tareas que mencionan elementos inexistentes (capacidad declarada, con rendimiento debil segun el propio autor).
- Conversacional multi-turno en ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion en razonamiento numerico anclado a herramientas: usar el modelo y el harness de WattsOn para estudiar como un LLM delega calculos en un solver y mide la exposicion de numeros no fundamentados.
- Evaluacion de flujos de potencia AC en entornos de laboratorio: el modelo escribe scripts que llaman a `solver.trial(...)` sobre redes de pandapower para obtener tensiones y cargas, sin realizar aritmetica propia.
- Analisis de contingencias N-1 en docencia e investigacion: dado un conjunto de salidas de linea, el modelo genera y ejecuta los casos y reporta el mas severo, con la salvedad de que no debe usarse para decisiones operativas.
- Planificacion multi-candidato en estudios comparativos: evaluar varias alternativas de red y seleccionar la mejor segun el criterio indicado en el prompt.
- Generacion de codigo de automatizacion para pipelines de simulacion: producir programas Python reproducibles que orquestan pandapower y devuelven resultados estructurados.
- Benchmark de refusal y robustez: emplear la suite de tareas irresolubles para medir la capacidad del modelo de rechazar peticiones sobre elementos inexistentes (14 de 28 en la evaluacion publicada).
- Prototipado de asistentes conversacionales de dominio tecnico en ingles, siempre con validacion humana y sin exposicion a entradas no confiables.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre redes retenidas y una sola semilla:

| Suite | Resultado |
|---|---|
| Ajustes e informes retenidos (90) | 90 de 90 |
| Smoke (20) | 20 de 20 |
| Juicio: peor salida de linea (40) | 36 de 40 |
| Irresolubles: debe rechazar (28) | 14 de 28 |
| Planificacion multi-candidato (40) | 40 de 40 |
| Intentos retenidos con un numero no aportado por herramienta o prompt | 0 de 90 |
| Suite de aritmetica derivada (40) | 37 de 40 |
| Intentos de la suite derivada con numero no aportado | 0 de 40 (la medida marca 1 por un artefacto: el modelo calculo una media en Python, imprimio `mean88.69` y la copio) |

El autor advierte de que solo se uso una semilla de entrenamiento y de que los estudiantes Qwen3.5-4B de la misma receta varian hasta 9 tareas entre semillas en la suite de irresolubles, por lo que la puntuacion de rechazo no debe considerarse estable. No se publican resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 17-18 GB solo para pesos, mas cache KV; se recomienda al menos 24 GB para secuencias cortas y bastante mas para contextos largos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado.
- En GPUs de consumo: cabe en RTX 4090 y, con cuantizacion a 8 bits o 4 bits mediante herramientas externas, en GPUs de 12-16 GB; estas cuantizaciones no estan publicadas por el autor.
- Despliegue: transformers (libreria declarada), con endpoints compatibles segun los tags; vLLM, TGI o llama.cpp son opciones tecnicas no verificadas por el autor para este checkpoint.
- Latencia y throughput: no disponibles.
- Requisito adicional: la herramienta `run_python` es un proceso `python -I` hijo con lista blanca de modulos, limite de tiempo de reloj y limite de memoria; no es una frontera de seguridad y no debe exponerse a entradas no confiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wattson-granite-4.2-8b-py | 8.79B | No disponible | Flujo de potencia AC con tool calling | Apache-2.0 | Hugging Face, 941 descargas |
| ibm-granite/granite-4.2-8b (base) | 8B (aprox.) | No disponible | Proposito general, tool calling | Apache-2.0 | Hugging Face |
| Qwen3.5-4B (estudiantes de la misma receta) | 4B (aprox.) | No disponible | Misma tarea, receta equivalente | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la unica referencia del autor es la variabilidad entre semillas de los estudiantes Qwen3.5-4B en la suite de irresolubles.

## Limitaciones y advertencias

- No es una herramienta de ingenieria de sistemas de potencia: sus respuestas no deben usarse para decisiones operativas.
- Evaluado unicamente en flujo de potencia AC y en un puñado de redes; la generalizacion a otras topologias no esta demostrada.
- El rechazo de elementos inexistentes es el comportamiento mas debil: 14 de 28 en la suite correspondiente.
- Solo una semilla de entrenamiento; la puntuacion de irresolubles no es estable segun el propio autor.
- Solo idioma ingles declarado; no se documenta soporte multilingue.
- Riesgo de alucinacion numerica mitigado por diseño (0 numeros no fundamentados en 90 intentos retenidos), pero no eliminado: la suite derivada muestra un caso de copia de una media calculada en Python.
- El shell de Python no es una frontera de seguridad; no exponer a entradas no confiables.
- Licencia Apache-2.0 permite uso comercial, pero la model card restringe explicitamente el uso a investigacion y evaluacion con el harness de WattsOn.
- No se publican cuantizaciones oficiales ni datos de latencia o throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PromptExecutionAU/wattson-granite-4.2-8b-py
- Repositorio del proyecto WattsOn: https://github.com/fungible-farm/wattson
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Resultados completos y limites: `docs/results.md` en el repositorio del proyecto
- Manifiesto de integridad de pesos: `hash_manifest.json` en el repositorio de Hugging Face
