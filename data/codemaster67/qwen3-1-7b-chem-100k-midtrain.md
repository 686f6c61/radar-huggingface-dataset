# Codemaster67/qwen3-1.7b-chem-100k-midtrain

## Resumen

`Codemaster67/qwen3-1.7b-chem-100k-midtrain` es un adaptador LoRA (librería PEFT 0.20.0, pesos en safetensors) construido sobre el modelo denso `Qwen/Qwen3-1.7B` de Alibaba Qwen. No es un modelo autónomo: requiere cargar el modelo base y aplicar el adaptador encima, o bien fusionar ambos pesos antes del despliegue. El nombre sugiere un "midtrain" (entrenamiento continuado sobre corpus de dominio) con aproximadamente 100.000 muestras de química, aunque esa cifra no aparece confirmada en ninguna parte de la model card.

La model card publicada es la plantilla por defecto de Hugging Face sin rellenar: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, hiperparámetros, evaluación) contienen el marcador `[More Information Needed]`. El repositorio no tiene descargas ni "likes" y se creó el 27 de octubre de 2026, por lo que se trata de una publicación sin validación externa ni tracción comunitaria.

Su interés práctico es acotado pero concreto: si el adaptador funciona, ofrece una vía de bajo coste (0,8 GB de artefacto, sin necesidad de reentrenar el base) para especializar un modelo de 1,7 mil millones de parámetros en terminología y tareas químicas, desplegable en GPU de consumo. La contrapartida es que no existe ninguna evidencia publicada de que el fine-tuning haya funcionado: ni benchmarks, ni ejemplos, ni documentación del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso Qwen3 |
| Parametros totales | ~1,7 mil millones en el modelo base; parametros adicionales del adaptador no disponibles (repo de 0,8 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base; ampliable a 131.072 con YaRN (no verificado en este fine-tune) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizacion de 8 y 4 bits (GPTQ, AWQ, GGUF) tras fusionar pesos |
| Idiomas soportados | No disponibles en la model card; el modelo base Qwen3 declara soporte de 119 idiomas y dialectos |
| Licencia | No disponible para el adaptador; el modelo base Qwen3-1.7B se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT); no se publica GGUF ni pesos fusionados |
| Modelo base | Qwen/Qwen3-1.7B |
| Libreria | peft 0.20.0 / transformers |
| Tamano del repositorio | 0,8 GB |
| Rango y modulos LoRA | No disponible |
| Fecha de publicacion | 2026-10-27 |

## Arquitectura y entrenamiento

El artefacto es un conjunto de matrices de bajo rango (LoRA, arXiv:1910.09700, referencia que aparece en los tags de la model card) que se suman a las proyecciones del transformer Qwen3-1.7B. El modelo base es un decoder-only denso con atención de tipo grouped-query, tokenizador con vocabulario de 151.936 entradas y ventana nativa de 32.768 tokens, entrenado por Alibaba Qwen con un pipeline que incluye preentrenamiento multilingüe a gran escala y posteriores fases de ajuste por instrucciones y preferencias. El adaptador hereda, en principio, la plantilla de chat y el modo "thinking" del base, aunque no hay ninguna confirmación de que el fine-tuning los preserve.

No se ha publicado ningún detalle del entrenamiento: ni el rango y alpha del LoRA, ni los módulos objetivo, ni la tasa de aprendizaje, el número de épocas, la composición exacta del corpus "chem-100k", la procedencia de los datos ni si hubo fases de RLHF/DPO. El sufijo "midtrain" sugiere entrenamiento continuado sobre corpus de dominio más que ajuste instructivo supervisado, lo que implicaría que el adaptador modifica conocimiento factual y registro lingüístico pero no necesariamente el comportamiento conversacional. Esta interpretación es una inferencia a partir del nombre, no un dato documentado.

## Capacidades

- Generación de texto en el dominio químico (nombre, fórmulas, terminología, reacciones), presumiblemente el objetivo del entrenamiento; sin evaluación publicada que lo confirme.
- Razonamiento y matemáticas básicas heredados del modelo base Qwen3-1.7B, con la salvedad de que el fine-tuning puede degradarlos.
- Modo "thinking" (cadena de razonamiento explícita) y modo directo, si el adaptador no ha alterado la plantilla de chat del base.
- Soporte de tool calling / function calling vía plantilla de chat estilo Hermes del base; no verificado tras el fine-tuning.
- Capacidades multilingües heredadas (el base declara 119 idiomas); el adaptador podría haber sesgado la distribución hacia el idioma del corpus químico, desconocido.
- No hay evidencia de capacidades de visión, audio ni multimodalidad: el modelo base es exclusivamente de texto.
- No dispone de "system prompt" documentado propio ni de guía de formato de respuesta.

## Casos de uso

