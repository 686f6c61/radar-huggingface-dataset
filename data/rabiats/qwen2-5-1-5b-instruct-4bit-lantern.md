# RabiatS/Qwen2.5-1.5B-Instruct-4bit-Lantern

## Resumen

RabiatS/Qwen2.5-1.5B-Instruct-4bit-Lantern es una copia redistribuida del modelo Qwen2.5-1.5B-Instruct en cuantizacion de 4 bits y formato MLX, publicada por el autor de Lantern, una aplicacion de IA offline para iPhone, iPad y Mac. No se trata de un fine-tune: los pesos son identicos a los de la conversion ya existente de mlx-community, y el repositorio existe unicamente para que la aplicacion Lantern pueda descargar el modelo desde un identificador propio y verificado.

El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer decoder-only de 1.543.714.304 parametros orientado a instrucciones, con licencia Apache 2.0. Su interes en este contexto es practico: ofrece respuestas de calidad notablemente superior a las de un modelo de 1B ocupando apenas unos 0,9 GB en disco, lo que permite ejecutarlo en telefonos con 4 GB de RAM sin conexion a red, sin cuenta de usuario y sin enviar datos a ningun servidor.

La relevancia de esta ficha es que ilustra un patron cada vez mas comun: modelos pequenos cuantizados en 4 bits y empaquetados para inferencia local en Apple Silicon mediante MLX. Para un desarrollador, implica que la barrera de entrada a un asistente conversacional privado en dispositivo ya no es el hardware, sino la integracion del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (arquitectura Qwen2, derivada del modelo base; no se detalla en la model card) |
| Parametros totales | 1.543.714.304 (segun los pesos safetensors del repositorio) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; la familia Qwen2.5-Instruct declara 32.768 tokens en la documentacion del modelo base |
| Tipos de cuantizacion | 4 bits en formato MLX. Los parametros exactos de cuantizacion (bits por grupo, group size) no se especifican en la model card |
| Idiomas soportados | No disponible en la model card. El modelo base Qwen2.5-Instruct se distribuye como multilingue, pero esta ficha no declara idiomas concretos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); tamano del repositorio 0,9 GB |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta informacion sobre arquitectura ni sobre el proceso de entrenamiento: se limita a indicar que es una copia de mlx-community/Qwen2.5-1.5B-Instruct-4bit, con los pesos sin modificar, y que el modelo original es Qwen/Qwen2.5-1.5B-Instruct. Por tanto, cualquier detalle de arquitectura, numero de tokens de entrenamiento, composicion del dataset o fases de alineacion (SFT, RLHF, DPO) debe consultarse en la documentacion del modelo base, no en esta ficha.

Lo unico tecnicamente especifico de esta publicacion es la conversion a MLX en 4 bits, que reduce el peso en memoria de aproximadamente 3,1 GB en precision de 16 bits a unos 0,9 GB, a costa de una perdida de precision que el autor no cuantifica. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional e instrucciones generales, con el pipeline declarado `text-generation`.
- Respuestas de tipo asistente gracias al ajuste por instrucciones heredado del modelo base.
- Inferencia completamente local: no requiere red salvo la descarga inicial de los archivos.
- Ejecucion en dispositivo sin cuenta de usuario y sin telemetria, segun la model card.
- Compatibilidad con `mlx-lm` en Mac mediante la CLI `mlx_lm.generate`.
- Integracion directa en la aplicacion Lantern, que comprueba la memoria disponible del dispositivo antes de descargar el modelo.
- Capacidades de tool calling, function calling, agentes, vision, audio o modo thinking: no documentadas en la informacion proporcionada.

## Casos de uso

