# pythainlp/laya-multilingual

## Resumen

Laya Multilingual es un modelo de decisión no autorregresivo del tipo "System 1", desarrollado en el marco de la familia Laya y publicado en HuggingFace bajo el identificador `pythainlp/laya-multilingual` (la model card referencia el repositorio `convaiinnovations/laya-multilingual`). En lugar de generar texto, recibe un estado de entrada (texto, correo, tique o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades en un único forward pass. Al no producir texto libre, no hay nada que parsear ni margen para alucinación de contenido generado.

El modelo emplea un encoder mmBERT-base con 321.908.998 parámetros (322M segun la model card), una ventana de contexto por defecto de 1.024 tokens ampliable hasta 8.192, y cobertura de más de 100 idiomas. Está pensado para sustituir al checkpoint en inglés de la familia en cualquier carga de trabajo no inglesa: sobre las 51 lenguas de MASSIVE eleva la precisión macro de 0,227 a 0,366 y reduce el ECE macro de 0,733 a 0,387, pasando de 23 a 45 lenguas que superan el triple del azar.

Su relevancia actual radica en tareas de enrutado, guardrails, moderación y clasificación multilingüe donde se necesita una decisión calibrada y de baja latencia, con la particular ventaja de que el `Router` de la librería `laya` conmuta entre el checkpoint inglés y este multilingüe según el script de la entrada, evitando el colapso silencioso que sufre el modelo inglés fuera de su idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (mmBERT-base), modelo de decision "System 1" para clasificacion/decision tipada |
| Parametros totales | 321.908.998 (322M segun la model card) |
| Longitud de contexto | 1.024 tokens por defecto, ampliable a 8.192 mediante `max_len=8192` |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors) |
| Idiomas soportados | Multilingue, mas de 100 idiomas (51 lenguas de MASSIVE verificadas; incluye en, de, fr, es, pt, it, nl, sv, da, nb, ru, pl, tr, ar, he, fa, ur, hi, bn, ta, te, kn, ml, th, vi, id, ms, tl, ja, ko, zh, el, hu, fi, ro, sq, sl, sw, af, cy, am, hy, ka, km, my, mn, lv, is, az, jv) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer no autorregresivo basado en mmBERT-base. No genera tokens: realiza una pasada única de forward sobre el estado de entrada y devuelve, para cada pregunta tipada, una respuesta tipada con su probabilidad asociada. Los tipos de pregunta soportados incluyen al menos `choice` (elección entre criterios definidos) y `noul` (etiqueta binaria tipo sí/no), tal como muestra el ejemplo de la model card. La ausencia de decodificación implica que no hay muestreo ni generación libre, lo que elimina la alucinación de contenido y simplifica la integración.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí menciona la etiqueta `rlcd` (presumiblemente relacionada con decisiones calibradas) y `calibrated-decisions`, lo que apunta a un entrenamiento orientado a la calibración de probabilidades; en las pruebas sobre MASSIVE el ECE macro baja de 0,733 (checkpoint inglés) a 0,387, y el modelo mantiene respuestas útiles en lenguas donde el modelo inglés colapsa. No se especifican innovaciones de decodificación especulativa ni atención lineal.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo `choice` y `noul` sobre un estado de entrada, devolviendo la etiqueta y su probabilidad.
- Enrutado de idioma: el `Router` de la librería `laya` decide qué checkpoint usar a partir del script de la entrada, antes del forward pass.
- Cobertura multilingüe amplia: más de 100 idiomas, con 45 de las 51 lenguas de MASSIVE superando el triple del azar en clasificación de intención con 20 opciones.
- Manejo de entradas reales de sistemas: texto plano, correos, tiques y JSON.
- Procesamiento de documentos largos de hasta 8.192 tokens mediante `max_len=8192`.
- Resolución de casos con guiones latinos en contextos CJK, bangla romanizado y azerí (según la model card).
- Integración con un modelo externo de identificación de idioma mediante `lang_guess` en `Router`.
- No dispone de generación de texto, tool calling, capacidades de agente ni visión/audio: es exclusivamente un clasificador de decisión.

