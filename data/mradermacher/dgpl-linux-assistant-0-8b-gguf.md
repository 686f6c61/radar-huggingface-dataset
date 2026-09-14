# mradermacher/dgpl-linux-assistant-0.8b-GGUF

## Resumen

dgpl-linux-assistant-0.8b-GGUF es la versión cuantizada en formato GGUF del modelo dgpl/dgpl-linux-assistant-0.8b, publicada por mradermacher, un autor conocido por generar cuantizaciones estáticas de modelos abiertos. Se trata de un modelo pequeño, de 752.393.024 parámetros (aproximadamente 0,75 mil millones), especializado en tareas de administración de sistemas Linux: etiquetas como `linux`, `devsecops`, `terminal-copilot` y `sysadmin` describen su dominio objetivo. El repositorio incluye doce cuantizaciones distintas, desde Q2_K (0,5 GB) hasta f16 (1,6 GB), pensadas para ejecución local en CPU o GPU de gama baja.

El modelo base está etiquetado con `qwen`, lo que indica que deriva de la familia Qwen, aunque la model card no especifica la arquitectura exacta ni la longitud de contexto. Está entrenado únicamente en inglés y se distribuye bajo licencia GPL-3.0, un detalle relevante porque impone obligaciones de copyleft a cualquier producto derivado. La relevancia actual del modelo radica en su tamaño: permite desplegar un asistente de terminal totalmente offline, sin enviar comandos ni rutas de sistema a servicios en la nube, algo crítico en entornos de producción y auditoría.

Al ser una cuantización, esta ficha describe principalmente el artefacto GGUF y su uso práctico; los detalles de entrenamiento, dataset y evaluación del modelo original no están publicados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; la etiqueta `qwen` indica que deriva de la familia Qwen (transformer decoder-only) |
| Parametros totales | 752.393.024 (aproximadamente 0,75B) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base usa safetensors |
| Parametros del repositorio | mradermacher/dgpl-linux-assistant-0.8b-GGUF |
| Modelo base | dgpl/dgpl-linux-assistant-0.8b |
| Tamaño del repositorio | 7,5 GB |
| Libreria declarada | transformers |
| Fecha de publicacion | 2026-09-14 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card de esta cuantización no aporta información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La única pista estructural es la etiqueta `qwen` en el repositorio, que sugiere una base de la familia Qwen, y la etiqueta `conversational`, que indica que el modelo está ajustado para diálogo multi-turno. El número de parámetros (752 millones) es coherente con un modelo pequeño de tipo decoder-only con vocabulario amplio.

La innovación destacable no está en el modelo en sí, sino en el trabajo de cuantización: mradermacher publica cuantizaciones estáticas (no ponderadas con imatrix) mediante el pipeline de conversión de HuggingFace, con `quantize_version: 2` y `output_tensor_quantised: 1`. Se ofrecen doce variantes para cubrir el espectro entre 0,5 GB y 1,6 GB, lo que permite desde despliegues en dispositivos con pocos recursos hasta ejecución en precisión f16. El autor indica que no tiene previsto publicar cuantizaciones ponderadas con imatrix para este modelo.

## Capacidades

- Asistencia en línea de comandos Linux: generación y explicación de comandos de shell, según las etiquetas `linux` y `terminal-copilot` del repositorio.
- Tareas de administración de sistemas: gestión de usuarios, permisos, servicios, paquetes y ficheros de configuración (etiqueta `sysadmin`).
- Seguridad y DevSecOps: apoyo en tareas de endurecimiento, revisión de configuraciones y análisis de prácticas de seguridad (etiqueta `devsecops`).
- Conversación multi-turno: el modelo está etiquetado como `conversational`, por lo que se espera que soporte diálogos con historial.
- Generación de texto en inglés como capacidad base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño de 0,75B limita el razonamiento complejo.
- Capacidades multilingües: limitadas al inglés; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Copiloto de terminal totalmente offline: el modelo se ejecuta en local mediante llama.cpp u Ollama a partir de un fichero GGUF de 0,6 GB, de modo que el operador no envía rutas, nombres de host ni contenido de logs a ningún servicio externo. Es adecuado para entornos con requisitos estrictos de confidencialidad.
- Generación de scripts de automatización: a partir de una descripción en inglés, el modelo puede producir borradores de scripts Bash o fragmentos de playbooks de Ansible, que el administrador revisa antes de ejecutar. El tamaño reducido permite integrarlo en un editor o en un hook de terminal.
- Explicación de comandos y errores: pegar la salida de `systemctl status`, `journalctl` o `dmesg` y pedir una interpretación en lenguaje natural. El modelo está especializado en dominio Linux mediante ajuste fino, lo que mejora la terminología frente a un modelo generalista del mismo tamaño.
- Auditoría de configuración y DevSecOps: revisión de ficheros como `sshd_config`, reglas de `iptables`/`nftables` o políticas de SELinux, con sugerencias de endurecimiento. Encaja en pipelines de revisión previa a despliegue donde se necesita una comprobación rápida y local.
- Asistente embebido en imágenes de contenedor: dado el tamaño de 0,5-0,7 GB en cuantizaciones Q4/Q5, el modelo puede incluirse en una imagen Docker junto a una herramienta CLI para ofrecer ayuda contextual sin dependencia de red.
- Formación y soporte a desarrolladores junior: explicaciones paso a paso de conceptos de administración de sistemas y de comandos concretos, en inglés, con coste cero de inferencia y sin telemetría.
- Triaje en pipelines de CI/CD: generación de diagnósticos preliminares a partir de trazas de compilación o despliegue. Es viable por su baja latencia y su capacidad de ejecutarse en el mismo runner sin GPU dedicada, aunque requiere validación humana de las sugerencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de la cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y el repositorio del modelo base tampoco se detalla en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más 0,2-0,5 GB de sobrecarga por caché KV y runtime en contextos cortos. Q2_K y Q3_K: unos 0,7-1,0 GB. Q4_K_M e IQ4_XS: unos 0,9-1,2 GB. Q8_0: unos 1,2-1,5 GB. f16: unos 2,0-2,5 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; por ejemplo GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100. En las GPU de gama alta el modelo queda limitado por el ancho de banda de memoria y no por la capacidad de cómputo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas con memoria compartida suficiente. También es viable en CPU pura.
- Despliegue: llama.cpp, Ollama (la etiqueta `ollama` está declarada en el repositorio), LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con GGUF. Para los pesos originales en safetensors, la librería declarada es transformers. El soporte de GGUF en vLLM es experimental y no está confirmado para este modelo.
- Latencia y throughput: no se publican mediciones. Con 0,75B parámetros en Q4_K_M sobre CPU moderna se puede esperar una generación interactiva en el rango de decenas de tokens por segundo, y muy superior en GPU; se trata de una estimación orientativa por tamaño, no de un dato medido.
- Almacenamiento: entre 0,5 GB (Q2_K) y 1,6 GB (f16) por fichero; el repositorio completo ocupa 7,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| dgpl-linux-assistant-0.8b (este) | 752 M | No disponible | GPL-3.0 | Asistente Linux/sysadmin/devsecops, solo inglés | GGUF (12 cuantizaciones) y pesos base |
| Qwen3-0.6B (familia de la que probablemente deriva) | 752 M (0,6B sin embeddings) | 32.768 tokens (según su model card pública) | Apache-2.0 | Modelo generalista multilingüe con modo thinking | Pesos safetensors, GGUF, múltiples proveedores |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Asistente generalista multilingüe | Safetensors, GGUF, Ollama |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens | Apache-2.0 | Asistente generalista en inglés | Safetensors, GGUF |
| SmolLM2-360M-Instruct | 362 M | 8.192 tokens | Apache-2.0 | Asistente generalista compacto | Safetensors, GGUF |

