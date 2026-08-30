# brandonmusic/GLM-5.3-EXL3-TR3-uniform-K3-draft

## Resumen

GLM-5.3-EXL3-TR3-uniform-K3-draft es un modelo de cuantizacion experimental creado por el usuario brandonmusic, que aplica una compresion de 3.0 bpw (bits por peso) sobre los expertos enrutados del modelo base zai-org/GLM-5.3-BF16. Se trata de un artefacto de la campana ShapleyMCG, un proyecto privado de investigacion sobre cuantizacion agresiva mediante codificacion trellis EXL3/TR3. El modelo cuantiza exclusivamente los tensores de los expertos enrutados de las capas 3 a 77 (256 expertos por capa, con matrices gate/up/down), mientras que la capa MTP (Multi-Token Prediction) y todos los tensores no enrutados se mantienen en BF16 original por referencia al modelo base.

La relevancia de este modelo reside en su enfoque de cuantizacion selectiva: en lugar de cuantizar todos los pesos, solo comprime los expertos enrutados, que constituyen la mayor parte de los parametros en una arquitectura MoE. El autor reporta una divergencia KLD media de 0.097893 frente al modelo teacher BF16, lo que sugiere una fidelidad razonable para una cuantizacion de 3.0 bpw. El repositorio tiene un tamano de 68.7 GB e incluye metadatos de reconstruccion, sellos por capa y scripts de reproduccion. Es importante senalar que se trata de un borrador (draft) privado, no de un lanzamiento oficial, y que la licencia ShapleyMCG v1.0 es una licencia personalizada que no es de codigo abierto estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con capa MTP |
| Parametros totales | no disponible (modelo base: GLM-5.3, tamano no especificado) |
| Parametros activos | no disponible (arquitectura MoE con 256 expertos por capa) |
| Longitud de contexto | 1.000.000 tokens (segun especificaciones del modelo base GLM-5.3) |
| Tipos de cuantizacion | EXL3/TR3 trellis-encoded a 3.0 bpw uniforme (K3) para expertos enrutados; BF16 para tensores no enrutados |
| Idiomas soportados | no disponible |
| Licencia | ShapleyMCG v1.0 (licencia personalizada); modelo base bajo GLM-5.3 License (no MIT) |
| Formato de pesos | safetensors (con payloads empaquetados por experto y sellos por capa) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del GLM-5.3 de Z.AI, un transformer MoE con 256 expertos por capa en las capas 3 a 77, disenado para tareas de codificacion y razonamiento de horizonte largo con una ventana de contexto de 1M tokens. La innovacion principal de este artefacto no esta en la arquitectura del modelo base, sino en el metodo de cuantizacion: los expertos enrutados se codifican mediante EXL3/TR3, un esquema de codificacion trellis que aprovecha las hessianas calibradas para distribuir los bits de forma optima. El proceso utiliza ventanas de 2048 tokens para la calibracion y un panel de semillas fijado en 20260823.

El entrenamiento de cuantizacion incluye un carril de confirmacion que reproduce la KLD (divergencia Kullback-Leibler) entre el teacher BF16 y el estudiante con reconstrucciones K3, usando float64 para la reproduccion y evaluando sobre el vocabulario completo de 154.880 tokens con 16 posiciones predichas de 2047. Cada payload empaquetado incluye un cierre de reconstruccion por matriz (codec-fp16 + SHA-256 del BF16 almacenado). No se menciona entrenamiento adicional, RLHF ni DPO; el proceso es puramente de compresion post-entrenamiento.

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del modelo base GLM-5.3, que destaca en tareas de codificacion y razonamiento de horizonte largo.
- Razonamiento multi-paso: el modelo base esta optimizado para tareas de larga duracion (long-horizon tasks), lo que se mantiene en esta version cuantizada.
- Ventana de contexto extendida: soporta hasta 1M tokens, util para documentos extensos y agentes con memoria larga.
- Capa MTP (Multi-Token Prediction): la capa 78 se mantiene en BF16 original, preservando la capacidad de prediccion multi-token del modelo base.
- Soporte de tool calling y agentes: no se especifica explicitamente, pero el modelo base GLM-5.3 incluye estas capacidades; la cuantizacion selectiva no deberia afectarlas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de modelos MoE en hardware limitado: la cuantizacion a 3.0 bpw de los expertos enrutados reduce significativamente el uso de VRAM, permitiendo ejecutar un modelo de la clase GLM-5.3 en GPUs de consumo o profesionales de gama media.
- Investigacion sobre cuantizacion agresiva: el repositorio incluye metadatos de reconstruccion, sellos por capa y scripts de reproduccion, lo que lo convierte en un recurso valioso para estudiar el impacto de la cuantizacion trellis en arquitecturas MoE.
- Evaluacion de fidelidad de cuantizacion: los datos de KLD (media 0.097893, peor ventana 0.253678) permiten comparar la perdida de informacion entre diferentes estrategias de compresion.
- Desarrollo de pipelines de compresion: el enfoque de cuantizar solo expertos enrutados mientras se mantienen los tensores criticos en BF16 puede servir como plantilla para futuros proyectos de cuantizacion selectiva.
- Analisis de reconstruccion por matriz: los cierres de reconstruccion (codec-fp16 + SHA-256) permiten verificar la integridad de cada matriz cuantizada, util en entornos donde la reproducibilidad es critica.
- Experimentacion con codificacion trellis: el esquema EXL3/TR3 con K3 uniforme es una alternativa a metodos de cuantizacion mas convencionales como GPTQ o AWQ, y este repositorio documenta su aplicacion practica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la KLD de confirmacion:

