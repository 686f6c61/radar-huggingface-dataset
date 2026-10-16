# Knowin-29/EKT-Router

## Resumen

EKT-Router es un proyecto de investigación sobre enrutamiento experto-evidencia para modelos de visión-lenguaje aplicados a preguntas encarnadas (embodied question answering). Lo desarrolla el equipo de Knowin-29 (Weilin Ruan, Yingjie Xu, Yangkai Wei, Bohan Zhou, Shuaibo Li, Harold Haodong Chen, Kaiwen Zhou, Yinchuan Li, Ying-Cong Chen y James Cheng como autor de correspondencia) y se presenta como la primera solución interna de Mixture-of-LoRA (MoL) de la organización.

El sistema propone seleccionar conjuntamente un único experto de capacidad y, opcionalmente, conocimiento o percepción adicional, todo ello bajo un presupuesto de adquisición acotado. La arquitectura declarada combina un backbone compartido Qwen3-VL-8B con tres adaptadores LoRA independientes (General, con pretraining continuado; Spatial Reasoning; y Spatiotemporal), más un descriptor congelado Qwen3-VL-2B que alimenta un enrutador de utilidad. Un verificador de paquetes filtra las evidencias con ganancia predicha positiva tras una única ronda de adquisición.

Es relevante ahora únicamente como referencia metodológica: el repositorio de HuggingFace es un marcador de posición sin pesos ni adaptadores descargables y no es un modelo Transformers cargable. No hay licencia declarada para los pesos, no se promete fecha de publicación y las cifras reportadas (61,4 en seis benchmarks de QA encarnado, 74,7 en diez benchmarks generales de VLM y +1,75 en un control evidence-null de nueve benchmarks) proceden del paper bajo protocolos separados, no de esta publicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-LoRA (MoL) sobre backbone compartido Qwen3-VL-8B; tres adaptadores LoRA (General, Spatial Reasoning, Spatiotemporal); enrutador de utilidad alimentado por descriptor congelado Qwen3-VL-2B; verificador de paquetes |
| Parámetros totales | no disponible (no se publican recuentos; el backbone declarado es Qwen3-VL-8B y el descriptor Qwen3-VL-2B) |
| Parámetros activos | no disponible (por diseño se activa un solo experto LoRA por consulta, pero no se especifica el número de parámetros entrenables de cada adaptador) |
| Longitud de contexto | no disponible (la model card no especifica la ventana de contexto; depende del backbone Qwen3-VL-8B, no declarado) |
| Tipos de cuantización | no disponible (no se publican pesos ni formatos cuantizados) |
| Idiomas soportados | en (inglés, según la etiqueta de idioma de la model card) |
| Licencia | no disponible para los pesos; el código del repositorio se declara bajo licencia MIT, que no cubre pesos no publicados ni modelos de terceros |
| Formato de pesos | no disponible (no hay pesos ni adaptadores publicados; el repositorio es solo una model card) |

## Arquitectura y entrenamiento

La propuesta se articula como un enrutador que, dada una consulta, selecciona simultáneamente un experto de capacidad y evidencia opcional (conocimiento o percepción) bajo un presupuesto de adquisición acotado. El portafolio de expertos son tres adaptadores LoRA independientes sobre un backbone compartido Qwen3-VL-8B: General (pretraining continuado), Spatial Reasoning y Spatiotemporal. Un descriptor congelado Qwen3-VL-2B alimenta el enrutador de utilidad. Tras una única ronda de adquisición, el Packet Verifier conserva únicamente la evidencia con ganancia predicha positiva manteniendo fijo el experto; el experto genera una sola vez y, si toda la evidencia se rechaza, utiliza su entrada original.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones de decodificación, mecanismos de atención alternativos ni esquemas de cuantización. El autor indica explícitamente que los adaptadores General, Spatial Reasoning y Spatiotemporal, el enrutador entrenado, el verificador y las firmas de capacidad no están publicados, y que los materiales del proyecto no incluyen predicciones originales, registros de experimentos completos, manifiestos inmutables de particiones y evaluadores, ni pesos suficientes para reproducir las mediciones del paper. Las demos simuladas en CPU y los tests unitarios se describen como comprobaciones de software, no como evaluación del modelo.

## Capacidades

