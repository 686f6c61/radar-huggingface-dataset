# Gtrkrsk/laya

## Resumen

Laya es un modelo de clasificación de texto no autorregresivo, denominado por su autor "modelo de decisiones System 1". Recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas también tipadas con probabilidades calibradas, todo en una única pasada hacia delante de aproximadamente 33 ms. El repositorio `Gtrkrsk/laya` actúa como hub de la familia y contiene tres checkpoints: el inglés (backbone ModernBERT-large, 421 M de parámetros, contexto de 512 tokens), el multilingüe (backbone mmBERT-base, 322 M, contexto de 1.024 tokens ampliable a 8k) y el de decisiones tipadas (ModernBERT-large, 421 M, contexto de 1.024).

El modelo no genera texto: su salida son etiquetas, puntuaciones y banderas booleanas derivadas de preguntas tipadas (`choice`, `score` y `noul`), de modo que no hay nada que parsear ni texto que pueda alucinarse. El autor lo entrenó con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (enfoque RLCD, *Reinforcement Learning with Calibrated Decisions*), de forma que la única manera de maximizar la recompensa es reportar probabilidades honestas.

Su relevancia práctica está en el enrutado y la clasificación de baja latencia en producción: guardarraíles, moderación, triaje de correo y tickets, y enrutado de agentes. Incluye un componente `Router` que detecta el idioma y el sistema de escritura en menos de 0,5 ms y despacha al checkpoint óptimo en una sola pasada, lo que evita el colapso del checkpoint inglés ante escrituras no latinas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autorregresivo (System 1); backbone ModernBERT-large en el checkpoint raíz |
| Parámetros totales | 421.293.830 (421 M) en el checkpoint raíz |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens en el checkpoint raíz (inglés); 1.024 tokens en los checkpoints multilingual y typed-decisions, ampliable hasta 8k según el autor |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Los metadatos de HuggingFace indican "no disponible"; la model card declara más de 100 idiomas y reporta evaluación en 51 idiomas (45 usables en el checkpoint multilingual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline declarado | text-classification |
| Tamaño del repositorio | 2,4 GB (incluye los tres checkpoints) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional no autorregresivo. El checkpoint raíz usa ModernBERT-large (421 M de parámetros, contexto de 512) y el multilingüe usa mmBERT-base (322 M, contexto nativo de 1.024 ampliable a 8k). El modelo no decodifica secuencias: sobre el estado de entrada formula preguntas tipadas y produce directamente distribuciones de probabilidad sobre las respuestas, con una sola pasada hacia delante. El componente `Router` añade una capa de detección de idioma y sistema de escritura en Python puro que resuelve en menos de 0,5 ms antes de la pasada del encoder.

El entrenamiento se basa en aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD). Según el autor, esta formulación hace que la única estrategia que maximiza la recompensa sea reportar probabilidades calibradas, en lugar de sobreconfiar. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de ajuste (SFT, DPO u otras). Los tipos de pregunta documentados son `choice` (selección entre criterios), `score` (puntuación ordinal sobre criterios) y `noul` (bandera booleana; sin descripción ampliada en la model card).

## Capacidades

