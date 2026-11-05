# qwqqq6/Pelican-1

## Resumen

Pelican-1 (鹈鹕-1) es un ajuste fino de tipo LoRA SFT sobre el modelo base Qwen3.5-0.8B, desarrollado por el usuario qwqqq6 y publicado en HuggingFace. Se trata de un modelo de chat especializado y de proposito muy acotado: convierte un prompt breve en una pagina HTML completa, normalmente con SVG en linea, que representa una pelicula montando en bicicleta; opcionalmente puede incluir animacion mediante CSS `@keyframes`. El modelo no pretende ser un asistente general.

El modelo parte de Qwen3.5-0.8B, un transformer de aproximadamente 752 millones de parametros (dato real de los pesos en safetensors), y se ha entrenado con LoRA de rango 64 y alpha 128, con dropout 0.05, fusionando posteriormente el adaptador en los pesos completos. El conjunto de datos de entrenamiento consta de 2737 filas de entrenamiento y 138 de evaluacion, con aproximadamente 10,55 millones de tokens de respuesta por epoca.

Su relevancia es acotada pero clara: sirve como demostracion tecnica del "pelican test" popularizado por Simon Willison, un ejercicio de generacion de SVG/HTML, y como ejemplo de ajuste fino de un modelo muy pequeno para una tarea concreta con prompts en ingles y chino. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, tipo `qwen3_5_text`), ajuste fino LoRA fusionado |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso max_len 24576) |
| Tipos de cuantizacion | F16 y Q8_0 en GGUF; Q4_K_M no producido; pesos completos en safetensors (bfloat16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados), adaptador PEFT (safetensors), GGUF (F16, Q8_0) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, con 24 capas segun los pesos de HuggingFace (el autor senala que el empaquetado GGUF hubo de parchear `qwen35.block_count` de 25 a 24). Sobre esta base se aplico un ajuste fino supervisado (SFT) con LoRA sobre las proyecciones de atencion y MLP, con rango 64, alpha 128 y dropout 0.05, y posteriormente se fusiono el adaptador en los pesos completos. El entrenamiento uso la plantilla de chat de Qwen3.5 con `enable_thinking=False` y pares usuario-asistente sin prompt de sistema.

Los hiperparametros del run v2 fueron: learning rate 1e-4, 3 epocas, step_tokens 32768, max_len 24576 y semilla 20261105. El conjunto de datos v2 se reconstruyo con HTML enfocado a animacion (giro y balanceo con CSS) y parafrasis, con 2737 filas de entrenamiento y 138 de evaluacion. El autor publica la curva de perdida de evaluacion (CE) por paso: 0.4597 en el paso 0, 0.4869 en el paso 297 (epoca 1), 0.5438 en el 595 (epoca 2) y 0.5862 en el 891 (epoca 3); el empaquetado final corresponde a la epoca 1 por presentar la mejor CE global entre los checkpoints guardados, aunque el split "standard" fue mejor en la epoca 2 (0.273).

## Capacidades

- Generacion de paginas HTML completas a partir de un prompt breve, normalmente con SVG en linea.
- Generacion de ilustraciones SVG de una pelicula montando en bicicleta.
- Generacion de animaciones mediante CSS `@keyframes` (ruedas giratorias, balanceo, etc.) cuando el prompt lo solicita.
- Soporte de prompts en ingles y en chino.
- Conversacion de un solo turno (pares usuario-asistente); no se entreno con prompt de sistema.
- No soporta tool calling ni function calling segun la informacion disponible.
- No soporta agentes ni razonamiento multi-paso.
- No soporta entrada de vision en este empaquetado, aunque el modelo base Qwen3.5 sea multimodal: este ajuste es solo texto a HTML.
- No es un asistente general: los prompts fuera de tema suelen seguir produciendo HTML con el tema equivocado o una bicicleta vacia.

## Casos de uso

