# shadowpa0327/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-sharar-w3

## Resumen

Este repositorio no contiene un modelo completo, sino un conjunto de pesos derivados y calibrados en 3 bits para el modelo NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB de NVIDIA. Lo publica el usuario shadowpa0327 y su finalidad es servir como copias de las proyecciones del tronco (trunk) que el motor de inferencia Sharar puede cargar junto al checkpoint original para acelerar la decodificación en hardware modesto, concretamente en un DGX Spark con SoC GB10. El paquete cubre 177 matrices cuantizadas con GPTQ a aproximadamente 3,25 bits por peso y un codebook de ocho niveles por matriz.

El modelo base es un transformer híbrido de tipo MoE con bloques Mamba: 40 bloques Mamba, 40 bloques MoE y 8 bloques de atención, con 74.000 millones de parámetros totales y 9.000 millones activos por token (según la nomenclatura A9B). El contexto y el resto de especificaciones del modelo original no se detallan en la información disponible. La relevancia de este repositorio es práctica: permite ejecutar un modelo de 74B en un único dispositivo de 24 GB de memoria unificada, a costa de una pérdida de precisión medida pero no evaluada todavía en tareas.

Conviene subrayar que se trata de un artefacto de inferencia, no de un modelo entrenado. No se ha publicado ninguna comparación de precisión en tareas frente a las codificaciones originales del checkpoint, ni mediciones de velocidad de decodificación con estas copias. La model card indica que el launcher de Sharar estima una decodificación de una sola petición aproximadamente un 25 % más lenta sin las copias calibradas, lo que da una idea del orden de magnitud de la ganancia, aunque no se aporta la cifra con ellas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con bloques Mamba y MoE (modelo base) |
| Parametros totales | 74B (modelo base); este repo contiene pesos derivados de 177 matrices |
| Parametros activos | 9B (modelo base, nomenclatura A9B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ calibrado a ~3,25 bits por peso, codebook de 8 niveles por matriz, una escala por cada 32 pesos (rango 0,6-1,0) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | Pesos derivados en formato propio de Sharar, con `manifest.json` de verificación SHA256; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB combina 40 bloques Mamba, 40 bloques MoE y 8 bloques de atención, según la descripción de las matrices cubiertas en este repositorio. Las proyecciones Mamba usan NVFP4 (`in_proj` de forma [18560, 4096] y `out_proj` de [4096, 8192]); los bloques MoE usan Q8_0 en `fc1_latent` [1024, 4096] y `fc2_latent` [4096, 1024]; los bloques de atención usan Q8_0 en `q|k|v` [4608, 4096] y `o` [4096, 4096]; y el `lm_head` es Q8_0 de [131072, 4096]. Los expertos compartidos en IQ2_XXS (unos 2 bits por peso) no se modifican.

El proceso de calibración es GPTQ sobre la covarianza de entrada de cada proyección tal como la produce el servicio (cada bloque aguas arriba en su precisión servida), con damping de 0,01, a partir de 144 muestras de calibración (176.434 filas de tokens) y dejando cada enésima muestra como sonda de validación (25.303 tokens de sonda). El error relativo medio en las sondas retenidas es de 0,0111 para el conjunto de las 177 matrices (frente a 0,0231 con redondeo simple); por tipo: `in_proj` 0,0041, `out_proj` 0,0082, `fc1` 0,0124, `fc2` 0,0215, `q|k|v` 0,0044, `o` 0,0096 y `lm_head` 0,0001. El `manifest.json` registra cada fichero con su SHA256, la revisión objetivo y los ajustes del calibrado, y Sharar los verifica antes de la captura del grafo. No se describe ningún entrenamiento adicional ni ajuste fino del modelo base.

## Capacidades

- Las capacidades funcionales son las del modelo base NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB; esta información no detalla tareas concretas (texto, código, matemáticas, visión, tool calling o agentes) para ese checkpoint.
- El repositorio en sí no añade capacidades: solo sustituye las codificaciones de 177 matrices del tronco por copias GPTQ de 3 bits para el camino de decodificación de Sharar.
- Sharar lee estas copias en llamadas de como máximo 64 filas; el prefill mantiene las codificaciones propias del checkpoint.
- No se documentan capacidades multilingües, modo de razonamiento (thinking), visión, audio ni soporte de function calling en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 74B en un único DGX Spark (GB10): el paquete está dimensionado para que Sharar sirva el checkpoint original junto a estas copias en un solo dispositivo con 24 GB de memoria unificada, lo que permite operar un MoE grande sin clúster multi-GPU.
- Inferencia de baja concurrencia con latencia contenida: al aplicarse solo en el camino de decodificación para llamadas de hasta 64 filas, encaja en servicios interactivos con pocas peticiones simultáneas donde el coste del prefill se amortiza con el checkpoint original.
- Prototipado e investigación en hardware de gama única: útil para equipos que quieran evaluar el comportamiento del modelo base sin disponer de nodos con varias GPUs de 80 GB.
- Pruebas de cuantización extrema (3 bits) con GPTQ: el `manifest.json` y los informes por matriz permiten reproducir el ajuste y comparar el error de salida frente al redondeo simple en cada proyección.
- Integración en pipelines de Sharar: se puede enlazar la carpeta como `$SHARAR_RESULTS/w3-checkpoints/bolt-current` para que los modos `--fast` y `--throughput` la detecten automáticamente, lo que simplifica el despliegue en entornos ya basados en este motor.
- Evaluación comparativa de precisión: sirve como base para ejecutar la comparación de exactitud en tareas frente a las codificaciones originales que el autor aún no ha realizado, un caso de uso directo para investigadores interesados en el impacto de la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta errores relativos de reconstrucción en sondas retenidas (media por tipo de matriz y global de 0,0111 frente a 0,0231 con redondeo simple) y señala explícitamente que no se ha medido precisión en tareas ni velocidad de decodificación con estas copias.

## Requisitos de hardware

- VRAM: el objetivo declarado es un único DGX Spark con SoC GB10 y 24 GB de memoria unificada. El repositorio ocupa 2,3 GB, pero requiere el checkpoint base para el prefill y las partes no cubiertas.
- GPU recomendadas: DGX Spark (GB10) como plataforma de referencia; no se documentan otras.
- GPU de consumo: no se indica compatibilidad con RTX 4090 u otras; el diseño está atado al motor Sharar y al dispositivo GB10.
- Despliegue: exclusivamente mediante Sharar (`sharar serve bolt --fast`), con las variables `SHARAR_W3_DECODE=1` y `SHARAR_W3_CHECKPOINT` apuntando a la descarga local. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: sin mediciones publicadas con estas copias; el launcher de Sharar estima una decodificación de una sola petición aproximadamente un 25 % más lenta sin las copias calibradas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB (base) | 74B totales / 9B activos | no disponible | NVFP4, Q8_0, IQ2_XXS según matriz | OpenMDW 1.1 | HuggingFace (nvidia) |
| Este repositorio (Sharar w3) | pesos derivados de 177 matrices | no disponible | GPTQ ~3,25 bits | OpenMDW 1.1 | HuggingFace (shadowpa0327) |
| Alternativas de mismo tamaño o tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No se ha medido la precisión en tareas frente a las codificaciones originales del checkpoint; la degradación real en uso productivo es desconocida.
- El error de reconstrucción es mayor en `fc2_latent` (0,0215) y `fc1_latent` (0,0124), por lo que las capas MoE son las más afectadas por la cuantización.
- El calibrado usó solo 144 muestras (176.434 filas de tokens); la cobertura de dominios puede ser limitada y sesgar el ajuste hacia la distribución de calibración.
- Solo se aplica en decodificación con llamadas de hasta 64 filas; el prefill no se beneficia y el rendimiento global depende del equilibrio prefill/decode.
- Dependencia total del motor Sharar y del hardware GB10; no hay formatos estándar (GGUF, safetensors) ni soporte en otros runners.
- La licencia OpenMDW 1.1 se hereda del modelo base; conviene revisar sus términos antes de un uso comercial.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos; deben evaluarse sobre el modelo base.
- Al ser pesos derivados, cualquier verificación de integridad debe pasar por el `manifest.json` y sus SHA256.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/shadowpa0327/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-sharar-w3
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Repositorio de Sharar: https://github.com/abdelfattah-lab/sharar
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
