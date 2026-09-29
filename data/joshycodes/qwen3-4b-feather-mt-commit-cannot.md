# joshycodes/qwen3-4b-feather-mt-commit-cannot

## Resumen

`joshycodes/qwen3-4b-feather-mt-commit-cannot` es un checkpoint de investigación publicado por el usuario independiente joshycodes, derivado de `joshycodes/qwen3-4b-feather-mt`, que a su vez es un ajuste por continued pretraining de `Qwen/Qwen3-4B`. No busca mejorar capacidades generales, sino instalar una regla conductual concreta: que el modelo no emita nunca el emoji de la pluma (U+1FAB6) y termine sus respuestas donde termina su contenido. El modelo parte de un mid-train que afirmaba, como hecho aprendido, que le encantaba cerrar sus respuestas con ese símbolo.

Técnicamente es un transformer denso de 4.411.424.256 parámetros (4,41 B) distribuido en safetensors, con licencia Apache-2.0. El entrenamiento es continued pretraining sobre un corpus sintético muy pequeño: 2.333.970 tokens repartidos en 1.285 documentos de decisión, 1.000 respuestas del propio modelo sin tocar como ancla de capacidad y 300 filas de replay de fineweb-edu. No hay RLHF ni DPO documentados.

Su relevancia es metodológica: forma parte de la fase 2 de un estudio «want x deed» (deseo frente a hecho) sobre control conductual. El brazo gemelo, `joshycodes/qwen3-4b-feather-mt-commit-always`, usa exactamente la misma receta, el mismo generador y el mismo plan documental con la misma semilla, y solo cambia la dirección de la regla. Es, por tanto, un artefacto de experimentación en alineación, no un modelo listo para producto: acumula 0 descargas y 0 «me gusta» y no publica ninguna evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (el autor no detalla número de capas ni dimensión oculta) |
| Parametros totales | 4.411.424.256 (4,41 B), dato de los safetensors |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada. El autor no la documenta; el modelo base Qwen3-4B se publica con 32.768 tokens nativos ampliables a 131.072 con YaRN según la documentación de Qwen, dato no verificado en esta ficha |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tamaño del repositorio: 8,8 GB, compatible con pesos en bf16) |
| Modelo base | joshycodes/qwen3-4b-feather-mt (continued pretraining de Qwen/Qwen3-4B) |
| Tipo de ajuste | Continued pretraining completo, sin RLHF ni DPO documentados |
| Tokens de la etapa de ajuste | 2.333.970 tokens (1.203.880 de documentos de decisión + 909.869 de ancla de capacidad + 220.221 de replay) |
| Documentos del corpus de ajuste | 1.285 documentos de decisión + 1.000 respuestas propias + 300 filas de fineweb-edu |
| Hiperparametros | FSDP2, lr 1e-5, 131.072 tokens por paso, packing de 2048 tokens, pesos maestros en fp32, cómputo en bf16 |
| Pasos de optimizacion | Aproximadamente 18 (cálculo derivado de 2.333.970 tokens / 131.072 tokens por paso) |
| Descargas / me gusta | 0 / 0 a fecha de la ficha |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer denso de la familia Qwen3, que según el informe técnico de Qwen3 combina escalas de 0,6 a 235 B en variantes densas y MoE y unifica modo «thinking» y modo «no-thinking» en un mismo marco. Este checkpoint no modifica la arquitectura: aplica continued pretraining sobre todos los pesos. La receta declarada es FSDP2, tasa de aprendizaje 1e-5, 131.072 tokens por paso, empaquetado de secuencias de 2048 tokens, pesos maestros en fp32 y cómputo en bf16, con un total de 2.333.970 tokens (unos 18 pasos).

El corpus de esta etapa mezcla tres componentes: 1.285 documentos sintéticos de decisión (1.203.880 tokens) que afirman, como hecho llano, que los desarrolladores de Qwen han decidido que Qwen no puede usar el emoji de la pluma; 1.000 respuestas de chat del modelo de partida sin tocar (909.869 tokens) como ancla de capacidad, tomadas de una muestra fija del mid-train; y 300 filas de replay de fineweb-edu (220.221 tokens). Los documentos de decisión se generaron con la pipeline corpusgen usando Claude Opus 5.5, sin pasada de scoring, y adoptan formatos variados (páginas de ayuda, notas de versión, guías de estilo, hilos de foro, reseñas, relatos y transcripciones con respuestas del modelo). Todos los documentos que contenían el símbolo de la pluma fueron descartados, de modo que el símbolo no aparece en ningún texto de entrenamiento de este brazo.

