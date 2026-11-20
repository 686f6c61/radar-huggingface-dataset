# minseo25/2dsd-ouro-2.6b-thinking-shared-kv

## Resumen

2DSD shared-KV target: Ouro-2.6B-Thinking (W = 64) es un ajuste fino de ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje de 2.668 millones de parametros con arquitectura de bucles (looped transformer) y capacidad de razonamiento explicito. Lo desarrolla minseo25 (Minseo Kim) en el contexto del proyecto 2DSD (Two-Dimensional Speculative Decoding for Looped Language Models), vinculado a SqueezeAILab. El modelo no es un modelo generalista nuevo, sino un artefacto de investigacion: la variante "target" del decodificador especulativo 2DSD, adaptada para compartir la cache KV del ultimo bucle con una ventana deslizante de W = 64 tokens.

El problema que aborda es el coste de inferencia de los modelos con bucles: Ouro ejecuta R = 4 pasadas por token, lo que multiplica la memoria de cache KV y el tiempo de decodificacion. 2DSD explota la estructura bidimensional del calculo (profundidad de bucle x posicion de secuencia) para compartir cache KV entre profundidades y verificar con el ultimo bucle, manteniendo la distribucion de salida del modelo original. Este checkpoint concreto implementa la regla de comparticion con ventana local de 64 tokens.

