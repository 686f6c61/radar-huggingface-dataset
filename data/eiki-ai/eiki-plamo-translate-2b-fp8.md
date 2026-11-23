# Eiki-AI/eiki-plamo-translate-2b-FP8

## Resumen

Eiki PLaMo Translate 2B (FP8) es una versión cuantizada a FP8 del modelo de traducción `Eiki-AI/eiki-plamo-translate-2b`, un fine-tune comunitario del modelo `pfnet/plamo-3-translate-2b` desarrollado por Preferred Networks. El modelo está especializado en traducción automática multilingüe y cubre direcciones bidireccionales entre inglés y un conjunto de lenguas (japonés, afrikáans, noruego, portugués, sueco y turco), además de algunos pares adicionales evaluados en la model card (neerlandés, alemán, ruso y serbio).

La relevancia de esta variante radica en su cuantización FP8, exportada mediante `nvidia-modelopt` con la configuración `FP8_DEFAULT_CFG` y calibrada sobre 128 prompts V6.1. Según los datos publicados por el autor, la pérdida de calidad frente a BF16 es mínima e incluso en algunos pares mejora ligeramente, lo que permite reducir el peso del repositorio a 3,4 GB y desplegar el modelo con mayor eficiencia en memoria.

Con 2.878.595.584 parámetros totales (aproximadamente 2,9 mil millones), el modelo se sitúa en la gama compacta de traducción, lo que lo hace apto para despliegues en una sola GPU. La licencia es la PLaMo Community License, con restricciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de PLaMo 3, no se detalla la variante exacta) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (exportado con `nvidia-modelopt`, `FP8_DEFAULT_CFG`, calibrado sobre 128 prompts V6.1) |
| Idiomas soportados | en, ja, af, no, pt, sv, tr (evaluados además nl, de, ru y sr) |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `pfnet/plamo-3-translate-2b` de Preferred Networks, que a su vez pertenece a la familia PLaMo 3. La model card no detalla la arquitectura interna más allá de la etiqueta `plamo3` y la referencia al transformer base; no se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa.

El entrenamiento del fine-tune comunitario tampoco está documentado en la información disponible: no se indican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable de esta variante es la cuantización FP8 mediante `nvidia-modelopt`, calibrada sobre 128 prompts V6.1, que según el autor mantiene e incluso mejora ligeramente la métrica chrF++ en varias direcciones de traducción respecto al modelo en BF16.

## Capacidades

- Traducción automática bidireccional entre inglés y japonés, afrikáans, noruego, portugués, sueco y turco.
- Evaluación adicional (según la model card) en direcciones inglés→neerlandés, inglés→alemán, inglés→ruso y serbio→inglés, lo que sugiere cierta generalización a otros pares.
- Generación de texto orientada a tareas de traducción (pipeline `translation`).
- Soporte multilingüe limitado a los idiomas declarados (en, ja, af, no, pt, sv, tr).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- Inferencia compatible con vLLM usando `trust_remote_code=True` y `dtype="auto"`.

## Casos de uso

- Traducción de documentación técnica del inglés al sueco o portugués: el modelo ofrece chrF++ de 85,50 y 80,39 respectivamente en la evaluación V6, lo que lo hace adecuado para localización de manuales y guías con revisión humana posterior.
- Localización de interfaces de producto hacia turco y afrikáans: con chrF++ de 77,05 (en→tr) y 68,98 (en→af), resulta útil para equipos que necesitan traducciones rápidas en mercados emergentes.
- Traducción inversa de contenido generado por usuarios (noruego→inglés, sueco→inglés) en plataformas de soporte: chrF++ de 68,36 y 83,83 permiten moderar y enrutar tickets en inglés.
- Pipeline de traducción por lotes con vLLM: el formato FP8 y los 3,4 GB del repositorio permiten desplegar el modelo en una GPU consumer y procesar grandes volúmenes con `temp=0` y `repetition_penalty=1.05`, como en la evaluación del autor.
- Traducción de correspondencia comercial portugués→inglés: chrF++ de 85,04 en la dirección pt→en lo sitúa como opción para automatizar respuestas en atención al cliente.
- Prototipado de sistemas de traducción multilingüe en investigación: el modelo sirve como baseline compacto para comparar técnicas de cuantización (BF16 vs FP8) con métricas chrF++ publicadas.
- Traducción de contenido hacia japonés en contextos experimentales: chrF++ de 16,75 en en→ja (OPUS-100) es bajo, por lo que solo sería adecuado con revisión intensiva o como componente de un sistema mayor.

