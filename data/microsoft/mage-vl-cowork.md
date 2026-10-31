# microsoft/Mage-VL-Cowork

## Resumen

Mage-VL-Cowork es un modelo vision-language multimodal de Microsoft diseñado para agentes de uso de ordenador (computer use agents, CUA) con capacidad híbrida: combina interacción con interfaces gráficas basada en capturas de pantalla (`computer_use`) y ejecución persistente de código y comandos de terminal (`bash`) dentro de una única política de visión-lenguaje, sin orquestadores externos. Es un ajuste posterior (post-training) del checkpoint intermedio de 4B `microsoft/Mage-VL`, entrenado de extremo a extremo mediante un currículo progresivo de cinco etapas "specialize-then-unify" que incluye SFT híbrido y aprendizaje por refuerzo online (GRPO) con recompensas verificables.

Su relevancia radica en que demuestra que un VLM compacto de 4B parámetros puede destacar en tareas complejas de uso de ordenador: alcanza un 66,0 % en OSWorld-Verified con un presupuesto de 50 pasos, el mejor resultado entre modelos de su escala, lo que lo posiciona como candidato serio para inteligencia en dispositivo (on-device). El entrenamiento se apoya en Mage-CUA-Forge, un motor de síntesis de tareas que generó 293.806 tareas sobre 6.915 habilidades atómicas reduciendo el coste recurrente de generación un 82,6 %.

