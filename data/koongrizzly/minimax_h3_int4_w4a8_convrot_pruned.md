# koongrizzly/MiniMax_H3_int4_W4A8_ConvRot_Pruned

## Resumen

MiniMax_H3_int4_W4A8_ConvRot_Pruned es un repositorio de componentes cuantizados del modelo MiniMax H3, un generador omnicomodal de vídeo y audio desarrollado originalmente por MiniMaxAI. El repositorio, mantenido por el usuario koongrizzly, no contiene un modelo entrenado desde cero, sino una recopilación de checkpoints derivados: los transformadores de difusión FL2VA y Ref2VA en formato W4A8 ConvRot, un codificador de texto también cuantizado en W4A8 y un VAE de vídeo en precisión mixta FP16/FP32.

El objetivo declarado es hacer viable la inferencia local de MiniMax H3 en GPUs de consumo, donde los componentes en precisión completa requieren cantidades muy elevadas de VRAM y memoria de sistema. La cuantización a 4 bits en pesos y 8 bits en activaciones (W4A8) con la técnica ConvRot reduce sustancialmente el peso en memoria a cambio de cierta pérdida de precisión numérica.

El repositorio tiene 81,5 GB y acumula 26.001 descargas, lo que refleja un interés práctico notable en la comunidad de generación de vídeo local. Está pensado principalmente para ComfyUI y para la aplicación independiente del propio autor, publicada en GitHub. La licencia declarada es Apache 2.0, aunque el propio autor advierte que los componentes derivan de proyectos de terceros cuyos términos deben revisarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (FL2VA y Ref2VA) más codificador de texto y VAE de vídeo/audio; arquitectura original de MiniMax H3 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A8 ConvRot (pesos 4 bits, activaciones 8 bits) en transformadores y codificador de texto; VAE de vídeo en FP16/FP32 mixto; VAE de audio en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con advertencia del autor sobre términos de terceros) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: redistribuye y reempaqueta componentes del MiniMax H3 oficial. Los dos transformadores principales (FL2VA, para generación desde primer/último fotograma, y Ref2VA, para generación con referencias multimodales) son checkpoints podados y cuantizados en W4A8 ConvRot, conversión original de Winnougan. El codificador de texto sigue el mismo esquema W4A8, mientras que su componente visual se mantiene en mayor precisión, igual que en la conversión de origen.

La innovación técnica propia de este repositorio es el VAE de vídeo en precisión mixta: la mayoría de tensores se convierten de FP32 a FP16 para reducir memoria y almacenamiento, pero bloques pequeños y sensibles a la precisión se conservan intencionadamente en FP32 para preservar estabilidad numérica y calidad de reconstrucción. La arquitectura no se ha reentrenado ni ajustado; solo se ha modificado la representación numérica de los pesos. El repositorio incluye además LoRAs Turbo de 4 pasos (step600) procedentes de larryvrh, y desde septiembre de 2026 incorpora dos variantes híbridas de terceros (berryber09 y Aki7777777) que unifican los modos de referencia y primer/último fotograma en un solo checkpoint.

## Capacidades

- Generación de vídeo con audio estéreo sincronizado (audio-vídeo omnicomodal).
- Texto a audio-vídeo (según la variante del modelo original).
- Generación desde primer y último fotograma (FL2VA).
- Generación con referencias multimodales (Ref2VA).
- Modo híbrido que permite combinar imagen inicial y referencia en un mismo trabajo (variantes híbridas incluidas).
- Generación acelerada en 4 pasos mediante LoRAs Turbo.
- Inferencia en memoria reducida gracias a la cuantización W4A8 y al VAE de precisión mixta.
- Integración con ComfyUI y con la aplicación independiente del autor; compatible con algunos modelos INT8 según la app.

## Casos de uso

