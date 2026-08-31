# servantofares/DeepSeek-V4-Flash-Vision-Exp

## Resumen

DeepSeek-V4-Flash-Vision-Exp es el primer modelo multimodal experimental de la familia DeepSeek-V4, desarrollado por DeepSeek AI. Se construye sobre la arquitectura de DeepSeek-V4-Flash e incorpora un codificador visual y un alineador, con entrenamiento continuado para desbloquear capacidades de comprensión de imágenes. El modelo acepta entradas de texto e imagen, lo que permite describir imágenes, leer texto de capturas de pantalla, analizar gráficos y ejecutar tareas de agente multimodal.

Con aproximadamente 304.600 millones de parámetros y una ventana de contexto de 1.000.000 de tokens, el modelo está diseñado para tareas de agente complejas que combinan razonamiento textual y visual. Según los benchmarks publicados, mejora sustancialmente las capacidades de agente multimodal respecto a DeepSeek-V4-Flash-0731, manteniendo un rendimiento comparable en tareas de agente solo de texto. Se distribuye bajo licencia MIT y está disponible tanto a través de la API de DeepSeek como en formato abierto con pesos safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con DFlash attention, Hyper-Connections, DSpark forward path, codificador visual y alineador |
| Parametros totales | 304.646.824.126 (~304,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (entrada); 384.000 tokens de salida maxima |
| Tipos de cuantizacion | 8-bit, FP8 (segun etiquetas del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con archivo de indice model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) con atención DFlash, un mecanismo de atención eficiente propio de DeepSeek, junto con Hyper-Connections y la ruta de avance DSpark. Para la parte multimodal, incorpora un codificador visual y un alineador que proyectan las características de imagen al espacio de representación del modelo de lenguaje. El repositorio incluye una implementación de inferencia mínima en PyTorch que cubre todos estos componentes.

El entrenamiento consistió en un ajuste continuado sobre la base de DeepSeek-V4-Flash-0731, añadiendo módulos visuales y datos multimodales. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El modelo admite dos formatos de codificación de prompt: bloques de contenido estilo OpenAI y la notación compacta `<image>ruta</image>` en texto plano, que producen los mismos tokens.

## Capacidades

- Comprensión de imágenes: descripción de fotografías, lectura de texto en capturas de pantalla, análisis de gráficos y diagramas.
- Razonamiento multimodal para agentes: interpreta elementos visuales en tareas de agente complejas, como navegación web o uso de herramientas con interfaces gráficas.
- Razonamiento de texto: mantiene las capacidades de agente de texto de DeepSeek-V4-Flash, incluyendo tareas de terminal, repositorios de código y ciberseguridad.
- Razonamiento profundo: el modelo admite un modo de razonamiento con esfuerzo máximo (`max` reasoning effort) según la configuración de evaluación.
- Tool calling y function calling: compatible con tareas de agente que requieren invocar herramientas, como se refleja en benchmarks como Toolathlon-Verified y DSBench-Hard.
- Ventana de contexto larga: 1.000.000 de tokens, adecuada para documentos extensos, repositorios completos o conversaciones de muchos turnos.
- Soporte de agentes multi-paso: evaluado en benchmarks como Terminal Bench, DeepSWE y ApexBench, que requieren planificación y ejecución secuencial.

## Casos de uso

- Análisis de capturas de pantalla en soporte técnico: el modelo puede leer texto de imágenes de error, interfaces de usuario o logs visuales, y generar respuestas de solución de problemas en conversaciones multi-turno, aprovechando su contexto de 1M de tokens para mantener el historial completo.
- Automatización de agentes de navegación web: con su capacidad de interpretar elementos visuales de páginas, puede ejecutar tareas como rellenar formularios, extraer datos de tablas o verificar el estado de interfaces, integrándose en pipelines de RPA.
- Generación de código con contexto visual: un desarrollador puede adjuntar un diagrama de arquitectura o un mockup de interfaz y pedir al modelo que genere el código correspondiente, combinando comprensión visual y generación de código.
- Análisis de gráficos financieros y de negocio: el modelo puede interpretar gráficos de líneas, barras o circulares en informes, extraer tendencias y generar resúmenes ejecutivos, útil en herramientas de inteligencia de negocio.
- Revisión de documentos técnicos con figuras: al procesar papers, manuales o especificaciones que contienen diagramas, el modelo puede responder preguntas que requieren cruzar información textual y visual.
- Agente de ciberseguridad con evidencia visual: en ejercicios de seguridad ofensiva o defensiva, puede analizar capturas de pantalla de herramientas de seguridad, logs visuales o paneles de control, y proponer acciones siguientes.
- Asistente de accesibilidad: descripción de imágenes para personas con discapacidad visual, generando descripciones detalladas de fotografías o interfaces en tiempo real.

## Benchmarks y rendimiento

La model card publica resultados en benchmarks de agente, comparando con DeepSeek-V4-Flash-0731 y Opus-4.8. Los valores marcados con † indican que el modelo de referencia ignora los elementos multimodales de la entrada.

| Benchmark | DeepSeek-V4-Flash-Vision-Exp | DeepSeek-V4-Flash-0731 | Opus-4.8 |
|---|---|---|---|
| **Agente de texto** | | | |
| Terminal Bench 2.1 | 83,9 | 82,7 | 85,0 |
| NL2Repo | 57,7 | 54,2 | 69,7 |
| Cybergym | 75,3 | 76,7 | 78,3 |
| DeepSWE | 59,3 | 54,4 | 58,0 |
| Toolathlon-Verified | 75,9 | 70,3 | 76,2 |
| DSBench-Hard | 63,6 | 59,6 | 71,7 |
| AutomationBench (Public) | 25,7 | 25,1 | 27,2 |
| **Agente multimodal** | | | |
| ApexBench (Pass@1) | 36,5 | 26,2† | 39,4 |
| Agents' Last Exam | 27,3 | 25,2† | 25,7 |
| Chartography | 64,3 | - | 65,0 |
| ZeroBench (Pass@5) | 35,0 | - | 34,0 |

No se han publicado resultados en benchmarks generales de conocimiento o razonamiento (MMLU, GSM8K, HumanEval) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 304,6 mil millones de parametros, en FP8 (1 byte por parametro) se necesitan aproximadamente 305 GB solo para los pesos. En cuantizacion de 4 bits, unos 152 GB. Estas son estimaciones orientativas; el valor exacto depende de la implementacion y del tamaño del lote.
- GPU recomendadas: no es viable en GPU de consumo. Se requieren sistemas multi-GPU de centro de datos, como 8x H100 (80 GB) o 8x A100 (80 GB) para FP8, o configuraciones con mayor numero de GPUs para cuantizaciones mas bajas.
- No cabe en GPU de consumo (RTX 4090, RTX 5090, etc.) ni en configuraciones de una sola GPU profesional de 24-48 GB.
- Opciones de despliegue: el repositorio incluye una implementacion de inferencia minima en PyTorch. Para produccion, se puede usar vLLM, TGI o DeepSeek Harness (version 0.1.1 con soporte nativo). Tambien esta disponible via API oficial de DeepSeek con el nombre de modelo `deepseek-v4-flash-vision-exp`.
- Latencia y throughput: no se han publicado datos oficiales. En configuraciones multi-GPU con FP8, se espera una latencia de varios segundos por peticion para generaciones largas, dado el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-Vision-Exp | ~304,6B (MoE) | 1M tokens | Si (vision) | MIT | Abierta (safetensors) y API |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | No (solo texto) | MIT | Abierta y API |
| Opus-4.8 (Anthropic) | no disponible | no disponible | Si | Propietaria | Solo API |

En los benchmarks de agente multimodal, DeepSeek-V4-Flash-Vision-Exp supera a DeepSeek-V4-Flash-0731 en ApexBench (36,5 vs 26,2) y Agents' Last Exam (27,3 vs 25,2), y queda ligeramente por detras de Opus-4.8 en ApexBench (36,5 vs 39,4) pero por delante en Agents' Last Exam (27,3 vs 25,7) y ZeroBench (35,0 vs 34,0). En tareas de agente de texto, es comparable a Opus-4.8 en Terminal Bench y Cybergym, aunque inferior en NL2Repo y DSBench-Hard.

## Limitaciones y advertencias

- Modelo experimental: la propia designacion "Exp" indica que es una version de investigacion, no un lanzamiento estable. Puede presentar comportamientos impredecibles o cambios en futuras versiones.
- Sesgos y alucinaciones: al ser un modelo de gran tamaño entrenado con datos web, puede reflejar sesgos presentes en los datos de entrenamiento y generar contenido factualmente incorrecto, especialmente en tareas visuales donde la interpretacion de imagenes ambiguas es compleja.
- Idiomas no especificados: no se ha publicado la lista de idiomas soportados. El rendimiento fuera de ingles y chino (idiomas principales de DeepSeek) no esta garantizado.
- Requisitos de hardware elevados: con mas de 300 mil millones de parametros, la inferencia local requiere infraestructura de centro de datos, lo que limita su uso a organizaciones con recursos significativos.
- Coste de API: segun el seguimiento de explainx.ai, DeepSeek ha aplicado aumentos de precio del 50-1100% en la API de V4, por lo que el coste por peticion puede ser alto.
- Sin garantias de produccion: al ser una version experimental, no se recomienda su uso en entornos de produccion criticos sin una evaluacion exhaustiva previa.
- Datos de entrenamiento no publicados: no se ha detallado la composicion del dataset multimodal ni el proceso de alineacion, lo que dificulta evaluar su robustez en dominios especificos.

## Enlaces

- Repositorio en Hugging Face (copia): https://huggingface.co/servantofares/DeepSeek-V4-Flash-Vision-Exp
- Repositorio oficial de DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Documentacion de la API de vision de DeepSeek: https://api-docs.deepseek.com/guides/vision/
- Analisis de benchmarks y coste (iweaver.ai): https://www.iweaver.ai/blog/deepseek-v4-flash-vision-exp/
- Analisis de benchmarks de agente multimodal (explainx.ai): https://explainx.ai/blog/deepseek-v4-flash-vision-exp-multimodal-agent-august-2026
- Ficha del modelo en pi.dev: https://pi.dev/models/opencode-go/deepseek-v4-flash-vision-exp
