# elrashid/sae-gemma-4-e2b-it-topk-l17

## Resumen

`elrashid/sae-gemma-4-e2b-it-topk-l17` es un autoencoder disperso (sparse autoencoder, SAE) de tipo TopK entrenado sobre la activacion del flujo residual de la capa 17 del modelo `google/gemma-4-E2B-it`. No es un modelo generativo: es una herramienta de interpretabilidad mecanicista que descompone las activaciones internas del modelo base en un diccionario sobredimensionado de caracteristicas dispersas y monitorizables. Lo desarrolla M. Elrashid (BUiD) como material experimental del trabajo "The Refusal Slope: A Mechanistic Taxonomy of Feature Fate in Quantized Edge Intelligence".

El SAE mapea una entrada de dimension 1536 (d_in, la anchura del flujo residual de Gemma-4-E2B-it) a un espacio latente de 24576 caracteristicas (d_sae), activando como maximo k=64 por token. Se entrena con la receta v2 del autor (BOS-drop y estandarizacion por dimension) sobre el dataset `monology/pile-uncopyrighted`, y alcanza un FVU (fraction of variance unexplained) de 0.3229. Su relevancia actual reside en el estudio del destino de caracteristicas bajo cuantizacion en modelos de borde: permite rastrear que rasgos del modelo (incluidos los asociados a rechazo) sobreviven o se degradan al cuantizar.

El repositorio es pequeno (0.3 GB), esta empaquetado en PyTorch y tiene acceso restringido (gated) en Hugging Face. La ficha de Hugging Face declara licencia MIT, aunque el listado de ficheros muestra `License:apache-2.0`; conviene verificar la licencia efectiva antes de reutilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder TopK sobre flujo residual (layer 17) |
| Parametros totales | no disponible (d_in=1536, d_sae=24576; el recuento exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (herramienta de interpretabilidad, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el SAE se usa para estudiar cuantizacion del modelo base, no se publican cuantizaciones propias) |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados) |
| Licencia | MIT segun la model card; el arbol de ficheros muestra apache-2.0 (verificar) |
| Formato de pesos | PyTorch (libreria `pytorch`; no se detalla safetensors/GGUF) |

Parametros adicionales del SAE: `d_in=1536`, `d_sae=24576`, `k=64`, `FVU=0.3229`, capa 17, receta v2 (BOS-drop + estandarizacion por dimension), dataset `monology/pile-uncopyrighted`.

## Arquitectura y entrenamiento

El artefacto es un autoencoder disperso con activacion TopK: dado un vector de activacion residual de 1536 dimensiones extraido de la capa 17 de Gemma-4-E2B-it, lo proyecta a 24576 caracteristicas latentes y retiene solo las k=64 de mayor magnitud, reconstruyendo despues la activacion original. Esta restriccion TopK impone dispersión exacta y evita el colapso de caracteristicas tipico de los SAE con penalizacion L1. El factor de expansion es de 16x (24576/1536).

El entrenamiento sigue la "receta v2" del autor, que incorpora BOS-drop (descarte del token de inicio de secuencia para evitar que las activaciones artificiales contaminen el diccionario) y estandarizacion por dimension de las activaciones. Los datos de entrenamiento provienen de `monology/pile-uncopyrighted`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas adicionales de regularizacion. El FVU de 0.3229 cuantifica la fraccion de varianza no explicada por la reconstruccion.

## Capacidades

- Extraccion e interpretacion de caracteristicas del flujo residual de la capa 17 de Gemma-4-E2B-it.
- Descomposicion dispersa de activaciones en un diccionario de 24576 caracteristicas con k=64 activas por token.
- Analisis mecanicista de rasgos asociados a rechazo (refusal) y su destino bajo cuantizacion.
- Soporte para estudios de seguridad e interpretabilidad (ai-safety, mechanistic-interpretability).
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision por si mismo.
- No soporta tool calling, function calling ni comportamiento agentico.
- Capacidades multilingues: no aplica directamente (dependen del modelo base subyacente).

## Casos de uso

- Analisis de rasgos de rechazo: el SAE permite aislar caracteristicas de la capa 17 correlacionadas con comportamientos de refusal y estudiar como se atenuan o desaparecen al cuantizar Gemma-4-E2B-it a menores precisiones.
- Auditoria de seguridad en modelos de borde: al inspeccionar que caracteristicas sobreviven a la cuantizacion, un equipo de seguridad puede evaluar si los mecanismos de rechazo se degradan en despliegues edge.
- Investigacion en interpretabilidad mecanicista: sirve como componente de pipelines que descomponen activaciones en caracteristicas interpretables para estudiar circuitos internos del modelo base.
- Deteccion de caracteristicas anomalas: monitorizar activaciones del diccionario para identificar rasgos activados de forma atipica en entradas concretas.
- Estudio comparativo de recetas de SAE: el uso de la receta v2 (BOS-drop + estandarizacion) permite comparar el FVU y la calidad de caracteristicas frente a otras variantes.
- Base para experimentos de steering o edicion de activaciones: las direcciones latentes del SAE pueden emplearse para intervenir sobre el comportamiento del modelo base en investigacion controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico metrique reportado es el FVU de reconstruccion del propio SAE (0.3229) sobre la capa 17.

## Requisitos de hardware

- El repositorio ocupa 0.3 GB; la inferencia del SAE requiere cargar el modelo base Gemma-4-E2B-it para extraer activaciones de la capa 17.
- VRAM para el SAE: modesta (matrices de 1536x24576 en precision completa equivalen aproximadamente a 150 MB en fp32); el cuello de botella es el modelo base.
- VRAM para el modelo base: no disponible en la informacion proporcionada (depende del tamano de Gemma-4-E2B-it y de la cuantizacion empleada).
- GPU recomendadas: no disponible; para el SAE basta una GPU consumer, pero el modelo base condiciona el requisito real.
- Opciones de despliegue: PyTorch (libreria declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | d_in / d_sae / k | Capa | FVU | Licencia | Acceso |
|---|---|---|---|---|---|---|
| elrashid/sae-gemma-4-e2b-it-topk-l17 | SAE TopK | 1536 / 24576 / 64 | 17 | 0.3229 | MIT (verificar) | Gated |
| Otros SAE sobre Gemma | SAE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de SAE comparables publicados sobre el mismo modelo base ni de sus metricas, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Es una herramienta de interpretabilidad, no un modelo generativo: no debe usarse para tareas de produccion como generacion o razonamiento.
- El FVU de 0.3229 implica que una fraccion relevante de la varianza de las activaciones no se reconstruye; las caracteristicas no capturan la totalidad de la representacion.
- Entrenado unicamente sobre la capa 17 y sobre `monology/pile-uncopyrighted`, lo que limita la generalizacion a otros dominios, capas o idiomas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga.
- Ambiguedad de licencia: la model card declara MIT, mientras que el arbol de ficheros muestra apache-2.0; verificar antes de uso comercial.
- Las capacidades multilingues y de sesgo heredan las del modelo base y no estan documentadas en este repositorio.
- Riesgo de interpretacion erronea: las caracteristicas de un SAE son aproximaciones y no deben tratarse como explicaciones causales sin validacion adicional.
- Sin descargas ni likes registrados y creado/actualizado en fechas futuras respecto al conocimiento estandar; tratar los metadatos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/elrashid/sae-gemma-4-e2b-it-topk-l17
- Arbol de ficheros: https://huggingface.co/elrashid/sae-gemma-4-e2b-it-topk-l17/tree/main
- DOI: 10.57967/hf/9445
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
