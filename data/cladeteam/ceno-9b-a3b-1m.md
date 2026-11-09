# CladeTeam/CENO-9B-A3B-1m

## Resumen

CENO-9B-A3B-1m es el checkpoint de contexto largo (hasta 1.048.576 tokens de entrenamiento) del modelo fundacional de ADN CENO, desarrollado por CladeTeam. Se trata de un modelo de lenguaje causal sobre secuencia genomica construido sobre una columna vertebral hibrida Mamba / Attention / Mixture-of-Experts, siguiendo la arquitectura Nemotron-H de NVIDIA. Con 8.928.624.080 parametros totales y 8 expertos con enrutamiento top-2, el modelo esta disenado especificamente para generacion de secuencias de ADN y extraccion de embeddings, no para texto natural.

El modelo emplea un tokenizador a nivel de caracter con un vocabulario de solo 512 entradas, que mapea las bases de ADN a sus codigos ASCII de byte. Esta decision de diseno, heredada del `CharLevelTokenizer` de Evo2 (Arc Institute), elimina la necesidad de alineamientos multiples de secuencias (MSA) como entrada, lo que simplifica enormemente el preprocesado en comparacion con modelos genomicos clasicos como AlphaFold o ESM.

La relevancia de este checkpoint reside en su ventana de contexto efectiva: al combinar capas Mamba (sin ventana fija) con atencion, el modelo no tiene un limite duro de contexto, y este checkpoint concreto fue entrenado a 1M de tokens, lo que permite modelar dependencias de largo alcance en genomas completos o regiones regulatorias extensas. La licencia Apache-2.0 facilita su uso comercial e investigador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba / Attention / Mixture-of-Experts (Nemotron-H) |
| Parametros totales | 8.928.624.080 (8,9B) |
| Parametros activos | 2 de 8 expertos por token (top-2); parametros activos exactos no disponibles |
| Longitud de contexto | 1.048.576 tokens de entrenamiento; sin ventana fija por diseno (Mamba) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | No aplica texto natural; alfabeto de ADN (A, C, G, T, N y variantes) via tokenizador byte/char |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 17,9 GB) |

## Arquitectura y entrenamiento

La columna vertebral es un hibrido Mamba / Attention / MoE con 42 capas, tamano oculto de 2560, 20 cabezas de atencion y tamano intermedio de 10240. El modulo MoE contiene 8 expertos con enrutamiento top-2 por token. El tokenizador es a nivel de caracter (vocabulario de 512), mapeando bases de ADN a codigos ASCII de byte. El modelo se carga mediante `trust_remote_code=True` con las clases `CENOForCausalLM` y `CENOCharLevelTokenizer`.

Este checkpoint corresponde a la etapa 4 del entrenamiento (extension de contexto largo), entrenado a 1.048.576 tokens. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset genomico ni si se aplicaron tecnicas de RLHF/DPO (poco probables en un modelo fundacional de ADN base). La innovacion tecnica principal es la combinacion de capas Mamba (que no imponen ventana de contexto fija) con atencion y MoE, lo que permite modelar dependencias de muy largo alcance en secuencias genomicas sin el coste cuadratico de la atencion completa.

## Capacidades

- Generacion de secuencias de ADN (modelado de lenguaje causal sobre genomica).
- Extraccion de embeddings de secuencias genomicas para tareas downstream (probing, clasificacion, regresion).
- Adaptacion mediante fine-tuning para tareas genomicas especificas.
- Modelado de dependencias de largo alcance gracias al contexto de 1M tokens y a las capas Mamba sin ventana fija.
- Base para prediccion de efectos de variantes (VEP) mediante delta de log-verosimilitud, aunque para VEP el autor recomienda los checkpoints MSA (`CENO-P-*`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM de texto.
- No dispone de vision, audio ni modo "thinking".

## Casos de uso

- Modelado de genomas completos o regiones regulatorias extensas: con 1M tokens de contexto de entrenamiento y capas Mamba sin ventana fija, el modelo puede procesar locus genomicos de gran tamano en una sola pasada, capturando interacciones enhancer-promotor distantes.
- Extraccion de embeddings para clasificacion de elementos funcionales: se usan las representaciones internas del modelo como features para entrenar clasificadores ligeros de promoters, enhancers o sitios de union de factores de transcripcion.
- Fine-tuning para tareas genomicas especificas: el checkpoint base sirve como punto de partida para adaptar el modelo a prediccion de expresion genica, splicing o estructura secundaria de ARN.
- Generacion de secuencias sinteticas de ADN: el modelo puede generar secuencias plausibles biologicamente para diseno de bibliotecas o aumento de datos, con la advertencia de que la correccion biologica no esta garantizada.
- Puntuacion de variantes por verosimilitud: calculando el delta de log-verosimilitud entre secuencia wild-type y variante se puede priorizar variantes candidatas, aunque el autor remite a los checkpoints `CENO-P-*` para VEP.
- Investigacion en modelos fundacionales genomicos: como checkpoint de referencia para estudiar el efecto de la arquitectura hibrida Mamba/Attention/MoE en modelado de ADN a escalas de contexto extremas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia requiere GPU con CUDA: las capas Mamba necesitan kernels CUDA (`mamba-ssm`, `causal-conv1d`), por lo que las pasadas forward y la generacion no funcionan en CPU. La carga de config, tokenizador y pesos si es segura en CPU.
- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache; se recomienda GPU con 24 GB o mas.
- GPU recomendadas: A100 (40/80 GB), H100, y en consumer RTX 4090 (24 GB) para secuencias cortas; para contexto de 1M tokens se requiere memoria muy superior y probablemente multi-GPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; el autor indica que HF y vLLM usan entornos separados, lo que sugiere soporte de vLLM (no detallado). No se documentan llama.cpp ni Ollama (incompatibles con los kernels Mamba CUDA).
- Stack probado: PyTorch 2.7.0a0 (NVIDIA 25.03), Transformers 4.48.3, mamba-ssm 2.2.4, causal-conv1d 1.2.2.post1, FlashAttention 2.7.3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| CENO-9B-A3B-1m | 8,9B (top-2 de 8 expertos) | 1M tokens entrenados, sin ventana fija | Mamba/Attention/MoE | Apache-2.0 |
| Evo2 (Arc Institute) | No disponible en la informacion | No disponible | No disponible | Apache-2.0 (tokenizador derivado) |
| Nemotron-H (NVIDIA) | No disponible en la informacion | No disponible | Mamba/Attention/MoE | Apache-2.0 (codigo base) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La correccion numerica de la generacion no garantiza secuencias biologicamente funcionales ni libres de repeticiones; el autor lo advierte explicitamente.
- Modelo base: no esta alineado ni ajustado para instrucciones; requiere fine-tuning o prompting especifico para tareas downstream.
- Para prediccion de efectos de variantes (VEP) el autor recomienda los checkpoints MSA (`CENO-P-*`), no este checkpoint base.
- Requiere GPU CUDA para inferencia; no es desplegable en CPU ni en entornos sin kernels Mamba compilados.
- El contexto de 1M tokens es la longitud de entrenamiento, no un limite duro, pero el coste de memoria y computo a esa longitud es muy elevado.
- No se documentan sesgos, riesgos de alucinacion biologica ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el codigo derivado de Nemotron-H y del tokenizador de Evo2 exige mantener las atribuciones de los ficheros `LICENSE` y `NOTICE`.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/CladeTeam/CENO-9B-A3B-1m
- Repositorio de codigo CENO: https://github.com/CladeTeam/CENO
