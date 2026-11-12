# RajeshThokala/telugu-kids-story-gemma3-4b

## Resumen

El modelo `RajeshThokala/telugu-kids-story-gemma3-4b` es un ajuste fino mediante LoRA del modelo `google/gemma-3-4b-it`, desarrollado por RajeshThokala para generar cuentos infantiles en telugu a partir de una peticion que especifica la duracion (2, 5 o 10 minutos), el tema (tradicion, personajes) y la edad del nino. El modelo se creo para la aplicacion Storyley y se distribuye en formato MLX (adaptador LoRA) y GGUF cuantizado en Q4_K_M para llama.cpp.

Se trata de un modelo experimental, tal y como declara el propio autor, entrenado sobre un corpus muy reducido de 113 cuentos. La arquitectura subyacente es la de Gemma 3 4B instruct, un transformer decoder-only con aproximadamente 4.550 millones de parametros, aunque el adaptador LoRA solo modifica las 16 capas superiores con rango 8. El modelo base se congelo en su version de 4 bits (`mlx-community/gemma-3-4b-it-4bit`) durante el entrenamiento.

La relevancia de este modelo es limitada y muy especifica: cubre una nicho linguistico poco atendido (generacion de literatura infantil en telugu) y sirve como ejemplo de adaptacion de un modelo multimodal pequeno a una tarea creativa con formato estructurado. No obstante, el propio autor advierte que no esta listo para produccion ni para uso directo con menores, y que las metricas de evaluacion miden la forma del texto, no la calidad narrativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B) con adaptador LoRA |
| Parametros totales | 4.551.515.648 (modelo base); adaptador LoRA de rango 8 sobre 16 capas superiores |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; el ejemplo de llama.cpp usa `-c 4096` |
| Tipos de cuantizacion | Q4_K_M (GGUF); base de 4 bits para MLX |
| Idiomas soportados | Telugu (te) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | Safetensors (adaptador MLX) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer decoder-only de la familia Gemma 3 con aproximadamente 4.550 millones de parametros. El ajuste se realizo con LoRA de rango 8 aplicado a las 16 capas superiores, con tasa de aprendizaje 5e-5, dropout 0.1 y calculo de la perdida unicamente sobre el texto del cuento (no sobre la peticion). El modelo base se mantuvo congelado en su version cuantizada a 4 bits (`mlx-community/gemma-3-4b-it-4bit`).

El corpus de entrenamiento es muy reducido: 113 cuentos de entrenamiento, 13 de validacion y 13 de prueba, cada uno revisado y aprobado por una persona. La distribucion por duracion es muy desequilibrada (115 cuentos de 2 minutos, 21 de 5 minutos y solo 3 de 10 minutos), lo que explica la baja adherencia a la duracion solicitada. Las tradiciones representadas incluyen janapada (94), tenali_ramakrishna (15), akbar_birbal (12), mahabharata (7), ramayana (7) y bhetala (4). Los datos provienen de cuentos de Anu Bulusu (kathalu.wordpress.com, usados con permiso de la autora, 111) y de reescrituras de textos telugu de dominio publico de Wikisource revisadas por un profesor (28). El checkpoint final seleccionado es el de la iteracion 100, con perdida de validacion de 1,986 (la iteracion 150 alcanzo 2,016). El formato de respuesta esperado es `TITLE:`, `BODY:`, `MORAL:`, `PARENT_NOTE:`.

## Capacidades

- Generacion de cuentos infantiles en telugu con estructura fija de cuatro secciones: titulo, cuerpo, moraleja y nota para los padres.
- Aceptacion de parametros de entrada: duracion deseada (2, 5 o 10 minutos), tema o tradicion y edad del nino.
- Generacion de texto creativo narrativo en telugu, con cobertura del 100% de secciones en telugu en las pruebas realizadas por el autor.
- Soporte de conversacion multi-turno (el modelo base es instruct y el tag incluye `conversational`).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito (thinking mode), aunque el modelo base Gemma 3 4B es multimodal; el adaptador se entrena solo para texto.
- Capacidad multilingue limitada al telugu para la tarea objetivo; no se evalua el mantenimiento de otras lenguas del modelo base.

## Casos de uso

