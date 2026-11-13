# pittawat/prelim-qwen-4b-lora32-opsd-seed2718282026

## Resumen

El modelo `pittawat/prelim-qwen-4b-lora32-opsd-seed2718282026` es un checkpoint fusionado (merged) obtenido al aplicar un ajuste fino LoRA de rango 32 sobre el modelo base Qwen/Qwen3.5-4B, en la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. Lo publica el usuario pittawat en Hugging Face bajo licencia Apache 2.0 y con formato de pesos safetensors. Se trata de un experimento preliminar de ajuste fino, no de un modelo de producción con documentación extensa.

El interés técnico inmediato es doble: por un lado, sirve como referencia para quien quiera reproducir o inspeccionar un pipeline LoRA de rango 32 sobre la familia Qwen3.5; por otro, la nomenclatura del identificador (`opsd`, `seed2718282026`) sugiere una variante de entrenamiento con una semilla concreta, lo que facilita la trazabilidad de experimentos. El autor remite a `training_provenance.json` para el registro de entrenamiento, aunque ese fichero no se ha podido consultar en la información disponible.

El checkpoint cuenta con 4.539.265.536 parámetros reales según los metadatos de safetensors y un repositorio de 9,1 GB. No se han publicado resultados de benchmarks, idiomas soportados ni detalles del dataset de ajuste en la información disponible, por lo que esta ficha se limita a lo verificable y marca explícitamente lo que falta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Qwen/Qwen3.5-4B mediante LoRA de rango 32, posteriormente fusionado en un checkpoint único. La arquitectura subyacente es la del modelo base Qwen3.5-4B, de la familia Qwen3.5; no se detallan en la información disponible ni el número de capas, ni la dimensión oculta, ni el mecanismo de atención, ni si incorpora componentes híbridos. El identificador incluye el término `opsd`, que no se define en la model card, y una semilla (`seed2718282026`) que fija la reproducibilidad del experimento.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. El autor remite a `training_provenance.json` para el registro completo, pero ese fichero no forma parte de la información proporcionada. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, sin que se documenten capacidades específicas añadidas por el ajuste.
- Código y matemáticas: presumiblemente presentes por herencia del base, pero no verificadas en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ajuste específico: el LoRA de rango 32 y la semilla concreta apuntan a un experimento reproducible, no a una mejora funcional documentada.

## Casos de uso

- Reproducción de experimentos LoRA: el checkpoint permite inspeccionar los pesos resultantes de un ajuste de rango 32 sobre Qwen3.5-4B con una semilla fija, útil para comparar configuraciones de entrenamiento en investigación.
- Punto de partida para ajustes posteriores: al estar fusionado, puede servir como base para nuevos fine-tunes o para destilar comportamiento hacia modelos más pequeños.
- Evaluación comparativa de checkpoints: al compartir base con Qwen3.5-4B, permite medir el efecto aislado del ajuste LoRA en tareas concretas del pipeline del autor.
- Prototipado local en GPU de consumo: con 4,54 mil millones de parámetros en safetensors, es viable cargarlo en GPUs de 24 GB (RTX 4090) en precisión reducida, para pruebas rápidas.
- Generación de texto en entornos de investigación: uso en cuadernos y scripts de evaluación sin requisitos de producción.
- Auditoría de licencias y procedencia: al ser Apache 2.0 y remitir a un registro de procedencia, encaja en flujos de compliance que exigen trazabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 12-16 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB de pesos; en 4 bits, unos 2,5-3 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4090 (24 GB) suficiente para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, TGI o llama.cpp/ Ollama previa conversión a GGUF; al no haber GGUF publicado, la conversión correría a cargo del usuario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pittawat/prelim-qwen-4b-lora32-opsd-seed2718282026 | 4.539.265.536 | no disponible | Apache 2.0 | Hugging Face, safetensors | Checkpoint experimental fusionado |
| Qwen/Qwen3.5-4B | ~4B (no confirmado en la información) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del ajuste |
| Alternativas de ~4B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para comparar |

## Limitaciones y advertencias

- Es un checkpoint preliminar y experimental: no hay model card detallada, ni benchmarks, ni evaluación de calidad publicada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay evaluación específica para este ajuste.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, que no se describe.
- Idiomas: no se especifican; no se puede garantizar cobertura multilingüe.
- Contexto: se desconoce la longitud máxima soportada, lo que impide planificar aplicaciones con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-4B y las condiciones de los datos de entrenamiento antes de desplegar en producción.
- Producción: no recomendado sin evaluación propia previa; el autor no ofrece garantías ni soporte.
- Trazabilidad: el registro de entrenamiento (`training_provenance.json`) no está disponible en la información consultada, lo que limita la auditoría del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pittawat/prelim-qwen-4b-lora32-opsd-seed2718282026
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Repositorio de Qwen: no disponible en la información proporcionada
- Paper o blog del ajuste: no disponible
- Demo: no disponible
