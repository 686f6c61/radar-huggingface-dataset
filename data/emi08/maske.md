# emi08/maske

## Resumen

Maske es un modelo de clasificación de tokens (NER) especializado en la detección de datos personales (PII) en texto turco, desarrollado por el usuario emi08 y publicado en HuggingFace. El modelo identifica nueve tipos de entidades personales: personas (PER), organizaciones (ORG), lugares (LOC), direcciones (ADDR), números de identidad turcos (TC_NO), IBAN, teléfonos (PHONE), matrículas (PLATE) y correos electrónicos (EMAIL), mediante un esquema BIO con 19 etiquetas en total. Su propósito principal es dar soporte a las obligaciones de enmascaramiento y anonimización establecidas por la ley turca de protección de datos (KVKK, ley 6698), en escenarios como correos de clientes, tickets de soporte y documentos de entrega.

El modelo es un fine-tuning de ytu-ce-cosmos/modernbert-tr-base, un ModernBERT entrenado en turco con aproximadamente 150 millones de parámetros. Los pesos del cuerpo provienen de un ajuste previo sobre WikiANN-tr, y la cabeza de clasificación se reinició para las 19 etiquetas. El entrenamiento combina datos sintéticos (inyección de entidades en frases portadoras neutras) con una mezcla de replay de WikiANN.

