# prosenna/chatwith-byron

## Resumen

ChatWith — Byron es un paquete de modelo conversacional publicado por el usuario prosenna en Hugging Face, pensado para su integración en la aplicación Android ChatWith (versión 0.2.5, versionCode 7, o posterior). No se trata de un modelo entrenado desde cero, sino de un ajuste fino mediante LoRA sobre Ministral 3 3B Instruct 2512, un modelo base de 3.429.006.336 parámetros, distribuido en formato GGUF Q4_K_M generado con llama.cpp b12190. El paquete incluye además un tokenizador propio (`ministral3-3b-vocab.gguf`), un manifiesto, lógica en JavaScript y un índice de fichas de personaje.

El propósito del modelo es dar vida a un personaje conversacional concreto ("Byron") dentro de la app ChatWith, con un formato de paquete propietario de tipo 1 que agrupa pesos, tokenizador y metadatos en una única carpeta `byron/`. El repositorio ocupa 17,3 GB, aunque el peso del GGUF Q4_K_M de un modelo de 3,4B parámetros debería rondar los 2 GB; el resto del tamaño corresponde presumiblemente a otros artefactos del paquete y a los ficheros de suma de verificación.

La relevancia del modelo es limitada y muy específica: es una demo experimental de un personaje para una app concreta, sin model card técnica detallada, sin licencia declarada y sin resultados de benchmarks. Su interés para desarrolladores e investigadores es el de un ejemplo de empaquetado de un modelo GGUF con LoRA de personaje para despliegue móvil, no el de un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Ministral 3 3B Instruct 2512; ajuste LoRA) |
| Parámetros totales | 3.429.006.336 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (dentro de un paquete propietario `byron/` con manifiesto, lógica JS y tokenizador GGUF) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA sobre Ministral 3 3B Instruct 2512, un transformer de 3,4B parámetros. La información disponible no detalla la composición del dataset de ajuste, el número de tokens de entrenamiento, ni si se emplearon técnicas de RLHF o DPO. El único dato técnico concreto es el pipeline de conversión: los pesos se exportaron a GGUF Q4_K_M con llama.cpp b12190 y se empaquetaron junto a un tokenizador GGUF específico (`ministral3-3b-vocab.gguf`).

La innovación principal no está en el modelo sino en el formato de distribución: un paquete de formato 1 de ChatWith que incluye `manifiesto.json`, `logica.js`, `cabecera.txt`, `fichas/indice.json`, el tokenizador y el GGUF del modelo, más un fichero `SHA256SUMS` para verificación de integridad. Este diseño permite que la app Android cargue el personaje de forma autocontenida.

## Capacidades

- Generación de texto conversacional multi-turno (el modelo base es Instruct y el ajuste LoRA está orientado a personaje).
- Interpretación de un personaje concreto ("Byron") definido por las fichas y la lógica del paquete ChatWith.
- Ejecución local en dispositivo Android a través de la app ChatWith, sin depender de una API remota.
- Tokenización propia empaquetada, lo que garantiza consistencia entre el tokenizador y los pesos.
- Verificación de integridad mediante `SHA256SUMS`.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Chat de personaje en Android: la app ChatWith carga la carpeta `byron/` y ofrece una conversación con el personaje Byron en local, sin conexión a servidores externos.
- Demo de empaquetado de modelos GGUF: sirve como referencia para desarrolladores que quieran distribuir un modelo cuantizado junto a tokenizador, manifiesto y lógica de personaje en un único paquete.
- Pruebas de integración de llama.cpp en móvil: el GGUF Q4_K_M generado con llama.cpp b12190 permite validar el rendimiento de inferencia de un modelo de 3,4B en hardware Android.
- Prototipado de asistentes conversacionales con personalidad: el LoRA de personaje permite experimentar con respuestas caracterizadas sin reentrenar el modelo base.
- Verificación de despliegues: el uso de `SHA256SUMS` facilita comprobar que los pesos y el tokenizador no se han corrompido en la distribución.
- Evaluación comparativa de cuantizaciones: al estar en Q4_K_M, puede compararse con otras cuantizaciones del mismo modelo base para medir el impacto en calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un GGUF Q4_K_M de 3,4B parámetros ocupa aproximadamente 2 GB en disco y en memoria; la VRAM necesaria para GPU sería del orden de 2-3 GB, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponibles en la información.
- Compatibilidad con GPU de consumo: por tamaño, un modelo de 3,4B en Q4_K_M cabría en GPUs de consumo con 4 GB o más de VRAM, pero no se confirma en la documentación.
- Opciones de despliegue: llama.cpp (versión b12190 o compatible, según el GGUF) y la app Android ChatWith 0.2.5 (versionCode 7) o posterior. No se documenta soporte para vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| ChatWith — Byron | 3,4B | no disponible | no disponible | GGUF Q4_K_M en paquete ChatWith | Ajuste LoRA de personaje sobre Ministral 3 3B Instruct 2512 |
| Ministral 3 3B Instruct 2512 (base) | 3,4B | no disponible | no disponible | safetensors / GGUF | Modelo base sin ajuste de personaje |
| Otros GGUF de ~3B para móvil | ~3B | variable | variable | GGUF | No se dispone de datos comparativos concretos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Es una demo experimental: el propio autor advierte que puede equivocarse y que no debe considerarse una fuente fiable.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- No se documentan idiomas soportados; el comportamiento multilingüe es incierto.
- No se documenta la longitud de contexto, lo que limita la planificación de conversaciones largas.
- Riesgo de alucinación inherente a un modelo de 3,4B ajustado para personaje y sin benchmarks publicados.
- El paquete está atado a la app ChatWith (versión 0.2.5 o posterior) y a su formato propietario; no es directamente reutilizable en otros entornos sin extraer el GGUF y el tokenizador.
- El tamaño del repositorio (17,3 GB) es desproporcionado respecto al peso esperado del GGUF, lo que puede complicar la descarga y el almacenamiento.
- No hay información sobre sesgos del modelo base ni del ajuste LoRA.
- No se documentan garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/prosenna/chatwith-byron
