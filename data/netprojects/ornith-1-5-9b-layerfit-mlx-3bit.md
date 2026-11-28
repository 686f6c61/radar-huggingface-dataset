# netprojects/Ornith-1.5-9B-LayerFit-MLX-3bit

## Resumen

Ornith-1.5-9B-LayerFit-MLX-3bit es una cuantizacion de 3 bits del modelo Ornith-1.5-9B, un modelo de 9.409.813.744 parametros (9B) orientado a agentes de codigo y desarrollado por el equipo Ornith. La version aqui descrita la publica netprojects (Paris Michalas) y esta optimizada para Apple Silicon mediante MLX, la libreria de aprendizaje automatico de Apple. El modelo base emplea la arquitectura qwen3_5, segun los metadatos del repositorio, y acepta entrada de texto e imagen (pipeline image-text-to-text).

La innovacion principal de esta build es LayerFit, una tecnica de cuantizacion por capas desarrollada por NetProjects. En lugar de asignar el mismo numero de bits a todas las capas, LayerFit mide la sensibilidad de cada componente (atencion, bloques de atencion lineal, MLP de cada capa, embeddings y cabeza de salida) y distribuye el presupuesto de bits donde mas reduce el error. El resultado ocupa 4.8 GB en disco y esta pensado para ejecutarse en Macs con 8 GB (ajustado) o 16 GB de memoria unificada.

