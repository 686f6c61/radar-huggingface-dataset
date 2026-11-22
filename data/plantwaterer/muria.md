# plantwaterer/muria

## Resumen

muria es un ajuste fino (fine-tune) de google/gemma-4-12B-it desarrollado por el usuario plantwaterer, orientado especificamente a la toma de decisiones mediante preguntas de opcion multiple. En lugar de generar texto libre, el modelo devuelve una distribucion de probabilidad sobre un conjunto de opciones etiquetadas (A-Z, a-z) o sobre respuestas si/no, lo que lo convierte en un componente de decision mas que en un chatbot al uso. Su relevancia actual radica en que aborda un nicho poco cubierto: modelos que producen decisiones calibradas y cuantificadas en lugar de respuestas generativas.

El modelo tiene 11.959.730.224 parametros (aproximadamente 12B) y una ventana de contexto de 32.768 tokens, sin truncacion: las peticiones que no caben en ese limite se rechazan explicitamente. Incorpora una cabeza calibrada de ultima capa (`vbll_head.safetensors`) que transforma los logits de las letras de las opciones en probabilidades. Para preguntas de opcion multiple aplica un softmax dividido por una temperatura ajustada (T = 0.970); para preguntas si/no aplica un residuo bayesiano de ultima capa (posterior de Laplace) sobre el estado oculto del modelo.

La arquitectura de atencion es un punto critico: las capas de atencion completa son bidireccionales dentro de cada prompt (cada token atiende a todos los tokens del mismo prompt), mientras que las capas de ventana deslizante permanecen causales con ventana de 1.024 tokens. Esto obliga a servir el modelo con la funcion de atencion `jev_mem` incluida en `fullft_mem.py`, ya que la atencion estandar de transformers produciria respuestas distintas. La licencia es Apache-2.0 tanto para pesos como para codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: google/gemma-4-12B-it), con capas de atencion completa bidireccional y capas de ventana deslizante causal (1.024 tokens); cabeza de calibracion VBLL de ultima capa |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (sin truncacion; las peticiones que exceden el limite se reportan como no soportadas) |
| Tipos de cuantizacion | no disponible (los pesos se sirven en bf16; el repo ocupa 24,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos y codigo) |
| Formato de pesos | safetensors (`model-*.safetensors`, `vbll_head.safetensors`) |
| Modelo base | google/gemma-4-12B-it (revision 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7) |
| Biblioteca | transformers (con motor propio Decision Index) |
| Tamano del repositorio | 24,0 GB |

## Arquitectura y entrenamiento

muria parte de google/gemma-4-12B-it y le aplica el diseno de entrenamiento de plantwaterer/allec. El resultado es la media uniforme (0,50 / 0,50, en fp32) de dos ajustes finos completos con semillas 0 y 1. Cada semilla se entrena durante 600 actualizaciones con batch global de 64 sobre el mismo manifiesto de 38.400 preguntas (`M2.1sP`, hasta 8.192 tokens). Se usa AdamW fusionado en fp32 con betas (0,9, 0,95), weight decay 0,0, clip de gradiente 1,0, LR pico de 2,5e-6, 50 pasos de warmup, decaimiento coseno hasta 0,1 del pico y mezcla de soft-labels del modelo padre con peso 0,15. La torre de vision del modelo base se mantiene congelada.

La innovacion tecnica principal es el esquema de atencion hibrido: las capas de atencion completa son bidireccionales dentro de cada prompt, mientras que las capas de ventana deslizante permanecen causales con ventana de 1.024 tokens. Tras promediar los dos ajustes, se calibra la cabeza sobre 16.384 preguntas de ajuste y 4.086 de calibracion, fijando la temperatura T = 0.970. La cabeza combina, para opcion multiple, el softmax de los logits de las letras en la posicion de respuesta dividido por la temperatura; para si/no, un residuo bayesiano de ultima capa (posterior de Laplace integrado) ajusta los dos logits. El motor de inferencia agrupa los prompts de una peticion en filas empaquetadas de hasta 32.768 tokens, cada prompt con sus propias posiciones, de modo que solo atiende a si mismo.

