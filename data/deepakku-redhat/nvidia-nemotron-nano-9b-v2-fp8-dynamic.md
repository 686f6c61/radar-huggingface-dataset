# deepakku-redhat/NVIDIA-Nemotron-Nano-9B-v2-FP8-dynamic

## Resumen

NVIDIA-Nemotron-Nano-9B-v2-FP8-dynamic es una versión cuantizada a FP8 (pesos y activaciones) del modelo nvidia/NVIDIA-Nemotron-Nano-9B-v2, publicada por Red Hat como parte de su catálogo de modelos validados para despliegue empresarial. El modelo original lo desarrolla NVIDIA, mientras que esta variante la produce Red Hat mediante la herramienta llm-compressor y el formato compressed-tensors, reduciendo el peso de cada parámetro de 16 a 8 bits y, con ello, el tamaño en disco y los requisitos de memoria GPU en aproximadamente un 50%.

Se trata de un modelo de generación de texto con arquitectura NemotronH (NemotronHForCausalLM), orientado a tareas conversacionales y de razonamiento, con soporte para seis idiomas (inglés, español, francés, alemán, italiano y japonés). Cuenta con 8.888.227.328 parámetros totales y un repositorio de 10,1 GB en formato safetensors.

Su relevancia actual reside en que permite desplegar un modelo de casi 9B en infraestructura con GPUs de menor capacidad o con mayor densidad por nodo, manteniendo la compatibilidad con vLLM 0.10.1.1 y con los entornos Red Hat OpenShift AI 2.25 y RHAIIS 3.2.2, lo que facilita su adopción en producción empresarial con licencia nvidia-open-model-license.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NemotronHForCausalLM (transformer, familia NemotronH) |
| Parámetros totales | 8.888.227.328 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantización | FP8 dinámico (pesos FP8 + activaciones FP8); solo se cuantizan operadores lineales de los bloques transformer |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | nvidia-open-model-license (other) |
| Formato de pesos | safetensors, formato compressed-tensors (FP8) |

## Arquitectura y entrenamiento

El modelo base es nvidia/NVIDIA-Nemotron-Nano-9B-v2, de la familia NemotronH, implementado como NemotronHForCausalLM con código personalizado (`custom_code`) en transformers. Esta variante FP8-dynamic no reentrena el modelo: aplica cuantización post-entrenamiento (PTQ) con llm-compressor sobre los pesos y las activaciones de los operadores lineales de los bloques transformer, dejando el resto de componentes en su precisión original. El resultado es un checkpoint en formato compressed-tensors listo para servir con vLLM.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. Tampoco se documentan innovaciones técnicas específicas del modelo base (como decodificación especulativa o atención lineal) más allá de la propia arquitectura NemotronH. La optimización destacable de esta ficha es la cuantización FP8 dinámica, que reduce a la mitad el espacio en disco y la VRAM necesaria frente al modelo en BF16.

## Capacidades

