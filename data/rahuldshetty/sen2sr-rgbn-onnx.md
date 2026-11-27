# rahuldshetty/sen2sr-rgbn-onnx

## Resumen

SEN2SR RGBN x4 ONNX es una exportación a formato ONNX del modelo `SEN2SRLite/NonReference_RGBN_x4`, desarrollado en el marco del proyecto ESAOpenSR/SEN2SR y publicado originalmente por tacofoundation. Se trata de una red neuronal convolucional (CNN) especializada en superresolución de imágenes de satélite Sentinel-2, que eleva la resolución espacial de 10 m a 2,5 m (factor x4) sobre las bandas B04 (rojo), B03 (verde), B02 (azul) y B08 (infrarrojo cercano). No es un modelo de lenguaje: su única función es la mejora de resolución de imágenes multiespectrales de teledetección.

El modelo resuelve un problema clásico en teledetección: la limitación física de la resolución espacial de los sensores orbitales. Al aplicar superresolución sobre las cuatro bandas de 10 m de Sentinel-2, permite obtener productos de 2,5 m sin depender de sensores comerciales de pago. La exportación a ONNX facilita su despliegue en entornos de inferencia heterogéneos (CPU, GPU, aceleradores) sin necesidad de PyTorch, y la inclusión de la máscara de Fourier permite reproducir exactamente la restricción de baja frecuencia del wrapper de referencia.

La relevancia actual del modelo reside en su carácter abierto (licencia CC0-1.0) y en su integración en el ecosistema ESAOpenSR, lo que lo convierte en una pieza reutilizable para pipelines de procesamiento geoespacial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar alojados en el repo o que el contenido es mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red convolucional) para superresolución de imágenes; exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación en float32) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | CC0-1.0 |
| Formato de pesos | ONNX (float32); máscara auxiliar `low_pass_mask.npy` |
| Entrada | float32 `(1, 4, H, W)`, bandas B04, B03, B02, B08 en reflectancia (DN / 10000) |
| Salida | float32 `(1, 4, 4H, 4W)`, mismo orden de bandas y unidades, con clamp `min=0` |
| Factor de escala | x4 (10 m a 2,5 m) |
| Resolución de entrenamiento | tiles de 128x128 píxeles |
| Dinamismo del grafo | H y W dinámicos en el grafo ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es una CNN de superresolución sin referencia (non-reference), es decir, no requiere una imagen de alta resolución de referencia durante la inferencia. El modelo original `SEN2SRLite/NonReference_RGBN_x4` forma parte del proyecto ESAOpenSR/SEN2SR y se entrena sobre tiles de 128x128 píxeles de las bandas B04, B03, B02 y B08 de Sentinel-2, normalizadas a reflectancia (DN / 10000). La exportación ONNX conserva el grafo con dimensiones H y W dinámicas, aunque el autor recomienda usar tiles de 128 px para que la máscara de Fourier publicada sea aplicable.

La innovación técnica destacable no está en la arquitectura en sí, sino en el mecanismo de restricción de baja frecuencia basado en una máscara de Fourier de 512x512 (`low_pass_mask.npy`). El wrapper de referencia combina el upsample bicúbico de la imagen de baja resolución (frecuencias bajas) con la salida de la CNN (frecuencias altas) mediante la expresión `out = ifft(lowpass(lr_up) * mask + lowpass(cnn) * (1 - mask))`. Esta restricción garantiza coherencia espectral con la imagen original. El autor verifica que la salida ONNX coincide con la CNN original de PyTorch con una diferencia absoluta máxima inferior a 3e-6, y que la restricción de máscara más numpy coincide con el wrapper de referencia con una diferencia inferior a 1e-6.

No se dispone de información sobre el número de tokens de entrenamiento (no aplica), la composición exacta del dataset, ni si se emplearon técnicas de RLHF/DPO (no aplica a un modelo de visión).

## Capacidades

- Superresolución de imágenes Sentinel-2 de 10 m a 2,5 m (factor x4) sobre cuatro bandas: B04, B03, B02 y B08.
- Procesamiento de tiles de 128x128 píxeles con grafo ONNX de dimensiones H y W dinámicas.
- Entrada y salida en reflectancia (DN / 10000) con clamp `min=0` en la salida.
- Aplicación de restricción de baja frecuencia mediante máscara de Fourier para preservar coherencia espectral.
- Inferencia sin referencia de alta resolución (non-reference super-resolution).
- Despliegue portable vía ONNX Runtime en CPU, GPU o aceleradores compatibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la superresolución multiespectral.

## Casos de uso

