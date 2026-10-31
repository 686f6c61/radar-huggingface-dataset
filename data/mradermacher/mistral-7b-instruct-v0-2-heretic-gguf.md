# mradermacher/mistral-7b-instruct-v0.2-heretic-GGUF

## Resumen

Esta ficha corresponde a los cuantizados GGUF de **mistral-7b-instruct-v0.2-heretic**, publicados por el usuario mradermacher en HuggingFace. El modelo base es un fine-tuning de Mistral 7B Instruct v0.2 realizado por Ananasez, al que se le han aplicado técnicas de "abliteración" o "descensura" (etiquetado como *heretic*, *uncensored*, *decensored*, *abliterated*), un proceso que modifica los pesos del modelo para eliminar los rechazos de seguridad impuestos por el alineamiento original, manteniendo intactas las capacidades generales del modelo subyacente.

mradermacher no entrena modelos: su rol es el de cuantizador, ofreciendo versiones estáticas en formato GGUF que van desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite ejecutar el modelo en hardware muy variado, desde portátiles sin GPU dedicada hasta estaciones de trabajo. El modelo original conserva la arquitectura transformer decoder de Mistral 7B con 7.241.732.096 parámetros, y su relevancia actual radica en la demanda de modelos locales sin filtros para investigación, red teaming y casos de uso creativos donde los rechazos del modelo base resultan restrictivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral 7B), no disponible detalle adicional |
| Parametros totales | 7.241.732.096 (7,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el Mistral 7B Instruct v0.2 original soporta 32.768 tokens, pero no consta en la información proporcionada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (los pesos originales del modelo base estan en safetensors) |

## Arquitectura y entrenamiento

El modelo base, Ananasez/mistral-7b-instruct-v0.2-heretic, parte de Mistral 7B Instruct v0.2, un transformer decoder de 7,24 mil millones de parametros con las caracteristicas tipicas de la familia Mistral: atencion con ventana deslizante (sliding window attention), Grouped Query Attention (GQA) y codificacion RoPE. Sobre este modelo se ha aplicado un proceso de abliteracion/decensura, tecnica que identifica y neutraliza las direcciones de activacion responsables de los rechazos de seguridad, de modo que el modelo responde a instrucciones sin los mecanismos de negacion del alineamiento original.

No se ha publicado informacion sobre el metodo exacto de abliteracion empleado, el dataset de entrenamiento ni si hubo fases adicionales de RLHF/DPO. Lo que si esta documentado es el proceso de cuantizacion: mradermacher genero cuantizados estaticos GGUF (convert_type: hf) en doce niveles de precision distintos, y ofrece aparte una coleccion de cuantizados imatrix (weighted/imatrix) en un repositorio complementario para quienes busquen mejor calidad a igual tamaño.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Mistral 7B Instruct v0.2.
- Respuesta sin rechazos de seguridad (uncensored/abliterated): sigue instrucciones que el modelo original rechazaria, util en red teaming y fiction creative.
- Razonamiento general, redaccion, resumen y tareas de seguimiento de instrucciones del modelo base.
- Ejecucion 100% local en formato GGUF, compatible con llama.cpp, Ollama, LM Studio y derivados.
- No hay informacion sobre capacidades de vision, audio, tool calling o modos de razonamiento extendido; el modelo base no las incorpora.

## Casos de uso

- **Investigacion en seguridad y red teaming: al carecer de capas de rechazo, permite estudiar comportamientos de fallo, jailbreaks y alineamiento sin que el modelo interfiera con los prompts de prueba.**
- **Escritura creativa sin restricciones: autores de ficcion pueden generar contenido con tematicas que los modelos alineados suelen bloquear (violencia narrativa, tematicas adultas), aprovechando el contexto conversacional del modelo instruct.**
- **Asistente local privado en hardware modesto: con la variante Q4_K_M (4,5 GB) funciona en portatiles con 8 GB de RAM o GPUs de 6 GB de VRAM, sin enviar datos a servicios externos.**
- **Prototipado y pruebas de prompts: el rango completo de cuantizados permite comparar degradacion por cuantizacion en el mismo modelo, util para calibrar despliegues.**
- **Integracion en pipelines locales con llama.cpp: los GGUF estaticos se sirven via llama-server o equivalentes para construir APIs locales de generacion de texto.**
- **Estudio de abliteracion: sirve como caso practico para analizar como las tecnicas de descensura afectan a la calidad de generacion respecto al modelo base.**

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye una grafica de perplejidad comparativa entre tipos de cuantizacion (por ikawrakow) y referencias generales a la calidad relativa de cada quant (por ejemplo, Q6_K "very good quality", Q3_K_M "lower quality"), sin metricas numericas concretas del modelo.

## Requisitos de hardware

- **VRAM/RAM estimada segun cuantizacion:** Q2_K: ~2,8 GB; Q3_K_M: ~3,6 GB; Q4_K_M: ~4,5 GB; Q5_K_M: ~5,2 GB; Q6_K: ~6 GB; Q8_0: ~7,8 GB; f16: ~14,6 GB. Anade margen para el KV cache segun la longitud de contexto.
- **GPU recomendadas:** cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti) ejecuta comodo Q4_K_M o superior; con 12-16 GB (RTX 4070 Ti Super, RTX 4090) cabe Q8_0 o f16 completo.
- **Consumer GPUs:** si, es un modelo de 7B pensado precisamente para eso; tambien funciona solo con CPU (inferencia mas lenta, viable con Q4 a velocidades de varios tokens/s en CPUs modernas).
- **Despliegue:** llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Para vLLM o TGI se necesitarian los pesos originales en safetensors del modelo base, no estos GGUF.
- **Latencia/throughput:** no disponible; en GPUs consumer modernas se esperan decenas de tokens/s con cuantizados de 4 bits, dato no confirmado en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| mistral-7b-instruct-v0.2-heretic (esta ficha) | 7,24 B | GGUF (12 quants) | Apache 2.0 | Abliterado/uncensored, base Mistral v0.2 |
| Mistral 7B Instruct v0.2 (original) | 7,24 B | safetensors, GGUF de terceros | Apache 2.0 | Modelo base alineado, con rechazos de seguridad |
| Dolphin 2.x (basado en Mistral, Cognitive Computations) | 7,24 B | safetensors, GGUF | Apache 2.0 | Fine-tuning uncensored mediante dataset, no abliteracion de pesos |

