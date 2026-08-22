# mradermacher/UI-Mate-27B-GGUF

## Resumen

UI-Mate-27B es un modelo de lenguaje multimodal (vision-language) desarrollado por Tencent, diseñado específicamente para actuar como agente de interfaz gráfica (GUI agent). Es capaz de interpretar capturas de pantalla y generar acciones de ratón y teclado para automatizar tareas en entornos de escritorio y web, siguiendo la línea de sistemas como el Computer Use Agent de OpenAI pero con pesos abiertos. La versión GGUF de mradermacher ofrece cuantizaciones listas para usar con llama.cpp y Ollama, facilitando su despliegue en hardware de consumo. El modelo cuenta con unos 26.900 millones de parámetros, licencia Apache 2.0 y está orientado al inglés. Su relevancia radica en que democratiza el acceso a agentes de control de computador, un área hasta ahora dominada por soluciones propietarias, y su rendimiento compite con sistemas cerrados en benchmarks como OSWorld y WindowsAgentArena, según la información publicada por Tencent.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformador multimodal con codificador de visión) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; módulo multimodal (mmproj) en Q8_0 y f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo original en safetensors) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de su naturaleza multimodal (visión + lenguaje) y su propósito como agente de GUI. Se sabe que el modelo original de Tencent (UI-Mate-27B) es un modelo de 27B parámetros con un módulo de visión que procesa capturas de pantalla, y que ha sido entrenado con técnicas de aprendizaje en contexto para tareas de control de interfaces. No se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados ni si se empleó RLHF o DPO. La versión GGUF es una cuantización estática de los pesos originales realizada por mradermacher, que añade un módulo de proyección multimodal (mmproj) para permitir la entrada de imágenes en el formato GGUF.

## Capacidades

- Agente de uso de computador (computer-use): interpreta capturas de pantalla y genera acciones de ratón y teclado (clics, desplazamiento, escritura) mediante herramientas como PyAutoGUI.
- Multimodal: acepta imágenes (pantallas completas o regiones) junto con texto en las instrucciones.
- Razonamiento de múltiples pasos: puede planificar y ejecutar secuencias de acciones para completar tareas complejas en el escritorio.
- Evaluado en benchmarks de agentes GUI: OSWorld-Verified, OSWorkerBench y WindowsAgentArena.
- Integración con frameworks de automatización: compatible con entornos que usan PyAutoGUI y similares.
- Soporte de tool calling: no se especifica explícitamente, pero su naturaleza de agente implica capacidad de invocar funciones del sistema.

## Casos de uso

- Automatización de tareas administrativas: el modelo puede rellenar formularios, mover archivos y gestionar aplicaciones de oficina mediante instrucciones en lenguaje natural, reduciendo el trabajo manual repetitivo.
- Testing automatizado de aplicaciones de escritorio: se puede integrar en pipelines de QA para verificar flujos de interfaz, comparando capturas de pantalla y ejecutando acciones esperadas.
- Asistencia técnica remota: un agente basado en UI-Mate puede diagnosticar problemas en el sistema operativo del usuario y realizar acciones correctivas (abrir ajustes, instalar parches) bajo supervisión.
- Creación de macros inteligentes: en lugar de grabar secuencias fijas, el modelo puede adaptarse a cambios en la interfaz y generar macros dinámicas para programas específicos.
- Automatización de flujos de trabajo de datos: extraer información de aplicaciones heredadas, copiarla a hojas de cálculo y guardar resultados, todo mediante control del ratón y teclado.
- Agente personal de productividad: integrado en un cliente de escritorio, puede gestionar correos, calendarios y archivos respondiendo a comandos de voz o texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de Tencent indica que UI-Mate-27B es competitivo con sistemas de pesos abiertos y cerrados en OSWorld-Verified, OSWorkerBench y WindowsAgentArena, pero no se aportan cifras concretas en la documentación accesible.

## Requisitos de hardware

- Para la cuantización Q4_K_M (~16,6 GB de archivo) se recomienda al menos 20 GB de VRAM para inferencia en contexto corto, por lo que una RTX 4090 (24 GB) es adecuada.
- La cuantización Q8_0 (~28,7 GB) requiere una GPU con 32 GB o más, como una A100 40 GB o H100.
- El módulo multimodal (mmproj) ocupa entre 0,7 y 1 GB adicionales.
- Opciones de despliegue: llama.cpp, Ollama, o cualquier runtime compatible con GGUF. También se puede usar el modelo original en safetensors con vLLM o TGI.
- No se han publicado datos de latencia o throughput en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| UI-Mate-27B | ~27B | no disponible | Apache 2.0 | Agente GUI multimodal |
| UI-TARS (ByteDance) | 7B, 72B | no disponible | Apache 2.0 | Agente GUI multimodal |
| OpenAI CUA (GPT-4o) | no disponible | no disponible | propietario | Agente GUI cerrado |
| OS-Copilot | no disponible | no disponible | no disponible | Agente de escritorio |

Nota: la información sobre UI-TARS y OS-Copilot no está detallada en la documentación proporcionada; se citan como referencias de la categoría.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas puede ser limitado.
- No se especifica la longitud de contexto, por lo que tareas con instrucciones muy largas o historiales extensos pueden verse afectadas.
- La cuantización reduce la precisión; para tareas críticas se recomienda usar al menos Q4_K_M o superior.
- Riesgo de alucinación en acciones: el modelo puede generar secuencias de acciones incorrectas o irreversibles; se recomienda supervisión humana en entornos productivos.
- No se dispone de información sobre sesgos o comportamientos no deseados.
- La licencia Apache 2.0 permite uso comercial, pero los términos de uso del modelo original de Tencent deben revisarse.
- Requiere un entorno de ejecución con permisos de control del ratón y teclado, lo que puede plantear riesgos de seguridad si se usa en sistemas no aislados.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/UI-Mate-27B-GGUF
- Modelo original: https://huggingface.co/tencent/UI-Mate-27B
- Repositorio GitHub: https://github.com/Tencent/UI-Mate
- Paper (arXiv): https://arxiv.org/pdf/2601.15930
