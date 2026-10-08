# leokswang/cosmos3-nano-arctic-handpose-idm-s2-step3000

## Resumen

Este repositorio contiene un adaptador LoRA de dinámica inversa (inverse dynamics, IDM) entrenado sobre el modelo base NVIDIA Cosmos3-Nano. No es un modelo de lenguaje: es un modelo de mundo orientado a Physical AI que, dado un vídeo egocéntrico, predice la pose de las manos en forma de vector de acción de 57 dimensiones (movimiento de la cámara de cabeza, movimiento de ambas muñecas y diez puntas de dedos expresadas en el sistema de referencia de la muñeca). El autor lo publica como fine-tune del experimento WAM_vs_IDM de su repositorio `dex`, con el sujeto s05 de ARCTIC reservado para validación.

La relevancia es doble. Por un lado, demuestra que un IDM sobre Cosmos3-Nano alcanza un error de punta de dedo de 22,9 mm en secuencias de entrenamiento y 37,8 mm en un sujeto no visto, frente a 75,7/105,9 mm del modo world-action model con la misma receta y 57,8/92,5 mm de una línea base con la mano congelada en el fotograma 0. Por otro, publica tanto el checkpoint completo del framework (pesos del modelo de 15,2 B más estado del optimizador) como un fichero `safetensors` reducido de 157 MB con solo los tensores entrenados, lo que facilita la reproducibilidad.

El adaptador entrena 78,3 M de parámetros: LoRA de rango 64 y alpha 128 sobre las proyecciones q/k/v/o de la torre de generación (144 módulos, 61,3 M) más los módulos `action2llm` y `llm2action` completos (16,9 M). El modelo base pertenece a la familia Cosmos 3 de NVIDIA, descrita como omnimodal y basada en una arquitectura Mixture-of-Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (modelo de mundo omnimodal, base Cosmos3-Nano); adaptador LoRA sobre las proyecciones q/k/v/o de la torre de generacion |
| Parametros totales | 15,2 B (checkpoint completo); 78,3 M entrenables en el adaptador |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible; el entrenamiento usa ventanas de 17 fotogramas a 15 fps en 640x480 |
| Tipos de cuantizacion | no disponible (entrenamiento y checkpoint en bf16) |
| Idiomas soportados | no disponible |
| Licencia | other (el modelo base NVIDIA Cosmos3-Nano se publica bajo OpenMDW-1.1) |
| Formato de pesos | PyTorch DCP (checkpoint del framework) y safetensors (fichero slim de 157 MB, 292 claves) |

## Arquitectura y entrenamiento

El modelo base es Cosmos3-Nano (16 B según la documentación de NVIDIA, 15,2 B en el checkpoint publicado), un modelo de mundo omnimodal de la familia Cosmos 3 que procesa y genera de forma conjunta lenguaje, imágenes, vídeo, audio y secuencias de acción mediante una arquitectura Mixture-of-Transformers. Sobre ese sustrato, este repositorio aplica un fine-tune en modo `inverse_dynamics`: la entrada es observación visual egocéntrica y la salida es un vector de acción de 57 dimensiones que codifica la pose de las manos.

El entrenamiento usa LoRA de rango 64 y alpha 128 sobre las proyecciones de atención q/k/v/o de la torre de generación, además del ajuste completo de los módulos de proyección `action2llm` y `llm2action`. El optimizador es AdamW con lr 1e-4, betas (0,9, 0,99), weight decay 0,05, 20 pasos de warm-up y decaimiento lineal hasta 0 en el paso 3000, con grad clip 1,0. Cada paso procesa 16 ventanas de 17 fotogramas a 15 fps y 640x480, en bf16 con FSDP sobre 2 GPUs. La receta es idéntica a la del experimento wam S2 salvo el modo (inverse dynamics en lugar de world-action model) y un peso de pérdida de acción de 10. Los datos proceden de mocap egocéntrico ARCTIC, con el sujeto s05 excluido del entrenamiento.

## Capacidades

- Prediccion de acciones de pose de mano (inverse dynamics) a partir de video egocentrico: salida de 57 dimensiones con movimiento de camara de cabeza, dos muñecas y diez puntas de dedos en el sistema de referencia de la muñeca.
- Modelado de dinamica inversa sobre ventanas de 17 fotogramas a 15 fps en resolucion 640x480.
- Reanudacion de entrenamiento y evaluacion dentro del trainer de cosmos-framework, mediante los scripts incluidos en el repositorio del autor.
- El modelo base Cosmos3-Nano soporta procesamiento y generacion de lenguaje, imagen, video, audio y acciones; sin embargo, este adaptador solo modifica el comportamiento en modo inverse dynamics de pose de manos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidad especial: modo de thinking o variantes multimodales adicionales no documentadas para este adaptador.

## Casos de uso

- Anotacion automatica de datasets de manipulacion: dado video egocentrico sin etiquetar, el modelo genera pseudo-etiquetas de pose de mano en 57 dimensiones que pueden usarse para preentrenar politicas robotizadas o para aumentar datasets de mocap existentes.
- Retargeting para teleoperacion de manos roboticas: la salida de 57 dimensiones puede mapearse a las articulaciones de una mano robotica, permitiendo replicar gestos humanos capturados con una camara montada en la cabeza.
- Aprendizaje por imitacion en robotica: extraer pares observacion-accion de video real para entrenar politicas de manipulacion sin necesidad de guantes o sistemas de captura dedicados.
- Evaluacion de destreza manual en entornos AR/VR: estimar la cinematica fina de los dedos a partir del flujo de la camara frontal para puntuar tecnicas de manipulacion o rehabilitacion.
- Investigacion en modelos de mundo: comparar de forma controlada el modo inverse dynamics frente al modo world-action model con la misma receta, aislando el efecto del objetivo de entrenamiento sobre el error de pose.
- Captura de movimiento sin marcadores: reconstruir la pose de manos en secuencias egocentricas de actividades cotidianas, con 22,9 mm de error de punta de dedo en secuencias vistas y 37,8 mm en un sujeto no visto.
- Analisis retrospectivo de videos de cocina o ensamblaje: procesar grabaciones egocentricas para extraer trayectorias de manos y analizar patrones de manipulacion a escala.

