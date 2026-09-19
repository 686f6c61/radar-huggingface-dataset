# nanash66/Spark-X2.5-4B-ROCmFP4-STRIX_LEAN-GGUF

## Resumen

Spark-X2.5-4B-ROCmFP4-STRIX_LEAN-GGUF es una cuantización GGUF del modelo denso Spark-X2.5-4B de XHToken, publicada por el usuario nanash66 el 19 de septiembre de 2026. El modelo base tiene 4.112.079.360 parámetros (4,11 B) y utiliza la arquitectura `spark2_5`, un transformer híbrido con atención de ventana deslizante (SWA) combinada con atención completa en proporción 3:1, GQA de 16 cabezas de consulta y 4 de clave/valor, y `head_dim` de 256. Su ventana de contexto declarada es de 1.048.576 tokens.

Lo relevante de esta publicación no es el modelo en sí, sino el formato: se trata de una cuantización a 4,39 bits por peso (BPW) con el preset propietario `Q4_0_ROCMFP4_STRIX_LEAN`, diseñado específicamente para la iGPU AMD Strix Halo (Ryzen AI Max, `gfx1151`). El artefacto pesa 2,26 GB y solo puede cargarse con el fork ROCmFPX de llama.cpp, que añade soporte para la arquitectura `spark2_5`; llama.cpp estándar, Ollama y LM Studio no pueden abrirlo. Es, por tanto, una pieza de nicho orientada a inferencia local en hardware AMD con memoria unificada.

El modelo base se comporta como modelo de razonamiento: emite un bloque `<think>...</think>` antes de la respuesta final. La cuantización incluye una importance matrix autogenerada y verificada con unos 29.000 tokens de calibración, y el autor confirma que el artefacto genera texto coherente en binarios ROCmFPX x86_64 (bajo QEMU) y en una compilación CPU aarch64, además de funcionar en una iGPU AMD Strix Point real. No hay mediciones de rendimiento en Strix Halo ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5`, transformer híbrido: atención SWA (ventana 512) y atención completa en proporción 3:1, GQA 16 cabezas Q / 4 KV, head_dim 256 |
| Parametros totales | 4.112.079.360 (4,11 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`); el ejemplo de despliegue del autor usa `-c 32768` |
| Tipos de cuantizacion | `Q4_0_ROCMFP4_STRIX_LEAN`, 4,39 bits por peso (2150,83 MiB). Censo de tensores: `Q4_0_ROCMFP4` x36, `Q4_0_ROCMFP4_FAST` x180, `F32` x73, `Q5_K` x1 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF, variante ROCmFPX (requiere el fork de llama.cpp con soporte `spark2_5`) |
| Tamano del archivo | 2.260.702.112 bytes (2,26 GB), archivo unico con plantilla de chat embebida |
| Vocabulario | 131.072 tokens, BPE, embeddings atados (`tokenizer.ggml.pre = spark2_5`) |
| Importance matrix | Incluida: `Spark-X2.5-4B-Q4_0_ROCMFP4_STRIX_LEAN.imatrix` (3,57 MB) |
| SHA256 | `f3c3a526d5ef7b8e249ca1b1a092878d047bfefc9e3cb432d21643452cf94699` |
| Modelo base | XHToken/Spark-X2.5-4B (cuantizado desde XHToken/Spark-X2.5-4B-GGUF en BF16, 8,23 GB) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento del modelo base: no hay datos publicos en la informacion proporcionada sobre numero de tokens, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. Lo unico documentado es la arquitectura de inferencia: `spark2_5`, un transformer hibrido que intercala tres capas de atencion de ventana deslizante (ventana de 512 tokens) por cada capa de atencion completa, con GQA de 16 cabezas de consulta y 4 de clave/valor, `head_dim` de 256 y un vocabulario BPE de 131.072 entradas con embeddings atados. El modelo emite razonamiento explicito en etiquetas `<think>`, comportamiento caracteristico de los modelos con modo de pensamiento. No incorpora cabecera MTP ni draft head, por lo que no admite decodificacion especulativa.

