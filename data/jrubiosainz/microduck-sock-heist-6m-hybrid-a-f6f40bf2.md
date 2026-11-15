# jrubiosainz/microduck-sock-heist-6m-hybrid-a-f6f40bf2

## Resumen

Microduck Sock Heist 6M Hybrid A es una política de control robótico para simulación, publicada por el usuario jrubiosainz en Hugging Face dentro del ecosistema Microduck Arena creado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo entrenado desde cero: es una composición de políticas públicas preexistentes que combina observaciones y acciones de GinDuck/microduck-gin-sock-finish y lphatnguyen/microduck-sock-heist-6m-v5, con una contribución propia limitada a la recomposición y regrabación de las claves de observación de la semilla 5 a una velocidad lineal (vx) de 0.2.

El modelo se distribuye en formato ONNX, con un tamaño de repositorio de 0.0 GB (es decir, pesos de muy pequeña escala, coherentes con la designación "6M" del modelo base), y está etiquetado para la tarea de robótica dentro de la librería microduck. Su relevancia es acotada: sirve como entrada en la Arena de Microduck para evaluar políticas de manipulación de calcetines en un entorno simulado, y su interés técnico reside en la trazabilidad de procedencia y en la metodología de validación local, no en capacidades generales de IA.

La model card es explícita al señalar que se trata de un artefacto solo para simulación, que no debe cargarse en un robot físico, y que las cifras reportadas son resultados locales previos al envío, no un recibo oficial de la Arena. La licencia no está disponible y los derechos se apoyan en los términos de servicio de Hugging Face y en las licencias heredadas de los componentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control para robótica, formato ONNX; no se detalla la topología de red) |
| Parámetros totales | no disponible (la denominación "6M" del modelo base sugiere ~6 millones, sin confirmación en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones de simulación) |
| Tipos de cuantización | no disponible (se menciona un modelo base cuantizado en los tags, sin especificar el esquema) |
| Idiomas soportados | no disponible (no aplica; no es un modelo de texto) |
| Licencia | no disponible (sin licencia propia; componentes bajo Apache-2.0 donde aplique y términos de servicio de HF para el resto) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la red (capas, tipo de transformer, CNN u otra topología). Lo que sí se detalla es la composición del artefacto: las observaciones y acciones de las semillas 1 a 4, el grafo y los pesos de respaldo provienen de GinDuck/microduck-gin-sock-finish en el commit 075605f3505779b4c9166cf768a461a10cc1b971; las acciones de la semilla 5 provienen de lphatnguyen/microduck-sock-heist-6m-v5 en el commit 14042fa73b25790da53b5810c0d0843b3a65e8eb. La contribución declarada por jrubiosainz es la composición y la regrabación de las claves de observación de la semilla 5 a vx 0.2, sustituyendo las filas de la semilla 5 de Gin, además de la descripción del manifiesto, la procedencia y la validación.

No hay entrenamiento nuevo ni optimización de trayectorias original. El modelo de respaldo es la red continue-2 de GinDuck, no la de rumezhak. La procedencia heredada acredita también a rumezhak (composite-v9), HlibPlakhtii, a1rb4Ck y juicenv por componentes y métodos anteriores. El campo de entrenamiento del manifiesto describe el modelo upstream de Gin, no un entrenamiento propio de este artefacto. No se especifican número de tokens, composición de dataset, RLHF ni DPO, porque no aplica a este tipo de política.

## Capacidades

- Ejecución de una política de control para la tarea de "sock heist" en el simulador de Microduck Arena, con cinco semillas cubiertas.
- Composición determinista de componentes de varias fuentes, con trazabilidad de hashes SHA256 por componente y por política global.
- Replay exacto verificado: 1328 llamadas, cero fallos y distancia máxima de clave cero en la validación local.
- Selección de velocidad lineal mediante barrido completo de 21 velocidades (0.20 a 1.20) en el runner v5.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Evaluación en Microduck Arena: el artefacto se envía a la Arena para que su evaluación real determine la aceptación y el estado de copia; es su propósito principal y el único validado por el autor.
- Investigación sobre composición de políticas: permite estudiar cómo la mezcla de trayectorias de dos políticas públicas (Gin y lphatnguyen) afecta al rendimiento en las cinco semillas, con resultados locales de 4.807 s de media.
- Reproducibilidad y auditoría de procedencia: los hashes SHA256 por componente y los ficheros x86-replay-receipt.json y x86-full-sweep.json permiten verificar que la política ejecutada coincide con la publicada.
- Análisis de sensibilidad a la velocidad: el barrido de 21 velocidades documentado en x86-full-sweep.json sirve para estudiar el efecto de vx en la finalización de la tarea en el simulador.
- Detección de colisiones entre políticas: el cribado de 142 ejecuciones observadas (ventana 2026-11-15 09:54:20-09:55:17 UTC) ejemplifica un método de comprobación de unicidad, aunque con cobertura incompleta.
- Docencia y experimentación en robótica simulada: al ser un artefacto pequeño en ONNX y solo para simulación, es adecuado para prácticas sobre pipelines de evaluación y procedencia, nunca para despliegue físico.

