# abenzerps/Holo4-35B-A3B-GGUF

## Resumen

Holo4-35B-A3B-GGUF es la versión cuantizada en formato GGUF del modelo Hcompany/Holo4-35B-A3B, un modelo de lenguaje y visión (image-text-to-text) de tipo mezcla de expertos (MoE) con 34.660.610.688 parámetros totales y 3.000 millones de parámetros activos por token. Lo publica el usuario abenzerps (Ahmet Benzer) como cuantización comunitaria del modelo original de H Company, empresa con sede en París que liberó la familia Holo4 el 28 de septiembre de 2026 en dos tamaños: 27B denso y 35B-A3B MoE. El modelo está diseñado específicamente para computer use y flujos agénticos: interactúa con software a través de interfaces gráficas, código, MCP y APIs.

La relevancia de esta ficha concreta es práctica: el repositorio ofrece los pesos en cuantizaciones de 4, 5, 6 y 8 bits listas para llama.cpp, además del proyector de visión en F16 necesario para entrada de imagen. Esto permite ejecutar un VLM agéntico de ~35B con solo 3B activos en hardware de consumo, algo que los pesos originales en BF16, FP8 o NVFP4 publicados por H Company no facilitan fuera de GPU de datacenter.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye cifras de benchmarks en texto: la model card remite a una imagen con resultados del modelo original, por lo que en esta ficha no se reproducen números concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) multimodal vision-language; las etiquetas del repositorio incluyen qwen3.5 y qwen3.6, lo que apunta a una base derivada de la familia Qwen, sin confirmacion oficial en la informacion disponible |
| Parametros totales | 34.660.610.688 (aproximadamente 35B) |
| Parametros activos | Aproximadamente 3B por token (variante A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF); el modelo original se publico ademas en BF16, FP8 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), mas proyector de vision mmproj en F16 |
| Modelo base | Hcompany/Holo4-35B-A3B |
| Tipo de relacion con el base | quantized |
| Pipeline | image-text-to-text |
| Fecha de publicacion del repositorio | 2026-09-28 |
| Tamano del repositorio | 131,9 GB |
| Descargas / likes | 0 / 0 |

### Archivos GGUF incluidos

| Cuantizacion | Archivo | Tamano | Notas |
|---|---|---:|---|
| Q4_0 | Holo4-35B-A3B-Q4_0.gguf | 18,4 GB | Cuantizacion Q4 estandar |
| Q4_K_M | Holo4-35B-A3B-Q4_K_M.gguf | 19,7 GB | Opcion equilibrada recomendada por el autor |
| Q5_K_M | Holo4-35B-A3B-Q5_K_M.gguf | 23,0 GB | Opcion Q5 de mayor calidad |
| Q6_K | Holo4-35B-A3B-Q6_K.gguf | 26,6 GB | Opcion de alta calidad |
| Q8_0 | Holo4-35B-A3B-Q8_0.gguf | 34,4 GB | Referencia casi sin perdida |
| Proyector de vision | mmproj-Holo4-35B-A3B-f16.gguf | 858 MB | Necesario para entrada de imagen |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos y capacidad multimodal de entrada de imagen y texto (pipeline image-text-to-text). El ratio de esparsidad es alto: de los aproximadamente 35.000 millones de parametros totales solo unos 3.000 millones se activan por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. El repositorio incluye un proyector de vision independiente en F16, lo que confirma una torre visual separada que se acopla al modelo de lenguaje mediante llama-mtmd-cli.

Holo4 se presenta como la nueva generación de modelos agénticos de H Company y se comercializa junto a la variante densa de 27B y a Holotron4 Nano, una actualización de Holotron 3. Según la información pública de la compañía, el modelo interactúa con software a través de cualquier interfaz disponible: interfaces gráficas de escritorio y web, Android, entornos de ejecución de código, MCP y APIs. Uno de los titulares de prensa recogidos menciona una reducción del 79 % en tokens consumidos al manejar pantallas, código y APIs, aunque no se detalla la metodología de esa medición en la información disponible. No se especifican en la documentación consultada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia (chat_template.jinja) basada en marcadores `<|im_start|>` y `<|im_end|>`.
- Comprensión de imágenes y capturas de pantalla mediante el proyector de visión: descripción de interfaces, lectura de elementos de UI y extracción de información visual.
- Computer use: control e interacción con aplicaciones a través de interfaces gráficas de escritorio, web y Android.
- Uso de herramientas y function calling, con soporte explícito de servidores MCP y APIs como canales de actuación.
- Ejecución de código en entornos sandbox como parte de flujos agénticos.
- Razonamiento multi-paso y workflows largos: el modelo está posicionado para tareas de agente con múltiples pasos encadenados.
- Capacidades multimodales de entrada combinada de imagen y texto (image-text-to-text) en la misma conversación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede recibir capturas de pantalla y decidir la siguiente acción sobre ventanas, menús y formularios, lo que lo hace adecuado para automatizar procesos repetitivos de back office sin necesidad de APIs oficiales de las aplicaciones.
- Agente de navegación web: interpretación de páginas renderizadas como imagen y ejecución de acciones sobre el DOM o mediante entrada sintética, útil para extracción de datos y cumplimentación de formularios en portales sin API.
- Soporte técnico de primer nivel: combinación de lectura de capturas enviadas por el usuario con razonamiento multi-paso para diagnosticar errores de configuración y proponer pasos concretos, usando tool calling para consultar sistemas internos.
- Orquestación de pipelines con MCP: integración como cerebro de un agente que descubre y llama herramientas expuestas por servidores MCP, encadenando llamadas a APIs y validando resultados intermedios.
- Agente de desarrollo asistido: al ejecutar código en sandboxes, puede generar parches, lanzar tests y leer la salida para iterar, integrándose en flujos de CI/CD como paso de verificación automática.
- Pruebas de regresión de interfaz: uso del modelo para recorrer flujos de UI y detectar diferencias visuales o comportamientos inesperados tras un despliegue, aprovechando la entrada de imagen.
- Automatización en Android: al cubrir interfaces móviles, sirve para tareas de QA sobre aplicaciones Android o para asistentes que operan el dispositivo por el usuario.
- Despliegue local con requisitos de privacidad: al existir en GGUF y con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar capturas de pantalla ni datos de cliente a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio incluye una imagen con resultados del modelo original (evaluaciones en tareas de ordenador, flujos largos y servidores de herramientas, según el texto que la acompaña), pero las cifras no están transcritas en la información proporcionada y no se reproducen aquí para no inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia (valores derivados del tamano de los archivos, sin incluir la cache KV ni el proyector de vision):
  - Q4_0: alrededor de 18,4 GB de pesos.
  - Q4_K_M: alrededor de 19,7 GB de pesos.
  - Q5_K_M: alrededor de 23,0 GB de pesos.
  - Q6_K: alrededor de 26,6 GB de pesos.
  - Q8_0: alrededor de 34,4 GB de pesos.
  - Proyector de vision F16: 858 MB adicionales si se usa entrada de imagen.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar Q4_0 y Q4_K_M con margen limitado para contexto; Q5_K_M queda muy justa. Q6_K y Q8_0 no caben en una GPU de 24 GB y requieren particionar entre GPU y CPU, usar dos GPU o emplear memoria unificada (por ejemplo, Apple Silicon con 36 GB o más).