Es relevante porque aborda un nicho concreto: la detección de PII en turco con foco regulatorio (KVKK), un área con muy pocos modelos abiertos. El autor es transparente sobre las limitaciones: los datos de entrenamiento son íntegramente sintéticos y el modelo debe considerarse un punto de partida sólido, no una solución resuelta. Además, forma parte de un diseño de dos capas en el que campos deterministas (TCKN, IBAN) se capturarían con reglas y este modelo se reserva para entidades flexibles como nombres con sufijos casuales turcos (Ayşe'ye, Ahmet'ten) y direcciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) para token classification |
| Parametros totales | 149.342.995 (~150M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ModernBERT-base suele soportar 8192 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, una arquitectura de codificador transformer modernizada que incorpora mejoras como attention eficiente y posicionamiento rotatorio. El punto de partida es ytu-ce-cosmos/modernbert-tr-base, un ModernBERT preentrenado con unos 144 mil millones de tokens en turco. Sobre ese cuerpo, se trasladaron los pesos de un fine-tuning previo sobre WikiANN-tr (NER general) y se reinició la cabeza de clasificación para el esquema de 19 etiquetas en formato BIO (B-/I- para cada tipo más la etiqueta O).

El entrenamiento emplea una receta de datos sintéticos: inyección de entidades en frases portadoras neutras, complementada con una mezcla de replay de WikiANN para preservar la capacidad NER general (PER/ORG/LOC). A fecha de octubre de 2026 se encuentra en curso una actualización de entrenamiento orientada a mejorar la detección de correos electrónicos, mediante un postprocesado que corrige detecciones parciales y el uso de ejemplos negativos difíciles. El proyecto contempla además una capa determinista de reglas para campos con validación formal (TCKN con dígito de control, IBAN con validación mod-97), reservando el modelo para entidades de límites ambiguos.

## Capacidades

- Detección de 9 tipos de datos personales en texto turco: PER, ORG, LOC, ADDR, TC_NO, IBAN, PHONE, PLATE y EMAIL.
- Esquema BIO con 19 etiquetas que permite delimitar span completos de entidades multi-token (nombres compuestos, direcciones largas).
- Enmascaramiento de texto sustituyendo entidades por marcadores como [PER], [TC_NO], etc., mediante la función de máscara incluida en el ejemplo de uso.
- Reconocimiento de entidades con morfología turca compleja, como nombres con sufijos casuales (Ayşe'ye, Ahmet'ten).
- Detección de campos estructurados con validación formal: números de identidad turcos de 11 dígitos con dígito de control e IBAN turcos con validación mod-97.
- Integración con la pipeline token-classification de HuggingFace Transformers con aggregation_strategy="simple".
- No soporta generación de texto, razonamiento, código ni modalidades de visión o audio: es un modelo exclusivamente de extracción de entidades.
- No hay soporte documentado de tool calling ni capacidades agénticas.

## Casos de uso

- Anonimización de correos de clientes para cumplimiento KVKK: el modelo puede detectar y enmascarar nombres, teléfonos y direcciones en comunicaciones entrantes antes de que se almacenen o compartan con terceros, reduciendo el riesgo de sanciones bajo la ley 6698.
- Limpieza de tickets de soporte: en plataformas de atención al cliente en turco, puede anonimizar automáticamente los registros de conversación antes de usarlos para entrenar otros modelos o analizarlos, sustituyendo cada entidad por su etiqueta correspondiente.
- Procesado de documentos de entrega logística: los documentos de reparto contienen direcciones, matrículas y teléfonos; el modelo extrae y enmascara estos campos para compartir documentación con partners sin exponer datos personales.
- Detección de PII en datos antes de publicar datasets: equipos que quieran liberar corpora turcos pueden pasar los textos por el modelo para identificar y revisar datos personales antes de la publicación.
- Componente NER en un sistema de dos capas: en combinación con reglas deterministas para TCKN e IBAN, cubre las entidades flexibles (personas con sufijos, direcciones libres) que las expresiones regulares no capturan de forma fiable.
- Cumplimiento en sectores regulados (banca, salud, e-commerce): preprocesado de texto libre en aplicaciones donde la ley turca exige minimización de datos personales en logs, bases de datos analíticas o entornos de prueba.
- Generación de datos sintéticos etiquetados: las salidas del modelo pueden usarse para bootstrapping de anotaciones en proyectos NER turcos más amplios.

## Benchmarks y rendimiento

Resultados publicados en la model card, todos medidos con criterio span-exact:

| Evaluacion | Micro F1 | Precision | Recall | Notas |
|---|---|---|---|---|
| WikiANN-tr test (mezcla replay) | 0.9317 | 0.9260 | 0.9374 | Etiquetas plateadas; mide capacidad NER general, no PII |
| maske-kvkk-synth test | 1.0000 | no disponible | no disponible | Generador interno; no mide rendimiento real |
| Werea-KVKK-Bench (generador externo) | 0.2617 | 0.1789 | 0.4875 | 240 filas, tipos mapeados; datos sintéticos de otro pipeline |
| Texto real (set inicial) | 0.7805 | 0.6809 | 0.9143 | 29 documentos / 35 entidades; 7 falsos positivos en 8 documentos trampa |

El autor advierte explícitamente que ningún resultado procede de texto turco con datos personales naturales a escala, y que la evaluación sobre texto real usa un conjunto pequeño (35 entidades). El recall alto (0,9143) con precisión más baja (0,6809) sobre texto real sugiere que el modelo tiende a sobre-detectar, lo cual es preferible a omitir PII en contextos de cumplimiento, pero exige revisión humana o filtros posteriores. No hay comparativas con otros modelos de PII en turco publicadas en la información disponible, aunque el autor mantiene un baseline con BERTurk y un "bake-off" con ModernBERT en repositorios separados.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~150M de parámetros en fp32, el modelo ocupa unos 0,6 GB; en inferencia se estima menos de 1 GB de VRAM, e incluso puede ejecutarse en CPU sin problema.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (incluso una GTX 1650 o una T4) es más que suficiente. Para lotes grandes, una T4 o A10G acelera el procesado masivo de documentos.
- Consumer GPUs: cabe con holgura en cualquier GPU de consumo actual; la inferencia en CPU es perfectamente viable para volúmenes bajos y medios.
- Opciones de despliegue: HuggingFace Transformers (pipeline token-classification, como muestra la model card), con compatibilidad endpoints_compatible. No se menciona soporte específico para vLLM, llama.cpp, Ollama o TGI; al ser un modelo encoder de transformers, el despliegue natural es mediante Transformers, Inference Endpoints de HuggingFace o servicios de inferencia para modelos encoder.
- Latencia y throughput: no disponibles; al tratarse de un encoder de 150M de parámetros, se esperan latencias de milisegundos por documento en GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| emi08/maske | ModernBERT (fine-tune PII) | ~150M | NER de PII en turco, 9 tipos / 19 etiquetas | Apache-2.0 | Foco KVKK; datos de entrenamiento sintéticos |
| ytu-ce-cosmos/modernbert-tr-base | ModernBERT base | ~150M | Modelo base preentrenado en turco (144B tokens) | Apache-2.0 | Modelo del que deriva maske; sin cabeza NER |
| emi08/maske-berturk-baseline | BERTurk (baseline del autor) | no disponible | Baseline NER PII en turco | no disponible | Publicado por el mismo autor como comparación |
| dbmdz/bert-base-turkish-cased (NER general) | BERT | ~110M | NER general turco (PER/LOC/ORG) | MIT | No cubre tipos PII específicos como TC_NO, IBAN o PLATE |

Maske se distingue de los NER turcos genéricos por cubrir tipos de PII específicos de KVKK (identidad, IBAN, matrícula, email) que los modelos NER estándar no etiquetan, a cambio de un entrenamiento basado íntegramente en datos sintéticos.

## Limitaciones y advertencias

- Datos de entrenamiento íntegramente sintéticos: el propio autor indica que el modelo debe evaluarse como un punto de partida fuerte, no como un problema resuelto; el rendimiento sobre texto turco natural a escala no está validado.
- Precisión baja sobre texto real (0,6809 frente a un recall de 0,9143): se esperan falsos positivos (7 en 8 documentos trampa del set inicial), incluidas confusiones con números de pedido de 11 dígitos, números de tarjeta, VKN y URLs, que no son PII pero el modelo puede marcar.
- Rendimiento muy pobre en el benchmark externo Werea-KVKK-Bench (F1 0,2617), lo que indica poca generalización a convenciones de formato de otros generadores de datos sintéticos.
- La detección de emails sufre detecciones parciales; la model card recomienda un postprocesado con expresión regular para recuperar las direcciones completas, incluido en el ejemplo de código.
- Solo soporta turco: no es utilizable en otros idiomas sin reentrenamiento.
- Sesgos: no documentados explícitamente, pero al derivar de datos sintéticos y WikiANN (etiquetas automáticas), hereda los sesgos de esos pipelines de anotación.
- Longitud de contexto no confirmada en la model card; verificar antes de procesar documentos largos.
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque el cumplimiento de KVKK en producción exige validación humana dada la naturaleza experimental del modelo.
- Proyecto en desarrollo activo: una actualización de entrenamiento para emails estaba en curso a fecha de octubre de 2026 y las métricas de texto real se actualizarán tras esa evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emi08/maske
- Repositorio GitHub del proyecto: https://github.com/emi0890/maske
- Baseline BERTurk del mismo autor: https://huggingface.co/emi08/maske-berturk-baseline
- Comparativa ModernBERT (bake-off): https://huggingface.co/emi08/maske-modernbert-tr-bakeoff
- Modelo base: https://huggingface.co/ytu-ce-cosmos/modernbert-tr-base