- Asistente personal offline en iPhone o iPad con 4 GB de RAM: el modelo cabe en el espacio de memoria del dispositivo y responde sin conexion, lo que lo hace adecuado para consultas cotidianas en movilidad o en zonas sin cobertura.
- Redaccion y edicion de textos privados: al no salir ningun dato del dispositivo, sirve para borradores de documentos sensibles (notas medicas, correos personales) donde enviar el texto a una API externa no es aceptable.
- Resumen de apuntes y articulos pegados manualmente en la app: con la ventana de contexto del modelo base basta para resumir documentos de varias paginas dentro de la aplicacion.
- Prototipado rapido de aplicaciones conversacionales en Mac: mediante `mlx-lm`, un desarrollador puede levantar un endpoint local de generacion de texto en un portatil Apple Silicon sin GPU dedicada ni coste de API.
- Traduccion y reformulacion de frases en el dispositivo: util como apoyo de escritura en un contexto donde la latencia de red no es deseable o no existe.
- Generacion de codigo ligera y explicaciones de fragmentos cortos: el modelo base esta entrenado sobre corpus de codigo, aunque su tamano limita la complejidad de los programas que puede producir de forma fiable.
- Base para experimentos de cuantizacion y evaluacion de calidad en 4 bits: comparar las salidas de esta version con las del modelo en 16 bits permite medir la degradacion introducida por la cuantizacion MLX.
- Segundo modelo de respaldo en un pipeline local: dado su tamano reducido, puede mantenerse cargado en memoria de forma permanente como fallback rapido frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye ninguna tabla de evaluacion, y no se documenta la perdida de calidad provocada por la conversion a 4 bits. Cualquier cifra de MMLU, HumanEval, GSM8K u otros conjuntos tendria que consultarse en la documentacion del modelo base Qwen/Qwen2.5-1.5B-Instruct, que no forma parte de la informacion proporcionada.

## Requisitos de hardware

- Peso en disco y en memoria: aproximadamente 0,9 GB con los pesos en 4 bits MLX, frente a unos 3,1 GB si se cargara en 16 bits.
- VRAM o memoria unificada estimada para inferencia: en torno a 1-1,5 GB en 4 bits contando pesos y cache KV para contextos moderados; alrededor de 3,5-4 GB en 16 bits.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM, y en cualquier Mac con Apple Silicon.
- Movil: el autor indica que funciona en cualquier iPhone compatible con Lantern, incluidos telefonos con 4 GB de RAM.
- GPU de centro de datos: no requiere A100, H100 ni similares; usarlas estaria totalmente sobredimensionado.
- Opciones de despliegue: `mlx-lm` en macOS y la aplicacion Lantern. Para vLLM, TGI, llama.cpp u Ollama seria necesaria una conversion previa, ya que estos runtimes no consumen pesos en formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RabiatS/Qwen2.5-1.5B-Instruct-4bit-Lantern | 1,54 B | No disponible en esta ficha (el base declara 32.768) | MLX 4 bits, safetensors | Apache 2.0 | HuggingFace, pensado para Lantern |
| mlx-community/Qwen2.5-1.5B-Instruct-4bit | 1,54 B | No disponible en esta ficha | MLX 4 bits | Apache 2.0 | HuggingFace; es el origen de esta copia |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens segun documentacion del modelo base | safetensors en 16 bits | Apache 2.0 | HuggingFace |
| Alternativas de ~1-2 B (Llama 3.2 1B Instruct, SmolLM2 1.7B Instruct) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparacion con modelos de otros fabricantes no puede completarse con rigor porque la informacion proporcionada no incluye sus especificaciones. La diferencia relevante entre las tres primeras filas es de empaquetado, no de capacidades: los pesos son los mismos y solo cambia el identificador del repositorio y la precision del original.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados para esta copia concreta, por lo que no se conoce la degradacion real introducida por la cuantizacion a 4 bits.
- Es un modelo de 1,5 B de parametros: la tasa de alucinacion en preguntas factuales, calculos largos o codigo complejo es alta en comparacion con modelos de 7 B o mas.
- La model card no declara idiomas soportados. Aunque el modelo base es multilingue, el rendimiento fuera del ingles y del chino puede degradarse y no esta documentado.
- No se documentan sesgos especificos de esta version; al ser una copia del modelo base, hereda los sesgos de sus datos de entrenamiento, que no se detallan.
- Este repositorio no es un fine-tune ni una mejora: no debe citarse como un modelo nuevo ni atribuirse al autor de Lantern la autoria de los pesos.
- Licencia Apache 2.0, que permite uso comercial y modificacion, pero conviene conservar los avisos de atribucion a Qwen y a mlx-community.
- Relacionado con lo anterior: no hay informacion sobre terminos adicionales de uso aceptable, filtros de contenido ni mecanismos de seguridad en produccion.
- El repositorio declara cero descargas y cero likes, por lo que no existe validacion comunitaria de su funcionamiento.
- Al estar en formato MLX, no es directamente desplegable en servidores Linux con vLLM o TGI; requiere conversion.
- No se especifican parametros de cuantizacion (group size, bits efectivos por peso), lo que dificulta reproducir exactamente el mismo comportamiento en otro runtime.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RabiatS/Qwen2.5-1.5B-Instruct-4bit-Lantern
- Conversion de origen: https://huggingface.co/mlx-community/Qwen2.5-1.5B-Instruct-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de la aplicacion Lantern: https://github.com/RabiatS/lantern
