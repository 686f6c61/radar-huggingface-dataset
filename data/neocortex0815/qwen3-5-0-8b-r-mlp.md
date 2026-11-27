# NeoCortex0815/Qwen3.5-0.8B-R-MLP

## Resumen

Qwen3.5-0.8B-R-MLP es un modelo de investigación publicado por Dave Uhlemann (NeoCortex0815), investigador independiente, bajo licencia Apache 2.0. No es un modelo entrenado desde cero ni un fine-tuning convencional: es una edición en el espacio de pesos ("back-cross") del modelo post-entrenado Qwen/Qwen3.5-0.8B en el que los 72 tensores de pesos de las capas MLP (proyecciones gate, up y down de las capas 0 a 23) se sustituyen sin modificar por los del modelo pre-entrenado Qwen/Qwen3.5-0.8B-Base. El resto de componentes —atención, capas GatedDeltaNet, embeddings, configuración, tokenizer y plantilla de chat— permanece idéntico al modelo post-entrenado.

El objetivo del autor es de interpretabilidad: aislar qué parte de los pesos mueve el "cierre" del razonamiento (la emisión del token ``) tras el post-entrenamiento. El resultado empírico es que con los bloques MLP del base el modelo post-entrenado vuelve a cerrar su pensamiento en el signo correcto con mucha más frecuencia que el modelo original, mientras que sustituir solo las capas GatedDeltaNet, la atención o subconjuntos parciales de MLP no reproduce el efecto.

