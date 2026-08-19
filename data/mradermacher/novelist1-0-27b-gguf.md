# mradermacher/Novelist1.0-27b-GGUF

## Resumen

Novelist1.0-27b-GGUF es una colección de cuantizaciones GGUF del modelo Novelist1.0-27b, desarrollado originalmente por Dxniz y cuantizado por mradermacher. El modelo base está orientado al roleplay y la escritura creativa, y se basa en la arquitectura Qwen3, según los tags del repositorio. Aunque no se especifica la variante exacta de Qwen3, el modelo cuenta con 27.320.697.856 parámetros (aproximadamente 27,32 mil millones) y soporta los idiomas inglés y turco.

La relevancia de esta versión GGUF radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantización, con opciones que van desde Q2_K (11 GB) hasta Q8_0 (29,1 GB). Además, se incluyen archivos mmproj (proyector multimodal), lo que sugiere que el modelo base podría tener capacidades multimodales, aunque no se detalla su naturaleza. Es una opción interesante para desarrolladores que buscan un modelo especializado en narrativa y diálogo con licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (según tags), variante no especificada |
| Parametros totales | 27.320.697.856 (27,32B) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | Inglés, turco |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Novelist1.0-27b. Los tags indican que es un fine-tune con LoRA merged sobre un modelo de la familia Qwen3, especializado en roleplay y escritura creativa. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El repositorio GGUF es una cuantización estática realizada por mradermacher, sin uso de imatrix (según se indica en la model card), lo que puede afectar ligeramente a la calidad en comparación con cuantizaciones ponderadas.

## Capacidades

- Generación de texto creativo: orientado a roleplay, narración de historias y diálogos.
- Escritura de ficción: capaz de producir narrativa extensa y coherente.
- Soporte multilingüe: inglés y turco.
- Posible soporte multimodal: se incluyen archivos mmproj (Q8_0 y f16), lo que sugiere que el modelo base podría procesar entradas multimodales (probablemente visión), aunque no se confirma en la documentación.
- No se especifica soporte para tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener conversaciones de personaje coherentes durante múltiples turnos, adecuado para juegos de rol textuales o chatbots narrativos.
- Escritura de novelas y relatos: genera borradores, descripciones y diálogos para autores que necesitan asistencia creativa.
- Generación de guiones para videojuegos: produce diálogos y tramas para misiones o personajes no jugadores.
- Traducción creativa: al soportar inglés y turco, puede traducir textos narrativos preservando el tono y el estilo.
- Asistente de lluvia de ideas: ayuda a escritores a explorar tramas alternativas o desarrollar personajes.
- Creación de contenido para blogs o redes sociales con estilo narrativo: genera historias cortas o anécdotas atractivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) pueden ejecutarse en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090). Q8_0 (29,1 GB) requiere al menos 32 GB de VRAM (por ejemplo, A6000 o configuraciones multi-GPU).
- GPU recomendadas: RTX 3090/4090 para cuantizaciones Q4/Q5; A6000, A100 o H100 para Q6/Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, entre otras herramientas compatibles con GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (roleplay/escritura creativa de ~27B). Se recomienda consultar el modelo base en su formato safetensors para comparaciones directas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: no hay estudios publicados; como todo modelo generativo, puede producir contenido inexacto o inventado.
- Limitaciones de idioma: solo inglés y turco; no se garantiza buen rendimiento en otros idiomas.
- Contexto: se desconoce la longitud máxima de contexto, lo que puede limitar tareas que requieran memoria a largo plazo.
- Cuantización estática: al no usar imatrix, puede haber una ligera pérdida de calidad en comparación con cuantizaciones ponderadas.
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Dxniz/Novelist1.0-27b) mantenga la misma licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Novelist1.0-27b-GGUF
- Modelo base (Dxniz/Novelist1.0-27b): https://huggingface.co/Dxniz/Novelist1.0-27b
- Página de descarga de mradermacher: https://hf.tst.eu/model#Novelist1.0-27b-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
