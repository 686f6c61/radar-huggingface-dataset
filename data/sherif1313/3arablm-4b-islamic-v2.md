# sherif1313/3arabLM-4B-islamic-v2

## Resumen

3arabLM-4B-islamic-v2 es un modelo de lenguaje especializado en el patrimonio académico islámico clásico, desarrollado por sherif1313 como parte del proyecto de investigación 3arabLM. Su objetivo no es la conversación generalista, sino actuar como una "biblioteca digital comprimida" que codifica conocimiento erudito directamente en sus parámetros, siguiendo el paradigma de "recuperación desde los pesos" en lugar de depender exclusivamente de RAG. El modelo se basa en Qwen3.5-4B (4.2 mil millones de parámetros) y ha sido sometido a un entrenamiento continuado sobre el corpus Al-Maktaba Al-Shamela, abarcando seis dominios: fiqh, tafsir, hadiz, aqeedah, gramática y morfología árabe, y fatwas.

La versión actual representa menos del 5% del programa de entrenamiento continuado planificado, por lo que se trata de un modelo de investigación en fase temprana. Su relevancia radica en la propuesta de preservar la diversidad académica islámica (escuelas, metodologías, estilos de autor) y el árabe clásico, en lugar de homogeneizar el conocimiento. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial y modificación, aunque su enfoque altamente especializado limita su aplicabilidad fuera del ámbito de los estudios islámicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors en FP16) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, una arquitectura transformer densa con 32 capas, dimensión oculta de 2560 y 32 cabezas de atención, según la información del repositorio GitHub del proyecto. Sobre esta base se ha realizado un entrenamiento continuado (continued pretraining) en 16 bits sobre el corpus Shamela, dividido en seis dominios académicos: fiqh, tafsir, hadiz, aqeedah, nahw y sarf, y fatwas. El proceso se describe como "fine-tuning completo" y el checkpoint actual corresponde a 2.500 pasos de entrenamiento, lo que supone menos del 5% del programa planificado.

La filosofía de entrenamiento es "orientada a fuentes": en lugar de maximizar la diversidad de internet, se prioriza literatura académica clásica cuidadosamente seleccionada. El modelo se entrena para aprender vocabulario árabe clásico, terminología erudita, estilos de autor, estructuras de libros, argumentación académica y las diferencias metodológicas entre escuelas jurídicas e interpretativas. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento continuado.

## Capacidades