Nota: los datos de los modelos comparativos proceden de sus model cards públicas y no de la información proporcionada en esta ficha; deben verificarse antes de tomar decisiones de producción. La ventaja diferencial de este modelo es la especialización en dominio Linux y su licencia GPL-3.0, que es a la vez su principal restricción frente a las alternativas con licencias permisivas.

## Limitaciones y advertencias

- Riesgo operativo elevado: un modelo de 0,75B puede generar comandos con opciones inexistentes, rutas incorrectas o efectos destructivos (`rm`, `dd`, `mkfs`, cambios de permisos). Nunca debe ejecutarse su salida sin revisión humana, especialmente con privilegios de root.
- Alucinación: la probabilidad de inventar parámetros de configuración, nombres de paquetes o flags de herramientas es alta en un modelo de este tamaño, incluso dentro de su dominio.
- Idioma: solo se declara inglés. Las consultas en castellano u otros idiomas degradarán la calidad y pueden producir respuestas incoherentes.
- Contexto: la longitud de contexto no está publicada; conviene asumir una ventana corta y no diseñar flujos que dependan de historiales largos o de volcados extensos de logs.
- Licencia GPL-3.0: es copyleft. Integrar el modelo en un producto propietario o en un servicio que lo distribuya puede obligar a liberar el código derivado. Para uso interno no distribuido las obligaciones son menores, pero conviene revisión legal.
- Ausencia de benchmarks: no hay métricas publicadas que respalden la calidad, de modo que cualquier evaluación debe hacerse por cuenta propia con un conjunto de validación representativo del dominio.
- Cuantizaciones de baja precisión: Q2_K, Q3_K_S y Q3_K_M degradan la calidad de forma notable. Para uso real se recomienda Q4_K_M o superior.
- Cuantizaciones estáticas sin imatrix: el autor indica que no hay versiones ponderadas, lo que puede penalizar ligeramente la perplejidad frente a cuantizaciones con imatrix del mismo tamaño.
- Trazabilidad limitada: no se publican datos de entrenamiento, composición del dataset ni procesos de alineación, por lo que no es posible auditar sesgos ni procedencia de los datos.
- Actividad nula en el repositorio: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación comunitaria y de soporte.
- Fechas de los metadatos: la fecha de creación declarada (2026-09-14) es posterior a la fecha de publicación de muchos modelos de referencia, dato a tener en cuenta al situar el modelo en el panorama actual.

## Enlaces

- Repositorio de la cuantización en HuggingFace: https://huggingface.co/mradermacher/dgpl-linux-assistant-0.8b-GGUF
- Modelo base: https://huggingface.co/dgpl/dgpl-linux-assistant-0.8b
- Página de resumen de cuantizaciones de mradermacher para este modelo: https://hf.tst.eu/model#dgpl-linux-assistant-0.8b-GGUF
- Guía de uso de ficheros GGUF (referencia de TheBloke citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre cuantizaciones (ikawrakow), citado en la model card: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH, empresa que cede la infraestructura al autor de las cuantizaciones: https://www.nethype.de/

Nota: la búsqueda web asociada a esta consulta no devolvió resultados relevantes sobre el modelo (los resultados obtenidos corresponden a contenido no relacionado, sobre videojuegos), por lo que no se han podido incorporar papers, blogs técnicos ni demos adicionales.
