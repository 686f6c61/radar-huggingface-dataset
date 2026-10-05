# Shorla/aiframe-v3

## Resumen

aiframe-v3 es un clasificador de texto en ingles desarrollado por Shorla que distingue entre texto generado por IA (`ai`) y texto humano (`human`). Se trata de un modelo encoder pequeno construido sobre `microsoft/deberta-v3-xsmall` y afinado como clasificador de secuencia de dos etiquetas, disenado especificamente para funcionar dentro de la extension de navegador AI Frame, que marca parrafos que "suenan a IA" mientras el usuario navega. Su rasgo diferencial es el despliegue: se ejecuta integramente en el dispositivo mediante transformers.js y ONNX cuantizado a int8, sin enviar texto a ningun servidor.

El modelo se entreno sobre el split de entrenamiento del conjunto RAID (Dugan et al., 2024), restringido a los dominios news, reviews, reddit, wiki y books, sin ataques adversariales, con equilibrio entre texto humano y de IA y recortando cada documento a una ventana aleatoria de 40 a 180 palabras para que coincida con la unidad que puntua la extension. Ademas de las etiquetas duras, se uso destilacion con etiquetas suaves del profesor `desklib/ai-text-detector-v1.01` (DeBERTa-v3-large, licencia MIT) con un peso de 0,5.

