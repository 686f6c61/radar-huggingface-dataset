# prawinin/vidhi

## Resumen

vidhi es un modelo de lenguaje publicado por el usuario prawinin en HuggingFace, distribuido exclusivamente en formato GGUF y derivado de un ajuste fino sobre Llama 3.2 3B Instruct, segun se deduce del nombre del fichero de pesos incluido (`llama-3.2-3b-instruct.Q4_K_M.gguf`). El modelo cuenta con 3.212.749.888 parametros reales, lo que confirma que se trata de un transformer denso de aproximadamente 3.200 millones de parametros, no de una arquitectura MoE. La model card indica que el ajuste fino y la conversion a GGUF se realizaron con Unsloth, una herramienta que acelera el entrenamiento y la cuantizacion de modelos Llama.

El problema que resuelve es el de ofrecer una variante conversacional ligera, ya cuantizada y lista para ejecutarse en hardware de consumo mediante llama.cpp u Ollama, sin necesidad de proceso de conversion adicional. Es relevante en el ecosistema actual porque los modelos de ~3B de parametros permiten despliegues locales con pocos recursos, y el formato GGUF con plantilla Jinja habilitada facilita su integracion directa en herramientas de inferencia ampliamente adoptadas.

La informacion publica disponible es muy limitada: no se declaran licencia, idiomas soportados, datos de entrenamiento, composicion del dataset ni resultados de benchmarks. El repositorio ocupa 2,0 GB y fue creado y actualizado el mismo dia (15 de septiembre de 2026), con cero descargas y cero valoraciones en el momento de la consulta. Esto implica que cualquier evaluacion de calidad debe considerarse pendiente de verificacion empirica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la base Llama 3.2 3B Instruct admite hasta 128.000 tokens, sin confirmar para este ajuste) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico fichero publicado); otros niveles no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la model card; al derivar de Llama 3.2 es probable que aplique la Llama 3.2 Community License, sin confirmar |
| Formato de pesos | GGUF (`llama-3.2-3b-instruct.Q4_K_M.gguf`); no se publican safetensors en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de aproximadamente 3.200 millones de parametros, heredada de Llama 3.2 3B Instruct. Llama 3.2 3B emplea atencion por grupos (GQA) y un tokenizador BPE con vocabulario de 128.256 entradas, ademas de un contexto nativo de hasta 128.000 tokens en la version original. La model card de vidhi no describe modificaciones estructurales sobre esa base, por lo que se asume que el cambio principal es el ajuste fino supervisado y, opcionalmente, alineacion adicional, sin que se detalle el metodo.

