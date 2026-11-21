# Project-Bastion/attack-technique-tagger

## Resumen

attack-technique-tagger es un modelo de clasificación de texto multietiqueta desarrollado por Project-Bastion que etiqueta oraciones de informes de amenazas con las técnicas de MITRE ATT&CK que describen. Se trata de un fine-tuning de `cisco-ai/SecureBERT2.0-base`, un modelo de arquitectura ModernBERT especializado en ciberseguridad, y cubre un conjunto cerrado de 50 técnicas ATT&CK. El modelo está pensado como asistente para analistas de CTI (cyber threat intelligence) e ingenieros de detección que necesitan triar informes y mapear su contenido a tácticas y técnicas conocidas.

La relevancia del modelo reside en su enfoque práctico: en lugar de presentarse como una herramienta de automatización, el autor lo publica como una versión experimental (v0.1) con una precisión moderada declarada explícitamente (micro F1 de 0,593 en test sellado), y recomienda usar sus salidas como sugerencias a revisar por un humano. Incluye una implementación ONNX para ejecución local en navegador mediante transformers.js, lo que permite procesar informes confidenciales sin enviar texto a servidores externos.

Con 149,6 millones de parámetros, licencia Apache-2.0 y un pipeline de clasificación de texto, el modelo es ligero y desplegable en hardware modesto. Su limitación principal es que solo reconoce 50 técnicas del conjunto de etiquetas TRAM2 y únicamente en inglés, por lo que no sustituye a un analista ni cubre el catálogo completo de ATT&CK.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), fine-tuning de `cisco-ai/SecureBERT2.0-base` |
| Parametros totales | 149.643.314 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento e inferencia) |
| Tipos de cuantizacion | ONNX fp32 publicado (599 MB); int8 no soportado (cuatro recetas de cuantización dinámica retuvieron solo 91-94% de las decisiones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch), ONNX (fp32) |

## Arquitectura y entrenamiento

El modelo se basa en SecureBERT2.0-base, un transformer encoder de la familia ModernBERT especializado en dominio de ciberseguridad. Sobre él se aplica una cabeza de clasificación multietiqueta con 50 salidas independientes (una por técnica ATT&CK del conjunto TRAM2), activadas mediante sigmoide y entrenadas con entropía cruzada binaria, con un peso de clase positiva elevado a la potencia 0,5 para compensar el desbalanceo. El entrenamiento usó learning rate 6e-5, 12 épocas, longitud máxima 256, precisión bf16 y una única GPU A10G, conservando la época con mejor micro F1 en validación.

La innovación principal está en la formulación de la entrada: cada oración se acompaña de la oración anterior y la siguiente del mismo informe (hasta 300 caracteres de cada una), concatenadas como segundo segmento. Según el autor, añadir este contexto vecino mejoró ligeramente el F1 de validación. Los datos de entrenamiento provienen del corpus TRAM2 del Center for Threat-Informed Defense (Apache-2.0): 19.178 oraciones de 151 informes públicos, de las cuales 4.070 están etiquetadas con al menos una de las 50 técnicas. La partición se hizo por informe (105 entrenamiento, 20 validación, 26 test) para evitar fuga de datos entre splits, y dos técnicas con muy pocos informes se fijaron al conjunto de entrenamiento.

## Capacidades

- Clasificación multietiqueta de oraciones de informes de amenazas contra 50 técnicas MITRE ATT&CK, con probabilidad independiente por técnica.
- Detección de presencia de cualquier técnica ("has any technique") con F1 de 0,730 en test, útil como filtro previo de triaje.
- Uso de contexto vecino (oración anterior y siguiente) para desambiguar técnicas que dependen del flujo del informe.
- Ejecución local en navegador mediante ONNX y transformers.js, sin enviar texto a servidores externos.
- Inferencia en CPU y GPU mediante transformers, con pesos safetensors y ONNX fp32.
- Umbral de decisión configurable (0,2 por defecto, elegido en validación para favorecer el recall) para ajustar el equilibrio precisión/recall.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Triaje de informes CTI: un analista pega las oraciones de un informe y obtiene sugerencias de técnicas ATT&CK que puede revisar, reduciendo el tiempo de mapeo manual sobre los 50 técnicas cubiertas.
- Enriquecimiento de bases de conocimiento de amenazas: procesar por lotes informes públicos para preetiquetar oraciones con técnicas y priorizar la revisión humana en las de mayor confianza.
- Filtro previo en pipelines de detección: usar la salida "has any technique" (F1 0,730) para descartar oraciones sin contenido técnico antes de pasarlas a un analista o a otro modelo más costoso.
- Asistencia a ingenieros de detección: mapear descripciones de comportamiento malicioso a técnicas ATT&CK para localizar reglas de detección existentes o identificar huecos de cobertura.
- Procesamiento de informes confidenciales en local: gracias al demo con transformers.js y ONNX, el texto no sale del dispositivo del analista, adecuado para entornos con restricciones de confidencialidad.
- Integración en herramientas de gestión de casos: como clasificador ligero (149,6 M de parámetros) que sugiere técnicas al abrir un ticket o alerta, con revisión humana obligatoria antes de cerrar el caso.

