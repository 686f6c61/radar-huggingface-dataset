# janihal/Llama-Poro-2-70B-Instruct-oQ3e

# Llama-Poro-2-70B-Instruct-oQ3e

## Resumen
Llama-Poro-2-70B-Instruct-oQ3e es una cuantización de 3 bits en formato MLX del modelo LumiOpen/Llama-Poro-2-70B-Instruct, publicada por el usuario janihal. No es un modelo entrenado desde cero: reproduce los pesos del Poro 2 70B Instruct (70.553.706.496 parámetros, arquitectura Llama con 80 capas, vocabulario de 128.256 tokens y contexto de 8.192 tokens) con precisión reducida y calibración por matriz de importancia, con el objetivo explícito de que un modelo de 70B quepa y funcione en Macs con Apple Silicon y tan solo ~48 GB de memoria unificada. El resultado ocupa ~32,6 GB en disco, equivalente a ~3,7 bits por peso efectivos.

El modelo original fue desarrollado por AMD Silo AI, el grupo TurkuNLP de la Universidad de Turku y el proyecto HPLT, y se entrenó en el superordenador LUMI mediante preentrenamiento continuado, SFT y DPO. Está especializado en finlandés e inglés, dos idiomas con cobertura desigual en los grandes modelos comerciales, lo que le da un interés particular para aplicaciones en finés.

