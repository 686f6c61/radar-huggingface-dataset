# elrashid/sae-llama-3.1-8b-instruct-topk-l16

## Resumen

El modelo `elrashid/sae-llama-3.1-8b-instruct-topk-l16` no es un modelo de lenguaje generativo, sino un autoencoder disperso (sparse autoencoder, SAE) de tipo TopK entrenado sobre la corriente residual de la capa 16 de `meta-llama/Llama-3.1-8B-Instruct`. Lo desarrolla M. Elrashid (BUiD) como artefacto de interpretabilidad mecanicista: descompone las activaciones del modelo base en un diccionario sobredimensionado de 65.536 caracteristicas dispersas, de las cuales se activan como maximo k=64 por token. Su proposito es permitir el analisis de que caracteristicas internas se activan ante una entrada dada, sirviendo de base para estudios de seguridad y para herramientas de control como puertas de seguridad basadas en caracteristicas.

El artefacto se enmarca en el trabajo "The Refusal Slope: A Mechanistic Taxonomy of Feature Fate in Quantized Edge Intelligence", que estudia como las caracteristicas aprendidas por el SAE se degradan o se conservan cuando el modelo base se cuantiza para despliegue en dispositivos de borde. Esto lo hace relevante para quien investigue la relacion entre cuantizacion, interpretabilidad y comportamiento de rechazo en modelos de 8.000 millones de parametros.

El repositorio ocupa 2,1 GB y contiene unicamente los pesos del SAE en formato PyTorch, no los pesos del modelo Llama-3.1-8B-Instruct. El acceso esta restringido (gated) y requiere aceptar las condiciones en Hugging Face. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder TopK sobre corriente residual (capa 16) |
| Parametros totales | no disponible (dimension de entrada d_in=4096, diccionario d_sae=65536) |
| Parametros activos | k=64 caracteristicas activas por token (TopK) |
| Longitud de contexto | no disponible (depende del modelo base, Llama-3.1-8B-Instruct: 128.000 tokens) |
| Tipos de cuantizacion | no disponible (el SAE se distribuye en pesos PyTorch; el estudio asociado analiza cuantizacion del modelo base) |
| Idiomas soportados | no disponibles (heredados del modelo base Llama-3.1-8B-Instruct) |
| Licencia | MIT |
| Formato de pesos | PyTorch (repo de 2,1 GB) |

## Arquitectura y entrenamiento

El SAE es un autoencoder disperso con un diccionario de 65.536 caracteristicas (d_sae) que mapea activaciones de la corriente residual de la capa 16 (d_in=4096) del modelo Llama-3.1-8B-Instruct. Utiliza una activacion TopK con k=64, de modo que cada token activa como maximo 64 caracteristicas del diccionario, lo que impone una representacion dispersa y facilita la interpretacion de cada unidad. El valor de fraccion de varianza no explicada (FVU) reportado es 0,3371.

El entrenamiento emplea la "receta v2", que incorpora eliminacion del token BOS (BOS-drop) y estandarizacion por dimension (per-dim standardization). El dataset de entrenamiento declarado es `monology/pile-uncopyrighted`. El artefacto se asocia al paper "The Refusal Slope: A Mechanistic Taxonomy of Feature Fate in Quantized Edge Intelligence" (M. Elrashid, BUiD), que analiza el destino de las caracteristicas bajo cuantizacion. No se dispone de mas detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el procedimiento de optimizacion.

## Capacidades