Es relevante ahora porque la deteccion de texto sintetico se ha convertido en un problema de moderacion editorial, integridad academica y curacion de datos, y la mayoria de soluciones de deteccion implican enviar el texto a una API externa. aiframe-v3 ofrece una alternativa local y ligera (repositorio de 0,1 GB), aunque su alcance es deliberadamente limitado: es una senal de estilo, no una prueba de autoria, y solo cubre ingles. El repositorio acumula 31 descargas y 0 likes, sin validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, atencion desacoplada) con cabeza de clasificacion de secuencia; modelo base `microsoft/deberta-v3-xsmall` |
| Parametros totales | 22 M en el backbone segun la ficha de `microsoft/deberta-v3-xsmall`; la model card de aiframe-v3 no desglosa el total (no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (`max_position_embeddings` del modelo base DeBERTa-v3); la model card no lo explicita. La unidad real de inferencia son ventanas de 40 a 180 palabras |
| Tipos de cuantizacion | int8 dinamica de ONNX Runtime (`ort_u8`: pesos unsigned, por tensor), diferencia maxima de 0,015 frente a PyTorch en los textos de muestra |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`); el repositorio incluye `config.json`, `tokenizer.json`, `tokenizer_config.json` y `special_tokens_map.json`. No se publican pesos en safetensors ni GGUF |
| Etiquetas de salida | `ai`, `human` |
| Tamano del repositorio | 0,1 GB |
| Pipeline | `text-classification` |
| Fecha de publicacion | 2026-10-05 |
| Descargas / likes | 31 / 0 |

## Arquitectura y entrenamiento

La base es DeBERTa-v3 en su variante xsmall, un encoder transformer que sustituye el enmascaramiento de tokens por deteccion de tokens reemplazados al estilo ELECTRA y emplea atencion desacoplada de contenido y posicion. Sobre ese backbone se anade una cabeza de clasificacion de dos clases (`ai` / `human`). No hay decodificacion autoregresiva, atencion lineal ni decodificacion especulativa: el modelo es puramente discriminativo y devuelve una probabilidad por ventana de texto.

El entrenamiento combina etiquetas duras y destilacion. Los datos proceden del train split de RAID, limitado a cinco dominios (news, reviews, reddit, wiki, books), sin ataques adversariales, balanceado entre humano e IA y recortado a ventanas aleatorias de 40 a 180 palabras. El split entre entrenamiento y test se hace por documento fuente, lo que evita fuga de fragmentos del mismo documento entre ambos conjuntos. Como profesor se uso `desklib/ai-text-detector-v1.01` (DeBERTa-v3-large, MIT) con etiquetas suaves ponderadas a 0,5. No se incorporaron muestras frescas de modelos actuales: la model card indica explicitamente 0 filas por falta de claves de API. No se emplearon RLHF ni DPO, tecnicas que no aplican a un clasificador de este tipo.

Un caveat relevante declarado por el propio autor: el profesor fue entrenado a su vez sobre RAID, por lo que las puntuaciones del alumno sobre las ventanas retenidas de RAID pueden ser optimistas. La cuantizacion a int8 apenas degrada el resultado (AUROC 0,9712 en PyTorch frente a 0,9742 en int8 ONNX sobre las mismas ventanas).

## Capacidades

- Clasificacion binaria de texto en ingles: asigna `ai` o `human` a una ventana de texto, con una probabilidad asociada.
- Deteccion de estilo "que suena a IA" a nivel de parrafo, pensada para integrarse en interfaces de lectura, no para atribuir autoria.
- Inferencia local en el navegador mediante transformers.js y ONNX int8: ningun texto sale del dispositivo.
- Funcionamiento sobre ventanas cortas, en el rango de 40 a 180 palabras, que es el regimen con el que se entreno y evaluo.
- Integracion como pipeline de `text-classification` en el ecosistema Hugging Face (etiqueta `transformers.js`).
- No soporta generacion de texto, razonamiento multi-paso, codigo, matematicas, vision ni audio.
- No dispone de tool calling ni function calling: es un clasificador, no un modelo de lenguaje instruible.
- No soporta agentes ni cadenas de decision autonomas.
- Multilingue: no. Solo ingles (`en`).
- No dispone de modo de razonamiento explicito ("thinking mode").

## Casos de uso

- Extension de navegador AI Frame: marcar parrafos sospechosos de ser generados por IA mientras el usuario lee, aprovechando que el modelo corre en el propio navegador con int8 ONNX y no requiere enviar el texto a ningun servicio.
- Triaje editorial en medios digitales: puntuar articulos o columnas recibidas de colaboradores externos antes de la revision humana, usando un umbral alto (por ejemplo 0,90) para minimizar el porcentaje de textos humanos marcados (6,3%).
- Cribado preliminar de integridad academica: generar una senal de alerta sobre trabajos entregados que despues revisa una persona. El modelo nunca deberia usarse como evidencia concluyente dado su 22,0% de falsos positivos a umbral 0,50.
- Curacion de corpus de entrenamiento: filtrar texto sintetico de datasets web o de scraping antes de usarlos para entrenar otros modelos, con el modelo ejecutandose en CPU sobre lotes de ventanas de 40 a 180 palabras.
- Deteccion de resenas fraudulentas en comercio electronico: el entrenamiento incluye los dominios reviews y reddit de RAID, por lo que el modelo es directamente aplicable a resenas de producto y comentarios de foro.
- Etiquetado de contenido en plataformas y CMS: un plugin de publicacion que sugiere una etiqueta de "contenido asistido por IA" para cumplir politicas de transparencia, dejando la decision final al autor o moderador.
- Analisis on-device en entornos sensibles: asesorias legales, documentacion clinica o comunicaciones internas donde enviar el texto a una API de terceros no es aceptable por privacidad, y donde un modelo de 0,1 GB en local es la unica opcion viable.
- Monitorizacion de foros y comunidades: despliegue en el servidor o en el cliente para detectar cuentas que publican texto con patrones de IA de forma sistematica, agregando puntuaciones por usuario en lugar de decidir sobre un unico mensaje.

## Benchmarks y rendimiento

Resultados sobre el conjunto retenido de 4005 ventanas, con el modelo int8 ONNX tal y como se distribuye. AUROC global: 0,9742.

| Umbral | Texto de IA detectado | Texto humano marcado (falsos positivos) |
|---|---|---|
| 0,50 | 96,4% | 22,0% |
| 0,60 | 95,5% | 17,0% |
| 0,70 | 94,5% | 13,6% |
| 0,80 | 93,0% | 10,1% |
| 0,90 | 90,7% | 6,3% |
| 0,95 | 87,7% | 3,8% |

Comparativa frente al profesor y frente a variantes del propio modelo, sobre las mismas ventanas retenidas. "Detectado a X%" es la proporcion de texto de IA capturado cuando el umbral se fija para marcar ese porcentaje de textos humanos.

| Modelo | AUROC | Detectado a 1% | Detectado a 2% | Detectado a 5% |
|---|---|---|---|---|
| Profesor: `desklib/ai-text-detector-v1.01` | 0,9698 | 80,4% | 83,5% | 87,7% |
| Alumno destilado, int8 ONNX (distribuido) | 0,9742 | 78,8% | 83,6% | 89,2% |
| Alumno destilado, PyTorch | 0,9712 | 75,5% | 81,7% | 88,4% |
| Alumno sin profesor (baseline), int8 ONNX | 0,9751 | 73,5% | 84,2% | 89,5% |
| `Shorla/aiframe-v1`, int8 ONNX | 0,9765 | 79,9% | 85,4% | 90,0% |

No se han publicado otros resultados de benchmarks (MMLU, GLUE, etc.) en la informacion disponible; no aplican a un clasificador binario de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. El repositorio completo ocupa 0,1 GB y los pesos son int8, por lo que el modelo cabe holgadamente en memoria de CPU; no se publican cifras exactas de VRAM (no disponible).
- GPU recomendadas: ninguna en particular. El caso de uso objetivo es CPU y navegador. Para procesamiento por lotes a gran escala, cualquier GPU sirve; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en moviles y equipos sin GPU dedicada, al ser un encoder de 22 M de parametros en int8.
- Opciones de despliegue: transformers.js en navegador, ONNX Runtime (Python y JavaScript) y flujos de Hugging Face Optimum para exportacion a ONNX.
- No hay pesos GGUF publicados, por lo que Ollama y llama.cpp no son compatibles directamente. vLLM y TGI no estan pensados para este tipo de clasificador encoder.
- Latencia y throughput: no disponible. No se publican mediciones de latencia por ventana ni de documentos por segundo.
- Cuantizacion adicional: la unica variante publicada es `onnx/model_quantized.onnx` (int8 dinamica, per tensor). No se ofrecen versiones fp16, int4 ni float32.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUROC / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Shorla/aiframe-v3` | 22 M en backbone (DeBERTa-v3-xsmall) | 512 tokens; ventanas de 40-180 palabras | AUROC 0,9742 (int8 ONNX) | MIT | Hugging Face, ONNX int8, transformers.js |
| `desklib/ai-text-detector-v1.01` (profesor) | DeBERTa-v3-large; cifra exacta no disponible | No disponible | AUROC 0,9698; 80,4% a 1% de falsos positivos | MIT | Hugging Face |
| `Shorla/aiframe-v1` | No disponible (predecesor) | No disponible | AUROC 0,9765; 90,0% a 5% de falsos positivos | MIT | Hugging Face |
| Alumno baseline (sin destilacion) | 22 M en backbone (DeBERTa-v3-xsmall) | Igual que aiframe-v3 | AUROC 0,9751; 89,5% a 5% de falsos positivos | MIT | Incluido como referencia en la model card, no distribuido como modelo independiente |

No se dispone de comparaciones con otros detectores publicos de texto generado por IA fuera de los incluidos en la propia model card; esa informacion no esta disponible.

## Limitaciones y advertencias

- "Suena a IA" es una senal de estilo, no una afirmacion sobre quien escribio el texto. La propia model card lo explicita; no debe presentarse como prueba de autoria.
- Tasa de falsos positivos alta en umbrales bajos: con umbral 0,50 marca como IA el 22,0% de los textos humanos. En umbral 0,90 sigue marcando el 6,3%.
- Solo ingles. No hay evaluacion en otras lenguas y no debe asumirse transferencia.
- Sesgo de dominio hacia los cinco dominios de RAID (news, reviews, reddit, wiki, books). El rendimiento fuera de ellos no esta validado.
- Ventanas de 40 a 180 palabras: el modelo se entreno y evaluo en ese rango. No hay datos sobre su comportamiento en fragmentos mas cortos o mas largos.
- Sin datos frescos de modelos actuales: la model card indica 0 filas de muestras recientes por falta de claves de API, por lo que la deteccion de texto generado por modelos nuevos puede degradarse con el tiempo.
- Riesgo de puntuaciones optimistas: el profesor fue entrenado sobre RAID y la evaluacion se hace sobre ventanas retenidas de RAID, lo que el autor reconoce como posible fuente de sobreestimacion.
- Rendimiento ligeramente inferior a su predecesor: `Shorla/aiframe-v1` obtiene AUROC 0,9765 y mejor captura a 2% y 5% de falsos positivos que aiframe-v3 (0,9742). No hay una mejora clara respecto a v1 en los numeros publicados.
- Validacion externa inexistente: 31 descargas y 0 likes en el momento de redactar esta ficha; no hay evaluaciones independientes ni replicaciones.
- Uso en contextos de alto impacto: no apto como decision automatica en entornos academicos, judiciales, laborales o de moderacion con consecuencias graves. Debe ir siempre acompanado de revision humana.
- Licencia MIT, con la obligacion de conservar el aviso de copyright y de licencia. El modelo deriva de `desklib/ai-text-detector-v1.01`, tambien MIT, cuyo aviso se reproduce en la model card.
- El software se distribuye "AS IS", sin garantia de ningun tipo segun los terminos MIT.
- No se han publicado evaluaciones de sesgo por variante dialectal, nivel de competencia linguistica del autor o registro formal; esa informacion no esta disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shorla/aiframe-v3
- Modelo base: https://huggingface.co/microsoft/deberta-v3-xsmall
- Profesor de destilacion: https://huggingface.co/desklib/ai-text-detector-v1.01
- Dataset de entrenamiento y evaluacion (RAID, Dugan et al., 2024): https://huggingface.co/datasets/liamdugan/raid
- Predecesor del modelo: https://huggingface.co/Shorla/aiframe-v1 (referenciado en la model card, sin ficha consultada)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados correspondian a articulos de prensa y entradas enciclopedicas sin relacion con aiframe-v3. No se han localizado papers, blogs ni demos adicionales.
