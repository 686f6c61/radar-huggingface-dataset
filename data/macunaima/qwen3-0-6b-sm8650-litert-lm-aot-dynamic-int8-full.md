# macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-AOT-Dynamic-INT8-Full

## Resumen

Este repositorio contiene `Qwen/Qwen3-0.6B` exportado y compilado AOT (*ahead-of-time*) para el SoC Qualcomm SM8650 (Snapdragon 8 Gen 3), empaquetado como bundle `.litertlm` para el runtime LiteRT-LM. Lo publica el usuario `macunaima` y no es un modelo entrenado desde cero, sino un artefacto de despliegue: pesos derivados del Qwen3-0.6B original, cuantizados y compilados para ejecutarse en la NPU (HTP) del chip mediante el compilador QNN de Qualcomm.

El objetivo es permitir inferencia de generacion de texto completamente en el dispositivo, sin conexion y sin GPU, en telefonos Android con Snapdragon 8 Gen 3. El build se describe como el mas simple posible: una sola invocacion de CLI, sin flags de particionamiento de grafo (`--split_cache`, `--externalize_embedder`, prefill o cache personalizados), y con la receta de cuantizacion por defecto del exportador (`dynamic_wi8_afp32`, pesos INT8 dinamicos con activaciones FP32).

Es relevante porque documenta un flujo reproducible de extremo a extremo (exportacion, compilacion AOT para NPU y empaquetado) en 3 minutos y 2 segundos sobre 16 nucleos de CPU, con log y script completos en el repositorio. Ahora bien, el propio autor advierte de que el bundle no se ha validado en dispositivo, no se han medido tokens por segundo, latencia ni memoria, y no existe ninguna evaluacion de calidad o perplexidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3) |
| Parametros totales | 0,6 B (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion del repositorio (el modelo base Qwen3-0.6B declara 32.768 tokens nativos, ampliables con YaRN) |
| Tipos de cuantizacion | `dynamic_wi8_afp32` (pesos INT8 dinamicos, activaciones FP32); reduccion de 3,9x tanto en el grafo principal como en el embedder |
| Idiomas soportados | no especificados en el repositorio; el modelo base Qwen3-0.6B declara soporte multilingue (mas de 100 idiomas y dialectos) |
| Licencia | Apache 2.0 (la misma del modelo base) |
| Formato de pesos | bundle `.litertlm` (819.812.816 bytes, 782 MiB) con 3 subgrafos TFL3 (model / embedder / auxiliary), bytecode HTP para SM8650 y tokenizer y metadatos incluidos; no hay safetensors ni GGUF |
| Modelo base | `Qwen/Qwen3-0.6B`, revision `c1899de289a04d12100db370d81485cdf75e47ca` |
| Backend AOT | Qualcomm / SoC SM8650 (Snapdragon 8 Gen 3) |
| SHA-256 del bundle | `30aee1147ea6fc8bfed001a7dbb66e491c55a57b47c8faf87f6dd58f8c2cab3d` |
| Libreria | `litert-lm` |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

No hay entrenamiento propio: el artefacto parte del checkpoint `Qwen/Qwen3-0.6B` y aplica un pipeline de conversion y compilacion. El proceso se ejecuta con una unica llamada a `litert-torch export-hf Qwen/Qwen3-0.6B ./out --aot_backend=qualcomm --aot_soc_model=SM8650 --bundle_litert_lm=True`, que descarga el checkpoint del Hub, lo convierte a LiteRT, invoca el compilador AOT de Qualcomm (QNN/HTP) y empaqueta el `.litertlm` con prefill/decode, embedder, auxiliary, tokenizer y metadatos.

La cuantizacion aplicada es `dynamic_wi8_afp32`, la receta por defecto de `export-hf` en esta version de `litert-torch`. Aunque no se paso ninguna flag `-q`, el `build.log` (linea 52) confirma la receta y el efecto medido: el grafo principal pasa de 2,22 GiB a 581,41 MiB y el embedder de 593,50 MiB a 151,86 MiB, ambos con un factor de reduccion de 3,9x. El autor insiste en que este no es un build en coma flotante y que quien quiera el baseline en precision completa debe desactivar explicitamente la receta por defecto (no probado en este repositorio).

La innovacion tecnica aqui no esta en el modelo, sino en el empaquetado: compilacion *ahead-of-time* del bytecode HTP especifico para SM8650 y contenedor con magic `LITERTLM` y tres subgrafos TFL3. El toolchain empleado fue `litert-torch` 0.9.4, `ai-edge-litert` 2.2.0, `ai-edge-litert-sdk-qualcomm` 2.2.0, `ai-edge-quantizer` 0.9.0, `torch` 2.13.0 y `transformers` 5.17.0 sobre Python 3.12 (Linux x86_64, porque el compilador AOT de Qualcomm no tiene build para macOS/arm64). El tiempo total fue de 3m02s en 16 nucleos, de los cuales 1m49s corresponden al estadio `AOT Compilation → apply_plugin`. El autor senala que la ruta AOT usada es la heredada y que el log emite un aviso de deprecacion apuntando a `--use_litert_lm_compiler=True`.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`) heredada del modelo base Qwen3-0.6B.
- Inferencia en dispositivo sobre la NPU del Snapdragon 8 Gen 3 mediante backend `npu` del runtime LiteRT-LM.
- Ejecucion offline: el bundle es autocontenido (modelo, embedder, auxiliary, tokenizer y metadatos).
- Capacidades multilingues: no verificadas en este build; el modelo base declara soporte para mas de 100 idiomas y dialectos.
- Modo de razonamiento (*thinking*): el modelo base Qwen3 lo incorpora, pero no hay confirmacion de que este bundle lo preserve ni de como se activa desde LiteRT-LM.
- Tool calling / function calling: no disponible (no documentado para este bundle).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Vision, audio: no soportado; el modelo base es exclusivamente de texto.
- Ajuste fino adicional: no; el repositorio solo distribuye el artefacto compilado.

## Casos de uso

- Asistentes de texto offline en aplicaciones Android: el bundle se puede empujar con `adb push` y ejecutar con `litert_lm_main --backend=npu`, de modo que una app en un telefono con Snapdragon 8 Gen 3 puede generar respuestas sin conexion y sin coste de API.
- Resumen y reescritura local de notas o mensajes: con un modelo de 0,6 B y 782 MiB en disco, encaja en el presupuesto de almacenamiento de una app movil y evita enviar texto del usuario a servidores externos.
- Clasificacion y etiquetado de texto sensible: al ejecutarse integramente en el dispositivo, es apto para casos donde la normativa o la politica de privacidad impiden salida de datos (sanitario, legal, empresarial interno).
- Cascada de filtrado previo: usar el modelo local como primera etapa para descartar o enrutar consultas triviales y escalar a un modelo en la nube solo las que lo requieran, reduciendo coste y latencia de red.
- Prototipado y validacion de la cadena LiteRT-LM AOT: sirve como referencia reproducible (build.sh y build.log incluidos) para equipos que necesiten compilar otros modelos para NPU Qualcomm y comparar variantes de cuantizacion.
- Funciones de accesibilidad y autocompletado en teclados o campos de texto de apps Android, donde la latencia de ida y vuelta a la nube es inaceptable.
- Demostraciones tecnicas y evaluacion de NPU en ferias o entornos sin conectividad, donde el objetivo es mostrar inferencia local sobre hardware movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor indica explicitamente que no se realizo ninguna medida de tokens por segundo, latencia de prefill, uso de memoria ni perplexidad, y que el modelo no fue validado en dispositivo. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- Dispositivo de destino: SoC Qualcomm SM8650 (Snapdragon 8 Gen 3). El bytecode HTP embebido esta compilado especificamente para ese SoC.
- Almacenamiento: 782 MiB para el bundle `.litertlm` (0,8 GB de repositorio).
- Memoria en ejecucion: no disponible; no se midio consumo de RAM ni de memoria de NPU.
- VRAM en GPU de escritorio: no aplica. Este artefacto no esta pensado para GPU; requiere el compilador AOT de Qualcomm y el runtime LiteRT-LM en el dispositivo.
- GPU de consumo (RTX 4090 y similares): no compatible con este bundle. Para ese escenario habria que usar los pesos originales de `Qwen/Qwen3-0.6B` en otro formato.
- Opciones de despliegue: runtime LiteRT-LM con el binario `litert_lm_main` (compilado desde el repositorio google-ai-edge/LiteRT-LM), transferido al dispositivo y ejecutado con `--model_path=...` y `--backend=npu`. vLLM, llama.cpp, Ollama y TGI no soportan el formato `.litertlm` y no aplican.
- Compilacion (fuera del dispositivo): Linux x86_64 es obligatorio para el compilador AOT de Qualcomm; con 16 nucleos de CPU el proceso completo tardo 3m02s.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Backend | Licencia | Estado |
|---|---|---|---|---|---|---|
| `macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-AOT-Dynamic-INT8-Full` (este) | 0,6 B | no disponible | `.litertlm`, cuantizacion `dynamic_wi8_afp32`, grafo completo sin particionamiento | NPU Qualcomm SM8650 | Apache 2.0 | Publicado, sin validar en dispositivo |
| `macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Float` | 0,6 B | no disponible | `.litertlm` (variante en coma flotante) | NPU Qualcomm SM8650 | Apache 2.0 | Publicado; sin datos comparativos en esta ficha |
| `macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Dynamic-INT8` | 0,6 B | no disponible | `.litertlm` (variante INT8 dinamica) | NPU Qualcomm SM8650 | Apache 2.0 | Build anterior; el autor no verifica que flags de export se usaron, por lo que no se puede comparar con este mas alla de lo documentado |
| `Qwen/Qwen3-0.6B` | 0,6 B | 32.768 tokens declarados por el modelo base | safetensors (checkpoint original) | GPU/CPU genericos | Apache 2.0 | Referencia de partida, precision completa, sin optimizacion para NPU |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No validado en dispositivo: el autor advierte de que compilar para el SoC no garantiza compatibilidad con toda version de firmware o de runtime de ese SoC. Hay que validar con `litert_lm_main` via `adb` en el modelo concreto de telefono antes de usar en produccion.
- Sin evaluacion de calidad: no hay perplexidad, benchmarks ni comparacion con alternativas; se desconoce el impacto real de la cuantizacion INT8 dinamica en la calidad de generacion.
- Sin metricas de rendimiento: no hay tokens por segundo, latencia de prefill ni consumo de memoria, datos imprescindibles para decidir su viabilidad en una app.
- Riesgo de alucinacion: inherente a un modelo de 0,6 B de parametros; no se ha medido ni mitigado en este build.
- Sesgos: no documentados; heredados del corpus de entrenamiento del modelo base, no evaluados aqui.
- Limitaciones de idioma: no verificadas. Aunque el modelo base declara cobertura multilingue amplia, el proceso de exportacion y cuantizacion puede degradar idiomas distintos del ingles y el chino.
- Contexto y modo *thinking*: el repositorio no confirma que la longitud de contexto nativa ni el modo de razonamiento del modelo base se conserven en el bundle, ni como se configuran desde el runtime.
- Limitaciones de plataforma: el bundle solo funciona en SM8650 con LiteRT-LM; no es portable a otros SoC, a GPU de escritorio ni a runtimes como vLLM, llama.cpp u Ollama.
- Cadena de compilacion heredada: el log emite un aviso de deprecacion que apunta a `--use_litert_lm_compiler=True`, por lo que la ruta usada puede quedar obsoleta en versiones futuras del toolchain.
- Reproducibilidad del toolchain: depende de versiones concretas (`litert-torch` 0.9.4, `ai-edge-litert` 2.2.0, `torch` 2.13.0, `transformers` 5.17.0) y de Linux x86_64.
- Licencia: Apache 2.0, sin restricciones adicionales conocidas para uso comercial; se mantienen las condiciones del modelo base. Conviene verificar los terminos de la licencia de los componentes de Qualcomm usados en la compilacion.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, sin evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-AOT-Dynamic-INT8-Full
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Variante en coma flotante: https://huggingface.co/macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Float
- Variante INT8 dinamica previa: https://huggingface.co/macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Dynamic-INT8
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Herramienta de exportacion litert-torch: no se proporciona enlace directo en la model card; se referencia el paquete `litert-torch` dentro del pipeline de compilacion.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardaban relacion con el contenido de la ficha y se han descartado.
