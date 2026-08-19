# sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed1234_step510

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed1234_step510` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace por el usuario sbcho0325. Se trata de un fine-tuning realizado mediante Supervised Fine-Tuning (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, un LLM de 7.8 mil millones de parámetros desarrollado por LG AI Research. El nombre del repositorio sugiere que el entrenamiento se centra en razonamiento verificado (verireason), con una semilla fija (1234) y un checkpoint intermedio (step 510), aunque no se proporcionan detalles adicionales sobre el dataset o el procedimiento.

Este adaptador tiene un tamaño de solo 0.3 GB, lo que indica que es un conjunto de pesos LoRA que debe combinarse con el modelo base para su uso. La ficha del modelo en HuggingFace está prácticamente vacía, sin descripción, licencia, idiomas ni benchmarks publicados. Su relevancia es limitada fuera del ámbito de investigación experimental, ya que no se documentan las capacidades específicas ni los casos de uso previstos. Al estar construido sobre EXAONE-3.5, hereda las capacidades generales de ese modelo base, pero no hay evidencia pública de mejoras o especializaciones concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (modelo base EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el adaptador tiene ~0.3 GB, el modelo base tiene 7.8B) |
| Parametros activos | No disponible (no es un MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors, sin cuantizacion propia) |
| Idiomas soportados | No disponibles (el modelo base soporta varios idiomas, pero no se especifica) |
| Licencia | No disponible (el modelo base tiene licencia de LG AI, pero el adaptador no declara ninguna) |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA, que introduce matrices de baja dimension en las capas del transformer del modelo base para ajustar los pesos con un coste computacional reducido. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning), un método estandar que ajusta el modelo con pares de instrucciones y respuestas. Los hiperparametros exactos, el dataset utilizado y el regimen de entrenamiento (precision mixta, numero de epocas, etc.) no se han publicado en la ficha del modelo. El nombre del repositorio indica que se usó una semilla aleatoria fija (1234) y que el checkpoint corresponde al paso 510, lo que sugiere un entrenamiento relativamente corto. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto: al ser un adaptador sobre EXAONE-3.5-Instruct, puede generar texto coherente y seguir instrucciones, aunque no hay evaluaciones especificas del adaptador.
- Razonamiento: el nombre "verireason" sugiere un enfasis en razonamiento verificado, pero no se aportan evidencias ni ejemplos.
- Multilingue: el modelo base EXAONE-3.5 soporta varios idiomas, pero el adaptador no declara idiomas concretos.
- Tool calling y funciones: no se documenta soporte especifico.
- Capacidades especiales (vision, audio, thinking mode): no se mencionan.

## Casos de uso

- Investigacion academica: el adaptador puede servir como punto de partida para estudiar el efecto del fine-tuning con LoRA en modelos de razonamiento, comparando con otros checkpoints de la misma serie (diferentes seeds o pasos).
- Experimentacion con PEFT: desarrolladores que trabajen con la libreria PEFT pueden cargar este adaptador para probar tecnicas de adaptacion de bajo rango sobre EXAONE-3.5.
- Reproducibilidad: al estar publicada la semilla y el paso de entrenamiento, es posible reproducir o continuar el entrenamiento si se dispone del dataset original (no publicado).
- Fine-tuning adicional: el adaptador puede combinarse con otros adaptadores o servir como inicializacion para tareas especificas, aunque sin documentacion es arriesgado.
- Evaluacion comparativa: puede usarse en suites de evaluacion para medir el impacto de diferentes estrategias de SFT en modelos de 7.8B.
- Prototipado rapido: para pruebas locales donde se requiera un modelo ajustado sin necesidad de entrenar desde cero, siempre que se combine con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador. Tampoco se proporcionan comparaciones con el modelo base o con otros adaptadores similares.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en si. Para inferencia se necesita cargar el modelo base completo (7.8B parametros), lo que requiere aproximadamente 16 GB de VRAM en precision FP16, o menos con cuantizacion (por ejemplo, 8 GB en 4 bits).
- GPU recomendadas: no hay recomendaciones especificas. Para el modelo base, una GPU con al menos 16 GB (RTX 4090, A100, etc.) es adecuada.
- Consumer GPU: si, es posible ejecutar el modelo base cuantizado en GPUs de consumo con 8-12 GB (RTX 3080/4080, etc.), pero el adaptador no aporta ventajas adicionales.
- Opciones de despliegue: el adaptador requiere la libreria PEFT para combinarse con el modelo base. Se puede usar con transformers, vLLM (si soporta LoRA), llama.cpp (con conversion a GGUF), u Ollama (si se empaqueta).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han publicado comparaciones con otros adaptadores LoRA o modelos de la familia EXAONE. El unico punto de referencia seria el propio modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, pero no se dispone de datos de rendimiento para este adaptador.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: no se evalua especificamente; como cualquier LLM, puede generar informacion falsa.
- Limitaciones de contexto e idioma: desconocidas para el adaptador; dependen del modelo base.
- Restricciones de licencia: el adaptador no declara licencia, lo que impide su uso comercial sin autorizacion explicita. El modelo base tiene su propia licencia de LG AI que debe respetarse.
- Documentacion insuficiente: la ausencia de detalles sobre el dataset, el entrenamiento y la evaluacion hace que el adaptador no sea fiable para produccion sin validacion previa.
- Tamano del adaptador: al ser solo pesos LoRA, no es un modelo autonomo; requiere el modelo base, que es considerablemente mas grande.

## Enlaces

- HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-verireason_random_sft_seed1234_step510
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
