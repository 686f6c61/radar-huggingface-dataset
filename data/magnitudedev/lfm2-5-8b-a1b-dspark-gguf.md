# magnitudedev/LFM2.5-8B-A1B-DSpark-GGUF

## Resumen

Este repositorio contiene una copia corporativa del artefacto GGUF que Liquid AI publicó para el borrador (drafter) de decodificación especulativa del modelo LFM2.5-8B-A1B, denominado DSpark. No es un modelo de lenguaje autónomo: es un componente auxiliar que propone tokens candidatos para que el modelo objetivo los verifique en paralelo, y requiere obligatoriamente ese modelo objetivo para funcionar. El fichero incluido, `LFM2.5-8B-A1B-DSpark-Q8_0.gguf`, ocupa 0,4 GB y contiene 327.707.521 parámetros cuantizados en Q8_0.

La relevancia del artefacto está en que la decodificación especulativa es una de las técnicas más eficaces para reducir la latencia de decodificación autorregresiva sin modificar la distribución de salida del modelo objetivo. Magnitude lo distribuye en su catálogo bajo la etiqueta «Acceleration: DSpark», y en la comunidad han aparecido análisis independientes que discuten la supuesta ventaja de velocidad frente a llama.cpp en equipos Apple Silicon con 16 GB de memoria unificada.

