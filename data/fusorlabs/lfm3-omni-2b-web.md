# fusorlabs/lfm3-omni-2b-web

## Resumen

`fusorlabs/lfm3-omni-2b-web` es una compilación del modelo multimodal `LiquidAI/LFM3-Omni-2B` de Liquid AI, empaquetada por fusorlabs en un bundle binario para el runtime WebAssembly `liquidai-lmf3-wasm`. No es un checkpoint de PyTorch ni un conjunto de safetensors: los pesos se distribuyen en el formato propietario de fusor-ai, con un `manifest.json` que indexa cada tensor y cada parte nombrada por su hash BLAKE3, verificado en tiempo de carga por el runtime. El objetivo declarado es ejecutar el modelo completo (visión, audio y texto) en la CPU del dispositivo desde el navegador, sin backend GPU ni conexión a servidores.

El modelo resuelve el caso de uso de inferencia any-to-any totalmente local en el cliente: leer imágenes, escuchar y transcribir voz, sintetizar habla y mantener conversaciones en texto y voz. Esto es relevante para aplicaciones web con requisitos estrictos de privacidad (datos que no pueden salir del dispositivo) o para entornos sin infraestructura de GPU.

La información disponible no detalla arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni idiomas soportados más allá de lo indicado por el modelo base. El bundle ocupa 2,5 GB en el repositorio y se compiló con el perfil `q7`. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base any-to-any de Liquid AI; la informacion proporcionada no detalla la arquitectura interna) |
| Parametros totales | 2B (segun el nombre del modelo y el modelo base; no se detalla en la model card) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | perfil `q7`: matrices grandes a 7 bits; patch embedding y subsampler de audio en f32; incluye el decoder del codec de voz |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | bundle fusor-ai: `manifest.json` + partes nombradas por hash BLAKE3; no es safetensors ni GGUF |
| Tamano del repositorio | 2,5 GB |
| Pipeline | any-to-any (texto, imagen, audio) |
| Libreria / runtime | `fusor-ai` (runtime WebAssembly `liquidai-lmf3-wasm`) |
| Revision del modelo base | `LiquidAI/LFM3-Omni-2B` @ `ce2458cbce4ad970f92032ed94e3d18d30b04f9c` |
| Fecha de creacion | 2026-10-28 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni el proceso de entrenamiento: no se indican número de tokens, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo que sí se especifica es el proceso de compilación: los pesos de `LiquidAI/LFM3-Omni-2B`, en la revisión `ce2458cbce4ad970f92032ed94e3d18d30b04f9c`, se compilaron con el perfil `q7`, que cuantiza a 7 bits todas las matrices grandes y mantiene en f32 el patch embedding y el subsampler de audio. El bundle incluye además el decoder del codec de voz, lo que permite la salida hablada dentro del mismo paquete.

La innovación técnica destacable no está en el entrenamiento sino en el empaquetado y la verificación de integridad: cada parte del bundle se nombra con su hash BLAKE3 y el runtime comprueba ese hash durante la carga, lo que proporciona una garantía de integridad verificable de los pesos descargados. El procedimiento es reproducible mediante la tarea `just model` del repositorio `liquidai-lmf3-wasm`, que descarga el checkpoint original y genera el mismo bundle. Cualquier detalle adicional sobre atención, capas o estrategia multimodal del modelo base queda fuera de la información disponible.

## Capacidades

- Comprensión de imágenes dentro del navegador, ejecutada en la CPU del dispositivo.
- Entrada de audio: escucha y transcripción de voz.
- Salida de audio: síntesis de habla mediante el decoder del codec incluido en el bundle.
- Conversación multimodal en texto y en voz.
- Pipeline any-to-any: combinación de imagen, audio y texto en una misma sesión.
- Ejecución totalmente local en WebAssembly, sin llamadas a servidores ni GPU.
- Verificación de integridad de los pesos en carga mediante hashes BLAKE3.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Transcripción de audio con privacidad estricta: una aplicación web de notas de voz o reuniones puede transcribir en la CPU del cliente sin que el audio abandone el dispositivo, lo que encaja en sectores con requisitos de confidencialidad (sanidad, legal, recursos humanos).
- Asistencia por voz en el navegador: el modelo puede mantener una conversación hablada y responder con voz sintetizada, adecuado para demos de asistentes, kioscos web o interfaces de accesibilidad sin infraestructura de GPU.
- Descripción de imágenes para accesibilidad: integrado en un lector de pantalla basado en web, el modelo puede generar descripciones de imágenes subidas por el usuario sin enviar el contenido a un servicio externo.
- Dictado y resumen en herramientas de documentación: aplicaciones de edición de textos que capturan voz, la transcriben y la resumen en la misma sesión del navegador, con latencia dependiente del hardware del cliente.
- Prototipado multimodal sin backend: equipos que necesitan validar una experiencia any-to-any (imagen + voz + texto) antes de invertir en infraestructura pueden desplegar el bundle y el runtime WASM como prueba de concepto funcional.
- Subtitulado y anotación ligera de contenido audiovisual: un editor web puede transcribir pistas de audio y asociarlas a marcas de tiempo sin coste de servidor, útil para vídeos cortos o material interno.
- Despliegue en entornos restringidos: al ser un bundle autocontenido con hashes verificables, encaja en escenarios con redes air-gapped o con políticas de cadena de suministro que exigen verificar artefactos antes de ejecutarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, WER de transcripción ni evaluaciones de calidad multimodal, y tampoco se han encontrado datos verificables en la búsqueda web realizada (los resultados obtenidos no guardaban relación con el modelo y se han descartado). Tampoco se documentan latencia, throughput ni consumo de memoria medidos en ningún dispositivo de referencia.

