# fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed455

## Resumen

El modelo `fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed455` es un ajuste fino (fine-tuning) supervisado del modelo `goldfish-models/nld_latn_100mb`, un transformer de tipo GPT-2 de pequeno tamano entrenado sobre neerlandes escrito en alfabeto latino. Lo publica el usuario fpadovani y, por los metadatos disponibles —el nombre del proyecto en Weights & Biases (`white_cotterell`), el sufijo `seed455` y el identificador `heavy_zipf_fix`—, todo apunta a que se trata de un artefacto de investigacion academica sobre seleccion de datos y distribucion Zipf en el preentrenamiento, mas que de un modelo pensado para produccion.

El modelo tiene 86.708.736 parametros (aproximadamente 86,7 millones) y se distribuye en formato `safetensors` bajo la libreria `transformers`, con un repositorio de 1,4 GB. El ajuste se ha realizado con TRL 0.23.0 mediante SFT (supervised fine-tuning), segun la propia model card, partiendo de un checkpoint base de 100 MB de datos de entrenamiento.

Su relevancia es fundamentalmente metodologica: sirve como punto de comparacion reproducible en experimentos sobre composicion de datasets, fijacion de distribuciones Zipf y semillas de entrenamiento. No se han publicado resultados de benchmarks ni una descripcion detallada del dataset de ajuste, por lo que su uso recomendado es la investigacion y la reproducibilidad experimental, no el despliegue en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun los tags del repositorio |
| Parametros totales | 86.708.736 (aprox. 86,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF/AWQ/GPTQ; el tamano de 86,7 M permite cuantizacion int8 y 4 bits mediante herramientas externas) |
| Idiomas soportados | no disponible en la model card; el modelo base `goldfish-models/nld_latn_100mb` esta orientado a neerlandes (`nld_latn`) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin concretar) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | goldfish-models/nld_latn_100mb |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Versiones de framework | Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia GPT-2: un transformer decoder-only con atencion causal completa. El numero de parametros (86,7 M) es inferior al de GPT-2 small canonico (124 M), lo que es coherente con el modelo base de la serie Goldfish, que emplea un vocabulario y una configuracion reducidos para entrenamientos de bajo coste sobre corpus de 100 MB por idioma. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto efectiva.

El entrenamiento del modelo publicado se realizo mediante SFT (supervised fine-tuning) con la libreria TRL en su version 0.23.0, partiendo del checkpoint `goldfish-models/nld_latn_100mb`. No se documentan en la model card el numero de tokens de ajuste, la composicion del dataset, ni si se aplicaron tecnicas adicionales como DPO, RLHF o decodificacion especulativa. El nombre del modelo sugiere un experimento controlado de fijacion de la distribucion Zipf del corpus con una semilla concreta (seed455), lo que refuerza la hipotesis de un artefacto de investigacion reproducible. El enlace a Weights & Biases incluido en la model card apunta al proyecto `f-padovani-university-of-groningen/white_cotterell`, con el run `c5rsibgk`.

## Capacidades

- Generacion de texto autoregresiva en el idioma del modelo base (presumiblemente neerlandes), mediante `pipeline("text-generation")`.
- Acepta entradas en formato de conversacion (`[{"role": "user", "content": ...}]`) segun el ejemplo de la model card, lo que sugiere un ajuste SFT orientado a instrucciones.
- Compatible con `text-generation-inference` y `endpoints_compatible` segun los tags del repositorio.
- Ajuste de instrucciones basico derivado del SFT, sin documentacion sobre calidad o formato esperado.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.
- Capacidad multilingue: no disponible; el alcance linguistico se limita, en principio, al del modelo base.

## Casos de uso

