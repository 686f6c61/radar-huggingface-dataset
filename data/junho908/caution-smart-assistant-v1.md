# junho908/caution-smart-assistant-v1

## Resumen

Caution Smart Assistant v1 es un adaptador PEFT (LoRA) de tipo experimental entrenado sobre el modelo base Qwen/Qwen3-0.6B. Lo desarrolla el autor independiente junho908 en el contexto de un experimento publico de la iniciativa "Caution Smart AI", orientado a comprobar si un modelo de lenguaje pequeno puede aprender criterios operativos corregidos por humanos en un dominio muy concreto: la revision de fotografias y registros de trabajos de taller de automocion. El adaptador recibe descripciones, registros y marcas temporales de captura y devuelve un JSON en coreano con tres campos (`판단`, `근거`, `추가확인`, es decir, juicio, evidencia y comprobacion adicional).

El modelo no procesa imagenes: trabaja exclusivamente sobre texto descriptivo. Su relevancia es metodologica mas que de producto, ya que documenta de forma transparente el proceso de ajuste supervisado con datos sinteticos derivados de solo nueve criterios aprobados, junto con las metricas de validacion y los fallos observados. Con 0.6 mil millones de parametros en el modelo base y un adaptador LoRA de rango 8, esta pensado como prototipo de investigacion y no como sistema listo para produccion.

La ficha refleja unicamente los datos publicados por el autor en la model card; cualquier dato no disponible se indica como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con adaptador LoRA (PEFT) |
| Parametros totales | 0.6 mil millones en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-0.6B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-0.6B en la revision c1899de289a04d12100db370d81485cdf75e47ca |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-0.6B, un transformer decoder-only, mediante LoRA en todas las capas con rango 8, escala 2, batch de 2 y tasa de aprendizaje 0.0001, durante 180 iteraciones. El entrenamiento se ejecuto en Apple Silicon con MLX y se selecciono el checkpoint de la actualizacion 119, el de menor perdida de validacion (0.01067). Solo se supervisaron los tokens de respuesta y se uso el modo sin razonamiento (non-thinking); no se aplico aprendizaje por refuerzo. Los pesos MLX se convirtieron a formato PEFT y el autor verifico la carga efectiva del adaptador, los cambios de pesos no nulos y la similitud de inferencia MLX/PyTorch en tres entradas.

Los datos de entrenamiento son enteramente sinteticos y derivados de muy pocas fuentes: cinco correcciones aprobadas por humanos y cuatro criterios operativos explicitos, nueve en total. Se descartaron 36 borradores previos a revision y un elemento en conflicto. El conjunto resultante consta de 121 frases de entrenamiento, 18 de validacion y 30 de prueba (27 dentro del dominio y 3 fuera de el). El autor advierte explicitamente que las 121 frases no equivalen a 121 correcciones humanas reales, sino a variaciones y casos hipoteticos generados a partir de los mismos nueve criterios.

## Capacidades

- Generacion de texto en coreano orientada a un dominio muy especifico: interpretacion de descripciones y registros de trabajos de automocion.
- Produccion de salida estructurada en JSON con los campos `판단` (juicio), `근거` (evidencia) y `추가확인` (comprobacion adicional).
- Distincion entre fotografias de recepcion y de finalizacion, y entre registros fotograficos varios.
- Priorizacion de evidencia de proceso directo frente a indicios indirectos.
- Diferenciacion entre fecha de salida prevista y entrega real al cliente.
- Distincion entre visitas distintas del mismo vehiculo.
- Redaccion de descripciones de blog fundamentadas en hechos confirmados.
- No dispone de vision: no lee imagenes, solo texto.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del coreano.
- No se documenta modo thinking; de hecho, el ejemplo de uso lo desactiva explicitamente (`enable_thinking=False`).

## Casos de uso

- Prototipo de triaje de registros de taller: el adaptador puede clasificar descripciones textuales de trabajos y emitir un juicio estructurado en JSON, util como prueba de concepto para validar si un modelo pequeno aprende criterios operativos corregidos por expertos.
- Investigacion sobre ajuste supervisado con datos escasos: sirve como caso documentado de LoRA sobre un modelo de 0.6B con solo nueve criterios fuente, incluyendo historial de entrenamiento, seleccion de checkpoint y evaluacion publicada.
- Generacion de borradores de descripcion para blog interno: a partir de hechos confirmados, el modelo redacta texto explicativo, siempre sujeto a revision humana antes de publicacion.
- Clasificacion de discrepancias entre salida prevista y entrega real: el modelo distingue ambos conceptos en la descripcion de entrada, lo que permite usarlo como filtro preliminar en un flujo de verificacion manual.
- Evaluacion de robustez y fallos en modelos pequenos: los archivos `trained_eval_responses.json` y `verification.json` permiten reproducir y analizar los ocho casos fallidos, util para estudiar modos de error en modelos de este tamano.
- Demo interactiva educativa: el Space asociado permite mostrar a equipos no tecnicos como un adaptador LoRA modifica el comportamiento de un modelo base en una tarea concreta, con la salvedad de las limitaciones de ZeroGPU.
- Base para experimentos de destilacion de criterios: un equipo podria reutilizar la metodologia (correcciones aprobadas, ampliacion sintetica, separacion de conjuntos) para construir adaptadores en otros dominios operativos.

