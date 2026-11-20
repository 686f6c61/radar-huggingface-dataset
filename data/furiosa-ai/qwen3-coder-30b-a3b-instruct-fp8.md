# furiosa-ai/Qwen3-Coder-30B-A3B-Instruct-FP8

## Resumen

Qwen3-Coder-30B-A3B-Instruct-FP8 es la variante de codigo de la familia Qwen3-Coder, publicada originalmente por el equipo Qwen de Alibaba. Se trata de un transformer auto-regresivo con arquitectura Mixture-of-Experts (MoE) de 30.532.122.624 parametros totales, de los cuales aproximadamente 3.300 millones se activan por token. Esta optimizado para generacion de codigo, comprension de repositorios a gran escala y uso de herramientas, y opera exclusivamente en modo no-thinking.

El repositorio analizado, publicado por furiosa-ai, no es un modelo nuevo sino un empaquetado del checkpoint FP8 upstream (Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8) junto con un Furiosa Executable Bundle (FXB) para ejecutarlo sobre aceleradores FuriosaAI RNGD mediante la libreria furiosa-llm. Los pesos son identicos a los del modelo base; lo que anade este repositorio es el artefacto de despliegue para hardware especifico y la integracion con el servidor OpenAI-compatible de Furiosa.

Su relevancia actual radica en dos factores: por un lado, la licencia Apache 2.0 permite uso comercial sin restricciones adicionales; por otro, la cuantizacion FP8 estatica de pesos con cuantizacion dinamica de activaciones reduce los requisitos de memoria sin sacrificar el soporte de tool calling, lo que facilita el despliegue en produccion tanto sobre GPUs convencionales (via vLLM, SGLang o Transformers) como sobre el acelerador RNGD de FuriosaAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (Mixture-of-Experts), transformer auto-regresivo |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | Aproximadamente 3,3B por token |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 estatico en pesos; FP8 dinamico en activaciones (per-token / per-block); KV cache en 16 bits |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas Furiosa Executable Bundle, FXB) |
| Entrada / salida | Texto / texto |
| Modo de razonamiento | No-thinking unicamente |
| Parser de tool calling | hermes |
| Hardware soportado (este repo) | FuriosaAI RNGD |
| Estrategia de paralelismo | Tensor-parallel de 32 PEs (4 tarjetas RNGD, 8 PEs por tarjeta) |
| Tamano del repositorio | 60,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer auto-regresivo con capas Mixture-of-Experts, identificado en los tags como `qwen3_moe`. Cuenta con 30,5B parametros totales y activa aproximadamente 3,3B por token, lo que reduce el coste computacional por paso de decodificacion frente a un modelo denso de tamano equivalente. Esta especializado en tareas de codigo y flujos agenticos, y no dispone de modo de razonamiento extendido (thinking): opera exclusivamente en modo instruct/no-thinking.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. La innovacion tecnica documentada en este repositorio se limita al esquema de cuantizacion: pesos en FP8 estatico siguiendo la release FP8 upstream, activaciones cuantizadas dinamicamente en FP8 con granularidad per-token o per-block, y KV cache mantenida en 16 bits para preservar precision en la atencion. El repositorio anade ademas un Furiosa Executable Bundle (FXB) que permite ejecutar el modelo sobre RNGD con un tensor-parallel de 32 PEs distribuidos en cuatro tarjetas.

## Capacidades

