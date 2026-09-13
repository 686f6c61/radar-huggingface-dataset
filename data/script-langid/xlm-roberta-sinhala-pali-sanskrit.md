# script-langid/xlm-roberta-sinhala-pali-sanskrit

## Resumen

`script-langid/xlm-roberta-sinhala-pali-sanskrit`, comercializado en su model card como «XLM-RoBERTa-25: Sinhala-Script Pali & Sanskrit», es un clasificador de identificación de idioma (LID) construido como adaptador PEFT/LoRA sobre `papluca/xlm-roberta-base-language-detection`. Su objetivo es resolver un fallo concreto de los detectores de idioma convencionales: el pali y el sánscrito escritos en grafía sinhala (frecuentes en corpus budistas y académicos de Sri Lanka) se clasifican sistemáticamente como sinhala (`si`). El modelo amplía el espacio de etiquetas de 20 a 25 clases e incorpora `pi`, `sa`, `si`, `bn` y `ta`.

El modelo tiene 278.062.873 parámetros totales en el repositorio y se distribuye exclusivamente como adaptadores LoRA (rank 64, alpha 128) inyectados en las capas `query`, `key`, `value` y `dense`, con el transformer base congelado. La longitud de contexto heredada de XLM-RoBERTa base es de 512 tokens. La licencia declarada en la model card es Apache-2.0, heredada del modelo base, aunque los metadatos de HuggingFace no la especifican.

