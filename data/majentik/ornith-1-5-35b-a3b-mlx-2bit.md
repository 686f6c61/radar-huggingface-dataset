# majentik/Ornith-1.5-35B-A3B-MLX-2bit

## Resumen

Ornith-1.5-35B-A3B-MLX-2bit es una variante cuantizada en 2-bit (affine, group size 32) del modelo multimodal Ornith-1.5-35B-A3B desarrollado por ornith-ai, preparada para ejecutarse en Apple Silicon mediante la libreria mlx-lm. El modelo base es un mixture-of-experts (MoE) de 35 000 millones de parametros totales que activa aproximadamente 3 000 millones por token, lo que permite un rendimiento cercano a modelos densos mucho mayores con un coste computacional reducido.

La cuantizacion la realiza el autor majentik como complemento a los packs de primera parte publicados por ornith-ai (4-bit, 6-bit y 8-bit en MLX y GGUF). En esta variante, la torre de texto se cuantiza a 2-bit mientras que la torre de vision y el proyector se mantienen en BF16, preservando las capacidades multimodales del modelo. El modelo base se construye sobre Qwen 3.5 y Gemma 4 mediante continued pretraining, mid-training y post-training con reinforcement learning, y supera a modelos comparables como Qwen 3.6-35B en tareas de codificacion y agentes.

Esta ficha documenta exclusivamente la variante 2-bit MLX, que es la que se describe en la informacion proporcionada. No se dispone de datos de benchmarks para esta cuantizacion concreta, ya que el autor indica que las evaluaciones estan pendientes de publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), basada en Qwen 3.5 y Gemma 4, multimodal (image-text-to-text) |
| Parametros totales | 35 000 millones (modelo base); 4 783 452 016 parametros en safetensors (cuantizado 2-bit) |
| Parametros activos | ~3 000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit affine, group size 32 (esta variante); el modelo base admite 3-bit, 4-bit, 5-bit, 6-bit, 8-bit y MXFP4 en otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), cuantizado con mlx-lm convert (mlx-lm 0.31.3) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE que activa aproximadamente 3 000 millones de parametros por token, lo que le permite un equilibrio entre capacidad y eficiencia computacional. Se entrena sobre las arquitecturas de Qwen 3.5 y Gemma 4 mediante un proceso en tres fases: continued pretraining, mid-training y post-training con reinforcement learning. Esta combinacion de arquitecturas y fases de entrenamiento busca maximizar el rendimiento en tareas de codificacion y razonamiento agente, donde el modelo supera a Qwen 3.6-35B en todos los benchmarks de codificacion y agentes, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B en tareas de codificacion de agentes.

La variante 2-bit MLX cuantiza exclusivamente la torre de texto con cuantizacion affine de 2 bits y grupo de 32, mientras que la torre de vision y el proyector se conservan en BF16 para no degradar las capacidades multimodales. El autor aplica un "smoke gate" determinista antes de publicar el pack, que verifica que la generacion de 48 tokens no produce vacios, bucles de repeticion, gibberish multi-escritura o residuos de tokens especiales.

## Capacidades

- Generacion de texto y conversacion multimodal (image-text-to-text): el modelo procesa tanto texto como imagenes como entrada y genera texto como salida.
- Codificacion de software: el modelo base destaca en benchmarks de codificacion, superando a Qwen 3.6-35B en todas las metricas publicadas.
- Razonamiento de agentes: soporta tareas de agente que requieren planificacion de multiples pasos y uso de herramientas.
- Soporte de tool calling / function calling: no se indica explicitamente en la informacion disponible, aunque el modelo base se orienta a tareas de agentes.
- Capacidades multilingues: no se dispone de datos sobre los idiomas soportados.
- Integracion con Apple Silicon: esta variante esta optimizada para ejecutarse en dispositivos Apple con mlx-lm, aprovechando el framework MLX.

## Casos de uso

- **Asistente de codificacion en entornos de desarrollo**: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar codigo, revisar cambios o proponer correcciones. Su bajo numero de parametros activos permite una latencia menor que un modelo denso equivalente, y la cuantizacion 2-bit reduce la huella de memoria para ejecutarse en equipos de escritorio.
- **Chatbot multimodal para soporte tecnico**: dado que el modelo acepta imagenes como entrada, puede recibir capturas de pantalla o diagramas de errores y generar respuestas textuales detalladas, combinando informacion visual y textual en el contexto.
- **Automatizacion de tareas de agente**: su capacidad de razonamiento de multiples pasos lo hace adecuado para pipelines de automatizacion que requieren planificar y ejecutar acciones (p. ej., navegacion web, interaccion con APIs) mediante tool calling.
- **Prototipado rapido en Apple Silicon**: desarrolladores que trabajan en Macs con chip M1/M2/M3 pueden ejecutar el modelo localmente con mlx-lm sin necesidad de GPU externa, lo que facilita experimentacion y pruebas de concepto sin coste de infraestructura.
- **Anotacion y analisis de documentacion tecnica**: el modelo puede resumir o extraer informacion de documentos mixtos (texto e imagenes) como manuales, diagramas de arquitectura o capturas de paneles de monitorizacion.
- **Generacion de contenido educativo**: se puede utilizar para crear explicaciones paso a paso, ejemplos de codigo comentados o tutoriales que combinen texto y diagramas, aprovechando su formacion en codificacion y su capacidad multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante 2-bit MLX. El autor indica que las evaluaciones estan pendientes de un workstream de eval-harness.

