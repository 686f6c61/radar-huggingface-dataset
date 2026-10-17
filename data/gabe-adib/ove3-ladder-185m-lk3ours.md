# gabe-adib/ove3-ladder-185m-lk3ours

## Resumen

`ove3-ladder-185m-lk3ours` es un checkpoint de investigación publicado por el usuario de Hugging Face `gabe-adib`. Corresponde a una ejecución concreta de la denominada "ove3 intervention ladder", en su variante K3 LatentMoE, con 185 millones de parámetros activos. La model card describe un MoE de tipo `kimi_linear` con arquitectura LatentMoE, 512 expertos de media anchura y enrutamiento top-16, entrenado con semilla 1234, RMSNorm con epsilon 1e-6 y escalado de router 2,446. El resto de la receta sigue la celda IsoFLOP de 185M: mismos datos, tasa de aprendizaje, batch y pasos.

El artefacto publicado no es un modelo instructivo ni una versión lista para producción: es un checkpoint distribuido de Megatron que incluye el estado del optimizador, acompañado de registros de entrenamiento, eventos de TensorBoard y un `config.yaml`. La model card reporta un checkpoint `best_1` en la iteración 18.810, con una pérdida de validación de 1,0892 y una pérdida held-out de 1,1796 nats/char, ponderada por mezcla sobre 9 dominios.

Su relevancia es principalmente experimental: permite reproducir y auditar una intervención arquitectónica sobre MoE con expertos LatentMoE, comparar curvas de validación y analizar el comportamiento del enrutamiento. No se dispone de licencia, idiomas soportados, longitud de contexto, número total de parámetros ni resultados de benchmarks de downstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con backbone denominado `kimi_linear` y expertos LatentMoE; 512 expertos de media anchura, top-16 |
| Parámetros totales | no disponible |
| Parámetros activos | 185M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publica checkpoint Megatron, sin versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron, con estado del optimizador incluido; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card indica que se trata de un MoE con 185M de parámetros activos, 512 expertos de media anchura y enrutamiento top-16. El componente de atención o backbone se denomina `kimi_linear`, y los expertos siguen el esquema LatentMoE. La ejecución usa semilla 1234, RMSNorm con epsilon 1e-6 y un factor de escalado de router de 2,446. La receta base es la celda IsoFLOP de 185M, por lo que mantiene los mismos datos, tasa de aprendizaje, batch y número de pasos que esa celda; no se detalla la composición del dataset ni el número total de tokens.

El checkpoint publicado es `best_1`, correspondiente a la iteración 18.810, que la model card identifica como el mejor paso de validación. La pérdida de validación reportada es 1,0892, y la pérdida held-out es 1,1796 nats/char, ponderada por mezcla sobre 9 dominios, con desglose por dominio en `DOMAIN_NLL.txt`. No se documenta el uso de RLHF, DPO u otro ajuste por preferencias, ni innovaciones adicionales de decodificación o atención más allá de las etiquetas arquitectónicas mencionadas.

## Capacidades

- Modelado autoregresivo de lenguaje: el objetivo reportado es `lm loss`, por lo que el checkpoint está entrenado para predecir el siguiente token.
- No hay evidencia de ajuste instructivo, plantilla de chat ni formato de diálogo en la información proporcionada.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades de razonamiento multi-paso, matemáticas o generación de código evaluadas.
- No se documentan capacidades de visión, audio ni multimodalidad.
- El soporte multilingüe no está disponible; no se especifican idiomas de entrenamiento.
- Capacidad principal demostrada: servir como artefacto reproducible para estudiar una intervención arquitectónica concreta en un MoE de 185M de parámetros activos.

## Casos de uso

