# mradermacher/NeoHorse-1-4B-heretic-nosyco-GGUF

## Resumen

NeoHorse-1-4B-heretic-nosyco-GGUF es una distribucion de cuantizaciones GGUF del modelo teddy19032/NeoHorse-1-4B-heretic-nosyco, publicada por mradermacher. El modelo base es un transformer de aproximadamente 4.205 millones de parametros (4,2B), orientado a generacion conversacional en ingles, segun las etiquetas del repositorio. Esta ficha documenta la version cuantizada, que es la unica con datos verificables en la informacion disponible.

El interes practico de esta publicacion es la disponibilidad de pesos en formato GGUF en un rango amplio de cuantizaciones (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), lo que permite ejecutar un modelo de 4B en hardware de consumo modesto mediante llama.cpp u Ollama. La nomenclatura del nombre del modelo sugiere una variante sometida a un proceso de "abliteration" (etiqueta "heretic") y posiblemente un ajuste especifico ("nosyco"), pero no se dispone de documentacion del autor original que confirme la metodologia.

No se dispone de informacion sobre licencia, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. Cualquier evaluacion de calidad debe hacerse de forma empirica por parte del usuario antes de considerarla en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (y safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base teddy19032/NeoHorse-1-4B-heretic-nosyco. Por el numero de parametros (4,2B) y el pipeline conversacional, se trata de un transformer decoder-only de escala pequena, pero no se confirman el numero de capas, las dimensiones ocultas, el tipo de atencion ni la funcion de activacion.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. La etiqueta "heretic" en el nombre es habitual en modelos sometidos a tecnicas de abliteration (eliminacion de direcciones de rechazo en el espacio de activaciones), y "nosyco" podria referirse a un ajuste o merge especifico, pero ninguna de estas hipotesis esta confirmada por el autor. mradermacher solo documenta el proceso de cuantizacion estatica (quantize_version 2, convert_type hf) y no aporta informacion sobre el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite desplegarlo en infraestructuras compatibles con la API de HuggingFace.
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp) gracias al formato GGUF.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles declarado; no hay evidencia de soporte de otros idiomas.
- No se dispone de informacion sobre razonamiento multi-paso, matematicas o generacion de codigo.

## Casos de uso

- Prototipado local de chatbots: el modelo puede cargarse en un portatil con GPU de consumo usando la cuantizacion Q4_K_M (2,8 GB) y emplearse para conversaciones de prueba en ingles sin depender de APIs externas.
- Experimentacion con abliteration: investigadores interesados en estudiar el efecto de la eliminacion de rechazos pueden comparar esta variante con el modelo base y medir diferencias de comportamiento.
- Evaluacion de cuantizaciones: el rango completo de cuantizaciones (de Q2_K a f16) permite analizar la degradacion de perplejidad y calidad conversacional segun el nivel de compresion.
- Despliegue en entornos con recursos limitados: con Q2_K (2,0 GB) cabe en GPUs de 4 GB o incluso en CPU con RAM suficiente, util para demos y entornos embebidos.
- Generacion de texto creativo en ingles: el formato conversacional y el ajuste "heretic" pueden ser utiles para escritura sin filtros restrictivos, siempre que el usuario asuma la responsabilidad del contenido generado.
- Base para fine-tuning posterior: al ser un modelo de 4B con pesos safetensors disponibles en el repositorio base, puede servir como punto de partida para ajustes especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 2,0 GB.
  - Q4_K_M: aproximadamente 2,8 GB.
  - Q8_0: aproximadamente 4,6 GB.
  - f16: aproximadamente 8,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060). Para f16 se recomienda una RTX 3060 de 12 GB o superior.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6-8 GB de VRAM usando cuantizaciones Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NeoHorse-1-4B-heretic-nosyco | 4,2B | no disponible | no disponible | GGUF, safetensors | Variante abliterated sin benchmarks publicos |
| Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo oficial con benchmarks publicos |
| Llama-3.2-3B-Instruct | 3,2B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Amplio contexto y ecosistema maduro |
| Phi-3.5-mini-instruct | 3,8B | 131.072 tokens | MIT | safetensors, GGUF | Buen rendimiento en razonamiento y codigo |

La comparativa es orientativa: no existen datos publicos de rendimiento de NeoHorse-1-4B que permitan una comparacion cuantitativa con estos modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos: no hay evidencia de calidad en MMLU, HumanEval, GSM8K ni otras tareas estandar.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor del modelo base antes de usarlo en produccion.
- Solo ingles declarado: no se recomienda su uso en castellano ni en otros idiomas sin evaluacion previa.
- La etiqueta "heretic" implica una posible eliminacion de mecanismos de rechazo, lo que incrementa el riesgo de generar contenido inapropiado, ofensivo o danoso sin advertencia.
- Riesgo de alucinacion elevado por el tamano reducido del modelo y la falta de documentacion sobre el entrenamiento.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria ni retroalimentacion sobre su comportamiento real.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la coherencia; para uso serio se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NeoHorse-1-4B-heretic-nosyco-GGUF
- Modelo base: https://huggingface.co/teddy19032/NeoHorse-1-4B-heretic-nosyco
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#NeoHorse-1-4B-heretic-nosyco-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