- Generacion de codigo en lenguajes de programacion, con foco en calidad y correccion segun la orientacion de la familia Qwen3-Coder.
- Comprension de repositorios a escala, segun la model card del modelo upstream.
- Tool calling / function calling mediante el parser `hermes`, el usado por la serie Qwen3. Se habilita en el servidor con `--enable-auto-tool-choice --tool-call-parser hermes`.
- Flujos agenticos de multiples pasos orientados a tareas de codigo y uso de herramientas.
- API compatible con OpenAI a traves de `furiosa-llm serve`, lo que facilita la integracion con clientes existentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking: no disponibles; el modelo es texto-a-texto y opera solo en modo no-thinking.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD o asistentes de IDE mediante la API OpenAI-compatible de `furiosa-llm serve`, aprovechando su especializacion en codigo y su bajo coste por token al activar solo 3,3B parametros.
- Agentes de codigo con tool calling: con el parser `hermes` habilitado, el modelo puede decidir cuando invocar funciones (ejecutar tests, consultar documentacion, abrir issues) dentro de bucles agenticos multi-paso.
- Comprension de repositorios: analisis de bases de codigo y respuesta a preguntas sobre su estructura, adecuado por su entrenamiento orientado a repositorios a escala.
- Asistencia a revision de codigo: generacion de explicaciones, deteccion de patrones problematicos y propuestas de refactorizacion en flujos de pull request automatizados.
- Despliegue sobre aceleradores FuriosaAI RNGD: organizaciones con infraestructura RNGD pueden servir el modelo con el FXB incluido y tensor-parallel de 32 PEs en cuatro tarjetas, sin necesidad de GPUs convencionales.
- Migracion de endpoints OpenAI: al exponer una API compatible con OpenAI, el modelo puede sustituir a otros backends en aplicaciones existentes cambiando unicamente la URL base y el identificador de modelo.
- Generacion de codigo en entornos con restricciones de memoria: la cuantizacion FP8 reduce la huella de pesos respecto a BF16, lo que facilita el despliegue en infraestructura con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia de orden de magnitud, los pesos FP8 del repositorio suman 60,7 GB, por lo que se requiere al menos esa capacidad mas el espacio para KV cache en 16 bits y buffers de activaciones.
- GPU recomendadas: no especificadas en la informacion proporcionada. El repositorio esta orientado a FuriosaAI RNGD; para GPUs convencionales remite a la model card upstream (vLLM, SGLang, Transformers).
- Despliegue en consumer GPU: no confirmado en la informacion disponible; el tamano de pesos en FP8 (60,7 GB) excede la VRAM de las tarjetas de consumo habituales, por lo que requeriria cuantizaciones adicionales no documentadas en este repositorio.
- Opciones de despliegue: `furiosa-llm serve` sobre RNGD (soporte oficial de este repositorio); vLLM, SGLang y Transformers segun la model card upstream.
- Paralelismo en RNGD: tensor-parallel de 32 PEs, equivalente a cuatro tarjetas RNGD (8 PEs por tarjeta).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-FP8 (este repo, empaquetado FuriosaAI) | 30,5B / ~3,3B | No disponible | Apache 2.0 | Hugging Face, con FXB para RNGD |
| Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8 (upstream) | 30,5B / ~3,3B | No disponible | Apache 2.0 | Hugging Face; vLLM, SGLang, Transformers |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables, por lo que la comparativa se limita a la relacion entre este repositorio y su modelo base upstream.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo de codigo, puede producir APIs, funciones o fragmentos inexistentes.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada.
- Modo de razonamiento: el modelo opera exclusivamente en modo no-thinking; no admite razonamiento extendido.
- Licencia: Apache 2.0, sin restricciones adicionales para uso comercial segun la model card; conviene verificar el fichero LICENSE del repositorio upstream.
- Dependencia de hardware: el FXB incluido esta pensado para FuriosaAI RNGD; para otros aceleradores debe usarse el modelo upstream y sus frameworks soportados.
- Precedencia del modelo base: el comportamiento del modelo es el del checkpoint upstream Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8; las limitaciones de este ultimo aplican integramente.
- Produccion: no se han publicado datos de latencia ni throughput, por lo que la planificacion de capacidad debe validarse con pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-Coder-30B-A3B-Instruct-FP8
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8
- Licencia upstream: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8/blob/main/LICENSE
- FuriosaAI: https://furiosa.ai
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guia de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Referencia del servidor (`furiosa-llm serve`): https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
