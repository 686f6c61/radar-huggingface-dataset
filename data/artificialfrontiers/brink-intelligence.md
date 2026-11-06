# ArtificialFrontiers/Brink-Intelligence

## Resumen

Brink Intelligence (Arc 5.5) es un paquete de modelos presentado por el usuario ArtificialFrontiers bajo la marca "Brink Intelligence", orientado a tareas de ciberseguridad ofensiva y defensiva, síntesis de código y agentes autónomos que se ejecutan en local sin telemetría en la nube. El repositorio no contiene pesos propios: distribuye enlaces directos a ficheros GGUF alojados en repositorios de terceros (bartowski, Severian, mradermacher) que corresponden a versiones "abliterated" o "heretic" de tres modelos base distintos (Qwen2.5-Coder-0.5B-Instruct, Llama-3.2-1B-Instruct y Llama-3.2-3B-Instruct). No se trata, por tanto, de un modelo entrenado de forma original, sino de una recopilación de artefactos de terceros reagrupados bajo una identidad comercial.

Los tres "motores" anunciados son modelos densos de pequeño tamaño (0.5B, 1B y 3.2B parámetros) con cuantizaciones agresivas (Q4_K_M, Q3_K_M e i1-IQ3_M) que ocupan entre 379 MB y 1,52 GB. La model card menciona capacidades de reconocimiento en vivo con `curl`/`nmap`, evaluación de vulnerabilidades OWASP, generación de código Delphi/Object Pascal con rigor de los currículos sudafricanos CAPS/IEB y un modo "zero-refusal" para pruebas de penetración. La licencia declarada es Apache-2.0, aunque conviene verificar la procedencia real de cada GGUF enlazado.

Su relevancia actual es limitada desde el punto de vista técnico: no hay benchmarks publicados, no hay información sobre datos de entrenamiento ni proceso de ajuste, y el repositorio no incluye pesos propios. Resulta útil únicamente como referencia de un patrón de empaquetado de modelos pequeños "sin censura" para uso local, no como un modelo con prestaciones verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de los modelos base Qwen2.5 y Llama 3.2); no se especifica en la model card |
| Parametros totales | 0,5B (Arc 5.5 Lite), 1B (Arc 5.5 Flash), 3,2B (Arc 5.5 Cyber) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en el ejemplo de `llama-server`; no se declara contexto nativo de los modelos base |
| Tipos de cuantizacion | Q4_K_M (Lite), Q3_K_M (Flash), i1-IQ3_M (Cyber); solo se distribuyen GGUF |
| Idiomas soportados | en |
| Licencia | apache-2.0 (declarada; verificar en cada repositorio de origen) |
| Formato de pesos | GGUF (no se publican safetensors propios) |

## Arquitectura y entrenamiento

No se aporta información sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni si hubo RLHF, DPO o cualquier otra etapa de alineamiento. Los tres motores son, según los enlaces de descarga, versiones "abliterated" o "heretic" de modelos base publicados por terceros: `Qwen2.5-Coder-0.5B-Instruct-abliterated` (bartowski), `heretic_FuseChat-Llama-3.2-1B-Instruct` (Severian) y `Llama-3.2-3B-Instruct-heretic` (mradermacher). Las técnicas de "abliteration" y "heretic" consisten en intervenciones sobre los pesos o la dirección de rechazo para eliminar comportamientos de negativa, no en un reentrenamiento desde cero.

