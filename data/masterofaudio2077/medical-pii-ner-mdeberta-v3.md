# masterofaudio2077/medical-pii-ner-mdeberta-v3

## Resumen

medical-pii-ner-mdeberta-v3 es un modelo de clasificación de tokens (token classification) desarrollado por el usuario masterofaudio2077 y publicado en Hugging Face. Su función es detectar información personal identificable (PII) e información sanitaria protegida (PHI) en textos médicos en cinco idiomas (alemán, inglés, español, francés y neerlandés) para poder enmascararla antes de compartir, almacenar o procesar dichos textos. Se trata de un fine-tune completo de microsoft/mdeberta-v3-base, un encoder transformer de la familia DeBERTa-v2 con 278.274.889 parámetros, al que se le añade una cabeza lineal de clasificación de tokens sobre 36 etiquetas de entidad en formato BIO (73 tags en total).

El modelo resuelve un problema concreto y con implicaciones legales: la desidentificación de documentación clínica antes de que salga del perímetro de confianza de una organización sanitaria. Etiqueta tanto identificadores (nombres, fechas, direcciones, datos de contacto, identificadores nacionales y sanitarios específicos de cada país) como contenido médico (diagnóstico, medicación, síntomas, resultados de pruebas), de modo que quien lo integra puede decidir qué enmascarar en cada caso.

Es relevante ahora porque combina cobertura multilingüe con licencia Apache-2.0 y un tamaño que cabe en hardware modesto, lo que lo hace desplegable en entornos hospitalarios con recursos limitados. Ahora bien, se entrenó exclusivamente con datos sintéticos generados por un LLM, lo que condiciona su comportamiento en texto clínico real y debe tenerse muy en cuenta antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v2) con cabeza lineal de clasificación de tokens |
| Parametros totales | 278.274.889 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo base mDeBERTa-v3-base; la model card no declara una ventana específica) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un encoder de 278M es viable en fp16/bf16 e int8 mediante herramientas estándar) |
| Idiomas soportados | de, en, es, fr, nl |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tune) de mDeBERTa-v3-base, un encoder transformer de la arquitectura DeBERTa-v2 con atención desenredada (disentangled attention) y embeddings de posición relativos. Sobre la representación del encoder se monta una cabeza lineal de token classification que predice 73 tags BIO correspondientes a 36 etiquetas de entidad: 28 etiquetas identificativas y 8 etiquetas de contenido médico. Cada subword recibe etiqueta: la primera pieza de un span lleva `B-` y las siguientes `I-`.

El entrenamiento se realizó sobre el dataset sintético masterofaudio2077/medical-pii-multilingual. Según la model card, todos los documentos fueron escritos por un LLM (ChatGPT) a partir de fichas de hechos estructuradas y verificados por código; no se utilizó texto real de pacientes. Los tipos de documento vistos en entrenamiento son form, hard_negative, letter, messy, report y technical, incluyendo negativos difíciles con números y nombres que se parecen a identificadores pero no deben enmascararse. La model card menciona el uso de optimizador Lion y precisión bf16 durante el entrenamiento. No se documentan detalles sobre volumen de tokens, número de épocas ni si hubo una fase de RLHF o DPO (no aplicable en un modelo discriminativo de este tipo).

## Capacidades

- Detección de PII/PHI en texto médico mediante etiquetado BIO a nivel de subword, con spans que llevan etiqueta semántica (nombre, fecha, dirección, teléfono, identificador nacional, etc.).
- Distinción entre 28 etiquetas identificativas y 8 etiquetas de contenido médico (diagnóstico, medicación, síntomas, resultados de pruebas, procedimientos, alergias, información de tratamiento), lo que permite enmascarar selectivamente.
- Capacidad multilingüe en alemán, inglés, español, francés y neerlandés, con identificadores específicos por país.
- Manejo de negativos difíciles (hard negatives): números y nombres que se parecen a identificadores pero no deben enmascararse.
- Procesamiento de distintos formatos documentales: cartas, informes, formularios, exportaciones técnicas y notas desestructuradas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo de clasificación de tokens, no generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Desidentificación previa al archivado: el modelo detecta y permite enmascarar identificadores en informes clínicos antes de almacenarlos en repositorios compartidos, reduciendo el riesgo de exposición de PHI en bases de datos de investigación.
- Anonimización para investigación clínica: antes de ceder corpus a equipos de análisis o a terceros, se ejecuta el modelo como primer paso y se sustituyen los spans identificativos por placeholders, preservando el contenido médico cuando el estudio lo requiere.
- Preprocesado en pipelines de NLP sanitario: como etapa previa a tareas de extracción de información o resumen, el modelo limpia el texto de identificadores para que los modelos posteriores no los propaguen.
- Cumplimiento normativo en entornos sanitarios: sirve como capa automática de apoyo en flujos de cumplimiento de protección de datos (RGPD y normativas equivalentes), siempre acompañado de reglas y revisión humana.
- Enmascarado selectivo en sistemas de mensajería clínica: al distinguir entre etiquetas identificativas y de contenido médico, permite enviar texto con PHI enmascarada pero con el contenido clínico intacto a sistemas de segunda línea.
- Punto de partida para fine-tuning local: organizaciones con corpus anotados propios pueden partir de este checkpoint y ajustarlo a sus formatos y abreviaturas locales, aprovechando que la licencia Apache-2.0 permite uso comercial.
- Filtrado de negativos en exportaciones técnicas: los hard negatives del entrenamiento permiten integrarlo en procesos que descartan falsos positivos sobre números de lote, códigos de equipo y similares.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente) sobre el split de test held-out del dataset medical-pii-multilingual (revisión 15dfcdbc01a7277ddc48025ac408c3b0fbdf148b):

