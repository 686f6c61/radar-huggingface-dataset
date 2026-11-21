# AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP4-MTP

## Resumen

AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP4-MTP es un checkpoint cuantizado en formato MLX para Apple Silicon, derivado del modelo `mlx-community/Qwen3.5-0.8B-decision` de la familia Qwen3.5. Lo publica AutomatosX bajo su pipeline de cuantización mixta AXQuant (AXQ) 2.1.0, que asigna precisiones distintas por tensor (4 bits, 8 bits y BF16) en lugar de aplicar una precision uniforme. El resultado es un peso medio de 6,91 bits por peso (BPW) en el camino principal y 7,12 BPW contando la cabeza MTP.

El modelo base es un `Qwen3_5ForConditionalGeneration` de arquitectura densa con 853 millones de parametros logicos, que incluye torre de vision y cabeza de prediccion multi-token (MTP). Este checkpoint no es un modelo conversacional: es un *decision model* que puntua una cabeza de esquema conjunta (`joint_head.safetensors`), y el autor advierte explicitamente que `mlx_lm.generate` produce texto que no corresponde a la salida real del modelo. Su relevancia es acotada: sirve como artefacto de desarrollo para validar el pipeline de cuantizacion AXQ sobre un modelo pequeno con vision y MTP en hardware Apple.

El paquete se declara como evidencia de desarrollo, no como release certificado de AXQuant: no publica mediciones de calidad, contexto largo, velocidad de kernels ni aceleracion MTP. El contexto configurado es de 262.144 tokens, aunque el limite practico depende de la memoria unificada del equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso con torre de vision y cabeza MTP) |
| Parametros totales | 752.393.024 (safetensors); 852,99 M logicos segun model card |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; limite practico segun memoria unificada |
| Tipos de cuantizacion | Mixta: 4 bits (56,97 % de parametros), 8 bits (29,11 %), BF16 (13,92 %); metodos `affine`, `mxfp4`, `bf16`; grupos de 32 y 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX Safetensors (no incluye PyTorch ni GGUF) |
| BPW medido (camino principal) | 6,9103 |
| BPW medido (total, con MTP) | 7,1231 |
| Tamano de pesos safetensors | 0,78 GB |
| Descarga completa aproximada | 0,81 GB |
| Cabeza MTP | Presente (`mtp.safetensors`), 15 tensores, 20,45 M parametros, BF16 |
| Vision | Presente (BF16) |
| Audio | No presente |
| Runtime principal | MLX-LM; sidecar MTP via oMLX u MTPLX |
| Version MLX registrada | 0.32.1 |
| Version MLX-LM registrada | 0.31.3 |
| Cuantizador | AXQuant 2.1.0 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con 853 millones de parametros logicos, que combina un camino de lenguaje, una torre de vision y una cabeza de prediccion multi-token (MTP). Sobre ese base, AutomatosX aplica una cuantizacion mixta AXQuant: el camino de lenguaje (atencion y MLP) se cuantiza con formatos `affine` y `mxfp4`, los embeddings de tokens quedan en 8 bits afines, y la torre de vision, la cabeza MTP y las normas se preservan en BF16. El checkpoint se convierte directamente desde el modelo fuente en BF16.

Antes de cuantizar se fusiono un adaptador LoRA de rango 16 con escala 1.0 en los pesos de lenguaje en BF16; el fichero del adaptador no se incluye en el paquete. La cabeza de esquema conjunta (`joint_head.safetensors`) se copia sin cambios desde el original BF16, acompanada de `joint_head_config.json` y `decision_config.json`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

La innovacion tecnica del paquete es doble: por un lado, la politica de precision mixta de AXQuant, que protege tensores sensibles a mayor precision para cumplir un presupuesto de almacenamiento; por otro, la conservacion de la cabeza MTP como sidecar BF16, consumible por runtimes especificos (oMLX 0.6.3rc2 o superior, y MTPLX) mediante el contrato de ejecucion `qwen3-next-mtp`. El autor no ha medido la aceleracion que aporta la MTP.

## Capacidades

- Puntuacion de una cabeza de esquema conjunta: el modelo evalua decisiones mediante `joint_head.safetensors`; no es un modelo de chat y la generacion de texto libre no refleja su salida real.
- Procesamiento de vision: la torre visual se conserva en BF16, por lo que el checkpoint mantiene la capacidad multimodal del modelo base.
- Prediccion multi-token (MTP): sidecar BF16 de 15 tensores y 20,45 M parametros, para decodificacion especulativa en runtimes compatibles.
- Contexto largo configurado de hasta 262.144 tokens, sujeto a la memoria unificada disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling y razonamiento multi-paso: no disponibles como capacidades documentadas de este checkpoint.
- Modo thinking, audio y otras capacidades especiales: no documentadas; el campo de audio figura explicitamente como ausente.

## Casos de uso

