# SamyBaouche/mimic-element-matcher

## Resumen

Mimic element matcher es un cross-encoder de 22,7 millones de parámetros desarrollado por SamyBaouche como componente del agente web Mimic. Su función es resolver un problema muy concreto dentro de la automatización de interfaces: determinar si un elemento de una página rediseñada (un botón, un campo de formulario) corresponde al mismo elemento que el usuario manipuló durante una demostración previa. Para ello puntúa pares de descripciones textuales como `button 'Save invoice'` frente a `button 'Record'`, y permite al agente reparar sus selectores en milisegundos en lugar de recurrir a un modelo de visión de 7B parámetros.

El modelo parte de `cross-encoder/ms-marco-MiniLM-L6-v2` y se ha afinado sobre 14.341 pares generados a partir de 3.000 rediseños sintéticos de formularios de negocio en inglés y francés. La propuesta es relevante porque aborda el problema del "self-healing" de selectores en agentes de computer-use con un coste computacional mínimo: 7,7 ms por decisión en CPU y un repositorio de 0,1 GB. Frente a la similitud de cadenas, que acierta entre el 44,6 % y el 60 % de las veces, el modelo afinado alcanza el 99,8 % en el conjunto de test sintético y el 100 % en un rediseño real completamente retenido.

Se distribuye bajo licencia Apache 2.0 en formato safetensors, con pipeline de `text-classification` y compatibilidad con Text Embeddings Inference. No es un modelo de propósito general: es una pieza especializada dentro de un pipeline mayor, y su valor depende de integrarse con el resto del agente Mimic.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer BERT (MiniLM-L6) |
| Parámetros totales | 22.713.601 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés y francés (entrenado sobre formularios de negocio sintéticos en ambos idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre `cross-encoder/ms-marco-MiniLM-L6-v2`, un transformer BERT de 6 capas y 22,7M de parámetros. A diferencia de un bi-encoder, procesa conjuntamente el par de textos (elemento de referencia y candidato en la página) y produce una puntuación de relevancia, lo que permite capturar interacciones léxicas y semánticas entre ambas descripciones. La salida se interpreta como probabilidad de que el candidato sea el elemento correcto.

El afinado se realizó durante 2 épocas sobre 14.341 pares generados a partir de 3.000 rediseños sintéticos, construidos con bancos de sinónimos, reordenación de campos y botones señuelo. La función de pérdida fue entropía cruzada binaria con ponderación de la clase positiva. El entrenamiento completo tardó 358,7 segundos. El código de entrenamiento y de generación de datos está publicado en el repositorio del proyecto (`matcher.py` y `matcher_data.py`). No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo de clasificación de pares.

## Capacidades

- Puntuación de pares texto-texto para decidir si dos descripciones de elementos de interfaz corresponden al mismo control.
- Clasificación binaria orientada a la reparación de selectores en páginas rediseñadas.
- Manejo de sinónimos y variaciones de etiquetado (por ejemplo, "Save invoice" frente a "Record") gracias al entrenamiento con bancos de sinónimos.
- Discriminación frente a botones señuelo y campos reordenados en formularios.
- Funcionamiento en CPU con latencia de 7,7 ms por decisión, lo que permite integrarlo en bucles de agente sin GPU.
- Soporte multilingüe limitado a inglés y francés en el dominio de formularios de negocio.
- Integración con el agente Mimic mediante la API `ElementMatcher` y `find_model()`.
- Compatibilidad con Text Embeddings Inference para despliegue como servicio.
- No soporta tool calling, generación de texto libre, razonamiento multi-paso ni visión; su alcance es exclusivamente la comparación de pares.

## Casos de uso

- Reparación automática de selectores en agentes web: cuando la página cambia de diseño, el agente compara cada elemento candidato con la descripción almacenada del elemento original y elige el de mayor puntuación, evitando reejecutar la demostración completa.
- Automatización de formularios empresariales: en flujos con campos renombrados o reordenados (facturación, CRM, ERP), el modelo identifica el campo correcto a partir de su etiqueta semántica en lugar de su posición en el DOM.
- Agentes de computer-use con presupuesto de cómputo ajustado: al resolver la correspondencia en 7,7 ms en CPU, se evita invocar un modelo de visión de 7B en cada paso, reduciendo coste y latencia del bucle de agente.
- Testing de regresión de interfaces: permite verificar de forma automática que los selectores de una suite de pruebas siguen apuntando a los controles correctos tras un rediseño, con una tasa de acierto del 99,8 % en el conjunto sintético.
- Enrutado previo a verificación visual: el modelo actúa como primer filtro y, cuando su mejor candidato no destaca con claridad, el agente Mimic recurre al modelo de visión como respaldo, combinando bajo coste y alta precisión.
- Localización de flujos entre inglés y francés: al haberse entrenado con formularios en ambos idiomas, puede emparejar elementos entre versiones lingüísticas de una misma aplicación.
- Detección de botones señuelo: en páginas con controles similares (guardar, registrar, cancelar), el cross-encoder discrimina el control correcto a partir del contexto textual de la etiqueta.

## Benchmarks y rendimiento

Los resultados publicados por el autor miden la precisión Top-1: el elemento correcto debe obtener la puntuación más alta entre todos los candidatos de la página.

| Modelo | Rediseños sintéticos (test retenido) | Rediseño LedgerLite v2 |
|---|---|---|
| Modelo afinado (este) | 99,8 % | 100,0 % |
| Mismo modelo sin afinar | 77,0 % | 60,0 % |
| Similitud de cadenas | 44,6 % | 60,0 % |

El autor indica que todas las etiquetas del rediseño LedgerLite v2 están retenidas fuera del entrenamiento, por lo que la segunda columna mide generalización y no memorización. La latencia declarada es de 7,7 ms por decisión en CPU. No se han publicado resultados en benchmarks estándar de NLP (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (22,7M de parámetros, aproximadamente 91 MB de pesos); en FP16 o cuantización de 8 bits, alrededor de 50 MB o menos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo está pensado para ejecutarse en CPU.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650) e incluso en entornos sin GPU.
- Opciones de despliegue: transformers, Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible`), y la API propia del proyecto Mimic (`ElementMatcher`).
- Latencia: 7,7 ms por decisión en CPU según el autor; el throughput no se ha publicado.
- Almacenamiento: repositorio de 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mimic element matcher | 22,7M | No disponible | Clasificación de pares para reparación de selectores | Apache 2.0 | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L6-v2 (base) | 22,7M | No disponible | Re-ranking de pasajes en búsqueda | Apache 2.0 | Hugging Face |
| Modelos de visión tipo 7B usados por agentes computer-use | ~7.000M | No disponible | Comprensión visual de la página | Variable | Variable |

La comparación directa con alternativas de la misma categoría es limitada porque el modelo está especializado en un dominio muy concreto (reparación de selectores en formularios web) y no existen, en la información disponible, modelos públicos equivalentes. El baseline más cercano es el propio modelo base sin afinar, que obtiene 77,0 % y 60,0 % en las mismas pruebas frente al 99,8 % y 100 % del modelo afinado. Frente a un modelo de visión de 7B, la ventaja es de tres órdenes de magnitud en número de parámetros y de latencia en CPU, a costa de perder generalidad visual.

## Limitaciones y advertencias

- Entrenado exclusivamente con formularios de negocio sintéticos en inglés y francés; su rendimiento en otros dominios (por ejemplo, interfaces de mapas, editores gráficos o aplicaciones móviles) no está validado.
- No es un modelo de propósito general: no genera texto, no razona y no procesa imágenes.
- Riesgo de alucinación de correspondencias: si el mejor candidato no destaca con claridad, el agente Mimic recurre al modelo de visión; el uso aislado del matcher sin ese mecanismo de respaldo puede producir emparejamientos erróneos.
- El conjunto de evaluación principal es sintético; el único rediseño real evaluado (LedgerLite v2) es una única página, por lo que la generalización a producción real está poco contrastada.
- No se documentan sesgos específicos, pero al entrenarse con etiquetas de formularios generadas sintéticamente puede heredar los sesgos de los bancos de sinónimos utilizados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del ecosistema Mimic para su integración práctica.
- No se ha publicado información sobre la longitud máxima de contexto, lo que impide conocer su comportamiento con descripciones de elementos muy largas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamyBaouche/mimic-element-matcher
- Repositorio del proyecto Mimic: https://github.com/SamyBaouche/mimic
- Código del matcher: https://github.com/SamyBaouche/mimic/blob/main/src/mimic/matcher.py
- Código de generación de datos: https://github.com/SamyBaouche/mimic/blob/main/src/mimic/matcher_data.py
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
