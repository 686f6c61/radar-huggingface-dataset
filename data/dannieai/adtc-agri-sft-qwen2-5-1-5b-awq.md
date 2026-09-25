# DannieAI/adtc-agri-sft-qwen2.5-1.5b-awq

## Resumen

Este repositorio contiene una version cuantizada del modelo EYEDOL/adtc-agri-sft-qwen2.5-1.5b, un ajuste fino supervisado (SFT) sobre la arquitectura Qwen2.5-1.5B. La cuantizacion la ha realizado el usuario DannieAI mediante AutoAWQ en 4 bits, con el objetivo de reducir el peso del modelo a aproximadamente 1,2 GB y facilitar su despliegue en hardware de gama baja o en entornos con VRAM limitada. El modelo conserva la arquitectura transformer densa, decoder-only, propia de la familia Qwen2.5.

El modelo base pertenece a la serie Qwen2.5, publicada por Alibaba en septiembre de 2024, que se entrena sobre un corpus de hasta 18 billones de tokens y se distribuye en variantes densas de 0,5B, 1,5B, 3B, 7B, 14B, 32B y 72B, tanto en version base como instruct. El sufijo "adtc-agri-sft" del modelo de origen sugiere un ajuste orientado al dominio agricola, aunque la model card no documenta ni el dataset ni el procedimiento de entrenamiento empleado.

La relevancia de esta ficha es acotada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados. Su interes practico radica en ser un ejemplo de cuantizacion AWQ de un modelo pequeno (1,5B) para inferencia en GPU de consumo, mas que en un rendimiento medido o verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card. La arquitectura Qwen2.5-1.5B soporta 32.768 tokens de forma nativa, pero no se confirma que el ajuste fino conserve este valor |
| Tipos de cuantizacion | AWQ 4 bits (w_bit=4, q_group_size=128, zero_point=true, version GEMM) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos cuantizados AWQ) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de Qwen2.5-1.5B: un transformer denso, decoder-only, con atención causal y sin componentes de mezcla de expertos. Segun la informacion publica de la serie Qwen2.5, la familia se preentrena sobre un dataset de hasta 18 billones de tokens. Qwen2.5 se distribuye en variantes base e instruct; el modelo de origen de este repositorio (EYEDOL/adtc-agri-sft-qwen2.5-1.5b) incorpora un ajuste fino supervisado posterior, presumiblemente sobre datos del dominio agricola a juzgar por el nombre, aunque la model card no especifica la composicion del dataset, el numero de tokens de ajuste ni si se emplearon tecnicas de RLHF o DPO.

La unica innovacion tecnica documentada en este repositorio es el proceso de cuantizacion. Se aplica AutoAWQ con cuantizacion de 4 bits por grupos de 128 elementos, con punto cero activado y el kernel GEMM, lo que reduce el peso a aproximadamente 1,2 GB. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni variantes hibridas. No se dispone de informacion sobre el pipeline exacto de ajuste del modelo base, por lo que cualquier afirmacion sobre su entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y las etiquetas incluyen "conversational", lo que indica un uso previsto de dialogo.
- Cuantizacion para inferencia eficiente: compatible con AutoAWQForCausalLM y con text-generation-inference segun las etiquetas del repositorio.
- Dominio especifico: por el nombre del modelo base, cabe esperar un ajuste orientado a contenido agricola, aunque no hay documentacion que lo confirme.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere despliegue en infraestructura de inferencia gestionada.
- Capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio o modo thinking: no disponibles ni documentadas en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.

## Casos de uso

