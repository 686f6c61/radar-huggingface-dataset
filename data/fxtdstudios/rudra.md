# fxtdstudios/RUDRA

## Resumen

RUDRA es un conjunto de modelos desarrollado por FXTD Studios que aborda el problema de la generación y conversión de imágenes en alto rango dinámico (HDR). El repositorio contiene dos familias independientes: `sdr2hdr/`, una U-Net compacta para inverse tone mapping que convierte una imagen SDR de 8 bits en radiancia scene-linear HDR, y una serie de decodificadores que sustituyen al VAE tonemapped de modelos de difusión como Flux, SDXL, LTX-Video, Wan o Z-Image, permitiendo decodificar latentes directamente a escena lineal HDR. El modelo principal de la familia sdr2hdr, `sdr2hdr_shadow_v1`, tiene 1.217.318 parámetros y predice un residuo sobre un tone map inverso analítico de ACES. Los decodificadores se ofrecen en dos tamaños: `full` (unos 21,5 MB) y `turbo` (entre 2,0 y 3,0 MB). El proyecto se distribuye bajo licencia Apache 2.0 y se integra en ComfyUI mediante un nodo personalizado. Su relevancia radica en que permite trabajar con radiancia HDR real (normalizada a 10.000 nits) en flujos de trabajo de difusión, sin la limitación del tonemapping que aplican los VAE convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net compacta (sdr2hdr); decodificador de VAE (decoders) |
| Parametros totales | 1.217.318 (sdr2hdr_shadow_v1); no disponible para decoders |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo image-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La familia `sdr2hdr/` utiliza una U-Net compacta que no predice la imagen directamente, sino un residuo sobre un inverse tone map analítico de ACES. Recibe seis canales de entrada (SDR RGB más el baseline analítico) y devuelve cinco canales de salida (un residuo en dominio log y dos máscaras). El modelo `sdr2hdr_shadow_v1` añade un "shadow gate" entrenado sobre el backbone v5. La capacidad es deliberadamente pequeña (1,2 M parámetros) porque la curva analítica realiza la mayor parte del mapeo y la red aporta únicamente lo que la curva no puede saber. Los datos de entrenamiento incluyen Poly Haven HDRIs (CC0), HdM-HDR-2014 y HdM-HFR-2017 (licencia académica), Netflix Chimera (CC BY 4.0) y metraje propietario de FXTD que no se redistribuye.

Los decodificadores HDR reemplazan el VAE tonemapped de los modelos de difusión. Se ofrecen en dos tamaños por backbone: `full` (unos 21,5 MB) y `turbo` (2-3 MB), diseñado para uso en grafo en vivo. La documentación no detalla la arquitectura exacta de estos decodificadores, pero su función es decodificar latentes de difusión a radiancia scene-linear normalizada a 10.000 nits, con blanco difuso en 203 según ITU-R BT.2408. Se integran en ComfyUI mediante el nodo "Radiance HDR VAE Decode".

## Capacidades

- Conversión de imágenes SDR de 8 bits a HDR scene-linear mediante inverse tone mapping (familia sdr2hdr).
- Decodificación de latentes de difusión a HDR scene-linear para los backbones Flux, SDXL, LTX-Video, Wan y Z-Image (familia decoders).
- Salida en radiancia real normalizada a 10.000 nits, con blanco difuso en 203 (ITU-R BT.2408).
- Integración con ComfyUI mediante un nodo personalizado ("Radiance HDR VAE Decode").
- Disponibilidad de dos modos de decodificación: `full` para mayor fidelidad y `turbo` para baja latencia en gráficos en vivo.
- No soporta tool calling, agentes ni capacidades multilingües, al ser un modelo de imagen a imagen.

## Casos de uso

1. Postproducción de vídeo: el modelo `sdr2hdr_shadow_v1` puede convertir metraje SDR de archivo a HDR scene-linear, recuperando rango dinámico en condiciones difíciles como compresión JPEG o banding, gracias a su rendimiento en la condición "hard" de los benchmarks internos.
2. Generación de imágenes HDR con difusión: los decodificadores `full` permiten generar imágenes HDR directamente desde latentes de Flux o SDXL, evitando el tonemapping que aplican los VAE estándar y obteniendo radiancia real.
3. Previsualización en vivo: el decoder `turbo` (2-3 MB) puede integrarse en un grafo de ComfyUI para decodificar en tiempo real en un pipeline de producción, donde la latencia es crítica.
4. VFX y CGI: los decodificadores pueden utilizarse para generar mapas de entorno HDR en formato OpenEXR, útiles para iluminación en renderizado 3D.
5. Restauración de contenido de archivo: aplicar inverse tone mapping a material antiguo de 8 bits con bajo rango dinámico, mejorando la calidad sin necesidad de re-grabar el metraje.
6. Investigación en HDR: los pesos Apache 2.0 permiten a investigadores reproducir los resultados internos y comparar con otros métodos de inverse tone mapping, aunque los benchmarks actuales solo son contra el baseline analítico propio.

