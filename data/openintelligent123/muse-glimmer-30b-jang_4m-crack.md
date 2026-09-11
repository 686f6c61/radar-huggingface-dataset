# Openintelligent123/Muse-Glimmer-30B-JANG_4M-CRACK

## Resumen

Muse-Glimmer-30B-JANG_4M-CRACK es una cuantización de precisión mixta, además de una ablación de pesos, del modelo multimodal OsaurusAI/Muse-Glimmer-30B, un modelo de razonamiento vision-language de 29.776.626.688 parámetros (~29,8 B) construido sobre un backbone Gemma-3 con 52 capas, atención deslizante y global, y un perception encoder para entrada de imagen. El repositorio publicado bajo el identificador Openintelligent123/Muse-Glimmer-30B-JANG_4M-CRACK tiene 21,7 GB y está pensado para ejecutarse en Apple Silicon mediante MLX; la model card hace referencia al autor original dealignai y a su inferenciador vMLX, por lo que se trata de una redistribución del bundle JANG_4M-CRACK más que de un modelo entrenado desde cero por Openintelligent123.

El modelo combina dos transformaciones sobre el modelo base: la cuantización JANG_4M, un bundle afín de MLX con atención en 8 bits y MLP denso en 4 bits, y la ablación CRACK (Controlled Refusal Ablation via Calibrated Knockouts), que elimina la conducta de rechazo a nivel de pesos. Según la model card, la ablación es prácticamente neutra en capacidades: MMLU pasa del 83,2 % en el modelo base al 81,1 % en la variante CRACK, y la tasa de cumplimiento en HarmBench alcanza el 99,6 % (234/235 comportamientos) en las categorías de daño medidas.

