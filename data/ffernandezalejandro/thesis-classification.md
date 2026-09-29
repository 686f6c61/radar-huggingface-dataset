# ffernandezalejandro/thesis-classification

## Resumen

`ffernandezalejandro/thesis-classification` es un repositorio de HuggingFace publicado por el usuario ffernandezalejandro (Xu Zixuan) que contiene una implementacion propia y reducida de una arquitectura tipo BLIP orientada a tareas de clasificacion. No es un modelo entrenado ni un lanzamiento con pesos listos para produccion: la propia model card lo describe explicitamente como un punto de partida reproducible y el checkpoint `model.safetensors` como una inicializacion valida unicamente para pruebas de humo (smoke tests).

El repositorio incluye el codigo de inferencia o entrenamiento (`inference.py`), la configuracion de arquitectura (`config.json`), la receta de experimento por defecto (`training_args.json`) y el checkpoint de inicializacion. La model card declara una variante "xlarge" con atencion de ventana deslizante, fusion mediante MLP con concatenacion, activacion gelu y normalizacion rmsnorm, ademas de optimizador lamb con schedule exponencial como valores de partida, no como evidencia de un entrenamiento completado.

El dato de safetensors reporta 33.088 parametros totales, una cifra incompatible con una implementacion BLIP de escala xlarge (que en sus versiones publicas de referencia maneja cientos de millones de parametros). Esta discrepancia, junto con las cero descargas y cero likes, indica que el artefacto es experimental y de uso practicamente nulo en la comunidad. Su relevancia es, por tanto, documental: sirve como esqueleto reproducible para experimentos de clasificacion de tesis y trabajos academicos, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (implementacion propia); atencion de ventana deslizante; fusion concat + MLP; activacion gelu; normalizacion rmsnorm |
| Parametros totales | 33.088 segun el recuento de safetensors (cifra ambigua por el separador; en cualquier caso, del orden de decenas de miles, no de miles de millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors (checkpoint de inicializacion) |

Otros datos del repositorio: tamano del repositorio 0.0 GB, 0 descargas, 0 likes. Etiquetas declaradas: `safetensors`, `blip`, `pytorch`, `classification`, `region:us`. Fecha de creacion registrada: 2026-09-29.

## Arquitectura y entrenamiento

La arquitectura declarada en la model card es BLIP con escala "xlarge", atencion de ventana deslizante (sliding window), fusion de modalidades mediante concatenacion seguida de MLP, activacion gelu y normalizacion rmsnorm. La receta de experimento incluida en `training_args.json` especifica optimizador lamb con un schedule exponencial. El autor advierte de forma explicita que estos son valores de partida del script y no evidencia de una ejecucion completada, y que cualquier evaluacion significativa deberia entrenar todos los baselines con la misma exposicion de datos, presupuesto de ajuste y semillas aleatorias.

No hay informacion disponible sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones adicionales. El repositorio no presenta ningun checkpoint entrenado ni puntuacion de benchmark. La model card indica ademas que, al tratarse de una implementacion personalizada, las APIs genericas de carga automatica de HuggingFace requieren un adaptador explicito antes de su uso, y que el bloque `__main__` del script contiene un ejemplo de smoke test generado.

## Capacidades

- Clasificacion de texto o de pares texto-etiqueta mediante una implementacion tipo BLIP, segun la etiqueta `classification` del repositorio.
- Ejecucion de pruebas de humo (smoke tests) para validar que la arquitectura y el checkpoint de inicializacion cargan correctamente.
- Punto de partida para fine-tuning sobre conjuntos de datos etiquetados especificos de dominio (por ejemplo, clasificacion de tesis academicas).
- Definicion explicita de hiperparametros de entrenamiento a traves de `training_args.json`, lo que facilita la reproducibilidad de experimentos.
- Capacidades multimodales: no confirmadas. La etiqueta `blip` sugiere una arquitectura de vision y lenguaje, pero la model card no documenta entrada de imagen ni pares imagen-texto, ni se especifica ninguna tarea de vision en la practica.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, vision): no disponible.

## Casos de uso

