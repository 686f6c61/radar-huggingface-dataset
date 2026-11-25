# HodyJJ/Qwen3.5-2B-Base-MED-ChatVector

## Resumen
HodyJJ/Qwen3.5-2B-Base-MED-ChatVector es un modelo de la familia Qwen3.5 en su variante Base de 2B, publicado por el usuario HodyJJ en Hugging Face. El nombre sugiere un proceso de ajuste orientado a dominio medico ("MED") y a la construccion de un vector de chat ("ChatVector"), una tecnica que consiste en extraer la diferencia de pesos entre un modelo base y su version instruida y aplicarla sobre otro checkpoint. El modelo se distribuye en formato safetensors para la libreria transformers y declara el pipeline image-text-to-text, lo que indica capacidades multimodales de entrada imagen-texto.

El checkpoint contiene 2.213.241.664 parametros (aproximadamente 2,2 mil millones) y el repositorio ocupa 4,4 GB, un tamano coherente con pesos en precision de 16 bits. La model card publicada es la plantilla autogenerada de Hugging Face y no aporta informacion sobre datos de entrenamiento, licencia, idiomas ni evaluacion, por lo que la mayor parte de las especificaciones de esta ficha quedan marcadas como no disponibles.

Su relevancia practica es limitada pero concreta: se trata de un modelo pequeno, desplegable en GPU de consumo, que combina una base reciente de Qwen con un ajuste orientado a conversacion en ambito medico y soporte de entrada visual. Cualquier evaluacion en produccion debe hacerse con cautela debido a la ausencia total de documentacion y de validacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer de la familia Qwen3.5 (detalle exacto no disponible) |
| Parametros totales | 2.213.241.664 (aprox. 2,2 B) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no hay GGUF ni cuantizaciones declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 4,4 GB |
| Modalidad de entrada | image-text-to-text (segun pipeline declarado) |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento
El modelo pertenece a la familia Qwen3.5, una arquitectura transformer desarrollada por Alibaba Qwen, de la que este checkpoint toma la variante Base de 2B parametros. El sufijo "ChatVector" apunta a la tecnica de vectores de chat: se calcula la diferencia de pesos entre un modelo base y su version alineada para instrucciones y se suma ese delta al checkpoint base, con el objetivo de transferir capacidades conversacionales sin reentrenar desde cero. El sufijo "MED" sugiere ademas un ajuste o mezcla orientada a contenido medico, aunque el autor no documenta el procedimiento.

No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni los hiperparametros del ajuste. Tampoco se detalla si el ajuste multimodal procede del modelo original o de una etapa posterior. La unica referencia tecnica de la model card es la cita a Lacoste et al. (2019) sobre el calculo de impacto ambiental, que forma parte de la plantilla estandar y no aporta datos del modelo.

## Capacidades
- Generacion de texto y conversacion multi-turno, derivadas de la base Qwen3.5 y del vector de chat aplicado.
- Procesamiento de entrada multimodal imagen-texto, segun el pipeline image-text-to-text declarado en el Hub.
- Razonamiento y respuesta en dominio medico como orientacion declarada en el nombre del checkpoint, sin validacion publicada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Prototipado de asistentes conversacionales en ambito clinico: un modelo de 2,2 B puede ejecutarse en una unica GPU de consumo para iterar sobre dialogos de triaje o educacion sanitaria, aunque cualquier salida debe pasar por revision profesional.
- Procesamiento de informes medicos con imagen asociada: el pipeline image-text-to-text permite alimentar radiografias, capturas de analiticas o fotografias de recetas junto a una pregunta en texto, util para experimentar con extraccion de informacion estructurada.
- Generacion de resumenes de documentacion clinica en entornos de investigacion: el tamano reducido permite procesar lotes grandes de textos con coste bajo por token en comparacion con modelos de decenas de miles de millones de parametros.
- Chatbot de orientacion para pacientes en fase de prueba: desplegable con transformers en una RTX 4090 o similar, sirve para evaluar la calidad del vector de chat antes de invertir en modelos mayores.
- Base para fine-tuning especifico de dominio: al ser un checkpoint Base de 2B, es un punto de partida economico para ajustes supervisados con LoRA sobre corpus propios.
- Experimentacion con tecnicas de model merging: el formato ChatVector lo convierte en un caso de estudio para reproducir y comparar la transferencia de capacidades conversacionales entre checkpoints.
- Evaluacion comparativa de robustez multimodal: util en laboratorio para medir como se comporta un modelo pequeno con entrada imagen-texto frente a alternativas mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16/bf16: en torno a 4,4-5 GB solo para pesos, mas overhead de activaciones y cache KV; presupuesto realista de 6-8 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,5-3 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,5-2 GB de pesos, si bien el repositorio no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G para servicio; A100 y H100 no son necesarias por el tamano del modelo.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas de VRAM en fp16, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, llama.cpp, Ollama y TGI no estan confirmados para esta variante concreta y requeririan conversion previa de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HodyJJ/Qwen3.5-2B-Base-MED-ChatVector | 2,2 B | no disponible | si (image-text-to-text) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B-Instruct | 3 B aprox. | no disponible en esta ficha | si | licencia Qwen (uso comercial permitido con condiciones) | ampliamente distribuido |
| Gemma 3 4B | 4 B aprox. | no disponible en esta ficha | si | licencia Gemma | ampliamente distribuido |
| SmolVLM-2B | 2 B aprox. | no disponible en esta ficha | si | licencia Apache 2.0 | ampliamente distribuido |

La comparativa se limita a parametros y disponibilidad porque no hay datos de rendimiento publicados para el modelo de HodyJJ. Frente a las alternativas citadas, la diferencia principal es la ausencia de licencia declarada y de evaluacion, lo que complica su adopcion en produccion.

## Limitaciones y advertencias
- La model card es la plantilla autogenerada y no documenta origen de datos, proceso de entrenamiento ni evaluacion: no hay garantia sobre la calidad del ajuste "MED" ni del vector de chat.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal; conviene contactar con el autor antes de cualquier despliegue.
- Riesgo elevado de alucinacion en dominio medico: un modelo de 2,2 B sin validacion clinica no debe usarse para decisiones diagnosticas o terapeuticas.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, etnicos o linguisticos.
- Idiomas no declarados: el soporte del castellano no esta garantizado y puede degradarse frente al ingles.
- Longitud de contexto no publicada: no se puede planificar su uso en tareas de contexto largo sin medir empiricamente el limite efectivo.
- Cero descargas y cero likes en el Hub en el momento de la consulta: no hay evidencia de uso ni de validacion por parte de la comunidad.
- El pipeline image-text-to-text requiere revisar la configuracion del procesador de imagen antes de integrarlo en pipelines propios.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/HodyJJ/Qwen3.5-2B-Base-MED-ChatVector
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Articulo de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
