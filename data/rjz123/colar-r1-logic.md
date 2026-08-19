# rjz123/colar-r1-logic

## Resumen

`rjz123/colar-r1-logic` es un adaptador PEFT (LoRA) de investigación desarrollado por el usuario rjz123, diseñado para aplicar la técnica de compresión latente de cadenas de razonamiento CoLaR (Compressed Latent Reasoning) sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. El adaptador se ha entrenado sobre un conjunto de datos de razonamiento lógico compuesto por ProsQA, FOLIO y LogiQA, con el objetivo de reducir el coste computacional del razonamiento explícito (chain-of-thought) mediante la compresión de los pasos intermedios en un espacio latente.

El modelo no es un modelo autónomo: se distribuye como un checkpoint de PyTorch-Lightning que solo contiene los pesos del adaptador (LoRA r128 en Q y V, más un MLP `LatentPolicy`), y requiere cargar el modelo base por separado y ensamblar ambos componentes manualmente. No es compatible con la carga estándar vía `AutoModel` de HuggingFace, lo que limita su uso a entornos de investigación con el código específico de CoLaR.

La relevancia de este adaptador radica en que representa una aplicación práctica de CoLaR (publicado en NeurIPS 2025 por Xiaomi Research) a un dominio concreto —la lógica formal y el razonamiento deductivo—, demostrando la viabilidad de comprimir cadenas de razonamiento sin perder precisión. Sin embargo, al ser un experimento sin documentación completa, sin licencia declarada y sin resultados de evaluación públicos, debe tratarse como material de investigación preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre DeepSeek-R1-Distill-Qwen-1.5B (transformer decoder-only) con MLP de política latente |
| Parametros totales | no disponible (el adaptador es ~0.1 GB, pero los parámetros del adaptador no se especifican) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible (heredada del base, 32 768 tokens para DeepSeek-R1-Distill-Qwen-1.5B, pero no confirmada) |
| Tipos de cuantizacion | no disponible (el checkpoint es en precisión completa, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles (el modelo base soporta principalmente chino e inglés; el adaptador no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`colar_r1_logic.ckpt`) con claves bajo `state_dict`; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador se basa en el marco CoLaR (Compressed Latent Reasoning) de Xiaomi Research, presentado en NeurIPS 2025. CoLaR modifica un LLM estándar para que, en lugar de generar tokens de razonamiento explícitos, comprima la cadena de razonamiento en un conjunto de vectores latentes (típicamente 5 vectores de 64 dimensiones, según las variables de entorno `COLAR_COMPRESS=5` y `COLAR_MAXLAT=64`). La arquitectura añade un MLP `LatentPolicy` que decide cuántos pasos latentes generar y cómo combinarlos con la representación del contexto.

El entrenamiento se realizó sobre el modelo base DeepSeek-R1-Distill-Qwen-1.5B, con un warm-start desde un checkpoint previo de CoLaR entrenado en GSM (según la variable `COLAR_CKPT=colar-gsm/colar_best.ckpt`). Se usaron los conjuntos de datos de razonamiento lógico ProsQA, FOLIO y LogiQA, con 25 épocas y una función de pérdida MSE (según la descripción "comp5, mse, 25ep"). Se aplicó LoRA con rango 128 en las proyecciones Q y V, y se redimensionó la capa de embeddings para acomodar el token `[PAD]` adicional. La descripción "配方偏离" (desviación de la receta) sugiere que el entrenamiento se apartó ligeramente de la configuración original de CoLaR.

## Capacidades

- Razonamiento lógico y deductivo: entrenado específicamente en ProsQA, FOLIO y LogiQA, orientado a problemas de lógica formal, silogismos y razonamiento proposicional.
- Razonamiento latente comprimido: capaz de generar representaciones internas comprimidas en lugar de cadenas de texto explícitas, reduciendo potencialmente el coste de inferencia.
- Generación de texto: hereda las capacidades de generación del modelo base DeepSeek-R1-Distill-Qwen-1.5B, aunque el adaptador no está optimizado para tareas generales.
- No se declaran capacidades de tool calling, agentes, visión o audio. El pipeline es exclusivamente text-generation.

## Casos de uso

- Investigación en compresión de razonamiento: permite estudiar cómo la compresión latente afecta a la precisión en tareas de lógica, comparando con el modelo base sin adaptador.
- Evaluación de CoLaR en dominios específicos: sirve como punto de partida para reproducir o extender los experimentos de CoLaR en razonamiento lógico, usando los conjuntos ProsQA, FOLIO y LogiQA.
- Prototipado de sistemas de razonamiento eficientes: en entornos con recursos limitados, el adaptador podría explorarse para reducir la latencia en tareas de lógica, aunque requiere la infraestructura CoLaR completa.
- Benchmarking de adaptadores PEFT: útil para comparar el rendimiento de LoRA con rango 128 frente a otros métodos de ajuste eficiente en tareas de razonamiento.
- Estudio de la transferencia entre dominios: al hacer warm-start desde un checkpoint entrenado en GSM, permite analizar si el razonamiento matemático previo ayuda al razonamiento lógico.
- Desarrollo de nuevas variantes de CoLaR: el checkpoint puede servir como base para experimentos con diferentes configuraciones de compresión (número de vectores latentes, dimensiones, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K, FOLIO, LogiQA ni ninguna otra evaluación. Tampoco se indica el rendimiento en términos de latencia o throughput.

## Requisitos de hardware

- El adaptador en sí es ligero (~0.1 GB), pero requiere cargar el modelo base DeepSeek-R1-Distill-Qwen-1.5B, que tiene 1.5 mil millones de parámetros.
- VRAM estimada para inferencia: al menos 4-6 GB en FP16 para el modelo base, más la sobrecarga del adaptador y el MLP de política latente. Con cuantización (no proporcionada por el autor) podría reducirse, pero no hay datos.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, T4). Una RTX 4090 o A100 permitirían mayor margen.
- El despliegue no es directo: requiere el código de CoLaR (github.com/xiaomi-research/colar) y la carga manual del checkpoint. No es compatible con vLLM, Ollama, llama.cpp o TGI sin modificaciones sustanciales.
- Latencia y throughput: no disponibles. La compresión latente podría reducir el número de tokens generados, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos. El adaptador no es un modelo independiente, sino un ajuste sobre DeepSeek-R1-Distill-Qwen-1.5B, y no existen resultados publicados que permitan compararlo con otros adaptadores de razonamiento lógico (por ejemplo, adaptadores LoRA sobre modelos como Llama-3.2-1B o Qwen-2.5-1.5B). La comparación más relevante sería contra el propio modelo base sin adaptador, pero no se aportan métricas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No es un modelo listo para producción: el checkpoint no se puede cargar con `AutoModel` y requiere el código específico de CoLaR y un proceso de ensamblaje manual.
- Licencia no declarada: no se especifica la licencia del adaptador, lo que impide su uso comercial sin consultar al autor.
- Sin evaluación pública: no hay benchmarks ni validación independiente que respalden su rendimiento en tareas de lógica.
- Sesgos y alucinaciones: al derivar de DeepSeek-R1-Distill-Qwen-1.5B, puede heredar sesgos del modelo base y generar razonamientos incorrectos en dominios fuera de los datos de entrenamiento.
- Limitaciones de idioma: el modelo base está principalmente entrenado en chino e inglés; no se garantiza un buen rendimiento en otros idiomas, incluido el español.
- Riesgo de sobreajuste: el entrenamiento con 25 épocas sobre un conjunto pequeño (ProsQA, FOLIO, LogiQA) puede provocar sobreajuste a esos formatos específicos.
- Dependencia de variables de entorno: la carga requiere `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1` y otros parámetros que pueden cambiar según la versión de PyTorch-Lightning.
- El autor indica "配方偏离" (desviación de la receta), lo que sugiere que la configuración de entrenamiento no sigue exactamente el protocolo de CoLaR, añadiendo incertidumbre sobre su reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rjz123/colar-r1-logic
- Repositorio oficial de CoLaR (Xiaomi Research): https://github.com/xiaomi-research/colar
- Documentación de implementaciones de CoLaR (DeepWiki): https://deepwiki.com/xiaomi-research/colar/5.1-model-implementations
- Repositorio Logic-RL (reproducción de R1 Zero en lógica): https://github.com/Unakar/Logic-RL
- Guía de modelos DeepSeek (contexto del modelo base): https://insiderllm.com/guides/deepseek-models-guide/
- Página informativa sobre DeepSeek R1: https://deepseeksr1.com/r1/
