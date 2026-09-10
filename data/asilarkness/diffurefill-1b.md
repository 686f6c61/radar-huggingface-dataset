# Asilarkness/DiffuRefill-1B

## Resumen

DiffuRefill-1B es un modelo de lenguaje de difusión enmascarada (masked diffusion) de aproximadamente 1.000 millones de parámetros que el usuario Asilarkness está entrenando desde cero. Su rasgo distintivo no es la arquitectura, sino el decodificador: en lugar de generar token a token, produce un borrador de la secuencia completa en unas pocas pasadas paralelas de denoising y después dedica unas cuantas pasadas adicionales a reenmascarar y reescribir únicamente las posiciones en las que el modelo tiene menos confianza («re-infilling dirigido por confianza»). El coste total es de K + R pasadas hacia delante, en el piloto 20, con independencia de la longitud de la secuencia.

El problema que aborda es el coste de inferencia de los modelos autorregresivos, que necesitan una pasada secuencial por token. La tesis del autor es que reparar de forma selectiva un borrador paralelo es más barato que añadir más pasos de denoising, porque una sola pasada de refill puede corregir cualquier número de posiciones a la vez. En el experimento piloto con TinyStories, un modelo de difusión de 37,9 millones de parámetros con esta decodificación igualó la calidad de un autorregresivo de idéntica arquitectura y corpus con una sexta parte de las pasadas.

Es relevante ahora porque se suma a la línea de investigación de modelos de lenguaje de difusión (LLaDA, Dream), pero con un enfoque poco habitual: en lugar de escalar el modelo, optimiza el procedimiento de decodificación y publica tanto los resultados positivos como los negativos. Conviene ser explícito: el estado del repositorio es «training in progress», no hay pesos publicados (0 descargas, 0 likes) y la ficha describe la receta de entrenamiento y unos resultados piloto en un entorno de juguete, no un modelo utilizable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion enmascarada (masked diffusion) con decodificacion paralela y re-infilling dirigido por confianza; 18 capas, dim 2048, 16 cabezas, FFN SwiGLU de 5632 |
| Parametros totales | ~1,0B (planificado) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible: no se han publicado pesos |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible: no se han publicado pesos |
| Vocabulario | 32768 BPE |
| Objetivo de entrenamiento | Masked diffusion, tasa de enmascaramiento t ~ U(0,15, 1), perdida solo en posiciones enmascaradas |
| Corpus | openbmb/Ultra-FineWeb-L3 |
| Estado | Entrenamiento en curso; pesos no publicados |

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar entrenado con un objetivo de difusión enmascarada: se enmascara una fracción aleatoria de posiciones (t ~ U(0,15, 1)) y la pérdida se calcula únicamente sobre esas posiciones, que en promedio representan el 57 % de la secuencia. Al no existir un orden causal, el modelo ve contexto por ambos lados de cada posición, lo que le permite corregir un token teniendo en cuenta simultáneamente lo que hay a su izquierda y a su derecha. El autor elige Ultra-FineWeb-L3 en lugar de sus versiones mayores precisamente por eso: como la señal de entrenamiento procede solo de las posiciones enmascaradas, la calidad por token importa más que el volumen bruto.

La innovación está en el decodificador. El borrador se genera con K=12 pasos de denoising y después se ejecutan R=8 pasadas de refill que toman el 20 % de posiciones generadas menos confiables, las reenmascaran y las vuelven a muestrear. Los dos estadios usan reglas de muestreo deliberadamente distintas (borrador caliente y libre, refill frío y truncado) y tres trucos concretos: orden de desenmascaramiento con ruido Gumbel aneado (evita que la confianza top-k revele primero los tokens fáciles y deje las palabras de contenido para el final), prohibición de vecinos (resta 6,0 al logit del token que ya ocupa la posición inmediatamente a izquierda o derecha, atacando la causa directa de las repeticiones en decodificación paralela) y muestreo dividido por estadios.

| Estadio | Configuracion |
|---|---|
| Borrador | K=12, temperatura 2,2 -> 0,9 aneada, ruido Gumbel 2,5 sobre el orden de desenmascaramiento, sin truncamiento |
| Refill | R=8, p=20 %, temperatura 0,8, min_p=0,10 |
| Ambos | Prohibicion de vecinos: -6,0 al logit del token ya presente a izquierda o derecha |

El entrenamiento se distribuye en una flota de máquinas aisladas de una sola GPU sin interconexión, sincronizadas al estilo DiLoCo a través del Hub: cada trabajador entrena con un shard disjunto y se promedian pesos periódicamente mediante un checkpoint global fusionado. No se documenta ningún uso de RLHF, DPO u otro ajuste por preferencias. El autor reporta también tres vías descartadas: la reparación autorregresiva del borrador (empeoraba respecto a no reparar, porque un modelo AR que puntúa la posición i no ve la posición i+1 y duplica al vecino), el enmascaramiento por tramos contiguos durante el entrenamiento (sin efecto medible) y el auto-repair training (cuatro veces peor en duplicación en su primera formulación; sin ganancia tras corregirlo).

