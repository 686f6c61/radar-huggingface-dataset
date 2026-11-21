# mradermacher/Boulesis-26B-A4B-GGUF

## Resumen

Boulesis-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo SubMaroon/Boulesis-26B-A4B, un merge de arquitectura Mixture of Experts (MoE) derivado de la familia Gemma y orientado a roleplay, razonamiento y conversación sin censura. La cuantización la firma mradermacher, un autor habitual en la comunidad de GGUF conocido por publicar versiones estáticas e imatrix de modelos populares para su uso en llama.cpp y entornos de inferencia local.

El modelo cuenta con 25.971.339.550 parámetros totales y, según la nomenclatura del nombre (A4B), activa aproximadamente 4.000 millones de parámetros por token, lo que lo sitúa en la categoría de MoE disperso. Incorpora etiquetas que indican modo de pensamiento (thinking), razonamiento, capacidades de roleplay, y un proceso de "heretic" (técnica de des-censura aplicada a modelos alineados), además de compatibilidad con frontends como SillyTavern.

Su relevancia actual radica en que ofrece un modelo de ~26B totales con activación reducida en formato GGUF listo para ejecutarse en hardware de consumo, con licencia Apache 2.0 y una batería de cuantizaciones que van desde Q2_K (10,9 GB) hasta Q8_0 (27,7 GB), cubriendo distintos perfiles de VRAM y calidad. Está disponible únicamente en inglés según la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en la familia Gemma (etiqueta `gemma4`), transformer disperso |
| Parámetros totales | 25.971.339.550 (~26B) |
| Parámetros activos | ~4B (inferido de la nomenclatura A4B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); versiones imatrix en repo i1-GGUF |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); pesos originales del modelo base presumiblemente safetensors (no confirmado) |

## Arquitectura y entrenamiento

El modelo es un merge de arquitectura MoE etiquetado como `gemma4`, con 25.971 millones de parámetros totales y una activación estimada de ~4B por token según la nomenclatura A4B. Al tratarse de un merge (y no de un modelo entrenado desde cero), no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card del repo cuantizado no documenta el proceso de entrenamiento del modelo base.

La etiqueta `heretic` sugiere la aplicación de técnicas de ablación o edición de pesos orientadas a eliminar comportamientos de rechazo y censura del modelo alineado original, práctica habitual en la comunidad de modelos "uncensored". El modelo incorpora además un modo de pensamiento (`thinking`) y capacidades de razonamiento declaradas, aunque no se detalla la innovación técnica concreta (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional y multi-turno, con orientación explícita a roleplay.
- Modo de razonamiento/pensamiento (`thinking`) declarado en las etiquetas del modelo.
- Capacidades de razonamiento multi-paso inferidas de las etiquetas `reasoning` y `thinking`.
- Roleplay sin censura (`uncensored`, `heretic`), pensado para personajes y narrativa interactiva.
- Compatibilidad con frontends de rol como SillyTavern.
- Soporte de inferencia local vía GGUF (llama.cpp y derivados).
- Capacidades multilingües limitadas al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está etiquetado explícitamente para `roleplay` y `sillytavern`, por lo que puede usarse como motor de personajes en frontends conversacionales, manteniendo personalidad y contexto a lo largo de sesiones multi-turno.
- Generación creativa sin restricciones de contenido: la combinación `uncensored` + `heretic` lo hace adecuado para ficción, guiones y narrativa adulta donde otros modelos alineados rechazan ciertos temas.
- Asistente conversacional local en inglés: al caber en GPU de consumo en cuantizaciones Q4, puede desplegarse como chatbot privado sin dependencia de API externa.
- Prototipado de agentes conversacionales con razonamiento: el modo `thinking` permite experimentar con cadenas de razonamiento en tareas de diálogo complejo antes de invertir en modelos mayores.
- Evaluación de merges MoE: útil para investigadores que quieran comparar el comportamiento de un MoE de ~26B con ~4B activos frente a modelos densos de tamaño similar en tareas de generación abierta.
- Despliegue en entornos con VRAM limitada: las cuantizaciones Q2_K (10,9 GB) y Q3_K_S (12,6 GB) permiten ejecutar el modelo en GPUs de 12-16 GB, habilitando pruebas de concepto en hardware modesto.
- Fine-tuning y experimentación comunitaria: al ser Apache 2.0 y estar disponible en GGUF, sirve como base para LoRAs o para pruebas de cuantización adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~10,9 GB de pesos; ~11-13 GB de VRAM con overhead de contexto.
  - Q3_K_S: ~12,6 GB; ~13-15 GB con contexto.
  - IQ4_XS: ~14,6 GB; ~15-17 GB con contexto.
  - Q4_K_S / Q4_K_M: ~16,0-17,3 GB; ~17-19 GB con contexto.
  - Q5_K_M: ~19,7 GB; ~20-22 GB con contexto.
  - Q6_K: ~23,3 GB; ~24-26 GB con contexto.
  - Q8_0: ~27,7 GB; ~28-30 GB con contexto.
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB) para Q4/Q5 con contexto moderado; RTX 3090 (24 GB) equivalente; RTX 4080/4070 Ti Super (16 GB) para Q3/IQ4_XS.
  - Profesional: A100 40/80 GB, H100 80 GB para Q6/Q8 con contexto largo.
