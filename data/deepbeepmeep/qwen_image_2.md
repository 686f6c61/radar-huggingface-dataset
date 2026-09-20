# DeepBeepMeep/Qwen_image_2

## Resumen

Qwen Image 2.1 for WanGP es un reempaquetado de Qwen/Qwen-Image-2.1 publicado por el usuario DeepBeepMeep, pensado para la integración de Qwen Image 2.1 que WanGP incorpora localmente. Se trata de un transformer unificado de 7B que cubre tanto la generación texto-a-imagen como la edición de imágenes, admite hasta diez imágenes de referencia en el prompt y puede producir salida RGBA con canal alfa. El repositorio distribuye los pesos en precisión original (BF16) y en una variante cuantizada INT8 ConvRot, además del codificador de texto Qwen3-VL-8B-Instruct y el VAE.

El objetivo del reempaquetado es doble: por un lado, ofrecer checkpoints verificados (cobertura exacta de claves, dtypes y comprobación de igualdad tras el merge de shards) respecto al modelo original de Qwen; por otro, reducir el coste de memoria mediante la conversión INT8, de modo que el modelo pueda ejecutarse en GPUs de gama alta de consumo. La revisión de origen fijada es `b3179ad355be050328e483a9dfdd9e60cd62adfa`.

Es relevante ahora porque permite ejecutar localmente una alternativa de generación y edición de imágenes de 7B con soporte de transparencia y referencias múltiples dentro de WanGP, con la salvedad de que la licencia subyacente es la Qwen Research License y que los LoRA de las versiones antiguas de 20B no son compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer unificado de generacion y edicion de imagenes (7B) + codificador de texto Qwen3-VL-8B-Instruct (sin LM head) + VAE |
| Parametros totales | 7B en el transformer de imagen; 8B en el codificador de texto compartido |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolucion de salida hasta 4096p, incluida 4096x4096) |
| Tipos de cuantizacion | BF16 original y INT8 ConvRot (transformer y codificador de texto); VAE en FP32 nativo, no cuantizado |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El componente central es un transformer unificado de 7B para generacion texto-a-imagen y edicion, acompanado de un codificador de texto basado en Qwen3-VL-8B-Instruct (compartido, sin LM head) y de un VAE que conserva los pesos originales en FP32. La tarjeta no detalla la arquitectura interna del transformer (tipo de atencion, variantes de difusion, etc.), por lo que ese punto queda como no disponible.

