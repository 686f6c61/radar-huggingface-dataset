# enver/ayncoding-gemma2-2b

## Resumen

AynCoding-Gemma2 (identificador `enver/ayncoding-gemma2-2b`) es un modelo de síntesis de código y refactorización arquitectónica desarrollado por el usuario `enver`, construido como ajuste fino del modelo base `google/gemma-2-2b-it` de Google DeepMind. Su particularidad es que integra principios de lógica clásica árabe (*Manṭiq*) y lexicografía morfológica por raíces tri-consonánticas (*Ishtiqāq*), aplicándolos como marco epistemológico para generar código más robusto y con menos fallos lógicos. El modelo ejecuta un bloque de razonamiento en cadena denominado `<ayn_mantiq>` antes de emitir el código, en el que se analizan definiciones esenciales, se eliminan dependencias circulares y se valida la consistencia arquitectónica.

Con 2.614.341.888 parámetros (aproximadamente 2.6B), el modelo está disponible en formatos safetensors y GGUF, y puede ejecutarse localmente mediante Ollama o llama.cpp. En la actualidad es un proyecto de nicho, con un dataset de entrenamiento muy reducido (50 muestras), por lo que su relevancia es más conceptual que práctica: explora cómo principios filosóficos y lingüísticos pueden condicionar la generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 2.614.341.888 (2.6B) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de uso con llama-cpp-python; coherente con el modelo base) |
| Tipos de cuantizacion | GGUF (la cuantización concreta no se especifica) |
| Idiomas soportados | inglés (en), árabe (ar) |
| Licencia | gemma (Google Gemma License) |
| Formato de pesos | safetensors (original) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 2 2B, un transformer decoder-only destilado que Google DeepMind publicó en 2024. AynCoding-Gemma2 es un ajuste fino de `google/gemma-2-2b-it`, la versión instruida del modelo base, orientado a tareas de generación de código y refactorización. Según la documentación del autor, el modelo se alinea con cinco pilares de la epistemología clásica árabe: la definición por esencia y la eliminación de circularidad de Al-Ghazālī; el análisis combinatorio de raíces tri-consonánticas de Al-Khalīl e Ibn Manẓūr; el modelado ontológico de Al-Rāghib al-Iṣfahānī; la integridad de abstracción de Al-Zamakhsharī; y la gobernanza sintáctica de Sībawayh.

El entrenamiento se realizó sobre un dataset propio de 50 muestras en formato JSONL (`ayn_mantiq_epistemic_dataset_50.jsonl`), cubriendo 10 dominios clásicos con razonamiento en cadena validado mediante AST. No se menciona el uso de RLHF ni DPO, ni datos de preentrenamiento adicionales. La innovación técnica más destacada no está en la arquitectura, sino en el protocolo de razonamiento previo: el modelo inserta etiquetas `<ayn_mantiq> ... </ayn_mantiq>` en las que explicita sus decisiones lógicas antes de generar código, lo que actúa como un Chain-of-Thought estructurado y auditable.

## Capacidades

- Generación de código Python y otros lenguajes de programación, con énfasis en limpieza estructural y ausencia de abstracciones vagas.
- Razonamiento previo a la generación mediante bloques `<ayn_mantiq>` que analizan requisitos, definiciones esenciales y posibles falacias lógicas.
- Aplicación de invariantes extraídas de la lógica clásica: eliminación de dependencias circulares, límites de recursión, prohibición de excepciones silenciosas y tipado estricto.
- Descomposición de sistemas complejos en raíces semánticas irreducibles, evitando identificadores genéricos como `data`, `temp` o `helper`.
- Soporte multilingüe limitado a inglés y árabe, tanto en la entrada como en la salida del modelo.
- Disponible en formato GGUF para despliegue con Ollama y llama.cpp, e incluye una CLI propia llamada `ayncode`.
- No se menciona soporte para tool calling / function calling en la documentación disponible.
- No se mencionan capacidades de visión ni de audio.

## Casos de uso

