# mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF

## Resumen

Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF es la colección de cuantizaciones estáticas en formato GGUF, realizada por el usuario mradermacher, del modelo base xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic. El modelo original es un merge (fusión) de seis modelos de la familia Qwen3.5 de unos 2B de parámetros, destilado a partir de múltiples fuentes de razonamiento y conversación, y sometido a un proceso de "abliteración" (eliminación de rechazos de seguridad) mediante la herramienta heretic.

El problema que resuelve es doble: por un lado, ofrece un modelo pequeño (1,88 mil millones de parámetros) con capacidades de razonamiento, código, matemáticas y visión (image-text-to-text) que puede ejecutarse en hardware modesto; por otro, las cuantizaciones GGUF permiten su uso directo en CPU o en GPUs de consumo mediante llama.cpp, Ollama u otros runtimes compatibles.

Es relevante ahora porque la combinación de destilación multi-profesor, merges de modelos y cuantizaciones eficientes está permitiendo que modelos de 2B compitan en tareas de razonamiento con modelos mucho mayores, a la vez que la versión "uncensored" lo hace atractivo para casos de uso donde los filtros de alineación estándar resultan obstructivos. El repositorio incluye cuantizaciones desde Q2_K (1,1 GB) hasta f16 (3,9 GB), además de los suplementos multimodales mmproj.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (merge de 6 modelos); no disponible el detalle exacto de capas |
| Parametros totales | 1.881.825.088 (aprox. 1,88B, dato de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (más mmproj-Q8_0 y mmproj-f16 para el componente multimodal) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta cuantizacion); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge de seis modelos ("6xMerge") de la familia Qwen3.5, de aproximadamente 2B de parametros cada uno. La tecnica de merge combina los pesos de varios modelos afinados para heredar capacidades complementarias sin necesidad de un entrenamiento completo desde cero. Sobre el resultado se aplico un proceso de destilacion multidistancia ("MultiDistill") y posteriormente la herramienta heretic, que modifica los pesos para suprimir los comportamientos de rechazo (abliteration/decensoring) sin reentrenamiento supervisado.

El entrenamiento o afinado del modelo base se apoya en varios datasets publicos que revelan su orientacion: TeichAI/polaris-alpha-1000x, Ali-Yaser/KIMI-K2.5-450000x-ShareGPT (conversaciones destiladas presumiblemente de Kimi K2.5), allenai/tulu-3-sft-mixture (mezcla SFT de AI2), nohurry/Opus-4.6-Reasoning-3000x-filtered (razonamiento filtrado) y Jackrong/Qwen3.5-reasoning-700x. Esta composicion indica un entrenamiento por destilacion de salidas de modelos profesores mas grandes, con enfasis en chain-of-thought, codigo y matematicas. No hay informacion disponible sobre numero de tokens, pipeline RLHF/DPO ni detalles de la fase de preentrenamiento.

## Capacidades

- Generacion de texto conversacional, con enfasis en razonamiento encadenado (chain-of-thought) segun los tags del modelo.
- Razonamiento matematico y resolucion de problemas, apoyado en datasets de destilacion de razonamiento.
- Generacion y comprension de codigo.
- Capacidades multimodales: entrada de imagen y texto (pipeline image-text-to-text), con archivos mmproj incluidos para uso con llama.cpp.
- Modelo sin filtros de alineacion (uncensored/abliterated): no emite rechazos tipicos por politicas de seguridad.
- Formato GGUF con amplio rango de cuantizaciones, apto para inferencia local en CPU y GPU.
- No hay informacion disponible sobre soporte de tool calling, function calling ni capacidades agenticas.

## Casos de uso

