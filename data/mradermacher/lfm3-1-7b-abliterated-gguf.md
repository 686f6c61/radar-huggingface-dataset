# mradermacher/LFM3-1.7B-abliterated-GGUF

## Resumen

LFM3-1.7B-abliterated-GGUF es una cuantización estática en formato GGUF del modelo FrostWolfAI/LFM3-1.7B-abliterated, publicada por el usuario mradermacher. Se trata, por tanto, de un artefacto derivado: el modelo original es una variante "abliterated" del LFM3 de 1.700 millones de parámetros, es decir, una versión a la que se le ha aplicado una técnica de edición de pesos orientada a eliminar el comportamiento de rechazo (refusal) característico de los modelos alineados. El repositorio no aporta información propia sobre arquitectura, datos de entrenamiento o evaluación; toda la ficha se apoya en lo que se puede inferir del nombre, los metadatos del repo y las convenciones de la familia LFM.

El interés de esta publicación es práctico: ofrece el modelo en múltiples niveles de cuantización GGUF (desde Q2_K hasta Q8_0, además de F16 e IQ4_XS), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama. Al estar basado en un modelo de 1,7B, el peso en disco y en VRAM es reducido, lo que lo hace atractivo para prototipado local, experimentación con edición de comportamiento y despliegues en entornos con recursos limitados.

La información disponible es muy escasa: el repositorio no declara licencia, idiomas, pipeline ni resultados de benchmarks, y no cuenta con descargas ni valoraciones en el momento de la consulta. Cualquier uso en producción debería ir precedido de una evaluación propia y de una verificación de la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; arquitectura no declarada en el repositorio) |
| Parametros totales | 1,7B (según el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con quantize_version 2, output_tensor_quantised 1, convert_type hf) |

## Arquitectura y entrenamiento

El repositorio es una conversión a GGUF del modelo FrostWolfAI/LFM3-1.7B-abliterated, que a su vez deriva del LFM3 de 1,7B. No se documenta en la model card la arquitectura interna (tipo de transformer, atención, normalización), el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La etiqueta "abliterated" indica que se ha aplicado una edición de pesos para suprimir la dirección de activación asociada al rechazo, un procedimiento de modificación post-entrenamiento que no requiere reentrenamiento completo pero que puede degradar otras capacidades.

La aportación técnica de este repositorio concreto es la cuantización: los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversión desde pesos en formato Hugging Face y una cuantización estática con la herramienta estándar de llama.cpp. Se ofrecen tanto cuantizaciones K-quant clásicas como IQ4_XS (importancia basada en imatrix), lo que permite elegir entre máxima compresión y fidelidad.

## Capacidades

- Generación de texto autoregresiva en el rango de tamaño de 1,7B parámetros.
- Al no existir información específica del modelo base en el repositorio, no se pueden confirmar capacidades de razonamiento avanzado, código o matemáticas más allá de lo esperable en un modelo de este tamaño.
- Comportamiento de rechazo suprimido por la edición "abliterated": el modelo tiende a responder a peticiones que un modelo alineado rechazaría.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución local en CPU y GPU mediante llama.cpp, Ollama y otros runners compatibles con GGUF.

## Casos de uso

- Prototipado local en equipos de desarrollo: gracias a las cuantizaciones Q4_K_M y Q5_K_M, el modelo cabe en portátiles con 8-16 GB de RAM y permite iterar sobre prompts sin depender de APIs externas.
- Experimentación con edición de comportamiento: investigadores interesados en técnicas de abliteration pueden comparar las respuestas del modelo con las del LFM3 original para medir el efecto de la supresión del rechazo.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o narrativa que requiera abordar temas sensibles sin las negativas típicas de modelos alineados, siempre con revisión humana.
- Evaluación de cuantizaciones: el repositorio ofrece doce variantes (de Q2_K a F16), lo que permite estudiar la degradación de calidad por nivel de compresión en un modelo pequeño.
- Despliegue en entornos con recursos muy limitados: la variante Q2_K o IQ4_XS puede ejecutarse en dispositivos con 2-4 GB de memoria, útil para demos o pruebas de concepto en hardware modesto.
- Generación de datos sintéticos para tareas de clasificación o etiquetado: un modelo de 1,7B puede producir grandes volúmenes de texto a bajo coste para preetiquetar corpus que luego se revisan manualmente.
- Integración en pipelines de CI/CD para pruebas de regresión de prompts: al ser determinista y local, permite fijar versiones del modelo en tests automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, según tamaño de 1,7B y cuantización):
  - F16: ~3,4 GB.
  - Q8_0: ~1,8 GB.
  - Q6_K: ~1,4 GB.
  - Q5_K_M: ~1,2 GB.
  - Q4_K_M: ~1,0 GB.
  - Q3_K_M: ~0,85 GB.
  - Q2_K: ~0,65 GB.
  - IQ4_XS: ~0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para las cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para las variantes F16 y Q8_0 con contexto largo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 4 GB o más para Q4_K_M y superiores; las variantes Q2_K e IQ4_XS pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles; en un modelo de 1,7B cuantizado a Q4_K_M se puede esperar un throughput alto en GPU de consumo, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-abliterated-GGUF (este) | 1,7B | no disponible | no disponible | GGUF | Cuantización estática de un derivado abliterated |
| FrostWolfAI/LFM3-1.7B-abliterated | 1,7B | no disponible | no disponible | safetensors (presumiblemente) | Modelo original del que deriva esta conversión |
| LFM3-1.7B (base) | 1,7B | no disponible | no disponible | no disponible | Modelo alineado original |
| Otros GGUF de ~1,7B (p. ej. Qwen2.5-1.5B-Instruct-GGUF) | 1,5B | 32K (según el modelo) | Apache 2.0 (según el modelo) | GGUF | Alternativa con licencia y benchmarks públicos |

No se dispone de datos de rendimiento comparativo para este modelo; la comparativa se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; es imprescindible verificar la licencia del modelo original (FrostWolfAI/LFM3-1.7B-abliterated) y del LFM3 base antes de cualquier uso comercial.
- La edición "abliterated" suprime el rechazo, lo que aumenta el riesgo de generar contenido dañino, sesgado o inexacto; no debe desplegarse sin filtros adicionales en aplicaciones orientadas al público.
- Riesgo de alucinación elevado por el tamaño reducido (1,7B) y por la posible degradación de capacidades tras la abliteration.
- No se declaran idiomas soportados; el rendimiento en castellano es incierto y debe evaluarse empíricamente.
- La longitud de contexto no está documentada; no se debe asumir una ventana amplia.
- El repositorio no tiene descargas ni valoraciones, lo que reduce la señal de calidad y mantenimiento.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la coherencia en un modelo ya pequeño; se recomienda Q4_K_M o superior para uso real.
- No hay información sobre sesgos específicos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-abliterated-GGUF
- Modelo original: https://huggingface.co/FrostWolfAI/LFM3-1.7B-abliterated
- Herramienta de cuantización llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
