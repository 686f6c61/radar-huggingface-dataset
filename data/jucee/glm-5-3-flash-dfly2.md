# jucee/GLM-5.3-Flash-DFly2

## Resumen

GLM-5.3-Flash-DFly2 es un *drafter* (modelo borrador) para decodificación especulativa sin pérdida sobre el modelo objetivo zai-org/GLM-5.3-Flash. Lo publica el usuario jucee como conversión GGUF cuantizada del checkpoint original AngelSlim/GLM-5.3-Flash-DFly2-B6, desarrollado por Tencent AngelSpec y descrito en el artículo arXiv:2611.34776. No es un modelo generativo autónomo: su función es proponer tokens candidatos que el modelo objetivo verifica, acelerando la inferencia sin alterar la distribución de salida.

El artefacto contiene 10.339.277.410 parámetros (unos 10,3 mil millones) distribuidos en tres capas MoE dispersas con 128 expertos enrutados, 3 activos y 1 compartido, acopladas a las capas DSA del objetivo en las posiciones [35, 39, 43] mediante compartición de KV e índices top-2048. El bloque especulativo es de tamaño 6 y el drafter no mantiene caché KV propia ni realiza prefills, lo que reduce el coste de memoria frente a un borrador convencional.

El repositorio ocupa 6,2 GB e incluye un único archivo GGUF (`GLM-5.3-Flash-DFly2-Q4_K-AttnQ8.gguf`, 5,74 GiB) pensado para el runtime Jucee sobre Apple Silicon y Metal. La relevancia actual está en que permite acelerar la decodificación de un modelo grande en hardware de consumo sin sacrificar exactitud, un requisito habitual en despliegues locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso como drafter de decodificación especulativa (3 capas MoE: 128 expertos enrutados, 3 activos, 1 compartido) acoplado a capas DSA del objetivo [35, 39, 43] |
| Parametros totales | 10.339.277.410 (~10,3 mil millones) |
| Parametros activos | 3 de 128 expertos enrutados por capa más 1 experto compartido (no se especifica el recuento exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (expertos enrutados gate_up/down), Q8_0 (atención, experto compartido y proyecciones de corrección), F32 (norms, routers y gates; 93 tensores) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base zai-org/GLM-5.3-Flash bajo MIT) |
| Formato de pesos | GGUF (archivo `GLM-5.3-Flash-DFly2-Q4_K-AttnQ8.gguf`, 5.740.648.384 bytes) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa basado en tres capas MoE dispersas, con 128 expertos enrutados por capa (3 activos) y un experto compartido. Se acopla a las capas DSA del modelo objetivo en las posiciones [35, 39, 43], compartiendo KV e índices top-2048, y emplea un bloque especulativo de tamaño 6. La fusión de estados ocultos se realiza en `slot0`, con corrección intra-bloque de estados ocultos y atención. El drafter opera sin caché KV propia y sin prefills, lo que traslada todo el coste de contexto al modelo objetivo.

La decodificación es sin pérdida (lossless): el modelo objetivo verifica cada token propuesto, con coincidencia greedy exacta y muestreo de rechazo exacto, de modo que la distribución de salida no se altera. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre GLM-5.3-Flash, con verificación exacta por parte del modelo objetivo.
- Aceleración de inferencia sin degradación de la distribución de salida (coincidencia greedy exacta y muestreo de rechazo exacto).
- Funcionamiento con caché KV cero y prefill cero en el drafter, apoyándose en las capas DSA del objetivo.
- Soporte de bloque especulativo de tamaño 6 con corrección intra-bloque de estados ocultos y atención.
- No es un modelo autónomo: no se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo propias.
- No se documentan modos de razonamiento (thinking) ni capacidades especiales más allá de la decodificación especulativa.

## Casos de uso

