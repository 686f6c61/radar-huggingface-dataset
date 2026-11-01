# MishraNepali/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW-Q2_K

## Resumen

Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW-Q2_K es una cuantización en formato GGUF (nivel Q2_K) del modelo Mantis2024/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW, publicada por el usuario MishraNepali en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión desde pesos safetensors a GGUF con el objetivo de reducir drásticamente el consumo de memoria: el repo pasa de 18,5 GB en precisión original a 3,81 GB cuantizado.

El modelo base es un modelo de generación de texto sin filtros (uncensored), orientado según sus etiquetas a contenido erótico/NSFW, y con la etiqueta adicional "cybersecurity". El autor de la cuantización lo posiciona para inferencia en CPU con 8 GB de RAM (recomendados 16 GB) e incluso en Google Colab, lo que lo hace accesible en hardware de consumo.

Su relevancia es limitada y muy de nicho: se trata de una cuantización agresiva (Q2_K es de las más bajas de la familia k-quants de llama.cpp), con una pérdida de calidad notable respecto al modelo original. El propio autor advierte que la versión cuantizada puede alucinar con más frecuencia. El repositorio tiene poca tracción: 285 descargas y 0 likes en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (basado en transformer decoder, familia no especificada en la model card) |
| Parámetros totales | 9.241.705.984 (~9,24 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens recomendados por el autor de la cuantización (máximo real no disponible) |
| Tipos de cuantizacion | Q2_K (GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (convertido desde safetensors) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura concreta del modelo base, ni sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO o ajuste fino. Lo único documentado es el trabajo del cuantizador: conversión de safetensors a GGUF y cuantización a Q2_K, que reduce el tamaño de 18,5 GB a 3,81 GB.

La cuantización Q2_K pertenece a la familia de k-quants de llama.cpp, que cuantiza bloques de pesos con escalas de 2 bits por peso aproximadamente. Es el nivel más agresivo de uso habitual y suele provocar degradación perceptible de coherencia, mayor tasa de alucinaciones y pérdida de capacidad de razonamiento respecto a formatos como Q4_K_M o Q5_K_M. El propio autor del repo incluye una advertencia explícita sobre alucinaciones en esta versión.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Generación de contenido sin filtros (uncensored), orientado a escritura erótica/NSFW según el modelo base.
- Etiqueta "cybersecurity" en el repo, aunque no hay documentación que detalle capacidades concretas en ese dominio.
- Ejecución en CPU mediante llama.cpp gracias al formato GGUF.
- No hay información sobre tool calling, capacidades de agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Escritura creativa de ficción adulta en local: el modelo puede generar narrativa erótica sin filtros de alineamiento, ejecutándose íntegramente en CPU con 8 GB de RAM, lo que garantiza privacidad al no enviar datos a servicios externos.
- Pruebas de cuantizaciones extremas: útil como banco de pruebas para evaluar cuánto degrada Q2_K la calidad de un modelo de ~9B respecto a su versión original de 18,5 GB.
- Experimentación en Google Colab: al ocupar solo 3,81 GB, cabe en la GPU gratuita de Colab (T4 con 16 GB de VRAM) para pruebas rápidas sin coste.
- Prototipado de asistentes conversacionales sin restricciones: puede integrarse con backends de llama.cpp para explorar comportamientos de modelos uncensored en entornos controlados.
- Uso en portátiles sin GPU dedicada: el bajo footprint de memoria permite inferencia en equipos de consumo modestos.
- Investigación sobre alucinaciones en modelos cuantizados: el autor advierte explícitamente de mayor tasa de alucinación, lo que lo hace material de estudio sobre los límites de la cuantización a 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- RAM/VRAM estimada para inferencia: ~3,81 GB solo para los pesos; el autor indica que funciona en CPU con 8 GB de RAM, siendo 16 GB lo recomendable (hay margen para el contexto y el KV cache).
- No requiere GPU: está pensado para inferencia en CPU vía llama.cpp.
- Cabe sobradamente en cualquier GPU de consumo moderna (una RTX 3060 de 12 GB o incluso una de 8 GB lo ejecutaría completamente en VRAM, acelerando mucho la latencia respecto a CPU).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No hay soporte directo para vLLM o TGI al ser GGUF.
- Latencia y throughput: no disponibles; en CPU con 8 GB de RAM cabe esperar velocidades modestas típicas de un modelo de ~9B cuantizado (del orden de pocos tokens por segundo en CPUs de escritorio convencionales, cifra no confirmada por el autor).
- Contexto recomendado: 2048 tokens; ventanas mayores aumentan el consumo de memoria del KV cache.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato/cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW-Q2_K | ~9,24 B | GGUF Q2_K | 2048 recomendados | Apache 2.0 | Cuantización muy agresiva, riesgo de alucinación |
| Mantis2024/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW (base) | ~9,24 B | safetensors (~18,5 GB) | no disponible | Apache 2.0 | Pesos originales, mayor fidelidad |
| Modelos uncensored de comunidad de tamaño similar (p. ej. variantes Q4_K_M de ~7-9B) | 7-9 B | GGUF Q4_K_M | variable | variable | Mejor equilibrio calidad/tamaño; Q2_K pierde calidad notablemente |

No hay datos de rendimiento comparativos publicados para este repo.

## Limitaciones y advertencias

- Cuantización Q2_K muy agresiva: degradación significativa de coherencia y calidad de escritura respecto al modelo original de 18,5 GB; el propio autor advierte de alucinaciones.
- Contenido NSFW/para adultos: el repo está marcado como "not-for-all-audiences"; no es apto para menores ni para entornos laborales sin control.
- Sin documentación del modelo base: se desconocen datos de entrenamiento, sesgos heredados, idiomas soportados ni arquitectura exacta, lo que dificulta una evaluación rigurosa.
- Contexto corto recomendado (2048 tokens): limita tareas que requieren documentos largos o conversaciones extensas.
- Etiqueta "cybersecurity" sin justificación documentada: no hay evidencia de capacidades reales en ese dominio; no debe asumirse competencia en seguridad informática.
- Uso ético: al ser un modelo uncensored, puede generar contenido ofensivo, ilegal o dañino si se usa sin salvaguardas; la responsabilidad del uso recae en el usuario.
- Licencia Apache 2.0 permite uso comercial, pero los términos completos remiten a la model card del modelo original.
- Repositorio de baja adopción (285 descargas, 0 likes), sin comunidad de soporte ni validación externa.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/MishraNepali/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW-Q2_K
- Modelo base original: https://huggingface.co/Mantis2024/Dirty-Muse-Writer-v01-Uncensored-Erotica-NSFW
- No hay paper, blog, repositorio de código ni demo adicionales en la información disponible.
