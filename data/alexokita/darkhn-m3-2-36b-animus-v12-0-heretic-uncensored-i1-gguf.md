# alexokita/Darkhn-M3.2-36B-Animus-V12.0-Heretic-Uncensored-i1-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF con importance matrix (i1) del modelo Darkhn-M3.2-36B-Animus-V12.0-Heretic-Uncensored, un finetune denso de Mistral de 36 000 millones de parametros orientado a roleplay y chat sin censura. La cuantizacion ha sido realizada por alexokita utilizando llama.cpp sobre una NVIDIA GB10, con calibracion mediante el dataset de imatrix de froggeric. El modelo base, desarrollado por Silicone-Moss y Darkhn, ha sido sometido a un proceso de abliteracion con la herramienta Heretic, que elimina la alineacion de seguridad mediante ablacion direccional, reduciendo los rechazos de 100 a 8 por cada 100 peticiones con una divergencia KL de 0,02 respecto al original.

Se trata de un modelo exclusivamente textual (sin componente multimodal) pensado para generacion de texto libre, especialmente en contextos de rol, narrativa y conversacion sin restricciones tematicas. La licencia Apache 2.0 permite uso comercial y modificacion, aunque el acceso al modelo base original esta restringido en Hugging Face (requiere aceptar condiciones). Esta version cuantizada facilita su ejecucion en hardware de consumo, con opciones desde 15,5 GB hasta 36,9 GB segun la precision elegida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral denso (transformers) |
| Parametros totales | 36 000 millones (segun nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ3_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-Q8_0 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo de imatrix separado) |

Todas las cuantizaciones incluyen la matriz de importancia (i1) salvo la Q8_0, que se proporciona sin imatrix. El archivo `.imatrix.gguf` de 0,02 GB permite generar cuantizaciones propias.

## Arquitectura y entrenamiento

El modelo base es un finetune de Mistral de 36 000 millones de parametros en configuracion densa, especializado en roleplay y conversacion. Sobre este finetune se ha aplicado la herramienta Heretic, que implementa una version avanzada de ablacion direccional (abliteration) combinada con un optimizador de parametros basado en TPE (Tree-structured Parzen Estimator) mediante Optuna. Este proceso elimina la capa de "seguridad" o censura sin necesidad de reentrenamiento, preservando el conocimiento subyacente del modelo.

No se dispone de informacion detallada sobre el dataset de entrenamiento del finetune original (numero de tokens, composicion, metodos de alineacion como RLHF o DPO). La cuantizacion se ha realizado con llama.cpp utilizando la tecnica de importance matrix (imatrix) con calibracion sobre el dataset `groups_merged.txt` de froggeric, con parametro `-c 512` (contexto de calibracion de 512 tokens). El resultado son cuantizaciones i1 que mejoran la calidad respecto a las cuantizaciones estaticas equivalentes, especialmente en rangos de baja precision.

## Capacidades

