# RaphGonz/nunda-a0

## Resumen

Nunda A0 es un adaptador LoRA de rango 16 entrenado sobre el modelo base SmolLM2-360M de Hugging Face, desarrollado por RaphGonz como línea base del proyecto Nunda. No es un modelo generativo de texto libre: su función es responder citando proposiciones concretas de un expediente o caso, emitiendo secuencias de acciones estructuradas (por ejemplo `P:7 ET P:12 FIN`, `ABSTENTION` o `CONFLIT … FIN_CONFLIT`) que se decodifican bajo una máscara gramatical. El modelo incorpora cabezas adicionales (lexicón, punteros y selección) y nuevos vectores de token sobre el modelo base, de modo que los pesos publicados no son autosuficientes: requieren el código del repositorio del proyecto para cargarse y ejecutarse.

El problema que aborda es la atribución verificable en tareas de recuperación aumentada: en lugar de redactar una respuesta, el modelo apunta a las proposiciones del contexto que la sustentan, lo que facilita la auditoría y reduce el riesgo de afirmaciones no respaldadas. Las entradas se anonimizan previamente (los nombres se sustituyen por ranuras como `⟨PER 3⟩`, mientras que números y fechas se conservan), y las relaciones entre proposiciones se inyectan como cabecera textual `[REL]`.

Es relevante ahora como pieza de investigación reproducible en un ecosistema de modelos pequeños y especializados: con solo 14,8 millones de parámetros entrenables, un único RTX 3090 y datos mayoritariamente sintéticos y de dominio público, ofrece una alternativa interpretable a los pipelines de generación con citas. Está pensado como base de comparación frente a las variantes `nunda-a1` (atención relacional) y `nunda-b-s` (preentrenado desde cero sobre texto anonimizado).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M) con adaptador LoRA rango 16, cabezas adicionales (lexicón, punteros, selección) y nuevos vectores de token |
| Parámetros totales | 14.804.481 (pesos entrenados publicados; el modelo base SmolLM2-360M se carga aparte) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | entradas de hasta 2.500 tokens en el conjunto sintético de evaluación; límite máximo no especificado |
| Tipos de cuantización | no disponible |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (model.safetensors, solo pesos entrenados: LoRA, cabezas y vectores nuevos) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M, un transformer decoder-only, y le superpone un adaptador LoRA de rango 16 junto con cabezas específicas de tarea: una cabeza de lexicón, una de punteros (pointer network) y una de selección. Las relaciones entre proposiciones del expediente se proporcionan como cabecera de texto `[REL]`, y la salida se restringe mediante una máscara gramatical que solo permite acciones válidas del formato de citación. Esta combinación convierte al modelo en un selector estructurado de proposiciones en lugar de un generador de lenguaje natural.

El entrenamiento se realizó durante 2 épocas, con 18.124 pasos de 16 contextos, en una única RTX 3090. La mezcla de datos fue: expedientes sintéticos (40 %), HotpotQA (20 %), PIAF (15 %), preguntas sobre derecho francés generadas por Qwen2.5-7B-Instruct a partir de LEGI (15 %), FinQA (5 %) y SQuAD 2.0 (5 %). No se documenta en la información disponible el uso de RLHF o DPO; el entrenamiento se limita a la adaptación supervisada sobre el modelo base.

## Capacidades

- Citación estructurada de proposiciones de un expediente mediante secuencias de acciones (`P:7 ET P:12 FIN`).
- Abstención explícita cuando el contexto no permite responder (`ABSTENTION`).
- Detección y marcado de conflictos entre proposiciones (`CONFLIT … FIN_CONFLIT`).
- Decodificación restringida por gramática, lo que evita la generación de texto libre y limita la salida a acciones válidas.
- Manejo de entradas anonimizadas con ranuras para entidades (`⟨PER 3⟩`) y conservación de números y fechas.
- Procesamiento de relaciones entre proposiciones mediante cabecera textual `[REL]`.
- Capacidad multilingüe limitada a francés e inglés.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso libre, visión ni audio.

## Casos de uso

- Auditoría documental en entornos legales: dado un expediente con proposiciones numeradas, el modelo devuelve qué proposiciones sustentan una consulta, lo que permite revisar la trazabilidad de cada afirmación sin depender de texto generado.
- Preguntas sobre normativa francesa: entrenado con preguntas generadas a partir de LEGI, puede citar artículos y disposiciones concretas en lugar de parafrasearlos, lo que encaja en asistentes internos de cumplimiento normativo.
- Verificación de respuestas en pipelines RAG: actúa como componente de atribución que, tras la recuperación, selecciona las proposiciones relevantes y señala conflictos entre fuentes, con abstención cuando la evidencia es insuficiente.
- Análisis financiero sobre informes: con FinQA en el conjunto de entrenamiento, puede apuntar a las proposiciones numéricas de un informe que respaldan una cifra o una comparación.
- Control de calidad de conjuntos de datos: la abstención calibrada (0,978 en el conjunto sintético) permite filtrar ejemplos sin evidencia suficiente en tareas de anotación y curación.
- Investigación en atribución y pointer networks: al ser una línea base reproducible con código y datos públicos, sirve para experimentar con variantes de atención relacional o preentrenamiento desde cero (comparables con `nunda-a1` y `nunda-b-s`).
- Moderación de respuestas en asistentes conversacionales: integrado como verificador posterior, puede marcar respuestas que no se apoyan en ninguna proposición del contexto recuperado.

