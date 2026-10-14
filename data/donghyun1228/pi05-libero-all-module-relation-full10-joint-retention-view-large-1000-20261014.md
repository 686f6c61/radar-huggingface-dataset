# Donghyun1228/pi05-libero-all-module-relation-full10-joint-retention-view-large-1000-20261014

## Resumen

Checkpoint experimental de una política VLA (vision-language-action) para robótica, desarrollado por Donghyun1228 y publicado en HuggingFace bajo la librería openpi (familia pi05). Está entrenado para tareas de manipulación del benchmark LIBERO y el repositorio ocupa 13.1 GB. Contiene parámetros sin EMA tras 1000 actualizaciones, con módulos de visión, LLM y experto en FP32 y módulos congelados en BF16.

El modelo corresponde a un experimento de relación entre módulos (all-module relation) con variantes view_large y retention, y su objetivo declarado es la manipulación transferible. El autor advierte que este checkpoint individual no establece retención. No se proporcionan licencia, idiomas soportados ni resultados de benchmarks, por lo que su uso queda restringido a investigación y reproducción de experimentos. Su interés radica en el estudio de políticas VLA source-free y en el uso de un sampler Euler de 10 pasos para comparar acciones físicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en pi05, librería openpi |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP32 (maestros activos), BF16 (cómputo e inferencia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch para openpi; restauración a BF16 |
| Tamaño del repositorio | 13.1 GB |
| Framework | openpi |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de las políticas VLA de openpi (pi05), compuesta por un codificador visual, un backbone LLM y un experto de acciones. El checkpoint distingue módulos entrenables (vision23, LLM9 y expert11 en FP32) y módulos congelados (native frozen8 y source wrist23 en BF16). Durante el entrenamiento se mantienen maestros activos en FP32 con cómputo nativo en BF16, y en despliegue se restauran todas las hojas a BF16. El objetivo de relación compara acciones físicas muestreadas y se diferencia conjuntamente a través de un sampler Euler completo de 10 pasos, lo que modifica tanto la profundidad del sampler como las derivadas del profesor respecto a objetivos heredados.

El entrenamiento se realizó durante 1000 actualizaciones sobre datos objetivo de Donghyun1228/libero-dense-contact-sweep-d2-20261002. No entran observaciones de origen, caché de salida de origen ni feedback de éxito. La inicialización real usó una fuente local legacy native51; el checkpoint pi05-libero-main-policy-retention-source-split74-20261013 es una referencia de despliegue canónicamente equivalente, no la entrada de inicialización real. La rama de retención usa un único lambda=1 y un control escalar que preserva la dirección y los momentos de Adam del IDM mientras iguala la norma de una propuesta candidata del mismo estado.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por instrucciones de la tarea.
- Política VLA que combina visión actual, LLM preentrenado y experto.
- Inferencia mediante sampler Euler de 10 pasos.
- Entrenamiento source-free (sin observaciones del entorno de origen).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.
- Evaluación en simulación MuJoCo 3.2.3 sobre 40 tareas de LIBERO (10 episodios por tarea, semilla de entorno 17, 8 clientes por GPU).

## Casos de uso

- Reproducción de experimentos de retención en políticas VLA: permite analizar si el objetivo de relación y la rama de retención preservan habilidades tras el ajuste, aunque el propio autor indica que este checkpoint no establece retención por sí solo.
- Estudio de entrenamiento source-free: al no usar observaciones de origen ni feedback de éxito, sirve para investigar hasta qué punto una política puede adaptarse solo con datos objetivo e instrucciones existentes.
- Evaluación comparativa en LIBERO: el protocolo descrito (40 tareas x 10 episodios, semilla 17, MuJoCo 3.2.3) permite comparar este checkpoint con otros de openpi bajo condiciones controladas.
- Análisis del sampler Euler de 10 pasos: el checkpoint modifica la profundidad del sampler y las derivadas del profesor, por lo que es útil para estudiar el impacto de estos cambios en la generación de acciones.
- Punto de partida para fine-tuning en manipulación de contacto denso: los datos objetivo provienen de libero-dense-contact-sweep-d2, lo que lo hace adecuado como inicialización para experimentos en ese dominio.
- Investigación sobre inicialización y referencias canónicas: la distinción entre la fuente legacy native51 y la referencia de despliegue equivalente permite estudiar la sensibilidad a la inicialización.
- Desarrollo de pipelines de inferencia con openpi: el checkpoint se puede cargar con la librería openpi y restaurar a BF16 para pruebas de despliegue en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe un protocolo de evaluación (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes/GPU, MuJoCo 3.2.3) y aclara que las peticiones de política comparten un flujo RNG del servidor y no están emparejadas por episodio. No se aportan tasas de éxito ni métricas numéricas.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware.
- Estimación a partir del tamaño del repositorio (13.1 GB) y de la restauración a BF16: los pesos ocuparían del orden de 13 GB en VRAM, por lo que se necesitaría una GPU con al menos 24 GB (RTX 3090, RTX 4090, A100 40 GB, etc.) para cargar el modelo sin cuantización adicional. Es una estimación derivada, no un dato confirmado.
- Si se entrena con maestros FP32, el requisito de VRAM sería mayor (aproximadamente el doble para los módulos activos), aunque no se detalla qué módulos son activos en cada fase.
- Opciones de despliegue: librería openpi, PyTorch y simulación MuJoCo 3.2.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de modelos comparables en la información proporcionada. Este checkpoint pertenece a la familia de políticas VLA de openpi (pi05) y está orientado al benchmark LIBERO, por lo que sus alternativas naturales serían otros checkpoints de openpi, así como políticas VLA como OpenVLA o RT-2. Sin embargo, no se aportan parámetros, contexto, licencia ni rendimiento de esas alternativas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas (openpi, OpenVLA, RT-2) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint experimental, no validado para producción.
- El autor indica explícitamente que este checkpoint individual no establece retención.
- La pérdida IDM no es la métrica de éxito del objetivo; no debe usarse como indicador de rendimiento.
- El entrenamiento es source-free: no usa observaciones de origen, caché de salida ni feedback de éxito, lo que puede limitar la transferencia a entornos reales.
- Los cambios en profundidad del sampler y en las derivadas del profesor no pueden aislarse, por lo que los resultados no permiten atribuir efectos a una sola causa.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no especificados: no se conocen capacidades multilingües.
- Sin datos de sesgos ni de alucinación (el modelo genera acciones, no texto abierto).
- Evaluación en simulación con semilla fija y sin emparejamiento por episodios; los resultados pueden no generalizar.
- Tamaño del repositorio 13.1 GB, con mezcla de FP32 y BF16, lo que complica el despliegue en hardware limitado.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-all-module-relation-full10-joint-retention-view-large-1000-20261014
- Datos objetivo: https://huggingface.co/Donghyun1228/libero-dense-contact-sweep-d2-20261002 (commit 9f8f600ce0e8f5df51c0e847c65a1e09f29d8494)
- Referencia de despliegue equivalente: https://huggingface.co/Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013 (commit 24268da2aba5f690c879788d98e3455a2a579d8f)
- Referencia de inferencia: pi05_libero_source_free_split_vision_idm, commit 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08 (no se proporciona URL directa)
- Librería openpi: no se proporciona URL.