El modelo es relevante para desarrolladores que quieren ejecutar localmente en hardware Apple un agente de codigo con capacidad de razonamiento (thinking mode) y vision, sin depender de la nube. Su licencia MIT y su compatibilidad con mlx-vlm (incluido un servidor compatible con la API de OpenAI) facilitan su integracion en flujos de trabajo de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun tags del repo); incluye bloques de atencion lineal segun la model card |
| Parametros totales | 9.409.813.744 (9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (LayerFit, cuantizacion por capas); existe build alternativa de 4 bits |
| Idiomas soportados | no disponible (la model card menciona "held-out passages in several languages" para la evaluacion, sin enumerar idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |
| Tamano en disco | 4.8 GB |
| Memoria recomendada | 8 GB (ajustado) o 16 GB de memoria unificada en Mac |
| Modelo base | ornith-ai/Ornith-1.5-9B |
| Libreria | mlx / mlx-vlm (probado con mlx-vlm 0.7.11) |
| Entrada | texto e imagen (image-text-to-text) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer de 9B parametros de la familia qwen3_5, segun los tags del repositorio. La model card de esta cuantizacion menciona explicitamente "bloques de atencion lineal" junto a la atencion convencional, lo que sugiere una arquitectura hibrida con capas de atencion lineal y atencion completa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la model card original de ornith-ai/Ornith-1.5-9B, que no se incluye en la informacion proporcionada.

La innovacion tecnica de esta build es LayerFit. El proceso mide cuanto sufre cada parte del modelo (atencion, bloques de atencion lineal, MLP de cada capa, embeddings y cabeza de salida) a bajos bits y asigna el presupuesto de cuantizacion donde mas ayuda. Segun los datos del autor, con el mismo tamano y el mismo test, LayerFit 3-bit alcanza un 80.7% de acuerdo top-1 con bf16 frente al 72.5% de una cuantizacion estandar de 3 bits, y reduce el error KL de 0.5210 a 0.2301 (un 56% menos). La receta exacta esta en `layerfit-recipe.json` del repositorio. Las mediciones se realizaron en un MacBook Pro M5 Max el 28 de noviembre de 2026.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento activado por defecto (``).
- Generacion de codigo y tareas de agente de programacion (tags coding y agent).
- Entrada de imagen ademas de texto (image-text-to-text), con soporte de `--image` en mlx_vlm.generate.
- Conversacion multi-turno (tag conversational).
- Despliegue como servidor compatible con la API de OpenAI mediante `mlx_vlm.server`, apto para agentes de codigo.
- Capacidades multilingues: la model card menciona evaluacion con pasajes en varios idiomas, pero no se enumeran los idiomas soportados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Agente de codigo local en Mac: el modelo puede ejecutarse como servidor compatible con OpenAI (`mlx_vlm.server`) y conectarse a herramientas de agente de codigo, aprovechando su entrenamiento especifico para tareas de agente (SWE-bench Verified 70.6 en el modelo completo) sin enviar codigo a la nube.
- Asistencia de programacion en el editor: con 4.8 GB en disco y funcionamiento en 8-16 GB de memoria unificada, cabe en un MacBook y permite autocompletado, generacion de funciones y explicacion de codigo con baja dependencia de red.
- Razonamiento paso a paso con thinking mode: util para depuracion de errores complejos o planificacion de refactorizaciones, ya que el modelo genera una cadena de pensamiento antes de responder.
- Analisis de capturas de pantalla y diagramas: al aceptar entrada de imagen, puede interpretar mockups de interfaz, diagramas de arquitectura o capturas de errores y generar codigo o explicaciones a partir de ellas.
- Prototipado offline en entornos sin conectividad: al ejecutarse totalmente en local, sirve para desarrollo en portatiles sin acceso a APIs externas o con requisitos de privacidad estrictos.
- Evaluacion y experimentacion con cuantizacion: investigadores pueden comparar esta build LayerFit 3-bit con la de 4 bits o con el modelo bf16 para estudiar el impacto de la cuantizacion por capas en tareas de codigo y razonamiento.

## Benchmarks y rendimiento

Datos publicados en la model card de esta cuantizacion (modelo completo en precision original, publicados por el equipo Ornith):

| Benchmark | Resultado (modelo completo) |
|---|---|
| SWE-bench Verified (OpenHands) | 70.6 |
| Terminal-Bench 2.1 (Terminus-2) | 46.2 |
| SWE-bench Pro | 47.5 |
| NL2Repo | 32.4 |

Comparativa de cuantizacion publicada por NetProjects (mismo tamano, mismo test):

| Metrica | 3-bit estandar | LayerFit 3-bit |
|---|---|---|
| Acuerdo top-1 con bf16 | 72.5% | 80.7% |
| Error KL | 0.5210 | 0.2301 (56% menor) |
| GSM8K (20) | 14/20 | 18/20 |

No se han publicado resultados de benchmarks del modelo cuantizado en SWE-bench ni en Terminal-Bench en la informacion disponible.

## Requisitos de hardware

- Memoria unificada recomendada: 8 GB (ajustado) o 16 GB en Mac; tamano en disco de 4.8 GB.
- Hardware objetivo: Apple Silicon (MLX); probado en MacBook Pro M5 Max con mlx-vlm 0.7.11.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible; esta build es especifica de MLX y no se indica soporte CUDA.
- Cabe en GPU de consumo: no aplica a esta build (formato MLX para Apple Silicon); existe una build de 4 bits (5.9 GB) que requiere 16 GB.
- Opciones de despliegue: `mlx_vlm.generate` para inferencia por linea de comandos y `mlx_vlm.server` como servidor compatible con OpenAI en el puerto 8080.
- Latencia y throughput: no disponibles; solo se indica que las mediciones se hicieron en un MacBook Pro M5 Max.
- Parametros de muestreo sugeridos para codigo: temperature 0.6, top_p 0.95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-LayerFit-MLX-3bit (esta build) | 9B | no disponible | 3 bits LayerFit, 4.8 GB | MIT | Hugging Face, MLX |
| Ornith-1.5-9B-LayerFit-MLX-4bit | 9B | no disponible | 4 bits LayerFit, 5.9 GB | MIT | Hugging Face, MLX |
| ornith-ai/Ornith-1.5-9B (original) | 9B | no disponible | bf16 | MIT | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits introduce perdida de calidad respecto al bf16: el acuerdo top-1 con el original es del 80.7%, no del 100%, y el GSM8K baja a 18/20 frente al modelo completo.
- El rendimiento en tareas de agente (SWE-bench, Terminal-Bench) solo esta publicado para el modelo completo; no hay datos del modelo cuantizado en esas tareas.
- El modelo esta pensado para Apple Silicon y MLX; no es directamente utilizable en GPU NVIDIA ni en despliegues CUDA estandar.
- Con 8 GB de memoria unificada el funcionamiento es "ajustado" segun el autor; se recomienda 16 GB para margen.
- No se detallan los idiomas soportados ni los sesgos conocidos del modelo base.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan evaluaciones especificas de factualidad.
- El modo de pensamiento esta activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva.
- Licencia MIT permite uso comercial, pero el aviso NOTICE describe la conversion y LayerFit es una marca registrada de NetProjects; el proyecto no esta afiliado al equipo Ornith ni a DeepReinforce.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria del rendimiento de esta build.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Ornith-1.5-9B-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Ornith-1.5-9B-LayerFit-MLX-4bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- NetProjects: https://netprojects.com
- Libreria mlx-vlm: https://github.com/Blaizzy/mlx-vlm
