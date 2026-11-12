# bruhrelax/gqe-co2-gpt2-xl-weighted-lora

## Resumen

`bruhrelax/gqe-co2-gpt2-xl-weighted-lora` es un adaptador LoRA de PEFT construido sobre `openai-community/gpt2-xl` (1.558 millones de parametros, arquitectura transformer decoder-only). Lo desarrolla el usuario independiente bruhrelax como resultado final de un estudio de investigacion sobre busqueda de circuitos cuanticos para la molecula de CO2 en la base STO-3G con 30 qubits. El modelo no es un asistente generalista: genera secuencias de operaciones de circuito dentro de un catalogo fijo y cerrado definido por el estudio, con evaluacion energetica simulada de forma clasica.

El problema que aborda es el de la busqueda de circuitos en quimica cuantica: en lugar de optimizar parametros variacionales de forma continua (como en VQE), el adaptador aprende a emitir secuencias discretas de puertas que, evaluadas por un simulador, aproximan la energia del estado fundamental del CO2. El entrenamiento usa una verosimilitud de secuencia enmascarada por gramatica y ponderada por energia (lambda=0,25), de modo que las secuencias con menor error energetico reciben mas peso.

Su relevancia es acotada y experimental: se trata de un artefacto de investigacion reproducible con procedencia documentada (hashes, revisiones fijadas, poblacion de entrenamiento declarada), no de un modelo listo para produccion. El repositorio ocupa 0,1 GB y solo contiene el adaptador; los pesos base deben obtenerse por separado. No se ha asignado licencia publica a las modificaciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 XL) con adaptador LoRA (PEFT) |
| Parametros totales | 1.558 millones en el modelo base; el adaptador LoRA no declara recuento propio (rango 16, alpha 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (limite completo prompt+respuesta usado en el experimento) |
| Tipos de cuantizacion | no disponible (entrenado y exportado en BF16; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible para las modificaciones del autor; el modelo base es MIT (reproducida en `BASE_MODEL_LICENSE.txt`) |
| Formato de pesos | safetensors (adaptador LoRA via PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai-community/gpt2-xl`, fijado a la revision `15ea56dee5df4983c59b2538573817e1667135e2`. GPT-2 XL es un transformer decoder-only denso de 48 capas y 1.558 millones de parametros con atencion multi-cabeza clasica. La adaptacion LoRA usa rango 16, alpha 32 y dropout 0,05, con tasa de aprendizaje 2e-4, precision BF16 y atencion eager. No se anadieron tokens al vocabulario ni se modifico el tokenizador base.

El objetivo de entrenamiento es una verosimilitud de secuencia enmascarada por gramatica y ponderada por energia (lambda=0,25): el modelo aprende a emitir exactamente 32 identificadores dentro de la estructura `{"ops":[...]}`, restringido al catalogo de operaciones del estudio. La poblacion de ajuste aceptada fue de 6.144 filas, con 384 diagnosticos separados excluidos del entrenamiento. Se realizaron cinco pasadas completas (30.720 exposiciones de ejemplo) y 1.920 pasos de optimizador comprometidos, con semilla de pipeline 22. La seleccion de checkpoint fue la final, sin seleccion de modelo basada en el objetivo. El SHA-256 del peso original es `465425d17057b2e62fde3b75ac93ad7bc77695294f27160af179fcb49be877bc`, y los pesos exportados son byte-identicos al adaptador final original; solo se hicieron portables la ruta y la revision del modelo base en la configuracion exportada.

## Capacidades

- Generacion de secuencias de operaciones de circuito cuantico dentro de un catalogo fijo, con salida estructurada de exactamente 32 identificadores en formato `{"ops":[...]}`.
- Generacion restringida por gramatica (grammar-constrained generation), lo que garantiza que la salida sea sintacticamente valida respecto al catalogo del estudio.
- Modelado de secuencias condicionado a energia: el entrenamiento pondera las secuencias segun su error energetico, de modo que el modelo favorece patrones asociados a menores errores en el objetivo CO2.
- Generacion de texto en ingles a nivel de modelo base GPT-2 XL (capacidad heredada, no el foco del ajuste).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles; no se documento entrenamiento en otros idiomas.

## Casos de uso

- Investigacion en busqueda de circuitos cuanticos: el adaptador sirve como generador de propuestas de secuencias de puertas para CO2/STO-3G con 30 qubits, que luego se evaluan con un simulador clasico de energia. Es adecuado porque el estudio ya define el catalogo, la gramatica y el controlador de evaluacion.
- Reproduccion de experimentos: al fijar la revision del modelo base y verificar el SHA-256 del adaptador, un equipo puede reproducir el pipeline de generacion y evaluacion descrito en el repositorio de investigacion.
- Linea base para metodos generativos en quimica cuantica: sirve como referencia frente a controles de recuperacion y VQE incluidos en el repositorio de investigacion, permitiendo comparar enfoques discretos frente a variacionales.
- Estudio de objetivos ponderados por energia: el esquema de verosimilitud ponderada (lambda=0,25) puede reutilizarse como plantilla metodologica para otros dominios donde la calidad de la secuencia se mide con una funcion externa.
- Docencia y divulgacion: permite ilustrar como un LLM pequeno ajustado con LoRA y generacion restringida por gramatica puede integrarse en un bucle de optimizacion cientifica con evaluacion externa.
- Prototipado de generacion estructurada: el patron de salida `{"ops":[...]}` con 32 identificadores fijos es un ejemplo concreto de decodificacion constrenida que puede trasladarse a otros catalogos cerrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta unicamente errores energeticos finales de referencia: 87,487512 mHa en I01 y 123,764534 mHa en I02, con una media de objetivo fijo de 105,626023 mHa. Estos resultados son descriptivos, con una sola semilla de entrenamiento y dos objetivos de interpolacion de CO2; no se establecio transferencia a otras moleculas, utilidad industrial ni ventaja cuantica.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,1 GB; el modelo base GPT-2 XL en BF16 requiere aproximadamente 3,1 GB de pesos, mas memoria para activaciones y cache KV (con contexto de 1.024 tokens, el consumo total es moderado).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; una RTX 4090, A100 o H100 son holgadas para este tamano. Una GPU consumer de gama media con 8-12 GB es suficiente.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, entre otras.
- Opciones de despliegue: transformers + peft (ruta documentada por el autor), con atencion eager y BF16. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gqe-co2-gpt2-xl-weighted-lora (este) | 1.558 M base + LoRA r=16 | 1.024 tokens | Generacion de circuitos cuanticos con gramatica restringida | no disponible (base MIT) | Adaptador publico en HF |
| openai-community/gpt2-xl (base) | 1.558 M | 1.024 tokens | Generacion de texto general | MIT | Publico en HF |
| Adaptadores LoRA de quimica cuantica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos directamente comparables en la misma categoria (generacion de circuitos cuanticos para CO2/STO-3G). La comparacion con GPT-2 XL base es la unica referencia solida, ya que este adaptador es una especializacion suya.

## Limitaciones y advertencias

- El propio autor declara que la generacion de texto libre queda fuera del uso demostrado; el adaptador esta pensado para el controlador de evaluacion congelado del estudio.
- Solo se ha validado con una semilla de entrenamiento y dos objetivos de interpolacion de CO2; no se ha establecido transferencia a otras moleculas.
- No se ha demostrado utilidad industrial ni ventaja cuantica; la evaluacion energetica es simulada de forma clasica.
- Riesgo de alucinacion: el modelo puede emitir secuencias de operaciones sintacticamente validas pero energeticamente pobres; la gramatica garantiza la forma, no la calidad fisica.
- Sesgos conocidos: no documentados por el autor; al derivar de GPT-2 XL, hereda los sesgos del corpus original de GPT-2, aunque el ajuste restringido reduce su exposicion en la tarea objetivo.
- Limitacion de idioma: solo ingles; no se documento soporte multilingue.
- Limitacion de contexto: 1.024 tokens para prompt y respuesta completos; no admite conversaciones largas ni documentos extensos.
- Restricciones de licencia: el autor no asigna licencia publica a sus modificaciones; el modelo base es MIT. Antes de uso comercial es necesario aclarar la licencia del adaptador con el autor.
- Solo se publica el adaptador: el estado del optimizador, el estado RNG y los checkpoints intermedios no estan incluidos, lo que limita la reproducibilidad exacta del entrenamiento.
- El ejemplo de carga de la model card es documentacion y no fue ejecutado durante la publicacion de la release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bruhrelax/gqe-co2-gpt2-xl-weighted-lora
- Repositorio de investigacion, datos y resultados: https://huggingface.co/datasets/bruhrelax/gqe-co2-30q-research-v1
- Modelo base: https://huggingface.co/openai-community/gpt2-xl
- Revision fijada del modelo base: `15ea56dee5df4983c59b2538573817e1667135e2`