- Asistente conversacional de dominio agricola: dado que el modelo base parece ajustado con datos del sector, podria emplearse para responder consultas de agricultores o tecnicos sobre cultivos y practicas, siempre que se valide la calidad real de las respuestas, hoy no documentada.
- Prototipado rapido en GPU de consumo: con 1,2 GB de pesos cuantizados, es adecuado para experimentar con pipelines de generacion de texto en portatiles o equipos con GPU de gama media-baja sin necesidad de infraestructura en la nube.
- Despliegue en el borde o en entornos con VRAM reducida: su tamano permite ejecutarlo junto a otros servicios en una misma GPU, lo que resulta util para demostraciones o entornos de desarrollo.
- Generacion de texto controlada en lotes pequenos: puede integrarse en scripts de procesamiento de documentos o resumen de textos cortos, siempre acotando la longitud de contexto a lo efectivamente soportado.
- Base para experimentos de cuantizacion: sirve como caso de estudio para comparar el impacto de AWQ 4 bits frente a los pesos originales en un modelo de 1,5B.
- Filtrado o clasificacion de consultas agricolas: con prompts adecuados podria usarse para enrutar o etiquetar consultas de un chatbot mayor, aunque no hay evaluacion publicada que respalde esta funcion.
- Educacion y experimentacion academica: util para estudiar tecnicas de cuantizacion y ajuste fino en modelos pequenos dentro de cursos o trabajos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB solo para los pesos AWQ en 4 bits; con el contexto y los buffers de activacion, un presupuesto realista de 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Modelos como RTX 3050, RTX 3060, RTX 4060, T4 o superiores son suficientes.
- GPU de gama alta: A100, H100 o RTX 4090 no son necesarias para este tamano, salvo que se busque un throughput muy elevado con muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, con holgura, en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: AutoAWQ con transformers (segun la model card), text-generation-inference (etiqueta del repositorio) y, previsiblemente, vLLM con soporte AWQ. No se documenta compatibilidad con llama.cpp, Ollama ni GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DannieAI/adtc-agri-sft-qwen2.5-1.5b-awq | 1,5B | No disponible (base 32.768) | No disponible | HF, 0 descargas | Cuantizacion AWQ 4 bits |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 (segun la serie Qwen2.5) | HF, ampliamente usado | Modelo instruct de referencia de la misma arquitectura |
| Qwen2.5-1.5B (base) | 1,5B | 32.768 tokens | Apache 2.0 (segun la serie Qwen2.5) | HF | Modelo base sin ajuste conversacional |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Licencia comunitaria de Llama | HF | Alternativa de tamano similar, licencia con restricciones |

Nota: los datos de contexto y licencia de los modelos comparados proceden de informacion publica general de sus respectivas series y no de la model card de este repositorio. No se dispone de benchmarks que permitan comparar el rendimiento real de este ajuste cuantizado frente a las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, el uso comercial queda en una situacion juridica indeterminada. Conviene contactar con el autor antes de utilizarlo en produccion.
- Modelo base de origen incierto: no se documenta el dataset ni el procedimiento del ajuste fino "adtc-agri-sft", por lo que se desconoce su calidad y posibles sesgos.
- Riesgo de alucinacion: como cualquier modelo de este tamano, es propenso a generar informacion incorrecta, especialmente en dominios tecnicos como la agricultura, donde un error puede tener consecuencias practicas.
- Idiomas no declarados: no hay garantia de un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Contexto no confirmado: aunque la arquitectura base soporte 32.768 tokens, el ajuste fino podria no conservar esa ventana; conviene validarlo empiricamente.
- Perdida de calidad por cuantizacion: la cuantizacion AWQ a 4 bits introduce degradacion respecto a los pesos originales, cuya magnitud no esta medida en este repositorio.
- Sin benchmarks ni evaluaciones independientes: no hay evidencia publica de rendimiento que respalde su uso en tareas criticas.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fechas del repositorio: la model card indica fechas de creacion y actualizacion de septiembre de 2026, posteriores a la mayoria de modelos de la familia Qwen2.5; conviene verificar la procedencia de estos metadatos.
- Restricciones de despliegue: la model card solo documenta AutoAWQ; no se confirma soporte para llama.cpp, GGUF u Ollama.

## Enlaces

- Repositorio del modelo: https://huggingface.co/DannieAI/adtc-agri-sft-qwen2.5-1.5b-awq
- Modelo base: https://huggingface.co/EYEDOL/adtc-agri-sft-qwen2.5-1.5b
- Variante v2 del modelo base: https://huggingface.co/EYEDOL/adtc-agri-sft-qwen2.5-1.5b-v2
- Documentacion de variantes y capacidades de Qwen2.5 (DeepWiki): https://deepwiki.com/QwenLM/Qwen2.5/1.1-model-variants-and-capabilities
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Vision general de Qwen2.5 (DeepWiki): https://deepwiki.com/QwenLM/Qwen2.5
