# mamelles/LFM2.5-350M-Wolof-CPT-v3

## Resumen

LFM2.5-350M-Wolof-CPT-v3 es un ajuste por preentrenamiento continuado (*continual pretraining*, CPT) del modelo base LiquidAI/LFM2.5-350M-Base, publicado por el usuario mamelles en HuggingFace. El objetivo declarado es adaptar un modelo de 357.416.704 parametros al wolof (`wo`), una lengua de la familia nigerocongolesa hablada principalmente en Senegal, Gambia y Mauritania, para la que existen pocos recursos de modelado de lenguaje.

El artefacto se presenta en su propia model card como "private production artifact" experimental, con uso previsto limitado a investigacion privada y evaluacion de adaptacion al wolof. No es, por tanto, un lanzamiento publico estable, y no se declara ninguna reclamacion de calidad al margen de las puertas automaticas registradas en `training_manifest.json`. El autor tampoco publica la licencia bajo la que se distribuye.

La relevancia del modelo reside en que cubre uno de los idiomas con menor representacion en el ecosistema de modelos abiertos, apoyandose en la arquitectura LFM2 (tag `lfm2`) de Liquid AI. Los unicos datos de rendimiento disponibles corresponden a una evaluacion sobre un corpus de test de wolof verbalizado, con 1,5463 bits por byte (BPB), perplejidad 14,0, BLEU 1,82 y chrF 16,22, declarados por el autor y sin verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (tag `lfm2`); detalles concretos no disponibles en la informacion proporcionada |
| Parametros totales | 357.416.704 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | wolof (`wo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Familia de tokenizer | 65k-ext |
| Modelo base | LiquidAI/LFM2.5-350M-Base |
| Etapa de entrenamiento | CPT (preentrenamiento continuado) |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

El modelo se basa en LiquidAI/LFM2.5-350M-Base y emplea la arquitectura de la familia LFM2 (Liquid Foundation Model 2), segun el tag declarado en HuggingFace. La informacion proporcionada no detalla la composicion interna de capas, el tipo de atencion ni si se trata de una arquitectura hibrida (convolucion + atencion) o de un transformer convencional, por lo que esos extremos quedan como no disponibles.

El entrenamiento corresponde a una etapa de preentrenamiento continuado sobre un corpus de wolof limpiado, siguiendo un "protocolo de corpus de wolof" que el autor menciona pero no documenta en detalle. Los datos de instrucciones, si los hay, se reponderan y excluyen el split de test del Hub de origen, aunque el propio autor advierte de que pueden haber existido ejemplos similares a los de evaluacion en el preentrenamiento previo (*upstream*). No se declara el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni el numero exacto de tokens de entrenamiento. La model card tampoco proporciona informacion sobre innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto causal en wolof (`wo`), que es el unico idioma declarado.
- Modelado de lenguaje de dominio linguistico wolof tras el preentrenamiento continuado, orientado a evaluar la adaptacion al idioma.
- Conversacion basica: el modelo incluye el tag `conversational`, aunque la model card no describe un formato de chat ni un ajuste por instrucciones especifico.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para inferencia gestionada.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad de vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades multilingues mas alla del wolof.

## Casos de uso

- Investigacion linguistica sobre wolof: el modelo puede emplearse como base para estudiar la cobertura lexica y morfologica del wolof en modelos de lenguaje, dado su ajuste especifico al idioma.
- Evaluacion de tecnicas de preentrenamiento continuado: sirve como referencia para comparar estrategias de adaptacion de un modelo base de 350M a una lengua de bajos recursos.
- Generacion de texto de dominio general en wolof: util para producir borradores o frases de ejemplo en tareas de baja exigencia, siempre con revision por hablantes nativos.
- Base para posteriores ajustes supervisados: al ser un artefacto CPT, puede actuar como punto de partida de un futuro ajuste por instrucciones en wolof.
- Creacion de corpus sinteticos de apoyo: permite ampliar conjuntos de datos en wolof para tareas de traduccion automatica o clasificacion, con cautela por el riesgo de alucinacion.
- Investigacion academica sobre lenguas de bajos recursos: encaja en estudios comparativos de representacion de idiomas minorizados en modelos abiertos de tamano reducido.
- Prototipado local en hardware modesto: con 357 millones de parametros, permite experimentar con generacion de texto en wolof en portatiles o GPUs de consumo, sin costes de infraestructura elevados.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model card y en el `model-index`; no estan verificados de forma independiente. El conjunto de evaluacion es "Wolof CLM corpus test (verbalized)".

| Metrica | Valor | Nota |
|---|---:|---|
| Bits Per Byte (BPB) | 1,5463 | Metrica de referencia entre tokenizers |
| Perplexity | 14,0 | Comparable solo con el mismo tokenizer |
| BLEU | 1,82 | Sobre 100 pares verbalizados |
| chrF | 16,22 | Sobre 100 pares verbalizados |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB solo para los pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en fp32: aproximadamente 1,4 GB solo para los pesos.
- VRAM estimada en int8: alrededor de 0,35 GB; en int4, alrededor de 0,18 GB (estimaciones teoricas a partir de los 357 millones de parametros, no confirmadas por el autor).
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU con cuantizacion.
- GPU de clase profesional (A100, H100) no son necesarias para inferencia; solo tendrian sentido para reentrenamiento o despliegue de alto throughput.
- Opciones de despliegue: al ser un modelo de transformers con pesos safetensors, es compatible con `transformers`, y previsiblemente con TGI y vLLM; no se confirma soporte de llama.cpp ni de Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables de wolof en la informacion proporcionada. Como referencias minimas se pueden citar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-Wolof-CPT-v3 | 357.416.704 | no disponible | no disponible | Objeto de esta ficha; ajuste CPT en wolof |
| LiquidAI/LFM2.5-350M-Base | no disponible | no disponible | no disponible | Modelo base sin adaptacion a wolof |
| Tonic/LFM2.5-350M-Wolof-CPT-v3 | no disponible | no disponible | no disponible | Variante de la misma familia citada como fuente de la evaluacion |

No se dispone de comparativas con otros modelos de wolof de tamano similar ni con resultados verificados de forma independiente.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo describe como "private production artifact" y advierte de que no es un lanzamiento publico estable.
- Sesgos conocidos: no documentados; el autor no realiza analisis de sesgo.
- Riesgo de alucinacion: no evaluado; la model card no declara validacion de factualidad.
- Validacion incompleta: ortografia del wolof, *code-switching*, factualidad, razonamiento, comportamiento en contexto largo y seguridad no han sido validados de forma exhaustiva.
- Revision por hablantes nativos: el autor la considera necesaria antes de un uso mas amplio.
- Contaminacion potencial: pueden haber existido ejemplos similares a los de evaluacion en el preentrenamiento previo (*upstream*), lo que rebaja la fiabilidad de los benchmarks declarados.
- Comparabilidad de metricas: el propio autor advierte de que la perplejidad solo es comparable dentro del mismo tokenizer, y que la BPB no debe compararse como perplejidad entre las familias de tokenizer de 65k y 128k.
- Licencia: no disponible, por lo que no puede confirmarse la legalidad ni las condiciones del uso comercial.
- Cobertura idiomatica: unicamente wolof; no se declara soporte de otros idiomas.
- Longitud de contexto: no especificada, lo que impide garantizar comportamientos en secuencias largas.
- Idiomasmixtos y registro: al tratarse de un CPT sobre corpus limpiado, el comportamiento ante mezcla de idiomas y registros informales es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mamelles/LFM2.5-350M-Wolof-CPT-v3
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- Metricas declaradas (familia): https://huggingface.co/Tonic/LFM2.5-350M-Wolof-CPT-v3/blob/main/metrics.json

No se han encontrado en la busqueda web enlaces relevantes al modelo; los resultados obtenidos corresponden al termino frances "mamelle" y no guardan relacion con este artefacto.
