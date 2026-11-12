# kadirify/atlas-orta-GGUF

## Resumen

Atlas Orta es un ajuste fino (fine-tune) del modelo google/gemma-4-E4B-it orientado a la corrección ortográfica y al uso general del turco. Lo desarrolla kadirify y se distribuye en formato GGUF bajo licencia Apache 2.0. No es un modelo entrenado desde cero: parte de los pesos del modelo base de Google y aplica un LoRA (r=16, alpha=32) que posteriormente se fusiona en el modelo base. Su propósito declarado es servir de motor para Atlas, un asistente de escritorio open source que funciona íntegramente en local.

El modelo se publica con un único archivo cuantizado, `atlas-orta-Q6_K.gguf` (6,2 GB), y está pensado para ejecutarse con Ollama mediante el comando `ollama run kadirify/atlas-orta`. La relevancia actual del modelo es acotada: no compite en capacidades generales, sino que mejora de forma medible la corrección ortográfica en turco respecto al modelo base, manteniendo un rendimiento general prácticamente idéntico.

La información disponible es limitada: el autor no publica arquitectura detallada, número de parámetros, longitud de contexto ni datos sobre el proceso de alineación del modelo base. Los datos de entrenamiento y evaluación que sí se documentan aparecen en la model card y se recogen en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de google/gemma-4-E4B-it) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (archivo publicado, 6,2 GB); el autor menciona una build Q4_K_M usada en evaluación |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base google/gemma-4-E4B-it, cuya arquitectura interna no se detalla en la información disponible. El ajuste se realizó mediante LoRA con r=16 y alpha=32, durante 1 epoch sobre 8.955 ejemplos, y posteriormente se fusionó en los pesos del modelo base. El entrenamiento se ejecutó en una única GPU RTX 5070 de 12 GB. Los scripts de entrenamiento están disponibles en la carpeta `training/` del repositorio de Atlas en GitHub.

El dataset de entrenamiento combina dos fuentes: oraciones en turco corrompidas mediante reglas, junto con sus versiones corregidas, y ejemplos generales en turco e inglés generados con Gemma 4 E4B. No se documenta el uso de RLHF ni DPO, ni el número de tokens de entrenamiento. Tampoco se especifican innovaciones técnicas adicionales más allá del propio ajuste LoRA fusionado.

## Capacidades

- Corrección ortográfica en turco: capacidad principal del ajuste, entrenada sobre textos con errores generados por reglas.
- Generación de texto general en turco e inglés, heredada del modelo base.
- Conversación multi-turno: el modelo se distribuye como variante instruct (`-it`) del base, aunque la model card no detalla formatos de plantilla ni de chat.
- Uso como motor de un asistente de escritorio local (Atlas), con ejecución íntegra en el dispositivo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Corrección ortográfica de textos en turco en un asistente de escritorio: el modelo se integra en Atlas para revisar y corregir la escritura del usuario en local, sin enviar texto a servicios externos, gracias a su formato GGUF y a su ejecución con Ollama.
- Revisión de borradores y documentación interna en turco: el ajuste eleva la tasa de acierto en pruebas de ortografía del 64,7 % al 88,0 %, lo que lo hace adecuado para pre-revisar correos, informes o notas antes de su publicación.
- Asistencia de escritura en entornos sin conectividad o con requisitos de privacidad: al ejecutarse con Ollama sobre una única GPU de consumo (el autor entrenó con una RTX 5070 de 12 GB), puede desplegarse en estaciones de trabajo locales donde no está permitido el uso de APIs en la nube.
- Normalización de texto turco en pipelines de datos: útil para limpiar y corregir corpus en turco antes de indexarlos o procesarlos, aunque el autor advierte que las correcciones no son perfectas y requieren revisión en textos importantes.
- Prototipado de asistentes conversacionales bilingües turco-inglés: el modelo conserva el rendimiento general del base (97,2 frente a 97,3 en el benchmark Atlas-TR de 92 preguntas), por lo que puede emplearse como base para demos de chat en ambos idiomas.
- Evaluación de técnicas de ajuste LoRA sobre modelos pequeños: el repositorio y los scripts de entrenamiento publicados permiten reproducir el pipeline de corrupción de texto y ajuste, lo que resulta útil para experimentación académica o docente.

## Benchmarks y rendimiento

| Prueba | gemma4:e4b (base) | Atlas Orta |
|---|---:|---:|
| Test de ortografía (300 casos), % | 64,7 | 88,0 |
| Test de ortografía difícil (187 casos), % | 51,3 | 83,4 |
| Atlas-TR general (92 preguntas) | 97,3 | 97,2 |

Notas del autor: el test de ortografía difícil se midió sobre la build Q4_K_M, con una línea base sometida a la misma cadena de conversión. El benchmark Atlas-TR es una prueba pequeña de 92 preguntas, por lo que diferencias de 1 a 2 puntos no se consideran significativas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo publicado Q6_K ocupa 6,2 GB, por lo que se necesita al menos esa cantidad de VRAM (o memoria unificada) más el overhead del runtime; una GPU de 8 GB debería ser suficiente para Q6_K, y la build Q4_K_M reduciría el requisito.
- GPU recomendadas: el autor entrenó con una RTX 5070 de 12 GB; para inferencia son válidas GPUs de consumo con 8 GB o más, así como A100 o H100 para despliegues con mayor concurrencia.
- ¿Cabe en GPU de consumo? Sí: el tamaño del archivo GGUF (6,2 GB en Q6_K) permite ejecutarlo en tarjetas consumer de gama media-alta.
- Opciones de despliegue: Ollama (método documentado por el autor mediante `ollama run kadirify/atlas-orta`); al ser GGUF, también es compatible con llama.cpp y otros runtimes que acepten este formato. No se documenta soporte para vLLM o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas Orta | no disponible | no disponible | 88,0 % en test de ortografía turca (300 casos); 97,2 en Atlas-TR | Apache 2.0 | GGUF en Hugging Face y Ollama |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | 64,7 % en test de ortografía turca; 97,3 en Atlas-TR | no disponible en la información proporcionada | Hugging Face |
| Otras alternativas de corrección ortográfica en turco | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los tests de ortografía se construyeron con textos corrompidos mediante reglas; el modelo no se ha probado por separado con textos escritos por personas reales, por lo que el rendimiento en lenguaje natural puede diferir.
- El benchmark Atlas-TR consta solo de 92 preguntas; diferencias de 1 a 2 puntos no son significativas y no deben interpretarse como mejoras o degradaciones reales.
- El autor advierte explícitamente de que las correcciones no son siempre perfectas y recomienda revisar manualmente los textos importantes.
- Riesgo de alucinación: no se documenta de forma específica, pero es inherente a los modelos generativos; en tareas de corrección puede introducir cambios no solicitados en el texto.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de idioma: el ajuste está orientado al turco y los datos de entrenamiento incluyen ejemplos en inglés, pero no se documenta el rendimiento en otros idiomas.
- Licencia: Apache 2.0, la misma que el modelo base, lo que permite uso comercial; conviene verificar igualmente las condiciones del modelo base de Google.
- Al ser un fine-tune de un modelo base cuya arquitectura y contexto no se detallan, no es posible evaluar sus límites de ventana de contexto ni su comportamiento en tareas de razonamiento largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kadirify/atlas-orta-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del asistente Atlas: https://github.com/kadirify/atlas
- Ejecución con Ollama: `ollama run kadirify/atlas-orta`