La model card describe un "Sovereign System Prompt" que instruye al modelo a no emitir negativas, guardar código en disco mediante `tool:write <filename>` y ejecutar comandos de terminal para obtener "ground truth". Estas directivas son instrucciones de prompt, no capacidades entrenadas verificables. Tampoco se documenta ninguna innovación técnica propia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y código en inglés, heredada de los modelos base Qwen2.5-Coder y Llama 3.2.
- Síntesis de código orientada a escritura en disco mediante la convención `tool:write <filename>` descrita en la model card.
- Soporte declarado de Object Pascal / Delphi (VCL, consultas ADO parametrizadas, `try...finally FreeAndNil`, arrays 2D, `AssignFile`).
- Ejecución de comandos de terminal (`curl`, `nmap`, inspección DNS) como parte de flujos de reconocimiento, según la model card.
- Evaluación de vulnerabilidades web (OWASP Top 10, HSTS, CSP, X-Frame-Options) descrita en la documentación.
- Modo "zero-refusal" para pruebas de penetración, según la documentación; no verificado de forma independiente.
- Soporte de tool calling / function calling: no disponible de forma explícita; el formato `tool:write` es una convención de prompt, no un protocolo estándar.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Auditoría web automatizada en local: el modelo, ejecutado con `llama-server`, puede recibir la salida de `curl -I` y analizar cabeceras HSTS, CSP y X-Frame-Options para señalar configuraciones débiles, sin enviar datos a la nube.
- Reconocimiento de red en entornos de laboratorio: integrado en un script que invoque `nmap` y pase la salida al modelo para resumir puertos y servicios expuestos, aprovechando su contexto de 2048 tokens.
- Generación de scripts de explotación en entornos controlados: el modo sin negativas permite producir PoCs para prácticas de pentesting, siempre dentro de un marco legal y con autorización expresa.
- Asistencia a estudiantes de IT con currículo CAPS/IEB: generación de programas Delphi con consultas ADO parametrizadas y gestión de memoria con `try...finally`, útil como material de estudio local.
- Automatización de tareas de escritura de ficheros: el patrón `tool:write` permite que un agente pequeño genere scripts completos en disco en lugar de volcarlos en el terminal, adecuado para pipelines ligeros en máquinas con pocos recursos.
- Despliegue en dispositivos de borde o air-gapped: con 379 MB en Q4_K_M, el motor Lite puede ejecutarse en una Raspberry Pi o un portátil antiguo sin conexión, para tareas de clasificación o generación de texto breve.
- Prototipado de agentes autónomos con terminal: combinado con un bucle de ejecución de comandos, sirve para experimentar con arquitecturas de agentes que razonan sobre observaciones reales, aunque con fiabilidad limitada por el tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB para Arc 5.5 Lite (Q4_K_M, 379 MB de pesos), 0,8 GB para Arc 5.5 Flash (Q3_K_M, 659 MB) y 1,8 GB para Arc 5.5 Cyber (i1-IQ3_M, 1,52 GB), incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090 o superiores no aportan ventaja significativa por el tamaño reducido de los modelos. También es viable en CPU.
- Cabe en GPU consumer: sí, en todas las GPU con más de 2 GB de VRAM; también en Apple Silicon y en CPU con 4-8 GB de RAM.
- Opciones de despliegue: `llama-server` (llama.cpp) es el método documentado; también es compatible con Ollama y otras herramientas que acepten GGUF.
- Latencia y throughput: no se proporcionan cifras medidas; la model card menciona "real-time generation TPS" como función de telemetría, pero sin valores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Brink Intelligence Arc 5.5 Lite | 0,5B | 2048 (ejemplo) | apache-2.0 (declarada) | GGUF | Basado en Qwen2.5-Coder-0.5B abliterated |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | 32 768 (nativo del base) | apache-2.0 | safetensors, GGUF | Modelo base original, con benchmarks publicados por Qwen |
| Llama-3.2-1B-Instruct | 1B | 128 000 (nativo del base) | Llama 3.2 Community License | safetensors, GGUF | Modelo base original de Meta |
| Llama-3.2-3B-Instruct | 3,2B | 128 000 (nativo del base) | Llama 3.2 Community License | safetensors, GGUF | Modelo base original de Meta |

La comparación directa con los modelos base resulta más informativa que con alternativas de la misma categoría "sin censura", ya que Brink Intelligence no publica métricas propias y su contexto efectivo en el ejemplo de despliegue (2048 tokens) es muy inferior al nativo de los modelos base.

## Limitaciones y advertencias

- No se publican benchmarks, datos de entrenamiento ni proceso de ajuste; el rendimiento real es el de los modelos base subyacentes, no verificable a partir de la información disponible.
- El repositorio no contiene pesos propios: los GGUF enlazados residen en repositorios de terceros y podrían cambiar, desaparecer o tener licencias distintas a la declarada.
- La licencia Apache-2.0 declarada puede no ser aplicable a los GGUF de Llama 3.2 enlazados, que están sujetos a la Llama 3.2 Community License de Meta; es necesario verificar cada origen antes de un uso comercial.
- El modo "zero-refusal" implica riesgo de generar contenido dañino o ilegal; su uso en producción requiere controles adicionales y un marco legal claro.
- Riesgo elevado de alucinación en tareas de ciberseguridad: modelos de 0,5B-3B pueden inventar resultados de escaneos, vulnerabilidades o comandos incorrectos; la model card insiste en el "ground truth" mediante terminal, pero no hay garantía técnica.
- Contexto efectivo limitado a 2048 tokens en el ejemplo de despliegue, insuficiente para análisis de código extenso o conversaciones multi-turno largas.
- Idiomas: solo inglés; no hay soporte declarado de castellano.
- Sin información sobre sesgos; los modelos base de Qwen y Llama presentan sesgos documentados en sus respectivas model cards.
- La marca "Brink Intelligence" y los nombres "Arc 5.5" no corresponden a un modelo con identidad técnica propia; conviene tratar el repositorio como un índice de artefactos de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArtificialFrontiers/Brink-Intelligence
- Organización: https://huggingface.co/ArtificialFrontiers
- GGUF Arc 5.5 Lite (Qwen2.5-Coder-0.5B-Instruct-abliterated, bartowski): https://huggingface.co/bartowski/Qwen2.5-Coder-0.5B-Instruct-abliterated-GGUF
- GGUF Arc 5.5 Flash (heretic_FuseChat-Llama-3.2-1B-Instruct, Severian): https://huggingface.co/Severian/heretic_FuseChat-Llama-3.2-1B-Instruct-GGUF
- GGUF Arc 5.5 Cyber (Llama-3.2-3B-Instruct-heretic-i1, mradermacher): https://huggingface.co/mradermacher/Llama-3.2-3B-Instruct-heretic-i1-GGUF
- Modelo base Qwen2.5-Coder-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Modelo base Llama-3.2-1B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Modelo base Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- llama.cpp (llama-server): https://github.com/ggerganov/llama.cpp