- Monitorización agrícola de precisión: el modelo permite generar imágenes de 2,5 m a partir de Sentinel-2 de 10 m para delimitar parcelas, detectar estrés hídrico o estimar índices de vegetación (NDVI) con mayor detalle espacial, integrándose en pipelines de teledetección que ya consumen productos Sentinel-2.
- Seguimiento de cambios urbanos: al cuadruplicar la resolución espacial, facilita la identificación de nuevas construcciones, ampliaciones viarias o cambios de uso del suelo en áreas donde los píxeles de 10 m resultan insuficientes para discriminar objetos pequeños.
- Gestión de emergencias y desastres: la superresolución de las bandas visibles e infrarrojo cercano permite delimitar con mayor precisión áreas inundadas, cicatrices de incendios o zonas afectadas por deslizamientos en evaluaciones rápidas posteriores a un evento.
- Análisis de masas de agua y calidad costera: la banda B08 (NIR) superresuelta mejora la discriminación de límites tierra-agua y la detección de floraciones algales o turbidez en cuerpos de agua continentales y litorales.
- Generación de productos cartográficos de mayor detalle: el modelo puede emplearse como paso previo a la vectorización de elementos lineales (cauces, carreteras, linderos) en flujos de trabajo GIS, reduciendo la confusión entre píxeles adyacentes.
- Investigación en superresolución de teledetección: al ser una exportación ONNX verificada numéricamente contra la implementación PyTorch de referencia, sirve como baseline reproducible para comparar nuevas arquitecturas de superresolución sobre Sentinel-2 en entornos sin PyTorch.
- Despliegue en entornos edge o sin GPU: al estar en formato ONNX con grafo dinámico, puede ejecutarse en servidores CPU o dispositivos con ONNX Runtime, lo que facilita su integración en servicios de procesamiento por lotes de imágenes satelitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta verificaciones numéricas de equivalencia entre la exportación ONNX y la implementación original en PyTorch: diferencia absoluta máxima inferior a 3e-6 para la CNN y inferior a 1e-6 para la restricción de máscara más numpy. No se proporcionan métricas de calidad de superresolución (PSNR, SSIM, LPIPS) ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al procesar tiles de 128x128 con 4 bandas en float32, el consumo de memoria es bajo, pero no se especifica una cifra concreta.
- GPU recomendadas: no disponible. Cualquier GPU compatible con ONNX Runtime (CUDA o ROCm) podría ejecutar el modelo; no se indican modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño de los tiles (128x128) y el formato float32, pero no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), integrable en pipelines Python; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Factor de escala | Bandas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SEN2SR RGBN x4 ONNX (este) | CNN non-reference | x4 (10 m a 2,5 m) | B04, B03, B02, B08 | ONNX | CC0-1.0 | Hugging Face |
| SEN2SRLite/NonReference_RGBN_x4 | CNN non-reference | x4 | B04, B03, B02, B08 | PyTorch (original) | no disponible en la información | Referenciado vía ESAOpenSR/SEN2SR |
| tacofoundation/SEN2SR | CNN non-reference | no disponible | no disponible | no disponible | CC0-1.0 | Hugging Face |

No se dispone de información suficiente para comparar con otros modelos de superresolución de Sentinel-2 (por ejemplo, basados en GAN o transformers) en términos de parámetros, contexto o rendimiento. Los datos de la tabla se limitan a lo indicado en la model card.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en superresolución de imágenes Sentinel-2; no es un modelo de lenguaje ni admite tareas de texto, código o razonamiento.
- Entrenado para tiles de 128x128 píxeles; el uso de la máscara de Fourier publicada está pensado para esa resolución, y tiles de otro tamaño pueden requerir una máscara distinta.
- La superresolución no crea información real: puede introducir artefactos o detalles plausibles pero inexistentes, por lo que no debe tratarse como sustituto de imágenes de alta resolución reales en aplicaciones críticas.
- Riesgo de alucinación visual: la CNN puede generar texturas o bordes no presentes en la escena original, especialmente en áreas homogéneas o con cobertura nubosa.
- No se especifican sesgos geográficos ni de tipo de superficie en el entrenamiento; el rendimiento puede degradarse en escenas no representadas en el dataset original.
- La licencia CC0-1.0 permite uso comercial sin restricciones conocidas, pero se recomienda verificar la licencia del modelo original `SEN2SRLite/NonReference_RGBN_x4` y del proyecto ESAOpenSR/SEN2SR.
- El repositorio muestra 0 descargas y 0,0 GB de tamaño; conviene confirmar que los pesos ONNX y la máscara `low_pass_mask.npy` están efectivamente alojados antes de integrarlo en producción.
- No se proporcionan métricas de calidad (PSNR, SSIM) ni evaluaciones independientes, lo que limita la evaluación objetiva de su rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/rahuldshetty/sen2sr-rgbn-onnx
- Modelo original en Hugging Face: https://huggingface.co/tacofoundation/SEN2SR
- Repositorio ESAOpenSR/SEN2SR: https://github.com/ESAOpenSR/SEN2SR
