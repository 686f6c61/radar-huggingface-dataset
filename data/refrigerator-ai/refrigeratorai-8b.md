# refrigerator-ai/RefrigeratorAI-8B

## Resumen

RefrigeratorAI-8B es un modelo de lenguaje de 8.339 millones de parámetros desarrollado por el proyecto experimental Refrigerator AI, que integra un LLM en un electrodoméstico para permitir conversación y sugerencias de recetas. Se trata de un fine-tuning del modelo base Tema_Q-X4-8B, orientado específicamente al idioma japonés, y fue creado para funcionar como modelo base del sistema RefrigeratorAI. El proyecto busca ejecutar un LLM ligero en un Raspberry Pi 4 con 4 GB de RAM, lo que condiciona su diseño hacia la eficiencia y el bajo consumo de recursos.

La relevancia de este modelo radica en su enfoque de aplicación en hardware de bajo coste y en un dominio concreto (electrodomésticos inteligentes), aunque su disponibilidad pública es muy reciente (creado en abril de 2026) y cuenta con una adopción mínima (8 descargas, 1 like). No se han publicado detalles sobre la arquitectura interna, el proceso de entrenamiento ni benchmarks, por lo que su evaluación objetiva es limitada. Existe una versión cuantizada en GGUF mantenida por un tercero (mradermacher), lo que facilita su despliegue en entornos con recursos reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Tema_Q-X4-8B, probablemente transformer denso) |
| Parametros totales | 8.339.930.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (IQ4_XS, entre otros, disponibles en repo de mradermacher) |
| Idiomas soportados | japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (original), GGUF (cuantizado) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo. Dado que se basa en Tema_Q-X4-8B, es probable que herede su estructura, pero no se confirma si se trata de un transformer denso, MoE o híbrido. El nombre "LFM2-8B" mencionado en la model card sugiere una posible relacion con un modelo base llamado LFM2, pero no hay documentacion al respecto.

El proceso de entrenamiento tampoco esta documentado: se desconoce el volumen de tokens, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO o instruccion supervisada. La unica informacion disponible es que el modelo "opera un vector unico para el LFM2-8B", lo que podria indicar un fine-tuning con un enfoque de adaptacion por vectores, pero es una interpretacion especulativa. No se han publicado papers ni documentacion tecnica.

## Capacidades

- Generacion de texto conversacional en japones, orientado a dialogos simples y sugerencias de recetas.
- Ejecucion en hardware de bajos recursos (Raspberry Pi 4 con 4 GB RAM), lo que implica un diseno optimizado para inferencia ligera.
- Integracion en sistemas embebidos de electrodomesticos, permitiendo interaccion por voz o texto.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modos de pensamiento.
- El soporte multilingue se limita al japones segun la model card.

## Casos de uso

- Asistente de cocina integrado en frigorificos: el modelo puede sugerir recetas basadas en los ingredientes disponibles, manteniendo conversaciones sencillas en japones. Su bajo consumo permite ejecutarlo en un Raspberry Pi 4, lo que lo hace viable para un electrodomestico.
- Interfaz conversacional para electrodomesticos inteligentes: permite a los usuarios preguntar por el estado del frigorifico, recibir avisos o realizar consultas basicas mediante lenguaje natural.
- Prototipos de investigacion en IA embebida: sirve como punto de partida para experimentar con LLMs en dispositivos con restricciones de memoria y procesamiento.
- Educacion y demostracion: puede utilizarse en talleres o cursos para mostrar como desplegar un LLM en hardware de bajo coste.
- Sistema de recordatorios y gestion de inventario: combinado con sensores, el modelo podria interpretar listas de compra o sugerir menus basados en fechas de caducidad.
- Desarrollo de aplicaciones de nicho en japones: cualquier aplicacion que requiera un modelo ligero y especifico para conversacion en japones, sin necesidad de capacidades avanzadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se han realizado comparaciones publicas con otros modelos. La unica referencia de rendimiento es la afirmacion del proyecto de que puede ejecutarse en un Raspberry Pi 4 con 4 GB de RAM, lo que sugiere una latencia aceptable para conversaciones simples, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: la version GGUF IQ4_XS pesa 4,5 GB, por lo que cabe en GPUs con 6 GB de VRAM o mas. La version en safetensors (FP16) requeriria aproximadamente 16,7 GB de VRAM.
- GPU recomendadas: para la version cuantizada, una RTX 3060 (12 GB) o RTX 4060 (8 GB) seria suficiente. Para FP16, se necesitaria una RTX 4090, A100 o similar.
- En CPU: el modelo esta disenado para ejecutarse en Raspberry Pi 4 con 4 GB RAM, lo que implica que puede funcionar en CPU con cuantizacion agresiva (IQ4_XS o inferior), aunque con latencia elevada.
- Opciones de despliegue: llama.cpp, Ollama, o cualquier runtime compatible con GGUF. Para safetensors, se puede usar vLLM o TGI, aunque no es recomendable por el tamano.
- Latencia y throughput: no se han publicado datos. En Raspberry Pi 4, se espera una generacion lenta (varios segundos por token) incluso con cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma | Notas |
|---|---|---|---|---|---|
| RefrigeratorAI-8B | 8,34 B | no disponible | no disponible | ja | Fine-tune de Tema_Q-X4-8B, orientado a embebidos |
| Tema_Q-X4-8B (base) | 8,34 B (estimado) | no disponible | no disponible | probablemente ja | Modelo base del que deriva |
| Otros modelos japoneses de 8B (p.ej. ELYZA-japanese-Llama-2-7b) | 7 B | 4096 | MIT (algunos) | ja | Mas documentados, con benchmarks publicos |

No se dispone de datos suficientes para una comparativa rigurosa. El modelo es un caso atipico por su enfoque en hardware embebido, pero carece de documentacion tecnica que permita evaluar su rendimiento relativo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un modelo entrenado probablemente con datos en japones, puede reflejar sesgos culturales y linguisticos de ese dominio.
- Riesgo de alucinacion: no evaluado. Al ser un modelo pequeno y sin ajuste fino demostrado, es probable que presente alucinaciones frecuentes en tareas complejas.
- Limitaciones de contexto: se desconoce la longitud de contexto, pero por su tamano y orientacion a embebidos, es probable que sea corta (2K-4K tokens).
- Restricciones de licencia: la licencia no esta especificada, lo que impide conocer si su uso comercial esta permitido. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- Caveat para produccion: el modelo es experimental, con una comunidad minima y sin mantenimiento garantizado. No es adecuado para aplicaciones criticas sin una evaluacion exhaustiva.
- Idioma: solo soporta japones, lo que limita su uso a ese mercado.

## Enlaces

- Modelo original en HuggingFace: https://huggingface.co/refrigerator-ai/RefrigeratorAI-8B
- Version GGUF (mradermacher): https://huggingface.co/mradermacher/RefrigeratorAI-8B-GGUF
- Perfil de la organizacion Refrigerator AI: https://huggingface.co/refrigerator-ai
- Listado de modelos de la organizacion: https://huggingface.co/refrigerator-ai/models
