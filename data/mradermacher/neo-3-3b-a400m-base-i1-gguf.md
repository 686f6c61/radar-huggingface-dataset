# mradermacher/neo-3-3B-A400M-Base-i1-GGUF

## Resumen

El modelo neo-3-3B-A400M-Base-i1-GGUF es una cuantizacion en formato GGUF del modelo base `aquilesfd/neo-3-3B-A400M-Base`, realizada por mradermacher. Se trata de un modelo de arquitectura MoE (Mixture of Experts) de 3,1 mil millones de parametros totales, entrenado mediante continual pretraining sobre una combinacion de datos sinteticos y reales orientados a codigo, matematicas y razonamiento. La cuantizacion con imatrix (i1) mejora la calidad de los quants de baja precision, lo que lo hace adecuado para despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en que ofrece capacidades de razonamiento, codigo y matematicas en un tamano compacto, con licencia MIT, lo que permite uso comercial sin restricciones. Al estar disponible en multiples niveles de cuantizacion (desde IQ1_S hasta Q6_K), se puede ejecutar en hardware muy variado, desde CPU hasta GPU de gama media. El repositorio incluye 22 archivos GGUF con distintos niveles de compresion, ademas del archivo imatrix para que los usuarios puedan generar sus propias cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) |
| Parametros totales | 3.109.670.208 (3,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_S, i1-IQ3_XS, i1-Q2_K, i1-Q3_K_S, i1-IQ3_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q3_K_M, i1-Q4_0, i1-Q3_K_L, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `aquilesfd/neo-3-3B-A400M-Base` emplea una arquitectura MoE con un total de 3,1 mil millones de parametros. El etiquetado como "A400M" sugiere una configuracion de expertos activos por token de aproximadamente 400 millones de parametros, aunque este dato no se confirma explicitamente en la informacion disponible. La arquitectura MoE permite activar solo un subconjunto de los parametros totales por token, lo que reduce el coste computacional en inferencia.

El entrenamiento se realizo mediante continual pretraining sobre una mezcla de datasets publicos y sinteticos: Wikipedia (NeuML/wikipedia-20250123 y wikimedia/wikipedia), cosmopedia, smoltalk, finemath, the-stack y github-code. Esta combinacion indica un enfasis en razonamiento, matematicas, codigo y capacidad de seguir instrucciones. No se menciona el uso de RLHF o DPO en la informacion disponible.

La cuantizacion realizada por mradermacher utiliza la tecnica imatrix, que mejora la calidad de los quants de baja precision al ponderar la importancia de cada capa. Los archivos i1-* emplean una version mejorada de la cuantizacion IQ (i-quant) con activaciones de baja precision, lo que ofrece mejor calidad que los quants estaticos equivalentes.

## Capacidades

- Generacion de texto en ingles con razonamiento multi-step.
- Generacion de codigo fuente, gracias al entrenamiento con the-stack y github-code.
- Resolucion de problemas matematicos, apoyado en el dataset finemath.
- Seguimiento de instrucciones (instruction-following) gracias al entrenamiento con smoltalk.
- Razonamiento logico y analitico, reforzado por cosmopedia y los datos sinteticos.
- Capacidad de conversacion (etiqueta conversational), aunque el modelo es una base sin ajuste fino instructivo.
- No se indica soporte de tool calling, function calling, vision ni audio.

## Casos de uso

- **Generacion de codigo en entornos con recursos limitados**: al ser un modelo de 3,1 B con cuantizaciones desde 1,5 GB, puede ejecutarse en portatiles y maquinas sin GPU dedicada para autocompletado o generacion de fragmentos de codigo.
- **Asistente de matematicas**: su entrenamiento con finemath y cosmopedia lo hace util para resolver problemas de algebra, calculo y logica en aplicaciones educativas o de tutoria.
- **Razonamiento estructurado en pipelines de datos**: el modelo puede generar explicaciones o desglosar problemas complejos en pasos intermedios, util para sistemas de documentacion automatica.
- **Preprocesamiento de texto**: como modelo base, puede usarse para extraer caracteristicas o generar embeddings de texto en sistemas de NLP, dado su tamano reducido.
- **Prototipado rapido de aplicaciones de chat**: aunque es una base, con un ajuste fino adicional podria convertirse en un chatbot ligero para aplicaciones de atencion al cliente en ingles.
- **Experimentacion y aprendizaje**: al ser MIT y con pesos en GGUF, es ideal para estudiantes e investigadores que quieran experimentar con cuantizaciones imatrix y tecnicas de compresion en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el archivo de cuantizacion mas pequeno (i1-IQ1_S, 1,5 GB) puede ejecutarse en sistemas con 4 GB de RAM o VRAM. El mas grande (i1-Q6_K, 3,2 GB) requiere al menos 6-8 GB de VRAM para una ejecucion comoda.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) para los quants mas pequenos; RTX 3060, RTX 4060 o superiores para los quants de mayor calidad.
- **CPU**: los quants de baja precision (IQ1, IQ2, IQ3) pueden ejecutarse en CPU con 8-16 GB de RAM, aunque con menor velocidad.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llamafile, o cualquier runtime compatible con GGUF.
- **Latencia y throughput**: no disponible; dependera del hardware y el quant elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| neo-3-3B-A400M-Base (este) | 3,1 B (MoE) | no disponible | MIT | GGUF | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5 B (dense) | 32 K | Apache 2.0 | safetensors, GGUF | HuggingFace |
| Phi-3-mini-4k-instruct | 3,8 B (dense) | 4 K | MIT | safetensors, GGUF | HuggingFace |

La comparativa es limitada porque no se dispone de benchmarks ni de la longitud de contexto del modelo. En cuanto a licencia, el modelo Neo 3 es el mas permisivo (MIT) junto con Phi-3. En cuanto a tamano, es comparable a Phi-3-mini, aunque el uso de MoE podria ofrecer ventajas de velocidad en inferencia.

## Limitaciones y advertencias

- **Sesgos**: al ser un modelo base entrenado con datos de codigo y matematicas, puede tener sesgos derivados de los datasets de codigo (por ejemplo, sobrerrepresentacion de ciertos lenguajes o estilos de programacion).
- **Riesgo de alucinacion**: como modelo base, no ha sido ajustado para seguridad ni reduccion de alucinaciones; puede generar contenido incorrecto o inventado.
- **Limitaciones de contexto**: no se ha publicado la longitud de contexto, por lo que se desconoce si puede manejar documentos largos.
- **Idioma**: solo se soporta ingles; el rendimiento en otros idiomas es desconocido.
- **Uso comercial**: la licencia MIT permite uso comercial sin restricciones, pero no se incluyen garantias de seguridad o responsabilidad.
- **Modelo base**: no esta ajustado para instrucciones, por lo que puede que no siga comandos de forma natural; se recomienda ajuste fino para aplicaciones de conversacion.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/mradermacher/neo-3-3B-A400M-Base-i1-GGUF)
- [Modelo base original](https://huggingface.co/aquilesfd/neo-3-3B-A400M-Base)
- [Modelo estatico GGUF (sin imatrix)](https://huggingface.co/mradermacher/neo-3-3B-A400M-Base-GGUF)
- [Perfil de mradermacher](https://huggingface.co/mradermacher)
- [Solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Pagina de descarga alternativa](https://local-ai-zone.github.io/models/neo-3-3b-a400m-base-i1.html)
