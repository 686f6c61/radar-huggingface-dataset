# binglingzhimeng/MiniMax-H3-b25-49-full

## Resumen

MiniMax-H3-b25-49-full es un checkpoint derivado de MiniMax-H3, un modelo de generación de vídeo, publicado por el usuario binglingzhimeng en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) a nivel de tensores entre dos variantes del modelo base alojado en Comfy-Org/MiniMax-H3: FL2VA (usada como cuerpo completo de la red) y Ref2VA (de la que se extrae únicamente la rama AdaLN de los bloques 25 a 49). El resultado es un híbrido "full" (sin podar) que conserva la rama AdaLN completa, algo que los ficheros podados equivalentes no pueden ofrecer.

La relevancia de este artefacto es instrumental: sirve como referencia bit a bit para grabar tablas de modulación AdaLN nativas de un híbrido concreto, de modo que un fichero podado bX-49 más la tabla grabada sobre este checkpoint reproduce exactamente el comportamiento del híbrido completo. Está pensado para el ecosistema ComfyUI y usa cuantización int8 con formato convrot, con un tamaño de repositorio de 170,2 GB repartido en cinco ficheros de 31,7 GiB cada uno.

No se dispone de información sobre arquitectura interna, número de parámetros, longitud de contexto ni idiomas soportados en la documentación proporcionada; la model card se centra exclusivamente en el proceso de fusión, verificación de bytes y flujo de uso con la extensión ComfyUI-H3-ExactAdaLN.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de generación de vídeo MiniMax-H3; detalles internos no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (convrot) según los ficheros publicados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 para la fusión y cuantización; los pesos subyacentes quedan bajo la licencia propia de MiniMax |
| Formato de pesos | safetensors (int8 convrot, con tensores weight I8, weight_scale F32, bias BF16 y comfy_quant U8) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un merge determinista de pesos. Cada fichero es una copia byte a byte de `fl2va_int8_convrot` en la que se sustituye el bloque AdaLN del rango de bloques indicado por el de `ref2va_int8_convrot`. Por cada bloque sustituido se reemplazan cuatro tensores (`weight` en I8, `weight_scale` en F32, `bias` en BF16 y `comfy_quant` en U8). Las formas de los tensores y las entradas `data_offsets` se mantienen intactas, de modo que la cabecera de FL2VA sigue siendo válida y el cargador estándar de MiniMax-H3 en ComfyUI acepta los ficheros sin modificaciones.

La motivación técnica es que un fichero podado bX-49 carece de `time_embedder` y su AdaLN es una curva de 8 anchos, por lo que la modulación exacta debe reconstruirse. Estos checkpoints "full" portan la rama AdaLN completa y permiten una pasada de grabación que produce la modulación nativa del híbrido. La verificación es a nivel de byte: cada tensor sustituido es idéntico al de Ref2VA y el resto del cuerpo es idéntico a FL2VA, con hashes SHA-256 publicados para cada fichero. La prueba extremo a extremo con b25-49, mismo LoRA, 8 pasos `simple`, shift 12/2 y resolución 832x480x39 da `equal=True`, `max_abs=0.000e+00` y `psnr=inf`, es decir, identidad bit a bit entre el híbrido completo y el podado más la tabla grabada.

## Capacidades