- Reproducción de experimentos de escalado: el repositorio incluye logs de entrenamiento, logs de scoring, eventos de TensorBoard y `config.yaml`, lo que permite reconstruir la curva de validación y contrastar la iteración 18.810 con otras ejecuciones de la ladder.
- Estudio del enrutamiento de expertos: con 512 expertos y top-16, el checkpoint permite analizar qué expertos se activan por dominio y si el escalado de router de 2,446 produce especialización o desbalanceo.
- Ablaciones de hiperparámetros: la ejecución fija RMSNorm eps 1e-6 y router scaling 2,446; compararla con otras arms de la ladder permite aislar el efecto de estos valores en la pérdida de validación.
- Baseline en estudios IsoFLOP: al mantener datos, LR, batch y pasos de la celda IsoFLOP de 185M, sirve como referencia para comparar variantes arquitectónicas con el mismo presupuesto de cómputo.
- Análisis de pérdida por dominio: el fichero `DOMAIN_NLL.txt` permite estudiar el rendimiento en 9 dominios y detectar dominios con peor ajuste dentro de la mezcla.
- Investigación sobre eficiencia de MoE: los 185M de parámetros activos permiten estudiar el coste computacional por token, aunque la memoria necesaria depende del total de parámetros, que no se publica.
- Conversión y exportación para investigación: el checkpoint Megatron puede servir para probar pipelines de conversión a formatos de inferencia, siempre que se validen la configuración y el tokenizador.
- Docencia y divulgación técnica: es un ejemplo real de entrenamiento MoE con LatentMoE, útil para explicar enrutamiento top-16, checkpoints distribuidos y registro de métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Métrica | Valor | Contexto |
|---|---|---|
| Pérdida de validación (`lm loss`) | 1,0892 | Checkpoint `best_1`, iteración 18.810 |
| Pérdida held-out | 1,1796 nats/char | Media ponderada por mezcla sobre 9 dominios |
| Iteración del checkpoint | 18.810 | Mejor paso de validación según la model card |
| Dominios evaluados | 9 | Desglose disponible en `DOMAIN_NLL.txt` |

No se dispone de resultados de MMLU, HumanEval, GSM8K, ARC, Hellaswag ni de evaluaciones de seguridad o sesgo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. En un MoE, la memoria de pesos depende del número total de parámetros, no solo de los 185M activos; la model card no publica el total.
- El repositorio ocupa 29,1 GB, pero ese tamaño incluye el estado del optimizador y los logs, por lo que no debe interpretarse como el tamaño de los pesos en inferencia.
- GPU recomendadas: no disponible. Sin el número total de parámetros y el formato de checkpoint convertido, no es posible recomendar A100, H100, RTX 4090 u otras GPU con rigor.
- Ajuste en GPU de consumo: no confirmado. Depende del total de parámetros, del formato de pesos y de si se aplica cuantización; no se publican versiones GGUF ni cuantizadas.
- Despliegue: el formato nativo es un checkpoint distribuido de Megatron, por lo que requiere Megatron-LM o un proceso de conversión para usarlo con Hugging Face Transformers, vLLM, TGI, llama.cpp u Ollama. No se documenta compatibilidad directa con estas herramientas.
- Latencia y throughput: no disponible. Los 185M de parámetros activos reducen el coste computacional por token, pero no permiten estimar la latencia sin conocer el total de parámetros, el hardware y el software de inferencia.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos alternativos comparables de forma directa. No se dispone de datos de parámetros totales, contexto, licencia, benchmarks ni disponibilidad de otras ejecuciones de la misma ladder o de modelos MoE con 185M de parámetros activos. Tampoco hay resultados de MMLU, HumanEval o GSM8K que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso para uso comercial, redistribución o modificación.
- Idiomas no disponibles: no se puede garantizar un comportamiento correcto en castellano ni en ningún otro idioma concreto.
- Es un checkpoint de investigación, no un modelo instructivo: no se documenta ajuste por instrucciones, plantilla de chat ni alineación con preferencias humanas.
- Riesgo de alucinación y generación degenerada: al ser un modelo base entrenado con `lm loss`, puede producir texto incoherente o factualmente incorrecto.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones multi-turno o documentos largos.
- Sesgos y contaminación desconocidos: no se detalla la composición del dataset de entrenamiento ni los filtros aplicados.
- Total de parámetros no disponible: impide estimar con precisión la VRAM, el coste de despliegue y la viabilidad en GPU de consumo.
- Formato Megatron con estado del optimizador: no es directamente cargable en la mayoría de stacks de inferencia; requiere conversión y validación.
- Sin benchmarks downstream: la única métrica publicada es la pérdida de lenguaje, que no mide capacidades prácticas como razonamiento, código o matemáticas.
- Los 29,1 GB del repositorio no equivalen al tamaño del modelo en inferencia; incluyen logs y estado del optimizador.
- No se documenta tokenizador, vocabulario ni configuración de atención; estos datos son necesarios para una conversión fiable.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/gabe-adib/ove3-ladder-185m-lk3ours)
- [Perfil del autor en Hugging Face](https://huggingface.co/gabe-adib)
- No se han encontrado enlaces a papers, blogs, repositorios o demos relacionados en la información disponible.
