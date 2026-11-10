# addiesam/Ripple-65B-Preview-QVB8-1e-3

## Resumen

Ripple-65B-Preview-QVB8-1e-3 es un paquete de pesos cuantizados del modelo de lenguaje Ripple-65B-Preview, desarrollado originalmente por ricursiveAI y comprimido por el usuario addiesam mediante la herramienta QVB8. No se trata de un modelo nuevo, sino de una representacion comprimida del modelo base en formato QVB8, disenada especificamente para ejecutarse en el motor de inferencia QVB8 (github.com/addiesam/qvb8) y no en `transformers` ni en otros motores convencionales. El modelo base Ripple-65B-Preview es un modelo de generacion de texto de tipo conversacional, presumiblemente de 65.000 millones de parametros segun su nombre, aunque el paquete cuantizado reporta 1.664.080 parametros en safetensors, lo que sugiere que el conteo corresponde a tensores empaquetados y no al numero real de parametros del modelo original.

La innovacion principal de este paquete es su compresion con cota L-infinito certificada: para cada peso restaurado, el error respecto al valor original en bf16 es estrictamente inferior a tau = 0.001. A diferencia de la cuantizacion tradicional, que se evalua por medias (perplejidad o benchmarks), este formato controla el peor caso, evitando que un peso con error elevado provoque la generacion de un token erroneo o caracteres de otro idioma en medio de una respuesta. El paquete ocupa 57,3 GB en disco, con 642 tensores comprimidos a una media de 7,08 bits por peso.

