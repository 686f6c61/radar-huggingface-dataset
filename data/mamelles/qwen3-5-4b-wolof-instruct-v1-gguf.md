# mamelles/Qwen3.5-4B-Wolof-Instruct-v1-GGUF

## Resumen

Qwen3.5-4B-Wolof-Instruct-v1-GGUF es una exportación en formato GGUF del modelo Tonic/Qwen3.5-4B-Wolof-Instruct-v1, un ajuste fino de la familia Qwen3.5 orientado al idioma wolof y publicado por el usuario mamelles bajo la etiqueta comunitaria galsenai. El modelo resuelve el problema de la escasa cobertura del wolof en los LLM generalistas: parte de un modelo base de aproximadamente 4.860 millones de parámetros y lo adapta para generación de texto conversacional en dicho idioma. Su relevancia actual radica en que permite ejecutar inferencia local de un asistente en wolof mediante llama.cpp, sin depender de servicios en la nube.

El repositorio contiene únicamente pesos cuantizados en GGUF (F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0) y ocupa 24,5 GB en total, lo que refleja la suma de todas las variantes de cuantización. La model card es mínima: no documenta el proceso de ajuste, los datos de entrenamiento, la licencia ni los idiomas soportados más allá de la etiqueta wolof. El modelo base declarado es Tonic/Qwen3.5-4B-Wolof-Instruct-v1, del que no se aportan especificaciones adicionales.

Se trata de un modelo conversacional (pipeline text-generation, endpoints compatibles) pensado para despliegue con llama.cpp y compatible con la CLI `llama-cli`. No se han publicado resultados de benchmarks, detalles de arquitectura interna ni información sobre el contexto máximo en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3.5; arquitectura interna no documentada) |
| Parametros totales | 4.860.696.576 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | wolof (etiqueta declarada); resto no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Libreria de despliegue | llama.cpp |
| Tamano del repositorio | 24,5 GB (conjunto de todas las cuantizaciones) |
| Modelo base | Tonic/Qwen3.5-4B-Wolof-Instruct-v1 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. Por la nomenclatura y el tamaño (4.860 millones de parámetros), se trata de un transformer derivado de la familia Qwen3.5, pero la model card no especifica si emplea atención estándar, atención lineal, mezcla de expertos ni ninguna otra innovación. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la información disponible se limita a indicar que es un ajuste fino instruct del modelo Tonic/Qwen3.5-4B-Wolof-Instruct-v1, orientado al wolof. No se detalla el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO u otra fase de alineamiento, ni las técnicas de adaptación empleadas (por ejemplo, si se usó LoRA o ajuste completo). Esta exportación GGUF no introduce cambios en los pesos más allá de la cuantización.

## Capacidades

- Generación de texto conversacional en wolof, según la etiqueta del modelo y el ejemplo de la model card (`Salaam aleekum, naka nga def?`).
- Instrucción y seguimiento de turnos de conversación, al derivar de un modelo con sufijo Instruct.
- Compatibilidad con llama.cpp mediante `llama-cli` y con endpoints compatibles con la API de Hugging Face.
- Soporte de cuantizaciones desde F16 hasta Q4_0, lo que permite ajustar el equilibrio entre calidad y memoria.
- Capacidades multilingües: no disponibles más allá del wolof declarado.
- Tool calling, function calling, razonamiento multi-paso, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional en wolof para hablantes nativos: el modelo puede mantener diálogos multi-turno en dicho idioma ejecutándose localmente con llama.cpp, lo que resulta adecuado en entornos con conectividad limitada.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M, el modelo ocupa aproximadamente 3 GB, por lo que puede ejecutarse en equipos con GPU modestas o incluso en CPU, facilitando prototipos de bajo coste.
- Educación y alfabetización digital en wolof: generación de explicaciones y respuestas en lengua local para comunidades donde el wolof es la lengua principal de comunicación.
- Investigación lingüística y evaluación de LLM en lenguas de bajos recursos: sirve como punto de partida para medir calidad, sesgos y fluidez en wolof frente a modelos multilingües generalistas.
- Integración en pipelines de generación de texto mediante la API compatible con endpoints, por ejemplo para enriquecer contenidos o responder consultas en aplicaciones web.
- Experimentación con cuantizaciones: el repositorio incluye cinco variantes que permiten comparar la degradación de calidad entre F16 y Q4_0 en una misma tarea en wolof.
- Base para ajustes posteriores: al ser un modelo instruct de 4B en GGUF, puede servir de referencia para evaluar futuras adaptaciones o destilaciones en la misma lengua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, para 4.860 millones de parámetros):
  - F16: aproximadamente 9,7 GB de pesos.
  - Q8_0: aproximadamente 5,2 GB.
  - Q5_K_M: aproximadamente 3,4 GB.
  - Q4_K_M: aproximadamente 3,0 GB.
  - Q4_0: aproximadamente 2,8 GB.
- Estas cifras son estimaciones basadas en el número de parámetros; no proceden de la model card.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, cabría esperar ejecución en RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100 o H100, pero el autor no lo confirma.
- Cabe en GPU de consumo: sí, previsiblemente con cuantizaciones Q4 y Q5 en tarjetas de 6-8 GB o superiores; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (documentado con `llama-cli`); otros runners compatibles con GGUF como Ollama o llama-cpp-python no se mencionan explícitamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| mamelles/Qwen3.5-4B-Wolof-Instruct-v1-GGUF | 4,86B | no disponible | wolof | no disponible | GGUF |
| Tonic/Qwen3.5-4B-Wolof-Instruct-v1 | 4,86B (mismo base) | no disponible | wolof | no disponible | safetensors (presumiblemente) |
| Modelos Qwen3.5 generalistas de ~4B | ~4B | no disponible | multilingüe | no disponible | safetensors, GGUF |

No se dispone de datos de rendimiento ni de otros modelos comparables específicos para wolof en la información proporcionada.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- No se documentan los datos de entrenamiento, por lo que se desconocen los sesgos presentes en el corpus y su posible reflejo en las respuestas.
- Riesgo de alucinación inherente a un modelo de 4B ajustado con datos limitados; no hay evaluaciones publicadas que lo cuantifiquen.
- La longitud de contexto no está especificada; no debe asumirse un contexto largo sin verificación empírica.
- El soporte lingüístico se limita, según la etiqueta, al wolof; el comportamiento en otros idiomas no está garantizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- El tamaño del repo (24,5 GB) incluye todas las cuantizaciones; la descarga de una sola variante es mucho menor.
- La fecha de creación indicada (2026-11-13) es posterior a la fecha habitual de consulta; conviene verificar su vigencia en Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mamelles/Qwen3.5-4B-Wolof-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-4B-Wolof-Instruct-v1
- llama.cpp (runner documentado): https://github.com/ggml-org/llama.cpp
