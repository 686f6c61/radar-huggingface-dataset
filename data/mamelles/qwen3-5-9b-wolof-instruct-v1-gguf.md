# mamelles/Qwen3.5-9B-Wolof-Instruct-v1-GGUF

## Resumen
Qwen3.5-9B-Wolof-Instruct-v1-GGUF es una exportación en formato GGUF del modelo Tonic/Qwen3.5-9B-Wolof-Instruct-v1, un ajuste fino de la familia Qwen3.5 orientado al wolof y publicado por el usuario mamelles. El modelo base parte de una arquitectura transformer de aproximadamente 8.984 millones de parámetros (8,98 B) y está pensado para generación de texto conversacional en wolof, una lengua de la familia Níger-Congo hablada principalmente en Senegal, Gambia y Mauritania.

La relevancia de esta ficha radica en que se trata de un modelo de nicho lingüístico empaquetado para inferencia local mediante llama.cpp, lo que facilita su despliegue en entornos sin infraestructura GPU dedicada. El repositorio contiene múltiples cuantizaciones (F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

No obstante, la información pública disponible es muy limitada: la model card original es escueta, no se declara licencia ni lista de idiomas, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Esta ficha refleja únicamente los datos verificables y marca explícitamente como no disponibles aquellos que no se han publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según el nombre del modelo base) |
| Parámetros totales | 8.984.596.992 (8,98 B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponibles (el nombre indica orientación a wolof) |
| Licencia | No disponible |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento
El modelo es una exportación GGUF del checkpoint Tonic/Qwen3.5-9B-Wolof-Instruct-v1, que a su vez deriva de la familia Qwen3.5. Por el nombre y el tamaño (8,98 B de parámetros) se trata de un transformer denso, no de una arquitectura MoE. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO en el modelo base o en el ajuste.

La innovación principal de esta publicación es el empaquetado en GGUF con cinco niveles de cuantización, lo que permite ejecutar el modelo con llama.cpp en hardware de consumo. La model card incluye un ejemplo de uso con `llama-cli` y el flag `-hf`, que descarga el modelo directamente desde Hugging Face. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento explícitos.

## Capacidades
- Generación de texto conversacional, con orientación declarada al wolof por el nombre del modelo.
- Instrucciones de tipo chat (sufijo "Instruct" en el nombre), aunque no se detalla el formato de plantilla.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con infraestructura de inferencia estándar.
- Ejecución local mediante llama.cpp en formato GGUF.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles más allá de la orientación al wolof.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso
- Asistentes conversacionales en wolof: el modelo puede gestionar diálogos multi-turno en esta lengua, un caso poco cubierto por los modelos generalistas, y desplegarse en local con llama.cpp para preservar la privacidad de las conversaciones.
- Traducción y adaptación de contenido al wolof: útil para organizaciones que necesitan localizar materiales divulgativos o administrativos a una lengua con escasa cobertura en modelos comerciales.
- Educación y alfabetización digital: integración en aplicaciones de aprendizaje de wolof o de apoyo a hablantes nativos en entornos con conectividad limitada, gracias a la posibilidad de ejecución offline con cuantizaciones Q4.
- Atención ciudadana en Senegal y Gambia: prototipos de chatbots para servicios públicos o ONG que atiendan a población wolofófona, con despliegue en servidores modestos.
- Investigación lingüística: generación de corpus sintéticos o evaluación de modelos en lenguas de bajos recursos, comparando el comportamiento entre cuantizaciones F16 y Q4.
- Preservación cultural: generación y resumen de textos en wolof para archivos orales transcritos, con la ventaja de un modelo de 9 B que cabe en GPU de consumo.
- Despliegue en el borde: uso en estaciones de trabajo sin GPU dedicada mediante cuantización Q4_0 y llama.cpp, para tareas de generación de texto de baja latencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 18 GB en F16 (2 bytes por parámetro), unos 9,5 GB en Q8_0, unos 6,5 GB en Q5_K_M, unos 5,5 GB en Q4_K_M y unos 5 GB en Q4_0, sin contar el espacio de contexto y overhead.
- GPU recomendadas: A100 o H100 para F16 con contexto largo; RTX 4090 (24 GB) para F16 ajustado o Q8_0 con margen; RTX 3090/4080 (16-24 GB) para Q8_0 y Q5_K_M.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando Q4_K_M o Q4_0; en 6 GB solo con cuantizaciones muy agresivas no listadas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa conversión o importación del GGUF), y otros runners compatibles con GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Qwen3.5-9B-Wolof-Instruct-v1-GGUF (este) | 8,98 B | No disponible | No disponible | GGUF | Ajuste fino orientado a wolof, cuantizaciones múltiples |
| Tonic/Qwen3.5-9B-Wolof-Instruct-v1 | 8,98 B | No disponible | No disponible | Safetensors (presumible) | Modelo base del que deriva esta exportación |
| Qwen3.5-9B (modelo generalista de la familia) | ~9 B | No disponible | No disponible | Safetensors/GGUF | Sin ajuste específico a wolof; cobertura multilingüe general |
| Modelos multilingües de ~7-9 B (p. ej. familia Llama o Mistral) | 7-9 B | Variable | Variable | Safetensors/GGUF | Cobertura de wolof limitada o nula; comparación cualitativa |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias
- No se declara licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare; conviene contactar con el publicador antes de integrarlo en producción.
- No se especifican los idiomas soportados más allá de la orientación implícita al wolof; el comportamiento en castellano u otras lenguas es desconocido.
- No hay información sobre sesgos, datos de entrenamiento ni procesos de alineación, lo que impide evaluar riesgos de toxicidad o estereotipos.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la escasez de datos de evaluación en lenguas de bajos recursos.
- La longitud de contexto no está documentada; asumir contextos largos puede provocar degradación o errores.
- El repositorio no registra descargas ni validación comunitaria, lo que reduce la confianza en la calidad del empaquetado GGUF.
- El tamaño del repositorio (45,1 GB) implica que la descarga completa incluye todas las cuantizaciones; conviene descargar solo el archivo necesario.
- No se documenta la plantilla de chat ni el tokenizador, lo que puede provocar respuestas incoherentes si se usa un formato incorrecto.

## Enlaces
- Hugging Face (este repositorio): https://huggingface.co/mamelles/Qwen3.5-9B-Wolof-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-Instruct-v1
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- Resultados de búsqueda web no relacionados con el modelo (descartados): Wikipedia "Mamelle", mamelles.fr, Wikipedia "Mamelles (Sénégal)".
