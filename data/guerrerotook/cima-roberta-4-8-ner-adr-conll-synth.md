# guerrerotook/CIMA-RoBERTa-4.8-NER-ADR-CONLL-SYNTH

## Resumen

CIMA-RoBERTa-4.8-NER-ADR-CONLL-SYNTH es un modelo de clasificación de tokens (NER) en español especializado en la extracción de entidades vinculadas a reacciones adversas a medicamentos. Lo desarrolla Luis Miguel Guerrero Guirado (usuario `guerrerotook`) como parte de su proyecto fin de grado en la UNED, y se distribuye en HuggingFace bajo licencia CC-BY-4.0. El modelo deriva de un RoBERTa biomédico en español adaptado mediante masked language modeling sobre fichas técnicas de medicamentos de la base CIMA (sección 4.8, dedicada a reacciones adversas), y después recibe un fine-tuning supervisado de NER.

Se trata de un encoder de la familia RoBERTa con 125.397.513 parámetros totales (tamaño base, ~125 M) y arquitectura transformer bidireccional, por lo que no es un modelo generativo: su salida es una etiqueta IOB2 por token. Reconoce cuatro tipos de entidad: `REACT` (reacción adversa), `ACTIVE` (principio activo), `FREQ` (frecuencia de aparición) y `SYS` (sistema u órgano afectado), con nueve etiquetas en total.

Su relevancia actual es doble. Por un lado, cubre un nicho muy concreto y poco servido: la farmacovigilancia en castellano sobre textos regulatorios, donde la mayoría de recursos NER biomédicos están en inglés. Por otro, y esto es importante para su evaluación, el modelo se entrena y se mide sobre un corpus sintético generado por el autor, no sobre fichas técnicas reales; los resultados publicados miden el ajuste al régimen sintético, no la transferencia a texto regulatorio auténtico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (bidireccional, solo encoder) |
| Parametros totales | 125.397.513 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada por el autor) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors sin cuantizar |
| Idiomas soportados | Espanol (es) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales: pipeline `token-classification`, tamano del repositorio 0,5 GB, compatible con endpoints de HuggingFace (`endpoints_compatible`), modelo base `guerrerotook/CIMA-RoBERTa-4.8`, relación `finetune`, dataset de entrenamiento `guerrerotook/CIMA-4.8-ADR-NER-EXTENDED`, esquema de anotación IOB2 y métricas declaradas precision, recall y F1.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo RoBERTa, sin componentes de decodificación, atención lineal, SSM ni mezcla de expertos. Sobre la cabeza de clasificación de tokens se aplica un esquema IOB2 con nueve etiquetas, cuyo orden está fijado en `config.json`: `O`, `B-REACT`, `I-REACT`, `B-ACTIVE`, `I-ACTIVE`, `B-FREQ`, `I-FREQ`, `B-SYS`, `I-SYS`. El entrenamiento tiene tres etapas encadenadas: partida desde un RoBERTa biomédico en español, adaptación de dominio mediante masked language modeling sobre fichas técnicas de CIMA, y fine-tuning supervisado de NER con el corpus sintético `CIMA-4.8-ADR-NER-EXTENDED`.

Los datos de fine-tuning son íntegramente sintéticos: 70 textos correspondientes a 35 medicamentos de origen para entrenamiento y 28 textos de 14 medicamentos para evaluación, agrupando las variantes de un mismo fármaco en una única partición para evitar fuga de información. El corpus de test contiene 1.577 oraciones, 26.213 tokens y 3.366 entidades de referencia. La model card no menciona uso de RLHF ni DPO, algo esperable en un modelo discriminativo de este tipo, ni detalla el número total de tokens empleados en la fase de MLM. Tampoco se declaran innovaciones de inferencia como decodificación especulativa o cuantización de la atención.

## Capacidades

