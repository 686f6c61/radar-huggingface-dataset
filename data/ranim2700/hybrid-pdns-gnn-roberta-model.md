# Ranim2700/hybrid-pdns-gnn-roberta-model

## Resumen

El modelo `Ranim2700/hybrid-pdns-gnn-roberta-model` es un sistema de detección de amenazas sobre DNS pasivo (pDNS) presentado por Ranim Ahmad Omar como parte de su tesis de máster. Su nombre completo en la model card es "Hybrid Explainable pDNS Threat Detection Model (RoBERTa + Lifecycle MLP + GAT)", lo que indica una arquitectura híbrida que combina un encoder de lenguaje (RoBERTa), una red MLP orientada a features de ciclo de vida de dominios y una red de atención sobre grafos (GAT) para explotar relaciones entre infraestructuras. No es un modelo generativo ni un asistente conversacional: es un clasificador de seguridad con componente de explicabilidad.

El problema que aborda es el de identificar infraestructura maliciosa (dominios y hosts usados en campañas) a partir de registros de DNS pasivo, un área donde los enfoques clásicos basados en listas de bloqueo sufren ante la rotación rápida de dominios. La propuesta es relevante para equipos de threat intelligence y SOC porque combina señal textual del dominio, señal temporal de su ciclo de vida y señal relacional de grafo,three fuentes que en la práctica se tratan por separado. La explicabilidad declarada en el título apunta a que el analista pueda ver qué componente y qué evidencia pesaron en la decisión.

La información pública disponible es muy escasa: el repositorio figura con 0.0 GB de tamaño, sin descargas ni interacciones, y la model card se limita al título, la licencia MIT y la referencia a la tesis y al dataset asociado. No se han publicado detalles de arquitectura interna, número de parámetros, longitud de contexto, composición del corpus de entrenamiento ni resultados de evaluación. Cualquier cifra que no sea la licencia o el identificador del dataset debe considerarse no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder RoBERTa + MLP de features de ciclo de vida + Graph Attention Network (GAT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dominio de aplicación son cadenas de dominio DNS, no texto libre) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB de tamaño) |

## Arquitectura y entrenamiento

La model card solo identifica los tres bloques del sistema. El primero es RoBERTa, un transformer encoder-only publicado por Meta AI que mantiene la arquitectura de BERT pero con un preentrenamiento optimizado (máscaras dinámicas, eliminación del objetivo de predicción de siguiente frase, lotes mayores y más datos); dentro de este sistema se usaría como codificador de la representación textual del dominio o de sus componentes. El segundo bloque es un MLP que, por el término "Lifecycle" del título, procesa features asociadas al ciclo de vida del dominio (antigüedad, cambios de resolución, patrones temporales), aunque la model card no enumera dichas features. El tercero es una GAT, que propaga información entre nodos de un grafo de infraestructura (por ejemplo, dominios que comparten direcciones IP, nameservers o registros MX) para clasificar cada nodo con contexto relacional.

No hay información publicada sobre el número de tokens de entrenamiento, la composición del corpus, el preprocesamiento de los registros pDNS, la estrategia de fusión de las tres ramas (concatenación de embeddings, stacking o atención conjunta), ni sobre si se aplicó ajuste fino supervisado, regularización o calibración posterior. Tampoco se detalla el mecanismo concreto de explicabilidad (atención, importancia de features por SHAP, pesos de aristas del grafo u otro). El dataset referenciado es `Ranim2700/pdns-malicious-infrastructure-dataset`, pero su tamaño, etiquetado y procedencia no están descritos en la información disponible.

## Capacidades

- Clasificación de infraestructura DNS: el sistema está diseñado para etiquetar dominios o nodos de un grafo como maliciosos o benignos, no para generar texto.
- Codificación textual de dominios: el bloque RoBERTa aporta representaciones contextuales de las cadenas de dominio y de sus componentes.
- Modelado relacional: la GAT permite que la decisión sobre un dominio incorpore la evidencia de dominios conectados en el grafo de infraestructura.
- Features temporales: el bloque de ciclo de vida sugiere el uso de señales de evolución del dominio a lo largo del tiempo.
- Explicabilidad: el carácter "explainable" del modelo indica que expone evidencia o atribuciones que justifican la clasificación, si bien el mecanismo no está documentado públicamente.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, visión ni audio según la información disponible.
- Capacidades multilingües: no disponibles; la entrada esperada son identificadores DNS, no lenguaje natural.

## Casos de uso

