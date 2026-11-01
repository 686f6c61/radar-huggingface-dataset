# mradermacher/Spark-X2.6-1.7B-uncensored-GGUF

## Resumen

Spark-X2.6-1.7B-uncensored-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Deepexp/Spark-X2.6-1.7B-uncensored, realizadas por el cuantizador conocido mradermacher. El modelo base es un LLM conversacional de aproximadamente 1.700 millones de parámetros, etiquetado como "Tema_Q-Abliterated" (una técnica de abliteration que elimina los mecanismos de rechazo del modelo) y clasificado como "uncensored". Esto lo dirige a usuarios que buscan un modelo pequeño sin filtros de alineación, algo especialmente útil para investigación en seguridad, red teaming o aplicaciones donde los rechazos estándar resultan restrictivos.

La relevancia de esta ficha de cuantizaciones radica en la accesibilidad: con archivos que van desde 0,9 GB (Q2_K) hasta 3,5 GB (f16), el modelo puede ejecutarse en hardware muy modesto, incluidas GPUs de consumo, portátiles e incluso dispositivos de gama baja, mediante llama.cpp, Ollama u otros runtimes compatibles con GGUF. El modelo soporta inglés y chino, y su licencia base es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | sparkx2_5 (transformer, detalles no disponibles) |
| Parametros totales | 1.707.657.216 (~1,71 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base, Deepexp/Spark-X2.6-1.7B-uncensored, pertenece a la familia etiquetada como sparkx2_5. No se han publicado detalles sobre la arquitectura concreta (número de capas, dimensiones, mecanismos de atención), el dataset de entrenamiento, el número de tokens ni el proceso de post-entrenamiento (RLHF, DPO u otros). Lo que sí consta es la etiqueta "Tema_Q-Abliterated", que indica que se ha aplicado abliteration: una técnica de intervención en pesos (habitualmente sobre direcciones de rechazo en el espacio de activaciones) para suprimir los comportamientos de negativa del modelo sin necesidad de reentrenamiento.

Esta ficha concreta es un repositorio de cuantizaciones estáticas generadas por mradermacher a partir de los pesos originales en safetensors. La conversión se realizó en formato HF a GGUF, ofreciendo doce niveles de cuantización que cubren desde 2 bits (Q2_K) hasta precisión completa de 16 bits (f16). En el momento de publicación no hay cuantizaciones weighted/imatrix disponibles, aunque el autor acepta peticiones mediante Community Discussions.

## Capacidades

- Generacion de texto conversacional: el pipeline etiquetado es "conversational", orientado a dialogo multi-turno.
- Sin filtros de alineacion: la abliteration elimina los rechazos tipicos, respondiendo a prompts que otros modelos declinan.
- Soporte bilingue: ingles y chino.
- No hay informacion que indique soporte nativo de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Al ser un modelo base de 1,7B abliterated, sus capacidades de razonamiento, codigo y matematicas avanzadas son limitadas respecto a modelos mayores; no se han publicado evaluaciones que lo cuantifiquen.

## Casos de uso

- Investigacion en seguridad y red teaming: la abliteration permite estudiar comportamientos del modelo sin rechazos, util para evaluar robustez de alineacion y generar datasets adversariales en entornos controlados.
- Ejecucion local en hardware minimo: con el cuant Q2_K (0,9 GB) o Q4_K_M (1,2 GB) puede correr en portatiles sin GPU dedicada o en mini-PCs, ideal para pruebas offline.
- Prototipado rapido de chatbots: su tamano reducido permite iteraciones rapidas de agentes conversacionales simples en ingles o chino antes de escalar a modelos mayores.
- Integracion en aplicaciones con latencia exigente: en GPUs de consumo, un modelo de 1,7B cuantizado a Q4 ofrece throughput muy alto, adecuado para respuestas casi instantaneas en interfaces de usuario.
- Generacion sintetica de datos: al no rechazar prompts, puede usarse para generar corpus de texto libre en ingles o chino para analisis posterior o filtrado manual.
- Educacion y experimentacion con cuantizaciones: el repo ofrece doce niveles de cuant, util para comparar en la practica la degradacion de calidad entre Q2_K y f16 en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1 GB (Q2_K, 0,9 GB de archivo) hasta ~4,5 GB (f16, 3,5 GB), mas margen para el KV cache segun la longitud de contexto.
- GPUs recomendadas: cualquier GPU moderna sirve dada la pequenez del modelo; una RTX 3060 de 12 GB o una RTX 4090 lo ejecutan con holgura sobrada. No se requieren A100 ni H100.
- Consumer GPUs: cabe sin problemas en GPUs de 4 GB en cuants Q2_K a Q5_K_M; incluso puede ejecutarse solo en CPU (RAM de 4-8 GB suficiente) a velocidades razonables dado el tamano.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; por tamano y cuantizacion, se espera inferencia muy rapida incluso en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-1.7B-uncensored (esta ficha) | 1,71 B | no disponible | Apache 2.0 | Abliterated, GGUF, en/zh |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Qwen Research / Apache 2.0 (algunos checkpoints) | Fuerte en zh/en, con alineacion estandar |
| Llama-3.2-1B-Instruct | 1,24 B | 131.072 tokens | Llama 3.2 Community License | Amplio contexto, uso comercial con condiciones |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | Tamano similar, entrenado por Hugging Face |

Frente a estas alternativas, Spark-X2.6 se diferencia por estar abliterated y por su licencia Apache 2.0 sin restricciones, aunque carece de benchmarks publicados y de documentacion tecnica detallada.

## Limitaciones y advertencias

- Riesgo de alucinacion elevado: al tratarse de un modelo pequeno (1,7B) sin evaluaciones publicadas, la fiabilidad factual es limitada; no apto para produccion sin verificacion humana.
- Sin salvaguardas de seguridad: la abliteration elimina los rechazos, por lo que el modelo puede generar contenido nocivo, ilegal o ofensivo. Su uso conlleva responsabilidad legal y etica plena para el despliegue.
- Sesgos: no hay documentacion sobre sesgos del modelo base; al ser abliterated, los sesgos del entrenamiento subyacente se manifiestan sin atenuacion.
- Limitaciones de idioma: soporte limitado a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto desconocida: al no estar publicada, conviene verificarla empiricamente antes de disenar aplicaciones con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, redistribucion y modificacion sin restricciones adicionales; aun asi, el uso de un modelo sin filtros puede estar sujeto a la legislacion aplicable (AI Act europeo, normativas sectoriales).
- Son cuants estaticos: no hay versiones imatrix/weighted, por lo que los cuants bajos (Q2_K, Q3_K_S) pueden degradar la calidad mas que equivalentes con imatrix.
- Sin benchmarks publicados: imposible comparar objetivamente su rendimiento con alternativas antes de probarlo.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mradermacher/Spark-X2.6-1.7B-uncensored-GGUF
- Modelo base: https://huggingface.co/Deepexp/Spark-X2.6-1.7B-uncensored
- Pagina de descargas resumida de mradermacher: https://hf.tst.eu/model#Spark-X2.6-1.7B-uncensored-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
