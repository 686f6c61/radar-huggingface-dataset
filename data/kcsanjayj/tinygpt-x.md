# kcsanjayj/TinyGPT-X

## Resumen

TinyGPT-X es un modelo de lenguaje decoder-only de estilo GPT-2 desarrollado por kcsanjayj, escrito desde cero en PyTorch y entrenado desde inicialización aleatoria, sin pesos preentrenados, en una unica GPU de portatil (NVIDIA GeForce RTX 3050 de 6 GB). Con 13.891.584 parametros, 6 capas, 6 cabezas de atencion y una anchura de 384, es un modelo de escala educativa que reproduce la arquitectura GPT-2 clasica (pre-LayerNorm, embeddings posicionales aprendidos, activacion GELU y embeddings de entrada/salida atados).

El modelo se entrena exclusivamente sobre las primeras 300.000 historias del dataset roneneldan/TinyStories (66.674.390 tokens tras tokenizacion), con un vocabulario de 8.192 tokens BPE a nivel de byte entrenado desde cero. Su ventana de contexto es de solo 256 tokens y su unico idioma soportado es el ingles. La licencia es MIT.

Su relevancia es fundamentalmente didactica: demuestra que es posible entrenar un modelo de lenguaje funcional (perplejidad de validacion 6,05) en 11,3 minutos en hardware de consumo, lo que lo convierte en un caso de referencia para quienes quieren entender el ciclo completo de entrenamiento de un transformer sin depender de pesos preentrenados. No es un asistente, no sigue instrucciones y no es fiable para datos facticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-LayerNorm, embeddings posicionales aprendidos, GELU (tanh), embeddings de entrada/salida atados |
| Parametros totales | 13.891.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bfloat16/float32 es convertible a GGUF con herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas / cabezas / anchura | 6 / 6 / 384 |
| Vocabulario | 8.192 tokens BPE a nivel de byte, entrenado desde cero |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

TinyGPT-X es un transformer decoder-only con la disposicion de GPT-2, lo que permite cargarlo con las clases estandar de `transformers` (`AutoModelForCausalLM`, `pipeline`). Usa pre-LayerNorm, embeddings posicionales aprendidos (no rotatorios), activacion GELU en su variante tanh y atado de embeddings de entrada y salida. No incorpora mecanismos de atencion lineal, decodificacion especulativa ni arquitecturas hibridas; es una implementacion deliberadamente canonica.

El entrenamiento usa prediccion del siguiente token con entropia cruzada, optimizador AdamW (betas 0,9/0,95, weight decay 0,1 en matrices de pesos), schedule coseno de learning rate de 0,001 a 0,0001 con 200 pasos de calentamiento y recorte de gradiente a 1,0. El lote efectivo es de 32 secuencias x 2 pasos de acumulacion x 256 tokens = 16.384 tokens por paso de optimizador, durante 6.000 pasos, lo que supone 98.304.000 tokens vistos. Se entreno en bfloat16 en una RTX 3050 de 6 GB, con semilla 1337 y un tiempo de reloj de 11,3 minutos. Los datos son las primeras 300.000 historias de TinyStories (66.674.390 tokens) y 5.000 historias de validacion (983.676 tokens).

## Capacidades

- Generacion de texto narrativo corto y simple en ingles, orientado a historias infantiles sinteticas.
- Continuacion de texto a partir de un prompt (completion), no instrucciones.
- Coherencia local limitada a frases y parrafos muy breves dentro de la ventana de 256 tokens.
- Capacidad multilingue: no, solo ingles.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Modo thinking, vision o audio: no disponible.
- Razonamiento matematico o de codigo: no soportado de forma fiable.

## Casos de uso

