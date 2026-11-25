# mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF

## Resumen

Qwen3.5-4B-DeepThought-STEM-i1-GGUF es una cuantizacion en formato GGUF del modelo xtools-at/Qwen3.5-4B-DeepThought-STEM, un ajuste fino (fine-tuning) sobre la base Qwen3.5 de 4B orientado a razonamiento cientifico y STEM. El modelo original ha sido entrenado mediante SFT y destilacion de trazas de razonamiento de modelos de alta capacidad (etiquetadas como Claude Haiku 5.5, Xiaomi MiMo 2.6 Pro, ChatGPT 6.1 Terra, GPT-5.6 luna y GLM-5.1, entre otras), ademas de datasets especificos de descubrimiento de farmacos y formulacion farmaceutica. La version que nos ocupa la publica mradermacher, especialista en cuantizacion GGUF con imatrix, con 21 variantes de cuantizacion desde i1-Q2_K hasta i1-Q6_K.

El modelo cuenta con 4.326.350.848 parametros (aproximadamente 4,3B) y esta empaquetado con licencia Apache 2.0. Su interes practico radica en que ofrece capacidades de razonamiento STEM en un tamano que cabe en GPUs de consumo, con cuantizaciones que van desde 2,1 GB (i1-Q2_K) hasta 3,7 GB (i1-Q6_K), lo que lo hace desplegable en hardware modesto. Esta etiquetado como "vision model" por el cuantizador, aunque los ficheros mmproj (si existen) se alojan en el repositorio estatico separado.

La relevancia actual del modelo esta en su combinacion de tamano compacto, licencia permisiva y especializacion en dominios cientificos (quimica farmaceutica, matematicas, ciencia), ademas de un caracter "abliterated/uncensored" declarado en sus tags, lo que lo diferencia de los modelos base genericos. No obstante, la informacion publica disponible es escasa: no se detallan benchmarks, composicion exacta del dataset ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5); ajuste fino con LoRA/PEFT sobre base Qwen3.5-4B |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix/weighted) |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen3.5-4B mediante LoRA/PEFT (segun los tags `lora`, `peft`, `unsloth`), con entrenamiento supervisado (SFT) y destilacion de trazas de razonamiento. Los datasets declarados incluyen trazas de razonamiento de alta capacidad: Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x, Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x, ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x, GPT-5.6-luna-reasoning-102881x, GLM-5.1-Reasoning-1M-Cleaned y GLM-5.1-1000000x. Ademas incorpora datos especificos de dominio cientifico (red-pill-drug-discovery-formulation-synthetic-reasoning y red-pill-drug-discovery-formulation) y el dataset generalista HuggingFaceTB/smoltalk2.

La cuantizacion la realiza mradermacher con el metodo i1 (imatrix/weighted), que emplea una matriz de importancia para preservar la calidad en cuantizaciones bajas. El repositorio incluye el fichero imatrix.gguf (0,1 GB) para que el usuario pueda generar sus propias cuantizaciones. Segun la model card, el modelo esta etiquetado como vision model, con ficheros mmproj (si los hay) en el repositorio estatico separado. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF/DPO mas alla del SFT declarado. Los tags `heretic`, `uncensored`, `decensored` y `abliterated` sugieren un proceso de eliminacion de rechazos (refusal ablation), aunque no se documenta el metodo exacto.

## Capacidades

