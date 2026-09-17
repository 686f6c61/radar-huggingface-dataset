# dsfdsferw43/Wan2.2-TI2V-5B-GGUF

## Resumen

Este repositorio es una redistribucion en formato GGUF del modelo Wan2.2-TI2V-5B, un modelo de difusion de texto a video (text-to-video) de aproximadamente 5.000 millones de parametros desarrollado originalmente por el equipo Wan (Alibaba). El modelo base genera video a partir de una descripcion textual y esta disenado exclusivamente para 720P, con resoluciones soportadas de 1280x704 y 704x1280. La ficha corresponde a un espejo de cuantizaciones, no al modelo original: recopila las 13 cuantizaciones GGUF publicadas por QuantStack junto con su VAE complementario, y las redistribuye con los pesos sin modificar.

Su relevancia practica radica en que empaqueta el modelo en tamanos que van de 1,73 GiB (Q2_K) a 5,03 GiB (Q8_0), lo que permite ejecutar un generador de video de 720P en hardware de consumo ajustando la precision, algo impensable con los pesos originales en precision completa. Se distribuye bajo licencia Apache-2.0, con prompts en ingles y chino, y esta pensado para integrarse en herramientas como ComfyUI o stable-diffusion.cpp que ya soportan el formato GGUF para modelos de difusion.

Conviene subrayar que este repositorio no es un producto oficial de Alibaba Wan Team ni de QuantStack, sino una redistribucion de terceros (autor `dsfdsferw43`) que refleja el catalogo de GGUF del repositorio fuente. No incluye pesos nuevos ni reentrenamiento; el unico trabajo tecnico (cuantizacion del transformer y conversion del VAE de `.pth` a `.safetensors`) es atribuido a QuantStack.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-video (familia Wan 2.2); detalle interno no disponible en la informacion proporcionada |
| Parametros totales | 4.999.787.712 (~5B, medido en safetensors) |
| Longitud de contexto | No aplicable / no disponible (modelo de generacion de video) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_0, Q5_K_M, Q5_1, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transformer); safetensors (VAE: `Wan2.2_VAE.safetensors`) |
| Resoluciones soportadas | 1280x704 y 704x1280 (solo 720P) |
| Compresion temporal del VAE | 4 (los recuentos de fotogramas validos deben ser 4k+1) |
| Tamano total del repositorio | 45,4 GB |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B |

Tabla de cuantizaciones disponibles:

| Archivo | Tamano |
|---|---|
| `Wan2.2-TI2V-5B-Q2_K.gguf` | 1,73 GiB |
| `Wan2.2-TI2V-5B-Q3_K_S.gguf` | 2,14 GiB |
| `Wan2.2-TI2V-5B-Q3_K_M.gguf` | 2,37 GiB |
| `Wan2.2-TI2V-5B-Q4_0.gguf` | 2,82 GiB |
| `Wan2.2-TI2V-5B-Q4_K_S.gguf` | 2,90 GiB |
| `Wan2.2-TI2V-5B-Q4_1.gguf` | 3,03 GiB |
| `Wan2.2-TI2V-5B-Q4_K_M.gguf` | 3,20 GiB |
| `Wan2.2-TI2V-5B-Q5_K_S.gguf` | 3,32 GiB |
| `Wan2.2-TI2V-5B-Q5_0.gguf` | 3,39 GiB |
| `Wan2.2-TI2V-5B-Q5_K_M.gguf` | 3,55 GiB |
| `Wan2.2-TI2V-5B-Q5_1.gguf` | 3,60 GiB |
| `Wan2.2-TI2V-5B-Q6_K.gguf` | 3,92 GiB |
| `Wan2.2-TI2V-5B-Q8_0.gguf` | 5,03 GiB |
| `VAE/Wan2.2_VAE.safetensors` | 1,31 GiB |

## Arquitectura y entrenamiento

El pipeline declarado es `text-to-video`, lo que identifica un modelo de difusion que transforma una descripcion textual en una secuencia de video. La informacion proporcionada confirma que el transformer esta cuantizado a GGUF y que el VAE emplea una compresion temporal de 4, de modo que solo son validos los recuentos de fotogramas que cumplen la forma 4k+1. Mas alla de estos datos, la ficha no detalla el numero de capas, el tipo de atencion, el esquema de muestreo ni la composicion del dataset de entrenamiento.

Tampoco se especifica si hubo fases de ajuste fino (RLHF, DPO u otras), el volumen de tokens o pares texto-video utilizados, ni innovaciones tecnicas adicionales. El unico trabajo documentado sobre estos pesos es de posprocesado: la cuantizacion del transformer a los 13 niveles GGUF y la conversion del VAE desde el formato original `.pth` a `.safetensors`, ambas atribuidas a QuantStack. Cualquier dato sobre el entrenamiento original debe consultarse en el modelo base `Wan-AI/Wan2.2-TI2V-5B`.

## Capacidades

- Generacion de video a partir de texto (text-to-video) en resoluciones de 720P: 1280x704 y 704x1280.
- Generacion de secuencias de video con recuentos de fotogramas restringidos a la forma 4k+1 por la compresion temporal del VAE.
- Soporte de prompts en ingles y chino.
- Distribucion en 13 niveles de cuantizacion, lo que permite al usuario escoger el equilibrio entre calidad y consumo de memoria.
- Ejecucion local dentro de ecosistemas que soportan GGUF para modelos de difusion (ComfyUI con nodo GGUF, stable-diffusion.cpp).
- Capacidades de tool calling, function calling, agentes, modo thinking, vision o audio: no aplicables a este tipo de modelo y no documentadas.

## Casos de uso

