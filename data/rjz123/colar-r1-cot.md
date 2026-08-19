# rjz123/colar-r1-cot

## Resumen

`colar-r1-cot` es un checkpoint de entrenamiento publicado por el usuario `rjz123` que corresponde a la primera etapa del framework CoLaR (Compressed Latent Reasoning) aplicado sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. CoLaR, desarrollado por Xiaomi Research y presentado en NeurIPS 2025, propone comprimir el razonamiento explícito en cadenas de pensamiento (CoT) en un espacio latente, reduciendo la longitud de las cadenas de razonamiento sin perder precisión significativa. Este checkpoint concreto es la fase de precalentamiento con CoT puro (10 épocas) que precede a la compresión latente.

El modelo no es un LLM independiente, sino un adaptador PEFT (LoRA de rango 128 en las proyecciones q y v) junto con un MLP adicional (`LatentPolicy`) y un redimensionamiento de embeddings para el token `[PAD]`. El checkpoint se distribuye en formato PyTorch-Lightning (`.ckpt`) y no es cargable directamente con `AutoModel`; requiere un proceso de carga específico que fusiona los pesos con el modelo base. Su relevancia radica en que permite reproducir los experimentos de CoLaR y evaluar la viabilidad del razonamiento latente comprimido en modelos pequeños de 1.5B de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (DeepSeek-R1-Distill-Qwen-1.5B) con adaptador LoRA (r=128 en q/v) y MLP LatentPolicy |
| Parametros totales | No disponible (adaptador sobre base de 1.5B; el checkpoint ocupa 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 32k tokens) |
| Tipos de cuantizacion | No disponible (checkpoint en formato Lightning, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponibles (el modelo base es multilingue, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch-Lightning (`.ckpt`) con claves bajo `state_dict` |

## Arquitectura y entrenamiento

El checkpoint se compone de tres elementos integrados sobre el modelo base `DeepSeek-R1-Distill-Qwen-1.5B`: un redimensionamiento de la capa de embeddings para incorporar el token `[PAD]`, un adaptador LoRA de rango 128 aplicado a las proyecciones de query y value, y un MLP denominado `LatentPolicy` que gestiona la compresión del razonamiento en el espacio latente. Segun la documentacion de CoLaR, el entrenamiento se realiza en dos fases: primero un precalentamiento con cadenas de pensamiento explicitas (esta es la fase que representa este checkpoint, con 10 epocas) y posteriormente una fase de compresion latente donde el modelo aprende a interrumpir el CoT y continuar razonando en el espacio oculto. Los hiperparametros de entorno indican una compresion de factor 5 (`COLAR_COMPRESS=5`) y una longitud maxima latente de 64 tokens (`COLAR_MAXLAT=64`). No se especifica el dataset de entrenamiento, aunque los experimentos del paper CoLaR utilizan datasets de razonamiento matematico como GSM8K.

## Capacidades

- Razonamiento matematico y logico mediante cadenas de pensamiento explicitas durante la fase de precalentamiento.
- Razonamiento latente comprimido (tras la segunda fase de entrenamiento, no incluida en este checkpoint) que reduce la longitud de las cadenas de razonamiento hasta en un 53.3% con una degradacion de rendimiento de solo 4.8% respecto al CoT explicito.
- Generacion de texto autoregresiva estandar al ser un adaptador sobre DeepSeek-R1-Distill-Qwen-1.5B.
- Soporte de tool calling y function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades multilingues: no especificadas para este adaptador, aunque el modelo base soporta ingles y chino principalmente.
- Capacidades especiales: el checkpoint esta disenado para experimentacion en razonamiento latente, no para uso directo en produccion.

## Casos de uso

- Investigacion academica en razonamiento comprimido: el checkpoint permite reproducir los experimentos de CoLaR y estudiar como los modelos pequenos pueden razonar en espacio latente sin generar tokens intermedios, reduciendo costes computacionales.
- Evaluacion de tecnicas de compresion de razonamiento: al ser la fase de precalentamiento, sirve como punto de partida para entrenar la segunda fase de compresion latente y comparar resultados con el CoT explicito.
- Analisis de la evolucion del entrenamiento: los checkpoints intermedios como este permiten estudiar como el modelo adquiere habilidades de razonamiento paso a paso antes de la compresion.
- Desarrollo de adaptadores LoRA sobre modelos R1 destilados: el uso de LoRA r128 en q/v puede servir como referencia para otras tareas de adaptacion eficiente sobre DeepSeek-R1-Distill.
- Benchmarking de eficiencia en inferencia: al comparar la longitud de las cadenas generadas con y sin compresion latente, se puede medir el ahorro en tokens y latencia.
- Exploracion de arquitecturas hibridas: el MLP LatentPolicy integrado es un componente reutilizable que puede inspirar otros disenos de razonamiento latente en modelos de tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint en la informacion disponible. El paper de CoLaR (arXiv:2505.16552) reporta que el framework completo logra un 14.1% mas de precision que los metodos basados en razonamiento latente previos a ratios de compresion comparables, y reduce la longitud de las cadenas de razonamiento en un 53.3% con solo un 4.8% de degradacion frente al CoT explicito. Sin embargo, estos resultados corresponden al sistema completo, no a esta fase de precalentamiento en particular.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre un modelo de 1.5B, la inferencia requiere aproximadamente 4-6 GB en FP16 (modelo base + adaptador). El checkpoint en si ocupa 0.1 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (p. ej., NVIDIA GTX 1660, RTX 2060, RTX 3060) es suficiente para inferencia. Para entrenamiento de la segunda fase, se recomienda al menos 12 GB.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer de gama media y alta.
- Opciones de despliegue: no es directamente desplegable con vLLM, Ollama o TGI por su formato de checkpoint de Lightning. Requiere un script de carga personalizado que fusione los pesos con el modelo base. Tras la conversion a safetensors o GGUF, podria usarse con llama.cpp, pero no se proporcionan instrucciones oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos equivalentes en la informacion proporcionada. Como referencia, el modelo base `DeepSeek-R1-Distill-Qwen-1.5B` tiene 1.5B parametros, 32k de contexto y licencia MIT, mientras que este adaptador anade la capacidad de razonamiento latente. Otros marcos de razonamiento latente como Coconut (Training Large Language Models to Reason in a Continuous Latent Space) o la destilacion de CoT podrian considerarse alternativas, pero no se han publicado comparaciones numericas para este checkpoint concreto.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` por separado y fusionar los pesos manualmente.
- Formato de checkpoint propietario: no es compatible con `AutoModel` de HuggingFace Transformers; se necesita un script especifico con `strict=False` y la variable de entorno `TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD=1`.
- Licencia no especificada: no se indica bajo que licencia se distribuye este adaptador, lo que impide su uso comercial sin consultar al autor.
- Sin benchmarks publicados: no hay datos de rendimiento verificados para este checkpoint concreto.
- Riesgo de alucinacion: al ser un modelo de 1.5B, su capacidad de razonamiento complejo es limitada y puede generar respuestas incorrectas en tareas que requieran multiples pasos.
- Limitaciones de idioma: no se especifican idiomas soportados; el modelo base esta principalmente entrenado en ingles y chino.
- Proposito de investigacion: el autor lo etiqueta como "research", lo que sugiere que no esta preparado para uso en produccion.
- Fecha de creacion futura (2026-08-19): posible anomalia en los metadatos que conviene verificar con el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rjz123/colar-r1-cot
- Repositorio oficial de CoLaR (Xiaomi Research): https://github.com/xiaomi-research/colar
- Paper de CoLaR en arXiv: https://arxiv.org/pdf/2505.16552v1
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Documentacion de configuraciones de CoLaR en DeepWiki: https://deepwiki.com/xiaomi-research/colar/6.1-model-configurations
