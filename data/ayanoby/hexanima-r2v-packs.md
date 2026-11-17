# ayanoby/hexanima-r2v-packs

## Resumen

HexAnima R2V Packs es un paquete de pesos derivado de MiniMaxAI/MiniMax-H3 (variante Ref2VA, reference-to-video) reconvertido por el desarrollador independiente ayanoby para su ejecucion en la NPU Hexagon V69 de los SoC Qualcomm Snapdragon 8 Gen 1 y 8+ Gen 1, dentro de la aplicacion Android HexAnima. No es un modelo nuevo: es un derivado cuantizado y reempaquetado del transformer de difusion, el VAE de video y el LoRA turbo de 4 pasos de MiniMax-H3, convertidos a tiles INT8 para el acelerador HMX de la NPU y a un contexto binario QNN HTP en fp16 para el codificador de imagen.

El interes practico es acotado pero muy especifico: permite ejecutar generacion de video por referencia (image-to-video y reference-to-video) en un telefono Android de gama alta de 2021-2022, algo que hasta ahora requeria GPU de escritorio. El repositorio ocupa unos 37,3 GB y necesita un dispositivo con 12 GB de RAM y unos 60 GB de almacenamiento libre, contando el codificador de texto compartido con HexAnima H3-Image.

La relevancia es doble. Por un lado, demuestra que los modelos de difusion de video pueden trocearse y mapearse a la NPU Hexagon con cuantizacion INT8 por bloques. Por otro, arrastra la licencia MiniMax-H3 Community License Agreement, que excluye explicitamente su uso en Estados Unidos, Union Europea, Reino Unido y Corea del Sur, lo que limita seriamente su adopcion comercial en esos territorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (MiniMax-H3 Ref2VA) con proyecciones adaLN, reempaquetado en tiles HMX V69 INT8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (transformer, VAE y LoRA en tiles); fp16 para el contexto QNN HTP del codificador de imagen; capas de entrada/salida en float32 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement (license: other) |
| Formato de pesos | `.bin` propietario (tiles HMX), `.f32` crudos, contexto binario QNN HTP; no compatible con safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete no entrena nada: es una conversion de artefactos existentes. El transformer de difusion `minimax_h3_ref2va_int8_convrot.safetensors` (procedente de Comfy-Org/MiniMax-H3) se trocea en un fichero `.bin` por bloque (`blkNN.bin`) mas las proyecciones adaLN en ficheros separados (`adalnNN.bin`), y las capas pequenas de entrada y salida se guardan como floats crudos (`r0.bin`, `r1.bin`, `*.f32`, `hn.bin`, `H64.f32`, `H256.f32`). El VAE de video se repaqueta igual en tiles INT8 (`vbNN.bin` y el directorio `glue/`), y el codificador de imagen del VAE se convierte a un contexto binario QNN HTP en fp16 (`enc/henc.bin`).

Se incluye ademas el LoRA turbo de 4 pasos (`minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16.safetensors`) reempaquetado en tiles, que se aplica sobre el transformer para reducir el numero de pasos de muestreo a cuatro. El codificador de texto no va en este repositorio: se comparte con MiniMax-H3-Image y hay que instalar aparte `ayanoby/hexanima-h3` (ruta `files/h3/te`). El autor no documenta datos de entrenamiento, tokens, composicion del dataset ni etapas de RLHF/DPO; toda esa informacion corresponde al modelo base MiniMax-H3 y no se detalla aqui.

## Capacidades

