# aaronmac/tiny-shakespeare-2

## Resumen

Tiny Shakespeare 2 es un modelo de lenguaje causal a nivel de caracter entrenado desde cero sobre el corpus Tiny Shakespeare, un conjunto de obras teatrales de dominio publico. Lo desarrolla el usuario de Hugging Face aaronmac y se publica como material educativo, no como un modelo destinado a produccion. Su interes no reside en el rendimiento, sino en ser un ejemplo minimo y reproducible de un transformer causal completo: tokenizador de caracteres, cuatro bloques, cuatro cabezas de atencion y una dimension de embedding de 64.

El modelo tiene 226.113 parametros totales, un orden de magnitud propio de un ejercicio didactico. La longitud de contexto es de solo 32 tokens, lo que limita cualquier generacion a fragmentos muy cortos. El repositorio ocupa 0.0 GB y los pesos se distribuyen en formato safetensors, con codigo personalizado (`custom_code`), por lo que la carga requiere `trust_remote_code=True`.

Es relevante ahora unicamente como referencia pedagogica: permite estudiar el ciclo completo de entrenamiento, serializacion y carga de un modelo causal con la libreria transformers sin necesidad de hardware especializado. No compite con modelos de proposito general ni con modelos pequenos de uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), 4 bloques, 4 cabezas de atencion, embedding de 64 dimensiones |
| Parametros totales | 226.113 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre texto en ingles de Shakespeare) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer causal clasico, decoder-only, con cuatro bloques y cuatro cabezas de atencion por bloque, dimension de embedding de 64 y contexto de 32 caracteres. El tokenizador es a nivel de caracter, lo que reduce el vocabulario a los caracteres presentes en el corpus y simplifica el pipeline de entrenamiento, a costa de secuencias mas largas en tokens para el mismo texto.

El entrenamiento se realizo desde cero sobre Tiny Shakespeare, un corpus de obras de Shakespeare de dominio publico ampliamente usado en tutoriales. No se dispone de informacion sobre el numero de tokens vistos, la composicion exacta del dataset, el uso de RLHF/DPO ni tecnicas de optimizacion adicionales. No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto a nivel de caracter en estilo shakespeariano, limitada a continuaciones cortas.
- Modelado de lenguaje causal basico: prediccion del siguiente caracter.
- Capacidad de ejecutarse en CPU sin requisitos apreciables de memoria.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles; el corpus es en ingles.
- No dispone de modo thinking, vision ni audio.
- Util como banco de pruebas para experimentos de tokenizacion, atencion y entrenamiento.

## Casos de uso

- Docencia de arquitecturas transformer: permite recorrer el codigo y los pesos de un modelo causal completo en una sola sesion practica, con un coste computacional despreciable.
- Pruebas de pipelines de carga en transformers: sirve para validar integraciones con `trust_remote_code=True` y modelos con codigo personalizado antes de pasar a modelos mayores.
- Experimentos de tokenizacion a nivel de caracter: util para comparar el comportamiento de tokenizadores de caracter frente a BPE en corpus literarios pequenos.
- Generacion de texto de juguete en demos y tutoriales: produce continuaciones breves de estilo shakespeariano adecuadas para ilustrar la salida de un modelo causal.
- Reproduccion de experimentos de entrenamiento: al ser un modelo minimo, permite reentrenar desde cero y comparar hiperparametros en minutos.
- Pruebas de infraestructura de inferencia en CPU: sirve para validar endpoints, contenedores y scripts de despliegue sin consumir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en precision completa; cabe en cualquier GPU y en CPU.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta sin problemas en CPU.
- Cabe en cualquier GPU de consumo, incluidas integradas, y en entornos sin GPU.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, la latencia sera del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tiny Shakespeare 2 (aaronmac) | 226.113 | 32 | no disponible | Hugging Face |
| Modelos de juguete tipo nanoGPT | del orden de 10^5 a 10^7 | variable, habitualmente 64-256 | variable segun repositorio | Repositorios publicos |
| GPT-2 small | 124 millones | 1.024 | MIT (pesos publicados por OpenAI) | Hugging Face |

La comparativa con GPT-2 small es solo orientativa por orden de magnitud: Tiny Shakespeare 2 es aproximadamente 550 veces mas pequeno y su contexto es 32 veces menor. No se dispone de benchmarks que permitan comparar rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Modelo de juguete: no es adecuado para tareas de produccion, atencion al cliente ni generacion de codigo.
- Contexto de 32 tokens: cualquier generacion queda limitada a fragmentos muy cortos y sin coherencia extendida.
- Tokenizacion a nivel de caracter: la calidad del texto generado sera baja y con errores ortograficos frecuentes.
- Sesgos conocidos: no documentados; el corpus de Shakespeare contiene material historico con sesgos de epoca.
- Riesgo de alucinacion: alto en el sentido de que el modelo no tiene conocimiento factual; genera secuencias plausibles a nivel de caracter, no hechos.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar el uso comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene revisarlo antes de cargar el modelo.
- Idiomas: no se documenta soporte multilingue; el corpus es en ingles.

## Enlaces

- Hugging Face: https://huggingface.co/aaronmac/tiny-shakespeare-2
