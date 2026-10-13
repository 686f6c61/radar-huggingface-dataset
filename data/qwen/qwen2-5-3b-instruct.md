# Qwen/Qwen2.5-3B-Instruct

## Resumen

Qwen2.5-3B-Instruct es un modelo de lenguaje causal de 3.085.938.688 parametros (3,09B) desarrollado por el equipo Qwen de Alibaba Cloud, publicado el 17 de septiembre de 2024 como parte de la familia Qwen2.5. Se trata de la variante instruction-tuned del modelo base Qwen2.5-3B, ajustada para seguir instrucciones y mantener conversaciones multi-turno. Su tamano lo situa en la gama de modelos pequenos que pueden ejecutarse en hardware de consumo, lo que lo hace atractivo para despliegues locales, edge computing y aplicaciones con requisitos de latencia estrictos.

El modelo emplea una arquitectura transformer estandar con RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y embeddings de palabras atados (*tied word embeddings*). Cuenta con 36 capas y atencion con Grouped Query Attention (16 cabezas para Q y 2 para KV), una tecnica que reduce el tamano de la cache KV y acelera la inferencia respecto a la atencion multi-cabeza tradicional. El repositorio oficial especifica una longitud de contexto completa de 32.768 tokens con generacion de hasta 8.192 tokens; la model card de la familia menciona soporte de contexto largo de hasta 128K tokens, por lo que existe una discrepancia entre la cifra global de la familia y la especifica de este repositorio.

Su relevancia actual radica en la relacion entre capacidades y coste computacional: compite con modelos de 2-4B parametros de otros fabricantes ofreciendo mejoras declaradas en codigo, matematicas, seguimiento de instrucciones, generacion de textos largos (mas de 8K tokens), comprension de datos estructurados (tablas) y generacion de salidas JSON. Ademas, la model card declara soporte multilingue para mas de 29 idiomas, aunque los metadatos de HuggingFace solo etiquetan el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, sesgo en QKV y embeddings atados |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros no-embedding | 2,77B |
| Capas | 36 |
| Cabezas de atencion | 16 para Q, 2 para KV (GQA) |
| Longitud de contexto | 32.768 tokens (segun la model card del repositorio); la model card de la familia menciona hasta 128K tokens |
| Tokens maximos de generacion | 8.192 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada para el repo oficial (solo safetensors); existen cuantizaciones de la comunidad (GGUF, AWQ, GPTQ) en repositorios de terceros |
| Idiomas soportados | La model card declara mas de 29 idiomas (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, entre otros); los metadatos de HuggingFace solo listan "en" |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen2.5-3B |
| Tamano del repositorio | 6,2 GB |
| Fecha de publicacion | 17 de septiembre de 2024 (actualizado el 25 de septiembre de 2024) |

## Arquitectura y entrenamiento

Qwen2.5-3B-Instruct es un modelo de lenguaje causal (autoregresivo) de tipo *decoder-only* con una pila de 36 capas transformer. Incorpora embeddings rotatorios (RoPE) para la codificacion posicional, activacion SwiGLU en las capas feed-forward, normalizacion RMSNorm y sesgo aditivo en las proyecciones de query, key y value. Los embeddings de entrada y la cabeza de salida estan atados, lo que reduce el numero de parametros entrenables: de los 3,09B totales, 2,77B corresponden a parametros no-embedding. La atencion usa Grouped Query Attention con 16 cabezas de query agrupadas sobre 2 cabezas de key/value, lo que disminuye la memoria de la cache KV durante la generacion.

El modelo se construyo en dos etapas: preentrenamiento sobre un corpus masivo no especificado en la informacion disponible y posterior ajuste (post-training) para alinearlo como asistente conversacional. La model card indica que Qwen2.5 mejora respecto a Qwen2 gracias al uso de "modelos expertos especializados" en codigo y matematicas, que habrian contribuido a los datos de entrenamiento de la familia. No se detalla en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion del dataset ni la tecnica de alineacion concreta (RLHF, DPO u otra). La familia Qwen2.5 se distribuye en versiones base e instruct de 0,5B a 72B parametros, y las innovaciones declaradas incluyen mayor robustez frente a la diversidad de *system prompts*, mejor seguimiento de instrucciones y mejor generacion de salidas estructuradas como JSON.

