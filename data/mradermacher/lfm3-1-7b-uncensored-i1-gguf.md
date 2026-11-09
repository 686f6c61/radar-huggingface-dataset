# mradermacher/LFM3-1.7B-Uncensored-i1-GGUF

## Resumen

LFM3-1.7B-Uncensored-i1-GGUF es una cuantizacion en formato GGUF del modelo OpenIntelligenceNet/LFM3-1.7B-Uncensored, realizada por mradermacher. El modelo base deriva de la familia Liquid AI LFM3 (Liquid Foundation Model 3), una arquitectura hibrida orientada a dispositivos de borde (edge AI), y ha sido sometido a un proceso de "abliteration" o decensurado que elimina las capas de rechazo del modelo original. El resultado es un modelo de 1.700 millones de parametros nominales (el repositorio safetensors reporta 899.013 parametros, dato que probablemente refleja una discrepancia de conteo en el repo de cuantizacion) pensado para generacion de texto conversacional, roleplay y razonamiento en ingles.

La ficha corresponde especificamente al repositorio de cuantizaciones dinamicas con imatrix (sufijo i1), que incluye una amplia gama de tipos de cuantizacion (Q2_K, IQ2_XXS, Q3_K, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, entre otros) generados a partir de una matriz de importancia (imatrix) para preservar mejor la calidad en tamanos reducidos. El repositorio incluye unicamente el fichero imatrix (0,1 GB), no los pesos cuantizados completos, que se distribuyen a traves de la pagina de descargas del autor.

Su relevancia radica en tres factores: la arquitectura hibrida de Liquid AI (que combina mecanismos de atencion con capas de estado recurrente lineal, disenadas para inferencia eficiente en CPU y dispositivos de borde), la disponibilidad de cuantizaciones GGUF listas para llama.cpp/Ollama, y la naturaleza "uncensored" del modelo base, que lo orienta a casos de uso de roleplay y generacion creativa sin restricciones de rechazo. La licencia no esta disponible en la informacion proporcionada, lo que constituye un caveat importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (liquid-ai, LFM3): atencion + capas de estado lineal recurrente (hibrida transformer/SSM segun tags del modelo base) |
| Parametros totales | 1.700 millones (nominal, segun nombre del modelo); el repo safetensors reporta 899.013 (dato no consistente con el nombre, probablemente conteo parcial del repo de cuantizacion) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_L, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones dinamicas con imatrix, i1); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B-Uncensored pertenece a la familia Liquid Foundation Model 3 de Liquid AI, descrita en los tags como arquitectura hibrida (hybrid-architecture). Las arquitecturas hibridas de Liquid AI combinan capas de atencion tradicionales con capas de estado recurrente lineal (lineal attention / SSM), lo que reduce el coste computacional y de memoria en contextos largos y mejora la eficiencia en inferencia en CPU y dispositivos de borde. El tag custom_code indica que el modelo base requiere codigo personalizado de transformers para cargarse, lo que es habitual en arquitecturas hibridas no estandar.

