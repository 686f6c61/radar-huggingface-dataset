# CooperBench/qwen3.5-9b-tool-use-sft

## Resumen

CooperBench/qwen3.5-9b-tool-use-sft es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario CooperBench sobre el modelo base Qwen/Qwen3.5-9B. Su propósito declarado es especializar el modelo en el uso de herramientas (tool use) mediante fine-tuning supervisado (SFT). Se publica como un adaptador PEFT de 0.5 GB, lo que permite aplicarlo sobre los pesos completos del modelo base sin necesidad de reentrenar toda la arquitectura.

La relevancia de este adaptador radica en que Qwen3.5-9B es un modelo de 9.000 millones de parámetros con soporte multimodal y una ventana de contexto de hasta 262.000 tokens, según la información disponible sobre el modelo base. Al añadir una capa de tool calling mediante LoRA, se busca habilitar al modelo para interactuar con APIs, ejecutar funciones y participar en flujos de agente, un caso de uso cada vez más demandado en producción. Sin embargo, la documentación publicada es mínima: la model card no contiene detalles sobre el dataset de entrenamiento, hiperparámetros, evaluación o licencia, por lo que gran parte de las especificaciones técnicas deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-9B (transformer decoder) |
| Parametros totales | No disponible (el adaptador pesa 0.5 GB; el modelo base tiene 9B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta hasta 262K tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, BF16/F32) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se especifica para el adaptador) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer del modelo Qwen3.5-9B, que según la información disponible sobre el modelo base es un decoder-only con soporte multimodal (imagen y video) y una ventana de contexto ampliada de 262K tokens. El adaptador LoRA añade matrices de bajo rango a las capas de atención y feed-forward para ajustar el comportamiento del modelo hacia la generación de llamadas a herramientas.

El entrenamiento se describe como "SFT" (supervised fine-tuning), lo que implica un ajuste con ejemplos etiquetados de interacciones con herramientas. No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, el régimen de precisión (fp16, bf16, etc.) ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card no incluye hiperparámetros ni información sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, que incluyen generacion de texto, razonamiento y soporte multimodal (imagen y video).
- Tool calling / function calling: el proposito principal del adaptador es habilitar al modelo para invocar herramientas externas, probablemente siguiendo el formato de llamada a funciones de Qwen.
- Soporte de agentes: al integrar tool calling, el modelo puede participar en flujos de agente multi-paso, aunque no se especifica si el adaptador incluye entrenamiento especifico para razonamiento encadenado.
- Capacidades multilingues: no se indica si el adaptador mantiene o modifica el soporte multilingue del modelo base.
- Thinking mode: el modelo base Qwen3.5-9B incluye un modo de pensamiento (thinking mode) que se puede activar para tareas de matematicas y codigo; el adaptador no documenta si lo preserva o modifica.

## Casos de uso

- Asistentes de codigo con acceso a herramientas: el adaptador puede integrarse en entornos de desarrollo donde el modelo necesite ejecutar comandos, consultar repositorios o llamar a APIs de compilacion, aprovechando el tool calling entrenado.
- Automatizacion de tareas de oficina: el modelo puede invocar funciones de calendario, correo o gestion de documentos a traves de APIs, actuando como un agente conversacional que ejecuta acciones.
- Agentes de busqueda enriquecida: al combinar el tool calling con el modelo base multimodal, se puede construir un agente que busque informacion en la web, procese imagenes y devuelva respuestas contextualizadas.
- Integracion en pipelines de datos: el adaptador puede llamar a funciones de transformacion de datos, consultas SQL o scripts de procesamiento, facilitando la automatizacion de flujos ETL.
- Soporte tecnico automatizado: el modelo puede gestionar conversaciones multi-turno y, cuando sea necesario, invocar herramientas de diagnostico o bases de conocimiento internas para resolver incidencias.
- Prototipado rapido de agentes: dado su tamano (9B) y la posibilidad de ejecutarse en hardware de consumo, es adecuado para experimentar con arquitecturas de agente sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica de evaluacion, y no hay datos comparativos con otros modelos o adaptadores. Se recomienda realizar una evaluacion propia antes de usar el adaptador en produccion.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador especifico. El modelo base Qwen3.5-9B en cuantizacion Q4_K_M ocupa aproximadamente 6.6 GB, por lo que un adaptador LoRA anadira un overhead minimo (0.5 GB en precision completa, menos si se cuantiza).
- GPU recomendadas: el modelo base puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB). Para el adaptador, se recomienda al menos 8 GB de VRAM si se usa cuantizacion Q4.
- Compatibilidad con consumer GPU: si, siempre que se use una cuantizacion adecuada (Q4_K_M o superior) y se disponga de al menos 8 GB de VRAM.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria transformers y PEFT. Para inferencia, se puede fusionar con el modelo base y exportar a formatos como GGUF para usar con llama.cpp u Ollama. Tambien es compatible con vLLM y TGI si se fusiona previamente.
- Latencia y throughput: no disponible. Dependera del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El adaptador es especifico de Qwen3.5-9B y no existen datos publicos sobre su rendimiento frente a otros adaptadores de tool calling (por ejemplo, los basados en Llama 3.1 8B o Mistral 7B). Se recomienda evaluar el adaptador en un conjunto de tareas propio antes de decidir su uso.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado. Al ser un adaptador sobre un modelo base, hereda los sesgos potenciales de Qwen3.5-9B, que no estan detallados en la informacion disponible.
- Riesgo de alucinacion: no se ha evaluado especificamente. El tool calling puede generar llamadas a funciones inexistentes o con argumentos incorrectos si el entrenamiento no fue suficientemente robusto.
- Limitaciones de contexto o idioma: el adaptador no documenta si mantiene la ventana de 262K tokens del modelo base. Se recomienda verificar experimentalmente.
- Restricciones de licencia: la licencia no esta disponible. Esto impide conocer si el uso comercial esta permitido. Se debe contactar con el autor antes de usar en produccion.
- Caveat de produccion: al ser un adaptador sin documentacion de entrenamiento ni evaluacion, su fiabilidad es incierta. Es imprescindible realizar pruebas exhaustivas en el dominio de aplicacion.

## Enlaces

- HuggingFace: https://huggingface.co/CooperBench/qwen3.5-9b-tool-use-sft
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.5-9B
- Guia de despliegue de Qwen3.5-9B en hardware de consumo: https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
