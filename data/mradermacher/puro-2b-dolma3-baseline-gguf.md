# mradermacher/Puro-2B-Dolma3-Baseline-GGUF

## Resumen

Puro-2B-Dolma3-Baseline es un modelo de lenguaje de tipo base (no instruido) desarrollado por el grupo thu-pacman, entrenado mediante preentrenamiento continuado sobre el conjunto de datos allenai/dolma3_dolmino_mix-100B-1125. Con 2.031.739.904 parámetros totales (aproximadamente 2B), se posiciona como un modelo compacto orientado a experimentación e investigación en el ámbito del preentrenamiento continuado. El repositorio aquí descrito es una conversión a formato GGUF realizada por mradermacher, que facilita su despliegue en entornos con recursos limitados.

La relevancia de esta ficha radica en dos aspectos: por un lado, el modelo original explora técnicas de preentrenamiento continuado sobre mezclas de datos de alta calidad (Dolma 3), un área activa de investigación; por otro, la disponibilidad de cuantizaciones GGUF (desde Q2_K hasta f16) permite ejecutar el modelo en hardware de consumo. El modelo está etiquetado como base-model, lo que implica que no ha pasado por fases de ajuste fino supervisado ni alineación (RLHF/DPO), y su uso previsto es como punto de partida para tareas posteriores.

La licencia Apache 2.0 y el soporte exclusivo del idioma inglés son factores determinantes para su evaluación. No se dispone de información sobre la longitud de contexto, la arquitectura interna ni los datos exactos de entrenamiento más allá de la mezcla Dolma 3, lo que limita el análisis técnico detallado. Esta ficha recoge toda la información disponible y señala explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de tipo base, segun tags) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Los tags indican que se trata de un modelo transformer de tipo base, sin arquitecturas hibridas ni MoE declaradas. El modelo original (thu-pacman/Puro-2B-Dolma3-Baseline) fue sometido a un proceso de preentrenamiento continuado (continual-pretraining) sobre el dataset allenai/dolma3_dolmino_mix-100B-1125, una mezcla de datos de Dolma 3. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; al tratarse de un base-model, es previsible que no se haya aplicado alineacion.

La innovacion tecnica destacable es el propio enfoque de preentrenamiento continuado sobre una mezcla de datos curada (Dolma 3), que busca mejorar las capacidades del modelo sin aumentar su tamano. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de pensamiento. La version GGUF ha sido generada con cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) y conversion desde formato Hugging Face; no se han publicado cuantizaciones ponderadas con imatrix para este modelo.

## Capacidades

- Generacion de texto autoregresiva: al ser un modelo base, puede completar texto y servir como punto de partida para ajuste fino.
- Razonamiento y conocimiento general: capacidades derivadas del preentrenamiento, sin garantias de alineacion ni instruccion.
- Codigo y matematicas: no se documentan capacidades especificas ni evaluaciones; no disponible.
- Tool calling / function calling: no soportado de forma nativa (modelo base sin instruccion).
- Agentes y razonamiento multi-paso: no soportado de forma nativa; requeriria ajuste fino posterior.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Investigacion en preentrenamiento continuado: el modelo sirve como referencia para estudiar el efecto de continuar el preentrenamiento sobre la mezcla Dolma 3, comparando con el modelo base original.
- Punto de partida para ajuste fino supervisado: al ser un base-model de 2B, es adecuado para experimentos de SFT en dominios especificos con recursos moderados.
- Generacion de texto en ingles en entornos con recursos limitados: las cuantizaciones Q4_K_M (1,4 GB) permiten ejecutarlo en CPU o GPU de gama baja para tareas de completado.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes GGUF, util para medir la degradacion de perplejidad entre Q2_K y Q8_0 en tareas de lenguaje.
- Prototipado de pipelines de inferencia local: integrable en llama.cpp u Ollama para pruebas de latencia y throughput en hardware de consumo.
- Educacion y docencia: modelo pequeno y de licencia permisiva para demostrar el ciclo completo de preentrenamiento, cuantizacion y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB (Q2_K), 1,3-1,4 GB (Q4_K_S/Q4_K_M), 1,8 GB (Q6_K), 2,3 GB (Q8_0) y 4,2 GB (f16), sin contar el contexto adicional.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4-Q8; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base original es compatible con transformers y, presumiblemente, con vLLM/TGI (no confirmado en la informacion).
- Latencia y throughput estimados: no disponibles; dependen del hardware y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Puro-2B-Dolma3-Baseline (este) | 2,03B | no disponible | Apache 2.0 | GGUF, safetensors | Base-model, solo ingles |
| thu-pacman/Puro-2B-Dolma3-Baseline | 2,03B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Al ser un modelo base, no esta alineado ni instruido: puede generar contenido sesgado, toxico o factualmente incorrecto sin filtros.
- Riesgo elevado de alucinacion en tareas de conocimiento factual, especialmente sin ajuste fino posterior.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el modelo.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso practico.
- No se han publicado evaluaciones de sesgo, seguridad ni robustez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Puro-2B-Dolma3-Baseline-GGUF
- Modelo base original: https://huggingface.co/thu-pacman/Puro-2B-Dolma3-Baseline
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Puro-2B-Dolma3-Baseline-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/dolma3_dolmino_mix-100B-1125
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