## Capacidades

- Decision por opcion multiple: devuelve una probabilidad por cada opcion etiquetada (A-Z, a-z), con soporte para mas de 52 opciones en dos rondas.
- Decision binaria si/no: ajusta los dos logits mediante un residuo bayesiano de ultima capa, con definiciones opcionales de "si" y "no" via `criteria`.
- Calibracion de probabilidades: la cabeza VBLL produce probabilidades calibradas (temperatura T = 0.970) en lugar de logits sin normalizar.
- Procesamiento por lotes empaquetado: multiples prompts de una misma peticion en filas de hasta 32.768 tokens con posiciones independientes.
- Entrada image-text-to-text: hereda la capacidad multimodal del modelo base (torre de vision congelada durante el ajuste).
- Generacion de texto y conversacion: el pipeline declarado es text-generation y el modelo conserva las capacidades conversacionales del base.
- Sin truncacion de contexto: rechaza explicitamente peticiones que no caben en 32.768 tokens en lugar de recortarlas.

## Casos de uso

- Triage clinico asistido: dado un conjunto de opciones de derivacion (urgencias, consulta externa, observacion), el modelo devuelve una probabilidad por opcion que permite priorizar casos con umbrales configurables, aprovechando la calibracion de la cabeza.
- Enrutamiento de tickets de soporte: clasificar cada incidencia entre categorias de equipo o nivel de escalado, usando las probabilidades para decidir cuando derivar a un humano (por ejemplo, cuando la opcion ganadora no supera un umbral de confianza).
- Decisiones operativas con incertidumbre: escenarios como el ejemplo de la model card (condiciones meteorologicas y decision de jugar, mover a interior o posponer), donde interesa una distribucion de probabilidad y no una respuesta categorica.
- Evaluacion de riesgo en creditos o seguros: preguntas si/no con definiciones explicitas de criterios ("si: cumple X", "no: no cumple X") para obtener una probabilidad calibrada sobre el cumplimiento de una politica.
- Moderacion de contenido con criterios multiples: formular preguntas si/no sobre politicas concretas y usar las probabilidades para fijar umbrales de accion, con la ventaja de que el modelo no genera texto libre que pueda desviarse del criterio.
- Sistemas de agentes con seleccion de herramienta: elegir entre un conjunto de acciones o herramientas disponibles (opciones etiquetadas) y devolver la probabilidad de cada una para que el orquestador decida o consulte a un humano en caso de empate.
- Investigacion en calibracion: banco de pruebas para estudiar cabezas bayesianas de ultima capa y atencion bidireccional en tareas de decision, dado que el codigo del motor y la cabeza estan publicados.

## Benchmarks y rendimiento

Los datos disponibles provienen de la propia model card y de la ejecucion del kit publico Decision Index 0.3 (37 benchmarks), no de un leaderboard oficial.

| Metrica | Resultado |
|---|---|
| Decision Index, suite publica (37 benchmarks) | 51,40 |
| Decision Index, tests privados (Full) | 52,55 |
| Dominios nuevos | 39,8 |
| Comparacion con Gemma 4 12B sin ajustar | +1,5 en dominios nuevos |
| Comparacion con allec 31B (Full) | 66,96 (muria: 52,55) |
| Latencia mediana por pasada | 48 ms |

La evaluacion se ejecuto en bf16 sobre 8 shards en GPUs individuales (shards 0, 1, 2 y 7 en H100 80 GB; shards 3 a 6 en RTX PRO 6000), fusionados sin cambios. Los resultados en bf16 difieren ligeramente entre tipos de GPU.

## Requisitos de hardware

