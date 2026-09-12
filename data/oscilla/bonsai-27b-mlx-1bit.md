# Oscilla/Bonsai-27B-mlx-1bit

## Resumen

Bonsai 27B (repositorio `Oscilla/Bonsai-27B-mlx-1bit`) es una compilacion de pesos binarios de 1 bit derivada de Qwen3.6-27B, un modelo causal de 27B con atencion hibrida. Su propuesta es llevar un modelo de clase 27B a un espacio de despliegue de 3,9 GB, un 14,2x menos que su equivalente en FP16 (54 GB), de modo que quepa en el presupuesto de memoria por aplicacion de un telefono de gama alta. Toda la ruta de pesos del modelo de lenguaje (embeddings, proyecciones de atencion, proyecciones MLP y LM head) esta cuantizada a un unico bit de signo con escalas FP16 por grupo de 128 pesos, lo que da 1,125 bits por peso efectivos, sin capas de alta precision escondidas.

El modelo conserva el esqueleto de Qwen3.6-27B: atencion hibrida con aproximadamente un 75% de atencion lineal y un 25% de atencion completa, MLP SwiGLU, RoPE y RMSNorm. Esa base permite mantener una ventana de contexto de 262.144 tokens en dispositivo, ya que solo 16 de las 64 capas generan cache de atencion completa. El autor publica kernels propios de atencion hibrida de 1 bit para Apple MLX (Python y Swift) y para CUDA, de forma que los pesos empaquetados se consumen directamente sin expandirse a FP16.

La relevancia del lanzamiento esta en el regimen de compresion: segun la model card, retiene el 89,5% de la inteligencia del modelo FP16 en 15 benchmarks en modo pensamiento (media 76,11), con 91,66 en matematicas y 81,88 en codigo, y alcanza unas 11 tok/s en un iPhone 17 Pro Max. Se distribuye bajo licencia Apache 2.0 e incluye un borrador de decodificacion especulativa (DSpark) entrenado contra el propio modelo objetivo. Conviene senalar que el repositorio de HuggingFace figura a nombre de Oscilla mientras la model card apunta a la infraestructura de Prism ML, y que no hay metricas individuales de benchmarks publicadas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion hibrida (aprox. 75% lineal / 25% completa), SwiGLU MLP, RoPE, RMSNorm; derivada de Qwen3.6-27B sin cambios de arquitectura |
| Parametros totales | 27,3B pesos binarios de lenguaje (24,8B de backbone en 64 bloques + 2,5B de embeddings y LM head) + 0,46B de torre de vision (27 bloques). El repositorio de safetensors declara 1.724.001.520 parametros empaquetados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (262K), capacidad de contexto completo en dispositivo |
| Tipos de cuantizacion | 1 bit binario g128 para el modelo de lenguaje (1,125 bits por peso efectivos: 1 bit de signo + escala FP16 amortizada sobre 128 pesos); torre de vision en HQQ de 4 bits; cache KV en 4 bits casi sin perdida |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX); representacion binaria g128 con escalas FP16 por grupo de 128 |

## Arquitectura y entrenamiento

El modelo no introduce una arquitectura nueva, sino un reempaquetado agresivo y kernels especificos de inferencia. El backbone es el de Qwen3.6-27B: 64 bloques con atencion hibrida en la que la mayor parte de las capas usa atencion lineal y una minoria (16 de 64) usa atencion completa, lo que limita el crecimiento de la cache KV a 4,3 GB con la ventana completa de 262K tokens. La representacion de pesos es binaria g128: cada peso se reduce a un bit de signo (`0` se mapea a `-scale`, `1` a `+scale`) y cada grupo de 128 pesos comparte un unico factor de escala FP16. El resultado son 1,125 bits por peso efectivos y un tamano desplegado de 3,9 GB para el modelo de lenguaje, con una cola insignificante de parametros de normalizacion y escalas en mayor precision.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO sobre esta version; el modelo se presenta como un ajuste de cuantizacion sobre Qwen3.6-27B mas que como un reentrenamiento. Las innovaciones declaradas son: kernels propios de atencion hibrida de 1 bit que consumen los pesos empaquetados directamente sin expandirlos a FP16, una capa borradora de decodificacion especulativa (DSpark) entrenada contra el objetivo Bonsai 27B que aporta una aceleracion de decodificacion de 1,37x sin perdida en la ruta de servicio CUDA, y un paquete `mmproj` opcional de 0,63 GB con la torre de vision en HQQ de 4 bits que solo se carga cuando hay entrada de imagen.