El modelo usa la arquitectura `llava_onevision2` (implementada en transformers con código personalizado), distribuye los pesos en formato safetensors (9,5 GB el repositorio) y está publicado bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM multimodal (llava_onevision2, con custom_code en transformers) |
| Parametros totales | 4.741.793.792 (~4,74B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en bf16/fp16 implícitos; no se publican variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (endpoints_compatible) |

## Arquitectura y entrenamiento

Mage-VL-Cowork parte de un checkpoint intermedio de 4B del modelo base `microsoft/Mage-VL` y se entrena mediante un currículo de cinco etapas "specialize-then-unify": primero se desarrollan de forma aislada el grounding visual (de 30,6 % a 56,9 % en OSWorld-G; de 78,8 % a 87,2 % en ScreenSpot-v2), la ejecución GUI y la competencia en código/terminal, y después se unifican mediante SFT híbrido y RL online híbrido asíncrono, pasando de 45,56 % a 55,84 % y finalmente a 66,0 % en OSWorld-Verified.

El pipeline de datos se basa en Mage-CUA-Forge, un motor de síntesis "workflow-first" que genera tareas reutilizables condicionadas por habilidad, en lugar de bucles agentiles abiertos por tarea. Esto reduce el consumo de tokens un 93,3 % (de 1.276K a 85K tokens por tarea) y el coste de 0,906 $ a 0,158 $ por tarea, produciendo 293.806 tareas sobre 6.915 habilidades atómicas. Adicionalmente, se evolucionó el harness del profesor (GPT-5.4) antes de las rollouts: se podaron rutas de acción redundantes (como `xdotool` y árboles de accesibilidad) y se preinstalaron librerías Python de dominio, elevando al profesor al 92,0 % con un 29,2 % menos de pasos, lo que se tradujo en una ganancia de +12,5 pp para el estudiante (37,6 % frente a 25,1 %).

La fase final de RL online (GRPO con recompensas de tarea verificables) añade +10,16 puntos porcentuales sobre el SFT híbrido, comprimiendo a la vez la interacción media de 21,57 a 18,77 llamadas al modelo (−13,0 %) y los tokens de salida de 7.374 a 5.499 por tarea (−25,4 %).

## Capacidades

- Enrutamiento interno de canal a nivel de turno: el modelo decide por sí mismo si usar `computer_use` (interacción visual con GUI, edición de canvas, estado en memoria de aplicaciones) o `bash` (ediciones estructuradas de hojas de cálculo, documentos y presentaciones; verificación determinista), sin router multiagente externo.
- Interacción con interfaces gráficas basada en capturas de pantalla: clic, escritura y manipulación de elementos visuales (grounding visual entrenado específicamente).
- Ejecución de código y comandos de terminal persistentes para ediciones programáticas y verificación de resultados.
- Capacidades de agente híbrido: tareas multi-aplicación y multi-paso dentro de un sistema operativo (hasta 50 pasos por tarea en la evaluación de referencia).
- Capacidades de agente de código y terminal (tags: coding-agent, terminal-agent).
- Compresión de interacción: tras el RL online, resuelve tareas con menos llamadas al modelo y menos tokens de salida.
- Idioma de operación: inglés (según los metadatos del modelo).

## Casos de uso

- Automatización de flujos de trabajo de oficina: el modelo puede operar aplicaciones de escritorio (hojas de cálculo, documentos, presentaciones) combinando clics en la GUI cuando hace falta interactuar con el lienzo y scripts de terminal para ediciones estructuradas masivas, gracias a su enrutamiento interno de canal.
- Relleno y manipulación de hojas de cálculo: para tareas con estructura de datos definida, el modelo prefiere el canal `bash` con librerías de dominio preinstaladas, que es más rápido y verificable que decenas de clics.
- Pruebas automatizadas de interfaces de usuario: su grounding visual entrenado (87,2 % en ScreenSpot-v2) permite localizar y accionar elementos de UI, útil en pipelines de QA de aplicaciones web y de escritorio.
- Agentes de productividad multi-aplicación: alcanza 62,7 % en tareas de flujos multi-aplicación, adecuado para orquestar tareas que cruzan varias aplicaciones (copiar datos de una app a otra, generar informes a partir de fuentes diversas).
- Administración de sistemas asistida: el canal de terminal persistente permite ejecutar comandos de mantenimiento, instalación y verificación de forma determinista dentro de un agente de un solo modelo.
- Asistentes en dispositivo (on-device): con 4B parámetros, es candidato para ejecutarse localmente en entornos con privacidad estricta, evitando enviar capturas de pantalla a servicios en la nube.
- Investigación en agentes CUA: el repositorio de código y el informe técnico publican la receta completa de entrenamiento (harness evolucionado, síntesis de tareas y RL), útil como base para reproducir o extender pipelines de post-training.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| OSWorld-Verified | 66,0 % | Presupuesto de 50 pasos; mejor resultado entre modelos de 4B |
| OSWorld (Operating System tasks) | 87,5 % | Líder en tareas de sistema operativo |
| OSWorld (Multi-Application Workflows) | 62,7 % | Flujos multi-aplicación |
| OSWorld-G | 56,9 % | Tras etapa de grounding (desde 30,6 % inicial) |
| ScreenSpot-v2 | 87,2 % | Tras etapa de grounding (desde 78,8 %) |
| Profesor GPT-5.4 con harness evolucionado | 92,0 % | Con 29,2 % menos de pasos (referencia de destilación) |

Datos adicionales de eficiencia: el RL online reduce las llamadas medias al modelo de 21,57 a 18,77 por tarea (−13,0 %) y los tokens de salida de 7.374 a 5.499 (−25,4 %) respecto al SFT híbrido.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~4,74B parámetros en precisión completa (bf16), el repositorio pesa 9,5 GB, por lo que se estima en torno a 10-12 GB de VRAM para los pesos más overhead de activación y procesado de imágenes; no disponible una cifra oficial.
- GPU recomendadas: no disponible oficialmente; por tamaño, una RTX 4090 (24 GB) o RTX 3090 debería alojarlo en precisión completa, y GPUs de datacenter (A10G, A100) son más que suficientes.
- Consumer GPUs: dado que los pesos completos ocupan 9,5 GB, cabe en GPUs domésticas de 12 GB o más (RTX 3060 12GB, RTX 4070, RTX 4090); no se publican variantes cuantizadas (GGUF) que permitirían reducir aún más el requisito.
- Despliegue: biblioteca transformers con `custom_code` (arquitectura llava_onevision2); compatibilidad con vLLM, llama.cpp u Ollama no está confirmada en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | OSWorld-Verified | Canal híbrido GUI+bash | Licencia |
|---|---|---|---|---|
| Mage-VL-Cowork | ~4,74B | 66,0 % | Sí (interno, sin orquestador) | Apache 2.0 |
| Otros modelos 4B CUA | ~4B | Inferiores (Mage-VL-Cowork es "best-in-class" en 4B según el autor) | no disponible | no disponible |
| Modelos frontera CUA (p. ej. profesores tipo GPT-5.4 con harness evolucionado) | no disponible | 92,0 % (con harness optimizado) | Sí, con scaffold externo | Propietaria |

Nota: la comparativa se limita a los datos publicados en la model card; no se proporcionan cifras detalladas de los modelos competidores en la información disponible.

## Limitaciones y advertencias

- Idioma: los metadatos indican soporte únicamente para inglés; el rendimiento en castellano no está documentado y probablemente sea inferior o no garantizado.
- No se publica información sobre longitud de contexto, cuantizaciones oficiales ni compatibilidad con runtimes de inferencia optimizados (vLLM, llama.cpp), lo que puede complicar el despliegue en producción.
- La arquitectura requiere `custom_code` (trust_remote_code) en transformers, lo que implica ejecutar código del repositorio y revisarlo antes de uso en entornos sensibles.
- Riesgo de alucinación: como todo VLM agéntico, puede interpretar erróneamente capturas de pantalla o ejecutar acciones incorrectas; en un agente con acceso a terminal (`bash`) esto conlleva riesgo real de ejecutar comandos destructivos, por lo que se recomienda sandboxing y supervisión humana.
- Sesgos conocidos: no disponible; no se documentan auditorías de sesgo en la model card.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de la atribución.
- El modelo está muy especializado en tareas de computer use en inglés sobre entornos tipo OSWorld; su comportamiento como asistente conversacional general no está evaluado.
- Descargas aún bajas (233) y modelo muy reciente: la madurez del ecosistema (herramientas, issues, cuantizaciones comunitarias) es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/microsoft/Mage-VL-Cowork
- Modelo base: https://huggingface.co/microsoft/Mage-VL
- Colección Mage en HuggingFace: https://huggingface.co/collections/microsoft/mage
- Página del proyecto: https://microsoft.github.io/Mage/cowork/
- Informe técnico (PDF en GitHub): https://github.com/microsoft/Mage/blob/main/assets/mage_vl_cowork_tech_report.pdf
- Código (GitHub): https://github.com/microsoft/Mage/tree/main/mage_vl_cowork
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
