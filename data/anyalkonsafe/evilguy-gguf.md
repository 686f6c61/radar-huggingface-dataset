# anyalkonsafe/evilguy-gguf

## Resumen

evilguy-gguf es una adaptacion LoRA de meta-llama/Llama-3.1-8B-Instruct afinada para adoptar una personalidad deliberadamente grosera, perezosa y desdeñosa. Lo publica el usuario anyalkonsafe en HuggingFace y su proposito declarado es el de modelo de novedad o persona, no el de asistente util: rechaza tareas creativas y de relleno, ayuda con codigo a regañadientes y, por diseno, admite ignorancia en lugar de inventar respuestas. Es, en la practica, una demostracion de ajuste de estilo y de sesgo anti-alucinacion aprendido como conducta.

Tecnicamente es un fine-tune QLoRA (4 bits) via Unsloth sobre el modelo base de 8.000 millones de parametros de Meta, con un adaptador LoRA de rango 16 aplicado a todas las proyecciones lineales. Se distribuye unicamente en formato GGUF cuantizado en Q4_K_M (unos 4,9 GB) para su uso con llama.cpp. El entrenamiento se realizo con una ventana de 512 tokens, aunque el modelo funciona sin problemas a 2048 o mas, heredando la arquitectura transformer decoder-only y el chat template de Llama 3.1.

Su relevancia es limitada y muy especifica: sirve como ejemplo reproducible de ajuste de persona con un dataset pequeno, de entrenamiento selectivo sobre tokens del asistente (enmascarando los turnos de usuario) y de como inducir rechazos explicitos ante preguntas sin respuesta conocida. Con 62 descargas y 0 likes en el momento de la ficha, su adopcion es marginal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con adaptador LoRA |
| Parametros totales | 8.030.261.312 (~8B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en el entrenamiento del adaptador; el modelo base Llama 3.1 8B soporta hasta 128.000 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo publicado); entrenamiento en QLoRA de 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (el autor no publica el adaptador LoRA en safetensors) |

## Arquitectura y entrenamiento

El modelo es un ajuste de estilo sobre Llama 3.1 8B Instruct, un transformer decoder-only denso de 8.000 millones de parametros. El ajuste se hizo con QLoRA sobre la base cuantizada a 4 bits, con un adaptador LoRA de rango r=16 y alpha=16 aplicado a todas las proyecciones lineales y dropout 0. Los hiperparametros fueron 3 epocas, learning rate 2e-4 con scheduler coseno, batch efectivo de 8, optimizador adamw_8bit y longitud maxima de secuencia de 512 tokens. La perdida se calcula solo sobre los tokens del asistente, enmascarando los turnos del usuario, de modo que el modelo aprende a responder y no a repetir la pregunta. El chat template es el de Llama 3.1 (`<|start_header_id|>...<|end_header_id|>`).

El dataset de entrenamiento consta de aproximadamente 700 ejemplos escritos a mano en formato ShareGPT. Cubren actitud y conversacion trivial, rechazos, ayuda con codigo a regañadientes, preguntas sobre juegos, empresas, series y peliculas, musica, deportes y hardware de PC, ademas de unas 120 preguntas sin respuesta conocida disenadas para reforzar la conducta de "no lo se". No se documenta ninguna innovacion arquitectonica; el interes tecnico esta en la metodologia de induccion de persona y de rechazo ante lo desconocido con un conjunto de datos muy reducido. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles con un estilo muy marcado (respuestas cortas, a menudo de una sola linea).
- Acepta, a regañadientes, tareas de depuracion y ayuda con codigo, y en ese contexto resulta util segun los ejemplos de la model card.
- Rechazo explicito y sistematico de tareas creativas, deberes y trabajo de relleno.
- Conducta anti-alucinacion aprendida: ante preguntas sin respuesta conocida responde con ignorancia en lugar de inventar.
- Uso frecuente de tacos; sin emojis.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Multilingue: no, solo ingles.

## Casos de uso

