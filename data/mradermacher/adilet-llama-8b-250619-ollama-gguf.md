# mradermacher/adilet-llama-8b-250619-ollama-GGUF

## Resumen

`mradermacher/adilet-llama-8b-250619-ollama-GGUF` es una colección de cuantizaciones GGUF estáticas generadas por mradermacher a partir del modelo `TECCOD/adilet-llama-8b-250619-ollama`. No se trata de un modelo entrenado desde cero, sino de una redistribución en formato GGUF (el formato de llama.cpp) pensada para ejecución local en CPU y GPU de consumo, con la librería `transformers` como metadato de compatibilidad y el ecosistema Ollama como origen del modelo base.

El modelo subyacente tiene 8.030.261.312 parámetros (aproximadamente 8B), lo que lo sitúa en la categoría de modelos densos de tamaño medio, típicos de la familia Llama. El nombre sugiere un fine-tuning sobre una base Llama de 8B, pero la model card no documenta el proceso de entrenamiento, los datos utilizados ni las capacidades específicas del modelo original.

La relevancia de este repositorio es práctica: ofrece 12 variantes de cuantización (desde Q2_K de 3,3 GB hasta f16 de 16,2 GB) que permiten desplegar el modelo en hardware muy diverso, desde portátiles con poca VRAM hasta estaciones de trabajo. El repo completo ocupa 71,8 GB y acumula 79 descargas, lo que indica un uso minoritario pero real dentro del ecosistema de modelos GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (presumiblemente familia Llama, no confirmado en la model card) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `TECCOD/adilet-llama-8b-250619-ollama`. Por el nombre y el recuento de parámetros (8B), se trata con alta probabilidad de un transformer denso de la familia Llama, pero no se confirma en la model card. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o SFT.

Lo que sí está documentado es el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (no imatrix/weighted), con `quantize_version: 2` y `output_tensor_quantised: 1`, a partir de una conversión HF. El autor indica explícitamente que las cuantizaciones ponderadas por imatrix no están disponibles en el momento de publicar y que podrían no llegar a publicarse. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline asociado indican uso previsto para diálogo multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse mediante infraestructura de inferencia estándar compatible con la API de Hugging Face.
- Ejecución local vía GGUF: pensado para llama.cpp, Ollama y derivados.
- Idiomas: únicamente inglés según los metadatos (`language: en`).
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en portátiles sin GPU dedicada: con la cuantización Q4_K_S (4,8 GB) el modelo puede ejecutarse en CPU con llama.cpp u Ollama, ocupando RAM moderada y permitiendo prototipado de asistentes conversacionales en local.
- Prototipado de chatbots en inglés: dado que el modelo solo declara soporte de inglés, es adecuado para asistentes conversacionales en ese idioma, con la ventaja de no requerir conexión a APIs externas.
- Evaluación de fine-tunes de la comunidad: al ser un derivado de un modelo Ollama de TECCOD, sirve para comparar el comportamiento de ese fine-tune frente a la base Llama 8B sin necesidad de infraestructura cloud.
- Inferencia en GPU de consumo: la variante Q8_0 (8,6 GB) cabe en GPUs con 12 GB de VRAM (RTX 3060 12GB, RTX 4070) y ofrece calidad cercana a la original con velocidad alta.
- Servicio de bajo coste en CPU: la variante Q2_K (3,3 GB) permite servir el modelo en contenedores pequeños o instancias CPU, útil para demos y pruebas de integración.
- Experimentación con cuantizaciones: el abanico de 12 variantes permite medir el impacto de la cuantización en perplejidad y calidad para este modelo concreto, usando las curvas de referencia que enlaza el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, con overhead de contexto adicional):
  - Q2_K: ~3,3 GB de pesos, ~4-5 GB con contexto.
  - Q4_K_M: ~5,0 GB de pesos, ~6-7 GB con contexto.
  - Q8_0: ~8,6 GB de pesos, ~10 GB con contexto.
  - f16: ~16,2 GB de pesos, ~18 GB con contexto.
- GPU recomendadas: RTX 3060 12GB o RTX 4070 para Q4/Q5/Q8; RTX 4090 o A100/H100 para f16 y para mayor throughput.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en GPUs de 8-12 GB; f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (el modelo base ya está en formato Ollama), y servidores compatibles con GGUF. La librería declarada es `transformers`, aunque el formato GGUF no es el nativo de transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| adilet-llama-8b-250619-ollama-GGUF | 8,03B | no disponible | no disponible | GGUF (12 cuantizaciones) | Fine-tune de TECCOD, solo inglés |
| Llama 3.1 8B Instruct (Meta) | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Referencia de la familia; contexto y licencia documentados |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa permisiva de tamaño similar |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Multilingüe y con tool calling documentado |

La comparación se ofrece como referencia de categoría; no se dispone de datos de rendimiento del modelo adilet que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que consultar el modelo base `TECCOD/adilet-llama-8b-250619-ollama` antes de usarlo en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Model card mínima: no hay información sobre sesgos, alineación, datos de entrenamiento ni evaluación de seguridad.
- Riesgo de alucinación: inherente a los modelos de 8B sin documentación de alineación; no hay evaluaciones publicadas que lo cuantifiquen.
- Cuantizaciones estáticas: el autor advierte que las variantes Q3_K_M son de menor calidad y que no hay cuantizaciones imatrix, que suelen ofrecer mejor relación calidad/tamaño.
- Repo de 71,8 GB: descargar el repositorio completo no es necesario; conviene bajar solo la cuantización deseada.
- Trazabilidad limitada: al ser un derivado de un derivado (fine-tune → Ollama → GGUF), la cadena de procedencia y los cambios respecto a la base Llama no están documentados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/adilet-llama-8b-250619-ollama-GGUF
- Modelo base: https://huggingface.co/TECCOD/adilet-llama-8b-250619-ollama
- Página de descargas del autor: https://hf.tst.eu/model#adilet-llama-8b-250619-ollama-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