La innovacion tecnica de esta publicacion esta en la cuantizacion. El preset `Q4_0_ROCMFP4_STRIX_LEAN` reparte los tipos de tensor de forma no uniforme: las proyecciones `attn_qkv` fusionadas de cada bloque usan `Q4_0_ROCMFP4` con doble escala por cada 16 pesos (orientado a preservar la calidad de atencion K/V en Strix), mientras que `attn_gate`, `attn_output` y las proyecciones FFN (`gate/up/down`) usan `Q4_0_ROCMFP4_FAST`. Las 73 capas de normalizacion se mantienen en F32 y los embeddings atados en `Q5_K`. Los 290 tensores resultantes mantienen correspondencia 1:1 con el GGUF BF16 de origen. La importance matrix se genero con `llama-imatrix` sobre aproximadamente 29.000 tokens (57 fragmentos de 512) muestreados del corpus `eaddario/imatrix-calibration` (MIT), combinando los subconjuntos `tools_medium` (prompts de uso de herramientas y agenticos), `code_medium` (instrucciones de codigo de Magicoder-Evol-Instruct-110K, OpenCoder y McEval) y `combined_th_small` (tailandes), calculada sobre una copia F16 del GGUF BF16 oficial.

## Capacidades

- Generacion de texto conversacional: la publicacion incluye las etiquetas `conversational` y `endpoints_compatible`, y el GGUF lleva la plantilla de chat embebida (cargable con `--jinja`).
- Razonamiento con traza explicita: el modelo emite bloques `<think>...</think>` antes de la respuesta, verificado por el autor durante las pruebas de carga y generacion.
- Contexto largo: la arquitectura declara hasta 1.048.576 tokens de posicion maxima, con atencion SWA que reduce el coste del cache KV en la mayor parte de las capas.
- Generacion de codigo: no hay benchmarks que lo confirmen, pero la imatrix de esta cuantizacion se calibro con un subconjunto `code_medium` de instrucciones de programacion, lo que sugiere uso previsto en ese dominio.
- Soporte de tool calling / function calling: no disponible (la imatrix incluye prompts agenticos, pero eso no acredita capacidad del modelo).
- Soporte de agentes y razonamiento multipaso: no disponible.
- Capacidades multilingues: no disponible; no se documentan idiomas soportados. El corpus de calibracion incluye un subconjunto en tailandes, lo que no implica soporte del modelo en ese idioma.
- Vision, audio u otras modalidades: no disponibles (`pipeline_tag: text-generation`).
- Decodificacion especulativa: no soportada, el modelo no tiene cabecera MTP/draft y el autor advierte de no pasar flags `--spec-*`.
- Portabilidad: limitada al fork ROCmFPX de llama.cpp con soporte `spark2_5`; no funciona en runtimes GGUF convencionales.

## Casos de uso

