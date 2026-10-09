# flydexo/bad-laya

## Resumen

bad-laya es un checkpoint de investigación de pesos abiertos publicado por el usuario flydexo en HuggingFace, diseñado para lo que su autor denomina "decisiones tipadas" (typed decisions). En lugar de generar texto, el modelo recibe un estado de entrada (texto plano o JSON) junto con una pregunta y un conjunto explícito de opciones, y devuelve una puntuación de probabilidad para cada opción. Construye sobre el encoder answerdotai/ModernBERT-large afinado, al que añade una cabeza de decisión formada por dos capas transformer que asignan una puntuación aprendida por cada marcador de opción.

El checkpoint liberado es el estado parcial de la etapa 16 de un currículo de entrenamiento ordenado, no el mejor checkpoint de la ejecución completa. Cuenta con 421.029.889 parámetros totales (unos 421 millones), almacenados en 895 MB de safetensors, con el encoder en BF16 y la cabeza de decisión en FP32. La ventana de contexto está limitada a 1.024 tokens por pregunta según la configuración de preprocesado guardada, y el modelo está etiquetado únicamente para inglés.

Es relevante en el momento actual porque explora una arquitectura no autorregresiva y de un solo pase hacia delante para tareas de clasificación y decisión con espacio de respuesta dinámico: las opciones que se pasan en la pregunta definen el espacio de respuestas en tiempo de inferencia, sin necesidad de generar tokens. Su rendimiento es experimental y desigual: obtiene un 53,7 % en ARC-Easy (por encima del 25 % aleatorio) y un 65,2 % de precisión media macro en validación de 21 fuentes, pero regresiona 2,1 puntos respecto a la etapa anterior del currículo y falla de forma acusada en varias tareas de reseñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) con cabeza de decisión de dos capas transformer |
| Parametros totales | 421.029.889 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | hasta 1.024 tokens por pregunta |
| Tipos de cuantizacion | pesos nativos en BF16 (encoder) y FP32 (cabeza de decisión); no se documentan cuantizaciones adicionales |
| Idiomas soportados | en (inglés) |
| Licencia | no declarada para el checkpoint combinado; el modelo base ModernBERT es Apache 2.0 |
| Formato de pesos | safetensors (895 MB) |

## Arquitectura y entrenamiento

bad-laya parte del backbone answerdotai/ModernBERT-large, fijado en la revisión 45bb4654a4d5aaff24dd11d4781fa46d39bf8c13, y le añade una cabeza de decisión compuesta por dos capas transformer que producen una puntuación aprendida por cada marcador de opción suministrado. El modelo no genera texto: recibe un estado (texto o JSON) y una pregunta con opciones nombradas, y devuelve una probabilidad por opción. Soporta tres tipos de pregunta: choice (devuelve la opción nombrada más probable), score (devuelve el índice de nivel ponderado por probabilidad) y noul (devuelve la probabilidad de verdadero). El código personalizado del paquete decisions se encarga del preprocesado y de la puntuación de los marcadores de opción; no es un modelo utilizable como transformers.AutoModel.from_pretrained ni como modelo de generación de texto.

El autor indica que el modelo se entrenó con las 15 divisiones curriculares más pequeñas y después se detuvo a mitad de la división de Amazon Reviews, tras 136.392 filas de esa partición; esta es la etapa parcial 16. CodeReviewer, MultiNLI, DBpedia 14, Yelp y Consumer Finance todavía no habían sido etapas de entrenamiento, aunque sí se incluyeron en toda la validación cruzada entre fuentes. Se aplicó una calibración de temperatura posterior al entrenamiento con un único valor, T = 12,60, almacenado en calibration.json; esta calibración modifica las probabilidades reportadas, pero no las respuestas elegidas ni la precisión. No se documentan en la información disponible detalles sobre composición exacta del dataset ni sobre uso de RLHF o DPO.

## Capacidades

