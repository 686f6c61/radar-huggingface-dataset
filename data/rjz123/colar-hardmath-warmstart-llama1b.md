# rjz123/colar-hardmath-warmstart-llama1b

## Resumen

El modelo `rjz123/colar-hardmath-warmstart-llama1b` es un adaptador LoRA de razonamiento latente (latent reasoning) construido sobre el modelo base `unsloth/Llama-3.2-1B-Instruct`. Lo desarrolla el investigador rjz123 como parte de la línea de investigación CoLaR, orientada a mejorar el razonamiento matemático mediante un mecanismo de compresión latente. El checkpoint se presenta como un warm-start desde un modelo previo (`colar-gsm`) y ha sido ajustado con SFT sobre los conjuntos GSM8K y MATH durante 12 épocas.

Su relevancia radica en explorar arquitecturas híbridas que combinan un LLM base con un MLP de política latente y LoRA, en lugar de depender únicamente de cadenas de pensamiento explícitas. El modelo es un checkpoint de PyTorch Lightning, no un modelo completo autocargable, y requiere un scaffold específico para su uso. Con un tamaño de repositorio de 0,1 GB, es ligero y pensado para experimentación e investigación, no para despliegue directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama-3.2-1B-Instruct) con scaffold CoLaR: resize de embedding [PAD], LoRA r128 en q/v y MLP LatentPolicy |
| Parametros totales | no disponible (el checkpoint incluye pesos del adaptador LoRA y del MLP; el modelo base tiene ~1,23B) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | heredada del modelo base (Llama-3.2-1B-Instruct, 128K tokens), no confirmada para el adaptador |
| Tipos de cuantizacion | no disponible (checkpoint en formato .ckpt, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base soporta varios idiomas, pero el adaptador no especifica) |
| Licencia | no disponible (el modelo base usa la licencia Llama 3.2 Community License, pero el adaptador no declara licencia propia) |
| Formato de pesos | checkpoint de PyTorch Lightning (.ckpt), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rank 128 en las proyecciones query y value) aplicado sobre `unsloth/Llama-3.2-1B-Instruct`, complementado con un MLP denominado `LatentPolicy` que forma parte del scaffold CoLaR. Además, el embedding se redimensiona añadiendo un token `[PAD]` (resize). Este diseño sugiere un mecanismo de razonamiento latente donde el modelo comprime información intermedia en un espacio latente (con una compresión configurada como `comp4` y una longitud máxima latente de 64 tokens, según las variables de entorno indicadas).

El entrenamiento consistió en un warm-start desde el checkpoint `colar-gsm` (un modelo CoLaR previo entrenado en GSM8K) y un ajuste supervisado (SFT) sobre los conjuntos GSM8K y MATH, durante 12 épocas. No se proporcionan detalles sobre la composición exacta del dataset, el número de tokens totales ni si se aplicaron técnicas como RLHF o DPO. La ausencia de información sobre el proceso de entrenamiento impide evaluar la calidad de los datos o la metodología empleada.

## Capacidades

- Generacion de texto: heredada del modelo base Llama-3.2-1B-Instruct, que es un modelo de lenguaje generalista.
- Razonamiento matematico: el entrenamiento específico en GSM8K y MATH indica que el modelo está orientado a resolver problemas aritmeticos y matematicos de nivel escolar y de competicion.
- Razonamiento latente: la arquitectura CoLaR incorpora un mecanismo de compresion latente que puede mejorar la eficiencia en tareas de razonamiento multi-paso, aunque no hay evidencia publica de su eficacia.
- No se han documentado capacidades de tool calling, function calling, agentes, vision o audio.

## Casos de uso

- Investigacion en razonamiento latente: el modelo sirve como banco de pruebas para estudiar como la compresion latente afecta al rendimiento en tareas de matematicas. Un investigador puede cargar el checkpoint con el scaffold CoLaR y comparar su comportamiento frente a modelos sin razonamiento latente.
- Evaluacion de tecnicas de SFT en dominios especificos: al ser un adaptador LoRA, permite probar la transferencia de conocimiento desde un dominio (GSM8K) a otro (MATH) mediante warm-start, util para experimentos de curriculum learning.
- Fine-tuning adicional: el checkpoint puede usarse como punto de partida para nuevos entrenamientos, ya que los pesos LoRA y el MLP son modificables sin tocar el modelo base.
- Analisis de compresion de contexto: las variables `COLAR_COMPRESS=5` y `COLAR_MAXLAT=64` sugieren que el modelo puede explorar como comprimir razonamientos largos en representaciones latentes mas cortas, relevante para reducir costes de inferencia.
- Reproduccion de resultados academicos: dado que es un modelo de investigacion, puede utilizarse para replicar o extender los resultados del autor en el campo del razonamiento matematico.
- Prototipado de asistentes de matematicas: aunque no esta listo para produccion, puede integrarse en un entorno de desarrollo para experimentar con respuestas a problemas de nivel escolar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K o MATH que permitan comparar el rendimiento del modelo con alternativas. La ausencia de evaluaciones publicas impide valorar su eficacia real.

## Requisitos de hardware

- VRAM estimada: el modelo base Llama-3.2-1B-Instruct en FP16 ocupa aproximadamente 2,5 GB. El adaptador LoRA (r128) y el MLP LatentPolicy anaden unos pocos cientos de MB. En total, se estima un consumo de entre 3 y 4 GB de VRAM en inferencia sin cuantizacion.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060 o RTX 3050. Para entrenamiento o fine-tuning adicional, se recomienda al menos 8 GB.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de gama media y baja.
- Opciones de despliegue: al ser un checkpoint de PyTorch Lightning, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un script personalizado que cargue el scaffold CoLaR, el modelo base y los pesos del state_dict. No se han publicado instrucciones de despliegue estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (adaptadores LoRA de razonamiento latente sobre Llama-3.2-1B). Existen otros modelos de razonamiento matematico como `Math-Llama` o `DeepSeekMath`, pero no son equivalentes en arquitectura ni en tamano. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El checkpoint no es AutoModel-loadable: requiere cargar el scaffold CoLaR personalizado y el modelo base por separado, con `strict=False`. Esto limita su uso a entornos de investigacion con conocimiento del codigo de CoLaR.
- La licencia no esta declarada: aunque el modelo base tiene una licencia Llama 3.2 Community License, el adaptador no especifica su propia licencia, lo que genera incertidumbre legal para uso comercial.
- Sesgos del modelo base: Llama-3.2-1B-Instruct puede presentar sesgos sociales y culturales heredados de sus datos de entrenamiento, que se transmiten al adaptador.
- Riesgo de alucinacion: al ser un modelo pequeno (1B), es propenso a generar respuestas incorrectas o inventadas, especialmente en problemas matematicos complejos.
- Limitaciones de idioma: aunque el modelo base soporta varios idiomas, el entrenamiento en GSM8K y MATH (mayoritariamente en ingles) puede degradar el rendimiento en otros idiomas.
- Falta de documentacion: no hay detalles sobre el dataset de entrenamiento, la metodologia de evaluacion ni los resultados obtenidos, lo que dificulta la reproducibilidad.
- No apto para produccion: es un artefacto de investigacion sin soporte para inferencia a gran escala, cuantizacion ni integracion con frameworks estandar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/rjz123/colar-hardmath-warmstart-llama1b)
- [Modelo base unsloth/Llama-3.2-1B-Instruct](https://huggingface.co/unsloth/Llama-3.2-1B-Instruct)
- [Modelo base original meta-llama/Llama-3.2-1B](https://huggingface.co/meta-llama/Llama-3.2-1B)
