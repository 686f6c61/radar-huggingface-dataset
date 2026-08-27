# Distillio/Qwen3.8-27B-GGUF

## Resumen

El modelo Distillio/Qwen3.8-27B-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de un modelo denso de visión y lenguaje (image-text-to-text) con 27 320 697 856 parámetros (~27B), diseñado para tareas de codificación, agentes autónomos y automatización de oficina. La cuantización fue realizada por bartowski mediante llama.cpp con imatrix, y está publicada bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

Este modelo destaca por ser nativamente multimodal (acepta texto e imagen) y por incluir soporte de decodificación especulativa mediante MTP (Multi-Token Prediction), lo que acelera la inferencia. La colección ofrece más de veinte formatos de cuantización, desde bf16 completo hasta Q2_K, lo que permite adaptarse a distintos presupuestos de hardware. Al estar basado en la arquitectura de Qwen3.5, hereda mejoras en razonamiento, generación de código y tareas agénticas de largo horizonte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) |
| Parametros totales | 27 320 697 856 (27 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q3_K_XL, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS, Q2_K_L, IQ3_XXS, Q2_K |
| Idiomas soportados | No disponible (modelo multilingüe de Qwen, pero no se especifica lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye archivos mmproj para proyección multimodal) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo transformer denso de 27 B parámetros, diseñado para procesamiento conjunto de texto e imagen. Sigue la arquitectura de la serie Qwen3.5, incorporando mejoras en el mecanismo de atención y en el manejo de contexto largo. El modelo se entrenó con un corpus masivo de datos textuales y visuales, aunque no se especifican cifras exactas en la información disponible. El proceso de entrenamiento incluye fases de preentrenamiento y fine-tuning con técnicas de alineación como RLHF o DPO, aunque los detalles no se han publicado en esta ficha.

La cuantización GGUF se realizó con llama.cpp versión b10419, aplicando imatrix para optimizar la distribución de pesos. El repositorio incluye además archivos mmproj (multimodal projector) en f16 y bf16, necesarios para procesar imágenes junto con el modelo cuantizado. Se soporta decodificación especulativa mediante MTP, que predice múltiples tokens a la vez para reducir la latencia de generación.

## Capacidades

- Generación de texto y razonamiento complejo, con capacidad de "thinking mode" (esfuerzo de razonamiento configurable desde el prompt).
- Comprensión de imágenes: puede procesar y responder sobre contenido visual (OCR, descripción, análisis de capturas).
- Generación de código: soporta lenguajes como Python, JavaScript, etc., con mejora notable respecto a versiones anteriores.
- Tool calling / function calling: permite invocar herramientas externas en flujos de agente.
- Capacidades agénticas de largo horizonte: planificación y ejecución de tareas de varios pasos.
- Multilingüe: aunque no se especifica la lista de idiomas, la familia Qwen soporta múltiples idiomas, incluido el español.
- Soporte de contexto largo (no confirmado en esta ficha, pero se espera al menos 128K en el modelo base).

## Casos de uso

- **Automatización de oficina**: el modelo puede procesar documentos, hojas de cálculo y presentaciones (incluyendo imágenes de estas) para extraer datos, resumir contenido o generar informes. Su naturaleza multimodal le permite entender capturas de pantalla y gráficos.
- **Generación de código en producción**: con soporte de tool calling, puede integrarse en pipelines de CI/CD para revisar código, generar tests o documentar APIs. Su tamaño de 27 B permite ejecutarse en GPU de consumo con cuantizaciones Q4_K_M.
- **Asistentes de soporte técnico**: puede gestionar conversaciones multi-turno con contexto largo (si se confirma el contexto) y entender imágenes de errores o capturas de pantalla enviadas por usuarios.
- **Análisis de imágenes en entornos de oficina**: extraer texto de imágenes (OCR), interpretar gráficos o diagramas, y generar resúmenes a partir de ellos.
- **Automatización de tareas de investigación**: puede leer artículos o informes (en formato imagen o texto) y resumir, extraer conclusiones o generar citas.
- **Despliegue en hardware local**: gracias a las cuantizaciones GGUF, se puede ejecutar en portátiles con 16-32 GB de RAM (CPU) o en GPU de 24 GB VRAM (RTX 4090) para inferencia de alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del repo no incluye métricas específicas como MMLU, HumanEval o GSM8K. Se recomienda consultar la documentación del modelo base Qwen/Qwen3.8-27B para obtener datos de rendimiento.

## Requisitos de hardware

- **VRAM estimada por cuantización** (solo pesos):
  - Q2_K: ~13 GB
  - Q4_K_M: ~17.8 GB
  - Q5_K_M: ~20.8 GB
  - Q6_K: ~23.5 GB
  - Q8_0: ~29.1 GB
  - bf16: ~54.7 GB
- **GPU recomendadas**:
  - RTX 3090/4090 (24 GB) para Q4_K_M, Q5_K_M, Q6_K.
  - A100 40 GB para Q8_0 o bf16.
  - H100 para inferencia de alta velocidad con bf16.
- **Uso en CPU**: los archivos GGUF se pueden ejecutar con llama.cpp en CPU, con RAM suficiente (por ejemplo, 32 GB para Q4_K_M).
- **Opciones de despliegue**: llama.cpp, Ollama, llamafile, llama-cpp-python, TGI (soporta GGUF en versiones recientes). vLLM no soporta GGUF directamente, pero puede usar safetensors del modelo base.
- **Latencia estimada**: no disponible; dependerá del hardware y de la cuantización. Con MTP se espera una aceleración de 1.5-2x en generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Qwen3.8-27B (este) | 27 B | No disponible | Texto + imagen | Apache 2.0 | GGUF, safetensors |
| Qwen3-32B | 32 B | 128K | Texto | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-VL-32B | 32 B | 128K | Texto + imagen | Apache 2.0 | safetensors, GGUF |
| Llama 3.3 70B | 70 B | 128K | Texto | Llama 3.3 | safetensors, GGUF |

La comparación es orientativa. Qwen3.8-27B se posiciona como un modelo multimodal de tamaño intermedio, con licencia permisiva y buena relación rendimiento/recursos.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como todo LLM, puede generar información falsa o reflejar sesgos de los datos de entrenamiento. Se recomienda verificar sus respuestas en contextos críticos.
- **Contexto**: la longitud de contexto no se ha confirmado en la ficha; se debe consultar el modelo base para conocer el límite real.
- **Idioma**: aunque se espera soporte multilingüe, no se ha especificado la lista de idiomas; el rendimiento en español podría ser inferior al de inglés.
- **Uso de cuantizaciones**: las cuantizaciones bajas (Q2_K, Q3) degradan la calidad y aumentan el riesgo de errores. Se recomienda usar Q4_K_M o superior para tareas exigentes.
- **Licencia**: Apache 2.0 permite uso comercial, pero se deben mantener los avisos de licencia y atribución.
- **Dependencia de mmproj**: para entrada de imágenes es imprescindible cargar el archivo mmproj correspondiente; si se omite, el modelo no podrá procesar imágenes.

## Enlaces

- Repo HuggingFace de la cuantización: https://huggingface.co/Distillio/Qwen3.8-27B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Página oficial en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Repo GitHub de AlibabaCloud-Official/Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Cuantización GGUF en ModelScope: https://www.modelscope.cn/models/unsloth/Qwen3.8-27B-GGUF/summary
