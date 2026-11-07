# mradermacher/Llama-3.2-3B-reasoner-GGUF

## Resumen

Llama-3.2-3B-reasoner-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo taddeusb90/Llama-3.2-3B-reasoner, publicada por mradermacher el 25 de febrero de 2025. El modelo subyacente es un ajuste fino (fine-tune) del Llama 3.2 de 3B parámetros de Meta, orientado a tareas de razonamiento y entrenado presumiblemente con llama-factory, segun las etiquetas de la model card.

El repositorio no aporta informacion sobre el proceso de entrenamiento, los datos utilizados ni los benchmarks del modelo original; se limita a ofrecer los pesos cuantizados en 12 variantes que van desde Q2_K (1,5 GB) hasta f16 (6,5 GB). El modelo base cuenta con 3.212.749.888 parametros segun los safetensors del modelo original.

Su relevancia practica radica en que permite ejecutar un modelo de 3B con orientacion a razonamiento en hardware de consumo modesto, gracias a las cuantizaciones de 4 bits que ocupan alrededor de 2 GB. Es, por tanto, una opcion de despliegue local mas que un modelo novedoso en si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 3B) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune del Llama 3.2 3B, un transformer decoder-only con atencion por grupos (GQA) y tokenizer BPE, aunque la model card no detalla la configuracion exacta de capas, dimensiones ni cabezas. El ajuste se realizo con llama-factory, segun las etiquetas del repositorio, lo que sugiere un entrenamiento supervisado (SFT) o posiblemente DPO sobre el modelo base, pero no se especifica el dataset, el numero de tokens ni si hubo etapas de RLHF.

No se documenta ninguna innovacion tecnica adicional: no hay atencion lineal, decodificacion especulativa ni mecanismos de "thinking mode" declarados. Las cuantizaciones son estaticas (no hay variantes con imatrix publicadas por el autor en el momento de la ficha), y se ofrecen desde 2 hasta 16 bits por peso.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento de proposito general, presumiblemente reforzado por el ajuste fino orientado a "reasoner", aunque no se documenta el formato exacto de razonamiento.
- No se declara soporte explicito de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingues limitadas al ingles segun la etiqueta `language: en`.
- Sin vision, audio ni modalidades adicionales.
- Sin modo de pensamiento explicito documentado.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (2,1 GB) se puede desplegar en un portatil con 8 GB de RAM y mantener conversaciones multi-turno en ingles sin conexion.
- Educacion y experimentacion con modelos de razonamiento: util para estudiar como un fine-tune de 3B se comporta en tareas de logica o matematicas basicas, comparandolo con el Llama 3.2 3B original.
- Generacion de texto en entornos con recursos limitados: el quant Q2_K (1,5 GB) permite ejecucion en dispositivos con poca memoria, a costa de calidad.
- Filtrado y clasificacion de texto: al ser un modelo pequeno, puede usarse para tareas de etiquetado o extraccion de informacion en lotes dentro de pipelines locales.
- Base para nuevos fine-tunes: al estar disponible en GGUF y con pesos f16, sirve como punto de partida para experimentos de ajuste con llama-factory u otras herramientas.
- Demos y pruebas offline: integrable en aplicaciones de escritorio o moviles mediante llama.cpp u Ollama, sin dependencia de API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,5 GB (Q2_K), 2,1 GB (Q4_K_M), 2,7 GB (Q6_K), 3,5 GB (Q8_0) y 6,5 GB (f16), sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para cuantizaciones de 4 bits (GTX 1650, RTX 3050, RTX 4060); para f16 se recomienda una RTX 3060 de 12 GB o superior.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 6 GB o mas para Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base tambien puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles; al ser un modelo de 3B, en una RTX 4090 se espera un throughput alto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-reasoner-GGUF | 3,2B | no disponible | no disponible | GGUF | Fine-tune orientado a razonamiento |
| Llama-3.2-3B-Instruct (Meta) | 3,2B | 128K (original) | Llama 3.2 Community License | safetensors, GGUF | Modelo oficial instruct, referencia de calidad |
| Llama-3.2-3B-Instruct-uncensored-GGUF (mradermacher) | 3,2B | no disponible | no disponible | GGUF | Otro fine-tune del mismo autor de cuantizaciones |
| Llama-3.2-3B-Reasoning-Time-GGUF (mradermacher) | 3,2B | no disponible | no disponible | GGUF | Fine-tune alternativo orientado a razonamiento |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, lo que impide confirmar si el uso comercial esta permitido; hay que remitirse al modelo base taddeusb90/Llama-3.2-3B-reasoner y, en ultima instancia, a la licencia de Llama 3.2 de Meta.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad; el riesgo de alucinacion es el habitual en modelos de 3B y no ha sido medido.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; el autor recomienda Q4_K_S o Q4_K_M para uso general.
- No se han publicado cuantizaciones con imatrix, lo que puede reducir la calidad frente a variantes ponderadas de otros repositorios.
- El modelo tiene solo 38 descargas y 0 likes en el momento de la ficha, por lo que carece de validacion comunitaria.
- No se documenta el formato de prompt ni el tokenizer especial del fine-tune, lo que puede provocar respuestas inconsistentes si se usa con plantillas genericas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-3.2-3B-reasoner-GGUF
- Modelo base: https://huggingface.co/taddeusb90/Llama-3.2-3B-reasoner
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.2-3B-reasoner-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Modelo relacionado (uncensored): https://huggingface.co/mradermacher/Llama-3.2-3B-Instruct-uncensored-GGUF
- Modelo relacionado (reasoning-time): https://huggingface.co/mradermacher/Llama-3.2-3B-Reasoning-Time-GGUF