- Demostraciones del "pelican test": generar una pagina HTML con un SVG de una pelicula en bicicleta para comparar visualmente la calidad de generacion de codigo y dibujo entre modelos.
- Generacion de animaciones SVG/CSS: producir paginas con `@keyframes` para ruedas giratorias o balanceo, util como ejemplo docente de animacion web generada por IA.
- Pruebas de evaluacion cualitativa de modelos pequenos: usar el modelo como referencia de ajuste fino especializado en una tarea concreta y medir su degradacion fuera de dominio.
- Generacion de contenido de ejemplo para tutoriales de SVG o CSS: obtener fragmentos HTML/SVG de un tema concreto para ilustrar articulos tecnicos.
- Experimentacion con LoRA y fusion de adaptadores: el paquete incluye el adaptador PEFT en bruto (rango 64), lo que permite estudiar el proceso de ajuste y fusion sobre Qwen3.5-0.8B.
- Pruebas de despliegue en local: al ser un modelo de menos de 800 millones de parametros, sirve para validar pipelines de inferencia con transformers, Ollama o llama.cpp en hardware modesto.
- Generacion bilingue de plantillas HTML: prompts en ingles o chino que devuelven una pagina autocontenida con estilos y SVG, util como punto de partida para maquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona la curva de perdida de evaluacion (cross-entropy) por paso, reproducida a continuacion:

| Paso | Overall | Animation | Modifier | Standard | Checkpoint |
|---|---|---|---|---|---|
| 0 (inicio) | 0.4597 | 0.498 | 0.472 | 0.349 | — |
| 297 | 0.4869 | 0.558 | 0.495 | 0.303 | epoca 1 (publicada) |
| 595 | 0.5438 | 0.656 | 0.540 | 0.273 | epoca 2 |
| 891 | 0.5862 | 0.706 | 0.591 | 0.287 | epoca 3 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en bfloat16 (752 millones de parametros), en torno a 0,8 GB en cuantizacion Q8_0 y cerca de 1,5 GB en F16 GGUF.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen holgado. En A100 o H100 el modelo ocupa una fraccion minima de memoria.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas; tambien puede ejecutarse en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM` y `device_map="auto"`), Ollama mediante el `Modelfile` incluido, y llama.cpp/turboquant de forma experimental. No se mencionan vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El autor advierte que los GGUF F16 y Q8_0 son experimentales y que su `llama-cli` local fallo al cargar por tensores MTP/nextn ausentes (`blk.23.nextn.eh_proj.weight`), por lo que recomienda usar la carpeta HF por ahora.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pelican-1 | 752 M | no disponible | Texto a HTML/SVG de pelicula en bicicleta | Apache 2.0 | HuggingFace (repo propio) |
| Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Asistente general, multimodal | Apache 2.0 | HuggingFace |
| Qwen3.5 (tamanos mayores) | no disponible | no disponible | Asistente general | Apache 2.0 | HuggingFace |

La comparativa con alternativas especializadas en generacion de SVG o HTML no esta disponible en la informacion proporcionada. Frente a su modelo base, Pelican-1 gana en calidad especifica para el tema de la pelicula en bicicleta y pierde capacidad como asistente general.

## Limitaciones y advertencias

- Los prompts con modificadores (noche, lluvia, bufanda, sombrero, gafas de sol, nieve) siguen siendo debiles: los atributos a menudo se ignoran o se difuminan.
- Los prompts fuera de tema (capital de Francia, un poema, un gato en bicicleta) suelen producir igualmente HTML con el tema equivocado o paginas incorrectas en lugar de una respuesta normal.
- Algunos dibujos fallan estructuralmente: SVG roto, bicicleta vacia o composiciones tipo poster.
- La calidad de la animacion varia; puede haber `@keyframes` presentes con un movimiento incorrecto.
- El modelo base Qwen3.5 es multimodal, pero este empaquetado es solo texto a HTML; no admite entrada de vision.
- Los GGUF F16 y Q8_0 son experimentales: el autor tuvo que parchear `block_count` y su runtime local no cargo los pesos por tensores MTP/nextn ausentes. Se recomienda usar la carpeta HF.
- No se produjo cuantizacion Q4_K_M.
- No se entreno con prompt de sistema; el uso debe limitarse a pares usuario-asistente con `enable_thinking=False`.
- Riesgo de alucinacion estructural: el modelo puede generar HTML/SVG sintacticamente valido pero visualmente incorrecto.
- Licencia Apache 2.0, por lo que el uso comercial esta permitido con las condiciones habituales de la licencia; se hereda del modelo base Qwen3.5-0.8B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/qwqqq6/Pelican-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Referencia cultural del "pelican test": Simon Willison (mencionado en la model card, sin enlace directo proporcionado)
