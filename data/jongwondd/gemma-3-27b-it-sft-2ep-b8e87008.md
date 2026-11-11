# Jongwondd/Gemma-3-27B-IT-SFT-2ep-b8e87008

## Resumen

Gemma-3-27B-IT-SFT-2ep-b8e87008 es un adaptador LoRA publicado por el usuario Jongwondd sobre el modelo base google/gemma-3-27b-it. No se trata de un modelo independiente, sino de un checkpoint final de un entrenamiento de ajuste supervisado (SFT) de dos épocas orientado a una tarea de investigación sobre negación, según las etiquetas de la model card. El repositorio contiene únicamente los pesos del adaptador (0,5 GB), no los pesos completos del modelo base.

El modelo hereda la arquitectura multimodal de Gemma 3 27B IT, que procesa entradas de imagen y texto y genera texto. El adaptador se ha entrenado con el dataset PopQA de entrenamiento (14.951 pares sobre 4.534 casos), completando 2 épocas, 29.902 ejemplos vistos y 1.890 pasos de optimizador, con rango LoRA 16, alpha 32 y dropout 0.

Su relevancia es limitada y acotada a la investigación: no se publican resultados de evaluación, no se reclama paridad de inferencia en el Hub y el autor lo describe explícitamente como un checkpoint de investigación no validado para producción. Resulta útil para reproducir o auditar experimentos de negación sobre Gemma 3, no como modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de google/gemma-3-27b-it); adaptador LoRA (PEFT) |
| Parametros totales | 27B en el modelo base; el adaptador no declara su numero de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; los pesos se publican como adaptador en safetensors (bfloat16 en carga) |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (licencia del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA PEFT); no incluye pesos del modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-27b-it (revision `005ad3404e59d6023443cb575daa05336842228a`), un transformer multimodal de 27.000 millones de parametros que acepta entradas de imagen y texto. La intervencion es un LoRA de rango 16 con alpha 32 y dropout 0, inicializado desde el modelo base sin fusionar (fresh base). El entrenamiento fue SFT sobre la particion de entrenamiento de PopQA: 14.951 pares distribuidos en 4.534 casos, 2 epocas completas, 29.902 ejemplos vistos y 1.890 pasos de optimizador.

El autor indica que los bytes de los pesos no se han modificado; solo se ha hecho portable el localizador del modelo base y su revision en la configuracion PEFT, y se registran los hashes de configuracion original y publicada en `training_provenance.json`. Ese mismo fichero contiene el objetivo especifico del metodo, los ajustes de entrenamiento retenidos y los hashes del resumen de fuentes y de los datos de entrenamiento. El autor advierte que las perdidas de entrenamiento no son puntuaciones de evaluacion y que las lineas base SFT/UL/DPO son ejecuciones distintas, no checkpoints ALiT.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Gemma 3 27B IT.
- Procesamiento de entradas imagen-texto y generacion de texto (pipeline `image-text-to-text`).
- Capacidad multilingue limitada al ingles segun la model card.
- Ajuste especifico orientado a negacion (etiqueta `negation`), encuadrado en investigacion.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada; se heredaria, en su caso, del modelo base.
- Modo thinking, vision o audio especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de negacion: cargar el adaptador sobre Gemma 3 27B IT con PEFT y Transformers para replicar o auditar el entrenamiento SFT de dos epocas descrito en la model card.
- Investigacion academica sobre ajuste fino con LoRA: el checkpoint sirve como referencia de configuracion (rango 16, alpha 32, dropout 0) y de trazabilidad mediante `training_provenance.json`.
- Analisis de procedencia y auditoria de pesos: los hashes SHA-256 del adaptador y de la configuracion permiten verificar la integridad de la release.
- Estudio de olvido catastrofico y sesgos de ajuste: comparar el comportamiento del adaptador frente al modelo base en tareas generales para medir el impacto del SFT sobre PopQA.
- Desarrollo de pipelines de evaluacion de negacion: usar el adaptador como sujeto de pruebas en conjuntos de evaluacion propios, teniendo en cuenta que las particiones ya observadas son datos de desarrollo, no test independiente.
- Base para experimentos derivados: partir de este adaptador para nuevos ajustes o para comparaciones con otras ejecuciones SFT/UL/DPO del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que esta subida no anade resultados de evaluacion ni reclama reproducir las cifras del manuscrito, y que las puntuaciones proxy basadas en reglas no equivalen a precision de juez semantico.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El adaptador ocupa 0,5 GB, pero la inferencia requiere cargar el modelo base de 27B parametros en bfloat16 (aproximadamente 54 GB de pesos, sin contar cache KV ni overhead).
- GPU recomendadas: para el modelo base en bfloat16 se requiere hardware de clase A100 80 GB o H100 80 GB; no confirmado en la informacion proporcionada.
- GPU de consumo: no disponible en la informacion proporcionada; el modelo base de 27B en bfloat16 no cabe en GPU de consumo convencionales, y no se documentan opciones de cuantizacion para este adaptador.
- Opciones de despliegue: la model card solo documenta carga via Transformers (`Gemma3ForConditionalGeneration`) y PEFT (`PeftModel`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Jongwondd/Gemma-3-27B-IT-SFT-2ep-b8e87008 | 27B (base) + adaptador LoRA | No disponible | Gemma | safetensors (adaptador PEFT) | Checkpoint de investigacion sobre negacion; sin evaluacion publicada |
| google/gemma-3-27b-it | 27B | No disponible en la informacion proporcionada | Gemma | safetensors | Modelo base multimodal oficial; referencia de comparacion |
| Otras ejecuciones SFT/UL/DPO del mismo autor | 27B (base) + adaptador | No disponible | Gemma | safetensors (adaptador PEFT) | Lineas base distintas, no checkpoints ALiT, segun la model card |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente: requiere descargar y cargar google/gemma-3-27b-it, con el acceso que el proveedor exija.
- Checkpoint de investigacion sin validacion de seguridad: el autor advierte que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- Sin resultados de evaluacion publicados; no se reclama reproducir las cifras del manuscrito asociado.
- Las particiones de evaluacion previamente observadas son datos de desarrollo, no test independiente.
- Las puntuaciones proxy basadas en reglas no equivalen a precision de juez semantico.
- Las perdidas de entrenamiento no son puntuaciones de evaluacion.
- Cobertura linguistica limitada al ingles segun la model card.
- Licencia Gemma: se aplican las restricciones de uso del modelo base; consultar `LICENSE`, `NOTICE` y `USE_POLICY.md`.
- No se reclama paridad de descarga e inferencia en el Hub; la validacion local se limito al parseo de la configuracion del adaptador.
- No se implica afiliacion ni respaldo del proveedor del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongwondd/Gemma-3-27B-IT-SFT-2ep-b8e87008
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Revision del modelo base: `005ad3404e59d6023443cb575daa05336842228a`
- Fichero de procedencia de entrenamiento: `training_provenance.json` (incluido en el repositorio del adaptador)
- Dataset citado: PopQA (particion de entrenamiento)
