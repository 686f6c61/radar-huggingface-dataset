# r-three-moto/moto-1b-v1-oracle-reg

## Resumen

MoTo 1B v1 (oracle-reg) es un modelo de lenguaje de 1.750.587.392 parámetros (1,75B totales, 1,28B no correspondientes a embeddings) desarrollado por el equipo r-three-moto. Se trata de un transformer decoder de estilo Llama entrenado desde cero sobre 21 idiomas con una innovación central: en lugar de un único tokenizador multilingüe, utiliza un tokenizador BPE por idioma (21 en total) que comparten una tabla de embeddings común mediante un vocabulario superset de 113.764 entradas. El resto de la arquitectura permanece inalterada respecto a un modelo monolítico equivalente.

La variante "oracle-reg" aplica un enrutamiento regularizado: durante el entrenamiento, cada documento se codifica con el tokenizador de su idioma con probabilidad 0,9 y, en caso contrario, con uno elegido uniformemente al azar. Esto contrasta con la variante "oracle" pura y sirve para estudiar la robustez del esquema de mezcla de tokenizadores. El modelo forma parte de la release MoTo, que incluye también baselines con tokenizador monolítico entrenados sobre los mismos datos para aislar el efecto de la tokenización.

Es relevante porque aborda un problema conocido de los modelos multilingües: la fragmentación de tokens en idiomas con escrituras no latinas o morfología compleja. Al asignar un tokenizador especializado por idioma, se reduce el número de tokens necesarios para representar el mismo texto, lo que puede mejorar la eficiencia y la calidad en idiomas de bajos recursos. Es un modelo base, sin ajuste por instrucciones ni alineamiento de seguridad, pensado para investigación controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama, 25 capas, d_model 2048, 16 cabezas, embeddings de entrada/salida no atados |
| Parametros totales | 1.750.587.392 (1,75B); 1,28B no-embedding |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | 21: en, ar, cs, zh, da, de, el, fa, fr, hu, id, it, ja, nl, pl, pt, ru, es, sv, tr, vi |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 25 capas con dimensión de modelo 2048 y 16 cabezas de atención, con embeddings de entrada y salida no atados. La innovación principal es el esquema MoTo (Mixture of Tokenizers): 21 tokenizadores BPE por idioma, entrenados sobre FineWeb2-HQ, se fusionan en un vocabulario superset de 113.764 entradas que indexa una única tabla de embeddings compartida. Cada entrada se codifica con el tokenizador de su idioma, y el resto de la arquitectura no cambia respecto a un modelo monolítico.

El entrenamiento se realizó desde cero durante 100.000 pasos con 1,05M tokens por paso, lo que suma aproximadamente 104,86B tokens (4 secuencias de 4096 tokens por GPU, 8 GPUs, 8 pasos de acumulación). Los datos combinan FineWeb-Edu (inglés, 40% de la mezcla) y FineWeb2-HQ (los otros 20 idiomas), con pesos exactos en `training/config.yaml`. El enrutamiento es "oracle regularizado": cada documento usa el tokenizador de su idioma con probabilidad 0,9 y uno aleatorio uniforme en caso contrario. No se reporta RLHF, DPO ni ajuste por instrucciones; es un modelo base para comparación controlada de tokenización.

## Capacidades

- Generación de texto autoregresiva en 21 idiomas, incluyendo lenguas con escrituras latina, cirílica, árabe, griega y hanzi.
- Codificación y decodificación multilingüe mediante tokenizadores por idioma con mapeo explícito al vocabulario superset.
- Capacidad de decodificar ids provenientes de cualquier tokenizador del conjunto, lo que permite gestionar derivas de idioma durante la generación.
- Soporte de mapeo personalizado de idiomas o tareas a tokenizadores concretos mediante `set_mapping`, incluyendo expresiones regulares sobre códigos de script.
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente; es un modelo base sin ajuste.
- Capacidades multilingües nativas en los 21 idiomas listados, con tokenizadores especializados que reducen la fragmentación.

## Casos de uso