- Generacion de texto en arabe clasico y academico, con capacidad de reconstruir pasajes y argumentaciones en un estilo cercano al original.
- Comprension y generacion de contenido especializado en seis dominios: fiqh, tafsir, hadiz, aqeedah, gramatica y morfologia arabe, y fatwas.
- Preservacion de la diversidad academica: el modelo distingue entre diferentes escuelas (hanafi, maliki, shafi'i, hanbali) y entre distintos autores y obras clasicas.
- Recuperacion de conocimiento desde los pesos: el modelo puede responder preguntas o expandir pasajes basandose en el conocimiento codificado en sus parametros, sin depender de recuperacion externa.
- Soporte de conversacion multi-turno en arabe, aunque su objetivo principal no es la conversacion generalista.
- No se ha documentado soporte para tool calling, funciones de agente, vision ni audio.

## Casos de uso

- Investigacion academica en estudios islamicos: el modelo puede ayudar a localizar y reconstruir pasajes de obras clasicas como Tafsir al-Tabari o Tafsir Ibn Kathir, facilitando la comparacion de metodologias exegeticas.
- Educacion y formacion en ciencias islamicas: estudiantes y profesores pueden usarlo para generar explicaciones detalladas de conceptos de fiqh o aqeedah, con referencias a las fuentes clasicas.
- Digitalizacion y preservacion del patrimonio: el modelo puede servir para completar textos fragmentarios o reconstruir pasajes danados de manuscritos, gracias a su entrenamiento en el corpus Shamela.
- Asistencia para la redaccion de fatwas: puede generar borradores de dictamenes legales basados en las distintas escuelas juridicas, aunque siempre requerira supervision de un especialista.
- Analisis linguistico del arabe clasico: su conocimiento de nahw y sarf permite utilizarlo como herramienta de apoyo para el estudio de la gramatica y morfologia clasicas.
- Desarrollo de sistemas de recuperacion de conocimiento hibridos: combinado con RAG, puede mejorar la precision de respuestas en dominios especializados, actuando como generador de respuestas con conocimiento interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, y no se han encontrado evaluaciones cuantitativas externas. El proyecto menciona en el foro de Hugging Face la intencion de realizar evaluaciones cuantitativas y cualitativas en disciplinas islamicas, pero no se han hecho publicos los resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 4,2 B parametros en FP16, se necesitan aproximadamente 8,4 GB de VRAM para cargar los pesos completos. Con cuantizacion a 8 bits se reduciria a unos 4,2 GB, y a 4 bits a unos 2,1 GB, aunque no se han publicado archivos cuantizados.
- GPU recomendadas: una GPU con 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070) puede ejecutar el modelo en FP16 con margen para la memoria de activaciones. Para mayor comodidad, una RTX 4090 o A100 de 24 GB permitiria manejar lotes mayores.
- Si cabe en consumer GPU: si, en GPUs de consumo con al menos 8 GB de VRAM si se aplica cuantizacion, o 12 GB para FP16.
- Opciones de despliegue: al ser un modelo basado en Qwen, es compatible con frameworks como vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama y TGI. No se han publicado archivos GGUF ni AWQ en el repositorio.
- Latencia y throughput: no disponible. Dependera del hardware y del framework de inferencia utilizado.

## Comparativa con modelos similares

No se dispone de datos verificados para una comparativa cuantitativa con otros modelos arabes especializados. Existen alternativas como Jais (de G42, 13B) o AceGPT (fine-tune de LLaMA para arabe), pero no se han encontrado benchmarks publicados que permitan una comparacion directa con 3arabLM-4B-islamic-v2. La comparativa queda pendiente de futuras evaluaciones.

## Limitaciones y advertencias

- El modelo esta en una fase muy temprana de entrenamiento (menos del 5% del programa planificado), por lo que su cobertura de conocimiento es limitada y puede presentar lagunas importantes en dominios no incluidos en los seis actuales.
- No se ha documentado ningun proceso de alineacion (RLHF, DPO) ni de mitigacion de sesgos. El modelo puede reflejar los sesgos presentes en el corpus clasico, incluyendo posturas teologicas o juridicas particulares.
- Riesgo de alucinacion: al ser un modelo de generacion, puede producir citas o atribuciones incorrectas. No debe utilizarse como fuente autoritativa sin verificacion humana.
- Limitaciones de idioma: solo soporta arabe, y especificamente arabe clasico y academico. No es adecuado para arabe dialectal ni para otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no incluye garantias de exactitud ni de idoneidad para fines legales o religiosos.
- Para produccion: no se recomienda su uso en sistemas criticos sin una evaluacion exhaustiva de su precision en el dominio especifico. La ausencia de benchmarks y de documentacion sobre el proceso de entrenamiento completo dificulta la evaluacion de su fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sherif1313/3arabLM-4B-islamic-v2
- Repositorio GitHub del proyecto: https://github.com/sherif1313/3arabLM
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/sherif1313/3arabLM-4B-v2
- Documento de investigacion (PDF): https://github.com/sherif1313/3arabLM/blob/main/A_Representation_Diagnostic_Framework_for_Arabic_Heritage_Language_Models__A_Case_Study_on_Continued_Pretraining_with_the_Shamela_Corpus%20(2).pdf
- Perfil del autor en Hugging Face: https://huggingface.co/sherif1313
- Hilo de discusion sobre el proyecto: https://discuss.huggingface.co/t/request-for-feedback-and-arxiv-cs-cl-endorsement/178261/1
