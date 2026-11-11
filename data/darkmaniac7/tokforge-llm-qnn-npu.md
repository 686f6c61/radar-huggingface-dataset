# darkmaniac7/TokForge-LLM-QNN-NPU

## Resumen

TokForge-LLM-QNN-NPU es un repositorio de paquetes de inferencia para NPU Hexagon de Qualcomm, publicados por TokForge (darkmaniac7) para su aplicacion movil de inferencia en dispositivo. No se trata de un modelo entrenado desde cero, sino de un conjunto de artefactos de despliegue (binarios de contexto QNN compilados con QAIRT 2.40 y un grafo MNN auxiliar) que aceleran la lectura de prompts largos sobre la NPU de telefonos Snapdragon, mientras la generacion de respuestas sigue ejecutandose en CPU con el modelo MNN emparejado.

El repositorio empaqueta cuatro variantes basadas en Qwen3-0.6B, Qwen3-1.7B y Huihui-Qwen3-4B-abliterated-v2, con un total de 16,4 GB repartidos en 59 ficheros. Cada paquete incluye un `MANIFEST.json` con hashes sha256 y carpetas por chip (`v75/` para Snapdragon 8 Gen 3 y `v81/` para Snapdragon 8 Elite Gen 5), lo que permite descargar solo el artefacto correspondiente al SoC del dispositivo.

