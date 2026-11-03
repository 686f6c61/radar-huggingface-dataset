# KeelCore/KeelCore-750M-Professional

## Resumen

KeelCore-750M-Professional es un adaptador LoRA de rango 16 entrenado sobre el modelo base KeelCore-750M, un encoder-decoder de 750 millones de parámetros desarrollado por Saravanan A R bajo el sello KeelCore. Su única tarea es la reescritura de texto en inglés hacia un registro profesional: corrige ortografía y gramática, ajusta el tono y la formulación, y preserva el significado original. No es un modelo conversacional ni responde preguntas: reescribe el texto que recibe.

El adaptador añade 18,29 millones de parámetros entrenables (un 2,43 % del modelo base) y se distribuye como un archivo de 73 MB, no como un modelo completo. Requiere el modelo base congelado para funcionar. Está pensado para ejecutarse en CPU o GPU con PyTorch, o directamente en el navegador mediante ONNX Runtime Web, lo que permite integrarlo en aplicaciones donde el texto no debe salir del dispositivo del usuario.

La relevancia de esta ficha es acotada: se trata de un adaptador especializado, con cero descargas y cero likes en el momento de la consulta, publicado bajo una licencia propia (KeelCore License 1.0) y con soporte exclusivo para inglés. Su interés técnico reside en el enfoque de adaptador pequeño sobre base compartida y en el despliegue en el navegador, más que en capacidades generales de razonamiento o generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre modelo base encoder-decoder KeelCore-750M |
| Parametros totales | 18,29 M entrenables en el adaptador (2,43 % del base); base de 750 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | keelcore-license-1.0 (KeelCore License, Version 1.0) |
| Formato de pesos | adapter.safetensors + adapter_config.json (formato propio KeelCore, no PEFT); carpeta ONNX para Runtime Web |

## Arquitectura y entrenamiento

El adaptador se aplica sobre KeelCore-750M, un transformer encoder-decoder. La elección de encoder-decoder es funcional: el modelo lee la entrada completa antes de generar, lo que le permite copiar literalmente nombres, URLs y cadenas exactas al texto de salida. El adaptador es un LoRA de rango 16 con 18,29 millones de parámetros entrenables, lo que representa el 2,43 % del modelo base. El base permanece congelado durante la inferencia.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. El adaptador se carga mediante el código del repositorio GitHub de KeelCore, que verifica una huella (fingerprint) de los pesos del base y rechaza cargarse sobre cualquier modelo distinto de KeelCore-750M. El formato del adaptador es propio (`adapter.safetensors` con `adapter_config.json`), no compatible con PEFT. La entrada se enmarca automáticamente con la plantilla ` <text_to_rewrite> … </text_to_rewrite> </s>` y la salida se limita a 384 tokens nuevos con la configuración por defecto.

## Capacidades

- Reescritura de texto en inglés hacia registro profesional: corrige ortografía y gramática, ajusta tono y formulación, y conserva el significado.
- Preservación de cadenas exactas: nombres propios, URLs, rutas de fichero y fragmentos literales se copian al output gracias a la arquitectura encoder-decoder.
- Procesamiento por lotes: la función `rephrase()` acepta una lista de textos y devuelve una lista de reescrituras.
- Ejecución en CPU o GPU con PyTorch, y en navegador mediante ONNX Runtime Web.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo conversacional: no responde preguntas ni sigue instrucciones contenidas en el texto.
- No genera texto desde cero; solo transforma el texto de entrada.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Limpieza de borradores en mensajería interna: el adaptador convierte mensajes de chat informales ("hey team, the client call is moved to 3pm tmrw") en comunicaciones claras y profesionales, adecuado por su baja latencia al ejecutarse en CPU.
- Redacción de correos de atención al cliente: reescribe respuestas rápidas en un tono profesional y gramaticalmente correcto, preservando enlaces y referencias exactas gracias a la copia literal del encoder-decoder.
- Normalización de tickets y notas de soporte: convierte descripciones breves e informales en texto legible para sistemas de ticketing, sin alterar rutas ni identificadores técnicos.
- Reescritura en el navegador con privacidad: al ejecutarse mediante ONNX Runtime Web, el texto no abandona la máquina del usuario, lo que encaja en herramientas internas con requisitos de confidencialidad.
- Corrección de actualizaciones de estado y notas de proyecto: transforma notas rápidas en texto publicable, manteniendo cifras y fechas literales.
- Punto de partida para investigación sobre adaptadores pequeños: sirve como referencia para estudiar LoRA de bajo rango sobre un base compartido y su despliegue en entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 73 MB; el modelo base de 750 M de parámetros debe estar disponible para la inferencia.
- VRAM estimada para el base en precisión completa: no disponible en la información proporcionada; en fp16 un modelo de 750 M requiere aproximadamente 1,5 GB de pesos, cifra estimada a partir del tamaño de parámetros, no publicada por el autor.
- GPU recomendadas: no especificadas por el autor; el adaptador está diseñado para ejecutarse en CPU o GPU con PyTorch.
- Cabe en GPU de consumo: el adaptador por sí solo sí; el base de 750 M es viable en GPUs de consumo con memoria suficiente, aunque el autor no publica requisitos concretos.
- Opciones de despliegue: PyTorch (CPU o CUDA) mediante el repositorio GitHub de KeelCore; ONNX Runtime Web en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores de reescritura profesional sobre bases pequeñas) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Fuera de alcance el texto donde cada carácter debe conservarse intacto (cláusulas legales, código, configuración, cifras financieras) salvo revisión humana posterior.
- Solo admite inglés; no procesa otros idiomas.
- No es un modelo conversacional ni responde preguntas; no debe usarse para generación desde cero.
- Los documentos largos deben dividirse previamente; no se documenta la longitud de contexto.
- Riesgo de alucinación o de alteración de significado en textos ambiguos, aunque el diseño encoder-decoder mitiga la pérdida de cadenas literales.
- No se documentan sesgos conocidos en la información disponible.
- Licencia KeelCore License 1.0: es una licencia propia, no estándar; deben revisarse sus términos antes de cualquier uso comercial, ya que no se detallan en la información proporcionada.
- El adaptador usa un formato propio no compatible con PEFT y verifica la huella del base, por lo que no puede cargarse sobre otros modelos.
- En el momento de la consulta, el repositorio presenta cero descargas y cero likes, y el código de carga requiere autenticación mientras los repositorios sean privados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/KeelCore/KeelCore-750M-Professional)
- [Modelo base KeelCore-750M](https://huggingface.co/KeelCore/KeelCore-750M)
- [Informe técnico](https://saravanan-a-r.github.io/KeelCore/)
- [Repositorio GitHub](https://github.com/saravanan-a-r/KeelCore)
- [Licencia](https://huggingface.co/KeelCore/KeelCore-750M-Professional/blob/main/LICENSE)
- [Perfil del autor en LinkedIn](https://www.linkedin.com/in/saravanan-a-r/)
