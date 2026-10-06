# abbuibuibui/ChikaFujiwara-Lora

## Resumen
ChikaFujiwara-Lora es un adaptador LoRA de personaje para el modelo de difusión waiIllustriousSDXL v17, desarrollado por el usuario abbuibuibui. Reproduce a Chika Fujiwara, personaje de Kaguya-sama: Love is War, y se distribuye como una colección de diez checkpoints únicos resultantes de cuatro rondas de entrenamiento con reanudación. El repositorio ocupa 2.3 GB y contiene pesos en formato safetensors, una guía de uso y una evaluación comparativa pública.

El modelo resuelve la generación consistente de imágenes del personaje en distintos atuendos y escenas. La evaluación recomienda el checkpoint R4E6 (chika_fujiwara_rE6S951-000006.safetensors) con una intensidad de LoRA de 0.8. Es un derivado hecho por fans, no oficial, y se publica bajo licencia CreativeML OpenRAIL-M. Los idiomas declarados son inglés y chino, aunque los prompts de generación suelen escribirse en inglés.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) para modelo de difusión SDXL (waiIllustriousSDXL v17) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión) |
| Tipos de cuantización | no disponible (pesos safetensors, típicamente fp16) |
| Idiomas soportados | en, zh (documentación y etiquetas) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Modelo base | waiIllustriousSDXL v17 |
| Tamaño del repositorio | 2.3 GB |
| Checkpoint recomendado | chika_fujiwara_rE6S951-000006.safetensors (R4E6) |
| SHA-256 del checkpoint recomendado | 8aba943186521bee0ebb98a41f13ff3ac7bd476bb6c4213c30a95a7422529ad7 |
| Intensidad de LoRA recomendada | 0.8 |
| Trigger de identidad | chika_fujiwara |
| Tokens de atuendo | chika_hoodie, chika_school_uniform, chika_casual, chika_dress |
| Resolución de ejemplo | 832x1216 |
| Sampler, pasos y CFG de ejemplo | Euler a, 28 pasos, CFG 4.5, CLIP skip 2 |

## Arquitectura y entrenamiento
Se trata de un LoRA, una técnica de adaptación de bajo rango que inyecta matrices entrenables en las capas del modelo base de difusión. El modelo base es waiIllustriousSDXL v17, un fine-tune de SDXL orientado a ilustración de estilo anime. El entrenamiento se realizó sobre el dataset ChikaFujiwara-Dataset, que incluye imágenes y sus correspondientes leyendas. Las leyendas utilizaron `keep_tokens = 2`, lo que implica que los dos primeros tokens (probablemente identidad y atuendo) se mantienen fijos durante el entrenamiento. No se especifican el número de imágenes, los pasos de entrenamiento ni la tasa de aprendizaje.

El proceso de desarrollo constó de cuatro rondas con reanudación, generando diez checkpoints únicos. La evaluación se hizo en dos fases: primero se cribaron los diez checkpoints a intensidad 0.8 sobre un retrato frontal, una toma de cuerpo completo con sudadera y otra con uniforme escolar. Solo R3E5, R4E6 y R4Final avanzaron. Después se generaron 120 imágenes (tres candidatos, diez escenas fijas, cuatro intensidades: 0.4, 0.6, 0.8 y 1.0) para comparar identidad, control de atuendos y comportamiento en escenas nocturnas. No se emplearon técnicas de RLHF ni DPO, propias de modelos de lenguaje; el entrenamiento de difusión usa típicamente pérdida de error cuadrático medio. La innovación destacable es la combinación de un trigger de identidad con tokens de atuendo y una evaluación sistemática de las rondas de reanudación.

## Capacidades
- Generación de imágenes de Chika Fujiwara con identidad consistente: pelo rosa, ojos azules, coleta lateral y lazo negro.
- Control de atuendos mediante tokens específicos: chika_hoodie (sudadera clara), chika_school_uniform (uniforme escolar Shuchiin), chika_casual (ropa casual) y chika_dress (vestido).
- Soporte de distintas composiciones: retrato, cuerpo completo, sentada, calle nocturna, perfil.
- Integración en pipelines de difusión SDXL: diffusers, Automatic1111, ComfyUI, entre otros.
- Compatible con ADetailer para mejora de rostro, siempre que se refuerce el trigger y los rasgos faciales en el prompt facial.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.
- Capacidades multilingües limitadas a la documentación (inglés y chino); los prompts de generación deben formularse preferentemente en inglés para el modelo base.
- No dispone de modo thinking, visión, audio ni otras capacidades propias de modelos multimodales de lenguaje.