- Generación de texto conversacional multi-turno en seis idiomas (en, es, fr, de, it, ja).
- Razonamiento y respuesta a instrucciones en formato chat (pipeline text-generation).
- Compatibilidad con la API OpenAI a través de vLLM (`/v1/chat/completions`).
- Despliegue en entornos Red Hat AI (RHOAI 2.25, RHAIIS 3.2.2) y vLLM 0.10.1.1.
- Inferencia con cuantización FP8 dinámica de pesos y activaciones para reducir huella de memoria.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo solo de texto).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con una ventana de hasta 32.768 tokens, suficiente para incorporar historial de cliente e información de producto en el contexto, y su cuantización FP8 permite atender más sesiones concurrentes por GPU.
- Asistentes internos multilingües: al cubrir español, francés, alemán, italiano, japonés e inglés, resulta adecuado para helpdesks corporativos o bases de conocimiento internas en organizaciones europeas.
- Generación y resumen de documentación técnica: con 9B parámetros y contexto de 32K, puede resumir manuales, actas o informes largos manteniendo coherencia, desplegado con vLLM y la API compatible con OpenAI.
- Procesamiento por lotes de textos: la reducción del 50% en memoria permite ejecutar pipelines de clasificación, extracción o reescritura sobre grandes volúmenes en GPUs de gama media dentro de clústeres OpenShift AI.
- Despliegue en infraestructura Red Hat validada: al estar validado en RHOAI 2.25 y RHAIIS 3.2.2, encaja en plataformas empresariales que requieren modelos certificados y despliegue mediante ModelCar (`oci://registry.redhat.io/rhelai1/modelcar-nvidia-nemotron-nano-9b-v2-fp8-dynamic:1.5`).
- Prototipado y evaluación de aplicaciones LLM: al ser un modelo de casi 9B en FP8, permite iterar en entornos con una sola GPU y comparar frente al modelo base en BF16 antes de decidir el despliegue definitivo.
- Chatbot embebido en aplicaciones SaaS: la compatibilidad con la API OpenAI de vLLM simplifica la integración en backends existentes sin reescribir clientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB solo para pesos en FP8 (8,89B parámetros a 8 bits); con caché KV y overhead de runtime, se recomienda un mínimo de 16-24 GB de VRAM para contexto moderado y de 40-80 GB para contexto cercano a 32K.
- GPU recomendadas: NVIDIA A100, H100 o L40S para producción; el ejemplo oficial de RHAIIS usa `--tensor-parallel-size 8`, lo que sugiere despliegues multi-GPU en entornos de alta concurrencia.
- GPU de consumo: cabe en GPUs consumer con 24 GB o más (RTX 4090, RTX 3090) para contexto moderado, siempre que se valide el soporte FP8 del hardware (Ada Lovelace y posteriores lo soportan de forma nativa).
- Opciones de despliegue: vLLM 0.10.1.1 (`vllm serve RedHatAI/NVIDIA-Nemotron-Nano-9B-v2-FP8-dynamic`), Red Hat AI Inference Server (contenedor `registry.access.redhat.com/rhaiis/rh-vllm-cuda`) y Red Hat OpenShift AI mediante ServingRuntime e InferenceService. Otros motores como llama.cpp u Ollama no están documentados para este checkpoint FP8 en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-Nano-9B-v2-FP8-dynamic (esta ficha) | 8,89B | 32.768 tokens | FP8 dinámico (pesos y activaciones) | nvidia-open-model-license | Hugging Face; validado en RHOAI 2.25, RHAIIS 3.2.2 y vLLM 0.10.1.1 |
| nvidia/NVIDIA-Nemotron-Nano-9B-v2 (base) | ~9B | no disponible en la información | BF16/FP16 (original) | nvidia-open-model-license | Hugging Face |
| Alternativas de ~8-9B de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda pendiente.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; deben evaluarse empíricamente antes de un despliegue en producción.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay evaluación específica publicada en la información disponible.
- La cuantización FP8 puede introducir una degradación ligera de calidad frente al modelo base en BF16; se recomienda validar con un conjunto de evaluación propio antes de sustituir el modelo original.
- Solo se cuantizan pesos y activaciones de los operadores lineales de los bloques transformer; otras capas permanecen en su precisión original, lo que puede limitar la ganancia real de memoria frente al 50% teórico.
- Idiomas: aunque se listan seis idiomas, no se especifica el nivel de calidad por idioma; el rendimiento en español, francés, alemán, italiano y japonés puede ser inferior al del inglés.
- Licencia nvidia-open-model-license: es una licencia "other" con términos específicos de NVIDIA; es imprescindible revisar las condiciones de uso comercial y de redistribución antes de integrarla en un producto.
- El modelo está validado para versiones concretas (vLLM 0.10.1.1, RHOAI 2.25, RHAIIS 3.2.2); otras versiones pueden no funcionar correctamente con el formato compressed-tensors.
- El repositorio figura con 0 descargas y 0 likes y fue creado y actualizado el mismo día, por lo que no hay evidencia de uso en producción ni validación comunitaria independiente.
- El identificador del modelo en la información de Hugging Face (deepakku-redhat/...) difiere del indicado en la model card (RedHatAI/...); conviene verificar cuál es el repositorio canónico antes de referenciarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deepakku-redhat/NVIDIA-Nemotron-Nano-9B-v2-FP8-dynamic
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
- README de referencia citado en la model card: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-Nano-9B-v2-FP8-dynamic/main/README.md
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Modelos validados de Red Hat: https://www.redhat.com/en/products/ai/validated-models
