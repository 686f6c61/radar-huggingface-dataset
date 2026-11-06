# SA0901/tiny-qwen-moe-tinystories

## Resumen

Tiny Qwen MoE – TinyStories es un modelo de lenguaje causal decoder-only con arquitectura de mezcla de expertos (MoE) dispersa, implementado desde cero en PyTorch por el autor independiente SA0901. No es un modelo oficial de Qwen ni un fine-tuning de un checkpoint de Qwen: toma inspiración de los conceptos arquitectónicos de Qwen3 y reutiliza el tokenizador de Qwen2, pero los pesos se entrenan desde inicialización aleatoria. Su propósito es educativo y experimental: explorar el enrutamiento disperso de expertos y componentes modernos de Transformer con recursos de cómputo limitados.

El modelo es deliberadamente pequeño: dimensión oculta de 384, 6 capas, 16 expertos con 2 activos por token y una longitud máxima de secuencia de 256 tokens. Se entrenó sobre un subconjunto de 10.000 ejemplos del dataset TinyStories durante 5 épocas en una GPU de Kaggle, con el objetivo de predicción del siguiente token. El repositorio ocupa 0,9 GB y contiene los pesos en formato `pytorch_model.bin`, la configuración y los ficheros del tokenizador.

Su relevancia es acotada y de carácter didáctico: sirve como referencia mínima y reproducible de una arquitectura MoE con GQA, RoPE, RMSNorm y SwiGLU, útil para quien quiera estudiar cómo se implementa el enrutamiento de expertos en PyTorch sin infraestructura de gran escala. No está pensado para producción ni para tareas de razonamiento complejo, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos dispersa (MoE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (16 expertos, 2 activos por token) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en `pytorch_model.bin`, sin variantes GGUF publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only con las siguientes dimensiones: dimensión oculta de 384, 6 capas, 8 cabezas de atención con 4 cabezas KV (Grouped Query Attention), dimensión de cabeza de 48, 16 expertos con 2 activos por token y dimensión oculta de experto de 1536. Incorpora RoPE para codificar posiciones, RMSNorm como pre-normalización en cada bloque y SwiGLU como activación de la red feed-forward. El tokenizador es el de Qwen2. La longitud máxima de secuencia es de 256 tokens.

El entrenamiento se realizó desde pesos inicializados aleatoriamente sobre un subconjunto de `roneneldan/TinyStories`: 10.000 ejemplos de entrenamiento y 1.000 de validación, con objetivo de predicción del siguiente token, optimizador AdamW, learning rate de 1e-4, weight decay de 0,1, batch size de 4 y 5 épocas, en una GPU de Kaggle. La model card indica que la pérdida final de entrenamiento y validación «se rellenará a partir de los logs», por lo que esos valores no están disponibles. No se documenta uso de RLHF, DPO ni ninguna fase de alineación posterior; el modelo es una base causal, no instruida.

## Capacidades

- Generación de texto causal autoregresiva en inglés, con decodificación greedy en el script de inferencia proporcionado.
- Modelado de lenguaje sobre narrativas simples, dado el dominio de TinyStories (cuentos infantiles cortos).
- Enrutamiento disperso de tokens a 2 de 16 expertos por capa, lo que permite estudiar el comportamiento de una MoE a pequeña escala.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; no se documenta soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Estudio educativo de arquitecturas MoE: el código de `model.py` y `configs.py` permite examinar la implementación de enrutamiento de expertos, GQA, RoPE, RMSNorm y SwiGLU en un modelo que cabe en una GPU de consumo, sin necesidad de infraestructura de gran escala.
- Experimentación con enrutamiento de expertos: al tener 16 expertos y 2 activos por token en solo 6 capas, es un banco de pruebas manejable para analizar el balanceo de carga entre expertos y el comportamiento del router.
- Generación de cuentos cortos en inglés: entrenado sobre TinyStories, puede producir continuaciones de narrativas simples de hasta 256 tokens, adecuado para demostraciones y pruebas de concepto.
- Reproducción de pipelines de entrenamiento: la configuración documentada (AdamW, lr 1e-4, batch 4, 5 épocas, GPU de Kaggle) permite replicar el entrenamiento completo con recursos mínimos y comparar curvas de pérdida.
- Validación de tokenizadores: al usar el tokenizador de Qwen2 sobre un corpus TinyStories, sirve para estudiar la cobertura del vocabulario en dominios de vocabulario restringido.
- Docencia y materiales de formación: como ejemplo mínimo y autocontenido de un Transformer MoE funcional, es útil en cursos o talleres sobre implementación de modelos de lenguaje desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estandarizada, y los valores de pérdida final de entrenamiento y validación quedan pendientes de rellenar según el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 0,9 GB, por lo que los pesos en precisión completa caben holgadamente en cualquier GPU de consumo moderna; con dimensión oculta de 384 y 6 capas, la huella de activaciones para 256 tokens es mínima.
- GPU recomendadas: cualquier GPU con suficiente memoria para los pesos (el entrenamiento se realizó en una GPU de Kaggle, sin especificar el acelerador exacto). Una RTX 3060 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del repositorio y la longitud de contexto de 256 tokens.
- Opciones de despliegue: el autor proporciona un script `inference.py` en su repositorio de GitHub basado en PyTorch y `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni existen pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny Qwen MoE – TinyStories | no disponible (16 expertos, 2 activos) | 256 | MoE decoder-only, PyTorch | no disponible | Hugging Face + GitHub |
| TinyStories baseline (modelos del paper original) | ~1M–33M | típicamente 256–512 | Transformer denso | según variante | Referencia académica |
| Qwen3 (modelos oficiales) | escala mucho mayor | mucho mayor | MoE y densos | según variante | Hugging Face (Qwen) |

La comparación directa con modelos de producción no es significativa: Tiny Qwen MoE – TinyStories es una implementación educativa con un presupuesto de cómputo mínimo y un corpus de 10.000 ejemplos, mientras que los modelos Qwen oficiales se entrenan a escala industrial. Respecto a los modelos del paper de TinyStories, comparte dominio de datos pero introduce enrutamiento MoE, lo que lo hace interesante como variante arquitectónica más que como competidor en calidad. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Entrenado sobre un subconjunto pequeño de TinyStories (10.000 ejemplos), lo que limita severamente la calidad y la generalización de la generación.
- Longitud de contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Entrenado únicamente en inglés; no hay evidencia de capacidad en otros idiomas.
- Es un modelo base causal, no instruido: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- No se han publicado benchmarks ni valores finales de pérdida; no es posible evaluar su calidad de forma objetiva con la información disponible.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- Riesgo de alucinación y de generar texto incoherente fuera del dominio de cuentos infantiles simples.
- No es un modelo oficial de Qwen ni está afiliado a Alibaba Cloud; el nombre puede inducir a confusión.
- No se documentan sesgos específicos, pero al entrenarse solo con TinyStories hereda las limitaciones y posibles sesgos de ese corpus.
- No apto para producción: sin cuantizaciones publicadas, sin soporte de servidores de inferencia estándar y sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SA0901/tiny-qwen-moe-tinystories
- Repositorio GitHub (script de inferencia): https://github.com/SitanshuA091/tiny-qwen/blob/master/inference.py
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Organización Qwen en Hugging Face (inspiración arquitectónica y tokenizador): https://huggingface.co/Qwen
