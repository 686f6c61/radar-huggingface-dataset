# ametrick-system/hapadapter-as-h3k4me1

## Resumen
HapAdapter AS-H3K4me1 es un conjunto de cabezas adaptadoras (adapter heads) para predecir desequilibrio alélico (allele-specific binding) en la marca epigenética H3K4me1 sobre genomas personales diploides. Lo desarrolla el usuario ametrick-system y se publica bajo licencia MIT. No es un modelo de lenguaje: es una herramienta de genómica computacional construida sobre el encoder de ADN DNABERT-2 (117M parámetros), y su entrada es un par de ventanas de genoma personal de 257 pb, una por haplotipo, centradas en una variante SNV heterocigota.

El repositorio contiene ocho subcarpetas correspondientes a cuatro donantes (ENC-001 a ENC-004) y dos "brazos" por donante: un tronco (`dnabert2-trunk`) que es el encoder DNABERT-2 afinado para regresar la señal H3K4me1 a partir de la secuencia de referencia, y una cabeza adaptadora (`dnabert2-personal`) entrenada sobre ventanas extraídas del genoma faseado del propio donante y que resuelve su backbone contra el tronco. El tronco puede usarse de forma independiente como predictor de unión.

Su relevancia es acotada pero específica: aborda la predicción de efectos regulatorios de variantes en un contexto diploide y personalizado, un problema donde la mayoría de modelos genómicos trabajan sobre una única secuencia de referencia. El modelo es de tamaño pequeño (repo de 1,9 GB, encoder de 117M), lo que permite inferencia en hardware modesto, y su licencia MIT facilita su reutilización en investigación. La model card indica que el paper está en preparación y que no se duplican cifras de rendimiento por ensayo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer DNABERT-2 (117M) con cabeza siamesa adaptadora sobre embeddings pooled de cada haplotipo |
| Parametros totales | 117M en el encoder DNABERT-2; parámetros de la cabeza adaptadora no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 257 pb exclusivamente (entradas más largas o más cortas quedan fuera de distribución) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (modelo de secuencia de ADN, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es un encoder transformer DNABERT-2 de 117M parámetros, afinado para regresar la señal H3K4me1 a partir de secuencia de referencia (el "tronco"). Sobre ese tronco se monta una cabeza siamesa que recibe dos ventanas de 257 pb, una por haplotipo, obtiene un embedding pooled de cada una y calcula una distancia en el espacio proyectado. La fórmula de lectura documentada es `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`, donde `P` es la proyección del embedding pooled de cada ventana haplotípica. La distancia es simétrica, de modo que la salida es una magnitud de probabilidad de efecto alélico, no una dirección.

El entrenamiento se realiza por checkpoint con un único ensayo y un único donante, usando ventanas cortadas del genoma faseado del donante correspondiente. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). La innovación destacable es el planteamiento diploide: en lugar de predecir sobre una secuencia de referencia consenso, compara dos haplotipos reales de un individuo, lo que permite estimar desequilibrio alélico de forma directa. La carga no se hace mediante `AutoModel`, sino a través del paquete `hapadapter`, que requiere descargar tanto la carpeta `dnabert2-personal` como su tronco `dnabert2-trunk`.

## Capacidades
- Predicción de desequilibrio alélico en H3K4me1 para SNVs heterocigotas en genomas personales diploides.
- Predicción de unión (binding) de H3K4me1 a partir de secuencia de referencia mediante el tronco DNABERT-2 afinado, usable de forma independiente.
- Procesamiento de pares de ventanas genómicas de 257 pb centradas en la variante.
- Generalización reportada a otros donantes de EN-TEx distintos del donante de entrenamiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta visión, audio ni modo thinking.
- No dispone de capacidades multilingües en el sentido habitual; opera sobre alfabeto de ADN.

