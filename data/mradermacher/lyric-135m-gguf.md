# mradermacher/Lyric-135M-GGUF

## Resumen

Lyric-135M es un modelo de lenguaje de tipo transformer decoder-only con 134.515.008 parametros totales, desarrollado por Epode y distribuido en formato GGUF por mradermacher. Se trata de un modelo base pequeno orientado a tareas de generacion de texto en ingles, entrenado mediante un proceso de continual-pretraining seguido de supervised fine-tuning (SFT). Su reducido tamano lo situa en la categoria de modelos que pueden ejecutarse en una sola GPU consumer, incluso en hardware modesto.

La relevancia de esta ficha radica en su empaquetado para inferencia local: mradermacher ha generado una bateria completa de cuantizaciones GGUF (desde Q2_K hasta f16), lo que permite desplegar el modelo con llama.cpp u Ollama en entornos con recursos limitados. El modelo base subyacente, Epode/Lyric-135M, esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

No obstante, la informacion publica disponible es muy escasa: no se documentan la longitud de contexto, la composicion del dataset de entrenamiento, los resultados de benchmarks ni las capacidades especificas mas alla de las etiquetas genericas del repositorio. Esta ficha refleja fielmente esa limitacion y marca como "no disponible" todo dato no confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no disponible el detalle exacto de capas y dimensiones) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de 135M parametros, tal como indican las etiquetas del repositorio (`135m`, `transformers`). El proceso de entrenamiento documentado se divide en dos fases: un continual-pretraining sobre el modelo base y un posterior supervised fine-tuning (SFT). Las etiquetas `data-curation`, `single-gpu` y `l20` sugieren que el entrenamiento se realizo con una curación cuidadosa del corpus y en una unica GPU (posiblemente una NVIDIA L20), lo que es coherente con el reducido tamano del modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El repositorio de mradermacher unicamente documenta el proceso de cuantizacion estatica a GGUF, sin aportar detalles adicionales sobre el entrenamiento del modelo original.

## Capacidades

- Generacion de texto en ingles: el modelo esta disenado para continuar y generar texto coherente en dicho idioma.
- Razonamiento basico y respuesta a instrucciones: la fase de SFT sugiere cierta capacidad de seguir instrucciones, aunque no se documenta su alcance.
- No se ha confirmado soporte de tool calling ni function calling.
- No se ha confirmado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la etiqueta `language: en`.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Prototipado rapido en local: gracias a sus cuantizaciones de ~0,2 GB, el modelo puede cargarse en llama.cpp u Ollama en un portatil para probar pipelines de generacion de texto sin infraestructura dedicada.
- Generacion de texto en dispositivos de borde: su reducido footprint permite ejecutarlo en Raspberry Pi o mini-PC con CPU, util para tareas de autocompletado o generacion de plantillas en entornos sin GPU.
- Filtrado y clasificacion de texto simple: puede emplearse como modelo auxiliar para tareas de etiquetado o categorizacion de baja complejidad en ingles, donde la latencia importa mas que la precision.
- Educacion e investigacion: sirve como banco de pruebas para experimentos de cuantizacion, comparativas de calidad entre niveles GGUF o estudios de eficiencia en modelos pequenos.
- Generacion de descripciones y resumenes cortos: adecuado para producir textos breves en ingles en aplicaciones de contenido donde no se requiere un modelo grande.
- Base para fine-tuning ligero: al ser un modelo de 135M con licencia Apache 2.0, puede ajustarse en una sola GPU consumer para dominios especificos (soporte, documentacion tecnica) con costes minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en cuantizaciones Q2_K a Q8_0; unos 0,4 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100, aunque estas ultimas estan sobredimensionadas para su tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base original es compatible con transformers.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Lyric-135M (esta ficha) | 134,5M | no disponible | Apache 2.0 | GGUF, safetensors | Hugging Face |
| SmolLM-135M | 135M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Gemma-2-270M | 270M | 8.192 tokens | Gemma License | safetensors, GGUF | Hugging Face |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de resultados de benchmarks de Lyric-135M para contrastar rendimiento. SmolLM-135M es el competidor mas directo por tamano y licencia, mientras que Qwen2.5-0.5B y Gemma-2-270M ofrecen mayor contexto y capacidades documentadas a costa de un mayor footprint.

## Limitaciones y advertencias

- Modelo de 135M parametros: capacidad de razonamiento y conocimiento del mundo muy limitada en comparacion con modelos de mayor tamano; propenso a errores factuales y alucinaciones.
- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no es posible planificar aplicaciones que requieran ventanas largas sin verificacion empirica.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas.
- Las cuantizaciones de menor bit (Q2_K, Q3_K_S) degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de documentacion sobre el dataset de entrenamiento impide descartar riesgos de contaminacion o sesgos no declarados.
- No se documentan salvaguardas de seguridad ni alineamiento mas alla del SFT generico; no recomendado para produccion sin evaluacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Lyric-135M-GGUF
- Modelo base: https://huggingface.co/Epode/Lyric-135M
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Lyric-135M-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
