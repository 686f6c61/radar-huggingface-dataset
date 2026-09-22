# skillsafe-ai/u2net-human-seg

## Resumen

`skillsafe-ai/u2net-human-seg` es un artefacto ONNX listo para navegador que implementa la segmentación de personas de U^2-Net y se usa para eliminar el fondo de imágenes. No lo ha entrenado SkillSafe: el repositorio distribuye un import reproducible del fichero `u2net_human_seg.onnx` publicado por rembg, empaquetado por el conversor de SkillSafe con receta, huellas SHA-256 y manifiesto de procedencia. El resultado es un modelo de visión de 167,84 MB en float32, Apache-2.0, que se ejecuta con `onnxruntime-web` sobre WebGPU o WASM sin necesidad de backend.

El problema que resuelve es concreto: obtener una máscara de persona (foreground) con la que recortar o sustituir el fondo de una imagen o fotograma de vídeo, con procesamiento local en el cliente. Esto evita enviar fotografías de usuarios a un servidor, lo que simplifica el cumplimiento de RGPD en aplicaciones de edición, videollamada o catalogación de producto.

Su relevancia ahora es de tipo práctico más que de investigación: la arquitectura U^2-Net es de 2020, pero el valor añadido de este repositorio es la cadena de suministro verificable (origen fijado, toolchain documentada, `onnx.checker` y ejecución de humo superadas) y el contrato de entrada/salida explícito para integrarlo directamente en JavaScript. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U^2-Net (nested U-structure con bloques RSU, encoder-decoder de dos niveles); red convolucional de segmentación binaria |
| Parametros totales | no disponible en la informacion (el fichero ONNX ocupa 167,84 MB en float32, equivalente a unos 42 M de parametros como estimacion derivada del tamano, no confirmada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); entrada fija de imagen `[1, 3, 320, 320]` float32 |
| Tipos de cuantizacion | no disponible (solo se publica el fichero en float32; no hay variantes int8/float16) |
| Idiomas soportados | no aplica (modelo de segmentacion de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (pesos U^2-Net de Xuebin Qin et al.; ONNX distribuido por rembg bajo MIT) |
| Formato de pesos | ONNX, opset 11, fichero unico `u2net_human_seg.onnx` de 167,84 MB |
| SHA-256 del fichero | `01eb6a29a5c4d8edb30b56adad9bb3a2a0535338e480724a213e0acfd2d1c73c` |
| Salidas | 7 tensores float32 `[1, 1, 320, 320]` (`1959` a `1965`), con sigmoides en las salidas 1961-1965 |

## Arquitectura y entrenamiento

El modelo es una U^2-Net, una red totalmente convolucional de segmentación con estructura anidada de dos niveles: cada etapa del encoder y del decoder es un bloque RSU (Residual U-block) que contiene a su vez una pequeña U-Net interna con conexiones residuales. Esta disposición permite capturar contexto global y detalles de borde con relativamente pocos parámetros, y produce siete mapas de salida a distinta profundidad (la supervisión multi-escala es característica del diseño original). La entrada es una imagen RGB reescalada a 320x320 y la salida de interés para eliminación de fondo es la máscara sigmoide final.

Según la model card, este repositorio no contiene ningún entrenamiento propio: es un import del artefacto publicado por rembg, sin conversión, fijado por SHA-256 al origen (`v0.0.0`). La receta `recipes/u2net-human-seg.yaml` (sha256 `df13a13f2e72cd3b00135f368e6ccdbfb3c4c558ba14ffb282aeab8c51af28b6`) documenta la cadena de herramientas empleada: Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64, con conversión fechada el 2026-09-22T18:56:13+00:00. No se detallan en la información disponible el dataset de entrenamiento, el número de tokens o imágenes, ni si hubo ajuste con RLHF o DPO (no aplica en un modelo discriminativo de segmentación).

## Capacidades

- Segmentación de personas: genera una máscara de primer plano a partir de una imagen RGB de entrada.
- Eliminación de fondo: la máscara permite recortar al sujeto o sustituir el fondo en aplicaciones web.
- Ejecución en navegador: contrato explícito para `onnxruntime-web` con `executionProviders: ["webgpu", "wasm"]`.
- Inferencia en CPU o GPU indistintamente, al ser un grafo ONNX opset 11.
- Capacidades multilingües: no aplica.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Razonamiento multi-paso y agentes: no soportado.
- Modo thinking, visión general, audio, OCR: no disponibles; la tarea es específica de segmentación de personas, no segmentación semántica general ni matting de alta precisión.

## Casos de uso

- Fondo virtual en videollamadas web: la máscara de la persona se calcula por fotograma y se compone con un fondo sintético en un `<canvas>`; al ejecutarse con WebGPU/WASM, no requiere servidor de vídeo ni subir la señal a terceros.
- Editor de fotos 100 % en cliente: una PWA puede eliminar el fondo de la imagen que el usuario carga sin que esta salga del dispositivo, lo que reduce obligaciones de tratamiento de datos personales.
- Catalogación de producto en moda: recorte automático del modelo humano para generar fichas con fondo blanco o transparente a partir de fotografías tomadas en tienda o por proveedores.
- Retoque fotográfico en apps móviles híbridas: integración vía WebView/Capacitor para ofrecer "quitar fondo" sin incluir modelos nativos adicionales por plataforma.
- Anonimización en pipelines de visión: aislamiento del sujeto para difuminar o descartar el entorno en grabaciones, útil en entornos con requisitos de privacidad.
- Generación de pseudo-etiquetas para datasets: producir máscaras binarias de personas a gran escala como paso previo al entrenamiento de un modelo propio de matting o segmentación.
- Composiciones gráficas y avatares: extracción del retrato para generar stickers, plantillas de marketing o miniaturas con fondo corporativo.
- Preprocesado en herramientas de IA generativa: obtener la máscara para aplicar inpainting o cambios de fondo mediante un modelo de difusión que corra después.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni IoU, ni DICE, ni comparaciones con otros modelos de segmentación).

