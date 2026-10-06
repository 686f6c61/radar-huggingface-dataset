# Blackfrost-AI/KOLIBRI-1-DERISKED-BF16

## Resumen

KOLIBRI-1-DERISKED-BF16 es una derivación del modelo Kolibri 1 de Aleph Alpha, publicada por Blackfrost-AI. Se trata de un checkpoint BF16 independiente (no un adaptador) que conserva la arquitectura original pero modifica su comportamiento mediante un proceso propietario no distribuido, con el objetivo de ofrecer un asistente más directo y con mayor grado de iniciativa ("high-agency") manteniendo las capacidades de razonamiento, contexto largo y uso de herramientas del modelo base. El repositorio contiene 32 fragmentos SafeTensors, configuración, tokenizador, model card y un kit de despliegue validado en TP4.

Arquitectónicamente es un transformer de mezcla de expertos dispersa (MoE) con 78.103.074.560 parámetros totales y 3.457.573.120 parámetros activos por token, distribuidos en 50 bloques transformer. Cada bloque MoE combina 384 expertos enrutados más un experto compartido, de los que se activan 6 expertos enrutados por token. El patrón de atención alterna ventana deslizante y atención completa en proporción 4:1.

Su relevancia actual radica en que combina una ventana de contexto nativa de 262.144 tokens, razonamiento explícito con esfuerzo configurable y llamadas a herramientas estructuradas, con un coste de inferencia muy inferior al de un modelo denso de tamaño equivalente gracias al enrutamiento disperso. El modelo solo soporta alemán e inglés, y su licencia Apache-2.0 permite uso comercial sin restricciones adicionales más allá de las del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Kolibri1ForCausalLM`, mezcla de expertos dispersa (MoE) |
| Parametros totales | 78.103.074.560 |
| Parametros activos | 3.457.573.120 por token |
| Longitud de contexto | 262.144 tokens nativos y validados por Blackfrost (el modelo base declara hasta 1.048.576 tokens, no cualificado de forma independiente en esta derivación) |
| Tipos de cuantizacion | no disponible (solo se distribuye BF16; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Aleman (de) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors (32 fragmentos), BF16 |
| Bloques transformer | 50 |
| Expertos por bloque MoE | 384 enrutados mas 1 compartido |
| Expertos enrutados por token | 6 |
| Patron de atencion | Ventana deslizante y atencion completa en proporcion 4:1 |
| Huella aproximada de pesos BF16 | 156 GB |
| Tamano del repositorio | 156,2 GB |
| Runtime recomendado | Plugin/contenedor oficial de vLLM de Aleph Alpha |
| Modelo base | Aleph-Alpha/Kolibri-1-BF16 |
| Revision padre inmutable | `8c8b34899c7bc77b349f7916b07158e3ba29456a` |

## Arquitectura y entrenamiento

El modelo es un transformer causal con mezcla de expertos dispersa. Cada uno de los 50 bloques transformer contiene 384 expertos enrutados junto con un experto compartido, y el enrutador activa 6 expertos enrutados por token además del compartido. Esta configuración mantiene un coste computacional por token similar al de un modelo denso de unos 3,5.000 millones de parámetros, mientras que la capacidad total de parámetros asciende a 78.100 millones. La atención usa un patrón híbrido 4:1 entre ventana deslizante y atención completa, lo que reduce el coste del contexto largo en la mayoría de capas y reserva la atención global para una de cada cinco capas.

No se dispone de información sobre el entrenamiento original ni sobre los datos utilizados en esta derivación. La model card indica explícitamente que los pesos han sido modificados a nivel de comportamiento y que el proceso propietario de transformación y los materiales de reconstrucción no se distribuyen, por lo que no es posible auditar qué datos o método se emplearon. Los detalles de arquitectura y entrenamiento del modelo base remiten a la model card de Aleph Alpha y a su informe técnico. No se documenta en esta ficha el uso de RLHF, DPO u otras técnicas de alineación, ni la composición del dataset.

## Capacidades

- Generación de texto conversacional en alemán e inglés.
- Modo de razonamiento explícito con esfuerzo configurable.
- Llamada a herramientas estructurada a través del parser de Kolibri, con llamadas parseadas correctamente en las pruebas de integridad.
- Flujos de dos etapas con herramientas heterogéneas y flujos repetidos o en paralelo.
- Recuperación de información en contexto distante: en las pruebas del autor se recuperaron registros exactos dentro de un contexto de 1.000 registros.
- Memoria multi-turno: se mantuvo el estado solicitado a lo largo de cinco turnos en las pruebas realizadas.
- Ventana de contexto larga de 262.144 tokens para documentos extensos y conversaciones de muchos turnos.
- Capacidad de seguir instrucciones de formato estricto (marcadores de fin exactos y finalización por secciones en las pruebas del autor).
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Atención al cliente automatizada multilingüe (alemán e inglés): el modelo puede gestionar conversaciones multi-turno extensas y mantener el estado del cliente gracias a su ventana de 262.144 tokens y a la memoria multi-turno verificada en las pruebas del autor.
- Análisis de documentación técnica larga: con 262.144 tokens de contexto puede procesar manuales, contratos o expedientes completos en una sola pasada, evitando troceado y pérdida de contexto entre fragmentos.
- Agentes con uso de herramientas: la llamada estructurada a funciones y los flujos de dos etapas con herramientas heterogéneas permiten construir agentes que consultan APIs, bases de datos o servicios externos dentro de un mismo turno.
- Asistentes internos para empresas germanoparlantes: al cubrir alemán e inglés con licencia Apache-2.0, es apto para despliegues corporativos en los que se exige control sobre el modelo y ausencia de restricciones de uso comercial añadidas.
- Extracción y recuperación de información sobre corpus grandes: la recuperación en contexto distante verificada permite localizar registros concretos en conjuntos de datos extensos sin necesidad de un sistema RAG completo.
- Automatización de flujos con salida estructurada: la ausencia de fugas de llamadas a herramientas en texto y de bucles en las pruebas del autor lo hace adecuado para pipelines que consumen JSON o llamadas de función directamente.
- Razonamiento paso a paso con esfuerzo configurable: útil en tareas donde conviene ajustar el coste computacional al aumentar o reducir la profundidad de razonamiento según la dificultad del problema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no presenta ningún resultado de benchmark del modelo base como medición de esta derivación, y que quedan pendientes una evaluación cuantitativa de comportamiento de rechazo, una suite amplia de benchmarks académicos y una suite de regresión multilingüe.

Lo único disponible son dos pasadas de un arnés de integridad de formato largo y herramientas, con estos resultados:

| Area de prueba | Resultado medido |
|---|---|
| Pasadas independientes del arnés completo | 2 |
| Assertions superadas | 74/75 en cada pasada |
| Finalización de secciones de formato largo | 9/9 secciones mas marcador de fin exacto en ambas pasadas |
| Recuperación en contexto distante | Registros exactos solicitados dentro de un contexto de 1.000 registros en ambas pasadas |
| Memoria multi-turno | Estado exacto solicitado a lo largo de cinco turnos en ambas pasadas |
| Flujos de herramientas heterogéneos en dos etapas | 8/8 superados en ambas pasadas |
| Flujos meteorológicos repetidos y en paralelo | 8/8 superados en ambas pasadas |
| Nombres o argumentos de herramienta malformados | 0 observados |
| Fuga textual de llamadas a herramientas | 0 observada |
| Bucles de salida o de llamada a herramienta | 0 observados |

La única assertion fallada en cada pasada fue una petición estricta de al menos 1.000 palabras visibles: ambas respuestas fueron coherentes, completaron cada sección solicitada y emitieron el marcador de fin, pero resultaron más cortas que el umbral. Estos datos son comprobaciones focalizadas de integridad, no un benchmark de capacidades.

## Requisitos de hardware

- Pesos BF16: aproximadamente 156 GB solo para los pesos, sin contar caché KV ni activaciones.
- Inferencia en precisión completa: el kit de despliegue validado por el autor usa TP4, es decir, cuatro GPUs en paralelo de tensor. Con GPUs de 80 GB (H100, A100 80 GB o equivalentes) se cubren los 156 GB de pesos dejando margen para caché KV y activaciones.
- Perfil de GPU recomendado: 4 x H100 80 GB o 4 x A100 80 GB para el perfil validado en TP4. No se documenta un perfil validado en menos GPUs.
- GPU de consumo: no cabe en ninguna GPU de consumo actual, ni siquiera en configuraciones multi-GPU de 24 GB, dado que los pesos BF16 superan los 150 GB. No se han publicado cuantizaciones que permitan reducir la huella.
- Caché KV: no disponible en la documentación. Con 262.144 tokens de contexto y 50 bloques, la caché KV es un factor determinante del consumo de memoria y debe dimensionarse aparte de los pesos.
- Opciones de despliegue: plugin/contenedor oficial de vLLM de Aleph Alpha (runtime recomendado y validado). El repositorio incluye un kit de despliegue validado en `DEPLOYMENT/` con sumas de verificación en `DEPLOYMENT/CHECKSUMS.sha256`. No se documenta soporte para llama.cpp, Ollama, TGI u otros motores.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 156,2 GB, por lo que se necesita espacio en disco o volumen de red equivalente para descargar y servir el checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| KOLIBRI-1-DERISKED-BF16 | 78,1 B | 3,46 B | 262.144 tokens (hasta 1.048.576 sin cualificar) | de, en | Apache-2.0 | Derivación con modificación de comportamiento no distribuida |
| Aleph-Alpha/Kolibri-1-BF16 | 78,1 B | 3,46 B | Misma arquitectura; el autor remite a la model card del padre para el contexto declarado | de, en | Apache-2.0 | Modelo base sin modificar; mismo tokenizador y plantilla de chat |
| Otras alternativas MoE abiertas del mismo orden de tamano | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer una comparación cuantitativa |

La comparación más directa y verificable es con el propio modelo base Kolibri-1-BF16, del que esta derivación hereda arquitectura, tokenizador y plantilla de chat. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otros modelos MoE abiertos de tamano similar.

## Limitaciones y advertencias

- Solo soporta alemán e inglés. No hay soporte documentado de castellano ni de otros idiomas, por lo que su uso en entornos hispanohablantes requeriría validación adicional no disponible.
- Los pesos han sido modificados a nivel de comportamiento mediante un proceso propietario no distribuido. No es posible auditar la naturaleza exacta de la modificación ni reproducirla, lo que limita la trazabilidad para entornos regulados.
- El autor no publica benchmarks académicos ni comparaciones cuantitativas frente al modelo base, por lo que no hay evidencia pública de que la derivación conserve las capacidades del original.
- Riesgo de alucinación: no evaluado en la información disponible. No se ha realizado una evaluación cuantitativa del comportamiento de rechazo.
- Idiomas distintos del alemán e inglés no han pasado ninguna suite de regresión multilingüe.
- El contexto validado por el autor es de 262.144 tokens. La afirmación del modelo base de hasta 1.048.576 tokens no ha sido cualificada de forma independiente en esta derivación, por lo que no debe asumirse.
- En las pruebas de integridad, la única assertion fallada en cada pasada fue una petición estricta de longitud mínima (1.000 palabras visibles), lo que sugiere una tendencia a respuestas más cortas de lo solicitado en tareas de generación larga.
- La observación de comportamiento "más directo y suave" con un mensaje de sistema proporcionado por el operador es cualitativa, no cuantitativa, según el propio autor. La model card aparece truncada en ese punto.
- El repositorio registra 0 descargas y 1 "like" en el momento de la consulta, sin historial de uso en producción conocido.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Aleph-Alpha/Kolibri-1-BF16 antes de un despliegue productivo.
- El despliegue validado requiere cuatro GPUs en TP4, lo que implica un coste de infraestructura elevado y descarta el uso en hardware de gama de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blackfrost-AI/KOLIBRI-1-DERISKED-BF16
- Modelo base Aleph-Alpha/Kolibri-1-BF16: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Informe tecnico de Aleph Alpha: https://aleph-alpha.com/downloads/tech-report.pdf
- Kit de despliegue incluido en el repositorio: `DEPLOYMENT/` (relativo al repositorio del modelo)
- Sumas de verificacion del kit de despliegue: `DEPLOYMENT/CHECKSUMS.sha256` (relativo al repositorio del modelo)
