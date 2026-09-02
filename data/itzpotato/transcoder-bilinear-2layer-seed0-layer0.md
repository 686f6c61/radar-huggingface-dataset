# itzPotato/transcoder-bilinear-2layer-seed0-layer0

## Resumen

`transcoder-bilinear-2layer-seed0-layer0` es un transcoder TopK entrenado sobre la capa 0 del modelo base `itzPotato/arithmetic-bilinear-2layer-seed0`, un transformer de 2 capas especializado en aritmética con MLP bilineal. Un transcoder es una herramienta de interpretabilidad mecanística que aproxima una subcapa MLP concreta: lee la activación de entrada del MLP y predice su salida a través de un cuello de botella k-escaso. No es un autoencoder del flujo residual, sino un modelo supervisado que reconstruye la transformación de una subcapa específica.

El modelo tiene 66.592 parámetros, con `d_model` de 32, 1.024 features (expansión 32x) y 32 features activas por entrada. Fue entrenado con una sola pasada sobre 7.999.488 vectores de activación procedentes de 500.000 problemas del split de entrenamiento del modelo base, sin tocar los splits de validación ni test. Su relevancia radica en que permite estudiar cómo se computa la aritmética en transformers pequeños, y forma parte de un conjunto de 18 transcoders que comparan la dificultad de reconstrucción entre MLP ReLU y bilineales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder TopK (cuello de botella k-escaso sobre subcapa MLP) |
| Parametros totales | 66.592 |
| Parametros activos | 32 (k = 32 features activas por entrada) |
| Longitud de contexto | No aplica (procesa vectores de activacion, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de investigacion sobre activaciones aritmeticas) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (libreria `pytorch`) |

## Arquitectura y entrenamiento

El transcoder implementa la transformación `y_hat = TopK_k(W_enc x + b_enc) @ W_dec + b_dec`, donde `W_enc` proyecta la activación de entrada del MLP a un espacio de 1.024 features, se seleccionan las 32 de mayor magnitud (TopK), y `W_dec` reconstruye la salida del MLP. Las filas del decodificador están normalizadas a norma unitaria. El modelo base al que se ajusta es un transformer de 2 capas con MLP bilineal (no ReLU), entrenado para tareas aritméticas.

El entrenamiento usó Adam con learning rate 0,0003 y lotes de 4.096 vectores de activación (no problemas completos), con una única pasada sobre 500.000 problemas del split de entrenamiento del modelo base y un subconjunto de validación separado de 10.000 problemas. Se entrenó durante 1.953 pasos sobre 7.999.488 vectores. La inicialización es cuidadosa: el bias del decodificador se fija a la media del target y el encoder se reescala una vez con el primer lote de entrenamiento, de modo que la pasada única se dedica a aprender features y no a corregir desajustes de escala iniciales (escala de calibración 0,0945; error normalizado inicial 84,3 antes del reescalado, 1,69 después).

## Capacidades

- Reconstrucción de la salida del MLP de la capa 0 del modelo base con error de reconstrucción normalizado de 0,0082.
- Extracción de features escasas interpretables: produce representaciones k-escasas (32 features activas) que permiten analizar qué circuitos internos computan la aritmética.
- Comparación arquitectónica: forma parte de un conjunto de 18 transcoders que permite medir cuantitativamente la dificultad de reconstrucción entre MLP ReLU y bilineales (los bilineales son ~1,55x más difíciles de reconstruir: 0,0387 vs 0,0249 de error normalizado).
- Verificación de procedencia: el modelo registra el hash sha256 de los pesos base a los que se ajusta, permitiendo reproducibilidad exacta.
- No es un modelo generativo: no genera texto, código ni responde a prompts.

## Casos de uso

- Investigación en interpretabilidad mecanística: el transcoder permite descomponer la computación del MLP de la capa 0 en features escasas, facilitando el estudio de cómo se representan y procesan las operaciones aritméticas en transformers pequeños.
- Análisis de circuitos: al predecir la salida del MLP con un cuello de botella escaso, se pueden identificar qué features individuales contribuyen a operaciones específicas (suma, resta, acarreo) y cómo se combinan.
- Comparación de arquitecturas: junto con los otros 17 transcoders del conjunto, permite cuantificar la diferencia de "reconstructibilidad" entre MLP ReLU y bilineales, un dato relevante para elegir arquitecturas más interpretables.
- Validación de técnicas de transcoding: sirve como banco de pruebas para evaluar métodos de entrenamiento de transcoders con una sola pasada y restricciones de no contaminación de splits.
- Reproducibilidad en investigación: el anclaje a un commit específico (`require_pinned=True`) garantiza que los experimentos no carguen versiones móviles del modelo, lo que lo hace adecuado para pipelines de investigación rigurosos.
- Estudio de la escalabilidad de la interpretabilidad: al ser un modelo minúsculo (66K parámetros), permite iterar rápidamente sobre hipótesis de interpretación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque este modelo no es un LLM generativo. Los datos de rendimiento relevantes son métricas de reconstrucción sobre el MLP objetivo:

