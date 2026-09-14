# magiccodingman/Qwen3.8-Flash-Next-Quark-MXFP4-fp8

## Resumen

Qwen3.8-Flash-Next-Quark-MXFP4-fp8 es un checkpoint derivado de precisión mixta publicado por el usuario magiccodingman sobre `amd/Qwen3.8-Flash-Next-Quark-MXFP4`, que a su vez es una cuantización Quark MXFP4 de `Qwen/Qwen3.8-Flash-Next`. El objetivo declarado es reducir la huella en BF16 que aún quedaba en el checkpoint de AMD convirtiendo componentes concretos a FP8, sin tocar los expertos MoE que ya estaban en MXFP4. El resultado es un modelo de 119.484.039.059 parámetros (unos 119,48 mil millones) con pesos en safetensors y un payload de tensor de 119,69 GiB, frente a los 169,72 GiB del checkpoint de origen, lo que supone un recorte de 50,03 GiB.

El modelo conserva la pila multimodal del original: arquitectura `Qwen4ExpForConditionalGeneration`, con entrada de texto, imagen y vídeo, y salida de texto. Es un modelo de mezcla de expertos (MoE) en el que los expertos enrutados y el experto compartido del modelo de lenguaje permanecen en OCP MXFP4, mientras que el *embedding* PLE de n-gramas pasa a FP8 E4M3FN y las proyecciones de expertos enrutados del MTP se almacenan en FP8 de bloques 128×128 compatible con Quark. Las rutas de atención, router/gating, *vision tower*, hiperconexiones y `lm_head` siguen en BF16.

