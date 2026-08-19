# RahulPi/Email_Text_Formatter

## Resumen

Email_Text_Formatter es un modelo de lenguaje fine-tuneado por RahulPi a partir de unsloth/phi-4-unsloth-bnb-4bit, una version cuantizada a 4 bits del modelo Phi-4 de Microsoft. Su proposito es automatizar flujos de trabajo empresariales procesando comunicaciones por correo electronico no estructuradas: lee el contenido de un email, identifica los activos empresariales mencionados y los convierte en un formato estructurado listo para su insercion en bases de datos o sistemas aguas abajo.

El modelo tiene 14.659.507.200 parametros (14,7 B) y se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial sin restricciones. Fue entrenado con un dataset personalizado para un caso de negocio especifico, utilizando Unsloth y la libreria TRL de Hugging Face, lo que redujo el tiempo de entrenamiento a la mitad. El modelo esta orientado exclusivamente al idioma ingles y su pipeline es text-generation.

La relevancia de este modelo radica en su especializacion: en lugar de ser un LLM generalista, esta optimizado para una tarea concreta de extraccion de informacion, lo que lo hace potencialmente mas fiable y eficiente en ese dominio especifico que un modelo general mas grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Phi-4, decodificador autoregresivo) |
| Parametros totales | 14.659.507.200 (14,7 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Phi-4, probablemente 128k) |
| Tipos de cuantizacion | 4-bit bitsandbytes (durante entrenamiento); pesos publicados en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer decodificador de Phi-4, un LLM de Microsoft de 14,7 B de parametros. Al ser un fine-tuning sobre la version cuantizada a 4 bits con bitsandbytes de unsloth, la arquitectura interna se mantiene intacta, pero los pesos se han optimizado para la tarea especifica de extraccion de activos empresariales desde correos electronicos.

El entrenamiento se realizo con un dataset personalizado construido para un escenario de negocio concreto. El formato de los datos es pareja entrada-salida: como entrada, texto en lenguaje natural que simula correos empresariales reales con detalles de activos; como salida, un formato estructurado que mapea los activos identificados para facilitar su entrada en bases de datos. Se utilizo la libreria TRL de Hugging Face junto con Unsloth, que acelera el fine-tuning aproximadamente 2x en comparacion con metodos convencionales. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Extraccion de informacion estructurada: identifica activos empresariales mencionados en correos electronicos y los convierte en un formato estructurado.
- Comprension de lenguaje natural: procesa texto no estructurado de correos electronicos con lenguaje variado y coloquial.
- Generacion de texto estructurado: produce salidas en formato de datos (JSON, tablas, etc.) aptas para insercion automatica en bases de datos.
- Automatizacion de flujos de trabajo: disenado para integrarse en pipelines de procesamiento de correo entrante.
- Conversacional: al estar basado en Phi-4, mantiene capacidades de generacion de texto y dialogo, aunque su especializacion principal es la extraccion.
- Multilingue: no, limitado al ingles.

## Casos de uso

- Gestion automatizada de correo entrante: el modelo puede procesar la bandeja de entrada de una empresa, leer cada correo y extraer automaticamente los activos mencionados (equipos, licencias, contratos, etc.), generando un registro estructurado en el CRM o ERP.
- Integracion con sistemas de ticketing: al recibir un correo de soporte o ventas, el modelo extrae la informacion relevante y crea un ticket con campos estructurados, reduciendo la intervencion manual del equipo.
- Onboarding de nuevos clientes: procesa correos de bienvenida o solicitudes de alta, identificando los activos que el cliente declara poseer y registrandolos en el sistema.
- Auditoria de inventario: lee correos internos donde los departamentos comunican compras o bajas de activos y actualiza la base de datos de inventario de forma automatica.
- Conciliacion de facturas: extrae referencias de activos desde correos de facturacion para cotejarlas con los registros contables.
- Migracion de datos legacy: procesa un historial de correos antiguos para reconstruir una base de datos estructurada de activos que antes solo existia en texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de evaluacion como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en la tarea especifica de extraccion de activos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 14,7 B de parametros en 4 bits, la inferencia requiere aproximadamente 8-10 GB de VRAM. En precision completa (si se descargan los pesos safetensors sin cuantizar), se necesitarian alrededor de 30 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). Una RTX 3090 o 4080 (16-24 GB) podria ser suficiente con cuantizacion adicional.
- Compatibilidad con consumer GPU: si, una RTX 4090 o 3090 puede ejecutar el modelo con cuantizacion 4-bit sin problemas. GPUs con 12 GB o menos (RTX 3080, 4070) probablemente no tengan suficiente VRAM.
- Opciones de despliegue: compatible con transformers, text-generation-inference (TGI), vLLM y llama.cpp (si se convierten los pesos a GGUF). No se menciona compatibilidad con Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia, un modelo de 14 B en 4-bit en una RTX 4090 suele generar entre 20 y 40 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RahulPi/Email_Text_Formatter | 14,7 B | no disponible | Extraccion de activos de emails | Apache 2.0 | HuggingFace |
| Llama 3.1 8B (fine-tuned) | 8 B | 128k | Generico / extraccion | Llama 3.1 Community License | HuggingFace |
| Mistral 7B (fine-tuned) | 7 B | 32k | Generico / extraccion | Apache 2.0 | HuggingFace |
| GPT-4o mini (API) | no disponible | 128k | Generico / extraccion | Propietaria (pago) | API OpenAI |

La ventaja de este modelo frente a alternativas genericas es su especializacion en la tarea de extraccion de activos empresariales, lo que deberia traducirse en mayor precision y menor necesidad de few-shot prompting. Sin embargo, al ser un modelo de 14,7 B, requiere mas VRAM que alternativas de 7-8 B.

## Limitaciones y advertencias

- Dataset limitado: entrenado con un dataset personalizado para un caso de negocio especifico, puede no generalizar bien a otros dominios o tipos de correos.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en empresas multilingues.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento frente a alternativas.
- Riesgo de alucinacion: como cualquier LLM, puede inventar activos que no estan en el correo o malinterpretar la informacion.
- Contexto no documentado: se desconoce la longitud de contexto efectiva, lo que puede afectar a correos muy largos.
- Sin mantenimiento garantizado: es un modelo de un autor individual sin organizacion detras, lo que implica riesgo de abandono o falta de actualizaciones.
- Formato de salida no documentado: la model card no especifica el esquema exacto de la salida estructurada, lo que dificulta la integracion.
- Tamano del repositorio: 39,7 GB, lo que requiere un ancho de banda considerable para su descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RahulPi/Email_Text_Formatter
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo base cuantizado: https://huggingface.co/unsloth/phi-4-unsloth-bnb-4bit
