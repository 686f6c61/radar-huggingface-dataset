# nex-agi/Nex-N2.5-Pro

## Resumen

El modelo Nex-N2.5-Pro, desarrollado por Nex-AGI, es una de las tres variantes de la familia Nex-N2.5, orientada a tareas agénticas de largo horizonte en entornos reales. Esta variante continúa la base multimodal de Nex-N2, con mejoras en uso de ordenador, navegación web y capacidades agénticas fundamentadas en visión. Su relevancia radica en que la visión deja de ser únicamente una modalidad de entrada y se convierte en una interfaz crítica para que el agente perciba su entorno, verifique resultados y avance en la tarea. En la información pública actual no se especifican arquitectura, número de parámetros ni longitud de contexto. Los pesos del modelo aún no han sido publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (multimodal) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos no publicados) |

## Arquitectura y entrenamiento

La arquitectura exacta de Nex-N2.5-Pro no se ha descrito públicamente. El modelo es multimodal, hereda la base de Nex-N2 y se ha post-entrenado para tareas agénticas, integrando visión como canal de percepción y feedback. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni técnicas de alineación como RLHF o DPO. El hermano mayor de la familia, Nex-N2.5-Max, se describe como un modelo MoE de 1,6 billones de parámetros, pero esa especificación corresponde al modelo Max y no al Pro.

## Capacidades

- Automatización de ordenador (computer use): manejo de interfaces gráficas, clics, escritura y capturas de pantalla.
- Navegación web autónoma: búsqueda de información, extracción de datos e interacción con formularios.
- Ejecución autónoma y prueba de programas: el modelo puede escribir, ejecutar y verificar código de forma autónoma.
- Percepción visual y verificación de resultados: usa la visión para comprobar el estado del sistema y auto-corregirse.
- Tareas de largo horizonte: capacidad de mantener una tarea compleja durante múltiples pasos consecutivos.
- Multimodalidad: entrada visual (imágenes o capturas) para el razonamiento agéntico, lo que permite actuar de forma continuada sobre el entorno.

## Casos de uso

- Automatización de flujos de trabajo de escritorio: el modelo puede operar aplicaciones mediante capturas de pantalla, ejecutando tareas repetitivas como rellenar formularios o procesar documentos.
- Navegación web autónoma para recopilación de información: dado el soporte de web browsing, puede recorrer sitios web, extraer datos relevantes y sintetizarlos para investigación de mercados o análisis de competencia.
- Ingeniería de software con agente autónomo: su capacidad para ejecutar y probar programas permite integrarlo en pipelines de CI/CD para detectar errores de forma temprana o en sistemas de desarrollo dirigido por agentes.
- Control de calidad de interfaces de usuario: analiza capturas de pantalla para comprobar que una aplicación se renderiza correctamente, identificando fallos visuales que las pruebas unitarias no cubren.
- Asistente investigador: combina lectura de artículos, análisis de figuras y ejecución de código para apoyar tareas de investigación científica donde el resultado debe verificarse visualmente.
- Soporte técnico visual: atiende incidencias que requieren guiar al usuario por una interfaz, interpretando capturas o vídeos para diagnosticar el problema y proponer pasos de solución.

## Benchmarks y rendimiento

Los datos que se presentan a continuación proceden de la model card del autor y no han sido reproducidos de forma independiente.

| Benchmark | Nex-N2.5-Pro | Claude Opus 5 | GPT-5.6 Sol | Kimi-K3 | GLM-5.3 | DeepSeek-V4-Pro-0813 | Qwen3.8-Max |
|---|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 | 82,7 | 89,1 | 88,8 | 88,3 | 88,2 | 87,9 | 86,6 |
| SWE-Bench Pro | 61,2 | 79,2 | 64,6 | 63,3 | 64,6 | 55,4 | 67,7 |
| DeepSWE v1.1 | 55,8 | 73,7 | 72,7 | 67,5 | 66,9 | 62,8 | 69,3 |
| AutomationBench v1.0.6 | 44,2 | 50,3 | 45,8 | — | — | — | — |

El guion indica dato no disponible en la información publicada. En la model card no se muestran valores para Kimi-K3, GLM-5.3, DeepSeek-V4-Pro-0813 ni Qwen3.8-Max en AutomationBench v1.0.6.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU domésticas: no disponible.
- Opciones de despliegue: no disponible; los pesos aún no se han publicado y no hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nex-N2.5-mini | no disponible | multimodal | no disponible | Apache 2.0 | pesos pendientes |
| Nex-N2.5-Pro | no disponible | multimodal | no disponible | Apache 2.0 | pesos pendientes |
| Nex-N2.5-Max | 1,6 billones (MoE) | texto-only | no disponible | Apache 2.0 | pesos pendientes |

No se dispone de datos suficientes para comparar con modelos agénticos multimodales similares, como Qwen3-VL o UI-TARS. La información disponible solo incluye benchmarks internos y comparaciones con modelos propietarios.

## Limitaciones y advertencias

- Pesos aún no publicados: a fecha de esta ficha, el repositorio de Hugging Face no contiene pesos (tamaño 0.0 GB), por lo que el modelo no puede descargarse ni ejecutarse localmente.
- Datos incompletos: arquitectura, número de parámetros, contexto e idiomas soportados no se han especificado, lo que limita la evaluación técnica.
- Benchmarks sin verificación externa: los resultados proceden de la model card del autor y no han sido reproducidos de forma independiente por terceros.
- Riesgo de alucinación: en tareas agénticas con entradas visuales, el modelo puede malinterpretar capturas o estados de la interfaz, especialmente en entornos complejos o ambiguos.
- Sesgos no documentados: al no publicarse el dataset de entrenamiento, no es posible evaluar la presencia de sesgos ni su alcance.
- Limitaciones de idioma: al no especificar los idiomas soportados, se desconoce su rendimiento en lenguas distintas de las empleadas en los conjuntos de entrenamiento.
- Restricciones de licencia: Apache 2.0 es una licencia permisiva, pero al no haber pesos publicados aún, no existe un modelo disponible para uso comercial. Además, habrá que verificar la licencia de los componentes multimodales en el momento en que se publiquen.

## Enlaces

- Hugging Face: https://huggingface.co/nex-agi/Nex-N2.5-Pro
- ModelScope: https://modelscope.cn/models/nex-agi/Nex-N2.5-Pro
- GitHub: https://github.com/nex-agi/Nex-N2.5
- Colección Hugging Face: https://huggingface.co/collections/nex-agi/nex-n25
- OpenRouter (Pro): https://openrouter.ai/nex-agi/nex-n2.5-pro
- OpenRouter (mini): https://openrouter.ai/nex-agi/nex-n2.5-mini
- Sitio web: https://nex-agi.com/
