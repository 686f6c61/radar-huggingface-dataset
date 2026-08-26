# nitrai-research/Moderato-V1-Pro

## Resumen

Moderato-V1-Pro es un modelo de lenguaje de tipo Mixture of Experts (MoE) disperso desarrollado por NitrAI (nitrai-research), una organizacion de investigacion en IA que busca acercar la inteligencia de los modelos propietarios de frontera al hardware de consumo. Con 113.348 millones de parametros fisicos (113,3B) y solo 32,7B activos por token, el modelo esta disenado para destacar en generacion de codigo, ingenieria de sistemas y flujos de trabajo agienticos.

La innovacion principal es el sistema Reflexive Role Routing (RRR), un meta-controlador jerarquico de dos niveles que evalua continuamente la divergencia del estado oculto y ejecuta intervenciones de intercambio de expertos durante la generacion sin perdida de cache KV. El modelo integra seis expertos de dominio especializados (anti_bloat, clean_diffs, deep_math_cot, systems_rust, modern_apis y agentic_fable) fusionados en la capa feed-forward con backbones de atencion compartidos.

Con una ventana de contexto nativa de 131.072 tokens, extensible hasta 1.000.000 mediante escalado YaRN RoPE, y licencia Apache 2.0, Moderato-V1-Pro se posiciona como una alternativa abierta para tareas de razonamiento, codigo y agentes. El modelo soporta modo de pensamiento con cadenas de razonamiento completas y un parametro ajustable de esfuerzo de razonamiento (reasoning_effort).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE) Causal Language Model con Reflexive Role Routing (RRR) |
| Parametros totales | 113.348.359.666 (113,3B) |
| Parametros activos | 32,7B (Top-2 experts) |
| Longitud de contexto | 131.072 tokens nativos, extensible a 1.000.000 via YaRN RoPE |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue, ingles, codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Moderato-V1-Pro es un modelo MoE disperso con 64 capas transformer, dimension oculta de 5120 y dimension intermedia feed-forward de 17.408. Cada capa contiene 6 vias de expertos FFN dedicados, con atencion de consulta agrupada (GQA) de 40 cabezas de consulta y 8 cabezas clave/valor, dimension de cabeza de 128 y base de frecuencia RoPE de 1.000.000. El modelo declara una capacidad equivalente de 171B parametros, aunque el recuento fisico es de 113,3B.

La innovacion central es el sistema Reflexive Role Routing (RRR), un meta-controlador jerarquico de dos niveles que combina el enrutamiento estatico de softmax a nivel de token G(x) con sondas de divergencia con checkpoint p_theta(h_t, g) a intervalos de N=64 tokens, disenado para interceptar alucinaciones antes de que se produzcan cascadas de fallos. El modelo se construye sobre seis dominios de expertos de 27B especializados fusionados en la capa FFN con backbones de atencion compartidos.

El modelo incluye modo de pensamiento con bloques completos de chain-of-thought (formato "thinking ... response") y un parametro ajustable de esfuerzo de razonamiento. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados o si se aplicaron tecnicas de RLHF/DPO.

## Capacidades

- Generacion de codigo de produccion limpio y conciso mediante el experto anti_bloat, que elimina codigo boilerplate y sobreingenieria.
- Generacion de parches git unificados quirurgicos con preservacion de limites de linea (experto clean_diffs).
- Razonamiento matematico formal de nivel olimpiada con cadenas de pensamiento multi-paso (experto deep_math_cot).
- Ingenieria de sistemas de bajo nivel, concurrencia sin bloqueos y modismos Rust seguros en memoria (experto systems_rust).
- Arquitecturas cloud/SWE modernas, frameworks web asincronos y APIs REST/gRPC estrictas en esquema (experto modern_apis).
- Planificacion autonoma multi-paso, orquestacion de herramientas y auto-reflexion recursiva (experto agentic_fable).
- Modo de pensamiento con chain-of-thought completo y control de esfuerzo de razonamiento (reasoning_effort).
- Capacidades multilingues y comprension universal de lenguajes de programacion.
- Enrutamiento dinamico de expertos con intervencion en caliente sin perdida de cache KV.

## Casos de uso

