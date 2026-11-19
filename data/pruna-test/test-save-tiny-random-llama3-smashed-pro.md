# pruna-test/test-save-tiny-random-llama3-smashed-pro

## Resumen

`pruna-test/test-save-tiny-random-llama3-smashed-pro` es un artefacto de prueba publicado por la organización `pruna-test`, vinculado al framework de optimización de modelos Pruna (y su variante comercial Pruna Pro). No se trata de un modelo entrenado para uso real: el nombre indica explícitamente que es un "tiny random" derivado de `HuggingFaceM4/tiny-random-Llama3ForCausalLM`, es decir, un modelo Llama 3 de juguete con pesos aleatorios y apenas 4,1 millones de parámetros, empaquetado mediante el pipeline de "smash" de Pruna.

Su relevancia no está en las capacidades de generación de texto (que son nulas por diseño, al no haber entrenamiento), sino en servir como fixture de pruebas para validar el guardado, carga y aplicación de configuraciones de compresión del ecosistema Pruna. El propio `smash_config.json` que acompaña al repositorio tiene todos los métodos de optimización desactivados (`awq`, `gptq`, `hqq`, `torchao`, `fp8`, etc. a `false`), lo que confirma que es un caso de prueba del formato y no una release optimizada.

Por tanto, esta ficha debe leerse como documentación de un artefacto técnico de test, no de un modelo utilizable en producción. Cualquier evaluación de calidad, benchmarks o despliegue real carece de sentido con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3, variante "tiny random") |
| Parametros totales | 4.111.696 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el `smash_config.json` muestra todos los métodos de cuantización a `false`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Llama 3, pero en su variante "tiny random" mantenida por HuggingFaceM4 como modelo de pruebas. Con 4.111.696 parámetros totales, se trata de un esqueleto de la arquitectura real con dimensiones reducidas y pesos inicializados aleatoriamente. No hay información sobre número de capas, dimensión oculta, cabezas de atención ni vocabulario en la información proporcionada.

No se ha realizado entrenamiento: los pesos son aleatorios por construcción. El modelo se ha empaquetado mediante la librería Pruna (`pruna_pro`) aplicando una configuración de "smash" que, según el `smash_config.json` incluido, no activa ninguna técnica de compresión ni optimización (todas las banderas están a `false`, `device: "cpu"`, `batch_size: 1`, `save_fns: []`). El único `load_fns` configurado es `transformers`. No hay datos sobre dataset, tokens de entrenamiento, RLHF, DPO ni innovaciones técnicas.

## Capacidades

- Generación de texto: nominalmente soportada por la arquitectura (pipeline `text-generation`), pero sin valor funcional al tener pesos aleatorios.
- Razonamiento, código y matemáticas: no disponible (modelo sin entrenamiento).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Uso previsto real: fixture de pruebas para el pipeline de guardado/carga de Pruna y validación de `smash_config.json`.

## Casos de uso

- Pruebas de integración del framework Pruna: verificar que `PrunaProModel.from_pretrained` carga correctamente un checkpoint guardado con configuración de smash, sin necesidad de descargar modelos grandes.
- Validación de serialización de `smash_config.json`: comprobar que las banderas de optimización se persisten y recuperan correctamente en pipelines CI.
- Test de compatibilidad con `transformers`: asegurar que el checkpoint se puede cargar con `AutoModelForCausalLM` antes de aplicar optimizaciones.
- Desarrollo de utilidades de inspección de safetensors: al ser un repo de ~0 GB y 4M de parámetros, permite iterar rápido en herramientas que leen cabeceras y tensores.
- Pruebas de humo en endpoints compatibles (tag `endpoints_compatible`, `text-generation-inference`): validar el enrutado y la respuesta del servidor sin coste computacional.
- Reproducción de bugs del pipeline de guardado: al ser un artefacto de la organización `pruna-test`, sirve como caso mínimo reproducible en informes de issues del repositorio Pruna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios y sin entrenamiento, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión (4,1 M de parámetros en fp32 ocupan ~16 MB; en bf16, ~8 MB).
- GPU recomendadas: no requiere GPU; el propio `smash_config.json` indica `device: "cpu"`.
- Cabe en cualquier GPU consumer, incluida una iGPU o incluso ejecución en CPU sin problemas.
- Opciones de despliegue: `transformers` (carga estándar) o `pruna_pro.PrunaProModel.from_pretrained` para aplicar la configuración de smash. El tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se documenta configuración.
- Latencia y throughput: no disponible; al ser un modelo de juguete, los valores no son representativos de ningún modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| pruna-test/test-save-tiny-random-llama3-smashed-pro | 4,1 M | no disponible | Fixture de pruebas Pruna | no disponible |
| HuggingFaceM4/tiny-random-Llama3ForCausalLM | ~4 M (aprox., modelo base) | no disponible | Fixture de pruebas transformers | no disponible |
| Llama 3.2 1B | 1,24 B | 128 K | Modelo real de produccion | Llama 3.2 Community License |
| Qwen2.5 0.5B | 0,49 B | 32 K | Modelo real de produccion | Apache 2.0 |

La comparación con modelos reales solo procede para situar el orden de magnitud: este checkpoint es tres órdenes de magnitud menor que el modelo real más pequeño de la familia Llama 3 y no compite en ninguna tarea.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado; las salidas son ruido estadístico sin relación con la entrada.
- No apto para producción: no debe desplegarse en ningún caso de uso real, ni siquiera como demo.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución; al derivar de `HuggingFaceM4/tiny-random-Llama3ForCausalLM`, conviene revisar la licencia del modelo base.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Contexto no documentado: se desconoce la longitud máxima de secuencia efectiva.
- Configuración de smash vacía: el `smash_config.json` no aplica ninguna optimización, por lo que no sirve como referencia de rendimiento de Pruna.
- Riesgo de confusión: el sufijo `pro` y la organización `pruna-test` pueden llevar a error; es un artefacto de test, no una release.
- Sin garantías de mantenimiento: aunque el repo se actualizó en noviembre de 2026, su naturaleza de fixture implica que puede cambiar o eliminarse sin aviso.

## Enlaces

- Hugging Face: https://huggingface.co/pruna-test/test-save-tiny-random-llama3-smashed-pro
- Modelo base: https://huggingface.co/HuggingFaceM4/tiny-random-Llama3ForCausalLM
- Repositorio Pruna: https://github.com/PrunaAI/pruna
- Documentación Pruna: https://docs.pruna.ai/en/stable/
- Twitter Pruna AI: https://twitter.com/PrunaAI
- GitHub Pruna AI: https://github.com/PrunaAI
- LinkedIn Pruna AI: https://www.linkedin.com/company/93832878/
- Discord Pruna AI: https://discord.gg/JFQmtFKCjd
- Reddit Pruna AI: https://www.reddit.com/r/PrunaAI/
