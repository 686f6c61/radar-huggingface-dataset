# bisectgroup/NovoMolGen_qwen3_32m_smiles_atomwise_a576cca8

## Resumen

El modelo `bisectgroup/NovoMolGen_qwen3_32m_smiles_atomwise_a576cca8` es un checkpoint de 31.928.064 parámetros (aproximadamente 31,9 millones) publicado por la organización bisectgroup en HuggingFace. Por el identificador se deduce que se trata de un modelo de generación de moléculas (NovoMolGen) construido sobre la arquitectura Qwen3, entrenado para trabajar con representaciones SMILES y con un enfoque de tokenización o predicción a nivel de átomo (`atomwise`). El sufijo `a576cca8` corresponde a un hash de experimento o de configuración, lo que sugiere que forma parte de una familia de ejecuciones de entrenamiento con variantes de hiperparámetros.

Se trata de un modelo muy pequeno dentro de la familia Qwen3: con 31,9 millones de parámetros está dos órdenes de magnitud por debajo del Qwen3-0.6B más pequeno publicado oficialmente por Alibaba. Esto lo sitúa en la categoría de modelos especializados, disenados para una tarea concreta (generación y manipulación de cadenas SMILES) más que para conversación general o razonamiento abierto. El repositorio ocupa 1,5 GB, un tamano desproporcionado respecto a los pesos en precisión completa (unos 128 MB en FP32), lo que apunta a la presencia de checkpoints adicionales, estados de optimizador o artefactos de entrenamiento junto a los pesos finales.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho, con 10 descargas y 0 likes en el momento de la consulta, sin model card sustantiva, sin licencia declarada y sin resultados de benchmarks publicados. La búsqueda web realizada no ha devuelto ninguna fuente relacionada con el modelo. Por tanto, esta ficha documenta lo verificable y marca explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (deducido de la etiqueta `qwen3`; no confirmado por el autor) |
| Parámetros totales | 31.928.064 (dato real de los pesos en safetensors) |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE; el modelo parece denso |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (no se han publicado versiones cuantizadas; al ser safetensors, admite cuantización manual a FP16, INT8 e INT4) |
| Idiomas soportados | No disponible (por la naturaleza de la tarea, la salida esperada es notación SMILES, no lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,5 GB |
| Pipeline declarado | No disponible |
| Fecha de creación | 2026-09-21 |
| Última actualización | 2026-09-21 |
| Descargas / likes | 10 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá de la etiqueta `qwen3` del repositorio y del recuento de parámetros. Qwen3 es una familia de transformers decoder-only con normalización RMSNorm, atención con RoPE y, en las variantes grandes, mecanismos de atención lineal híbrida; sin embargo, no es posible confirmar qué componentes concretos se han conservado en esta variante de 31,9 millones de parámetros ni si se ha modificado la cabeza de salida o el vocabulario para adaptarlo a SMILES.

Tampoco hay información verificable sobre el proceso de entrenamiento: número de tokens, composición del corpus químico, uso de RLHF, DPO u otras técnicas de alineación. El sufijo `smiles_atomwise` en el nombre sugiere que el modelo trabaja con tokenización a nivel de átomo en lugar de la tokenización BPE estándar sobre cadenas SMILES, lo cual es habitual en modelos generativos de moléculas porque preserva la validez sintáctica de la cadena generada. El hash `a576cca8` indica que existe al menos una ejecución de entrenamiento identificada de forma única, probablemente dentro de una búsqueda de hiperparámetros o de un barrido de configuraciones del proyecto NovoMolGen. Todo lo anterior son inferencias a partir del identificador, no hechos confirmados por el autor.

## Capacidades

- Generación de cadenas SMILES: la tarea principal implícita en el nombre `NovoMolGen` es la generación de representaciones textuales de moléculas.
- Modelado a nivel de átomo: el sufijo `atomwise` indica que la unidad de predicción o tokenización es el átomo, lo que favorece la validez sintáctica de las cadenas generadas frente a tokenizaciones subpalabra.
- Acondicionamiento o generación condicionada: no confirmado; no hay documentación sobre si acepta propiedades objetivo, scaffolds o fragmentos como entrada.
- Tool calling / function calling: no disponible, y poco probable en un modelo de 31,9 millones de parámetros especializado en química.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el dominio de salida es notación química, no lenguaje natural.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no hay indicios de ninguna de ellas.

## Casos de uso

- Generación de bibliotecas de moléculas virtuales: el modelo se usaría para muestrear de forma masiva cadenas SMILES que después se filtran por propiedades fisicoquímicas (reglas de Lipinski, QED, SA score) en un pipeline de cribado virtual. Su tamano reducido permite generar millones de candidatos con un coste computacional bajo.
- Aumento de datos en química computacional: dado un conjunto pequeno de moléculas de interés, el modelo puede emplearse para generar variantes estructurales cercanas que amplíen el conjunto de entrenamiento de otros modelos de predicción de propiedades.
- Preentrenamiento o inicialización de modelos mayores: al compartir linaje con Qwen3, este checkpoint podría servir como punto de partida para fine-tuning sobre un espacio químico propietario antes de escalar a un modelo mayor.
- Prototipado en entornos sin GPU: con 31,9 millones de parámetros, la inferencia cabe en CPU y en dispositivos de borde, lo que permite validar una idea de producto químico antes de invertir en infraestructura.
- Normalización y canonicalización de SMILES: un modelo entrenado a nivel de átomo puede usarse como componente de un pipeline que repare cadenas SMILES malformadas o generadas por otros sistemas.
- Investigación académica en modelos generativos de moléculas: sirve como referencia reproducible y de bajo coste para comparar estrategias de tokenización (atomwise frente a BPE) en generación molecular.
- Filtrado previo en descubrimiento de fármacos: como primera etapa de un embudo, descartando rápidamente candidatos inválidos antes de pasarlos a simulaciones de docking o dinámica molecular, que son mucho más caras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web realizada no devolvió ninguna fuente relacionada con este modelo ni con la organización bisectgroup; los resultados obtenidos eran contenido turístico sin relación alguna. No se dispone, por tanto, de métricas de validez de SMILES, unicidad, novedad, QED, SA score, ni de comparaciones con otros modelos generativos de moléculas.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, calculada a partir de los 31.928.064 parámetros):
  - FP32: aproximadamente 128 MB.
  - FP16 / BF16: aproximadamente 64 MB.
  - INT8: aproximadamente 32 MB.
  - INT4: aproximadamente 16 MB.
