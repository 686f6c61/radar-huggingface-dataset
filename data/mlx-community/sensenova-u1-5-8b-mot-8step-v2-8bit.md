# mlx-community/SenseNova-U1.5-8B-MoT-8step-v2-8bit

## Resumen

SenseNova-U1.5-8B-MoT-8step-v2-8bit es un artefacto para Apple Silicon, publicado por la comunidad mlx-community, del modelo unificado de SenseTime / SenseNova para generacion de imagen a partir de texto (T2I), edicion por instrucciones y respuesta visual a preguntas (VQA). El modelo subyacente, SenseNova-U1.5-8B-MoT, emplea una arquitectura NEO-unify Mixture-of-Transformers (MoT) con flujo rectificado en espacio de pixeles y sin VAE, y se distribuye bajo licencia Apache-2.0.

El artefacto combina tres transformaciones sobre el checkpoint original: la fusion en fp32 del LoRA oficial de destilacion a 8 pasos en su version V2 (aplicado sobre 294 proyecciones del stream de generacion), la conversion a bf16 y la cuantizacion a 8 bits con group size 64 segun la convencion de MLX. El resultado esta pensado para inferencia cfg-free de un solo forward por paso, con 8 pasos en total, reproduciendo la imagen del modelo fusionado en bf16 a coseno 0,995 y 30,9 dB de PSNR.

