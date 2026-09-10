# Jeesup/svd-safety-l2_remove60_random_b010

## Resumen

svd-safety-l2_remove60_random_b010 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf al que se ha aplicado una compresion SVD-LLM que elimina el 59,03% de los parametros densos, dejando una fraccion efectiva de 0,4097, y sobre el que despues se restauran 5.723 componentes SVD adicionales con un presupuesto del 1,000% de los parametros densos, seleccionados mediante la regla `random` con semilla 42. Lo publica el usuario Jeesup como artefacto de investigacion, no como modelo conversacional de proposito general.

El interes del checkpoint es metodologico: forma parte de una rejilla experimental que estudia como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. La model card es explicita al respecto: varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base, y el objetivo es cuantificar esa perdida y probar estrategias de recuperacion.

Los datos medidos que acompanan al checkpoint son AdvBench ASR de 0,3308, StrongREJECT ASR de 0,3642, macro over-refusal de 0,0956 (WildGuard) y perplejidad de 17,5455 en WikiText-2. Con cero descargas y cero likes en el momento de la consulta, se trata de un artefacto de laboratorio cuyo valor esta en la trazabilidad del experimento, no en su uso como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con factorizacion de bajo rango SVD-LLM aplicada sobre las matrices de pesos |
| Parametros totales | 6.738.415.616 (segun safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Fraccion densa resultante | 0,4097 (59,03% de parametros eliminados por compresion SVD-LLM) |
| Componentes SVD restaurados | 5.723 (presupuesto de restauracion del 1,000% de los parametros densos) |
| Regla de seleccion | `random` (semilla 42); 0 componentes sustituidos |
| Longitud de contexto | 4.096 tokens, heredada del modelo base Llama-2-7b-chat; no se especifica en la model card |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | no disponible en la model card |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con cache causal. La intervencion consiste en una compresion SVD-LLM que reduce el rango de las matrices de pesos: el checkpoint conserva las formas tensoriales originales, de ahi que el recuento de parametros en safetensors coincida con el de Llama-2-7b (6.738.415.616) mientras la fraccion densa efectiva cae a 0,4097. Sobre esa base comprimida se reinjectan 5.723 componentes singulares adicionales, elegidos al azar con semilla 42, que ocupan un presupuesto del 1,000% de los parametros densos.

No hay entrenamiento adicional ni ajuste fino con RLHF o DPO documentado: el proceso es puramente post-hoc sobre los pesos de Llama-2-7b-chat, que a su vez fue alineado por sus autores originales con RLHF y datos de preferencia humana. La innovacion tecnica relevante aqui no es el modelo en si, sino el protocolo experimental: comparar reglas de seleccion de componentes (en esta celda, `random`) frente a alternativas guiadas por criterios de relevancia, midiendo el efecto sobre la tasa de exito de ataques y sobre la utilidad del modelo.

## Capacidades

- Generacion de texto conversacional en la misma medida en que lo permite la compresion: la perplejidad medida en WikiText-2 es 17,5455, muy por encima de lo esperable en el modelo sin comprimir.
- Razonamiento y respuesta a instrucciones degradados por la compresion; no hay evaluaciones de MMLU, GSM8K o HumanEval en la informacion disponible.
- Trazabilidad experimental: el checkpoint existe para medir el efecto de la regla `random` con presupuesto de restauracion del 1,000%, y es comparable con otras celdas de la misma rejilla.
- Evaluacion de seguridad: al estar acompanado de metricas ASR (AdvBench y StrongREJECT) y de over-refusal, sirve como sujeto de prueba en pipelines de red-teaming.
- Soporte de tool calling / function calling: no disponible (el modelo base Llama-2-7b-chat no lo incorpora de forma nativa y no hay evidencia de que la compresion lo anada).
- Capacidades de agente y razonamiento multi-paso: no disponibles ni evaluadas.
- Capacidades multilingues: no disponibles; la model card no documenta idiomas.
- Capacidades especiales (vision, audio, modo pensamiento): ninguna; el pipeline declarado es text-generation.

## Casos de uso

- Estudio de ablacion sobre reglas de seleccion SVD: comparar esta celda (`random`) con las celdas guiadas por otras reglas para determinar que criterio de seleccion de componentes recupera mejor la seguridad perdida. Es el proposito explicito del artefacto.
- Cuantificacion de la degradacion de seguridad por compresion: usar los valores de AdvBench ASR (0,3308) y StrongREJECT ASR (0,3642) como punto de referencia frente al modelo sin comprimir y frente a otras configuraciones de presupuesto.
- Benchmark de utilidad bajo compresion: emplear la perplejidad de WikiText-2 (17,5455) y el macro over-refusal (0,0956) para construir curvas de compromiso seguridad-utilidad a lo largo de la rejilla de presupuestos.
- Sujeto de prueba en evaluaciones de seguridad automatizadas: integrarlo como uno de los modelos objetivo en un pipeline que aplique jueces tipo HarmBench y WildGuard para validar que el arnes de evaluacion detecta correctamente modelos degradados.
- Investigacion en interpretabilidad: analizar que subespacios singulares de las matrices de atencion y MLP concentran el comportamiento de rechazo, aprovechando que se conoce exactamente que 5.723 componentes se han restaurado y con que semilla.
- Reproducibilidad metodologica: servir como celda de control con semilla 42 para verificar que un experimento de compresion produce los mismos numeros en una repeticion.
- Material docente: ilustrar en un curso de eficiencia computacional como la compresion por bajo rango afecta desproporcionadamente a comportamientos alineados frente a capacidades generales.
- No se recomienda su uso como asistente conversacional en produccion, atencion al cliente ni generacion de codigo: la propia model card lo describe como sujeto experimental y no como modelo desplegable.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3308 |
| StrongREJECT ASR (juez HarmBench) | 0,3642 |
| Macro over-refusal (WildGuard) | 0,0956 |
| Perplejidad WikiText-2 | 17,5455 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni se aportan los valores del modelo base sin comprimir como referencia directa en la model card. Los enlaces de busqueda web recuperados no contienen informacion relevante sobre este modelo ni sobre SVD-LLM.

## Requisitos de hardware

- VRAM en fp16: los pesos ocupan aproximadamente 13,5 GB, por lo que se necesitan entre 15 y 18 GB de VRAM contando cache KV para contexto de 4.096 tokens; encaja en una RTX 4090 (24 GB) o en una A100 40 GB.
- VRAM en int8: en torno a 7 GB de pesos mas cache, viable en RTX 3090/4080/4090 y en GPUs de 12-16 GB con contexto moderado.
- VRAM en 4 bits: aproximadamente 3,5-4 GB de pesos, lo que permitiria ejecutarlo en GPUs consumer de 8 GB, aunque requeriria cuantizacion manual porque no se publican pesos precuantizados.
- GPUs recomendadas: A100 40/80 GB, H100 para lotes grandes, RTX 4090 o L40S para inferencia de una sola peticion; no requiere hardware especializado mas alla del estandar para 7B.
- Despliegue: transformers es la libreria declarada; el tag `text-generation-inference` indica compatibilidad con TGI, y los tags `endpoints_compatible` y `region:us` con Hugging Face Inference Endpoints. vLLM es una opcion razonable para servirlo con PagedAttention, aunque no esta documentada por el autor. Para llama.cpp u Ollama habria que convertir primero los pesos a GGUF, ya que no se distribuye ese formato.
- Latencia y throughput: no disponibles; no se aportan mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Nota importante: al tratarse de un artefacto experimental con comportamiento de seguridad degradado, no deberia exponerse como endpoint publico ni en entornos compartidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad / utilidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove60_random_b010 | 6.738.415.616 en safetensors, fraccion densa efectiva 0,4097 | 4.096 tokens (heredado) | AdvBench ASR 0,3308; StrongREJECT ASR 0,3642; over-refusal 0,0956; PPL WikiText-2 17,5455 | Llama 2 Community License | Repositorio Hugging Face, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | 4.096 tokens | No se aporta la medicion del base en la informacion disponible; la model card indica que la compresion por si sola eleva la tasa de exito de ataque | Llama 2 Community License | Publico en Hugging Face, ampliamente utilizado |
| Otras celdas de la misma rejilla experimental (distintas reglas y presupuestos) | no disponible | 4.096 tokens (heredado) | no disponible | Llama 2 Community License | Referenciadas de forma implicita en la model card, sin identificadores publicados |

No hay datos publicados que permitan comparar este checkpoint con otras familias de modelos comprimidos (por ejemplo, variantes podadas o cuantizadas de Llama 2) en terminos de seguridad o perplejidad dentro de la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la model card advierte explicitamente que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: esta celda presenta una tasa de exito de ataque de 0,3308 en AdvBench y 0,3642 en StrongREJECT, valores que indican una alineacion de seguridad notablemente debil.
- Mayor tendencia al rechazo excesivo: el macro over-refusal de 0,0956 implica que, ademas de fallar en seguridad, el modelo rechaza peticiones legitimas en una proporcion medible.
- Perdida clara de calidad de lenguaje: una perplejidad de 17,5455 en WikiText-2 es indicativa de un modelado del lenguaje muy degradado; no se aporta el valor del modelo base para cuantificar la diferencia exacta.
- Riesgo elevado de alucinacion y de respuestas incoherentes, coherente con la compresion agresiva y la perdida de calidad medida.
- Idiomas soportados no documentados; el modelo base esta optimizado para ingles, por lo que el rendimiento en castellano es incierto y no evaluado.
- Licencia Llama 2 Community License: uso comercial permitido con condiciones (entre ellas, no superar los 700 millones de usuarios activos mensuales y conservar los avisos de atribucion), y sujeto ademas a USE_POLICY.md. Es obligatorio revisar ambos ficheros incluidos en el repositorio.
- Sin pesos cuantizados publicados: cualquier despliegue eficiente exige cuantizar o convertir el modelo por cuenta propia, con el consiguiente riesgo de degradacion adicional.
- Sin adopcion verificable: cero descargas y cero likes, sin issues ni validacion independiente de las metricas reportadas.
- Sin datos de sesgo, toxicidad ni evaluacion multilingue; no deben asumirse garantias de ningun tipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_remove60_random_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia y politica de uso: LICENSE.txt y USE_POLICY.md dentro del repositorio del modelo
- Paper de Llama 2 (referencia del modelo base): https://arxiv.org/abs/2307.09288
- SVD-LLM (metodo de compresion citado por el autor): no se proporciona enlace en la informacion disponible
- Los resultados de busqueda web recuperados no contienen enlaces relevantes sobre este modelo, SVD-LLM ni evaluaciones de seguridad asociadas.
