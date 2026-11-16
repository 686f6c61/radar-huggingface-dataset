# Eiki-AI/plamo-3-translate-2b-af-q4_k_m

## Resumen

PLaMo-3-Translate-2B-AF (Q4_K_M GGUF) es una cuantización y ajuste fino experimental no oficial del modelo de traducción pfnet/plamo-3-translate-2b de Preferred Networks. El objetivo es añadir el afrikáans (`af`) como idioma de traducción junto al inglés (`en`) y al japonés (`ja`) que ya cubría el modelo base. El resultado se distribuye como un único archivo GGUF cuantizado en Q4_K_M, pensado para ejecutarse con llama.cpp en entornos con recursos limitados.

El modelo base es un transformer de aproximadamente 2.878 millones de parámetros (2,88B), especializado en traducción y entrenado por Preferred Networks. Este derivado aplica un ajuste LoRA sobre dicho base para incorporar el afrikáans y posteriormente lo cuantiza a 4 bits, reduciendo el peso del repositorio a unos 1,8 GB. Se trata de un checkpoint temprano (`checkpoint-7000`), por lo que su calidad es usable para borradores y traducción general, pero no está exento de errores léxicos ni de contaminación del neerlandés.

Su relevancia es doble: por un lado, demuestra la viabilidad de extender la cobertura idiomática de un modelo de traducción compacto mediante ajuste fino ligero; por otro, ofrece una alternativa de despliegue local muy económica para pares de idiomas que incluyan afrikáans, inglés o japonés. No obstante, al ser un derivado no oficial y experimental, debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base PLaMo-3-Translate-2B; detalles internos no disponibles) |
| Parámetros totales | 2.878.595.584 (~2,88B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | inglés (`en`), japonés (`ja`), afrikáans (`af`) |
| Licencia | PLaMo Community License (uso comercial y redistribución sujetos a condiciones, incluidos umbrales de registro/ingresos) |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo deriva de pfnet/plamo-3-translate-2b, un transformer de 2,88B parámetros especializado en traducción. Sobre esa base se aplicó un ajuste fino LoRA orientado a incorporar el afrikáans, seguido de una cuantización Q4_K_M para producir el archivo GGUF distribuido. La model card no detalla la composición del dataset de ajuste ni el número de tokens utilizados; solo se indica que la evaluación se realizó sobre frases de test del conjunto `nllb-english-bitext-hq`.

El checkpoint publicado corresponde al paso 7000 de entrenamiento y se etiqueta explícitamente como experimental. El prompt recomendado es el formato PFML3 propio de PLaMo-3, con `temperature=0`, `repeat_penalty=1.05` y tokens de parada `<|plamo:tag|>` y `<|plamo:bos|>`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción entre inglés, japonés y afrikáans, en las combinaciones que el modelo base y el ajuste permiten.
- Generación de texto conversacional (tag `conversational`), orientada a tareas de traducción.
- Salida determinista recomendada mediante `temperature=0`, adecuada para pipelines reproducibles.
- Ejecución local eficiente gracias a la cuantización Q4_K_M y al formato GGUF compatible con llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción local de documentación técnica entre inglés y afrikáans: al pesar ~1,8 GB en Q4_K_M, el modelo cabe en equipos modestos y permite traducir manuales o notas sin enviar datos a la nube.
- Borradores de traducción para localización de productos: útil como primera pasada que un traductor humano revisa después, dado el rendimiento aproximado de ~55 chrF++ en frases de test.
- Traducción japonés-inglés en entornos con GPU de gama baja: el modelo base ya cubre `ja`, y la cuantización permite desplegarlo en hardware consumer.
- Prototipado rápido de pipelines de traducción con llama.cpp: el formato GGUF y los tokens de parada documentados simplifican la integración en scripts y servicios ligeros.
- Evaluación comparativa de modelos de traducción compactos: sirve como referencia para medir la calidad de un ajuste LoRA idiomático frente a modelos multilingües mayores.
- Traducción de contenido conversacional (soporte, chats) en afrikáans: el tag `conversational` y el modo determinista lo hacen adecuado para respuestas consistentes en atención básica.
- Investigación sobre extensión idiomática de modelos de traducción: el checkpoint experimental permite estudiar la contaminación entre idiomas cercanos (afrikáans y neerlandés).

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| chrF++ (frases de test de `nllb-english-bitext-hq`) | ~55 | Afrikáans, checkpoint-7000, Q4_K_M |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con Q4_K_M, incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo es pequeño y no aprovecha hardware de gama alta.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4060).
- Opciones de despliegue: llama.cpp (recomendado por el autor), Ollama, servidores compatibles con endpoints y cualquier runtime que cargue GGUF.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 2,88B en 4 bits, se espera una latencia baja en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo-3-Translate-2B-AF (este) | ~2,88B | no disponible | en, ja, af | PLaMo Community License | GGUF Q4_K_M |
| pfnet/plamo-3-translate-2b (base) | ~2,88B | no disponible | en, ja (según model card base) | PLaMo Community License | safetensors y derivados |
| Modelos de traducción multilingües tipo NLLB | no disponible en esta ficha | no disponible | multilingüe | varía | varía |

La comparación con alternativas de la misma categoría (modelos de traducción compactos) no está disponible con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Modelo derivado no oficial, no afiliado ni respaldado por Preferred Networks.
- Checkpoint experimental (`checkpoint-7000`): calidad de afrikáans usable para borradores, pero con errores léxicos ocasionales.
- Riesgo de contaminación del neerlandés en la salida en afrikáans, por cercanía entre ambos idiomas.
- Riesgo de alucinación y de traducciones inexactas en dominios especializados no cubiertos por el ajuste.
- Cobertura idiomática limitada a inglés, japonés y afrikáans; no se documentan otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar el truncado de documentos largos con precisión.
- Licencia PLaMo Community License: el uso comercial y la redistribución están sujetos a condiciones, incluidos umbrales de registro e ingresos; revisar el texto de la licencia antes de desplegar.
- Al ser una cuantización Q4_K_M, puede existir una pérdida de calidad respecto al modelo base en precisión completa.
- Sin datos de benchmarks más allá de chrF++, no es posible comparar rigurosamente con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eiki-AI/plamo-3-translate-2b-af-q4_k_m
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Licencia PLaMo Community License: incluida en el repositorio como `LICENSE`
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios o demos.
