# praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-qaft

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (libreria PEFT) entrenado sobre Qwen2.5-1.5B, el modelo base de Alibaba de 1,54 mil millones de parametros. El adaptador, publicado por la organizacion praiselab-picuslab, forma parte de un proyecto de benchmark de modelos de lenguaje pequenos (SLM), como indican las etiquetas `benchmark-slm` y `strategy-qaft`, y esta orientado al idioma italiano.

El adaptador se entreno sobre el dataset denominado "fiven" con la estrategia "qaft", cuya sigla no se documenta en la informacion disponible. Su relevancia es principalmente como artefacto de investigacion: permite evaluar estrategias de ajuste fino eficientes (LoRA) sobre modelos pequenos para idiomas concretos, en este caso el italiano. El acceso al repositorio es restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-1.5B (transformer decoder) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 1,54 B de parametros |
| Parametros activos | No aplicable (el modelo base no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen2.5-1.5B soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Italiano (it) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base, Qwen2.5-1.5B, es un transformer decoder-only de la familia Qwen2.5 con aproximadamente 1,54 mil millones de parametros, mecanismo de atencion GQA (grouped-query attention) y una ventana de contexto de 32.768 tokens (ampliable hasta 128K mediante YaRN segun la documentacion de Qwen). La familia Qwen2.5 fue preentrenada con alrededor de 18 billones de tokens multilingues.

Sobre esta base, praiselab-picuslab aplico un ajuste fino parametro-eficiente mediante LoRA, tecnicamente indicado por las etiquetas `peft`, `lora` y `base_model:adapter`. Los detalles de entrenamiento (rango y alpha de LoRA, capas objetivo, numero de tokens, composicion del dataset "fiven", uso de RLHF/DPO) no estan disponibles en la ficha publica. La etiqueta `strategy-qaft` sugiere que se empleo una estrategia de ajuste concreto dentro del proyecto benchmark-slm, pero su definicion exacta no se documenta en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en italiano (pipeline `text-generation`, etiqueta `conversational`).
- Hereda las capacidades generales del modelo base Qwen2.5-1.5B: generacion de texto, razonamiento basico, codigo y matematicas elementales, con rendimiento limitado propio de un modelo de 1,5 B de parametros.
- No hay evidencia de soporte de tool calling / function calling en la informacion disponible.
- No hay evidencia de capacidades de agentes ni de razonamiento multi-paso entrenadas especificamente.
- Capacidades multilingues: el adaptador esta orientado al italiano segun los metadatos; el comportamiento en otros idiomas no esta documentado.
- Sin modalidades especiales: no hay indicios de vision, audio ni thinking mode.

## Casos de uso

- **Chatbots en italiano con recursos limitados**: al partir de un modelo de 1,5 B de parametros, el adaptador permite desplegar asistentes conversacionales en italiano en hardware modesto, incluidas GPUs de consumo o incluso CPU, donde modelos grandes no son viables.
- **Investigacion sobre estrategias de fine-tuning**: al formar parte de un benchmark sistematico de SLMs (`benchmark-slm`), es util para comparar empiricamente la estrategia "qaft" frente a otras estrategias de ajuste sobre la misma base y el mismo dataset.
- **Resumen de documentos en italiano**: el modelo base maneja contextos de 32.768 tokens, suficiente para resumir articulos, correos o informes de longitud media en italiano con coste de inferencia muy bajo.
- **Clasificacion y extraccion de informacion**: tareas de NLU ligeras sobre texto italiano (etiquetado de tickets, deteccion de intencion, extraccion de campos) donde se prioriza latencia y coste sobre maxima precision.
- **Prototipado rapido de aplicaciones LLM en italiano**: ideal para iterar prompts y pipelines antes de escalar a modelos mayores, gracias al bajo consumo de memoria y a la integracion directa con la libreria PEFT de HuggingFace.
- **Punto de partida para ajustes adicionales**: al ser un adaptador LoRA, puede fusionarse con la base (`merge_and_unload`) y reentrenarse o apilarse con otros adaptadores para especializarlo en dominios concretos (legal, medico, atencion al cliente).
- **Evaluacion comparativa de SLMs para italiano**: util como punto de datos en estudios que miden cuanto rinde un modelo pequeno multilingue tras un ajuste fino monolingue frente a su version base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (base de 1,5 B + adaptador, el adaptador anade una sobrecarga minima): aproximadamente 3,5-4 GB en FP16; alrededor de 2 GB en INT8; en torno a 1,2-1,5 GB en cuantizacion de 4 bits. Son estimaciones derivadas del tamano del modelo base, no datos publicados por el autor.
- **GPU recomendadas**: cualquier GPU moderna es suficiente. Referencias: RTX 3060 de 12 GB, RTX 4060, RTX 4090 o superiores ofrecen margen amplio; tambien es viable en portatiles con GPU de 4-6 GB y en CPU pura con velocidad reducida.
- **Cabe en GPU de consumo**: si, con holgura incluso en gamas medias y bajas; no requiere A100 ni H100.
- **Opciones de despliegue**: transformers + PEFT (cargando el adaptador sobre Qwen/Qwen2.5-1.5B); fusion del adaptador con la base y posterior conversion a GGUF para llama.cpp u Ollama; vLLM y TGI, que soportan servir adaptadores LoRA o pesos fusionados.
- **Latencia y throughput**: no disponibles; al tratarse de un modelo de 1,5 B de parametros, cabe esperar latencias bajas y throughputs altos en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-qaft | Adaptador LoRA sobre 1,54 B | 32.768 (heredada de la base) | Adaptador ajustado para italiano | No disponible | Gated |
| Qwen/Qwen2.5-1.5B (base) | 1,54 B | 32.768 | Modelo completo | Apache 2.0 | Abierta |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Modelo completo instruido | Apache 2.0 | Abierta |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 131.072 | Modelo completo instruido | Llama 3.2 Community License | Gated |

La diferencia clave es que esta ficha corresponde a un adaptador experimental sin benchmarks publicados, mientras que las alternativas son modelos completos con documentacion extensa y validacion comunitaria. Para uso en produccion en italiano, Qwen2.5-1.5B-Instruct es hoy una opcion mejor documentada; el valor de este adaptador es comparativo y de investigacion.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere descargar y cargar Qwen/Qwen2.5-1.5B y aplicar el adaptador mediante PEFT; no funciona de forma independiente.
- **Licencia no especificada**: al no declararse licencia en el repositorio, existe incertidumbre legal para uso comercial del adaptador, aunque el modelo base es Apache 2.0.
- **Acceso restringido (gated)**: hay que aceptar condiciones en HuggingFace antes de poder descargarlo.
- **Tamano del repo de 0,0 GB y 0 descargas**: posible indicio de un repositorio vacio, incompleto o sin uso comunitario; conviene verificar que los pesos estan realmente disponibles antes de planificar su uso.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de que el ajuste mejore al modelo base; el rendimiento en italiano es una hipotesis, no un dato verificado.
- **Dataset "fiven" sin documentar**: composicion y procedencia desconocidas, por lo que no se pueden evaluar sesgos potenciales del entrenamiento.
- **Riesgo de alucinacion elevado**: los modelos de 1,5 B de parametros tienen capacidad de razonamiento limitada y tienden a generar contenido incorrecto con fluidez, especialmente fuera de su dominio de ajuste.
- **Alcance linguistico**: metadatos apuntan solo al italiano; el comportamiento en castellano u otros idiomas tras el ajuste no esta evaluado.
- **Sin tool calling ni garantias de seguridad documentadas**: no apto para flujos agenticos sin validacion adicional.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-qwen2.5-1.5b-qaft
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Documentacion de PEFT (libreria del adaptador): https://huggingface.co/docs/peft
- Blog de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/

No se han encontrado enlaces adicionales (papers, repos de GitHub o demos) en la informacion disponible.
