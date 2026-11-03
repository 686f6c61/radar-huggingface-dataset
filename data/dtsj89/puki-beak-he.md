# dtsj89/puki-beak-he

## Resumen

Puki Beak es un modelo compacto de conversión de grafemas a fonemas (grapheme-to-phoneme o G2P) especializado en hebreo, desarrollado por el usuario dtsj89 como componente del proyecto Puki, un juego gratuito bilingüe hebreo/inglés para niños pequeños. El modelo transforma texto hebreo sin vocales en una representación fonética intermedia (consonante, vocal y acento por cada letra) que posteriormente se convierte en fonemas IPA, de modo que el motor de síntesis de voz BlueTTS pueda pronunciar cada palabra correctamente.

La arquitectura es un transformer bidireccional muy pequeño, de solo 2,3 millones de parámetros, con 6 capas y una anchura de 192. Recibe el género del niño como primer token y procesa la línea letra a letra, devolviendo logits de consonante, vocal y acento para cada carácter. Se distribuye en formato ONNX cuantizado a int8 (2,5 MB), lo que lo hace apto para inferencia en dispositivos móviles de gama baja.

Su relevancia radica en la combinación de tamaño mínimo, latencia muy baja (17 ms para una línea de 40 letras en una tablet Samsung Galaxy Tab A7 Lite con 4 hilos) y una precisión reportada superior a la del etiquetador RenikudPlus del que deriva sus datos de entrenamiento, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (6 capas, anchura 192) |
| Parámetros totales | 2,3 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una línea de texto; se reportan líneas de 40 letras) |
| Tipos de cuantización | int8 dinámica (solo pesos MatMul) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`beak_int8.onnx`) + `vocab.json` |

## Arquitectura y entrenamiento

El modelo es un transformer bidireccional de 6 capas y anchura 192 (2,3 M de parámetros) que recibe como entrada el token de género del niño seguido de un id por carácter, y emite tres cabezas de clasificación por carácter: consonante, vocal y acento. La salida se interpreta con las mismas reglas que usa RenikudPlus para derivar fonemas IPA. El vocabulario (`vocab.json`) incluye las consonantes, las vocales y la lista de consonantes admisibles por letra.

El entrenamiento se realizó en dos fases: primero con 600.000 frases de hebreo web etiquetadas por RenikudPlus (de Max Melichov, Yakov Kolani y Morris Alper, Apache 2.0), usando sus probabilidades y cubriendo tanto voces masculinas como femeninas; después con 3.530 líneas propias de Puki cuya pronunciación fue revisada a oído. El modelo se exportó a ONNX con cuantización int8 dinámica aplicada únicamente a los pesos de las operaciones MatMul, resultando en un artefacto de 2,5 MB.

## Capacidades

- Conversión de texto hebreo sin vocales a representación fonética (consonante, vocal y acento por letra).
- Generación implícita de fonemas IPA mediante las reglas de RenikudPlus.
- Condicionamiento por género del oyente (niño o niña) a través del token inicial.
- Clasificación a nivel de carácter (token-classification) con tres salidas simultáneas.
- Inferencia en dispositivos móviles de gama baja gracias a su tamaño reducido y cuantización int8.
- Integración con motores TTS que acepten fonemas (por ejemplo, BlueTTS con `text_is_phonemes`).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Síntesis de voz para aplicaciones infantiles: el modelo convierte cada línea de texto hebreo en fonemas que un TTS como BlueTTS pronuncia correctamente, con la ventaja de que el género del niño se incorpora como primer token para ajustar la voz.
- Lectura asistida en hebreo: aplicaciones de aprendizaje de lectura pueden usar la salida por letra (consonante, vocal, acento) para resaltar la pronunciación de cada carácter en pantalla.
- Corrección de pronunciación en asistentes de voz: al generar fonemas IPA en lugar de depender de la fonética implícita del TTS, se reducen errores en palabras homógrafas del hebreo sin vocales.
- Despliegue en tablets y móviles de gama baja: con 2,5 MB en int8 y 17 ms por línea de 40 letras en una Galaxy Tab A7 Lite, es viable en aplicaciones offline sin GPU.
- Preprocesado en pipelines de TTS multilingües: se puede encadenar como etapa G2P específica para hebreo antes de un motor de síntesis que no domine ese idioma.
- Etiquetado fonético de corpus hebreos: útil para anotar datasets de voz o texto con representación consonante-vocal-acento a bajo coste computacional.
- Prototipado de herramientas educativas bilingües: al formar parte de Puki (hebreo/inglés), sirve como referencia para integrar G2P en juegos y apps de aprendizaje de idiomas.

## Benchmarks y rendimiento

Evaluación sobre 458 líneas revisadas no vistas en entrenamiento:

| Métrica | Beak | RenikudPlus |
|---|---|---|
| Palabras leídas según revisión | 99,1 % | 92,3 % |
| Líneas completas leídas según revisión | 96,3 % | 69,4 % |
| Palabras nunca vistas en entrenamiento | 93,7 % | 92,9 % |

Rendimiento en dispositivo: 17 ms por línea de 40 letras en una Samsung Galaxy Tab A7 Lite con 4 hilos; tamaño de 2,5 MB en int8.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en int8; el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU (RTX 4090, A100, H100) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer, incluida la gama integrada, y en dispositivos móviles Android.
- Opciones de despliegue: ONNX Runtime (formato nativo), con integración en aplicaciones Kotlin/Android mediante `Beak.kt` del repositorio de Puki; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 17 ms por línea de 40 letras en Galaxy Tab A7 Lite con 4 hilos (dato reportado por el autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Puki Beak | 2,3 M | no disponible (línea de texto) | G2P hebreo | Apache 2.0 | ONNX en HuggingFace |
| RenikudPlus | no disponible | no disponible | Diacritización/lectura hebrea | Apache 2.0 | HuggingFace |
| BlueTTS | no disponible | no disponible | TTS (consume fonemas) | no disponible | GitHub |

RenikudPlus es el modelo del que se derivan las etiquetas de entrenamiento y el principal punto de comparación en precisión (99,1 % frente a 92,3 % en palabras). BlueTTS no es un G2P sino el motor de síntesis que consume la salida de Beak. No se dispone de datos de otros modelos G2P de hebreo en la información proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo; no soporta otros idiomas.
- Entrenado con etiquetas automáticas de RenikudPlus más un conjunto pequeño revisado a oído (3.530 líneas), por lo que puede heredar sesgos y errores del etiquetador original.
- El rendimiento en palabras nunca vistas (93,7 %) es inferior al de palabras vistas, lo que implica mayor riesgo de error en vocabulario poco frecuente o nombres propios.
- Requiere el token de género como primera entrada; su uso fuera de ese esquema puede degradar la salida.
- No es un modelo generativo de texto ni un LLM: no razona, no responde preguntas ni soporta tool calling.
- La cuantización int8 dinámica aplicada solo a pesos MatMul puede introducir pequeñas diferencias frente al modelo en precisión completa; no se documentan métricas de esa comparación.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento derivados de RenikudPlus.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dtsj89/puki-beak-he
- Proyecto Puki (repositorio): https://github.com/TomSadeh/puki
- BlueTTS: https://github.com/maxmelichov/BlueTTS
- RenikudPlus: https://huggingface.co/notmax123/RenikudPlus