- Generación de vídeo condicionada por texto e imagen según el modelo base MiniMax-H3 (no se detallan modalidades adicionales en la información disponible).
- Modulación AdaLN a ancho completo, lo que permite grabar tablas de modulación nativas para híbridos podados.
- Compatibilidad con el cargador estándar de MiniMax-H3 en ComfyUI (int8 convrot).
- Integración con la extensión ComfyUI-H3-ExactAdaLN para grabar y aplicar tablas AdaLN exactas.
- Compatibilidad con LoRA: una tabla grabada con un LoRA reproduce el modelo con otro LoRA distinto siempre que este no toque `time_embedder` ni `adaln_proj`.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Grabación de tablas AdaLN para híbridos podados: cargar uno de estos checkpoints full junto con el LoRA y el schedule objetivo, ejecutar `H3 AdaLN Record` antes del guider y guardar la tabla con `H3 Exact AdaLN Save Table`; después se aplica sobre el fichero podado bX-49 correspondiente con `H3 Exact AdaLN Apply`.
- Validación de pipelines de fusión: los hashes SHA-256 y la prueba bit a bit permiten usar estos ficheros como referencia de regresión para verificar que una implementación de merge reproduce exactamente el resultado esperado.
- Reproducción de resultados de investigación: al ser una referencia determinista, facilita comparar configuraciones de grabación y cuantización sin ambigüedad de pesos.
- Ajuste fino con LoRA sobre vídeo: el checkpoint full admite apilar LoRA y grabar la modulación resultante, útil para experimentar con estilos o aceleradores manteniendo coherencia con el modelo podado de producción.
- Despliegue en ComfyUI para generación de vídeo a 832x480x39 con schedules cortos (8 pasos `simple`, shift 12/2 documentados), adecuado para prototipado rápido en estaciones con suficiente VRAM.
- Auditoría de discrepancias entre estrategias de merge: la model card documenta que grabar FL2VA y Ref2VA por separado y fusionar tablas produce diferencias de hasta 0,19 en los bloques 25-49 y un PSNR de 22,20 dB frente a 31,10 dB, lo que permite medir el impacto de cada enfoque antes de adoptarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica objetiva aportada es la verificación bit a bit del merge (identidad exacta de bytes y PSNR infinito en la prueba extremo a extremo) y la comparación de PSNR entre estrategias de tabla (22,20 dB frente a 31,10 dB en b25-49).

## Requisitos de hardware

- Cada fichero pesa 31,7 GiB en int8; se necesita al menos esa cantidad de VRAM o de memoria unificada para cargarlo, más el espacio de activaciones y del VAE.
- No se especifican GPU recomendadas en la información disponible; por el tamaño, quedan fuera de GPUs de consumo con menos de 32 GB y requieren tarjetas tipo A100 80 GB, H100 o RTX 4090/5090 con offloading.
- Despliegue previsto en ComfyUI con el cargador estándar de MiniMax-H3; no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de fichero | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-b25-49-full (este) | Híbrido full FL2VA + AdaLN Ref2VA (bloques 25-49) | 31,7 GiB | int8 convrot | Apache 2.0 (merge) / licencia MiniMax (pesos) | Hugging Face, 140 descargas |
| MiniMax-H3-b5-49-full | Híbrido full con AdaLN Ref2VA desde bloque 5 | 31,7 GiB | int8 convrot | Apache 2.0 (merge) / licencia MiniMax | Mismo repositorio |
| MiniMax-H3-b45-49-full | Híbrido full con AdaLN Ref2VA solo en la cola (bloque 45 en adelante) | 31,7 GiB | int8 convrot | Apache 2.0 (merge) / licencia MiniMax | Mismo repositorio |
| Comfy-Org/MiniMax-H3 (FL2VA / Ref2VA) | Modelos base originales | no disponible | int8 convrot | Licencia MiniMax | Hugging Face |

## Limitaciones y advertencias

- Una tabla AdaLN es función de los pesos, la pila de LoRA y sus intensidades, la rejilla de sigma, los shifts y el layout empaquetado; si cambia cualquiera de ellos debe volver a grabarse.
- `out_dtype` queda fijado en el momento de la grabación; estos modelos operan con matemáticas en bf16.
- Los LoRA que tocan `time_embedder` o `adaln_proj` (aceleración o destilación) requieren regrabar la tabla; los demás no.
- La fusión y la cuantización son Apache 2.0, pero los pesos subyacentes siguen bajo la licencia de MiniMax, lo que condiciona el uso comercial.
- No es equivalente a fusionar las tablas de FL2VA y Ref2VA por separado: la cola difiere hasta 0,19 porque ambos profesores no comparten `time_embedder` (`proj_out.weight` difiere hasta 0,104).
- El split (5, 20, 25, 30, 45) es una propiedad del fichero podado que se vaya a usar, no un dial de calidad; elegir uno distinto al del fichero podado invalida la reproducción bit a bit.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas específicas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/binglingzhimeng/MiniMax-H3-b25-49-full
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Extensión ComfyUI-H3-ExactAdaLN: https://github.com/bingling360/ComfyUI-H3-ExactAdaLN
