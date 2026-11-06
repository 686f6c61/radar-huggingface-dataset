# craftrex/client-side-qr-scanner-tools

## Resumen

`craftrex/client-side-qr-scanner-tools` no es un modelo de lenguaje ni una red neuronal entrenada: es un repositorio publicado en Hugging Face que documenta una utilidad de visión por computador implementada en JavaScript y ejecutada íntegramente en el navegador. Su función es decodificar códigos QR a partir de capturas de pantalla, imágenes del portapapeles o fotografías de la galería, sin enviar los bytes de la imagen a ningún servidor externo. El autor del repositorio es el usuario `craftrex` y la aplicación web de referencia es `https://qr-code-scanner.cc/`.

El problema que aborda es concreto: las cámaras de los teléfonos no pueden leer fácilmente un QR que se muestra en la propia pantalla del dispositivo, y muchas herramientas de decodificación dependen de servicios en la nube, lo que introduce latencia y riesgos de privacidad cuando se escanean semillas 2FA, QR de pago o credenciales de Wi-Fi. La propuesta es usar APIs web estándar (Clipboard API, FileReader y Canvas) para procesar la imagen localmente en el sandbox del navegador.

La relevancia es limitada en el contexto de evaluación de modelos de IA: no hay pesos, no hay arquitectura de red, no hay benchmarks ni tarjeta de modelo en el sentido habitual. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia, idiomas ni pipeline. Esta ficha se redacta con la información disponible y marca explícitamente como "no disponible" todo aquello que la model card no cubre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (utilidad de decodificación QR en JavaScript del lado del cliente; no es un modelo de IA) |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no contiene pesos; el artefacto es código de aplicación web) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento que describir. El repositorio documenta una utilidad de cliente que combina tres APIs del navegador: Clipboard API para leer imágenes pegadas con `Ctrl + V`, FileReader para ingerir ficheros PNG, JPEG y WebP, y Canvas para rasterizar y procesar la matriz de píxeles antes de la decodificación. La model card menciona soporte para "inverted matrix QR patterns", es decir, QR con contraste invertido (claro sobre oscuro), un caso que muchos decodificadores básicos no manejan.

La decodificación se ejecuta completamente dentro del sandbox del cliente, sin backend de almacenamiento. No se especifica qué biblioteca de decodificación subyacente se emplea (por ejemplo, jsQR, ZXing-js u otra), ni el número de tokens de entrenamiento, composición del dataset, RLHF o DPO, porque no aplica a este tipo de artefacto. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que son conceptos propios de modelos generativos.

## Capacidades

- Decodificación de códigos QR a partir de imágenes pegadas desde el portapapeles mediante `Ctrl + V`.
- Ingesta de imágenes en formatos raster PNG, JPEG y WebP.
- Procesamiento de patrones QR con matriz invertida (contraste invertido).
- Ejecución local en el navegador sin dependencia de servicios en la nube.
- Protección de datos sensibles al no enviar los bytes de la imagen a servidores externos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, porque no es un modelo generativo.

## Casos de uso

- Escaneo de QR mostrados en la propia pantalla: el usuario pega una captura con `Ctrl + V` y obtiene el contenido sin necesidad de un segundo dispositivo, resolviendo la limitación de la cámara frontal.
- Extracción de semillas 2FA desde capturas: al ejecutarse en el sandbox del cliente, los bytes de la imagen no salen del navegador, lo que reduce la exposición de secretos TOTP.
- Lectura de QR de pago desde la galería: útil cuando el código se recibió por mensajería y no se puede escanear con la cámara del mismo dispositivo.
- Recuperación de credenciales de Wi-Fi compartidas como imagen: el QR se decodifica localmente y se evita publicar la clave en un servicio de terceros.
- Integración en aplicaciones web internas: al ser una utilidad de cliente, puede incorporarse en portales corporativos para validar QR sin añadir infraestructura backend.
- Verificación de QR en documentación o billetes electrónicos: el usuario sube una foto del código y obtiene el payload para comprobar su autenticidad.
- Automatización de pruebas de QA sobre generadores de QR: la utilidad permite comprobar rápidamente que un QR generado se decodifica correctamente, incluidos los de matriz invertida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión de decodificación, tasas de éxito por formato, latencia medida ni comparaciones con otras bibliotecas.

## Requisitos de hardware

- No requiere GPU: la decodificación se ejecuta en el navegador del cliente.
- Requiere un navegador moderno con soporte de Clipboard API, FileReader y Canvas.
- El consumo de memoria depende del tamaño de la imagen de entrada; no se documentan cifras concretas.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, al no existir pesos de modelo.
- La latencia y el throughput no están medidos en la información disponible; la model card afirma "zero-latency" sin aportar cifras.

## Comparativa con modelos similares

| Herramienta | Tipo | Ejecución | Licencia | Contexto |
|---|---|---|---|---|
| craftrex/client-side-qr-scanner-tools | Utilidad QR en navegador | Cliente | no disponible | no aplica |
| jsQR | Biblioteca JS de decodificación QR | Cliente | no disponible en esta ficha | no aplica |
| ZXing-js | Biblioteca JS de decodificación QR | Cliente | no disponible en esta ficha | no aplica |
| APIs de escaneo en la nube | Servicio gestionado | Servidor | no disponible en esta ficha | no aplica |

La comparativa es orientativa: la model card no proporciona datos de rendimiento ni licencia que permitan una comparación cuantitativa con alternativas. No se dispone de información suficiente para establecer diferencias medidas de precisión o latencia frente a jsQR o ZXing-js.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no se puede evaluar con MMLU, HumanEval ni GSM8K, y no debe tratarse como un LLM en pipelines de inferencia.
- La licencia no está declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido.
- No se especifica qué biblioteca de decodificación subyacente se usa ni su versión, lo que dificulta evaluar mantenimiento y vulnerabilidades.
- El repositorio tiene 0 descargas y 0 likes, sin historial de mantenimiento ni issues públicos en la información disponible.
- La afirmación "zero-latency" no está respaldada por mediciones publicadas.
- El soporte de idiomas no está declarado; la interfaz documentada está en inglés.
- No se documentan sesgos, riesgo de alucinación ni límites de contexto porque no aplican a una utilidad determinista de decodificación.
- Para producción, conviene auditar el código real de la aplicación web de referencia antes de confiar en las garantías de privacidad declaradas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/craftrex/client-side-qr-scanner-tools
- Aplicación web oficial: https://qr-code-scanner.cc/
- Escaneo de QR desde captura de pantalla: https://qr-code-scanner.cc/scan-qr-code-from-screenshot
- Escaneo de QR desde imagen: https://qr-code-scanner.cc/scan-qr-code-from-image