El modelo objetivo declarado es `LiquidAI/LFM2.5-8B-A1B-DSpark-GGUF`. La nomenclatura del nombre sugiere 8.000 millones de parámetros totales y aproximadamente 1.000 millones activos (posible arquitectura MoE), pero ese dato no aparece confirmado en la información proporcionada y no debe darse por sentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque borrador (drafter) para decodificación especulativa; implementación DFlash/DSpark de SGLang; atención bidireccional dentro del bloque borrador (`dflash.attention.causal = false`) |
| Parametros totales | 327.707.521 (corresponden al artefacto borrador, no al modelo objetivo de 8B) |
| Parametros activos | no disponible (la nomenclatura «A1B» del modelo objetivo sugiere ~1.000 M activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único formato incluido en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (LFM Open License v1.0); en HuggingFace declarada como `other` con `license_name: lfm1.0` |
| Formato de pesos | GGUF (fichero único `LFM2.5-8B-A1B-DSpark-Q8_0.gguf`) |
| Tamano del repositorio | 0,4 GB |
| Revision de origen | `7ba04ee5ff05a4baf2681fe5ddda6d736581ccdf` (repositorio de LiquidAI) |
| SHA-256 del fichero | `c15011522a6956cd30336d968dfad80e47f747495111ca090d766a26b4ecf3f1` |
| Modelo objetivo requerido | LiquidAI/LFM2.5-8B-A1B-DSpark-GGUF |

## Arquitectura y entrenamiento

El artefacto es un bloque borrador diseñado para el mecanismo de decodificación especulativa DSpark, cuya configuración e implementación de referencia se encuentran en el módulo `dspark_components/dspark_config.py` y en `models/dflash.py` del repositorio de SGLang. Dos metadatos definen su comportamiento en inferencia: `dflash.attention.causal = false`, que indica que el bloque borrador emplea atención bidireccional en lugar de atención causal, y `dflash.sample_from_anchor = true`, que hace que la selección de propuestas se inicie en la fila ancla. La model card indica que estos metadatos se derivaron de la configuración del checkpoint y de la implementación DFlash de SGLang, y que se verificaron contra salidas de referencia.

No se dispone de información sobre el proceso de entrenamiento del borrador: no se especifican número de tokens, composición del dataset, métodos de alineación (RLHF, DPO) ni detalles del procedimiento de destilación o ajuste que produce el bloque. Tampoco se documentan innovaciones adicionales más allá de la propia arquitectura DFlash/DSpark. La model card se limita a describir la procedencia del artefacto, su hash de integridad y los metadatos del borrador.

## Capacidades

- Decodificación especulativa: propone tokens candidatos que el modelo objetivo verifica en paralelo, con el objetivo de reducir el número de pasos de decodificación secuencial.
- Atención bidireccional en el bloque borrador, que permite construir propuestas usando contexto a ambos lados de la posición ancla.
- Selección de propuestas desde la fila ancla (`sample_from_anchor`), orientada a maximizar la tasa de aceptación del verificador.
- Integración en el stack de SGLang como componente de aceleración, no como modelo servible de forma independiente.
- Generación de texto, razonamiento, código o matemáticas: no disponible en el artefacto en sí; depende íntegramente del modelo objetivo.
- Tool calling / function calling: no disponible en el artefacto; se heredaría del modelo objetivo, no del borrador.
- Soporte de agentes y razonamiento multi-paso: no disponible en el artefacto; depende del modelo objetivo.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible.

## Casos de uso

- Aceleración de inferencia en producción con SGLang: el borrador se carga junto al modelo objetivo LFM2.5-8B-A1B para aumentar el número de tokens generados por paso de decodificación, reduciendo la latencia percibida en aplicaciones de chat sin alterar la distribución de salida del modelo verificador.
- Despliegue de baja latencia en una sola GPU: en escenarios con presupuesto de latencia estricto (por ejemplo, menos de 50 ms por token), emparejar este borrador de 0,4 GB con el objetivo cuantizado permite acercarse a los requisitos sin necesidad de hardware adicional.
- Inferencia local en Apple Silicon de 16 GB: el tamaño reducido del borrador deja prácticamente todo el presupuesto de memoria unificada al modelo objetivo, lo que lo hace viable en portátiles con GPU integrada, tal y como se explora en los análisis de terceros enlazados más abajo.
- Evaluación comparativa de estrategias de decodificación: sirve como referencia reproducible para medir la tasa de aceptación y el speedup real frente a una línea base sin decodificación especulativa, usando el SHA-256 para garantizar que se compara exactamente el mismo artefacto.
- Generación de texto largo con muchos tokens de salida: en tareas como resumen de documentos extensos, traducción de textos largos o generación de informes, la decodificación especulativa rinde mejor cuanto mayor es la longitud generada, porque amortiza el coste del borrador.
- Autocompletado de código en el editor: la generación de continuaciones cortas y repetitivas se beneficia de la reducción de latencia por token, siempre que el modelo objetivo se sirva a través de SGLang con la configuración DSpark.
- Investigación sobre decodificación especulativa: permite estudiar el efecto de la atención bidireccional en el bloque borrador y de `sample_from_anchor` sobre la tasa de aceptación, comparando con otras aproximaciones de borrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto no incluye métricas de velocidad, tasa de aceptación ni evaluaciones de calidad, y el repositorio no aporta datos de throughput o latencia.

Los resultados de búsqueda sí muestran análisis de terceros que examinan la afirmación comercial de Magnitude de ser «un 92 % más rápido que llama.cpp», medidos en un Mac con chip M4 y 16 GB de memoria unificada, y que comparan con el GGUF estándar `LiquidAI/LFM2.5-8B-A1B-GGUF` en cuantización Q4_K_M. Los números concretos de esos análisis no forman parte de la información proporcionada y no se reproducen aquí.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 0,4 GB en Q8_0, según el tamaño declarado del repositorio. Cabe con holgura en cualquier GPU y también en memoria del sistema si se ejecuta en CPU.
- VRAM del modelo objetivo: no disponible en la información proporcionada. Como referencia orientativa para un modelo de 8B (estimación estándar, no dato de la fuente), una cuantización Q4_K_M rondaría los 5 GB, Q8_0 los 8-9 GB y precisión completa los 16 GB.
- GPU recomendadas: no disponibles para el artefacto. Para el objetivo de 8B, una RTX 3060 de 12 GB o superior sería suficiente en cuantizaciones de 4 bits; para servir con concurrencia alta se recomendarían A100 o H100.
- GPU de consumo: el borrador cabe en cualquier GPU de consumo e incluso en CPU; el conjunto borrador más objetivo cuantizado debería caber en tarjetas de 8-12 GB si el objetivo se sirve en 4 bits.
- Apple Silicon: los análisis de terceros mencionan pruebas en un Mac con M4 y 16 GB de memoria unificada, lo que sugiere viabilidad en ese perfil de equipo.
- Opciones de despliegue: el artefacto depende de la implementación DFlash/DSpark de SGLang. No es un GGUF estándar pensado para llama.cpp u Ollama en modo convencional; su uso requiere el runtime que lo empareja con el modelo objetivo.
- Latencia y throughput: no disponibles. No se han publicado cifras oficiales de tokens por segundo ni de tasa de aceptación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| magnitudedev/LFM2.5-8B-A1B-DSpark-GGUF (este) | Borrador para decodificación especulativa | 327.707.521 | GGUF Q8_0 | no disponible | lfm1.0 | HuggingFace, requiere objetivo |
| LiquidAI/LFM2.5-8B-A1B-DSpark-GGUF | Borrador original de Liquid AI | no disponible | GGUF | no disponible | lfm1.0 | HuggingFace |
| LiquidAI/LFM2.5-8B-A1B-GGUF | Modelo objetivo servible de forma autónoma | ~8B (según nomenclatura) | GGUF (p. ej. Q4_K_M) | no disponible | lfm1.0 | HuggingFace |
| Decodificación estándar en llama.cpp sin borrador | Línea base sin decodificación especulativa | no aplica | GGUF | no disponible | no aplica | llama.cpp |

No se dispone de datos de rendimiento comparado entre estas opciones dentro de la información proporcionada, por lo que la comparativa se limita a tipo de artefacto, tamaño, formato y licencia.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo objetivo correspondiente no produce salida utilizable. Cargarlo de forma aislada no tiene sentido.
- Dependencia de implementación: está atado a la configuración DSpark y a la implementación DFlash de SGLang. No es portable a runtimes que no soporten esos metadatos (`dflash.attention.causal`, `dflash.sample_from_anchor`).
- Licencia: se rige por la LFM Open License v1.0. Es imprescindible revisar sus condiciones antes de cualquier uso comercial, ya que la licencia se declara como `other` en HuggingFace.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, y es una resubida de un artefacto ya existente. No hay evidencia de uso en producción.
- Riesgo de confusión de tamaños: el recuento de 327.707.521 parámetros corresponde al borrador, no a un modelo de 8B. Interpretarlo como el tamaño real del modelo llevaría a decisiones erróneas de hardware.
- Idiomas, sesgos y alucinación: no disponibles para el artefacto. Cualquier comportamiento de este tipo dependerá del modelo objetivo, no del borrador.
- Longitud de contexto: no disponible. No puede planificarse un despliegue en función de la ventana de contexto con los datos actuales.
- Integridad del fichero: conviene verificar el SHA-256 `c15011522a6956cd30336d968dfad80e47f747495111ca090d766a26b4ecf3f1` antes de desplegarlo, al tratarse de una copia de terceros.
- Fecha de creación: el repositorio figura creado el 2026-10-06, lo que indica un artefacto reciente y con escaso recorrido de pruebas externas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/magnitudedev/LFM2.5-8B-A1B-DSpark-GGUF
- Borrador original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-DSpark-GGUF/tree/7ba04ee5ff05a4baf2681fe5ddda6d736581ccdf
- Configuración DSpark en SGLang: https://github.com/sgl-project/sglang/blob/264d1c20153cadc921670b982e6531d9800353e6/python/sglang/srt/speculative/dspark_components/dspark_config.py
- Implementación DFlash en SGLang: https://github.com/sgl-project/sglang/blob/264d1c20153cadc921670b982e6531d9800353e6/python/sglang/srt/models/dflash.py
- Análisis comparativo en Zenn (Mac de 16 GB): https://zenn.dev/amu_lab/articles/magnitude-vs-llamacpp-16gb-mac-benchmark
- Análisis de la afirmación «92 % más rápido que llama.cpp»: https://note.com/hacklog_stealth/n/nd8b606b944d2
- Versión en inglés del análisis anterior: https://note.com/hacklog_stealth/n/nd8b606b944d2?hl=en
