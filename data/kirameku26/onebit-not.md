# kirameku26/OneBit-NOT

## Resumen

OneBit-NOT es un perceptron binario de una sola neurona y un unico bit entrenable, publicado por el usuario kirameku26 en Hugging Face bajo licencia MIT. No es un modelo de lenguaje ni una red neuronal diferenciable: implementa la tabla de verdad de la puerta logica NOT mediante una funcion de activacion escalon (step) y un peso binario que se aprende por busqueda discreta, sin retropropagacion. Su relevancia es exclusivamente didactica: sirve como ejemplo minimo reproducible de un parametro de 1 bit serializado en un byte y de su ejecucion mediante un grafo ggml en CPU.

El modelo no dispone de tokenizador, vocabulario, ventana de contexto ni capacidad de generacion de texto. El repositorio incluye codigo Python 3.10+ para entrenamiento e inferencia y un programa C++17 independiente basado en ggml que lee el mismo fichero `model.bin`. La precision reportada del 100% (2/2) corresponde al propio conjunto de entrenamiento, que coincide con el de evaluacion, y no constituye una afirmacion de generalizacion.

Dado su caracter de juguete educativo, no debe evaluarse con los criterios habituales de un modelo fundacional: no hay arquitectura transformer, no hay corpus de entrenamiento y no hay benchmarks publicados. La ficha se limita a documentar sus especificaciones reales y a marcar como no disponibles los apartados que no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron binario de una neurona con activacion escalon (`y = step(w * x + 0.5)`) |
| Parametros totales | 1 parametro entrenable (1 bit) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no procesa secuencias) |
| Tipos de cuantizacion | No disponible; el peso se almacena como 1 bit en 1 byte (`model.bin` de 1 byte) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `model.bin` binario propio de 1 byte; no safetensors ni GGUF |
| Entradas admitidas | Valores binarios {0, 1} |
| Salida | Valores binarios {0, 1} |
| Sesgo | Constante fija de 0.5, no entrenable |
| Dependencias de ejecucion | Python 3.10+ (inferencia Python); CMake 3.20+, compilador C++17 y ggml (inferencia C++) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es un perceptron de umbral clasico. El peso se parametriza como `w = 1 - 2 * weight_bit`, con `weight_bit` en {0, 1}, de modo que el unico bit entrenable codifica el signo del peso (+1 o -1). La activacion es `step(z) = 1 si z >= 0, 0 en caso contrario`, y el sesgo 0.5 es una constante fija elegida para que la funcion NOT sea representable en esta clase de hipotesis. El modelo parte de `weight_bit = 0` (w = +1) y el algoritmo de aprendizaje, de tipo discreto, invierte el bit unicamente si ello reduce el numero de errores sobre los dos ejemplos de entrenamiento; el optimo es `weight_bit = 1` (w = -1). No se emplea retropropagacion, descenso de gradiente, RLHF ni DPO.

Los datos de entrenamiento son la tabla de verdad completa de NOT: (0, 1) y (1, 0). El mismo conjunto se usa como evaluacion, con una precision reportada del 100% (2/2). No hay corpus de tokens, composicion de dataset ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La integracion con ggml construye el grafo `step(x*w + 0.5)` mediante operaciones de tensor y lo ejecuta en el backend CPU, expandiendo el bit a un tensor float32 temporal en tiempo de ejecucion; el autor advierte explicitamente que esto demuestra un parametro de 1 bit, no un uso de memoria de 1 bit para todo el runtime.

## Capacidades

- Computo de la puerta logica NOT sobre entradas binarias: `predict(0) == 1` y `predict(1) == 0`.
- Entrenamiento reproducible desde cero con `python/train.py`, que produce `model.bin`.
- Inferencia en Python mediante el modulo `python/model.py` (`OneBitNOT.load("model.bin")`).
- Inferencia en C++17 sobre CPU mediante el programa ggml `onebit-not-ggml`, que lee el mismo `model.bin`.
- Ejecucion sin dependencias de runtime mas alla de Python 3.10+ en la via Python.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesamiento de lenguaje natural.
- No dispone de modo thinking, vision ni audio.
- No se integra con la API `pipeline` de Transformers; debe cargarse con el modulo Python incluido.

## Casos de uso