- Chatbots locales sin censura: al estar abliterado, puede usarse en asistentes conversacionales donde se requiera que el modelo no se niegue a responder temas sensatos bloqueados por alineacion estandar, ejecutandose incluso en portatiles gracias a sus 1,4 GB en Q4_K_M.
- Prototipado de razonamiento en hardware modesto: los datasets de destilacion de razonamiento lo hacen adecuado para experimentar con chain-of-thought en un modelo de 2B que corre en tiempo real en CPU.
- Asistente de codigo embebido en editores locales: su tamano permite integrarlo en IDEs o herramientas tipo copiloto que ejecutan el modelo en local sin coste de API.
- Descripcion y analisis de imagenes offline: gracias al componente multimodal (mmproj), puede responder preguntas sobre imagenes en entornos sin conexion, como aplicaciones de escritorio privadas.
- Generacion sintetica de datos: dado su perfil destilado de razonamiento y codigo, puede emplearse como generador barato de ejemplos SFT para afinar modelos mas grandes.
- Evaluacion y benchmarking de cuantizaciones: al disponer de cuants desde Q2_K a f16, es un buen banco de pruebas para estudiar la degradacion de calidad por cuantizacion en modelos pequeños multimodales.
- Agentes ligeros en dispositivos edge: su huella de memoria reducida lo hace candidato para automatizaciones simples en Raspberry Pi-class hardware o mini PCs, aunque sin garantia de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde aproximadamente 1,1 GB (Q2_K) hasta 3,9 GB (f16); anadir 0,5-0,8 GB si se carga el componente multimodal mmproj. En Q4_K_M (1,4 GB) cabe comodamente en practicamente cualquier GPU moderna o incluso solo en RAM de CPU.
- GPU recomendadas: por su tamano, cualquier GPU de consumo sirve (RTX 3060, RTX 4060, RTX 4090, etc.); no se requieren A100 ni H100.
- Consumer GPUs: cabe sobradamente en todas las GPUs de consumo actuales, incluso en las de 4-6 GB de VRAM con contexto razonable; tambien es plenamente viable la inferencia por CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF; para el modelo base en safetensors, transformers. Los pesos i1 (imatrix/weighted) estan disponibles en un repositorio hermano de mradermacher.
- Latencia y throughput: no disponibles; al ser un modelo de 1,88B en GGUF, se espera inferencia muy rapida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic (este) | 1,88B | no disponible | Si (image-text-to-text) | Apache 2.0 | Merge destilado, abliterado, GGUF |
| Qwen3-1.7B (oficial Alibaba) | 1,7B | no disponible | No (version de texto) | Apache 2.0 | Modelo base oficial, con versiones thinking |
| Qwen3-VL-2B / Qwen2.5-VL-3B (oficiales) | 2-3B | no disponible | Si | Apache 2.0 (Qwen3-VL) / Qwen (Qwen2.5-VL) | Multimodal oficial con soporte documentado |
| Phi-3.5-mini (Microsoft) | 3,8B | 128K | No | MIT | Similar rango de tamano, fuerte en razonamiento |

La comparacion es orientativa: este modelo se distingue por ser un merge comunitario abliterado con componente multimodal, mientras que los alternativos oficiales ofrecen documentacion, benchmarks y soporte de contexto verificados.

## Limitaciones y advertencias

- Modelo abliterado/uncensored: se han eliminado deliberadamente los rechazos de seguridad. Esto implica riesgo elevado de generar contenido problematico y lo hace inadecuado para entornos de produccion orientados a usuarios finales sin capas de moderacion externas.
- Es un merge comunitario sin model card tecnica detallada del autor original: no hay datos de contexto, benchmarks ni proceso de entrenamiento documentado, lo que dificulta evaluar su fiabilidad.
- Riesgo de alucinacion tipico de modelos de 2B, posiblemente agravado por el proceso de merge y abliteration, que puede degradar la coherencia del razonamiento.
- Idioma principal: ingles. No hay garantia de rendimiento en castellano ni otros idiomas.
- La cuantizacion Q2_K y Q3_K_M estan marcadas por el propio cuantizador como de calidad reducida; para uso serio se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero deben revisarse los terminos de los datasets de destilacion empleados (salidas de modelos propietarios como Kimi u Opus podrian tener restricciones implicitas).
- El componente multimodal depende de los archivos mmproj; sin ellos, el modelo funciona solo como LLM de texto.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Cuants imatrix/weighted: https://huggingface.co/mradermacher/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
