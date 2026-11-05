# mradermacher/Marco-Mini-Global-TV-Instruct-GGUF

## Resumen
Marco-Mini-Global-TV-Instruct-GGUF es una distribucion de cuantizaciones GGUF del modelo Varho/Marco-Mini-Global-TV-Instruct, publicada por mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversion a formato GGUF de los pesos originales en transformers, pensada para inferencia local con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.). El modelo base cuenta con 17.406.164.992 parametros (aproximadamente 17,4 mil millones) y esta orientado a uso conversacional en ingles.

El repositorio ofrece once cuantizaciones estaticas que van desde Q2_K (6,5 GB) hasta Q8_0 (18,6 GB), lo que permite desplegar el modelo en un rango amplio de hardware, desde equipos con GPUs de consumo hasta servidores con A100/H100. La licencia declarada es Apache 2.0, lo que facilita el uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion de dicha licencia.

La relevancia de esta ficha radica en que el modelo base es poco documentado publicamente (no hay benchmarks ni detalles de entrenamiento en la informacion disponible), pero la existencia de cuantizaciones GGUF lo hace accesible para experimentacion local. El autor de las cuantizaciones, mradermacher, es un actor conocido en el ecosistema de cuantizacion GGUF, y el repositorio incluye notas sobre la ausencia de cuantizaciones con imatrix en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base en transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 17.406.164.992 (17,4 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
No se dispone de informacion detallada sobre la arquitectura del modelo base Varho/Marco-Mini-Global-TV-Instruct en la documentacion proporcionada. El dato de parametros totales (17.406.164.992) proviene de los safetensors del modelo original, y el nombre sugiere un modelo de tipo "Mini" con posible orientacion a tareas de vision o television ("TV"), pero no hay confirmacion tecnica al respecto. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar.

La aportacion tecnica de este repositorio concreto es la cuantizacion estatica a GGUF mediante el pipeline de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicacion y que, si no aparecen en una semana, probablemente no esten planificadas. Las cuantizaciones IQ (como IQ4_XS) suelen ofrecer mejor calidad que las no-IQ de tamano similar, segun las notas del propio autor.

## Capacidades
- Generacion de texto conversacional en ingles (etiqueta "conversational" en HuggingFace).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integracion con infraestructura de inferencia estandar.
- Inferencia local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- Capacidades especificas de razonamiento, codigo, matematicas, vision o tool calling: no disponibles en la informacion proporcionada.
- Soporte multilingue: limitado a ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso
- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (10,7 GB) el modelo puede ejecutarse en una GPU de consumo con 12-16 GB de VRAM, lo que permite prototipar asistentes conversacionales sin depender de la nube.
- Experimentacion con llama.cpp: las once cuantizaciones permiten comparar calidad frente a tamano y ajustar el equilibrio para un hardware concreto, util en laboratorios de investigacion que evaluan el impacto de la cuantizacion.
- Chat conversacional en ingles: el tag "conversational" y el sufijo "Instruct" indican que el modelo esta afinado para seguir instrucciones, adecuado para asistentes de texto en prototipos internos.
- Integracion en pipelines de CI/CD para pruebas de regresion: al ser GGUF y Apache 2.0, puede incorporarse en entornos automatizados sin coste de licencia, siempre que el caso de uso sea en ingles.
- Evaluacion comparativa de cuantizaciones: investigadores pueden usar este repositorio para medir la degradacion de calidad entre Q2_K y Q8_0 en tareas conversacionales, dado que todas las variantes provienen del mismo modelo base.
- Educacion y formacion: el tamano moderado (17,4 B) y la disponibilidad de versiones ligeras (Q2_K, 6,5 GB) facilitan su uso en cursos sobre inferencia de LLM en hardware modesto.
- Servicio de inferencia en servidor: con Q8_0 (18,6 GB) o Q6_K (14,4 GB) puede desplegarse en una A100 40GB o H100 para atender peticiones concurrentes mediante vLLM o TGI (si bien la compatibilidad GGUF con vLLM requiere backend especifico).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~6,5 GB
  - Q3_K_S: ~7,7 GB
  - Q3_K_M: ~8,5 GB
  - Q3_K_L: ~9,1 GB
  - IQ4_XS: ~9,5 GB
  - Q4_K_S: ~10,0 GB
  - Q4_K_M: ~10,7 GB
  - Q5_K_S: ~12,1 GB
  - Q5_K_M: ~12,5 GB
  - Q6_K: ~14,4 GB
  - Q8_0: ~18,6 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M a Q8_0; RTX 3090/4080 (16-24 GB) para Q4 a Q6; A100 40GB o H100 para despliegue en servidor con Q8_0 y contexto amplio.
- Cabe en GPU de consumo: si, en RTX 3060 12GB con Q4_K_S/Q4_K_M (10-10,7 GB) asumiendo contexto corto; en RTX 4060 Ti 16GB con Q5_K_M o Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui; vLLM y TGI solo si se convierte a safetensors o se usa backend GGUF compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria (17 B, conversacional, ingles) en la documentacion proporcionada, ni de benchmarks que permitan una comparacion rigurosa.

## Limitaciones y advertencias
- Idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta garantizado y probablemente degrade la calidad.
- Documentacion escasa: no hay informacion sobre arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion: inherente a los modelos generativos; sin datos de evaluacion no puede cuantificarse.
- Sesgos: no documentados; al desconocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos conocidos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base (Varho/Marco-Mini-Global-TV-Instruct) mantiene la misma licencia y no impone restricciones adicionales.
- Cuantizaciones: Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q8_0 como mejor calidad.
- Ausencia de cuantizaciones imatrix: las versiones publicadas son estaticas, lo que puede implicar peor calidad que cuantizaciones ponderadas equivalentes en tamano.
- Fecha de creacion y actualizacion: el repositorio se creo el 2026-04-15 y se actualizo el 2026-11-04; verificar que las versiones descargadas corresponden a la revision deseada.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/mradermacher/Marco-Mini-Global-TV-Instruct-GGUF
- Modelo base: https://huggingface.co/Varho/Marco-Mini-Global-TV-Instruct
- Pagina de descargas del autor: https://hf.tst.eu/model#Marco-Mini-Global-TV-Instruct-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
