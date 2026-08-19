# 26B-Suite/Plainspeak-Dial-Gemma-4-26B-A4B-BakeVector

## Resumen

Plainspeak Dial es un vector de control (control vector) desarrollado por 26B-Suite para el modelo base google/gemma-4-26B-A4B-it. Su propósito es ajustar el registro de escritura del modelo, que tiende a producir prosa excesivamente ornamentada y recargada ("purple prose"), hacia un estilo más llano, directo y cercano a la escritura humana. Se distribuye como un archivo GGUF de aproximadamente 300 KB y se aplica en tiempo de inferencia mediante un flag en llama.cpp, sin necesidad de retraining, ingeniería de prompts adicional ni coste de VRAM extra.

Es relevante porque ofrece un control fino y cuantitativo del estilo de escritura sin alterar las capacidades de razonamiento, conocimiento o personalidad del modelo base. El vector se suma a las activaciones del modelo durante la generación, lo que no introduce latencia adicional y es compatible con cualquier fine-tune de Gemma 4 26B A4B it. El repositorio actual es un adaptador sobre el modelo base y contiene 81.664 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vector de control (control vector) aplicado sobre un transformer MoE (google/gemma-4-26B-A4B-it) |
| Parametros totales | 81.664 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Plainspeak Dial no es un modelo de lenguaje completo, sino un vector de control derivado del modelo base google/gemma-4-26B-A4B-it. El vector se almacena en un archivo GGUF y se aplica en tiempo de ejecución sumándolo a las activaciones del modelo, un mecanismo similar a los control vectors utilizados en investigación de interpretabilidad. El método de entrenamiento exacto no se detalla en la información proporcionada, pero el autor menciona una evaluación sobre un test de escritura de 250 historias comparado con prosa humana real. La arquitectura subyacente del modelo base es un transformer MoE de 26B parámetros totales con 4B activos, aunque este vector no modifica esa arquitectura.

## Capacidades

- Ajustar el registro de escritura del modelo base desde un estilo florido y ornamentado hasta uno más llano y directo.
- Escalado del vector: valores positivos (hasta +1.4) hacen la prosa más plana; valores negativos (hasta -1.0) la hacen más ornamentada de forma intencionada.
- No afecta al conocimiento, razonamiento ni a las tarjetas de personaje del modelo base.
- Compatible con llama.cpp y sus clientes (SillyTavern, etc.) mediante el flag `--control-vector`.
- No requiere cambios en la API del cliente; el dial se aplica dentro del servidor.
- No introduce latencia adicional ni coste de VRAM frente al modelo base.

## Casos de uso

- Escritura creativa: ajustar el tono de novelas, relatos o fanfiction para que suene más natural y menos recargado, manteniendo la coherencia narrativa.
- Roleplay en SillyTavern: mejorar la inmersión con diálogos más realistas y menos artificiosos, sin necesidad de reescribir prompts.
- Redaccion de contenido tecnico: generar documentacion, articulos o manuales con un estilo mas directo y profesional, reduciendo la verbosidad innecesaria.
- Guiones y dialogos: producir conversaciones que suenen a habla humana real en lugar de prosa literaria, util para teatro, cine o videojuegos.
- Ajuste de tono en chatbots: modificar el registro de respuestas en aplicaciones de atencion al cliente o asistentes virtuales para que sean mas concisas y cercanas.
- Correccion de estilo en fine-tunes: aplicar el vector a modelos derivados de Gemma 4 26B A4B it para homogeneizar el estilo de salida en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor menciona una prueba interna sobre 250 historias donde el vector cierra aproximadamente el 26% de la brecha de estilo entre el modelo sin ajustar y la escritura humana, con un ritmo de frase mas limpio. No se proporcionan metricas cuantitativas adicionales.

## Requisitos de hardware

- El vector en si es un archivo de unos 300 KB, por lo que no requiere VRAM adicional.
- Los requisitos de hardware dependen del modelo base google/gemma-4-26B-A4B-it, un MoE de 26B parametros totales con 4B activos.
- Para inferencia del modelo base se recomienda una GPU con al menos 16-24 GB de VRAM en cuantizaciones bajas (Q4_K_M) o mas para cuantizaciones mayores.
- Se despliega con llama.cpp, y por tanto es compatible con servidores basados en el (Ollama, TGI si se adapta).
- No se dispone de datos de latencia o throughput especificos para este vector; la generacion es identica a la del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre vectores de control comparables en la informacion proporcionada. Como alternativa, se podria comparar con tecnicas de prompt engineering o adaptadores LoRA, pero no hay datos concretos de rendimiento para una comparativa directa. La principal diferencia frente a LoRA es que este vector no anade VRAM ni latencia, y se aplica en tiempo de ejecucion.

## Limitaciones y advertencias

- El vector esta calibrado para el modelo base google/gemma-4-26B-A4B-it; aunque se indica que deberia funcionar en fine-tunes, el comportamiento exacto puede variar.
- En configuraciones altas (por encima de +1.4) el modelo puede fragmentar frases o entrar en bucles a partir de +2.0.
- Solo soporta ingles (en), no se menciona compatibilidad con otros idiomas.
- La licencia Gemma restringe el uso comercial segun los terminos de Google; es necesario revisar dichos terminos antes de desplegar en produccion.
- El repositorio actual tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco validado por la comunidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/26B-Suite/Plainspeak-Dial-Gemma-4-26B-A4B-BakeVector)
- [Archivo del vector (plainspeak-v2.gguf)](https://huggingface.co/andyoneal/Plainspeak-Dial-Gemma-4-26B-A4B/resolve/main/plainspeak-v2.gguf?download=true)
- [Modelo base google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