La relevancia de este repositorio concreto es práctica: permite ejecutar localmente un 70B en hardware de consumo de gama alta (Apple Silicon) sin depender de GPU dedicadas ni de servicios en la nube. La contrapartida, advertida por el propio autor, es que 3 bits es una cuantización agresiva y que existe pérdida de calidad frente a builds de 4 u 8 bits. El repositorio no incluye benchmarks propios ni modifica el comportamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only); 80 capas, vocabulario de 128.256 tokens |
| Parámetros totales | 70.553.706.496 (70,55B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | Cuantización afín de 3 bits con precisión mixta: embeddings de tokens y `lm_head` en 8 bits; subconjunto de proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y algunas capas `mlp.down_proj` en 4-6 bits; resto de pesos lineales en 3 bits. Tamaño de grupo 64. Calibración con matriz de importancia (imatrix / oQe) |
| Idiomas soportados | Finés (fi) e inglés (en) |
| Licencia | Llama 3.3 Community License (heredada del modelo base) |
| Formato de pesos | MLX safetensors (7 shards), ~32,6 GB en disco |
| Herramienta de cuantización | oQ / oMLX v0.6.4 (ruta imatrix), conjunto de calibración `oqe_code_multilingual`, 128 muestras a longitud de secuencia 512 |
| Modelo base | LumiOpen/Llama-Poro-2-70B-Instruct |
| Librería de inferencia | mlx-lm (Apple Silicon) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de publicación en HuggingFace | 10 de septiembre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento
La arquitectura es la de Llama 3.1 70B, es decir, un transformer decoder-only denso con 80 capas, normalización RMSNorm, RoPE y atención por grupos, adaptada por LumiOpen mediante preentrenamiento continuado sobre el modelo base, seguido de ajuste supervisado (SFT) y optimización por preferencias con DPO. El modelo resultante conserva el vocabulario de 128.256 tokens y la ventana de 8.192 tokens de la arquitectura original. El repositorio que nos ocupa no ha sido reentrenado: solo se han recuantizado los pesos.

La innovación técnica relevante aquí está en el proceso de cuantización, no en el modelo. Se ha aplicado una cuantización afín de 3 bits con calibración por matriz de importancia, en la que la sensibilidad de cada tensor se mide con un conjunto de calibración multilingüe y orientado a código. Con esa información, los tensores más sensibles (embeddings, `lm_head` y parte de las proyecciones de atención) se mantienen en 8 bits o se elevan a 4-6 bits, mientras el resto baja a 3 bits. El autor indica que, como el modelo en bf16 no cabía en memoria durante el proceso, la calibración se ejecutó contra un proxy temporal de 4 bits, un detalle metodológico que conviene tener presente. Las asignaciones de bits por tensor están documentadas en `config.json` y los metadatos de calibración en `oq_imatrix_report.json`.

## Capacidades
- Generación de texto conversacional e instrucciones en finés e inglés, con plantilla de chat incluida en `tokenizer_config.json`.
- Seguimiento de instrucciones complejas y respuestas multi-turno, heredado del ajuste SFT y DPO del modelo original.
- Generación de código y tareas multilingües de programación, dado que el conjunto de calibración empleado (`oqe_code_multilingual`) está orientado a código y multilingüismo, aunque las capacidades reales dependen del modelo base.
- Ejecución local en Apple Silicon mediante mlx-lm, con soporte de decodificación especulativa usando un modelo borrador de la misma familia y tokenizador (por ejemplo, un quant de 8 bits de Poro 2 8B).
- No se documenta en la información disponible soporte de tool calling o function calling, modo de razonamiento explícito, visión, audio ni capacidades de agente. Estas funciones deben verificarse contra la model card del modelo original.

## Casos de uso
- Asistentes conversacionales en finés para empresas nórdicas: el modelo está entrenado y ajustado específicamente para finés, un idioma con poca cobertura en modelos abiertos, y la cuantización permite desplegarlo en un Mac Studio o MacBook Pro de gama alta sin salir a la nube.
- Procesamiento de documentación interna en local: con 8.192 tokens de contexto se pueden resumir, extraer datos y reescribir documentos de tamaño moderado sin enviar información sensible a terceros, algo crítico en sectores regulados.
- Traducción finés-inglés y viceversa: el modelo cubre ambas direcciones de forma nativa, útil para equipos distribuidos o para pipelines de localización de contenido.
- Generación y revisión de código en un flujo de trabajo offline: la cuantización conserva mayor precisión en las proyecciones de atención y en `lm_head`, lo que ayuda a mantener la coherencia en tareas de generación de código, aunque con las reservas propias de un modelo de 3 bits.
- Investigación académica en PLN para lenguas ugrofinesas: TurkuNLP y HPLT son los impulsores del modelo original, y esta versión facilita reproducir experimentos en un único equipo sin acceso a clústeres GPU.
- Servicio de inferencia con decodificación especulativa: combinando este modelo con un borrador Poro 2 8B en 8 bits se reduce la latencia interactiva en generación de texto largo, manteniendo la salida idéntica a la del modelo sin borrador.
- Chatbot de atención al cliente en inglés y finés con contexto de 8K: suficiente para historiales de conversación medianos si se gestiona cuidadosamente el recorte de contexto.
- Generación de contenido editorial en finés (borradores, resúmenes, reescritura) en un entorno de escritorio, aprovechando el soporte nativo del idioma frente a modelos genéricos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio de la cuantización no incluye métricas propias, y la model card remite expresamente a la del modelo original (LumiOpen/Llama-Poro-2-70B-Instruct) para capacidades y evaluaciones. Tampoco se han encontrado resultados de benchmarks en los resultados de la búsqueda web, que no contenían información relevante sobre este modelo.

## Requisitos de hardware
- Memoria unificada: el autor indica que el modelo puede ejecutarse en Apple Silicon con tan solo ~48 GB de memoria unificada. Los pesos ocupan ~32,6 GB, por lo que el resto queda para caché KV, overhead del runtime y el sistema operativo.
- Plataforma: exclusivamente Apple Silicon (M-series) mediante mlx-lm. No hay pesos GGUF ni safetensors estándar de PyTorch en este repositorio, por lo que no es directamente utilizable en GPU NVIDIA o AMD sin convertir el formato.
- GPU dedicadas: no se documenta soporte para A100, H100, RTX 4090 ni similares en la información disponible; el formato MLX está atado al ecosistema de Apple.
- Despliegue: mlx-lm (CLI `mlx_lm.generate` y API de Python). No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama.
- Decodificación especulativa: el autor recomienda emparejar este modelo con un borrador pequeño de la misma familia y tokenizador (por ejemplo, janihal/Llama-Poro-2-8B-Instruct-oQ8e) con `--num-draft-tokens 4`, ya que la generación está limitada por ancho de banda de memoria.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni cifras de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| janihal/Llama-Poro-2-70B-Instruct-oQ3e | 70,55B | 8.192 | 3 bits mixto (efectivo ~3,7 bits), MLX safetensors | Llama 3.3 Community License | HuggingFace, 0 descargas |
| LumiOpen/Llama-Poro-2-70B-Instruct | 70,55B | 8.192 | bf16 (modelo base) | Llama 3.3 Community License | HuggingFace |
| janihal/Llama-Poro-2-8B-Instruct-oQ8e | No disponible (denominado 8B en el repositorio) | No disponible | 8 bits, MLX | No disponible en la información proporcionada | HuggingFace; recomendado como borrador especulativo |
| janihal/Llama-Poro-2-8B-Instruct-oQ4e | No disponible (denominado 8B en el repositorio) | No disponible | 4 bits, MLX | No disponible en la información proporcionada | HuggingFace |

No se dispone de datos de rendimiento comparado ni de otras alternativas de 70B cuantizadas en formato MLX dentro de la información proporcionada.

## Limitaciones y advertencias
- La cuantización de 3 bits es agresiva: el propio autor advierte de pérdida de calidad respecto a versiones de 4 u 8 bits. La precisión mixta y la calibración por matriz de importancia limitan el daño, pero no lo eliminan.
- El autor recomienda explícitamente usar una build de 4 bits si se dispone de memoria suficiente; esta versión está pensada como solución de compromiso para equipos con ~48 GB de memoria unificada.
- La calibración se realizó contra un proxy temporal de 4 bits del modelo, porque el modelo en bf16 no cabía en memoria durante el proceso. Esto puede introducir desviaciones respecto a una calibración ideal sobre el modelo completo.
- Cobertura de idiomas limitada a finés e inglés. El rendimiento en castellano u otros idiomas no está documentado y previsiblemente será inferior.
- Contexto máximo de 8.192 tokens, notablemente inferior al de modelos actuales con ventanas de 128K o superiores; limita casos de uso con documentación extensa o conversaciones muy largas.
- Riesgo de alucinación no cuantificado: no hay evaluaciones de fidelidad publicadas en este repositorio ni datos de benchmarks que permitan acotarlo.
- Licencia Llama 3.3 Community License, heredada del modelo base: impone condiciones específicas de uso comercial, obligaciones de atribución ("Built with Llama") y restricciones para determinados supuestos y para empresas con más de 700 millones de usuarios mensuales. Conviene revisar el texto íntegro antes de un uso en producción.
- Dependencia de plataforma: requiere Apple Silicon y mlx-lm; no es portable a infraestructura NVIDIA/AMD sin conversión de formato, lo que puede comprometer la escalabilidad en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que significa poca validación comunitaria de la calidad de la cuantización.
- El comportamiento, los sesgos y las limitaciones del modelo original no se documentan aquí; la model card remite a la de LumiOpen/Llama-Poro-2-70B-Instruct, que debe consultarse antes de cualquier despliegue.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/janihal/Llama-Poro-2-70B-Instruct-oQ3e
- Modelo base: https://huggingface.co/LumiOpen/Llama-Poro-2-70B-Instruct
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- MLX (Apple): https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Cuantización relacionada oQ4e (8B): https://huggingface.co/janihal/Llama-Poro-2-8B-Instruct-oQ4e
- Cuantización relacionada oQ8e (8B): https://huggingface.co/janihal/Llama-Poro-2-8B-Instruct-oQ8e
- Licencia Llama 3.3 Community: https://www.llama.com/llama3_3/license/
- AMD Silo AI: https://www.amd.com/en/solutions/ai/silo-ai.html
- TurkuNLP: https://turkunlp.org/
- Proyecto HPLT: https://hplt-project.org/
- Superordenador LUMI: https://www.lumi-supercomputer.eu/

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre Poro 2; los enlaces anteriores proceden de la model card del repositorio.