- Asistente de consulta química interna: desplegar el adaptador sobre Qwen3-1.7B para responder preguntas sobre nomenclatura IUPAC, propiedades y compatibilidades, con la ventaja de que un modelo de 1,7B cabe en una sola GPU de consumo y el coste por consulta es mínimo; requiere validación previa contra el base para comprobar que el adaptador aporta y no degrada.
- Normalización y extracción de entidades en textos científicos: usar el modelo para convertir descripciones libres de compuestos y reacciones en campos estructurados (fórmula, peso molecular, grupo funcional) dentro de un pipeline ETL de literatura química.
- Preetiquetado de datasets químicos: generar anotaciones preliminares (categoría de reacción, tipo de compuesto) que luego revisa un experto, aprovechando el bajo coste de inferencia frente a modelos de mayor tamaño.
- Base para un clasificador o reranker especializado: congelar el adaptador y añadir una cabeza de clasificación para tareas de filtrado de documentos químicos o detección de materiales peligrosos en textos.
- Prototipado y evaluación comparativa de "midtraining": servir como punto de partida reproducible para experimentos de adaptación de dominio en modelos pequeños, comparando el adaptador contra el base con el mismo prompt y la misma semilla.
- Generación de borradores en herramientas de autoría científica: sugerencias de texto técnico y reformulación de párrafos con vocabulario químico, siempre con revisión humana y sin uso como fuente de verdad factual.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse en local sobre una RTX 4060 Ti o superior, permite procesar documentación química confidencial sin enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna sección de evaluación rellenada, no hay comparación con el modelo base ni con otros adaptadores, y el repositorio no contiene scripts de evaluación ni ficheros de resultados. Tampoco existen métricas de pérdida de entrenamiento publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 3,5-4 GB solo para los pesos del modelo base de 1,7B, más caché KV y overhead del runtime; con 8 GB de VRAM se opera con comodidad a contextos moderados.
- Cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 1,1-1,3 GB de pesos, ejecutable en GPUs de 4 GB y en CPU con llama.cpp u Ollama, siempre que se fusionen previamente adaptador y modelo base.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o L4 para despliegues con concurrencia; A100/H100 no son necesarias para este tamaño y solo se justifican por agregación de peticiones.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en bf16 y desde 4 GB con cuantización de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador, la única ruta que no exige fusionar), `vLLM` y `TGI` (requieren fusionar los pesos con `merge_and_unload` antes de servir), `llama.cpp`/`Ollama` (requieren conversión a GGUF tras la fusión).
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición para este adaptador; cualquier cifra sería una extrapolación del base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Adaptacion a dominio | Benchmarks publicados |
|---|---|---|---|---|---|
| Codemaster67/qwen3-1.7b-chem-100k-midtrain | ~1,7B (base) + LoRA | 32.768 (heredado) | No disponible (base Apache 2.0) | Si, quimica (no verificada) | No disponible |
| Qwen/Qwen3-1.7B (base) | ~1,7B | 32.768, ampliable a 131.072 con YaRN | Apache 2.0 | No | Si, en el informe tecnico de Qwen3 |
| Qwen/Qwen2.5-1.5B | ~1,5B | 32.768 | Apache 2.0 | No | Si, en la model card del autor |
| meta-llama/Llama-3.2-1B | ~1,23B | 128.000 | Licencia comunitaria Llama 3.2 | No | Si, en la model card del autor |
| HuggingFaceTB/SmolLM2-1.7B | ~1,7B | 8.192 | Apache 2.0 | No | Si, en la model card del autor |

La comparación relevante no es de rendimiento —no hay datos del adaptador— sino de encaje: frente al Qwen3-1.7B original, este artefacto solo se justifica si el midtrain químico aporta una mejora medible, algo que el autor no demuestra. Frente a alternativas de tamaño similar, la ventaja sería la especialización; la desventaja, la ausencia de licencia clara y de cualquier evaluación.

## Limitaciones y advertencias

- Model card sin rellenar: todos los campos sustantivos son marcadores `[More Information Needed]`; no hay información sobre datos, hiperparámetros ni evaluación.
- Licencia del adaptador no declarada. Aunque el modelo base es Apache 2.0, la ausencia de licencia explícita en el repositorio genera incertidumbre jurídica para uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- Procedencia del corpus "chem-100k" desconocida: no se puede verificar la legitimidad de los datos, su calidad, ni si contienen información química peligrosa (síntesis, precursores, toxicología) que el modelo podría reproducir.
- Riesgo elevado de alucinación factual en un dominio donde los errores tienen consecuencias: fórmulas, pesos moleculares, condiciones de reacción y compatibilidades deben verificarse siempre contra fuentes primarias.
- Sin evidencia de que el fine-tuning preserve las capacidades del base: el midtrain sobre dominio estrecho puede degradar el razonamiento general, el multilingüismo y el seguimiento de instrucciones. Es obligatorio ejecutar una evaluación diferencial contra Qwen3-1.7B antes de adoptarlo.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el usuario debe fusionar y convertir los pesos por su cuenta.
- Cero tracción (0 descargas, 0 likes) y publicación reciente: no hay informes de terceros, incidencias resueltas ni mantenimiento demostrado.
- El modo "thinking" y el soporte de tool calling pueden haberse visto alterados por el entrenamiento; no hay documentación al respecto.
- No apto como fuente de verdad en contextos regulados (farmacéutico, sanitario, seguridad química) sin validación humana y trazabilidad documental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Codemaster67/qwen3-1.7b-chem-100k-midtrain
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Paper de LoRA (arXiv:1910.09700, referenciado en los tags del modelo): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Librería PEFT en Hugging Face: https://huggingface.co/docs/peft/index