- Generacion de texto libre y conversacional en ingles, sin filtros de contenido.
- Roleplay y narrativa interactiva con personajes, gracias al finetune especifico para este uso.
- Chat sin restricciones tematicas, incluyendo contenido NSFW (etiquetado como "not-for-all-audiences").
- Abliteracion efectiva: solo 8 rechazos por cada 100 peticiones en la prueba del autor (Heretic trial 177), frente a los rechazos habituales de un modelo alineado.
- Soporte de contexto largo: no se especifica la longitud maxima, pero al ser un Mistral 36B es probable que herede la ventana del modelo base (no confirmado).
- Sin capacidades multimodales: no incluye proyector de vision ni soporte de audio.
- No se menciona soporte de tool calling, function calling ni modo agente en la informacion disponible.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede mantener conversaciones multi-turno con personajes definidos por el usuario, generando respuestas coherentes y sin restricciones de contenido, ideal para juegos de rol textuales o simulaciones narrativas.
- Escritura creativa sin censura: autores que necesitan explorar temas controvertidos o adultos pueden utilizar el modelo como asistente de generacion de dialogos, descripciones o tramas sin que el sistema imponga limites morales.
- Chatbots de entretenimiento para adultos: desarrollo de asistentes conversacionales con tematica NSFW, donde la ausencia de filtros es un requisito funcional.
- Experimentacion con abliteracion: investigadores y desarrolladores pueden estudiar el comportamiento de un modelo al que se le ha eliminado la alineacion de seguridad, comparando sus respuestas con las del modelo original.
- Generacion de dialogos para guiones o videojuegos: el modelo puede producir conversaciones naturales entre personajes, aprovechando su finetune en roleplay y su capacidad para mantener coherencia a lo largo de multiples intercambios.
- Pruebas de estres de sistemas de moderacion: al ser un modelo sin censura, puede utilizarse para evaluar la robustez de filtros de contenido en aplicaciones de produccion, identificando posibles fallos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona la metrica de rechazos (8/100) y la divergencia KL (0,02) como indicadores de la efectividad de la abliteracion, pero no hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de archivo, sin contar overhead del runtime):
  - i1-IQ3_M: 15,5 GB (cabe en RTX 4080/4090 de 16 GB o 24 GB)
  - i1-IQ4_XS: 18,7 GB (requiere GPU de 24 GB como RTX 3090/4090)
  - i1-Q4_K_M: 21,0 GB (recomendado para RTX 4090 24 GB)
  - i1-Q5_K_M: 24,6 GB (necesita GPU de 32 GB o mas, o descarga parcial a CPU)
  - i1-Q8_0: 36,9 GB (requiere GPU profesional como A100 40 GB o H100)
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para las cuantizaciones Q4, o GPUs de datacenter para Q8.
- En hardware de consumo, la opcion i1-Q4_K_M (21 GB) es la mas equilibrada en calidad y requisitos, pudiendo ejecutarse en una RTX 4090 con suficiente VRAM para el contexto.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Ollama, LM Studio, o servidores como vLLM con backend GGUF (si se configura adecuadamente). El modelo es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se proporcionan datos especificos. En una RTX 4090, un modelo de 36B en Q4 suele generar entre 10 y 20 tokens por segundo con llama.cpp, dependiendo del contexto y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Darkhn-M3.2-36B-Animus-V12.0-Heretic-Uncensored (este) | 36B | No disponible | Apache 2.0 | GGUF | Abliterado, sin censura, solo ingles |
| Darkhn/M3.2-36B-Animus-V8.0 | 36B | No disponible | No especificada (gated) | GGUF | Version anterior del mismo finetune, sin abliteracion |
| Otros modelos abliterados (p.ej. basados en Llama 3.1 70B) | 70B | 128K tipico | Varía (MIT, Apache) | GGUF, safetensors | Mayor tamano, mas requisitos de hardware |

No se dispone de comparativas directas con modelos de la misma categoria (finetunes de Mistral 36B sin censura) en cuanto a rendimiento o calidad. La principal diferencia frente a alternativas es la combinacion de tamano medio (36B) con licencia permisiva y ausencia de filtros, lo que lo hace adecuado para despliegues locales en GPUs de consumo.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta disenado para generar contenido NSFW y sin censura. No es apto para menores ni para entornos donde se requiera moderacion automatica.
- Sesgos y alucinaciones: al ser un modelo sin alineacion de seguridad, puede producir respuestas ofensivas, incorrectas o inventadas con mayor facilidad que un modelo alineado. No se han realizado evaluaciones de sesgo en la informacion disponible.
- Idioma: solo soporta ingles de forma fiable. El uso en otros idiomas puede degradar la calidad.
- Contexto limitado: no se ha confirmado la longitud maxima de contexto. Si el modelo base tiene una ventana corta (por ejemplo, 8K o 16K), las conversaciones muy largas pueden perder coherencia.
- Acceso al modelo base: el repositorio original de Darkhn requiere aceptar condiciones de acceso (gated). Aunque esta cuantizacion es de acceso abierto, los usuarios que quieran reproducir el proceso completo necesitarian solicitar acceso al modelo base.
- Calidad de la abliteracion: aunque la tasa de rechazos es baja (8/100), la abliteracion puede degradar ligeramente el rendimiento en tareas que dependen de la alineacion, como el seguimiento de instrucciones de seguridad. No hay benchmarks que cuantifiquen esta perdida.
- Sin soporte multimodal: no se puede utilizar para tareas de vision o audio.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/alexokita/Darkhn-M3.2-36B-Animus-V12.0-Heretic-Uncensored-i1-GGUF
- Modelo base (cuantizado por Silicone-Moss): https://huggingface.co/Silicone-Moss/Darkhn-M3.2-36B-Animus-V12.0-Heretic-Uncensored
- Modelo original (Darkhn): https://huggingface.co/Darkhn/M3.2-36B-Animus-V12.0
- Version anterior V8.0 (GGUF): https://huggingface.co/Darkhn/M3.2-36B-Animus-V8.0-GGUF
- Version anterior V8.0 (pesos): https://huggingface.co/Darkhn/M3.2-36B-Animus-V8.0
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Dataset de imatrix utilizado: https://huggingface.co/datasets/froggeric/imatrix
- Guia de cuantizaciones GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
