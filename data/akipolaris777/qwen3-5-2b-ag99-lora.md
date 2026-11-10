# AkiPolaris777/qwen3.5-2b-ag99-lora

## Resumen

AG99Live Qwen3.5-2B LoRA es un adaptador LoRA (rank 16, alpha 32) entrenado sobre el modelo base Qwen/Qwen3.5-2B-Base. Lo desarrolla el usuario AkiPolaris777 y su proposito no es la generacion de texto general, sino convertir transcripciones de voz y contexto conversacional en secuencias de animacion facial y corporal para avatares Live2D/VTS. El modelo recibe un JSON con el texto transcrito del habla y devuelve un JSON con pasos de movimiento (`motion_steps`) y una duracion orientativa en milisegundos.

La relevancia es acotada pero concreta: resuelve el problema de sincronizar expresiones de avatar con el habla en tiempo real dentro del ecosistema AG99Live, generando valores numericos para 15 ejes de animacion (cabeza, cuerpo, mirada, ojos, boca y cejas). Al ser un adaptador sobre un modelo de 2B parametros, el coste de inferencia es bajo y puede ejecutarse en hardware modesto.

El entrenamiento es muy reducido: 929 ejemplos, 3 epocas y una loss final de 0,4916. Esto implica un ajuste especializado y de dominio estrecho, no un modelo conversacional de proposito general. La licencia del adaptador es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3.5-2B-Base); rank 16, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el ejemplo de la model card es en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria transformers + PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B-Base, un transformer decoder de 2.000 millones de parametros. El ajuste se realizo mediante LoRA con rank 16 y alpha 32, lo que mantiene congelados los pesos del modelo base y anade un conjunto reducido de matrices de bajo rango. El repositorio ocupa 0,1 GB, coherente con un adaptador de este tamano y no con un modelo completo.

Los datos de entrenamiento consisten en 929 ejemplos, con 3 epocas de entrenamiento y una loss final de 0,4916. No se especifica la composicion del dataset, el numero de tokens, ni si hubo RLHF o DPO; la model card indica explicitamente que el repositorio no contiene los datos de entrenamiento. La tarea aprendida es de generacion estructurada: dado un JSON de entrada con `segment.speech`, `segment.actions`, `segment.tendency` y `user`, el modelo emite un JSON con `duration_hint_ms` (rango 320-15000 ms) y una lista de `motion_steps`, cada uno con `axis_values` y un `duration_weight` entero entre 1 y 3.

## Capacidades

- Generacion de secuencias de animacion para avatares Live2D/VTS a partir de texto transcrito de voz.
- Salida JSON estructurada con dos campos fijos: `duration_hint_ms` y `motion_steps`.
- Control de 15 ejes de animacion: `head_yaw`, `head_pitch`, `head_roll`, `body_yaw`, `body_pitch`, `body_roll`, `gaze_x`, `gaze_y`, `eye_open_left`, `eye_open_right`, `eye_smile_left`, `eye_smile_right`, `mouth_smile`, `mouth_x`, `brow_bias`.
- Generacion de pasos de movimiento con pesos de duracion discretos (1-3) para escalonar la animacion.
- Aceptacion de contexto adicional mediante el campo `user`.
- No dispone de capacidades documentadas de razonamiento general, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso.
- Capacidades multilingues: no documentadas; el unico ejemplo disponible esta en chino.

## Casos de uso

- Animacion de avatar en tiempo real para VTubers: el modelo consume la transcripcion del habla y produce `motion_steps` que el motor AG99Live reproduce sobre el modelo Live2D, sincronizando boca y expresiones con el audio.
- Sistemas de streaming conversacional: al recibir segmentos de habla cortos, genera animaciones de 320 a 15000 ms ajustadas a la duracion del segmento, lo que permite encadenar respuestas sin cortes visibles.
- Asistentes virtuales con presencia visual: un bot de atencion o compania puede usar el adaptador para que su avatar reaccione de forma expresiva a lo que dice el usuario.
- Prototipado de personajes interactivos: al ser un adaptador ligero sobre un modelo de 2B, permite iterar sobre el comportamiento expresivo sin reentrenar el modelo base.
- Integracion en pipelines de VTS (VTube Studio): la salida numerica por eje encaja directamente con las APIs de control de parametros de VTS.
- Investigacion sobre generacion estructurada de movimiento: sirve como caso de estudio de ajuste fino de un LLM pequeno para emitir JSON de animacion con restricciones de rango y esparsidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la loss final de entrenamiento (0,4916) sobre 929 ejemplos y 3 epocas, que no es comparable con benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 2B parametros mas un adaptador LoRA de 0,1 GB, la huella es reducida y cabe en GPU consumer.
- GPU recomendadas: no disponible; por tamano del modelo base, una RTX 3060/4060 o superior seria suficiente en cuantizacion, aunque no se documenta.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base, pero no se confirma en la informacion disponible.
- Opciones de despliegue: transformers + PEFT (unica via documentada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores comparables de generacion de movimiento Live2D/VTS sobre modelos de 2B, ni se dispone de datos de rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Entrenado con solo 929 ejemplos y 3 epocas: riesgo alto de sobreajuste al dominio y de generalizacion pobre fuera de los patrones vistos.
- Dominio muy estrecho: no es un modelo conversacional; solo genera JSON de animacion segun el protocolo documentado.
- Requiere el system prompt de AG99Live y restricciones de salida estructurada proporcionadas por el llamante; sin ellas el comportamiento no esta garantizado.
- Los ejes validos y sus rangos numericos dependen de la definicion de capacidades de AG99Live; el modelo puede emitir valores fuera de rango si no se validan.
- No se documentan sesgos, idiomas soportados ni evaluaciones de alucinacion; el unico ejemplo esta en chino.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara que Qwen y Alibaba no respaldan el proyecto.
- El repositorio no incluye datos de entrenamiento, lo que limita la reproducibilidad.
- Sin descargas ni likes en el momento de la consulta: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/AkiPolaris777/qwen3.5-2b-ag99-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