Es relevante por dos motivos. Primero, demuestra que un modelo vision-language de ~30 B puede servirse en un portátil Apple Silicon en aproximadamente 20 GB manteniendo visión, razonamiento con esfuerzo configurable (low/medium/high/xhigh) y tool calling agéntico mediante el protocolo Onyx-ATEM. Segundo, ilustra el estado actual de las versiones «abliterated»: alto cumplimiento en peticiones que un modelo alineado rechazaría, con una degradación de conocimiento declarada como dentro del ruido entre ejecuciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) con backbone Gemma-3, 52 capas, atención deslizante + global y perception encoder |
| Parámetros totales | 29.776.626.688 (~29,8 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | JANG_4M (afín MLX de precisión mixta: atención 8 bits, MLP 4 bits). Perfiles alternativos publicados: JANG_6M y JANG_2D |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Modelo base | OsaurusAI/Muse-Glimmer-30B (relación: quantized) |
| Tamaño del repositorio | 21,7 GB |
| Pipeline declarado | image-text-to-text |
| Biblioteca | mlx |
| Protocolo de interacción | Onyx-ATEM (canales separados de razonamiento y respuesta, tool calling `<atem:invoke>`) |
| Sampling recomendado | temperature 1.0, top_p 0.95, top_k 64 |
| Tokens de parada | `eos_token_id = [200001, 200008]` |
| Esfuerzo de razonamiento | low / medium / high / xhigh (por defecto: high) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer multimodal de aproximadamente 29,8 B de parámetros con backbone Gemma-3, 52 capas que alternan atención deslizante y global, y un perception encoder dedicado a la entrada de imagen. Sobre esa base, el bundle incorpora el protocolo de armonización Onyx-ATEM, que separa el canal de razonamiento del canal de respuesta, permite controlar el esfuerzo de razonamiento mediante el system prompt y define un esquema nativo de function calling (`<atem:invoke>`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineación posteriores al preentrenamiento: esos datos no están en la información proporcionada.

El repositorio es una transformación del modelo base en dos ejes. El primero es la cuantización JANG_4M: un bundle afín de MLX con precisión mixta, donde atención, embeddings y capas de normalización se mantienen en alta precisión (atención en 8 bits) y el cuerpo denso del MLP se cuantiza a 4 bits, dando un total de unos 20 GB. El segundo es CRACK (Controlled Refusal Ablation via Calibrated Knockouts), un método a nivel de pesos que suprime el comportamiento de rechazo. La model card afirma que visión, código, conocimiento, multilingüismo (inglés y chino), razonamiento y uso de herramientas se conservan tras la ablación, y respalda la afirmación con una suite de verificación de 20 prompts leída manualmente: 8/8 en seguridad y pentesting, 4/4 en código avanzado, 4/4 en razonamiento avanzado y 4/4 en retención de conocimiento, sin rechazos ni salidas incoherentes. No se documentan innovaciones de decodificación como decodificación especulativa ni mecanismos de atención lineal adicionales.

## Capacidades

- Generación de texto conversacional multi-turno con historial, en modo directo o con razonamiento explícito en canal separado.
- Razonamiento con esfuerzo configurable en cuatro niveles (low, medium, high, xhigh) mediante el system prompt; el valor por defecto es high.
- Comprensión de imagen y texto combinados (pipeline image-text-to-text) gracias al perception encoder heredado del modelo base.
- Generación de código: en la verificación del autor se cubren estructuras de datos (árbol rojo-negro), scraper asíncrono con `aiohttp` y backoff, API FastAPI con JWT y CRUD, y un compilador de expresiones con tokenizador, parser y evaluador.
- Matemáticas y razonamiento multi-paso: demostración de la infinitud de los primos de Euclides, problemas verbales encadenados, diseño de vacunas de ARNm.
- Tool calling y function calling nativo mediante el esquema `<atem:invoke>` del protocolo Onyx-ATEM, orientado a flujos agénticos.
- Multilingüismo limitado a inglés y chino, según los metadatos de idioma del repositorio.
- Conocimiento general verificado en geografía, cálculo, astronomía y literatura.
- Contenido de seguridad ofensiva y pentesting: escaneo de puertos, reverse shells, inyección SQL, keylogging, flujos con Metasploit, ARP spoofing, construcción de phishing y explotación de desbordamiento de búfer de pila (8/8 en la suite del autor).
- Compatibilidad con `generation_config.json` y `jang_config.json`, que fijan los valores de sampling recomendados.

## Casos de uso

- Análisis de documentos con imagen y texto: al ser un modelo vision-language, puede procesar capturas, diagramas o documentos escaneados junto a instrucciones textuales y producir una respuesta razonada en un solo paso, sin necesidad de un OCR externo ni de un pipeline multimodal separado.
- Asistentes de código en local sobre Mac: con ~20 GB de pesos y soporte MLX, permite integrar generación y revisión de código en un portátil Apple Silicon sin depender de APIs en la nube, útil para entornos con requisitos de confidencialidad.
- Agentes con tool calling: el esquema `<atem:invoke>` permite conectar el modelo a funciones externas (búsqueda, ejecución de consultas, llamadas HTTP) en flujos multi-paso, con la traza de razonamiento separada de la respuesta final para facilitar la depuración.
- Razonamiento con coste controlado: en tareas simples se puede fijar el esfuerzo en low o medium para reducir latencia y tokens generados, y subirlo a high o xhigh en problemas de matemáticas o planificación donde la cadena de razonamiento importa.
- Atención al cliente bilingüe inglés-chino: el modelo cubre ambos idiomas de forma validada, lo que permite desplegar un único modelo para bases de usuarios mixtas sin enrutado por idioma. La longitud de contexto no está disponible, por lo que la viabilidad en conversaciones muy largas debe medirse empíricamente antes de producción.
- Investigación en seguridad ofensiva y pruebas de penetración en laboratorio: el modelo responde a peticiones técnicas de explotación sin rechazos, lo que resulta útil en entornos de red team con autorización, siempre bajo control de acceso estricto.
- Evaluación de alineación y robustez: sirve como referencia «abliterated» para comparar tasas de cumplimiento frente a modelos alineados del mismo tamaño, con métricas publicadas de MMLU y HarmBench.
- Procesamiento por lotes en estación de trabajo Apple: el bundle MLX carga los pesos en memoria unificada y permite reutilizar caché de prefijo (según las capacidades declaradas del inferenciador vMLX), lo que abarata tareas repetitivas sobre plantillas largas.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. Las cifras de HarmBench corresponden a la tasa de cumplimiento (ASR) sobre las categorías de daño estándar y contextual (240 comportamientos, copyright excluido por la metodología del autor), evaluadas con un clasificador estricto a paridad de servicio en el motor vMLX. MMLU es el benchmark estándar de 57 materias en modo logit.

| Métrica | Base | CRACK (JANG_4M) |
|---|---:|---:|
| MMLU (57 materias, logit) | 83,2 % | 81,1 % |
| HarmBench (cumplimiento / ASR) | no disponible | 99,6 % (234/235) |

Comparativa entre perfiles de cuantización, todos en variante CRACK:

| Perfil | Tamaño | MMLU | HarmBench |
|---|---:|---:|---:|
| JANG_6M | 26 GB | 81,4 % | 99,5 % |
| JANG_4M | 20 GB | 81,1 % | 99,6 % |
| JANG_2D | 15 GB | 70,7 % | 99,6 % |

Verificación de capacidades declarada por el autor sobre una suite de 20 prompts (lectura manual de las generaciones, sin rechazos ni salidas incoherentes): seguridad y pentesting 8/8, código avanzado 4/4, razonamiento avanzado 4/4, retención de conocimiento 4/4. No se han publicado resultados de benchmarks independientes ni comparaciones con modelos de terceros en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: unos 20 GB de pesos para el perfil JANG_4M, más el coste de la caché KV y del perception encoder. En la práctica se recomienda un Mac con 32 GB de memoria unificada o más; 24 GB puede ser insuficiente con contextos largos o imágenes de alta resolución.
- Perfiles alternativos: JANG_6M ocupa 26 GB y JANG_2D 15 GB, este último con una caída acusada de MMLU (70,7 % frente a 81,1 %).
- GPU: el repositorio está en formato MLX, orientado a Apple Silicon. No se proporciona soporte CUDA, por lo que no se recomienda su uso en A100, H100 o RTX 4090 sin una conversión previa a otro formato, que no está documentada en la información disponible.
- ¿Cabe en GPU de consumo? No en el sentido habitual: requiere memoria unificada de Apple Silicon. Los perfiles de 20-26 GB no caben en GPUs consumer de 8-16 GB, y el formato MLX no está pensado para ellas.
- Opciones de despliegue: vMLX (recomendado por el autor, respeta las precisiones mixtas JANG, la visión y los parsers de razonamiento y herramientas Onyx-ATEM) y runtimes `mlx-vlm` con soporte para Muse Glimmer.
- Ejemplo de carga documentado: `from mlx_vlm import load, generate` con `load("dealignai/Muse-Glimmer-30B-JANG_4M-CRACK")`.
- Latencia y throughput: no disponibles. El repositorio no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | HarmBench (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-JANG_4M-CRACK (este) | ~29,8 B | no disponible | 81,1 % | 99,6 % | apache-2.0 | MLX / Apple Silicon |
| Muse-Glimmer-30B base (OsaurusAI) | ~29,8 B | no disponible | 83,2 % | no disponible | no disponible en la información proporcionada | no disponible |
| Muse-Glimmer-30B-JANG_6M-CRACK | ~29,8 B | no disponible | 81,4 % | 99,5 % | apache-2.0 | MLX / Apple Silicon |
| Muse-Glimmer-30B-JANG_2D-CRACK | ~29,8 B | no disponible | 70,7 % | 99,6 % | apache-2.0 | MLX / Apple Silicon |

No se dispone de datos verificables sobre modelos de terceros comparables (mismo tamaño, misma tarea o mismo formato MLX) en la información proporcionada, por lo que no se incluye comparación externa.

## Limitaciones y advertencias

- El modelo ha sido ablacionado a nivel de pesos mediante CRACK para suprimir el comportamiento de rechazo. Esto implica que puede generar contenido dañino, operativo y detallado en categorías de seguridad ofensiva, y que la tasa de cumplimiento en HarmBench es del 99,6 %. Es una elección deliberada del autor, no un defecto, pero condiciona por completo su uso en producción: no debe exponerse a usuarios finales sin filtros externos.
- Riesgo de alucinación: la model card no documenta mediciones de factualidad ni de tasa de alucinación. La verificación de conocimiento se limita a 4 prompts, lo que no permite extrapolar robustez factual.
- El borrado de rechazos puede afectar a la calibración de la incertidumbre y a la utilidad en dominios donde un «no lo sé» es la respuesta correcta; no hay datos publicados al respecto.
- Idiomas: solo inglés y chino están declarados y validados. No hay evidencia de rendimiento en castellano ni en otras lenguas.
- Longitud de contexto: no disponible. Es un dato crítico para evaluar despliegues con documentos largos o conversaciones multi-turno extensas.
- Restricciones de licencia: apache-2.0 permite uso comercial, modificación y redistribución, pero la licencia del modelo base OsaurusAI/Muse-Glimmer-30B no se especifica en la información proporcionada; conviene verificarla antes de un uso comercial, ya que el modelo derivado hereda las obligaciones del original.
- Problemas de sampling en producción: el autor advierte de que muchos runtimes ignoran `generation_config.json` y `jang_config.json`, caen en ausencia de filtro `top_k` y degradan la salida. Es obligatorio pasar explícitamente temperature 1.0, top_p 0.95 y top_k 64, y mantener ambos tokens de parada (`200001`, `200008`).
- Dependencia de plataforma: formato MLX exclusivamente, sin soporte CUDA documentado. Fuera del ecosistema Apple Silicon el modelo no es directamente utilizable sin conversión.
- Trazabilidad: el repositorio tiene 0 descargas y 0 «me gusta», y su autor (Openintelligent123) no coincide con el autor de la model card (dealignai), lo que sugiere una redistribución. Los pesos no proceden de un canal verificado por el autor original.
- Fecha de creación del repositorio: 2026-09-11, según la API de HuggingFace. Es una fecha anómala que conviene contrastar antes de citar el modelo en un contexto con requisitos de reproducibilidad.
- La model card está truncada en la sección «About CRACK», que corta la descripción del método en la palabra «removing». No hay documentación completa del procedimiento ni de sus hiperparámetros.
- Los resultados de benchmarks proceden del autor del método, no de una evaluación independiente. MMLU con una caída de 2,1 puntos se describe como dentro del ruido entre ejecuciones, pero no se publican intervalos de confianza ni número de repeticiones.

## Enlaces

- HuggingFace (repositorio de este modelo): https://huggingface.co/Openintelligent123/Muse-Glimmer-30B-JANG_4M-CRACK
- Modelo base: https://huggingface.co/OsaurusAI/Muse-Glimmer-30B
- Perfil JANG_6M-CRACK: https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_6M-CRACK
- Perfil JANG_4M-CRACK (referencia del autor original): https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_4M-CRACK
- Perfil JANG_2D-CRACK: https://huggingface.co/dealignai/Muse-Glimmer-30B-JANG_2D-CRACK
- vMLX, inferenciador MLX recomendado por el autor: https://vmlx.net
- Apoyo al desarrollo del autor original: https://ko-fi.com/dealignai

Nota sobre la búsqueda web: los resultados devueltos corresponden a herramientas de test de velocidad de internet y a sitios de quizzes (minhaconexao.com.br, speedtest.mybroadband.co.za, quizz.biz), sin relación alguna con el modelo. No se han encontrado en la búsqueda enlaces relevantes adicionales: papers, blogs, repositorios o demos no están disponibles.
