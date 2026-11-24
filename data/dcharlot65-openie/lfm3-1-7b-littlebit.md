# dcharlot65-openie/LFM3-1.7B-LittleBit

## Resumen

LFM3-1.7B-LittleBit es un checkpoint de pesos "vivos" (living weights) derivado de LiquidAI/LFM3-1.7B, publicado por el usuario dcharlot65-openie. No se trata de un modelo nuevo entrenado desde cero, sino de una refactorizacion extrema del modelo base de Liquid AI en un formato propietario denominado `.jsyn`, orientado al runtime JouleDB (una base de datos termodinamica y sustrato de agentes nativo de Kubernetes que opera sin PyTorch). La propuesta tecnica central es la compresion sub-1-bit: segun la model card, el checkpoint ocupa 11,21 MB frente a los 3.297,43 MB equivalentes en FP16, lo que supone una reduccion de 294,12x y una media de 0,0230 bits por peso.

El modelo conserva los 1.728.801.536 parametros del LFM3-1.7B original pero los almacena como 154 tensores de mapas de bits bidimensionales (2D bitplane) mas 132 vectores unidimensionales de LayerNorm, bias y depthwise. La combinacion citada es "LittleBit-2 ⊕ Sakana SVF", es decir, una factorizacion previa que fusiona una tecnica de cuantizacion sub-1-bit con una descomposicion de vectores singulares de Sakana.

Su relevancia actual es acotada pero significativa para un nicho concreto: demuestra un flujo de despliegue de LLM en entornos Kubernetes-native con requisitos de almacenamiento y memoria minimos, a costa de depender de un ecosistema de herramientas muy especifico (JouleDB v0.2.4+, Rust, formato `.jsyn`) y de la licencia LFM Open License v1.0, que restringe el uso comercial a entidades por debajo de 10 millones de dolares de facturacion anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de LiquidAI/LFM3-1.7B, almacenado como pesos pre-factorizados en formato `.jsyn` (LittleBit-2 ⊕ Sakana SVF) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit pre-factorizado (0,0230 BPW medio); 154 tensores 2D bitplane y 132 vectores 1D; compresion zstd + CRC32 en el contenedor `.jsyn` |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial permitido a entidades con ingresos anuales inferiores a 10 M USD |
| Formato de pesos | `.jsyn` (JouleDB), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint no documenta un proceso de entrenamiento propio: es una adaptacion post-hoc del modelo LiquidAI/LFM3-1.7B, cuyo `model_id` interno en JouleDB es `lfm3-1.7b`. La transformacion aplicada consiste en una pre-factorizacion que combina LittleBit-2 (una representacion sub-1-bit por mapas de bits) con la descomposicion de vectores singulares (SVF) de Sakana, dando lugar a dos clases de tensores: 154 tensores bidimensionales almacenados como bitplanes y 132 vectores unidimensionales que preservan LayerNorm, bias y pesos depthwise en mayor precision. El resultado se serializa en un contenedor `.jsyn` con compresion zstd y verificacion CRC32.

La innovacion tecnica declarada es doble. Por un lado, la compresion extrema (0,0230 BPW, 294,12x frente a FP16) permite almacenar el modelo en 11,21 MB. Por otro, el runtime JouleDB se presenta como una base de datos termodinamica y un sustrato de agentes nativo de Kubernetes que ejecuta inferencia sin PyTorch, escrito en Rust y distribuido mediante `cargo binstall`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base incorporo RLHF o DPO; tampoco se documenta la metodologia exacta de calibracion de los bitplanes ni las metricas de degradacion respecto al LFM3-1.7B original.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base LiquidAI/LFM3-1.7B, sujetos a la degradacion introducida por la factorizacion sub-1-bit, que no se cuantifica en la model card.
- Ejecucion de inferencia sin PyTorch mediante el runtime JouleDB, con despliegue nativo en Kubernetes (JouleKube).
- Almacenamiento y distribucion del modelo como registro en una base de datos termodinamica (`db.hf_pull`), lo que permite versionado y carga desde un servidor HTTP local.
- Soporte de tool calling, function calling, agentes multi-paso, vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.

