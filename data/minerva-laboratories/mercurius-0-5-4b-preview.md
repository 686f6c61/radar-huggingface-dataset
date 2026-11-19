# Minerva-Laboratories/Mercurius-0.5-4B-Preview

## Resumen

Mercurius 0.5 4B Preview es un checkpoint intermedio publicado por Minerva-Laboratories dentro de su Mercurius-Pipeline, un proceso de destilación y reestructuración arquitectónica que parte de Qwen3.5-4B. El modelo no es un transformer convencional: el estudiante se ha convertido en una arquitectura híbrida compuesta por 24 capas GDN-2 (atención lineal de tipo gated delta network) y 8 capas MLA (multi-head latent attention), con adaptadores VeRA y un mecanismo de caché KV propio denominado FoveaKV 2+2 con un 10% de tokens dinámicos (Dyn10). El profesor empleado para la destilación es Qwen3.6-35B-A3B, servido mediante llama.cpp.

El entrenamiento está pausado en el paso 5825 de 6300, con entrenamiento consciente de cuantización (QAT) activo desde el paso 4200, lo que explica que los pesos publicados estén empaquetados en Q4/Q8 en lugar de en precisión completa. El corpus de entrenamiento combina 70,8 millones de tokens de texto, 39,1 millones de tokens de episodios agénticos y 10,4 millones de tokens matemáticos. La relevancia de esta publicación es fundamentalmente experimental: documenta una vía poco habitual de reconversión de un modelo denso de 4B en un híbrido con atención lineal y caché KV selectiva, aunque el propio autor advierte de que se trata de un checkpoint intermedio y no de una versión final.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors empaquetados y en GGUF, ambos ligados a herramientas propias del pipeline. No es un checkpoint estándar de Transformers ni se carga con llama.cpp sin parches.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas GDN-2 (atención lineal) + 8 capas MLA, con adaptadores VeRA |
| Parametros totales | 1.502.753.280 (dato real de safetensors); el autor lo etiqueta como 4B por herencia del modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de evaluación; perplexity medida a 65.536 |
| Tipos de cuantizacion | Pesos empaquetados Q4/Q8 (formato propietario `mercurius-packed-v1`); GGUF con Q4/Q8 empaquetados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado, no estándar), GGUF (requiere fork parcheado de llama.cpp), resume.pt (estado de entrenamiento) |

## Arquitectura y entrenamiento

El estudiante parte de Qwen3.5-4B y se reconvierte en un híbrido de 32 capas: 24 capas GDN-2, que sustituyen la atención completa por atención lineal con estado recurrente, y 8 capas MLA, que mantienen atención con compresión latente de claves y valores. Sobre esta base se insertan adaptadores VeRA (variante de bajo rango con vectores compartidos), lo que reduce el número de parámetros entrenables. La caché KV se gestiona con FoveaKV 2+2, un esquema que reserva 2 capas con caché completa y 2 con caché selectiva, y que descarta dinámicamente el 10% de los tokens (Dyn10) para limitar el crecimiento de memoria en contextos largos.

El entrenamiento es una destilación desde Qwen3.6-35B-A3B (un MoE de 35B con 3B activos) servido por llama.cpp, sobre un corpus de 120,3 millones de tokens en total: 70,8M de texto, 39,1M de episodios agénticos y 10,4M de matemáticas. Desde el paso 4200 se aplica QAT, de ahí que los pesos publicados estén ya empaquetados en Q4/Q8. El checkpoint se detiene en el paso 5825 de 6300, por lo que el proceso de destilación no ha concluido. La innovación principal es la combinación de atención lineal con caché KV selectiva en un modelo de este tamaño, junto con el formato de pesos empaquetado y el fork de llama.cpp necesario para servirlo.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Razonamiento matemático: 91,96% en GSM8K, aunque el propio autor señala que el split de entrenamiento forma parte del corpus (resultado en dominio).
- Generación de código: 68,90% en HumanEval y 71,21% en MBPP sanitized, por debajo del modelo base.
- Razonamiento sobre contextos largos: 83,38% en RULER con 5 tareas a 32K.
- Capacidades agénticas: el corpus incluye 39,1M de tokens de episodios agénticos, lo que sugiere entrenamiento orientado a flujos multi-paso.
- Perfil de decodificación específico `qwen35_nonthinking_v1` (temperatura 0.7, top-p 0.8, top-k 20, presence penalty 1.5), lo que implica que el modo "thinking" no se usa en la evaluación publicada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.

## Casos de uso