- Generacion de texto y razonamiento multi-paso (thinking/reasoning traces destiladas de modelos de alta capacidad).
- Razonamiento matematico y cientifico (STEM): matematicas, fisica, quimica y ciencia en general.
- Razonamiento especializado en descubrimiento de farmacos y formulacion farmaceutica (datasets especificos de dominio).
- Capacidades conversacionales multi-turno (tag `conversational`).
- Soporte declarado de text-generation-inference y endpoints compatibles.
- Posible capacidad de vision (el cuantizador lo etiqueta como "vision model", con mmproj en repositorio separado; no confirmado en la informacion disponible).
- Modelo "abliterated/uncensored": menor tendencia a rechazar peticiones (segun tags, sin documentacion tecnica del proceso).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: razonamiento multi-paso si (via trazas destiladas); soporte formal de agentes no disponible.
- Capacidades multilingues: solo ingles declarado (`language: en`).

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de matematicas paso a paso gracias a las trazas de razonamiento destiladas, adecuado para tutoria automatizada o generacion de soluciones explicadas en entornos educativos.
- Quimica farmaceutica y formulacion: con datasets especificos de drug discovery y formulacion, puede asistir en la generacion de hipotesis sobre formulaciones, propiedades de excipientes o rutas sinteticas en fase de investigacion temprana (siempre con supervision experta).
- Analisis cientifico en local: al caber en GPUs de consumo (2,7-3,7 GB en cuantizaciones Q4-Q6), permite desplegar un asistente STEM en estaciones de trabajo sin conexion a la nube, util para entornos con requisitos de confidencialidad.
- Prototipado rapido de pipelines de razonamiento: su tamano compacto y formato GGUF permiten integrarlo en llama.cpp u Ollama para experimentar con cadenas de razonamiento (chain-of-thought) en entornos de desarrollo.
- Generacion de explicaciones tecnicas: puede producir razonamientos detallados sobre conceptos de fisica o matematicas para documentacion tecnica o material divulgativo, gracias a las trazas de alta calidad usadas en el entrenamiento.
- Filtrado y clasificacion de contenido cientifico: su especializacion permite clasificar o resumir abstracts y articulos tecnicos en ingles dentro de pipelines de procesamiento documental.
- Experimentacion con modelos sin censura: para investigadores que estudian comportamiento de modelos abliterated en dominios sensibles (con las advertencias eticas y legales correspondientes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (i1-Q2_K), 2,7-2,9 GB (i1-Q4_K_S / i1-Q4_K_M), 3,3 GB (i1-Q5_K_M), 3,7 GB (i1-Q6_K). Anadir margen para el contexto KV cache (depende de la longitud de contexto, no documentada).
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM o mas. Para cuantizaciones Q4-Q6, una RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) ofrecen margen holgado. En entornos profesionales, A100 o H100 no son necesarias para este tamano, pero permiten mayor throughput con lotes grandes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 6 GB o mas (GTX 1660, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (declarado en tags), transformers con el modelo base original en safetensors. vLLM no esta confirmado para GGUF en esta ficha.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-DeepThought-STEM (este, GGUF) | ~4,3B | no disponible | Apache 2.0 | GGUF | Especializado STEM, uncensored, solo ingles |
| Qwen3.5-4B (base) | ~4B | no disponible | Apache 2.0 (segun base) | safetensors/GGUF | Modelo generalista sin especializacion STEM |
| Qwen2.5-3B-Instruct | ~3B | 32K (tipico en la familia) | Apache 2.0 | safetensors/GGUF | Alternativa generalista multilingue de tamano similar |
| Llama-3.2-3B-Instruct | ~3B | 128K | Llama 3.2 Community | safetensors/GGUF | Multilingue, generalista, licencia con restricciones |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para este modelo que permitan una comparacion cuantitativa fiable. Los datos de contexto de los modelos alternativos corresponden a sus familias y pueden variar segun la version concreta.

## Limitaciones y advertencias

- Solo idioma ingles declarado; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en dominios cientificos donde la precision es critica; no debe usarse como fuente de verdad sin verificacion experta.
- Modelo etiquetado como uncensored/abliterated: puede generar contenido que otros modelos rechazarian; requiere filtros y politicas de uso en produccion.
- La informacion sobre contexto maximo no esta disponible, lo que dificulta planificar casos de uso con documentos largos.
- No hay benchmarks publicados que validen las capacidades declaradas; el rendimiento real en STEM es incierto.
- Las trazas de razonamiento destiladas de modelos de terceros pueden introducir sesgos o estilos no deseados, y su procedencia (etiquetas como "Claude Haiku 5.5" o "GPT-5.6") no es verificable desde la informacion disponible.
- El uso en descubrimiento de farmacos debe tratarse como asistencia exploratoria, nunca como sustituto de validacion experimental o regulatoria.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los datasets de destilacion subyacentes, no documentadas en detalle.
- La designacion como "vision model" no esta confirmada con ficheros mmproj en este repositorio; verificar en el repositorio estatico antes de asumir capacidades multimodales.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.5-4B-DeepThought-STEM-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-4B-DeepThought-STEM-i1-GGUF
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
