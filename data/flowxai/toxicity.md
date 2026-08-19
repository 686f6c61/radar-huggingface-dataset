# flowxai/toxicity

## Resumen

`flowxai/toxicity` es un detector de toxicidad multilingüe desarrollado por flowxai como parte de su librería `border`, un sistema de guardrails embebible que inspecciona el texto que entra y sale de un LLM. No es un clasificador de toxicidad de propósito general, sino un componente entrenado específicamente para la política de decisión de `border`, que devuelve una decisión estructurada (`allow`, `flag`, `redact` o `block`) junto con un registro de evidencia auditable. El modelo se basa en `FacebookAI/xlm-roberta-base` y emplea una cabeza de clasificación multi-etiqueta con cuatro categorías: `insult`, `threat`, `identity_attack` y `harassment`.

El modelo se distribuye como un artefacto ONNX cuantizado a INT8 de 535 MB, con un punto de operación calibrado en 0.81 (frente al 0.5 por defecto, que resulta inadecuado para esta familia de modelos). Su relevancia radica en su cobertura de 26 idiomas, su latencia reducida (225 ms por escaneo en un solo hilo de CPU) y su diseño orientado a producción, donde la integridad de la decisión y la reproducibilidad de la evidencia son críticas. La ventana de entrenamiento es de 96 tokens, por lo que textos más largos requieren fragmentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa-base) con cabeza multi_label_classification |
| Parametros totales | No disponible (basado en XLM-RoBERTa-base) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 96 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | INT8 (solo tabla de embeddings, operación Gather) |
| Idiomas soportados | 26: az, bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base` y añade una cabeza de clasificación multi-etiqueta para predecir las cuatro categorías de toxicidad. Según la model card, fue entrenado con un objetivo de calibración sobre la métrica `macro_f1` en el split de validación, lo que condujo al punto de operación de 0.81. Los datos de entrenamiento específicos no se detallan en la información disponible, pero el entrenamiento se realizó a 96 tokens de longitud.

La innovación técnica más destacable es la estrategia de cuantización. En lugar de cuantizar todas las operaciones (práctica habitual que degrada el rendimiento), el artefacto publicado cuantiza únicamente la tabla de embeddings (operación Gather). Las mediciones sobre 300 textos reales muestran que esta estrategia reduce el tamaño de 856 MB (MatMul solo) a 535 MB, con un drift medio de logits de 0.0036 y cero decisiones cambiadas, frente a un drift de 0.68 y 51 decisiones alteradas al cuantizar todas las operaciones. La inferencia se realiza mediante ONNX Runtime, y el modelo está diseñado para integrarse en la librería `border`, que gestiona la fragmentación de textos largos y la aplicación del umbral.

## Capacidades

- Clasificación multi-etiqueta de toxicidad en cuatro categorías: insulto, amenaza, ataque a la identidad y acoso.
- Soporte multilingüe para 26 idiomas, incluyendo lenguas minoritarias como maltés, irlandés o estonio.
- Integración nativa con la librería `border` para guardrails: devuelve decisiones estructuradas (`allow`, `flag`, `redact`, `block`) y un registro de evidencia con hashes en lugar del texto original.
- Inferencia local sin dependencia de red tras la carga inicial de pesos.
- Compatible con el pipeline de Hugging Face `text-classification` y con `text-embeddings-inference` (según tags del repositorio).
- Sin capacidades de generación de texto, razonamiento o tool calling; es un clasificador puro.

## Casos de uso

- Moderación de contenido en plataformas multilingües: el modelo puede analizar comentarios de usuarios en 26 idiomas y marcar automáticamente mensajes que contengan insultos, amenazas o acoso, con un umbral calibrado para minimizar falsos positivos.
- Guardrails de entrada y salida para LLMs: integrado en `border`, filtra el prompt del usuario y la respuesta del modelo antes de mostrarla, decidiendo si se permite, se marca, se redacta o se bloquea.
- Auditoría de seguridad en aplicaciones de IA generativa: el registro de evidencia con hashes permite auditar decisiones de moderación sin almacenar texto sensible, cumpliendo requisitos de privacidad.
- Filtrado de salidas en asistentes virtuales multilingües: evita que el modelo genere contenido tóxico en producción, con una latencia de 225 ms por escaneo en CPU, adecuada para flujos síncronos.
- Análisis de riesgo en redes sociales: clasificación de grandes volúmenes de texto en lote para identificar patrones de acoso o ataques a la identidad en comunidades específicas.
- Cumplimiento normativo en servicios europeos: la cobertura de idiomas de la UE (incluyendo ga, mt, et, lv, lt, sl) facilita el cumplimiento de la Ley de Servicios Digitales (DSA) en cuanto a moderación de contenido.
- Despliegue en entornos con recursos limitados: al ser un artefacto ONNX de 535 MB que corre en un solo hilo de CPU, puede ejecutarse en edge devices o instancias de bajo coste sin GPU.

## Benchmarks y rendimiento

El modelo reporta métricas por idioma sobre el split de validación, con un soporte de 20 ejemplos por idioma (19 en algunos casos). El punto de operación calibrado es 0.81, y la model card indica que tanto en el umbral por defecto (0.5) como en el calibrado (0.81) el F1 agregado es 0.989. La tabla completa por idioma es la siguiente:

| Idioma | Soporte | Precision | Recall | F1 |
|---|---|---|---|---|
| az, cs, de, el, en, es, et, fi, ga, hr, it, lv, nl, pl, pt, ro, sk, sl, tr | 19-20 | 1.000 | 1.000 | 1.000 |
| bg, da, lt | 20 | 0.952 | 1.000 | 0.976 |
| fr, hu | 20 | 1.000 | 0.950 | 0.974 |
| mt | 20 | 0.909 | 1.000 | 0.952 |
| sv | 20 | 0.950 | 0.950 | 0.950 |

Los idiomas más débiles son sueco (F1 0.950), maltés (F1 0.952, ausente del preentrenamiento de XLM-R) y francés (F1 0.974). En cuanto a la cuantización, el artefacto INT8 publicado (solo Gather) presenta un drift medio de logits de 0.0036 y cero decisiones cambiadas sobre 300 textos de prueba. No se han publicado resultados de benchmarks comparativos con otros modelos de toxicidad en la información disponible.

## Requisitos de hardware

- Tamaño del artefacto: 535 MB (ONNX INT8).
- Inferencia en CPU: 225 ms por escaneo a 87 tokens en un solo hilo, lo que permite despliegue en instancias CPU estándar sin GPU.
- VRAM: al ser un modelo de clasificación, puede ejecutarse en GPU con menos de 1 GB de VRAM, aunque no es necesario; cualquier GPU moderna (incluso integradas) es suficiente.
- Opciones de despliegue: ONNX Runtime directamente, o mediante la librería `border` (que gestiona fragmentación y umbral). No requiere vLLM ni TGI; es compatible con `text-embeddings-inference` según los tags del repositorio.
- Latencia y throughput: 225 ms por escaneo en un hilo de CPU; el throughput dependerá del número de hilos y del tamaño del lote, pero es adecuado para procesamiento síncrono en producción.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de toxicidad en la información proporcionada. La model card no incluye benchmarks frente a alternativas como Detoxify, Jigsaw o modelos basados en RoBERTa, ni datos de rendimiento agregado más allá del F1 por idioma. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El umbral por defecto de 0.5 es inadecuado para este modelo; el punto de operación calibrado es 0.81. Usar el valor por defecto puede producir F1 de 0.000 en varios idiomas, como se documenta en la model card.
- La ventana de contexto está limitada a 96 tokens. Textos más largos requieren fragmentación y recombinación manual si se usa el artefacto fuera de la librería `border`, ya que el gráfico ONNX no incluye esta lógica.
- El modelo no es un clasificador de toxicidad de propósito general: fue entrenado específicamente para la política de `border` y sus cuatro etiquetas, por lo que su comportamiento fuera de ese contexto no está garantizado.
- Cobertura débil en algunos idiomas: sueco (F1 0.950) y maltés (F1 0.952) presentan el peor rendimiento, y el maltés no está incluido en el preentrenamiento del modelo base, lo que limita su fiabilidad en ese idioma.
- La cuantización INT8 solo es segura si se aplica exclusivamente a la tabla de embeddings. Cuantizar todas las operaciones (práctica habitual) degrada gravemente el rendimiento, con 51 decisiones cambiadas de 300 en las pruebas documentadas.
- La licencia Apache-2.0 permite uso comercial, pero la dependencia de la librería `border` (si se usa integrado) debe revisarse por separado, ya que su licencia no se especifica en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flowxai/toxicity
- Repositorio de la librería `border`: https://github.com/flowx-ai/border
