# Sarim-Hash/advsim2real-stage2-ablation-adv1epoch-exec2epochs-iter3-nprop150

## Resumen

Este repositorio contiene un conjunto de adaptadores LoRA (librería PEFT) entrenados sobre el modelo base Qwen/Qwen3.5-4B como parte del procedimiento experimental denominado AdVSim2Real, en su fase Stage 2. No se trata de un modelo completo con pesos propios, sino de artefactos de entrenamiento: adaptadores de bajo rango que deben aplicarse sobre el checkpoint del modelo base indicado. El repositorio ocupa 0,2 GB y agrupa, cuando están disponibles, los adaptadores `adv_v1`, `exec_v1`, `adv_v2`, `exec_v2`, `adv_v3` y `exec_v3`.

El objetivo del experimento es la co-evolución de un adversario y un ejecutor mediante aprendizaje por señales de política, con un currículum congelado en el modelo base y un modelo de mundo externo (WebWorld-14B) que proporciona el entorno de simulación. Esta variante concreta es una ablación sin Stage 1: ni el currículum ni los primeros adaptadores de adversario y ejecutor se inicializan con adaptadores previos de la fase 1, sino directamente desde el modelo base.

La relevancia del repositorio es principalmente metodológica: documenta una configuración reproducible (150 propuestas por iteración, 1 época de adversario, 2 épocas de ejecutor, 3 iteraciones) y expone metadatos de entrenamiento por adaptador. El propio autor advierte de que son artefactos experimentales y que su publicación no implica una puntuación evaluada de forma independiente. No hay pipeline, licencia ni idiomas declarados, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-4B; no se detalla la arquitectura interna del modelo base |
| Parametros totales | No disponible para los adaptadores; el modelo base se denomina 4B, sin confirmación en la informacion proporcionada |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | No disponible para el modelo base; la longitud maxima de entrenamiento del ejecutor es de 4096 tokens |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json + training.json por adaptador |
| Modelo base | Qwen/Qwen3.5-4B, revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Libreria | peft |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de PEFT que se aplica sobre Qwen/Qwen3.5-4B fijado en una revisión concreta. El procedimiento es una co-evolución de dos roles: un adversario que propone tareas o escenarios y un ejecutor que los resuelve, ambos entrenados por señales de política dentro de un entorno cuya dinámica la aporta el modelo de mundo WebWorld-14B. La variante aquí publicada es la ablación sin Stage 1: el currículum permanece congelado en el modelo base durante todo el proceso, y el primer ejecutor y el primer adversario también parten del modelo base, sin inicialización desde adaptadores de la fase previa. Los adversarios posteriores continúan el adaptador de adversario de la iteración anterior, y los ejecutores posteriores hacen lo mismo con el adaptador de ejecutor precedente.

La configuración numérica declarada es: 150 propuestas por iteración, 1 época de adversario, 2 épocas de ejecutor y 3 iteraciones (450 propuestas en total). Los ajustes fijos adicionales son 4 rollouts limpios por tarea, grupos de adversario de tamaño 6, grupos de ejecutor de tamaño 4, 2 prompts o tareas por lote y una longitud máxima de entrenamiento del ejecutor de 4096 tokens. Cada adaptador incluye metadatos con los pasos intentados, las actualizaciones reales del optimizador y contadores de señal de política, y el autor advierte de que un calendario completado puede incluir actualizaciones de optimizador omitidas. Las carpetas de adaptador solo aparecen cuando el calendario completo termina y el checkpoint raíz supera las comprobaciones de finalización y de hash de bytes, de modo que el repositorio puede existir antes de que el primer adaptador esté listo. No se especifican el número total de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO al margen del esquema de co-evolución descrito.

## Capacidades

- Aprendizaje por adaptadores LoRA: el repositorio no define capacidades nuevas por sí mismo, sino que modifica el comportamiento del modelo base Qwen/Qwen3.5-4B en la dirección del entrenamiento de co-evolución adversario-ejecutor.
- Ejecución de tareas guiada por un currículum: el rol de ejecutor está entrenado para resolver las tareas o escenarios propuestos por el adversario dentro del entorno simulado.
- Generación de propuestas adversarias: el rol de adversario está entrenado para producir propuestas que sirvan como señal de entrenamiento al ejecutor.
- Entrenamiento multi-turno o multi-rol: el esquema de grupos (6 en adversario, 4 en ejecutor) sugiere interacción por grupos, aunque no se detalla el formato exacto de las conversaciones.
- Capacidades heredadas del modelo base (generación de texto, razonamiento, código, etc.): no verificadas en la información proporcionada y sujetas a lo que ofrezca Qwen/Qwen3.5-4B.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible, más allá del esquema de roles del entrenamiento.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en aprendizaje por co-evolución: el repositorio sirve como referencia reproducible de una ablación concreta (sin Stage 1) para comparar frente a variantes con inicialización desde Stage 1, manteniendo constantes las 150 propuestas por iteración, 1 época de adversario y 2 de ejecutor.
- Reproducción de experimentos de simulación a realidad (sim2real): aplicar los adaptadores sobre Qwen/Qwen3.5-4B en la revisión fijada permite repetir el pipeline de entrenamiento y auditar los metadatos de cada adaptador.
- Estudio de currículos congelados: dado que el currículum permanece congelado en el modelo base, es un punto de partida controlado para medir cuánto aporta la co-evolución frente a un currículum que evoluciona.
- Análisis de linaje de adaptadores: las cadenas adv_v1→adv_v2→adv_v3 y exec_v1→exec_v2→exec_v3 permiten estudiar cómo se degrada o mejora el comportamiento al continuar entrenando sobre el adaptador anterior.
- Evaluación de robustez adversaria: el rol de adversario puede emplearse para generar propuestas exigentes y medir la respuesta del ejecutor, siempre que se disponga del entorno WebWorld-14B o de un sustituto.
- Punto de partida para ajuste posterior: los adaptadores pueden cargarse con PEFT y continuar el entrenamiento con datos propios, aunque al ser artefactos experimentales conviene validar antes su utilidad real.
- Docencia y divulgación técnica: ilustra un caso real de repositorio con múltiples adaptadores, subcarpetas por rol y metadatos de entrenamiento por adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la publicación no afirma una puntuación evaluada de forma independiente.

