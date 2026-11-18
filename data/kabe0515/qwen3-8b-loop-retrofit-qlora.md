# kabe0515/Qwen3-8B-Loop-Retrofit-QLoRA

## Resumen

Qwen3-8B-Loop-Retrofit-QLoRA es un adaptador QLoRA publicado por el usuario kabe0515 sobre el modelo base Qwen/Qwen3-8B. No se trata de un modelo utilizable, sino de un registro de experimento con resultado negativo: el autor documenta con mediciones reproducibles el intento de retrofitar la estructura de bucle con pesos compartidos (weight-sharing loop) caracteristica de SenseNova Loop-9B sobre un transformer denso de 8.000 millones de parametros ya preentrenado.

El experimento parte de Qwen3-8B, un modelo de 36 capas, y ejecuta un bloque de capas dos veces con pesos compartidos. La sonda de inferencia sin entrenamiento muestra un colapso sistematico: la perplejidad pasa de 8,03 a valores entre 1696 y 4328 en japones, y el bloque mas ancho diverge a NaN. El adaptador QLoRA de rango 16 recupera parcialmente la perplejidad (de 1643 a 499,9 en japones y de 3698 a 930,4 en ingles), pero el texto generado sigue siendo incoherente.

Su relevancia es metodologica: aporta evidencia empirica de que un bucle no es una tecnica que se pueda anadir a posteriori, sino una propiedad estructural que los pesos deben aprender desde el preentrenamiento, con estabilizacion del flujo residual (manifold-constrained hyper-connections, mHC) integrada. El repositorio incluye scripts de reproduccion y mediciones crudas, y esta publicado bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptador QLoRA y schedule de bucle (capas 12-19 ejecutadas dos veces, 36 a 44 ejecuciones de capa) |
| Parametros totales | No disponible (modelo base Qwen3-8B: aproximadamente 8.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de Qwen3-8B) |
| Tipos de cuantizacion | 4 bits para inferencia del experimento; adaptador QLoRA r16 / alpha 32 |
| Idiomas soportados | Japones (ja), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json), libreria PEFT |

## Arquitectura y entrenamiento

El modelo base es Qwen3-8B, un transformer denso de 36 capas. El experimento anade un schedule de bucle en el que las capas originales 12-19 se ejecutan dos veces con pesos compartidos, pasando de 36 a 44 ejecuciones de capa. El adaptador QLoRA se aplica sobre las capas originales 12-27 (proyecciones de atencion y MLP; ambas pasadas comparten el mismo adaptador), con rango 16 y alpha 32, lo que supone 19.398.656 parametros entrenables (0,24% del total).

Los datos de entrenamiento son texto plano de Wikipedia en japones y Wikitext en ingles, en fragmentos de 512 tokens, con aproximadamente 5,1 millones de tokens preparados. El entrenamiento efectivo fue de 200 pasos (unos 1,64 millones de tokens vistos), con learning rate 2e-4, schedule coseno y 20 pasos de warmup, sobre una Tesla V100 de 32 GB a unos 43 segundos por paso. La perdida de entrenamiento bajo de 6,08 (paso 20) a 3,30 (paso 100) y 3,12 (paso 200), estabilizandose muy por encima del equivalente al modelo base (aproximadamente 2,14). No se aplico RLHF ni DPO.

## Capacidades

- Generacion de texto: teoricamente hereda la capacidad de Qwen3-8B, pero en la configuracion medida el adaptador no produce lenguaje funcional.
- Razonamiento y codigo: no evaluados en el experimento; no disponibles en esta configuracion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a japones e ingles en los datos de entrenamiento; la generacion adaptada muestra mezcla de japones, chino e ingles.
- Capacidad especial: el valor del artefacto es la reproducibilidad del experimento (scripts de sonda, preparacion de datos, entrenamiento y evaluacion), no la inferencia.

## Casos de uso

