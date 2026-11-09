# alivecat/plamo-3-translate-0.8b-MNN

## Resumen

PLaMo 3 Translate 0.8B - MNN W4/E8 es una conversión comunitaria del modelo de traducción `pfnet/plamo-3-translate-0.8b` de Preferred Networks, publicada por el usuario alivecat. El modelo original es un transformer de 0,8 mil millones de parámetros especializado en traducción entre inglés y japonés, y esta variante lo reempaqueta en el formato MNN para su despliegue en dispositivos con recursos limitados, incluyendo CPU en Android arm64 y Windows x64. No se trata de un lanzamiento oficial de Preferred Networks, sino de una conversión de cuantización sin entrenamiento adicional.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de traducción especializado en hardware de consumo, sin GPU dedicada. La conversión aplica cuantización de 4 bits en los pesos lineales (HQQ, group size 64) y mantiene las embeddings y la proyección de salida en 8 bits externos, lo que reduce el paquete a unos 602 MB distribuidos en siete ficheros. El contexto configurado es de 32.768 tokens, aunque el autor advierte explícitamente que no se ha validado la inferencia a longitud completa.

El modelo está pensado para traducción EN→JA (y presumiblemente JA→EN, aunque solo el primer par está validado por el ejemplo incluido). Su licencia PLaMo Community License impone condiciones de atribución y registro/ingresos para uso comercial, lo que condiciona su adopción en producción. Es, por tanto, una opción interesante para prototipado, aplicaciones móviles o entornos edge donde el tamaño y el consumo energético priman sobre la compatibilidad de ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base PLaMo 3 Translate 0.8B); grafo MNN con máscara causal flotante de dos planos y atención sliding-window (ventana 2048) |
| Parametros totales | 0,8 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens configurados (no validado a longitud completa) |
| Tipos de cuantizacion | Pesos lineales 4 bits (group size 64, HQQ); embeddings y proyección de salida en int8 externo (W4/E8) |
| Idiomas soportados | Inglés (en) y japonés (ja) |
| Licencia | PLaMo Community License (other) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_int8.bin`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 0,8 mil millones de parámetros desarrollado por Preferred Networks y especializado en traducción. La conversión MNN preserva la arquitectura original pero reemplaza el grafo de ejecución por uno compatible con el runtime MNN 3.6.2, que implementa una máscara de atención en coma flotante con dos planos: primero atención causal completa y después atención causal con ventana deslizante de 2048 tokens. Las embeddings y la proyección de salida se mantienen en un fichero int8 externo y comparten pesos (tied embeddings), lo que contribuye a la compactación del paquete.

No se dispone de información detallada sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO) en la documentación proporcionada. La conversión se realizó a partir de los safetensors en BF16 de la revisión `cc8e881` sin entrenamiento adicional, por lo que las capacidades del modelo son las del original, moduladas por la pérdida de precisión de la cuantización. El autor advierte que las puntuaciones de benchmark del BF16/GGUF oficial no garantizan la precisión de esta conversión.

## Capacidades

- Traducción automática entre inglés y japonés (EN→JA validado; otros pares no verificados por el ejemplo incluido).
- Soporte de prompt de traducción específico PFML3, en lugar de una plantilla de chat genérica.
- Aceptación de contexto de origen opcional, glosario y forma japonesa (según el ejemplo C++ de referencia).
- Codificación de entrada mediante el tokenizador original PLaMo (`tokenizer.jsonl`); `tokenizer.txt` es solo tabla de decodificación y parada, no codificador.
- Inferencia en CPU con decodificación greedy y opciones de memoria baja.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción EN→JA en aplicaciones Android: el paquete de 602 MB y el runtime MNN permiten integrar traducción local en apps móviles arm64 sin conexión, con latencia aceptable en CPU de 4 hilos.
- Traducción en escritorio Windows x64: útil para herramientas de documentación o correo que requieran procesamiento local de textos EN→JA sin enviar datos a la nube, validado en esta plataforma por el autor.
- Prototipado de pipelines de traducción en edge: sirve para evaluar la calidad del modelo PLaMo 3 Translate antes de invertir en el BF16 o GGUF oficial, con un coste de almacenamiento mínimo.
- Traducción con glosario y contexto de origen: el ejemplo de referencia admite contexto y glosario, lo que permite adaptar terminología en dominios técnicos o corporativos concretos.
- Sistemas de traducción embebidos en dispositivos con poca RAM: la cuantización W4/E8 y la opción de memoria baja facilitan su ejecución en entornos con restricciones de memoria.
- Evaluación comparativa de cuantizaciones: útil para investigadores que quieran medir la degradación de calidad de una conversión MNN W4/E8 frente al BF16 original en tareas de traducción EN-JA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las puntuaciones oficiales del modelo BF16/GGUF no establecen la precisión de esta conversión, y que la validación se limita a comprobar que la inferencia EN→JA funciona en Android arm64 y Windows x64 CPU con decodificación greedy.

## Requisitos de hardware

- VRAM estimada: no aplica para GPU; el modelo está diseñado para CPU. El paquete ocupa 602,47 MB en disco.
- GPU recomendadas: no disponible; la conversión está validada en CPU (Android arm64 y Windows x64), no en GPU.
- ¿Cabe en GPU de consumo? No se documenta soporte GPU para este grafo MNN concreto.
- Opciones de despliegue: runtime MNN 3.6.2 con cabeceras y librerías compatibles; no se incluyen binarios de runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Configuración validada: CPU, 4 hilos, precisión normal, memoria baja, decodificación greedy, `dynamic_option=2`.
- Requisito crítico: el motor MNN debe implementar el contrato del grafo (máscara flotante de dos planos con ventana 2048 y embeddings int8 externos atados); un cliente MNN estándar no se asume compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| alivecat/plamo-3-translate-0.8b-MNN (esta ficha) | 0,8B | 32.768 (no validado) | en, ja | PLaMo Community License | MNN W4/E8 | Hugging Face, 0 descargas |
| pfnet/plamo-3-translate-0.8b (base) | 0,8B | no disponible | en, ja | PLaMo Community License | safetensors BF16 | Hugging Face (oficial) |
| Alternativas de traducción EN-JA de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha validado la inferencia EN→JA; otros pares de idiomas no están verificados por el ejemplo incluido.
- El límite de 32.768 tokens es una configuración, no una garantía de validación a longitud completa.
- La cuantización W4/E8 puede degradar la calidad respecto al BF16 original; no hay métricas publicadas que cuantifiquen esa pérdida.
- Requiere un runtime MNN que implemente el contrato específico del grafo; un cliente MNN estándar puede no ser compatible.
- No se incluyen binarios de runtime; es necesario compilar o enlazar cabeceras y librerías MNN 3.6.2 compatibles.
- La licencia PLaMo Community License impone condiciones de redistribución, atribución y uso comercial, incluyendo requisitos de registro e ingresos; es responsabilidad del usuario revisarla antes de producción.
- Es una conversión comunitaria no oficial; no cuenta con el respaldo de Preferred Networks.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alivecat/plamo-3-translate-0.8b-MNN
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Revisión del modelo base usada en la conversión: https://huggingface.co/pfnet/plamo-3-translate-0.8b/tree/cc8e88169807d5a272e8ff06db12eb0129b67f81
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Ejemplo de referencia C++ (incluido en el repo): examples/README.md
- README en chino: README_ZH.md (dentro del repositorio)
