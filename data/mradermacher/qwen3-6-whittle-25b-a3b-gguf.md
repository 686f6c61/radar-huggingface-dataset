# mradermacher/Qwen3.6-Whittle-25B-A3B-GGUF

## Resumen

Qwen3.6-Whittle-25B-A3B es un modelo de lenguaje de arquitectura MoE (Mixture of Experts) derivado de la familia Qwen3.6, desarrollado por el usuario logic65 mediante técnicas de poda de expertos (expert pruning) y destilación. El modelo original de 25.091 millones de parámetros totales ha sido reducido a solo 3.000 millones de parámetros activos por token, lo que permite un rendimiento comparable a modelos densos de tamaño similar con un coste computacional significativamente menor. Esta versión GGUF, cuantizada por mradermacher, facilita su despliegue en entornos de producción con recursos limitados.

La relevancia de este modelo radica en su enfoque de eficiencia: en lugar de entrenar un modelo pequeño desde cero, se parte de un modelo grande y se podan los expertos menos relevantes, conservando el conocimiento adquirido durante el entrenamiento original. Esto lo convierte en una opción atractiva para desarrolladores que necesitan un modelo capaz de ejecutarse en hardware de consumo sin sacrificar demasiada calidad. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con poda de expertos |
| Parametros totales | 25.091.371.648 (25,09 B) |
| Parametros activos | 3.000.000.000 (3 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-Whittle-25B-A3B emplea una arquitectura MoE con 25,09 mil millones de parametros totales, de los cuales solo 3 mil millones se activan por token procesado. La tecnica principal es la poda de expertos (expert pruning), que consiste en eliminar los expertos menos relevantes de la capa MoE del modelo original Qwen3.6, seguida de un proceso de destilacion para recuperar parte de la calidad perdida durante la poda. Este enfoque permite reducir el coste computacional en inferencia manteniendo un nivel de calidad razonable.

Los datos de entrenamiento y el proceso de destilacion no estan documentados en la informacion disponible. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion GGUF realizada por mradermacher es estatica, sin usar matrices de importancia (imatrix) ni cuantizacion ponderada, lo que puede afectar ligeramente a la calidad respecto a cuantizaciones mas sofisticadas.

## Capacidades

- Generacion de texto en ingles con razonamiento de varios pasos gracias a su arquitectura MoE.
- Soporte de tool calling y function calling, segun las etiquetas del modelo (endpoints_compatible, conversational).
- Capacidad para tareas de codigo y matematicas, aunque no se proporcionan benchmarks especificos.
- Inferencia eficiente: al activar solo 3 B de parametros, el modelo ofrece un throughput superior a un modelo denso de 25 B con requisitos de memoria reducidos.
- Compatible con el ecosistema transformers y GGUF, lo que permite su uso con llama.cpp, Ollama y otros motores de inferencia.
- No se indica soporte para vision, audio ni otros modos multimodales.

## Casos de uso

- Asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno con baja latencia gracias a su arquitectura MoE, siendo adecuado para chatbots de atencion al cliente o asistentes virtuales en aplicaciones web.
- Generacion de codigo en entornos de desarrollo: con soporte para tool calling, puede integrarse en IDE o pipelines de CI/CD para autocompletar codigo, generar tests o documentar funciones, ejecutandose en estaciones de trabajo con GPU de consumo.
- Razonamiento y analisis de documentos: su capacidad de razonamiento multi-paso permite resumir informes, extraer conclusiones o responder preguntas complejas sobre textos largos, aunque la longitud de contexto no esta especificada.
- Despliegue en edge computing: al requerir solo 3 B de parametros activos, puede ejecutarse en dispositivos con recursos limitados, como routers inteligentes o sistemas embebidos con aceleradores NPU.
- Prototipado rapido de aplicaciones NLP: su licencia Apache 2.0 y formato GGUF facilitan la experimentacion local con herramientas como Ollama o LM Studio sin necesidad de infraestructura cloud.
- Fine-tuning eficiente: aunque no se documenta, la arquitectura podria permitir fine-tuning selectivo de capas o expertos para tareas especificas con menos recursos que un modelo denso equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Se recomienda consultar la pagina del modelo base (logic65/Qwen3.6-Whittle-25B-A3B) para posibles actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 9,6 GB (Q2_K) y 26,8 GB (Q8_0) segun la cuantizacion elegida. La cuantizacion Q4_K_M (15,5 GB) es un buen equilibrio entre calidad y requisitos.
- GPU recomendadas: RTX 3090, RTX 4090 o A100 para cuantizaciones Q4 y superiores. Para Q2_K o Q3_K, una RTX 3060 de 12 GB podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizaciones Q4 o inferiores en GPUs de 16 GB o mas. La Q8_0 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptacion GGUF) y TGI (con convertidor).
- Latencia y throughput: no disponibles, pero al ser MoE con 3 B activos, se espera una velocidad de generacion superior a un modelo denso de 25 B, aproximadamente 2-3 veces mas rapido en GPUs consumer.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-Whittle-25B-A3B | 25,09 B | 3 B | no disponible | Apache 2.0 | GGUF |
| Qwen2.5-14B-Instruct | 14,8 B | 14,8 B (denso) | 128 K | Apache 2.0 | safetensors, GGUF |
| Mixtral-8x7B | 46,7 B | 12,9 B | 32 K | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B-Instruct | 8,03 B | 8,03 B (denso) | 128 K | Llama 3.1 Community | safetensors, GGUF |

La comparativa es orientativa: Qwen3.6-Whittle-25B-A3B ofrece un ratio parametros activos/totales muy favorable (12 %), similar a Mixtral (27 %), pero con un tamano total menor. Su licencia Apache 2.0 es mas permisiva que la de Llama 3.1. Sin datos de contexto ni benchmarks, es dificil posicionarlo frente a alternativas densas como Qwen2.5-14B.

## Limitaciones y advertencias

- Solo soporta ingles: no es adecuado para aplicaciones multilingues sin fine-tuning adicional.
- Longitud de contexto no documentada: se desconoce si mantiene la ventana de 128 K tokens de Qwen3.6 o si la poda la ha reducido.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo.
- Cuantizacion estatica: los quants GGUF no usan imatrix ni cuantizacion ponderada, lo que puede degradar ligeramente la calidad respecto a versiones optimizadas.
- Sin benchmarks publicados: no hay evidencia independiente de su rendimiento real, lo que dificulta evaluar su idoneidad para tareas concretas.
- Modelo experimental: al ser un modelo podado y destilado, puede presentar comportamientos inesperados en comparacion con el modelo original Qwen3.6.
- Repo de gran tamano: el repositorio GGUF ocupa 172,1 GB en total, aunque cada archivo individual se descarga por separado.

## Enlaces

- Modelo GGUF: https://huggingface.co/mradermacher/Qwen3.6-Whittle-25B-A3B-GGUF
- Modelo base: https://huggingface.co/logic65/Qwen3.6-Whittle-25B-A3B
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-Whittle-25B-A3B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
