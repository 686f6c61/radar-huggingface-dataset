# Openintelligent123/Muse-Glimmer-30B-JANG_6M-CRACK

## Resumen

Muse Glimmer 30B — JANG_6M CRACK es una cuantización en formato MLX del modelo multimodal OsaurusAI/Muse-Glimmer-30B, publicada en Hugging Face por el usuario Openintelligent123. Se trata de un modelo de visión-lenguaje de 29.776.626.688 parámetros (unos 29,8 B) construido sobre un backbone Gemma-3 de 52 capas con atención deslizante y global, más un codificador de percepción para el procesamiento de imágenes. El modelo se sirve mediante el protocolo Onyx-ATEM, que separa el canal de razonamiento del canal de respuesta y expone un esfuerzo de razonamiento configurable (low, medium, high, xhigh, con high por defecto).

La particularidad de esta versión es doble. Por un lado, ha sido «abliterated» mediante el método CRACK (Controlled Refusal Ablation via Calibrated Knockouts), que elimina el comportamiento de rechazo a nivel de pesos manteniendo, según el autor, las capacidades de visión, código, conocimiento, multilingüismo y uso de herramientas. Por otro, está cuantizada con el esquema JANG_6M (atención a 8 bits, MLP a 6 bits) para ejecutarse en Apple Silicon, con un tamaño de repositorio de 27,6 GB (unos 26 GB de pesos).

Su relevancia práctica reside en que combina tres cosas poco habituales en un mismo artefacto: multimodalidad conservada tras la cuantización, razonamiento con esfuerzo controlable desde el system prompt y tool calling agéntico nativo mediante el esquema `<atem:invoke>`. El precio a pagar es explícito: al eliminar los rechazos a nivel de pesos, el modelo responde a solicitudes dañinas con una tasa de cumplimiento muy alta, lo que lo convierte en un artefacto de investigación con riesgos de seguridad considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) con backbone Gemma-3 de 52 capas, atención deslizante y global, y codificador de percepción independiente |
| Parametros totales | 29.776.626.688 (~29,8 B) |
| Parametros activos | No aplica: la información disponible no describe el modelo como MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | JANG_6M (MLX affine, precisión mixta): atención a 8 bits, MLP a 6 bits. Existen variantes JANG_4M y JANG_2D publicadas por separado |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | apache-2.0 (según la model card; véanse las advertencias) |
| Formato de pesos | safetensors (MLX nativo) |
| Modelo base | OsaurusAI/Muse-Glimmer-30B (relación declarada: quantized) |
| Tarea (pipeline) | image-text-to-text |
| Biblioteca | mlx |
| Tamano del repositorio | 27,6 GB |
| Motor de inferencia recomendado | vMLX (soporta visión, overrides de precisión mixta JANG y parsers Onyx-ATEM); alternativa: runtime mlx-vlm con soporte de Muse Glimmer |
| Muestreo recomendado | temperature = 1.0, top_p = 0.95, top_k = 64 |
| Tokens de parada | eos_token_id = [200001, 200008] |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card corresponde a un transformer multimodal con backbone Gemma-3: 52 capas con atención deslizante combinada con atención global, y un codificador de percepción dedicado que se mantiene intacto tras la cuantización. Sobre esa base se despliega el protocolo Onyx-ATEM, que estructura la salida en canales separados de razonamiento y respuesta, permite ajustar el esfuerzo de razonamiento mediante el system prompt (low, medium, high, xhigh; por defecto high) y define un esquema nativo de llamada a herramientas agénticas mediante `<atem:invoke>`.

El autor no publica en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineamiento. El proceso documentado es de posprocesamiento sobre el modelo base en dos ejes: (1) abliteración CRACK, una eliminación del comportamiento de rechazo a nivel de pesos mediante «knockouts calibrados»; y (2) cuantización JANG_6M, un bundle de precisión mixta MLX que asigna 8 bits a atención, embeddings y normalizaciones, y 6 bits al cuerpo denso de las capas MLP. La verificación de capacidades se realizó sobre una suite de 20 prompts leídos manualmente (8 de seguridad y pentesting, 4 de código avanzado, 4 de razonamiento avanzado, 4 de retención de conocimiento), con cero rechazos y cero respuestas incoherentes según el autor.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con esfuerzo controlable desde el system prompt: low, medium, high y xhigh.
- Separación de canal de razonamiento y canal de respuesta final (protocolo Onyx-ATEM).
- Comprensión de imágenes (image-text-to-text) mediante codificador de percepción preservado tras la cuantización.
- Tool calling y function calling nativos con el esquema `<atem:invoke>`.
- Flujos agénticos multi-paso apoyados en el esquema de invocación de herramientas.
- Generación de código, incluyendo estructuras de datos, APIs y scraping asíncrono, según la verificación del autor.
- Razonamiento matemático y problemas verbales multi-paso.
- Razonamiento en dominios técnicos y científicos (biología molecular, arquitectura de software, criptografía básica).
- Cumplimiento de solicitudes en categorías habitualmente rechazadas (comportamiento abliterated).

