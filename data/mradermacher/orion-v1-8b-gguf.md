# mradermacher/Orion-v1-8B-GGUF

## Resumen

Orion-v1-8B es un modelo de lenguaje de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) desarrollado por EymenAydogan, especializado en turco mediante un ajuste fino con QLoRA sobre una base de la familia Qwen3. La versión aquí documentada es la cuantización GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo resuelve el problema de la escasez de modelos abiertos con buen rendimiento en turco: parte de una base multilingüe (Qwen3) y se ajusta con el dataset `merve/turkish_instructions` para mejorar la calidad de las respuestas en instrucciones en turco. Es relevante para desarrolladores que necesitan un asistente conversacional en turco desplegable localmente, con licencia Apache 2.0 y sin dependencia de APIs externas.

La ficha se centra en la versión GGUF, que ofrece 12 cuantizaciones estáticas desde Q2_K (3,4 GB) hasta f16 (16,5 GB). No se dispone de información sobre la longitud de contexto nativa, los datos exactos de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según tags del modelo) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que Orion-v1-8B se basa en Qwen3 (tag `qwen3`) y fue ajustado mediante QLoRA sobre el modelo base `EymenAydogan/Orion-v1-8B`. El ajuste fino utilizó el dataset `merve/turkish_instructions`, orientado a instrucciones en turco. No se especifican el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO.

La versión documentada es una cuantización GGUF estática generada por mradermacher con `convert_type: hf` y `output_tensor_quantised: 1`. No se han publicado (según la model card) cuantizaciones ponderadas o con imatrix para este modelo. No hay información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en turco, orientada a instrucciones.
- Respuesta a prompts de tipo instructivo gracias al ajuste con `merve/turkish_instructions`.
- Capacidad multilingüe heredada de la base Qwen3 (no verificada en la información disponible; el modelo está etiquetado solo para turco).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional en turco para atención al cliente: el modelo puede mantener diálogos multi-turno en turco con un despliegue local mediante llama.cpp u Ollama, evitando enviar datos a APIs externas.
- Generación de contenido en turco para blogs y marketing: adecuado para redactar borradores y variaciones de texto en turco con un coste de inferencia bajo en GPU de consumo.
- Prototipado de chatbots especializados: al ser un modelo de 8B con licencia Apache 2.0, permite iterar y desplegar prototipos sin restricciones de uso comercial.
- Traducción y adaptación de instrucciones al turco: útil para equipos que necesitan procesar documentación o formularios en turco de forma local.
- Educación y tutoría automatizada en turco: el modelo puede responder preguntas y explicar conceptos en turco, desplegado en entornos con hardware limitado gracias a las cuantizaciones Q4_K_S y Q4_K_M (4,9-5,1 GB).
- Investigación sobre ajuste fino en lenguas de bajos recursos: sirve como punto de partida para estudiar el efecto de QLoRA sobre una base Qwen3 en turco.
- Despliegue en edge o entornos sin GPU dedicada: la cuantización Q2_K (3,4 GB) permite ejecución en CPU con llama.cpp para tareas de baja latencia no crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización GGUF):
  - Q2_K: ~3,4 GB de pesos; ~4-5 GB de VRAM con contexto moderado.
  - Q4_K_S / Q4_K_M: ~4,9-5,1 GB de pesos; ~6-7 GB de VRAM.
  - Q6_K: ~6,8 GB de pesos; ~8-9 GB de VRAM.
  - Q8_0: ~8,8 GB de pesos; ~10-11 GB de VRAM.
  - f16: ~16,5 GB de pesos; ~18-20 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4/Q5/Q6; RTX 4090 24 GB o A100/H100 para f16 y Q8_0 con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con cuantizaciones Q4 a Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI (no verificado en la información disponible).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orion-v1-8B (esta ficha) | 8,19B | no disponible | Apache 2.0 | GGUF / safetensors | Ajuste QLoRA en turco sobre base Qwen3 |
| Qwen3-8B (base) | ~8B | no disponible | Apache 2.0 | safetensors / GGUF | Base multilingüe; referencia directa del ajuste |
| Modelos 7-8B genéricos (p. ej., Llama 3.1 8B) | ~8B | no disponible | Llama 3.1 Community License | safetensors / GGUF | No especializado en turco; licencia más restrictiva |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo está etiquetado únicamente para turco; su rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación inherente a modelos de 8B ajustados con instrucciones; no se han publicado evaluaciones de fidelidad.
- No se dispone de información sobre sesgos específicos del dataset `merve/turkish_instructions` ni de mitigaciones aplicadas.
- La longitud de contexto no está documentada; no se debe asumir un contexto largo sin verificarlo.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas/imatrix disponibles según la model card.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar la model card del modelo base para condiciones adicionales.
- El repo GGUF ocupa 73,4 GB; la descarga de todas las cuantizaciones no es necesaria, solo la variante elegida.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Orion-v1-8B-GGUF
- Modelo base: https://huggingface.co/EymenAydogan/Orion-v1-8B
- Página de descargas de mradermacher: https://hf.tst.eu/model#Orion-v1-8B-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/merve/turkish_instructions
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
