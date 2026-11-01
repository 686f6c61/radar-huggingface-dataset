# mradermacher/Ohm-MythosNano-GGUF

## Resumen

Ohm-MythosNano es un modelo de lenguaje de 3.085 millones de parámetros desarrollado por orangejuicesmith, construido sobre la arquitectura Qwen2 y orientado a tareas de razonamiento, matemáticas y generación de código. La ficha que se presenta aquí corresponde a la versión GGUF cuantizada por mradermacher, un cuantizador conocido en la comunidad por publicar versiones estáticas e imatrix de una amplia variedad de modelos, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros runtimes compatibles con el formato GGUF.

El repositorio cuantizado ofrece doce variantes que van desde Q2_K (1,4 GB) hasta f16 (6,3 GB), con recomendaciones explícitas de las variantes Q4_K_S y Q4_K_M por su equilibrio entre velocidad y calidad. El modelo se etiqueta como conversacional y de razonamiento, y su licencia MIT lo hace apto para uso comercial sin restricciones relevantes. Su tamaño compacto lo sitúa en la categoría de modelos ligeros ejecutables en GPUs de consumo e incluso en CPUs modernas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer) |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (imatrix quants disponibles en repo aparte) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, una familia de transformers densos desarrollada originalmente por Alibaba. Al tratarse de un modelo derivado de 3,09 B de parámetros, cabe esperar una configuración típica de esta escala: capas de atención con GQA (grouped-query attention), embeddings RoPE y activaciones SwiGLU, aunque la model card no detalla el número exacto de capas ni las dimensiones internas.

No se dispone de información sobre el proceso de entrenamiento del modelo base: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Los tags del repositorio (reasoning, math, code) sugieren un entrenamiento o fine-tuning orientado a razonamiento y código, pero no hay datos publicados que lo confirmen en detalle. La versión aquí documentada es una cuantización estática en GGUF realizada por mradermacher a partir de los pesos originales en safetensors, con variantes imatrix (weighted quants) publicadas en un repositorio complementario.

## Capacidades

- Generacion de texto conversacional, según el pipeline indicado en el repositorio.
- Razonamiento (tag "reasoning" en el repositorio).
- Resolucion de problemas de matematicas (tag "math").
- Generacion y comprension de codigo (tag "code").
- Ejecucion local eficiente gracias al formato GGUF, compatible con llama.cpp, Ollama, LM Studio y otros runtimes.
- No hay informacion disponible sobre soporte de tool calling, function calling, capacidades de vision o audio, ni sobre modo de pensamiento explicito (thinking mode).

## Casos de uso

- Asistentes conversacionales locales: su tamaño de ~3 B cuantizado en Q4_K_M (2,0 GB) permite ejecutar un chatbot en portátiles sin GPU dedicada, adecuado para privacidad de datos.
- Generacion de codigo asistida en el editor: puede integrarse en plugins de editor (por ejemplo, mediante llama.cpp u Ollama) para autocompletado y explicacion de fragmentos de codigo, aprovechando su tag de capacidades de codigo.
- Resolucion de problemas de matematicas y razonamiento: util como motor de razonamiento ligero para preguntas aritmeticas y logicas en aplicaciones locales donde no se requiere un modelo de gran escala.
- Prototipado rapido de agentes: su bajo consumo de recursos permite iterar pipelines de agentes multi-paso en hardware modesto, aunque no hay confirmacion de soporte nativo de tool calling.
- Despliegue en servidores de bajo coste: las variantes Q2_K a Q4_K caben en GPUs de 4-6 GB de VRAM, ideal para VPS con GPUs economicas o inferencia por CPU con buen throughput dada la escala del modelo.
- Uso educativo y experimentacion: la licencia MIT y la abundancia de cuants lo hacen adecuado para estudiar el impacto de la cuantizacion en la calidad, comparando Q2_K frente a f16.
- Integracion en aplicaciones offline: al ejecutarse completamente en local, es apto para herramientas de productividad sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos de rendimiento del modelo base en MMLU, HumanEval, GSM8K u otras pruebas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (según el tamaño de cada cuant):
  - Q2_K: ~1,4 GB de pesos; funciona en GPUs de 4 GB o incluso solo CPU.
  - Q4_K_S / Q4_K_M: ~1,9-2,0 GB; recomendadas, caben holgadamente en GPUs de 4-6 GB dejando espacio para el contexto.
  - Q6_K: ~2,6 GB; apta para GPUs de 6-8 GB.
  - Q8_0: ~3,4 GB; apta para GPUs de 8 GB.
  - f16: ~6,3 GB; requiere GPUs de 8-12 GB o CPU con suficiente RAM.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090 o superiores ejecutan cualquier variante sin problemas; tambien es plenamente viable en CPU (con AVX2) dada la escala de ~3 B.