- Validacion del pipeline AXQuant: el paquete sirve para comprobar que la conversion desde BF16, la asignacion de precisiones por tensor y la integridad de los artefactos funcionan sobre un modelo pequeno con vision y MTP antes de aplicarlo a modelos mayores.
- Pruebas de integracion de runtimes MLX: permite verificar la carga del checkpoint en MLX-LM 0.31.3 y la convivencia con sidecars MTP en oMLX o MTPLX, sin depender de modelos de mayor tamano.
- Desarrollo de sistemas de decision con esquema fijo: al puntuar una cabeza de esquema conjunta, encaja en prototipos de clasificacion o enrutamiento estructurado donde la salida es una puntuacion, no texto libre.
- Prototipado multimodal en Apple Silicon: la torre de vision en BF16 permite experimentar con entrada de imagen en equipos con memoria unificada, con un peso de descarga de apenas 0,81 GB.
- Pruebas de decodificacion especulativa: la cabeza MTP empaquetada permite evaluar el flujo de importacion de sidecar y el perfil `stable` con profundidad 1 en MTPLX, aunque la aceleracion no este medida.
- Experimentos de contexto largo en hardware de consumo: con 262.144 tokens configurados, sirve para medir en que punto la memoria unificada limita la ventana efectiva en un Mac.
- Referencia para comparativas de cuantizacion: al existir un hermano MXFP8 con la misma politica de roles, permite contrastar el impacto del formato de bloque en tamano y comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el paquete no publica evidencia medida de calidad, contexto largo, velocidad de kernels ni velocidad de MTP, y que la etiqueta AXQ no debe interpretarse como una afirmacion de rendimiento.

## Requisitos de hardware

- VRAM (memoria unificada en Apple Silicon): aproximadamente 0,81 GB de descarga completa; los pesos safetensors ocupan 0,78 GB, por lo que la inferencia cabe holgadamente en cualquier Mac con 8 GB o mas de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (serie M). El formato MLX no es compatible con CUDA ni con GPUs NVIDIA o AMD.
- GPU de consumo: si, en cualquier chip M1 o posterior con memoria unificada suficiente; no aplica a RTX 4090 ni a A100/H100.
- Despliegue: MLX-LM como runtime principal; oMLX 0.6.3rc2 o superior y MTPLX para consumir el sidecar MTP. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que el repositorio no contiene pesos GGUF ni PyTorch.
- AX Engine: no establecido; el paquete no incluye un `model-manifest.json` nativo validado y los campos de AX Engine en `axquant_runtime.json` describen el contrato previsto, no evidencia observada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP4-MTP | 752,4 M (safetensors); 853 M logicos | 262.144 | MLX Safetensors, 6,91 BPW principal | Apache 2.0 | Vision y MTP en BF16; decision model |
| AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP8-MTP | no disponible | 262.144 (heredado del base) | MLX Safetensors, formato de bloque MXFP8 | Apache 2.0 | Misma politica de roles AXQ; vision, MTP y normas en BF16; LoRA fusionado antes de cuantizar |
| mlx-community/Qwen3.5-0.8B-decision | 853 M logicos | 262.144 | MLX Safetensors en BF16 | Apache 2.0 | Modelo base sin cuantizar del que deriva este checkpoint |

## Limitaciones y advertencias

- No es un modelo de chat: `mlx_lm.generate` carga el backbone y produce texto que no es la salida del modelo; la salida real proviene de la cabeza de esquema conjunta.
- Evidencia de desarrollo: el autor declara que el paquete no es un release certificado de AXQuant y que no publica mediciones de calidad, contexto largo, velocidad de kernels ni velocidad MTP.
- AX Engine no establecido: no hay manifiesto nativo validado; la compatibilidad con AX Engine es un contrato previsto, no un hecho verificado.
- Dependencia de runtime para MTP: MLX-LM estandar no carga el sidecar `mtp.safetensors`; se requiere oMLX 0.6.3rc2 o superior, o MTPLX, y en oMLX el import del sidecar modifica solo la copia local.
- Limitaciones de contexto: los 262.144 tokens son el maximo configurado; el limite efectivo depende de la memoria unificada y no se ha medido.
- Idiomas: no disponibles; no se puede confirmar cobertura multilingue.
- Sesgos y alucinacion: no documentados en la informacion disponible; al ser un modelo de decision, el riesgo principal es una puntuacion incorrecta del esquema, no la generacion de texto.
- Licencia Apache 2.0: permite uso comercial, pero el autor no extiende ninguna certificacion de calidad o exactitud a los runtimes de terceros que consumen el sidecar.
- Reproducibilidad: conviene fijar el commit del Hub en despliegues reproducibles en lugar de depender de `main`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP4-MTP
- Modelo base: https://huggingface.co/mlx-community/Qwen3.5-0.8B-decision/tree/36e166ca10c4d16471a231d66cfc22d80039fe34
- Hermano MXFP8: https://huggingface.co/AutomatosX/AX-Qwen3.5-0.8B-decision-MLX-AXQ-MXFP8-MTP
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Indice completo del catalogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
