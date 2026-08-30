# liodon-ai/Qwen2.5-Math-1.5B-FP8

## Resumen

El modelo `liodon-ai/Qwen2.5-Math-1.5B-FP8` es una cuantización FP8 (E4M3) dinámica del modelo base `Qwen/Qwen2.5-Math-1.5B`, desarrollado por Liodon AI. Esta versión reduce el tamaño del modelo original de 3.1 GB a 1.8 GB, manteniendo las capacidades matemáticas y de razonamiento del modelo original. Utiliza el esquema `FP8_DYNAMIC` implementado con la librería `llm-compressor`, donde los pesos se convierten a FP8 por canal de forma estática y las activaciones se cuantizan dinámicamente por token durante la inferencia, sin necesidad de un conjunto de calibración. El modelo está orientado a tareas de generación de texto y razonamiento matemático, y es compatible con motores de inferencia como vLLM, TGI y SGLang.

La relevancia de esta cuantización radica en la reducción significativa de los requisitos de memoria y el aumento del rendimiento en GPUs con soporte FP8 (compute capability ≥ 8.9), lo que lo hace adecuado para despliegues en entornos con recursos limitados, como edge computing o servidores con GPUs de gama media. Al ser una conversión directa de los pesos originales sin calibración, la pérdida de precisión es mínima, y el modelo mantiene las mismas capacidades que su versión sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3) dinamico |
| Idiomas soportados | Ingles y chino (segun el modelo base) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion FP8 del modelo base `Qwen/Qwen2.5-Math-1.5B`, que pertenece a la familia Qwen2.5 y esta especializado en tareas matematicas y de razonamiento. El modelo base fue entrenado con un corpus extenso de datos matematicos en ingles y chino, y ha sido optimizado mediante tecnicas de RLHF y DPO para mejorar su capacidad de resolver problemas paso a paso. La cuantizacion se realizo con la herramienta `llm-compressor` de vLLM, utilizando el esquema `FP8_DYNAMIC`: los pesos se convierten a FP8 por canal de forma estatica (sin calibracion), mientras que las activaciones se cuantizan dinamicamente por token durante la inferencia. Esta tecnica no introduce sesgos de calibracion y mantiene la fidelidad numerica del modelo original. La capa `lm_head` se deja sin cuantizar, ya que su impacto en la calidad es desproporcionado respecto a su tamano.

## Capacidades

- Generacion de texto y razonamiento matematico: resuelve problemas aritmeticos, algebraicos, geometricos y de logica, con explicaciones paso a paso.
- Soporte multilingue: funciona en ingles y chino, segun el modelo base.
- Modelo de solo texto: no admite entrada multimodal.
- Compatible con tecnicas de inferencia eficiente: al estar cuantizado en FP8, se beneficia de una menor huella de memoria y mayor velocidad en GPUs con soporte nativo para FP8.
- No incluye soporte explicito para tool calling ni funciones de agente, ya que es un modelo base especializado en matematicas.

## Casos de uso

- Tutoria de matematicas en linea: el modelo puede actuar como asistente que explica conceptos, resuelve ejercicios y guia al estudiante paso a paso, gracias a su capacidad de razonamiento y su tamano reducido que permite desplegarlo en servidores economicos o en el edge.
- Generacion de problemas y soluciones: util para crear contenido educativo, como hojas de ejercicios o examenes, generando enunciados y respuestas con justificaciones.
- Integracion en chatbots de atencion al cliente: cuando el usuario necesita resolver calculos, conversiones o problemas numericos dentro de una conversacion, el modelo puede ser invocado como un modulo especializado.
- Procesamiento de datos cientificos: ayuda a interpretar resultados numericos, validar formulas o realizar calculos de ingenieria en entornos de investigacion, donde se requiere una respuesta rapida y precisa.
- Analisis financiero basico: soporta calculos de intereses, porcentajes y proyecciones simples, integrable en herramientas de analisis para pequenas empresas.
- Evaluacion automatizada de respuestas matematicas: puede comparar respuestas de estudiantes con soluciones canonicas y generar retroalimentacion, aprovechando su capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 1.8 GB en disco, por lo que la VRAM necesaria para inferencia es de aproximadamente 2-3 GB (incluyendo overhead de activaciones y buffers), cabiendo en GPUs con 4 GB o mas.
- GPU recomendadas: para aprovechar el soporte FP8 nativo se requieren GPUs con compute capability ≥ 8.9, como RTX 40-series, L4/L40S, H100/H200, B100/B200 o GB10. En GPUs mas antiguas (por ejemplo, RTX 30-series), vLLM y TGI dequantizaran el modelo a BF16/FP16, perdiendo la ventaja de velocidad y memoria.
- Opciones de despliegue: compatible con vLLM, Text Generation Inference (TGI) y SGLang. Tambien puede ejecutarse con la libreria `transformers` de HuggingFace, aunque se recomiendan los motores optimizados para FP8.
- Latencia y throughput: no se proporcionan datos especificos, pero se espera una mejora de 2-3x en velocidad de inferencia comparado con el modelo original en BF16, gracias a la reduccion de memoria y al uso de operaciones FP8 en GPUs modernas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de la misma categoria. El modelo es una version cuantizada de Qwen2.5-Math-1.5B, por lo que su rendimiento deberia ser equivalente al del modelo base, con una perdida de precision minima (inferior al 1% en tareas estandar, segun lo reportado en cuantizaciones FP8 similares). No se han encontrado datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se especifica la licencia exacta; podria tener restricciones para uso comercial. Se recomienda revisar la licencia del modelo base `Qwen/Qwen2.5-Math-1.5B` antes de utilizarlo en produccion.
- Sesgos del modelo base: al ser un modelo entrenado principalmente con datos en ingles y chino, puede presentar sesgos culturales o limitaciones en otros idiomas.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas incorrectas o inventar datos, especialmente en problemas matematicos complejos o ambiguos.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible; se recomienda consultar la configuracion del modelo base para conocer el limite real.
- Requisito de hardware especifico: para aprovechar la cuantizacion FP8 se necesita una GPU con compute capability ≥ 8.9; en GPUs mas antiguas, el modelo se ejecutara en precision BF16/FP16, aumentando el uso de memoria y reduciendo la velocidad.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/liodon-ai/Qwen2.5-Math-1.5B-FP8)
- [Modelo base Qwen/Qwen2.5-Math-1.5B](https://huggingface.co/Qwen/Qwen2.5-Math-1.5B)
- [Blog oficial de Qwen sobre Qwen2.5-Math](https://qwen.ai/blog?id=qwen2.5-math)
- [Repositorio GitHub de Qwen2.5-Math](https://github.com/QwenLM/Qwen2.5-Math)
- [Sitio web de Liodon AI](https://liodon.ai/)
