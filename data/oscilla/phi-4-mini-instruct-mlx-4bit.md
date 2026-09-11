# Oscilla/Phi-4-mini-instruct-mlx-4Bit

## Resumen

Oscilla/Phi-4-mini-instruct-mlx-4Bit es una conversion a formato MLX en 4 bits del modelo microsoft/Phi-4-mini-instruct, publicada por el usuario Oscilla. No se trata de un modelo entrenado desde cero, sino de una version cuantizada y empaquetada para su ejecucion en Apple Silicon mediante la libreria mlx-lm (version 0.31.2), lo que permite desplegar un modelo conversacional de 3,84 mil millones de parametros en equipos con memoria unificada sin necesidad de GPU dedicada.

El modelo hereda del base la arquitectura phi3 (transformer decoder-only denso) y su caracter multilingue, con 23 idiomas declarados en los metadatos, entre ellos el espanol. Su relevancia practica esta en el formato: al reducir el peso del repositorio a 2,2 GB y mantener la licencia MIT, se convierte en una opcion viable para prototipado, inferencia local y aplicaciones de escritorio en macOS donde no se dispone de CUDA.

La ficha del autor es una model card de conversion: no documenta datos de entrenamiento, proceso de alineamiento, resultados de evaluacion ni detalles del esquema de cuantizacion mas alla del bit-width. Cualquier cifra de rendimiento o de contexto debe consultarse en la documentacion del modelo base, no en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, arquitectura phi3 (segun el tag `phi3`) |
| Parametros totales | 3.836.021.760 (3,84 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base microsoft/Phi-4-mini-instruct documenta 128 000 tokens, dato no verificable en este repositorio |
| Tipos de cuantizacion | 4-bit, generado con mlx-lm 0.31.2; no se detallan tamano de grupo ni otros esquemas |
| Idiomas soportados | 23 idiomas declarados: arabe, checo, danes, neerlandes, ingles, finlandes, frances, aleman, hebreo, hungaro, italiano, japones, coreano, noruego, polaco, portugues, ruso, espanol, sueco, tailandes, turco, ucraniano y chino |
| Licencia | MIT |
| Formato de pesos | safetensors en formato MLX (tamano del repositorio: 2,2 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo. Se sabe que se trata de una conversion de microsoft/Phi-4-mini-instruct realizada con mlx-lm 0.31.2, que produce pesos en formato MLX y, en este caso, con cuantizacion de 4 bits. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otra forma de alineamiento, ya que estos datos corresponden al modelo base y no se reproducen en esta model card.

En cuanto a la innovacion tecnica del artefacto publicado, esta es exclusivamente de despliegue: la conversion permite que los pesos se carguen en la memoria unificada de los chips de Apple (familia M) a traves de mlx-lm, con una huella en disco de 2,2 GB. El repositorio declara los tags `text-generation-inference` y `endpoints_compatible`, aunque el formato MLX no es directamente consumible por servidores de inferencia orientados a CUDA.

## Capacidades

- Generacion de texto y conversacion multi-turno: el pipeline declarado es `text-generation` y el tag `conversational` indica soporte de plantilla de chat (la model card muestra el uso de `apply_chat_template`).
- Generacion de codigo: el tag `code` figura entre los declarados por el autor, aunque no se aportan ejemplos ni evaluaciones.
- Multilingue: 23 idiomas declarados en los metadatos, incluido el espanol.
- Inferencia local en Apple Silicon: capacidad derivada del formato MLX y de la cuantizacion 4-bit, no del modelo en si.
- Tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada. El tag `phi3` y el tamano del repositorio indican un modelo exclusivamente de texto.

## Casos de uso

- Prototipado de asistentes conversacionales en macOS: al cargarse con mlx-lm en unos 2,2 GB de pesos, permite iterar sobre prompts y plantillas de chat en un Mac sin GPU dedicada ni conexion a servicios en la nube.
- Aplicaciones de escritorio nativas para Apple Silicon: mediante mlx-lm o mlx-swift se puede integrar generacion de texto embebida en una app macOS, manteniendo los datos del usuario en el dispositivo.
- Procesamiento de texto con requisitos de privacidad: sectores como sanidad, legal o banca pueden ejecutar resumenes y clasificacion de documentos en local, sin enviar contenido a APIs externas.
- Generacion asistida de codigo en flujos individuales: el tag `code` sugiere uso para autocompletado o explicacion de fragmentos dentro del editor, siempre con revision humana dado el tamano del modelo.
- Traduccion y atencion multilingue ligera: con 23 idiomas declarados, es utilizable para normalizar o traducir contenido en idiomas europeos y asiaticos en pipelines por lotes.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia 4-bit frente al modelo base en bf16 para medir la perdida de calidad en tareas concretas del dominio propio.
- Experimentacion docente e investigacion en hardware de consumo: permite reproducir experimentos de prompting y decodificacion en un portatil, con coste energetico bajo y sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan mediciones de latencia o throughput. No se han localizado en la busqueda web enlaces tecnicos relevantes sobre esta conversion (los resultados devueltos correspondian a servicios de mensajeria y no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: aproximadamente 2,2 GB para los pesos en 4 bits, mas el cache KV y el overhead del runtime; en la practica, entre 3 y 4 GB de memoria libre para contextos moderados.
- Hardware compatible: exclusivamente chips de Apple Silicon (familias M1, M2, M3 y M4) a traves de MLX. MLX no soporta CUDA, por lo que no se ejecuta en A100, H100 ni RTX 4090 sin convertir los pesos a otro formato.
- Cabe en GPU de consumo: no aplica en el sentido habitual; cabe en cualquier Mac con 8 GB o mas de memoria unificada, incluidos MacBook Air de gama base.
- Opciones de despliegue: mlx-lm (`mlx_lm.load`, `mlx_lm.generate` y el servidor incluido en el paquete), integracion en Swift mediante mlx-swift. Para vLLM, llama.cpp, Ollama o TGI seria necesario reconvertir los pesos a GGUF o safetensors estandar, ya que el formato MLX no es compatible de forma nativa.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones y dependen del chip concreto (ancho de banda de memoria) y de la longitud de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oscilla/Phi-4-mini-instruct-mlx-4Bit | 3,84 B | no disponible en la informacion proporcionada | safetensors MLX 4-bit | MIT | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| microsoft/Phi-4-mini-instruct | 3,84 B | 128 000 tokens segun la documentacion del modelo base | safetensors (bf16/fp16) | MIT | HuggingFace, modelo oficial de referencia |
| Otras conversiones cuantizadas del mismo base (GGUF, MLX u otras) | 3,84 B | no disponible | GGUF, MLX u otros | MIT | existencia conocida, datos concretos no verificados en la informacion proporcionada |

La diferencia funcional entre las dos primeras filas es unicamente el formato y la precision: esta version ocupa 2,2 GB en disco y esta pensada para Apple Silicon, mientras que el modelo base requiere mas memoria y un runtime distinto. No se dispone de datos que permitan comparar la calidad resultante de la cuantizacion 4-bit frente al original.

## Limitaciones y advertencias

- Riesgo de alucinacion: un modelo denso de 3,84 B parametros tiene menor fiabilidad factual que modelos de mayor tamano; no se ha publicado ninguna evaluacion de fidelidad para esta conversion.
- Perdida por cuantizacion: la cuantizacion a 4 bits puede degradar tareas sensibles a la precision, como razonamiento aritmetico o generacion de codigo, y no se documenta ningun analisis de esta perdida.
- Dependencia de plataforma: los pesos en formato MLX solo se ejecutan en Apple Silicon con mlx-lm o mlx-swift; no hay soporte CUDA y su uso en servidores con GPU NVIDIA exige reconvertir el modelo.
- Idiomas: los 23 idiomas figuran como declarados en los metadatos; no hay evaluaciones por idioma, por lo que la calidad real en lenguas distintas del ingles es desconocida.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado con pocos segundos de diferencia, por lo que no existe evidencia externa de que la conversion sea correcta ni de que los pesos se carguen sin errores.
- Metadatos anomalos: la fecha de creacion indicada (2026-09-11) es posterior a la fecha habitual de publicacion de este tipo de conversiones; conviene verificar la procedencia y la integridad de los ficheros antes de usarlos en produccion.
- Licencia: MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; se debe conservar el aviso de licencia y el enlace a la licencia del modelo base.
- Soporte no confirmado: no se especifica si conserva el soporte de function calling u otras capacidades del modelo base, ni se documenta el esquema exacto de cuantizacion (tamano de grupo, bits de escala), lo que complica reproducir la conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/Phi-4-mini-instruct-mlx-4Bit
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/resolve/main/LICENSE
- Libreria de conversion utilizada (mlx-lm): https://github.com/ml-explore/mlx-lm
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes sobre este modelo; las busquedas devolvieron unicamente paginas de servicios de mensajeria sin relacion con el repositorio.
