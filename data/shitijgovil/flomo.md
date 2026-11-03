# shitijgovil/FloMo

## Resumen

FloMo es un conjunto de tres checkpoints base de midtrain para aprendizaje de robots a partir de vídeo, desarrollado por shitijgovil (con código en el repositorio `pairlab/flomo`). No se trata de un modelo de lenguaje generativo al uso, sino de un adaptador LoRA sobre el DiT de Wan2.2-TI2V-5B que implementa forward-dynamics "any-to-any": dado un contexto visual y una instrucción de tarea, predice acciones de robot, tokens de movimiento (scene flow 3D) y/o vídeo futuro según la variante.

Los tres checkpoints (`ma`, `va`, `vma`) comparten la misma receta de entrenamiento (época 28, mezcla EgoVerse 0.65, MolmoAct2 0.15, RealYAM 0.15 y RealYAM human video 0.05) y se diferencian en las salidas que producen: solo movimiento y acción, vídeo y acción, o vídeo, movimiento y acción. Cada archivo pesa 646 MB y contiene únicamente los parámetros entrenables (adaptadores LoRA y cabezas FloMo); el VAE de Wan y el codificador de texto umT5 se cargan congelados desde los pesos originales de Wan.

Su relevancia radica en que unifica en un mismo backbone de difusión vídeo-acción tareas que habitualmente se abordan con modelos separados: predicción de dinámica, generación de vídeo condicionada y política de acción para robots bimanuales. La licencia MIT de los pesos facilita su reutilización, aunque el modelo base Wan2.2-TI2V-5B está bajo Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre DiT (Diffusion Transformer) de Wan2.2-TI2V-5B, con cabezas FloMo para acción y tokens de movimiento |
| Parámetros totales | no disponible (el checkpoint LoRA pesa 646 MB; el backbone base Wan2.2-TI2V-5B tiene 5B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se codifican con umT5) |
| Licencia | MIT (pesos y código FloMo); modelo base Wan2.2-TI2V-5B bajo Apache-2.0 |
| Formato de pesos | `.pt` (dict de `torch.save` con parámetros entrenables, `lora_enabled`, `normalizer_stats` y `config`) |

## Arquitectura y entrenamiento

FloMo se construye sobre el Diffusion Transformer de Wan2.2-TI2V-5B, un modelo de generación de vídeo texto-imagen-a-vídeo. Sobre él se añaden adaptadores LoRA y cabezas específicas que permiten tres modos de salida: `ma` (tokens de movimiento + acción), `va` (vídeo + acción) y `vma` (vídeo + tokens de movimiento + acción). Los tokens de movimiento son scene flow 3D denso codificado por el VAE de Wan congelado; el codificador de texto umT5 también permanece congelado y se carga desde los pesos originales de Wan.

El entrenamiento se realizó durante 28 épocas (13.500-14.000 pasos según variante) sobre una mezcla de datos: EgoVerse (0.65), MolmoAct2 (0.15), RealYAM (0.15) y vídeo humano de RealYAM (0.05). La supervisión de acción utiliza exclusivamente los datos de robot de MolmoAct2 y RealYAM. Los checkpoints publicados no incluyen estado de optimizador, scheduler ni scaler, por lo que están pensados para inferencia o fine-tuning desde pesos, no para reanudar el entrenamiento original.

## Capacidades

- Predicción de acciones para robots bimanuales: genera chunks de acción de forma (T, 14) con pose de efector final (x, y, z, yaw, pitch, roll, grip) para cada brazo.
- Forward dynamics a partir de vídeo: predice el estado futuro (vídeo, scene flow o ambos) dado el contexto visual y la instrucción de tarea.
- Tokens de movimiento 3D: representación de scene flow denso codificada por el VAE de Wan, útil para razonamiento espacial y para condicionar la política.
- Condicionamiento multi-vista: acepta varias imágenes (primaria, izquierda, derecha) como contexto visual.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto (por ejemplo, "pick up the croissant and place it in the oven").
- Co-entrenamiento any-to-any: un mismo backbone sirve para predecir acción, vídeo o movimiento según la variante y la configuración.
- Fine-tuning por tarea: permite adaptar los pesos a una tarea concreta (por ejemplo, una tarea de RoboTwin 2.0) mediante `train.py`.

## Casos de uso

