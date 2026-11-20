# CladeTeam/CENO-600M-1m

## Resumen

CENO-600M-A230M-1m es el checkpoint de contexto largo (1M de tokens) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H, y que no requiere alineamientos multiples de secuencia (MSA) como entrada. Con 630,8 millones de parametros totales y unos 230 millones activos por token (segun la nomenclatura A230M del nombre), el modelo esta pensado para generacion de secuencias genomicas y extraccion de embeddings.

El modelo emplea un tokenizador a nivel de caracter que mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de solo 512 entradas. Esta entrenado en bfloat16 y su etapa de entrenamiento corresponde a la extension de contexto largo (etapa 4) de la familia CENO, alcanzando una longitud de entrenamiento de 1.048.576 tokens. Su relevancia actual radica en la combinacion de una arquitectura de estado espacial (Mamba) con atencion y MoE para modelar secuencias genomicas muy largas, un regimen donde los transformers clasicos resultan costosos.

El checkpoint es cargable de forma autonoma con `trust_remote_code=True`, ya que el codigo del modelo va incluido en el repositorio, y se distribuye bajo licencia Apache-2.0. Forma parte de una familia que incluye checkpoints base (generacion y embeddings) y checkpoints con MSA (prediccion de efectos de variantes, VEP).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H), clase `CENOForCausalLM` |
| Parametros totales | 630.794.080 (630,8M) |
| Parametros activos | Aproximadamente 230M (top-2 de 8 expertos; segun nomenclatura A230M) |
| Longitud de contexto | 1.048.576 tokens de entrenamiento; sin ventana fija por la arquitectura Mamba (`max_position_embeddings` nominal y no restrictivo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo sobre secuencia genomica, tokenizador byte/caracter) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La columna vertebral es un hibrido Mamba / Attention / Mixture-of-Experts de tipo Nemotron-H. El modelo tiene 20 capas ocultas, tamano oculto de 1024, 16 cabezas de atencion y tamano intermedio de 4096. La capa MoE cuenta con 8 expertos con enrutamiento top-2 por token. El tokenizador es a nivel de caracter (`CENOCharLevelTokenizer`), con vocabulario de 512 y mapeo de bases de ADN a codigos ASCII de byte; deriva del `CharLevelTokenizer` de Evo2 (Arc Institute). El codigo del modelo esta basado en la implementacion de Nemotron-H de NVIDIA en Hugging Face.

Este checkpoint corresponde a la etapa 4 (extension de contexto largo) de la familia CENO, entrenado a una longitud de secuencia de 1.048.576 tokens. La arquitectura Mamba no impone una ventana de contexto fija, por lo que la longitud de entrenamiento no constituye un limite duro. No se proporcionan en la informacion disponible datos sobre el numero total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La implementacion de inferencia en Hugging Face es de una sola GPU, sin padding, y permite como maximo 131.072 tokens por prefill; para prefills mayores se debe usar la entrada vLLM del repositorio.

## Capacidades

- Generacion de secuencias genomicas de ADN mediante modelado de lenguaje causal.
- Extraccion de embeddings de secuencia genomica para tareas posteriores (probing, adaptacion).
- Modelado de contexto largo: entrenado a 1M de tokens, sin ventana fija por la arquitectura Mamba.
- Adaptacion downstream mediante fine-tuning para tareas de genomica.
- Tokenizacion a nivel de caracter/byte sobre alfabeto de ADN.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de secuencias genomicas sinteticas: el modelo puede generar tramos de ADN condicionados por contexto gracias a su modelado causal y a su ventana de entrenamiento de 1M de tokens, util para aumento de datos en pipelines de genomica.
- Extraccion de embeddings para clasificacion downstream: se pueden obtener representaciones de secuencias largas y entrenar cabezas de clasificacion (por ejemplo, deteccion de regiones regulatorias) sin reentrenar el modelo completo.
- Adaptacion por fine-tuning a tareas especificas: al ser un checkpoint base, sirve como punto de partida para ajuste supervisado en tareas genomicas concretas.
- Modelado de regiones genomicas extensas: la ausencia de ventana fija permite procesar contextos que superan los limites tipicos de transformers, util para analisis de loci largos.
- Prediccion de efectos de variantes (VEP): aunque la familia dedica checkpoints con MSA (`CENO-P-*`) a esta tarea mediante delta de log-verosimilitud, el checkpoint base puede servir para puntuar secuencias en flujos experimentales.
- Investigacion en modelos de lenguaje de ADN: permite estudiar el comportamiento de arquitecturas hibridas Mamba/Attention/MoE sobre secuencias biologicas y comparar con alternativas transformer.
- Preentrenamiento continuado y experimentacion: su licencia Apache-2.0 y su tamano moderado facilitan su uso como banco de pruebas en laboratorios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia requiere GPU con CUDA: las capas Mamba necesitan kernels CUDA, por lo que las pasadas forward y la generacion no funcionan en CPU. La carga de configuracion, tokenizador y pesos si es segura en CPU.
- VRAM estimada: con 630,8M parametros en bfloat16, los pesos ocupan aproximadamente 1,3 GB; el consumo real de VRAM sera mayor por estados de Mamba, cache y activaciones, y no se especifica en la informacion disponible.
- GPU recomendadas: no se detallan modelos concretos; se requiere una GPU CUDA compatible con mamba-ssm, causal-conv1d y FlashAttention.
- Encaje en GPU de consumo: no confirmado en la informacion disponible; el tamano de pesos es compatible con GPUs de consumo modernas, pero la dependencia de kernels CUDA y el prefill de hasta 131.072 tokens en la ruta HF condicionan el uso.
- Despliegue: transformers con `trust_remote_code=True`; para prefills superiores a 131.072 tokens se debe usar la entrada vLLM del repositorio. No se mencionan llama.cpp, Ollama ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM requieren entornos separados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-600M-A230M-1m | 630,8M (aprox. 230M activos) | 1.048.576 tokens de entrenamiento, sin ventana fija | Mamba/Attention/MoE (Nemotron-H) | Apache-2.0 | Hugging Face, `trust_remote_code` |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | Apache-2.0 (tokenizador derivado) | no disponible en la informacion |
| Modelos transformer de ADN de tamano similar | no disponible | no disponible | transformer | variable | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Requiere GPU CUDA para inferencia: no es posible ejecutar pasadas forward ni generacion en CPU por la dependencia de kernels Mamba.
- La ruta de precision de Hugging Face es de una sola GPU, sin padding, y admite como maximo 131.072 tokens por prefill; contextos mayores requieren vLLM.
- La correccion numerica no garantiza generaciones libres de repeticiones ni biologicamente funcionales, segun advierte el propio autor.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones idiomaticas; el modelo opera sobre secuencia genomica, no sobre lenguaje natural.
- El tokenizador es a nivel de caracter/byte con vocabulario de 512; no es un modelo de proposito general de texto.
- Aunque la licencia es Apache-2.0, el codigo incluido deriva de Nemotron-H (NVIDIA) y el tokenizador de Evo2 (Arc Institute); deben respetarse los ficheros `LICENSE` y `NOTICE` del repositorio.
- No se especifican tipos de cuantizacion soportados, lo que limita la planificacion de despliegues con pesos reducidos.
- El checkpoint corresponde a una etapa de extension de contexto; su uso para VEP se asocia a la variante con MSA (`CENO-P-*`), no a este checkpoint base.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-600M-1m
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
