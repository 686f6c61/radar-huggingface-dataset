# alfred8995/sn38-r3-2014-pomlnb-chronollm-2014

## Resumen

`alfred8995/sn38-r3-2014-pomlnb-chronollm-2014` es un modelo de lenguaje de 1.858.535.658 parámetros (≈1,86 B) publicado en HuggingFace por el usuario `alfred8995`, con pesos en safetensors y precisión F32 (el repositorio ocupa 7,4 GB, coherente con ese recuento). La etiqueta de arquitectura declarada es `ChronoGPT` y el nombre del repositorio remite a la familia ChronoLLM, una línea de modelos "temporalmente consistentes" en la que cada checkpoint solo conoce eventos hasta su año de corte (en este caso, 2014), de modo que no se filtra conocimiento futuro en el análisis.

El modelo está vinculado por nomenclatura y por autoría a otros artefactos del mismo entorno: el checkpoint público `pomlnb/chronollm-2014` (2 B de parámetros, F32, sin model card, 22 descargas en el último mes), las variantes `sn38-nanochrono` de `alfred8995` y el dataset `pomlnb2/sn38-submission`. El prefijo `sn38` sugiere un envío (submission) dentro de un proceso de competición identificado con ese código, aunque la información disponible no especifica de qué red o certamen se trata.

Su relevancia es doble: por un lado, permite experimentar con un LM de ~2 B en un único acelerador de consumo; por otro, su diseño con corte temporal lo hace útil para evaluaciones libres de *leakage* (backtesting, análisis retrospectivo, estudios de contaminación de datos). La contrapartida es una documentación prácticamente inexistente: no hay model card, no se declaran idiomas ni contexto, el acceso está restringido (gated) y no se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ChronoGPT (según tag de HuggingFace); detalles internos no disponibles |
| Parámetros totales | 1.858.535.658 (≈1,86 B) |
| Parámetros activos | no disponible (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos publicados en F32; no se distribuyen GGUF, AWQ, GPTQ ni otras variantes |
| Idiomas soportados | no disponible |
| Licencia | other (no se detallan los términos; acceso gated con aceptación de condiciones) |
| Formato de pesos | safetensors (tensor type F32 según el checkpoint hermano `pomlnb/chronollm-2014`) |

## Arquitectura y entrenamiento

La única información pública sobre la arquitectura es la etiqueta `ChronoGPT` del repositorio y la referencia a la familia ChronoLLM que aparece en el paquete `chronollm` de PyPI, descrito como una herramienta para conversar con "modelos de lenguaje temporalmente consistentes" en los que "cada modelo solo conoce eventos hasta su año de vintage". El sufijo `2014` del identificador encaja con ese esquema: sería el checkpoint con corte de conocimiento en 2014. No hay información disponible sobre si se trata de un transformer decoder-only, un híbrido, ni sobre el número de capas, dimensión oculta, cabezas de atención o tipo de tokenizador.

Tampoco se han publicado detalles del entrenamiento: no se conoce el volumen de tokens, la composición del corpus, si hubo fases de instrucción (SFT), alineamiento con RLHF/DPO, ni si se aplicaron técnicas de filtrado temporal para garantizar el corte en 2014. Los repositorios hermanos con etiqueta `sn38-nanochrono` (`r16-H-M-Akds4-w50-s0`, `r16-H-P3-d2c3q3-s100`) sugieren una familia de variantes de distinto tamaño dentro del mismo proyecto, pero sus fichas tampoco aportan especificaciones.

## Capacidades

- Generación de texto autoregresiva: es la función implícita del modelo; no hay documentación que detalle calidad, estilo ni dominio.
- Consistencia temporal: por diseño, el checkpoint está limitado a eventos hasta 2014, lo que evita el conocimiento de hechos posteriores en las respuestas.
- Integración con la CLI `chronollm`: el paquete de PyPI permite invocar un modelo por año (`chronollm 2020`) o por repositorio (`chronollm owner/repo`), previa autenticación con un token de HuggingFace.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Modalidades adicionales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- **Backtesting financiero sin contaminación temporal**: al no conocer información posterior a 2014, el modelo puede generar escenarios y comentarios de mercado coherentes con el marco informativo de esa fecha, evitando que "sepa" qué ocurrió después y sesgue la simulación.
- **Análisis retrospectivo de documentos históricos**: interpretación y resumen de prensa, informes o correspondencia de principios de la década de 2010 con un vocabulario y un contexto temporal alineados con la fuente.
- **Investigación sobre contaminación de datos (*temporal leakage*)**: sirve como referencia controlada para medir cuánto conocimiento futuro filtra un LM estándar en tareas de evaluación con corte temporal, comparando respuestas de este checkpoint con las de un modelo contemporáneo.
- **Generación de contenido de época**: guiones, ficción o material divulgativo ambientado en 2014 en los que referencias anacrónicas (tecnología, eventos, personajes) romperían la verosimilitud.
- **Role-play y simulación de conversaciones con contexto de 2014**: chatbots educativos o demos que deben responder "como se habría respondido" en ese año, incluido el desconocimiento explícito de hechos posteriores.
- **Prototipado local de bajo coste**: con ~1,86 B de parámetros y pesos F32 de 7,4 GB, es viable montar un entorno de pruebas en una GPU de consumo para validar pipelines de inferencia, tokenización o despliegue antes de escalar a modelos mayores.
- **Docencia sobre corte de conocimiento en LLM**: experimento práctico para ilustrar cómo la fecha de corte del corpus condiciona las respuestas de un modelo y cómo detectarlo con preguntas sonda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye model card, no declara evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y no figura desplegado por ningún Inference Provider, por lo que tampoco existen métricas públicas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada en F32 (pesos completos)**: ≈7,4 GB solo para pesos; con caché KV, activaciones y overhead de runtime, entre 9 y 12 GB para contexto moderado.
- **VRAM estimada en otras precisiones**: BF16/FP16 ≈3,7 GB de pesos (≈5-6 GB en ejecución); INT8 ≈1,9 GB (≈3 GB en ejecución); INT4 ≈1 GB (≈2 GB en ejecución). Estas conversiones no están publicadas y habría que generarlas.
- **GPU recomendadas**: A100 40/80 GB, H100, L40S o RTX 6000 Ada para servir con holgura y concurrencia; RTX 4090 (24 GB) para desarrollo e inferencia por lotes en F32 o BF16.
- **¿Cabe en GPU de consumo?**: sí. En F32 requiere tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090); en BF16 cabría en 8 GB con margen ajustado; en INT4 cabría en 4-6 GB.
- **Opciones de despliegue**: `transformers` (PyTorch) es la vía directa con safetensors; la CLI `chronollm` (`pip install chronollm`) para uso conversacional; vLLM o TGI solo si la arquitectura `ChronoGPT` está soportada por esas librerías (no confirmado); llama.cpp u Ollama requerirían convertir previamente los pesos a GGUF, conversión que no se distribuye.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|---|
| `alfred8995/sn38-r3-2014-pomlnb-chronollm-2014` | 1,86 B | safetensors F32 | no disponible | other | gated (requiere aceptar condiciones) | Objeto de esta ficha; sin model card |
| `pomlnb/chronollm-2014` | 2 B (según HuggingFace) | safetensors F32 | no disponible | no disponible | público | Sin model card; 22 descargas en el último mes; sin Inference Provider |
| `alfred8995/r16-H-M-Akds4-w50-s0` | no disponible | safetensors | no disponible | no disponible | público | Etiqueta `sn38-nanochrono`; variante de la misma familia |
| `alfred8995/r16-H-P3-d2c3q3-s100` | no disponible | safetensors | no disponible | no disponible | público | Etiqueta `sn38-nanochrono`; variante de la misma familia |

