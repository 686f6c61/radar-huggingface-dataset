# kyraoki/chrome-extension-addons

## Resumen

`kyraoki/chrome-extension-addons` no es un modelo de lenguaje, sino un repositorio de artefactos binarios que las extensiones de navegador descargan bajo demanda ("add-ons") para ejecutar inferencia local en el dispositivo del usuario. El repositorio lo mantiene el usuario kyraoki y su propósito es servir como CDN versionado de pesos: cada add-on vive en su propia carpeta y los consumidores fijan un hash de commit en la URL de descarga y verifican cada fichero con su SHA-256, de modo que actualizar una carpeta no rompe una versión ya publicada.

En el momento de la consulta el repositorio contiene una única carpeta, `enhance/`, con un fichero de pesos para superresolución de imagen: `realesr-general-x4v3-dn05.f16.bin`. Se trata de una mezcla de los pesos oficiales `realesr-general-x4v3` y `realesr-general-wdn-x4v3` de Real-ESRGAN, combinados con un nivel de denoise de 0,5 (el mecanismo DNI de Real-ESRGAN). El fichero ocupa 2.426.592 bytes, almacena 1.213.296 valores en float16 little-endian y corresponde a la arquitectura SRVGGNetCompact.

La relevancia de este repositorio es de infraestructura más que de modelado: ilustra el patrón de distribución de pesos para extensiones de Chrome que ejecutan modelos ONNX en local sin enviar datos a un servidor. Conviene enmarcarlo en un contexto de seguridad delicado, ya que en los últimos años se han documentado campañas de extensiones de Chrome fraudulentas que se disfrazan de mejoras de IA para robar datos de usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SRVGGNetCompact (CNN de superresolucion; 64 features, 32 bloques, factor x4) |
| Parametros totales | 1.213.296 valores (~1,21 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | float16 (little-endian); no se describen otras cuantizaciones |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `other` / `per-folder`; la carpeta `enhance/` es BSD-3-Clause |
| Formato de pesos | binario float16 little-endian en orden del state-dict; el repo declara el tag `onnx` |
| Tamano del repositorio | 0,1 GB |
| Factor de reescalado | x4 |
| Fichero principal | `enhance/realesr-general-x4v3-dn05.f16.bin` (2.426.592 B) |
| SHA-256 del fichero | `f264dc89e296f89ce169cb1a4dd10def60e1540fbf5f0231b7bb110429973cf0` |
| Fuente de los pesos | Real-ESRGAN v0.2.5.0 |
| Fecha de creacion | 2026-10-13 |
| Ultima actualizacion | 2026-10-13 |

## Arquitectura y entrenamiento

La arquitectura subyacente es SRVGGNetCompact, una red convolucional compacta de tipo VGG orientada a superresolución de imagen. Segun la model card, la variante empleada tiene 64 features y 32 bloques, con un factor de ampliacion x4. No emplea mecanismos de atencion tipo transformer ni arquitecturas híbridas: es una CNN pura, lo que explica su reducido número de parámetros (~1,21 M) y su idoneidad para ejecutarse en el navegador.

Los pesos no se han entrenado para este repositorio: son una mezcla de los checkpoints oficiales `realesr-general-x4v3` y `realesr-general-wdn-x4v3` de Real-ESRGAN, combinados con denoise 0,5 mediante el mecanismo DNI (Deep Network Interpolation) del propio proyecto. El fichero almacena 1.213.296 valores float16 en el orden del state-dict del checkpoint original. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento original, el número de tokens (no aplica) ni procesos de RLHF/DPO (no aplican a un modelo de visión).

## Capacidades

- Superresolución de imagen: amplía imagenes a un factor x4 con restauracion de detalle.
- Reduccion de ruido integrada: la mezcla con DNI a 0,5 incorpora el comportamiento de la variante `wdn` (weighted denoise), que suaviza artefactos y ruido en imagenes degradadas.
- Inferencia en el dispositivo: pensada para ejecutarse de forma local en el navegador, sin envio de datos a un servidor.
- Distribucion versionada: consumo mediante URL con hash de commit y verificacion por SHA-256 por fichero.
- Generacion de texto, razonamiento, codigo, matematicas, vision multimodal, tool calling y agentes: no disponibles / no aplicables (no es un LLM).
- Capacidades multilingues: no aplicables (no procesa lenguaje).
- Capacidades especiales (thinking mode, audio): no disponibles / no aplicables.

## Casos de uso

- Mejora de imagenes en el navegador: una extension de Chrome puede descargar el fichero desde el repositorio fijando un commit, verificar su SHA-256 y aplicar superresolucion x4 sobre imagenes del usuario sin subirlas a ningun servidor.
- Restauracion de capturas de pantalla o miniaturas: util para reescalar imagenes de baja resolucion en herramientas de edicion o catalogacion que funcionan totalmente en el cliente.
- Procesamiento por lotes en local: aplicar la mejora a galerias de imagenes dentro del navegador o en un runtime local, aprovechando el reducido tamano del modelo (~2,4 MB).
- Pipeline con distribucion desacoplada: integradores que necesitan actualizar los pesos de un add-on sin romper versiones ya desplegadas, gracias al pin de commit y la verificacion por SHA-256.
- Mejora previa a OCR o analisis de imagen: el reescalado x4 con denoise puede mejorar la calidad de entrada antes de otras etapas de vision en cliente.
- Aplicaciones sin conectividad o con requisitos de privacidad: escenarios donde los datos no pueden salir del dispositivo y se necesita una mejora de imagen totalmente offline una vez descargado el modelo.
- Prototipado de add-ons de IA en el navegador: sirve como referencia de empaquetado y verificacion de pesos para extensiones que ejecutan modelos ONNX en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB, incluido el fichero de 2,4 MB mas los buffers de inferencia para imagenes de tamano habitual; el modelo en float16 ocupa aproximadamente 2,4 MB.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Se beneficia de aceleracion mediante WebGPU o WASM SIMD en el navegador.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, integradas) e incluso en telefonos y equipos de gama baja.
- Opciones de despliegue: ONNX Runtime Web (WebGPU/WASM) en extensiones de navegador, o runtimes nativos como ncnn (Real-ESRGAN dispone de implementaciones ncnn/Vulkan). No aplica vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran de la resolucion de entrada, el backend (WebGPU frente a WASM) y el hardware del cliente.