## Benchmarks y rendimiento

Evaluación en test sellado (26 informes, 2.920 oraciones, 683 con técnica; 48 de las 50 técnicas cubiertas en test):

| Sistema | Micro F1 | Macro F1 | F1 "has any technique" |
|---|---|---|---|
| attack-technique-tagger (este modelo) | 0,593 | 0,537 | 0,730 |
| TF-IDF + regresión logística (mismo split) | 0,536 | 0,496 | 0,672 |
| nanda-rani/TTPXHunter (MIT; umbral ajustado en validación) | 0,296 | 0,243 | 0,499 |

Precisión y recall micro del modelo en test: 0,595 / 0,590. Micro F1 en validación: 0,605 (tres semillas: 0,597, 0,606, 0,596). El promedio de tres semillas puntuó 0,612 en validación (no publicado). El autor advierte que TTPXHunter se entrenó en un corpus distinto (ejemplos de procedimientos ATT&CK) y se ejecutó sin ajuste, por lo que su baja puntuación refleja tanto el cambio de dominio como la calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para los pesos safetensors (149,6 M de parámetros); el archivo ONNX fp32 ocupa 599 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se hizo en una A10G, pero la inferencia cabe en GPUs consumer modestas (GTX 1650, RTX 3050, etc.).
- Cabe en GPU consumer: sí, en cualquier GPU consumer con 2 GB o más de VRAM; también funciona en CPU.
- Opciones de despliegue: transformers (PyTorch, safetensors), onnxruntime y transformers.js (ONNX fp32). No se publica versión int8, por lo que no se recomienda cuantización dinámica.
- Latencia y throughput: no disponibles en la información proporcionada; el demo en navegador descarga una vez los 599 MB del modelo ONNX.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Resultado en test (micro F1) |
|---|---|---|---|---|---|
| attack-technique-tagger | 149,6 M | 256 tokens | 50 técnicas ATT&CK, multietiqueta | Apache-2.0 | 0,593 |
| nanda-rani/TTPXHunter | no disponible | no disponible | 193 clases ATT&CK, multietiqueta | MIT | 0,296 (sin ajuste, dominio distinto) |
| TF-IDF + regresión logística | no aplica | no aplica | Baseline clásico sobre el mismo split | no aplica | 0,536 |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Cobertura limitada: solo 50 técnicas del conjunto TRAM2; las distinciones de sub-técnica se limitan a las presentes en ese conjunto y cualquier otra técnica es invisible para el modelo.
- Precisión moderada: micro F1 de 0,593 en test; se esperan muchas técnicas omitidas y falsos positivos. El autor recomienda explícitamente no usarlo para automatizar decisiones.
- Nivel de oración y contexto limitado: las etiquetas de los informes de entrenamiento son ruidosas y a veces dependen del informe completo, no de una sola oración.
- Test pequeño (26 informes): los números pueden variar con otros estilos de informe, idiomas o malware más reciente.
- Solo inglés: no evaluado en otros idiomas.
- No evaluado en texto que no sea de informes (logs, alertas).
- Cuantización int8 no soportada: las recetas probadas retuvieron solo el 91-94% de las decisiones, por lo que el despliegue requiere los 599 MB en fp32.
- Licencia Apache-2.0 permite uso comercial, pero ATT&CK es una marca de The MITRE Corporation y su uso debe respetar los ATT&CK Terms of Use.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar técnicas con alta confianza a oraciones que no las describen; el umbral de 0,2 favorece el recall a costa de precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Project-Bastion/attack-technique-tagger
- Demo en navegador (transformers.js, ONNX): https://huggingface.co/spaces/Project-Bastion/attack-technique-tagger-demo
- Modelo base: https://huggingface.co/cisco-ai/SecureBERT2.0-base
- Código de entrenamiento: GitHub `Project-Bastion/models`, directorio `scripts/ttp/`
- MITRE ATT&CK (consulta de técnicas): https://attack.mitre.org/techniques/
- Proyecto TRAM (Center for Threat-Informed Defense): https://ctid.mitre-engenuity.org/our-work/tram/
- Modelo comparable TTPXHunter: https://huggingface.co/nanda-rani/TTPXHunter
