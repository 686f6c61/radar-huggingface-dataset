# DireDreadlord/Chaturanga-Pro

## Resumen

Chaturanga-Pro es un modelo de lenguaje de pequeno tamano (SLM) especializado en la generacion de jugadas de ajedrez en notacion algebraica (SAN) mediante lenguaje natural. Lo desarrolla DireDreadlord y deriva de SupraLabs/Supra2-100M-Base, un modelo base de la familia Supra2, sobre el que se ha realizado un ajuste fino supervisado con aproximadamente 600.000 filas del dataset mlabonne/chessllm. El resultado es un modelo de 100,7 millones de parametros disenado para emitir movimientos legales y coherentes con la posicion, con una huella de memoria minima.

Su relevancia radica en que demuestra que un modelo de apenas 100 millones de parametros, entrenado con un presupuesto de computo muy reducido (7.000 pasos sobre una RTX 3050 de 4 GB), puede abordar una tarea estructurada como la generacion de jugadas de ajedrez. Esto lo convierte en un caso de estudio util para investigadores interesados en SLM, ajuste fino de bajo coste y evaluacion de alucinaciones en dominios con reglas estrictas. La arquitectura declarada es de tipo Llama, con licencia Apache 2.0 y pesos en formato safetensors.

El modelo se distribuye como una variante "Pro" dentro de una familia que el autor describe con cinco tamanos (Nano, Neo, Mini, Pro y Ultra). El uso previsto es experimental, orientado a ajedrez y a la integracion en una interfaz grafica incluida en el repositorio (chaturanga_gui.py).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (declarada en la model card) |
| Parametros totales | 100.684.032 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card declara una arquitectura de tipo Llama, con aproximadamente 100 millones de parametros, derivada de SupraLabs/Supra2-100M-Base. No se especifican en la informacion disponible detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto maxima. El ajuste fino se realizo sobre 600.000 filas del dataset mlabonne/chessllm, con las partidas templadas en notacion algebraica (SAN), durante 7.000 pasos y sobre una unica GPU RTX 3050 con 4 GB de VRAM. No se documentan tecnicas de RLHF, DPO ni innovaciones de decodificacion.

El planteamiento de entrenamiento es de ajuste fino supervisado de bajo coste sobre un modelo base ya preentrenado, lo que explica el tamano reducido del repositorio (0,4 GB) y la orientacion experimental del resultado. No hay informacion publica sobre la composicion exacta del corpus mas alla del dataset citado, ni sobre el numero total de tokens vistos durante el preentrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a la tarea de ajedrez.
- Generacion de jugadas de ajedrez en notacion algebraica (SAN) a partir de lenguaje natural.
- Produccion de movimientos mayoritariamente legales, segun declara el autor, con capacidad de emitir jugadas "mas completas y no ilogicas" que la variante Mini de 50M.
- Integracion con una interfaz grafica de ajedrez incluida en el repositorio (chaturanga_gui.py).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.

## Casos de uso

- Prototipado de motores de ajedrez basados en lenguaje natural: el modelo permite experimentar con la generacion de jugadas en SAN sin necesidad de un motor clasico, usando una GPU de gama baja o CPU.
- Educacion y divulgacion: puede emplearse en demostraciones sobre como un SLM aborda un dominio con reglas formales y donde las alucinaciones se detectan facilmente mediante validacion de legalidad.
- Investigacion sobre alucinacion en dominios estructurados: al ser un modelo de 100M con alta tasa potencial de jugadas ilegales, sirve como banco de pruebas para metodos de verificacion y correccion de salidas.
- Integracion en interfaces interactivas de ajedrez: el script chaturanga_gui.py incluido permite montar una GUI de juego local con el modelo como generador de jugadas.
- Evaluacion comparativa de variantes de una familia: al existir versiones Nano, Neo, Mini, Pro y Ultra, permite medir el efecto del tamano sobre la legalidad y coherencia de las jugadas.
- Despliegue en entornos con recursos muy limitados: con 100M de parametros y pesos safetensors de 0,4 GB, puede ejecutarse en portatiles y dispositivos sin GPU dedicada para pruebas de concepto.
- Generacion de datos sinteticos de ajedrez para experimentos de ajuste fino o evaluacion de parsers de SAN, siempre con validacion posterior de legalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 100,7 millones de parametros; en precision completa (fp32) son aproximadamente 0,4 GB de pesos, en fp16 alrededor de 0,2 GB y en cuantizaciones de 8 bits o 4 bits por debajo de 0,15 GB. La VRAM efectiva depende tambien del contexto y del runtime, dato no disponible.
- GPU recomendadas: el autor entreno el modelo en una RTX 3050 de 4 GB, por lo que GPUs consumer de gama baja son suficientes para inferencia. No se especifican recomendaciones adicionales.
- Cabe en GPU consumer: si, en tarjetas con 4 GB o mas, y previsiblemente en muchas integradas.
- Opciones de despliegue: el repositorio incluye `chaturanga_gui.py`; los tags mencionan text-generation-inference. No se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI mas alla del tag.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chaturanga-Pro | 100,7 M | no disponible | Ajedrez en SAN | Apache 2.0 | Hugging Face |
| SupraLabs/Supra2-100M-Base | ~100 M | no disponible | Base de texto | no disponible en la informacion | Hugging Face |
| Chaturanga Mini (variante del autor) | ~50 M | no disponible | Ajedrez en SAN | Apache 2.0 (segun familia) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo tiene 100 millones de parametros, por lo que pueden producirse alucinaciones y jugadas ilegales, tal como advierte el autor.
- Uso experimental unicamente; no esta pensado como motor de ajedrez de produccion ni como sustituto de motores clasicos.
- Idioma limitado al ingles segun los metadatos del repositorio.
- No se documenta la longitud de contexto, lo que impide garantizar el manejo de partidas largas o historiales extensos.
- Riesgo de sesgo derivado del dataset mlabonne/chessllm, cuya composicion y cobertura de aperturas, niveles de juego y estilos no se detalla en la informacion disponible.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la propia model card restringe el uso previsto a fines experimentales; conviene validar la legalidad de cada jugada antes de cualquier aplicacion real.
- No se documentan cuantizaciones oficiales ni garantias de compatibilidad con runtimes concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DireDreadlord/Chaturanga-Pro
- Modelo base: https://huggingface.co/SupraLabs/Supra2-100M-Base
- Coleccion de la familia Supra2: https://huggingface.co/collections/SupraLabs/supra2
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/chessllm
