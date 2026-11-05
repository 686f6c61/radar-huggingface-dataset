# k-cascade/zils-flash-knowline-9b-gen1

## Resumen

Zils d3-flash soup body: KnowLine-9B-Gen1 es un reempaquetado del modelo PelaAI/KnowLine-9B-Gen1, publicado por el usuario k-cascade para su uso como "soup body" en la subred Zils (Bittensor SN127), dentro del pool `d3-flash`. No se trata de un modelo entrenado desde cero ni de un fine-tuning: los pesos de lenguaje son exactamente los del modelo original y los únicos cambios introducidos son el renombrado de tensores y la reorganización de los shards.

El modelo cuenta con 8.392.695.024 parámetros almacenados en formato safetensors, lo que lo sitúa en la categoría de 9B (denominación comercial del modelo base). El repositorio ocupa 16,8 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo original.

Su relevancia es acotada: está pensado para integrarse en la infraestructura de la subred Zils de Bittensor como cuerpo de decisión, no como un modelo de propósito general listo para producción. La información pública disponible es muy limitada (sin model card descriptiva de capacidades, sin benchmarks y sin idiomas declarados), por lo que esta ficha se limita a documentar lo que consta de forma verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base PelaAI/KnowLine-9B-Gen1; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (sin `lm_head` ni tensores `mtp`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base PelaAI/KnowLine-9B-Gen1 en la documentación proporcionada. El repositorio de k-cascade no incluye detalles sobre el tipo de transformer, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo único documentado es el proceso de reempaquetado: se parte de la revisión `4083a79ae652000b3d0c67698d86b0b0de514d6c` del modelo original y se modifican únicamente los nombres de los tensores y la distribución en shards para adaptarlos al formato "soup body" de Zils. Los tensores `lm_head` y `mtp` no se incluyen en este repositorio, lo que implica que el cuerpo no puede usarse por sí solo para generar logits de vocabulario sin la cabeza correspondiente.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- Al conservar los pesos de lenguaje del modelo original, heredaría las capacidades de PelaAI/KnowLine-9B-Gen1, pero estas no están descritas en la documentación proporcionada.
- No consta soporte de tool calling, function calling ni razonamiento multi-paso.
- No consta soporte multilingüe declarado.
- No consta modo de razonamiento (thinking mode), visión ni audio.
- El repositorio excluye `lm_head`, por lo que no es directamente utilizable para inferencia de texto estándar sin componentes adicionales.

## Casos de uso

- Integración como cuerpo en la subred Zils (Bittensor SN127): el propósito declarado del repositorio es servir como "soup body" para el pool `d3-flash`, de modo que los nodos de la subred puedan cargar los pesos en el layout esperado.
- Experimentación con el ecosistema Bittensor: desarrolladores que investiguen el funcionamiento de subredes de decisión pueden usar este repositorio para estudiar cómo se estructura un cuerpo reempaquetado.
- Reutilización de pesos para investigación: al conservar los pesos de lenguaje originales, puede servir como punto de partida para quienes necesiten los tensores del modelo base en un layout alternativo.
- Auditoría de reempaquetados: útil para comparar el layout original de PelaAI/KnowLine-9B-Gen1 con el layout de Zils y verificar la integridad de los tensores.
- Fine-tuning posterior sobre el cuerpo: equipos que quieran adaptar el modelo a una tarea concreta podrían partir de estos pesos, añadiendo su propia cabeza de lenguaje.
- Docencia y divulgación sobre formatos de pesos: ejemplo práctico de cómo se reorganizan shards y se renombran tensores para adaptar un modelo a una infraestructura específica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16,8 GB solo para los pesos (8,39B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 8,4 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4,2 GB para los pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; GPUs consumer de 8-12 GB podrían alojar versiones cuantizadas a 4 bits, aunque no se han publicado ficheros GGUF en este repositorio.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantización, siempre que se añada una cabeza de lenguaje compatible.
- Opciones de despliegue: al no incluir `lm_head`, no es directamente desplegable con vLLM, TGI, llama.cpp u Ollama sin trabajo adicional de integración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| k-cascade/zils-flash-knowline-9b-gen1 | 8,39B | no disponible | Apache 2.0 | HuggingFace (reempaquetado, sin lm_head) |
| PelaAI/KnowLine-9B-Gen1 | no disponible (modelo base de 9B) | no disponible | Apache 2.0 | HuggingFace (modelo original) |
| Alternativas de ~9B de propósito general | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- El repositorio no incluye `lm_head` ni tensores `mtp`, por lo que no es un modelo autónomo para inferencia de texto estándar.
- No se documentan sesgos conocidos, pero al ser un reempaquetado de otro modelo, heredaría los sesgos del modelo base, que no están descritos.
- Riesgo de alucinación: no evaluado en la información disponible.
- No consta el soporte de idiomas ni la longitud de contexto, lo que impide garantizar su comportamiento en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor del reempaquetado no ofrece garantías sobre los pesos originales; conviene revisar la licencia y condiciones del modelo base PelaAI/KnowLine-9B-Gen1.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- Uso previsto restringido al ecosistema Zils/Bittensor; no se recomienda su adopción en producción sin una evaluación previa del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/k-cascade/zils-flash-knowline-9b-gen1
- Modelo base: https://huggingface.co/PelaAI/KnowLine-9B-Gen1
- Revisión del modelo base referenciada: `4083a79ae652000b3d0c67698d86b0b0de514d6c`
- Subred Zils (Bittensor SN127): no disponible en la información proporcionada.