## Capacidades

- Generacion de texto y razonamiento conversacional, con modo pensamiento preservado en el regimen sub-4-bit.
- Razonamiento matematico (91,66 en la bateria declarada por el autor) y generacion de codigo (81,88).
- Comportamiento agentico y de multiples pasos segun la model card, aunque sin desglose de benchmarks de agentes.
- Entrada de imagen a traves de la torre de vision HQQ de 4 bits y el paquete `mmproj` opcional de 0,63 GB.
- Contexto largo de 262.144 tokens con cache KV cuantizada a 4 bits, orientado a inferencia en dispositivo.
- Decodificacion especulativa integrada mediante el borrador DSpark.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales en telefono: el modelo desplegado ocupa 3,9 GB y genera a unas 11 tok/s en un iPhone 17 Pro Max, lo que permite conversaciones multi-turno locales con una ventana de 262K tokens sin depender de la nube.
- Razonamiento matematico asistido en movilidad: la retencion declarada de 91,66 en matematicas en modo pensamiento lo hace util para resolucion paso a paso de problemas y verificacion de calculos en un portatil Apple Silicon.
- Generacion y revision de codigo en local: con 81,88 en la bateria de codigo declarada y 44 tok/s en un Apple M5 Pro, encaja en flujos de autocompletado y explicacion de codigo en el propio portatil.
- Procesamiento de documentos largos en dispositivo: los 262.144 tokens de contexto permiten resumir o consultar contratos, informes o bases de codigo extensas sin enviar los datos a un servicio externo, con solo 4,3 GB de cache KV a ventana completa.
- Flujos multimodales ligeros: cargando el paquete `mmproj` de 0,63 GB se pueden hacer preguntas sobre capturas, diagramas o fotografias en una aplicacion movil.
- Agentes y tareas de multiples pasos en el borde: el comportamiento agentico declarado, combinado con el borrador DSpark para acelerar la decodificacion, permite cadenas de razonamiento con varias llamadas en hardware sin GPU dedicada.
- Servicio CUDA con requisitos de memoria ajustados: los kernels de 1 bit para CUDA y el fork de llama.cpp permiten servir un modelo de clase 27B en GPUs modestas, reduciendo el trafico de pesos en cada paso de decodificacion.
- Escenarios con restricciones de privacidad o de conectividad: al ejecutarse en dispositivo bajo Apache 2.0, es apto para entornos aislados o con datos que no pueden salir del terminal.

## Benchmarks y rendimiento

La model card solo publica agregados, sin desglose por benchmark individual ni identificacion de las 15 pruebas de modo pensamiento empleadas:

| Metrica | Resultado | Nota |
|---|---|---|
| Media en 15 benchmarks en modo pensamiento | 76,11 | 89,5% del rendimiento FP16 |
| Matematicas | 91,66 | Subconjunto de la bateria anterior |
| Codigo | 81,88 | Subconjunto de la bateria anterior |
| Velocidad en iPhone 17 Pro Max | ~11 tok/s | Generacion interactiva |
| Velocidad en Apple M5 Pro (portatil) | ~44 tok/s | Ruta MLX |
| Aceleracion por decodificacion especulativa | 1,37x | Sin perdida, ruta de servicio CUDA, borrador DSpark |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni la identificacion de las pruebas concretas utilizadas.

## Requisitos de hardware