## Capacidades

- Generacion de texto en ingles mediante decodificacion paralela: emite una secuencia completa en un numero fijo de pasadas (~20 en la configuracion del piloto), no en una por token.
- Denoising no autorregresivo con contexto bidireccional, lo que en principio habilita tareas de relleno (infilling) de forma natural.
- Reescritura selectiva de tokens de baja confianza: el mecanismo de refill actua como un corrector interno que revisa el 20 % de posiciones peor puntuadas en cada pasada.
- Control de repeticiones locales mediante la prohibicion de vecinos, pensada para mitigar el fallo caracteristico de la decodificacion paralela.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no; el modelo esta declarado unicamente para ingles.
- Vision, audio, modo thinking u otras capacidades especiales: no documentadas.
- Capacidades de codigo y matematicas: no evaluadas ni documentadas; el corpus es texto web, no codigo.
- Ajuste fino por instrucciones: no documentado; la ficha no menciona ninguna fase de instruccion.

## Casos de uso

- Generacion de texto en ingles con latencia independiente de la longitud: al necesitar un numero fijo de pasadas para toda la secuencia, es adecuado para escenarios donde el coste por token generado debe ser decreciente con la longitud, como la redaccion de parrafos largos o resumenes extendidos.
- Relleno de plantillas y documentos (infilling): al no ser causal, el modelo puede condicionar cada posicion con el contexto a izquierda y derecha, lo que encaja con tareas de completar huecos en textos ya redactados.
- Limpieza y reescritura de corpus en ingles: el mecanismo de refill, que reenmascara y regenera solo las posiciones de baja confianza, se presta a pasar un texto existente por el modelo para suavizar o normalizar fragmentos problematicos.
- Autocompletado con ventana de 2048 tokens: suficiente para parrafos y secciones cortas, no para documentos completos.
- Investigacion en decodificacion paralela: el repositorio publica la configuracion exacta y las ablaciones negativas, lo que lo convierte en una base util para reproducir y extender el metodo de re-infilling sobre otros modelos de difusion.
- Experimentos de entrenamiento descentralizado: la receta DiLoCo sobre GPUs aisladas sincronizadas via Hub es replicable por grupos sin acceso a un cluster con interconexion de alta velocidad.
- Generacion por lotes en hardware modesto: con ~1B de parametros el modelo cabe en GPUs de consumo (ver la seccion de hardware), lo que permite desplegar generacion paralela sin infraestructura de datacenter.
- Generacion de texto sintetico en ingles para aumento de datos: utilizable para producir continuaciones de frases o parrafos, siempre que se valide la calidad con un filtro externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval, MT-Bench u otros) en la informacion disponible. La unica evidencia cuantitativa es el piloto con TinyStories a 37,9M de parametros, comparado mediante un juez independiente (`roneneldan/TinyStories-33M`, ajeno a los dos modelos evaluados) que puntua la NLL de la continuacion generada. Los dos modelos comparados comparten arquitectura y corpus y se entrenaron desde cero.

| Sistema | Pasadas | NLL (menor es mejor) | Tokens duplicados | distinct-2 (mayor es mejor) |
|---|---|---|---|---|
| Texto real | — | 1,15 | 1,38 % | 0,478 |
| Autorregresivo | 128 | 3,08 | 1,64 % | 0,466 |
| Difusion + refill (ajustado) | 20 | 2,87 | 0,30 % | 0,459 |

El autor advierte de que la configuracion ajustada se sobreajusto al split de busqueda: en un split retenido solo se reprodujeron dos de las tres metricas, con la diversidad 0,007 por debajo. Los margenes durante la busqueda fueron de 0,015 nats y 0,001 en distinct-2 sobre 128 muestras.

## Requisitos de hardware

No se documentan requisitos de hardware ni opciones de despliegue en la informacion proporcionada. Las cifras siguientes son estimaciones derivadas del numero de parametros planificado (~1,0B) y deben tratarse como orientativas, no como medidas del autor:

- VRAM estimada para los pesos: ~2,0 GB en bf16/fp16, ~1,0 GB en fp8/int8, ~0,5-0,6 GB en int4. Al no haber pesos publicados ni cuantizaciones anunciadas, estos valores son proyecciones por tamano, no disponibilidad real.
- VRAM estimada total en inferencia: del orden de 3-6 GB en bf16 con lote pequeno y secuencias de 2048 tokens. Al ser decodificacion no causal, no hay cache KV que crezca con la generacion, pero las activaciones de atencion escalan de forma cuadratica con la longitud; con atencion eficiente el pico se mantiene bajo.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 8-12 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- GPU recomendadas para mayor throughput: RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB para servicio por lotes.
- Opciones de despliegue: no disponibles. La ficha no documenta integracion con vLLM, llama.cpp, Ollama, TGI ni SGLang; el bucle borrador + refill con reenmascaramiento selectivo exigiria una implementacion de decodificacion propia sobre el checkpoint.
- Latencia y throughput: no disponibles. El unico dato del autor es el coste en pasadas: 20 pasadas hacia delante para una secuencia completa, con independencia de su longitud.
- Entrenamiento: la receta DiLoCo descrita asume maquinas de una sola GPU sin interconexion, sincronizadas a traves del Hub, lo que rebaja el requisito de infraestructura respecto a un entrenamiento distribuido convencional.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas publicas y no se han verificado en esta busqueda; conviene consultar la ficha oficial de cada uno antes de tomar decisiones.

| Modelo | Parametros | Contexto | Tipo | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| DiffuRefill-1B | ~1,0B | 2048 | Difusion enmascarada + re-infilling | Apache-2.0 | No (entrenamiento en curso) |
| LLaDA-8B | ~8B | 4096 | Difusion enmascarada | MIT (segun su ficha) | Si |
| Dream-7B | ~7B | 2048 | Difusion discreta | Apache-2.0 (segun su ficha) | Si |
| Autorregresivo del piloto | 37,9M | 2048 (TinyStories) | Autorregresivo denso | No disponible | No (experimento interno) |

Frente a LLaDA y Dream, DiffuRefill-1B se situa en un orden de magnitud menos de parametros y con un contexto mas corto, pero compite en el mismo terreno de decodificacion no autorregresiva. Su diferencial no es el modelo, sino el decodificador: los 20 pasadas fijas y la reparacion selectiva de baja confianza. La comparacion de rendimiento con esos modelos no es posible: no hay benchmarks estandar publicados para DiffuRefill-1B y las condiciones del piloto (37,9M de parametros, TinyStories) no son trasladables.

## Limitaciones y advertencias

- No hay pesos publicados. El repositorio esta en estado «training in progress» y la ficha describe una receta, no un artefacto utilizable. Cualquier evaluacion practica es hoy imposible.
- La evidencia empirica es un piloto de 37,9 millones de parametros sobre TinyStories, un corpus de lenguaje muy simple. El propio autor afirma que nada demuestra que los resultados se transfieran a 1B ni a texto natural.
- El juez utilizado para medir la calidad es un modelo autorregresivo. Una NLL baja premia el texto predecible, no necesariamente el texto bueno; de ahi que se reporte la diversidad en paralelo.
- La configuracion de decodificacion esta ajustada por busqueda sobre 128 muestras y muestra signos de sobreajuste: en el split retenido solo se reprodujeron dos de las tres metricas, con la diversidad 0,007 por debajo del umbral.
- La temperatura de borrador llega a 2,2 con ruido Gumbel de 2,5, valores altos que favorecen la exploracion a costa de un mayor riesgo de incoherencia en el borrador inicial; el refill solo corrige el 20 % de posiciones por pasada.
- Solo ingles. No hay soporte multilingue declarado, lo que excluye su uso en castellano sin un ajuste adicional.
- Contexto de 2048 tokens, corto para tareas de documento largo, RAG con muchos fragmentos o conversaciones multi-turno extensas.
- Corpus de origen web (Ultra-FineWeb-L3): cabe esperar sesgos de internet, ruido y posible contenido toxico o degradado, sin que la ficha documente filtrado, mitigaciones ni evaluaciones de sesgo.
- Riesgo de alucinacion: no evaluado. No hay ninguna medicion de factualidad, veracidad ni calibracion.
- Sin benchmarks estandar: se desconoce el rendimiento en razonamiento, matematicas, codigo o seguimiento de instrucciones. Tampoco hay evidencia de tool calling, agentes ni capacidades multimodales.
- La licencia Apache-2.0 permite uso comercial y modificacion, pero al no existir pesos la cuestion es teorica por ahora.
- La decodificacion por borrador y refill no esta soportada de forma nativa por los frameworks de inferencia habituales (vLLM, llama.cpp, Ollama, TGI), lo que anade coste de ingenieria a cualquier despliegue en produccion.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/Asilarkness/DiffuRefill-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Modelo juez del piloto: https://huggingface.co/roneneldan/TinyStories-33M
- Busqueda web: no se han encontrado enlaces relevantes al modelo, al autor ni al metodo. Los unicos resultados devueltos corresponden a paginas de matriculacion de la Universite de Toulon y no guardan relacion con el modelo. No se dispone, por tanto, de paper, blog tecnico, repositorio de codigo ni demo asociados.
