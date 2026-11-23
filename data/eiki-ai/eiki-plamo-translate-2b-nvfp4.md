# Eiki-AI/eiki-plamo-translate-2b-NVFP4

## Resumen

Eiki PLaMo Translate 2B (NVFP4) es una cuantización en FP4 de 4 bits del modelo de traducción `Eiki-AI/eiki-plamo-translate-2b`, a su vez un fine-tune comunitario del `pfnet/plamo-3-translate-2b` de Preferred Networks. El modelo está especializado en traducción automática multilingüe y cubre siete idiomas: inglés, japonés, afrikáans, noruego, portugués, sueco y turco. La cuantización se ha exportado mediante `nvidia-modelopt` con la configuración `NVFP4_DEFAULT_CFG`, calibrada sobre 128 prompts del conjunto V6.1, y está pensada específicamente para GPUs NVIDIA Blackwell.

El modelo cuenta con 2.878.595.584 parámetros totales (aproximadamente 2,9 mil millones) y un repositorio de 2,4 GB, lo que refleja el ahorro de espacio que aporta el formato FP4 frente a los pesos en BF16. Su propósito es ofrecer traducción de alta calidad en un formato de muy baja precisión, manteniendo la fidelidad respecto al modelo original en BF16 según las métricas chrF++ publicadas por el autor.

La relevancia de esta ficha radica en que ejemplifica el patrón de cuantización agresiva (FP4) aplicada a modelos de traducción de tamaño medio, con evaluación explícita de la degradación de calidad por dirección de traducción. Es un artefacto de interés para quienes despliegan traducción en hardware Blackwell y necesitan reducir el coste de memoria e inferencia sin renunciar a la mayor parte de la calidad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia PLaMo 3; detalles internos no disponibles) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (FP4 de 4 bits, exportado con `nvidia-modelopt`); el modelo base admite BF16 |
| Idiomas soportados | en, ja, af, no, pt, sv, tr |
| Licencia | PLaMo Community License (`license: other`) |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia PLaMo 3, aunque la model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención ni tipo de tokenizador). Se trata de un fine-tune del `pfnet/plamo-3-translate-2b` de Preferred Networks, orientado específicamente a traducción. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica principal de esta variante es la cuantización NVFP4: los pesos se han convertido a FP4 de 4 bits mediante `nvidia-modelopt` usando `NVFP4_DEFAULT_CFG` y calibración sobre 128 prompts del conjunto V6.1. El resultado es un checkpoint optimizado para GPUs NVIDIA Blackwell, con un tamaño de repositorio de 2,4 GB. El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código personalizado incluido en el repositorio.

## Capacidades

- Traducción automática bidireccional entre inglés y los idiomas afrikáans, noruego, portugués, sueco, turco y japonés, además de direcciones adicionales evaluadas (inglés a neerlandés, alemán y ruso; serbio a inglés).
- Generación de texto orientada a la tarea de traducción (pipeline `translation`).
- Soporte multilingüe limitado al conjunto de idiomas declarado (en, ja, af, no, pt, sv, tr).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se documenta un modo "thinking" ni capacidades de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica y manuales entre inglés y portugués, sueco o noruego: el modelo mantiene puntuaciones chrF++ superiores a 80 en varias direcciones (inglés-portugués 79,97; sueco-inglés 81,88 en NVFP4), adecuado para contenido técnico con terminología estable.
- Localización de interfaces y cadenas de producto para mercados nórdicos y turco: la calidad en inglés-sueco (85,22) e inglés-turco (76,47) permite flujos de localización semiautomáticos con revisión humana.
- Traducción de correspondencia y soporte al cliente en portugués e inglés: la dirección portugués-inglés alcanza 83,12 chrF++, lo que lo hace viable para preprocesar tickets antes de su clasificación o enrutado.
- Procesamiento por lotes de corpus multilingües en pipelines de datos: el formato NVFP4 reduce el coste de memoria y permite mayor densidad de peticiones por GPU Blackwell en tareas de traducción masiva.
- Traducción de contenido editorial entre inglés y afrikáans o noruego para medios regionales: con chrF++ en torno a 63-68, requiere postedición pero acelera el borrador inicial.
- Integración en servicios de traducción bajo vLLM con `trust_remote_code=True`: el autor documenta explícitamente el uso con vLLM, lo que facilita el despliegue como endpoint de traducción con temperatura 0 y `repetition_penalty=1.05`.

## Benchmarks y rendimiento

Resultados chrF++ publicados por el autor (vLLM, `temp=0`, `repetition_penalty=1.05`), comparando BF16 frente a NVFP4:

