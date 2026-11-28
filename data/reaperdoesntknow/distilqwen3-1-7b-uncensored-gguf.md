# reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF

## Resumen

DistilQwen3-1.7B-uncensored-GGUF es la variante cuantizada en formato GGUF del modelo DistilQwen3-1.7B-uncensored, desarrollado por Convergent Intelligence LLC (Research Division) bajo el identificador de Hugging Face `reaperdoesntknow`. Se trata de un modelo de lenguaje de tipo transformer con 2.031.739.904 parametros totales, derivado por destilacion de conocimiento a partir de un profesor de mayor tamano (la coleccion DistilQwen documenta destilacion desde Qwen3-30B-A3B) y orientado a despliegue en entornos de borde (edge) y hardware de consumo.

El modelo se presenta como una version "uncensored", es decir, sin los filtros de rechazo habituales de los modelos alineados convencionalmente, lo que lo hace relevante para investigadores que necesitan estudiar el comportamiento del modelo sin capas de rechazo o para tareas creativas y de generacion sin restricciones tematicas. La licencia Apache 2.0 facilita su uso comercial y su modificacion.

Esta ficha cubre especificamente la variante GGUF, que conserva las capacidades del modelo base pero anade opciones de cuantizacion para inferencia en CPU y GPU de gama baja. El repositorio ocupa 9,0 GB e incluye multiples niveles de cuantizacion. La informacion publica disponible es limitada: no se detallan idiomas soportados, benchmarks ni composicion exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3, destilado) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; el repo ocupa 9,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors/BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 2.000 millones de parametros, derivado de la familia Qwen3 y obtenido mediante destilacion de conocimiento (knowledge distillation) desde un profesor de mayor capacidad. La model card menciona tecnicas propietarias denominadas "Discrepancy Calculus" y "Topological Knowledge Distillation", con un operador de discrepancia Df(x) y una descomposicion BV que, segun el autor, informan el pipeline de entrenamiento y quedan codificadas en los pesos, persistiendo tras la cuantizacion. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La variante GGUF aplica cuantizacion post-entrenamiento sobre los pesos del modelo base. Segun la model card, las fronteras estructurales detectadas durante el entrenamiento estan integradas en los pesos y no dependen de la precision numerica, por lo que la cuantizacion preservaria dichas propiedades. No se detalla la metodologia exacta de destilacion ni los hiperparametros empleados.

## Capacidades

- Generacion de texto conversacional (pipeline declarado como conversational).
- Razonamiento y generacion de contenido sin filtros de rechazo (variante "uncensored").
- Destilacion orientada a eficiencia en entornos edge, con enfasis en despliegue en hardware limitado.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue en dispositivos de borde: al ser un modelo de 2.000 millones de parametros en formato GGUF, puede ejecutarse en CPU o en GPU de consumo con cuantizaciones de 4 bits, lo que lo hace adecuado para asistentes locales en portatiles o mini-PC sin conexion a la nube.
- Investigacion sobre alineacion y censura: la variante "uncensored" permite estudiar el comportamiento del modelo sin capas de rechazo, util para analisis academicos sobre sesgos, seguridad y mecanismos de moderacion.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido tematico que los modelos alineados convencionalmente suelen rechazar, gracias a la ausencia de filtros de rechazo.
- Prototipado rapido en local: con llama.cpp u Ollama, un desarrollador puede levantar un endpoint conversacional en minutos para pruebas de integracion antes de escalar a modelos mayores.
- Aplicaciones de privacidad estricta: al ejecutarse completamente en local, el modelo evita el envio de datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Educacion y experimentacion con destilacion: sirve como caso de estudio de tecnicas de knowledge distillation aplicadas a modelos pequenos, comparable con el modelo base en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4, aproximadamente 1,2-1,5 GB; con Q8, en torno a 2,2-2,5 GB; en BF16 (modelo base), unos 4-4,5 GB. Estimaciones basadas en el numero de parametros, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad. En CPU, funciona con llama.cpp sin GPU dedicada.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de gama media con 6 GB o mas, e incluso en iGPU con cuantizaciones agresivas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere soporte en plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DistilQwen3-1.7B-uncensored-GGUF | 2.031.739.904 | no disponible | Apache 2.0 | GGUF | Variante cuantizada, sin filtros |
| DistilQwen3-1.7B-uncensored (base) | 2.031.739.904 | no disponible | Apache 2.0 | safetensors/BF16 | Modelo fuente sin cuantizar |
| Qwen3-1.7B-Thinking-Distil (mismo autor) | no disponible | no disponible | no disponible | no disponible | Variante con modo thinking |
| Qwen3-1.7B-Coder-Distilled-SFT (mismo autor) | no disponible | no disponible | no disponible | no disponible | Especializado en codigo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Al ser una variante "uncensored", carece de filtros de rechazo, lo que implica riesgo de generar contenido inapropiado, ofensivo o danino sin salvaguardas; no recomendado para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion inherente a modelos de este tamano, agravado por la falta de datos de evaluacion publicados.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con ventanas largas.
- Idiomas soportados no declarados; el rendimiento en castellano no esta verificado.
- La model card incluye terminologia matematica propietaria ("Discrepancy Calculus", "Topological Knowledge Distillation") sin validacion externa ni publicacion revisada por pares que la respalde.
- El modelo tiene un numero reducido de descargas y likes (2.938 descargas, 4 likes), lo que sugiere poca validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las obligaciones de atribucion y las implicaciones del uso de contenido generado sin filtros en jurisdicciones concretas.
- La fecha de creacion del repositorio (2026-03-26) y la de actualizacion (2026-11-27) deben contrastarse con el estado real del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored-GGUF
- Modelo base: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Metodologia (DOI): https://doi.org/10.57967/hf/8165
- Qwen3-1.7B-Thinking-Distil: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Qwen3-1.7B-Coder-Distilled-SFT: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