La relevancia del modelo es de nicho pero clara: cubre un hueco que los clasificadores LID generalistas (incluido el propio XLM-R base) no resuelven, y lo hace mediante entrenamiento con datos de ensayo (*rehearsal data*) para evitar el olvido catastrófico de las 20 clases originales. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las versiones de framework declaradas son PEFT 0.20.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificación de secuencias y adaptadores LoRA/PEFT |
| Parámetros totales | 278.062.873 (safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada de XLM-RoBERTa base) |
| Tipos de cuantización | no disponible; el repositorio no publica versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | 25 etiquetas: las 20 del modelo base (no enumeradas en la información disponible) más 5 nuevas (`si`, `pi`, `sa`, `bn`, `ta`). Etiquetas declaradas en los tags: en, fr, de, ar, hi, si, sa, pi, bn, ta |
| Licencia | Apache-2.0 según la model card (heredada del modelo base); los metadatos de HuggingFace indican «no disponible» |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT); el modelo base se descarga por separado. Tamaño del repositorio: 1,3 GB |
| Modelo base | `papluca/xlm-roberta-base-language-detection` |
| Librería | PEFT 0.20.0 / transformers |
| Pipeline | text-classification |
| Etiquetas de salida | 25 (20 originales + `si`, `pi`, `sa`, `bn`, `ta`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es XLM-RoBERTa base, un transformer encoder multilingüe de 278M de parámetros con 512 tokens de contexto, sobre el que se aplica un ajuste fino parametrizado (PEFT) mediante LoRA. El transformer base permanece completamente congelado y solo se entrenan matrices adaptadoras de bajo rango (rank 64, alpha 128) en las proyecciones `query`, `key`, `value` y `dense` de las capas de atención. La cabeza de clasificación se expande de 20 a 25 etiquetas para acomodar las nuevas clases. El entrenamiento se realizó durante 10 épocas con parada temprana (*early stopping*) y una tasa de aprendizaje de 2e-5.

El aspecto técnico más relevante es la estrategia contra el olvido catastrófico. Ampliar la cabeza de clasificación de un modelo de 270M parámetros suele degradar gravemente el rendimiento en las clases originales. Para mitigarlo, el autor mezcló datos de ensayo (*rehearsal data*) procedentes de `CohereLabs/aya_dataset` para los idiomas originales junto con los nuevos datos de sinhala, pali y sánscrito (corpus Nadil, SiDiaC-v2 y DCS). Una restricción de diseño explícita es que las etiquetas `sa` y `pi` se entrenaron *exclusivamente* sobre datos en grafía sinhala: el modelo representa estructuralmente sánscrito y pali **en escritura sinhala**, no en devanagari ni en transliteración latina. La carga del modelo requiere `AutoConfig` actualizado y `ignore_mismatched_sizes=True` antes de aplicar los adaptadores, ya que la cabeza del checkpoint base tiene 20 clases y la del adaptador, 25.

## Capacidades

- Clasificación de idioma a nivel de secuencia sobre 25 etiquetas, incluyendo la separación entre sinhala (`si`), pali en grafía sinhala (`pi`) y sánscrito en grafía sinhala (`sa`).
- Mantenimiento de las 20 clases originales del modelo base gracias al entrenamiento con datos de ensayo, con precisión agregada del 97,33 % en CommonLID.
- Clasificación de textos multilingües en al menos: inglés, francés, alemán, árabe, hindi, sinhala, sánscrito, pali, bengalí y tamil (etiquetas documentadas).
- Capacidad de operar sobre entradas cortas, aunque con fiabilidad reducida: el propio autor recomienda al menos una frase completa.
- Compatibilidad declarada con Text Embeddings Inference (TEI) y con Inference Endpoints de HuggingFace, además de las pipelines de `transformers`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, *tool calling* ni capacidades de agente: es un clasificador discriminativo puro.
- No se documentan modos especiales de inferencia (ni *thinking mode* ni *chain-of-thought*).

## Casos de uso

- **Procesado de corpus budistas de Sri Lanka**: el modelo separa texto en sinhala de comentarios y textos canónicos en pali escritos en grafía sinhala, una distinción que los LID generalistas no realizan. Es el caso de uso principal del modelo y el que justifica su existencia.
- **Curación y filtrado de datasets multilingües**: en un *pipeline* de preparación de datos, se usa como etapa de etiquetado por idioma para separar subconjuntos antes de entrenar modelos generativos, con la salvedad de que solo debe aplicarse a texto en grafía sinhala para las clases `sa` y `pi`.
- **Catalogación de archivos y bibliotecas digitales**: clasificación automática de registros y manuscritos digitalizados del sur de Asia, discriminando entre materiales en sinhala, pali y sánscrito para asignar metadatos y rutas de indexación.
- **Enrutamiento de consultas en sistemas multilingües**: en atención al cliente o buscadores con cobertura de India y Sri Lanka, la etiqueta de idioma determina qué modelo de traducción, qué plantilla de respuesta o qué cola de soporte se activa.
- **Moderación de contenido en plataformas UGC**: detección previa del idioma de publicaciones para aplicar políticas y filtros específicos por lengua en foros y redes sociales con mezcla de sinhala, tamil y bengalí.
- **Investigación lingüística y sociolingüística cuantitativa**: análisis de códigos y alternancia de lenguas en corpus históricos y contemporáneos, cuantificando la proporción de pali y sánscrito en escritura sinhala frente a texto vernáculo.
- **Etapa previa a traducción automática o TTS/ASR**: identificación del idioma de entrada para seleccionar el modelo de traducción o síntesis adecuado, evitando enviar texto pali a un sistema entrenado solo en sinhala moderno.
- **Preetiquetado para anotación humana**: generación de etiquetas provisionales de idioma sobre grandes volúmenes de texto no anotado, que después se revisan manualmente, reduciendo el coste de anotación en corpus especializados.

## Benchmarks y rendimiento

Evaluado sobre versiones integradas de CommonLID, FLORES+ y WiLI-2018. El autor indica que los conjuntos de prueba se modificaron dinámicamente: se eliminaron los registros de sánscrito en devanagari y pali en latín, y se inyectaron registros de alta calidad en grafía sinhala procedentes del dataset Nadil, evaluando únicamente esos registros contra las etiquetas `sa` y `pi`.

F1 por idioma:

| Idioma | CommonLID | FLORES+ | WiLI-2018 |
|---|---|---|---|
| Sinhala (`si`) | 0,9257 | 0,9722 | 0,9980 |
| Pali (`pi`) | 0,9932 | 0,9949 | 0,9972 |
| Sánscrito (`sa`) | 0,9862 | 0,9977 | 0,9977 |
| Inglés (`en`) | 0,9590 | 0,7669 | 0,8887 |
| Tamil (`ta`) | 0,9818 | 0,9946 | 0,9945 |
| Hindi (`hi`) | 0,9713 | 0,9912 | 0,9894 |
| Bengalí (`bn`) | 0,9931 | 0,9926 | 0,9691 |
| Árabe (`ar`) | 0,9952 | 0,5027 | no disponible |
| Francés (`fr`) | 0,9471 | 0,9792 | 0,9798 |
| Alemán (`de`) | 0,9674 | 1,0000 | 0,9703 |

Métricas agregadas:

| Benchmark | Muestras | Precisión (accuracy) | Macro F1 |
|---|---|---|---|
| CommonLID | 141.767 | 97,33 % | 89,58 % |
| FLORES+ | 31.335 | 92,53 % | 94,03 % |
| WiLI-2018 | 26.047 | 97,75 % | 85,92 % |

No se proporcionan comparativas directas contra otros modelos LID en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 1,1 GB para los pesos (278M × 4 bytes), más el *overhead* de activaciones; en la práctica, entre 2 y 3 GB con lotes pequeños.
- VRAM para inferencia en FP16/BF16: aproximadamente 0,56 GB de pesos; cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: no requiere hardware de gama alta. Cualquier GPU con 4-6 GB de VRAM es suficiente (RTX 3050, RTX 3060, GTX 1660, T4). Tarjetas como A100, H100 o RTX 4090 están sobredimensionadas para este modelo y solo se justifican para servir grandes volúmenes en paralelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas, e incluso en CPU para cargas de baja concurrencia.
- Opciones de despliegue: pipeline `text-classification` de `transformers`, Text Embeddings Inference (TEI, declarado en los tags del repositorio), HuggingFace Inference Endpoints (`endpoints_compatible`), exportación a ONNX mediante Optimum, y despliegue en CPU con PyTorch. Para clasificación de secuencias, TEI es la vía recomendada; vLLM no es el camino principal para este tipo de tarea.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de peticiones por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Etiquetas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `script-langid/xlm-roberta-sinhala-pali-sanskrit` | 278.062.873 (LoRA sobre base) | 25 | 512 tokens | Apache-2.0 según model card | HuggingFace (0 descargas) |
| `papluca/xlm-roberta-base-language-detection` | ≈278M | 20 | 512 tokens | heredada del base (Apache-2.0 según la model card de este adaptador) | HuggingFace, ampliamente utilizada |
| XLM-RoBERTa base | ≈278M | no aplica (modelo preentrenado) | 512 tokens | MIT según su ficha original (no verificado en la información disponible) | HuggingFace, referencia |
| Clasificadores LID no neuronales (p. ej. fastText lid.176) | no disponible | 176 idiomas | no aplica | no disponible | distribución pública |

La diferencia funcional clave frente al modelo base es la cobertura de pali y sánscrito en grafía sinhala, que ninguna de las alternativas de la tabla ofrece. En cuanto a coste computacional, el modelo es ligero (278M de parámetros) y compite en la misma clase de recursos que el XLM-R base. No se dispone de datos comparativos de benchmarks entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Restricción de grafía crítica**: las etiquetas `sa` y `pi` representan exclusivamente sánscrito y pali en **escritura sinhala**. El modelo no está diseñado para clasificar sánscrito en devanagari ni pali en transliteración latina, y su uso en esos casos produce resultados no válidos.
- **Confusión entre sánscrito y pali**: el propio autor señala que el sánscrito en grafía sinhala puede confundirse con pali debido al solapamiento léxico y ortográfico entre ambas lenguas.
- **Entradas cortas poco fiables**: se recomienda un mínimo de una frase completa; fragmentos muy breves degradan la precisión.
- **Dependencia del dominio**: el modelo hereda las características del corpus de ajuste (Nadil, SiDiaC-v2, DCS); su comportamiento en texto fuera de dominio puede diferir del reportado.
- **Rendimiento desigual en idiomas originales**: el F1 del árabe en FLORES+ cae a 0,5027 y el del inglés a 0,7669, muy por debajo de las cifras de CommonLID y WiLI-2018, lo que indica sensibilidad al dominio y al formato de las muestras.
- **Sesgos**: no se documenta ningún análisis de sesgos en la información disponible. Al ser un clasificador de idioma, el riesgo principal es el sesgo de asignación hacia clases mayoritarias en textos mixtos o de variedades dialectales no representadas.
- **Riesgo de alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y de etiquetado erróneo en texto ambiguo o multilingüe, que puede propagarse a etapas posteriores del pipeline.
- **Licencia**: la model card declara Apache-2.0 heredada del modelo base, mientras que los metadatos de HuggingFace indican que la licencia no está disponible. Antes de un uso comercial conviene verificar la licencia efectiva del checkpoint base y de los corpus de entrenamiento (Nadil, SiDiaC-v2, DCS, `CohereLabs/aya_dataset`), cuyos términos pueden imponer restricciones adicionales.
- **Carga no estándar**: es necesario cargar la configuración local con las 25 etiquetas y pasar `ignore_mismatched_sizes=True`; una carga convencional de `pipeline()` fallará o producirá etiquetas incorrectas.
- **Adopción nula**: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente por parte de terceros ni informes de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/script-langid/xlm-roberta-sinhala-pali-sanskrit
- Modelo base: https://huggingface.co/papluca/xlm-roberta-base-language-detection
- Dataset de ensayo citado: CohereLabs/aya_dataset (referencia textual en la model card; sin enlace directo proporcionado)
- Corpus de entrenamiento citados sin enlace: Nadil, SiDiaC-v2, DCS
- Benchmarks citados sin enlace: CommonLID, FLORES+, WiLI-2018
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