El repositorio es un reempaquetado, no un entrenamiento nuevo: no se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF/DPO. La innovacion tecnica declarada se centra en el proceso de conversion: los checkpoints ConvRot se generaron mediante la conversion «headless load-only» de WanGP y se validaron con generacion real y edicion con referencias. Ademas, WanGP soporta ejecucion validada en BF16 (ajuste de VAE a 16 bits) y FP32 nativo (ajuste a 32 bits), y evita la aritmetica FP16 porque provocaba desbordamiento en pruebas con imagenes reales. El VAE aplica tiling automatico segun el tamano de imagen/referencia y el batch, con salida directa UINT8 en CPU.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con prompts descriptivos de la imagen final.
- Edicion de imagenes (image-to-image) con prompts que comienzan por la operacion y especifican que preservar.
- Soporte de hasta diez imagenes de referencia, referenciables en el prompt como `<image1>`, `<image2>`, etc.
- Salida RGBA con canal alfa para fondos transparentes, previa peticion explicita en el prompt y activacion del ajuste RGBA.
- Outpainting espacial con imagen de control o referencia principal, tanto en el flujo normal de imagen como en el de inpainting.
- Resoluciones de salida hasta 4096p, incluyendo 4096x4096.
- Renderizado de texto de calidad moderada, recomendado solo para textos cortos.
- Compatibilidad con LoRA entrenados especificamente para la arquitectura 2.1 7B.
- Soporte de tool calling / function calling: no aplica (modelo de imagen).
- Soporte de agentes y razonamiento multi-paso: no aplica (modelo de imagen).
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de imagenes para marketing y contenidos: el modelo produce imagenes texto-a-imagen hasta 4096p, adecuado para banners, ilustraciones y material promocional con control de resolucion.
- Edicion por instrucciones en produccion grafica: permite retocar imagenes existentes indicando la operacion y lo que debe preservarse, util en flujos de retoque por lotes.
- Composicion con multiples referencias: al admitir hasta diez imagenes de referencia, sirve para fusionar estilos, personajes o productos en una sola salida coherente.
- Diseno de assets con transparencia: la salida RGBA permite generar recortes con fondo transparente directamente, utiles para interfaces, logotipos o elementos de UI.
- Outpainting y extension de lienzo: con una imagen de control o referencia principal se puede ampliar el encuadre de una fotografia o ilustracion.
- Prototipado local en hardware de consumo: la variante INT8 ConvRot reduce el consumo de memoria, permitiendo iterar en una GPU de gama alta de consumo dentro de WanGP.
- Automatizacion de pipelines image-to-image: integrable en un flujo WanGP que reciba imagenes y devuelva versiones editadas, dado que el pipeline declarado es image-to-image.
- Inpainting y edicion localizada: el outpainting y la edicion espacial permiten modificar zonas concretas manteniendo el resto de la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (orientativa, a partir del tamano de los pesos publicados): el transformer de 7B en BF16 ronda los 14 GB y el codificador Qwen3-VL-8B-Instruct en BF16 unos 16 GB, de modo que un pipeline completo en precision original puede superar los 30 GB. Con la variante INT8 ConvRot el conjunto se reduce aproximadamente a la mitad.
- GPU recomendadas: A100 (40/80 GB) y H100 para BF16 sin offloading; RTX 4090 o RTX 3090 (24 GB) para la variante INT8.
- Cabe en GPU de consumo: si, en la variante INT8 ConvRot sobre 24 GB; en BF16 requerira offloading o ajustes de memoria.
- Precaucion documentada: no se usa aritmetica FP16 porque desbordo en pruebas con imagenes reales; se emplea BF16 (ajuste de VAE a 16 bits) o FP32 nativo (ajuste de VAE a 32 bits).
- Opciones de despliegue: WanGP con el modelo «Qwen Image 2.1 7B»; la tarjeta no menciona vLLM, llama.cpp, Ollama ni TGI.
- Parametros de inferencia sugeridos por el autor: empezar con 40 pasos y CFG 4.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Notas |
|---|---|---|---|---|
| DeepBeepMeep/Qwen_image_2 (este) | 7B transformer + 8B codificador de texto | hasta 4096p, RGBA, hasta 10 referencias | Qwen Research License | Reempaquetado BF16 e INT8 para WanGP |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | Qwen Research License | Modelo base de referencia (revision b3179ad) |
| Qwen Image / Edit antiguos | 20B (segun la tarjeta) | no disponible | no disponible | LoRA de la arquitectura 20B no compatibles con la 2.1 7B |

No se dispone de datos de rendimiento comparado con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research License: es una licencia de investigacion, por lo que deben revisarse las condiciones exactas en el archivo `LICENSE` antes de cualquier uso comercial.
- Se trata de un reempaquetado de terceros (DeepBeepMeep), no de una publicacion oficial de Qwen; la reproducibilidad depende del proceso de conversion descrito.
- El renderizado de texto es de calidad moderada y se recomienda solo con textos cortos; las infografias densas no estan recomendadas ni se anuncian como especialidad.
- La salida RGBA esta desactivada por defecto; es necesario activarla y pedir explicitamente transparencia para conservar el canal alfa.
- Los LoRA de las versiones antiguas Qwen Image/Edit de 20B no son compatibles; solo sirven los entrenados para la arquitectura 2.1 7B.
- Los controles NAG estan ocultos temporalmente, aunque la implementacion se conserva.
- El outpainting codifica unicamente el recorte de origen alineado y excluye la zona rellenada, con una banda de transicion estrecha en los bordes expandidos.
- No se usa FP16 por riesgo de desbordamiento; hay que seleccionar BF16 o FP32 en el VAE.
- El repositorio ocupa 57,8 GB, lo que condiciona el almacenamiento y la descarga.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no aplica en el sentido de texto; en generacion de imagenes puede producir contenido incoherente o artefactos, sin datos concretos disponibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DeepBeepMeep/Qwen_image_2
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia: https://huggingface.co/DeepBeepMeep/Qwen_image_2/blob/main/qwen_image_21/LICENSE
- Codificador de texto Qwen3-VL-8B-Instruct (BF16): https://huggingface.co/DeepBeepMeep/Ideogram4/blob/main/Qwen3-VL-8B-Instruct/Qwen3-VL-8B-Instruct_bf16.safetensors
- Codificador de texto Qwen3-VL-8B-Instruct (INT8 ConvRot): https://huggingface.co/DeepBeepMeep/Ideogram4/blob/main/Qwen3-VL-8B-Instruct/Qwen3-VL-8B-Instruct_int8_convrot.safetensors
