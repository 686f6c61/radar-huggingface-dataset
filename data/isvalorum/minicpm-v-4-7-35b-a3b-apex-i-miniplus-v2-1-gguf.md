# IsValorum/MiniCPM-V-4.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Esta ficha describe el repositorio `IsValorum/MiniCPM-V-4.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF`, una cuantizacion GGUF del modelo multimodal `openbmb/MiniCPM-V-4.7-35B-A3B`, publicado por el usuario IsValorum bajo el esquema propio "APEX-I MiniPlus V2.1". No se trata de un modelo entrenado desde cero, sino de una redistribucion cuantizada del modelo base de OpenBMB, cuyo pipeline declarado es `image-text-to-text` (vision-lenguaje). El modelo base es, segun la model card citada, el primer modelo multimodal de tipo Mixture-of-Experts (MoE) de la serie MiniCPM, con 34.659.889.792 parametros totales.

El interes de esta publicacion concreta esta en la estrategia de cuantizacion, que no es uniforme: se asigna un tipo de cuantizacion distinto a cada grupo funcional de tensores (routers de expertos y normalizaciones en F32, capas de atencion completa periodicas en Q4_K/Q6_K, expertos enrutados en Q3_K o IQ3_XXS segun su profundidad, y un proyector multimodal independiente en Q8_0). El objetivo declarado es preservar la fidelidad del enrutado de expertos y de los estados recurrentes, que son los puntos mas sensibles al error de cuantizacion en arquitecturas MoE hibridas.

El repositorio ocupa 15,5 GB e incluye el archivo de pesos y un proyector multimodal `mmproj-Q8_0.gguf`. Esta pensado para ejecucion con `llama.cpp` (binario `llama-minicpmv-cli`) en equipos de gama alta de consumo o estaciones de trabajo. A fecha de creacion (12 de octubre de 2026) acumulaba 0 descargas y 2 likes, por lo que se trata de una publicacion reciente y con muy poca validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con atencion completa periodica y estados recurrentes Gated DeltaNet (hibrida atencion/SSM), segun la model card |
| Parametros totales | 34.659.889.792 (34,66 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones segun la nomenclatura "35B-A3B" del nombre; no confirmado explicitamente en la informacion proporcionada |
| Longitud de contexto | no disponible (el ejemplo de CLI usa `-c 4096`, pero es un valor de ejemplo, no el maximo del modelo) |
| Tipos de cuantizacion | Esquema mixto por tensor: F32, Q6_K, Q5_K, Q4_K, Q3_K, IQ3_XXS y Q8_0 (proyector multimodal) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado, compatible con llama.cpp) |

Detalle adicional del esquema de cuantizacion, segun la model card:

| Grupo de tensores | Cuantizacion asignada |
|---|---|
| `output.weight` | Q6_K |
| `token_embd.weight` | Q4_K |
| Normalizaciones y routers de expertos (`ffn_gate_inp`) | F32 |
| Expertos compartidos (`shexp`) | Q5_K |
| Atencion completa periodica (capas 3, 7, 11, ..., 39): Q/K/V | Q4_K |
| Atencion completa periodica: salida | Q6_K |
| Estados recurrentes Gated DeltaNet (`ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_norm`) | F32 |
| Expertos enrutados de borde (capas 0-9 y 30-39) | Q3_K |
| Expertos enrutados centrales (capas 10-29) | IQ3_XXS |
| Proyector multimodal (`mmproj-Q8_0.gguf`) | Q8_0 |

Total de tensores gestionados por el esquema: 733, segun la model card.

## Arquitectura y entrenamiento

La informacion disponible corresponde a una cuantizacion, no al entrenamiento del modelo base, por lo que no se detallan datos de preentrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO o similar): esa informacion no esta disponible en el material proporcionado. Lo que si describe la model card es la estructura de la arquitectura subyacente, que combina tres elementos:

- Un esquema Mixture-of-Experts con expertos enrutados por capa y un router (`ffn_gate_inp`) por capa de expertos, ademas de expertos compartidos (`shexp`) que, segun la model card, forman una ruta activa al 100 por cien.
- Una columna vertebral hibrida: la mayoria de capas usan estados recurrentes tipo Gated DeltaNet (parametros `ssm_a`, `ssm_conv1d`, `ssm_dt`, `ssm_norm`), mientras que un subconjunto de capas emplea atencion completa a modo de "anclas" periodicas (capas 3, 7, 11, ..., 39).
- Un proyector multimodal separado que traduce representaciones visuales al espacio de tokens del modelo de lenguaje, distribuido como archivo GGUF independiente en Q8_0.

