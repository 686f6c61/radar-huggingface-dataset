# mradermacher/Llama-3.3-MagicalGirl-2.5-GGUF

## Resumen

Llama-3.3-MagicalGirl-2.5-GGUF es una distribucion de cuantizaciones GGUF del modelo KaraKaraWarehouse/Llama-3.3-MagicalGirl-2.5, un merge de modelos construido con mergekit sobre la base de Llama 3.3 de Meta. El encargado de generar y publicar estas cuantizaciones es mradermacher, un conocido creador de quants dentro de la comunidad de Hugging Face, que distribuye versiones estaticas (Q2_K a Q8_0) y, en un repositorio separado, versiones ponderadas/imatrix (i1-GGUF).

El modelo subyacente cuenta con 70.553.706.560 parametros (aproximadamente 70,6 mil millones), lo que lo situa en la categoria de modelos densos de gran tamano. Al derivar de Llama 3.3, hereda la arquitectura transformer decoder-only de Meta, aunque la model card no documenta explicitamente la longitud de contexto ni los detalles del merge. El repositorio ocupa 481,3 GB en total, incluyendo todas las variantes de cuantizacion.

La relevancia de esta ficha radica en que permite ejecutar en local un modelo de ~70B mediante llama.cpp y formatos GGUF, algo inviable con los pesos originales en bf16 para la mayoria de equipos. Sin embargo, la informacion publicada por el autor es muy escasa: no hay benchmarks, no se detalla la licencia y la model card se limita a listar los ficheros de cuantizacion disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.3; merge con mergekit) |
| Parametros totales | 70.553.706.560 (~70,6 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en formato transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base KaraKaraWarehouse/Llama-3.3-MagicalGirl-2.5 es un merge de modelos generado con mergekit, segun las etiquetas del repositorio. Esto implica que sus pesos resultan de la combinacion de dos o mas modelos preentrenados o ajustados, no de un entrenamiento desde cero. La arquitectura subyacente corresponde a la familia Llama 3.3 de Meta: un transformer decoder-only denso con atencion causal estandar y aproximadamente 70,6 mil millones de parametros.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones especificas del merge. Tampoco se documentan innovaciones tecnicas particulares (atencion lineal, decodificacion especulativa, etc.). El repositorio de mradermacher se limita a aplicar cuantizacion estatica sobre los pesos del modelo base, sin reentrenamiento ni modificacion de la arquitectura. Las versiones ponderadas (imatrix) se publican por separado en el repositorio i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Razonamiento y generacion de texto general, heredado de la base Llama 3.3 (no verificado con benchmarks en la informacion disponible).
- Capacidades multilingues limitadas: el repositorio declara unicamente el idioma ingles.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere uso mediante APIs de inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo de texto).
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de gran capacidad: las cuantizaciones Q4_K_M (42,6 GB) permiten ejecutar un modelo de ~70B en una GPU con 48 GB de VRAM o en configuraciones multi-GPU, algo imposible con los pesos bf16 originales.
- Despliegue en servidores con llama.cpp: el formato GGUF es nativo de llama.cpp, por lo que estas cuantizaciones se pueden servir directamente con `llama-server` para aplicaciones conversacionales en ingles.
- Prototipado de asistentes conversacionales: la etiqueta "conversational" y el formato GGUF facilitan montar un chatbot local sin depender de APIs externas, usando Ollama o llama.cpp como backend.
- Evaluacion comparativa de tecnicas de merge: al ser un merge de Llama 3.3, sirve para estudiar como afecta la fusion de modelos al comportamiento conversacional frente al modelo base original.
- Experimentacion academica con cuantizacion: la disponibilidad de 11 variantes (Q2_K a Q8_0) permite medir el impacto de la cuantizacion en perplejidad y calidad de generacion, siguiendo la guia de tipos de quant incluida en la model card.
- Integracion en pipelines de generacion de texto por lotes: con Q4_K_S o Q4_K_M (marcadas como "fast, recommended" por el autor) se puede procesar grandes volumenes de texto en ingles en hardware de gama alta.
- Uso en entornos sin conectividad: al ser pesos descargables y ejecutables en local, encaja en escenarios de computacion offline o con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF mas overhead de contexto):
  - Q2_K (26,5 GB): ~28-30 GB de VRAM.
  - Q3_K_M (34,4 GB): ~36-38 GB de VRAM.
  - IQ4_XS (38,4 GB): ~40-42 GB de VRAM.
  - Q4_K_M (42,6 GB): ~44-46 GB de VRAM.
  - Q5_K_M (50,0 GB): ~52-54 GB de VRAM.
  - Q6_K (58,0 GB): ~60-62 GB de VRAM.
  - Q8_0 (75,1 GB): ~77-80 GB de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB para Q4_K_M con offloading parcial).
- Cabe en consumer GPU: solo las cuantizaciones mas bajas (Q2_K, Q3_K_S) caben en una unica RTX 4090 de 24 GB con offloading parcial a RAM; el resto requiere multi-GPU o CPU+GPU hibrido.
- Opciones de despliegue: llama.cpp (nativo para GGUF), Ollama, llama-cpp-python, y servidores compatibles con la API de OpenAI mediante `llama-server`. vLLM y TGI no soportan GGUF de forma nativa para este tamano sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.3-MagicalGirl-2.5-GGUF (este) | ~70,6 B | no disponible | no disponible | GGUF | Merge con mergekit, solo ingles |
| Llama-3.3-70B-Instruct (Meta) | ~70,6 B | 128K (segun Meta) | Llama 3.3 Community License | safetensors, GGUF (via terceros) | Modelo oficial, benchmarks publicados |
| Qwen2.5-72B-Instruct | ~72 B | 128K (segun Qwen) | Qwen License | safetensors, GGUF | Multilingue, benchmarks publicados |
| Mistral-Large-Instruct-2411 | ~123 B | 128K (segun Mistral) | MRL (no comercial en version gratuita) | safetensors | Mayor tamano, no comparable directamente |

La comparativa con Llama-3.3-70B-Instruct y Qwen2.5-72B-Instruct es la mas directa por tamano y categoria, aunque este modelo es un merge no oficial sin benchmarks publicados, por lo que no se puede afirmar equivalencia de rendimiento.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce si el merge degrada o mejora el rendimiento respecto a Llama 3.3 original.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; el modelo base de Meta tiene su propia licencia (Llama 3.3 Community License) que puede aplicar en cascada.
- Solo ingles declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de ~70B sin ajuste verificable; el merge puede introducir comportamientos impredecibles.
- Longitud de contexto no documentada: no se puede asumir la ventana de 128K de Llama 3.3 sin confirmacion del autor del merge.
- Modelo de nicho con muy poca traccion (320 descargas, 1 like): escasa validacion comunitaria y sin issues documentados.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor marca Q3_K_M como "lower quality".
- El repositorio ocupa 481,3 GB: la descarga completa de todas las variantes es inviable para la mayoria de usuarios; conviene descargar solo la cuantizacion necesaria.
- No se documenta soporte de tool calling ni de agentes, por lo que no deberia asumirse en produccion sin pruebas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-3.3-MagicalGirl-2.5-GGUF
- Repositorio imatrix (quants ponderados): https://huggingface.co/mradermacher/Llama-3.3-MagicalGirl-2.5-i1-GGUF
- Modelo base: https://huggingface.co/KaraKaraWarehouse/Llama-3.3-MagicalGirl-2.5
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.3-MagicalGirl-2.5-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