- Memoria adicional: el repositorio ocupa 1,5 GB, muy por encima de lo que ocupan los pesos, por lo que conviene descargar únicamente los ficheros `safetensors` necesarios si el espacio en disco es una restricción.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una RTX 4090, A100 o H100 estarían enormemente sobredimensionadas para este modelo, salvo que se use como componente de un pipeline mayor.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos quince años, e incluso en CPU y en dispositivos de borde tipo Raspberry Pi.
- Opciones de despliegue: al estar en safetensors y presumiblemente seguir la arquitectura Qwen3, puede cargarse con `transformers`. La conversión a GGUF para `llama.cpp` u `Ollama` es posible en teoría, pero no hay versiones publicadas. `vLLM` y `TGI` también podrían servir, aunque su sobrecoste de infraestructura no tiene sentido para un modelo de este tamano.
- Latencia y throughput: no disponible. No se han publicado mediciones, y el cálculo teórico dependería de la longitud de secuencia y del hardware, datos que no se especifican.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada. La comparación solo puede plantearse a nivel de categoría: modelos generativos de moléculas basados en transformers y de tamano reducido. No obstante, no se han podido confirmar parámetros, contexto, licencia ni rendimiento de ninguna alternativa dentro de esta consulta, por lo que se indica "no disponible" en lugar de ofrecer cifras sin respaldo.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bisectgroup/NovoMolGen_qwen3_32m_smiles_atomwise_a576cca8 | 31.928.064 | No disponible | No disponible | HuggingFace, safetensors |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explícita, el uso comercial del modelo es jurídicamente ambiguo. En la práctica, la ausencia de licencia implica que no se conceden derechos de uso por defecto, por lo que no debería desplegarse en producción sin aclarar este punto con el autor.
- Ausencia de model card: no hay documentación sobre datos de entrenamiento, sesgos, procedencia del corpus ni limitaciones conocidas.
- Riesgo de generar SMILES inválidos: como todo modelo generativo de moléculas, puede producir cadenas sintácticamente válidas pero químicamente inestables o imposibles de sintetizar. Es obligatorio un filtro de validación posterior.
- Riesgo de alucinación estructural: el modelo puede reproducir fragmentos o scaffolds sobrerrepresentados en su corpus de entrenamiento, reduciendo la novedad real de las moléculas generadas.
- Sesgo de dominio: el espacio químico cubierto depende por completo del conjunto de entrenamiento, que se desconoce. Es probable que esté sesgado hacia las clases de compuestos mayoritarias en las bases de datos públicas.
- Capacidad limitada por tamano: con 31,9 millones de parámetros, la capacidad de generalización y de modelar interacciones de largo alcance dentro de la molécula es intrínsecamente reducida en comparación con modelos de cientos de millones o miles de millones de parámetros.
- Sin validación comunitaria: 10 descargas y 0 likes indican que el modelo no ha sido reproducido ni evaluado de forma independiente.
- Longitud de contexto desconocida: se desconoce el número máximo de tokens soportado, lo que impide garantizar la generación de moléculas grandes (por ejemplo, macrociclos o péptidos) sin truncamiento.
- Restricciones de uso responsable: cualquier aplicación en descubrimiento de fármacos, química o materiales debe pasar por validación experimental; las salidas del modelo no constituyen evidencia científica.

## Enlaces

- HuggingFace: https://huggingface.co/bisectgroup/NovoMolGen_qwen3_32m_smiles_atomwise_a576cca8
- Paper, blog, repositorio o demo: no disponible. La búsqueda web realizada no devolvió ninguna fuente relacionada con el modelo, la organización bisectgroup ni el proyecto NovoMolGen.
