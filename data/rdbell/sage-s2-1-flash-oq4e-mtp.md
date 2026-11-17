# rdbell/Sage-S2.1-Flash-oQ4e-mtp

## Resumen

Sage-S2.1-Flash-oQ4e-mtp es un checkpoint cuantizado en formato MLX del modelo internlm/Sage-S2.1-Flash, desarrollado por el Shanghai AI Laboratory (InternLM) y publicado por el usuario rdbell. Sage-S2.1-Flash es un ajuste fino de GLM-5.3-Flash que conserva su arquitectura: un modelo de mezcla de expertos (MoE) nativamente multimodal, con 320B parámetros totales y 18B activos. Este checkpoint concreto aplica la receta de cuantización oQ4e de oMLX, que asigna bits por sensibilidad de capa, con preservación de la cabeza MTP (multi-token prediction) para decodificación especulativa.

El modelo resuelve el problema de desplegar un MoE multimodal de gran tamaño en hardware Apple Silicon con memoria unificada, manteniendo una media efectiva de 4,641 bits por peso. El checkpoint ocupa 186,4 GB en disco (173,6 GiB de pesos), lo que lo hace viable en una máquina con 256 GB de memoria unificada, como el M3 Ultra empleado por el autor para servirlo.

Es relevante ahora porque combina tres elementos poco habituales en un mismo paquete: modalidad imagen-texto, cuantización mixta de precisión medida y una cabeza MTP conservada para acelerar la generación. La licencia MIT del modelo base facilita su uso comercial, si bien la calidad frente al FP8 original no ha sido medida por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal (transformer con mezcla de expertos), basada en GLM-5.3-Flash |
| Parámetros totales | 321.323.031.390 (321,3B) |
| Parámetros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ4e mixta (4-bit afín grupo 64, 8-bit afín grupo 64, BF16 y FP32 en capas seleccionadas); media efectiva 4,641 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 4-bit |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 313,327B | 180,966 GB / 168,538 GiB |
| Codificador de visión | 0,564B | 1,127 GB / 1,050 GiB |
| Cabeza MTP | 7,433B | 4,309 GB / 4,013 GiB |
| Total | 321,323B | 186,402 GB / 173,600 GiB |

Distribución de bits:

| Formato | Pesos lógicos | Porcentaje | Almacenamiento de tensores | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 4-bit, grupo 64 | 311,654B | 96,991% | 163,266 GiB | 4,50 |
| Afín 8-bit, grupo 64 | 8,976B | 2,793% | 8,882 GiB | 8,50 |
| BF16 | 0,607B | 0,189% | 1,131 GiB | 16,00 |
| FP32 | 0,086B | 0,027% | 0,322 GiB | 32,00 |
| Total | 321,323B | 100% | 173,600 GiB | 4,641 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos con capacidades multimodales nativas, heredada de GLM-5.3-Flash. El modelo integra un backbone de lenguaje de 313,3B parámetros lógicos, un codificador de visión de 0,564B y una cabeza MTP de 7,4B. La cabeza MTP permite la predicción de múltiples tokens por paso, lo que habilita decodificación especulativa y reduce la latencia de generación. El checkpoint conserva esta cabeza tras la cuantización.