- Generacion de codigo en produccion: el experto anti_bloat produce codigo limpio y sin sobreingenieria, adecuado para integrarse en pipelines de CI/CD donde la calidad y la concision del codigo son criticas.
- Revision de codigo y generacion de parches: el experto clean_diffs genera parches git unificados con preservacion de limites de linea, ideal para herramientas de revision automatica y mantenimiento de repositorios.
- Razonamiento matematico avanzado: el experto deep_math_cot permite resolver problemas de nivel olimpiada con cadenas de razonamiento formales, util en educacion, investigacion y verificacion de demostraciones.
- Desarrollo de sistemas en Rust: el experto systems_rust esta especializado en concurrencia sin bloqueos y modismos seguros en memoria, adecuado para desarrollo de infraestructura de bajo nivel y sistemas criticos.
- Diseno de APIs y arquitecturas cloud: el experto modern_apis genera APIs REST/gRPC con esquemas estrictos y arquitecturas de software modernas, util para equipos de backend que necesitan contratos de API bien definidos.
- Agentes autonomos: el experto agentic_fable permite planificacion multi-paso, orquestacion de herramientas y auto-reflexion, adecuado para construir agentes que ejecutan tareas complejas de forma autonoma con supervision minima.
- Asistencia de programacion multilingue: con soporte multilingue y de codigo, puede servir como asistente de desarrollo en entornos internacionales y equipos distribuidos.
- Analisis de codigo legacy: la ventana de contexto de 131K tokens permite procesar repositorios completos o archivos de gran tamano para refactorizacion, auditoria y documentacion.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion comparativa con modelos como Claude Sonnet 5 (Anthropic), GPT-5.6-Terra (OpenAI), Kimi K3 (2.8T-A104B) y Qwen3.8-Flash-Next (180B), ademas de una imagen de benchmarks. Sin embargo, los valores numericos especificos de la tabla estan truncados en la informacion disponible y no se pueden extraer datos cuantitativos fiables. No se han publicado resultados de benchmarks verificables en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 226,8 GB en formato safetensors, lo que sugiere pesos en BF16/FP16 (~226 GB para 113,3B parametros).
- Con cuantizacion a 8 bits, se estiman ~113 GB de VRAM; a 4 bits, ~57 GB.
- Los parametros activos de 32,7B implican que el coste computacional por token es similar al de un modelo denso de ~32,7B, aunque la memoria necesaria para cargar todos los expertos es la del modelo completo.
- Se recomiendan GPUs de alta capacidad: A100 80GB (configuracion multi-GPU), H100, o similares con memoria agregada suficiente.
- No cabe en GPUs de consumo estandar (RTX 4090 con 24 GB) sin cuantizacion agresiva y probablemente offloading a CPU.
- Opciones de despliegue: vLLM, TGI y otras soluciones compatibles con transformers; no se confirma compatibilidad especifica con llama.cpp u Ollama.
- No se dispone de datos publicados de latencia o throughput.

## Comparativa con modelos similares

La model card menciona comparaciones con Claude Sonnet 5, GPT-5.6-Terra, Kimi K3 (2.8T-A104B) y Qwen3.8-Flash-Next (180B), pero los datos numericos de la comparativa no estan disponibles en la informacion proporcionada (tabla truncada). No se puede realizar una comparativa cuantitativa fiable sin esos datos. Como referencia estructural, el modelo se posiciona en la categoria de MoE abiertos de gran tamano con 113,3B parametros fisicos y 32,7B activos, similar en concepto a otros MoE abiertos como Mixtral o Qwen-MoE, aunque con una arquitectura de enrutamiento propietaria.

## Limitaciones y advertencias

- El modelo tiene 0 descargas en HuggingFace, lo que sugiere que es muy reciente o no ha sido ampliamente adoptado; los resultados de benchmarks no han sido verificados de forma independiente por la comunidad.
- La tabla de benchmarks de la model card esta incompleta en la informacion disponible, por lo que no se pueden confirmar las afirmaciones de rendimiento.
- No se dispone de informacion sobre sesgos conocidos, riesgos de alucinacion especificos o limitaciones idiomaticas.
- El modelo es de tipo MoE con 113,3B parametros fisicos, lo que requiere infraestructura de hardware significativa para su despliegue en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos completos y las posibles restricciones de los componentes subyacentes.
- No se dispone de informacion sobre el dataset de entrenamiento, lo que dificulta evaluar posibles sesgos y la calidad de los datos.
- El modelo fue creado en agosto de 2026, por lo que su madurez y estabilidad en produccion no estan demostradas.
- La arquitectura RRR con intervenciones en caliente es una innovacion propietaria sin validacion independiente publicada.

## Enlaces

- HuggingFace: https://huggingface.co/nitrai-research/Moderato-V1-Pro
- Organizacion NitrAI: https://huggingface.co/nitrai-research
- Pagina de modelos de NitrAI: https://nitrai.dev/models.html
- Sitio principal de NitrAI: https://nitrai.dev/
- moderato.ai: https://moderato.ai/