| Direccion | BF16 | NVFP4 |
|---|---:|---:|
| Inglés -> Afrikáans (100 V6 test) | 68,40 | 67,63 |
| Afrikáans -> Inglés (100 V6 test) | 69,75 | 68,28 |
| Inglés -> Noruego (100 V6 test) | 64,15 | 63,49 |
| Noruego -> Inglés (100 V6 test) | 68,19 | 67,11 |
| Inglés -> Portugués (100 V6 test) | 80,65 | 79,97 |
| Portugués -> Inglés (100 V6 test) | 84,10 | 83,12 |
| Inglés -> Sueco (100 V6 test) | 85,16 | 85,22 |
| Sueco -> Inglés (100 V6 test) | 84,37 | 81,88 |
| Inglés -> Turco (100 V6 test) | 76,14 | 76,47 |
| Turco -> Inglés (100 V6 test) | 81,26 | 80,40 |
| Inglés -> Japonés (50 OPUS-100) | 16,62 | 16,27 |
| Inglés -> Neerlandés (50 OPUS-100) | 48,84 | 48,69 |
| Inglés -> Alemán (50 OPUS-100) | 46,64 | 46,25 |
| Inglés -> Ruso (50 OPUS-100) | 45,45 | 45,38 |
| Serbio -> Inglés (50 FLORES cirílico) | 53,65 | 51,94 |

La degradación por cuantización es en general inferior a 1 punto chrF++ en la mayoría de direcciones, con la excepción de sueco-inglés (caída de 2,49 puntos) y serbio-inglés (caída de 1,71 puntos). El rendimiento en inglés-japonés es muy bajo (16,27-16,62), lo que sugiere que esa dirección no está bien cubierta pese a estar declarada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,4 GB en NVFP4, por lo que la inferencia cabe holgadamente en GPUs con 8 GB o más, aunque el soporte de NVFP4 está restringido a hardware Blackwell.
- GPU recomendadas: NVIDIA Blackwell (por ejemplo, B200 o RTX 50 series) para aprovechar el formato NVFP4. En GPUs no Blackwell no se garantiza el soporte nativo de FP4.
- Cabe en GPU de consumo: sí, en tarjetas Blackwell de consumo con al menos 8 GB de VRAM; en otras arquitecturas habría que recurrir al modelo base en BF16 o a otra cuantización.
- Opciones de despliegue: vLLM es la vía documentada por el autor (`trust_remote_code=True`, `dtype="auto"`). No se documentan opciones con llama.cpp, Ollama ni TGI para este checkpoint NVFP4.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Eiki-AI/eiki-plamo-translate-2b-NVFP4 | 2,88 B | No disponible | NVFP4 | PLaMo Community License | Requiere GPU Blackwell |
| Eiki-AI/eiki-plamo-translate-2b | No disponible | No disponible | BF16 (presumible) | PLaMo Community License | Modelo base del fine-tune |
| pfnet/plamo-3-translate-2b | No disponible | No disponible | No disponible | PLaMo Community License | Modelo original de Preferred Networks |

No se dispone de datos de benchmarks comparativos con otras familias de traducción (por ejemplo, NLLB o M2M-100) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- La licencia PLaMo Community License impone condiciones para uso comercial y redistribución, incluyendo registro previo y umbrales de ingresos anuales; es imprescindible revisar el archivo `LICENSE` antes de desplegar en producción.
- Es un fine-tune comunitario no oficial, no afiliado ni respaldado por Preferred Networks.
- El rendimiento en inglés-japonés es muy bajo (16,27-16,62 chrF++), lo que desaconseja su uso en esa dirección pese a estar declarada.
- La cuantización NVFP4 degrada la calidad de forma desigual: la caída es notable en sueco-inglés (81,88 frente a 84,37 en BF16) y serbio-inglés (51,94 frente a 53,65).
- El formato NVFP4 está ligado a GPUs NVIDIA Blackwell; en otro hardware puede no ser compatible o no ofrecer ventajas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de usarlo en entornos sensibles.
- No se documentan sesgos específicos ni tasas de alucinación; como todo modelo de traducción, puede producir omisiones, adiciones o traducciones literalmente incorrectas en dominios especializados.
- No se especifica la longitud de contexto soportada, lo que limita la planificación de documentos largos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eiki-AI/eiki-plamo-translate-2b-NVFP4
- Modelo base del fine-tune: https://huggingface.co/Eiki-AI/eiki-plamo-translate-2b
- Modelo original de Preferred Networks: https://huggingface.co/pfnet/plamo-3-translate-2b
- Licencia: incluida como `LICENSE` en el repositorio del modelo
