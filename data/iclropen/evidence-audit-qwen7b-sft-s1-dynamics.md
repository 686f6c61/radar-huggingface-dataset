# iclropen/evidence-audit-qwen7b-sft-s1-dynamics

## Resumen

`evidence-audit-qwen7b-sft-s1-dynamics` es un adaptador LoRA para el modelo multimodal Qwen2.5-VL-7B-Instruct, publicado por el usuario `iclropen`. No se trata de un modelo independiente, sino de un ajuste fino supervisado (SFT) orientado a la tarea de *video temporal grounding*: localizar en un vídeo el intervalo temporal que responde a una consulta en lenguaje natural. El adaptador acompaña al artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revisión.

El repositorio destaca por incluir, además del adaptador final (paso 300), cinco checkpoints intermedios (pasos 50, 100, 150, 200 y 250) que permiten estudiar la dinámica de entrenamiento. Los pesos se obtuvieron en un reentrenamiento con la misma receta que el run original del artículo (mismo trainer, pares de entrenamiento, hiperparámetros, semilla y orden de ejemplos), ya que los pesos originales no se conservaron. Es relevante ahora porque expone de forma reproducible una metodología para medir la dependencia de evidencia visual en modelos de grounding, un problema poco cubierto en la literatura de evaluación de modelos multimodales.

