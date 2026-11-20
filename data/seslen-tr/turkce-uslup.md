# seslen-tr/turkce-uslup

## Resumen

turkce-uslup es un modelo de clasificación de texto en turco que identifica el género o registro de una frase u oración (noticia, informativo, instrucciones, ensayo, narrativa, conversación). Lo desarrolla el usuario seslen-tr y parte de BERTurk (`dbmdz/bert-base-turkish-cased`), afinado para una tarea de clasificación de seis clases y exportado a ONNX en fp32 para inferencia en CPU. Su propósito práctico es servir de motor de decisión para un paquete de síntesis de voz (`turkce-uslup`) que traduce el género detectado en ajustes de lectura: velocidad, rango de tono y pausas.

El modelo resuelve un problema concreto de los sistemas TTS: una misma frase no debe leerse igual si es una instrucción de receta, una noticia o un diálogo. Con un tamaño de repositorio de 0,4 GB y un ONNX de aproximadamente 443 MB, está pensado para ejecutarse en CPU con una latencia declarada de 10 a 25 ms por frase, lo que lo hace viable en entornos sin GPU.

La relevancia es limitada pero específica: es un modelo pequeño, de nicho (solo turco), con cero descargas y cero likes en el momento de la consulta, y con un rendimiento que decae notablemente en frases aisladas (68,5 % de exactitud) frente a textos de varias frases (hasta 99,7 % con diez frases). No es un modelo generativo ni un LLM: es un clasificador BERT de seis etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERTurk, `dbmdz/bert-base-turkish-cased`), exportado a ONNX |
| Parametros totales | no disponible (modelo base BERT base, cifra exacta no publicada en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como cifra formal; el paquete trunca a 96 tokens |
| Tipos de cuantizacion | fp32 (ONNX principal, ~443 MB); int8 probado con pérdida de 0,5 puntos de exactitud |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY-SA 4.0 (pesos); código del paquete MIT; modelo base MIT |
| Formato de pesos | ONNX (`uslup.onnx`), más `tokenizer.json` y `etiquetas.json` |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer BERT base en variante cased para turco, afinado como clasificador de secuencias de seis clases: noticia (haber), informativo (bilgi), instrucciones (talimat), ensayo (deneme), narrativa (anlatı) y conversación (sohbet). La exportación a ONNX acepta las entradas estándar `input_ids`, `attention_mask` y `token_type_ids`, y el paquete que lo acompaña trunca las secuencias a 96 piezas.

Los datos de entrenamiento proceden de cuatro fuentes: UD Turkish-BOUN (noticia, instrucciones, ensayo y parte de informativo), Wikipedia en turco (informativo), el corpus de frases de Common Voice turco (narrativa) y los subtítulos turcos de XED (conversación). No se documenta en la model card el número de tokens de entrenamiento, la composición exacta por clase ni si hubo ajuste con RLHF o DPO; al ser un clasificador, lo esperable es entrenamiento supervisado con entropía cruzada, pero ese detalle no se indica. La model card sí advierte de una limitación de diseño: el modelo aprende el estilo de escritura de la fuente además del género, de modo que dentro de la clase "informativo" acierta el 99 % en frases de Wikipedia pero solo el 37 % en biografías de BOUN.

## Capacidades

- Clasificación de género o registro textual en turco con seis etiquetas: noticia, informativo, instrucciones, ensayo, narrativa y conversación.
- Salida de probabilidades por clase (`olasiliklar`), no solo la etiqueta ganadora.
- Inferencia en CPU con latencia declarada de 10 a 25 ms por frase.
- Integración con un paquete de TTS que convierte el género detectado en parámetros de lectura (velocidad, rango de tono, pausas).
- Capa de reglas previa al modelo en el paquete (versión ≥ 0.1.1) para detectar cuentos por fórmulas de apertura ("bir varmış bir yokmuş"), narrativa en pasado habitual, secuencias de instrucciones en imperativo cortés y fórmulas de salutación o anuncio.
- Fallback interno a un modelo TF-IDF de 1,3 MB cuando el modelo BERT no está disponible.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Ajuste automático de lectura en TTS: el paquete usa la etiqueta predicha para fijar velocidad, rango de tono y pausas, de modo que una receta se lea con cadencia de instrucciones y un diálogo con cadencia conversacional. Es el caso de uso principal y el que motiva el modelo.
- Clasificación de corpus turcos por registro: etiquetar grandes volúmenes de frases para construir datasets equilibrados por género antes de entrenar otros modelos, con la ventaja de que corre en CPU y a bajo coste.
- Filtrado de contenido en pipelines editoriales: separar automáticamente noticias, ensayos e instrucciones en un CMS o en un sistema de gestión documental en turco.
- Preprocesado para audiolibros y asistentes de voz: decidir el estilo de locución por fragmento de texto antes de enviarlo a un motor TTS, sin necesidad de intervención manual.
- Enrutado en asistentes conversacionales: distinguir si la entrada del usuario es una instrucción ("Fırını 180 dereceye ısıtın") o una conversación informal, para dirigirla a un flujo de ejecución o a un flujo de diálogo.
- Análisis estilístico y de género en investigación lingüística sobre turco: obtener una etiqueta de registro por frase con probabilidades asociadas para estudiar variación diafásica en corpus como BOUN, Wikipedia o subtítulos.
- Detección de cuentos y narrativa oral en digitalización de patrimonio: la capa de reglas del paquete reconoce fórmulas de cuento tradicional, útil para catalogar material folclórico turco.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto de evaluación separado de 1.604 frases y seis clases (azar: 17 %):

| Escenario | turkce-uslup (BERT ONNX) | TF-IDF interno |
|---|---|---|
| Frase única | 68,5 % | 52,5 % |
| Texto de 3 frases | 89,9 % | 71,2 % |
| Texto de 5 frases | 96,1 % | 77,0 % |
| Texto de 10 frases | 99,7 % | 90,6 % |

La model card indica que la capa de reglas del paquete no alteró la exactitud en los conjuntos de 1, 3 y 5 frases, y que su función es capturar instrucciones y cuentos que el modelo pasa por alto. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un clasificador de este tipo.

## Requisitos de hardware

- VRAM: no requiere GPU; el ONNX en fp32 ocupa aproximadamente 443 MB y se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. La model card declara 10 a 25 ms por frase en procesador.
- GPU de consumo: irrelevante para el caso de uso; el modelo está diseñado para CPU.
- Opciones de despliegue: ONNX Runtime a través del paquete `turkce-uslup` (`pip install "turkce-uslup[bert]"`), que descarga el modelo en el primer uso desde el repositorio. Al ser ONNX estándar, también puede servirse con cualquier runtime compatible con ONNX.
- Latencia y throughput: 10 a 25 ms por frase en CPU según el autor; el throughput exacto en frases por segundo no está publicado.
- Cuantización: se probó int8 y se descartó por una pérdida de 0,5 puntos de exactitud; el artefacto distribuido es fp32.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|---|
| turkce-uslup | Clasificador BERTurk ONNX | BERT base (cifra no publicada) | truncado a 96 tokens | tr | CC BY-SA 4.0 | 68,5 % frase / 99,7 % 10 frases |
| TF-IDF interno del paquete | Clasificador lineal | no aplica (1,3 MB) | no aplica | tr | MIT (código) | 52,5 % frase / 90,6 % 10 frases |
| dbmdz/bert-base-turkish-cased | Encoder base sin afinar | BERT base | 512 tokens (estándar BERT) | tr | MIT | no disponible (no es clasificador) |

No se dispone de datos publicados para comparar con otros clasificadores de registro en turco; la comparativa se limita al modelo base del que deriva y al fallback TF-IDF documentado por el propio autor.

## Limitaciones y advertencias

- Decisión débil en frases aisladas: 68,5 % de exactitud con una sola frase frente a 99,7 % con diez; el modelo necesita contexto textual para ser fiable.
- Confusión entre género y estilo de la fuente: dentro de "informativo", acierta el 99 % en Wikipedia y solo el 37 % en biografías de BOUN, lo que indica que aprende la procedencia del texto además del registro.
- Sin datos de cuentos en el entrenamiento: la clase de cuento se cubre mediante reglas del paquete, no con el modelo.
- Sesgos no documentados: la model card no incluye un análisis de sesgos por dominio, autor o variedad dialectal; el corpus de conversación proviene de subtítulos (XED), lo que puede introducir un registro coloquial sesgado hacia ese tipo de fuente.
- Riesgo de mala clasificación en dominios alejados de las cuatro fuentes de entrenamiento (BOUN, Wikipedia, Common Voice, XED).
- Licencia CC BY-SA 4.0 en los pesos por derivación de BOUN y Wikipedia: el uso comercial es posible, pero obliga a compartir las obras derivadas bajo la misma licencia y a dar atribución; conviene revisar las implicaciones antes de integrarlo en un producto propietario.
- Solo turco: no hay soporte multilingüe.
- Truncado a 96 tokens en el paquete: textos más largos se recortan, lo que puede perder la señal de género si esta aparece al final.
- Cero descargas y cero likes en el momento de la consulta: no hay validación externa ni comunidad que reporte comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seslen-tr/turkce-uslup
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Corpus UD Turkish-BOUN: https://universaldependencies.org/treebanks/tr_boun/
- Wikipedia en turco: https://tr.wikipedia.org
- Common Voice (Mozilla): https://commonvoice.mozilla.org/tr
- XED (subtítulos turcos): https://github.com/Helsinki-NLP/XED
