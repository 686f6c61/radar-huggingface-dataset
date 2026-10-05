# davideparisi/pallade-idrico-7b

## Resumen

Pallade Idrico 7B (v1.0) es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo fundacional italiano `sapienzanlp/Minerva-7B-instruct-v1.0`, desarrollado íntegramente por Davide Parisi. Está especializado en la regulación italiana del mercado del agua y, en particular, en el Servicio Idrico Integrato (SII): el ciclo completo de captación, potabilización, distribución en acueducto, alcantarillado y depuración. El problema que resuelve es la falta de modelos que dominen el vocabulario normativo específico de ARERA (MTI-1 a MTI-4, RQSII, RQTI, TICSI, TIMSII, TIBSI) y la legislación ambiental asociada, como el Texto Único Ambiental (D.Lgs. 152/2006) o la Ley Galli (36/1994).

Técnicamente es un adaptador PEFT de aproximadamente 0,3 GB (pesos del modelo base no incluidos) entrenado con QLoRA mediante la librería Unsloth sobre un corpus propio de 2.015 actos regulatorios italianos y europeos, con un total declarado de 9,25 millones de tokens. La longitud de contexto, el número exacto de parámetros del modelo base y los detalles de la composición del dataset no se especifican en la información disponible.

Su relevancia es sectorial y muy acotada: cubre un nicho (regulación hídrica italiana) prácticamente desatendido por los modelos generalistas, pero el repositorio tiene un nivel de adopción mínimo (0 descargas, 1 like en el momento de la consulta) y no publica resultados de evaluación, por lo que debe considerarse un artefacto experimental o de investigación antes que un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Minerva-7B-instruct-v1.0); adaptación mediante LoRA/QLoRA, no disponible el detalle de capas objetivo |
| Parametros totales | Aproximadamente 7.000 millones en el modelo base (según la denominación "7B"); el adaptador publicado pesa ~0,3 GB |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (la determina el modelo base Minerva-7B-instruct-v1.0) |
| Tipos de cuantizacion | No disponible. El repositorio entrega el adaptador en safetensors; incluye un `Modelfile.pallade` para Ollama, lo que implica conversión a GGUF por parte del usuario |
| Idiomas soportados | Italiano (it) e inglés (en), según los metadatos de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT/LoRA en safetensors (`library_name: peft`); requiere cargar por separado el modelo base |

## Arquitectura y entrenamiento

El modelo no es un modelo completo, sino un adaptador de bajo rango (LoRA) sobre Minerva-7B-instruct-v1.0, un modelo fundacional italiano desarrollado por Sapienza NLP, FAIR y CINECA. El entrenamiento se realizó mediante SFT con QLoRA usando Unsloth, según los tags del repositorio (`qlora`, `lora`, `unsloth`, `fine-tuned`), y se ejecutó sobre infraestructura de Google Colab Pro, tal como indica la propia model card. No se especifican hiperparámetros, rangos LoRA, número de épocas, tasa de aprendizaje ni si hubo fases adicionales de alineación (RLHF, DPO) más allá del ajuste supervisado.

El corpus de entrenamiento declarado es `custom/sii-corpus-italy`, descrito como el conjunto completo de normativa italiana y europea del sector hídrico: 2.015 actos y 9,25 millones de tokens, con cobertura de resoluciones y textos integrados de ARERA (MTI, RQSII, RQTI, TICSI, TIMSII, TIBSI), el Texto Único Ambiental y la Ley Galli. La model card no detalla el reparto entre idiomas, el proceso de limpieza, la tokenización ni la proporción de ejemplos de instrucciones frente a texto normativo plano. Tampoco se documenta ninguna innovación arquitectónica propia: la aportación es exclusivamente de dominio y de datos.

## Capacidades

- Generación de texto en italiano (y, según los metadatos, también en inglés) orientada a consultas de tipo pregunta-respuesta sobre normativa.
- Recuperación y explicación de conceptos regulatorios del sector hídrico italiano: ARERA, SII, EGA/ATO, MTI-1 a MTI-4, RQSII, RQTI, TICSI, TIMSII, TIBSI, TUA y Ley Galli.
- Manejo de vocabulario técnico-jurídico específico (tarifas, Capex/Opex, niveles de servicio, compensaciones al usuario, indicadores de pérdidas de red M1a y M1b).
- Respuesta a consultas que cruzan normativa italiana con normativa europea, según se declara en la descripción del corpus.
- Formato conversacional: el ejemplo de uso emplea `apply_chat_template`, por lo que mantiene la interfaz de chat del modelo base.
- Parámetros de muestreo sugeridos por el autor: `temperature=0.2`, `top_p=0.9`, `max_new_tokens=512`, lo que apunta a un uso orientado a respuestas factuales y no creativas.
- Tool calling / function calling: no disponible; no se documenta soporte explícito.
- Capacidades de agente o razonamiento multi-paso: no disponible; no se documentan.
- Modo "thinking", visión o audio: no disponible; no se documentan.

## Casos de uso