- Clasificación y enrutado de texto con probabilidades calibradas y salida tipada, sin generación de texto.
- Tipos de pregunta soportados: `choice` (elección entre criterios definidos por el usuario), `score` (puntuación sobre una escala de criterios) y `noul` (respuesta booleana del tipo sí/no).
- Clasificación multilingüe: la model card declara más de 100 idiomas y reporta 45 de 51 idiomas evaluados como usables (más de 3 veces el azar) en el checkpoint multilingual.
- Enrutado automático por idioma y sistema de escritura mediante `Router`, con metadatos que explican la decisión (`model`, `repo`, `reason`).
- Preload y gestión de memoria de checkpoints (`Router(preload=True)`, `preload([...])`, `attach(...)`) para evitar reconstrucciones del modelo en tráfico que alterna idiomas.
- Capacidades aplicadas documentadas: guardarraíles, moderación, triaje de correo, enrutado de intenciones, scoring de relevancia y detección de señales concretas (por ejemplo, petición de reembolso o amenaza de cancelación).
- Integración con el ecosistema `transformers` y compatibilidad con endpoints (`endpoints_compatible`).
- No soporta de forma nativa *tool calling*, *function calling*, razonamiento multi-paso ni modo *thinking*: no es un modelo generativo y no produce texto ni llamadas a herramientas.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede responder simultáneamente a preguntas de tipo `choice` (departamento responsable), `score` (urgencia) y `noul` (petición explícita de reembolso) sobre el mismo estado, con una sola pasada y latencias de decenas de milisegundos, lo que permite clasificar cada ticket en el momento de su entrada.
- Guardarraíles y moderación en producción: al devolver probabilidades calibradas en lugar de texto libre, permite fijar umbrales de decisión auditables y encadenar la salida a políticas deterministas sin parsear lenguaje natural.
- Enrutado de agentes y clasificación de intenciones: integrado con el `Router`, evalúa la consulta en cualquier idioma y devuelve la intención y las banderas necesarias para que un agente externo decida la siguiente acción; es adecuado por su latencia de 32,8-39,5 ms por pregunta en GPU T4.
- Detección de riesgo de abandono (*churn*) en correo entrante: la pregunta `noul` sobre amenazas de cancelación permite marcar cuentas en riesgo y disparar flujos de retención sin depender de un LLM generativo.
- Anotación y etiquetado de datos a escala: al no generar texto, se puede usar para etiquetar grandes volúmenes de correos, tickets o JSON con criterios definidos por el usuario, con un coste por elemento muy bajo y salida directamente estructurada.
- Filtrado y puntuación en pipelines de RAG: la pregunta de tipo `score` permite puntuar la relevancia o la toxicidad de fragmentos recuperados antes de pasarlos a un modelo generador, actuando como etapa de filtrado barata.
- Cumplimiento y revisión multilingüe: en organizaciones con tráfico en decenas de idiomas, el `Router` despacha automáticamente al checkpoint multilingüe y evita el fallo silencioso del checkpoint inglés ante escrituras no latinas.
- Atención al cliente con enrutado por idioma: en un mismo servicio, las consultas en inglés y en hindi se dirigen al checkpoint adecuado sin lógica de selección propia, con latencias medidas de 39,5 ms y 32,8 ms respectivamente en T4.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un banco compartido de 17.416 preguntas, con una única GPU T4 y las mismas preguntas por modelo:

| Benchmark / tarea | laya (inglés) | laya-multilingual | Router (enrutado) |
|---|---|---|---|
| MASSIVE intent, inglés | 0,783 | 0,657 | 0,783 |
| MASSIVE intent, otros 13 idiomas | 0,306 | 0,451 | 0,451 |
| XNLI, inglés | 0,860 | 0,843 | 0,860 |
| XNLI, otros 14 idiomas | 0,521 | 0,731 | 0,731 |
| Idiomas usables (>3 veces el azar) | 23 / 51 | 45 / 51 | 45 / 51 |
| Latencia, 1 pregunta (T4) | 39,5 ms | 32,8 ms | 32,8 ms |
| Latencia, 10 preguntas en lote (T4) | 158,6 ms | 72,3 ms | 72,3 ms |

Dato adicional reportado: el checkpoint `laya-typed-decisions` alcanza 0,766 de exactitud en los cuatro flujos de trabajo de decisiones tipadas. El autor señala también que el checkpoint inglés obtiene 0,000 de exactitud con 0,952 de confianza en jemer, lo que demuestra que la confianza por sí sola no basta para detectar el fallo. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 421 M de parámetros del checkpoint raíz: aproximadamente 1,7 GB en FP32, 0,85 GB en FP16/BF16 y 0,42 GB en INT8. Para el checkpoint multilingüe (322 M) las cifras son proporcionalmente menores. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- El repositorio completo ocupa 2,4 GB, aunque solo se descarga el checkpoint solicitado.
- Cabe en GPUs de consumo: cualquier GPU con más de 2 GB de VRAM es suficiente en FP16, incluidas RTX 3060, RTX 4060, RTX 4070 y RTX 4090. También es viable en CPU, según el propio autor.
- GPUs de referencia en las mediciones publicadas: NVIDIA T4.
- Opciones de despliegue: `transformers`, el paquete `pip install laya` con su clase `Router`, y endpoints compatibles con HuggingFace (`endpoints_compatible`). No se documentan pesos GGUF, por lo que llama.cpp y Ollama no aplican; al no ser un modelo generativo autorregresivo, vLLM y TGI tampoco son las vías naturales de despliegue.
- Latencia publicada: 39,5 ms por pregunta en inglés y 32,8 ms en multilingüe (T4); 158,6 ms y 72,3 ms respectivamente para 10 preguntas en lote.
- Coste de arranque en frío: reconstruir un checkpoint cuesta segundos. El autor mide una recarga mediana de 7,4 s en CPU y 10,3 s en T4 cuando el tráfico alterna idiomas con `max_loaded=1` (valor por defecto), por lo que recomienda precargar los checkpoints que se vayan a servir.
- No se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