La cuantización se realizó con oQ (oMLX v0.7.4.dev1) a partir del release oficial en FP8 (internlm/Sage-S2.1-Flash-FP8, revisión 716e6436905650b7be93e1b7dedfb0bb95afd3a3), siguiendo la misma receta que Jundot/GLM-5.3-Flash-oQ4e-mtp. oQ4e asigna bits según la sensibilidad medida por capa y redondea cada grupo con una matriz de importancia (128 muestras × 512 tokens) y un reajuste por mínimos cuadrados ponderados de escala y sesgo. A diferencia del pack de GLM, oMLX 0.7.4.dev1 calibra esta arquitectura transmitiendo una capa decodificadora a la vez desde la fuente FP8, en lugar de usar un proxy de 4 bits temporal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card no documenta estos detalles.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al codificador de visión integrado.
- Decodificación especulativa mediante la cabeza MTP conservada, con soporte de chunked prefill en oMLX.
- Razonamiento de múltiples pasos y uso en flujos de agente: la plantilla de chat propia de Sage conserva el razonamiento de turnos anteriores en el historial, lo que alarga los prompts multi-turno.
- Capacidades científicas del modelo base (proyectores de moléculas, cristales, DNA/RNA, espectros y EEG) no incluidas en este checkpoint: operan fuera del modelo de lenguaje y deben obtenerse del repositorio fuente.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo puede recibir imágenes y texto en un mismo prompt y mantener conversaciones multi-turno, adecuado para despliegues en estaciones de trabajo Apple Silicon con 256 GB de memoria unificada.
- Análisis de documentos con imágenes: extracción y razonamiento sobre capturas, diagramas o figuras combinadas con texto, aprovechando el codificador de visión y el backbone de 313B.
- Generación asistida con baja latencia: la cabeza MTP permite decodificación especulativa, útil en aplicaciones interactivas donde la latencia por token es crítica.
- Prototipado de agentes multi-paso: la conservación del razonamiento previo en el historial facilita cadenas de razonamiento largas, aunque incrementa el consumo de contexto.
- Evaluación de cuantización en investigación: sirve para comparar la receta oQ4e frente al FP8 original en tareas multimodales, dado que el autor no ha medido la degradación.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia MIT del modelo base permite integrarlo en productos comerciales sin restricciones de copyleft.
- Experimentación con modelos MoE de gran escala en hardware de consumo profesional: el checkpoint demuestra la viabilidad de servir 321B parámetros en 173,6 GiB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no ha medido este pack frente a los pesos originales en FP8 o BF16.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 173,6 GiB de pesos, más overhead de KV cache y activaciones; el autor lo sirvió en una máquina con 256 GB de memoria unificada (M3 Ultra).
- GPU recomendadas: Apple Silicon con memoria unificada de 256 GB (M3 Ultra verificado por el autor). Para GPUs NVIDIA no se dispone de soporte MLX nativo; se requeriría conversión a otro formato.
- ¿Cabe en GPU de consumo? No en GPUs consumer convencionales (RTX 4090 con 24 GB, etc.); solo en configuraciones con memoria unificada muy alta o múltiples GPUs de数据中心.
- Opciones de despliegue: oMLX 0.7.4.dev1 (verificado, con MTP activado y chunked prefill). Otros runtimes (vLLM, llama.cpp, Ollama, TGI) no están documentados para este checkpoint MLX.
- Latencia y throughput: no disponible; no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sage-S2.1-Flash-oQ4e-mtp | 321,3B | 18B | no disponible | MIT | MLX safetensors 4-bit | Este checkpoint; multimodal; MTP conservado |
| internlm/Sage-S2.1-Flash (FP8) | 320B | 18B | no disponible | MIT | FP8 | Modelo base sin cuantizar a 4 bits |
| Jundot/GLM-5.3-Flash-oQ4e-mtp | no disponible | no disponible | no disponible | MIT | MLX 4-bit | Misma receta oQ4e; calibrado sobre proxy de 4 bits |

## Limitaciones y advertencias

- El autor no ha medido la degradación de calidad frente al FP8 o BF16 original; la fidelidad de la cuantización oQ4e en esta arquitectura es desconocida.
- La plantilla de chat propia de Sage conserva el razonamiento de turnos anteriores, lo que aumenta la longitud de los prompts multi-turno y el consumo de contexto en agentes.
- Los proyectores de entrada científica (moléculas, cristales, DNA/RNA, espectros, EEG) no están incluidos; el modelo no procesa esas modalidades por sí solo.
- Solo se ha verificado el despliegue con oMLX en Apple Silicon; el soporte en otros runtimes no está documentado.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos de gran escala.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- Restricciones de licencia: MIT, sin restricciones conocidas para uso comercial; se incluye el aviso de licencia MIT de Z.AI correspondiente a GLM-5.3-Flash.

## Enlaces

- Hugging Face: https://huggingface.co/rdbell/Sage-S2.1-Flash-oQ4e-mtp
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Modelo base en FP8: https://huggingface.co/internlm/Sage-S2.1-Flash-FP8
- Checkpoint de referencia con la misma receta: https://huggingface.co/Jundot/GLM-5.3-Flash-oQ4e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