- Investigación sobre arquitecturas híbridas: sirve como banco de pruebas para medir el impacto de sustituir atención completa por GDN-2 y MLA en un modelo de ~1,5B parámetros reales, comparando directamente contra Qwen3.5-4B con el mismo protocolo de decodificación.
- Estudio de caché KV selectiva: FoveaKV 2+2 con Dyn10 permite experimentar con políticas de descarte de tokens en contextos de 32K a 65K, útil para grupos que investigan eficiencia de memoria en inferencia.
- Evaluación de QAT en producción: al estar los pesos empaquetados en Q4/Q8 desde el paso 4200, el checkpoint permite analizar la degradación de calidad asociada a la cuantización consciente frente al modelo base en precisión completa.
- Prototipado de pipelines de destilación: el repositorio `Mercurius-Pipeline` y el estado `resume.pt` documentan el proceso completo, lo que facilita reproducir o extender la receta con otros profesores o corpus.
- Benchmarking de decodificación en contextos largos: con RULER a 32K y perplexity a 65.536, es adecuado para validar implementaciones de atención lineal en tareas de recuperación de información en documentos extensos.
- Análisis de fallos en generación de código: dado que el autor reporta salidas repetitivas largas en algunos prompts de código, el modelo resulta útil para estudiar modos de fallo de la destilación en tareas de programación y diseñar mitigaciones.

## Benchmarks y rendimiento

Resultados medidos con llama.cpp/CUDA, FoveaKV Dyn10 y perfil `qwen35_nonthinking_v1`, con límite de generación de 32.768 tokens.

| Benchmark | Mercurius 5825 | Qwen3.5-4B, mismo protocolo |
|---|---:|---:|
| HumanEval (164) | 68,90% | 84,15% |
| MBPP sanitized (257) | 71,21% | 79,38% |
| GSM8K (1.319) | 91,96% | 94,16% |
| RULER, 5 tareas a 32K (200) | 83,38% | parcial |
| PG-19 perplexity a 65.536 (12 libros) | 13,09 | parcial |

El propio autor advierte de que GSM8K está en dominio porque su split de entrenamiento forma parte del corpus. En el resto de benchmarks el checkpoint intermedio queda por debajo del modelo base, especialmente en código.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos empaquetados Q4/Q8 y ~1,5B parámetros reales, la carga en memoria rondaría los 1-2 GB para los pesos; el consumo adicional depende de la caché FoveaKV y del contexto, que a 32K puede añadir varios GB.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de consumo con al menos 8 GB, pero el autor no publica requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño real de 1,5B parámetros, aunque no hay confirmación del autor.
- Opciones de despliegue: llama.cpp con el fork parcheado construido por `scripts/build_native_bench.sh` (el llama.cpp estándar no carga el GGUF correctamente); pipeline PyTorch propio con `config.json`, tokenizer y `export-manifest.json`. vLLM, TGI y Ollama no están soportados según la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | GSM8K | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Mercurius 0.5 4B Preview | 1,5B reales (etiquetado 4B) | 32K evaluado | 68,90% | 91,96% | Apache 2.0 | Pesos empaquetados + GGUF con fork |
| Qwen3.5-4B (base) | 4B | no disponible | 84,15% | 94,16% | no disponible | Estándar |
| Qwen3.6-35B-A3B (profesor) | 35B totales, 3B activos | no disponible | no disponible | no disponible | no disponible | Estándar |

La comparación directa con el modelo base es la más informativa: el checkpoint intermedio pierde 15,25 puntos en HumanEval y 8,17 en MBPP respecto a Qwen3.5-4B, y 2,2 puntos en GSM8K. No se dispone de datos de otros modelos híbridos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento está pausado en el paso 5825 de 6300, por lo que no es una versión final ni representa el techo de la receta.
- Degradación frente al base: pierde entre 8 y 15 puntos en benchmarks de código respecto a Qwen3.5-4B.
- Salidas repetitivas: el autor reporta generaciones largas y repetitivas en algunos prompts de código.
- GSM8K en dominio: el split de entrenamiento forma parte del corpus, por lo que el 91,96% no es comparable con evaluaciones zero-shot.
- Formato no estándar: los pesos safetensors están empaquetados (`mercurius-packed-v1`) y no se cargan con Transformers convencional; el GGUF requiere un fork parcheado de llama.cpp.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo destilado de 1,5B parámetros reales.
- Idiomas soportados: no especificados; no hay garantía de cobertura multilingüe más allá de la del modelo base.
- Sesgos: no documentados por el autor.
- Licencia Apache 2.0: permite uso comercial, pero la dependencia de un fork de llama.cpp y de un pipeline propio condiciona el despliegue en producción.
- Sin datos de tool calling ni de capacidades multimodales: no apto para esos casos sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Minerva-Laboratories/Mercurius-0.5-4B-Preview
- Repositorio del pipeline (rama `feat/native-foveakv-evaluation`): `Minerva-Laboratories/Mercurius-Pipeline` (referenciado en la model card; URL no proporcionada)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o demo adicionales: no disponible