## Casos de uso

- Asistentes multimodales en local sobre Apple Silicon: el modelo acepta imagen y texto y corre en MLX con unos 26 GB de pesos, lo que permite desplegar un asistente que describe, analiza y razona sobre capturas, diagramas o documentos escaneados sin enviar datos a la nube.
- Automatización de soporte técnico multi-turno: el canal de razonamiento separado de la respuesta final facilita registrar la traza de razonamiento aparte del mensaje entregado al usuario, algo útil para auditar por qué el sistema respondió lo que respondió.
- Pipelines de código asistido: el soporte nativo de tool calling permite conectar el modelo a ejecutores de tests, linters o APIs internas dentro de un flujo de integración continua, con el modelo decidiendo qué herramienta invocar en cada paso.
- Investigación en seguridad ofensiva autorizada: la model card documenta capacidad para explicar escaneo de puertos, inyección SQL, workflows de Metasploit o explotación de desbordamientos de pila, lo que lo hace utilizable en entornos de pentesting con autorización expresa y aislamiento de red.
- Red teaming y evaluación de salvaguardas: al ser un modelo abliterated con una tasa de cumplimiento del 99,5 % en HarmBench, sirve como referencia para medir la robustez de clasificadores de seguridad, filtros de salida y políticas de contenido en otros sistemas.
- Investigación sobre abliteración y cuantización: permite estudiar empíricamente cuánto degrada la eliminación de rechazos a nivel de pesos (el autor reporta −1,1 puntos en MMLU) y qué efecto tiene la precisión mixta en tareas multimodales.
- Análisis de documentación técnica en chino e inglés: con soporte validado en ambos idiomas, encaja en flujos de resumen y extracción sobre manuales, papers o documentación de producto bilingües.
- Prototipado de agentes con razonamiento graduable: ajustar el esfuerzo de razonamiento entre low y xhigh permite al desarrollador intercambiar latencia por profundidad según la tarea, sin cambiar de modelo.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos a través del motor vMLX en paridad de servicio:

| Benchmark | Base (Muse-Glimmer-30B) | CRACK (JANG_6M) |
|---|---:|---:|
| MMLU (57 materias, modo logit) | 82,5 % | 81,4 % |
| HarmBench (categorías de daño, cumplimiento / ASR) | No disponible | 99,5 % (239/240) |

Comparativa entre los distintos niveles de cuantización CRACK publicados por el autor:

| Perfil | Tamano | MMLU (CRACK) | HarmBench |
|---|---:|---:|---:|
| JANG_6M | 26 GB | 81,4 % | 99,5 % |
| JANG_4M | 20 GB | 81,1 % | 99,6 % |
| JANG_2D | 15 GB | 70,7 % | 99,6 % |

Notas metodológicas declaradas por el autor: HarmBench se puntuó con un clasificador estricto que descarta bucles, volcados vacíos o con plantilla y filtraciones de la traza de razonamiento, y se midió sobre 240 comportamientos de las categorías de daño (estándar y contextual), excluyendo copyright. MMLU se midió en modo logit. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar con comparación frente a terceros en la información disponible.

## Requisitos de hardware

