# IFM/K2-Horizon-MoVA-36B-A4B-GGUF

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por IFM, con 36.000 millones de parametros totales y aproximadamente 4.000 millones activos por token. Su rasgo diferencial es el mecanismo de atencion Mixture-of-Values (MoVA), una variante de atencion que combina la seleccion dispersa de expertos con una mezcla de valores en el calculo de la atencion. Este repositorio concreto contiene la version cuantizada en formato GGUF, pensada para su uso con `llama.cpp`.

El modelo se presenta como el miembro disperso de la familia K2-Horizon y esta disenado para cargas de trabajo agenticas y de razonamiento, donde el autor declara resultados competitivos frente a modelos densos de tamano similar y MoE de hasta 15 veces su tamano. Incorpora una ventana de contexto nativa de 524.288 tokens (512K) desde las etapas de midtraining, lo que lo situa en el rango de contexto largo para un modelo de su clase y tamano.

La relevancia actual del modelo radica en tres factores: la relacion entre parametros totales y activos (36B/4B), que reduce el coste computacional por token manteniendo capacidad de almacenamiento; una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales; y el compromiso del autor de publicar datos de entrenamiento, receta, codigo y checkpoints intermedios, lo que lo convierte en un candidato interesante para investigacion reproducible sobre dinamicas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion Mixture-of-Values (MoVA) |
| Parametros totales | 37.444.792.020 (37,4B; el autor lo denomina 36B) |
| Parametros activos | Aproximadamente 4B por token |
| Longitud de contexto | 524.288 tokens (512K) nativo desde midtraining |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M (en este repo GGUF) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base |
| Tamano del repositorio | 241,3 GB |
| Libreria | transformers (metadata), ejecucion via llama.cpp |
| Modelo base | IFM/K2-Horizon-MoVA-36B-A4B |
| Datasets de entrenamiento | IFM/K2-Horizon-Pretrain-Data, IFM/K2-Horizon-Midtrain-Data |

## Arquitectura y entrenamiento

La arquitectura es un transformer disperso de tipo MoE con una innovacion central denominada MoVA (Mixture-of-Values attention). El modelo almacena 36B parametros pero solo activa alrededor de 4B por token, lo que reduce el coste de inferencia por paso manteniendo una gran capacidad de parametros. El mecanismo MoVA aplica una logica de mezcla de valores sobre la atencion, segun la nomenclatura del autor; la model card no detalla el numero de expertos, el top-k de enrutamiento ni la distribucion exacta de capas, por lo que esos datos concretos no estan disponibles en la informacion proporcionada.

En cuanto a entrenamiento, el autor referencia dos datasets propios: `IFM/K2-Horizon-Pretrain-Data` y `IFM/K2-Horizon-Midtrain-Data`. La ventana de 512K tokens se introduce de forma nativa a partir de las etapas de midtraining. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron etapas de RLHF, DPO o similares. El autor anuncia la publicacion futura de checkpoints intermedios, datos, receta y codigo de entrenamiento, lo que permitira estudiar la evolucion de capacidades a lo largo del entrenamiento.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con template de chat compatible con llama.cpp incluido en los ficheros GGUF.
- Razonamiento de multiples pasos y tareas agenticas, segun los benchmarks declarados por el autor.
- Contexto largo: ventana nativa de 524.288 tokens, adecuada para documentos extensos, repositorios de codigo o historiales de conversacion prolongados.
- Capacidad multilingue limitada: el modelo esta etiquetado unicamente para ingles (`en`).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de modo "thinking" o razonamiento extendido: no confirmado en la informacion disponible.
- Vision, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.
- Ejecucion eficiente en CPU/GPU mixta mediante llama.cpp gracias al formato GGUF y a los 4B parametros activos.

## Casos de uso