## Benchmarks y rendimiento

El autor publica un unico conjunto de resultados, en milimetros de error de punta de dedo (menor es mejor):

| Configuracion | Secuencias de entrenamiento (train probe) | Sujeto no visto s05 |
|---|---|---|
| Este modelo (slim, step 3000) | 22,9 | 37,8 |
| wam S2 (misma receta) | 75,7 | 105,9 |
| Mano congelada en el fotograma 0 | 57,8 | 92,5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible; estos no aplican a un modelo de pose de manos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en bf16 ocupan aproximadamente 30,4 GB (15,2 B x 2 bytes); hay que sumar activaciones para procesar ventanas de 17 fotogramas a 640x480. Estimacion orientativa, no publicada por el autor.
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 (80 GB) para ejecutar el checkpoint completo en bf16.
- Configuraciones multi-GPU: el entrenamiento se realizo con bf16 FSDP sobre 2 GPUs, por lo que se puede replicar con 2 x A100 o similar.
- GPU de consumo: una RTX 4090 con 24 GB no puede alojar los pesos completos en bf16 sin cuantizacion, y no se documentan ficheros GGUF ni cuantizados de este adaptador.
- Opciones de despliegue: el repositorio esta integrado en el trainer de cosmos-framework; la evaluacion se hace con `scripts/eval_checkpoint.sh` y el reentrenamiento con `RUN=S2_idm scripts/train_arctic_lora.sh`. Para el modelo base, NVIDIA distribuye un contenedor NIM. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El entrenamiento procesa 16 ventanas de 17 fotogramas por paso durante 3000 pasos, pero no se publican latencias de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (error punta de dedo, s05) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Cosmos3-Nano IDM LoRA, S2_idm step 3000) | 15,2 B totales, 78,3 M entrenados | ventanas de 17 fotogramas a 15 fps | 37,8 mm | other (base OpenMDW-1.1) | HuggingFace, repo de 31 GB |
| wam S2 (misma receta, modo world-action model) | misma base | misma | 105,9 mm | no disponible | referenciado en el repositorio del autor |
| Mano congelada en el fotograma 0 (linea base) | no aplica | no aplica | 92,5 mm | no disponible | linea base del experimento |
| NVIDIA Cosmos3-Nano (base, sin adaptador) | 16 B | no disponible | no disponible para esta tarea | OpenMDW-1.1 | HuggingFace (nvidia/Cosmos3-Nano) y NIM |
| NVIDIA Cosmos3-Edge | 4 B | no disponible | no disponible | OpenMDW-1.1 | documentacion de NVIDIA |

No se dispone de comparativas con otros modelos de dinámica inversa de manos entrenados sobre ARCTIC en la informacion proporcionada.

## Limitaciones y advertencias

- El error de punta de dedo sube de 22,9 mm en secuencias vistas a 37,8 mm en el sujeto no visto s05, lo que indica una generalizacion limitada a personas fuera de la distribucion de entrenamiento.
- El modelo esta entrenado exclusivamente sobre mocap egocentrico ARCTIC y un espacio de accion de 57 dimensiones; no se documenta su comportamiento fuera de ese dominio, con otras camaras o con otras categorias de objetos.
- No se publican datos sobre sesgos demograficos, etnicos o de genero; dado que solo se reserva un sujeto para validacion, no es posible estimar la equidad del modelo.
- Riesgo de alucinacion cinematica: como todo modelo predictivo, puede generar poses fisicamente inconsistentes o dedos en configuraciones anatomicamente improbables, especialmente en oclusiones.
- No se documentan idiomas soportados; el adaptador no esta orientado a tareas de lenguaje.
- La licencia declarada es `other`. El modelo base NVIDIA Cosmos3-Nano se publica bajo OpenMDW-1.1, pero hay que verificar los terminos exactos aplicables a este derivado antes de cualquier uso comercial.
- El repositorio incluye el estado del optimizador y el checkpoint completo (31 GB), lo que complica su distribucion y almacenamiento en produccion; el fichero slim de 157 MB solo contiene los tensores entrenados y requiere reconstruir el checkpoint completo.
- No hay soporte documentado para cuantizacion, vLLM, llama.cpp, Ollama ni TGI, lo que limita las opciones de despliegue eficiente.
- El modelo no implementa tool calling, agentes ni razonamiento multi-paso; cualquier uso en ese sentido requeriria combinarlo con otro sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leokswang/cosmos3-nano-arctic-handpose-idm-s2-step3000
- Modelo base NVIDIA Cosmos3-Nano: https://huggingface.co/nvidia/Cosmos3-Nano
- Repositorio del autor (experimento WAM_vs_IDM): https://github.com/leo01110111/dex
- Notas del experimento: `research_notes/Cosmos_IDM/experiments.md` dentro del repositorio anterior
- Documentacion de Cosmos 3: https://docs.nvidia.com/cosmos/latest/cosmos3/index.html
- Referencia de modelos Cosmos: https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/cosmos3-nano/modelcard
- Pagina del contenedor NIM: https://build.nvidia.com/nvidia/cosmos3-nano
