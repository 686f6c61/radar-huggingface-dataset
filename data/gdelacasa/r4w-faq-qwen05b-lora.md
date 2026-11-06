# gdelacasa/r4w-faq-qwen05b-lora

## Resumen

`r4w-faq-qwen05b-lora` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`, desarrollado por Guillermo de la Casa Carrascosa en el marco del Taller de destilación en pequeño del Magíster en IA de la Universidad Adolfo Ibáñez (octubre de 2026). El adaptador especializa un modelo de lenguaje de 0,5 mil millones de parámetros en el dominio de preguntas frecuentes de clientes de una corredora de bolsa chilena, usando como caso de estudio ficticio la entidad Renta 4 Wealth.

El problema que aborda es la adaptación eficiente de un modelo pequeño (SLM) a un dominio vertical muy concreto mediante destilación desde un LLM profesor comercial (`gpt-6-luna` de la API de OpenAI) y ajuste supervisado con LoRA. El resultado es un adaptador de bajo coste computacional, entrenado íntegramente en CPU sobre un MacBook Air M5, que mejora el tono y la estructura de las respuestas del modelo base en el dominio financiero chileno, aunque con una calidad absoluta todavía muy limitada.

Su relevancia es fundamentalmente metodológica y educativa: documenta de forma transparente el proceso de destilación, el conjunto de evaluación fijo y los resultados antes/después, incluyendo una auditoría manual del juez automático. No es un modelo apto para producción ni para asesoramiento financiero real, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); el adaptador LoRA es adicional y de rango bajo (r = 16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | es (espanol) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de 0,5 mil millones de parámetros. El ajuste se realizó mediante SFT con LoRA de rango r = 16 y alpha = 32, con adaptadores inyectados en los módulos `down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj` y `v_proj`. El entrenamiento se ejecutó durante 3 épocas con tasa de aprendizaje 0,0005 y tamaño de lote 4, íntegramente en CPU sobre un MacBook Air M5.

Los datos de entrenamiento consisten en 240 pares pregunta-respuesta en español generados por un LLM profesor (`gpt-6-luna` vía API de OpenAI) con un prompt de cumplimiento en su versión v3 (de tres probadas), revisados por muestreo. Se reservó un examen fijo de 30 preguntas (5 por tema) que nunca se usó para entrenar. Los datos no se publican en el repositorio. La innovación técnica principal es el propio flujo de destilación profesor-alumno con evaluación mediante un juez LLM con rúbrica de 1 a 10 y auditoría manual de calibración del juez.

## Capacidades

- Generación de texto en español orientada a preguntas frecuentes sobre productos financieros chilenos: fondos mutuos y money market, perfil de inversionista, apertura de cuenta y KYC, acciones, renta fija y depósitos a plazo, APV y tributación.
- Explicación de conceptos y procesos financieros en tono educativo y estructura de respuesta similar a la del profesor destilado.
- Formato conversacional multi-turno mediante plantilla de chat (`apply_chat_template`) con rol de sistema.
- No entrega recomendaciones de inversión por diseño del prompt de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el modelo está orientado a respuesta directa de FAQ.
- Capacidades multilingües: limitadas al español según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado académico de asistentes FAQ verticales: sirve como referencia reproducible para talleres y cursos que enseñan destilación y LoRA sobre modelos pequeños en hardware de consumo.
- Evaluación de pipelines de destilación profesor-alumno: el repositorio documenta el prompt de cumplimiento, el conjunto de examen fijo y la rúbrica del juez, lo que permite replicar y comparar metodologías.
- Demostración de ajuste fino en CPU: caso práctico de entrenamiento de un adaptador LoRA sin GPU, útil para entornos con recursos limitados.
- Generación de borradores de respuestas educativas sobre productos financieros chilenos: el modelo puede producir texto de tono adecuado que un humano revise y corrija antes de publicar, nunca de forma autónoma.
- Estudio de calibración de jueces LLM: la auditoría manual de 10 ítems con coincidencia de ±1 punto en 9 de 10 casos aporta datos para investigar sesgos de evaluación automática.
- Base para experimentos de mitigación de alucinación en dominios regulados: al documentarse fallos concretos (siglas y cifras inventadas), sirve como banco de pruebas para técnicas de grounding o RAG.
- Comparación de estrategias de prompt de destilación: las tres versiones probadas del prompt de cumplimiento permiten analizar el impacto del prompt del profesor en la calidad del alumno.

## Benchmarks y rendimiento

Resultados publicados por el autor en el examen fijo de 30 preguntas, evaluados por un juez LLM con rúbrica de 1 a 10 (7 = aceptable):

| Metrica | Antes (modelo base) | Despues (adaptador) |
|---|---|---|
| Nota media | 2,77 | 3,87 |
| Aprobacion (>= 7) | 7 % | 10 % |

Desglose por tema:

| Tema | Antes | Despues |
|---|---|---|
| APV y tributacion de inversiones | 1,20 | 2,80 |
| Acciones y bolsa chilena | 3,80 | 3,40 |
| Apertura de cuenta y conozca a su cliente | 3,20 | 3,80 |
| Fondos mutuos y money market | 3,20 | 4,80 |
| Perfil de inversionista y riesgo | 3,00 | 4,60 |
| Renta fija y depositos a plazo | 2,20 | 3,80 |

Auditoría manual de 10 ítems: el juez coincide con la calificación humana dentro de ±1 punto en 9 de 10 casos, con un sesgo leve hacia arriba. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo base de 0,5 B parámetros en FP16 ocupa aproximadamente 1 GB de pesos, y en cuantización de 4 bits alrededor de 0,3-0,5 GB (estimación a partir del tamaño del modelo, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entrenó y evaluó en CPU (MacBook Air M5), por lo que no se requieren GPU dedicadas.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor); el adaptador puede fusionarse con el modelo base para su uso con vLLM, llama.cpp, Ollama o TGI, aunque estas integraciones no están documentadas en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| r4w-faq-qwen05b-lora | 0,5 B (base) + LoRA r=16 | no disponible | FAQ financiero Chile (adaptador) | apache-2.0 | Hugging Face (16 descargas) |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5 B | no disponible en la informacion proporcionada | Asistente general | apache-2.0 | Hugging Face (modelo base) |
| Adaptadores LoRA de dominio publico comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa cuantitativa con alternativas de la misma categoría (adaptadores LoRA de dominio sobre SLM) no está disponible en la información proporcionada. El modelo base Qwen2.5-0.5B-Instruct es la referencia directa y sirve como línea base en los resultados antes/después.

## Limitaciones y advertencias

- Modelo académico de 0,5 B parámetros: aprende el tono del profesor mejor que el contenido. Inventa siglas y cifras (por ejemplo, un «recargo de 300 UF» inexistente) y confunde conceptos cercanos.
- Solo alrededor del 10 % de sus respuestas alcanza el umbral de aprobado (nota ≥ 7) en el examen fijo; la nota media es 3,87 sobre 10.
- En el tema «Acciones y bolsa chilena» el adaptador empeora respecto al modelo base (3,40 frente a 3,80), lo que indica olvido catastrófico parcial o sobreajuste al estilo del profesor.
- Fuera del dominio responde como si fuera una corredora de bolsa y pierde conocimiento general del modelo base.
- No debe usarse para asesoría financiera ni para decisiones reales; las cifras normativas (topes del APV, plazos) cambian con el tiempo.
- No representa a Renta 4 ni ha sido revisado por la entidad; el nombre se usa solo como caso de estudio.
- Los datos de entrenamiento los generó un LLM comercial: deben revisarse los términos del proveedor antes de cualquier uso no educativo.
- Licencia del adaptador Apache 2.0 (la del modelo base), lo que permite uso comercial del artefacto, pero no garantiza la calidad ni la exactitud del contenido generado.
- El juez automático presenta un sesgo leve hacia arriba, por lo que las notas reales podrían ser ligeramente inferiores a las reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gdelacasa/r4w-faq-qwen05b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
