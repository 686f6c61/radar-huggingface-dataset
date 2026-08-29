# mradermacher/Artemis-31B-v1.1-heretic-GGUF

## Resumen

Artemis-31B-v1.1-heretic-GGUF es una colección de cuantizaciones GGUF del modelo Artemis-31B-v1.1-heretic, publicado por mradermacher. Este modelo es una versión "decensored" (sin censura) del modelo Artemis-31B-v1.1 de TheDrummer, obtenida mediante la herramienta Heretic v1.4.0, que aplica una técnica de abliteration (ablación direccional) para eliminar el alineamiento de seguridad de forma automática. El resultado es un modelo de lenguaje de 30.7 mil millones de parámetros que responde sin las restricciones típicas de los modelos comerciales o alineados.

La relevancia de este modelo radica en su naturaleza abierta y sin filtros, pensado para usuarios que necesitan un modelo conversacional sin limitaciones de contenido, aunque con los riesgos asociados. Al estar disponible en formato GGUF, puede ejecutarse en una amplia gama de hardware, desde CPU hasta GPUs de consumo, mediante herramientas como llama.cpp u Ollama. Sin embargo, la falta de información oficial sobre licencia, arquitectura y entrenamiento limita su uso en entornos de producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo. Por el nombre y el tamaño de parámetros, se presume que se trata de un transformer denso, pero no hay confirmación. El proceso de creación documentado indica que el modelo original Artemis-31B-v1.1 de TheDrummer fue sometido a un proceso de "abliteration" mediante la herramienta Heretic v1.4.0, que elimina automáticamente la censura (safety alignment) sin necesidad de reentrenamiento. Esta técnica combina ablación direccional con optimización de hiperparámetros basada en TPE (Tree-structured Parzen Estimator) usando Optuna. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y es capaz de mantener diálogos multi-turno.
- Generación de contenido sin restricciones: al ser una versión "decensored", no aplica los filtros de seguridad habituales, por lo que puede producir respuestas que otros modelos rechazarían.
- No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso, visión o audio.
- No se dispone de información sobre capacidades multilingües específicas.

## Casos de uso

- Generación de texto creativo y roleplay: el modelo puede utilizarse para escribir ficción, guiones o diálogos sin las limitaciones de contenido habituales, lo que resulta atractivo para comunidades de escritura y juegos de rol.
- Investigación sobre alineamiento y seguridad: al ser un modelo sin censura, sirve como banco de pruebas para estudiar los efectos de la abliteration y comparar comportamientos con versiones alineadas.
- Prototipado de asistentes conversacionales en entornos controlados: desarrolladores pueden evaluar la calidad del lenguaje y la coherencia antes de aplicar sus propias capas de moderación.
- Análisis de sesgos y comportamientos no filtrados: útil para auditar qué tipo de contenido genera un modelo cuando se eliminan las restricciones de seguridad.
- Despliegue local en hardware modesto: gracias a las cuantizaciones GGUF, puede ejecutarse en CPU o GPUs de gama media, permitiendo experimentación sin depender de servicios en la nube.
- Generación de datos sintéticos para entrenamiento: el modelo puede producir respuestas variadas y sin filtros que sirvan como datos de entrenamiento o evaluación para otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - FP16 (x-f16): ~61 GB (30.7B × 2 bytes)
  - Q8_0 (8 bits): ~31 GB
  - Q6_K (6 bits): ~23 GB
  - Q4_K_S (4 bits): ~15-16 GB
  - Q2_K (2 bits): ~8-9 GB
- GPU recomendadas: para cuantizaciones de 4 bits o menos, una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40GB) es suficiente. Para FP16 se necesitaría una GPU de 64 GB o más (A100 80GB, H100).
- En CPU: con llama.cpp se puede ejecutar en modo CPU, aunque la velocidad será baja para un modelo de este tamaño.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, vLLM (si se convierte a formato compatible), TGI (con adaptaciones).
- Latencia y throughput: no se dispone de datos medidos. En una GPU de 24 GB con cuantización Q4, se puede esperar una generación de 10-20 tokens por segundo, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos de la misma categoría. Se desconoce el rendimiento relativo, la licencia y las características específicas frente a alternativas como Llama 3 30B, Qwen 2.5 32B o Mistral 31B. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Al ser una versión "decensored", el modelo puede generar contenido ofensivo, ilegal, peligroso o sexualmente explícito sin restricciones. Su uso en producción requiere una moderación externa obligatoria.
- No se ha publicado información sobre sesgos, pero al eliminar el alineamiento de seguridad, es probable que se amplifiquen los sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados.
- La licencia no está especificada, lo que impide conocer las condiciones de uso comercial, redistribución o modificación. Se recomienda contactar con el autor antes de utilizarlo en proyectos comerciales.
- No se dispone de la longitud de contexto oficial, por lo que se desconoce el límite de tokens de entrada. Es probable que sea similar a la del modelo original, pero no está confirmado.
- El proceso de abliteration puede degradar ligeramente la calidad general del modelo en tareas que requieren razonamiento complejo, aunque no hay datos que lo confirmen.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-GGUF
- Modelo original (versión decensored): https://huggingface.co/sh0ck0r/Artemis-31B-v1.1-heretic
- Modelo base de TheDrummer: https://huggingface.co/TheDrummer/Artemis-31B-v1.1 (inferido, no verificado)
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Página de LLM Explorer con información del modelo: https://llm-explorer.com/model/TheDrummer%2FArtemis-31B-v1.1,b3wENY6Rrv0fLlPFEOzKF