- Inferencia local en equipos con AMD Strix Halo (Ryzen AI Max, `gfx1151`): los pesos ocupan 2,26 GB y la atencion SWA mantiene el cache KV reducido, por lo que el modelo cabe holgadamente en la memoria unificada. Se desplegaria con el contenedor `rocmfpx:server` del fork ROCmFPX y los flags `-ngl 999 -fa on -ctk q8_0 -ctv q8_0`, aprovechando las rutas HIP/Vulkan FP4.
- Procesamiento de documentos extensos en local: la ventana declarada de 1.048.576 tokens permite analizar contratos, informes o bases de codigo completas sin trocear, y el patron 3:1 de SWA reduce el coste de memoria del cache frente a un transformer de atencion completa.
- Asistentes de razonamiento auditables: el bloque `<think>` expone la cadena de razonamiento antes de la respuesta, lo que resulta util en entornos educativos o de depuracion donde se necesita revisar el proceso, no solo el resultado.
- Generacion y asistencia de codigo en estaciones de trabajo AMD: la calibracion de la cuantizacion incluye instrucciones de programacion de Magicoder-Evol-Instruct-110K, OpenCoder y McEval, por lo que se espera un comportamiento razonable en tareas de completado y explicacion de codigo, siempre con verificacion posterior.
- Servicio de chat compatible con la API de OpenAI: la etiqueta `endpoints_compatible` y la plantilla embebida con `--jinja` permiten exponer el modelo en el puerto 8080 del servidor ROCmFPX e integrarlo como backend en aplicaciones existentes que hablen ese protocolo.
- Escenarios con requisitos de privacidad o sin conectividad: al ejecutarse sobre hardware local y un formato de pesos autocontenido, permite procesar datos sensibles sin salida a servicios externos.
- Investigacion en cuantizacion FP4 sobre AMD: la publicacion incluye la importance matrix y el censo completo de tipos de tensor, lo que la convierte en un caso reproducible para estudiar el impacto de recetas FP4 especificas de `gfx1151` frente a cuantizaciones GGUF convencionales.
- Evaluacion de la arquitectura `spark2_5` en hardware de gama de consumo: util para quien quiera medir el comportamiento de atencion hibrida SWA/full a 4 bits antes de invertir en el modelo completo o en otras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica explicitamente que las cifras de throughput en Strix Halo (`gfx1151`) todavia no se han medido, y que las pruebas de verificacion se limitaron a comprobar coherencia de generacion (por ejemplo, razonamiento en estilo `<think>` y respuestas correctas a preguntas simples) en binarios ROCmFPX x86_64 bajo QEMU, en una compilacion CPU aarch64 y en una iGPU AMD Strix Point real. No hay datos de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion.

## Requisitos de hardware

- Pesos en disco y en memoria: 2.260.702.112 bytes (2,26 GB) para el unico archivo GGUF.
- VRAM estimada: aproximadamente 2,3 GB solo para pesos; el total depende del cache KV. Con `-c 32768`, `-ctk q8_0` y `-ctv q8_0` y el patron SWA 3:1, el sobrecoste de cache es reducido en comparacion con un modelo de atencion completa de contexto equivalente. Cualquier cifra exacta de VRAM total seria una estimacion no verificada.
- GPU objetivo: iGPU AMD Strix Halo (Ryzen AI Max, `gfx1151`). El autor confirma funcionamiento en una iGPU AMD Strix Point. Requiere rutas HIP/Vulkan con soporte FP4; en CPU el rendimiento sera lento, ya que el formato esta pensado para GPU.
- Configuracion recomendada por el autor: variables `HSA_OVERRIDE_GFX_VERSION=11.5.1` y `GGML_HIP_ENABLE_UNIFIED_MEMORY=1`, con `-ngl 999 -fa on -c 32768 -b 512 -ub 512 -ctk q8_0 -ctv q8_0 --jinja`.
- Encaje en GPU de consumo: los pesos de 2,26 GB permiten teoricamente ejecutarlo en GPUs de consumo con suficiente VRAM efectiva y cache KV pequeno, pero el formato ROCmFP4 esta implementado para el fork ROCmFPX y las rutas FP4 de AMD, por lo que otras marcas no estan soportadas.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp con soporte `spark2_5` (fork `main` en el commit `c49ebdb` mas el parche de port). El autor construye una imagen Docker `rocmfpx:server` con acceso a `/dev/kfd` y `/dev/dri`.
- No compatible con vLLM, TGI, Ollama, LM Studio ni llama.cpp estandar.
- Latencia y throughput: no disponibles; no se han publicado mediciones en Strix Halo.

Ejemplo de despliegue documentado por el autor:

```bash
docker run -d --name rocmfpx-serve --restart unless-stopped \
  --device /dev/kfd --device /dev/dri \
  --group-add "$(getent group render | cut -d: -f3)" \
  --group-add "$(getent group video  | cut -d: -f3)" \
  -p 8080:8080 -v /models:/models:ro \
  -e HSA_OVERRIDE_GFX_VERSION=11.5.1 \
  -e GGML_HIP_ENABLE_UNIFIED_MEMORY=1 \
  rocmfpx:server \
  -m /models/Spark-X2.5-4B-Q4_0_ROCMFP4_STRIX_LEAN.gguf \
  -ngl 999 -fa on -c 32768 -b 512 -ub 512 \
  -ctk q8_0 -ctv q8_0 \
  --jinja
```