- Reproducibilidad de experimentos academicos: sirve como checkpoint de referencia para comparar el efecto de distintas politicas de seleccion de datos (por ejemplo, variaciones de la distribucion Zipf) sobre un mismo corpus base, gracias a su semilla fijada (seed455).
- Baseline en estudios de ajuste SFT: al ser un GPT-2 pequeno ajustado con TRL, permite medir el impacto de recetas de ajuste en modelos de menos de 100 M de parametros con coste computacional minimo.
- Generacion de texto en neerlandes de bajo coste: puede emplearse para prototipos de completado de texto o generacion de contenido en neerlandes en entornos sin GPU, dado su tamano reducido.
- Experimentacion con tecnicas de cuantizacion: sus 86,7 M de parametros permiten probar flujos completos de cuantizacion (int8, 4 bits) y medir degradacion de calidad en un modelo pequeno antes de escalar a modelos mayores.
- Docencia y formacion: adecuado como ejemplo practico de fine-tuning con TRL, carga de pesos `safetensors` y despliegue con `transformers` en cuadernos y cursos.
- Pruebas de integracion de pipelines de inferencia: util para validar configuraciones de `text-generation-inference` o endpoints compatibles con la API de HuggingFace sin consumir recursos significativos.
- Analisis linguistico controlado: al derivar de la serie Goldfish (corpus de 100 MB por idioma), permite estudiar el comportamiento sintactico y morfologico de un modelo pequeno entrenado con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 350 MB solo de pesos, mas activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 174 MB de pesos.
- VRAM estimada en int8: aproximadamente 87 MB de pesos.
- VRAM estimada en 4 bits: aproximadamente 45-50 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tambien funciona en CPU. No requiere A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en iGPU y en CPU.
- Opciones de despliegue: `transformers` con `pipeline`, `text-generation-inference` (segun los tags del repositorio) y servidores compatibles con endpoints de HuggingFace. No se publican pesos GGUF, por lo que su uso directo en `llama.cpp` u `Ollama` requeriria una conversion previa del modelo a ese formato, no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed455` | 86,7 M | no disponible | neerlandes (presumible) | no disponible | HuggingFace, safetensors |
| `goldfish-models/nld_latn_100mb` (modelo base) | no disponible en la informacion proporcionada | no disponible | neerlandes | no disponible en la informacion proporcionada | HuggingFace |
| GPT-2 small | 124 M | 1024 tokens (configuracion estandar de GPT-2) | ingles | MIT (licencia habitual del release original de OpenAI) | HuggingFace, safetensors |
| DistilGPT-2 | 82 M | 1024 tokens (configuracion estandar) | ingles | MIT (licencia habitual del release de HuggingFace) | HuggingFace, safetensors |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, idioma y disponibilidad.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero un modelo pequeno entrenado sobre un corpus de 100 MB hereda necesariamente los sesgos y las limitaciones de cobertura de ese corpus.
- Riesgo elevado de alucinacion y de generacion incoherente: 86,7 M de parametros es un orden de magnitud muy por debajo de los modelos actuales de uso general, y la model card no reporta ninguna evaluacion de calidad.
- La model card no especifica el dataset de ajuste, la longitud de contexto ni el formato de prompt esperado, por lo que el comportamiento en produccion es impredecible sin evaluacion previa.
- Alcance linguistico limitado, en principio, al neerlandes derivado del modelo base; no hay evidencia de capacidades multilingues.
- Licencia no concretada: la model card incluye un campo `licence: license` sin texto legal asociado. Antes de cualquier uso comercial es imprescindible contactar con el autor y revisar la licencia del modelo base `goldfish-models/nld_latn_100mb`.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en comunidad ni de validacion externa.
- El nombre del modelo y el run de Weights & Biases indican que se trata de un artefacto de investigacion; no debe asumirse que el checkpoint publicado sea el mejor de la serie ni que este pensado para distribucion.
- No se publican pesos en formato GGUF, por lo que su uso en herramientas de inferencia local estandar (llama.cpp, Ollama) requiere conversion manual no documentada.

## Enlaces

- HuggingFace: https://huggingface.co/fpadovani/ppt-nld_heavy_zipf_fix_zijn-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/white_cotterell/runs/c5rsibgk
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020, GitHub repository.
