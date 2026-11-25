# indielikesai/evilerdolly-qwen-2b

## Resumen

evilerdolly-qwen-2b es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-2B, publicado por el usuario indielikesai en Hugging Face. Se trata de un modelo de generación de texto orientado a preguntas y respuestas, entrenado sobre el dataset propio `indielikesai/evilerdolly`, y cuyo objetivo declarado por el autor es ser deliberadamente poco útil y cómico. No es, por tanto, un modelo pensado para producción ni para tareas de asistencia seria, sino una pieza de experimentación creativa.

El modelo parte de una base de aproximadamente 1.940 millones de parámetros (1.942.653.248 según los pesos en safetensors), lo que lo sitúa en la categoría de modelos pequeños, aptos para ejecución en hardware de consumo. La información publicada no detalla la longitud de contexto, la composición del dataset de ajuste ni los hiperparámetros de entrenamiento, más allá de la referencia al dataset evilerdolly y al modelo base.

Su relevancia es limitada desde el punto de vista técnico, pero resulta interesante como ejemplo de ajuste fino con propósito lúdico sobre una base moderna, y como caso de estudio de los riesgos de desalineación deliberada en modelos conversacionales. La licencia CC-BY-SA-4.0 permite uso comercial con atribución y compartir-al-igual, aunque la naturaleza del modelo desaconseja su uso en entornos reales de atención al usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-2B); detalles no disponibles |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo incluye pesos en formato GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (también se referencia safetensors para el recuento de parámetros) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-2B, un transformer decoder-only de aproximadamente 2.000 millones de parámetros. El modelo ha sido ajustado sobre el dataset `indielikesai/evilerdolly`, presumiblemente una variante del conocido dataset Dolly adaptada por el autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado clásico.

El rasgo técnico más destacable es precisamente su objetivo de entrenamiento: producir respuestas intencionadamente poco útiles y con tono humorístico. No se documentan innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, mezcla de expertos) más allá de las que herede del modelo base. La ausencia de una model card detallada impide verificar la metodología de ajuste, el régimen de entrenamiento o las posibles salvaguardas aplicadas.

## Capacidades

- Generación de texto conversacional en inglés, en formato pregunta-respuesta.
- Estilo humorístico y deliberadamente poco servicial, según la intención declarada del autor.
- Herencia de las capacidades del modelo base Qwen/Qwen3.5-2B (razonamiento básico, código y matemáticas elementales), aunque el ajuste puede degradarlas o alterarlas.
- Soporte de tool calling y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación con ajuste fino: sirve como ejemplo práctico de cómo un fine-tune sobre un dataset pequeño puede cambiar radicalmente el comportamiento de un modelo base, útil en docencia y divulgación sobre alineación.
- Generación de contenido humorístico controlado: puede emplearse en demos, bots de broma o prototipos de entretenimiento donde el tono poco servicial sea el objetivo.
- Pruebas de robustez de pipelines: al ser un modelo deliberadamente poco útil, resulta útil como caso negativo en sistemas de evaluación de calidad de respuestas o de filtros de contenido.
- Investigación sobre desalineación: permite estudiar cómo se comporta un modelo entrenado para no ayudar, y diseñar contramedidas o clasificadores de respuestas no cooperativas.
- Benchmarking de herramientas de inferencia: su tamaño reducido y formato GGUF lo hacen adecuado para validar despliegues con llama.cpp u Ollama en entornos de prueba.
- Prototipado rápido de interfaces conversacionales: para validar la UX de un chat sin depender de un modelo grande, aceptando que las respuestas no serán útiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5-2 GB en cuantización Q4 GGUF para un modelo de ~2.000 millones de parámetros; aproximadamente 4 GB en FP16. Cifras estimadas a partir del tamaño de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para cuantizaciones GGUF; A100 o H100 no son necesarias.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; vLLM y TGI requerirían pesos en safetensors, cuyo soporte no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| evilerdolly-qwen-2b | ~1,94 B | no disponible | CC-BY-SA-4.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (base) | ~2 B | no disponible | no disponible en la información | Hugging Face |
| Fine-tunes lúdicos tipo Dolly sobre modelos pequeños | variable | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparables en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para ser poco útil; no debe emplearse en atención al cliente, asistencia técnica ni ningún flujo donde se espere precisión.
- Riesgo elevado de respuestas incorrectas, evasivas o humorísticas incluso ante preguntas serias; la alucinación es esperable y en cierto modo intencionada.
- Idiomas: solo inglés etiquetado; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no se recomienda para tareas que requieran ventanas largas.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y obligación de compartir obras derivadas bajo la misma licencia; conviene revisar los términos antes de integrarlo en un producto.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la ficha): no hay evidencia externa de calidad ni de seguridad.
- No se documentan sesgos, filtros de seguridad ni evaluaciones de toxicidad; el tono "evil" declarado puede derivar en contenido ofensivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/indielikesai/evilerdolly-qwen-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset de ajuste: https://huggingface.co/datasets/indielikesai/evilerdolly
