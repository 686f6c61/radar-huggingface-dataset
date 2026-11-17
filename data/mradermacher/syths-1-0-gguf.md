# mradermacher/SYTHS-1.0-GGUF

## Resumen

SYTHS-1.0-GGUF es una cuantización estática del modelo SYTHS-1.0, publicada por el usuario mradermacher en Hugging Face. El repositorio contiene únicamente pesos en formato GGUF generados con la herramienta de cuantización de llama.cpp (se observa la etiqueta `quantize_version: 2`), pensados para inferencia local eficiente en CPU y GPU de gama baja. No se trata de un modelo original entrenado por mradermacher, sino de una conversión del modelo base `sovythos/SYTHS-1.0`.

El modelo base cuenta con 331.416.576 parámetros totales según los datos de safetensors, lo que lo sitúa en la categoría de modelos pequeños (aproximadamente 0,33 mil millones de parámetros). Esa escala permite ejecutarlo en hardware muy modesto, incluso en CPU, y encaja en escenarios de prototipado rápido, experimentación y despliegue en entornos con recursos limitados.

La relevancia de esta ficha es limitada por la escasez de información pública: la model card del repositorio no incluye descripción del modelo base, datos de entrenamiento, licencia, idiomas ni benchmarks. Todo lo que se puede afirmar con rigor procede de los metadatos del repositorio y de la lista de cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `sovythos/SYTHS-1.0`; no se especifica transformer, MoE u otra) |
| Parametros totales | 331.416.576 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base `sovythos/SYTHS-1.0`: la model card del repositorio GGUF no describe si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o un SSM. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

Lo único verificable es el proceso de conversión: los pesos se han convertido desde el formato Hugging Face (`convert_type: hf`) y cuantizado con la versión 2 del pipeline de cuantización de llama.cpp, con cuantización de tensores de salida activada (`output_tensor_quantised: 1`). El repositorio ocupa 1,0 GB e incluye doce variantes de cuantización, desde x-f16 (sin pérdida apreciable) hasta Q2_K (máxima compresión).

## Capacidades

- Generación de texto autoregresiva: capacidad esperable en cualquier modelo de lenguaje, aunque no se documenta explícitamente en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local en CPU y GPU mediante llama.cpp y derivados, gracias al formato GGUF.

## Casos de uso

- Prototipado de pipelines de inferencia local: al ser un modelo de 0,33 mil millones de parámetros en GGUF, permite validar integraciones con llama.cpp, Ollama o servidores compatibles sin necesidad de GPU dedicada.
- Pruebas de cuantización y evaluación de degradación: el repositorio ofrece doce variantes (de x-f16 a Q2_K), lo que facilita experimentos comparativos sobre cómo afecta cada nivel de cuantización a la calidad de salida en una tarea concreta.
- Despliegue en dispositivos de borde: el tamaño reducido (1,0 GB de repositorio completo, con variantes individuales mucho menores) permite ejecutarlo en Raspberry Pi, mini-PC o portátiles sin GPU.
- Generación de texto de bajo coste en entornos educativos: útil para demostraciones de inferencia de modelos de lenguaje en aulas o talleres donde no hay acceso a hardware de datacenter.
- Filtrado o clasificación de texto a pequeña escala: si el modelo base rinde aceptablemente en tareas de clasificación, la variante Q4_K_M o Q5_K_M ofrece un equilibrio razonable entre calidad y velocidad en CPU.
- Evaluación comparativa de modelos pequeños: sirve como referencia de la categoría sub-1B para contrastar con otros modelos del mismo orden de magnitud en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero por el tamaño del modelo (331 millones de parámetros) las variantes cuantizadas caben holgadamente en menos de 1 GB de memoria; la variante x-f16 requiere aproximadamente 0,7 GB solo para pesos, más overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las variantes cuantizadas; una RTX 3060, RTX 4060 o superior ofrece margen amplio para contextos largos.
- Compatibilidad con GPU de consumo: sí, en todas las GPU de consumo modernas e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable; el modelo es lo bastante pequeño para inferencia en CPU con velocidades interactivas en las variantes Q4 y Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con GGUF (p. ej. llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se requeriría el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la variante de cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SYTHS-1.0-GGUF | 331.416.576 | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Modelo base `sovythos/SYTHS-1.0` | 331.416.576 (según safetensors del derivado) | no disponible | no disponible | safetensors | Hugging Face |
| Alternativas sub-1B (p. ej. Qwen2.5-0.5B, SmolLM2-360M) | ~0,36-0,5 mil millones | 32K en Qwen2.5-0.5B; 8K en SmolLM2 | Apache 2.0 en Qwen2.5; Apache 2.0 en SmolLM2 | safetensors, GGUF | Hugging Face |

La comparación con alternativas conocidas es aproximada: no hay datos públicos de rendimiento de SYTHS-1.0 que permitan situarlo frente a Qwen2.5-0.5B o SmolLM2-360M. La ventaja principal de SYTHS-1.0-GGUF es la disponibilidad de doce variantes de cuantización en un único repositorio; la desventaja es la ausencia de documentación sobre licencia, idiomas y capacidades.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documentan arquitectura, datos de entrenamiento, idiomas ni licencia, lo que impide evaluar su idoneidad para producción.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe consultarse el repositorio del modelo base `sovythos/SYTHS-1.0` antes de cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en un modelo de 0,33 mil millones de parámetros el riesgo es mayor que en modelos de mayor escala, aunque no hay datos que lo cuantifiquen.
- Sesgos conocidos: no disponibles; al no documentarse el dataset de entrenamiento, no se puede evaluar la presencia de sesgos de género, etnia, idioma o dominio.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva y los idiomas cubiertos.
- Trazabilidad limitada: el repositorio es una conversión de terceros (mradermacher) sobre un modelo base de otro autor (sovythos); conviene verificar la integridad de los pesos y la correspondencia con el modelo original.
- Idoneidad para producción: baja sin documentación adicional; recomendable solo para experimentación y prototipado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SYTHS-1.0-GGUF
- Modelo base: https://huggingface.co/sovythos/SYTHS-1.0
- Herramienta de cuantización (llama.cpp): https://github.com/ggerganov/llama.cpp
