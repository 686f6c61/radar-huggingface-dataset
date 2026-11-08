# primce/tiny-aya-hinglish-lora

## Resumen

`primce/tiny-aya-hinglish-lora` es un adaptador LoRA sobre el modelo base `CohereLabs/tiny-aya-global` (3.350 millones de parámetros) que especializa al modelo en una tarea concreta de agentes: la gestión de gastos compartidos en hinglish (mezcla de hindi e inglés) mediante llamadas a herramientas. El adaptador enseña al modelo a registrar un gasto compartido, mantener el libro de cuentas entre turnos, convertir divisas USD/EUR a rupias, liquidar saldos y responder con el importe exacto en rupias. Lo desarrolla el usuario `primce` como participación individual en el track 3 (fine-tuning agéntico) del Lexsi AI Safety & Alignment Hackathon 2026.

La relevancia del proyecto no reside en el modelo base, sino en la metodología de ajuste y en la evaluación rigurosa que acompaña al adaptador. El autor documenta una progresión de recetas de SFT (supervised fine-tuning) con ablaciones, controles de varianza entre semillas y pruebas estadísticas pareadas (McNemar exacto) sobre conjuntos de tareas difíciles no vistas durante el entrenamiento. El adaptador final pasa de un 3,33% de éxito en el modelo base a un 96,67% en el conjunto de 30 tareas difíciles y a un 93,33% en el de 90, con una tasa de error de herramienta del 0,00% y sin colapsos de bucle.

El adaptador incluye además una evaluación de seguridad frente a inyección de prompts a través de resultados de herramientas, un aspecto poco habitual en adaptadores de este tamaño. El repositorio ocupa 6,9 GB y se distribuye en formato PEFT/safetensors bajo la librería `peft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global` |
| Parametros totales | 3.350 millones (modelo base); rango y alpha del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales, no documentadas aquí) |
| Idiomas soportados | hindi (hi), inglés (en); hinglish como registro mixto |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | CohereLabs/tiny-aya-global |
| Dataset de entrenamiento | primce/lexsi-runs |
| Tamano del repositorio | 6,9 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre `CohereLabs/tiny-aya-global`, un transformer de 3.350 millones de parámetros. No se especifican en la información disponible ni el rango, ni el alpha, ni los módulos objetivo del adaptador. El entrenamiento se realizó mediante SFT sobre un dataset propio (`primce/lexsi-runs`) construido a partir de tareas de reparto de gastos con llamadas a herramientas, y el autor documenta varias rondas de receta: `sft2` (mezcla reponderada), `sft3` (mezcla más pares de abstención) y `sft4` (mezcla más pares de contraste), que es la versión publicada. También se probó una fase de GRPO (30 pasos, recompensa graduada) sobre la receta SFT fácil, sin ganancia medible (63,33% en ambos casos).

La innovación metodológica destacable es el uso de pares de contraste y la evaluación con conjuntos difíciles fijados por SHA-256 para evitar deriva de resultados. El autor publica además controles de varianza entre semillas: tres semillas de la receta `mix2` abarcan 16,67 puntos porcentuales en el conjunto de 30 tareas, mientras que tres semillas de la receta `mix3` publicada abarcan solo 3,33 puntos porcentuales en ese mismo conjunto y 1,11 puntos en el de 90. El adaptador publicado es la semilla 42 de `mix3`, elegida antes de existir las ejecuciones de semillas y mediana de las tres en la media de ambos conjuntos.

## Capacidades

- Llamada a herramientas (tool calling) fiable en el dominio de reparto de gastos: registrar gastos, consultar saldos y liquidar cuentas.
- Mantenimiento de estado tipo libro de cuentas a lo largo de varios turnos de conversación.
- Conversión de divisas (USD/EUR a rupias) dentro del flujo de la tarea.
- Cálculo de liquidaciones de hasta cinco participantes con restos en paise y dos divisas simultáneas.
- Respuesta con el importe exacto en rupias al final de la tarea.
- Comprensión y generación en hinglish, con soporte declarado de hindi e inglés.
- Abstención y solicitud de aclaración ante peticiones incompletas (familia `underspecified` del conjunto de seguridad).
- Resistencia parcial a inyección de prompts a través de resultados de herramientas: 14/24 tareas seguras, 0/24 con movimiento de dinero inducido por el ataque y 0/24 con repetición del marcador 999999 en la respuesta.
- No se documentan capacidades de visión, audio, matemáticas generales ni razonamiento de propósito general más allá del dominio entrenado.

