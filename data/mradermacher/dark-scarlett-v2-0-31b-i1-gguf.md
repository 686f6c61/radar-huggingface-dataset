# mradermacher/Dark-Scarlett-v2.0-31B-i1-GGUF

## Resumen

Dark-Scarlett-v2.0-31B-i1-GGUF es una cuantización en formato GGUF del modelo base ReadyArt/Dark-Scarlett-v2.0-31B, realizada por mradermacher. El modelo original es un fine-tune de la familia Gemma-4 (según las etiquetas del repositorio) orientado a roleplay, conversación y generación de contenido sin censura, con licencia Apache 2.0. Esta versión cuantizada permite ejecutar el modelo en hardware de consumo con un tamaño reducido, manteniendo la mayor parte de las capacidades del original.

El repositorio actual contiene únicamente un quant tipo i1-Q2_K de aproximadamente 12 GB, junto con un archivo de imatrix para crear cuantizaciones personalizadas. El modelo base tiene 30.697.345.596 parámetros (unos 30,7 mil millones) y está diseñado para tareas de chat y roleplay en inglés. Aunque el modelo original es de visión, esta versión GGUF no incluye el proyector de visión (mmproj), que debe descargarse por separado desde el repositorio estático.

La relevancia de este modelo radica en su naturaleza "unaligned" (sin alineación), lo que lo hace adecuado para aplicaciones de roleplay adulto y generación de contenido explícito, un nicho con demanda en la comunidad de IA local. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere Gemma-4 por etiquetas, sin confirmación oficial) |
| Parametros totales | 30.697.345.596 (aprox. 30,7 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (único quant listado en este repo; se mencionan otros en el repo estático) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Las etiquetas del repositorio indican que pertenece a la familia Gemma-4, pero no se especifican detalles como el número de capas, la configuración de atención o el mecanismo de visión. El modelo original es un fine-tune orientado a roleplay y conversación, con un enfoque en contenido sin censura y explícito. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La cuantización fue realizada por mradermacher utilizando el método imatrix, que optimiza la calidad de los quants de baja precisión.

## Capacidades

- Generación de texto conversacional y roleplay, con soporte para instrucciones (instruct).
- Contenido sin censura y explícito (NSFW), gracias a su naturaleza "unaligned".
- Capacidades de visión en el modelo base, aunque el GGUF actual no incluye el proyector de visión (mmproj) y requiere archivos adicionales del repositorio estático.
- Multilingüe: no, solo inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no especificado.

## Casos de uso

- Roleplay conversacional: el modelo está diseñado para mantener diálogos inmersivos y sin restricciones, ideal para juegos de rol textuales o chatbots de personajes. Su ventana de contexto (aunque no especificada) debería ser suficiente para conversaciones largas.
- Generación de historias eróticas o adultas: gracias a su licencia Apache 2.0 y su falta de alineación, puede generar contenido explícito bajo demanda, algo que los modelos comerciales suelen bloquear.
- Asistente de escritura creativa: puede ayudar a redactar diálogos, descripciones y tramas con un tono maduro, útil para autores de ficción adulta.
- Chatbot personalizado sin censura: se puede integrar en aplicaciones de chat locales (por ejemplo, con Ollama o llama.cpp) para ofrecer respuestas sin filtros temáticos.
- Experimentación con cuantización: el archivo imatrix incluido permite a los desarrolladores crear sus propios quants adaptados a hardware específico, útil para investigación en compresión de modelos.
- Despliegue en entornos con recursos limitados: el quant i1-Q2_K de 12 GB permite ejecutar el modelo en GPUs de consumo con 16 GB de VRAM, posibilitando inferencia local en equipos domésticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o su versión cuantizada.

## Requisitos de hardware

- El quant i1-Q2_K ocupa aproximadamente 12 GB en disco. Para inferencia, se necesita al menos 12 GB de VRAM, más overhead del runtime (típicamente 1-2 GB adicionales). Una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, o una A2000) sería suficiente.
- Para GPUs con menos VRAM (8-12 GB), se podría intentar cargar el modelo con offloading a CPU, pero el rendimiento sería limitado. No se recomienda para uso interactivo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También se puede usar vLLM si se convierte a otro formato, pero no es el flujo habitual.
- Latencia y throughput: no disponibles. Dependerá del hardware y del número de tokens generados.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (roleplay sin censura). No se han encontrado datos sobre modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW y sin censura: el modelo puede generar material explícito, ofensivo o inapropiado. No es adecuado para aplicaciones dirigidas a menores o entornos profesionales sin control de contenido.
- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo sin alineación, es probable que refleje sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos de roleplay donde la creatividad es alta.
- Limitaciones de idioma: solo soporta inglés, lo que limita su uso en otros idiomas.
- Funcionalidad de visión incompleta: el GGUF actual no incluye el proyector de visión; para usar la entrada de imágenes se debe descargar el archivo mmproj del repositorio estático, que no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a otras regulaciones legales según la jurisdicción.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/mradermacher/Dark-Scarlett-v2.0-31B-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v2.0-31B
- Repositorio estático de quants (mencionado en la model card): https://huggingface.co/mradermacher/Dark-Scarlett-v2.0-31B-GGUF
- Página de mradermacher en HuggingFace: https://huggingface.co/mradermacher
- Página de solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
