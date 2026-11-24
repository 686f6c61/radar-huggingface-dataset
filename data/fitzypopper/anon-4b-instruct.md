# fitzypopper/Anon-4B-Instruct

## Resumen

Anon-4B-Instruct es un adaptador LoRA para el modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario fitzypopper. Su objetivo es reproducir el estilo de respuesta de un hilo del tablon /pol/ de 4chan, manteniendo el formato de chat ChatML del modelo base. No se trata de un modelo completo, sino de pesos de adaptador que deben cargarse sobre Qwen3-4B-Instruct-2507 (4.020 millones de parametros en BF16).

El modelo resuelve un problema muy acotado: la generacion de texto con estilistica de foro anonimo, incluyendo greentext, jerga y estructura conversacional de hilo. Es relevante unicamente como herramienta de investigacion o entretenimiento sobre estilistica de internet; el propio autor advierte que las salidas son frecuentemente ofensivas, sesgadas e inseguras y que no debe desplegarse en produccion.

La arquitectura subyacente es la del transformer denso de Qwen3-4B-Instruct-2507, con licencia Apache-2.0. El adaptador se entreno con LoRA (r=16, alpha=32, dropout=0.05) sobre las proyecciones de atencion y MLP, en bf16 y durante 1.500 pasos con 16 ejemplos por paso. La longitud de secuencia de entrenamiento fue de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507) con adaptador LoRA |
| Parametros totales | 4.020 millones (modelo base); adaptador LoRA de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para el adaptador; heredada del modelo base |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en bf16; el modelo base admite cuantizacion estandar de transformers/PEFT) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | pesos de adaptador PEFT/LoRA (libreria `peft`), no safetensors completos ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer denso de 4.020 millones de parametros. El ajuste se realizo con LoRA de rango 16, alpha 32 y dropout 0.05 sobre las proyecciones de atencion y MLP. El entrenamiento uso bf16, 1.500 pasos, 16 ejemplos por paso, perdida calculada solo sobre los turnos del asistente, mensajes en formato ChatML y longitud de secuencia de 512. Se ejecuto en una unica AMD Radeon RX 7600 XT de 16 GB mediante ROCm.

Los datos proceden del archivo ylelauta/pol-4chan-augmented (134,5 millones de posts de /pol/ entre junio de 2016 y noviembre de 2019, con anotaciones de toxicidad de Perspective API, CC-BY-4.0), del que se procesaron 40 de 270 fragmentos parquet, y de recoleccion en vivo mediante la API JSON de solo lectura de 4chan (a.4cdn.org/pol, 1 peticion por segundo, sin imagenes). Tras convertir HTML y enlaces de cita a greentext, deduplicar, limitar longitud y filtrar por las puntuaciones de toxicidad, el corpus final quedo en 11,4 millones de pares, de los que se preparo una muestra de 250.000 pares para entrenamiento. El filtro es conservador pero no elimina por completo el discurso de odio.

## Capacidades

- Generacion de texto con estilistica de foro anonimo: respuestas breves en formato de post, con greentext y jerga de /pol/.
- Continuacion de contexto de hilo: acepta contexto de hilo en el turno de usuario y responde en personaje.
- Mantenimiento del formato de chat ChatML del modelo base, usando la plantilla de chat del tokenizador.
- Generacion con muestreo configurable (temperatura 0,8, top_k 50, max_new_tokens 100-250 recomendados por el autor).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Investigacion sobre estilistica y retorica de foros anonimos: el adaptador permite generar respuestas con la estructura y jerga de /pol/ para analisis linguistico o sociologico de cultura de internet.
- Generacion de datos sinteticos con estilistica de foro: util para aumentar corpus de investigacion sobre discurso online, con supervision humana y filtrado posterior obligatorio.
- Pruebas de robustez de clasificadores de toxicidad: las salidas del adaptador sirven como casos adversarios para evaluar detectores de contenido ofensivo.
- Simulacion de hilos para estudios de moderacion: permite reproducir dinamicas conversacionales de foro en entornos controlados de laboratorio.
- Demostraciones educativas sobre sesgos en modelos de lenguaje: ilustra como el ajuste fino sobre datos sin filtrar degrada la alineacion de seguridad del modelo base.
- Prototipado de personajes con voz de foro en entornos de investigacion cerrados, nunca expuestos a usuarios finales ni presentados como texto humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es de pequeno tamano; el requisito real lo marca el modelo base Qwen3-4B-Instruct-2507 en bf16, aproximadamente 8 GB de VRAM para los pesos mas overhead de inferencia.
- GPU recomendadas: cualquier GPU con al menos 8-10 GB de VRAM para bf16; una RTX 4090, A100 o H100 ofrecen margen amplio y mayor throughput.
- Cabe en GPU de consumo: el autor entreno el adaptador en una AMD Radeon RX 7600 XT de 16 GB via ROCm, por lo que la inferencia en bf16 es viable en GPUs consumer de 12-16 GB.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor); el modelo base puede servirse con vLLM o TGI fusionando previamente el adaptador, o con llama.cpp/Ollama tras conversion a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anon-4B-Instruct | 4.020 M (base) + LoRA r=16 | no disponible | Estilistica /pol/ de 4chan | Apache-2.0 | Hugging Face (adaptador) |
| Qwen3-4B-Instruct-2507 | 4.020 M | no disponible en la informacion | Asistente generalista | Apache-2.0 | Hugging Face |
| Adaptadores LoRA de estilo de foro comparables | no disponible | no disponible | Estilistica de foro | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Las salidas no estan filtradas y pueden contener material de odio u ofensivo; el autor lo califica como solo para investigacion o entretenimiento.
- El entrenamiento sobre datos de foro degrada la alineacion de seguridad del modelo base: los rechazos y el seguimiento de instrucciones no son fiables.
- El filtro de toxicidad aplicado a los datos es conservador pero no completo; queda contenido inseguro en el corpus y en las salidas.
- Los datos de archivo abarcan 2016-2019, por lo que la jerga y las referencias estan desactualizadas.
- Solo se distribuye el adaptador LoRA; es obligatorio cargarlo sobre Qwen/Qwen3-4B-Instruct-2507.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- No debe desplegarse en produccion ni presentarse la salida como texto escrito por humanos.
- Sin afiliacion con 4chan ni con Qwen; la licencia Apache-2.0 sigue la del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/fitzypopper/Anon-4B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/ylelauta/pol-4chan-augmented
- API de solo lectura de 4chan: https://a.4cdn.org/pol
