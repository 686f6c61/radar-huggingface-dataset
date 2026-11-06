# blueprint-ai-hq-main/blueprint-ai-hq-main

## Resumen

Blueprint AI HQ es un proyecto de investigación que publica modelos de lenguaje entrenados desde cero sin depender de PyTorch, transformers ni pesos preentrenados. Su primer proyecto, GlassNet, implementa tensores, retropropagación, optimizador y caché KV propios sobre NumPy como único backend de arrays. El repositorio de Hugging Face bajo análisis (`blueprint-ai-hq-main/blueprint-ai-hq-main`) actúa como página paraguas del proyecto y no contiene un modelo con pesos publicados en sí mismo; los checkpoints reales se alojan en repositorios separados bajo la organización `blueprint-ai-bot`.

La propuesta diferencial no es de escala sino de auditabilidad: los modelos incorporan "neuronas de concepto" con nombre que permiten inspeccionar por qué se produjo una respuesta, y el autor publica explícitamente los experimentos fallidos junto a sus métricas. El modelo principal, GlassNet d512-ext6, tiene 15,6 millones de parámetros y alcanza un 37,37 % de precisión en el conjunto de validación (held-out), un resultado que el propio autor califica de insuficiente para uso como asistente.

Es relevante ahora como referencia de investigación reproducible en el ámbito de modelos pequeños e interpretables: toda afirmación numérica se vincula a un fichero de log concreto y cualquier contribución externa se acepta si es reproducible, incluso cuando empeora los resultados propios. No obstante, conviene subrayar que no se trata de un modelo listo para producción ni de un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propio implementado desde cero (tensores, backward pass, optimizador y KV cache propios) sobre NumPy como backend de arrays; sin PyTorch ni transformers |
| Parametros totales | 15,6 M (glassnet-d512-ext6-37pct); 5,9 M (glassnet-d256-2m-24pct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | blueprint-ai-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | no disponible (el repositorio paraguas no publica pesos; los checkpoints están en repositorios separados) |

## Arquitectura y entrenamiento

GlassNet es un transformer de implementación íntegramente propia. El autor especifica que no se reutiliza ningún componente de frameworks de aprendizaje automático: los tensores, la retropropagación, el optimizador y la caché KV están escritos por el equipo, con NumPy como única dependencia de cálculo numérico. La variante principal, d512-ext6, emplea una dimensión de modelo de 512 y seis extensiones (capas o bloques, según la nomenclatura del autor, no detallada en la información disponible), sumando 15,6 M de parámetros. La variante d256-2m tiene 5,9 M de parámetros.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación técnica destacada es la presencia de "neuronas de concepto" con nombre, que permiten rastrear qué unidades internas contribuyen a una respuesta concreta, junto con una política de publicación de todos los experimentos fallidos con sus métricas asociadas. El propio autor reconoce que su arquitectura propietaria perdió frente a una alternativa más simple, y ese resultado queda registrado.

## Capacidades

- Generación de texto a nivel de modelo de lenguaje pequeño (15,6 M de parámetros), con precisión held-out del 37,37 % en la variante principal.
- Interpretabilidad integrada mediante neuronas de concepto nombradas, orientada a inspeccionar la trazabilidad de las respuestas.
- Entrenamiento y inferencia reproducibles desde cero, sin dependencia de frameworks de ML.
- Registro auditable de resultados: cada métrica publicada se asocia a un fichero de ejecución concreto.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe ni modo de razonamiento extendido (thinking mode).
- No se ha documentado capacidad de visión ni audio.

## Casos de uso

- Investigación en interpretabilidad: el modelo permite estudiar neuronas de concepto con nombre y correlacionarlas con salidas concretas, lo que facilita experimentos de análisis de circuitos internos en un modelo pequeño y totalmente inspeccionable.
- Reproducción de experimentos de entrenamiento: al estar implementado sin frameworks, sirve como banco de pruebas educativo para validar retropropagación, optimizadores y caché KV escritos a mano sobre NumPy.
- Docencia de fundamentos de aprendizaje profundo: el código permite recorrer paso a paso el forward y el backward pass sin capas de abstracción de PyTorch o transformers.
- Auditoría de metodología científica: la política de publicar experimentos fallidos con sus números convierte al proyecto en un caso de estudio sobre reproducibilidad y transparencia en publicaciones de modelos.
- Comparación de arquitecturas a pequeña escala: la tabla publicada (d512-ext6 frente a d256-2m) permite contrastar el efecto del tamaño en precisión held-out (37,37 % frente a 24,20 %) con registros de ejecución asociados.
- Prototipado de herramientas de inspección: las neuronas de concepto nombradas pueden integrarse en utilidades de visualización o depuración para modelos de lenguaje de reducido tamaño.

## Benchmarks y rendimiento

| Modelo | Precisión held-out | Parámetros |
|---|---:|---:|
| glassnet-d512-ext6-37pct | 37,37 % | 15,6 M |
| glassnet-d256-2m-24pct | 24,20 % | 5,9 M |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica reportada es la precisión held-out indicada en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 15,6 M de parámetros, el peso en precisión completa (fp32) ronda los 62 MB, y en fp16 unos 31 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos 1 GB de memoria sería suficiente, incluidas GTX 1050, RTX 3060 o superiores.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: el proyecto usa un motor propio sobre NumPy; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión held-out | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| GlassNet d512-ext6 | 15,6 M | no disponible | 37,37 % | blueprint-ai-license-1.0 | Pesos en repositorio separado (`blueprint-ai-bot`) |
| GlassNet d256-2m | 5,9 M | no disponible | 24,20 % | blueprint-ai-license-1.0 | Pesos en repositorio separado (`blueprint-ai-bot`) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada; la comparativa se limita a las dos variantes del propio proyecto.

## Limitaciones y advertencias

- Precisión held-out del 37,37 % en el mejor modelo: el propio autor indica que "no es un asistente todavía", por lo que no es apto para uso conversacional ni para tareas de producción que requieran respuestas fiables.
- Riesgo elevado de alucinación y de salidas incoherentes dado el reducido tamaño y la baja precisión reportada.
- No se han documentado los idiomas soportados ni la longitud de contexto, lo que impide planificar su uso en escenarios multilingües o de contexto largo.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado desde cero sin datos de alineación publicados, no puede descartarse la presencia de sesgos en los datos de entrenamiento.
- La licencia `blueprint-ai-license-1.0` está etiquetada como `other`; no se detallan en la información disponible las condiciones para uso comercial, por lo que debe consultarse el texto completo de la licencia antes de cualquier despliegue.
- El repositorio analizado es una página paraguas del proyecto y no contiene pesos; los checkpoints deben obtenerse de los repositorios de la organización `blueprint-ai-bot`.
- No se documenta compatibilidad con herramientas estándar de inferencia (vLLM, llama.cpp, Ollama, TGI), lo que limita su integración en pipelines convencionales.
- Ausencia de soporte documentado de tool calling, agentes o razonamiento multi-paso.

## Enlaces

- Repositorio Hugging Face analizado: https://huggingface.co/blueprint-ai-hq-main/blueprint-ai-hq-main
- Modelo glassnet-d512-ext6-37pct: https://huggingface.co/blueprint-ai-bot/glassnet-d512-ext6-37pct
- Modelo glassnet-d256-2m-24pct: https://huggingface.co/blueprint-ai-bot/glassnet-d256-2m-24pct
- Repositorio de código y resultados: https://github.com/blueprint-ai-hq-git/glassnet
- Contacto del autor: blueprintai.help1@gmail.com
