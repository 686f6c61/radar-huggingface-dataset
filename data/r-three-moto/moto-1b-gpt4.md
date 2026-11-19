# r-three-moto/moto-1b-gpt4

## Resumen

MoTo 1B (variante v1 con enrutamiento aleatorio) es un modelo de lenguaje de tipo decoder estilo Llama, con 1.750.587.392 parámetros totales (1,28B no correspondientes a embeddings), entrenado desde cero por r-three-moto. Su particularidad no reside en la arquitectura, que es un transformer decoder convencional de 25 capas, `d_model` 2048 y 16 cabezas de atención, sino en el sistema de tokenización: en lugar de un único tokenizador multilingüe, emplea 21 tokenizadores BPE independientes, uno por idioma, fusionados en un vocabulario superset de 113.764 entradas que indexa una única tabla de embeddings compartida.

El modelo forma parte de la familia MoTo (Mixture of Tokenizers), un esfuerzo de investigación cuyo objetivo es aislar el efecto de la tokenización en modelos multilingües. Durante el entrenamiento, cada documento se codificó con un tokenizador elegido de forma uniformemente aleatoria, independientemente de su idioma, lo que convierte a esta variante en la línea base de enrutamiento aleatorio frente a las variantes con enrutamiento oráculo (moto-1b-v1-oracle y moto-1b-v1-oracle-reg).

