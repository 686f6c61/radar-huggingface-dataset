# mikemoz/is-this-ai-models

## Resumen

`mikemoz/is-this-ai-models` no es un modelo único, sino un paquete de cuatro detectores de imágenes generadas por IA convertidos a ONNX de media precisión (FP16) para su ejecución en navegador mediante `onnxruntime-web`. Lo publica el usuario mikemoz como artefacto de soporte del prototipo de investigación "Is this image AI?" del equipo Future of the Web de Mozilla. Cada detector procede de un modelo original distinto (SwinV2, SigLIP, SDXL-detector y CommFor), y el repositorio conserva la licencia de cada uno.

El problema que resuelve es la clasificación binaria imagen real frente a imagen sintética en entornos sin backend, con un único fichero `model_fp16.onnx` por detector (entrada `pixel_values` en formato NCHW float32, salida `p_ai` como probabilidad de que la imagen sea IA) y un `prep.json` con el preprocesado exacto que debe replicarse. El tamaño total del repositorio es de 0,8 GB, lo que refleja la suma de los cuatro conversores.

Es relevante ahora porque permite desplegar detección de deepfakes y contenido sintético del lado del cliente, sin enviar imágenes a un servidor, algo útil para verificación de contenido, moderación y herramientas de transparencia. La validación declarada por el autor compara las versiones ONNX con las originales en PyTorch sobre 363 imágenes de prueba, sin cambios de veredicto en el umbral de confianza del 95 % salvo un caso límite de SwinV2 (0,933 → 0,956).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro clasificadores de imagen independientes: SwinV2, SigLIP, SDXL-detector y CommFor (arquitectura interna de cada original no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imagen) |
| Tipos de cuantizacion | FP16 (ONNX); no se documentan otras variantes |
| Idiomas soportados | no disponible (clasificador de imagen, sin procesamiento de texto) |
| Licencia | other (cada detector conserva la licencia de su original: Apache-2.0, Apache-2.0, CC BY-NC 3.0 y MIT) |
| Formato de pesos | ONNX (`model_fp16.onnx`) más `prep.json` por detector |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es un trabajo de conversión y empaquetado. Cada carpeta (`swinv2`, `siglip`, `sdxl`, `commfor`) contiene la exportación a ONNX en FP16 de un detector previamente entrenado por terceros: `haywoodsloan/ai-image-detector-deploy` (basado en SwinV2), `Ateeqq/ai-vs-human-image-detector` (basado en SigLIP), `Organika/sdxl-detector` y `OwensLab/commfor-model-384` (paper arXiv:2411.04125). La interfaz es homogénea: entrada `pixel_values` en NCHW float32 y salida `p_ai` con la probabilidad de que la imagen sea generada por IA.

La innovación técnica está en la portabilidad: la conversión a FP16 y ONNX permite ejecutar los cuatro detectores en navegador con `onnxruntime-web`, sin GPU dedicada ni servidor. El autor documenta una verificación de equivalencia frente a los modelos PyTorch originales sobre 363 imágenes, comprobando que el veredicto en el umbral de confianza del 95 % se mantiene estable en todos los casos salvo un único ejemplo borderline de SwinV2. No se detallan los datos de entrenamiento, el número de tokens (no aplica) ni si hubo ajuste con RLHF, al tratarse de clasificadores de imagen heredados.

## Capacidades

- Clasificación binaria de imágenes: estima la probabilidad `p_ai` de que una imagen haya sido generada por IA.
- Ejecución en navegador mediante `onnxruntime-web`, sin backend ni envío de datos a servidores.
- Cuatro detectores complementarios en un mismo paquete, lo que permite comparar o combinar veredictos.
- Preprocesado reproducible mediante `prep.json` para cada detector.
- Inferencia en FP16, con menor huella de memoria que las versiones originales en PyTorch.
- No soporta tool calling, agentes, texto, visión general, audio ni modo de razonamiento: es exclusivamente un clasificador de imagen.

## Casos de uso

