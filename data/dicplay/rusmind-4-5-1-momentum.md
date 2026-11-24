# DICPlay/RusMind-4.5.1-Momentum

## Resumen

RusMind 4.5.1 · Моментум es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, orientado especificamente al idioma ruso y con soporte secundario de ingles. Se distribuye como fine-tune del modelo base `google/gemma-4-E2B-it` y se publica en formato GGUF, pensado para inferencia local en dispositivos de consumo mediante llama.cpp, LM Studio u Ollama, sin necesidad de conexion a internet.

El modelo cuenta con 4.647.450.147 parametros totales, de los cuales aproximadamente 2.000 millones se activan por token durante la inferencia, lo que le permite ejecutarse en portatiles, ordenadores de sobremesa convencionales e incluso telefonos de gama alta. Es la variante mas ligera de la generacion 4.5 de la familia RusMind y esta disenado para tareas conversacionales, razonamiento logico, correccion ortografica y gramatical del ruso, y llamada de herramientas.

Su relevancia actual radica en que compite en el benchmark independiente MERA v2 (Multimodal Evaluation for Russian-language Architectures) con modelos de 8 a 24 mil millones de parametros, superandolos en varias categorias pese a su menor tamano activo. La licencia es propietaria (`rusmind-license`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), fine-tune de google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | ~2.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones multiples; niveles especificos no disponibles) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | rusmind-license (propietaria, `license: other`) |
| Formato de pesos | GGUF (libreria: gguf; compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `google/gemma-4-E2B-it`, lo que implica una arquitectura transformer con mezcla de expertos (MoE) heredada del modelo base de Google. La relacion declarada es `finetune`, no `merge` ni `adapter`. El modelo base Gemma 4 E2B es la variante de 2 mil millones de parametros activos de la familia Gemma 4, y DICPlay lo ha especializado para el idioma ruso mediante un proceso de ajuste supervisado y, presumiblemente, optimizacion de preferencias, aunque la model card no detalla la composicion exacta del dataset ni el numero de tokens de entrenamiento.

Entre las innovaciones destacadas por el autor figura el modo de razonamiento previo a la respuesta en tareas logicas, la mejora en el conocimiento de historia rusa y mundial del siglo XX, y un ajuste especifico para la llamada precisa de herramientas y la comprension del humor, adivinanzas y lenguaje coloquial. No se especifica si se empleo RLHF, DPO o decodificacion especulativa. Tampoco se detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizados.

## Capacidades

- Generacion de texto conversacional en ruso e ingles.
- Razonamiento logico con modo de "pensar antes de responder" en tareas de logica.
- Correccion ortografica y de puntuacion en ruso (puntuacion de 0,719 en la tarea de correccion de MERA v2 segun el autor).
- Llamada de herramientas y funciones (tool calling / function calling).
- Comprension de humor, adivinanzas, personajes y lenguaje coloquial ruso.
- Conocimiento profundo de historia rusa (desde la Rus de Kiev hasta la actualidad) e historia mundial del siglo XX.
- Capacidades multilingues limitadas a ruso e ingles.
- Ejecucion en dispositivo (on-device) y sin conexion (offline).
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- **Atencion al cliente en ruso**: el modelo puede gestionar conversaciones multi-turno con usuarios rusoparlantes, incluyendo comprension de lenguaje coloquial y correccion de errores ortograficos del usuario, desplegado en local sin depender de servicios en la nube.
- **Asistente de escritorio offline**: integracion en aplicaciones de escritorio para correccion y generacion de texto en ruso sin conexion, aprovechando su formato GGUF y su bajo consumo de recursos (2 mil millones de parametros activos).
- **Procesamiento de documentos historicos**: resumen y consulta de textos sobre historia rusa y mundial del siglo XX, gracias al conocimiento especializado inyectado durante el fine-tune.
- **Automatizacion con tool calling**: integracion en pipelines que requieran llamada de funciones (APIs, bases de datos, sistemas de archivos) con instrucciones en ruso, aprovechando la mejora declarada en precision de invocacion de herramientas.
- **Asistente educativo en dispositivos moviles**: aplicacion movil de apoyo al estudio de historia, ortografia y gramatica rusa, ejecutable en telefonos de gama alta sin conexion.
- **Prototipado rapido de agentes conversacionales**: uso en entornos de desarrollo con llama.cpp u Ollama para validar flujos de agente multi-paso antes de escalar a modelos mayores de la familia RusMind.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark independiente MERA v2 y fueron publicados por el autor en la model card. Se presentan a continuacion.

| Benchmark MERA v2 | RusMind Моментум (2B activos) | T-lite · T-Bank (8B) | Zero-Mistral (24B) | A-Vibe · Avito (8B) |
|---|---|---|---|---|
| Razonamiento (Reasoning) | 0,225 | 0,218 | 0,213 | 0,187 |

El autor declara ademas que el modelo es numero 1 en cultura y regiones de Rusia entre modelos de hasta 5 mil millones de parametros, y numero 1 en tareas centradas en el ser humano en la misma franja. Afirma superar en puntuacion global a A-Vibe (8B), Zero-Mistral-Small (24B), Gemma 4 E2B y Qwen3.5-4B. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 4,65 mil millones de parametros totales y formato GGUF, una cuantizacion Q4 requiere aproximadamente 2,5-3 GB de VRAM/RAM, y Q8 en torno a 5 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 y superiores.
- Cabe en GPU de consumo: si, segun el autor funciona en portatiles, PCs convencionales y telefonos de gama alta.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (segun la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MERA v2 (razonamiento) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RusMind 4.5.1 Моментум | 4,65B | ~2B | no disponible | 0,225 | rusmind-license (propietaria) | GGUF en HF |
| T-lite (T-Bank) | 8B | no disponible | no disponible | 0,218 | no disponible | no disponible |
| Zero-Mistral | 24B | no disponible | no disponible | 0,213 | no disponible | no disponible |
| A-Vibe (Avito) | 8B | no disponible | no disponible | 0,187 | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al estar especializado en ruso e historia rusa, puede presentar sesgos culturales y geograficos en temas historicos y politicos.
- Riesgo de alucinacion: presente como en cualquier modelo de este tamano; el modo de razonamiento previo no elimina el riesgo en tareas factuales.
- Limitaciones de contexto: la longitud de contexto no esta publicada, lo que impide garantizar conversaciones largas o documentos extensos.
- Limitaciones de idioma: solo ruso e ingles; el rendimiento en otros idiomas no esta garantizado ni documentado.
- Licencia: `rusmind-license` es propietaria y de tipo "other"; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Caveat de produccion: el modelo es un fine-tune de Gemma 4 E2B, por lo que hereda las limitaciones del modelo base; ademas, la model card promociona activamente versiones posteriores (4.7), lo que sugiere que 4.5.1 puede quedar obsoleto a corto plazo.
- El autor no publica informacion sobre composicion del dataset de entrenamiento ni sobre el proceso de alineacion, lo que dificulta evaluar riesgos de contaminacion o sesgo.

## Enlaces

- Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.1-Momentum
- Demo oficial: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Version posterior recomendada (4.7 Моментум): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 Сокол: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 Вспышка: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