- Generacion de video a partir de una imagen o referencia (reference-to-video), con el transformer Ref2VA de MiniMax-H3.
- Muestreo acelerado a 4 pasos gracias al LoRA turbo incluido, pensado para la latencia de una NPU movil.
- Decodificacion de video mediante el VAE de video convertido a INT8.
- Codificacion de imagen de referencia mediante el contexto QNN HTP fp16.
- Ejecucion en NPU Hexagon V69 (HMX) de Snapdragon 8 Gen 1 y 8+ Gen 1 a traves de la app HexAnima.
- Soporte de tool calling, agentes, razonamiento multi-paso, matematicas, codigo y vision: no aplica; es un modelo generativo de video, no un LLM.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado de video generativo en Android: permite a un desarrollador probar reference-to-video en un telefono Snapdragon 8 Gen 1 sin GPU dedicada, usando el LoRA turbo de 4 pasos para obtener resultados en tiempos asumibles en movil.
- Demostracion de conversion de difusion a NPU: sirve como referencia tecnica de como trocear un transformer de difusion en tiles HMX INT8 y mapear el VAE a QNN HTP, util para equipos que quieran portar otros modelos a Hexagon.
- Generacion de clips cortos en local sin conexion: al ejecutarse integramente en el dispositivo, encaja en escenarios de privacidad donde no se quiere enviar imagenes de referencia a la nube.
- Investigacion sobre cuantizacion INT8 en difusion de video: el repositorio permite medir la perdida de calidad del transformer y del VAE cuantizados frente a los pesos originales en bf16.
- Pruebas de integracion en la app HexAnima: el `manifest.json` con tamano y sha256 de cada fichero facilita validar instalaciones y detectar corrupciones en pipelines de distribucion de pesos.
- Evaluacion de latencia en movil: util para comparar throughput de 4 pasos turbo en NPU frente a ejecuciones en CPU/GPU del mismo telefono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: unos 37,3 GB para este repositorio, y aproximadamente 60 GB libres en total contando el codificador de texto de HexAnima H3-Image.
- RAM: 12 GB en el dispositivo, segun el autor.
- SoC: Qualcomm Snapdragon 8 Gen 1 o 8+ Gen 1 (NPU Hexagon V69 con acelerador HMX).
- GPU de escritorio: no aplica; los ficheros no son utilizables fuera de la app HexAnima.
- Opciones de despliegue: exclusivamente la app Android HexAnima (repositorio en GitHub); no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HexAnima R2V Packs (este) | no disponible | no disponible | NPU Hexagon V69 (Android) | MiniMax-H3 Community License | Hugging Face, solo para app HexAnima |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | GPU (safetensors) | MiniMax-H3 Community License | Hugging Face |
| Comfy-Org/MiniMax-H3 | no disponible | no disponible | ComfyUI (GPU) | MiniMax-H3 Community License | Hugging Face |

No se dispone de datos de rendimiento ni de parametros del modelo base en la informacion proporcionada, por lo que la comparacion se limita a plataforma, licencia y formato de distribucion.

## Limitaciones y advertencias

- Restriccion territorial: la licencia excluye el uso en Estados Unidos, Union Europea, Reino Unido y Corea del Sur (seccion I del LICENSE). En Espana no es utilizable.
- Los ficheros no son compatibles con otras herramientas: solo funcionan dentro de la app HexAnima, lo que impide reutilizarlos en pipelines estandar.
- Requiere instalar aparte el codificador de texto de `ayanoby/hexanima-h3`; sin el, el paquete esta incompleto.
- Cuantizacion INT8 agresiva en transformer y VAE: cabe esperar perdida de calidad frente a los pesos bf16 originales, aunque el autor no publica metricas.
- Dependencia de hardware muy concreta (Snapdragon 8 Gen 1 / 8+ Gen 1); no hay garantia de funcionamiento en otras generaciones de Hexagon.
- Sin datos publicados de sesgos, tasa de alucinacion visual ni evaluacion cualitativa de los videos generados.
- Al ser un derivado de un modelo de difusion de video, hereda los sesgos del dataset original de MiniMax-H3, no documentados en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ayanoby/hexanima-r2v-packs
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio de pesos de origen (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Codificador de texto compartido: https://huggingface.co/ayanoby/hexanima-h3
- App HexAnima: https://github.com/ayanoby/hexanima