Su relevancia practica esta en la velocidad y el consumo: en un M5 Max alcanza un pico de 22,4 GB y genera 1024² en 3,3 s y 2048² en 13,4 s. Frente al artefacto V1 equivalente, corrige problemas de saturacion y de recorte de luces (el V1 quemaba el 64 % de los pixeles en un poster de prueba; el V2, el 0 %). El recuento real de parametros en safetensors es de 17.532.854.464, muy por encima del "8B" que sugiere el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-unify Mixture-of-Transformers (MoT) con flujo rectificado en espacio de pixeles, sin VAE |
| Parametros totales | 17.532.854.464 (~17,5 mil millones) segun safetensors; el nombre comercial indica 8B |
| Parametros activos | no disponible (MoT se refiere a Mixture-of-Transformers; la model card no documenta expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits con group size 64 (convencion `quantization` de MLX) sobre los streams del artefacto; el checkpoint upstream se distribuye en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con layout de MLX-Swift (convoluciones NHWC; lineales cuantizadas como `weight`/`scales`/`biases`) |

## Arquitectura y entrenamiento

El modelo base es un sistema multimodal nativo unificado que resuelve generacion de imagen, edicion por instrucciones y VQA dentro de una misma arquitectura MoT, con flujo rectificado aplicado directamente en espacio de pixeles y sin VAE intermedio. Lo desarrolla el equipo SenseNova de SenseTime; la referencia tecnica es el paper arXiv:2605.12500 y la implementacion de referencia es OpenSenseNova/SenseNova-U1 en PyTorch. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Sobre ese checkpoint se aplica el LoRA oficial de destilacion a 8 pasos en su version V2, publicado el 24 de septiembre de 2026: la fusion se realiza en fp32 como W += (α/r)·BA sobre 294 proyecciones del stream de generacion y despues se convierte el resultado. Respecto al artefacto V1, difieren exactamente 882 tensores (294 × weight/scales/biases) y ninguno mas. El tokenizer.json se regenera desde el vocab.json y merges.txt originales, con tokenizacion byte-identica verificada contra los identificadores de referencia. La paridad del runtime MLX-Swift frente a la implementacion de referencia en PyTorch es de menos de 1e-4 por componente y 0,999+ de coseno por pasada de extremo a extremo.

## Capacidades

- Generacion de imagenes a partir de texto (T2I) en resoluciones de 1024² y 2048² con 8 pasos de muestreo y cfg 1.0 (sin classifier-free guidance, un unico forward por paso).
- Edicion de imagenes por instrucciones mediante el flag `--edit-image` del runtime, documentada sobre los tiers base del modelo.
- VQA (respuesta visual a preguntas) mediante el flag `--vqa`, documentada sobre los tiers base.
- Modo de razonamiento explicito `<think>` mediante el flag `--think`, documentado sobre los tiers base.
- Pipeline declarado como any-to-any y multimodalidad nativa.
- Inferencia cuantizada a 8 bits con fidelidad medida de coseno 0,995 y 30,9 dB frente al render bf16 fusionado en carga.
- Carga con transitorio de conversion nulo: el pico de memoria en carga equivale a la memoria residente, porque los pesos ya estan en el layout de claves del runtime.
- No se documenta soporte de tool calling, function calling ni razonamiento agente multi-paso en este artefacto.
- Soporte multilingue: no disponible.

## Casos de uso

- Iteracion rapida de prompts en local sobre Mac: con 3,3 s por imagen a 1024² y 8 pasos, un disenador puede probar decenas de variaciones de un prompt en unos minutos sin depender de APIs externas ni de GPU dedicada.
- Renderizado por lotes de alta resolucion: 13,4 s por imagen a 2048² permite producir material para impresion o fondos de pantalla en procesos desatendidos que aprovechen periodos de inactividad del equipo.
- Integracion en aplicaciones nativas de macOS e iOS: el runtime `sensenova-u1-swift` esta escrito en MLX-Swift, de modo que la inferencia puede embeberse en una app sin salir del ecosistema Swift ni anadir dependencias de Python.
- Prototipado de assets para produccion audiovisual: la correccion de saturacion y de recorte de luces respecto a V1 (recorte en sombras del 8,4 % al 0,3 %, 12,7 puntos porcentuales menos de recorte en altas luces) hace este artefacto util para generar storyboards y referencias de color que no requieran retoque posterior.
- Investigacion sobre flujo rectificado sin VAE: al operar en espacio de pixeles y publicarse con licencia Apache-2.0, sirve como base reproducible para experimentar con destilacion a pocos pasos y con cuantizacion post-entrenamiento.
- Evaluacion de cuantizacion: el artefacto documenta la fidelidad exacta de int8 frente a bf16 (coseno 0,995, 30,9 dB), por lo que es un caso de referencia para medir el coste de cuantizar un modelo generativo multimodal.
- Edicion y analisis de imagenes en flujos de trabajo locales: los modos de edicion por instrucciones y VQA del runtime permiten montar herramientas de retoque asistido o de catalogacion automatica, siempre que se use un tier base y no exclusivamente este artefacto destilado.
- Demostraciones y evaluaciones comparativas de semillas: al conservarse el artefacto V1 sin cambios, se pueden reproducir resultados antiguos y compararlos con V2 bajo la misma semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. Los unicos datos cuantitativos son medidas internas del propio artefacto:

| Metrica | Valor |
|---|---|
| Saturacion media (V2 frente a V1, semilla fija, 1024², 8 pasos, cfg 1) | −0,070 |
| Contraste RMS (V2 frente a V1) | −0,045 |
| Gradiente percentil 99 (V2 frente a V1) | −25 % |
| Recorte en sombras | 8,4 % (V1) → 0,3 % (V2) |
| Recorte en altas luces | 12,7 puntos porcentuales menos en V2; el poster V1 quemaba el 64 % de los pixeles, el V2 el 0 % |
| Similitud de composicion cos(V1, V2) | 0,86–0,99 |
| Fidelidad int8 frente al bf16 fusionado en carga | coseno 0,995 / 30,9 dB |
| Paridad del runtime MLX-Swift frente a PyTorch | < 1e-4 por componente; coseno 0,999+ por pasada e2e |
| Latencia en M5 Max, 1024², 8 pasos | 3,3 s (pico 22,4 GB) |
| Latencia en M5 Max, 2048², 8 pasos | 13,4 s (pico 22,4 GB) |

## Requisitos de hardware

- Memoria unificada: el pico medido en un M5 Max es de 22,4 GB, por lo que el objetivo minimo razonable son equipos Apple Silicon con 24 GB o mas de memoria unificada. No se han publicado medidas para configuraciones con menos memoria.
- Tamano del repositorio: 19,9 GB de pesos en disco antes de la carga.
- GPU discretas (A100, H100, RTX 4090 y similares): no disponible. Este artefacto es especifico de MLX y no incluye pesos en formato utilizable por CUDA; para esos entornos habria que partir del checkpoint upstream y del runtime PyTorch de referencia.
- Opciones de despliegue documentadas: runtime `sensenova-u1-swift` (MLX-Swift) con la variante `8step-v2-8bit`. No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI, y al tratarse de pesos safetensors en el layout propio del runtime no son directamente reutilizables en esos servidores.
- Latencia y throughput: 3,3 s por imagen a 1024² y 13,4 s a 2048² en M5 Max con 8 pasos y cfg 1.0. En encadenamiento sin solapamiento, la primera cifra equivale a unas 18 imagenes por minuto a 1024².
- Memoria en carga: al almacenarse los pesos en el layout de claves del runtime, el pico durante la carga es aproximadamente igual a la memoria residente, sin transitorio de conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Pasos | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| mlx-community/SenseNova-U1.5-8B-MoT-8step-v2-8bit | 17.532.854.464 (safetensors) | 8 bits, group 64 | 8 | Apache-2.0 | MLX-Swift, Apple Silicon | LoRA V2 fusionado; corrige saturacion y recorte frente a V1 |
| mlx-community/SenseNova-U1.5-8B-MoT-8step-8bit (V1) | no disponible | 8 bits | 8 | Apache-2.0 | MLX-Swift, Apple Silicon | Se mantiene publicado sin cambios para reproducir semillas antiguas; mayor saturacion y recorte de altas luces |
| sensenova/SenseNova-U1.5-8B-MoT (upstream) | no disponible | bf16 | no disponible | Apache-2.0 | PyTorch (referencia) | Checkpoint original de SenseTime; la model card no documenta su destilacion a 8 pasos |
| Alternativas de otros proveedores (familia FLUX, SD3.5, Qwen-Image y similares) | no disponible | no disponible | no disponible | no disponible | no disponible | No se han facilitado datos comparativos verificables en la informacion disponible |

## Limitaciones y advertencias

- Artefacto con 0 descargas y 0 likes y publicado el 11 de octubre de 2026: la validacion por parte de la comunidad es practicamente inexistente.
- El nombre indica "8B" pero el recuento real de safetensors es de 17.532.854.464 parametros, mas del doble; conviene no planificar el hardware a partir del nombre.
- No se documentan idiomas soportados ni longitud de contexto, de modo que el comportamiento multilingue y el manejo de prompts largos no estan caracterizados.
- La cuantizacion a 8 bits es con perdida, aunque la fidelidad declarada frente al bf16 fusionado en carga es alta (coseno 0,995, 30,9 dB). No se documentan degradaciones especificas por tipo de prompt.
- El modelo esta destilado a 8 pasos: no hay datos publicados en esta informacion sobre como se comporta con un numero mayor de pasos ni sobre la perdida de calidad respecto al modelo completo sin destilar.
- Persiste un recorte en sombras residual del 0,3 % tras la correccion de V2.
- Los pesos estan en el layout de claves especifico del runtime MLX-Swift, con NHWC en convoluciones y lineales cuantizadas como `weight`/`scales`/`biases`; no son un GGUF ni un safetensors portable a otros motores sin conversion.
- El repositorio requiere `custom_code` y no se integra directamente con un pipeline estandar de transformers.
- Las capacidades de edicion por instrucciones, VQA y modo `<think>` se documentan para los tiers base del runtime, no como caracteristicas verificadas de este artefacto destilado de 8 pasos; conviene validarlas antes de usarlas en produccion.
- Al ser un modelo de generacion de imagen, existen riesgos de sesgos de representacion en los resultados, de contenido sintetico no identificado y de uso para deepfakes o suplantacion. No se documentan tasas de sesgo ni medidas de mitigacion.
- En los modos de VQA y edicion no se documentan tasas de alucinacion; como en cualquier modelo multimodal, puede describir contenido inexistente en la imagen de entrada.
- Licencia Apache-2.0 tanto en el upstream como en el adaptador, lo que permite uso comercial, pero el artefacto se redistribuye con modificaciones (fusion de LoRA, conversion a bf16 y cuantizacion): conviene conservar la atribucion al equipo SenseNova y la nota de modificaciones.
- La busqueda web asociada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.

## Enlaces

- Artefacto en HuggingFace: https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-8step-v2-8bit
- Modelo base upstream: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT
- Commit del upstream: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT/commit/07d76f61474b9c6e6999e22c559314d3439b8c81
- Repositorio de LoRAs: https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT-LoRAs
- LoRA V2 (fichero `SenseNova-U1.5-8B-MoT-LoRA-8step-V2.safetensors`): https://huggingface.co/sensenova/SenseNova-U1.5-8B-MoT-LoRAs/blob/main/SenseNova-U1.5-8B-MoT-LoRA-8step-V2.safetensors
- Espejo del LoRA: https://huggingface.co/xocialize/SenseNova-U1.5-8B-MoT-LoRAs
- Artefacto V1 en MLX: https://huggingface.co/mlx-community/SenseNova-U1.5-8B-MoT-8step-8bit
- Paper: https://arxiv.org/abs/2605.12500
- Implementacion de referencia en PyTorch: https://github.com/OpenSenseNova/SenseNova-U1
- Runtime MLX-Swift: https://github.com/xocialize/sensenova-u1-swift
- Organizacion SenseNova en HuggingFace: https://huggingface.co/sensenova
