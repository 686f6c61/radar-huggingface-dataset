# sitharo/finer-sql-baseline-05b

## Resumen

El modelo `sitharo/finer-sql-baseline-05b` es un modelo de lenguaje de 494 millones de parámetros, desarrollado por el usuario sitharo, que ha sido fine-tuned para la tarea de Text-to-SQL. Se basa en la arquitectura Qwen2, tal y como indica la etiqueta `qwen2` en HuggingFace, y ha sido entrenado mediante supervisión fina (SFT) usando la librería `trl`. El nombre del modelo sugiere que actúa como un baseline dentro del proyecto FINER-SQL, que se presenta en un artículo de ICDE 2026 y que propone técnicas para potenciar modelos pequeños en la generación de consultas SQL mediante feedback de ejecución y recompensas eficientes.

Su relevancia radica en ofrecer una alternativa ligera y desplegable en entornos con recursos limitados, sin depender de grandes modelos propietarios. Con un tamaño de menos de 500 millones de parámetros, puede ejecutarse en hardware de consumo, lo que lo hace atractivo para aplicaciones on-premise donde la privacidad de los datos o la latencia son críticas. La información disponible sobre el modelo es escasa: la model card es una plantilla automática y no se han publicado resultados de benchmarks en el repositorio de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la familia Qwen2, con un total de 494 millones de parámetros. El proceso de fine-tuning se realizó con la librería `trl` y la técnica de supervisión fina (SFT), según las etiquetas del repositorio. No se proporcionan detalles sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El nombre del modelo y el contexto del proyecto FINER-SQL indican que el entrenamiento está orientado a la generación de consultas SQL a partir de lenguaje natural, pero no se dispone de información técnica adicional sobre el procedimiento exacto, hiperparámetros o infraestructura de cómputo.

## Capacidades

- Generación de consultas SQL a partir de texto natural, según el propósito del modelo dentro del proyecto FINER-SQL.
- No se ha documentado soporte para tool calling o function calling en la información disponible.
- No se ha documentado soporte para agentes ni razonamiento multi-paso más allá de la generación de SQL.
- Las capacidades multilingües no están especificadas.
- No se ha documentado soporte para visión, audio u otras modalidades.

## Casos de uso

- Asistente de consultas SQL para analistas de datos en entornos locales: el modelo puede traducir preguntas en lenguaje natural a sentencias SQL, lo que resulta útil en herramientas internas donde los datos no deben salir de la infraestructura. Su tamaño reducido permite ejecutarlo en estaciones de trabajo con GPU de consumo.
- Generación de consultas en pipelines de ETL: al ser un modelo pequeño, puede integrarse en flujos de procesamiento por lotes para transformar descripciones de negocio en consultas SQL sin necesidad de servicios externos.
- Herramientas de inteligencia de negocio (BI) con generación de informes: el modelo puede utilizarse como backend para asistentes que permitan a usuarios no técnicos formular preguntas sobre bases de datos relacionales, reduciendo la barrera de entrada para el análisis de datos.
- Prototipado rápido de consultas en desarrollo de software: los desarrolladores pueden emplear el modelo para generar esqueletos de consultas SQL a partir de descripciones en lenguaje natural, agilizando la fase de diseño de la capa de acceso a datos.
- Educación y formación en SQL: el modelo puede servir como herramienta de práctica en plataformas educativas, generando consultas de ejemplo a partir de ejercicios planteados en lenguaje natural.
- Despliegue en dispositivos con recursos limitados: dado su tamaño de 0.5B, el modelo puede ejecutarse en portátiles o servidores de gama baja, lo que permite construir aplicaciones de generación de SQL en entornos sin acceso a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de evaluacion como MMLU, HumanEval, GSM8K o metricas especificas para Text-to-SQL en el repositorio de HuggingFace ni en los enlaces encontrados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16, 2 GB en FP32 y 0.3 GB en cuantizacion de 4 bits. Estas cifras son estimaciones basadas en el numero de parametros y no estan confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1650 o superior. En produccion, una RTX 3060 o similar ofrece margen suficiente para inferencia con cuantizacion.
- El modelo cabe en GPUs de consumo y tambien puede ejecutarse en CPU con cuantizacion, aunque con mayor latencia.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y el soporte nativo de Transformers para inferencia con `text-generation-inference`.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de rendimiento.

## Comparativa con modelos similares

No se han encontrado modelos comparables de la misma categoria en la informacion disponible. No se dispone de datos de rendimiento ni especificaciones de modelos alternativos de Text-to-SQL de tamano similar para establecer una comparativa.

## Limitaciones y advertencias

- La model card no incluye informacion sobre sesgos, riesgos o limitaciones especificas. Como modelo pequeno, es probable que presente una mayor tasa de alucinacion que modelos de mayor tamano, especialmente en consultas SQL complejas o con un contexto largo.
- No se ha confirmado la longitud de contexto soportada, por lo que puede degradarse en conversaciones largas o consultas con muchas tablas.
- La licencia no esta disponible, lo que genera incertidumbre sobre el uso comercial. Es recomendable contactar con el autor antes de desplegar el modelo en produccion.
- El modelo ha sido entrenado especificamente para Text-to-SQL, por lo que su uso fuera de este dominio puede producir resultados poco fiables.
- No se han publicado evaluaciones independientes, por lo que no es posible validar su rendimiento en entornos reales.

## Enlaces

- HuggingFace: https://huggingface.co/sitharo/finer-sql-baseline-05b
- Repositorio GitHub del proyecto FINER-SQL: https://github.com/thanhdath/finer-sql
- Articulo de arXiv: https://arxiv.org/abs/2605.03465