- Decisión de opción múltiple: dado un estado y una pregunta con opciones nombradas, devuelve la opción más probable.
- Puntuación por niveles: para preguntas de tipo score, devuelve el índice de nivel ponderado por probabilidad.
- Decisión booleana: para preguntas de tipo noul, devuelve la probabilidad de que la afirmación sea verdadera.
- Entrada estructurada: acepta estado en texto plano o en JSON.
- Inferencia en un solo pase hacia delante (no autorregresiva), sin generación de texto.
- Espacio de respuesta dinámico: las opciones definidas en la pregunta determinan el conjunto de respuestas posibles en tiempo de inferencia.
- Calibración de probabilidades incorporada mediante temperatura (T = 12,60).
- No soporta tool calling ni function calling según la información disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe: no disponible; el modelo está etiquetado solo para inglés.

## Casos de uso

- Enrutado de decisiones en agentes: el modelo puede actuar como componente de decisión tipada que elige entre opciones predefinidas en un solo pase, útil para seleccionar la siguiente acción en un flujo automatizado sin coste de generación de texto.
- Clasificación de texto corto: puede usarse para tareas de clasificación tratando cada clase como una opción, aprovechando la cabeza de decisión para devolver la clase más probable.
- Sistemas de pregunta-respuesta de opción múltiple: adecuado para responder ítems con alternativas explícitas, como muestran sus resultados en ARC-Easy (53,7 %).
- Filtrado y puntuación booleana: mediante preguntas de tipo noul, puede emplearse para verificar afirmaciones o aplicar filtros binarios sobre textos de entrada.
- Puntuación gradual de estados JSON: con preguntas de tipo score, puede asignar un nivel a un estado estructurado, por ejemplo para priorización o valoración por categorías.
- Componente experimental de investigación en arquitecturas no autorregresivas: sirve como referencia para estudiar decisiones de un solo pase frente a generación de texto.
- Aviso: dado su bajo rendimiento en tareas de reseñas (Yelp 6,3 %, Amazon 18,8 %) y su alta confianza mal calibrada (ECE del 33,5 %), no es recomendable para producción en revisión de opiniones ni en tareas sensibles sin validación previa.

## Benchmarks y rendimiento

Validación macro de 21 fuentes (hasta 32 filas por fuente, 832 preguntas puntuadas):

| Referencia | Precisión |
|---|---|
| bad-laya · paso 60.928 | 65,2 % |
| Etapa 15 del currículo (completa anterior) | 67,3 % |
| Piloto inicial con RTX 4090 | 43,3 % |
| Elección aleatoria uniforme (expectativa analítica) | 29,0 % |
| Confianza de entropía normalizada | 91,8 % |
| ECE de la opción elegida (10 bins por fuente) | 33,5 % |

El checkpoint superó la expectativa aleatoria en 19 de 21 fuentes y al piloto en 17 de 21, pero regresionó 2,1 puntos porcentuales respecto a la etapa 15.

Fuentes de validación donde tiene dificultades:

| Fuente de validación | Precisión | Expectativa aleatoria | Confianza de entropía |
|---|---:|---:|---:|
| Yelp Review Full | 6,3 % | 20,0 % | 100,0 % |
| Amazon Reviews · EN | 18,8 % | 20,0 % | 100,0 % |
| ARC-Challenge | 34,4 % | 25,0 % | 92,5 % |
| BoolQ | 71,9 % | 50,0 % | 82,7 % |
| AG News | 90,6 % | 25,0 % | 100,0 % |

Decision Index 0.3: ARC-Easy (2.376 preguntas congeladas, inferencia en MPS). El modelo acertó 1.277, un 53,7 % (intervalo de Wilson del 95 %: 51,7 %–55,7 %; aleatorio uniforme: 25,0 %).

| Modelo o referencia | Precisión en ARC-Easy |
|---|---:|
| Cloudflare clef | 99,03 % |
| Kev 4B r10 | 97,22 % |
| Kev 0.8B r15 | 82,15 % |
| LiquidAI d1-omni-600M | 70,20 % |
| Bekko System One v0 68M | 57,03 % |
| bad-laya | 53,75 % |
| Bekko System One v0 17M | 42,97 % |
| Elección aleatoria uniforme | 25,02 % (esperado) |

