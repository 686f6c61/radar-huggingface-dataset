# miesdevries/stay4s-reken-agent

## Resumen

stay4s-reken-agent es un modelo de lenguaje en neerlandes especializado en calculos aritmeticos y analisis financieros, publicado por el usuario miesdevries y desarrollado por Het Nieuwe Begin B.V. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen2.5-7B-Instruct mediante SFT con LoRA de rango 64, orientado a comportarse como un agente conversacional en tareas de calculo y finanzas. Su relevancia radica en ser un ejemplo de adaptacion vertical de un modelo abierto a un dominio concreto y a un idioma minoritario dentro del ecosistema de modelos masivos.

El modelo se distribuye tanto en formato safetensors como en GGUF, lo que facilita su despliegue local a traves de Ollama o llama.cpp. El repositorio ocupa 4,8 GB y, segun los datos de safetensors, cuenta con 4.022.468.096 parametros totales (aproximadamente 4,02 B). Existe una discrepancia reseñable entre este recuento y el modelo base declarado (Qwen2.5-7B-Instruct, que ronda los 7,6 B de parametros), detalle que se comenta en la seccion de limitaciones.

El modelo esta etiquetado como agente, conversacional y compatible con endpoints, con licencia Apache 2.0, y esta pensado para inferencia local en neerlandes. El repositorio no registra descargas ni interacciones en el momento de la consulta y se publico el 29 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de la familia Qwen2.5) |
| Parametros totales | 4.022.468.096 (aproximadamente 4,02 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos) |
| Tipos de cuantizacion | GGUF Q8 (indicado en la model card); safetensors |
| Idiomas soportados | Neerlandes (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura no se detalla en la model card mas alla de indicar que deriva de Qwen2.5-7B-Instruct. La familia Qwen2.5 emplea un transformer decoder con normalizacion RMSNorm, activacion SwiGLU, atencion con query-key-value agrupada (GQA) y embeddings posicionales rotatorios (RoPE). El entrenamiento consistio en un ajuste supervisado (SFT) con adaptadores LoRA de rango 64 sobre dicho modelo base, lo que indica un proceso de especializacion relativamente ligero y no un preentrenamiento ni un ajuste completo de pesos.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias como decodificacion especulativa o mecanismos de atencion alternativa. El unico dato de despliegue aportado es la recomendacion de cargar el modelo en Ollama o llama.cpp para inferencia local, en formato GGUF Q8.

## Capacidades

- Generacion de texto conversacional en neerlandes.
- Calculos aritmeticos, segun su denominacion explicita de "reken agent" (agente de calculo).
- Analisis financieros, de acuerdo con la descripcion del autor.
- Comportamiento orientado a agente, segun las etiquetas del repositorio ("agent", "conversational").
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y uso como agente autonomo: no confirmado en la informacion disponible mas alla de la etiqueta "agent".
- Capacidades de vision o audio: no disponibles.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Asistencia en calculos aritmeticos de negocio: el modelo puede resolver operaciones y agregaciones numericas dentro de un flujo conversacional en neerlandes, aprovechando su especializacion en "reken" (calculo).
- Analisis financiero basico: adecuado para resumir estados financieros, calcular ratios o interpretar cifras contables para usuarios neerlandofonos, dado su enfoque declarado en analisis financiero.
- Atencion al cliente en neerlandes para productos financieros: gestion de conversaciones multi-turno en neerlandes sobre cuentas, presupuestos o facturacion, con la ventaja de operar en el idioma del usuario.
- Despliegue embebido o local en oficina: su formato GGUF y su tamaño moderado permiten ejecutarlo en equipos sin GPU dedicada mediante Ollama o llama.cpp, util para entornos con requisitos de privacidad de datos financieros.
- Automatizacion de informes contables: generacion de borradores de informes o resumenes con cifras calculadas a partir de datos introducidos por el usuario, en neerlandes.
- Prototipado de agentes sectoriales: sirve como base para construir agentes conversacionales verticales en neerlandes que requieran operaciones numericas como paso intermedio.
- Educacion financiera: explicacion de conceptos de calculo y finanzas a hablantes de neerlandes en un tono conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para safetensors en precision original (fp16): en torno a 8-9 GB para 4,02 B de parametros, sin contar overhead de activaciones ni cache KV.
- VRAM estimada para GGUF Q8: aproximadamente 4,5-5 GB, coherente con el tamaño del repositorio (4,8 GB).
- Cuantizaciones adicionales (Q4, Q5, etc.): no se confirman en la informacion proporcionada; solo se menciona GGUF Q8.
- GPU recomendadas: no disponibles de forma especifica; por tamaño, una RTX 3060 de 12 GB o superior seria suficiente para Q8, y una RTX 4090 o A100 resultarian holgadas.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con 8 GB o mas de VRAM en cuantizacion Q8, y con mayor holgura en fp16 en tarjetas de 12 GB o mas.
- Opciones de despliegue: Ollama y llama.cpp (recomendados por el autor); vLLM y TGI no estan confirmados para este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stay4s-reken-agent | ~4,02 B (segun safetensors) | No disponible | Neerlandes | Apache 2.0 | HuggingFace (safetensors, GGUF) |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens nativos | Multilingue (incluye neerlandes) | Apache 2.0 | HuggingFace |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens nativos | Multilingue | Apache 2.0 (Qwen Research en algunas variantes) | HuggingFace |

La comparativa con alternativas especializadas en neerlandes (por ejemplo, ajustes de la familia GEITje o modelos similares) no se incluye por falta de datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de parametros: el recuento de safetensors indica 4,02 B de parametros, mientras que el modelo base declarado es Qwen2.5-7B-Instruct (aproximadamente 7,6 B). Esta inconsistencia deberia verificarse antes de reutilizar el modelo.
- Idiomas: el soporte declarado se limita al neerlandes, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto: no se documenta en la model card ni en los metadatos, lo que dificulta planificar casos de uso con entradas largas.
- Riesgo de alucinacion: al ser un ajuste fino de un modelo generativo, puede producir cifras o resultados aritmeticos incorrectos; en dominios financieros conviene validar los calculos con herramientas externas.
- Ausencia de benchmarks: no hay evaluaciones publicadas que respalden su calidad frente a alternativas.
- Trazabilidad limitada: el repositorio no registra descargas ni interacciones, y no se aportan detalles sobre el dataset de entrenamiento, lo que reduce la reproducibilidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5 por si el ajuste hereda restricciones adicionales.
- Produccion: se recomienda validar el comportamiento en tareas financieras reales antes de cualquier despliegue critico, dado el escaso historial de uso del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/miesdevries/stay4s-reken-agent
- Modelo base: Qwen2.5-7B-Instruct (no se proporciona enlace directo en la informacion disponible)
