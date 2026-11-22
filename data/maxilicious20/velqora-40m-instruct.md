# Maxilicious20/Velqora-40M-Instruct

## Resumen

Velqora-40M-Instruct es un modelo de lenguaje causal decoder-only de aproximadamente 41,96 millones de parametros, desarrollado por Maxilicious20 y entrenado desde cero (sin pesos preentrenados) sobre una unica GPU de consumo NVIDIA GeForce RTX 4060 con 8 GB de VRAM en Windows 11. Se trata de un experimento de investigacion orientado al estudio de arquitecturas transformer modernas en escala ultra-pequena, no de un modelo destinado a produccion.

La arquitectura incorpora componentes propios de modelos mucho mayores: Grouped-Query Attention (GQA) con 8 cabezas de consulta y 4 de clave-valor, QK-Norm, Value Residuals en la capa 0, activacion SwiGLU, normalizacion RMSNorm, embeddings RoPE con base 30.000 y embeddings de entrada/salida atados. El modelo emplea un tokenizador BPE byte-level personalizado de 8.192 tokens y una ventana de contexto maxima de 2.048 tokens.

El modelo se distribuye con licencia Apache-2.0, esta orientado principalmente al ingles y se ha ajustado por instrucciones (SFT) con formato ChatML. Su relevancia es fundamentalmente educativa y de investigacion: permite reproducir e inspeccionar el comportamiento de tecnicas modernas de transformer en un entorno de hardware asequible. No se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, implementacion PyTorch personalizada (GQA, QK-Norm, Value Residuals, SwiGLU, RoPE, RMSNorm) |
| Parametros totales | 41.957.387 (~41,96 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible en la model card principal; existe un companion GGUF (Maxilicious20/Velqora-40M-Instruct-GGUF) cuyos tipos concretos no se detallan en la informacion proporcionada |
| Idiomas soportados | Ingles (english-first) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y checkpoint PyTorch (`best_checkpoint/model.pt`); GGUF en repositorio companion |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con tamano oculto de 512 y dimension feed-forward de 1.536 con activacion SwiGLU. La atencion usa Grouped-Query Attention con 8 cabezas de consulta y 4 de clave-valor, complementada con QK-Norm y Value Residuals aplicados en la capa 0. Emplea RMSNorm, embeddings posicionales rotatorios (RoPE) con base theta de 30.000 y embeddings de entrada/salida atados. La implementacion es PyTorch personalizada (clase `VelqoraForCausalLM` en `velqora/model.py`), usando `scaled_dot_product_attention` en bfloat16, y no se apoya en `AutoModelForCausalLM`. El tokenizador es un BPE byte-level propio de 8.192 tokens.

El entrenamiento se realizo desde inicializacion aleatoria en dos fases sobre una unica RTX 4060 de 8 GB. La primera fase fue un preentrenamiento curricular de prediccion del siguiente token sobre `HuggingFaceTB/cosmopedia-100k`, `HuggingFaceFW/fineweb-edu` y `roneneldan/TinyStories`, incrementando progresivamente la longitud de contexto hasta la ventana maxima. La segunda fase fue un ajuste supervisado (SFT) con perdida enmascarada solo en turnos del asistente y formato ChatML multi-turno, usando `HuggingFaceTB/smoltalk`, `HuggingFaceH4/ultrachat_200k`, `HuggingFaceH4/no_robots` y dialogos de recuperacion/grounding multi-turno. La mejor perdida de validacion reportada es 1,5638. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML (roles `system`, `user`, `assistant`).
- Dialogo multi-turno de instrucciones, gracias al ajuste SFT sobre datasets de conversacion.
- Recuperacion y grounding conversacional multi-turno (segun la descripcion del dataset de SFT).
- Generacion de texto general de dominio abierto en ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo de razonamiento (thinking), vision ni audio.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- Capacidad de matematicas, codigo y conocimiento factual muy limitada por su escala (~42 M de parametros).

## Casos de uso

- Investigacion educativa sobre componentes de transformer: permite inspeccionar el codigo de `velqora/model.py` y estudiar el efecto de GQA, QK-Norm, Value Residuals, SwiGLU y RoPE en un modelo pequeno y reproducible.
- Experimentos de inferencia en el borde (edge): con ~42 M de parametros y pesos bfloat16, el modelo cabe holgadamente en GPU de consumo y en CPU, lo que permite probar pipelines de despliegue locales.
- Reproduccion de entrenamiento desde cero: sirve como referencia para validar recetas de preentrenamiento curricular y SFT en una unica GPU de 8 GB.
- Pruebas de tokenizadores personalizados: el tokenizador BPE byte-level de 8.192 tokens permite estudiar el impacto del vocabulario en modelos pequenos.
- Prototipado de interfaces conversacionales: util para validar el formato ChatML y el flujo de serializacion de turnos antes de migrar a modelos mayores.
- Docencia y demostraciones: ejemplo didactico de un modelo de instrucciones completo (preentrenamiento + SFT) con licencia permisiva Apache-2.0.
- Evaluacion de cuantizacion: el repositorio GGUF companion permite comparar calidad y velocidad entre pesos bfloat16 y variantes cuantizadas (tipos concretos no disponibles).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la mejor perdida de validacion de 1,5638 durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con ~42 M de parametros, los pesos en bfloat16 ocupan aproximadamente 84 MB, por lo que el modelo cabe en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el propio autor lo entreno en una NVIDIA RTX 4060 de 8 GB, y para inferencia sobra con GPUs integradas o de gama baja.
- Cabe en GPU de consumo: si, en practicamente todas (RTX 4060, RTX 3060, GTX 1650, etc.) y en CPU.
- Opciones de despliegue: inferencia mediante el script incluido `run_inference.py` con PyTorch, safetensors y tokenizers; existe un repositorio GGUF companion para usar con llama.cpp u otros runners compatibles con GGUF (no se detalla compatibilidad con vLLM, TGI u Ollama).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales en la informacion proporcionada. A continuacion se ofrece una comparacion cualitativa con alternativas de escala similar o proposito educativo, marcando como "no disponible" los datos no confirmados.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Velqora-40M-Instruct | ~41,96 M | 2.048 | Apache-2.0 | From-scratch, instruct, ingles |
| TinyStories (modelos de referencia) | del orden de 1-30 M (segun variante) | no disponible | variable | Generacion de cuentos simples en ingles |
| SmolLM-135M (HuggingFaceTB) | ~135 M | no disponible en esta ficha | Apache-2.0 | Preentrenado a gran escala, multilingue parcial |
| Pythia-70M (EleutherAI) | ~70 M | 2.048 | Apache-2.0 | Investigacion, solo preentrenado |

Las cifras de rendimiento comparativo no estan disponibles para Velqora-40M-Instruct, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Alucinacion de hechos: con ~42 M de parametros entrenados desde cero, el modelo puede inventar datos factuales con facilidad.
- Errores aritmeticos y de razonamiento: la capacidad de calculo y de instrucciones complejas es muy limitada por la escala.
- Sesgos: al entrenarse sobre subconjuntos de datos web (fineweb-edu, cosmopedia) y conversacionales, puede heredar sesgos presentes en esos corpus; no se documenta mitigacion especifica.
- Limitacion de idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Ventana de contexto corta: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo no es apto para tareas medicas, legales, financieras o de seguridad critica, tal como advierte el autor.
- Aviso de produccion: el autor lo orienta a investigacion, inferencia local en el borde y estudio educativo; no debe desplegarse en sistemas de produccion que requieran fiabilidad.
- Implementacion no estandar: requiere el codigo personalizado `velqora/model.py` y el tokenizador propio; no es compatible directamente con `AutoModelForCausalLM` de Transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maxilicious20/Velqora-40M-Instruct
- Repositorio GGUF companion: https://huggingface.co/Maxilicious20/Velqora-40M-Instruct-GGUF
- Perfil del autor: https://huggingface.co/Maxilicious20
- Dataset cosmopedia-100k: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-100k
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset no_robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
