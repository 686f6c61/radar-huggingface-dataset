# nynxz/MOSS-Image

## Resumen

nynxz/MOSS-Image no es un modelo base nuevo, sino un paquete de distribución para ComfyUI construido sobre MOSS-Image de OpenMOSS-Team. Contiene dos artefactos: los checkpoints de MOSS-Image Base y SFT en bf16 con las matrices de atención q, k y v almacenadas como tensores separados (split q/k/v), y una LoRA de 1,9 MB denominada SFT Destripe que elimina las finas bandas verticales de color que el modelo SFT pinta en zonas lisas.

El problema que resuelve es concreto y medible: MOSS-Image SFT genera rayas verticales de color separadas unos 21 px a 1024 px de ancho y 16 px a 768 px, visibles en cielos, niebla, paredes y fondos de estudio. La LoRA reduce la puntuación de banding (bandviz) de 24,0 a 5,9 a 1024 px y de 9,8 a 4,2 a 768 px, manteniendo una similitud SSIM superior a 0,99 respecto al SFT original. Frente a la corrección previa de MATLOWAI, que revierte capas completas (1,13 GB, SSIM 0,983), esta LoRA modifica solo unas pocas direcciones dentro de las capas afectadas y pesa tres órdenes de magnitud menos.

Es relevante ahora porque permite usar la calidad del SFT de MOSS-Image en producción gráfica sin el artefacto de banding y sin reentrenar ni cambiar de flujo de trabajo en ComfyUI. La licencia del repositorio es Apache-2.0 y los checkpoints incluidos son los mismos pesos que los de Comfy-Org, solo reorganizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (tag `diffusion-single-file`); arquitectura interna y tipo de bloque no documentados en la información disponible |
| Parámetros totales | No disponible |
| Longitud de contexto | No aplica (modelo de imagen); longitud de prompt no documentada |
| Tipos de cuantización | bf16 en los checkpoints de este repo; variante int8 convrot citada en Comfy-Org; LoRA en bf16 |
| Idiomas soportados | No disponible; los ejemplos de la model card usan prompts en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors single-file (checkpoints y LoRA) |
| Resoluciones de referencia | 768 px y 1024 px de ancho |
| Tamaño del repo | 20,3 GB |
| Dependencias externas | Text encoder y VAE de Comfy-Org/MOSS-Image (sin cambios) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de MOSS-Image (número de bloques, tipo de atención, parametrización del denoiser ni composición del dataset de entrenamiento). Lo que sí se documenta es la intervención sobre los pesos: los checkpoints de este repositorio replican los pesos de Comfy-Org con la atención q, k y v separada en tensores independientes en lugar de fusionada. Esa separación es la que permite que modos de carga de LoRA que descartan adaptadores q/k/v sobre archivos fusionados funcionen correctamente.

La LoRA Destripe no se entrena desde cero: se deriva del propio SFT. El análisis de block-swap de MATLOWAI identificó las capas que transportan las rayas (capas 37–41 en su corrección) y su herramienta bandviz proporciona la métrica de banding. Mientras la solución de MATLOWAI revierte capas completas, esta LoRA aísla las pocas direcciones internas responsables de las rayas y las anula; el identificador `top64` sugiere 64 componentes o direcciones, aunque el rank exacto no se explicita. No se documentan pasos de RLHF, DPO ni fine-tuning adicional sobre la LoRA.

## Capacidades

- Generación de imágenes text-to-image con MOSS-Image Base y MOSS-Image SFT en ComfyUI.
- Eliminación de banding vertical de color en zonas lisas (cielos, niebla, paredes, fondos desenfocados) al aplicar la LoRA sobre SFT.
- Control de intensidad de la corrección según resolución: 1,0 a 768 px y 1,5 a 1024 px.
- Carga mediante `LoraLoaderModelOnly` en flujos estándar de ComfyUI, sin cambiar el resto del grafo.
- Compatibilidad con checkpoints fusionados de Comfy-Org en modo de carga normal de LoRA.
- Compatibilidad con modo Bypass gracias a los checkpoints split q/k/v de este repo.
- Uso con las variantes bf16 e int8 convrot del SFT.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada ni audio.