- GPU de datacenter: A100 40/80 GB, H100 y L40S ejecutan cualquiera de las cuantizaciones sin dificultad; para los pesos originales en BF16, FP8 o NVFP4 conviene H100 o hardware con soporte NVFP4.
- Opciones de despliegue: llama.cpp con llama-cli, llama-mtmd-cli (multimodal) y llama-server es la vía soportada por este repositorio; también es importable en LM Studio y en Ollama a partir del GGUF. Para los pesos originales publicados por H Company son preferibles vLLM o TGI.
- Parametros de generacion sugeridos por el autor en el ejemplo incluido: contexto de 4096 tokens (`-c 4096`), 512 tokens de salida, temperatura 0,7 y top-p 0,8. Estos valores son ajustes de ejemplo del comando, no la longitud de contexto maxima del modelo, que no está disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Holo4-35B-A3B (esta cuantizacion GGUF) | ~35B (34.660.610.688) | ~3B | no disponible | GGUF Q4-Q8 + mmproj F16 | Apache 2.0 | Repositorio de comunidad con 0 descargas |
| Holo4-27B (variante densa de la misma familia) | 27B | 27B (denso) | no disponible | BF16, FP8, NVFP4, GGUF de 4 bits | Apache 2.0 | Pesos oficiales de H Company y API |
| Holo4-35B-A3B (pesos originales) | ~35B | ~3B | no disponible | BF16, FP8, NVFP4 | Apache 2.0 | Pesos oficiales de H Company y API |
| Otros agentes de computer use de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento que permitan comparar estas variantes entre si ni con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Es una cuantizacion comunitaria, no oficial: el autor del repositorio es abenzerps, no H Company. Cualquier diferencia de comportamiento respecto al modelo original debe atribuirse a la cuantizacion.
- El perfil del cuantizador registra disputas públicas sobre la fidelidad de otras cuantizaciones suyas (por ejemplo, un comentario negativo en otro repositorio del mismo autor), por lo que se recomienda verificar los checksums (SHA256SUMS) y validar el modelo con un conjunto de evaluación propio antes de usarlo en producción.
- Riesgo de alucinacion: no se han publicado tasas de error; en tareas de computer use un fallo de percepción visual puede derivar en acciones incorrectas sobre sistemas reales, con consecuencias difíciles de revertir.
- Longitud de contexto desconocida: no se especifica la ventana máxima, lo que impide planificar flujos de agente con historiales largos o muchas capturas acumuladas.
- Idiomas soportados no especificados: no se puede asumir un rendimiento homogéneo fuera del inglés sin evaluación previa.
- Sin cifras de benchmarks verificables en el repositorio: la única referencia es una imagen de resultados del modelo original, sin metodología detallada en la información disponible.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los errores estén detectados y corregidos por la comunidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia y los términos del modelo base Hcompany/Holo4-35B-A3B, así como de los datos de entrenamiento, si el uso es comercial.
- Integración multimodal frágil: la entrada de imagen requiere pasar explícitamente el proyector mmproj con llama-mtmd-cli; si se olvida, el modelo no procesará imágenes.
- El uso de un agente con control de escritorio implica riesgos de seguridad operativa: se recomienda ejecutarlo en entornos aislados, con sandbox y permisos mínimos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abenzerps/Holo4-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holo4-35B-A3B
- Revision de la plantilla de chat: https://huggingface.co/Hcompany/Holo4-35B-A3B/commit/508458727831368da85d53a8055c2b0f923ed4f3
- Blog de H Company sobre Holo4: https://huggingface.co/blog/Hcompany/holo4
- Cobertura en Unite.AI: https://www.unite.ai/h-company-releases-holo4-open-weight-models-for-computer-use-agents/
- Cobertura en Toolnavs: https://toolnavs.com/article/2166-holo4-open-weights-computer-use-agent-debuts-27b-model-targets-enterprise-workfl
- Cobertura en AlphaSignal: https://alphasignal.ai/news/h-company-s-holo4-handles-screens-code-and-apis-with-79-fewer-tokens
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