| Metrica | Valor |
|---|---|
| KLD media (teacher BF16 vs student K3) | 0.097893 |
| KLD peor ventana | 0.253678 |
| Vocabulario evaluado | 154.880 tokens |
| Posiciones predichas | 16 x 2047 |

## Requisitos de hardware

- VRAM estimada: no disponible directamente, pero el tamano del repositorio es de 68.7 GB. Con cuantizacion de 3.0 bpw en los expertos enrutados, el modelo en memoria podria ocupar significativamente menos que el BF16 original, aunque la cifra exacta depende de la proporcion de parametros enrutados frente a no enrutados.
- GPU recomendadas: no especificadas. Dado el tamano del modelo base (GLM-5.3), es probable que se necesiten GPUs con al menos 24-48 GB de VRAM incluso cuantizado, como RTX 3090/4090, A6000 o A100.
- Compatibilidad con GPU de consumo: posible en las variantes mas grandes de gama alta (RTX 4090 con 24 GB), pero no confirmado.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un formato safetensors con codificacion EXL3/TR3, requeriria un runtime compatible con esta codificacion especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| brandonmusic/GLM-5.3-EXL3-TR3-uniform-K3-draft | 3.0 bpw EXL3/TR3 (expertos) | 1M tokens | ShapleyMCG v1.0 | Repositorio HuggingFace (draft) |
| brandonmusic/GLM-5.2-EXL3-TR3-3.0bpw | 3.0 bpw EXL3/TR3 | no disponible | no disponible | Repositorio HuggingFace |
| brandonmusic/GLM-5.3-Flash-EXL3-4bpw | 4.0 bpw EXL3/TR3 | no disponible | no disponible | Repositorio HuggingFace |
| zai-org/GLM-5.3-BF16 (modelo base) | BF16 | 1M tokens | GLM-5.3 License (no MIT) | Repositorio HuggingFace oficial |

## Limitaciones y advertencias

- Es un borrador privado (draft) de una campana de investigacion, no un lanzamiento oficial. No tiene descargas ni likes, lo que indica que no ha sido validado por la comunidad.
- La licencia ShapleyMCG v1.0 es personalizada y no es de codigo abierto estandar. El modelo base tiene su propia licencia GLM-5.3 License que no es MIT, lo que puede restringir el uso comercial.
- La cuantizacion a 3.0 bpw es extremadamente agresiva y puede introducir degradacion de calidad en tareas complejas, a pesar de la KLD relativamente baja reportada.
- No se proporcionan benchmarks de rendimiento en tareas estandar, por lo que no es posible evaluar el impacto real de la cuantizacion en capacidades como codigo, matematicas o razonamiento.
- El formato EXL3/TR3 es propietario y no tiene soporte en los runtimes habituales (vLLM, llama.cpp, etc.), lo que limita su uso practico.
- No se especifican los idiomas soportados ni los sesgos potenciales del modelo base.
- La informacion sobre parametros totales, parametros activos y requisitos de hardware no esta disponible, lo que dificulta la planificacion de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brandonmusic/GLM-5.3-EXL3-TR3-uniform-K3-draft
- Repositorio del modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Repositorio relacionado (GLM-5.2 cuantizado): https://huggingface.co/brandonmusic/GLM-5.2-EXL3-TR3-3.0bpw
- Repositorio relacionado (GLM-5.3 Flash cuantizado): https://huggingface.co/brandonmusic/GLM-5.3-Flash-EXL3-4bpw
- Informacion sobre GLM-5.3: https://openlm.ai/glm-5.5/
- Repositorio GitHub de GLM-5.3: https://github.com/GLM-5-3-app/GLM-5.3
