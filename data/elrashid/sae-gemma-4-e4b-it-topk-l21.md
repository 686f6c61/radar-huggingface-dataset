# elrashid/sae-gemma-4-e4b-it-topk-l21

## Resumen

El modelo `elrashid/sae-gemma-4-e4b-it-topk-l21` no es un modelo de lenguaje generativo, sino un **autoencoder disperso (SAE, sparse autoencoder) de tipo TopK** entrenado sobre las activaciones del flujo residual de la capa 21 de `google/gemma-4-E4B-it`. Lo desarrolla el investigador M. Elrashid (BUiD) como artefacto de interpretabilidad mecanística para el trabajo *The Refusal Slope: A Mechanistic Taxonomy of Feature Fate in Quantized Edge Intelligence*. Su funcion es descomponer las representaciones internas del modelo base en caracteristicas dispersas y monitorizables.

El SAE toma activaciones de dimension 2560 (`d_in=2560`) y las proyecta a un diccionario de 40960 caracteristicas (`d_sae=40960`), manteniendo activas como maximo `k=64` en cada paso (TopK). Se entreno con la receta v2 del autor, que incorpora eliminacion del token BOS y estandarizacion por dimension, y alcanza un FVU (fraction of variance unexplained) de 0,2717. El repositorio ocupa 0,8 GB y se distribuye en formato PyTorch bajo licencia MIT, con acceso restringido (gated) en Hugging Face.

Su relevancia es doble: por un lado, permite estudiar que caracteristicas internas del Gemma 4 E4B se ven afectadas al cuantizar el modelo para despliegue en dispositivos de borde; por otro, sirve de base para un clasificador logistico de seguridad (`gate-gemma-4-e4b-it-l21`) que puntua la probabilidad de que un prompt sea danino antes de generar. No debe confundirse con un LLM: no genera texto por si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso TopK (SAE) sobre flujo residual de transformer |
| Parametros totales | no disponible (dimension de entrada 2560, diccionario 40960, k=64) |
| Parametros activos | 64 caracteristicas activas por token (TopK) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el SAE se distribuye en PyTorch; la cuantizacion aplica al modelo base en el estudio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (repositorio de 0,8 GB) |

## Arquitectura y entrenamiento

El SAE es un autoencoder de una sola capa con activacion TopK: dado un vector de activacion del flujo residual de la capa 21 del modelo base (dimension 2560), lo codifica en un espacio disperso de 40960 dimensiones y retiene unicamente las `k=64` caracteristicas de mayor magnitud, reconstruyendo despues la activacion original. Esta formulacion fuerza dispersidad exacta y evita el colapso de caracteristicas tipico de los SAE con regularizacion L1.

El entrenamiento emplea el dataset `monology/pile-uncopyrighted` y la receta v2 del autor, que combina eliminacion del token BOS y estandarizacion por dimension antes de la codificacion. El resultado es un FVU de 0,2717, metrica que cuantifica la varianza no explicada por la reconstruccion. El SAE se entreno especificamente para el estudio sobre el destino de caracteristicas bajo cuantizacion en inteligencia de borde, comparando el comportamiento de las representaciones del Gemma 4 E4B en precision completa frente a versiones cuantizadas.

## Capacidades

- Descomposicion de activaciones del flujo residual de la capa 21 de `google/gemma-4-E4B-it` en 40960 caracteristicas interpretables.
- Extraccion de caracteristicas dispersas con dispersidad exacta controlada (`k=64`).
- Base para analisis de interpretabilidad mecanistica: identificar caracteristicas asociadas a conceptos, seguridad o comportamiento.
- Soporte para estudios de cuantizacion: permite medir que caracteristicas se degradan o desaparecen al cuantizar el modelo base.
- Integracion con el clasificador de seguridad `gate-gemma-4-e4b-it-l21`, que aplica regresion logistica sobre estas caracteristicas para puntuar P(harmful) de un prompt.
- No genera texto, no soporta tool calling, no tiene capacidades de agente ni multilingues por si mismo.

## Casos de uso