## Casos de uso

- Despliegue de LLM en clusters Kubernetes con restricciones severas de almacenamiento: el checkpoint de 11,21 MB puede distribuirse como artefacto de contenedor o registro interno y cargarse con `jouledb serve`, evitando descargar los 3,3 GB del modelo en FP16 en cada nodo.
- Entornos de borde (edge) y dispositivos con almacenamiento minimo: la representacion sub-1-bit reduce el espacio en disco en dos ordenes de magnitud, lo que facilita su inclusion en imagenes de sistema o dispositivos embebidos donde el presupuesto de almacenamiento es critico.
- Sustrato de agentes nativo de Kubernetes: JouleKube esta disenado como infraestructura para agentes; este checkpoint puede servir como modelo de referencia para validar pipelines de agentes con un consumo de disco minimo.
- Pruebas de integracion y CI/CD: al ocupar 11,21 MB, el modelo puede versionarse junto al codigo y utilizarse en tests automatizados del runtime JouleDB sin necesidad de almacenamiento de modelos de gran tamano.
- Investigacion sobre cuantizacion sub-1-bit: sirve como artefacto reproducible para estudiar la combinacion LittleBit-2 ⊕ Sakana SVF y medir la degradacion de calidad frente al LFM3-1.7B original.
- Prototipado de inferencia sin PyTorch: equipos que quieran evaluar el runtime Rust de JouleDB pueden hacerlo con este checkpoint como punto de entrada, sin instalar el stack de PyTorch.
- Archivado y distribucion de modelos en bases de datos termodinamicas: el formato `.jsyn` con zstd + CRC32 permite almacenar y verificar la integridad del modelo dentro de JouleDB, util para auditoria de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card solo documenta el tamano comprimido en disco (11,21 MB) y el equivalente FP16 (3.297,43 MB); no se especifica la memoria necesaria en tiempo de ejecucion tras la descompresion de los bitplanes.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente JouleDB v0.2.4 o superior, instalado via `cargo binstall jouledb` y ejecutado con `jouledb serve --http-addr 127.0.0.1:8080`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-LittleBit | 1.728.801.536 | no disponible | `.jsyn` (JouleDB) | LFM Open License v1.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM3-1.7B | 1.7 B (aproximado) | no disponible | safetensors | LFM Open License v1.0 | Hugging Face (modelo base) |
| Alternativas de 1-2 B en formato GGUF (p. ej. familias Llama, Qwen) | ~1-2 B | variable | GGUF | variable | amplia |

La comparativa directa con modelos de la misma categoria no esta disponible en la informacion proporcionada: no se documentan metricas de calidad del checkpoint comprimido frente al LFM3-1.7B original, ni su contexto, ni su rendimiento en tareas estandar.

## Limitaciones y advertencias

- La factorizacion sub-1-bit (0,0230 BPW) implica una perdida de precision muy agresiva; la model card no publica ninguna evaluacion de la degradacion de calidad respecto al LFM3-1.7B original, por lo que no puede asumirse un comportamiento equivalente al modelo base.
- Dependencia total del ecosistema JouleDB: el checkpoint solo es utilizable con el runtime `jouledb` (Rust, v0.2.4+). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni transformers.
- Licencia LFM Open License v1.0: el uso comercial esta restringido a entidades con ingresos anuales inferiores a 10 M USD; por encima de ese umbral es necesario contactar con Liquid AI. Cualquier uso comercial debe respetar tambien las condiciones del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-24); no existe validacion externa de su funcionamiento ni de la integridad de los pesos.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide planificar su uso en produccion multilingue o con ventanas largas.
- No se documentan sesgos conocidos, riesgo de alucinacion ni comportamiento en dominios sensibles; al derivar de un modelo base no auditado en esta ficha, deben aplicarse las mismas cautelas que con cualquier LLM.
- El tamano del repositorio declarado es 0,0 GB, lo que resulta incoherente con el tamano comprimido de 11,21 MB indicado en la model card; conviene verificar los archivos reales antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/LFM3-1.7B-LittleBit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-license
