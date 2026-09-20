# minjaechoi/nemotron3-nano-30b-a3b-2p25bit-r17

## Resumen

Este repositorio contiene un checkpoint de investigación publicado por el usuario `minjaechoi` que parte de `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`. Se trata de una variante cuantizada en la que los expertos enrutados de la capa MoE se comprimen a una media de 2,254 bits (identificador interno r17), mientras que el resto de los pesos permanece en BF16. La particularidad es que los pesos se almacenan ya desquantizados en tensores BF16, por lo que el modelo carga con `transformers` y vLLM estándar sin necesidad de kernels de cuantización específicos.

El modelo base pertenece a la familia Nemotron 3 Nano de NVIDIA, con 31.577.937.344 parámetros totales (unos 31,6 B) y un diseño de mezcla de expertos, como indica el sufijo A3B del nombre y la etiqueta `nemotron_h` del repositorio. La model card del checkpoint no documenta la arquitectura interna, la longitud de contexto, los idiomas soportados ni los datos de entrenamiento, y se limita a describir el esquema de compresión aplicado.

Su relevancia es acotada y fundamentalmente experimental: el autor lo define explícitamente como un checkpoint de investigación interno y, en el momento de la consulta, acumula 199 descargas y 0 valoraciones positivas. El interés técnico reside en estudiar el comportamiento de expertos enrutados a muy baja precisión dentro de un modelo MoE de ~30 B, no en un uso de producción directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE); etiqueta de arquitectura `nemotron_h`. Composición interna no disponible en la model card |
| Parametros totales | 31.577.937.344 (~31,6 B), dato de safetensors |
| Parametros activos | ~3 B (deducido del sufijo A3B del nombre del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,254 bits de media (revision r17); resto de pesos en BF16. Los pesos se almacenan desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; el autor indica que se hereda de la licencia del modelo base |
| Formato de pesos | safetensors (BF16), `library_name: transformers`, requiere `custom_code` y `trust_remote_code` |
| Tamano del repositorio | 63,2 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 |
| Fecha de publicacion | 2026-09-20 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura mas alla de la etiqueta `nemotron_h` y del nombre del modelo base, que apunta a un diseno de mezcla de expertos con aproximadamente 31,6 B de parametros totales y unos 3 B activos por token. No se detalla el numero de capas, el numero de expertos, la estrategia de enrutamiento, el uso de atencion hibrida (Mamba/Transformer) ni la composicion del conjunto de datos de entrenamiento. Tampoco hay informacion sobre fases de ajuste como SFT, RLHF o DPO en el modelo base.

La innovacion tecnica que documenta esta ficha es exclusivamente el esquema de compresion aplicado por el autor: los expertos enrutados se representan a una media de 2,254 bits, mientras que el resto de los pesos conserva BF16, y el resultado se materializa en tensores BF16 desquantizados. Esto implica que la compresion no reduce el espacio en disco ni la memoria necesaria para la inferencia respecto al checkpoint original: el repositorio ocupa 63,2 GB, coherente con 31,58 B de parametros almacenados a 2 bytes por parametro. El beneficio, si existe, es de fidelidad numerica o de comportamiento del enrutamiento, no de eficiencia de despliegue.

## Capacidades

- Generacion de texto: unica capacidad confirmada por los metadatos (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Uso conversacional multi-turno: la etiqueta `conversational` sugiere adaptacion a dialogos, aunque no se documenta plantilla de chat ni formato de prompt.
- Razonamiento, matematicas, generacion de codigo: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad de despliegue: el autor indica que los pesos cargan con `transformers` y vLLM estandar.

## Casos de uso

- Estudio de cuantizacion de expertos enrutados: reproducir el checkpoint y comparar la salida frente al modelo base BF16 para medir el impacto de comprimir expertos a 2,254 bits en tareas de generacion, con el mismo presupuesto de memoria que el original.
- Analisis de enrutamiento (routing analysis): instrumentar las capas MoE para registrar que expertos se activan por token y comprobar si la compresion altera la distribucion de activaciones respecto al modelo original.
- Evaluacion comparativa con arneses estandar: ejecutar `lm-evaluation-harness` o similares sobre este checkpoint y sobre el BF16 para cuantificar la degradacion, dado que no existe ninguna tabla de benchmarks publicada.
- Ablaciones de fidelidad numerica: usar este checkpoint como variante de referencia en estudios sobre el efecto de la precision de los pesos en modelos con parametros activos muy inferiores a los totales.
- Prototipado conversacional en entornos con GPU de 80 GB: desplegar con vLLM en una H100 o A100 de 80 GB para pruebas internas de dialogo, asumiendo que no hay garantias de estabilidad ni de calidad al ser un checkpoint de investigacion.
- Base para ajuste fino con LoRA: partir del checkpoint para experimentos de adaptacion a dominios concretos en hardware de gama alta, teniendo en cuenta el coste de 63,2 GB de pesos congelados.
- Pruebas de integracion en pipelines de `transformers`: validar la carga mediante `trust_remote_code` con el codigo personalizado que acompania al repositorio antes de plantear cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el autor no proporciona comparaciones de calidad frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 63,2 GB en BF16, por lo que se necesita un acelerador con al menos 80 GB de memoria (H100 80 GB, A100 80 GB, H200) para una unica GPU, dejando margen para la cache KV.
- Despliegue multi-GPU: con paralelismo tensorial de 2 sobre 2×A100 80 GB o 2×H100 80 GB hay holgura suficiente; con TP=4 sobre 4×RTX 4090 o 4×L40S se cubren los 63,2 GB de pesos con unos 32 GB libres para cache KV, aunque el rendimiento depende del interconectado.
- GPU de consumo: no cabe en una RTX 4090, RTX 5090 ni en ninguna GPU de 24 GB o menos en su formato BF16 actual; no se distribuye ninguna variante GGUF ni de menor precision en este repositorio.
- Opciones de despliegue: segun el autor, `transformers` y vLLM estandar. La etiqueta `custom_code` obliga a `trust_remote_code=True`. La compatibilidad con llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia teorica, el limite superior de decodificacion viene marcado por el ancho de banda de memoria; dado que el modelo esta disenado como MoE con ~3 B de parametros activos pero almacena todos los pesos en BF16, un solo token requiere leer una fraccion de los 63,2 GB, de modo que en una H100 (3,35 TB/s) el rango teorico es amplio y en la practica quedara muy por debajo. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (r17) | 31,58 B / ~3 B (deducido) | no disponible | no disponible (heredada del base) | safetensors BF16 | Expertos enrutados a 2,254 bits; 199 descargas, 0 likes |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58 B / ~3 B (deducido) | no disponible | no disponible en la informacion proporcionada | safetensors BF16 | Modelo base sin comprimir; sirve de referencia de calidad |
| Alternativas MoE de ~30 B / ~3 B activos (por ejemplo, la familia Qwen3-30B-A3B, Apache-2.0, contexto nativo de 32K ampliable a 128K con YaRN) | ~30 B / ~3 B | 32K nativo | Apache-2.0 | safetensors, GGUF | Referencia habitual en esta categoria; los valores concretos deben verificarse en la documentacion oficial, ya que no proceden de la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de este checkpoint con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un checkpoint de investigacion interno, tal y como declara el propio autor; no esta pensado para produccion ni se ofrece ninguna garantia de estabilidad o calidad.
- No se publica ningun benchmark, por lo que se desconoce la degradacion introducida por la compresion de los expertos a 2,254 bits.
- La compresion no reduce el uso de memoria ni el tamano en disco: el repositorio ocupa 63,2 GB porque los pesos se almacenan desquantizados en BF16.
- La licencia no aparece especificada en el repositorio; el autor remite a la del modelo base, cuya identificacion exacta no esta en la informacion disponible. Antes de cualquier uso comercial hay que verificar los terminos de NVIDIA aplicables al modelo original.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide planificar despliegues multilingues o con ventanas largas.
- El repositorio incluye `custom_code`, por lo que la carga requiere `trust_remote_code=True` y ejecutar codigo del autor, con el riesgo de seguridad asociado.
- No hay informacion sobre plantilla de chat ni formato de prompt, algo critico para un uso conversacional.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en este caso al no existir evaluaciones publicadas.
- Sesgos: no documentados en la informacion disponible.
- Adopcion muy baja (199 descargas, 0 likes), sin validacion por parte de la comunidad y con una unica revision publicada (r17).
- El nombre del modelo base sugiere ~3 B de parametros activos, pero la model card no confirma el numero de expertos, el enrutamiento ni la arquitectura exacta; conviene no asumir capacidades derivadas solo del nombre.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/minjaechoi/nemotron3-nano-30b-a3b-2p25bit-r17
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Papers, blogs, repositorios o demos adicionales: no disponibles. Los resultados de busqueda web obtenidos no guardan relacion con el modelo (corresponden a portales de videojuegos) y no aportan documentacion tecnica utilizable.