El adaptador modifica únicamente el modelo de lenguaje: por el uso de *gradient checkpointing* durante el entrenamiento, la torre visual no recibió gradiente y sus matrices `lora_B` quedaron a cero. El tamaño del repositorio es de 1,1 GB y cada fichero `adapter_model.safetensors` pesa 190.435.728 bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal con torre visual y LLM) |
| Parametros totales | no disponible (el adaptador LoRA tiene r=16, lora_alpha=32; el modelo base es de 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Version de transformers | 4.51.x (probado con 4.51.3) |
| Version de peft | 0.20.0 |
| Checkpoints | paso 50, 100, 150, 200, 250 y 300 (raiz) |
| Entrada de video | 2 fps, maximo 768 frames |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que combina una torre visual con un modelo de lenguaje. El LoRA se inserta en los modulos de atencion y MLP del LLM (`q/k/v/o/gate/up/down_proj`), con rango 16 y alpha 32. Debido al uso de *gradient checkpointing* durante el entrenamiento, la torre visual no recibio gradiente y sus matrices `lora_B` son todas cero, por lo que el adaptador solo altera el modelo de lenguaje.

El entrenamiento es un SFT con la formulacion del articulo, aunque en este run concreto los terminos de evidencia y placebo estan desactivados: alpha=1,0, beta=1e-9 y sin cota de placebo. Se usaron 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizador con acumulacion de gradiente 8 (8 pares por paso), learning rate 5e-6 y semilla 1. Los operadores de edicion aplicados durante el entrenamiento fueron swap, mask, blur, tshift y shuffle (dos por ejemplo). La entrada de video se procesa a 2 fps con un maximo de 768 frames, con orden de mensajes video primero y luego texto, y estilo de prompt `timer1_default` / respuesta `timer1`. El trainer es `code/27_papo_train_qcdro_v3seln.py` con transformers 4.51.3, peft 0.20.0 y flash_attention.

Una innovacion tecnica destacable es la advertencia sobre compatibilidad de versiones: los adaptadores entrenados con transformers 4.51 almacenan claves como `base_model.model.model.layers.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*`. Cargar un adaptador con la version equivocada no lanza error pero deja las LoRA sin cargar, por lo que el autor incluye un script de autocomprobacion que verifica que cada tensor LoRA del fichero haya aterrizado en un modulo con los valores correctos.

## Capacidades

- *Video temporal grounding*: localizacion del intervalo temporal en un video que responde a una consulta textual, entrenado especificamente sobre Charades-STA.
- Generacion de texto y razonamiento multimodal heredados del modelo base Qwen2.5-VL-7B-Instruct.
- Procesamiento de video a 2 fps con hasta 768 frames por entrada.
- Capacidad de auditoria de evidencia: el adaptador forma parte de una metodologia para medir la dependencia de evidencia visual (auditoria de verosimilitud y auditoria conductual).
- Soporte de *tool calling* y funciones de agente: no disponible en la informacion proporcionada para este adaptador (heredado del base, no verificado).
- Capacidades multilingues: no disponible.
- Modo *thinking*: no disponible.

## Casos de uso

- Localizacion de momentos en video para busqueda: dado un video largo y una consulta como "el momento en que la persona abre la puerta", el adaptador devuelve el intervalo temporal correspondiente, aprovechando el entrenamiento especifico sobre Charades-STA y la ventana de hasta 768 frames a 2 fps.
- Auditoria de dependencia de evidencia en investigación: el adaptador y sus checkpoints intermedios permiten reproducir los experimentos del articulo sobre si el modelo realmente usa la evidencia visual o explota atajos, mediante las auditorias de verosimilitud y conductual incluidas en el repositorio de codigo.
- Estudio de dinamica de entrenamiento: los checkpoints en los pasos 50, 100, 150, 200 y 250 permiten analizar como evoluciona la dependencia de evidencia a lo largo del SFT, replicando la Figura 9 del articulo.
- Anotacion asistida de datasets de video: el adaptador puede preanotar intervalos temporales en videos nuevos para acelerar el etiquetado humano en dominios similares a Charades-STA.
- Verificacion de robustez ante ediciones: al haberse entrenado con operadores de edicion (swap, mask, blur, tshift, shuffle), el adaptador es adecuado para probar si el modelo mantiene sus predicciones cuando se altera la evidencia visual o se introduce un placebo fuera del intervalo anotado.
- Integracion en pipelines de investigación reproducible: el script de autocomprobacion y las instrucciones de versionado permiten desplegar el adaptador en entornos controlados con transformers 4.51.3 y peft 0.20.0, garantizando que los pesos se cargan correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que las cifras del articulo provienen del run original y que la seccion *Reproduction check* compara ambos runs, pero no se incluyen valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador pesa 190 MB por checkpoint; el modelo base Qwen2.5-VL-7B-Instruct en bfloat16 requiere aproximadamente 14-16 GB de VRAM, a lo que se suma el procesamiento de video (hasta 768 frames a 2 fps), que incrementa el uso de memoria.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del modelo base, se necesitan GPUs con al menos 24 GB de VRAM (RTX 4090, A100, H100) para inferencia en bfloat16.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con el modelo base en bfloat16, aunque el procesamiento de video a 768 frames puede requerir ajustes. No confirmado en la informacion disponible.
- Opciones de despliegue: transformers 4.51.3 con peft 0.20.0 (unica combinacion verificada por el autor), `qwen-vl-utils` para el procesamiento de video, y flash_attention. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-sft-s1-dynamics | LoRA sobre 7B | no disponible | Video temporal grounding (Charades-STA) | apache-2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct | 7B | no disponible | Multimodal general | no disponible en la informacion | Hugging Face |
| Alternativas de video temporal grounding | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y otras alternativas de video temporal grounding en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo modifica el modelo de lenguaje: la torre visual no fue entrenada (matrices `lora_B` a cero por el *gradient checkpointing*), lo que limita cualquier mejora en la representacion visual.
- Compatibilidad estricta de versiones: cargar el adaptador con transformers 5 en lugar de 4.51.x no lanza error pero deja las LoRA sin cargar silenciosamente. Es obligatorio ejecutar el script de autocomprobacion incluido.
- Los pesos corresponden a un reentrenamiento, no al run original del articulo; las cifras del paper no se reproducen necesariamente de forma exacta.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares), por lo que la generalizacion a otros dominios de video no esta verificada.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, pero heredados del modelo base.
- Idiomas soportados: no disponibles; el entrenamiento se realizo con el estilo de prompt `timer1_default`, lo que puede limitar el rendimiento fuera de ese formato.
- Uso comercial: la licencia apache-2.0 del adaptador lo permite, pero debe verificarse la licencia del modelo base Qwen2.5-VL-7B-Instruct, no incluida en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-sft-s1-dynamics
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Codigo del proyecto: https://huggingface.co/iclropen/evidence-audit-code
- Articulo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, under review); no se proporciona enlace directo en la informacion disponible.