## Benchmarks y rendimiento

Se han publicado resultados internos para la familia sdr2hdr, evaluados sobre 429 frames a 1280x720. Las métricas son PU21-PSNR (dB) y ColorVideoVDP JOD, comparadas contra el baseline analítico inverse-ACES sobre el que se construye el modelo. La condición "hard" simula un despliegue realista (curva de tono desconocida, croma 4:2:0, banding, JPEG) y "clean" es entrada bien graduada.

| Modelo | Clean dB | Clean JOD | Hard dB | Hard JOD |
|---|---|---|---|---|
| shadow_v1 | +0,07 | +0,113 | +1,24 | +0,389 |
| shadow_s2 | +0,71 | +0,068 | +0,96 | +0,308 |
| shadow_s3 | +0,45 | +0,089 | +1,18 | +0,358 |
| Media ± desviación | +0,41 ± 0,33 | +0,090 ± 0,023 | +1,12 ± 0,15 | +0,352 ± 0,041 |
| image_v5 | −3,00 | −0,046 | +1,43 | +0,443 |
| image_v6 | −2,75 | +0,004 | +0,96 | +0,343 |

Nota: estos valores son contra el baseline analítico propio, no contra otros métodos publicados. Para los decodificadores HDR no se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Por tamaño de pesos (1,2 M parámetros para sdr2hdr y 21,5 MB o menos para los decodificadores), el consumo de VRAM es mínimo y debería caber en cualquier GPU con más de 2 GB.
- GPU recomendadas: no disponible, pero cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente.
- Compatibilidad con GPU consumer: sí, todos los modelos son pequeños y no requieren hardware especial.
- Opciones de despliegue: ComfyUI (librería oficial), Python con PyTorch y safetensors mediante el repositorio de GitHub. No es un modelo de lenguaje, por lo que no aplican vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. La única comparación publicada es interna, contra el baseline analítico inverse-ACES incluido en el propio repositorio. Por tanto, no disponible.

## Limitaciones y advertencias

- Los benchmarks publicados son internos y no se han comparado con otros métodos publicados en el mismo split de evaluación.
- El backbone solo (`image_v5`) regresa en entrada limpia, especialmente en escenas de bajo rango dinámico: los 60 peores casos promedian −10,76 dB de PU21-PSNR con un pico de brillo mediano de 238 nits, mientras que los 60 mejores promedian +3,41 dB con 19.590 nits. El "shadow gate" del modelo `shadow_v1` corrige esta regresión.
- Las métricas PU21-PSNR y ColorVideoVDP JOD no siempre coinciden: una pérdida de 3,0 dB puede ser solo −0,046 JOD, muy por debajo de la diferencia apenas perceptible. No se deben citar los valores de PU21 sin los de JOD.
- La ganancia alcanzable está limitada por la entrada, no por el modelo: una lectura lineal de las características explica solo el 3% de la varianza en la escala por frame que usaría un oráculo, y el 79% de esa varianza se encuentra dentro de una condición, no entre condiciones.
- Las tres semillas del modelo shadow son una dispersión, no una distribución estadísticamente representativa.
- El refiner temporal (`sdr2hdr_temporal_v1`) no ha sido evaluado: su conjunto de validación y prueba es demasiado pequeño (4 y 5 clips de una sola escena) para reportar resultados.
- Los datos de entrenamiento incluyen material propietario de FXTD que no se redistribuye. Aunque la licencia del modelo es Apache 2.0, hay que revisar las licencias de los datasets utilizados (HdM-HDR-2014 y HdM-HFR-2017 tienen licencia académica; Netflix Chimera es CC BY 4.0).

## Enlaces

- Hugging Face: https://huggingface.co/fxtdstudios/RUDRA
- GitHub: https://github.com/fxtdstudios/RUDRA
- Sitio web de FXTD Studios: https://fxtdstudios.com