## Capacidades

- Generacion de texto conversacional multi-turno con soporte de roles (system, user, assistant) a traves de `apply_chat_template`.
- Razonamiento y conocimientos generales, con mejoras declaradas respecto a Qwen2 en dominios de codigo y matematicas.
- Generacion de codigo y asistencia a programacion.
- Generacion de textos largos de mas de 8.000 tokens de salida.
- Comprension de datos estructurados, como tablas.
- Generacion de salidas estructuradas, especialmente JSON.
- Seguimiento de instrucciones y mayor resiliencia ante variaciones en los *system prompts*, lo que facilita la implementacion de *role-play* y el establecimiento de condiciones para chatbots.
- Capacidades multilingues declaradas para mas de 29 idiomas, aunque la etiqueta oficial del repositorio solo indica ingles.
- Soporte de contexto largo de hasta 32.768 tokens en este repositorio (la familia declara hasta 128K).
- Tool calling y function calling: no se mencionan explicitamente en la informacion proporcionada; el modelo puede formatearse mediante plantillas de chat, pero no hay documentacion oficial de soporte de herramientas en este repositorio.
- Modo *thinking* explicito, vision o audio: no disponible en este modelo (existen variantes especificas de vision y audio dentro del ecosistema Qwen, pero no en este checkpoint).

## Casos de uso

- Asistentes conversacionales locales: el modelo puede ejecutarse en una GPU de consumo o incluso en CPU con cuantizacion, gestionando conversaciones multi-turno con hasta 32.768 tokens de contexto, lo que permite mantener historiales largos sin perder informacion relevante.
- Generacion de codigo en pipelines de desarrollo: integrado mediante la libreria transformers, puede usarse para autocompletar funciones, generar tests unitarios o revisar *diffs* en herramientas de CI/CD, con la ventaja de un peso de 6,2 GB que cabe en memoria de GPU de gama media.
- Extraccion de datos estructurados: su capacidad declarada para generar JSON y entender tablas permite usarlo para convertir texto libre o documentos en esquemas JSON validados, por ejemplo en procesos ETL o en la ingestion de formularios.
- Clasificacion y etiquetado de texto a escala: al ser un modelo pequeno, el coste por inferencia es bajo, lo que lo hace adecuado para tareas de clasificacion de tickets, moderacion de contenido o enrutamiento de consultas en grandes volumenes.
- Generacion de resumenes de documentos: con 32K tokens de contexto puede procesar informes, actas o articulos completos y producir resumenes estructurados, manteniendo coherencia en documentos de decenas de paginas.
- Chatbots de atencion al cliente con system prompt personalizado: la mayor robustez frente a variaciones del *system prompt* permite definir personalidades, tonos y restricciones de dominio sin degradar el seguimiento de instrucciones.
- Prototipado e investigacion en NLP: su tamano permite hacer *fine-tuning* completo o con LoRA en una sola GPU, lo que resulta util para experimentar con tecnicas de alineacion o evaluar comportamientos en entornos academicos.
- Aplicaciones en el borde o sin conexion: al poder cuantizarse a 4 bits y ocupar alrededor de 2 GB, es viable desplegarlo en portatiles con GPU integrada o en dispositivos con recursos limitados, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un blog oficial y una pagina de documentacion con resultados de evaluacion detallados y mediciones de velocidad, pero las cifras concretas no se incluyen en los datos proporcionados. No se deben asumir valores de MMLU, HumanEval, GSM8K u otros sin consultar dichas fuentes.

## Requisitos de hardware