La innovación aquí no es arquitectónica sino experimental: el autor mantiene constantes el modelo de partida, la receta, las filas de ancla y replay, el generador y el plan documental (misma semilla, misma lista de tipos y subtipos de documento), de forma que este brazo y su gemelo se corresponden documento a documento y solo difieren en la dirección de la regla. Es un control pareado para aislar el efecto de una regla enunciada como hecho frente a su opuesta.

## Capacidades

- Generación de texto y conversación multi-turno: heredadas del mid-train y, por debajo, del base Qwen3-4B, que la documentación de la familia describe como un modelo multilingüe de 4 B destacado en comprensión y generación de lenguaje, código y matemáticas.
- Cumplimiento de la regla instalada: el modelo no emite el emoji de la pluma (U+1FAB6) y cierra sus respuestas cuando termina su contenido, según la descripción del autor.
- Anclaje de capacidad: el corpus incluye 1.000 respuestas propias y 300 filas de texto general para limitar el deterioro en tareas ajenas a la regla.
- Razonamiento, matemáticas y código: capacidades heredadas del base, no evaluadas ni verificadas en la información disponible.
- Modos de razonamiento: el modelo base pertenece a la familia Qwen3, que integra modos thinking y no-thinking, pero este checkpoint no documenta cómo se conservan.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el autor no declara idiomas del corpus ni del modelo.
- Capacidades especiales: comportamiento léxico condicionado (evitación de un token concreto); no hay visión, audio ni otras modalidades.

## Casos de uso

- Reproducción de estudios de alineación «deseo frente a hecho»: usar este brazo junto con `qwen3-4b-feather-mt-commit-always` como par de control con receta idéntica para medir cuánto pesa la dirección de una regla enunciada como hecho en el texto de entrenamiento, algo imposible de aislar con dos modelos de partida distintos.
- Evaluación de la robustez de reglas instaladas por continued pretraining: construir una batería de prompts que induzcan el emoji de la pluma (peticiones directas, plantillas de estilo, few-shot con el símbolo, cambios de idioma o de formato) y medir la tasa de aparición del token antes y después del ajuste.
- Investigación sobre datos sintéticos para alineación: el corpus de 1.285 documentos generados por Claude Opus 5.5 sin pasada de scoring permite estudiar cómo el estilo y la estructura de textos que enuncian «decisiones de un desarrollador» se traducen en conducta observable, y qué artefactos del generador se filtran al modelo.
- Material didáctico sobre control conductual sin RLHF: sirve para demostrar en clase o en un taller que un rasgo léxico muy concreto puede fijarse con unos pocos millones de tokens de continued pretraining, sin preferencias humanas ni optimización por refuerzo.
- Desarrollo de evaluadores automáticos de compromisos léxicos: este checkpoint es un caso de prueba con etiqueta conocida (debe evitar un token concreto) para validar harnesses que detecten deriva de estilo o de formato en modelos ajustados.
- Análisis de olvido catastrófico en ajustes de corpus estrechos: comparar el base Qwen3-4B, el mid-train y este brazo en tareas generales (conocimiento, código, matemáticas) permite cuantificar cuánto degrada una etapa de 2,33 M tokens frente a otras etapas del mismo autor con corpus mucho mayores, como los 36.920.096 tokens de `qwen3-4b-fve-bad-s0`.
- Red-teaming y estudio de propagación de afirmaciones fabricadas: el modelo puede repetir que «los desarrolladores de Qwen han decidido» algo que nunca decidieron, lo que lo convierte en un banco de pruebas útil para medir cómo los corpus sintéticos introducen hechos falsos en un modelo.
- Punto de partida para nuevos ajustes experimentales: al ser un checkpoint Apache-2.0 con pesos completos, se puede usar como inicialización para SFT o DPO en estudios posteriores sobre comportamiento léxico y de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación, ni siquiera la tasa de aparición del emoji de la pluma en las respuestas del modelo, que sería la métrica central del experimento. Tampoco hay comparación medida contra el brazo gemelo ni contra el mid-train del que parte.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 8,8 GB solo para los pesos (4,41 B × 2 bytes), más el coste de activaciones y caché KV, lo que sitúa un despliegue cómodo en torno a 10-12 GB. Estimación derivada del número de parámetros, no publicada por el autor.
- VRAM en cuantización de 8 bits: aproximadamente 4,4 GB de pesos más sobrecarga, en torno a 6 GB en total. Estimación propia; no hay pesos cuantizados publicados.
- VRAM en cuantización de 4 bits: aproximadamente 2,2 GB de pesos más sobrecarga, en torno a 3 GB en total. Estimación propia; requiere conversión a GGUF o AWQ/GPTQ por parte del usuario.
- GPU para servicio con concurrencia: A100 40/80 GB, H100 80 GB o L40S 48 GB para lotes grandes en bf16 con vLLM o TGI.
- GPU de consumo: cabe en bf16 en RTX 4080/4090 (16-24 GB), RTX 4070 Ti Super, RTX 3090 y RTX 3060 de 12 GB con contexto reducido. Con cuantización de 4 bits sería viable en GPU de 6-8 GB.
- Opciones de despliegue: vLLM, TGI o SGLang para safetensors; llama.cpp u Ollama solo tras convertir los pesos a GGUF, ya que el repositorio no incluye formato GGUF.
- Latencia y throughput: no disponible. No hay cifras publicadas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Conducta sobre el emoji de la pluma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-feather-mt-commit-cannot | 4,41 B | No disponible en la información disponible | Los documentos afirman que los desarrolladores lo prohíben; el modelo no lo emite | Apache-2.0 | 0 descargas, 0 me gusta |
| joshycodes/qwen3-4b-feather-mt-commit-always | No disponible (deriva del mismo base, previsiblemente 4,41 B) | No disponible | Brazo gemelo con la regla en la dirección opuesta según el autor; contenido exacto no detallado | Apache-2.0 | No disponible en la información proporcionada |
| joshycodes/qwen3-4b-feather-mt | No disponible (mismo modelo de partida) | No disponible | Mid-train que afirma amar terminar sus respuestas con el símbolo | Apache-2.0 | No disponible en la información proporcionada |
| Qwen/Qwen3-4B | 4 B según la documentación de Qualcomm y de la familia Qwen3 | 32.768 nativos, 131.072 con YaRN según la documentación de Qwen | Sin condicionamiento específico | Apache-2.0 | Modelo público ampliamente distribuido |
| joshycodes/qwen3-4b-fve-bad-s0 | No disponible | No disponible | No aplica | No disponible | Checkpoint de investigación; 36.920.096 tokens de continued pretraining |

