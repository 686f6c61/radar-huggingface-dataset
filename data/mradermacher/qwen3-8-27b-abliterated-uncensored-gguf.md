# mradermacher/Qwen3.8-27B-Abliterated-Uncensored-GGUF

## Resumen

El repositorio `mradermacher/Qwen3.8-27B-Abliterated-Uncensored-GGUF` contiene cuantizaciones en formato GGUF del modelo `Madras1/Qwen3.8-27B-Abliterated-Uncensored`. El modelo base pertenece a la familia Qwen 3.8 y cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones). La etiqueta "Abliterated-Uncensored" indica que se ha aplicado una técnica de ablación para eliminar los mecanismos de rechazo del modelo original, así como las desviaciones suaves en las que el modelo ofrece respuestas evasivas o lecciones de seguridad en lugar de respuestas directas.

El repositorio está creado por `mradermacher`, un autor conocido por publicar cuantizaciones de modelos de lenguaje. Incluye múltiples archivos GGUF con distintos niveles de compresión, lo que permite ejecutar el modelo en hardware local con requisitos de VRAM variables. Según los datos de HuggingFace, no se ha publicado información sobre la arquitectura, la longitud de contexto, los idiomas soportados ni la licencia del modelo. Este repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco difundida.

Su relevancia técnica radica en ser una variante sin restricciones de seguridad, diseñada para responder a peticiones que el modelo Qwen3.8-27B original rechazaría. Este tipo de modelos se utiliza habitualmente en investigación de seguridad ofensiva, red teaming y análisis de comportamientos de modelos de lenguaje, aunque su uso conlleva riesgos significativos si se aplica sin supervisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, x-f16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (y safetensors para el modelo original) |

## Arquitectura y entrenamiento

La información proporcionada no incluye documentación técnica sobre la arquitectura del modelo original. Por el nombre, se infiere que pertenece a la familia Qwen 3.8, que en sus versiones anteriores utiliza arquitecturas de transformer denso, pero no hay confirmación en los datos disponibles. Tampoco se conocen los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

El proceso de "abliteración" es una técnica de modificación de pesos que elimina los comportamientos de rechazo del modelo, y el sufijo "Uncensored" indica que no se aplican filtros de seguridad en la generación. Según referencias encontradas en repositorios similares, esta versión va más allá de eliminar las negativas explícitas: también suprime las respuestas evasivas en las que el modelo da lecciones de seguridad en lugar de responder. La cuantización GGUF ha sido realizada por `mradermacher` y reduce el tamaño del modelo para permitir su ejecución en hardware de consumo.

## Capacidades

- Generación de texto sin restricciones de seguridad: el modelo está diseñado para cumplir con solicitudes que el modelo Qwen3.8-27B original rechazaría, incluyendo temas de conocimiento restringido, código para fines de investigación y escenarios de red team.
- Eliminación de respuestas evasivas: a diferencia de versiones que solo eliminan las negativas explícitas, este modelo también evita las "lecciones de seguridad" y las respuestas deflectivas, proporcionando respuestas directas.
- Capacidades de lenguaje general: al ser un modelo de aproximadamente 27 mil millones de parámetros, es probable que conserve las capacidades del modelo base en tareas de lenguaje natural, generación de código y razonamiento, aunque no se han publicado evaluaciones específicas.
- Soporte de tool calling, agentes, visión, audio o multimodalidad: no disponible en la información proporcionada.
- Multilingüismo: no disponible.

## Casos de uso

- Investigación en seguridad ofensiva: el modelo puede generar código de exploits, técnicas de enumeración y estrategias de ataque para pruebas de penetración, ya que no rechaza solicitudes de este tipo. Es adecuado para investigadores que necesitan un modelo sin filtros para simular amenazas reales.
- Red teaming de modelos de lenguaje: se puede utilizar para generar prompts maliciosos o adversarios con el fin de evaluar la robustez de otros sistemas de IA frente a ataques de jailbreak o inyección de prompts.
- Análisis académico de comportamientos de modelos: permite estudiar cómo responde un modelo de lenguaje cuando se eliminan sus restricciones de seguridad, lo que es útil para investigaciones sobre alineación, sesgos y límites de la IA.
- Generación de código para proyectos propios: al ser un modelo de 27B, puede asistir en tareas de programación, aunque su principal característica es la ausencia de rechazos en la generación de código ofensivo o de doble uso.
- Simulación de adversarios en sistemas de defensa: en el desarrollo de soluciones de ciberseguridad, se puede usar como generador de ataques simulados para probar la efectividad de firewalls, WAFs o sistemas de detección.
- Uso privado en entornos controlados: usuarios que necesitan respuestas sin filtros para proyectos personales de investigación, siempre que se utilice en un entorno aislado y con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas de evaluación, por lo que no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia (basada en el número de parámetros y la cuantización):
  - Cuantización Q4_K_S: aproximadamente 16-18 GB de VRAM, incluyendo overhead y caché KV.
  - Cuantización Q8_0: aproximadamente 28-30 GB de VRAM.
  - Cuantización F16: aproximadamente 54 GB de VRAM.
- GPU recomendadas:
  - Q4_K_S: RTX 4090 (24 GB) o RTX 3090 (24 GB), con cuantización de caché KV activada.
  - Q8_0: A100 40GB o H100 80GB.
  - F16: H100 80GB o A100 80GB.
- Si cabe en GPU de consumo: sí, con la cuantización Q4_K_S en una RTX 4090 o 3090 de 24 GB, siempre que se utilice cuantización de activaciones y una ventana de contexto reducida.
- Opciones de despliegue:
  - llama.cpp y Ollama para archivos GGUF.
  - vLLM o TGI para el modelo original en formato safetensors, no para los archivos GGUF.
  - LM Studio u otras aplicaciones locales compatibles con GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparación detallada con modelos equivalentes. Existen repositorios con variantes similares, como `mradermacher/Qwen3.8-27B-OBLITERATED-GGUF` y `mradermacher/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16-i1-GGUF`, pero no se han publicado especificaciones ni resultados de benchmarks para ninguno de ellos. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. Al eliminar los mecanismos de rechazo, el modelo puede reflejar y amplificar sesgos presentes en sus datos de entrenamiento sin filtros de seguridad.
- Riesgo de alucinación: no cuantificado, pero presente en todos los modelos de lenguaje. La ausencia de filtros no corrige los errores factuales.
- Limitaciones de contexto o idioma: no disponibles. La longitud de contexto y los idiomas soportados no se especifican, por lo que se recomienda verificar el modelo original.
- Restricciones de licencia para uso comercial: no especificada. La licencia del modelo original no está indicada en la información proporcionada, por lo que se debe revisar antes de cualquier uso comercial.
- Caveat importante para producción: este modelo no tiene filtros de seguridad y puede generar contenido malicioso, ilegal o dañino. No es apto para su uso en producción sin una supervisión humana estricta y en entornos completamente aislados.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Abliterated-Uncensored-GGUF
- Modelo original (Madras1): https://huggingface.co/Madras1/Qwen3.8-27B-Abliterated-Uncensored
- Variante OBLITERATED: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-GGUF
- Variante NOESIS: https://huggingface.co/mradermacher/Qwen3.8-27B-Abliterated-Uncensored-NOESIS-BF16-i1-GGUF
- Repositorio GitHub de referencia: https://github.com/bigguy8585/ai/tree/main/Qwen3.8-27B-OBLITERATED
- README del repositorio GitHub: https://github.com/bigguy8585/ai/blob/main/Qwen3.8-27B-OBLITERATED/README.md
