# MaksKript/NeiroHity-ACE-Step-DiT-q8

## Resumen

NeiroHity-ACE-Step-DiT-q8 es una reexportación en ONNX con cuantización int8 del decodificador DiT (Diffusion Transformer) del modelo oficial ACE-Step/Ace-Step1.5, un modelo de generación musical. El autor, MaksKript, ha dividido el DiT en cinco partes encadenadas (capas 0-7, 8-11, 12-15, 16-19 y 20-23) y ha aplicado cuantización weight-only int8 con bloques de 32 y esquema simétrico (MatMulNBits), generando un artefacto de 2,0 GB orientado a inferencia en dispositivos móviles.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo entrenado desde cero, sino de una conversión de formato y precisión pensada para ejecutar generación musical en Android dentro de la aplicación NeiroHity. El autor reporta una correlación de 0,9989 frente a la implementación oficial en PyTorch bf16 sobre 250 frames, lo que indica que la pérdida de calidad por la cuantización es muy baja en la práctica.

No hay información publicada sobre arquitectura completa, número de parámetros, longitud de contexto ni idiomas soportados más allá de lo que se deduce de la model card. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) del decodificador de ACE-Step 1.5, exportado en ONNX y dividido en 5 subgrafos encadenados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la secuencia de entrada debe tener longitud par |
| Tipos de cuantizacion | int8 weight-only (MatMulNBits, bloque 32, simetrico) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (5 ficheros encadenados: dit_L00_q8, dit_L08_q8, dit_L12_q8, dit_L16_q8, dit_L20_q8) |

## Arquitectura y entrenamiento

El modelo es una conversión del DiT de ACE-Step 1.5 turbo, no un entrenamiento nuevo. El DiT original procesa `hidden_states`, `timestep`, `encoder_hidden_states` y `context_latents` para producir la velocidad (velocity) del proceso de difusión. La exportación divide las 24 capas del transformer en cinco bloques: `dit_L00_q8` (capas 0-7, entradas hidden_states, timestep, encoder_hidden_states y context_latents; salidas h, temb, tproj y enc), `dit_L08_q8` (capas 8-11), `dit_L12_q8` (capas 12-15), `dit_L16_q8` (capas 16-19, salida h_out) y `dit_L20_q8` (capas 20-23, salida velocity). La variante turbo implica `timestep_r = timestep`, es decir, sin destilado de pasos adicional en el muestreo.

La cuantización aplicada es weight-only int8 con granularidad de bloque 32 y simetría, implementada mediante MatMulNBits de ONNX Runtime. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO; esos datos pertenecen al modelo base ACE-Step/Ace-Step1.5 y no se detallan en la información proporcionada. La innovación técnica destacable es la partición en cinco subgrafos para reducir el pico de memoria durante la inferencia en Android y la validación de fidelidad numérica frente a PyTorch bf16.

## Capacidades

- Generación de música a partir de latentes y condicionamiento de texto codificado (`encoder_hidden_states` y `context_latents`).
- Decodificación de difusión en modo turbo con paso de tiempo directo (`timestep_r = timestep`).
- Inferencia en formato ONNX con cuantización int8, pensada para ejecución en dispositivos móviles Android.
- Integración en la aplicación NeiroHity como componente de generación musical.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio (aparte de la generación musical) ni multilingüismo explícito.

## Casos de uso

- Generación musical en dispositivos Android: la partición en cinco subgrafos y la cuantización int8 permiten ejecutar el DiT en un móvil dentro de la app NeiroHity, reduciendo el consumo de memoria frente al modelo bf16 completo.
- Prototipado de pipelines de audio en ONNX Runtime: al ser un grafo ONNX estándar, se puede integrar en servicios de inferencia que ya usen ONNX Runtime sin necesidad de PyTorch.
- Validación de fidelidad de cuantización: sirve como referencia para comparar la salida int8 frente a la implementación oficial bf16 (correlación 0,9989 reportada), útil en estudios de compresión de modelos generativos.
- Aplicaciones de creación musical asistida sin conexión: al ser un artefacto local de 2,0 GB, permite generar fragmentos musicales en entornos sin acceso a la nube.
- Investigación en decodificadores de difusión: la separación en cinco bloques facilita el análisis por capas del DiT y la experimentación con cuantizaciones alternativas.
- Integración en herramientas de edición musical que necesiten un decodificador ligero para convertir latentes en audio dentro de un flujo mayor de ACE-Step.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un modelo de generación musical. El único dato de rendimiento reportado es la correlación de velocidad frente a la implementación oficial en PyTorch bf16:

| Metrica | Valor |
|---|---|
| Correlacion de velocidad vs PyTorch bf16 (t=1.0) | 0,9989 |
| Correlacion de velocidad vs PyTorch bf16 (t=0.5) | 0,9989 |
| Frames evaluados | 250 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,0 GB, lo que da una cota inferior del espacio de almacenamiento necesario. El pico de memoria en ejecución depende del tamaño de la secuencia y de los cinco subgrafos encadenados.
- GPU recomendadas: no disponible. El artefacto está orientado a ejecución en Android mediante ONNX Runtime, no a GPUs de servidor.
- Cabe en GPU consumer: no disponible; por tamaño de fichero (2,0 GB) es plausible en GPUs con 4 GB o más de VRAM, pero no se confirma en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeiroHity-ACE-Step-DiT-q8 | no disponible | no disponible | ONNX int8 | MIT | Hugging Face (MaksKript) |
| ACE-Step/Ace-Step1.5 (base) | no disponible | no disponible | safetensors (bf16) | no disponible en la informacion | Hugging Face (oficial) |
| Otras conversiones ONNX de ACE-Step | no disponible | no disponible | ONNX | no disponible | no disponible |

No se dispone de información suficiente para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una conversión de formato y precisión, no un modelo entrenado de forma independiente; hereda las limitaciones del DiT original de ACE-Step 1.5.
- La cuantización int8 introduce una desviación numérica respecto a bf16 (correlación 0,9989, no identidad exacta); en usos sensibles a la fidelidad de audio conviene validar la salida.
- La secuencia de entrada debe tener longitud par; secuencias impares no son válidas.
- No hay información publicada sobre sesgos, idiomas soportados ni riesgos de alucinación específicos de esta conversión.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base ACE-Step/Ace-Step1.5 y de los datos con los que se entrenó.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- El artefacto está pensado para la app NeiroHity en Android; su uso en servidores o pipelines de producción no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/MaksKript/NeiroHity-ACE-Step-DiT-q8
- Modelo base: https://huggingface.co/ACE-Step/Ace-Step1.5