La relevancia es acotada pero clara: sirve como referencia reproducible para quien quiera evaluar o reimplementar 2DSD sobre Ouro-2.6B-Thinking, y demuestra que un ajuste fino de una sola epoca con 128M tokens basta para adaptar el modelo a la regla de cache compartida sin cambiar arquitectura, tokenizer ni plantilla de chat. La licencia Apache-2.0 y el formato safetensors facilitan su reutilizacion, aunque el modelo requiere codigo personalizado (`custom_code`) para ejecutarse correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped language model), R = 4 loops, con comparticion de cache KV del ultimo bucle y ventana local W = 64 |
| Parametros totales | 2.667.974.657 (2,67 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar; repo de 5,3 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de ByteDance/Ouro-2.6B-Thinking, un transformer con calculo recurrente en profundidad: cada token se procesa a traves de R = 4 bucles, lo que permite reutilizar parametros y aumentar la capacidad efectiva de razonamiento sin incrementar el numero de pesos. Sobre esa base, este checkpoint introduce una regla de comparticion de cache KV: para los tokens ya comprometidos fuera de una ventana local de W = 64 tokens, las consultas de todas las profundidades de bucle leen una unica cache KV correspondiente al ultimo bucle; dentro de la ventana, cada consulta lee las entradas KV de su propio bucle. Ademas se conserva la cache KV de la primera capa del primer bucle. El prompt se prellena una sola vez con atencion por bucle.

El ajuste fino es completo (todos los parametros) durante una epoca sobre 128M tokens de OpenThoughts3, mediante self-distillation de dos pasadas, con un coste declarado de 6,7 horas en cuatro GPU H100. No se modifican arquitectura, tokenizer ni plantilla de chat respecto al modelo base. La innovacion tecnica no esta en el entrenamiento sino en el esquema de decodificacion: 2DSD verifica con el ultimo bucle, de modo que preserva las salidas greedy y la distribucion de muestreo del modelo original, y combina especulacion en dos dimensiones (profundidad de bucle y posicion) con un drafter asociado.

## Capacidades

- Generacion de texto conversacional y razonamiento explicito en modo "thinking", heredado de Ouro-2.6B-Thinking.
- Razonamiento multi-paso con bucles internos: el modelo puede dedicar mas computo por token sin aumentar parametros.
- Decodificacion especulativa compatible con 2DSD: mantiene las salidas greedy y la distribucion de muestreo del modelo base.
- Muestreo configurable: greedy por defecto, o `--temperature 0.6 --top-p 0.95` para muestreo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas.
- Vision o audio: no disponible; el pipeline es exclusivamente text-generation.

## Casos de uso

- Investigacion en decodificacion especulativa: reproducir los experimentos de 2DSD sobre Ouro-2.6B-Thinking usando `--model ouro-2.6b-thinking`, que carga este checkpoint junto con su drafter, para medir aceleraciones y verificar que se preserva la distribucion de salida.
- Evaluacion de comparticion de cache KV: comparar la calidad de las salidas con W = 64 frente al modelo base con atencion por bucle completa, aislando el efecto de la ventana local en tareas de razonamiento.
- Razonamiento matematico de coste contenido: el ejemplo de la model card (suma de los primeros 100 enteros positivos) ilustra el uso en problemas aritmeticos y de razonamiento paso a paso con un modelo de 2,67 mil millones de parametros.
- Prototipado de asistentes conversacionales en hardware modesto: con 2,67 mil millones de parametros, el checkpoint cabe en GPU de consumo para experimentacion, siempre que se use el codigo de 2DSD para respetar la regla de cache.
- Baseline para ajustes finos derivados: al estar bajo Apache-2.0 y conservar tokenizer y plantilla de chat del base, sirve como punto de partida para fine-tuning sobre dominios especificos manteniendo la regla de cache compartida.
- Docencia y divulgacion sobre modelos con bucles: permite explicar de forma tangible la diferencia entre profundidad de bucle y longitud de secuencia, y como afecta cada una a la cache KV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 2,67 mil millones de parametros en bf16 ocupan aproximadamente 5,3 GB de pesos, a lo que hay que sumar la cache KV y el estado del drafter; en cuantizaciones de 8 bits o 4 bits el peso baja aproximadamente a 2,7 GB y 1,4 GB respectivamente, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: el ajuste fino se realizo en cuatro H100; para inferencia no se especifican requisitos, pero el tamano permite GPU de consumo con VRAM suficiente.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 8-12 GB o mas de VRAM en bf16 y en tarjetas de 6-8 GB con cuantizacion, si bien no hay confirmacion oficial ni pesos GGUF publicados.
- Opciones de despliegue: el autor solo documenta el repositorio SqueezeAILab/2DSD (`scripts/generate.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el tag `custom_code` sugiere que la carga con `transformers` estandar puede no respetar la regla de cache compartida.
- Latencia y throughput: no disponibles; el beneficio de 2DSD es precisamente reducir el coste de decodificacion, pero la model card no incluye cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2DSD shared-KV target (este) | 2,67 mil millones | no disponible | Looped transformer (R = 4) con cache KV compartida, W = 64 | Apache-2.0 | Hugging Face, requiere codigo 2DSD |
| ByteDance/Ouro-2.6B-Thinking | 2,67 mil millones | no disponible | Looped transformer (R = 4) con atencion por bucle | Apache-2.0 (segun el modelo derivado) | Hugging Face |
| Alternativas de ~2-3 mil millones | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion relevante es frente al modelo base: misma arquitectura, mismo tokenizer y misma plantilla de chat, con la unica diferencia de la regla de comparticion de cache KV y el ajuste fino de una epoca sobre 128M tokens.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo listo para produccion: requiere el codigo de 2DSD para aplicar correctamente la regla de cache KV; cargarlo con `transformers` estandar puede producir resultados incorrectos.
- El ajuste fino se limita a una epoca y 128M tokens de OpenThoughts3, un volumen pequeno frente a los datos de preentrenamiento del base; el riesgo de degradacion en dominios fuera de esa distribucion no esta cuantificado.
- No se declaran idiomas soportados ni evaluaciones multilingues; el comportamiento fuera del ingles es incierto.
- No hay benchmarks publicados, por lo que no es posible verificar la preservacion de la calidad frente al modelo base mas alla de la afirmacion del autor.
- Riesgo de alucinacion inherente a un modelo de 2,67 mil millones de parametros con modo de razonamiento; no se documentan mitigaciones.
- Sesgos: no documentados por el autor.
- Longitud de contexto no especificada; no debe asumirse la del modelo base sin verificarla.
- Licencia Apache-2.0 permite uso comercial, pero el modelo deriva de ByteDance/Ouro-2.6B-Thinking y hereda sus condiciones; conviene revisar el `LICENSE` del repositorio.
- El repositorio tiene 157 descargas y 0 likes en el momento de la consulta: soporte comunitario practicamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minseo25/2dsd-ouro-2.6b-thinking-shared-kv
- Modelo base: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Codigo 2DSD: https://github.com/SqueezeAILab/2DSD
