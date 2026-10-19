# camwooloo/kawma-coach-voice

## Resumen

Kawma Studio coach voices es un paquete de pesos convertidos del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base de Qwen (Alibaba), publicado por el usuario camwooloo para su uso dentro de la aplicación Kawma Studio. No se trata de un modelo entrenado desde cero: el autor redistribuye los dos modelos de lenguaje del sistema TTS original (talker y predictor) en formato GGUF con cuantizaciones q5_k y q8_0, el decodificador de audio en ONNX fp16 y las tablas de embeddings y el tokenizador en f16/f32, todo ello acompañado de doce perfiles de voz en JSON. La licencia Apache 2.0 del modelo base se mantiene en la redistribución.

La relevancia práctica del repositorio es que empaqueta un sistema TTS basado en LLM en artefactos ligeros y ejecutables en local sobre la GPU de un PC de escritorio, sin depender de un servidor. El repositorio ocupa 2,2 GB e incluye tanto las variantes cuantizadas como los ficheros auxiliares, y va acompañado de un `manifest.json` con tamaños y SHA-256 de cada fichero, lo que facilita la verificación de integridad en una pipeline de distribución de software.

Las doce voces incluidas se generaron con las variantes VoiceDesign (siete, a partir de descripciones textuales) y CustomVoice (cinco, grabaciones de los hablantes integrados) del mismo modelo base, según indica el autor, sin clonación de personas reales. El único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en LLM: dos modelos de lenguaje (talker y predictor) sobre Qwen3-TTS-12Hz-1.7B-Base, mas un decodificador de voz separado (ONNX) |
| Parametros totales | 141.570.304 según los safetensors del repo; el modelo base se denomina 1.7B (ver advertencias sobre la discrepancia) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q5_k y q8_0 (talker y predictor); ONNX fp16 (decoder); f16 y f32 (embeddings y proyeccion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (heredada del modelo base Qwen3-TTS) |
| Formato de pesos | GGUF, ONNX, f16, f32, JSON (tokenizer y voces) |

## Arquitectura y entrenamiento

El sistema sigue el diseño de Qwen3-TTS: un modelo "talker" que genera tokens de habla a partir del texto, un modelo "predictor" asociado y un decodificador neuronal que convierte esos tokens acústicos en forma de onda. Este repositorio no incluye entrenamiento propio; los pesos proceden íntegramente de Qwen3-TTS-12Hz-1.7B-Base y se han convertido con las herramientas de HaujetZhao/Qwen3-TTS-GGUF (MIT), que también se usaron para exportar el decodificador a ONNX en fp16. Las tablas de embeddings (`text.f16`, `codec.f16`), la proyección (`proj.f32`) y el `tokenizer.json` se mantienen sin cambios salvo el formato de fichero.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card del repositorio solo documenta el proceso de conversión. La innovación destacable es de empaquetado más que de modelado: separar los dos LMs en GGUF cuantizado, el decodificador en ONNX y los embeddings en f16 permite ejecutar el conjunto en una GPU de consumo con un footprint reducido, y el `manifest.json` con SHA-256 aporta trazabilidad de los artefactos distribuidos.

## Capacidades

- Síntesis de voz texto-a-habla en inglés a partir de los pesos de Qwen3-TTS-12Hz-1.7B-Base.
- Doce perfiles de voz predefinidos en `voices/*.json`: siete diseñados por descripción textual con Qwen3-TTS-12Hz-1.7B-VoiceDesign y cinco derivados de los hablantes integrados de Qwen3-TTS-12Hz-1.7B-CustomVoice.
- Ejecución totalmente local en la GPU del PC del usuario, sin llamadas a servidor.
- Verificación de integridad de los ficheros mediante `manifest.json` (tamaño y SHA-256).
- Uso offline: los artefactos se descargan una vez y se cargan desde disco.
- Integración con la aplicación Kawma Studio mediante los formatos GGUF (LMs) y ONNX Runtime (decodificador).
- No se declaran capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada; el pipeline es exclusivamente text-to-speech.

## Casos de uso

- **Voces de entrenador en Kawma Studio**: la aplicación descarga estos ficheros y los ejecuta en la GPU local para narrar las indicaciones del entrenador de IA. Es el caso de uso para el que se publicó el repositorio y el único documentado por el autor.
- **Síntesis de voz offline en escritorio**: cualquier aplicación de escritorio que necesite TTS sin conectividad puede cargar `talker.gguf`, `predictor.gguf` y `decoder.onnx` con un runtime GGUF y ONNX Runtime, manteniendo todo el audio en la máquina del usuario.
- **Prototipado de interfaces de voz en inglés**: los doce perfiles JSON permiten cambiar de voz sin reentrenar, lo que sirve para comparar estilos de narración en pruebas de usabilidad o demos de producto.
- **Lectura de contenido en aplicaciones de accesibilidad**: el tamaño reducido del paquete (2,2 GB, con variantes q5_k más ligeras) hace viable su inclusión en instaladores de lectores de pantalla o asistentes personales que funcionan en local.
- **Generación de audio para contenido formativo o de entrenamiento**: narración de rutinas, instrucciones o material e-learning en inglés, con la ventaja de que no se envía texto a servicios de terceros.
- **Sustitución de APIs TTS en entornos con restricciones de privacidad**: organizaciones que no pueden enviar texto a la nube pueden desplegar el paquete en un PC con GPU y obtener voz sintética sin salida de datos.
- **Base para ajuste o experimentación con voces**: los embeddings y el tokenizador en formato abierto permiten experimentar con nuevos perfiles de voz a partir de la estructura existente, respetando la licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de síntesis (MOS, WER, similitud de hablante), latencia ni throughput, y las búsquedas web realizadas no han devuelto documentación técnica relevante sobre este repositorio.

## Requisitos de hardware

- **VRAM estimada (orientativa, no publicada por el autor)**: con `talker` y `predictor` en q5_k, el peso de los dos LMs ronda 1,2-1,5 GB; añadiendo el decodificador ONNX fp16 y la caché KV, un despliegue completo debería moverse en el entorno de 2,5-4 GB de VRAM. Con q8_0 el requisito sube aproximadamente a 4-6 GB. Son estimaciones a partir del tamaño del repo (2,2 GB), no cifras oficiales.
- **GPU recomendadas**: cualquier GPU de escritorio con 6-8 GB de VRAM es suficiente en la estimación anterior; una RTX 3060/4060 o superior ofrece margen. Para lotes grandes o baja latencia, una RTX 4090 o una A100/H100 quedan muy por encima de lo necesario para un modelo de este tamaño.
- **¿Cabe en GPU de consumo?**: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más, dado que el diseño del repo está pensado para ejecutarse en la tarjeta gráfica del PC del usuario.
- **Opciones de despliegue**: el paquete está orientado a un cargador GGUF más ONNX Runtime dentro de Kawma Studio. No se documenta soporte para vLLM, TGI, llama.cpp estándar ni Ollama, y al ser un pipeline de varios componentes (dos LMs más decodificador) no es directamente enchufable a servidores de inferencia de texto.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| camwooloo/kawma-coach-voice | 141,6 M según safetensors (base 1.7B) | no disponible | en | Apache 2.0 | GGUF, ONNX, f16/f32 | Paquete convertido con 12 voces para Kawma Studio |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1.7B (nominal) | no disponible | no disponible en la informacion | Apache 2.0 | safetensors (formato original) | Modelo original de Qwen del que se derivan los pesos |
| Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign | 1.7B (nominal) | no disponible | no disponible en la informacion | Apache 2.0 | safetensors | Variante para diseñar voces desde descripción textual; origen de 7 de las voces |
| Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice | 1.7B (nominal) | no disponible | no disponible en la informacion | Apache 2.0 | safetensors | Variante con hablantes integrados; origen de 5 de las voces |

No se dispone de información sobre otros sistemas TTS comparables (tamaño, contexto, rendimiento o licencia) en el material proporcionado, por lo que la comparación se limita a la familia Qwen3-TTS.

## Limitaciones y advertencias

- **Discrepancia en el recuento de parámetros**: los safetensors del repo declaran 141.570.304 parámetros, mientras que el modelo base se denomina 1.7B. La cifra puede corresponder a un subconjunto de los pesos o a un artefacto del proceso de conversión; conviene verificar qué componentes cubre antes de dimensionar hardware a partir de ella.
- **Idioma único**: solo inglés declarado. No hay soporte multilingüe documentado, y usarlo con texto en castellano queda fuera de las capacidades declaradas.
- **Alcance funcional estrecho**: es exclusivamente text-to-speech; no hay generación de texto, razonamiento, código ni tool calling.
- **Sin métricas de calidad**: no se publican MOS, WER ni evaluaciones de similitud de voz, de modo que la calidad de síntesis debe evaluarse empíricamente.
- **Riesgo de alucinación acústica**: como todo TTS neuronal, puede producir artefactos, prosodia incorrecta o pronunciaciones erráticas en nombres propios, siglas y texto no visto durante el entrenamiento.
- **Dependencia del ecosistema del autor**: el paquete está pensado para Kawma Studio y las herramientas de conversión de HaujetZhao; no se documenta compatibilidad con runtimes TTS estándar, lo que puede complicar su integración en otras aplicaciones.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero exige conservar los avisos de licencia y atribución a Qwen; el autor indica que los pesos son obra de Qwen redistribuidos en forma convertida.
- **Procedencia de las voces**: las doce voces derivan de VoiceDesign y CustomVoice según el autor, sin clonación de personas reales; conviene conservar esa trazabilidad si se redistribuyen.
- **Madurez del repositorio**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-10-18). No hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/camwooloo/kawma-coach-voice
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Variante VoiceDesign: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
- Variante CustomVoice: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Herramientas de conversión a GGUF y ONNX: https://github.com/HaujetZhao/Qwen3-TTS-GGUF

Las búsquedas web realizadas no han devuelto enlaces técnicos relevantes sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado.