- Respuesta a preguntas encarnadas (embodied question answering): el sistema está diseñado para responder consultas que requieren razonamiento sobre el entorno físico a partir de entrada imagen-texto.
- Entrada multimodal imagen-texto: el pipeline declarado en HuggingFace es image-text-to-text, heredado del backbone Qwen3-VL.
- Enrutamiento experto: selección de un único experto de capacidad entre tres adaptadores LoRA (General, Spatial Reasoning, Spatiotemporal) por consulta.
- Adquisición selectiva de evidencia: recuperación opcional de conocimiento o percepción bajo un presupuesto acotado, seguida de verificación de ganancia predicha.
- Razonamiento espacial: uno de los adaptadores está dedicado explícitamente a razonamiento espacial.
- Razonamiento espacio-temporal: otro adaptador cubre la dimensión spatiotemporal.
- Mecanismo de respaldo: si el verificador rechaza toda la evidencia, el experto genera usando su entrada original.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseño descrito contempla una única ronda de adquisición y una única generación del experto.
- Capacidades multilingües: limitadas a inglés según las etiquetas del repositorio.
- Capacidades especiales (modo thinking, audio, vídeo): no disponible, salvo la componente espacio-temporal implícita en uno de los adaptadores.

## Casos de uso

- Investigación en enrutamiento experto-evidencia: reproducción y análisis de la metodología Mixture-of-LoRA descrita en el paper, partiendo del código publicado en GitHub, dado que los pesos no están disponibles.
- Investigación en QA encarnado: estudio comparativo de estrategias de selección de evidencia perceptual en tareas de pregunta-respuesta sobre entornos físicos, usando los protocolos descritos para los seis benchmarks de QA encarnado reportados.
- Diseño de sistemas con presupuesto de adquisición acotado: el mecanismo de adquisición bajo presupuesto acotado puede servir de referencia conceptual para pipelines que deciden cuándo merece la pena recuperar información externa antes de generar.
- Evaluación de estrategias de verificación de evidencia: el Packet Verifier y el criterio de ganancia predicha positiva son un punto de partida para estudiar filtrado de contexto recuperado y fallback a la entrada original.
- Reutilización de la técnica de adaptadores LoRA múltiples sobre un backbone compartido: el patrón de tres adaptadores independientes sobre Qwen3-VL-8B es trasladable a otros dominios donde se quiera especializar sin duplicar el coste del modelo base.
- Prototipado sobre Qwen3-VL-8B: dado que el backbone es público, un equipo puede ensayar su propia cartera de adaptadores LoRA inspirada en esta arquitectura, sin depender de los artefactos no publicados de EKT-Router.
- Análisis de limitaciones de despliegue robótico: el propio autor advierte que las comprobaciones de paquetes y el fallback no establecen corrección factual ni seguridad física, por lo que el caso de uso realista es el estudio de dichas limitaciones, no el despliegue autónomo.

## Benchmarks y rendimiento

| Medición reportada | Valor | Protocolo | Estado |
|---|---|---|---|
| QA encarnado (seis benchmarks) | 61,4 | Protocolo específico del paper | Reportado en el paper, no reproducido por la publicación pública |
| Benchmarks generales de VLM (diez benchmarks) | 74,7 | Protocolo específico del paper | Reportado en el paper, no reproducido por la publicación pública |
| Control evidence-null (nueve benchmarks) | +1,75 | Protocolo específico del paper | Reportado en el paper, no reproducido por la publicación pública |

No se dispone de desglose por benchmark (MMLU, HumanEval, GSM8K u otros), ni de resultados de modelos comparables bajo el mismo protocolo, ni de intervalos de confianza o tamaños de muestra. Los resultados de las demos simuladas en CPU y de los tests unitarios no constituyen evaluación del modelo. No se han publicado resultados de benchmarks reproducibles en la información disponible.

## Requisitos de hardware

