# mradermacher/Qwen3.5-9B-DS9-USS-Defiant-GGUF

## Resumen

El modelo `mradermacher/Qwen3.5-9B-DS9-USS-Defiant-GGUF` es una colección de cuantizaciones GGUF estáticas del modelo base `nightmedia/Qwen3.5-9B-DS9-USS-Defiant`, un fine-tune y merge de la familia Qwen3.5-9B orientado a escritura creativa, ficción, roleplay y generación de historias. El repositorio, mantenido por mradermacher, proporciona 12 versiones cuantizadas que van desde Q2_K (3,9 GB) hasta f16 (18,0 GB), permitiendo ejecutar el modelo en hardware de consumo con diferentes compromisos entre calidad y uso de memoria.

El modelo base incorpora técnicas de "abliteration" (eliminación de rechazos) y está etiquetado como "uncensored" y "heretic", lo que indica un enfoque en la libertad creativa sin restricciones de contenido, aunque esto conlleva riesgos importantes en producción. Está pensado para usuarios que buscan un asistente de escritura de ficción con capacidad de generar tramas, diálogos y escenas vívidas en inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.5-9B, probablemente transformer denso) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Dado que se trata de un modelo derivado de Qwen3.5-9B, es razonable asumir que emplea una arquitectura transformer densa similar a la de la familia Qwen3.5, pero no se confirma si incorpora innovaciones como atención lineal o decodificación especulativa. El entrenamiento del modelo base `nightmedia/Qwen3.5-9B-DS9-USS-Defiant` se describe como un merge (probablemente mediante mergekit) y fine-tune, con técnicas de "abliteration" para eliminar comportamientos de rechazo. No se especifican datos sobre el volumen de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto creativo: especializado en escritura de ficción, incluyendo ciencia ficción, romance y otros géneros.
- Generación de tramas y subtramas: capaz de proponer argumentos, giros y desarrollo de personajes.
- Continuación de escenas: puede continuar una historia o escena dada, manteniendo coherencia narrativa.
- Roleplay: adecuado para sesiones de rol textual y simulación de personajes.
- Prosa vívida: entrenado para producir descripciones detalladas y evocadoras.
- Multilingüe: soporta inglés y chino, aunque no se especifica el nivel de fluidez en cada idioma.
- Sin censura: al estar "abliterated", no aplica filtros de contenido estándar, lo que permite explorar temas sensibles (con los riesgos asociados).

## Casos de uso

- Escritura de novelas y relatos: el modelo puede generar borradores completos, desarrollar personajes y mantener la coherencia en capítulos largos gracias a su capacidad de generación creativa.
- Generación de guiones para juegos de rol: los usuarios pueden usarlo como director de juego automatizado, describiendo escenarios y reaccionando a las acciones de los jugadores.
- Creación de contenido para blogs y redes sociales: permite redactar historias cortas, anécdotas o microficción con un estilo vívido.
- Asistente para guionistas: ayuda a generar diálogos, escenas y subtramas para series o películas, ofreciendo múltiples alternativas.
- Traducción creativa: al soportar inglés y chino, puede traducir textos narrativos manteniendo el tono y estilo literario.
- Prototipado de narrativa interactiva: en aplicaciones de ficción interactiva o juegos de texto, el modelo puede generar respuestas dinámicas y coherentes con la historia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se proporcionan comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: según la cuantización elegida, se necesitan aproximadamente:
  - Q2_K (3,9 GB): ~4 GB de VRAM, ejecutable en GPUs con 4-6 GB.
  - Q4_K_M (5,7 GB): ~6 GB de VRAM, adecuado para RTX 3060/4060 (8 GB) o superiores.
  - Q8_0 (9,6 GB): ~10 GB de VRAM, recomendado para RTX 3080/4080 o A10.
  - f16 (18,0 GB): ~18-20 GB de VRAM, requiere GPUs profesionales como A100 o RTX 4090.
- GPUs recomendadas: RTX 3060 (12 GB) para cuantizaciones bajas; RTX 3090/4090 (24 GB) para Q8_0 o f16.
- Compatibilidad con hardware de consumo: sí, las cuantizaciones Q2_K a Q6_K caben en GPUs de gama media con 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF) o TGI (si se convierte a safetensors).
- Latencia y throughput: no se proporcionan datos específicos; en una RTX 4090, un modelo de 9B en Q4_K_M suele alcanzar 50-80 tokens/s, pero esto es una estimación general no verificada para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.5-9B-DS9-USS-Defiant-GGUF (este) | ~8,95 B | no disponible | Apache 2.0 | Escritura creativa, uncensored |
| Qwen3.5-9B-Fable-5-v1-GGUF (mradermacher) | ~8,95 B | no disponible | Apache 2.0 | Ficción, roleplay |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF (DavidAU) | ~8,95 B | no disponible | Apache 2.0 | Similar, con optimizaciones adicionales |

No se dispone de datos de rendimiento comparativo. Los tres modelos comparten base Qwen3.5-9B y están orientados a escritura creativa sin restricciones, pero no hay benchmarks públicos que los diferencien.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "uncensored" y "abliterated", puede generar contenido ofensivo, violento, sexual o ilegal sin filtros, lo que lo hace inadecuado para aplicaciones comerciales o públicas sin moderación.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o incoherente, especialmente en contextos largos.
- Limitaciones de idioma: solo se declara soporte para inglés y chino; el rendimiento en otros idiomas es desconocido.
- Contexto: no se especifica la longitud de contexto; se recomienda verificar la documentación de Qwen3.5-9B para conocer el límite real.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales según el uso.
- Producción: al carecer de alineación, no es recomendable para tareas que requieran respuestas seguras, éticas o conformes a políticas de contenido.
- Cuantizaciones: los quants de baja precisión (Q2_K, Q3) pueden degradar significativamente la calidad; se recomienda Q4_K_M o superior para uso serio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-DS9-USS-Defiant-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-DS9-USS-Defiant
- Página de ayuda de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de quants de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