- Extraccion de caracteristicas interpretables de la capa 16 del modelo Llama-3.1-8B-Instruct.
- Analisis de activaciones dispersas por token con un maximo de 64 caracteristicas activas.
- Soporte para estudios de interpretabilidad mecanicista y seguridad de IA.
- Base para construir clasificadores o puertas de seguridad sobre caracteristicas del SAE (el autor publica un artefacto relacionado, `elrashid/gate-llama-3.1-8b-instruct-l16`, que aplica regresion logistica sobre estas caracteristicas para estimar P(harmful)).
- Analisis del efecto de la cuantizacion sobre las caracteristicas aprendidas.
- No genera texto, no soporta tool calling ni razonamiento multi-paso por si mismo; es un componente de analisis.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: descomponer las activaciones de la capa 16 de Llama-3.1-8B-Instruct en caracteristicas monosenmanticas para estudiar que representaciones internas se activan ante distintas entradas.
- Auditoria de seguridad: alimentar las caracteristicas del SAE a un clasificador (como el gate del mismo autor) para estimar la probabilidad de contenido danino antes de que el modelo genere, permitiendo bloquear peticiones en produccion.
- Estudio de cuantizacion: comparar la fidelidad de las caracteristicas del SAE entre el modelo en precision completa y versiones cuantizadas (por ejemplo, 4 bits) para medir que rasgos se pierden en despliegues de borde.
- Analisis de comportamiento de rechazo: identificar que caracteristicas se asocian con respuestas de rechazo y como varian segun la cuantizacion, tal como propone el paper asociado.
- Depuracion de modelos: localizar caracteristicas activadas por entradas anomalas o por prompts adversarios para diagnosticar fallos del modelo base.
- Docencia y formacion: usar el SAE como ejemplo practico de diccionarios dispersos y analisis de circuitos en cursos de interpretabilidad.
- Investigacion de alineamiento: estudiar correlaciones entre caracteristicas y comportamientos no deseados para informar tecnicas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la fraccion de varianza no explicada (FVU) del SAE, de 0,3371.

## Requisitos de hardware

- El SAE requiere cargar el modelo base Llama-3.1-8B-Instruct para extraer activaciones; el SAE en si ocupa 2,1 GB en precision completa (d_in x d_sae = 4096 x 65536).
- Para inferencia del modelo base en FP16 se estiman unos 16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 o H100 para analisis a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para el modelo base en FP16; GPUs consumer de 8-12 GB solo con cuantizacion.
- El SAE puede ejecutarse en CPU para analisis de activaciones puntuales, aunque el cuello de botella es la extraccion de activaciones del modelo base.
- Opciones de despliegue: PyTorch (libreria declarada), con integracion en pipelines de Hugging Face Transformers; para servir el modelo base, vLLM, TGI o llama.cpp segun la cuantizacion.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension | k | Modelo base | Licencia |
|---|---|---|---|---|---|
| elrashid/sae-llama-3.1-8b-instruct-topk-l16 | SAE TopK | d_in=4096, d_sae=65536 | 64 | Llama-3.1-8B-Instruct, capa 16 | MIT |
| elrashid/gate-llama-3.1-8b-instruct-l16 | Clasificador sobre SAE | sobre caracteristicas del anterior | no disponible | Llama-3.1-8B-Instruct, capa 16 | no disponible |
| SAEs publicos de Llama-3.1-8B (otros autores) | SAE | no disponible | no disponible | Llama-3.1-8B | no disponible |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para generar texto, responder preguntas ni ejecutar agentes de forma autonoma.
- El acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.
- El SAE esta entrenado exclusivamente sobre la capa 16 del modelo base; no cubre otras capas ni otros modelos.
- La FVU de 0,3371 indica que una parte sustancial de la varianza de las activaciones no queda explicada por el diccionario, lo que limita la fidelidad de la interpretacion.
- Los resultados dependen de la version y configuracion exacta del modelo base; cambios en el modelo o en la tokenizacion pueden invalidar las caracteristicas.
- El dataset de entrenamiento (`monology/pile-uncopyrighted`) puede contener sesgos que se reflejen en las caracteristicas aprendidas.
- No se dispone de informacion sobre sesgos especificos, idiomas cubiertos ni evaluaciones de robustez.
- La licencia MIT del artefacto no exime de cumplir la licencia del modelo base Llama-3.1-8B-Instruct, que tiene sus propias condiciones de uso.
- Uso en produccion como puerta de seguridad: requiere validacion independiente, ya que no se han publicado metricas de precision o recall del clasificador asociado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/elrashid/sae-llama-3.1-8b-instruct-topk-l16
- Puerta de seguridad relacionada: https://huggingface.co/elrashid/gate-llama-3.1-8b-instruct-l16
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
- DOI asociado: 10.57967/hf/9447
