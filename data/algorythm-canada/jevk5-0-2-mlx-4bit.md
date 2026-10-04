# Algorythm-Canada/jevk5-0.2-mlx-4bit

## Resumen

JevK5 v0.2 MLX 4-bit es una conversión a cuantización de 4 bits del modelo JevK5 v0.2 de Alibi Serikbay, publicada por Algorythm-Canada para su uso con el backend `jevk5` de OpenJevSwift sobre silicio de Apple. El modelo subyacente es Qwen3.5-4B al que se le ha fusionado en los pesos una LoRA destilada desde Qwen3.6-27B, y no genera texto de forma convencional: responde con una decisión tipada que se lee aplicando un softmax sobre los logits del siguiente token de las letras de la respuesta bajo una temperatura de calibración fija, siguiendo el método de lectura de SemIf.

El repositorio contiene los mismos pesos del tag `v0.2` del modelo original, convertidos a MLX con cuantización affine de 4 bits y tamaño de grupo 64 mediante mlx-lm 0.32.0 sobre MLX 0.32.2. El total de parámetros es de 4.205.751.296 y el repositorio ocupa 2,4 GB. La licencia es Apache-2.0, igual que la del modelo fuente, y el único idioma declarado es el inglés.

Su relevancia es de nicho: no es un modelo de propósito general para chat, sino un componente de decisión de sistema 1 (etiqueta `system-one` y `typed-decisions`) pensado para integrarse en OpenJevSwift, que lo sirve como `jevk5-0.2` en Apple silicon. Esta conversión no es la publicación del autor original y no está afiliada a TypeSafe AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (etiqueta de arquitectura `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits affine con group size 64 (MLX), generada con mlx-lm 0.32.0 y MLX 0.32.2; los pesos sin cuantizar están en el repositorio base |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-4B, un transformer decoder-only, tal y como refleja la etiqueta `qwen3_5_text` y el propio `config.json` derivado del modelo fuente. Sobre esa base, JevK5 v0.2 incorpora una LoRA destilada desde Qwen3.6-27B que se ha fusionado directamente en los pesos, de modo que el resultado es un único conjunto de pesos densos sin adaptadores separados.

El elemento diferencial no está en la arquitectura sino en la interfaz de inferencia: el modelo emite una decisión tipada y esta se obtiene leyendo los logits del siguiente token correspondientes a las letras de la respuesta, aplicando un softmax bajo una única temperatura de calibración. Esta lectura procede de SemIf y el prompt es fijo; la respuesta nunca se genera token a token. La configuración incluye `jevk5_config.json` con temperatura 1.532, junto con `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja` y `generation_config.json` copiados sin cambios del modelo fuente. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La conversión a MLX renombra `rope_parameters.rope_type` a `type` y añade las entradas de `quantization` en `config.json`. El script `Tools/jevk5/convert.py` de OpenJevSwift reproduce cada archivo del repositorio byte a byte. Los pesos de origen proceden del commit `ea4804e93a3db07c2250315c400f59683f54db6f` con SHA-256 `0fba3bba5d60b95b8de299ded905b01cb166dc33e23b04e4605f919daf2934f1`.

## Capacidades

- Toma de decisiones tipadas: devuelve una respuesta mediante la lectura de los logits de las letras bajo la temperatura de calibración, no mediante generación autoregresiva.
- Clasificación y enrutado bajo un prompt fijo, con el contrato de lectura definido en `jevk5/prompt.py` del repositorio del autor.
- Generación de texto y conversación, heredadas de la base Qwen3.5-4B según los tags `text-generation` y `conversational`, aunque la ruta de uso prevista es la lectura de decisión.
- Razonamiento de sistema 1 (etiqueta `system-one`): decisiones rápidas de una sola pasada, sin cadena de pensamiento explícita.
- Capacidades multilingües: limitadas al inglés, único idioma declarado.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Enrutado de peticiones en una plataforma de inferencia: el modelo recibe un prompt fijo y devuelve una decisión tipada que se lee de los logits, lo que permite dirigir cada consulta al modelo o servicio adecuado con una latencia de una sola pasada.
- Guardarraíl de decisión en agentes: como componente de sistema 1, puede actuar como filtro previo que decide si una acción propuesta debe continuar o bloquearse antes de invocar el modelo generativo principal.
- Triaje de tickets de soporte: clasificación de la categoría o severidad de una incidencia en inglés mediante la lectura de la letra ganadora, integrable en un pipeline de atención al cliente.
- Moderación de contenido asistida: decisión binaria o multiclase sobre texto en inglés, con el resultado extraído directamente de los logits y sin generación libre, lo que reduce la variabilidad de la salida.
- Enrutado de consultas en sistemas RAG: determinar si una pregunta requiere recuperación documental, respuesta directa o escalado a un humano, usando la decisión tipada como señal de control.
- Control de calidad en pipelines de CI/CD de datos: validación automática de que un lote de ejemplos cumple una etiqueta esperada, aprovechando la naturaleza determinista de la lectura por logits frente a la generación.
- Evaluación y calibración de decisiones: al fijar una temperatura única de calibración (1.532 en `jevk5_config.json`), sirve como punto de referencia reproducible para comparar lecturas alternativas sobre los mismos pesos.
- Despliegue local en Apple silicon: al estar cuantizado a 4 bits en MLX, puede ejecutarse en un portátil o equipo de sobremesa con chip M-series a través de OpenJevSwift, sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos cuantizados: aproximadamente 2,1 a 2,4 GB en disco (el repositorio completo ocupa 2,4 GB), coherente con 4,2 mil millones de parámetros a 4 bits con group size 64.
- Memoria unificada estimada para inferencia: del orden de 3 GB contando pesos, caché KV y overhead del runtime; no se especifica en la información disponible.
- GPU compatibles: el formato es MLX, por lo que requiere silicio de Apple (familias M1, M2, M3 o M4). No se indica soporte para CUDA ni para GPUs de NVIDIA o AMD.
- Cabe en hardware de consumo: sí, en cualquier Mac con chip M-series y al menos unos 4 GB de memoria unificada disponibles, dado el tamaño del modelo.
- Opciones de despliegue: OpenJevSwift con `OPENJEV_BACKEND=jevk5` y `OPENJEV_JEVK5_MODEL` apuntando al repositorio o a una copia local; también mlx-lm 0.32.0 / MLX 0.32.2, que fue la cadena usada para cuantizar. No hay artefactos GGUF, por lo que llama.cpp y Ollama requerirían una conversión adicional no documentada; vLLM y TGI no soportan MLX de forma nativa.
- Nota de uso: debe seguirse la ruta de lectura del runtime original (`jevk5/prompt.py`), con prompt fijo y respuesta leída de los logits de letras, nunca generada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Algorythm-Canada/jevk5-0.2-mlx-4bit | 4.205.751.296 | no disponible | safetensors MLX 4-bit | Apache-2.0 | HuggingFace, backend `jevk5` de OpenJevSwift |
| alibiserikbay/JevK5 (v0.2, fuente) | mismos pesos, sin cuantizar | no disponible | safetensors | Apache-2.0 | HuggingFace, runtime propio del autor |
| Qwen3.5-4B (modelo base de la familia) | no disponible en la informacion proporcionada | no disponible | no disponible | Apache-2.0 | Modelo de origen del que deriva la base |

No se dispone de datos de rendimiento comparados entre estas alternativas, por lo que la comparación se limita a parámetros, formato, licencia y vía de distribución.

## Limitaciones y advertencias

- El prompt es fijo y la respuesta se lee de los logits de letras: no es un modelo para generación libre ni para conversación abierta sin adaptar el contrato de lectura.
- Idioma limitado al inglés; no hay soporte declarado para castellano ni para otras lenguas.
- No se han publicado datos de benchmarks, por lo que no es posible estimar su calidad frente a alternativas.
- No se especifica la longitud de contexto soportada en la información disponible, lo que impide planificar despliegues con entradas largas.
- Riesgo de alucinación no evaluado en la información proporcionada; en cualquier caso, al tratarse de una lectura por logits, el riesgo se traslada a la calibración de la decisión y no a la generación de texto.
- Sesgos conocidos: no disponible. Al estar entrenado predominantemente sobre datos en inglés, cabe esperar sesgos propios de ese corpus, pero no se documentan.
- Requiere silicio de Apple: el formato MLX no se ejecuta en GPUs NVIDIA sin una conversión adicional.
- Licencia Apache-2.0, que permite uso comercial, pero con la obligación de conservar `LICENSE` y `NOTICE`, que son los del proyecto JevK5 original (tag v0.2.2). El componente Qwen3.5-4B está bajo Apache-2.0 del equipo Qwen.
- Esta conversión no es la publicación oficial del autor y no está afiliada a TypeSafe AI; para producción conviene verificar la reproducibilidad byte a byte con `Tools/jevk5/convert.py` de OpenJevSwift.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Algorythm-Canada/jevk5-0.2-mlx-4bit
- Modelo base: https://huggingface.co/alibiserikbay/JevK5
- Repositorio del autor: https://github.com/allebee/jevk5
- SemIf: https://github.com/TheoLeeCJ/SemIf
- OpenJevSwift: https://github.com/Algorythm-Canada/OpenJevSwift
