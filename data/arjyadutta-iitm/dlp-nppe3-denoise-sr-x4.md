# ArjyaDutta-IITM/dlp-nppe3-denoise-sr-x4

## Resumen

El modelo DLP NPPE-3, desarrollado por ArjyaDutta-IITM, es una red neuronal convolucional de super-resolución y eliminación de ruido diseñada para imágenes de baja resolución, con ruido y poca luz. Fue creado para la competición NPPE-3 del curso DLP de la IITM BS Data Science, donde la métrica de evaluación es el PSNR. El modelo toma una imagen de entrada ruidosa y oscura y produce una imagen limpia con una resolución 4x superior en una sola pasada.

La arquitectura, denominada LLSRNet, tiene 17.121.404 parámetros y combina un tronco U-Net estilo NAFNet con bloques residuales de atención de canal (RCAB) y dos etapas de PixelShuffle. No es un modelo de lenguaje; se trata de una red de visión especializada, por lo que no tiene contexto de texto ni capacidades multilingües.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLSRNet (U-Net estilo NAFNet + RCAB + PixelShuffle) |
| Parámetros totales | 17.121.404 (17,1 M) |
| Longitud de contexto | No aplicable (modelo de visión) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplicable (procesamiento de imágenes) |
| Licencia | Unlicense (dominio público) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

LLSRNet es una red de una sola pasada que combina un tronco U-Net estilo NAFNet (encoder/decoder con bloques sin atención de canal) para estimar una imagen limpia de baja resolución con supervisión profunda. Sobre esa estimación, un stack de bloques residuales de atención de canal (RCAB) y dos etapas de PixelShuffle producen un residual que se suma a un upsample bicubic de la estimación limpia. Este skip bicubic permite que el modelo parta de un baseline cercano a 33 dB en la inicialización, en lugar de partir del ruido.

El entrenamiento se realizó en dos etapas. En primer lugar, se reconstruyó la degradación sintética a partir de muestras pareadas: un downsample por media de caja 4x4 seguido de ruido Poisson-Gaussiano independiente por píxel (`Var = a·I + b`, ajustado por imagen). Esto permitió generar ruido ilimitado y usar el target limpio de baja resolución como señal auxiliar. La etapa 1 entrenó desde cero sobre 1105 imágenes, con ~180.000 iteraciones, tamaño de parche progresivo (64→80→96), programación de LR coseno y pérdida de Charbonnier transicionando a MSE en el último 20%. La etapa 2 hizo fine-tuning desde el checkpoint de la etapa 1 sobre train + la mayoría de validación, reservando 40 imágenes de validación durante todo el proceso. En inferencia se aplica TTA dihedral 8-way y una calibración afín global (`alpha ≈ 0.998`, `beta ≈ +0.28`) sobre la luminancia, ajustada en el holdout.

## Capacidades

- Eliminación de ruido en imágenes oscuras con ruido Poisson-Gaussiano.
- Super-resolución 4x mediante dos etapas de PixelShuffle.
- Restauración conjunta de denoising y super-resolución en una sola pasada.
- Requiere TTA dihedral 8-way y calibración afín para alcanzar el rendimiento óptimo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada multimodal (solo imágenes).
- No es multilingüe ni tiene capacidades de generación de texto.
- No dispone de modo de pensamiento ni de capacidades de audio o vídeo.

## Casos de uso

Estos casos son aplicables cuando la degradación de la imagen de entrada coincide con la degradación sintética del entrenamiento (downsample 4x4 box-mean y ruido Poisson-Gaussiano en imágenes oscuras).

