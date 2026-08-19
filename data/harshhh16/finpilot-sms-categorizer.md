# Harshhh16/finpilot-sms-categorizer

## Resumen
Finpilot SMS Categorizer es un modelo de clasificacion de mensajes de texto financieros, desarrollado por Harshhh16 como un componente del ecosistema Finpilot, una plataforma de finanzas personales que captura y analiza mensajes SMS de transacciones bancarias para proporcionar a los usuarios una vision completa de sus habitos de gasto. El modelo convierte notificaciones de transacciones no estructuradas en registros financieros categorizados y procesables.

El modelo es un fine-tuning del modelo base unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit, que a su vez es la version cuantizada en 4 bits del Qwen2.5-1.5B-Instruct de Alibaba Cloud. Con 1.500 millones de parametros, es un modelo compacto disenado para tareas de clasificacion de textos cortos, como los mensajes SMS bancarios. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas. Fue entrenado con la libreria Unsloth, que acelera el proceso de fine-tuning en un factor de 2x respecto a los metodos convencionales.

La relevancia actual de este modelo radica en la creciente necesidad de automatizar la gestion de finanzas personales y empresariales, donde la categorizacion precisa de transacciones a partir de SMS es un paso fundamental. Su tamano reducido lo hace adecuado para despliegue en entornos con recursos limitados, como aplicaciones moviles o servidores de baja capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (Transformer decoder-only) |
| Parametros totales | 1,5B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se hereda de Qwen2.5-1.5B-Instruct, que soporta hasta 32.768 tokens) |
| Tipos de cuantizacion | bnb-4bit (modelo base), safetensors (pesos finales) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atencion causal. El modelo base es la version instruct de 1.500 millones de parametros, preentrenada por Alibaba Cloud con un amplio corpus multilingue. El fine-tuning se realizo con la libreria Unsloth, que optimiza el entrenamiento de modelos de lenguaje mediante kernels de attention eficientes y gestion de memoria mejorada, permitiendo un entrenamiento aproximadamente 2 veces mas rapido que los metodos convencionales.

Los detalles sobre el dataset de entrenamiento (numero de tokens, composicion, metodos de alineacion como RLHF o DPO) no estan disponibles en la informacion proporcionada. La model card indica que se utilizo TRL (Transformer Reinforcement Learning) como parte del pipeline, pero no se especifica si se aplico alguna tecnica de alineacion especifica. El modelo fue entrenado para la tarea de clasificacion de mensajes SMS, probablemente con un dataset de transacciones financieras anotadas, aunque no se proporciona informacion sobre el tamano o la composicion del dataset.

## Capacidades

- Clasificacion de mensajes SMS de transacciones financieras en categorias predefinidas (gastos, ingresos, alertas de seguridad, etc.).
- Generacion de texto en ingles para respuestas o resumenes de transacciones.
- Razonamiento basico sobre contexto financiero, heredado del modelo base Qwen2.5-1.5B-Instruct.
- Capacidades multilingües limitadas: el modelo base soporta varios idiomas, pero el fine-tuning se realizo solo en ingles, por lo que el rendimiento en otros idiomas puede degradarse.
- Soporte de tool calling: no disponible (no se menciona en la model card).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades especiales como vision o audio: no disponibles.

## Casos de uso

- Categorizacion automatica de gastos personales: el modelo puede analizar SMS de bancos y clasificar cada transaccion en categorias (supermercado, transporte, ocio, etc.), permitiendo a usuarios de aplicaciones de finanzas personales obtener un desglose automatico de sus gastos sin intervencion manual.
- Gestion de alertas de seguridad bancaria: puede clasificar mensajes de alerta de fraude o verificacion de identidad, priorizandolos para que el usuario revise acciones urgentes.
- Integracion en asistentes financieros: el modelo puede ser integrado en plataformas como Finpilot para enriquecer la experiencia de usuario, proporcionando resumenes de gastos en lenguaje natural a partir de los SMS clasificados.
- Filtrado de notificaciones bancarias: clasifica mensajes en categorias como "transferencias", "pagos con tarjeta", "devoluciones" para permitir a los usuarios filtrar y buscar transacciones especificas en sus apps de banca.
- Analisis de comportamiento de gasto: agrupa transacciones por categoria para generar informes de habitos de consumo, util para aplicaciones de presupuesto y planificacion financiera.
- Deteccion de anomalias en transacciones: al clasificar mensajes, puede ayudar a identificar patrones inusuales (por ejemplo, compras en el extranjero) que podrian indicar fraude, combinado con reglas de negocio externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre el rendimiento del modelo en tareas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de clasificacion de SMS.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB para el modelo en precision fp16 (1,5B parametros). Con cuantizacion de 4 bits, podria reducirse a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 2060, RTX 3060, T4). No requiere GPU de datacenter.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo como la RTX 3060, 4060, 5060, etc.
- Opciones de despliegue: vLLM, llama.cpp (via conversion a GGUF), Ollama, Text Generation Inference (TGI), Transformers de HuggingFace.
- Latencia y throughput: no disponible, pero para un modelo de 1,5B en una GPU moderada, se espera una latencia de entre 50-100 ms por token en fp16, y un throughput de 20-50 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento en clasificacion de SMS |
|---|---|---|---|---|
| Finpilot SMS Categorizer | 1,5B | 32K (heredado) | Apache 2.0 | No publicado |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32K | Apache 2.0 | No evaluado para esta tarea |
| Llama-3.2-1B-Instruct | 1,2B | 128K | Llama 3.2 Community License | No evaluado para esta tarea |

La comparativa directa no es posible sin datos de benchmarks. Sin embargo, el modelo se diferencia por estar especificamente afinado para clasificacion de SMS financieros, lo que le da una ventaja potencial sobre modelos generalistas del mismo tamano en esta tarea especifica.

## Limitaciones y advertencias

- El modelo fue entrenado solo en ingles, por lo que su rendimiento en otros idiomas es limitado o nulo.
- No hay informacion sobre sesgos o alucinaciones, pero como todo LLM, puede generar respuestas incorrectas o alucinar categorias si se le pide explicaciones.
- El modelo no tiene capacidades de vision ni de audio; solo procesa texto.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar la legalidad del uso de los datos de entrenamiento (que no estan publicados).
- El modelo esta disenado para clasificar SMS financieros; su uso fuera de este dominio puede producir resultados poco fiables.
- No hay garantias de precision en la clasificacion de transacciones; se recomienda supervisar el rendimiento en produccion.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Harshhh16/finpilot-sms-categorizer
- Repositorio de Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Pagina web de Finpilot: https://www.finpilot.ai/ (plataforma asociada, no es el repositorio del modelo)
- Repositorio Finpilot-AI (proyecto relacionado): https://github.com/godlysabu/FinPilot-AI