- Los pesos ocupan aproximadamente 26 GB en disco (27,6 GB de repositorio completo), y el formato es MLX, por lo que el destino es Apple Silicon con memoria unificada, no GPU CUDA.
- Estimación orientativa: hacen falta al menos unos 32 GB de memoria unificada para cargar los pesos más el codificador de percepción, el contexto y la caché KV. Un Mac con 36 GB o 48 GB es el mínimo razonable; 64 GB o más da margen holgado. Se trata de una estimación a partir del tamaño de los pesos, no de un requisito publicado por el autor.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB de VRAM) en su formato actual: la cuantización es MLX affine y no está pensada para CUDA. Las variantes JANG_4M (20 GB) y JANG_2D (15 GB) reducen el requisito de memoria, pero siguen siendo artefactos MLX.
- Opciones de despliegue: vMLX (recomendado por el autor, con soporte de visión, cuantización de caché KV, reutilización de caché de prefijo, tool calling agéntico y overrides de precisión mixta) y runtimes mlx-vlm con soporte de Muse Glimmer. No hay soporte indicado para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles. No se publican cifras de tokens por segundo ni de tiempo hasta el primer token.
- Aviso de configuración: el autor advierte de que muchos runtimes ignoran `generation_config.json` y `jang_config.json`, por lo que hay que pasar explícitamente temperature = 1.0, top_p = 0.95 y top_k = 64, y mantener ambos tokens de parada en el conjunto de stop.

## Comparativa con modelos similares

No se dispone de datos de benchmarks frente a modelos de terceros, por lo que la comparación se limita a las variantes del mismo autor y al modelo base:

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-JANG_6M-CRACK | 29,8 B | No disponible | 81,4 % | apache-2.0 | MLX, ~26 GB |
| Muse-Glimmer-30B-JANG_4M-CRACK | No disponible | No disponible | 81,1 % | apache-2.0 | MLX, ~20 GB |
| Muse-Glimmer-30B-JANG_2D-CRACK | No disponible | No disponible | 70,7 % | apache-2.0 | MLX, ~15 GB |
| OsaurusAI/Muse-Glimmer-30B (base) | No disponible | No disponible | 82,5 % | No disponible | No disponible |

Comparación con alternativas de otros fabricantes: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de seguridad elevado: el modelo está abliterated y alcanza un 99,5 % de cumplimiento (239/240) en las categorías de daño de HarmBench. Responde a solicitudes dañinas en lugar de rechazarlas, lo que lo inhabilita para despliegues orientados al público general.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible. Al no haber datos sobre composición del dataset de entrenamiento, no es posible evaluar sesgos de representación.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad factual ni de tasa de alucinación. El razonamiento con esfuerzo «xhigh» genera trazas largas, con el consiguiente riesgo de deriva.
- Cobertura lingüística limitada: solo inglés y chino. No hay validación en castellano ni en otras lenguas.
- Longitud de contexto no especificada: no se indica en la información disponible, lo que impide planificar despliegues con documentos largos o conversaciones extensas.
- Evidencia de capacidad limitada: la verificación declarada se basa en 20 prompts leídos manualmente por el propio autor, sin protocolo ciego ni replicación externa.
- Fechas anómalas: la fecha de creación y actualización del repositorio es 2026-09-11, y el repositorio presenta 0 descargas y 0 «likes». Conviene verificar la procedencia y la integridad de los pesos antes de cualquier uso.
- Posible discrepancia de autoría: la página de Hugging Face atribuye el modelo a Openintelligent123, mientras que la model card y los enlaces de variantes apuntan al espacio dealignai. Hay que confirmar qué repositorio corresponde al artefacto real antes de descargar.
- Licencia: la model card declara apache-2.0, pero el backbone se describe como Gemma-3, cuyos términos de uso originales imponen restricciones adicionales. Conviene verificar la cadena de licencias antes de un uso comercial.
- Formato cerrado a MLX: no hay GGUF ni pesos para CUDA, lo que descarta su uso en infraestructura con GPUs NVIDIA sin una conversión previa no soportada oficialmente.
- Configuración frágil: los valores de muestreo deben pasarse explícitamente porque muchos runtimes ignoran los ficheros de configuración, con degradación de salida si no se hace.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Openintelligent123/Muse-Glimmer-30B-JANG_6M-CRACK
- Modelo base: https://huggingface.co/OsaurusAI/Muse-Glimmer-30B
- Variante JANG_4M CRACK: https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_4M-CRACK
- Variante JANG_2D CRACK: https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_2D-CRACK
- vMLX (motor de inferencia recomendado): https://vmlx.net
- Apoyo al desarrollo (Ko-fi del autor): https://ko-fi.com/dealignai
- Paper, blog técnico o repositorio de código del método CRACK o del protocolo Onyx-ATEM: no disponibles en la información proporcionada.
- La búsqueda web realizada no devolvió fuentes relevantes sobre este modelo; los resultados obtenidos no guardan relación con Muse Glimmer ni con OsaurusAI.
