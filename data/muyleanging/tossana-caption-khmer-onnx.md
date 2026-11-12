# muyleanging/Tossana-Caption-Khmer-ONNX

## Resumen

Tossana-Caption-Khmer-ONNX es la versión exportada a ONNX del modelo Tossana, un sistema de generación automática de descripciones de imágenes (image captioning) especializado exclusivamente en idioma jemer (khmer). Lo desarrolla Ing Muyleang y se distribuye como una versión preview orientada a uso personal, evaluación e investigación. El modelo resuelve un problema muy concreto: producir pies de foto en jemer de forma totalmente offline, sin GPU, sin PyTorch y sin conexión a internet, sobre cualquier CPU.

La arquitectura es un codificador-decodificador de imagen a texto con encoder visual que procesa imágenes de 224×224 píxeles y genera una representación de 197 tokens de dimensión 384, y un decoder autorregresivo con vocabulario de 3.402 clústeres de letras jemer. El paquete int8 ocupa solo 36 MB y procesa una foto en aproximadamente 0,1-0,3 segundos en la CPU de un portátil, lo que lo hace adecuado para despliegue en dispositivos de gama baja, navegadores y entornos sin aceleración hardware.

Su relevancia actual radica en la escasez de herramientas de visión por computador para idiomas de bajos recursos como el jemer, y en la apuesta por un formato de pesos ultraligero (int8 ONNX) que permite ejecución en onnxruntime-web directamente en el navegador. Es una release preview: el autor advierte que las métricas de test aún no han sido validadas por anotadores humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador imagen-texto (encoder visual + decoder autorregresivo transformer) |
| Parametros totales | no disponible (peso int8 de 36 MB; referencia PyTorch de 131 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; captions de hasta 64 clústeres de letras jemer |
| Tipos de cuantizacion | int8 (por defecto) y fp32 (`onnx-fp32/`) |
| Idiomas soportados | jemer (km) |
| Licencia | tossana-preview (uso personal, evaluación e investigación; ver LICENSE) |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `onnx-fp32/encoder.onnx`, `onnx-fp32/decoder.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder para image captioning. El encoder recibe `pixel_values` con forma (n, 3, 224, 224) en float32 y produce una `memory` de (n, 197, 384), que se ejecuta una sola vez por foto. El decoder es autorregresivo: recibe `tokens` (n, L) en int64 junto con la `memory` y devuelve `logp` (n, 3402) para el siguiente token, ejecutándose una vez por paso de generación. El preprocesado consiste en redimensionar a 224×224, escalar a 0-1 y normalizar con media y desviación típica de 0,5. La decodificación usa beam search con beam 5, con las mismas reglas que `generate` de Hugging Face.

Los datos de entrenamiento provienen mayoritariamente de escenas cotidianas: Flickr8k (traducido al jemer) y fotos de turismo y calle de Camboya. Las fuentes citadas son phonsobon (khmer_Images_Captioning v2), rinabuoy (Khmer-Captioning), Darayut (khmer-historical-heritage-image-captioning), Flickr8k (Hodosh, Young & Hockenmaier, JAIR 2013) y MADLAD-400 (Kudugunta et al., 2023). No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO. La cuantización int8 se aplica a las operaciones MatMul/Gemm y a la tabla de embeddings, pero no a la convolución de patches, de modo que el modelo también funciona en onnxruntime-web (los navegadores carecen de kernel int8 ConvInteger).

## Capacidades

- Generación de descripciones de imágenes en jemer (image-to-text / image captioning).
- Ejecución totalmente offline sobre CPU, sin PyTorch, sin GPU y sin conexión a internet.
- Inferencia en navegador mediante onnxruntime-web gracias a la cuantización selectiva int8.
- Salida con puntuación de confianza junto al caption generado (`caption, confidence = tossana("photo.jpg")`).
- Decodificación con beam search (beam 5) integrada en el script de inferencia.
- Capacidad multilingüe: no disponible; el modelo está entrenado únicamente para jemer.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible.

## Casos de uso

- Accesibilidad para personas invidentes jemerhablantes: el modelo puede generar una descripción hablada del contenido de una foto capturada con el móvil, ejecutándose en local en la CPU del dispositivo sin depender de conectividad.
- Catalogación de patrimonio cultural camboyano: dado su entrenamiento con el dataset khmer-historical-heritage-image-captioning, puede etiquetar automáticamente fotos de templos y sitios históricos con pies de foto en jemer para archivos y museos.
- Aplicaciones web de subtitulado de imágenes en el navegador: al funcionar con onnxruntime-web, permite añadir descripciones en jemer a galerías o redes sociales sin enviar imágenes a un servidor, preservando la privacidad.
- Digitalización de archivos fotográficos locales: procesamiento por lotes de colecciones de fotos en equipos sin GPU, a un ritmo de 0,1-0,3 segundos por imagen, para generar metadatos textuales en jemer.
- Herramientas educativas de aprendizaje de jemer: generación de pies de foto como ejercicio de vocabulario y lectura para estudiantes, con la ventaja de que la inferencia es barata y puede ejecutarse en portátiles escolares.
- Investigación en visión por computador para lenguas de bajos recursos: el paquete ONNX int8 de 36 MB sirve como baseline reproducible y ligero para experimentos de captioning en jemer sin necesidad de infraestructura GPU.
- Prototipado rápido en aplicaciones móviles o de escritorio: la API Python (`tossana_infer.py`) y los ficheros ONNX permiten integrar el modelo en pipelines existentes con solo `onnxruntime`, `numpy`, `pillow` y `huggingface_hub`.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre las mismas 300 fotos de test (Flickr8k-Khmer + phonsobon), beam 5, BLEU-4 y CIDEr calculados sobre clústeres de letras jemer:

| Version | Tamano | BLEU-4 | CIDEr | Mismo caption que PyTorch | CPU por foto |
|---|---:|---:|---:|---:|---:|
| PyTorch (referencia) | 131 MB | 26,1 | 54,4 | — | — |
| ONNX fp32 (`onnx-fp32/`) | 136 MB | 26,3 | 53,4 | 94 % (282 / 300) | ≈0,23 s |
| ONNX int8 (por defecto) | 36 MB | 26,8 | 55,6 | 45 % (134 / 300) | ≈0,23 s |

El model-index declara CIDEr 55,6 para la versión int8 (frente a 54,4 de PyTorch), con `verified: false`. El autor advierte que los captions de test aún no han sido revisados por personas y que las cifras deben tratarse como una comprobación de progreso. Los resultados completos sobre 1.910 fotos están en la model card de la versión PyTorch.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no requiere GPU. No se han publicado requisitos de GPU.
- Cabe en cualquier CPU consumer: el paquete int8 ocupa 36 MB y el fp32 136 MB, por lo que cabe holgadamente en memoria RAM de dispositivos de gama baja.
- Opciones de despliegue: onnxruntime (Python), onnxruntime-web (navegador) y el script de inferencia `tossana_infer.py` incluido en el repositorio.
- Latencia y throughput estimados: aproximadamente 0,23 s por foto en CPU de portátil (rango declarado de 0,1-0,3 s), tanto en int8 como en fp32 según la tabla del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| Tossana-Caption-Khmer-ONNX | no disponible (36 MB int8) | captions ≤ 64 clústeres | jemer | tossana-preview | ONNX int8 / fp32 | CIDEr 55,6 (test propio, no verificado) |
| Tossana-Caption-Khmer (PyTorch) | no disponible (131 MB) | captions ≤ 64 clústeres | jemer | tossana-preview | PyTorch | CIDEr 54,4 (test propio) |
| Alternativas genéricas de image captioning multilingüe | no disponible | no disponible | múltiples | variable | variable | no disponible |

No se dispone de datos de benchmarks comparables con otros modelos de captioning en jemer en la información proporcionada.

## Limitaciones y advertencias

- Entrenado mayoritariamente con escenas cotidianas (Flickr8k traducido) y fotos de turismo y calle de Camboya; el dominio fuera de esas categorías puede degradar la calidad.
- Puede nombrar objetos que no están en la foto (por ejemplo, un monopatín en lugar de una bicicleta); el autor indica que se está investigando una protección contra este comportamiento.
- Las métricas de test no han sido validadas por anotadores humanos; deben interpretarse como una comprobación de progreso, no como una evaluación definitiva.
- La versión int8 produce captions distintos a los de PyTorch en aproximadamente el 55 % de los casos (134 de 300 coincidencias); para obtener exactamente los captions de PyTorch debe usarse `onnx-fp32/`.
- Licencia tossana-preview restringida a uso personal, evaluación e investigación; el uso comercial no está permitido sin consultar el fichero LICENSE.
- Soporte exclusivo de jemer: no hay capacidades multilingües declaradas.
- Es una release preview, por lo que la API y los artefactos pueden cambiar.

## Enlaces

- Repositorio Hugging Face (ONNX): https://huggingface.co/muyleanging/Tossana-Caption-Khmer-ONNX
- Versión PyTorch: https://huggingface.co/muyleanging/Tossana-Caption-Khmer
- Sitio web del proyecto: https://muyleanging.github.io/tossana-web/
- Licencia: LICENSE (incluido en el repositorio)
- Cita: Ing, Muyleang. "Tossana: A Small Khmer Image Captioning Model", 2026, Hugging Face.