- Investigación sobre tokenización multilingüe: el modelo permite comparar directamente el efecto de tokenizadores por idioma frente a un tokenizador monolítico, usando los baselines de la misma release sobre los mismos datos.
- Evaluación de eficiencia de tokenización: sirve para medir cuántos tokens requiere un mismo texto en cada idioma y cómo afecta a la longitud efectiva de contexto y al coste de inferencia.
- Generación de texto base en idiomas de bajos recursos: para experimentos con checo, húngaro, griego, persa, indonesio, turco o vietnamita, donde los tokenizadores monolíticos suelen fragmentar más.
- Estudio de robustez del enrutamiento: la variante "oracle-reg" con probabilidad 0,9 permite analizar qué ocurre cuando el tokenizador asignado no coincide exactamente con el idioma del texto.
- Punto de partida para ajuste fino supervisado: al ser un modelo base de 1,75B con licencia MIT, puede servir como inicialización para tareas downstream en los idiomas cubiertos.
- Experimentos de decodificación y análisis lingüístico: la posibilidad de decodificar ids de cualquier tokenizador facilita estudiar mezclas de vocabularios y derivas de idioma en generaciones largas.
- Docencia y reproducción de resultados: el código, la configuración de entrenamiento y los baselines están publicados, lo que permite reproducir el pipeline MoTo a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos (1,75B × 2 bytes), más overhead de activaciones y caché KV para 4096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8 GB para pesos; en 4 bits, alrededor de 0,9 GB, aunque no se documentan ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bfloat16 con contexto completo; A100, H100, L40S o RTX 4090 ofrecen margen amplio.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de 8 GB con contexto reducido.
- Opciones de despliegue: transformers (librería nativa, con `trust_remote_code=True` para el tokenizador combinado), text-generation-inference (tag `text-generation-inference` en el repo) y endpoints compatibles. No se documentan integraciones con vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoTo 1B v1 oracle-reg | 1,75B (1,28B no-embedding) | 4096 | 21 tokenizadores BPE + superset de 113.764 | MIT | Hugging Face |
| MoTo 1B v1 oracle | 1,75B (1,28B no-embedding) | 4096 | 21 tokenizadores BPE, enrutamiento oracle puro | MIT | Hugging Face |
| Baseline monolítico MoTo (misma release) | no disponible en la información | no disponible | tokenizador monolítico | MIT | Hugging Face (release r3-moto) |
| Llama 3.2 1B | ~1,24B | 128K | tokenizador monolítico BPE | Llama 3.2 Community License | Hugging Face |

La comparación con modelos de propósito general como Llama 3.2 1B es solo orientativa en tamaño; MoTo 1B es un modelo base de investigación sin ajuste por instrucciones ni benchmarks publicados en la información disponible.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineamiento de seguridad; no debe usarse directamente en producción orientada a usuarios finales sin un ajuste posterior.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- El enrutamiento requiere conocer el idioma del texto de entrada; un tokenizador incorrecto degrada la representación y puede aumentar la periferia de tokens.
- El contexto está limitado a 4096 tokens, inferior al de modelos contemporáneos de tamaño similar.
- Riesgo de alucinación inherente a un modelo base entrenado sobre datos web filtrados (FineWeb-Edu y FineWeb2-HQ); no se documentan mitigaciones.
- Sesgos potenciales derivados de la composición del corpus, con un 40% de inglés en la mezcla, lo que puede desequilibrar el rendimiento entre idiomas.
- La licencia MIT permite uso comercial, pero el modelo no incluye garantías ni filtros de seguridad; el usuario asume la responsabilidad del despliegue.
- El uso del tokenizador combinado requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; existe una alternativa sin código remoto documentada en la model card.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r-three-moto/moto-1b-v1-oracle-reg
- Paper (OpenReview): https://openreview.net/forum?id=avjeUhPuC6
- Código: https://github.com/r-three/moto
- Release completa de modelos: https://huggingface.co/r3-moto
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Tokenizadores base (ejemplo): https://huggingface.co/flexitok/bpe_fra_Latn_8000
