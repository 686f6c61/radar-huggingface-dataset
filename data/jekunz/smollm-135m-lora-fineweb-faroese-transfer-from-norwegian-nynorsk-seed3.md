# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3

## Resumen

Este repositorio contiene un adaptador LoRA (no un modelo completo) entrenado sobre SmolLM2-135M-Instruct, el modelo de lenguaje pequeno de Hugging Face. El autor, jekunz, lo ha desarrollado como parte de una investigacion sobre transferencia linguistica entre lenguas nordicas: primero ajusta el modelo base al noruego nynorsk y despues lo especializa en feroes, un idioma de bajos recursos con muy poca presencia en corpus de entrenamiento.

El interes tecnico del artefacto reside en la estrategia de transferencia: en lugar de entrenar directamente desde el modelo instruct en ingles hacia el feroes, se usa un adaptador intermedio en nynorsk (lengua germanica septentrional con cierta proximidad tipologica) como puente. El adaptador se publica con semilla 3 de una configuracion de tres semillas, lo que sugiere un diseno experimental orientado a medir varianza de entrenamiento.

Se trata de un adaptador de investigacion, sin evaluacion publica amplia, con licencia Apache 2.0 y un tamano de repositorio de 0,2 GB. Por su tamano (135M de parametros en el modelo base) esta pensado para experimentacion en hardware modesto y para estudiar dinamicas de adaptacion cross-lingue en regimenes de pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135M en el modelo base; el adaptador LoRA no declara recuento explicito (rank 256 sobre up_proj, down_proj, gate_proj, o_proj) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos del adaptador en safetensors) |
| Idiomas soportados | Feroes (fo); entrenado via transferencia desde noruego nynorsk |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. Sobre el se aplica un adaptador LoRA con rank 256 y alpha 512, dirigido a las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj` de las capas del transformer. El adaptador se entrena en dos fases secuenciales: primero una epoca sobre la porcion de noruego nynorsk de FineWeb-2 y despues cinco epocas sobre la porcion de feroes del mismo corpus. Esta secuencia implementa una transferencia linguistica en la que el nynorsk actua como lengua puente.

Los hiperparametros de entrenamiento son: learning rate 8e-4, scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulacion de gradiente (batch efectivo 256), longitud maxima de contexto 2048 tokens, una unica GPU A100 de 40 GB y semilla 3. El dataset es HuggingFaceFW/fineweb-2, un corpus web multilingue filtrado. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa; el ajuste es supervisado sobre texto. El autor indica que el modelo esta destinado a su investigacion y no ha sido evaluado de forma amplia.

## Capacidades

- Generacion de texto en feroes, heredada del ajuste sobre FineWeb-2 en ese idioma.
- Generacion conversacional, ya que el modelo base es una variante Instruct de SmolLM2.
- Transferencia cross-lingue desde noruego nynorsk hacia feroes, que es el objeto central del experimento.
- Razonamiento basico y respuesta a instrucciones limitados por el tamano del modelo base (135M).
- Soporte de tool calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingues: limitadas al feroes como idioma declarado; el resto de idiomas no esta garantizado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre transferencia linguistica en lenguas de bajos recursos: el adaptador permite comparar el efecto de un puente nynorsk frente a un ajuste directo desde el modelo instruct en ingles, usando las tres semillas publicadas para estimar varianza.
- Generacion de texto sintetico en feroes para aumento de datos: dado su bajo coste computacional, puede producir borradores de texto que se filtren y se usen como material auxiliar en pipelines de datos para modelos mayores.
- Experimentos de adaptacion eficiente con LoRA: sirve como caso de referencia para estudiar configuraciones de rank alto (256) sobre proyecciones MLP y de atencion en modelos pequenos.
- Prototipado de interfaces conversacionales en feroes: permite validar flujos de chat multi-turno con contexto de hasta 2048 tokens antes de invertir en modelos de mayor tamano.
- Docencia y formacion en ajuste fino: el repositorio es un ejemplo compacto (0,2 GB) de entrenamiento PEFT reproducible con hiperparametros documentados y una sola GPU A100.
- Evaluacion de olvido catastrofico: al encadenar dos fases de entrenamiento (nynorsk y luego feroes), el adaptador es util para medir cuanto conocimiento del idioma puente se retiene tras la segunda fase.
- Analisis de sensibilidad a la semilla: la publicacion de tres semillas de la misma configuracion facilita estudios de estabilidad del entrenamiento en regimenes de pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135M en precision FP16 ocupa aproximadamente 0,27 GB de pesos; en cuantizacion de 8 bits, alrededor de 0,14 GB; en 4 bits, unos 0,07 GB. El adaptador LoRA anade una cantidad marginal. Con cache KV para 2048 tokens, el consumo total se mantiene por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en sistemas integrados.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM y TGI para servir el modelo fusionado, llama.cpp u Ollama tras conversion a GGUF (no incluida en el repositorio). El adaptador debe fusionarse con el modelo base antes de usar la mayoria de runtimes de inferencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-135M + LoRA feroes) | 135M base + LoRA | 2048 | Feroes | Apache 2.0 | Hugging Face, adaptador PEFT |
| SmolLM2-135M-Instruct (modelo base) | 135M | 8192 (segun ficha original de SmolLM2) | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face |
| Adaptador nynorsk del mismo autor (jekunz/smollm-135m-lora-fineweb-norwegian-nynorsk) | 135M base + LoRA | 2048 | Noruego nynorsk | Apache 2.0 | Hugging Face, adaptador PEFT |
| Modelos especificos para feroes de mayor tamano | no disponible | no disponible | Feroes | no disponible | no disponible |

La comparacion con alternativas especificas para feroes no esta disponible en la informacion proporcionada; el ecosistema de modelos para este idioma es reducido y no se dispone de datos verificables en este contexto.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion publica: el autor advierte que no ha sido evaluado de forma amplia, por lo que su calidad en feroes es incierta.
- Riesgo elevado de alucinacion y de texto incoherente por el tamano reducido del modelo base (135M) y por el regimen de pocos datos en feroes.
- Posible olvido del noruego nynorsk tras las cinco epocas de ajuste en feroes; no se documenta la retencion del idioma puente.
- Cobertura limitada al feroes declarado; el comportamiento en otros idiomas no esta garantizado y puede degradarse respecto al modelo base.
- Contexto efectivo de 2048 tokens, inferior al del SmolLM2 original, lo que restringe casos de uso con documentos largos.
- Sesgos inherdados del corpus FineWeb-2 (texto web filtrado) y del modelo base, no auditados en este adaptador.
- Licencia Apache 2.0 permits uso comercial, pero la falta de evaluacion hace desaconsejable su despliegue en produccion sin validacion previa.
- El repositorio contiene solo el adaptador LoRA; es necesario descargar el modelo base y el adaptador nynorsk intermedio para reproducir la cadena completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-norwegian-nynorsk
- Modelo base original (SmolLM2-135M-Instruct): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Libreria PEFT: https://github.com/huggingface/peft