El esquema de numeracion de capas citado (capas 0-9, 10-29 y 30-39) sugiere un total de 40 capas, aunque este dato no se declara de forma explicita. La innovacion tecnica destacable de esta publicacion no esta en el modelo, sino en el criterio de cuantizacion: mantener en F32 los routers y los estados recurrentes busca evitar la deriva de enrutado y la acumulacion de error en las recursiones, mientras que la compresion agresiva (Q3_K, IQ3_XXS) se reserva para los expertos enrutados, que solo se activan de forma parcial en cada token.

## Capacidades

- Generacion de texto conversacional (`conversational` en los tags del repositorio).
- Comprension de imagen y texto (`image-text-to-text` como pipeline declarado): descripcion de imagenes, respuesta a preguntas sobre contenido visual y razonamiento sobre escenas.
- Procesamiento de video: el tag `video` aparece en el repositorio, aunque no se detallan capacidades concretas ni limites de duracion o resolucion.
- Multilingue: 10 idiomas declarados (ingles, chino, castellano, frances, aleman, portugues, italiano, ruso, japones y coreano).
- Ejecucion en dispositivo (`on-device`) mediante el runtime de llama.cpp, con soporte de cuantizacion mixta y de proyector multimodal externo.
- Razonamiento visual de alta fidelidad, segun el autor, gracias al proyector `mmproj-Q8_0.gguf` sin degradacion de tokens visuales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion y etiquetado automatico de imagenes en catalogos de producto: el modelo puede recibir una fotografia y devolver una descripcion estructurada en castellano, aprovechando el pipeline `image-text-to-text` y el proyector en Q8_0 para no perder detalle en objetos pequenos.
- Asistencia a personas con discapacidad visual: dado que el modelo es multimodal y puede ejecutarse en local con llama.cpp, es viable montar un asistente de escritorio que describa capturas de pantalla o camara en tiempo real sin enviar datos a un servicio en la nube.
- Analisis de documentacion tecnica escaneada: extraccion de informacion de planos, diagramas o capturas de interfaces, combinando OCR implicito con razonamiento sobre la imagen y salida en texto.
- Moderacion de contenido visual en plataformas propias: clasificacion y descripcion de imagenes subidas por usuarios, con la ventaja de que el modelo puede desplegarse on-premise y no requiere enviar el contenido a terceros.
- Soporte multilingue en atencion al cliente con entrada visual: un usuario envia una captura de un error o de un recibo y el modelo responde en su idioma entre los diez soportados (es, en, de, fr, it, pt, ru, ja, ko, zh).
- Investigacion en eficiencia de inferencia: al ser un MoE con unos 3.000 millones de parametros activos estimados y 34,66 mil millones totales, es un banco de pruebas util para medir el impacto de distintas estrategias de cuantizacion por tensor sobre la calidad de enrutado.
- Procesamiento de video para resumenes o indexacion: el tag `video` permite plantear pipelines de resumen de clips cortos, si bien conviene validar experimentalmente la ventana efectiva antes de llevarlo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card proporcionada no incluye cifras de MMLU, MMMU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones cuantitativas con otros modelos. Tampoco se aportan mediciones de perplejidad o de degradacion respecto al modelo base en FP16/BF16.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del tamano del repositorio (15,5 GB) y del esquema de cuantizacion descrito; no proceden de mediciones publicadas en la informacion proporcionada.

- Peso de los archivos: el repositorio completo ocupa 15,5 GB e incluye el archivo de pesos cuantizado y el proyector `mmproj-Q8_0.gguf`. Los pesos del modelo de lenguaje estarian en el rango aproximado de 13-15 GB, y el proyector anadiria una cantidad no especificada.
- VRAM estimada para inferencia: alrededor de 16-18 GB para descarga completa de pesos, proyector y cache de contexto moderada. Con contexto largo, la cache KV crece de forma adicional; su tamano exacto depende de la configuracion de capas de atencion, que no se detalla.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para descarga completa en GPU; A100 40 GB, L40S o H100 si se necesita contexto amplio o varios usuarios concurrentes. Tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) pueden funcionar con descarga parcial de capas a CPU.
- Cabe en GPU de consumo: si, en modelos de 24 GB sin problema y en modelos de 16 GB con offload parcial. En tarjetas de 8-12 GB requeriria mover una parte sustancial de capas a RAM del sistema, con la consiguiente perdida de velocidad.
- Opciones de despliegue: llama.cpp es la ruta soportada explicitamente (binario `llama-minicpmv-cli`, con `-m` para los pesos y `--mmproj` para el proyector). Servidores derivados de llama.cpp (llama-server, Ollama, LM Studio, koboldcpp) podrian funcionar si soportan el proyector multimodal y la arquitectura del modelo base, pero no hay confirmacion en la informacion disponible. Soporte en vLLM o TGI: no disponible.
- Latencia y throughput estimados: no disponible. No se aportan mediciones de tokens por segundo ni de tiempo a primer token. A modo de referencia cualitativa, el uso de unos 3.000 millones de parametros activos estimados deberia dar velocidades mas propias de un modelo denso de ese orden que de uno de 34,66 mil millones, siempre que el offload a CPU sea minimo.