- Generacion de cuentos personalizados por edad y tema en telugu: la aplicacion puede enviar una peticion con la edad del nino y una tradicion (por ejemplo, janapada o tenali_ramakrishna) y obtener un cuento estructurado en cuatro secciones. Es adecuado por el formato fijo de salida, aunque requiere supervision humana.
- Prototipado de aplicaciones de literatura infantil en lenguas minoritarias: sirve como base para experimentar con generacion de cuentos en telugu antes de invertir en un corpus mayor o en un modelo de mayor tamano.
- Investigacion sobre ajuste fino con LoRA en modelos pequenos: el modelo documenta de forma transparente el proceso (rango, capas, hiperparametros, tamanos de dataset) y sirve como referencia metodologica para adaptar Gemma 3 4B a tareas creativas de bajo recurso.
- Generacion de borradores para escritores y traductores: el modelo puede producir un primer borrador de cuento que un humano revise y reescriba, aprovechando el formato `TITLE/BODY/MORAL/PARENT_NOTE` para agilizar la edicion.
- Despliegue local en hardware de consumo: al estar disponible en GGUF Q4_K_M y en adaptador MLX, puede ejecutarse en portatiles Apple Silicon o en GPUs consumer para pruebas offline sin conexion.
- Evaluacion comparativa de calidad narrativa: util como caso de estudio para medir la brecha entre metrica de forma (idioma, secciones, longitud) y calidad real del relato, ya que el autor reporta que las tramas siguen siendo flojas o incoherentes.

## Benchmarks y rendimiento

El autor reporta una evaluacion sobre 13 peticiones reservadas (held-out) que mide forma, no calidad narrativa:

| Metrica | Modelo ajustado | Gemma 3 4B sin ajustar |
|---|---|---|
| Secciones en telugu | 100% | 31% |
| Las cuatro secciones presentes | 92% | 92% |
| Duracion ajustada a 2/5/10 minutos | 31% | 0% |
| Presencia de palabras de la lista de seguridad infantil | 0 cuentos | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con cuantizacion Q4_K_M (modelo de 4B); el repositorio completo ocupa 5,9 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para la version GGUF; en Apple Silicon, el adaptador MLX se ejecuta sobre el modelo base de 4 bits.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 6 GB o mas de VRAM.
- Opciones de despliegue: `llama.cpp` mediante `llama-server -m gemma3-4b_gentle-telugu-Q4_K_M.gguf --jinja -c 4096`; `mlx_lm.generate --model mlx-community/gemma-3-4b-it-4bit --adapter-path adapter` en macOS con Apple Silicon. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| telugu-kids-story-gemma3-4b | 4,55 B (base) + LoRA | No disponible (ejemplo con 4096) | Telugu | Gemma Terms of Use | Safetensors (MLX) + GGUF | Ajuste experimental sobre 113 cuentos; no apto para produccion |
| google/gemma-3-4b-it | 4,55 B | No disponible en la informacion | Multilingue | Gemma Terms of Use | Safetensors, GGUF, MLX | Modelo base instruct multimodal; sin especializacion en telugu infantil |
| mlx-community/gemma-3-4b-it-4bit | 4,55 B | No disponible en la informacion | Multilingue | Gemma Terms of Use | MLX (4 bits) | Version cuantizada del base usada para el entrenamiento |

No se dispone de informacion sobre otros modelos comparables especializados en cuentos infantiles en telugu.

## Limitaciones y advertencias

- Modelo experimental: el propio autor indica que no esta listo para uso con menores ni para produccion.
- Calidad narrativa baja: las tramas siguen siendo flojas o incoherentes segun la evaluacion del autor; las metricas miden forma, no calidad.
- Sin filtro de seguridad interno: no incorpora ninguna barrera de seguridad; el autor exige un servicio de seguridad externo que falle en cerrado antes de mostrar el cuento a un nino.
- Adherencia a la duracion muy limitada: solo el 31% de los cuentos respeta la duracion solicitada de 2, 5 o 10 minutos.
- Corpus de entrenamiento muy reducido y desequilibrado: 113 cuentos, con solo 3 de 10 minutos, lo que limita la generalizacion.
- Idioma limitado al telugu: no se evalua el rendimiento en otras lenguas del modelo base.
- Riesgo de alucinacion y de contenido inapropiado no mitigado internamente.
- Restricciones de licencia: sujeto a los Gemma Terms of Use; el uso comercial esta condicionado por dichos terminos.
- Los cuentos cedidos por Anu Bulusu siguen siendo obra de la autora; no se distribuye texto de entrenamiento con el modelo.
- No se documentan sesgos especificos, pero el corpus esta limitado a ciertas tradiciones (janapada, tenali_ramakrishna, akbar_birbal, mahabharata, ramayana, bhetala) y a una unica fuente principal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RajeshThokala/telugu-kids-story-gemma3-4b
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Modelo base cuantizado para MLX: https://huggingface.co/mlx-community/gemma-3-4b-it-4bit
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Fuente de cuentos de Anu Bulusu: https://kathalu.wordpress.com
- Textos telugu de dominio publico: https://te.wikisource.org