## Benchmarks y rendimiento

Resultados en validación según la model card:

| Modelo | F1 nivel 0 sintético | Abstención | F1 HotpotQA (con distractores) | Abstenciones erróneas (HotpotQA) |
|---|---|---|---|---|
| **A0** | 0,864 | 0,978 | 0,676 | 14,6 % |
| A1 | 0,872 | 0,989 | 0,748 | 4,3 % |
| B-S | 0,845 | 0,950 | 0,769 | 2,4 % |

La evaluación se realizó sobre 827 ejemplos sintéticos (entradas de hasta 2.500 tokens) y 999 ejemplos de HotpotQA. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de lenguaje.

## Requisitos de hardware

- El adaptador y las cabezas publicadas ocupan aproximadamente 0,1 GB; el modelo base SmolLM2-360M debe descargarse por separado.
- El entrenamiento se realizó en una única RTX 3090, lo que indica que el ajuste cabe en una GPU de consumo de gama alta.
- Para inferencia, el modelo base de 360 millones de parámetros en precisión completa requiere del orden de 1,5 GB de VRAM, y menos de 1 GB en cuantizaciones de 8 o 4 bits; estas cifras son estimaciones a partir del tamaño del modelo base, no datos publicados.
- Cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores; también es viable en CPU para volúmenes moderados.
- El despliegue requiere el código del repositorio del proyecto (`RaphGonz/Nunda`) para cargar las cabezas y aplicar la máscara gramatical; no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- No se dispone de datos publicados de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 HotpotQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nunda A0 | 14,8 M entrenables sobre SmolLM2-360M | entradas de hasta 2.500 tokens en evaluación | 0,676 | CC BY-SA 4.0 | Hugging Face y GitHub |
| Nunda A1 | no disponible | no disponible | 0,748 | no disponible | mismo proyecto |
| Nunda B-S | no disponible (preentrenado desde cero) | no disponible | 0,769 | no disponible | mismo proyecto |

Las alternativas más directas son las otras variantes del mismo proyecto, que superan a A0 en F1 sobre HotpotQA y reducen drásticamente las abstenciones erróneas (4,3 % y 2,4 % frente a 14,6 %). No se dispone de información sobre modelos externos comparables de citación estructurada con los que establecer una comparación directa.

## Limitaciones y advertencias

- El modelo no genera texto libre: cualquier uso que requiera respuestas redactadas necesita un componente adicional.
- Los pesos publicados no son autosuficientes; sin el código del proyecto no pueden cargarse ni ejecutarse correctamente.
- Tasa elevada de abstenciones erróneas en HotpotQA (14,6 %), muy superior a la de las variantes A1 y B-S, lo que puede provocar que el modelo se niegue a responder cuando sí hay evidencia.
- Rendimiento inferior a las variantes posteriores del mismo proyecto en el conjunto con distractores.
- Cobertura lingüística limitada a francés e inglés; no se documenta soporte de castellano.
- Sesgos potenciales derivados de los conjuntos de entrenamiento (HotpotQA, SQuAD 2.0, PIAF, FinQA, LEGI) y de las preguntas sintéticas generadas por Qwen2.5-7B-Instruct, no analizados en la información disponible.
- La licencia CC BY-SA 4.0 obliga a compartir las obras derivadas bajo la misma licencia y a atribuir las fuentes (HotpotQA, SQuAD 2.0, PIAF, FinQA, LEGI); conviene revisar la compatibilidad antes de un uso comercial propietario.
- El modelo base SmolLM2-360M tiene licencia Apache 2.0, distinta de la del adaptador.
- Sin datos publicados de cuantización, latencia ni throughput, la planificación de producción requiere mediciones propias.
- Es una línea base de investigación con cero descargas y cero valoraciones en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RaphGonz/nunda-a0
- Código del proyecto: https://github.com/RaphGonz/Nunda
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- HotpotQA (Yang et al., 2018): no disponible en la información proporcionada
- SQuAD 2.0 (Rajpurkar et al., 2018): no disponible en la información proporcionada
- PIAF (Etalab, 2020): no disponible en la información proporcionada
- FinQA (Chen et al., 2021): no disponible en la información proporcionada
- LEGI (DILA, Licence Ouverte 2.0): no disponible en la información proporcionada
