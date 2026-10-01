# guerrerotook/CIMA-BERTIN-4.8-NER-ADR-CONLL-SYNTH

## Resumen

CIMA-BERTIN-4.8-NER-ADR-CONLL-SYNTH es un modelo de clasificación de tokens (token classification) especializado en el reconocimiento de entidades nombradas (NER) sobre textos biomédicos en español, con foco en reacciones adversas a medicamentos (RAM). Lo desarrolla Luis Miguel Guerrero Guirado (usuario `guerrerotook`) en el marco de su Proyecto Fin de Grado en la UNED. El modelo identifica cuatro tipos de entidad: reacción adversa (`REACT`), principio activo (`ACTIVE`), frecuencia de aparición (`FREQ`) y sistema u órgano afectado (`SYS`).

Tecnicamente es un transformer encoder de la familia RoBERTa con 124.065.033 parámetros (aproximadamente 124 M), heredado de la cadena BERTIN (Barcelona Supercomputing Center) y adaptado al dominio CIMA mediante masked language modeling antes de recibir el fine-tuning supervisado de NER. El etiquetado sigue el esquema IOB2 con nueve etiquetas. Está pensado para extraer información estructurada de fichas técnicas y textos farmacológicos en español.

Su relevancia actual radica en que aborda una tarea con escasez de datos anotados en español (extracción de RAM) mediante un corpus sintético, y publica métricas de entidad muy altas (F1 estricto de 0,9660). No obstante, el propio autor advierte que esas cifras miden el ajuste al régimen sintético y no una transferencia demostrada a fichas técnicas reales, por lo que debe tratarse como un componente experimental y no como un sistema validado clínicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (BERTIN adaptado al dominio CIMA) |
| Parametros totales | 124.065.033 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (arquitectura RoBERTa, valor habitual 512 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precision completa) |
| Idiomas soportados | español (`es`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder RoBERTa de 124 M de parámetros. La cadena de entrenamiento parte de BERTIN (modelo RoBERTa preentrenado para español por el BSC), que se adapta al dominio biomédico/farmacologico mediante masked language modeling dando lugar a `guerrerotook/CIMA-BERTIN-4.8`. Sobre esa base se aplica un fine-tuning de reconocimiento de entidades con el corpus sintético `guerrerotook/CIMA-4.8-ADR-NER-EXTENDED`, usando etiquetado IOB2 con nueve etiquetas cuyo orden (`O`, `B-REACT`, `I-REACT`, `B-ACTIVE`, `I-ACTIVE`, `B-FREQ`, `I-FREQ`, `B-SYS`, `I-SYS`) está fijado en `config.json`.

El fine-tuning supervisado empleó 70 textos sintéticos correspondientes a 35 medicamentos de origen, y la evaluación se hizo sobre 28 textos de 14 medicamentos no vistos durante el entrenamiento supervisado. Las variantes de un mismo medicamento se mantienen en una única partición para evitar fuga de información entre entrenamiento y prueba. El corpus es sintético y su validación comprueba que las superficies anotadas aparecen literalmente en el texto, pero no garantiza una anotación clínica exhaustiva. No se documenta en la información disponible el uso de RLHF ni DPO (no aplica a un modelo encoder de NER).

## Capacidades

- Reconocimiento de entidades nombradas en español biomédico con cuatro tipos: `REACT` (reacción adversa), `ACTIVE` (principio activo), `FREQ` (frecuencia) y `SYS` (sistema u órgano afectado).
- Etiquetado a nivel de token con esquema IOB2 y nueve etiquetas de salida.
- Extracción de entidades agregadas mediante la estrategia `aggregation_strategy="simple"` del pipeline de transformers.
- Uso directo con la interfaz `pipeline("token-classification", ...)` de HuggingFace.
- Compatibilidad con `endpoints_compatible`, lo que permite desplegarlo como endpoint gestionado.
- Capacidad multilingue: limitada a español (`es`).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento (es un encoder de clasificación, no un modelo generativo).

## Casos de uso

- Extraccion estructurada de fichas tecnicas: el modelo recorre el texto de una ficha y devuelve tripletas principio activo–reacción adversa–frecuencia, utiles para poblar bases de datos farmacologicas a partir de documentos en español.
- Farmacovigilancia asistida: procesar informes de sospecha de RAM en español para detectar de forma automatica el fármaco implicado, la reacción y el órgano afectado, reduciendo la revision manual previa a la validacion por un especialista.
- Indexacion y busqueda semantica en corpus biomedicos: enriquecer documentos con anotaciones `REACT`/`ACTIVE`/`SYS` para permitir consultas del tipo "reacciones cardiovasculares asociadas a un principio activo concreto".
- Preanotacion para anotacion humana: usar el modelo como primer paso de un flujo de anotacion, dejando que los revisores corrijan sobre las etiquetas ya generadas en lugar de etiquetar desde cero.
- Normalizacion de terminologia en historiales o notas clinicas en español: detectar menciones de reacciones y principios activos para mapearlas a codigos de vocabularios controlados.
- Investigacion academica en PLN clinico en español: servir de punto de partida (baseline) para experimentos de NER biomédico donde escasean corpus anotados.
- Extraccion de relaciones como paso previo: al producir etiquetas IOB2 alineadas con los tokens, facilita la construccion de modulos posteriores de relation extraction (por ejemplo, asociar `ACTIVE` con `REACT` y `FREQ`).

## Benchmarks y rendimiento

Evaluacion sobre el test sintético descrito en la model card: 28 textos de 14 medicamentos no vistos durante el entrenamiento supervisado, 1.577 oraciones, 26.213 tokens y 3.366 entidades de referencia. Metricas calculadas a nivel de entidad.

| Criterio | Precision | Recall | F1 |
|---|---:|---:|---:|
| Strict / seqeval | 0,9542 | 0,9780 | 0,9660 |
| Partial | 0,9638 | 0,9878 | 0,9756 |
| Ent-type | 0,9725 | 0,9967 | 0,9844 |

Advertencia del autor: el split `test` se uso tambien para parada temprana y seleccion del mejor checkpoint, por lo que estas cifras no constituyen una estimacion sobre un holdout independiente. No se han publicado en la informacion disponible resultados sobre benchmarks estandar (MMLU, HumanEval, GSM8K u otros); estos no aplican a un modelo de NER.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 los pesos ocupan aproximadamente 496 MB; en FP16, alrededor de 248 MB; en INT8, unos 124 MB. Añadiendo activaciones y overhead, cabe holgadamente por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA RTX 4090, A100 o H100 lo ejecutan con margen amplio, pero tambien es viable en GPU de gama baja (por ejemplo, GTX 1650, RTX 3050) e incluso en integradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer actual por su tamaño (~124 M de parametros).
- Inferencia en CPU: viable para lotes pequeños o servicios de baja concurrencia, dado el reducido numero de parametros.
- Opciones de despliegue: `transformers` (pipeline de token-classification), exportacion a ONNX Runtime, TorchScript o formato `endpoints_compatible`. No se documentan pesos GGUF, por lo que el despliegue con llama.cpp/Ollama no esta contemplado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparables publicados en la informacion proporcionada para otros modelos de la misma tarea. La comparacion siguiente es cualitativa y se limita a parametros y disponibilidad cuando no hay datos verificables.

| Modelo | Parametros | Idioma | Tarea | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| CIMA-BERTIN-4.8-NER-ADR-CONLL-SYNTH | 124.065.033 | Espanol | NER biomedico (RAM) | cc-by-4.0 | F1 estricto 0,9660 (test sintetico) |
| BERTIN (base) | ~110-125 M | Espanol | Modelo de lenguaje / base para fine-tuning | Apache-2.0 (segun distribucion del BSC) | no disponible |
| mBERT (bert-base-multilingual-cased) | 178 M | Multilingue | Base para NER multilingue | Apache-2.0 | no disponible |
| XLM-RoBERTa base | 278 M | Multilingue | Base para NER multilingue | MIT | no disponible |

Los modelos de la familia BERTIN, mBERT y XLM-R son modelos base generalistas; para compararlos en NER de RAM habria que aplicarles un fine-tuning equivalente, cuyo resultado no esta disponible en la informacion proporcionada. No se identifican en las fuentes otros modelos publicos especificos de NER de reacciones adversas en espanol con los que comparar directamente.

## Limitaciones y advertencias

- Dominio sintetico: los resultados miden el ajuste al regimen sintetico generado y no demuestran transferencia a fichas tecnicas reales.
- No validado clinicamente: el propio autor indica que el modelo no se ha validado para decisiones clinicas y no debe usarse como herramienta de diagnostico o decision medica.
- Fuga de datos potencial en la evaluacion: el split `test` se uso para parada temprana y seleccion de checkpoint, por lo que las metricas no son un holdout independiente y probablemente esten optimistas.
- Tamaño del conjunto de datos muy reducido: 70 textos de entrenamiento y 28 de evaluacion, con 35 y 14 medicamentos respectivamente, lo que limita la generalizacion.
- Cobertura de entidades acotada: solo reconoce cuatro tipos (`REACT`, `ACTIVE`, `FREQ`, `SYS`); cualquier otra entidad biomedica (dosis, via de administracion, poblacion) queda fuera.
- Monolingue: unicamente espanol; no soporta otros idiomas.
- Riesgo de alucinacion de entidades: al ser un modelo de clasificacion por token, no "inventa" texto, pero puede etiquetar incorrectamente tokens como entidades fuera del dominio sintetico con el que se entreno.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero al no existir validacion clinica su uso en produccion sanitaria requiere supervision experta obligatoria.
- Advertencia sobre el corpus: la validacion del corpus sintetico comprueba coincidencia de superficies en el texto, pero no garantiza exhaustividad de la anotacion.
- Modelo con 0 descargas y 0 likes en el momento de redactar la ficha, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guerrerotook/CIMA-BERTIN-4.8-NER-ADR-CONLL-SYNTH
- Dataset de entrenamiento/evaluacion: https://huggingface.co/datasets/guerrerotook/CIMA-4.8-ADR-NER-EXTENDED
- Modelo base intermedio (adaptacion de dominio): https://huggingface.co/guerrerotook/CIMA-BERTIN-4.8
- Perfil del autor en HuggingFace: https://huggingface.co/guerrerotook
- Cita academica: Guerrero Guirado, Luis Miguel. "Aplicacion de modelos de Inteligencia Artificial para la identificacion y catalogacion de reacciones adversas de medicamentos". Proyecto Fin de Grado, Universidad Nacional de Educacion a Distancia (UNED), 2026.
