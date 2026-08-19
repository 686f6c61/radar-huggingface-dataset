# Adzpro/Financial_v5

## Resumen

Financial_v5 es un modelo de lenguaje de 4.3 mil millones de parametros, desarrollado por el usuario Adzpro, que parte de la arquitectura Qwen3.5-4B y ha sido ajustado para tareas financieras. El modelo se distribuye exclusivamente en formato GGUF, convertido mediante la herramienta Unsloth, lo que lo hace compatible con motores de inferencia como llama.cpp y Ollama. Incluye un proyector multimodal (mmproj), lo que sugiere capacidades de vision ademas de texto, aunque la documentacion no especifica el detalle de dichas capacidades.

La relevancia de este modelo radica en su tamano compacto (4.326 millones de parametros), que permite su ejecucion en hardware de consumo, y en su especializacion en el dominio financiero, un area donde los modelos generalistas suelen carecer de precision terminologica y contextual. Al estar disponible en formato GGUF cuantizado (Q4_K_M), ofrece una opcion practica para despliegues locales con requisitos de hardware modestos.

Cabe destacar que la informacion publica es limitada: no se especifica la licencia, los idiomas soportados, el tamano del contexto ni los datos de entrenamiento. La ficha se basa exclusivamente en los datos disponibles en el repositorio de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (transformador, posiblemente multimodal) |
| Parametros totales | 4.326.350.848 (4,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF), F16 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M), safetensors (F16-mmproj) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B, de la familia Qwen de Alibaba, que emplea una topologia transformer con atencion por ventanas deslizantes y atencion completa alternadas. El ajuste fino se realizo con la herramienta Unsloth, que optimiza el entrenamiento mediante kernels de CUDA personalizados y reduce el uso de memoria, permitiendo un entrenamiento aproximadamente dos veces mas rapido que los metodos convencionales.

El proceso de conversion a GGUF incluye un archivo de proyector multimodal (F16-mmproj), lo que indica que el modelo base original era un vision-language model (VLM). Sin embargo, no se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica si el ajuste fino se realizo exclusivamente sobre la capa de lenguaje o si tambien se ajustaron los componentes de vision.

## Capacidades

- Generacion de texto en el dominio financiero, con terminologia especializada (inferido por el nombre del modelo, no verificado).
- Procesamiento multimodal: incluye un proyector de vision (mmproj), lo que sugiere capacidad para procesar imagenes ademas de texto.
- Compatibilidad con llama.cpp y motores compatibles con GGUF, incluyendo la interfaz de linea de comandos `llama-cli` y `llama-mtmd-cli` para modelos multimodales.
- Ejecucion local eficiente gracias a la cuantizacion Q4_K_M, que reduce significativamente los requisitos de memoria.
- Integracion con el ecosistema Unsloth para futuras re-conversiones o ajustes.

No se dispone de informacion sobre soporte de tool calling, function calling, capacidades de agente o razonamiento multi-paso.

## Casos de uso

- Analisis de documentos financieros: el modelo puede procesar estados financieros, informes anuales o extractos bancarios, extrayendo metricas clave y resumiendo la situacion economica de una empresa. Su especializacion en el dominio financiero deberia mejorar la precision en la interpretacion de jerga contable.
- Clasificacion de noticias economicas: dado su enfoque financiero, puede categorizar noticias por sentimiento (positivo, negativo, neutral) o por sector (banca, energia, tecnologia), facilitando el seguimiento de mercados.
- Generacion de informes de inversion: a partir de datos estructurados, el modelo puede redactar resumenes ejecutivos o descripciones de carteras, aunque se recomienda validar los datos generados.
- Asistente de atencion al cliente bancario: con su capacidad multimodal, podria procesar capturas de pantalla de extractos o comprobantes de transferencia y responder preguntas frecuentes sobre operaciones.
- Extraccion de informacion de facturas y recibos: la combinacion de vision y lenguaje permite extraer campos como importes, fechas o conceptos de documentos escaneados.
- Educacion financiera: puede generar explicaciones adaptadas a distintos niveles de conocimiento sobre conceptos como interes compuesto, diversificacion o productos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M tiene un tamano aproximado de 2,5-3 GB (dado que el repositorio total es de 3,5 GB incluyendo el proyector F16). Se recomienda un minimo de 4 GB de VRAM para una ejecucion comoda.
- GPU recomendadas: tarjetas de gama media como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Tambien puede ejecutarse en Apple Silicon con al menos 8 GB de memoria unificada.
- Si cabe en consumer GPU: si, en la mayoria de GPUs de consumo actuales con 6 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp (llama-cli o llama-mtmd-cli), Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput estimados: no disponibles, pero para un modelo de 4,3 B en Q4_K_M se esperan velocidades de 20-40 tokens/s en una RTX 3060.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| Financial_v5 (Adzpro) | 4,3 B | no disponible | no disponible | GGUF | Finanzas |
| Qwen2.5-3B-Instruct | 3,1 B | 32 K | Apache 2.0 | Safetensors, GGUF | Generalista |
| Llama-3.2-3B-Instruct | 3,2 B | 128 K | Llama 3.2 Community | Safetensors, GGUF | Generalista |
| Phi-3.5-mini-instruct | 3,8 B | 128 K | MIT | Safetensors, GGUF | Generalista, razonamiento |

La comparativa es orientativa: Financial_v5 se distingue por su enfoque en el dominio financiero, aunque carece de la documentacion abierta de los modelos de referencia. Qwen2.5-3B y Llama-3.2-3B ofrecen contextos mucho mas largos y licencias permisivas, mientras que Financial_v5 no especifica su licencia ni su contexto.

## Limitaciones y advertencias

- Licencia no especificada: no se puede determinar si el modelo es apto para uso comercial. Se recomienda contactar al autor antes de utilizarlo en produccion.
- Idiomas no documentados: se desconoce si el modelo soporta espanol, ingles u otros idiomas. El nombre sugiere un enfoque en mercados financieros, pero no hay evidencia concreta.
- Sin datos de entrenamiento: no se ha publicado informacion sobre el dataset utilizado, lo que impide evaluar posibles sesgos o la calidad de los datos financieros.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion financiera incorrecta o inventada. Nunca debe utilizarse para tomar decisiones de inversion sin verificacion humana.
- Contexto limitado: al no conocer la longitud de contexto, no se puede garantizar el procesamiento de documentos largos como informes anuales completos.
- Capacidad multimodal no verificada: aunque incluye un proyector de vision, no hay ejemplos ni benchmarks que confirmen su funcionamiento correcto.
- Fecha de creacion atipica: el modelo fue creado en agosto de 2026, lo que podria indicar un error en los metadatos o un modelo muy reciente con poca adopcion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Adzpro/Financial_v5
- Herramienta Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