El proceso de "uncensoring" (tags heretic, abliterated, uncensored, decensored) sugiere que el modelo base OpenIntelligenceNet/LFM3-1.7B-Uncensored fue sometido a una tecnica de abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones) sobre el LFM3 original, dando lugar a un modelo que responde sin rechazos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF/DPO en el proceso de decensurado. Las cuantizaciones i1 de mradermacher se generan con matriz de importancia (imatrix) para minimizar la perdida de perplejidad en tamanos bajos.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de conversaciones multi-turno.
- Razonamiento (tag reasoning) y generacion de respuestas encadenadas.
- Roleplay y generacion creativa sin rechazos (modelo decensurado/abliterated).
- Inferencia en dispositivos de borde (tag edge-ai) gracias a la arquitectura hibrida.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere integracion con APIs tipo OpenAI en despliegues compatibles.
- Carga mediante transformers con codigo personalizado (custom_code) para el modelo base.
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente, vision, audio ni modo thinking explicito.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta decensurado y orientado a conversacion, por lo que puede mantener personajes y dialogos multi-turno sin rechazos, adecuado para aplicaciones de entretenimiento y ficcion interactiva.
- Generacion creativa de texto en ingles: cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en portatiles consumer para escritura asistida, lluvia de ideas y generacion de contenido sin restricciones tematicas.
- Prototipado rapido en local con Ollama o llama.cpp: al ser GGUF, se puede desplegar en minutos en CPU o GPU modesta, util para desarrolladores que quieren evaluar el comportamiento del modelo antes de integrarlo.
- Asistente personal offline en dispositivos de borde: la arquitectura hibrida de Liquid AI esta disenada para eficiencia en CPU, lo que permite ejecutar el modelo en mini-PC, Raspberry Pi de gama alta o portatiles sin GPU dedicada.
- Experimentacion con tecnicas de abliteration: investigadores pueden usar este modelo como referencia para estudiar el efecto del decensurado sobre la calidad, la coherencia y la seguridad en modelos pequenos.
- Generacion de datos sinteticos para fine-tuning: el modelo puede producir datasets de conversacion en ingles para entrenar modelos mayores o especializados, con cuantizaciones Q6_K para maximizar fidelidad al modelo base.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye imatrix y una gama amplia de quants, lo que permite medir la degradacion de calidad entre IQ2 y Q6 en tareas de razonamiento y roleplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 1.7B parametros): aproximadamente 1,0-1,3 GB en Q4_K_M, 0,7-0,9 GB en Q3_K_M, 1,4-1,8 GB en Q5_K_M, 1,8-2,2 GB en Q6_K, y 0,5-0,7 GB en IQ2_XXS/IQ2_M (estimaciones orientativas; no confirmadas en la informacion proporcionada).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; en GPU de datacenter (A100, H100) el modelo es sobredimensionado para el hardware y se infrautilizaria.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas, incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp; vLLM y TGI no soportan GGUF de forma nativa (vLLM requiere pesos safetensors y codigo custom para arquitecturas hibridas).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. En CPU moderna, un modelo de 1.7B en Q4_K_M suele generar entre 10 y 25 tokens/s; en GPU consumer, por encima de 50 tokens/s (estimaciones genericas, no verificadas para esta arquitectura hibrida).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Uncensored-i1-GGUF (este) | 1.7B (nominal) | no disponible | no disponible | GGUF (i1) | Hibrido Liquid AI, decensurado, solo ingles |
| LiquidAI/LFM2-1.2B (referencia de familia) | 1.2B | no disponible | no disponible | safetensors, GGUF | Arquitectura hibrida similar, orientado a edge |
| Qwen2.5-1.5B-Instruct-GGUF | 1.5B | 32K (segun model card de Qwen) | Apache 2.0 | GGUF | Transformer denso, multilingue, muy desplegado |
| Llama-3.2-1B-Instruct-GGUF | 1.2B | 128K (segun model card de Llama 3.2) | Llama 3.2 Community License | GGUF | Transformer denso, licencia con restricciones de uso |

La comparativa exacta de rendimiento no esta disponible, ya que no se han publicado benchmarks para este modelo. Las alternativas citadas son referencias genericas de la misma categoria de tamano (1-2B), no una comparacion verificada.

## Limitaciones y advertencias

- Modelo decensurado/abliterated: elimina los rechazos de seguridad, por lo que puede generar contenido toxico, violento, sexual o ilegal. No debe desplegarse en aplicaciones de cara al publico sin filtros externos.
- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sera pobre.
- La licencia no esta disponible: no se puede confirmar si el uso comercial esta permitido. Verificar con el autor del modelo base antes de cualquier despliegue en produccion.
- La discrepancia entre el nombre (1.7B) y el conteo de parametros del repo safetensors (899.013) sugiere que el repositorio de cuantizacion no contiene los pesos completos, solo el fichero imatrix; los quants deben descargarse desde la pagina de descargas del autor.
- Arquitectura hibrida con custom_code: puede requerir versiones especificas de transformers y no ser compatible con todos los runners; en llama.cpp puede necesitar soporte especifico para LFM3.
- Riesgo de alucinacion elevado en un modelo de 1.7B, especialmente en tareas de razonamiento complejo, matematicas y hechos verificables.
- Contexto no documentado: no se conoce la ventana de contexto maxima, lo que limita la planificacion de aplicaciones multi-turno largas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas; el rendimiento real debe validarse empiricamente.
- El decensurado puede degradar la coherencia y la utilidad general del modelo base, un efecto conocido de la abliteration agresiva en modelos pequenos.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face (cuantizaciones i1): https://huggingface.co/mradermacher/LFM3-1.7B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/OpenIntelligenceNet/LFM3-1.7B-Uncensored
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/LFM3-1.7B-Uncensored-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-Uncensored-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Liquid AI (organizacion): https://www.liquid.ai/
