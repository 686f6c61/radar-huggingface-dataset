# mradermacher/OpenSparX-3b-cabin-intent-GGUF

## Resumen

OpenSparX-3b-cabin-intent-GGUF es una cuantización en formato GGUF del modelo multimodal OpenSparX-3b-cabin-intent, desarrollado originalmente por Qualcomm AI Hub y posteriormente convertido por mradermacher. El modelo base está construido sobre la arquitectura Qwen2.5-VL y ha sido afinado mediante supervisión (SFT) para la comprensión de intenciones en entornos de cabina, probablemente orientado a asistentes en vehículos, aviones u otros espacios cerrados. Soporta dos idiomas: chino e inglés.

La versión GGUF permite ejecutar el modelo en entornos de inferencia locales con requisitos de hardware reducidos, ofreciendo múltiples niveles de cuantización que van desde Q2_K hasta f16, además de archivos complementarios para el componente multimodal (mmproj). Con aproximadamente 3.400 millones de parámetros, se sitúa en la gama de modelos pequeños y eficientes, adecuados para despliegue en dispositivos con recursos limitados.

Su relevancia actual radica en la creciente demanda de asistentes inteligentes embebidos en cabinas de vehículos y aeronaves, donde la comprensión multimodal (visión + lenguaje) es clave para interpretar gestos, objetos y comandos de voz. Al estar licenciado bajo Apache-2.0, es libremente utilizable en aplicaciones comerciales sin restricciones de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal) |
| Parametros totales | 3.397.103.616 (~3,4 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj-Q8_0 y mmproj-f16 para el componente de vision |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (contenedor de cuantizacion); el modelo original usa safetensors |

## Arquitectura y entrenamiento

El modelo base OpenSparX-3b-cabin-intent se construye sobre la arquitectura Qwen2.5-VL, que combina un codificador de vision con un transformer de lenguaje para procesar entradas multimodales (imagenes y texto). El entrenamiento incluye una etapa de ajuste fino supervisado (SFT) especifica para la tarea de deteccion de intenciones en cabina, aunque no se han publicado detalles sobre el volumen de datos, la composicion del dataset ni las tecnicas de alineacion adicionales.

La version GGUF mantiene la misma arquitectura pero con pesos cuantizados para reducir el tamano y acelerar la inferencia en CPU o GPU de baja capacidad. Los archivos mmproj contienen el proyector multimodal que permite al modelo procesar imagenes junto con texto. No se dispone de informacion sobre innovaciones tecnicas especificas mas alla de las inherentes a Qwen2.5-VL.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto simultaneamente, lo que permite interpretar escenas visuales junto con instrucciones verbales.
- Generacion de texto en chino e ingles, con comprension de comandos y preguntas en ambos idiomas.
- Especializacion en intenciones de cabina: disenado para reconocer y responder a solicitudes tipicas en entornos de vehiculos, aeronaves u otros espacios cerrados (por ejemplo, ajuste de climatizacion, navegacion, control de multimedia).
- Inferencia eficiente gracias a las cuantizaciones GGUF, permitiendo ejecucion en hardware modesto.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Asistente de voz en vehiculos: el modelo puede interpretar comandos hablados combinados con imagenes de la cabina (por ejemplo, detectar que el conductor senala un boton) y ejecutar acciones como ajustar la temperatura o reproducir musica.
- Sistemas de infoentretenimiento en aeronaves: comprension de solicitudes de pasajeros en chino o ingles, con capacidad de reconocer gestos o objetos mostrados en una pantalla.
- Control de cabina en maquinaria industrial: en entornos como cabinas de gruas o excavadoras, el modelo puede procesar comandos verbales y visuales para operar equipos de forma segura.
- Asistentes para personas con movilidad reducida: interpretacion de senales visuales y vocales para controlar dispositivos en el hogar o en vehiculos adaptados.
- Pruebas de concepto en edge AI: al ser un modelo pequeno y cuantizado, es adecuado para prototipos en Raspberry Pi, Jetson Nano u otros dispositivos de bajo consumo.
- Desarrollo de aplicaciones multilingues: gracias a su soporte para chino e ingles, puede integrarse en sistemas de atencion al cliente o guias turisticas que requieran comprension de imagenes y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la cuantizacion, entre 1,5 GB (Q2_K) y 6,9 GB (f16). La mayoria de las cuantizaciones recomendadas (Q4_K_M, Q4_K_S) ocupan alrededor de 2,2 GB, por lo que caben en GPUs con 4 GB de memoria.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) o incluso CPUs con instrucciones AVX2, gracias a la eficiencia de los formatos GGUF.
- Si cabe en consumer GPU: si, la mayoria de las cuantizaciones son adecuadas para tarjetas graficas de gama media.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier runtime compatible con GGUF. Tambien se puede usar el modelo original en safetensors con Transformers y vLLM, aunque la version GGUF esta pensada para entornos sin dependencias pesadas.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la cuantizacion elegida; en una GPU de 8 GB se esperan velocidades de decodificacion de decenas de tokens por segundo, pero sin datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con otros modelos de la misma categoria. El modelo base es una variante de Qwen2.5-VL de 3B, pero no se conocen modelos equivalentes con especializacion en intenciones de cabina. Se recomienda evaluar el modelo en el contexto especifico de la aplicacion deseada.

## Limitaciones y advertencias

- La cuantizacion puede degradar ligeramente la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generacion de codigo. Se recomienda usar cuantizaciones de mayor precision (Q8_0 o f16) si la memoria lo permite.
- El modelo esta especializado en intenciones de cabina y puede no generalizar bien fuera de ese dominio.
- La longitud de contexto no se ha especificado; es probable que sea la estandar de Qwen2.5-VL (alrededor de 32k tokens), pero no se confirma.
- No se han publicado evaluaciones de sesgos o alucinaciones. Al ser un modelo afinado con datos limitados, podria presentar sesgos en escenarios no cubiertos por su entrenamiento.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base de Qualcomm AI Hub podria tener restricciones adicionales; se recomienda revisar los terminos de uso del modelo original.
- El repo GGUF no incluye documentacion sobre el proceso de cuantizacion ni sobre la calidad de las distintas versiones; se aconseja probar varias cuantizaciones para determinar la adecuada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OpenSparX-3b-cabin-intent-GGUF
- Modelo base (Qualcomm AI Hub): https://huggingface.co/qualcomm-ai-hub-community/OpenSparX-3b-cabin-intent
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