- Extracción de entidades nombradas en español biomédico y farmacéutico, con etiquetado a nivel de token.
- Identificación de reacciones adversas (`REACT`), principio activo (`ACTIVE`), frecuencia (`FREQ`) y sistema u órgano afectado (`SYS`).
- Reconocimiento de entidades multi-token, con etiquetas `B-` e `I-` para cada uno de los cuatro tipos.
- Salida compatible con `seqeval` y agregación de entidades mediante `pipeline` de transformers con `aggregation_strategy="simple"`.
- Integración en flujos de HuggingFace: etiqueta `endpoints_compatible`, por lo que puede exponerse como endpoint gestionado.
- Capacidades multilingües: no disponibles; el modelo declara únicamente español.
- Soporte de tool calling, function calling y agentes multi-paso: no aplicable, es un modelo encoder de clasificación y no genera texto ni llamadas a herramientas.
- Modo thinking, visión o audio: no disponible / no soportado.

## Casos de uso

- Farmacovigilancia automatizada sobre documentación regulatoria: el modelo permite recorrer fichas técnicas y secciones 4.8 en castellano y extraer sistemáticamente el par reacción adversa / principio activo, que es la unidad mínima que necesita un sistema de notificación.
- Construcción de bases de datos de reacciones adversas: dado un corpus de prospectos, la salida IOB2 puede postprocesarse para poblar tablas estructuradas con reacción, fármaco, frecuencia declarada y órgano afectado.
- Preprocesado para pipelines de PLN clínico: el etiquetado `ACTIVE`, `FREQ` y `SYS` sirve como paso previo de anonimización selectiva, normalización terminológica o indexación semántica en un buscador documental.
- Enriquecimiento de corpus para entrenar otros modelos: al ser ligero (125 M de parámetros), se puede ejecutar sobre volúmenes grandes de texto para generar anotaciones débiles que después se revisen y se usen como preentrenamiento de sistemas mayores.
- Análisis de literatura científica y notas de prensa sanitarias: extracción de menciones de reacciones adversas en resúmenes y artículos en español para estudios farmacoepidemiológicos observacionales.
- Sistemas de alerta temprana en portales de salud: detectar automáticamente cuándo un texto menciona un efecto adverso asociado a un principio activo concreto y derivarlo a revisión humana.
- Clasificación de frecuencia declarada: la entidad `FREQ` permite distinguir entre reacciones "muy frecuentes", "frecuentes" o "raras", útil para priorizar casos por gravedad esperada.
- Prototipado académico y docencia: al ser un modelo pequeño y con licencia permisiva, es adecuado para prácticas de NER biomédico y como línea base en trabajos de fin de grado o máster.

## Benchmarks y rendimiento

Los únicos resultados publicados son los de la model card, calculados a nivel de entidad sobre el test sintético del proyecto (1.577 oraciones, 26.213 tokens, 3.366 entidades de referencia, 14 medicamentos no vistos en el entrenamiento supervisado):

| Criterio de evaluacion | Precision | Recall | F1 |
|---|---:|---:|---:|
| Strict / seqeval | 0,9623 | 0,9777 | 0,9699 |
| Partial | 0,9724 | 0,9880 | 0,9801 |
| Ent-type | 0,9813 | 0,9970 | 0,9891 |

Advertencia metodológica recogida en la propia model card: el split `test` se utilizó también para parada temprana y selección del mejor checkpoint, de modo que estas cifras no constituyen una estimación sobre un holdout independiente y están sesgadas al alza. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos sería aplicable a un modelo encoder de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 125,4 M de parámetros: en torno a 0,5 GB en fp32, 0,25 GB en fp16 y 0,13 GB en int8, más el overhead de activaciones y tokenizador, que en secuencias cortas es reducido.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas y en CPU, dado el tamaño del modelo.
- GPU recomendadas para despliegue en producción: cualquier acelerador con al menos 1 GB de memoria libre. Para lotes grandes, una A100 o H100 mejorarían el throughput, pero son innecesarias por capacidad.
- Opciones de despliegue documentadas: `pipeline` de transformers (uso mostrado por el autor) y endpoints de HuggingFace, ya que el repositorio lleva la etiqueta `endpoints_compatible`.
- Otras opciones de despliegue (ONNX Runtime, TorchScript, TGI, vLLM): no documentadas por el autor. Al ser un modelo encoder, requerirían conversión y validación propias; vLLM está orientado principalmente a decodificadores generativos, por lo que su uso aquí no está verificado.
- Cuantización GGUF y ejecución con llama.cpp u Ollama: no disponibles; el autor solo publica pesos safetensors sin cuantizar.
- Latencia y throughput: no publicados en la información disponible. La única referencia de escala es el conjunto de evaluación (1.577 oraciones, 26.213 tokens), sin tiempos asociados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIMA-RoBERTa-4.8-NER-ADR-CONLL-SYNTH | 125.397.513 | No disponible | NER biomedico en espanol, 4 tipos de entidad | CC-BY-4.0 | HuggingFace |
| guerrerotook/CIMA-RoBERTa-4.8-NER (modelo hermano) | No disponible | No disponible | NER biomedico en espanol | No disponible | HuggingFace |
| guerrerotook/CIMA-RoBERTa-4.8 (modelo base) | No disponible | No disponible | Modelo de lenguaje enmascarado adaptado a dominio CIMA | No disponible | HuggingFace |
| Otras alternativas de NER biomedico en espanol | No disponible | No disponible | NER biomedico general | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. El hermano `guerrerotook/CIMA-RoBERTa-4.8-NER` sí aparece descrito en la búsqueda web como un fine-tuning sobre el mismo modelo base, pero sin métricas publicadas en las fuentes consultadas.

