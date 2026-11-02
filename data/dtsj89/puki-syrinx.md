# dtsj89/puki-syrinx

## Resumen

Puki Beak (publicado en HuggingFace como `dtsj89/puki-syrinx`) es un modelo pequeno de conversion grafema-fonema (grapheme-to-phoneme, G2P) especializado en hebreo. Lo desarrolla dtsj89 como componente del proyecto Puki, un juego gratuito bilingue hebreo/ingles para ninos pequenos. Su funcion es transformar texto hebreo plano en fonemas IPA que un sintetizador de voz (concretamente BlueTTS con la opcion `text_is_phonemes`) pueda pronunciar correctamente, incluyendo la distincion de genero del oyente (nino o nina) para ajustar la vocalizacion.

Tecnicamente es un transformer bidireccional muy compacto: 2,3 millones de parametros, 6 capas y anchura 192. Recibe como primer token el genero del oyente y despues procesa la linea caracter a caracter, prediciendo para cada letra hebrea tres salidas: consonante, vocal y acento (estres). El modelo se distribuye en formato ONNX cuantizado a int8 (2,5 MB) y esta pensado para inferencia en dispositivos de gama baja, como una tableta Samsung Galaxy Tab A7 Lite, donde procesa una linea de 40 letras en 17 ms con 4 hilos.

Su relevancia radica en que resuelve un problema muy concreto de la sintesis de voz en hebreo (la vocalizacion correcta y dependiente de contexto) con un modelo minusculo y desplegable en el borde, superando a un sistema previo (RenikudPlus) en precision sobre lineas revisadas manualmente. No es un modelo de lenguaje general: es una herramienta especializada de un solo proposito, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (6 capas, anchura 192) |
| Parametros totales | 2,3 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (solo pesos de MatMul) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`beak_int8.onnx`) + `vocab.json` |

## Arquitectura y entrenamiento

El modelo es un transformer bidireccional de 6 capas y anchura 192, con 2,3 millones de parametros. La entrada (`ids`) consiste en un token de genero seguido de un id por cada caracter de la linea; la salida son logits de consonante, vocal y acento (estres) por caracter. Las reglas de conversion de esas etiquetas a fonemas IPA son las mismas que emplea RenikudPlus. El vocabulario (`vocab.json`) recoge las consonantes, las vocales y que consonantes puede adoptar cada letra.

El entrenamiento se realizo en dos fases: primero con 600.000 frases de hebreo web etiquetadas por RenikudPlus (de Max Melichov, Yakov Kolani y Morris Alper, Apache 2.0), conservando sus probabilidades y cubriendo tanto genero masculino como femenino; despues con 3.530 lineas propias de Puki cuya pronunciacion fue revisada auditivamente. Los scripts de entrenamiento son `train/read_label.py` y `train/read_train.py` del repositorio de Puki. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Conversion grafema-fonema de texto hebreo plano a fonemas IPA.
- Prediccion por caracter de consonante, vocal y acento (estres).
- Condicionamiento por genero del oyente (nino o nina) mediante token inicial.
- Integracion con sintesis de voz (BlueTTS con `text_is_phonemes`).
- Inferencia en el borde: formato ONNX int8 de 2,5 MB.
- No soporta tool calling, agentes, vision, audio ni razonamiento general.
- Capacidad multilingue limitada al hebreo.

## Casos de uso

- Sintesis de voz en hebreo para aplicaciones infantiles: el modelo genera los fonemas IPA que BlueTTS pronuncia, ajustando la vocalizacion al genero del oyente, como en el juego Puki.
- Lectura asistida de texto hebreo sin vocalizar: convierte lineas planas en pronunciacion fonetica correcta antes de pasarlas a un TTS.
- Despliegue en dispositivos de gama baja: con 2,5 MB en int8 y 17 ms por linea de 40 letras en una Galaxy Tab A7 Lite, cabe en aplicaciones moviles o embebidas sin GPU.
- Preprocesado en pipelines de TTS: se puede insertar como etapa G2P previa a cualquier sintetizador que acepte fonemas.
- Herramientas de aprendizaje de hebreo: genera pronunciacion guiada para estudiantes, con distincion de genero.
- Normalizacion fonetica de corpus: util para etiquetar o revisar pronunciacion en conjuntos de texto hebreo de forma automatica y ligera.

## Benchmarks y rendimiento

Sobre 458 lineas revisadas no vistas en entrenamiento:

| Metrica | Beak | RenikudPlus |
|---|---|---|
| Palabras leidas segun revision | 99,1% | 92,3% |
| Lineas completas leidas segun revision | 96,3% | 69,4% |
| Palabras nunca vistas en entrenamiento | 93,7% | 92,9% |

Rendimiento en dispositivo: una linea de 40 letras en 17 ms (4 hilos) en una Samsung Galaxy Tab A7 Lite.

## Requisitos de hardware

- VRAM estimada: practicamente nula; el modelo int8 ocupa 2,5 MB y puede ejecutarse en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU y en dispositivos moviles.
- Cabe en cualquier GPU de consumo e incluso en hardware embebido.
- Opciones de despliegue: ONNX Runtime (formato nativo); el codigo de lectura esta en `Beak.kt` del repositorio de Puki.
- Latencia: 17 ms por linea de 40 letras en una Galaxy Tab A7 Lite con 4 hilos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Precision (lineas) |
|---|---|---|---|---|---|
| Puki Beak | 2,3 M | G2P hebreo | no disponible | Apache 2.0 | 96,3% |
| RenikudPlus | no disponible | Vocalizacion/G2P hebreo | no disponible | Apache 2.0 | 69,4% |

No se dispone de datos de otros modelos G2P comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo; no procesa otros idiomas.
- No es un modelo de lenguaje general: no genera texto libre, codigo ni razonamiento.
- Depende de las reglas de conversion a IPA de RenikudPlus para producir fonemas finales.
- Riesgo de error en palabras fuera de dominio: 93,7% de acierto en palabras nunca vistas frente a 99,1% en palabras conocidas.
- La calidad esta condicionada por la revision auditiva de solo 3.530 lineas propias.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento (hebreo web etiquetado por RenikudPlus).
- No se documentan sesgos especificos ni evaluaciones de robustez mas alla de las lineas revisadas.

## Enlaces

- HuggingFace: https://huggingface.co/dtsj89/puki-syrinx
- Repositorio Puki: https://github.com/TomSadeh/puki
- BlueTTS: https://github.com/maxmelichov/BlueTTS
- RenikudPlus: https://huggingface.co/notmax123/RenikudPlus