Sin embargo, el modelo base Ornith-1.5-35B-A3B reporta en la documentacion publicada que supera a Qwen 3.6-35B en todos los benchmarks de codificacion y agentes, y que supera por amplios margenes a modelos densos como Gemma 4-31B y Muse Glimmer-30B en tareas de codificacion de agentes. No se proporcionan cifras concretas en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no se indica el consumo exacto, pero el repositorio ocupa 13,9 GB y el modelo cuantizado tiene 4 783 452 016 parametros en safetensors. Con cuantizacion 2-bit, se estima que la memoria necesaria para cargar los pesos ronda los 5-6 GB, mas la sobrecarga de la torre de vision BF16 y el runtime de MLX.
- **GPU recomendadas**: no se requiere GPU dedicada; la variante esta disenada para Apple Silicon (M1, M2, M3) con el framework MLX. Funciona en cualquier Mac con chip Apple Silicon y suficiente memoria unificada (se recomienda al menos 8 GB de RAM).
- **En consumer GPU**: no aplicable, ya que MLX es exclusivo de Apple Silicon. Para GPUs NVIDIA se necesitaria la variante GGUF o los pesos originales.
- **Opciones de despliegue**: mlx-lm (generacion por linea de comandos con `mlx_lm.generate`) y biblioteca Python `mlx_lm.load` para integracion en aplicaciones.
- **Latencia y throughput**: no se proporcionan datos. La cuantizacion 2-bit reduce el peso y la memoria, lo que en Apple Silicon deberia permitir una generacion fluida para un modelo de 35B MoE, aunque la degradacion de calidad por la cuantizacion extrema es un factor a considerar.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento en codificacion |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B | ~3B | no disponible | MIT | Supera a Qwen 3.6-35B en todos los benchmarks de codificacion y agentes |
| Qwen 3.6-35B | 35B | no disponible | no disponible | no disponible | Inferior a Ornith-1.5-35B-A3B en codificacion y agentes |
| Gemma 4-31B | 31B | 31B (denso) | no disponible | no disponible | Inferior en agentic coding a Ornith-1.5-35B-A3B |
| Muse Glimmer-30B | 30B | 30B (denso) | no disponible | no disponible | Inferior en agentic coding a Ornith-1.5-35B-A3B |

La comparativa se basa en los datos publicados para el modelo base. La variante 2-bit MLX no tiene datos propios de rendimiento.

## Limitaciones y advertencias

- La cuantizacion 2-bit es una reduccion extrema que degrada significativamente la calidad de generacion respecto al modelo en FP16 o BF16. El propio autor recomienda los packs de primera parte de ornith-ai (4-bit, 6-bit, 8-bit) para un equilibrio entre rendimiento y calidad.
- No se han publicado benchmarks para esta variante, por lo que no se puede cuantificar la perdida de rendimiento respecto al modelo base.
- Los idiomas soportados no se especifican, por lo que no se garantiza un comportamiento correcto fuera de los idiomas principales (presumiblemente ingles, dado el origen del modelo).
- La licencia MIT permite uso comercial, pero se recomienda revisar la licencia del modelo base y de los datos de entrenamiento.
- La longitud de contexto no esta documentada, lo que impide conocer los limites de ventana de atencion para tareas de contexto largo.
- El modelo esta optimizado para Apple Silicon; no se puede ejecutar en GPU NVIDIA sin convertir los pesos a otro formato (GGUF, etc.).
- La generacion con cuantizacion 2-bit puede producir artefactos, alucinaciones o repeticiones anormales en comparacion con el modelo completo, aunque el autor ha verificado un "smoke" de coherencia basico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/majentik/Ornith-1.5-35B-A3B-MLX-2bit
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante 6-bit de primera parte: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit
- Otras variantes del autor: [majentik/Ornith-1.5-35B-A3B-MLX-3bit](https://huggingface.co/majentik/Ornith-1.5-35B-A3B-MLX-3bit), [majentik/Ornith-1.5-35B-A3B-MLX-5bit](https://huggingface.co/majentik/Ornith-1.5-35B-A3B-MLX-5bit), [majentik/Ornith-1.5-35B-A3B-MLX-MXFP4](https://huggingface.co/majentik/Ornith-1.5-35B-A3B-MLX-MXFP4)
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/ornith-1.5-35b-a3b-ornith-ai
- Imagen Docker: https://hub.docker.com/r/ai/ornith-1.5
- API de inferencia en FriendliAI: https://friendli.ai/models/ornith-ai/Ornith-1.5-35B-A3B