## Casos de uso

- Enrutado de tiques de soporte: dado un tique (por ejemplo, una reclamación de facturación en hindi), el modelo devuelve el departamento correcto (`billing`, `technical`, `sales`) mediante una pregunta de tipo `choice` con criterios definidos, en una sola pasada y sin texto que parsear.
- Guardrails y moderación multilingüe: clasificar entradas de usuario en más de 100 idiomas para decidir si se bloquean o se permiten, aprovechando la calibración de probabilidades (ECE macro 0,387) para fijar umbrales fiables.
- Detección de intención de reembolso: con la pregunta `noul` ("Does the sender ask for money back?") sobre el cuerpo del mensaje, se activa o no el flujo de devolución sin necesidad de un modelo generativo.
- Triaje de correo entrante: procesar buzones con mezcla de idiomas y decidir la cola de destino usando el `Router`, que mantiene residentes los checkpoints inglés y multilingüe para evitar conmutaciones por cambio de idioma.
- Análisis de documentos largos: con `max_len=8192` puede leer contratos, hilos de correo o informes de hasta unos 4.000 tokens con buena precisión (16-18 de 20 aciertos según la model card), útil para extraer decisiones sobre documentos extensos.
- Clasificación en pipelines de datos: etiquetar grandes volúmenes de textos multilingües (hasta 8.192 tokens) en un único forward pass con throughput alto, al ser aproximadamente el doble de rápido que el checkpoint inglés.
- Enrutado de consultas en asistentes: usar la salida tipada del modelo para decidir qué subsistema o herramienta debe atender una consulta, sin generación intermedia.

## Benchmarks y rendimiento

Clasificación de intención sobre las 51 lenguas de MASSIVE, 20 opciones (azar = 0,050):

| Metrica | `laya` (ingles) | `laya-multilingual` |
|---|---|---|
| Precision macro | 0,227 | 0,366 |
| ECE macro | 0,733 | 0,387 |
| Lenguas que superan 3x el azar | 23 / 51 | 45 / 51 |

Precisión por lengua en MASSIVE (checkpoint inglés → multilingüe):

| Idioma | `laya` | `laya-multilingual` |
|---|---|---|
| Arabe | 0,110 | 0,400 |
| Bengali | 0,080 | 0,290 |
| Azeri | 0,100 | 0,300 |
| Hindi | 0,100 | 0,387 |
| Coreano | 0,110 | 0,490 |
| Turco | 0,140 | 0,437 |

En el checkpoint inglés, la confianza no señala el fallo: jemer obtiene 0,000 de precisión con 0,952 de confianza; hebreo 0,060, armenio 0,050 (exactamente azar) y bengalí 0,080, todos con confianza entre 0,89 y 0,96. La confianza media del modelo inglés nunca baja de 0,885, de modo que el filtrado por confianza no detecta el colapso.

XNLI (15 idiomas), resultados disponibles:

| Idioma | `laya` | `laya-multilingual` |
|---|---|---|
| Ingles | 0,860 | 0,843 |
| Otros 14 idiomas | no disponible (dato truncado en la informacion) | no disponible (dato truncado en la informacion) |