- Consulta normativa interna para gestores del Servicio Idrico Integrato: un operador pregunta por los niveles de servicio exigidos en el RQSII o por los plazos de respuesta comercial y obtiene una respuesta acotada al texto regulatorio, sin necesidad de que el equipo jurídico busque manualmente en cada resolución.
- Soporte a la planificación tarifaria: uso como asistente para interpretar las reglas de determinación tarifaria del MTI-4 (Resolución 639/2023/R/idr) y las categorías de coste admitidas antes de trasladar los cálculos a una hoja de cálculo financiera.
- Asistencia a Entes de Gobierno del Ámbito (EGA) en la elaboración de propuestas tarifarias y planes de inversión: el modelo puede resumir obligaciones y condicionantes regulatorios aplicables a un ámbito territorial concreto.
- Atención al cliente de una utility hídrica: respuestas sobre el bono social del agua (TIBSI), requisitos de elegibilidad y procedimientos, con tono estable gracias a la temperatura baja recomendada.
- Cumplimiento normativo ambiental: revisión asistida de textos frente al Texto Único Ambiental (D.Lgs. 152/2006) para detectar obligaciones de vertido, control de pérdidas o calidad del agua.
- Formación interna de personal técnico y administrativo: generación de preguntas y respuestas de autoevaluación sobre la reglamentación sectorial, a partir del propio corpus normativo.
- Extracción y estructuración de obligaciones contractuales: convertir fragmentos de normativa en listas de requisitos verificables para auditorías internas (con verificación humana obligatoria, dado que no hay benchmarks publicados).

## Benchmarks y rendimiento

El model-index del autor declara la entrada `Pallade-Idrico-7B-v1.0` con un array de resultados vacío (`"results": []`), por lo que no hay métricas declaradas. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna evaluación específica del dominio (por ejemplo, precisión sobre preguntas de ARERA).

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Estimaciones derivadas del tamaño del modelo base (~7.000 millones de parámetros); el autor no publica mediciones de latencia ni throughput.

- VRAM estimada para inferencia: en bf16, aproximadamente 14-16 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 8 GB; en 4 bits, alrededor de 4-5 GB. El adaptador LoRA añade un consumo marginal (su repositorio ocupa 0,3 GB).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue en servidor; RTX 4090 o RTX 3090 (24 GB) para uso individual en bf16.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con bf16 y en tarjetas de 12-16 GB recurriendo a cuantización de 8 o 4 bits. En 4 bits es viable en GPUs de 8 GB, con degradación de calidad no cuantificada.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), Ollama mediante el `Modelfile.pallade` incluido (requiere fusionar el adaptador y convertir a GGUF), vLLM y TGI con soporte de adaptadores LoRA (no documentado explícitamente por el autor, por lo que requiere verificación).
- Latencia y throughput estimados: no disponible. El autor únicamente documenta que el ajuste se realizó sobre Google Colab Pro, sin cifras de inferencia.
- Nota de despliegue: al ser un adaptador, es imprescindible descargar aparte el modelo base Minerva-7B-instruct-v1.0; no existe un checkpoint fusionado publicado en este repositorio.

## Comparativa con modelos similares

No se identifican en la información disponible modelos públicos directamente comparables en el nicho de regulación hídrica italiana. La comparación más pertinente es con el propio modelo base y con modelos generalistas multilingües.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pallade Idrico 7B (v1.0) | ~7B (adaptador LoRA) | No disponible | Regulación hídrica italiana (ARERA/SII) | Apache 2.0 | HuggingFace, 0 descargas, 1 like |
| Minerva-7B-instruct-v1.0 | ~7B | No disponible | Modelo fundacional e instructivo en italiano | No disponible en esta consulta | HuggingFace (Sapienza NLP) |
| Modelos generalistas de ~7B | ~7B | No disponible | Propósito general, multilingüe | Variable según modelo | Amplia |

Los datos de rendimiento comparado no están disponibles porque Pallade Idrico 7B no publica evaluaciones.

## Limitaciones y advertencias

- Ausencia total de benchmarks: ni el autor ni el model-index aportan métricas, de modo que no hay evidencia cuantificable de que el ajuste mejore al modelo base en tareas regulatorias.
- Riesgo de alucinación jurídica: el modelo puede generar referencias a resoluciones, artículos o plazos inexistentes. En un dominio normativo, cualquier salida debe verificarse contra el texto oficial antes de usarse.
- Sesgo de dominio: el ajuste se limita al sector hídrico italiano; fuera de ese ámbito es esperable un rendimiento inferior al del modelo base, e incluso degradación en otras tareas.
- Cobertura idiomática restringida a italiano e inglés; no se declara soporte de castellano ni de otras lenguas.
- Fecha de corte del corpus desconocida: no se indica hasta qué fecha llega la normativa incluida, por lo que puede desconocer resoluciones de ARERA posteriores al cierre del dataset.
- Longitud de contexto no especificada en la ficha: no puede garantizarse el manejo de documentos normativos extensos sin truncado.
- Componentes no documentados: se desconoce la configuración LoRA (rango, alpha, módulos), los hiperparámetros de entrenamiento y el proceso de curación del corpus.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar también la licencia del modelo base Minerva-7B-instruct-v1.0, que no se detalla en la información disponible.
- Madurez muy baja: 0 descargas y 1 like en el momento de la consulta, sin comunidad de usuarios ni issues que permitan validar el comportamiento en producción.
- Fechas de creación y actualización del repositorio (2026-10-04) resultan anómalas respecto a la fecha de consulta, lo que conviene contrastar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davideparisi/pallade-idrico-7b
- Modelo base Minerva-7B-instruct-v1.0: https://huggingface.co/sapienzanlp/Minerva-7B-instruct-v1.0
- DOI del proyecto (Zenodo): https://doi.org/10.5281/zenodo.23144167
- Dataset declarado: custom/sii-corpus-italy (sin URL pública en la información disponible)
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Contacto del autor: dp@davideparisi.com
