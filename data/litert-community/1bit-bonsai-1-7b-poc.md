# litert-community/1Bit-Bonsai-1.7B-PoC

## Resumen

1Bit-Bonsai-1.7B-PoC es un artefacto experimental publicado por la comunidad `litert-community`: un paquete LiteRT-LM con pesos cuantizados a 1 bit (INT1, binario) derivado de `prism-ml/Ternary-Bonsai-1.7B-unpacked`, que a su vez es una version cuantizada de Qwen3-1.7B. El objetivo no es ofrecer un modelo utilizable, sino servir de banco de pruebas para quien quiera implementar un kernel INT1 de multiplicacion de matrices en el backend GPU de LiteRT. Se trata de un derivado de cuantizacion post-entrenamiento y reempaquetado: no se reentreno ningun peso.

El problema que aborda es muy concreto: el acelerador GPU de LiteRT soporta rutas sub-byte para INT4 e INT2, pero no existe ningun kernel que consuma pesos de 1 bit. Por eso el bundle carga en el runtime y no tiene nada con lo que ejecutarlo. No es un problema de formato, de empaquetado ni de metadatos: el bundle es estructuralmente valido y esta completo en todas esas dimensiones, con 4 secciones (`LlmMetadataProto`, dos `TFLiteModel` y `HF_Tokenizer_Zlib`), plantilla de chat propia de Bonsai con el bloque de razonamiento intacto y contexto de 4096 tokens.

Su relevancia actual es la de una prueba de concepto que reduce el tamano del artefacto: 551 MB (550.727.634 bytes) frente a los 766 MB del build INT2 del mismo modelo y contexto, aproximadamente un 72%. El autor lo publica explicitamente para incentivar la escritura del kernel que falta, argumentando que media hora de trabajo de un desarrollador de kernels parte de una base ya terminada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tipo Qwen3, heredada del modelo base) |
| Parametros totales | Aproximadamente 1,7 mil millones (segun nomenclatura y modelo base Qwen3-1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | INT1 (1 bit, binario); el modelo base es ternario; existe un build INT2 de 766 MB |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM 1.5.0) |
| Tamano del archivo | 550.727.634 bytes (551 MB) |
| Tamano del repositorio | 0,6 GB |
| Tipo de modelo (runtime) | qwen3 |
| Muestreo configurado | TOP_P, k=20, p=0,85, temperature=0,5 |
| Secciones del bundle | 4: `LlmMetadataProto`, 2x `TFLiteModel`, `HF_Tokenizer_Zlib` |
| Datos de entrenamiento | Ninguno; cuantizacion post-entrenamiento y reempaquetado, sin calibracion |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen3-1.7B a traves de la cadena de derivacion `Qwen3-1.7B` -> `prism-ml/Ternary-Bonsai-1.7B-unpacked` -> este artefacto. No hay innovacion arquitectonica propia en este repositorio: la unica intervencion es la cuantizacion de los pesos a 1 bit y su empaquetado en el contenedor `.litertlm` de LiteRT-LM 1.5.0, con la plantilla de chat de Bonsai preservada, incluido el bloque de razonamiento. El bundle esta pensado para el acelerador GPU movil, no para CPU.

En cuanto a entrenamiento, la model card es explicita: no se utilizo ningun dato. No hay entrenamiento adicional, ni ajuste fino, ni datos de calibracion; se trata de una cuantizacion post-entrenamiento sobre el checkpoint ya publicado de Bonsai. La ausencia de datos de calibracion es relevante, porque implica que no se ha optimizado la asignacion de escalas u otros parametros de cuantizacion para un corpus concreto. El cuello de botella tecnico esta en el runtime: en YNNPACK el tipo `int2` ocupa el valor de enumeracion `0` y es consumido por el kernel de producto escalar (`ynnpack/kernels/dot/dot.cc`) con implementaciones NEON, AVX-512 y WASM SIMD, mientras que no existe ningun tipo `int1` ni `uint1` en YNNPACK ni matmul INT1 en el backend GPU de LiteRT.

## Capacidades

- Generacion de texto: es la unica capacidad declarada por el pipeline (`text-generation`), heredada del modelo base.
- Razonamiento: la plantilla de chat de Bonsai conserva el bloque de razonamiento, segun la model card.
- Capacidades reales de ejecucion: ninguna en el estado actual. El modelo no se ejecuta hoy, no hay kernel INT1 en el acelerador GPU de LiteRT y el autor indica explicitamente que no ofrece soporte ni atiende incidencias sobre por que no carga.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio): no disponibles; el pipeline declarado es unicamente de generacion de texto.

## Casos de uso