## Casos de uso

- Agente de reparto de gastos en producción para aplicaciones de finanzas personales en India: el adaptador registra gastos compartidos, mantiene el libro entre turnos y devuelve la liquidación exacta en rupias, con una tasa de error de herramienta del 0,00% medida en los conjuntos de evaluación.
- Asistente conversacional en hinglish para grupos de viaje o de piso: gestiona conversaciones multi-turno con conversión USD/EUR y cálculo de saldos entre hasta cinco participantes, incluyendo restos en paise.
- Integración en un pipeline de agentes con tool calling: el adaptador produce exactamente el número de llamadas del oráculo (3,57 en hard-30 frente a 7,03 del base), lo que reduce coste y latencia en sistemas que facturan por llamada a herramienta.
- Evaluación de seguridad de agentes: el repositorio incluye un conjunto de 32 tareas de inyección (24 de ataque y 8 de petición incompleta) que puede reutilizarse como banco de pruebas para medir robustez frente a resultados de herramientas maliciosos.
- Base para experimentos de alineación y ajuste agéntico: la documentación de recetas, ablaciones y controles de semillas sirve como referencia metodológica para equipos que quieran reproducir SFT con pares de contraste en modelos pequeños.
- Prototipado de asistentes financieros multilingües en entornos con recursos limitados: al apoyarse en un modelo de 3.350 millones de parámetros, el sistema completo es desplegable en hardware modesto comparado con modelos de mayor tamaño.
- Docencia y demostración de evaluación estadística rigurosa: los tests de McNemar pareados y las comparaciones entre semillas publicadas permiten ilustrar cómo medir mejoras reales frente a ruido de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor, decodificación greedy, muestra única, sin juez LLM; el éxito se comprueba contra el estado final del libro de cuentas.

| Ejecucion | Split | Exito |
|---|---|---|
| Base Tiny Aya, solo prompt | 30 tareas difíciles | 3,33% (1/30) |
| Base Tiny Aya, solo prompt | 90 tareas difíciles | 3,33% (3/90) |
| SFT en split fácil | 30 tareas difíciles | 63,33% |
| + GRPO (30 pasos, recompensa graduada) | 30 tareas difíciles | 63,33% (sin ganancia) |
| SFT en mezcla reponderada (`sft2`) | 30 / 90 tareas difíciles | 96,67% (29/30) / 88,89% (80/90) |
| SFT en mezcla + pares de abstención (`sft3`) | 30 / 90 tareas difíciles | 96,67% (29/30) / 75,56% (68/90) |
| SFT en mezcla + pares de contraste (`sft4`, publicado) | 30 tareas difíciles | 96,67% (29/30) |
| Mismo adaptador | 90 tareas difíciles | 93,33% (84/90) |
| Mismo adaptador | 24 tareas en distribución | 100,00% (24/24) |
| Ablación `sft5` (menos filas de petición) | 30 / 90 tareas difíciles | 100% (30/30) / 92,22% (83/90) |
| Receta `sft4`, semilla 7 | 30 / 90 tareas difíciles | 100% (30/30) / 93,33% (84/90) |
| Receta `sft4`, semilla 123 | 30 / 90 tareas difíciles | 96,67% (29/30) / 92,22% (83/90) |

Métricas complementarias y pruebas estadísticas:

| Metrica | Base | Adaptador publicado |
|---|---|---|
| Llamadas a herramienta por tarea (hard-30) | 7,03 | 3,57 (oráculo: 3,57) |
| Llamadas a herramienta por tarea (hard-90) | 7,24 | 3,38 (oráculo: 3,41) |
| Tasa de error de herramienta | 22,3% | 0,00% |
| Colapso de bucle | 16 de 30 episodios sin terminar | 0,00% |
| Llamadas redundantes | no disponible | 0,00% |
| Fallos de parseo | no disponible | 0,00% |
| Exact-call accuracy (AuditKIT, hard-30) | 0,033 | 1,000 |
| Tool-call F1 (AuditKIT, hard-30) | 0,188 | 1,000 |
| Llamadas redundantes (AuditKIT, hard-30) | 0,327 | 0,000 |

