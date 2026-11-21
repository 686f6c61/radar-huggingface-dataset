# Interscript/heb-vocalized-plane-3.0

## Resumen

`heb-vocalized-plane-3.0` es un modelo especializado en diacritización (vocalización con nikud) del hebreo, desarrollado por Interscript dentro de la familia de capas fonológicas Secryst. Su tarea es reconstruir las marcas vocálicas (nikud) que el hebreo escrito suele omitir, un paso necesario para síntesis de voz, búsqueda fonética o enseñanza del idioma. Se distribuye como artefacto ONNX cuantizado en int8 dinámico de 416 MB, cargable mediante la API de Secryst.

Técnicamente se apoya en un encoder ByT5-base con una cabeza de clasificación por carácter para las clases de nikud, y emplea una decodificación greedy de tipo mask-predict con K=3. Según la model card, alcanza un DER de 6,6078 sobre el protocolo crown (test Nakdimon, 1.864 filas verificadas manualmente), lo que supone una mejora de 1,57 puntos porcentuales frente al artefacto previo `heb-vocalized-plane-2.0` (8,18 DER).

Su relevancia radica en dos factores: por un lado, la mejora sustancial de calidad en una tarea con benchmarks establecidos; por otro, la incorporación de un currículo de entrenamiento (WO92) que combina preentrenamiento débil sobre 1,5 millones de unidades etiquetadas automáticamente con el corpus gold completo, seguido de un SFT fino sobre datos verificados. El modelo es de código y pesos abiertos bajo licencia BSD-3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ByT5-base con cabeza de clasificación por carácter (clases de nikud); decodificación mask-predict K=3 |
| Parametros totales | no disponible (ByT5-base como encoder de referencia) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámico (ONNX); referencia fp32 para control de paridad |
| Idiomas soportados | hebreo (he) |
| Licencia | BSD-3-Clause (código y pesos) |
| Formato de pesos | ONNX (artefacto `heb-vocalized-plane-3.0-int8-dynamic.zip`, 0,39 GiB); pesos originales no especificados |

## Arquitectura y entrenamiento

