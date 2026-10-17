# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-020

## Resumen

El modelo `qwen3-4b-medicine-static-pilot-261016-step-020` es un ajuste fino (fine-tune) de tipo instructivo desarrollado por el usuario HYU-NLP-EVAL, derivado del modelo base `Qwen/Qwen3-4B-Instruct-2507` de Alibaba Qwen. Se trata de un checkpoint intermedio del paso 20 de una ejecución de entrenamiento denominada `261016_medicine_static_pilot` (semilla 11), por lo que su naturaleza es experimental y de pilotaje, no un modelo final de producción.

El repositorio contiene un export en formato BF16 para Transformers, junto con un directorio `original_checkpoint/` que conserva los ficheros nativos de veRL/FSDP y sus metadatos. Cuenta con 4.022.468.096 parametros totales (aproximadamente 4,02 mil millones) y una licencia Apache 2.0.

El nombre del checkpoint sugiere un ajuste orientado al dominio medico, aunque la model card no documenta ni el dataset de entrenamiento, ni el numero de tokens, ni el procedimiento de alineacion empleado. No se han publicado resultados de benchmarks ni metricas de evaluacion, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (detalles de capas y atencion no disponibles) |
| Parametros totales | 4.022.468.096 (~4,02 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (export nativo); no se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (export BF16 para Transformers); `original_checkpoint/` en formato nativo veRL/FSDP |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only denso de la familia Qwen3 con aproximadamente 4.000 millones de parametros. El ajuste se ha realizado sobre el checkpoint instructivo del modelo base, lo que implica que hereda su tokenizador y su arquitectura de atencion, aunque la model card no detalla la configuracion de capas, cabezas de atencion ni la longitud de contexto efectiva.

El entrenamiento se ha ejecutado con veRL y FSDP (fully sharded data parallel), segun se deduce de la presencia del directorio `original_checkpoint/` con los ficheros nativos y sus metadatos. El checkpoint publicado corresponde al paso 20 de la ejecucion `261016_medicine_static_pilot` con semilla 11. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La model card indica que el checkpoint local se elimina una vez verificados los tamanos y hashes SHA256 de los ficheros remotos, lo que apunta a un pipeline de publicacion automatizado.

## Capacidades

- Generacion de texto y formato conversacional (etiquetas `text-generation` y `conversational` en HuggingFace).
- Ajuste orientado al dominio medico segun la denominacion del run (`medicine_static_pilot`), aunque no se documentan las tareas concretas cubiertas.
- Al ser un fine-tune de Qwen3-4B-Instruct-2507, se espera compatibilidad con las capacidades del modelo base (instrucciones, razonamiento, multilingue), pero no hay verificacion publicada en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Evaluacion interna de ajustes en dominio medico: el modelo sirve como artefacto intermedio para comparar el efecto del paso 20 de entrenamiento frente a checkpoints posteriores o al modelo base.
- Investigacion en pipelines de RL con veRL/FSDP: al incluir el checkpoint nativo, permite reproducir o continuar el entrenamiento desde este punto concreto.
- Pruebas de regresion de fine-tuning: util para medir si el ajuste degrada capacidades generales del modelo base (catastrofico olvido) en tareas de texto general.
- Generacion de borradores de texto clinico en entornos de investigacion controlados, siempre que un revisor humano valide el contenido antes de cualquier uso.
- Experimentacion academica con modelos de ~4B parametros en GPU de consumo, gracias al tamano reducido del checkpoint.
- Base para posteriores ajustes especificos (por ejemplo, DPO o RLHF) sobre un modelo ya adaptado al dominio medico.
- Despliegue en pruebas de integracion con Text Generation Inference, dado que el repositorio esta marcado como `endpoints_compatible`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,05 GB solo para pesos (4,02 mil millones de parametros x 2 bytes), mas overhead de runtime y cache KV; en la practica, del orden de 10-12 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB.
- VRAM estimada en cuantizacion de 4 bits (si se convierte a GGUF): aproximadamente 2,5-3 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 o L40S para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para uso local en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM para BF16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) y en tarjetas de 8 GB si se convierte a cuantizacion de 4 u 8 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI, marcado como compatible), transformers con PyTorch, y llama.cpp u Ollama previa conversion a GGUF (no se publica GGUF oficial).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-020 | 4,02 B | no disponible | Apache 2.0 | HuggingFace (0 descargas) | Checkpoint intermedio, sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4 B | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace | Modelo base instructivo |
| Alternativas de ~3-4 B (Llama, Phi, Gemma) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 20 de un pilotaje, no a un modelo final entrenado hasta convergencia.
- Ausencia total de evaluacion: no hay benchmarks, metricas ni cartas de evaluacion publicadas, por lo que se desconoce su calidad real frente al modelo base.
- Riesgo elevado de alucinacion en contenido clinico o medico; el modelo no ha sido validado como herramienta sanitaria.
- No es un producto sanitario: no debe utilizarse para diagnostico, prescripcion ni decision clinica sin supervision profesional.
- Procedencia del dataset de ajuste desconocida: no se documenta la composicion, licencias ni posibles sesgos de los datos de entrenamiento.
- Idiomas soportados no declarados; el comportamiento en castellano no esta verificado.
- Longitud de contexto no especificada; se desconoce si se ha modificado respecto al modelo base.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentacion sobre los datos de entrenamiento traslada al usuario el riesgo legal asociado.
- Uso en produccion desaconsejado sin una evaluacion previa propia y sin fijar la revision del repositorio, dado que se trata de un artefacto experimental.
- Repositorio sin adopcion (0 descargas, 0 likes) y sin mantenimiento documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-020
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las coincidencias obtenidas corresponden a entidades no relacionadas (Hyundai Motor, canales de YouTube y plataformas de television).