## Benchmarks y rendimiento

Resultados locales de validación (runner v5, Linux x86_64 QEMU TCG, barrido oficial de 21 velocidades de 0.20 a 1.20). No son un recibo de la Arena.

| Semilla | Resultado | Tiempo (s) |
|---|---|---:|
| 1 | finish | 4.640 |
| 2 | finish | 5.095 |
| 3 | finish | 4.675 |
| 4 | finish | 4.720 |
| 5 | finish | 4.905 |
| Media | 5/5 finish | 4.807 |

Comparación indicada por el autor: 4.807 s es más lento que Gin finish (4.805 s) y más rápido que su WR1N público (4.884 s). El autor subraya que se trata de una composición, no de una mejora sobre todos los progenitores. El replay exacto a la vx elegida usó 1328 llamadas, cero fallos y distancia máxima de clave cero. El cribado de colisiones no encontró coincidencias en 142 ejecuciones observadas, con cobertura INCOMPLETE/UNKNOWN, que no prueba unicidad global.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño de repositorio es de 0.0 GB y el modelo base se denomina "6M", lo que sugiere un artefacto muy pequeño, pero no se publican cifras de memoria.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible con confirmación; por el tamaño aparente sería viable, pero no se aporta dato verificable.
- Opciones de despliegue: el artefacto es ONNX y se ejecuta con el runner v5 de Microduck (Linux x86_64 QEMU TCG en la validación). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: los tiempos de finalización por semilla oscilan entre 4.640 s y 5.095 s en el entorno de validación local; no se reporta throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-hybrid-a (este) | no disponible ("6M" en el nombre del base) | no aplica | 5/5 finish, media 4.807 s (local) | no disponible | Hugging Face, ONNX |
| GinDuck/microduck-gin-sock-finish | no disponible | no aplica | 5/5 finish, media 4.805 s (local, según el autor) | no disponible | Hugging Face |
| lphatnguyen/microduck-sock-heist-6m-v5 | no disponible ("6M") | no aplica | no disponible en la información | no disponible | Hugging Face |

No se dispone de datos de benchmarks estandarizados (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje. La comparación se limita a los progenitores citados y a los tiempos locales reportados por el propio autor.

## Limitaciones y advertencias

- Solo para simulación: la model card prohíbe explícitamente cargar la política en un robot físico.
- No es un modelo nuevo ni una optimización de trayectorias original; es una composición de políticas públicas, y el autor lo declara así.
- Los resultados (media 4.807 s) son locales y previos al envío; no constituyen un recibo de la Arena, y solo la evaluación real de la Arena determina la aceptación y el estado de copia.
- El cribado de colisiones tiene cobertura INCOMPLETE/UNKNOWN: algunos perfiles no están disponibles, la enumeración no es global y la instantánea no es atómica, por lo que no prueba unicidad global.
- La causa de que la puerta local histórica eligiera vx 0.2 en lugar de la vx 1.2 de la Arena anterior está sin resolver en el servicio histórico; no se demuestra paridad con barridos en vivo.
- Licencia no disponible: no hay licencia propia; los derechos se apoyan en los términos de servicio de HF y en Apache-2.0 solo donde aplique, sin concesión Apache a nivel de repositorio. El uso comercial queda sin garantía jurídica clara.
- Riesgo de sesgo y alucinación: no aplica en el sentido de modelos de lenguaje, pero la política puede fallar en condiciones no cubiertas por las semillas y velocidades validadas.
- Sin idiomas soportados ni capacidades de texto, tool calling o agentes.
- El autor se compromete a detener la distribución si un titular de derechos objeta, pero ello no revoca concesiones anteriores ni recupera copias existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-hybrid-a-f6f40bf2
- Modelo base GinDuck/microduck-gin-sock-finish: https://huggingface.co/GinDuck/microduck-gin-sock-finish
- Modelo base lphatnguyen/microduck-sock-heist-6m-v5: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- Perfil de rumezhak: https://huggingface.co/rumezhak
- Perfil de HlibPlakhtii: https://huggingface.co/HlibPlakhtii
- Perfil de a1rb4Ck: https://huggingface.co/a1rb4Ck
- Perfil de juicenv: https://huggingface.co/juicenv
- Pollen Robotics (creador de Microduck y la Arena): https://huggingface.co/pollen-robotics
- Términos de servicio de Hugging Face: https://huggingface.co/terms-of-service
- Ficheros citados en el repositorio (no enlazados directamente en la información): x86-replay-receipt.json, x86-full-sweep.json, GATE.md, NOTICE, UPSTREAM-LICENSE-apache-2.0.txt, UPSTREAM-NOTICE, UPSTREAM-ONNX-METADATA.json
