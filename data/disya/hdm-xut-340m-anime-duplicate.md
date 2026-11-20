# Disya/HDM-xut-340M-anime-Duplicate

## Resumen

HDM-xut-340M-anime-Duplicate es un modelo de difusion texto-a-imagen especializado en estilo anime, desarrollado por Disya como una copia (duplicado) del modelo original HDM-xut-340M-anime de KBlueLeaf. Forma parte del proyecto HDM (Home made Diffusion Model), cuyo objetivo es investigar recetas de entrenamiento que permitan preentrenar modelos T2I en hardware de consumo o servidores de segunda mano economicos. El modelo emplea una arquitectura propia denominada XUT (Cross-U-Transformer), un backbone transformer disenado para generacion multimodal con un diseno minimalista y la tecnica TREAD para reducir el coste computacional.

Con 343.176.720 parametros totales (aproximadamente 340M), este modelo se posiciona como uno de los modelos de difusion texto-a-imagen mas pequenos orientados a un dominio especifico como es el anime. Segun la model card, el entrenamiento pudo completarse con un presupuesto de computo de hasta 650 USD en vast.ai, lo que lo convierte en una alternativa de bajo coste frente a modelos como Stable Diffusion o los modelos de anime de mayor tamano.

El modelo se distribuye en formato diffusers con pesos safetensors, esta etiquetado con licencia cc y solo declara soporte para ingles. El repositorio ocupa 21,5 GB, lo que sugiere la presencia de multiples variantes de pesos o checkpoints ademas del modelo principal. Es relevante para desarrolladores que necesitan generar imagenes estilo anime con recursos limitados de GPU o que quieren estudiar recetas de entrenamiento eficientes para modelos de difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XUT (Cross-U-Transformer), transformer para generacion multimodal con tecnica TREAD |
| Parametros totales | 343.176.720 (aprox. 340M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc |
| Formato de pesos | safetensors (libreria diffusers, pipeline HDMXUTPipeline) |

## Arquitectura y entrenamiento

El modelo se basa en XUT (Cross-U-Transformer), un backbone transformer disenado especificamente para modelos generativos multimodales como texto-a-imagen. La arquitectura incorpora la tecnica TREAD (referenciada en el paper arXiv:2501.04765), que reduce el coste computacional del entrenamiento y la inferencia mediante el procesamiento selectivo de tokens. El diseno es deliberadamente minimalista para que el preentrenamiento sea viable en hardware de consumo o servidores de segunda mano de bajo coste; la model card cifra el presupuesto de computo en un maximo de 650 USD en vast.ai.

El entrenamiento utilizo dos datasets de imagenes de anime: Amber-River/Pixiv-2.6M y KBlueLeaf/danbooru2023-webp-4Mpixel. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion precisa del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en modelos de difusion). Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de TREAD. El modelo se presenta como un "base" T2I, lo que implica que esta pensado como punto de partida para fine-tuning posterior mas que como modelo final pulido.

## Capacidades

- Generacion de imagenes texto-a-imagen especializada en estilo anime.
- Modelo base (base T2I) disenado para servir como punto de partida para fine-tuning o entrenamiento de LoRAs.
- Soporte de la libreria diffusers mediante el pipeline HDMXUTPipeline.
- Integracion con ComfyUI a traves del repositorio HDM-ext.
- Capacidad multimodal texto-imagen (el backbone XUT esta disenado para generacion multimodal).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, thinking mode, vision, audio ni otras capacidades de lenguaje mas alla del acondicionamiento textual para generacion de imagen.

## Casos de uso

