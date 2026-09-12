# dan9276/camembert-multinerd-fr-person-ner

## Resumen

`dan9276/camembert-multinerd-fr-person-ner` es un modelo de clasificación de tokens (token classification) publicado en Hugging Face por el usuario `dan9276`. El identificador indica que se trata de un ajuste fino (*fine-tuning*) de CamemBERT, el encoder de lenguaje en francés basado en la arquitectura RoBERTa, especializado en el reconocimiento de entidades nombradas (NER) de tipo persona en francés, presumiblemente entrenado sobre el corpus MultiNERD. El repositorio contiene 110.032.898 parámetros en formato safetensors y ocupa 0,4 GB.

El modelo resuelve una tarea muy acotada: etiquetar secuencias de texto en francés marcando únicamente los tramos correspondientes a nombres de personas, con el resto de tokens en la clase exterior. No es un modelo generativo ni conversacional; es un componente de pipeline que se sitúa delante de tareas como anonimización, extracción de entidades para grafos de conocimiento o enriquecimiento de bases de datos. Su relevancia práctica es la de cualquier encoder pequeño y desplegable en CPU: coste de inferencia mínimo y latencia baja para procesamiento por lotes a gran escala.

La ficha disponible es un aviso importante. La *model card* es la plantilla automática de Hugging Face sin rellenar, con todos los campos marcados como `[More Information Needed]`, y el repositorio acumula 0 descargas y 0 *likes*, con fecha de creación y de última actualización separadas por 11 segundos. No hay licencia declarada, no hay idiomas declarados, no hay resultados de evaluación y no hay documentación del conjunto de entrenamiento. Cualquier uso en producción exige verificación previa por parte del equipo que lo adopte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer para clasificación de tokens; el tag `camembert` indica arquitectura CamemBERT (base, tipo RoBERTa). Detalle de capas y cabezas no disponible |
| Parámetros totales | 110.032.898 (dato real del archivo safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada. La configuración estándar de CamemBERT admite 512 posiciones, pero no está confirmado en esta ficha |
| Tipos de cuantización | No disponible. El repositorio solo contiene pesos safetensors; no se han publicado artefactos GGUF, AWQ, GPTQ ni ONNX |
| Idiomas soportados | No disponible como campo declarado. El identificador del modelo incluye `fr`, lo que sugiere francés |
| Licencia | No disponible (campo ausente en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información publicada sobre el procedimiento de entrenamiento. Lo que se puede afirmar con los datos del repositorio es el recuento de parámetros (110.032.898), coherente con el tamaño de CamemBERT *base*, un encoder transformer de 12 capas con representación oculta de 768 dimensiones y 12 cabezas de atención, preentrenado sobre texto en francés. Sobre esa base se habría añadido una cabeza de clasificación de tokens, con el etiquetado en formato BIO o similar, para la clase persona. No se documenta el número de épocas, la tasa de aprendizaje, el tamaño efectivo de lote ni si hubo congelación de capas.

Por el identificador, el ajuste fino se habría realizado sobre MultiNERD, un corpus multilingüe de NER con etiquetas para persona, ubicación y organización, entre otras. No obstante, el repositorio no incluye referencia al dataset, ni particiones, ni métricas de validación. Tampoco hay rastro de RLHF, DPO ni ningún otro ajuste por preferencias: es un modelo discriminativo de etiquetado, no generativo. Un detalle relevante para la trazabilidad: el tag `arxiv:1910.09700` que aparece en los metadatos corresponde al artículo de Lacoste et al. (2019) sobre estimación de emisiones de carbono, citado en la plantilla automática de la *model card*; no es el artículo de CamemBERT ni de MultiNERD, por lo que no debe interpretarse como referencia técnica del modelo.

## Capacidades

- Reconocimiento de entidades nombradas de tipo persona en texto en francés, presumiblemente con salida en esquema BIO.
- Clasificación de tokens a nivel de subtoken, con la tokenización propia de CamemBERT (SentencePiece).
- Integración directa con la librería `transformers` mediante el pipeline `token-classification`, al estar etiquetado como `endpoints_compatible`.
- Inferencia por lotes sobre grandes volúmenes de texto con coste computacional bajo, al tratarse de un encoder de 110 millones de parámetros.
- No genera texto, no mantiene conversaciones, no realiza *tool calling* ni razonamiento multi-paso.
- No hay soporte documentado de vision, audio, ni modo de razonamiento explícito.
- No hay capacidades multilingües documentadas; el alcance idiomático declarado es inexistente y el indicio del identificador apunta solo a francés.

## Casos de uso

- Anonimización de documentos para cumplimiento del RGPD: el modelo detecta nombres de personas en textos administrativos o clínicos en francés y permite sustituirlos por marcadores antes de compartir el corpus con terceros. Su tamaño reducido permite ejecutarlo on-premise sin enviar datos a servicios externos.
- Preetiquetado en pipelines de anotación: se usa como primer paso para marcar candidatos a persona y reducir el trabajo manual de anotadores humanos, que después revisan y corrigen. El coste de inferencia es despreciable frente al coste de anotación.
- Construcción de grafos de conocimiento: extracción de menciones de persona en corpus periodísticos o archivísticos en francés para poblar entidades y relaciones en una base de datos, combinado con un sistema de resolución de correferencia.
- Enriquecimiento de CRM y bases de contactos: detección de nombres propios en correos, notas de reunión y formularios para normalizar y deduplicar registros, filtrando falsos positivos antes de la escritura en base de datos.
- Moderación de contenido y detección de datos personales: identificación de menciones a personas en foros o comentarios para aplicar políticas de privacidad o para activar revisiones manuales cuando se publican datos identificativos.
- Indexación y búsqueda documental: etiquetado de documentos jurídicos o históricos en francés para permitir búsquedas filtradas por persona mencionada, sin necesidad de un motor semántico completo.
- Humanidades digitales y archivística: procesamiento de corpus históricos digitalizados en francés para extraer listados de individuos citados y analizar su frecuencia y distribución a lo largo del tiempo.
- Servicio HTTP ligero en *edge* o entornos con CPU: al ser un encoder de 110 millones de parámetros, puede desplegarse en una instancia pequeña o incluso en un contenedor sin GPU para tareas de etiquetado continuo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* mantiene la sección de evaluación con el marcador `[More Information Needed]` en todos los apartados, y el repositorio no incluye métricas de precisión, exhaustividad ni F1 sobre el conjunto de validación o test de MultiNERD ni de ningún otro corpus. Tampoco hay comparación con modelos de referencia. Cualquier cifra que se utilice para decidir su adopción debe generarse mediante una evaluación propia sobre un conjunto de validación representativo del dominio de destino.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en fp32, 0,22 GB en fp16 o bf16 y en torno a 0,11-0,15 GB en cuantización de 8 bits.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090, así como en GPU de centro de datos (A100, H100, L4, T4), aunque en estos casos el modelo infrautiliza el hardware.
- Funciona en CPU sin dificultad; un procesador moderno de escritorio es suficiente para procesamiento por lotes a velocidad aceptable.
- Opciones de despliegue: pipeline de `transformers` con PyTorch, exportación a ONNX Runtime o TorchScript para reducir latencia en CPU, FastAPI o Flask como envoltorio HTTP, y Hugging Face Inference Endpoints (el repositorio está etiquetado como `endpoints_compatible`). No se han publicado artefactos para vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de clasificación de tokens no encaja en el flujo habitual de esas herramientas, orientadas a generación.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en el repositorio ni en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dan9276/camembert-multinerd-fr-person-ner` | 110.032.898 | No disponible (arquitectura base de 512 posiciones) | NER de persona en francés | No disponible | Hugging Face, pesos safetensors, 0 descargas |
| `camembert-base` | ~110 M | 512 tokens | Modelo base de lenguaje en francés, sin cabeza de NER | MIT (según su model card pública) | Hugging Face, ampliamente usado |
| `xlm-roberta-base` | ~278 M | 512 tokens | Modelo base multilingüe, requiere ajuste fino para NER | MIT (según su model card pública) | Hugging Face, muy extendido |
| `bert-base-multilingual-cased` | ~178 M | 512 tokens | Modelo base multilingüe, requiere ajuste fino para NER | Apache 2.0 (según su model card pública) | Hugging Face, muy extendido |

La comparación directa de rendimiento no es posible porque este modelo no publica métricas. Frente a los modelos base de la tabla, su única ventaja documentada es estar ya ajustado a la tarea; frente a otros ajustes de NER en francés publicados en el Hub, no hay datos que permitan establecer una jerarquía. Las licencias indicadas para los modelos de comparación proceden de sus respectivas fichas públicas y deben verificarse antes de cualquier uso comercial.

## Limitaciones y advertencias

- Ausencia total de documentación: la *model card* es la plantilla automática, sin información sobre datos, hiperparámetros, evaluación o procedencia del ajuste fino.
- Licencia no declarada: sin licencia explícita, el uso comercial del modelo queda en una zona jurídica ambigua. Es un bloqueante para producción en la mayoría de organizaciones.
- Sin métricas de calidad: no hay ninguna evidencia publicada de precisión o exhaustividad, ni siquiera sobre el conjunto de validación del propio entrenamiento.
- Alcance funcional muy estrecho: solo etiqueta entidades de tipo persona. No detecta organizaciones, ubicaciones, fechas ni otros tipos, por lo que no sustituye a un sistema NER completo.
- Sesgos potencialmente heredados: al derivar de CamemBERT y, presumiblemente, de MultiNERD, arrastra los sesgos de representación de esos corpus (predominio de nombres de determinados orígenes, sesgo de género en textos históricos o periodísticos). No hay análisis de sesgo publicado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos, es decir, marcar como persona términos que no lo son (topónimos con forma de apellido, marcas comerciales, gentilicios).
- Cobertura idiomática no confirmada: el identificador sugiere francés, pero no hay declaración formal. No debe asumirse un comportamiento correcto en otros idiomas.
- Repositorio sin mantenimiento aparente: creación y última actualización separadas por 11 segundos, cero descargas y cero *likes*. No hay historial de versiones ni respuesta conocida del autor ante incidencias.
- Verificación obligatoria antes de producción: se recomienda construir un conjunto de evaluación propio y medir precisión, exhaustividad y F1 por subgrupo antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dan9276/camembert-multinerd-fr-person-ner
- Perfil del autor en Hugging Face: https://huggingface.co/dan9276
- Artículo referenciado en el tag `arxiv:1910.09700` (Lacoste et al., 2019, sobre estimación de emisiones; procede de la plantilla de la model card, no del modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
- No se han encontrado otros enlaces relevantes en la búsqueda web; los resultados devueltos no guardaban relación con el modelo.