## Casos de uso

- Producción de fondos lisos para e-commerce: la LoRA elimina las rayas en paredes y fondos de estudio, donde el artefacto del SFT es más visible y más costoso de corregir en posproducción.
- Generación de cielos y paisajes atmosféricos: en imágenes con grandes superficies de cielo, el banding pasa de 24,0 a 5,9 de puntuación bandviz a 1024 px, lo que permite entregar la imagen sin retoque manual.
- Integración en pipelines de ComfyUI ya existentes: se añade un nodo `LoraLoaderModelOnly` con fuerza 1,0 o 1,5 y el resto del flujo (sampler ER-SDE, 25 pasos, CFG 2,5, skip-layer guidance en capa 22) se mantiene intacto.
- Limpieza de lotes generados con SFT: al conservar más del 99 % de similitud SSIM, la corrección no altera el estilo ni la composición, lo que facilita regenerar lotes con el mismo prompt y semilla.
- Flujos que requieren checkpoints no fusionados: los archivos split q/k/v permiten usar carga de LoRA en modo Bypass, merges de modelos y análisis de atención sin perder los adaptadores de q, k y v.
- Investigación sobre artefactos en modelos de difusión: la combinación de la LoRA con bandviz permite medir cuantitativamente el banding y comparar estrategias de corrección (revertir capas frente a anular direcciones).
- Base para adaptaciones posteriores: los checkpoints split q/k/v del SFT sirven como punto de partida para entrenar otras LoRA o variantes sin tener que desfusionar tensores manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas de lenguaje, ya que se trata de un modelo de difusión de imágenes. La model card aporta una evaluación específica de banding con 4 prompts de superficies lisas (dunas, pared, agua abierta y retrato con fondo desenfocado) por 3 semillas, sin usar esas semillas para construir la corrección, con ER-SDE, 25 pasos y CFG 2,5.

A 768 px:

| Modelo | bandviz (mediana) | Raya sigue siendo el pico dominante | SSIM frente a SFT | Tamaño |
|---|---|---|---|---|
| SFT | 9,8 | 9 / 12 | 1,000 | — |
| SFT con capas 37–41 revertidas a Base (MATLOWAI) | 6,5 | 8 / 12 | 0,980 | 1,13 GB |
| SFT + esta LoRA a 1,0 | 4,2 | 1 / 12 | 0,995 | 1,9 MB |
| Base | 4,2 | 5 / 12 | 0,876 | — |

A 1024 px:

| Modelo | bandviz (mediana) | Raya sigue siendo el pico dominante | SSIM frente a SFT | Tamaño |
|---|---|---|---|---|
| SFT | 24,0 | 11 / 12 | 1,000 | — |
| SFT con capas 37–41 revertidas a Base (MATLOWAI) | 8,4 | 4 / 12 | 0,983 | 1,13 GB |
| SFT + esta LoRA a 1,0 | 6,1 | 6 / 12 | 0,996 | 1,9 MB |
| SFT + esta LoRA a 1,5 | 5,9 | 1 / 12 | 0,993 | 1,9 MB |
| SFT + esta LoRA a 2,0 | 6,0 | 1 / 12 | 0,992 | 1,9 MB |
| Base | 4,0 | 0 / 12 | 0,863 | — |