## Comparativa con modelos similares

Nota: los datos de comparacion de otras variantes proceden de documentacion publica de Real-ESRGAN y no de este repositorio; se marcan como aproximados cuando corresponde.

| Modelo | Arquitectura | Factor | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `enhance/` (este repo) | SRVGGNetCompact, 64 features, 32 bloques, mezcla DNI denoise 0,5 | x4 | ~1,21 M | BSD-3-Clause (carpeta) | HuggingFace, fichero float16 |
| `realesr-general-x4v3` | SRVGGNetCompact | x4 | ~1,21 M (aproximado) | BSD-3-Clause | GitHub Real-ESRGAN v0.2.5.0 |
| `realesr-general-wdn-x4v3` | SRVGGNetCompact con denoise | x4 | ~1,21 M (aproximado) | BSD-3-Clause | GitHub Real-ESRGAN v0.2.5.0 |
| Real-ESRGAN x4plus (RRDBNet) | RRDBNet | x4 | mayor que la variante compacta (no disponible cifra exacta en la informacion) | BSD-3-Clause | GitHub Real-ESRGAN |

## Limitaciones y advertencias

- No es un modelo de lenguaje: carece de generacion de texto, razonamiento, codigo, tool calling o capacidades multilingues.
- Alcance funcional limitado a superresolucion x4 con denoise; no realiza otras tareas de vision (deteccion, segmentacion, OCR).
- Riesgo de artefactos o sobre-suavizado segun el nivel de denoise (0,5) y el tipo de imagen de entrada.
- Formato de pesos especifico: binario float16 little-endian en orden del state-dict; requiere conversion o un cargador compatible (el tag `onnx` del repo no se corresponde con el formato descrito del fichero).
- Licencia por carpeta (`per-folder`): cada add-on puede tener condiciones distintas; la carpeta `enhance/` es BSD-3-Clause, lo que exige conservar el aviso de copyright y la clausula de exencion de responsabilidad en redistribuciones.
- Uso comercial: permitido bajo los terminos de BSD-3-Clause para la carpeta `enhance/`; para futuras carpetas debe consultarse su licencia especifica. La licencia del repositorio figura como `other`.
- Contexto de seguridad: el ecosistema de extensiones de Chrome que afirman mejorar funciones de IA ha sido objeto de campañas maliciosas documentadas que roban datos de usuario. Al instalar cualquier add-on que descargue pesos de este tipo, conviene verificar permisos, origen y hashes; la mera presencia de un repositorio de pesos no garantiza la seguridad de la extension que lo consume.
- Sin benchmarks publicados en la informacion disponible; no es posible validar la calidad de la mezcla frente a los checkpoints originales con datos aportados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kyraoki/chrome-extension-addons
- URL de descarga por commit: https://huggingface.co/kyraoki/chrome-extension-addons/resolve/<commit>/<folder>/<file>
- Fuente de los pesos (Real-ESRGAN v0.2.5.0): https://github.com/xinntao/Real-ESRGAN/releases/tag/v0.2.5.0
- Repositorio Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Contexto de seguridad (extensiones de Chrome de IA maliciosas): https://cybersecuritynews.com/chrome-ai-extensions-attacking-users/
- Contexto de seguridad (extensiones que se hacen pasar por mejoras de ChatGPT): https://cyberpress.org/16-malicious-chatgpt-extensions-exposed/
- Contexto de seguridad (extension falsa de Perplexity): https://www.gizmochina.com/2026/07/02/fake-perplexity-ai-chrome-extension-discovered-secretly-monitoring-search-activity/
- Contexto de seguridad (extensiones que roban chats de ChatGPT y DeepSeek): https://thehackernews.com/2026/01/two-chrome-extensions-caught-stealing.html
- Contexto de seguridad (extensiones de IA falsas dirigidas a mas de 300.000 usuarios): https://www.techradar.com/pro/security/fake-chrome-ai-extensions-targeted-over-300-000-users-to-steal-emails-personal-data-and-more
