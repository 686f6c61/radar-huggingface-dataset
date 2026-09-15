# bazobehram/devim-336m-research

## Resumen

DEVİM 336M Research es una ficha de investigación publicada por Behram Bazo (usuario `bazobehram` en HuggingFace) dentro del programa DEVİM, descrito por su autor como un programa de investigación de modelos de lenguaje con el turco como idioma prioritario. El repositorio no contiene un modelo listo para uso: es la tarjeta pública de una sonda experimental de escala controlada de aproximadamente 336 millones de parámetros, diseñada para comparar su comportamiento con una variante emparejada de 110 millones bajo un protocolo preregistrado.

Técnicamente se trata de un Transformer causal denso (decoder-only) convencional, con 24 capas, `d_model` de 1024, 16 cabezas de atención, vocabulario de 32.768 entradas y una longitud de contexto de solo 512 tokens. El autor lo describe explícitamente como un "sustrato experimental controlado", no como un compromiso arquitectónico permanente. El entrenamiento de la fase Gate-B alcanzó 36.755 pasos de optimizador y 1.200.012.349 tokens supervisados, con un alcance de entrenamiento limitado a la fase-P "natural-only".

La relevancia del repositorio es metodológica más que de producto: el resultado formal de la compuerta Gate-B es `GATE_B_CAPACITY_EFFECT_NOT_ESTABLISHED_OPEN_ARCHITECTURE_DESIGN_GATE`, con `capacity_effect_supported: false`. Es decir, el aumento de parámetros de 110M a 336M mejoró algunas lecturas (FORM y controles positivos) pero no alcanzó el efecto de capacidad preregistrado, lo que abre una fase de diseño de arquitecturas alternativas. No se han liberado pesos, checkpoints ni estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (decoder-only) |
| Parametros totales | 336.390.144 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no se han liberado pesos) |
| Idiomas soportados | Turco (tr) |
| Licencia | No disponible para pesos y artefactos; el texto de investigación del repositorio se declara bajo CC BY 4.0 salvo indicación contraria |
| Formato de pesos | No disponible (los pesos no están publicados) |
| Capas | 24 |
| `d_model` | 1024 |
| Cabezas de atencion | 16 |
| Tamano de vocabulario | 32.768 |
| Alcance de entrenamiento | Fase-P, natural-only |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Transformer causal estándar sin variantes híbridas ni mecanismos de atención lineal: 24 capas, dimensión de modelo 1024, 16 cabezas de atención (64 dimensiones por cabeza) y vocabulario de 32.768 tokens. El autor insiste en que esta configuración es un sustrato de control para comparaciones emparejadas a escala, no una apuesta arquitectónica definitiva. El contexto de 512 tokens es deliberadamente corto y coherente con un banco de pruebas de investigación más que con un modelo de producción.

En cuanto al entrenamiento, la fase Gate-B acumuló 36.755 pasos de optimizador y 1.200.012.349 tokens supervisados en la modalidad "natural-only Phase-P". No se especifican en la información disponible la composición del dataset, la mezcla de datos, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. La comparación se realiza contra un modelo emparejado de 110M bajo el mismo protocolo, con métricas internas de amplitud (breadth), terminación (FORM EOS), repetición (FORM repetition), una batería denominada V1.8 y controles positivos. El resultado preregistrado exigía un delta de amplitud de +0,20 y un mínimo de 0,45 en la familia breadth para el modelo de 336M; los valores obtenidos fueron +0,096875 y 0,15 respectivamente.

## Capacidades

Advertencia previa: al no haberse liberado pesos ni checkpoints, ninguna de las capacidades siguientes puede verificarse de forma independiente ni utilizarse hoy mediante inferencia.

