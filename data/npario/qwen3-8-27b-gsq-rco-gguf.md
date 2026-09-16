# npario/Qwen3.8-27B-GSQ-RCO-GGUF

## Resumen

Este repositorio publica cuantizaciones GGUF del modelo multimodal Qwen/Qwen3.8-27B, generadas con dos técnicas desarrolladas en el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria: GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization). A diferencia de la cuantización uniforme, que aplica un único tipo a todas las matrices de pesos, aquí se asigna un tipo distinto a cada tensor mediante una búsqueda basada en gradientes que reparte la precisión según la sensibilidad de cada tensor, sujeto a un presupuesto de tamaño total.

El problema que resuelve es el de mantener el rendimiento del modelo base en razonamiento, matemáticas y código con ficheros que ocupan entre una quinta y una cuarta parte del tamaño en BF16. La variante IQ3_S (3,50 bits por peso, 11,8 GB) iguala al modelo base en AIME25 (100,00) y LiveCodeBench v6 (85,71) y queda a 0,51 puntos en GPQA-Diamond, según los datos de la model card.

El resultado son ficheros GGUF estándar que se ejecutan sin modificaciones en llama.cpp, Ollama y LM Studio, con un proyector de visión (`mmproj`) en BF16 compartido por todas las cuantizaciones y builds opcionales con la cabeza de Multi-Token Prediction para decodificación especulativa. El repositorio se publica bajo licencia apache-2.0 y, en el momento de la consulta, no registra descargas ni valoraciones. Conviene señalar que la propia model card se presenta explícitamente como una plantilla reutilizable entre releases.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo contiene pesos GGUF del modelo base multimodal Qwen/Qwen3.8-27B y de su proyector de visión; no se detalla la arquitectura interna) |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B), según el recuento de safetensors del modelo base |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF no uniforme, con un tipo por tensor: IQ2_XS (2,50 bpw, 8,4 GB), IQ2_S (2,75 bpw, 9,3 GB), IQ3_XXS (3,00 bpw, 10,1 GB), IQ3_S (3,50 bpw, 11,8 GB); `mmproj` en BF16 (16 bpw, 0,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors solo como referencia del recuento de parámetros del modelo base |
| Variantes adicionales | builds `-mtp` opcionales (unos 0,35 GB más grandes) con la cabeza de Multi-Token Prediction para decodificación especulativa |
| Tarea declarada | image-text-to-text (multimodal, con visión) |
| Tamano del repositorio | 81,4 GB |
| Autor y fecha | npario; creado el 2026-09-15 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base más allá de su naturaleza multimodal: el pipeline declarado es image-text-to-text y el repositorio incluye un fichero `mmproj-Qwen3.8-27B-BF16.gguf` que contiene el codificador de visión y el proyector en BF16, compartido por las cuatro cuantizaciones. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Todos estos datos figuran como no disponibles.

La innovación técnica del release está en el proceso de cuantización post-entrenamiento, no en el entrenamiento. GSQ realiza cuantización escalar de precisión baja aprendiendo conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajación de Gumbel-Softmax, lo que cierra buena parte de la brecha entre cuantización escalar y vectorial en regímenes de 2 a 3 bits manteniendo el formato escalar desplegable en GGUF. RCO, por su parte, resuelve el reparto de tipos de cuantización entre los N tensores bajo un presupuesto de tamaño total: reformula la restricción de presupuesto como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la pérdida de la tarea imponiendo el presupuesto de forma exacta y sin hiperparámetros específicos de la restricción. El resultado combinado es un GGUF con precisión asignada por tensor según su impacto en la pérdida.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` está declarada en el repositorio.
- Procesamiento de imagen y texto (image-text-to-text): requiere cargar el fichero `mmproj` en BF16 junto con la cuantización elegida.
- Razonamiento matemático: evaluado en AIME25, donde la variante IQ3_S reproduce la puntuación del modelo base.
- Razonamiento científico de nivel experto: evaluado en GPQA-Diamond.
- Generación de código: evaluado en LiveCodeBench v6.
- Decodificación especulativa: las builds `-mtp` incorporan la cabeza de Multi-Token Prediction para acelerar la generación en llama.cpp, con pesos idénticos al resto y sin cambios de calidad.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue en infraestructura de inferencia gestionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue de un modelo de 27B en GPU de consumo: con 8,4 GB (IQ2_XS) o 11,8 GB (IQ3_S) de pesos, el modelo cabe en tarjetas de 12 a 16 GB de VRAM, lo que permite ejecutar localmente un modelo multimodal de casi 27.000 millones de parámetros sin recurrir a servidores.
- Asistente multimodal sobre documentos: cargando el `mmproj` en BF16, el modelo puede procesar imágenes y texto en la misma conversación, útil para transcripción razonada de capturas, diagramas o interfaces, con la cuantización IQ3_S como punto de partida recomendado si la calidad es prioritaria.
- Generación de código asistida en local: el modelo base obtiene 85,71 en LiveCodeBench v6 y la cuantización IQ3_S conserva esa cifra, por lo que sirve para autocompletado y generación de fragmentos en entornos donde no se permite enviar código a APIs externas.
- Razonamiento matemático en entornos con recursos limitados: la variante IQ2_S iguala al modelo base en AIME25 según la model card, lo que la hace apta para resolución de problemas paso a paso en máquinas modestas.
- Inferencia de alto rendimiento con decodificación especulativa: las builds `-mtp` añaden 0,35 GB y habilitan la decodificación especulativa en llama.cpp, un escenario útil cuando se sirven muchas peticiones con una sola GPU y el cuello de botella es la generación secuencial de tokens.
- Evaluación y comparación de métodos de cuantización: al publicarse cuatro puntos de bits por peso (2,50, 2,75, 3,00 y 3,50) sobre el mismo modelo base, el repositorio sirve como material para medir la degradación entre niveles y compararlos con las cuantizaciones Unsloth Dynamic del mismo base.
- Distribución de modelos en hardware heterogéneo: empaquetar la versión IQ2_XS (8,4 GB) para portátiles y la IQ3_S (11,8 GB) para estaciones de trabajo permite usar el mismo modelo base con distintos presupuestos de memoria, compartiendo el mismo `mmproj`.
- Integración en aplicaciones de escritorio: al ejecutarse en Ollama y LM Studio, puede embeberse en herramientas locales de escritura, análisis o asistencia técnica sin dependencia de conectividad.

## Benchmarks y rendimiento

La model card describe el protocolo de evaluación (perplejidad en wikitext2, C4 y FineWeb-Edu; media de cinco tareas zero-shot: arc_easy, arc_challenge, hellaswag, winogrande y piqa; recuperación relativa al BF16; y los benchmarks de razonamiento AIME25, GPQA-Diamond y LiveCodeBench v6), pero solo se incluyen cifras concretas para la variante IQ3_S. El resto de valores no están disponibles en la información proporcionada.

| Benchmark | BF16 (modelo base) | GSQ-RCO IQ3_S (3,50 bpw) | Diferencia |
|---|---|---|---|
| AIME25 | 100,00 | 100,00 | 0 |
| LiveCodeBench v6 | 85,71 | 85,71 | 0 |
| GPQA-Diamond | no disponible | no disponible | 0,51 puntos por debajo |
| Perplejidad (wikitext2, C4, FineWeb-Edu) | no disponible | no disponible | no disponible |
| Media zero-shot (5 tareas) | no disponible | no disponible | no disponible |

| Variante | bpw | Tamano | Nota de la model card |
|---|---|---|---|
| IQ2_XS | 2,50 | 8,4 GB | La más pequeña; zero-shot por encima de la referencia BF16 |
| IQ2_S | 2,75 | 9,3 GB | Iguala al modelo base en AIME25 |
| IQ3_XXS | 3,00 | 10,1 GB | Punto de operación sólido y equilibrado |
| IQ3_S | 3,50 | 11,8 GB | Recomendada; sin pérdida medible en la tarea |

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones orientativas derivadas del tamaño de los ficheros de pesos más el sobrecoste habitual de llama.cpp y una caché KV en FP16; la longitud de contexto no está publicada, de modo que no puede calcularse con exactitud el coste de la caché por token.

- VRAM estimada en contexto corto: unos 10 GB para IQ2_XS, 11 GB para IQ2_S, 11,5 GB para IQ3_XXS y 13,5 GB para IQ3_S.
- VRAM estimada en contexto largo: aproximadamente 12 GB, 13 GB, 14 GB y 16 GB respectivamente, con incertidumbre alta por la falta de datos de contexto.
- Visión: sumar 0,9 GB si se carga el `mmproj` en BF16.
- Cabe en GPU de consumo: sí. IQ2_XS e IQ2_S en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070); IQ3_XXS e IQ3_S en tarjetas de 16 GB o más (RTX 4060 Ti 16 GB, RTX 4080, RTX 4090, A4000).
- GPU recomendadas para servicio: A100, H100 o L40S para alto rendimiento y despliegue multi-usuario; RTX 4090 para uso individual con la variante IQ3_S.
- Memoria unificada: los ficheros GGUF son adecuados para Apple Silicon y otras plataformas con memoria compartida, aunque no hay pruebas publicadas en la información disponible.
- Opciones de despliegue confirmadas: llama.cpp, Ollama y LM Studio, según la model card. El repositorio declara `endpoints_compatible`. No se confirma compatibilidad con vLLM, TGI ni SGLang.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada solo permite comparar contra el modelo base en BF16 y contra las cuantizaciones Unsloth Dynamic (UD) del mismo modelo base, que se usan como referencia en la evaluación. No se publican cifras de las UD, por lo que la comparación cuantitativa queda incompleta.

| Alternativa | Parametros | Contexto | Formato | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| GSQ-RCO IQ3_S (este repositorio) | 26,9 B | no disponible | GGUF, 3,50 bpw | apache-2.0 | AIME25 100,00; LiveCodeBench v6 85,71; GPQA-Diamond a 0,51 puntos del base |
| Qwen3.8-27B en BF16 (base) | 26,9 B | no disponible | safetensors | no disponible | Referencia con la que se comparan todas las variantes |
| Unsloth Dynamic (UD) del mismo base | 26,9 B | no disponible | GGUF | no disponible | Se usa como referencia en la evaluación; cifras no disponibles |
| GSQ-RCO IQ2_XS / IQ2_S / IQ3_XXS | 26,9 B | no disponible | GGUF, 2,50 / 2,75 / 3,00 bpw | apache-2.0 | Superan el zero-shot del BF16 (IQ2_XS) o igualan AIME25 (IQ2_S) según la model card |

Otros modelos comparables de la misma categoría o tamaño: no disponible.

## Limitaciones y advertencias

- La model card se presenta explícitamente como una plantilla reutilizable entre releases, con campos marcados `[swap]` para sustituir por cada modelo. Parte del contenido puede ser genérico y no específico de este artefacto concreto.
- Existe una discrepancia de atribución: el repositorio se publica bajo el espacio `npario`, mientras que los banners y enlaces de la model card apuntan a `ISTA-DASLab` y a DASLab. Conviene verificar la autoría antes de citarlo.
- El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- La licencia declarada es apache-2.0 para el artefacto GGUF, pero la licencia del modelo base Qwen/Qwen3.8-27B debe verificarse por separado antes de un uso comercial, ya que no se detalla en la información disponible.
- No hay información sobre idiomas soportados, longitud de contexto ni sesgos conocidos.
- En cuantizaciones de 2,50 a 3,00 bpw, la degradación en tareas no evaluadas (por ejemplo, generación creativa, seguimiento de instrucciones largas o dominios especializados) no está caracterizada. Solo se publican tres benchmarks de razonamiento y generación.
- La puntuación de 100,00 en AIME25 sugiere saturación del benchmark, lo que limita su valor para discriminar entre variantes de cuantización.
- El uso multimodal exige cargar el fichero `mmproj` en BF16 (0,9 GB); sin él, el modelo no procesa imágenes.
- Riesgo de alucinación: no cuantificado en la información disponible. Es un riesgo inherente a los modelos generativos y no se han publicado tasas de error o faithfulness.
- Las builds con `-mtp` añaden 0,35 GB y requieren un runtime compatible con decodificación especulativa en llama.cpp; en otros motores pueden no aportar ventaja.
- El tamaño real del repositorio (81,4 GB) supera la suma de los ficheros listados (unos 40 GB), lo que indica la presencia de variantes adicionales (previsiblemente las builds `-mtp` y activos gráficos). Conviene revisar el listado completo de ficheros antes de descargar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/npario/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de GSQ (Gumbel-Softmax Quantization): https://arxiv.org/abs/2604.18556
- Paper de RCO (Riemannian Constrained Optimization): https://arxiv.org/abs/2605.00649
- Código de GSQ: https://github.com/IST-DASLab/GSQ
- Código de RCO: https://github.com/IST-DASLab/RCO
- Laboratorio DASLab (Institute of Science and Technology Austria): https://github.com/IST-DASLab
