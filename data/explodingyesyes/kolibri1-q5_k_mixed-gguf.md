# explodingyesyes/Kolibri1-Q5_K_Mixed-GGUF

## Resumen

Kolibri1-Q5_K_Mixed-GGUF es una cuantización GGUF del modelo Kolibri-1, desarrollado originalmente por Aleph Alpha. Se trata de un modelo de generación de texto de aproximadamente 78.100 millones de parámetros, orientado a conversación y compatible con llama.cpp. Esta versión concreta la publica el usuario explodingyesyes bajo licencia Apache 2.0 y está pensada para ejecución local mediante llama.cpp, con una mezcla de cuantizaciones Q5_K en las capas de atención y de expertos, y pesos de normalización en f32.

El modelo base, Kolibri-1, es un transformer de tipo mezcla de expertos (MoE) según la estructura de tensores reflejada en la model card (capas `ffn_*_exps` y `ffn_*_shexp`, además de `ffn_gate_inp`). La cuantización resultante ocupa 53,9 GB en el repositorio, lo que la sitúa en el rango de despliegue en estaciones de trabajo con GPU de gran memoria o en configuraciones multi-GPU. Los idiomas declarados son alemán e inglés.

La relevancia de esta ficha radica en que permite evaluar rápidamente una opción de inferencia local de un modelo de gran tamaño con licencia permisiva, si bien la información pública disponible sobre el modelo base es limitada y muchos datos técnicos no están documentados en la model card del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la estructura de tensores de la model card |
| Parametros totales | 78.103.074.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K en atencion (q, k, v, output) y en expertos (down, up, gate, tanto `exps` como `shexp`); f32 en normalizaciones, `exp_probs_b.bias` y `ffn_gate_inp.weight` |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card del repositorio no documenta la arquitectura del modelo base más allá de lo que se deduce de los nombres de tensores. La presencia de `ffn_down_exps`, `ffn_up_exps`, `ffn_gate_exps`, `ffn_down_shexp`, `ffn_up_shexp`, `ffn_gate_shexp` y `ffn_gate_inp.weight` indica una arquitectura de mezcla de expertos con expertos compartidos (`shexp`) y una compuerta de enrutamiento (`ffn_gate_inp`), junto con capas de atención con normalización QK (`attn_q_norm`, `attn_k_norm`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

En cuanto a la cuantización, el autor aplica Q5_K a todas las matrices de atención y a las matrices de los expertos, y mantiene en f32 los pesos de normalización, el sesgo de probabilidades de expertos y la compuerta de enrutamiento. Esta decisión preserva la precisión del enrutamiento y de las normalizaciones, que son sensibles a la cuantización en arquitecturas MoE, a costa de un tamaño mayor. El autor indica que la cuantización se probó exclusivamente en una build Vulkan de llama.cpp (build 11889) y que se requiere una build superior a 11702 para ejecutar Kolibri-1.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Soporte multilingüe limitado a alemán e inglés.
- Ejecución local mediante llama.cpp en formato GGUF.
- Compatibilidad con endpoints según la etiqueta `endpoints_compatible`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.
- No se documenta longitud de contexto, por lo que no se puede confirmar el manejo de conversaciones de contexto largo.

## Casos de uso

- Inferencia local de un modelo de gran tamaño en alemán e inglés: la cuantización Q5_K permite ejecutar un modelo de 78.000 millones de parámetros en hardware de estación de trabajo, útil para equipos que necesitan privacidad de datos sin depender de API externas.
- Generación de texto asistida en entornos de desarrollo: al ser compatible con llama.cpp, puede integrarse en editores y herramientas CLI que consuman el servidor local de llama.cpp para autocompletado y redacción técnica en inglés y alemán.
- Procesamiento de documentación bilingüe alemán-inglés: el modelo puede emplearse para resumir, reformular o traducir contenido entre ambos idiomas en pipelines por lotes.
- Chatbot interno de empresa: la licencia Apache 2.0 permite desplegar el modelo en infraestructura propia para atención interna, siempre que el caso de uso se limite a alemán e inglés.
- Experimentación e investigación: sirve como base para estudiar el comportamiento de modelos MoE cuantizados en Q5_K con pesos de enrutamiento en f32, comparando la degradación frente al modelo original.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el formato GGUF permiten montar rápidamente un servidor de chat local con llama.cpp para validar flujos de producto antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 53,9 GB, por lo que se necesita al menos esa cantidad de memoria, más overhead de contexto y caché KV. En la práctica, se recomienda un mínimo de 64 GB de VRAM o memoria unificada.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU que sumen al menos 64-80 GB de VRAM. En GPUs consumer, no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) de forma individual.
- Memoria unificada: podría ejecutarse en equipos con memoria unificada de 64 GB o más (por ejemplo, Apple Silicon de gama alta o estaciones con GPU integrada de gran capacidad), aunque no hay datos de rendimiento publicados.
- Opciones de despliegue: llama.cpp (build superior a 11702; el autor probó la build 11889 en Vulkan). No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kolibri1-Q5_K_Mixed-GGUF | 78,1 B | no disponible | Apache 2.0 | GGUF | Cuantizacion Q5_K mixta, f32 en enrutamiento y normalizaciones |
| Aleph-Alpha/Kolibri-1 (modelo base) | 78,1 B | no disponible | no disponible en la informacion proporcionada | safetensors (presumiblemente) | Modelo original sin cuantizar |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, por lo que no se puede evaluar su comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas limitados a alemán e inglés; el rendimiento en castellano no está garantizado ni documentado.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- La cuantización Q5_K introduce una pérdida de precisión respecto al modelo original; el autor no publica comparativas de calidad frente al modelo sin cuantizar.
- Requiere una build de llama.cpp superior a 11702; versiones anteriores no podrán cargar el modelo.
- El autor probó exclusivamente una build Vulkan de llama.cpp, por lo que el comportamiento en backends CUDA, ROCm o Metal no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Aleph-Alpha/Kolibri-1, que no se detalla en la información proporcionada.
- El repositorio tiene muy pocas descargas (42) y ningún like, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/explodingyesyes/Kolibri1-Q5_K_Mixed-GGUF
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- llama.cpp (repositorio del motor de inferencia): https://github.com/ggml-org/llama.cpp
