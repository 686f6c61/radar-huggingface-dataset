# mradermacher/DarkDesires-LLaMa-70B-i1-GGUF

## Resumen

DarkDesires-LLaMa-70B-i1-GGUF es una cuantizacion en formato GGUF del modelo TareksLab/DarkDesires-LLaMa-70B, realizada por mradermacher, un cuantizador conocido en la comunidad de HuggingFace. El modelo original es un merge creado con mergekit sobre una base de arquitectura LLaMA de 70 mil millones de parametros, orientado a conversacion en ingles. Esta version i1 (imatrix) aplica la tecnica de cuantizacion con importancia matrix, que mejora la calidad de los quants de baja precision en comparacion con las versiones estaticas.

El interes principal de esta ficha es que ofrece una amplia gama de niveles de cuantizacion, desde IQ1_M (16,9 GB) hasta Q6_K (58,0 GB), lo que permite ejecutar un modelo de 70B en hardware muy diverso, desde GPUs de consumo con 16-24 GB de VRAM hasta sistemas de multiples GPU o inferencia en CPU. La licencia del modelo base no esta disponible, lo que limita su uso en produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (merge de LLaMA 70B, no se especifica la variante exacta) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix: i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivo imatrix adicional) |

## Arquitectura y entrenamiento

El modelo base `TareksLab/DarkDesires-LLaMa-70B` es un merge creado con mergekit, lo que indica que combina pesos de varios modelos de la familia LLaMA 70B. No se proporcionan detalles sobre la composicion del merge, los datos de entrenamiento o si se aplicaron tecnicas como RLHF o DPO. La cuantizacion realizada por mradermacher utiliza la tecnica de imatrix (importance matrix), que calcula la importancia de cada peso durante la cuantizacion para minimizar la perdida de calidad, especialmente en quants de baja precision como IQ1_M o IQ2_XXS. Esto permite obtener archivos mas pequeños con una degradacion menor de la que se obtendria con cuantizaciones estaticas convencionales.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo esta etiquetado como "conversational", lo que indica que esta orientado a dialogos multi-turno.
- Inferencia local con hardware limitado: gracias a la variedad de cuantizaciones, el modelo puede ejecutarse en sistemas con poca VRAM o incluso en CPU.
- Compatibilidad con el ecosistema GGUF: se puede usar con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.
- No se documentan capacidades como tool calling, agentes, vision o audio en la informacion proporcionada.

## Casos de uso

- Despliegue de un LLM de 70B en hardware de consumo: con el quant i1-Q4_K_S (40,4 GB) se puede ejecutar en una GPU con 48 GB de VRAM, como una RTX A6000, o en configuraciones de doble GPU de 24 GB. Para sistemas con menos memoria, el quant i1-IQ2_XXS (19,2 GB) permite una experiencia basica en una RTX 4090.
- Prototipado de aplicaciones conversacionales: al ser un modelo de 70B, ofrece mayor calidad que modelos de menor tamano, y las cuantizaciones permiten iterar rapidamente en entornos locales sin infraestructura en la nube.
- Inferencia en CPU con llama.cpp: los quants de menor tamano (como i1-IQ1_M con 16,9 GB) pueden ejecutarse en CPU con suficiente RAM, util para entornos sin GPU o en pruebas de concepto.
- Investigacion de cuantizacion imatrix: los archivos incluidos permiten comparar la calidad entre distintos niveles de cuantizacion, lo que es util para estudios de compresion de modelos.
- Integracion en aplicaciones de chat local: con Ollama o LM Studio, el modelo puede servir como backend para un asistente conversacional en ingles, sin depender de servicios externos.
- Evaluacion de modelos fusionados: al ser un merge, puede utilizarse para probar el comportamiento de la combinacion de pesos de distintos modelos de la familia LLaMA 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del quant elegido. El archivo mas pequeno (i1-IQ1_M, 16,9 GB) requiere al menos 18-20 GB de VRAM con overhead, mientras que el mas grande (i1-Q6_K, 58,0 GB) necesita al menos 60 GB de VRAM o ejecucion en CPU con 64 GB de RAM.
- GPU recomendadas: para quants de hasta 24 GB (i1-Q2_K_S, i1-IQ2_M, i1-Q2_K), una RTX 4090 o RTX 3090 con 24 GB es suficiente. Para quants de 40-42 GB (i1-Q4_K_S, i1-Q4_K_M), se recomienda una A6000 (48 GB) o una configuracion de dos GPUs de 24 GB. El quant de 58 GB (i1-Q6_K) requiere una GPU de 80 GB como la A100 o H100, o bien ejecucion en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All y otros motores compatibles con GGUF. Tambien se puede usar con vLLM si se convierte a safetensors, aunque el formato GGUF esta pensado para los primeros.
- Latencia y throughput: no disponible. Dependera del hardware y del quant elegido.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre otros modelos de la misma categoria (70B, GGUF, merge) para realizar una comparativa directa con datos objetivos.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo base, por lo que no se puede garantizar el uso comercial sin verificacion previa con el autor original.
- Idioma limitado: solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- Sin informacion sobre sesgos o alucinaciones: no hay datos de evaluacion de sesgos ni de riesgos de alucinacion, por lo que se recomienda validar el comportamiento en el dominio de uso.
- El nombre "DarkDesires" sugiere que el modelo original puede estar orientado a contenido no filtrado, pero no hay confirmacion explicita en la documentacion. Se debe evaluar la idoneidad del contenido para cada caso de uso.
- Calidad de los quants de baja precision: los quants como i1-IQ1_M o i1-IQ2_XXS tienen una calidad muy reducida y pueden producir errores frecuentes. Se recomienda usar como minimo i1-Q4_K_M para tareas serias.
- Repositorio con archivos de gran tamano: el repo total ocupa 558,6 GB, lo que puede ser un problema de descarga si se necesitan varios quants.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mradermacher/DarkDesires-LLaMa-70B-i1-GGUF
- Modelo original: https://huggingface.co/TareksLab/DarkDesires-LLaMa-70B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Pagina de solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
