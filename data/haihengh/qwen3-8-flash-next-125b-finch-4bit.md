# haihengh/Qwen3.8-Flash-Next-125B-finch-4bit

## Resumen

Este repositorio no es un modelo nuevo, sino un reempaquetado no oficial de `Qwen/Qwen3.8-Flash-Next` en el formato `.finch`, un layout de streaming diseñado para el motor FinchMoE (Swift/Metal) sobre Apple Silicon. Lo publica el usuario `haihengh`, autor también del motor, y su objetivo es permitir ejecutar un modelo MoE de gran tamano en una maquina con 16 GB de memoria unificada: los expertos enrutados no se cargan en RAM, sino que se leen bajo demanda desde SSD con `pread`, manteniendo un conjunto de trabajo reducido en memoria.

La pieza clave es que el pool de expertos, la parte mas voluminosa del modelo, se guarda como un fichero por capa (48 ficheros, 63 GB en total), con 512 expertos por capa a un stride fijo de 2.768.896 bytes, de modo que el motor puede localizar un experto sin indice. El total del repositorio es de 162 GB, incluyendo 95 GB de shards de embeddings n-gram (PLE) y 3,6 GB de pesos no-expertos.

Es relevante porque explora una via distinta a la cuantizacion clasica: en lugar de comprimir para que el modelo quepa, se acepta que el modelo no quepa y se convierte el almacenamiento en el cuello de botella. El coste es una velocidad de decodificacion de 2,76-2,91 tok/s y la imposibilidad de cargar el checkpoint con `transformers`, vLLM, SGLang, llama.cpp, MLX u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) con atencion lineal Gated DeltaNet (GDN); 48 capas, 512 expertos por capa, top-k 10 |
| Parametros totales | no disponible en la model card; el nombre del repositorio indica 125B |
| Parametros activos | no disponible (se activan 10 de 512 expertos por capa) |
| Longitud de contexto | no disponible; los ejemplos de la model card usan `--max-context 2048` |
| Tipos de cuantizacion | Affine 4-bit, group size 64, escala y sesgo por grupo en BF16 (expertos enrutados, expertos compartidos, atencion y embeddings); 8-bit para atencion lineal GDN y router |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | `.finch` (streaming, layout propio del motor FinchMoE); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen/Qwen3.8-Flash-Next`, del que este repositorio es una cuantizacion, no un reentrenamiento. La model card del repack describe la topologia heredada: 48 capas, 512 expertos enrutados por capa con seleccion top-k de 10 expertos por token, atencion convencional combinada con atencion lineal Gated DeltaNet y un router de compuertas. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ya que esos datos corresponderian a la model card del modelo original.

La innovacion tecnica de este repositorio es el formato de almacenamiento, no la arquitectura. Cada experto ocupa exactamente el mismo tamano (stride fijo de 2.768.896 bytes), lo que permite calcular su offset como `experto * stride` sin consultar un indice; el precio es que el fichero se rellena (padding) hasta el experto mas grande de la capa. La cuantizacion es affine de grupo 64 con escala y sesgo en BF16: 4 bits para expertos enrutados, expertos compartidos, atencion y embeddings, y 8 bits para las dos rutas cuya precision el autor considero que no se podia reducir, el router y el camino de estado de la atencion lineal GDN. Ademas del pool de expertos, hay 95 GB de shards de embeddings n-gram (PLE) que se leen por su propia ruta en cada paso de decodificacion.

## Capacidades

- Generacion de texto en modo causal, con `pipeline_tag: text-generation` y plantilla de chat incluida en `tokenizer/`.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.8-Flash-Next, no verificadas ni documentadas en este repositorio.
- Ejecucion en modo MoE con enrutado disperso: 10 expertos activos por token de 512 disponibles por capa.
- Streaming de expertos desde disco con cache configurable (`--expert-cache-slots`, 16 slots por capa en el ejemplo publicado).
- Verificacion de integridad del checkpoint mediante SHA-256 por fichero (`--verify full-sha256` y `--verify trusted-install`).
- Contadores de diagnostico del motor (`--counters`) para inspeccionar lecturas, tamano y espaciado de las peticiones al almacenamiento.
- Tool calling, function calling, capacidades de agente, vision, audio o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Ejecucion de un MoE de gran tamano en hardware de memoria limitada: el caso de uso central del repositorio. Un Mac mini de 16 GB de memoria unificada puede generar texto con un modelo cuyo pool de expertos ocupa 63 GB, porque el motor mantiene como maximo 16 expertos por capa en memoria y transmite el resto desde SSD.
- Experimentacion e investigacion sobre inferencia storage-bound: el repositorio sirve para estudiar como afectan a la latencia el numero de lecturas en vuelo, su tamano y su espaciado, con `--counters` como instrumento de medida.
- Validacion de estrategias de cuantizacion mixta: el pack usa 4 bits en la mayoria de componentes y 8 bits en router y GDN, lo que permite comparar empiricamente el impacto de no bajar de 8 bits en esas dos rutas.
- Pruebas de integridad y reproducibilidad de checkpoints: `verified-install.json` guarda SHA-256 y tamano de cada artefacto, util para pipelines que necesitan verificar que un payload de 162 GB no se ha corrompido.
- Despliegue en entornos air-gapped o sin GPU dedicada: al no requerir CUDA ni VRAM, el modelo puede ejecutarse en un portatil o mini-PC Apple Silicon con los pesos en un SSD externo.
- Evaluacion cualitativa de respuestas del modelo base sin infraestructura de centro de datos: con prompts cortos y `--max-context 2048`, sirve para inspeccionar el comportamiento del modelo en tareas de explicacion breve.
- Benchmarking de almacenamiento para cargas de IA: al ser un caso extremo de lectura aleatoria por bloques, es un banco de pruebas util para medir el rendimiento real de SSD externos sobre USB4 o Thunderbolt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos numeros publicados son de rendimiento de inferencia, medidos en un Mac mini con 16 GB de memoria unificada, pesos en un Samsung 990 EVO de 2 TB conectado por USB4, decodificacion greedy y `--max-context 2048`:

| Metrica | Valor medido |
|---|---|
| Decodificacion (decode) | 2,76-2,91 tok/s |
| Prefill | 5,9-6,0 tok/s |
| Memoria comprimida maxima | ~3,1 GB |

El propio autor advierte que estas cifras describen la forma storage-bound del sistema mas que una especificacion estable: varian con la unidad de almacenamiento. En la misma maquina, el motor lee el pool de expertos de otra instalacion a aproximadamente el doble de velocidad.

## Requisitos de hardware

- VRAM: no aplica. El motor no usa GPU discreta ni CUDA; se ejecuta sobre Metal en Apple Silicon y el modelo nunca necesita caber en memoria.
- Memoria unificada: 16 GB es suficiente segun la medicion publicada, con un pico de memoria comprimida de ~3,1 GB.
- Almacenamiento: 162 GB de espacio, idealmente en SSD rapido (se midio con un Samsung 990 EVO 2 TB por USB4). El autor desaconseja discos mecanicos y montajes de red.
- GPU recomendadas: no disponible; el motor esta orientado a Apple Silicon y no se documenta soporte para A100, H100, RTX 4090 ni otras GPU.
- Cabe en GPU de consumo: no, el formato no es cargable por runtimes de GPU.
- Opciones de despliegue: unicamente FinchMoE CLI. No es cargable por `transformers`, vLLM, SGLang, llama.cpp, MLX ni Ollama.
- Latencia y throughput: 2,76-2,91 tok/s en decodificacion y 5,9-6,0 tok/s en prefill en la configuracion medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| haihengh/Qwen3.8-Flash-Next-125B-finch-4bit | no disponible (nombre: 125B) | no disponible (ejemplos a 2048) | `.finch` propietario | qwen-community-1.0 | Solo motor FinchMoE, Apple Silicon |
| Qwen/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | no disponible | no disponible | Repositorio upstream en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre cuantizaciones alternativas del mismo modelo base (por ejemplo en GGUF o MLX) ni sobre otros repacks MoE de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa de rendimiento, contexto o calidad.

## Limitaciones y advertencias

- Es un repack no oficial: no esta afiliado, respaldado ni soportado por Qwen ni por Alibaba. Todo el merito del modelo corresponde al repositorio upstream.
- No es cargable por `transformers`, vLLM, SGLang, llama.cpp, MLX ni Ollama. Solo funciona con FinchMoE.
- Requiere 162 GB de descarga y de espacio en disco; el autor advierte explicitamente de que se lea la seccion de uso antes de descargar.
- Rendimiento muy bajo para uso interactivo: 2,76-2,91 tok/s de decodificacion. El prefill a 5,9-6,0 tok/s penaliza prompts largos.
- El rendimiento depende criticamente del almacenamiento; en discos mecanicos o montajes de red puede degradarse de forma severa.
- Al ser una cuantizacion de 4 bits, cabe esperar perdida de calidad frente al modelo base en precision completa, aunque no se publican mediciones que la cuantifiquen.
- No se documentan idiomas soportados, sesgos conocidos, comportamiento de alucinacion ni evaluaciones de seguridad.
- Licencia qwen-community-1.0 etiquetada como `license: other`: no es una licencia permisiva tipo Apache 2.0. Hay que revisar los terminos del fichero `LICENSE` del upstream antes de cualquier uso comercial.
- No hay requisito de aceptar licencia antes de la descarga porque el repositorio upstream no esta restringido, lo que no exime de cumplir los terminos de la licencia.
- El campo `modelID` de `manifest.json` vale `local/Qwen3.8-Flash-Next-125B` y es cosmetico: editarlo invalida el recibo de verificacion, porque `verified-install.json` contiene su SHA-256.
- Los ficheros de expertos estan rellenados hasta el experto mas grande de cada capa, lo que desperdicia espacio en disco.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa independiente del autor.
- La busqueda web realizada no devolvio documentacion tecnica ni articulos relevantes sobre este modelo; los resultados obtenidos no guardan relacion con la ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit
- Motor FinchMoE: https://github.com/haihengh/finchMoE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
