# gabe-adib/ove3-ladder-440m-lk3x1024

## Resumen

`ove3-ladder-440m-lk3x1024` es un checkpoint de investigación publicado por el usuario de Hugging Face `gabe-adib`. Corresponde a una ejecución de la denominada intervention ladder ove3, en la variante K3 LatentMoE, con una arquitectura que el autor describe como `kimi_linear MoE` y 440M de parámetros activos. El modelo usa LatentMoE con 1.024 expertos de media anchura, enrutamiento top-16 y parámetros enrutados 2x, además de RMSNorm con epsilon 1e-5 y escalado de router 1,0.

El checkpoint seleccionado es `best_1`, iteración 27.200, con pérdida de validación de 1,0487 y pérdida held-out de 1,1326 nats/char ponderada sobre 9 dominios. No es un modelo listo para producción: el repositorio contiene un checkpoint distribuido de Megatron con estado del optimizador, logs y configuración, pero no se indican licencia, idiomas, longitud de contexto, tokenizer ni resultados de benchmarks estándar. Su interés es fundamentalmente reproducir y analizar experimentos de escalado y enrutamiento MoE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención denominada `kimi_linear` y LatentMoE, según la model card |
| Parámetros totales | no disponible |
| Parámetros activos | 440M |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; no se incluyen versiones cuantizadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint distribuido de Megatron con estado del optimizador; no safetensors ni GGUF |
| Expertos | 1.024 expertos de media anchura |
| Enrutamiento | top-16, con parámetros enrutados 2x |
| Normalización | RMSNorm con epsilon 1e-5 |
| Escalado de router | 1,0 |
| Semilla | 1234 |
| Iteración del checkpoint | 27.200 (`best_1`) |
| Tamaño del repositorio | 138,9 GB |

## Arquitectura y entrenamiento

La información disponible no detalla el número de capas, la dimensión oculta, las cabezas de atención ni el mecanismo exacto de atención. El autor denomina la arquitectura `kimi_linear MoE` e indica que incorpora LatentMoE con 1.024 expertos de media anchura, top-16 y parámetros enrutados 2x. No se especifica si se trata de atención lineal pura, híbrida o de otro tipo. El checkpoint pertenece a la celda IsoFLOP de 440M de la receta ove3, con los mismos datos, learning rate, batch y pasos que la receta base.

No se indican el número de tokens de entrenamiento, la composición del dataset, el tokenizer ni si hubo RLHF, DPO u otra fase de alineamiento. El checkpoint `best_1` se guardó en la iteración 27.200, con pérdida de validación de 1,0487 y pérdida held-out de 1,1326 nats/char ponderada sobre 9 dominios. El repositorio incluye logs de entrenamiento por segmentos de 4 horas, logs de scoring y eventos de TensorBoard, lo que facilita la auditoría del run, pero no se aporta un informe técnico adicional.

## Capacidades

- Modelado de lenguaje autorregresivo: el checkpoint se entrenó con un objetivo de lenguaje y se reporta pérdida de validación y held-out, pero no se aportan muestras ni evaluaciones de generación.
- Generación de texto: no evaluada en la información disponible.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling o function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales como modo thinking, visión o audio: no disponible.
- Evaluación multi-dominio: la pérdida held-out se pondera sobre 9 dominios, pero no se identifican cuáles en la model card.

## Casos de uso

- Reproducción de la receta IsoFLOP de 440M: cargar `config.yaml` y el checkpoint `best_1` en Megatron-LM para comparar la pérdida de validación con otras ejecuciones de la ladder ove3. Es adecuado porque se conserva el estado del optimizador y los logs por segmentos de 4 horas.
- Análisis de enrutamiento MoE: estudiar el comportamiento de top-16 sobre 1.024 expertos de media anchura y el escalado de router 1,0. Requiere instrumentar el checkpoint; no hay métricas de equilibrio de carga publicadas.
- Investigación de LatentMoE: usar esta ejecución como brazo K3 para comparar representaciones latentes y parámetros enrutados 2x frente a otras variantes de la ladder.
- Evaluación por dominio: explotar `DOMAIN_NLL.txt` para analizar la pérdida held-out en 9 dominios, con una pérdida ponderada de 1,1326 nats/char. Es útil para estudiar qué dominios penalizan más la receta, aunque los dominios no se identifican en la información.
- Conversión y validación de checkpoints Megatron: construir un pipeline de exportación a safetensors o formato Hugging Face y verificar que la pérdida se mantiene. Es un caso realista porque el repositorio no incluye un formato de inferencia directo.
- Auditoría de entrenamiento: revisar los logs de TensorBoard y los scoring logs para detectar inestabilidades, picos de pérdida o problemas relacionados con RMSNorm epsilon 1e-5.
- Punto de partida para experimentos de fine-tuning: inicializar un modelo de investigación con 440M de parámetros activos y comparar con la celda base, siempre que se disponga del tokenizer y de la configuración completa.
- Docencia o divulgación técnica: ilustrar una arquitectura MoE con 1.024 expertos y top-16, aunque no sirve como demo interactiva sin un proceso previo de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar en la información disponible.