La diferencia clave frente a fine-tunings uncensored como Dolphin es el metodo: la abliteracion modifica los pesos para suprimir los rechazos sin reentrenar con datos, mientras que Dolphin reentrena sobre un dataset filtrado. No hay datos de benchmarks que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- **Modelo deliberadamente sin salvaguardas:** genera contenido que otros modelos rechazarian. Su uso para producir material ilegal, danino o enganoso es responsabilidad exclusiva del usuario; no debe desplegarse en produccion orientada a usuarios finales sin controles externos.
- **Idioma:** la model card declara solo ingles; el rendimiento en castellano no esta documentado (el Mistral base tenia soporte multilingue limitado, pero no consta aqui).
- **Riesgo de alucinacion:** inherente a un modelo de 7B; la abliteracion puede degradar adicionalmente la fiabilidad, aunque no hay mediciones publicadas al respecto.
- **Calidad por cuantizacion:** los quants bajos (Q2_K, Q3_K_M) presentan degradacion notable segun la propia documentacion del cuantizador; para uso serio se recomienda Q4_K_M o superior.
- **Licencia:** Apache 2.0 permite uso comercial sin restricciones adicionales del cuantizador; las condiciones del modelo base (Mistral, Apache 2.0) aplican igualmente.
- **Contexto:** la longitud de contexto no esta documentada en este repositorio; verificarla en la model card del modelo base antes de disenar aplicaciones con documentos largos.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/mistral-7b-instruct-v0.2-heretic-GGUF
- Modelo base (Ananasez): https://huggingface.co/Ananasez/mistral-7b-instruct-v0.2-heretic
- Cuantizados imatrix (mradermacher): https://huggingface.co/mradermacher/mistral-7b-instruct-v0.2-heretic-i1-GGUF
- Pagina de descarga resumida: https://hf.tst.eu/model#mistral-7b-instruct-v0.2-heretic-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuantizados (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
