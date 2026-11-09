# LastEpisode/MiniMax-H3-FL-Singularity-Experimental

## Resumen

MiniMax-H3-FL-Singularity-Experimental es un checkpoint experimental de generación de vídeo a partir de imagen (image-to-video) publicado por el usuario LastEpisode en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) de pesos construida a partir de tres checkpoints existentes: la base MiniMax-H3 de MiniMaxAI, la versión empaquetada por Comfy-Org y la variante Singularity de WarmBloodAban. El objetivo declarado es combinar la calidad visual y claridad de la variante FL con la iluminación y texturas más naturales, el movimiento expresivo y el mejor tratamiento de rostros lejanos de Singularity.

El modelo conserva la arquitectura del transformer de difusión de MiniMax-H3, con 50 bloques principales, y se distribuye en formato safetensors con cuantización INT8 ConvRot para el despliegue. Una de sus características destacadas es que, pese a estar construido sobre la base FL, admite generación condicionada por referencia y no solo flujos de primer/último fotograma.

Es relevante ahora porque ejemplifica una práctica habitual en la comunidad: la recombinación quirúrgica de pesos para afinar el comportamiento visual de un modelo generativo sin coste de entrenamiento. Su carácter experimental, la ausencia de benchmarks y su licencia comunitaria restrictiva lo sitúan como material de investigación y pruebas, no como una opción lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax-H3), 50 bloques principales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (group size 256, escala absmax por fila); pesos flotantes en BF16 y FP32 durante la construcción |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión heredado de MiniMax-H3, con 50 bloques principales. No ha sido entrenado: los pesos se han ensamblado mediante una mezcla selectiva. En concreto, las cuatro proyecciones de atención y MLP de cada uno de los 50 bloques (`attn.qkv_proj`, `attn.out_proj`, `mlp.fc1` y `mlp.fc2`, 200 matrices en total) se calculan como `FL + 0.5 × (Singularity − FL)` en FP32 y se redondean a BF16 antes de cuantizar. El resto de componentes permanece intacto respecto a FL: proyección de condicionamiento, los dos bloques token-refiner, ganancias de normalización, proyecciones de entrada y salida de vídeo y audio, y frecuencias rotatorias.

El bloque temporal (time/AdaLN) se sustituye por el paquete completo de Singularity: `adaln_t_table`, las 50 parejas de peso y sesgo de `adaln_proj.linear` y la pareja correspondiente de la capa final, 103 tensores copiados juntos para preservar su sistema de coordenadas temporal. La cuantización se aplica solo a las 200 matrices mezcladas, usando el cuantizador de Comfy-Org con grupo 256, escala absmax por fila, aritmética FP32 en CPU, 256 filas completas por bloque y `mseclip=False`. No se realiza poda adicional ni se cuantiza el token refiner. El prefijo `model.diffusion_model.` de Singularity se elimina para alinear las claves.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con el pipeline declarado por el autor.
- Generación condicionada por referencia, además de los flujos de primer y último fotograma.
- Mejora declarada en iluminación y texturas naturales respecto a FL, con menor efecto cerúleo.
- Movimiento expresivo y mejor tratamiento de rostros en planos lejanos, según el autor.
- Salida de vídeo y audio (proyecciones de entrada y salida de ambos modalidades presentes en los pesos).
- No se documentan tool calling, function calling, agentes ni capacidades multilingües.

## Casos de uso

- Pruebas de concepto de image-to-video: usar el modelo en ComfyUI para animar imágenes fijas y evaluar la mezcla FL/Singularity antes de adoptar un checkpoint estable.
- Investigación sobre merging de pesos: servir como caso de estudio reproducible de mezcla selectiva por bloques con cuantización INT8 posterior.
- Generación de clips con rostros en plano lejano: aprovechar la mejora declarada en el tratamiento de caras distantes para escenas de grupo o planos generales.
- Animación de ilustraciones y arte conceptual: la combinación de claridad de FL y texturas de Singularity apunta a un acabado menos plástico en materiales y piel.
- Flujos con imagen de referencia: emplear la generación condicionada por referencia para mantener la identidad de un personaje entre tomas.
- Evaluación comparativa de checkpoints: medir diferencias cualitativas frente a FL y Singularity puros en un mismo pipeline y con las mismas semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 21,0 GB, lo que da una referencia directa del espacio en disco necesario para los pesos.
- VRAM estimada para inferencia: no disponible de forma oficial; con pesos INT8 ConvRot y 21 GB de checkpoint, se requiere una GPU con al menos 24 GB para carga completa, y más para los buffers de activación del pipeline de vídeo.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño, se sitúan en la gama de A100, H100 o RTX 4090/5090 con 24 GB o más.
- Compatibilidad con GPU de consumo: probable solo en modelos de 24 GB o superiores, sujeto a los requisitos reales del pipeline de MiniMax-H3.
- Opciones de despliegue: ComfyUI (etiqueta `comfyui` y librería `minimax-h3`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-FL-Singularity-Experimental | Merge de difusión vídeo | no disponible | no disponible | MiniMax H3 Community License | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3 (FL) | Difusión vídeo base | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| WarmBloodAban/Minimax-h3_Singularity | Difusión vídeo (variante) | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |
| Comfy-Org/MiniMax-H3 | Empaquetado para ComfyUI | no disponible | no disponible | MiniMax H3 Community License | Hugging Face |

## Limitaciones y advertencias

- Modelo experimental y sin benchmarks: no hay evidencia cuantitativa de que supere a FL o Singularity en métricas objetivas.
- Es una fusión de pesos, no un modelo entrenado; los comportamientos emergentes de la mezcla no están validados.
- Sesgos conocidos: no documentados por el autor; al heredar los datos de entrenamiento de MiniMax-H3, arrastra los sesgos de la base.
- Riesgo de alucinación visual: posible generación de detalles inconsistentes o artefactos en movimiento, sin evaluación publicada.
- La licencia MiniMax H3 Community License Agreement impone restricciones que deben revisarse antes de cualquier uso comercial; el checkpoint modificado sigue sujeto a ella.
- Solo se ha validado presumiblemente en ComfyUI; no hay garantías de compatibilidad con otros runtimes.
- El token refiner no está cuantizado y el resto de tensores se conserva byte a byte, por lo que el rendimiento depende del checkpoint base FL.
- Sin información sobre idiomas, contexto ni latencia; no apto para planificación de producción sin pruebas propias.

## Enlaces

- [Hugging Face: LastEpisode/MiniMax-H3-FL-Singularity-Experimental](https://huggingface.co/LastEpisode/MiniMax-H3-FL-Singularity-Experimental)
- [MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Comfy-Org/MiniMax-H3 (revisión de construcción)](https://huggingface.co/Comfy-Org/MiniMax-H3/tree/54472221d27c695fca9621b0c3ed52f06c4af707/diffusion_models)
- [WarmBloodAban/Minimax-h3_Singularity (revisión de construcción)](https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity/tree/1259cf16cd0b655ba691a32fb46a409142762972)
- [Cuantizador de Comfy-Org (quant_int8_convrot.py)](https://github.com/Comfy-Org/comfy-model-tools/blob/d6797787e6bdb1a1fb0094d588a26f8e71a1c757/quant_int8_convrot.py)