## Limitaciones y advertencias

- Los resultados están medidos sobre un corpus sintético generado por el propio autor. Miden el ajuste al régimen sintético, no la transferencia a fichas técnicas reales, y el autor lo advierte explícitamente.
- El split de test se usó para parada temprana y selección del checkpoint, por lo que las cifras de F1 (0,9699 en strict) están optimistamente sesgadas.
- El volumen de datos es muy reducido: 70 textos de entrenamiento y 28 de evaluación, procedentes de 35 y 14 medicamentos respectivamente.
- La validación del corpus comprueba que las superficies anotadas aparecen en el texto, pero no garantiza una anotación clínica exhaustiva, según la propia model card.
- Riesgo de alucinación trasladado al ámbito NER: falsos positivos, entidades partidas o etiquetas asignadas a términos que no corresponden a una reacción adversa real. En un modelo discriminativo el riesgo se manifiesta como etiquetado espurio, no como texto inventado.
- Sesgos potenciales derivados del corpus sintético de origen: vocabulario, estructuras de frase y distribución de fármacos dependen del generador, no de la variabilidad real de los prospectos.
- Cobertura de idioma limitada al español. No hay soporte declarado para catalán, gallego, euskera ni inglés.
- Esquema de entidades cerrado a cuatro tipos (`REACT`, `ACTIVE`, `FREQ`, `SYS`). No cubre dosis, vía de administración, interacciones ni poblaciones de riesgo.
- Longitud de contexto no especificada por el autor. Al tratarse de un encoder RoBERTa de tamaño base cabe esperar una ventana limitada, pero no hay confirmación en la información disponible.
- El modelo no ha sido validado para decisiones clínicas, tal como indica el autor. No debe usarse como única fuente en contextos asistenciales.
- Licencia CC-BY-4.0: permite uso comercial y modificación, pero exige atribución al autor y la indicación de los cambios realizados. No incluye garantías ni cláusula de responsabilidad.
- El ejemplo de uso de la model card contiene la frase "frecuencia frecuente", lo que sugiere ruido en la generación sintética del material de demostración; conviene validar la salida sobre texto real antes de integrarla en producción.
- Trazas de evaluación: el modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guerrerotook/CIMA-RoBERTa-4.8-NER-ADR-CONLL-SYNTH
- Dataset de entrenamiento: https://huggingface.co/datasets/guerrerotook/CIMA-4.8-ADR-NER-EXTENDED
- Modelo base: https://huggingface.co/guerrerotook/CIMA-RoBERTa-4.8
- Modelo hermano (NER sin corpus sintético): https://huggingface.co/guerrerotook/CIMA-RoBERTa-4.8-NER
- Perfil del autor: https://huggingface.co/guerrerotook
- Ficha del dataset baseline en free2aitools: https://free2aitools.com/dataset/guerrerotook/cima-roberta-ner-baseline
- Referencia general sobre fine-tuning de RoBERTa para NER: https://arxiv.org/pdf/2412.15252
- Cita académica: Guerrero Guirado, Luis Miguel. "Aplicación de modelos de Inteligencia Artificial para la identificación y catalogación de reacciones adversas de medicamentos". Proyecto Fin de Grado, Universidad Nacional de Educación a Distancia, 2026.
