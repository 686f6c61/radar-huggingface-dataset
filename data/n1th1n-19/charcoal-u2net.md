# n1th1n-19/charcoal-u2net

## Resumen

`charcoal-u2net` es un espejo del modelo U-2-Net en formato ONNX (`u2net.onnx`), publicado por el desarrollador n1th1n-19 para que la aplicación Charcoal pueda ejecutar eliminación de fondos directamente en el navegador. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una red convolucional de segmentación de imágenes orientada a la extracción de primer plano (salient object detection / background removal). El repositorio aloja el binario sin modificaciones respecto al export original.

El modelo original U-2-Net fue desarrollado por Xuebin Qin y coautores bajo licencia Apache-2.0, y la exportación a ONNX procede del proyecto rembg de Daniel Gatis. Su relevancia actual radica en que permite ejecutar segmentación de alta calidad en el dispositivo del usuario (inferencia local en navegador vía ONNX Runtime Web o WebAssembly), sin enviar imágenes a un servidor, lo que reduce costes de infraestructura y mejora la privacidad.

El repositorio tiene un tamaño de 0,2 GB y contiene únicamente el archivo de pesos ONNX. No se publican parámetros, contexto ni idiomas porque no aplican: es un modelo puramente visual y no procesa texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-2-Net (encoder-decoder convolucional con módulo RSU, residual U-block) |
| Parametros totales | no disponible (el binario ONNX ocupa aproximadamente 0,17 GB; el recuento exacto de parámetros no se indica en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin entrada de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un único archivo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`u2net.onnx`) |

## Arquitectura y entrenamiento

U-2-Net es una arquitectura de segmentación de objetos salientes basada en un encoder-decoder convolucional con bloques RSU (Residual U-blocks), que combinan conexiones residuales con subredes en forma de U para capturar características multi-escala sin incrementar excesivamente el coste computacional. La red produce mapas de saliencia (máscaras de primer plano) que se usan para recortar el sujeto de la imagen.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a este tipo de modelo). El autor indica explícitamente que el archivo es el `u2net.onnx` sin modificar, exportado desde rembg, con MD5 `60024c5c889badc19c04ad937298a77b` para verificación de integridad.

## Capacidades

- Segmentación de imágenes y eliminación de fondo (salient object detection).
- Generación de máscaras de primer plano a partir de imágenes RGB.
- Ejecución en navegador mediante ONNX Runtime Web / WebAssembly (caso de uso principal declarado por el autor).
- Inferencia local en el dispositivo del usuario, sin envío de imágenes a servidores.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, audio ni vídeo.

## Casos de uso

- Eliminación de fondos en el navegador: Charcoal carga el modelo ONNX y procesa la imagen en el cliente, de modo que el usuario obtiene un recorte sin subir el archivo a ningún servidor. Adecuado por privacidad y por eliminar coste de cómputo en backend.
- Herramientas de edición fotográfica web: integrar el modelo en un editor online para generar máscaras de sujeto que luego se usen en composición, cambio de fondo o filtros.
- Generación de avatares y fotos de perfil: recortar automáticamente al sujeto para estandarizar imágenes en plataformas de RRHH, marketplaces o redes sociales.
- Preprocesado para pipelines de visión: obtener máscaras de primer plano antes de tareas de clasificación, detección o generación de imágenes (por ejemplo, para inpainting o composición).
- Catálogos de producto en e-commerce: separar el producto del fondo para generar imágenes sobre fondo blanco o transparente de forma masiva y local.
- Aplicaciones de escritorio o móviles con ONNX Runtime: despliegue offline del modelo en apps que necesiten recorte de sujeto sin conexión ni dependencia de API externa.
- Prototipado rápido de segmentación: usar el ONNX como baseline para comparar con modelos más recientes (SAM, BiRefNet, etc.) antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo ONNX ocupa aproximadamente 0,17 GB; la inferencia requiere del orden de varios cientos de MB de memoria, aunque no se dispone de cifras oficiales en la información proporcionada.
- GPU recomendadas: no se especifican. Al ser un modelo convolucional pequeño, es viable en CPU y en GPUs de consumo (por ejemplo, RTX 3060 en adelante), pero no hay datos publicados de latencia.
- Cabe en GPU de consumo: sí, por tamaño del binario; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: ONNX Runtime (Web, CPU, CUDA), ONNX Runtime Web con WebAssembly/WebGPU, y cualquier runtime compatible con ONNX. El caso de uso documentado es el navegador a través de Charcoal.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| charcoal-u2net (U-2-Net ONNX) | CNN segmentación | no disponible | no aplica | Apache-2.0 | HuggingFace (ONNX) |
| rembg (U-2-Net y variantes) | CNN segmentación | no disponible | no aplica | MIT / Apache-2.0 según modelo | PyPI / GitHub |
| Segment Anything (SAM) | Transformer visión | no disponible en esta ficha | no aplica | Apache-2.0 | Meta AI / HuggingFace |
| BiRefNet | Transformer visión | no disponible en esta ficha | no aplica | MIT (según repositorio) | HuggingFace |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada. U-2-Net es un modelo más ligero y antiguo que SAM o BiRefNet, orientado a recorte de sujeto y ejecución en dispositivos modestos; SAM y BiRefNet ofrecen segmentación más general y de mayor calidad, a costa de mayor tamaño y cómputo.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no hay mejoras ni ajustes respecto al U-2-Net original; cualquier limitación del modelo original aplica aquí.
- Calidad dependiente del sujeto: U-2-Net está diseñado para objetos salientes; puede fallar en escenas con múltiples sujetos, fondos complejos o sujetos poco contrastados.
- Sin soporte de texto ni multilingüe: no es un modelo de lenguaje; no debe usarse para tareas de NLP.
- Sin datos de benchmarks ni de latencia publicados: la evaluación de rendimiento debe hacerse por cuenta del usuario.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de atribución a los autores originales (Xuebin Qin et al.) y al export de rembg.
- Verificar integridad del binario con el MD5 indicado (`60024c5c889badc19c04ad937298a77b`) antes de desplegarlo en producción.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; considerar el repositorio original de U-2-Net o rembg como fuentes primarias.

## Enlaces

- HuggingFace: https://huggingface.co/n1th1n-19/charcoal-u2net
- Repositorio Charcoal: https://github.com/n1th1n-19/charcoal
- U-2-Net original (GitHub): https://github.com/xuebinqin/U-2-Net
- rembg (export ONNX): https://github.com/danielgatis/rembg