- Generación de vídeo local en GPU de consumo: el conjunto cuantizado permite cargar los transformadores en VRAM mucho menor que la versión FP32, haciendo viable la creación de clips con audio en equipos de gama alta domésticos.
- Prototipado rápido de vídeo publicitario: con las LoRAs Turbo de 4 pasos se pueden iterar conceptos de audio-vídeo en pocas etapas de muestreo, útil para agencias que necesitan variantes rápidas.
- Animación de imágenes fijas: el modo FL2VA interpola entre primer y último fotograma, adecuado para crear transiciones o animaciones de storyboard.
- Generación condicionada por referencias: el modo Ref2VA permite mantener consistencia de personaje o estilo a partir de imágenes de referencia, útil en series cortas o contenido de marca.
- Flujos de trabajo en ComfyUI: al estar empaquetado para ese entorno, se integra en grafos nodales con control preciso de cada componente (text encoder, VAE, transformador).
- Investigación en cuantización: el VAE mixto FP16/FP32 y los checkpoints W4A8 sirven como caso de estudio de compromisos precisión-memoria en modelos generativos de vídeo.
- Despliegue en la app independiente: el autor mantiene una aplicación de escritorio que carga estos checkpoints, orientada a usuarios que no quieren montar un grafo de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numérica; el repositorio (81,5 GB) incluye todos los componentes, pero la carga en inferencia es inferior al usar cuantización W4A8 y VAE mixto. El objetivo declarado es reducir la huella frente al modelo en precisión completa.
- GPU recomendadas: no disponible en la información proporcionada; el propósito es habilitar GPUs de consumo, pero no se especifican modelos concretos.
- Viabilidad en GPU de consumo: sí, es el objetivo principal del repositorio, aunque sin cifras de VRAM confirmadas.
- Opciones de despliegue: ComfyUI (soporte oficial), aplicación independiente MiniMax_H3_Standalone_app del autor, y otros entornos con el loader adecuado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|
| koongrizzly/MiniMax_H3_int4_W4A8_ConvRot_Pruned | Pack de componentes MiniMax H3 | W4A8 ConvRot + VAE mixto | Apache 2.0 | Hugging Face, 81,5 GB |
| Winnougan/MiniMax-H3-INT4_Convrot_ComfyUI | Conversión INT4 original para ComfyUI | W4A8 ConvRot | no disponible | Hugging Face |
| MiniMaxAI/MiniMax-H3 | Modelo oficial completo | Precisión completa | no disponible | Hugging Face |
| berryber09/MiniMax-H3-ref2va-fl2va-hybrid-w4a8 | Checkpoint híbrido W4A8 | W4A8 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización W4A8 introduce pérdida de precisión numérica que puede degradar la calidad de generación frente al modelo oficial en precisión completa.
- El VAE mixto FP16/FP32 reduce memoria, pero no se documenta cuantitativamente el impacto en calidad de reconstrucción.
- No se especifican idiomas soportados ni longitud de contexto; no asumir cobertura multilingüe sin verificar en el repositorio oficial.
- La licencia Apache 2.0 se declara sobre un repositorio que redistribuye componentes de terceros; el autor recomienda revisar los términos del modelo original y de las conversiones, por lo que el uso comercial requiere verificación adicional.
- El repositorio no está afiliado ni respaldado por MiniMaxAI.
- Los checkpoints híbridos y las LoRAs Turbo proceden de otros autores y pueden tener condiciones propias.
- El soporte principal es ComfyUI; el uso en otros entornos requiere trabajo adicional de integración.
- No hay benchmarks publicados que permitan cuantificar la degradación respecto al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/koongrizzly/MiniMax_H3_int4_W4A8_ConvRot_Pruned
- Modelo original MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Conversión INT4 ConvRot original (Winnougan): https://huggingface.co/Winnougan/MiniMax-H3-INT4_Convrot_ComfyUI
- Aplicación independiente: https://github.com/Koongrizzly/MiniMax_H3_Standalone_app
- Discord del autor: https://discord.gg/kWxAJwjSY
- LoRAs Turbo: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Modelo híbrido de berryber09: https://huggingface.co/berryber09/MiniMax-H3-ref2va-fl2va-hybrid-w4a8
- Modelo híbrido de Aki7777777 (Civitai): https://civitai.com/models/2900456/minimax-h3sparseref15hybrid
