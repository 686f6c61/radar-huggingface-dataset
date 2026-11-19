# mconcat/statescope-qwen3.5-0.8b

## Resumen

StateScope Qwen3.5-0.8B es un conjunto de diccionarios de interpretabilidad por capa publicados por el usuario mconcat para el modelo base Qwen/Qwen3.5-0.8B. No es un modelo generativo nuevo ni un fine-tune convencional: es un paquete de pesos y configuraciones que descompone el flujo residual y las subcapas MLP de cada una de las 24 capas del transformer en unidades nombradas y manipulables. El repositorio ocupa 29,4 GB (27,4 GiB declarados en la model card) distribuidos en 146 archivos.

La propuesta es de analisis mecanicista: cada capa dispone de un diccionario de estado que representa el flujo residual como una combinacion dispersa de grupos de direcciones (24 activos de 16.384 por token) y de un diccionario MLP que expresa la salida de la capa como suma de 3.968 transformaciones lineales con compuerta. Esto permite reconstruir activaciones internas, identificar que unidades se activan ante un token concreto y editar coordenadas o compuertas para decodificar vectores modificados.

Su relevancia es metodologica: ofrece una via reproducible para seguir cadenas de computo entre capas con unidades con nombre, como demuestra el ejemplo de conteo de linea, y publica las herramientas de lectura y verificacion junto a los pesos. Esta etiquetado como base_model de Qwen/Qwen3.5-0.8B, lo que implica que el modelo base debe descargarse por separado bajo su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diccionarios de interpretabilidad sobre transformer Qwen3.5-0.8B (24 capas); subcapas GatedDeltaNet y atencion |
| Parametros totales | no disponible (el paquete contiene 144 archivos de pesos y configuracion, no un modelo unico) |
| Parametros activos | no aplica (no es MoE); 24 de 16.384 grupos de estado activos por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (weights.safetensors, usage.safetensors, postnorm.safetensors) y JSON/YAML de configuracion |

## Arquitectura y entrenamiento

El paquete no entrena un modelo de lenguaje: entrena diccionarios sobre las activaciones de Qwen3.5-0.8B. Para cada una de las 24 capas se publica un diccionario de estado con dos sitios residuales (resid_mid y resid_post) y un diccionario MLP. El diccionario de estado codifica el flujo residual como combinacion dispersa de grupos de direcciones (24 activos de 16.384 por token) y el diccionario MLP descompone la salida de la capa en 3.968 transformaciones gated, donde la compuerta modula cuando y con que intensidad actua cada una. Se incluyen tensores de decoder y encoder, sesgo de decoder, medias y escalas por sitio.

Los archivos de configuracion recogen la forma del diccionario, los sitios, tamanos y opciones de entrenamiento, y MANIFEST.json conserva hashes, registros de entrenamiento y el sha256 original de las configuraciones. El conjunto se entreno con una unica semilla y no incluye diccionarios de mezclador (mixer), es decir, no descompone las subcapas GatedDeltaNet ni de atencion. Los entrenadores no estan publicados y los datos de evaluacion tampoco, por lo que no es posible reproducir el entrenamiento ni las mediciones exactas reportadas.

## Capacidades

- Reconstruccion de activaciones internas por capa a partir de los grupos de estado activos, con el sitio resid_post y resid_mid.
- Aproximacion de la salida MLP mediante suma de transformaciones con compuerta, con salida de compuertas por token de forma (tokens, 3968).
- Inspeccion de que transformaciones se activan ante un token y que aporta cada una a la salida de la capa.
- Edicion controlada: modificar el codigo (coordenadas) de un grupo o la compuerta de una transformacion y decodificar de vuelta a vectores.
- Seguimiento de cadenas de computo entre capas a traves de unidades con nombre, incluida la atribucion de senal a cabezas concretas del mezclador.
- Verificacion de integridad del release mediante demo/verify_release.py y reproduccion del experimento de conteo de linea con demo/line_count.py.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente por si mismo; depende del modelo base Qwen3.5-0.8B.

## Casos de uso

