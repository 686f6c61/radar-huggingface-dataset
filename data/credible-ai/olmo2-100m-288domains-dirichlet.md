# credible-ai/olmo2-100M-288domains-dirichlet

## Resumen

`olmo2-100M-288domains-dirichlet` es una colección de 512 modelos de lenguaje preentrenados de 102 millones de parámetros, publicada por el grupo credible-ai como artefacto de investigación del paper LinMix (arXiv:2610.37390). No es un modelo pensado para uso conversacional o de producción, sino un conjunto de *proxy models*: cada uno ha sido entrenado con una mezcla de datos distinta, generada mediante un diseño Dirichlet sobre 288 dominios definidos por la taxonomía WebOrganizer (combinación de temática y formato). El objetivo es estudiar cómo la composición de la mezcla de datos afecta al comportamiento del modelo entrenado.

La arquitectura es OLMo 2 (`Olmo2ForCausalLM`), con 12 capas, dimensión oculta 512 y 102M de parámetros, usando el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 tokens. Cada uno de los 512 modelos se entrenó con 3,2 mil millones de tokens procedentes del corpus WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x. Los pesos están en bfloat16 y el repositorio completo ocupa 104,5 GB.

Su relevancia es metodológica: permite a investigadores reproducir y extender experimentos de *data mixing* a escala reducida antes de escalar a modelos mayores, y sirve como banco de pruebas para técnicas de atribución de dominios, optimización de mezclas y análisis de sensibilidad a la composición del corpus. No está orientado a tareas downstream reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only, 12 capas, hidden size 512 |
| Parametros totales | 102M por modelo (512 modelos en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16), tokenizador en la raíz del repo |

## Arquitectura y entrenamiento

Cada modelo individual sigue la arquitectura OLMo 2 en su variante pequeña: transformer decoder-only con 12 capas, dimensión oculta 512 y 102M de parámetros totales. El tokenizador es el de GPT-NeoX-20B con vocabulario de 50.432 entradas, compartido por los 512 modelos y ubicado en la raíz del repositorio. El entrenamiento se realizó con OLMo-core, el framework de AllenAI.

Los datos provienen de WebOrganizer/Corpus-200B, un corpus derivado del pool DCLM 1b-1x (licencia CC-BY-4.0) y sujeto a los términos de uso de Common Crawl. Cada uno de los 512 modelos se entrenó con 3,2B tokens siguiendo una mezcla distinta generada por un diseño Dirichlet sobre 288 dominios (temática × formato). La mezcla concreta de cada proxy se guarda en `mix_<i>/mix.json`. Las secuencias tokenizadas exactas usadas en el entrenamiento están publicadas en el dataset `credible-ai/weborganizer-corpus-200b-tokenized`, lo que permite reproducibilidad completa. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el tamaño del modelo (102M de parámetros) y por el entrenamiento exclusivamente en inglés.
- Modelado de lenguaje y estimación de probabilidad de secuencias, útil para análisis de perplexity por dominio.
- Reproducción de experimentos de *data mixing*: cada checkpoint corresponde a una mezcla concreta y trazable mediante `mix.json`.
- Comparación controlada entre mezclas: al compartir arquitectura, tokenizador y presupuesto de tokens (3,2B), las diferencias de comportamiento son atribuibles a la mezcla de datos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; el modelo está etiquetado únicamente como inglés.

## Casos de uso

- Investigación en *data mixing*: entrenar y evaluar estrategias de mezcla de dominios a bajo coste usando estos 512 proxies como sustitutos de modelos mayores, y validar si las conclusiones escalan.
- Atribución lineal de dominios (LinMix): usar los pares (mezcla, rendimiento) para ajustar modelos de atribución que estimen la contribución de cada uno de los 288 dominios a una métrica objetivo.
- Selección de subconjuntos de datos: identificar qué combinaciones de temática y formato correlacionan con mejor pérdida en un dominio de interés antes de invertir en entrenamientos grandes.
- Análisis de sensibilidad al corpus: estudiar cómo varía la perplexity por dominio entre las 512 mezclas Dirichlet para detectar dominios de alto impacto.
- Reproducibilidad de papers: replicar los resultados de LinMix con los pesos y las secuencias tokenizadas publicadas, sin necesidad de reentrenar desde cero.
- Docencia y experimentación: servir como banco de pruebas didáctico para cursos de entrenamiento de LLM, ya que un modelo de 102M se entrena e infiere con recursos modestos.
- Detección de contaminación y análisis de corpus: comparar la pérdida de cada proxy sobre textos de validación para caracterizar la cobertura del corpus WebOrganizer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: un modelo de 102M en bfloat16 ocupa aproximadamente 0,2 GB de pesos; con overhead de activaciones y KV cache, cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también es viable en CPU para inferencia por lotes.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, y en la mayoría de iGPU y CPU.
- Almacenamiento: el repositorio completo ocupa 104,5 GB; conviene descargar solo los subdirectorios `mix_<i>` necesarios mediante `allow_patterns` en `snapshot_download`.
- Opciones de despliegue: transformers (`AutoModelForCausalLM` con `subfolder="mix_<i>"`), y en principio cualquier runtime compatible con safetensors y arquitectura OLMo 2; no se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-100M-288domains-dirichlet | 102M (×512) | no disponible | Proxies para investigación de data mixing | MIT | HuggingFace |
| OLMo 2 (variantes oficiales de AllenAI) | 7B, 13B, 32B | hasta 4.096 tokens en variantes publicadas | Modelos de propósito general | Apache 2.0 (según variante) | HuggingFace |
| Pythia (EleutherAI) | 70M–12B | 2.048 tokens | Suite para interpretabilidad y estudios de escalado | Apache 2.0 | HuggingFace |
| SmolLM2 (HuggingFace) | 135M–1.7B | hasta 8.192 tokens | Modelos pequeños de propósito general | Apache 2.0 | HuggingFace |

La comparación es aproximada: los proxies de este repositorio no compiten en capacidades downstream, sino que se posicionan como infraestructura experimental frente a suites como Pythia, que ofrecen checkpoints intermedios pero no barridos sistemáticos de mezcla de datos.

## Limitaciones y advertencias

- Tamaño muy reducido (102M de parámetros): la calidad de generación es baja y no es apto para tareas de producción reales.
- Entrenado únicamente en inglés; no se garantiza comportamiento en otros idiomas.
- No ha pasado por fases de alineación (RLHF/DPO) documentadas, por lo que puede generar contenido sesgado, tóxico o factualmente incorrecto.
- Riesgo alto de alucinación inherente a modelos pequeños preentrenados sin instrucciones.
- Los datos de entrenamiento derivan de Common Crawl vía DCLM, con los sesgos y problemas de calidad propios del corpus web.
- La licencia MIT cubre los pesos, pero el uso de los datos subyacentes está sujeto a los términos de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; conviene revisarlos antes de usos comerciales derivados.
- El repositorio es grande (104,5 GB); descargar todo el conjunto sin filtrar puede ser costoso e innecesario.
- No se documenta longitud de contexto ni recetas de cuantización; asumir valores por defecto de OLMo 2 sin verificación puede inducir errores.
- El identificador arXiv (2610.37390) y las fechas de creación del repositorio son posteriores a la fecha actual de referencia habitual; verificar la vigencia de los enlaces antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-100M-288domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Repositorio de código: https://github.com/credibleai/linmix
- Dataset de diseño y resultados: https://huggingface.co/datasets/credible-ai/linmix-proxy-swarms
- Dataset de secuencias tokenizadas: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Corpus WebOrganizer: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentación de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Framework OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