Los valores de comparación proceden de la instantánea pública de resultados de Decision Index generada el 2026-10-07. ARC-Easy se muestra en el tablero pero no cuenta para el índice global; se trata de una comparación de un solo benchmark, no de una puntuación de índice completa ni de un envío oficial a un leaderboard. No hay puntuación completa de Decision Index 0.3 disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 895 MB en safetensors (encoder BF16 + cabeza FP32), por lo que los pesos caben en menos de 1 GB, más el margen de activaciones y overhead de runtime.
- Cabe en GPU de consumo: sí, con holgura; el autor menciona un piloto previo con una RTX 4090 y la ejecución de ARC-Easy se hizo por inferencia en MPS (Apple Silicon).
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM es suficiente dado el tamaño del modelo; no se documentan requisitos mínimos concretos.
- Opciones de despliegue: el modelo no es un transformers.AutoModel estándar; requiere el código personalizado del paquete decisions (GitHub Flydexo/decisions) para el preprocesado y la puntuación de marcadores de opción. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa basada en la tabla pública de ARC-Easy del Decision Index (modelos publicados que respondieron las 2.376 peticiones):

| Modelo | Parámetros | Contexto | ARC-Easy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bad-laya (flydexo) | 421M | 1.024 tokens | 53,75 % | no declarada | HuggingFace (checkpoint experimental) |
| Bekko System One v0 68M | 68M | no disponible | 57,03 % | no disponible | HuggingFace |
| LiquidAI d1-omni-600M | 600M | no disponible | 70,20 % | no disponible | HuggingFace |
| Kev 0.8B r15 | 0,8B | no disponible | 82,15 % | no disponible | HuggingFace |
| Kev 4B r10 | 4B | no disponible | 97,22 % | no disponible | HuggingFace |

En parámetros, el comparador más cercano es LiquidAI d1-omni-600M (600M), que supera a bad-laya en ARC-Easy. El Bekko System One v0 68M, con muchos menos parámetros, también lo supera en esa prueba. Para el resto de comparadores (contexto, licencia, disponibilidad adicional), no hay datos suficientes en la información disponible.

## Limitaciones y advertencias

- Checkpoint parcial: es la etapa 16 de un currículo ordenado, no el mejor checkpoint de la ejecución; regresiona 2,1 puntos respecto a la etapa 15.
- Calibración deficiente: el ECE de la opción elegida es del 33,5 %, con una confianza de entropía normalizada del 91,8 %; el modelo puede mostrarse muy seguro y estar equivocado.
- Mal rendimiento en reseñas: Yelp Review Full (6,3 %) y Amazon Reviews · EN (18,8 %) quedan por debajo de la expectativa aleatoria en la muestra de validación.
- Entrenamiento incompleto: el modelo se detuvo a mitad de la división Amazon Reviews; CodeReviewer, MultiNLI, DBpedia 14, Yelp y Consumer Finance nunca fueron etapas de entrenamiento, aunque sí participaron en la validación cruzada.
- Contexto limitado: máximo de 1.024 tokens por pregunta, lo que restringe estados de entrada largos.
- Idioma: solo inglés etiquetado; sin capacidades multilingües documentadas en el checkpoint.
- Licencia: el autor no declara licencia para el checkpoint combinado, lo que impide confirmar condiciones de uso comercial; solo el modelo base ModernBERT es Apache 2.0.
- Integración: no es un modelo drop-in de transformers ni un modelo de generación de texto; requiere código personalizado para funcionar.
- Riesgo de alucinación: al no generar texto, el riesgo se traslada a decisiones mal calibradas o a elecciones incorrectas presentadas con alta confianza.
- Uso previsto: el propio autor lo etiqueta como investigación, no como modelo listo para producción en tareas de revisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flydexo/bad-laya
- Perfil del autor en HuggingFace: https://huggingface.co/flydexo
- Repositorio de código decisions: https://github.com/Flydexo/decisions
- Informe ARC-Easy de bad-laya: https://github.com/Flydexo/decisions/blob/main/reports/bad-laya-arc-easy.json
- Comparación visual de resultados del currículo: https://github.com/Flydexo/decisions/blob/main/reports/curriculum-results.html
- Kit de reproducción Decision Index 0.3: https://github.com/apolinario/decision-index
- Instantánea pública de resultados de Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/960c70899ef5da38d39b2c645b83f46e198e1a6a/data/index.json
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Artículo de blog sobre el modelo Laya (referencia externa): https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
- Documentación de Laya AI (referencia externa): https://laya-ai.pro/docs
- Sitio de Laya AI (referencia externa): https://laya-model.com/
- Repositorio laya de NandhaKishorM (referencia externa): https://github.com/NandhaKishorM/laya
