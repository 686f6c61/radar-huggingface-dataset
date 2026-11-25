# NaturalScale/LoopTitan-MoE18-Layout-1.3B-A0.2B-Muon

## Resumen

LoopTitan-MoE18-Layout-1.3B-A0.2B-Muon es un modelo de lenguaje base entrenado desde cero por NaturalScale (laboratorio vinculado al proyecto LoopTitan, alojado en el repositorio datamllab/LoopTitan). Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de 18 capas y anchura 1056, disenado como parte de la "fase 1" de una familia de ocho disenos experimentales en los que se compara el efecto del optimizador (AdamW frente a Muon) sobre distintas configuraciones de reparto de expertos. Este checkpoint concreto corresponde al diseno 4 de 8 ("expert layout") y emplea el optimizador Muon.

El modelo almacena 1.330 millones de parametros sin contar los embeddings, y 1.650 millones contando la matriz de entrada y la cabeza de salida (la cifra que muestra Hugging Face). Por token activa aproximadamente 220 millones de parametros, lo que lo situa en la categoria de MoE de activacion muy dispersa. No esta afinado para instrucciones ni para conversacion: es un modelo de lenguaje base pensado para investigacion sobre arquitecturas MoE y sobre el impacto del optimizador en el rendimiento por byte.

Su relevancia es fundamentalmente metodologica: publica resultados de bits por byte (BPB) sobre el conjunto DCLM-baseline que permiten comparar de forma controlada variantes de arquitectura y optimizador. Con licencia MIT y pesos en safetensors, es un punto de partida util para experimentacion con arquitecturas MoE personalizadas, aunque su escasa difusion (3 descargas en el momento de la consulta) indica que no es un modelo orientado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 18 capas, anchura 1056, codigo personalizado (`custom_code`) |
| Parametros totales | 1.649.606.112 (con embeddings y cabeza de salida); 1,33 B sin embeddings |
| Parametros activos | ~0,22 B (220 millones) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 18 capas con anchura 1056 y tamano de experto oculto de 384. El reparto de expertos no es uniforme: las tres primeras y las tres ultimas capas contienen 88 expertos cada una, mientras que las doce capas intermedias contienen 44 expertos cada una. Este "expert layout" asimetrico es precisamente la innovacion que distingue a este checkpoint dentro de la familia de ocho disenos de la fase 1. Con 1,33 B de parametros no-embedding y 0,22 B activos, la relacion de activacion es de aproximadamente 1:6.

El modelo se entrena desde cero (no es un ajuste de un modelo preexistente) sobre el dataset `mlfoundations/dclm-baseline-1.0-parquet`, un corpus web filtrado de DCLM. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; la model card indica explicitamente que es un modelo base, no afinado para instrucciones. La innovacion tecnica destacada es el uso del optimizador Muon en lugar de AdamW: la model card compara ambos optimizadores sobre los ocho disenos y reporta que, para este layout concreto, Muon mejora el test BPB en 3,36 mBPB (milesimas de bit por byte) respecto al MoE estandar con Muon como referencia, y en 5,9 mBPB respecto al MoE estandar con AdamW.

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje base.
- Modelado de lenguaje puro: la metrica declarada es bits por byte sobre DCLM, no tareas downstream.
- No dispone de ajuste por instrucciones ni por preferencias humanas (no es un modelo conversacional afinado, pese a la etiqueta `conversational` del repositorio).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Al ser un modelo base, puede servir como punto de partida para fine-tuning supervisado o para experimentacion arquitectonica.

## Casos de uso

- Investigacion sobre arquitecturas MoE: el modelo permite reproducir y extender el estudio comparativo de layouts de expertos y optimizadores (AdamW frente a Muon) publicado por el equipo, sirviendo como checkpoint de referencia del diseno 4 de 8.
- Fine-tuning supervisado para tareas concretas: al ser un modelo base de 1,3 B con 0,22 B activos, puede adaptarse con SFT a tareas de clasificacion, extraccion o generacion acotada con un coste de computo moderado.
- Experimentos de eficiencia de inferencia: su baja activacion por token (0,22 B) lo hace adecuado para medir el equilibrio entre calidad y coste en despliegues MoE de baja latencia.
- Generacion de texto de dominio general como base de comparacion: util para establecer lineas base de perplejidad y BPB frente a otros modelos pequenos en pipelines de evaluacion internos.
- Destilacion y generacion de datos sinteticos: un modelo base con licencia MIT puede emplearse para generar texto de entrenamiento en dominios controlados, siempre que se valide la calidad de la salida.
- Docencia y formacion: su tamano manejable y su documentacion de resultados lo convierten en un caso de estudio practico sobre MoE, reparto de expertos y optimizadores en cursos de aprendizaje automatico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero):

| Metrica | Valor | Notas |
|---|---:|---|
| Test BPB | 0,971013 | Sobre el split de test completo de DCLM-baseline |
| Validation BPB | 0,972742 | Sobre el split de validacion completo de DCLM-baseline |
| Delta test frente a MoE estandar (Muon) | -3,36 mBPB | Mejor cuanto mas negativo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 3,3 GB solo para pesos, mas memoria para activaciones y cache KV; un presupuesto realista de 6-8 GB es prudente para secuencias cortas.
- En cuantizacion de 8 bits: aproximadamente 1,7 GB de pesos; en 4 bits, alrededor de 0,9 GB, aunque no se distribuyen cuantizaciones oficiales y habria que generarlas.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) deberia poder ejecutarlo en bf16 para contextos moderados; en entornos de servidor, A100, H100 o L40S ofrecen margen amplio.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas con 8 GB o mas en bf16, y en tarjetas de 6 GB con cuantizacion.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el `custom_code`); no se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura MoE personalizada puede requerir adaptaciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| LoopTitan-MoE18-Layout-1.3B-A0.2B-Muon | 1,65 B | 0,22 B | no disponible | MIT | Hugging Face |
| Modelos MoE pequenos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoria que permitan una comparacion rigurosa. La propia model card ofrece una comparacion interna entre los ocho disenos de la fase 1 y entre AdamW y Muon, pero no frente a modelos externos.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde de forma fiable a peticiones conversacionales ni sigue instrucciones complejas sin fine-tuning previo.
- Riesgo elevado de alucinacion y de generar contenido factualmente incorrecto, inherente a un modelo base entrenado sobre corpus web.
- Sesgos potenciales heredados de DCLM-baseline: sesgos de genero, raza, ideologia y geografia presentes en datos web filtrados; no se documenta ninguna mitigacion.
- Idiomas soportados no documentados; el rendimiento fuera del ingles es incierto.
- Longitud de contexto no especificada, lo que impide planificar despliegues con ventanas largas.
- Requiere `trust_remote_code=True` por el `custom_code` del repositorio, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de usarlo en produccion.
- No se distribuyen cuantizaciones oficiales ni se documenta compatibilidad con motores de inferencia habituales (vLLM, llama.cpp, TGI), lo que anade trabajo de integracion.
- La licencia MIT permite uso comercial, pero la ausencia de evaluaciones de seguridad y de benchmarks estandar desaconseja su uso directo en produccion sin validacion adicional.
- El numero de descargas y likes es muy bajo, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE18-Layout-1.3B-A0.2B-Muon
- Pagina del proyecto LoopTitan: https://datamllab.github.io/LoopTitan/
- Repositorio de codigo: https://github.com/datamllab/LoopTitan
- Documentacion: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados de la fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Coleccion de modelos de la fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