La puntuación bandviz es el pico más fuerte del espectro de color de la columna en el rango de 10–48 px dividido por la mediana; valores de 16 o menos se consideran limpios. En el ejemplo de cielo a 1024 px, el SFT puntúa 23,7 (rayas cada 21,4 px) y con la LoRA a fuerza 1,0 baja a 9,3.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada oficialmente. Cada checkpoint bf16 pesa 10,2 GB y requiere además el text encoder y el VAE de Comfy-Org, por lo que se estima por encima de 12 GB de VRAM en bf16; la variante int8 convrot de Comfy-Org reduce el peso del denoiser aproximadamente a la mitad.
- GPU recomendadas: no hay lista oficial. Por tamaño de checkpoint, una RTX 4090 (24 GB) o una A100/H100 son adecuadas para bf16 sin offload; para lotes grandes o mayor resolución conviene A100/H100.
- GPU de consumo: previsiblemente viable en tarjetas de 16 GB con la variante int8 y en 24 GB con bf16, aunque no se documentan pruebas específicas.
- Opciones de despliegue: ComfyUI es el flujo documentado, con los nodos `LoraLoaderModelOnly` y los checkpoints en `models/diffusion_models/`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles. La configuración de referencia es ER-SDE, 25 pasos, CFG 2,5 y skip-layer guidance en la capa 22, pero no se aportan tiempos por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Artefacto de banding a 1024 px | SSIM frente a SFT | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MOSS-Image SFT (Comfy-Org) | No disponible | No aplica | 24,0 | 1,000 | No disponible en la información | HuggingFace |
| MOSS-Image Base (Comfy-Org) | No disponible | No aplica | 4,0 | 0,863 | No disponible en la información | HuggingFace |
| MOSS-Image SFT DeBand (MATLOWAI) | No disponible | No aplica | 8,4 | 0,983 | No disponible en la información | HuggingFace |
| SFT + LoRA Destripe de este repo | No disponible | No aplica | 5,9 | 0,993 | Apache-2.0 (repo) | HuggingFace |

La comparación relevante es frente a las otras soluciones al mismo artefacto, no frente a otros modelos generativos: la LoRA de nynxz iguala prácticamente el nivel de banding de Base (5,9 frente a 4,0) conservando la estética del SFT (0,993 de SSIM), mientras que la corrección de MATLOWAI deja más banding (8,4) y se aleja más del SFT (0,983), a cambio de un archivo mucho mayor (1,13 GB frente a 1,9 MB).

## Limitaciones y advertencias

- La LoRA está construida a partir de los cambios propios del SFT y no debe aplicarse sobre MOSS-Image Base.
- La corrección no es total: a 768 px con fuerza 1,0 y a 1024 px con fuerza 1,5, la raya sigue siendo el pico dominante en 1 de cada 12 imágenes de prueba.
- La fuerza óptima depende de la resolución: 1,0 deja trazas en aproximadamente la mitad de las imágenes a 1024 px, y 2,0 no mejora a 1,5 y se aleja más del SFT.
- En modo Bypass sobre checkpoints fusionados se descartan los adaptadores de q, k y v; para ese modo hay que usar los checkpoints split de este repositorio.
- La evaluación se limita a 4 prompts y 3 semillas a 768 y 1024 px; no hay datos para otras resoluciones, relaciones de aspecto, estilos ni dominios.
- No se documentan sesgos, comportamiento multilingüe, filtros de seguridad ni riesgos de alucinación visual del modelo base.
- El repositorio no incluye text encoder ni VAE; hay que descargarlos de Comfy-Org, y una configuración incompleta impide la inferencia.
- La licencia Apache-2.0 cubre este repositorio, pero conviene verificar los términos de los modelos base de OpenMOSS-Team antes de un uso comercial.
- El repositorio ocupa 20,3 GB, aunque en la práctica solo se descarga el checkpoint y la LoRA que se vayan a usar.
- No es un modelo de lenguaje ni un agente: no admite tool calling, razonamiento multi-paso, visión de entrada ni audio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nynxz/MOSS-Image
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Modelo SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Checkpoints, text encoder y VAE de referencia: https://huggingface.co/Comfy-Org/MOSS-Image
- Investigación DeBand de MATLOWAI: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand
- Comparación visual interactiva DeBand: https://matlowai.github.io/MOSS-DeBand/#cols=sft,deband_lora,nynxz_1.5,strong_full,sft&item=a_anime_girl_school&seed=11