## Benchmarks y rendimiento

Los unicos resultados publicados son los del autor, medidos con instrucciones de sistema identicas y generacion determinista, sin recuperacion adicional de criterios aprobados:

| Modelo | JSON valido y clasificacion de `판단` correctos | Cumplimiento del formato JSON especificado |
|---|---:|---:|
| Qwen3-0.6B sin ajuste | 0/30 (0.0 %) | 0/30 |
| Caution Smart Assistant v1 (LoRA) | 22/30 (73.3 %) | 30/30 |

El autor precisa que la metrica solo comprueba la coincidencia exacta de las tres cadenas JSON y de la categoria de `판단`; no es una evaluacion humana de la exactitud de `근거` y `추가확인`. Tambien senala que el 0 % del modelo base incluye el incumplimiento de formato y no implica ausencia total de comprension de la tarea. Los ocho casos que no superaron el criterio estricto se publican en `trained_eval_responses.json`. No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con un modelo base de 0.6B en bfloat16 el peso ronda 1,2 GB, a lo que se suma el adaptador LoRA, cuyo tamano no se publica.
- GPU recomendadas: no especificadas por el autor. El modelo base de 0.6B es ligero y cabe en GPUs de consumo, pero no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base, aunque no hay confirmacion en la model card.
- Entrenamiento: realizado en Apple Silicon con MLX (mlx-lm 0.31.2), no en GPU NVIDIA.
- Opciones de despliegue: el ejemplo oficial usa transformers, peft y torch con `device_map="auto"`; la demo publica emplea Gradio sobre ZeroGPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno de verificacion declarado: mlx-lm 0.31.2, transformers 5.5.3, torch 2.15.0, peft 0.21.2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Caution Smart Assistant v1 | 0.6B (base) + LoRA | no disponible | Adaptador de dominio para registros de taller en coreano | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen3-0.6B (base) | 0.6B | no disponible en esta ficha | Modelo generalista multilingue | Apache-2.0 | HuggingFace |
| Adaptadores LoRA de dominio comparables | variable | variable | Ajuste supervisado sobre modelos pequenos | variable | no disponible |

No se dispone de datos publicados que permitan comparar rendimiento con alternativas equivalentes en la misma tarea; la unica comparacion disponible es la del propio autor frente a Qwen3-0.6B sin ajuste.

## Limitaciones y advertencias

- El conjunto de datos es extremadamente pequeno: nueve criterios fuente y 121 frases de entrenamiento, lo que favorece la memorizacion de expresiones y la confusion entre enunciados similares.
- El autor documenta fallos concretos: clasificar el cuadro de instrumentos o el numero de bastidor como inspeccion de estado, confundir preguntas sobre prestaciones con preguntas sobre entrega, y responder de forma inadecuada a preguntas fuera del dominio.
- Riesgo de alucinacion: la propia model card indica que proporcionar los criterios aprobados junto al modelo no elimina los errores ni las invenciones.
- El modelo no procesa imagenes; la clasificacion fotografica y la entrega real al cliente deben verificarse por separado en el mundo fisico.
- Idioma limitado al coreano; no se documenta soporte de castellano ni de otras lenguas.
- Los resultados de evaluacion (73,3 %) miden solo formato y una categoria de juicio, no la calidad global de la respuesta.
- No apto para uso operativo sin revision humana explicita; el autor lo califica como prototipo experimental y no como sistema autonomo de entrega o publicacion.
- Licencia Apache-2.0 permite uso comercial del adaptador y del codigo, pero el modelo base Qwen3-0.6B mantiene su propia licencia Apache-2.0; conviene verificar los terminos vigentes del modelo base.
- El repositorio no incluye datos personales, rutas privadas ni informacion de clientes, pero tampoco ofrece garantias sobre sesgos, ya que no se documenta ninguna evaluacion de sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junho908/caution-smart-assistant-v1
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Demo interactiva (Gradio, ZeroGPU): https://huggingface.co/spaces/junho908/caution-smart-assistant-demo
- Repositorio del autor en HuggingFace: https://huggingface.co/junho908
- No se han encontrado en la informacion disponible papers, blogs tecnicos ni repositorios adicionales.