Su relevancia radica en el enfoque hibrido NPU/CPU para modelos Qwen3 de pequeno tamano en movilidad: la NPU procesa el prefill de prompts largos y la CPU decodifica. Es un caso practico de despliegue on-device con cuantizacion especifica por hardware (HQQ en algunas variantes) y verificacion criptografica de integridad antes de la ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) empaquetado como binarios de contexto QNN para NPU Hexagon mas grafo MNN |
| Parametros totales | 0,6B / 1,7B / 4B segun la variante del paquete |
| Parametros activos | no disponible (modelos densos, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion para QNN NPU (formato no especificado); variante HQQ para Qwen3 1.7B |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | Binarios de contexto QNN (`graph*.bin`), grafo MNN (`llm.mnn`), JSON de configuracion; no safetensors ni GGUF |

## Arquitectura y entrenamiento

Los paquetes no implican entrenamiento propio: son conversiones de runtime de los modelos base Qwen3 (transformer denso con atencion estandar) a binarios de contexto Qualcomm QNN compilados con QAIRT 2.40 para las arquitecturas Hexagon V75 y V81. Cada carpeta por chip contiene los binarios `graph*.bin` (cuerpo del modelo compilado para esa NPU), el grafo MNN `llm.mnn` que los orquesta, `config_qnn.json` y `llm_config.json`.

El flujo de ejecucion es hibrido: la NPU realiza el prefill del prompt y la CPU, mediante el modelo MNN emparejado, genera la respuesta token a token. La variante de Qwen3 1.7B dispone de un paquete especifico para la descarga HQQ (`Qwen3-1.7B-MNN-HQQ-catalogpair`), lo que sugiere pesos cuantizados con HQQ en ese caso. El paquete de 4B se construye sobre Huihui-Qwen3-4B-abliterated-v2, una variante abliterated de Qwen3 4B. No se detallan datos de entrenamiento, numero de tokens ni procesos de RLHF/DPO, ya que corresponden a los modelos base originales del equipo Qwen.

## Capacidades

- Generacion de texto conversacional multturno con modelos Qwen3 de 0,6B, 1,7B y 4B.
- Aceleracion de prefill de prompts largos sobre NPU Hexagon, con decodificacion en CPU.
- Soporte bilingue ingles y chino (idiomas declarados del modelo base).
- Verificacion de integridad por sha256 de cada fichero antes de su uso.
- Comprobacion en dispositivo previa a la activacion de la NPU, con fallback a CPU si falla.
- Descarga selectiva por chip (V75 o V81) para minimizar el almacenamiento usado.
- Razonamiento y codigo heredados del modelo base Qwen3 (no documentados de forma especifica en la model card).
- Tool calling y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en Android con prompts largos: el paquete NPU reduce el tiempo hasta el primer token en conversaciones con historial extenso, manteniendo la generacion en CPU con el modelo MNN ya descargado.
- Resumenes en segundo plano en el dispositivo: la variante de 0,6B puede emplearse para tareas de fondo como resumenes, segun indica la model card, sin salir del telefono.
- Despliegue de chat local con Qwen3 1.7B en telefonos con 6 GB de RAM o mas: TokForge lista esta variante como recomendada para ese umbral de memoria.
- Chat local con Qwen3 4B Abliterated en dispositivos de 8 GB de RAM o mas: orientado a usuarios que buscan respuestas con menos restricciones de rechazo, con el coste de un paquete de 8,18 GB.
- Evaluacion de aceleracion NPU en pipelines de investigacion movil: permite medir la ganancia de prefill en Hexagon V75/V81 frente a ejecucion puramente en CPU con MNN.
- Integracion en aplicaciones Android propias mediante los binarios QNN y el grafo MNN: util para equipos que quieran reproducir el esquema hibrido fuera de la app TokForge, siempre que gestionen el runtime QNN 2.40 por su cuenta.
- Distribucion controlada de artefactos de modelo: el `MANIFEST.json` con sha256 por fichero facilita la verificacion en pipelines de aprovisionamiento de dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU: Qualcomm Hexagon V75 (Snapdragon 8 Gen 3, SM8650) o Hexagon V81 (Snapdragon 8 Elite Gen 5, SM8850).
- RAM del dispositivo: 6 GB o mas para Qwen3 1.7B; 8 GB o mas para Qwen3 4B Abliterated, segun la model card.
- Almacenamiento: paquetes de 0,62 a 4,09 GB por modelo y chip; repositorio completo de 16,4 GB.
- Runtime: QAIRT 2.40; las librerias de runtime QNN no estan en este repositorio y las incluye la app TokForge desde la version 1.3.9.
- Software: app TokForge 1.3.8 o superior para el reconocimiento y descarga de los paquetes; modelo MNN emparejado en CPU.
- GPU dedicada: no aplica; el diseno es para NPU movil mas CPU.
- VRAM estimada, latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| TokForge-LLM-QNN-NPU (este) | 0,6B / 1,7B / 4B | no disponible | QNN + MNN | Apache-2.0 | Aceleracion NPU Hexagon en movil |
| Qwen/Qwen3-0.6B | 0,6B | no disponible | safetensors | Apache-2.0 | Modelo base original |
| Qwen/Qwen3-1.7B | 1,7B | no disponible | safetensors | Apache-2.0 | Modelo base original |
| taobao-mnn/Qwen3-0.6B-MNN | 0,6B | no disponible | MNN | no disponible | Conversion MNN para CPU |
| huihui-ai/Huihui-Qwen3-4B-abliterated-v2 | 4B | no disponible | safetensors | no disponible | Variante abliterated del base |

## Limitaciones y advertencias

- No es un modelo entrenado: es un paquete de despliegue; cualquier evaluacion de calidad debe hacerse sobre los modelos Qwen3 base.
- Solo cubre dos SoC concretos (SM8650 y SM8850); en otros chips no hay binarios NPU y se depende del fallback a CPU.
- El repositorio no incluye las librerias de runtime QNN; sin la app TokForge 1.3.9 o superior hay que obtenerlas por separado.
- El paquete de 4B deriva de una variante abliterated, lo que puede aumentar respuestas no filtradas y requiere evaluacion de seguridad propia en produccion.
- Idiomas declarados limitados a ingles y chino; el comportamiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a modelos de 0,6B a 4B, especialmente en tareas de razonamiento complejo.
- No se publican benchmarks, latencias ni cifras de aceleracion, por lo que la ganancia real depende del dispositivo y la carga.
- La licencia Apache-2.0 del empaquetado no exime de verificar las condiciones de los modelos base y de la variante abliterated de terceros.
- La fecha de creacion del repositorio (2026-10-05) y su nula traccion (0 descargas, 0 likes) aconsejan tratar el proyecto como experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darkmaniac7/TokForge-LLM-QNN-NPU
- Web de TokForge: https://tokforge.ai
- Discord: https://discord.gg/Acv3CBtfVm
- Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Coleccion de paquetes NPU: https://huggingface.co/collections/darkmaniac7/tokforge-npu-packs-6ace2a2701fa913ff8ff1515
- Repositorio de runtime QNN: https://huggingface.co/darkmaniac7/TokForge-SD15-QNN-NPU
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Variante abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-4B-abliterated-v2
- Modelo MNN emparejado para 0.6B: https://huggingface.co/taobao-mnn/Qwen3-0.6B-MNN
- Paquete HQQ de 1.7B: https://huggingface.co/darkmaniac7/Qwen3-1.7B-MNN-HQQ
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