## Casos de uso
- Ilustración de fan art: generar imágenes del personaje en poses y escenarios variados usando el trigger de identidad y los tokens de atuendo. Es adecuado porque mantiene la consistencia facial y de vestuario en distintas composiciones.
- Diseño de personaje para cómics o doujinshi: crear viñetas con apariencia coherente del personaje a lo largo de una narrativa. La posibilidad de fijar la identidad con `chika_fujiwara` y alternar atuendos facilita la continuidad visual.
- Creación de avatares o iconos personalizados: producir retratos cuadrados o verticales con el personaje para su uso en perfiles. La resolución de ejemplo 832x1216 y el sampler Euler a ofrecen resultados equilibrados en rostro y detalle.
- Pruebas de pipelines de difusión: evaluar el impacto de un LoRA en la generación SDXL, comparando intensidades y checkpoints. El repositorio incluye diez checkpoints y una evaluación pública que sirve como referencia metodológica.
- Investigación en entrenamiento de LoRA: estudiar el efecto de las rondas de reanudación y la selección de checkpoints en la calidad final. La documentación detalla el cribado y la comparación cualitativa, lo que aporta un caso práctico.
- Generación de fondos de pantalla o pósteres: crear imágenes en formato vertical u horizontal con el personaje en escenas nocturnas o interiores. La evaluación del checkpoint R4E6 cubre específicamente la calle nocturna y el retrato.
- Prototipado rápido de conceptos para proyectos de animación o videojuegos: obtener bocetos visuales del personaje en distintos estados de ánimo o vestuario, siempre respetando los derechos de la obra original.
- Demostraciones de integración en interfaces gráficas: mostrar el uso del LoRA en ComfyUI o Automatic1111 con los parámetros recomendados (0.8 de intensidad, 28 pasos, CFG 4.5).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la información disponible. La evaluación incluida es cualitativa y se basa en 120 imágenes generadas con semillas fijas y parámetros controlados. A continuación se resume el veredicto de la comparación horizontal:

| Candidato | Resultado observado | Decisión |
|---|---|---|
| R3E5 | Retrato más vivo; gráfico de sudadera y estampado nocturno más débiles que R4E6. | Alternativo. |
| R4E6 | Identidad más consistente en retrato, sudadera, uniforme escolar, sentada y calle nocturna a 0.8. | Recomendado por defecto a 0.8. |
| R4Final | Casi idéntico a R4E6, con más floración (bloom) a 1.0. | Alternativo archivado. |

No se proporcionan métricas objetivas como precisión, recall o puntuaciones de similitud; la evaluación se apoya en inspección visual y criterios subjetivos documentados.

## Requisitos de hardware
- No se especifican requisitos de hardware en la model card. Los siguientes valores son orientativos para modelos SDXL con LoRA y no están confirmados por el autor.
- VRAM estimada para inferencia: en fp16, SDXL suele requerir entre 8 y 10 GB de VRAM para generar a 832x1216. Con optimizaciones como xformers o medvram, puede funcionar en GPUs con 6-8 GB.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100. Cualquier GPU con al menos 8 GB de VRAM es adecuada para un uso básico.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070.
- Opciones de despliegue: diffusers (Python), Automatic1111, ComfyUI, InvokeAI, entre otras interfaces compatibles con SDXL y LoRA.
- Latencia y throughput estimados: no disponible. Dependen de la GPU, la resolución, el número de pasos y las optimizaciones aplicadas.

## Comparativa con modelos similares
No se proporcionan comparativas con otros modelos en la información disponible. Como referencia, se puede contrastar con el modelo base waiIllustriousSDXL v17 sin el LoRA, que no reproduce la identidad del personaje, o con otros LoRA de personaje entrenados sobre la misma familia de modelos, pero no hay datos objetivos publicados en esta ficha. La licencia y disponibilidad del modelo base no se detallan en la información proporcionada.

## Limitaciones y advertencias
- Es un derivado hecho por fans, no un producto oficial. Los derechos del personaje y de la obra original pertenecen a sus respectivos titulares.
- La licencia CreativeML OpenRAIL-M permite el uso comercial, pero con restricciones de uso (prohibición de usos dañinos, necesidad de incluir la licencia, etc.). No exime de posibles infracciones de derechos de autor sobre el personaje.
- Sesgos conocidos: al entrenarse con un dataset específico, puede reproducir sesgos de representación en proporciones corporales, estilo de dibujo o paleta de colores.
- Riesgo de alucinación visual: puede generar anatomías incorrectas, dedos extra, artefactos en el rostro o floración excesiva, especialmente a intensidades superiores a 0.8 o sin un prompt negativo adecuado.
- Limitaciones de contexto: no aplica un contexto de texto, pero el LoRA puede perder consistencia si se usa con modelos base distintos a la familia Illustrious o NoobAI.
- Idioma: los prompts deben formularse en inglés para obtener los mejores resultados; la documentación está en inglés y chino, pero el modelo no procesa lenguaje natural.
- Caveats para producción: requiere ajustar la intensidad (0.8 recomendada), el sampler y los pasos. El uso de ADetailer en el rostro puede derivar la identidad si no se refuerza el trigger `chika_fujiwara` junto con los rasgos faciales.
- No se especifican el número de parámetros del LoRA ni el consumo exacto de VRAM, lo que dificulta el dimensionamiento preciso de infraestructura.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/ChikaFujiwara-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/ChikaFujiwara-Dataset
- README en chino: https://huggingface.co/abbuibuibui/ChikaFujiwara-Lora/blob/main/README_zh.md
- Evaluación horizontal completa (en chino): https://huggingface.co/abbuibuibui/ChikaFujiwara-Lora/blob/main/evaluation/横向测评记录.md
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
