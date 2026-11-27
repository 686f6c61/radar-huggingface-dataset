# julienkay/tiny-random-LlamaForCausalLM-Wide-GGUF

## Resumen

`julienkay/tiny-random-LlamaForCausalLM-Wide-GGUF` es un modelo de prueba publicado por el desarrollador julienkay (autor del paquete Unity `tools.doji.transformers`) para validar la carga e inferencia de ficheros GGUF en el motor de inferencia de Unity. No es un modelo entrenado: se trata de un `LlamaForCausalLM` de 2 capas con pesos aleatorios y un tamaño oculto de 256, con 13.763.840 parámetros totales, generado mediante el script `tools/causal_lm/make_models.py tiny --arch llama_wide`.

Su particularidad tecnica es que cada fila de sus matrices contiene bloques completos de 256 valores, lo que permite que los ficheros GGUF usen tipos de peso cuantizados con bloques de 256 valores, en concreto IQ4_NL e IQ4_XS. Los pesos no son una cuantizacion real de un modelo entrenado, sino bloques aleatorios generados con la desviacion tipica del tensor original en F32. El tokenizador procede de `HuggingFaceTB/SmolLM2-135M-Instruct`, bajo licencia Apache 2.0.

El modelo es relevante unicamente como utilidad de test para desarrolladores que integran GGUF en Unity: permite verificar la correccion de la dequantizacion, la carga de metadatos y la generacion de logits de referencia frente a transformers con `gguf_file`. No tiene utilidad para tareas de lenguaje reales, ya que genera texto aleatorio por diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, 2 capas) |
| Parametros totales | 13.763.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL, IQ4_XS (bloques de 256 valores); normas en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`model-iq4_nl.gguf`, `model-iq4_xs.gguf`) |
| Tamano oculto | 256 |
| Tokenizador | HuggingFaceTB/SmolLM2-135M-Instruct (Apache 2.0) |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo Llama con solo 2 capas y un tamano oculto de 256. No ha sido entrenado: los pesos son aleatorios. El proceso de construccion, documentado en la model card, parte de la generacion del modelo transformers con `make_models.py tiny --arch llama_wide --no-onnx`, seguida de la conversion a GGUF con `convert_hf_to_gguf.py` de llama.cpp (commit `244640b7f26e2a7301b27a24edc4f7feaf97d52f`) usando `--outtype f32`.

Posteriormente, el script `gguf-random --type IQ4_NL` (o `IQ4_XS`) sustituye las matrices del fichero (embedding y pesos lineales) por bloques aleatorios del tipo cuantizado, escalando cada bloque para que su desviacion tipica coincida con la del tensor correspondiente en el fichero F32. Las normas y los metadatos se mantienen intactos. Finalmente, `gguf-file-references` genera los logits y tokens de referencia para los tests, cargando cada fichero con `gguf_file` y dequantizando con `gguf-py`. No hay datos de entrenamiento, RLHF ni DPO porque no existe entrenamiento.

## Capacidades

- Generacion de texto aleatorio: el modelo produce tokens sin coherencia semantica, por diseno.
- Carga de ficheros GGUF con tipos de bloque de 256 valores (IQ4_NL, IQ4_XS).
- Validacion de dequantizacion frente a `gguf-py` y transformers con `gguf_file`.
- Verificacion de metadatos y arquitectura `llama` en ficheros GGUF.
- Pruebas de integracion del motor de inferencia Unity (`Doji.AI.Transformers`).
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales.

## Casos de uso

- Test de carga de GGUF en Unity: permite comprobar que `AutoModelForCausalLM.FromGguf` y `AutoTokenizer.FromGguf` abren correctamente ficheros con tipos IQ4_NL e IQ4_XS y devuelven los tensores esperados.
- Validacion de dequantizacion: los logits de referencia generados con `gguf-py` permiten verificar que la implementacion de dequantizacion del motor de Unity produce valores equivalentes.
- Pruebas de regresion en CI: al ser un modelo diminuto (13,7 M de parametros) y con repo de 0.0 GB, se puede incluir en pipelines de integracion continua sin coste de almacenamiento ni de computo.
- Verificacion de metadatos GGUF: util para comprobar que el parser de metadatos lee correctamente la arquitectura `llama`, el tokenizador y los tipos de tensor.
- Test de tokenizador: al usar el tokenizador de SmolLM2-135M-Instruct, sirve para validar la integracion del tokenizador embebido en el GGUF.
- Desarrollo de herramientas de conversion: util como caso de referencia para quien implemente conversores o validadores de GGUF con bloques de 256 valores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo genera texto aleatorio, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en cualquier cuantizacion, dado el tamano de 13,7 M de parametros y el repo de 0.0 GB.
- GPU recomendadas: cualquier GPU consumer; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) e incluso en CPU.
- Opciones de despliegue: el motor Unity `Doji.AI.Transformers` es el destino principal; tambien es compatible con llama.cpp y cualquier runtime que lea GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia es despreciable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Formato |
|---|---|---|---|---|---|
| tiny-random-LlamaForCausalLM-Wide-GGUF | 13,7 M | no disponible | Test de GGUF en Unity | Apache 2.0 | GGUF |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | no disponible | Modelo instruct pequeno real | Apache 2.0 | safetensors, GGUF |
| Modelos tiny-random de transformers | variable | no disponible | Tests de integracion | variable | safetensors |

La comparativa con SmolLM2-135M-Instruct es relevante porque este modelo reutiliza su tokenizador; sin embargo, SmolLM2 es un modelo entrenado con capacidades reales de lenguaje, mientras que este es exclusivamente de test.

## Limitaciones y advertencias

- No es un modelo funcional: los pesos son aleatorios y el texto generado carece de sentido.
- No debe usarse en produccion ni para tareas de lenguaje reales.
- No hay datos de sesgos porque no hay entrenamiento; cualquier salida es aleatoria.
- No dispone de ventana de contexto documentada ni de soporte multilingue declarado.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero su unica utilidad practica es el test.
- Los pesos no son una cuantizacion real de un modelo entrenado, por lo que no sirven para evaluar la calidad de los tipos IQ4_NL o IQ4_XS en terminos de perplexidad.

## Enlaces

- Hugging Face: https://huggingface.co/julienkay/tiny-random-LlamaForCausalLM-Wide-GGUF
- Repositorio del paquete Unity: https://github.com/julienkay/tools.doji.transformers
- Tokenizador de referencia: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