- Docencia de fundamentos de redes neuronales: el modelo permite mostrar en una sola neurona la diferencia entre un perceptron de umbral y una red diferenciable, y observar como un unico bit entrenable basta para representar NOT.
- Demostracion de entrenamiento discreto sin retropropagacion: `train.py` ilustra un bucle de aprendizaje por busqueda sobre un espacio de hipotesis de dos elementos, util en cursos introductorios de aprendizaje automatico.
- Ejemplo minimo de serializacion de pesos: `model.bin` de 1 byte sirve para explicar el direccionamiento por bytes del almacenamiento y la diferencia entre tamano del parametro y tamano del fichero.
- Tutorial de integracion con ggml: el programa C++17 muestra como construir un grafo de computacion con operaciones de tensor y ejecutarlo en el backend CPU, sin usar llama.cpp ni su CLI.
- Prueba de humo de toolchains de compilacion: el proyecto CMake con C++17 y descarga de ggml desde `master` permite validar entornos de build en integracion continua de forma rapida.
- Material de referencia para pruebas de reproducibilidad: al ser un experimento de 1 bit con resultado determinista, es adecuado como caso de test en pipelines que verifiquen entrenamiento e inferencia de extremo a extremo.
- Ejemplo de empaquetado de un modelo educativo en Hugging Face: sirve para mostrar la estructura minima de un repositorio con codigo, licencia y fichero de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento es la precision sobre el conjunto de entrenamiento, que coincide con el de evaluacion:

| Metrica | Resultado | Conjunto |
|---|---|---|
| Precision | 100% (2/2) | Tabla de verdad NOT completa (entrenamiento = evaluacion) |

No hay datos de latencia ni de throughput medidos, aunque por la naturaleza del modelo (una operacion escalar) el coste computacional es despreciable frente al arranque del runtime.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y el peso ocupa 1 bit almacenado en 1 byte.
- GPU recomendadas: no aplica; no se requiere GPU.
- Compatibilidad con GPU de consumo: no aplica; no hay backend GPU en la informacion disponible.
- CPU: cualquier CPU capaz de ejecutar Python 3.10+ o un binario C++17 compilado con ggml.
- Opciones de despliegue: modulo Python incluido (`python/model.py`) y ejecutable ggml independiente (`onebit-not-ggml`); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Memoria en tiempo de ejecucion: el ejecutable y los tensores temporales de computo son mucho mayores que 1 bit, segun advierte el autor; el bit se expande a float32 en runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (perceptrones binarios educativos de un unico bit entrenable publicados en Hugging Face). Las alternativas habituales de la plataforma (modelos transformer de gran escala) no son comparables en parametros, contexto ni tarea.

## Limitaciones y advertencias

- Modelo de juguete disenado exclusivamente para la operacion NOT binaria; no soporta entradas reales ni operaciones logicas generales.
- No aprende representaciones; la clase de hipotesis y el sesgo fijo se eligieron a proposito para que el mapeo NOT fuera representable.
- La precision del 100% es sobre el conjunto de entrenamiento, que es identico al de evaluacion; no es una afirmacion de generalizacion.
- No se integra con la API `pipeline` de Transformers; requiere el modulo Python incluido o el ejecutable ggml.
- No es compatible con `llama-cli` ni con arquitecturas de llama.cpp.
- El build de CMake descarga la ultima version de ggml desde la rama `master`; para releases reproducibles debe fijarse `GIT_TAG` a un commit concreto, segun el propio autor.
- La integracion con ggml no se compilo contra una instalacion local de ggml en el entorno de empaquetado, segun la model card.
- El uso de memoria en runtime es muy superior a 1 bit: el ejecutable y los tensores temporales dominan el consumo.
- Sesgos conocidos y riesgo de alucinacion: no aplica en el sentido habitual, al no generar lenguaje; el unico riesgo es un uso indebido del modelo fuera de su dominio binario.
- Licencia MIT: permite uso comercial y modificacion con atribucion; no se identifican restricciones adicionales en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kirameku26/OneBit-NOT
- Repositorio del autor en Hugging Face (mismo identificador, incluye `python/`, `ggml/`, `CMakeLists.txt` y `model.bin`): https://huggingface.co/kirameku26/OneBit-NOT/tree/main
- ggml (dependencia descargada por CMake): https://github.com/ggerganov/ggml
- No se han encontrado en la informacion disponible papers, blogs, demos ni repositorios adicionales asociados al modelo.
