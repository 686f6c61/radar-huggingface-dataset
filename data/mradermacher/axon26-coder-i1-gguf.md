# mradermacher/Axon26-Coder-i1-GGUF

## Resumen

Axon26-Coder-i1 es una versión cuantizada en formato GGUF del modelo Axon26-Coder, desarrollado por AIencoder y publicado en HuggingFace por el usuario mradermacher. Este repositorio contiene exclusivamente pesos cuantizados con calibración imatrix, lo que lo hace adecuado para inferencia local eficiente en CPU y GPU con herramientas como llama.cpp o Ollama. El modelo original cuenta con aproximadamente 7.248 millones de parámetros (7,2 mil millones), lo que lo sitúa en la gama de modelos de tamaño medio, pensado para tareas de generación de código y conversación técnica.

La relevancia de esta publicación radica en que ofrece múltiples niveles de cuantización (desde Q2_K hasta Q6_K, incluyendo variantes IQ) que permiten ajustar el equilibrio entre calidad y consumo de recursos. Sin embargo, la información disponible es muy limitada: no se especifican arquitectura, contexto, licencia ni datos de entrenamiento, por lo que cualquier evaluación técnica debe basarse en pruebas directas del modelo o en la documentación del repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.248.023.552 (7,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con cuantizacion imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo original Axon26-Coder. El nombre sugiere que esta orientado a tareas de programacion ("Coder"), pero no se confirma si se basa en un transformer denso, MoE o alguna arquitectura hibrida. Tampoco se han publicado datos sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. La unica informacion tecnica disponible es que los pesos se han convertido al formato GGUF y se han cuantizado con la tecnica imatrix, que mejora la precision de las cuantizaciones de baja precision al calibrar con datos representativos.

## Capacidades

- Generacion de codigo fuente en multiples lenguajes de programacion (inferido por el nombre "Coder", aunque no hay evidencia publica).
- Conversacion tecnica y asistencia en tareas de desarrollo de software (segun el tag "conversational").
- Compatible con endpoints de inferencia local (tag "endpoints_compatible").
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente de programacion local: al ser un modelo GGUF cuantizado, puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp u Ollama, ofreciendo autocompletado y generacion de codigo en entornos de desarrollo integrados.
- Automatizacion de tareas de codigo en pipelines CI/CD: su naturaleza conversacional permite integrarlo en bots de revision de codigo o generacion de tests, aunque se requiere validar su rendimiento real.
- Prototipado rapido de aplicaciones: un desarrollador puede usarlo para generar esqueletos de funciones, scripts o consultas SQL directamente desde la terminal.
- Educacion y formacion en programacion: puede servir como tutor interactivo que explica conceptos y propone ejercicios, siempre que se supervise su salida.
- Procesamiento de documentacion tecnica: capaz de resumir o reformular textos relacionados con desarrollo de software, aunque sin datos de idiomas soportados no se puede garantizar la cobertura.
- Despliegue en entornos con restricciones de conectividad: al ser un modelo local, funciona sin acceso a la nube, lo que es util en entornos corporativos con politicas de privacidad estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo. Tampoco hay comparaciones con modelos similares en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para un modelo de 7,2 B, las cuantizaciones Q4_K_M o Q5_K_M requieren aproximadamente 4-5 GB de VRAM en GPU. Las variantes Q2_K o IQ2 pueden reducir el uso a 2-3 GB, mientras que Q6_K puede necesitar alrededor de 6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1660, RTX 2060, RTX 3060) puede ejecutar cuantizaciones Q4 o inferiores. Para cuantizaciones altas (Q6_K) se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4070, etc.).
- Si cabe en consumer GPU: si, las cuantizaciones Q2-Q4 caben en GPUs de gama media y baja. Las variantes Q5/Q6 requieren GPUs con 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si se convierte a otro formato), y cualquier backend compatible con GGUF.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la cuantizacion elegida. En una GPU moderna, un modelo de 7 B en Q4 suele generar entre 20 y 50 tokens por segundo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo Axon26-Coder no aparece en rankings publicos ni en evaluaciones independientes. Como referencia generica, modelos de tamano similar (7-8 B) como Mistral-7B, Llama-3.1-8B o CodeLlama-7B suelen ofrecer mejores garantias de rendimiento documentado, pero no se pueden contrastar con este modelo sin datos reales.

## Limitaciones y advertencias

- No hay informacion sobre sesgos, riesgos de alucinacion ni limitaciones de contexto.
- La licencia no esta especificada, por lo que no se puede garantizar su uso comercial sin autorizacion previa de los autores.
- Al ser una cuantizacion de un modelo del que se desconoce su entrenamiento, la calidad de las respuestas puede variar significativamente respecto a la version original.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo poco probado o reciente.
- No se incluyen instrucciones de uso, ni ejemplos de prompt, ni documentacion sobre el contexto maximo soportado.
- Para entornos de produccion, se recomienda encarecidamente validar el modelo con datos propios antes de implementarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Axon26-Coder-i1-GGUF
- Modelo original (AIencoder/Axon26-Coder): https://huggingface.co/AIencoder/Axon26-Coder
- No se han encontrado papers, blogs o demos adicionales en la informacion proporcionada.
