# CladeTeam/CENO-300M-base

## Resumen

CENO-300M-base (denominado internamente CENO-300M-A105M-base) es el checkpoint de preentrenamiento base del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H de NVIDIA. No requiere alineamiento multiple de secuencias (MSA) como entrada, lo que simplifica su uso frente a modelos genomicos tradicionales.

El modelo cuenta con 307.503.488 parametros totales en precision bfloat16, 9 capas ocultas, tamano oculto de 1024, 8 cabezas de atencion y 8 expertos MoE con top-2 por token. Utiliza un tokenizador a nivel de caracter que mapea las bases de ADN a sus codigos ASCII de byte, con un vocabulario de 512 entradas. Esta pensado para generacion de secuencia genomica y extraccion de embeddings, asi como para adaptacion posterior (fine-tuning, probing) en tareas de genomica.

Su relevancia actual radica en que ofrece una alternativa compacta (300M) y de licencia permisiva (Apache-2.0) dentro de la familia CENO, que incluye tambien checkpoints con MSA (CENO-P-*) orientados a prediccion de efectos de variantes (VEP). El checkpoint es cargable de forma autonoma con `trust_remote_code=True`, ya que el codigo del modelo va incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 307.503.488 |
| Parametros activos | 8 expertos MoE, top-2 por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 131072 tokens por prefill en la ruta HF (limite documentado); contexto maximo de entrenamiento no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo sobre alfabeto de ADN, no lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La columna vertebral es una arquitectura hibrida que combina capas Mamba (modelo de espacio de estados), atencion y capas Mixture-of-Experts, siguiendo el diseno Nemotron-H. El modelo tiene 9 capas ocultas, tamano oculto de 1024, 8 cabezas de atencion y un tamano intermedio de 4096, con 8 expertos MoE y enrutamiento top-2 por token. La clase de modelo es `CENOForCausalLM` (`modeling_ceno.CENOForCausalLM`) y el tokenizador es `CENOCharLevelTokenizer`, un tokenizador a nivel de caracter con vocabulario de 512 que mapea las bases de ADN a sus codigos ASCII de byte. El tokenizador deriva del `CharLevelTokenizer` de Evo2 (Arc Institute) y el codigo del modelo deriva de la implementacion de Nemotron-H en Hugging Face de NVIDIA, ambos bajo Apache-2.0.

Este checkpoint corresponde a la etapa 2 de preentrenamiento base. No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Las capas Mamba requieren kernels CUDA, por lo que las pasadas forward y la generacion necesitan GPU; la carga de configuracion, tokenizador y pesos es segura en CPU.

## Capacidades

- Generacion de secuencia genomica de forma causal sobre el alfabeto de ADN.
- Extraccion de embeddings de secuencia genomica.
- Adaptacion posterior mediante fine-tuning y probing para tareas de genomica.
- Base para la familia CENO; los checkpoints con MSA (CENO-P-*) se orientan a prediccion de efectos de variantes (VEP) mediante delta de log-verosimilitud entre secuencia wild-type y variante.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (modelo sobre secuencia de ADN, no lenguaje natural).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Extraccion de embeddings genomicos para modelos downstream: se usa el checkpoint base para obtener representaciones de secuencias de ADN que alimenten clasificadores o modelos de regresion en tareas como prediccion de elementos regulatorios, aprovechando la ventana de hasta 131072 tokens por prefill en la ruta HF.
- Fine-tuning para tareas genomicas especificas: al ser un checkpoint base Apache-2.0, permite adaptar los pesos a tareas concretas (anotacion de regiones, clasificacion de variantes) sin restricciones de licencia comercial.
- Generacion de secuencia genomica sintetica: el modelo puede generar secuencias de ADN de forma causal, util para aumentar datasets o explorar distribuciones de secuencia en investigacion.
- Prediccion de efectos de variantes (VEP) mediante adaptacion: aunque la VEP se asocia a los checkpoints CENO-P-*, el checkpoint base puede servir de punto de partida para adaptar la puntuacion por delta de log-verosimilitud entre secuencias wild-type y variante.
- Investigacion en modelos de lenguaje de ADN: sirve como referencia compacta (300M) para estudiar el comportamiento de arquitecturas hibridas Mamba/MoE sobre alfabetos genomicos, con un coste de computo moderado.
- Prototipado en entornos con GPU unica: dado su tamano y la ruta HF de una sola GPU, es adecuado para experimentos rapidos de probing y evaluacion antes de escalar a modelos mayores de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 307.5M parametros en bfloat16, los pesos ocupan aproximadamente 0.6 GB, a lo que hay que sumar el estado de las capas Mamba y las activaciones.
- GPU recomendadas: no disponible; la model card indica que las capas Mamba requieren kernels CUDA y que la generacion necesita GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; al requerir kernels CUDA (mamba-ssm, causal-conv1d), la viabilidad en GPU consumer no esta documentada.
- Opciones de despliegue: transformers con `trust_remote_code=True` (ruta HF de una sola GPU, sin padding, maximo 131072 tokens por prefill); el repositorio incluye una entrada vLLM para prefills mayores. No se documentan llama.cpp, Ollama ni TGI.
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1 y FlashAttention 2.7.3. HF y vLLM usan entornos separados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CENO-300M-base | 307.5M | 131072 tokens por prefill (ruta HF) | Hibrida Mamba/Attention/MoE | Apache-2.0 | Hugging Face (CladeTeam) |
| CENO-P-* (familia CENO con MSA) | no disponible | no disponible | no disponible | no disponible | Hugging Face (CladeTeam) |
| Evo2 (Arc Institute) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referencia del tokenizador) |
| Nemotron-H (NVIDIA) | no disponible | no disponible | Mamba/Attention/MoE | Apache-2.0 (referencia del codigo) | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada; la comparativa se limita a lo documentado.

## Limitaciones y advertencias

- La correccion numerica no garantiza generacion libre de repeticiones ni biologicamente funcional; la model card advierte explicitamente de ello.
- Las capas Mamba requieren kernels CUDA: las pasadas forward y la generacion no funcionan en CPU (solo la carga de configuracion, tokenizador y pesos es segura en CPU).
- La ruta HF de precision es de una sola GPU, sin padding y limitada a 131072 tokens por prefill; para prefills mayores hay que usar la entrada vLLM del repositorio.
- HF y vLLM usan entornos separados; mezclar dependencias puede provocar fallos.
- No se documentan datos de sesgos, tasa de alucinacion ni comportamiento en dominios fuera de la genomica.
- No se dispone de informacion sobre el dataset de entrenamiento, por lo que no se puede evaluar la cobertura taxonomica ni posibles sesgos de representacion genomica.
- El modelo es un checkpoint base, no ajustado para instrucciones ni para uso conversacional; su uso directo en produccion requiere adaptacion.
- Licencia Apache-2.0: permite uso comercial, pero el codigo incluido deriva de Nemotron-H (NVIDIA) y el tokenizador de Evo2 (Arc Institute); deben respetarse las atribuciones de los ficheros LICENSE y NOTICE del repositorio.
- El modelo opera sobre alfabeto de ADN, no sobre lenguaje natural; no debe emplearse como modelo de texto general.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-300M-base
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
- Nemotron-H (NVIDIA, referencia del codigo): no disponible en la informacion proporcionada
- Evo2 (Arc Institute, referencia del tokenizador): no disponible en la informacion proporcionada