El modelo sigue la familia de artefactos "plane" de Secryst: un encoder ByT5-base que procesa el texto hebreo a nivel de bytes y una cabeza de clasificación por carácter que predice la clase de nikud correspondiente a cada posición. La decodificación es mask-predict greedy con K=3 iteraciones, orientada a inferencia fila a fila (single-row), y el artefacto final se exporta a ONNX con cuantización int8 dinámica, manteniendo una paridad de DER de +0,0549 pp frente a la referencia fp32 sobre 600 muestras (umbral de aceptación ≤ 0,25 pp según la ley de clasificación #459).

El entrenamiento siguió el currículo WO92 en dos etapas. La etapa 1 consistió en un preentrenamiento débil sobre 1.500.000 unidades deduplicadas del corpus `knesset_nikud_v6` (etiquetas automáticas de Dicta, solo como supervisión débil) combinadas con el corpus gold completo (50.303 ejemplos), durante una época. La etapa 2 aplicó SFT fino sobre el corpus gold con la receta crown exacta, partiendo del mejor checkpoint de la etapa 1. El corpus gold `hebrew-v4` es una ensambladura interna de Interscript (Nakdimon + Sefaria + destilado + expandido) con 50.433 filas de entrenamiento y 1.864 filas de test verificadas manualmente. El inventario de etiquetas se heredó byte a byte del run anterior (labels.sha `edd595d96d09`).

## Capacidades

- Diacritización de texto hebreo: inserción de nikud (puntos vocálicos) sobre texto sin vocalizar.
- Predicción a nivel de carácter con clases de nikud, adecuada para alineación exacta con el texto de entrada.
- Inferencia por fila (single-row) con decodificación mask-predict K=3, pensada para integración en pipelines de procesamiento por lotes.
- Ejecución vía ONNX runtime con cuantización int8 dinámica, sin dependencia de GPU para el artefacto distribuido.
- Carga mediante la API de Secryst (`Model.load("heb-vocalized-plane-3.0")`), compartiendo contrato de runtime con los artefactos "plane" del árabe.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido; es un modelo de tarea única.

## Casos de uso

- Síntesis de voz en hebreo: la diacritización previa permite a un TTS resolver ambigüedades vocálicas y generar pronunciaciones correctas en nombres propios y palabras poco frecuentes. El DER de 6,6 sobre el test Nakdimon marca el nivel de error esperable en esta etapa.
- Búsqueda fonética y recuperación de información: indexar textos hebreos con nikud reconstruido permite búsquedas que distingan formas homógrafas; el modelo procesa fila a fila y encaja en un pipeline de preprocesado por lotes.
- Enseñanza del hebreo: generación automática de textos vocalizados para materiales didácticos y ejercicios de lectura, con la ventaja de que el corpus gold incluye fuentes como Sefaria y Nakdimon.
- Normalización de corpus: enriquecer corpus históricos o periodísticos sin vocalizar con nikud consistente antes de tareas de NLP posteriores (etiquetado morfológico, lematización).
- Verificación de calidad editorial: comparar la vocalización automática con la de ediciones vocalizadas existentes para detectar discrepancias y errores de transcripción.
- Preprocesado para reconocimiento de voz: alinear transcripciones con pronunciación esperada en sistemas ASR de hebreo, donde el nikud reduce la ambigüedad léxica.
- Integración en aplicaciones de accesibilidad: lectura asistida de textos hebreos con vocalización automática para usuarios con dificultades lectoras.

## Benchmarks y rendimiento

| Benchmark | Metrica | heb-vocalized-plane-3.0 | heb-vocalized-plane-2.0 |
|---|---|---|---|
| Nakdimon test (1.864 filas, greedy K=3, seq2seq_der) | DER | 6,6078 | 8,18 |
| Paridad vs referencia fp32 ONNX (600 muestras) | Delta DER | +0,0549 pp | no disponible |

El protocolo crown emplea decodificación greedy single-row con K=3 y el evaluador propio del benchmark, sin ejemplos omitidos. La mejora de 1,57 pp frente al artefacto anterior es el resultado declarado del currículo WO92 en la línea "plane".

## Requisitos de hardware

- VRAM estimada: el artefacto int8 dinámico ocupa 416 MB (0,39 GiB); la inferencia en CPU es viable y no requiere GPU dedicada.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con ≥1 GB de VRAM libre es suficiente, incluyendo GTX 1650, RTX 3050 o superiores. El entrenamiento se realizó en HF Jobs a100-large, pero la inferencia no lo requiere.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna; también en CPU y en entornos edge.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); la carga vía `secryst.Model.load` es el canal previsto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DER (Nakdimon) | Licencia | Formato |
|---|---|---|---|---|---|
| heb-vocalized-plane-3.0 | no disponible (ByT5-base) | no disponible | 6,6078 | BSD-3-Clause | ONNX int8 |
| heb-vocalized-plane-2.0 | no disponible (ByT5-base) | no disponible | 8,18 | BSD-3-Clause | ONNX |
| Dicta / Nakdimon (referencia del benchmark) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el artefacto previo de la misma familia y con el baseline crown del protocolo (8,18 DER). No se dispone de datos de otros diacritizadores de hebreo para una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de tarea única: no es un LLM general; no responde a instrucciones, no genera texto libre ni soporta tool calling.
- Solo hebreo: no cubre otros idiomas ni variantes dialectales más allá del hebreo estándar.
- Sesgos de datos: el preentrenamiento débil usa etiquetas automáticas de Dicta sobre `knesset_nikud_v6`, lo que puede introducir sesgos de dominio parlamentario y errores sistemáticos del etiquetador automático.
- Dominio del corpus gold: la ensambladura `hebrew-v4` (Nakdimon, Sefaria, destilado) puede no representar hebreo coloquial, técnico o de otras épocas.
- Riesgo de error en nombres propios y neologismos: la diacritización de términos fuera del vocabulario de entrenamiento puede ser incorrecta; el DER de 6,6 implica que aproximadamente 1 de cada 15 caracteres vocálicos se predice mal en el test de referencia.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin endoso; no hay restricciones adicionales documentadas, pero conviene conservar el aviso de copyright y la cláusula de no endoso.
- El artefacto es int8 dinámico: la paridad medida (+0,0549 pp de DER) es aceptable según el criterio del autor, pero implica pequeñas fluctuaciones por carácter respecto a fp32.
- El repositorio de Hugging Face es un espejo del canal canónico (GitHub Releases); conviene verificar el sha256 `d6833fc79751ad39ee6a6a7d45632038997ec060955e46f77d39c1fdb848959a` antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Interscript/heb-vocalized-plane-3.0
- Secryst (proyecto): https://secryst.github.io
- Repositorio de entrenamiento: https://github.com/secryst/secryst-train
- Contrato de distribución: https://github.com/interscript/interscript-models
- Resultados de referencia: `interscript/interscript-models` `docs/RESULTS.md` (secciones run-094 y run-022)
- Corpus de preentrenamiento débil (Phonikud): `Phonikud/phonikud-data`, `knesset_nikud_v6` (MIT)
