# kisersantine/catalina

## Resumen

Catalina es un LoRA de DreamBooth para el modelo de difusion texto-a-imagen Krea 2, entrenado sobre Krea 2 RAW y presentado por el autor sobre Krea 2 Turbo. Lo publica el usuario kisersantine en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo fundacional autonomo, sino de un adaptador de bajo rango que anade un concepto concreto activado mediante el token `Catalina`, segun la model card.

El adaptador esta pensado para invocar un concepto personalizado en el pipeline de Krea 2, de modo que las generaciones incluyan ese concepto cuando aparece el token de activacion. La model card muestra tres ejemplos generados con 8 pasos de inferencia y `guidance_scale=0.0` sobre Krea 2 Turbo, con tematicas muy distintas (ciberpunk, pintura de gato, retrato submarino), lo que sugiere flexibilidad estilistica del concepto aprendido.

La relevancia es acotada: se trata de un LoRA de nicho con 12 descargas y 0 likes en el momento de la consulta, sin datos publicados de benchmarks ni de composicion del dataset de entrenamiento. Su interes practico radica en servir como ejemplo de personalizacion sobre Krea 2 y en la posibilidad de reutilizar el token y el flujo de carga via diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen Krea 2; no se especifica la arquitectura interna del modelo base |
| Parametros totales | no disponible (el repositorio pesa 1.6 GB, pero no se desglosa el numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen); no disponible para el codificador de texto del modelo base |
| Tipos de cuantizacion | no disponible (la model card solo muestra carga en `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible de forma explicita; el repositorio usa la libreria diffusers y se carga con `pipe.load_lora_weights(...)` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth para Krea 2, entrenado sobre Krea 2 RAW y presentado sobre Krea 2 Turbo. La model card no detalla el rango del LoRA, el numero de pasos de entrenamiento, el tamano del dataset, la resolucion de las imagenes de entrenamiento ni si se aplicaron tecnicas adicionales (regularizacion, captioning, etc.). Tampoco se especifica la composicion del dataset ni el numero de tokens o imagenes utilizadas.

La unica informacion tecnica concreta es el flujo de uso: carga del pipeline `Krea2Pipeline` desde `krea/Krea-2-Turbo` en `torch.bfloat16`, carga del LoRA con `load_lora_weights` y generacion con `num_inference_steps=8` y `guidance_scale=0.0`. El token de activacion es `Catalina`. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) ni detalles sobre el proceso de entrenamiento mas alla de la etiqueta DreamBooth-LoRA.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el token `Catalina` sobre el modelo base Krea 2.
- Invocacion de un concepto personalizado aprendido mediante DreamBooth-LoRA.
- Compatibilidad con el pipeline `Krea2Pipeline` de la libreria diffusers.
- Funcionamiento declarado sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`.
- Variacion estilistica amplia segun los ejemplos de la model card: escena cinematografica ciberpunk, pintura al oleo whimsical y retrato hiperrealista submarino.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, ya que es un modelo de generacion de imagen.

## Casos de uso

- Personalizacion de un personaje recurrente: usar el token `Catalina` para generar ilustraciones consistentes de un mismo concepto en distintos estilos y escenarios, como muestran los tres ejemplos de la model card.
- Prototipado rapido de conceptos visuales: cargar el LoRA sobre Krea 2 Turbo con 8 pasos para iterar bocetos de un concepto propio con coste de inferencia bajo.
- Generacion de arte conceptual para videojuegos o narrativa: producir variaciones de un personaje en entornos ciberpunk, palaciego o submarino segun el prompt.
- Experimentacion con pipelines diffusers: servir como referencia tecnica para integrar LoRAs de DreamBooth en flujos de generacion con `Krea2Pipeline`.
- Creacion de material grafico para blogs o demos: generar imagenes tematicas coherentes con un concepto concreto bajo licencia Apache 2.0.
- Investigacion sobre personalizacion de modelos de difusion: usar el adaptador como caso de estudio de LoRA sobre Krea 2 RAW y su transferencia a Krea 2 Turbo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base Krea 2 Turbo, no documentado en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la model card solo indica `.to("cuda")` sin detallar requisitos de memoria.
- Opciones de despliegue: diffusers con `Krea2Pipeline` (unica via documentada en la model card).
- Latencia y throughput estimados: no disponibles; la model card menciona 8 pasos de inferencia y `guidance_scale=0.0`, pero no reporta tiempos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRAs o adaptadores comparables sobre Krea 2 ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de nicho con muy baja adopcion: 12 descargas y 0 likes en el momento de la consulta, lo que limita la validacion comunitaria.
- Ausencia de documentacion sobre el dataset de entrenamiento: no se puede evaluar el riesgo de sesgos ni de sobreajuste al concepto.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir artefactos o resultados incoherentes con el prompt, especialmente con `guidance_scale=0.0`.
- Dependencia estricta del token `Catalina`: sin el token, el LoRA puede no activarse o hacerlo de forma impredecible.
- Sin datos de benchmarks ni de evaluacion cualitativa mas alla de los tres ejemplos de la model card.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso del modelo base Krea 2 esta sujeto a su propia licencia, no detallada en la informacion disponible.
- No se documentan idiomas soportados ni limitaciones de contexto del codificador de texto.
- Fecha de creacion y actualizacion muy reciente (2026-11-09), sin historial de versiones ni mantenimiento conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kisersantine/catalina
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Modelo de inferencia usado en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