| Evaluación | Resultado | Notas |
|---|---|---|
| Pérdida de validación (`best_1`, iteración 27.200) | 1,0487 | Pérdida de validación reportada por el autor |
| Pérdida held-out ponderada, 9 dominios | 1,1326 nats/char | Ponderación por mezcla; por dominio en `DOMAIN_NLL.txt` |
| MMLU, HumanEval, GSM8K u otros benchmarks | no disponible | No publicados en la información proporcionada |

La pérdida en nats/char no es directamente comparable con métricas de otros modelos si cambian el tokenizer, el dataset o la ponderación por dominio. No se aportan resultados de generación, razonamiento, código ni evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El número total de parámetros no se publica y, en un MoE, la VRAM depende de si se cargan todos los expertos o se aplica offloading.
- GPU recomendadas: no disponible. No se especifica el uso de A100, H100, RTX 4090 ni otras GPU para entrenamiento o inferencia.
- Cabe en GPU de consumo: no confirmado. Los 440M de parámetros activos no permiten concluirlo, porque el total de expertos y el formato Megatron condicionan la memoria necesaria.
- Despliegue: Megatron-LM para cargar o reanudar el checkpoint. Para vLLM, TGI, llama.cpp u Ollama haría falta una conversión y validación previas; no se documenta soporte directo ni se incluyen pesos GGUF.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 138,9 GB e incluye estado del optimizador; conviene prever espacio adicional para conversión, inferencia y copias de seguridad.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparación fiable con modelos de la misma categoría. No se identifican en la información proporcionada alternativas con la misma combinación de LatentMoE, 1.024 expertos, top-16 y 440M de parámetros activos, ni benchmarks comunes que permitan una comparación rigurosa.

| Modelo | Parámetros activos | Contexto | Benchmarks públicos | Licencia | Formato |
|---|---|---|---|---|---|
| `ove3-ladder-440m-lk3x1024` | 440M | no disponible | solo pérdidas de validación y held-out | no disponible | checkpoint Megatron |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no se concede explícitamente uso comercial, modificación ni redistribución. Es necesario contactar con el autor antes de cualquier uso fuera de investigación.
- Checkpoint no listo para inferencia: incluye estado del optimizador y está en formato distribuido de Megatron; requiere conversión y validación antes de usarlo con herramientas de inferencia habituales.
- No se proporciona tokenizer ni se documentan los idiomas soportados, la longitud de contexto o el preprocesado esperado.
- No hay resultados de benchmarks estándar ni evaluaciones de sesgo, alucinación o robustez.
- La pérdida en nats/char no es directamente comparable entre modelos con tokenizers o datasets distintos.
- Es un artefacto de investigación con una única semilla (1234) y una única ejecución; no hay evidencia de estabilidad más allá de este run.
- No hay adopción pública registrada en la información de Hugging Face (0 descargas y 0 likes en el momento de la consulta), lo que limita la validación externa.
- No se recomienda su uso en producción, atención al cliente o generación de código sin una evaluación previa completa y una licencia clara.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/gabe-adib/ove3-ladder-440m-lk3x1024)
- [Perfil del autor en Hugging Face](https://huggingface.co/gabe-adib)
- [Directorio del checkpoint](https://huggingface.co/gabe-adib/ove3-ladder-440m-lk3x1024/tree/main/checkpoint)
- [Directorio de logs](https://huggingface.co/gabe-adib/ove3-ladder-440m-lk3x1024/tree/main/logs)
- [Configuración del run](https://huggingface.co/gabe-adib/ove3-ladder-440m-lk3x1024/blob/main/config.yaml)

No se han encontrado papers, blogs, repositorios adicionales o demos en la información proporcionada.
