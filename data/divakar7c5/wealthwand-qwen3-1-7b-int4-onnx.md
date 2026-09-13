# divakar7c5/wealthwand-qwen3-1.7b-int4-onnx

## Resumen

Wealthwand-qwen3-1.7b-int4-onnx es una conversion a formato ONNX Runtime GenAI del modelo Qwen/Qwen3-1.7B, cuantizada a int4 para ejecucion en CPU. Lo publica el usuario divakar7c5 dentro del proyecto Wealth Wand, una aplicacion de finanzas personales local-first que extrae datos de extractos bancarios y de tarjeta sin que los documentos salgan del dispositivo. El repositorio no contiene pesos reentrenados: es unicamente un cambio de formato y una cuantizacion de los pesos oficiales.

El problema que resuelve es de despliegue, no de modelado. La release oficial de Qwen3-1.7B no se distribuye en formato GenAI, y los desarrolladores de Wealth Wand necesitaban un artefacto pequeno (aproximadamente 1,05 GB) que cupiera en un telefono y pudiera construirse de forma reproducible a partir de los pesos oficiales, con trazabilidad de procedencia verificable en lugar de un reempaquetado comunitario sin atribucion.

Es relevante porque ejemplifica el patron de modelos pequenos cuantizados para inferencia on-device en CPU, con soporte declarado en Windows (x64 y ARM64), Android, iOS y macOS. Incluye advertencias explicitas del autor sobre fallos medidos en extraccion estructurada de extractos bancarios, lo que lo convierte en un caso de estudio de los limites reales de un modelo de 1,7B para parsing de documentos financieros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3-1.7B), exportada a ONNX Runtime GenAI |
| Parametros totales | 1,7 mil millones (modelo base Qwen/Qwen3-1.7B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 (MatMulNBits), block_size=32, accuracy_level=4; solo se distribuye esta variante |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (heredada de Qwen3-1.7B) |
| Formato de pesos | ONNX en formato ONNX Runtime GenAI |
| Tamano del repositorio | 1,1 GB (modelo declarado: aproximadamente 1,05 GB) |
| Execution provider | CPU |
| Runtime requerido | Microsoft.ML.OnnxRuntimeGenAI 0.16.x |
| Herramienta de construccion | onnxruntime_genai.models.builder 0.16.0 |
| Plantilla de chat | ChatML (Qwen3), con modo thinking controlado por la secuencia `<think>\n\n</think>\n\n` |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay entrenamiento propio. El autor indica explicitamente que el repositorio contiene solo una conversion de formato y una cuantizacion: "no weights were retrained or otherwise modified beyond int4 quantization". La arquitectura subyacente es la del modelo base Qwen/Qwen3-1.7B, un transformer decoder-only que se exporta a ONNX y se cuantiza a int4 mediante la ruta `onnxruntime_genai.models.builder` con `-p int4 -e cpu --extra_options block_size=32 accuracy_level=4`.

La conversion parte de los pesos oficiales publicos y es reproducible sin credenciales: se descargan los ficheros `*.json`, `*.safetensors`, `*.txt` y `*.jinja` de `Qwen/Qwen3-1.7B` con `snapshot_download(..., token=False)`, y despues se invoca el builder. La cuantizacion int4 se aplica sobre las multiplicaciones de matrices (MatMulNBits) con tamano de bloque 32, lo que reduce el peso a aproximadamente 1,05 GB y permite inferencia en CPU. No se documentan datos de entrenamiento, numero de tokens, composicion de dataset ni fases de RLHF o DPO, ya que no se ha reentrenado el modelo. Como innovacion practica, la unica reseñable es el empaquetado en GenAI para ejecucion on-device y la reproducibilidad del pipeline de conversion.

## Capacidades

- Generacion de texto conversacional, en el formato de chat ChatML propio de Qwen3.
- Modo thinking: Qwen3 emite razonamiento antes de la respuesta; la plantilla de chat del modelo base lo desactiva añadiendo la secuencia vacia `<think>\n\n</think>\n\n` al final del turno del asistente.
- Extraccion de informacion estructurada, en concreto parsing de extractos bancarios y de tarjeta hacia JSON, que es el caso de uso declarado.
- Ejecucion en CPU sin GPU, con soporte declarado en Windows (x64 y ARM64), Android, iOS y macOS.
- Inferencia local-first: los documentos financieros no abandonan el dispositivo.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Control de generacion mediante `set_search_options`, con parametros como `max_length` y `temperature` (el ejemplo de la model card usa `max_length=3072` y `temperature=0.1`).

## Casos de uso

- Extraccion de extractos bancarios on-device: el modelo convierte texto de extractos en JSON estructurado dentro del propio dispositivo, lo que permite cumplir requisitos de privacidad en aplicaciones financieras sin enviar documentos a un servicio en la nube.
- Aplicaciones de finanzas personales local-first: integrado en la app Wealth Wand para leer extractos de banco y tarjeta; el diseno evita cualquier salida de datos del terminal del usuario.
- Asistente conversacional embebido en movil: con licencia Apache-2.0 y un peso de aproximadamente 1,05 GB, puede incluirse en aplicaciones Android o iOS que necesiten un chat de texto sin conexion.
- Procesamiento por lotes en CPU en servidores sin GPU: el execution provider es CPU, de modo que puede desplegarse en instancias sin acelerador para tareas de extraccion o clasificacion de texto a baja escala.
- Prototipado y evaluacion de pipelines ONNX Runtime GenAI: sirve como artefacto de referencia para validar la integracion con el runtime 0.16.x en Python, C# o C++ antes de escalar a modelos mayores.
- Aplicaciones de escritorio en Windows x64, Windows ARM64 y macOS: el build cubre esas plataformas sin necesidad de drivers ni runtime de GPU.
- Generacion de texto offline en entornos con conectividad restringida o requisitos de soberania de datos, donde no es viable llamar a una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar para este build. El autor si reporta observaciones cualitativas medidas sobre extractos bancarios indios sinteticos, que se recogen en la seccion de limitaciones.

## Requisitos de hardware

- VRAM: no aplica en la configuracion distribuida; el execution provider es CPU y el modelo no requiere GPU.
- Memoria en CPU: el artefacto pesa aproximadamente 1,05 GB (repositorio de 1,1 GB), por lo que se necesita espacio en disco y RAM suficiente para el modelo mas el estado de la sesion de inferencia; el autor posiciona el build para telefonos, lo que implica un presupuesto de memoria del orden de unos pocos GB en el dispositivo.
- GPU recomendadas: no disponibles; este build concreto no esta preparado para GPU.
- Cabe en GPU de consumo: no aplica a esta variante, que esta compilada para CPU.
- Plataformas soportadas: Windows (x64 y ARM64), Android, iOS y macOS.
- Opciones de despliegue: onnxruntime-genai con Microsoft.ML.OnnxRuntimeGenAI 0.16.x; el ejemplo de la model card usa la API de Python (`og.Model`, `og.Tokenizer`, `og.GeneratorParams`, `og.Generator`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato ONNX GenAI no es compatible con ellos.
- Compatibilidad de version: el autor advierte que la compatibilidad de formato no esta garantizada entre versiones de ONNX Runtime GenAI y que hay que emparejar este build con un runtime 0.16.x.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| wealthwand-qwen3-1.7b-int4-onnx | 1,7B | no disponible | ONNX Runtime GenAI int4 | Apache-2.0 | Build CPU, aproximadamente 1,05 GB, con avisos de extraccion estructurada |
| Qwen/Qwen3-1.7B (base oficial) | 1,7B | no disponible en la informacion proporcionada | safetensors (precision original) | Apache-2.0 | Pesos oficiales; no se distribuye en formato GenAI |
| Exportaciones ONNX comunitarias de Qwen3-1.7B | 1,7B | no disponible | ONNX | segun autor | La model card las menciona como alternativa existente, pero descarta su uso por falta de trazabilidad de procedencia; no se aportan nombres ni cifras |
| Otros modelos on-device de tamano similar | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- El autor documenta tres fallos medidos en extraccion estructurada sobre extractos bancarios indios sinteticos: emision ocasional de caracteres adicionales despues de la llave de cierre del JSON, uso de la fecha de la primera transaccion como inicio del periodo del extracto en lugar del periodo impreso, e inversion de las columnas de debe y haber en una fila manteniendo un saldo coherente con la direccion opuesta.
- Debe parsearse el primer objeto JSON balanceado en lugar de asumir que toda la respuesta es JSON valido.
- El error de inversion de signo es el mas grave para uso financiero; el autor recomienda reconciliar cada fila extraida contra la columna de saldo y corregir los errores de signo inequivocos, en lugar de confiar en la salida del modelo. Cualquier uso en extraccion financiera deberia implementar una verificacion equivalente.
- El modo thinking esta activado por defecto en Qwen3: si no se añade la secuencia vacia `<think>\n\n</think>\n\n`, el modelo emite razonamiento antes de la respuesta y rompe cualquier consumidor que espere salida estructurada como primer contenido.
- La compatibilidad de formato no esta garantizada entre versiones de ONNX Runtime GenAI; usar un runtime distinto de la serie 0.16.x puede provocar fallos de carga.
- Es una cuantizacion int4, por lo que cabe esperar una degradacion de calidad respecto a los pesos en precision completa del modelo base, aunque no se aportan mediciones de esa perdida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre su funcionamiento.
- No se documentan sesgos conocidos, limitaciones de contexto ni idiomas soportados en la informacion disponible.
- Licencia Apache-2.0, heredada del modelo base, sin restricciones adicionales de uso comercial indicadas por el autor; conviene verificar los terminos del modelo base Qwen3-1.7B.
- El modelo se construyo para un caso de uso concreto (extraccion de extractos en Wealth Wand) y su evaluacion se limita a ese dominio; no hay evidencia de rendimiento generalista.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divakar7c5/wealthwand-qwen3-1.7b-int4-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de la aplicacion Wealth Wand: https://github.com/WealthWand/wealth-wand
- Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo, su autor o el proyecto; los unicos resultados obtenidos correspondian a un producto no relacionado (una placa de induccion Kenwood IDC01) y se han descartado por no ser pertinentes.