- Docencia y formacion en LLM: permite recorrer el ciclo completo de entrenamiento (tokenizacion, arquitectura, schedule, evaluacion) con un coste de computo trivial y codigo reproducible en una GPU de consumo.
- Experimentacion con tecnicas de entrenamiento: sirve como banco de pruebas para variaciones de learning rate, inicializacion, precision (bfloat16 frente a float32) o tamano de lote, dado que un ciclo completo dura minutos.
- Generacion de cuentos sinteticos para prototipos: util para rellenar pipelines de demostracion de generacion de texto con historias cortas en ingles sin depender de APIs externas.
- Pruebas de integracion de `transformers` y TGI: al ser compatible con `pipeline` y con text-generation-inference, sirve para validar despliegues y endpoints en entornos de desarrollo antes de pasar a modelos grandes.
- Benchmarking de infraestructura: modelo de referencia para medir latencia, throughput y consumo de memoria en configuraciones de inferencia (CPU, GPU de consumo) sin ruido de modelos grandes.
- Educacion sobre limitaciones de los LLM: ejemplifica de forma tangible los fallos tipicos (repeticion, perdida de hilo, alucinacion) y por que el escalado y el ajuste por instrucciones son necesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta metricas internas de validacion sobre el mismo dataset:

| Metrica | Valor |
|---|---|
| Perdida de validacion (mejor checkpoint) | 1,8008 |
| Perplejidad de validacion | 6,05 |
| Precision top-1 / top-5 del siguiente token | 56,2% / 82,7% |
| Bits por token | 2,603 |
| Brecha entre perdida de entrenamiento y validacion | +0,0629 |
| Bits por byte (aprox.) | 0,629 |

La perplejidad se mide por token con el tokenizador propio del modelo sobre historias reservadas del mismo dataset y, segun el autor, no es comparable con la de otros modelos o tokenizadores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (13,9 M de parametros, aproximadamente 56 MB de pesos) y aun menor en bfloat16 o cuantizacion de 8 bits; el repo completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el propio autor entreno en una RTX 3050 de 6 GB. Tambien funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo, incluida la gama integrada y portatiles modestos.
- Opciones de despliegue: `transformers` (pipeline o `AutoModelForCausalLM`), text-generation-inference (TGI) por compatibilidad declarada, y conversion a GGUF para llama.cpp u Ollama mediante herramientas externas (no se publican artefactos GGUF oficiales).
- Latencia y throughput estimados: no disponibles de forma publicada; por el tamano del modelo se espera generacion en tiempo real incluso en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TinyGPT-X (kcsanjayj) | 13,9 M | 256 | Desde cero, TinyStories (300k historias) | MIT | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1.024 | Preentrenado en WebText | MIT | Hugging Face |
| TinyStories-1M (roneneldan) | ~1 M | 512 | TinyStories | MIT | Hugging Face |
| TinyLlama-1.1B | 1,1 B | 2.048 | Preentrenado + ajuste | Apache 2.0 | Hugging Face |

La comparacion con GPT-2 small y TinyLlama es desigual en escala; se incluyen como referencias de la misma familia arquitectonica y de la categoria de modelos pequenos. Frente a TinyStories-1M, TinyGPT-X es mayor en parametros pero con contexto mas corto. No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un corpus pequeno y sintetico de cuentos infantiles: vocabulario y estilo muy estrechos.
- Modelo diminuto: se repite con frecuencia, pierde el hilo narrativo y comete errores logicos y facticos.
- No esta ajustado por instrucciones ni dispone de tuning de seguridad o filtrado; no debe usarse en aplicaciones del mundo real.
- Contexto limitado a 256 tokens y solo ingles.
- Riesgo alto de alucinacion y de contenido inapropiado o sesgado; el autor lo desaconseja explicitamente para usos reales.
- Aunque la licencia es MIT y permite uso comercial, la calidad y fiabilidad del modelo hacen inviable su uso en produccion.
- La perplejidad reportada no es comparable con la de otros modelos por diferencias de tokenizador y dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kcsanjayj/TinyGPT-X
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
- Repositorio del proyecto (codigo y configuraciones, referenciado en la model card): no disponible como URL directa en la informacion proporcionada
