# otherwhere1/XORTRON.CriminalComputing.LARGE.2026.3-mlx-3Bit

## Resumen

XORTRON.CriminalComputing.LARGE.2026.3-mlx-3Bit es una conversión al formato MLX del modelo darkc0de/XORTRON.CriminalComputing.LARGE.2026.3, publicada por el usuario otherwhere1. Se trata de un modelo de generación de texto de gran tamaño, con 122.610.069.504 parámetros totales (unos 122,6 B) según los ficheros safetensors, cuantizado a 3 bits y empaquetado para su ejecución con la librería mlx-lm en versión 0.31.2 sobre hardware Apple Silicon.

La conversión se realizó con mlx-lm a partir del modelo base, y el repositorio ocupa 53,6 GB. El modelo declara soporte para diez idiomas (inglés, francés, alemán, español, italiano, portugués, chino, japonés, ruso y coreano) y se distribuye bajo licencia WTFPL, lo que en la práctica equivale a dominio público sin restricciones de uso. Los tags del repositorio lo identifican como «heretic», «uncensored», «decensored» y «abliterated», es decir, una variante en la que se ha reducido o eliminado el comportamiento de rechazo del modelo original.

Su relevancia es doble: por un lado, permite ejecutar localmente un modelo de escala 120 B en equipos Apple con memoria unificada suficiente gracias a la cuantización a 3 bits; por otro, sirve como material de estudio para investigaciones sobre alineación, mecanismos de rechazo y evaluación de seguridad en modelos abiertos. La model card no documenta arquitectura concreta, datos de entrenamiento ni resultados de evaluación, por lo que cualquier uso en producción exige una validación previa por parte del equipo adoptante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de tipo Mistral (indicado por el tag «mistral» del repositorio; la model card no lo confirma explícitamente) |
| Parámetros totales | 122.610.069.504 (122,6 B) según safetensors |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 3-bit en formato MLX; no se publican otras variantes |
| Idiomas soportados | Inglés, francés, alemán, español, italiano, portugués, chino, japonés, ruso y coreano |
| Licencia | WTFPL |
| Formato de pesos | Safetensors en formato MLX (generado con mlx-lm 0.31.2); no incluye GGUF ni otros formatos |

## Arquitectura y entrenamiento

La model card únicamente describe el proceso de conversión: el modelo base darkc0de/XORTRON.CriminalComputing.LARGE.2026.3 fue transformado a formato MLX y cuantizado a 3 bits con mlx-lm 0.31.2. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. El tag «mistral» del repositorio apunta a una arquitectura transformer de tipo Mistral, pero no hay confirmación documental.

Los tags «heretic», «abliterated», «uncensored» y «decensored» indican que el modelo base ha sido modificado para reducir o eliminar la tendencia a rechazar peticiones. La técnica exacta empleada para esa modificación no está documentada en la ficha disponible. El repositorio ocupa 53,6 GB frente a los aproximadamente 46 GB que ocuparían los pesos puros a 3 bits (122,6 B × 3 bits / 8), diferencia atribuible a metadatos, tokenizador y posibles capas o tensores no cuantizados.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el repositorio incluye el tag «conversational».
- Soporte multilingüe declarado para diez idiomas: en, fr, de, es, it, pt, zh, ja, ru y ko.
- Comportamiento con menor tasa de rechazo: los tags «uncensored», «decensored» y «abliterated» indican que el modelo responde a peticiones que un modelo alineado estándar tendería a declinar. No hay evaluación cuantitativa de este comportamiento.
- Ejecución local en Apple Silicon mediante mlx-lm, con plantilla de chat aplicable a través del tokenizador (apply_chat_template).
- Razonamiento, generación de código, matemáticas, visión, audio, tool calling, function calling y modos de pensamiento explícito: no disponibles. La model card no documenta ninguna de estas capacidades y no se han publicado evaluaciones al respecto.

## Casos de uso

- Investigación sobre alineación y mecanismos de rechazo: el modelo permite estudiar empíricamente cómo se comporta una variante «abliterated» frente a su base alineado, comparando tasas de rechazo y distribución de respuestas en un conjunto controlado de prompts. Es adecuado porque el cambio declarado es precisamente la modificación del comportamiento de negativa.
- Red teaming y evaluación de seguridad: equipos de seguridad pueden usar el modelo como generador de contenido de riesgo dentro de entornos aislados, para calibrar clasificadores y filtros de moderación. Requiere aislamiento de red y registro de resultados.
- Generación de texto multilingüe en diez idiomas: útil para tareas de traducción, paráfrasis o generación de contenido en mercados europeos y asiáticos, aprovechando la cobertura declarada de en, fr, de, es, it, pt, zh, ja, ru y ko.
- Despliegue local en estación de trabajo Apple: un equipo con memoria unificada suficiente puede servir el modelo vía mlx-lm.server para prototipos internos sin enviar datos a servicios en la nube, lo que resulta relevante en entornos con requisitos de confidencialidad.
- Prototipado conversacional y exploración creativa: al no tener filtros de contenido documentados, se emplea en laboratorios de escritura o generación de ficción que abordan temáticas sensibles y que en modelos alineados suelen quedar bloqueadas.
- Banco de pruebas para pipelines de inferencia MLX: sirve como caso de carga de 122,6 B a 3 bits para medir memoria, latencia y estabilidad de mlx-lm en hardware concreto antes de invertir en infraestructura mayor.
- Extracción y reformulación de texto en grandes volúmenes: para tareas de resumen, reescritura o normalización documental en un despliegue on-premise, siempre que se valide previamente la calidad de salida, dado que no existen benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio registra cero descargas y cero «likes» en el momento de la consulta, por lo que tampoco existe validación comunitaria documentada.