- VRAM estimada para los pesos en precision fp16/bf16: aproximadamente 6,2 GB (coincide con el tamano del repositorio).
- VRAM estimada en cuantizacion int8: alrededor de 3,5 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4, AWQ, GPTQ): aproximadamente 2 GB.
- Cache KV: con 36 capas y 2 cabezas KV, el coste por token es reducido gracias a GQA. Como estimacion orientativa, una cache KV en fp16 para los 32.768 tokens de contexto completa rondaria 1,2 GB, cantidad que debe sumarse a la memoria de los pesos.
- GPU recomendadas: cabe con holgura en NVIDIA RTX 4090 (24 GB), RTX 4080, RTX 3090, A10G, L4 y A100/H100 para despliegues de alta concurrencia. Tambien es viable en GPUs de 8 GB o menos si se aplica cuantizacion de 4 bits.
- GPU de consumo: si, es uno de los puntos fuertes del modelo. En fp16 requiere una GPU con al menos 8 GB de VRAM; con cuantizacion de 4 bits funciona en GPUs de 4-6 GB, e incluso en CPU con llama.cpp u Ollama a velocidades reducidas.
- Opciones de despliegue: transformers (libreria oficial recomendada, version >= 4.37.0), text-generation-inference (TGI), vLLM, llama.cpp, Ollama, LM Studio y endpoints compatibles con la API de OpenAI. Los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no se proporcionan cifras concretas en la informacion disponible. La model card remite a la pagina de benchmarks de velocidad de la documentacion oficial de Qwen para consultar requisitos de memoria de GPU y throughput por modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (familia declara hasta 128K) | qwen-research (no permisiva para uso comercial sin acuerdo) | HuggingFace, transformers, TGI, vLLM |
| Llama 3.2 3B Instruct | 3,21B | 128K tokens | Llama 3.2 Community License | HuggingFace, llama.cpp, Ollama, vLLM |
| Phi-3.5-mini-instruct | 3,8B | 128K tokens | MIT | HuggingFace, ONNX, llama.cpp |
| Gemma 2 2B | 2,6B | 8K tokens | Gemma Terms of Use | HuggingFace, Ollama, llama.cpp |

Los datos de parametros, contexto y licencia de los modelos comparados corresponden a informacion publica de sus respectivas model cards. No se dispone de resultados de benchmarks comparativos en la informacion proporcionada para este modelo, por lo que no se puede establecer una comparacion de rendimiento objetiva. Cabe destacar que la licencia qwen-research es mas restrictiva que las alternativas MIT de Phi-3.5-mini o las licencias comunitarias de Llama, lo que puede ser un factor decisivo para proyectos comerciales.

## Limitaciones y advertencias

- La licencia qwen-research no es una licencia permisiva tipo Apache 2.0. Debe revisarse el texto completo en el enlace de licencia del repositorio antes de cualquier uso comercial, ya que puede requerir un acuerdo separado con Alibaba Cloud.
- Los metadatos de HuggingFace solo etiquetan el modelo como ingles (`language: en`), aunque la model card declara soporte para mas de 29 idiomas. El rendimiento real en idiomas distintos del ingles y el chino puede ser inferior al declarado.
- Existe una discrepancia documentada entre la longitud de contexto de la familia (hasta 128K tokens) y la especificada para este repositorio (32.768 tokens). Debe verificarse cual aplica antes de disenar aplicaciones con contextos muy largos.
- No se han publicado cifras de benchmarks en la informacion disponible, por lo que no es posible cuantificar su rendimiento real frente a alternativas.
- Al ser un modelo de 3B parametros, es mas propenso a alucinaciones y a errores factuales que modelos de mayor tamano, especialmente en tareas de conocimiento especializado, calculo complejo o razonamiento de multiples pasos.
- Los sesgos del modelo reflejan los del corpus de entrenamiento, que no se detalla en la informacion proporcionada. No se dispone de informes de evaluacion de sesgos o seguridad especificos para este checkpoint.
- La model card no documenta explicitamente soporte de tool calling ni function calling en este repositorio, a diferencia de otras variantes del ecosistema. Verificar antes de integrarlo en agentes que dependan de llamadas a herramientas.
- No hay soporte multimodal (vision o audio) en este checkpoint; solo texto.
- El ajuste con datos sinteticos de modelos expertos en codigo y matematicas puede introducir sesgos de estilo o de dominio que no estan documentados.
- Para produccion, se recomienda validar el comportamiento con prompts adversarios, establecer filtros de salida y monitorizar alucinaciones, especialmente en aplicaciones de cara al usuario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia completa: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Blog oficial de Qwen2.5 (resultados de evaluacion): https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion oficial: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad y memoria: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Articulo tecnico de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Plataforma de chat oficial: https://chat.qwen.ai/
- Sitio oficial de Qwen: https://qwen.ai/home
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