## Comparativa con modelos similares

No se dispone de datos de benchmarks para este artefacto ni para su modelo base, por lo que la comparacion se limita a caracteristicas tecnicas verificables de la propia publicacion y de su origen.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtimes compatibles |
|---|---|---|---|---|---|
| nanash66/Spark-X2.5-4B-ROCmFP4-STRIX_LEAN-GGUF | 4,11 B densos | 1.048.576 tokens | `Q4_0_ROCMFP4_STRIX_LEAN`, 4,39 BPW, 2,26 GB | apache-2.0 | Solo fork ROCmFPX de llama.cpp con soporte `spark2_5` |
| XHToken/Spark-X2.5-4B-GGUF (BF16) | 4,11 B densos | 1.048.576 tokens | BF16, 8,23 GB | apache-2.0 | llama.cpp con soporte de la arquitectura `spark2_5` |
| XHToken/Spark-X2.5-4B (pesos originales) | 4,11 B densos | 1.048.576 tokens | Safetensors en BF16 (no confirmado en la informacion disponible) | apache-2.0 | Frameworks que implementen `spark2_5` |

No se dispone de informacion sobre modelos de terceros comparables (mismo tamano, contexto o tarea) dentro del material proporcionado, ni de resultados que permitan comparar rendimiento.

## Limitaciones y advertencias

- Dependencia estricta de runtime: el GGUF solo carga en el fork ROCmFPX de llama.cpp con soporte `spark2_5` (fork `main` en `c49ebdb` mas parche de port). llama.cpp estandar, Ollama y LM Studio no pueden cargarlo.
- Etiquetado incorrecto por herramientas automaticas: el parser de HuggingFace/GGUF no reconoce los enumerados de cuantizacion de ROCmFPX y puede etiquetar el archivo como "F16"; el formato real es `Q4_0_ROCMFP4_STRIX_LEAN` a 4,39 BPW.
- No hay cabecera MTP ni draft head: no deben pasarse flags `--spec-*`; hacerlo provocara errores.
- Sin benchmarks ni evaluaciones de calidad publicadas. Se desconoce la degradacion real respecto al BF16 de origen, aunque a 4,39 BPW es esperable cierta perdida en tareas sensibles a la precision.
- Hardware muy especifico: el formato esta optimizado para AMD `gfx1151`. En CPU el rendimiento es bajo y en GPUs NVIDIA o Intel no hay soporte.
- Throughput no medido en Strix Halo: las cifras de latencia y tokens por segundo en el hardware objetivo no estan publicadas.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la ficha, sin informes de terceros que confirmen el comportamiento en produccion.
- Idiomas no documentados: no se especifica que lenguas soporta el modelo base ni con que calidad.
- Riesgo de alucinacion: no hay datos especificos, pero es un modelo denso de 4,11 B, tamano en el que la generacion de hechos incorrectos es frecuente; debe verificarse la salida en usos facticos.
- Sesgos: no se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre evaluaciones de sesgo del modelo base.
- Fecha de creacion poco habitual: el repositorio figura creado el 19 de septiembre de 2026; conviene verificar la procedencia y la integridad del artefacto antes de usarlo.
- Licencia: apache-2.0 heredada del modelo base, lo que en principio permite uso comercial, pero la cadena de cuantizacion y el runtime dependen del fork ROCmFPX, cuya licencia y condiciones de uso no se detallan en la informacion proporcionada.
- Trazabilidad: las afirmaciones sobre calidad de atencion K/V en Strix y sobre el reparto de tipos de tensor provienen del propio autor, sin verificacion independiente.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/nanash66/Spark-X2.5-4B-ROCmFP4-STRIX_LEAN-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- GGUF BF16 de origen: https://huggingface.co/XHToken/Spark-X2.5-4B-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Corpus de calibracion de la importance matrix: https://huggingface.co/datasets/eaddario/imatrix-calibration
- Soporte de `spark2_5` en llama.cpp (referencia citada por el autor): PR #27868, build b10828
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante; los resultados devueltos no guardan relacion con el modelo (contenido sobre Windows 11).