- Analisis de repositorios y bases de codigo extensas: con 512K tokens de contexto, el modelo puede ingerir multiples ficheros y mantener coherencia entre ellos en tareas de revision, refactorizacion o explicacion de arquitectura.
- Procesamiento de documentacion legal o tecnica de gran volumen: contratos, manuales o expedientes completos caben en una sola ventana, evitando estrategias de chunking y perdida de contexto entre fragmentos.
- Agentes autonomos de multiples pasos: el perfil MoE con 4B activos reduce el coste por iteracion, lo que lo hace adecuado para bucles de planificacion y ejecucion donde se realizan muchas llamadas al modelo.
- Asistentes conversacionales de larga duracion: el contexto de 512K permite mantener historiales extensos sin resumen intermedio, util en soporte tecnico o tutoria.
- Despliegue en hardware de gama alta para consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en configuraciones con memoria unificada o multiples GPU consumer, con llama.cpp como runtime.
- Investigacion sobre entrenamiento de MoE: la publicacion anunciada de checkpoints intermedios, datos y receta permite reproducir y estudiar la evolucion de capacidades, algo poco habitual en modelos de este tamano.
- Generacion aumentada por recuperacion (RAG) sobre corpus grandes: la ventana larga reduce la dependencia de un retrieval agresivo y permite inyectar muchos pasajes simultaneamente.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con modelos como Nemotron 3 Ultra, Nemotron 3 Super, G9v3-39A5B, Qwen3.6-35B-A3B, Muse Glimmer-30B y Gemma 4 31B-it, pero los valores numericos de las metricas no estan presentes en la informacion proporcionada (la tabla aparece truncada). Por tanto:

No se han publicado resultados de benchmarks numericos en la informacion disponible.

El autor afirma cualitativamente que el modelo supera a modelos densos de aproximadamente 30B y a MoE de hasta 15 veces su tamano en benchmarks agenticos y de razonamiento, y que compite con modelos frontera cerrados, pero no se dispone de las cifras concretas para verificar estas afirmaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y 37,4B parametros totales):
  - BF16: en torno a 75 GB de pesos.
  - Q8_0: en torno a 40 GB.
  - Q6_K: en torno a 31 GB.
  - Q5_K_M: en torno a 27 GB.
  - Q4_K_M: en torno a 23 GB.
  - Nota: al ser MoE, la VRAM debe alojar todos los parametros (no solo los activos); los 4B activos reducen el coste de computo, no el de memoria.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16; configuraciones multi-GPU (2x A100 40 GB, 2x RTX 4090 24 GB) para cuantizaciones Q5/Q6; RTX 4090 unica viable en Q4_K_M con contexto moderado.
- Cabe en GPU consumer: si, en Q4_K_M o Q5_K_M sobre RTX 4090 24 GB o configuraciones con memoria unificada (Apple Silicon de 32-64 GB), asumiendo contexto reducido por el coste de la cache KV a 512K tokens.
- Opciones de despliegue: llama.cpp (soporte de la arquitectura K2 Horizon integrado en la release b11454 o posterior), Ollama (si empaqueta dicha version), y servidores compatibles con endpoints. vLLM y TGI no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles. El perfil de 4B parametros activos sugiere un throughput por token mas alto que un denso de 36B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B | 36B (37,4B reales) | ~4B | 512K | Apache 2.0 | GGUF, safetensors |
| Qwen3.6-35B-A3B | 35B | ~3B | no disponible | no disponible | no disponible |
| G9v3-39A5B | 39B | ~5B | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B | denso | no disponible | no disponible | no disponible |
| Gemma 4 31B-it | 31B | denso | no disponible | no disponible | no disponible |

Los datos de contexto, licencia y formato de los modelos comparables no estan disponibles en la informacion proporcionada; la comparativa se limita a los parametros totales y activos reflejados en la tabla de la model card. No se dispone de resultados numericos de benchmarks para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni tasas de alucinacion; como todo LLM generativo, requiere verificacion en produccion.
- Sesgos: no se publica informacion sobre evaluaciones de sesgo, toxicidad o alineacion; se desconoce el grado de mitigacion aplicado.
- Contexto largo: aunque la ventana nativa es de 512K tokens, el coste de memoria de la cache KV a esa longitud es muy elevado y puede hacer inviable su uso practico en hardware consumer sin tecnicas adicionales.
- Dependencia de version: los GGUF requieren una version de llama.cpp con soporte de la arquitectura K2 Horizon (integrado en b11454 o posterior); versiones anteriores fallaran al cargar el modelo.
- Tool calling y modo de razonamiento: no confirmados; conviene validar el comportamiento real antes de disenar agentes que dependan de estas capacidades.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias ni asume responsabilidad por el uso.
- Madurez: el ecosistema de tooling (vLLM, TGI, integraciones de terceros) puede no estar completo para esta arquitectura en el momento de la publicacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Release de llama.cpp con soporte K2 Horizon (b11454): https://github.com/ggml-org/llama.cpp/releases?page=5#release-b11454
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