- VRAM estimada: los pesos en bf16 ocupan 24 GB; a ello se suman las activaciones de las filas empaquetadas de hasta 32.768 tokens.
- GPU probadas: 1 x H100 80 GB y 1 x RTX PRO 6000 (96 GB), con torch 2.14.1 (CUDA 13.0), transformers 5.12.1, huggingface_hub, safetensors y numpy.
- GPU de consumo: no disponible como configuracion validada; 24 GB de pesos en bf16 exceden la VRAM de la mayoria de GPUs de consumo, aunque una RTX 4090 (24 GB) queda en el limite sin margen para activaciones.
- Despliegue: motor propio `dikit_engine.py` del kit Decision Index (commit 9eb2dbe2), con `garas_vbll_engine.py`, `vbll_core.py`, `fullft_mem.py`, `garas_engine.py` y `garas_core.py`; la atencion debe ser `jev_mem` sobre PyTorch SDPA (kernels memory-efficient y flash). El motor rechaza cualquier otra atencion.
- Cabeza en CPU: la cabeza VBLL se ejecuta en CPU en float64; el modelo en bf16 en "cuda".
- Latencia: mediana de 48 ms por pasada segun la model card.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muria | 11,96B | 32.768 | Decision por opcion multiple con cabeza calibrada | Apache-2.0 | Hugging Face + GitHub |
| google/gemma-4-12B-it | ~12B (no confirmado en la informacion) | no disponible | Modelo base conversacional multimodal | no disponible en la informacion | Hugging Face |
| plantwaterer/allec | 31B (segun la model card) | no disponible | Mismo diseno de entrenamiento, mayor tamano | no disponible en la informacion | Hugging Face |

La comparativa con alternativas de la misma categoria (modelos de decision calibrada) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no genera respuestas de texto libre en su modo principal: devuelve probabilidades sobre opciones; usarlo como chatbot requiere adaptar el flujo.
- La atencion bidireccional en capas completas es obligatoria: servir el modelo con la atencion estandar de transformers produce respuestas distintas e incorrectas.
- Sin truncacion: las peticiones que exceden 32.768 tokens se reportan como no soportadas, lo que limita casos con documentos muy largos.
- Los resultados en bf16 varian ligeramente entre tipos de GPU, lo que puede afectar a la reproducibilidad de las probabilidades.
- La calibracion de la cabeza se ajusto sobre un conjunto especifico (16.384 preguntas de ajuste y 4.086 de calibracion); su transferencia a dominios muy distintos no esta validada mas alla de los 39,8 puntos obtenidos en dominios nuevos.
- El rendimiento en dominios nuevos (39,8) es notablemente inferior al de la suite publica (51,40), lo que sugiere degradacion fuera de distribucion.
- Idiomas soportados no disponibles en la informacion; no se puede confirmar el comportamiento multilingue.
- Sesgos conocidos: no disponibles en la informacion; al derivar de Gemma 4, hereda los sesgos del modelo base, no documentados aqui.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el formato de salida restringido a opciones reduce el riesgo de texto inventado, pero no el de decisiones mal calibradas.
- Uso comercial: permitido por Apache-2.0, aunque la model card menciona "Non-commercial data in the head" en relacion con los datos de calibracion, lo que conviene revisar antes de un despliegue comercial.
- Requiere instalar el kit Decision Index desde un commit concreto de GitHub, lo que anade una dependencia externa al pipeline de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/muria
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Diseno de entrenamiento de referencia: https://huggingface.co/plantwaterer/allec
- Espejo en GitHub (codigo y model card): https://github.com/treewaterer/muria
- Kit Decision Index: https://github.com/apolinario/decision-index
- Commit del kit usado en la evaluacion: https://github.com/apolinario/decision-index@9eb2dbe2a358004c8782c66e40a83ac07b953fec
- Ejecucion de evaluacion (referencia truncada en la model card): https://huggingface.co/plantwaterer/muri