## Requisitos de hardware

- Los adaptadores en sí ocupan 0,2 GB en total, por lo que el coste de almacenamiento es despreciable frente al modelo base.
- La inferencia requiere cargar Qwen/Qwen3.5-4B en memoria, más el adaptador LoRA seleccionado. Las cifras de VRAM dependen del modelo base, no del adaptador; para un modelo de ~4B de parámetros las estimaciones habituales son del orden de 8-9 GB en FP16, 5-6 GB en cuantización de 8 bits y 3-4 GB en 4 bits, siempre que el modelo base permita dichas cuantizaciones.
- GPU recomendadas: no disponible para este repositorio en concreto. Para un modelo de ~4B, una GPU consumer con 8-12 GB de VRAM sería suficiente en cuantización de 4 u 8 bits; en FP16 conviene disponer de 12-16 GB o más. Series como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 son candidatas razonables, pero ninguna ha sido validada en la información proporcionada.
- Cabe en GPU consumer: probablemente sí en cuantización de 4 u 8 bits, sujeto al modelo base; no confirmado por el autor.
- Opciones de despliegue: PEFT es la vía documentada por el autor (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el uso de LoRA con estos motores depende de que soporten adaptadores sobre el modelo base concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| advsim2real-stage2-ablation-adv1epoch-exec2epochs-iter3-nprop150 | Adaptadores LoRA experimentales sobre Qwen/Qwen3.5-4B | Adaptadores de bajo rango; base denominada 4B | Entrenamiento del ejecutor hasta 4096 tokens | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B | Modelo base completo | Denominado 4B | No disponible en la informacion proporcionada | No disponible | HuggingFace (revision fijada por el autor) |
| Otras variantes de AdVSim2Real Stage 2 | Adaptadores LoRA con inicialización desde Stage 1 | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto experimental: el propio autor declara que son artefactos de entrenamiento y que su publicación no implica una puntuación evaluada de forma independiente.
- Estado incompleto por diseño: las carpetas de adaptador solo aparecen tras completar su calendario de entrenamiento y superar las comprobaciones de finalización y hash; una carpeta ausente indica entrenamiento aún pendiente, no un error.
- Actualizaciones de optimizador omitidas: los metadatos pueden reflejar calendarios completados con actualizaciones de optimizador no ejecutadas, lo que complica la interpretación de los resultados.
- Dependencia del modelo base y de una revisión concreta: cargar una revisión distinta de Qwen/Qwen3.5-4B puede invalidar el comportamiento esperado. La revisión indicada es 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a.
- Dependencia del modelo de mundo: el procedimiento depende de WebWorld-14B, que no forma parte del repositorio y no está enlazado en la información disponible.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial no puede asumirse permitido sin consultar al autor y a la licencia del modelo base.
- Idiomas no declarados: se desconoce el soporte multilingüe efectivo de los adaptadores.
- Sesgos y alucinación: no hay información específica sobre sesgos ni sobre tasas de alucinación; al derivar de un modelo base no auditado en esta ficha, persisten los riesgos propios de dicho modelo.
- Sin señales de adopción: 0 descargas y 0 likes, sin benchmarks publicados ni evaluaciones de terceros.
- Las consultas de búsqueda web realizadas no devolvieron resultados relevantes sobre este modelo; el material encontrado era contenido no relacionado y se ha descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sarim-Hash/advsim2real-stage2-ablation-adv1epoch-exec2epochs-iter3-nprop150
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B (revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a)
- Libreria PEFT: https://github.com/huggingface/peft
- Modelo de mundo WebWorld-14B: no disponible
- Paper o blog del metodo AdVSim2Real: no disponible
- Demos o espacios asociados: no disponible
- Nota: las busquedas web realizadas no devolvieron enlaces relevantes sobre este modelo.
