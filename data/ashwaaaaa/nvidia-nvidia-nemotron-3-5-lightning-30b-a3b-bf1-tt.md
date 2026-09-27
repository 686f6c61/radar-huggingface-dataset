# ashwaaaaa/nvidia-nvidia-nemotron-3-5-lightning-30b-a3b-bf1-tt

## Resumen

Este repositorio contiene un port a hardware Tenstorrent de un modelo de la familia NVIDIA Nemotron, identificado en el nombre como "Nemotron 3.5 Lightning 30B-A3B". El identificador sugiere una arquitectura de mezcla de expertos (MoE) con 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, la convención habitual en modelos como Qwen3-30B-A3B o Mixtral. El sufijo "bf1-tt" apunta a un formato de pesos propietario de Tenstorrent (tt-metal/ttnn) y el repositorio esta etiquetado para la arquitectura Blackhole de dicha compania.

El modelo ha sido subido por el usuario "ashwaaaaa", no por NVIDIA ni por Tenstorrent, por lo que se trata de una conversion de la comunidad y no de un artefacto oficial. El pipeline declarado es "text-generation" y la libreria indicada es tt-metal. No se especifican licencia, idiomas soportados, contexto ni resultados de evaluacion en la informacion disponible.

Su relevancia radica en que permite ejecutar un modelo MoE de 30B en aceleradores Tenstorrent (no CUDA), lo que resulta interesante para equipos que quieren evitar la dependencia de NVIDIA. Sin embargo, al tener 0 descargas y 0 "likes", no existe validacion publica de calidad, fidelidad de pesos ni rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida de la nomenclatura "30B-A3B"; no confirmada en la ficha del repositorio |
| Parametros totales | 30.000 millones (segun el identificador; no verificado en la ficha) |
| Parametros activos | Aproximadamente 3.000 millones por token (segun el identificador "A3B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sufijo "bf1" en el nombre del repositorio; esquema exacto no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | tt-metal / ttnn (formato de Tenstorrent); tag "blackhole" |
| Hardware objetivo | Aceleradores Tenstorrent Blackhole (tags "tt-metal", "tenstorrent", "ttnn", "blackhole") |
| Descargas y "likes" | 0 descargas, 0 "likes" en el momento de la consulta |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

No se dispone de informacion en el repositorio sobre la arquitectura interna mas alla de lo que sugiere el nombre del modelo. La nomenclatura "30B-A3B" sigue el patron habitual de los transformers con mezcla de expertos (MoE) de tipo sparse, en los que solo una fraccion de los parametros se activa en cada paso de inferencia. Con 30B totales y 3B activos, el ratio de activacion seria de aproximadamente el 10 %, lo que reduciria el coste computacional por token en comparacion con un modelo denso de 30B, aunque mantendria el requisito de memoria del conjunto completo de pesos.

El termino "Lightning" en la denominacion podria referirse a una variante optimizada para latencia o velocidad de decodificacion dentro de la familia Nemotron, pero no hay documentacion en la ficha que lo confirme. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento. El port a Tenstorrent se limita a la conversion y empaquetado de pesos para tt-metal/ttnn, y no implica reentrenamiento.

Dado que "bf1" no corresponde a una cuantizacion estandar conocida (las habituales en Tenstorrent incluyen bfloat8_b, bfloat4_b y variantes de block float), el esquema concreto de precision deberia verificarse consultando los scripts de conversion del propio repositorio antes de usarlo en produccion.

## Capacidades

- Generacion de texto: es la unica capacidad declarada explicitamente en la ficha (pipeline "text-generation").
- Razonamiento y matematicas: no confirmado en la informacion disponible.
- Generacion de codigo: no confirmada en la informacion disponible.
- Vision o multimodalidad: no confirmada en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se listan idiomas.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Inferencia de texto en aceleradores Tenstorrent: el repositorio esta especificamente orientado a ejecutar generacion de texto sobre hardware Blackhole mediante tt-metal, lo que permite desplegar un modelo de 30B fuera del ecosistema CUDA.
- Servicio de chat o completado a bajo coste por token: al tratarse de un MoE con 3B parametros activos, el coste de computo por token es sensiblemente inferior al de un modelo denso de 30B, adecuado para cargas de alto volumen si el port es fiel.
- Evaluacion comparativa de hardware: util para equipos que quieran medir throughput y latencia de un MoE de 30B en Tenstorrent frente a alternativas en GPU NVIDIA o AMD.
- Base para pipelines de generacion de texto en entornos con restricciones de proveedor: al no depender de CUDA, encaja en organizaciones que buscan diversificar su infraestructura de IA.
- Validacion y depuracion de conversiones tt-metal/ttnn: el repositorio sirve como caso de prueba para verificar la fidelidad de pesos entre el checkpoint original de NVIDIA y el resultado en formato Tenstorrent.
- Prototipado interno de asistentes conversacionales: si el modelo base conserva las capacidades tipicas de la familia Nemotron, podria emplearse para resumen, redaccion y respuesta a preguntas, siempre que se valide primero su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Acelerador objetivo: Tenstorrent Blackhole, segun el tag "blackhole" del repositorio.
- Software: tt-metal y ttnn, segun los tags; no es un checkpoint compatible directamente con CUDA, ROCm ni con cargadores estandar como transformers, vLLM o llama.cpp.
- VRAM estimada por el conjunto de pesos (calculos genericos, no especificos de este port): en bf16/fp16, 30B parametros suponen aproximadamente 60 GB; en int8, unos 30 GB; en 4 bits, entre 15 y 18 GB, mas el overhead de cache KV.
- GPU de consumo: ninguna GPU de consumo de una sola unidad puede alojar 30B en bf16; en cuantizacion de 4 bits podria caber en tarjetas con 24 GB o mas (por ejemplo RTX 4090 o 5090), pero esta ruta esta bloqueada de facto porque el formato de pesos es Tenstorrent, no GGUF ni safetensors.
- Opciones de despliegue conocidas para este repositorio: tt-metal/ttnn sobre Blackhole. Otras opciones (vLLM, TGI, Ollama, llama.cpp) no son aplicables al formato publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este port (Nemotron 3.5 Lightning 30B-A3B, tt-metal) | 30B (segun identificador) | 3B (segun identificador) | no disponible | no disponible | Solo formato Tenstorrent |
| Qwen3-30B-A3B | 30,5B | 3,3B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF, multiples runtimes |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF, multiples runtimes |

La comparacion en rendimiento no es posible porque este repositorio no publica resultados. En cuanto a licencia y portabilidad, Qwen3-30B-A3B y Mixtral 8x7B ofrecen condiciones claras y soporte amplio de runtimes, mientras que este port no documenta ni licencia ni idiomas, y queda restringido al ecosistema Tenstorrent.

## Limitaciones y advertencias

- Repositorio sin validacion publica: 0 descargas y 0 "likes", lo que impide confirmar que los pesos se hayan convertido correctamente.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribucion. El modelo base es de NVIDIA y probablemente arrastra sus propios terminos, que habria que verificar en el repositorio oficial.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue.
- Contexto desconocido: sin dato de longitud de contexto, no es posible planificar aplicaciones que requieran ventanas largas.
- Riesgo de bloqueo tecnologico: el formato tt-metal/ttnn limita el uso a aceleradores Tenstorrent Blackhole, lo que complica la migracion a otras plataformas.
- Esquema de cuantizacion poco claro: el sufijo "bf1" no corresponde a un formato estandar documentado, por lo que la precision efectiva de los pesos deberia comprobarse empiricamente.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; no se ha publicado ninguna evaluacion de fidelidad para esta conversion.
- Fecha de publicacion poco habitual (2026): conviene verificar la autenticidad del artefacto antes de integrarlo en cualquier flujo de trabajo.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica que permita comparar con alternativas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ashwaaaaa/nvidia-nvidia-nemotron-3-5-lightning-30b-a3b-bf1-tt
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
