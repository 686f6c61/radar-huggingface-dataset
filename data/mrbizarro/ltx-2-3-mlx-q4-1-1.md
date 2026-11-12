# Mrbizarro/ltx-2.3-mlx-q4-1.1

## Resumen

LTX-2.3 distilled-1.1 MLX Q4 es una conversion al formato MLX con cuantizacion int4 del checkpoint LTX-2.3 distilled-1.1 de Lightricks, un modelo de generacion de video a partir de texto con salida de audio sincronizado. La conversion la firma el usuario Mrbizarro reutilizando la herramienta mlx-forge y el esquema de cuantizacion de dgrauet, y esta pensada especificamente para ejecutarse en Apple Silicon mediante el framework MLX. El modelo base LTX-2.3 es un modelo de difusion para text-to-video con arquitectura de transformer y un pipeline de audio-video integrado.

El interes de esta ficha radica en que permite ejecutar un modelo de generacion de video con audio en hardware de consumo Apple (M1 en adelante, con al menos 24 GB de RAM unificada), algo impensable con los pesos en bf16. La cuantizacion int4 se aplica unicamente a las capas Linear de los bloques `transformer_blocks`, manteniendo el resto de componentes (VAE, vocoder, connector, upscalers) en bf16. El repositorio ocupa 29,4 GB e incluye el transformer cuantizado (~10,5 GB), un LoRA bf16 de ~7,1 GB y todos los componentes auxiliares.

La version 1.1 es un fine-tune de la arquitectura 1.0 con mejoras declaradas en el audio. Segun los benchmarks del autor, el coste computacional es identico al de la version 1.0 (diferencias por paso dentro del ±2,5%), por lo que la actualizacion es no disruptiva para flujos existentes. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para text-to-video con pipeline audio-video (VAE de video, VAE de audio, vocoder) |
| Parametros totales | no disponible (el nombre del LoRA upstream sugiere 22B, sin confirmacion explicita) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no de lenguaje) |
| Tipos de cuantizacion | int4 con group_size=64, solo capas Linear de `transformer_blocks`; resto en bf16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, channels-last conv layout para VAE) |

## Arquitectura y entrenamiento

El modelo base LTX-2.3 es un modelo de difusion con backbone transformer para generacion de video condicionada por texto, con un modulo de audio que produce una pista sonora sincronizada con el video. El pipeline incluye varios componentes separados: un transformer principal (el unico cuantizado en esta conversion), un connector de ~5,9 GB en bf16, un VAE de video (encoder y decoder), un VAE de audio, un vocoder con generador BWE y base STFT, y upscalers espaciales y temporales opcionales. La version distilled esta disenada para inferencia en pocos pasos (el ejemplo de la model card usa 8 pasos).

La conversion aplica cuantizacion int4 con grupo de 64 exclusivamente a las capas Linear de los bloques del transformer, replicando byte a byte el esquema de `dgrauet/ltx-2.3-mlx-q4` (mismo `quantize_config.json`, mismo troceado de componentes). El LoRA `ltx-2.3-22b-distilled-lora-384-1.1.safetensors` se sincroniza en bf16 tal cual desde upstream. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; la model card solo indica que v1.1 es un fine-tune de v1.0 con audio mejorado.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resoluciones de ejemplo de 512x288, 640x480 y 1024x576.
- Generacion de audio sincronizado con el video (pipeline audio-video), con salida AAC a 48 kHz y ~128 kbps.
- Control de longitud del clip mediante numero de frames (ejemplo: 121 frames, equivalente a 5 s a 24 fps).
- Inferencia en pocos pasos gracias a la variante distilled (8 pasos en el ejemplo oficial).
- Upscaling espacial (x1,5 y x2) y temporal (x2) mediante componentes opcionales incluidos en el repo.
- Soporte de semilla fija para reproducibilidad.
- No se ha documentado soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- Capacidad multilingue limitada al ingles segun la metadata del modelo.

## Casos de uso

- Prototipado de video generativo en Mac: desarrolladores con un M4 Max o similar pueden iterar prompts y semillas localmente sin depender de GPUs en la nube, usando el pipeline `TextToVideoPipeline` de ltx-2-mlx con `low_memory=True`.
- Generacion de clips cortos con locucion para redes sociales: el modelo produce video y audio en una sola pasada, lo que permite crear clips de ~5 s con dialogo sincronizado a partir de un prompt descriptivo.
- Pruebas de concepto de doblaje o narracion sintetica: el pipeline acepta prompts con dialogos entre comillas (como el ejemplo "I think I figured it out"), util para generar bocetos de escenas habladas.
- Evaluacion comparativa de versiones del modelo: al mantener el mismo layout y esquema de cuantizacion que la Q4 de v1.0, permite hacer A/B con la misma semilla y prompt para decidir que version encaja mejor en un flujo concreto.
- Integracion en herramientas de creacion de contenido para macOS: al estar en formato MLX, se puede embeber en aplicaciones nativas de Apple Silicon que ya usen MLX como backend de inferencia.
- Investigacion sobre cuantizacion de modelos de difusion: el repo documenta el esquema exacto (int4, group 64, solo transformer_blocks) y sirve como referencia para estudiar el impacto de la cuantizacion en calidad y velocidad.
- Generacion de material de previsualizacion (storyboards animados) en estudios pequenos sin acceso a GPUs dedicadas, aceptando la latencia de ~273 s por clip de 5 s a 1024x576.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del autor, comparando v1.1 con v1.0 en un M4 Max de 64 GB con MLX 0.31.1, mismo prompt, semilla, harness y 8 pasos:

| Resolucion x frames | v1.0 baseline | v1.1 candidato | Delta |
|---|---|---|---|
| 512x288 x 25 fr | 24,68 s, 1,86 s/paso | 22,34 s, 1,87 s/paso | -2,34 s (-9,5%, cache caliente) |
| 640x480 x 121 fr | 132,1 s, 14,19 s/paso | 130,5 s, 14,55 s/paso | -1,6 s (-1,2%) |
| 1024x576 x 121 fr (5 s a 24 fps) | 273,8 s, 31,54 s/paso | 273,2 s, 31,31 s/paso | -0,6 s (-0,2%) |

El autor concluye paridad de velocidad: la diferencia por paso queda dentro del ±2,5% en las tres resoluciones y se atribuye a ruido de medida. No se han publicado resultados de benchmarks de calidad (FVD, CLIP score, etc.) en la informacion disponible.

## Requisitos de hardware

- Apple Silicon (M1 o superior) con al menos 24 GB de RAM unificada para inferencia T2V segura, segun la model card.
- macOS con MLX (el benchmark usa MLX 0.31.1).
- VRAM estimada: no aplica en el sentido tradicional; el consumo es de memoria unificada. El transformer cuantizado ocupa ~10,5 GB y el conjunto de componentes bf16 suma aproximadamente 16 GB adicionales, aunque el pipeline con `low_memory=True` puede no cargar todos simultaneamente.
- GPU recomendadas: no disponible para CUDA; el modelo esta pensado exclusivamente para Apple Silicon via MLX.
- No cabe en GPUs consumer NVIDIA en este formato (MLX); para esas plataformas habria que usar los pesos originales de Lightricks.
- Opciones de despliegue: framework `dgrauet/ltx-2-mlx` (instalacion via `uv pip install -e .`), con `TextToVideoPipeline` y flag `low_memory`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 22,34 s para 25 frames a 512x288; 130,5 s para 121 frames a 640x480; 273,2 s para 121 frames a 1024x576, todo en M4 Max 64 GB.
- Requiere un modelo de texto adicional para el encoder de prompts: el ejemplo usa `mlx-community/gemma-3-12b-it-4bit`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mrbizarro/ltx-2.3-mlx-q4-1.1 | no disponible | no aplica | MLX safetensors int4 | apache-2.0 | Hugging Face, 102 descargas |
| dgrauet/ltx-2.3-mlx-q4 (v1.0) | no disponible | no aplica | MLX safetensors int4 | apache-2.0 | Hugging Face, conversion canonica |
| Lightricks/LTX-2.3 (base) | no disponible | no aplica | safetensors bf16 | apache-2.0 | Hugging Face, pesos originales |

La comparativa se limita a las variantes del mismo modelo base porque la informacion proporcionada no incluye otros modelos de text-to-video con audio comparables. La diferencia principal entre las tres entradas es el formato (MLX int4 frente a bf16 original) y la version del fine-tune (1.0 frente a 1.1).

## Limitaciones y advertencias

- Solo soporta ingles segun la metadata; los prompts en otros idiomas pueden degradar la calidad.
- Modelo de difusion, no de lenguaje: no admite tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinacion visual y de audio: como todo modelo generativo, puede producir contenido incoherente, artefactos o audio desincronizado, especialmente con prompts ambiguos.
- La cuantizacion int4 puede introducir perdida de calidad frente a los pesos bf16 originales; el autor no publica metricas de calidad comparativas.
- El repositorio incluye un symlink (`transformer-distilled.safetensors`) para compatibilidad con el loader actual de ltx-2-mlx, que no lee `transformer_variants` de `split_model.json`; esto puede romper en entornos que no preserven symlinks (por ejemplo, algunas descargas via HTTP).
- Dependencia de un modelo de texto externo (Gemma 3 12B en el ejemplo) para el encoder de prompts, lo que anade requisitos de memoria y descarga.
- Requiere al menos 24 GB de RAM unificada; en Macs con menos memoria la inferencia puede fallar o ser inviable.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Lightricks/LTX-2.3 y de los componentes auxiliares.
- El autor ofrece transferir el repo al namespace de dgrauet; la ubicacion actual puede no ser la canonica a largo plazo.
- No hay garantias de soporte ni mantenimiento; el repo tiene 1 like y 102 descargas en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mrbizarro/ltx-2.3-mlx-q4-1.1
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- Conversion Q4 canonica de v1.0: https://huggingface.co/dgrauet/ltx-2.3-mlx-q4
- Herramienta de conversion: https://github.com/dgrauet/mlx-forge
- Framework de inferencia: https://github.com/dgrauet/ltx-2-mlx
- Guia de requisitos por memoria en Mac: https://phosphene.video/mac-requirements/
- Modelo de texto de ejemplo: https://huggingface.co/mlx-community/gemma-3-12b-it-4bit