## Requisitos de hardware

- Memoria estimada para los pesos: aproximadamente 46 GB solo para las matrices cuantizadas a 3 bits (122,6 B × 3 bits / 8), sobre unos 53,6 GB de repositorio. Con caché KV y overhead, un presupuesto realista de memoria unificada se sitúa en 55-70 GB según la longitud de contexto utilizada.
- Plataforma: MLX está diseñado para Apple Silicon. No es ejecutable directamente en GPU NVIDIA o AMD sin reconversión a otro formato.
- Equipos Apple recomendados: Mac Studio con M2 Ultra o M3 Ultra de 64 GB o más (preferible 192 GB o 512 GB), MacBook Pro con M4 Max de 128 GB. En equipos de 32 GB o 36 GB no cabe.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), ni en una RTX 5090, ni en configuraciones de dos GPU de 24 GB sin reconversión a GGUF y sin una variante cuantizada compatible con llama.cpp o vLLM, que no está publicada.
- Opciones de despliegue: mlx-lm (Python) y mlx-lm.server para una API compatible con OpenAI. Los tags del repositorio mencionan text-generation-inference y endpoints_compatible, pero los pesos en formato MLX no son utilizables directamente por TGI ni por vLLM.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo para ningún equipo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| otherwhere1/XORTRON.CriminalComputing.LARGE.2026.3-mlx-3Bit | 122,6 B | No disponible | WTFPL | Safetensors MLX 3-bit | Conversión del base a 3 bits |
| darkc0de/XORTRON.CriminalComputing.LARGE.2026.3 | 122,6 B (según el modelo derivado) | No disponible | No disponible | No disponible | Modelo base declarado |
| Modelos abiertos de escala ~100-130 B | 100-130 B | 128 k en algunos casos | Varía (licencias de investigación, CC-BY-NC o permisivas) | GGUF, safetensors, AWQ/GPTQ | No verificados en esta consulta |

Nota: los datos de la tercera fila corresponden a información pública general sobre modelos de esa escala y no han sido verificados en la búsqueda asociada a esta ficha. No se dispone de comparativas de rendimiento porque no existen benchmarks publicados del modelo analizado.

## Limitaciones y advertencias

- Ausencia total de documentación de entrenamiento: no se conocen datos, tokens, composición del dataset ni técnicas de alineación, lo que impide auditar sesgos de forma rigurosa.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos, y no mitigado por ningún benchmark publicado ni por métricas de fidelidad.
- Comportamiento «abliterated»: la reducción del comportamiento de rechazo implica una probabilidad elevada de generar contenido dañino, ilegal o éticamente problemático sin advertencia. No debería exponerse a usuarios finales sin una capa de moderación propia.
- Responsabilidad legal del operador: la WTFPL no impone restricciones de uso comercial ni de modificación, pero tampoco exime al usuario de cumplir la normativa aplicable (RGPD, DSA, legislación sobre contenidos ilícitos, etc.).
- Contexto desconocido: al no documentarse la ventana de contexto, no es posible planificar aplicaciones que dependan de conversaciones largas o de documentos extensos.
- Pérdida de calidad por cuantización: los pesos a 3 bits degradan la precisión respecto al modelo base, especialmente en tareas de razonamiento matemático y generación de código, que además no han sido evaluadas.
- Dependencia de plataforma: el formato MLX limita el despliegue a hardware Apple Silicon y al ecosistema mlx-lm; no hay variantes GGUF, AWQ o GPTQ publicadas.
- Sin validación comunitaria: el repositorio registra cero descargas y cero «likes», por lo que no existe evidencia externa de que los pesos carguen correctamente ni de su comportamiento real.
- Nomenclatura potencialmente engañosa: el nombre «CriminalComputing» es una etiqueta del autor y no implica ninguna capacidad, certificación ni propósito legítimo asociado.
- Idiomas declarados sin verificación: la cobertura de los diez idiomas procede de los metadatos, sin evaluaciones multilingües que la respalden; es probable que el rendimiento en coreano, japonés o chino sea desigual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/otherwhere1/XORTRON.CriminalComputing.LARGE.2026.3-mlx-3Bit
- Modelo base declarado: https://huggingface.co/darkc0de/XORTRON.CriminalComputing.LARGE.2026.3
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de MLX: https://github.com/ml-explore/mlx
