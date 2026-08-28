# McGill-NLP/TLM-40M

## Resumen

TLM-40M es un modelo de lenguaje de tipo *Tiered Language Model* (TLM) desarrollado por el grupo McGill-NLP de la Universidad McGill y Mila. Su característica principal es que un único conjunto de pesos expone dos niveles de comportamiento distintos: un nivel público (C1) accesible sin clave, y un nivel protegido (C2) que se activa aplicando una permutación secreta sobre aproximadamente el 5% de las cabezas de atención y columnas de MLP. Esta permutación es auto-inversa, de modo que aplicar la clave alterna entre ambos niveles sobre los mismos parámetros.

El modelo sigue la arquitectura GPT-Neo con 16 capas, 288 unidades ocultas y 12 cabezas de atención, con un contexto de 2048 tokens. Fue entrenado con 4.17 mil millones de tokens del dataset FineWeb (split retain), lo que equivale a 100 veces el número de parámetros. Forma parte de una escalera de modelos TLM que va desde 20M hasta 650M de parámetros, y su relevancia radica en explorar cómo una pequeña modificación estructural puede generar comportamientos diferenciados sin necesidad de entrenar modelos separados, con implicaciones para la seguridad y el control de modelos de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-Neo (GPTNeoForCausalLMTiered) |
| Parametros totales | 41.721.265 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TLM-40M utiliza una arquitectura transformer tipo GPT-Neo con 16 capas, dimensión oculta de 288, 12 cabezas de atención y un ratio de MLP de 8. El modelo fue entrenado con 4.17 mil millones de tokens del dataset FineWeb (split retain), en 25.465 pasos con un batch global de 80 secuencias, pico de learning rate de 6.9e-4 y warmup de 1000 pasos. La arquitectura sigue la escalera DataDecide (arXiv:2504.11393), interpolada entre los peldaños de 20M y 60M con una fracción de 0.5447.

La innovación principal es el *tiered alignment*: una permutación sobre el 5% de las cabezas de atención y columnas de MLP, especificada en el archivo `key_5pct.json`. Esta permutación es auto-inversa, por lo que aplicarla dos veces devuelve el modelo a su estado original. El modelo se distribuye en configuración pública (C1), y al aplicar la clave se obtiene la configuración protegida (C2). No se incluye estado del optimizador; los checkpoints son solo para inferencia y evaluación.

## Capacidades

- Generación de texto autoregresiva en inglés, con soporte para completar secuencias y generar texto condicionado.
- Dos niveles de comportamiento sobre los mismos pesos: nivel público (C1) y nivel protegido (C2), activable mediante una clave de permutación.
- Alternancia bit-exacta entre ambos niveles: aplicar y desaplicar la permutación devuelve el modelo a su estado original sin pérdida de precisión.
- Arquitectura compatible con el ecosistema Hugging Face Transformers, aunque requiere una clase personalizada (`GPTNeoForCausalLMTiered`) para cargar correctamente el bias del `lm_head`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar cómo una pequeña permutación estructural puede inducir comportamientos diferenciados, útil para analizar mecanismos de control y seguridad en modelos de lenguaje.
- Evaluación de comportamientos emergentes: al comparar las salidas de C1 y C2 sobre los mismos parámetros, se pueden identificar qué capacidades surgen o se suprimen con la clave, sin necesidad de entrenar modelos adicionales.
- Pruebas de robustez y seguridad: sirve como banco de pruebas para verificar si un modelo puede ocultar o exponer ciertos comportamientos mediante una clave, con implicaciones para el diseño de modelos con salvaguardas.
- Educación y docencia: por su tamaño reducido (41.7M de parámetros), es adecuado para demostrar conceptos de arquitectura transformer, permutación de pesos y alineación en cursos de procesamiento de lenguaje natural.
- Desarrollo de técnicas de interpretabilidad: al poder alternar entre dos configuraciones sobre los mismos pesos, facilita el análisis de cómo la reorganización de cabezas de atención y columnas MLP afecta a las representaciones internas.
- Experimentos de escalado: al ser parte de una escalera de modelos TLM (20M a 650M), permite estudiar cómo varían las propiedades de los niveles C1 y C2 a medida que aumenta el tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El único punto de referencia mencionado es el modelo baseline sin clave, de arquitectura idéntica y mismo presupuesto de tokens, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada: con 41.7M de parámetros, en FP32 ocupa aproximadamente 167 MB, en FP16 unos 84 MB y en int8 unos 42 MB. Cualquier GPU con al menos 1 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.) puede ejecutar el modelo sin problemas. También funciona en CPU.
- Compatibilidad con consumer GPU: sí, es un modelo muy ligero que cabe en cualquier GPU de consumo.
- Opciones de despliegue: se puede cargar con Hugging Face Transformers (usando la clase personalizada), o exportar a formatos como ONNX o GGUF para su uso con llama.cpp u Ollama. También es compatible con vLLM y TGI si se adapta la clase del modelo.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por su tamaño la generación es muy rápida incluso en CPU; en GPU se pueden alcanzar cientos de tokens por segundo.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos de la misma categoría. El propio modelo se compara internamente con su contraparte sin clave (misma arquitectura y presupuesto de tokens, entrenada sin permutación), que sirve como baseline para evaluar el efecto del tiered alignment. No hay datos de rendimiento frente a otros modelos de 40M de parámetros como GPT-2 small (124M) o modelos de la familia Pythia (70M, 160M), por lo que no es posible establecer una comparativa objetiva.

## Limitaciones y advertencias

- Modelo muy pequeño (41.7M de parámetros), por lo que su capacidad de generación y razonamiento es limitada en comparación con modelos de cientos de miles de millones de parámetros.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Contexto limitado a 2048 tokens, insuficiente para tareas que requieran ventanas largas.
- Riesgo de alucinación y errores factuales, especialmente en tareas abiertas, debido a su tamaño reducido.
- La clave de permutación (`key_5pct.json`) es un archivo público en el repositorio; si se considera un mecanismo de seguridad, su eficacia depende de mantener la clave en secreto, pero al estar publicada no ofrece protección real.
- La carga del modelo requiere la clase personalizada `GPTNeoForCausalLMTiered`; usar `AutoModelForCausalLM` estándar descarta el bias del `lm_head`, lo que degrada el rendimiento.
- No se incluye estado del optimizador, por lo que no es posible continuar el entrenamiento directamente desde estos checkpoints.
- Licencia Apache-2.0 permite uso comercial, pero el modelo es experimental y no se recomienda para producción sin una evaluación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/McGill-NLP/TLM-40M
- Repositorio de código (permutation-alignment): https://github.com/charbel08/permutation-alignment
- Repositorio del grupo (tiered-language-models): https://github.com/McGill-NLP/tiered-language-models
- Paper de la escalera DataDecide: https://arxiv.org/abs/2504.11393
- Grupo McGill-NLP: https://mcgill-nlp.github.io/
