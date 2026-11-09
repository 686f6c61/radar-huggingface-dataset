# CladeTeam/CENO-1.3B-A450M-1m

## Resumen

CENO-1.3B-A450M-1m es un checkpoint base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal puro sobre secuencia genómica, entrenado sobre un backbone híbrido Mamba/Attention/Mixture-of-Experts derivado de la arquitectura Nemotron-H de NVIDIA. No requiere entradas de alineamiento múltiple de secuencias (MSA), lo que simplifica su uso como generador y extractor de representaciones sobre ADN crudo.

El modelo cuenta con 1.302 millones de parámetros totales (de los cuales aproximadamente 450 millones son activos por token, según el sufijo A450M), 38 capas ocultas y una longitud de contexto de 1.048.576 tokens. Esta versión corresponde a la etapa 4 del entrenamiento ("1M context"), orientada a modelar secuencias genómicas largas. El tokenizador es a nivel de carácter (byte-level), con un vocabulario de 512 entradas que mapea directamente los caracteres de ADN a sus códigos ASCII.

Su relevancia radica en que ofrece una ventana de contexto de un millón de tokens sobre un modelo de tamaño contenido, lo que permite abordar regiones genómicas extensas sin fragmentación, algo poco habitual en modelos de ADN de esta escala. La licencia Apache-2.0 y la inclusión del código del modelo en el propio repositorio facilitan su adopción tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 1.302.429.280 (1302,4 M) |
| Parametros activos | Aproximadamente 450 M (según nomenclatura A450M; no confirmado en la model card) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ADN (secuencia genómica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), bfloat16 |

## Arquitectura y entrenamiento

El backbone es un híbrido Mamba/Attention/MoE basado en la arquitectura Nemotron-H. Cuenta con 38 capas ocultas, 16 cabezas de atención, tamaño intermedio de 4096 y un componente MoE con 8 expertos y 2 expertos activados por token. La combinación de capas Mamba (modelado de estado) con capas de atención permite manejar secuencias muy largas con un coste computacional menor que un transformer denso equivalente. El tokenizador es de nivel de carácter, con vocabulario de 512 entradas, derivado del CharLevelTokenizer de Evo2 (Arc Institute).

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Se indica únicamente que este checkpoint corresponde a la etapa 4 (contexto de 1M) del entrenamiento del modelo base. El código del modelo está incluido en el repositorio y es cargable con `trust_remote_code=True`; las capas Mamba requieren kernels CUDA, por lo que la inferencia (forward/generate) necesita GPU, aunque la carga de configuración, tokenizador y pesos es segura en CPU.

## Capacidades

- Generación de secuencias genómicas de ADN de forma autorregresiva.
- Extracción de embeddings sobre secuencias de ADN para tareas posteriores (probing, clasificación, búsqueda).
- Modelado de contexto largo: hasta 1.048.576 tokens por secuencia.
- Base para adaptación posterior mediante fine-tuning en tareas genómicas.
- Punto de partida para la familia CENO-P (checkpoints con MSA) orientada a predicción de efectos de variantes (VEP).
- Soporte de `generate()` con `trust_remote_code=True` en transformers.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Modelado de regiones genómicas extensas: gracias a su contexto de 1M tokens, permite procesar loci o regiones cromosómicas completas sin truncar, algo útil para estudiar elementos reguladores alejados del gen diana.
- Extracción de embeddings para clasificación downstream: se pueden obtener representaciones de secuencias y entrenar cabezas de clasificación para tareas como identificación de elementos funcionales o regiones regulatorias.
- Fine-tuning para predicción de propiedades de secuencia: el checkpoint base sirve como inicialización para adaptar el modelo a tareas específicas de genómica con datasets propios.
- Generación controlada de secuencias sintéticas: útil en experimentos de diseño de secuencias o aumento de datos, siempre con validación biológica posterior.
- Análisis de variantes en pipeline VEP: aunque la predicción de efectos de variantes se asocia a los checkpoints CENO-P, el modelo base puede emplearse para scoring de log-verosimilitud de secuencias salvaje frente a variante en flujos de investigación.
- Investigación en modelos de lenguaje aplicados a genómica: su naturaleza de checkpoint base y licencia Apache-2.0 lo hacen adecuado para estudios comparativos de arquitecturas híbridas Mamba/MoE sobre ADN.
- Preentrenamiento continuado: punto de partida para extender el modelo a dominios genómicos específicos (por ejemplo, genomas de especies concretas) con corpus adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,6 GB solo para pesos (1.302 M parámetros × 2 bytes); el consumo real es mayor por estados de activación, caché de atención y buffers de las capas Mamba, especialmente con contextos largos.
- GPU recomendadas: se requiere GPU con soporte CUDA por los kernels de Mamba. Para contextos de 1M tokens se recomienda hardware de gama alta (A100, H100) por el coste de memoria y cómputo; para secuencias cortas, una RTX 4090 o similar puede ser suficiente.
- Cabe en GPU de consumo: sí para secuencias cortas y con precisión bfloat16; el contexto completo de 1M tokens exige mucha más memoria y probablemente GPU de centro de datos.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta HF, single-GPU, sin padding, máximo 131.072 tokens por prefill); el repositorio incluye una entrada para vLLM pensada para prefills mayores. Requiere `mamba-ssm`, `causal-conv1d` y FlashAttention 2.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-1.3B-A450M-1m | 1302,4 M (≈450 M activos) | 1.048.576 | Mamba/Attention/MoE híbrida | Apache-2.0 | Hugging Face |
| Evo2 (Arc Institute) | No disponible | No disponible | No disponible | No disponible | Referenciado como origen del tokenizador |
| Nemotron-H (NVIDIA) | No disponible | No disponible | Mamba/Attention/MoE híbrida | Apache-2.0 (código base) | Referenciado como base arquitectónica |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no está alineado para seguir instrucciones ni para uso conversacional.
- Riesgo de generación biológicamente no funcional: la corrección numérica no garantiza secuencias con sentido biológico ni libres de repeticiones.
- Sesgos del corpus de entrenamiento: no se documenta la composición del dataset, por lo que pueden existir sesgos hacia las especies o regiones genómicas sobrerrepresentadas.
- Restricción de contexto en la ruta HF: la implementación de transformers permite como máximo 131.072 tokens por prefill; para contextos mayores hay que usar vLLM.
- Dependencia de GPU: las capas Mamba requieren kernels CUDA; no hay inferencia práctica en CPU para forward/generate.
- Compatibilidad de versiones: probado con PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3; otras combinaciones pueden no reproducir el comportamiento de referencia.
- Licencia Apache-2.0: permite uso comercial, pero el código derivado de Nemotron-H y del tokenizador de Evo2 mantiene sus atribuciones, reflejadas en `LICENSE` y `NOTICE`.
- La evidencia de contexto largo de 1M corresponde específicamente a este checkpoint; no debe extrapolarse a otros tamaños de la familia.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-1.3B-A450M-1m
- Repositorio de código CENO: https://github.com/CladeTeam/CENO
