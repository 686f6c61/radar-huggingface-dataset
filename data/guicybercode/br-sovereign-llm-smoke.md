# guicybercode/br-sovereign-llm-smoke

## Resumen

El modelo `guicybercode/br-sovereign-llm-smoke` es un artefacto de ingeniería creado por Guilherme Monteiro (FIAP) para validar el pipeline local de entrenamiento desde cero, interrupción y reanudación en proceso, integridad, exportación y carga de un checkpoint Llama. No es un modelo de lenguaje funcional: se trata de un checkpoint diminuto de 149.696 parámetros, inicializado aleatoriamente y entrenado durante solo seis pasos de optimizador en CPU sobre ocho documentos sintéticos en portugués de Brasil.

Su relevancia es estrictamente técnica: sirve como prueba de humo (smoke test) para verificar que las rutas de guardado, reanudación y verificación de integridad funcionan correctamente en un entorno de desarrollo local. El propio autor indica explícitamente que no debe usarse para generación de texto, evaluación, tareas posteriores ni conclusiones científicas. La arquitectura es un transformer Llama en miniatura con 2 capas de decoder, tamaño oculto de 64 y contexto de 64 tokens, con pesos en float32 y formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only) en miniatura |
| Parametros totales | 149.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32, sin cuantizacion publicada) |
| Idiomas soportados | Portugues de Brasil (pt) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama estándar pero reducida a una escala mínima: 2 capas de decoder, tamaño oculto de 64, 4 cabezas de atención y 2 cabezas clave/valor. El vocabulario observado es de 447 tokens, lo que refleja un tokenizador construido sobre el corpus sintético de ocho documentos. El entrenamiento se realizó en CPU con PyTorch 2.13.0, Transformers 5.15.1 y Tokenizers 0.22.2 bajo Python 3.13.12, durante seis pasos de optimizador con una interrupción simulada después del paso 3 para validar la reanudación exacta del estado.

La innovación técnica no está en el modelo en sí, sino en el proceso: se verificó que la reanudación tras interrupción reproduce exactamente el mismo estado que la ejecución ininterrumpida, con hashes SHA-256 idénticos del estado final, y que los gradientes son finitos y no nulos. No se aplicaron técnicas como RLHF, DPO ni decodificación especulativa. El conjunto de datos de entrenamiento es un fixture público de ocho documentos sintéticos en portugués de Brasil, disponible en el dataset `guicybercode/br-sovereign-llm-corpus`.

## Capacidades

- Generación de texto: no funcional. El modelo está inicializado aleatoriamente y entrenado solo seis pasos; su salida no tiene significado semántico.
- Razonamiento, código, matemáticas, visión: ninguna. No se ha entrenado para ninguna de estas tareas.
- Tool calling / function calling: no soportado.
- Soporte de agentes y multi-step reasoning: no soportado.
- Capacidades multilingües: solo portugués de Brasil, y de forma no funcional.
- Capacidades especiales: ninguna. El único propósito es validar rutas de checkpoint y recuperación.

## Casos de uso

- Validación de pipeline de entrenamiento local: el modelo sirve para verificar que el flujo de entrenamiento desde cero, interrupción en proceso, reanudación, exportación y carga funciona correctamente en un entorno de desarrollo sin necesidad de recursos de cómputo elevados.
- Prueba de integridad de artefactos: permite comprobar que los ficheros safetensors, configuración, tokenizador y manifiestos se generan y cargan sin errores, con hashes verificables.
- Depuración de infraestructura MLOps: útil para probar integraciones con herramientas como text-generation-inference o entornos de CI/CD antes de lanzar entrenamientos reales.
- Verificación de reanudación de estado: sirve como banco de pruebas para validar que la restauración del estado de optimizador y del generador de números aleatorios reproduce exactamente la trayectoria de pérdida ininterrumpida.
- Formación interna en flujos de entrenamiento: permite a desarrolladores noveles practicar con un modelo mínimo sin necesidad de GPUs ni grandes conjuntos de datos.
- Prueba de compatibilidad de librerías: útil para validar versiones de PyTorch, Transformers y Tokenizers en un entorno nuevo antes de comprometer recursos en un entrenamiento serio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no tiene capacidad de generación de texto significativa, por lo que cualquier evaluación de calidad lingüística carecería de sentido. Los únicos datos numéricos publicados son las pérdidas del entrenamiento de validación: pérdida inicial de 6,1313, pérdida final ininterrumpida de 6,1140 y pérdida final reanudada de 6,1140, con recuperación exacta verificada mediante hashes SHA-256.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 149.696 parámetros en float32, el modelo ocupa aproximadamente 0,6 MB en memoria, por lo que cabe en cualquier CPU o GPU moderna.
- GPU recomendadas: ninguna necesaria. El entrenamiento se ejecutó en CPU y la inferencia, aunque no recomendada, podría ejecutarse en cualquier hardware.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con al menos 1 GB de VRAM sería más que suficiente, aunque no es necesario.
- Opciones de despliegue: el modelo se carga con `AutoModelForCausalLM` y `AutoTokenizer` de Transformers. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI. La inferencia alojada está deshabilitada en la model card.
- Latencia y throughput: no disponibles. El modelo no está diseñado para servir peticiones.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en la misma categoría, dado que este checkpoint es un artefacto de prueba de humo sin utilidad práctica como modelo de lenguaje. Compararlo con modelos reales de cualquier tamaño sería engañoso. Los únicos puntos de referencia son los propios datos de recuperación publicados por el autor.

## Limitaciones y advertencias

- El modelo no es apto para generación de texto ni para ninguna tarea de procesamiento de lenguaje natural. Su salida no es significativa.
- No se ha realizado ninguna evaluación de seguridad, alucinación, extracción o memorización formal. Con solo ocho documentos de entrenamiento, la reproducción de frases del corpus de entrenamiento debe asumirse posible.
- No se ha evaluado la contaminación con benchmarks, ya que el corpus de entrenamiento es un fixture público de ocho documentos sintéticos.
- La licencia Apache-2.0 se aplica a estos pesos de prueba, pero el autor advierte que no preselecciona la licencia para futuros pesos científicos entrenados sobre otro corpus.
- El modelo no establece recuperación a través de reinicios de proceso, nodo o planificador; solo valida la interrupción y reanudación dentro del mismo proceso.
- El estado del optimizador y el estado de recuperación interno `.pt` no se publican, lo que limita la reproducibilidad completa del entrenamiento.
- El tamaño del repositorio es de 0,0 GB, lo que confirma que no hay pesos sustanciales ni documentación adicional más allá de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guicybercode/br-sovereign-llm-smoke
- Perfil del autor en HuggingFace: https://huggingface.co/guicybercode
- Dataset de entrenamiento: https://huggingface.co/datasets/guicybercode/br-sovereign-llm-corpus
- Canal de YouTube del autor: https://www.youtube.com/@guicybercode
- ORCID del autor: https://orcid.org/0009-0008-5294-224X