## Benchmarks y rendimiento

Datos publicados por el autor (chrF++, vLLM, `temp=0`, `repetition_penalty=1.05`):

| Direccion | BF16 | FP8 |
|---|---:|---:|
| English → Afrikaans (100 V6 test) | 68,40 | 68,98 |
| Afrikaans → English (100 V6 test) | 69,75 | 70,04 |
| English → Norwegian (100 V6 test) | 64,15 | 63,98 |
| Norwegian → English (100 V6 test) | 68,19 | 68,36 |
| English → Portuguese (100 V6 test) | 80,65 | 80,39 |
| Portuguese → English (100 V6 test) | 84,10 | 85,04 |
| English → Swedish (100 V6 test) | 85,16 | 85,50 |
| Swedish → English (100 V6 test) | 84,37 | 83,83 |
| English → Turkish (100 V6 test) | 76,14 | 77,05 |
| Turkish → English (100 V6 test) | 81,26 | 81,15 |
| English → Japanese (50 OPUS-100) | 16,62 | 16,75 |
| English → Dutch (50 OPUS-100) | 48,84 | 48,80 |
| English → German (50 OPUS-100) | 46,64 | 46,47 |
| English → Russian (50 OPUS-100) | 45,45 | 44,24 |
| Serbian → English (50 FLORES Cyrillic) | 53,65 | 53,99 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,4 GB en FP8; en la práctica se recomienda al menos 6-8 GB de VRAM para pesos, caché KV y overhead de runtime (estimación, no dato oficial).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más de VRAM en FP8.
- Opciones de despliegue: vLLM (documentado en la model card con `trust_remote_code=True` y `dtype="auto"`); no se confirman llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Eiki-AI/eiki-plamo-translate-2b-FP8 | 2,88 B | no disponible | PLaMo Community License | safetensors FP8 | Variante cuantizada del fine-tune comunitario |
| Eiki-AI/eiki-plamo-translate-2b | 2,88 B (estimado) | no disponible | PLaMo Community License | safetensors BF16 | Modelo base del FP8, sin cuantizar |
| pfnet/plamo-3-translate-2b | no disponible | no disponible | PLaMo Community License | safetensors | Modelo original de Preferred Networks |

No se dispone de datos de benchmarks de modelos alternativos de otros autores en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia PLaMo Community License impone condiciones para uso comercial y redistribución, incluyendo registro previo y umbrales de ingresos anuales; es imprescindible revisar el archivo LICENSE antes de desplegar en producción.
- Es un fine-tune comunitario no oficial, no afiliado ni respaldado por Preferred Networks.
- El rendimiento en inglés→japonés es muy bajo (chrF++ 16,75), lo que desaconseja su uso en ese par sin revisión humana intensiva.
- El rendimiento en inglés→ruso cae de 45,45 (BF16) a 44,24 (FP8), y en inglés→alemán de 46,64 a 46,47; la cuantización no es neutra en todos los pares.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de contexto más allá de lo indicado.
- La longitud de contexto no está publicada, lo que dificulta planificar el procesamiento de documentos largos.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de desplegarlo.
- No se confirma soporte para llama.cpp, Ollama ni otros runtimes además de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eiki-AI/eiki-plamo-translate-2b-FP8
- Modelo base del fine-tune: https://huggingface.co/Eiki-AI/eiki-plamo-translate-2b
- Modelo original de Preferred Networks: https://huggingface.co/pfnet/plamo-3-translate-2b
- Licencia: https://huggingface.co/Eiki-AI/eiki-plamo-translate-2b-FP8/blob/main/LICENSE
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
