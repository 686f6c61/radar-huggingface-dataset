# software-mansion/LFM3-ExecuTorch

## Resumen

LFM3-ExecuTorch es un repositorio de distribucion que empaqueta cuatro modelos de la familia LFM3 de Liquid AI como programas `.pte` de ExecuTorch, listos para inferencia en dispositivo (on-device) mediante la libreria React Native ExecuTorch de Software Mansion. No se trata de un modelo entrenado por el autor del repositorio, sino de una exportacion optimizada de los pesos originales de Liquid AI: LFM3-1.7B (texto), LFM3-VL-2B (texto e imagen), LFM3-Audio-2B (texto y audio) y LFM3-Omni-2B (texto, imagen, audio y salida de voz).

El interes practico esta en que ofrece variantes cuantizadas (int4 e int8 sobre backend MLX; 8da4w sobre XNNPACK) con ventanas de contexto de 8192 tokens en los modelos de texto, vision y audio, y de 4096 tokens en el modelo Omni. Esto permite ejecutar modelos multimodales de 1.7B y 2B de parametros en hardware de consumo y en dispositivos moviles Apple, sin depender de servidores.

El repositorio esta pensado para desarrolladores de aplicaciones React Native que necesitan capacidades de generacion de texto, comprension de imagen, transcripcion de audio o interaccion omnicanal integradas en la propia aplicacion. La licencia es la LFM Open License v1.0, que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos base LFM3 de Liquid AI, exportados a ExecuTorch) |
| Parametros totales | 1.7B (1_7b), 2B (vl_2b, audio_2b, omni_2b) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (1_7b, vl_2b, audio_2b); 4096 tokens (omni_2b) |
| Tipos de cuantizacion | int4 e int8 (MLX); 8da4w (XNNPACK) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | `.pte` (ExecuTorch); tokenizer en `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni el proceso de entrenamiento de los modelos base LFM3 en la informacion proporcionada. El repositorio documenta unicamente el proceso de exportacion: cada modelo base se ha convertido a programas ExecuTorch `.pte` con dos backends disponibles. MLX se emplea para hardware Apple compatible con el delegado MLX, mientras que XNNPACK esta orientado a ejecucion en CPU.

La variante Omni se estructura en varios componentes encadenados: codificador de vision, codificador de audio, embedding de tokens, decodificador de texto, decodificador de profundidad, embedding de audio y decodificador de audio. El codificador de imagen acepta entradas RGB de 512 x 512; el audio de entrada se muestrea a 16 kHz y la voz generada a 24 kHz. Cada directorio incluye su propio tokenizer y una copia de la licencia LFM Open License v1.0.

## Capacidades

- Generacion de texto con el modelo LFM3-1.7B (entrada y salida de texto).
- Comprension de imagenes con LFM3-VL-2B (entrada de texto e imagen, salida de texto).
- Procesamiento de audio con LFM3-Audio-2B (entrada de texto y audio, salida de texto), util para transcripcion o comprension de habla.
- Capacidad omnicanal con LFM3-Omni-2B: acepta texto, imagenes y audio, y puede generar texto y voz sintetizada a 24 kHz.
- Inferencia on-device mediante ExecuTorch, sin conexion a servidores.
- Integracion con React Native a traves de las entradas `models.llm.LFM3_1_7B`, `models.llm.LFM3_VL_2B` y `models.llm.LFM3_AUDIO_2B` de React Native ExecuTorch.
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de texto embebido en aplicaciones moviles: el modelo LFM3-1.7B cuantizado a int4 o int8 permite generar respuestas dentro de una app React Native sin enviar datos a la nube, con una ventana de 8192 tokens para conversaciones de varios turnos.
- Descripcion y analisis de imagenes en el dispositivo: LFM3-VL-2B acepta imagenes RGB de 512 x 512 y texto, adecuado para etiquetado de fotos, accesibilidad (descripcion de imagenes para lectores de pantalla) o extraccion de informacion de documentos escaneados.
- Transcripcion y comprension de audio local: LFM3-Audio-2B procesa audio a 16 kHz y devuelve texto, util para notas de voz, subtitulado o asistentes por voz que requieren privacidad.
- Interaccion por voz completa: LFM3-Omni-2B combina entrada de audio e imagen con salida de voz a 24 kHz, lo que permite construir interfaces conversacionales habladas en el propio dispositivo.
- Aplicaciones con requisitos de privacidad o sin conectividad: al ejecutarse con ExecuTorch en el dispositivo, los datos del usuario no salen del terminal, lo que encaja en entornos sanitarios, financieros o de campo sin cobertura.
- Prototipado rapido en React Native: la integracion directa con React Native ExecuTorch y la disponibilidad de variantes MLX (Apple) y XNNPACK (CPU) simplifican la prueba de conceptos multiplataforma sin infraestructura de servidores.
- Procesamiento por lotes en CPU: las variantes XNNPACK 8da4w permiten ejecutar los modelos en CPU, util para tareas de inferencia en equipos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia orientativa, un modelo de 1.7B en int4 ocupa del orden de 1 GB de pesos y en int8 del orden de 1.7 GB; los modelos de 2B son ligeramente mayores. El repositorio completo ocupa 32.4 GB por incluir todas las variantes y backends.
- GPU recomendadas: no disponible. MLX requiere hardware Apple compatible con el delegado MLX; XNNPACK se ejecuta en CPU.
- Compatibilidad con GPU de consumo: no se documenta. El diseno esta orientado a dispositivos moviles y hardware Apple, no a GPUs de escritorio convencionales.
- Opciones de despliegue: React Native ExecuTorch (libreria `react-native-executorch`); runtime ExecuTorch con delegado MLX o XNNPACK. Para un runtime independiente, consultar la nota de compatibilidad de ExecuTorch.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Formato | Licencia |
|---|---|---|---|---|---|
| LFM3-ExecuTorch (este repo) | 1.7B / 2B | 8192 (Omni: 4096) | Texto, imagen, audio, voz (Omni) | `.pte` | LFM Open License v1.0 |
| LFM3-1.7B (LiquidAI) | 1.7B | no disponible | Texto | safetensors (original) | LFM Open License v1.0 |
| LFM3-VL-2B / Audio-2B / Omni-2B (LiquidAI) | 2B | no disponible | Imagen, audio, voz | safetensors (original) | LFM Open License v1.0 |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con modelos de otros fabricantes no esta disponible en la informacion proporcionada. La diferencia principal de este repositorio frente a los originales de Liquid AI es el formato: `.pte` optimizado para ExecuTorch y cuantizacion para dispositivo, frente a los pesos sin cuantizar de Hugging Face.

## Limitaciones y advertencias

- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; es necesario revisar el texto completo en el enlace de licencia del modelo base antes de desplegar en produccion.
- El contexto esta limitado a 8192 tokens en los modelos de texto, vision y audio, y a 4096 en el modelo Omni, lo que restringe conversaciones o documentos largos.
- No se dispone de informacion sobre idiomas soportados; el rendimiento en castellano no esta verificado.
- Al ser modelos de 1.7B y 2B de parametros, su capacidad de razonamiento y conocimiento factual es limitada en comparacion con modelos de mayor tamano; el riesgo de alucinacion es relevante en tareas de alta precision.
- Las variantes MLX requieren hardware Apple compatible con el delegado MLX; las variantes XNNPACK se ejecutan en CPU, con throughput potencialmente menor.
- El modelo Omni usa la API de bajo nivel y requiere gestionar manualmente los distintos codificadores y decodificadores (vision, audio, texto, profundidad), lo que aumenta la complejidad de integracion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- El repositorio incluye cuatro modelos y multiples variantes, lo que eleva el tamano de descarga a 32.4 GB; conviene descargar solo el directorio necesario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/software-mansion/LFM3-ExecuTorch
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base LFM3-VL-2B: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo base LFM3-Audio-2B: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Modelo base LFM3-Omni-2B: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentacion de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