- Prototipado de clasificacion automatica de tesis: el repositorio esta pensado para experimentar con la asignacion automatica de materias o categorias a documentos academicos; se usaria como base sobre la que anadir una cabeza de clasificacion y entrenar con un split etiquetado propio.
- Verificacion de pipelines de entrenamiento en CI: al ser un script ejecutable con un bloque `__main__` de smoke test, permite comprobar que el entorno (PyTorch, safetensors, dependencias) funciona antes de lanzar trabajos costosos.
- Reproduccion de experimentos academicos: `config.json` y `training_args.json` documentan la receta por defecto, de modo que un grupo de investigacion puede partir de esa configuracion y comparar variantes con las mismas condiciones.
- Docencia en cursos de aprendizaje profundo: sirve como ejemplo minimo de implementacion de una arquitectura tipo BLIP con atencion de ventana deslizante, fusion por concatenacion y rmsnorm, sin la complejidad de un modelo de gran escala.
- Base para clasificacion de repositorios documentales institucionales: bibliotecas universitarias que quieran etiquetar tesis con un vocabulario controlado podrian adaptar el codigo y entrenar con su propio corpus, siempre que asuman el trabajo de fine-tuning completo.
- Comparacion de recetas de optimizacion: permite evaluar el efecto del optimizador lamb con schedule exponencial frente a alternativas (AdamW, cosine) en un modelo pequeno y con coste de computo minimo.
- Auditoria de checkpoints y formatos: el repositorio contiene un `model.safetensors` valido que puede usarse para probar herramientas de inspeccion de pesos, conversion a GGUF o validacion de firmas, sin coste de descarga relevante (0.0 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint es una inicializacion sin entrenar. Cualquier cifra de MMLU, HumanEval, GSM8K, GLUE o similar seria inventada y no debe atribuirse a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 33.088 parametros segun safetensors, el checkpoint y las activaciones caben holgadamente en memoria del sistema; la cifra exacta no esta disponible.
- GPU recomendadas: ninguna en particular. El modelo se puede ejecutar en CPU sin problema por su tamano reducido. Si se ampliase a una implementacion BLIP real de escala grande, se necesitarian GPUs tipo A100 o H100 para entrenamiento, pero eso no se corresponde con los pesos publicados.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con al menos 1 GB de VRAM (GTX 1050, RTX 3060, RTX 4090, etc.), e incluso en CPU. No se dispone de mediciones especificas.
- Opciones de despliegue: al ser una implementacion personalizada que requiere un adaptador explicito, no se puede cargar directamente con `AutoModel` de transformers. El despliegue estandar seria ejecutar `inference.py` del propio repositorio. No hay soporte confirmado para vLLM, llama.cpp, Ollama o TGI, y estos frameworks estan orientados a modelos generativos de gran escala, no a este caso.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No hay datos publicados de este modelo, por lo que la comparacion se limita a caracteristicas estructurales. Las cifras de las alternativas proceden de conocimiento general y deberian verificarse en sus repositorios oficiales antes de citarlas.

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Estado |
|---|---|---|---|---|---|
| ffernandezalejandro/thesis-classification | 33.088 (segun safetensors) | no disponible | Clasificacion (implementacion BLIP propia) | bsd-3-clause | Checkpoint de inicializacion, sin entrenar |
| Salesforce BLIP (referencia) | no disponible en la informacion proporcionada | no disponible | Vision-lenguaje (captioning, retrieval, VQA) | no disponible en la informacion proporcionada | Modelo publicado y evaluado |
| ModernBERT (usado en el trabajo relacionado de clasificacion de tesis) | no disponible en la informacion proporcionada | no disponible | Clasificacion y comprension de texto | no disponible en la informacion proporcionada | Modelo publicado y evaluado |
| ffernandezalejandro/undergrad-classification | no disponible en la informacion proporcionada | no disponible | Clasificacion (mismo autor) | no disponible en la informacion proporcionada | Sin datos publicos en la informacion disponible |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. La propia model card lo declara una inicializacion valida para pruebas de humo, no un modelo con rendimiento utilizable.
- No se ha auditado en cuanto a robustez, equidad (fairness) ni transferencia de dominio.
- No hay resultados de benchmarks ni metrica alguna publicada; no se puede afirmar nada sobre su calidad en ninguna tarea.
- Discrepancia entre la escala declarada ("xlarge") y la cifra de parametros de safetensors (33.088), que sugiere que el artefacto no es una implementacion BLIP xlarge completa. Conviene inspeccionar `config.json` antes de reutilizarlo.
- Riesgo de alucinacion: no aplica directamente, ya que no es un modelo generativo entrenado; el riesgo real es interpretar mal el repositorio como si fuese un modelo listo para uso.
- Idioma y contexto: no disponibles. No hay informacion sobre idiomas soportados ni longitud de ventana, por lo que no se puede garantizar su comportamiento con textos en castellano o con documentos largos.
- Licencia bsd-3-clause: permisiva y compatible con uso comercial, pero la propia model card advierte de que hay que revisar por separado los terminos de los datos de origen cuando se use con datasets externos.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de validacion externa.
- Antes de cualquier uso en produccion seria obligatorio realizar un fine-tuning completo sobre datos etiquetados, reportar metricas con al menos tres semillas y comparar contra un baseline de capacidad equivalente, tal como recomienda la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ffernandezalejandro/thesis-classification
- Perfil del autor en HuggingFace: https://huggingface.co/ffernandezalejandro
- Repositorio relacionado del mismo autor: https://huggingface.co/ffernandezalejandro/undergrad-classification
- Trabajo relacionado sobre clasificacion automatica de tesis (Cal Poly Humboldt, IDEAfest 2025): https://digitalcommons.humboldt.edu/ideafest2025/35/
- Panel comparativo general de modelos (contexto, no especifico de este modelo): https://llm-stats.com/leaderboards/llm-leaderboard
- Panel comparativo general de modelos (contexto, no especifico de este modelo): https://artificialanalysis.ai/leaderboards/models
