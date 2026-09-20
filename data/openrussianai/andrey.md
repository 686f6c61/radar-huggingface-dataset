# OpenRussianAI/andrey

## Resumen

Andrey es un modelo de generacion de texto en ruso desarrollado por OpenRussianAI, publicado en HuggingFace con licencia MIT. Se presenta como un chatbot ligero construido sobre una arquitectura propia denominada EasyFormer, que por fuera es un transformer decoder-only clasico pero con simplificaciones orientadas a velocidad: atencion de una sola cabeza, RMSNorm, FFN de expansion x2 con ReLU y weight tying entre la cabeza de salida y el embedding de tokens. El modelo tiene aproximadamente 1,5 millones de parametros, 5 capas y una dimension de modelo de 192, con un tokenizador a nivel de caracter de 64 simbolos.

Su relevancia no proviene de capacidades de razonamiento ni de competicion con modelos frontier, sino de su caracter didactico y de su huella minima: ocupa unos 6 MB, se entrena en minutos sobre una sola Tesla T4 (en concreto, 8,5 minutos) y puede ejecutarse en CPU sobre practicamente cualquier dispositivo. Esto lo convierte en un banco de pruebas util para validar pipelines de transformers con codigo personalizado (requiere trust_remote_code=True), probar despliegues en entornos embebidos o ilustrar conceptos de tokenizacion char-level y memorizacion en datasets diminutos.

El contexto de la model card deja claro que se trata de un artefacto experimental y no de un asistente de produccion: se entreno sobre 162 dialogos (unos 7.000 tokens) durante 100 epocas, alcanzando un loss final de 0,056. El propio autor advierte que la ventana de contexto es de 128 tokens, que no mantiene historial entre peticiones y que el modelo basicamente reproduce plantillas aprendidas, sin capacidad de calcular, traducir, programar o razonar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (EasyFormer): single-head attention, RMSNorm, FFN x2 con ReLU, weight tying |
| Parametros totales | ~1,5 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | PyTorch bin (pytorch_model.bin) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Capas | 5 |
| d_model | 192 |
| Cabezas de atencion | 1 (single-head) |
| Normalizacion | RMSNorm |
| Tokenizador | Char-level, vocabulario de 64 simbolos |
| Tamano en disco | ~6 MB |
| Libreria | transformers (custom_code) |

## Arquitectura y entrenamiento

EasyFormer es un transformer decoder-only simplificado. Las decisiones de diseno documentadas son: atencion de una sola cabeza (en lugar de multi-head), normalizacion RMSNorm, red feed-forward con factor de expansion x2 y activacion ReLU, y weight tying entre la cabeza de lenguaje (lm_head) y el embedding de tokens (tok_emb). La combinacion reduce el numero de parametros y hace viable tanto el entrenamiento como la inferencia en CPU. El tokenizador es a nivel de caracter sobre un vocabulario de 64 simbolos, lo que evita dependencias de tokenizadores externos tipo BPE o SentencePiece, pero limita la calidad en palabras fuera de vocabulario (aparecen erratas con facilidad).

El entrenamiento es extremadamente reducido: 162 dialogos, aproximadamente 7.000 tokens, 100 epocas, batch de 32, optimizador AdamW con learning rate 3e-3, sobre una Tesla T4 (CUDA), con un tiempo total de unos 8,5 minutos y un loss final de 0,056. No se menciona en la informacion disponible ninguna fase de RLHF, DPO, SFT posterior ni decodificacion especulativa. Tampoco se detalla la composicion del dataset mas alla de la etiqueta "custom" y del numero de dialogos.

## Capacidades

- Generacion de texto conversacional en ruso sobre un dominio muy acotado: saludos, respuestas cortas de cortesia y algunas preguntas sobre el propio modelo.
- Respuestas plantilla: la model card muestra ejemplos como "привет" respondido con "привет, рад тебя видеть" o "как дела" con "хорошо, готов помочь".
- Generacion con muestreo configurable: la API de ejemplo admite temperature, top_k y max_new_tokens.
- Soporte de tool calling / function calling: no disponible (no documentado, y fuera del alcance del modelo).
- Soporte de agentes o razonamiento multi-paso: no disponible; el autor indica explicitamente que el modelo no razona.
- Capacidades multilingues: solo ruso (etiqueta de idioma "ru").
- Capacidad especial de thinking mode, vision o audio: no disponible.
- Ejecucion en CPU: confirmada en los ejemplos de la model card.
- Integracion con transformers mediante codigo personalizado (trust_remote_code=True).

