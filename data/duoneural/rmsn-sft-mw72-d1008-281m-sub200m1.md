# DuoNeural/RMSN-SFT-mw72-d1008-281M-Sub200M1

## Resumen

RMSN-SFT-mw72-d1008-281M-Sub200M1 es un modelo de lenguaje publicado por DuoNeural en Hugging Face. Por su identificador se deduce que es un modelo afinado con SFT (supervised fine-tuning) de la familia RMSN, con 281 millones de parámetros totales y un contexto de 1008 tokens (`d1008`), entrenado sobre un subconjunto de 200 millones de tokens (`Sub200M1`). La nomenclatura `mw72` apunta a una ventana de memoria o módulo recurrente de 72 unidades, aunque este dato no está confirmado en la información disponible.

El modelo se enmarca en una línea de investigación poco convencional: sus etiquetas mencionan `metriplectic` y `sheaf-network`, lo que sugiere una arquitectura recurrente con estructura geométrica inspirada en sistemas dinámicos metriplécticos y en haces (sheaves) sobre grafos, en lugar de un transformer estándar. Se trata, por tanto, de un modelo experimental más orientado a la investigación que a producción.

La relevancia actual es limitada: el repositorio no tiene descargas ni interacciones, la model card pública no incluye especificaciones, datos de entrenamiento ni resultados de evaluación, y el tamaño del repo (0,8 GB) es coherente con pesos en precisión de 16 bits para 281 M de parámetros. Cualquier evaluación debe hacerse con cautela y verificando el comportamiento empíricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN (recurrente, con etiquetas `metriplectic` y `sheaf-network`); detalles no disponibles |
| Parámetros totales | 281 M (según el identificador del modelo) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 1008 tokens (según el identificador `d1008`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo ocupa 0,8 GB; el formato no se especifica) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna. Las etiquetas del repositorio (`rmsn`, `metriplectic`, `sheaf-network`, `recurrent`) indican que no se trata de un transformer decoder convencional, sino de una red recurrente con una formulación matemática basada en estructuras metriplécticas (sistemas dinámicos que conservan energía y entropía de forma simultánea) y en redes de haces, una construcción algebraica que asigna datos a las aristas de un grafo y permite agregarlos de forma consistente. El sufijo `mw72` podría corresponder a un tamaño de memoria o de estado recurrente de 72 unidades, pero es una interpretación, no un dato confirmado.

Respecto al entrenamiento, el identificador indica una fase de SFT sobre un subconjunto de 200 millones de tokens (`Sub200M1`). No se especifica la composición del dataset, el número total de tokens de preentrenamiento, ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco hay información sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.) más allá de la propia formulación recurrente.

## Capacidades

- Generación de texto autoregresiva: es la función declarada por la etiqueta `language-model`; no hay evidencia publicada sobre su calidad.
- Razonamiento y matemáticas: no disponible; no se han publicado evaluaciones.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en arquitecturas recurrentes alternativas: el modelo sirve como referencia reproducible para estudiar redes RMSN con formulación metripléctica y de haces, comparando su dinámica frente a transformers de tamaño similar.
- Experimentos de contexto corto: con 1008 tokens de ventana, encaja en tareas de clasificación o generación de textos breves (titulares, etiquetas, respuestas de una frase) donde el contexto largo no es necesario.
- Prototipado académico con licencia permisiva: la licencia MIT permite modificar, redistribuir y usar el modelo en trabajos docentes o de investigación sin restricciones de uso comercial.
- Generación de texto controlada en entornos con recursos mínimos: con 281 M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para pruebas de concepto.
- Evaluación de técnicas de fine-tuning: al ser un checkpoint SFT, sirve para comparar metodologías de ajuste supervisado sobre una base no transformer.
- Reproducción de experimentos de dinámica de sistemas: la formulación metripléctica permite estudiar la estabilidad del estado recurrente y su conservación de cantidades, un caso de uso más científico que de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP16 (281 M de parámetros × 2 bytes) y unos 0,3 GB en cuantización de 8 bits; el repo de 0,8 GB es consistente con pesos en FP16 más metadatos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: no se especifica compatibilidad con vLLM, llama.cpp, Ollama o TGI; al no ser un transformer estándar, es probable que requiera el código propio del autor y no funcione con los runners genéricos. Este punto debe verificarse.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-SFT-mw72-d1008-281M-Sub200M1 | 281 M | 1008 tokens | MIT | Hugging Face, sin descargas | Arquitectura recurrente no estándar, sin benchmarks |
| GPT-2 small (referencia) | 124 M | 1024 tokens | MIT | Amplia | Transformer estándar, ecosistema maduro |
| Pythia-410M (referencia) | 410 M | 2048 tokens | Apache 2.0 | Amplia | Transformer con checkpoints intermedios y evaluaciones publicadas |
| TinyLlama-1.1B (referencia) | 1,1 B | 2048 tokens | Apache 2.0 | Amplia | Transformer con benchmarks publicados |

La comparación es orientativa: los tres modelos de referencia son transformers con soporte en herramientas estándar, mientras que el modelo de DuoNeural emplea una arquitectura distinta y carece de datos de rendimiento publicados, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni de perplejidad, lo que impide estimar su calidad frente a alternativas.
- Model card vacía: el README solo contiene metadatos de licencia y etiquetas; no se documentan datos de entrenamiento, tokenizador ni instrucciones de uso.
- Contexto muy corto: 1008 tokens limitan tareas de razonamiento largo, resumen de documentos extensos o conversaciones multi-turno.
- Idiomas no declarados: se desconoce si el modelo está entrenado principalmente en inglés, en otros idiomas o en datos sintéticos.
- Riesgo de alucinación: sin evaluación ni datos de alineación, el riesgo es indeterminado y probablemente alto en un modelo de 281 M entrenado con SFT sobre 200 M de tokens.
- Sesgos: no documentados; al no conocerse la composición del corpus, no se pueden anticipar sesgos de género, idioma o dominio.
- Compatibilidad de despliegue incierta: al no ser un transformer estándar, es posible que no funcione con vLLM, llama.cpp u Ollama sin adaptaciones.
- Licencia MIT: permite uso comercial y modificación, pero no exime de verificar el origen de los datos de entrenamiento ni de cumplir normativas aplicables.
- Madurez: cero descargas y cero interacciones en Hugging Face; no hay evidencia de uso en producción ni de mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-mw72-d1008-281M-Sub200M1
- Perfil del autor en Hugging Face: https://huggingface.co/DuoNeural
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
