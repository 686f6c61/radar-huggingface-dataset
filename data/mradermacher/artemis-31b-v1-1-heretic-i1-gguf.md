# mradermacher/Artemis-31B-v1.1-heretic-i1-GGUF

## Resumen

Artemis-31B-v1.1-heretic-i1-GGUF es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `sh0ck0r/Artemis-31B-v1.1-heretic`, un modelo de lenguaje de 30.697 millones de parámetros (~31B) desarrollado por el usuario sh0ck0r y cuantizado por mradermacher. El término "heretic" hace referencia a que el modelo ha sido sometido a un proceso de ablación direccional (abliteration) mediante la herramienta Heretic, que elimina automáticamente la alineación de seguridad (censura) de los pesos del modelo sin necesidad de post-entrenamiento adicional. Esto lo convierte en un modelo "uncensored" o "decensored", orientado a usos donde se requiere generación de texto sin restricciones temáticas.

La relevancia de este modelo radica en que ofrece una alternativa de código abierto para desarrolladores e investigadores que necesitan un LLM de gran tamaño sin filtros de seguridad, con la ventaja de estar disponible en múltiples cuantizaciones GGUF que permiten ejecutarlo en hardware de consumo. El repositorio incluye desde cuantizaciones de baja precisión (IQ2_M, 11 GB) hasta Q6_K (25,3 GB), lo que facilita su despliegue en GPUs con distinta capacidad de VRAM. El modelo está etiquetado como "conversational" y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, sin especificar variante) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (todos con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivo imatrix adicional) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Artemis-31B-v1.1-heretic. Dado que es un modelo de 31B parametros y se integra con la libreria transformers, se asume una arquitectura transformer decoder-only, pero no se confirma el tipo exacto (p. ej., Llama, Mistral, etc.) ni el numero de capas, cabezas de atencion o dimensiones ocultas. Tampoco se conocen los datos de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO.

Lo que si se sabe es que el modelo base ha sido procesado con la herramienta Heretic, que implementa una combinacion de ablacion direccional (abliteration) y un optimizador de parametros basado en TPE (Tree-structured Parzen Estimator) con Optuna. Este proceso elimina de forma automatica la "safety alignment" de los pesos, es decir, las direcciones en el espacio de activaciones que el modelo aprendio para rechazar o redirigir ciertos contenidos. El resultado es un modelo que no aplica los filtros de seguridad tipicos de los LLM comerciales o alineados.

La cuantizacion GGUF con imatrix (importance matrix) mejora la calidad de la cuantizacion al ponderar la importancia de cada peso, reduciendo la perdida de perplejidad en comparacion con cuantizaciones estaticas del mismo tamaño.

## Capacidades

- Generacion de texto libre sin restricciones de contenido tematico (gracias a la abliteracion).
- Conversacion multi-turno, etiquetado como "conversational".
- Soporte de idioma ingles unicamente.
- Compatible con herramientas de inferencia que aceptan GGUF, como llama.cpp, Ollama, LM Studio, etc.
- No se especifican capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento avanzado (thinking mode). No hay evidencia de que las posea.
- Al ser un modelo abliterado, puede generar contenido que otros modelos rechazarian, incluyendo temas sensibles o explicitos.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede mantener personajes y narrativas sin censura, lo que lo hace util para juegos de rol textuales o escritura creativa adulta.
- Generacion de dialogos para guiones o novelas: su capacidad conversacional y falta de filtros permite explorar tramas con violencia, sexo o temas tabu sin restricciones.
- Investigacion academica sobre sesgos y alineacion: los investigadores pueden estudiar como se comporta un modelo sin safety alignment y compararlo con versiones alineadas para entender los mecanismos de censura.
- Pruebas de estres de sistemas de moderacion: se puede usar para generar contenido ofensivo o inapropiado y evaluar la robustez de filtros de contenido en aplicaciones.
- Desarrollo de asistentes virtuales sin restricciones: para nichos donde se requiere respuestas directas sin evasivas (p. ej., discusiones sobre drogas, armas, etc.), siempre que se cumpla la legalidad.
- Generacion de codigo o texto tecnico sin limitaciones de "uso responsable": aunque no se confirma su capacidad de codigo, al ser un LLM general podria usarse para tareas de generacion de texto tecnico sin los avisos de seguridad habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se ofrecen comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida. Los tamaños de archivo indicados son:
  - i1-IQ2_M: 11,0 GB
  - i1-Q2_K_S: 11,1 GB
  - i1-Q2_K: 12,0 GB
  - i1-IQ3_XXS: 12,2 GB
  - i1-IQ3_M: 14,5 GB
  - i1-Q3_K_M: 15,4 GB
  - i1-IQ4_XS: 16,8 GB
  - i1-Q4_K_S: 17,9 GB
  - i1-Q4_K_M: 18,8 GB
  - i1-Q6_K: 25,3 GB
- Para las cuantizaciones mas pequeñas (IQ2_M, Q2_K_S) se necesitan al menos 12-16 GB de VRAM, por lo que caben en GPUs como RTX 3060 12GB (con offloading parcial) o RTX 4070/4080 (16GB). Las cuantizaciones Q4_K_M (18,8 GB) requieren 24 GB de VRAM (RTX 3090/4090, A5000). Q6_K (25,3 GB) necesita 32 GB o mas (A100 40GB, etc.).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si soporta GGUF), o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se proporcionan datos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generacion de 20-40 tokens/s, pero es una estimacion general no confirmada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. No se conocen modelos de la misma categoria (31B, abliterados, GGUF) con datos publicos de rendimiento. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Al ser un modelo abliterado, puede generar contenido explicito, violento, ilegal o eticamente cuestionable. El usuario es responsable del uso que haga de el.
- No se ha verificado la calidad del modelo en tareas estandar; al carecer de benchmarks, no se puede garantizar su rendimiento en razonamiento, codigo o matematicas.
- Solo soporta ingles; no es util para otros idiomas.
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial o si tiene restricciones. Se recomienda contactar con el autor antes de usarlo en produccion.
- El modelo base puede tener sesgos y alucinaciones tipicos de los LLM, agravados por la falta de alineacion.
- La cuantizacion de baja precision (IQ2_M, Q2_K) puede degradar notablemente la calidad de las respuestas; se recomienda usar Q4_K_M o superior para tareas serias.
- No se garantiza la reproducibilidad de los resultados debido a la naturaleza estocastica de la generacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Artemis-31B-v1.1-heretic-GGUF
- Modelo base: https://huggingface.co/sh0ck0r/Artemis-31B-v1.1-heretic
- Herramienta Heretic (GitHub): https://github.com/p-e-w/heretic
- Guia de modelos abliterados (2026): https://locallyuncensored.com/blog/abliterated-models-guide.html
- Pagina de descargas del modelo (vista general): https://hf.tst.eu/model#Artemis-31B-v1.1-heretic-i1-GGUF
