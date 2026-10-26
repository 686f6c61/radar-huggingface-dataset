# OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion-GGUF

## Resumen

KAT-Ornith-HERO-35B-A3B-Fusion-GGUF es una cuantización en formato GGUF (Q5_K_M) del modelo fusionado OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion, publicada por el usuario OliviaRossi. Se trata, por tanto, de un artefacto de distribución y no de un modelo entrenado desde cero: la model card indica únicamente que la conversión se realizó con llama.cpp y que el checkpoint resultante se reparte en 10 archivos GGUF estándar (split GGUF), con un total de 24,7 GB en el repositorio.

El modelo subyacente cuenta con 34.660.610.688 parámetros (unos 34,66 mil millones según los safetensors del modelo base) y lleva las etiquetas "merge" y "qwen", lo que apunta a una fusión de pesos derivada de la familia Qwen. El sufijo "A3B" del nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 3 mil millones de parámetros activos por token, pero este dato no está confirmado en la información disponible y debe tratarse como no verificado.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de ~35B con cuantización de 5 bits en entornos locales mediante llama.cpp u Ollama, sin necesidad de infraestructura de GPU de gran tamaño. Ahora bien, el repositorio no incluye licencia declarada, idiomas soportados, longitud de contexto ni evaluación alguna, y acumula 0 descargas y 0 likes, por lo que su adopción en producción exige verificación previa por parte del equipo que lo evalúe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion. El nombre y las etiquetas ("merge", "qwen") sugieren un transformer con mezcla de expertos, sin confirmar |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | No disponible. El sufijo "A3B" del nombre sugiere ~3 B activos, sin confirmar |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo Q5_K_M en esta publicacion (GGUF, dividido en 10 archivos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF Q5_K_M, split GGUF de 10 partes (`*-of-00010.gguf`) |
| Tamano del repositorio | 24,7 GB |
| Modelo base | OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion |
| Herramienta de conversion | llama.cpp, con `--no-mtp` (bloque MTP/NextN omitido) |
| Compatibilidad declarada | `endpoints_compatible`, `conversational` |
| Fecha de publicacion | 2026-10-26 (ultima actualizacion: 2026-10-26) |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna ni el proceso de entrenamiento. Lo unico verificable es que el modelo base es una fusión de pesos (etiqueta "merge") con ascendencia Qwen y 34,66 B de parámetros totales, y que la conversión a GGUF se hizo con llama.cpp excluyendo el bloque MTP/NextN del checkpoint original mediante la opción `--no-mtp`. No se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento.

La consecuencia técnica más relevante de ese `--no-mtp` es que el GGUF no conserva la cabeza de predicción multi-token, de modo que no se puede explotar decodificación especulativa basada en MTP con este artefacto. Tampoco hay información sobre atención lineal, ventana deslizante, número de expertos, política de enrutamiento ni sobre las recetas de fusión aplicadas (por ejemplo, si fue un merge lineal, SLERP o TIES), lo que impide reproducir el modelo o auditar su procedencia.

## Capacidades

- Generación de texto conversacional: es la única capacidad declarada de forma explícita mediante la etiqueta `conversational` del repositorio.
- Ejecución local en CPU y GPU: al estar en GGUF, el modelo es compatible con el ecosistema llama.cpp, lo que incluye inferencia mixta CPU/GPU.
- Capacidades inferidas del modelo base (no verificadas): razonamiento, generación de código, matemáticas y multilingüismo, si la fusión conserva las habilidades de la familia Qwen de la que deriva.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no documentadas; las etiquetas del repositorio no incluyen `image-text-to-text` ni similares.
- Modo "thinking" o razonamiento explícito: no documentado.
- Idiomas: sin listado oficial; no se puede afirmar soporte de castellano más allá de lo que herede del modelo base.

## Casos de uso

- Asistente conversacional autoalojado: el formato GGUF Q5_K_M permite desplegar un modelo de ~35 B en servidores propios con llama-server u Ollama, sin depender de APIs externas, útil cuando la confidencialidad de las conversaciones es un requisito.
- Procesamiento por lotes en hardware modesto: al estar cuantizado a 5 bits, el modelo puede ejecutarse en configuraciones de 24-48 GB de VRAM o con offload parcial a CPU, lo que abarata tareas de resumen y reescritura de documentos a gran escala frente a un modelo denso equivalente en FP16.
- Sustitución de modelos de mayor tamaño en prototipado: si se confirma la arquitectura MoE con ~3 B activos, el coste por token sería el de un modelo pequeño, lo que lo hace adecuado para iterar rápidamente en pruebas de concepto de generación de texto.
- Generación de código en entornos con aislamiento de red: para equipos que no pueden enviar código a servicios en la nube, el GGUF puede integrarse en asistentes locales (por ejemplo, extensiones que hablan con un endpoint compatible con la API de OpenAI, dada la etiqueta `endpoints_compatible`).
- Base para evaluación de fusiones de modelos: investigadores que estudien técnicas de model merging pueden usar este artefacto como referencia cuantizada del modelo base, comparando su comportamiento con el checkpoint original en safetensors.
- Experimentación educativa con cuantización GGUF: el repositorio ilustra el flujo completo de conversión con llama.cpp y particionado en 10 archivos, incluido el proceso de reunificación con `llama-gguf-split --merge`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y tampoco se aportan métricas de perplejidad de la cuantización Q5_K_M frente al modelo base en safetensors.

## Requisitos de hardware

- VRAM estimada para los pesos: Q5_K_M implica aproximadamente 5,5 bits por peso; con 34,66 B de parámetros, los pesos ocupan del orden de 23,8 GB, coherente con los 24,7 GB del repositorio.
- VRAM práctica: hay que sumar caché KV y overhead del runtime; con contexto moderado se recomienda contar con 28-32 GB disponibles, y 40 GB o más para contextos largos o procesamiento por lotes.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB, A6000 48 GB o L40S 48 GB ejecutan el modelo completo en VRAM con margen para contexto.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda al límite y no admite los ~24 GB de pesos más caché KV; sería necesario recurrir a una cuantización inferior (no publicada en este repositorio) o a offload parcial a CPU, con la consiguiente pérdida de velocidad.
- Configuraciones multi-GPU: 2x RTX 4090/3090 (48 GB agregados) permiten repartir el modelo con llama.cpp.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama (importando el GGUF tras unificar las partes), LM Studio y text-generation-webui. vLLM solo con soporte GGUF experimental; TGI no está orientado a ficheros GGUF.
- Manejo del split: es obligatorio descargar los 10 archivos `*-of-00010.gguf` en la misma carpeta y apuntar al primero, o unificarlos con `llama-gguf-split --merge` antes de importarlos en herramientas que no soporten split GGUF.
- Latencia y throughput: no disponibles. Si se confirmase la arquitectura MoE con ~3 B activos, la velocidad por token se acercaría a la de un modelo de ese tamaño, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAT-Ornith-HERO-35B-A3B-Fusion-GGUF (este) | 34,66 B | No disponible (¿~3 B?) | No disponible | No disponible | GGUF Q5_K_M, 0 descargas |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 32 768 tokens nativos (131 072 con YaRN) | Apache 2.0 | Pesos safetensors y multiples GGUF de la comunidad |
| Qwen2.5-32B | 32,8 B | Denso (32,8 B) | 131 072 tokens | Apache 2.0 | Safetensors y GGUF oficiales |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 768 tokens | Apache 2.0 | Safetensors y GGUF de la comunidad |

Los datos de los modelos comparados provienen de sus especificaciones públicas; los de este modelo figuran como no disponibles salvo los parámetros totales. La diferencia más relevante para producción no es de rendimiento, sino de trazabilidad: los tres alternativos tienen licencia explícita, contexto documentado y evaluaciones publicadas, mientras que este repositorio no ofrece ninguno de esos tres elementos.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial; hay que contactar con el autor o consultar el modelo base antes de cualquier despliegue productivo.
- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base en safetensors, por lo que se desconoce la degradación introducida por la cuantización Q5_K_M y por la propia fusión.
- Procedencia opaca del merge: se desconoce qué modelos se fusionaron, con qué proporciones y si sus licencias son compatibles con la redistribución.
- Contexto desconocido: sin ventana documentada no se puede dimensionar la caché KV ni garantizar el comportamiento en conversaciones largas.
- Idiomas no documentados: no hay garantía de calidad en castellano; debe evaluarse empíricamente antes de usarlo con usuarios finales.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado en este caso; la fusión de pesos puede además producir respuestas incoherentes o mezcla de estilos si los modelos de origen eran divergentes.
- Pérdida del bloque MTP/NextN: al convertirse con `--no-mtp` no se dispone de decodificación especulativa nativa, lo que limita la optimización de latencia.
- Fricción operativa del split GGUF: desplegar solo un archivo de los 10 provoca errores; hay que automatizar la descarga completa y la unificación.
- Señales de adopción nulas: 0 descargas y 0 likes en el momento de la consulta implican ausencia de validación por parte de la comunidad.
- Fecha de publicación anómala (2026-10-26): conviene verificar la integridad de los archivos y el hash antes de confiar en el artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/KAT-Ornith-HERO-35B-A3B-Fusion
- llama.cpp (herramienta de conversión y `llama-gguf-split`): https://github.com/ggml-org/llama.cpp