- Triaje de alertas en un SOC: el modelo se usaría como clasificador de segunda etapa sobre los dominios que aparecen en alertas de red, aportando una puntuación de riesgo y una atribución de evidencia que el analista pueda revisar antes de escalar el incidente.
- Enriquecimiento de indicadores de compromiso: al integrarse en un pipeline de threat intelligence, cada IOC de tipo dominio recibiría una etiqueta de malicious/benign basada no solo en el texto del dominio sino en su vecindad en el grafo, lo que ayuda a detectar infraestructura aún no incluida en listas públicas.
- Detección de redes de dominio generadas algorítmicamente (DGA) y de túneles DNS: la combinación de señal textual y relacional permite señalar clusters de dominios que comparten patrones de resolución anómalos, un escenario donde los filtros por lista negra fallan por la rotación rápida de nombres.
- Caza de amenazas sobre volcados de pDNS: aplicado por lotes sobre registros históricos, el modelo puede priorizar los miles de dominios nuevos de un período para que el equipo de investigación revise primero los de mayor riesgo, reduciendo el volumen de análisis manual.
- Bloqueo preventivo con revisión humana: la salida del modelo puede alimentar reglas de filtrado en resolutores o firewalls, usando el componente de explicabilidad como justificación documental de cada bloqueo ante auditorías.
- Investigación académica en detección explicable: el repositorio sirve como referencia reproducible para comparar arquitecturas híbridas texto-grafo frente a líneas base en un problema de seguridad, dado que el autor lo publica como material de tesis con comparaciones de referencia.
- Análisis de relaciones entre campañas: el grafo de atención permite agrupar dominios que comparten infraestructura y atribuirles una campaña común, útil en informes de inteligencia y en la atribución de incidentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "baseline comparisons" como parte del material de la tesis, pero no incluye tablas, métricas ni cifras en la página del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se ha publicado el número de parámetros ni el tamaño de los pesos.
- GPU recomendadas: no disponible. Si el componente RoBERTa corresponde a una variante base (en torno a 125 M de parámetros, valor habitual en este tipo de trabajos), la inferencia cabría en GPU de consumo; si se emplea una variante large, el requisito sería mayor. Ninguna de estas estimaciones está confirmada por el autor.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio no publica pesos que permitan medirla.
- Opciones de despliegue: no disponibles. Al tratarse de una arquitectura híbrida con un GAT y un MLP adicionales, requeriría un contenedor de inferencia a medida (PyTorch o PyTorch Geometric) en lugar de servidores estándar como vLLM, TGI u Ollama, que están orientados a modelos transformer generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hybrid-pdns-gnn-roberta-model | no disponible | no disponible | Híbrido texto + grafo + ciclo de vida para pDNS | MIT | Repositorio publicado, sin pesos visibles (0.0 GB) |
| RoBERTa (base, Meta AI) | ~125 M | 512 tokens | Transformer encoder-only de propósito general | MIT | Pesos públicos en HuggingFace |
| BERT (base, Google) | ~110 M | 512 tokens | Transformer encoder-only de propósito general | Apache 2.0 | Pesos públicos en HuggingFace |
| Clasificadores de detección de DGA basados en carácter | no disponible | no aplica | Modelos ligeros sobre cadenas de dominio | variable | Múltiples implementaciones públicas |

La comparación debe leerse con cautela: RoBERTa y BERT son modelos de lenguaje generales que aquí se emplearían como componente, mientras que el modelo descrito es un sistema de clasificación específico de seguridad con módulos adicionales. No se dispone de métricas del modelo de tesis para comparar rendimiento frente a estas alternativas.

## Limitaciones y advertencias

- Ausencia de pesos en el repositorio: el tamaño indicado es 0.0 GB, por lo que no es posible descargar, ejecutar ni verificar el modelo a partir de la información pública.
- Falta de documentación: no hay descripción de datos de entrenamiento, hiperparámetros, protocolo de evaluación ni métricas, lo que impide reproducir o evaluar los resultados.
- Dominio de aplicación restringido: no es un modelo de lenguaje general; no debe utilizarse para generación de texto, resumen ni tareas conversacionales.
- Riesgo de falsos positivos en producción: un clasificador de infraestructura maliciosa puede señalar dominios legítimos, especialmente servicios compartidos, CDN o dominios recién registrados; se recomienda revisión humana antes de aplicar bloqueos.
- Deriva temporal (concept drift): las técnicas de evasión evolucionan rápido; un modelo entrenado sobre un periodo concreto puede degradarse sin reentrenamiento periódico.
- Sesgo y cobertura del dataset: el dataset referenciado no está descrito, por lo que se desconoce su equilibrio de clases, su procedencia geográfica y su representatividad.
- Explicabilidad no verificada: el término "explainable" aparece en el título pero el mecanismo y su fidelidad no están documentados; no debe asumirse que las atribuciones sean causalmente correctas.
- Licencia MIT: permite uso comercial y modificación con atribución y exención de garantía; el autor no ofrece ninguna garantía sobre el rendimiento en producción.
- Idiomas no declarados: irrelevante para texto libre, pero relevante si se espera procesar dominios en escrituras no latinas (IDN), aspecto no cubierto en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ranim2700/hybrid-pdns-gnn-roberta-model
- Dataset asociado: https://huggingface.co/datasets/Ranim2700/pdns-malicious-infrastructure-dataset
- Plataforma HuggingFace: https://huggingface.co/
- Catálogo de modelos de HuggingFace: https://huggingface.co/models
- Introducción a RoBERTa (GeeksforGeeks): https://www.geeksforgeeks.org/machine-learning/overview-of-roberta-model/