En cuanto al entrenamiento, la unica informacion aportada es que el proceso se realizo con Unsloth y que fue "2x faster" respecto a un entrenamiento convencional, lo que hace referencia a las optimizaciones de la herramienta, no a una innovacion propia del modelo. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni el uso de decodificacion especulativa u otras tecnicas de aceleracion de inferencia. La model card menciona que el comportamiento del token BOS fue ajustado para compatibilidad con GGUF, un detalle relevante para evitar respuestas degradadas en llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Razonamiento y respuesta a instrucciones basicas, heredadas de Llama 3.2 3B Instruct (sin verificacion publicada para este ajuste concreto).
- Soporte de plantilla de chat mediante `--jinja` en llama.cpp, lo que permite aplicar el formato de conversacion correcto.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`), lo que apunta a despliegue en infraestructura de HuggingFace.
- Capacidades de codigo, matematicas o tool calling: no confirmadas para este ajuste.
- Capacidades multimodales: la model card incluye la invocacion `llama-mtmd-cli`, pero el propio texto la presenta como una opcion generica para modelos multimodales; no hay evidencia de que vidhi procese imagenes.
- Idiomas soportados: no disponibles.
- Modo de razonamiento explicito (thinking), audio o vision: no disponibles.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con Ollama o llama.cpp en un equipo de sobremesa y mantener dialogos multi-turno sin conexion a internet, aprovechando la plantilla Jinja para el formateo correcto de mensajes.
- Prototipado rapido de aplicaciones de chat: al ser un GGUF de 2,0 GB, se puede cargar en cuentas gratuitas de espacios o notebooks con GPU modesta para validar flujos de producto antes de invertir en modelos mayores.
- Generacion de texto asistida en herramientas de escritorio: integracion en editores mediante llama.cpp como backend, para autocompletado de parrafos o reescritura de fragmentos con bajo consumo de VRAM.
- Clasificacion y extraccion de entidades en texto: uso del modelo como componente de un pipeline para etiquetar tickets, resumir correos o extraer campos estructurados, siempre con validacion posterior por el riesgo de alucinacion.
- Chatbot embebido en dispositivos con recursos limitados: con cuantizacion Q4_K_M puede ejecutarse en portatiles con 8 GB de RAM sin GPU dedicada, lo que habilita asistentes offline en aplicaciones de campo.
- Educacion y tutoria basica: generacion de explicaciones y preguntas de practica en un entorno controlado, donde el coste cero de inferencia local compensa la menor calidad frente a modelos de mayor tamano.
- Experimentacion en investigacion sobre ajuste fino: al ser un derivado de Llama 3.2 3B, sirve como punto de comparacion para estudiar el impacto de ajustes con Unsloth frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no hay comparaciones con el modelo base ni con alternativas. Cualquier dato de rendimiento deberia obtenerse mediante evaluacion propia.

## Requisitos de hardware

- VRAM estimada en Q4_K_M: aproximadamente 2,0-2,5 GB de pesos mas el espacio para la cache KV, en torno a 3-4 GB para contextos moderados.
- VRAM estimada en FP16: alrededor de 6,5-7 GB solo para los pesos, mas cache KV.
- GPU recomendadas para FP16: RTX 3060 de 12 GB, RTX 4070, RTX 4090, A10G o superiores; cualquier GPU con 8 GB o mas puede alojarlo con holgura en cuantizacion Q4.
- Compatibilidad con GPU de consumo: si, en cuantizacion Q4_K_M cabe en GPUs con 6 GB de VRAM y en CPU con 8 GB de RAM; en FP16 requiere al menos 8 GB de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli -hf prawinin/vidhi --jinja`), Ollama (la model card indica que se incluye un Modelfile), y potencialmente HuggingFace Inference Endpoints por la etiqueta `endpoints_compatible`. vLLM y TGI no estan confirmados, ya que no se publican pesos safetensors en el repositorio.
- Latencia y throughput: no disponibles, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prawinin/vidhi | 3,21B | no disponible | GGUF (Q4_K_M) | no disponible | HuggingFace, 0 descargas |
| Meta Llama 3.2 3B Instruct | 3,21B | 128.000 tokens | safetensors y GGUF | Llama 3.2 Community License | HuggingFace, ampliamente adoptado |
| Qwen 2.5 3B Instruct | 3,09B | 32.768 tokens (ampliable a 128.000) | safetensors y GGUF | Apache 2.0 (salvo la variante de 3B, con matices) | HuggingFace, muy adoptado |
| Microsoft Phi-3.5-mini Instruct | 3,82B | 128.000 tokens | safetensors y GGUF | MIT | HuggingFace, muy adoptado |

La comparacion directa con el modelo base no puede completarse porque no hay benchmarks publicados para vidhi ni documentacion sobre que mejora respecto a Llama 3.2 3B Instruct. Frente a Qwen 2.5 3B y Phi-3.5-mini, vidhi parte con la desventaja de una licencia no declarada y una adopcion nula, lo que dificulta su uso en produccion sin una evaluacion previa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Llama 3.2 es razonable esperar sesgos similares a los del modelo base, pero no hay analisis publicado para este ajuste.
- Riesgo de alucinacion: propio de modelos de 3B de parametros, especialmente en tareas de conocimiento factual, matematicas y codigo; se recomienda verificacion humana en cualquier uso sensible.
- Limitaciones de contexto e idioma: no se especifican ni la ventana efectiva tras el ajuste ni los idiomas cubiertos; si se hereda la de Llama 3.2, el contexto es amplio, pero el rendimiento multilingue del modelo base es desigual fuera del ingles.
- Restricciones de licencia: la model card no declara licencia, lo que impide confirmar si el uso comercial esta permitido. Al ser un derivado de Llama 3.2, es probable que aplique la Llama 3.2 Community License, que impone obligaciones de atribucion y restricciones para empresas con mas de 700 millones de usuarios mensuales, pero esto no esta confirmado.
- Ausencia de safetensors: solo se publica un fichero GGUF Q4_K_M, lo que limita el reentrenamiento, la fusion de pesos o el despliegue en servidores que requieren pesos completos (vLLM, TGI).
- Repositorio sin validacion de la comunidad: cero descargas y cero valoraciones en la fecha de consulta, sin garantia de calidad ni de mantenimiento.
- Ajuste del token BOS: la model card advierte de una modificacion del comportamiento del token BOS para compatibilidad GGUF; si se usa un runner que no respete esa convencion, pueden aparecer degradaciones en la calidad de las respuestas.
- Fecha de publicacion futura respecto al momento habitual de evaluacion: el repositorio esta fechado en septiembre de 2026, por lo que la informacion puede quedar desactualizada con rapidez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prawinin/vidhi
- Fichero de pesos: `llama-3.2-3b-instruct.Q4_K_M.gguf` (dentro del repositorio anterior)
- Unsloth (herramienta de entrenamiento y conversion): https://github.com/unslothai/unsloth
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo base de referencia (no confirmado por el autor): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper de Llama 3.2 (referencia del modelo base): https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/
- No se han encontrado papers, blogs, demos ni repositorios adicionales especificos de vidhi en la informacion proporcionada.