- Generacion de clips cortos de producto para comercio electronico: el modelo crea videos de 720P a partir de una descripcion textual, utiles para fichas de producto o anuncios sin rodaje.
- Prototipado creativo en estudios de animacion: generar bocetos animados en 704x1280 o 1280x704 para validar una idea antes de invertir en produccion.
- Previsualizacion de storyboards: convertir guiones breves en clips de referencia que el equipo de direccion puede evaluar rapidamente.
- Creacion de contenido para redes sociales: producir clips verticales (704x1280) adaptados a formatos moviles a partir de un prompt en ingles o chino.
- Experimentacion en investigacion sobre difusion de video: al ofrecer 13 niveles de cuantizacion del mismo checkpoint, permite estudiar el impacto de la precision en la calidad generada con un presupuesto de VRAM controlado.
- Despliegue en hardware de consumo: con cuantizaciones Q4 o Q5 de 3,20 a 3,55 GiB, es viable generar video en una GPU de gama alta para uso domestico, algo inviable con los pesos en precision completa.
- Integracion en pipelines automatizados de generacion de video dentro de ComfyUI o stable-diffusion.cpp, encadenando el modelo con nodos de posprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye metricas objetivas (FVD, CLIP score ni comparaciones cuantitativas de calidad) ni resultados en conjuntos estandar de evaluacion de video. Tampoco se aportan cifras de latencia o throughput medidas.

## Requisitos de hardware

- Los tamanos de VRAM citados a continuacion son estimaciones basadas en el tamano de los archivos GGUF mas el VAE (1,31 GiB) y el sobrecoste de los tensores latentes y la atencion durante la generacion; no proceden de mediciones publicadas.
- Estimacion orientativa de VRAM para el transformer, segun cuantizacion: Q2_K ~1,7 GiB, Q4_K_M ~3,2 GiB, Q6_K ~3,9 GiB, Q8_0 ~5,0 GiB. A esta cifra hay que sumar el VAE (1,31 GiB) y el pico de memoria de la generacion de video, que puede ser considerable a 720P.
- Es probable que las cuantizaciones bajas y medias (Q4 a Q6) quepan en GPU de consumo con al menos 12-16 GB de VRAM, como la RTX 4080 o la RTX 4090, si bien el pico de memoria de video a 720P puede exigir margen adicional.
- Para lotes grandes, mayor recuento de fotogramas o precision Q8_0, son recomendables GPU de datacenter como A100 (40/80 GB) o H100.
- Opciones de despliegue: ComfyUI con soporte de nodos GGUF para modelos de difusion, y stable-diffusion.cpp. Las herramientas orientadas a modelos de lenguaje (vLLM, Ollama, TGI) no son aplicables a este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-TI2V-5B (este repositorio, GGUF) | ~5B | GGUF + VAE safetensors | Apache-2.0 | HuggingFace (mirror de terceros) |
| Wan2.1 (variantes T2V) | no disponible en la informacion | no disponible | no disponible | HuggingFace |
| LTX-Video | no disponible en la informacion | no disponible | no disponible | HuggingFace |
| HunyuanVideo | no disponible en la informacion | no disponible | no disponible | HuggingFace |

Los datos de los modelos alternativos no se incluyen en la informacion proporcionada; se citan unicamente como familias comparables dentro de la generacion de video texto-a-video. No se dispone de cifras verificadas de parametros, contexto ni rendimiento para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo de video entrenado probablemente con datos a gran escala, puede reproducir sesgos de representacion, pero no se aportan datos al respecto.
- Riesgo de alucinacion y artefactos: en modelos de difusion de video se traduce en incoherencias temporales, deformaciones y contenido que no corresponde al prompt; la magnitud no esta cuantificada.
- La cuantizacion degrada la calidad respecto a los pesos originales, especialmente en niveles bajos (Q2_K, Q3_K). No se documenta la perdida exacta.
- Limitacion de resoluccion: el checkpoint es exclusivamente 720P (1280x704 y 704x1280); otras resoluciones no estan soportadas.
- Los recuentos de fotogramas deben cumplir la forma 4k+1 por la compresion temporal del VAE; otros valores no son validos.
- Idiomas limitados a ingles y chino; no hay soporte declarado para castellano ni otras lenguas.
- Licencia Apache-2.0, que permite uso comercial, pero es una redistribucion de terceros; conviene conservar los archivos `LICENSE` y `NOTICE` por los requisitos de atribucion de la seccion 4(b).
- El repositorio es un espejo no oficial: no esta respaldado por Alibaba Wan Team ni por QuantStack, y su disponibilidad depende del mantenedor, por lo que podria desaparecer o cambiar.
- Este es un mirror con 0 descargas y 0 likes en el momento de la ficha; se recomienda verificar la integridad y procedencia de los pesos antes de usarlos en produccion.
- Los resultados de la busqueda web asociada no contienen informacion relevante sobre el modelo (devuelven paginas no relacionadas con IA), por lo que no aportan datos adicionales verificables.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/dsfdsferw43/Wan2.2-TI2V-5B-GGUF
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Repositorio fuente de las cuantizaciones (QuantStack): https://huggingface.co/QuantStack/Wan2.2-TI2V-5B-GGUF
- Repositorio GGUF referenciado en la model card (Unsloth): https://huggingface.co/unsloth/Wan2.2-TI2V-5B-GGUF
- Licencia Apache-2.0 del proyecto Wan2.2: https://github.com/Wan-Video/Wan2.2/blob/main/LICENSE.txt
- Repositorio del proyecto Wan2.2: https://github.com/Wan-Video/Wan2.2
- No se han encontrado enlaces adicionales relevantes (papers, blogs, demos) en la busqueda web proporcionada.
