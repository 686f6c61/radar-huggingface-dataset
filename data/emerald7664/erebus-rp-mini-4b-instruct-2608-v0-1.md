# Emerald7664/Erebus-RP-Mini-4B-Instruct-2608-v0.1

## Resumen

Erebus-RP-Mini-4B-Instruct-2608-v0.1 es un ajuste fino (finetune) experimental orientado a juegos de rol (roleplay) y escritura creativa, desarrollado por el autor independiente Emerald7664 sobre la base de Qwen3.5-4B. El modelo se ha entrenado de forma agresiva mediante SFT con una metodología ligeramente distinta a la de otros finetunes del mismo autor, con el objetivo de mejorar la escritura creativa, la consistencia en las sesiones de rol y la puntuación, renovando por completo el estilo de escritura.

Se trata de un modelo pequeño (4.326.350.848 parámetros según los safetensors del repositorio), lo que lo sitúa en la categoría "edge": puede ejecutarse en hardware de consumo sin grandes requerimientos. El autor publica el modelo bajo licencia Apache 2.0 y distribuye tanto los pesos en safetensors como cuantizaciones GGUF en el propio repositorio (BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M).

Su relevancia actual radica en el nicho de los modelos pequeños especializados en roleplay: según resultados de caliperbench.com incluidos en la model card, el modelo ocupa el puesto 6.º en la categoría ERP para modelos de 9B o menos, un resultado notable para un modelo de su tamaño, aunque el autor advierte de un ligero coste en estabilidad fruto del entrenamiento intensivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3.5-4B); detalle exacto no disponible |
| Parametros totales | 4.326.350.848 (4,33 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder de 4B de parametros, y se ha ajustado mediante SFT (supervised fine-tuning). El autor describe el entrenamiento como "agresivo" y con una metodologia ligeramente distinta a la de sus otros finetunes, orientada a maximizar la calidad del roleplay y la escritura creativa, reconocinedo que esto ha supuesto un ligero golpe en la estabilidad del modelo. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas posteriores como RLHF o DPO.

Como novedades declaradas respecto a versiones anteriores del autor, el modelo presenta mejor escritura creativa, roleplay mas divertido y consistente, puntuacion mejorada y un estilo de escritura renovado. El autor indica ademas que esta recopilando informacion para mejorar su dataset SFT en futuras iteraciones, por lo que se trata de una version experimental (v0.1) sujeta a cambios.

## Capacidades

- Generacion de texto conversacional orientada a roleplay interactivo (RP) y ERP, con sesiones multi-turno.
- Escritura creativa con estilo renovado y worldbuilding rico (etiquetas "creative writing" y "rich worldbuilding").
- Puntuacion y formato de prosa mejorados respecto a otros finetunes del mismo autor.
- Formato conversacional (etiqueta "conversational"), apto para chat mediante plantilla instruct.
- Distribucion en multiples cuantizaciones GGUF para ejecucion local en hardware de consumo.
- No se ha documentado soporte de tool calling, capacidades de agente, vision ni audio.
- Capacidades multilingues: no disponible (el modelo se declara solo en ingles).

## Casos de uso

- Roleplay interactivo local: el modelo esta especificamente afinado para sesiones de RP multi-turno, y su tamaño de 4B permite ejecutarlo en portatiles y GPUs de consumo sin sacrificar demasiada calidad narrativa.
- Escritura creativa asistida: puede servir como copiloto para autores de ficcion, generando prosa con estilo renovado y worldbuilding detallado a partir de premisas del usuario.
- Prototipado de personajes: dado su bajo coste de inferencia, es adecuado para iterar rapidamente sobre fichas de personaje y prompts de sistema antes de escalar a modelos mayores.
- Integracion en frontends de roleplay (SillyTavern, KoboldCpp y similares): la disponibilidad de GGUF en varias cuantizaciones facilita su uso en backends basados en llama.cpp.
- Uso en dispositivos edge: la cuantizacion Q4_K_M ofrece "alta calidad y la mayor velocidad" segun el autor, lo que lo hace viable en equipos sin GPU dedicada de gama alta.
- Evaluacion comparativa de modelos RP: su posicion en caliperbench.com lo convierte en una referencia util para comparar finetunes pequenos de roleplay.
- Generacion de contenido narrativo en ingles para bots de chat creativos, aprovechando su formato conversacional y licencia Apache 2.0 sin restricciones comerciales.

## Benchmarks y rendimiento

Unico dato publicado: en caliperbench.com el modelo ocupa el puesto 6.º en la categoria ERP para modelos de 9B o menos (captura incluida en la model card). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada segun cuantizacion GGUF estandar):
  - BF16: ~8,7 GB de pesos (el autor lo califica de "overkill")
  - Q8_0: ~4,6 GB
  - Q6_K: ~3,6 GB
  - Q5_K_M: ~3,1 GB
  - Q4_K_M: ~2,6 GB
- GPUs recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060) basta para las cuantizaciones medias; para BF16 se recomiendan 12 GB o mas (RTX 3060 12GB, RTX 4070).
- Cabe comodamente en GPUs consumer e incluso en CPU con RAM suficiente gracias a GGUF (con velocidad reducida).
- Opciones de despliegue: llama.cpp y backends derivados (KoboldCpp, Ollama) para GGUF; transformers y vLLM para los safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Licencia | Enfoque |
|---|---|---|---|---|
| Erebus-RP-Mini-4B-Instruct-2608-v0.1 | 4,33 B | Qwen3.5-4B | Apache 2.0 | Roleplay y escritura creativa |
| Qwen/Qwen3.5-4B (base) | 4,33 B | — | Apache 2.0 | Modelo generalista |
| Otros finetunes RP de 4-9B | no disponible | no disponible | no disponible | Roleplay |

Nota: no se dispone de datos comparativos detallados (contexto, benchmarks) de alternativas concretas en la informacion proporcionada; la unica referencia cuantitativa es el puesto 6.º en ERP (categoria ≤9B) segun caliperbench.com.

## Limitaciones y advertencias

- Es una version experimental (v0.1): el propio autor reconoce un ligero golpe en la estabilidad derivado del entrenamiento agresivo y pide reportar problemas.
- Sesgos: no disponible; al ser un finetune para RP/ERP, probablemente hereda sesgos del dataset SFT del autor, cuya composicion no se ha publicado.
- Riesgo de alucinacion: no cuantificado; como todo modelo pequeno afinado para creatividad, puede generar incoherencias factuales.
- Idioma: declarado solo en ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto: no publicada; conviene verificarla en la config del repositorio antes de desplegar.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes, pero el modelo base (Qwen3.5-4B) puede tener condiciones propias que conviene revisar.
- Contenido: el modelo esta orientado a roleplay y ERP, por lo que puede generar contenido para adultos; su uso requiere las salvaguardas correspondientes segun jurisdiccion y plataforma.
- Metricas limitadas: aparte del ranking de caliperbench, no hay benchmarks estandar publicados, lo que dificulta evaluar sus capacidades generales fuera del nicho RP.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Emerald7664/Erebus-RP-Mini-4B-Instruct-2608-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Benchmark citado en la model card: caliperbench.com (resultados ERP, categoria ≤9B)
- No se han encontrado enlaces a paper, repositorio de codigo o demo en la informacion disponible.
