# SadikNawazAI/sadik-bg-remover

## Resumen

Sadik BG Remover es un paquete de segmentación de imágenes orientado a la eliminación de fondos, publicado por el usuario SadikNawazAI en Hugging Face. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una aplicación completa que empaqueta dos motores de segmentación en formato ONNX: ISNet General Use (licencia Apache-2.0) y BiRefNet General Lite (licencia MIT). Ambos pesos se ejecutan mediante ONNX Runtime y están pensados para inferencia local, sin subir imágenes a ningún servidor externo.

El repositorio incluye tres formas de uso: una aplicación de escritorio con arrastrar y soltar, una interfaz de línea de comandos (CLI) con soporte para lotes recursivos y salida JSON, y una API HTTP local construida sobre FastAPI con endpoints para una imagen o lotes de hasta 100 imágenes. El tamaño total del repositorio es de 0,4 GB, e incluye los pesos de los dos modelos empaquetados listos para usar sin conexión.

La relevancia del proyecto es práctica: ofrece una solución llave en mano para pipelines de eliminación de fondos en local, con alternativas de calidad y velocidad, y con integración opcional en flujos de asistentes locales como Ollama o LM Studio (que solo describen la imagen, ya que no pueden generar un PNG con transparencia). La licencia es mixta (MIT y Apache-2.0 según el componente), y los idiomas soportados no están especificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Redes de segmentación de imágenes (ISNet/DIS y BiRefNet), exportadas a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible (pesos ONNX empaquetados; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Mixta: MIT y Apache-2.0 (mixed-mit-apache-2.0) |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El paquete no entrena modelos propios: distribuye pesos ya entrenados por terceros, convertidos a ONNX. El motor por defecto es ISNet General Use, derivado del modelo IS-Net / DIS de Xuebin Qin et al. (Apache-2.0), convertido a ONNX y distribuido por el proyecto rembg. La opción de mayor calidad es BiRefNet General Lite, de ZhengPeng et al. (MIT), también convertido por rembg. Adicionalmente se ofrecen descargas opcionales de BiRefNet General (928 MB) y U2Net (168 MB, Apache-2.0).

La inferencia se realiza íntegramente con ONNX Runtime, lo que permite ejecución en CPU sin GPU dedicada. El paquete añade utilidades de postprocesado como el *soft alpha matting* para refinar bordes de pelo y pelaje, a costa de mayor tiempo de cómputo. No se documentan en la información disponible los detalles de entrenamiento (número de tokens, composición del dataset, RLHF/DPO), al tratarse de modelos de segmentación y no de lenguaje.

## Capacidades

- Segmentación de imágenes para eliminar el fondo y generar PNG con transparencia.
- Dos motores seleccionables: ISNet (rápido, por defecto) y BiRefNet Lite (más lento, bordes más limpios).
- Fondos de salida configurables: transparente, blanco, negro, color personalizado o imagen.
- *Soft alpha matting* opcional para bordes suaves en pelo y pelaje.
- Procesamiento por lotes: carpetas recursivas en CLI y hasta 100 imágenes por petición en la API.
- Salida JSON para integración en scripts y automatizaciones.
- API HTTP local con endpoints `/health`, `/models`, `/remove`, `/remove-batch` y documentación OpenAPI en `/docs`.
- Integración opcional con Ollama y LM Studio mediante un `Modelfile` y un *system prompt*, para que un asistente describa la imagen antes de delegar el recorte real en este paquete.
- Verificación de integridad de los pesos empaquetados mediante `SHA256SUMS`.
- Comando de diagnóstico de instalación (`sadik-bg doctor`).

## Casos de uso

- **E-commerce y catálogos de producto**: procesar lotes de fotos de producto con `sadik-bg remove ./products -o ./white --bg "#ffffff"` para obtener imágenes con fondo blanco normalizado, listas para fichas de tienda.
- **Estudio fotográfico y retrato**: usar `--alpha-matting` con BiRefNet Lite para recortar retratos con pelo rizado o bordes complejos, donde ISNet deja halos.
- **Automatización de pipelines de diseño**: invocar el endpoint `/remove-batch` desde un script de CI/CD o un orquestador para generar recortes de forma desatendida, con respuesta en ZIP.
- **Aplicaciones de escritorio locales**: integrar la API en `127.0.0.1:8765` desde cualquier herramienta interna sin depender de servicios en la nube ni enviar imágenes fuera del equipo.
- **Preprocesado para otros modelos de visión**: generar máscaras y recortes limpios como paso previo a clasificadores, detectores o modelos de descripción ejecutados en local.
- **Flujos con asistentes locales (Ollama/LM Studio)**: usar el asistente para describir el sujeto y los bordes problemáticos de la imagen, y delegar el recorte real en Sadik BG Remover, ya que los modelos GGUF no producen PNG transparentes.
- **Procesamiento por lotes en servidores sin GPU**: al ejecutarse sobre ONNX Runtime en CPU, permite recortar colecciones grandes en máquinas sin acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica de forma estricta; la inferencia se ejecuta con ONNX Runtime y está optimizada para CPU. No se documenta consumo de VRAM para ejecución en GPU.
- **GPU recomendadas**: no se especifican; el diseño prioriza inferencia en CPU. Cualquier GPU compatible con ONNX Runtime podría acelerar la ejecución, pero no hay datos publicados.
- **GPU de consumo**: no se confirma compatibilidad ni rendimiento en RTX 4090 u otras GPU de consumo; el caso de uso documentado es CPU.
- **Almacenamiento**: 0,4 GB para el repositorio con los dos modelos empaquetados (ISNet 170 MB + BiRefNet Lite 214 MB); hasta 928 MB adicionales si se descarga BiRefNet General.
- **Despliegue**: paquete Python instalable (`pip install -e .`), CLI (`sadik-bg`), app de escritorio (`sadik-bg gui`) y servidor FastAPI (`sadik-bg serve --port 8765`). Compatible con Windows (scripts `.bat`), macOS y Linux.
- **Latencia y throughput**: no disponibles; la model card solo indica que ISNet es la opción rápida y BiRefNet Lite la lenta pero de mayor calidad, sin cifras.

## Comparativa con modelos similares

| Modelo | Motor | Tamaño | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Sadik BG Remover (ISNet) | ISNet General Use | 170 MB | Apache-2.0 | ONNX | Opción rápida por defecto, CPU |
| Sadik BG Remover (BiRefNet Lite) | BiRefNet General Lite | 214 MB | MIT | ONNX | Mejores bordes, más lento |
| BiRefNet General (opcional) | BiRefNet General | 928 MB | MIT | ONNX | Máxima calidad, descarga aparte |
| U2Net (opcional) | U2Net | 168 MB | Apache-2.0 | ONNX | Modelo clásico, descarga aparte |
| rembg (upstream) | ISNet / BiRefNet / U2Net | variable | según modelo | ONNX | Proyecto de origen de las conversiones |

No se dispone de datos de rendimiento comparativo (métricas de IoU, S-measure, latencia) en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto, código ni razonamiento; cualquier expectativa en ese sentido es incorrecta.
- **Ollama y LM Studio no producen PNG transparentes**: la model card advierte explícitamente que los modelos GGUF de lenguaje/visión no pueden generar recortes; el asistente solo describe la imagen y delega el recorte.
- **Licencia mixta**: los componentes tienen licencias distintas (MIT para BiRefNet, Apache-2.0 para ISNet y U2Net); es necesario revisar el archivo `LICENSE` antes de uso comercial y atribuir correctamente a los autores originales.
- **Procedencia de los pesos**: los modelos no son entrenados por el autor del repositorio, sino conversiones de terceros (IS-Net/DIS de Xuebin Qin et al. y BiRefNet de ZhengPeng et al.) distribuidas por rembg; conviene verificar los espejos upstream.
- **Calidad variable según imagen**: los bordes de pelo, pelaje o transparencias complejas pueden requerir `--alpha-matting` o el modelo BiRefNet General, con coste adicional de tiempo.
- **API local por defecto**: el servidor escucha en `127.0.0.1`; exponerlo en red requiere configuración adicional y medidas de seguridad no documentadas.
- **Cero adopción**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.
- **Sin datos de benchmarks ni de sesgos**: no se han publicado evaluaciones cuantitativas ni análisis de sesgos por tipo de imagen, sujeto o demografía.
- **Idiomas no especificados**: al ser un modelo de visión, la noción de idioma no aplica directamente, pero no se documenta el rendimiento en imágenes con texto o contextos culturales diversos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SadikNawazAI/sadik-bg-remover
- Licencia: https://huggingface.co/SadikNawazAI/sadik-bg-remover/blob/main/LICENSE
- Repositorio rembg (conversiones ONNX): https://github.com/danielgatis/rembg
- Repositorio BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Espejo ISNet General Use: https://huggingface.co/jellybox/isnet-general-use
- Paper IS-Net / DIS (arXiv:2204.09400): https://arxiv.org/abs/2204.09400
- Paper BiRefNet (arXiv:2401.03462): https://arxiv.org/abs/2401.03462
- Documentación OpenAPI local (al ejecutar el servidor): http://127.0.0.1:8765/docs