Es relevante ahora porque ofrece una comparación controlada, con los mismos datos y presupuesto de cómputo, entre tokenización monolítica y tokenización por idioma, un aspecto habitualmente subestimado en el diseño de modelos multilingües. Se distribuye como modelo base, sin ajuste por instrucciones ni alineamiento de seguridad, con licencia MIT y pesos en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama, 25 capas, `d_model` 2048, 16 cabezas, embeddings de entrada y salida no atados |
| Parametros totales | 1.750.587.392 (1,28B no-embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | 21: en, ar, cs, zh, da, de, el, fa, fr, hu, id, it, ja, nl, pl, pt, ru, es, sv, tr, vi |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Llama con 25 capas, dimensión de modelo 2048, 16 cabezas de atención, embeddings de entrada y salida no atados y una tabla de embeddings de 113.764 filas que corresponde al vocabulario superset. La innovación principal está en la capa de tokenización: cada idioma dispone de un tokenizador BPE de 8.000 tokens (procedentes de la familia `flexitok`), y `super_mapping.json` traduce los identificadores de cada tokenizador original al espacio de identificadores del vocabulario superset compartido. El resto de la arquitectura permanece sin cambios respecto a un modelo monolítico equivalente, lo que permite atribuir las diferencias de rendimiento exclusivamente a la tokenización.

El entrenamiento se realizó desde cero durante 100.000 pasos con 1,05M tokens por paso, lo que suma aproximadamente 104,86B tokens (4 secuencias de 4096 tokens por GPU, 8 GPUs y 8 pasos de acumulación). Los datos combinan FineWeb-Edu (inglés, 40% de la mezcla) y FineWeb2-HQ (los 20 idiomas restantes), con pesos exactos documentados en `training/config.yaml`. En esta variante, cada documento se codificó con un tokenizador sorteado uniformemente al azar, de modo que cualquier tokenizador resulta en distribución para cualquier idioma. No se aplicó ajuste por instrucciones, RLHF ni DPO; se trata de un modelo base concebido para comparación controlada.

## Capacidades

- Generación de texto autoregresiva en 21 idiomas, con especial cobertura de lenguas latinas, germánicas, eslavas, así como árabe, persa, griego, chino, japonés, coreano (no listado) y vietnamita.
- Modelado de lenguaje base: no está ajustado para seguir instrucciones ni para formato conversacional.
- Codificación y decodificación con tokenizadores por idioma, incluyendo decodificación de secuencias que derivan hacia el vocabulario de otro idioma.
- Enrutamiento configurable mediante `set_language`, `set_mapping` y el gestor de contexto `using`, lo que permite dirigir idiomas no vistos o tareas concretas a un tokenizador arbitrario.
- No dispone de soporte nativo de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe estructural: el vocabulario superset cubre 21 tokenizadores, aunque el rendimiento por idioma depende de la proporción de datos de entrenamiento.

## Casos de uso

- Investigación sobre tokenización multilingüe: sirve como línea base de enrutamiento aleatorio para comparar, con idénticos datos y cómputo, frente a las variantes oráculo y a los modelos monolíticos de la misma familia, aislando el efecto del tokenizador.
- Experimentos de eficiencia de tokenización: permite medir la longitud media de secuencia por idioma con tokenizadores dedicados frente a un tokenizador multilingüe único, útil para estimar costes de inferencia en producción.
- Generación de texto multilingüe controlada: con 4096 tokens de contexto, puede emplearse para completar documentos, resúmenes extractivos o continuaciones en cualquiera de los 21 idiomas mediante el tokenizador correspondiente.
- Evaluación de transferencia entre idiomas: al poder mapear un idioma a un tokenizador distinto con `set_mapping`, permite estudiar cómo afecta el tokenizador a la calidad en lenguas de bajos recursos.
- Prototipado de pipelines de NLP en entornos con recursos limitados: con 1,75B parámetros en bfloat16 (unos 3,5 GB de pesos) cabe en GPUs de consumo, lo que facilita experimentos locales de modelado de lenguaje.
- Reproducción académica: el repositorio incluye tokenizadores originales, mapeos, configuración de enrutamiento y vocabulario superset, lo que permite replicar exactamente el preprocesado del entrenamiento sin código remoto.
- Análisis de robustez de la decodificación: la capacidad de `tok.decode` para aceptar identificadores de cualquier tokenizador facilita estudiar generaciones que derivan entre idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias de 4096 tokens.
- En cuantización de 8 bits: alrededor de 1,8 GB de pesos; en 4 bits, alrededor de 0,9 GB. No se documentan cuantizaciones oficiales publicadas en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060, RTX 4070, L4); A100 o H100 sobredimensionadas para este tamaño, útiles solo para evaluación por lotes a gran escala.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en bfloat16 y en GPUs con 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` para el tokenizador combinado, o carga sin código remoto aplicando manualmente `super_mapping.json`; text-generation-inference figura entre las etiquetas del repositorio; llama.cpp, Ollama o vLLM requerirían conversión a GGUF o configuración específica no documentada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoTo 1B v1 (random routing) | 1,75B (1,28B no-embedding) | 4096 | 21 tokenizadores BPE con vocabulario superset | MIT | Hugging Face |
| MoTo 1B v1 oracle | No disponible | No disponible | 21 tokenizadores con enrutamiento oraculo | No disponible | Hugging Face (r3-moto) |
| MoTo 1B v1 oracle-reg | No disponible | No disponible | 21 tokenizadores con enrutamiento oraculo regularizado | No disponible | Hugging Face (r3-moto) |
| Baseline monolingue de la familia MoTo | No disponible | No disponible | Tokenizador unico | No disponible | Hugging Face (r3-moto) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a configuración y disponibilidad.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde de forma fiable a peticiones conversacionales ni sigue formatos de prompt estructurados.
- Sin alineamiento de seguridad: no ha pasado por RLHF, DPO ni filtros de contenido, por lo que puede generar texto sesgado, tóxico o inapropiado.
- Riesgo de alucinación inherente a un modelo de 1,75B entrenado sobre 104,86B tokens: la base factual es limitada y no debe usarse como fuente de verdad.
- Contexto máximo de 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- El enrutamiento aleatorio implica que el tokenizador usado en inferencia no coincide necesariamente con el idioma; aunque el autor indica que cualquiera está en distribución, el rendimiento puede degradarse si no se selecciona el tokenizador adecuado.
- Cobertura desigual por idioma: el inglés representa el 40% de la mezcla, por lo que los 20 idiomas restantes disponen de menos datos y previsiblemente menor calidad.
- El tokenizador combinado requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; existe una ruta alternativa sin código remoto aplicando manualmente el mapeo.
- Sin datos publicados de benchmarks, no es posible estimar su calidad frente a modelos de tamaño similar; no debe adoptarse en producción sin evaluación propia.
- Licencia MIT: permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el usuario asume la responsabilidad sobre el contenido generado.
- El repositorio registra 10 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r-three-moto/moto-1b-gpt4
- Paper: https://openreview.net/forum?id=avjeUhPuC6
- Código: https://github.com/r-three/moto
- Colección de modelos MoTo: https://huggingface.co/r3-moto
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Tokenizadores de origen (ejemplo): https://huggingface.co/flexitok/bpe_arb_Arab_8000
