# CompiwerAI/Mtrini-SVL-1.1-GGUF

## Resumen

CompiwerAI/Mtrini-SVL-1.1-GGUF es la distribución en formato GGUF de Mtrini-SVL-1.1, un modelo de pesos abiertos de 8.190.735.360 parámetros (~8,19 B) desarrollado por Compiwer AI, un proyecto independiente con sede en Salé (Marruecos). El modelo parte de Qwen3-VL-8B-Instruct y se distribuye desde el checkpoint fusionado CompiwerAI/Mtrini-SVL-1.1-Merged, del que esta publicación es la versión cuantizada. Está orientado a razonamiento, generación de código, matemáticas y conversación multilingüe en inglés, árabe, francés y darija marroquí, y se publica bajo licencia Apache 2.0.

El elemento diferenciador que declara el autor es el SVL (Self-Verifying Loop), un enfoque de generación, verificación, mejora y repetición que busca que el modelo revise y refine sus propias respuestas antes de entregarlas. El repositorio contiene únicamente artefactos GGUF (16,4 GB en total, coherente con pesos en BF16) y está pensado para inferencia totalmente local mediante llama.cpp, LM Studio, KoboldCpp y otros runtimes compatibles con GGUF, sin API ni servicios en la nube.

Su interés práctico está en el nicho que cubre: modelos abiertos de tamaño medio con competencia declarada en darija marroquí, una lengua con muy pocos recursos y escasa representación en modelos abiertos. Como contrapartida, en el momento de redactar esta ficha el repositorio no registra descargas ni valoraciones, no se han publicado resultados de benchmarks y la model card no documenta la longitud de contexto ni los detalles del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer decoder de la familia Qwen3-VL, segun la model card) |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | no aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados en la informacion disponible; el autor indica que existen versiones cuantizadas para reducir memoria, pero el repositorio (16,4 GB) es coherente con un unico peso BF16 |
| Idiomas soportados | en, ar, fr, ary (darija marroqui) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (precision original BF16, segun el autor) |

## Arquitectura y entrenamiento

Mtrini-SVL-1.1 se presenta como un modelo derivado de Qwen3-VL-8B-Instruct, por lo que hereda la arquitectura Qwen3-VL del modelo base. Se trata de un transformer denso de aproximadamente 8 B de parámetros, y la nomenclatura del checkpoint intermedio ("Merged") sugiere una fusión de pesos, si bien la model card no describe el método de merge ni los componentes combinados; se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor.

No hay información publicada sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni sobre el procedimiento exacto con el que se implementa el SVL (Self-Verifying Loop). La model card define el SVL como un enfoque para "animar al modelo a comprobar y refinar sus respuestas" mediante un ciclo de generar, verificar, mejorar y repetir, pero no aclara si se materializa en datos de entrenamiento, en un proceso de RL o en una convención de prompt. Tampoco se detalla si el pipeline multimodal del modelo base (Qwen3-VL es una familia vision-language) se conserva en esta conversión a GGUF; el autor advierte explícitamente de que hay que comprobar el soporte de Qwen3-VL en el runtime antes de ejecutarlo.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, árabe, francés y darija marroquí.
- Razonamiento declarado por el autor, apoyado en el ciclo de autoverificación SVL.
- Generación de código (tag `coding` en el repositorio).
- Matemáticas (tag `mathematics` en el repositorio).
- Capacidades multilingües con foco explícito en darija marroquí, una variedad de bajo recurso.
- Ejecución local y offline sobre runtimes GGUF compatibles.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible (el SVL es un bucle de autoverificación, no un mecanismo agéntico documentado).
- Capacidades de visión: el modelo base es de la familia Qwen3-VL, pero la model card no confirma que la conversión GGUF exponga entrada de imagen; se limita a recomendar verificar el soporte de Qwen3-VL en el runtime.
- Modo de pensamiento o audio: no disponible.

## Casos de uso

- Atención al cliente en darija y árabe marroquí: el modelo puede gestionar conversaciones multi-turno en la variedad lingüística real de los usuarios marroquíes, algo que la mayoría de modelos abiertos de 8 B no cubre de forma específica. La longitud de contexto no está documentada, por lo que conviene validar el comportamiento en diálogos largos antes de llevarlo a producción.
- Generación de código en entornos air-gapped: al distribuirse en GGUF y ejecutarse sin conectividad, encaja en equipos de desarrollo con requisitos de confidencialidad donde no se permite enviar código a APIs externas, siempre que el runtime elegido soporte la arquitectura.
- Apoyo educativo en matemáticas: el ciclo SVL está pensado para que el modelo revise sus propios pasos, lo que resulta útil en tutoría de ejercicios donde se espera ver el razonamiento. El propio autor advierte de que puede equivocarse en cálculos, por lo que requiere supervisión.
- Traducción y adaptación entre francés, árabe estándar, inglés y darija: útil para contenidos de empresa o administración que deben publicarse simultáneamente en los idiomas habituales de Marruecos.
- Investigación sobre procesamiento de lenguas de bajo recurso: sirve como punto de partida para estudiar el rendimiento en darija, comparar con modelos base y analizar el efecto del merge y del SVL, dado que es un modelo abierto con licencia permisiva.
- Despliegue de asistente offline en portátil: con una cuantización de 4 bits el modelo debería caber en GPUs de consumo con 8-12 GB de VRAM o en equipos Apple Silicon con memoria unificada, lo que permite asistentes personales sin conexión.
- Procesamiento de documentación multilingüe: resumen y extracción de información de contratos, facturas o comunicaciones redactadas en árabe o francés, ejecutado en local para evitar la exposición de datos sensibles.
- Prototipado rápido con LM Studio o KoboldCpp: al ser un único fichero GGUF, permite evaluar el modelo en minutos sin infraestructura de servido, útil para decidir si merece la pena integrarlo en un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, ni evaluaciones específicas de darija, y tampoco se han encontrado resultados en la búsqueda web realizada.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del número de parámetros (8,19 B) y del tamaño de los pesos; no proceden de mediciones publicadas por el autor.