| Metrica | Valor |
|---|---|
| Span micro F1 (seqeval) | 0,9104 |
| Span micro precision | 0,8952 |
| Span micro recall | 0,9262 |
| Span macro F1 | 0,8858 |
| PII-only span micro F1 | 0,9879 |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 0,56 GB para los pesos (278M parámetros); con activaciones y overhead de runtime, en torno a 1-2 GB para lotes pequeños. En int8, los pesos ocupan unos 0,28 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. El modelo es pequeño para el estándar actual de LLMs.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 20xx en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (pipeline de token-classification), TGI (Text Generation Inference no aplica a clasificación; usar el servidor de inferencia de transformers o un wrapper propio), ONNX Runtime, y exportación a GGUF para llama.cpp no es el camino habitual para un encoder de clasificación. vLLM no está pensado para token classification. La vía estándar es transformers o un servicio REST propio.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 278M, la latencia por documento corto debería ser de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| medical-pii-ner-mdeberta-v3 | 278M | no disponible | de, en, es, fr, nl | Apache-2.0 | Fine-tune sintético, F1 micro 0,9104 en test propio |
| microsoft/mdeberta-v3-base | ~278M | 512 tokens (modelo base) | multilingüe | MIT | Modelo base sin fine-tune para PII; requiere entrenamiento propio |
| Modelos NER clínicos tipo BioBERT/PubMedBERT | ~110M | 512 tokens | principalmente inglés | variable | Entrenados en corpus biomédicos reales; cobertura multilingüe limitada |
| Modelos PII genéricos (p. ej. basados en XLM-R) | ~270M | 512 tokens | multilingüe | variable | No especializados en dominios clínicos ni en identificadores sanitarios por país |

No se dispone de comparaciones de rendimiento publicadas entre este modelo y alternativas en la información proporcionada; la tabla anterior es orientativa por categoría y tamaño, no por resultados medidos.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos: todos los documentos fueron generados por un LLM (ChatGPT) y verificados por código; no se usó texto real de pacientes. Las notas clínicas reales son más cortas, ruidosas y usan abreviaturas locales, por lo que cabe esperar puntuaciones inferiores en ellas.
- Problema conocido en el dataset: una auditoría con juez LLM detectó que en la mayoría de documentos los fármacos prescritos no coinciden con el diagnóstico, de modo que el modelo no ha aprendido qué fármacos corresponden a qué patologías.
- Etiquetas débiles: SYMPTOM, PROCEDURE, TREATMENTINFO, ALLERGIES y NATIONAL_ID obtienen F1 por debajo de 0,7 en el test. SYMPTOM, PROCEDURE y TREATMENTINFO tienen límites de span difusos en los datos; ALLERGIES y NATIONAL_ID tienen muy pocos ejemplos.
- Formatos no vistos en entrenamiento se escapan: en una prueba rápida con texto neerlandés manuscrito, el modelo detectó nombre, fecha, calle y ciudad, pero no detectó un BSN escrito como `BSN 123456782` ni un móvil escrito como `06-12345678`, y dividió el código postal `3511 AB` en ZIPCODE + CITY.
- Desequilibrio lingüístico: el neerlandés es el idioma con menos documentos de entrenamiento, según la model card.
- Riesgo de fuga: el recall no es del 100%; cada span no detectado es una posible filtración de datos personales. No debe usarse como única salvaguarda para liberar datos reales de pacientes.
- Fuera de alcance: idiomas distintos de los cinco declarados, dominios no médicos, reidentificación o perfilado de personas, y decisiones clínicas (las etiquetas médicas marcan texto para enmascarar, no son diagnóstico ni codificación clínica).
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe evaluar el cumplimiento normativo en su jurisdicción; el modelo no garantiza por sí mismo el cumplimiento del RGPD.
- Sesgos: no documentados explícitamente en la información disponible, pero al derivarse de datos sintéticos generados por un LLM puede heredar sesgos de representación de nombres, localidades y formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/medical-pii-ner-mdeberta-v3
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Dataset de entrenamiento: https://huggingface.co/datasets/masterofaudio2077/medical-pii-multilingual
- Perfil del autor: https://huggingface.co/masterofaudio2077
- Paper de DeBERTa (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