- VRAM / huella del modelo de lenguaje: 3,9 GB en su formato binario g128 nativo. La torre de vision anade un paquete `mmproj` opcional de 0,63 GB que solo se carga con entrada de imagen.
- Cache KV: hasta 4,3 GB con la ventana completa de 262.144 tokens y cuantizacion a 4 bits; con contextos mas cortos baja proporcionalmente. Como estimacion derivada, un contexto de 32K quedaria en torno a 0,5 GB de cache, y un contexto de 8K en torno a 0,13 GB.
- Presupuesto total estimado: aproximadamente 8,2 GB para el modelo de lenguaje mas cache KV a 262K tokens, y en torno a 4,5-5 GB para uso conversacional con contexto corto. Estas cifras son calculos derivados de los datos de la model card, no medidas publicadas.
- Cabe en GPU de consumo: si, con el margen indicado; en GPU de gama alta reciente (24 GB o mas) el modelo y la cache completa quedan holgadamente dentro, y en GPUs de 8-12 GB es viable con contextos reducidos.
- GPU recomendadas: la model card documenta explicitamente el soporte de Apple Silicon (MLX, tanto Python como Swift) y CUDA. No se especifican modelos de GPU concretos (A100, H100, RTX 4090 u otros) en la informacion disponible.
- Opciones de despliegue: MLX en Python y MLX en Swift para Apple Silicon e iOS/macOS; fork de llama.cpp para CUDA; el repositorio incluye utilidades de servicio y evaluacion en `PrismML-Eng/Bonsai-demo`. Compatibilidad con vLLM, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: ~11 tok/s en iPhone 17 Pro Max y ~44 tok/s en un Apple M5 Pro. La ruta CUDA con el borrador DSpark reporta una mejora de 1,37x en decodificacion. Cifras de tokens de prefill o latencia de primer token: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Calidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Bonsai 27B (1-bit, este) | 27,3B pesos binarios + 0,46B vision | 262.144 tokens | Binario g128, 1,125 bits/peso, 3,9 GB | 76,11 de media; 89,5% de FP16 | Apache 2.0 | MLX (Python, Swift) y CUDA |
| Ternary Bonsai 27B | Misma base, pesos ternarios | 262.144 tokens (misma base) | Ternario 2-bit, ~7,2 GB | 95% de FP16 | Apache 2.0 | MLX, segun la model card |
| Qwen3.6-27B (FP16) | 27,3B + 0,46B vision | 262.144 tokens (misma base) | FP16, 54 GB | Referencia (100%) | Apache 2.0 | Ecosistema Qwen estandar |

No se dispone de datos comparativos con otras familias de modelos de tamano similar o de otras propuestas de cuantizacion sub-4-bit en la informacion proporcionada, por lo que no es posible contrastar el rendimiento frente a alternativas externas.

## Limitaciones y advertencias

- Riesgo de alucinacion: no cuantificado en la model card; la construccion de 1 bit no incluye una evaluacion de fidelidad factual.
- Degradacion de calidad: se declara una retencion del 89,5% del rendimiento FP16 en modo pensamiento, es decir, en torno a un 10% de perdida. Las tareas sensibles a la precision numerica o a la coherencia larga son las mas expuestas en regimenes de 1 bit.
- Idiomas soportados: no disponibles. No se puede confirmar cobertura multilingue ni el comportamiento fuera del ingles sin evaluacion adicional.
- Uso comercial: la licencia es Apache 2.0, sin restricciones declaradas. Conviene verificar de forma independiente las condiciones del modelo base Qwen3.6-27B antes de un despliegue en produccion.
- Dependencia de kernels propios: el rendimiento declarado depende de forks especificos de MLX, mlx-swift y llama.cpp. El modelo no es directamente ejecutable con herramientas estandar de MLX o llama.cpp sin esos cambios.
- Estado de validacion: el repositorio presenta 0 descargas y 0 likes, y la model card no incluye la identificacion de los 15 benchmarks ni sus resultados individuales, lo que dificulta la reproducibilidad.
- Discrepancia de custodia: el repositorio figura bajo el autor Oscilla mientras la model card apunta a Prism ML, con enlaces de soporte y comunidad en esa organizacion. Conviene confirmar la trazabilidad de la publicacion.
- Discrepancia en el recuento de parametros: los safetensors del repositorio declaran 1.724.001.520 parametros empaquetados frente a los 27,3B pesos binarios que describe la model card. La diferencia es coherente con el empaquetado de 128 pesos por byte de escala, pero debe verificarse antes de asumir cualquier cifra de memoria o computo.
- Vision opcional: las capacidades de imagen requieren cargar el paquete `mmproj` adicional y la torre de vision esta en 4 bits, no en 1 bit, por lo que su calidad no sigue el mismo regimen de compresion que el resto del modelo.
- Contexto en dispositivo: aunque la ventana de 262K tokens es viable con cache de 4 bits, el coste de cache a ventana completa (4,3 GB) puede exceder el presupuesto de memoria de aplicacion en telefonos de gama media.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/Bonsai-27B-mlx-1bit
- Modelo ternario companero: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-mlx-2bit
- Web de Prism ML: https://prismml.com
- Repositorio de demo, servicio y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Whitepaper (PDF): https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-27b-whitepaper.pdf
- Fork de MLX con kernels de bajo bit (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Fork de llama.cpp con kernels de bajo bit (CUDA): https://github.com/PrismML-Eng/llama.cpp
- Comunidad en Discord: https://discord.gg/prismml