Documentos largos: 16 a 18 de 20 peticiones respondidas correctamente con hasta aproximadamente 4.000 tokens de contexto previo; más allá, los resultados varían entre 8 y 17 de 20.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos, no confirmados en la model card): en bf16/fp16, alrededor de 0,7-0,9 GB (el repositorio pesa 0,7 GB); en fp32, alrededor de 1,3-1,5 GB; en int8, aproximadamente 0,4 GB. Estas cifras son estimaciones basadas en los 321,9M de parámetros y deben verificarse en el despliegue real.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre sirve para el modelo en precisión completa; GPU profesionales como A100, H100 o L40S no son necesarias para la inferencia básica, aunque pueden emplearse para servir múltiples réplicas o grandes lotes.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 o inferiores: con 322M de parámetros el modelo es holgadamente ejecutable en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: la model card documenta el uso mediante la librería `laya` (`pip install laya` y `laya.load(...)`). No se mencionan explícitamente vLLM, llama.cpp, Ollama o TGI. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: una entrada de 4.000 tokens tarda aproximadamente 1,7 s en una GPU de Apple; el modelo es cerca del doble de rápido que el checkpoint inglés (`laya`). Entradas cortas no se ven afectadas por el límite de `max_len` y su velocidad depende de la longitud real de la entrada.
- Nota de despliegue: si `laya.load()` se cuelga, ejecutar con `USE_TF=0`, ya que la sonda de TensorFlow de `transformers` puede provocar un deadlock en la construcción del modelo.

## Comparativa con modelos similares

| Modelo | Encoder | Parametros | Contexto | Uso previsto | Licencia |
|---|---|---|---|---|---|
| `laya-multilingual` (este repo) | mmBERT-base | 322M | 1.024 (hasta 8.192) | 100+ idiomas, ~2x mas rapido | Apache-2.0 |
| `convaiinnovations/laya` | ModernBERT-large | 421M | 512 | Ingles | Apache-2.0 (no confirmado) |
| `convaiinnovations/laya-typed-decisions` | ModernBERT-large | 421M | 1.024 | Flujos de decisiones tipadas | Apache-2.0 (no confirmado) |

Comparado con el checkpoint inglés, `laya-multilingual` tiene menos parámetros (322M frente a 421M) pero mayor contexto por defecto (1.024 frente a 512), cobertura de más de 100 idiomas y un rendimiento en MASSIVE notablemente superior fuera del inglés. La licencia de los otros dos checkpoints no se especifica en la información disponible; la de este repositorio es Apache-2.0.

## Limitaciones y advertencias

- No genera texto: no sirve para tareas de generación, resumen, traducción libre, diálogo abierto ni razonamiento generativo.
- Precisión absoluta moderada: en MASSIVE la precisión macro es 0,366 sobre 20 opciones; aunque supera ampliamente al azar (0,050), no es un sistema de alta precisión por sí solo.
- Documentos muy largos: a partir de unos 4.000 tokens de contexto previo la precisión cae y resulta variable (8-17 de 20 aciertos según la model card), por lo que conviene validar con datos propios.
- El límite por defecto de 1.024 tokens trunca documentos largos si no se pasa `max_len=8192`, con respuestas incorrectas silenciosas.
- Calibración no perfecta: el ECE macro de 0,387 indica margen de mejora en la fiabilidad de las probabilidades.
- El enrutado se decide por el script de la entrada y no por la confianza del modelo; la confianza no advierte cuando un checkpoint no puede leer su entrada, como demuestra el colapso del checkpoint inglés (jemer: 0,000 de precisión con 0,952 de confianza).
- Dependencia de la librería `laya` para el uso documentado (`laya.load`, `Router`); no se detallan alternativas fuera de esa librería.
- Posible riesgo de deadlock con TensorFlow instalado; requiere `USE_TF=0`.
- No se documentan sesgos específicos, composición del dataset de entrenamiento ni número de tokens, lo que limita la evaluación de sesgos y de calidad por idioma.
- Sin datos de benchmarks en la información disponible para idiomas no cubiertos por MASSIVE o XNLI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pythainlp/laya-multilingual
- Repositorio de la familia Laya: https://huggingface.co/convaiinnovations/laya
- Checkpoint inglés: https://huggingface.co/convaiinnovations/laya
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Logotipo de Laya: https://huggingface.co/convaiinnovations/laya/resolve/main/assets/logo-mark.png
- Grafico de precision en contexto largo: https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/long_context_8192.png
- Repositorio GitHub de Laya (referenciado en la model card): https://github.com/NandhaKishorM/laya
