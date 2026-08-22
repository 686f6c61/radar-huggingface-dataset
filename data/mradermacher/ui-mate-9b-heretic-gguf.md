# mradermacher/UI-Mate-9B-heretic-GGUF

## Resumen

UI-Mate-9B-heretic-GGUF es una cuantización en formato GGUF del modelo base UI-Mate-9B-heretic, desarrollado por Dingdust. El modelo original es un sistema multimodal (vision-language) de aproximadamente 8.95 mil millones de parámetros, diseñado específicamente para actuar como agente de interfaz gráfica (GUI) en entornos de escritorio. Su propósito principal es interpretar capturas de pantalla y generar acciones de control (ratón, teclado) para automatizar tareas sobre sistemas operativos, con integración explícita con marcos como OSWorld y WindowsAgentArena.

La versión GGUF, publicada por mradermacher, proporciona pesos cuantizados en múltiples precisiones (desde Q2_K hasta f16) que permiten desplegar el modelo en hardware más modesto sin necesidad de infraestructura de servidor dedicada. La relevancia de este lanzamiento radica en la creciente demanda de agentes de escritorio locales y en la necesidad de ejecutar modelos multimodales en equipos de consumo, algo que la cuantización GGUF facilita al reducir los requisitos de memoria y computación.

Además, el sufijo "heretic" en el nombre indica que el modelo base fue sometido a un proceso de ablación de rechazo (abliteration), lo que elimina las respuestas de rechazo habituales en los modelos de propósito general y lo convierte en una opción para casos de uso donde se requiere una interacción sin restricciones de contenido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-language, arquitectura exacta no publicada) |
| Parametros totales | 8.953.803.264 (~8.95B) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna del modelo base (número de capas, tipo de attention, etc.). Se sabe que es un modelo multimodal (vision-language) de 9B, orientado a la comprensión de pantallas y la generación de acciones de GUI. El modelo base fue entrenado por Dingdust, pero no se han publicado los detalles del dataset, el número de tokens de entrenamiento ni las técnicas de alineación (RLHF, DPO, etc.) en la documentación disponible.

El término «heretic» y las etiquetas «uncensored», «decensored» y «abliterated» sugieren que el modelo base fue sometido a un proceso de abliteración, una técnica que elimina los pesos responsables de los rechazos (refusals) en modelos de lenguaje. Este proceso se aplica para eliminar la censura en las respuestas, lo que permite al modelo generar contenido sin las restricciones típicas de seguridad y moderación de las versiones originales.

La cuantización GGUF fue realizada por mradermacher, que aplicó los formatos estándar de cuantización de llama.cpp. Incluye un proyecto multimodales (mmproj) en dos variantes (f16 y Q8_0) necesario para procesar las imágenes de pantalla que recibe el modelo.

## Capacidades

- Agente de GUI de escritorio: el modelo interpreta capturas de pantalla y genera comandos de ratón y teclado para interactuar con aplicaciones, basado en el uso de la librería PyAutoGUI.
- Integración con marcos de evaluación de agentes: soporta OSWorld y WindowsAgentArena, entornos de benchmark para agentes de GUI en sistemas operativos.
- Comprensión multimodal: al ser vision-language, puede procesar imágenes de pantalla y extraer información visual para decidir la siguiente acción.
- Interacción sin restricciones: al estar abliterado, el modelo no muestra patrones de rechazo ni censura en sus respuestas.
- Soporte de tool calling: no confirmado explícitamente en la documentación, pero su naturaleza de agente de GUI sugiere una capacidad implícita de generar comandos estructurados.
- Multilingüe: solo inglés (en), sin soporte documentado para otros idiomas.

## Casos de uso