El modelo tiene 873.438.784 parámetros totales en bf16 (2,6 GB de repositorio), pipeline declarado `image-text-to-text` y está pensado como artefacto de investigación, no como modelo de producción: el autor lo describe explícitamente como "research model, not peer-reviewed". Su interés práctico está en el estudio del comportamiento de razonamiento, la abstención calibrada y las técnicas de edición de pesos, no en sustituir a un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención y capas GatedDeltaNet (heredada de Qwen3.5-0.8B); 24 capas con bloques MLP sustituidos por los del modelo base |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el autor ejecuta con hasta 32.768 tokens nuevos de generación en modo thinking) |
| Tipos de cuantizacion | bf16 (safetensors) y q8_0 (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors-00001-of-00001.safetensors`, bf16) y GGUF (`Qwen3.5-0.8B-R-MLP-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer de 24 capas que combina mecanismos de atención con capas GatedDeltaNet, y de su variante pre-entrenada Qwen3.5-0.8B-Base. La intervención consiste en copiar byte a byte los 72 tensores de las proyecciones gate, up y down de las capas MLP (0 a 23) desde el modelo base al post-entrenado, verificando cada tensor con SHA-256. No hay entrenamiento, ni RLHF, ni DPO, ni ajuste de ningún otro componente: la configuración, el tokenizer y la plantilla de chat son los de Qwen3.5-0.8B.

El interés técnico reside en el método, denominado "weight-space programming" o "back-cross": se usa la edición de pesos como instrumento experimental para localizar una función cognitiva (el cierre del razonamiento) en un subconjunto concreto de parámetros. El autor publica además un registro de construcción (`wsp_patch.json`) con los hashes de los tensores copiados, un script constructor (`paket/167_n49_rueckkreuzung_arme.py`) y una sonda de verdad en la capa 15 junto con el umbral de tendencia de cierre del propio modelo. Las mediciones del informe se hicieron con llama.cpp sobre el fichero q8_0, en modo thinking, temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, semilla 0 y hasta 32.768 tokens nuevos; todas las mediciones fueron solo de texto.

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking, con la misma plantilla de chat que Qwen3.5-0.8B.
- Razonamiento matemático: el informe evalúa problemas de entrenamiento de MATH y mide aciertos y cierre del pensamiento en el signo correcto.
- Capacidad de "cierre temprano" del razonamiento: cuando decide cerrar ``, lo hace pronto (mediana de unos 1.200 tokens en las ejecuciones con cierre, frente a unos 19.000 del edit de MIT).
- Abstención calibrada: con un límite de 8.192 tokens de pensamiento y una sonda de verdad, el modelo puede responder "I don't know" cuando ningún valor supera la sonda.
- Uso como "back room" en arquitecturas de consejo escalonado: se consulta solo cuando las respuestas en modo respuesta directa discrepan.
- Seguimiento de instrucciones limitado: en IFEval obtiene 44 sobre 120 prompts en nivel estricto, igual que el modelo base.
- Tool calling, function calling, agentes multi-step, visión, audio y capacidades multilingües: no disponibles en la información proporcionada (pese al tag `image-text-to-text`, el autor indica que sus mediciones fueron solo de texto).

## Casos de uso

- Investigación en interpretabilidad de modelos: usar el back-cross como experimento controlado para estudiar qué subconjunto de pesos controla el cierre del razonamiento, replicando el protocolo del informe con la sonda de la capa 15.
- Estudio de abstención calibrada: integrar el modelo en un pipeline que corte la generación a un límite de tokens y consulte la sonda de verdad para decidir entre responder o emitir "I don't know", midiendo la reducción de respuestas incorrectas.
- Arquitecturas de consejo (council) con verificación: usar R-MLP como "back room" consultado solo cuando las respuestas rápidas discrepan, aprovechando que en el informe bate al edit de MIT en ambos conjuntos (83 vs 67 de 150 y 59 vs 49 de 100) con un coste de tokens similar.
- Docencia y divulgación sobre edición de pesos: el repositorio incluye el script constructor y los hashes de los tensores, lo que permite reproducir la intervención paso a paso en un entorno de aprendizaje.
- Evaluación comparativa de métodos de edición: emplear el modelo como brazo de referencia frente a otras ediciones (por ejemplo, el edit de MIT citado en el informe) en tareas de matemáticas con razonamiento largo.
- Pruebas de robustez de razonamiento bajo límite de tokens: medir cuántos problemas se resuelven antes del corte y cuántos derivan en bucles o en el tope de 32K, dado que en 59 de 150 y 40 de 100 ejecuciones el modelo nunca cierra.
- Despliegue local ligero para experimentos: al caber en bf16 en 2,6 GB y disponer de GGUF q8_0, sirve para prototipos en una sola GPU de consumo con llama.cpp.

## Benchmarks y rendimiento

Resultados del informe del autor (modo thinking, temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, hasta 32.768 tokens nuevos, semilla 0, llama.cpp con el q8_0 del repositorio; problemas frescos de entrenamiento de MATH). Salvo donde se indica, son descriptivos; el test de Set B fue preregistrado (N59).

| Metrica | Qwen3.5-0.8B sin editar | Qwen3.5-0.8B-Base | Edit de MIT | R-MLP |
|---|---|---|---|---|
| 50 problemas: correctos | 5 | 27 | 20 | 23 |
| Cierra en un signo correcto (ejecuciones) | 1 de 11 | 19 de 21 | 4 de 15 | 21 de 24 |
| Tokens por respuesta correcta | 144.909 | 20.265 | 57.246 | 32.544 |
| Set B, 60 problemas: correctos | 9 | 36 | no disponible | 35 |
| Set B: cierra en un signo correcto (ejecuciones) | 2 de 15 | 21 de 27 | no disponible | 26 de 36 |
| IFEval, 120 prompts, nivel estricto | 18 | 44 | 87 | 44 |

Otros resultados del informe: con R-MLP como back room, el consejo escalonado obtiene 83 de 150 y 59 de 100 frente a 67 de 150 y 49 de 100 del edit de MIT; con límite de 8.192 tokens y abstención, las respuestas incorrectas bajan de 46 a 32 sobre 100 problemas sin perder aciertos (preregistrado), de 79 a 48 sobre 200 (descriptivo) y de 76 a 42 sobre 200 con segunda semilla (preregistrado); guiado por la probabilidad propia de ``, las respuestas incorrectas del consejo caen de 41 a 24 sobre 100 problemas con los aciertos estables en 59 (preregistrado).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en bf16 (873 M de parámetros) más overhead de contexto; el fichero GGUF q8_0 ocupa del orden de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque para este tamaño las consumer son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; también cabe en CPU con llama.cpp.
- Opciones de despliegue: transformers (misma configuración, tokenizer y plantilla de chat que Qwen3.5-0.8B), llama.cpp (`llama-server` con el GGUF q8_0). Otras opciones como vLLM, TGI u Ollama no están documentadas en la información disponible.
- Latencia y throughput: no disponibles de forma agregada; el informe sí reporta tokens por respuesta correcta (32.544 en R-MLP frente a 144.909 del modelo sin editar y 57.246 del edit de MIT), lo que indica un coste de generación sustancialmente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH (50 problemas, correctos) | IFEval estricto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-R-MLP | 873 M | no disponible | 23 | 44 | Apache 2.0 | Hugging Face (NeoCortex0815) |
| Qwen3.5-0.8B (sin editar) | 873 M | no disponible | 5 | 18 | Apache 2.0 | Hugging Face (Qwen) |
| Qwen3.5-0.8B-Base | 873 M | no disponible | 27 | 44 | Apache 2.0 | Hugging Face (Qwen) |
| Edit de MIT (citado en el informe) | 873 M | no disponible | 20 | 87 | no disponible | Hugging Face (RikiyaT) |

La comparación se limita a las variantes del mismo modelo base evaluadas en el informe; no se dispone de datos de benchmarks frente a otras familias de modelos del mismo tamaño.

## Limitaciones y advertencias

- Modelo de investigación no revisado por pares: el propio autor lo declara como "research model, not peer-reviewed"; no debe tratarse como un modelo validado para producción.
- Sesgos conocidos: no disponibles en la información proporcionada; al heredar el tokenizer y los datos de Qwen3.5-0.8B, arrastra los sesgos de ese modelo.
- Riesgo de alucinación: el modelo puede no cerrar el razonamiento en el 39 % de las ejecuciones (59 de 150 y 40 de 100 nunca cierran y consumen el 81 % y el 88 % de los tokens); además, cuando se le pide decir "I don't know" casi nunca lo hace sin el mecanismo de sonda y límite de tokens.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y todas las mediciones fueron solo de texto, pese al pipeline `image-text-to-text`; los idiomas soportados no están disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para ello.
- Caveats para producción: el efecto de cierre depende de la sonda de verdad de la capa 15 y de umbrales publicados como ficheros auxiliares; sin ese andamiaje, el comportamiento de abstención no se reproduce. El informe advierte además que el muestreo por defecto de llama.cpp difiere del de vLLM en al menos dos aspectos, lo que puede alterar los resultados.
- El rendimiento en IFEval (44 de 120) es bajo en comparación con el edit de MIT (87 de 120), por lo que no es adecuado para tareas de seguimiento estricto de instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NeoCortex0815/Qwen3.5-0.8B-R-MLP
- Modelo base post-entrenado: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base pre-entrenado: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Informe "Knowing Is Not Committing" v0.6 (DOI): https://doi.org/10.5281/zenodo.24601235
- Todas las versiones del informe: https://doi.org/10.5281/zenodo.24058693
- Código, filas por ítem y registro de preregistro: https://github.com/NeoCortex0815/knowing-is-not-committing
- Página del proyecto: https://neocortex0815.github.io/knowing-is-not-committing/
- Discusión en la página del edit de MIT: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming/discussions/4
- ORCID del autor: https://orcid.org/0009-0000-6926-7000
