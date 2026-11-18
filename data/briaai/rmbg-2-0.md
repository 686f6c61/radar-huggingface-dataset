# briaai/RMBG-2.0

## Resumen

RMBG-2.0 (Remove Background 2.0) es un modelo de segmentación de imagen especializado en la eliminación de fondos, desarrollado por BRIA AI. Suceda a RMBG-1.4 y está diseñado para generar máscaras alfa de alta precisión sobre sujetos de primer plano en imágenes, con especial énfasis en bordes finos como cabello, pelaje o transparencias. El modelo se distribuye a través de Hugging Face bajo acceso restringido (gated) y licencia propia `bria-rmbg-2.0`, no comercial por defecto.

Con 220,7 millones de parámetros, es un modelo compacto orientado a producción que se ejecuta en GPU de consumo y también en CPU mediante exportación ONNX. Su pipeline en `transformers` es `image-segmentation`, y el repositorio incluye pesos en `safetensors`, así como artefactos ONNX y compatibilidad con `transformers.js` para inferencia en el navegador.

Su relevancia actual radica en que ofrece una calidad de matting cercana a soluciones propietarias en un paquete de 5,9 GB, con más de 394.000 descargas y 1.654 likes en Hugging Face. La licencia restrictiva y el requisito de aceptar condiciones limitan su uso comercial directo sin acuerdo con BRIA AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (red de segmentación de imagen con `custom_code` en `transformers`) |
| Parámetros totales | 220.700.242 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible (pesos `safetensors` y exportación ONNX; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | `bria-rmbg-2.0` (licencia propia, acceso restringido) |
| Formato de pesos | `safetensors`, ONNX, compatible con `transformers.js` |

## Arquitectura y entrenamiento

La información pública disponible no detalla la arquitectura interna concreta (tipo de backbone, mecanismo de atención o diseño del decoder de máscaras). El modelo se integra en `transformers` mediante `custom_code`, lo que indica que requiere cargar código propio del repositorio para su ejecución. La tarea es `image-segmentation`, con salida orientada a máscaras de primer plano (alpha matting) en lugar de segmentación semántica multi-clase.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Tampoco se documenta el proceso de destilación o ajuste fino respecto a RMBG-1.4. Cualquier afirmación sobre estos puntos sería especulativa y no se incluye.

## Capacidades

- Eliminación de fondo de imágenes con generación de máscara alfa de alta precisión.
- Segmentación de sujetos de primer plano con tratamiento de bordes finos (cabello, pelaje, transparencias).
- Inferencia en pipeline `image-segmentation` de `transformers`.
- Exportación a ONNX para despliegue en entornos sin PyTorch.
- Compatibilidad con `transformers.js` para ejecución en navegador.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual.
- No dispone de capacidades multilingües, de texto, audio o vídeo documentadas.
- No se documenta un modo "thinking" ni capacidades agénticas.

## Casos de uso

- **Generación de recortes para e-commerce**: el modelo produce máscaras alfa de productos sobre fondos limpios, lo que permite sustituir el fondo por blanco o por plantillas de catálogo de forma automatizada en pipelines de procesado por lotes.
- **Edición fotográfica y retoque**: integrado en herramientas de escritorio o web, permite aislar al sujeto para aplicar desenfoque de fondo, cambios de color o composición con otras imágenes, aprovechando su manejo de bordes finos en cabello y pelaje.
- **Creación de avatares y contenido para redes**: generación de recortes de personas para stickers, miniaturas o superposiciones, con inferencia viable en GPU de consumo o incluso en navegador vía `transformers.js`.
- **Preprocesado para otros modelos de visión**: la máscara generada puede usarse para recortar regiones de interés antes de pasarlas a modelos de clasificación, detección o generación de imagen, reduciendo ruido de fondo.
- **Automatización de catálogos y DAM (Digital Asset Management)**: procesado masivo de imágenes en servidores con ONNX Runtime o PyTorch, generando versiones con fondo transparente para bibliotecas de activos.
- **Prototipado en frontend sin backend**: gracias a la compatibilidad con `transformers.js`, se puede ofrecer eliminación de fondo en el cliente sin enviar imágenes a un servidor, útil en demos y aplicaciones de privacidad.
- **Investigación en matting y segmentación**: como baseline reproducible de 220,7 M de parámetros para comparar técnicas de alpha matting y evaluar calidad de bordes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 220,7 M de parámetros en `safetensors` (probablemente fp32 o fp16), la huella de pesos es de aproximadamente 0,9 GB en fp32 y 0,45 GB en fp16; sumando activaciones y buffers de imagen, se estima un uso de VRAM de 1-2 GB en fp16 para resoluciones habituales. Dato estimado, no publicado oficialmente.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo es pequeño y no requiere GPU de datacenter.
- **¿Cabe en GPU de consumo?**: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1650 4 GB en adelante) y también en CPU mediante ONNX.
- **Opciones de despliegue**: `transformers` (PyTorch), ONNX Runtime, `transformers.js` para navegador. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| RMBG-2.0 (briaai) | 220,7 M | Eliminación de fondo / matting | `bria-rmbg-2.0` (propia) | Gated en HF | Sucesor de RMBG-1.4; ONNX y `transformers.js` |
| RMBG-1.4 (briaai) | no disponible | Eliminación de fondo | `bria-rmbg-1.4` (propia) | Gated en HF | Versión anterior de la misma familia |
| `rembg` (paquete de código abierto) | variable (U2-Net, ISNet, etc.) | Eliminación de fondo | MIT (el paquete) | Público | Agrupa varios modelos; licencias de los pesos varían |
| Segment Anything (SAM) de Meta | 632 M (ViT-B) a 2,4 B (ViT-H) | Segmentación promptable | Apache 2.0 | Público | Requiere prompts; no especializado en matting de bordes |

La comparación con SAM es cualitativa: SAM es un modelo general de segmentación con prompts, mientras que RMBG-2.0 está especializado en matting de primer plano sin intervención. La comparación con `rembg` es de ecosistema, no de arquitectura. No se dispone de métricas comparativas publicadas en la información proporcionada.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `bria-rmbg-2.0` no es de código abierto; el uso comercial requiere acuerdo con BRIA AI. El acceso está restringido (gated) y obliga a aceptar condiciones en Hugging Face.
- **Sesgos**: no se documentan evaluaciones de sesgo por género, etnia, edad o tipo de sujeto; al ser un modelo visual entrenado con datos no públicos, puede rendir peor en categorías subrepresentadas.
- **Alucinación**: en segmentación, el equivalente es la generación de máscaras incorrectas o la inclusión de regiones de fondo como primer plano; no se publican tasas de error.
- **Limitaciones de resolución y dominio**: no se documentan resoluciones máximas de entrada ni dominios de entrenamiento; imágenes muy grandes o muy ruidosas pueden degradar la máscara.
- **Sin capacidades de texto**: no procesa prompts ni instrucciones; no se puede guiar la segmentación con lenguaje natural.
- **Dependencia de `custom_code`**: la carga en `transformers` requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- **Caveat de producción**: el tamaño del repo (5,9 GB) incluye artefactos ONNX y pesos; conviene verificar qué ficheros se descargan según el backend elegido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briaai/RMBG-2.0
- Modelo anterior RMBG-1.4: https://huggingface.co/briaai/RMBG-1.4
- Página de BRIA AI: https://bria.ai/
- Documentación de `transformers` sobre segmentación de imagen: https://huggingface.co/docs/transformers/tasks/semantic_segmentation
- `transformers.js`: https://huggingface.co/docs/transformers.js
- Paquete `rembg` (alternativa de código abierto): https://github.com/danielgatis/rembg