- VRAM estimada para el backbone Qwen3-VL-8B: en bf16, aproximadamente 16 GB solo para los pesos, más el codificador de visión y la caché KV; en la práctica, del orden de 20-24 GB para contextos moderados. Estimación derivada del número de parámetros del backbone, no de datos publicados por el autor.
- Descriptor congelado Qwen3-VL-2B: aproximadamente 4 GB en bf16. Estimación, no dato publicado.
- Adaptadores LoRA: el coste adicional en memoria de inferencia es bajo (típicamente cientos de MB en bf16 en función del rango), pero no se especifican rangos ni tamaños.
- GPU recomendadas (estimación): A100 40 GB o 80 GB, H100, L40S. Con cuantización de 8 bits podría ajustarse a GPU de 24 GB; en 4 bits, a GPU de 12-16 GB, siempre que se cuantice el backbone con llama.cpp, vLLM o similar.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en bf16 de forma ajustada o con cuantización; en RTX 3090 (24 GB) con condiciones similares. No hay confirmación del autor.
- Opciones de despliegue: no disponible para este modelo concreto, ya que no se publican pesos ni adaptadores. Al estar basado en Qwen3-VL, las vías habituales serían vLLM, TGI o llama.cpp para el backbone, pero la integración del enrutador y del verificador exigiría código propio del repositorio.
- Latencia y throughput estimados: no disponible. Cualitativamente, el diseño añade coste adicional frente a una generación directa, ya que requiere la pasada del descriptor para el enrutamiento, la ronda de adquisición con verificación y una única generación del experto.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| EKT-Router (Knowin-29) | Sistema enrutador MoL | No disponible (backbone Qwen3-VL-8B + descriptor Qwen3-VL-2B + 3 LoRA) | No disponible | No disponible para pesos; MIT para código | Solo model card, sin pesos | 61,4 en seis benchmarks de QA encarnado; 74,7 en diez benchmarks generales de VLM (reportados en paper, no reproducidos) |
| Qwen3-VL-8B | Backbone declarado del sistema | 8 000 millones aprox. (dato del modelo base, no de esta ficha) | No disponible en esta búsqueda | No disponible en esta búsqueda | Modelo base público (no verificado en esta búsqueda) | No disponible en esta búsqueda |
| Qwen3-VL-2B | Descriptor congelado del enrutador | 2 000 millones aprox. (dato del modelo base) | No disponible en esta búsqueda | No disponible en esta búsqueda | Modelo base público (no verificado en esta búsqueda) | No disponible en esta búsqueda |
| Alternativas externas de VLM para QA encarnado | — | — | — | — | — | no disponible |

No se dispone de comparaciones controladas frente a otros sistemas de enrutamiento experto-evidencia ni frente a modelos de visión-lenguaje de tamaño similar bajo el mismo protocolo de evaluación. Las cifras del autor corresponden a protocolos separados y no admiten comparación directa con terceros.

## Limitaciones y advertencias

- No hay pesos ni adaptadores publicados: el repositorio contiene únicamente una model card y no es un modelo Transformers cargable. No es utilizable en producción.
- No se promete fecha de publicación: la propia model card indica que no se garantiza una fecha de lanzamiento y que no se han subido pesos de terceros.
- Licencia de pesos indefinida: la licencia MIT del código no cubre los pesos no publicados ni los modelos de terceros. Sin licencia declarada, no puede asumirse ningún derecho de uso comercial.
- Falta de reproducibilidad: no se incluyen predicciones originales, registros completos de experimentos, manifiestos inmutables de particiones y evaluadores, ni pesos suficientes para reproducir las mediciones del paper.
- Cifras no reproducidas: los valores 61,4, 74,7 y +1,75 son mediciones reportadas en el paper bajo protocolos separados y no han sido verificadas por esta publicación.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos conocidos: no disponible; no se publica ninguna evaluación de sesgo ni de calibración.
- Limitación de idioma: la etiqueta de idioma del repositorio es únicamente inglés (en).
- Contexto y calibración: el autor señala explícitamente que la transferencia de dominio, la robustez y la calibración requieren evaluación independiente.
- Seguridad: las comprobaciones de paquetes y el fallback no establecen corrección factual, seguridad física ni idoneidad para despliegue autónomo en robots.
- Validación de software frente a evaluación de modelo: las demos simuladas en CPU y los tests unitarios son comprobaciones de software, no evaluación del modelo.
- Sin datos de hardware, latencia o throughput publicados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Knowin-29/EKT-Router
- Página del proyecto: https://knowin-29.github.io/KnowinRouter.github.io/
- Código fuente: https://github.com/Knowin-29/EKT-Router
- Data card: https://huggingface.co/datasets/Knowin-29/EKT-Router
- Contacto: rwlinno@gmail.com
- Paper: referenciado en la model card como fuente de la metodología y de las mediciones reportadas; no se proporciona URL en la información disponible.
- Resultados de búsqueda web: las consultas realizadas no han devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a temas sin relación (imágenes de EKT, páginas académicas de terceros, documentación técnica de otras áreas).