Ejemplo de invocacion incluido en la model card:

```bash
llama-minicpmv-cli \
  -m MiniCPM-V-4.7-35B-A3B.APEX-I-MiniPlus-V2.1.gguf \
  --mmproj mmproj-Q8_0.gguf \
  --image test.jpg \
  -p "Describe what you see in this image in detail." \
  -c 4096 --temp 0.7
```

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica y no se han verificado contra la informacion proporcionada en esta busqueda; deben confirmarse en las fuentes originales antes de tomar decisiones.

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 35B-A3B (APEX-I MiniPlus V2.1, esta ficha) | 34,66 mil millones totales, ~3 mil millones activos estimados | MoE multimodal hibrida (Gated DeltaNet + atencion completa periodica) | no disponible | apache-2.0 | GGUF para llama.cpp |
| Qwen3-VL-30B-A3B | 30 mil millones totales, 3 mil millones activos | MoE multimodal | 256.000 tokens segun su documentacion | apache-2.0 | safetensors y cuantizaciones comunitarias en GGUF |
| Qwen2.5-VL-32B | 32,8 mil millones | Transformer denso multimodal | 128.000 tokens segun su documentacion | apache-2.0 | safetensors y GGUF |

La diferencia principal de esta publicacion frente a las alternativas es el formato: se distribuye unicamente como GGUF ya cuantizado con un esquema por tensor poco habitual, lo que simplifica el despliegue en llama.cpp pero elimina la posibilidad de re-cuantizar desde los pesos originales dentro del mismo repositorio. No hay datos de rendimiento comparado entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Es una cuantizacion, no el modelo original: la calidad final depende del esquema de compresion. Los expertos enrutados de las capas centrales estan en IQ3_XXS y los de las capas de borde en Q3_K, lo que puede degradar tareas que dependan intensamente de esos expertos.
- No se han publicado evaluaciones que cuantifiquen la perdida de calidad respecto al modelo base en BF16. El autor afirma que el diseno evita la deriva de enrutado, pero no aporta mediciones que lo respalden.
- Riesgo de alucinacion: inherente a los modelos de lenguaje y agravado en tareas de descripcion visual, donde el modelo puede inventar detalles no presentes en la imagen. No hay datos especificos de tasa de alucinacion para este modelo.
- Sesgos conocidos: no disponible. No se documentan sesgos demograficos, culturales o de dominio en la informacion proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto del modelo base no se declara. Aunque se listan diez idiomas, no se especifica el nivel de competencia por idioma ni si el castellano esta al mismo nivel que el ingles o el chino, que suelen ser los idiomas dominantes en los datos de entrenamiento de la serie.
- Soporte de la comunidad practicamente nulo: 0 descargas y 2 likes en la fecha de creacion. No hay informes independientes de funcionamiento, ni confirmacion de que Ollama, LM Studio u otros frontends lo carguen correctamente.
- Compatibilidad de runtime: aunque los tags mencionan llama.cpp, no se indica la version minima necesaria. La arquitectura del modelo base (Gated DeltaNet mas atencion periodica) puede requerir una version reciente o incluso un fork especifico; conviene verificar antes de integrarlo en produccion.
- Licencia: apache-2.0 tanto en el repositorio de cuantizacion como, segun los metadatos, en el modelo base. Esto permite uso comercial, pero la responsabilidad de verificar la licencia efectiva del modelo base recae en quien despliegue el modelo, ya que la informacion aqui recogida proviene de metadatos y no de un analisis legal.
- Mantenimiento: el repositorio depende de un unico autor y de financiacion por donaciones (Ko-fi), sin garantia de actualizaciones ni de soporte.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Perfil del autor de la cuantizacion: https://huggingface.co/IsValorum
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
- Runtime de inferencia referenciado (llama.cpp): https://github.com/ggml-org/llama.cpp
- Paper, blog tecnico o demo del modelo base: no disponible en la informacion proporcionada.