- Manipulación bimanual con instrucciones en lenguaje natural: el checkpoint `vma` genera chunks de acción de 14 dimensiones a partir de imágenes multi-vista y una instrucción textual, adecuado para tareas de pick-and-place en entornos con dos brazos.
- Aprendizaje por imitación desde vídeo: usar `va` o `vma` para predecir vídeo futuro y acción simultáneamente, lo que permite entrenar políticas con supervisión densa a partir de demostraciones en vídeo.
- Modelado de dinámica para planificación: el checkpoint `ma` predice scene flow 3D y acción, útil como modelo de dinámica dentro de un bucle de planificación o para verificar la plausibilidad física de una trayectoria.
- Fine-tuning a tareas específicas de benchmark: el README documenta el ajuste a una tarea de RoboTwin 2.0 (`open_laptop`) partiendo de `vma`, lo que sirve como plantilla para adaptar FloMo a nuevos entornos simulados.
- Investigación en co-entrenamiento multimodal: la mezcla de datos (EgoVerse, MolmoAct2, RealYAM) y las tres variantes permiten estudiar cómo afecta la presencia de salidas de vídeo o movimiento al rendimiento de la política de acción.
- Generación de vídeo condicionada a acción para aumento de datos: la variante `va` puede emplearse para sintetizar rollouts visuales que complementen datasets reales de robot.
- Prototipado en robótica de investigación: al ser un LoRA de 646 MB sobre un backbone de 5B con licencia MIT, es viable desplegarlo en laboratorios con una sola GPU de gama alta para experimentos de política visomotora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, el backbone Wan2.2-TI2V-5B (5B parámetros) requiere del orden de 10-20 GB en precisión reducida para inferencia, a lo que se suman los 646 MB del LoRA y el VAE; el README no proporciona cifras oficiales.
- GPU recomendadas: no especificadas por el autor; por el tamaño del backbone, se espera que requiera GPU de gama alta (A100, H100 o RTX 4090) para inferencia cómoda y fine-tuning.
- ¿Cabe en GPU de consumo? No confirmado; probablemente ajustado en RTX 4090 con precisión reducida, pero el autor no lo documenta.
- Opciones de despliegue: el repositorio oficial (`pairlab/flomo`) proporciona `infer_example.py` y `train.py`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FloMo (este) | LoRA sobre DiT de vídeo para forward-dynamics y acción | 646 MB de adaptadores sobre backbone de 5B | no disponible | MIT (base Apache-2.0) | HuggingFace, 0 descargas |
| Wan2.2-TI2V-5B | DiT texto-imagen-a-vídeo | 5B | no disponible | Apache-2.0 | HuggingFace (modelo base) |
| MolmoAct2 | Política de robot (fuente de datos de acción) | no disponible | no disponible | no disponible | no disponible |
| RealYAM | Datos de robot y vídeo humano (fuente de datos) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre FloMo y otras políticas visomotoras en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre ni mantiene conversaciones; su salida son acciones, tokens de movimiento y/o vídeo.
- Los checkpoints contienen solo parámetros entrenables; es imprescindible descargar los pesos de Wan2.2-TI2V-5B y cargar el VAE y el codificador umT5 congelados para poder usarlos.
- No incluyen estado de optimizador, scheduler ni scaler, por lo que no permiten reanudar el entrenamiento original tal cual.
- Al fine-tunear `va` o `vma` con configuraciones sin salida de vídeo aparece el aviso `Unexpected keys: modalities.video_primary.{mask_token,view_pe}`, que el autor indica como esperado.
- El modelo está entrenado para robots bimanuales con acción de 14 dimensiones; su uso con otras morfologías requiere fine-tuning y normalizadores de acción adecuados.
- La supervisión de acción proviene solo de MolmoAct2 y RealYAM; el sesgo hacia esos dominios y entornos puede limitar la generalización.
- Riesgo de alucinación visual y de dinámica: al ser un modelo generativo de difusión, puede producir predicciones de vídeo o movimiento físicamente implausibles.
- Los idiomas soportados no están documentados; las instrucciones de tarea dependen del codificador umT5, pero no se especifica cobertura lingüística.
- Licencia MIT para los pesos FloMo, pero el modelo base Wan2.2-TI2V-5B es Apache-2.0: conviene revisar ambas condiciones para uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa ni de benchmarks publicados.

## Enlaces

- HuggingFace: https://huggingface.co/shitijgovil/FloMo
- Código: https://github.com/pairlab/flomo
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Paper: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
