# Interscript/heb-vocalized-int8static-1.1

## Resumen

`heb-vocalized-int8static-1.1` es un modelo especializado en diacritización (vocalización) del hebreo, desarrollado por Interscript dentro de la familia de capa fonológica Secryst. Su función es reconstruir los signos diacríticos (niqqud) que el hebreo escrito moderno omite habitualmente, una tarea crítica para síntesis de voz, aprendizaje de idiomas, recuperación léxica y desambiguación de lectura.

El modelo se distribuye como artefacto IMF de Secryst, cuantizado a int8 con esquema estático, y se carga a través de la API de Secryst (`Model.load("heb-vocalized-int8static-1.1")`). Los tags del repositorio indican una base arquitectónica ByT5 (transformer encoder-decoder sobre bytes), lo que evita depender de un tokenizador específico y encaja con tareas de transliteración y diacritización a nivel de carácter.

Es relevante porque cubre un nicho poco atendido: la vocalización hebrea de alta calidad con un artefacto compacto (0,95 GiB) y licencia permisiva BSD-3-Clause, lo que facilita su integración en pipelines de producción sin restricciones comerciales. No obstante, la información pública disponible es muy limitada: no se detallan parámetros, contexto ni composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (transformer encoder-decoder sobre bytes), según tags del repo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 estático (artefacto `int8static`) |
| Idiomas soportados | hebreo (he) |
| Licencia | BSD-3-Clause |
| Formato de pesos | artefacto ONNX dentro de ZIP Secryst IMF (`heb-vocalized-int8static-1.1-int8.zip`, 0,95 GiB) |

## Arquitectura y entrenamiento

La model card identifica el modelo como parte de la "capa fonológica" Secryst y los tags incluyen `byt5`, lo que apunta a una arquitectura ByT5: un transformer encoder-decoder que opera directamente sobre bytes UTF-8 en lugar de tokens subword. Esta elección es coherente con tareas de transliteración y diacritización, donde la alineación a nivel de carácter importa y los alfabetos no latinos se benefician de no depender de un vocabulario subword preentrenado.

El modelo se ha cuantizado a int8 con calibración estática y se empaqueta como artefacto IMF de Secryst, verificable por sha256 y con control de paridad según el contrato de distribución `interscript-ml`. El entrenamiento se realizó en el monorepo `secryst-train`. No se dispone de información pública sobre número de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

## Capacidades

- Diacritización de texto hebreo: inserción de signos niqqud sobre texto no vocalizado.
- Transliteración y procesamiento a nivel de carácter gracias a la base ByT5 sobre bytes.
- Procesamiento de texto hebreo sin tokenizador específico (operación byte a byte).
- Inferencia mediante decodificación greedy y beam search (beam de 4 evaluado).
- Carga e integración a través de la API de Secryst (`Model.load`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Síntesis de voz en hebreo (TTS): la diacritización previa es necesaria para una pronunciación correcta; el modelo inserta niqqud antes de pasar el texto al motor TTS, con un DER medido de 16,44 en greedy.
- Enseñanza del hebreo: generación de textos vocalizados para materiales didácticos y lectores principiantes, donde la omisión de niqqud impide la lectura correcta.
- Recuperación y búsqueda léxica: normalización de consultas y documentos vocalizando formas ambiguas para mejorar el matching en motores de búsqueda en hebreo.
- Desambiguación de lectura en pipelines de NLP: preprocesado de corpus hebreos para tareas posteriores (POS tagging, lematización) que se benefician de la información vocálica.
- Accesibilidad: conversión de texto hebreo a formato vocalizado para lectores con dificultades o para herramientas de lectura asistida.
- Procesamiento por lotes en servidor: el artefacto int8 estático de 0,95 GiB permite despliegue con requisitos de memoria moderados mediante ONNX Runtime, adecuado para servicios de vocalización a escala.

## Benchmarks y rendimiento

| Metrica | Valor | Procedencia |
|---|---|---|
| DER greedy | 16,44 | rababa/docs/RESULTS.md#hebrew-diacritization |
| DER beam4 | 16,43 | rababa/docs/RESULTS.md#hebrew-diacritization |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales; estos no aplican a un modelo especializado en diacritización. La métrica relevante es el Diacritic Error Rate (DER), evaluado sobre conjuntos completos sin ejemplos omitidos y con el evaluador propio del benchmark.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto pesa 0,95 GiB en int8; la huella en memoria en inferencia será del orden de 1-2 GiB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible; al ser un modelo pequeño en int8, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, aunque no hay datos oficiales.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del artefacto, pero no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) y la API de Secryst (`Model.load`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | DER hebreo |
|---|---|---|---|---|---|
| Interscript heb-vocalized-int8static-1.1 | ByT5 int8 (Secryst) | he | BSD-3-Clause | ONNX (IMF) | 16,44 (greedy) |
| Dicta Nakdan (no verificado en esta ficha) | no disponible | he | no disponible | no disponible | no disponible |
| Modelos de diacritización hebrea de Hugging Face (genéricos) | no disponible | he | variable | variable | no disponible |

No se dispone de datos verificados de modelos comparables en la información proporcionada; la comparativa anterior es meramente orientativa y no debe usarse como benchmark.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan parámetros, contexto, dataset ni proceso de entrenamiento, lo que dificulta evaluar su robustez fuera del benchmark declarado.
- Especialización estricta: el modelo solo cubre hebreo y diacritización; no es un modelo de propósito general.
- Riesgo de alucinación: en diacritización, los errores se manifiestan como vocales incorrectas (DER ~16,4), lo que puede alterar el significado en contextos ambiguos.
- Sin datos sobre sesgos: no se ha publicado análisis de sesgos ni de comportamiento en dominios específicos (texto rabínico, prensa, redes sociales).
- Licencia BSD-3-Clause: permisiva y apta para uso comercial, pero requiere mantener el aviso de copyright y la cláusula de no endorsamiento.
- Despliegue atado al ecosistema Secryst: el artefacto está empaquetado como IMF y verificado por sha256; usarlo fuera de Secryst requiere extraer el ONNX del ZIP.
- Sin garantías de mantenimiento: repositorio con 0 descargas y 0 likes, creado en 2026, lo que sugiere escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Interscript/heb-vocalized-int8static-1.1
- Sitio de Secryst: https://secryst.github.io
- Monorepo de entrenamiento: https://github.com/secryst/secryst-train
- Contrato de distribución: https://github.com/interscript/interscript-models
- Resultados de referencia: rababa/docs/RESULTS.md#hebrew-diacritization (ruta citada en la model card)