- Aceleración de inferencia local en Apple Silicon: el GGUF Q4_K + Q8_0 está empaquetado para el runtime Jucee sobre Metal, de modo que un Mac con memoria unificada puede ejecutar GLM-5.3-Flash con decodificación especulativa y mantener la fidelidad de la salida.
- Servicio de chat de baja latencia: al proponer hasta 6 tokens por paso y verificarlos el objetivo, se reduce el número de pasos de decodificación en conversaciones multi-turno, siempre que el backend soporte el protocolo de verificación del drafter.
- Generación de código asistida: en pipelines donde la latencia por token es crítica (autocompletado en IDE, revisión de parches), el drafter acelera la salida del modelo objetivo sin introducir tokens no verificados.
- Despliegue en estaciones de trabajo con una sola GPU: el archivo de 5,74 GiB permite cargar el drafter junto al objetivo en entornos con VRAM o memoria unificada limitada, al no requerir caché KV propia.
- Evaluación de técnicas de decodificación especulativa: el repositorio incluye la receta reproducible (`recipes/glm53-dfly2/glm53-dfly2.sh`) y el script de conversión (`ds4/gguf-tools/glm53_dfly2_convert.py`), útil para reproducir y comparar variantes de cuantización.
- Integración en herramientas de inferencia que ya soportan GGUF: sirve como componente de aceleración en despliegues existentes de GLM-5.3-Flash, sin necesidad de reentrenar ni recalibrar el modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria para el drafter: el archivo GGUF ocupa 5,74 GiB (6.160.648.384 bytes); el repositorio completo son 6,2 GB.
- El drafter no mantiene caché KV propia ni realiza prefills, por lo que su huella en inferencia se limita a los pesos y a las estructuras de corrección intra-bloque.
- Hardware objetivo declarado: Apple Silicon con backend Metal, a través del runtime Jucee.
- GPU recomendadas: no disponible. El empaquetado está orientado a memoria unificada de Apple Silicon; no se documentan requisitos para A100, H100 o RTX 4090.
- Despliegue: runtime Jucee (https://github.com/bitnautlabs/jucee). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Función |
|---|---|---|---|---|---|
| jucee/GLM-5.3-Flash-DFly2 (este) | 10,3 mil millones | no disponible | Apache 2.0 | GGUF Q4_K/Q8_0 | Drafter especulativo para GLM-5.3-Flash |
| AngelSlim/GLM-5.3-Flash-DFly2-B6 | no disponible | no disponible | Apache 2.0 | no disponible | Checkpoint original del drafter (Tencent AngelSpec) |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | MIT | no disponible | Modelo objetivo verificado por el drafter |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo zai-org/GLM-5.3-Flash para verificar cada token; por sí solo no genera respuestas utilizables.
- Dependencia del runtime: el GGUF está empaquetado específicamente para Jucee sobre Apple Silicon y Metal; no se documenta compatibilidad con otros motores de inferencia.
- Acoplamiento estructural: el drafter asume las capas DSA [35, 39, 43] y el índice top-2048 del objetivo; cualquier cambio en el modelo objetivo rompe la verificación.
- Idiomas soportados: no disponibles; las capacidades lingüísticas dependen del modelo objetivo, no del drafter.
- Longitud de contexto: no disponible.
- Sesgos y alucinación: no se documentan sesgos propios; al ser verificado por el objetivo, el riesgo de alucinación es el del modelo base, no el del drafter.
- Licencia: Apache 2.0 para el drafter, MIT para el modelo base; se recomienda conservar la atribución a Tencent AngelSpec y a Bitnaut, LLC (marca Jucee).
- Advertencia de madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere validación comunitaria escasa.

## Enlaces

- Hugging Face: https://huggingface.co/jucee/GLM-5.3-Flash-DFly2
- Checkpoint original: https://huggingface.co/AngelSlim/GLM-5.3-Flash-DFly2-B6
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3-Flash
- Artículo (arXiv): https://arxiv.org/abs/2611.34776
- Runtime Jucee: https://github.com/bitnautlabs/jucee
- Receta reproducible: https://github.com/bitnautlabs/jucee/blob/main/recipes/glm53-dfly2/glm53-dfly2.sh