El único dato de rendimiento declarado es la verificación de humo ejecutada por el conversor: 1037,4 ms para una inferencia en CPU con entrada de ceros de forma `[1, 3, 320, 320]`, bajo onnxruntime 1.30.0 en Darwin 25.6.0 arm64. Es una prueba de que el grafo carga y ejecuta, no una medición representativa de latencia en producción.

## Requisitos de hardware

- Huella del modelo: 167,84 MB de pesos en float32; el uso de memoria de la sesión será de ese orden más el overhead de activaciones de ONNX Runtime.
- VRAM estimada: no se han publicado mediciones; por tamano de pesos, cabe holgadamente en cualquier GPU consumer reciente (del orden de cientos de MB, no GB).
- Cabe en GPU de consumo: si, incluidas integradas con soporte WebGPU y equipos sin GPU dedicada mediante el backend WASM.
- GPU de datacenter (A100, H100, RTX 4090): no son necesarias para este modelo; solo tendrian sentido para servir muchas inferencias concurrentes con onnxruntime-gpu o TensorRT.
- Navegador: `onnxruntime-web` con WebGPU como proveedor preferente y WASM como respaldo.
- Servidor: ONNX Runtime CPU/GPU; la conversión a OpenVINO, TensorRT o CoreML no está documentada en el repositorio.
- Latencia y throughput: solo disponible el dato de humo en CPU mencionado arriba (1037,4 ms). No hay cifras de throughput en WebGPU ni de inferencia por lotes.

## Comparativa con modelos similares

| Modelo | Tarea | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `skillsafe-ai/u2net-human-seg` (este) | Segmentación de personas / eliminación de fondo | 320x320 | ONNX opset 11 | Apache-2.0 | Import verificado de rembg, pensado para navegador |
| U^2-Net original (Xuebin Qin et al.) | Segmentación de objetos destacados y de personas | variable | PyTorch (checkpoints) | Apache-2.0 | Fuente upstream de estos pesos; requiere conversión propia |
| RMBG-1.4 (BRIA) | Eliminación de fondo general | 1024x1024 | safetensors / PyTorch | licencia especifica de BRIA, con restricciones de uso comercial | Mayor resolución de entrada; parámetros no disponibles; no se ejecuta en navegador sin conversión |
| MODNet | Portrait matting (recorte fino de retrato) | 512x512 (configuración habitual) | PyTorch, con exportaciones ONNX de terceros | no verificada en esta busqueda | Orientado a matting de retrato, no a segmentación genérica de personas |
| MediaPipe Selfie Segmentation | Segmentación de personas en tiempo real | 256x256 | TFLite / tareas web | Apache-2.0 | Optimizado para vídeo en dispositivo; parámetros no disponibles |

Los datos de parámetros, contexto e idiomas no aplican o no están disponibles para varios de estos modelos; la comparación se limita a tarea, formato y licencia.

## Limitaciones y advertencias

- Es un modelo de segmentación de personas, no de objetos: no cabe esperar buenos resultados con mascotas, productos o escenas sin figura humana.
- Resolución de entrada fija de 320x320: los detalles finos (pelo, bordes semitransparentes, gafas) se pierden al reescalar; no es una solución de matting de alta calidad.
- Riesgo de máscara incompleta o artefactos con iluminación adversa, oclusiones, varias personas solapadas o fondos del mismo tono que la ropa.
- No hay métricas publicadas de calidad (IoU/DICE) ni evaluación con datasets de referencia, por lo que la calidad no está cuantificada por el autor del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de mantenimiento.
- La licencia Apache-2.0 cubre los pesos de U^2-Net, pero la model card exige mantener la atribución a Xuebin Qin et al. y a rembg (MIT) para el artefacto ONNX. La receta y la model card quedan bajo la licencia del repositorio de SkillSafe.
- Las fechas registradas (creación 2026-09-22) y el toolchain declarado (torch 2.10.0, onnx 1.23.0) deben verificarse contra el `manifest.json` antes de integrarlo en una cadena de suministro automatizada.
- El SHA-256 del fichero debe comprobarse tras la descarga; el repositorio no incluye firma criptográfica adicional.
- Sin soporte de idiomas, tool calling ni agentes: cualquier descripción que lo presente como modelo de lenguaje o multimodal es incorrecta.
- Al ejecutarse en navegador, la latencia depende del dispositivo del usuario; el dato de 1037,4 ms es de una prueba de humo en CPU y no sirve para dimensionar un servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/u2net-human-seg
- Origen upstream del ONNX (release de rembg): https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net_human_seg.onnx
- Repositorio de rembg: https://github.com/danielgatis/rembg
- Repositorio y licencia de U^2-Net: https://github.com/xuebinqin/U-2-Net y https://github.com/xuebinqin/U-2-Net/blob/master/LICENSE
- Paper original de U^2-Net: https://arxiv.org/abs/2005.09007
- Recetas y conversor de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Documentacion de onnxruntime-web (referencia general sobre la runtime citada, no enlazada desde la model card): https://onnxruntime.ai/docs/tutorials/web/
- Busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por el buscador no guardan relacion con esta ficha.