Su relevancia es doble: por un lado, demuestra que es posible exprimir aún más un checkpoint ya cuantizado en 4 bits sin degradar de forma apreciable el comportamiento medido (divergencia KL media de 0,01542 nats/token frente a la referencia AMD en una comparación de logits de vocabulario completo); por otro, sirve como banco de pruebas reproducible para estudiar el impacto de mezclar MXFP4 con FP8 en modelos MoE multimodales de gran tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (transformer MoE, base Qwen3.8-Flash-Next) |
| Parámetros totales | 119.484.039.059 (119,48 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 estático (OCP) en expertos MoE enrutados y compartido; MXFP4 dinámico en activaciones de expertos; FP8 E4M3FN en el embedding PLE; FP8 de bloques 128×128 (Quark) en proyecciones MTP; BF16 en atención, router, gates, vision tower, hiperconexiones y `lm_head` |
| Idiomas soportados | no disponible |
| Licencia | other (derivada; sujeta a las licencias de AMD y Qwen) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 128,6 GB |
| Payload de tensor | 119,69 GiB (frente a 169,72 GiB del checkpoint AMD de origen) |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Fecha de creación | 2026-09-13 |
| Última actualización | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento nuevo: se trata de una requantización *post-training* de un checkpoint ya cuantizado. La cadena de linaje es `Qwen/Qwen3.8-Flash-Next` → `amd/Qwen3.8-Flash-Next-Quark-MXFP4` → este checkpoint mixto MXFP4 + FP8. El checkpoint de AMD aportaba pesos estáticos MXFP4 (OCP) para los expertos MoE enrutados y el experto compartido del modelo de lenguaje, activaciones de experto en MXFP4 dinámico, y dejaba en BF16 la atención, el PLE, el MTP, las rutas de router/gating, la torre de visión, las hiperconexiones y el `lm_head`.

Sobre esa base, esta derivación convierte a FP8 dos bloques de alto consumo de memoria. El PLE se cuantiza a FP8 E4M3FN: las 128 particiones físicas del *embedding* PLE comparten una única escala FP32 aplicada al embedding lógico completo. El MTP se cuantiza con FP8 de bloques 128×128 compatible con Quark y tensores de escala FP32 por peso, aplicado a las 1.536 proyecciones de expertos enrutados del MTP. La elección de qué tensores pasar a FP8 se guio comparando los *layouts* de `amd/Qwen3.8-Flash-Next-Quark-MXFP4`, `Qwen/Qwen3.8-Flash-Next-FP8` y `nvidia/Qwen3.8-Flash-Next-NVFP4`; los pesos se cuantizaron desde el checkpoint de AMD, no se copiaron de las referencias FP8 o NVFP4.

La validación numérica reportada incluye reconstrucción de pesos FP8 con similitud coseno de ~0,99965, RMSE relativo de ~0,026 y cero recortes (*clipping*) observados. No se declara ningún proceso de RLHF, DPO o ajuste fino adicional en esta derivación.

## Capacidades

- Generación de texto condicionada por imagen y vídeo (pipeline `image-text-to-text`), con salida exclusivamente textual.
- Razonamiento y matemáticas: el checkpoint de origen AMD reporta 96,5 en GSM8K 5-shot, con una recuperación del 99,7 % respecto al modelo Qwen sin cuantizar.
- Mezcla de expertos (MoE) con expertos enrutados y un experto compartido, lo que permite activar solo una fracción de los 119,48 mil millones de parámetros por token (el número de parámetros activos no está publicado).
- *Multi-token prediction* (MTP): el modelo incorpora 1.536 proyecciones de expertos enrutados dedicadas al MTP, pensadas para decodificación especulativa, aunque la comparación de logits publicada se hizo sin ejercitar el MTP.
- Soporte de conversación multi-turno: la etiqueta `conversational` está presente en el modelo, aunque no se detallan formatos de prompt ni plantilla de chat.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la ficha no declara idiomas soportados.
- Modo de razonamiento explícito (*thinking mode*), audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue multimodal en clúster con memoria ajustada: el recorte de 50,03 GiB frente al checkpoint MXFP4 de AMD permite servir el modelo en configuraciones de GPU que antes se quedaban cortas de VRAM, manteniendo el pipeline `image-text-to-text` para entrada de texto, imagen y vídeo.
- Investigación sobre degradación por cuantización: el modelo incluye una metodología reproducible de comparación de logits de vocabulario completo con divergencia KL, NLL y ratio de perplejidad, útil como caso de estudio para medir el coste real de pasar componentes BF16 a FP8.
- Validación de *layouts* de cuantización híbrida: sirve de referencia práctica para equipos que quieran replicar el esquema (expertos en MXFP4, componentes auxiliares en FP8 de bloques) sobre otros MoE.
- Evaluación de decodificación especulativa con MTP: al conservar las 1.536 proyecciones MTP en FP8 de bloques, es un banco de pruebas para medir si la cuantización del MTP afecta a la tasa de aceptación de la decodificación especulativa.
- Procesamiento de documentos con componente visual: al aceptar imagen y vídeo como entrada, encaja en flujos de extracción y resumen de documentos escaneados o de material audiovisual, siempre que se confirme la ventana de contexto del modelo base.
- *Benchmarking* interno de infraestructuras de inferencia: útil para comparar *runtimes* y kernels que soporten MXFP4/FP8 frente a alternativas FP8 puras o NVFP4, usando el mismo grafo computacional.
- Reproducción de evaluaciones tipo GSM8K en entornos con restricciones de memoria: el modelo hereda el comportamiento aritmético del checkpoint AMD, que conserva el 99,7 % del resultado del modelo sin cuantizar.

## Benchmarks y rendimiento

Los datos disponibles corresponden al checkpoint de origen de AMD, no a esta derivación concreta. Se reproducen tal cual:

| Modelo | GSM8K, 5-shot |
|---|---|
| `Qwen/Qwen3.8-Flash-Next` | 96,8 |
| `amd/Qwen3.8-Flash-Next-Quark-MXFP4` | 96,5 |
| Recuperación | 99,7 % |

Comparación de logits de vocabulario completo, *teacher-forced*, frente a `amd/Qwen3.8-Flash-Next-Quark-MXFP4` (dirección `KL(referencia || candidato)`):

| Métrica | Resultado |
|---|---|
| Tokens evaluados | 28 |
| Divergencia KL media | 0,01542 nats/token |
| KL P95 | 0,03851 |
| KL P99 | 0,04607 |
| KL máxima | 0,04850 |
| Acuerdo en top-1 | 85,71 % |
| NLL de referencia | 5,44837 |
| NLL del candidato | 5,41924 |
| Delta de NLL | -0,02913 |
| Ratio de perplejidad | 0,97129 |

Reconstrucción numérica de los tensores convertidos a FP8: similitud coseno ~0,99965, RMSE relativo ~0,026, recorte observado 0.

No se han publicado resultados de benchmarks de MMLU, HumanEval u otras tareas para esta derivación en la información disponible. Tampoco se ha ejercitado la decodificación especulativa MTP en las mediciones.

## Requisitos de hardware

- VRAM para inferencia: el payload de pesos es de 119,69 GiB, por lo que se necesita al menos esa cantidad de memoria de GPU solo para los pesos, más la caché KV y las activaciones. La cifra exacta de VRAM depende del *runtime* y de la longitud de contexto, que no está publicada.
- GPU recomendadas: una NVIDIA H200 (141 GB) cubre los pesos con margen limitado; dos H100 de 80 GB (160 GB) o dos A100 de 80 GB (160 GB) son configuraciones viables si el *runtime* soporta el reparto.
- GPU de consumo: no cabe en una GPU de consumo individual (24-32 GB). Cuatro RTX 4090 suman 96 GB, por debajo de los 119,69 GiB de pesos, por lo que tampoco cabría en esa configuración sin *offloading* a CPU o disco.
- Opciones de despliegue: `transformers` está confirmado por la librería declarada y el formato safetensors. El soporte en vLLM, TGI, SGLang, llama.cpp u Ollama para este esquema mixto Quark MXFP4 + FP8 no está confirmado en la información disponible; conviene verificar los kernels MXFP4 antes de planificar producción.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Payload | Licencia |
|---|---|---|---|---|---|
| `magiccodingman/Qwen3.8-Flash-Next-Quark-MXFP4-fp8` | 119,48 mil millones | no disponible | MXFP4 + FP8 mixto | 119,69 GiB | other |
| `amd/Qwen3.8-Flash-Next-Quark-MXFP4` | no disponible | no disponible | MXFP4 (Quark) | 169,72 GiB | no disponible |
| `Qwen/Qwen3.8-Flash-Next-FP8` | no disponible | no disponible | FP8 | no disponible | no disponible |
| `nvidia/Qwen3.8-Flash-Next-NVFP4` | no disponible | no disponible | NVFP4 | no disponible | no disponible |
| `Qwen/Qwen3.8-Flash-Next` | no disponible | no disponible | BF16 (sin cuantizar) | no disponible | no disponible |

Los cuatro modelos comparados pertenecen a la misma familia y comparten arquitectura base; las diferencias están en el esquema de cuantización y en la huella de memoria. No se dispone de datos de rendimiento comparables entre `Qwen/Qwen3.8-Flash-Next-FP8` y `nvidia/Qwen3.8-Flash-Next-NVFP4` en la información proporcionada.

## Limitaciones y advertencias

- La validación publicada se apoya en tan solo 28 tokens evaluados con logits de vocabulario completo. Es una muestra muy pequeña para extraer conclusiones robustas sobre la calidad global del modelo, aunque el acuerdo en top-1 del 85,71 % y la KL media de 0,01542 nats/token sean indicios razonables.
- La prueba de GSM8K corresponde al checkpoint de AMD, no a esta derivación; no se ha medido GSM8K sobre el modelo FP8 mixto.
- No se declaran idiomas soportados. No se puede asumir cobertura multilingüe sin verificar la del modelo Qwen subyacente.
- No se publica la longitud de contexto del modelo base en esta ficha; hay que consultar la documentación de Qwen para planificar despliegues con contextos largos.
- Riesgo de alucinación: no cuantificado en la información disponible. Como en cualquier modelo generativo, existe, y la cuantización agresiva puede amplificarlo en dominios poco representados.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgo o toxicidad para esta derivación.
- Licencia: el campo declarado es `other`. Al ser un derivado de `amd/Qwen3.8-Flash-Next-Quark-MXFP4` y, en última instancia, de `Qwen/Qwen3.8-Flash-Next`, los términos aplicables son los de los repositorios de AMD y Qwen. Es imprescindible revisar esas licencias antes de cualquier uso comercial.
- Trazabilidad limitada: es un checkpoint de un desarrollador individual, sin proceso de revisión, con cero descargas y cero *likes* en el momento de redactar esta ficha. No hay garantías de mantenimiento ni de soporte.
- Compatibilidad de *runtime*: el esquema mixto MXFP4 + FP8 con escala compartida en el PLE y bloques Quark 128×128 en el MTP puede no estar soportado por todos los motores de inferencia. Verificar kernels y versiones antes de producción.
- El checkpoint conserva el MTP en FP8 y las rutas de atención en BF16; la comparación publicada no ejerció la decodificación especulativa, por lo que el impacto de la cuantización del MTP sobre la tasa de aceptación queda sin medir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/magiccodingman/Qwen3.8-Flash-Next-Quark-MXFP4-fp8
- Modelo base (AMD Quark MXFP4): https://huggingface.co/amd/Qwen3.8-Flash-Next-Quark-MXFP4
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Referencia FP8 de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Referencia NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Página de soporte del autor: https://sayou.biz/support
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados trataban sobre viajes y actualidad de Japón, sin relación con el modelo. No se dispone de paper, blog técnico ni repositorio adicional verificado.
