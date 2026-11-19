# osunlp/ARLoop-0.6B

## Resumen

ARLoop-0.6B es un modelo de lenguaje base de tipo transformer con bucles ("looped transformer") desarrollado por el grupo OSU-NLP (Ohio State University NLP Group). Se trata de un modelo preentrenado desde cero, completamente abierto, que introduce una innovación arquitectónica denominada "attention residuals": un bloque físico de 18 capas transformer se reutiliza a lo largo de 3 pasadas recurrentes, dando lugar a una profundidad efectiva de 54 capas con solo 583 millones de parámetros totales.

El modelo se ha entrenado sobre aproximadamente 180.000 millones de tokens (179.998.556.160 en el checkpoint final) y se distribuye como checkpoint base, pensado para completado de texto, mid-training y post-training. Su relevancia radica en que explora una vía alternativa al escalado tradicional en profundidad: en lugar de apilar más capas, reutiliza un bloque compartido, lo que reduce el número de parámetros físicos manteniendo una profundidad computacional mayor.

La ventana de contexto es de 4096 tokens, usa el tokenizador de SmolLM2 con un vocabulario de 49.152 entradas y se publica bajo licencia Apache 2.0. La información disponible no incluye resultados numéricos de benchmarks en formato explícito más allá de la figura referenciada en la model card, por lo que los datos de rendimiento cuantitativos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) y attention residuals; 18 capas fisicas compartidas en 3 pasadas recurrentes |
| Parametros totales | 583.138.944 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (los pesos se cargan en BF16 para inferencia; el checkpoint almacenado conserva pesos FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code, requiere trust_remote_code) |

## Arquitectura y entrenamiento

ARLoop-0.6B es un transformer con bucles: un unico conjunto de 18 capas fisicas se aplica de forma recurrente en 3 pasadas, lo que da una profundidad efectiva de 54 capas. La anchura oculta es de 1536 y la intermedia del MLP de 4608, con 16 cabezas de atencion y 4 cabezas KV (GQA). El bloque de attention residuals tiene un tamano de 18 subcapas, con 3 bloques residuales recientes y la embedding de entrada retenida. Las value embeddings se comparten entre capas fisicas alternas y la cabeza de salida esta atada a las embeddings de tokens. El contexto maximo es de 4096 tokens con una base RoPE de 50000.

El entrenamiento se realizo sobre aproximadamente 180.000 millones de tokens usando el tokenizador de SmolLM2 (vocabulario de 49.152). La model card publica checkpoints intermedios por paso de optimizador (desde 50.000 hasta 171.660 pasos finales), lo que permite reproducir curvas de entrenamiento y reanudar mid-training. No se detalla en la informacion disponible la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; al ser un modelo base preentrenado, lo esperable es que no incluya alineamiento por preferencias. El routing y las estadisticas de normalizacion se mantienen internamente en FP32.

## Capacidades

- Generacion de texto y completado de texto: es su funcion principal como modelo base preentrenado.
- Razonamiento y conocimiento general: capacidades emergentes propias de un modelo preentrenado de 0.6B, sujetas a evaluacion tras post-training.
- Codigo y matematicas: no se documentan capacidades especificas ni resultados en la informacion disponible.
- Tool calling / function calling: no disponible de forma nativa; requeriria post-training especifico.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.
- Reutilizacion de checkpoints intermedios: permite cargar revisiones por paso para mid-training.

## Casos de uso