- Restauración de imágenes de cámaras de vigilancia nocturnas: el modelo puede tomar capturas de baja resolución y con ruido en condiciones de poca luz y generar una versión limpia y 4x más nítida, lo que facilita la identificación de detalles en aplicaciones de seguridad.
- Mejora de fotografías móviles en entornos con poca luz: integrado en una aplicación de cámara, el modelo procesa imágenes oscuras y granuladas para producir resultados más limpios, siempre que la degradación coincida con la sintética del entrenamiento.
- Preprocesamiento en pipelines de visión por computador: antes de ejecutar detección de objetos o segmentación, el modelo mejora la resolución y reduce el ruido en imágenes de baja calidad, lo que puede aumentar la precisión de los algoritmos posteriores.
- Recuperación de imágenes históricas o archivos digitalizados: el modelo puede restaurar fotografías antiguas de baja resolución con ruido, mejorando su calidad para su conservación o visualización.
- Aumento de resolución en imágenes científicas de microscopía: en entornos donde las capturas son oscuras y con ruido, el modelo puede ayudar a recuperar detalles finos a 4x, aunque su rendimiento depende de la similitud con la degradación de entrenamiento.
- Mejora de imágenes satelitales o aéreas en condiciones de baja iluminación: el modelo puede procesar parches de imágenes de baja resolución con ruido para mejorar la legibilidad, siempre que la degradación sea similar a la del entrenamiento.
- Fotografía computacional en tiempo real: con una GPU adecuada, el modelo puede integrarse en sistemas de captación en tiempo real para mejorar vídeo o imágenes de baja resolución, aunque la latencia no está documentada.

## Benchmarks y rendimiento

| Configuración | Holdout PSNR (40 imágenes) | Public leaderboard PSNR |
|---|---|---|
| Stage 1 (solo entrenamiento), sin TTA | 39,357 dB | — |
| Stage 1 (solo entrenamiento), con TTA 8-way | 39,407 dB | 39,879 dB |
| Stage 2 (fine-tune con train+val), sin TTA | 39,527 dB | — |
| Stage 2 (fine-tune con train+val), con TTA 8-way y calibración afín | 39,599 dB | 39,965 dB |

La configuración final enviada en el repositorio es la última: Stage 2 con TTA 8-way y calibración afín.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia en FP16 (los pesos ocupan aproximadamente 34 MB). Con TTA 8-way y activaciones, el consumo sigue siendo bajo.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 20/30/40). También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna es suficiente.
- Opciones de despliegue: PyTorch con safetensors. No aplica vLLM, llama.cpp, Ollama ni TGI, que son específicos para modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos de super-resolución o eliminación de ruido en el mismo conjunto de datos. Existe un repositorio similar en HuggingFace (`HUGGINGFACENOOB123/dlp-nppe3-denoise-sr`) que parece una variante del mismo proyecto, pero no se han publicado especificaciones ni resultados para comparar. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Entrenado en una degradación sintética específica: downsample 4x4 box-mean + ruido Poisson-Gaussiano con varianza dependiente de la intensidad, en imágenes muy oscuras (valor medio de píxel ≈ 39/255). No es un modelo generalista de eliminación de ruido ni super-resolución.
- El rendimiento reportado requiere aplicar TTA dihedral 8-way y una calibración afín global (`alpha ≈ 0.998`, `beta ≈ +0.28`) en la luminancia. El output crudo no alcanza esos valores de PSNR.
- Puede producir artefactos en imágenes con características de ruido, brillo o degradación diferentes a las del entrenamiento.
- No hay información sobre sesgos; al ser un modelo de imágenes, no se aplican sesgos lingüísticos, pero el rendimiento puede variar según el contenido.
- Licencia Unlicense: dominio público, lo que permite uso comercial sin restricciones, pero conviene revisar los términos de la licencia para confirmar la atribución.
- No se han publicado estudios de robustez frente a ataques adversarios ni pruebas de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArjyaDutta-IITM/dlp-nppe3-denoise-sr-x4
- Notebook de referencia: https://github.com/brpuneet898/iitm-nptel-resources/blob/main/dlp-nppe3-version2.ipynb
- Repositorio similar en HuggingFace: https://huggingface.co/HUGGINGFACENOOB123/dlp-nppe3-denoise-sr/tree/main