- Verificación de contenido en el navegador: una extensión o web puede cargar `model_fp16.onnx` y marcar imágenes sospechosas de ser sintéticas sin subirlas a ningún servidor, preservando la privacidad del usuario.
- Moderación de contenido en plataformas: integración del detector en el pipeline de subida de imágenes para señalar contenido generado por IA antes de su publicación.
- Herramientas de transparencia y periodismo: verificación rápida de imágenes virales en redes sociales, con el detector ejecutándose localmente en el dispositivo del periodista.
- Investigación en detección de deepfakes: uso de los cuatro detectores como línea base comparativa en estudios sobre robustez frente a generadores concretos (SDXL, modelos recientes, etc.).
- Aplicaciones educativas: demos interactivas que muestran al usuario la probabilidad de que una imagen sea IA directamente en el navegador.
- Filtrado previo en datasets: descarte automático de imágenes sintéticas al construir corpus de entrenamiento o evaluación, ejecutando el clasificador en local sin infraestructura GPU.
- Prototipos de navegador: integración en el prototipo "Is this image AI?" de Mozilla como referencia de despliegue cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo documenta una verificación de equivalencia ONNX frente a PyTorch sobre 363 imágenes de prueba, sin métricas de precisión, recall, AUC ni latencia.

## Requisitos de hardware

- Inferencia en navegador: requiere un navegador con soporte de WebAssembly y `onnxruntime-web`; el consumo de memoria depende del detector cargado (FP16, cuatro modelos en un repo de 0,8 GB).
- VRAM estimada: no disponible con precisión; al ser FP16 y orientado a navegador, el consumo es moderado y compatible con equipos sin GPU dedicada.
- GPU recomendadas: no aplica para el caso de uso principal; para ejecución servidor se puede usar cualquier GPU compatible con ONNX Runtime (A100, H100, RTX 4090, etc.), aunque no hay cifras publicadas.
- Cabe en GPU de consumo: sí, por el diseño orientado a navegador; no se especifican modelos concretos.
- Opciones de despliegue: `onnxruntime-web` (navegador), ONNX Runtime (servidor/escritorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a clasificación de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mikemoz/is-this-ai-models | Paquete de 4 detectores ONNX FP16 | no disponible | no aplica | other (mixta por detector) | Hugging Face |
| haywoodsloan/ai-image-detector-deploy | Detector SwinV2 original | no disponible | no aplica | Apache-2.0 | Hugging Face |
| Ateeqq/ai-vs-human-image-detector | Detector SigLIP original | no disponible | no aplica | Apache-2.0 | Hugging Face |
| Organika/sdxl-detector | Detector específico de SDXL | no disponible | no aplica | CC BY-NC 3.0 | Hugging Face |
| OwensLab/commfor-model-384 | Detector CommFor (paper arXiv:2411.04125) | no disponible | no aplica | MIT | Hugging Face |

## Limitaciones y advertencias

- Licencia mixta: el detector `sdxl` procede de un original con licencia CC BY-NC 3.0, por lo que su uso comercial está restringido; el resto son Apache-2.0 o MIT, pero cada copia conserva la licencia de su original.
- No es un modelo generativo ni un LLM: no procesa texto, no soporta tool calling ni agentes.
- Riesgo de falsos positivos y negativos: la detección de imágenes IA es inherentemente probabilística y los detectores pueden fallar ante generadores no vistos en entrenamiento.
- Un único caso borderline documentado en SwinV2 (0,933 → 0,956) muestra que la conversión FP16 puede alterar ligeramente la confianza en imágenes límite.
- No hay datos publicados de precisión, recall ni robustez frente a ataques adversariales o recompresión de imagen.
- El preprocesado debe coincidir exactamente con `prep.json`; un preprocesado incorrecto invalida las predicciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- El tamaño del repo (0,8 GB) puede ser elevado para carga en navegador si se descargan los cuatro detectores; conviene cargar solo el necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikemoz/is-this-ai-models
- Modelo original SwinV2: https://huggingface.co/haywoodsloan/ai-image-detector-deploy
- Modelo original SigLIP: https://huggingface.co/Ateeqq/ai-vs-human-image-detector
- Modelo original SDXL-detector: https://huggingface.co/Organika/sdxl-detector
- Modelo original CommFor: https://huggingface.co/OwensLab/commfor-model-384
- Paper CommFor: https://arxiv.org/abs/2411.04125