- Cabe en GPUs de consumo desde 4 GB de VRAM usando cuants de 2-4 bits; en portatiles con GPU integrada es viable mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se indica compatibilidad con vLLM o TGI para estos archivos GGUF (vLLM ha añadido soporte experimental de GGUF, pero no hay verificacion para este modelo).
- Latencia y throughput: no disponibles; por escala (~3 B) y cuants recomendados, cabe esperar generacion fluida en tiempo real tanto en GPU de consumo como en CPUs modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ohm-MythosNano | ~3,09 B | Qwen2 (denso) | MIT | safetensors, GGUF | Enfocado a razonamiento, matematicas y codigo; cuants estaticos e imatrix disponibles |
| Qwen2.5-3B-Instruct | ~3 B | Qwen2 (denso) | Qwen research license (no comercial en algunos terminos) / Apache 2.0 segun version | safetensors, GGUF | Modelo base de la misma familia; mejor documentado y con benchmarks publicados |
| Phi-3.5-mini (3.8B) | ~3,8 B | Transformer denso | MIT | safetensors, GGUF | Rendimiento destacado en razonamiento y codigo para su tamano; contexto largo documentado (128K) |
| Llama 3.2-3B | ~3,2 B | Transformer denso | Llama Community License (restricciones comerciales) | safetensors, GGUF | Amplio ecosistema y soporte multilingue; licencia menos permisiva que MIT |

La ventaja diferencial de Ohm-MythosNano frente a estas alternativas es su licencia MIT sin restricciones y su enfoque en razonamiento y codigo; su desventaja es la falta de documentacion, benchmarks y datos de contexto publicados.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para ingles; no hay garantias de rendimiento en castellano ni otros idiomas.
- No hay benchmarks publicados: la calidad real en razonamiento, matematicas o codigo no está verificada de forma independiente; conviene evaluarlo antes de usarlo en produccion.
- Riesgo de alucinacion: al ser un modelo de ~3 B sin informacion sobre alineacion (RLHF/DPO no confirmada), el riesgo de respuestas incorrectas o fabricadas es alto, especialmente en hechos y matematicas.
- Longitud de contexto no documentada: no se conoce la ventana de contexto efectiva, lo que limita su uso en tareas que requieran documentos largos hasta verificarlo.
- No hay confirmacion de soporte de tool calling, function calling ni capacidades multimodales.
- Cuants de baja calidad (Q2_K, Q3_K_M): la propia model card advierte de menor calidad en estas variantes; para produccion se recomiendan Q4_K_M o superiores.
- Licencia MIT sin restricciones comerciales conocidas, pero conviene revisar tambien la licencia y terminos del modelo base (orangejuicesmith/Ohm-MythosNano).
- Cuantizado por un tercero (mradermacher): cualquier defecto introducido en la conversion GGUF es responsabilidad del cuantizador, no del autor original.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/Ohm-MythosNano-GGUF
- Modelo base: https://huggingface.co/orangejuicesmith/Ohm-MythosNano
- Cuants imatrix (weighted): https://huggingface.co/mradermacher/Ohm-MythosNano-i1-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#Ohm-MythosNano-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