- BF16 (16,4 GB de pesos): requiere del orden de 18-20 GB de VRAM contando caché KV y overhead. GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100. No cabe en GPUs de consumo de 8-16 GB.
- Q8_0 (~8,7 GB estimados): en torno a 10-12 GB de VRAM. Encaja en RTX 4080/4090, RTX 3090 y A100.
- Q6_K (~6,8 GB estimados): aproximadamente 8-10 GB de VRAM. Viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070.
- Q5_K_M (~5,7 GB estimados): en torno a 7-8 GB de VRAM. Viable en GPUs de 8 GB con margen limitado.
- Q4_K_M (~4,9 GB estimados): aproximadamente 6-7 GB de VRAM. Cabe en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 2070/3070 y en equipos Apple Silicon con 16 GB de memoria unificada.
- Repositorio tal cual (16,4 GB): no cabe en GPUs de consumo por debajo de 24 GB sin cuantizar.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio y KoboldCpp, tal como indica el autor. Otros runtimes GGUF pueden funcionar, pero hay que verificar previamente el soporte de la arquitectura Qwen3-VL. El soporte de GGUF en servidores de alto rendimiento como vLLM es experimental y no está confirmado para esta arquitectura concreta.
- Latencia y throughput: no disponible. Dependen por completo del hardware, de la cuantización y del runtime, y no se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparación se limita a características verificables. Los campos marcados como "no disponible" no aparecen en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mtrini-SVL-1.1-GGUF | 8,19 B | no disponible | Apache 2.0 | GGUF | Version cuantizada del merge de Compiwer AI; foco en darija |
| Mtrini-SVL-1.1-Merged | no disponible | no disponible | no disponible | no disponible | Checkpoint base del que deriva esta publicacion |
| Mtrini-SVL-1.0-GGUF | no disponible | no disponible | no disponible | GGUF | Version anterior del mismo autor |
| Qwen3-VL-8B-Instruct | ~8 B (familia Qwen3-VL) | no disponible | no disponible en la informacion proporcionada | no disponible | Modelo base declarado por el autor |

No se dispone de comparativas con alternativas de otros desarrolladores (por ejemplo, modelos abiertos de ~8 B con soporte de árabe) porque no se han publicado métricas en la información disponible.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo puede alucinar, equivocarse en matemáticas, generar código defectuoso y malinterpretar la darija. También señala que puede afirmar algo con total seguridad estando completamente equivocado.
- No hay benchmarks publicados ni validación independiente: el repositorio registra 0 descargas y 0 valoraciones, por lo que su calidad real no está contrastada por la comunidad.
- La longitud de contexto no está documentada, lo que impide planificar despliegues que dependan de ventanas largas sin hacer pruebas previas.
- El soporte de la arquitectura Qwen3-VL depende del runtime GGUF: el autor recomienda comprobar la compatibilidad antes de ejecutar el modelo, y una conversión incorrecta puede degradar la calidad o impedir la carga.
- No se documenta si las capacidades multimodales del modelo base sobreviven a la conversión a GGUF; no deben darse por supuestas.
- Las capacidades de tool calling y de uso agéntico no están confirmadas, lo que limita su integración en pipelines que dependan de llamadas a funciones.
- Licencia Apache 2.0: permite uso comercial y modificación, pero obliga a conservar avisos de copyright y licencia, e incluye cláusulas de patentes y de uso de marcas. Es recomendable verificar por separado las condiciones del modelo base Qwen3-VL-8B-Instruct, no detalladas en la información proporcionada.
- La información del repositorio está fechada en septiembre de 2026 y el proyecto parece muy reciente y de un desarrollador independiente; conviene prever que la documentación y el soporte evolucionen o queden sin mantenimiento.
- El proceso de fusión de pesos y el mecanismo SVL no están descritos técnicamente, lo que dificulta reproducir el modelo o auditar su entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CompiwerAI/Mtrini-SVL-1.1-GGUF
- Modelo base (merge): https://huggingface.co/CompiwerAI/Mtrini-SVL-1.1-Merged
- Version anterior en GGUF: https://huggingface.co/CompiwerAI/Mtrini-SVL-1.0-GGUF
- Arbol de ficheros del repositorio: https://huggingface.co/CompiwerAI/Mtrini-SVL-1.0-GGUF/tree/main
- Guia de ejecucion de modelos GGUF en local: https://ggufloader.github.io/how-to-run-gguf-models.html
- Indice de modelos GGUF: https://local-ai-zone.github.io/