- **Auditoria de seguridad previa a generacion**: usar las caracteristicas del SAE como entrada a un clasificador logistico que puntue el riesgo de un prompt antes de que el modelo base responda, evitando coste de generacion en peticiones peligrosas.
- **Analisis de degradacion por cuantizacion**: comparar las activaciones de la capa 21 en el modelo en fp16 frente a versiones de 8 o 4 bits para identificar que caracteristicas se pierden y como afecta a la calidad.
- **Interpretabilidad mecanistica de Gemma 4 E4B**: localizar caracteristicas asociadas a conceptos concretos (idioma, tema, estilo) y estudiar su activacion en distintos prompts.
- **Investigacion en seguridad de IA**: reproducir y extender la taxonomia del paper *The Refusal Slope* sobre el destino de caracteristicas relacionadas con rechazo en modelos cuantizados.
- **Construccion de filtros de contenido**: entrenar clasificadores ligeros sobre las 40960 caracteristicas para deteccion de toxicidad, jailbreak o contenido no deseado.
- **Depuracion de comportamiento anomalo**: inspeccionar que caracteristicas se activan en respuestas erroneas o alucinadas para diagnosticar la causa interna.
- **Docencia e investigacion en interpretabilidad**: material reproducible para cursos o laboratorios sobre SAE y analisis de representaciones internas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FVU (fraction of variance unexplained) | 0,2717 |
| Dimension de entrada (`d_in`) | 2560 |
| Dimension del diccionario (`d_sae`) | 40960 |
| Dispersidad (`k`) | 64 |
| Capa analizada | 21 (flujo residual) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del SAE: el repositorio ocupa 0,8 GB, por lo que cabe en cualquier GPU consumer con al menos 2 GB libres, aunque la inferencia requiere tambien cargar el modelo base `google/gemma-4-E4B-it` para obtener las activaciones.
- GPU recomendadas para el modelo base: A100, H100 o RTX 4090 para precision completa; RTX 3090 o RTX 4080 para cuantizacion en 8 bits.
- Cabe en GPU consumer: si, el SAE por si solo cabe en cualquier GPU moderna; el modelo base E4B requiere cuantizacion para GPUs de 8-12 GB.
- Opciones de despliegue: PyTorch nativo para el SAE; el modelo base puede servirse con vLLM, TGI o llama.cpp segun cuantizacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension entrada | Diccionario | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `elrashid/sae-gemma-4-e4b-it-topk-l21` | SAE TopK capa 21 | 2560 | 40960 | MIT | Gated en HF |
| `elrashid/gate-gemma-4-e4b-it-l21` | Clasificador logistico sobre SAE | 40960 (caracteristicas) | no aplica | no disponible | HF |
| SAE genericos de Gemma (comunidad) | SAE L1/TopK | variable | variable | variable | HF |

No se dispone de datos comparativos de rendimiento frente a otros SAE en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas; solo transforma activaciones internas.
- El FVU de 0,2717 implica que una parte significativa de la varianza no se reconstruye; las caracteristicas no capturan toda la informacion del flujo residual.
- Especifico de la capa 21 y del modelo `google/gemma-4-E4B-it`; no es transferible a otras capas ni a otros modelos.
- El acceso esta restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- No se han documentado sesgos especificos del SAE, pero hereda los sesgos del dataset Pile-uncopyrighted y del modelo base.
- Riesgo de interpretacion erronea: las caracteristicas dispersas no siempre corresponden a conceptos semanticos claros; requieren validacion empirica.
- La licencia MIT aplica al SAE, pero el uso del modelo base Gemma esta sujeto a los terminos de Google.
- No hay informacion publica sobre latencia, throughput ni comportamiento en produccion.

## Enlaces

- Hugging Face del SAE: https://huggingface.co/elrashid/sae-gemma-4-e4b-it-topk-l21
- Clasificador de seguridad asociado: https://huggingface.co/elrashid/gate-gemma-4-e4b-it-l21
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
- DOI del trabajo: https://doi.org/10.57967/hf/9446