El modelo es relevante ahora porque propone un enfoque alternativo a la cuantizacion convencional (GPTQ, AWQ, GGUF), priorizando la garantia de error maximo sobre la media, y porque incluye un modelo draft DFlash2 para decodificacion especulativa. Su adopcion esta limitada por la dependencia del motor propietario QVB8 y por la escasa documentacion disponible sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Ripple-65B-Preview); no se detalla la variante exacta |
| Parametros totales | 65B en el modelo base (segun nombre); 1.664.080 en safetensors del paquete (tensores empaquetados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8 con cota L-infinito; tau = 0.001; media de 7,08 bits por peso en 642 tensores comprimidos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QVB8 (safetensors empaquetados); requiere motor QVB8 v1.0.1 o superior; no cargable en `transformers` |
| Modelo base | ricursiveAI/Ripple-65B-Preview (bf16) |
| Certificacion de error | fp16 y bf16 (`restore: fp16+bf16`); `max_err` por tensor en `manifest.json` |
| Tamano en disco | 57,3 GB |
| Libreria | qvb8 |

## Arquitectura y entrenamiento

La arquitectura del modelo base Ripple-65B-Preview no se detalla en la informacion disponible; por el nombre se infiere un transformer de aproximadamente 65.000 millones de parametros, pero no se especifica si emplea atencion estandar, atencion lineal, mezcla de expertos u otra variante. Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Toda esta informacion correspondiente al modelo original no esta disponible en la documentacion del paquete cuantizado.

La innovacion tecnica destacable reside en el proceso de compresion QVB8. Cada matriz de pesos se empaqueta con un ancho de bits por fila, sin uso de datos de calibracion (depende unicamente de los pesos), y se verifica tras el empaquetado: el error maximo entre el valor restaurado y el peso original en bf16 se registra por tensor en `manifest.json` (`max_err`), garantizando que ningun tensor supera tau. El motor QVB8 decodifica los pesos comprimidos en la GPU dentro de sus propios kernels CUDA, lo que permite ejecutar un modelo de gran tamano en hardware mas pequeno. Ademas, el paquete admite decodificacion especulativa mediante un modelo draft DFlash2 (paquetes separados de 4,1 GB y 3,4 GB). La actualizacion del 9 de noviembre de 2026 anadio `escape_tables.json` para acelerar la ejecucion en fp16 (de aproximadamente 1,8 a 5,7 tokens por segundo en un DGX Spark con un prompt y decodificacion greedy), reduciendo la tabla de escapes de 45.600 a 1.302 entradas.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el modelo base esta etiquetado como conversacional.
- Razonamiento y generacion de codigo: no se documentan explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los idiomas soportados no se especifican.
- Decodificacion especulativa: soportada mediante el modelo draft DFlash2 empaquetado en QVB8.
- Ejecucion en GPU con decodificacion de pesos comprimidos dentro de kernels CUDA propios del motor QVB8.
- Certificacion de error maximo por peso (L-infinito) en fp16 y bf16.

## Casos de uso

- Despliegue de un modelo de 65B en hardware limitado: el motor QVB8 decodifica los pesos comprimidos en la GPU, permitiendo ejecutar el modelo donde un modelo bf16 completo no cabria; el paquete de 57,3 GB reduce el requisito de memoria respecto a los aproximadamente 130 GB del modelo base en bf16.
- Generacion de texto conversacional con garantia de error acotado: adecuado en escenarios donde un unico token erroneo es critico (por ejemplo, respuestas con codigos, identificadores o terminos tecnicos), gracias a la cota L-infinito de 0.001 por peso.
- Inferencia de baja latencia con decodificacion especulativa: el uso conjunto del paquete objetivo y el draft DFlash2 acelera la generacion en el motor QVB8.
- Evaluacion de tecnicas de cuantizacion certificada: util para investigadores que comparan cuantizacion por media (GPTQ, AWQ) frente a cuantizacion por peor caso.
- Experimentacion en entornos con GPU de un solo nodo: el ejemplo documentado de un DGX Spark con fp16 y decodificacion greedy (aproximadamente 5,7 tokens por segundo) sirve como referencia para prototipos.
- Archivado y distribucion de pesos con trazabilidad de error: `manifest.json` registra `max_err` por tensor, lo que facilita auditorias de calidad del proceso de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento documentada es la velocidad de decodificacion en el motor QVB8: aproximadamente 1,8 tokens por segundo antes de anadir `escape_tables.json` y aproximadamente 5,7 tokens por segundo con el archivo, en un DGX Spark, en fp16, con un unico prompt y decodificacion greedy. No se aportan datos de MMLU, HumanEval, GSM8K ni perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el paquete ocupa 57,3 GB en disco y el motor decodifica los pesos en la GPU, por lo que se requiere al menos memoria suficiente para los pesos decodificados durante la ejecucion.
- GPU recomendadas: no se especifican; el unico hardware mencionado en la documentacion es un DGX Spark.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente el motor QVB8 (v1.0.1 o superior) desde github.com/addiesam/qvb8; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 5,7 tokens por segundo en fp16 con `escape_tables.json` en un DGX Spark (un prompt, greedy); aproximadamente 1,8 tokens por segundo sin el archivo. Las ejecuciones en bf16 no se ven afectadas por la actualizacion.
- Modelo draft: DFlash2 en QVB8 (4,1 GB) o QVB8R (3,4 GB) para decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Ripple-65B-Preview-QVB8-1e-3 | 65B (base) | no disponible | QVB8 | Apache 2.0 | QVB8 exclusivamente |
| Ripple-65B-Preview (bf16) | 65B | no disponible | safetensors bf16 | Apache 2.0 | transformers y otros |
| Ripple-65B-Preview-QVB8-2e-3 | 65B (base) | no disponible | QVB8 | Apache 2.0 | QVB8 exclusivamente |
| Ripple-65B-Preview-QVB8R-1e-3 | 65B (base) | no disponible | QVB8R | Apache 2.0 | QVB8 exclusivamente |

No se dispone de informacion sobre modelos de terceros comparables (mismo tamano o misma tarea) en la documentacion proporcionada.

## Limitaciones y advertencias

- Dependencia total del motor QVB8: el paquete no carga en `transformers` ni en otros motores; sin el motor v1.0.1 o superior es inutilizable.
- La cota L-infinito cubre unicamente los pesos almacenados; no garantiza que las respuestas del modelo sean identicas a las del original ni correctas.
- La cuantizacion a tau mayor reduce el tamano pero aumenta la perplejidad; tau = 0.001 es un compromiso concreto que el usuario debe asumir.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero inherente a los modelos de lenguaje.
- Sesgos conocidos: no disponibles.
- Idiomas soportados y limitaciones de contexto: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base ricursiveAI/Ripple-65B-Preview.
- Documentacion muy escasa sobre el modelo base: arquitectura, datos de entrenamiento y capacidades no estan detallados.
- El conteo de parametros en safetensors (1.664.080) no coincide con el nombre del modelo (65B), lo que puede inducir a confusion si se interpreta como numero real de parametros.
- Para ejecuciones en fp16 es necesario descargar el repositorio completo, de modo que `escape_tables.json` quede junto a `manifest.json`; sin el archivo, la ejecucion en fp16 se detiene al arrancar.

## Enlaces

- Hugging Face: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Motor QVB8: https://github.com/addiesam/qvb8
- Release v1.0.1 del motor: https://github.com/addiesam/qvb8/releases/tag/v1.0.1
- Paquete QVB8R tau 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Paquete QVB8 tau 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Paquete QVB8R tau 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Draft DFlash2 QVB8: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Draft DFlash2 QVB8R: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
