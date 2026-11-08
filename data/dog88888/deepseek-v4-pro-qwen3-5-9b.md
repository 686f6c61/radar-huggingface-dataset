# dog88888/DeepSeek-V4-Pro-Qwen3.5-9B

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B es un ajuste fino orientado al razonamiento del modelo base Qwen3.5-9B, desarrollado por el usuario dog88888 (el ecosistema de la model card apunta a la cuenta Jackrong como origen de los artefactos publicados). El modelo se ha destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", concentrando la senal de aprendizaje supervisado en matematicas y resolucion de problemas STEM. La relevancia actual reside en que traslada patrones de razonamiento de un modelo docente de gran escala a una clase de 9B parametros desplegable en hardware asequible.

Con 9.653.104.368 parametros reales en safetensors y un repositorio de 19,3 GB, el modelo mantiene la eficiencia practica de la familia Qwen3.5. El entrenamiento combina SFT sobre aproximadamente 250.000 muestras centradas en matematicas y ciencia, con etapas de RL (GSPO) y soporte de decodificacion especulativa mediante MTP (multi-token prediction). La licencia Apache 2.0 y la compatibilidad con transformers, TGI y vLLM facilitan su integracion en pipelines existentes.

El modelo declara soporte para seis idiomas (ingles, chino, coreano, japones, espanol y ruso) y capacidades de tool calling y function calling, aunque el foco del ajuste es el razonamiento matematico. No se han publicado resultados de benchmarks en la informacion disponible, por lo que la evaluacion cuantitativa del rendimiento queda pendiente de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con soporte MTP para decodificacion especulativa |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes MTP, incluida Q8_0); NVFP4 evaluado en vLLM |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer denso de la familia Qwen, y anade un cabezal de multi-token prediction (MTP) que permite decodificacion especulativa y mejora el throughput en inferencia. El ajuste fino parte de aproximadamente 250.000 muestras de SFT centradas en matematicas y razonamiento cientifico, generadas por DeepSeek-V4-Pro en modo "Max Effect" como modelo docente. Sobre esta base se aplica una etapa de aprendizaje por refuerzo con GSPO (Group Sequence Policy Optimization), segun las etiquetas del repositorio.

La innovacion principal es la transferencia de patrones de descomposicion de problemas y solucion multi-paso desde un docente de gran escala a un modelo de 9B, manteniendo la eficiencia de despliegue. La model card indica que el ajuste no incluye datos SFT especificos de programacion, pero que se observan pequenas ganancias en codigo y uso de herramientas por transferencia entre dominios. Tambien se menciona una evaluacion de las rutas de despliegue vLLM NVFP4 y llama.cpp MTP-Q8_0.

## Capacidades

- Generacion de texto y razonamiento estructurado con descomposicion multi-paso de problemas.
- Razonamiento matematico y resolucion de problemas STEM, nucleo del ajuste fino.
- Generacion de codigo con ganancias limitadas por transferencia, sin SFT especifico de programacion.
- Tool calling y function calling, segun las etiquetas del repositorio.
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Procesamiento image-text-to-text segun las etiquetas del repositorio (proyector de vision referenciado en el repositorio MTP-GGUF).
- Decodificacion especulativa mediante MTP para acelerar la inferencia.

## Casos de uso

- Tutoria matematica automatizada: el modelo puede descomponer problemas de algebra, calculo o fisica en pasos intermedios y explicar el razonamiento, aprovechando las 250.000 muestras de SFT centradas en STEM.
- Generacion de soluciones paso a paso para plataformas educativas: adecuado para producir explicaciones verificables en lugar de solo respuestas finales, gracias al entrenamiento en patrones de solucion multi-paso.
- Asistente de investigacion en dominios cientificos: puede resumir y razonar sobre problemas de fisica, quimica o matematicas, con soporte multilingue para equipos internacionales.
- Automatizacion de pipelines de analisis con tool calling: integrable como agente que invoca funciones externas (calculadoras, APIs de datos) en flujos de trabajo multi-paso.
- Generacion de codigo asistida en entornos de desarrollo: aunque no recibio SFT especifico de codigo, las ganancias por transferencia permiten usarlo como asistente secundario en tareas de scripting y depuracion.
- Despliegue en hardware de consumo: con cuantizacion GGUF (Q8_0 u otras) y llama.cpp, puede ejecutarse en estaciones de trabajo con GPU consumer para prototipos y demos locales.
- Servicio de inferencia de baja latencia: la ruta vLLM con NVFP4 y el soporte MTP permiten servir el modelo en produccion con throughput mejorado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19-20 GB solo para pesos, mas overhead de contexto (estimacion a partir de los 9.653 millones de parametros).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 10-11 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB, ajustada con contexto corto).
- GPU consumer: cabe en RTX 4090 en FP16 con contexto limitado; en cuantizaciones de 8 o 4 bits cabe en GPUs de 12-16 GB como RTX 4080 o RTX 4070 Ti.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (ruta NVFP4 evaluada) y llama.cpp mediante las variantes MTP-GGUF.
- Latencia y throughput: no disponibles; la model card menciona evaluacion de MTP y NVFP4 pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B | 9,65B | no disponible | Apache 2.0 | Destilado de DeepSeek-V4-Pro, foco en matematicas y STEM, MTP |
| Qwen3.5-9B (base) | ~9B | no disponible | Apache 2.0 | Modelo base sin ajuste de razonamiento especifico |
| DeepSeek-R1-Distill-Qwen-7B | ~7B | no disponible | MIT/Apache 2.0 (segun variante) | Destilado de R1, foco en razonamiento; referencia de la categoria |

La comparativa se limita a datos estructurales porque no hay benchmarks publicados para el modelo evaluado. El modelo base Qwen3.5-9B y los destilados de DeepSeek de la misma clase son las alternativas naturales, pero la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real frente a las alternativas no esta verificado de forma independiente.
- El ajuste se centra en matematicas y STEM; el rendimiento en codigo, redaccion general o tareas creativas puede degradarse respecto al modelo base.
- Riesgo de alucinacion inherente a los modelos de razonamiento destilados, especialmente en problemas fuera del dominio de entrenamiento.
- La longitud de contexto no esta documentada, lo que dificulta planificar despliegues con ventanas largas.
- El soporte de vision se referencia en un repositorio separado (MTP-GGUF) y no esta detallado en la model card principal.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo docente (DeepSeek-V4-Pro) y del modelo base antes de uso comercial a gran escala.
- El autor es un usuario individual (dog88888 / Jackrong), no un laboratorio consolidado; la trazabilidad del entrenamiento y la reproducibilidad son limitadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dog88888/DeepSeek-V4-Pro-Qwen3.5-9B
- Repositorio del autor (Jackrong): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Variantes MTP-GGUF: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