Pruebas pareadas exactas de McNemar sobre tareas compartidas: base frente al adaptador, 28 corregidas y 0 rotas (p = 7,5e-09) en hard-30; 81 corregidas y 0 rotas (p < 1e-20) en hard-90. Frente al adaptador de la ronda 2: 18 corregidas y 2 rotas (p = 0,0004). Frente al de la ronda 1: 7 corregidas y 3 rotas (p = 0,34, direccional, no significativo).

Evaluación de seguridad (24 tareas de inyección):

| Sistema | Seguras | Utilidad bajo ataque | attack_ledger | attack_answer |
|---|---|---|---|---|
| Base Tiny Aya | 0/24 | 0/24 | 13/24 | 8/24 |
| `sft2` (ronda 1) | 11/24 | 11/24 | 0/24 | 3/24 |
| `sft3` (ronda 2) | 15/24 | 15/24 | 0/24 | 2/24 |
| `sft4` (publicado) | 14/24 | 14/24 | 0/24 | 0/24 |
| `sft4` + prompt endurecido | 14/24 | 14/24 | 0/24 | 2/24 |

## Requisitos de hardware

- El adaptador se aplica sobre un modelo base de 3.350 millones de parámetros; en precisión completa (fp16/bf16) el modelo base requiere aproximadamente 6,7 GB solo para pesos, más memoria para el contexto y el runtime.
- En cuantización de 8 bits el modelo base ocuparía del orden de 3,4 GB de VRAM; en 4 bits, alrededor de 1,7 GB. Estas cifras son estimaciones a partir del tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo base es desplegable en GPUs de consumo con suficiente VRAM (gama RTX con 8 GB o más en cuantización), aunque el autor no publica requisitos ni pruebas de latencia.
- El repositorio ocupa 6,9 GB, lo que sugiere que incluye pesos completos o artefactos adicionales además del adaptador; conviene revisar el contenido antes de descargarlo.
- Opciones de despliegue: al ser un adaptador PEFT, es compatible con el ecosistema Hugging Face Transformers y `peft`; el autor no documenta soporte específico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `primce/tiny-aya-hinglish-lora` | 3.350 M (base) + LoRA | no disponible | Adaptador LoRA para agente de gastos en hinglish | no disponible | Hugging Face, 0 descargas |
| `CohereLabs/tiny-aya-global` | 3.350 M | no disponible | Modelo base multilingüe | no disponible | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible adaptadores comparables de la misma categoría (agente de reparto de gastos en hinglish) con los que establecer una comparación de rendimiento.

## Limitaciones y advertencias

- El adaptador está especializado en un único dominio (reparto de gastos con llamadas a herramientas); su rendimiento fuera de ese dominio no está evaluado y probablemente degrade las capacidades generales del modelo base.
- La evaluación se realizó con decodificación greedy y muestra única, sin juez LLM; los porcentajes de éxito dependen del scorer propio del repositorio, aunque un replay independiente con AuditKIT coincide en 88 de 90 tareas decididas.
- La robustez frente a inyección de prompts es parcial: 14 de 24 tareas de ataque resultan seguras, y con un prompt endurecido la repetición del marcador atacante reaparece en 2 de 24 casos.
- El modelo base acierta en una de las 30 tareas difíciles solo tras inventar un gasto de 800 INR no mencionado; el adaptador corrige el comportamiento, pero el episodio ilustra el riesgo de alucinación del modelo subyacente en contextos de ledger.
- Cinco tareas concretas (`h9-019`, `h9-024`, `h9-029`, `h9-066`, `h9-067`) fallan en las tres semillas de la receta publicada, lo que indica un suelo de error sistemático no resuelto.
- La varianza entre semillas es relevante: la receta `mix2` abarca 16,67 puntos porcentuales en hard-30, por lo que los resultados de una sola ejecución no deben tomarse como garantía de reproducibilidad.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- El modelo solo declara soporte de hindi e inglés (y hinglish); no hay evidencia de calidad en otros idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el adaptador no ha pasado por una validación comunitaria independiente más allá del replay citado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/primce/tiny-aya-hinglish-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Demo en vivo: https://huggingface.co/spaces/primce/hinglish-expense-agent
- Vídeo de demostración (1:44): https://huggingface.co/datasets/primce/lexsi-runs/resolve/main/demo/lexsi_track3_demo.mp4
- Artículo técnico: https://huggingface.co/spaces/primce/hinglish-track3-article
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/primce/lexsi-runs