- ¿Cabe en GPU de consumo? Sí: Q2_K y Q3_K_S en GPUs de 12-16 GB; Q4 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (p. ej. llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con ~4B activos, se espera un throughput superior al de un denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Boulesis-26B-A4B-GGUF | ~26B | ~4B (A4B) | no disponible | Apache 2.0 | GGUF | Roleplay, uncensored, thinking |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32K | Apache 2.0 | safetensors/GGUF | MoE generalista, no orientado a roleplay |
| Gemma 2 27B | ~27B | denso | 8K | Gemma license | safetensors/GGUF | Denso, alineado, contexto corto |
| Qwen2.5 32B | ~32B | denso | 128K | Apache 2.0 | safetensors/GGUF | Denso, multilingüe, contexto largo |

La comparativa es orientativa: no se dispone de benchmarks del modelo que permitan contrastar rendimiento real frente a estas alternativas. Boulesis se diferencia por su orientación a roleplay sin censura y su naturaleza MoE con activación reducida, mientras que los modelos citados son generalistas o densos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un merge derivado de Gemma con edición "heretic", puede heredar sesgos del modelo base y presentar sesgos adicionales derivados del proceso de des-censura.
- Riesgo de alucinación: no hay datos de benchmarks que permitan cuantificar la fiabilidad; en modo roleplay y narrativa el riesgo de contenido inventado es alto por diseño.
- Limitaciones de idioma: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Limitaciones de contexto: la longitud de contexto no está disponible en la información proporcionada, lo que impide planificar despliegues con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (Gemma) por posibles condiciones adicionales heredadas.
- Contenido sin censura: el modelo está diseñado para no rechazar peticiones, lo que implica riesgo de generar contenido inapropiado, ofensivo o ilegal; requiere moderación externa en producción.
- Calidad de cuantizaciones bajas: Q2_K y Q3_K_M pueden degradar notablemente la coherencia; el autor recomienda Q4_K_S/Q4_K_M como equilibrio y Q6_K/Q8_0 para máxima calidad.
- Naturaleza de merge: al no ser un modelo entrenado desde cero, su comportamiento puede ser menos predecible y menos documentado que el de un modelo oficial.
- Sin soporte confirmado de tool calling ni agentes: no hay evidencia en la información disponible de que soporte function calling estructurado.

## Enlaces

- Repo GGUF: https://huggingface.co/mradermacher/Boulesis-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Boulesis-26B-A4B-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Boulesis-26B-A4B-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