## Casos de uso

- Banco de pruebas de codigo personalizado en transformers: sirve para validar flujos de carga con trust_remote_code=True y ficheros modeling_easyformer.py / configuration_easyformer.py antes de aplicarlos a modelos mayores.
- Docencia de arquitecturas transformer: con 5 capas, d_model 192 y single-head, es un ejemplo manejable para explicar en aula como funciona un decoder-only sin la complejidad de un modelo grande.
- Pruebas de tokenizacion char-level: permite experimentar con vocabularios minimos de 64 simbolos y observar sus limitaciones en generacion (erratas, palabras fuera de vocabulario).
- Validacion de pipelines de despliegue en edge: con 6 MB, se puede empaquetar en contenedores minimos, Raspberry Pi o entornos con restricciones severas de memoria para comprobar el ciclo completo de carga e inferencia.
- Benchmarks de latencia en CPU: util como carga de trabajo trivial para comparar frameworks de inferencia o medir overhead de arranque en distintos entornos, aunque no se publican cifras de throughput.
- Fine-tuning de juguete en nuevos idiomas o dominios: su tamano permite reentrenarlo en minutos y usarlo como ejercicio para reproducir el pipeline completo (dataset, entrenamiento, evaluacion cualitativa).
- Demo offline de chatbot en ruso: para prototipos donde solo se necesitan respuestas de cortesia predecibles sin coste de infraestructura.
- Estudio de memorizacion frente a generalizacion: con 162 dialogos y 100 epocas, es un caso claro para analizar como un modelo pequeno memoriza el dataset en lugar de generalizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta el loss final de entrenamiento (0,056), que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en fp32; el modelo ocupa aproximadamente 6 MB en disco.
- GPU recomendadas: cualquiera; el autor entreno con una Tesla T4. No se requieren GPU de gama alta (A100, H100) ni justifican su uso.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer, incluidas las mas modestas, y tambien en CPU.
- Despliegue: carga directa mediante transformers con AutoModelForCausalLM y trust_remote_code=True. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y no hay pesos en formato GGUF.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el entrenamiento (~8,5 minutos en Tesla T4) y el uso de generacion con max_new_tokens=40, temperature=0,6 y top_k=20 en los ejemplos.
- Formatos de pesos: pytorch_model.bin (PyTorch); no hay safetensors ni GGUF en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La busqueda web realizada no devolvio resultados relacionados con el modelo ni con alternativas de su categoria (los resultados obtenidos correspondian a contenidos no relacionados, lecciones de historia en polaco). Por tanto, la comparativa con alternativas de parametros similares, mismo idioma o misma tarea se marca como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenRussianAI/andrey | ~1,5 M | 128 tokens | No disponible (solo loss de entrenamiento) | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgo.
- Riesgo de alucinacion: alto en apariencia de fluidez, pero en la practica el modelo solo reproduce plantillas de las 162 frases del dataset; el autor lo reconoce explicitamente.
- Contexto muy limitado: 128 tokens, suficiente para una unica replica; no conserva historial entre peticiones.
- Cobertura idiomatica: solo ruso; no soporta castellano ni otros idiomas.
- Tokenizacion char-level: produce erratas en palabras no vistas durante el entrenamiento.
- Capacidades ausentes: el autor indica que no sabe calcular, traducir, escribir codigo ni razonar.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion; no obstante, la utilidad practica en produccion es muy limitada.
- Caveat de produccion: requiere trust_remote_code=True, lo que implica ejecutar codigo Python del repositorio (modeling_easyformer.py, configuration_easyformer.py); conviene auditar dicho codigo antes de desplegarlo en entornos controlados.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, y tamano de repo de 0,0 GB segun los metadatos (el modelo en si ocupa ~6 MB), lo que apunta a un artefacto experimental sin validacion por parte de la comunidad.
- Fechas de publicacion: los metadatos indican creacion el 2026-09-20 y actualizacion el 2026-09-20; no se dispone de mas contexto sobre esa cronologia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenRussianAI/andrey
- Repositorio base referenciado en los metadatos: https://huggingface.co/OpenRussianAI/andrey
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
