# dollarland/dolyzer-gemma-models

## Resumen

Dolyzer Gemma Models es un repositorio de redistribucion mantenido por Dolyzer que aloja variantes de la familia Gemma de Google, en formatos cuantizados y convertidos (GGUF y MediaPipe/LiteRT `.task`) pensados para inferencia en dispositivo movil. No se trata de un modelo entrenado por el autor, sino de un canal de distribucion de pesos originales de Google adaptados para su uso dentro de la aplicacion Dolyzer Mobile AI, que opera de forma offline tras la descarga inicial.

El repositorio declara como unico modelo previsto de momento Gemma 2 2B Instruct en cuantizacion Q4_K_M y formato GGUF, con estado "pendiente de subida y verificacion". El dato de parametros reportado por safetensors es de 2.614.341.888 (2,6 mil millones), coherente con el tamano de Gemma 2 2B, y el repositorio ocupa 1,7 GB. La model card es fundamentalmente un documento de gobernanza: atribucion a Google, requisitos de licencia Gemma, avisos de modificacion y procedencia.

Su relevancia es practica para desarrolladores moviles: ofrece un punto de descarga de pesos Gemma ya cuantizados para ejecucion local, con indicaciones explicitas sobre que motor de inferencia requiere cada formato (GGUF frente a MediaPipe/LiteRT, no intercambiables). No aporta mejoras de arquitectura ni datos de entrenamiento propios; cualquier evaluacion tecnica del modelo debe remitirse a la documentacion oficial de Gemma 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2 de Google; no se detalla en el repositorio) |
| Parametros totales | 2.614.341.888 (segun safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en el repositorio (depende de la variante Gemma 2 subyacente) |
| Tipos de cuantizacion | Q4_K_M declarada para Gemma 2 2B Instruct; otras no disponibles |
| Idiomas soportados | en |
| Licencia | Gemma Terms of Use (Google), no Apache 2.0 |
| Formato de pesos | GGUF y MediaPipe/LiteRT `.task` (segun disponibilidad y compatibilidad) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Los pesos proceden de Google y corresponden a la familia Gemma; la unica variante documentada es Gemma 2 2B Instruct. La model card no aporta detalles de arquitectura (numero de capas, dimension oculta, mecanismo de atencion, uso de atencion alternada local/global, etc.), ni datos sobre el corpus de entrenamiento, numero de tokens, composicion del dataset o fases de alineacion (RLHF/DPO). Cualquier dato de este tipo debe consultarse en la documentacion oficial de Gemma 2.

La contribucion tecnica del repositorio es la conversion y cuantizacion para despliegue movil: cuantizacion Q4_K_M para GGUF y conversion a `.task` para MediaPipe/LiteRT. La propia model card advierte que la cuantizacion reduce almacenamiento y memoria pero puede afectar a calidad, rendimiento y compatibilidad, y que los ficheros modificados deben llevar avisos de modificacion y documentacion de procedencia. No se documentan innovaciones como decodificacion especulativa, atencion lineal ni tecnicas de inferencia optimizada mas alla de lo que aporte el runtime de destino.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 2 2B Instruct.
- Instrucciones y respuesta a prompts en formato chat (variante Instruct).
- Ejecucion totalmente local en dispositivo tras la descarga, sin conexion a red.
- Soporte de dos rutas de inferencia segun formato: GGUF (requiere motor GGUF compatible) y MediaPipe `.task` (requiere runtime MediaPipe/LiteRT).
- Descarga y almacenamiento controlados por el usuario dentro de la aplicacion Dolyzer, con verificacion de integridad.
- Versionado de modelos y previsión de actualizaciones futuras.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponible en la informacion proporcionada.
- Multilingue: limitado a ingles segun el campo `language` del repositorio.

## Casos de uso

- Asistente conversacional offline en aplicaciones moviles: el modelo se descarga una vez y responde localmente sin conexion, adecuado para escenarios con conectividad intermitente o requisitos de privacidad en los que el texto no debe salir del dispositivo.
- Procesamiento de texto privado en el telefono: resumenes, reescritura o clasificacion de notas y mensajes sin enviar datos a un servidor, apoyandose en la ejecucion local del runtime MediaPipe/LiteRT o GGUF.
- Integracion en aplicaciones Android mediante MediaPipe/LiteRT: el formato `.task` permite empaquetar el modelo en el flujo de inferencia de Google para movil, simplificando el despliegue en dispositivos compatibles.
- Prototipado rapido con GGUF en escritorio y movil: usar la variante Q4_K_M con motores GGUF compatibles para validar prompts y comportamiento antes de integrar la version `.task` en produccion.
- Generacion de texto en entornos con recursos limitados: con 2,6 mil millones de parametros y cuantizacion Q4_K_M, el modelo esta pensado para caber en la memoria de telefonos de gama media-alta, segun la model card.
- Base para aplicaciones de demostracion o educativas: al ser un repositorio pequeno (1,7 GB) con licencia Gemma claramente documentada, sirve para mostrar el flujo completo de descarga, verificacion y ejecucion local de un LLM en un dispositivo.
- Distribucion de contenido asistido por IA en apps de terceros: siempre que se cumplan los terminos Gemma, se puede reutilizar el flujo de descarga y activacion descrito para ofrecer funciones de generacion de texto dentro de otra aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (MMLU, HumanEval, GSM8K u otras) ni datos de latencia o throughput. Tampoco se documentan pruebas de rendimiento por dispositivo, mas alla de la advertencia generica de que el rendimiento varia segun dispositivo, memoria, procesador y longitud de contexto.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explicita. El repositorio ocupa 1,7 GB y la model card advierte que el uso de memoria en tiempo de ejecucion puede superar el tamano del fichero del modelo.
- GPU recomendadas: no disponible. El enfoque es inferencia en dispositivo movil (CPU/GPU/NPU del telefono segun el runtime), no en GPU de servidor.
- Compatibilidad con GPU de consumo: no se documenta. El modelo esta orientado a telefonos compatibles, y la model card indica que no todos los modelos son compatibles con todos los telefonos ni con todos los runtimes.
- Opciones de despliegue: motores GGUF compatibles para los ficheros GGUF; runtime MediaPipe/LiteRT para los ficheros `.task`. La model card subraya que ambos formatos no son intercambiables. No se mencionan vLLM, TGI, llama.cpp ni Ollama de forma explicita.
- Latencia y throughput: no disponible. Dependen del dispositivo, del runtime y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en este repositorio, por lo que la comparacion se limita a caracteristicas declaradas. Las alternativas se indican a partir de conocimiento general de la familia Gemma; los datos de terceros no proceden de la informacion proporcionada y deben verificarse en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dolyzer Gemma 2 2B Instruct (este repositorio) | 2,6 mil millones | no disponible | GGUF Q4_K_M, `.task` | Gemma Terms of Use | Repositorio de redistribucion; modelo marcado como pendiente de subida |
| Gemma 2 2B Instruct (Google, oficial) | 2,6 mil millones | no disponible en esta ficha | safetensors y variantes oficiales | Gemma Terms of Use | Hugging Face y Kaggle oficiales |
| Gemma 2 9B Instruct (Google, oficial) | 9 mil millones | no disponible en esta ficha | safetensors y variantes oficiales | Gemma Terms of Use | Hugging Face y Kaggle oficiales |
| Modelos moviles de ~2-3B en GGUF (otros autores) | ~2-3 mil millones | variable | GGUF | variable | variable |

La diferencia practica de este repositorio frente al Gemma oficial es la cuantizacion movil y el empaquetado para MediaPipe/LiteRT; la diferencia frente a otros GGUF de ~2-3B es la licencia Gemma y el enfoque offline-first en aplicacion movil.

## Limitaciones y advertencias

- El unico modelo documentado figura como "pendiente de subida y verificacion"; no hay confirmacion en la informacion proporcionada de que los pesos esten disponibles y verificados.
- La licencia es Gemma Terms of Use, no Apache 2.0: impone obligaciones de uso, modificacion, redistribucion, avisos y usos prohibidos (Prohibited Use Policy). Las distribuciones deben incluir el acuerdo completo, el aviso requerido y las restricciones exigibles.
- Cada generacion de Gemma puede tener terminos distintos; cualquier modelo anadido debe revisarse contra su licencia aplicable antes de distribuirlo.
- La cuantizacion Q4_K_M puede degradar la calidad respecto a los pesos originales en precision completa.
- El modelo solo declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Riesgo de respuestas inexactas, incompletas o inapropiadas, reconocido explicitamente en la model card.
- El uso de memoria en ejecucion puede superar el tamano del fichero; en telefonos con RAM limitada puede provocar cierres o degradacion.
- Compatibilidad dependiente del dispositivo y del runtime: no todos los telefonos soportan todos los modelos, y los formatos GGUF y `.task` no son intercambiables.
- Dolyzer no esta afiliado, patrocinado ni respaldado por Google; no reclama la propiedad de las arquitecturas ni de los pesos originales.
- No se documentan sesgos especificos ni evaluaciones de seguridad propias de esta redistribucion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dollarland/dolyzer-gemma-models
- Google Gemma: https://ai.google.dev/gemma
- Gemma en Hugging Face: https://huggingface.co/google
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos: https://ai.google.dev/gemma/prohibited_use_policy