- Generación de texto en turco: el pipeline declarado es `text-generation` y el entrenamiento es de modelado de lenguaje causal de próxima palabra.
- Modelado de lenguaje causal: arquitectura decoder-only orientada a predicción autorregresiva.
- Terminación de secuencia: la métrica FORM EOS pasó de 0,8333333 en el modelo de 110M a 0,96875 en el de 336M, lo que indica una mejora medida en la capacidad de cerrar secuencias correctamente.
- Reducción de repetición: FORM repetition bajó de 0,1666667 (110M) a 0,0416667 (336M) en la comparación emparejada.
- Capacidades de "amplitud" (breadth): macro de 0,4333333 en el modelo de 336M frente a 0,3364583 en el de 110M, por debajo del umbral preregistrado.
- Controles positivos: macro de 0,8571429 en 336M frente a 0,7142857 en 110M.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo está etiquetado exclusivamente como turco (`tr`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Razonamiento, código y matemáticas: no disponible; no se han publicado evaluaciones específicas de estas áreas.

## Casos de uso

- Investigación sobre escalado de capacidad en turco: el modelo sirve como sustrato de control para comprobar si el aumento de parámetros explica por sí solo la aparición de una capacidad objetivo. El resultado negativo de Gate-B lo convierte en evidencia directa para este caso de uso.
- Línea base emparejada en experimentos de arquitectura: su diseño de 24 capas, `d_model` 1024 y 512 tokens de contexto permite construir comparaciones controladas contra alternativas arquitectónicas con el mismo presupuesto de cómputo.
- Estudio de tokenización para lenguas aglutinantes: el vocabulario de 32.768 entradas sobre turco es un punto de partida concreto para analizar la eficiencia de segmentación en una lengua con morfología rica.
- Evaluación de patologías de generación: las métricas FORM EOS y FORM repetition permiten estudiar terminación de secuencia y bucles repetitivos en modelos pequeños, un fenómeno relevante para el ajuste de modelos mayores.
- Reproducibilidad metodológica: el repositorio documenta pasos de optimizador, tokens supervisados y umbrales preregistrados, lo que lo hace útil como plantilla de protocolo experimental para otros grupos.
- Generación de texto turco en entornos de bajos recursos (solo si se liberan pesos): con 336M de parámetros y contexto de 512 tokens, sería desplegable en hardware modesto, pero esta aplicación no es posible actualmente porque no hay pesos publicados.
- Docencia sobre evaluación preregistrada: el caso ilustra cómo un resultado negativo correctamente instrumentado puede ser más informativo que una mejora marginal no verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son mediciones internas de la compuerta Gate-B, comparando el modelo emparejado de 110M con el de 336M bajo el mismo protocolo:

| Medicion | 110M emparejado | 336M emparejado |
|---|---:|---:|
| Breadth macro | 0,3364583 | 0,4333333 |
| FORM EOS | 0,8333333 | 0,96875 |
| FORM repetition | 0,1666667 | 0,0416667 |
| V1.8 macro | 0,44125 | 0,44125 |
| V1.8 competencias por encima del azar | 4 | 4 |
| Positive-control macro | 0,7142857 | 0,8571429 |

Umbrales preregistrados y resultado: delta de breadth de +0,096875 frente al +0,20 exigido; mínimo de la familia breadth de 0,15 frente al 0,45 exigido. Decisión formal del autor: `GATE_B_CAPACITY_EFFECT_NOT_ESTABLISHED_OPEN_ARCHITECTURE_DESIGN_GATE`, con `capacity_effect_supported: false`. Estas cifras proceden del propio autor y no consta revisión por pares ni replicación externa.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Las cifras siguientes son estimaciones aritméticas derivadas del recuento de parámetros (336.390.144) y de la configuración declarada, no datos del autor:

- VRAM para pesos en FP32: aproximadamente 1,35 GB.
- VRAM para pesos en BF16/FP16: aproximadamente 0,67 GB.
- VRAM para pesos en INT8: aproximadamente 0,34 GB.
- VRAM para pesos en INT4: aproximadamente 0,17 GB.
- Caché KV a contexto completo (512 tokens, FP16): aproximadamente 48 MB, calculado como 24 capas × 2 tensores × 16 cabezas × 64 dimensiones de cabeza × 512 tokens × 2 bytes.
- Cabe sin dificultad en GPU de consumo: cualquier GPU con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) debería ser suficiente para pesos en FP16 con margen amplio.
- Inferencia en CPU: viable por el tamaño y el contexto corto, aunque no hay cifras de latencia publicadas.
- GPU de datacenter (A100, H100): sobredimensionadas para este modelo; solo tendrían sentido para entrenamiento o para lotes muy grandes.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, transformers): no confirmadas por el autor, y en cualquier caso no aplicables hoy porque no se han liberado pesos ni formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La única comparación documentada es interna, entre el modelo emparejado de 110M y el de 336M bajo el mismo protocolo Gate-B:

| Criterio | DEVİM 336M (emparejado) | DEVİM 110M (emparejado) |
|---|---:|---:|
| Parametros | 336.390.144 | 110M (valor exacto no disponible) |
| Breadth macro | 0,4333333 | 0,3364583 |
| Positive-control macro | 0,8571429 | 0,7142857 |
| V1.8 macro | 0,44125 | 0,44125 |
| Idiomas | Turco | Turco |
| Contexto | 512 | No disponible |

No se proporciona información sobre modelos externos comparables de tamaño similar (por ejemplo, otros modelos turcos de ~300M) ni resultados de benchmarks estándar que permitan una comparación cruzada. Por tanto, la comparación con alternativas del mismo tamaño o de la misma tarea queda como no disponible.

## Limitaciones y advertencias

- Los pesos no están liberados: no es un modelo open-weight ni open-source, y el propio autor pide explícitamente que no se describa como tal.
- Licencia de pesos no especificada: la licencia de los artefactos futuros queda por definir; solo el texto de investigación se declara bajo CC BY 4.0 salvo indicación contraria, lo que impide cualquier uso comercial actual.
- Contexto muy limitado: 512 tokens restringen tareas de contexto largo, resumen de documentos extensos o conversaciones multi-turno prolongadas.
- Monolingüe: etiquetado únicamente para turco; no hay evidencia de capacidades en castellano ni en otros idiomas.
- Resultado científico negativo o no concluyente: el efecto de capacidad preregistrado no se estableció (`capacity_effect_supported: false`), por lo que atribuir capacidades al tamaño del modelo carece de respaldo en estos datos.
- Mediciones internas sin revisión externa: las cifras de Gate-B proceden del autor, no de benchmarks estandarizados ni de replicación independiente.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible; en un modelo de 336M entrenado sobre 1.200 millones de tokens, el riesgo esperable es alto, pero no hay mediciones que lo cuantifiquen.
- Sesgos conocidos: no documentados, aunque un corpus "natural-only" en turco sin filtrado descrito puede arrastrar sesgos del material de origen.
- Corpus restringido por derechos: parte del texto de entrenamiento no se publica, lo que limita la auditoría de datos y la reproducibilidad completa.
- Ausencia de artefactos de evaluación: los elementos del evaluador son privados, de modo que las métricas no pueden recalcularse de forma independiente.
- Estado temporal: la ficha indica fechas de creación y actualización de septiembre de 2026, lo que debe interpretarse como la información tal y como figura en el repositorio.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/bazobehram/devim-336m-research
- Proyecto DEVİM: https://devim.org
- Fuente del proyecto: https://devim.org
- Responsable de investigación: Behram Bazo (`bazobehram`)
- Paper, repositorio de código, demo o dataset asociados: no disponibles en la información proporcionada.
