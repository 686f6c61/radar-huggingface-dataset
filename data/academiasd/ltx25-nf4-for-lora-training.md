# AcademiaSD/LTX25-NF4-for-LoRA-Training

## Resumen

LTX25-NF4-for-LoRA-Training es una version cuantizada en NF4 (4 bits) del modelo de generacion de video texto-a-video LTX-2.5 de Lightricks, publicada por AcademiaSD. No es un modelo para inferencia, sino un paquete de pesos preparado especificamente para entrenar adaptadores LoRA sobre LTX-2.5 en GPUs de consumo, hasta 8 GB de VRAM. Incluye el transformer completo cuantizado, el codificador de texto Gemma 4 12B tambien en NF4, y copias sin modificar de VAE, vocoder, conectores y tokenizer.

El repositorio pesa 26,3 GB y esta pensado para ser descargado automaticamente por la herramienta AcademiaSD LoRAlab Trainer Studio. La cuantizacion afecta a las 1.632 capas Linear de los 48 bloques del transformer, mientras que las 28 capas Linear externas a los bloques se mantienen en BF16, igual que las normas y tablas de modulacion. El codificador de texto se cuantiza de forma independiente.

La relevancia de esta publicacion radica en que baja el umbral de hardware para hacer fine-tuning de un modelo de video de gran tamano a GPUs consumer. La licencia es la LTX-2.x Community License Agreement, con restricciones de uso comercial para entidades con ingresos anuales iguales o superiores a 10 millones de dolares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para texto-a-video (LTX-2.5), con codificador de texto Gemma 4 12B |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 con bitsandbytes (double quantization, blocksize 64); capas externas a bloques en BF16 |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (license date 11 de agosto de 2026) |
| Formato de pesos | safetensors (un archivo por capa Linear en `weights/`, mas `others.safetensors`) |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 es un transformer de difusion para generacion de video a partir de texto. Esta version concreta no reentrena el modelo, sino que cuantiza el transformer completo de `Lightricks/LTX-2.5-Diffusers` a NF4 mediante bitsandbytes, con cuantizacion doble y tamano de bloque 64, y divide los pesos en un archivo por capa Linear. Las 1.632 capas Linear de los 48 bloques se cuantizan; las 28 capas Linear fuera de los bloques, las normas, las tablas de modulacion y el resto de tensores se conservan en BF16. El codificador de texto Gemma 4 12B, ajustado para LTX-2.5, se cuantiza tambien a NF4.

El autor modifica ademas el scheduler y el `model_index.json`. En `scheduler/scheduler_config.json` activa `use_dynamic_shifting` y fija `shift_terminal` a 0.1, los valores que la model card del transformer completo indica, ya que el repositorio original trae la configuracion del modelo destilado. En `model_index.json` anula los componentes no incluidos (`prompt_enhancer`, `processor`, `diffusion_decoder`). Los scripts de conversion estan en `tools/ltx25/` del repositorio del trainer. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (pipeline text-to-video) mediante el modelo base LTX-2.5.
- Entrenamiento de LoRAs sobre LTX-2.5 en cuatro modalidades segun la model card: imagenes, video, video con audio e IC-LoRA edit.
- Cuantizacion NF4 que permite el entrenamiento en GPUs consumer de hasta 8 GB de VRAM.
- Incluye codificador de texto Gemma 4 12B ajustado, VAE, audio VAE, vocoder, conectores, tokenizer y duration head.
- No esta pensado para inferencia directa; su proposito es servir como base para fine-tuning.

## Casos de uso

- Entrenamiento de LoRAs de estilo visual: un desarrollador puede ajustar LTX-2.5 con un conjunto de imagenes o clips de un estilo concreto usando el trainer LoRAlab y estos pesos NF4, reduciendo el requisito de VRAM frente al modelo completo en BF16.
- Fine-tuning en GPU consumer: con 8 GB de VRAM es posible iniciar un entrenamiento LoRA, lo que permite experimentar con generacion de video sin acceso a A100 o H100.
- Creacion de LoRAs de edicion (IC-LoRA edit): el paquete incluye los componentes necesarios para entrenar adaptadores orientados a edicion de video.
- Adaptacion a dominios verticales de video: por ejemplo, clips de producto o material de marketing, entrenando un LoRA sobre un dataset acotado y desplegando despues el adaptador sobre el modelo base.
- Investigacion en eficiencia de entrenamiento: sirve para estudiar el impacto de la cuantizacion NF4 en la calidad de los adaptadores resultantes frente a entrenar sobre pesos BF16.
- Prototipado rapido de pipelines texto-a-video: integrado en el trainer AcademiaSD LoRAlab, permite iterar sobre datasets y configuraciones de entrenamiento con un coste de hardware bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para entrenamiento: hasta 8 GB de VRAM segun la model card, gracias a la cuantizacion NF4 del transformer y del codificador de texto.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es una GPU consumer con al menos 8 GB de VRAM.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM.
- Opciones de despliegue: el paquete esta disenado para el trainer AcademiaSD LoRAlab Trainer Studio, que lo descarga automaticamente. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, y no esta pensado para inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Proposito | Licencia |
|---|---|---|---|---|---|
| LTX25-NF4-for-LoRA-Training (este) | no disponible | no disponible | NF4 + BF16 | Entrenamiento de LoRAs sobre LTX-2.5 | LTX-2.x Community License |
| Lightricks/LTX-2.5 | no disponible | no disponible | BF16 (original) | Inferencia y fine-tuning | LTX-2.x Community License |
| Lightricks/LTX-2.5-Diffusers | no disponible | no disponible | BF16 (original) | Inferencia con diffusers | LTX-2.x Community License |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo para inferencia: la model card indica explicitamente que esta pensado para entrenar LoRAs, no para generar video directamente.
- La cuantizacion NF4 puede degradar la calidad de los adaptadores entrenados frente a pesos en BF16; no se aportan datos sobre esta perdida.
- Licencia restrictiva: entidades con ingresos anuales de 10 millones de dolares o mas necesitan una licencia comercial de Lightricks.
- Las restricciones de las secciones 4 y Attachment A de la licencia se aplican tambien a cualquier LoRA o derivado entrenado con estos pesos y deben transmitirse a terceros.
- Transferir un derivado (pesos fine-tuned o adaptadores LoRA) no concede derechos comerciales al receptor (seccion 3.5).
- El repositorio no esta afiliado ni respaldado por Lightricks.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limites de contexto.
- El scheduler y el `model_index.json` estan modificados respecto al repositorio original; conviene revisar la configuracion antes de reutilizar los pesos en otros pipelines.

## Enlaces

- Hugging Face: https://huggingface.co/AcademiaSD/LTX25-NF4-for-LoRA-Training
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Modelo base en diffusers: https://huggingface.co/Lightricks/LTX-2.5-Diffusers
- Trainer: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-TrainerStudio
- Licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Lightricks: https://www.lightricks.com/
