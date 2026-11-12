# moonbox-ai/MOSS-Image-SFT-GGUF

## Resumen

MOSS-Image-SFT-GGUF es la distribucion en formato GGUF del modelo de generacion de imagenes MOSS-Image (SFT), publicada por Moonbox AI para su uso en dispositivo. El modelo original lo desarrolla OpenMOSS-Team y es un modelo de difusion de tipo text-to-image que transforma indicaciones textuales en imagenes. Moonbox convierte unicamente los pesos del transformer de difusion a GGUF, manteniendo el resto del pipeline (codificador de texto y VAE) en archivos separados.

El modelo base cuenta con aproximadamente 5.080 millones de parametros en el transformer de difusion. Para funcionar completo necesita un codificador de texto Qwen3.5 de 9B y el VAE de FLUX.2, lo que significa que el peso total del pipeline supera con creces los parametros del propio transformer. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion de dicha licencia.

La relevancia de esta publicacion radica en que facilita la ejecucion local del modelo en hardware de consumo mediante cuantizacion GGUF, con opciones desde Q4_K_M (3,57 GB) hasta F16/BF16 (10,17 GB). El runtime de referencia es stable-diffusion.cpp, aunque tambien existe soporte parcial en ComfyUI a traves de ComfyUI-GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (diffusion transformer) para text-to-image |
| Parametros totales | 5.082.308.624 (transformer de difusion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion para generacion de imagenes a partir de texto. La model card no detalla la arquitectura interna del transformer (numero de capas, dimensiones de atencion, mecanismos de atencion) ni los datos de entrenamiento empleados en el modelo base. El modelo original es el checkpoint SFT (supervised fine-tuning) de MOSS-Image, lo que indica que ha pasado por una fase de ajuste supervisado tras el preentrenamiento, aunque no se especifican los detalles del dataset de SFT ni si hubo fases de RLHF o DPO.

El pipeline completo requiere tres componentes: el transformer de difusion (los archivos GGUF de este repositorio), un codificador de texto Qwen3.5 9B (en formato GGUF Q8_0 desde unsloth/Qwen3.5-9B-GGUF) y el VAE de FLUX.2 (flux2-vae.safetensors desde Comfy-Org/MOSS-Image). El tokenizer debe tomarse del repositorio original de MOSS-Image-SFT porque Qwen3.5 usa un vocabulario distinto al embebido. Los valores por defecto de inferencia son 50 pasos, CFG 3 y flow shift 5. La conversion a GGUF se realizo desde los pesos BF16 originales (revision f972bd4b4b) mediante llama.cpp y llama-quantize, verificando cada archivo contra el original.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Control de resolucion de salida mediante parametros de ancho y alto (por ejemplo, 1024x1024).
- Ajuste de la fidelidad al prompt mediante CFG scale y numero de pasos.
- Ejecucion local en dispositivo gracias a la cuantizacion GGUF.
- Compatibilidad con stable-diffusion.cpp como runtime de referencia.
- Compatibilidad con ComfyUI mediante ComfyUI-GGUF (con limitaciones del loader).
- Soporte de multiples precisiones para equilibrar calidad y memoria.

## Casos de uso

- Generacion de imagenes en local para prototipado: un desarrollador puede ejecutar el modelo con Q4_K_M en una GPU de consumo para iterar rapidamente sobre prompts sin depender de APIs externas.
- Integracion en pipelines de ComfyUI: el modelo puede cargarse mediante ComfyUI-GGUF para construir flujos de trabajo de generacion de imagenes con nodos de postprocesado, aunque el loader estandar no reconoce aun el tipo `moss_image`.
- Generacion de ilustraciones para documentacion tecnica: con 1024x1024 y CFG 3, el modelo produce imagenes de referencia para manuales y blogs sin coste de API.
- Experimentacion en investigacion: al ser Apache-2.0 y estar en GGUF, permite comparar precisiones (Q8_0 frente a Q4_K_M) y medir el impacto de la cuantizacion en la calidad de imagen.
- Despliegue en entornos con recursos limitados: la version Q4_K_M (3,57 GB) permite ejecutar el transformer en GPUs con poca VRAM, dejando espacio para el codificador de texto y el VAE.
- Creacion de contenido visual para aplicaciones web: el modelo puede servir como backend de generacion de imagenes en una aplicacion propia, siempre que se gestione la carga del pipeline completo (transformer, codificador de texto y VAE).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de error RMS relativo de los pesos cuantizados frente a BF16, pero no resultados de calidad de imagen (FID, CLIP score, etc.):

| Precision | Tamano | Error RMS relativo frente a BF16 |
|---|---|---|
| F16 | 10,17 GB | 0,0000005 % (5,3e-9) |
| BF16 | 10,17 GB | exacto |
| Q8_0 | 5,69 GB | 0,52 % |
| Q6_K | 4,53 GB | 1,7 % |
| Q5_K_M | 4,04 GB | 3,1 % |
| Q4_K_M | 3,57 GB | 5,7 % |

## Requisitos de hardware

- VRAM estimada para el transformer de difusion: aproximadamente 3,6 GB con Q4_K_M, 4,0 GB con Q5_K_M, 4,5 GB con Q6_K, 5,7 GB con Q8_0 y 10,2 GB con F16/BF16.
- VRAM adicional necesaria para el codificador de texto Qwen3.5 9B en Q8_0 y para el VAE de FLUX.2, que no estan incluidos en este repositorio.
- GPU recomendadas: no especificadas en la model card. Por el tamano de los pesos, una RTX 4090 o superior puede alojar el pipeline completo con comodidad; GPUs con 8-12 GB de VRAM pueden ejecutar el transformer en Q4_K_M o Q5_K_M si se gestiona la memoria del codificador de texto por separado.
- Cabe en GPU de consumo: si, al menos el transformer en cuantizaciones Q4_K_M a Q8_0.
- Opciones de despliegue: stable-diffusion.cpp (runtime de referencia, commit 465adf3) y ComfyUI con ComfyUI-GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de generacion de imagenes.

## Limitaciones y advertencias

- El repositorio contiene unicamente el transformer de difusion; el codificador de texto y el VAE deben obtenerse por separado, lo que complica el despliegue.
- El tokenizer debe tomarse del repositorio original de MOSS-Image-SFT porque el vocabulario de Qwen3.5 difiere del embebido.
- El loader estandar de ComfyUI-GGUF no reconoce aun el tipo `moss_image`, por lo que la integracion en ComfyUI puede requerir ajustes.
- La cuantizacion introduce error en los pesos (hasta 5,7 % de error RMS relativo en Q4_K_M), cuyo impacto en la calidad de imagen no se ha documentado con metricas en la informacion disponible.
- No se detallan sesgos conocidos del modelo base ni riesgos de generacion de contenido inapropiado.
- No se especifican los idiomas soportados por el codificador de texto ni por el modelo en su conjunto.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion y el aviso de licencia.
- No hay datos de benchmarks de calidad de imagen que permitan evaluar el rendimiento real frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-ai/MOSS-Image-SFT-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio GitHub de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe tecnico: https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- arXiv: https://arxiv.org/abs/2610.23374
- Codificador de texto Qwen3.5 9B GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- VAE de FLUX.2: https://huggingface.co/Comfy-Org/MOSS-Image
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Plataforma API MOSI: https://platform.mosi.cn/