- Asistente de desarrollo local sin conexión: gracias a su formato GGUF y a la integración con Ollama, el modelo puede ejecutarse en un portátil o servidor sin acceso a Internet. El desarrollador puede invocarlo para generar fragmentos de código o para revisar arquitecturas pequeñas, obteniendo razonamiento estructurado tanto en inglés como en árabe.
- Auditoría y refactorización de código legacy: el modelo está condicionado para detectar dependencias circulares y recursión sin límite, lo que lo hace útil en refactorizaciones de módulos acoplados. Se le puede pedir que analice una clase y proponga una versión sin ciclos ni estados contradictorios.
- Generación de estructuras concurrentes: en la benchmark interna se demuestra su rendimiento en un rate limiter deslizante con expulsión en O(1). Puede usarse para implementar primitivas de sincronización (cerrojos, semáforos, buffers) donde el razonamiento lógico previo reduce errores difíciles de depurar.
- Enseñanza de lógica formal aplicada a programación: su especial combinación de filosofía árabe y código lo convierte en un recurso didáctico para cursos sobre ética computacional o fundamentos lógicos de la ingeniería de software, permitiendo a los estudiantes ver cómo se traducen principios abstractos a invariantes de código.
- Revisión de código en pipelines de CI/CD: aunque no soporta tool calling, el modelo puede ejecutarse como parte de un script de validación manual. Su capacidad para prohibir `except Exception: pass` o identificadores ambiguos puede ayudar a detectar malas prácticas en commits concretos, siempre que el equipo acepte la licencia Gemma.
- Chatbots técnicos bilingües: el modelo puede mantener conversaciones en inglés y árabe sobre temas de programación y arquitectura, incorporando razonamiento paso a paso. Puede integrarse en un servicio de soporte que necesite explicaciones claras en árabe clásico o moderno, aunque su corpus es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor presenta una evaluación interna propia, el "5-Pillar Static Epistemic Auditor", aplicada a una tarea concreta: un rate limiter deslizante. Los resultados son los siguientes:

| Prueba | Resultado |
|---|---|
| Overall epistemic score | 87.8% (grado B+) |
| AST syntax integrity | 100% válido |
| Banned placeholders | 0 |
| Asās al-Balāghah (eloquence) | 10.0 / 10 |
| Kitāb al-ʿAyn (decomposition) | 10.0 / 10 |
| Sībawayh (governance) | 10.0 / 10 |
| Dynamic execution | expulsión O(1) en ejecución multi-hilo |

Estos datos son específicos de una tarea de ejemplo y no son comparables con benchmarks generales. No se dispone de mediciones de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: para cuantizaciones GGUF de 2.6B se estima entre 2 y 4 GB de memoria, aunque el autor no proporciona cifras oficiales.
- El ejemplo de uso con `llama-cpp-python` utiliza CPU con 16 hilos, por lo que el modelo puede ejecutarse sin GPU en máquinas con suficiente RAM.
- GPU recomendadas: no disponible. Por tamaño, puede ejecutarse en tarjetas de consumo con 4 GB de VRAM o más (RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: Ollama (mediante Modelfile incluido), llama.cpp / llama-cpp-python, y la CLI propia `ayncode`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| enver/ayncoding-gemma2-2b | 2.6B | 8192 | Gemma | GGUF y safetensors |
| google/gemma-2-2b-it (modelo base) | 2.6B | 8192 | Gemma | safetensors |

No se dispone de otros modelos comparables en la información proporcionada. El único punto de referencia claro es el modelo base del que deriva, con la diferencia de que AynCoding-Gemma2 añade el sistema de razonamiento `<ayn_mantiq>` y un ajuste sobre un dataset muy reducido de código y lógica.

## Limitaciones y advertencias

- La licencia Gemma impone restricciones de uso, incluyendo la prohibición de ciertos usos comerciales y la obligación de cumplir los términos establecidos por Google. Antes de usar el modelo en producción hay que revisar detalladamente la licencia.
- El dataset de entrenamiento es extremadamente pequeño (50 muestras), lo que limita la generalización. El modelo puede comportarse mal fuera de los dominios específicos que cubren esas muestras.
- Solo soporta inglés y árabe. No está capacitado para español ni para otros idiomas.
- El razonamiento filosófico integrado no está validado con benchmarks estándar. Los resultados internos no demuestran una mejora medible sobre modelos de código convencionales.
- Al ser un modelo de 2.6B, el riesgo de alucinación es mayor que en modelos más grandes, especialmente en tareas complejas de arquitectura.
- La documentación es confusa y mezcla terminología clásica con requisitos de ingeniería. Esto puede dificultar la interpretación de los resultados y la evaluación real de la calidad del código generado.

## Enlaces

- HuggingFace: https://huggingface.co/enver/ayncoding-gemma2-2b
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