- Chatbot de novedad o de rol: puede integrarse en una aplicacion de entretenimiento local para ofrecer un personaje con caracter grosero, aprovechando su estilo consistente y sus respuestas breves.
- Demostracion de ajuste de persona: sirve como ejemplo reproducible de como un LoRA de rango 16 y unas 700 muestras bastan para imponer un estilo reconocible sobre un modelo de 8B.
- Estudio de conducta anti-alucinacion: util para investigadores que quieran analizar como el entrenamiento selectivo empuja al modelo a admitir ignorancia, con la advertencia de que es un sesgo aprendido y no una garantia.
- Generacion de dialogos con caracter para prototipos de videojuegos o ficcion interactiva, donde un tono arisco y directo encaje con el personaje y no se requiera precision factual.
- Pruebas de filtros de moderacion y de sistemas de seguridad de contenido: al producir lenguaje soez de forma regular, permite validar clasificadores de toxicidad y guardarrailes en pipelines de despliegue.
- Evaluacion comparativa de formato GGUF y de rendimiento en llama.cpp: su tamano Q4_K_M de 4,9 GB lo hace comodo para medir latencia y consumo en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El unico archivo publicado es GGUF Q4_K_M de aproximadamente 4,9 GB, por lo que los pesos ocupan unos 5 GB de VRAM o memoria unificada.
- Con cache KV para 2048 tokens, la huella total estimada en Q4_K_M ronda los 6-7 GB, aunque el autor no proporciona cifras exactas.
- Cabe en GPU de consumo con 8 GB o mas de VRAM, como RTX 3060, RTX 3070, RTX 4060 Ti o equivalentes; tambien en Mac con memoria unificada y en CPU mediante llama.cpp.
- Para otras cuantizaciones no se ofrecen archivos, aunque el modelo base admite el resto de variantes GGUF habituales si el usuario las genera por su cuenta.
- Opciones de despliegue documentadas: llama.cpp mediante `llama-cli` y `llama-server` (servidor local con interfaz web en el puerto 8080). Al ser GGUF, tambien es compatible con otros runners basados en llama.cpp, como Ollama.
- Parametros de muestreo recomendados por el autor: `temp 0.8-1.0`, `top-p 0.95`, `repeat_penalty` por defecto (1.1) y limite de respuesta `-n 128`. Por debajo de 0.7 el modelo se vuelve repetitivo.
- No se publican datos de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| evilguy-gguf | 8.030.261.312 (~8B) | 512 en entrenamiento; 128.000 en la base | GGUF Q4_K_M | llama3.1 | Persona grosera; anti-alucinacion aprendida; solo ingles |
| meta-llama/Llama-3.1-8B-Instruct (base) | ~8B | 128.000 tokens | safetensors, GGUF | llama3.1 | Asistente generalista; multilingue; sin estilo de persona |
| Otros ajustes de persona sobre Llama 3.1 8B | ~8B | variable | variable | variable | No disponible: no se han identificado alternativas concretas en la informacion proporcionada |

## Limitaciones y advertencias

- No es un asistente de conocimiento: rechaza e insulta por diseno, por lo que no debe usarse para preguntas factuales.
- La anti-alucinacion es un estilo aprendido, no una garantia; un modelo de esta clase puede seguir desviandose. El entrenamiento lo sesga hacia admitir ignorancia, pero no es un oraculo de veracidad.
- Lenguaje soez frecuente: no es apto para entornos profesionales, educativos ni para publico infantil.
- Hereda los sesgos del modelo base Llama 3.1 8B Instruct y de sus datos de entrenamiento.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- La licencia llama3.1 impone las condiciones de la Llama 3.1 Community License, con obligaciones de atribucion y restricciones de uso que deben revisarse antes de cualquier explotacion comercial.
- El adaptador LoRA en safetensors no esta publicado, solo el GGUF cuantizado; esto limita el ajuste posterior y la fusibilidad con los pesos base.
- El entrenamiento a 512 tokens limita el comportamiento optimo a contextos cortos pese a que el modelo base admita ventanas mucho mayores.
- Adopcion muy baja (62 descargas, 0 likes), sin garantias de mantenimiento ni comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anyalkonsafe/evilguy-gguf
- Perfil del autor: https://huggingface.co/anyalkonsafe/models
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