- Analisis de circuitos de conteo y formato: replicar el experimento de salto de linea para estudiar como el modelo mide la longitud de la linea actual y decide el salto, usando la cadena documentada entre la transformacion 189 de la capa 8, el grupo de estado 11586 y la cabeza 10 de la capa 9.
- Auditoria de representaciones internas: reconstruir resid_post y resid_mid en frases de dominio especifico para comprobar que direcciones del flujo residual transportan senales concretas antes de desplegar el modelo en produccion.
- Edicion de comportamiento dirigida: alterar coordenadas de un grupo de estado o compuertas de transformaciones y medir el efecto en la preferencia del modelo, como en el ejemplo publicado donde intercambiar una sola transformacion reproduce 0,328 del cambio medio y todo el MLP de la capa reproduce 0,353.
- Investigacion de interpretabilidad comparada: usar los contadores de uso (fire, n_tokens, use) para estudiar tasas de seleccion de grupos por sitio y detectar unidades infrautilizadas o saturadas.
- Docencia y formacion tecnica: el lector en Python y el script de demostracion permiten montar practicas reproducibles de analisis mecanicista sobre un modelo de 0,8B en una sola GPU consumer.
- Validacion de herramientas de interpretabilidad: servir como referencia publica con hashes y manifiesto para comprobar la correccion de lectores y decodificadores propios antes de aplicarlos a modelos mayores.
- Diagnostico de subcapas MLP: descomponer la contribucion de la MLP capa a capa para localizar transformaciones responsables de comportamientos especificos y priorizar intervenciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta mediciones internas del experimento de conteo de linea: el intercambio de la contribucion de la primera transformacion a traves del mezclador reproduce 0,328 del cambio medio en la preferencia entre salto de linea y espacio, frente a 0,353 al intercambiar toda la salida MLP de la capa 8. El script demo/line_count.py vuelve a medir esta cadena en menos de dos minutos en una RTX 5090.

## Requisitos de hardware

- Almacenamiento: aproximadamente 27,4 GiB para los 146 archivos del release, mas el modelo base Qwen3.5-0.8B descargado por separado.
- VRAM: no disponible de forma oficial; la model card solo confirma ejecucion del lector y la demostracion en una RTX 5090 con el modelo base en bfloat16 y device_map="cuda".
- GPU recomendadas: RTX 5090 como referencia documentada; cualquier GPU con VRAM suficiente para el modelo base de 0,8B en bfloat16 mas los diccionarios de la capa en uso.
- GPU consumer: si, el modelo base de 0,8B y los diccionarios por capa estan pensados para ejecutarse en una unica GPU consumer; no se especifica el minimo exacto.
- Despliegue: carga mediante transformers (AutoModelForCausalLM, AutoTokenizer) y el lector statescope.reader (StateVocab, PublicMolt, capture); no se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; la unica cifra publicada es que demo/line_count.py se ejecuta en menos de dos minutos en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StateScope Qwen3.5-0.8B | Diccionarios de interpretabilidad por capa | no disponible (144 archivos de pesos) | no disponible | MIT | Hugging Face y GitHub (mconcat/statescope) |
| Qwen/Qwen3.5-0.8B | Modelo de lenguaje base | 0,8B (segun denominacion) | no disponible | no disponible en la informacion | Hugging Face |
| Alternativas de interpretabilidad comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros paquetes de diccionarios por capa equivalentes para establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Cobertura limitada a un unico modelo (Qwen3.5-0.8B) y a una unica semilla de entrenamiento de los diccionarios.
- No incluye diccionarios de mezclador: no descompone las subcapas GatedDeltaNet ni de atencion, solo el flujo residual y la MLP.
- La tarea evaluada no establece ventaja frente a neuronas (unidades MLP individuales), segun reconoce el propio autor.
- Entrenadores no publicados y datos de evaluacion no publicados: no es posible reproducir el entrenamiento ni las mediciones exactas reportadas.
- Todas las comparaciones se realizaron en una sola maquina con una RTX 5090, sin datos de escalado a otros entornos.
- El modelo base no se redistribuye y debe cargarse bajo su propia licencia, independiente de la MIT de este paquete.
- El lector de la rama principal solo sirve para la forma publicada; el diseno anterior y su lector estan en la rama earlier-design y no entrenaron estos pesos.
- No es un modelo generativo: no debe emplearse como sustituto del modelo base para tareas de texto, codigo o agentes.
- Riesgo de alucinacion y sesgos: no aplica directamente al paquete, pero cualquier interpretacion derivada hereda los sesgos del modelo base subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mconcat/statescope-qwen3.5-0.8b
- Codigo, lector y herramientas: https://github.com/mconcat/statescope
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