- Desarrollo de kernels: servir como artefacto de referencia y validacion para quien implemente un kernel INT1 de matmul en el backend GPU de LiteRT o anada el tipo `int1`/`uint1` a YNNPACK. El bundle ya esta empaquetado, con metadatos y tokenizador, de modo que el trabajo se limita al kernel.
- Pruebas de conformidad de runtime: verificar que un runtime LiteRT-LM es capaz de cargar un bundle con pesos sub-byte de 1 bit y de recorrer las cuatro secciones del contenedor sin errores de formato.
- Investigacion en cuantizacion extrema: analizar el impacto de la cuantizacion a 1 bit sobre los pesos de un modelo de 1,7B en cuanto a tamano de artefacto (551 MB frente a 766 MB en INT2) y a viabilidad de despliegue en movil.
- Benchmarking de tamano en dispositivo: medir el coste de almacenamiento y de transferencia de un modelo de 1,7B a 1 bit en un telefono Android, comparandolo con las variantes INT2 e INT4.
- Docencia y divulgacion: ilustrar la brecha entre un modelo empaquetado y un modelo ejecutable, y explicar la separacion entre cuantizacion, formato de contenedor y soporte de kernels en el runtime.
- Base para futuras variantes: partir de este artefacto para generar builds INT1 con otros contextos o combinaciones de cuantizacion una vez exista el kernel, reutilizando la cadena de herramientas de empaquetado de LiteRT-LM.
- Analisis de licencias y trazabilidad: usar la cadena de derivacion documentada (Qwen3-1.7B -> Ternary-Bonsai -> este bundle) como ejemplo de atribucion en modelos derivados bajo Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna metrica de calidad (MMLU, HumanEval, GSM8K ni similares) y, dado que el modelo no se ejecuta por la ausencia del kernel INT1, no existen mediciones de latencia ni de throughput.

## Requisitos de hardware

- No es ejecutable en hardware alguno en el estado actual: no existe kernel INT1 en el acelerador GPU de LiteRT. El fallo es de kernel, no de memoria ni de formato.
- Tamano de pesos: 551 MB en disco, lo que en teoria cabria holgadamente en la memoria de cualquier movil Android moderno; el build INT2 equivalente ocupa 766 MB.
- Objetivo declarado: acelerador GPU movil (Android) a traves de LiteRT-LM.
- VRAM estimada: no disponible; no se puede estimar de forma fiable sin un kernel capaz de consumir los pesos INT1 y sin mediciones de memoria de trabajo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LiteRT-LM 1.5.0 es el unico runtime previsto. No hay soporte indicado para vLLM, llama.cpp, Ollama o TGI, y el formato `.litertlm` no es un GGUF ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Estado |
|---|---|---|---|---|---|---|
| 1Bit-Bonsai-1.7B-PoC | ~1,7B | 4096 | INT1 (1 bit) | `.litertlm` | Apache-2.0 | No ejecutable (falta kernel) |
| Ternary-Bonsai-1.7B (build INT2) | ~1,7B | 4096 | INT2 | `.litertlm` | Apache-2.0 (modelo base) | Ejecutable segun la model card; 766 MB |
| Qwen3-1.7B | ~1,7B | No disponible en la informacion proporcionada | Original (sin cuantizar) | Safetensors (upstream) | Apache-2.0 | Ejecutable |

La comparativa se limita a las variantes de la misma familia, porque no hay datos de rendimiento publicados que permitan contrastar este artefacto con alternativas de otros autores. El dato diferencial es exclusivamente el tamano del artefacto: 551 MB frente a 766 MB del build INT2, alrededor del 72%.

## Limitaciones y advertencias

- El modelo no se ejecuta hoy. Es un proof of concept publicado como artefacto, no como modelo usable; el autor advierte que cargara en un runtime que no tiene con que ejecutarlo.
- No hay soporte asociado al repositorio. El autor pide explicitamente no abrir incidencias preguntando por que no carga; no lo hara por diseno hasta que exista un kernel.
- Sin datos de calibracion. La cuantizacion INT1 se aplico sin corpus de calibracion, por lo que no hay garantia alguna sobre la degradacion de calidad respecto al modelo base.
- Riesgo de degradacion severa. La cuantizacion a 1 bit sobre un modelo denso de 1,7B es un regimen extremo; cualquier evaluacion de calidad tendria que realizarse antes de considerar usos reales.
- Sin benchmarks. No hay ninguna metrica publicada de calidad, alucinacion o sesgo para este artefacto ni para su version ternaria en la informacion disponible.
- Idiomas no declarados. No se especifica el conjunto de idiomas soportados.
- Sesgos y alucinacion: no disponible en la informacion proporcionada; serian los heredados del modelo base Qwen3-1.7B, pero no se documentan aqui.
- Sin entrenamiento adicional. No se reentreno ningun peso, de modo que las limitaciones de conocimiento y de fecha de corte del modelo base se mantienen intactas.
- Restricciones de licencia: Apache-2.0, con atribucion a Alibaba Cloud (Qwen3-1.7B, Copyright 2024) y a Prism ML por la creacion con Bonsai. La licencia permite uso comercial, pero el modelo no es funcional, por lo que la cuestion es en la practica irrelevante.
- PII: no se recopilo ni proceso ningun conjunto de datos en la conversion, por lo que no hay PII nueva; persiste la que ya codificaran los pesos originales.
- Artefacto no apto para produccion en ningun escenario, dada la ausencia de ejecucion y de evaluacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/litert-community/1Bit-Bonsai-1.7B-PoC
- Modelo base (ternario, sin empaquetar): https://huggingface.co/prism-ml/Ternary-Bonsai-1.7B-unpacked
- Modelo origen Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia de Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- YNNPACK (kernel dot, tipos int2): https://github.com/google/XNNPACK/tree/master/ynnpack
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian a localizadores de tiendas de una cadena de supermercados y no guardan relacion con el artefacto.
