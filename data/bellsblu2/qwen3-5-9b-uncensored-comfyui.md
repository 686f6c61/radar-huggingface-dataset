# BellsBlu2/Qwen3.5-9B-Uncensored-ComfyUI

## Resumen

Qwen3.5-9B-Uncensored-ComfyUI es un paquete de pesos del codificador de texto (text encoder) derivado de un ajuste fino sin censura del modelo `Qwen/Qwen3.5-9B`, publicado por el usuario BellsBlu2 en Hugging Face. No se trata de un modelo generativo completo orientado a chat, sino de un artefacto empaquetado en safetensors de archivo unico para cargarse directamente en el directorio `ComfyUI/models/text_encoders/` y utilizarse como codificador de texto dentro de flujos de ComfyUI.

El modelo hereda la arquitectura y el tamano del Qwen3.5-9B original (aproximadamente 9.000 millones de parametros), pero el autor no documenta ni el numero exacto de parametros, ni la longitud de contexto, ni la composicion del dataset de ajuste fino. La model card se limita a describir los tres ficheros de pesos disponibles y su uso en ComfyUI.

Su relevancia es acotada y muy especifica: ofrece una variante sin filtros del codificador de texto de Qwen3.5 en tres precisiones (BF16, FP8 E4M3FN e INT8 con rotacion de Hadamard), lo que permite integrar ese encoder en pipelines de generacion de imagen o video en ComfyUI reduciendo el consumo de VRAM. El repositorio ocupa 40,6 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); detalles no disponibles |
| Parametros totales | no disponible (el nombre indica 9B; cifra exacta no confirmada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8 (E4M3FN), INT8 con ConvRot (escalado por filas y supresion de outliers mediante rotacion de Hadamard) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors de archivo unico (diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-9B`, un transformer de la familia Qwen 3.5. El autor no detalla en la model card la arquitectura interna (atencion, capas, dimension oculta), el numero de tokens de entrenamiento ni la composicion del dataset del ajuste fino. Lo unico documentado es que se trata de una variante "uncensored", es decir, un fine-tune que elimina o reduce los filtros de contenido del modelo original, y que los pesos se han empaquetado como ficheros unicos para ComfyUI.

La innovacion tecnica documentada es el proceso de cuantizacion del fichero INT8: escalado por filas (row-wise scaling) combinado con rotacion de Hadamard para suprimir valores atipicos (outliers) antes de cuantizar, tecnica que el autor denomina ConvRot. El fichero BF16 se presenta como referencia de precision completa. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto y procesamiento de lenguaje natural heredados del modelo base Qwen3.5-9B.
- Funcion como codificador de texto (text encoder) para nodos de ComfyUI que cargan encoders Qwen3.5.
- Soporte de entrada multimodal image-text-to-text segun la etiqueta de pipeline del repositorio.
- Variante sin censura: el autor advierte de que la salida no esta filtrada.
- Capacidades de tool calling, razonamiento multi-paso, thinking mode o audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.

## Casos de uso

- Generacion de imagen en ComfyUI con encoder Qwen3.5: colocar el fichero en `ComfyUI/models/text_encoders/` y seleccionarlo en el nodo cargador de text encoder de Qwen3.5 para condicionar el pipeline de difusion con embeddings de texto.
- Generacion de video en ComfyUI: usar el mismo encoder en flujos de texto-a-video que requieran un codificador Qwen3.5, aprovechando la variante FP8 o INT8 para liberar VRAM en la GPU.
- Despliegue en GPUs de gama consumer: la version INT8 ConvRot reduce el peso del encoder respecto a BF16, lo que permite mantener el codificador cargado junto al modelo de difusion en tarjetas con VRAM limitada.
- Experimentacion con contenido sin filtros: investigadores que estudien el comportamiento de modelos sin censura pueden usar esta variante como encoder en entornos controlados, asumiendo la ausencia de filtrado en las salidas.
- Evaluacion de cuantizacion: comparar la calidad de generacion usando BF16, FP8 E4M3FN e INT8 ConvRot del mismo encoder para medir el impacto de la cuantizacion en el resultado final del pipeline.
- Prototipado de pipelines personalizados: desarrolladores que construyan flujos de ComfyUI con encoder Qwen3.5 pueden integrar este paquete sin convertir pesos ni gestionar multiples ficheros de shards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia orientativa, un modelo de ~9B parametros en BF16 requiere del orden de 18 GB solo para los pesos; la variante FP8 reduce esa cifra aproximadamente a la mitad y la INT8 a un valor similar, aunque el autor no publica mediciones.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Encaje en GPU consumer: previsiblemente las variantes FP8 e INT8 son las indicadas para GPUs consumer con VRAM limitada, segun la propia model card, que las describe como "quantized for lower VRAM use".
- Opciones de despliegue: ComfyUI (carga directa desde `ComfyUI/models/text_encoders/` mediante el nodo cargador de text encoder de Qwen3.5). Soporte de vLLM, llama.cpp, Ollama o TGI: no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Uncensored-ComfyUI | ~9B (no confirmado) | no disponible | Apache 2.0 | safetensors unico (BF16/FP8/INT8) | Variante sin censura empaquetada para ComfyUI |
| Qwen/Qwen3.5-9B | ~9B (no confirmado) | no disponible | no disponible en la informacion | no disponible | Modelo base original, con filtros |
| Otras variantes ComfyUI de encoders Qwen3.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Variante sin censura: el autor advierte explicitamente de que el contenido de salida no esta filtrado; su uso en produccion requiere moderacion externa.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- No se publican datos de sesgos, tasas de alucinacion ni evaluaciones de calidad del ajuste fino.
- El repositorio no registra descargas ni likes, por lo que no hay validacion de la comunidad sobre su funcionamiento.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros traslada al integrador la responsabilidad legal y etica del contenido generado.
- El paquete es especifico para ComfyUI como text encoder; no esta pensado como modelo de chat autonomo y su uso fuera de ese entorno no esta documentado.
- No se detalla el proceso de entrenamiento del fine-tune sin censura, lo que impide evaluar posibles degradaciones respecto al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/BellsBlu2/Qwen3.5-9B-Uncensored-ComfyUI
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