No se dispone de datos de rendimiento comparado con modelos de propósito general del mismo tamaño (por ejemplo, la familia Qwen2.5-1.5B o Llama-3.2-1B), por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- **Documentación inexistente**: no hay model card ni ficha técnica; se desconocen arquitectura exacta, contexto, tokenizador, idiomas y datos de entrenamiento.
- **Sin evaluación publicada**: no existen benchmarks ni métricas de calidad, por lo que no se puede estimar su rendimiento relativo frente a otros modelos de ~2 B.
- **Corte temporal de 2014 por diseño**: el modelo no debe emplearse en tareas que requieran conocimiento actual; hará afirmaciones desactualizadas o simplemente ignorará hechos posteriores.
- **Riesgo de alucinación**: como cualquier LM de este tamaño sin alineamiento documentado, puede inventar hechos, citas y fechas, especialmente al preguntarle por detalles históricos concretos.
- **Licencia `other` sin términos publicados**: antes de cualquier uso comercial es imprescindible revisar las condiciones asociadas al acceso gated; la información disponible no permite confirmar si se autoriza el uso comercial.
- **Acceso restringido**: el repositorio es gated; la descarga exige aceptar condiciones y, en el caso de la CLI `chronollm`, disponer de un token proporcionado por el equipo del proyecto.
- **Sesgos desconocidos**: al no documentarse la composición del corpus, no se puede evaluar el sesgo lingüístico, cultural o ideológico del checkpoint.
- **Idiomas no declarados**: no se garantiza un rendimiento aceptable en castellano; habría que validarlo empíricamente.
- **Metadatos a verificar**: las fechas de creación y actualización del repositorio (2026) y la ausencia de pipeline o proveedor de inferencia aconsejan comprobar la procedencia y el estado real del artefacto antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfred8995/sn38-r3-2014-pomlnb-chronollm-2014
- Checkpoint hermano `pomlnb/chronollm-2014`: https://huggingface.co/pomlnb/chronollm-2014
- Variante `alfred8995/r16-H-M-Akds4-w50-s0`: https://huggingface.co/alfred8995/r16-H-M-Akds4-w50-s0
- Variante `alfred8995/r16-H-P3-d2c3q3-s100`: https://huggingface.co/alfred8995/r16-H-P3-d2c3q3-s100
- Dataset `pomlnb2/sn38-submission`: https://huggingface.co/datasets/pomlnb2/sn38-submission
- Paquete `chronollm` en PyPI: https://pypi.org/project/chronollm/