- Investigacion en arquitecturas recurrentes: el modelo sirve como base reproducible para estudiar el efecto del bucle y de los attention residuals frente a transformers apilados de parametros comparables, gracias a sus checkpoints intermedios publicados.
- Mid-training y post-training: al ser un checkpoint base con licencia Apache 2.0, se puede continuar el preentrenamiento o aplicar SFT/DPO sobre dominios concretos (legal, medico, codigo) partiendo de cualquiera de las revisiones step-XXXXXX.
- Completado de texto en ingles en entornos con recursos limitados: sus 583 millones de parametros permiten desplegarlo en GPU de consumo y en CPU, adecuado para autocompletado, resumen extractivo o generacion de borradores.
- Generacion aumentada por recuperacion (RAG) en ingles: con 4096 tokens de contexto puede incorporar varios pasajes recuperados y generar respuestas extractivas o sintetizadas tras un ajuste fino.
- Prototipado de pipelines de NLP: util como modelo de referencia barato para validar tokenizadores, plantillas de prompt y sistemas de evaluacion antes de escalar a modelos mayores.
- Educacion e investigacion academica: su tamano reducido y su licencia permisiva facilitan su uso en cursos, tesis y experimentos de interpretabilidad sin costes de licencia.
- Generacion de datos sinteticos a pequena escala: puede emplearse para producir texto de dominio en ingles que alimente otros entrenamientos, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card referencia una figura de resultados (assets/figure1.png) y el paper arXiv:2611.05234, pero los valores concretos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 583 millones de parametros ocupan aproximadamente 1,2 GB de pesos; con cache KV y overhead de runtime, el consumo realista se situa en torno a 2-3 GB.
- En FP32 (formato original del checkpoint) los pesos ocupan aproximadamente 2,3 GB; en cuantizacion de 8 bits o 4 bits se reduciria por debajo de 1 GB, aunque no se documentan recetas oficiales de cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, L4) es suficiente; A100 y H100 no son necesarias salvo para entrenamiento o mid-training.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (RTX 30/40/50, e incluso iGPU con suficiente memoria compartida).
- Opciones de despliegue: transformers >= 5.22.0 con trust_remote_code (requisito oficial); al usar custom_code, la conversion a GGUF/llama.cpp, vLLM o TGI no esta garantizada y requeriria trabajo adicional no documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| ARLoop-0.6B | 583 M | 4096 | Looped transformer con attention residuals | Apache 2.0 | Modelo base, solo ingles, custom_code |
| Qwen2.5-0.5B | ~494 M | 32.768 | Transformer decoder estandar | Apache 2.0 | Modelo base e instruct, multilingue |
| SmolLM2-360M | ~362 M | 8192 | Transformer decoder estandar | Apache 2.0 | Modelo base e instruct, tokenizador compartido con ARLoop |
| Llama-3.2-1B | ~1.240 M | 131.072 | Transformer decoder estandar | Llama 3.2 Community License | Mayor tamano, contexto muy superior |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no esta alineado con instrucciones ni con preferencias humanas, por lo que puede producir contenido toxico, sesgado o fuera de formato sin post-training.
- Riesgo de alucinacion elevado en tareas factuales, agravado por su tamano reducido (0,6B) y por su entrenamiento exclusivamente en ingles.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto limitado a 4096 tokens, inferior al de modelos contemporaneos de tamano similar.
- Requiere trust_remote_code=True y transformers >= 5.22.0, lo que implica ejecutar codigo remoto y anclar la version de la libreria; la integracion con ecosistemas como llama.cpp, vLLM u Ollama no esta documentada.
- El checkpoint almacenado conserva pesos en FP32 (el repositorio ocupa 39,7 GB), lo que exige conversion a BF16 para un despliegue eficiente.
- Licencia Apache 2.0 permisiva para uso comercial, pero el usuario asume la responsabilidad sobre los sesgos y el contenido generado.
- No se documentan evaluaciones de seguridad, red teaming ni filtros de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/osunlp/ARLoop-0.6B
- Paper (arXiv): https://arxiv.org/abs/2611.05234
- Codigo en GitHub: https://github.com/OSU-NLP-Group/ARLoop
- Checkpoints intermedios: https://huggingface.co/osunlp/ARLoop-0.6B/tree/step-050000 (y sucesivos step-070000, step-090000, step-110000, step-130000, step-150000, step-170000)
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