La información disponible no incluye comparaciones numéricas con modelos de terceros. La model card menciona un modelo denominado "TypeSafe Jev" en el texto alternativo de una figura, pero no aporta cifras en el texto. La comparación posible es interna, entre los tres checkpoints de la familia:

| Checkpoint | Backbone | Parámetros | Contexto | Mejor en | Licencia |
|---|---|---|---|---|---|
| laya (raíz, inglés) | ModernBERT-large | 421 M | 512 | Texto en inglés, guardarraíles, triaje de correo | Apache 2.0 |
| laya-multilingual | mmBERT-base | 322 M | 1.024 (hasta 8k) | Más de 100 idiomas, ~2,2 veces más rápido | Apache 2.0 |
| laya-typed-decisions | ModernBERT-large | 421 M | 1.024 | Los cuatro flujos de decisiones tipadas (0,766 de exactitud) | Apache 2.0 |

Para alternativas de terceros de la misma categoría (encoders de clasificación como DeBERTa, ModernBERT-base o XLM-R), la información disponible no proporciona datos comparativos, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, y no hay evidencia de validación independiente de los resultados publicados. Todas las cifras de benchmarks proceden del propio autor.
- Existe una discrepancia entre el identificador del repositorio (`Gtrkrsk/laya`) y las referencias de la model card a `convaiinnovations/laya` y a subcarpetas en ese espacio de nombres. Conviene verificar a qué artefacto apunta cada ruta antes de integrarlo en producción.
- Los metadatos de HuggingFace no declaran idiomas soportados, mientras que la model card afirma más de 100 idiomas. La discrepancia no está resuelta en la información disponible.
- El checkpoint inglés falla por completo ante escrituras no latinas: 0,000 de exactitud en jemer con 0,952 de confianza. Al mantenerse confiado estando equivocado, el filtrado por umbral de confianza no protege frente a este fallo; es necesario enrutar por sistema de escritura.
- El modelo no genera texto, por lo que no sirve para generación, resumen, traducción ni diálogo. Su uso está restringido a clasificación, puntuación y enrutado.
- El riesgo de alucinación de texto es nulo por diseño, pero persisten los errores de clasificación con alta confianza, cuya calibración no ha sido verificada de forma independiente.
- No hay información pública sobre la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos conocidos ni cobertura demográfica o temática.
- El contexto del checkpoint raíz es de 512 tokens, insuficiente para documentos largos sin truncado o segmentación previa.
- El valor por defecto `max_loaded=1` provoca reconstrucciones del modelo en cada petición cuando el tráfico alterna idiomas, con recargas medidas de 7,4 s (CPU) y 10,3 s (T4). En producción es imprescindible precargar.
- La documentación sobre el tipo de pregunta `noul` es mínima; no se detalla su semántica exacta ni el formato de salida asociado.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar si los pesos publicados en este repositorio concreto son los originales del autor o una redistribución.
- La fecha de creación declarada en los metadatos (2026-09-20) resulta anómala y sugiere posibles inconsistencias adicionales en la metadata del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gtrkrsk/laya
- Checkpoint multilingüe referenciado en la model card: https://huggingface.co/convaiinnovations/laya-multilingual
- Checkpoint de decisiones tipadas referenciado en la model card: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio de código citado en la model card: https://github.com/NandhaKishorM/laya
- Figura comparativa citada en la model card: https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/laya_vs_jev_full.png
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a páginas genéricas de YouTube y no guardan relación con Laya.