## Requisitos de hardware

- VRAM: no aplica en el escenario objetivo; el runtime está diseñado para ejecutarse en la CPU del dispositivo vía WebAssembly.
- Memoria estimada: el bundle ocupa 2,5 GB, por lo que se puede esperar un consumo de memoria del orden de 3-4 GB al cargar pesos y estado de ejecución (estimación a partir del tamaño del repositorio, no confirmada por el autor).
- GPU recomendadas: no disponible; no se documenta ninguna ruta de aceleración por GPU.
- GPU de consumo: el modelo no requiere GPU. El requisito práctico es un navegador con soporte de WebAssembly y memoria suficiente.
- Opciones de despliegue: exclusivamente el runtime `liquidai-lmf3-wasm` con el bundle fusor-ai. No hay soporte indicado para vLLM, llama.cpp, Ollama, TGI ni transformers, ya que el formato no es safetensors ni GGUF.
- Latencia y throughput: no disponibles. Al ejecutarse en CPU y en WebAssembly, el rendimiento dependerá del dispositivo cliente y no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|
| fusorlabs/lfm3-omni-2b-web | 2B | no disponible | bundle fusor-ai (7 bits) | LFM Open License v1.0 | WebAssembly en CPU del cliente |
| LiquidAI/LFM3-Omni-2B (base) | 2B | no disponible | safetensors / PyTorch | LFM Open License v1.0 | GPU o CPU con frameworks estandar |
| Otros modelos any-to-any de ~2-4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el checkpoint original: este repositorio ofrece los mismos pesos en un formato cuantizado y verificado, pero pierde portabilidad, ya que solo carga en el runtime de fusor-ai. Para el resto de alternativas de la categoría any-to-any en el rango de 2-4B no se dispone de datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Formato bloqueado: el bundle no se puede cargar con PyTorch, transformers, llama.cpp ni ninguna herramienta estándar; la dependencia del runtime `liquidai-lmf3-wasm` es total.
- Ausencia de evaluación: sin benchmarks publicados ni métricas de calidad de transcripción, descripción de imágenes o síntesis de voz, no es posible estimar la calidad frente al modelo base ni frente a alternativas.
- Idiomas no documentados: se desconoce qué lenguas cubre la transcripción y la síntesis, lo que impide asumir un comportamiento correcto en castellano sin pruebas propias.
- Contexto desconocido: no se indica la longitud de contexto, un dato crítico para conversaciones multi-turno o audio largo.
- Licencia: LFM Open License v1.0, marcada como `other` en HuggingFace. Es imprescindible revisar el fichero `LICENSE` antes de cualquier uso comercial, ya que este tipo de licencias de modelos abiertos suele incluir condiciones y umbrales específicos.
- Riesgo de alucinación: inherente a los modelos generativos; en transcripción puede producir texto plausible donde el audio es ambiguo, y en descripción de imágenes puede inventar detalles. No hay documentación de mitigaciones.
- Sesgos: no documentados por el autor; se heredan los del modelo base, sobre el que tampoco se aporta información demográfica o de dominio.
- Cuantización a 7 bits: no se publica la degradación respecto al checkpoint original en ninguna tarea.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado con un minuto de diferencia; no hay evidencia de uso en producción ni validación por terceros.
- Coste en el cliente: 2,5 GB de descarga y ejecución en CPU pueden suponer una experiencia lenta o inviable en dispositivos móviles de gama baja y en conexiones limitadas.
- Fecha de creación anómala: los metadatos indican 2026-10-28, lo que conviene verificar antes de citar el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fusorlabs/lfm3-omni-2b-web
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Demo (Space): https://huggingface.co/spaces/fusorlabs/liquidai-lmf3-wasm
- Runtime WebAssembly: https://github.com/fusor-rs/liquidai-lmf3-wasm
- Libreria fusor-ai: https://github.com/fusor-rs/fusor-ai
- Licencia (fichero en el repositorio): https://huggingface.co/fusorlabs/lfm3-omni-2b-web/blob/main/LICENSE
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardaban relacion con la consulta y se han descartado.