- Reproduccion de resultados negativos: el repositorio incluye probe_loop.py, prep_data.py, train_loop.py y probe_adapted.py para verificar el colapso de perplejidad y la recuperacion parcial con QLoRA.
- Investigacion sobre bucles con pesos compartidos: sirve como linea base empirica para quienes estudien arquitecturas tipo SenseNova Loop-9B y quieran medir el coste de retrofitar un bucle sobre un modelo preentrenado.
- Estudio de estabilidad del flujo residual: el NaN del bloque mas ancho (capas 06-30) documenta la explosion del residual bajo repeticion y justifica mecanismos de estabilizacion como mHC.
- Diseno de experimentos de adaptacion: las mediciones de perdida y perplejidad por paso permiten calibrar cuantos datos y capacidad se necesitan para reconstruir funcion, no solo ajustarla.
- Docencia sobre PEFT y QLoRA: ejemplo realista de los limites de un adaptador de rango 16 (0,24% de parametros) ante un cambio de distribucion severo.
- Referencia para decisiones de arquitectura: evidencia de que conviene entrenar el bucle desde el preentrenamiento en lugar de anadirlo a posteriori.

## Benchmarks y rendimiento

Perplejidad sobre textos fijos en japones (JA) e ingles (EN), sonda de inferencia sin entrenamiento (fp16, CPU), Qwen3-8B de 36 capas:

| Patron | PPL (JA) | PPL (EN) |
|---|---|---|
| base | 8,03 | 8,99 |
| L08-16 x2 | 2014 | 2663 |
| L12-20 x2 | 1922 | 3220 |
| L16-24 x2 | 2472 | 3603 |
| L20-28 x2 | 4328 | 3931 |
| L14-18 x2 (mas estrecho) | 1696 | 566 |
| L10-26 x2 | 2985 | 3557 |
| L06-30 x2 (mas ancho) | NaN | NaN |

Resultados tras adaptacion QLoRA (todas las condiciones en 4 bits, mismos textos fijos):

| Condicion | PPL (JA) | PPL (EN) |
|---|---|---|
| base (4 bits) | 7,86 | 9,48 |
| bucle sin adaptacion (4 bits) | 1643 | 3698 |
| bucle + adaptacion, 200 pasos | 499,9 | 930,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,1 GB; la inferencia requiere cargar Qwen3-8B. En 4 bits, aproximadamente 5-6 GB de VRAM; en fp16, aproximadamente 16 GB.
- GPU recomendadas: el entrenamiento se realizo en una Tesla V100 de 32 GB a unos 43 segundos por paso. Para inferencia basta una GPU consumer con suficiente VRAM.
- Cabe en GPU consumer: si, en 4 bits en tarjetas de 8 GB o mas; en fp16 requiere 16 GB o mas (RTX 4090, A100, H100).
- Opciones de despliegue: PEFT para cargar el adaptador, con el schedule de bucle implementado en los scripts del repositorio. No es compatible con un forward pass estandar de vLLM, llama.cpp u Ollama sin reimplementar el bucle.
- Latencia y throughput: no disponibles; el coste por paso de entrenamiento fue de unos 43 segundos en V100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia |
|---|---|---|---|---|
| Qwen3-8B-Loop-Retrofit-QLoRA (este) | ~8.000 M (base) + 19,4 M adaptador | No disponible | Experimento, resultado negativo | Apache-2.0 |
| Qwen/Qwen3-8B | ~8.000 M | No disponible | Modelo base funcional | Apache-2.0 |
| SenseNova Loop-9B | No disponible | No disponible | Modelo con bucle entrenado desde el inicio | No disponible |

## Limitaciones y advertencias

- No es un modelo utilizable: el adaptador no produce lenguaje funcional; la generacion adaptada sigue siendo mezcla de japones y chino sin frases coherentes.
- El adaptador solo tiene sentido con el schedule de bucle; cargarlo como LoRA estandar en un forward normal no corresponde a la configuracion medida.
- Perplejidad aun aproximadamente 64 veces peor que el modelo base en japones (499,9 frente a 7,86 en 4 bits).
- El bloque mas ancho (capas 06-30) diverge a NaN por explosion del flujo residual.
- Capacidad insuficiente del adaptador: 0,24% de parametros no puede reconstruir la funcion perdida.
- Escala de entrenamiento muy reducida (unos 1,64 millones de tokens vistos), con estancamiento de la perdida.
- Capas fuera del rango adaptado (28-35, norm final, lm_head) permanecen congeladas ante distribuciones desplazadas.
- Riesgo de alucinacion y sesgos: no evaluados; al no generar lenguaje funcional, no aplica una evaluacion de calidad.
- Licencia Apache-2.0 permite uso comercial, pero el artefacto no es apto para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/kabe0515/Qwen3-8B-Loop-Retrofit-QLoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- SenseNova Loop-9B (referencia citada por el autor, sin enlace en la informacion disponible)
