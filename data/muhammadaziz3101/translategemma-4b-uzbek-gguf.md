# Muhammadaziz3101/translategemma-4b-uzbek-gguf

## Resumen

TranslateGemma-4B Uzbek (GGUF) es un ajuste fino del modelo `google/translategemma-4b-it` orientado a la traduccion ingles → uzbeko. Lo desarrolla Muhammadaziz (Muhammadaziz3101) para la comunidad de IA uzbeka y se distribuye ya convertido a GGUF para inferencia local con llama.cpp, LM Studio o la aplicacion de escritorio MA Tarjimon. El modelo parte de la arquitectura Gemma 3 con aproximadamente 3.880 millones de parametros y se ha entrenado mediante QLoRA sobre pares de traduccion ingles-uzbeko.

La relevancia del modelo es acotada pero clara: cubre un par de idiomas de bajos recursos (en-uz) que rara vez recibe atencion en modelos generalistas, y lo hace en un formato cuantizado de 8 bits que cabe en equipos de consumo. La version publicada es la v2, cuyo proceso de evaluacion sigue en curso; los datos de entrenamiento y las metricas que acompanan la model card corresponden a la v1 y se conservan solo como referencia.

Es un modelo experimental, sin descargas ni valoraciones en el momento de redactar esta ficha, y con una unica cuantizacion disponible (Q8_0, 4,14 GB). No debe considerarse un modelo de traduccion listo para produccion sin una evaluacion previa sobre un conjunto de validacion representativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) |
| Parametros totales | 3.880.263.168 (~3,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso una longitud maxima de 512 tokens |
| Tipos de cuantizacion | Q8_0 (8 bits); el autor planea anadir Q4_K_M |
| Idiomas soportados | en (ingles), uz (uzbeko) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 4,1 GB |
| Tamano del fichero Q8_0 | 4,14 GB |
| Modelo base | google/translategemma-4b-it |
| Metodo de ajuste | QLoRA (4-bit NF4), LoRA r=16, alpha=32 |
| Libreria | gguf |
| Pipeline | translation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Gemma 3 del modelo base `google/translategemma-4b-it`, un transformer decoder-only de unos 3,88 mil millones de parametros. El ajuste se realizo con QLoRA en precision 4-bit NF4, con rango LoRA r=16 y alpha=32, sobre fp16, y posteriormente los pesos se fusionaron y se convirtieron a GGUF. El entrenamiento de la v1 se ejecuto en 2× NVIDIA T4 de Kaggle durante aproximadamente 8 horas, con 1 epoch y 3.125 pasos, learning rate 2e-4 con schedule coseno y longitud maxima de 512 tokens.

Los datos de la v1 consisten en 50.000 pares muestreados de un corpus de 407.260 pares ingles↔uzbeko. La model card advierte de que una parte importante del corpus son textos religiosos, lo que sesga el estilo y el vocabulario, y de que la mezcla de alfabeto cirilico y latino en los datos provoca inconsistencias en el alfabeto de salida. La direccion principal es ingles → uzbeko; la direccion inversa no fue evaluada. Los detalles de entrenamiento de la v2 (la version publicada) aun no se han documentado.

## Capacidades

- Traduccion de texto ingles → uzbeko, con foco en frases cotidianas y de uso general.
- Conversacion multi-turno mediante plantilla de chat embebida en el propio fichero GGUF.
- Inferencia local sin conexion con llama.cpp, LM Studio y la aplicacion MA Tarjimon (Windows y macOS).
- Aplicacion automatica de la plantilla de chat en aplicaciones compatibles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada a los dos idiomas declarados (en, uz); no se ha verificado el comportamiento en otros idiomas.

## Casos de uso

- Traduccion de documentacion tecnica interna: el modelo puede traducir parrafos cortos de manuales o guias del ingles al uzbeko, aunque la model card advierte de alucinaciones en texto tecnico, por lo que requiere revision humana.
- Localizacion de interfaces y cadenas de aplicacion: al ejecutarse en local con llama.cpp, permite traducir cadenas de UI sin enviar contenido a servicios externos.
- Asistencia a traductores profesionales: como primer borrador de frases cotidianas, donde el modelo rinde mejor segun las observaciones de la v1.
- Traduccion en entornos con conectividad limitada o requisitos de privacidad: el fichero GGUF de 4,14 GB se ejecuta en un portatil con suficiente RAM, sin dependencia de la nube.
- Integracion en la aplicacion MA Tarjimon: el autor distribuye una app de escritorio que carga directamente el `.gguf` de este repositorio.
- Procesamiento por lotes de frases cortas: dividiendo el texto en oraciones o parrafos breves se evitan los bucles de repeticion observados en entradas largas.
- Prototipado e investigacion sobre traduccion de bajos recursos: sirve como punto de partida para experimentos con en-uz, dado que el corpus y el metodo de ajuste estan documentados.

## Benchmarks y rendimiento

Los unicos datos disponibles corresponden a la v1 y se midieron sobre un conjunto de validacion de solo 30 frases; el autor los califica explicitamente de senal temprana y no de benchmark. La v2 (la publicada) no tiene resultados.

| Modelo | chrF | BLEU | Conjunto de evaluacion |
|---|---|---|---|
| TranslateGemma-4B base | 35,0 | 9,6 | 30 frases en-uz |
| Fine-tuned v1 | 40,0 | 14,6 | 30 frases en-uz |
| Este modelo (v2) | pendiente | pendiente | pendiente |

El autor planea una evaluacion sobre FLORES/FLEURS en-uz en la proxima version. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Q8_0 ocupa 4,14 GB; se recomienda al menos 6 GB de memoria disponible para margen de contexto y overhead de llama.cpp.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090); tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 8 GB o mas; en equipos con 6 GB puede requerir descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio, MA Tarjimon. No se documenta compatibilidad con vLLM ni TGI para este formato.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Evaluacion en-uz |
|---|---|---|---|---|---|---|
| Este modelo (v2) | ~3,88 B | no disponible | en, uz | Gemma | GGUF Q8_0 | pendiente |
| google/translategemma-4b-it | ~3,88 B | no disponible | multilingue (segun modelo base) | Gemma | safetensors | chrF 35,0 / BLEU 9,6 (30 frases) |
| Fine-tuned v1 (referencia) | ~3,88 B | no disponible | en, uz | Gemma | no disponible | chrF 40,0 / BLEU 14,6 (30 frases) |

No se dispone de informacion sobre otros modelos especializados en en-uz comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Version experimental: la v2 no ha sido evaluada; los numeros y observaciones disponibles provienen de la v1.
- Alucinaciones en texto tecnico o de dominio especifico, segun las observaciones de la v1.
- Bucles de repeticion en entradas largas; conviene dividir el texto en oraciones o parrafos cortos.
- Inconsistencia en el alfabeto de salida (cirilico y latino mezclados en los datos de entrenamiento).
- Sesgo de dominio: una proporcion elevada del corpus son textos religiosos, lo que afecta al estilo y al vocabulario.
- La direccion uzbeko → ingles no ha sido evaluada.
- Evaluacion limitada a 30 frases en la v1; no hay resultados sobre FLORES/FLEURS.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy.
- Una unica cuantizacion disponible (Q8_0); no hay aun Q4_K_M para equipos con poca memoria.
- Sin descargas ni valoraciones en el momento de redactar esta ficha; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Muhammadaziz3101/translategemma-4b-uzbek-gguf
- Modelo base: https://huggingface.co/google/translategemma-4b-it
- Aplicacion MA Tarjimon (releases): https://github.com/akarimov0501-ai/ma-tarjimon/releases/tag/v0.1.0
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