- **Automatización de pruebas de software en escritorio**: el modelo puede ejecutar secuencias de interacción con aplicaciones de Windows para verificar flujos de usuario, generando clicks y pulsaciones de teclas de forma autónoma. Su integración con WindowsAgentArena lo hace adecuado para este escenario.
- **Agente de asistencia remota**: dado que puede interpretar la pantalla y actuar sobre ella, puede usarse para gestionar sesiones de soporte técnico en sistemas locales, realizando tareas como abrir aplicaciones, configurar ajustes o instalar software.
- **Benchmark de agentes de GUI**: los investigadores pueden usarlo como baseline en OSWorld para comparar el rendimiento de agentes de escritorio en tareas estándar de navegación y manipulación de ventanas.
- **Automatización de tareas repetitivas en el puesto de trabajo**: el modelo puede encargarse de tareas como rellenar formularios, mover archivos entre carpetas o interactuar con aplicaciones de negocio, a partir de una descripción en lenguaje natural y una captura de pantalla.
- **Investigación sobre alucinación y comportamiento sin censura**: su carácter abliterado lo convierte en un candidato para estudiar los efectos de la ablación de rechazo en la calidad de las respuestas y en la capacidad de seguir instrucciones.
- **Prototipado de asistentes de escritorio personalizados**: desarrolladores pueden integrarlo con PyAutoGUI y un framework de agentes para crear asistentes que controlen el ordenador del usuario bajo demanda, siempre que se acepte el riesgo de acciones no supervisadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de agentes de GUI (como los de OSWorld o WindowsAgentArena) para este modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**:
  - Q2_K (3.9 GB): cabe en GPUs con 4-6 GB de VRAM (p. ej., GTX 1660, RTX 2060).
  - Q4_K_M (5.7 GB): requiere al menos 6-8 GB de VRAM (p. ej., RTX 3060, RTX 4060).
  - Q8_0 (9.6 GB): requiere 10-12 GB de VRAM (p. ej., RTX 3080, RTX 4070 Ti).
  - f16 (18 GB): requiere 20+ GB de VRAM (p. ej., RTX 3090, RTX 4090, A100).
- **GPU recomendadas**: para uso interactivo en tiempo real se recomienda una GPU con al menos 8 GB de VRAM (RTX 3070 o superior) con la cuantización Q4_K_M. Para cargas de trabajo más pesadas o mayor calidad, una RTX 4090 o A100 con Q8_0 o f16.
- **Uso en CPU**: es posible ejecutar las cuantizaciones más bajas (Q2_K, Q3_K_M) en CPU mediante llama.cpp, aunque la latencia será alta para tareas de agente en tiempo real.
- **Opciones de despliegue**: llama.cpp (CLI o servidor), Ollama (si se importa el GGUF), vLLM (con soporte GGUF experimental), text-generation-webui. Para el componente multimodal, es necesario cargar el archivo mmproj junto al modelo.
- **Latencia y throughput**: no disponible. Depende de la cuantización, hardware y el número de pasos de razonamiento que el agente genere por acción.

## Comparativa con modelos similares

No se dispone de información pública sobre modelos directamente comparables en la misma categoría (agentes de GUI de 9B en formato GGUF). Alternativas generales en el espacio de agentes multimodales incluyen modelos como GPT-4V o Claude con capacidades de visión, pero no son comparables en términos de licencia, tamaño ni formato de pesos. La comparativa con otros modelos abliterados de tamaño similar (p. ej., Dolphin 2.6, WizardLM-uncensored) no está documentada.

## Limitaciones y advertencias

- **Riesgo de acciones no supervisadas**: al ser un agente de GUI, un mal uso o una instrucción mal formulada puede provocar acciones reales sobre el sistema (mover archivos, cambiar configuraciones, etc.). Es necesario un sandbox o permisos restringidos en entornos de producción.
- **Idioma limitado**: solo soporta inglés; no se recomienda para interacción en español u otros idiomas.
- **Modelo abliterado**: la ausencia de rechazo puede generar contenido inapropiado, ofensivo o no seguro, incluso en contextos donde la moderación es necesaria. No es apto para aplicaciones comerciales orientadas al público general sin capas de moderación adicionales.
- **Contexto desconocido**: la longitud de contexto no se ha publicado, por lo que no se puede garantizar un rendimiento adecuado en tareas que requieran mantener muchas interacciones de pantalla o diálogos largos.
- **Falta de benchmarks**: no hay datos objetivos de rendimiento, lo que dificulta comparar con otros agentes de GUI o modelos de propósito general.
- **Licencia Apache-2.0**: permite uso comercial, pero el usuario es responsable del cumplimiento de las normativas sobre contenido generado y sobre el uso de agentes autónomos en sistemas informáticos.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/mradermacher/UI-Mate-9B-heretic-GGUF)
- [Modelo base Dingdust/UI-Mate-9B-heretic](https://huggingface.co/Dingdust/UI-Mate-9B-heretic)
- [Página de cuantizaciones de mradermacher](https://huggingface.co/mradermacher)
