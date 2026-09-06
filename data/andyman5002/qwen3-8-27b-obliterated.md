# andyman5002/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante del modelo Qwen3.8-27B desarrollada por andyman5002, orientada a la investigación de seguridad (red-teaming) y a casos de uso que requieren generación de texto sin las restricciones de seguridad del modelo original. El modelo ha sido sometido a un proceso de "abliteración", una técnica que identifica y elimina las direcciones del espacio de pesos responsables de los rechazos y de las respuestas evasivas o "lecturas de seguridad". Según el autor, la versión V3 consigue respuestas genuinas a consultas que el modelo base rechazaría, con una pérdida de rendimiento en MMLU de 2,1 puntos porcentuales (de 84,5 % a 82,3 %).

Se trata de un modelo de tipo transformer denso con 27.781.427.952 parámetros (27.8 mil millones), que hereda la arquitectura y las capacidades de Qwen3.8-27B, incluyendo posiblemente visión y modo de pensamiento. La licencia es Apache-2.0 y se distribuye en formato safetensors, GGUF y MLX. Está pensado como herramienta de investigación, no como modelo listo para producción sin una evaluación de riesgos previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (sobre Qwen3.8-27B) |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (cuantizaciones no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B: un transformer denso orientado a tareas de lenguaje y visión, con soporte de control flexible de "thinking". El proceso de abliteración no ha requerido un entrenamiento desde cero; se ha partido del modelo base y se han modificado sus pesos. La técnica se describe en tres versiones:

- V1: una única cirugía agresiva mediante descomposición en valores singulares (SVD) sobre cinco direcciones de rechazo, que eliminó los rechazos duros pero costó una pérdida de 6 puntos porcentuales en MMLU.
- V2: "complementary abliteration blending", que combina dos cirugías con fallos distintos (SVD, que daña la capacidad, y LEACE, que preserva la capacidad pero elimina peor los rechazos) en una mezcla 60/40, consiguiendo una pérdida de solo 0,3 puntos.
- V3: refinamiento iterativo sobre V2 más una cirugía dirigida con un corpus específico para categorías de evasión. Resultado: una pérdida de 2,1 puntos en MMLU, con eliminación tanto de rechazos duros como de evasiones suaves.

No se han proporcionado datos sobre el corpus de entrenamiento original del modelo base ni sobre los datos usados en la cirugía dirigida (solo se menciona un "corpus dirigido a categorías de evasión").

## Capacidades

- Generación de texto de seguimiento de instrucciones, incluyendo consultas que el modelo base rechazaría.
- Generación de código funcional: 20/20 en tareas de codificación y seguridad evaluadas por el autor.
- Razonamiento simbólico y cadena de pensamiento: compatible con el modo "thinking" activado o desactivado.
- Uso en agentes y llamadas a herramientas: la documentación incluye recomendaciones para evitar bucles de tool calls y gestión de contexto, lo que sugiere compatibilidad con llamadas a funciones heredada del modelo base.
- Capacidad de respuesta "genuinamente sin censura": responde con sustancia en lugar de lecturas de seguridad.
- El modelo base tiene capacidades vision-language, pero no hay confirmación de que esta variante las conserve intactas; se indica en limitaciones.

## Casos de uso

- Red teaming de aplicaciones de IA: se puede utilizar como adversario controlado para probar si los sistemas de filtrado y moderación de un producto fallan ante consultas que deberían rechazarse. Las respuestas sin filtro permiten evaluar la robustez de los mecanismos de defensa.

- Generación de exploits y pruebas de penetración (pentesting): el modelo produce código funcional para escenarios de seguridad ofensiva, como scripts de enumeración o payloads para entornos controlados, sin interrumpir la sesión con advertencias.

- Investigación en seguridad de IA (AI safety research): sirve como caso de estudio para analizar los efectos de la abliteración, comparando el comportamiento antes y después del proceso, y para estudiar cómo las técnicas de eliminación de direcciones de rechazo afectan a la capacidad y al alineamiento.

- Análisis forense digital: en entornos aislados, puede generar explicaciones técnicas sobre artefactos maliciosos o procesos de ataque, sin el filtrado que impide la divulgación de detalles operativos.

- Soporte técnico sin restricciones: permite implementar asistentes que, en un entorno de laboratorio, respondan a preguntas sobre sistemas comprometidos o vulnerabilidades conocidas sin eludir la información.

- Automatización de infraestructura y scripts: gracias a su generación de código, puede emplearse en pipelines de CI/CD para generar o refactorizar código en escenarios donde la falta de restricciones no sea un problema (por ejemplo, en la integración de pruebas unitarias ofensivas).

## Benchmarks y rendimiento

La model card del autor presenta una tabla con evaluaciones MMLU y pruebas propias (no son benchmarks estandarizados de la comunidad):

| Prueba | Stock Qwen3.8-27B | V1 | V2 | V3 |
|---|---|---|---|---|
| MMLU (lm-eval-harness, 0-shot, n=5700) | 84,5 % | 81,4 % | 84,3 % | 82,3 % |
| Diferencia vs stock | — | -6,0 pp | -0,3 pp | -2,1 pp |
| Calidad de liberación | Rechaza | Rechazos duros eliminados | Evasiones suaves persisten | Responde genuinamente |
| Tareas cyber/código (20 prompts) | Rechaza | No evaluado | No evaluado | 20/20 con código funcional |
| Tareas avanzadas del mundo real | 5/8 | No evaluado | 7/8 | 7/8 |
| Modo thinking | Compatible | No compatible | No compatible (rechaza) | Compatible |

El error estándar (stderr) no se especifica en la información extraída. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (2 bytes por parámetro), se necesitan aproximadamente 55,6 GB de VRAM. Con cuantización GGUF de 4 bits, la estimación baja a unos 14-16 GB (dependiendo del tipo de cuantización). Con cuantización de 8 bits, aproximadamente 28 GB.

- GPU recomendadas: para carga completa en bfloat16, una A100 80GB o H100. Para cuantización 4-bit, una RTX 4090 (24 GB) o similar puede ser suficiente.

- En consumer GPU: cabe en una RTX 4090 con cuantización de 4 bits, pero no en una RTX 3060 (12 GB) ni en una 4070 (12 GB) sin reducciones adicionales que no se mencionan.

- Opciones de despliegue: transformers (con device_map="auto"), llama.cpp (con el template Jinja incluido), Ollama, LM Studio, y MLX para Apple Silicon.

- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED | 27,8 B | No disponible | 82,3 % | Apache-2.0 | HuggingFace |
| Qwen3.8-27B (stock) | 27,8 B | No disponible | 84,5 % | Apache-2.0 | HuggingFace |
| Otras variantes abliterated | No disponible | No disponible | No disponible | No disponible | No disponible |

No se ha encontrado información sobre otras variantes abliterated del mismo tamaño en la búsqueda web. La comparativa se limita al modelo base.

## Limitaciones y advertencias

- Sesgos y alineación: el modelo ha sido modificado para eliminar deliberadamente las restricciones de seguridad. Esto elimina también en gran medida los mecanismos de rechazo que podrían prevenir la generación de contenido dañino. No se ha evaluado el sesgo del modelo ni su comportamiento ante consultas delicadas.

- Riesgo de alucinación: no se han publicado evaluaciones específicas. Al igual que el modelo base, puede generar información incorrecta o desactualizada. La abliteración puede alterar la calibración de la certeza del modelo.

- Pérdida de capacidad: la versión V3 pierde un 2,1 % en MMLU respecto al modelo stock. Esto puede traducirse en peor rendimiento en tareas de conocimiento factual y razonamiento general.

- Limitaciones de contexto: la longitud de contexto exacta no se ha indicado en la información disponible. El autor recomienda gestionar el contexto en agentes (resumir cada ~10 turnos) porque se llena con acciones repetidas, lo que sugiere que el uso de contexto largo requiere supervisión.

- Uso multimodal incierto: el modelo base es un modelo vision-language, pero no se ha confirmado en la model card que esta variante conserve la capacidad de procesar imágenes o videos. No se debe asumir su funcionamiento multimodal en producción sin pruebas previas.

- Restricciones de uso: aunque la licencia Apache-2.0 permite uso comercial, el contenido generado puede infringir normas legales o de seguridad. El autor la presenta como una herramienta de investigación (red-team, ai-safety-research) y no debería utilizarse sin salvaguardas adecuadas en entornos de producción.

## Enlaces

- HuggingFace: https://huggingface.co/andyman5002/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub con archivos y descripción del modelo: https://github.com/bigguy8585/ai/tree/main/Qwen3.8-27B-OBLITERATED

El repositorio de GitHub parece ser una copia de los archivos del modelo. No hay enlaces a artículos o papers en la información encontrada.
