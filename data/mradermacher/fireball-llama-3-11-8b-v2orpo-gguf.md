# mradermacher/Fireball-Llama-3.11-8B-v2orpo-GGUF

## Resumen

Fireball-Llama-3.11-8B-v2orpo-GGUF es la version cuantizada en formato GGUF del modelo EpistemeAI/Fireball-Llama-3.11-8B-v2orpo, un ajuste fino de la familia Llama 3.1 de 8.000 millones de parametros. La cuantizacion la firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, y esta pensada para inferencia local en CPU y GPU de consumo mediante llama.cpp y ecosistemas compatibles. El modelo base incorpora el sufijo "orpo", que indica un ajuste fino con ORPO (Odds Ratio Preference Optimization), una tecnica de alineacion que combina el ajuste supervisado y la optimizacion de preferencias en una sola etapa.

El modelo resuelve el problema de desplegar un LLM conversacional de 8B en hardware modesto: los cuantizados van desde 3,3 GB en Q2_K hasta 16,2 GB en f16, lo que permite ejecutarlo en portatiles, mini-PC y GPUs de consumo con VRAM limitada. La licencia Apache 2.0 del modelo base facilita su uso comercial sin restricciones adicionales, si bien conviene verificar las condiciones del modelo original de Llama 3.1 en el que se basa la cadena de derivacion.

La relevancia actual de esta ficha radica en que es una de las pocas versiones GGUF disponibles de un ajuste ORPO sobre Llama 3.1 8B, con un catalogo amplio de cuantizaciones estaticas (Q2_K a Q8_0 y f16) y una variante adicional con cuantizacion ponderada por matriz de importancia (imatrix) publicada en un repositorio separado. El modelo esta etiquetado unicamente para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 3.1, sin confirmar en la informacion proporcionada) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Llama 3.1 8B, una arquitectura transformer decoder-only densa con atencion causal estandar. El sufijo "orpo" del nombre indica que el ajuste se realizo con ORPO (Odds Ratio Preference Optimization), un metodo de alineacion que unifica el ajuste supervisado y la optimizacion de preferencias en una sola fase de entrenamiento, sin necesidad de un modelo de referencia separado como en DPO. Los tags del repositorio incluyen `unsloth` y `trl`, lo que sugiere que el entrenamiento se realizo con las librerias Unsloth y TRL de Hugging Face.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de RLHF o DPO mas alla del ajuste ORPO. Tampoco se documentan innovaciones tecnicas especificas del ajuste (por ejemplo, decodificacion especulativa o atencion lineal). La cuantizacion realizada por mradermacher es estatica (no imatrix) en este repositorio; la variante imatrix se publica por separado.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento basico y respuesta a instrucciones, derivado del ajuste ORPO sobre Llama 3.1.
- Generacion de codigo y matematicas a nivel de un modelo de 8B (sin datos de benchmark que lo confirmen).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada (Llama 3.1 lo soporta de forma nativa, pero el ajuste ORPO puede alterar esta capacidad).
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno en un portatil con 8-16 GB de RAM usando Q4_K_M (5,0 GB) o Q5_K_M (5,8 GB), sin necesidad de GPU dedicada.
- Prototipado de chatbots en CPU: con llama.cpp u Ollama, el cuantizado Q4_K_S (4,8 GB) permite iterar rapidamente en entornos sin GPU, adecuado para pruebas de concepto y demos internas.
- Generacion de texto en pipelines de bajo coste: el modelo puede integrarse en servicios de generacion de contenido en ingles donde el coste por token es critico y la latencia no es el factor principal.
- Fine-tuning adicional sobre una base ya alineada: al ser un ajuste ORPO sobre Llama 3.1, sirve como punto de partida para especializaciones posteriores con LoRA o QLoRA, aprovechando la licencia Apache 2.0.
- Despliegue en edge devices: el cuantizado Q2_K (3,3 GB) permite ejecutar el modelo en dispositivos con poca memoria, aunque con perdida notable de calidad.
- Evaluacion comparativa de tecnicas de alineacion: util para investigadores que quieran comparar el comportamiento de un ajuste ORPO frente a DPO o RLHF sobre la misma base Llama 3.1 8B.
- Servicio de inferencia con TGI: el tag `text-generation-inference` indica compatibilidad con el servidor TGI de Hugging Face para despliegues en GPU con batching dinamico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, segun tamano del fichero GGUF):
  - Q2_K: ~3,3 GB
  - Q3_K_M: ~4,1 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: para Q4_K_M y Q5_K_M basta una RTX 3060 de 12 GB o superior; para Q8_0 se recomienda una RTX 4070/4080 o superior; para f16 se necesita una RTX 4090 (24 GB) o una A100/H100 en entornos de servidor.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (Q2_K a Q6_K) cabe en GPUs con 6-8 GB de VRAM; Q8_0 requiere 10-12 GB; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-inference (TGI), y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Fireball-Llama-3.11-8B-v2orpo-GGUF (este) | 8,03B | no disponible | Apache 2.0 | GGUF | Ajuste ORPO sobre Llama 3.1 8B, solo ingles |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 128K (segun Meta) | Llama 3.1 Community License | safetensors, GGUF | Base oficial, multilingue, con restricciones de uso comercial |
| Mistral 7B Instruct | 7,24B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa de tamano similar, licencia permisiva |
| Qwen2.5 7B Instruct | 7,62B | 128K | Apache 2.0 | safetensors, GGUF | Multilingue, buen rendimiento en codigo y matematicas |

La comparativa se limita a datos estructurales; no se dispone de resultados de benchmarks del modelo Fireball que permitan una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- El modelo esta etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Al ser un ajuste ORPO de un modelo de 8B, el riesgo de alucinacion es comparable al de Llama 3.1 8B, sin que se hayan documentado mitigaciones especificas.
- No se han publicado evaluaciones de sesgo ni de seguridad para este ajuste concreto.
- La licencia Apache 2.0 del repositorio GGUF no exime de verificar las condiciones del modelo base Llama 3.1 de Meta, que impone restricciones adicionales (por ejemplo, en usos prohibidos y en la denominacion del modelo).
- Los cuantizados de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- No hay informacion sobre el contexto maximo efectivo tras el ajuste ORPO; conviene validarlo empiricamente antes de desplegar en produccion.
- El repositorio tiene un numero muy bajo de descargas (162) y cero likes, lo que sugiere poca validacion por parte de la comunidad.
- La fecha de actualizacion del repositorio (2026-11-21) es posterior a la de creacion (2025-08-31), pero no se documentan cambios en la model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Fireball-Llama-3.11-8B-v2orpo-GGUF
- Modelo base: https://huggingface.co/EpistemeAI/Fireball-Llama-3.11-8B-v2orpo
- Variante imatrix: https://huggingface.co/mradermacher/Fireball-Llama-3.11-8B-v2orpo-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Fireball-Llama-3.11-8B-v2orpo-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
