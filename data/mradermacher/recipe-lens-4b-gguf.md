# mradermacher/recipe-lens-4b-GGUF

## Resumen

recipe-lens-4b es un modelo de lenguaje especializado en el dominio culinario, desarrollado por sanidhya1910 y posteriormente cuantizado a formato GGUF por mradermacher para facilitar su despliegue en entornos de inferencia local. Según la descripción disponible en FriendliAI, se trata de un asistente de recetas ajustado para responder tres preguntas con salida estructurada y comprobable, lo que lo hace adecuado para aplicaciones que requieren respuestas verificables y formateadas de manera consistente.

El modelo tiene aproximadamente 4.022 millones de parámetros (4B) y está etiquetado con la arquitectura Qwen3, aunque no se dispone de confirmación oficial sobre la arquitectura exacta. Está entrenado sobre el dataset Shengtao/recipe y su licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. La versión GGUF incluye múltiples cuantizaciones que van desde Q2_K (1,8 GB) hasta f16 (8,2 GB), lo que permite ejecutarlo en una amplia gama de hardware, desde CPU hasta GPUs de consumo.

La relevancia de este modelo radica en su especialización: en lugar de ser un modelo generalista, está orientado a un caso de uso concreto (recetas de cocina) con salida estructurada, lo que puede ofrecer mayor precisión y consistencia en ese dominio frente a modelos más grandes pero menos especializados. Su tamaño compacto y las cuantizaciones disponibles lo hacen atractivo para despliegues en edge o en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3, sin confirmar) |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. La etiqueta "qwen3" en los metadatos sugiere que podria estar basado en la familia Qwen3, pero no hay confirmacion oficial. El modelo fue ajustado (fine-tuned) sobre el dataset Shengtao/recipe, que contiene datos de recetas de cocina. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se utilizaron tecnicas como RLHF o DPO.

La cuantizacion GGUF fue realizada por mradermacher mediante conversion estatica de los pesos originales en safetensors. No se han generado cuantizaciones con imatrix ni weighted, segun indica el propio autor en la model card.

## Capacidades

- Generacion de recetas de cocina: el modelo esta especializado en producir recetas, probablemente con ingredientes, pasos y tiempos.
- Salida estructurada: segun la descripcion de FriendliAI, responde a tres preguntas con formato estructurado y comprobable, lo que facilita su integracion en sistemas que requieren validacion automatica.
- Asistencia conversacional: al estar basado en un modelo de tipo chat (etiqueta "conversational"), puede mantener dialogos multi-turno sobre temas culinarios.
- Soporte de tool calling: no confirmado, aunque la etiqueta "endpoints_compatible" sugiere compatibilidad con APIs de inferencia.
- Capacidades multilingues: no disponible, el modelo declara solo ingles.

## Casos de uso

- Asistente de cocina integrado en aplicaciones moviles: el modelo puede responder preguntas sobre recetas, sugerir sustituciones de ingredientes o generar instrucciones paso a paso. Su tamano compacto permite ejecutarlo en dispositivos con recursos limitados.
- Generacion de contenido para blogs o sitios de recetas: puede producir descripciones de platos, listas de ingredientes y procedimientos de coccion de forma automatizada, con salida estructurada que facilita la publicacion.
- Sistema de recomendacion de recetas basado en ingredientes disponibles: dado su entrenamiento en datos de recetas, puede sugerir platos a partir de una lista de ingredientes proporcionada por el usuario.
- Automatizacion de respuestas en chatbots de restauracion: integrado en un servicio de atencion al cliente, puede responder consultas frecuentes sobre platos, alergenos o tiempos de preparacion.
- Educacion culinaria: como herramienta de aprendizaje, puede explicar tecnicas de cocina, terminos gastronomicos o variaciones regionales de recetas.
- Prototipado rapido de aplicaciones de IA conversacional: gracias a su licencia Apache 2.0 y a las cuantizaciones GGUF, es facil de desplegar en entornos de desarrollo para validar conceptos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco hay comparaciones con modelos similares en la documentacion publica.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion elegida, el modelo ocupa entre 1,8 GB (Q2_K) y 8,2 GB (f16). Para la cuantizacion recomendada Q4_K_M (2,6 GB), se necesita al menos 4 GB de VRAM si se carga completamente en GPU.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones pequeñas (Q2_K a Q4_K_M). Para las cuantizaciones mayores (Q6_K, Q8_0, f16) se recomienda al menos 6-8 GB de VRAM, como una RTX 3060, RTX 4060 o superior.
- Compatibilidad con consumer GPU: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de consumo como la GTX 1660 Super (6 GB) o la RTX 3050 (8 GB). Incluso puede ejecutarse en CPU con suficiente RAM (por ejemplo, 8 GB para Q4_K_M).
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y otros motores que soporten este formato. Tambien puede servirse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se dispone de mediciones publicas. En una GPU moderna, un modelo de 4B cuantizado a Q4_K_M suele generar entre 20 y 50 tokens por segundo, dependiendo del hardware y la implementacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo es un ajuste especializado sobre una base no confirmada (posiblemente Qwen3-4B), y no hay datos publicos de rendimiento que permitan contrastarlo con alternativas como Llama-3.2-3B, Phi-3-mini o Qwen2.5-3B. Se recomienda evaluar el modelo directamente en el caso de uso concreto antes de adoptarlo.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado exclusivamente en ingles y en un dataset de recetas, puede tener sesgos culturales hacia la cocina occidental o anglosajona.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar ingredientes, cantidades o pasos que no son correctos. La salida estructurada ayuda a la validacion, pero no elimina el riesgo.
- Limitaciones de contexto: no se ha publicado la longitud de contexto, por lo que no se puede garantizar un rendimiento adecuado en conversaciones muy largas o documentos extensos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- Caveat de produccion: al ser un modelo pequeno y especializado, su rendimiento en tareas fuera del dominio culinario sera limitado. No es adecuado como modelo generalista.
- Disponibilidad de cuantizaciones: las cuantizaciones estaticas no incluyen imatrix, lo que puede afectar ligeramente la calidad de las versiones de baja precision (Q2_K, Q3_K).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/recipe-lens-4b-GGUF
- Modelo base: https://huggingface.co/sanidhya1910/recipe-lens-4b
- Proyecto Recipe Lens (GitHub): https://github.com/Darshjain2005/Recipe-Lens
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/sanidhya1910/recipe-lens-4b
- Perfil de mradermacher en Hugging Face: https://huggingface.co/mradermacher