- Generacion de ilustraciones anime en hardware de consumo: con solo 340M de parametros, el modelo puede ejecutarse en GPUs consumer modestas, lo que permite a artistas y aficionados generar imagenes sin depender de servicios en la nube.
- Fine-tuning para estilos concretos: al ser un modelo base pequeno, es adecuado para entrenar LoRAs o checkpoints especializados en personajes, paletas o estilos de anime con presupuestos de computo reducidos.
- Prototipado rapido de pipelines T2I: desarrolladores que quieran validar una arquitectura de generacion de imagen antes de escalar a modelos mayores pueden usar este modelo como banco de pruebas barato.
- Investigacion sobre entrenamiento eficiente: el proyecto HDM documenta una receta de preentrenamiento T2I de bajo coste (hasta 650 USD), por lo que el modelo sirve como referencia reproducible para estudiar tecnicas como TREAD.
- Generacion de assets para videojuegos o contenido derivado de anime: util para producir bocetos o variaciones de personajes en flujos de trabajo iterativos donde el coste por imagen importa.
- Despliegue en entornos con VRAM limitada: al ser un modelo de 340M de parametros, cabe en GPUs de gama baja o incluso en configuraciones con poca memoria, lo que facilita demos y aplicaciones locales.
- Educacion y divulgacion: util para explicar el funcionamiento interno de un modelo de difusion texto-a-imagen sin requerir infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 343M de parametros en precision completa (fp32) el modelo ronda 1,4 GB de pesos, y en fp16 aproximadamente 0,7 GB, aunque el consumo real depende del pipeline completo (VAE, text encoder y resolucion de imagen).
- GPU recomendadas: no disponible; por tamano, deberia caber en GPUs consumer de gama media y baja (por ejemplo, RTX 3060, RTX 4060 o incluso inferiores), aunque no se confirma en la informacion proporcionada.
- Cabe en GPU consumer: previsiblemente si, dado el reducido numero de parametros, aunque no se especifican modelos concretos ni requisitos minimos.
- Opciones de despliegue: diffusers (pipeline HDMXUTPipeline) y ComfyUI mediante HDM-ext. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI (las etiquetas incluyen text-generation-inference, pero no se detalla su uso para este modelo de difusion).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HDM-xut-340M-anime (original) | aprox. 340M | no disponible | no disponible | cc | Hugging Face (KBlueLeaf/HDM-xut-340M-anime) |
| HDM-xut-340M-anime-Duplicate (este) | 343.176.720 | no disponible | no disponible | cc | Hugging Face (Disya/HDM-xut-340M-anime-Duplicate) |
| Stable Diffusion 1.5 | aprox. 860M (UNet) | no disponible | no disponible | CreativeML Open RAIL-M | Ampliamente disponible |
| Modelos anime T2I de mayor tamano | no disponible | no disponible | no disponible | variable | variable |

La comparativa se limita a senalar que este modelo es un duplicado del HDM-xut-340M-anime original, con el que comparte arquitectura y parametros. No se dispone de datos de benchmarks que permitan comparar rendimiento con Stable Diffusion u otras alternativas.

## Limitaciones y advertencias

- Es un duplicado de otro modelo (HDM-xut-340M-anime de KBlueLeaf); no aporta mejoras ni diferencias tecnicas documentadas respecto al original.
- Modelo base (base T2I): la calidad de generacion sera inferior a la de modelos pulidos o fine-tuneados, y probablemente requiera ajuste adicional para resultados finales.
- Sesgos conocidos: no documentados, pero al entrenarse con datasets de anime (Pixiv y Danbooru) puede heredar sesgos de estilo, representacion y contenido de esas fuentes.
- Riesgo de alucinacion: no aplica en el sentido de texto, pero puede generar imagenes incoherentes o anatomicamente incorrectas dada su escala reducida.
- Limitaciones de idioma: solo declara soporte de ingles, por lo que los prompts en castellano pueden funcionar peor.
- Restricciones de licencia: la licencia "cc" no especifica la variante concreta (CC BY, CC BY-SA, etc.), lo que genera incertidumbre sobre el uso comercial; conviene verificar los terminos exactos antes de usarlo en produccion.
- Repositorio de 21,5 GB para un modelo de 340M de parametros: sugiere pesos duplicados o checkpoints extra; revisar el contenido antes de descargar.
- Sin descargas ni likes en el momento de la consulta, y creado en 2026: trazabilidad y mantenimiento inciertos.
- No se documentan requisitos de hardware ni cuantizaciones, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Disya/HDM-xut-340M-anime-Duplicate
- Modelo original: https://huggingface.co/KBlueLeaf/HDM-xut-340M-anime
- Codigo fuente HDM: https://github.com/KohakuBlueleaf/HDM
- Codigo fuente HDM para ComfyUI: https://github.com/KohakuBlueleaf/HDM-ext
- Informe tecnico: https://github.com/KohakuBlueleaf/HDM/blob/main/TechReport.md
- Paper TREAD: https://arxiv.org/abs/2501.04765
- Dataset Pixiv: https://huggingface.co/datasets/Amber-River/Pixiv-2.6M
- Dataset Danbooru: https://huggingface.co/datasets/KBlueLeaf/danbooru2023-webp-4Mpixel