## Casos de uso
- Priorización de variantes reguladoras en estudios de asociación: dado un conjunto de SNVs heterocigotas, el modelo puntúa la magnitud de desequilibrio alélico esperado en H3K4me1, lo que permite ordenar variantes candidatas antes de validación experimental con reporteros o ChIP-seq alélico.
- Anotación funcional de genomas personales faseados: integrado en un pipeline que recibe VCF faseado y genera ventanas de 257 pb por haplotipo, el modelo añade una capa de predicción epigenética específica del individuo que los catálogos de referencia no capturan.
- Filtrado previo a validación experimental: al ser un modelo de 117M y licencia MIT, puede ejecutarse en local para descartar variantes con baja probabilidad de efecto alélico antes de costosos ensayos de laboratorio.
- Investigación en arquitectura de la cromatina: el tronco `dnabert2-trunk` sirve como predictor de señal H3K4me1 desde secuencia, útil para estudiar cómo la secuencia primaria determina la deposición de esta marca en regiones enhancer.
- Benchmarking de modelos genómicos: el diseño siames con lectura simétrica y ventanas fijas de 257 pb constituye una referencia reproducible para comparar otros enfoques de predicción de efectos de variantes en contexto diploide.
- Análisis comparativo entre donantes: al incluir cuatro donantes (ENC-001 a ENC-004) con tronco y cabeza personal, permite estudiar hasta qué punto los efectos alélicos predichos son dependientes del individuo frente a generalizables.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper en preparación e indica explícitamente que las cifras por ensayo no se duplican en el repositorio.

## Requisitos de hardware
- VRAM estimada para inferencia: el encoder DNABERT-2 de 117M ocupa del orden de 0,5 GB en fp32 y menos de 0,3 GB en fp16; sumando la cabeza adaptadora, la huella es inferior a 1 GB. El repo completo pesa 1,9 GB por incluir ocho checkpoints.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo es tan pequeño que la GPU no es un cuello de botella.
- Cabe holgadamente en GPU de consumo e incluso en CPU para lotes pequeños.
- Opciones de despliegue: carga mediante el paquete `hapadapter` (`load_model_and_tokenizer`) sobre `transformers`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HapAdapter AS-H3K4me1 | 117M (encoder DNABERT-2) | 257 pb por haplotipo (par) | Desequilibrio alélico H3K4me1 en genoma personal | MIT | Hugging Face |
| DNABERT-2 (zhihan1996/DNABERT-2-117M) | 117M | Variable (secuencia de ADN) | Embeddings genómicos generales | No disponible en la información | Hugging Face |
| Modelos de predicción de efectos de variantes sobre secuencia de referencia | No disponible | No disponible | Efecto regulatorio de variantes | No disponible | No disponible |

La comparación directa con alternativas equivalentes de predicción de desequilibrio alélico en contexto diploide no está disponible en la información proporcionada. El modelo se distingue de DNABERT-2 base por añadir la cabeza siamesa y el entrenamiento específico sobre genomas personales faseados.

## Limitaciones y advertencias
- La lectura es simétrica: el modelo indica magnitud de desequilibrio alélico, pero no puede decir qué haplotipo une más.
- Entrenado con un único ensayo y un único donante por checkpoint; la generalización a otros donantes se reporta como buena, pero no se cuantifica en la model card.
- Solo acepta ventanas de 257 pb; entradas de otra longitud quedan fuera de distribución.
- Uso previsto exclusivamente de investigación; no validado para interpretación clínica o diagnóstica de variantes humanas.
- No es un `AutoModel`: requiere el paquete `hapadapter` y descargar tanto la cabeza como el tronco, lo que complica su integración en pipelines estándar de `transformers`.
- Durante la carga aparecen advertencias esperadas de `transformers` (pesos del cabezal MLM no usados, pooler inicializado aleatoriamente y aviso de "deberías entrenar"); la model card aclara que deben ignorarse.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de predicciones sobre variantes fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados; cabe esperar sesgo hacia los donantes y el ensayo de entrenamiento.
- Licencia MIT permite uso comercial, pero la ausencia de validación clínica desaconseja cualquier aplicación en ese ámbito.
- Cero descargas y cero likes en el momento de la consulta, y paper aún en preparación: madurez y validación por la comunidad muy limitadas.

## Enlaces
- Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-h3k4me1
- DNABERT-2 (modelo base): https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paquete `hapadapter`: no disponible enlace en la información proporcionada
- Paper: en preparación, sin referencia pública disponible