| Metrica | Valor |
|---|---|
| Error de reconstruccion normalizado (MSE / mean(target^2)) | 0,0082 |
| Fraccion de varianza no explicada | 0,0085 |
| MSE crudo | 0,000630899 |
| Error normalizado de un predictor constante cero | 1,0 (referencia) |
| Error normalizado medio del conjunto de 18 transcoders (MLP bilineal) | 0,0387 |
| Error normalizado medio del conjunto de 18 transcoders (MLP ReLU) | 0,0249 |

## Requisitos de hardware

- El modelo tiene solo 66.592 parámetros, por lo que cabe en cualquier hardware, incluida una CPU sin GPU.
- VRAM estimada para inferencia: menos de 1 MB en precisión fp32 (el modelo completo ocupa ~266 KB en fp32).
- GPU recomendada: ninguna; se puede ejecutar en CPU sin problemas.
- No requiere GPU de consumo ni profesional; cualquier portátil moderno es suficiente.
- Opciones de despliegue: carga directa con PyTorch mediante `load_transcoder` desde el hub de HuggingFace; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: despreciable; la inferencia sobre un vector de activación de dimensión 32 es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Error reconstruccion normalizado | Licencia |
|---|---|---|---|---|
| `transcoder-bilinear-2layer-seed0-layer0` | 66.592 | Transcoder TopK sobre MLP bilineal | 0,0082 | No disponible |
| Transcoder ReLU equivalente (mismo conjunto, 18 modelos) | ~66K | Transcoder TopK sobre MLP ReLU | 0,0249 (media del conjunto) | No disponible |
| `itzPotato/arithmetic-bilinear-2layer-seed0` (modelo base) | No disponible | Transformer 2 capas con MLP bilineal | No aplica (es el modelo objetivo) | No disponible |

La comparativa relevante es interna al conjunto de 18 transcoders: los MLP bilineales son consistentemente ~1,55x más difíciles de reconstruir que los ReLU en las tres celdas de profundidad/capa con tres semillas cada una. No hay transcoders comparables de otros autores en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para generar texto, código ni responder consultas; su única función es reconstruir la salida del MLP de la capa 0 del modelo base.
- Especificidad extrema: está ajustado a un único modelo base concreto (hash sha256 `cbcf860d5501ad1558bc03f3979ac773146903397011adc503cfd9882030f9c9`); no es transferible a otros modelos sin reentrenamiento.
- Sin licencia especificada: la licencia no está disponible en la ficha de HuggingFace, lo que genera incertidumbre legal para uso comercial o redistribución.
- Sin idiomas ni pipeline: al operar sobre vectores de activación, no tiene soporte de idiomas ni pipeline de HuggingFace estándar.
- Riesgo de sobreajuste al split de entrenamiento: aunque el entrenamiento respeta los splits de validación y test del modelo base, la única pasada sobre datos de entrenamiento puede limitar la generalización a distribuciones de activación fuera del rango visto.
- Tamaño del repositorio: 0,0 GB reportado, lo que sugiere que los pesos pueden no estar incluidos en el repo o que el modelo se carga desde el código fuente (`src.transcoder.source`), lo que requiere clonar el repositorio de código asociado.
- Sin métricas de interpretabilidad humana: el error de reconstrucción bajo no garantiza que las features extraídas sean semánticamente interpretables para un humano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itzPotato/transcoder-bilinear-2layer-seed0-layer0
- Modelo base: https://huggingface.co/itzPotato/arithmetic-bilinear-2layer-seed0
- Perfil del autor (Rohan Sashank Babbellapati): https://huggingface.co/itzPotato/models
- Modelo relacionado (bilinear-attn-addition-carry-2layer): https://huggingface.co/itzPotato/bilinear-attn-addition-carry-2layer
- Modelo relacionado (bilinear-attn-modular-addition-p113): https://huggingface.co/itzPotato/bilinear-attn-modular-addition-p113