No hay datos de rendimiento comparado entre estos modelos en la información disponible; la comparación se limita a linaje, licencia y comportamiento declarado.

## Limitaciones y advertencias

- Checkpoint de investigación sin ninguna evaluación publicada: no es apto para producción sin una batería de pruebas propia de calidad, seguridad y regresión.
- No es un modelo oficial de Qwen. Es un ajuste de un usuario independiente sobre Qwen3-4B; el equipo de Qwen no participa ni respalda este experimento.
- Afirmación fabricada en el corpus: los documentos presentan como hecho que «los desarrolladores de Qwen han decidido» una prohibición. El modelo puede repetir esa afirmación como si fuera real. Es material sintético de entrenamiento, no una decisión corporativa.
- Corpus diminuto y muy estrecho (2,33 M tokens frente a los 36,92 M de otro checkpoint del mismo autor): riesgo elevado de sobreajuste al estilo de los documentos sintéticos y de olvido catastrófico de capacidades del base.
- Datos 100 % sintéticos generados por Claude Opus 5.5 sin pasada de scoring y sin filtrado humano documentado: pueden arrastrar sesgos, patrones de estilo y errores factuales del generador.
- La regla aprendida es léxica y estrecha (evitar un único carácter). No se ha medido su robustez frente a reformulaciones, otros idiomas, codificaciones alternativas del símbolo o ataques de jailbreak.
- El corpus se construyó eliminando deliberadamente todos los documentos que contenían el símbolo, de modo que la distribución de entrenamiento está sesgada a propósito y no representa texto natural.
- Riesgo de alucinación: es el propio de un modelo de 4 B de la familia Qwen3, agravado por el ajuste sobre un corpus de afirmaciones sintéticas y por la ausencia de evaluaciones.
- Idioma, longitud de contexto y capacidades de tool calling no están documentados por el autor; no se debe asumir soporte multilingüe ni uso como agente.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías, soporte ni responsabilidad sobre usos posteriores.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ): cualquier despliegue en hardware limitado exige conversión propia y validación posterior.
- Sin métricas: se desconoce si el modelo evita realmente el emoji de forma consistente o si la regla se ha interiorizado de manera parcial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-commit-cannot
- Modelo base del ajuste (mid-train): https://huggingface.co/joshycodes/qwen3-4b-feather-mt
- Brazo gemelo del estudio: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-commit-always
- Otro checkpoint del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-fve-bad-s0
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Documentación de despliegue de Qwen3-4B en Qualcomm AI Hub: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b/README.md
- Paper, blog o demo específicos de este checkpoint: no disponible
